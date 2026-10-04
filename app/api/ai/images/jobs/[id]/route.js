import { NextResponse } from "next/server";
import { getJob, toPublicJob } from "@/lib/aiImages/store";

export async function GET(req, { params }) {
  const job = getJob(params.id);
  if (!job) return NextResponse.json({ error: "Job not found.", code: "not_found" }, { status: 404 });
  return NextResponse.json({ job: toPublicJob(job) });
}
