import { NextResponse } from "next/server";
import { getSection, saveSection, getProject, getAllSections, recomputeProjectStatus } from "@/lib/db";

export async function GET(_req, { params }) {
  const project = getProject(params.id);
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });
  const num = Number(params.num);
  const section = getSection(params.id, num);
  return NextResponse.json({ section });
}

export async function PUT(req, { params }) {
  const body = await req.json().catch(() => ({}));
  const num = Number(params.num);
  const patch = {};
  if (body.result !== undefined) patch.result = String(body.result);
  if (body.status !== undefined) patch.status = body.status;
  if (body.customInstructions !== undefined) patch.customInstructions = String(body.customInstructions);
  if (body.model !== undefined) patch.model = body.model;

  const section = saveSection(params.id, num, patch);
  recomputeProjectStatus(params.id);
  return NextResponse.json({ section });
}

// POST = quick status transitions used by nav helpers
export async function POST(req, { params }) {
  const body = await req.json().catch(() => ({}));
  const num = Number(params.num);
  const all = getAllSections(params.id);
  const others = all[num] || {};
  let section;

  if (body.action === "complete") {
    const content = (others.result || others.rawResponse || "").trim();
    if (!content) {
      return NextResponse.json({ error: "Cannot mark complete without a saved result. Run AI or edit first." }, { status: 400 });
    }
    section = saveSection(params.id, num, { status: "completed" });
  } else if (body.action === "save_draft") {
    section = saveSection(params.id, num, { status: "in_progress" });
  } else if (body.action === "skip") {
    section = saveSection(params.id, num, { status: "skipped" });
  } else if (body.action === "reset") {
    section = saveSection(params.id, num, {
      status: "not_started",
      result: "",
      parsed: null,
      rawResponse: null,
      validation: null,
      qualityScore: null,
      error: "",
      regenerations: 0,
    });
  }
  if (section) recomputeProjectStatus(params.id);
  return NextResponse.json({ section });
}