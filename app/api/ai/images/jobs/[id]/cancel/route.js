import { NextResponse } from "next/server";
import { getJob, updateJob, toPublicJob } from "@/lib/aiImages/store";

export async function POST(req, { params }) {
  const job = getJob(params.id);
  if (!job) return NextResponse.json({ error: "Job not found.", code: "not_found" }, { status: 404 });
  if (job.status === "completed" || job.status === "failed") {
    return NextResponse.json({ error: "Job has already finished.", code: "bad_state" }, { status: 400 });
  }
  updateJob(params.id, { status: "cancelled", progress: 0, completedAt: Date.now() });
  return NextResponse.json({ job: toPublicJob(getJob(params.id)) });
}
