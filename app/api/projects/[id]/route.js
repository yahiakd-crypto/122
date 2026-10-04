import { NextResponse } from "next/server";
import { getProject, deleteProject, duplicateProject, getProduct, projectCosts, recomputeProjectStatus } from "@/lib/db";

export async function GET(_req, { params }) {
  const project = getProject(params.id);
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });
  const product = getProduct(params.id);
  const cost = projectCosts(params.id);
  return NextResponse.json({ project, product, cost });
}

export async function DELETE(_req, { params }) {
  deleteProject(params.id);
  return NextResponse.json({ ok: true });
}

export async function POST(req, { params }) {
  const body = await req.json().catch(() => ({}));
  const project = duplicateProject(params.id);
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });
  return NextResponse.json({ project }, { status: 201 });
}