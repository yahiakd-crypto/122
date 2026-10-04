/* ─────────────────────────────────────────────────────────────────────
   AI CONFIGURATION STORE — server-side, encrypted at rest.
   API keys are NEVER shipped to the browser. The frontend only ever
   sends a masked/boolean "has key" flag.
   Supports multiple providers, each with its own saved model / base URL
   / encrypted key. One provider is "active" and drives the workflow.
   ───────────────────────────────────────────────────────────────────── */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const DATA_DIR = path.join(process.cwd(), "data");
const KEY_DIR = path.join(DATA_DIR, "keys");
const CONFIG_FILE = path.join(KEY_DIR, "ai-config.json");
const SECRET_FILE = path.join(KEY_DIR, ".app-key");

function ensureDir() {
  if (!fs.existsSync(KEY_DIR)) fs.mkdirSync(KEY_DIR, { recursive: true });
}

function getOrCreateSecret() {
  ensureDir();
  if (fs.existsSync(SECRET_FILE)) {
    return fs.readFileSync(SECRET_FILE, "utf8");
  }
  const secret = crypto.randomBytes(32).toString("hex");
  fs.writeFileSync(SECRET_FILE, secret, { mode: 0o600 });
  return secret;
}

function encrypt(plain) {
  if (!plain) return "";
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", crypto.createHash("sha256").update(getOrCreateSecret()).digest(), iv);
  const enc = Buffer.concat([cipher.update(String(plain), "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return "v1:" + iv.toString("base64") + ":" + tag.toString("base64") + ":" + enc.toString("base64");
}

function decrypt(stored) {
  if (!stored) return "";
  try {
    const [v, ivB, tagB, dataB] = String(stored).split(":");
    if (v !== "v1") return "";
    const decipher = crypto.createDecipheriv("aes-256-gcm", crypto.createHash("sha256").update(getOrCreateSecret()).digest(), Buffer.from(ivB, "base64"));
    decipher.setAuthTag(Buffer.from(tagB, "base64"));
    return Buffer.concat([decipher.update(Buffer.from(dataB, "base64")), decipher.final()]).toString("utf8");
  } catch {
    return "";
  }
}

export const PROVIDER_DEFAULTS = {
  openai: {
    baseUrl: "https://api.openai.com/v1",
    models: ["gpt-4o", "gpt-4o-mini", "gpt-4.1", "gpt-4.1-mini", "o3-mini", "o4-mini"],
    envVar: "OPENAI_API_KEY",
  },
  anthropic: {
    baseUrl: "https://api.anthropic.com/v1",
    models: ["claude-3-7-sonnet-latest", "claude-3-5-sonnet-latest", "claude-3-5-haiku-latest", "claude-3-opus-latest"],
    envVar: "ANTHROPIC_API_KEY",
  },
  gemini: {
    baseUrl: "https://generativelanguage.googleapis.com",
    models: ["gemini-2.5-pro", "gemini-2.5-flash", "gemini-1.5-pro", "gemini-1.5-flash"],
    envVar: "GEMINI_API_KEY",
  },
  openrouter: {
    baseUrl: "https://openrouter.ai/api/v1",
    models: ["google/gemini-2.5-pro", "google/gemini-2.5-flash", "anthropic/claude-3.7-sonnet", "openai/gpt-4o", "openai/gpt-4o-mini", "meta-llama/llama-3.3-70b-instruct", "deepseek/deepseek-chat", "mistralai/mistral-large"],
    envVar: "OPENROUTER_API_KEY",
  },
  nvidia: {
    baseUrl: "https://integrate.api.nvidia.com/v1",
    models: ["meta/llama-3.3-70b-instruct", "deepseek-ai/deepseek-r1", "mistralai/mistral-large-2-instruct", "qwen/qwen2.5-72b-instruct"],
    envVar: "NVIDIA_API_KEY",
  },
  deepseek: {
    baseUrl: "https://api.deepseek.com",
    models: ["deepseek-chat", "deepseek-reasoner"],
    envVar: "DEEPSEEK_API_KEY",
  },
  custom: {
    baseUrl: "",
    models: ["custom"],
    envVar: "",
  },
};

export const PROVIDER_NAMES = {
  openai: "OpenAI",
  anthropic: "Anthropic",
  gemini: "Google Gemini",
  openrouter: "OpenRouter",
  nvidia: "NVIDIA",
  deepseek: "DeepSeek",
  custom: "Custom API",
};

// Global (shared) generation parameters — defaults for every provider.
export const GLOBAL_DEFAULT = {
  temperature: 0.7,
  maxTokens: 12000,
  topP: 0.95,
  systemPrompt: "",
  timeout: 120,
  retryCount: 2,
  modelScope: "same", // same | per_section
};

function emptyProvider(provider) {
  const def = PROVIDER_DEFAULTS[provider] || { baseUrl: "", models: [] };
  return {
    model: def.models?.[0] || "",
    baseUrl: def.baseUrl || "",
    apiKey: "", // encrypted at rest
    perSectionModels: {},
  };
}

function defaultStore() {
  const providers = {};
  for (const key of Object.keys(PROVIDER_DEFAULTS)) providers[key] = emptyProvider(key);
  return {
    activeProvider: "openrouter",
    ...GLOBAL_DEFAULT,
    providers,
    lastTested: 0,
    lastTestResult: "",
  };
}

function readFileSafe() {
  ensureDir();
  if (!fs.existsSync(CONFIG_FILE)) return null;
  try {
    return JSON.parse(fs.readFileSync(CONFIG_FILE, "utf8"));
  } catch {
    return null;
  }
}

/** Migrate the old single-config shape into the new multi-provider shape. */
function migrate(raw) {
  if (!raw) return defaultStore();
  const store = defaultStore();

  // Old format had top-level provider/model/apiKey/baseUrl and NO providers map.
  const isOld = raw.providers === undefined && raw.provider !== undefined;

  if (isOld) {
    const keyParts = ["apiKey", "model", "baseUrl", "perSectionModels"];
    for (const k of Object.keys(GLOBAL_DEFAULT)) if (raw[k] !== undefined) store[k] = raw[k];
    if (raw.lastTested !== undefined) store.lastTested = raw.lastTested;
    if (raw.lastTestResult !== undefined) store.lastTestResult = raw.lastTestResult;
    const p = (PROVIDER_DEFAULTS[raw.provider] ? raw.provider : "openrouter");
    store.activeProvider = p;
    store.providers[p] = { ...emptyProvider(p), ...pick(raw, keyParts) };
    return store;
  }

  // New format — merge partials on top of defaults.
  for (const k of Object.keys(GLOBAL_DEFAULT)) if (raw[k] !== undefined) store[k] = raw[k];
  if (raw.activeProvider !== undefined && PROVIDER_DEFAULTS[raw.activeProvider]) store.activeProvider = raw.activeProvider;
  if (raw.lastTested !== undefined) store.lastTested = raw.lastTested;
  if (raw.lastTestResult !== undefined) store.lastTestResult = raw.lastTestResult;
  if (raw.providers && typeof raw.providers === "object") {
    for (const key of Object.keys(PROVIDER_DEFAULTS)) {
      const entry = raw.providers[key];
      if (entry && typeof entry === "object") {
        store.providers[key] = { ...emptyProvider(key), ...entry };
      }
    }
  }
  return store;
}

function pick(obj, keys) {
  const out = {};
  for (const k of keys) if (obj[k] !== undefined) out[k] = obj[k];
  return out;
}

/** Read + normalize the full store (internal). */
function getStore() {
  return migrate(readFileSafe());
}

function writeStore(store) {
  ensureDir();
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(store, null, 2), { mode: 0o600 });
}

/**
 * Return the effective config for the ACTIVE provider in the legacy
 * flattened shape ({ provider, model, baseUrl, apiKey, perSectionModels,
 * temperature, maxTokens, ... }). Existing consumers rely on this shape.
 * `apiKey` here is the stored (encrypted) value — internal only.
 */
export function getInternalConfig() {
  const store = getStore();
  const provider = store.activeProvider;
  const entry = store.providers[provider] || emptyProvider(provider);
  return {
    provider,
    apiKey: entry.apiKey, // encrypted
    model: entry.model,
    baseUrl: entry.baseUrl,
    perSectionModels: entry.perSectionModels || {},
    temperature: store.temperature,
    maxTokens: store.maxTokens,
    topP: store.topP,
    systemPrompt: store.systemPrompt,
    timeout: store.timeout,
    retryCount: store.retryCount,
    modelScope: store.modelScope,
    lastTested: store.lastTested,
    lastTestResult: store.lastTestResult,
  };
}

/** Public shape — NEVER includes any api key. */
export function getPublicConfig() {
  const store = getStore();
  const cfg = getInternalConfig();
  const { apiKey, ...rest } = cfg;
  const { perSectionModels = {} } = rest;

  const models = { same: rest.model };
  for (const [n, m] of Object.entries(perSectionModels)) models[n] = m;

  const providers = {};
  for (const key of Object.keys(PROVIDER_DEFAULTS)) {
    const entry = store.providers[key] || emptyProvider(key);
    const stored = decrypt(entry.apiKey);
    const envVar = PROVIDER_DEFAULTS[key]?.envVar;
    const hasKey = Boolean(stored || (envVar && process.env[envVar]));
    const pModels = { same: entry.model };
    for (const [n, m] of Object.entries(entry.perSectionModels || {})) pModels[n] = m;
    providers[key] = {
      model: entry.model,
      baseUrl: entry.baseUrl || PROVIDER_DEFAULTS[key].baseUrl,
      hasApiKey: hasKey,
      perSectionModels: entry.perSectionModels || {},
      models: pModels,
    };
  }

  const activeEntry = store.providers[store.activeProvider] || emptyProvider(store.activeProvider);

  return {
    ...rest,
    activeProvider: store.activeProvider,
    hasApiKey: Boolean(decrypt(activeEntry.apiKey) || envKeyFor(store.activeProvider)),
    providers,
    models,
  };
}

function envKeyFor(provider) {
  const envVar = PROVIDER_DEFAULTS[provider]?.envVar;
  return envVar && process.env[envVar] ? process.env[envVar] : "";
}

export function saveInternalConfig(patch) {
  const store = getStore();

  // Handle per-provider updates: { providers: { nvidia: { model, ..., apiKey } } }
  if (patch.providers && typeof patch.providers === "object") {
    for (const key of Object.keys(PROVIDER_DEFAULTS)) {
      const p = patch.providers[key];
      if (!p || typeof p !== "object") continue;
      const cur = store.providers[key] || emptyProvider(key);
      store.providers[key] = {
        ...cur,
        model: p.model !== undefined ? p.model : cur.model,
        baseUrl: p.baseUrl !== undefined ? p.baseUrl : cur.baseUrl,
        perSectionModels: p.perSectionModels !== undefined ? p.perSectionModels : (cur.perSectionModels || {}),
        apiKey: p.apiKey ? encrypt(p.apiKey) : cur.apiKey,
      };
    }
  }

  // Active provider switch
  if (patch.activeProvider && PROVIDER_DEFAULTS[patch.activeProvider]) {
    store.activeProvider = patch.activeProvider;
  }
  // Legacy: patch.provider acts as "make this provider active"
  else if (patch.provider && PROVIDER_DEFAULTS[patch.provider]) {
    // If switching to a different provider than active, keep both but set active
    if (patch.provider !== store.activeProvider) {
      store.activeProvider = patch.provider;
    }
    const cur = store.providers[patch.provider] || emptyProvider(patch.provider);
    store.providers[patch.provider] = {
      ...cur,
      model: patch.model !== undefined ? patch.model : cur.model,
      baseUrl: patch.baseUrl !== undefined ? patch.baseUrl : cur.baseUrl,
      perSectionModels: patch.perSectionModels !== undefined ? patch.perSectionModels : (cur.perSectionModels || {}),
      apiKey: patch.apiKey ? encrypt(patch.apiKey) : cur.apiKey,
    };
  }

  // Global params
  for (const k of ["temperature", "maxTokens", "topP", "systemPrompt", "timeout", "retryCount", "modelScope"]) {
    if (patch[k] !== undefined) store[k] = patch[k];
  }

  // Per-section models for the legacy active provider (from test route / config)
  if (patch.perSectionModels !== undefined && patch.provider && PROVIDER_DEFAULTS[patch.provider]) {
    store.providers[patch.provider].perSectionModels = patch.perSectionModels;
  }

  if (patch.lastTested !== undefined) store.lastTested = patch.lastTested;
  if (patch.lastTestResult !== undefined) store.lastTestResult = patch.lastTestResult;

  writeStore(store);
  return getPublicConfig();
}

export function resetConfig() {
  const store = defaultStore();
  writeStore(store);
  return getPublicConfig();
}

/** Resolve the effective key for an API call (env var wins, then stored). */
export function resolveApiKey(provider) {
  const envVar = PROVIDER_DEFAULTS[provider]?.envVar;
  if (envVar && process.env[envVar]) return process.env[envVar];
  const store = getStore();
  const entry = store.providers[provider] || emptyProvider(provider);
  return decrypt(entry.apiKey);
}
