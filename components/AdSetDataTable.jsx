import React, { useState } from "react";

const BASE_KPIS = [
  { key: "impressions", label: "Impressions" },
  { key: "reach", label: "Reach" },
  { key: "frequency", label: "Freq" },
  { key: "ctr_pct", label: "CTR %" },
  { key: "cpm_usd", label: "CPM $" },
  { key: "cpc_usd", label: "CPC $" },
  { key: "cvr_pct", label: "CVR %" },
  { key: "cpa_usd", label: "CPA $" },
  { key: "roas", label: "ROAS" },
  { key: "budget_usd", label: "Budget $" },
  { key: "clicks", label: "Clicks" },
  { key: "spend_usd", label: "Spend $" },
  { key: "results", label: "Results" },
  { key: "cost_per_result", label: "Cost/Result $" },
  { key: "add_to_cart_cost", label: "ATC Cost $" },
  { key: "initiate_checkout_cost", label: "IC Cost $" },
  { key: "video_3s_views", label: "3s Views" },
  { key: "engagement_rate", label: "Eng. %" }
];

const kpiObj = (row) => (row && typeof row === "object" ? (row.kpis || row) : {});

const collectKeys = (campaign, adSets) => {
  const keys = BASE_KPIS.map(c => c.key);
  const extra = [];
  const visit = (obj) => {
    const k = kpiObj(obj);
    Object.keys(k).forEach(key => { if (!keys.includes(key) && !extra.includes(key)) extra.push(key); });
  };
  visit(campaign);
  (adSets || []).forEach(a => {
    visit(a);
    (a.ads || []).forEach(ad => visit(ad));
  });
  return { extras: extra.filter(key => key !== "extra_kpis") };
};

const kpiValue = (row, key) => {
  const k = kpiObj(row);
  if (k[key] !== undefined && k[key] !== null && k[key] !== "") return k[key];
  if (k.extra_kpis && k.extra_kpis[key]) return k.extra_kpis[key];
  return "—";
};

const rowStyle = (level) => level === "campaign"
  ? { background: "#1e293b", color: "#fff", fontWeight: 800 }
  : level === "adset"
    ? { background: "#f1f5f9", fontWeight: 700, color: "#0f172a" }
    : { background: "#fff", color: "#475569" };

const cell = { padding: "8px 10px", borderBottom: "1px solid #e2e8f0", fontSize: 12, textAlign: "left", whiteSpace: "nowrap" };

const VIEWS = [
  { key: "campaign", label: "Campaign" },
  { key: "adsets", label: "Ad Sets" },
  { key: "ads", label: "Ads" },
  { key: "all", label: "All Levels" }
];

export default function AdSetDataTable({ data }) {
  const [view, setView] = useState("all");
  if (!data) return null;

  const campaign = data.campaign_metrics || data.campaign || {};
  const adSets = data.ad_sets || [];
  const { extras } = collectKeys(campaign, adSets);
  const cols = [...BASE_KPIS, ...extras.map(k => ({ key: k, label: k.replace(/_/g, " ") }))];

  let totalAds = 0;
  adSets.forEach(a => { totalAds += (a.ads || []).length; });

  const headerCell = { padding: "8px 10px", fontSize: 10, fontWeight: 800, color: "#0f172a", textTransform: "uppercase", letterSpacing: 0.3, textAlign: "left", borderBottom: "1px solid #cbd5e1", whiteSpace: "nowrap" };

  const rows = [];
  if (view === "campaign" || view === "all") {
    rows.push({ level: "campaign", cells: [<td key="s" style={{ ...cell, ...rowStyle("campaign") }}>🗂 {campaign.name || campaign.campaign || "Campaign"}</td>, <td key="d" style={{ ...cell, ...rowStyle("campaign") }}>Objective: {campaign.objective || "—"}</td>, ...cols.map(c => <td key={c.key} style={{ ...cell, ...rowStyle("campaign") }}>{kpiValue(campaign, c.key)}</td>)] });
  }
  if (view === "adsets" || view === "all") {
    adSets.forEach(a => {
      rows.push({ level: "adset", cells: [<td key="s" style={{ ...cell, ...rowStyle("adset"), paddingLeft: 24 }}>▸ {a.ad_set || a.name || "Ad Set"}</td>, <td key="d" style={{ ...cell, ...rowStyle("adset") }}><span>{a.targeting || "—"}</span>{a.placement && <span style={{ opacity: 0.7 }}> · {a.placement}</span>}{a.optimization_goal && <span style={{ opacity: 0.7 }}> · {a.optimization_goal}</span>}</td>, ...cols.map(c => <td key={c.key} style={{ ...cell, ...rowStyle("adset") }}>{kpiValue(a, c.key)}</td>)] });
    });
  }
  if (view === "ads" || view === "all") {
    adSets.forEach(a => {
      (a.ads || []).forEach((ad, j) => {
        const summary = [typeof ad === "string" ? ad : ad.ad, ad.format, ad.angle].filter(Boolean).join(" · ");
        rows.push({ level: "ad", cells: [<td key="s" style={{ ...cell, paddingLeft: 48 }}>· {typeof ad === "string" ? ad : (ad.ad || "Ad " + (j + 1))}</td>, <td key="d" style={{ ...cell }}><div style={{ maxWidth: 340, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={summary}>{summary}</div></td>, ...cols.map(c => <td key={c.key} style={{ ...cell, ...rowStyle("ad") }}>{kpiValue(ad, c.key)}</td>)] });
      });
    });
  }

  const counts = { campaign: 1, adsets: adSets.length, ads: totalAds };

  return (
    <div style={{ background: "#f8fafc", borderRadius: 12, border: "1px solid #e2e8f0", padding: 16 }}>
      {/* Campaign header chips */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12, alignItems: "center" }}>
        <span style={{ background: "#1e293b", color: "#fff", padding: "5px 10px", borderRadius: 8, fontSize: 12, fontWeight: 800 }}>{campaign.name || campaign.campaign || "Campaign"}</span>
        {campaign.objective && <span style={{ background: "#dbeafe", padding: "5px 10px", borderRadius: 8, fontSize: 11, fontWeight: 700, color: "#1d4ed8" }}>Objective: {campaign.objective}</span>}
        {extras.length > 0 && <span style={{ background: "#f5f3ff", padding: "5px 10px", borderRadius: 8, fontSize: 11, fontWeight: 700, color: "#6d28d9" }}>+{extras.length} Extra KPIs</span>}
      </div>

      {/* Facebook Ads Manager style level tabs */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
        {VIEWS.map(v => (
          <button
            key={v.key}
            onClick={() => setView(v.key)}
            style={{
              padding: "6px 14px", borderRadius: 8, cursor: "pointer",
              fontSize: 12, fontWeight: 700, fontFamily: "inherit",
              background: view === v.key ? "#2563eb" : "#fff",
              color: view === v.key ? "#fff" : "#475569",
              border: view === v.key ? "1px solid #2563eb" : "1px solid #e2e8f0",
              transition: "all 0.15s ease"
            }}
          >
            {v.label} <span style={{ opacity: 0.8, fontWeight: 600 }}>({counts[v.key] ?? 0})</span>
          </button>
        ))}
        <span style={{ marginLeft: "auto", alignSelf: "center", fontSize: 11, color: "#64748b" }}>⟷ scroll horizontally to see all columns</span>
      </div>

      {/* Horizontally scrollable table */}
      <div style={{ overflowX: "auto", borderRadius: 10, border: "1px solid #e2e8f0", background: "#fff", WebkitOverflowScrolling: "touch" }}>
        <table style={{ width: "100%", minWidth: `${cols.length * 90 + 320}px`, borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#e2e8f0" }}>
              <th style={headerCell}>Structure</th>
              <th style={headerCell}>Targeting / Details</th>
              {cols.map(c => <th key={c.key} style={headerCell}>{c.label}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => <tr key={i}>{r.cells}</tr>)}
          </tbody>
        </table>
      </div>

      {/* Observations / analysis notes */}
      {data.observations && data.observations.length > 0 && (
        <div style={{ marginTop: 14, background: "#fffbeb", border: "1px dashed #fcd34d", borderRadius: 10, padding: "12px 14px" }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: "#b45309", textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 6 }}>Analysis Notes</div>
          {data.observations.map((o, k) => (
            <div key={k} style={{ fontSize: 12, color: "#78350f", lineHeight: 1.5, marginBottom: 3 }}>• {o}</div>
          ))}
        </div>
      )}
    </div>
  );
}