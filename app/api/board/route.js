import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const BOARD_FILE = path.join(process.cwd(), "data", "board.json");

/* GET — load saved products from disk */
export async function GET() {
  try {
    const text = await fs.readFile(BOARD_FILE, "utf-8");
    const data = JSON.parse(text);
    return NextResponse.json({ products: Array.isArray(data) ? data : [] });
  } catch (e) {
    // File doesn't exist yet — return empty
    return NextResponse.json({ products: [] });
  }
}

/* POST — overwrite the file with new products */
export async function POST(req) {
  try {
    const { products } = await req.json();
    if (!Array.isArray(products)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }
    // Always overwrite the same file
    await fs.writeFile(BOARD_FILE, JSON.stringify(products, null, 2), "utf-8");
    return NextResponse.json({ ok: true, count: products.length });
  } catch (e) {
    console.error("Board save error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
