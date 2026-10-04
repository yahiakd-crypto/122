/* ─────────────────────────────────────────────────────────────────────
   IMAGE GENERATION PROVIDER LAYER — abstract AIProvider interface.
   Implemented provider: Google AI (Generative Language API). Future
   providers plug in here without touching the rest of the app.
   All network calls happen server-side.
   ───────────────────────────────────────────────────────────────────── */
import { IMAGE_PROVIDERS, resolveImageApiKey } from "./config";

export class ImageProviderError extends Error {
  constructor(message, code = "provider_error", status = 500, temporary = false) {
    super(message);
    this.name = "ImageProviderError";
    this.code = code;
    this.status = status;
    this.temporary = temporary;
  }
}

/* ── Abstract base ─────────────────────────────────────────────────── */
export class AIProvider {
  constructor({ provider, model, apiKey, baseUrl, timeout }) {
    this.provider = provider;
    this.model = model;
    this.apiKey = apiKey;
    this.baseUrl = (baseUrl || "https://generativelanguage.googleapis.com").replace(/\/+$/, "");
    this.timeout = timeout || 180;
  }

  async generateImage() {
    throw new ImageProviderError("Not implemented.", "config_error", 500, false);
  }

  async getJobStatus() {
    throw new ImageProviderError("Not implemented.", "config_error", 500, false);
  }

  async cancelJob() {
    return true;
  }
}

function classify(err, providerMeta) {
  const p = providerMeta || {};
  const label = p.label || "Google AI";
  const lower = providerMeta?.lowerProvider;
  const isGoogle = lower === "google";
  const status = err.status || err.statusCode || 0;
  const raw = String(err.body || err.message || "");
  const body = raw.toLowerCase();
  const temporary =
    status === 429 ||
    status === 500 ||
    status === 502 ||
    status === 503 ||
    status === 504 ||
    /rate limit|quota|temporarly|try again|overloaded|resource exhausted|deadline|unavailable/i.test(body);

  // Google returns a signed safety/policy block as "AQ.…" codes (e.g. blocked
  // prompts or unsafe generations). These are permanent — never retried.
  const googleBlocked = /aq\.|"blocked"|finishreason["':\s]+safety|reason["':\s]+.*blocked|blocked due to|unsafe|violates|violated/i.test(body);

  if (status === 401 || status === 403 || /invalid api key|unauthorized|permission|api key not valid/i.test(body)) {
    return new ImageProviderError(`${label} authentication failed. Please check your API credentials.`, "invalid_key", status, false);
  }
  if (isGoogle && (googleBlocked || /invalid prompt|prompt blocked|safety|blocked/i.test(body))) {
    return new ImageProviderError(
      "Google AI blocked this request (AQ. policy/access error). This is usually because the preview image model is NOT enabled for this API key, or the content was flagged as unsafe. Enable the model for your key (or pick a different model), then retry. If it is not an access issue, reword the prompt (avoid race, brand/celebrity names and explicit terms).",
      "invalid_prompt",
      400,
      false
    );
  }
  if (status === 429 && /quota exceeded|quota.*limit|billing|free_tier/i.test(body)) {
    return new ImageProviderError(
      `${label} quota exceeded. Enable billing / use a paid key, then retry.`,
      "quota",
      429,
      false
    );
  }
  if (status === 429 || /rate limit|quota|resource exhausted|too many/i.test(body)) {
    return new ImageProviderError(`${label} rate limit reached. Please try again later.`, "rate_limit", 429, true);
  }
  if (err.code === "ECONNABORTED" || /timeout|deadline exceeded/i.test(body)) {
    return new ImageProviderError(`${label} timed out.`, "timeout", 408, true);
  }
  if (err.code === "ENOTFOUND" || err.code === "ECONNREFUSED" || err.code === "ECONNRESET" || err.code === "EAI_AGAIN") {
    return new ImageProviderError(`Network error reaching ${label}.`, "network", 0, true);
  }
  if (/not found|does not exist|invalid model|model.*unavailable/i.test(body)) {
    return new ImageProviderError("The selected image model is invalid or unavailable.", "invalid_model", status, false);
  }
  if (temporary) {
    return new ImageProviderError(`${label} hit a temporary error. It will be retried automatically.`, "temporary", status, true);
  }
  const snippet = raw.slice(0, 240);
  return new ImageProviderError(
    snippet
      ? `${label} returned an error (HTTP ${status}): ${snippet}`
      : `The image generation request failed (HTTP ${status || "?"}). Please try again.`,
    "provider_error",
    status,
    false
  );
}

function aspectToConfig(aspect) {
  const map = {
    "1:1": ["1:1", "1.0"],
    "4:3": ["4:3", "1.333"],
    "3:4": ["3:4", "0.75"],
    "3:2": ["3:2", "1.5"],
    "2:3": ["2:3", "0.667"],
    "16:9": ["16:9", "1.778"],
    "9:16": ["9:16", "0.562"],
  };
  return map[aspect] || null;
}

function parseAspect(ratio) {
  if (!ratio) return null;
  const m = String(ratio).match(/(\d+)\s*[:/]\s*(\d+)/);
  if (!m) return null;
  const w = parseInt(m[1], 10);
  const h = parseInt(m[2], 10);
  if (!w || !h) return null;
  const base = Math.max(0, Math.round(Math.log(h / w) / Math.LN2 * 10) / 10 * 8);
  const numBytes = 32 + Math.round(base + (w * h) / 8 / 0.6);
  return { w, h, numBytes };
}

/** Build a blended image prompt from the user prompt + product-level context. */
export function buildImagePrompt({ prompt, product, audience, settings }) {
  const parts = [];
  if (product?.name) parts.push(product.name);
  if (product?.category) parts.push(`Product category: ${product.category}`);
  if (product?.usp) parts.push(`Unique selling point: ${product.usp}`);
  if (audience) parts.push(`Target audience: ${audience}`);
  if (product?.targetCountry) parts.push(`Market: ${product.targetCountry}`);
  if (product?.brandName) parts.push(`Brand: ${product.brandName}`);
  if (settings?.creative) parts.push(settings.creative);
  const context = parts.filter(Boolean).join("\n");
  const userPrompt = (prompt || "").trim();
  const core = userPrompt || "Create a premium e-commerce advertising image.";
  const autoPrompt = [
    core,
    context ? `Context:\n${context}` : "",
    "Photorealistic commercial photography. Clean premium background. Product centered and clearly visible. Professional studio lighting. High detail, sharp focus.",
  ].filter(Boolean).join("\n\n");
  return { prompt: autoPrompt, contextAutoGenerated: !userPrompt };
}

/* ── Google AI (Generative Language API) ───────────────────────────── */
export class GoogleImageProvider extends AIProvider {
  constructor(opts) {
    super({ provider: "google", ...opts });
    this.apiVersion = "v1beta";
  }

  headers() {
    return { "Content-Type": "application/json" };
  }

  _url(action) {
    return `${this.baseUrl}/${this.apiVersion}/models/${encodeURIComponent(this.model)}:${action}?key=${encodeURIComponent(this.apiKey)}`;
  }

  _imageConfig() {
    const cfg = {};
    const pair = aspectToConfig(this.aspectRatio);
    if (pair) {
      cfg.imageConfig = { aspectRatio: pair[0] };
    }
    return cfg;
  }

  async generateImage({ prompt, negativePrompt, aspectRatio, numberOfImages, referenceImages, progress }) {
    this.aspectRatio = aspectRatio || "1:1";
    this.timeout = this.timeout || 180;

    const url = this._url("generateContent");
    const parts = [{ text: prompt }];
    referenceImages = referenceImages || [];
    const n = Math.max(1, parseInt(numberOfImages, 10) || 1);

    // Reference images (image-to-image) via inline_data when provided.
    for (const ref of referenceImages.slice(0, 4)) {
      if (ref.dataUrl) {
        const m = ref.dataUrl.match(/^data:([^;]+);base64,(.+)$/);
        if (m) {
          parts.push({ inline_data: { mime_type: m[1] || "image/png", data: m[2] } });
        }
      }
    }

    const generationConfig = {
      ...this._imageConfig(),
      responseModalities: ["IMAGE"],
    };
    if (n > 1) generationConfig.n = Math.min(n, 4);

    const body = {
      contents: [{ role: "user", parts }],
      generationConfig,
    };

    let res;
    try {
      res = await fetch(url, {
        method: "POST",
        headers: this.headers(),
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(this.timeout * 1000),
      });
    } catch (err) {
      throw classify({ ...err, code: err.name === "TimeoutError" ? "ECONNABORTED" : err.cause?.code || err.code }, { label: "Google AI", lowerProvider: "google" });
    }

    const raw = await res.text();
    let data = null;
    try { data = JSON.parse(raw); } catch { data = null; }

    if (!res.ok) {
      throw classify({ status: res.status, body: raw }, { label: "Google AI", lowerProvider: "google" });
    }

    // Extract images from candidates (Gemini image model returns inline base64 PNG).
    const images = [];
    const candidates = data?.candidates || [];
    for (const c of candidates) {
      const parts = c?.content?.parts || [];
      for (const p of parts) {
        if (p.inlineData || p.inline_data) {
          const inline = p.inlineData || p.inline_data;
          const b64 = inline.data || "";
          const mime = inline.mimeType || inline.mime_type || "image/png";
          const buf = Buffer.from(b64, "base64");
          images.push({ buffer: buf, mimeType: mime });
        }
      }
    }
    if (progress) progress(60);

    if (!images.length) {
      throw new ImageProviderError(
        "Google AI returned no image. The model may be busy or the prompt was blocked. Please try again or adjust the prompt.",
        "temporary",
        500,
        true
      );
    }
    return images;
  }
}

/* ── OpenRouter (image model) ───────────────────────────────────────── */
export class OpenRouterImageProvider extends AIProvider {
  constructor(opts) {
    super({ provider: "openrouter", ...opts });
    this.baseUrl = (opts.baseUrl || "https://openrouter.ai/api/v1").replace(/\/+$/, "");
  }

  headers() {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.apiKey}`,
      "HTTP-Referer": "https://ai-product-lab.local",
      "X-Title": "AI Product Research & CRO Lab",
    };
  }

  async generateImage({ prompt, aspectRatio, numberOfImages, progress }) {
    const url = `${this.baseUrl}/images/generations`;
    let res;
    try {
      res = await fetch(url, {
        method: "POST",
        headers: this.headers(),
        body: JSON.stringify({
          model: this.model,
          prompt,
          response_format: "b64_json",
          size: this._mapSize(aspectRatio),
          n: Math.max(1, parseInt(numberOfImages, 10) || 1),
        }),
        signal: AbortSignal.timeout(this.timeout * 1000),
      });
    } catch (err) {
      throw classify({ ...err, code: err.name === "TimeoutError" ? "ECONNABORTED" : err.cause?.code || err.code }, { label: "OpenRouter" });
    }
    const raw = await res.text();
    let data = null;
    try { data = JSON.parse(raw); } catch { data = null; }
    if (!res.ok) throw classify({ status: res.status, body: raw }, { label: "OpenRouter" });
    const items = data?.data || [];
    const images = [];
    for (const it of items) {
      const b64 = it.b64_json || (it.url ? await this._fetchToBuffer(it.url) : null);
      if (b64) {
        const buf = Buffer.isBuffer(b64) ? b64 : Buffer.from(b64, "base64");
        images.push({ buffer: buf, mimeType: "image/png" });
      }
    }
    if (progress) progress(60);
    if (!images.length) throw new ImageProviderError("Provider returned no image.", "temporary", 500, true);
    return images;
  }

  _mapSize(aspect) {
    const map = { "9:16": "512x1024", "16:9": "1024x512", "4:3": "1024x768", "3:4": "768x1024", "1:1": "1024x1024" };
    return map[aspect] || "1024x1024";
  }

  async _fetchToBuffer(url) {
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(60000) });
      const b = Buffer.from(await r.arrayBuffer());
      return b;
    } catch {
      return null;
    }
  }
}

/* ── NVIDIA (OpenAI-compatible image endpoint) ──────────────────────── */
export class NVIDIAImageProvider extends AIProvider {
  constructor(opts) {
    super({ provider: "nvidia", ...opts });
    this.baseUrl = (opts.baseUrl || "https://integrate.api.nvidia.com/v1").replace(/\/+$/, "");
  }

  headers() {
    return { "Content-Type": "application/json", Authorization: `Bearer ${this.apiKey}` };
  }

  async generateImage({ prompt, aspectRatio, numberOfImages, progress }) {
    const url = `${this.baseUrl}/images/generations`;
    const body = {
      model: this.model,
      prompt,
      response_format: "b64_json",
      n: Math.max(1, parseInt(numberOfImages, 10) || 1),
    };
    // qwen-image & flux accept aspect_ratio directly.
    const ar = this._mapAspect(aspectRatio);
    if (ar) body.aspect_ratio = ar;

    let res;
    try {
      res = await fetch(url, {
        method: "POST",
        headers: this.headers(),
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(this.timeout * 1000),
      });
    } catch (err) {
      throw classify({ ...err, code: err.name === "TimeoutError" ? "ECONNABORTED" : err.cause?.code || err.code }, { label: "NVIDIA" });
    }
    const raw = await res.text();
    let data = null;
    try { data = JSON.parse(raw); } catch { data = null; }
    if (!res.ok) throw classify({ status: res.status, body: raw }, { label: "NVIDIA" });

    const items = data?.data || [];
    const images = [];
    for (const it of items) {
      const b64 = it.b64_json || (it.url ? await this._fetchToBuffer(it.url) : null);
      if (b64) {
        const buf = Buffer.isBuffer(b64) ? b64 : Buffer.from(b64, "base64");
        images.push({ buffer: buf, mimeType: "image/png" });
      }
    }
    if (progress) progress(60);
    if (!images.length) throw new ImageProviderError("NVIDIA returned no image.", "temporary", 500, true);
    return images;
  }

  _mapAspect(aspect) {
    const map = { "1:1": "1:1", "4:3": "4:3", "3:4": "3:4", "3:2": "3:2", "2:3": "2:3", "16:9": "16:9", "9:16": "9:16" };
    return map[aspect] || null;
  }

  async _fetchToBuffer(url) {
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(60000) });
      return Buffer.from(await r.arrayBuffer());
    } catch {
      return null;
    }
  }
}

/* ── Factory ───────────────────────────────────────────────────────── */
export function buildImageProvider(providerName = "google", opts = {}) {
  const name = IMAGE_PROVIDERS[providerName] ? providerName : "google";
  const apiKey = opts.apiKey || resolveImageApiKey(name);
  const base = { ...opts, provider: name, apiKey, baseUrl: opts.baseUrl };
  switch (name) {
    case "openrouter":
      return new OpenRouterImageProvider(base);
    case "nvidia":
      return new NVIDIAImageProvider(base);
    case "google":
    default:
      return new GoogleImageProvider(base);
  }
}

export function getSupportedFeatures(providerName) {
  return IMAGE_PROVIDERS[providerName] || IMAGE_PROVIDERS.google;
}
