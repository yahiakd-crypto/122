import { NextResponse } from "next/server";
import { getPublicConfig, saveInternalConfig, resetConfig, PROVIDER_DEFAULTS } from "@/lib/ai/config";

export async function GET() {
  return NextResponse.json({ config: getPublicConfig(), providers: PROVIDER_DEFAULTS });
}

export async function PUT(req) {
  const body = await req.json().catch(() => ({}));
  // Whitelist the fields the client may update. apiKey is encrypted server-side.
  const allowed = [
    "provider", "activeProvider", "apiKey", "model", "baseUrl", "temperature", "maxTokens",
    "topP", "systemPrompt", "timeout", "retryCount", "modelScope", "perSectionModels", "providers",
  ];
  const patch = {};
  for (const k of allowed) {
    if (body[k] !== undefined) patch[k] = body[k];
  }
  const config = saveInternalConfig(patch);
  return NextResponse.json({ config });
}

export async function DELETE() {
  const config = resetConfig();
  return NextResponse.json({ config });
}