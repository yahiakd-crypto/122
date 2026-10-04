/* ─────────────────────────────────────────────────────────────────────
   IMAGE GENERATION PROVIDER CONFIG — server-side, encrypted at rest.
   Secret key never shipped to the browser (mirrors lib/ai/config.js).
   ───────────────────────────────────────────────────────────────────── */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { PROVIDER_DEFAULTS } from "@/lib/ai/config.js";

const DATA_DIR = path.join(process.cwd(), "data");
const KEY_DIR = path.join(DATA_DIR, "keys");
const CONFIG_FILE = path.join(KEY_DIR, "image-config.json");
const SECRET_FILE = path.join(KEY_DIR, ".app-key");

function ensureDir() {
  if (!fs.existsSync(KEY_DIR)) fs.mkdirSync(KEY_DIR, { recursive: true });
}

function getOrCreateSecret() {
  ensureDir();
  if (fs.existsSync(SECRET_FILE)) return fs.readFileSync(SECRET_FILE, "utf8");
  const secret = crypto.randomBytes(32).toString("hex");
  fs.writeFileSync(SECRET_FILE, secret, { mode: 0o600 });
  return secret;
}

function encrypt(plain) {
  if (!plain) return "";
  const iv = crypto.randomBytes(12);
  const key = crypto.createHash("sha256").update(getOrCreateSecret()).digest();
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const enc = Buffer.concat([cipher.update(String(plain), "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return "v1:" + iv.toString("base64") + ":" + tag.toString("base64") + ":" + enc.toString("base64");
}

function decrypt(stored) {
  if (!stored) return "";
  try {
    const [v, ivB, tagB, dataB] = String(stored).split(":");
    if (v !== "v1") return "";
    const key = crypto.createHash("sha256").update(getOrCreateSecret()).digest();
    const decipher = crypto.createDecipheriv("aes-256-gcm", key, Buffer.from(ivB, "base64"));
    decipher.setAuthTag(Buffer.from(tagB, "base64"));
    return Buffer.concat([decipher.update(Buffer.from(dataB, "base64")), decipher.final()]).toString("utf8");
  } catch {
    return "";
  }
}

export const IMAGE_PROVIDERS = {
  google: {
    label: "Google AI",
    keyEnvVar: "GOOGLE_AI_API_KEY",
    models: ["gemini-2.5-flash-image", "gemini-3.1-flash-image", "gemini-3.1-flash-image-preview", "gemini-3.1-flash-lite-image", "gemini-3-pro-image", "gemini-3-pro-image-preview"],
    supportsAspectRatio: true,
    supportsCount: true,
    supportsReference: true,
    supportsNegative: false,
  },
  openrouter: {
    label: "OpenRouter (image)",
    keyEnvVar: "OPENROUTER_API_KEY",
    models: ["google/gemini-2.5-flash-image-preview"],
    supportsAspectRatio: true,
    supportsCount: false,
    supportsReference: true,
    supportsNegative: false,
  },
  nvidia: {
    label: "NVIDIA (image)",
    keyEnvVar: "NVIDIA_API_KEY",
    // Reuses the NVIDIA key configured in AI Parameters when no dedicated image key is set
    reuseAIParams: true,
    models: ["qwen/qwen-image-2512", "black-forest-labs/flux.1-schnell", "black-forest-labs/flux.1-dev", "stabilityai/stable-diffusion-3.5-large"],
    supportsAspectRatio: true,
    supportsCount: false,
    supportsReference: false,
    supportsNegative: false,
  },
};

export const DEFAULT_IMAGE_CONFIG = {
  provider: "nvidia",
  apiKey: "", // encrypted at rest
  model: "qwen/qwen-image-2512",
  maxConcurrentJobs: 3,
  dailyGenerationLimit: 50,
  timeout: 180,
  retryAttempts: 3,
  enabled: true,
  lastTested: 0,
  lastTestResult: "",
};

function readFileSafe() {
  ensureDir();
  if (!fs.existsSync(CONFIG_FILE)) return null;
  try {
    return JSON.parse(fs.readFileSync(CONFIG_FILE, "utf8"));
  } catch {
    return null;
  }
}

export function getInternalImageConfig() {
  const raw = readFileSafe() || {};
  const cfg = { ...DEFAULT_IMAGE_CONFIG, ...raw };
  const envKey = IMAGE_PROVIDERS[cfg.provider]?.keyEnvVar ? process.env[IMAGE_PROVIDERS[cfg.provider].keyEnvVar] : "";
  const storedKey = decrypt(cfg.apiKey);
  const sharedKey = IMAGE_PROVIDERS[cfg.provider]?.reuseAIParams && !storedKey && !envKey
    ? getAIParamsKey(cfg.provider) : "";
  cfg._hasKey = Boolean(storedKey || envKey || sharedKey);
  return cfg;
}

/** Public shape — never includes the API key. */
export function getPublicImageConfig() {
  const cfg = getInternalImageConfig();
  const { apiKey, _hasKey, ...rest } = cfg;
  return { ...rest, hasApiKey: _hasKey };
}

export function saveInternalImageConfig(patch) {
  const cfg = getInternalImageConfig();
  const next = { ...cfg, ...patch };
  if (patch.apiKey) {
    next.apiKey = encrypt(patch.apiKey);
  } else {
    next.apiKey = cfg.apiKey;
  }
  delete next._hasKey;
  ensureDir();
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(next, null, 2), { mode: 0o600 });
  return getPublicImageConfig();
}

export function resolveImageApiKey(provider) {
  const providerKeyEnv = IMAGE_PROVIDERS[provider]?.keyEnvVar;
  if (providerKeyEnv && process.env[providerKeyEnv]) return process.env[providerKeyEnv];
  const cfg = getInternalImageConfig();
  // The image config stores exactly ONE key and it only belongs to whatever
  // provider is selected there. Only return it when it matches the request.
  if (cfg.provider === provider) {
    const stored = decrypt(cfg.apiKey);
    if (stored) return stored;
  }
  // Fall back to the key the user configured for this same provider in AI
  // Parameters (NVIDIA, OpenRouter) so AI Studio reuses it automatically.
  if (IMAGE_PROVIDERS[provider]?.reuseAIParams) {
    const shared = getAIParamsKey(provider);
    if (shared) return shared;
  }
  // For google (not a reuse provider) still allow the stored key even if the
  // selected provider field drifted.
  if (provider === "google") {
    return decrypt(cfg.apiKey);
  }
  return "";
}

/** Pull a provider key from the AI Parameters store (same .app-key secret). */
export function getAIParamsKey(provider) {
  try {
    const cfg = getInternalAIParams();
    const entry = cfg.providers?.[provider];
    if (entry?.apiKey) {
      const k = decrypt(entry.apiKey);
      if (k) return k;
    }
    const def = PROVIDER_DEFAULTS[provider];
    const envVar = def?.envVar;
    if (envVar && process.env[envVar]) return process.env[envVar];
  } catch {}
  return "";
}

function getInternalAIParams() {
  const file = path.join(KEY_DIR, "ai-config.json");
  if (!fs.existsSync(file)) return { providers: {} };
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return { providers: {} };
  }
}

export function getPublicModels() {
  return IMAGE_PROVIDERS;
}
