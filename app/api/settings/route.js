import { NextResponse } from "next/server";
import { getSettings, saveSettings } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ settings: getSettings() });
}

export async function PUT(req) {
  const body = await req.json().catch(() => ({}));
  const allowed = ["language", "autoRunNext", "liveWebResearch"];
  const patch = {};
  for (const k of allowed) {
    if (body[k] !== undefined) patch[k] = body[k];
  }
  return NextResponse.json({ settings: saveSettings(patch) });
}