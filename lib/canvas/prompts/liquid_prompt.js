// ============================================================
// LIQUID PROMPT — HTML → Shopify Liquid theme converter
// Multi-phase prompts used by the liquid_prompt skill.
// ============================================================

export const LIQUID_MASTER_PROMPT = `You are an EXPERT SHOPIFY THEME DEVELOPER. Your job is to take the HTML page I give you and convert it into a complete, professional Shopify Liquid theme that is fully editable in the Theme Editor. Follow these 10 rules EXACTLY:

PART 1 — SETUP TAILWIND IN SHOPIFY
Create tailwind.config.js and postcss.config.js correctly inside the theme so Tailwind works inside Shopify:
- tailwind.config.js content paths MUST include: /layout/*.liquid, /templates/*.liquid, /sections/*.liquid, /snippets/*.liquid, /assets/*.js
- Build/compile the CSS into /assets/tailwind.css and include it in theme.liquid with {{ 'tailwind.css' | asset_url | stylesheet_tag }}
- Enable JIT mode ("mode": "jit")
- Make sure all colors/classes are RTL compatible (logical properties like text-left, pr-, pl-, ms-, me-).

PART 2 — ANALYZE THE HTML
Analyze the HTML page and split it into its logical sections in top-to-bottom order (hero, features, benefits, about, product, testimonials, FAQ, gallery, offer, footer, etc.). List them and say which content belongs to each section.

PART 3 — CONVERT EACH SECTION INTO /sections/*.liquid
Convert each section into its own .liquid file under /sections/. For each section:
- Use the EXACT structure/design/content from the original HTML.
- Build with Tailwind utility classes (no custom CSS unless needed).
- Include a COMPLETE {% schema %} for every section with:
  • text (titles, subtitles, badges, buttons labels)
  • image_picker (the section image / product image / background)
  • url fields for every button (button URL + label)
  • color settings (section background, text color, button color)
  • alignment settings (text alignment)
  • toggles (show/hide parts)
- Wrap settings with {% for block in section.blocks %} where content repeats (features, FAQ, gallery items).

PART 4 — RTL + DESKTOP LAYOUT RULES
For EVERY section with an image + text row on desktop:
- Text goes on the LEFT, image goes on the RIGHT.
- Support dir="rtl": in the Liquid HTML put the IMAGE FIRST, then the TEXT (this automatically flips to text-left/image-right in RTL).
- Use classes: flex flex-col lg:flex-row items-center justify-between gap-6
- In RTL pages flex reverses itself automatically; do NOT use flex-row-reverse unless you reverse the source order.
- Mobile: stack image below text is fine (flex-col).

PART 5 — FULL-WIDTH BREAKOUT
Sections that should break out of the container width must use this utility:
.section-breakout { width: 100vw; position: relative; left: 50%; transform: translateX(-50%); }
Add this CSS once (either in theme.liquid <style> block or in the compiled tailwind.css file).

PART 6 — EVERYTHING EDITABLE
Every text, button, color, image and section block MUST be editable from the Shopify Theme Editor (settings + blocks + content_for_index / section.settings). Do NOT hardcode content that should be editable.

PART 7 — /templates/index.json
Create /templates/index.json that loads ALL the sections in the SAME ORDER as the original HTML, with every section enabled.

PART 8 — JAVASCRIPT
Put ALL JavaScript behavior into /assets/theme.js (mobile menu, FAQ accordion, slider/carousel, tabs, counters, countdown, lazy loading) using Shopify-safe selectors (data-attributes, [data-*], theme editor safe). Link it only once with {{ 'theme.js' | asset_url | script_tag }} in theme.liquid.

PART 9 — PERFORMANCE & CLEAN CODE
- Clean, minimal, well-commented Liquid.
- No inline scripts in sections (put behavior in theme.js).
- Lazy-load images, avoid heavy plugins, keep it fast.
- No broken tags, no orphan closing tags, valid schema (no duplicate schema ids).

PART 10 — FINAL OUTPUT
Deliver the COMPLETE theme as files with their full paths inside a theme folder:
/layout/theme.liquid (updated, includes tailwind.css + theme.js + full_width_breakout CSS, header/nav + footer)
/templates/index.json
/sections/*.liquid
/snippets/*.liquid (only if needed)
/assets/theme.js
/assets/tailwind.css (compiled output placeholder + the .section-breakout rule)
tailwind.config.js
postcss.config.js

Every generated file MUST be complete and usable as-is in a Shopify theme.`;

export const LIQUID_ANALYSIS_SCHEMA = `Return ONLY a valid JSON object (do NOT wrap in markdown):
{
  "sections": [
    { "key": "unique_snake_case_key", "name": "Human readable section name (e.g. Hero Section)", "type": "hero | features | product | about | testimonials | faq | gallery | offer | cta | footer | other" }
  ],
  "order": ["section keys in original top-to-bottom order"],
  "notes": ["2-4 short observations about the page design, colors, RTL/Arabic needs, or special elements"]
}`;

export function buildLiquidPrompt() {
  return LIQUID_MASTER_PROMPT;
}

export function buildLiquidSectionPrompt(html, sectionName, sectionKey) {
  return `${LIQUID_MASTER_PROMPT}

PART 3 EXECUTION — build ONLY this one section:
SECTION FILE TO CREATE: /sections/${sectionKey}.liquid
SECTION NAME: "${sectionName}"

TASK:
1. Look inside the HTML page below, find the content that belongs to the "${sectionName}" section (match by its heading, text, images, buttons).
2. Rebuild it in /sections/${sectionKey}.liquid using Tailwind classes.
3. Include a COMPLETE ${"{% schema %}"} block (text, image_picker, url fields for buttons, colors, alignment, toggles, blocks for repeating content). Every editable piece MUST be a setting.
4. Follow ALL the RTL rules from PART 4 (if the section has image + text: image first, text second, flex-col lg:flex-row items-center justify-between).
5. If this section should be full width on the page, add the class "section-breakout" (CSS already handled in PART 5).
6. Label the section file clearly at the top with a {% comment %}: PART 3 — Section name.

OUTPUT RULE: Return ONLY the raw .liquid file content for ${sectionKey}.liquid — no explanations, no markdown code fences, no extra text. Start directly with the HTML markup / the file's {% comment %} header.

=== THE HTML PAGE TO CONVERT ===
${html}`;
}

export function buildLiquidAssetsPrompt(html, sectionKeys, analysisNotes) {
  const sectionList = sectionKeys.length
    ? sectionKeys.map((k, i) => `${i + 1}. ${k}`).join("\n")
    : "The section files were created separately (see the generated /sections/*.liquid files).";

  return `${LIQUID_MASTER_PROMPT}

FINAL ASSEMBLY PHASE — generate the remaining theme files.

SECTIONS ALREADY BUILT (files exist at /sections/*.liquid; use these exact section slugs in index.json):
${sectionList}

MY PAGE OBSERVATIONS: ${analysisNotes || "none"}

GENERATE THESE FILES ONLY:
1. /tailwind.config.js — content paths for /layout/*.liquid, /templates/*.liquid, /sections/*.liquid, /snippets/*.liquid, /assets/*.js; mode "jit"; design tokens matching the page colors found in the HTML.
2. /postcss.config.js — tailwindcss + autoprefixer plugins.
3. /layout/theme.liquid — a complete theme.liquid: doctype, html lang with dir="rtl" support, {{ content_for_header }}, Tailwind CSS link {{ 'tailwind.css' | asset_url | stylesheet_tag }}, the required .section-breakout CSS rule in a <style> block, header nav from the HTML, {{ content_for_layout }}, footer from the HTML, and {{ 'theme.js' | asset_url | script_tag }}.
4. /templates/index.json — loads ALL the section slugs above in the original top-to-bottom order (as in the HTML), each enabled with its name.
5. /assets/theme.js — all page JS behavior (mobile menu, accordion, tabs, slider, countdown, lazy images) with Shopify-safe data-* selectors, wrapped in DOMContentLoaded.
6. /snippets/section-breakout.liquid — a comment-only helper snippet explaining the .section-breakout rule usage.

IMPORTANT:
- The theme.liquid MUST include tailwind.css and theme.js asset links.
- index.json MUST reference the exact section slugs listed above.
- Keep design/colors/typography matched to the HTML page.

OUTPUT RULE: Return ONLY valid JSON:
{
  "files": [
    { "path": "/tailwind.config.js", "content": "..." },
    { "path": "/postcss.config.js", "content": "..." },
    { "path": "/layout/theme.liquid", "content": "..." },
    { "path": "/templates/index.json", "content": "..." },
    { "path": "/assets/theme.js", "content": "..." },
    { "path": "/snippets/section-breakout.liquid", "content": "..." }
  ],
  "notes": ["2-4 notes about what was set up and how to compile/activate the theme"]
}
No markdown fences, no text outside the JSON.`;
}

export const LIQUID_ASSETS_SCHEMA = `Return ONLY a valid JSON object (do NOT wrap in markdown):
{
  "files": [
    { "path": "/tailwind.config.js", "content": "full file content" },
    { "path": "/postcss.config.js", "content": "full file content" },
    { "path": "/layout/theme.liquid", "content": "full file content" },
    { "path": "/templates/index.json", "content": "full file content" },
    { "path": "/assets/theme.js", "content": "full file content" },
    { "path": "/snippets/section-breakout.liquid", "content": "full file content" }
  ],
  "notes": ["short notes"]
}`;