import { NextResponse } from "next/server";
import { getSectionConfig } from "@/lib/sectionConfig";
import { getProduct, getSection, saveSection, getSettings, recomputeProjectStatus } from "@/lib/db";
import { getInternalConfig, resolveApiKey } from "@/lib/ai/config";
import { buildProvider, friendlyError } from "@/lib/ai/providers";
import { estimateCostUsd } from "@/lib/ai/cost";
import { buildMessages } from "@/lib/prompts";
import { buildRelevantContext } from "@/lib/context";
import { validateSectionResult, extractJson } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const REGENERATE_DIRECTIVES = {
  everything: "Regenerate everything from scratch, keeping the same structure but with fresh, higher-quality thinking.",
  quality: "Improve the quality: tighten reasoning, remove fluff, sharpen every recommendation.",
  detailed: "Make it more detailed and comprehensive. Expand every item with more depth.",
  persuasive: "Make it more persuasive and conversion-focused. Strengthen psychological triggers.",
  local: "Make it more local and culturally specific to the target country and market.",
  tone: "Change the tone to better match the target audience and the product's premium positioning.",
  audience: "Change the target audience focus based on the target audience data.",
};

function resolveModel(num) {
  const cfg = getInternalConfig();
  if (cfg.modelScope === "per_section" && cfg.perSectionModels?.[num]) {
    return cfg.perSectionModels[num];
  }
  return cfg.model;
}

export async function POST(req, { params }) {
  const { id } = params;
  const num = Number(params.num);
  const body = await req.json().catch(() => ({}));

  const sectionCfg = getSectionConfig(num);
  if (!sectionCfg) return NextResponse.json({ error: "Unknown section" }, { status: 404 });

  const product = getProduct(id);
  if (!product?.name) {
    return NextResponse.json(
      { error: "Add your product information on the Product Setup page before running AI analysis.", code: "needs_product", needsProduct: true, projectId: id },
      { status: 400 }
    );
  }

  // ── AI config preflight ──
  const cfg = getInternalConfig();
  const apiKey = resolveApiKey(cfg.provider);
  if (!apiKey) {
    return NextResponse.json(
      { error: "No API key configured. Open AI Parameters to set your key, or add it to your .env file.", code: "config_error" },
      { status: 400 }
    );
  }

  const model = resolveModel(num);
  const settings = getSettings();

  // ── Regeneration directive ──
  let regenerate = "";
  if (body.regenerate) {
    if (typeof body.regenerate === "string") {
      regenerate = body.regenerate; // "Use custom instructions"/freeform
    } else if (body.regenerate.mode) {
      regenerate = REGENERATE_DIRECTIVES[body.regenerate.mode] || "";
      if (body.regenerate.custom) regenerate += `\nCustom instruction: ${body.regenerate.custom}`;
    }
  }

  const customInstructions = body.customInstructions ?? getSection(id, num).customInstructions ?? "";

  // ── Live web research flag ──
  const liveWeb = body.liveWebResearch ?? settings.liveWebResearch;
  let webInstruction = "";
  if (liveWeb) {
    webInstruction =
      `\n\nLIVE WEB RESEARCH MODE: this section should prefer real, verifiable market information where possible. ` +
      `Use well-known real brands/competitors/websites when confident they exist. ` +
      `For each researched claim you are confident is real, list it as a source under a "SOURCES_" marker like: ` +
      `[SOURCE] name | url | claim` +
      `\nIf you are not fully certain a fact is real, label it "AI analysis / hypothesis". Never fabricate URLs.`;
    if (sectionCfg.num === 2 || sectionCfg.num === 15) webInstruction += ` Research at least 10 real brands for this space.`;
  }

  const relevantContext = buildRelevantContext(id, num);

  const messages = buildMessages({
    num,
    product,
    relatedContext: relevantContext + webInstruction,
    customInstructions,
    language: settings.language,
    regenerate,
    systemPrompt: cfg.systemPrompt,
    url: product.url || undefined,
  });

  // ── Run the provider ──
  const startedAt = Date.now();
  let result;
  try {
    const provider = buildProvider(cfg.provider, { apiKey, baseUrl: cfg.baseUrl });
    result = await provider.chat({
      messages,
      model,
      temperature: cfg.temperature,
      maxTokens: cfg.maxTokens,
      topP: cfg.topP,
      timeout: cfg.timeout,
      systemPrompt: cfg.systemPrompt || undefined,
    });
  } catch (err) {
    const code = err.code || "provider_error";
    return NextResponse.json(
      { error: friendlyError(code), code, detail: err.detail || err.message },
      { status: err.status || 502 }
    );
  }

  const elapsed = Date.now() - startedAt;
  const cost = estimateCostUsd(model, result.inputTokens || 0, result.outputTokens || 0);
  const costRecord = {
    model,
    provider: cfg.provider,
    inputTokens: result.inputTokens || 0,
    outputTokens: result.outputTokens || 0,
    usd: cost.usd,
    elapsedMs: elapsed,
    at: Date.now(),
  };

  // ── Parse structured sections ──
  let parsed = null;
  let format = "text";
  if (sectionCfg.jsonMode) {
    const { ok, data } = extractJson(result.content);
    if (ok) {
      parsed = data;
      format = "json";
    }
  }

  // ── Extract sources from output ──
  const sources = extractSources(result.content, product.url);

  // ── Validate ──
  const validation = validateSectionResult({
    num,
    result: result.content,
    product,
    language: settings.language,
  });

  const patch = {
    result: result.content,
    rawResponse: result.content,
    parsed,
    format,
    model,
    sources,
    cost: costRecord,
    validation,
    qualityScore: validation.score,
    status: validation.isValid ? "completed" : "in_progress",
    customInstructions,
    regenerations: (getSection(id, num).regenerations || 0) + (regenerate ? 1 : 0),
    error: "",
    updatedAt: Date.now(),
  };

  const section = saveSection(id, num, patch);
  recomputeProjectStatus(id);

  return NextResponse.json({
    section: publicSection(section),
    validation,
    cost: costRecord,
    message: validation.isValid
      ? `Section ${num} generated successfully.`
      : "Output does not meet the minimum requirements. Review and regenerate.",
  });
}

function publicSection(section) {
  const { rawResponse, ...rest } = section;
  return { ...rest };
}

function extractSources(content, fallbackUrl) {
  const sources = [];
  const re = /\[SOURCE\]\s*(.+?)\s*\|\s*(https?:\/\/\S+|not available)\s*\|\s*(.+)/gi;
  let m;
  while ((m = re.exec(content)) !== null) {
    sources.push({ name: m[1].trim(), url: m[2].trim(), claim: m[3].trim(), accessedAt: new Date().toISOString() });
  }
  return sources;
}