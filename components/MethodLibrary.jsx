// MethodLibrary.jsx
// - MethodSelector: checkboxes to pick which methods to run (testing / scaling /
//   winning product / master guide skills).
// - MethodLibraryResults: live list showing each selected method's playbook
//   (AI-cleaned Markdown) + a collapsible raw-source view from the doc.
"use client";
import { useState } from "react";
import * as LucideIcons from "lucide-react";
import MethodOrgChart from "./MethodOrgChart";

const DynamicIcon = ({ name, size = 16, color = "currentColor" }) => {
  const IconComponent = LucideIcons[name] || LucideIcons.Circle;
  return <IconComponent size={size} color={color} strokeWidth={2.5} />;
};

// ─── Selector: shown on the card before running ─────────────────────────────
export function MethodSelector({ methods, selected, onChange, unitLabel = "method", actionLabel = "playbook" }) {
  const allSelected = methods.length > 0 && methods.every(m => selected.includes(m.key));

  const toggle = (key) => {
    if (selected.includes(key)) onChange(selected.filter(k => k !== key));
    else onChange([...selected, key]);
  };

  return (
    <div
      onMouseDown={e => e.stopPropagation()}
      onWheel={e => e.stopPropagation()}
      style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontSize: 11, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: 1 }}>
          Select Methods to Run
        </span>
        <div style={{ display: "flex", gap: 6 }}>
          <button
            onClick={() => onChange(methods.map(m => m.key))}
            style={{ padding: "3px 10px", borderRadius: 6, border: "1px solid #d1d5db", background: "#f8fafc", fontSize: 11, fontWeight: 700, color: "#475569", cursor: "pointer" }}>
            All
          </button>
          <button
            onClick={() => onChange([])}
            style={{ padding: "3px 10px", borderRadius: 6, border: "1px solid #d1d5db", background: "#f8fafc", fontSize: 11, fontWeight: 700, color: "#475569", cursor: "pointer" }}>
            None
          </button>
        </div>
      </div>

      <div style={{ marginBottom: 8, padding: "6px 10px", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, fontSize: 11, color: "#1d4ed8", fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
        <DynamicIcon name="Zap" size={12} color="#1d4ed8" />
        {selected.length} {unitLabel}{selected.length !== 1 ? "s" : ""} selected — run each one to get its full {actionLabel}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 4, maxHeight: 360, overflowY: "auto" }}>
        {methods.map((m, idx) => {
          const isChecked = selected.includes(m.key);
          return (
            <label
              key={m.key}
              style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "7px 9px", borderRadius: 8, background: isChecked ? "#eff6ff" : "#fff", border: "1px solid " + (isChecked ? "#bfdbfe" : "#e2e8f0"), cursor: "pointer" }}
            >
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => toggle(m.key)}
                style={{ marginTop: 3, accentColor: "#2563eb", cursor: "pointer" }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <DynamicIcon name="BookOpen" size={12} color="#3b82f6" />
                  <span style={{ fontSize: 12, fontWeight: 800, color: "#1e293b", lineHeight: 1.3 }}>
                    {idx + 1}. {m.title.split(":").slice(1).join(":").trim() || m.title}
                  </span>
                </div>
                {m.tagline ? (
                  <div style={{ fontSize: 11, color: "#64748b", marginTop: 2, lineHeight: 1.4 }}>{m.tagline}</div>
                ) : null}
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}

// ─── Results: live per-method playbooks ─────────────────────────────────────
const META_KEYS = [
  ["bestFor", "Best for", "#0ea5e9"],
  ["budget", "Budget", "#8b5cf6"],
  ["timeline", "Timeline", "#f59e0b"],
  ["difficulty", "Difficulty", "#ef4444"],
  ["successRate", "Success rate", "#22c55e"],
  ["overallScore", "Overall score", "#14b8a6"],
];

function MethodBlock({ item, idx }) {
  const [view, setView] = useState("diagram");
  const status = item.status || 'done';
  const statusColor = status === 'error' ? "#ef4444" : status === 'running' ? "#f59e0b" : status === 'pending' ? "#94a3b8" : "#10b981";
  const statusIcon = status === 'error' ? "XCircle" : status === 'running' ? "Loader2" : status === 'pending' ? "Clock" : "CheckCircle2";

  return (
    <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", overflow: "hidden" }}>
      <div style={{ padding: "12px 14px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <div style={{ width: 26, height: 26, borderRadius: 7, background: "#3b82f6", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, flexShrink: 0 }}>
          {idx + 1}
        </div>
        <div style={{ flex: 1, minWidth: 160 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: "#1e293b", lineHeight: 1.3 }}>{item.title}</div>
          {item.tagline ? <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{item.tagline}</div> : null}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {status === 'done' && item.chart && (
            <div style={{ display: "flex", background: "#e2e8f0", borderRadius: 8, padding: 2, gap: 2 }}>
              {[["diagram", "TreePine", "Diagram"], ["playbook", "FileText", "Playbook"], ["source", "ScrollText", "Doc"]].map(([vk, icon, label]) => (
                <button
                  key={vk}
                  onClick={() => setView(vk)}
                  title={vk === 'playbook' ? "Full written playbook" : vk === 'source' ? "Original doc text" : "Org-chart diagram"}
                  style={{ display: "flex", alignItems: "center", gap: 4, background: view === vk ? "#fff" : "transparent", border: "none", padding: "4px 9px", borderRadius: 6, fontSize: 10, fontWeight: 800, color: view === vk ? "#1d4ed8" : "#64748b", cursor: "pointer", boxShadow: view === vk ? "0 1px 2px rgba(0,0,0,0.08)" : "none" }}>
                  <DynamicIcon name={icon} size={12} /> {label}
                </button>
              ))}
            </div>
          )}
          <DynamicIcon name={statusIcon} size={16} color={statusColor} />
        </div>
      </div>

      {/* Meta chips */}
      {(item.meta && Object.values(item.meta).some(Boolean)) ? (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, padding: "10px 14px 0 14px" }}>
          {META_KEYS.map(([k, label, color]) => item.meta[k] ? (
            <div key={k} style={{ display: "flex", alignItems: "center", gap: 5, background: color + "12", border: "1px solid " + color + "30", borderRadius: 990, padding: "3px 9px", fontSize: 10, fontWeight: 700, color }}>
              <span style={{ opacity: 0.75 }}>{label}:</span> {item.meta[k]}
            </div>
          ) : null)}
        </div>
      ) : null}

      <div style={{ padding: "14px" }}>
        {status === 'running' && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#b45309", fontWeight: 600 }}>
            <DynamicIcon name="Loader2" size={14} /> Building the playbook…
          </div>
        )}
        {item.error ? (
          <div style={{ fontSize: 12, color: "#ef4444", whiteSpace: "pre-wrap" }}>Error: {item.error}</div>
        ) : null}

        {status === 'done' && view === 'diagram' && item.chart && (
          <MethodOrgChart chart={item.chart} />
        )}

        {/* If the diagram failed but we have playbook text, show it directly */}
        {status === 'done' && view === 'diagram' && !item.chart && item.text ? (
          <div
            style={{ background: "#f8fafc", border: "1px solid #e9eef5", borderRadius: 10, padding: "16px 20px", fontSize: 13, color: "#334155", lineHeight: 1.75, whiteSpace: "pre-wrap", fontFamily: "system-ui, -apple-system, sans-serif", maxHeight: 560, overflowY: "auto", cursor: "text", userSelect: "text" }}
          >
            {item.text}
          </div>
        ) : null}

        {status === 'done' && view === 'playbook' && item.text ? (
          <div
            style={{ background: "#f8fafc", border: "1px solid #e9eef5", borderRadius: 10, padding: "16px 20px", fontSize: 13, color: "#334155", lineHeight: 1.75, whiteSpace: "pre-wrap", fontFamily: "system-ui, -apple-system, sans-serif", maxHeight: 560, overflowY: "auto", cursor: "text", userSelect: "text" }}
          >
            {item.text}
          </div>
        ) : null}

        {status === 'done' && view === 'source' && item.source ? (
          <pre style={{ background: "#1e293b", color: "#cbd5e1", borderRadius: 10, padding: "16px", fontSize: 12, lineHeight: 1.6, whiteSpace: "pre-wrap", maxHeight: 560, overflowY: "auto", fontFamily: "ui-monospace, Consolas, monospace", margin: 0 }}>
            {item.source}
          </pre>
        ) : null}
      </div>
    </div>
  );
}

export function MethodLibraryResults({ data, kind }) {
  const methods = Array.isArray(data?.methods) ? data.methods : [];
  const running = methods.some(m => m.status === 'running');

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <DynamicIcon name="Library" size={15} color="#3b82f6" />
        <div style={{ fontSize: 12, fontWeight: 800, color: "#1e293b", textTransform: "uppercase", letterSpacing: 0.6 }}>
          {data?.chapterTitle || "Methods"}
        </div>
        {running && <DynamicIcon name="Loader2" size={13} color="#f59e0b" />}
      </div>
      {methods.map((item, idx) => (
        <MethodBlock key={item.key || idx} item={item} idx={idx} />
      ))}
    </div>
  );
}