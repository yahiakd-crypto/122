// ============================================================
// LANDING PAGE BUILDER — AI Product → CRO Strategy → Landing Page
// Multi-phase prompt builders used by the landing_page_builder skill.
// Any product → strategy → section HTML (mobile-first, editable
// fields) → assemble → CRO audit → auto-optimization → export.
// ============================================================

// Shared rules injected into every prompt so the AI never invents facts.
const LANDING_GROUND_RULES = `GROUND RULES — NEVER CHANGE THESE:
- Work ONLY with the product information provided. NEVER invent product facts, statistics, reviews, certifications, guarantees, or prices.
- Any claim shown on the page MUST be traceable to the input data; if a number (price, rating, reviews count) is unknown, omit it from the page.
- The landing page must work for ANY product. The product stays the visual focus at all times.
- Copy must focus on the CUSTOMER'S RESULT, not just the product name.
- Mobile (390x844) is the PRIMARY design target; support 375, 412, 768, 1024, 1440.`;

// Neutralize characters that could break template-literal interpolation when
// embedding untrusted AI/HTML output back into a prompt string.
function embed(s) {
  return String(s == null ? "" : s).replace(/`/g, "\\`").replace(/\$\{/g, "\\${");
}

// ============================================================
// ROOT / MASTER PHILOSOPHY (phases 1–5, 7 visual rules)
// ============================================================
export const LANDING_ROOT_PROMPT = `You are an AI PRODUCT → CRO STRATEGY → LANDING PAGE generator. You think:

PRODUCT → CUSTOMER → PROBLEM → DESIRE → SOLUTION → PROOF → OFFER → TRUST → CTA

BEFORE generating any UI. You pipeline ANY ecommerce product into a landing page that is adapted SPECIFICALLY to that product.

DESIGN LANGUAGE — a high-converting ecommerce product page:
- information hierarchy, conversion structure, mobile-first UX, offer presentation, product storytelling, CTA placement, visual hierarchy. Do NOT copy any specific template; apply these principles to THIS product.
- Premium modern ecommerce look: strong visual hierarchy, large product imagery, clear typography, strong CTA hierarchy, clean cards, rounded corners, subtle shadows, premium spacing, clear pricing blocks, trust indicators, fully responsive layouts.
- Avoid: generic SaaS layouts, heavy gradients, excessive animation, clutter, tiny text, too many colors.

${LANDING_GROUND_RULES}`;

// ============================================================
// STRATEGY / DISCOVERY PHASE (Part 1): brand + product + offer +
// social proof + navigation. Anything missing → LABELED placeholder
// recorded in "gaps" (never silent generic filler).
// ============================================================
export const LANDING_STRATEGY_SCHEMA = `{
  "gaps": [
    {
      "field": "brandIdentity.colorPalette",
      "whatIsMissing": "what was not provided",
      "placeholderUsed": "the clearly labeled placeholder you created",
      "howToConfirm": "exact instruction for the human (e.g. give me 3 hex codes)"
    }
  ],
  "brandIdentity": {
    "brandName": "exact brand/product name + capitalization",
    "logoType": "text-logo-from-name",
    "colorPalette": { "primary": "hex", "secondary": "hex", "accent": "hex", "background": "hex" },
    "fonts": { "headline": "headline font family", "body": "body font family" },
    "vibe": "playful | luxury | clinical-trustworthy | warm-organic | bold-edgy"
  },
  "productContent": {
    "photos": ["describe each product shot that will be rendered as realistic inline SVG art, e.g. hero shot on neutral studio background"],
    "categoryLabel": "one short label, e.g. Nose Hair Trimmer",
    "headline": "one benefit-driven promise, not a description",
    "description": "2-3 sentence supporting description",
    "benefits": [
      { "icon": "lucide icon name of the benefit", "label": "very short label", "detail": "one sentence" }
    ],
    "accordion": { "description": "…", "ingredientsSpecs": "…", "howToUse": "…" }
  },
  "pricingOffer": {
    "regularPrice": "…", "discountPrice": "… or ''", "percentOff": "… or ''",
    "subscription": { "available": false, "frequencies": ["…"], "savingsPercent": 0 },
    "bundleQuantityDiscount": "… or ''",
    "shippingPolicy": "free shipping threshold + delivery time",
    "guarantee": "guarantee / return policy text"
  },
  "socialProof": {
    "starRating": 0, "reviewCount": 0,
    "reviews": [ { "name": "…", "rating": 0, "quote": "one sentence" } ]
  },
  "navigation": {
    "navItems": ["About", "FAQ", "Shipping", "Contact"],
    "cartIcon": true, "searchIcon": false,
    "primaryCta": { "label": "real button label", "url": "real destination or ''" },
    "urgency": { "type": "countdown|low-stock|badge|none", "label": "…" }
  },
  "conversion": {
    "headlineAngle": "…", "offerStrategy": "…", "trustStrategy": "…", "objectionHandling": "…"
  },
  "design": {
    "primaryColor": "hex", "secondaryColor": "hex", "accentColor": "hex",
    "backgroundColor": "hex", "textColor": "hex",
    "fontHeadline": "…", "fontBody": "…", "fontStyle": "modern stack string"
  },
  "sections": [
    { "key": "announcement_bar", "name": "Top Announcement Bar", "purpose": "sitewide promo/shipping strip", "headline": "…", "subheadline": "", "body": "", "ctaLabel": "", "layout": "full-width solid color strip" },
    { "key": "nav", "name": "Sticky Nav Bar", "purpose": "logo, menu, cart, search", "headline": "", "subheadline": "", "body": "", "ctaLabel": "", "layout": "logo-left, hamburger, cart-icon" },
    { "key": "hero_carousel", "name": "Hero Image Carousel", "purpose": "real product shots, swipeable", "headline": "…", "subheadline": "…", "body": "", "ctaLabel": "…", "layout": "dotted carousel + thumbnail strip" },
    { "key": "rating_strip", "name": "Rating Strip", "purpose": "stars + review count", "headline": "", "subheadline": "…", "body": "", "ctaLabel": "", "layout": "compact centered strip" },
    { "key": "category_headline", "name": "Category Label + Benefit Headline", "purpose": "category badge + promise + description", "headline": "…", "subheadline": "…", "body": "…", "ctaLabel": "", "layout": "badge, big headline, 2-3 sentences" },
    { "key": "benefit_icons", "name": "Benefit Icons Row", "purpose": "3-4 real benefit icons", "headline": "", "subheadline": "", "body": "", "ctaLabel": "", "layout": "icon cards in a row" },
    { "key": "price_block", "name": "Price Block", "purpose": "regular/discount price, subscribe toggle, bundle", "headline": "…", "subheadline": "", "body": "…", "ctaLabel": "", "layout": "price, toggles, fee notes" },
    { "key": "primary_cta", "name": "Primary CTA", "purpose": "full-width high-contrast buy button, sticky on mobile", "headline": "", "subheadline": "", "body": "", "ctaLabel": "…", "layout": "full-width button" },
    { "key": "info_accordion", "name": "Info Accordion", "purpose": "Description / Ingredients / How to Use, collapsible", "headline": "", "subheadline": "", "body": "…", "ctaLabel": "", "layout": "collapsible rows" },
    { "key": "reviews", "name": "Reviews Section", "purpose": "real reviews, stars, names", "headline": "…", "subheadline": "…", "body": "", "ctaLabel": "", "layout": "review cards" },
    { "key": "cross_sell", "name": "Cross-Sell Row", "purpose": "related products, horizontally scrollable", "headline": "…", "subheadline": "", "body": "", "ctaLabel": "…", "layout": "horizontal scroll cards" },
    { "key": "footer", "name": "Footer", "purpose": "shipping, returns, contact, socials", "headline": "", "subheadline": "", "body": "", "ctaLabel": "", "layout": "simple link columns" }
  ]
}`;

// The fixed 12-section build order (the AI must return these exact keys;
// the dashboard refills any missing key so a full page is ALWAYS built).
export const LANDING_MANDATORY_SECTIONS = [
  "announcement_bar", "nav", "hero_carousel", "rating_strip", "category_headline",
  "benefit_icons", "price_block", "primary_cta", "info_accordion", "reviews",
  "cross_sell", "footer"
];

export function buildLandingStrategyPrompt(ctx = {}) {
  const productName = (ctx.productName || "").trim();
  const desc = (ctx.productDescription || "").trim();
  const category = (ctx.productCategory || "").trim();
  const price = (ctx.productPrice || ctx.price || ctx.productCost || "").trim();
  const features = Array.isArray(ctx.features) ? ctx.features.join("; ") : (ctx.features || "").trim();
  const extra = (ctx.instructions || "").trim();

  const facts = [
    productName ? `PRODUCT NAME: ${productName}` : null,
    category ? `CATEGORY: ${category}` : null,
    desc ? `PRODUCT DESCRIPTION: ${desc}` : null,
    price ? `PRICE: ${price}` : null,
    features ? `FEATURES: ${features}` : null,
    extra ? `MORE PRODUCT INFORMATION PROVIDED BY THE USER: ${extra}` : null,
    !productName && !desc ? "NOTE: No product details were provided. Discovery must produce clearly labeled realistic placeholders for EVERYTHING and every placeholder must be listed in gaps." : null
  ].filter(Boolean).join("\n");

  return `${LANDING_ROOT_PROMPT}

=== PART 1 — DISCOVERY (complete this BEFORE planning any build) ===
DISCOVERY-FIRST RULE: catalog every fact below from the PRODUCT FACTS and USER INSTRUCTIONS. If a fact is missing, DO NOT invent random/generic filler — create a CLEARLY LABELED, realistic placeholder (example: "TODO — confirm final price, currently 3490 DZD") and record { field, whatIsMissing, placeholderUsed, howToConfirm } in the "gaps" array. Every guess MUST be in gaps.

1. BRAND IDENTITY — exact brand/product name (spelling + capitalization), a TEXT LOGO derived from the name (no logo file uploads here), brand color palette (primary, secondary, accent, background hex), font pairing (one headline + one body), and vibe/tone: playful | luxury | clinical-trustworthy | warm-organic | bold-edgy. Choose colors from the provided facts / brand trademarks / category conventions; if you must color from scratch, pick a tasteful category-appropriate palette and ADD A GAP asking the human to confirm the hex codes.
2. PRODUCT CONTENT — describe the product shots to render as realistic inline SVG art (avoid gray boxes), one category label, ONE benefit-driven headline (a promise, not a description), a 2-3 sentence supporting description, 3-4 key benefits (short label + icon name + one-sentence detail), and full accordion content (description / ingredients-or-specs / how to use).
3. PRICING & OFFER — regular price, discount price + % off, subscription option (frequencies + savings %), bundle/quantity discount, shipping policy (free threshold + delivery time), guarantee/return text.
4. SOCIAL PROOF — star rating, review count, 3-5 realistic reviews (name, rating, one-sentence quote).
5. NAVIGATION & CONVERSION — nav menu items, cart/search icons needed, primary CTA label + real destination, urgency element (countdown / low-stock / limited badge / none).

PRODUCT FACTS AVAILABLE (use ONLY these facts):
${facts}

=== PART 2 — SECTION PLAN (choose NOTHING: the full 12-section single-product page, this exact order) ===
1 announcement bar · 2 sticky nav · 3 hero image carousel with dots + thumbnails · 4 rating strip · 5 category label + benefit headline · 6 benefit icons row · 7 price block (with offer toggles) · 8 primary CTA (sticky on mobile) · 9 info accordion · 10 reviews · 11 cross-sell row · 12 footer.

OUTPUT RULE: Return ONLY the strategy JSON below (pure JSON, no markdown fences).

${LANDING_STRATEGY_SCHEMA}`;
}

// ============================================================
// SECTION PHASE (Part 2 build). One call per section → raw HTML.
// Discovery facts drive EVERYTHING; no invented colors, no gray
// placeholder boxes, no dead buttons. Editable text MUST carry
// data-lp-f="{sectionKey}.{field}".
// ============================================================
export function buildLandingSectionPrompt(ctx, strategy, section, fixInstruction = "") {
  const strategyJson = embed(JSON.stringify(strategy, null, 2));
  const sec = section || {};
  const d = (strategy && strategy.design) || {};
  const b = (strategy && strategy.brandIdentity) || {};
  const fix = fixInstruction ? `\nEXTRA OPTIMIZATION INSTRUCTION (apply it to this section): ${fixInstruction}` : "";
  const key = sec.key || "unnamed_section";

  return `${LANDING_ROOT_PROMPT}

=== DISCOVERY FACTS (use ONLY these — reuse the EXACT values this section needs) ===
${strategyJson}

TASK — build ONLY this ONE section of the fixed 12-section single-product page:
SECTION KEY: ${key}
SECTION NAME: ${sec.name || sec.key || "Section"}
PURPOSE: ${sec.purpose || ""}
PAGE POSITION: #${typeof sec.orderIndex === "number" ? sec.orderIndex + 1 : "?"} of 12
Copy to use (edit/clarify ONLY when instructed):
- Headline: ${sec.headline || ""}
- Subheadline: ${sec.subheadline || ""}
- Body: ${sec.body || ""}
- CTA label: ${sec.ctaLabel || ""}${fix}

SECTION-SPECIFIC BUILD RULES (apply the one matching this SECTION KEY):
- announcement_bar: full-width solid brand-color strip with the promo/shipping message from pricingOffer.shippingPolicy; optional mini CTA link.
- nav: STICKY bar — brand TEXT-LOGO from brandIdentity.brandName, hamburger menu listing navigation.navItems, cart icon (and search icon if navigation.searchIcon), primary CTA button on desktop.
- hero_carousel: image carousel (swipeable, dot indicators + thumbnail strip) of productContent.photos rendered as realistic inline SVG art; headline = productContent.headline; subheadline = productContent.description.
- rating_strip: stars (+ value) + review count exactly from socialProof.
- category_headline: category badge (productContent.categoryLabel), the benefit headline, and the supporting description.
- benefit_icons: 3-4 benefit cards from productContent.benefits (real icon + short label + one-liner).
- price_block: regular price, discount price + % off, subscribe-vs-one-time toggle + frequency selector ONLY if pricingOffer.subscription.available, bundle/quantity discount, shipping + guarantee from pricingOffer.
- primary_cta: FULL-WIDTH high-contrast buy button labeled navigation.primaryCta.label linking navigation.primaryCta.url (or "#price_block" anchor if ''); on mobile it becomes position:sticky to the bottom of the viewport. If navigation.urgency.type != "none", render the urgency microcopy above the button.
- info_accordion: collapsible "Description / Ingredients & Specs / How to Use" rows from productContent.accordion with a working toggle (details/summary or small JS-free CSS accordion that works in an iframe).
- reviews: review cards from socialProof.reviews (name, star rating, quote) + the aggregate star rating and reviewCount.
- cross_sell: horizontally scrollable row of 3 related-product cards; each card gets a realistic inline SVG product render in brand colors and a real "Add" button with a real label; the row scrolls horizontally with a hidden scrollbar.
- footer: simple link columns (Shipping, Returns, Contact) from navigation.navItems + socials; thin, minimal, brand colors.
- ANY OTHER KEY: build a clean cohesive section using the discovery facts.

TECHNICAL REQUIREMENTS (MANDATORY, NEVER CHANGE):
1. Single complete mobile-first section, raw HTML ONLY. NO markdown fences, NO explanations, NO "PRODUCT VISUAL" text anywhere.
2. Wrap in <section id="sec-${key}" data-lp-sec="${key}"> ... </section> with an INSIDE <style> scoped like #sec-${key} .cls { ... } so it can never collide with other sections.
3. EVERY user-facing text a marketer would edit (headline, subheadline, paragraphs, bullet items, button labels, badges, prices, review quotes + names, FAQ answers, footer links, urgency/cart text) MUST carry data-lp-f="${key}.<short_field>" (e.g. <h2 data-lp-f="${key}.headline">). Carousel dots, arrows, icons and decorative wrappers do not need it.
4. DESIGN RULES (NON-NEGOTIABLE):
   - Use ONLY the discovery brand palette — primary ${d.primaryColor || "…?"}, secondary ${d.secondaryColor || "…?"}, accent ${d.accentColor || "…?"}, background ${d.backgroundColor || "#ffffff"}, text ${d.textColor || "#0f172a"} — and fonts headline:"${d.fontHeadline}" body:"${d.fontBody}". Keep the vibe "${b.vibe || "…?"}". Never fall back to default gray/blue theme colors.
   - NO placeholder icons, NO gray boxes, NO generic stock images. Product visuals are REALISTIC INLINE SVG RENDERS colored from the palette (convincing product art for this category, never a gray silhouette). 
   - Every button has a REAL label and REAL action: navigation.primaryCta.label + navigation.primaryCta.url (or a sensible on-page anchor). Never a dead/default button.
   - Mobile-first: base CSS ~390px, then @media (min-width:768px) and (min-width:1024px) so it renders correctly on desktop.
5. Mark the fragment start with <!-- section:${key} --> so the assembler can split sections.

DESIGN TOKENS: primary ${d.primaryColor || "#0ea5e9"}, secondary ${d.secondaryColor || "#0f172a"}, accent ${d.accentColor || "#f59e0b"}, background ${d.backgroundColor || "#ffffff"}, text ${d.textColor || "#0f172a"}.`;

}

// ============================================================
// AUDIT PHASE (phase 12): score the assembled page.
// ============================================================
export const LANDING_AUDIT_SCHEMA = `{
  "scores": {
    "valueProposition": 0,
    "hero": 0,
    "productClarity": 0,
    "visualHierarchy": 0,
    "benefits": 0,
    "trust": 0,
    "socialProof": 0,
    "offer": 0,
    "cta": 0,
    "pricing": 0,
    "objectionHandling": 0,
    "mobileUx": 0,
    "overall": 0
  },
  "totalScore": 0,
  "problems": [
    {
      "priority": "CRITICAL|HIGH|MEDIUM|LOW",
      "affectedSectionKey": "section key affected",
      "affectedField": "data-lp-f field key if known, else ''",
      "problem": "explain the problem",
      "whyItHurtsConversion": "why it hurts conversion",
      "recommendedFix": "what to change"
    }
  ]
}`;

export function buildLandingAuditPrompt(html) {
  return `${LANDING_ROOT_PROMPT}

TASK — CRO AUDIT (phase 12): Score the assembled landing page below. Score each dimension 0–100: Value Proposition, Hero, Product Clarity, Visual Hierarchy, Benefits, Trust, Social Proof, Offer, CTA, Pricing, Objection Handling, Mobile UX, Overall. Compute totalScore (0-100).

Then list problems sorted by priority (CRITICAL → HIGH → MEDIUM → LOW). For EACH problem: explain it, say why it hurts conversion, give the exact fix, and if possible give affectedSectionKey + affectedField (the data-lp-f value) so the auto-optimizer can patch that exact text.

OUTPUT RULE: Return ONLY the audit JSON below (pure JSON, no markdown fences).

${LANDING_AUDIT_SCHEMA}

=== THE GENERATED LANDING PAGE ===
${embed(html)}`;
}

// ============================================================
// OPTIMIZATION PHASE (phase 13): patch the weakest fields.
// ============================================================
export const LANDING_OPTIMIZE_SCHEMA = `{
  "patches": [
    {
      "field": "exact data-lp-f value to patch (e.g. hero.headline)",
      "newText": "the improved replacement text",
      "reason": "why this helps conversion"
    }
  ],
  "summary": "1-2 sentences on what was optimized"
}`;

export function buildLandingOptimizePrompt(html, audit) {
  const critical = (audit?.problems || []).filter(p => p.priority === "CRITICAL" || p.priority === "HIGH").slice(0, 4);
  const fields = critical.filter(p => p.affectedField).map(p => ({
    field: p.affectedField,
    problem: p.problem,
    fix: p.recommendedFix
  }));

  return `${LANDING_ROOT_PROMPT}

TASK — AUTO OPTIMIZATION (phase 13): The CRO audit found these highest-priority problems:
${critical.length ? critical.map((p, i) => `${i + 1}. [${p.priority}] section ${p.affectedSectionKey || "?"} — ${p.problem} → fix: ${p.recommendedFix}`).join("\n") : "None above MEDIUM — improve the weakest scores anyway."}

Field-level tips (patch ONLY these exact data-lp-f fields, choose 2–4 best candidates):
${fields.length ? fields.map(f => `- ${f.field}: ${f.problem} → ${f.fix}`).join("\n") : "- Inspect the HTML below and choose 2–4 editable data-lp-f fields to strengthen (headline first)."}

Use stronger, benefit-driven, honest copy grounded in the product facts. Never invent facts, numbers, or reviews.
OUTPUT RULE: Return ONLY the optimization JSON below (pure JSON, no markdown fences): a list of patches where each field is an exact data-lp-f value present in the HTML and newText is the replacement text.

${LANDING_OPTIMIZE_SCHEMA}

=== THE GENERATED LANDING PAGE ===
${embed(html)}`;
}