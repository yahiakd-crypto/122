import { NextResponse } from "next/server";
import { getInternalConfig, saveInternalConfig, resolveApiKey } from "@/lib/ai/config";
import { buildProvider, friendlyError } from "@/lib/ai/providers";

export async function POST(req) {
  const cfg = getInternalConfig();
  const body = await req.json().catch(() => ({}));

  // Allow an unsaved key from the UI to be tested before saving.
  let apiKey = body.apiKey && body.apiKey !== "[SET]" ? body.apiKey : resolveApiKey(cfg.provider);
  if (body.provider && body.provider !== cfg.provider) {
    // User switched provider in the modal — use the env var for that provider.
    const temp = { ...cfg, provider: body.provider };
    apiKey = resolveApiKey(temp.provider);
  }
  if (!apiKey) {
    return NextResponse.json({ error: "No API key provided. Enter a key or use your .env variable.", code: "config_error" }, { status: 400 });
  }

  const baseUrl = body.baseUrl || cfg.baseUrl;
  const model = body.model || cfg.model;

  const provider = buildProvider(body.provider || cfg.provider, { apiKey, baseUrl });
  let started = Date.now();
  try {
    const res = await provider.chat({
      messages: [{ role: "user", content: "Reply with exactly: OK" }],
      model,
      temperature: 0,
      maxTokens: Math.min(body.maxTokens || 1600, 16000),
      topP: 1,
      timeout: body.timeout || 40,
    });
    const elapsed = Date.now() - started;
    if (body.saveConfig) {
      saveInternalConfig({
        provider: body.provider || cfg.provider,
        model,
        baseUrl,
        temperature: body.temperature ?? cfg.temperature,
        maxTokens: body.maxTokens ?? cfg.maxTokens,
        topP: body.topP ?? cfg.topP,
        timeout: body.timeout ?? cfg.timeout,
        retryCount: body.retryCount ?? cfg.retryCount,
        systemPrompt: body.systemPrompt ?? cfg.systemPrompt,
        apiKey: body.apiKey && body.apiKey !== "[SET]" ? body.apiKey : undefined,
        lastTested: Date.now(),
        lastTestResult: "OK",
      });
    } else {
      saveInternalConfig({ lastTested: Date.now(), lastTestResult: "OK" });
    }
    return NextResponse.json({ ok: true, reply: res.content, elapsed });
  } catch (err) {
    saveInternalConfig({ lastTested: Date.now(), lastTestResult: "FAIL" });
    return NextResponse.json({ error: friendlyError(err.code || "provider_error"), code: err.code || "provider_error", detail: err.message }, { status: err.status || 502 });
  }
}