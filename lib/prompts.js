/* ─────────────────────────────────────────────────────────────────────
   PROMPT ENGINE — dynamically assembles each section's AI request.
   SYSTEM PROMPT + SECTION INSTRUCTIONS + PRODUCT CONTEXT +
   PREVIOUS SECTION CONTEXT + USER CUSTOM INSTRUCTIONS + OUTPUT FORMAT
   ───────────────────────────────────────────────────────────────────── */
import { getSectionConfig, globalSystemPrompt, LANGUAGE_LABELS } from "./sectionConfig.js";

function productBlock(product) {
  if (!product) return "(no product data provided)";
  const lines = [
    "PRODUCT INFORMATION:",
    `Product Name: ${product.name || "—"}`,
    `Category: ${product.category || "—"}`,
    `Description: ${product.description || "—"}`,
    `Product URL: ${product.url || "—"}`,
    `Price: ${product.price || "—"} ${product.currency || ""}`,
    `Target Country: ${product.targetCountry || "—"}`,
    `Target Market: ${product.targetMarket || "—"}`,
    `Target Audience: ${product.targetAudience || "—"}`,
    `Product Type: ${product.productType || "—"}`,
    `Delivery Method: ${product.deliveryMethod || "—"}`,
    `Unique Selling Proposition (USP): ${product.usp || "—"}`,
    `Brand Name: ${product.brandName || "—"}`,
    `Existing Website: ${product.existingWebsite || "—"}`,
    `Features: ${(product.features || []).join(" | ") || "—"}`,
    `Benefits: ${(product.benefits || []).join(" | ") || "—"}`,
    `Competitor URLs provided: ${(product.competitorUrls || []).join(" | ") || "none"}`,
    `Additional Instructions: ${product.additionalInstructions || "—"}`,
  ];
  return lines.join("\n");
}

export function buildLanguageLabel(languageSetting) {
  return LANGUAGE_LABELS[languageSetting] || LANGUAGE_LABELS.darja;
}

export function buildSystemPrompt({ language = "darja", customSystem = "", section } = {}) {
  const base = globalSystemPrompt();
  const lang = `OUTPUT LANGUAGE POLICY: The final written marketing content must be in: ${buildLanguageLabel(language)}.`;
  const sec = section ? `CURRENT SECTION: Section ${section.num} — ${section.title.toUpperCase()}.` : "";
  return [base, lang, sec, customSystem].filter(Boolean).join("\n\n");
}

/**
 * Assemble the full chat messages array for a section.
 * @param {object} opts
 */
export function buildMessages({ num, product, relatedContext, customInstructions, language, regenerate, systemPrompt, url }) {
  const sec = getSectionConfig(num);
  const langLabel = buildLanguageLabel(language);
  const strip = sanitizeContext(relatedContext);

  const userParts = [];

  if (url) userParts.push(`The user provided this product URL for reference: ${url}`);

  userParts.push(sec.instructions);

  userParts.push(`\n${productBlock(product)}`);

  if (strip) {
    userParts.push(`\nPREVIOUS RESEARCH CONTEXT (use it to stay consistent, do not repeat it verbatim):\n${strip}`);
  }

  if (customInstructions && customInstructions.trim()) {
    userParts.push(`\nUSER CUSTOM INSTRUCTIONS (high priority — override conflicting defaults):\n${customInstructions.trim()}`);
  }

  userParts.push(
    `\nOUTPUT FORMAT REQUIREMENTS:\n- ${langLabel}\n- Minimum ${sec.minLines} lines of genuinely useful content.\n- Use clear markdown headings and bullets.\n- Cover every requested item. No chat preamble. Start with content directly.` +
      (sec.jsonMode ? `\n- CRITICAL: your ENTIRE response must be a single valid JSON object matching the schema given above. No markdown fences, no commentary before or after.` : "")
  );

  if (regenerate) {
    userParts.push(`\nREGENERATION DIRECTIVE: ${regenerate}`);
  }

  const system = buildSystemPrompt({ language, customSystem: systemPrompt, section: sec });
  return [
    { role: "system", content: system },
    { role: "user", content: userParts.join("\n\n") },
  ];
}

/** Trim context to a rough token budget (chars ≈ tokens * 3.7). */
function sanitizeContext(content, budgetChars = 9000) {
  if (!content) return "";
  const text = String(content);
  if (text.length <= budgetChars) return text;
  return text.slice(0, budgetChars) + "\n…(context truncated for length)";
}