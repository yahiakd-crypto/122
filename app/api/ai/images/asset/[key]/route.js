import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { listAssets, uploadsDir } from "@/lib/aiImages/store";

const MIME = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
};

export async function GET(req, { params }) {
  const key = String(params.key || "");
  if (!key || key.includes("..") || key.includes("/") || key.includes("\\")) {
    return NextResponse.json({ error: "Invalid asset.", code: "bad_request" }, { status: 400 });
  }

  // Find the matching asset record for the stored URL.
  const assets = listAssets();
  const suffix = `/api/ai/images/asset/${key}`;
  const asset = assets.find((a) => a.url === suffix);
  const rel = asset?.storageKey || (key.startsWith("ref_") ? `refs/${key}.png` : "");
  if (!rel) return NextResponse.json({ error: "Not found.", code: "not_found" }, { status: 404 });

  const root = uploadsDir();
  const file = path.resolve(root, rel);
  if (!file.startsWith(path.resolve(root))) {
    return NextResponse.json({ error: "Forbidden.", code: "forbidden" }, { status: 403 });
  }
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) {
    return NextResponse.json({ error: "Not found.", code: "not_found" }, { status: 404 });
  }
  const ext = path.extname(file).toLowerCase();
  const buf = fs.readFileSync(file);
  return new Response(new Uint8Array(buf), {
    headers: {
      "Content-Type": MIME[ext] || "application/octet-stream",
      "Content-Disposition": `inline; filename="${key}${ext}"`,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
