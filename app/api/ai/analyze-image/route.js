import { NextResponse } from "next/server";
import { getInternalConfig, resolveApiKey } from "@/lib/ai/config";
import { buildProvider, friendlyError } from "@/lib/ai/providers";

const SYSTEM_PROMPT = `I will attach a photo of a product. Your task is to analyze the image and research the product thoroughly.

### 1. IDENTIFY THE PRODUCT
From the uploaded image, determine:
* What the product is
* The most likely exact product name
* Product type
* Main category
* Subcategory
* Niche
* Micro-niche
* Target customer/audience
* Main use case/problem it solves
* Key visible features
* Brand, if identifiable
* Model/version, if identifiable
* Product style/type/variant
* Any important attributes visible in the image (material, color, size, design, compatibility, etc.)
Do NOT guess a brand or model unless there is reasonable evidence.

### 2. FIND THE SOURCE PRODUCT
Search the web to find the closest matching product listing from AliExpress, Temu, Alibaba, 1688, DHgate, CJdropshipping, or other reliable supplier.
Prioritize the listing that appears to be the SAME product shown in the uploaded image, not merely a similar product.
Find: Source marketplace, Supplier/store name, Exact product title, Product URL, Product image URL, Current/representative product price, Rating, Number of reviews/orders if visible, Available colors/variants if visible, Shipping information if visible, Any useful supplier information.
If multiple listings exist, select the BEST and most confident match.

### 3. PRODUCT CLASSIFICATION
Determine the product's commercial classification: Category, Subcategory, Niche, Micro-niche, Product type, Target audience, Primary use case, Secondary use cases, Main problem solved, Key selling points, Key product features, Potential ecommerce keywords/tags.

### 4. PRODUCT / MARKETPLACE INFORMATION
Return the following researched information whenever available: Source marketplace, Supplier/store, Product title, Product price, Currency, Rating, Review count, Order/sales count, Shipping cost, Main product image, Product listing URL, Supplier URL if different, Product variants, Country/region of supplier if visible.
Never invent missing information. Use 0 or an empty value when information cannot be verified.

### 5. OUTPUT
Output ONE JSON array containing ONE product object.
Do NOT output markdown. Do NOT output explanations. Do NOT output anything before or after the JSON.
The output must match this structure:

[
{
"id": "<source>_<unique_number_or_slug>",
"name": "<exact or best-match product title>",
"status": "New",
"category": "<main product category>",
"subcategory": "<product subcategory>",
"niche": "<specific niche>",
"microNiche": "<specific micro-niche>",
"productType": "<product type>",
"targetAudience": "<target customer>",
"useCase": "<primary use case>",
"problemSolved": "<main problem the product solves>",
"source": "<marketplace/source name>",
"country": "USA",
"supplier": {
  "name": "<supplier/store name>",
  "rating": <rating or 0>,
  "reliabilityScore": 80,
  "storeAge": "1 Year",
  "orders": <orderCount>,
  "shippingTime": "10-15 days",
  "processingTime": "72 hours",
  "moq": 1,
  "location": "<country/region>"
},
"financials": {
  "sellingPrice": <sellingPrice>,
  "costPrice": <verified supplier price or 0>,
  "shippingCost": <shipping cost or 0>,
  "roi": 0,
  "breakEvenPrice": 0
},
"opportunity": {
  "overallScore": 80,
  "demand": 80,
  "competition": 50,
  "margin": 80,
  "supplier": 80,
  "trend": 80
},
"competitors": [],
"intelligence": {
  "demandLevel": "MEDIUM",
  "competitionLevel": "MEDIUM",
  "trendDirection": "FLAT",
  "seasonality": "YEAR ROUND",
  "impulseBuy": "MEDIUM",
  "targetCustomer": "<target customer>"
},
"details": {
  "material": "",
  "weight": "",
  "dimensions": "",
  "colorVariants": []
},
"aiAnalysis": {
  "whySell": ["<selling point 1>", "<selling point 2>"],
  "risks": ["<risk 1>"],
  "marketingAngle": "<angle>",
  "suggestedPrice": "<price>",
  "adScore": 8.0
},
"structuredNotes": {
  "supplierNotes": "",
  "pricingNotes": "",
  "competitionNotes": "",
  "aiNotes": ""
},
"checklist": [
  { "text": "Analyze ad creative angles", "done": false },
  { "text": "Find product supplier on AliExpress", "done": false },
  { "text": "Check competitor store pricing", "done": false }
],
"timeline": [
  { "type": "Discovered", "text": "Identified from uploaded product photo", "date": 1725220000000 }
],
"links": {
  "productLink": "<best matching product listing URL or empty>",
  "supplierLink": "<supplier URL or empty>",
  "facebookAd": "",
  "tiktok": "",
  "landingPage": ""
},
"mainImage": "<main product image URL from the listing or empty>",
"gallery": [],
"favorite": false,
"pinned": false,
"hot": false,
"highMargin": false,
"colorLabel": "#6366f1",
"rating": <rating or 0>,
"isPlaceholder": false
}
]

### 6. IMPORTANT RULES
* The uploaded image is the primary reference for identifying the product.
* Match the IMAGE to the listing, not just the product name.
* Prefer exact matches over visually similar products.
* Do not invent URLs. Do not invent supplier names, prices, ratings, review counts, or order counts.
* If no confident product listing is found, leave URL fields empty.
* Return ONLY the JSON array.`;

export async function POST(req) {
  const cfg = getInternalConfig();
  const body = await req.json().catch(() => ({}));
  
  const apiKey = resolveApiKey(cfg.provider);
  if (!apiKey) {
    return NextResponse.json({ error: "No API key provided. Please configure AI settings first." }, { status: 400 });
  }

  const { imageBase64, mimeType } = body;
  
  if (!imageBase64) {
    return NextResponse.json({ error: "Image data is required." }, { status: 400 });
  }

  const provider = buildProvider(cfg.provider, { apiKey, baseUrl: cfg.baseUrl });

  // Build the message payload depending on the provider.
  let content = [];
  
  if (cfg.provider === "anthropic") {
    // Anthropic vision format
    content = [
      { type: "text", text: "Please analyze the attached product image and output the requested JSON." },
      { 
        type: "image", 
        source: { 
          type: "base64", 
          media_type: mimeType || "image/jpeg", 
          data: imageBase64 
        } 
      }
    ];
  } else if (cfg.provider === "gemini") {
    // Gemini vision format
    content = [
      { text: "Please analyze the attached product image and output the requested JSON." },
      {
        inlineData: {
          mimeType: mimeType || "image/jpeg",
          data: imageBase64
        }
      }
    ];
  } else {
    // OpenAI / OpenRouter standard vision format
    content = [
      { type: "text", text: "Please analyze the attached product image and output the requested JSON." },
      {
        type: "image_url",
        image_url: {
          url: `data:${mimeType || "image/jpeg"};base64,${imageBase64}`
        }
      }
    ];
  }

  try {
    const res = await provider.chat({
      messages: [{ role: "user", content }],
      model: cfg.model,
      temperature: 0.1, // Low temperature for consistent JSON
      maxTokens: 3000,
      systemPrompt: SYSTEM_PROMPT,
      timeout: 120, // Vision + web search takes longer
    });
    
    // Clean up any markdown blocks around the JSON
    let result = res.content || "";
    result = result.replace(/^```(json)?/, "").replace(/```$/, "").trim();

    // Verify it's parseable JSON
    try {
      JSON.parse(result);
    } catch (e) {
      console.error("AI returned invalid JSON:", result);
      return NextResponse.json({ error: "AI did not return a valid JSON array." }, { status: 500 });
    }

    return NextResponse.json({ result });
  } catch (e) {
    console.error("AI Analyze Image Error:", e);
    return NextResponse.json({ error: friendlyError(e.code) || e.message }, { status: 500 });
  }
}
