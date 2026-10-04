import { NextResponse } from "next/server";
import { projectList, createProject } from "@/lib/db";

export async function GET() {
  const projects = projectList();
  return NextResponse.json({ projects });
}

export async function POST(req) {
  const body = await req.json().catch(() => ({}));
  const project = createProject({ name: body.name });
  return NextResponse.json({ project }, { status: 201 });
}