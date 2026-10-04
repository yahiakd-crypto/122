import { NextResponse } from "next/server";
import { getInternalImageConfig, saveInternalImageConfig, resolveImageApiKey, IMAGE_PROVIDERS } from "@/lib/aiImages/config";
import { buildImageProvider } from "@/lib/aiImages/provider";

export async function POST(req) {
  const cfg = getInternalImageConfig();
  const body = await req.json().catch(() => ({}));
  const provider = IMAGE_PROVIDERS[body.provider] ? body.provider : cfg.provider;
  const model = body.model || cfg.model;
  const apiKey = body.apiKey && body.apiKey !== "[SET]" ? body.apiKey : resolveImageApiKey(provider);

  if (!apiKey) {
    const label = (IMAGE_PROVIDERS[provider] && IMAGE_PROVIDERS[provider].label) || provider;
    return NextResponse.json({ error: `No API key available for ${label}. Add it here or configure it in AI Parameters (it shares that provider's key).`, code: "config_error" }, { status: 400 });
  }

  // Actually generate a tiny image to validate key + model + endpoint.
  const prov = buildImageProvider(provider, { model, apiKey });
  try {
    const images = await prov.generateImage({
      prompt: "A solid #4f46e5 colored square with the word TEST. Simple flat design.",
      aspectRatio: "1:1",
      numberOfImages: 1,
    });
    saveInternalImageConfig({
      provider,
      model,
      apiKey: body.apiKey && body.apiKey !== "[SET]" ? body.apiKey : undefined,
      lastTested: Date.now(),
      lastTestResult: "OK",
    });
    return NextResponse.json({ ok: true, provider, model, bytes: images[0]?.buffer?.length || 0, reply: "Image generated OK" });
  } catch (e) {
    saveInternalImageConfig({ lastTested: Date.now(), lastTestResult: "FAIL" });
    return NextResponse.json({ error: e.message || "Connection test failed.", code: e.code || "provider_error" }, { status: e.status === 429 ? 429 : (e.status || 502) });
  }
}
