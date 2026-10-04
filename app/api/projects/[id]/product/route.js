import { NextResponse } from "next/server";
import { getProduct, saveProduct } from "@/lib/db";

export async function GET(_req, { params }) {
  return NextResponse.json({ product: getProduct(params.id) });
}

export async function PUT(req, { params }) {
  const body = await req.json().catch(() => ({}));
  const product = saveProduct(params.id, body);
  return NextResponse.json({ product });
}