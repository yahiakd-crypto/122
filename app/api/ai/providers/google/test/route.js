import { NextResponse } from "next/server";
import { getInternalImageConfig, saveInternalImageConfig, resolveImageApiKey, IMAGE_PROVIDERS } from "@/lib/aiImages/config";

export async function POST(req) {
  const cfg = getInternalImageConfig();
  const body = await req.json().catch(() => ({}));
  const provider = IMAGE_PROVIDERS[body.provider] ? body.provider : cfg.provider;
  const model = body.model || cfg.model;
  let apiKey = body.apiKey && body.apiKey !== "[SET]" ? body.apiKey : resolveImageApiKey(provider);
  const envVar = IMAGE_PROVIDERS[provider]?.keyEnvVar;
  if (!apiKey && envVar && process.env[envVar]) apiKey = process.env[envVar];

  if (!apiKey) {
    return NextResponse.json({ error: "No Google AI API key provided. Enter a key or set your environment variable.", code: "config_error" }, { status: 400 });
  }

  // Minimal generation to validate the key (cheap, small).
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: "Return the single word: OK" }] }],
        generationConfig: { responseModalities: ["TEXT"], maxOutputTokens: 10 },
      }),
      signal: AbortSignal.timeout(40000),
    });
    const raw = await res.text();
    let data = null;
    try { data = JSON.parse(raw); } catch {}
    if (!res.ok) {
      let reason = "";
      try { reason = data?.error?.message || data?.error?.status || ""; } catch {}
      const bodyLower = raw.toLowerCase();
      if (/aq\.|blocked|safety|unsafe|violat/i.test(raw)) {
        return NextResponse.json({
          error: `Google AI blocked this request (${reason || "content/safety policy"}). This often means the preview image model is not enabled for this API key, or the request was flagged as unsafe.`,
          code: "blocked",
          detail: reason || raw.slice(0, 300),
          model,
        }, { status: 400 });
      }
      if (res.status === 401 || res.status === 403) {
        return NextResponse.json({ error: "Google AI authentication failed. Please check your API credentials.", code: "invalid_key", detail: reason }, { status: 401 });
      }
      if (res.status === 429) {
        return NextResponse.json({ error: "Google AI rate limit reached. Try again later.", code: "rate_limit", detail: reason }, { status: 429 });
      }
      if (bodyLower.includes("model") && (bodyLower.includes("not found") || bodyLower.includes("unavailable") || bodyLower.includes("access"))) {
        return NextResponse.json({ error: `The model "${model}" is not available for this API key. It may be a preview model that must be enabled first.`, code: "invalid_model", detail: reason }, { status: 400 });
      }
      return NextResponse.json({ error: "Google AI returned an error. Check your key and model.", code: "provider_error", detail: reason || raw.slice(0, 300) }, { status: 502 });
    }
    const reply = (data?.candidates?.[0]?.content?.parts || []).map((p) => p.text || "").join("").trim();
    if (body.saveConfig) {
      saveInternalImageConfig({ provider, model, apiKey: body.apiKey && body.apiKey !== "[SET]" ? body.apiKey : undefined, lastTested: Date.now(), lastTestResult: "OK" });
    } else {
      saveInternalImageConfig({ lastTested: Date.now(), lastTestResult: "OK" });
    }
    return NextResponse.json({ ok: true, reply: reply || "OK", model, provider });
  } catch (e) {
    saveInternalImageConfig({ lastTested: Date.now(), lastTestResult: "FAIL" });
    return NextResponse.json({ error: e.message || "Network error reaching Google AI.", code: e.code || "network" }, { status: 502 });
  }
}
