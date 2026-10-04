/* ─────────────────────────────────────────────────────────────────────
   VALIDATION / AI QUALITY ENGINE
   Every generated result is scored 0-100 across multiple checks.
   ───────────────────────────────────────────────────────────────────── */
import { getSectionConfig } from "./sectionConfig.js";

/** Extract a JSON object from model output (handles fences & trailing text). */
export function extractJson(raw) {
  if (!raw) return { ok: false, data: null, error: "Empty output" };
  const text = String(raw);
  const attempts = [];
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced) attempts.push(fenced[1]);
  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
  if (firstBrace >= 0 && lastBrace > firstBrace) attempts.push(text.slice(firstBrace, lastBrace + 1));
  attempts.push(text);
  for (const a of attempts) {
    try {
      const data = JSON.parse(a);
      if (data && typeof data === "object") return { ok: true, data, error: null };
    } catch {
      /* try next */
    }
  }
  // Last resort: the response may be truncated (e.g. hit the token limit) mid-JSON.
  // Recover the longest valid JSON prefix by closing open strings/brackets.
  const repaired = repairJson(text);
  if (repaired) return { ok: true, data: repaired, error: "Output was truncated; recovered partial JSON." };
  return { ok: false, data: null, error: "Could not parse JSON from the AI response." };
}

/** Salvage a truncated JSON stream by closing unterminated strings and brackets. */
export function repairJson(raw) {
  const text = String(raw || "");
  const start = text.indexOf("{");
  if (start < 0) return null;
  let s = text.slice(start);
  let out = "";
  const stack = [];
  let inStr = false;
  let esc = false;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (inStr) {
      out += ch;
      if (esc) esc = false;
      else if (ch === "\\") esc = true;
      else if (ch === '"') inStr = false;
      continue;
    }
    if (ch === '"') { inStr = true; out += ch; continue; }
    if (ch === "{" || ch === "[") { stack.push(ch); out += ch; continue; }
    if (ch === "}" || ch === "]") { stack.pop(); out += ch; continue; }
    out += ch;
  }
  if (inStr) out += '"';
  while (stack.length) {
    const open = stack.pop();
    out += open === "{" ? "}" : "]";
  }
  if (!out.endsWith("}")) out += "}";
  try { return JSON.parse(out); } catch { return null; }
}

const ARABIC_RE = /[\u0600-\u06FF\u0750-\u077F]/;

function countLines(text) {
  return String(text || "").split("\n").filter((l) => l.trim()).length;
}

function hasDuplicates(text) {
  const lines = String(text || "").split("\n").map((l) => l.trim().toLowerCase()).filter((l) => l.length > 40);
  const seen = new Set();
  if (lines.length < 8) return false;
  for (const l of lines) {
    if (seen.has(l)) return true;
    seen.add(l);
  }
  return false;
}

/**
 * Run quality checks against a produced result.
 * @returns {score, checks: [{label, pass, detail}], isValid}
 */
export function validateSectionResult({ num, result, raw, product, language }) {
  const sec = getSectionConfig(num);
  if (!sec) return { score: 0, checks: [], isValid: false };
  const text = String(result || raw || "");
  const checks = [];
  let score = 100;

  const add = (label, pass, detail = "", weight = 0) => {
    checks.push({ label, pass, detail });
  };

  // 1. Minimum length
  const lines = countLines(text);
  const minMet = lines >= sec.minLines;
  add("Minimum length", minMet, `${lines} lines / min ${sec.minLines}`);
  if (!minMet) score -= 30;

  // 2. Required markers
  const low = text.toLowerCase();
  const missing = (sec.requiredMarkers || []).filter((m) => !low.includes(m.toLowerCase()));
  const markersOk = missing.length === 0;
  add("Required fields present", markersOk, missing.length ? `Missing: ${missing.join(", ")}` : "All core fields present");
  if (!markersOk) score -= Math.min(30, missing.length * 6);

  // 3. Product consistency
  let productOk = true;
  const productName = product?.name?.trim();
  if (productName && productName.length > 1) {
    productOk = low.includes(productName.toLowerCase());
    if (!productOk && sec.languageTarget && /[\u0600-\u06FF]/.test(productName)) productOk = true; // arabic product names stay latin-ish, skip
  }
  add("Product consistency", productOk, productOk ? "Product name present" : `Product name "${productName}" not found in output`);
  if (!productOk) score -= 10;

  // 4. Language check
  let langOk = true;
  if (language === "darja" || language === "arabic") {
    const hasArabic = ARABIC_RE.test(text);
    langOk = hasArabic;
    // Research/strategy sections may be bilingual, treat as advisory only
    if (!sec.languageTarget) langOk = true;
  }
  add("Language", langOk, langOk ? (sec.languageTarget ? "Marketing content written in target language" : "Advisory") : "Output appears to miss the target language");
  if (!langOk && sec.languageTarget) score -= 10;

  // 5. Structure (headings present)
  const structOk = (text.match(/^#{1,3}\s/m) || []).length >= 3 || sec.jsonMode;
  add("Structure", structOk, structOk ? "Well-structured headings/schema" : "Few/no headings");
  if (!structOk) score -= 5;

  // 6. No missing sections / fields (JSON sections)
  if (sec.jsonMode) {
    const { ok, data } = extractJson(text);
    add("JSON schema", ok, ok ? "Valid JSON" : "JSON parse failed");
    if (!ok) score -= 35;
    else {
      let hasKey = (obj, key) => obj && Object.keys(obj).some((k) => k.toLowerCase().includes(key.toLowerCase()));
      const shapeOk =
        hasKey(data, "competitors") || hasKey(data, "options") || hasKey(data, "logos") || hasKey(data, "personas") ||
        hasKey(data, "categories") || hasKey(data, "offers") || hasKey(data, "pages") || hasKey(data, "prompts") ||
        hasKey(data, "reviews") || hasKey(data, "faqs") || hasKey(data, "popups") || hasKey(data, "references") ||
        hasKey(data, "creatives") || hasKey(data, "concepts");
      add("Schema fields", shapeOk, shapeOk ? "Matches section schema" : "Unexpected JSON shape");
      if (!shapeOk) score -= 20;

      // Section 8 deep-quality enforcement: every section on every page must
      // carry a 7+ line AI copywriting prompt and non-generic fields.
      if (sec.num === 8) {
        const pages = Array.isArray(data.pages) ? data.pages : [];
        const sections = pages.flatMap((p) => (Array.isArray(p.sections) ? p.sections : []));
        const missingPrompt = sections.filter((s) => countLines(s.aiPrompt) < 8).length;
        const FORBIDDEN = [
          "responsive components", "responsive design", "تصميم مستجيب", "مكونات متجاوزة",
          "company logo", "شعار الشركة", "professional photo", "صورة احترافية",
        ].map((f) => f.toLowerCase());
        const genericCount = sections.filter((s) => {
          const t = JSON.stringify(s).toLowerCase();
          return FORBIDDEN.some((f) => t.includes(f));
        }).length;
        const promptOk = missingPrompt === 0;
        add("AI prompt (8+ lines per section)", promptOk, promptOk ? "All sections have an 8+ line prompt" : `${missingPrompt} section(s) missing an 8+ line aiPrompt`);
        if (!promptOk) score -= 25;
        const genericOk = genericCount === 0;
        add("No generic filler", genericOk, genericOk ? "" : `${genericCount} section(s) contain generic filler text`);
        if (!genericOk) score -= 25;
      }
    }
  } else {
    add("No missing sections", true, "N/A");
  }

  // 7. Header/empty check
  const notEmpty = text.trim().length > 20;
  add("Non-empty output", notEmpty, notEmpty ? "" : "Output is empty");
  if (!notEmpty) score -= 30;

  // 8. Duplicate content
  const dup = hasDuplicates(text);
  add("No duplicate blocks", !dup, dup ? "Duplicated long lines detected" : "");
  if (dup) score -= 5;

  const finalScore = Math.max(0, Math.min(100, score));
  return { score: finalScore, checks, isValid: finalScore >= 60 };
}