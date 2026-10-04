"use client";
import { useEffect } from "react";
import { getDZD, getProfitDZD, getMarginPct, getCostUSD, getVerdict, fDZD, fUSD } from "./ProductCard";

/* ─────────────────────────────────────────
   HELPERS
───────────────────────────────────────── */
function na(v) {
  if (v == null || v === "") return <span style={{ color: "var(--muted-2)", fontSize: 12 }}>—</span>;
  if (typeof v === "boolean") return v
    ? <span style={{ color: "#16a34a", fontWeight: 800 }}>✓ Yes</span>
    : <span style={{ color: "#dc2626", fontWeight: 800 }}>✗ No</span>;
  return String(v);
}

function scoreBg(val, invert = false) {
  if (val == null) return "transparent";
  const v = invert ? 100 - val : val;
  if (v >= 70) return "rgba(22,163,74,0.08)";
  if (v >= 45) return "rgba(217,119,6,0.08)";
  return "rgba(220,38,38,0.06)";
}

function scoreText(val, invert = false) {
  if (val == null) return "var(--muted)";
  const v = invert ? 100 - val : val;
  if (v >= 70) return "#16a34a";
  if (v >= 45) return "#d97706";
  return "#dc2626";
}

/* ─────────────────────────────────────────
   COMPARISON ROWS CONFIG
───────────────────────────────────────── */
const ROWS = [
  {
    group: "Pricing",
    items: [
      { label: "Supplier Cost", render: p => fUSD(getCostUSD(p)) ?? "—" },
      { label: "Sell Price (DZD)", render: p => { const d = getDZD(p); return d ? `${d.estimated ? "~" : ""}${fDZD(d.value)}` : "—"; }, highlight: "#0f3d2e" },
      { label: "Est. Profit", render: p => { const v = getProfitDZD(p); return v != null ? fDZD(v) : "—"; }, colorFn: p => { const v = getProfitDZD(p); return v > 0 ? "#16a34a" : v < 0 ? "#dc2626" : null; } },
      { label: "Margin %", render: p => { const v = getMarginPct(p); return v != null ? `${v}%` : "—"; }, colorFn: p => { const v = getMarginPct(p); return scoreText(v); } },
    ]
  },
  {
    group: "Algeria Analysis",
    items: [
      { label: "Overall Score", render: p => p.algeria?.overallScore ?? p.opportunity?.overallScore ?? "—", colorFn: p => scoreText(p.algeria?.overallScore ?? p.opportunity?.overallScore), bgFn: p => scoreBg(p.algeria?.overallScore ?? p.opportunity?.overallScore) },
      { label: "Demand", render: p => p.algeria?.demandScore ?? p.opportunity?.demand ?? "—", colorFn: p => scoreText(p.algeria?.demandScore ?? p.opportunity?.demand), bgFn: p => scoreBg(p.algeria?.demandScore ?? p.opportunity?.demand) },
      { label: "Competition", render: p => p.algeria?.competitionScore ?? p.opportunity?.competition ?? "—", colorFn: p => scoreText(p.algeria?.competitionScore ?? p.opportunity?.competition, true), bgFn: p => scoreBg(p.algeria?.competitionScore ?? p.opportunity?.competition, true) },
      { label: "Market Fit /10", render: p => p.algeria?.marketFitScore ?? "—", colorFn: p => scoreText((p.algeria?.marketFitScore ?? 0) * 10) },
      { label: "Saturation", render: p => p.algeria?.saturationLevel ?? "—", colorFn: p => p.algeria?.saturationLevel === "Low" ? "#16a34a" : p.algeria?.saturationLevel === "High" ? "#dc2626" : "#d97706" },
      { label: "COD Suitable", render: p => na(p.algeria?.codSuitable ?? null) },
      { label: "Return Risk", render: p => p.algeria?.returnRisk ?? "—", colorFn: p => p.algeria?.returnRisk === "Low" ? "#16a34a" : p.algeria?.returnRisk === "High" ? "#dc2626" : "#d97706" },
    ]
  },
  {
    group: "Product Performance",
    items: [
      { label: "Rating", render: p => p.rating ?? p.supplier?.rating ?? "—", colorFn: p => { const v = p.rating ?? p.supplier?.rating; return v >= 4.5 ? "#16a34a" : v >= 4.0 ? "#d97706" : null; } },
      { label: "Orders", render: p => { const v = p.orderCount ?? p.supplier?.orders; return v ? v.toLocaleString() : "—"; } },
    ]
  },
  {
    group: "Winning Metrics",
    items: [
      { label: "Wow Factor /10", render: p => p.winningMetrics?.wowFactor ?? p.aiAnalysis?.adScore ?? "—", colorFn: p => scoreText((p.winningMetrics?.wowFactor ?? 0) * 10) },
      { label: "Video Ad Potential", render: p => p.winningMetrics?.videoAdPotential ?? "—", colorFn: p => scoreText((p.winningMetrics?.videoAdPotential ?? 0) * 10) },
      { label: "TikTok Potential", render: p => p.winningMetrics?.tiktokAdPotential ?? "—", colorFn: p => scoreText((p.winningMetrics?.tiktokAdPotential ?? 0) * 10) },
      { label: "Impulse Buy", render: p => p.winningMetrics?.impulseBuyPotential ?? "—", colorFn: p => scoreText((p.winningMetrics?.impulseBuyPotential ?? 0) * 10) },
    ]
  },
  {
    group: "Verdict",
    items: [
      { label: "Verdict", render: p => { const v = getVerdict(p); return v ? `${v.emoji} ${v.label}` : "—"; }, colorFn: p => { const v = getVerdict(p); return v?.color ?? null; } },
    ]
  }
];

/* ─────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────── */
export default function CompareModal({ products, onClose }) {
  useEffect(() => {
    const esc = e => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, [onClose]);

  const count = products.length;
  const colW = Math.max(160, Math.floor(700 / count));

  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position: "fixed", inset: 0, zIndex: 10000, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
    >
      <div style={{ background: "var(--surface)", borderRadius: 20, width: "100%", maxWidth: Math.min(1200, 200 + count * colW + 60), height: "90vh", display: "flex", flexDirection: "column", boxShadow: "0 40px 120px rgba(0,0,0,0.4)", border: "1px solid var(--border)", overflow: "hidden" }}>

        {/* Header */}
        <div style={{ padding: "20px 28px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 900 }}>⚖️ Product Comparison</h2>
            <p style={{ margin: "2px 0 0", fontSize: 13, color: "var(--muted)" }}>Comparing {count} products side by side</p>
          </div>
          <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: 9, border: "1px solid var(--border)", background: "var(--surface-2)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: "var(--muted)" }}>×</button>
        </div>

        {/* Scrollable table */}
        <div style={{ flex: 1, overflowY: "auto", overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed", minWidth: 200 + count * colW }}>

            {/* Product header row */}
            <thead>
              <tr style={{ background: "var(--surface)", position: "sticky", top: 0, zIndex: 5, boxShadow: "0 1px 0 var(--border)" }}>
                <th style={{ padding: "16px 20px", width: 200, textAlign: "left", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8, color: "var(--muted)", borderRight: "1px solid var(--border)" }}>Metric</th>
                {products.map(p => {
                  const verdict = getVerdict(p);
                  const img = p.mainImage?.url ?? (typeof p.mainImage === "string" ? p.mainImage : null);
                  return (
                    <th key={p.id} style={{ padding: "16px 14px", width: colW, textAlign: "center", borderRight: "1px solid var(--border)", verticalAlign: "top" }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 56, height: 56, borderRadius: 12, overflow: "hidden", background: "var(--surface-2)", border: "1px solid var(--border)", flexShrink: 0 }}>
                          {img ? <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>📦</div>}
                        </div>
                        <div style={{ fontSize: 12.5, fontWeight: 800, lineHeight: 1.3, color: "var(--text)", textAlign: "center", maxWidth: colW - 28, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                          {p.name || "Unnamed"}
                        </div>
                        {verdict && (
                          <span style={{ fontSize: 10.5, fontWeight: 800, padding: "2px 8px", borderRadius: 999, background: verdict.bg, color: verdict.color }}>
                            {verdict.emoji} {verdict.label}
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody>
              {ROWS.map(group => (
                <>
                  {/* Group header */}
                  <tr key={`group-${group.group}`} style={{ background: "var(--surface-2)" }}>
                    <td colSpan={count + 1} style={{ padding: "10px 20px", fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, color: "var(--muted)", borderBottom: "1px solid var(--border)", borderTop: "2px solid var(--border)" }}>
                      {group.group}
                    </td>
                  </tr>

                  {/* Data rows */}
                  {group.items.map((row, rowIdx) => (
                    <tr key={`${group.group}-${rowIdx}`} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: "12px 20px", fontSize: 13, fontWeight: 600, color: "var(--muted)", borderRight: "1px solid var(--border)", width: 200 }}>
                        {row.label}
                      </td>
                      {products.map(p => {
                        const val = row.render(p);
                        const color = row.colorFn?.(p) ?? (row.highlight || null);
                        const bg = row.bgFn?.(p) ?? "transparent";
                        return (
                          <td key={p.id} style={{ padding: "12px 14px", textAlign: "center", fontSize: 14, fontWeight: 700, color: color || "var(--text)", background: bg, borderRight: "1px solid var(--border)" }}>
                            {val}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div style={{ padding: "14px 28px", borderTop: "1px solid var(--border)", background: "var(--surface)", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <span style={{ fontSize: 12.5, color: "var(--muted)" }}>Color coding: <span style={{ color: "#16a34a", fontWeight: 700 }}>Green = Strong</span> · <span style={{ color: "#d97706", fontWeight: 700 }}>Amber = Moderate</span> · <span style={{ color: "#dc2626", fontWeight: 700 }}>Red = Weak</span></span>
          <button className="btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
