import { NextResponse } from "next/server";
import { getPublicImageConfig, saveInternalImageConfig, IMAGE_PROVIDERS } from "@/lib/aiImages/config";

export async function GET() {
  return NextResponse.json({ config: getPublicImageConfig(), providers: IMAGE_PROVIDERS });
}

export async function PUT(req) {
  const body = await req.json().catch(() => ({}));
  const patch = {};
  const cfg = getPublicImageConfig();

  if (body.provider && IMAGE_PROVIDERS[body.provider]) patch.provider = body.provider;
  if (body.model) patch.model = body.model;
  if (body.enabled !== undefined) patch.enabled = Boolean(body.enabled);
  if (body.maxConcurrentJobs !== undefined) patch.maxConcurrentJobs = Math.max(1, parseInt(body.maxConcurrentJobs, 10) || 3);
  if (body.dailyGenerationLimit !== undefined) patch.dailyGenerationLimit = Math.max(1, parseInt(body.dailyGenerationLimit, 10) || 50);
  if (body.timeout !== undefined) patch.timeout = Math.max(10, parseInt(body.timeout, 10) || 180);
  if (body.retryAttempts !== undefined) patch.retryAttempts = Math.max(0, parseInt(body.retryAttempts, 10) || 0);
  if (body.apiKey && typeof body.apiKey === "string" && body.apiKey !== "[SET]") patch.apiKey = body.apiKey;

  const next = saveInternalImageConfig(patch);
  return NextResponse.json({ config: next });
}
