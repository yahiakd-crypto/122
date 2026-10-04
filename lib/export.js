/* ─────────────────────────────────────────────────────────────────────
   EXPORT LAYER — final structured report + TXT / Markdown / JSON / PDF.
   TXT preserves the master workflow section structure.
   ───────────────────────────────────────────────────────────────────── */
import { getSectionConfig } from "./sectionConfig.js";
import { getProduct, getAllSections, getProject, getReport } from "./db.js";

export const REPORT_STRUCTURE = [
  { heading: "Executive Summary", src: 99, description: null },
  { heading: "Product Positioning", src: 1, description: "Product Research" },
  { heading: "Market", src: 1, description: "Market sections of Product Research" },
  { heading: "Competitors", src: 2, description: "Top 10 Competitors" },
  { heading: "Brand Direction", src: 3, description: "Brand Colors" },
  { heading: "Logo Direction", src: 4, description: "Logo Research" },
  { heading: "Buyer Personas", src: 5, description: "Buyer Personas" },
  { heading: "Keywords", src: 6, description: "High-Converting Keywords" },
  { heading: "Offer", src: 7, description: "Offers" },
  { heading: "Landing Page Strategy", src: 8, description: "Landing Page Structure" },
  { heading: "Section Image Prompts", src: 9, description: "Section Image Prompts" },
  { heading: "Copywriting", src: 10, description: "Copywriting" },
  { heading: "Social Proof", src: 11, description: "Social Proof" },
  { heading: "FAQ", src: 12, description: "FAQ" },
  { heading: "Email Popups", src: 13, description: "Email Popup" },
  { heading: "Design System", src: 14, description: "Final Design Guide" },
  { heading: "Design References", src: 15, description: "Design References" },
  { heading: "Ad Strategy", src: 16, description: "Ad Creative Ideas" },
  { heading: "Static Ad Strategy", src: 17, description: "Ad Image Concepts" },
  { heading: "Final Recommendations", src: 99, description: null },
];

function contentFor(projectId, src) {
  if (src === 99) return getReport(projectId)?.content || "";
  const s = getAllSections(projectId)[src];
  if (!s) return "";
  return s.result || s.rawResponse || "";
}

function isDone(projectId, src) {
  if (src === 99) return Boolean(getReport(projectId)?.content);
  const s = getAllSections(projectId)[src];
  return Boolean(s && (s.status === "completed" || (s.result && s.result.trim())));
}

/** Assemble the full structured report into {heading, content, src}. */
export function assembleReport(projectId) {
  const product = getProduct(projectId);
  const project = getProject(projectId);
  const report = REPORT_STRUCTURE.map(({ heading, src, description }) => ({
    heading,
    src,
    description,
    content: contentFor(projectId, src),
    done: isDone(projectId, src),
  }));
  return { project, product, sections: report };
}

function sectionBlock(projectId) {
  const sections = getAllSections(projectId);
  const blocks = [];
  for (let n = 1; n <= 17; n++) {
    const cfg = getSectionConfig(n);
    const s = sections[n];
    const content = s?.result || s?.rawResponse || "";
    if (s?.status === "skipped") {
      blocks.push(`\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nSECTION ${String(n).padStart(2, "0")} — ${cfg.title.toUpperCase()}  [SKIPPED]\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      continue;
    }
    if (!content.trim()) {
      blocks.push(`\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nSECTION ${String(n).padStart(2, "0")} — ${cfg.title.toUpperCase()}  [NOT RUN]\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      continue;
    }
    blocks.push(`\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nSECTION ${String(n).padStart(2, "0")} — ${cfg.title.toUpperCase()}\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n${content.trim()}`);
  }
  return blocks.join("\n");
}

function reportTextBlock(projectId) {
  const { product, project, sections } = assembleReport(projectId);
  const header =
    `══════════════════════════════════════════════════════\n` +
    `AI PRODUCT RESEARCH & CRO LAB — FINAL REPORT\n` +
    `══════════════════════════════════════════════════════\n` +
    `PRODUCT: ${product.name || "—"}\n` +
    `CATEGORY: ${product.category || "—"}\n` +
    `MARKET:  ${[product.targetCountry, product.targetMarket].filter(Boolean).join(" / ") || "—"}\n` +
    `PRICE:   ${product.price ? `${product.price} ${product.currency}` : "—"}\n` +
    `GENERATED: ${new Date().toISOString()}\n` +
    `STATUS:  ${project?.status === "complete" ? "COMPLETE" : "IN PROGRESS"}\n`;

  const body = sections
    .map((s) => {
      if (!s.done && s.src !== 99) {
        return `\n\n──────────────────────────────────────────────\n${s.heading.toUpperCase()}\n──────────────────────────────────────────────\n[Not generated — Section not completed]`;
      }
      const label = s.src === 99 ? "" : ` (from Section ${String(s.src).padStart(2, "0")}: ${s.description})`;
      return `\n\n──────────────────────────────────────────────\n${s.heading.toUpperCase()}${label}\n──────────────────────────────────────────────\n\n${s.content.trim()}`;
    })
    .join("\n");

  return `${header}\n\n${body}`;
}

export function exportTxt(projectId) {
  const { project, product } = assembleReport(projectId);
  const head =
    `====================================================================\n` +
    `AI PRODUCT RESEARCH & CRO LAB\n` +
    `COMPLETE RESEARCH PACKAGE — ${(product && product.name) || "PROJECT"}\n` +
    `====================================================================\n` +
    `PROJECT: ${project?.name || ""}\n` +
    `EXPORTED: ${new Date().toISOString()}\n`;
  return `${head}${sectionBlock(projectId)}`;
}

export function exportMarkdown(projectId) {
  const { product, project, sections } = assembleReport(projectId);
  const md = sections
    .map((s) => {
      const label = s.src === 99 ? "" : ` *(from Section ${s.src} — ${s.description})*`;
      if (!s.done && s.src !== 99) return `## ${s.heading}\n\n_Not generated — Section not completed._`;
      return `## ${s.heading}${label}\n\n${s.content.trim()}`;
    })
    .join("\n\n---\n\n");
  return `# AI Product Research & CRO Lab — Final Report\n\n**Product:** ${product.name || "—"}  \n**Category:** ${product.category || "—"}  \n**Market:** ${[product.targetCountry, product.targetMarket].filter(Boolean).join(" / ") || "—"}  \n**Status:** ${project?.status || ""}  \n**Generated:** ${new Date().toISOString()}\n\n${md}\n`;
}

export function exportJson(projectId) {
  const { product, project, sections } = assembleReport(projectId);
  const sources = getAllSections(projectId);
  return JSON.stringify(
    {
      app: "AI Product Research & CRO Lab",
      exportedAt: new Date().toISOString(),
      project: { ...project, product },
      report: sections.map((s) => ({ heading: s.heading, ...(s.src !== 99 ? { sourceSection: s.src } : {}), content: s.content })),
      sectionsRaw: Object.fromEntries(
        Object.entries(sources).map(([n, s]) => [
          n,
          { status: s.status, result: s.result || "", sources: s.sources || [], cost: s.cost || null, qualityScore: s.qualityScore },
        ])
      ),
    },
    null,
    2
  );
}

export function exportPrintHtml(projectId) {
  const { product, project, sections } = assembleReport(projectId);
  const body = sections
    .map((s) => {
      let content = String(s.content || "").trim();
      if (!content) content = "<p style='color:#999'><em>Not generated — Section not completed.</em></p>";
      else content = `<pre style="white-space:pre-wrap;font-family:inherit;font-size:13px;line-height:1.6;margin:0">${escapeHtml(content)}</pre>`;
      const label = s.src === 99 ? "" : ` <span style="color:#888;font-weight:400">(Section ${s.src} — ${s.description})</span>`;
      return `<section style="padding:22px 0;border-bottom:1px solid #e6e6f0;break-inside:avoid"><h2 style="font-size:16px;margin:0 0 8px">${s.heading}${label}</h2>${content}</section>`;
    })
    .join("");
  return `<!doctype html><html><head><meta charset="utf-8"><title>Final Report — ${escapeHtml(product.name || project.name || "")}</title>
<style>
  @page { size: A4; margin: 18mm; }
  body { font-family: Inter, -apple-system, Segoe UI, Roboto, Arial, sans-serif; color:#141424; font-size:13px; line-height:1.55; }
  .head { border-bottom:3px solid #6d5ef2; padding-bottom:14px; margin-bottom:20px; }
  .head h1 { font-size:22px; margin:0 0 6px; }
  .kv { color:#555; font-size:12.5px; }
</style></head><body>
<script>window.addEventListener('load', function(){ setTimeout(function(){ window.print(); }, 400); });</script>
<div class="head"><h1>AI Product Research &amp; CRO Lab — Final Report</h1>
<div class="kv"><b>Product:</b> ${escapeHtml(product.name || "—")} &nbsp;•&nbsp; <b>Category:</b> ${escapeHtml(product.category || "—")} &nbsp;•&nbsp; <b>Market:</b> ${escapeHtml([product.targetCountry, product.targetMarket].filter(Boolean).join(" / ") || "—")}<br>
<b>Status:</b> ${project?.status || ""} &nbsp;•&nbsp; <b>Generated:</b> ${new Date().toISOString()}</div>
</div>
${body}
</body></html>`;
}

function escapeHtml(str) {
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Status summary for exported docs. */
export function progressSummary(projectId) {
  const sections = getAllSections(projectId);
  const done = Object.values(sections).filter((s) => s.status === "completed").length;
  const skipped = Object.values(sections).filter((s) => s.status === "skipped").length;
  return { done, skipped, total: 17, percent: Math.round(((done + skipped) / 17) * 100) };
}