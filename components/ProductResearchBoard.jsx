"use client";
import { useState, useRef, useMemo, useEffect } from "react";
import ProductCard from "./ProductCard";
import ProductDetailModal from "./ProductDetailModal";
import CompareModal from "./CompareModal";
import AdTestingDashboard from "./AdTestingDashboard";

/* ─────────────────────────────────────────
   SCHEMA NORMALIZER
   Accepts:
   1. Native flat schema  (legacy / current)
   2. Nested research schema  (product/supplier/pricing/algeria_analysis/…)
   3. Single object OR array — both work
   Cleans markdown links like "[text](url)" → "url"
───────────────────────────────────────── */
function extractUrl(str) {
  if (!str || typeof str !== "string") return str;
  const md = str.match(/\[.*?\]\((https?:\/\/[^)]+)\)/);
  if (md) return md[1];
  return str.trim();
}

function mapScore(val, max = 10) {
  if (val == null) return null;
  // If score looks like it's already /100, keep it
  if (max === 100) return Math.round(val);
  // Scale /10 → /100
  return Math.round(val * 10);
}

function saturationLabel(score) {
  if (score == null) return null;
  if (score <= 3) return "Low";
  if (score <= 6) return "Medium";
  if (score <= 8) return "High";
  return "Saturated";
}

function verdictFromStatus(status, score) {
  const map = {
    strong_opportunity: "Strong Opportunity",
    test_recommended: "Needs Testing",
    needs_testing: "Needs Testing",
    avoid: "Avoid",
    research_more: "Research More",
    interesting: "Research More",
  };
  if (status && map[status.toLowerCase()]) return map[status.toLowerCase()];
  if (score == null) return null;
  if (score >= 75) return "Strong Opportunity";
  if (score >= 55) return "Needs Testing";
  if (score >= 35) return "Research More";
  return "Avoid";
}

function normalizeProduct(raw) {
  if (!raw || typeof raw !== "object") return null;

  // ── DETECT SCHEMA TYPE ──
  // Nested research schema has a `product` sub-object
  const isNestedSchema = raw.product && typeof raw.product === "object" && raw.product.name;

  if (!isNestedSchema) {
    // Already in native flat/semi-nested schema — just ensure id exists
    return { id: raw.id || `prod_${Math.random().toString(36).slice(2, 10)}`, ...raw };
  }

  // ── MAP NESTED → NATIVE ──
  const p = raw.product || {};
  const sup = raw.supplier || {};
  const pr = raw.pricing || {};
  const mkt = raw.marketplace_data || {};
  const alg = raw.algeria_analysis || {};
  const sc = raw.product_scores || {};
  const ta = raw.target_audience || {};
  const mkg = raw.marketing || {};
  const comp = raw.competition || {};
  const vrd = raw.verdict || {};
  const log = raw.logistics || {};
  const res = raw.research || {};
  const risks = raw.risks || {};

  // Clean images — remove markdown links, filter empty
  const rawImages = Array.isArray(p.images) ? p.images : [];
  const cleanImages = rawImages.map(extractUrl).filter(Boolean);
  const mainImg = extractUrl(p.main_image) || cleanImages[0] || null;
  const gallery = cleanImages.filter(u => u !== mainImg);

  // Overall score
  const overallScore = vrd.overall_score ?? null;

  // Verdict
  const verdictLabel = verdictFromStatus(vrd.status, overallScore);

  // Saturation
  const satScore = alg.saturation_score ?? alg.competition_score ?? null;

  // COD suitability — score ≥ 6 = suitable
  const codScore = alg.cod_suitability_score ?? null;
  const codSuitable = codScore != null ? codScore >= 6 : null;

  // Fragility — score ≥ 7 = fragile (high score = NOT fragile in user schema? Let's check)
  // User has fragility_score: 8, and logistics.fragile: false → so high score = not fragile? Let's use logistics.fragile directly
  const fragile = log.fragile ?? null;
  const fragilityLabel = fragile === true ? "High" : fragile === false ? "Low" : null;

  // Return risk — score: 1-4 low, 5-7 medium, 8-10 high
  const retScore = alg.return_risk_score ?? null;
  const returnRisk = retScore != null ? (retScore <= 4 ? "Low" : retScore <= 7 ? "Medium" : "High") : null;

  // Delivery suitability
  const delScore = alg.delivery_suitability_score ?? null;
  const deliverySuitable = delScore != null ? delScore >= 6 : null;

  // Competitor examples → competitors array
  const competitorExamples = Array.isArray(comp.competitor_examples) ? comp.competitor_examples : [];
  const competitors = competitorExamples.slice(0, 6).map((ex, i) => {
    const priceMatch = typeof ex === "string" ? ex.match(/([\d,\.]+)\s*DZD/i) : null;
    const namePart = typeof ex === "string" ? ex.replace(/\s*[-–]\s*[\d,\.]+\s*DZD.*/i, "").trim() : String(ex);
    return {
      name: namePart,
      price: priceMatch ? Math.round(parseFloat(priceMatch[1].replace(",", "")) / 135) : null,
      shipping: 0,
      rating: null,
      reviews: null,
    };
  });

  // Marketing angles
  const primaryAngle = mkg.primary_angle || null;
  const secondaryAngles = Array.isArray(mkg.secondary_angles) ? mkg.secondary_angles : [];
  const marketingAngles = [
    primaryAngle ? { type: "Primary Angle", angle: primaryAngle, strength: 9 } : null,
    ...secondaryAngles.slice(0, 4).map((a, i) => ({ type: "Supporting Angle", angle: a, strength: 7 - i })),
  ].filter(Boolean);

  // Audience
  const genderArr = Array.isArray(ta.gender) ? ta.gender : (ta.gender ? [ta.gender] : []);
  const genderLabel = genderArr.length === 2 ? "Mixed" : genderArr[0] || null;
  const ageRange = ta.age_min && ta.age_max ? `${ta.age_min}-${ta.age_max}` : null;
  const painPoints = Array.isArray(ta.pain_points) ? ta.pain_points : [];
  const desires = Array.isArray(ta.desires) ? ta.desires : [];
  const useCases = Array.isArray(ta.use_cases) ? ta.use_cases : [];

  // Strengths → whySell
  const strengths = Array.isArray(raw.strengths) ? raw.strengths : [];
  const weaknesses = Array.isArray(raw.weaknesses) ? raw.weaknesses : [];
  const mainRisks = Array.isArray(risks.main_risks) ? risks.main_risks : [];

  return {
    // ── Identity ──
    id: raw.id || `prod_${Math.random().toString(36).slice(2, 10)}`,
    name: p.name || p.short_name || "Unnamed Product",
    status: "New",
    category: p.category || null,
    subcategory: p.subcategory || null,
    source: sup.platform || null,
    country: sup.supplier_country || null,
    sku: p.sku || null,
    productUrl: extractUrl(sup.product_url) || null,
    mainImage: mainImg,
    gallery,
    favorite: false,
    pinned: false,
    hot: overallScore >= 75,
    highMargin: pr.estimated_profit_margin_percent >= 60,
    colorLabel: overallScore >= 75 ? "#16a34a" : overallScore >= 55 ? "#d97706" : "#6366f1",
    rating: mkt.rating ?? null,
    reviewCount: mkt.review_count ?? null,
    orderCount: mkt.orders ?? mkt.sold_count ?? null,

    // ── Supplier ──
    supplier: {
      name: sup.supplier_name || sup.platform || null,
      rating: sup.supplier_rating ?? null,
      reliabilityScore: sup.supplier_score ?? null,
      location: sup.supplier_country || null,
      shippingTime: null,
      moq: 1,
    },

    // ── Financials ──
    financials: {
      supplierPrice: pr.supplier_price ?? null,
      costPrice: pr.supplier_price ?? null,
      shippingCost: pr.shipping_cost ?? null,
      landedCost: pr.estimated_landed_cost_usd ?? null,
      sellingPrice: pr.suggested_selling_price_dzd ? pr.suggested_selling_price_dzd / 135 : null,
      originalPrice: pr.original_price ?? null,
      discountPercent: pr.discount_percent ?? null,
      suggestedPriceDZD: pr.suggested_selling_price_dzd ?? null,
      suggestedPriceRangeDZD: (pr.suggested_price_min_dzd && pr.suggested_price_max_dzd)
        ? [pr.suggested_price_min_dzd, pr.suggested_price_max_dzd] : null,
      grossProfitDZD: pr.estimated_profit_dzd ?? null,
      profitMarginPct: pr.estimated_profit_margin_percent ?? null,
      landedCostDZD: pr.estimated_landed_cost_dzd ?? null,
    },

    // ── Algeria ──
    algeria: {
      marketFitScore: alg.market_fit_score ?? null,
      demandScore: mapScore(alg.demand_score, 10),
      competitionScore: mapScore(alg.competition_score, 10),
      saturationLevel: saturationLabel(satScore),
      codSuitable,
      deliverySuitable,
      fragility: fragilityLabel,
      returnRisk,
      seasonality: alg.seasonality || null,
      targetAudience: alg.target_customer || null,
      bestSegment: alg.target_locations?.slice(0, 3).join(", ") || null,
      priceRangeDZD: (pr.suggested_price_min_dzd && pr.suggested_price_max_dzd)
        ? [pr.suggested_price_min_dzd, pr.suggested_price_max_dzd] : null,
      mainBuyReason: alg.main_reason_to_buy || null,
      verdict: verdictLabel,
      overallScore: overallScore,
      confidenceScore: vrd.confidence_score ?? null,
      mainAdvantage: vrd.main_advantage || null,
      mainRisk: vrd.main_risk || null,
      analystNote: vrd.recommendation?.slice(0, 180) || null,
      opportunitySummary: alg.algeria_opportunity_summary || null,
    },

    // ── Opportunity ──
    opportunity: {
      overallScore: overallScore,
      demand: mapScore(alg.demand_score, 10),
      competition: mapScore(alg.competition_score, 10),
      margin: pr.estimated_profit_margin_percent ?? null,
      supplier: null,
      trend: null,
    },

    // ── Winning metrics ──
    winningMetrics: {
      wowFactor: sc.wow_factor ?? null,
      problemSolvingScore: sc.problem_solving ?? null,
      impulseBuyPotential: sc.impulse_buy_potential ?? null,
      perceivedValue: sc.perceived_value ?? null,
      demonstrationPotential: sc.video_demo_potential ?? null,
      videoAdPotential: sc.video_demo_potential ?? null,
      facebookAdPotential: sc.facebook_ads_potential ?? null,
      tiktokAdPotential: sc.tiktok_ads_potential ?? null,
      upsellPotential: sc.upsell_potential ?? null,
      bundlePotential: sc.bundle_potential ?? null,
      repeatPurchasePotential: sc.repeat_purchase_potential ?? null,
      localAvailabilityDifficulty: alg.local_availability_score ? 10 - alg.local_availability_score : null,
      marketSaturation: alg.saturation_score ?? null,
    },

    // ── Target audience ──
    targetAudience: {
      gender: genderLabel,
      ageRange,
      interests: Array.isArray(ta.interests) ? ta.interests.slice(0, 8) : [],
      customerType: Array.isArray(ta.customer_types) ? ta.customer_types.slice(0, 2).join(", ") : null,
      mainPainPoint: painPoints[0] || null,
      mainDesire: desires[0] || null,
      bestUseCase: useCases.slice(0, 3).join(", ") || null,
    },

    // ── Marketing ──
    marketingAngles,
    adIdeas: {
      bestHook: mkg.best_hook || null,
      bestAngle: mkg.primary_angle || null,
      tiktokConcept: Array.isArray(mkg.video_ideas) ? mkg.video_ideas[0] : null,
      suggestedHeadline: mkg.headline || null,
      suggestedCta: mkg.cta || null,
    },

    // ── AI analysis (mapped from strengths/risks) ──
    aiAnalysis: {
      whySell: strengths.slice(0, 5),
      risks: (mainRisks.length ? mainRisks : weaknesses).slice(0, 5),
      marketingAngle: mkg.primary_angle || null,
      adScore: sc.tiktok_ads_potential ?? sc.facebook_ads_potential ?? null,
    },

    // ── Competitors ──
    competitors,

    // ── Intelligence ──
    intelligence: {
      demandLevel: alg.demand_score >= 7 ? "HIGH" : alg.demand_score >= 4 ? "MEDIUM" : "LOW",
      competitionLevel: comp.competition_level || null,
      trendDirection: null,
      seasonality: alg.seasonality?.split(".")[0] || null,
      impulseBuy: sc.impulse_buy_potential >= 7 ? "HIGH" : sc.impulse_buy_potential >= 5 ? "MEDIUM" : "LOW",
      targetCustomer: alg.target_customer || null,
    },

    // ── Notes ──
    structuredNotes: {
      supplierNotes: null,
      pricingNotes: res.notes || null,
      competitionNotes: alg.main_objection || null,
      aiNotes: alg.algeria_opportunity_summary || null,
    },

    // ── Details from logistics ──
    details: {
      weight: log.estimated_weight_kg ? `${log.estimated_weight_kg} kg` : null,
      dimensions: log.estimated_size || null,
      batteryProduct: log.battery_product ?? null,
      electronic: log.electronic_product ?? null,
      shippingDifficulty: log.shipping_difficulty || null,
    },

    checklist: [
      { text: "Supplier verified", done: false },
      { text: "Sample ordered", done: false },
      { text: "Ad creative ready", done: false },
    ],

    timeline: [
      { type: "Researched", text: "Added from research JSON", date: Date.now() },
    ],

    links: {
      productLink: extractUrl(sup.product_url) || null,
      supplierLink: extractUrl(sup.store_url) || null,
    },

    isPlaceholder: false,
  };
}

/* ── Parse pasted/uploaded JSON → normalized array ── */
function parseAndNormalize(text) {
  const raw = JSON.parse(text); // throws if invalid JSON

  // Could be: single object, array of objects, or array containing nested objects
  const items = Array.isArray(raw) ? raw : [raw];

  return items.map(normalizeProduct).filter(Boolean);
}

/* ─────────────────────────────────────────
   PLACEHOLDER DATA (uses extended schema)
───────────────────────────────────────── */
const PLACEHOLDER_PRODUCTS = [
  {
    id: "__placeholder_a",
    name: "Ergonomic Posture-Correcting Laptop Stand",
    status: "Researching",
    category: "Office Supplies",
    subcategory: "Desk Accessories",
    source: "AliExpress",
    country: "CN",
    sku: "LPTS-001",
    mainImage: "",
    gallery: [],
    favorite: true,
    pinned: true,
    hot: true,
    highMargin: true,
    colorLabel: "#6366f1",
    rating: 4.8,
    reviewCount: 1240,
    orderCount: 14500,
    productUrl: "https://aliexpress.com",

    supplier: {
      name: "TechAccessory Pro Store",
      rating: 4.8,
      reliabilityScore: 87,
      storeAge: "3 Years",
      orders: 14500,
      shippingTime: "7-12 days",
      processingTime: "48 hours",
      moq: 1,
      location: "Shenzhen, China",
    },

    financials: {
      supplierPrice: 12.50,
      costPrice: 12.50,
      shippingCost: 4.00,
      landedCost: 16.50,
      sellingPrice: 39.99,
      originalPrice: 55.00,
      discountPercent: 27,
      suggestedPriceDZD: 5400,
      suggestedPriceRangeDZD: [4500, 6200],
      grossProfitDZD: 3150,
      profitMarginPct: 58,
      roi: 142,
      breakEvenPrice: 16.50,
    },

    algeria: {
      marketFitScore: 8.5,
      demandScore: 88,
      competitionScore: 38,
      saturationLevel: "Low",
      codSuitable: true,
      deliverySuitable: true,
      fragility: "Low",
      returnRisk: "Low",
      seasonality: "Evergreen",
      targetAudience: "Remote workers, students, office workers",
      bestSegment: "Men & Women 22-40, urban, professional",
      priceRangeDZD: [4500, 6500],
      mainBuyReason: "Solves chronic neck/back pain, improves desk setup aesthetics",
      verdict: "Strong Opportunity",
      overallScore: 84,
      confidenceScore: 78,
      mainAdvantage: "High perceived value + low local availability",
      mainRisk: "Many AliExpress variations exist",
      analystNote: "Test with Facebook video ad. Price at 4800–5600 DA. Bundle with mouse pad.",
    },

    opportunity: {
      overallScore: 84,
      demand: 88,
      competition: 62,
      margin: 91,
      supplier: 85,
      trend: 79,
    },

    winningMetrics: {
      wowFactor: 8.5,
      problemSolvingScore: 9,
      impulseBuyPotential: 7,
      perceivedValue: 8,
      demonstrationPotential: 7,
      videoAdPotential: 8,
      facebookAdPotential: 8,
      tiktokAdPotential: 7,
      upsellPotential: 6,
      bundlePotential: 7,
      repeatPurchasePotential: 3,
      localAvailabilityDifficulty: 8,
      marketSaturation: 4,
    },

    targetAudience: {
      gender: "Mixed",
      ageRange: "22-45",
      interests: ["productivity", "remote work", "ergonomics", "tech gadgets"],
      customerType: "Professional / Student",
      mainPainPoint: "Back and neck pain from poor desk posture",
      mainDesire: "Comfortable, productive, aesthetic workspace",
      bestUseCase: "Home office, student desk, co-working space",
    },

    marketingAngles: [
      { type: "Problem → Solution", angle: "Tired of neck pain after hours at your desk? This changes everything.", strength: 9 },
      { type: "Gift", angle: "The perfect gift for remote workers and students", strength: 7 },
      { type: "Productivity", angle: "Work smarter, not harder — upgrade your setup today", strength: 6 },
    ],

    adIdeas: {
      bestHook: "POV: You finally fixed your posture working from home 🙌",
      bestAngle: "Before/After desk setup transformation",
      tiktokConcept: "30s satisfying unboxing + setup transformation with productivity music",
      suggestedHeadline: "Work pain-free from anywhere",
      suggestedCta: "Order Now – Free Delivery Across Algeria",
    },

    competitors: [
      { name: "Amazon", price: 45.99, shipping: 0, rating: 4.6, reviews: 1200 },
      { name: "Temu", price: 28.50, shipping: 2.50, rating: 4.2, reviews: 340 },
    ],

    intelligence: {
      demandLevel: "HIGH",
      competitionLevel: "MEDIUM",
      trendDirection: "RISING 18%",
      seasonality: "YEAR ROUND",
      impulseBuy: "HIGH",
      targetCustomer: "Remote workers, Students",
    },

    details: {
      material: "Aluminum Alloy",
      weight: "0.8 kg",
      dimensions: "25 x 20 x 4 cm",
      colorVariants: ["Silver", "Space Gray"],
    },

    aiAnalysis: {
      whySell: ["High perceived value", "Solves posture pain", "Cheap shipping", "Strong video ad potential"],
      risks: ["Many variations exist on AliExpress", "Metal can scratch laptops", "Competitor pricing pressure from Temu"],
      marketingAngle: "Work pain-free from anywhere. Your posture will thank you.",
      adScore: 8.7,
    },

    structuredNotes: {
      supplierNotes: "Responds within 2 hours. Very professional. Offers custom branding at 50+ units.",
      pricingNotes: "Can easily mark up 3x. Landed cost ~$16.50. Price at 5000 DA minimum.",
      competitionNotes: "Most local sellers offer cheap plastic versions. Aluminum differentiates.",
      aiNotes: "Strong Q4 potential for office gifting. Consider a bundle with a phone stand.",
    },

    checklist: [
      { text: "Supplier verified", done: true },
      { text: "Competitor pricing checked", done: true },
      { text: "Order sample", done: false },
      { text: "Create ad creative", done: false },
    ],

    timeline: [
      { type: "Discovered", text: "Found via TikTok ad", date: 1725220000000 },
    ],

    links: {
      productLink: "https://aliexpress.com",
      supplierLink: "https://aliexpress.com",
      facebookAd: "https://facebook.com",
      tiktok: "https://tiktok.com",
    },
    isPlaceholder: true,
  },
  {
    id: "__placeholder_b",
    name: "Minimalist Magnetic Floating Planter",
    status: "Testing",
    category: "Home Decor",
    subcategory: "Indoor Plants",
    source: "Temu",
    country: "CN",
    mainImage: "",
    gallery: [],
    favorite: false,
    pinned: false,
    hot: false,
    highMargin: false,
    colorLabel: "#10b981",
    rating: 4.2,
    reviewCount: 420,
    orderCount: 850,

    supplier: {
      name: "ModernHome Direct",
      rating: 4.2,
      reliabilityScore: 65,
      storeAge: "1 Year",
      orders: 850,
      shippingTime: "10-15 days",
      processingTime: "72 hours",
      moq: 5,
      location: "Zhejiang, China",
    },

    financials: {
      supplierPrice: 28.00,
      costPrice: 28.00,
      shippingCost: 8.50,
      landedCost: 36.50,
      sellingPrice: 59.99,
      suggestedPriceDZD: 8100,
      suggestedPriceRangeDZD: [7000, 9500],
      grossProfitDZD: 3105,
      profitMarginPct: 38,
      roi: 64,
      breakEvenPrice: 36.50,
    },

    algeria: {
      marketFitScore: 5.8,
      demandScore: 58,
      competitionScore: 30,
      saturationLevel: "Low",
      codSuitable: true,
      deliverySuitable: false,
      fragility: "High",
      returnRisk: "Medium",
      seasonality: "Seasonal",
      targetAudience: "Home decor enthusiasts, tech-savvy millennials",
      bestSegment: "Women 25-40, urban, middle-income",
      priceRangeDZD: [7000, 10000],
      mainBuyReason: "Unique gift, aesthetic home decoration, conversation starter",
      verdict: "Needs Testing",
      overallScore: 62,
      confidenceScore: 55,
      mainAdvantage: "Very low local competition, unique product",
      mainRisk: "Fragility risk during delivery, higher price point for Algeria",
      analystNote: "Niche product. Test with 10 units. Target Instagram-active home decor buyers.",
    },

    opportunity: {
      overallScore: 62,
      demand: 58,
      competition: 70,
      margin: 52,
      supplier: 60,
      trend: 85,
    },

    winningMetrics: {
      wowFactor: 9,
      problemSolvingScore: 3,
      impulseBuyPotential: 6,
      perceivedValue: 9,
      demonstrationPotential: 9,
      videoAdPotential: 9,
      facebookAdPotential: 7,
      tiktokAdPotential: 9,
      upsellPotential: 5,
      bundlePotential: 4,
      repeatPurchasePotential: 2,
      localAvailabilityDifficulty: 9,
      marketSaturation: 2,
    },

    targetAudience: {
      gender: "Primarily Female",
      ageRange: "22-40",
      interests: ["home decor", "interior design", "plants", "aesthetics", "Instagram"],
      customerType: "Aspirational / Gift Buyer",
      mainPainPoint: "Wants unique home décor that impresses guests",
      mainDesire: "A magical, beautiful living space",
      bestUseCase: "Living room centerpiece, office desk, gift for housewarming",
    },

    marketingAngles: [
      { type: "Wow Factor", angle: "Make your desk magical — it actually floats 🌿", strength: 9 },
      { type: "Gift", angle: "The most unique housewarming gift in Algeria", strength: 8 },
      { type: "Social Proof", angle: "Everyone who sees it asks where to buy it", strength: 7 },
    ],

    adIdeas: {
      bestHook: "A plant that defies gravity… delivered to your door",
      bestAngle: "Magical product reveal in a beautiful home setting",
      tiktokConcept: "30s 'this appeared on my feed and I had to buy it' style organic TikTok",
      suggestedHeadline: "Make any room unforgettable",
      suggestedCta: "Get Yours Today – Limited Stock",
    },

    competitors: [
      { name: "Wayfair (intl)", price: 89.99, shipping: 0, rating: 4.8, reviews: 150 },
    ],

    intelligence: {
      demandLevel: "MEDIUM",
      competitionLevel: "LOW",
      trendDirection: "FLAT",
      seasonality: "SPRING/SUMMER",
      impulseBuy: "MEDIUM",
      targetCustomer: "Home decor enthusiasts, Tech lovers",
    },

    details: {
      material: "ABS Plastic & Magnets",
      weight: "1.2 kg",
      dimensions: "15 x 15 x 5 cm",
      colorVariants: ["Wood Grain", "Matte Black"],
    },

    aiAnalysis: {
      whySell: ["Insane WOW factor", "High video ad potential", "Very low local competition"],
      risks: ["Magnet mechanism can fail", "Heavy shipping", "High price point for DZ market"],
      marketingAngle: "Make any desk or room magical — it floats.",
      adScore: 7.2,
    },

    structuredNotes: {
      supplierNotes: "Communication is slow. Takes 48h to respond. MOQ is 5 units.",
      pricingNotes: "Shipping eats into margin. Need to price at 8000+ DA to make it worth it.",
      competitionNotes: "No local Algerian sellers. First mover advantage possible.",
      aiNotes: "Needs high-quality video ads. Organic TikTok could work very well.",
    },

    checklist: [
      { text: "Supplier verified", done: false },
      { text: "Sample ordered", done: false },
      { text: "Video ad concept ready", done: false },
    ],

    timeline: [
      { type: "Discovered", text: "Found on Pinterest board", date: 1725120000000 },
    ],

    isPlaceholder: true,
  },
];

/* ─────────────────────────────────────────
   SORT OPTIONS
───────────────────────────────────────── */
const SORT_OPTIONS = [
  { value: "name", label: "Sort: Name A-Z" },
  { value: "score", label: "Sort: Score ↓" },
  { value: "demand", label: "Sort: Demand ↓" },
  { value: "profit", label: "Sort: Profit ↓" },
  { value: "margin", label: "Sort: Margin ↓" },
  { value: "price", label: "Sort: Price ↓" },
  { value: "rating", label: "Sort: Rating ↓" },
];

const FILTER_BTNS = [
  { key: "favorite", label: "★ Saved" },
  { key: "hot", label: "🔥 Hot" },
  { key: "pinned", label: "📌 Pinned" },
  { key: "highMargin", label: "💰 High Margin" },
];

/* ─────────────────────────────────────────
   HELPERS
───────────────────────────────────────── */
function getScore(p) { return p.algeria?.overallScore ?? p.opportunity?.overallScore ?? 0; }
function getDemand(p) { return p.algeria?.demandScore ?? p.opportunity?.demand ?? 0; }
function getProfit(p) {
  const fin = p.financials ?? {};
  if (fin.grossProfitDZD) return fin.grossProfitDZD;
  const sell = fin.sellingPrice ?? p.sellingPrice ?? 0;
  const cost = fin.supplierPrice ?? fin.costPrice ?? p.costPrice ?? 0;
  const ship = fin.shippingCost ?? p.shippingCost ?? 0;
  return (sell - cost - ship) * 135;
}
function getMargin(p) {
  const fin = p.financials ?? {};
  if (fin.profitMarginPct) return fin.profitMarginPct;
  const sell = fin.sellingPrice ?? p.sellingPrice ?? 0;
  const cost = fin.supplierPrice ?? fin.costPrice ?? p.costPrice ?? 0;
  const ship = fin.shippingCost ?? p.shippingCost ?? 0;
  if (!sell) return 0;
  return ((sell - cost - ship) / sell) * 100;
}

/* ─────────────────────────────────────────
   MAIN BOARD
───────────────────────────────────────── */
export default function ProductResearchBoard() {
  const [products, setProducts] = useState(PLACEHOLDER_PRODUCTS);
  const [isImported, setIsImported] = useState(false);
  const [importError, setImportError] = useState("");
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ favorite: false, hot: false, pinned: false, highMargin: false });
  const [sortBy, setSortBy] = useState("score");
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [compareIds, setCompareIds] = useState(new Set());
  const [compareOpen, setCompareOpen] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [adTestingOpen, setAdTestingOpen] = useState(false);
  const [aiData, setAiData] = useState(null);

  const fileRef = useRef(null);
  const imageFileRef = useRef(null);

  /* ── Persist to data/board.json via API ── */
  const [hasHydrated, setHasHydrated] = useState(false);
  const [saveStatus, setSaveStatus] = useState(""); // "", "saving", "saved", "error"

  // Load from file on startup
  useEffect(() => {
    fetch("/api/board")
      .then(r => r.json())
      .then(({ products: saved }) => {
        const real = (saved || []).filter(p => !p.isPlaceholder);
        if (real.length > 0) {
          setProducts(real);
          setIsImported(true);
        }
      })
      .catch(e => console.warn("Could not load board from file", e))
      .finally(() => setHasHydrated(true));

    // Fetch AI config for header dropdown
    fetch("/api/ai/config")
      .then(r => r.json())
      .then(setAiData)
      .catch(console.error);
  }, []);

  // Auto-save to file whenever products change (after hydration)
  useEffect(() => {
    if (!hasHydrated) return;
    const toSave = products.filter(p => !p.isPlaceholder);
    if (toSave.length === 0) return; // nothing real to auto-save
    fetch("/api/board", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ products: toSave }),
    }).catch(e => console.warn("Auto-save failed", e));
  }, [products, hasHydrated]);

  const handleRemove = (id) => {
    setProducts(prev => {
      const next = prev.filter(p => p.id !== id);
      // Return empty array so the next effect can handle reset
      return next;
    });
    setCompareIds(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  // When all real products are removed, reset to placeholder state
  useEffect(() => {
    if (!hasHydrated) return;
    const realProducts = products.filter(p => !p.isPlaceholder);
    if (realProducts.length === 0 && isImported) {
      setIsImported(false);
      setProducts(PLACEHOLDER_PRODUCTS);
    }
  }, [products, hasHydrated]);

  /* ── AI Model Change ── */
  const handleModelChange = async (e) => {
    const val = e.target.value;
    if (!val) return;
    const [provider, model] = val.split("|");
    try {
      const res = await fetch("/api/ai/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        // Send provider to update the activeProvider and specific model
        body: JSON.stringify({ activeProvider: provider, provider: provider, model: model }),
      });
      const d = await res.json();
      setAiData(prev => ({ ...prev, config: d.config }));
    } catch (err) {
      console.error("Failed to change AI model", err);
    }
  };

  /* ── Import handlers ── */
  const handleFile = e => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const normalized = parseAndNormalize(ev.target.result);
        if (!normalized.length) throw new Error("No valid products found in file.");
        setProducts(normalized);
        setIsImported(true);
        setImportError("");
      } catch (err) {
        setImportError(`❌ ${err.message || "Invalid JSON file."}`);
      }
    };
    reader.readAsText(file);
  };

  const handleImageFile = e => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setIsAnalyzingImage(true);
    const reader = new FileReader();
    reader.onload = async ev => {
      try {
        const base64Data = ev.target.result.split(",")[1];
        if (!base64Data) throw new Error("Could not parse image data.");
        const res = await fetch("/api/ai/analyze-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageBase64: base64Data, mimeType: file.type }),
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        const newProducts = parseAndNormalize(data.result);
        if (!newProducts.length) throw new Error("AI did not return a valid product array.");
        setProducts(prev => isImported ? [...newProducts, ...prev] : newProducts);
        setIsImported(true);
        setImportError("");
      } catch (err) {
        setImportError(`❌ AI Analysis Error: ${err.message}`);
      } finally {
        setIsAnalyzingImage(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePasteText = () => {
    if (!pasteText.trim()) return;
    try {
      const normalized = parseAndNormalize(pasteText);
      if (!normalized.length) throw new Error("No valid products found in pasted JSON.");
      // Always merge with existing REAL products (strip placeholders, then append new)
      setProducts(prev => {
        const existingReal = prev.filter(p => !p.isPlaceholder);
        // Avoid duplicates by id
        const newIds = new Set(normalized.map(p => p.id));
        const deduped = existingReal.filter(p => !newIds.has(p.id));
        return [...normalized, ...deduped];
      });
      setIsImported(true);
      setImportError("");
      setPasteOpen(false);
      setPasteText("");
    } catch (err) {
      setImportError(`❌ ${err.message || "Invalid JSON. Check your format and try again."}`);
      setPasteOpen(false);
    }
  };

  const reset = () => {
    setProducts(PLACEHOLDER_PRODUCTS);
    setIsImported(false);
    setImportError("");
    setSearch("");
    setFilters({ favorite: false, hot: false, pinned: false, highMargin: false });
    setCompareIds(new Set());
    setCompareMode(false);
  };

  /* ── Save board to data/board.json (always overwrites same file) ── */
  const handleSaveToFile = async () => {
    const realProducts = products.filter(p => !p.isPlaceholder);
    if (!realProducts.length) return;
    setSaveStatus("saving");
    try {
      const res = await fetch("/api/board", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ products: realProducts }),
      });
      if (!res.ok) throw new Error("Save failed");
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus(""), 2500);
    } catch (e) {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus(""), 3000);
    }
  };

  /* ── Compare helpers ── */
  const toggleCompare = id => {
    setCompareIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else if (next.size < 5) next.add(id);
      return next;
    });
  };

  /* ── Filter + Sort ── */
  const visible = useMemo(() => {
    let list = [...products];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        (p.name || "").toLowerCase().includes(q) ||
        (p.category || "").toLowerCase().includes(q) ||
        (p.source || "").toLowerCase().includes(q) ||
        (p.status || "").toLowerCase().includes(q) ||
        (p.supplier?.name || "").toLowerCase().includes(q)
      );
    }
    if (filters.favorite) list = list.filter(p => p.favorite);
    if (filters.hot) list = list.filter(p => p.hot);
    if (filters.pinned) list = list.filter(p => p.pinned);
    if (filters.highMargin) list = list.filter(p => p.highMargin);

    list.sort((a, b) => {
      if (sortBy === "score") return getScore(b) - getScore(a);
      if (sortBy === "demand") return getDemand(b) - getDemand(a);
      if (sortBy === "profit") return getProfit(b) - getProfit(a);
      if (sortBy === "margin") return getMargin(b) - getMargin(a);
      if (sortBy === "price") return ((b.financials?.sellingPrice ?? b.sellingPrice ?? 0)) - ((a.financials?.sellingPrice ?? a.sellingPrice ?? 0));
      if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0);
      return (a.name || "").localeCompare(b.name || "");
    });
    // Pinned first
    list.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
    return list;
  }, [products, search, filters, sortBy]);

  const toggleFilter = key => setFilters(f => ({ ...f, [key]: !f[key] }));

  const compareProducts = products.filter(p => compareIds.has(p.id));

  /* ── Stats ── */
  const stats = useMemo(() => {
    if (!isImported) return null;
    const avgScore = products.length
      ? Math.round(products.reduce((s, p) => s + getScore(p), 0) / products.length)
      : 0;
    const strongCount = products.filter(p => getScore(p) >= 75).length;
    const favCount = products.filter(p => p.favorite).length;
    const hotCount = products.filter(p => p.hot).length;
    return { total: products.length, avgScore, strongCount, favCount, hotCount };
  }, [products, isImported]);

  // Show Ad Testing Dashboard full-screen
  if (adTestingOpen) {
    return <AdTestingDashboard products={products} onBack={() => setAdTestingOpen(false)} />;
  }

  return (
    <div className="content-wrap">
      {/* ── Premium Green Header ── */}
      <div style={{ 
        background: "linear-gradient(135deg, #064e3b, #047857)", 
        borderRadius: 16, 
        padding: "24px 32px", 
        marginBottom: 24, 
        color: "#fff",
        boxShadow: "0 10px 25px -5px rgba(4, 120, 87, 0.4)" 
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div>
            <h1 style={{ margin: "0 0 8px", display: "flex", alignItems: "center", gap: 12, fontSize: 32, fontWeight: 800, letterSpacing: "-0.5px" }}>
              <span style={{ fontSize: 36, filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))" }}>🇩🇿</span>
              <span>Algeria Product Board</span>
            </h1>
            <p style={{ margin: 0, fontSize: 14, color: "#a7f3d0", fontWeight: 500, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: "#34d399", boxShadow: "0 0 8px #34d399" }}></span>
              {isImported
                ? `${products.length} product${products.length !== 1 ? "s" : ""} imported · ${visible.length} shown`
                : "Import a JSON file to populate the board with your product research data."}
            </p>
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            {aiData && (
              <select
                value={`${aiData.config.activeProvider}|${aiData.config.model}`}
                onChange={handleModelChange}
                style={{
                  background: "rgba(255,255,255,0.1)", color: "#e2e8f0", border: "1px solid rgba(255,255,255,0.2)",
                  padding: "9px 12px", borderRadius: 10, fontWeight: 600, fontSize: 13, cursor: "pointer", backdropFilter: "blur(4px)",
                  outline: "none", maxWidth: 160, textOverflow: "ellipsis"
                }}
                title="Change AI Model"
              >
                {Object.entries(aiData.providers).map(([pKey, pDef]) => (
                  <optgroup key={pKey} label={pKey.toUpperCase()} style={{ color: "#000" }}>
                    {pDef.models.map(m => (
                      <option key={`${pKey}|${m}`} value={`${pKey}|${m}`}>
                        {m}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            )}
            {/* 🎯 Ad Testing Groups button — only when real products imported */}
            {isImported && products.filter(p => !p.isPlaceholder).length >= 2 && (
              <button
                onClick={() => setAdTestingOpen(true)}
                style={{
                  background: "linear-gradient(135deg, #6366f1, #4f46e5)",
                  color: "#fff", border: "none", padding: "10px 18px", borderRadius: 10,
                  fontWeight: 800, fontSize: 13, cursor: "pointer",
                  boxShadow: "0 4px 14px rgba(99,102,241,0.45)",
                  display: "flex", alignItems: "center", gap: 7, transition: "0.2s",
                }}
                onMouseEnter={e => e.currentTarget.style.transform = "translateY(-1px)"}
                onMouseLeave={e => e.currentTarget.style.transform = "none"}
              >
                🎯 Ad Testing Groups
              </button>
            )}
            {compareMode && compareIds.size > 0 && (
              <button
                onClick={() => setCompareOpen(true)}
                style={{ background: "#f59e0b", color: "#fff", border: "none", padding: "10px 16px", borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: "pointer", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}
              >
                ⚖️ Compare ({compareIds.size})
              </button>
            )}
            <button
              onClick={() => { setCompareMode(v => !v); if (compareMode) setCompareIds(new Set()); }}
              style={{ background: compareMode ? "#10b981" : "rgba(255,255,255,0.15)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", padding: "10px 16px", borderRadius: 10, fontWeight: 600, fontSize: 13, cursor: "pointer", backdropFilter: "blur(4px)", transition: "0.2s" }}
            >
              {compareMode ? "✓ Compare Mode ON" : "⚖️ Compare"}
            </button>
            <button
              onClick={() => imageFileRef.current?.click()}
              disabled={isAnalyzingImage}
              style={{ background: "rgba(255,255,255,0.15)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", padding: "10px 16px", borderRadius: 10, fontWeight: 600, fontSize: 13, cursor: "pointer", backdropFilter: "blur(4px)", transition: "0.2s", opacity: isAnalyzingImage ? 0.7 : 1 }}
            >
              {isAnalyzingImage ? "Analyzing…" : "📸 Add by Image"}
            </button>
            <button
              onClick={() => fileRef.current?.click()}
              style={{ background: "#fff", color: "#064e3b", border: "none", padding: "10px 20px", borderRadius: 10, fontWeight: 800, fontSize: 13, cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}
            >
              ⬆ Upload JSON
            </button>
            <button
              onClick={() => setPasteOpen(true)}
              style={{ background: "rgba(255,255,255,0.15)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", padding: "10px 16px", borderRadius: 10, fontWeight: 600, fontSize: 13, cursor: "pointer", backdropFilter: "blur(4px)", transition: "0.2s" }}
            >
              📋 Paste JSON
            </button>
            {isImported && (
              <button
                onClick={handleSaveToFile}
                disabled={saveStatus === "saving"}
                title="Save all products to data/board.json inside the project (overwrites same file)"
                style={{
                  background: saveStatus === "saved" ? "linear-gradient(135deg,#16a34a,#15803d)"
                    : saveStatus === "error" ? "linear-gradient(135deg,#dc2626,#b91c1c)"
                    : "linear-gradient(135deg, #ffd700, #f59e0b)",
                  color: saveStatus === "saved" || saveStatus === "error" ? "#fff" : "#1a1a00",
                  border: "none", padding: "10px 18px", borderRadius: 10, fontWeight: 800, fontSize: 13,
                  cursor: saveStatus === "saving" ? "wait" : "pointer",
                  boxShadow: "0 4px 12px rgba(245,158,11,0.4)",
                  display: "flex", alignItems: "center", gap: 6, transition: "all 0.3s",
                  minWidth: 140, justifyContent: "center",
                }}
                onMouseEnter={e => { if (saveStatus !== "saving") e.currentTarget.style.transform = "translateY(-1px)"; }}
                onMouseLeave={e => e.currentTarget.style.transform = "none"}
              >
                {saveStatus === "saving" ? "⏳ Saving…"
                  : saveStatus === "saved" ? "✅ Saved!"
                  : saveStatus === "error" ? "❌ Error"
                  : "💾 Save to File"}
              </button>
            )}
            {isImported && (
              <button 
                onClick={reset}
                style={{ background: "rgba(239,68,68,0.2)", color: "#fca5a5", border: "1px solid rgba(239,68,68,0.3)", padding: "10px 16px", borderRadius: 10, fontWeight: 600, fontSize: 13, cursor: "pointer", transition: "0.2s" }}
              >
                ↩ Reset
              </button>
            )}
            <input ref={fileRef} type="file" accept=".json" style={{ display: "none" }} onChange={handleFile} />
            <input ref={imageFileRef} type="file" accept="image/png,image/jpeg,image/jpg,image/webp" style={{ display: "none" }} onChange={handleImageFile} />
          </div>
        </div>

        {/* ── Stats Row ── */}
        {isImported && stats && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 12, marginTop: 24, paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
            {[
              { label: "Total", value: stats.total, color: "#fff" },
              { label: "Avg Score", value: stats.avgScore, color: "#a7f3d0" },
              { label: "🟢 Strong", value: stats.strongCount, color: "#34d399" },
              { label: "★ Saved", value: stats.favCount, color: "#fcd34d" },
              { label: "🔥 Hot", value: stats.hotCount, color: "#fca5a5" },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ background: "rgba(0,0,0,0.2)", borderRadius: 12, padding: "12px 16px", border: "1px solid rgba(255,255,255,0.05)", backdropFilter: "blur(4px)" }}>
                <div style={{ fontSize: 28, fontWeight: 900, color, letterSpacing: -0.5, lineHeight: 1 }}>{value}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", fontWeight: 700, marginTop: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Errors / Messages ── */}
      {importError && (
        <div style={{ marginBottom: 20, padding: "10px 16px", background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: 8, fontSize: 13, color: "#dc2626", fontWeight: 600 }}>
          {importError}
        </div>
      )}
      {!isImported && (
        <div style={{ marginBottom: 20, padding: "12px 16px", background: "var(--surface-2)", border: "1px dashed var(--border-strong)", borderRadius: 8, fontSize: 13, color: "var(--muted)" }}>
          💡 Showing sample cards. Click <strong>UPLOAD JSON</strong> or <strong>PASTE JSON</strong> to import your real product data.
        </div>
      )}

      {/* ── Toolbar (Filters & Sort) ── */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20, alignItems: "center" }}>
        <div style={{ position: "relative", flex: "0 0 auto", minWidth: 220 }}>
          <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontSize: 14, color: "var(--muted)", pointerEvents: "none" }}>🔍</span>
          <input
            className="input"
            style={{ paddingLeft: 32, fontSize: 13 }}
            placeholder="Search products…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {FILTER_BTNS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => toggleFilter(key)}
            style={{
              fontSize: 12.5, fontWeight: 700, padding: "7px 14px", borderRadius: 999,
              border: `1.5px solid ${filters[key] ? "var(--primary)" : "var(--border)"}`,
              background: filters[key] ? "var(--primary)" : "transparent",
              color: filters[key] ? "#fff" : "var(--muted)",
              cursor: "pointer", transition: "all 0.12s",
            }}
          >{label}</button>
        ))}

        <select
          className="select"
          style={{ fontSize: 12.5, marginLeft: "auto", maxWidth: 200 }}
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
        >
          {SORT_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* ── Compare Mode Banner ── */}
      {compareMode && (
        <div style={{ marginBottom: 16, padding: "10px 16px", background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.25)", borderRadius: 10, display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "#6366f1", fontWeight: 600 }}>
          <span>⚖️</span>
          <span>Compare mode active — select up to 5 products using the checkboxes on each card.</span>
          {compareIds.size > 0 && (
            <span style={{ marginLeft: "auto", background: "#6366f1", color: "#fff", borderRadius: 999, padding: "3px 12px", fontSize: 12, fontWeight: 800 }}>
              {compareIds.size} selected
            </span>
          )}
        </div>
      )}

      {/* ── Grid ── */}
      {visible.length === 0 ? (
        <div className="card empty">
          <div className="empty-icon">🔍</div>
          <h3>No products match your filters</h3>
          <p className="muted">Try adjusting your search or filter settings.</p>
          <button className="btn" onClick={() => { setSearch(""); setFilters({ favorite: false, hot: false, pinned: false, highMargin: false }); }}>
            Clear filters
          </button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
          {visible.map(p => (
            <ProductCard
              key={p.id}
              p={p}
              onClick={() => setSelected(p)}
              compareMode={compareMode}
              isSelected={compareIds.has(p.id)}
              onToggleCompare={() => toggleCompare(p.id)}
              onRemove={() => handleRemove(p.id)}
            />
          ))}
        </div>
      )}

      {/* ── Detail Modal ── */}
      {selected && (
        <ProductDetailModal
          p={selected}
          onClose={() => setSelected(null)}
          onUpdate={updated => {
            setSelected(updated);
            setProducts(products.map(x => x.id === updated.id ? updated : x));
          }}
        />
      )}

      {/* ── Compare Modal ── */}
      {compareOpen && compareProducts.length > 0 && (
        <CompareModal
          products={compareProducts}
          onClose={() => setCompareOpen(false)}
        />
      )}

      {/* ── Paste JSON Modal ── */}
      {pasteOpen && (
        <div
          onClick={e => e.target === e.currentTarget && setPasteOpen(false)}
          style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
        >
          <div style={{ background: "var(--surface)", borderRadius: 16, width: "100%", maxWidth: 600, boxShadow: "var(--shadow-lg)", border: "1px solid var(--border)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>📋 Paste JSON</h2>
              <button onClick={() => setPasteOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: "var(--muted)" }}>×</button>
            </div>
            <div style={{ padding: "20px 24px" }}>
              <p style={{ margin: "0 0 12px", fontSize: 13, color: "var(--muted)" }}>
                Paste a JSON array of product objects. All fields are optional — the card handles missing data gracefully.
              </p>
              <textarea
                className="textarea"
                style={{ width: "100%", height: 260, fontSize: 12.5, fontFamily: "var(--mono)", padding: 12, resize: "vertical" }}
                placeholder={'[\n  {\n    "name": "My Product",\n    "source": "AliExpress",\n    "financials": { "supplierPrice": 10, "sellingPrice": 40 },\n    "algeria": { "overallScore": 78, "codSuitable": true }\n  }\n]'}
                value={pasteText}
                onChange={e => setPasteText(e.target.value)}
              />
            </div>
            <div style={{ padding: "16px 24px", background: "var(--surface-2)", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button className="btn" onClick={() => setPasteOpen(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handlePasteText} disabled={!pasteText.trim()}>Load JSON</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
