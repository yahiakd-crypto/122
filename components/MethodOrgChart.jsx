// MethodOrgChart.jsx
// Renders a METHOD diagram as an org-chart tree, following the same visual
// language as FacebookAdsOrgChart:
//   ROOT (title + meta chips) → GOAL | WHEN TO USE
//   → vertical spine of PHASES (each with its steps)
//   → KPI box + KILL/SCALE RULES box → BUDGET & PROJECTIONS box
"use client";

const BORDER = "#94a3b8";

function Stem({ height = 20 }) {
  return <div style={{ width: 2, height, background: BORDER, margin: "0 auto" }} />;
}

function Box({ children, style }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #cbd5e1", borderRadius: 12, padding: "14px 16px", boxShadow: "0 4px 16px rgba(0,0,0,0.04)", position: "relative", zIndex: 2, ...style }}>
      {children}
    </div>
  );
}

const META_ROWS = [
  ["bestFor", "Best for", "#0ea5e9"],
  ["budget", "Budget", "#8b5cf6"],
  ["timeline", "Timeline", "#f59e0b"],
  ["difficulty", "Difficulty", "#ef4444"],
  ["successRate", "Success rate", "#22c55e"],
  ["overallScore", "Overall score", "#14b8a6"],
];

function MetaPanel({ chart }) {
  const rows = META_ROWS.map(([k, label, color]) =>
    chart[k] ? { k, label, color, value: String(chart[k]) } : null
  ).filter(Boolean);
  if (rows.length === 0) return null;
  return (
    <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, background: "#f8fafc", overflow: "hidden", marginTop: 12, textAlign: "left" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", borderBottom: "1px solid #e2e8f0", background: "#fff" }}>
        <span style={{ fontSize: 9, fontWeight: 900, color: "#64748b", textTransform: "uppercase", letterSpacing: 1 }}>Method summary</span>
      </div>
      {rows.map((r, i) => (
        <div key={r.k} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "7px 12px", borderTop: i === 0 ? "none" : "1px dashed #e2e8f0" }}>
          <div style={{ width: 92, flexShrink: 0, display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: r.color, flexShrink: 0, marginTop: 5 }} />
            <span style={{ fontSize: 9, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5 }}>{r.label}</span>
          </div>
          <div style={{ flex: 1, minWidth: 0, fontSize: 12, color: "#1e293b", lineHeight: 1.5, fontWeight: 600, whiteSpace: "pre-wrap" }}>{r.value}</div>
        </div>
      ))}
    </div>
  );
}

function BulletList({ items, color = "#475569", dot = "#3b82f6" }) {
  if (!items || items.length === 0) return null;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {items.map((it, i) => (
        <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: 12, color, lineHeight: 1.5 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: dot, marginTop: 5, flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 0, whiteSpace: "pre-wrap" }}>{it}</div>
        </div>
      ))}
    </div>
  );
}

export default function MethodOrgChart({ chart }) {
  if (!chart) return null;
  const phases = Array.isArray(chart.phases) ? chart.phases : [];
  const kpis = chart.kpis || [];
  const killRules = chart.killRules || [];
  const scaleRules = chart.scaleRules || [];
  const budget = chart.budgetProjections || [];

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", overflowX: "auto", padding: "20px 16px", background: "#f8fafc", borderRadius: 12, border: "1px solid #e2e8f0", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      {/* ── Level 0: ROOT ── */}
      <Box style={{ maxWidth: 620, textAlign: "center", border: "2px solid #1e293b" }}>
        <div style={{ fontSize: 15, fontWeight: 900, color: "#1e293b", textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 8 }}>{chart.title || "Method"}</div>
        <MetaPanel chart={chart} />
      </Box>

      {/* ── Level 1: GOAL | WHEN TO USE ── */}
      {(chart.goal || chart.whenToUse) && (
        <>
          <Stem />
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "center", gap: 28, flexWrap: "wrap" }}>
            {chart.goal ? (
              <Box style={{ width: 260 }}>
                <div style={{ fontSize: 10, fontWeight: 900, color: "#f97316", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6 }}>🎯 Goal</div>
                <div style={{ fontSize: 12, color: "#475569", lineHeight: 1.55 }}>{chart.goal}</div>
              </Box>
            ) : null}
            {chart.whenToUse ? (
              <Box style={{ width: 260 }}>
                <div style={{ fontSize: 10, fontWeight: 900, color: "#0ea5e9", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6 }}>⚡ When to use</div>
                <div style={{ fontSize: 12, color: "#475569", lineHeight: 1.55 }}>{chart.whenToUse}</div>
              </Box>
            ) : null}
          </div>
        </>
      )}

      {/* ── Level 2: PHASES (vertical spine tree) ── */}
      {phases.length > 0 && (
        <div style={{ width: "100%", maxWidth: 640 }}>
          <Stem />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 10, fontWeight: 900, color: "#3b82f6", textTransform: "uppercase", letterSpacing: 0.8 }}>Step-by-step</span>
              <div style={{ flex: 1, height: 2, background: "#e2e8f0" }} />
            </div>

            {phases.map((ph, i) => (
              <div key={i} style={{ position: "relative", paddingLeft: 26, paddingBottom: 14 }}>
                {/* spine line + branch */}
                <div style={{ position: "absolute", left: 7, top: 0, bottom: 0, width: 2, background: "#cbd5e1" }} />
                <div style={{ position: "absolute", left: 9, top: 18, width: 17, height: 2, background: "#cbd5e1" }} />
                <div style={{ position: "absolute", left: 3, top: 14, width: 9, height: 9, borderRadius: "50%", background: "#3b82f6", boxShadow: "0 0 6px rgba(59,130,246,0.4)", zIndex: 2 }} />

                <Box>
                  <div style={{ fontSize: 12, fontWeight: 900, color: "#0f172a", marginBottom: ph.steps ? 8 : 0 }}>{ph.name || `Phase ${i + 1}`}</div>
                  {ph.steps ? <BulletList items={ph.steps} /> : null}
                </Box>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Level 3: KPIs | KILL/SCALE RULES ── */}
      {(kpis.length > 0 || killRules.length > 0 || scaleRules.length > 0) && (
        <>
          <Stem />
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "center", gap: 16, flexWrap: "wrap" }}>
            {kpis.length > 0 && (
              <Box style={{ width: 260 }}>
                <div style={{ fontSize: 10, fontWeight: 900, color: "#8b5cf6", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8 }}>📈 KPIs & thresholds</div>
                <BulletList items={kpis} color="#475569" dot="#8b5cf6" />
              </Box>
            )}
            {(killRules.length > 0 || scaleRules.length > 0) && (
              <Box style={{ width: 280 }}>
                <div style={{ fontSize: 10, fontWeight: 900, color: "#ef4444", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8 }}>🚦 Kill vs scale rules</div>
                {killRules.length > 0 && <BulletList items={killRules} color="#b91c1c" dot="#ef4444" />}
                {killRules.length > 0 && scaleRules.length > 0 && <div style={{ height: 8 }} />}
                {scaleRules.length > 0 && <BulletList items={scaleRules} color="#15803d" dot="#22c55e" />}
              </Box>
            )}
          </div>
        </>
      )}

      {/* ── Level 4: BUDGET ── */}
      {budget.length > 0 && (
        <>
          <Stem />
          <Box style={{ width: "100%", maxWidth: 560 }}>
            <div style={{ fontSize: 10, fontWeight: 900, color: "#16a34a", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8 }}>💰 Budget & projections</div>
            <BulletList items={budget} color="#475569" dot="#16a34a" />
          </Box>
        </>
      )}
    </div>
  );
}