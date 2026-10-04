import { NextResponse } from "next/server";
import { getInternalConfig, resolveApiKey } from "@/lib/ai/config";
import { buildProvider, friendlyError } from "@/lib/ai/providers";

export async function POST(req) {
  const cfg = getInternalConfig();
  const body = await req.json().catch(() => ({}));

  const apiKey = resolveApiKey(cfg.provider);
  if (!apiKey) {
    return NextResponse.json(
      { error: "No API key configured. Please open AI Parameters and add your API key." },
      { status: 400 }
    );
  }

  const { products, groupSize } = body;
  if (!Array.isArray(products) || products.length === 0) {
    return NextResponse.json({ error: "No products provided." }, { status: 400 });
  }

  const size = Math.max(1, Math.min(20, parseInt(groupSize) || 3));

  // Compact summary — avoid sending huge JSON to the AI
  const productSummary = products.map((p) => ({
    id: p.id,
    name: p.name || "Unknown",
    category: p.category || "",
    subcategory: p.subcategory || "",
    niche: p.niche || p.subcategory || p.category || "",
    targetAudience: p.algeria?.targetAudience || p.targetAudience?.customerType || "",
    mainBuyReason: p.algeria?.mainBuyReason || "",
    marketingAngle: p.aiAnalysis?.marketingAngle || "",
    verdict: p.algeria?.verdict || "",
    score: p.algeria?.overallScore ?? p.opportunity?.overallScore ?? 0,
    adScore: p.winningMetrics?.videoAdPotential ?? p.winningMetrics?.facebookAdPotential ?? p.aiAnalysis?.adScore ?? 0,
    profitMargin: p.financials?.profitMarginPct ?? 0,
  }));

  const prompt = `You are a Facebook ads expert for the Algerian dropshipping market.

I have ${products.length} products. Group them into groups of EXACTLY ${size} products each (last group may have fewer if not divisible).

Products:
${JSON.stringify(productSummary, null, 2)}

Rules:
- Group products by SAME niche, audience, or buyer psychology
- Products in the same group can be tested under ONE Facebook campaign (same targeting)
- Sort groups: highest testing priority first (best scores + most potential)
- Ensure testingStrategy is UNIQUE and highly tailored for each group. Do NOT output the same generic strategy.
- Return ONLY a valid JSON array, no markdown, no explanation

JSON structure:
[
  {
    "groupNumber": 1,
    "nicheName": "Short niche name",
    "emoji": "🏠",
    "targetAudience": "Who to target on FB",
    "sharedAngle": "One ad angle for all products",
    "fbInterests": ["interest1", "interest2", "interest3"],
    "testingPriority": "HIGH",
    "priorityReason": "Why test this group first",
    "adBudgetSuggestion": "300-500 DA/day per ad set",
    "testDuration": "3-5 days",
    "winnerCriteria": "ROAS > 2, CPP < 800 DA",
    "testingStrategy": "A unique, detailed testing strategy tailored specifically for this niche and these products.",
    "campaignStructure": {
      "campaignName": "ABO - [Niche] Test",
      "objective": "Conversions",
      "adSets": [
        {
          "name": "AdSet: [Product Name]",
          "targeting": "Algeria, 18-40, [Interest]",
          "budget": "400 DA/day",
          "ads": ["Video Ad - Problem/Solution Hook", "Carousel Ad - Benefits"]
        }
      ]
    },
    "productIds": ["id1", "id2", "id3"]
  }
]`;

  try {
    const provider = buildProvider(cfg.provider, { apiKey, baseUrl: cfg.baseUrl });
    const res = await provider.chat({
      messages: [{ role: "user", content: prompt }],
      model: cfg.model,
      temperature: 0.3,
      maxTokens: 8000, // Force a high token limit to prevent JSON truncation
      systemPrompt: "",
      timeout: cfg.timeout || 90,
    });

    let result = res.content || "";
    
    // Strip <think>...</think> tags and their contents (used by reasoning models like DeepSeek-R1)
    result = result.replace(/<think>[\s\S]*?<\/think>/gi, "");
    // Sometimes the closing tag is missing if truncated, so strip an unclosed <think> tag at the beginning just in case
    result = result.replace(/<think>[\s\S]*/gi, "");

    // Strip markdown code fences if present
    result = result.replace(/^```(?:json)?\s*/gim, "").replace(/```\s*$/gim, "").trim();
    
    // Find boundaries of the JSON array
    const firstBracket = result.indexOf('[');
    let parsed = null;
    
    if (firstBracket !== -1) {
      let cur = result.substring(firstBracket);
      const lastBracket = cur.lastIndexOf(']');
      if (lastBracket !== -1) {
        try { parsed = JSON.parse(cur.substring(0, lastBracket + 1)); } catch (e) {}
      }
      
      // If parsing failed (or no closing bracket), attempt to salvage by finding the last complete object
      if (!parsed) {
        while (cur.length > 0) {
          const lastComma = cur.lastIndexOf('},');
          if (lastComma === -1) break;
          const testStr = cur.substring(0, lastComma + 1) + ']';
          try {
            parsed = JSON.parse(testStr);
            break; // Successfully salvaged!
          } catch (e) {
            cur = cur.substring(0, lastComma);
          }
        }
      }
    }

    if (!parsed) {
      console.error("AI returned invalid JSON:", result.slice(0, 1000));
      return NextResponse.json(
        { error: "AI returned invalid JSON. Try again or reduce the number of products." },
        { status: 500 }
      );
    }

    if (!Array.isArray(parsed)) {
      return NextResponse.json({ error: "AI did not return a valid groups array." }, { status: 500 });
    }

    // Attach full product objects to each group
    const productMap = Object.fromEntries(products.map((p) => [p.id, p]));
    const enrichedGroups = parsed.map((group) => ({
      ...group,
      products: (group.productIds || []).map((id) => productMap[id]).filter(Boolean),
    }));

    return NextResponse.json({ groups: enrichedGroups });
  } catch (e) {
    console.error("Ad Groups API error:", e);
    const msg = e.message || friendlyError(e.code) || "AI request failed.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
