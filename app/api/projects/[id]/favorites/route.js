import { NextResponse } from "next/server";
import { getFavorites, addFavorite, getProject } from "@/lib/db";

export async function GET(_req, { params }) {
  return NextResponse.json({ favorites: getFavorites(params.id) });
}

export async function POST(req, { params }) {
  const body = await req.json().catch(() => ({}));
  const project = getProject(params.id);
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });
  const favorite = addFavorite(params.id, body);
  return NextResponse.json({ favorite }, { status: 201 });
}