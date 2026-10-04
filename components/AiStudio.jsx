"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/client/api";
import { useApp } from "./AppContext";
import { Icon } from "./icons";

const ASPECTS = ["1:1", "4:3", "3:4", "3:2", "2:3", "16:9", "9:16"];

function useJobPolling() {
  const [updates, setUpdates] = useState({});
  const timers = useRef({});

  const start = useCallback((jobId, onDone) => {
    if (!jobId || timers.current[jobId]) return;
    let cancelled = false;
    const tick = async () => {
      try {
        const { job } = await api.get(`/api/ai/images/jobs/${jobId}`);
        if (cancelled) return;
        setUpdates((u) => ({ ...u, [jobId]: job }));
        if (job.status === "completed" || job.status === "failed" || job.status === "cancelled") {
          clearInterval(timers.current[jobId]);
          delete timers.current[jobId];
          onDone && onDone(job);
        }
      } catch {
        clearInterval(timers.current[jobId]);
        delete timers.current[jobId];
      }
    };
    tick();
    timers.current[jobId] = setInterval(tick, 3000);
    return () => {
      cancelled = true;
      clearInterval(timers.current[jobId]);
      delete timers.current[jobId];
    };
  }, []);

  useEffect(() => () => Object.values(timers.current).forEach(clearInterval), []);
  return { updates, start };
}

export function AiHeader({ projectId, view }) {
  const router = useRouter();
  const tabs = [
    { key: "generate", label: "Generate Image", icon: <Icon.Sparkle /> },
    { key: "generations", label: "Generations", icon: <Icon.Layers /> },
    { key: "settings", label: "Settings", icon: <Icon.Gear /> },
  ];
  return (
    <div className="ai-head">
      <div>
        <div className="ai-title">✨ AI Studio</div>
        <div className="muted small">AI background image generation for your product creatives (Google AI, OpenRouter, NVIDIA)</div>
      </div>
      <div className="ai-tabs">
        {tabs.map((t) => (
          <button
            key={t.key}
            className={`btn btn-sm ${view === t.key ? "btn-primary" : "btn-ghost"}`}
            onClick={() => router.push(`/projects/${projectId}/ai-studio/${t.key}`)}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function AiGenerator({ projectId }) {
  const { toast } = useApp();
  const router = useRouter();
  const { updates, start } = useJobPolling();
  const [cfg, setCfg] = useState(null);
  const [providers, setProviders] = useState(null);
  const [provider, setProvider] = useState("google");
  const [model, setModel] = useState("");
  const [prompt, setPrompt] = useState("");
  const [aspect, setAspect] = useState("9:16");
  const [count, setCount] = useState(1);
  const [refs, setRefs] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [refFiles, setRefFiles] = useState({});
  const [generating, setGenerating] = useState(false);
  const [recent, setRecent] = useState([]);
  const [connected, setConnected] = useState(false);
  const [autoPrompt, setAutoPrompt] = useState(false);
  const [aiParams, setAiParams] = useState({ providers: {}, activeProvider: "" });

  // Load config + providers + most recent job.
  useEffect(() => {
    (async () => {
      try {
        const [c, m] = await Promise.all([api.get("/api/ai/images/config"), api.get("/api/ai/images/models")]);
        setCfg(c.config);
        setProviders(m.providers);
        setProvider(c.config.provider || "google");
        setModel(c.config.model || (m.providers?.[c.config.provider || "google"]?.models?.[0] || ""));
        setConnected(c.config.enabled && c.config.hasApiKey);
      } catch (e) {
        toast(e.message, "error");
      }
    })();
  }, [toast]);

  // Pull the linked text-AI provider list from AI Parameters.
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/api/ai/config");
        setAiParams({ providers: res.config.providers || {}, activeProvider: res.config.activeProvider || "openrouter" });
      } catch {}
    })();
  }, []);

  const aiParamProviders = Object.keys(aiParams.providers || {});
  const aiParamLabels = {
    openai: "OpenAI", anthropic: "Anthropic", gemini: "Google Gemini",
    openrouter: "OpenRouter", nvidia: "NVIDIA", custom: "Custom API",
  };

  const feats = providers?.[provider] || { supportsAspectRatio: true, supportsCount: true, supportsReference: true };

  const onFilePick = async (e) => {
    const files = Array.from(e.target.files || []).slice(0, 4 - refs.length);
    if (!files.length) return;
    setUploading(true);
    try {
      const fd = new FormData();
      files.forEach((f) => fd.append("files", f));
      const res = await fetch("/api/ai/images/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      if (data.files?.length) {
        setRefs((r) => [...r, ...data.files.map((f) => ({ ...f, url: f.dataUrl }))]);
        setRefFiles((m) => {
          const n = { ...m };
          data.files.forEach((f) => (n[f.id] = f.dataUrl));
          return n;
        });
      }
      (data.errors || []).forEach((e) => toast(e, "error"));
      if (!data.files?.length) toast("No valid reference images. Use PNG/JPEG/WEBP under 8MB.", "error");
    } catch (err) {
      toast(err.message || "Upload failed", "error");
    } finally {
      setUploading(false);
      if (e.target) e.target.value = "";
    }
  };

  const autoFill = async () => {
    const { prompt: p } = await api.post("/api/ai/images/product-prompt", { projectId });
    setPrompt(p);
    setAutoPrompt(true);
    toast("Prompt auto-generated from product info — edit before generating.");
  };

  const generate = async () => {
    if (!prompt.trim()) return toast("Enter a prompt first.", "error");
    if (!connected) return toast("Connect the selected provider in AI Studio Settings first.", "error");
    setGenerating(true);
    try {
      const body = {
        provider,
        model,
        prompt,
        aspectRatio: aspect,
        numberOfImages: count,
        referenceImages: refs.map((r) => r.url),
        sourceId: projectId,
        sourceLabel: "AI Studio",
        autoPrompt,
      };
      const res = await api.post("/api/ai/images/generate", body);
      start(res.job_id, () => {
        toast("✨ Your image is ready!");
        refreshRecent();
      });
      toast("Generation started in the background.");
      refreshRecent();
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setGenerating(false);
    }
  };

  const refreshRecent = useCallback(async () => {
    try {
      const { jobs } = await api.get(`/api/ai/images/jobs?limit=6`);
      setRecent(jobs);
    } catch {}
  }, []);

  useEffect(() => { refreshRecent(); }, [refreshRecent]);

  return (
    <div>
      <div className="grid-2 ai-stack">
        <div className="card ai-form">
          <div className="row-between" style={{ marginBottom: 14 }}>
            <div className="card-title">AI IMAGE GENERATOR</div>
            {connected ? (
              <span className="badge badge-success">🟢 {providers?.[provider]?.label || "Provider"} Connected</span>
            ) : (
              <span className="badge badge-error">🔴 Not Connected</span>
            )}
          </div>

          <div className="field">
            <label className="lbl">Provider</label>
            <select className="select" value={provider} onChange={(e) => { const p = e.target.value; setProvider(p); setModel(providers?.[p]?.models?.[0] || ""); }}>
              {providers && Object.entries(providers).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>

          <div className="field">
            <label className="lbl">Model</label>
            <select className="select" value={model} onChange={(e) => setModel(e.target.value)}>
              {providers?.[provider]?.models?.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          <div className="field">
            <label className="lbl">Prompt</label>
            <textarea
              className="textarea ai-prompt"
              rows={6}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Create a premium product advertisement for this product…"
            />
            {projectId && (
              <button className="btn btn-sm btn-ghost" onClick={autoFill} style={{ marginTop: 6 }}>
                <Icon.Sparkle /> Auto-fill from product info
              </button>
            )}
          </div>

          {feats.supportsReference && (
            <div className="field">
              <label className="lbl">Reference Images ({refs.length}/4)</label>
              <div className="ai-refs">
                {refs.map((r, i) => (
                  <div key={r.id || i} className="ai-ref">
                    <img src={r.url} alt="ref" />
                    <button className="ai-ref-x" onClick={() => setRefs((x) => x.filter((_, j) => j !== i))}><Icon.X /></button>
                  </div>
                ))}
                {refs.length < 4 && (
                  <label className="ai-ref-add">
                    <input type="file" accept="image/png,image/jpeg,image/webp" multiple hidden onChange={onFilePick} />
                    {uploading ? "Uploading…" : "+ Add"}
                  </label>
                )}
              </div>
            </div>
          )}

          {(feats.supportsAspectRatio || feats.supportsCount) && (
            <div className="row" style={{ gap: 12, flexWrap: "wrap" }}>
              {feats.supportsAspectRatio && (
                <div className="field" style={{ flex: 1, minWidth: 140 }}>
                  <label className="lbl">Aspect Ratio</label>
                  <select className="select" value={aspect} onChange={(e) => setAspect(e.target.value)}>
                    {ASPECTS.map((a) => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
              )}
              {feats.supportsCount && (
                <div className="field" style={{ flex: 1, minWidth: 140 }}>
                  <label className="lbl">Number of Images</label>
                  <select className="select" value={String(count)} onChange={(e) => setCount(parseInt(e.target.value, 10))}>
                    {[1, 2, 3, 4].map((n) => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
              )}
            </div>
          )}

          <button className="btn btn-primary btn-lg btn-block ai-generate" disabled={generating} onClick={generate}>
            <Icon.Sparkle /> {generating ? "STARTING…" : "GENERATE"}
          </button>
        </div>

        <div>
          <div className="card">
            <div className="card-title" style={{ marginBottom: 10 }}>Recent Generations</div>
            {recent.length === 0 ? (
              <div className="empty"><div className="empty-icon">🎨</div><div className="muted">No generations yet.</div></div>
            ) : (
              <div className="ai-recent-list">
                {recent.map((job) => <MiniJob key={job.id} job={updates[job.id] || job} />)}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="row-between" style={{ marginBottom: 12, flexWrap: "wrap", gap: 10 }}>
          <div>
            <div className="card-title">Text AI Providers — linked from AI Parameters</div>
            <div className="small muted">These are the model providers you configure in AI Parameters. Image generation is independent and uses Google / OpenRouter above.</div>
          </div>
          <button className="btn btn-sm btn-ghost" onClick={() => router.push(`/projects/${projectId}/settings/ai`)}>
            <Icon.Gear /> Open AI Parameters
          </button>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--surface-2)" }}>
                <th style={{ textAlign: "left", padding: "8px 12px", width: 70 }}>Active</th>
                <th style={{ textAlign: "left", padding: "8px 12px", width: 130 }}>Provider</th>
                <th style={{ textAlign: "left", padding: "8px 12px" }}>Model</th>
                <th style={{ textAlign: "left", padding: "8px 12px" }}>API Key</th>
              </tr>
            </thead>
            <tbody>
              {aiParamProviders.map((k) => {
                const p = aiParams.providers[k] || {};
                const isActive = aiParams.activeProvider === k;
                return (
                  <tr key={k} style={{ borderBottom: "1px solid var(--border)", background: isActive ? "var(--primary-soft)" : undefined }}>
                    <td style={{ padding: "8px 12px", textAlign: "center" }}>{isActive ? "✓" : ""}</td>
                    <td style={{ padding: "8px 12px", fontWeight: 600 }}>{aiParamLabels[k] || k}</td>
                    <td style={{ padding: "8px 12px", fontFamily: "monospace", fontSize: "0.78rem" }}>{p.model || "—"}</td>
                    <td style={{ padding: "8px 12px" }}>
                      {p.hasApiKey ? <span className="badge badge-success">● Stored</span> : <span className="badge badge-muted">No key</span>}
                    </td>
                  </tr>
                );
              })}
              {aiParamProviders.length === 0 && (
                <tr><td colSpan={4} style={{ padding: 14, textAlign: "center", color: "var(--muted)" }}>No providers configured yet. Open AI Parameters to add keys.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function MiniJob({ job }) {
  const img = job.resultAssets?.[0];
  return (
    <div className="ai-mini">
      {img ? (
        <img className="ai-mini-img" src={img.url} alt="" />
      ) : (
        <div className={`ai-mini-img ai-mini-ph ${job.status}`}><Icon.Layers /></div>
      )}
      <div className="grow" style={{ overflow: "hidden" }}>
        <div className="ai-mini-prompt">{job.prompt || "Image"}</div>
        <div className="small muted">{job.provider || "google"} · {new Date(job.createdAt).toLocaleString()}</div>
      </div>
      <StatusBadge job={job} />
    </div>
  );
}

export function StatusBadge({ job }) {
  const map = {
    queued: { t: "🟡 Waiting", c: "badge-warn" },
    processing: { t: "🔵 Generating…", c: "badge-info" },
    completed: { t: "🟢 Completed", c: "badge-success" },
    retrying: { t: "🔄 Retrying…", c: "badge-warn" },
    failed: { t: "🔴 Failed", c: "badge-error" },
    cancelled: { t: "⏹ Cancelled", c: "badge-muted" },
  };
  const s = map[job.status] || map.queued;
  return <span className={`badge ${s.c}`}>{s.t}</span>;
}

export function AiGenerations({ projectId }) {
  const { toast } = useApp();
  const { updates, start } = useJobPolling();
  const [jobs, setJobs] = useState([]);
  const [filter, setFilter] = useState("all");
  const [providerFilter, setProviderFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loaded, setLoaded] = useState(false);
  const refreshRef = useRef(null);

  const refresh = useCallback(async () => {
    try {
      const q = new URLSearchParams();
      if (filter !== "all") q.set("status", filter);
      if (providerFilter !== "all") q.set("provider", providerFilter);
      if (search) q.set("q", search);
      const { jobs } = await api.get(`/api/ai/images/jobs?${q.toString()}`);
      setJobs(jobs);
      // Start polling for in-flight jobs.
      jobs.filter((j) => ["queued", "processing", "retrying"].includes(j.status)).forEach((j) => start(j.id, refresh));
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setLoaded(true);
    }
  }, [filter, providerFilter, search, start, toast, refresh]);

  refreshRef.current = refresh;
  useEffect(() => { refresh(); }, [refresh]);

  const act = async (id, action) => {
    const labels = { retry: "retrying", cancel: "cancelling", del: "deleting" };
    try {
      if (action === "retry") await api.post(`/api/ai/images/jobs/${id}/retry`);
      if (action === "cancel") await api.post(`/api/ai/images/jobs/${id}/cancel`);
      if (action === "del") await api.del(`/api/ai/images/jobs/${id}/delete`);
      toast(`Job ${labels[action]}…`);
      refresh();
    } catch (e) {
      toast(e.message, "error");
    }
  };

  const download = (job) => {
    const a = job.resultAssets?.[0];
    if (!a) return;
    const a2 = document.createElement("a");
    a2.href = a.url;
    a2.download = `${job.id}.png`;
    document.body.appendChild(a2);
    a2.click();
    a2.remove();
  };

  const filters = ["all", "queued", "processing", "completed", "failed"];

  return (
    <div>
      <div className="card">
        <div className="row-between" style={{ marginBottom: 12, flexWrap: "wrap", gap: 10 }}>
          <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
            {filters.map((f) => (
              <button key={f} className={`chip ${filter === f ? "on" : ""}`} onClick={() => setFilter(f)}>
                {f}
              </button>
            ))}
          </div>
          <div className="row" style={{ gap: 8 }}>
            <select className="select" style={{ width: 150 }} value={providerFilter} onChange={(e) => setProviderFilter(e.target.value)}>
              <option value="all">All providers</option>
              <option value="google">Google AI</option>
              <option value="openrouter">OpenRouter</option>
            </select>
            <div className="ai-search"><Icon.Search /> <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search prompt…" /></div>
          </div>
        </div>

        {!loaded ? (
          <div className="row" style={{ gap: 12 }}><div className="skeleton" style={{ height: 200, flex: 1 }} /></div>
        ) : jobs.length === 0 ? (
          <div className="empty"><div className="empty-icon">🎨</div><div className="muted">No generations match your filters.</div></div>
        ) : (
          <div className="ai-grid">
            {jobs.map((job) => {
              const j = updates[job.id] || job;
              const img = j.resultAssets?.[0];
              return (
                <div key={job.id} className="card ai-gen-card">
                  <div className="ai-gen-media">
                    {j.status === "completed" && img ? (
                      <img src={img.url} alt="generated" />
                    ) : j.status === "processing" ? (
                      <div className="ai-gen-state processing">
                        <div className="ai-spinner" />
                        <div>Generating…</div>
                        <div className="small muted">{j.progress ? `${j.progress}%` : "This may take a moment."}</div>
                      </div>
                    ) : j.status === "queued" ? (
                      <div className="ai-gen-state queued"><Icon.Clock /><div>Waiting</div><div className="small muted">Your image is waiting to be generated.</div></div>
                    ) : j.status === "failed" ? (
                      <div className="ai-gen-state failed"><Icon.Warn /><div>Generation Failed</div><div className="small muted">{j.errorMessage || "Unable to generate this image."}</div></div>
                    ) : (
                      <div className="ai-gen-state queued"><div className="muted">{j.status}</div></div>
                    )}
                  </div>
                  <div className="ai-gen-body">
                    <div className="ai-gen-prompt">{j.prompt || "Image"}</div>
                    <div className="row-between" style={{ marginTop: 4 }}>
                      <span className="small muted">{j.provider} · {new Date(j.createdAt).toLocaleDateString()}</span>
                      <StatusBadge job={j} />
                    </div>
                    <div className="row ai-gen-actions">
                      {j.status === "completed" && img && (
                        <>
                          <button className="btn btn-sm" onClick={() => window.open(img.url, "_blank")}><Icon.Eye /> Open</button>
                          <button className="btn btn-sm" onClick={() => download(j)}><Icon.Download /> Download</button>
                        </>
                      )}
                      {(j.status === "failed" || j.status === "cancelled") && (
                        <button className="btn btn-sm btn-primary" onClick={() => act(job.id, "retry")}><Icon.Refresh /> Retry</button>
                      )}
                      {(j.status === "queued" || j.status === "processing") && (
                        <button className="btn btn-sm btn-ghost" onClick={() => act(job.id, "cancel")}>Cancel</button>
                      )}
                      <button className="btn btn-sm btn-danger" onClick={() => act(job.id, "del")}><Icon.Trash /> Delete</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export function AiStudioSettings() {
  const { toast } = useApp();
  const [cfg, setCfg] = useState(null);
  const [keyInput, setKeyInput] = useState("");
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { config } = await api.get("/api/ai/images/config");
        setCfg(config);
      } catch (e) { toast(e.message, "error"); }
    })();
  }, [toast]);

  const set = (patch) => setCfg((c) => ({ ...c, ...patch }));

  const provMeta = (cfg?.providers || {})[cfg?.provider] || {};
  const provLabel = provMeta.label || cfg?.provider || "Provider";
  const provModels = provMeta.models || [];
  const reuseHint = provMeta.reuseAIParams ? (cfg?.hasApiKey ? " — reusing the key you set in AI Parameters (leave blank to keep sharing it)" : " — enter the key here, or configure it in AI Parameters to share it") : "";

  const save = async () => {
    setSaving(true);
    try {
      const { config } = await api.put("/api/ai/images/config", { ...cfg, apiKey: keyInput });
      setCfg(config);
      setKeyInput("");
      toast("Settings saved.");
    } catch (e) { toast(e.message, "error"); } finally { setSaving(false); }
  };

  const test = async () => {
    setTesting(true);
    try {
      const { ok, reply, model } = await api.post("/api/ai/images/test", {
        provider: cfg.provider,
        model: cfg.model,
        apiKey: keyInput,
        saveConfig: true,
      });
      toast(`Connection OK (${model}) — ${reply || "ok"}`);
      const { config } = await api.get("/api/ai/images/config");
      setCfg(config);
    } catch (e) {
      toast(e.message, "error");
    } finally { setTesting(false); }
  };

  if (!cfg) return <div className="card"><div className="skeleton" style={{ height: 40 }} /></div>;

  return (
    <div>
      <div className="card">
        <div className="row-between" style={{ marginBottom: 16 }}>
          <div>
            <div className="card-title">{provLabel}</div>
            <div className="small">Status: <span className={cfg.hasApiKey && cfg.enabled ? "text-success" : "text-error"}>{cfg.hasApiKey && cfg.enabled ? "🟢 Connected" : "🔴 Not Connected"}</span></div>
          </div>
          <label className="ai-switch">
            <input type="checkbox" checked={!!cfg.enabled} onChange={(e) => set({ enabled: e.target.checked })} />
            <span /> Enabled
          </label>
        </div>

        <div className="field">
          <label className="lbl">Provider</label>
          <select className="select" value={cfg.provider} onChange={(e) => { const p = e.target.value; const m = (cfg.providers?.[p]?.models?.[0]) || ""; set({ provider: p, model: m, apiKey: undefined }); setKeyInput(""); }}>
            {Object.entries(cfg.providers || { google: { label: "Google AI", models: [] } }).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
        </div>

        <div className="field">
          <label className="lbl">Model</label>
          <select className="select" value={cfg.model} onChange={(e) => set({ model: e.target.value })}>
            {provModels.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>

        <div className="field">
          <label className="lbl">{provLabel} API Key {cfg.hasApiKey && <span className="muted">· saved</span>}</label>
          <div className="row" style={{ gap: 8 }}>
            <input className="input" style={{ flex: 1 }} type="password" placeholder={cfg.hasApiKey ? "••••••••••••••••" : "Paste your API key"} value={keyInput} onChange={(e) => setKeyInput(e.target.value)} />
            <button className="btn" disabled={testing} onClick={test}>{testing ? "Testing…" : "Test Connection"}</button>
          </div>
          <div className="small muted" style={{ marginTop: 4 }}>Stored encrypted server-side. Never exposed to the browser.{reuseHint}</div>
        </div>

        <div className="grid-2">
          <div className="field">
            <label className="lbl">Max Concurrent Jobs</label>
            <input className="input" type="number" min={1} value={cfg.maxConcurrentJobs} onChange={(e) => set({ maxConcurrentJobs: parseInt(e.target.value, 10) })} />
          </div>
          <div className="field">
            <label className="lbl">Daily Generation Limit</label>
            <input className="input" type="number" min={1} value={cfg.dailyGenerationLimit} onChange={(e) => set({ dailyGenerationLimit: parseInt(e.target.value, 10) })} />
          </div>
          <div className="field">
            <label className="lbl">Timeout (s)</label>
            <input className="input" type="number" min={10} value={cfg.timeout} onChange={(e) => set({ timeout: parseInt(e.target.value, 10) })} />
          </div>
          <div className="field">
            <label className="lbl">Auto-Retry Attempts</label>
            <input className="input" type="number" min={0} value={cfg.retryAttempts} onChange={(e) => set({ retryAttempts: parseInt(e.target.value, 10) })} />
          </div>
        </div>

        <button className="btn btn-primary btn-lg" disabled={saving} onClick={save}>
          <Icon.Save /> {saving ? "Saving…" : "Save Settings"}
        </button>
      </div>
    </div>
  );
}
