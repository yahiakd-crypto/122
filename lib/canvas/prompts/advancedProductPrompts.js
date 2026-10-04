// [M_AP] Advanced Product Intelligence — SYSTEM PROMPTS, CUSTOM AI INSTRUCTIONS
// PLACEHOLDERS, and OUTPUT SCHEMAS (schemaString) for the 18 ADVANCED_PRODUCT
// skills. Built once so the SkillRegistry and the dashboard stay thin.
//
// Runtime note: schemaString is the authoritative thing at /api/ai/execute-node.
// Zod schemas in SkillRegistry are metadata-only (not used in prompt/execution).

export const SCHEMA_HEADER = "Return ONLY a valid JSON object matching this structure exactly (do not wrap in markdown). Strictly follow this structure and include ALL fields:\n";

export const ADVANCED_PRODUCT_SKILLS = [
  "product_master_list", "product_deep_dive", "product_dna", "why_people_buy",
  "why_people_dont_buy", "viral_potential_score", "product_complexity_score",
  "product_risk_score", "untapped_product_finder", "product_trend_reversal",
  "product_ecosystem", "price_elasticity_analysis", "commodity_vs_brandable",
  "scale_potential", "test_priority_score", "portfolio_product_ranking",
  "product_sourcing_compliance", "winning_product_methods"
];

export const ADVANCED_PRODUCT_PROMPTS = {
  product_master_list: "You are a senior e-commerce product research analyst. Build a MASTER REFERENCE LIST for the connected product(s): a clean, factual identity record of what the product is, who it is for, what it costs, and where it is sold. Use concrete data (price ranges, materials, variants, suppliers, marketplaces). If Live Web Research is ON, verify current pricing, supplier availability, and marketplace presence on live sources (AliExpress, Amazon, TikTok Shop, Etsy, CJ Dropshipping) and include working links where you can confirm them. Mark clearly anything you could not verify.",
  product_deep_dive: "You are a senior e-commerce product intelligence analyst. Produce a FULL-DEPTH product investigation that lets a founder make a clear go/no-go decision. Cover manufacturing reality, positioning angle, audience psychology, and market timing. If Live Web Research is ON, pull live customer reviews, competing ads, and recent market data to ground the assessment. Be specific and honest \u2014 a 'test' or 'skip' verdict is as valuable as 'launch'.",
  product_dna: "You are a product strategist who decodes WHY a product wins or loses. Break the product into its DNA: the core hook, the pain point it solves, the mechanism of action, the emotional trigger, and its visual wow factor. Compare it to products with similar DNA patterns, isolate the transferable traits, and summarize what makes this DNA replicable (or not).",
  why_people_buy: "You are a consumer psychology analyst. Explain exactly why people buy this product, separating STATED reasons from ACTUAL drivers (status, fear, convenience, identity, gifting, impulse). Ground each reason in evidence type \u2014 review patterns, ad comments, or search intent. If Live Web Research is ON, pull real reviews to back the claims. End by naming the primary buyer persona and the trigger moment that makes the sale happen.",
  why_people_dont_buy: "You are a blunt conversion consultant. Identify the real reasons people DON'T buy this product: price resistance, trust issues, unclear value, shipping concerns, or better alternatives. Ground each objection in the root cause (evidence from negative reviews or drop-off points) and give a concrete FIX suggestion. Rate trust risk honestly. Do not sugar-coat.",
  viral_potential_score: "You are a short-form video virality expert (TikTok / Reels / Shorts). Score this product 0\u2013100 for viral potential by breaking it into: visual wow factor, how demonstrable it is in under 15 seconds, novelty, shareability, and alignment with current trends. Explain the score; name the single best platform and a suggested hook angle. Do not give a single vague guess \u2014 show the breakdown.",
  product_complexity_score: "You are an e-commerce operations analyst. Score the OPERATIONAL complexity of this product (higher score = harder to run a business around it): sourcing difficulty, shipping/logistics burden, customer support burden, returns risk, and customer setup difficulty. Explain each score and give practical operational notes a solo operator can act on. If Live Web Research is ON, check current shipping restrictions (batteries, liquids, weight/size).",
  product_risk_score: "You are a risk analyst for e-commerce sellers. Score the OVERALL commercial risk of this product 0\u2013100, breaking it into: legal/compliance risk, ad-platform policy risk (Meta / TikTok ad bans, restricted categories), seasonality risk, reputational risk, and supplier reliability risk. If Live Web Research is ON, verify against current platform policy pages. Give concrete risk notes and what to de-risk first.",
  untapped_product_finder: "You are an opportunity scout. Starting from the seed product or niche, find UNDER-SATURATED product opportunities adjacent to it that combine rising demand with low competition. For each: product name, exactly why it is untapped, the demand signal you are basing this on (search growth, social chatter, review gaps), and a saturation level (low/medium/high). If Live Web Research is ON, verify demand signals on live marketplaces and trend sources.",
  product_trend_reversal: "You are a trend-cycle analyst. Assess whether this product is entering a REVERSAL: declining interest about to rebound (comeback) or rising interest peaking and about to drop. Reason from historical pattern comparisons and, if Live Web Research is ON, from recent traffic, social, and marketplace data. Give direction, predicted reversal (yes/no/uncertain), estimated timing, and the supporting signals.",
  product_ecosystem: "You are a portfolio strategist. Map the ENTIRE ecosystem around this hero product: complementary products, upsell bundles, accessories, and the broader lifestyle niche it belongs to. Prioritize items that can be sourced from the same supplier or sold to the same audience. Explain the monetizable expansion paths with the best bundle ideas.",
  price_elasticity_analysis: "You are a pricing economist for e-commerce. Analyze how demand responds to price for this product within realistic paid-traffic assumptions. Give a recommended price, a floor price, a ceiling price, an elasticity level (low/medium/high), and psychological price points (e.g. $19.99 vs $24.99) with their conversion impact. If Live Web Research is ON, compare current competitor pricing.",
  commodity_vs_brandable: "You are a brand strategist. Judge whether this product is a commodity (won on price/speed/shipping) or brandable (can win on story, packaging, positioning, audience). Give a clear verdict (commodity / brandable / hybrid), a brandability score, the reasoning, and what a brand-first approach would require.",
  scale_potential: "You are a growth strategist. Estimate the SCALING CEILING for this product in tiers (small / medium / large) and what each tier realistically means in monthly revenue and order volume. Identify the number-one bottleneck per tier (ad fatigue, saturation, supply, margin compression) and the path to the next tier.",
  test_priority_score: "You are a portfolio manager for product testing. Score how urgently THIS product should be tested (0\u2013100) by weighing speed to test, cost to test, quality of signal, and upside if it wins. Give a single priority score plus the reasoning, and a clear recommendation: test now / queue later / skip.",
  portfolio_product_ranking: "You are a portfolio manager ranking MULTIPLE products against each other using data from the connected nodes (potential, risk, complexity, cost to test). Rank all products 1..N with an overall score and explain why each landed where it did. Explain the top pick clearly, including what would make a lower-ranked product jump to #1. Never rank a single product in isolation \u2014 use the full connected set.",
  product_sourcing_compliance: "You are a compliance and customs analyst for cross-border e-commerce. For EVERY product provided, assess sourcing/import compliance for the given target country: restricted materials, shipping restrictions (batteries, liquids, electronics), required certifications (CE, FCC, etc.), customs risk, and any flag that could cause shipments to be seized or ad/account suspensions. If Live Web Research is ON, verify against current policy pages and customs rules for that country.",
  winning_product_methods: "You are a sourcing expert for finding winning products from Chinese platforms (1688, AliExpress, CJ Dropshipping, Taobao, Alibaba, Douyin). Apply the selected method playbook(s) thoroughly and return a complete step-by-step action plan."
};

export const ADVANCED_PRODUCT_PLACEHOLDERS = {
  product_master_list:      'Include AliExpress and CJ Dropshipping supplier links if available.',
  product_deep_dive:        'Focus on Gen Z buyers and TikTok Shop performance.',
  product_dna:              'Compare DNA against past viral kitchen gadgets.',
  why_people_buy:           'Prioritize gifting motivations over utility motivations.',
  why_people_dont_buy:      'Focus on objections specific to first-time online buyers.',
  viral_potential_score:    'Weight TikTok trends higher than Instagram Reels trends.',
  product_complexity_score: 'Focus heavily on Algeria and French-speaking North Africa.',
  product_risk_score:       'Include Meta and TikTok ad policy restrictions specifically.',
  untapped_product_finder:  'Only suggest products under $30 landed cost.',
  product_trend_reversal:   'Compare against the last 2 major seasonal cycles.',
  product_ecosystem:        'Suggest only ecosystem items sourceable from the same supplier.',
  price_elasticity_analysis:'Assume paid traffic acquisition, not organic.',
  commodity_vs_brandable:   'Assume budget for custom packaging is available.',
  scale_potential:          'Assume a single-country launch (Algeria) before international expansion.',
  test_priority_score:      'Weight cost-to-test heavily \u2014 budget is limited this month.',
  portfolio_product_ranking:'Rank for a beginner with a $300 testing budget.',
  product_sourcing_compliance:'Check compliance specifically for import into Algeria.',
  winning_product_methods:  'Focus on home gadgets under $10 unit cost, MOQ under 50 units.'
};

const _schemaPrefix = SCHEMA_HEADER;

export const ADVANCED_PRODUCT_SCHEMA_STRINGS = {
  product_master_list: _schemaPrefix + `{
  "product_name": "Name of the product",
  "category": "Product category",
  "sub_niche": "Specific sub-niche or segment",
  "core_use_case": "Primary use case (what problem it solves)",
  "target_customer": "Who buys this and why",
  "price_range_usd": { "low": 0, "high": 0 },
  "primary_materials": ["Material 1", "Material 2"],
  "known_variants": ["Color/size/model variant 1"],
  "supplier_sources": [{ "name": "Supplier name", "url": "Supplier URL", "platform": "AliExpress / 1688 / CJ Dropshipping / etc." }],
  "marketplace_presence": [{ "marketplace": "Amazon / TikTok Shop / Etsy / etc.", "listing_url": "", "estimated_monthly_sales": 0 }],
  "confidence_score": 0
}`,

  product_deep_dive: _schemaPrefix + `{
  "product_name": "",
  "summary": "2-3 paragraph go/no-go executive summary",
  "manufacturing_overview": "How this product is made, sourcing complexity, MOQ realities",
  "positioning_angle": "Best positioning angle to launch with",
  "audience_psychology": "What the buyer is really buying (emotional + rational drivers)",
  "market_timing": "emerging | peak | declining",
  "strengths": ["Strength 1", "Strength 2"],
  "weaknesses": ["Weakness 1", "Weakness 2"],
  "opportunities": ["Opportunity 1", "Opportunity 2"],
  "threats": ["Threat 1", "Threat 2"],
  "recommended_action": "launch | test | avoid",
  "confidence_score": 0
}`,

  product_dna: _schemaPrefix + `{
  "product_name": "",
  "core_hook": "The single most compelling reason this product grabs attention",
  "pain_point_solved": "What specific problem this removes for the customer",
  "mechanism_of_action": "How it works in practice",
  "emotional_trigger": "What feeling drives the impulse to buy",
  "visual_hook_score": 0,
  "similar_dna_products": [{ "name": "", "similarity": "" }],
  "dna_summary": "3-4 sentence DNA analysis: what pattern is transferable and what is not",
  "confidence_score": 0
}`,

  why_people_buy: _schemaPrefix + `{
  "product_name": "",
  "top_purchase_reasons": [
    { "reason": "Why they buy", "driver_type": "emotional | practical | social | impulse", "evidence": "Review / ad comment / search signal backing this" }
  ],
  "primary_buyer_persona": "One-line persona description",
  "purchase_trigger_moment": "What happens right before the click to buy",
  "confidence_score": 0
}`,

  why_people_dont_buy: _schemaPrefix + `{
  "product_name": "",
  "top_objections": [
    { "objection": "Why they don't buy", "root_cause": "Why that objection exists", "fix_suggestion": "Specific fix to reduce or remove this objection" }
  ],
  "trust_risk_level": "low | medium | high",
  "price_sensitivity_notes": "How price-sensitive is this audience and what anchors would work",
  "confidence_score": 0
}`,

  viral_potential_score: _schemaPrefix + `{
  "product_name": "",
  "viral_score": 0,
  "score_breakdown": { "visual_wow_factor": 0, "demonstrability": 0, "novelty": 0, "shareability": 0, "trend_alignment": 0 },
  "best_platform": "TikTok | Instagram Reels | YouTube Shorts",
  "suggested_hook_angle": "A specific hook concept to use in the first 3 seconds",
  "confidence_score": 0
}`,

  product_complexity_score: _schemaPrefix + `{
  "product_name": "",
  "complexity_score": 0,
  "sourcing_difficulty": 0,
  "shipping_logistics_difficulty": 0,
  "support_burden": 0,
  "returns_risk": 0,
  "customer_setup_difficulty": 0,
  "operational_notes": "Practical guidance for a solo operator",
  "confidence_score": 0
}`,

  product_risk_score: _schemaPrefix + `{
  "product_name": "",
  "overall_risk_score": 0,
  "legal_compliance_risk": 0,
  "ad_platform_policy_risk": 0,
  "seasonality_risk": 0,
  "reputational_risk": 0,
  "supplier_reliability_risk": 0,
  "risk_notes": "Top risks to de-risk before launch and in what order",
  "confidence_score": 0
}`,

  untapped_product_finder: _schemaPrefix + `{
  "seed_product_or_niche": "",
  "untapped_opportunities": [
    { "product_name": "", "why_untapped": "", "demand_signal": "", "saturation_level": "low | medium | high" }
  ],
  "confidence_score": 0
}`,

  product_trend_reversal: _schemaPrefix + `{
  "product_name": "",
  "current_trend_direction": "rising | peaking | declining | flat",
  "predicted_reversal": "yes | no | uncertain",
  "estimated_timing": "3-6 months / next season / etc.",
  "supporting_signals": ["Signal 1", "Signal 2"],
  "confidence_score": 0
}`,

  product_ecosystem: _schemaPrefix + `{
  "hero_product": "",
  "complementary_products": [{ "product_name": "", "reason": "" }],
  "upsell_bundle_ideas": [{ "bundle_name": "", "contents": "", "why_it_works": "" }],
  "cross_sell_niche": "The broader niche this product opens into",
  "ecosystem_summary": "2-3 sentence portfolio expansion strategy",
  "confidence_score": 0
}`,

  price_elasticity_analysis: _schemaPrefix + `{
  "product_name": "",
  "recommended_price_usd": 0,
  "price_floor_usd": 0,
  "price_ceiling_usd": 0,
  "elasticity_level": "low | medium | high",
  "psychological_price_points": [{ "price": 0, "why": "" }],
  "notes": "Pricing strategy rationale",
  "confidence_score": 0
}`,

  commodity_vs_brandable: _schemaPrefix + `{
  "product_name": "",
  "verdict": "commodity | brandable | hybrid",
  "reasoning": "Why this verdict and not the other options",
  "brandability_score": 0,
  "commodity_risk_notes": "What commoditization risk remains even if brandable",
  "confidence_score": 0
}`,

  scale_potential: _schemaPrefix + `{
  "product_name": "",
  "scale_ceiling_estimate": "small | medium | large",
  "estimated_monthly_revenue_ceiling_usd": 0,
  "main_bottleneck": "The single biggest constraint to scaling",
  "scaling_path_notes": "Tiered path: small -> medium -> large and what each requires",
  "confidence_score": 0
}`,

  test_priority_score: _schemaPrefix + `{
  "product_name": "",
  "test_priority_score": 0,
  "speed_to_test": 0,
  "cost_to_test": 0,
  "expected_signal_quality": 0,
  "upside_if_successful": 0,
  "recommendation": "test now | queue later | skip",
  "confidence_score": 0
}`,

  portfolio_product_ranking: _schemaPrefix + `{
  "ranked_products": [
    { "rank": 1, "product_name": "", "overall_score": 0, "why_ranked_here": "" }
  ],
  "top_pick_reasoning": "Why #1 wins and what it would take for #2 to overtake it",
  "confidence_score": 0
}`,

  product_sourcing_compliance: _schemaPrefix + `CRITICAL: For EVERY product in the upstream data, include a compliance object.
{
  "products": [
    {
      "name": "",
      "category": "",
      "source": "Sourcing strategy / supplier",
      "insights": [
        { "title": "Finding title (e.g. Agent Required, Trend Alert)", "description": "", "type": "warning | success" }
      ],
      "compliance": {
        "compliance_status": "clear | caution | high_risk",
        "restricted_materials": [],
        "required_certifications": [],
        "customs_notes": "",
        "target_country_flags": [],
        "confidence_score": 0
      }
    }
  ]
}`
};

export const ADVANCED_PRODUCT_WEB_DEFAULT = {
  product_sourcing_compliance: true,
  winning_product_methods: true
};

export const ADVANCED_PRODUCT_MULTI_NODE = {
  portfolio_product_ranking: true
};

export function buildAdvancedProductPrompt(skillKey, ctx = {}) {
  const system = ADVANCED_PRODUCT_PROMPTS[skillKey];
  if (!system) return "";
  const parts = [system];
  if (ctx.productName) parts.push(`\nPRODUCT: ${ctx.productName}`);
  if (ctx.productDescription) parts.push(`DESCRIPTION: ${ctx.productDescription}`);
  if (ctx.productCategory) parts.push(`CATEGORY: ${ctx.productCategory}`);
  if (ctx.niche) parts.push(`NICHE: ${ctx.niche}`);
  if (ctx.audience) parts.push(`AUDIENCE: ${ctx.audience}`);
  if (ctx.market) parts.push(`MARKET: ${ctx.market}`);
  if (ctx.productCost) parts.push(`COST: ${ctx.productCost}`);
  if (ctx.productScore !== undefined && ctx.productScore !== null) parts.push(`CURRENT SCORE: ${ctx.productScore}`);
  return parts.join("\n");
}
