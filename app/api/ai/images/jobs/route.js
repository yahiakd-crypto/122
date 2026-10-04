import { NextResponse } from "next/server";
import { listJobs, toPublicJob } from "@/lib/aiImages/store";

export async function GET(req) {
  const url = new URL(req.url);
  const status = url.searchParams.get("status") || "";
  const provider = url.searchParams.get("provider") || "";
  const search = url.searchParams.get("q") || "";
  const jobs = listJobs({ status, provider, search });
  return NextResponse.json({ jobs: jobs.map(toPublicJob) });
}
