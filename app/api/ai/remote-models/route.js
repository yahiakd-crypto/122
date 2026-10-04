import { NextResponse } from "next/server";
import { resolveApiKey } from "@/lib/ai/config";

const ENDPOINTS = {
  nvidia: {
    url: "https://integrate.api.nvidia.com/v1/models",
    keyRequired: false, // catalog is publicly queryable
    parse: (data) => (data.data || []).map((m) => ({
      id: m.id,
      vendor: m.owned_by || "",
      free: null,
    })),
  },
  openrouter: {
    url: "https://openrouter.ai/api/v1/models",
    keyRequired: false,
    parse: (data) => (data.data || []).map((m) => {
      const p = m.pricing || {};
      const isFree = p.prompt === "0" && p.completion === "0";
      return {
        id: m.id,
        vendor: (m.id && m.id.split("/")[0]) || "",
        free: isFree,
        context: m.context_length || 0,
        name: m.name || m.id,
      };
    }),
  },
};

export async function POST(req) {
  const body = await req.json().catch(() => ({}));
  const provider = body.provider || "";
  const cfg = ENDPOINTS[provider];
  if (!cfg) {
    return NextResponse.json({ error: `Model fetching not supported for provider "${provider}"` }, { status: 400 });
  }

  let apiKey = body.apiKey || "";
  if (!apiKey) apiKey = resolveApiKey(provider);

  try {
    const headers = { Accept: "application/json" };
    if (apiKey) headers.Authorization = `Bearer ${apiKey}`;
    const res = await fetch(cfg.url, { headers, signal: AbortSignal.timeout(20000) });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({ error: `Provider API returned ${res.status}: ${text}` }, { status: res.status });
    }

    const data = await res.json();
    const all = cfg.parse(data);
    all.sort((a, b) => a.id.localeCompare(b.id));
    const free = all.filter((m) => m.free === true);

    return NextResponse.json({
      models: all,
      total: all.length,
      free: free.length,
      freeModels: free,
    });
  } catch (err) {
    const msg = err.name === "TimeoutError" ? "Provider timed out" : err.message;
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
