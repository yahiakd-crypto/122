import { NextResponse } from "next/server";
import { getInternalConfig, resolveApiKey } from "@/lib/ai/config";
import { buildProvider } from "@/lib/ai/providers";

/**
 * Generic AI execution endpoint for the Graph Engine.
 * Expects a structured prompt and returns a JSON payload.
 */
export async function POST(req) {
  try {
    const cfg = getInternalConfig();
    const apiKey = resolveApiKey(cfg.provider);
    
    if (!apiKey) {
      return NextResponse.json({ error: "No API key configured." }, { status: 400 });
    }

    const { prompt, skillId, schemaString } = await req.json();

    if (!prompt || !skillId) {
      return NextResponse.json({ error: "Missing prompt or skillId" }, { status: 400 });
    }

    const systemPrompt = schemaString 
      ? `You are a specialized AI E-commerce agent executing the skill: ${skillId}.
You must analyze the provided input and return ONLY a valid JSON object matching the requested schema.
Do NOT wrap your response in markdown blocks like \`\`\`json. Return pure JSON only.

EXPECTED JSON SCHEMA:
${schemaString}`
      : `You are a specialized AI E-commerce agent executing the skill: ${skillId}.
Follow the instructions exactly and return plain text or markdown as requested.`;

    const provider = buildProvider(cfg.provider, { apiKey, baseUrl: cfg.baseUrl });
    
    // Some providers have explicit JSON mode, but for broad compatibility we use a strict system prompt.
    // An advanced version could map cfg.provider to specific JSON mode configurations (e.g. response_format: { type: "json_object" })
    const aiResponse = await provider.chat({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
      model: cfg.model,
      temperature: 0.5, // Lower temperature for more deterministic JSON
      maxTokens: cfg.maxTokens || 12000,
      timeout: cfg.timeout || 90,
    });
    
    let rawContent = aiResponse.content || "";
    
    // Clean up markdown wrapping if the AI ignored the instruction
    rawContent = rawContent.replace(/<think>[\s\S]*?<\/think>/gi, "");
    rawContent = rawContent.replace(/^```json\s*/i, "").replace(/\s*```$/i, "").trim();

    let structuredOutput;
    if (schemaString) {
      const tryParse = (s) => {
        try { return JSON.parse(s); } catch (e) { return null; }
      };
      structuredOutput = tryParse(rawContent);
      if (!structuredOutput) {
        const a = rawContent.indexOf("{");
        const b = rawContent.lastIndexOf("}");
        if (a !== -1 && b > a) structuredOutput = tryParse(rawContent.slice(a, b + 1));
      }
      if (!structuredOutput) {
        console.error("JSON Parse Error:", rawContent.slice(0, 2000));
        return NextResponse.json({ 
          error: "AI returned invalid JSON", 
          rawOutput: rawContent 
        }, { status: 422 });
      }
    } else {
      structuredOutput = rawContent;
    }

    // In a full implementation, we could validate the structuredOutput against Zod here,
    // but the frontend GraphEngine will also perform runtime validation, which gives better UX error handling.

    return NextResponse.json({ 
      success: true, 
      result: structuredOutput 
    });
  } catch (error) {
    console.error("Error in /api/ai/execute-node:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
