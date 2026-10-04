import { buildMessages } from "./lib/prompts.js";
import { getInternalConfig, resolveApiKey } from "./lib/ai/config.js";
import { buildProvider } from "./lib/ai/providers.js";
import { getProduct, saveSection, recomputeProjectStatus } from "./lib/db.js";
import { extractJson, validateSectionResult } from "./lib/validation.js";
import { getSettings } from "./lib/db.js";
import fs from "node:fs";

const pid = "proj_1a3c5531f9be66a698d5c5f2";
const num = 8;
const product = getProduct(pid);
if (!product?.name) { console.log("NO PRODUCT"); process.exit(1); }

const cfg = getInternalConfig();
const apiKey = resolveApiKey(cfg.provider);
const provider = buildProvider(cfg.provider, { apiKey, baseUrl: cfg.baseUrl });
const settings = getSettings();

console.log("provider:", cfg.provider, "| model:", cfg.model, "| maxTokens:", cfg.maxTokens, "| timeout:", cfg.timeout);
const messages = buildMessages({ num, product, relatedContext: "", customInstructions: "", language: settings.language, systemPrompt: cfg.systemPrompt, url: product.url });
console.log("user msg length:", messages[messages.length-1].content.length);

const t0 = Date.now();
let result;
try {
  result = await provider.chat({
    messages, model: cfg.model,
    temperature: cfg.temperature, maxTokens: cfg.maxTokens, topP: cfg.topP,
    timeout: cfg.timeout, systemPrompt: cfg.systemPrompt,
  });
} catch (e) {
  console.log("FAIL elapsed", ((Date.now()-t0)/1000).toFixed(1)+"s | code:", e.code, "status:", e.status, "msg:", e.message);
  process.exit(1);
}
console.log("DONE elapsed", ((Date.now()-t0)/1000).toFixed(1)+"s | contentLen:", result.content.length);

let parsed = null, format = "text";
const { ok, data } = extractJson(result.content);
if (ok) { parsed = data; format = "json"; }

const validation = validateSectionResult({ num, result: result.content, product, language: settings.language });

const patch = {
  result: result.content,
  rawResponse: result.content,
  parsed, format,
  model: cfg.model,
  sources: [],
  cost: { model: cfg.model, provider: cfg.provider, inputTokens: result.inputTokens||0, outputTokens: result.outputTokens||0, usd: 0, elapsedMs: Date.now()-t0, at: Date.now() },
  validation,
  qualityScore: validation.score,
  status: validation.isValid ? "completed" : "in_progress",
  error: "",
};
saveSection(pid, num, patch);
recomputeProjectStatus(pid);

console.log("SAVED. validation score:", validation.score, "isValid:", validation.isValid, "status:", patch.status);
if (parsed?.pages) {
  console.log("pages:", parsed.pages.length);
  for (const p of parsed.pages) for (const s of (p.sections||[])) {
    console.log("  aiPrompt len", (s.aiPrompt||"").length, "|", JSON.stringify((s.aiPrompt||"").slice(0,70)));
  }
}
