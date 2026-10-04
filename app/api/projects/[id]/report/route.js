import { NextResponse } from "next/server";
import { getProject, getProduct, getReport, saveReport, getAllSections } from "@/lib/db";
import { assembleReport } from "@/lib/export";
import { getInternalConfig, resolveApiKey } from "@/lib/ai/config";
import { buildProvider, friendlyError } from "@/lib/ai/providers";
import { estimateCostUsd } from "@/lib/ai/cost";
import { projectDigest } from "@/lib/context";
import { getSettings } from "@/lib/db";
import { LANGUAGE_LABELS } from "@/lib/sectionConfig";

export async function GET(_req, { params }) {
  return NextResponse.json({ report: getReport(params.id), assembled: assembleReport(params.id) });
}

export async function POST(_req, { params }) {
  const id = params.id;
  const product = getProduct(id);
  const digest = projectDigest(id, 2600);

  const cfg = getInternalConfig();
  const apiKey = resolveApiKey(cfg.provider);
  if (!apiKey) {
    return NextResponse.json({ error: "No API key configured. Open AI Parameters first.", code: "config_error" }, { status: 400 });
  }

  const settings = getSettings();
  const langLabel = LANGUAGE_LABELS[settings.language] || LANGUAGE_LABELS.darja;

  const system = `You are the chief strategist at an AI Product Research & CRO Lab finalizing a delivery report. Write the "Executive Summary" and "Final Recommendations" for the research package. Follow these rules strictly:
1. Executive Summary: 3-5 tight paragraphs — the product, the market opportunity, the chosen positioning, the offer, the recommended landing-page strategy, and the estimated realistic path to conversion. No invented statistics.
2. Final Recommendations: exactly 8 numbered, prioritized, concrete next steps for the founders/team.
3. Writing language for the marketing-forward phrasing: ${langLabel}. Analysis and technical notes can stay in English. Keep product/brand names as-is.`;

  const digestBlock = digest
    .map((d) => `\n### S${String(d.num).padStart(2, "0")} ${d.title} (${d.status})\n${d.content}`)
    .join("\n");

  const prompt = `PRODUCT: ${product?.name || "—"} (${product?.category || ""})\nTARGET: ${[product?.targetCountry, product?.targetMarket].filter(Boolean).join(" / ") || "—"}\nPRICE: ${product?.price ? `${product.price} ${product.currency}` : "—"}\nUSP: ${product?.usp || "—"}\n\nHere is the condensed research package to synthesize:\n${digestBlock || "(no sections completed yet — write a general summary with a strong recommendation to complete the workflow)"}\n\nNow write:\n## Executive Summary\n...\n## Final Recommendations\n1. ...\n2. ... (8 items)`;

  let res;
  try {
    const provider = buildProvider(cfg.provider, { apiKey, baseUrl: cfg.baseUrl });
    const model = cfg.model;
    const started = Date.now();
    res = await provider.chat({
      messages: [{ role: "system", content: system }, { role: "user", content: prompt }],
      model,
      temperature: 0.6,
      maxTokens: cfg.maxTokens,
      topP: 0.95,
      timeout: cfg.timeout,
    });
    const cost = estimateCostUsd(model, res.inputTokens || 0, res.outputTokens || 0);
    const report = saveReport(id, {
      content: res.content,
      generatedAt: Date.now(),
      model,
      cost: { ...cost, inputTokens: res.inputTokens, outputTokens: res.outputTokens, elapsedMs: Date.now() - started, provider: cfg.provider },
    });
    return NextResponse.json({ report });
  } catch (err) {
    return NextResponse.json({ error: friendlyError(err.code || "provider_error"), code: err.code, detail: err.message }, { status: err.status || 502 });
  }
}