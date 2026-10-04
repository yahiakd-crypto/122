import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { uid, uploadsDir } from "@/lib/aiImages/store";

const ALLOWED = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/webp": "webp",
};
const MAX_SIZE_MB = 8;
const MAX_FILES = 4;

export async function POST(req) {
  let form;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid upload.", code: "bad_request" }, { status: 400 });
  }

  const files = form.getAll("files").filter((f) => typeof f !== "string" && f.name);
  if (!files.length) return NextResponse.json({ error: "No files uploaded.", code: "no_files" }, { status: 400 });
  if (files.length > MAX_FILES) return NextResponse.json({ error: `Maximum ${MAX_FILES} reference images.`, code: "too_many" }, { status: 400 });

  const results = [];
  const errors = [];
  const refDir = path.join(uploadsDir(), "refs");
  if (!fs.existsSync(refDir)) fs.mkdirSync(refDir, { recursive: true });

  for (const f of files) {
    try {
      const type = (f.type || "").toLowerCase();
      const ext = ALLOWED[type];
      if (!ext) {
        errors.push(`${f.name}: unsupported file type. Use PNG, JPEG or WEBP.`);
        continue;
      }
      const buf = Buffer.from(await f.arrayBuffer());
      if (buf.length > MAX_SIZE_MB * 1024 * 1024) {
        errors.push(`${f.name}: file exceeds ${MAX_SIZE_MB}MB.`);
        continue;
      }
      if (!looksLikeImage(buf, type)) {
        errors.push(`${f.name}: file is not a valid image.`);
        continue;
      }
      const id = uid("ref");
      const filePath = path.join(refDir, `${id}.${ext}`);
      fs.writeFileSync(filePath, buf);
      const dataUrl = `data:${type};base64,${buf.toString("base64")}`;
      results.push({ id, name: f.name, type, size: buf.length, dataUrl });
    } catch (e) {
      errors.push(`${f.name}: could not process file.`);
    }
  }

  return NextResponse.json({ files: results, errors });
}

function looksLikeImage(buf, type) {
  if (buf.length < 8) return false;
  const b = buf.subarray(0, 8);
  if (type === "image/png") return b[0] === 0x89 && b[1] === 0x50;
  if (type === "image/jpeg" || type === "image/jpg") return b[0] === 0xff && b[1] === 0xd8;
  if (type === "image/webp") return b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46;
  return false;
}
