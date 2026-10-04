"use client";
import React, { useState, useRef, useCallback, useEffect } from "react";
import { getDZD, getProfitDZD, getVerdict, getPlatform, fDZD } from "./ProductCard";
import ProductSourcingChart from "./ProductSourcingChart";

import { SKILLS_DICT, SKILL_CATEGORIES } from "@/lib/canvas/SkillRegistry";
import { GraphEngine } from "@/lib/canvas/GraphEngine";
import { resolveSkillInput } from "@/lib/canvas/InputResolver";
import * as LucideIcons from "lucide-react";
import FacebookAdsOrgChart from "./FacebookAdsOrgChart";
import BuyerPersonaOrgChart from "./BuyerPersonaOrgChart";
import { MasterDzSections, MasterDzSelector, SECTIONS as DZ_SECTIONS } from "./MasterDzSections";
import { SECTION_PROMPTS } from "@/lib/canvas/prompts/master_prompt_dz_sections";
import { AdCreativeAnalyzerView } from "../components/renderers";
import StageIntelligenceViewer from "@/components/StageIntelligenceViewer";
import ProductIntelligenceDashboard from "./ProductIntelligenceDashboard";

const DynamicIcon = ({ name, size = 16, color = "currentColor" }) => {
  const IconComponent = LucideIcons[name] || LucideIcons.Circle;
  return <IconComponent size={size} color={color} strokeWidth={2.5} />;
};

/* ───────────────────────────────────────────
   GROUPING LOGIC
─────────────────────────────────────────── */
const NICHE_ICONS = {
  tech: "Laptop", electronic: "Zap", gadget: "Wrench", office: "Briefcase", home: "Home", kitchen: "Utensils",
  beauty: "Sparkles", fashion: "Shirt", fitness: "Dumbbell", sport: "Trophy", baby: "Baby", pet: "Dog",
  outdoor: "Tent", travel: "Plane", car: "Car", jewelry: "Gem", phone: "Smartphone", gaming: "Gamepad2",
  health: "Heart", food: "Pizza", plant: "Leaf", decor: "Paintbrush", tool: "Hammer", default: "Package",
};
function getNicheIcon(text = "") {
  const t = text.toLowerCase();
  for (const [k, e] of Object.entries(NICHE_ICONS)) if (k !== "default" && t.includes(k)) return e;
  return NICHE_ICONS.default;
}
function getNicheKey(p) {
  return [p.category || "", p.subcategory || "", p.niche || ""].map(s => s.toLowerCase().trim()).filter(Boolean).join("|") || "general";
}
function nicheDistance(a, b) {
  const ka = getNicheKey(a).split("|"), kb = getNicheKey(b).split("|");
  for (const t of ka) if (kb.some(k => k.includes(t) || t.includes(k))) return 0;
  return 1;
}
function buildGroups(products, size) {
  if (!products.length) return [];
  const sorted = [...products].sort((a, b) => (b.algeria?.overallScore ?? b.opportunity?.overallScore ?? 0) - (a.algeria?.overallScore ?? a.opportunity?.overallScore ?? 0));
  const used = new Array(sorted.length).fill(false);
  const groups = [];
  for (let i = 0; i < sorted.length; i++) {
    if (used[i]) continue;
    const g = [sorted[i]]; used[i] = true;
    for (let j = 0; j < sorted.length && g.length < size; j++) if (!used[j] && nicheDistance(sorted[i], sorted[j]) === 0) { g.push(sorted[j]); used[j] = true; }
    for (let j = 0; j < sorted.length && g.length < size; j++) if (!used[j]) { g.push(sorted[j]); used[j] = true; }
    groups.push(g);
  }
  return groups.map((gp, idx) => {
    const avgScore = Math.round(gp.reduce((s, p) => s + (p.algeria?.overallScore ?? p.opportunity?.overallScore ?? 50), 0) / gp.length);
    const cats = [...new Set(gp.map(p => p.category).filter(Boolean))];
    const auds = [...new Set(gp.map(p => p.algeria?.targetAudience || p.targetAudience?.customerType).filter(Boolean))];
    const angles = gp.map(p => p.aiAnalysis?.marketingAngle || p.algeria?.mainBuyReason).filter(Boolean);
    const mc = cats[0] || "General";
    const pri = avgScore >= 70 ? "HIGH" : avgScore >= 50 ? "MEDIUM" : "LOW";
    const avgM = Math.round(gp.reduce((s, p) => s + (p.financials?.profitMarginPct ?? 40), 0) / gp.length);
    const budget = avgM >= 60 ? "500-800 DA/day" : avgM >= 40 ? "300-500 DA/day" : "200-400 DA/day";
    const interests = [...cats.map(c => c.toLowerCase()), ...(auds[0] || "").split(/[,\s]+/).filter(w => w.length > 3).slice(0, 2), "online shopping"].slice(0, 5);
    return {
      groupNumber: idx + 1, nicheName: cats.length > 1 ? cats.slice(0, 2).join(" & ") : mc, icon: getNicheIcon(mc),
      targetAudience: auds[0] || "Algerian online shoppers 20–45", sharedAngle: angles[0] || "Solve a problem, improve lifestyle",
      fbInterests: interests, testingPriority: pri,
      priorityReason: pri === "HIGH" ? `Score ${avgScore}/100 — high demand` : pri === "MEDIUM" ? `Score ${avgScore}/100 — good potential` : `Score ${avgScore}/100 — test last`,
      adBudgetSuggestion: budget + " per ad set", testDuration: "3-5 days", winnerCriteria: "ROAS > 2x, CPP < 800 DA",
      testingStrategy: `Launch one campaign: "${mc} Test". One ad set per product, same interests. PPE 2 days → switch winners to Conversions. Kill CPP > 1200 DA after day 3. Scale winner at 2x budget.`,
      productIds: gp.map(p => p.id), products: gp,
    };
  });
}

const DOT = { HIGH: { c: "#ef4444", l: "HIGH" }, MEDIUM: { c: "#f59e0b", l: "MEDIUM" }, LOW: { c: "#6366f1", l: "LOW" } };

// Modal removed.

/* ── Product node ── */
const ProductNode = React.memo(function ProductNode({ p, onPortMount }) {
  const score = p.algeria?.overallScore ?? p.opportunity?.overallScore ?? null;
  const dzdInfo = getDZD(p);
  const verdict = getVerdict(p);
  const img = p.mainImage?.url ?? (typeof p.mainImage === "string" ? p.mainImage : null);
  return (
    <div style={{ position: "relative", background: "#fafbfc", border: "1px solid #d1d9e0", borderRadius: 10, padding: "8px 10px", display: "flex", gap: 8, alignItems: "center", marginBottom: 5, userSelect: "none" }}>
      {/* Product Port - drag from here to a skill card to connect */}
      <div
        ref={el => onPortMount && onPortMount(el, p.id)}
        className="port-in port-out" data-product-id={p.id}
        style={{ position: "absolute", left: -7, top: "50%", marginTop: -7, width: 14, height: 14, borderRadius: "50%", background: "#dbeafe", border: "2px solid #3b82f6", zIndex: 10, cursor: "crosshair", transition: "transform 0.15s, border-color 0.15s, background 0.15s" }}
        onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.6)"; e.currentTarget.style.borderColor = "#6366f1"; e.currentTarget.style.background = "#ede9fe"; }}
        onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.borderColor = "#3b82f6"; e.currentTarget.style.background = "#dbeafe"; }}
      />
      <div style={{ width: 36, height: 36, borderRadius: 7, background: "#e8ecf0", overflow: "hidden", flexShrink: 0, border: "1px solid #d1d9e0" }}>
        {img ? <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, opacity: .3 }}>📦</div>}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#1a2332", lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name || "Unnamed"}</div>
        <div style={{ fontSize: 9, color: "#94a3b8", fontFamily: "monospace", marginTop: 2 }}>{(p.category || "").toLowerCase()}</div>
      </div>
      {score != null && <span style={{ fontSize: 10, fontWeight: 800, color: score >= 70 ? "#16a34a" : score >= 50 ? "#d97706" : "#dc2626", fontFamily: "monospace", flexShrink: 0 }}>{score}</span>}
      <span style={{ fontSize: 9, color: "#94a3b8", background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: 4, padding: "1px 5px", fontFamily: "monospace", flexShrink: 0 }}>{dzdInfo ? fDZD(dzdInfo.value) : "—"}</span>
    </div>
  );
});

/* ── Group column card ── */
const GroupCard = React.memo(function GroupCard({ group, isExpanded, onToggle, onPortMount }) {
  const dot = DOT[group.testingPriority] || DOT.MEDIUM;
  return (
    <div style={{ width: 340, flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", userSelect: "none" }}>
      {/* vertical line no longer needed on top because SVG handles it */}

      {/* header */}
      <div className="group-header node-hover" style={{ width: "100%", background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 16, padding: "20px", textAlign: "left", boxShadow: "0 10px 30px -10px rgba(0,0,0,0.1)", cursor: "grab", display: "flex", flexDirection: "column", gap: 12 }}>

        {/* Top Header Row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ padding: "6px 8px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <DynamicIcon name={group.icon || "Package"} size={16} color="#334155" />
            </div>
            <span style={{ fontSize: 11, fontWeight: 800, color: "#334155", letterSpacing: 0.5 }}>GROUP {group.groupNumber}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: dot.c + "1A", border: `1px solid ${dot.c}33`, padding: "4px 8px", borderRadius: 20 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: dot.c, boxShadow: `0 0 8px ${dot.c}80` }} />
            <span style={{ fontSize: 9, fontWeight: 800, color: dot.c, letterSpacing: 0.5, textTransform: "uppercase" }}>{dot.l} PRIORITY</span>
          </div>
        </div>

        {/* Title & Audience */}
        <div>
          <div style={{ fontSize: 15, fontWeight: 900, color: "#0f172a", marginBottom: 6, letterSpacing: "-0.01em" }}>
            {(group.nicheName || "Unknown Niche").toUpperCase()}
          </div>
          <div style={{ fontSize: 11, color: "#64748b", lineHeight: 1.5, fontWeight: 500 }}>
            {group.targetAudience || "No audience specified"}
          </div>
        </div>

        {/* Priority Reason */}
        {group.priorityReason && (
          <div style={{ background: "#f8fafc", borderRadius: 8, padding: "10px 12px", border: "1px solid #f1f5f9", display: "flex", gap: 8, alignItems: "flex-start" }}>
            <div style={{ marginTop: 2 }}><DynamicIcon name="Info" size={12} color="#94a3b8" /></div>
            <div style={{ fontSize: 10, color: "#475569", lineHeight: 1.4, fontWeight: 500 }}>
              {group.priorityReason}
            </div>
          </div>
        )}
      </div>
      {/* line */}
      <div style={{ width: 1, height: 12, background: "#c8d3db" }} />
      {/* interests */}
      <div style={{ width: "100%", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: "8px 12px", marginBottom: 0 }}>
        <div style={{ fontSize: 8, fontFamily: "monospace", textTransform: "uppercase", letterSpacing: .8, color: "#94a3b8", marginBottom: 5 }}>FB INTERESTS</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
          {(group.fbInterests || []).map((x, i) => (
            <span key={i} style={{ fontSize: 9, fontFamily: "monospace", color: "#475569", background: "#e8ecf0", borderRadius: 3, padding: "1px 6px", border: "1px solid #d1d9e0" }}>{x}</span>
          ))}
        </div>
      </div>
      {/* line */}
      <div style={{ width: 1, height: 12, background: "#c8d3db" }} />
      {/* products */}
      <div style={{ width: "100%" }}>
        {group.products.map((p, i) => <ProductNode key={p.id || i} p={p} onPortMount={onPortMount} />)}
      </div>
      {/* strategy toggle */}
      <button onClick={onToggle}
        style={{ marginTop: 6, width: "100%", background: "none", border: "1px dashed #c8d3db", borderRadius: 7, padding: "7px 0", fontSize: 10, color: "#94a3b8", fontFamily: "monospace", cursor: "pointer", letterSpacing: .3 }}
      >{isExpanded ? "▲ hide" : "▼ strategy"}</button>
      {isExpanded && (
        <div style={{ width: "100%", background: "#fff", border: "1.5px solid #c8d3db", borderRadius: 16, padding: "16px", marginTop: 8, boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
          <div style={{ fontSize: 9, fontFamily: "monospace", textTransform: "uppercase", color: "#64748b", marginBottom: 4 }}>{group.adBudgetSuggestion} · {group.testDuration}</div>
          <div style={{ fontSize: 9, fontFamily: "monospace", color: "#1a2332", marginBottom: 8, fontWeight: 700 }}>{group.winnerCriteria}</div>
          <div style={{ fontSize: 11, color: "#475569", lineHeight: 1.65 }}>{group.testingStrategy}</div>
        </div>
      )}
    </div>
  );
});

/* ── AdSet Card Node ── */
const AdSetCard = React.memo(function AdSetCard({ adSet, groupId, adSetId }) {
  const rawName = adSet.name.replace(/^Ad Set \d+\s*[-:]\s*/i, '');
  const titleMatch = rawName.split(/—|\(|⚠️/);
  const cleanTitle = titleMatch[0].trim();
  const strategyText = rawName.substring(cleanTitle.length).replace(/^[—\(\s⚠️\-]+/, '').replace(/\)$/, '').trim();

  return (
    <div className="node-hover" style={{ width: 320, background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 16, padding: "20px", boxShadow: "0 10px 30px -10px rgba(0,0,0,0.1)", display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 10px rgba(16, 185, 129, 0.4)" }} />
          <span style={{ fontSize: 11, fontWeight: 800, color: "#10b981", letterSpacing: 0.5 }}>AD SET {adSetId + 1}</span>
        </div>
        <div style={{ background: "#f1f5f9", color: "#64748b", fontSize: 10, fontWeight: 700, padding: "4px 8px", borderRadius: 6 }}>{adSet.budget}</div>
      </div>

      {/* Title */}
      <div style={{ fontSize: 14, fontWeight: 800, color: "#0f172a", lineHeight: 1.5 }}>
        {cleanTitle}
      </div>

      {/* Details Box */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ background: "#f8fafc", borderRadius: 12, padding: "12px", border: "1px solid #f1f5f9" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>TARGETING</div>
          <div style={{ fontSize: 12, color: "#334155", fontWeight: 500, lineHeight: 1.5 }}>{adSet.targeting}</div>
        </div>

        {strategyText && (
          <div style={{ background: "#fffbeb", borderRadius: 12, padding: "12px", border: "1px solid #fde68a" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#d97706", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>STRATEGY & PARAMETERS</div>
            <div style={{ fontSize: 11, color: "#92400e", fontWeight: 500, lineHeight: 1.6 }}>{strategyText}</div>
          </div>
        )}
      </div>

      {/* Ads */}
      <div>
        <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>CREATIVES</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {adSet.ads?.map((ad, j) => (
            <div key={j} style={{ display: "flex", alignItems: "center", gap: 8, background: "#fff", border: "1px solid #e2e8f0", padding: "8px 12px", borderRadius: 8 }}>
              <div style={{ width: 16, height: 16, borderRadius: 4, background: "#cbd5e1", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10 }}>📸</div>
              <span style={{ fontSize: 11, color: "#475569", fontWeight: 500 }}>{ad}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

/* ── Group Size Modal ── */
const PROVIDER_LABELS = {
  openai: "OpenAI", anthropic: "Anthropic", gemini: "Google Gemini",
  openrouter: "OpenRouter", nvidia: "NVIDIA", custom: "Custom API",
};

function GroupSizeModal({ productCount, onConfirm, onClose, aiConfig }) {
  const [size, setSize] = useState(3);
  const hasKey = aiConfig?.hasApiKey;
  const provider = PROVIDER_LABELS[aiConfig?.activeProvider] || aiConfig?.activeProvider || "Unknown";
  const model = aiConfig?.model || "—";
  return (
    <div onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position: "fixed", inset: 0, zIndex: 10000, background: "rgba(15,20,30,0.45)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 420, border: "1.5px solid #d1d9e0", boxShadow: "0 24px 60px rgba(0,0,0,0.14)", overflow: "hidden" }}>
        <div style={{ padding: "22px 26px", borderBottom: "1px solid #e8ecf0", background: "#f8fafc" }}>
          <div style={{ fontSize: 10, fontFamily: "monospace", textTransform: "uppercase", letterSpacing: 1.5, color: "#94a3b8", marginBottom: 8 }}>AD TESTING METHOD</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#1a2332", marginBottom: 10 }}>🎯 Facebook Ad Groups</div>

          {/* ── AI model status badge ── */}
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            background: hasKey ? "#f0fdf4" : "#fff1f2",
            border: `1px solid ${hasKey ? "#bbf7d0" : "#fecdd3"}`,
            borderRadius: 9, padding: "10px 14px", marginBottom: 10,
          }}>
            {/* Status dot */}
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: hasKey ? "#16a34a" : "#ef4444", flexShrink: 0, boxShadow: `0 0 6px ${hasKey ? "#16a34a" : "#ef4444"}` }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              {aiConfig ? (
                <>
                  <div style={{ fontSize: 11, fontWeight: 700, color: hasKey ? "#15803d" : "#dc2626", fontFamily: "monospace" }}>
                    {hasKey ? "CONNECTED" : "NO API KEY"} · {provider}
                  </div>
                  <div style={{ fontSize: 10, color: "#64748b", fontFamily: "monospace", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    model: {model}
                  </div>
                </>
              ) : (
                <div style={{ fontSize: 11, color: "#94a3b8", fontFamily: "monospace" }}>checking AI connection…</div>
              )}
            </div>
            {!hasKey && aiConfig && (
              <div style={{ fontSize: 9, fontFamily: "monospace", color: "#ef4444", textAlign: "right", flexShrink: 0 }}>Go to<br />AI Parameters</div>
            )}
          </div>

          <p style={{ margin: 0, fontSize: 13, color: "#64748b", lineHeight: 1.6 }}>Groups your {productCount} products by niche & audience. One campaign per group. <strong style={{ color: "#1a2332" }}>AI will analyze them live.</strong></p>
        </div>
        <div style={{ padding: "22px 26px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#1a2332", marginBottom: 10, fontFamily: "monospace", textTransform: "uppercase", letterSpacing: .8 }}>Products per group</div>
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            {[2, 3, 4, 5].map(n => (
              <button key={n} onClick={() => setSize(n)}
                style={{ flex: 1, padding: "11px 0", borderRadius: 8, border: `1.5px solid ${size === n ? "#1a2332" : "#d1d9e0"}`, background: size === n ? "#1a2332" : "#fff", color: size === n ? "#fff" : "#64748b", fontWeight: 800, fontSize: 16, cursor: "pointer", fontFamily: "monospace" }}>
                {n}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <span style={{ fontSize: 11, color: "#64748b", fontFamily: "monospace" }}>custom:</span>
            <input type="number" min={1} max={20} value={size} onChange={e => setSize(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))}
              style={{ width: 64, padding: "7px 10px", borderRadius: 7, border: "1.5px solid #d1d9e0", fontSize: 13, fontWeight: 700, textAlign: "center", fontFamily: "monospace", outline: "none" }} />
            <span style={{ fontSize: 11, color: "#94a3b8", fontFamily: "monospace" }}>products/group</span>
          </div>
          <div style={{ background: "#f8fafc", border: "1px solid #e8ecf0", borderRadius: 7, padding: "9px 13px", marginBottom: 18, fontFamily: "monospace", fontSize: 11, color: "#475569" }}>
            → ~{Math.ceil(productCount / size)} groups · {size} products each
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={onClose} style={{ flex: 1, padding: "11px 0", borderRadius: 8, border: "1.5px solid #d1d9e0", background: "#fff", color: "#64748b", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "monospace" }}>cancel</button>
            <button onClick={() => onConfirm(size)} style={{ flex: 2, padding: "11px 0", borderRadius: 8, border: "none", background: "#1a2332", color: "#fff", fontWeight: 800, fontSize: 12, cursor: "pointer", fontFamily: "monospace", letterSpacing: .3 }}>
              CREATE GROUPS →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════
   MAIN — Miro-like canvas
════════════════════════════════════════ */

const createDefaultGroups = (products, size = 3) => {
  const realProducts = products.filter(p => !p.isPlaceholder);
  if (realProducts.length === 0) return [];

  const newGroups = [];
  for (let i = 0; i < realProducts.length; i += size) {
    const chunk = realProducts.slice(i, i + size);
    newGroups.push({
      groupNumber: (i / size) + 1,
      nicheName: "General E-Commerce",
      targetAudience: "Broad Audience (Default)",
      priorityReason: "Automatically generated default group.",
      fbInterests: ["Online Shopping", "Retail"],
      products: chunk,
      adBudgetSuggestion: "$20/day per Ad Set",
      testDuration: "3 Days",
      winnerCriteria: "Lowest Cost per Purchase",
      testingStrategy: "1 Campaign, Multiple Ad Sets (one for each product).",
      campaignStructure: {
        campaignName: `Group ${(i / size) + 1} Testing`,
        objective: "Sales",
        adSets: chunk.map((p, idx) => ({
          name: `Ad Set ${idx + 1} - ${p.name || "Product"}`,
          targeting: "Broad Audience",
          budget: "$20/day",
          ads: ["Image 1", "Video 1"]
        }))
      }
    });
  }
  return newGroups;
};

export default function AdTestingDashboard({ products, onBack }) {
  const [showSizeModal, setShowSizeModal] = useState(false);
  const [groups, setGroups] = useState(() => createDefaultGroups(products, 3));
  const [expandedGroups, setExpandedGroups] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [groupSize, setGroupSize] = useState(3);
  const [aiConfig, setAiConfig] = useState(null);

  // Fetch AI config as soon as dashboard mounts
  useEffect(() => {
    fetch("/api/ai/config")
      .then(r => r.json())
      .then(d => setAiConfig(d.config))
      .catch(() => setAiConfig({ hasApiKey: false, activeProvider: "unknown", model: "—" }));
  }, []);

  /* ── Canvas State ── */
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [panning, setPanning] = useState(false);
  const zoomRef = useRef(1);
  const panRef = useRef({ x: 0, y: 0 });
  const isPanning = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });
  const [bgTheme, setBgTheme] = useState('dots');
  const [skillSearch, setSkillSearch] = useState("");
  const [expandedCategories, setExpandedCategories] = useState(
    Object.keys(SKILL_CATEGORIES).reduce((acc, key) => ({ ...acc, [key]: true }), {})
  );
  const [hoveredSkillTooltip, setHoveredSkillTooltip] = useState(null);

  const handleZoomIn = () => { setZoom(z => { const n = Math.min(z * 1.2, 3); zoomRef.current = n; return n; }); };
  const handleZoomOut = () => { setZoom(z => { const n = Math.max(z / 1.2, 0.2); zoomRef.current = n; return n; }); };
  const handleZoomReset = () => { setZoom(1); zoomRef.current = 1; setPan({ x: 0, y: 0 }); panRef.current = { x: 0, y: 0 }; };

  /* ── Node Graph State ── */
  const [positions, setPositions] = useState({});
  const productPortPositions = useRef({}); // { [productId]: { x, y } } in canvas coords
  const draggingRef = useRef(null);

  /* ── Visual Programming State ── */
  const [skills, setSkills] = useState([]); // { id, type, x, y, status, result, error }
  const [standaloneProducts, setStandaloneProducts] = useState([]); // { id, product, x, y }
  const [connections, setConnections] = useState([]); // { fromId, toId }
  const [selectedConnection, setSelectedConnection] = useState(null);
  const [hoveredConnection, setHoveredConnection] = useState(null);
  const [drawingLine, setDrawingLine] = useState(null); // { startX, startY, curX, curY }
  const drawingRef = useRef(null);

  /* ── Drawing Tools State ── */
  const [drawnShapes, setDrawnShapes] = useState([]);
  const [drawingMode, setDrawingMode] = useState(null);
  const drawingModeRef = useRef(null);
  const [currentColor, setCurrentColor] = useState("#3b82f6");
  const currentColorRef = useRef("#3b82f6");
  const [activeShape, setActiveShape] = useState(null);
  const activeShapeRef = useRef(null);

  const [selectedShapeId, setSelectedShapeId] = useState(null);
  const resizingRef = useRef(null);

  const setMode = (m) => { setDrawingMode(m); drawingModeRef.current = m; };
  const setColor = (c) => { setCurrentColor(c); currentColorRef.current = c; };

  const [previewSkill, setPreviewSkill] = useState(null);

  const spawnSkill = (type) => {
    const newId = `skill_${Date.now()}`;
    const curZoom = zoomRef.current;
    const curPan = panRef.current;
    // Spawn roughly in the center of the viewport
    const vw = containerRef.current?.clientWidth || window.innerWidth;
    const vh = containerRef.current?.clientHeight || window.innerHeight;
    const x = (vw / 2 - curPan.x) / curZoom - 300; // Centered for new 600px width
    const y = (vh / 2 - curPan.y) / curZoom - 100;

    setSkills(prev => [...prev, {
      id: newId, type, x, y, status: 'idle', result: null, error: null,
      language: 'English', webResearch: false, model: 'deepseek-chat', instructions: '', isExpanded: false
    }]);
  };

  const updateSkillData = (id, data) => {
    setSkills(prev => prev.map(s => s.id === id ? { ...s, ...data } : s));
  };

  // ── Master DZ: run selected sections one by one ──────────────────────────
  const runMasterDzSkill = async (skillId, resolvedInput, selectedKeys) => {
    const keysToRun = selectedKeys && selectedKeys.length > 0
      ? selectedKeys
      : Object.keys(SECTION_PROMPTS);

    // Initialise all selected sections as pending, keep previous results for unselected
    setSkills(prev => prev.map(s => s.id === skillId ? {
      ...s, status: 'running', error: null,
      result: {
        selectedKeys: keysToRun,
        sections: keysToRun.map(key => ({ key, status: 'pending', content: null }))
      }
    } : s));

    for (const key of keysToRun) {
      setSkills(prev => prev.map(s => s.id === skillId ? {
        ...s,
        result: {
          ...s.result,
          sections: s.result.sections.map(sec =>
            sec.key === key ? { ...sec, status: 'running' } : sec
          )
        }
      } : s));

      try {
        const prompt = SECTION_PROMPTS[key](resolvedInput);
        const res = await fetch("/api/ai/execute-node", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt, skillId: `master_dz_${key}`, schemaString: "" })
        });
        const data = await res.json();
        const content = res.ok ? (data.result || "") : "Error: " + (data.error || "Unknown error");
        const status = res.ok ? 'done' : 'error';

        setSkills(prev => prev.map(s => s.id === skillId ? {
          ...s,
          result: {
            ...s.result,
            sections: s.result.sections.map(sec =>
              sec.key === key ? { ...sec, status, content, error: res.ok ? null : content } : sec
            )
          }
        } : s));
      } catch (err) {
        setSkills(prev => prev.map(s => s.id === skillId ? {
          ...s,
          result: {
            ...s.result,
            sections: s.result.sections.map(sec =>
              sec.key === key ? { ...sec, status: 'error', error: err.message } : sec
            )
          }
        } : s));
      }
    }

    setSkills(prev => prev.map(s => s.id === skillId ? { ...s, status: 'done' } : s));
  };

  const runSkill = async (skillId) => {
    const skill = skills.find(s => s.id === skillId);
    if (!skill) return;

    // Find what group or product this skill is connected to for global context
    const conn = connections.find(c => c.fromId === skillId);
    let globalContext = {};
    if (conn) {
      if (conn.toId.startsWith('group_')) {
        const groupIdx = parseInt(conn.toId.replace('group_', ''));
        const group = groups[groupIdx];
        if (group) {
          globalContext = {
            niche: group.nicheName,
            audience: group.targetAudience,
            market: "Algeria (DZD)",
            productName: group.products.map(p => p.name).join(", ")
          };
        }
      } else {
        // Connected to a standalone product node
        let product = products.find(p => p.id === conn.toId);

        // If not found in standalone products, search inside groups
        if (!product && groups) {
          for (const g of groups) {
            const found = g.products?.find(p => p.id === conn.toId);
            if (found) {
              product = found;
              // Also enrich context with the group
              globalContext = {
                productName: found.name,
                productDescription: found.description,
                productCategory: found.category,
                productCost: found.financials?.costPrice ? `${found.financials.costPrice} DZD` : undefined,
                productScore: found.algeria?.overallScore ?? found.opportunity?.overallScore,
                market: "Algeria"
              };
              break;
            }
          }
        }

        if (product && !globalContext.productName) {
          globalContext = {
            productName: product.name,
            productDescription: product.description,
            productCost: product.financials?.costPrice ? `${product.financials.costPrice} DZD` : undefined,
            market: "Algeria"
          };
        }
      }
    }

    setSkills(prev => prev.map(s => s.id === skillId ? { ...s, status: 'running', error: null } : s));

    try {
      const skillDef = SKILLS_DICT[skill.type];
      if (!skillDef) throw new Error("Skill definition not found in registry.");

      // 1. Resolve DAG Context
      const engine = new GraphEngine(skills, connections);
      const upstreamOutputs = engine.getUpstreamOutputs(skillId);

      // 2. Resolve Inputs
      const { isReady, missingInputs, resolvedInput, rawMergedContext } = resolveSkillInput({
        skillDef,
        globalContext,
        connectedOutputs: upstreamOutputs
      });

      if (!isReady) {
        throw new Error(`Missing required inputs: ${missingInputs.join(", ")}. Connect required nodes.`);
      }

      // Fast-track website preview by extracting the URL directly without an AI API call
      if (skill.type === 'website_preview') {
        const textToSearch = (skill.instructions || "") + " " + Object.values(upstreamOutputs).map(o => typeof o === 'string' ? o : JSON.stringify(o)).join(" ");
        const urlMatch = textToSearch.match(/https?:\/\/[^\s"']+/);
        const url = urlMatch ? urlMatch[0] : "https://example.com";

        setSkills(prev => prev.map(s => s.id === skillId ? {
          ...s,
          status: 'done',
          result: { url },
          isExpanded: true
        } : s));
        return;
      }

      // (Bypass removed for product_sourcing_compliance)

      // 3. Build Prompt & Schema
      let prompt = skillDef.buildPrompt(resolvedInput);

      // Inject all connected outputs into the prompt so the AI has context
      const connectedContextString = Object.values(upstreamOutputs).map(out =>
        typeof out === 'object' ? JSON.stringify(out, null, 2) : String(out)
      ).join("\n\n");

      if (connectedContextString) {
        prompt += `\n\n=== UPSTREAM CONTEXT / DATA ===\n${connectedContextString}\n===============================\n\nPlease analyze the above upstream data and fulfill the skill's purpose based on it.`;
      }

      prompt += `\nOutput Language: ${skill.language}`;
      if (skill.instructions) {
        prompt += `\nStrict Custom Instructions: ${skill.instructions}`;
      }

      let schemaString = "Return a JSON object containing the exact keys requested by the skill definition.";

      if (skill.type === 'product_sourcing_compliance') {
        schemaString = `Return ONLY a valid JSON object matching this structure exactly (do not wrap in markdown).
CRITICAL: You MUST include an object in the "products" array for EVERY SINGLE PRODUCT mentioned in the upstream data. Do not skip any products.
{
  "products": [
    {
      "name": "Product Name",
      "category": "Category",
      "source": "Sourcing Strategy or Source Name",
      "insights": [
        {
          "title": "Short title of the finding (e.g. Agent Required, Saturation Wall, Competitor Flaw, Trend Alert)",
          "description": "Detailed explanation based on the upstream data",
          "type": "warning" // use "warning" for risks/flaws, "success" for good signs
        }
      ]
    }
  ]
}`;
      } else if (skill.type === 'facebook_ads_testing') {
        schemaString = `Return ONLY a valid JSON object matching this structure exactly (do not wrap in markdown).
{
  "campaignName": "Name of the campaign",
  "budgetType": "CBO (Campaign Budget Optimization) or ABO (Adset Budget Optimization)",
  "campaignBudget": "Suggested daily or lifetime budget (if CBO)",
  "campaignRules": "Automated rules (e.g. Kill ad if spend > $X and 0 sales, scale by 20% if CPA < $Y)",
  "overallStrategy": "High level strategy and objectives",
  "adSets": [
    {
      "name": "Ad Set Name",
      "targeting": "Detailed targeting (demographics, interests, behaviors)",
      "placement": "Placements (e.g., Advantage+ or Manual specific placements)",
      "budget": "Suggested budget (if ABO)",
      "parameters": "Optimization goal, attribution setting, etc.",
      "ads": ["Ad 1 concept/angle", "Ad 2 concept/angle"]
    }
  ]
}`;
      } else if (skill.type === 'buyer_persona_testing') {
        schemaString = `Return ONLY a valid JSON object matching this structure exactly (do not wrap in markdown).
CRITICAL: For EVERY SINGLE PRODUCT mentioned in the upstream data, you MUST provide exactly 2 buyer personas.
{
  "groupName": "Name of the product group or overall theme",
  "overallStrategy": "High level strategy to approach these products",
  "products": [
    {
      "productName": "Name of the specific product",
      "productSummary": "Brief summary of the product's unique selling proposition",
      "personas": [
        {
          "name": "Persona Name (e.g. The Busy Professional)",
          "demographics": "Age, gender, location, income level",
          "psychographics": "Interests, pain points, desires",
          "keywords": "Specific search keywords or terms they use",
          "directTargeting": "Exactly how to target them on ad platforms (specific interests, behaviors, lookalikes)",
          "testingStrategy": "How to test this persona (angles, ad formats, hooks)"
        }
      ]
    }
  ]
}`;
      } else if (skill.type === 'json_to_text_converter') {
        schemaString = "";
      } else if (skill.type === 'master_dz_landing_page_strategy') {
        await runMasterDzSkill(skillId, resolvedInput, skill.selectedSections || DZ_SECTIONS.map(s => s.key));
        return;
      }
      // 4. Execute
      const res = await fetch("/api/ai/execute-node", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, skillId: skill.type, schemaString })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate");

      setSkills(prev => prev.map(s => s.id === skillId ? { ...s, status: 'done', result: data.result } : s));
    } catch (err) {
      setSkills(prev => prev.map(s => s.id === skillId ? { ...s, status: 'error', error: err.message } : s));
    }
  };

  const handleAnalyzeProduct = async (spId) => {
    const sp = standaloneProducts.find(p => p.id === spId);
    if (!sp) return;

    setStandaloneProducts(prev => prev.map(p => p.id === spId ? { ...p, status: 'running', error: null, result: null } : p));

    try {
      const prompt = `PRODUCT INTELLIGENCE SKILL — MASTER BUILD PROMPT

Build a professional PRODUCT INTELLIGENCE research skill for an AI-powered e-commerce research platform.
The skill must only focus on discovering, researching, validating, sourcing, calculating, and preparing a product for the next STRATEGY stage.

# 1. CORE OBJECTIVE
"Is this product sufficiently researched, commercially viable, sourceable, testable, and ready to move into the STRATEGY stage?"

Target Market: ALGERIA (CASH ON DELIVERY / COD E-COMMERCE)

# 2. TARGET PRODUCT DETAILS
Name: ${sp.product.name}
Description: ${sp.product.description}
Price: ${sp.product.price}
Supplier: ${typeof sp.product.supplier === 'object' ? JSON.stringify(sp.product.supplier) : sp.product.supplier}

Please execute the product intelligence research workflow (Discovery, DNA, Demand, Market, Validation, Sourcing, Profitability, Risk).

Return your findings as structured data.`;
      
      const schemaString = `Return a JSON object with this exact structure: { "keyPoints": ["point 1", "point 2", "point 3"], "recommendations": ["rec 1", "rec 2"], "status": "READY FOR TEST or REJECT" }`;

      const res = await fetch("/api/ai/execute-node", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, skillId: 'autonomous_product_researcher', schemaString })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to analyze");

      setStandaloneProducts(prev => prev.map(p => p.id === spId ? { ...p, status: 'done', result: data.result, isResultExpanded: true } : p));
    } catch (err) {
      setStandaloneProducts(prev => prev.map(p => p.id === spId ? { ...p, status: 'error', error: err.message } : p));
    }
  };

  // Initialize node positions when groups load or expand
  useEffect(() => {
    if (groups) {
      const groupLayouts = groups.map((group, i) => {
        let w = 340; // Base GroupCard width
        let adSets = [];
        // If expanded and has adSets, allocate enough horizontal space
        if (expandedGroups[i] && group.campaignStructure?.adSets) {
          adSets = group.campaignStructure.adSets;
          const adW = 320;
          const adGap = 30;
          w = Math.max(340, adSets.length * (adW + adGap) - adGap);
        }
        return { group, w, adSets };
      });

      const gap = 80; // Distance between group blocks
      const totalWidth = groupLayouts.reduce((sum, g) => sum + g.w, 0) + (groups.length - 1) * gap;
      let startX = -(totalWidth / 2);

      const gPos = {};
      groupLayouts.forEach((g, i) => {
        // Center of the group block
        const cx = startX + (g.w / 2);
        const gy = 380;
        gPos[`group_${i}`] = { x: cx - 170, y: gy }; // -170 to offset GroupCard 340px width

        // Dynamically compute AdSet positions if they exist!
        if (g.adSets.length > 0) {
          const adW = 320;
          const adGap = 30;
          const tAdW = g.adSets.length * (adW + adGap) - adGap;
          const aStartX = cx - (tAdW / 2); // Center ad sets below group card

          // Estimate the height of the group card based on products and strategy block
          const groupHeight = 340 + (g.group.products.length * 60) + 160;

          g.adSets.forEach((_, j) => {
            gPos[`adset_${i}_${j}`] = { x: aStartX + j * (adW + adGap), y: gy + groupHeight };
          });
        }

        startX += g.w + gap;
      });

      setPositions(prev => ({ ...prev, head: { x: -260, y: 40 }, ...gPos }));
    } else {
      setPositions({});
      setSkills([]);
      setConnections([]);
    }
  }, [groups, expandedGroups]);

  const containerRef = useRef(null);

  // Product port positions are tracked via ref callbacks on each render - no useEffect needed
  // Helper used in ProductNode via a ref callback - registers canvas position of the port
  const registerProductPort = useCallback((el, productId) => {
    if (!el || !containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const portRect = el.getBoundingClientRect();
    productPortPositions.current[productId] = {
      x: (portRect.left + portRect.width / 2 - containerRect.left - panRef.current.x) / zoomRef.current,
      y: (portRect.top + portRect.height / 2 - containerRect.top - panRef.current.y) / zoomRef.current,
    };
  }, []);


  useEffect(() => { zoomRef.current = zoom; }, [zoom]);
  useEffect(() => { panRef.current = pan; }, [pan]);

  const realProducts = products.filter(p => !p.isPlaceholder);

  useEffect(() => {
    if (groups && containerRef.current) {
      const vw = containerRef.current.clientWidth;
      setPan({ x: vw / 2 - 260, y: 60 });
      setZoom(0.9);
    }
  }, [groups]);

  const handleGenerate = async (size) => {
    setGroupSize(size);
    setShowSizeModal(false);
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/ai/create-ad-groups", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ products: realProducts, groupSize: size }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      if (!data.groups || data.groups.length === 0) throw new Error("AI returned no groups. Try again.");
      setGroups(data.groups);
    } catch (e) {
      setError(e.message || "Failed to generate groups. Check your AI API key in AI Parameters.");
    } finally {
      setLoading(false);
    }
  };

  /* ── Drag & Pan ── */
  const onMouseDown = useCallback((e) => {
    if (e.button !== 0) return;

    // Check if clicking resize handle
    const resizeHandle = e.target.closest('[data-resize-handle]');
    if (resizeHandle && drawingModeRef.current === null) {
      const shapeId = resizeHandle.getAttribute('data-resize-handle');
      const corner = resizeHandle.getAttribute('data-corner');
      const shape = drawnShapes.find(s => s.id === shapeId);
      if (shape) {
        resizingRef.current = {
          id: shapeId, corner, startW: shape.width, startH: shape.height, startX: shape.x, startY: shape.y,
          startMouseX: e.clientX, startMouseY: e.clientY
        };
        e.preventDefault();
        return;
      }
    }

    if (drawingModeRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const canvasX = (e.clientX - containerRect.left - panRef.current.x) / zoomRef.current;
      const canvasY = (e.clientY - containerRect.top - panRef.current.y) / zoomRef.current;

      const newShape = { type: drawingModeRef.current, startX: canvasX, startY: canvasY, width: 0, height: 0, color: currentColorRef.current };
      activeShapeRef.current = newShape;
      setActiveShape(newShape);
      e.preventDefault();
      return;
    }

    // Check if drawing a line from a port
    const portOut = e.target.closest('.port-out');
    const portIn = e.target.closest('.port-in');

    if (portOut || portIn) {
      const port = portOut || portIn;
      const isOut = !!portOut;
      const nodeId = port.getAttribute('data-skill-id') || port.getAttribute('data-skill-node') || port.getAttribute('data-group-id') || port.getAttribute('data-adset-id') || port.getAttribute('data-product-id');

      const rect = port.getBoundingClientRect();
      const containerRect = containerRef.current.getBoundingClientRect();
      const curZoom = zoomRef.current;
      const curPan = panRef.current;

      const portX = rect.left - containerRect.left + rect.width / 2;
      const portY = rect.top - containerRect.top + rect.height / 2;

      const canvasX = (portX - curPan.x) / curZoom;
      const canvasY = (portY - curPan.y) / curZoom;

      drawingRef.current = { nodeId, isOut, startX: canvasX, startY: canvasY };
      setDrawingLine({ startX: canvasX, startY: canvasY, curX: canvasX, curY: canvasY });
      e.preventDefault();
      return;
    }

    // Check if clicking a shape to select it and start dragging
    const clickedShape = e.target.closest('[data-shape-id]');
    if (clickedShape && drawingModeRef.current === null) {
      const id = clickedShape.getAttribute('data-shape-id');
      setSelectedShapeId(id);
      draggingRef.current = id;
      isPanning.current = false;
      setPanning(false);
      lastMouse.current = { x: e.clientX, y: e.clientY };
      e.preventDefault();
      return;
    } else if (drawingModeRef.current === null && !e.target.closest('.group-header') && !e.target.closest('.skill-drag-handle')) {
      setSelectedShapeId(null);
    }

    // Check if clicking on a draggable node (Group or Skill)
    const node = e.target.closest("[data-node-id]");
    const skillNode = e.target.closest("[data-skill-node]");

    if (node || skillNode) {
      // Only drag if clicking header/handle
      if (e.target.closest(".group-header") || e.target.closest(".skill-drag-handle") || node?.getAttribute("data-node-id") === "head") {
        draggingRef.current = node ? node.getAttribute("data-node-id") : skillNode.getAttribute("data-skill-node");
        isPanning.current = false;
        setPanning(false);
      } else {
        return; // Interacting with internals (buttons, text)
      }
    } else {
      // Panning the background
      if (e.target.closest("button") || e.target.closest("input") || e.target.closest(".sidebar")) return;
      draggingRef.current = null;
      isPanning.current = true;
      setPanning(true);
    }

    lastMouse.current = { x: e.clientX, y: e.clientY };
    e.preventDefault();
  }, []);

  const onMouseMove = useCallback((e) => {
    if (resizingRef.current) {
      const dx = (e.clientX - resizingRef.current.startMouseX) / zoomRef.current;
      const dy = (e.clientY - resizingRef.current.startMouseY) / zoomRef.current;
      const r = resizingRef.current;

      setDrawnShapes(prev => prev.map(s => {
        if (s.id === r.id) {
          let nx = r.startX, ny = r.startY, nw = r.startW, nh = r.startH;

          if (r.corner === 'se') {
            nw = Math.max(20, r.startW + dx);
            nh = Math.max(20, r.startH + dy);
          } else if (r.corner === 'sw') {
            nw = Math.max(20, r.startW - dx);
            nx = r.startX + (r.startW - nw);
            nh = Math.max(20, r.startH + dy);
          } else if (r.corner === 'ne') {
            nw = Math.max(20, r.startW + dx);
            nh = Math.max(20, r.startH - dy);
            ny = r.startY + (r.startH - nh);
          } else if (r.corner === 'nw') {
            nw = Math.max(20, r.startW - dx);
            nx = r.startX + (r.startW - nw);
            nh = Math.max(20, r.startH - dy);
            ny = r.startY + (r.startH - nh);
          }
          return { ...s, x: nx, y: ny, width: nw, height: nh };
        }
        return s;
      }));
      return;
    }

    if (activeShapeRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const canvasX = (e.clientX - containerRect.left - panRef.current.x) / zoomRef.current;
      const canvasY = (e.clientY - containerRect.top - panRef.current.y) / zoomRef.current;

      const updated = {
        ...activeShapeRef.current,
        width: canvasX - activeShapeRef.current.startX,
        height: canvasY - activeShapeRef.current.startY
      };
      activeShapeRef.current = updated;
      setActiveShape(updated);
      return;
    }

    if (drawingRef.current) {
      const curZoom = zoomRef.current;
      const curPan = panRef.current;
      const containerRect = containerRef.current.getBoundingClientRect();
      const mouseX = e.clientX - containerRect.left;
      const mouseY = e.clientY - containerRect.top;

      const curX = (mouseX - curPan.x) / curZoom;
      const curY = (mouseY - curPan.y) / curZoom;
      setDrawingLine(p => p ? { ...p, curX, curY } : null);
      return;
    }

    const dx = e.clientX - lastMouse.current.x;
    const dy = e.clientY - lastMouse.current.y;
    lastMouse.current = { x: e.clientX, y: e.clientY };

    if (draggingRef.current) {
      const id = draggingRef.current;
      if (id.startsWith('shape_')) {
        setDrawnShapes(prev => prev.map(s => s.id === id ? { ...s, x: s.x + dx / zoomRef.current, y: s.y + dy / zoomRef.current } : s));
      } else if (id.startsWith('skill_')) {
        setSkills(prev => prev.map(s => s.id === id ? { ...s, x: s.x + dx / zoomRef.current, y: s.y + dy / zoomRef.current } : s));
      } else if (id.startsWith('prodnode_') || id.startsWith('prodtable_')) {
        setStandaloneProducts(prev => prev.map(p => p.id === id ? { ...p, x: p.x + dx / zoomRef.current, y: p.y + dy / zoomRef.current } : p));
      } else {
        setPositions((prev) => ({
          ...prev,
          [id]: {
            x: (prev[id]?.x || 0) + dx / zoomRef.current,
            y: (prev[id]?.y || 0) + dy / zoomRef.current,
          }
        }));
      }
    } else if (isPanning.current) {
      const np = { x: panRef.current.x + dx, y: panRef.current.y + dy };
      panRef.current = np;
      setPan(np);
    }
  }, []);

  const stopPan = useCallback((e) => {
    if (resizingRef.current) {
      resizingRef.current = null;
      return;
    }

    if (activeShapeRef.current) {
      const s = activeShapeRef.current;
      const absW = Math.abs(s.width);
      const absH = Math.abs(s.height);
      if (absW > 10 && absH > 10) {
        setDrawnShapes(prev => [...prev, {
          id: `shape_${Date.now()}`,
          type: s.type,
          x: s.width < 0 ? s.startX + s.width : s.startX,
          y: s.height < 0 ? s.startY + s.height : s.startY,
          width: absW,
          height: absH,
          color: s.color
        }]);
      }
      activeShapeRef.current = null;
      setActiveShape(null);
      setMode(null); // Auto-revert to mouse mode after drawing one shape!
      return;
    }

    if (drawingRef.current) {
      const target = document.elementFromPoint(e.clientX, e.clientY);
      const sourceId = drawingRef.current.nodeId;
      const sourceIsSkill = sourceId?.startsWith('skill_');
      const sourceIsGroup = sourceId?.startsWith('group_');

      if (sourceIsSkill) {
        // Dragged FROM a Skill → drop on Group, Product, or another Skill
        const groupNode = target?.closest('[data-node-id^="group_"]');
        const productNode = target?.closest('[data-product-id]');
        const skillNode = target?.closest('[data-skill-node]');

        let targetId = null;
        if (productNode) {
          targetId = productNode.getAttribute('data-product-id');
        } else if (groupNode) {
          targetId = groupNode.getAttribute('data-node-id');
        } else if (skillNode) {
          targetId = skillNode.getAttribute('data-skill-node');
          if (targetId === sourceId) targetId = null; // prevent self-connection
        }

        if (targetId) {
          setConnections(prev => {
            if (prev.some(c => c.fromId === sourceId && c.toId === targetId)) return prev;
            return [...prev, { fromId: sourceId, toId: targetId }];
          });
        }
      } else {
        // Dragged FROM a Group port OR a Product port → drop on Skill
        const skillNode = target?.closest('[data-skill-node]');
        if (skillNode) {
          const skillId = skillNode.getAttribute('data-skill-node');
          setConnections(prev => {
            if (prev.some(c => c.fromId === skillId && c.toId === sourceId)) return prev;
            return [...prev, { fromId: skillId, toId: sourceId }];
          });
        }
      }
      drawingRef.current = null;
      setDrawingLine(null);
    }

    isPanning.current = false;
    setPanning(false);
    draggingRef.current = null;
  }, []);

  /* ── Zoom EXACTLY toward cursor — reads live refs, no stale state ── */
  const onWheel = useCallback((e) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.1 : 1 / 1.1;
    const curZoom = zoomRef.current;
    const curPan = panRef.current;
    const newZoom = Math.min(Math.max(curZoom * factor, 0.1), 5);
    const rect = containerRef.current.getBoundingClientRect();
    // mouse position relative to canvas container
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    // the canvas point under the cursor must stay fixed:
    //   canvasPoint = (mouse - pan) / zoom
    //   newPan = mouse - canvasPoint * newZoom
    const newPan = {
      x: mx - (mx - curPan.x) * (newZoom / curZoom),
      y: my - (my - curPan.y) * (newZoom / curZoom),
    };
    zoomRef.current = newZoom;
    panRef.current = newPan;
    setZoom(newZoom);
    setPan(newPan);
  }, []);

  const zoomBy = (f, cx, cy) => {
    const curZoom = zoomRef.current;
    const curPan = panRef.current;
    const newZoom = Math.min(Math.max(curZoom * f, 0.1), 5);
    const vw = containerRef.current?.clientWidth || window.innerWidth;
    const vh = containerRef.current?.clientHeight || window.innerHeight;
    const mx = cx ?? vw / 2;
    const my = cy ?? vh / 2;
    const newPan = {
      x: mx - (mx - curPan.x) * (newZoom / curZoom),
      y: my - (my - curPan.y) * (newZoom / curZoom),
    };
    zoomRef.current = newZoom;
    panRef.current = newPan;
    setZoom(newZoom);
    setPan(newPan);
  };

  const fitToScreen = () => {
    if (!containerRef.current || !groups) return;
    const vw = containerRef.current.clientWidth;
    const vh = containerRef.current.clientHeight;
    // rough canvas width: head(520) + groups side by side
    const canvasW = Math.max(520, groups.length * 284 + 80);
    const canvasH = 800;
    const z = Math.min(vw / canvasW, vh / canvasH, 1) * 0.85;
    setZoom(z);
    setPan({ x: (vw - canvasW * z) / 2, y: 40 });
  };

  const totalGrouped = groups ? groups.reduce((s, g) => s + (g.products?.length || 0), 0) : 0;
  const highCount = groups ? groups.filter(g => g.testingPriority === "HIGH").length : 0;

  let bgStyle = {};
  if (bgTheme === 'dots') {
    bgStyle = { background: "#eef1f5", backgroundImage: "radial-gradient(circle, #b0bec5 1px, transparent 1px)", backgroundSize: `${32 * zoom}px ${32 * zoom}px`, backgroundPosition: `${pan.x % (32 * zoom)}px ${pan.y % (32 * zoom)}px` };
  } else if (bgTheme === 'grid') {
    bgStyle = { background: "#f8fafc", backgroundImage: `linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px)`, backgroundSize: `${40 * zoom}px ${40 * zoom}px`, backgroundPosition: `${pan.x % (40 * zoom)}px ${pan.y % (40 * zoom)}px` };
  } else if (bgTheme === 'dark') {
    bgStyle = { background: "#0f172a", backgroundImage: "radial-gradient(circle, #334155 1px, transparent 1px)", backgroundSize: `${32 * zoom}px ${32 * zoom}px`, backgroundPosition: `${pan.x % (32 * zoom)}px ${pan.y % (32 * zoom)}px` };
  } else if (bgTheme === 'blueprint') {
    bgStyle = { background: "#2563eb", backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.2) 1px, transparent 1px)`, backgroundSize: `${40 * zoom}px ${40 * zoom}px`, backgroundPosition: `${pan.x % (40 * zoom)}px ${pan.y % (40 * zoom)}px` };
  }

  return (
    <>
      {/* ══ FIXED FULL-SCREEN CANVAS ══ */}
      <div
        ref={containerRef}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={stopPan}
        onMouseLeave={stopPan}
        onWheel={onWheel}
        onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "copy"; }}
        onDrop={(e) => {
          e.preventDefault();
          const type = e.dataTransfer.getData("skillType");
          const productDrop = e.dataTransfer.getData("productDrop");
          const productTableDrop = e.dataTransfer.getData("productTableDrop");

          if (!type && !productDrop && !productTableDrop) return;

          const rect = containerRef.current.getBoundingClientRect();
          const mouseX = e.clientX - rect.left;
          const mouseY = e.clientY - rect.top;
          const canvasX = (mouseX - panRef.current.x) / zoomRef.current;
          const canvasY = (mouseY - panRef.current.y) / zoomRef.current;

          if (productTableDrop || type === 'product_master_list') {
            setStandaloneProducts(prev => [...prev, {
              id: `prodtable_${Date.now()}`,
              isTable: true,
              x: canvasX,
              y: canvasY
            }]);
            return;
          }

          if (productDrop) {
            const product = JSON.parse(productDrop);
            setStandaloneProducts(prev => [...prev, { id: `prodnode_${Date.now()}`, product, x: canvasX, y: canvasY }]);
            return;
          }

          const newId = `skill_${Date.now()}`;
          setSkills(prev => [...prev, { id: newId, type, x: canvasX, y: canvasY, status: 'idle', result: null, error: null }]);
        }}
        style={{
          position: "fixed", inset: 0, zIndex: 9999,
          ...bgStyle,
          cursor: panning ? "grabbing" : "grab",
          overflow: "hidden",
          userSelect: "none",
        }}
      >
        {/* Canvas layer — all content lives here and is transformed */}
        <div style={{
          position: "absolute", top: 0, left: 0,
          transform: `translate(${pan.x}px,${pan.y}px) scale(${zoom})`,
          transformOrigin: "0 0",
          willChange: "transform",
        }}>

          {/* Drawn Background Shapes (HTML divs) */}
          {drawnShapes.map(s => {
            const isSelected = selectedShapeId === s.id;

            // Inversely scale handle size based on zoom so they are ALWAYS easy to click
            const hSize = Math.max(16, 28 / zoom);
            const hOff = -hSize / 2;
            const hBorder = 4 / zoom;

            return (
              <div
                key={s.id} data-shape-id={s.id}
                style={{
                  position: "absolute", left: s.x, top: s.y, width: s.width, height: s.height,
                  backgroundColor: s.color + "26", // 15% opacity hex
                  border: `${isSelected ? 4 : 2}px ${isSelected ? 'dashed' : 'solid'} ${s.color}`,
                  borderRadius: s.type === 'circle' ? '50%' : 8,
                  cursor: "pointer",
                  pointerEvents: "auto",
                  boxSizing: "border-box",
                  zIndex: 0
                }}
              >
                {isSelected && (
                  <>
                    <div data-resize-handle={s.id} data-corner="nw" style={{ position: "absolute", left: hOff, top: hOff, width: hSize, height: hSize, background: "#fff", border: `${hBorder}px solid #3b82f6`, borderRadius: "50%", cursor: "nwse-resize", pointerEvents: "auto", zIndex: 10, boxShadow: `0 ${2 / zoom}px ${5 / zoom}px rgba(0,0,0,0.2)` }} />
                    <div data-resize-handle={s.id} data-corner="ne" style={{ position: "absolute", right: hOff, top: hOff, width: hSize, height: hSize, background: "#fff", border: `${hBorder}px solid #3b82f6`, borderRadius: "50%", cursor: "nesw-resize", pointerEvents: "auto", zIndex: 10, boxShadow: `0 ${2 / zoom}px ${5 / zoom}px rgba(0,0,0,0.2)` }} />
                    <div data-resize-handle={s.id} data-corner="sw" style={{ position: "absolute", left: hOff, bottom: hOff, width: hSize, height: hSize, background: "#fff", border: `${hBorder}px solid #3b82f6`, borderRadius: "50%", cursor: "nesw-resize", pointerEvents: "auto", zIndex: 10, boxShadow: `0 ${2 / zoom}px ${5 / zoom}px rgba(0,0,0,0.2)` }} />
                    <div data-resize-handle={s.id} data-corner="se" style={{ position: "absolute", right: hOff, bottom: hOff, width: hSize, height: hSize, background: "#fff", border: `${hBorder}px solid #3b82f6`, borderRadius: "50%", cursor: "nwse-resize", pointerEvents: "auto", zIndex: 10, boxShadow: `0 ${2 / zoom}px ${5 / zoom}px rgba(0,0,0,0.2)` }} />
                  </>
                )}
              </div>
            );
          })}

          {/* Active drawing shape (HTML div) */}
          {activeShape && (
            <div style={{
              position: "absolute",
              left: activeShape.width < 0 ? activeShape.startX + activeShape.width : activeShape.startX,
              top: activeShape.height < 0 ? activeShape.startY + activeShape.height : activeShape.startY,
              width: Math.abs(activeShape.width),
              height: Math.abs(activeShape.height),
              backgroundColor: activeShape.color + "26",
              border: `2px solid ${activeShape.color}`,
              borderRadius: activeShape.type === 'circle' ? '50%' : 8,
              pointerEvents: "none",
              boxSizing: "border-box"
            }} />
          )}

          {/* Org Chart Connecting Lines from Head to Groups, and Groups to AdSets */}
          {groups && positions.head && (
            <svg style={{ position: "absolute", top: 0, left: 0, width: 1, height: 1, overflow: "visible", pointerEvents: "none", zIndex: 1 }}>
              {groups.map((group, i) => {
                const id = `group_${i}`;
                if (!positions[id] || !positions.head) return null;
                const hx = positions.head.x + 260; // 520 / 2
                const hy = positions.head.y + 200; // estimated bottom of head node
                const gx = positions[id].x + 170; // 340 / 2
                const gy = positions[id].y;

                // Org chart style line (vertical, horizontal, vertical)
                const midY = (hy + gy) / 2;
                const d = `M ${hx} ${hy} L ${hx} ${midY} L ${gx} ${midY} L ${gx} ${gy}`;

                let adSetLines = null;
                if (expandedGroups[i] && group.campaignStructure?.adSets) {
                  adSetLines = group.campaignStructure.adSets.map((_, j) => {
                    const asId = `adset_${i}_${j}`;
                    if (!positions[asId]) return null;
                    const ax = positions[asId].x + 160; // 320 / 2
                    const ay = positions[asId].y;

                    // Estimate the bottom of the group card dynamically
                    const groupHeight = 340 + (group.products.length * 60) + 160;
                    const gyBottom = gy + groupHeight - 40; // slightly above the new node
                    const amidY = gyBottom + 20;
                    const asPath = `M ${gx} ${gyBottom} L ${gx} ${amidY} L ${ax} ${amidY} L ${ax} ${ay}`;
                    return <path key={asId} d={asPath} stroke="rgb(200, 211, 219)" strokeWidth="2.5" fill="none" className="animated-path" />;
                  });
                }

                return (
                  <g key={id}>
                    <path d={d} stroke="rgb(200, 211, 219)" strokeWidth="2.5" fill="none" className="animated-path" />
                    {adSetLines}
                  </g>
                );
              })}

              {/* Interactive Connections (Skills to Groups/Products) */}
              {connections.map((conn, i) => {
                const skill = skills.find(s => s.id === conn.fromId);
                const isGroup = conn.toId.startsWith('group_');
                if (!skill) return null;

                let gx = 0;
                let gy = 0;

                if (isGroup) {
                  const groupPos = positions[conn.toId];
                  if (!groupPos) return null;
                  gx = groupPos.x;
                  gy = groupPos.y + 40;
                } else if (conn.toId.startsWith('skill_')) {
                  const targetSkill = skills.find(s => s.id === conn.toId);
                  if (!targetSkill) return null;
                  gx = targetSkill.x;
                  gy = targetSkill.y + 100;
                } else {
                  // Use exact port position tracked via ref callback on each render
                  const portPos = productPortPositions.current[conn.toId];
                  if (!portPos) return null;
                  gx = portPos.x;
                  gy = portPos.y;
                }

                // Skill right center port
                const sx = skill.x + 220;
                const sy = skill.y + 30;

                // Horizontal org chart style line
                const midX = (sx + gx) / 2;
                const d = `M ${sx} ${sy} L ${midX} ${sy} L ${midX} ${gy} L ${gx} ${gy}`;
                const isSelected = selectedConnection === i;
                const connColor = isSelected ? "#f59e0b" : skill.status === 'running' ? "#0ea5e9" : "#10b981";

                // Midpoint for delete button
                const btnX = midX;
                const btnY = (sy + gy) / 2;

                return (
                  <g key={`conn_${i}`} onClick={() => setSelectedConnection(isSelected ? null : i)}>
                    {/* Wide invisible hit area */}
                    <path d={d} stroke="transparent" strokeWidth="24" fill="none" style={{ cursor: 'pointer' }} />
                    {/* Visible line */}
                    <path
                      d={d}
                      stroke={connColor}
                      strokeWidth={isSelected ? 3.5 : 2.5}
                      fill="none"
                      strokeDasharray={isSelected ? "none" : "8 8"}
                      style={{ pointerEvents: 'none', filter: isSelected ? "drop-shadow(0 0 4px #f59e0b)" : "none" }}
                    >
                      {!isSelected && (
                        <animate
                          attributeName="stroke-dashoffset"
                          values="16;0"
                          dur={skill.status === 'running' ? "0.5s" : "1.5s"}
                          repeatCount="indefinite"
                        />
                      )}
                    </path>
                    {/* Endpoint dot on product */}
                    <circle cx={gx} cy={gy} r="4" fill={connColor} style={{ pointerEvents: 'none' }} />
                    {/* Endpoint dot on skill */}
                    <circle cx={sx} cy={sy} r="4" fill={connColor} style={{ pointerEvents: 'none' }} />
                    {/* Running particle */}
                    {skill.status === 'running' && (
                      <circle r="5" fill="#0ea5e9" filter="drop-shadow(0 0 4px #0ea5e9)">
                        <animateMotion path={d} dur="1.5s" repeatCount="indefinite" />
                      </circle>
                    )}
                    {/* Delete button (shown when selected) */}
                    {isSelected && (
                      <g
                        onClick={(e) => { e.stopPropagation(); setConnections(prev => prev.filter((_, idx) => idx !== i)); setSelectedConnection(null); }}
                        style={{ cursor: 'pointer' }}
                      >
                        <circle cx={btnX} cy={btnY} r="11" fill="#ef4444" />
                        <text x={btnX} y={btnY + 4.5} textAnchor="middle" fontSize="14" fill="#fff" fontWeight="bold" style={{ pointerEvents: 'none', userSelect: 'none' }}>✕</text>
                      </g>
                    )}
                  </g>
                );
              })}
              {/* Active Drawing Line */}
              {drawingLine && (
                <path
                  d={`M ${drawingLine.startX} ${drawingLine.startY} L ${(drawingLine.startX + drawingLine.curX) / 2} ${drawingLine.startY} L ${(drawingLine.startX + drawingLine.curX) / 2} ${drawingLine.curY} L ${drawingLine.curX} ${drawingLine.curY}`}
                  stroke="#94a3b8" strokeWidth="3" strokeDasharray="6 6" fill="none"
                  style={{ pointerEvents: 'none' }}
                />
              )}
            </svg>
          )}

          {/* Head node */}
          <div data-node-id="head" style={{ position: "absolute", left: positions.head?.x || 0, top: positions.head?.y || 0, display: "flex", flexDirection: "column", alignItems: "center", width: 520, cursor: draggingRef.current === "head" ? "grabbing" : "grab" }}>
            <div style={{ background: "#fff", border: "1.5px solid #c8d3db", borderRadius: 16, padding: "22px 30px", width: "100%", textAlign: "center", boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
              <div style={{ fontSize: 9, fontFamily: "monospace", textTransform: "uppercase", letterSpacing: 1.5, color: "#94a3b8", marginBottom: 10 }}>AD HEAD</div>
              <div style={{ fontSize: 24, fontWeight: 900, color: "#1a2332", marginBottom: 5, letterSpacing: -.5, display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                <DynamicIcon name="Map" size={24} color="#16a34a" />
                <span>ALGERIA AD TESTING</span>
              </div>
              <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.6, marginBottom: groups ? 14 : 0 }}>
                {groups ? `${groups.length} niche groups · ${totalGrouped} products · ${highCount} high priority`
                  : "smart niche grouping · one campaign per group · find winning products"}
              </div>
              {groups && (
                <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginBottom: 12 }}>
                  {[{ l: "TOTAL GROUPS", v: groups.length }, { l: "HIGH PRIORITY", v: highCount }, { l: "PRODUCTS/GROUP", v: groupSize }].map(({ l, v }) => (
                    <div key={l} style={{ background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: 8, padding: "7px 14px", fontFamily: "monospace" }}>
                      <div style={{ fontSize: 18, fontWeight: 900, color: "#1a2332", lineHeight: 1 }}>{v}</div>
                      <div style={{ fontSize: 8, color: "#94a3b8", textTransform: "uppercase", letterSpacing: .8, marginTop: 2 }}>{l}</div>
                    </div>
                  ))}
                </div>
              )}
              {groups && (
                <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: "9px 13px", textAlign: "left" }}>
                  <div style={{ fontSize: 9, fontFamily: "monospace", textTransform: "uppercase", letterSpacing: .8, color: "#94a3b8", marginBottom: 5 }}>HOW TO USE</div>
                  <div style={{ fontSize: 11, color: "#475569", lineHeight: 1.7 }}>
                    1 campaign per group → 1 ad set per product → same interests → kill losers day 3 → <strong style={{ color: "#16a34a" }}>scale the winner</strong>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Group Nodes and AdSet Nodes */}
          {groups && groups.map((group, i) => {
            const id = `group_${i}`;
            return (
              <React.Fragment key={i}>
                <div data-node-id={id} style={{ position: "absolute", left: positions[id]?.x || 0, top: positions[id]?.y || 0 }}>
                  {/* Port In dot */}
                  <div
                    className="port-in" data-group-id={id}
                    style={{ position: "absolute", left: -6, top: 40, width: 12, height: 12, borderRadius: "50%", background: "#fff", border: "2px solid #10b981", zIndex: 10, cursor: "crosshair" }}
                  />

                  {/* Port Out dot (bottom) */}
                  <div
                    className="port-out" data-group-id={id}
                    style={{ position: "absolute", left: "50%", bottom: -6, marginLeft: -6, width: 12, height: 12, borderRadius: "50%", background: "#fff", border: "2px solid #10b981", zIndex: 10, cursor: "crosshair" }}
                  />

                  <GroupCard group={group} isExpanded={!!expandedGroups[i]} onToggle={() => setExpandedGroups(p => ({ ...p, [i]: !p[i] }))} onPortMount={registerProductPort} />
                </div>

                {/* Render AdSet Nodes if they exist and group is expanded */}
                {expandedGroups[i] && group.campaignStructure?.adSets?.map((adSet, j) => {
                  const adSetId = `adset_${i}_${j}`;
                  return (
                    <div data-node-id={adSetId} key={adSetId} style={{ position: "absolute", left: positions[adSetId]?.x || 0, top: positions[adSetId]?.y || 0 }}>
                      {/* Port In dot */}
                      <div
                        className="port-in" data-adset-id={adSetId}
                        style={{ position: "absolute", left: "50%", top: -6, marginLeft: -6, width: 12, height: 12, borderRadius: "50%", background: "#fff", border: "2px solid #3b82f6", zIndex: 10, cursor: "crosshair" }}
                      />
                      {/* Port Out dot */}
                      <div
                        className="port-out" data-adset-id={adSetId}
                        style={{ position: "absolute", left: -6, top: 40, width: 12, height: 12, borderRadius: "50%", background: "#fff", border: "2px solid #3b82f6", zIndex: 10, cursor: "crosshair" }}
                      />
                      <AdSetCard adSet={adSet} groupId={i} adSetId={j} />
                    </div>
                  );
                })}
              </React.Fragment>
            );
          })}

          {/* Standalone Product Cards & Tables */}
          {standaloneProducts.map((sp) => {
            if (sp.isTable) {
              return (
                <div data-node-id={sp.id} key={sp.id} style={{
                  position: "absolute", left: sp.x, top: sp.y,
                  width: 960, background: "#fff", border: "1px solid #cbd5e1",
                  borderRadius: 16, boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
                  display: "flex", flexDirection: "column", overflow: "hidden"
                }}>
                  <div className="group-header" style={{ background: "#f8fafc", padding: "16px 20px", borderBottom: "1px solid #e2e8f0", cursor: "grab", display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ color: "#f59e0b", display: "flex", alignItems: "center" }}><DynamicIcon name="Package" size={18} /></div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: "#1e293b", letterSpacing: 0.5, flex: 1 }}>PRODUCT MASTER LIST</div>
                  </div>
                  {/* Delete btn */}
                  <button
                    onClick={() => {
                      setStandaloneProducts(prev => prev.filter(p => p.id !== sp.id));
                      setConnections(prev => prev.filter(c => c.fromId !== sp.id && c.toId !== sp.id));
                    }}
                    style={{ position: "absolute", top: -8, right: -8, width: 24, height: 24, borderRadius: "50%", background: "#ef4444", color: "#fff", border: "none", fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 20 }}
                  >×</button>
                  <div style={{ padding: "0", maxHeight: 600, overflowY: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                      <thead>
                        <tr style={{ background: "#f1f5f9", borderBottom: "1px solid #e2e8f0" }}>
                          <th style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Image</th>
                          <th style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Product Name</th>
                          <th style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Price</th>
                          <th style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Margin</th>
                          <th style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Supplier</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map((p, idx) => (
                          <tr key={idx} style={{ borderBottom: "1px solid #f1f5f9", transition: "background 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                            <td style={{ padding: "16px" }}>
                              {p.imageUrl || p.mainImage ? (
                                <div style={{ width: 80, height: 80, borderRadius: 8, backgroundImage: `url(${p.imageUrl || p.mainImage})`, backgroundSize: "cover", backgroundPosition: "center", border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }} />
                              ) : (
                                <div style={{ width: 80, height: 80, borderRadius: 8, background: "linear-gradient(135deg, #f1f5f9, #e2e8f0)", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", border: "1px solid #e2e8f0" }}><DynamicIcon name="Image" size={24} /></div>
                              )}
                            </td>
                            <td style={{ padding: "16px", fontSize: 14, fontWeight: 700, color: "#0f172a", maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name.replace(/\(.*?\)/g, '').trim()}</td>
                            <td style={{ padding: "16px", fontSize: 13, fontWeight: 600, color: "#475569" }}>{p.price || "—"}</td>
                            <td style={{ padding: "16px", fontSize: 13, fontWeight: 800, color: "#10b981" }}>{p.margin || "—"}</td>
                            <td style={{ padding: "16px", fontSize: 13, fontWeight: 600, color: "#475569", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{typeof p.supplier === 'object' ? p.supplier.name : (p.supplier || "—")}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            }

            return (
              <div data-node-id={sp.id} key={sp.id} style={{
                position: "absolute", left: sp.x, top: sp.y,
                width: 320, background: "#fff", border: "1px solid #cbd5e1",
                borderRadius: 16, boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
                display: "flex", flexDirection: "column", overflow: "hidden"
              }}>
                {/* Port Out dot (bottom) */}
                <div
                  className="port-out" data-product-id={sp.id}
                  style={{ position: "absolute", left: "50%", bottom: -6, marginLeft: -6, width: 12, height: 12, borderRadius: "50%", background: "#fff", border: "2px solid #f59e0b", zIndex: 10, cursor: "crosshair" }}
                />
                {/* Drag Header */}
                <div className="group-header" style={{ background: "#f8fafc", padding: "12px 16px", borderBottom: "1px solid #e2e8f0", cursor: "grab", display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ color: "#f59e0b", display: "flex", alignItems: "center" }}><DynamicIcon name="Box" size={16} /></div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", letterSpacing: 0.5, flex: 1 }}>PRODUCT CARD</div>
                </div>

                {/* Delete btn */}
                <button
                  onClick={() => {
                    setStandaloneProducts(prev => prev.filter(p => p.id !== sp.id));
                    setConnections(prev => prev.filter(c => c.fromId !== sp.id && c.toId !== sp.id));
                  }}
                  style={{ position: "absolute", top: -8, right: -8, width: 24, height: 24, borderRadius: "50%", background: "#ef4444", color: "#fff", border: "none", fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 20 }}
                >×</button>

                <div style={{ padding: "16px" }}>
                  {sp.product.imageUrl || sp.product.mainImage ? (
                    <div style={{ width: "100%", height: 160, borderRadius: 8, backgroundImage: `url(${sp.product.imageUrl || sp.product.mainImage})`, backgroundSize: "cover", backgroundPosition: "center", marginBottom: 16, border: "1px solid #e2e8f0", backgroundColor: "#f8fafc" }} />
                  ) : (
                    <div style={{ width: "100%", height: 160, borderRadius: 8, background: "linear-gradient(135deg, #f1f5f9, #e2e8f0)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16, border: "1px solid #e2e8f0", color: "#94a3b8" }}>
                      <DynamicIcon name="Image" size={32} />
                    </div>
                  )}

                  <div style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", marginBottom: 8, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", lineHeight: 1.3 }}>
                    {sp.product.name.replace(/\(.*?\)/g, '').trim()}
                  </div>

                  <div style={{ display: "flex", gap: 12, marginBottom: 12, paddingBottom: 12, borderBottom: "1px solid #f1f5f9" }}>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.5 }}>Price</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{sp.product.price || "—"}</span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.5 }}>Margin</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#10b981" }}>{sp.product.margin || "—"}</span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.5 }}>Supplier</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{typeof sp.product.supplier === 'object' ? sp.product.supplier.name : (sp.product.supplier || "Aliexpress")}</span>
                    </div>
                  </div>

                  <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.5, maxHeight: 60, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", marginBottom: 16 }}>
                    {sp.product.description || "No description provided."}
                  </div>

                  {sp.status === 'running' ? (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "10px", background: "#f1f5f9", color: "#64748b", borderRadius: 8, fontSize: 13, fontWeight: 700 }}>
                      <DynamicIcon name="Loader2" size={14} className="animate-spin" />
                      Analyzing...
                    </div>
                  ) : sp.status === 'error' ? (
                    <div style={{ padding: "10px", background: "#fef2f2", color: "#ef4444", borderRadius: 8, fontSize: 12, fontWeight: 600, border: "1px solid #fca5a5" }}>
                      {sp.error || "Failed to analyze"}
                      <button onClick={(e) => { e.stopPropagation(); setStandaloneProducts(prev => prev.map(p => p.id === sp.id ? { ...p, status: 'idle', error: null } : p)); }} style={{ display: "block", marginTop: 4, background: "none", border: "none", color: "#b91c1c", cursor: "pointer", fontSize: 11, fontWeight: 700, padding: 0 }}>Try Again</button>
                    </div>
                  ) : sp.status === 'done' && sp.result ? (
                    sp.isResultExpanded ? (
                      <div 
                        onMouseDown={e => e.stopPropagation()}
                        onWheel={e => e.stopPropagation()}
                        style={{ marginTop: 8, padding: 12, background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0", maxHeight: 380, overflowY: "auto" }}
                      >
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                          <span style={{ fontSize: 11, fontWeight: 800, color: "#10b981" }}>ANALYSIS RESULT</span>
                          <div style={{ display: "flex", gap: 8 }}>
                            <button onClick={(e) => { e.stopPropagation(); setStandaloneProducts(prev => prev.map(p => p.id === sp.id ? { ...p, isResultExpanded: false } : p)); }} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: 10, fontWeight: 700 }}>HIDE</button>
                            <button onClick={(e) => { e.stopPropagation(); setStandaloneProducts(prev => prev.map(p => p.id === sp.id ? { ...p, status: 'idle', result: null } : p)); }} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: 10, fontWeight: 700 }}>CLEAR</button>
                          </div>
                        </div>
                        {sp.result?.summary ? (
                          <StageIntelligenceViewer data={sp.result} skillLabel={sp.product?.title || "Product Intelligence"} />
                        ) : (
                          <div style={{ fontSize: 12, color: "#475569", lineHeight: 1.5 }}>
                            <ul style={{ paddingLeft: 16, margin: 0, display: "flex", flexDirection: "column", gap: 6 }}>
                              {(sp.result.keyPoints || []).map((kp, i) => <li key={i}>{typeof kp === "object" && kp !== null ? JSON.stringify(kp) : kp}</li>)}
                            </ul>
                            {typeof sp.result === "object" && !sp.result.keyPoints && !sp.result.recommendations && sp.result !== null && (
                              <pre style={{ whiteSpace: "pre-wrap", margin: 0 }}>{JSON.stringify(sp.result, null, 2)}</pre>
                            )}
                            {sp.result.recommendations && sp.result.recommendations.length > 0 && (
                              <>
                                <div style={{ marginTop: 12, marginBottom: 4, fontSize: 11, fontWeight: 800, color: "#f59e0b" }}>RECOMMENDATIONS</div>
                                <ul style={{ paddingLeft: 16, margin: 0, display: "flex", flexDirection: "column", gap: 6 }}>
                                  {sp.result.recommendations.map((rec, i) => <li key={i}>{typeof rec === "object" && rec !== null ? JSON.stringify(rec) : rec}</li>)}
                                </ul>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setStandaloneProducts(prev => prev.map(p => p.id === sp.id ? { ...p, isResultExpanded: true } : p));
                        }}
                        style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "10px", background: "#f1f5f9", color: "#0f172a", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "all 0.2s ease" }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "#e2e8f0"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "#f1f5f9"; e.currentTarget.style.transform = "translateY(0)"; }}
                      >
                        <DynamicIcon name="Eye" size={14} />
                        View Result
                      </button>
                    )
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAnalyzeProduct(sp.id);
                      }}
                      style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "10px", background: "linear-gradient(135deg, #3b82f6, #2563eb)", color: "#fff", borderRadius: 8, border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 12px rgba(37, 99, 235, 0.2)", transition: "all 0.2s ease" }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-1px)"}
                      onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
                    >
                      <DynamicIcon name="Sparkles" size={14} />
                      Analyze Product
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {/* Skill Nodes */}
          {skills.map((skill) => {
            const isConnected = connections.some(c => c.toId === skill.id || c.fromId === skill.id);
            const canRun = isConnected || !!skill.instructions || skill.type === 'website_preview';
            return (
              <div data-skill-node={skill.id} key={skill.id} style={{
                position: "absolute", left: skill.x, top: skill.y,
                width: (skill.isExpanded && (skill.type === 'facebook_ads_testing' || skill.type === 'buyer_persona_testing')) ? "max-content" : 600,
                minWidth: 600,
                background: "#fff", border: "1px solid #cbd5e1",
                borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                display: "flex", flexDirection: "column"
              }}>
                {/* Port In dot (for receiving from other skills) */}
                <div
                  className="port-in" data-skill-node={skill.id}
                  style={{
                    position: "absolute", left: -8, top: 100, marginTop: -8, width: 16, height: 16,
                    borderRadius: "50%", background: "#fff", border: "3px solid #10b981",
                    cursor: "crosshair", zIndex: 10, boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                  }}
                />

                {/* Drag Header / Title Area */}
                <div className="skill-drag-handle" style={{ background: "#fff", padding: "16px 20px", borderBottom: "1px solid #e2e8f0", borderTopLeftRadius: 12, borderTopRightRadius: 12, cursor: "grab" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: "#10b981", background: "#d1fae5", padding: "4px 8px", borderRadius: 16 }}>SECTION 01</span>
                    {skill.status === 'done' && <span style={{ fontSize: 10, fontWeight: 700, color: "#10b981", display: "flex", alignItems: "center", gap: 4 }}><DynamicIcon name="Check" size={12} /> Completed</span>}
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: "#1e293b", marginBottom: 4 }}>{SKILLS_DICT[skill.type].label}</div>
                  <div style={{ fontSize: 12, color: "#64748b" }}>{SKILLS_DICT[skill.type].desc}.</div>
                </div>

                {/* Parameters Area */}
                <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 16, background: "#f8fafc", borderBottomLeftRadius: 12, borderBottomRightRadius: 12 }}>

                  {/* Config Row */}
                  <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#fff", border: "1px solid #e2e8f0", padding: "6px 12px", borderRadius: 20, fontSize: 11, color: "#475569" }}>
                      <span>Depends on:</span> <strong>{isConnected ? "Connected Node" : "—"}</strong>
                    </div>
                    <button onClick={() => updateSkillData(skill.id, { webResearch: !skill.webResearch })} style={{ display: "flex", alignItems: "center", gap: 6, background: skill.webResearch ? "#d1fae5" : "#fff", border: `1px solid ${skill.webResearch ? "#10b981" : "#e2e8f0"}`, padding: "6px 12px", borderRadius: 20, fontSize: 11, color: skill.webResearch ? "#047857" : "#475569", cursor: "pointer", fontWeight: 700 }}>
                      <DynamicIcon name="Globe" size={12} /> LIVE WEB RESEARCH {skill.webResearch ? "ON" : "OFF"}
                    </button>
                    <select value={skill.language || 'English'} onChange={(e) => updateSkillData(skill.id, { language: e.target.value })} style={{ background: "#fff", border: "1px solid #e2e8f0", padding: "6px 12px", borderRadius: 20, fontSize: 11, color: "#475569", cursor: "pointer", outline: "none" }}>
                      <option value="English">English</option>
                      <option value="Arabic">Arabic</option>
                      <option value="Arabic Algeria">Arabic (Algeria)</option>
                      <option value="French">French</option>
                    </select>
                  </div>

                  {/* Web Research Target & Preview */}
                  {skill.webResearch && (
                    <div style={{ marginTop: -4 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: 6 }}>TARGET WEBSITE URL</div>
                      <input
                        type="text"
                        value={skill.targetUrl || ''}
                        onChange={(e) => updateSkillData(skill.id, { targetUrl: e.target.value })}
                        placeholder="https://example.com"
                        style={{ width: "100%", background: "#fff", border: "1px solid #cbd5e1", borderRadius: 8, padding: "10px", fontSize: 12, color: "#1e293b", outline: "none", fontFamily: "monospace" }}
                      />
                      {skill.targetUrl && skill.targetUrl.includes('.') && (
                        <div className="site-preview" style={{ marginTop: 12, height: 200, backgroundImage: `url('https://image.thum.io/get/width/600/crop/800/noanimate/${skill.targetUrl}')` }}>
                          <div className="site-preview-open">{skill.targetUrl}</div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Custom Instructions */}
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: 6 }}>CUSTOM AI INSTRUCTIONS</div>
                    <textarea
                      value={skill.instructions}
                      onChange={(e) => updateSkillData(skill.id, { instructions: e.target.value })}
                      placeholder='E.g. "Focus heavily on Algeria and French-speaking North Africa."'
                      style={{ width: "100%", height: 60, background: "#fff", border: "1px solid #cbd5e1", borderRadius: 8, padding: "10px", fontSize: 12, color: "#1e293b", resize: "none", fontFamily: "inherit", outline: "none" }}
                    />
                  </div>

                  {/* Section Selector for Master DZ skill */}
                  {skill.type === 'master_dz_landing_page_strategy' && skill.status !== 'running' && (
                    <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: "12px 14px" }}>
                      <MasterDzSelector
                        selected={skill.selectedSections || DZ_SECTIONS.map(s => s.key)}
                        onChange={(sel) => updateSkillData(skill.id, { selectedSections: sel })}
                      />
                    </div>
                  )}

                  {/* Actions Row */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 10, borderTop: "1px solid #e2e8f0" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <button onClick={() => runSkill(skill.id)} disabled={!canRun || skill.status === 'running'} style={{ display: "flex", alignItems: "center", gap: 6, background: canRun ? "#047857" : "#94a3b8", color: "#fff", border: "none", padding: "8px 16px", borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: (!canRun || skill.status === 'running') ? "not-allowed" : "pointer", opacity: canRun ? 1 : 0.6 }}>
                        <DynamicIcon name={skill.status === 'running' ? "Loader2" : "Play"} size={14} />
                        {skill.status === 'running' ? "RUNNING..." :
                          skill.type === 'master_dz_landing_page_strategy'
                            ? `RUN ${(skill.selectedSections || DZ_SECTIONS.map(s => s.key)).length} SECTIONS`
                            : "RUN AI ANALYSIS"}
                      </button>
                      {skill.status === 'done' && skill.type !== 'master_dz_landing_page_strategy' && (
                        <button onClick={() => updateSkillData(skill.id, { isExpanded: !skill.isExpanded })} style={{ display: "flex", alignItems: "center", gap: 6, background: skill.isExpanded ? "#f1f5f9" : "#fff", color: "#64748b", border: "1px solid #e2e8f0", padding: "8px 16px", borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                          <DynamicIcon name={skill.isExpanded ? "EyeOff" : "Eye"} size={14} /> {skill.isExpanded ? "HIDE RESULT" : "VIEW RESULT"}
                        </button>
                      )}
                    </div>
                    {skill.status === 'error' && <div style={{ fontSize: 11, color: "#ef4444" }}>Error: {skill.error}</div>}
                  </div>
                </div>

                {/* Inline Result View */}
                {((skill.status === 'done' && skill.isExpanded) || (skill.status === 'running' && skill.type === 'master_dz_landing_page_strategy')) && (
                  <div style={{ padding: "0 20px 20px 20px", display: "flex", flexDirection: "column", gap: 16 }}>
                    {skill.type === 'product_sourcing_compliance' ? (
                      <div style={{ background: "#fff", borderRadius: 12, overflow: "hidden", border: "1px solid #e2e8f0" }}>
                        <ProductSourcingChart data={skill.result} />
                      </div>
                    ) : skill.type === 'product_intelligence_01' ? (
                      <ProductIntelligenceDashboard data={skill.result} />
                    ) : skill.type === 'facebook_ads_testing' ? (
                      <FacebookAdsOrgChart data={skill.result} />
                    ) : skill.type === 'buyer_persona_testing' ? (
                      <BuyerPersonaOrgChart data={skill.result} />
                    ) : skill.type === 'master_dz_landing_page_strategy' ? (
                      <MasterDzSections sections={skill.result?.sections || []} selectedKeys={skill.result?.selectedKeys} />
                    ) : skill.type === 'ad_creative_style_detector' ? (
                      <div style={{ padding: "0 4px" }}>
                        <AdCreativeAnalyzerView data={skill.result} />
                      </div>
                    ) : skill.type === 'json_to_text_converter' ? (
                      <div
                        onMouseDown={e => e.stopPropagation()}
                        onWheel={e => e.stopPropagation()}
                        style={{ background: "#f8fafc", padding: "24px 32px", borderRadius: 16, border: "1px solid #e2e8f0", fontSize: 15, color: "#334155", lineHeight: 1.8, whiteSpace: "pre-wrap", fontFamily: "system-ui, -apple-system, sans-serif", maxHeight: 500, overflowY: "auto", cursor: "text", userSelect: "text" }}
                      >
                        {skill.result?.report || skill.result}
                      </div>
                    ) : skill.type === 'website_preview' ? (
                      <div style={{ background: "#f8fafc", borderRadius: 12, overflow: "hidden", border: "1px solid #e2e8f0" }}>
                        <div style={{ padding: "8px 12px", background: "#e2e8f0", display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ display: "flex", gap: 4 }}>
                            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#f87171" }} />
                            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#fbbf24" }} />
                            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#34d399" }} />
                          </div>
                          <div style={{ flex: 1, background: "#fff", borderRadius: 4, padding: "2px 8px", fontSize: 10, color: "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {skill.result?.url}
                          </div>
                        </div>
                        <iframe
                          src={skill.result?.url}
                          style={{ width: "100%", height: 400, border: "none", display: "block" }}
                          title="Website Preview"
                        />
                      </div>
                    ) : skill.result?.summary ? (
                      <>
                        <div style={{ background: "#f1f5f9", padding: 16, borderRadius: 12, borderLeft: "4px solid #3b82f6" }}>
                          <div style={{ fontSize: 11, fontWeight: 800, color: "#3b82f6", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Executive Summary</div>
                          <div style={{ fontSize: 13, color: "#1e293b", lineHeight: 1.6 }}>
                            {typeof skill.result.summary === "object" && skill.result.summary !== null ? <pre style={{margin: 0, whiteSpace: "pre-wrap", fontFamily: "inherit"}}>{JSON.stringify(skill.result.summary, null, 2)}</pre> : skill.result.summary}
                          </div>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                          <div>
                            <div style={{ fontSize: 11, fontWeight: 800, color: "#10b981", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}><DynamicIcon name="CheckCircle" size={14} /> Key Points</div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                              {(skill.result.keyPoints || []).map((kp, idx) => (
                                <div key={idx} style={{ background: "#fff", border: "1px solid #e2e8f0", padding: "10px 14px", borderRadius: 8, fontSize: 12, color: "#475569", boxShadow: "0 1px 2px rgba(0,0,0,0.02)" }}>
                                  {typeof kp === "object" && kp !== null ? <pre style={{margin: 0, whiteSpace: "pre-wrap", fontFamily: "inherit"}}>{JSON.stringify(kp, null, 2)}</pre> : kp}
                                </div>
                              ))}
                            </div>
                          </div>
                          <div>
                            <div style={{ fontSize: 11, fontWeight: 800, color: "#f59e0b", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}><DynamicIcon name="Lightbulb" size={14} /> Recommendations</div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                              {(skill.result.recommendations || []).map((rec, idx) => (
                                <div key={idx} style={{ background: "#fff", border: "1px solid #e2e8f0", padding: "10px 14px", borderRadius: 8, fontSize: 12, color: "#475569", boxShadow: "0 1px 2px rgba(0,0,0,0.02)" }}>
                                  {typeof rec === "object" && rec !== null ? <pre style={{margin: 0, whiteSpace: "pre-wrap", fontFamily: "inherit"}}>{JSON.stringify(rec, null, 2)}</pre> : rec}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div style={{ background: "#1e293b", padding: 16, borderRadius: 12, color: "#a5b4fc", fontFamily: "monospace", fontSize: 12, whiteSpace: "pre-wrap" }}>
                        {typeof skill.result === 'object' ? JSON.stringify(skill.result, null, 2) : skill.result}
                      </div>
                    )}
                  </div>
                )}

                {/* Port Out dot */}
                <div
                  className="port-out" data-skill-id={skill.id}
                  style={{
                    position: "absolute", right: -8, top: "50%", marginTop: -8, width: 16, height: 16,
                    borderRadius: "50%", background: "#10b981", border: "3px solid #fff",
                    cursor: "crosshair", zIndex: 10, boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                  }}
                />

                {/* Delete btn */}
                <button
                  onClick={() => {
                    setSkills(p => p.filter(s => s.id !== skill.id));
                    setConnections(p => p.filter(c => c.fromId !== skill.id));
                  }}
                  style={{ position: "absolute", top: -8, right: -8, width: 24, height: 24, borderRadius: "50%", background: "#ef4444", color: "#fff", border: "none", fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                >×</button>
              </div>
            );
          })}

          {/* Error */}
          {error && (
            <div style={{ maxWidth: 440, margin: "24px auto", background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: 10, padding: "12px 16px", fontFamily: "monospace", fontSize: 11, color: "#dc2626", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>❌ {error}</span>
              <button onClick={() => { setGroups(null); setShowSizeModal(true); }} style={{ background: "#dc2626", color: "#fff", border: "none", borderRadius: 5, padding: "4px 10px", fontSize: 10, cursor: "pointer", fontFamily: "monospace" }}>retry</button>
            </div>
          )}
        </div>
      </div>

      {/* ══ FIXED OVERLAY UI (not affected by canvas transform) ══ */}

      {/* Top bar */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 10000, background: "rgba(248,250,252,0.92)", borderBottom: "1px solid #d1d9e0", backdropFilter: "blur(8px)", padding: "9px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 10, fontFamily: "monospace", textTransform: "uppercase", letterSpacing: 1.5, color: "#94a3b8" }}>FACEBOOK AD TESTING GROUPS</span>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {groups && <span style={{ fontSize: 10, fontFamily: "monospace", color: "#64748b" }}>{groups.length} groups · {totalGrouped} products</span>}
          {groups && (
            <button onClick={() => { setGroups(null); setShowSizeModal(true); }}
              style={{ background: "none", border: "1px solid #d1d9e0", borderRadius: 5, padding: "4px 12px", fontSize: 10, fontFamily: "monospace", color: "#64748b", cursor: "pointer" }}>
              REGROUP
            </button>
          )}
          <button onClick={onBack}
            style={{ background: "#1a2332", border: "none", borderRadius: 5, padding: "6px 14px", fontSize: 10, fontFamily: "monospace", color: "#fff", cursor: "pointer", letterSpacing: .4 }}>
            ← BACK TO BOARD
          </button>
        </div>
      </div>

      {/* ── Miro-style zoom and theme controls (bottom-right) ── */}
      <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 10000, display: "flex", flexDirection: "row", gap: 12, alignItems: "center" }}>

        {/* Theme Controls */}
        <div style={{ background: "rgba(255,255,255,0.95)", backdropFilter: "blur(6px)", border: "1px solid #d1d9e0", borderRadius: 10, boxShadow: "0 2px 12px rgba(0,0,0,0.1)", overflow: "hidden", display: "flex", flexDirection: "row" }}>
          <button onClick={() => setBgTheme('dots')} style={{ background: bgTheme === 'dots' ? "#e2e8f0" : "none", border: "none", padding: "8px 12px", cursor: "pointer", fontSize: 12, fontWeight: 700, color: "#1a2332" }} title="Dots">Dots</button>
          <button onClick={() => setBgTheme('grid')} style={{ background: bgTheme === 'grid' ? "#e2e8f0" : "none", border: "none", padding: "8px 12px", cursor: "pointer", fontSize: 12, fontWeight: 700, color: "#1a2332" }} title="Grid">Grid</button>
          <button onClick={() => setBgTheme('blueprint')} style={{ background: bgTheme === 'blueprint' ? "#2563eb" : "none", border: "none", padding: "8px 12px", cursor: "pointer", fontSize: 12, fontWeight: 700, color: bgTheme === 'blueprint' ? "#fff" : "#1a2332" }} title="Blueprint">Blue</button>
          <button onClick={() => setBgTheme('dark')} style={{ background: bgTheme === 'dark' ? "#1e293b" : "none", border: "none", padding: "8px 12px", cursor: "pointer", fontSize: 12, fontWeight: 700, color: bgTheme === 'dark' ? "#fff" : "#1a2332" }} title="Dark Mode">Dark</button>
        </div>

        {/* Fit to screen */}
        {groups && (
          <button onClick={fitToScreen}
            title="Fit to screen"
            style={{ width: 36, height: 36, borderRadius: 8, border: "1px solid #d1d9e0", background: "rgba(255,255,255,0.95)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 15, boxShadow: "0 2px 8px rgba(0,0,0,0.1)", color: "#1a2332", fontFamily: "monospace" }}>
            ⊡
          </button>
        )}
        <div style={{ background: "rgba(255,255,255,0.95)", backdropFilter: "blur(6px)", border: "1px solid #d1d9e0", borderRadius: 10, boxShadow: "0 2px 12px rgba(0,0,0,0.1)", overflow: "hidden", display: "flex", flexDirection: "row" }}>
          <button onClick={() => zoomBy(0.8)}
            style={{ width: 36, height: 36, border: "none", borderRight: "1px solid #e8ecf0", background: "transparent", fontSize: 18, cursor: "pointer", color: "#1a2332", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 300 }}>−</button>
          <div style={{ width: 44, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontFamily: "monospace", color: "#64748b", borderRight: "1px solid #e8ecf0" }}>
            {Math.round(zoom * 100)}%
          </div>
          <button onClick={() => zoomBy(1.2)}
            style={{ width: 36, height: 36, border: "none", background: "transparent", fontSize: 18, cursor: "pointer", color: "#1a2332", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 300 }}>+</button>
        </div>
        {/* Reset zoom */}
        <button onClick={() => { setZoom(1); setPan({ x: 0, y: 60 }); }}
          title="Reset zoom"
          style={{ width: 40, height: 36, borderRadius: 8, border: "1px solid #d1d9e0", background: "rgba(255,255,255,0.95)", backdropFilter: "blur(6px)", cursor: "pointer", fontSize: 10, fontFamily: "monospace", color: "#94a3b8", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
          100%
        </button>
      </div>

      {/* ── Visual Programming Skills Sidebar (Left) ── */}
      {groups && (
        <div style={{
          position: "fixed", top: 80, left: 20, bottom: 20, width: 300,
          background: "#fff", border: "1px solid #e2e8f0", zIndex: 9999, borderRadius: 20,
          boxShadow: "0 10px 40px rgba(0,0,0,0.08)", display: "flex", flexDirection: "column",
          overflow: "hidden"
        }}>
          {/* Sticky Header */}
          <div style={{ padding: "20px 20px 16px", background: "#ffffff", borderBottom: "1px solid #e2e8f0", zIndex: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg, #0ea5e9, #2563eb)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", boxShadow: "0 2px 8px rgba(14, 165, 233, 0.3)" }}>
                <DynamicIcon name="Sparkles" size={14} />
              </div>
              <div style={{ fontSize: 13, fontFamily: "monospace", fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.5, color: "#0f172a" }}>
                Skill Library
              </div>
            </div>

            <div style={{ position: "relative" }}>
              <div style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}>
                <DynamicIcon name="Search" size={14} />
              </div>
              <input
                type="text"
                placeholder="Search skills..."
                value={skillSearch}
                onChange={(e) => setSkillSearch(e.target.value)}
                style={{ width: "100%", padding: "10px 12px 10px 34px", background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 13, color: "#1e293b", outline: "none", transition: "all 0.2s" }}
                onFocus={(e) => { e.target.style.background = "#fff"; e.target.style.borderColor = "#3b82f6"; e.target.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)"; }}
                onBlur={(e) => { e.target.style.background = "#f1f5f9"; e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; }}
              />
            </div>
          </div>

          {/* Scrollable Content (Brainwave UI) */}
          <div style={{ padding: "0 20px 20px", overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: 16, paddingTop: 16 }}>
            {/* Products Previews */}
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData("productTableDrop", "true");
                  e.dataTransfer.effectAllowed = "copy";
                }}
                onClick={() => setExpandedCategories(prev => ({ ...prev, products_cat: prev.products_cat === undefined ? false : !prev.products_cat }))}
                style={{
                  display: "flex", alignItems: "center", padding: "10px 12px", borderRadius: 12,
                  cursor: "grab", transition: "all 0.2s ease",
                  background: (expandedCategories.products_cat !== false) ? "#f3f4f6" : "transparent",
                  color: (expandedCategories.products_cat !== false) ? "#111827" : "#4b5563"
                }}
              >
                <div style={{ width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", marginRight: 12, color: "#f59e0b" }}>
                  <DynamicIcon name="Package" size={16} />
                </div>
                <span style={{ fontSize: 14, fontWeight: 600, flex: 1 }}>Product Previews</span>
                <div style={{ background: "#ffffff", border: "1px solid #e5e7eb", borderRadius: 6, padding: "2px 6px", fontSize: 11, fontWeight: 600, color: "#6b7280", marginRight: 8 }}>
                  {products?.length || 0}
                </div>
                <div style={{ width: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", transition: "transform 0.2s", transform: (expandedCategories.products_cat !== false) ? "rotate(180deg)" : "none" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </div>
              </div>

              {(expandedCategories.products_cat !== false) && (
                <div style={{ position: "relative", paddingLeft: 23, marginTop: 4, display: "flex", flexDirection: "column", gap: 4 }}>
                  <div style={{ position: "absolute", left: 23, top: 0, bottom: 16, width: 1, background: "#e5e7eb" }} />
                  {products?.map((p, i) => (
                    <div key={`prod_${i}`}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData("productDrop", JSON.stringify(p));
                        e.dataTransfer.effectAllowed = "copy";
                      }}
                      style={{
                        position: "relative", display: "flex", alignItems: "center",
                        padding: "8px 12px 8px 16px", fontSize: 13, fontWeight: 500, color: "#6b7280",
                        borderRadius: 8, transition: "all 0.2s ease", marginLeft: 16,
                        background: "transparent"
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = "#111827"; e.currentTarget.style.background = "#f9fafb"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = "#6b7280"; e.currentTarget.style.background = "transparent"; }}
                    >
                      <div style={{ position: "absolute", left: -16, top: "50%", width: 16, height: 1, background: "#e5e7eb" }} />
                      <div style={{ display: "flex", alignItems: "center", gap: 10, width: "100%" }}>
                        {p.imageUrl || p.mainImage ? (
                          <div style={{ width: 24, height: 24, borderRadius: 4, backgroundImage: `url(${p.imageUrl || p.mainImage})`, backgroundSize: 'cover', backgroundPosition: 'center', border: "1px solid #e2e8f0" }} />
                        ) : (
                          <div style={{ color: "#f59e0b", display: "flex", alignItems: "center" }}><DynamicIcon name="Box" size={14} /></div>
                        )}
                        <span style={{ fontSize: 13, fontWeight: 600, flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div style={{ borderBottom: "1px dashed #e5e7eb", margin: "16px 0 8px 0" }} />
            </div>

            {Object.values(SKILL_CATEGORIES).map(category => {
              const categorySkills = Object.entries(SKILLS_DICT).filter(([_, info]) => {
                if (info.category !== category.id) return false;
                if (skillSearch && !info.label.toLowerCase().includes(skillSearch.toLowerCase()) && !info.desc.toLowerCase().includes(skillSearch.toLowerCase())) return false;
                return true;
              });

              if (categorySkills.length === 0) return null;

              const isExpanded = expandedCategories[category.id];

              return (
                <div key={category.id} style={{ display: "flex", flexDirection: "column" }}>
                  {/* Category Header */}
                  <div
                    onClick={() => setExpandedCategories(prev => ({ ...prev, [category.id]: !prev[category.id] }))}
                    style={{
                      display: "flex", alignItems: "center", padding: "10px 12px", borderRadius: 12,
                      cursor: "pointer", transition: "all 0.2s ease",
                      background: isExpanded ? "#f3f4f6" : "transparent",
                      color: isExpanded ? "#111827" : "#4b5563"
                    }}
                  >
                    <div style={{ width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", marginRight: 12, color: category.color }}>
                      <DynamicIcon name={category.icon} size={16} />
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 600, flex: 1 }}>
                      {category.name}
                    </span>
                    <div style={{ background: "#ffffff", border: "1px solid #e5e7eb", borderRadius: 6, padding: "2px 6px", fontSize: 11, fontWeight: 600, color: "#6b7280", marginRight: 8 }}>
                      {categorySkills.length}
                    </div>
                    <div style={{ width: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", transition: "transform 0.2s", transform: isExpanded ? "rotate(180deg)" : "none" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                    </div>
                  </div>

                  {/* Skills List (Tree structure) */}
                  {isExpanded && (
                    <div style={{ position: "relative", paddingLeft: 23, marginTop: 4, display: "flex", flexDirection: "column", gap: 4 }}>
                      <div style={{ position: "absolute", left: 23, top: 0, bottom: 16, width: 1, background: "#e5e7eb" }} />

                      {categorySkills.map(([key, info]) => (
                        <div key={key}
                          draggable
                          className="node-hover"
                          onDragStart={(e) => {
                            e.dataTransfer.setData("skillType", key);
                            e.dataTransfer.effectAllowed = "copy";
                          }}
                          style={{
                            position: "relative", display: "flex", alignItems: "center",
                            padding: "8px 12px 8px 16px", fontSize: 13, fontWeight: 500, color: "#6b7280",
                            borderRadius: 8, cursor: "grab", transition: "all 0.2s ease", marginLeft: 16,
                            background: "transparent"
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.color = "#111827"; e.currentTarget.style.background = "#f9fafb"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.color = "#6b7280"; e.currentTarget.style.background = "transparent"; }}
                        >
                          <div style={{ position: "absolute", left: -16, top: "50%", width: 16, height: 1, background: "#e5e7eb" }} />

                          <div style={{ display: "flex", alignItems: "center", gap: 10, width: "100%" }}>
                            <div style={{ color: category.color, display: "flex", alignItems: "center" }}>
                              <DynamicIcon name={info.icon} size={14} />
                            </div>
                            <span style={{ fontSize: 13, fontWeight: 600, fontFamily: "inherit", flex: 1 }}>{info.label}</span>

                            {/* Info tooltip icon */}
                            <div
                              onMouseEnter={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect();
                                setHoveredSkillTooltip({ info, y: rect.top + rect.height / 2 });
                              }}
                              onMouseLeave={() => setHoveredSkillTooltip(null)}
                              style={{ cursor: "help", display: "flex", alignItems: "center", justifyContent: "center", width: 20, height: 20, borderRadius: "50%", color: "#9ca3af", transition: "all 0.2s" }}
                              onMouseOver={(e) => { e.currentTarget.style.color = "#111827"; }}
                              onMouseOut={(e) => { e.currentTarget.style.color = "#9ca3af"; }}
                            >
                              <DynamicIcon name="Info" size={12} />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <div style={{ borderBottom: "1px dashed #e5e7eb", margin: "16px 0 8px 0" }} />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Custom Pop-out Tooltip ── */}
      {hoveredSkillTooltip && (
        <div style={{
          position: 'fixed',
          left: 310,
          top: Math.min(Math.max(hoveredSkillTooltip.y, 80), window.innerHeight - 80), // keep on screen
          transform: 'translateY(-50%)',
          width: 320,
          background: '#1e293b',
          border: '1px solid #334155',
          borderRadius: 12,
          padding: 16,
          boxShadow: '0 12px 30px rgba(0,0,0,0.25), 0 4px 12px rgba(0,0,0,0.1)',
          zIndex: 10001,
          pointerEvents: 'none'
        }}>
          {/* Arrow pointing to sidebar */}
          <div style={{ position: 'absolute', left: -6, top: '50%', transform: 'translateY(-50%) rotate(45deg)', width: 12, height: 12, background: '#1e293b', borderLeft: '1px solid #334155', borderBottom: '1px solid #334155' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, color: '#f8fafc', fontSize: 14, fontWeight: 800 }}>
            <DynamicIcon name={hoveredSkillTooltip.info.icon} size={16} color="#38bdf8" />
            {hoveredSkillTooltip.info.label}
          </div>

          <div style={{ fontSize: 12.5, color: '#cbd5e1', lineHeight: 1.55 }}>
            {hoveredSkillTooltip.info.desc}
          </div>

          <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px dashed #334155', display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>
            <DynamicIcon name="MousePointer2" size={12} color="#64748b" />
            Drag & Drop to add to canvas
          </div>
        </div>
      )}

      {/* ── Modal (always on top) ── */}
      {showSizeModal && <GroupSizeModal productCount={realProducts.length} onConfirm={handleGenerate} onClose={onBack} aiConfig={aiConfig} />}

      {/* ── Drawing Toolbar ── */}
      <div style={{ position: "fixed", right: 20, top: "50%", transform: "translateY(-50%)", background: "#1e293b", padding: "16px 10px", borderRadius: 100, display: "flex", flexDirection: "column", alignItems: "center", gap: 16, zIndex: 9999, boxShadow: "0 10px 25px rgba(0,0,0,0.2)" }}>
        {/* Modes */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <button onClick={() => setMode(null)} title="Select & Pan" style={{ background: drawingMode === null ? "#3b82f6" : "transparent", color: drawingMode === null ? "#fff" : "#94a3b8", border: "none", width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><DynamicIcon name="MousePointer2" size={18} /></button>
          <div style={{ width: 20, height: 1, background: "#334155" }} />
          <button onClick={() => setMode('rect')} title="Draw Rectangle" style={{ background: drawingMode === 'rect' ? "#3b82f6" : "transparent", color: drawingMode === 'rect' ? "#fff" : "#94a3b8", border: "none", width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><DynamicIcon name="Square" size={18} /></button>
          <button onClick={() => setMode('circle')} title="Draw Circle" style={{ background: drawingMode === 'circle' ? "#3b82f6" : "transparent", color: drawingMode === 'circle' ? "#fff" : "#94a3b8", border: "none", width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><DynamicIcon name="Circle" size={18} /></button>
        </div>
        <div style={{ width: 20, height: 1, background: "#334155" }} />
        {/* Colors */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          {["#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#94a3b8"].map(c => (
            <button key={c} onClick={() => setColor(c)} style={{ background: c, width: 24, height: 24, borderRadius: "50%", border: currentColor === c ? "2px solid #fff" : "2px solid transparent", cursor: "pointer", boxShadow: currentColor === c ? "0 0 0 2px #3b82f6" : "none" }} />
          ))}
        </div>
        <div style={{ width: 20, height: 1, background: "#334155" }} />
        <button onClick={() => setDrawnShapes([])} style={{ background: "transparent", color: "#ef4444", border: "none", padding: "6px 0", fontSize: 10, fontWeight: 700, cursor: "pointer", fontFamily: "monospace" }}>CLEAR</button>
      </div>

      {/* ── Loading Overlay ── */}
      {loading && (
        <div style={{ position: "fixed", inset: 0, zIndex: 10001, background: "rgba(238,241,245,0.7)", backdropFilter: "blur(4px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", border: "3px solid #d1d9e0", borderTopColor: "#1a2332", animation: "spin 1s linear infinite" }} />
          <div style={{ fontSize: 12, fontFamily: "monospace", textTransform: "uppercase", letterSpacing: 1.5, color: "#64748b" }}>AI is analyzing products...</div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}
    </>
  );
}
