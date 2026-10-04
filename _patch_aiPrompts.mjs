import { getProduct, saveSection, getSection } from "./lib/db.js";
import { getInternalConfig, resolveApiKey } from "./lib/ai/config.js";
import { buildProvider } from "./lib/ai/providers.js";
import fs from "node:fs";

const pid = "proj_1a3c5531f9be66a698d5c5f2";
const num = 8;
const product = getProduct(pid);
const section = getSection(pid, num);
const parsed = JSON.parse(JSON.stringify(section.parsed || {}));
const pages = parsed.pages || [];

// Collect all sections with their context
const ctx = [];
pages.forEach((p, pi) => {
  (p.sections || []).forEach((s, si) => {
    ctx.push({ key: `${pi}-${si}`, variant: p.variant, s });
  });
});
console.log("total sections to regenerate aiPrompt:", ctx.length);

// Build the generation request: ask the model to write each aiPrompt as a
// natural-language directive prompt (professional copywriting brief).
const items = ctx.map(({ key, s }) => {
  const c = [
    `Section: ${s.sectionName || ""}`,
    `Purpose: ${s.purpose || ""}`,
    `Goal: ${s.psychologicalGoal || ""}`,
    `Copywriting goal: ${s.copywritingGoal || ""}`,
    `CTA: ${s.cta || ""}`,
    `Icons: ${Array.isArray(s.suggestedIcons) ? s.suggestedIcons.join("; ") : (s.suggestedIcons || "")}`,
    `Conversion tips: ${Array.isArray(s.conversionTips) ? s.conversionTips.join("; ") : (s.conversionTips || "")}`,
  ].join("\n");
  return `KEY "${key}" for section "${s.sectionName}":\n${c}`;
}).join("\n\n");

const userPrompt =
  `I am building natural-language AI copywriting prompts. For EACH key below, write a single COMPLETE natural-language directive prompt in Arabic (صيغة أمر طبيعية) that a copywriting AI can paste and immediately use to write the actual copy for that landing-page section. It must read like flowing connected prose — like a professional copywriting strategist briefing a copywriter — NOT a numbered list, NOT a "label: value" list. Blend in: the product (نمط الخياطة 3000 — a digital sewing pattern product), the section purpose, the target persona, the benefit, the emotion, the tone, the CTA, and any length limits. Cover "what to explain" and "how much detail to add" naturally. NEVER use labels like المنتج: اسم القسم: الغرض: الشخصية المستهدفة: نبرة الصوت: الهيكل: الكلمات الرئيسية: ما يجب تجنبه: and never start lines with "1. 2. 3.".

You must output a SINGLE valid JSON object (no fences, no commentary) mapping each KEY to its aiPrompt string. Example: {"0-0":"اكتب نصوص قسم الhero..."}.

Here are the sections:\n\n${items}`;

const cfg = getInternalConfig();
const apiKey = resolveApiKey(cfg.provider);
const provider = buildProvider(cfg.provider, { apiKey, baseUrl: cfg.baseUrl });
console.log("provider:", cfg.provider, "| model:", cfg.model, "| timeout:", cfg.timeout);

const t0 = Date.now();
let content;
try {
  const r = await provider.chat({
    messages: [{ role: "user", content: userPrompt }],
    model: cfg.model,
    temperature: 0.6,
    maxTokens: 12000,
    topP: 0.95,
    timeout: cfg.timeout,
    systemPrompt: "",
  });
  content = r.content;
} catch (e) {
  console.log("FAIL elapsed", ((Date.now() - t0) / 1000).toFixed(1) + "s | code:", e.code, "| msg:", e.message);
  process.exit(1);
}
console.log("DONE elapsed", ((Date.now() - t0) / 1000).toFixed(1) + "s | contentLen:", content.length);

// Extract JSON object
let json = content;
const m = content.match(/[{][\s\S]*[}]/);
if (m) json = m[0];
let map;
try { map = JSON.parse(json); } catch (e) {
  console.log("JSON parse failed:", e.message);
  console.log("content slice:", content.slice(0, 400));
  process.exit(1);
}

// Patch
let patched = 0;
for (const { key, s } of ctx) {
  const v = map[key];
  if (v && typeof v === "string" && v.trim()) {
    s.aiPrompt = v.trim();
    patched++;
  }
}
console.log("patched aiPrompt count:", patched, "of", ctx.length);

saveSection(pid, num, { parsed: pages.length ? parsed : section.parsed, format: "json" });
console.log("saved. sample new aiPrompt:", JSON.stringify((ctx[0]?.s?.aiPrompt || "").slice(0, 200)));
