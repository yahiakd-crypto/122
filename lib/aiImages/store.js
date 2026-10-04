/* ─────────────────────────────────────────────────────────────────────
   IMAGE GENERATION JOBS STORE — persistent local store (single-user).
   Jobs are the source of truth. Mirrors lib/db.js patterns and persists
   in the same data/db.json document under "imageJobs"/"imageAssets".
   Purely server-side.
   ───────────────────────────────────────────────────────────────────── */
import fs from "node:fs";
import path from "node:path";
import { randomBytes, randomUUID } from "node:crypto";
import { loadDb, saveDb } from "@/lib/db";

const ROOT = process.cwd();
const UPLOADS_DIR = path.join(ROOT, "data", "uploads");

export function ensureUploadsDir() {
  if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  return UPLOADS_DIR;
}

export function uploadsDir() {
  ensureUploadsDir();
  return UPLOADS_DIR;
}

function withJobs(fn) {
  const db = loadDb();
  db.imageJobs = db.imageJobs || [];
  db.imageAssets = db.imageAssets || [];
  db.imageUsage = db.imageUsage || [];
  return fn(db);
}

export function uid(prefix = "") {
  return (prefix ? prefix + "_" : "") + randomBytes(12).toString("hex");
}

/* ── Jobs ──────────────────────────────────────────────────────────── */
export const JOB_STATUSES = ["queued", "processing", "completed", "failed", "cancelled", "retrying"];

export function createJob({ provider, model, prompt, negativePrompt, aspectRatio, numberOfImages, referenceImages, sourceType = "manual", sourceId = null, sourceLabel = "" }) {
  return withJobs((db) => {
    const now = Date.now();
    const job = {
      id: uid("img"),
      status: "queued",
      progress: 0,
      provider,
      model,
      type: "image",
      prompt,
      negativePrompt: negativePrompt || "",
      aspectRatio: aspectRatio || "1:1",
      numberOfImages: Math.max(1, parseInt(numberOfImages, 10) || 1),
      referenceImages: referenceImages || [],
      sourceType,
      sourceId,
      sourceLabel,
      providerJobId: null,
      resultAssets: [],
      errorMessage: "",
      errorCode: "",
      attempt: 0,
      maxAttempts: 3,
      backoffBase: 2000,
      estimatedCost: null,
      createdAt: now,
      startedAt: null,
      completedAt: null,
    };
    db.imageJobs.push(job);
    saveDb();
    return job;
  });
}

export function getJob(id) {
  return withJobs((db) => db.imageJobs.find((j) => j.id === id) || null);
}

export function updateJob(id, patch) {
  return withJobs((db) => {
    const job = db.imageJobs.find((j) => j.id === id);
    if (!job) return null;
    Object.assign(job, patch);
    saveDb();
    return job;
  });
}

export function listJobs({ status, provider, search, limit = 200 } = {}) {
  return withJobs((db) => {
    let jobs = [...db.imageJobs];
    if (status) jobs = jobs.filter((j) => j.status === status);
    if (provider) jobs = jobs.filter((j) => j.provider === provider);
    if (search) {
      const q = search.toLowerCase();
      jobs = jobs.filter((j) => (j.prompt || "").toLowerCase().includes(q) || (j.sourceLabel || "").toLowerCase().includes(q));
    }
    jobs.sort((a, b) => b.createdAt - a.createdAt);
    return jobs.slice(0, limit);
  });
}

export function removeJob(id) {
  const job = getJob(id);
  withJobs((db) => {
    db.imageJobs = db.imageJobs.filter((j) => j.id !== id);
    db.imageUsage = db.imageUsage.filter((u) => u.jobId !== id);
    // Remove associated assets too.
    db.imageAssets = db.imageAssets.filter((a) => a.jobId !== id);
    saveDb();
  });
  if (job?.resultAssets?.length) {
    for (const a of job.resultAssets) {
      try {
        if (a.storageKey && a.storageKey.startsWith("jobs/")) {
          const file = path.join(uploadsDir(), a.storageKey.replace(/^jobs\//, ""));
          if (fs.existsSync(file)) fs.unlinkSync(file);
        }
      } catch {}
    }
  }
  return job;
}

/* ── Jobs held for retry (auto-retry bookkeeping) ─────────────────── */
export function findRetryableJobs() {
  return withJobs((db) =>
    db.imageJobs.filter((j) => j.status === "failed" && j.errorCode === "temporary" && j.attempt < j.maxAttempts)
  );
}

export function countActiveJobs() {
  return withJobs((db) =>
    db.imageJobs.filter((j) => j.status === "queued" || j.status === "processing" || j.status === "retrying").length
  );
}

export function todayGenerationCount() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const t0 = start.getTime();
  return withJobs((db) => db.imageJobs.filter((j) => j.createdAt >= t0 && !["cancelled"].includes(j.status)).length);
}

/* ── Assets ────────────────────────────────────────────────────────── */
export function addAsset({ jobId, storageKey, url, mimeType, width, height }) {
  return withJobs((db) => {
    const asset = {
      id: uid("ast"),
      jobId,
      storageKey,
      url,
      mimeType: mimeType || "image/png",
      width: width || null,
      height: height || null,
      createdAt: Date.now(),
    };
    db.imageAssets.push(asset);
    saveDb();
    return asset;
  });
}

export function getAsset(id) {
  return withJobs((db) => db.imageAssets.find((a) => a.id === id) || null);
}

export function listAssets({ jobId } = {}) {
  return withJobs((db) => {
    let list = [...db.imageAssets];
    if (jobId) list = list.filter((a) => a.jobId === jobId);
    list.sort((a, b) => a.createdAt - b.createdAt);
    return list;
  });
}

/* ── Usage / cost ──────────────────────────────────────────────────── */
export function recordUsage({ jobId, provider, model, status, estimatedCost }) {
  return withJobs((db) => {
    db.imageUsage.push({
      id: uid("use"),
      jobId,
      provider,
      model,
      status,
      estimatedCost: estimatedCost != null ? estimatedCost : 0,
      createdAt: Date.now(),
    });
    saveDb();
  });
}

export function usageSummary() {
  return withJobs((db) => {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const t0 = startOfDay.getTime();
    const tM = monthStart.getTime();
    const jobs = db.imageJobs;
    const day = jobs.filter((j) => j.createdAt >= t0 && j.status !== "cancelled").length;
    const month = jobs.filter((j) => j.createdAt >= tM && j.status !== "cancelled").length;
    const successful = jobs.filter((j) => j.status === "completed").length;
    const failed = jobs.filter((j) => j.status === "failed").length;
    let estCost = 0;
    for (const j of jobs) estCost += j.estimatedCost || 0;
    return { today: day, month, successful, failed, estCost };
  });
}

/** Reusable lock primitive for the background worker to take a queued job. */
export function claimNextQueued() {
  return withJobs((db) => {
    const idx = db.imageJobs.findIndex((j) => j.status === "queued" || j.status === "retrying");
    if (idx === -1) return null;
    const job = db.imageJobs[idx];
    job.status = "processing";
    job.startedAt = job.startedAt || Date.now();
    saveDb();
    return job;
  });
}

/** Requeue jobs stuck in 'processing' for too long (e.g. after a server restart). */
export function requeueStaleJobs(maxAgeMs = 15 * 60 * 1000) {
  return withJobs((db) => {
    const cutoff = Date.now() - maxAgeMs;
    let count = 0;
    for (const j of db.imageJobs) {
      if (j.status === "processing" && (j.startedAt || j.createdAt) < cutoff) {
        j.status = "queued";
        j.progress = 0;
        count++;
      }
    }
    if (count) saveDb();
    return count;
  });
}

export function toPublicJob(job) {
  if (!job) return null;
  const { referenceImages, negativePrompt, ...rest } = job;
  return {
    ...rest,
    resultAssets: (job.resultAssets || []).map((a) =>
      typeof a === "string" ? { id: a, url: `/api/ai/images/asset/${a}` } : { ...a, url: a.url || `/api/ai/images/asset/${a.id}` }
    ),
  };
}
