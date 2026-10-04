import { NextResponse } from "next/server";
import { PROVIDER_DEFAULTS } from "@/lib/ai/config";

export async function GET(req) {
  const provider = req.nextUrl.searchParams.get("provider") || "openrouter";
  const info = PROVIDER_DEFAULTS[provider];
  if (!info) return NextResponse.json({ models: [], error: "Unknown provider" }, { status: 400 });
  return NextResponse.json({ models: info.models, baseUrl: info.baseUrl });
}