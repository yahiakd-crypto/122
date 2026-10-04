// ============================================================
// METHODS LIBRARY — playbooks for the 15.docx strategy chapters:
//   testing (15 FB ads testing methods) / scaling (15 scaling
//   methods) / winningProduct (14 Chinese-source research
//   methods) / masterGuide (36 revenue-multiplication methods).
// The library file holds the full source text of every method;
// run = deliver a clean, complete action-ready playbook for the
// methods the user picked in the card.
// ============================================================

import { METHOD_LIBRARY } from "../methodLibrary";
import { MEDIA_BUYER_LIBRARY } from "../mediaBuyerLibrary";

// All chapters (15.docx library + the 100 expert media-buyer messages).
const ALL_CHAPTERS = { ...METHOD_LIBRARY, ...MEDIA_BUYER_LIBRARY };

// Skill type -> chapter key in the method library.
export const METHOD_CHAPTERS = {
  facebook_ads_testing_methods: "testing",
  facebook_ads_scaling_methods: "scaling",
  winning_product_methods: "winningProduct",
  sales_master_guide: "masterGuide",
  media_buyer_100_analysis: "mediaBuyer100",
};

// Chapters whose per-item output is an ANALYSIS of expert content (not a
// step-by-step field manual) — no diagram chart, playbook text only.
export const METHOD_ANALYSIS_MODE = {
  mediaBuyer100: true,
};

export const METHOD_CHAPTER_META = {
  testing: {
    title: "15 Facebook Ads Testing Methods",
    sub: "Pick one or more methods — run to get the full playbook for each.",
  },
  scaling: {
    title: "15 Facebook Ads Scaling Methods",
    sub: "Pick one or more methods — run to get the full playbook for each.",
  },
  winningProduct: {
    title: "Secret Methods To Find Winning Products From Chinese Sources",
    sub: "Pick one or more methods — run to get the full playbook for each.",
  },
  masterGuide: {
    title: "Complete Master Guide: 50+ Methods to Get More Sales",
    sub: "Pick one or more mega-methods — run to get the full playbook for each.",
  },
  mediaBuyer100: {
    title: "100 Expert Media-Buyer Messages — Analysis",
    sub: "Pick one or more of the 100 expert messages — run to get a full analysis of the strategy, structure and playbook inside each one.",
  },
};

export function getChapter(kind) {
  return ALL_CHAPTERS[METHOD_CHAPTERS[kind]] || null;
}

export function findMethod(kind, key) {
  const ch = getChapter(kind);
  if (!ch) return null;
  return ch.methods.find(m => m.key === key) || null;
}

// Neutralize characters that could break template-literal interpolation.
function embed(s) {
  return String(s == null ? "" : s).replace(/`/g, "\\`").replace(/\$\{/g, "\\${");
}

function productContext(ctx) {
  const parts = [];
  if (ctx.productName) parts.push(`- Product: ${ctx.productName}`);
  if (ctx.niche) parts.push(`- Niche: ${ctx.niche}`);
  if (ctx.audience) parts.push(`- Target audience: ${ctx.audience}`);
  if (ctx.market) parts.push(`- Market: ${ctx.market}`);
  if (ctx.instructions) parts.push(`- Special instructions: ${ctx.instructions}`);
  return parts;
}

// One method -> one complete playbook (faithful to the doc's source text).
export function buildMethodPlaybookPrompt(method, ctx = {}, chapterTitle = "") {
  const metaLines = [];
  if (method.meta && Object.keys(method.meta).length) {
    for (const [k, v] of Object.entries(method.meta)) {
      if (v) metaLines.push(`- ${k}: ${v}`);
    }
  }
  const metaBlock = metaLines.length ? metaLines.join("\n") : "- (no meta recorded in the doc)";
  const facts = productContext(ctx);
  const factsBlock = facts.length
    ? `\nCONTEXT YOU MAY USE TO PERSONALIZE (never contradict the doc):\n${facts.join("\n")}`
    : "";

  return `You are a senior Facebook Ads + ecommerce revenue strategist. The user selected "${method.title}" from the chapter "${chapterTitle || "the master guide"}".

Below is the COMPLETE source text for this method, taken directly from the playbook doc. Deliver it as a clean, complete, action-ready FIELD MANUAL in Markdown.

REQUIREMENTS:
- Return the FULL method — every phase, every sub-step, every KPI threshold, every kill-vs-scale rule, every budget figure, timeline, difficulty, success rate, and tool/directory list exactly as in the source. Do NOT summarize it away, skip sections, or invent new facts.
- Reformat into clear Markdown sections:
  ## GOAL  / ## WHEN TO USE  / ## STEP-BY-STEP  / ## KPIs & KILL/SCALE RULES  / ## BUDGET & PROJECTIONS  / ## DIFFICULTY
  (only include a section if the source actually covers it)
- Keep every number verbatim. Bullets where the doc uses bullets.
- Do NOT return JSON. Return ONLY the finished Markdown manual, starting with "# ${method.title}".
${factsBlock}

FORMAT NOTE: the source uses table borders (═ ─ ║ | lines) purely for decoration — FLATTEN those to plain text/bullets. Keep all real content.

SOURCE TEXT:
"""
${embed(method.body)}
"""
`;
}

// Chapter title line used by the card.
export function chapterLabel(kind) {
  const meta = METHOD_CHAPTER_META[METHOD_CHAPTERS[kind]];
  return meta ? meta.title : kind;
}

// Schema for the org-chart diagram data (one object per method).
export const METHOD_CHART_SCHEMA = `
Return ONLY a valid JSON object (no markdown fence) matching this structure exactly:
{
  "title": "Full method title from the doc (verbatim)",
  "goal": "One-line GOAL/PURPOSE of the method as literally described in the doc",
  "whenToUse": "WHEN TO USE this method, verbatim from the doc",
  "phases": [
    { "name": "PHASE 1 — name from the doc", "steps": ["each step/action exactly from the doc", "..."] }
  ],
  "kpis": ["every KPI/threshold/number from the doc (verbatim)"],
  "killRules": ["every KILL condition from the doc (e.g. 'Kill ad if spend > $X and 0 sales')"],
  "scaleRules": ["every SCALE condition from the doc (e.g. 'double budget if CPA < $Y')"],
  "budgetProjections": ["every BUDGET & PROJECTIONS figure from the doc"],
  "difficulty": "difficulty level if the doc states one",
  "budget": "budget if the doc states one",
  "timeline": "timeline if the doc states one",
  "bestFor": "best-for audience/types if the doc states one"
}
Rules: use ONLY facts from the source text. Do NOT invent numbers, tools, or rules. phases/steps must fully cover the doc's step-by-step.`;

// One method -> structured ORG-CHART diagram data (GOAL → WHEN TO USE → PHASES →
// KPIs → KILL/SCALE RULES → BUDGET). Rendered as a tree by MethodOrgChart.
export function buildMethodChartPrompt(method, ctx = {}, chapterTitle = "") {
  const facts = productContext(ctx);
  const factsBlock = facts.length
    ? `\nCONTEXT YOU MAY USE TO PERSONALIZE (never contradict the doc):\n${facts.join("\n")}`
    : "";
  return `You are a senior Facebook Ads + ecommerce revenue strategist. Extract the structure of "${method.title}" from the chapter "${chapterTitle || "the master guide"}" into an org-chart diagram.

Below is the COMPLETE source text for this method from the playbook doc. Build a complete, faithful diagram of it:
- Every phase and every step in the doc must appear (do NOT collapse or skip steps).
- Every KPI threshold, kill rule and scale rule number must appear verbatim.
- Do NOT invent anything that isn't in the source.
- The source uses table borders (═ ─ ║ | lines) purely for decoration — ignore them, keep the real content only.
${factsBlock}

SOURCE TEXT:
"""
${embed(method.body)}
"""
`;
}

// One expert message → a rich ANALYSIS of the scenario, strategy and
// transferable playbook (used for the 100 media-buyer messages chapter).
export function buildMessageAnalysisPrompt(method, ctx = {}, chapterTitle = "") {
  const facts = productContext(ctx);
  const factsBlock = facts.length
    ? `\nCONTEXT YOU MAY USE TO PERSONALIZE the recommendations:\n${facts.join("\n")}`
    : "";
  return `You are a senior media-buyer / ecommerce revenue strategist. The user selected the following expert message from the chapter "${chapterTitle || "100 Expert Media-Buyer Messages"}". Your job is to produce a deep, actionable analysis of the strategy and lessons contained in the message.

REQUIREMENTS:
Decode the message into these Markdown sections:
1. ## Scenario — What happened (summarize the hook / situation in plain English)
2. ## The Real Problem — What was actually going wrong beneath the surface
3. ## Strategy / Principle Inside — The core marketing/media-buying principle being taught
4. ## Step-by-Step Playbook — A concrete, transferable action plan derived from the message (phases, decisions, kill/scale rules, thresholds if any are mentioned)
5. ## Metrics & Red Flags to Watch — Every metric, ratio, or warning sign the message references
6. ## Recommendations — Tailored to my product / campaign using the context below

RULES:
- Do NOT output JSON. Return ONLY Markdown, starting with "# Analysis — <short title of the message>".
- Be faithful to every point made in the source. If a section doesn't apply, omit it rather than inventing.
- Where the source is very short (a teaser title only), say so, then build the full analysis you WOULD expect from the theme described.
- Use the original Arabic/Darija sparingly only when quoting a key line; the rest should be in English.
${factsBlock}

SOURCE TEXT (full expert message):
"""
${embed(method.body)}
"""
`;
}