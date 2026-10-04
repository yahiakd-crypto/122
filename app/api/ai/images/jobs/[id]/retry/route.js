import { NextResponse } from "next/server";
import { getJob, updateJob, toPublicJob } from "@/lib/aiImages/store";
import { kick } from "@/lib/aiImages/engine";

export async function POST(req, { params }) {
  const job = getJob(params.id);
  if (!job) return NextResponse.json({ error: "Job not found.", code: "not_found" }, { status: 404 });
  if (job.status === "completed") return NextResponse.json({ error: "Job already completed.", code: "bad_state" }, { status: 400 });
  updateJob(params.id, { status: "queued", errorMessage: "", errorCode: "", progress: 0 });
  kick();
  const updated = getJob(params.id);
  return NextResponse.json({ job: toPublicJob(updated) });
}
