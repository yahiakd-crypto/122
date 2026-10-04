/**
 * MasterDzSections.jsx
 * - Selection mode: checkboxes to pick which sections to run
 * - Results mode: live accordion showing section-by-section progress
 */
"use client";
import { useState } from "react";
import * as LucideIcons from "lucide-react";

const DynamicIcon = ({ name, size = 16, color = "currentColor" }) => {
  const IconComponent = LucideIcons[name] || LucideIcons.Circle;
  return <IconComponent size={size} color={color} strokeWidth={2.5} />;
};

export const SECTIONS = [
  { id: 1,  key: "product_research",        title: "Product Research",           icon: "PackageSearch",  tokens: "~800"  },
  { id: 2,  key: "top_competitors",         title: "Top 10 Competitors",         icon: "Swords",         tokens: "~1200" },
  { id: 3,  key: "brand_colors",            title: "Best Brand Colors",          icon: "Palette",        tokens: "~600"  },
  { id: 4,  key: "logo_research",           title: "Logo Research",              icon: "Brush",          tokens: "~900"  },
  { id: 5,  key: "buyer_personas",          title: "Buyer Personas",             icon: "Users",          tokens: "~1500" },
  { id: 6,  key: "keywords",               title: "High-Converting Keywords",   icon: "Tag",            tokens: "~2000" },
  { id: 7,  key: "offers",                 title: "Offers",                     icon: "Ticket",         tokens: "~700"  },
  { id: 8,  key: "landing_page_structure", title: "Landing Page Structure",     icon: "Layout",         tokens: "~2000" },
  { id: 9,  key: "image_prompts",          title: "Section Image Prompts",      icon: "Image",          tokens: "~2500" },
  { id: 10, key: "copywriting",            title: "Copywriting",                icon: "PenTool",        tokens: "~1500" },
  { id: 11, key: "social_proof",           title: "Social Proof & Reviews",     icon: "Star",           tokens: "~1000" },
  { id: 12, key: "faq",                   title: "FAQ",                        icon: "HelpCircle",     tokens: "~800"  },
  { id: 13, key: "email_popups",           title: "Email Popups",               icon: "Mail",           tokens: "~600"  },
  { id: 14, key: "design_guide",           title: "Final Design Guide",         icon: "Ruler",          tokens: "~900"  },
  { id: 15, key: "design_references",     title: "Design References",          icon: "BookOpen",       tokens: "~800"  },
  { id: 16, key: "ad_creative_ideas",     title: "Ad Creative Ideas",          icon: "Clapperboard",   tokens: "~2500" },
  { id: 17, key: "ad_image_concepts",     title: "Ad Image Concepts",          icon: "ImagePlus",      tokens: "~2000" },
];

// ─── Selector: shown before running ─────────────────────────────────────────
export function MasterDzSelector({ selected, onChange }) {
  const allSelected = SECTIONS.every(s => selected.includes(s.key));

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
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <span style={{ fontSize: 11, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: 1 }}>
          Select Sections to Run
        </span>
        <div style={{ display: "flex", gap: 6 }}>
          <button
            onClick={() => onChange(SECTIONS.map(s => s.key))}
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

      {/* Token estimate */}
      <div style={{ marginBottom: 10, padding: "6px 10px", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, fontSize: 11, color: "#1d4ed8", fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
        <DynamicIcon name="Zap" size={12} color="#1d4ed8" />
        {selected.length} section{selected.length !== 1 ? "s" : ""} selected — saves tokens on unselected sections
      </div>

      {/* Section list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 4, maxHeight: 340, overflowY: "auto" }}>
        {SECTIONS.map(sec => {
          const isChecked = selected.includes(sec.key);
          return (
            <label
              key={sec.key}
              style={{
                display: "flex", alignItems: "center", gap: 10, padding: "7px 10px",
                borderRadius: 8, cursor: "pointer", userSelect: "none",
                background: isChecked ? "#f0fdf4" : "#f8fafc",
                border: `1.5px solid ${isChecked ? "#86efac" : "#e2e8f0"}`,
                transition: "all 0.15s"
              }}>
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => toggle(sec.key)}
                style={{ width: 15, height: 15, accentColor: "#10b981", cursor: "pointer", flexShrink: 0 }}
              />
              <span style={{ fontSize: 11, fontWeight: 700, color: isChecked ? "#10b981" : "#94a3b8", minWidth: 20, flexShrink: 0 }}>
                {sec.id}
              </span>
              <DynamicIcon name={sec.icon} size={13} color={isChecked ? "#10b981" : "#94a3b8"} />
              <span style={{ flex: 1, fontSize: 12, fontWeight: 600, color: isChecked ? "#1e293b" : "#94a3b8" }}>
                {sec.title}
              </span>
              <span style={{ fontSize: 10, color: "#94a3b8", fontWeight: 500 }}>
                {sec.tokens}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

// ─── Results: shown while running / done ─────────────────────────────────────
export function MasterDzSections({ sections, selectedKeys }) {
  const [expanded, setExpanded] = useState({});

  // Only show sections that were selected to run
  const visibleSections = SECTIONS.filter(s => !selectedKeys || selectedKeys.includes(s.key));
  const doneCount = visibleSections.filter(s => {
    const d = sections.find(x => x.key === s.key);
    return d?.status === "done";
  }).length;
  const total = visibleSections.length;
  const pct = total === 0 ? 0 : Math.round((doneCount / total) * 100);

  return (
    <div onMouseDown={e => e.stopPropagation()} onWheel={e => e.stopPropagation()}
      style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}>

      {/* Progress Header */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.8 }}>
            Progress — {doneCount}/{total} Sections
          </span>
          <span style={{ fontSize: 12, fontWeight: 800, color: doneCount === total ? "#10b981" : "#3b82f6" }}>
            {pct}%
          </span>
        </div>
        <div style={{ height: 5, background: "#e2e8f0", borderRadius: 99, overflow: "hidden" }}>
          <div style={{
            height: "100%", borderRadius: 99, transition: "width 0.6s ease",
            width: `${pct}%`,
            background: doneCount === total
              ? "linear-gradient(90deg, #10b981, #059669)"
              : "linear-gradient(90deg, #3b82f6, #6366f1)"
          }} />
        </div>
      </div>

      {/* Section Cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        {visibleSections.map((sec, i) => {
          const data = sections.find(s => s.key === sec.key);
          const status = data?.status || "pending";
          const isOpen = expanded[sec.key];

          const statusColor = { done: "#10b981", running: "#3b82f6", error: "#ef4444", pending: "#cbd5e1" }[status];
          const statusBg   = { done: "#f0fdf4", running: "#eff6ff", error: "#fef2f2", pending: "#f8fafc" }[status];

          return (
            <div key={sec.key}
              style={{
                border: `1.5px solid ${status === "running" ? "#93c5fd" : status === "done" ? "#86efac" : "#e2e8f0"}`,
                borderRadius: 10, overflow: "hidden", background: statusBg,
                boxShadow: status === "running" ? "0 0 0 3px rgba(59,130,246,0.12)" : "none",
                transition: "all 0.25s"
              }}>

              {/* Header */}
              <button
                onClick={() => status === "done" && setExpanded(prev => ({ ...prev, [sec.key]: !prev[sec.key] }))}
                style={{
                  width: "100%", display: "flex", alignItems: "center", gap: 9,
                  padding: "9px 12px", background: "transparent", border: "none",
                  cursor: status === "done" ? "pointer" : "default", textAlign: "left"
                }}>

                {/* Status circle */}
                <div style={{ width: 22, height: 22, borderRadius: "50%", background: statusColor,
                              color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                              fontSize: 10, fontWeight: 800, flexShrink: 0 }}>
                  {status === "done" ? "✓" : status === "running" ? "…" : sec.id}
                </div>

                <DynamicIcon name={sec.icon} size={13} color={statusColor} />

                <span style={{ flex: 1, fontSize: 12, fontWeight: 700, color: "#1e293b" }}>
                  SECTION {sec.id} — {sec.title}
                </span>

                <span style={{ fontSize: 10, fontWeight: 700, color: statusColor, background: `${statusColor}20`,
                               padding: "2px 7px", borderRadius: 99, textTransform: "uppercase", flexShrink: 0 }}>
                  {status === "pending" ? "Pending" : status === "running" ? "Generating..." : status === "done" ? "Done" : "Error"}
                </span>

                {status === "done" && (
                  <DynamicIcon name={isOpen ? "ChevronUp" : "ChevronDown"} size={13} color="#94a3b8" />
                )}
              </button>

              {/* Running animation */}
              {status === "running" && (
                <div style={{ borderTop: "1px solid #bfdbfe", padding: "8px 14px", display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ display: "flex", gap: 3 }}>
                    {[0,1,2].map(d => (
                      <div key={d} style={{ width: 5, height: 5, borderRadius: "50%", background: "#3b82f6",
                        animation: `dzbounce 1.2s ease-in-out ${d * 0.2}s infinite` }} />
                    ))}
                  </div>
                  <span style={{ fontSize: 11, color: "#3b82f6", fontWeight: 600 }}>AI is writing this section...</span>
                </div>
              )}

              {/* Content */}
              {isOpen && status === "done" && data?.content && (
                <div style={{ borderTop: "1px solid #d1fae5" }}>
                  <div style={{ display: "flex", justifyContent: "flex-end", padding: "6px 12px 0" }}>
                    <button onClick={() => navigator.clipboard.writeText(data.content)}
                      style={{ display: "flex", alignItems: "center", gap: 4, padding: "3px 9px",
                               background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: 6,
                               fontSize: 10, fontWeight: 700, color: "#64748b", cursor: "pointer" }}>
                      <DynamicIcon name="Copy" size={10} /> Copy
                    </button>
                  </div>
                  <div
                    onMouseDown={e => e.stopPropagation()}
                    style={{ padding: "10px 16px 16px", maxHeight: 400, overflowY: "auto",
                             fontSize: 13, color: "#334155", lineHeight: 1.85,
                             whiteSpace: "pre-wrap", userSelect: "text", cursor: "text" }}>
                    {data.content}
                  </div>
                </div>
              )}

              {/* Error */}
              {status === "error" && data?.error && (
                <div style={{ borderTop: "1px solid #fecaca", padding: "8px 14px", fontSize: 11, color: "#dc2626", fontWeight: 600 }}>
                  ⚠ {data.error}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes dzbounce {
          0%, 80%, 100% { transform: scale(0); opacity: 0.3; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
