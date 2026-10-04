import { NextResponse } from "next/server";
import { exportTxt, exportMarkdown, exportJson, exportPrintHtml } from "@/lib/export";

export async function GET(req, { params }) {
  const format = req.nextUrl.searchParams.get("format") || "txt";
  const id = params.id;

  let text;
  let filename;
  let contentType;
  switch (format) {
    case "md":
    case "markdown":
      text = exportMarkdown(id);
      filename = "ai-product-research-report.md";
      contentType = "text/markdown";
      break;
    case "json":
      text = exportJson(id);
      filename = "ai-product-research-report.json";
      contentType = "application/json";
      break;
    case "html":
    case "pdf":
      text = exportPrintHtml(id);
      filename = "ai-product-research-report.html";
      contentType = "text/html";
      break;
    case "txt":
    default:
      text = exportTxt(id);
      filename = "ai-product-research-report.txt";
      contentType = "text/plain";
      break;
  }

  return new NextResponse(text, {
    headers: {
      "Content-Type": `${contentType}; charset=utf-8`,
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}