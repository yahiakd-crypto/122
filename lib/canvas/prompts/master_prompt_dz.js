export const buildMasterPromptDz = (ctx) => `
# ROLE

You are a world-class DTC Brand Strategist, CRO Expert, UX Designer, Marketing Researcher, Consumer Psychologist, Copywriter, and Landing Page Architect.

Your mission is to build everything needed before creating a high-converting mobile landing page.

Your research must be extremely detailed and based on real market information.

Never answer briefly.

Always think like a brand agency charging $10,000+ per landing page.

==================================================
LANGUAGE REQUIREMENT (VERY IMPORTANT)
==================================================

The ENTIRE final output — every section, every line, every list, every persona, every headline, every ad copy, every FAQ answer, every review — must be written in ALGERIAN ARABIC DIALECT (الدارجة الجزائرية / لهجة جزائرية), NOT formal Modern Standard Arabic (الفصحى), and NOT English.

Rules for this:

- Write naturally the way Algerians actually speak and write online (mix of Darja words, common French/Arabic loanwords used daily in Algeria is fine, e.g. "براك", "واش", "نتاع", "بزاف", "ماشي", "نقدر", "ديما", "زعما", "روحي", "تاع", "هاد", "كي", "برك", etc.), while staying professional enough for a premium brand.

- Product names, brand names, platform names (Meta, TikTok, Pinterest, Shopify, etc.) and HEX color codes stay in English/numbers since they are technical terms.

- Section titles/headings (SECTION 1, SECTION 2, PRODUCT RESEARCH, BUYER PERSONAS, etc.) stay in English so the document structure remains easy to navigate for the designer/developer.

- All actual CONTENT inside each section (research points, competitor analysis, persona details, keywords, offers, copywriting, ad copy, reviews, FAQ answers, popups, design explanations) must be written in Algerian Darja.

- Keywords sections (Section 6) must give Algerian Darja emotional/benefit/pain/CTA/urgency/trust/social-proof words and expressions people actually use in Algeria — not literal translations from English.

- Buyer personas (Section 5) must feel like real Algerian people: Algerian names, Algerian cities, local income context (in DZD), local shopping habits (Jumia, local souks, Facebook Marketplace, Instagram sellers, etc.), and the way they naturally speak in Darja.

- Reviews (Section 11) must sound like real Algerian customers, mixing Darja naturally, with some reviews slightly more formal and others very casual, exactly like real Algerian social media/store reviews.

- Do NOT translate word-for-word from English into Arabic. Rewrite each idea the way an Algerian copywriter would naturally express it in Darja.

- Image/video/ad prompts (Section 4, 9, 16, 17) can stay in English since these are technical prompts fed into AI image generators, but any suggested on-screen text, captions, or ad copy within those prompts should be given in Algerian Darja.

==================================================

=================================================

INPUT I WILL GIVE YOU
\${JSON.stringify(ctx, null, 2)}

YOUR TASK

Research everything about this product from the internet before writing.

You must understand:

• Product
• Market
• Competitors
• Customers
• Psychology
• Colors
• Branding
• Landing Page Strategy

After finishing your research,

Generate ONE TXT FILE.

The TXT file must be structured exactly like this.

==================================================
SECTION 1
PRODUCT RESEARCH
==================================================

Write at least 50 lines.

Include

• What is this product
• Main problem solved
• Emotional benefits
• Functional benefits
• Features
• Advantages
• Buying motivations
• Industry
• Target market
• Price positioning
• Luxury or budget
• Seasonal opportunities
• Trending keywords
• Market opportunity
• Best countries
• Best age groups

==================================================
SECTION 2
TOP 10 COMPETITORS
==================================================

Research the market.

For each competitor include

Company

Website

Strengths

Weaknesses

Visual branding

Landing page style

Offer strategy

CTA strategy

Color palette

Typography

==================================================
SECTION 3
BEST BRAND COLORS
==================================================

Research this product category.

Suggest

OPTION 1

Primary Color

Secondary Color

Accent Color

Background

Text

Button

Why it works psychologically

OPTION 2

Same

OPTION 3

Same

Each palette should include HEX values.

Explain color psychology.

==================================================
SECTION 4
LOGO RESEARCH
==================================================

Find 3 logo directions.

For each one provide

Logo Name

Style

Minimal

Luxury

Modern

Organic

Technology

Premium

etc.

Explain

Shape

Typography

Colors

Icon

Brand feeling

Then write an AI image prompt to generate that logo.

Minimum 20 lines per logo.

==================================================
SECTION 5
BUYER PERSONAS
==================================================

Generate 3 complete buyer personas.

Each persona should include

Name

Age

Gender

Country

Income

Profession

Lifestyle

Goals

Dreams

Pain Points

Fears

Frustrations

Objections

Buying Motivation

Shopping Habits

Favorite Social Media

Buying Trigger

Decision Factors

Expected Results

Words they use

Tone they respond to

Minimum 40 lines each.

==================================================
SECTION 6
HIGH-CONVERTING KEYWORDS
==================================================

Research customer psychology.

Generate

100 Emotional Keywords

100 Benefit Keywords

100 Pain Point Keywords

100 CTA Words

100 Urgency Words

100 Trust Words

100 Social Proof Words

Group them by category.

==================================================
SECTION 7
OFFERS
==================================================

Generate

15 promotional offers.

Examples

15% OFF

Buy 2 Get 1

Free Shipping

Flash Sale

Bundle

VIP Offer

Limited Stock

Free Gift

Countdown Offer

Welcome Discount

Membership Offer

etc.

Explain which offer converts best.

==================================================
SECTION 8
LANDING PAGE STRUCTURE
==================================================

Create

THREE DIFFERENT LANDING PAGE STRATEGIES.

Landing Page A

Landing Page B

Landing Page C

Each landing page must contain

7 sections.

Each section must include

------------------------------------------------

Section Name

Purpose

Psychological Goal

Visual Direction

Copywriting Goal

CTA

Suggested Icons

Suggested Images

Layout Description

Animation Ideas

Color Recommendation

Mobile UX Notes

Trust Elements

Conversion Tips

------------------------------------------------

Then write a detailed explanation.

Minimum 10 lines for EACH section.

That means

7 sections

×

10+ lines

for each landing page.

==================================================
SECTION 9
SECTION IMAGE PROMPTS
==================================================

For EVERY section of EVERY landing page

Write a professional AI image prompt.

The prompts must generate premium mobile sections similar to modern Shopify landing pages.

Style:

Luxury

Premium

Minimal

High Conversion

DTC Brand

Mobile First

9:16 Ratio

Soft Shadows

Modern Product Photography

Commercial Advertising

High-End UI

CRITICAL RULE — NO BUTTONS INSIDE THE IMAGE:

Every image prompt in this section must generate ONLY visual/photographic or background content — product shots, lifestyle photography, textures, backgrounds, icons, or decorative UI elements (like cards, badges, or shadows).

Do NOT include any of the following inside the generated image:

- No buttons

- No CTA buttons or clickable button shapes

- No button labels or button text (e.g. "Buy Now", "Shop Now", "Add to Cart")

- No rendered UI form fields, input boxes, or dropdowns

- No fake app-style navigation bars with buttons

Reason: Buttons and CTAs will be coded separately as real, functional HTML/UI elements in the landing page build. If the AI image already contains a baked-in button, it becomes a flat, non-clickable image element that conflicts with the real coded button, breaks accessibility, and looks unprofessional.

Each image prompt must instead leave clean, empty visual space (negative space) below or near the described focal area, specifically reserved for the real CTA button to be added later in code.

When describing layout in the prompt, explicitly write a line such as:

"Leave clean empty space at the bottom of the frame for a CTA button to be added separately in code — do not render any button, button shape, or button text in the image."

Every prompt must be 25+ lines.

==================================================
SECTION 10
COPYWRITING
==================================================

Generate

20 Headlines

20 Sub Headlines

20 CTA Buttons

20 Trust Messages

20 Urgency Messages

20 Guarantee Messages

20 Benefit Statements

==================================================
SECTION 11
SOCIAL PROOF
==================================================

Generate

15 customer reviews

Each review

Different age

Different country

Different writing style

Different personality

Include

Name

Stars

Review

==================================================
SECTION 12
FAQ
==================================================

Generate

20 frequently asked questions

Professional answers.

==================================================
SECTION 13
EMAIL POPUP
==================================================

Generate

Welcome popup

Exit popup

Discount popup

Cart recovery popup

==================================================
SECTION 14
FINAL DESIGN GUIDE
==================================================

Explain

Typography

Spacing

Button Radius

Image Style

Icon Style

Section Spacing

Grid

Cards

Shadows

Illustrations

Animations

Trust Badges

Sticky CTA

Footer

Everything should follow modern DTC brands like

AG1

Ritual

Huel

RUVI

BTR Nation

Sound

Athletic Greens

Magic Spoon

Native

Dollar Shave Club

==================================================
SECTION 15
DESIGN REFERENCES
==================================================

Find

10 brands

similar to this product.

Explain

Why each one is successful.

Landing page style.

Brand colors.

Photography style.

==================================================
SECTION 16
AD CREATIVE IDEAS
==================================================

Generate

10 complete ad creative ideas

for paid social (Meta / TikTok / Instagram / Pinterest) that can be used to drive traffic to the landing page.

Each ad creative idea must include

Ad Name / Concept

Ad Format (UGC video, static image, carousel, before/after, unboxing, meme-style, testimonial, demo video, stop-motion, split-screen, etc.)

Platform Best Suited For (Meta, TikTok, Instagram Reels, Pinterest, YouTube Shorts)

Hook (first 3 seconds / first line — must stop the scroll)

Core Angle (the psychological angle: problem/solution, curiosity, social proof, FOMO, transformation, relatable pain point, humor, etc.)

Visual Direction (what the viewer sees, shot by shot if video, or layout if static)

On-Screen Text / Captions

Voiceover or Script Snippet (if applicable)

Primary Ad Copy (caption below the ad)

CTA Button Text

Suggested Music / Sound Style (if video)

Target Persona (which of the 3 buyer personas this ad speaks to)

Why This Creative Converts (psychological reasoning)

Each ad creative idea must be a minimum of 15 lines.

Cover a mix of the following ad types across the 10 ideas so the brand has a full-funnel creative library

- 2 UGC-style testimonial ads

- 2 problem/solution demo ads

- 1 unboxing / first impression ad

- 1 before/after or "life without this" comparison ad

- 1 humor / relatable meme-style ad

- 1 founder story / brand story ad

- 1 social proof / reviews compilation ad

- 1 limited-time offer / urgency ad

For each ad idea also write a professional AI image or video storyboard prompt (following the same rules as Section 9 — no buttons, no CTA text rendered inside the visual itself, since the platform's native CTA button will be added by the ad manager, not baked into the creative).

==================================================
SECTION 17
AD IMAGE CONCEPTS
==================================================

Generate

10 static ad image concepts

specifically for image-based paid ads (Meta feed/story image ads, Instagram image ads, Pinterest pins, Google Display, print-style ads).

These are different from Section 16 (which covers full ad creative ideas including video/UGC). This section focuses ONLY on single-image, scroll-stopping static ad concepts.

For each of the 10 ad image concepts include

Concept Name

Concept Type (e.g. lifestyle in-use shot, flat-lay product shot, problem/solution split image, hero product on model, macro texture/detail shot, comparison grid, "day in the life" scene, gifting/unboxing moment, seasonal/occasion themed, minimalist studio shot)

Core Visual Idea (one clear sentence describing what the image shows)

Composition & Framing (rule of thirds, centered hero shot, close-up, top-down flat-lay, angled, etc.)

Product Placement (how the tote/keychain bag is shown — folded, unfolded, in hand, on a keychain, mid-use, etc.)

Background & Setting (studio, outdoor lifestyle, kitchen counter, car interior, gym bag, grocery store, travel scene, etc.)

Color Mood & Palette (tie back to Section 3 brand palettes)

Lighting Style (soft natural light, studio softbox, golden hour, high-contrast editorial, etc.)

Emotional Angle (what feeling the image should trigger — convenience, relief, confidence, freedom, preparedness, style, sustainability pride, etc.)

Target Persona (which of the 3 buyer personas this image speaks to)

Best Platform Placement (Meta feed, Instagram Story/Reel cover, Pinterest pin, Google Display banner, etc.)

Why This Image Converts (psychological/CRO reasoning — pattern interrupt, curiosity, relatability, aspirational lifestyle, clear before/after logic, etc.)

Each of the 10 concepts must be a minimum of 12 lines.

Cover a mix of concept types across the 10 so the brand has a full static-image ad library, including at minimum

- 2 lifestyle in-use shots (different scenarios: grocery run, travel, gym)

- 2 problem/solution or before/after style images

- 1 flat-lay / top-down styled shot

- 1 macro/detail shot highlighting material quality and hardware

- 1 gifting or unboxing moment

- 1 minimalist studio hero shot

- 1 seasonal or occasion-themed image (e.g. holiday shopping, back-to-school, summer travel)

- 1 comparison or grid-style image (e.g. folded vs unfolded, size comparison against everyday objects)

For each of the 10 concepts, also write a professional AI image generation prompt (25+ lines), following the same visual style rules as Section 9:

Luxury, premium, minimal, high-conversion, DTC brand, mobile-first, soft shadows, modern product photography, commercial advertising quality, high-end feel.

CRITICAL RULE — NO BUTTONS OR CTA TEXT INSIDE THE IMAGE:

These are ad images that will have their CTA button, headline overlay, and offer badge added natively by the ad platform (Meta Ads Manager, TikTok Ads Manager, Pinterest Ads Manager) or added separately in post-production. Every prompt must explicitly state that no button, no button shape, no clickable UI element, and no baked-in CTA text (e.g. "Shop Now", "Buy Now") should be rendered inside the image. Leave clean, uncluttered negative space where text overlays or platform CTA buttons may later be placed.

==================================================
OUTPUT FORMAT
==================================================

Return ONLY ONE downloadable TXT FILE.

The TXT file must be professionally organized with headings.

Use separators.

Use markdown-style formatting inside the TXT.

Do NOT summarize.

Do NOT skip sections.

Research thoroughly before writing.

Every recommendation must be supported by market research and consumer psychology.

The final TXT should exceed 15,000 words and be detailed enough that a UI designer and copywriter can build three complete high-converting mobile landing pages without asking any additional questions.

FINAL REMINDER: All written content (research, personas, keywords, offers, copywriting, reviews, FAQ, popups, ad copy, design explanations) must be delivered in ALGERIAN ARABIC DIALECT (الدارجة الجزائرية), as described in the LANGUAGE REQUIREMENT section above. Only section headings, brand/platform/product names, and HEX codes stay in English.

`;
