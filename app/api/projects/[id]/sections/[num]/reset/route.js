import { NextResponse } from "next/server";
import { resetSection, getSection } from "@/lib/db";

export async function POST(_req, { params }) {
  const section = resetSection(params.id, Number(params.num));
  return NextResponse.json({ section });
}

export const GET = async (_req, { params }) => NextResponse.json({ section: getSection(params.id, Number(params.num)) });