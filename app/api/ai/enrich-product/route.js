import { NextResponse } from "next/server";
import { getInternalConfig, resolveApiKey } from "@/lib/ai/config";
import { buildProvider, friendlyError } from "@/lib/ai/providers";

export async function POST(req) {
  const cfg = getInternalConfig();
  const body = await req.json().catch(() => ({}));
  
  const apiKey = resolveApiKey(cfg.provider);
  if (!apiKey) {
    return NextResponse.json({ error: "No API key provided. Please configure AI settings first." }, { status: 400 });
  }

  const provider = buildProvider(cfg.provider, { apiKey, baseUrl: cfg.baseUrl });
  const product = body.product || {};
  
  if (!product.name) {
    return NextResponse.json({ error: "Product name is required." }, { status: 400 });
  }

  const prompt = `Act as an expert ecommerce product researcher. 
I am researching the following product:
Name: ${product.name}
Category: ${product.category || "Unknown"}
Source: ${product.source || "Unknown"} ${product.country ? `(${product.country})` : ""}
Price: ${product.sellingPrice ? `$${product.sellingPrice}` : "Unknown"}
Cost: ${product.costPrice ? `$${product.costPrice}` : "Unknown"}

Please provide a highly concise, bulleted research summary that includes:
- Main benefits & selling points
- Target audience (demographics/psychographics)
- Potential marketing angles
- Suggested competitors or complementary products to look at

Format your output as clean, semantic HTML (using <ul>, <li>, <strong>, <h4>) so I can embed it directly into my notes panel. Do not use Markdown syntax, ONLY HTML. Do NOT include html/body tags, just the inner content. Do not include introductory text.`;

  try {
    const res = await provider.chat({
      messages: [{ role: "user", content: prompt }],
      model: cfg.model,
      temperature: 0.7,
      maxTokens: 1500,
      topP: 1,
      timeout: 60,
    });
    
    return NextResponse.json({ result: res.text || "" });
  } catch (e) {
    console.error("AI Enrich Error:", e);
    return NextResponse.json({ error: friendlyError(e) }, { status: 500 });
  }
}
