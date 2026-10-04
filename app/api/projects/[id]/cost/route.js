import { NextResponse } from "next/server";
import { projectCosts } from "@/lib/db";

export async function GET(_req, { params }) {
  return NextResponse.json({ cost: projectCosts(params.id) });
}