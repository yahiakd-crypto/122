import React from "react";

const PANEL = { background: "#fff", borderRadius: 10, border: "1px solid #e2e8f0", overflow: "hidden", marginBottom: 10 };

const chip = (bg, fg) => ({ background: bg, color: fg, padding: "5px 9px", borderRadius: 7, fontSize: 11.5, fontWeight: 700, whiteSpace: "nowrap" });

const kpiVal = (v) => (v && typeof v === "object" && "value" in v ? v.value : v);
const scalar = (x) => {
  const v = kpiVal(x);
  if (v === undefined || v === null || v === "" || v === "Not available" || typeof v === "object") return "—";
  return v;
};
const kpiChange = (v) => (v && typeof v === "object" && (v.change_percent !== undefined || v.change !== undefined)
  ? (v.change_percent !== undefined && v.change_percent !== "Not available" ? `${v.change_percent}` : v.change) : null);
const kpiSource = (v) => (v && typeof v === "object" && v.source ? v.source : null);

function SummaryCard({ label, value }) {
  const v = kpiVal(value);
  const ch = kpiChange(value);
  const src = kpiSource(value);
  const up = typeof ch === "string" ? ch.replace(/[+\-]/g, "") : null;
  const isUp = typeof ch === "string" && (ch.startsWith("+") || ch.startsWith("-"));
  const good = typeof ch === "string" && (ch.startsWith("-") && (label.includes("CPA") || label.includes("CPM") || label.includes("CPC") || label.includes("Cost") || label.includes("Margin")) ? true : ch.startsWith("+"));
  return (
    <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "10px 12px", minWidth: 120 }}>
      <div style={{ fontSize: 10.5, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 17, fontWeight: 900, color: "#0f172a", lineHeight: 1.2 }}>{v === undefined || v === null ? "—" : v}</div>
      {(ch || src) && (
        <div style={{ display: "flex", gap: 6, marginTop: 6, alignItems: "center", flexWrap: "wrap" }}>
          {ch && <span style={{ ...chip(isUp ? (good ? "#f0fdf4" : "#fef2f2") : "#f1f5f9"), color: isUp ? (good ? "#15803d" : "#b91c1c") : "#475569" }}>{ch}</span>}
          {src && <span style={{ fontSize: 10, color: "#94a3b8" }}>{src}</span>}
        </div>
      )}
    </div>
  );
}

function Leaf({ label, value }) {
  const v = kpiVal(value);
  const ch = kpiChange(value);
  if (v === undefined || v === null || v === "" || v === "Not available") return null;
  if (v && typeof v === "object") return null;
  if (ch && typeof ch === "object") return null;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2, background: "#f8fafc", border: "1px solid #f1f5f9", borderRadius: 7, padding: "6px 9px" }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.3 }}>{label.replace(/_/g, " ")}</div>
      <div style={{ fontSize: 12.5, fontWeight: 800, color: "#0f172a" }}>{v}</div>
      {ch && <div style={{ fontSize: 10.5, fontWeight: 700, color: "#b45309" }}>{ch}</div>}
    </div>
  );
}

function RenderValue({ v, label }) {
  if (Array.isArray(v)) {
    if (v.length === 0) return null;
    const allObj = v.every(x => x && typeof x === "object" && !Array.isArray(x));
    if (allObj) {
      const keys = [];
      v.forEach(o => Object.keys(o).forEach(k => { if (!keys.includes(k) && kpiVal(o[k]) !== "Not available") keys.push(k); }));
      const cols = keys.slice(0, 8);
      return (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", minWidth: 500, borderCollapse: "collapse", fontSize: 11.5 }}>
            <thead>
              <tr>
                {cols.map(c => <th key={c} style={{ textAlign: "left", padding: "7px 9px", fontSize: 10, fontWeight: 800, textTransform: "uppercase", color: "#475569", background: "#f1f5f9", borderBottom: "1px solid #e2e8f0", whiteSpace: "nowrap" }}>{c.replace(/_/g, " ")}</th>)}
              </tr>
            </thead>
            <tbody>
              {v.map((o, i) => (
                <tr key={i} style={{ background: i % 2 ? "#fbfcfd" : "#fff" }}>
                  {cols.map(c => <td key={c} style={{ padding: "7px 9px", borderBottom: "1px solid #f1f5f9", color: "#334155", whiteSpace: "nowrap" }}>{scalar(o[c])}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {v.map((x, i) => <div key={i} style={{ fontSize: 12, color: "#334155" }}>• {kpiVal(x)}</div>)}
      </div>
    );
  }
  if (v && typeof v === "object") {
    const entries = Object.entries(v).filter(([_, val]) => {
      const pv = kpiVal(val);
      return !(pv === undefined || pv === null || pv === "" || pv === "Not available");
    });
    if (entries.length === 0) return null;
    return (
      <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
        {entries.map(([k, val]) => (
          Array.isArray(val) ? <div key={k} style={{ width: "100%" }}><div style={{ fontSize: 11, fontWeight: 800, color: "#0f172a", margin: "4px 0 4px 0" }}>{k.replace(/_/g, " ")}</div><RenderValue v={val} /></div>
            : (kpiVal(val) && typeof kpiVal(val) === "object")
              ? <div key={k} style={{ width: "100%" }}><div style={{ fontSize: 11, fontWeight: 800, color: "#0f172a", margin: "4px 0 4px 0" }}>{k.replace(/_/g, " ")}</div><RenderValue v={val} /></div>
              : <Leaf key={k} label={k} value={val} />
        ))}
      </div>
    );
  }
  return <Leaf key={label} label={label} value={v} />;
}

function Panel({ title, color = "#334155", children }) {
  return (
    <div style={PANEL}>
      <div style={{ background: "#f8fafc", padding: "9px 14px", borderBottom: "1px solid #e2e8f0", fontWeight: 800, fontSize: 12.5, color, textTransform: "uppercase", letterSpacing: 0.3 }}>{title}</div>
      <div style={{ padding: 12 }}>{children}</div>
    </div>
  );
}

const CURATED = ["overview", "funnel", "scores", "winners", "losers", "bottlenecks", "stop", "fix", "scale", "test", "anomalies", "root_causes", "diagnostics", "executive"];

export default function FunnelAnalysis({ data }) {
  if (!data) return null;

  const overview = (data.overview && typeof data.overview === "object") ? data.overview : (typeof data.executive === "object" ? data.executive : {});
  const summaryKeys = ["total_spend", "revenue", "orders", "confirmed_orders", "delivered_orders", "returned_orders", "net_revenue", "net_profit", "roas", "real_roas", "cac", "cpa", "delivery_rate", "return_rate", "confirmation_rate", "net_margin"];
  const funnel = data.funnel || [];
  const scores = data.scores || {};
  const hasOverview = Object.keys(overview).length > 0;
  const scoreColor = (v) => (v >= 80 ? "#16a34a" : v >= 60 ? "#d97706" : "#dc2626");

  const actions = [
    { key: "stop", label: "STOP", bg: "#fef2f2", fg: "#b91c1c" },
    { key: "fix", label: "FIX", bg: "#fffbeb", fg: "#b45309" },
    { key: "scale", label: "SCALE", bg: "#f0fdf4", fg: "#15803d" },
    { key: "test", label: "TEST", bg: "#eff6ff", fg: "#1d4ed8" }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, minWidth: 360 }}>
      {/* Executive summary */}
      {hasOverview && (
        <Panel title="Executive Summary">
          <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {summaryKeys.filter(k => overview[k] !== undefined).map(k => <SummaryCard key={k} label={k.replace(/_/g, " ")} value={overview[k]} />)}
          </div>
        </Panel>
      )}

      {/* Scores */}
      {Object.keys(scores).length > 0 && (
        <Panel title="Performance Scores">
          <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {Object.entries(scores).map(([k, v]) => {
              const val = typeof v === "object" ? v.value : v;
              if (val === undefined) return null;
              return (
                <div key={k} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "8px 12px", minWidth: 76 }}>
                  <div style={{ fontSize: 18, fontWeight: 900, color: scoreColor(val) }}>{val}</div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#64748b", textTransform: "uppercase", textAlign: "center" }}>{k.replace(/_/g, " ")}{k === "overall" ? " /100" : ""}</div>
                </div>
              );
            })}
          </div>
        </Panel>
      )}

      {/* Funnel */}
      {funnel.length > 0 && (
        <Panel title="Funnel">
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", minWidth: 560, borderCollapse: "collapse", fontSize: 11.5 }}>
              <thead>
                <tr>
                  {["Stage", "Count", "Conv %", "Drop-off", "Status"].map(h => <th key={h} style={{ textAlign: "left", padding: "7px 9px", fontSize: 10, fontWeight: 800, textTransform: "uppercase", color: "#475569", background: "#f1f5f9", borderBottom: "1px solid #e2e8f0" }}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {funnel.map((s, i) => {
                  const status = String(s.status || "").toLowerCase();
                  const stChip = status.includes("loss") || status.includes("bad") || status.includes("critical")
                    ? chip("#fef2f2", "#b91c1c") : status.includes("good") || status.includes("healthy")
                      ? chip("#f0fdf4", "#15803d") : chip("#f1f5f9", "#475569");
                  const stageVal = scalar(s.count !== undefined ? s.count : s.value);
                  return (
                    <tr key={i} style={{ background: i % 2 ? "#fbfcfd" : "#fff" }}>
                      <td style={{ padding: "7px 9px", fontWeight: 700, color: "#0f172a", whiteSpace: "nowrap" }}>{scalar(s.stage)}</td>
                      <td style={{ padding: "7px 9px", color: "#334155", whiteSpace: "nowrap" }}>{stageVal}</td>
                      <td style={{ padding: "7px 9px", color: "#334155", whiteSpace: "nowrap" }}>{scalar(s.conversion)}</td>
                      <td style={{ padding: "7px 9px", color: "#b45309", whiteSpace: "nowrap" }}>{scalar(s.dropoff)}</td>
                      <td style={{ padding: "7px 9px" }}>{s.status ? <span style={stChip}>{scalar(s.status)}</span> : "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Panel>
      )}

      {/* STOP / FIX / SCALE / TEST */}
      {(data.stop || data.fix || data.scale || data.test) && (
        <Panel title="Recommended Actions">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 8 }}>
            {actions.map(a => {
              const list = data[a.key] || [];
              if (list.length === 0) return null;
              return (
                <div key={a.key} style={{ background: a.bg, borderRadius: 10, padding: "10px 12px" }}>
                  <div style={{ fontSize: 11, fontWeight: 900, color: a.fg, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 6 }}>{a.label}</div>
                  {list.map((x, i) => <div key={i} style={{ fontSize: 12, color: a.fg, lineHeight: 1.45, marginBottom: 4 }}>• {typeof x === "string" ? x : (x.title || x.action || JSON.stringify(x))}</div>)}
                </div>
              );
            })}
          </div>
        </Panel>
      )}

      {/* Bottlenecks */}
      {data.bottlenecks && data.bottlenecks.length > 0 && (
        <Panel title="Bottlenecks" color="#b45309">
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {(data.bottlenecks || []).map((b, i) => (
              <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", background: "#fffbeb", border: "1px dashed #fcd34d", borderRadius: 8, padding: "8px 10px" }}>
                <span style={{ fontSize: 16 }}>{b.severity && String(b.severity).includes("🔴") ? "🔴" : b.severity && String(b.severity).includes("🟠") ? "🟠" : "🟢"}</span>
                <div style={{ fontSize: 12, color: "#78350f" }}>
                  <strong>{b.stage || b.name || "Stage"}</strong> — {scalar(b.impact) || scalar(b.action) || scalar(b.recommendation) || ""}
                </div>
              </div>
            ))}
          </div>
        </Panel>
      )}

      {/* Winners / Losers */}
      {(data.winners || data.losers) && (
        <Panel title="Winners & Losers">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 8 }}>
            {(data.winners || []).length > 0 && (
              <div>
                <div style={{ fontSize: 11, fontWeight: 900, color: "#15803d", textTransform: "uppercase", marginBottom: 6 }}>Biggest Winners</div>
                {(data.winners || []).map((w, i) => (
                  <div key={i} style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "8px 10px", marginBottom: 5, fontSize: 12, color: "#166534" }}>
                    <strong>{w.name || w.type || "Winner"}</strong>
                    {w.metric && <div style={{ opacity: 0.8 }}>{w.metric}</div>}
                    {w.why_it_wins && <div style={{ opacity: 0.75, marginTop: 2 }}>{w.why_it_wins}</div>}
                  </div>
                ))}
              </div>
            )}
            {(data.losers || []).length > 0 && (
              <div>
                <div style={{ fontSize: 11, fontWeight: 900, color: "#b91c1c", textTransform: "uppercase", marginBottom: 6 }}>Losing</div>
                {(data.losers || []).map((w, i) => (
                  <div key={i} style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "8px 10px", marginBottom: 5, fontSize: 12, color: "#991b1b" }}>
                    <strong>{w.name || w.type || "Loser"}</strong>
                    {w.metric && <div style={{ opacity: 0.8 }}>{w.metric}</div>}
                    {w.why_it_loses && <div style={{ opacity: 0.75, marginTop: 2 }}>{w.why_it_loses}</div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </Panel>
      )}

      {/* Anomalies */}
      {data.anomalies && data.anomalies.length > 0 && (
        <Panel title="Anomalies" color="#dc2626">
          {data.anomalies.map((a, i) => {
            const sev = String(a.severity || "");
            const c = sev.includes("🔴") ? chip("#fef2f2", "#b91c1c") : sev.includes("🟠") ? chip("#fffbeb", "#b45309") : chip("#f0fdf4", "#15803d");
            return (
              <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 6, fontSize: 12, color: "#334155" }}>
                {a.severity && <span style={c}>{a.severity}</span>}
                <div><strong>{a.metric || a.title}</strong> — {scalar(a.change) || scalar(a.impact) || scalar(a.description) || ""}</div>
              </div>
            );
          })}
        </Panel>
      )}

      {/* Root causes */}
      {data.root_causes && data.root_causes.length > 0 && (
        <Panel title="Root-Cause Analysis" color="#7c3aed">
          {data.root_causes.map((r, i) => (
            <div key={i} style={{ background: "#f5f3ff", border: "1px solid #ddd6fe", borderRadius: 8, padding: "9px 12px", marginBottom: 6 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: "#5b21b6" }}>{r.symptom || "Symptom"}</div>
              {r.driver_analysis && <div style={{ fontSize: 11.5, color: "#6d28d9", marginTop: 2 }}>{r.driver_analysis}</div>}
              <div style={{ fontSize: 12.5, color: "#4c1d95", marginTop: 4 }}><strong>Primary cause:</strong> {r.primary_cause || r.cause || "—"}</div>
              {r.fix && <div style={{ fontSize: 12, color: "#6d28d9", marginTop: 2 }}>Fix: {r.fix}</div>}
            </div>
          ))}
        </Panel>
      )}

      {/* Diagnostics */}
      {data.diagnostics && data.diagnostics.length > 0 && (
        <Panel title="Cross-Funnel Diagnostics" color="#0ea5e9">
          {data.diagnostics.map((d, i) => (
            <div key={i} style={{ fontSize: 12, color: "#155e75", marginBottom: 5, background: "#ecfeff", border: "1px solid #cffafe", borderRadius: 8, padding: "7px 10px" }}>
              <strong>{d.scenario || d.diagnosis}</strong> → {d.diagnosis || d.evidence || ""}
            </div>
          ))}
        </Panel>
      )}

      {/* Generic remaining sections */}
      {Object.entries(data).filter(([k]) => !CURATED.includes(k)).map(([k, v]) => (
        <Panel key={k} title={k.replace(/_/g, " ")}>
          <RenderValue v={v} />
        </Panel>
      ))}
    </div>
  );
}