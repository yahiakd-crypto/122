import { NextResponse } from "next/server";
import { usageSummary } from "@/lib/aiImages/store";
import { getInternalImageConfig } from "@/lib/aiImages/config";

export async function GET() {
  const summary = usageSummary();
  const cfg = getInternalImageConfig();
  return NextResponse.json({ ...summary, maxConcurrentJobs: cfg.maxConcurrentJobs, dailyGenerationLimit: cfg.dailyGenerationLimit });
}
