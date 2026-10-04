import { NextResponse } from "next/server";
import { getInternalConfig, resolveApiKey } from "@/lib/ai/config";
import { buildProvider } from "@/lib/ai/providers";

export async function POST(req) {
  try {
    const cfg = getInternalConfig();
    const apiKey = resolveApiKey(cfg.provider);
    
    if (!apiKey) {
      return NextResponse.json({ error: "No API key configured." }, { status: 400 });
    }

    const { payload } = await req.json();
    const { niche, audience, angle, products, skillType } = payload;

    if (!skillType) {
      return NextResponse.json({ error: "Missing skill type" }, { status: 400 });
    }

    let prompt = `You are an expert e-commerce and marketing AI. You are working on a product testing group.
Context about the group:
- Niche: ${niche}
- Audience: ${audience}
- Marketing Angle: ${angle}
- Products: ${products}

`;

    switch (skillType) {
      case "brand_colors":
        prompt += `Task: Create a Brand Palette for this group.
Return a markdown format response containing:
1. 3-4 Hex Color codes that fit the niche and audience.
2. A brief explanation of why these colors work.
3. 2 recommended Google Fonts (one for headings, one for body).`;
        break;
      case "logo_design":
        prompt += `Task: Generate a Logo Concept for a store selling these products.
Return a markdown format response containing:
1. The Store Name idea.
2. A description of the logo mark/icon.
3. The layout and typography style of the logo.`;
        break;
      case "buyer_persona":
        prompt += `Task: Create a detailed Buyer Persona for this audience.
Return a markdown format response containing:
1. Demographics (Age, Gender, Location, Income).
2. Psychographics (Interests, Values, Lifestyle).
3. Main pain points and how this product group solves them.
4. Their main objections to buying.`;
        break;
      case "landing_page":
        prompt += `Task: Draft the structure of a high-converting Landing Page for this product group.
Return a markdown format response containing:
1. A strong Hero Headline (H1).
2. A subheadline (H2).
3. 3 Main Benefit bullet points.
4. A Call to Action (CTA) text.`;
        break;
      case "ad_copy":
        prompt += `Task: Write Facebook Ad Copy for this product group.
Return a markdown format response containing:
1. Primary Text (Hook + Body + CTA, use emojis).
2. Headline (Short and punchy).
3. Link Description.`;
        break;
      default:
        prompt += `Task: Provide insights on ${skillType}.`;
    }

    prompt += "\n\nFormat the output neatly using Markdown (bolding, bullet points, etc). Do NOT wrap the entire response in a markdown code block (like ```markdown), just return the raw markdown text.";

    const provider = buildProvider(cfg.provider, { apiKey, baseUrl: cfg.baseUrl });
    const aiResponse = await provider.chat({
      messages: [{ role: "user", content: prompt }],
      model: cfg.model,
      temperature: 0.7,
      maxTokens: 2000,
      timeout: cfg.timeout || 60,
    });
    
    let result = aiResponse.content || "";
    result = result.replace(/<think>[\s\S]*?<\/think>/gi, "");
    result = result.replace(/<think>[\s\S]*/gi, "");

    return NextResponse.json({ result: result.trim() });
  } catch (error) {
    console.error("Error in /api/ai/run-skill:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
