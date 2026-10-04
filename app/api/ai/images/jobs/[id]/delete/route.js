import { NextResponse } from "next/server";
import { removeJob } from "@/lib/aiImages/store";

export async function DELETE(req, { params }) {
  const job = removeJob(params.id);
  if (!job) return NextResponse.json({ error: "Job not found.", code: "not_found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
