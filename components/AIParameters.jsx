"use client";
import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/client/api";
import { PROVIDER_OPTIONS, SECTIONS } from "@/lib/client/constants";
import { useApp } from "@/components/AppContext";

const PROVIDER_LABELS = { openai: "OpenAI", anthropic: "Anthropic", gemini: "Google Gemini", openrouter: "OpenRouter", nvidia: "NVIDIA", deepseek: "DeepSeek", custom: "Custom API" };
const PROVIDER_HINTS = {
  openai: "sk-…",
  anthropic: "sk-ant-…",
  gemini: "AIza…",
  openrouter: "sk-or-v1-…",
  nvidia: "nvapi-…",
  deepseek: "sk-…",
  custom: "token…",
};

export default function AIParameters() {
  const { toast } = useApp();
  const [cfg, setCfg] = useState(null);
  // providers: public summary from server { [key]: { model, baseUrl, hasApiKey, perSectionModels, models } }
  const [provs, setProvs] = useState({});
  const [activeProvider, setActiveProvider] = useState("");
  // draft: editable copy of providers for the table, keys from user input
  const [draft, setDraft] = useState({});
  const [keys, setKeys] = useState({});
  const [modelsByProvider, setModelsByProvider] = useState({});
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  // Status of testing all models: { [provider]: { status: "loading"|"ok"|"error", msg: "..." } }
  const [testStatuses, setTestStatuses] = useState({});
  const [catalogTestStatuses, setCatalogTestStatuses] = useState({});
  const [testingCatalog, setTestingCatalog] = useState(false);

  // In-table model fetch for providers that expose a live catalog (NVIDIA, OpenRouter)
  const FETCHABLE = ["nvidia", "openrouter"];
  const [remoteModels, setRemoteModels] = useState({});
  const [remoteLoading, setRemoteLoading] = useState({});
  const [remoteError, setRemoteError] = useState({});
  const [remoteFilter, setRemoteFilter] = useState({});

  const load = useCallback(async () => {
    try {
      const res = await api.get("/api/ai/config");
      setCfg(res.config);
      setProvs(res.config.providers || {});
      setActiveProvider(res.config.activeProvider || res.config.provider || "openrouter");
      setDraft(JSON.parse(JSON.stringify(res.config.providers || {})));
      const mk = {};
      for (const k of PROVIDER_OPTIONS) mk[k] = "";
      setKeys(mk);
      // load models datalists for each provider
      const mm = {};
      await Promise.all(PROVIDER_OPTIONS.map(async (p) => {
        try {
          const r = await api.get(`/api/ai/models?provider=${p}`);
          mm[p] = r.models || [];
        } catch { mm[p] = []; }
      }));
      setModelsByProvider(mm);
    } catch (e) {
      toast(e.message, "error");
    }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const setProv = (key, field, value) => {
    setDraft((d) => ({ ...d, [key]: { ...(d[key] || {}), [field]: value } }));
  };

  const setActive = (key) => {
    setActiveProvider(key);
    toast(`${PROVIDER_LABELS[key] || key} is now the active provider`);
  };

  // NVIDIA and OpenRouter expose their model catalogs publicly (no key needed)
  const remoteCanFetchWithoutKey = (provider) => ["nvidia", "openrouter"].includes(provider);

  const fetchRemoteModels = async (provider) => {
    const key = keys[provider] || "";
    if (!key && !draft[provider]?.hasApiKey && !remoteCanFetchWithoutKey(provider)) {
      toast(`Enter your ${PROVIDER_LABELS[provider]} API key above, or save it first.`, "error");
      return;
    }
    setRemoteLoading((s) => ({ ...s, [provider]: true }));
    setRemoteError((s) => ({ ...s, [provider]: null }));
    try {
      const res = await api.post("/api/ai/remote-models", { provider, apiKey: key });
      setRemoteModels((s) => ({ ...s, [provider]: res.models || [] }));
      toast(`Fetched ${res.total} models from ${PROVIDER_LABELS[provider]}${res.free ? ` (${res.free} free)` : ""}`);
    } catch (e) {
      setRemoteError((s) => ({ ...s, [provider]: e.message || "Failed to fetch models" }));
      setRemoteModels((s) => ({ ...s, [provider]: [] }));
      toast(e.message || "Failed to fetch models", "error");
    } finally {
      setRemoteLoading((s) => ({ ...s, [provider]: false }));
    }
  };

  const filteredRemoteModels = (provider) => {
    const list = remoteModels[provider] || [];
    const q = (remoteFilter[provider] || "").toLowerCase();
    if (!q) return list;
    return list.filter((m) => m.id.toLowerCase().includes(q) || (m.vendor || m.owned_by || "").toLowerCase().includes(q));
  };

  const selectRemoteModel = (provider, modelId) => {
    setProv(provider, "model", modelId);
    toast(`Selected: ${modelId}`);
  };

  const save = async () => {
    setSaving(true);
    try {
      // Build providers payload (only send keys that were actually typed)
      const providersPayload = {};
      for (const k of PROVIDER_OPTIONS) {
        const d = draft[k] || {};
        const p = {
          model: d.model ?? "",
          baseUrl: d.baseUrl ?? "",
          perSectionModels: d.perSectionModels ?? {},
        };
        if (keys[k]) p.apiKey = keys[k];
        providersPayload[k] = p;
      }
      const payload = {
        activeProvider,
        providers: providersPayload,
        temperature: Number(cfg.temperature),
        maxTokens: Number(cfg.maxTokens),
        topP: Number(cfg.topP),
        systemPrompt: cfg.systemPrompt || "",
        timeout: Number(cfg.timeout),
        retryCount: Number(cfg.retryCount),
        modelScope: cfg.modelScope,
      };
      if (cfg.perSectionModels) payload.perSectionModels = cfg.perSectionModels;
      const { config } = await api.put("/api/ai/config", payload);
      setCfg(config);
      setProvs(config.providers || {});
      setActiveProvider(config.activeProvider || "openrouter");
      setDraft(JSON.parse(JSON.stringify(config.providers || {})));
      const mk = {};
      for (const k of PROVIDER_OPTIONS) mk[k] = "";
      setKeys(mk);
      toast("All providers saved. Keys stored encrypted server-side.");
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const testActive = async () => {
    setTesting(true);
    try {
      const d = draft[activeProvider] || {};
      const res = await api.post("/api/ai/test", {
        provider: activeProvider,
        model: d.model || "",
        baseUrl: d.baseUrl || "",
        apiKey: keys[activeProvider] || "",
        temperature: Number(cfg.temperature),
        maxTokens: Number(cfg.maxTokens),
        topP: Number(cfg.topP),
        timeout: Number(cfg.timeout),
      });
      toast(`Connection OK in ${res.elapsed}ms — ${(res.reply || "").slice(0, 40)}`);
      setTestStatuses((s) => ({ ...s, [activeProvider]: { status: "ok", msg: `OK (${res.elapsed}ms)` } }));
    } catch (e) {
      toast(e.message || e.detail, "error");
      setTestStatuses((s) => ({ ...s, [activeProvider]: { status: "error", msg: "Error" } }));
    } finally {
      setTesting(false);
    }
  };

  const testAll = async () => {
    setTesting(true);
    const newStatuses = {};
    for (const k of PROVIDER_OPTIONS) {
      if (draft[k]?.hasApiKey || keys[k]) newStatuses[k] = { status: "loading", msg: "Testing…" };
    }
    setTestStatuses(newStatuses);

    await Promise.all(
      PROVIDER_OPTIONS.map(async (k) => {
        if (!draft[k]?.hasApiKey && !keys[k]) return; // Skip if no key at all
        const d = draft[k] || {};
        try {
          const res = await api.post("/api/ai/test", {
            provider: k,
            model: d.model || "",
            baseUrl: d.baseUrl || "",
            apiKey: keys[k] || "",
            temperature: Number(cfg.temperature),
            maxTokens: Number(cfg.maxTokens),
            topP: Number(cfg.topP),
            timeout: Number(cfg.timeout),
          });
          setTestStatuses((s) => ({ ...s, [k]: { status: "ok", msg: `OK (${res.elapsed}ms)` } }));
        } catch (e) {
          setTestStatuses((s) => ({ ...s, [k]: { status: "error", msg: "Error" } }));
        }
      })
    );
    toast("Finished testing all configured providers.");
    setTesting(false);
  };

  const testCatalog = async (p) => {
    const list = filteredRemoteModels(p);
    if (!list.length) return;
    setTestingCatalog(true);
    const newStatuses = {};
    for (const m of list) newStatuses[m.id] = { status: "loading", msg: "Testing…" };
    setCatalogTestStatuses((prev) => ({ ...prev, ...newStatuses }));

    const d = draft[p] || {};
    const key = keys[p] || "";
    
    // Fire all requests concurrently
    await Promise.all(list.map(async (m) => {
      try {
        const res = await api.post("/api/ai/test", {
          provider: p,
          model: m.id,
          baseUrl: d.baseUrl || "",
          apiKey: key,
          temperature: Number(cfg.temperature),
          maxTokens: Number(cfg.maxTokens),
          topP: Number(cfg.topP),
          timeout: Number(cfg.timeout),
        });
        setCatalogTestStatuses((s) => ({ ...s, [m.id]: { status: "ok", msg: `OK (${res.elapsed}ms)` } }));
      } catch (e) {
        setCatalogTestStatuses((s) => ({ ...s, [m.id]: { status: "error", msg: "Error" } }));
      }
    }));
    setTestingCatalog(false);
    toast(`Finished testing ${list.length} models.`);
  };

  const reset = async () => {
    if (!confirm("Reset ALL provider configuration to defaults?")) return;
    try {
      const { config } = await api.del("/api/ai/config");
      setCfg(config);
      setProvs(config.providers || {});
      setActiveProvider(config.activeProvider || "openrouter");
      setDraft(JSON.parse(JSON.stringify(config.providers || {})));
      toast("Config reset.");
    } catch (e) {
      toast(e.message, "error");
    }
  };

  const hasDraftKey = (k) => Boolean(draft[k]?.hasApiKey || keys[k]);

  if (!cfg) return <div className="center"><div className="spin spin-dark" /></div>;

  return (
    <div className="content-wrap" style={{ maxWidth: 980 }}>
      <div style={{ marginBottom: 20 }}>
        <h1>AI Parameters</h1>
        <p className="muted small">
          Manage <b>all AI providers</b> in one table. Each provider keeps its own model, base URL and encrypted API key.
          Mark one as <b>Active</b> — that provider runs the research workflow. API keys are encrypted at rest on the server and are <b>never</b> sent back to the browser.
        </p>
      </div>

      <div className="card" style={{ marginBottom: 16, padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--border)" }} className="row-between">
          <h3 style={{ margin: 0 }}>Providers</h3>
          <span className="badge badge-success">{PROVIDER_LABELS[activeProvider] || activeProvider} active</span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--surface-2)" }}>
                <th style={{ textAlign: "left", padding: "9px 12px", width: 70 }}>Active</th>
                <th style={{ textAlign: "left", padding: "9px 12px", width: 130 }}>Provider</th>
                <th style={{ textAlign: "left", padding: "9px 12px" }}>Model</th>
                <th style={{ textAlign: "left", padding: "9px 12px", minWidth: 190 }}>Base URL</th>
                <th style={{ textAlign: "left", padding: "9px 12px", minWidth: 170 }}>API Key</th>
                <th style={{ textAlign: "left", padding: "9px 12px", width: 100 }}>Test Status</th>
                <th style={{ padding: "9px 12px", width: 40 }}></th>
              </tr>
            </thead>
            <tbody>
              {PROVIDER_OPTIONS.map((k) => {
                const isActive = activeProvider === k;
                const d = draft[k] || {};
                const mList = modelsByProvider[k] || [];
                return (
                  <tr key={k} style={{ borderBottom: "1px solid var(--border)", background: isActive ? "var(--primary-soft)" : undefined }}>
                    <td style={{ padding: "8px 12px", textAlign: "center" }}>
                      <input
                        type="radio"
                        name="active-provider"
                        checked={isActive}
                        onChange={() => setActive(k)}
                        title={`Set ${PROVIDER_LABELS[k]} active`}
                      />
                    </td>
                    <td style={{ padding: "8px 12px", fontWeight: 600 }}>
                      {PROVIDER_LABELS[k]}
                      <br />
                      <span className="muted" style={{ fontSize: "0.7rem" }}>{d.hasApiKey ? "key stored" : "no key"}</span>
                    </td>
                    <td style={{ padding: "8px 12px" }}>
                      <input
                        className="input"
                        list={`model-list-${k}`}
                        value={d.model || ""}
                        placeholder={PROVIDER_DEFAULTS_MODEL[k] || ""}
                        onChange={(e) => setProv(k, "model", e.target.value)}
                      />
                      <datalist id={`model-list-${k}`}>
                        {mList.map((m) => <option key={m} value={m} />)}
                        {(remoteModels[k] || []).map((nm) => <option key={`rm-${nm.id}`} value={nm.id} />)}
                      </datalist>
                    </td>
                    <td style={{ padding: "8px 12px" }}>
                      <input className="input" value={d.baseUrl || ""} placeholder="https://api…" onChange={(e) => setProv(k, "baseUrl", e.target.value)} />
                    </td>
                    <td style={{ padding: "8px 12px" }}>
                      <div className="row" style={{ gap: 6 }}>
                        <input
                          className="input"
                          type="password"
                          placeholder={d.hasApiKey ? "•••••••• (leave blank to keep)" : PROVIDER_HINTS[k]}
                          value={keys[k] || ""}
                          onChange={(e) => setKeys((m) => ({ ...m, [k]: e.target.value }))}
                          autoComplete="off"
                        />
                        {d.hasApiKey && <span className="badge badge-success" title="Key stored server-side">●</span>}
                      </div>
                    </td>
                    <td style={{ padding: "8px 12px", fontWeight: 600, fontSize: "0.75rem" }}>
                      {testStatuses[k] && (
                        <span style={{
                          color: testStatuses[k].status === "ok" ? "var(--success)" 
                               : testStatuses[k].status === "error" ? "var(--error)" 
                               : "var(--muted)",
                          display: "flex", alignItems: "center", gap: 4
                        }}>
                          {testStatuses[k].status === "loading" && <span className="spin spin-sm" />}
                          {testStatuses[k].status === "ok" && "🟢"}
                          {testStatuses[k].status === "error" && "🔴"}
                          {testStatuses[k].msg}
                        </span>
                      )}
                    </td>
                    <td style={{ padding: "8px 12px", textAlign: "center" }}>
                      {FETCHABLE.includes(k) && (
                        <button className="btn btn-sm" disabled={remoteLoading[k]} onClick={() => fetchRemoteModels(k)} title={`Fetch all ${PROVIDER_LABELS[k]} models`}>
                          {remoteLoading[k] ? <span className="spin" /> : "⇅"}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {FETCHABLE.includes(activeProvider) && (() => {
        const p = activeProvider;
        const list = remoteModels[p] || [];
        const loading = remoteLoading[p];
        const err = remoteError[p];
        const filtered = filteredRemoteModels(p);
        return (
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="row-between" style={{ marginBottom: 10 }}>
              <h3 style={{ margin: 0 }}>{PROVIDER_LABELS[p]} Models Catalog</h3>
              <div className="row" style={{ gap: 8 }}>
                <input className="input" style={{ width: 200 }} placeholder="Filter…" value={remoteFilter[p] || ""} onChange={(e) => setRemoteFilter((s) => ({ ...s, [p]: e.target.value }))} />
                <button className="btn btn-secondary btn-sm" disabled={testingCatalog || list.length === 0} onClick={() => testCatalog(p)} title="Test all currently displayed models">
                  {testingCatalog ? <span className="spin" /> : "⚡"} Test Displayed
                </button>
                <button className="btn btn-secondary btn-sm" disabled={loading} onClick={() => fetchRemoteModels(p)}>
                  {loading ? <span className="spin" /> : null} {loading ? "Fetching…" : "Fetch All Models"}
                </button>
              </div>
            </div>
            {err && <div className="badge badge-error" style={{ marginBottom: 8 }}>{err}</div>}
            {!list.length && !err && (
              <p className="muted small">
                Click <b>Fetch All Models</b> to load the live model catalog from {PROVIDER_LABELS[p]}.
                {p === "openrouter" && " Free models are marked with a FREE badge."}
              </p>
            )}
            {list.length > 0 && (
              <>
                <div style={{ maxHeight: 300, overflowY: "auto", border: "1px solid var(--border)", borderRadius: 8 }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--surface-2)" }}>
                        <th style={{ textAlign: "left", padding: "8px 12px" }}>Model ID</th>
                        <th style={{ textAlign: "left", padding: "8px 12px" }}>Vendor</th>
                        {p === "openrouter" && <th style={{ padding: "8px 12px", width: 70 }}>Free</th>}
                        <th style={{ textAlign: "left", padding: "8px 12px", width: 140 }}>Test Status</th>
                        <th style={{ padding: "8px 12px", width: 90 }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((m) => {
                        const active = (draft[p]?.model || "") === m.id;
                        return (
                          <tr key={m.id} style={{ borderBottom: "1px solid var(--border)", cursor: "pointer" }}
                            onClick={() => { selectRemoteModel(p, m.id); }}
                            onMouseEnter={(e) => e.currentTarget.style.background = "var(--surface-2)"}
                            onMouseLeave={(e) => e.currentTarget.style.background = ""}
                          >
                            <td style={{ padding: "6px 12px", fontFamily: "monospace", fontSize: "0.76rem" }}>{m.id}</td>
                            <td style={{ padding: "6px 12px", color: "var(--muted)" }}>{m.vendor || m.owned_by}</td>
                            {p === "openrouter" && (
                              <td style={{ padding: "6px 12px", textAlign: "center" }}>
                                {m.free ? <span className="badge badge-success" title="Free model">FREE</span> : <span className="muted">—</span>}
                              </td>
                            )}
                            <td style={{ padding: "6px 12px", fontSize: "0.75rem", fontWeight: 600 }}>
                              {catalogTestStatuses[m.id] ? (
                                <span style={{
                                  color: catalogTestStatuses[m.id].status === "ok" ? "var(--success)" 
                                       : catalogTestStatuses[m.id].status === "error" ? "var(--error)" 
                                       : "var(--muted)",
                                  display: "flex", alignItems: "center", gap: 4
                                }}>
                                  {catalogTestStatuses[m.id].status === "loading" && <span className="spin spin-sm" />}
                                  {catalogTestStatuses[m.id].status === "ok" && "🟢"}
                                  {catalogTestStatuses[m.id].status === "error" && "🔴"}
                                  {catalogTestStatuses[m.id].msg}
                                </span>
                              ) : <span className="muted">—</span>}
                            </td>
                            <td style={{ padding: "6px 12px", textAlign: "center" }}>
                              <span style={{ fontSize: "0.72rem", color: active ? "var(--success)" : "var(--muted)" }}>{active ? "● Active" : "Select"}</span>
                            </td>
                          </tr>
                        );
                      })}
                      {filtered.length === 0 && (
                        <tr><td colSpan={p === "openrouter" ? 4 : 3} style={{ padding: 16, textAlign: "center", color: "var(--muted)" }}>No models match the filter</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <p className="muted small" style={{ marginTop: 6 }}>
                  Showing {filtered.length} of {list.length} models. Click a row to assign it to {PROVIDER_LABELS[p]}.
                </p>
              </>
            )}
          </div>
        );
      })()}

      <div className="card" style={{ marginBottom: 16 }}>
        <h3>Generation parameters (shared by all providers)</h3>
        <div className="form-grid">
          <div className="field"><label className="lbl" htmlFor="temp">Temperature</label><input id="temp" className="input" type="number" step="0.1" min="0" max="2" value={cfg.temperature} onChange={(e) => setCfg({ ...cfg, temperature: e.target.value })} /></div>
          <div className="field"><label className="lbl" htmlFor="maxt">Max Tokens</label><input id="maxt" className="input" type="number" min="256" step="256" value={cfg.maxTokens} onChange={(e) => setCfg({ ...cfg, maxTokens: e.target.value })} /></div>
          <div className="field"><label className="lbl" htmlFor="topp">Top P</label><input id="topp" className="input" type="number" step="0.05" min="0" max="1" value={cfg.topP} onChange={(e) => setCfg({ ...cfg, topP: e.target.value })} /></div>
          <div className="field"><label className="lbl" htmlFor="timeout">Timeout (s)</label><input id="timeout" className="input" type="number" min="5" value={cfg.timeout} onChange={(e) => setCfg({ ...cfg, timeout: e.target.value })} /></div>
          <div className="field full"><label className="lbl" htmlFor="sysp">System Prompt (optional — merged into every request)</label><textarea id="sysp" className="textarea" rows={3} value={cfg.systemPrompt} onChange={(e) => setCfg({ ...cfg, systemPrompt: e.target.value })} /></div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="row-between">
          <h3 style={{ margin: 0 }}>Model per section</h3>
          <div className="row">
            <button className={`chip ${cfg.modelScope === "same" ? "on" : ""}`} onClick={() => setCfg({ ...cfg, modelScope: "same" })}>Same model everywhere</button>
            <button className={`chip ${cfg.modelScope === "per_section" ? "on" : ""}`} onClick={() => setCfg({ ...cfg, modelScope: "per_section" })}>Different per section</button>
          </div>
        </div>
        {cfg.modelScope === "per_section" ? (
          <div className="grid-2 mt-16">
            {SECTIONS.map((s) => (
              <div className="field" key={s.num}>
                <label className="lbl">{String(s.num).padStart(2, "0")} · {s.title}</label>
                <input className="input" value={cfg.perSectionModels?.[s.num] || ""} placeholder={draft[activeProvider]?.model || ""} onChange={(e) => setCfg({ ...cfg, perSectionModels: { ...(cfg.perSectionModels || {}), [s.num]: e.target.value } })} />
              </div>
            ))}
          </div>
        ) : (
          <p className="muted small mt-12">
            Active provider ({PROVIDER_LABELS[activeProvider]}) → {draft[activeProvider]?.model || "—"} for all sections.
            Switch to "Different per section" to assign models per section.
          </p>
        )}
      </div>

      <div className="row">
        <button className="btn btn-secondary btn-lg" disabled={testing} onClick={testAll}>
          {testing ? <span className="spin" /> : <span>⚡</span>} {testing ? "Testing All…" : `TEST ALL MODELS`}
        </button>
        <button className="btn btn-primary btn-lg" disabled={saving} onClick={save}>
          <span>✓</span> {saving ? "Saving…" : "SAVE ALL PROVIDERS"}
        </button>
        <button className="btn btn-lg" onClick={reset}>RESET</button>
      </div>
      <p className="muted small mt-8">
        Tip: you can also set <span className="mono">OPENAI_API_KEY</span>, <span className="mono">OPENROUTER_API_KEY</span>, <span className="mono">ANTHROPIC_API_KEY</span>, <span className="mono">GEMINI_API_KEY</span> or <span className="mono">NVIDIA_API_KEY</span> in a local <span className="mono">.env</span> file — these are picked up automatically.
      </p>
    </div>
  );
}

const PROVIDER_DEFAULTS_MODEL = {
  openai: "gpt-4o-mini",
  anthropic: "claude-3-5-haiku-latest",
  gemini: "gemini-2.5-flash",
  openrouter: "meta-llama/llama-3.3-70b-instruct",
  nvidia: "meta/llama-3.3-70b-instruct",
  deepseek: "deepseek-chat",
  custom: "",
};
