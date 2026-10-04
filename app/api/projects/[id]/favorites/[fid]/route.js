import { NextResponse } from "next/server";
import { removeFavorite } from "@/lib/db";

export async function DELETE(_req, { params }) {
  removeFavorite(params.id, params.fid);
  return NextResponse.json({ ok: true });
}