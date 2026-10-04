/* ─────────────────────────────────────────────────────────────────────
   DATA LAYER — local single-user JSON store (SQLite-style entities)
   Purely server-side. Never imported by client bundles.
   ───────────────────────────────────────────────────────────────────── */
import fs from "node:fs";
import path from "node:path";
import { randomUUID, randomBytes } from "node:crypto";

const ROOT = process.cwd();
const DATA_DIR = path.join(ROOT, "data");
const DB_FILE = path.join(DATA_DIR, "db.json");

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function emptyDb() {
  return {
    projects: [], // { id, name, created, updated, status }
    products: {}, // { [projectId]: product }
    sections: {}, // { [projectId]: { [num]: sectionResult } }
favorites: {}, // { [projectId]: [favorite] }
  reports: {}, // { [projectId]: { content, generatedAt, model, cost } }
  settings: {
      language: "darja",
      autoRunNext: false,
      liveWebResearch: false,
    },
  };
}

let cache = null;
export function loadDb() {
  ensureDir();
  if (cache) return cache;
  if (!fs.existsSync(DB_FILE)) {
    cache = emptyDb();
    fs.writeFileSync(DB_FILE, JSON.stringify(cache, null, 2));
    return cache;
  }
  try {
    cache = JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
  } catch {
    cache = emptyDb();
  }
  // migrations / defaults
  cache.settings = { ...emptyDb().settings, ...(cache.settings || {}) };
  cache.products = cache.products || {};
  cache.sections = cache.sections || {};
  cache.favorites = cache.favorites || {};
  return cache;
}

export function saveDb() {
  ensureDir();
  if (cache) fs.writeFileSync(DB_FILE, JSON.stringify(cache, null, 2));
}

export function uid(prefix = "") {
  return (prefix ? prefix + "_" : "") + randomBytes(12).toString("hex");
}

/* ── Projects ─────────────────────────────────────────────────────── */
const ACTIVE_SECTIONS = [...Array(18).keys()].slice(1); // 1..17

export function projectList() {
  const db = loadDb();
  return db.projects
    .map((p) => {
      const sections = db.sections[p.id] || {};
      const done = Object.values(sections).filter((s) => s.status === "completed").length;
      const skipped = Object.values(sections).filter((s) => s.status === "skipped").length;
      const progress = Math.round(((done + skipped) / 17) * 100);
      return {
        ...p,
        productName: db.products[p.id]?.name || "",
        productImage: (db.products[p.id]?.images || [])[0] || null,
        sectionsDone: done,
        sectionsSkipped: skipped,
        progress,
      };

    })
    .sort((a, b) => b.updated - a.updated);
}

export function getProject(id) {
  const db = loadDb();
  return db.projects.find((p) => p.id === id) || null;
}

export function createProject({ name }) {
  const db = loadDb();
  const id = uid("proj");
  const now = Date.now();
  const base = (name && name.trim()) || "Untitled Project";
  const sameName = db.projects.filter((p) => p.name === base).length;
  const project = { id, name: sameName > 0 ? `${base} ${sameName + 1}` : base, created: now, updated: now, status: "draft" };
  db.projects.push(project);
  db.products[id] = defaultProduct();
  db.sections[id] = {};
  db.favorites[id] = [];
  saveDb();
  return project;
}

export function duplicateProject(id) {
  const db = loadDb();
  const src = db.projects.find((p) => p.id === id);
  if (!src) return null;
  const now = Date.now();
  const nid = uid("proj");
  const copy = { id: nid, name: src.name + " (Copy)", created: now, updated: now, status: "draft" };
  db.projects.push(copy);
  db.products[nid] = { ...defaultProduct(), ...(db.products[id] || {}) };
  db.sections[nid] = {};
  db.favorites[nid] = [];
  // copy completed section results + favorites
  const srcS = db.sections[id] || {};
  for (const [num, sec] of Object.entries(srcS)) {
    if (sec.status === "completed" && sec.result) {
      db.sections[nid][num] = {
        ...sec,
        updatedAt: now,
        cost: null, // don't double-charge
        rawResponse: null,
        sources: sec.sources || [],
      };
    }
  }
  db.favorites[nid] = (db.favorites[id] || []).map((f) => ({ ...f, id: uid("fav") }));
  saveDb();
  return copy;
}

export function deleteProject(id) {
  const db = loadDb();
  db.projects = db.projects.filter((p) => p.id !== id);
  delete db.products[id];
  delete db.sections[id];
  delete db.favorites[id];
  delete db.reports[id];
  saveDb();
}

export function defaultProduct() {
  return {
    name: "",
    category: "",
    description: "",
    url: "",
    images: [], // data-URLs, downscaled client-side
    price: "",
    currency: "USD",
    targetCountry: "",
    targetMarket: "",
    targetAudience: "",
    productType: "",
    deliveryMethod: "",
    usp: "",
    features: [],
    benefits: [],
    brandName: "",
    existingWebsite: "",
    competitorUrls: [],
    additionalInstructions: "",
  };
}

export function saveProduct(projectId, product) {
  const db = loadDb();
  const merged = { ...defaultProduct(), ...product };
  merged.features = Array.isArray(merged.features) ? merged.features : [];
  merged.benefits = Array.isArray(merged.benefits) ? merged.benefits : [];
  merged.images = Array.isArray(merged.images) ? merged.images.slice(0, 12) : [];
  merged.competitorUrls = Array.isArray(merged.competitorUrls) ? merged.competitorUrls : [];
  db.products[projectId] = merged;
  touch(projectId);
  saveDb();
  return merged;
}

export function getProduct(projectId) {
  const db = loadDb();
  return db.products[projectId] || defaultProduct();
}

function touch(projectId) {
  const db = loadDb();
  const p = db.projects.find((x) => x.id === projectId);
  if (p) p.updated = Date.now();
}

/* ── Sections ─────────────────────────────────────────────────────── */
export const TOTAL_SECTIONS = 17;

export function defaultSection() {
  return {
    status: "not_started", // not_started | in_progress | completed | skipped | error
    result: "", // raw edited/approved text
    parsed: null,
    format: "text", // text | json
    rawResponse: null,
    model: "",
    sources: [],
    cost: null,
    validation: null,
    customInstructions: "",
    regenerations: 0,
    qualityScore: null,
    updatedAt: 0,
    error: "",
  };
}

export function getSection(projectId, num) {
  const db = loadDb();
  return db.sections[projectId]?.[num] || defaultSection();
}

export function getAllSections(projectId) {
  const db = loadDb();
  const s = db.sections[projectId] || {};
  const out = {};
  for (const n of ACTIVE_SECTIONS) {
    out[n] = s[n] || defaultSection();
  }
  return out;
}

export function saveSection(projectId, num, patch) {
  const db = loadDb();
  db.sections[projectId] = db.sections[projectId] || {};
  const current = db.sections[projectId][num] || defaultSection();
  db.sections[projectId][num] = { ...current, ...patch, updatedAt: Date.now() };
  touch(projectId);
  saveDb();
  return db.sections[projectId][num];
}

export function resetSection(projectId, num) {
  return saveSection(projectId, num, defaultSection());
}

export function recomputeProjectStatus(projectId) {
  const db = loadDb();
  const p = db.projects.find((x) => x.id === projectId);
  if (!p) return;
  const sections = getAllSections(projectId);
  const vals = Object.values(sections);
  const done = vals.filter((s) => s.status === "completed").length;
  const skipped = vals.filter((s) => s.status === "skipped").length;
  p.updated = Date.now();
  p.status = done >= 17 ? "complete" : done === 0 && skipped === 0 ? "draft" : "in_progress";
  saveDb();
}

/* ── Favorites ────────────────────────────────────────────────────── */
export function getFavorites(projectId) {
  const db = loadDb();
  return db.favorites[projectId] || [];
}

export function addFavorite(projectId, fav) {
  const db = loadDb();
  db.favorites[projectId] = db.favorites[projectId] || [];
  const item = {
    id: uid("fav"),
    sectionId: fav.sectionId || 0,
    sectionTitle: fav.sectionTitle || "",
    label: fav.label || "",
    content: fav.content || "",
    type: fav.type || "text",
    createdAt: Date.now(),
  };
  db.favorites[projectId].push(item);
  saveDb();
  return item;
}

export function removeFavorite(projectId, favId) {
  const db = loadDb();
  db.favorites[projectId] = (db.favorites[projectId] || []).filter((f) => f.id !== favId);
  saveDb();
}

/* ── Global app settings (language, toggles) ──────────────────────── */
export function getSettings() {
  return loadDb().settings;
}

export function saveSettings(patch) {
  const db = loadDb();
  db.settings = { ...db.settings, ...patch };
  saveDb();
  return db.settings;
}

/* ── Final report storage ─────────────────────────────────────────── */
export function getReport(projectId) {
  const db = loadDb();
  return db.reports[projectId] || null;
}

export function saveReport(projectId, patch) {
  const db = loadDb();
  db.reports[projectId] = { ...(db.reports[projectId] || {}), ...patch, updatedAt: Date.now() };
  saveDb();
  return db.reports[projectId];
}

/* ── Cost rollups ─────────────────────────────────────────────────── */
export function projectCosts(projectId) {
  const db = loadDb();
  const sections = db.sections[projectId] || {};
  let input = 0;
  let output = 0;
  let cost = 0;
  let calls = 0;
  const perSection = {};
  for (const [num, s] of Object.entries(sections)) {
    if (!s.cost) continue;
    const c = s.cost;
    perSection[num] = c;
    input += c.inputTokens || 0;
    output += c.outputTokens || 0;
    cost += c.usd || 0;
    calls++;
  }
  return { inputTokens: input, outputTokens: output, usd: cost, calls, perSection };
}