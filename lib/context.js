/* ─────────────────────────────────────────────────────────────────────
   CONTEXT ENGINE — sends only RELEVANT prior research to each section,
   summarized + truncated, never the whole 15,000-word project.
   ───────────────────────────────────────────────────────────────────── */
import { getSectionConfig, getSectionTitle } from "./sectionConfig.js";
import { getProduct, getAllSections } from "./db.js";

const SUMMARIZER_LIMIT_CHARS = 4500; // per source section

/** Structured text summary of a completed section. */
export function summarizeSection(num, raw) {
  if (!raw) return null;
  const text = String(raw);
  return {
    num,
    title: getSectionTitle(num),
    text: text.slice(0, SUMMARIZER_LIMIT_CHARS),
  };
}

/**
 * Returns a markdown block of the relevant prior research for a section.
 */
export function buildRelevantContext(projectId, sectionNum) {
  const sec = getSectionConfig(sectionNum);
  if (!sec) return "";

  const deps = sec.dependencies || [];
  const sections = getAllSections(projectId);
  const parts = [];

  for (const dep of deps) {
    const s = sections[dep];
    if (!s || (s.status !== "completed" && s.status !== "skipped")) continue;
    const content = s.result || s.rawResponse || "";
    if (!content) continue;
    parts.push(
      `╭─ FROM SECTION ${dep}: ${getSectionTitle(dep)} ─╮\n` + String(content).slice(0, SUMMARIZER_LIMIT_CHARS)
    );
  }

  // Some sections reference the product too (already injected via prompt).
  return parts.join("\n\n");
}

/** Compact digest of the whole project (used by the Final Report). */
export function projectDigest(projectId, maxCharsPerSection = 3500) {
  const sections = getAllSections(projectId);
  const out = [];
  for (let n = 1; n <= 17; n++) {
    const s = sections[n];
    if (!s) continue;
    const content = s.result || s.rawResponse || "";
    if (!content || s.status === "not_started") continue;
    out.push({
      num: n,
      title: getSectionTitle(n),
      status: s.status,
      content: String(content).slice(0, maxCharsPerSection),
    });
  }
  return out;
}

export { getProduct };