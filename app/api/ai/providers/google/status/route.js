import { NextResponse } from "next/server";
import { getInternalImageConfig, IMAGE_PROVIDERS } from "@/lib/aiImages/config";

export async function GET() {
  const cfg = getInternalImageConfig();
  return NextResponse.json({
    enabled: cfg.enabled,
    status: cfg._hasKey && cfg.enabled ? "connected" : "disconnected",
    connected: cfg._hasKey && cfg.enabled,
    hasApiKey: cfg._hasKey,
    provider: cfg.provider,
    model: cfg.model,
    label: IMAGE_PROVIDERS[cfg.provider]?.label || cfg.provider,
    lastTested: cfg.lastTested || 0,
    lastTestResult: cfg.lastTestResult || "",
  });
}
