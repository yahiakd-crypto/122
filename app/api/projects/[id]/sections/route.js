import { NextResponse } from "next/server";
import { getAllSections, getProject } from "@/lib/db";

export async function GET(_req, { params }) {
  const project = getProject(params.id);
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });
  return NextResponse.json({ sections: getAllSections(params.id) });
}