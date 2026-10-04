/* ─────────────────────────────────────────────────────────────────────
   MASTER SECTION CONFIGURATION — the source of truth for all 17
   sections. Derived from the master workflow specification.
   Each section stores: id/title/type/min length/dependencies/
   required markers/output format/instructions + AI prompt fragments.
   ───────────────────────────────────────────────────────────────────── */

const GLOBAL_SYSTEM_PROMPT = `You are a world-class combined expert team: DTC brand strategist, CRO (conversion rate optimization) specialist, UX/UI designer, consumer psychologist, market researcher, copywriter, brand strategist, and landing-page architect.
You run a premium AI Product Research & CRO Lab. You are currently executing ONE section of a 17-section agency-grade research workflow for a specific product.
Rules that ALWAYS apply:
1. Be specific, concrete and actionable — never generic fluff.
2. Structure your output with clear headings, sub-headings, bullets, and short paragraphs.
3. Quality over quantity, but never cut the required minimum scope.
4. Never invent fake stats, fake survey numbers, or fake scientific studies. If you present a market assumption, label it as "AI analysis / hypothesis".
5. When a marketing audience language is required, write naturally in that language — never machine-translate word by word. Keep product names, brand names, platform names, technical terms, numbers, and HEX codes as originally given, in English/pinyin/latin as needed.
6. Think from the perspective of a conversion-focused landing page built from your research.`;

const OUTPUT_RULES = (langLabel, minLines) =>
  `OUTPUT REQUIREMENTS:
- Minimum length: at least ${minLines} lines of genuinely informative content.
- Write the FINAL written marketing content in: ${langLabel}.
- Use clear markdown headings (## / ###), bullets, and bold for key terms.
- Cover every requested item listed in the instructions. No omissions.
- Do not add chat-like preamble. Start with the content directly.`;

export const LANGUAGE_LABELS = {
  darja: "Algerian Arabic (Darja) — natural, conversational, warm. Keep brand/product/platform/technical terms and HEX codes in their original Latin form. Do not simply transliterate; write like a native Algerian marketing specialist.",
  arabic: "Modern Standard Arabic — clear, professional, persuasive.",
  french: "French — polished, premium, persuasive French marketing tone.",
  english: "English — high-converting US/international DTC marketing tone.",
  custom: "the custom language/audience the user requested (see User Instructions).",
};

export const SECTIONS = [
  {
    id: 1,
    num: 1,
    title: "Product Research",
    shortTitle: "Product Research",
    type: "research",
    outputFormat: "text",
    minLines: 90,
    jsonMode: false,
    languageTarget: true,
    dependencies: [],
    description: "Deep single-product research that establishes the foundation for every other section.",
    needsProduct: true,
    neededSections: [],
    requiredMarkers: [
      "Main problem", "Emotional benefits", "Functional benefits", "Features", "Advantages",
      "Advantages vs alternatives", "Buying motivations", "Industry", "Target market", "Price positioning",
      "Premium vs budget positioning", "Seasonal opportunities", "Popular keywords", "Market opportunity",
      "Best countries", "Best age groups",
    ],
    instructions: `You are performing SECTION 1 — PRODUCT RESEARCH.
Write COMPLETE, DETAILED content under EVERY numbered section below. Stay focused ONLY on the product named in this research — do not introduce or confuse it with unrelated products.

RULES:
- Do NOT leave any section as just a heading — every section must have at least 3-5 full sentences of real, specific, actionable content.
- Do not skip any section even if information is limited; make a reasonable expert estimate and label it clearly as "AI analysis / hypothesis" when it is an inference rather than confirmed data.
- Stay 100% consistent in the requested target language throughout — never mix languages.
- Use clear markdown headings (##) for each of the 16 sections so the structure is easy to parse.
- Minimum 80-100 lines total.

Now cover ALL 16 of the following, in order, using a "##" markdown heading for each:

## 1. Main problem
Describe the core pain point in detail: who feels it, why it matters, and the cost of leaving it unsolved.
## 2. Emotional benefits
The feelings, identity, status, comfort, and belonging the buyer gains. List at least 5 specific emotional benefits with brief explanation of each.
## 3. Functional benefits
The measurable outcomes: time saved, money saved, concrete results, performance gains. List at least 5 specific functional benefits.
## 4. Features
A full inventory of the concrete features most relevant to a landing page. List at least 8 features.
## 5. Advantages
Why this product is better in general — its inherent strengths over a generic/first-touch solution.
## 6. Advantages vs alternatives
Direct comparison to at least 2-3 NAMED alternative solutions (competitors or workaround substitutes), explaining where this product wins and where it loses.
## 7. Buying motivations
The specific psychological and practical reasons people decide to buy. List at least 5 buying motivations.
## 8. Industry
Name the exact industry and the sub-industries / adjacent niches this product belongs to.
## 9. Target market
Describe the realistic customer segment in detail: demographics, interests, and behaviors.
## 10. Price positioning
State whether this belongs at premium / mid-market / budget, with the reasoning and benchmark prices from similar products. Label estimates as "AI analysis / hypothesis".
## 11. Premium vs budget positioning
Pick ONE and justify it with market logic (demand, margin, competition, audience willingness to pay).
## 12. Seasonal opportunities
Specific calendar moments, holidays, and trends relevant to this product.
## 13. Popular keywords
List at least 10-15 real search keywords people would use to find this product.
## 14. Market opportunity
Demand signals, growth trend, and market size estimate. Label estimates as "AI analysis / hypothesis".
## 15. Best countries to sell in
List at least 3-5 specific countries with a justification for each.
## 16. Best age groups
List specific age ranges with a justification for each.

End with a "## Key Takeaways" section summarizing the 6-8 most important insights (these will be inherited by the later workflow sections).`,
  },
  {
    id: 2,
    num: 2,
    title: "Top 10 Competitors",
    shortTitle: "Competitors",
    type: "competitor",
    outputFormat: "json",
    minLines: 150,
    jsonMode: true,
    languageTarget: true,
    dependencies: [1],
    needsProduct: true,
    neededSections: [1],
    requiredMarkers: ["Company", "Website", "Strengths", "Weaknesses"],
    description: "Research of 10 real competitors with full brand, landing-page and offer breakdowns.",
    instructions: `You are performing SECTION 2 — TOP 10 COMPETITORS.
Do REAL, UNIQUE research for each competitor. Use live web research when available and your trained marketplace knowledge otherwise — NEVER invent fake website URLs; if you are not certain a competitor website is real, write "not available" in the website field.
Stay strictly on the product/topic named in this research. Only include real, verifiable companies that actually operate in this exact niche — DO NOT include unrelated platforms (e.g. Pinterest, Etsy) as "competitors" unless they are direct competitors selling the same type of product/service.

STRICT RULES:
- Do NOT reuse the same strengths, weaknesses, visual description, landing style, offer, or CTA text across multiple competitors. Every competitor must have DIFFERENT, SPECIFIC details based on actually looking at their real website/brand.
- NEVER repeat the same sentence, phrase, or block of text for more than one competitor. If two companies genuinely share a trait, phrase it differently and specifically each time.
- Avoid generic/placeholder duplicated phrases like "عروض خاصة للمشتركين" or "أزرار اتصال بنا واضحة". These read as fake, duplicated content and fail quality checks.
- Do NOT pad length by repeating content — every line must add unique information. Minimum 150 lines total.
- Write all descriptive text (strengths, weaknesses, visualBranding, landingPageStyle, offerStrategy, ctaStrategy, positioning) in the requested target language, consistently throughout — never mix languages, and do not insert characters or typos from other scripts.

For EACH of the 10 competitors provide the exact JSON object below. Write all qualitative fields in the target language:
{
  "competitors": [
    {
      "company": "string (real company name)",
      "website": "https://...  (real working URL, or \"not available\")",
      "strengths": ["at least 3 SPECIFIC strengths unique to this exact company — not generic phrases repeated everywhere"],
      "weaknesses": ["at least 2-3 SPECIFIC weaknesses unique to this company"],
      "visualBranding": "describe their ACTUAL real color palette, logo style, typography, and imagery style",
      "colorPalette": ["real hex codes matching their actual branding — not random placeholders"],
      "typography": "their actual real typography/fonts direction",
      "landingPageStyle": "describe their actual homepage layout, structure, navigation, and hero section",
      "offerStrategy": "their actual real pricing, bundles, subscription model, or discounts",
      "ctaStrategy": "their actual real button text, placement, and urgency tactics used",
      "positioning": "premium / mid-market / budget — with reasoning",
      "isVerified": true|false
    }
  ]
}
isVerified=true only when you actually confirmed the competitor via live/verifiable research. Otherwise false. Richly and uniquely describe each of the 10 competitors.`,
  },
  {
    id: 3,
    num: 3,
    title: "Brand Colors",
    shortTitle: "Colors",
    type: "colors",
    outputFormat: "json",
    minLines: 60,
    jsonMode: true,
    languageTarget: false,
    dependencies: [1, 2],
    needsProduct: true,
    neededSections: [1, 2],
    requiredMarkers: ["primary", "secondary", "accent", "background"],
    description: "Three complete, conversion-tested brand color systems with reasoning.",
    instructions: `You are performing SECTION 3 — BEST BRAND COLORS.
Create 3 distinct color system OPTIONS for the brand. Each option is a complete palette with real, harmonious HEX values.
Your output MUST be valid JSON only (no fences):
{
  "options": [
    {
      "name": "string (short option name)",
      "primary": "#HEX",
      "secondary": "#HEX",
      "accent": "#HEX",
      "background": "#HEX",
      "text": "#HEX",
      "button": "#HEX",
      "psychology": "per-color psychological reasoning (2-3 sentences per color)",
      "competitivePositioning": "why this palette wins in this niche",
      "usage": "ratio advice (60/30/10 style)"
    }
  ]
}
Ensure the button color creates contrast vs the primary and passes readability. Choose colors that fit the product's luxury/budget positioning from Section 1.`,
  },
  {
    id: 4,
    num: 4,
    title: "Logo Research",
    shortTitle: "Logo",
    type: "logos",
    outputFormat: "json",
    minLines: 90,
    jsonMode: true,
    languageTarget: true,
    dependencies: [1, 3],
    needsProduct: true,
    neededSections: [1, 3],
    requiredMarkers: ["style", "typography", "colors"],
    description: "Three full logo directions, each ready to hand to a designer or image generator.",
    instructions: `You are performing SECTION 4 — LOGO RESEARCH.
Create 3 DISTINCT logo direction concepts for the actual brand being researched. Each concept must be complete and designer-ready. Make sure the product name/brand context matches the actual product being researched — do NOT default to unrelated placeholder products.

STRICT RULES:
- Do NOT repeat the same icon, shape, or color palette across the 3 directions — each of the 3 logos must be a visually distinct concept.
- Write the descriptive fields (style, minimal, luxury, shape, typography, icon, brandFeeling) in the requested target language.
- The "aiLogoPrompt" field, however, MUST be written ENTIRELY IN ENGLISH — regardless of the language used elsewhere in the report — formatted so it can be pasted directly into Midjourney, DALL-E, or Ideogram and generate a high-quality logo immediately, with no further editing.
- Do NOT mix languages inside the prompt itself (no "moderne", no script characters other than English).
- Each aiLogoPrompt must be 60-100 words: detailed enough for a quality result, but not so long the generator ignores parts.

Your output MUST be valid JSON only (no fences):
{
  "logos": [
    {
      "name": "concept name",
      "style": "e.g. Minimal / Luxury / Modern / Organic / Technology / Premium",
      "minimal": "string",
      "luxury": "string",
      "shape": "shape + symbol description",
      "typography": "font direction with justification",
      "colors": ["#hex", "#hex"],
      "icon": "icon/monogram description",
      "brandFeeling": "emotional feeling the logo transmits",
      "aiLogoPrompt": "A fully detailed professional text-to-image prompt, 100% in English, 60-100 words"
    }
  ]
}

Each "aiLogoPrompt" must include ALL of the following, in this order, using the format template below:
1. Logo type — e.g. "minimalist emblem logo", "modern wordmark logo", "abstract icon + text lockup logo"
2. Subject/icon description — precisely describe the exact shape, object, or symbol
3. Composition — icon placement relative to text (icon above text, icon left of text, icon integrated into a letterform, etc.)
4. Brand name text — the exact text to render; note that AI logo generators often render text incorrectly, so ALSO offer an icon-only version as a fallback
5. Typography style — a specific font category (e.g. "modern geometric sans-serif", "elegant serif", "hand-lettered script"); do NOT mix languages (write "modern", not "moderne")
6. Color palette — the exact hex codes and which element gets which color
7. Style modifiers — flat design / 3D / line art / hand-drawn / luxury minimal, plus background (transparent or solid white)
8. Mood/feeling — 2-3 adjectives (e.g. "confident, premium, trustworthy")
9. Negative constraints — explicitly state what to AVOID (e.g. "no photorealistic textures, no gradients unless specified, no clutter, no extra text, no watermarks")

FORMAT TEMPLATE (fill in the brackets):
"A [logo type] for a brand called '[brand name]', featuring [icon/subject description] in [composition style]. Typography: [font style] in [color hex]. Icon color: [color hex]. Style: [style modifiers], on a [background type] background. The logo should feel [mood adjectives]. Avoid: [negative constraints]."

Each of the 3 concepts must be at least 20 lines of total detail when expanded.`,
  },
  {
    id: 5,
    num: 5,
    title: "Buyer Personas",
    shortTitle: "Personas",
    type: "personas",
    outputFormat: "json",
    minLines: 120,
    jsonMode: true,
    languageTarget: true,
    dependencies: [1, 2],
    needsProduct: true,
    neededSections: [1, 2],
    requiredMarkers: ["name", "age", "country", "icon", "flow", "goals", "objections"],
    description: "Three complete buyer personas covering psychology, objections, and buying triggers.",
    instructions: `You are performing SECTION 5 — BUYER PERSONAS.
Create 3 COMPLETELY DISTINCT buyer personas that make sense for this specific product (for example: one could be a beginner hobbyist, one a gift-buyer, one a small-business reseller, one a nostalgic cultural preservationist, one a busy professional with disposable income). Make sure the product name matches the actual product being researched — do NOT default to unrelated placeholder products. Each persona = at least 40 lines of detail when expanded.

STRICT RULES:
- Each persona must have a DIFFERENT life situation, DIFFERENT psychology, DIFFERENT objections, and DIFFERENT buying triggers.
- Do NOT reuse the same goals, pain points, fears, frustrations, objections, or buying motivations across personas. If two personas share a trait, describe it with entirely different specific wording and context each time.
- Do NOT pad length by duplicating text across personas — every line must contain unique, non-repeated content. Minimum 120 lines total.
- Write ENTIRELY in clean, correct target language (e.g. Modern Standard Arabic). Do not mix in other languages inside sentences. Avoid placeholder foreign article fragments (e.g. "ال" + a non-Arabic word) — every term must be a real, correctly translated word.
- Output valid JSON matching the schema below, with an "icon" field (suggested emoji/icon name) and a "flow" array (journey stages) per persona.

Your output MUST be valid JSON only (no fences):
{
  "personas": [
    {
      "name": "Full name",
      "archetype": "short label, e.g. 'The Cultural Preservationist' / 'The Budget-Conscious Gift Buyer' / 'The Hobbyist Beginner'",
      "icon": "one simple emoji or icon name representing this persona, e.g. 🧵 / 🎁 / 📚",
      "age": "...", "gender": "...", "country": "...",
      "income": "...", "profession": "...", "familyStatus": "...",
      "demographics": "combined demographics line: age, gender, location, income level, occupation, family status",
      "lifestyle": "...",
      "goals": ["3 specific, unique to this persona"],
      "dreams": "long-term aspiration",
      "painPoints": ["3 specific, unique"],
      "fears": ["2 specific, unique"],
      "frustrations": ["2 specific, unique"],
      "objections": ["why they hesitate — unique to this persona"],
      "buyingMotivation": "their real underlying 'why'",
      "buyingTrigger": "the specific moment/event that pushes them to buy",
      "shoppingHabits": "...",
      "decisionFactors": ["ranked by importance for THIS persona specifically"],
      "socialMedia": ["platforms used"],
      "expectedResults": ["expected results after buying"],
      "wordsTheyUse": ["words/phrases they use"],
      "toneTheyRespondTo": "...",
      "quote": "one realistic short quote in their own voice (1-2 sentences, as if they said it themselves)",
      "flow": [
        { "stage": "Awareness", "detail": "specific trigger for this persona" },
        { "stage": "Consideration", "detail": "specific objection they must overcome" },
        { "stage": "Decision", "detail": "specific final push that converts them" },
        { "stage": "Purchase", "detail": "what happens at purchase" },
        { "stage": "Retention", "detail": "what makes them a repeat customer or advocate, if applicable" }
      ],
      "nickname": "short label"
    }
  ]
}`,
  },
  {
    id: 6,
    num: 6,
    title: "High-Converting Keywords",
    shortTitle: "Keywords",
    type: "keywords",
    outputFormat: "json",
    minLines: 200,
    jsonMode: true,
    languageTarget: true,
    dependencies: [1, 5],
    needsProduct: true,
    neededSections: [1, 5],
    requiredMarkers: ["emotional", "urgency", "trust", "social", "curiosity", "value", "identity", "score"],
    description: "700 unique, score-rated, conversion-ready keywords across 7 psychological categories.",
    instructions: `You are performing SECTION 6 — HIGH-CONVERTING KEYWORDS.
Generate exactly 700 unique, non-duplicated keywords across 7 psychological categories: Emotional, Urgency, Trust, Social Proof, Curiosity, Value/Price, and Identity/Belonging. Each category must contain EXACTLY 100 keywords.
Make sure the product name matches the actual product being researched — do NOT default to unrelated placeholder products. Generate keywords in the marketing language required (keep category keys in English, as shown below).

CRITICAL RULES:
- Every single keyword MUST be unique. Never repeat the same keyword or a near-identical variant more than once across the entire output.
- Do NOT loop or copy-paste the same 5-10 phrases — generate genuinely diverse vocabulary using synonyms, different sentence structures, different angles, and different customer emotions/situations.
- Each keyword should be short (2-6 words), written as something a real customer would type in search or that would appear in ad copy/CTAs.
- Do NOT mix languages or scripts within a single keyword — no Latin characters inside Arabic words (corrupted text is forbidden).
- Rate each keyword's "score" (0-100) honestly based on emotional intensity, specificity, buying-intent strength, and how commonly real customers in this niche use this phrase. Vary scores realistically — do NOT give every keyword the same or near-same score.

Your output MUST be valid JSON only, no markdown code fences, no trailing commas, no truncation:
{
  "categories": {
    "emotional": [ { "keyword": "...", "score": 0-100 }, ... 100 items ],
    "urgency": [ ... 100 items ],
    "trust": [ ... 100 items ],
    "social": [ ... 100 items ],
    "curiosity": [ ... 100 items ],
    "value": [ ... 100 items ],
    "identity": [ ... 100 items ]
  }
}
Before finishing, verify: all 7 categories are present, each has exactly 100 items, no keyword repeats anywhere in the file, and the JSON is fully valid and complete (not cut off mid-array).`,
  },
  {
    id: 7,
    num: 7,
    title: "Offers",
    shortTitle: "Offers",
    type: "offers",
    outputFormat: "json",
    minLines: 120,
    jsonMode: true,
    languageTarget: true,
    dependencies: [1, 3, 5],
    needsProduct: true,
    neededSections: [1, 3, 5],
    requiredMarkers: ["name", "mechanism", "impact", "cta", "risk"],
    description: "15 promotional offers plus the single best offer for this product.",
    instructions: `You are performing SECTION 7 — OFFERS.
Generate exactly 15 REALISTIC, PRODUCT-RELEVANT promotional offers for this exact product. Each offer must make logical business sense for this specific product and target market — do NOT invent irrelevant offer types (e.g. "TV show discount", "website discount") that have no real connection to how this product is actually sold.

STRICT RULES:
- ALL fields must be UNIQUE across the 15 offers — do not reuse the same "Impact" reasoning, "Risks" text, or CTA phrasing across multiple offers. Each offer should target a different real motivation, urgency angle, or customer segment.
- No two offers may share the same mechanism, impact justification, CTA phrasing, or risk text.
- Use a genuinely different mechanism for most of the 15 offers — not just "X% off" repeated. Use a real spread: discount, tiered discount, bundle, subscription, loyalty program, free trial, scarcity/limited-time, flash sale, referral bonus, upsell bundle, BOGO, free gift, etc.
- Vary "whenToUse" across offers (launch / evergreen / holiday / seasonal / flash / re-engagement / cart abandonment) — do not default most to "evergreen".
- Write descriptive fields (name, emotionalHook, discount, targetPersona, cta, risk) in the requested target language.
- Minimum 120 lines, no duplicated long text blocks. Output valid JSON only (no fences).

For EACH of the 15 offers, output this exact object:
{
  "offers": [
    {
      "name": "short, specific, benefit-driven offer name",
      "discount": "the % / fixed amount / bundle / BOGO / free-gift value",
      "emotionalHook": "the specific feeling this offer taps into",
      "mechanism": "discount | tiered discount | bundle | subscription | loyalty program | free trial | scarcity/limited-time | flash sale | referral bonus | upsell bundle | BOGO | free gift | ...",
      "targetPersona": "reference one ACTUAL buyer persona from Section 05 by name, then explain WHY this offer fits that persona's psychology",
      "impact": "low | medium | high | very high — with a UNIQUE justification specific to this offer (not copy-pasted)",
      "whenToUse": "launch | evergreen | holiday | seasonal | flash | re-engagement | cart abandonment",
      "cta": "short, action-driven button text — unique per offer (do not just change a percentage inside an identical sentence template)",
      "risk": "a REAL, specific risk of this exact offer (e.g. 'may attract discount-only buyers with low lifetime value' or 'could devalue premium positioning') — not a generic 'lower profitability' line repeated 15 times"
    }
  ]
}

Then select ONE "Best Offer" from the 15 and justify it with specific reasoning tied to this product's price point, target market, and buyer psychology (from Sections 01 and 05):
  "bestOffer": {
    "name": "string",
    "whyItWins": "detailed reasoning"
  }`,
  },
  {
    id: 8,
    num: 8,
    title: "Landing Page Structure",
    shortTitle: "Landing Pages",
    type: "landing",
    outputFormat: "json",
    minLines: 210,
    jsonMode: true,
    languageTarget: false,
    dependencies: [1, 3, 5, 7],
    needsProduct: true,
    neededSections: [1, 3, 5, 7],
    requiredMarkers: ["sectionName", "purpose", "cta", "conversionTips", "colorRecommendation", "aiPrompt"],
    description: "Three complete landing-page blueprints (A / B / C), 7 sections each, with deep CRO guidance + a copyable AI copywriting prompt per section.",
    instructions: `You are performing SECTION 8 — LANDING PAGE STRUCTURE.
Generate the Landing Page Structure using the EXACT format and depth shown below. Do NOT use short one-line labels — every field must contain real, specific, non-generic content written like a professional CRO (conversion rate optimization) consultant explaining their reasoning.

PRODUCT: use the actual product being researched — do not default to unrelated placeholder products. WRITE IN the target language of this project.

THE 3 PAGES MUST BE GENUINELY DIFFERENT STRATEGIC ANGLES.
For EACH landing page (A, B, C), start with a strategy name that names the actual angle, in exactly this format:
"LANDING PAGE A — '[memorable strategy nickname]' ([Angle type] Angle)"
Choose 3 angles that genuinely fit THIS product and its Section 05 personas, e.g. Speed/Reliability angle, Emotional/Identity angle, Value/Savings angle, or others that make more sense for this specific product.

For EACH of the EXACTLY 7 sections per page (Hero, Problem/Agitation, Solution/Product Intro, How It Works, Social Proof, Offer/Pricing, Final CTA/Closing), write ALL of the following fields with REAL depth — minimum 2-3 full sentences per field, never single words or short phrases:
- sectionName: an actual headline/title for this section, not just a generic label (e.g. "Hero — 'Never Lose a Day to a Failed Download Again'")
- purpose: what this section must accomplish, in context of the overall page flow
- psychologicalGoal: the specific emotional/cognitive shift happening here, named precisely (e.g. "problem-aware to solution-aware," "skepticism to trust," "interest to urgency")
- visualDirection: a fully composed scene description — subject, framing, background, mood, lighting — detailed enough that a photographer or designer could execute it without asking questions
- copywritingGoal: exact word-count guidance and structural instruction (e.g. "one punchy headline naming the pain, one sub-headline naming the fix, no more than 25 words above the fold")
- cta: the exact button text PLUS whether it's primary/secondary and WHY
- suggestedIcons: 2-3 specific icons described by what they represent, not just emoji
- suggestedImages: specific photography/illustration direction
- layoutDescription: how it's structured on mobile AND desktop
- animationIdeas: a specific micro-interaction or scroll animation
- colorRecommendation: specific colors named with reasoning for why they fit this section's mood, including hex codes
- mobileUxNotes: a real, specific mobile constraint or fix for this exact section
- trustElements: what specific trust signal belongs here (or explicitly state "None needed here" with reasoning)
- conversionTips: one genuine tactical insight a real CRO expert would give, including what mistake to avoid
  - aiPrompt: THE KEY FIELD FOR THE USER. This is the deliverable the user will copy and paste into another AI (ChatGPT, Claude, Gemini, OpenRouter) to generate the ACTUAL written copy for this section. Therefore it MUST be written as a COMPLETE, COHERENT, natural-language directive prompt IN ENGLISH — the way a professional copywriting strategist would brief a copywriter — NOT a structured summary, NOT a rigid content brief, and NEVER a numbered list of fields.
    - CRITICAL FORMAT: output it as flowing connected PROSE (several full sentences forming one coherent paragraph or two), written as a direct instruction to a copywriter AI. It must read naturally and be immediately usable by another AI on its own, WITHOUT needing the original form fields or extra context.
    - HARD BANS (validation will reject ANY of these inside aiPrompt): absolutely no numbered list ("1. 2. 3."); no bullet points; no "label: value" field headings — specifically banned labels include المنتج:, اسم القسم:, الغرض:, الشخصية المستهدفة:, نبرة الصوت:, الهيكل:, الكلمات الرئيسية:, ما يجب تجنبه:, and their English equivalents (Product:, Section:, Purpose:, Persona:, Tone:, Structure:, Keywords:, Avoid:). Do NOT begin lines with such labels. The entire aiPrompt must be one smooth, connected, natural-language instruction.
    - CONTENT TO WEAVE INTO THE PROSE (do NOT list them as items; blend them naturally into sentences that tell the writer what to do): what the product is and its name; which section is being written (e.g. Hero, Benefits, Problem/Solution, Social Proof, FAQ) and what its purpose is; who the target customer is (the buyer persona by name from Section 05) and the specific problem, desire, or motivation that drives them in this section; the main benefit to communicate; the emotional reaction the copy should create; the tone and writing/voice style to use; the single most important message to prioritize; which specific content must appear (e.g. one headline, one supporting sentence, benefit points, CTA); the exact CTA wording to use; relevant keywords (from Section 06) to work in naturally; what should NOT be mentioned or avoided (e.g. technical jargon, clichés, over-selling, unrelated claims); and any length/writing limits (e.g. headline under 10 words, subheadline under 20 words, CTA under 4 words).
    - SECTION-AWARE BEHAVIOR: the generated prompt must dynamically adapt to the current section. For Hero, focus the prompt on capturing attention, the above-the-fold message and a single primary CTA. For Benefits, focus on communicating concrete value and outcomes. For Problem/Solution, focus on the customer pain and how the product resolves it. For Social Proof, focus on trust, testimonials, credibility and reassurance. For FAQ, focus on overcoming objections and answering real customer questions. Match the prompts emphasis to the section role every time.
    - ADAPTIVE INPUTS: base the natural-language prompt on the real product, the target audience, the customer awareness level, the marketing objective, the brand voice, the desired emotional response, the required content structure, the CTA, the keywords, the restrictions, and any additional information available. Every section must produce a distinct, specific aiPrompt tailored to that section — never generic or reused.
    - STYLE MODEL (write in this natural, connected style; adapt content to the current section): "Write the [HERO] section for [product name], a [description]. The goal is to [purpose]. Speak directly to [persona], who [problem/desire]. The copy should make her feel [emotion]. Keep it [tone]. The most important message is [message]. Write one headline under 10 words, one supporting sentence under 20 words explaining the value, three concise benefit points, and finish with the CTA [CTA]. Naturally weave in these keywords: [keywords]. Avoid [what to avoid]. Do not add secondary CTAs or unrelated information." — Write THIS as flowing prose IN ENGLISH, expanding it into a complete paragraph so another AI can act on it directly.

STRICT RULES (VALIDATION WILL REJECT GENERIC OUTPUT):
- FORBIDDEN generic filler — any field that is just a vague label fails the whole section. Banned examples: "responsive components", "responsive design", "تصميم مستجيب", "مكونات متجاوزة", "company logo", "شعار الشركة", "reviews", "تعليقات العملاء", "professional photo". Write a CONCRETE, specific description instead (name the actual element, what it should show, how it should look, and why).
- Every single field MUST be at least 2-3 full sentences with real specifics (layout must name columns/alignment/spacing; mobileUx must name the exact thing that stacks/hides; visualDirection must describe subject + lighting; trustElements must say WHICH trust signal and WHERE).
- Every section MUST include a non-empty aiPrompt written as a COMPLETE natural-language directive prompt IN ENGLISH (flowing prose, several connected sentences — like a professional copywriting brief). HARD BAN: numbered lists ('1. 2. 3.'), bullet points, and 'label: value' field headings (e.g. 'المنتج:', 'اسم القسم:', 'الغرض:', 'الشخصية المستهدفة:', 'نبرة الصوت:', 'الهيكل:', 'الكلمات الرئيسية:', 'ما يجب تجنبه:', and their English equivalents). Any aiPrompt containing a numbered list or field labels is an instant FAIL. It must read as one coherent, immediately-usable instruction.
- Every section within a page must feel like a natural next step in a scroll journey — reference what the previous section accomplished and what this section adds.
- Never reuse the same Layout, Color Recommendation, Trust Element, Mobile UX, or aiPrompt text across sections or across pages A/B/C.
- Ground every section in the real product, real personas (reference them by name from Section 05), and real objections/offers from Sections 05 and 07.
- This is a LONG-FORM deliverable — do not compress fields to save length. Depth and specificity matter more than brevity here.

Your output MUST be valid JSON only (no fences). Minimum 210 lines, no duplicated text blocks.
{
  "pages": [
    {
      "variant": "A",
      "strategy": "LANDING PAGE A — '[memorable strategy nickname]' ([Angle type] Angle)",
      "theme": "one-sentence positioning of the page flow",
      "sections": [
        {
          "sectionName": "…",
          "purpose": "…",
          "psychologicalGoal": "…",
          "visualDirection": "…",
          "copywritingGoal": "…",
          "cta": "…",
          "suggestedIcons": ["…"],
          "suggestedImages": "…",
          "layoutDescription": "…",
          "animationIdeas": "…",
          "colorRecommendation": "…",
          "mobileUxNotes": "…",
          "trustElements": "…",
          "conversionTips": "…",
          "aiPrompt": "… (at least 8 lines, flowing prose prompt, ready to paste into an AI writer)"
        }
      ]
    }
  ]
}`,
  },
  {
    id: 9,
    num: 9,
    title: "Section Image Prompts",
    shortTitle: "Image Prompts",
    type: "imagePrompts",
    outputFormat: "json",
    minLines: 175,
    jsonMode: true,
    languageTarget: false,
    dependencies: [8],
    needsProduct: true,
    neededSections: [8],
    requiredMarkers: ["prompt", "style", "negative"],
    description: "Production-ready image-generation prompts for every landing-page section.",
    instructions: `You are performing SECTION 9 — SECTION IMAGE PROMPTS.
For EVERY section of landing page variants A, B, and C, create a fully production-ready image prompt.
Style direction: Luxury, Premium, Minimal, High-Conversion, DTC, Mobile-First, 9:16 compositions, soft shadows, modern product photography, commercial advertising aesthetic, high-end UI-feel — chosen to match each section.
CRITICAL image rules baked into EVERY prompt:
- NO buttons inside the generated image
- NO CTA text, no fake UI buttons, no clickable-looking elements
- NO text overlays of any kind
- explicit request for clean negative space where the real coded CTA/headline will sit
- prompt must be minimum 25 lines of detailed instruction.
Your output MUST be valid JSON only (no fences):
{
  "prompts": [
    {
      "variant": "A/B/C",
      "sectionName": "...",
      "aspectRatio": "9:16",
      "style": "luxury|premium|minimal|...",
      "prompt": "the full 25+ line generation prompt"
    }
  ]
}
Provide at least one prompt per section of every variant.`,
  },
  {
    id: 10,
    num: 10,
    title: "Copywriting",
    shortTitle: "Copywriting",
    type: "copywriting",
    outputFormat: "json",
    minLines: 140,
    jsonMode: true,
    languageTarget: true,
    dependencies: [1, 5, 6, 7, 8],
    needsProduct: true,
    neededSections: [1, 5, 6, 7, 8],
    requiredMarkers: ["headlines", "subhead", "cta", "trust", "urgency", "guarantee", "benefits"],
    description: "140 copy blocks (headlines, CTAs, trust, urgency, guarantees) ready to paste.",
    instructions: `You are performing SECTION 10 — COPYWRITING.
Write conversion copy in the required marketing language. Keep category names in English.
Deliver EXACTLY 20 items per category.
Your output MUST be valid JSON only (no fences):
{
  "categories": {
    "Headlines": ["20"],
    "Subheadlines": ["20"],
    "CTA Buttons": ["20"],
    "Trust Messages": ["20"],
    "Urgency Messages": ["20"],
    "Guarantee Messages": ["20"],
    "Benefit Statements": ["20"]
  }
}`,
  },
  {
    id: 11,
    num: 11,
    title: "Social Proof",
    shortTitle: "Social Proof",
    type: "socialProof",
    outputFormat: "json",
    minLines: 60,
    jsonMode: true,
    languageTarget: true,
    dependencies: [5],
    needsProduct: true,
    neededSections: [5],
    requiredMarkers: ["name", "stars", "review"],
    description: "15 testimonial concepts for realistic, credible social proof.",
    instructions: `You are performing SECTION 11 — SOCIAL PROOF.
Write 15 customer testimonial CONCEPTS in the marketing language required.
IMPORTANT: these are AI-generated testimonial concepts for placeholder/concept use only — the creator must replace them with real customer feedback before publishing.
Your output MUST be valid JSON only (no fences):
{
  "reviews": [
    {
      "name": "...", "age": "...", "country": "...", "stars": 5,
      "review": "full natural review text",
      "writingStyle": "...", "personality": "...",
      "objectionCovered": "which objection this review neutralizes"
    }
  ]
}`,
  },
  {
    id: 12,
    num: 12,
    title: "FAQ",
    shortTitle: "FAQ",
    type: "faq",
    outputFormat: "json",
    minLines: 70,
    jsonMode: true,
    languageTarget: true,
    dependencies: [5, 7],
    needsProduct: true,
    neededSections: [5, 7],
    requiredMarkers: ["question", "answer", "objection"],
    description: "20 questions & answers engineered to remove buying objections.",
    instructions: `You are performing SECTION 12 — FAQ.
Write 20 FAQs in the marketing language required. Questions in the customer's natural words, answers that remove friction.
Your output MUST be valid JSON only (no fences):
{
  "faqs": [
    { "question": "...", "answer": "...", "objectionAddressed": "...", "conversionPurpose": "..." }
  ]
}`,
  },
  {
    id: 13,
    num: 13,
    title: "Email Popup",
    shortTitle: "Popups",
    type: "popups",
    outputFormat: "json",
    minLines: 60,
    jsonMode: true,
    languageTarget: true,
    dependencies: [7, 10],
    needsProduct: true,
    neededSections: [7, 10],
    requiredMarkers: ["headline", "body", "offer", "cta"],
    description: "Four conversion popups: welcome, exit-intent, discount, and cart recovery.",
    instructions: `You are performing SECTION 13 — EMAIL POPUPS.
Design 4 popups in the marketing language required. Keep field names in English.
Your output MUST be valid JSON only (no fences):
{
  "popups": [
    {
      "type": "Welcome Popup",
      "headline": "...", "body": "...", "offer": "...",
      "cta": "...", "psychologicalAngle": "...", "designRecommendation": "..."
    },
    { "type": "Exit Intent Popup", ...same fields... },
    { "type": "Discount Popup", ...same fields... },
    { "type": "Cart Recovery Popup", ...same fields... }
  ]
}`,
  },
  {
    id: 14,
    num: 14,
    title: "Final Design Guide",
    shortTitle: "Design Guide",
    type: "research",
    outputFormat: "text",
    minLines: 80,
    jsonMode: false,
    languageTarget: false,
    dependencies: [1, 3, 8],
    needsProduct: true,
    neededSections: [1, 3, 8],
    requiredMarkers: ["Typography", "Spacing", "Shadows", "Cards", "Footer"],
    description: "The complete design system spec a developer/designer needs to build the page.",
    instructions: `You are performing SECTION 14 — FINAL DESIGN GUIDE.
Write a complete, developer-ready design guide for the landing page. Use the brand colors from Section 3 and structure from Section 8.
Cover every one of these, with concrete values (px, rem, spec numbers):
1. Typography — font choices, hierarchy scale, weights, sizes, line-height
2. Spacing — spacing scale, rhythm, consistency rules
3. Button radius — exact radius values and where to use them
4. Image style — treatment, ratios, consistent lighting
5. Icon style — stroke weights, sizes, line icon vs filled
6. Section spacing — vertical rhythm values
7. Grid — column system, container max width, mobile breakpoints
8. Cards — padding, radius, border values
9. Shadows — layered shadow system with exact values
10. Illustrations — when and how to use
11. Animations — durations, easing, entrance sequences
12. Trust badges — placement, style
13. Sticky CTA — behavior, placement, mobile rules
14. Footer — structure, columns, guidelines
Also include 8-10 "modern premium DTC design principles" distilled for this specific brand. End with a "DESIGN TOKENS" section listing the values as CSS snippets.`,
  },
  {
    id: 15,
    num: 15,
    title: "Design References",
    shortTitle: "References",
    type: "references",
    outputFormat: "json",
    minLines: 100,
    jsonMode: true,
    languageTarget: false,
    dependencies: [2],
    needsProduct: true,
    neededSections: [2],
    requiredMarkers: ["brand", "landing", "cro"],
    description: "10 real brands to study strategically (never copy) plus the CRO lesson each teaches.",
    instructions: `You are performing SECTION 15 — DESIGN REFERENCES.
Research 10 REAL brands relevant to this product category (use live web research when available; otherwise your trained knowledge — set isVerified=false). Do NOT copy their designs — treat them only as strategic references.
Your output MUST be valid JSON only (no fences):
{
  "references": [
    {
      "brand": "...", "website": "https://...  or not available",
      "whySuccessful": "...",
      "landingPageStyle": "...",
      "brandColors": ["#hex"],
      "photography": "...",
      "uxStrategy": "...",
      "croLesson": "...",
      "isVerified": true|false
    }
  ]
}`,
  },
  {
    id: 16,
    num: 16,
    title: "Ad Creative Ideas",
    shortTitle: "Ad Creatives",
    type: "adCreatives",
    outputFormat: "json",
    minLines: 150,
    jsonMode: true,
    languageTarget: true,
    dependencies: [5, 8],
    needsProduct: true,
    neededSections: [5, 8],
    requiredMarkers: ["hook", "angle", "cta", "storyboard"],
    description: "10 paid-social creative concepts covering every proven ad format.",
    instructions: `You are performing SECTION 16 — AD CREATIVE IDEAS.
Create 10 complete paid-social creative concepts. Include the EXACT mix: 2 UGC testimonial, 2 problem/solution, 1 unboxing, 1 before/after, 1 humor/meme, 1 founder story, 1 social proof, 1 urgency.
Marketing copy in the required language. Field labels in English.
Your output MUST be valid JSON only (no fences):
{
  "creatives": [
    {
      "name": "...",
      "format": "UGC Testimonial | Problem/Solution | Unboxing | Before/After | Humor/Meme | Founder Story | Social Proof | Urgency",
      "platform": "TikTok | Reels | Shorts | Feed | Stories",
      "hook": "...",
      "coreAngle": "...",
      "visualDirection": "...",
      "onScreenText": "...",
      "voiceover": "...",
      "primaryCopy": "...",
      "cta": "...",
      "sound": "...",
      "targetPersona": "...",
      "conversionReasoning": "...",
      "aiStoryboardPrompt": "full 15+ line text-to-video/image storyboard prompt"
    }
  ]
}`,
  },
  {
    id: 17,
    num: 17,
    title: "Ad Image Concepts",
    shortTitle: "Ad Images",
    type: "adImages",
    outputFormat: "json",
    minLines: 120,
    jsonMode: true,
    languageTarget: false,
    dependencies: [16],
    needsProduct: true,
    neededSections: [16],
    requiredMarkers: ["concept", "composition", "prompt"],
    description: "10 static ad concepts with production-ready 25-line image prompts.",
    instructions: `You are performing SECTION 17 — AD IMAGE CONCEPTS.
Create 10 static advertising image concepts. Include the EXACT mix: 2 lifestyle, 2 problem/solution, 1 flat-lay, 1 macro/detail, 1 gifting/unboxing, 1 minimalist hero, 1 seasonal, 1 comparison/grid.
For EVERY concept the image prompt must be minimum 25 lines, include "no buttons, no CTA text, no fake UI elements inside the image" and request clean negative space for real overlay text.
Your output MUST be valid JSON only (no fences):
{
  "concepts": [
    {
      "concept": "...",
      "type": "Lifestyle | Problem/Solution | Flat-Lay | Macro/Detail | Gifting/Unboxing | Minimalist Hero | Seasonal | Comparison/Grid",
      "visualIdea": "...",
      "composition": "...",
      "productPlacement": "...",
      "background": "...",
      "colorMood": "...",
      "lighting": "...",
      "emotionalAngle": "...",
      "targetPersona": "...",
      "platform": "...",
      "conversionReasoning": "...",
      "imagePrompt": "the 25+ line prompt"
    }
  ]
}`,
  },
];

export const TOTAL = SECTIONS.length; // 17

export function getSectionConfig(num) {
  return SECTIONS.find((s) => s.num === Number(num)) || null;
}

export function getSectionTitle(num) {
  return getSectionConfig(num)?.title || `Section ${num}`;
}

/** Which section numbers a section depends on (context sources). */
export function dependenciesFor(num) {
  return getSectionConfig(num)?.dependencies || [];
}

export function globalSystemPrompt() {
  return GLOBAL_SYSTEM_PROMPT;
}