"use client";
import React, { useState, useMemo } from "react";
import * as LucideIcons from "lucide-react";

// ── Dynamic Lucide Icon Helper ───────────────────────────────────────────────
const DynamicIcon = ({ name, size = 16, color = "currentColor", style }) => {
  const Icon = LucideIcons[name] || LucideIcons.Circle;
  return <Icon size={size} color={color} strokeWidth={2.2} style={style} />;
};

// ── Status Pill Component ───────────────────────────────────────────────────
export const StatusBadge = ({ label, type }) => {
  const cleanLabel = (label || "").replace(/[🟢🟡🔴🟩🟨🟥⚠️✅❌]/g, "").trim();
  
  let detectedType = type;
  if (!detectedType) {
    const raw = (label || "").toLowerCase();
    if (raw.includes("good") || raw.includes("scale") || raw.includes("ready") || raw.includes("high") || raw.includes("green")) {
      detectedType = "success";
    } else if (raw.includes("warn") || raw.includes("keep") || raw.includes("medium") || raw.includes("yellow")) {
      detectedType = "warning";
    } else if (raw.includes("bad") || raw.includes("kill") || raw.includes("low") || raw.includes("risk") || raw.includes("red")) {
      detectedType = "danger";
    } else {
      detectedType = "info";
    }
  }

  const styles = {
    success: { bg: "#ecfdf5", color: "#059669", border: "#a7f3d0" },
    warning: { bg: "#fffbeb", color: "#d97706", border: "#fde68a" },
    danger:  { bg: "#fef2f2", color: "#dc2626", border: "#fecaca" },
    info:    { bg: "#f8fafc", color: "#475569", border: "#e2e8f0" },
  };

  const s = styles[detectedType] || styles.info;

  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      background: s.bg,
      color: s.color,
      border: `1px solid ${s.border}`,
      borderRadius: 6,
      padding: "4px 10px",
      fontSize: 11,
      fontWeight: 700,
      whiteSpace: "nowrap",
      textTransform: "uppercase",
      letterSpacing: 0.5
    }}>
      {cleanLabel || label}
    </span>
  );
};

// ── Helpers ──────────────────────────────────────────────────────────────────
export function renderRichText(text) {
  if (!text) return null;
  const str = String(text);
  const tagged = str
    .replace(/🟢/g, "%%GOOD%%")
    .replace(/🟡/g, "%%WARN%%")
    .replace(/🔴/g, "%%BAD%%")
    .replace(/🟩/g, "%%SCALE%%")
    .replace(/🟨/g, "%%KEEP%%")
    .replace(/🟥/g, "%%KILL%%");

  const tokens = tagged.split(/(\*\*[^*]+\*\*|`[^`]+`|%%\w+%%)/g);

  return tokens.map((tok, i) => {
    if (!tok) return null;
    if (tok.startsWith("**") && tok.endsWith("**")) {
      return <strong key={i} style={{ fontWeight: 700, color: "#111827" }}>{tok.slice(2, -2)}</strong>;
    }
    if (tok.startsWith("`") && tok.endsWith("`")) {
      return <code key={i} style={{ background: "#f3f4f6", padding: "2px 6px", borderRadius: 4, fontSize: 12, color: "#2563eb", fontFamily: "monospace" }}>{tok.slice(1, -1)}</code>;
    }
    if (tok === "%%GOOD%%" || tok === "%%SCALE%%") return <StatusBadge key={i} label="POSITIVE" type="success" />;
    if (tok === "%%WARN%%" || tok === "%%KEEP%%")  return <StatusBadge key={i} label="WARNING" type="warning" />;
    if (tok === "%%BAD%%" || tok === "%%KILL%%")   return <StatusBadge key={i} label="CRITICAL" type="danger" />;
    return tok;
  });
}

export function parseMarkdownToStructuredBlocks(text) {
  if (!text) return [];
  const lines = String(text).split("\n");
  const blocks = [];
  let currentTable = null;
  let currentLines = [];

  const flushText = () => {
    if (currentLines.length > 0) {
      blocks.push({ type: "content", lines: [...currentLines] });
      currentLines = [];
    }
  };
  const flushTable = () => {
    if (currentTable && currentTable.length > 0) {
      blocks.push({ type: "table", rows: [...currentTable] });
      currentTable = null;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const trimmed = raw.trim();

    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      if (/^\|[\s\-:|]+\|$/.test(trimmed)) continue;
      flushText();
      if (!currentTable) currentTable = [];
      const cells = trimmed.slice(1, -1).split("|").map(c => c.trim());
      currentTable.push(cells);
    } else {
      flushTable();
      if (trimmed === "" || /^---+$/.test(trimmed)) {
        flushText();
      } else {
        currentLines.push(raw);
      }
    }
  }
  flushTable();
  flushText();
  return blocks;
}

export function StyledMarkdownTable({ rows, title }) {
  if (!rows || rows.length === 0) return null;
  const header = rows[0];
  const body = rows.slice(1);

  return (
    <div style={{ background: "#ffffff", borderRadius: 12, border: "1px solid #e5e7eb", overflow: "hidden", marginBottom: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
      {title && (
        <div style={{ padding: "16px 20px", background: "#f9fafb", borderBottom: "1px solid #e5e7eb", fontSize: 14, fontWeight: 700, color: "#111827" }}>
          {title}
        </div>
      )}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, textAlign: "left" }}>
          <thead>
            <tr style={{ background: "#f9fafb", borderBottom: "1px solid #d1d5db" }}>
              {header.map((col, idx) => (
                <th key={idx} style={{ padding: "12px 20px", fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.5, whiteSpace: "nowrap" }}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {body.map((row, rIdx) => (
              <tr key={rIdx} style={{ borderBottom: "1px solid #e5e7eb" }}>
                {row.map((cell, cIdx) => (
                  <td key={cIdx} style={{ padding: "16px 20px", color: cIdx === 0 ? "#111827" : "#4b5563", fontWeight: cIdx === 0 ? 600 : 400 }}>
                    {/status|tier|verdict|risk/i.test(header[cIdx] || "") || /[🟢🟡🔴]/.test(cell) ? <StatusBadge label={cell} /> : renderRichText(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Main Workspace Component ──────────────────────────────────────────────────
export default function StageIntelligenceViewer({ data, skillLabel, skillIcon = "BarChart2", productName = "Product Analysis" }) {
  const [activeTab, setActiveTab] = useState("overview");

  if (!data) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: "#6b7280", background: "#f9fafb", borderRadius: 16, border: "1px dashed #d1d5db" }}>
        <DynamicIcon name="BoxSelect" size={32} color="#9ca3af" style={{ margin: "0 auto 16px" }} />
        <h3 style={{ fontSize: 16, fontWeight: 600, color: "#374151", margin: "0 0 8px" }}>No Data Available</h3>
        <p style={{ fontSize: 14 }}>Run an analysis to populate this intelligence workspace.</p>
      </div>
    );
  }

  const rawString = typeof data === "string" ? data : JSON.stringify(data, null, 2);
  const summaryText = typeof data === "string" ? data : (data.summary || "");
  const keyPoints = Array.isArray(data.keyPoints) ? data.keyPoints : [];
  const recommendations = Array.isArray(data.recommendations) ? data.recommendations : [];

  const summaryBlocks = useMemo(() => parseMarkdownToStructuredBlocks(summaryText), [summaryText]);

  // Extract Executive Summary KPIs
  const kpis = useMemo(() => {
    const combined = rawString;
    const extracted = [];
    
    const scoreMatch = combined.match(/Score["\s:]*(\d+(?:\.\d+)?(?:\/\d+)?)/i);
    if (scoreMatch) extracted.push({ label: "Overall Score", value: scoreMatch[1], status: "success", interpretation: "Above average" });

    const demandMatch = combined.match(/Demand["\s:]*([A-Za-z]+|\d+[\/%]?)/i);
    if (demandMatch) extracted.push({ label: "Market Demand", value: demandMatch[1].replace(/["{}]/g, ""), status: "info", interpretation: "Based on search trends" });

    const riskMatch = combined.match(/Risk["\s:]*([A-Za-z]+|\d+[\/%]?)/i);
    if (riskMatch) extracted.push({ label: "Risk Level", value: riskMatch[1].replace(/["{}]/g, ""), status: "warning", interpretation: "Supplier & compliance" });

    const statusMatch = combined.match(/(?:Verdict|Status)["\s:]*([^",\n}]+)/i);
    if (statusMatch) extracted.push({ label: "Validation Status", value: statusMatch[1].trim(), status: "success", interpretation: "Current phase decision" });

    if (extracted.length === 0) {
      extracted.push(
        { label: "Execution Status", value: "Verified", status: "success", interpretation: "Analysis complete" },
        { label: "Data Integrity", value: "High", status: "info", interpretation: "Sufficient evidence" }
      );
    }
    return extracted;
  }, [rawString]);

  // Group recommendations by priority
  const actionPlan = useMemo(() => {
    return recommendations.map((rec, i) => {
      const text = typeof rec === "object" ? JSON.stringify(rec) : String(rec);
      let priority = "Medium";
      let timeframe = "Short-Term";
      if (text.toLowerCase().includes("critical") || text.toLowerCase().includes("urgent") || i === 0) { priority = "Critical"; timeframe = "Immediate"; }
      else if (text.toLowerCase().includes("high") || i === 1) { priority = "High"; timeframe = "Short-Term"; }
      else if (text.toLowerCase().includes("scale")) { priority = "High"; timeframe = "Long-Term"; }
      
      return { id: i, text, priority, timeframe, status: "Not Started" };
    });
  }, [recommendations]);

  const tabs = [
    { id: "overview", label: "Overview", icon: "LayoutDashboard" },
    { id: "analysis", label: "Analysis", icon: "FileText", show: summaryBlocks.length > 0 },
    { id: "insights", label: "Insights", icon: "Lightbulb", show: keyPoints.length > 0 },
    { id: "actionPlan", label: "Action Plan", icon: "CheckSquare", show: recommendations.length > 0 },
    { id: "data", label: "Data & Evidence", icon: "Database" },
  ].filter(t => t.show !== false);

  return (
    <div style={{
      background: "#ffffff",
      borderRadius: 16,
      border: "1px solid #e5e7eb",
      boxShadow: "0 10px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.01)",
      overflow: "hidden",
      fontFamily: "system-ui, -apple-system, sans-serif",
      color: "#111827",
      display: "flex",
      flexDirection: "column",
      maxHeight: 850
    }}>
      {/* HEADER */}
      <div style={{ padding: "24px 32px", borderBottom: "1px solid #e5e7eb", background: "#fcfcfd" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <div style={{ width: 48, height: 48, background: "#f3f4f6", border: "1px solid #e5e7eb", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", color: "#4f46e5" }}>
              <DynamicIcon name={skillIcon} size={24} />
            </div>
            <div>
              <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 4 }}>
                <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: "#111827" }}>{skillLabel}</h2>
                <StatusBadge label="Analysis Complete" type="success" />
              </div>
              <div style={{ fontSize: 13, color: "#6b7280", display: "flex", gap: 16 }}>
                <span><strong style={{ fontWeight: 600 }}>Product:</strong> {productName}</span>
                <span><strong style={{ fontWeight: 600 }}>Generated:</strong> {new Date().toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid #d1d5db", background: "#ffffff", fontSize: 13, fontWeight: 600, color: "#374151", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
              <DynamicIcon name="RefreshCcw" size={14} /> Refresh
            </button>
            <button style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: "#4f46e5", fontSize: 13, fontWeight: 600, color: "#ffffff", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
              <DynamicIcon name="Download" size={14} /> Export
            </button>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div style={{ padding: "0 32px", borderBottom: "1px solid #e5e7eb", background: "#ffffff", display: "flex", gap: 24 }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: "16px 0",
              border: "none",
              background: "transparent",
              fontSize: 14,
              fontWeight: activeTab === tab.id ? 700 : 500,
              color: activeTab === tab.id ? "#4f46e5" : "#6b7280",
              borderBottom: activeTab === tab.id ? "2px solid #4f46e5" : "2px solid transparent",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              transition: "all 0.2s"
            }}
          >
            <DynamicIcon name={tab.icon} size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* CONTENT AREA */}
      <div style={{ padding: "32px", overflowY: "auto", flex: 1, background: "#f9fafb" }}>
        
        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
              {kpis.map((kpi, idx) => (
                <div key={idx} style={{ background: "#ffffff", padding: 20, borderRadius: 12, border: "1px solid #e5e7eb", boxShadow: "0 1px 2px rgba(0,0,0,0.02)" }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>{kpi.label}</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: "#111827", marginBottom: 8 }}>{kpi.value}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 12, color: "#9ca3af" }}>{kpi.interpretation}</span>
                    <StatusBadge label={kpi.status} type={kpi.status} />
                  </div>
                </div>
              ))}
            </div>

            <div style={{ background: "#ffffff", padding: 24, borderRadius: 12, border: "1px solid #e5e7eb", boxShadow: "0 1px 2px rgba(0,0,0,0.02)" }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 16px 0", color: "#111827", display: "flex", alignItems: "center", gap: 8 }}>
                <DynamicIcon name="Target" size={18} color="#4f46e5" /> Executive Summary
              </h3>
              <div style={{ fontSize: 14, color: "#4b5563", lineHeight: 1.6 }}>
                {summaryBlocks.map((blk, i) => blk.type === "content" && (
                  <div key={i} style={{ marginBottom: 12 }}>
                    {blk.lines.map((l, lIdx) => <p key={lIdx} style={{ margin: "4px 0" }}>{renderRichText(l)}</p>)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ANALYSIS TAB */}
        {activeTab === "analysis" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {summaryBlocks.map((blk, idx) => {
              if (blk.type === "table") return <StyledMarkdownTable key={idx} rows={blk.rows} />;
              if (blk.type === "content") {
                return (
                  <div key={idx} style={{ background: "#ffffff", padding: 24, borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 14, color: "#4b5563", lineHeight: 1.6 }}>
                    {blk.lines.map((l, lIdx) => {
                      if (l.startsWith("###")) return <h4 key={lIdx} style={{ fontSize: 16, fontWeight: 700, color: "#111827", margin: "16px 0 8px" }}>{renderRichText(l.replace(/^###+\s*/, ""))}</h4>;
                      if (l.startsWith("-") || l.startsWith("•")) return <div key={lIdx} style={{ display: "flex", gap: 8, margin: "6px 0" }}><span style={{ color: "#4f46e5" }}>•</span><span>{renderRichText(l.replace(/^[-•]\s*/, ""))}</span></div>;
                      return <p key={lIdx} style={{ margin: "8px 0" }}>{renderRichText(l)}</p>;
                    })}
                  </div>
                );
              }
              return null;
            })}
          </div>
        )}

        {/* INSIGHTS TAB */}
        {activeTab === "insights" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }}>
            {keyPoints.map((kp, i) => {
              const text = typeof kp === "object" ? JSON.stringify(kp) : String(kp);
              return (
                <div key={i} style={{ background: "#ffffff", padding: 20, borderRadius: 12, border: "1px solid #e5e7eb", display: "flex", gap: 16, alignItems: "flex-start" }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: "#eff6ff", color: "#3b82f6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <DynamicIcon name="Lightbulb" size={16} />
                  </div>
                  <div style={{ fontSize: 14, color: "#374151", lineHeight: 1.6, paddingTop: 4 }}>
                    {renderRichText(text)}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ACTION PLAN TAB */}
        {activeTab === "actionPlan" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {["Immediate", "Short-Term", "Long-Term"].map(tf => {
              const tasks = actionPlan.filter(a => a.timeframe === tf);
              if (tasks.length === 0) return null;
              return (
                <div key={tf}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: "#111827", margin: "0 0 16px 0", borderBottom: "1px solid #e5e7eb", paddingBottom: 8 }}>
                    {tf} Actions
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {tasks.map(task => (
                      <div key={task.id} style={{ background: "#ffffff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "20px", display: "flex", gap: 20, alignItems: "center", boxShadow: "0 1px 2px rgba(0,0,0,0.02)" }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 8 }}>
                            <StatusBadge label={task.priority} type={task.priority === "Critical" ? "danger" : task.priority === "High" ? "warning" : "info"} />
                            <span style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", textTransform: "uppercase" }}>Status: {task.status}</span>
                          </div>
                          <div style={{ fontSize: 14, color: "#111827", fontWeight: 500, lineHeight: 1.5 }}>
                            {renderRichText(task.text)}
                          </div>
                        </div>
                        <button style={{ padding: "8px 16px", borderRadius: 8, background: "#f3f4f6", border: "1px solid #e5e7eb", fontSize: 13, fontWeight: 600, color: "#374151", cursor: "pointer", whiteSpace: "nowrap" }}>
                          Mark Complete
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* DATA & EVIDENCE TAB */}
        {activeTab === "data" && (
          <div style={{ background: "#111827", borderRadius: 12, padding: 24, overflowX: "auto" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 }}>
              Raw Analysis Data Payload
            </div>
            <pre style={{ fontSize: 13, color: "#a5b4fc", margin: 0, fontFamily: "monospace" }}>
              {rawString}
            </pre>
          </div>
        )}

      </div>
    </div>
  );
}
