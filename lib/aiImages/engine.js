/* ─────────────────────────────────────────────────────────────────────
   IMAGE GENERATION ENGINE — background processor.
   Runs in-process (this app is a local single-user Next server). The
   generate API responds immediately with a queued job; this engine
   picks it up asynchronously so the browser never waits. Jobs persist
   in db.json and are the source of truth (survive refresh/navigation).
   ───────────────────────────────────────────────────────────────────── */
import fs from "node:fs";
import path from "node:path";
import {
  updateJob,
  todayGenerationCount,
  claimNextQueued,
  addAsset,
  uploadsDir,
  recordUsage,
  requeueStaleJobs,
} from "@/lib/aiImages/store";
import { buildImageProvider } from "@/lib/aiImages/provider";
import { getInternalImageConfig } from "@/lib/aiImages/config";

let running = false;
let polling = false;

export function sleeping(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function saveBufferToDisk(buffer, mimeType, jobId, index) {
  const ext = mimeType === "image/jpeg" || mimeType === "image/jpg" ? "jpg" : mimeType === "image/webp" ? "webp" : "png";
  const fileName = `${jobId}_${index}.${ext}`;
  const folder = path.join(uploadsDir(), "jobs");
  if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });
  const filePath = path.join(folder, fileName);
  fs.writeFileSync(filePath, buffer);
  return { storageKey: `jobs/${fileName}`, url: `/api/ai/images/asset/${jobId}_${index}` };
}

/** Process a single job. Assumes job status is queued/retrying/processing. */
export async function processOneJob(job) {
  const started = Date.now();
  try {
    const cfg = getInternalImageConfig();
    updateJob(job.id, { status: "processing", startedAt: started, errorMessage: "", errorCode: "" });

    const provider = buildImageProvider(job.provider, { model: job.model });
    const images = await provider.generateImage({
      prompt: job.prompt,
      negativePrompt: job.negativePrompt,
      aspectRatio: job.aspectRatio,
      numberOfImages: job.numberOfImages,
      referenceImages: job.referenceImages,
      progress: (p) => updateJob(job.id, { progress: Math.min(95, Math.round(p)) }),
    });

    const assets = [];
    for (let i = 0; i < images.length; i++) {
      const { storageKey, url } = saveBufferToDisk(images[i].buffer, images[i].mimeType, job.id, i);
      const asset = addAsset({ jobId: job.id, storageKey, url, mimeType: images[i].mimeType });
      assets.push(asset);
    }
    updateJob(job.id, { status: "completed", progress: 100, completedAt: Date.now(), resultAssets: assets.map((a) => a.id) });
    recordUsage({ jobId: job.id, provider: job.provider, model: job.model, status: "completed", estimatedCost: estimateCost(cfg, images.length) });
    return { ok: true, assetCount: assets.length };
  } catch (err) {
    const temporary = !!err.temporary;
    const attempt = (job.attempt || 0) + 1;
    const maxAttempts = job.maxAttempts || 3;

    if (temporary && attempt < maxAttempts) {
      const backoff = (job.backoffBase || 2000) * Math.pow(2, attempt - 1);
      updateJob(job.id, {
        status: "retrying",
        attempt,
        errorMessage: err.message,
        errorCode: err.code || "temporary",
        progress: 0,
      });
      recordUsage({ jobId: job.id, provider: job.provider, model: job.model, status: "retrying", estimatedCost: 0 });
      // Schedule the retry.
      setTimeout(() => runLoop(), Math.min(backoff, 60000));
      return { ok: false, retrying: true, attempt, backoff };
    }

    updateJob(job.id, {
      status: "failed",
      attempt,
      errorMessage: friendly(err.message || "Generation failed."),
      errorCode: (temporary ? "temporary" : err.code || "provider_error") + (attempt >= maxAttempts ? "_exhausted" : ""),
      completedAt: Date.now(),
      progress: 0,
    });
    recordUsage({ jobId: job.id, provider: job.provider, model: job.model, status: "failed", estimatedCost: estimateCost(getInternalImageConfig(), 0) });
    return { ok: false, failed: true };
  }
}

function friendly(msg) {
  return String(msg || "The image generation request failed.").slice(0, 300);
}

function estimateCost(cfg, n) {
  // Rough estimate only when provider exposes per-image cost; otherwise 0.
  return 0;
}

/** Process up to maxConcurrent queued/retrying jobs now. */
export async function runLoop() {
  if (polling) return;
  polling = true;
  try {
    const cfg = getInternalImageConfig();
    if (!cfg.enabled) return;
    requeueStaleJobs();
    if (todayGenerationCount() >= cfg.dailyGenerationLimit) return;
    const concurrency = Math.max(1, cfg.maxConcurrentJobs || 3);
    let processed = 0;
    while (processed < concurrency) {
      const job = claimNextQueued();
      if (!job) break;
      processed++;
      processOneJob(job).catch(() => {});
    }
  } finally {
    polling = false;
  }
}

/** Called by the generate API to kick off the worker immediately. */
export function kick() {
  if (running) return;
  running = true;
  runLoop()
    .catch(() => {})
    .finally(() => {
      running = false;
    });
}
