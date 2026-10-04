import { NextResponse } from "next/server";
import { getPublicModels } from "@/lib/aiImages/config";

export async function GET() {
  return NextResponse.json({ providers: getPublicModels() });
}
