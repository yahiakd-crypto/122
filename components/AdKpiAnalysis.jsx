import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import * as LucideIcons from "lucide-react";

/* ── Icon helper ── */
const Icon = ({ name, size = 16, color = "currentColor" }) => {
  const C = LucideIcons[name] || LucideIcons.Circle;
  return <C size={size} color={color} strokeWidth={2} />;
};

/* ── Strip leading $ so we never show $$ ── */
const fv = (v) => {
  if (v == null || v === "" || v === "N/A" || v === "Not available") return "-";
  return String(v).trim().replace(/^\$+/, "");
};

/* ── Constants ── */
const VERDICT_STYLE = {
  SCALE: { bg: "#d1fae5", fg: "#065f46", glow: "#10b981", icon: "TrendingUp",   label: "SCALE" },
  TEST:  { bg: "#e0e7ff", fg: "#3730a3", glow: "#6366f1", icon: "FlaskConical", label: "TEST"  },
  PAUSE: { bg: "#fef3c7", fg: "#92400e", glow: "#f59e0b", icon: "Pause",        label: "PAUSE" },
  KILL:  { bg: "#fee2e2", fg: "#991b1b", glow: "#ef4444", icon: "X",            label: "KILL"  },
};

const STATUS_STYLE = {
  GOOD:     { bg: "#d1fae5", fg: "#065f46", dot: "#10b981", label: "GOOD"      },
  OK:       { bg: "#e0e7ff", fg: "#3730a3", dot: "#6366f1", label: "OK"        },
  BAD:      { bg: "#fef3c7", fg: "#92400e", dot: "#f59e0b", label: "ATTENTION" },
  CRITICAL: { bg: "#fee2e2", fg: "#991b1b", dot: "#ef4444", label: "CRITICAL"  },
};

const ACTION_COLOR = { SCALE: "#10b981", TEST: "#6366f1", KILL: "#ef4444", STOP: "#ef4444", FIX: "#f59e0b" };
const LEVEL_ICON   = { Campaign: "LayoutTemplate", "Ad Set": "Users", Ad: "Image" };

const confInfo = (raw = "") => {
  const r = raw.toLowerCase();
  if (r.includes("high")) return { label: "High confidence", color: "#10b981", bg: "#d1fae5" };
  if (r.includes("low"))  return { label: "Low confidence",  color: "#ef4444", bg: "#fee2e2" };
  return                         { label: "Med confidence",  color: "#f59e0b", bg: "#fef3c7" };
};

/* ════════════════════════════════════════════════════════════
   SMALL CHARTS
════════════════════════════════════════════════════════════ */
const BarChart = ({ items, color = "#6366f1" }) => {
  if (!items || items.length === 0) return <div style={{ color: "#ccc", fontSize: 12 }}>No data</div>;
  const nums = items.map(i => {
    const n = parseFloat(String(i.value || 0).replace(/[^0-9.\-]/g, ""));
    return isNaN(n) ? 0 : Math.abs(n);
  });
  const maxV = Math.max(...nums, 0.001);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {items.map((it, i) => (
        <div key={i}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, color: "#374151", marginBottom: 3 }}>
            <span style={{ maxWidth: "55%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: 600 }}>{it.label}</span>
            <span style={{ fontWeight: 800, color: "#111827" }}>{fv(it.value)}{it.unit || ""}</span>
          </div>
          <div style={{ background: "#f3f4f6", borderRadius: 99, height: 8 }}>
            <div style={{ width: `${Math.max((nums[i] / maxV) * 100, 2)}%`, height: 8, borderRadius: 99, background: it.color || color, transition: "width 0.4s ease" }} />
          </div>
        </div>
      ))}
    </div>
  );
};

const DonutChart = ({ segments, size = 100, thick = 14, centerLabel, centerSub }) => {
  const total = segments.reduce((a, s) => a + (Number(s.value) || 0), 0) || 1;
  const r = (size - thick) / 2;
  const circ = 2 * Math.PI * r;
  let acc = 0;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0 }}>
        <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f3f4f6" strokeWidth={thick} />
          {segments.map((s, i) => {
            const val = Number(s.value) || 0;
            if (val <= 0) return null;
            const len = (val / total) * circ;
            const off = -acc;
            acc += len;
            return <circle key={i} cx={size / 2} cy={size / 2} r={r} fill="none" stroke={s.color}
              strokeWidth={thick} strokeDasharray={`${len} ${circ - len}`} strokeDashoffset={off}
              strokeLinecap="round" />;
          })}
        </g>
        {centerLabel !== undefined && <>
          <text x="50%" y="44%" textAnchor="middle" dominantBaseline="central"
            style={{ fontSize: 18, fontWeight: 800, fill: "#111827" }}>{centerLabel}</text>
          {centerSub && <text x="50%" y="62%" textAnchor="middle" dominantBaseline="central"
            style={{ fontSize: 9, fill: "#9ca3af" }}>{centerSub}</text>}
        </>}
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        {segments.map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, color: "#374151" }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: s.color, flexShrink: 0 }} />
            <span style={{ fontWeight: 600 }}>{s.label}</span>
            <span style={{ fontWeight: 800, marginLeft: 4, color: s.color }}>{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════
   KPI HEALTH TABLE
════════════════════════════════════════════════════════════ */
const KpiTable = ({ statuses = [], kpis = {} }) => {
  const rows = statuses.length > 0
    ? statuses
    : Object.entries(kpis).map(([k, v]) => ({ kpi: k.replace(/_/g, " ").toUpperCase(), value: v, status: "OK", why: "", fix: "" }));
  if (rows.length === 0) return <div style={{ color: "#ccc", fontSize: 12, padding: "12px 0" }}>No KPI data available.</div>;
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
        <thead>
          <tr style={{ borderBottom: "2px solid #f3f4f6" }}>
            {["KPI", "Current Value", "Benchmark", "Status", "Why", "Fix"].map(h => (
              <th key={h} style={{ padding: "8px 10px", textAlign: "left", fontSize: 10, fontWeight: 800, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.5px", whiteSpace: "nowrap" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((st, i) => {
            const sk = (st.status || "OK").trim().toUpperCase();
            const ss = STATUS_STYLE[sk] || STATUS_STYLE.OK;
            return (
              <tr key={i} style={{ borderBottom: "1px solid #f9fafb", background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                <td style={{ padding: "10px", fontWeight: 700, color: "#374151", whiteSpace: "nowrap" }}>{st.kpi}</td>
                <td style={{ padding: "10px", fontWeight: 800, color: "#111827", whiteSpace: "nowrap" }}>{fv(st.value) !== "-" ? fv(st.value) : "-"}</td>
                <td style={{ padding: "10px", color: "#6b7280", fontSize: 12 }}>{st.benchmark || "-"}</td>
                <td style={{ padding: "10px" }}>
                  <span style={{ background: ss.bg, color: ss.fg, padding: "2px 8px", borderRadius: 999, fontSize: 10, fontWeight: 800, whiteSpace: "nowrap" }}>{ss.label}</span>
                </td>
                <td style={{ padding: "10px", color: "#475569", lineHeight: 1.5, maxWidth: 200 }}>{st.why || "-"}</td>
                <td style={{ padding: "10px", color: "#059669", lineHeight: 1.5, fontWeight: 600, maxWidth: 200 }}>{st.fix || "-"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════
   ORG CHART TREE
════════════════════════════════════════════════════════════ */
const OrgChart = ({ levels }) => {
  const campaigns = levels.filter(l => (l.level || "").toLowerCase() === "campaign");
  const adSets    = levels.filter(l => {
    const lvl = (l.level || "").toLowerCase();
    return lvl === "ad set" || lvl === "adset";
  });
  const ads       = levels.filter(l => (l.level || "").toLowerCase() === "ad");

  const getVs = (lv) => {
    const v = (lv.verdict || "TEST").trim().toUpperCase();
    return VERDICT_STYLE[v] || VERDICT_STYLE.TEST;
  };

  const Node = ({ lv, width = 140 }) => {
    const vs = getVs(lv);
    return (
      <div style={{ background: "#fff", border: `1px solid #f3f4f6`, borderRadius: 12, padding: "12px", width, boxShadow: "0 2px 12px rgba(0,0,0,0.03)", textAlign: "center", flexShrink: 0, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: vs.glow }} />
        <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 0.5, color: "#9ca3af", textTransform: "uppercase", marginBottom: 4, marginTop: 2 }}>{lv.level}</div>
        <div style={{ fontSize: 12.5, fontWeight: 700, color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{lv.name || "-"}</div>
        <div style={{ marginTop: 8, display: "inline-flex", alignItems: "center", gap: 4, background: vs.bg, color: vs.fg, padding: "3px 10px", borderRadius: 999, fontSize: 10, fontWeight: 800, letterSpacing: 0.5, textTransform: "uppercase" }}>
          {vs.label}
        </div>
      </div>
    );
  };

  if (levels.length === 0) return null;
  return (
    <div style={{ overflowX: "auto", paddingBottom: 8 }}>
      <div style={{ minWidth: 400, padding: "0 10px" }}>
        {campaigns.length > 0 && (
          <div style={{ display: "flex", justifyContent: "center", gap: 16 }}>
            {campaigns.map((c, i) => <Node key={i} lv={c} width={160} />)}
          </div>
        )}
        {campaigns.length > 0 && adSets.length > 0 && (
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div style={{ width: 2, height: 24, background: "#e5e7eb" }} />
          </div>
        )}
        {adSets.length > 0 && (
          <>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <div style={{ width: Math.max(adSets.length - 1, 0) * 156 + "px", height: 2, background: "#e5e7eb" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: 16 }}>
              {adSets.map((as, i) => (
                <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{ width: 2, height: 20, background: "#e5e7eb" }} />
                  <Node lv={as} width={140} />
                </div>
              ))}
            </div>
          </>
        )}
        {adSets.length > 0 && ads.length > 0 && (
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div style={{ width: 2, height: 24, background: "#e5e7eb" }} />
          </div>
        )}
        {ads.length > 0 && (
          <>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <div style={{ width: Math.max(ads.length - 1, 0) * 136 + "px", height: 2, background: "#e5e7eb" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: 16 }}>
              {ads.map((ad, i) => (
                <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{ width: 2, height: 20, background: "#e5e7eb" }} />
                  <Node lv={ad} width={120} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const VerdictDonut = ({ levels }) => {
  const counts = {};
  levels.forEach(lv => {
    const v = (lv.verdict || "TEST").toUpperCase().trim();
    counts[v] = (counts[v] || 0) + 1;
  });
  const colors = { SCALE: "#10b981", TEST: "#6366f1", PAUSE: "#f59e0b", KILL: "#ef4444" };
  const segments = Object.entries(counts).map(([v, c]) => ({ label: v, value: c, color: colors[v] || "#9ca3af" }));
  return <DonutChart segments={segments} size={110} thick={14} centerLabel={levels.length} centerSub="levels" />;
};

/* ════════════════════════════════════════════════════════════
   LEVEL DETAIL PAGE (used inside Campaign / Ad Set / Ad drilldowns)
════════════════════════════════════════════════════════════ */
const LevelDetailPage = ({ lv }) => {
  const v  = (lv.verdict || "TEST").trim().toUpperCase();
  const vs = VERDICT_STYLE[v] || VERDICT_STYLE.TEST;
  const cf = confInfo(lv.confidence || "");
  const kpis = lv.kpis || {};

  const KPI_META = {
    spend_usd: { label: "SPEND USD", icon: "Database",          color: "#10b981", bg: "#d1fae5" },
    ctr_pct:   { label: "CTR PCT",   icon: "MousePointerClick", color: "#6366f1", bg: "#e0e7ff" },
    cpm_usd:   { label: "CPM USD",   icon: "Users",             color: "#8b5cf6", bg: "#ede9fe" },
    cpc_usd:   { label: "CPC USD",   icon: "MousePointer2",     color: "#f59e0b", bg: "#fef3c7" },
    cvr_pct:   { label: "CVR PCT",   icon: "Percent",           color: "#ec4899", bg: "#fce7f3" },
    cpa_usd:   { label: "CPA USD",   icon: "Target",            color: "#3b82f6", bg: "#dbeafe" },
    roas:      { label: "ROAS",      icon: "TrendingUp",        color: "#14b8a6", bg: "#ccfbf1" },
    results:   { label: "RESULTS",   icon: "FileText",          color: "#6366f1", bg: "#e0e7ff" },
    frequency: { label: "FREQUENCY", icon: "Clock",             color: "#14b8a6", bg: "#ccfbf1" },
  };

  const trendItems = lv.trend ? Object.entries(lv.trend) : [];

  const metrics = Object.entries(kpis)
    .filter(([, val]) => val && val !== "-" && !isNaN(parseFloat(String(val).replace(/[^0-9.\-]/g, ""))))
    .map(([k, val]) => {
      const meta = KPI_META[k.replace(/_/g, "")] || KPI_META[k] || { label: k.replace(/_/g, " ").toUpperCase(), icon: "BarChart2", color: "#6366f1", bg: "#e0e7ff" };
      return { k, val: fv(val), ...meta, raw: parseFloat(String(val).replace(/[^0-9.\-]/g, "")) };
    });

  // Calculate max values for horizontal bars
  const maxRaw = metrics.length > 0 ? Math.max(...metrics.map(m => m.raw)) : 1;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <div style={{ background: "#fff", borderRadius: 20, boxShadow: "0 4px 20px rgba(0,0,0,0.03)", border: "1px solid #f3f4f6", overflow: "hidden", position: "relative" }}>
        <div style={{ position: "absolute", top: 0, right: 0, width: "40%", height: "100%", background: "radial-gradient(ellipse at center right, #e0e7ff 0%, rgba(255,255,255,0) 70%)", zIndex: 0 }} />
        
        <div style={{ padding: "24px 32px", position: "relative", zIndex: 1, display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 20 }}>
          <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
            <div style={{ width: 64, height: 64, borderRadius: 16, background: "#e0e7ff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 4px 12px rgba(99,102,241,0.15)" }}>
               <Icon name={LEVEL_ICON[lv.level] || "Megaphone"} size={32} color="#4f46e5" />
            </div>
            <div>
              <div style={{ background: "#e0e7ff", color: "#4f46e5", padding: "2px 10px", borderRadius: 999, fontSize: 10, fontWeight: 800, letterSpacing: 0.5, textTransform: "uppercase", display: "inline-block", marginBottom: 6 }}>
                {lv.level}
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#111827", letterSpacing: "-0.5px" }}>{lv.name || "-"}</div>
              <div style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>
                Analyze your {lv.level.toLowerCase()} performance and key metrics at a glance.
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                <span style={{ background: vs.bg, color: vs.fg, padding: "4px 12px", borderRadius: 999, fontSize: 11, fontWeight: 800, letterSpacing: 0.5, textTransform: "uppercase", display: "flex", alignItems: "center", gap: 4 }}>
                  <Icon name={vs.icon} size={11} color={vs.fg} /> {vs.label}
                </span>
                <span style={{ background: cf.bg, color: cf.color, padding: "4px 12px", borderRadius: 999, fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
                  {cf.label === "Low Confidence" && <Icon name="AlertTriangle" size={11} color={cf.color} />}
                  {cf.label}
                </span>
                {trendItems.slice(0, 4).map(([k, tv]) => (
                  <span key={k} style={{ background: "#f8fafc", color: "#475569", padding: "4px 12px", borderRadius: 999, fontSize: 11, fontWeight: 700, border: "1px solid #e2e8f0" }}>{k} – {tv}</span>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 999, padding: "8px 16px", fontSize: 13, fontWeight: 600, color: "#374151", boxShadow: "0 2px 6px rgba(0,0,0,0.03)" }}>
              <Icon name="Calendar" size={14} color="#6b7280" />
              Last 7 days
              <Icon name="ChevronDown" size={14} color="#9ca3af" />
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 4, opacity: 0.8 }}>
              <div style={{ width: 6, height: 16, background: "#3b82f6", borderRadius: 2 }} />
              <div style={{ width: 6, height: 24, background: "#3b82f6", borderRadius: 2 }} />
              <div style={{ width: 6, height: 32, background: "#3b82f6", borderRadius: 2 }} />
              <Icon name="ArrowUpRight" size={16} color="#3b82f6" style={{ marginBottom: 16, marginLeft: -4 }} />
            </div>
          </div>
        </div>
      </div>

      {/* KPI panels */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Left: Key Metrics Grid */}
        <div style={{ background: "#fff", borderRadius: 20, padding: "24px 28px", border: "1px solid #f3f4f6", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <Icon name="BarChart2" size={20} color="#3b82f6" />
            <div style={{ fontSize: 18, fontWeight: 800, color: "#111827" }}>Key Metrics</div>
          </div>
          <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 20 }}>Main indicators for your {lv.level.toLowerCase()} performance.</div>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {metrics.map((m, i) => (
              <div key={i} style={{ background: "#fff", borderRadius: 16, padding: "16px", border: `1px solid ${m.bg}`, boxShadow: "0 2px 12px rgba(0,0,0,0.02)", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: -20, right: -20, width: 70, height: 70, background: `radial-gradient(circle, ${m.bg} 0%, rgba(255,255,255,0) 70%)`, opacity: 0.8, zIndex: 0 }} />
                <div style={{ display: "flex", alignItems: "center", gap: 8, zIndex: 1 }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: m.color, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                    <Icon name={m.icon} size={14} />
                  </div>
                  <div style={{ fontSize: 10, fontWeight: 800, color: "#6b7280", letterSpacing: 0.5, display: "flex", alignItems: "center", gap: 4 }}>
                    {m.label} <Icon name="Info" size={10} color="#9ca3af" />
                  </div>
                </div>
                <div style={{ fontSize: 20, fontWeight: 800, color: "#111827", marginTop: 12, zIndex: 1 }}>{m.val}</div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8, zIndex: 1 }}>
                  <div style={{ fontSize: 10.5, color: "#9ca3af", display: "flex", alignItems: "center", gap: 4, fontWeight: 600 }}>
                    <Icon name="ArrowRight" size={12} color={m.color} /> Stable
                  </div>
                  <svg width="32" height="12" viewBox="0 0 32 12" fill="none">
                    <path d="M 0 10 Q 8 10 16 6 T 32 2" stroke={m.color} strokeWidth="1.5" strokeLinecap="round" fill="none" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Performance Chart */}
        <div style={{ background: "#fff", borderRadius: 20, padding: "24px 28px", border: "1px solid #f3f4f6", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <Icon name="BarChart2" size={20} color="#3b82f6" />
            <div style={{ fontSize: 18, fontWeight: 800, color: "#111827" }}>Performance Chart</div>
          </div>
          <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 24 }}>Compare current spend, CTR, CPM and other key metrics.</div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {metrics.map((m, i) => {
              const pct = maxRaw > 0 ? Math.min(100, Math.max(5, (m.raw / maxRaw) * 100)) : 0;
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: m.color, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", flexShrink: 0 }}>
                    <Icon name={m.icon} size={14} />
                  </div>
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ fontSize: 10, fontWeight: 800, color: "#6b7280", letterSpacing: 0.5 }}>{m.label}</div>
                      <div style={{ fontSize: 12, fontWeight: 800, color: "#111827" }}>{m.val}</div>
                    </div>
                    <div style={{ width: "100%", height: 6, background: "#f3f4f6", borderRadius: 999, overflow: "hidden" }}>
                      <div style={{ width: `${pct}%`, height: "100%", background: m.color, borderRadius: 999 }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* KPI Health Table */}
      <div style={{ background: "#fff", borderRadius: 16, padding: "20px 24px", border: "1px solid #f3f4f6", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: "#111827", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 12 }}>KPI Health Analysis</div>
        <KpiTable statuses={lv.kpi_status || []} kpis={kpis} />
      </div>

      {/* Diagnosis / Action / Risk */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
        {lv.diagnostic && (
          <div style={{ background: "#fff", borderLeft: "4px solid #6366f1", borderRadius: 12, padding: "14px 16px", border: "1px solid #e0e7ff", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: "#4f46e5", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8, display: "flex", alignItems: "center", gap: 5 }}>
              <Icon name="SearchCode" size={12} color="#4f46e5" /> Root Cause
            </div>
            <div style={{ fontSize: 13, color: "#374151", lineHeight: 1.65 }}>{lv.diagnostic}</div>
          </div>
        )}
        {lv.action && (
          <div style={{ background: "#f0fdf4", borderLeft: "4px solid #10b981", borderRadius: 12, padding: "14px 16px", border: "1px solid #bbf7d0", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: "#059669", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8, display: "flex", alignItems: "center", gap: 5 }}>
              <Icon name="Zap" size={12} color="#059669" /> Action Required
            </div>
            <div style={{ fontSize: 13, color: "#374151", lineHeight: 1.65 }}>{lv.action}</div>
          </div>
        )}
        {lv.risk && (
          <div style={{ background: "#fffbeb", borderLeft: "4px solid #f59e0b", borderRadius: 12, padding: "14px 16px", border: "1px solid #fde68a", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: "#d97706", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8, display: "flex", alignItems: "center", gap: 5 }}>
              <Icon name="AlertTriangle" size={12} color="#d97706" /> Risk to Watch
            </div>
            <div style={{ fontSize: 13, color: "#374151", lineHeight: 1.65 }}>{lv.risk}</div>
          </div>
        )}
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════
   JOB-CARD STYLE (Ad Sets + Ads)
════════════════════════════════════════════════════════════ */
const LevelJobCard = ({ lv, onOpen }) => {
  const v  = (lv.verdict || "TEST").trim().toUpperCase();
  const vs = VERDICT_STYLE[v] || VERDICT_STYLE.TEST;
  const cf = confInfo(lv.confidence || "");
  const kpis = lv.kpis || {};

  const spend = fv(kpis.spend_usd || kpis.spend);
  const cpa   = fv(kpis.cpa_usd   || kpis.cpa);
  const roas  = fv(kpis.roas);
  const ctr   = fv(kpis.ctr_pct   || kpis.ctr);
  const cpm   = fv(kpis.cpm_usd   || kpis.cpm);
  const cpc   = fv(kpis.cpc_usd   || kpis.cpc);
  const cvr   = fv(kpis.cvr_pct   || kpis.cvr);

  const chips = [
    ctr  !== "-" && { label: `CTR ${ctr}`,   color: "#8b5cf6" },
    cpm  !== "-" && { label: `CPM $${cpm}`,  color: "#3b82f6" },
    cpc  !== "-" && { label: `CPC $${cpc}`,  color: "#f59e0b" },
    cvr  !== "-" && { label: `CVR ${cvr}`,   color: "#ec4899" },
    roas !== "-" && { label: `ROAS ${roas}x`, color: "#10b981" },
  ].filter(Boolean);

  const trendItems = lv.trend ? Object.entries(lv.trend).slice(0, 2) : [];
  const actionShort = (lv.action || "View analysis").slice(0, 52);

  const statuses   = lv.kpi_status || [];
  const goodCount  = statuses.filter(s => (s.status || "").toUpperCase() === "GOOD").length;
  const healthPct  = statuses.length > 0 ? Math.round((goodCount / statuses.length) * 100) : null;

  return (
    <div style={{ background: "#fff", borderRadius: 16, padding: 20, boxShadow: "0 4px 20px rgba(0,0,0,0.03)", border: "1px solid #f3f4f6", display: "flex", flexDirection: "column", gap: 0, fontFamily: "'Inter', system-ui, sans-serif", cursor: "pointer", transition: "transform 0.15s" }}
      onMouseOver={e => e.currentTarget.style.transform = "translateY(-2px)"}
      onMouseOut={e => e.currentTarget.style.transform = "translateY(0)"}
      onClick={() => onOpen && onOpen(lv)}>

      {/* Row 1: icon + name + confidence */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 16 }}>
        <div style={{ width: 42, height: 42, borderRadius: "50%", background: vs.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon name={LEVEL_ICON[lv.level] || "BarChart2"} size={20} color={vs.glow} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", letterSpacing: "-0.3px" }}>{lv.name || "Unnamed"}</div>
          <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>{lv.level}</div>
        </div>
        <div style={{ fontSize: 11, color: cf.color, fontWeight: 700, whiteSpace: "nowrap", marginTop: 2, background: cf.bg, padding: "2px 8px", borderRadius: 999 }}>{cf.label}</div>
      </div>

      {/* Row 2: verdict + trends + health */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
        <span style={{ background: vs.bg, color: vs.fg, padding: "4px 12px", borderRadius: 999, fontSize: 11, fontWeight: 800, letterSpacing: 0.5, textTransform: "uppercase", display: "flex", alignItems: "center", gap: 4 }}>
          <Icon name={vs.icon} size={11} color={vs.fg} /> {vs.label}
        </span>
        {trendItems.map(([k, tv]) => (
          <span key={k} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", color: "#475569", padding: "3px 10px", borderRadius: 999, fontSize: 10.5, fontWeight: 700 }}>{k}: {tv}</span>
        ))}
        {healthPct !== null && (
          <span style={{ background: healthPct >= 70 ? "#ecfdf5" : healthPct >= 40 ? "#fffbeb" : "#fef2f2", color: healthPct >= 70 ? "#059669" : healthPct >= 40 ? "#d97706" : "#dc2626", border: healthPct >= 70 ? "1px solid #a7f3d0" : healthPct >= 40 ? "1px solid #fde68a" : "1px solid #fecaca", padding: "3px 10px", borderRadius: 999, fontSize: 10.5, fontWeight: 700 }}>
            Health {healthPct}%
          </span>
        )}
      </div>

      {/* Row 3: spend / CPA / ROAS */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
        {(spend !== "-" || cpa !== "-") && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, color: "#4b5563" }}>
            <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon name="Banknote" size={12} color="#6b7280" />
            </div>
            <span>
              {spend !== "-" ? <><strong>${spend}</strong> spend</> : null}
              {spend !== "-" && cpa !== "-" ? <span style={{ color: "#d1d5db" }}> &nbsp;{"\u00b7"}&nbsp; </span> : null}
              {cpa !== "-" ? <>CPA <strong>${cpa}</strong></> : null}
            </span>
          </div>
        )}
        {roas !== "-" && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, color: "#4b5563" }}>
             <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon name="TrendingUp" size={12} color="#6b7280" />
            </div>
            <span>ROAS <strong>{roas}x</strong></span>
          </div>
        )}
        {lv.diagnostic && (
          <div style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 12.5, color: "#6b7280", lineHeight: 1.5, marginTop: 4 }}>
            <Icon name="SearchCode" size={14} color="#9ca3af" style={{ flexShrink: 0, marginTop: 2 }} />
            <span style={{ flex: 1 }}>{lv.diagnostic.slice(0, 90)}{lv.diagnostic.length > 90 ? "..." : ""}</span>
          </div>
        )}
      </div>

      {/* Row 4: KPI chip tags */}
      {chips.length > 0 && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 18 }}>
          {chips.slice(0, 4).map((ch, j) => (
            <span key={j} style={{ background: `${ch.color}11`, border: `1px solid ${ch.color}33`, padding: "4px 10px", borderRadius: 999, fontSize: 11, color: ch.color, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 5 }}>
              {ch.label}
            </span>
          ))}
          {chips.length > 4 && (
            <span style={{ border: "1px solid #e5e7eb", padding: "4px 10px", borderRadius: 999, fontSize: 11, color: "#9ca3af", fontWeight: 700, background: "#f9fafb" }}>+{chips.length - 4} more</span>
          )}
        </div>
      )}

      {/* Risk strip */}
      {lv.risk && (
        <div style={{ background: "#fef2f2", borderRadius: 10, padding: "8px 12px", fontSize: 12, color: "#b91c1c", border: "1px solid #fecaca", display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 16, lineHeight: 1.5 }}>
          <Icon name="AlertTriangle" size={14} color="#ef4444" style={{ flexShrink: 0 }} />
          <span>{lv.risk.slice(0, 100)}{lv.risk.length > 100 ? "..." : ""}</span>
        </div>
      )}

      {/* Action button */}
      <div style={{ display: "flex", gap: 10, marginTop: "auto" }}>
        <button style={{ width: "100%", height: 42, borderRadius: 12, border: "1px solid #e0e7ff", background: "#e0e7ff", color: "#4f46e5", fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
          onClick={e => e.stopPropagation()}>
          {actionShort || "View Action"} <Icon name="ArrowRight" size={14} />
        </button>
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════
   INSIGHT BARS (replaces Sticky Notes)
════════════════════════════════════════════════════════════ */
const PASTEL = [
  { bg: "#fffbeb", num: "#d97706", border: "#fde68a" },
  { bg: "#eff6ff", num: "#2563eb", border: "#bfdbfe" },
  { bg: "#f5f3ff", num: "#7c3aed", border: "#ddd6fe" },
  { bg: "#ecfdf5", num: "#059669", border: "#a7f3d0" },
  { bg: "#fef2f2", num: "#dc2626", border: "#fecaca" },
  { bg: "#f0f9ff", num: "#0284c7", border: "#bae6fd" },
];

const InsightBar = ({ num, title, subtitle, body, extra, pastel }) => (
  <div style={{ background: pastel.bg, borderRadius: 16, padding: "20px 24px", border: `1px solid ${pastel.border}`, display: "flex", gap: 20, alignItems: "center", boxShadow: "0 2px 10px rgba(0,0,0,0.02)" }}>
    <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", color: pastel.num, fontSize: 18, fontWeight: 800, flexShrink: 0, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
      {num}
    </div>
    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: "#111827" }}>{title}</div>
        {subtitle && <div style={{ fontSize: 12, fontWeight: 700, color: pastel.num }}>{subtitle}</div>}
      </div>
      {body && <div style={{ fontSize: 13.5, color: "#4b5563", lineHeight: 1.5 }}>{body}</div>}
    </div>
    {extra && (
      <div style={{ background: "#fff", borderRadius: 10, padding: "10px 14px", fontSize: 12, color: "#059669", fontWeight: 700, flexShrink: 0, maxWidth: 220, border: "1px solid #e5e7eb" }}>
        Fix: {extra}
      </div>
    )}
  </div>
);

const ZigzagList = ({ items }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 12, paddingTop: 10 }}>
    {items.map((it, i) => {
      const pastel = PASTEL[i % PASTEL.length];
      return (
        <InsightBar key={i} num={i + 1} title={it.title} subtitle={it.subtitle} body={it.body} extra={it.extra} pastel={pastel} />
      );
    })}
  </div>
);

/* ════════════════════════════════════════════════════════════
   STEP COMPONENTS
════════════════════════════════════════════════════════════ */

/* Step 1 — Overview */
const StepOverview = ({ data }) => {
  const exec    = data.executive_summary || {};
  const summary = data.summary || {};
  const levels  = data.levels || [];

  const TILES = [
    { label: "TOTAL SPEND", val: fv(summary.total_spend), color: "#10b981", bg: "#d1fae5", icon: "DollarSign" },
    { label: "CTR",         val: fv(summary.avg_ctr_pct), color: "#8b5cf6", bg: "#ede9fe", icon: "MousePointerClick" },
    { label: "CPM",         val: fv(summary.avg_cpm_usd), color: "#3b82f6", bg: "#dbeafe", icon: "Eye" },
    { label: "CPC",         val: fv(summary.avg_cpc_usd), color: "#f59e0b", bg: "#fef3c7", icon: "MousePointer2" },
    { label: "CVR",         val: fv(summary.avg_cvr_pct), color: "#ec4899", bg: "#fce7f3", icon: "RefreshCw" },
    { label: "CPA",         val: fv(summary.avg_cpa_usd), color: "#14b8a6", bg: "#ccfbf1", icon: "Users" },
    { label: "ROAS",        val: fv(summary.avg_roas),    color: "#3b82f6", bg: "#dbeafe", icon: "ArrowUpRight" },
  ];

  const BARS = [
    { id: "Priority #1", text: exec.priority_1 || "No immediate critical actions required.", color: "#f59e0b", bg: "#fffbeb", icon: "Crown" },
    { id: "Budget plan", text: exec.budget_plan || "Budget allocation is currently stable.", color: "#10b981", bg: "#ecfdf5", icon: "Database" },
    { id: "Main alert",  text: exec.main_alert || "All core metrics are within expected ranges.", color: "#ef4444", bg: "#fef2f2", icon: "AlertTriangle" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Metric Tiles Row */}
      <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 8 }}>
        {TILES.map((t, i) => (
          <div key={i} style={{ background: "#fff", borderRadius: 16, padding: "20px 16px", border: "1px solid #f3f4f6", boxShadow: "0 4px 20px rgba(0,0,0,0.03)", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden", minWidth: 140, flex: 1 }}>
            {/* Top right gradient blob */}
            <div style={{ position: "absolute", top: -20, right: -20, width: 80, height: 80, background: `radial-gradient(circle, ${t.bg} 0%, rgba(255,255,255,0) 70%)`, opacity: 0.8, zIndex: 0 }} />
            
            <div style={{ display: "flex", alignItems: "center", gap: 8, zIndex: 1 }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: t.color, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                <Icon name={t.icon} size={16} />
              </div>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#6b7280", letterSpacing: 0.5 }}>{t.label}</div>
            </div>
            
            <div style={{ fontSize: 22, fontWeight: 800, color: "#111827", marginTop: 16, zIndex: 1 }}>{t.val !== "-" ? t.val : "-"}</div>
            
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 10, zIndex: 1 }}>
              <div style={{ fontSize: 11, color: "#9ca3af", display: "flex", alignItems: "center", gap: 4 }}>
                <Icon name="ArrowRight" size={12} /> (stable)
              </div>
              {/* Fake tiny sparkline */}
              <svg width="36" height="14" viewBox="0 0 36 14" fill="none">
                <path d="M 0 12 Q 9 12 18 7 T 36 2" stroke={t.color} strokeWidth="1.5" strokeLinecap="round" fill="none" />
              </svg>
            </div>
          </div>
        ))}
      </div>

      {/* Action Bars */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {BARS.map((b, i) => (
          <div key={i} style={{ background: b.bg, borderRadius: 12, padding: "16px 20px", display: "flex", alignItems: "center", gap: 20, border: `1px solid ${b.color}22` }}>
            <div style={{ width: 44, height: 44, borderRadius: "50%", background: b.color, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", flexShrink: 0 }}>
              <Icon name={b.icon} size={20} />
            </div>
            <div style={{ fontSize: 15, fontWeight: 800, color: b.color, width: 110, flexShrink: 0 }}>{b.id}</div>
            <div style={{ flex: 1, fontSize: 13.5, color: "#4b5563", lineHeight: 1.5 }}>
              {b.text}
            </div>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", color: b.color, flexShrink: 0, cursor: "pointer" }}>
              <Icon name="ArrowRight" size={14} />
            </div>
          </div>
        ))}
      </div>

      {/* Campaign Structure OrgChart */}
      {levels.length > 0 && (
        <div style={{ background: "#fff", borderRadius: 20, padding: "24px", border: "1px solid #f3f4f6", boxShadow: "0 4px 20px rgba(0,0,0,0.03)", marginTop: 8 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: "#9ca3af", letterSpacing: 1, textTransform: "uppercase", marginBottom: 24 }}>Campaign Structure</div>
          <OrgChart levels={levels} />
        </div>
      )}
    </div>
  );
};

/* Step 2 — Campaigns */
const StepCampaigns = ({ levels }) => {
  const campaigns = levels.filter(l => l.level === "Campaign");
  const [selected, setSelected] = useState(0);
  if (campaigns.length === 0) return <EmptyLevel label="Campaign" />;
  return <LevelSelector items={campaigns} selected={selected} onSelect={setSelected} />;
};

/* Step 3 — Ad Sets (job-listing card grid) */
const StepAdSets = ({ levels }) => {
  const adSets = levels.filter(l => l.level === "Ad Set");
  const [detailIdx, setDetailIdx] = useState(null);
  if (adSets.length === 0) return <EmptyLevel label="Ad Set" />;

  const compareItems = adSets.map(as => ({ label: as.name || "Ad Set", value: fv(as.kpis?.roas || "0"), color: (VERDICT_STYLE[(as.verdict || "TEST").toUpperCase()] || VERDICT_STYLE.TEST).glow }));

  if (detailIdx !== null) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <button onClick={() => setDetailIdx(null)} style={{ display: "flex", alignItems: "center", gap: 6, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: "8px 16px", fontSize: 13, fontWeight: 700, color: "#374151", cursor: "pointer", alignSelf: "flex-start" }}>
          <Icon name="ChevronLeft" size={14} color="#374151" /> Back to all Ad Sets
        </button>
        <LevelDetailPage lv={adSets[detailIdx]} />
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {adSets.length > 1 && (
        <div style={{ background: "#fff", borderRadius: 14, padding: "16px 18px", border: "1px solid #f0f0f5", boxShadow: "0 2px 10px rgba(0,0,0,0.04)" }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: "#9ca3af", letterSpacing: 1, textTransform: "uppercase", marginBottom: 14 }}>ROAS Comparison - All Ad Sets</div>
          <BarChart items={compareItems} color="#6366f1" />
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 18 }}>
        {adSets.map((as, i) => <LevelJobCard key={i} lv={as} onOpen={() => setDetailIdx(i)} />)}
      </div>
    </div>
  );
};

/* Step 4 — Ads (job-listing card grid) */
const StepAds = ({ levels }) => {
  const ads = levels.filter(l => l.level === "Ad");
  const [detailIdx, setDetailIdx] = useState(null);
  if (ads.length === 0) return <EmptyLevel label="Ad" />;

  const compareItems = ads.map(ad => ({ label: ad.name || "Ad", value: fv(ad.kpis?.ctr_pct || "0"), color: (VERDICT_STYLE[(ad.verdict || "TEST").toUpperCase()] || VERDICT_STYLE.TEST).glow }));

  if (detailIdx !== null) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <button onClick={() => setDetailIdx(null)} style={{ display: "flex", alignItems: "center", gap: 6, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: "8px 16px", fontSize: 13, fontWeight: 700, color: "#374151", cursor: "pointer", alignSelf: "flex-start" }}>
          <Icon name="ChevronLeft" size={14} color="#374151" /> Back to all Ads
        </button>
        <LevelDetailPage lv={ads[detailIdx]} />
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {ads.length > 1 && (
        <div style={{ background: "#fff", borderRadius: 14, padding: "16px 18px", border: "1px solid #f0f0f5", boxShadow: "0 2px 10px rgba(0,0,0,0.04)" }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: "#9ca3af", letterSpacing: 1, textTransform: "uppercase", marginBottom: 14 }}>CTR Comparison - All Ads</div>
          <BarChart items={compareItems} color="#10b981" />
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 18 }}>
        {ads.map((ad, i) => <LevelJobCard key={i} lv={ad} onOpen={() => setDetailIdx(i)} />)}
      </div>
    </div>
  );
};

const SplitViewWithSelector = ({ leftContent, levels }) => {
  const [selected, setSelected] = useState(0);
  if (!levels || levels.length === 0) return <>{leftContent}</>;
  
  return (
    <div style={{ display: "flex", gap: 32, alignItems: "flex-start", flexWrap: "wrap" }}>
      <div style={{ flex: "1 1 500px", minWidth: 0 }}>
        {leftContent}
      </div>
      <div style={{ width: 420, flexShrink: 0, flexGrow: 1, position: "sticky", top: 20 }}>
        <div style={{ background: "#fcfcfd", borderRadius: 16, border: "1px solid #e5e7eb", padding: "20px", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 16, paddingLeft: 4 }}>Inspector</div>
          <LevelSelector items={levels} selected={selected} onSelect={setSelected} />
        </div>
      </div>
    </div>
  );
};

/* Step 5 — Highlights (sticky-note zigzag) */
const StepHighlights = ({ data, levels = [] }) => {
  const sections = [
    { key: "winners",            icon: "Trophy",      label: "Top Winners",           sub: "Best performing - scale these",       render: x => ({ title: x.name || "-",        subtitle: x.metric,     body: x.why_it_wins   })                          },
    { key: "losers",             icon: "TrendingDown", label: "Underperformers",      sub: "Pause or kill - leaking budget",       render: x => ({ title: x.name || "-",        subtitle: x.metric,     body: x.why_it_loses  })                          },
    { key: "fatigue_risks",      icon: "Flame",       label: "Creative Fatigue",      sub: "CTR drop + Frequency high = refresh",  render: x => ({ title: x.name || "-",        body: x.signals        })                                               },
    { key: "audience_overlap",   icon: "Shuffle",     label: "Audience Overlap",      sub: "Ad sets cannibalizing each other",     render: x => ({ title: x.audiences || "-",   body: x.risk,           extra: x.exclusions   })                          },
    { key: "scaling_candidates", icon: "Rocket",      label: "Scale Candidates",      sub: "Ready to increase budget now",         render: x => ({ title: x.name || "-",        body: x.plan           })                                               },
  ];

  const leftContent = (
    <div style={{ display: "flex", flexDirection: "column", gap: 36, background: "linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)", borderRadius: 16, padding: "20px 10px" }}>
      {sections.map(sec => {
        const items = data[sec.key] || [];
        return (
          <div key={sec.key}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, paddingLeft: 8 }}>
              <Icon name={sec.icon} size={16} color="#374151" />
              <div style={{ fontSize: 15, fontWeight: 800, color: "#111827" }}>{sec.label}</div>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", background: "#e5e7eb", padding: "1px 9px", borderRadius: 999 }}>{items.length}</span>
            </div>
            <div style={{ fontSize: 12, color: "#9ca3af", paddingLeft: 8, marginBottom: 8 }}>{sec.sub}</div>
            {items.length === 0
              ? <div style={{ fontSize: 12.5, color: "#d1d5db", paddingLeft: 8, fontStyle: "italic" }}>No data - collect more impressions.</div>
              : <ZigzagList items={items.map(x => sec.render(x))} />
            }
          </div>
        );
      })}
    </div>
  );
  
  return <SplitViewWithSelector leftContent={leftContent} levels={levels} />;
};

/* Step 6 — Action Plan (sticky-note zigzag + timeline) */
const StepActionPlan = ({ data, levels = [] }) => {
  const actions = data.actions || [];
  const recs    = data.recommendations || [];
  const exec    = data.executive_summary || {};

  const PRIORITY    = ["KILL", "STOP", "PAUSE", "FIX", "SCALE", "TEST"];
  const ACTION_META = {
    KILL:  { label: "Kill",  when: "Do now - today",    col: "#ef4444" },
    STOP:  { label: "Stop",  when: "Do now - today",    col: "#ef4444" },
    PAUSE: { label: "Pause", when: "Today",             col: "#f59e0b" },
    FIX:   { label: "Fix",   when: "This week",         col: "#f59e0b" },
    SCALE: { label: "Scale", when: "Today / D+3 check", col: "#10b981" },
    TEST:  { label: "Test",  when: "Next cycle",        col: "#6366f1" },
  };

  const sorted = [...actions].sort((a, b) => {
    const ia = PRIORITY.indexOf((a.type || "").toUpperCase());
    const ib = PRIORITY.indexOf((b.type || "").toUpperCase());
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });

  const grouped = {};
  sorted.forEach(a => { const t = (a.type || "OTHER").toUpperCase(); if (!grouped[t]) grouped[t] = []; grouped[t].push(a); });
  const countByType = PRIORITY.map(t => ({ type: t, count: (grouped[t] || []).length, meta: ACTION_META[t] || { col: "#9ca3af", label: t } })).filter(x => x.count > 0);

  const notes    = sorted.map(a => { const t = (a.type || "OTHER").toUpperCase(); const m = ACTION_META[t] || { label: t, when: "ASAP" }; return { title: m.label, subtitle: `=> ${m.when}`, body: a.what }; });
  const recNotes = recs.map((r, k) => ({ title: `Recommendation ${k + 1}`, body: r }));

  const leftContent = (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {exec.priority_1 && (
        <div style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)", borderRadius: 14, padding: "18px 22px", color: "#fff", display: "flex", gap: 18, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: "#a5b4fc", letterSpacing: 1, textTransform: "uppercase", whiteSpace: "nowrap" }}>This Week's #1</div>
          <div style={{ fontSize: 14, color: "#e0e7ff", lineHeight: 1.55, flex: 1 }}>{exec.priority_1}</div>
        </div>
      )}

      {countByType.length > 0 && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {countByType.map(x => (
            <div key={x.type} style={{ background: x.meta.col + "12", border: `1.5px solid ${x.meta.col}33`, borderRadius: 12, padding: "10px 16px", display: "flex", flexDirection: "column", gap: 2, alignItems: "center", minWidth: 80 }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: x.meta.col }}>{x.count}</div>
              <div style={{ fontSize: 10.5, fontWeight: 700, color: x.meta.col, textTransform: "uppercase", letterSpacing: 0.5 }}>{x.meta.label}</div>
            </div>
          ))}
        </div>
      )}

      {notes.length > 0 && (
        <div style={{ background: "linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)", borderRadius: 16, padding: "20px 10px" }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: "#9ca3af", letterSpacing: 1, textTransform: "uppercase", marginBottom: 4, paddingLeft: 8 }}>Prioritised Actions</div>
          <ZigzagList items={notes} />
        </div>
      )}

      {exec.budget_plan && (
        <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 14, padding: "16px 20px", display: "flex", gap: 12, alignItems: "flex-start" }}>
          <Icon name="DollarSign" size={20} color="#059669" />
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, color: "#059669", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 5 }}>Budget Reallocation Plan</div>
            <div style={{ fontSize: 13.5, color: "#374151", lineHeight: 1.65 }}>{exec.budget_plan}</div>
          </div>
        </div>
      )}

      {recNotes.length > 0 && (
        <div style={{ background: "linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)", borderRadius: 16, padding: "20px 10px" }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: "#9ca3af", letterSpacing: 1, textTransform: "uppercase", marginBottom: 4, paddingLeft: 8 }}>Strategic Recommendations</div>
          <ZigzagList items={recNotes} />
        </div>
      )}

      {sorted.length === 0 && recs.length === 0 && <EmptyLevel label="actions" />}
    </div>
  );
  
  return <SplitViewWithSelector leftContent={leftContent} levels={levels} />;
};

/* ════════════════════════════════════════════════════════════
   SHARED SUB-COMPONENTS
════════════════════════════════════════════════════════════ */
const EmptyLevel = ({ label }) => (
  <div style={{ textAlign: "center", padding: "40px 24px", background: "#fff", borderRadius: 14, border: "1px dashed #e5e7eb" }}>
    <Icon name="BarChart2" size={32} color="#d1d5db" />
    <div style={{ marginTop: 10, fontWeight: 600, color: "#6b7280", fontSize: 14 }}>No {label} data available</div>
    <div style={{ marginTop: 4, color: "#9ca3af", fontSize: 13 }}>The AI analysis didn't return data at this level.</div>
  </div>
);

const LevelSelector = ({ items, selected, onSelect }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
    {items.length > 1 && (
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {items.map((lv, i) => {
          const v  = (lv.verdict || "TEST").toUpperCase().trim();
          const vs = VERDICT_STYLE[v] || VERDICT_STYLE.TEST;
          const active = i === selected;
          return (
            <button key={i} onClick={() => onSelect(i)} style={{ display: "flex", alignItems: "center", gap: 6, background: active ? vs.glow : "#fff", color: active ? "#fff" : "#374151", border: active ? "none" : "1px solid #e5e7eb", borderRadius: 999, padding: "6px 14px", fontSize: 12.5, fontWeight: 700, cursor: "pointer", boxShadow: active ? `0 4px 12px ${vs.glow}44` : "none", transition: "all 0.2s" }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: active ? "#fff" : vs.glow }} />
              {lv.name || `Item ${i + 1}`}
            </button>
          );
        })}
      </div>
    )}
    <LevelDetailPage lv={items[selected]} />
  </div>
);

/* ════════════════════════════════════════════════════════════
   NEW STEPS (FUNNEL, CREATIVES, BUDGET)
════════════════════════════════════════════════════════════ */

/* Step 7 — Funnel Health */
const StepFunnelHealth = ({ levels }) => {
  if (!levels || levels.length === 0) return <EmptyLevel label="funnel" />;
  
  // Calculate average CTR and CVR
  let ctrSum = 0, cvrSum = 0, count = 0;
  levels.forEach(lv => {
     if(lv.kpis) {
        const ctr = parseFloat(String(lv.kpis.ctr_pct || lv.kpis.ctr || "").replace(/[^0-9.]/g, ""));
        const cvr = parseFloat(String(lv.kpis.cvr_pct || lv.kpis.cvr || "").replace(/[^0-9.]/g, ""));
        if (!isNaN(ctr)) ctrSum += ctr;
        if (!isNaN(cvr)) cvrSum += cvr;
        if (!isNaN(ctr) || !isNaN(cvr)) count++;
     }
  });
  
  const avgCtr = count > 0 && ctrSum > 0 ? (ctrSum / count).toFixed(2) : 2.5;
  const avgCvr = count > 0 && cvrSum > 0 ? (cvrSum / count).toFixed(2) : 3.0;
  const ctrW = Math.min(100, Math.max(40, avgCtr * 20));
  const cvrW = Math.min(100, Math.max(10, avgCvr * 10));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ background: "#fff", borderRadius: 16, padding: "30px", border: "1px solid #e5e7eb", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: "#111827", marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}><Icon name="Filter" size={20} color="#3b82f6" /> Conversion Funnel Health</div>
        <div style={{ color: "#6b7280", fontSize: 13.5, marginBottom: 32, lineHeight: 1.5 }}>
          Visualizing the journey from impressions to purchases across your account.<br/>
          Identify the biggest drop-offs to know whether you need to fix your Ad Creative (CTR) or your Landing Page (CVR).
        </div>
        
        <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "center" }}>
           <div style={{ height: 48, width: "100%", background: "linear-gradient(90deg, #3b82f6, #60a5fa)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", color: "#fff", fontWeight: 700, boxShadow: "0 2px 8px rgba(59,130,246,0.3)" }}>
             <span>Impressions</span>
             <span>100%</span>
           </div>
           <Icon name="ArrowDown" size={16} color="#cbd5e1" />
           <div style={{ height: 48, width: `${ctrW}%`, minWidth: 200, background: "linear-gradient(90deg, #6366f1, #818cf8)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", color: "#fff", fontWeight: 700, boxShadow: "0 2px 8px rgba(99,102,241,0.3)" }}>
             <span>Clicks</span>
             <span>CTR: {avgCtr}%</span>
           </div>
           <Icon name="ArrowDown" size={16} color="#cbd5e1" />
           <div style={{ height: 48, width: `${cvrW}%`, minWidth: 150, background: "linear-gradient(90deg, #10b981, #34d399)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", color: "#fff", fontWeight: 700, boxShadow: "0 2px 8px rgba(16,185,129,0.3)" }}>
             <span>Purchases</span>
             <span>CVR: {avgCvr}%</span>
           </div>
        </div>
      </div>
    </div>
  );
};

/* Step 8 — Creative Matrix */
const StepCreativeMatrix = ({ levels }) => {
  const ads = levels.filter(l => l.level === "Ad");
  if (ads.length === 0) return <EmptyLevel label="creatives" />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ background: "#fff", borderRadius: 16, padding: "24px", border: "1px solid #e5e7eb", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: "#111827", marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}><Icon name="PenTool" size={18} color="#f59e0b" /> Creative Performance Matrix</div>
        <div style={{ color: "#6b7280", fontSize: 13, marginBottom: 24 }}>Compare all your ad creatives side-by-side to spot winning angles.</div>
        
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {ads.map((ad, i) => (
             <div key={i} style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 16, background: "#f8fafc" }}>
               <div style={{ fontSize: 13, fontWeight: 800, color: "#111827", marginBottom: 12 }}>{ad.name}</div>
               <div style={{ display: "flex", gap: 16 }}>
                 <div>
                   <div style={{ fontSize: 10, color: "#6b7280", textTransform: "uppercase", fontWeight: 700 }}>ROAS</div>
                   <div style={{ fontSize: 16, fontWeight: 800, color: "#10b981" }}>{fv(ad.kpis?.roas) || "-"}</div>
                 </div>
                 <div>
                   <div style={{ fontSize: 10, color: "#6b7280", textTransform: "uppercase", fontWeight: 700 }}>CPA</div>
                   <div style={{ fontSize: 16, fontWeight: 800, color: "#ef4444" }}>${fv(ad.kpis?.cpa_usd || ad.kpis?.cpa) || "-"}</div>
                 </div>
                 <div>
                   <div style={{ fontSize: 10, color: "#6b7280", textTransform: "uppercase", fontWeight: 700 }}>CTR</div>
                   <div style={{ fontSize: 16, fontWeight: 800, color: "#3b82f6" }}>{fv(ad.kpis?.ctr_pct || ad.kpis?.ctr) || "-"}%</div>
                 </div>
               </div>
               {ad.verdict && (
                  <div style={{ marginTop: 16, display: "inline-block", background: VERDICT_STYLE[ad.verdict.toUpperCase()]?.bg || "#e5e7eb", color: VERDICT_STYLE[ad.verdict.toUpperCase()]?.fg || "#374151", padding: "4px 10px", borderRadius: 99, fontSize: 10, fontWeight: 800 }}>
                    {ad.verdict.toUpperCase()}
                  </div>
               )}
             </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* Step 9 — Budget Allocation */
const StepBudgetAllocation = ({ levels }) => {
  const adsets = levels.filter(l => l.level === "Ad Set" || l.level === "Campaign");
  if (adsets.length === 0) return <EmptyLevel label="budget" />;
  
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ background: "#fff", borderRadius: 16, padding: "24px", border: "1px solid #e5e7eb", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: "#111827", marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}><Icon name="PieChart" size={18} color="#8b5cf6" /> Budget Distribution vs Return</div>
        <div style={{ color: "#6b7280", fontSize: 13, marginBottom: 24 }}>Identify where your money is going and whether it is generating a proportional return.</div>
        
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {adsets.map((ad, i) => {
             const spend = parseFloat(String(ad.kpis?.spend_usd || ad.kpis?.spend || "0").replace(/[^0-9.]/g, ""));
             const roas = parseFloat(String(ad.kpis?.roas || "0").replace(/[^0-9.]/g, ""));
             if (spend <= 0) return null;
             
             return (
               <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, padding: "12px 16px", background: "#f8fafc", borderRadius: 12, border: "1px solid #f1f5f9" }}>
                 <div style={{ width: 160, fontSize: 12, fontWeight: 700, color: "#374151" }}>{ad.name}</div>
                 <div style={{ flex: 1 }}>
                   <div style={{ fontSize: 10, color: "#6b7280", marginBottom: 4, display: "flex", justifyContent: "space-between" }}>
                     <span>Spend: ${spend}</span>
                     <span style={{ color: "#10b981", fontWeight: 700 }}>ROAS: {roas}x</span>
                   </div>
                   <div style={{ height: 6, width: "100%", background: "#e2e8f0", borderRadius: 99 }}>
                      <div style={{ height: 6, width: `${Math.min(100, (spend / 500) * 100)}%`, background: roas > 2 ? "#10b981" : roas < 1 ? "#ef4444" : "#f59e0b", borderRadius: 99 }} />
                   </div>
                 </div>
               </div>
             );
          })}
        </div>
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════
   MAIN STEPS NAV + ROOT COMPONENT
════════════════════════════════════════════════════════════ */
const STEPS = [
  { id: "overview",   label: "Overview",    num: 1, icon: "BarChart2",       desc: "Summary & org chart" },
  { id: "campaigns",  label: "Campaigns",   num: 2, icon: "LayoutTemplate",  desc: "Campaign-level deep dive" },
  { id: "adsets",     label: "Ad Sets",     num: 3, icon: "Users",           desc: "Ad set cards + deep dive" },
  { id: "ads",        label: "Ads",         num: 4, icon: "Image",           desc: "Ad creative analysis" },
  { id: "highlights", label: "Highlights",  num: 5, icon: "Star",            desc: "Winners, losers & risks" },
  { id: "actions",    label: "Action Plan", num: 6, icon: "Zap",             desc: "Prioritised next steps" },
  { id: "funnel",     label: "Funnel Health", num: 7, icon: "Filter",        desc: "Conversion drop-offs" },
  { id: "creatives",  label: "Creative Matrix", num: 8, icon: "PenTool",     desc: "Winning ad visuals" },
  { id: "budget",     label: "Budget Alloc",  num: 9, icon: "PieChart",      desc: "Spend vs Revenue" },
];

export default function AdKpiAnalysis({ data }) {
  const [step, setStep] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!data) return null;

  const levels  = data.levels || [];
  const hasData = levels.length > 0 || data.executive_summary || (data.actions || []).length > 0;

  if (!hasData) {
    return (
      <div style={{ textAlign: "center", padding: "48px 24px", background: "#f9fafb", borderRadius: 20, border: "1px dashed #e5e7eb", fontFamily: "'Inter', system-ui, sans-serif" }}>
        <Icon name="BarChart2" size={40} color="#d1d5db" />
        <div style={{ marginTop: 12, fontWeight: 700, color: "#6b7280", fontSize: 16 }}>No analysis data</div>
        <div style={{ marginTop: 6, color: "#9ca3af", fontSize: 14 }}>Connect the AdSet and Ad Table skill and re-run the analyzer.</div>
      </div>
    );
  }

  const currentStep = STEPS[step];
  const stepBody = {
    overview:   <StepOverview  data={data} />,
    campaigns:  <StepCampaigns levels={levels} />,
    adsets:     <StepAdSets    levels={levels} />,
    ads:        <StepAds       levels={levels} />,
    highlights: <StepHighlights data={data} levels={levels} />,
    actions:    <StepActionPlan data={data} levels={levels} />,
    funnel:     <StepFunnelHealth levels={levels} />,
    creatives:  <StepCreativeMatrix levels={levels} />,
    budget:     <StepBudgetAllocation levels={levels} />,
  };

  const content = (
    <div style={{ 
      ...(isFullScreen ? { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, overflowY: "auto", overflowX: "hidden" } : {}),
      background: "#f8fafc", padding: isFullScreen ? "40px" : "24px", minHeight: 600, fontFamily: "'Inter', system-ui, sans-serif" 
    }}>
      <div style={{ background: "#fff", borderRadius: 24, boxShadow: "0 8px 32px rgba(0,0,0,0.06)", overflow: "hidden", position: "relative", minHeight: isFullScreen ? "calc(100vh - 80px)" : "auto" }}>
        
        {/* Top Header Background blob */}
        <div style={{ position: "absolute", top: 0, right: 0, width: "50%", height: 220, background: "radial-gradient(ellipse at top right, #e0e7ff 0%, rgba(255,255,255,0) 70%)", zIndex: 0 }} />

        {/* Header Content */}
        <div style={{ padding: "32px 32px 24px", position: "relative", zIndex: 1, display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 20 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <div style={{ background: "#1877F2", width: 24, height: 24, borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 16 }}>f</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#374151" }}>Facebook Ads</div>
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: "#111827", letterSpacing: "-0.5px" }}>Your ads health report</div>
            <div style={{ fontSize: 13, color: "#9ca3af", marginTop: 8, lineHeight: 1.5 }}>
              Current period vs previous period — no temporal data provided upstream,<br/>
              trends marked → (stable) by default
            </div>
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button 
                onClick={() => setIsFullScreen(!isFullScreen)}
                style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 999, padding: "8px 14px", display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 12, fontWeight: 700, color: "#4b5563", boxShadow: "0 2px 6px rgba(0,0,0,0.03)", transition: "all 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.background = "#f9fafb"; e.currentTarget.style.borderColor = "#d1d5db"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.borderColor = "#e5e7eb"; }}
              >
                <Icon name={isFullScreen ? "Minimize2" : "Maximize2"} size={14} color="#6b7280" />
                {isFullScreen ? "EXIT FULLSCREEN" : "FULLSCREEN"}
              </button>
              <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 999, padding: "8px 16px", fontSize: 13, fontWeight: 600, color: "#374151", boxShadow: "0 2px 6px rgba(0,0,0,0.03)" }}>
                <Icon name="Calendar" size={14} color="#6b7280" />
                Last 7 days
                <Icon name="ChevronDown" size={14} color="#9ca3af" />
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 4, opacity: 0.8 }}>
              <div style={{ width: 6, height: 16, background: "#3b82f6", borderRadius: 2 }} />
              <div style={{ width: 6, height: 24, background: "#3b82f6", borderRadius: 2 }} />
              <div style={{ width: 6, height: 32, background: "#3b82f6", borderRadius: 2 }} />
            </div>
          </div>
        </div>

        {/* Step tabs (pill style) */}
        <div style={{ padding: "0 32px", display: "flex", gap: 12, position: "relative", zIndex: 1, marginBottom: 32, overflowX: "auto", paddingBottom: 8 }}>
          {STEPS.map((s, i) => {
            const active = i === step;
            return (
              <button key={s.id} onClick={() => setStep(i)} style={{ 
                display: "flex", alignItems: "center", gap: 8, 
                padding: "8px 20px 8px 8px", 
                background: active ? "#3b82f6" : "#fff", 
                border: active ? "1px solid #3b82f6" : "1px solid #f3f4f6", 
                borderRadius: 999, 
                color: active ? "#fff" : "#4b5563", 
                fontSize: 14, fontWeight: active ? 700 : 600, 
                cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.2s",
                boxShadow: active ? "0 4px 12px rgba(59,130,246,0.3)" : "0 2px 6px rgba(0,0,0,0.02)"
              }}>
                <div style={{ width: 26, height: 26, borderRadius: "50%", background: active ? "#fff" : "#f3f4f6", color: active ? "#3b82f6" : "#9ca3af", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800 }}>
                  {s.num}
                </div>
                {s.label}
              </button>
            );
          })}
        </div>

        {/* Body */}
        <div style={{ padding: "0 32px 32px", minHeight: 300, position: "relative", zIndex: 1 }}>
          {stepBody[currentStep.id]}
        </div>

        {/* Footer nav */}
        <div style={{ borderTop: "1px solid #f3f4f6", padding: "20px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fcfcfd", flexWrap: "wrap", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#9ca3af", fontSize: 12 }}>
            <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#e0e7ff", color: "#4f46e5", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, flexShrink: 0 }}>i</div>
            These are your headline numbers for the period — tap Next to see the charts, the level-by-level detail and the plan.
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0} style={{ background: "#fff", color: step === 0 ? "#d1d5db" : "#6b7280", border: "1px solid #e5e7eb", borderRadius: 12, padding: "10px 24px", fontSize: 14, fontWeight: 700, cursor: step === 0 ? "not-allowed" : "pointer", transition: "all 0.2s" }}>
              ← Back
            </button>
            <button onClick={() => setStep(s => Math.min(STEPS.length - 1, s + 1))} disabled={step === STEPS.length - 1} style={{ background: step === STEPS.length - 1 ? "#e5e7eb" : "#3b82f6", color: step === STEPS.length - 1 ? "#9ca3af" : "#fff", border: "none", borderRadius: 12, padding: "10px 24px", fontSize: 14, fontWeight: 700, cursor: step === STEPS.length - 1 ? "not-allowed" : "pointer", transition: "all 0.2s" }}>
              {step === STEPS.length - 1 ? "Done" : "Next →"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );

  if (isFullScreen && mounted) {
    return (
      <>
        <div style={{ width: "100%", minHeight: 600, background: "#f8fafc", borderRadius: 24, display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", fontWeight: 700, border: "1px dashed #e2e8f0" }}>
          Viewing in Fullscreen...
        </div>
        {createPortal(content, document.body)}
      </>
    );
  }

  return content;
}