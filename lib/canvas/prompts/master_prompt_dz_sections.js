/**
 * master_prompt_dz_sections.js
 * Individual section prompts for the Master DZ Landing Page Strategy skill.
 * Each section is run separately so results appear live one by one.
 */

const ROLE_AND_LANGUAGE = `# ROLE
You are a world-class DTC Brand Strategist, CRO Expert, UX Designer, Marketing Researcher, Consumer Psychologist, Copywriter, and Landing Page Architect.
Your research must be extremely detailed and based on real market information.
Never answer briefly. Always think like a brand agency charging $10,000+ per landing page.

# LANGUAGE REQUIREMENT (VERY IMPORTANT)
The ENTIRE output must be written in ALGERIAN ARABIC DIALECT (الدارجة الجزائرية / لهجة جزائرية), NOT formal Arabic (الفصحى), and NOT English.
- Write naturally the way Algerians speak and write online (e.g. "براك", "واش", "نتاع", "بزاف", "ماشي", "نقدر", "ديما", "زعما", "روحي", "تاع", "هاد", "كي", "برك").
- Product names, brand names, platform names (Meta, TikTok, Shopify, etc.) and HEX color codes stay in English.
- Section titles/headings stay in English.
- All content inside sections must be in Algerian Darja.
- Do NOT translate word-for-word from English. Rewrite the way an Algerian copywriter would naturally express it.

# PRODUCT INFO
`;

const buildBase = (ctx) => {
  const product = ctx.productName || ctx.niche || "the product";
  const description = ctx.productDescription || "";
  const audience = ctx.audience || "";
  return ROLE_AND_LANGUAGE + `Product: ${product}\n${description ? `Description: ${description}\n` : ""}${audience ? `Target Audience: ${audience}\n` : ""}`;
};

export const SECTION_PROMPTS = {
  product_research: (ctx) => buildBase(ctx) + `
# YOUR TASK — SECTION 1: PRODUCT RESEARCH
Write at least 50 lines covering:
- What is this product
- Main problem solved
- Emotional benefits
- Functional benefits
- Features
- Advantages
- Buying motivations
- Industry & Target market
- Price positioning (Luxury or budget)
- Seasonal opportunities
- Trending keywords
- Market opportunity
- Best countries & Age groups

Write all content in Algerian Darja. Return only plain text, no JSON.`,

  top_competitors: (ctx) => buildBase(ctx) + `
# YOUR TASK — SECTION 2: TOP 10 COMPETITORS
Research the market. For each of 10 competitors include:
- Company name & Website
- Strengths & Weaknesses
- Visual branding
- Landing page style
- Offer strategy & CTA strategy
- Color palette & Typography

Write all content in Algerian Darja. Return only plain text, no JSON.`,

  brand_colors: (ctx) => buildBase(ctx) + `
# YOUR TASK — SECTION 3: BEST BRAND COLORS
Research this product category and suggest 3 complete color palettes (OPTION 1, OPTION 2, OPTION 3).
For each palette include:
- Primary Color (HEX)
- Secondary Color (HEX)
- Accent Color (HEX)
- Background (HEX)
- Text (HEX)
- Button (HEX)
- Why it works psychologically (in Algerian Darja)

Return only plain text, no JSON.`,

  logo_research: (ctx) => buildBase(ctx) + `
# YOUR TASK — SECTION 4: LOGO RESEARCH
Find 3 logo directions. For each one provide (minimum 20 lines per logo):
- Logo Name
- Style (Minimal / Luxury / Modern / Organic / Technology / Premium)
- Shape, Typography, Colors, Icon, Brand feeling
- A detailed AI image prompt to generate that logo

Write explanations in Algerian Darja. Return only plain text, no JSON.`,

  buyer_personas: (ctx) => buildBase(ctx) + `
# YOUR TASK — SECTION 5: BUYER PERSONAS
Generate 3 complete buyer personas (minimum 40 lines each). Each persona must include:
- Name, Age, Gender, Country, Income, Profession
- Lifestyle, Goals, Dreams
- Pain Points, Fears, Frustrations, Objections
- Buying Motivation, Shopping Habits
- Favorite Social Media, Buying Trigger, Decision Factors
- Expected Results, Words they use, Tone they respond to

Personas must feel like REAL Algerian people: Algerian names, Algerian cities, income in DZD, local shopping habits (Jumia, Facebook Marketplace, Instagram sellers...).
Write all content in Algerian Darja. Return only plain text, no JSON.`,

  keywords: (ctx) => buildBase(ctx) + `
# YOUR TASK — SECTION 6: HIGH-CONVERTING KEYWORDS
Generate keyword lists in Algerian Darja (NOT literal English translations — use expressions real Algerians use):
- 100 Emotional Keywords
- 100 Benefit Keywords
- 100 Pain Point Keywords
- 100 CTA Words
- 100 Urgency Words
- 100 Trust Words
- 100 Social Proof Words

Group them by category. Return only plain text, no JSON.`,

  offers: (ctx) => buildBase(ctx) + `
# YOUR TASK — SECTION 7: OFFERS
Generate 15 promotional offers (e.g. 15% OFF, Buy 2 Get 1, Free Shipping, Flash Sale, Bundle, VIP Offer, Limited Stock, Free Gift, Countdown Offer, Welcome Discount, Membership Offer...).
For each offer: explain how to present it in Algerian Darja and why it converts.
Explain which offer converts best and why.
Write all content in Algerian Darja. Return only plain text, no JSON.`,

  landing_page_structure: (ctx) => buildBase(ctx) + `
# YOUR TASK — SECTION 8: LANDING PAGE STRUCTURE
Create THREE different landing page strategies (Landing Page A, B, C).
Each landing page must have 7 sections. For each section include (minimum 10 lines):
- Section Name & Purpose
- Psychological Goal
- Visual Direction
- Copywriting Goal & CTA
- Suggested Icons & Images
- Layout Description & Animation Ideas
- Color Recommendation
- Mobile UX Notes & Trust Elements & Conversion Tips

Write all content in Algerian Darja. Return only plain text, no JSON.`,

  image_prompts: (ctx) => buildBase(ctx) + `
# YOUR TASK — SECTION 9: SECTION IMAGE PROMPTS
For EVERY section of EVERY landing page (Landing Page A, B, C — 7 sections each = 21 prompts), write a professional AI image prompt.
Style: Luxury, Premium, Minimal, High Conversion, DTC Brand, Mobile First, 9:16 Ratio, Soft Shadows, Modern Product Photography.
CRITICAL: NO buttons, NO CTA button text inside the image. Leave clean negative space for the real coded CTA.
Each prompt must be 25+ lines.
Return only plain text, no JSON.`,

  copywriting: (ctx) => buildBase(ctx) + `
# YOUR TASK — SECTION 10: COPYWRITING
Generate in Algerian Darja:
- 20 Headlines
- 20 Sub Headlines
- 20 CTA Buttons
- 20 Trust Messages
- 20 Urgency Messages
- 20 Guarantee Messages
- 20 Benefit Statements

Write all content in Algerian Darja. Return only plain text, no JSON.`,

  social_proof: (ctx) => buildBase(ctx) + `
# YOUR TASK — SECTION 11: SOCIAL PROOF
Generate 15 customer reviews. Each review must have:
- Different age, country, writing style, and personality
- Name, Stars (1-5), Review text

Reviews must sound like REAL Algerian customers, mixing Darja naturally (some formal, some very casual — exactly like real Algerian social media reviews).
Write all content in Algerian Darja. Return only plain text, no JSON.`,

  faq: (ctx) => buildBase(ctx) + `
# YOUR TASK — SECTION 12: FAQ
Generate 20 frequently asked questions with professional answers.
Write all content in Algerian Darja. Return only plain text, no JSON.`,

  email_popups: (ctx) => buildBase(ctx) + `
# YOUR TASK — SECTION 13: EMAIL POPUPS
Generate 4 popup scripts:
- Welcome popup
- Exit popup
- Discount popup
- Cart recovery popup

Write all content in Algerian Darja. Return only plain text, no JSON.`,

  design_guide: (ctx) => buildBase(ctx) + `
# YOUR TASK — SECTION 14: FINAL DESIGN GUIDE
Explain all design decisions following modern DTC brands (AG1, Ritual, Huel, Magic Spoon, Native, Dollar Shave Club):
- Typography (font families, sizes, weights)
- Spacing system
- Button radius style
- Image style & Icon style
- Section spacing & Grid
- Cards & Shadows
- Illustrations & Animations
- Trust Badges & Sticky CTA & Footer

Write explanations in Algerian Darja. Return only plain text, no JSON.`,

  design_references: (ctx) => buildBase(ctx) + `
# YOUR TASK — SECTION 15: DESIGN REFERENCES
Find 10 brands similar to this product category. For each explain:
- Why they are successful
- Landing page style
- Brand colors
- Photography style

Write all content in Algerian Darja. Return only plain text, no JSON.`,

  ad_creative_ideas: (ctx) => buildBase(ctx) + `
# YOUR TASK — SECTION 16: AD CREATIVE IDEAS
Generate 10 complete ad creative ideas for paid social (Meta / TikTok / Instagram / Pinterest).
Cover: 2 UGC testimonial ads, 2 problem/solution demo ads, 1 unboxing ad, 1 before/after comparison, 1 humor/meme-style, 1 founder story, 1 social proof compilation, 1 limited-time urgency ad.

For each ad idea include:
- Ad Name / Concept
- Ad Format & Platform
- Hook (first 3 seconds — must stop the scroll)
- Core Angle, Visual Direction, On-Screen Text, Voiceover/Script
- Primary Ad Copy (caption), CTA Button Text
- Suggested Music Style, Target Persona, Why This Converts

Each idea must be minimum 15 lines.
Also write a professional AI image/video storyboard prompt (no buttons inside the image).
Write all content in Algerian Darja. Return only plain text, no JSON.`,

  ad_image_concepts: (ctx) => buildBase(ctx) + `
# YOUR TASK — SECTION 17: AD IMAGE CONCEPTS
Generate 10 static ad image concepts. Cover:
2 lifestyle in-use shots, 2 problem/solution images, 1 flat-lay, 1 macro/detail shot, 1 gifting/unboxing, 1 minimalist studio, 1 seasonal, 1 comparison/grid.

For each concept include:
- Concept Name & Type
- Core Visual Idea
- Composition & Framing
- Product Placement, Background & Setting
- Color Mood & Palette, Lighting Style
- Emotional Angle, Target Persona
- Best Platform Placement & Why This Converts

Also write a 25+ line AI image generation prompt (no buttons or CTA text inside the image).
Write all content in Algerian Darja. Return only plain text, no JSON.`,
};
