import { z } from "zod";
import { buildGrowthLoopPrompt } from "./prompts/ecommerce_growth_loop_prompt";
import { buildNoseHairTrimmerLaunchPrompt } from "./prompts/nose_hair_trimmer_launch";
import { buildFullFunnelWorkflowMasterPrompt } from "./prompts/full_funnel_workflow_master";
import { buildStageIntelligencePrompt } from "./prompts/stage_intelligence_prompts";

import { buildMasterPromptDz } from "./prompts/master_prompt_dz";

import { buildLiquidPrompt } from "./prompts/liquid_prompt";

import { buildLandingStrategyPrompt } from "./prompts/landing_prompt";

import { buildAdvancedProductPrompt, ADVANCED_PRODUCT_PLACEHOLDERS } from "./prompts/advancedProductPrompts";

import { buildWinningDigitalProductPrompt } from "./prompts/winning_digital_product_prompt";



// [F_buildCompanyPlanPrompt] Builds the instruction prompt for ALL company-plan skills (LLC, LTD, Hong Kong, UAE, Estonia).

// Adapts the plan to the connected product/niche context when available.

function buildCompanyPlanPrompt(ctx = {}, cfg = {}) {

  const { type, country, structure, registrar, bankPrompt, taxDeadlines } = cfg;

  const products = (ctx.productName || "").trim() ? `I sell these products: ${ctx.productName}.` : "I am starting an e-commerce / dropshipping business.";

  return `Act as a ${country} company formation AND non-resident business banking expert for an online e-commerce seller based in Algeria (owner is a FOREIGN PERSON / NON-RESIDENT of ${country}).



Context: ${products}

Market: ${ctx.market || "Algeria (selling worldwide via C.O.D. and online payments)"}



Create a complete, step-by-step ${type} company plan for me, covering EXACTLY these five areas:



1. WHEN TO CREATE my company — the ideal timing (e.g. before opening a payment gateway / Stripe / PayPal / bank account / Amazon or Shopify store), how long formation takes, and what happens if I wait.

2. TAX — WHICH DAY / DEADLINE I have to pay or file taxes. ${taxDeadlines}

3. WHICH DOCUMENTS I need (passport, proof of address, formation documents, and any bank/Stripe/PayPal verification documents).

4. WHERE TO APPLY — exactly which office/website (${registrar}) and the order to apply.

5. ALL BANKS I CAN APPLY TO AS A NON-RESIDENT — every bank, neobank and fintech that opens a business account for a NON-RESIDENT owner like me (from Algeria). ${bankPrompt} For EACH one give: bank name, type (traditional bank / neobank / fintech), whether it accepts non-resident owners, minimum deposit, monthly fees, required documents (passport, proof of address, incorporation papers, etc.), and whether it works for e-commerce / Stripe / PayPal / COD dropshipping.



Give concrete dates, dollar costs where possible, and a clear step-by-step timeline I can follow today. Do NOT invent specific account numbers. If a date depends on my specific choice, use the most common/standard case as an example and tell me to confirm.`;

}



// [F_companyPlanConfigs] Per-country settings for the company-plan skills.

const COMPANY_PLAN_CONFIGS = {

  llc_company: {

    type: "US LLC", country: "the USA", structure: "Limited Liability Company",

    registrar: "state Secretary of State for the LLC (e.g. Delaware, Wyoming or Florida) and the IRS for the EIN",

    taxDeadlines: "US annual federal tax return due April 15, quarterly estimated tax payments, state franchise/annual report deadlines, and what a foreign owner must know.",

    bankPrompt: "US banks, neobanks and fintechs that open a US business account with an LLC even for non-resident foreign owners (Mercury, Relay, Brex, Wise Business, Payoneer, Stripe, Bank of America branches, and any others)."

  },

  ltd_company: {

    type: "UK LTD", country: "the UK", structure: "Private Limited Company (Ltd)",

    registrar: "Companies House (UK) for incorporation and HMRC for taxes/registration",

    taxDeadlines: "UK: corporation tax 19% payable 9 months after year end, Confirmation Statement yearly, Companies House annual confirmation, VAT registration if turnover above threshold.",

    bankPrompt: "UK banks and fintechs that open a UK business current account for a NON-RESIDENT director from Algeria (Wise Business, Revolut Business, Tide, Payoneer, HSBC/Barclays remote opening, Monzo/Starling eligibility, and any others)."

  },

  hong_kong_company: {

    type: "Hong Kong", country: "Hong Kong", structure: "Private Limited Company",

    registrar: "Hong Kong Companies Registry (incorporation) and Inland Revenue Department / Business Registration Office",

    taxDeadlines: "Hong Kong profits tax (8.25% first HKD 2M) with filing deadlines, Business Registration renewal, and yearly annual return to the Companies Registry.",

    bankPrompt: "Hong Kong banks and fintechs that open a corporate account for a NON-RESIDENT owner (HSBC, Standard Chartered, DBS, Citibank, Airwallex, Statrys, Neat, Currenxie, Payoneer, and any others)."

  },

  uae_company: {

    type: "UAE", country: "the UAE", structure: "Mainland or Free Zone company (e.g. LLC)",

    registrar: "a Free Zone authority (e.g. DMCC, Ajman, IFZA, Meydan) or the DED/MoE for mainland",

    taxDeadlines: "UAE corporate tax 9% above AED 375,000 profit, VAT registration, and free zone/mainland annual license renewal deadlines.",

    bankPrompt: "UAE banks and fintechs that open a corporate account for a FOREIGN owner (Emirates NBD, FAB, Mashreq, RAKBANK, ADCB, Wio, Mashreq Neo, Zand, and any others)."

  },

  estonia_company: {

    type: "Estonian", country: "Estonia", structure: "OÜ (private limited company) via e-Residency",

    registrar: "Estonian e-Residency portal and the Estonian Business Registry (Äriregister), plus EMTA (Tax and Customs Board)",

    taxDeadlines: "Estonia's special rule: 0% corporate tax on reinvested profits, 20% only when you pay dividends (25% sometimes), plus the annual report deadline and the small balance threshold.",

    bankPrompt: "Estonian banks and fintechs that open a corporate account for a NON-RESIDENT e-Resident from Algeria (LHV, Wise Business, Paysera, Mercury EU, Swedbank/SEB remote eligibility, and any others)."

  }

};



// [F_buildAdsOpsPrompt] Builds the prompt for the Advanced Ads Analytics strategy skills (lookalike, bidding, carousel, flexible, pixel, testing, scaling, offline conversions, marketplace).

function buildAdsOpsPrompt(ctx = {}, cfg = {}) {

  const { topic, detail } = cfg;

  const products = (ctx.productName || "").trim() ? `My product: ${ctx.productName}.` : "I sell products via Facebook/Instagram + Google ads (e-commerce / dropshipping).";

  return `Act as a world-class Meta (Facebook/Instagram) ads strategist for: ${products}



I need a complete, actionable ${topic} strategy.



Topic detail: ${detail}



Cover ALL of these in your answer:

- What ${topic} is and exactly WHEN to use it (not just what it is)

- Exact step-by-step settings to apply in Ads Manager Today

- Concrete numbers, budgets and targets to watch (in any currency — use USD)

- The 3-5 most common mistakes to avoid

- A clear action plan: what to do TODAY, in 24 hours, and in a week



Be realistic for a small budget (start-ups with $10-50/day). Format the final response as JSON with "keyPoints" (bullets of important concepts) and "recommendations" (clear ordered actions). Justify each point with numbers and logic.`;

}



// [F_adsOpsConfigs] Per-topic settings for the Advanced Ads Analytics strategy skills.

const ADS_OPS_CONFIGS = {

  lookalike_audience_strategy: {

    topic: "LOOKALIKE AUDIENCE strategy",

    detail: "How to build and scale Meta lookalike audiences (1%, 2%, 3%, 5%, 10%) from sources like the pixel, custom audiences, purchases or email lists, for a small COD/e-commerce shop in Algeria. Which source gives the best results, how many countries to include, and how to structure the account around lookalikes."

  },

  bid_cost_cap_strategy: {

    topic: "BID CAP / COST CAP strategy",

    detail: "Meta bid controls (Lowest cost, Bid cap, Cost cap) — when to use each, exact bid/cost cap values to start with, how to raise/lower them without killing delivery, and day-by-day rules for a small-budget store."

  },

  carousel_ads_strategy: {

    topic: "CAROUSEL ADS strategy",

    detail: "How to build winning carousel ads: which cards to use (products vs features vs FAQ), order of cards, CTA on each card, when carousel beats single image/video, and testing carousels with catalog ads."

  },

  flexible_ads_strategy: {

    topic: "FLEXIBLE ADS strategy",

    detail: "Meta Flexible Ads (dynamic creative that mixes your image/video/carousel + catalog + headline + description and finds the best combination) — when to enable, how many ad formats to give it, and how to read Flexible Ads results."

  },

  pixel_events_strategy: {

    topic: "PIXEL EVENTS / tracking strategy",

    detail: "Meta Pixel + Conversions API setup: minimum events to track for e-commerce (ViewContent, AddToCart, Purchase), event priorities, deduplication, and how good tracking feeds the algorithm so CPM/CPA drops."

  },

  ad_testing_plan: {

    topic: "AD TESTING plan",

    detail: "A realistic testing system: how many ads/ad sets/campaigns to test per week on a $10-50/day budget, variable testing (only change 1 thing), test duration rules, kill/pause criteria (by CTR, CPC, ROAS), and how to re-test winners."

  },

  campaign_scaling_plan: {

    topic: "CAMPAIGN SCALING plan",

    detail: "How to scale a winning campaign without breaking it: budget increase rules (10-20% per day), duplicate vs raise budget, when to scale by budget vs audience vs countries, and when scaling kills performance."

  },

  offline_conversions_strategy: {

    topic: "OFFLINE CONVERSIONS strategy",

    detail: "Facebook Offsite Conversions / offline conversion sets for COD business: how to upload offline purchase data so Meta learns who actually pays, which events to pass (confirmed order, successful delivery, payment), and expected impact on CPA."

  },

  marketplace_expansion: {

    topic: "MARKETPLACE selling strategy",

    detail: "Where and how to sell beyond my own store: marketplaces (Amazon, Noon/UAE, Jumia, AliExpress-style local ones), how marketplace ads vs my store ads compare, and how to combine marketplace presence with my shop."

  },

  tof_strategy: {

    topic: "TOP OF FUNNEL (TOF) strategy",

    detail: "Top-of-funnel cold traffic: prospecting campaigns, broad vs interest audiences, awareness objectives, and what raw metrics (frequency, CTR, 3s views) must look like before moving money to the middle."

  },

  mof_strategy: {

    topic: "MIDDLE OF FUNNEL (MOF) strategy",

    detail: "Middle-of-funnel warmup: retargeting website visitors, AddToCart abandoners, video viewers, engagement custom audiences, and how to structure retargeting to turn warm clicks into sales."

  },

  bof_strategy: {

    topic: "BOTTOM OF FUNNEL (BOF) strategy",

    detail: "Bottom-of-funnel conversion: highest-intent audiences (cart abandoners, past purchasers), offers to close them (discount, free shipping, guarantee), and exact conversion campaign settings."

  },

  identify_winning_ads: {

    topic: "IDENTIFY WINNING ADS strategy",

    detail: "How to spot a winning ad early and with confidence: which metrics to judge on per day 1-3-7 (CTR, CPC, ATC, ICOS, ROAS), minimum data thresholds, and how to promote the winner without wasting budget."

  },

  spc_analysis: {

    topic: "SINGLE PRODUCT CAMPAIGN (SPC) analysis",

    detail: "Single Product Campaign structure: 1 campaign / 1 ad set / 1 ad, when to use it, how many creatives per ad set to test inside an SPC, and how to analyze SPC results to pick winners and scale."

  },

  viral_organic_strategy: {

    topic: "VIRAL ORGANIC strategy",

    detail: "Organic content that sells without paid ads: TikTok/Reels/Shorts format, hooks, how many posts per week, and how to convert organic viewers into sales or feed the paid pixel."

  },

  seo_strategy: {

    topic: "SEO (Search Engine) strategy — including voice search",

    detail: "SEO for my online store: keyword research, product page/title/metas, blog content, local SEO, and voice search optimization so people find my shop on Google."

  },

  ad_scheduling: {

    topic: "AD SCHEDULING (dayparting) strategy",

    detail: "When to show ads: best hours and days for COD markets, timezone handling, budget pacing by day-part, and how to schedule without hurting the learning phase."

  },

  campaign_optimization: {

    topic: "CAMPAIGN OPTIMIZATION playbook",

    detail: "A weekly optimization routine: which metrics to check, how to pause/kill/reallocate, when to lower or raise budget/bids, creative rotation and audience checks — a full repeatable checklist."

  },

  prospecting_strategy: {

    topic: "PROSPECTING strategy",

    detail: "Prospecting campaigns that find new cold buyers: broad targeting, interest stack, Advantage+ audiences, exclusions, and budget split between prospecting and retargeting."

  },

  retargeting_strategy: {

    topic: "RETARGETING strategy",

    detail: "Separate retargeting from the funnel: pixel-based custom audiences (visitors 7/14/30 days, AddToCart, ViewContent), correct campaign structure and budget, and ads that make retargeting convert (offers, urgency, social proof)."

  },

  remarketing_strategy: {

    topic: "REMARKETING strategy (email/SMS + cross-channel)",

    detail: "Remarketing beyond Meta: email/SMS flows (abandoned cart, order confirmation, win-back), WhatsApp recents, and Google Remarketing — how to combine N-channel remarketing with Meta ads for COD stores."

  },

  pixel_training: {

    topic: "TRAINING THE PIXEL strategy",

    detail: "How to train Meta's pixel/algorithm so it learns buyers faster: event quality, minimum conversions before trusting, best audiences for learning (broad/Advantage+), avoiding pixel-priming mistakes, and how long cold-start learning really takes at small budgets."

  }

};



// [F_skillIcon] Picks a memorable lucide icon from a skill label (falls back to the category icon).

function skillIcon(label, fallback) {

  const t = label.toLowerCase();

  const rules = [

    [/bot order/, "Bug"],

    [/fraud|fake|suspicious|duplicate customer/, "Fingerprint"],

    [/threat|risk/, "ShieldAlert"],

    [/supplier/, "Factory"],

    [/warehouse/, "Warehouse"],

    [/ship|shipping/, "Ship"],

    [/deliver/, "Truck"],

    [/inventory|reorder|stockout|overstock|dead stock/, "Archive"],

    [/landed|true product cost|cost|price|pricing|moq/, "Coins"],

    [/break-even|calculator|calculate |basket|sample size|statistical/, "Calculator"],

    [/cash|capital|working capital/, "Wallet"],

    [/profit|margin|roas|cpa|cpc|revenue/, "DollarSign"],

    [/simulator|simulation|scenario|what-if|what if/, "Activity"],

    [/forecast|predictor|prediction/, "LineChart"],

    [/engine/, "Cpu"],

    [/dashboard|kpi/, "BarChart"],

    [/report/, "FileText"],

    [/trend/, "TrendingUp"],

    [/market/, "Store"],

    [/country|geo|cross-border|cross border|global|international|china|asia|europe|usa/, "Globe2"],

    [/localiz|culture|local /, "Languages"],

    [/product/, "Package"],

    [/store/, "ShoppingCart"],

    [/landing|homepage|page|checkout|navigation/, "LayoutTemplate"],

    [/funnel|friction/, "Filter"],

    [/conversion|cro|cta/, "MousePointerClick"],

    [/bottleneck/, "Activity"],

    [/experiment|a\/b|ab test/, "FlaskConical"],

    [/test/, "CheckSquare"],

    [/segment|cohort|persona|rfm|customer|audience|buyer/, "Users"],

    [/retention|churn|loyalty|win-back|win back|reactivation|welcome|abandoned|referral|vip|subscription|flow|repeat purchase|next purchase/, "Heart"],

    [/tiktok/, "Music"],

    [/reels|reel|instagram/, "Camera"],

    [/youtube/, "Tv"],

    [/influencer|creator|ugc/, "UserCircle"],

    [/keyword|serp|seo/, "Search"],

    [/content|blog/, "FileText"],

    [/amazon|bsr|listing|seller|ranking/, "ShoppingBag"],

    [/brand|positioning|identity|usp|unique mechanism|packaging|naming|story|voice/, "BadgeCheck"],

    [/cleaner|normalizer|deduplicator|enrichment|validator|missing data|outlier|anomaly|correlation|pattern detector/, "Database"],

    [/agent/, "Bot"],

    [/decision|selector|kill|keep|iterate|best |expected value|confidence|explainab|history|outcome/, "Target"],

    [/opportunity|white space|blue ocean|gap|arbitrage/, "Gem"],

    [/growth/, "TrendingUp"],

    [/competit/, "Swords"],

    [/moat|advantage|differentiat/, "ShieldCheck"],

    [/niche/, "Target"],

    [/timing|momentum|urgency/, "Clock"],

    [/lifecycle|death|revival|maturity|saturation/, "Activity"],

    [/accessory|consumable|bundle|upsell|cross-sell|variant|replacement|premium/, "PackagePlus"],

    [/review|comment/, "Star"],

    [/impulse|gift|giftab/, "Gift"],

    [/frequency/, "Repeat"],

    [/problem|pain|severity/, "AlertTriangle"],

    [/before|after|demonstrat/, "Image"],

    [/score/, "Gauge"],

    [/mobile|desktop|ux|heatmap|click path|session behavior/, "MousePointerClick"],

    [/trust|social proof|guarantee|badge/, "BadgeCheck"],

    [/urgency|scarcity/, "Zap"],

    [/spot|emerge|innovate|improve|idea|feature/, "Lightbulb"],

  ];

  for (const [re, icon] of rules) if (re.test(t)) return icon;

  return fallback;

}



// [F_stdSkill] Builds a standard new skill (generic strategist/analyst) from label + short description.

function stdSkill(key, category, label, desc, icon) {

  return {

    category,

    label,

    icon: icon || skillIcon(label, SKILL_CATEGORIES[category]?.icon || "Circle"),

    desc,

    requiredInputs: ["productName"],

    outputSchema: SchemaStandardInsight,

    buildPrompt: (ctx) => {

      const p = (ctx.productName || "").trim();

      return `Act as an expert e-commerce strategist. Perform the "${label}" analysis.

${p ? `Context / product: ${p}.` : "Context: use the upstream connected data I provide."}

Cover every part of this skill name, be concrete and realistic for a small online seller (dropshipping / COD / e-commerce), and give real numbers, costs or timelines wherever possible.

Respond ONLY with a valid JSON object:

{ "summary": "short overview", "keyPoints": ["most important findings (5-10)"], "recommendations": ["concrete next actions (3-7)"] }`;

    }

  };

}



export const SKILL_CATEGORIES = {

  ALL_IN_ONE: { id: "ALL_IN_ONE", name: "All In One", icon: "Layers", color: "#10b981" },

  BUSINESS: { id: "BUSINESS", name: "Business & Company Setup", icon: "BriefcaseBusiness", color: "#0d9488" },

  ADVANCED_PRODUCT: { id: "ADVANCED_PRODUCT", name: "Advanced Product Intelligence", icon: "Brain", color: "#3b82f6" },

  TREND_VIRAL: { id: "TREND_VIRAL", name: "Trend & Viral Research", icon: "Flame", color: "#ef4444" },

  COMPETITOR: { id: "COMPETITOR", name: "Competitor Intelligence", icon: "Swords", color: "#6366f1" },

  CUSTOMER_REVIEW: { id: "CUSTOMER_REVIEW", name: "Customer & Review Intelligence", icon: "MessageCircle", color: "#8b5cf6" },

  ADVANCED_OFFER: { id: "ADVANCED_OFFER", name: "Advanced Offer Skills", icon: "Magnet", color: "#ec4899" },

  ADVANCED_CREATIVE: { id: "ADVANCED_CREATIVE", name: "Advanced Creative Intelligence", icon: "Clapperboard", color: "#f43f5e" },

  ADS_ANALYTICS: { id: "ADS_ANALYTICS", name: "Advanced Ads Analytics", icon: "BarChart3", color: "#10b981" },

  AWARENESS: { id: "AWARENESS", name: "Awareness Funnel Strategy", icon: "Megaphone", color: "#f59e0b" },

  COPYWRITING: { id: "COPYWRITING", name: "Copywriting Frameworks", icon: "PenLine", color: "#ec4899" },

  SHOPIFY: { id: "SHOPIFY", name: "Shopify Store & Apps", icon: "ShoppingCart", color: "#16a34a" },

  ALGERIA: { id: "ALGERIA", name: "Advanced Algeria Skills", icon: "Map", color: "#059669" },

  INTERNATIONAL: { id: "INTERNATIONAL", name: "Advanced International Skills", icon: "Globe2", color: "#0ea5e9" },

  ADVANCED_AI: { id: "ADVANCED_AI", name: "Very Advanced AI Skills", icon: "Bot", color: "#0f172a" },

  STRATEGIC: { id: "STRATEGIC", name: "Strategic Intelligence", icon: "Brain", color: "#7c3aed" },

  PRODUCT_2: { id: "PRODUCT_2", name: "Winning Product 2.0", icon: "Package", color: "#1d4ed8" },

  GEO_ARBITRAGE: { id: "GEO_ARBITRAGE", name: "Geo-Arbitrage Intelligence", icon: "Globe2", color: "#0ea5e9" },

  SUPPLIER: { id: "SUPPLIER", name: "Supplier & Sourcing Intelligence", icon: "Factory", color: "#d97706" },

  LOGISTICS: { id: "LOGISTICS", name: "Logistics & Supply Chain", icon: "Ship", color: "#0d9488" },

  FINANCE: { id: "FINANCE", name: "Advanced Financial Intelligence", icon: "Coins", color: "#059669" },

  STORE_CRO: { id: "STORE_CRO", name: "Store & CRO Intelligence", icon: "ShoppingCart", color: "#65a30d" },

  CRO: { id: "CRO", name: "Conversion Rate Optimization", icon: "MousePointerClick", color: "#ca8a04" },

  EXPERIMENT: { id: "EXPERIMENT", name: "Experimentation Intelligence", icon: "FlaskConical", color: "#0891b2" },

  CUSTOMER_2: { id: "CUSTOMER_2", name: "Customer Intelligence 2.0", icon: "Users", color: "#7c3aed" },

  RETENTION: { id: "RETENTION", name: "Retention & CRM", icon: "Heart", color: "#db2777" },

  ORGANIC: { id: "ORGANIC", name: "Organic Growth Intelligence", icon: "Clapperboard", color: "#e11d48" },

  INFLUENCER: { id: "INFLUENCER", name: "Influencer Intelligence", icon: "UserCircle", color: "#c026d3" },

  SEO: { id: "SEO", name: "SEO Intelligence", icon: "Search", color: "#ea580c" },

  MARKETPLACE: { id: "MARKETPLACE", name: "Marketplace Intelligence", icon: "Store", color: "#f59e0b" },

  PRODUCT_TESTING: { id: "PRODUCT_TESTING", name: "Product Testing Intelligence", icon: "Microscope", color: "#2563eb" },

  SCALING: { id: "SCALING", name: "Scaling Intelligence", icon: "Rocket", color: "#ef4444" },

  ECOSYSTEM_2: { id: "ECOSYSTEM_2", name: "Product Ecosystem 2.0", icon: "Network", color: "#0891b2" },

  BRANDING: { id: "BRANDING", name: "Branding Intelligence", icon: "BadgeCheck", color: "#e11d48" },

  LOCALIZATION: { id: "LOCALIZATION", name: "Localization Intelligence", icon: "Languages", color: "#d97706" },

  FRAUD_RISK: { id: "FRAUD_RISK", name: "Fraud & Risk Intelligence", icon: "ShieldAlert", color: "#b91c1c" },

  DATA: { id: "DATA", name: "Data Intelligence", icon: "Database", color: "#475569" },

  AGENTS: { id: "AGENTS", name: "Autonomous Agents", icon: "Bot", color: "#0f172a" },

  COMMAND: { id: "COMMAND", name: "E-commerce Command Center", icon: "Command", color: "#111827" },

  DECISION: { id: "DECISION", name: "Decision Intelligence", icon: "ListChecks", color: "#1d4ed8" },

  RADAR: { id: "RADAR", name: "Opportunity Radar", icon: "Radar", color: "#dc2626" },

  ECOM: { id: "ECOM", name: "E-commerce (ecom)", icon: "GitBranch", color: "#0891b2" },

  ADVANCED_STRATEGY: { id: "ADVANCED_STRATEGY", name: "Advanced Strategy Intelligence", icon: "TrendingUp", color: "#10b981" },

};



// Generic output schemas to reuse

const SchemaStandardInsight = z.object({

  summary: z.string(),

  keyPoints: z.array(z.string()),

  recommendations: z.array(z.string())

});





// Schema for Ad Creative Style & Angle Generator

const SchemaAdCreativeAnalyzer = z.object({

  productSummary: z.string(),

  topRecommendedStyles: z.array(z.string()),

  videoCreatives: z.array(z.object({

    rank: z.number(),

    style: z.string(),

    fitScore: z.number(),

    duration: z.string(),

    format: z.string(),

    hookOptions: z.array(z.string()),

    first3Seconds: z.string(),

    mainBody: z.string(),

    cta: z.string(),

    visualDirection: z.string(),

    whyItFits: z.string(),

    priority: z.enum(["PRIMARY", "SECONDARY", "TEST", "EXPERIMENTAL"])

  })),

  imageCreatives: z.array(z.object({

    rank: z.number(),

    style: z.string(),

    fitScore: z.number(),

    format: z.string(),

    visualConcept: z.string(),

    headlineIdea: z.string(),

    textOverlay: z.string(),

    whyItFits: z.string(),

    priority: z.enum(["PRIMARY", "SECONDARY", "TEST", "EXPERIMENTAL"])

  })),

  marketingAngles: z.array(z.object({

    angle: z.string(),

    category: z.string(),

    fitScore: z.number(),

    corePsychTrigger: z.string(),

    headlineExample: z.string(),

    bodyExample: z.string(),

    bestCreativeStyle: z.string(),

    bestPlatform: z.string()

  })),

  avoidStyles: z.array(z.object({

    style: z.string(),

    reason: z.string()

  })),

  testingPlan: z.array(z.string())

});

const SchemaCinematicStoryboard = z.object({

  ideas: z.array(z.object({

    title: z.string().describe("Title of the storyboard"),

    masterPrompt: z.string().describe("The Master Storyboard Prompt containing the character lock, product lock, and continuity rules."),

    segments: z.array(z.object({

      segmentName: z.string().describe("E.g., Segment 1 (0:00 - 0:10)"),

      timeRange: z.string().describe("Exact time range in seconds"),

      segmentPrompt: z.string().describe("The precise AI video generation prompt for the segment length"),

      voiceover: z.string().describe("The voiceover script spoken during this segment")

    })).describe("The continuous chain of segments"),

    checklist: z.array(z.string()).describe("Continuity checklist items")

  })).describe("List of exactly 3 distinct video ideas/storyboards.")

});



// [E_SchemaAdKpiAnalyzer] Output schema for the Ad KPIs Analyzer skill.

// Mirrors the exact JSON shape expected by AdKpiAnalysis.jsx component.

const SchemaAdKpiAnalyzer = z.object({

  executive_summary: z.object({

    priority_1: z.string().optional(),

    budget_plan: z.string().optional(),

    main_alert: z.string().optional(),

  }).optional(),

  summary: z.object({

    total_spend: z.string().optional(),

    avg_ctr_pct: z.string().optional(),

    avg_cpm_usd: z.string().optional(),

    avg_cpc_usd: z.string().optional(),

    avg_cvr_pct: z.string().optional(),

    avg_cpa_usd: z.string().optional(),

    avg_roas: z.string().optional(),

    trend_period: z.string().optional(),

    top_kpi_insight: z.string().optional(),

  }).optional(),

  levels: z.array(z.object({

    level: z.string(),

    name: z.string(),

    verdict: z.string(),

    confidence: z.string().optional(),

    trend: z.record(z.string()).optional(),

    kpis: z.record(z.string()).optional(),

    kpi_status: z.array(z.object({

      kpi: z.string(),

      value: z.string(),

      benchmark: z.string().optional(),

      status: z.string(),

      why: z.string().optional(),

      fix: z.string().optional(),

    })).optional(),

    diagnostic: z.string().optional(),

    action: z.string().optional(),

    risk: z.string().optional(),

  })).optional(),

  winners: z.array(z.object({ name: z.string(), metric: z.string().optional(), why_it_wins: z.string().optional() })).optional(),

  losers: z.array(z.object({ name: z.string(), metric: z.string().optional(), why_it_loses: z.string().optional() })).optional(),

  fatigue_risks: z.array(z.object({ name: z.string(), signals: z.string().optional() })).optional(),

  audience_overlap: z.array(z.object({ audiences: z.string(), risk: z.string().optional(), exclusions: z.string().optional() })).optional(),

  scaling_candidates: z.array(z.object({ name: z.string(), plan: z.string().optional() })).optional(),

  actions: z.array(z.object({ type: z.string(), what: z.string() })).optional(),

  recommendations: z.array(z.string()).optional(),

});



const SchemaFacebookAdsOrgChart = z.object({

  overallStrategy: z.string().optional(),

  campaigns: z.array(z.object({

    campaignName: z.string(),

    budgetType: z.string().optional().describe("e.g. CBO or ABO"),

    campaignBudget: z.string().optional(),

    campaignRules: z.string().optional(),

    adSets: z.array(z.object({

      name: z.string(),

      objective: z.string().optional().describe("e.g. Website Conversions, Messages, Lead Gen"),

      targeting: z.string(),

      placement: z.string().optional(),

      budget: z.string().optional(),

      parameters: z.string().optional(),

      ads: z.array(z.object({

        name: z.string().optional(),

        format: z.string().optional().describe("e.g. Image, Video, Carousel"),

        description: z.string()

      }))

    }))

  }))

});



export const SKILLS_DICT = {

  // --- 💼 Business & Company Setup ---

  llc_company: { category: "BUSINESS", label: "LLC Company", icon: "Building2", desc: "Get your US LLC company plan: when to create, tax deadlines, required documents, and which non-resident banks to apply with", requiredInputs: [], outputSchema: null, buildPrompt: (ctx) => buildCompanyPlanPrompt(ctx, COMPANY_PLAN_CONFIGS.llc_company) },

  ltd_company: { category: "BUSINESS", label: "LTD Company (UK)", icon: "Crown", desc: "Get your UK Ltd company plan: Companies House formation, tax deadlines, documents, and non-resident business banks", requiredInputs: [], outputSchema: null, buildPrompt: (ctx) => buildCompanyPlanPrompt(ctx, COMPANY_PLAN_CONFIGS.ltd_company) },

  hong_kong_company: { category: "BUSINESS", label: "Hong Kong Company", icon: "Building", desc: "Get your Hong Kong company plan: Companies Registry formation, profits tax, documents, and corporate banks", requiredInputs: [], outputSchema: null, buildPrompt: (ctx) => buildCompanyPlanPrompt(ctx, COMPANY_PLAN_CONFIGS.hong_kong_company) },

  uae_company: { category: "BUSINESS", label: "UAE Company", icon: "Landmark", desc: "Get your UAE company plan: mainland or free zone, corporate tax, documents, and business banks", requiredInputs: [], outputSchema: null, buildPrompt: (ctx) => buildCompanyPlanPrompt(ctx, COMPANY_PLAN_CONFIGS.uae_company) },

  estonia_company: { category: "BUSINESS", label: "Estonia Company", icon: "IdCard", desc: "Get your Estonia OÜ plan via e-Residency: 0% reinvested tax, documents, and e-Resident banks", requiredInputs: [], outputSchema: null, buildPrompt: (ctx) => buildCompanyPlanPrompt(ctx, COMPANY_PLAN_CONFIGS.estonia_company) },



  // --- 🧠 Advanced Product Intelligence ---

  product_master_list: { category: "ADVANCED_PRODUCT", label: "Product Master List", icon: "Table", desc: "Build a master reference list of core product identity, pricing, suppliers, and marketplace presence", requiredInputs: [], optionalInputs: ["marketplaces", "market", "niche", "audience"], outputSchema: SchemaStandardInsight, placeholder: ADVANCED_PRODUCT_PLACEHOLDERS.product_master_list, buildPrompt: (ctx) => buildAdvancedProductPrompt("product_master_list", ctx) },

  product_deep_dive: { category: "ADVANCED_PRODUCT", label: "Product Deep Dive", icon: "Microscope", desc: "Full-depth product investigation for a go/no-go decision", requiredInputs: ["productName"], optionalInputs: ["depth"], outputSchema: SchemaStandardInsight, placeholder: ADVANCED_PRODUCT_PLACEHOLDERS.product_deep_dive, buildPrompt: (ctx) => buildAdvancedProductPrompt("product_deep_dive", ctx) },

  product_dna: { category: "ADVANCED_PRODUCT", label: "Product DNA", icon: "Dna", desc: "Decode why a product wins or loses: hook, pain point, mechanism, trigger, visual wow", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, placeholder: ADVANCED_PRODUCT_PLACEHOLDERS.product_dna, buildPrompt: (ctx) => buildAdvancedProductPrompt("product_dna", ctx) },

  why_people_buy: { category: "ADVANCED_PRODUCT", label: "Why People Buy", icon: "BrainCircuit", desc: "Identify purchase psychology — stated vs actual buying drivers with evidence", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, placeholder: ADVANCED_PRODUCT_PLACEHOLDERS.why_people_buy, buildPrompt: (ctx) => buildAdvancedProductPrompt("why_people_buy", ctx) },

  why_people_dont_buy: { category: "ADVANCED_PRODUCT", label: "Why People Don't Buy", icon: "OctagonMinus", desc: "Identify conversion blockers — objections, root causes, and concrete fixes", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, placeholder: ADVANCED_PRODUCT_PLACEHOLDERS.why_people_dont_buy, buildPrompt: (ctx) => buildAdvancedProductPrompt("why_people_dont_buy", ctx) },

  viral_potential_score: { category: "ADVANCED_PRODUCT", label: "Viral Potential Score", icon: "Flame", desc: "Score viral potential 0-100 with breakdown and best platform", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, placeholder: ADVANCED_PRODUCT_PLACEHOLDERS.viral_potential_score, buildPrompt: (ctx) => buildAdvancedProductPrompt("viral_potential_score", ctx) },

  product_complexity_score: { category: "ADVANCED_PRODUCT", label: "Product Complexity Score", icon: "Package", desc: "Determine operational difficulty — sourcing, shipping, support, returns, setup", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, placeholder: ADVANCED_PRODUCT_PLACEHOLDERS.product_complexity_score, buildPrompt: (ctx) => buildAdvancedProductPrompt("product_complexity_score", ctx) },

  product_risk_score: { category: "ADVANCED_PRODUCT", label: "Product Risk Score", icon: "TriangleAlert", desc: "Identify commercial risks — legal, ad-policy, seasonality, reputational, supplier", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, placeholder: ADVANCED_PRODUCT_PLACEHOLDERS.product_risk_score, buildPrompt: (ctx) => buildAdvancedProductPrompt("product_risk_score", ctx) },

  untapped_product_finder: { category: "ADVANCED_PRODUCT", label: "Untapped Product Finder", icon: "Gem", desc: "Find underserved opportunities with rising demand and low saturation", requiredInputs: ["productName"], optionalInputs: ["maxResults"], outputSchema: SchemaStandardInsight, placeholder: ADVANCED_PRODUCT_PLACEHOLDERS.untapped_product_finder, buildPrompt: (ctx) => buildAdvancedProductPrompt("untapped_product_finder", ctx) },

  product_trend_reversal: { category: "ADVANCED_PRODUCT", label: "Product Trend Reversal", icon: "RotateCcw", desc: "Detect products returning or falling off — reversal direction and timing", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, placeholder: ADVANCED_PRODUCT_PLACEHOLDERS.product_trend_reversal, buildPrompt: (ctx) => buildAdvancedProductPrompt("product_trend_reversal", ctx) },

  product_ecosystem: { category: "ADVANCED_PRODUCT", label: "Product Ecosystem", icon: "Network", desc: "Map complementary products, upsell bundles, and the broader lifestyle niche", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, placeholder: ADVANCED_PRODUCT_PLACEHOLDERS.product_ecosystem, buildPrompt: (ctx) => buildAdvancedProductPrompt("product_ecosystem", ctx) },

  price_elasticity_analysis: { category: "ADVANCED_PRODUCT", label: "Price Elasticity Analysis", icon: "CircleDollarSign", desc: "Estimate response to price changes — floor, ceiling, anchors, elasticity level", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, placeholder: ADVANCED_PRODUCT_PLACEHOLDERS.price_elasticity_analysis, buildPrompt: (ctx) => buildAdvancedProductPrompt("price_elasticity_analysis", ctx) },

  commodity_vs_brandable: { category: "ADVANCED_PRODUCT", label: "Commodity vs Brandable", icon: "Tag", desc: "Determine whether a product can become a brand — verdict, score, reasoning", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, placeholder: ADVANCED_PRODUCT_PLACEHOLDERS.commodity_vs_brandable, buildPrompt: (ctx) => buildAdvancedProductPrompt("commodity_vs_brandable", ctx) },

  scale_potential: { category: "ADVANCED_PRODUCT", label: "Scale Potential", icon: "Rocket", desc: "Estimate scaling ceiling in tiers — revenue, bottlenecks, and the path up", requiredInputs: ["productName"], optionalInputs: ["targetMarket"], outputSchema: SchemaStandardInsight, placeholder: ADVANCED_PRODUCT_PLACEHOLDERS.scale_potential, buildPrompt: (ctx) => buildAdvancedProductPrompt("scale_potential", ctx) },

  test_priority_score: { category: "ADVANCED_PRODUCT", label: "Test Priority Score", icon: "ListOrdered", desc: "Rank products by testing priority — speed, cost, signal quality, upside", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, placeholder: ADVANCED_PRODUCT_PLACEHOLDERS.test_priority_score, buildPrompt: (ctx) => buildAdvancedProductPrompt("test_priority_score", ctx) },

  portfolio_product_ranking: { category: "ADVANCED_PRODUCT", label: "Portfolio Product Ranking", icon: "Trophy", desc: "Rank multiple connected products against each other — connect 2+ products", requiredInputs: ["productName"], optionalInputs: ["rankingPriority"], outputSchema: SchemaStandardInsight, placeholder: ADVANCED_PRODUCT_PLACEHOLDERS.portfolio_product_ranking, buildPrompt: (ctx) => buildAdvancedProductPrompt("portfolio_product_ranking", ctx) },

  product_sourcing_compliance: { category: "ADVANCED_PRODUCT", label: "Product Sourcing Compliance", icon: "ShieldCheck", desc: "Map sourcing flows, compliance gates, and brand flags for the target country", requiredInputs: ["targetCountry"], optionalInputs: ["market", "productName"], outputSchema: SchemaStandardInsight, placeholder: ADVANCED_PRODUCT_PLACEHOLDERS.product_sourcing_compliance, buildPrompt: (ctx) => buildAdvancedProductPrompt("product_sourcing_compliance", ctx) },

  winning_digital_product: { category: "PRODUCT_2", label: "Winning Digital Product", icon: "FileSpreadsheet", desc: "Analyze a CSV of digital product listings to identify winning products with strong commercial potential.", requiredInputs: [], outputSchema: null, buildPrompt: (ctx) => buildWinningDigitalProductPrompt(ctx) },



  // --- 🔥 Trend & Viral Research ---

  trend_detector: { category: "TREND_VIRAL", label: "Trend Detector", icon: "Radar", desc: "Detect emerging trends", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `Detect trends for ${ctx.productName}` },

  trend_momentum: { category: "TREND_VIRAL", label: "Trend Momentum", icon: "TrendingUp", desc: "Measure whether interest is accelerating", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `Trend momentum for ${ctx.productName}` },

  trend_forecast: { category: "TREND_VIRAL", label: "Trend Forecast", icon: "LineChart", desc: "Estimate future demand", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `Forecast trend for ${ctx.productName}` },

  trend_wave_finder: { category: "TREND_VIRAL", label: "Trend Wave Finder", icon: "Waves", desc: "Find products riding a larger trend", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `Trend wave for ${ctx.productName}` },

  trend_to_product_matcher: { category: "TREND_VIRAL", label: "Trend-to-Product Matcher", icon: "Target", desc: "Match trends with products", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `Match trend for ${ctx.productName}` },

  viral_product_detector: { category: "TREND_VIRAL", label: "Viral Product Detector", icon: "Bomb", desc: "Identify products gaining attention", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `Viral potential of ${ctx.productName}` },

  social_trend_analyzer: { category: "TREND_VIRAL", label: "Social Trend Analyzer", icon: "Smartphone", desc: "Analyze social-media trends", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `Social trends for ${ctx.productName}` },

  viral_creative_analyzer: { category: "TREND_VIRAL", label: "Viral Creative Analyzer", icon: "Clapperboard", desc: "Identify patterns in viral ads/content", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `Viral creatives for ${ctx.productName}` },

  trend_hook_generator: { category: "TREND_VIRAL", label: "Trend Hook Generator", icon: "Magnet", desc: "Create hooks around current trends", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `Trend hooks for ${ctx.productName}` },

  seasonality_detector: { category: "TREND_VIRAL", label: "Seasonality Detector", icon: "Clock", desc: "Identify seasonal demand", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `Seasonality of ${ctx.productName}` },



  // --- 🕵️ Competitor Intelligence — Advanced ---

  competitor_recon: { category: "COMPETITOR", label: "Competitor Recon", icon: "UserMinus", desc: "Complete competitor investigation", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `Competitor recon for ${ctx.productName}` },

  competitor_revenue_estimator: { category: "COMPETITOR", label: "Revenue Estimator", icon: "CircleDollarSign", desc: "Estimate competitor sales potential", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `Competitor revenue for ${ctx.productName}` },

  ad_library_analyzer: { category: "COMPETITOR", label: "Ad Library Analyzer", icon: "Library", desc: "Analyze competitor advertising patterns", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `Ad library for ${ctx.productName}` },

  competitor_psychology: { category: "COMPETITOR", label: "Competitor Psychology", icon: "Brain", desc: "Understand competitor positioning", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `Competitor psychology for ${ctx.productName}` },

  competitor_target_audience: { category: "COMPETITOR", label: "Target Audience", icon: "Users", desc: "Determine who they target", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `Competitor target audience for ${ctx.productName}` },

  competitor_hook_analyzer: { category: "COMPETITOR", label: "Hook Analyzer", icon: "Magnet", desc: "Extract recurring hooks", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `Competitor hooks for ${ctx.productName}` },

  competitor_offer_reverse_engineer: { category: "COMPETITOR", label: "Offer Reverse Engineer", icon: "Gem", desc: "Reconstruct their offer", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `Reverse engineer offer of ${ctx.productName}` },

  competitor_funnel_reverse_engineer: { category: "COMPETITOR", label: "Funnel Reverse Engineer", icon: "Filter", desc: "Reconstruct their funnel", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `Reverse engineer funnel of ${ctx.productName}` },

  competitor_creative_breakdown: { category: "COMPETITOR", label: "Creative Breakdown", icon: "Image", desc: "Analyze visual creatives", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `Competitor creatives for ${ctx.productName}` },

  competitor_messaging_breakdown: { category: "COMPETITOR", label: "Messaging Breakdown", icon: "MessageSquare", desc: "Analyze their messaging", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `Competitor messaging for ${ctx.productName}` },

  battle_card_generator: { category: "COMPETITOR", label: "Battle Card Generator", icon: "Swords", desc: "Create a sales/marketing battle card", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `Battle card for ${ctx.productName}` },

  market_leader_analysis: { category: "COMPETITOR", label: "Market Leader Analysis", icon: "Medal", desc: "Identify what the strongest competitor does differently", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `Market leader analysis for ${ctx.productName}` },

  competitor_gap_finder: { category: "COMPETITOR", label: "Competitor Gap Finder", icon: "SearchCode", desc: "Find gaps competitors aren't serving", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `Competitor gaps for ${ctx.productName}` },



  // --- 💬 Customer & Review Intelligence ---

  review_intelligence: { category: "CUSTOMER_REVIEW", label: "Review Intelligence", icon: "Star", desc: "Analyze thousands of reviews", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `Review intelligence for ${ctx.productName}` },

  complaint_mining: { category: "CUSTOMER_REVIEW", label: "Complaint Mining", icon: "Frown", desc: "Find recurring complaints", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `Complaint mining for ${ctx.productName}` },

  love_mining: { category: "CUSTOMER_REVIEW", label: "Love Mining", icon: "Heart", desc: "Find what customers love", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `Love mining for ${ctx.productName}` },

  feature_demand_finder: { category: "CUSTOMER_REVIEW", label: "Feature Demand Finder", icon: "PlusCircle", desc: "Identify requested features", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `Feature demand for ${ctx.productName}` },

  customer_idea_generator: { category: "CUSTOMER_REVIEW", label: "Customer Idea Generator", icon: "Lightbulb", desc: "Turn complaints into product ideas", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `Customer ideas for ${ctx.productName}` },

  customer_language_extractor: { category: "CUSTOMER_REVIEW", label: "Language Extractor", icon: "MessageCircle", desc: "Extract exact customer vocabulary", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `Customer vocabulary for ${ctx.productName}` },

  customer_intent_detector: { category: "CUSTOMER_REVIEW", label: "Intent Detector", icon: "Target", desc: "Determine buying intent", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `Customer intent for ${ctx.productName}` },

  awareness_stage_analyzer: { category: "CUSTOMER_REVIEW", label: "Awareness Stage Analyzer", icon: "Eye", desc: "Identify customer awareness", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `Awareness stage for ${ctx.productName}` },

  willingness_to_pay_analysis: { category: "CUSTOMER_REVIEW", label: "Willingness-to-Pay Analysis", icon: "Wallet", desc: "Estimate acceptable price range", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `Willingness to pay for ${ctx.productName}` },

  purchase_barrier_analyzer: { category: "CUSTOMER_REVIEW", label: "Purchase Barrier Analyzer", icon: "ShieldAlert", desc: "Find barriers to purchase", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `Purchase barriers for ${ctx.productName}` },

  customer_retention_analyzer: { category: "CUSTOMER_REVIEW", label: "Retention Analyzer", icon: "Repeat", desc: "Identify reasons customers return", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `Retention reasons for ${ctx.productName}` },

  churn_reason_analyzer: { category: "CUSTOMER_REVIEW", label: "Churn Reason Analyzer", icon: "UserMinus", desc: "Identify why customers leave", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `Churn reasons for ${ctx.productName}` },



  // --- 🧲 Advanced Offer Skills ---

  offer_architect: { category: "ADVANCED_OFFER", label: "Offer Architect", icon: "PenTool", desc: "Architect compelling offers", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `Offer architect for ${ctx.productName}` },

  value_stack_builder: { category: "ADVANCED_OFFER", label: "Value Stack Builder", icon: "Layers", desc: "Build perceived value stacks", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `Value stack for ${ctx.productName}` },

  bonus_stack_generator: { category: "ADVANCED_OFFER", label: "Bonus Stack Generator", icon: "Gift", desc: "Create high-value bonuses", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `Bonus stack for ${ctx.productName}` },

  bundle_profit_optimizer: { category: "ADVANCED_OFFER", label: "Bundle Profit Optimizer", icon: "PackagePlus", desc: "Optimize bundle pricing", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `Bundle optimizer for ${ctx.productName}` },

  aov_optimizer: { category: "ADVANCED_OFFER", label: "AOV Optimizer", icon: "TrendingUp", desc: "Increase average order value", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `AOV optimizer for ${ctx.productName}` },

  irresistibility_score: { category: "ADVANCED_OFFER", label: "Irresistibility Score", icon: "Flame", desc: "Score the offer's appeal", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `Irresistibility score for ${ctx.productName}` },

  price_anchoring_strategy: { category: "ADVANCED_OFFER", label: "Price Anchoring Strategy", icon: "Anchor", desc: "Anchor high prices effectively", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `Price anchoring for ${ctx.productName}` },

  offer_comparison_matrix: { category: "ADVANCED_OFFER", label: "Offer Comparison Matrix", icon: "GitCompare", desc: "Compare offer structures", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `Offer comparison for ${ctx.productName}` },

  offer_to_audience_matcher: { category: "ADVANCED_OFFER", label: "Offer-to-Audience Matcher", icon: "Users", desc: "Match offers to segments", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `Offer matching for ${ctx.productName}` },

  offer_weakness_detector: { category: "ADVANCED_OFFER", label: "Offer Weakness Detector", icon: "SearchX", desc: "Find leaks in your offer", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `Offer weakness for ${ctx.productName}` },

  offer_iteration_generator: { category: "ADVANCED_OFFER", label: "Offer Iteration Generator", icon: "RefreshCw", desc: "Iterate to improve offer", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `Offer iteration for ${ctx.productName}` },

  discount_profit_simulator: { category: "ADVANCED_OFFER", label: "Discount Profit Simulator", icon: "Percent", desc: "Simulate discount impact", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `Discount simulation for ${ctx.productName}` },

  checkout_offer_optimizer: { category: "ADVANCED_OFFER", label: "Checkout Offer Optimizer", icon: "ShoppingCart", desc: "Optimize cart page offers", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `Checkout offer for ${ctx.productName}` },

  free_gift_strategy: { category: "ADVANCED_OFFER", label: "Free Gift Strategy", icon: "Gift", desc: "Leverage free gifts for conversion", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `Free gift strategy for ${ctx.productName}` },

  upsell_revenue_simulator: { category: "ADVANCED_OFFER", label: "Upsell Revenue Simulator", icon: "ArrowUpRight", desc: "Simulate upsell paths", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `Upsell simulator for ${ctx.productName}` },



  // --- 🎬 Advanced Creative Intelligence ---

  creative_deconstructor: { category: "ADVANCED_CREATIVE", label: "Creative Deconstructor", icon: "Scissors", desc: "Deconstruct winning ads", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `Deconstruct creatives for ${ctx.productName}` },

  hook_score: { category: "ADVANCED_CREATIVE", label: "Hook Score", icon: "Magnet", desc: "Score hook effectiveness", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `Hook score for ${ctx.productName}` },

  creative_audience_matcher: { category: "ADVANCED_CREATIVE", label: "Creative-Audience Matcher", icon: "Users", desc: "Match creatives to audiences", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `Creative matching for ${ctx.productName}` },

  creative_psychology_analyzer: { category: "ADVANCED_CREATIVE", label: "Creative Psychology Analyzer", icon: "Brain", desc: "Analyze psychological triggers", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `Creative psychology for ${ctx.productName}` },

  ugc_persona_generator: { category: "ADVANCED_CREATIVE", label: "UGC Persona Generator", icon: "UserCircle", desc: "Generate UGC creator personas", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `UGC personas for ${ctx.productName}` },

  ugc_character_generator: { category: "ADVANCED_CREATIVE", label: "UGC Character Generator", icon: "UserPlus", desc: "Generate specific UGC characters", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `UGC characters for ${ctx.productName}` },

  scene_generator: { category: "ADVANCED_CREATIVE", label: "Scene Generator", icon: "Film", desc: "Generate ad scenes", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `Ad scenes for ${ctx.productName}` },

  storyboard_builder: { category: "ADVANCED_CREATIVE", label: "Storyboard Builder", icon: "Layout", desc: "Build video storyboards", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `Storyboard for ${ctx.productName}` },

  shot_list_generator: { category: "ADVANCED_CREATIVE", label: "Shot List Generator", icon: "List", desc: "Generate video shot lists", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `Shot list for ${ctx.productName}` },

  voiceover_script_generator: { category: "ADVANCED_CREATIVE", label: "Voiceover Script Generator", icon: "Mic", desc: "Write voiceover scripts", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `Voiceover script for ${ctx.productName}` },

  creative_variation_engine: { category: "ADVANCED_CREATIVE", label: "Creative Variation Engine", icon: "Copy", desc: "Generate variations of an ad", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `Creative variations for ${ctx.productName}` },

  hook_angle_mixer: { category: "ADVANCED_CREATIVE", label: "Hook × Angle Mixer", icon: "Shuffle", desc: "Mix hooks and angles", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `Hook mixer for ${ctx.productName}` },

  static_ad_generator: { category: "ADVANCED_CREATIVE", label: "Static Ad Generator", icon: "Image", desc: "Generate static ad concepts", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `Static ads for ${ctx.productName}` },

  video_ad_generator: { category: "ADVANCED_CREATIVE", label: "Video Ad Generator", icon: "Video", desc: "Generate video ad concepts", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `Video ads for ${ctx.productName}` },

  creative_winner_predictor: { category: "ADVANCED_CREATIVE", label: "Creative Winner Predictor", icon: "Trophy", desc: "Predict winning creatives", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `Creative predictor for ${ctx.productName}` },

  creative_repurposer: { category: "ADVANCED_CREATIVE", label: "Creative Repurposer", icon: "Recycle", desc: "Repurpose existing creatives", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `Creative repurposer for ${ctx.productName}` },

  creative_localization: { category: "ADVANCED_CREATIVE", label: "Creative Localization", icon: "Globe", desc: "Localize creatives for markets", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `Creative localization for ${ctx.productName}` },

  arabic_ad_localization: { category: "ADVANCED_CREATIVE", label: "Arabic Ad Localization", icon: "Languages", desc: "Localize for Arabic markets", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `Arabic localization for ${ctx.productName}` },

  french_ad_localization: { category: "ADVANCED_CREATIVE", label: "French Ad Localization", icon: "Languages", desc: "Localize for French markets", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `French localization for ${ctx.productName}` },

  international_ad_localization: { category: "ADVANCED_CREATIVE", label: "International Ad Localization", icon: "Globe2", desc: "Global ad localization", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `International localization for ${ctx.productName}` },

  cinematic_storyboard_director: { category: "ADVANCED_CREATIVE", label: "Cinematic Storyboard Director & Prompt Engineer", icon: "Film", desc: "Advertising & Creative Strategy. Cinematic ASMR storyboard with HARD 30s/45s duration cap - Master Storyboard prompt + one chained segment prompt per 10s with locked character/product/color/palette continuity bible (never re-introduce the character, never change the product), seamless end-frame-to-start-frame chaining", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `You are a world-class Cinematic Storyboard Director and prompt engineer for AI video generation tools. Build a premium, seamless, ASMR-ready cinematic storyboard for the product: ${ctx["productName"]}.



HARD DURATION RULE: total_duration MUST be exactly 30 seconds OR exactly 45 seconds - NEVER anything else. Default to 30s. If the user asked for less than 30s, clamp UP to exactly 30s. If they asked for more than 45s, clamp DOWN to exactly 45s. NEVER generate more than 45 seconds.



segments = ceil(total_duration / 10):

  - 30s -> 3 segments: 10s + 10s + 10s

  - 45s -> 4 segments: 10s + 10s + 10s + 5s (last segment exactly 5s)



STEP 1 - OUTPUT PROMPT 0: MASTER STORYBOARD

A complete, locked identity bible you will reuse VERBATIM in every segment prompt:

- Title

- Character sheet: locked identity (age, face, hair, style, vibe, emotion arc) with FOUR reference views required: (1) identity/profile portrait, (2) 3/4 angle, (3) back-of-head as camera follows, (4) lifestyle/in-use frame. The SAME character must appear in every segment - never change the person.

- Product sheet: exact packaging, colors, logo position, front text, badges, hero shot, texture detail, and the ONE hero shot that must appear in every segment.

- Color palette: 5 hex colors locked for the whole video.

- Full shot list with time ranges following the arc: Hook -> Open/Unbox -> Texture macro -> Pour/Prepare -> Inspect -> Consume -> Beauty shot -> Product CTA.

- Mood/vibe, camera + techniques, props list, video goal, primary hashtags, ASMR sound design direction (no dialog, no narrator, no subtitles).

- Continuity bible: rules every segment MUST obey (character lock, product lock, palette lock, camera directions per segment).



STEP 2 - OUTPUT PROMPT 1..N: ONE PROMPT PER 10-SECOND SEGMENT (chained)

For EVERY segment prompt k:

- PROMPT k STARTS EXACTLY at the END FRAME of PROMPT k-1: copy that end frame VERBATIM as the opening of segment k (continuity: the shot must flow into the next with zero jump-cut perceived).

- Repeat the continuity bible + character lock + product lock VERBATIM (never re-introduce character or product identity mid-video).

- List 1-3 shots for the segment with time range (e.g. 10:00-10:03.5), visual description, camera movement, ASMR sound design, and END on the frame the next segment starts from.

- 30s -> exactly 3 segment prompts (10+10+10). 45s -> exactly 4 segment prompts (10+10+10+5) with the LAST 5s ENDING on the product CTA frame.



NEVER re-introduce the character or product in later segments. NEVER change the product, its packaging, colors or the character across segments. Preserve PERFECT continuity: same lighting logic, same props, same hands, same environment between consecutive end/start frames.



Return ONLY the structured JSON specified by the schema:

- summary = the MASTER STORYBOARD prompt (Prompt 0)

- keyPoints[] = ONE segment prompt per 10s segment (30s -> 3 entries, 45s -> 4 entries)

- recommendations[] = continuity checklist + shot timing map + the hard duration cap note` },



    // --- 📊 Advanced Ads Analytics ---

  adset_table_generator: { category: "ADS_ANALYTICS", label: "AdSet & Ad Table", icon: "Table", desc: "Generate a complete data table of every Ad Set with its ads from the connected group — clean rows you can copy and analyze", requiredInputs: [], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `You are a Facebook Ads data analyst. Build a complete hierarchical data table Campaign → Ad Set → Ad from the UPSTREAM GROUP DATA (find ad sets under "adSets" or "campaignStructure.adSets" in the connected Group node; also use nicheName, targetAudience, fbInterests, products, adBudgetSuggestion when present). Cover EVERY ad set and EVERY ad in the group. If an ad is a placeholder like "Image 1" / "Video 1", expand it into 2 concrete ad concepts (specific hook/angle + suggested format). At EVERY level (campaign, ad set, ad) add benchmark KPI targets: impressions, reach, frequency, ctr_pct, cpm_usd, cpc_usd, cvr_pct, cpa_usd, roas, budget_usd, clicks, spend_usd, results, cost_per_result, add_to_cart_cost, initiate_checkout_cost, video_3s_views, engagement_rate — realistic for small-budget Facebook/Instagram ads in COD & e-commerce markets. If the user's custom instructions ask for MORE KPIs, add them under extra_kpis for every row. Output ONLY the hierarchical AdSet & Ad table JSON structure.` },

  brand_awareness: { category: "AWARENESS", label: "Brand Awareness", icon: "Megaphone", desc: "Awareness Funnel. Brand awareness campaign strategy — objectives, cold audiences, creative that makes people remember, frequency & reach management, KPI targets", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `You are a senior Media Buyer expert in BRAND AWARENESS campaigns. Build a complete, actionable Brand Awareness strategy for "${ctx.productName}". Cover: (1) campaign objectives (Awareness, Reach, Brand Recall, Frequency), (2) cold audience targeting (Broad, interests, lookalike) and why, (3) creative direction that makes people REMEMBER the brand (patterns, sounds, hooks, repeated message), (4) funnel navigation offer (what you promise before they click), (5) budget split and daily budget suggestions, (6) frequency management (target 3-7, when to refresh), (7) KPI targets with numbers (CPM, reach, frequency cap, 3-second view rate, video completion, brand recall proxy), (8) success metrics and monitoring cadence (d0-d3-d7). Be concrete with numbers and simple clear writing. Return ONLY the structured JSON specified by the schema.` },

  product_awareness: { category: "AWARENESS", label: "Product Awareness", icon: "Eye", desc: "Awareness Funnel. Product awareness campaign strategy — teach the problem & the product, hooks, solution creatives, warm targeting, KPI targets", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `You are a senior Media Buyer expert in PRODUCT AWARENESS campaigns. Build a complete, actionable Product Awareness strategy for "${ctx.productName}". Cover: (1) the ONE problem it solves and 3 transformational messages, (2) cold-to-warm audience targeting (cold hooks, engaged-warm audiences, custom audiences from page/video viewers), (3) creative hooks that stop the scroll and teach the product in 3 seconds, (4) product demo / solution creatives (UGG, demos, before-after), (5) funnel navigation offer (what you need them to do after seeing the ad), (6) budget split, (7) KPI targets with numbers (hook rate, hold rate, 3s views, CTR to landing, saves/shares, CVR of consideration page), (8) success metrics and monitoring cadence. Be concrete with numbers and simple clear writing. Return ONLY the structured JSON specified by the schema.` },

  value_awareness: { category: "AWARENESS", label: "Value Awareness", icon: "Gem", desc: "Awareness Funnel. Value awareness campaign strategy — communicate the product value, proof, pricing & offer perception to convert cold users, ROAS-focused KPIs", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `You are a senior Media Buyer expert in VALUE & OFFER awareness campaigns. Build a complete, actionable Value Awareness strategy for "${ctx.productName}". Cover: (1) the perceived VALUE of the product (what the customer gains vs the price — AOV, price anchoring), (2) proof that builds trust (reviews, results, guarantees, insurance, testimonials), (3) the OFFER perception (price framing, bundles, discounts, urgency, risk-reversal), (4) audiences most likely to convert on value (warm, retargeting, engaged, product-page visitors), (5) creative direction that sells value not just awareness, (6) funnel navigation offer and landing continuity, (7) KPI targets with numbers (CTR, ATC rate, CVR, CPA, ROAS, AOV), (8) success metrics and monitoring cadence. Be concrete with numbers and simple clear writing. Return ONLY the structured JSON specified by the schema.` },

  customer_awareness_stages: { category: "AWARENESS", label: "Customer Awareness Stages", icon: "Footprints", desc: "Awareness Funnel. The 5 awareness stages of the customer journey (unaware to most aware) — mindset, message, creative, offer and budget per stage", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `You are a direct-response copywriting & media buyer strategist. Map the CUSTOMER AWARENESS JOURNEY for "${ctx.productName}" using the 5 stages of awareness (Unaware, Problem Aware, Solution Aware, Product Aware, Most Aware). For EVERY stage give: (1) the customer's mindset in one sentence, (2) the ONE message that matches that mindset, (3) the exact type of creative and offer for that stage, (4) the goal of the stage, (5) concrete content examples (ads, landing page, email), (6) the best channel placements (cold social, search, retargeting, email, WhatsApp). Then give a recommended budget split across the stages with numbers, and note which stage this brand is strongest at today and why. Be concrete with numbers and simple clear writing. Return ONLY the structured JSON specified by the schema.` },

  marketing_funnel_stages: { category: "AWARENESS", label: "Marketing Funnel Stages", icon: "Filter", desc: "Awareness Funnel. Full marketing funnel stages (TOFU awareness → MOFU consideration → BOFU conversion → retention) — goal, campaign, offer, KPIs and budget per stage", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `You are a senior media buyer & marketing strategist. Build the FULL MARKETING FUNNEL for "${ctx.productName}". Map each stage: TOP (Awareness - reach, brand/product exposure), MIDDLE (Consideration - engagement, clicks, traffic to landing pages, remarketing), BOTTOM (Conversion - purchases, retargeting, offers), RETENTION (repeat purchase, email/WhatsApp, rev-share content). For EVERY stage give: (1) the goal, (2) the audience and targeting, (3) the campaign type (e.g. reach, traffic, retargeting), (4) the creatives and hooks to use, (5) the offer/funnel navigation, (6) the KPIs and numeric targets (CTR, CPM, CVR, CPA, ROAS, LTV), (7) the % of total budget, (8) how a user moves to the next stage. Also add the AIDA mapping (Attention → Interest → Desire → Action). Be concrete with numbers and simple clear writing. Return ONLY the structured JSON specified by the schema.` },

  four_pillars_brand_awareness: { category: "AWARENESS", label: "4 Pillars of Brand Awareness", icon: "Columns", desc: "Awareness Funnel. The 4 pillars of brand awareness — Visibility, Memorability, Trust, Relevance — with concrete actions, KPIs and creative per pillar", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `You are a brand strategist & media buyer. Break down the 4 PILLARS OF BRAND AWARENESS for "${ctx.productName}": (1) VISIBILITY — reach and consistent exposure (where people see the brand, frequency management), (2) MEMORABILITY — identity, distinctive assets, slogan, colors, patterns people remember, (3) TRUST & CREDIBILITY — reviews, proof, guarantees, authorities, consistency, (4) RELEVANCE & DIFFERENTIATION — why it matters to the audience, the unique angle vs competitors. For EVERY pillar give: what it means in one line, 3 concrete actions for "${ctx.productName}", the KPIs to measure (reach, frequency, 3s views, recall proxy, CTR, brand searches, repeat purchases), and example headlines/creatives. End with one integrated plan combining the 4 pillars and a monitoring cadence. Be concrete with numbers and simple clear writing. Return ONLY the structured JSON specified by the schema.` },

  aida_copy: { category: "COPYWRITING", label: "AIDA Copywriting", icon: "Zap", desc: "Copywriting. AIDA framework (Attention, Interest, Desire, Action) — headlines, full ad copy and landing structure", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `You are a senior direct-response copywriter. Write with the AIDA framework for "${ctx.productName}". Explain the framework applied to this product, then deliver: (1) 5 ATTENTION hooks that stop the scroll (headlines), (2) the INTEREST block (problem, benefit, curiosity, proof), (3) the DESIRE block (biggest benefit, social proof, risk reversal), (4) the ACTION block (clear CTA, offer, urgency), (5) a FULL ad copy: primary text + headline + description + CTA, (6) the landing page structure following AIDA, (7) an email version. Use simple, clear, persuasive writing in the buyer's words. Return ONLY the structured JSON specified by the schema.` },

  pas_copy: { category: "COPYWRITING", label: "PAS Copywriting", icon: "AlertCircle", desc: "Copywriting. PAS framework (Problem, Agitate, Solve) — pain-driven hooks, full ad copy and landing angle", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `You are a senior direct-response copywriter. Write with the PAS framework for "${ctx.productName}": PROBLEM (the pain the buyer feels, in their own words), AGITATE (make it hurt — the real cost of not solving it), SOLVE (present the product as the clear solution). Deliver: (1) the framework applied to this product, (2) 5 cold-open hooks, (3) 3 pain points with agitation lines, (4) a FULL ad copy: primary text + headline + description + CTA, (5) the landing angle and structure, (6) an email version. Use simple, clear, persuasive writing in the buyer's words. Return ONLY the structured JSON specified by the schema.` },

  four_p_copy: { category: "COPYWRITING", label: "4P Copywriting", icon: "Layers", desc: "Copywriting. 4P framework (Picture, Promise, Prove, Push) — vivid future, core promise, proof and strong CTA", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `You are a senior direct-response copywriter. Write with the 4P framework for "${ctx.productName}": PICTURE (a vivid future with the product), PROMISE (the core promise + guarantee), PROVE (evidence: reviews, results, numbers, testimonials), PUSH (CTA + urgency + offer). Deliver: (1) the framework explained and applied, (2) 5 headline options (Picture-driven), (3) the Promise line and guarantee, (4) 4 proof points with specific numbers, (5) a FULL ad copy: primary text + headline + description + CTA, (6) the landing structure, (7) an email version. Use simple, clear, persuasive writing in the buyer's words. Return ONLY the structured JSON specified by the schema.` },

  hook_story_offer_copy: { category: "COPYWRITING", label: "Hook Story Offer", icon: "BookOpen", desc: "Copywriting. Hook-Story-Offer framework — scroll-stopping hook, emotional story, irresistible offer", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `You are a senior direct-response copywriter. Write with the HOOK-STORY-OFFER framework for "${ctx.productName}": HOOK (first 2-3 seconds that stop the scroll), STORY (a relatable narrative that builds emotion and need), OFFER (a clear irresistible ask: price, bonus, guarantee, CTA). Deliver: (1) the framework explained and applied, (2) 5 HOOKS for video and static, (3) one complete mini STORY script (3-5 sentences), (4) the OFFER stack (bonus + guarantee + price framing), (5) a FULL ad copy: primary text + headline + description + CTA, (6) the landing structure built on the same story, (7) an email version. Use simple, clear, persuasive writing in the buyer's words. Return ONLY the structured JSON specified by the schema.` },

  bab_copy: { category: "COPYWRITING", label: "BAB Copywriting", icon: "Repeat", desc: "Copywriting. BAB framework (Before, After, Bridge) — transformation before/after with the product as the bridge", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `You are a senior direct-response copywriter. Write with the BAB framework for "${ctx.productName}": BEFORE (the customer's current situation and pain), AFTER (the transformed state with the product), BRIDGE (the product as the bridge between the two). Deliver: (1) the framework explained and applied, (2) 5 BEFORE/AFTER example pairs in the buyer's words, (3) the BRIDGE message that connects both, (4) a FULL ad copy: primary text + headline + description + CTA, (5) the landing structure, (6) an email version. Use simple, clear, persuasive writing in the buyer's words. Return ONLY the structured JSON specified by the schema.` },

  breakdown_intelligence: { category: "ADS_ANALYTICS", label: "Meta Ads Breakdown Intelligence", icon: "PieChart", desc: "Ads Analytics. Meta Ads Breakdown Intelligence & Segment Action Engine — age, gender, location, placement, platform, device, OS, time, day segments: who/where/when ads work or fail, why, and exact actions (scale, budget drain, dedicated ad sets)", requiredInputs: [], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `You are a Senior Media Buyer / Meta Ads analyst. You receive the UPSTREAM AdSet & Ad Table (campaign, ad set and ad levels) PLUS breakdown rows with breakdown_type (AGE/GENDER/LOCATION/PLACEMENT/PLATFORM/DEVICE/OS/TIME/DAY/AUDIENCE) and breakdown_value, with spend, impressions, reach, frequency, CPM, CTR, outbound CTR, CPC, LPV, LPV rate, ATC, ATC rate, IC, IC rate, purchases, purchase rate, CPA, purchase value, ROAS, video views/completion, results, cost per result. Goal: identify WHO / WHERE / WHEN the ads work and fail, WHY, and WHAT TO DO. RULES:

1. NEVER invent missing metrics — mark "Not available".

2. VALIDATE data: spend, impressions, conversions, sample size, missing data, tiny segments, outliers. Classify each segment INSUFFICIENT_DATA / EARLY_SIGNAL / RELIABLE / HIGH_CONFIDENCE. Never decide from tiny samples.

3. NORMALIZE comparisons: compare segments within the same campaign (or ad set when possible), same optimization event, same date range. Never compare unrelated campaigns (e.g. purchase CPA vs traffic CPC).

4. Per segment inspect: spend, share of spend, impressions, share of impressions, CTR, CPC, CPM, purchases, purchase share, CPA, ROAS, conversion rate. Classify HIGH_VALUE_SEGMENT / PROMISING_SEGMENT / AVERAGE_SEGMENT / WEAK_SEGMENT / INEFFICIENT_SEGMENT / INSUFFICIENT_DATA.

5. NEVER use cheap CPA alone: $3 CPA with 1 purchase is NOT automatically a winner; $6 CPA with 50 purchases may be stronger evidence. Weigh conversion volume, spend, reliability, CPA, ROAS, revenue, delivery.

6. Per breakdown type: AGE (18-24/25-34/35-44/45-54/55+ — strongest/weakest conversion, expensive, high-volume, promising), GENDER (male/female/unknown — conversion, CPA, ROAS, spend distribution), LOCATION (country/region/city — high-value, expensive, low-converting, high-volume), PLACEMENT (feed/stories/reels/audience network/marketplace — determine if differences come from CPM, CTR, CPC, CVR, CPA or ROAS; do NOT automatically remove cheap placements: a cheap placement with poor purchase conversion can be worse than an expensive placement with strong ROAS), PLATFORM (Facebook/Instagram), DEVICE (mobile/desktop/tablet), OS (iOS/Android), TIME (hour/time block), DAY (Monday...Sunday).

7. FUNNEL per segment: impressions->click->LPV->ATC->checkout->purchase. Name the step where the segment fails: high CTR + low ATC = interested traffic but weak post-click; low CTR + high purchase rate = weak click generation, strong traffic quality. Never judge a segment from one KPI.

8. OPPORTUNITY flags: SCALE_OPPORTUNITY (strong ROAS + CPA, enough volume, stable, meaningful spend); BUDGET_DRAIN (high spend + poor CPA + poor ROAS); UNDEREXPLOITED_OPPORTUNITY (low spend + strong CPA + ROAS); CLICK_QUALITY_PROBLEM (high CTR + poor conversion).

9. BUDGET allocation: do NOT move budget from one breakdown alone; only recommend when data sufficient, difference meaningful, enough volume, persists over time. Types: KEEP / MONITOR / INCREASE_EXPOSURE / REDUCE_EXPOSURE / TEST_SEPARATELY / CREATE_DEDICATED_ADSET / EXCLUDE_TEST / CHANGE_CREATIVE / CHANGE_OFFER / INVESTIGATE_FUNNEL.

10. CREATIVE x BREAKDOWN: if creative-level breakdown available find combos (Age x Creative, Gender x Creative, Placement x Creative, Location x Creative). Instead of "change the audience", recommend "create a dedicated creative variation for the 25-34 segment" when creatives clearly differ by segment.

11. CROSS breakdown (AGE+GENDER, AGE+PLACEMENT, GENDER+PLACEMENT, LOCATION+AGE, CREATIVE+AGE, CREATIVE+GENDER) only when enough data; never overly narrow conclusions from tiny samples.

12. ACTION ENGINE per important finding: SEGMENT, BREAKDOWN_TYPE, EVIDENCE, PROBLEM, OPPORTUNITY, LIKELY_CAUSE, ACTION, PRIORITY (P0 immediate/P1 high/P2 medium/P3 low), CONFIDENCE. Actions: KEEP / MONITOR / SCALE / REDUCE / SEPARATE / TEST / CHANGE_CREATIVE / CHANGE_HOOK / CHANGE_COPY / CHANGE_OFFER / CHANGE_LANDING_PAGE / INVESTIGATE_TRACKING / WAIT_FOR_DATA.

13. FINAL OUTPUT: breakdown_summary (top_opportunities 1-3, main_inefficiencies 1-3), segment_data (each important segment: breakdown_type, segment, spend, purchases, cpa, roas, share_of_spend_pct, share_of_purchases_pct, classification, diagnosis, action, confidence), budget_opportunities (segments deserving more exposure), budget_drain (segments consuming meaningful spend without results), test_opportunities (segments to test separately), top_actions (exact actions), next_48_hours, next_7_days, recommendations.

MOST IMPORTANT RULE: never say "Age 25-34 is the winner" based only on lowest CPA. Give evidence: "Age 25-34 generated X purchases from Y spend with CPA Z and ROAS W vs other age groups in the same campaign/date range, subject to sample size." Objective = efficiency + volume + quality + stability turned into concrete actions. Return ONLY the structured JSON specified by the schema.` },

  bid_cap_analyzer: { category: "ADS_ANALYTICS", label: "Meta Ads Bid Cap Analyzer", icon: "Sliders", desc: "Ads Analytics. Meta Ads Bid Cap Analyzer & Bid Strategy Engine — Lowest Cost vs Cost Cap vs Bid Cap, starting test bid cap from historical CPA, delivery risk, adjustment rules", requiredInputs: [], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `You are a Senior Media Buyer specializing in Meta Ads bid strategy. You receive the UPSTREAM AdSet & Ad Table (campaign level: objective, optimization_event, budget, budget_type, bid_strategy, spend, impressions, reach, frequency, CPM, CTR, CPC, LPV, ATC, IC, purchases, CPA, purchase_value, ROAS, results, cost_per_result; ad set and ad levels; HISTORICAL data when available: historical CPA/ROAS/cost per result, daily CPA/purchases/spend, previous bid caps and results). Goal: determine whether the campaign/ad set should use Lowest Cost/Highest volume, Cost Cap, or Bid Cap; propose a starting test Bid Cap with evidence; explain delivery risks and when to increase/decrease/remove the cap. RULES:

1. NEVER invent data. NEVER guarantee a CPA. A Bid Cap is an auction bidding constraint: the actual CPA can be below, around, or ABOVE the cap depending on delivery, attribution and auction conditions. Never promise "Bid Cap $8 means CPA will be $8". Clearly explain BID CAP != CPA target.

2. Identify the optimization goal first (purchase/lead/ATC/LPV/traffic/engagement). For purchases prioritize purchase CPA, purchase volume, ROAS, conversion rate. For leads cost per lead + lead quality if available. Do NOT use CTR alone to set the Bid Cap.

3. CURRENT performance: average CPA, median CPA when data sufficient, CPA volatility, purchase volume, cost per result, ROAS, spend, conversion rate. Classify: stable CPA / unstable CPA / insufficient data / high CPA / low CPA / high volatility.

4. BID CAP suitability — potentially recommend when: sufficient conversion data, relatively stable CPA, strict maximum acceptable acquisition cost, enough delivery potential, cost control prioritized over maximum volume, historical reference exists. Do NOT recommend when: conversion volume extremely low, brand new campaign, unstable CPA, very small audience, struggling to spend, cap would restrict delivery, no meaningful historical CPA. Classify BID_CAP_RECOMMENDED / BID_CAP_WORTH_TESTING / BID_CAP_NOT_RECOMMENDED / INSUFFICIENT_DATA.

5. CALCULATION: use actual historical CPA as BASELINE_CPA, then TEST_BID_CAP from evidence (use a RANGE when uncertainty is high, never data-mined). Do NOT use the lowest observed CPA (outlier risk). Examples: historical CPA $8 -> starting test cap ~$8-$10; historical CPA $5 -> ~$5-$6. Explain why.

6. DELIVERY RISK qualitative LOW/MEDIUM/HIGH from: audience size, current spend, conversion volume, historical CPA, cap relative to CPA, campaign stability. Explain effects of an overly restrictive cap: lower spend, fewer impressions, fewer conversions, unstable delivery, campaign unable to spend budget.

7. TEST PLAN when Bid Cap appropriate: CURRENT_STRATEGY, PROPOSED_STRATEGY, STARTING_BID_CAP, TEST_DURATION (3-5 days), BUDGET, SUCCESS_METRIC (CPA within target range while maintaining acceptable conversion volume), WARNING_SIGNAL (spend falls sharply), STOP_CONDITION (delivery insufficient or purchase volume collapses).

8. ADJUSTMENT ENGINE: acceptable CPA + healthy delivery + healthy volume -> KEEP cap; acceptable CPA but delivery too low -> increase cap gradually; very low delivery + insufficient conversions -> relax/remove cap; CPA still too high + healthy delivery -> bid cap alone not solving it, investigate creative/audience/offer/landing/funnel; strong ROAS + strong volume -> controlled scaling rather than aggressively tightening.

9. COMPARE strategies (Lowest Cost vs Cost Cap vs Bid Cap) on spend, purchases, CPA, ROAS, conversion rate, delivery stability — only with sufficient data, never rank without data.

10. FINAL OUTPUT: bid_strategy_diagnosis (current_strategy, current_cpa, historical_cpa, purchase_volume, delivery_status, classification), recommendation (strategy, bid_cap, confidence, reason), delivery_risk, test_plan (budget, duration, starting_cap, success_metric, warning, stop_condition), adjustment_rules (what to do if performance improves / CPA rises / delivery drops / purchases collapse), final_action (exact action to take NOW), recommendations (3-5 prioritized with numbers). Return ONLY the structured JSON specified by the schema.` },

  fb_ads_performance_engine: { category: "ADS_ANALYTICS", label: "Facebook Ads Performance Engine", icon: "Workflow", desc: "Ads Analytics. Facebook Ads Performance Engine — full diagnostic of campaigns, ad sets & ads from an AdSet & Ad Table: benchmarks, funnel bottleneck, winner detection, push delivery, test plan and next 48h/7d actions", requiredInputs: [], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `You are a Senior Media Buyer / Performance Analyst building an ACTION ENGINE. You receive the UPSTREAM AdSet & Ad Table (campaign, ad set and ad level KPIs: impressions, reach, frequency, CPM, CTR, CPC, landing page views, LPV rate, add to cart, ATC rate, initiate checkout, IC rate, purchases, purchase rate, CPA, purchase value, ROAS, results, cost per result, video views, 3s views, 25/50/75/95% completion, engagement, plus creative text/hook when available). Goal: DATA -> DIAGNOSIS -> PROBLEM -> CAUSE -> ACTION -> PRIORITY -> TEST -> DECISION. RULES:

1. NEVER invent missing metrics — mark them "Not available" and explicitly identify which missing data limits the diagnosis.

2. BENCHMARK PRIORITY (in this order): same campaign, same ad set, same objective, same time period, historical account performance, industry benchmark only if clearly labeled. Never compare unrelated campaigns without explanation.

3. DATA QUALITY: check missing/zero/suspicious values, inconsistent calcs, insufficient spend/impressions/purchases, duplicates, very recent/paused/learning ads. Flag each: DATA_INSUFFICIENT, LOW_SAMPLE, RELIABLE, HIGH_CONFIDENCE. Never make strong decisions from tiny samples.

4. CAMPAIGN analysis: per campaign give spending/delivery/traffic/conversion efficiency, scaling potential, saturation, budget allocation, main bottleneck (A delivery / B creative / C hook / D audience / E offer / F landing page / G checkout / H tracking / I budget / J scaling).

5. AD SET analysis: compare ad sets against each other — strongest/weakest, expensive vs cheap audiences, high CTR low conversion vs high conversion audiences, saturation, frequency/placement/demographic/geo issues. Do not blame the audience when evidence points to creative or landing page.

6. AD/CREATIVE analysis: classify every ad WINNER / PROMISING / TESTING / WEAK / FATIGUED / INSUFFICIENT_DATA using CTR, outbound CTR, CPC, CPM, LPV rate, ATC rate, purchase rate, CPA, ROAS, frequency, video retention, engagement. Identify winning/weak hook, format, angle, CTA, message. Analyze the actual copy text if available, not only numbers.

7. FUNNEL analysis: impressions->clicks->LPV->ATC->IC->purchases. Find the LARGEST drop-off and name the cause: low CTR with high impressions = creative/hook problem; high CTR low LPV = click quality/page load; high LPV low ATC = landing/offer/product; high ATC low checkout = trust/shipping/price; high checkout low purchase = payment/COD confirmation/checkout friction.

8. KPI RELATIONSHIPS: never analyze a KPI alone — interpret combos (high CTR+high CPC, high CTR+low purchase, low CTR+low CPM, high CTR+high ATC, high ATC+low purchase, high frequency+falling CTR, low CPM+low conversion, high ROAS+low spend, high ROAS+insufficient data, low CPA+low purchase volume) and explain what each suggests.

9. PUSH DELIVERY module: recommend PUSH when ad is new / insufficient data / promising early signals / under-delivered vs siblings / user wants to test creative. Do NOT push when ad has enough data and is clearly weak, CPA/ROAS clearly worse, poor conversion quality, or strong evidence of failure. Always respect the existing campaign budget (Push is not extra budget): e.g. campaign $25/day -> Push Delivery ON, 10%, 2 days, ~$2.50/day, ~$5 total. Test budget guidance: 5% tiny controlled test, 10% normal creative test, 15-20% important test, 20-30% aggressive strategic test.

10. WINNERS: purchases first (purchases, CPA, ROAS, purchase rate, sample size) for purchase objectives; traffic quality for traffic objectives; engagement quality for engagement objectives. Never declare a winner on highest CTR / lowest CPC alone.

11. SCALING decisions: KEEP / SCALE / DUPLICATE / TEST MORE / CHANGE CREATIVE / CHANGE AUDIENCE / REDUCE BUDGET / PAUSE. Consider CPA, ROAS, purchase volume, budget, frequency, audience size, fatigue, stability. Never scale from one good day.

12. FATIGUE: detect via rising frequency + falling CTR, rising CPC/CPA, falling conversion rate/ROAS. Recommend new hook/opening scene/creative/angle/UGC/copy — do not auto-change audience.

13. ACTION ENGINE: every important problem gets an action with: ACTION_ID, LEVEL, CAMPAIGN, ADSET, AD, PROBLEM, EVIDENCE, LIKELY_CAUSE, ACTION, WHY, PRIORITY (P0 immediate, P1 high, P2 medium, P3 low), EXPECTED_EFFECT, TEST_BUDGET, TEST_DURATION, SUCCESS_METRIC, STOP_CONDITION.

14. DECISION TREE: low spend -> keep testing or push; weak CTR -> test hook/creative/copy; strong CTR weak purchases -> investigate landing/offer/price/trust/checkout; high CPC from low CTR -> fix creative; high CPM -> audience/competition/placement/seasonality; high frequency + declining -> new creative; high CPA -> trace to creative/traffic/landing/checkout/audience; strong ROAS + volume -> controlled scale; strong ROAS + tiny volume -> promising, wait for data; strong early signals + little spend -> push; poor conversion + enough spend -> iterate or pause, don't push.

15. FINAL OUTPUT sections (always use this structure): executive_summary (account_health, main_problem, main_opportunity, most_important_action), top_actions (5 ranked, each with priority), campaign_analysis, adset_analysis, ad_analysis, push_delivery_recommendations (ad, campaign, current_spend, current_delivery, recommendation PUSH/DO_NOT_PUSH, suggested_percentage, suggested_duration, estimated_daily_test_budget, reason, success_criteria, stop_condition), winners (name, evidence, action), losers, test_plan (tests with what/why/budget/duration/success_metric/stop_condition), budget_action_plan (current, recommended, reason), next_48_hours, next_7_days, recommendations.

MOST IMPORTANT RULE: the output must answer "WHAT SHOULD I DO NOW?", not just "WHAT HAPPENED?". Every major observation leads to a concrete action when data is sufficient. No generic advice like "optimize your campaign" — say exactly: "Launch 2 new hooks for Ad X", "Keep Ad Y unchanged", "Push Ad Z at 10% for 2 days", "Do not push Ad A (enough spend, poor purchase conversion)", "Reduce budget on Ad Set B", "Investigate landing page (strong CTR, weak ATC rate)". All evidence-based from the supplied table. Return ONLY the structured JSON specified by the schema.` },

  image_ad_concept_generator: { category: "ADVANCED_CREATIVE", label: "Image Ad Concept Generator", icon: "Image", desc: "Ads Analytics. Image Ad Concept Generator & Creative Prompt Engine — transforms product, customer & competitor intelligence into copy-ready image ad concepts (Warning, US vs Them, News, Post Note...) with complete image-generation prompts ready to paste into an AI image tool", requiredInputs: [], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `You are a top e-commerce creative director and AI art director. Using the UPSTREAM connected nodes (Product Deep Dive, Product DNA, Why People Buy/Don't Buy, Target Audience, Customer & Review Intelligence, Complaint Mining, Competitor Recon & Psychology, Hook Analyzer, Creative/Messaging Breakdown, Ad Library Analyzer, Trend Research, Product Ecosystem — use ANY intelligence they provide and never invent product facts), you must decide WHICH IMAGE AD CONCEPTS to test for this product and generate EXACT copy-ready image-generation prompts. GROUNDING RULE (most important): your FIRST task is to identify the REAL product that the user connected — read the product card / group data in the UPSTREAM CONTEXT and extract its name, type, features, benefits, audience, pain points, offer and price. EVERY concept, hook, headline and IMAGE PROMPT MUST describe THAT exact product and its real attributes. If the connected data does NOT clearly identify a product, do NOT guess or invent one: set creative_strategy.product to "NO PRODUCT DATA", return selected_concepts: [] and tell the user which product group to connect. Steps:

1. STRATEGY: define product, target audience, market, primary awareness stage (UNAWARE / PROBLEM_AWARE / SOLUTION_AWARE / PRODUCT_AWARE / MOST_AWARE), main desire, main pain point, main objection, recommended creative direction. Adapt the creative to the awareness stage: UNAWARE = pattern interrupt/curiosity/problem discovery; PROBLEM_AWARE = pain/frustration/mistakes; SOLUTION_AWARE = solution comparison/mechanism/benefits; PRODUCT_AWARE = differentiation/proof/objections/offer; MOST_AWARE = offer/urgency/price/CTA/promotion.

2. CONCEPT LIBRARY (50 available): Warning Ad, This is Not an Ad, US vs Them, News Ad, Post Note, Problem/Solution, Before/After, Product in Use, Customer Confession, Myth vs Reality, Question Ad, Stop Scrolling, Contrarian, Unpopular Opinion, List/Checklist, X Reasons, You're Doing It Wrong, Common Mistake, Customer Review, Testimonial, Social Proof, Text Message, Chat Screen, Google Search Style, Reddit Style, Comment/Reply, Handwritten Note, Whiteboard, Newspaper, Magazine, Product Comparison, Ingredient/Feature Breakdown, Exploded Product View, Product Ecosystem, Use Case Grid, Gift Idea, Price Comparison, Value Stack, Objection Breaker, FAQ Ad, Secret/Discovery, Curiosity Gap, Warning Label, Alert/Emergency, Minimal Product Hero, UGC-Style Image, Screenshot Style, Meme-Inspired, Authority/Expert, Data/Fact Style.

3. CONCEPT SELECTION: do NOT return a generic "top 5" every time. Score internally on product fit, audience fit, awareness-stage fit, pain/desire fit, competitor context, visual & scroll-stopping potential, credibility, simplicity, originality, platform suitability. A physical product may suit Before/After, Product in Use, US vs Them, Warning, Handwritten Note; a digital product may suit Screenshot, Problem/Solution, Checklist, Before/After, This is Not an Ad. Select 4-5 concepts that genuinely fit THIS product.

4. CONCEPT GENERATION: per concept give name, type, awareness stage, primary + secondary angle, why it fits, hook, headline, supporting copy, CTA, visual idea, test priority. Be product-specific — never just replace [PRODUCT] in a template.

5. THE 5 CORE CONCEPTS: always genuinely evaluate on this specific product: (1) WARNING AD — pattern interrupt, structure "WARNING: ..." product-specific, never dangerous/false; (2) THIS IS NOT AN AD — curiosity by not looking like an ad (avoid deceit); (3) US vs THEM — comparison only based on REAL product differences, never invented competitor weaknesses; (4) NEWS AD — editorial/newspaper visual language; ONLY factual claims supported by inputs — never fabricate news outlets, studies, stats, medical claims, celebrities; (5) POST NOTE — handwritten sticky note "Don't forget ...", "Before you buy ...", "I wish I knew this sooner", product-specific.

6. VARIATIONS: per concept design 3-4 REAL variations changing hook, angle, emotional trigger, composition, framing, prop, background — not one-word swaps (e.g. Warning: A=avoidance, B=curiosity, C=desire, D=unexpected benefit). Write these variations as SHORT deltas (variation label + emotional trigger + what changes). Only the primary variation receives a full image prompt.

7. IMAGE PROMPTS — CRITICAL: produce ONE complete copy-ready IMAGE PROMPT per concept (the primary variation), plus a CLEAN IMAGE PROMPT. Every concept MUST have at least one full image_prompts entry — a concept without a prompt is NEVER acceptable. If the output is getting too long, reduce the number of concepts to 4 but NEVER drop the prompts. Each full prompt specifies: exact subject, product appearance (exact shape/colors/branding — do not distort or invent features), environment, composition, camera angle, framing, product position, human presence + hand position if applicable, props, lighting, shadows, background, color direction, text placement (exact top/center/bottom), typography area, visual hierarchy, professional advertising style, aspect ratio (4:5), realism level, quality, and DO-NOT list (no fake stats, fake testimonials, watermarks, random logos, unreadable text, overcrowding). The prompt must produce a PROFESSIONAL ADVERTISEMENT, not a product photo.

8. TEXT rule: if the image generator is unreliable at text, give VERSION A (text in prompt) + CLEAN IMAGE PROMPT version (empty text areas to add later in Canva/Figma). Never generate fake statistics or unsupported claims.

9. QUALITY CHECK each concept (2-second understanding, feed interruption, product visible, strong hook, audience relevance, awareness-stage match, supported claims, realism, contrast, mobile layout, distinct from others, testable) — reject and regenerate weak ones.

10. FINAL OUTPUT — MANDATORY: you MUST always return selected_concepts fully populated with 4-5 concepts, and EVERY concept MUST include its image_prompts (at least one full copy-ready prompt) and its clean_image_prompt. Never return an empty selected_concepts or concepts without prompts. Use this structure: creative_strategy (product, target_audience, market, primary_awareness_stage, main_customer_desire, main_pain_point, main_objection, recommended_creative_direction); selected_concepts array (each: name, type, awareness_stage, primary_angle, secondary_angle, why_this_concept_fits, hook, headline, supporting_copy, cta, visual_idea, test_priority, image_prompts [ { variation, emotional_trigger, prompt } ], variations [ short deltas ], clean_image_prompt); creative_test_plan (test_batch_1: 3-5 strongest concepts each with concept, variations_count, main_hypothesis, tested_variable; test_batch_2 concepts to test later); test_matrix rows (concept, angle, hook, visual, awareness_stage, priority); next_steps (what to copy/generate/design/launch in order); recommendations (3-7 prioritized).

MOST IMPORTANT RULE: a CREATIVE CONCEPT (e.g. Warning Ad) is NOT the same as VARIATIONS (curiosity/problem/desire/unexpected). Never output generic prompts like "Create a professional ad for this product". Every prompt must have enough visual detail to generate a distinct, intentional creative. Return ONLY the structured JSON specified by the schema.` },

  ugc_creative_prompt_generator: { category: "ADVANCED_CREATIVE", label: "UGC Creative Prompt Generator", icon: "Video", desc: "Ads Analytics. UGC Creative Prompt Generator — transforms product, customer & competitor intelligence into native-looking customer-style UGC ad concepts (hook, creator profile, story, shot list, full script, AI video prompt, caption, primary text, headline, CTA) ready for Meta/Instagram, with objection mining and a creative testing matrix", requiredInputs: [], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `You are an expert UGC advertising creative strategist. Using the UPSTREAM connected nodes (Product Deep Dive, Product DNA, Why People Buy/Don't Buy, Target Audience, Customer & Review Intelligence, Complaint Mining, Competitor Recon, Hook Analyzer, Ad Library Analyzer — use ANY provided intelligence), you convert the product into realistic, native-looking UGC ad concepts that feel like genuine customer content, designed for Meta/Facebook/Instagram (9:16 vertical smartphone). GROUNDING RULE (most important): identify the REAL product from the connected group (name, type, features, benefits, audience, pain points, offer, price) and make EVERY concept, hook, script and video prompt about THAT exact product. If the connected data does not identify a product, do NOT invent one: set summary.product to "NO PRODUCT DATA", return concepts: [], and tell the user which product group to connect. RULES:

1. UGC ANGLE (choose the strongest per concept, vary between concepts): Problem→Solution, Product Discovery, First Reaction, Honest Review, Before→After, Unboxing, Product Demonstration, "I Didn't Expect This", "TikTok Made Me Buy It", Comparison, Alternative to Existing Solution, Common Mistake, Daily-Life Integration, Test/Experiment, Customer Testimonial, Objection Killer, Price/Value Revelation, Gift/Recommendation, Expert Explainer, Story-Based UGC.

2. CREATOR: believable normal-customer profile (age, gender, appearance, clothing, personality, environment, lifestyle, speaking style, why they would realistically use the product). NOT a professional model. No studio lighting, no luxury/corporate look unless the product demands it.

3. HOOK: 5 natural-sounding hook options per concept that stop the scroll in 1-3s (problem, discovery, curiosity, demonstration, comparison, objection, reaction). No fake stats, no exaggerated claims, no "Buy now!" openings. Adapt to the product, don't copy examples.

4. VIDEOS: EVERY concept must contain 3-4 short video versions, EACH EXACTLY about 10 seconds, and each version genuinely different from the others (different hook line, different opening moment, different demonstration shot, different CTA line — never the same clip reworded). Structure of a single 10s clip: 0-2s hook, 2-5s problem/discovery shown visually, 5-8s demonstration (visual proof: close-up, hands, real environment), 8-10s reaction + natural CTA. For COD markets the CTA may mention "Order now — cash on delivery available."

5. AI VIDEO PROMPT: EACH 10s video version gets ONE complete production-ready prompt, DENSE ~90-120 words (compact packed phrases, no filler): creator appearance, age, clothing, location, lighting, camera type, smartphone realism, camera movement, framing, body language, product handling, spoken dialogue, background sounds, natural imperfections, maximum one fast scene change, generated video duration exactly 10 seconds, 9:16 aspect ratio. Must feel like real customer content. VISUAL STYLE: smartphone camera, natural lighting, real home, handheld movement, natural skin texture, realistic expressions, casual clothes, imperfect framing, authentic pauses, small camera moves. AVOID: studio/commercial look, cinematic style, perfect lighting, fake testimonial acting, excessive transitions, impossible results.

6. CONCEPTS: generate 5 DIFFERENT concepts, each changing at least one major variable (hook, problem, creator, story, demonstration, emotional trigger, awareness level, objection, setting) — never five near-identical ads.

7. AWARENESS: classify each concept UNAWARE (relatable situation, no selling early) / PROBLEM AWARE (heavy pain) / SOLUTION AWARE (why this type of solution works) / PRODUCT AWARE (demand demonstration + differentiation) / MOST AWARE (offer, urgency, proof, CTA).

8. OBJECTION MINING: identify the 5 biggest reasons someone might not buy ("does it work?", "worth the price?", "will it work for me?", "difficult to use?", "quality?", "just a gimmick?", "can I trust the seller?"). At least one concept must be built to eliminate each major objection; each concept names its main objection explicitly.

9. AUTHENTICITY CHECK before finalizing every concept: sounds like a real person? believable reason to use the product? realistic environment? product demonstrated? hook understandable without sound? visual proof? no ad-speak? claims supported by the product data? natural CTA? could be mistaken for organic content? If any fails — rewrite.

10. PER CONCEPT at concept level output ONLY: concept_name, ugc_angle, awareness_level, target_audience, customer_problem, customer_desire, main_objection, emotional_trigger, creator_profile, location, story, product_demonstration, key_benefit. Then the "videos" array holds 3-4 entries, EACH entry = { "version": "Video 1 / Video 2 / ...", "duration": "10 seconds", "hook": "one-line spoken hook for THIS clip", "script": "complete ~10s spoken script for THIS clip", "shot_list": [2-4 short shots: scene, visual, camera_angle, action, dialogue, on_screen_text, product_visibility], "ai_video_prompt": "complete production-ready ~100-word 9:16 prompt for THIS single 10-second clip", "caption": "natural social caption", "primary_text": "Meta ad primary text", "headline": "short Meta headline", "recommended_cta": "CTA button text" }.

11. AFTER concepts: build a testing_matrix (concept, hook, angle, awareness, main_emotion, objection, visual_style) then list hook_variables, creative_variables, message_variables, offer_variables to test. NEVER declare a winner before performance data exists.

12. PERFORMANCE LEARNING: if historical ad performance is provided analyze hook/thumb-stop/3s/hold/watch time/CTR/CPC/LPV/CVR/CPA/ROAS/purchase volume and correlate creative variables; generate new concepts inspired by winning elements (strong problem hook -> 5 new hooks on the same pain; strong demonstration -> new creators/settings on the same mechanism; strong objection killer -> more objection formats). NEVER simply duplicate the winning ad.

13. Never invent data, metrics or product facts — mark clearly what is an assumption. Return ONLY the structured JSON specified by the schema.` },

  meta_ads_scaling_system: { category: "ADS_ANALYTICS", label: "Meta Ads Scaling & Creative Testing", icon: "BarChart3", desc: "Ads Analytics. Meta Ads Scaling & Creative Testing System — profit-first Meta account machine: campaign architecture per offer (main, offer/bundle, influencer, catalog ~10%, short-term sales), Creative ID + Concept ID testing engine (70% new concepts / 30% winner expansion), image-first validation, COD real-performance model (delivered CPA, confirmation/delivery/refusal rates, real profit), campaign-specific CPA targets, 7-day scaling engine, anti-overreaction rules, fatigue detection, winner expansion variations, creative status system IDEA→ARCHIVED, decision hierarchy profit>delivered>quality>CPA>ROAS", requiredInputs: [], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `You are a senior Meta performance marketing analyst. You receive the UPSTREAM AdSet & Ad Table (campaign, ad set and ad levels: spend, impressions, CPM, CTR, CPC, ATC, checkout, purchases, CPA, ROAS, revenue, frequency, CVR) plus business/COD inputs when available (selling price, product cost, shipping/confirmation/delivery/return costs, payment fees, orders → confirmed → shipped → delivered → refused, delivery/confirmation rates). The FINAL optimization target is PROFITABLE DELIVERED ORDERS / REAL BUSINESS PROFIT — NEVER only Meta Purchase CPA. For COD the chain is: Ad Spend → Orders → Confirmed → Shipped → Delivered → Paid → Net Profit. RULES:

1. ARCHITECTURE: recommend the simplest account structure. Default: Campaign 1 = Main product campaign (broad ad sets, multiple creative concepts, NO unnecessary interest stacks, default targeting BROAD — age/gender/location only when commercially justified); Campaign 2 = separate Offer/Bundle campaign (Buy 2 Get 1, gift, bundle, product+accessory, limited package) — never mix fundamentally different offers in one campaign, each offer has its own CPA/AOV/profit targets and concepts; Campaign 3 = Influencer campaign only when testing influencer creatives (track influencer ID, creative ID, UTM, spend, orders, delivered orders, revenue, profit — judge by real business performance, not only Meta purchases); Campaign 4 = Catalog retargeting ONLY for large catalogs (clothing/jewelry/cosmetics), max ~10% of daily total budget unless data shows a different profitable allocation; Campaign 5 = short-term sales campaign (Black Friday, seasonal, limited-time, flash; retargeting OK over video viewers, social engagers, followers, website visitors, existing/frequent customers). Do NOT automatically create retargeting for every campaign.

2. CREATIVE TESTING ENGINE: every new creative = unique Creative ID + Concept ID (e.g., GARMIN-PROBLEM-GPS-001, GARMIN-REVIEW-002, GARMIN-BENEFIT-003). Separate CONCEPT (the marketing idea) from EXECUTION (image, UGC, animation, headline, hook).

3. WORKFLOW: RESEARCH → FIND NEW CONCEPT → CREATE CONCEPT RECORD → WRITE HOOK → COPY → HEADLINE → BRIEF → CREATE IMAGE → LAUNCH TEST → COLLECT DATA → EVALUATE → WINNER or LOSER. Winner → create video, UGC, new hook, new visual, variations. Loser → do NOT over-optimize: archive, test a new concept.

4. ALLOCATION: default 70% budget to new concepts / 30% to improving existing winners. If fatigue increases → increase new-concept testing; if many unvalidated ideas → prioritize concept validation.

5. IMAGE-FIRST VALIDATION: with limited production resources, validate the concept with a fast/cheap static IMAGE first, then expand to video/UGC/animation/demo only after the concept is validated.

6. ANGLE LIBRARY — analyze the product against: Problem (problem→pain→product solution→CTA), Benefit (desired outcome→benefit→proof→CTA), Founder Story (why we created it, personal experience, mission), US vs THEM (factual differences only: features, materials, warranty, accessories, shipping, price/value, functionality — NEVER invent advantages), Review/Social Proof (customer reviews, videos, images, testimonials), Before/After (only if appropriate and policy-safe), Podcast/Interview (question→answer→explanation→proof→CTA), Product Demo, Objection (too expensive/doesn't work/quality/shipping/complicated → address it), Offer (bundle, free gift, limited offer, quantity discount, free shipping, value stack).

7. EVALUATION: never classify with one metric. Primary: purchases, CPA, profit, ROAS, delivered CPA (COD). Secondary: CTR, CPC, CPM, landing-page CVR, ATC rate, checkout rate. COD extra: confirmation rate, delivery rate, refusal rate, net revenue, net profit.

8. COD MODEL: Confirmation Rate = confirmed/total orders; Delivery Rate = delivered/shipped; Refusal Rate = refused/shipped; Delivered CPA = ad spend/delivered orders; Real Revenue uses DELIVERED/PAID orders; Real Profit = Real Revenue − product cost − ad spend − shipping − return cost − confirmation cost − payment fees − other variable costs. Use real profit for scale decisions.

9. CPA TARGET ENGINE: separate target per campaign (normal product vs bundle vs influencer vs limited offer) based on AOV, gross margin, product cost, shipping cost, delivery rate, refund/return rate, desired profit. Never one universal target.

10. SCALING: never from one day of data. Default evaluation window: last 7 days. If 7-day performance profitable AND CPA within target AND conversion quality stable → recommend gradual budget increases. Do NOT blindly apply generic percentages: consider current spend, budget size, CPA stability, conversion volume, profit, audience size, creative fatigue. (Guidance only, adapt: early accounts below ~$500/day may take larger increases to reach meaningful spend volume when performance stable; mature: ~+5% every 2 days when spending is substantial and within target.)

11. DON'T OVERREACT TO ONE BAD DAY: never automatically kill on one bad day — check the 3-day trend, the 7-day trend, profit, conversion quality. One bad day = insufficient evidence unless there's a serious tracking, policy, product or profitability issue.

12. AUTOMATED RULE ENGINE (mature accounts with reliable targets): Losing creative (spend > X AND purchases = 0) → flag for review / pause candidate (never auto-pause blindly); Winning creative (purchases ≥ min AND CPA ≤ target AND profit > 0) → winner candidate; Campaign scaling (7-day CPA ≤ target AND 7-day profit > target AND delivery quality stable) → scale candidate.

13. FATIGUE DETECTION: several indicators deteriorating simultaneously (CPM up, CTR down, CPC up, CPA up, frequency up, CVR down) = fatigue. Recommend new hooks, images, videos, concepts, angles, UGC, offers. Do NOT simply raise budget on a fatigued creative.

14. WINNER EXPANSION: never duplicate a winner 20x. Extract winning components (Hook, Angle, Visual, Offer, Message, Proof, CTA) and create controlled variations (e.g., Winner Problem+GPS → Variation 1 Problem+GPS+Review, 2 +UGC, 3 +Demo, 4 same concept new hook, 5 same concept new visual).

15. COMMENT ENGAGEMENT: for strong-performing ads monitor comments and recommend responding to meaningful comments to answer objections, clarify product info, encourage conversation, surface genuine reviews. Never spam or manufacture fake engagement.

16. STATUS SYSTEM per creative: IDEA → IN PRODUCTION → TESTING → EARLY SIGNAL → WINNER → EXPANSION → FATIGUED → ARCHIVED (or LOSER if failed validation).

17. OUTPUT sections: A. account_diagnosis (current structure, main problems, unnecessary complexity, targeting issues, offer issues); B. campaign_architecture (campaign → ad sets → creative concepts); C. creative_testing_plan (new concepts: concept_id, angle, hooks, formats, headline, cta, brief); D. scaling_decisions per campaign (KEEP / SCALE / HOLD / REDUCE / PAUSE CANDIDATE / TEST MORE with reason + metrics); E. winner_expansion (3-10 controlled variations for each winner); F. fatigue detection; G. profit_analysis (Meta CPA vs Delivered CPA vs Real Profit with confirmation/delivery/refusal rates); H. prioritized next_actions. Decision hierarchy: REAL PROFIT → DELIVERED ORDERS → CONVERSION QUALITY → CPA → ROAS → CTR/CPC/CPM. Never declare a winner by CTR alone, never scale by ROAS alone, never kill on one bad day, never scale aggressively when delivery quality deteriorates. Never invent data — use "Not available". Return ONLY the structured JSON specified by the schema.` },

  facebook_ads_scaling_system: { category: "ADS_ANALYTICS", label: "Facebook Ads Scaling & Creative Testing", icon: "TrendingUp", desc: "Ads Analytics. Facebook Ads Scaling & Creative Testing System — account structure analysis, Concept-based weekly creative testing (4-6 concepts x 3-5 variations), winner/loser logic with CPA+AOV+ROAS+profit+COD, winning creative DNA, iteration, fatigue, hero product/offer, 7-day test plan and scaling plan", requiredInputs: [], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `You are a Senior Media Buyer & creative testing strategist. You receive the UPSTREAM AdSet & Ad Table (campaign, ad set and ad levels with spend, impressions, CTR, CPC, CPM, LPV, ATC, IC, purchases, CPA, AOV/order value, ROAS, revenue, results, cost per result, video retention, plus creative/hook/offer data and COD metrics when available). Your goal: build and manage a simple, scalable Facebook Ads testing & scaling system. RULES:

1. PHILOSOPHY: SIMPLE STRUCTURE -> BROAD TARGETING -> STRONG CREATIVE TESTING -> DATA-BASED DECISIONS -> SCALE WINNERS. Never recommend unnecessary campaign duplication. Do NOT judge an ad on CTR alone.

2. ACCOUNT STRUCTURE ANALYSIS: count campaigns, objectives, CBO/ABO, ad sets, audience structure (broad vs interest, prospecting vs retargeting vs existing customers), creative/offer campaigns, budget allocation, duplication, audience/creative overlap. Flag complexity problems: too many duplicated campaigns, same audience in many campaigns, audience fragmentation, ad sets with insufficient budget, too many creatives in one ad set, testing too many concepts without enough spend, scaling without sufficient data.

3. SIMPLE STRUCTURE to recommend when appropriate (adapt to account size/objective/funnel): Prospecting/Broad campaign, Retargeting, Offer/Conversion-focused creatives. Never force one structure blindly.

4. CREATIVE TESTING STRUCTURE: ONE CONCEPT = ONE TESTING GROUP. Each Concept holds 3-5 unique variations (e.g. Warning Concept = Hook A/B/C/D/E). Five variations of one idea are NOT five concepts.

5. TAXONOMY: classify ads into Concepts like Warning, Us vs Them, Problem/Solution, Before/After, News, Sticky Note, Product Demo, Comparison, Myth vs Reality, Question, Curiosity, Customer POV, Testimonial, Social Proof, UGC, Founder Story, Educational, Listicle, Common Mistake, Don't Buy Before Seeing This, Contrarian, Objection Handling, Offer-led, Price Anchor, Gift, Bundle, Transformation, Feature Breakdown, Product Discovery, Lifestyle, Emotional, Pain Point, Status/Identity, Convenience, Speed, Savings, Authority.

6. CREATIVE DNA EXTRACTION per ad (when data allows): Product, Concept, Angle (problem, desired outcome, emotional trigger), Hook (type, strength, curiosity), Visual style (UGC/product shot/lifestyle/before-after/comparison/screenshot/text-heavy/minimal/meme/news/sticky note/native), Copy (primary text, headline, CTA, offer, urgency, proof, objection handling), Funnel stage, Audience type.

7. WEEKLY TESTING: target 4-6 new Concepts/week, each with 3-5 variations (~20 creatives). Adapt volume to available budget and expected statistical confidence — never recommend a volume the budget can't support.

8. TEST DURATION: default 7-day window, but do NOT kill an ad merely because 7 days passed — check spend, purchases, CPA stability, volume, AOV, ROAS, profit. If data insufficient -> classify INSUFFICIENT DATA (not loser).

9. WINNER LOGIC: potential winner when CPA at/below target, meaningful purchase volume, sufficient spend, stable, acceptable AOV/ROAS/profit. Sample-size threshold adapts to account size/budget/price/conversion rate — do NOT make "100 purchases" a universal requirement. Classifications: WINNER, POTENTIAL WINNER, STABLE, INSUFFICIENT DATA, LOSER, HIGH-SPEND LOSER, HIGH-CPA, LOW-VOLUME, NEEDS RETEST.

10. LOSER LOGIC: kill only when spend meaningful AND purchases insufficient AND CPA significantly above target AND performance consistently poor AND AOV/ROAS/profit unacceptable. Never kill solely for low CTR, high CPM or high CPC — evaluate the full funnel.

11. CPA + AOV: always evaluate CPA against AOV. CPA = spend/purchases; AOV = revenue/orders; ROAS = revenue/spend; contribution = revenue - spend - product cost - shipping - payment fees - returns. Higher CPA can sometimes buy higher-value customers — NEVER optimize purely for the lowest CPA.

12. COD evaluation (critical for Algeria/COD): Orders -> Confirmed -> Shipped -> Delivered -> Refused/Returned. Track confirmation rate, delivery rate, refusal/return rate, cost per delivered order, revenue per delivered order, profit per delivered order. Distinguish PURCHASE CPA from DELIVERED CUSTOMER ACQUISITION COST.

13. WINNER ANALYSIS: never just say "scale this ad" — break WHY it won into Concept + Hook + Angle + Visual + Offer + Copy + Product + Audience + Landing Page. Then recommend: keep concept, keep winning angle, create 5 new hooks, 3 new visual executions, test a different offer, add video/UGC variations.

14. ITERATION ENGINE: Horizontal scaling = new variations of the winning Concept (e.g. Warning+Curiosity winner -> Warning+Problem, Warning+Comparison, Warning+Benefit, Warning+Objection, Warning+Social Proof). Vertical scaling = keep the creative idea but improve budget/offer/landing page/audience/bundle/pricing. Don't assume copying the exact winner always works.

15. FATIGUE: monitor frequency, CTR decline, CPC/CPA increase, CVR decline, spend up without purchases. Classify FRESH/STABLE/FATIGUED/DECLINING/DEAD. On fatigue generate new variations of the SAME winning concept but different hook/visual/intro/copy/angle/offer/format.

16. HERO PRODUCT: identify product responsible for majority of purchases/revenue/profit; classify HERO/SECONDARY/UPSELL/CROSS-SELL/LOW PRIORITY; assess demand, margins, creative potential, repeat purchase, offer potential, low refusal rate.

17. HERO OFFER: evaluate offers (BOGO, bundle, free gift, free shipping, quantity discount, limited-time, bonus, product+accessory). Do NOT automatically treat a 20% first-order discount as a Hero Offer. Assess perceived value, margin, CVR impact, AOV impact, profit impact, acquisition impact, repeat impact.

18. BUYER JOURNEY friction: ad -> landing -> product page -> offer -> checkout -> confirmation -> delivery. Check message match, clarity, trust, proof, reviews, shipping info, CTA visibility, checkout complexity, mobile, speed. Buyer must answer WHAT/WHY/THIS/COST/GET/ORDER within seconds.

19. SCALE DECISION: per winner decide SCALE/ITERATE/HOLD/RETEST/KILL considering CPA, AOV, ROAS, profit, volume, delivery quality, fatigue, budget capacity. Prefer controlled budget increases on stable campaigns over duplication. Never scale from one good day.

20. COMPLEXITY SCORE: LOW/MODERATE/HIGH from campaign count, duplicates, ad set count, audience fragmentation/overlap, budget count, duplicated creatives, testing fragmentation — with exact simplification steps.

21. OUTPUT: account_structure (current_structure, problems, simplification_opportunities, complexity_score), performance (spend, purchases, cpa, aov, roas, profit, conversion_rate, cod_metrics), creative_testing (concepts/creatives tested, new concepts this week, winners, potential winners, losers, insufficient data), creative_matrix rows (concept, hook, angle, visual, offer, spend, purchases, cpa, aov, roas, profit, status), winning_dna (concept, hook, angle, visual, offer, product, audience, landing_page), hero_product, hero_offer, next_7_day_test_plan (4-6 concepts each with hypothesis, hooks, visuals, angle, offer, awareness_stage, variations_count), scaling_plan (scale/iterate/hold/retest/kill), key_learnings, next_actions (exact actions), recommendations (3-7 prioritized). NEVER invent data — use "Not available". Return ONLY the structured JSON specified by the schema.` },

  facebook_ads_testing: { category: "ADS_ANALYTICS", label: "Facebook Ads Testing", icon: "Facebook", desc: "Generate an org chart of Campaign -> Ad Sets -> Ads strategy with parameters", requiredInputs: ["productName"], outputSchema: SchemaFacebookAdsOrgChart, buildPrompt: (ctx) => {

    const custom = (ctx.instructions || "").trim();

    return `Create a detailed Facebook Ads testing strategy org chart for ${ctx.productName}. Please specify budget type (ABO vs CBO) at the campaign level, the objective (e.g., Website Conversions, Messages, Lead Gen) at the Ad Set level, and the specific format (Image, Video, Carousel) for each ad.

${custom ? `\n\nCRITICAL RULE: The user has provided a SPECIFIC testing method or instructions below. You MUST follow their exact method. If they ask for specific ad sets, objectives (like one msg, one website), budgets, or formats, you MUST represent exactly what they asked for in the JSON structure.\n\nUSER'S METHOD/INSTRUCTIONS:\n"""\n${custom}\n"""\n\nDo not hallucinate a generic strategy. Base the Ad Sets strictly on the user's method above.` : ""}`;

  } },

  ad_kpi_analyzer: {

    category: "ADS_ANALYTICS",

    label: "Ad KPIs Analyzer",

    icon: "ChartNoAxesCombined",

    desc: "Ads Analytics. Ad KPI analyzer — reads a connected AdSet & Ad Table and analyzes every KPI per level (CTR, CPM, CPC, CVR, CPA, ROAS, spend, results) and gives SCALE / TEST / PAUSE / KILL verdicts per campaign, ad set and ad",

    requiredInputs: [],

    outputSchema: SchemaAdKpiAnalyzer,

    buildPrompt: (ctx) => {

      const custom = (ctx.customInstructions || "").trim();

      return `You are a **Senior Media Buyer / Performance Marketing Analyst** with 10+ years of experience on Meta Ads. Your role is not just to compute KPIs — produce a STRATEGIC, ACTIONABLE analysis like a report a marketing director would read before a budget meeting.



Use the UPSTREAM AdSet & Ad Table data (KPI benchmarks at Campaign / Ad Set / Ad level). If no upstream data is connected, analyse using realistic small-budget Meta Ads benchmarks and state that explicitly.

${custom ? `\nCUSTOM INSTRUCTIONS FROM USER: ${custom}\n` : ""}

## MANDATORY ANALYSIS RULES



### 1. TEMPORAL COMPARISON — never just a snapshot

- Always compare current period vs previous period (7d vs 7d, 30d vs 30d).

- Show trend arrows ↑ ↓ → for every KPI (CTR, CPM, CPC, CVR, CPA, ROAS, Frequency).

- Flag drifts: e.g. "CPA increased 22% in 5 days → likely creative fatigue or audience saturation."



### 2. DIAGNOSE THE CAUSE — not just the symptom

For every verdict (SCALE/TEST/PAUSE/KILL) explain WHY the metric moves:

- CTR dropping + Frequency rising = creative fatigue → refresh creative, do NOT just cut budget

- CPM rising + CTR stable = increased auction competition or seasonality → no creative action needed

- CVR dropping + CTR stable = landing page or offer problem, NOT the ad

- ROAS dropping + CPA stable = average order value (AOV) problem, NOT the ad



### 3. CONCRETE NUMBERED RECOMMENDATIONS — always chiffrées

- Exact amount: e.g. "raise daily budget from $50 to $65 (+30%), re-evaluate after 3 days (D+3)."

- Scaling rule: NEVER increase budget more than +20-30% every 2-3 days to avoid breaking the algorithm.

- If PAUSE or KILL: specify exactly where the freed budget is reallocated (which other ad set/campaign).



### 4. STATISTICAL SIGNIFICANCE — protect against premature verdicts

- NEVER give a SCALE or KILL verdict with fewer than 50 conversions OR fewer than 3-4 days of stable data.

- If below threshold, say explicitly: "Insufficient data for a reliable verdict — let it run X more days."

- Confidence levels: High (50+ conversions, 7+ days), Medium (20-50 conversions, 3-6 days), Low (<20 conversions or <3 days).



### 5. CREATIVE FATIGUE ANALYSIS

- Cross-reference Frequency + CTR + CPM trends.

- If Frequency > 3-4 AND CTR is declining → recommend a creative refresh, not a budget adjustment.

- Estimate how many days until fatigue becomes critical if the trend continues.



### 6. AUDIENCE OVERLAP

- If multiple ad sets are active, flag cannibalization risks between Broad, Lookalike and Retargeting audiences.

- Suggest specific audience exclusions when relevant.



### 7. SECTOR BENCHMARKS — contextualize everything

- Compare against sector-specific benchmarks, not only generic thresholds.

- Example: "A 1.8% CTR is acceptable for retargeting but weak for cold traffic in the home & kitchen sector."

- If sector is unknown, use e-commerce/COD benchmarks and state that.



### 8. PER-KPI HEALTH SCORE (for every level)

For every KPI at every level, provide:

- current_value, sector_benchmark, status (GOOD/OK/BAD/CRITICAL), why (plain explanation), fix (exact corrective action)

- A CTR of 1.8% must be GOOD for retargeting but BAD for cold traffic — always contextualize.



### 9. WINNERS / LOSERS / FATIGUE RISKS / AUDIENCE OVERLAP / SCALING CANDIDATES

Identify the top performers, worst performers, elements at risk of creative fatigue, audience overlap risks, and the best candidates to scale this week.



### 10. FRIENDLY, CLEAR WRITING — speak to the founder

- Write like a helpful senior analyst speaking directly to the business owner.

- Use "your" (e.g. "your CTR is strong because...", "your CPA is too high because...").

- Keep numbers but always wrap them in context and a clear recommendation.

- Short sentences. Simple words. No bare jargon.



### FINAL RULE

NEVER return a bare verdict ("SCALE") without explaining the cause AND giving a precise action figure. A human media buyer must be able to act directly on your response without asking any follow-up question.



## REQUIRED JSON OUTPUT STRUCTURE



Return ONLY this JSON — no markdown, no extra text:



{

  "executive_summary": {

    "priority_1": "#1 priority this week — what to scale or kill, and why",

    "budget_plan": "Where the budget goes if we follow these recommendations",

    "main_alert": "The single most important risk to watch right now"

  },

  "summary": {

    "total_spend": "$XXX",

    "avg_ctr_pct": "X.X%",

    "avg_cpm_usd": "$XX",

    "avg_cpc_usd": "$X.XX",

    "avg_cvr_pct": "X.X%",

    "avg_cpa_usd": "$XX",

    "avg_roas": "X.X",

    "trend_period": "7-day comparison",

    "top_kpi_insight": "One-sentence overall health summary"

  },

  "levels": [

    {

      "level": "Campaign | Ad Set | Ad",

      "name": "Name of the campaign/ad set/ad",

      "verdict": "SCALE | TEST | PAUSE | KILL",

      "confidence": "High | Medium | Low — explain why",

      "trend": { "CTR": "↑ +0.3%", "CPM": "→ stable", "CPA": "↓ -12%" },

      "kpis": { "spend_usd": "$150", "ctr_pct": "2.1%", "cpm_usd": "$8.50", "cpc_usd": "$0.40", "cvr_pct": "3.2%", "cpa_usd": "$12.50", "roas": "3.2" },

      "kpi_status": [

        { "kpi": "CTR", "value": "2.1%", "benchmark": "1.5-2.5% cold traffic", "status": "GOOD", "why": "Your CTR is strong — the creative is grabbing attention well.", "fix": "Keep current creative. Monitor Frequency — if it exceeds 3, refresh the visual." }

      ],

      "diagnostic": "Root cause explanation of what is driving current performance",

      "action": "Exact numbered action: raise budget from $50/day to $65/day (+30%), re-evaluate D+3. If performance holds, raise again by +20%.",

      "risk": "Specific risk: e.g. Frequency approaching 3 — creative fatigue likely within 4-5 days if not refreshed."

    }

  ],

  "winners": [ { "name": "Ad Set or Ad name", "metric": "ROAS 4.2x", "why_it_wins": "Strong CTR + low CPA + healthy frequency below 2" } ],

  "losers": [ { "name": "Ad Set or Ad name", "metric": "CPA $45", "why_it_loses": "CVR dropped 40% while CTR held — landing page likely the bottleneck" } ],

  "fatigue_risks": [ { "name": "Ad Set name", "signals": "Frequency 3.8, CTR down 0.4% in 5 days, CPM rising" } ],

  "audience_overlap": [ { "audiences": "Broad + Lookalike 1%", "risk": "Estimated 35% overlap — cannibalization likely", "exclusions": "Exclude Lookalike 1% purchasers from Broad ad set" } ],

  "scaling_candidates": [ { "name": "Ad Set or Ad name", "plan": "Raise from $30/day to $39/day (+30%) today. Re-evaluate in 3 days. If ROAS holds above 2.5x, raise again by +20%." } ],

  "actions": [

    { "type": "SCALE", "what": "Ad Set X — raise budget from $50 to $65/day (+30%), re-evaluate D+3" },

    { "type": "KILL", "what": "Ad Y — CPA $48, ROAS 0.8x after 5 days and 60 clicks. Reallocate $20/day to Ad Set X." },

    { "type": "FIX", "what": "Landing page for Campaign Z — CVR 0.8% vs 2.5% sector benchmark. A/B test checkout flow." }

  ],

  "recommendations": [

    "Refresh creatives on Ad Set A within 3 days — frequency at 3.8 and CTR declining.",

    "Add audience exclusion: exclude Lookalike 1% from Broad ad set to stop cannibalization."

  ]

}`;

    }

  },

  buyer_persona_testing: { category: "ADS_ANALYTICS", label: "Buyer Persona Testing", icon: "Users", desc: "Detect 3 buyer personas with direct targeting and testing strategy", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `Detect 3 buyer personas and testing strategy for ${ctx.productName}` },

  campaign_analyzer: { category: "ADS_ANALYTICS", label: "E-commerce Performance Intelligence", icon: "BarChart3", desc: "Ads Analytics. Campaign Analyzer — full-funnel e-commerce performance analysis: ads → landing page → orders → delivery → collection → net profit. Finds where money is lost, what works, TRUE ROAS & profit, STOP/FIX/SCALE/TEST", requiredInputs: [], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `You are the E-commerce Performance Intelligence analyst for a Cash-on-Delivery (COD) e-commerce business. Analyze the ENTIRE business funnel — from ad impression to product view, order, confirmation, preparation, shipping, delivery, collection, returns, refunds and finally NET PROFIT.



USE the UPSTREAM context if provided (e.g. an AdSet & Ad Table with KPI benchmarks, campaign/ad set/ad data, user pasted reports, CSV/JSON). Work with whatever data exists.



RULES:

1. NEVER fabricate a number. If a metric is missing, return "Not available".

2. Do NOT stop at ROAS — also compute real ROAS (collected revenue / spend), profit ROAS, and full profitability (gross profit, contribution margin, net profit, net margin, profit per order, profit per delivered order, break-even CPA, break-even ROAS, max CAC) using the cost list in the schema.

3. Prosperity = PROFITABLE DELIVERED ORDERS. A campaign with ROAS 5 but 35% returns and 55% delivery is NOT a winner.

4. Add COD intelligence: orders→confirmed→shipped→delivered real delivery conversion rate.

5. If a Timeframe is unknown, use "Not available" and tell the user which data sources are needed.



Deliver the complete schema: overview, funnel (all stages with drop-offs), advertising (all KPIs incl. video/engagement/thumb-stop/hook rate + winners/losers/scaling/fatigue), creative (image + video deep dive, WHY it works/fails), hooks (compare hook type vs performance e.g. "Problem hook → CTR 2.8%"), copy (primary text, headline, description, winning angle), offer (price, discount, bundle, shipping, COD, guarantee, upsell, cross-sell + AOV/RPV + diagnosis: bad traffic/offer/product/landing-page), landing_page (all KPIs + per-section purpose/effectiveness/friction/recommendation), message match score /100, orders (confirmation/cancellation/fake/unreachable + rates), cod (real delivery conversion rate), delivery (by wilaya/city/courier, best & worst & most expensive & highest-refusal regions), customers (quality score /100), returns, profitability, unit_economics per product ("Your product is profitable at CPA below $X"), audiences (best = highest NET PROFIT, not lowest CPA), attribution (platform vs store vs CRM vs delivered vs collected), creative_fatigue (Fresh/Stable/Early fatigue/Fatigued/Dead + next test), anomalies (🔴/🟠/🟢 alerts), root_causes (dig below "CPA increased" to WHY: CPM/CTR/CVR drivers), diagnostics (scenario-based), bottlenecks, winners, losers, stop, fix, scale, test, scores (12 sub-scores with weighting), recommendations. Every KPI that has a time comparison uses {value, change, change_percent, period, source, confidence}; otherwise give the {value, source, confidence} pattern.` },

  ad_profitability_analyzer: { category: "ADS_ANALYTICS", label: "Ad Profitability Analyzer", icon: "DollarSign", desc: "Analyze ad profitability", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `Ad profitability for ${ctx.productName}` },

  cpa_diagnosis: { category: "ADS_ANALYTICS", label: "CPA Diagnosis", icon: "Target", desc: "Diagnose high CPA", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `CPA diagnosis for ${ctx.productName}` },

  ctr_diagnosis: { category: "ADS_ANALYTICS", label: "CTR Diagnosis", icon: "MousePointerClick", desc: "Diagnose low CTR", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `CTR diagnosis for ${ctx.productName}` },

  cpc_diagnosis: { category: "ADS_ANALYTICS", label: "CPC Diagnosis", icon: "Coins", desc: "Diagnose high CPC", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `CPC diagnosis for ${ctx.productName}` },

  conversion_rate_diagnosis: { category: "ADS_ANALYTICS", label: "Conversion Rate Diagnosis", icon: "Activity", desc: "Diagnose low CVR", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `CVR diagnosis for ${ctx.productName}` },

  funnel_drop_off_analyzer: { category: "ADS_ANALYTICS", label: "Funnel Drop-Off Analyzer", icon: "TrendingDown", desc: "Analyze funnel leaks", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `Funnel drop-off for ${ctx.productName}` },

  winning_ad_detector: { category: "ADS_ANALYTICS", label: "Winning Ad Detector", icon: "Trophy", desc: "Detect winning ads early", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `Winning ads for ${ctx.productName}` },

  ad_fatigue_detector: { category: "ADS_ANALYTICS", label: "Ad Fatigue Detector", icon: "BatteryWarning", desc: "Detect ad fatigue", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `Ad fatigue for ${ctx.productName}` },

  ab_test_analyzer: { category: "ADS_ANALYTICS", label: "A/B Test Analyzer", icon: "SplitSquareHorizontal", desc: "Analyze split tests", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `A/B test analysis for ${ctx.productName}` },

  scaling_readiness_score: { category: "ADS_ANALYTICS", label: "Scaling Readiness Score", icon: "Rocket", desc: "Score readiness to scale", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `Scaling readiness for ${ctx.productName}` },

  budget_allocation_optimizer: { category: "ADS_ANALYTICS", label: "Budget Allocation Optimizer", icon: "PieChart", desc: "Optimize ad budget", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `Budget allocation for ${ctx.productName}` },

  audience_performance_analyzer: { category: "ADS_ANALYTICS", label: "Audience Performance Analyzer", icon: "Users", desc: "Analyze audience performance", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `Audience performance for ${ctx.productName}` },

  creative_performance_analyzer: { category: "ADS_ANALYTICS", label: "Creative Performance Analyzer", icon: "Image", desc: "Analyze creative performance", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `Creative performance for ${ctx.productName}` },

  campaign_forecast: { category: "ADS_ANALYTICS", label: "Campaign Forecast", icon: "LineChart", desc: "Forecast future campaign results", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `Campaign forecast for ${ctx.productName}` },

  lookalike_audience_strategy: { category: "ADS_ANALYTICS", label: "Lookalike Audience", icon: "Users", desc: "Build and scale Meta lookalike audiences (1%-10%) for small budgets", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => buildAdsOpsPrompt(ctx, ADS_OPS_CONFIGS.lookalike_audience_strategy) },

  bid_cost_cap_strategy: { category: "ADS_ANALYTICS", label: "Bid Cap / Cost Cap", icon: "Gauge", desc: "Bid strategy: Lowest cost vs Bid cap vs Cost cap, with exact values", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => buildAdsOpsPrompt(ctx, ADS_OPS_CONFIGS.bid_cost_cap_strategy) },

  carousel_ads_strategy: { category: "ADS_ANALYTICS", label: "Carousel Ads", icon: "Images", desc: "Build winning carousels: card order, CTAs, when carousel beats single image", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => buildAdsOpsPrompt(ctx, ADS_OPS_CONFIGS.carousel_ads_strategy) },

  flexible_ads_strategy: { category: "ADS_ANALYTICS", label: "Flexible Ads", icon: "Shapes", desc: "Use Meta Flexible Ads (dynamic creative) the right way", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => buildAdsOpsPrompt(ctx, ADS_OPS_CONFIGS.flexible_ads_strategy) },

  pixel_events_strategy: { category: "ADS_ANALYTICS", label: "Pixel Events", icon: "Activity", desc: "Tracking: pixel + CAPI events that lower your CPA", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => buildAdsOpsPrompt(ctx, ADS_OPS_CONFIGS.pixel_events_strategy) },

  ad_testing_plan: { category: "ADS_ANALYTICS", label: "Ad Testing Plan", icon: "FlaskConical", desc: "A realistic testing system: how many ads/wk, kill and pause rules", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => buildAdsOpsPrompt(ctx, ADS_OPS_CONFIGS.ad_testing_plan) },

  campaign_scaling_plan: { category: "ADS_ANALYTICS", label: "Campaign Scaling", icon: "Rocket", desc: "Scale winners safely: budget rise rules, when to duplicate", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => buildAdsOpsPrompt(ctx, ADS_OPS_CONFIGS.campaign_scaling_plan) },

  offline_conversions_strategy: { category: "ADS_ANALYTICS", label: "Offline Conversions", icon: "Store", desc: "Pass real payment/delivery data to Meta so it learns who stays COD customers", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => buildAdsOpsPrompt(ctx, ADS_OPS_CONFIGS.offline_conversions_strategy) },

  marketplace_expansion: { category: "ADS_ANALYTICS", label: "Marketplace Expansion", icon: "ShoppingBag", desc: "Sell on marketplaces (Amazon, Noon, Jumia) combined with your store", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => buildAdsOpsPrompt(ctx, ADS_OPS_CONFIGS.marketplace_expansion) },

  tof_strategy: { category: "ADS_ANALYTICS", label: "TOF Strategy (Top Funnel)", icon: "Magnet", desc: "Cold traffic: prospecting, broad audiences, awareness objectives", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => buildAdsOpsPrompt(ctx, ADS_OPS_CONFIGS.tof_strategy) },

  mof_strategy: { category: "ADS_ANALYTICS", label: "MOF Strategy (Middle Funnel)", icon: "Filter", desc: "Warm up: retargeting visitors, AddToCart, video viewers", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => buildAdsOpsPrompt(ctx, ADS_OPS_CONFIGS.mof_strategy) },

  bof_strategy: { category: "ADS_ANALYTICS", label: "BOF Strategy (Bottom Funnel)", icon: "BadgeCheck", desc: "Convert: cart abandoners, offers, conversion settings", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => buildAdsOpsPrompt(ctx, ADS_OPS_CONFIGS.bof_strategy) },

  identify_winning_ads: { category: "ADS_ANALYTICS", label: "Identify Winning Ads", icon: "SearchCheck", desc: "Spot winners early: day 1-3-7 metrics, thresholds, promote safely", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => buildAdsOpsPrompt(ctx, ADS_OPS_CONFIGS.identify_winning_ads) },

  spc_analysis: { category: "ADS_ANALYTICS", label: "SPC Analysis", icon: "Crosshair", desc: "Single Product Campaign: structure, test creatives, read results", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => buildAdsOpsPrompt(ctx, ADS_OPS_CONFIGS.spc_analysis) },

  viral_organic_strategy: { category: "ADS_ANALYTICS", label: "Viral Organic Strategy", icon: "Share2", desc: "TikTok/Reels organic that sells and feeds your pixel", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => buildAdsOpsPrompt(ctx, ADS_OPS_CONFIGS.viral_organic_strategy) },

  seo_strategy: { category: "ADS_ANALYTICS", label: "SEO Strategy", icon: "Search", desc: "Keywords, page SEO, blog, local + voice search for my store", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => buildAdsOpsPrompt(ctx, ADS_OPS_CONFIGS.seo_strategy) },

  ad_scheduling: { category: "ADS_ANALYTICS", label: "Ad Scheduling", icon: "CalendarClock", desc: "Best hours/days to run ads for COD markets, dayparting", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => buildAdsOpsPrompt(ctx, ADS_OPS_CONFIGS.ad_scheduling) },

  campaign_optimization: { category: "ADS_ANALYTICS", label: "Optimization Playbook", icon: "SlidersHorizontal", desc: "Weekly optimization checklist: pause, raise, reallocate budget", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => buildAdsOpsPrompt(ctx, ADS_OPS_CONFIGS.campaign_optimization) },

  prospecting_strategy: { category: "ADS_ANALYTICS", label: "Prospecting Strategy", icon: "Radar", desc: "Find cold buyers: broad, interests, Advantage+ audiences, exclusions", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => buildAdsOpsPrompt(ctx, ADS_OPS_CONFIGS.prospecting_strategy) },

  retargeting_strategy: { category: "ADS_ANALYTICS", label: "Retargeting", icon: "RefreshCw", desc: "Pixel-based retargeting audiences that actually convert", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => buildAdsOpsPrompt(ctx, ADS_OPS_CONFIGS.retargeting_strategy) },

  remarketing_strategy: { category: "ADS_ANALYTICS", label: "Remarketing", icon: "Repeat", desc: "Email/SMS/WhatsApp remarketing combined with Meta ads", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => buildAdsOpsPrompt(ctx, ADS_OPS_CONFIGS.remarketing_strategy) },

  pixel_training: { category: "ADS_ANALYTICS", label: "Train Pixel", icon: "Cpu", desc: "Teach Meta's pixel to learn buyers faster on small budgets", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => buildAdsOpsPrompt(ctx, ADS_OPS_CONFIGS.pixel_training) },



  // --- 🛒 Shopify Store & Apps ---

  shopify_store_generator: { category: "SHOPIFY", label: "Shopify Store (Build)", icon: "Store", desc: "Design your complete Shopify store: theme, pages, collections, and product page", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => {

    const products = (ctx.productName || "").trim() ? `My product: ${ctx.productName}.` : "I sell products online (e-commerce / dropshipping).";

    return `Act as a Shopify store design & conversion expert. ${products}

Create my complete Shopify store build plan:

- Theme to choose (free vs paid, which one) and main color/style

- Homepage sections in order (hero, benefits, best-sellers, testimonials, FAQ, shipping/COD banner)

- Product page: title, price strategy, images count, descriptions, reviews, trust badges, sticky add-to-cart

- Extra pages: About, Contact, Refund/Returns, Delivery & COD, Privacy

- Apps setup + domain + payment/COD setup

- Any currency/localization needed



Give concrete costs in USD. Format as keyPoints + recommendations.`;

  } },

  shopify_apps_research: { category: "SHOPIFY", label: "I Need Shopify Apps", icon: "Puzzle", desc: "Get the best Shopify apps for COD dropshipping: reviews, email, COD fees, order tracking", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => {

    const products = (ctx.productName || "").trim() ? `My product: ${ctx.productName}.` : "I sell products online (e-commerce / dropshipping).";

    return `Act as a Shopify apps expert. ${products}

Recommend the BEST Shopify apps for a dropshipping/COD store owner in Algeria, one per category:

- Reviews/social proof, email/SMS marketing, COD payment & delivery, order tracking, page builder, currency/order conversion, upsell & bundles, product importer (dropshipping)

For each: app name, price (free/$/month), what it does, why it matters for COD stores, and a clear priority list (Must have first). Give total monthly cost in USD. Format as keyPoints + recommendations.`;

  } },

  liquid_prompt: { category: "SHOPIFY", label: "Liquid Prompt (HTML → Shopify)", icon: "FileCode2", desc: "Paste any HTML page and get a complete Shopify Liquid theme — Tailwind setup, /sections/*.liquid with editable schema, index.json, theme.js — with LIVE progress and a downloadable theme ZIP", requiredInputs: [], outputSchema: null, buildPrompt: (ctx) => buildLiquidPrompt() },

  landing_page_builder: { category: "CRO", label: "CRO Landing Page Builder (Mobile)", icon: "MonitorSmartphone", desc: "CRO Landing Page Builder — build a conversion-focused landing page for ANY product — mobile-first, live two-pane preview with click-to-edit of any element, editable section parameters, CRO audit + auto-optimization, and one-click HTML export", requiredInputs: [], optionalInputs: ["productName", "productDescription", "productCategory", "niche", "audience", "market", "instructions"], outputSchema: null, buildPrompt: (ctx) => buildLandingStrategyPrompt(ctx) },



  // --- 📚 Methods Library Skills (from the 15.docx strategy guide) ---

  // The card lets you pick WHICH methods to run; each run outputs the full

  // playbook for the selected method(s). See components/MethodLibrary.jsx.

  facebook_ads_testing_methods: { category: "CRO", label: "Facebook Ads Testing — 15 Methods", icon: "FlaskConical", desc: "15 Facebook Ads testing methods from the master guide — pick any method on the card (Classic ABO, CBO broad, creative-first, ASC, hooks, copy, lookalikes, retargeting, cost cap, UGC, international, offers, full-funnel…) and get its complete step-by-step playbook with budgets, KPIs and kill/scale rules", requiredInputs: [], optionalInputs: ["productName", "niche", "audience", "market", "instructions"], outputSchema: null, buildPrompt: (ctx) => `You are a senior Facebook Ads strategist. Apply the Facebook Ads testing method playbook thoroughly for ${ctx.productName || "the connected products"} and return a complete action plan as Markdown.` },

  facebook_ads_scaling_methods: { category: "CRO", label: "Facebook Ads Scaling — 15 Methods", icon: "TrendingUp", desc: "15 Facebook Ads scaling methods — pick any method on the card (vertical budget ladder, horizontal duplication, CBO consolidation, ASC scale, cost cap, creative refresh, lookalikes, geo expansion, retargeting, offers/AOV, email+SMS, dayparting, influencers, multi-product, full-funnel) and get its complete playbook", requiredInputs: [], optionalInputs: ["productName", "niche", "audience", "market", "instructions"], outputSchema: null, buildPrompt: (ctx) => `You are a senior Facebook Ads scaling expert. Apply the scaling method playbook thoroughly for ${ctx.productName || "the connected products"} and return a complete action plan as Markdown.` },

  winning_product_methods: { category: "ADVANCED_PRODUCT", label: "Find Winning Products — Chinese Sources", icon: "Telescope", desc: "Secret methods to find winning products from Chinese sources — pick any method on the card (1688 deep mining, Taobao trends, Douyin viral mining, TMIC data, AliExpress intel, WeChat & Xiaohongshu, Alibaba suppliers, spy tools, freight forwarders, social commerce + dropshipping/product-spy/wholesale mega-methods) and get its complete step-by-step playbook", requiredInputs: [], optionalInputs: ["productName", "niche", "audience", "market", "instructions", "maxUnitCost", "maxMoq"], outputSchema: null, placeholder: ADVANCED_PRODUCT_PLACEHOLDERS.winning_product_methods, buildPrompt: (ctx) => `You are a winning-product sourcing expert. Apply the Chinese-source product research method playbook thoroughly for ${ctx.productName || "the connected products"} and return a complete action plan as Markdown.` },

  sales_master_guide: { category: "CRO", label: "Master Guide — 50+ Revenue Methods", icon: "BookMarked", desc: "The complete master guide — 50+ methods to get more sales — pick any mega-method on the card (price psychology, checkout & cart, product page, email marketing, traffic expansion) or any method 020-050 (YouTube SEO, affiliates, retargeting, bundles, influencers…) and get its complete playbook", requiredInputs: [], optionalInputs: ["productName", "niche", "audience", "market", "instructions"], outputSchema: null, buildPrompt: (ctx) => `You are an ecommerce revenue optimization expert. Apply the master-guide method playbook thoroughly for ${ctx.productName || "the connected products"} and return a complete action plan as Markdown.` },

  media_buyer_100_analysis: { category: "CRO", label: "100 Expert Messages — Media-Buyer Analysis", icon: "MessagesSquare", desc: "100 expert WhatsApp-style media-buyer messages from the Algerian/Darija playbook (hooks, COD traps, creative fatigue, delivery chaos, retargeting lies, account bans, scaling mistakes…) — pick any message on the card and get a full strategy analysis with transferable frameworks", requiredInputs: [], optionalInputs: ["productName", "niche", "audience", "market", "instructions"], outputSchema: null, buildPrompt: (ctx) => `You are a senior media buyer and ecommerce strategist. Analyze the selected expert message(s) thoroughly for ${ctx.productName || "the connected products"} and return a complete, actionable analysis as Markdown.` },


  // --- 🆕 Added Product Intelligence ---
  product_intelligence_01: { category: "ADVANCED_PRODUCT", label: "01", icon: "Database", desc: "Run the full 17-skill Product Intelligence pipeline (Group 01 & Group 02).", requiredInputs: ["productName"], optionalInputs: ["productDescription", "niche", "audience", "market"], outputSchema: null, buildPrompt: (ctx) => {
    return `PRODUCT INTELLIGENCE SKILL — MASTER BUILD PROMPT

Build a professional PRODUCT INTELLIGENCE research skill for an AI-powered e-commerce research platform.
You must execute the 17 skills across GROUP 01 (Product Discovery) and GROUP 02 (Product Profitability).

Target Market: ALGERIA (CASH ON DELIVERY / COD E-COMMERCE)

# TARGET PRODUCT DETAILS
Name: ${ctx.productName || 'Unknown Product'}
Description: ${ctx.productDescription || ''}
Niche: ${ctx.niche || ''}
Market: ${ctx.market || ''}

Run the following pipeline for this product:
GROUP 01 — PRODUCT DISCOVERY
01. Winning Product Finder
02. Product Deep Dive
03. Product Demand Analysis
04. Product Market Research
05. Product Trend Analysis
06. Product Validation
07. Product DNA Analysis
08. Product Problem-Solution Fit
09. Product Differentiation

GROUP 02 — PRODUCT PROFITABILITY
10. Product Sourcing
11. Supplier Research
12. Supplier Quality Check
13. Product Cost Analysis
14. Product Risk Analysis
15. Product Compliance Check
16. Product Test Recommendation
17. Product Launch Readiness

CRITICAL INSTRUCTION: Return ONLY a valid JSON object matching this exact structure (do not wrap in markdown, no markdown blocks).
{
  "title": "Product Intelligence Report",
  "subtitle": "Analysis for ${ctx.productName || 'Product'}",
  "discovery": {
    "title": "Group 01: Product Discovery",
    "checklist": [
      "01. Finder: (Result summary)",
      "02. Deep Dive: (Result summary)",
      "03. Demand: (Result summary)",
      "04. Market: (Result summary)",
      "05. Trend: (Result summary)",
      "06. Validation: (Result summary)",
      "07. DNA: (Result summary)",
      "08. Problem-Solution: (Result summary)",
      "09. Differentiation: (Result summary)"
    ]
  },
  "profitability": {
    "title": "Group 02: Product Profitability",
    "checklist": [
      "10. Sourcing: (Result summary)",
      "11. Supplier: (Result summary)",
      "12. Quality: (Result summary)",
      "13. Cost Analysis: (Result summary)",
      "14. Risk Analysis: (Result summary)",
      "15. Compliance: (Result summary)",
      "16. Test Plan: (Result summary)",
      "17. Launch Readiness: (Result summary)"
    ]
  },
  "score": "85",
  "actionText": "Upgrade to PRO"
}`;
  } },

  // --- 🇩🇿 Advanced Algeria Skills ---

  master_dz_landing_page_strategy: { category: "ALGERIA", label: "Master DZ Landing Page Strategy", icon: "LayoutTemplate", desc: "Builds a $10,000+ landing page strategy in Algerian Darja", requiredInputs: ["productName"], outputSchema: null, buildPrompt: (ctx) => buildMasterPromptDz(ctx) },

  wilaya_profitability_map: { category: "ALGERIA", label: "Wilaya Profitability Map", icon: "Map", desc: "Map profitability by Wilaya", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `Wilaya profitability for ${ctx.productName}` },

  wilaya_demand_predictor: { category: "ALGERIA", label: "Wilaya Demand Predictor", icon: "TrendingUp", desc: "Predict demand by Wilaya", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `Wilaya demand for ${ctx.productName}` },

  wilaya_delivery_cost_analyzer: { category: "ALGERIA", label: "Wilaya Delivery Cost Analyzer", icon: "Truck", desc: "Analyze delivery costs", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `Delivery costs for ${ctx.productName}` },

  confirmation_rate_analyzer: { category: "ALGERIA", label: "Confirmation Rate Analyzer", icon: "PhoneCall", desc: "Analyze phone confirmation rates", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `Confirmation rate for ${ctx.productName}` },

  cancellation_predictor: { category: "ALGERIA", label: "Cancellation Predictor", icon: "PhoneOff", desc: "Predict order cancellations", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `Cancellation predictor for ${ctx.productName}` },

  delivery_success_predictor: { category: "ALGERIA", label: "Delivery Success Predictor", icon: "CheckCircle", desc: "Predict successful deliveries", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `Delivery success for ${ctx.productName}` },

  true_cod_profit_calculator: { category: "ALGERIA", label: "True COD Profit Calculator", icon: "Calculator", desc: "Calculate profit after returns", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `True COD profit for ${ctx.productName}` },

  dz_buyer_psychology: { category: "ALGERIA", label: "DZ Buyer Psychology", icon: "Brain", desc: "Understand Algerian buyers", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `DZ buyer psychology for ${ctx.productName}` },

  algerian_arabic_copywriter: { category: "ALGERIA", label: "Algerian Arabic Copywriter", icon: "PenTool", desc: "Write in Algerian Arabic (Darja)", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `Darja copy for ${ctx.productName}` },

  algerian_french_copywriter: { category: "ALGERIA", label: "Algerian French Copywriter", icon: "PenTool", desc: "Write in Algerian French", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `DZ French copy for ${ctx.productName}` },

  dz_facebook_strategy: { category: "ALGERIA", label: "DZ Facebook Strategy", icon: "Facebook", desc: "Facebook strategy for DZ", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `DZ FB strategy for ${ctx.productName}` },

  dz_tiktok_strategy: { category: "ALGERIA", label: "DZ TikTok Strategy", icon: "Music", desc: "TikTok strategy for DZ", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `DZ TikTok strategy for ${ctx.productName}` },

  dz_marketplace_analysis: { category: "ALGERIA", label: "DZ Marketplace Analysis", icon: "Store", desc: "Analyze Ouedkniss/Marketplace", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `DZ marketplace for ${ctx.productName}` },

  dzd_price_psychology: { category: "ALGERIA", label: "DZD Price Psychology", icon: "Tags", desc: "Optimize DZD pricing", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `DZD pricing for ${ctx.productName}` },

  dz_offer_generator: { category: "ALGERIA", label: "DZ Offer Generator", icon: "Gift", desc: "Generate offers for DZ market", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `DZ offers for ${ctx.productName}` },

  cod_confirmation_script_optimizer: { category: "ALGERIA", label: "COD Confirmation Script Optimizer", icon: "Mic", desc: "Optimize call scripts", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `COD script for ${ctx.productName}` },

  fake_order_detector: { category: "ALGERIA", label: "Fake Order Detector", icon: "ShieldAlert", desc: "Detect fake orders", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `Fake order detection for ${ctx.productName}` },

  failed_delivery_analyzer: { category: "ALGERIA", label: "Failed Delivery Analyzer", icon: "PackageX", desc: "Analyze return reasons", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `Failed deliveries for ${ctx.productName}` },

  dz_local_competitor_finder: { category: "ALGERIA", label: "DZ Local Competitor Finder", icon: "Search", desc: "Find local competitors", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `DZ competitors for ${ctx.productName}` },

  best_wilaya_launch_strategy: { category: "ALGERIA", label: "Best Wilaya Launch Strategy", icon: "Rocket", desc: "Wilaya rollout strategy", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `Wilaya launch for ${ctx.productName}` },



  // --- 🌍 Advanced International Skills ---

  country_ranking_engine: { category: "INTERNATIONAL", label: "Country Ranking Engine", icon: "ListOrdered", desc: "Rank countries for expansion", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `Country ranking for ${ctx.productName}` },

  purchasing_power_analyzer: { category: "INTERNATIONAL", label: "Purchasing Power Analyzer", icon: "Wallet", desc: "Analyze purchasing power", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `Purchasing power for ${ctx.productName}` },

  currency_risk_analyzer: { category: "INTERNATIONAL", label: "Currency Risk Analyzer", icon: "Banknote", desc: "Analyze currency risks", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `Currency risk for ${ctx.productName}` },

  country_ecommerce_maturity: { category: "INTERNATIONAL", label: "Country E-commerce Maturity", icon: "TrendingUp", desc: "Analyze market maturity", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `E-com maturity for ${ctx.productName}` },

  payment_preference_analyzer: { category: "INTERNATIONAL", label: "Payment Preference Analyzer", icon: "CreditCard", desc: "Analyze payment habits", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `Payment preferences for ${ctx.productName}` },

  logistics_difficulty_score: { category: "INTERNATIONAL", label: "Logistics Difficulty Score", icon: "Truck", desc: "Score logistics difficulty", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `Logistics difficulty for ${ctx.productName}` },

  tax_impact_analyzer: { category: "INTERNATIONAL", label: "Tax Impact Analyzer", icon: "FileText", desc: "Analyze tax implications", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `Tax impact for ${ctx.productName}` },

  regulatory_risk_analyzer: { category: "INTERNATIONAL", label: "Regulatory Risk Analyzer", icon: "Scale", desc: "Analyze regulations", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `Regulatory risk for ${ctx.productName}` },

  localization_score: { category: "INTERNATIONAL", label: "Localization Score", icon: "Globe", desc: "Score localization effort", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `Localization score for ${ctx.productName}` },

  language_localization: { category: "INTERNATIONAL", label: "Language Localization", icon: "Languages", desc: "Localize language content", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `Language localization for ${ctx.productName}` },

  cultural_fit_analyzer: { category: "INTERNATIONAL", label: "Cultural Fit Analyzer", icon: "Users", desc: "Analyze cultural fit", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `Cultural fit for ${ctx.productName}` },

  international_margin_calculator: { category: "INTERNATIONAL", label: "International Margin Calculator", icon: "Calculator", desc: "Calculate margins across borders", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `Intl margin for ${ctx.productName}` },

  country_roas_benchmark: { category: "INTERNATIONAL", label: "Country ROAS Benchmark", icon: "BarChart", desc: "Benchmark ROAS by country", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `ROAS benchmark for ${ctx.productName}` },

  best_country_selector: { category: "INTERNATIONAL", label: "Best Country Selector", icon: "Target", desc: "Select best country", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `Best country for ${ctx.productName}` },

  international_expansion_planner: { category: "INTERNATIONAL", label: "International Expansion Planner", icon: "Map", desc: "Plan international expansion", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `Expansion plan for ${ctx.productName}` },



  // --- 🤖 Very Advanced AI Skills ---

  website_preview: { category: "ADVANCED_AI", label: "Website Preview", icon: "Globe", desc: "Live preview of a website URL", requiredInputs: [], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `Preview website` },

  json_to_text_converter: { category: "ADVANCED_AI", label: "Human Text Converter", icon: "FileText", desc: "Convert any raw JSON or data into a beautifully formatted, easy-to-read report", requiredInputs: [], outputSchema: null, buildPrompt: () => "Take all the upstream data provided and rewrite it into a beautifully formatted, highly readable, professional report. Do NOT output JSON. Use headings, bullet points, and bold text to make it perfectly readable for a human." },



  ecommerce_strategist: { category: "ADVANCED_AI", label: "E-commerce Strategist", icon: "Brain", desc: "AI Master Strategist", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `E-commerce strategy for ${ctx.productName}` },

  autonomous_product_researcher: { category: "ADVANCED_AI", label: "Autonomous Product Researcher", icon: "Bot", desc: "Auto-research products", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `Auto-research ${ctx.productName}` },

  autonomous_competitor_researcher: { category: "ADVANCED_AI", label: "Autonomous Competitor Researcher", icon: "Bot", desc: "Auto-research competitors", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `Auto-competitor ${ctx.productName}` },

  autonomous_market_researcher: { category: "ADVANCED_AI", label: "Autonomous Market Researcher", icon: "Bot", desc: "Auto-research markets", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `Auto-market ${ctx.productName}` },

  autonomous_data_analyst: { category: "ADVANCED_AI", label: "Autonomous Data Analyst", icon: "Bot", desc: "Auto-analyze data", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `Auto-data for ${ctx.productName}` },

  research_critic: { category: "ADVANCED_AI", label: "Research Critic", icon: "Eye", desc: "Critique existing research", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `Critique research for ${ctx.productName}` },

  evidence_validator: { category: "ADVANCED_AI", label: "Evidence Validator", icon: "CheckSquare", desc: "Validate claims and evidence", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `Validate evidence for ${ctx.productName}` },

  contradiction_detector: { category: "ADVANCED_AI", label: "Contradiction Detector", icon: "AlertTriangle", desc: "Detect contradictory data", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `Detect contradictions for ${ctx.productName}` },

  risk_detector: { category: "ADVANCED_AI", label: "Risk Detector", icon: "ShieldAlert", desc: "Detect business risks", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `Detect risks for ${ctx.productName}` },

  opportunity_detector: { category: "ADVANCED_AI", label: "Opportunity Detector", icon: "Lightbulb", desc: "Detect hidden opportunities", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `Detect opportunities for ${ctx.productName}` },

  insight_generator: { category: "ADVANCED_AI", label: "Insight Generator", icon: "Zap", desc: "Generate actionable insights", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `Generate insights for ${ctx.productName}` },

  insight_connector: { category: "ADVANCED_AI", label: "Insight Connector", icon: "Link", desc: "Connect disparate insights", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `Connect insights for ${ctx.productName}` },

  next_best_action: { category: "ADVANCED_AI", label: "Next Best Action", icon: "ArrowRight", desc: "Determine next logical step", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `Next best action for ${ctx.productName}` },

  decision_assistant: { category: "ADVANCED_AI", label: "Decision Assistant", icon: "HelpCircle", desc: "Assist with strategic decisions", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `Decision assistance for ${ctx.productName}` },

  best_strategy_selector: { category: "ADVANCED_AI", label: "Best Strategy Selector", icon: "Target", desc: "Select the optimal strategy", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `Select strategy for ${ctx.productName}` },



  // ══════════════════════════════════════════════════════════════════════

  // 🆕 NEW — 26 new categories · ~430 skills

  // ══════════════════════════════════════════════════════════════════════



  // --- 🧠 Strategic Intelligence ---

  business_opportunity_finder: stdSkill("business_opportunity_finder", "STRATEGIC", "Business Opportunity Finder", "Score and surface the best business opportunities"),

  market_opportunity_score: stdSkill("market_opportunity_score", "STRATEGIC", "Market Opportunity Score", "Score a market's size, demand and entry timing"),

  market_entry_strategy: stdSkill("market_entry_strategy", "STRATEGIC", "Market Entry Strategy", "Best market entry path, timing and resources"),

  business_model_analyzer: stdSkill("business_model_analyzer", "STRATEGIC", "Business Model Analyzer", "Evaluate and compare business models"),

  ecommerce_business_health_score: stdSkill("ecommerce_business_health_score", "STRATEGIC", "E-commerce Business Health Score", "Overall health score of an online business"),

  growth_bottleneck_detector: stdSkill("growth_bottleneck_detector", "STRATEGIC", "Growth Bottleneck Detector", "Find what blocks business growth"),

  growth_opportunity_map: stdSkill("growth_opportunity_map", "STRATEGIC", "Growth Opportunity Map", "Map all possible growth levers and channels"),

  revenue_growth_simulator: stdSkill("revenue_growth_simulator", "STRATEGIC", "Revenue Growth Simulator", "Simulate revenue growth scenarios"),

  profit_growth_simulator: stdSkill("profit_growth_simulator", "STRATEGIC", "Profit Growth Simulator", "Simulate profit growth scenarios"),

  competitive_advantage_finder: stdSkill("competitive_advantage_finder", "STRATEGIC", "Competitive Advantage Finder", "Find durable competitive advantages"),

  moat_analyzer: stdSkill("moat_analyzer", "STRATEGIC", "Moat Analyzer", "Assess business moats and defensibility"),

  strategic_positioning_generator: stdSkill("strategic_positioning_generator", "STRATEGIC", "Strategic Positioning Generator", "Position the business in the market"),

  niche_dominance_strategy: stdSkill("niche_dominance_strategy", "STRATEGIC", "Niche Dominance Strategy", "Dominate a niche step by step"),

  blue_ocean_finder: stdSkill("blue_ocean_finder", "STRATEGIC", "Blue Ocean Finder", "Find uncontested market space"),

  market_saturation_analyzer: stdSkill("market_saturation_analyzer", "STRATEGIC", "Market Saturation Analyzer", "Measure how saturated a market is"),

  market_white_space_finder: stdSkill("market_white_space_finder", "STRATEGIC", "Market White Space Finder", "Find unserved demand in a market"),

  demand_supply_gap_analyzer: stdSkill("demand_supply_gap_analyzer", "STRATEGIC", "Demand-Supply Gap Analyzer", "Quantify demand vs available supply"),

  market_timing_score: stdSkill("market_timing_score", "STRATEGIC", "Market Timing Score", "Score the best timing to enter a market"),

  business_scenario_simulator: stdSkill("business_scenario_simulator", "STRATEGIC", "Business Scenario Simulator", "Test business scenarios before committing"),

  what_if_simulator: stdSkill("what_if_simulator", "STRATEGIC", "What-If Simulator", "Run what-if analyses on key variables"),

  strategic_decision_simulator: stdSkill("strategic_decision_simulator", "STRATEGIC", "Strategic Decision Simulator", "Simulate outcomes of strategic decisions"),



  // --- 🔥 Winning Product 2.0 ---

  winning_product_score_2: stdSkill("winning_product_score_2", "PRODUCT_2", "Winning Product Score 2.0", "Next-level winning product score"),

  product_lifecycle_detector: stdSkill("product_lifecycle_detector", "PRODUCT_2", "Product Lifecycle Detector", "Detect a product's lifecycle stage"),

  product_lifecycle_forecast: stdSkill("product_lifecycle_forecast", "PRODUCT_2", "Product Lifecycle Forecast", "Forecast the product lifecycle ahead"),

  product_saturation_score: stdSkill("product_saturation_score", "PRODUCT_2", "Product Saturation Score", "Score how saturated a product is"),

  product_death_detector: stdSkill("product_death_detector", "PRODUCT_2", "Product Death Detector", "Detect a declining or dying product"),

  product_revival_finder: stdSkill("product_revival_finder", "PRODUCT_2", "Product Revival Finder", "Find products returning to popularity"),

  product_trend_origin_tracker: stdSkill("product_trend_origin_tracker", "PRODUCT_2", "Product Trend Origin Tracker", "Trace where a product trend started"),

  trend_diffusion_tracker: stdSkill("trend_diffusion_tracker", "PRODUCT_2", "Trend Diffusion Tracker", "Track how a trend spreads across markets"),

  geo_arbitrage_opportunity_finder: stdSkill("geo_arbitrage_opportunity_finder", "PRODUCT_2", "Geo-Arbitrage Opportunity Finder", "Find where a product is under-served geographically"),

  cross_country_product_gap_finder: stdSkill("cross_country_product_gap_finder", "PRODUCT_2", "Cross-Country Product Gap Finder", "Find products missing in specific countries"),

  product_price_gap_finder: stdSkill("product_price_gap_finder", "PRODUCT_2", "Product Price Gap Finder", "Find price gaps between markets"),

  product_demand_gap_finder: stdSkill("product_demand_gap_finder", "PRODUCT_2", "Product Demand Gap Finder", "Find unmet product demand"),

  product_competition_gap_finder: stdSkill("product_competition_gap_finder", "PRODUCT_2", "Product Competition Gap Finder", "Find low-competition product spaces"),

  product_review_gap_finder: stdSkill("product_review_gap_finder", "PRODUCT_2", "Product Review Gap Finder", "Find products with unsatisfied reviewers"),

  product_creative_gap_finder: stdSkill("product_creative_gap_finder", "PRODUCT_2", "Product Creative Gap Finder", "Find products with weak ad creatives"),

  product_offer_gap_finder: stdSkill("product_offer_gap_finder", "PRODUCT_2", "Product Offer Gap Finder", "Find products with weak offers"),

  product_localization_opportunity: stdSkill("product_localization_opportunity", "PRODUCT_2", "Product Localization Opportunity", "Find localization angles for a product"),

  product_innovation_generator: stdSkill("product_innovation_generator", "PRODUCT_2", "Product Innovation Generator", "Generate product innovations"),

  product_improvement_generator: stdSkill("product_improvement_generator", "PRODUCT_2", "Product Improvement Generator", "Generate product improvements"),

  product_variant_opportunity_finder: stdSkill("product_variant_opportunity_finder", "PRODUCT_2", "Product Variant Opportunity Finder", "Find winning product variants"),

  product_accessory_finder: stdSkill("product_accessory_finder", "PRODUCT_2", "Product Accessory Finder", "Find accessories to sell alongside"),

  product_replacement_opportunity: stdSkill("product_replacement_opportunity", "PRODUCT_2", "Product Replacement Opportunity", "Spot replacement opportunities"),

  product_consumable_opportunity: stdSkill("product_consumable_opportunity", "PRODUCT_2", "Product Consumable Opportunity", "Find consumable companion products"),

  product_subscription_potential: stdSkill("product_subscription_potential", "PRODUCT_2", "Product Subscription Potential", "Score subscription potential of a product"),

  product_giftability_score: stdSkill("product_giftability_score", "PRODUCT_2", "Product Giftability Score", "Score how giftable a product is"),

  impulse_purchase_score: stdSkill("impulse_purchase_score", "PRODUCT_2", "Impulse Purchase Score", "Score impulse-buy potential"),

  problem_severity_score: stdSkill("problem_severity_score", "PRODUCT_2", "Problem Severity Score", "Score how severe the buyer's problem is"),

  frequency_of_problem_score: stdSkill("frequency_of_problem_score", "PRODUCT_2", "Frequency of Problem Score", "Score how often the problem occurs"),

  urgency_score: stdSkill("urgency_score", "PRODUCT_2", "Urgency Score", "Score buyer urgency"),

  demonstrability_score: stdSkill("demonstrability_score", "PRODUCT_2", "Demonstrability Score", "Score how demonstrable the product is"),

  before_after_potential_score: stdSkill("before_after_potential_score", "PRODUCT_2", "Before/After Potential Score", "Score transformation / demo potential"),

  content_potential_score: stdSkill("content_potential_score", "PRODUCT_2", "Content Potential Score", "Score content and organic potential"),



  // --- 🌐 Geo-Arbitrage Intelligence ---

  geo_trend_radar: stdSkill("geo_trend_radar", "GEO_ARBITRAGE", "Geo Trend Radar", "Scan which regions are hot for a trend"),

  trend_origin_country_detector: stdSkill("trend_origin_country_detector", "GEO_ARBITRAGE", "Trend Origin Country Detector", "Find where a trend started"),

  trend_migration_tracker: stdSkill("trend_migration_tracker", "GEO_ARBITRAGE", "Trend Migration Tracker", "Track a trend moving between countries"),

  country_adoption_lag_analyzer: stdSkill("country_adoption_lag_analyzer", "GEO_ARBITRAGE", "Country Adoption Lag Analyzer", "Measure how late each country adopts trends"),

  china_asia_trend_detector: stdSkill("china_asia_trend_detector", "GEO_ARBITRAGE", "China → Asia Trend Detector", "Detect trends moving China to Asia"),

  asia_usa_trend_detector: stdSkill("asia_usa_trend_detector", "GEO_ARBITRAGE", "Asia → USA Trend Detector", "Detect trends moving Asia to USA"),

  usa_europe_trend_detector: stdSkill("usa_europe_trend_detector", "GEO_ARBITRAGE", "USA → Europe Trend Detector", "Detect trends moving USA to Europe"),

  trend_geographic_heatmap: stdSkill("trend_geographic_heatmap", "GEO_ARBITRAGE", "Trend Geographic Heatmap", "Visualize trend intensity by country"),

  country_trend_acceleration: stdSkill("country_trend_acceleration", "GEO_ARBITRAGE", "Country Trend Acceleration", "Measure trend speed per country"),

  early_market_detector: stdSkill("early_market_detector", "GEO_ARBITRAGE", "Early Market Detector", "Find countries where a trend is early"),

  late_market_detector: stdSkill("late_market_detector", "GEO_ARBITRAGE", "Late Market Detector", "Find countries where a trend is late"),

  cross_border_product_arbitrage: stdSkill("cross_border_product_arbitrage", "GEO_ARBITRAGE", "Cross-Border Product Arbitrage", "Move products between markets profitably"),

  price_arbitrage_finder: stdSkill("price_arbitrage_finder", "GEO_ARBITRAGE", "Price Arbitrage Finder", "Find profitable cross-country price gaps"),

  demand_arbitrage_finder: stdSkill("demand_arbitrage_finder", "GEO_ARBITRAGE", "Demand Arbitrage Finder", "Find cross-country demand gaps"),

  competition_arbitrage_finder: stdSkill("competition_arbitrage_finder", "GEO_ARBITRAGE", "Competition Arbitrage Finder", "Find low-competition markets for a product"),

  creative_arbitrage_finder: stdSkill("creative_arbitrage_finder", "GEO_ARBITRAGE", "Creative Arbitrage Finder", "Sell creative angles that work elsewhere"),

  offer_arbitrage_finder: stdSkill("offer_arbitrage_finder", "GEO_ARBITRAGE", "Offer Arbitrage Finder", "Use proven offers from other markets"),

  localization_arbitrage_finder: stdSkill("localization_arbitrage_finder", "GEO_ARBITRAGE", "Localization Arbitrage Finder", "Localize winning products for a market"),

  geo_arbitrage_engine: {

    category: "GEO_ARBITRAGE", label: "Geo-Arbitrage Opportunity Engine", icon: "Compass",

    desc: "Master engine: where a product is early, saturated, or best to enter first",

    requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight,

    buildPrompt: (ctx) => {

      const p = (ctx.productName || "").trim();

      const c = (ctx.countries || "").trim();

      return `Act as a global geo-arbitrage intelligence engine.

Product: ${p || "the products in my project"}.

Markets I care about: ${c || "China → Asia → USA → Europe → Middle East / Africa"}.



Analyze trend diffusion across countries and output a complete arbitrage map:

1. WHERE THIS PRODUCT IS EARLY vs SATURATED (per country)

2. The cross-border pipeline: origin → early markets → growth → saturation

3. Best launch country FIRST and expected selling price there

4. Competition level per country and estimated margin after ALL costs (freight / customs / payment) per country

5. Test order of countries to expand into afterwards

6. Whether to enter now or wait, with reasoning

Respond ONLY with JSON: { "summary", "keyPoints": [...], "recommendations": [...] }`;

    }

  },



  // --- 🏭 Supplier & Sourcing Intelligence ---

  supplier_intelligence: stdSkill("supplier_intelligence", "SUPPLIER", "Supplier Intelligence", "Complete supplier research"),

  supplier_finder: stdSkill("supplier_finder", "SUPPLIER", "Supplier Finder", "Find suppliers for a product"),

  supplier_comparison: stdSkill("supplier_comparison", "SUPPLIER", "Supplier Comparison", "Compare suppliers side by side"),

  supplier_reliability_score: stdSkill("supplier_reliability_score", "SUPPLIER", "Supplier Reliability Score", "Score supplier reliability"),

  supplier_risk_score: stdSkill("supplier_risk_score", "SUPPLIER", "Supplier Risk Score", "Score supplier risk"),

  supplier_verification: stdSkill("supplier_verification", "SUPPLIER", "Supplier Verification", "Verify a supplier is legit"),

  supplier_moq_analyzer: stdSkill("supplier_moq_analyzer", "SUPPLIER", "Supplier MOQ Analyzer", "Analyze minimum order quantities"),

  supplier_price_negotiator: stdSkill("supplier_price_negotiator", "SUPPLIER", "Supplier Price Negotiator", "Negotiate better supplier prices"),

  supplier_negotiation_script: stdSkill("supplier_negotiation_script", "SUPPLIER", "Supplier Negotiation Script", "Word-for-word negotiation scripts"),

  supplier_response_analyzer: stdSkill("supplier_response_analyzer", "SUPPLIER", "Supplier Response Analyzer", "Analyze how suppliers reply"),

  supplier_review_analyzer: stdSkill("supplier_review_analyzer", "SUPPLIER", "Supplier Review Analyzer", "Analyze supplier reviews"),

  supplier_order_history_analyzer: stdSkill("supplier_order_history_analyzer", "SUPPLIER", "Supplier Order History Analyzer", "Analyze supplier order history"),

  supplier_product_quality_analyzer: stdSkill("supplier_product_quality_analyzer", "SUPPLIER", "Supplier Product Quality Analyzer", "Evaluate product quality signals"),

  supplier_lead_time_analyzer: stdSkill("supplier_lead_time_analyzer", "SUPPLIER", "Supplier Lead Time Analyzer", "Analyze supplier lead times"),

  supplier_production_capacity: stdSkill("supplier_production_capacity", "SUPPLIER", "Supplier Production Capacity", "Estimate supplier capacity"),

  supplier_factory_vs_trading_detector: stdSkill("supplier_factory_vs_trading_detector", "SUPPLIER", "Supplier Factory vs Trading Detector", "Detect factory vs trading company"),

  supplier_fake_listing_detector: stdSkill("supplier_fake_listing_detector", "SUPPLIER", "Supplier Fake Listing Detector", "Detect fake supplier listings"),

  supplier_duplicate_detector: stdSkill("supplier_duplicate_detector", "SUPPLIER", "Supplier Duplicate Detector", "Find duplicate supplier profiles"),

  supplier_switching_risk: stdSkill("supplier_switching_risk", "SUPPLIER", "Supplier Switching Risk", "Risk of switching suppliers"),

  supplier_dependency_risk: stdSkill("supplier_dependency_risk", "SUPPLIER", "Supplier Dependency Risk", "Risk of depending on one supplier"),

  multi_supplier_strategy: stdSkill("multi_supplier_strategy", "SUPPLIER", "Multi-Supplier Strategy", "Strategy for multiple suppliers"),

  landed_cost_calculator: stdSkill("landed_cost_calculator", "SUPPLIER", "Landed Cost Calculator", "True landed cost per unit"),

  true_product_cost: stdSkill("true_product_cost", "SUPPLIER", "True Product Cost", "Full product cost breakdown"),

  shipping_cost_simulator: stdSkill("shipping_cost_simulator", "SUPPLIER", "Shipping Cost Simulator", "Simulate shipping costs"),

  moq_profit_simulator: stdSkill("moq_profit_simulator", "SUPPLIER", "MOQ Profit Simulator", "Profit at different MOQs"),

  bulk_order_profit_simulator: stdSkill("bulk_order_profit_simulator", "SUPPLIER", "Bulk Order Profit Simulator", "Profit at bulk order sizes"),

  import_cost_simulator: stdSkill("import_cost_simulator", "SUPPLIER", "Import Cost Simulator", "Import costs incl. customs and fees"),

  warehouse_cost_simulator: stdSkill("warehouse_cost_simulator", "SUPPLIER", "Warehouse Cost Simulator", "Warehouse / 3PL storage costs"),

  supplier_margin_estimator: stdSkill("supplier_margin_estimator", "SUPPLIER", "Supplier Margin Estimator", "Estimate margins per supplier and order"),

  sourcing_negotiation_optimizer: stdSkill("sourcing_negotiation_optimizer", "SUPPLIER", "Sourcing Negotiation Optimizer", "Optimize the whole sourcing negotiation"),



  // --- 📦 Logistics & Supply Chain ---

  shipping_route_optimizer: stdSkill("shipping_route_optimizer", "LOGISTICS", "Shipping Route Optimizer", "Best shipping route per order"),

  shipping_method_selector: stdSkill("shipping_method_selector", "LOGISTICS", "Shipping Method Selector", "Pick the right shipping method"),

  delivery_time_predictor: stdSkill("delivery_time_predictor", "LOGISTICS", "Delivery Time Predictor", "Predict delivery time"),

  shipping_delay_predictor: stdSkill("shipping_delay_predictor", "LOGISTICS", "Shipping Delay Predictor", "Predict and avoid shipping delays"),

  logistics_risk_score: stdSkill("logistics_risk_score", "LOGISTICS", "Logistics Risk Score", "Score logistics risks"),

  warehouse_location_optimizer: stdSkill("warehouse_location_optimizer", "LOGISTICS", "Warehouse Location Optimizer", "Best warehouse locations"),

  inventory_forecast: stdSkill("inventory_forecast", "LOGISTICS", "Inventory Forecast", "Forecast inventory needs"),

  inventory_reorder_predictor: stdSkill("inventory_reorder_predictor", "LOGISTICS", "Inventory Reorder Predictor", "When to reorder stock"),

  stockout_predictor: stdSkill("stockout_predictor", "LOGISTICS", "Stockout Predictor", "Predict stockouts before they happen"),

  overstock_predictor: stdSkill("overstock_predictor", "LOGISTICS", "Overstock Predictor", "Predict excess stock"),

  safety_stock_calculator: stdSkill("safety_stock_calculator", "LOGISTICS", "Safety Stock Calculator", "Calculate safety stock"),

  reorder_point_calculator: stdSkill("reorder_point_calculator", "LOGISTICS", "Reorder Point Calculator", "Calculate reorder points"),

  inventory_turnover_analyzer: stdSkill("inventory_turnover_analyzer", "LOGISTICS", "Inventory Turnover Analyzer", "Analyze inventory turnover"),

  dead_stock_detector: stdSkill("dead_stock_detector", "LOGISTICS", "Dead Stock Detector", "Detect slow / dead stock"),

  fulfillment_cost_analyzer: stdSkill("fulfillment_cost_analyzer", "LOGISTICS", "Fulfillment Cost Analyzer", "Analyze fulfillment costs per order"),

  three_pl_comparison: stdSkill("three_pl_comparison", "LOGISTICS", "3PL Comparison", "Compare fulfillment providers (3PL)"),

  dropshipping_vs_stock_analyzer: stdSkill("dropshipping_vs_stock_analyzer", "LOGISTICS", "Dropshipping vs Stock Analyzer", "Dropship vs hold stock comparison"),

  local_stock_vs_import_analyzer: stdSkill("local_stock_vs_import_analyzer", "LOGISTICS", "Local Stock vs Import Analyzer", "Local stock vs import trade-offs"),

  china_warehouse_strategy: stdSkill("china_warehouse_strategy", "LOGISTICS", "China Warehouse Strategy", "Use China warehousing / fulfillment"),

  multi_warehouse_strategy: stdSkill("multi_warehouse_strategy", "LOGISTICS", "Multi-Warehouse Strategy", "Multi-warehouse fulfillment plan"),



  // --- 💰 Advanced Financial Intelligence ---

  unit_economics_engine: {

    category: "FINANCE", label: "Unit Economics Engine", icon: "Calculator",

    desc: "Full per-unit economics and all break-even limits",

    requiredInputs: [], outputSchema: SchemaStandardInsight,

    buildPrompt: (ctx) => `Act as a unit economics expert. Using my selling price, product + shipping costs, COD/cancellation/return rates and ad costs (or reasonable defaults I can edit): compute the complete unit economics:

1. Contribution margin per unit and per order

2. Gross and net profit per order

3. Break-even units per month (fixed costs + ads)

4. Break-even ROAS

5. Maximum CPA allowed per order

6. Maximum CPC at expected conversion rate

7. Maximum product / shipping cost possible

8. Required AOV to reach target net margin

Show formulas and exact numbers. Respond ONLY with JSON: { "summary", "keyPoints", "recommendations" }.`

  },

  contribution_margin_analyzer: stdSkill("contribution_margin_analyzer", "FINANCE", "Contribution Margin Analyzer", "Contribution margin per product"),

  net_profit_analyzer: stdSkill("net_profit_analyzer", "FINANCE", "Net Profit Analyzer", "Real net profit after all costs"),

  cash_flow_forecast: stdSkill("cash_flow_forecast", "FINANCE", "Cash Flow Forecast", "Forecast cash flow over time"),

  cash_conversion_cycle: stdSkill("cash_conversion_cycle", "FINANCE", "Cash Conversion Cycle", "Time from cash out to cash in"),

  break_even_calculator: stdSkill("break_even_calculator", "FINANCE", "Break-Even Calculator", "Sales needed to break even"),

  break_even_roas: stdSkill("break_even_roas", "FINANCE", "Break-Even ROAS", "The ROAS where you break even"),

  maximum_cpa_calculator: stdSkill("maximum_cpa_calculator", "FINANCE", "Maximum CPA Calculator", "Max CPA your margins allow"),

  maximum_cpc_calculator: stdSkill("maximum_cpc_calculator", "FINANCE", "Maximum CPC Calculator", "Max CPC at target conversion"),

  maximum_product_cost: stdSkill("maximum_product_cost", "FINANCE", "Maximum Product Cost", "Max product cost per price point"),

  maximum_shipping_cost: stdSkill("maximum_shipping_cost", "FINANCE", "Maximum Shipping Cost", "Max safe shipping cost"),

  maximum_acquisition_cost: stdSkill("maximum_acquisition_cost", "FINANCE", "Maximum Acquisition Cost", "Max customer acquisition cost"),

  profit_sensitivity_analysis: stdSkill("profit_sensitivity_analysis", "FINANCE", "Profit Sensitivity Analysis", "How each cost change hits profit"),

  margin_sensitivity_analysis: stdSkill("margin_sensitivity_analysis", "FINANCE", "Margin Sensitivity Analysis", "Margin sensitivity to price / cost"),

  price_vs_profit_simulator: stdSkill("price_vs_profit_simulator", "FINANCE", "Price vs Profit Simulator", "Price changes x profit"),

  volume_vs_profit_simulator: stdSkill("volume_vs_profit_simulator", "FINANCE", "Volume vs Profit Simulator", "Volume changes x profit"),

  discount_vs_profit_simulator: stdSkill("discount_vs_profit_simulator", "FINANCE", "Discount vs Profit Simulator", "Discounts effect on profit"),

  refund_impact_simulator: stdSkill("refund_impact_simulator", "FINANCE", "Refund Impact Simulator", "Refunds effect on profit"),

  return_cost_simulator: stdSkill("return_cost_simulator", "FINANCE", "Return Cost Simulator", "Returns cost per order"),

  cancellation_impact_simulator: stdSkill("cancellation_impact_simulator", "FINANCE", "Cancellation Impact Simulator", "Cancellations effect on profit"),

  cod_failure_cost_simulator: stdSkill("cod_failure_cost_simulator", "FINANCE", "COD Failure Cost Simulator", "COD refusals cost per order"),

  scale_profit_simulator: stdSkill("scale_profit_simulator", "FINANCE", "Scale Profit Simulator", "Profit at scaled daily budgets"),

  cash_flow_risk_detector: stdSkill("cash_flow_risk_detector", "FINANCE", "Cash Flow Risk Detector", "Detect cash flow risks"),

  working_capital_calculator: stdSkill("working_capital_calculator", "FINANCE", "Working Capital Calculator", "Working capital needed to scale"),

  capital_requirement_forecast: stdSkill("capital_requirement_forecast", "FINANCE", "Capital Requirement Forecast", "Capital needed for growth"),

  profit_reality_engine: {

    category: "FINANCE", label: "Profit Reality Engine", icon: "Wallet",

    desc: "True bottom-line profit after every single cost",

    requiredInputs: [], outputSchema: SchemaStandardInsight,

    buildPrompt: (ctx) => `Act as a profit forensics accountant for an online seller.

Using the product cost, price and any upstream data I connect (orders, ads, shipping, COD), compute TRUE net profit per order and per 100 orders:



Build the cost stack: product cost + freight/shipping + customs + payment gateway fees + ads + COD confirmation losses + cancellations + failed deliveries + returns + refunds + salaries + app subscriptions + taxes + warehouse/fulfillment.



Then report:

1. TRUE cost per order and net profit per order (not the naive selling price - product cost)

2. Actual net margin %

3. The 3-5 biggest profit killers and their dollar impact per 100 orders

4. What to fix FIRST to restore margin

5. Honest verdict: is this business actually profitable?

Respond ONLY with JSON: { "summary", "keyPoints": [...], "recommendations": [...] }`

  },



  // --- 🛒 Store & CRO Intelligence ---

  store_intelligence: stdSkill("store_intelligence", "STORE_CRO", "Store Intelligence", "Complete store analysis"),

  store_auditor: stdSkill("store_auditor", "STORE_CRO", "Store Auditor", "Full store audit"),

  store_health_score: stdSkill("store_health_score", "STORE_CRO", "Store Health Score", "Overall store health score"),

  homepage_analyzer: stdSkill("homepage_analyzer", "STORE_CRO", "Homepage Analyzer", "Audit the homepage"),

  product_page_analyzer: stdSkill("product_page_analyzer", "STORE_CRO", "Product Page Analyzer", "Audit the product page"),

  landing_page_analyzer: stdSkill("landing_page_analyzer", "STORE_CRO", "Landing Page Analyzer", "Audit a landing page"),

  checkout_analyzer: stdSkill("checkout_analyzer", "STORE_CRO", "Checkout Analyzer", "Audit the checkout flow"),

  mobile_ux_analyzer: stdSkill("mobile_ux_analyzer", "STORE_CRO", "Mobile UX Analyzer", "Mobile experience audit"),

  desktop_ux_analyzer: stdSkill("desktop_ux_analyzer", "STORE_CRO", "Desktop UX Analyzer", "Desktop experience audit"),

  page_speed_analyzer: stdSkill("page_speed_analyzer", "STORE_CRO", "Page Speed Analyzer", "Speed and performance audit"),

  trust_score_analyzer: stdSkill("trust_score_analyzer", "STORE_CRO", "Trust Score Analyzer", "How trustworthy the store looks"),

  social_proof_analyzer: stdSkill("social_proof_analyzer", "STORE_CRO", "Social Proof Analyzer", "Strength of social proof"),

  product_page_conversion_score: stdSkill("product_page_conversion_score", "STORE_CRO", "Product Page Conversion Score", "Score product page conversion"),

  cta_analyzer: stdSkill("cta_analyzer", "STORE_CRO", "CTA Analyzer", "Audit call-to-action clarity"),

  navigation_analyzer: stdSkill("navigation_analyzer", "STORE_CRO", "Navigation Analyzer", "Audit store navigation"),

  offer_visibility_analyzer: stdSkill("offer_visibility_analyzer", "STORE_CRO", "Offer Visibility Analyzer", "How visible the offer is"),

  above_the_fold_analyzer: stdSkill("above_the_fold_analyzer", "STORE_CRO", "Above-the-Fold Analyzer", "Audit above-the-fold content"),

  trust_badge_analyzer: stdSkill("trust_badge_analyzer", "STORE_CRO", "Trust Badge Analyzer", "Audit trust badges used"),

  faq_analyzer: stdSkill("faq_analyzer", "STORE_CRO", "FAQ Analyzer", "Audit the FAQ section"),

  guarantee_analyzer: stdSkill("guarantee_analyzer", "STORE_CRO", "Guarantee Analyzer", "Audit guarantees offered"),

  shipping_message_analyzer: stdSkill("shipping_message_analyzer", "STORE_CRO", "Shipping Message Analyzer", "Audit shipping / COD messaging"),

  urgency_analyzer: stdSkill("urgency_analyzer", "STORE_CRO", "Urgency Analyzer", "Audit urgency signals"),

  scarcity_analyzer: stdSkill("scarcity_analyzer", "STORE_CRO", "Scarcity Analyzer", "Audit scarcity signals"),



  // --- 📈 Conversion Rate Optimization ---

  cro_auditor: stdSkill("cro_auditor", "CRO", "CRO Auditor", "Full conversion audit"),

  conversion_bottleneck_detector: stdSkill("conversion_bottleneck_detector", "CRO", "Conversion Bottleneck Detector", "Find where buyers drop off"),

  conversion_opportunity_finder: stdSkill("conversion_opportunity_finder", "CRO", "Conversion Opportunity Finder", "Find quick conversion wins"),

  landing_page_heatmap_analyzer: stdSkill("landing_page_heatmap_analyzer", "CRO", "Landing Page Heatmap Analyzer", "Predict heatmap behavior from design"),

  click_path_analyzer: stdSkill("click_path_analyzer", "CRO", "Click Path Analyzer", "Analyze user click paths"),

  session_behavior_analyzer: stdSkill("session_behavior_analyzer", "CRO", "Session Behavior Analyzer", "Analyze session behaviors"),

  checkout_friction_detector: stdSkill("checkout_friction_detector", "CRO", "Checkout Friction Detector", "Find checkout friction points"),

  form_friction_analyzer: stdSkill("form_friction_analyzer", "CRO", "Form Friction Analyzer", "Find form friction"),

  cta_optimization: stdSkill("cta_optimization", "CRO", "CTA Optimization", "Optimize CTAs"),

  headline_optimization: stdSkill("headline_optimization", "CRO", "Headline Optimization", "Optimize headlines"),

  product_description_optimization: stdSkill("product_description_optimization", "CRO", "Product Description Optimization", "Rewrite product descriptions"),

  image_sequence_optimizer: stdSkill("image_sequence_optimizer", "CRO", "Image Sequence Optimizer", "Optimize image order"),

  social_proof_optimizer: stdSkill("social_proof_optimizer", "CRO", "Social Proof Optimizer", "Optimize social proof placement"),

  trust_optimization: stdSkill("trust_optimization", "CRO", "Trust Optimization", "Optimize trust signals"),

  offer_placement_optimizer: stdSkill("offer_placement_optimizer", "CRO", "Offer Placement Optimizer", "Place offers for maximum conversion"),

  mobile_conversion_optimizer: stdSkill("mobile_conversion_optimizer", "CRO", "Mobile Conversion Optimizer", "Optimize mobile conversion"),

  page_section_optimizer: stdSkill("page_section_optimizer", "CRO", "Page Section Optimizer", "Optimize page section order"),

  exit_intent_strategy: stdSkill("exit_intent_strategy", "CRO", "Exit Intent Strategy", "Strategy to stop exits"),

  conversion_experiment_generator: stdSkill("conversion_experiment_generator", "CRO", "Conversion Experiment Generator", "Generate conversion experiments"),

  cro_ab_test_generator: stdSkill("cro_ab_test_generator", "CRO", "CRO A/B Test Generator", "Generate CRO A/B tests"),



  // --- ✍️ Copywriting & Psychology Formulas ---

  aida_framework: {

    category: "CRO", label: "AIDA Framework", icon: "PenLine",

    desc: "Apply the AIDA copy formula (Attention → Interest → Desire → Action)",

    requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight,

    buildPrompt: (ctx) => {

      const p = (ctx.productName || "").trim();

      return `Act as a direct-response copywriting expert. Apply the AIDA formula (Attention → Interest → Desire → Action) to${p ? ` ${p}` : " my product"} for a small online seller (dropshipping / COD / e-commerce).

First explain the AIDA analysis for this product (who the product is for, the single big promise, and the buying resistance).

Then write COMPLETE copy using AIDA:

1. ATTENTION: 5 headlines + 5 hooks (curiosity gap, specificity, numbers, benefit-led, fear-of-missing-out)

2. INTEREST: product story, mechanism, and proof that builds belief

3. DESIRE: benefits stack, results, social proof, value anchoring, risk reversal

4. ACTION: 3 strong CTAs with urgency and scarcity

Also give the AIDA product-page section (above the fold → body → CTA) and an AIDA short video/static ad version.

Be concrete: use real numbers, specific words, and no fluff.

Respond ONLY with JSON: { "summary", "keyPoints", "recommendations" }.`;

    }

  },

  pas_framework: {

    category: "CRO", label: "PAS Framework", icon: "Feather",

    desc: "Apply the PAS copy formula (Problem → Agitate → Solution)",

    requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight,

    buildPrompt: (ctx) => {

      const p = (ctx.productName || "").trim();

      return `Act as a direct-response copywriting expert. Apply the PAS formula (Problem → Agitate → Solution) to${p ? ` ${p}` : " my product"} for a small online seller (dropshipping / COD / e-commerce).

1. PROBLEM: name the exact pain point in the customer's own words

2. AGITATE: make the pain real — the cost, embarrassment, time loss, or risk of doing nothing (but stay honest and not over-the-top)

3. SOLUTION: position the product as the fix, with the mechanism, proof, and guarantee

Write COMPLETE copy:

- PAS product page copy (headline, problem block, agitation block, solution block, CTA)

- PAS ad caption (Facebook / TikTok) version

- PAS email short version

- PAS video script (3-second hook + 30-second structure)

Be concrete: use real numbers, specific words, and no fluff.

Respond ONLY with JSON: { "summary", "keyPoints", "recommendations" }.`;

    }

  },

  hook_story_offer: {

    category: "CRO", label: "Hook → Story → Offer", icon: "Play",

    desc: "Structure ads and creatives with the Hook-Story-Offer framework",

    requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight,

    buildPrompt: (ctx) => {

      const p = (ctx.productName || "").trim();

      return `Act as a top performance-marketing creative strategist. Build a HIGH-CONVERTING Hook → Story → Offer ad for${p ? ` ${p}` : " my product"} for a small online seller (dropshipping / COD / e-commerce).

HOOK (0-3 seconds): 5 different hooks that stop the scroll (pattern interrupt, bold claim, curiosity gap, relatable pain, before/after promise).

STORY: one strong narrative — a relatable character, the problem, the discovery, the transformation, with visuals described per scene.

OFFER: price anchoring, bonus stack, guarantee, urgency, and the CTA.

Deliver:

- A complete 30-45s video script (scene-by-scene with on-screen text)

- A static ad concept (image + headline + primary text)

- 3 hook variations to A/B test

- A TikTok/Reels version and a Facebook feed version

Be concrete and realistic for a small online seller budget.

Respond ONLY with JSON: { "summary", "keyPoints", "recommendations" }.`;

    }

  },

  headline_copy_psychology: {

    category: "CRO", label: "Headline Copy Psychology", icon: "Type",

    desc: "Generate psychologically-grounded headlines for product, ads and emails",

    requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight,

    buildPrompt: (ctx) => {

      const p = (ctx.productName || "").trim();

      return `Act as a copywriting psychology expert. Generate PSYCHOLOGICALLY-GROUNDED headlines for${p ? ` ${p}` : " my product"} for a small online seller (dropshipping / COD / e-commerce).

Explain the psychology behind each one (curiosity gap, loss aversion, social proof, specificity effect, self-image, status, fear of missing out, benefit framing, objection reversal, pattern interrupt).

Deliver 20 headlines across these types (2 each): curiosity gap, specificity + numbers, benefit-led, loss aversion, social proof, before/after, question, command, objection-crushing, feature-framed-as-benefit.

For each headline give: 1) the exact headline 2) which psychology it uses 3) why it works for this buyer.

Then adapt the TOP 5: product page H1, Facebook ad headline, Google ad, email subject, TikTok on-screen text.

Respond ONLY with JSON: { "summary", "keyPoints", "recommendations" }.`;

    }

  },

  facebook_ads_psychology_strategy: {

    category: "CRO", label: "Facebook Ads Psychology Strategy", icon: "Brain",

    desc: "Full Facebook/Instagram ads strategy built on buyer psychology",

    requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight,

    buildPrompt: (ctx) => {

      const p = (ctx.productName || "").trim();

      return `Act as a top Facebook ads buyer and marketing psychologist. Build a FULL Facebook/Instagram ads strategy for${p ? ` ${p}` : " my product"} for a small online seller (dropshipping / COD / e-commerce), built on buyer psychology:

1. BUYER PSYCHOLOGY: the pains, desires, fears, and identity of the buyer + the emotional triggers that drive the click and the purchase

2. HOOK PSYCHOLOGY: 5 scroll-stopping hook angles

3. ANGLE LIBRARY: 7 complete copy angles (problem-solution, before/after, social proof, curiosity, authority, scarcity, identity) — each with headline + ad copy + creative idea

4. FUNNEL-STAGE PSYCHOLOGY: cold (attention + curiosity), warm (desire + proof), hot (offer + urgency, retargeting), each with its own message and creative

5. TRUST & RISK REVERSAL: proof, guarantees, COD messaging psychology

6. STRUCTURE: suggested ad set / audience structure (broad, interest, retargeting) and budget split for a small budget

7. CREATIVE: Hook → Story → Offer script template for video + static concepts

Be concrete, realistic, and specific to this product.

Respond ONLY with JSON: { "summary", "keyPoints", "recommendations" }.`;

    }

  },



  // --- 🔬 Experimentation Intelligence ---

  experiment_engine: stdSkill("experiment_engine", "EXPERIMENT", "Experiment Engine", "Plan a full experimentation program"),

  experiment_planner: stdSkill("experiment_planner", "EXPERIMENT", "Experiment Planner", "Plan experiments in detail"),

  ab_test_generator: stdSkill("ab_test_generator", "EXPERIMENT", "A/B Test Generator", "Generate A/B tests"),

  test_hypothesis_generator: stdSkill("test_hypothesis_generator", "EXPERIMENT", "Test Hypothesis Generator", "Generate test hypotheses"),

  experiment_priority_score: stdSkill("experiment_priority_score", "EXPERIMENT", "Experiment Priority Score", "Prioritize which tests to run"),

  sample_size_calculator: stdSkill("sample_size_calculator", "EXPERIMENT", "Sample Size Calculator", "Find needed sample size"),

  statistical_significance_analyzer: stdSkill("statistical_significance_analyzer", "EXPERIMENT", "Statistical Significance Analyzer", "Judge test significance"),

  test_duration_calculator: stdSkill("test_duration_calculator", "EXPERIMENT", "Test Duration Calculator", "How long a test must run"),

  winner_confidence_score: stdSkill("winner_confidence_score", "EXPERIMENT", "Winner Confidence Score", "Confidence a winner is real"),

  experiment_learning_extractor: stdSkill("experiment_learning_extractor", "EXPERIMENT", "Experiment Learning Extractor", "Extract lessons from tests"),

  experiment_archive: stdSkill("experiment_archive", "EXPERIMENT", "Experiment Archive", "Organize past experiments"),

  failed_test_analyzer: stdSkill("failed_test_analyzer", "EXPERIMENT", "Failed Test Analyzer", "Learn from failed tests"),

  test_iteration_generator: stdSkill("test_iteration_generator", "EXPERIMENT", "Test Iteration Generator", "Iterate on losing tests"),

  multi_variable_test_planner: stdSkill("multi_variable_test_planner", "EXPERIMENT", "Multi-Variable Test Planner", "Plan MVT tests"),

  creative_testing_matrix: stdSkill("creative_testing_matrix", "EXPERIMENT", "Creative Testing Matrix", "Matrix of creative tests"),

  offer_testing_matrix: stdSkill("offer_testing_matrix", "EXPERIMENT", "Offer Testing Matrix", "Matrix of offer tests"),

  price_testing_matrix: stdSkill("price_testing_matrix", "EXPERIMENT", "Price Testing Matrix", "Matrix of price tests"),

  landing_page_testing_matrix: stdSkill("landing_page_testing_matrix", "EXPERIMENT", "Landing Page Testing Matrix", "Matrix of landing page tests"),

  audience_testing_matrix: stdSkill("audience_testing_matrix", "EXPERIMENT", "Audience Testing Matrix", "Matrix of audience tests"),



  // --- 👤 Customer Intelligence 2.0 ---

  customer_segmentation: stdSkill("customer_segmentation", "CUSTOMER_2", "Customer Segmentation", "Segment customers by behavior"),

  rfm_analyzer: stdSkill("rfm_analyzer", "CUSTOMER_2", "RFM Analyzer", "Recency-freq-money analysis"),

  customer_lifetime_value: stdSkill("customer_lifetime_value", "CUSTOMER_2", "Customer Lifetime Value", "Compute customer LTV"),

  clv_predictor: stdSkill("clv_predictor", "CUSTOMER_2", "CLV Predictor", "Predict future customer value"),

  customer_acquisition_cohort: stdSkill("customer_acquisition_cohort", "CUSTOMER_2", "Customer Acquisition Cohort", "Analyze cohorts by acquisition"),

  repeat_purchase_predictor: stdSkill("repeat_purchase_predictor", "CUSTOMER_2", "Repeat Purchase Predictor", "Who will buy again"),

  next_purchase_predictor: stdSkill("next_purchase_predictor", "CUSTOMER_2", "Next Purchase Predictor", "When the next purchase comes"),

  cross_sell_predictor: stdSkill("cross_sell_predictor", "CUSTOMER_2", "Cross-Sell Predictor", "What else a customer buys"),

  upsell_predictor: stdSkill("upsell_predictor", "CUSTOMER_2", "Upsell Predictor", "Which upsell fits a customer"),

  customer_value_score: stdSkill("customer_value_score", "CUSTOMER_2", "Customer Value Score", "Score each customer's value"),

  customer_profitability: stdSkill("customer_profitability", "CUSTOMER_2", "Customer Profitability", "Profit per customer"),

  customer_persona_evolution: stdSkill("customer_persona_evolution", "CUSTOMER_2", "Customer Persona Evolution", "How personas change over time"),

  customer_journey_mapper: stdSkill("customer_journey_mapper", "CUSTOMER_2", "Customer Journey Mapper", "Map the full customer journey"),

  customer_journey_friction: stdSkill("customer_journey_friction", "CUSTOMER_2", "Customer Journey Friction", "Find journey friction points"),

  customer_journey_opportunity: stdSkill("customer_journey_opportunity", "CUSTOMER_2", "Customer Journey Opportunity", "Find journey opportunities"),

  purchase_frequency_analyzer: stdSkill("purchase_frequency_analyzer", "CUSTOMER_2", "Purchase Frequency Analyzer", "Analyze purchase frequency"),

  basket_analysis: stdSkill("basket_analysis", "CUSTOMER_2", "Basket Analysis", "Analyze the shopping basket"),

  product_affinity_analyzer: stdSkill("product_affinity_analyzer", "CUSTOMER_2", "Product Affinity Analyzer", "Which products are bought together"),

  customer_cohort_analyzer: stdSkill("customer_cohort_analyzer", "CUSTOMER_2", "Customer Cohort Analyzer", "Cohort retention over time"),

  customer_reactivation_engine: stdSkill("customer_reactivation_engine", "CUSTOMER_2", "Customer Reactivation Engine", "Bring back inactive customers"),



  // --- 🔄 Retention & CRM ---

  retention_strategy: stdSkill("retention_strategy", "RETENTION", "Retention Strategy", "Full retention strategy"),

  retention_score: stdSkill("retention_score", "RETENTION", "Retention Score", "Score customer retention health"),

  churn_prediction: stdSkill("churn_prediction", "RETENTION", "Churn Prediction", "Predict which customers churn"),

  churn_prevention: stdSkill("churn_prevention", "RETENTION", "Churn Prevention", "Prevent churn with actions"),

  win_back_campaign_generator: stdSkill("win_back_campaign_generator", "RETENTION", "Win-Back Campaign Generator", "Generate win-back campaigns"),

  reactivation_campaign_generator: stdSkill("reactivation_campaign_generator", "RETENTION", "Reactivation Campaign Generator", "Reactivation campaigns"),

  post_purchase_flow_generator: stdSkill("post_purchase_flow_generator", "RETENTION", "Post-Purchase Flow Generator", "Post-purchase email / SMS flows"),

  welcome_flow_generator: stdSkill("welcome_flow_generator", "RETENTION", "Welcome Flow Generator", "Welcome email / SMS flow"),

  abandoned_cart_flow: stdSkill("abandoned_cart_flow", "RETENTION", "Abandoned Cart Flow", "Abandoned cart recovery flow"),

  abandoned_checkout_flow: stdSkill("abandoned_checkout_flow", "RETENTION", "Abandoned Checkout Flow", "Abandoned checkout recovery flow"),

  upsell_flow: stdSkill("upsell_flow", "RETENTION", "Upsell Flow", "Post-purchase upsell flow"),

  cross_sell_flow: stdSkill("cross_sell_flow", "RETENTION", "Cross-Sell Flow", "Cross-sell flow"),

  review_request_flow: stdSkill("review_request_flow", "RETENTION", "Review Request Flow", "Review request email / SMS"),

  referral_flow: stdSkill("referral_flow", "RETENTION", "Referral Flow", "Referral program flow"),

  vip_customer_flow: stdSkill("vip_customer_flow", "RETENTION", "VIP Customer Flow", "VIP customer program"),

  loyalty_strategy: stdSkill("loyalty_strategy", "RETENTION", "Loyalty Strategy", "Loyalty program strategy"),

  subscription_strategy: stdSkill("subscription_strategy", "RETENTION", "Subscription Strategy", "Subscription design strategy"),

  customer_lifecycle_automation: stdSkill("customer_lifecycle_automation", "RETENTION", "Customer Lifecycle Automation", "Automate the whole lifecycle"),



  // --- 📱 Organic Growth Intelligence ---

  tiktok_trend_detector: stdSkill("tiktok_trend_detector", "ORGANIC", "TikTok Trend Detector", "Hot TikTok trends"),

  tiktok_product_detector: stdSkill("tiktok_product_detector", "ORGANIC", "TikTok Product Detector", "Products trending on TikTok"),

  tiktok_creative_analyzer: stdSkill("tiktok_creative_analyzer", "ORGANIC", "TikTok Creative Analyzer", "Analyze TikTok creatives"),

  tiktok_hook_analyzer: stdSkill("tiktok_hook_analyzer", "ORGANIC", "TikTok Hook Analyzer", "Analyze TikTok hooks"),

  tiktok_comment_mining: stdSkill("tiktok_comment_mining", "ORGANIC", "TikTok Comment Mining", "Mine TikTok comments for insights"),

  tiktok_viral_prediction: stdSkill("tiktok_viral_prediction", "ORGANIC", "TikTok Viral Prediction", "Predict which content goes viral"),

  tiktok_creator_finder: stdSkill("tiktok_creator_finder", "ORGANIC", "TikTok Creator Finder", "Find TikTok creators"),

  tiktok_creator_product_match: stdSkill("tiktok_creator_product_match", "ORGANIC", "TikTok Creator/Product Match", "Match creators to products"),

  tiktok_content_strategy: stdSkill("tiktok_content_strategy", "ORGANIC", "TikTok Content Strategy", "TikTok content strategy"),

  tiktok_content_calendar: stdSkill("tiktok_content_calendar", "ORGANIC", "TikTok Content Calendar", "TikTok posting calendar"),

  instagram_trend_detector: stdSkill("instagram_trend_detector", "ORGANIC", "Instagram Trend Detector", "Trends on Instagram"),

  reels_analyzer: stdSkill("reels_analyzer", "ORGANIC", "Reels Analyzer", "Analyze Reels performance / patterns"),

  reels_hook_analyzer: stdSkill("reels_hook_analyzer", "ORGANIC", "Reels Hook Analyzer", "Analyze Reels hooks"),

  creator_intelligence: stdSkill("creator_intelligence", "ORGANIC", "Creator Intelligence", "Creator research and vetting"),

  youtube_product_trend_detector: stdSkill("youtube_product_trend_detector", "ORGANIC", "YouTube Product Trend Detector", "Product demand signals on YouTube"),

  youtube_competitor_analyzer: stdSkill("youtube_competitor_analyzer", "ORGANIC", "YouTube Competitor Analyzer", "Analyze competitor YouTube presence"),

  youtube_shopping_intelligence: stdSkill("youtube_shopping_intelligence", "ORGANIC", "YouTube Shopping Intelligence", "YouTube Shopping insights"),

  youtube_creator_finder: stdSkill("youtube_creator_finder", "ORGANIC", "YouTube Creator Finder", "Find YouTube creators"),



  // --- 🎯 Influencer Intelligence ---

  influencer_finder: stdSkill("influencer_finder", "INFLUENCER", "Influencer Finder", "Find relevant influencers"),

  micro_influencer_finder: stdSkill("micro_influencer_finder", "INFLUENCER", "Micro Influencer Finder", "Find micro influencers"),

  nano_influencer_finder: stdSkill("nano_influencer_finder", "INFLUENCER", "Nano Influencer Finder", "Find nano influencers"),

  influencer_audience_analyzer: stdSkill("influencer_audience_analyzer", "INFLUENCER", "Influencer Audience Analyzer", "Analyze an influencer's audience"),

  influencer_authenticity_score: stdSkill("influencer_authenticity_score", "INFLUENCER", "Influencer Authenticity Score", "Score how authentic an influencer is"),

  fake_engagement_detector: stdSkill("fake_engagement_detector", "INFLUENCER", "Fake Engagement Detector", "Detect fake followers / engagement"),

  influencer_pricing_estimator: stdSkill("influencer_pricing_estimator", "INFLUENCER", "Influencer Pricing Estimator", "Estimate influencer rates"),

  influencer_roi_predictor: stdSkill("influencer_roi_predictor", "INFLUENCER", "Influencer ROI Predictor", "Predict influencer ROI"),

  influencer_product_matcher: stdSkill("influencer_product_matcher", "INFLUENCER", "Influencer/Product Matcher", "Match influencers to products"),

  influencer_outreach_generator: stdSkill("influencer_outreach_generator", "INFLUENCER", "Influencer Outreach Generator", "Outreach messages to creators"),

  influencer_campaign_planner: stdSkill("influencer_campaign_planner", "INFLUENCER", "Influencer Campaign Planner", "Plan influencer campaigns"),

  influencer_campaign_analyzer: stdSkill("influencer_campaign_analyzer", "INFLUENCER", "Influencer Campaign Analyzer", "Analyze campaign results"),

  creator_whitelist_strategy: stdSkill("creator_whitelist_strategy", "INFLUENCER", "Creator Whitelist Strategy", "Whitelist creators for ads"),



  // --- 🧲 SEO Intelligence ---

  keyword_discovery: stdSkill("keyword_discovery", "SEO", "Keyword Discovery", "Discover search keywords"),

  keyword_intent_analyzer: stdSkill("keyword_intent_analyzer", "SEO", "Keyword Intent Analyzer", "Classify keyword intent"),

  keyword_difficulty_analyzer: stdSkill("keyword_difficulty_analyzer", "SEO", "Keyword Difficulty Analyzer", "Score keyword difficulty"),

  keyword_opportunity_score: stdSkill("keyword_opportunity_score", "SEO", "Keyword Opportunity Score", "Score keyword opportunity"),

  long_tail_finder: stdSkill("long_tail_finder", "SEO", "Long-Tail Finder", "Find long-tail keywords"),

  commercial_keyword_finder: stdSkill("commercial_keyword_finder", "SEO", "Commercial Keyword Finder", "Find commercial keywords"),

  buyer_keyword_finder: stdSkill("buyer_keyword_finder", "SEO", "Buyer Keyword Finder", "Find buying-intent keywords"),

  competitor_keyword_gap: stdSkill("competitor_keyword_gap", "SEO", "Competitor Keyword Gap", "Keywords competitors rank for"),

  content_gap_finder: stdSkill("content_gap_finder", "SEO", "Content Gap Finder", "Content competitors miss"),

  serp_analyzer: stdSkill("serp_analyzer", "SEO", "SERP Analyzer", "Analyze search result pages"),

  serp_intent_analyzer: stdSkill("serp_intent_analyzer", "SEO", "SERP Intent Analyzer", "Understand what a SERP wants"),

  topical_authority_planner: stdSkill("topical_authority_planner", "SEO", "Topical Authority Planner", "Plan topical authority"),

  content_cluster_generator: stdSkill("content_cluster_generator", "SEO", "Content Cluster Generator", "Build content clusters"),

  programmatic_seo_planner: stdSkill("programmatic_seo_planner", "SEO", "Programmatic SEO Planner", "Plan programmatic pages"),

  product_seo_optimizer: stdSkill("product_seo_optimizer", "SEO", "Product SEO Optimizer", "Optimize product pages for SEO"),

  collection_seo_optimizer: stdSkill("collection_seo_optimizer", "SEO", "Collection SEO Optimizer", "Optimize collection pages"),

  internal_linking_optimizer: stdSkill("internal_linking_optimizer", "SEO", "Internal Linking Optimizer", "Improve internal links"),

  seo_content_brief: stdSkill("seo_content_brief", "SEO", "SEO Content Brief", "Write SEO content briefs"),

  seo_content_generator: stdSkill("seo_content_generator", "SEO", "SEO Content Generator", "Generate SEO content"),

  seo_rank_opportunity: stdSkill("seo_rank_opportunity", "SEO", "SEO Rank Opportunity", "Where you can rank fastest"),

  google_shopping_seo: stdSkill("google_shopping_seo", "SEO", "Google Shopping SEO", "Optimize Google Shopping feeds"),



  // --- 🏪 Marketplace Intelligence ---

  amazon_product_intelligence: stdSkill("amazon_product_intelligence", "MARKETPLACE", "Amazon Product Intelligence", "Amazon product research"),

  amazon_bsr_analyzer: stdSkill("amazon_bsr_analyzer", "MARKETPLACE", "Amazon BSR Analyzer", "Best-seller rank analysis"),

  amazon_review_intelligence: stdSkill("amazon_review_intelligence", "MARKETPLACE", "Amazon Review Intelligence", "Mine Amazon reviews"),

  amazon_keyword_intelligence: stdSkill("amazon_keyword_intelligence", "MARKETPLACE", "Amazon Keyword Intelligence", "Amazon search keywords"),

  amazon_competitor_analyzer: stdSkill("amazon_competitor_analyzer", "MARKETPLACE", "Amazon Competitor Analyzer", "Analyze Amazon competitors"),

  amazon_listing_analyzer: stdSkill("amazon_listing_analyzer", "MARKETPLACE", "Amazon Listing Analyzer", "Audit Amazon listings"),

  amazon_opportunity_finder: stdSkill("amazon_opportunity_finder", "MARKETPLACE", "Amazon Opportunity Finder", "Find Amazon opportunities"),

  marketplace_product_finder: stdSkill("marketplace_product_finder", "MARKETPLACE", "Marketplace Product Finder", "Find winning marketplace products"),

  marketplace_demand_analyzer: stdSkill("marketplace_demand_analyzer", "MARKETPLACE", "Marketplace Demand Analyzer", "Marketplace demand analysis"),

  marketplace_competition_analyzer: stdSkill("marketplace_competition_analyzer", "MARKETPLACE", "Marketplace Competition Analyzer", "Marketplace competition analysis"),

  marketplace_price_analyzer: stdSkill("marketplace_price_analyzer", "MARKETPLACE", "Marketplace Price Analyzer", "Marketplace price analysis"),

  marketplace_seller_analyzer: stdSkill("marketplace_seller_analyzer", "MARKETPLACE", "Marketplace Seller Analyzer", "Analyze marketplace sellers"),

  marketplace_ranking_analyzer: stdSkill("marketplace_ranking_analyzer", "MARKETPLACE", "Marketplace Ranking Analyzer", "Analyze marketplace rankings"),

  marketplace_expansion_score: stdSkill("marketplace_expansion_score", "MARKETPLACE", "Marketplace Expansion Score", "Score marketplace expansion"),



  // --- 🧪 Product Testing Intelligence ---

  product_test_planner: {

    category: "PRODUCT_TESTING", label: "Product Test Planner", icon: "ListChecks",

    desc: "Full test system: budget, duration, audience, creatives, KPIs, kill/scale rules",

    requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight,

    buildPrompt: (ctx) => {

      const p = (ctx.productName || "").trim();

      return `Act as a product-testing engineer. Build a complete, realistic test plan for${p ? `: ${p}` : " the products in my project"}:

1. Test budget (daily + total) and duration

2. Audience & targeting (broad vs interest) with budget split

3. Number of creatives, hooks and angles to test

4. Offers, price and landing page to use

5. KPIs to track (CTR, CPC, ATC, ICOS, CPA, ROAS)

6. KILL criteria (exact numbers + when to pause)

7. SCALE criteria (exact numbers + when/how to scale)

8. RETEST criteria (when to re-test a borderline product)

9. Decision rule: Test → Analyze → Kill / Iterate / Scale

Respond ONLY with JSON: { "summary", "keyPoints", "recommendations" }.`;

    }

  },



  // --- 🚀 Scaling Intelligence ---

  scale_decision_engine: stdSkill("scale_decision_engine", "SCALING", "Scale Decision Engine", "Decide if / how to scale"),

  vertical_scaling_simulator: stdSkill("vertical_scaling_simulator", "SCALING", "Vertical Scaling Simulator", "Scale winners up in budget"),

  horizontal_scaling_simulator: stdSkill("horizontal_scaling_simulator", "SCALING", "Horizontal Scaling Simulator", "Scale across new interests / audiences"),

  creative_scaling: stdSkill("creative_scaling", "SCALING", "Creative Scaling", "Scale winning creatives"),

  audience_scaling: stdSkill("audience_scaling", "SCALING", "Audience Scaling", "Expand proven audiences"),

  geographic_scaling: stdSkill("geographic_scaling", "SCALING", "Geographic Scaling", "Scale into new geos"),

  country_expansion_scaling: stdSkill("country_expansion_scaling", "SCALING", "Country Expansion Scaling", "Scale to new countries"),

  budget_scaling_risk: stdSkill("budget_scaling_risk", "SCALING", "Budget Scaling Risk", "Risk of raising budgets"),

  creative_fatigue_forecast: stdSkill("creative_fatigue_forecast", "SCALING", "Creative Fatigue Forecast", "Forecast creative fatigue"),

  cpa_inflation_forecast: stdSkill("cpa_inflation_forecast", "SCALING", "CPA Inflation Forecast", "Forecast CPA inflation at scale"),

  roas_decay_forecast: stdSkill("roas_decay_forecast", "SCALING", "ROAS Decay Forecast", "Forecast ROAS decay"),

  scaling_ceiling_detector: stdSkill("scaling_ceiling_detector", "SCALING", "Scaling Ceiling Detector", "Detect the scaling ceiling"),

  profit_max_scaling: stdSkill("profit_max_scaling", "SCALING", "Profit-Max Scaling", "Scale for max profit"),

  revenue_max_scaling: stdSkill("revenue_max_scaling", "SCALING", "Revenue-Max Scaling", "Scale for max revenue"),

  cashflow_constrained_scaling: stdSkill("cashflow_constrained_scaling", "SCALING", "Cashflow-Constrained Scaling", "Scale within cash flow limits"),



  // --- 🧩 Product Ecosystem 2.0 ---

  product_ecosystem_expansion_engine: {

    category: "ECOSYSTEM_2", label: "Product Ecosystem Expansion Engine", icon: "Network",

    desc: "Expand one winning product into a full portfolio",

    requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight,

    buildPrompt: (ctx) => {

      const p = (ctx.productName || "").trim();

      return `Act as a product ecosystem strategist for${p ? ` ${p}` : " my product"}.

Build the full expansion map top to bottom:

Core product → accessories → consumables → bundles → upsells → cross-sells → subscriptions → replacement products → premium version → new customer segments → new countries.

Output ONE integrated product portfolio roadmap: for each level give the product idea, why customers buy it, estimated price and margin impact, and priority order.

Respond ONLY with JSON: { "summary", "keyPoints", "recommendations" }.`;

    }

  },



  // --- 🏷️ Branding Intelligence ---

  brandability_score: stdSkill("brandability_score", "BRANDING", "Brandability Score", "Score how brandable a product is"),

  brand_positioning_generator: stdSkill("brand_positioning_generator", "BRANDING", "Brand Positioning Generator", "Define brand positioning"),

  brand_name_generator: stdSkill("brand_name_generator", "BRANDING", "Brand Name Generator", "Generate brand names"),

  brand_identity_generator: stdSkill("brand_identity_generator", "BRANDING", "Brand Identity Generator", "Generate brand identity"),

  brand_story_generator: stdSkill("brand_story_generator", "BRANDING", "Brand Story Generator", "Write the brand story"),

  brand_voice_generator: stdSkill("brand_voice_generator", "BRANDING", "Brand Voice Generator", "Define the brand voice"),

  usp_generator: stdSkill("usp_generator", "BRANDING", "USP Generator", "Generate unique selling points"),

  unique_mechanism_generator: stdSkill("unique_mechanism_generator", "BRANDING", "Unique Mechanism Generator", "Invent a unique mechanism"),

  brand_differentiation_analyzer: stdSkill("brand_differentiation_analyzer", "BRANDING", "Brand Differentiation Analyzer", "Analyze brand differentiation"),

  brand_perception_analyzer: stdSkill("brand_perception_analyzer", "BRANDING", "Brand Perception Analyzer", "Analyze how the brand is seen"),

  brand_trust_analyzer: stdSkill("brand_trust_analyzer", "BRANDING", "Brand Trust Analyzer", "Analyze brand trust"),

  brand_architecture: stdSkill("brand_architecture", "BRANDING", "Brand Architecture", "Design brand architecture"),

  product_naming: stdSkill("product_naming", "BRANDING", "Product Naming", "Name products"),

  packaging_strategy: stdSkill("packaging_strategy", "BRANDING", "Packaging Strategy", "Packaging strategy"),

  packaging_copy: stdSkill("packaging_copy", "BRANDING", "Packaging Copy", "Write packaging copy"),

  premium_positioning: stdSkill("premium_positioning", "BRANDING", "Premium Positioning", "Position as premium"),

  commodity_to_brand_strategy: stdSkill("commodity_to_brand_strategy", "BRANDING", "Commodity-to-Brand Strategy", "Turn a commodity into a brand"),



  // --- 🌍 Localization Intelligence ---

  country_localization_analyzer: stdSkill("country_localization_analyzer", "LOCALIZATION", "Country Localization Analyzer", "What to localize per country"),

  cultural_sensitivity_analyzer: stdSkill("cultural_sensitivity_analyzer", "LOCALIZATION", "Cultural Sensitivity Analyzer", "Cultural do's and don'ts"),

  local_buying_behavior: stdSkill("local_buying_behavior", "LOCALIZATION", "Local Buying Behavior", "How locals buy"),

  local_competitor_messaging: stdSkill("local_competitor_messaging", "LOCALIZATION", "Local Competitor Messaging", "Local competitor messaging"),

  local_offer_generator: stdSkill("local_offer_generator", "LOCALIZATION", "Local Offer Generator", "Offers that fit the market"),

  local_price_psychology: stdSkill("local_price_psychology", "LOCALIZATION", "Local Price Psychology", "Pricing that fits locals"),

  local_creative_generator: stdSkill("local_creative_generator", "LOCALIZATION", "Local Creative Generator", "Localized creatives"),

  local_hook_generator: stdSkill("local_hook_generator", "LOCALIZATION", "Local Hook Generator", "Hooks locals respond to"),

  local_ugc_persona: stdSkill("local_ugc_persona", "LOCALIZATION", "Local UGC Persona", "UGC personas that fit the market"),

  local_landing_page: stdSkill("local_landing_page", "LOCALIZATION", "Local Landing Page", "Localized landing page"),

  local_product_naming: stdSkill("local_product_naming", "LOCALIZATION", "Local Product Naming", "Local product names"),

  local_payment_messaging: stdSkill("local_payment_messaging", "LOCALIZATION", "Local Payment Messaging", "Payment messaging locals trust"),

  local_shipping_messaging: stdSkill("local_shipping_messaging", "LOCALIZATION", "Local Shipping Messaging", "Shipping messaging for locals"),

  local_trust_messaging: stdSkill("local_trust_messaging", "LOCALIZATION", "Local Trust Messaging", "Trust signals for locals"),

  local_objection_mining: stdSkill("local_objection_mining", "LOCALIZATION", "Local Objection Mining", "Mine local buyer objections"),



  // --- 🛡️ Fraud & Risk Intelligence ---

  fraud_risk_score: stdSkill("fraud_risk_score", "FRAUD_RISK", "Fraud Risk Score", "Score fraud risk of an order"),

  order_fraud_detector: stdSkill("order_fraud_detector", "FRAUD_RISK", "Order Fraud Detector", "Detect fraudulent orders"),

  customer_fraud_pattern: stdSkill("customer_fraud_pattern", "FRAUD_RISK", "Customer Fraud Pattern", "Fraud behavior patterns"),

  duplicate_customer_detector: stdSkill("duplicate_customer_detector", "FRAUD_RISK", "Duplicate Customer Detector", "Detect duplicate customers"),

  suspicious_address_detector: stdSkill("suspicious_address_detector", "FRAUD_RISK", "Suspicious Address Detector", "Flag suspicious addresses"),

  suspicious_phone_pattern: stdSkill("suspicious_phone_pattern", "FRAUD_RISK", "Suspicious Phone Pattern", "Flag suspicious phone numbers"),

  cod_fraud_predictor: stdSkill("cod_fraud_predictor", "FRAUD_RISK", "COD Fraud Predictor", "Predict COD fraud"),

  fake_order_cluster_detector: stdSkill("fake_order_cluster_detector", "FRAUD_RISK", "Fake Order Cluster Detector", "Detect clusters of fake orders"),

  bot_order_detector: stdSkill("bot_order_detector", "FRAUD_RISK", "Bot Order Detector", "Detect bot orders", "Bug"),

  business_supplier_risk: stdSkill("business_supplier_risk", "FRAUD_RISK", "Supplier Risk", "Business-level supplier risk"),

  platform_risk: stdSkill("platform_risk", "FRAUD_RISK", "Platform Risk", "Risk of platform changes / bans"),

  account_ban_risk: stdSkill("account_ban_risk", "FRAUD_RISK", "Account Ban Risk", "Risk of account bans"),

  ad_account_risk: stdSkill("ad_account_risk", "FRAUD_RISK", "Ad Account Risk", "Ad account stability risk"),

  payment_risk: stdSkill("payment_risk", "FRAUD_RISK", "Payment Risk", "Payment / gateway risk"),

  currency_risk_score: stdSkill("currency_risk_score", "FRAUD_RISK", "Currency Risk", "Currency fluctuation risk"),

  country_risk: stdSkill("country_risk", "FRAUD_RISK", "Country Risk", "Country-level business risk"),

  regulatory_risk_score: stdSkill("regulatory_risk_score", "FRAUD_RISK", "Regulatory Risk", "Compliance / regulatory risk"),

  single_supplier_risk: stdSkill("single_supplier_risk", "FRAUD_RISK", "Single Supplier Risk", "Risk of one supplier only"),

  single_product_risk: stdSkill("single_product_risk", "FRAUD_RISK", "Single Product Risk", "Risk of one product only"),



  // --- 📊 Data Intelligence ---

  data_cleaner: stdSkill("data_cleaner", "DATA", "Data Cleaner", "Clean messy data"),

  data_normalizer: stdSkill("data_normalizer", "DATA", "Data Normalizer", "Normalize data formats"),

  data_deduplicator: stdSkill("data_deduplicator", "DATA", "Data Deduplicator", "Remove duplicate records"),

  data_enrichment: stdSkill("data_enrichment", "DATA", "Data Enrichment", "Enrich data with insight"),

  data_validator: stdSkill("data_validator", "DATA", "Data Validator", "Validate data quality"),

  missing_data_detector: stdSkill("missing_data_detector", "DATA", "Missing Data Detector", "Find missing data"),

  outlier_detector: stdSkill("outlier_detector", "DATA", "Outlier Detector", "Spot outliers"),

  anomaly_detector: stdSkill("anomaly_detector", "DATA", "Anomaly Detector", "Spot anomalies"),

  pattern_detector: stdSkill("pattern_detector", "DATA", "Pattern Detector", "Find data patterns"),

  correlation_finder: stdSkill("correlation_finder", "DATA", "Correlation Finder", "Find correlations"),

  causal_hypothesis_generator: stdSkill("causal_hypothesis_generator", "DATA", "Causal Hypothesis Generator", "Hypothesize causes"),

  kpi_analyzer: stdSkill("kpi_analyzer", "DATA", "KPI Analyzer", "Analyze key metrics"),

  kpi_forecast: stdSkill("kpi_forecast", "DATA", "KPI Forecast", "Forecast key metrics"),

  dashboard_generator: stdSkill("dashboard_generator", "DATA", "Dashboard Generator", "Generate a KPI dashboard"),

  automated_report_generator: stdSkill("automated_report_generator", "DATA", "Automated Report Generator", "Auto business reports"),

  weekly_business_intelligence: stdSkill("weekly_business_intelligence", "DATA", "Weekly Business Intelligence", "Weekly BI summary"),

  daily_business_intelligence: stdSkill("daily_business_intelligence", "DATA", "Daily Business Intelligence", "Daily BI summary"),



  // --- 🤖 Autonomous Agents ---

  product_agent: { category: "AGENTS", label: "Product Agent", icon: "Bot", desc: "Auto: find → research → score → source → margin → recommend test", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => {

    const p = (ctx.productName || "").trim();

    return `Act as a PRODUCT AGENT. Auto-process ${p || "the products in my project"} end-to-end: find the product idea → research demand/competition → score it → find suppliers and MOQ → calculate margin → identify best market → give a clear recommendation TEST / SKIP. Use any upstream data I connect. Respond ONLY with JSON: { "summary", "keyPoints", "recommendations" }.`;

  } },

  competitor_agent: { category: "AGENTS", label: "Competitor Agent", icon: "Swords", desc: "Auto: find competitors → analyze weaknesses", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => {

    const p = (ctx.productName || "").trim();

    return `Act as a COMPETITOR AGENT. Auto-process ${p || "the products in my project"}: find competitors → analyze their products, ads, offers, funnel and creatives → expose their weaknesses → explain exactly where I can beat them. Use any upstream data I connect. Respond ONLY with JSON: { "summary", "keyPoints", "recommendations" }.`;

  } },

  market_agent: { category: "AGENTS", label: "Market Agent", icon: "Globe2", desc: "Auto: market → demand → competition → price → opportunity", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => {

    const p = (ctx.productName || "").trim();

    return `Act as a MARKET AGENT. Auto-process ${p || "the products in my project"}: market size → demand → competition → customers → price range → regulations → final opportunity score with recommendation. Use any upstream data I connect. Respond ONLY with JSON: { "summary", "keyPoints", "recommendations" }.`;

  } },

  launch_agent: { category: "AGENTS", label: "Launch Agent", icon: "Rocket", desc: "Auto: offer, landing, creative, campaign, test plan", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => {

    const p = (ctx.productName || "").trim();

    return `Act as a LAUNCH AGENT. Auto-process ${p || "my product"} into a ready-to-run launch plan: offer and price → landing page sections → creatives and hooks → campaign structure and budget → test plan with KPIs and kill rules. Use any upstream data I connect. Respond ONLY with JSON: { "summary", "keyPoints", "recommendations" }.`;

  } },

  scaling_agent: { category: "AGENTS", label: "Scaling Agent", icon: "TrendingUp", desc: "Auto: read data → winners → reallocate → expand", requiredInputs: [], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `Act as a SCALING AGENT. Read the campaign / product data I connect, identify the winning ads and audses, reallocate budget to them, recommend new creatives to test, and expand audiences safely. Give scaling rules (budget rise, kill, pause). Respond ONLY with JSON: { "summary", "keyPoints", "recommendations" }.` },

  profit_agent: { category: "AGENTS", label: "Profit Agent", icon: "DollarSign", desc: "Auto: costs + orders + ads → true profit → fixes", requiredInputs: [], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => `Act as a PROFIT AGENT. Combine the costs, orders and ad data I connect, compute the TRUE net profit, find the leaks (COD failures, cancels, returns, high CPA, fees) and recommend fixes ranked by dollar impact. Respond ONLY with JSON: { "summary", "keyPoints", "recommendations" }.` },

  growth_agent: { category: "AGENTS", label: "Growth Agent", icon: "Zap", desc: "Auto: business → biggest bottleneck → action plan", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => {

    const p = (ctx.productName || "").trim();

    return `Act as a GROWTH AGENT. Analyze the entire business (${p || "from the upstream data I connect"}), identify the SINGLE biggest growth bottleneck, and generate a prioritized 30-day action plan targeting it. Respond ONLY with JSON: { "summary", "keyPoints", "recommendations" }.`;

  } },



  // --- 🧠 E-commerce Command Center ---

  ecommerce_command_center: {

    category: "COMMAND", label: "E-commerce Command Center", icon: "Command",

    desc: "One master skill that analyzes the whole business and decides next steps",

    requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight,

    buildPrompt: (ctx) => {

      const p = (ctx.productName || "").trim();

      return `Act as the E-COMMERCE COMMAND CENTER — one master brain that decides instead of the user running 20 skills.

Product/business: ${p || "the products and data I provide (via upstream connections)"}.



Using my connected data (product research, prices, competitors, costs, ads) walk the full pipeline and answer:

1. Is the product worth testing? (score + verdict)

2. Who buys it and what problem does it solve?

3. Main competitors and what they charge

4. Recommended selling price + offer

5. Landing page essentials for this product/market

6. Best countries / wilayas to launch

7. Which creatives, hooks and audiences to test

8. Test budget + break-even CPA

9. When to kill / when to scale

10. What to upsell after purchase

11. Expected real profit per order

Conclude with ONE clear verdict and the TOP 3 next actions. Respond ONLY with JSON: { "summary", "keyPoints", "recommendations" }.`;

    }

  },



  // --- 🏆 Decision Intelligence ---

  kill_keep_iterate_scale_engine: stdSkill("kill_keep_iterate_scale_engine", "DECISION", "Kill / Keep / Iterate / Scale Engine", "Decide what to do with each product"),

  best_product_selector: stdSkill("best_product_selector", "DECISION", "Best Product Selector", "Pick the best product to launch"),

  best_market_selector: stdSkill("best_market_selector", "DECISION", "Best Market Selector", "Pick the best market"),

  best_country_selector_decision: stdSkill("best_country_selector_decision", "DECISION", "Best Country Selector (Decision)", "Pick the best country"),

  best_supplier_selector: stdSkill("best_supplier_selector", "DECISION", "Best Supplier Selector", "Pick the best supplier"),

  best_price_selector: stdSkill("best_price_selector", "DECISION", "Best Price Selector", "Pick the best price"),

  best_offer_selector: stdSkill("best_offer_selector", "DECISION", "Best Offer Selector", "Pick the best offer"),

  best_creative_selector: stdSkill("best_creative_selector", "DECISION", "Best Creative Selector", "Pick the best creative"),

  best_audience_selector: stdSkill("best_audience_selector", "DECISION", "Best Audience Selector", "Pick the best audience"),

  best_channel_selector: stdSkill("best_channel_selector", "DECISION", "Best Channel Selector", "Pick the best channel"),

  best_launch_date: stdSkill("best_launch_date", "DECISION", "Best Launch Date", "Pick the best launch date"),

  best_wilaya_selector: stdSkill("best_wilaya_selector", "DECISION", "Best Wilaya Selector", "Pick the best wilayas"),

  best_budget_allocation: stdSkill("best_budget_allocation", "DECISION", "Best Budget Allocation", "Split budget optimally"),

  best_next_action: stdSkill("best_next_action", "DECISION", "Best Next Action", "The single next best action"),

  opportunity_vs_risk_matrix: stdSkill("opportunity_vs_risk_matrix", "DECISION", "Opportunity vs Risk Matrix", "Map opportunities vs risks"),

  expected_value_calculator: stdSkill("expected_value_calculator", "DECISION", "Expected Value Calculator", "Compute expected value of options"),

  decision_confidence_score: stdSkill("decision_confidence_score", "DECISION", "Decision Confidence Score", "Confidence in a decision"),

  decision_explainability: stdSkill("decision_explainability", "DECISION", "Decision Explainability", "Explain why a decision was made"),

  decision_history: stdSkill("decision_history", "DECISION", "Decision History", "Track past decisions"),

  decision_outcome_tracker: stdSkill("decision_outcome_tracker", "DECISION", "Decision Outcome Tracker", "Track decision outcomes"),



  // --- 🔥 Opportunity Radar ---

  opportunity_radar: {

    category: "RADAR", label: "Opportunity Radar", icon: "Radar",

    desc: "Auto-scan for product, trend, price and market opportunities",

    requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight,

    buildPrompt: (ctx) => {

      const p = (ctx.productName || "").trim();

      return `Act as an always-on OPPORTUNITY RADAR scanning for${p ? ` ${p}` : " products in my niche"} and its market. Scan for ALL opportunity types:

emerging products, emerging trends, competitor ad spikes, review complaint spikes, price gaps, new markets, supplier price drops, viral creatives, competitor weaknesses, geographic gaps, customer demand gaps, new variants, new audiences.



Return the TOP 3-5 opportunities as opportunity cards. For each include: Product, Market, Opportunity Score /100, Demand (Rising/Flat/Declining), Competition (Low/Medium/High), Price Gap (Low/Medium/High), Creative Potential, Estimated Margin %, Risk, Why now, Recommended action (TEST / SKIP / SCALE), Confidence %.

Respond ONLY with JSON: { "summary", "keyPoints", "recommendations" }.`;

    }

  },



  meta_daily_decision_flow: {

    category: "ECOM", label: "Meta Ads Daily Decision Flow", icon: "GitBranch",

    desc: "E-commerce (ecom). Interactive decision-flow / org-chart visual of the Meta Ads daily optimization engine: EVERY DAY -> COLLECT DATA -> 7-DAY AVERAGES -> COMPARE WITH TARGETS -> DECISION (ON TARGET: +10-20% budget -> MONITOR; BELOW TARGET: WAIT 24-48h -> RE-CHECK -> still below: -10-20% budget, recovered: KEEP -> MONITOR), with COLLECT DATA metrics (Meta/Website/Business/COD), the 7-day-average node with the no-overreaction rule, target comparison criteria, the high-AOV warning, the creative fatigue branch, the traffic-quality branch, and the COLLECT -> ANALYZE -> COMPARE -> DECIDE -> ADJUST -> MONITOR -> REPEAT feedback loop",

    requiredInputs: [], outputSchema: SchemaStandardInsight,

    buildPrompt: (ctx) => `You are the analyst behind a Meta Ads daily decision-flow diagram. You receive the UPSTREAM AdSet & Ad Table (campaign/ad set/ad level: spend, reach, frequency, CPM, CTR, CPC, ATC, checkout, purchases, CPA, ROAS, revenue, CVR) plus business/COD inputs when available (selling price, product cost, revenue, AOV, profit, margin; COD: orders, confirmed, shipped, delivered, refused, delivery/confirmation rate, delivered CPA, real profit). Your job is to place the account on the DECISION TREE so the diagram can light up the current path.



RULES:

1. Refer to the connected data only. Never invent numbers — use "Not available".

2. Evaluate on the 7-DAY AVERAGE window, never one day. Do not overreact to one bad day.

3. Compare against TARGETS: CPA <= target, cost/session <= target, cost/ATC <= target, cost/checkout <= target, delivery rate >= target, profit >= target, traffic quality acceptable.

4. DECISION: ON TARGET -> recommend INCREASE BUDGET +10-20% then monitor next 7 days. BELOW TARGET -> WAIT 24-48 hours, RE-CHECK; STILL BELOW TARGET -> DECREASE BUDGET -10-20%; if recovered -> KEEP CURRENT BUDGET; then monitor and loop back to collect data.

5. HIGH-AOV WARNING: do not rely exclusively on Ads Manager attributed ROAS/purchases; evaluate ATC -> checkout -> purchase -> revenue -> profit; purchases may happen after the attribution window.

6. FREQUENCY/CREATIVE FATIGUE: never auto-kill on frequency alone; check fatigue signals (frequency, CTR/CPC/CPM/CPA trends, session quality, CVR) and recommend creating a new creative variation and launching a new version.

7. TRAFFIC QUALITY DROP: if bounce, session duration, ATC rate, checkout rate, cost/session deteriorate, investigate platform/tracking/website issues (delivery, tracking, website, bots, audience, landing) BEFORE changing budget.



Respond ONLY with JSON matching: { "summary": "1-line status + path (ON TARGET / BELOW TARGET / STILL BELOW TARGET / RECOVERED / NO DATA)", "keyPoints": ["path taken", "budget_action (INCREASE +10-20% / DECREASE -10-20% / KEEP / WAIT)", "primary_metric_values from 7-day averages", "running_node_ids array matching the flow nodes to highlight", "high_aov_note", "fatigue_and_traffic_flags"], "recommendations": ["concrete next actions"] }.` }

  ,ecommerce_growth_loop_intelligence_engine: { category: "ADVANCED_STRATEGY", label: "E-Commerce Growth Loop Intelligence Engine", icon: "TrendingUp", desc: "Analyze the complete business as ONE connected COD/e-commerce feedback loop", requiredInputs: ["productName"], optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => buildGrowthLoopPrompt(ctx) },

  nose_hair_trimmer_launch_agent: {
    category: "ADVANCED_STRATEGY",
    label: "Nose Hair Trimmer Launch Agent",
    icon: "Rocket",
    desc: "Executes the 6-phase pre-launch plan for the Mini Portable Nose Hair Trimmer (DZ COD market).",
    requiredInputs: ["productName"],
    outputSchema: SchemaStandardInsight,
    buildPrompt: buildNoseHairTrimmerLaunchPrompt
  },

  ecommerce_growth_loop_v2: {
    category: "ADVANCED_STRATEGY",
    label: "E-Commerce Growth Loop Intelligence Engine (V2)",
    icon: "TrendingUp",
    desc: "Analyze the complete business as ONE connected COD/e-commerce feedback loop (Duplicate)",
    requiredInputs: ["productName"],
    optionalInputs: ["campaignData", "trafficData", "orderData", "confirmationData", "deliveryData", "rtoData", "revenueData", "costData", "customerData"],
    outputSchema: SchemaStandardInsight,
    buildPrompt: (ctx) => buildGrowthLoopPrompt(ctx)
  },

  full_funnel_workflow_master: {
    category: "ALL_IN_ONE",
    label: "All In One (Master 15-Stage Funnel)",
    icon: "Layers",
    desc: "Executes a complete 15-stage full-funnel analysis on the selected stages with the visual E-commerce Command Dashboard.",
    requiredInputs: ["productName"],
    outputSchema: SchemaStandardInsight,
    buildPrompt: buildFullFunnelWorkflowMasterPrompt
  },

  stage_1_product: { 
    category: "ALL_IN_ONE", 
    label: "1. Product Intelligence", 
    icon: "Package", 
    desc: "Find, validate, and prepare the product (19 sub-skills).", 
    requiredInputs: ["productName"], 
    outputSchema: SchemaStandardInsight, 
    buildPrompt: (ctx) => buildStageIntelligencePrompt('Product Intelligence', 'Product Discovery, Winning Product Finder, Product Deep Dive, Product Demand Analysis, Product Market Research, Product Trend Analysis, Product Validation, Product DNA Analysis, Product Problem-Solution Fit, Product Differentiation, Product Profitability, Product Sourcing, Supplier Research, Supplier Quality Check, Product Cost Analysis, Product Risk Analysis, Product Compliance Check, Product Test Recommendation, Product Launch Readiness', ctx) 
  },

  stage_2_strategy: { 
    category: "ALL_IN_ONE", 
    label: "2. Strategy Intelligence", 
    icon: "Target", 
    desc: "Define the offer, audience, and positioning (26 sub-skills).", 
    requiredInputs: ["productName"], 
    outputSchema: SchemaStandardInsight, 
    buildPrompt: (ctx) => buildStageIntelligencePrompt('Strategy Intelligence (Marketing Strategy)', 'Market Strategy, Target Market Research, Buyer Persona Research, Customer Segmentation, Pain Point Discovery, Desire & Motivation Analysis, Customer Awareness Level, Buying Intent Analysis, Customer Jobs-to-be-Done, Offer Strategy, Unique Selling Proposition (USP), Value Proposition, Product Positioning, Pricing Strategy, Discount Strategy, Bundle Strategy, Upsell Strategy, Cross-Sell Strategy, Guarantee Strategy, COD Offer Strategy, Competitor Strategy, Funnel Strategy, Customer Acquisition Strategy, Profit Margin Strategy, Launch Strategy, Scaling Strategy', ctx) 
  },

  stage_3_creative: { 
    category: "ALL_IN_ONE", 
    label: "3. Creative Intelligence", 
    icon: "Palette", 
    desc: "Generate and analyze ads that communicate the offer (32 sub-skills).", 
    requiredInputs: ["productName"], 
    outputSchema: SchemaStandardInsight, 
    buildPrompt: (ctx) => buildStageIntelligencePrompt('Creative Intelligence', 'Creative Strategy, Creative Angle Discovery, Marketing Angle Analyzer, Buyer Persona Creative Matcher, Hook Generator, Hook Analyzer, Pattern Interrupt Generator, Pain Point Creative, Desire-Based Creative, Problem-Solution Creative, Before & After Creative, Demonstration Creative, Testimonial Creative, UGC Creative, Founder-Style Creative, Lifestyle Creative, Product Showcase Creative, Comparison Creative, Offer Creative, Objection-Handling Creative, Image Ad Analyzer, Video Ad Analyzer, Ad Copy Analyzer, Primary Text Generator, Headline Generator, CTA Generator, Thumbnail Analyzer, Creative Fatigue Detector, Creative Winner Detector, Creative Testing Matrix, AI Image Generation, AI Video Generation', ctx) 
  },

  stage_4_campaign: { 
    category: "ALL_IN_ONE", 
    label: "4. Campaign Intelligence", 
    icon: "Megaphone", 
    desc: "Build, launch, and manage ad campaigns (30 sub-skills).", 
    requiredInputs: ["productName"], 
    outputSchema: SchemaStandardInsight, 
    buildPrompt: (ctx) => buildStageIntelligencePrompt('Campaign Intelligence', 'Campaign Strategy, Campaign Structure, Campaign Objective Selection, Sales Campaign Setup, Traffic Campaign Setup, Engagement Campaign Setup, Messages Campaign Setup, Awareness Campaign Setup, Conversion Campaign Setup, CBO Campaign Strategy, ABO Campaign Strategy, Ad Set Structure, Audience Setup, Broad Targeting, Interest Targeting, Lookalike Audience, Retargeting Campaign, Budget Allocation, Budget Scaling, Bid Strategy, Bid Cap Strategy, Cost Cap Strategy, Lowest Cost Strategy, Campaign Testing, Creative Testing Campaign, Campaign Launch Checklist, Campaign Monitoring, Campaign Troubleshooting, Campaign Scaling, Campaign Pause / Restart', ctx) 
  },

  stage_5_traffic: { 
    category: "ALL_IN_ONE", 
    label: "5. Traffic Intelligence", 
    icon: "MousePointer", 
    desc: "Understand where visitors come from and how they behave (28 sub-skills).", 
    requiredInputs: ["productName"], 
    outputSchema: SchemaStandardInsight, 
    buildPrompt: (ctx) => buildStageIntelligencePrompt('Traffic Intelligence', 'Traffic Acquisition, Traffic Source Analysis, Meta Traffic Analysis, Organic Traffic Analysis, Paid Traffic Analysis, Website Visitor Analysis, Landing Page Traffic, Product Page Traffic, Mobile Traffic Analysis, Desktop Traffic Analysis, New Visitor Analysis, Returning Visitor Analysis, Traffic Quality Analysis, Click Quality Analysis, CTR Analysis, CPC Analysis, CPM Analysis, Landing Page View Rate, Add to Cart Rate, Checkout Initiation Rate, Traffic-to-Order Conversion, Visitor Behavior Analysis, Bounce Rate Analysis, Funnel Drop-Off Analysis, Traffic Source Comparison, UTM Tracking, Pixel Event Tracking, Traffic Scaling', ctx) 
  },

  stage_6_order: { 
    category: "ALL_IN_ONE", 
    label: "6. Order Intelligence", 
    icon: "ShoppingCart", 
    desc: "Track the customer journey from checkout to submitted order (23 sub-skills).", 
    requiredInputs: ["productName"], 
    outputSchema: SchemaStandardInsight, 
    buildPrompt: (ctx) => buildStageIntelligencePrompt('Order Intelligence', 'Order Analytics, Order Volume Analysis, Order Conversion Rate, Checkout Analysis, Checkout Drop-Off, Cart Abandonment, Add to Cart Analysis, Order Value Analysis, Average Order Value (AOV), Orders by Product, Orders by Creative, Orders by Campaign, Orders by Ad Set, Orders by Wilaya, Orders by Customer Segment, First-Time Order Analysis, Repeat Order Analysis, Order Source Attribution, Order Fraud Detection, Duplicate Order Detection, COD Order Management, Order Quality Scoring', ctx) 
  },

  stage_7_confirmation: { 
    category: "ALL_IN_ONE", 
    label: "7. Confirmation Intelligence", 
    icon: "PhoneCall", 
    desc: "Improve confirmed orders and reduce invalid submissions (21 sub-skills).", 
    requiredInputs: ["productName"], 
    outputSchema: SchemaStandardInsight, 
    buildPrompt: (ctx) => buildStageIntelligencePrompt('Confirmation Intelligence (Order Confirmation)', 'Order Confirmation, Confirmation Rate, Confirmation Call Analysis, Confirmation Script Generator, Confirmation Team Performance, Customer Contact Rate, Customer Response Rate, Unreachable Customer Analysis, Wrong Phone Number Detection, Fake Order Detection, Duplicate Order Detection, Customer Intent Verification, Order Cancellation Analysis, Confirmation Time Analysis, Confirmation by Wilaya, Confirmation by Product, Confirmation by Campaign, Confirmation by Creative, Confirmed Order Value, Confirmed Order Attribution, Confirmation Optimization', ctx) 
  },

  stage_8_delivery: { 
    category: "ALL_IN_ONE", 
    label: "8. Delivery Intelligence", 
    icon: "Truck", 
    desc: "Track shipments, delivery performance, and successful receipts (21 sub-skills).", 
    requiredInputs: ["productName"], 
    outputSchema: SchemaStandardInsight, 
    buildPrompt: (ctx) => buildStageIntelligencePrompt('Delivery Intelligence', 'Delivery Tracking, Delivery Rate, Successful Delivery Rate, Delivery Time Analysis, Average Delivery Time, Delivery by Wilaya, Delivery by Courier, Delivery by Product, Delivery by Campaign, Delivery by Customer, Delivery Cost Analysis, Shipping Cost Analysis, Shipping Profitability, Failed Delivery Analysis, Delivery Delay Analysis, Courier Performance, Wilaya Performance, First Attempt Delivery Rate, Reattempt Delivery Analysis, Delivery Experience Analysis, Delivery Optimization', ctx) 
  },

  stage_9_rto: { 
    category: "ALL_IN_ONE", 
    label: "9. RTO Intelligence", 
    icon: "RotateCcw", 
    desc: "Analyze returns to origin and their financial impact (24 sub-skills).", 
    requiredInputs: ["productName"], 
    outputSchema: SchemaStandardInsight, 
    buildPrompt: (ctx) => buildStageIntelligencePrompt('RTO Intelligence', 'RTO Analysis, RTO Rate, Return to Origin Tracking, RTO Reason Analysis, RTO by Wilaya, RTO by Courier, RTO by Product, RTO by Campaign, RTO by Ad Set, RTO by Creative, RTO by Customer Segment, RTO by Order Source, Customer Refusal Analysis, Wrong Address Analysis, Unreachable Customer RTO, Delivery Delay RTO, RTO Cost Analysis, Reverse Shipping Cost, Return Handling Cost, RTO Profit Impact, RTO Prediction, RTO Risk Scoring, RTO Reduction Strategy, RTO Prevention', ctx) 
  },

  stage_10_revenue: { 
    category: "ALL_IN_ONE", 
    label: "10. Revenue Intelligence", 
    icon: "DollarSign", 
    desc: "Measure money generated by the business (22 sub-skills).", 
    requiredInputs: ["productName"], 
    outputSchema: SchemaStandardInsight, 
    buildPrompt: (ctx) => buildStageIntelligencePrompt('Revenue Intelligence', 'Revenue Analytics, Gross Revenue, Net Revenue, Delivered Revenue, Collected Revenue, Revenue by Product, Revenue by Campaign, Revenue by Ad Set, Revenue by Creative, Revenue by Wilaya, Revenue by Customer, Revenue by Date, Revenue Growth, Revenue Forecasting, Revenue Attribution, Revenue per Customer, Average Order Value, Revenue per Ad Spend, Daily Revenue Tracking, Weekly Revenue Tracking, Monthly Revenue Tracking, Revenue Dashboard', ctx) 
  },

  stage_11_profit: { 
    category: "ALL_IN_ONE", 
    label: "11. Profit Intelligence", 
    icon: "TrendingUp", 
    desc: "Calculate the real economics of every sale (26 sub-skills).", 
    requiredInputs: ["productName"], 
    outputSchema: SchemaStandardInsight, 
    buildPrompt: (ctx) => buildStageIntelligencePrompt('Profit Intelligence', 'Profit Analytics, Gross Profit, Net Profit, Contribution Margin, Profit Margin, Profit per Order, Profit per Delivered Order, Profit per Product, Profit per Campaign, Profit per Ad Set, Profit per Creative, Profit per Wilaya, Cost of Goods Sold (COGS), Shipping Cost, Confirmation Cost, Return Cost, RTO Cost, Ad Spend, Operating Expenses, Break-Even Analysis, Break-Even ROAS, Break-Even CPA, Maximum CPA, Maximum CAC, Target ROAS, Profit Forecasting, Profit Optimization, Scaling Profitability', ctx) 
  },

  stage_12_customer_quality: { 
    category: "ALL_IN_ONE", 
    label: "12. Customer Quality Intelligence", 
    icon: "Users", 
    desc: "Measure whether acquired customers create sustainable value (25 sub-skills).", 
    requiredInputs: ["productName"], 
    outputSchema: SchemaStandardInsight, 
    buildPrompt: (ctx) => buildStageIntelligencePrompt('Customer Quality Intelligence', 'Customer Quality Score, Customer Lifetime Value (LTV), Customer Acquisition Cost (CAC), Customer Retention, Repeat Purchase Rate, Repeat Order Analysis, Customer Segmentation, High-Value Customer Detection, Low-Value Customer Detection, RTO-Prone Customer Analysis, Customer Refusal Rate, Customer Cancellation Rate, Customer Confirmation Rate, Customer Delivery Rate, Customer Profitability, Customer Feedback Analysis, Customer Satisfaction Analysis, Customer Complaints, Customer Loyalty, Customer Cohort Analysis, Customer Quality by Wilaya, Customer Quality by Product, Customer Quality by Campaign, Customer Quality by Creative, Customer Quality Prediction', ctx) 
  },

  stage_13_signal: { 
    category: "ALL_IN_ONE", 
    label: "13. Ad Platform Signal Intelligence", 
    icon: "Radio", 
    desc: "Analyze the signals sent back to Meta and other ad platforms (26 sub-skills).", 
    requiredInputs: ["productName"], 
    outputSchema: SchemaStandardInsight, 
    buildPrompt: (ctx) => buildStageIntelligencePrompt('Ad Platform Signal Intelligence', 'Pixel Signal Analysis, Conversion API (CAPI) Analysis, Event Tracking, Event Match Quality, Purchase Event Quality, Lead Event Quality, Add to Cart Signal, Initiate Checkout Signal, Confirmed Order Signal, Delivered Order Signal, Purchase Value Signal, Revenue Signal Quality, Customer Quality Signal, Offline Conversion Tracking, Server-Side Tracking, Browser-Side Tracking, Deduplication Analysis, Event Match Rate, Signal Loss Detection, Event Delay Analysis, Conversion Attribution, Data Quality Monitoring, Signal-to-Conversion Analysis, Signal Optimization, Meta Learning Phase Analysis, Audience Feedback Loop', ctx) 
  },

  stage_14_optimization: { 
    category: "ALL_IN_ONE", 
    label: "14. AI Optimization Engine", 
    icon: "Sliders", 
    desc: "Turn business and customer data into better campaign decisions (34 sub-skills).", 
    requiredInputs: ["productName"], 
    outputSchema: SchemaStandardInsight, 
    buildPrompt: (ctx) => buildStageIntelligencePrompt('AI Optimization Engine (Better Targeting / Optimization)', 'AI Campaign Optimization, AI Budget Optimization, AI Bid Optimization, AI Creative Optimization, AI Audience Optimization, AI Targeting Optimization, AI Product Optimization, AI Offer Optimization, AI Funnel Optimization, AI Landing Page Optimization, AI Conversion Rate Optimization (CRO), AI CPA Optimization, AI ROAS Optimization, AI Profit Optimization, AI Revenue Optimization, AI RTO Reduction, AI Delivery Rate Optimization, AI Confirmation Rate Optimization, AI Customer Quality Optimization, AI Signal Optimization, Budget Reallocation, Creative Rotation, Creative Fatigue Prevention, Audience Expansion, Audience Exclusion, Broad vs Interest Targeting, Scaling Recommendations, Kill / Keep / Scale Analysis, Daily Performance Monitoring, Automated Decision Rules, 7-Day Average Comparison, Anomaly Detection, Performance Alerts, Testing Prioritization', ctx) 
  },

  stage_15_new_traffic: { 
    category: "ALL_IN_ONE", 
    label: "15. New Traffic Acquisition", 
    icon: "Waves", 
    desc: "Use optimization insights to acquire the next wave of customers (26 sub-skills).", 
    requiredInputs: ["productName"], 
    outputSchema: SchemaStandardInsight, 
    buildPrompt: (ctx) => buildStageIntelligencePrompt('New Traffic Acquisition', 'New Traffic Generation, New Audience Discovery, Audience Expansion, Lookalike Expansion, Broad Audience Expansion, New Interest Discovery, New Buyer Persona Discovery, New Market Discovery, New Wilaya Expansion, New Creative Launch, New Offer Testing, New Product Testing, New Campaign Launch, New Traffic Source Discovery, Organic Traffic Expansion, Paid Traffic Expansion, Influencer Traffic, UGC Traffic, Social Media Traffic, Search Traffic, Retargeting Expansion, Customer Referral Traffic, New Customer Acquisition, Traffic Scaling, Market Expansion, Growth Loop', ctx) 
  }
};
