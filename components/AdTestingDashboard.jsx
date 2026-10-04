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
import GrowthLoopOrgChart from "./GrowthLoopOrgChart";
import AdSetDataTable from "./AdSetDataTable";
import AdKpiAnalysis from "./AdKpiAnalysis";
import PerformanceEngine from "./PerformanceEngine";
import BreakdownEngine from "./BreakdownEngine";
import BidCapEngine from "./BidCapEngine";
import ScalingSystem from "./ScalingSystem";
import MetaScalingSystem from "./MetaScalingSystem";
import UGCGenerator from "./UGCGenerator";
import CinematicStoryboard from "./CinematicStoryboard";
import WinningDigitalProductTable from "./WinningDigitalProductTable";
import MetaDecisionFlow from "./MetaDecisionFlow";
import ImageAdConcepts from "./ImageAdConcepts";
import FunnelAnalysis from "./FunnelAnalysis";
import { MasterDzSections, MasterDzSelector, SECTIONS as DZ_SECTIONS } from "./MasterDzSections";
import { SECTION_PROMPTS } from "@/lib/canvas/prompts/master_prompt_dz_sections";
import { buildLiquidSectionPrompt, buildLiquidAssetsPrompt, LIQUID_ANALYSIS_SCHEMA, LIQUID_ASSETS_SCHEMA } from "@/lib/canvas/prompts/liquid_prompt";
import { buildLandingStrategyPrompt, buildLandingSectionPrompt, buildLandingAuditPrompt, buildLandingOptimizePrompt, LANDING_STRATEGY_SCHEMA, LANDING_AUDIT_SCHEMA, LANDING_OPTIMIZE_SCHEMA, LANDING_MANDATORY_SECTIONS } from "@/lib/canvas/prompts/landing_prompt";
import LandingPageBuilder from "./LandingPageBuilder";
import { MethodSelector, MethodLibraryResults } from "./MethodLibrary";
import { METHOD_CHAPTERS, METHOD_ANALYSIS_MODE, buildMethodPlaybookPrompt, buildMethodChartPrompt, buildMessageAnalysisPrompt, METHOD_CHART_SCHEMA, getChapter } from "@/lib/canvas/prompts/methods_prompt";
import { ADVANCED_PRODUCT_SKILLS, ADVANCED_PRODUCT_SCHEMA_STRINGS, ADVANCED_PRODUCT_WEB_DEFAULT, ADVANCED_PRODUCT_MULTI_NODE } from "@/lib/canvas/prompts/advancedProductPrompts";
import { zipDownloadUrl } from "@/lib/liquidZip";
import { AdCreativeAnalyzerView } from "./renderers";
import FullFunnelViewer from "./FullFunnelViewer";
import { FunnelStageSelector, FUNNEL_STAGES } from "./FunnelStageSelector";
import StageIntelligenceViewer from "./StageIntelligenceViewer";

// [E_COMPANY_PLAN_SKILLS] All company-plan skill types that share the same result schema + renderer.
const COMPANY_PLAN_SKILLS = ['llc_company', 'ltd_company', 'hong_kong_company', 'uae_company', 'estonia_company'];

const FB_ADS_DEFAULT_METHODS = [
  { id: "abo_testing", label: "Classic ABO Testing", text: "Create 1 Campaign (Sales Objective). Create 3-5 Ad Sets using ABO (Adset Budget Optimization) at $10-$20/day each. Use Broad targeting or 1 distinct interest per ad set. Inside each ad set, test 2-3 different ad creatives." },
  { id: "cbo_broad", label: "CBO Broad Testing", text: "Create 1 CBO (Campaign Budget Optimization) Campaign at $50/day. Create 3 Ad Sets with completely Broad targeting (No interests, just age/gender/location). Use dynamic creative optimization (DCO) in each ad set with different angles." }
];

// [F_skillToText] Builds a plain-text copy of a skill's RESULT for the Copy button.
const skillToText = (skill) => {
  const r = skill && skill.result;
  if (!r) return "";
  if (skill.type === 'landing_page_builder') {
    return (Array.isArray(r.sections) ? r.sections.map(s => s.html || "").filter(Boolean) : []).join("\n\n");
  }
  if (skill.type === 'liquid_prompt') {
    return (Array.isArray(r.files) ? r.files.map(f => `=== ${f.path} ===\n${f.content || ""}`) : []).join("\n\n");
  }
  if (skill.type === 'master_dz_landing_page_strategy') {
    return (Array.isArray(r.sections) ? r.sections.map(s => `## ${s.title || s.key}\n${typeof s.content === 'string' ? s.content : JSON.stringify(s.content, null, 2)}`) : []).join("\n\n");
  }
  if (METHOD_CHAPTERS[skill.type]) {
    return (Array.isArray(r.methods) ? r.methods.map(m => `# ${m.title}\n\n${m.text || (m.chart ? JSON.stringify(m.chart, null, 2) : "")}`) : []).join("\n\n---\n\n");
  }
  if (typeof r === 'string') return r;
  if (r.summary) {
    const parts = [String(r.summary)];
    if (Array.isArray(r.keyPoints)) parts.push("\nKey Points:\n- " + r.keyPoints.join("\n- "));
    if (Array.isArray(r.recommendations)) parts.push("\nRecommendations:\n- " + r.recommendations.join("\n- "));
    return parts.join("\n");
  }
  return typeof r === 'object' ? JSON.stringify(r, null, 2) : String(r);
};

// [F_skillToCode] Builds the RAW CODE copy (HTML for builders, JSON otherwise).
const skillToCode = (skill) => {
  const r = skill && skill.result;
  if (!r) return "";
  if (skill.type === 'landing_page_builder' && Array.isArray(r.sections)) {
    return r.sections.map(s => s.html || "").filter(Boolean).join("\n\n");
  }
  if (skill.type === 'liquid_prompt' && Array.isArray(r.files)) {
    return r.files.map(f => `=== ${f.path} ===\n${f.content || ""}`).join("\n\n");
  }
  return typeof r === 'object' ? JSON.stringify(r, null, 2) : String(r);
};

// [F_skillToJson] Returns the RAW JSON of a skill result (for the COPY JSON button).
const skillToJson = (skill) => {
  const r = skill && skill.result;
  if (r == null) return "";
  return typeof r === "string" ? r : JSON.stringify(r, null, 2);
};

// [F_copyText] Clipboard write with fallback for older browsers.
const copyText = async (text) => {
  try {
    if (navigator.clipboard && window.isSecureContext) { await navigator.clipboard.writeText(text || ""); return true; }
  } catch (e) { /* fall through */ }
  try {
    const ta = document.createElement('textarea');
    ta.value = text || "";
    ta.style.position = "fixed"; ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch (e) { return false; }
};

/* ════════════════════════════════════════
   GLOBAL HELPERS & SMALL COMPONENTS
   ════════════════════════════════════════ */

// [E_DynamicIcon] Renders a Lucide icon by name. Fallback: a Circle icon.
const DynamicIcon = ({ name, size = 16, color = "currentColor" }) => {
  const IconComponent = LucideIcons[name] || LucideIcons.Circle;
  return <IconComponent size={size} color={color} strokeWidth={2.5} />;
};

/* ───────────────────────────────────────────
   GROUPING LOGIC
─────────────────────────────────────────── */
// [E_NICHE_ICONS] Maps a niche keyword to a Lucide icon name (used for the group card icon).
const NICHE_ICONS = {
  tech: "Laptop", electronic: "Zap", gadget: "Wrench", office: "Briefcase", home: "Home", kitchen: "Utensils",
  beauty: "Sparkles", fashion: "Shirt", fitness: "Dumbbell", sport: "Trophy", baby: "Baby", pet: "Dog",
  outdoor: "Tent", travel: "Plane", car: "Car", jewelry: "Gem", phone: "Smartphone", gaming: "Gamepad2",
  health: "Heart", food: "Pizza", plant: "Leaf", decor: "Paintbrush", tool: "Hammer", default: "Package",
};
// [E_getNicheIcon] Returns the Lucide icon name for a product's text (defaults to "Package").
function getNicheIcon(text = "") {
  const t = text.toLowerCase();
  for (const [k, e] of Object.entries(NICHE_ICONS)) if (k !== "default" && t.includes(k)) return e;
  return NICHE_ICONS.default;
}
// [E_getNicheKey] Builds a normalized "category|subcategory|niche" key used for grouping.
function getNicheKey(p) {
  return [p.category || "", p.subcategory || "", p.niche || ""].map(s => s.toLowerCase().trim()).filter(Boolean).join("|") || "general";
}
// [E_nicheDistance] Returns 0 if two products share overlapping niche keywords, else 1.
function nicheDistance(a, b) {
  const ka = getNicheKey(a).split("|"), kb = getNicheKey(b).split("|");
  for (const t of ka) if (kb.some(k => k.includes(t) || t.includes(k))) return 0;
  return 1;
}
// [E_buildGroups] Sorts products by score and groups them by niche into cards.
// (NOTE: this local builder is currently unused — groups come from the AI API instead.)
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

// [E_DOT] Priority colors/labels (HIGH=red, MEDIUM=amber, LOW=indigo).
const DOT = { HIGH: { c: "#ef4444", l: "HIGH" }, MEDIUM: { c: "#f59e0b", l: "MEDIUM" }, LOW: { c: "#6366f1", l: "LOW" } };

// Modal removed.

/* ── Product node ── */
// [E_ProductNode] Small product row inside a Group card (image, name, score, price).
// Has a draggable connection port on the left (data-product-id).
const ProductNode = React.memo(function ProductNode({ p, onPortMount }) {
  const score = p.algeria?.overallScore ?? p.opportunity?.overallScore ?? null;
  const dzdInfo = getDZD(p);
  const verdict = getVerdict(p);
  const img = p.mainImage?.url ?? (typeof p.mainImage === "string" ? p.mainImage : null);
  return (
    <div style={{ position: "relative", background: "#fafbfc", border: "1px solid #d1d9e0", borderRadius: 10, padding: "8px 10px", display: "flex", gap: 8, alignItems: "center", marginBottom: 5, userSelect: "none" }}>
      {/* ══ [E_ProductNode_Port] Draggable connection port on the left (blue dot). */}
      {/* Product Port - drag from here to a skill card to connect */}
      <div
        ref={el => onPortMount && onPortMount(el, p.id)}
        className="port-in port-out" data-product-id={p.id}
        style={{ position: "absolute", left: -7, top: "50%", marginTop: -7, width: 14, height: 14, borderRadius: "50%", background: "#dbeafe", border: "2px solid #3b82f6", zIndex: 10, cursor: "crosshair", transition: "transform 0.15s, border-color 0.15s, background 0.15s" }}
        onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.6)"; e.currentTarget.style.borderColor = "#6366f1"; e.currentTarget.style.background = "#ede9fe"; }}
        onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.borderColor = "#3b82f6"; e.currentTarget.style.background = "#dbeafe"; }}
      />
      {/* ══ [E_ProductNode_Image] Product thumbnail (36px). */}
      <div style={{ width: 36, height: 36, borderRadius: 7, background: "#e8ecf0", overflow: "hidden", flexShrink: 0, border: "1px solid #d1d9e0" }}>
        {img ? <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, opacity: .3 }}>📦</div>}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#1a2332", lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name || "Unnamed"}</div>
        <div style={{ fontSize: 9, color: "#94a3b8", fontFamily: "monospace", marginTop: 2 }}>{(p.category || "").toLowerCase()}</div>
      </div>
      {/* ══ [E_ProductNode_Score] Priority score badge (green/amber/red). */}
      {score != null && <span style={{ fontSize: 10, fontWeight: 800, color: score >= 70 ? "#16a34a" : score >= 50 ? "#d97706" : "#dc2626", fontFamily: "monospace", flexShrink: 0 }}>{score}</span>}
      {/* ══ [E_ProductNode_Price] Price in DZD badge. */}
      <span style={{ fontSize: 9, color: "#94a3b8", background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: 4, padding: "1px 5px", fontFamily: "monospace", flexShrink: 0 }}>{dzdInfo ? fDZD(dzdInfo.value) : "—"}</span>
    </div>
  );
});

/* ── Group column card ── */
// [E_GroupCard] The main GROUP card (niche title, priority tag, FB interests, product list, strategy toggle).
const GroupCard = React.memo(function GroupCard({ group, isExpanded, onToggle, onPortMount }) {
  const dot = DOT[group.testingPriority] || DOT.MEDIUM;
  return (
    <div style={{ width: 340, flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", userSelect: "none" }}>
      {/* vertical line no longer needed on top because SVG handles it */}

      {/* header */}
      <div className="group-header node-hover" style={{ width: "100%", background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 16, padding: "20px", textAlign: "left", boxShadow: "0 10px 30px -10px rgba(0,0,0,0.1)", cursor: "grab", display: "flex", flexDirection: "column", gap: 12 }}>

        {/* ══ [E_GroupCard_Header] Group card header: icon + "GROUP n" label + priority badge. */}
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

        {/* ══ [E_GroupCard_TitleAud] Group niche title + target audience line. */}
        {/* Title & Audience */}
        <div>
          <div style={{ fontSize: 15, fontWeight: 900, color: "#0f172a", marginBottom: 6, letterSpacing: "-0.01em" }}>
            {(group.nicheName || "Unknown Niche").toUpperCase()}
          </div>
          <div style={{ fontSize: 11, color: "#64748b", lineHeight: 1.5, fontWeight: 500 }}>
            {group.targetAudience || "No audience specified"}
          </div>
        </div>

        {/* ══ [E_GroupCard_PriorityReason] Info strip explaining why this priority was assigned. */}
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
      {/* ══ [E_GroupCard_Interests] "FB INTERESTS" chips box. */}
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
      {/* ══ [E_GroupCard_Products] List of ProductNode rows inside the group card. */}
      {/* products */}
      <div style={{ width: "100%" }}>
        {group.products.map((p, i) => <ProductNode key={p.id || i} p={p} onPortMount={onPortMount} />)}
      </div>
      {/* ══ [E_GroupCard_Toggle] Dashed button to expand/hide the strategy details box. */}
      {/* strategy toggle */}
      <button onClick={onToggle}
        style={{ marginTop: 6, width: "100%", background: "none", border: "1px dashed #c8d3db", borderRadius: 7, padding: "7px 0", fontSize: 10, color: "#94a3b8", fontFamily: "monospace", cursor: "pointer", letterSpacing: .3 }}
      >{isExpanded ? "▲ hide" : "▼ strategy"}</button>
      {/* ══ [E_GroupCard_StrategyBox] Expanded strategy: budget/duration, winner criteria, testing strategy. */}
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
// [E_AdSetCard] Card for a single Facebook Ad Set (title, targeting, strategy, creatives).
const AdSetCard = React.memo(function AdSetCard({ adSet, groupId, adSetId }) {
  const rawName = adSet.name.replace(/^Ad Set \d+\s*[-:]\s*/i, '');
  const titleMatch = rawName.split(/—|\(|⚠️/);
  const cleanTitle = titleMatch[0].trim();
  const strategyText = rawName.substring(cleanTitle.length).replace(/^[—\(\s⚠️\-]+/, '').replace(/\)$/, '').trim();

  return (
    <div className="node-hover" style={{ width: 320, background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 16, padding: "20px", boxShadow: "0 10px 30px -10px rgba(0,0,0,0.1)", display: "flex", flexDirection: "column", gap: 16 }}>
      {/* ══ [E_AdSetCard_Header] Header: green "AD SET n" label + budget chip. */}
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 10px rgba(16, 185, 129, 0.4)" }} />
          <span style={{ fontSize: 11, fontWeight: 800, color: "#10b981", letterSpacing: 0.5 }}>AD SET {adSetId + 1}</span>
        </div>
        <div style={{ background: "#f1f5f9", color: "#64748b", fontSize: 10, fontWeight: 700, padding: "4px 8px", borderRadius: 6 }}>{adSet.budget}</div>
      </div>

      {/* ══ [E_AdSetCard_Title] Ad set title (clean name without prefix). */}
      {/* Title */}
      <div style={{ fontSize: 14, fontWeight: 800, color: "#0f172a", lineHeight: 1.5 }}>
        {cleanTitle}
      </div>

      {/* ══ [E_AdSetCard_Targeting] TARGETING box. */}
      {/* Details Box */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ background: "#f8fafc", borderRadius: 12, padding: "12px", border: "1px solid #f1f5f9" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>TARGETING</div>
          <div style={{ fontSize: 12, color: "#334155", fontWeight: 500, lineHeight: 1.5 }}>{adSet.targeting}</div>
        </div>

        {/* ══ [E_AdSetCard_Strategy] STRATEGY & PARAMETERS box (amber, shown when present). */}
        {strategyText && (
          <div style={{ background: "#fffbeb", borderRadius: 12, padding: "12px", border: "1px solid #fde68a" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#d97706", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>STRATEGY & PARAMETERS</div>
            <div style={{ fontSize: 11, color: "#92400e", fontWeight: 500, lineHeight: 1.6 }}>{strategyText}</div>
          </div>
        )}
      </div>

      {/* ══ [E_AdSetCard_Creatives] CREATIVES list (thumbnail icons + ad names). */}
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
// [E_PROVIDER_LABELS] Human-readable names for AI providers shown in the modal badge.
const PROVIDER_LABELS = {
  openai: "OpenAI", anthropic: "Anthropic", gemini: "Google Gemini",
  openrouter: "OpenRouter", nvidia: "NVIDIA", custom: "Custom API",
};

// [E_GroupSizeModal] Popup shown on load: choose products-per-group before creating AI groups.
// Shows AI connection status (has API key + provider + model).
function GroupSizeModal({ productCount, onConfirm, onClose, aiConfig }) {
  const [size, setSize] = useState(3);
  const hasKey = aiConfig?.hasApiKey;
  const provider = PROVIDER_LABELS[aiConfig?.activeProvider] || aiConfig?.activeProvider || "Unknown";
  const model = aiConfig?.model || "—";
  return (
    <div onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position: "fixed", inset: 0, zIndex: 10000, background: "rgba(15,20,30,0.45)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 420, border: "1.5px solid #d1d9e0", boxShadow: "0 24px 60px rgba(0,0,0,0.14)", overflow: "hidden" }}>
        {/* ══ [E_Modal_Header] Modal header: "AD TESTING METHOD", title & AI status badge. */}
        <div style={{ padding: "22px 26px", borderBottom: "1px solid #e8ecf0", background: "#f8fafc" }}>
          <div style={{ fontSize: 10, fontFamily: "monospace", textTransform: "uppercase", letterSpacing: 1.5, color: "#94a3b8", marginBottom: 8 }}>AD TESTING METHOD</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#1a2332", marginBottom: 10 }}>🎯 Facebook Ad Groups</div>

          {/* ══ [E_Modal_AiBadge] AI connection status badge (green CONNECTED / red NO API KEY). */}
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
          {/* ══ [E_Modal_SizePicker] "Products per group" size selector buttons (2/3/4/5). */}
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
          {/* ══ [E_Modal_Estimate] Estimated groups/group-size calculation line. */}
          <div style={{ background: "#f8fafc", border: "1px solid #e8ecf0", borderRadius: 7, padding: "9px 13px", marginBottom: 18, fontFamily: "monospace", fontSize: 11, color: "#475569" }}>
            → ~{Math.ceil(productCount / size)} groups · {size} products each
          </div>
          {/* ══ [E_Modal_Actions] Cancel / CREATE GROUPS buttons. */}
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

// [E_createDefaultGroups] Fallback: builds simple local groups when no AI grouping happens yet.
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

/* ── JSON → clean text preview ── */
// [F_labelize] "camelCase" / "snake_case" keys → "Camel Case" readable labels.
function labelize(key) {
  const spaced = String(key).replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/[_]+/g, " ").trim();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

// [F_keyHue] Deterministic hue (0-360) for a key so each field highlight is stable.
function keyHue(key) {
  let h = 0;
  for (const c of String(key)) h = (h * 31 + c.charCodeAt(0)) % 360;
  return h;
}

// [E_PlainBlock] Article-style paragraph (max-width 40ch, theme ink color).
const PlainBlock = ({ children, style }) => (
  <div className="brk" style={style}>{children}</div>
);

// [E_PlainHighlight] <mark> wrapper using existing data-author + --hue convention.
const PlainHighlight = ({ label, hue }) => (
  <mark data-author="AI" style={{ ["--hue"]: hue }}>{label}</mark>
);

// [E_PlainList] Ordered/list rendering for arrays of primitives.
const PlainList = ({ items, prefix }) => (
  <ul>
    {items.map((item, i) => (
      <li key={i}>{prefix ? `${prefix}${i + 1}. ` : ""}{item}</li>
    ))}
  </ul>
);

// [F_renderPlainValue] Recursively renders any JSON value as real paragraphs/list items.
function renderPlainValue(value) {
  if (value === null || value === undefined) return <PlainBlock>—</PlainBlock>;
  if (Array.isArray(value)) {
    if (value.length === 0) return <PlainBlock>None.</PlainBlock>;
    const allObjects = value.every(v => v && typeof v === "object");
    if (allObjects) {
      return (
        <>
          {value.map((item, i) => (
            <PlainBlock key={i} style={{ marginLeft: "0.95em" }}>
              <p style={{ fontWeight: 700, margin: "0 0 .35em" }}>{i + 1}.</p>
              {renderPlainValue(item)}
            </PlainBlock>
          ))}
        </>
      );
    }
    return <PlainBlock><PlainList items={value} /></PlainBlock>;
  }
  if (typeof value === "object") {
    return (
      <>
        {Object.entries(value).map(([k, v]) => {
          if (v && typeof v === "object") {
            return (
              <PlainBlock key={k}>
                <p style={{ margin: "0 0 .35em", fontWeight: 650 }}><PlainHighlight hue={keyHue(k)} label={`${labelize(k)}:`} /></p>
                <div style={{ marginLeft: "0.95em" }}>{renderPlainValue(v)}</div>
              </PlainBlock>
            );
          }
          return (
            <PlainBlock key={k}>
              <p><PlainHighlight hue={keyHue(k)} label={`${labelize(k)}:`} />{" "}{String(v)}</p>
            </PlainBlock>
          );
        })}
      </>
    );
  }
  const text = String(value);
  return <PlainBlock style={text.includes("\n") ? { whiteSpace: "pre-wrap" } : undefined}>{text}</PlainBlock>;
}

// [E_TextPreviewCard] Renders a result as clean article text — matches page typography, no code block.
const TextPreviewCard = ({ data }) => {
  if (data?.summary) {
    return <StageIntelligenceViewer data={data} skillLabel="Stage Intelligence Text Preview" />;
  }
  return (
    <div className="plain-card">
      <p style={{ fontSize: "0.8rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--muted)", margin: "0 0 1em" }}>Clean Text Preview</p>
      {renderPlainValue(data)}
    </div>
  );
};

/* ── Liquid Prompt (HTML → Shopify) result renderer ── */
// [E_LiquidPromptCard] LIVE conversion progress + generated files list + Download ZIP button for the liquid_prompt skill.
const LIQUID_STATE_ICON = { running: "Loader2", done: "CheckCircle", error: "XCircle", pending: "Circle" };
const LIQUID_STATE_COLOR = { running: "#3b82f6", done: "#10b981", error: "#ef4444", pending: "#94a3b8" };

const PRODUCT_FACT_KEYS = {
  productName: "Product name", product_name: "Product name", product_title: "Product name", name: "Name", title: "Title",
  product: "Product", product_type: "Product type", category: "Category", niche: "Niche", micro_niche: "Micro niche",
  description: "Description", product_description: "Description", features: "Features", benefits: "Benefits",
  unique_features: "Unique features", problem_solved: "Problem solved", use_cases: "Use cases",
  target_audience: "Target audience", customer_persona: "Persona", buyer_persona: "Persona", demographics: "Demographics",
  pain_points: "Pain points", customer_pain_points: "Pain points", desires: "Desires", customer_desires: "Desires",
  objections: "Objections", buying_triggers: "Buying triggers", emotional_triggers: "Emotional triggers",
  product_awareness: "Product awareness", offer: "Offer", price: "Price", competitors: "Competitors",
  marketing_angles: "Marketing angles", winning_angles: "Winning angles", winning_hooks: "Winning hooks",
  costPrice: "Cost price", retailPrice: "Selling price", wholesalePrice: "Wholesale price",
  competitorPrice: "Competitor price", margin: "Margin", overallScore: "Overall score"
};

function extractProductFacts(outputs) {
  const seen = new Set();
  const found = [];
  const walk = (val, depth) => {
    if (!val || depth > 6 || found.length > 120) return;
    if (Array.isArray(val)) { val.forEach((v) => walk(v, depth + 1)); return; }
    if (val && typeof val === "object") {
      for (const [k, v] of Object.entries(val)) {
        const label = PRODUCT_FACT_KEYS[k];
        if (label && v != null && typeof v !== "object" && String(v).trim()) {
          if (!seen.has(k)) {
            seen.add(k);
            found.push(`${label}: ${String(v).trim().slice(0, 300)}`);
          }
        } else if (v && typeof v === "object") {
          walk(v, depth + 1);
        }
      }
    }
  };
  Object.values(outputs).forEach((o) => walk(o, 0));
  return found.join("\n");
}

const LiquidPromptCard = ({ data, running }) => {
  if (!data) return null;
  const progress = data.progress || [];
  const files = data.files || [];
  const isRunning = !!running;
  const doneCount = progress.filter(p => p.state === 'done').length;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: 0, overflowWrap: "anywhere" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#eef6ff", border: "1px solid #bfdbfe", borderRadius: 12, padding: "12px 14px" }}>
        <DynamicIcon name="FileCode2" size={20} color="#2563eb" />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: "#1e3a8a" }}>HTML → Shopify Liquid Theme</div>
          <div style={{ fontSize: 11, color: "#1d4ed8", fontWeight: 600 }}>
            {isRunning ? `Converting… ${doneCount}/${progress.length} steps done` : `${files.length} files generated · ${doneCount}/${progress.length} steps done`}
          </div>
        </div>
        {isRunning && <DynamicIcon name="Loader2" size={18} color="#2563eb" />}
      </div>

      {data.zipUrl && (
        <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 12, padding: "12px 14px" }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: "#15803d", textTransform: "uppercase", letterSpacing: 0.7, marginBottom: 8 }}>THEME PACKAGE READY</div>
          <a href={data.zipUrl} download={data.zipName || "shopify-liquid-theme.zip"} style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#15803d", color: "#fff", border: "none", borderRadius: 8, padding: "9px 16px", fontSize: 12, fontWeight: 800, cursor: "pointer", textDecoration: "none" }}>
            <DynamicIcon name="Download" size={14} /> DOWNLOAD {data.zipName || "shopify-liquid-theme.zip"}
          </a>
          <div style={{ fontSize: 10.5, color: "#166534", lineHeight: 1.6, marginTop: 8 }}>
            Upload to Shopify → Online Store → Themes → Upload theme. Then compile Tailwind (npm run build) to generate assets/tailwind.css.
          </div>
        </div>
      )}

      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, overflow: "hidden" }}>
        <div style={{ padding: "10px 14px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0", fontSize: 11, fontWeight: 800, color: "#2563eb", textTransform: "uppercase", letterSpacing: 0.7 }}>
          LIVE CONVERSION PROGRESS
        </div>
        <div style={{ maxHeight: 300, overflowY: "auto", padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
          {progress.length === 0 && <div style={{ fontSize: 11, color: "#94a3b8" }}>Waiting…</div>}
          {progress.map((p, idx) => {
            const c = LIQUID_STATE_COLOR[p.state] || "#94a3b8";
            return (
              <div key={idx} style={{ borderLeft: `3px solid ${c}`, background: p.state === 'error' ? "#fef2f2" : p.state === 'done' ? "#f8fafc" : "#eff6ff", borderRadius: 6, padding: "8px 10px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, fontWeight: 700, color: p.state === 'error' ? "#b91c1c" : "#334155" }}>
                  <DynamicIcon name={LIQUID_STATE_ICON[p.state] || "Circle"} size={12} color={c} />
                  <span style={{ flex: 1 }}>{p.label}</span>
                </div>
                {p.detail && p.state === 'done' && (
                  <div style={{ marginTop: 6, background: "#1e293b", color: "#a5b4fc", fontFamily: "monospace", fontSize: 10.5, whiteSpace: "pre-wrap", borderRadius: 6, padding: "8px 10px", maxHeight: 180, overflowY: "auto", direction: "ltr", textAlign: "left" }}>{p.detail}</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, overflow: "hidden" }}>
        <div style={{ padding: "10px 14px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0", fontSize: 11, fontWeight: 800, color: "#15803d", textTransform: "uppercase", letterSpacing: 0.7 }}>
          GENERATED FILES ({files.length})
        </div>
        <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 5 }}>
          {files.length === 0 && <div style={{ fontSize: 11, color: "#94a3b8" }}>No files yet — section files appear here live as they finish converting.</div>}
          {files.map((f, idx) => (
            <div key={idx} style={{ display: "flex", alignItems: "center", gap: 8, background: f.path.startsWith("sections/") ? "#fffbeb" : "#f0fdf4", border: "1px solid #f1f5f9", borderRadius: 6, padding: "6px 10px", fontSize: 11.5 }}>
              <DynamicIcon name={f.path.startsWith("sections/") ? "LayoutTemplate" : "FileCode"} size={13} color={f.path.startsWith("sections/") ? "#d97706" : "#15803d"} />
              <span style={{ fontFamily: "monospace", color: "#334155", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", direction: "ltr", textAlign: "left" }}>{f.path}</span>
              <span style={{ fontSize: 10, color: "#94a3b8" }}>{f.size ? Math.round(f.size / 102.4) / 10 + " KB" : "—"}</span>
              <DynamicIcon name="CheckCircle" size={13} color="#10b981" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ── LLC Company result renderer ── */
// [E_CompanyPlanCard] Pretty result view for ALL company-plan skills (LLC, LTD UK, Hong Kong, UAE, Estonia): formation, tax, documents, where to apply, banks, Q&A.
const CompanyPlanCard = ({ data }) => {
  if (!data) return null;
  const row = (label, value) => (
    <div style={{ padding: "10px 0", borderBottom: "1px solid #eef2f5" }}>
      <div style={{ fontSize: 10, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.7, marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 12.5, color: "#334155", lineHeight: 1.6 }}>{value}</div>
    </div>
  );
  const stepBlock = (title, subtitle) => (
    <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: "8px 12px" }}>
      <div style={{ fontSize: 10, fontWeight: 800, color: "#0d9488", textTransform: "uppercase", letterSpacing: 0.7 }}>{title}</div>
      {subtitle && <div style={{ fontSize: 12, color: "#475569", lineHeight: 1.5, marginTop: 3 }}>{subtitle}</div>}
    </div>
  );
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0, overflowWrap: "anywhere" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, background: "#f0fdfa", border: "1px solid #99f6e4", borderRadius: 12, padding: "14px 16px" }}>
        <DynamicIcon name="Building2" size={22} color="#0d9488" />
        <div>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#134e4a" }}>{data.companyName || "LLC Company"}</div>
          <div style={{ fontSize: 11, color: "#0f766e", fontWeight: 600 }}>Company Formation · Tax · Documents · Where to Apply</div>
        </div>
      </div>

      {data.overview && (
        <div style={{ fontSize: 13, color: "#334155", lineHeight: 1.7, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "14px 16px" }}>{data.overview}</div>
      )}

      {data.whenToCreate && (
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: "#0d9488", textTransform: "uppercase", letterSpacing: 0.8, display: "flex", alignItems: "center", gap: 6 }}>
            <DynamicIcon name="CalendarClock" size={14} /> WHEN TO CREATE
          </div>
          {stepBlock("Timing", data.whenToCreate.timing)}
          {stepBlock("Duration", data.whenToCreate.duration)}
          {data.whenToCreate.ifYouWait && stepBlock("If you wait", data.whenToCreate.ifYouWait)}
        </div>
      )}

      {data.tax && (
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: "#d97706", textTransform: "uppercase", letterSpacing: 0.8, display: "flex", alignItems: "center", gap: 6 }}>
            <DynamicIcon name="FileText" size={14} /> TAX
          </div>
          {data.tax.annualDeadline && (
            <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: "10px 12px" }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: "#b45309", textTransform: "uppercase", letterSpacing: 0.7 }}>Deadline (which day)</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#92400e", marginTop: 3 }}>{data.tax.annualDeadline}</div>
            </div>
          )}
          {(data.tax.quarterlyDates || []).length > 0 && (
            <div>
              <div style={{ fontSize: 10, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.7, marginBottom: 5 }}>Quarterly due dates</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                {(data.tax.quarterlyDates || []).map((q, i) => (
                  <span key={i} style={{ fontSize: 11, fontFamily: "monospace", color: "#92400e", background: "#fff", border: "1px solid #fde68a", borderRadius: 5, padding: "3px 8px" }}>{q}</span>
                ))}
              </div>
            </div>
          )}
          {data.tax.stateDeadline && stepBlock("State deadline", data.tax.stateDeadline)}
          {data.tax.whatToPay && stepBlock("What to pay", data.tax.whatToPay)}
        </div>
      )}

      {data.whereToApply && data.whereToApply.length > 0 && (
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: "#2563eb", textTransform: "uppercase", letterSpacing: 0.8, display: "flex", alignItems: "center", gap: 6 }}>
            <DynamicIcon name="MapPin" size={14} /> WHERE TO APPLY
          </div>
          {(data.whereToApply || []).sort((a, b) => ((a.order || "0").toString()).localeCompare((b.order || "0").toString(), undefined, { numeric: true })).map((w, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", gap: 2, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: "10px 12px" }}>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: "#1e293b" }}>#{w.order || i + 1} · {w.authority}</div>
              <div style={{ fontSize: 12, color: "#64748b" }}>{w.purpose}</div>
            </div>
          ))}
        </div>
      )}

      {data.banks && data.banks.length > 0 && (
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: "#059669", textTransform: "uppercase", letterSpacing: 0.8, display: "flex", alignItems: "center", gap: 6 }}>
            <DynamicIcon name="Landmark" size={14} /> BANKS I CAN APPLY WITH (NON-RESIDENT)
          </div>
          {(data.banks || []).map((b, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", gap: 4, background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "10px 12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: "#14532d" }}>{b.name}</span>
                <span style={{ fontSize: 9, fontWeight: 700, fontFamily: "monospace", color: "#059669", background: "#dcfce7", borderRadius: 4, padding: "2px 6px" }}>{b.type}</span>
                {b.nonResidentOk && (
                  <span style={{ fontSize: 9, fontWeight: 700, fontFamily: "monospace", color: b.nonResidentOk.toLowerCase().startsWith("no") ? "#ef4444" : "#059669", background: b.nonResidentOk.toLowerCase().startsWith("no") ? "#fee2e2" : "#dcfce7", borderRadius: 4, padding: "2px 6px" }}>{b.nonResidentOk}</span>
                )}
              </div>
              {b.requirements && <div style={{ fontSize: 11.5, color: "#334155" }}><strong style={{ color: "#065f46" }}>Docs:</strong> {b.requirements}</div>}
              {b.feesAndMinimum && <div style={{ fontSize: 11.5, color: "#334155" }}><strong style={{ color: "#065f46" }}>Fees/min:</strong> {b.feesAndMinimum}</div>}
              {b.bestFor && <div style={{ fontSize: 11.5, color: "#334155" }}><strong style={{ color: "#065f46" }}>Best for:</strong> {b.bestFor}</div>}
            </div>
          ))}
        </div>
      )}

      {(data.qa || []).length > 0 && (
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: "#2563eb", textTransform: "uppercase", letterSpacing: 0.8, display: "flex", alignItems: "center", gap: 6 }}>
            <DynamicIcon name="HelpCircle" size={14} /> YOUR Q&A — ANSWERS
          </div>
          {(data.qa || []).map((qa, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", gap: 4, background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: "10px 12px" }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: "#1d4ed8" }}>Q{i + 1}: {qa.question}</div>
              <div style={{ fontSize: 12.5, color: "#1e293b", lineHeight: 1.6 }}>{qa.answer}</div>
            </div>
          ))}
        </div>
      )}

      {data.requiredDocuments && data.requiredDocuments.length > 0 && (
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "14px 16px" }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: "#7c3aed", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
            <DynamicIcon name="FileStack" size={14} /> DOCUMENTS YOU NEED
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {(data.requiredDocuments || []).map((doc, i) => (
              <div key={i} style={{ display: "flex", gap: 8, alignItems: "baseline", fontSize: 12, color: "#475569", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 7, padding: "7px 11px" }}>
                <span style={{ color: "#7c3aed", fontWeight: 800 }}>✓</span><span>{doc}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {(data.recommendations || []).length > 0 && (
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "14px 16px" }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: "#f59e0b", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
            <DynamicIcon name="Lightbulb" size={14} /> Next Steps
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {(data.recommendations || []).map((rec, i) => (
              <div key={i} style={{ fontSize: 12, color: "#475569", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 7, padding: "8px 12px", lineHeight: 1.5 }}>{rec}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// [E_CustomMethodDropdown] Sleek dropdown replacing the native select for FB Ads Methods
const CustomMethodDropdown = ({ 
  selectedId, 
  onSelect, 
  defaultMethods, 
  customMethods, 
  onRemove, 
  onEdit 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const allMethods = [...defaultMethods, ...customMethods];
  const selectedMethod = selectedId === "custom" 
    ? { label: "-- Custom / New Method --" } 
    : allMethods.find(m => m.id === selectedId) || { label: "-- Custom / New Method --" };

  return (
    <div ref={dropdownRef} style={{ position: "relative", width: "100%", marginBottom: 12, fontFamily: "inherit" }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: 6 }}>
        CHOOSE A METHOD (OR ADD NEW)
      </div>
      
      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{ 
          width: "100%", background: "#fff", border: "1px solid #cbd5e1", borderRadius: 8, 
          padding: "10px 14px", fontSize: 13, color: "#1e293b", cursor: "pointer",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
        }}
      >
        <span style={{ fontWeight: 600 }}>{selectedMethod.label}</span>
        <DynamicIcon name="ChevronDown" size={16} color="#64748b" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
      </div>

      {isOpen && (
        <div style={{ 
          position: "absolute", top: "100%", left: 0, right: 0, marginTop: 6,
          background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, 
          boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
          zIndex: 50, overflow: "hidden", display: "flex", flexDirection: "column"
        }}>
          <div 
            onClick={() => { onSelect("custom"); setIsOpen(false); }}
            style={{ padding: "10px 14px", fontSize: 13, fontWeight: 600, color: "#2563eb", background: "#f0f9ff", cursor: "pointer", borderBottom: "1px solid #e2e8f0" }}
          >
            -- Custom / New Method --
          </div>
          
          <div style={{ maxHeight: 250, overflowY: "auto" }}>
            <div style={{ padding: "8px 14px", fontSize: 10, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.5 }}>Classic Methods</div>
            {defaultMethods.map(m => (
              <div 
                key={m.id}
                onClick={() => { onSelect(m.id); setIsOpen(false); }}
                style={{ 
                  padding: "10px 14px", fontSize: 13, color: "#334155", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  background: selectedId === m.id ? "#f8fafc" : "transparent"
                }}
              >
                <span>{m.label}</span>
                {selectedId === m.id && <DynamicIcon name="Check" size={14} color="#2563eb" />}
              </div>
            ))}

            {customMethods.length > 0 && (
              <>
                <div style={{ padding: "8px 14px", fontSize: 10, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.5, borderTop: "1px solid #f1f5f9", marginTop: 4, paddingTop: 10 }}>Saved Methods</div>
                {customMethods.map(m => (
                  <div 
                    key={m.id}
                    style={{ 
                      padding: "10px 14px", fontSize: 13, color: "#334155",
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      background: selectedId === m.id ? "#f8fafc" : "transparent",
                      borderBottom: "1px solid #f8fafc"
                    }}
                  >
                    <div style={{ flex: 1, cursor: "pointer" }} onClick={() => { onSelect(m.id); setIsOpen(false); }}>
                      <span style={{ fontWeight: selectedId === m.id ? 600 : 400 }}>{m.label}</span>
                    </div>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <button 
                        onClick={(e) => { e.stopPropagation(); onEdit(m.id); setIsOpen(false); }}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b", padding: 2 }}
                        title="Edit Name"
                      >
                        <DynamicIcon name="Edit2" size={14} />
                      </button>
                      <button 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          if (window.confirm("Delete this custom method?")) {
                            onRemove(m.id); 
                            if (selectedId === m.id) onSelect("custom");
                          }
                        }}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", padding: 2 }}
                        title="Delete Method"
                      >
                        <DynamicIcon name="Trash2" size={14} />
                      </button>
                      {selectedId === m.id && <DynamicIcon name="Check" size={14} color="#2563eb" style={{ marginLeft: 4 }} />}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// [E_MainComponent] MAIN EXPORT — AdTestingDashboard. The whole Facebook Ad Testing canvas.
export default function AdTestingDashboard({ products, onBack }) {
  // [S_GroupState] Group/size modal state
  const [showSizeModal, setShowSizeModal] = useState(false);
  const [groups, setGroups] = useState(() => createDefaultGroups(products, 3));
  const [expandedGroups, setExpandedGroups] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [groupSize, setGroupSize] = useState(3);
  const [aiConfig, setAiConfig] = useState(null);

  // [S_CustomMethods] User-saved custom methods for the Facebook Ads Testing skill
  const [customMethods, setCustomMethods] = useState([]);
  useEffect(() => {
    try {
      const saved = localStorage.getItem("FB_ADS_CUSTOM_METHODS");
      if (saved) setCustomMethods(JSON.parse(saved));
    } catch(e) {}
  }, []);
  const saveCustomMethod = (method) => {
    // If updating an existing method
    const existing = customMethods.find(m => m.id === method.id);
    let newMethods;
    if (existing) {
      newMethods = customMethods.map(m => m.id === method.id ? method : m);
    } else {
      newMethods = [...customMethods, method];
    }
    setCustomMethods(newMethods);
    try { localStorage.setItem("FB_ADS_CUSTOM_METHODS", JSON.stringify(newMethods)); } catch(e) {}
  };

  const removeCustomMethod = (methodId) => {
    const newMethods = customMethods.filter(m => m.id !== methodId);
    setCustomMethods(newMethods);
    try { localStorage.setItem("FB_ADS_CUSTOM_METHODS", JSON.stringify(newMethods)); } catch(e) {}
  };

  // Fetch AI config as soon as dashboard mounts
  useEffect(() => {
    fetch("/api/ai/config")
      .then(r => r.json())
      .then(d => setAiConfig(d.config))
      .catch(() => setAiConfig({ hasApiKey: false, activeProvider: "unknown", model: "—" }));
  }, []);

  /* ── Canvas State ── */
  // [S_CanvasState] Zoom + pan state for the whole canvas
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
  // [S_NodeGraph] Positions of group/adset nodes + product port tracking for connections
  const [positions, setPositions] = useState({});
  const productPortPositions = useRef({}); // { [productId]: { x, y } } in canvas coords
  const draggingRef = useRef(null);

  /* ── Visual Programming State ── */
  // [S_SkillState] Skills / standalone products / connections / drawing-line
  const [skills, setSkills] = useState([]); // { id, type, x, y, status, result, error }
  const [standaloneProducts, setStandaloneProducts] = useState([]); // { id, product, x, y }
  const [connections, setConnections] = useState([]); // { fromId, toId }
  const [selectedConnection, setSelectedConnection] = useState(null);
  const [hoveredConnection, setHoveredConnection] = useState(null);
  const [drawingLine, setDrawingLine] = useState(null); // { startX, startY, curX, curY }
  const drawingRef = useRef(null);

  /* ── Drawing Tools State ── */
  // [S_DrawState] Drawn background shapes + drawing mode + color
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

  // [S_CursorMode] Mouse cursor mode + right-click menu state
  const [previewSkill, setPreviewSkill] = useState(null);

  const [cursorMode, setCursorMode] = useState('select');
  const [contextMenu, setContextMenu] = useState(null);
  // [S_NodeMenu] Skill-node right-click menu: Copy / Copy Code / F12 inspect.
  const [nodeMenu, setNodeMenu] = useState(null); // { x, y, skillId }
  const [inspector, setInspector] = useState(null); // { skillId }
  const [flashMsg, setFlashMsg] = useState(""); // tiny "Copied!" toast

  // [F_spawnSkill] Adds a new skill node at the viewport center.
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
      language: 'English', webResearch: !!ADVANCED_PRODUCT_WEB_DEFAULT[type], model: 'deepseek-chat', instructions: '', isExpanded: false
    }]);
  };

  const updateSkillData = (id, data) => {
    setSkills(prev => prev.map(s => s.id === id ? { ...s, ...data } : s));
  };

  // ── Master DZ: run selected sections one by one ──────────────────────────
  // [F_runMasterDzSkill] Runs multiple landing-page sections sequentially (master_dz skill).
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

  // [F_runMethodSkill] Methods Library skills (testing / scaling / winning product /
  // master guide). Runs each method the user ticked on the card, one by one with
  // LIVE progress, and keeps the raw doc text as the source of truth.
  const runMethodSkill = async (skillId, overrides = {}) => {
    const skillNow = { ...skills.find(s => s.id === skillId), ...overrides };
    if (!skillNow.id) return;
    const chapterKey = METHOD_CHAPTERS[skillNow.type];
    const ch = getChapter(skillNow.type);
    if (!ch) return;

    const keysToRun = (skillNow.selectedMethods || []).filter(k => ch.methods.some(m => m.key === k));
    if (keysToRun.length === 0) {
      setSkills(prev => prev.map(s => s.id === skillId ? { ...s, status: 'error', error: "Select at least one method on the card first, then press RUN." } : s));
      return;
    }

    setSkills(prev => prev.map(s => s.id === skillId ? {
      ...s, status: 'running', error: null,
      result: {
        chapterKey,
        chapterTitle: ch.title,
        methods: keysToRun.map(key => {
          const m = ch.methods.find(x => x.key === key);
          return { key, title: m.title, tagline: m.tagline, meta: m.meta, status: 'pending', text: null, source: m.body, error: null };
        })
      }
    } : s));

    for (const key of keysToRun) {
      const m = ch.methods.find(x => x.key === key);
      setSkills(prev => prev.map(s => s.id === skillId ? {
        ...s,
        result: {
          ...s.result,
          methods: s.result.methods.map(item => item.key === key ? { ...item, status: 'running' } : item)
        }
      } : s));

      try {
        const ctx = { ...(skillNow.resolvedInput || {}), instructions: (skillNow.instructions || "").trim() };
        const methodExtras = [];
        if (skillNow.maxUnitCost) methodExtras.push(`Max unit cost: $${skillNow.maxUnitCost}`);
        if (skillNow.maxMoq) methodExtras.push(`Max MOQ: ${skillNow.maxMoq} units`);
        if (skillNow.webResearch) methodExtras.push("Use LIVE WEB RESEARCH to verify current supplier links, prices, and availability. Include working supplier URLs where possible.");
        if (methodExtras.length) ctx.instructions = (ctx.instructions ? ctx.instructions + "\n" : "") + "CONSTRAINTS:\n- " + methodExtras.join("\n- ");
        const isAnalysis = !!METHOD_ANALYSIS_MODE[chapterKey];
        let chart = null;
        let text = "";
        if (isAnalysis) {
          // Expert-message analysis: single AI call, no diagram chart.
          const playbookRes = await fetch("/api/ai/execute-node", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt: buildMessageAnalysisPrompt(m, ctx, ch.title), skillId: `msg_${chapterKey}_${key}_analysis`, schemaString: "" })
          });
          const playbookData = await playbookRes.json();
          text = playbookRes.ok ? (playbookData.result || "") : "Error: " + (playbookData.error || "Unknown error");
        } else {
          // Chart (org-chart diagram data) + playbook (full text) run in parallel.
          const [chartRes, playbookRes] = await Promise.all([
            fetch("/api/ai/execute-node", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ prompt: buildMethodChartPrompt(m, ctx, ch.title), skillId: `method_${chapterKey}_${key}_chart`, schemaString: METHOD_CHART_SCHEMA })
            }),
            fetch("/api/ai/execute-node", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ prompt: buildMethodPlaybookPrompt(m, ctx, ch.title), skillId: `method_${chapterKey}_${key}_playbook`, schemaString: "" })
            })
          ]);
          const chartData = await chartRes.json();
          const playbookData = await playbookRes.json();
          chart = chartRes.ok ? (chartData.result || null) : null;
          text = playbookRes.ok ? (playbookData.result || "") : "Error: " + (playbookData.error || "Unknown error");
        }
        setSkills(prev => prev.map(s => s.id === skillId ? {
          ...s,
          result: {
            ...s.result,
            methods: s.result.methods.map(item => item.key === key ? { ...item, status: 'done', chart, text, error: null } : item)
          }
        } : s));
      } catch (err) {
        setSkills(prev => prev.map(s => s.id === skillId ? {
          ...s,
          result: {
            ...s.result,
            methods: s.result.methods.map(item => item.key === key ? { ...item, status: 'error', error: err.message } : item)
          }
        } : s));
      }
    }

    setSkills(prev => prev.map(s => s.id === skillId ? { ...s, status: 'done' } : s));
  };
  // (analysis → each /sections/*.liquid → theme files) and packages a downloadable ZIP at the end.
  const runLiquidPromptSkill = async (skillId) => {
    const skillNow = skills.find(s => s.id === skillId);
    if (!skillNow) return;
    const html = (skillNow.instructions || "").trim();
    if (!html) {
      setSkills(prev => prev.map(s => s.id === skillId ? { ...s, status: 'error', error: "Paste your HTML page in the HTML box first, then press RUN." } : s));
      return;
    }

    const stamp = (msgs) => setSkills(prev => prev.map(s => s.id === skillId ? ({
      ...s,
      result: {
        ...(s.result || {}),
        progress: [...((s.result && s.result.progress) || []), ...msgs]
      }
    }) : s));

    setSkills(prev => prev.map(s => s.id === skillId ? {
      ...s, status: 'running', error: null,
      result: {
        progress: [{ id: 'p0', state: 'running', label: "PART 1 — Tailwind/Section/Editability rules loaded · starting converter…", detail: null }],
        files: [],
        zipUrl: null,
        zipName: null
      }
    } : s));

    const callAI = async (prompt, id, schemaString) => {
      const res = await fetch("/api/ai/execute-node", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, skillId: `liquid_${id}`, schemaString })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed: " + id);
      return data.result;
    };

    const addFile = (path, content) => setSkills(prev => prev.map(s => s.id === skillId ? ({
      ...s,
      result: { ...s.result, files: [...((s.result && s.result.files) || []), { path, content, size: (content || "").length }] }
    }) : s));

    try {
      // ── PART 2 — Analyze the HTML ──
      stamp([{ id: 'p1', state: 'running', label: "PART 2 — Analyzing the HTML page and splitting it into logical sections…", detail: null }]);
      const analysis = await callAI(
        `You are an expert Shopify theme developer. Analyze the HTML page below and identify its logical sections in top-to-bottom order. Return ONLY the analysis JSON (see the expected schema).\n\n=== THE HTML PAGE ===\n${html}`,
        "analysis", LIQUID_ANALYSIS_SCHEMA
      );
      const sections = Array.isArray(analysis && analysis.sections) ? analysis.sections : [];
      if (sections.length === 0) throw new Error("No sections detected in the HTML. Make sure you pasted a full HTML page.");
      stamp([{ id: 'p1', state: 'done', label: `PART 2 done — ${sections.length} sections detected: ${sections.map(s => s.name).join(" · ")}`, detail: analysis.notes ? analysis.notes.join("\n") : null }]);

      // ── PART 3 — Convert each section one by one (LIVE per section) ──
      const sectionFiles = [];
      for (let i = 0; i < sections.length; i++) {
        const sec = sections[i];
        const secKey = (sec.key || `section_${i + 1}`).replace(/[^a-z0-9_]/gi, "_").toLowerCase();
        const secName = sec.name || `Section ${i + 1}`;
        const secId = `p2_${i}`;
        stamp([{ id: secId, state: 'running', label: `PART 3 (${i + 1}/${sections.length}) — Converting "${secName}" → sections/${secKey}.liquid`, detail: null }]);
        try {
          const liquid = await callAI(buildLiquidSectionPrompt(html, secName, secKey), `convert_${secKey}`, "");
          sectionFiles.push({ path: `sections/${secKey}.liquid`, content: liquid });
          addFile(`sections/${secKey}.liquid`, liquid);
          const preview = liquid.length > 2200 ? liquid.slice(0, 2200) + "\n…" : liquid;
          stamp([{ id: secId, state: 'done', label: `"${secName}" converted ✓ (${liquid.length} chars)`, detail: preview }]);
        } catch (err) {
          stamp([{ id: secId, state: 'error', label: `"${secName}" failed — ${err.message}`, detail: null }]);
        }
      }

      // ── PART 4-9 — theme.liquid, index.json, tailwind config, theme.js ──
      stamp([{ id: 'p3', state: 'running', label: "PART 4-9 — Generating layout/theme.liquid, templates/index.json, tailwind config, assets/theme.js…", detail: null }]);
      const assets = await callAI(
        buildLiquidAssetsPrompt(html, sections.map(s => (s.key || "").replace(/[^a-z0-9_]/gi, "_").toLowerCase()), analysis.notes ? analysis.notes.join("; ") : ""),
        "assets", LIQUID_ASSETS_SCHEMA
      );
      const assetFiles = Array.isArray(assets && assets.files) ? assets.files : [];
      for (const f of assetFiles) {
        addFile(f.path, f.content || "");
      }
      stamp([{ id: 'p3', state: 'done', label: `PART 4-9 done — ${assetFiles.length} theme files assembled`, detail: assets.notes ? assets.notes.join("\n") : null }]);

      // ── PART 10 — Package ZIP ──
      const allFiles = [
        ...sectionFiles,
        ...assetFiles.map(f => ({ path: f.path, content: f.content || "" }))
      ];
      if (allFiles.length === 0) throw new Error("No files were generated.");
      const zipName = "shopify-liquid-theme.zip";
      stamp([{ id: 'p4', state: 'running', label: `PART 10 — Packaging ${allFiles.length} files into ${zipName}…`, detail: null }]);
      const zipUrl = zipDownloadUrl(allFiles, zipName);
      stamp([{ id: 'p4', state: 'done', label: `PART 10 done — ${zipName} is ready (${allFiles.length} files)`, detail: "Download it and upload to Shopify → Online Store → Themes → Upload theme. Compile Tailwind (npm run build) to generate assets/tailwind.css." }]);

      setSkills(prev => prev.map(s => s.id === skillId ? { ...s, status: 'done', isExpanded: true, result: { ...(s.result || {}), zipUrl, zipName } } : s));
      setTimeout(() => {
        const a = document.createElement("a");
        a.href = zipUrl;
        a.download = zipName;
        document.body.appendChild(a);
        a.click();
        a.remove();
      }, 600);
    } catch (err) {
      stamp([{ id: 'pf', state: 'error', label: `FAILED — ${err.message}`, detail: null }]);
      setSkills(prev => prev.map(s => s.id === skillId ? { ...s, status: 'error', error: err.message } : s));
    }
  };

  // [F_runLandingPageSkill] AI → CRO strategy → per-section HTML → assemble → CRO audit → auto-optimize.
  // Live two-pane builder: runs phases sequentially, each section landing in the preview as it finishes.
  const runLandingPageSkill = async (skillId, resolvedInput = {}) => {
    const skillNow = skills.find(s => s.id === skillId);
    if (!skillNow) return;

    const instructions = (skillNow.instructions || "").trim();
    const productHint = (resolvedInput.productName || "").trim() || (resolvedInput.niche || "").trim();
    if (!productHint && !instructions) {
      setSkills(prev => prev.map(s => s.id === skillId ? { ...s, status: 'error', error: "Describe the product first: type the product name/features in the skill's text box (or connect it to a product node)." } : s));
      return;
    }

    const ctx = {
      ...resolvedInput,
      productName: resolvedInput.productName || productHint,
      productDescription: resolvedInput.productDescription || "",
      productCategory: resolvedInput.productCategory || "",
      instructions,
    };

    const stamp = (msgs) => setSkills(prev => prev.map(s => s.id === skillId ? ({
      ...s,
      result: { ...(s.result || {}), progress: [...((s.result && s.result.progress) || []), ...msgs] }
    }) : s));

    const callAI = async (prompt, id, schemaString) => {
      const res = await fetch("/api/ai/execute-node", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, skillId: `landing_${id}`, schemaString })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed: " + id);
      return data.result;
    };

    const setSection = (key, patch) => setSkills(prev => prev.map(s => s.id === skillId ? {
      ...s,
      result: {
        ...s.result,
        strategy: s.result.strategy,
        sections: (s.result.sections || []).map(sec => sec.key === key ? { ...sec, ...patch } : sec)
      }
    } : s));

    try {
      // ── Phase A — DISCOVERY FIRST → CRO strategy → fixed 12-section plan ──
      stamp([{ id: 'lp0', state: 'running', label: 'PART 1 — DISCOVERY: brand → product content → pricing/offer → social proof → navigation. Building the 12-section plan…', detail: null }]);
      const stratRaw = await callAI(buildLandingStrategyPrompt(ctx), "strategy", LANDING_STRATEGY_SCHEMA);
      const strategy = stratRaw || {};
      const byKey = {};
      (Array.isArray(strategy.sections) ? strategy.sections : []).forEach(s => { byKey[(s && s.key) || ""] = s; });
      const plan = LANDING_MANDATORY_SECTIONS.map((k, i) => {
        const ai = byKey[k] || {};
        return {
          key: k,
          name: ai.name || k.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
          purpose: ai.purpose || "",
          headline: ai.headline || "",
          subheadline: ai.subheadline || "",
          body: ai.body || "",
          ctaLabel: ai.ctaLabel || "",
          layout: ai.layout || "",
          orderIndex: i
        };
      });
      const gaps = Array.isArray(strategy.gaps) ? strategy.gaps : [];
      stamp([{ id: 'lp0', state: 'done', label: `PART 1 DONE — brand locked: ${(strategy.brandIdentity && strategy.brandIdentity.brandName) || (strategy.productName) || "…"} · full 12-section plan ready`, detail: gaps.length ? `Discovery gaps flagged waiting for you: ${gaps.map(g => g.field).join(", ")}` : "All discovery facts resolved from your input" }]);

      setSkills(prev => prev.map(s => s.id === skillId ? {
        ...s,
        result: {
          ...(s.result || {}),
          strategy,
          sections: plan.map(sec => ({ key: sec.key, name: sec.name || sec.key, orderIndex: sec.orderIndex, status: 'pending', html: null, error: null })),
        }
      } : s));

      // ── Phase B — Generate each section (LIVE in the preview) ──
      const builtHtml = {};
      for (let i = 0; i < plan.length; i++) {
        const sec = plan[i];
        const secKey = sec.key || `sec_${i + 1}`;
        const secId = `lp_${secKey}`;
        setSection(secKey, { status: 'running', error: null });
        stamp([{ id: secId, state: 'running', label: `Section ${i + 1}/12 — Building "${sec.name || secKey}"…`, detail: null }]);
        try {
          const html = await callAI(buildLandingSectionPrompt(ctx, strategy, sec), `section_${secKey}`, "");
          builtHtml[secKey] = html || "";
          setSection(secKey, { status: 'done', html: html || "" });
          const chars = (html || "").length;
          stamp([{ id: secId, state: 'done', label: `Section ${i + 1}/12 — "${sec.name || secKey}" live ✓ (${chars} chars)`, detail: null }]);
        } catch (err) {
          setSection(secKey, { status: 'error', error: err.message, html: null });
          stamp([{ id: secId, state: 'error', label: `"${sec.name || secKey}" failed — ${err.message}`, detail: null }]);
        }
      }

      // ── Phase C — CRO audit of the assembled page ──
      stamp([{ id: 'lpa', state: 'running', label: 'PHASE 12 — Running CRO audit on the generated page…', detail: null }]);
      const assembled = Object.values(builtHtml).join("\n").trim();
      if (assembled) {
        const auditResult = await callAI(buildLandingAuditPrompt(assembled), "audit", LANDING_AUDIT_SCHEMA);
        const audit = auditResult || {};
        stamp([{ id: 'lpa', state: 'done', label: `CRO AUDIT — ${Math.round(audit.totalScore || 0)}/100`, detail: (audit.problems || []).slice(0, 4).map(p => `[${p.priority}] ${p.problem}`).join("\n") || null }]);
        setSkills(prev => prev.map(s => s.id === skillId ? { ...s, result: { ...s.result, audit } } : s));

        // ── Phase D — Auto-optimize the highest-priority fields ──
        stamp([{ id: 'lpo', state: 'running', label: 'PHASE 13 — Auto-optimizing weak spots (patching exact fields)…', detail: null }]);
        try {
          const optResult = await callAI(buildLandingOptimizePrompt(assembled, audit), "optimize", LANDING_OPTIMIZE_SCHEMA);
          const patches = Array.isArray(optResult && optResult.patches) ? optResult.patches : [];
          if (patches.length) {
            stamp([{ id: 'lpo', state: 'done', label: `AUTO-OPTIMIZATION done — ${patches.length} patches applied to the page`, detail: patches.slice(0, 5).map(p => `${p.field}: ${p.newText}`).join("\n") }]);
          } else {
            stamp([{ id: 'lpo', state: 'done', label: 'AUTO-OPTIMIZATION done — no patches needed', detail: null }]);
          }
          setSkills(prev => prev.map(s => s.id === skillId ? { ...s, result: { ...s.result, patches } } : s));
        } catch (err) {
          stamp([{ id: 'lpo', state: 'error', label: `Auto-optimization failed — ${err.message}`, detail: null }]);
        }
      } else {
        stamp([{ id: 'lpa', state: 'error', label: 'CRO audit skipped — no sections were generated', detail: null }]);
      }

      setSkills(prev => prev.map(s => s.id === skillId ? { ...s, status: 'done', isExpanded: true } : s));
    } catch (err) {
      stamp([{ id: 'lpf', state: 'error', label: `FAILED — ${err.message}`, detail: null }]);
      setSkills(prev => prev.map(s => s.id === skillId ? { ...s, status: 'error', error: err.message } : s));
    }
  };

  // [F_regenerateLandingSection] Re-runs ONLY one section (used by the builder's → button).
  const regenerateLandingSection = async (skillId, sectionKey) => {
    const skillNow = skills.find(s => s.id === skillId);
    if (!skillNow || !skillNow.result || !skillNow.result.strategy) return;
    const sec = (skillNow.result.sections || []).find(x => x.key === sectionKey);
    if (!sec) return;
    const stratSec = (skillNow.result.strategy.sections || []).find(x => x.key === sectionKey) || sec;
    const ctx = { productName: skillNow.result.strategy.product?.name || "", productDescription: "", instructions: (skillNow.instructions || "").trim() };
    setSkills(prev => prev.map(s => s.id === skillId ? { ...s, result: { ...s.result, sections: (s.result.sections || []).map(x => x.key === sectionKey ? { ...x, status: 'running', error: null } : x) } } : s));
    try {
      const res = await fetch("/api/ai/execute-node", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: buildLandingSectionPrompt(ctx, skillNow.result.strategy, stratSec), skillId: `landing_section_${sectionKey}`, schemaString: "" })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to regenerate");
      const html = data.result || "";
      setSkills(prev => prev.map(s => s.id === skillId ? { ...s, result: { ...s.result, sections: (s.result.sections || []).map(x => x.key === sectionKey ? { ...x, status: 'done', html } : x) } } : s));
    } catch (err) {
      setSkills(prev => prev.map(s => s.id === skillId ? { ...s, result: { ...s.result, sections: (s.result.sections || []).map(x => x.key === sectionKey ? { ...x, status: 'error', error: err.message } : x) } } : s));
    }
  };

  // [F_runSkill] Main AI runner: resolves graph inputs, builds prompt/schema, calls /api/ai/execute-node.
  const runSkill = async (skillId, overrides = {}) => {
    const skill = { ...skills.find(s => s.id === skillId), ...overrides };
    if (!skill.id) return;

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

    // Debug: remember which nodes were connected at run time

      setSkills(prev => prev.map(s => s.id === skillId ? { ...s, status: 'running', error: null } : s));

    try {
      const skillDef = SKILLS_DICT[skill.type];
      if (!skillDef) throw new Error("Skill definition not found in registry.");

      // 1. Resolve DAG Context (include group nodes so their ad sets/ads flow upstream to skills)
      const engine = new GraphEngine(
        [...groups.map((g, i) => ({ id: `group_${i}`, result: g })), ...skills],
        connections
      );
      const upstreamOutputs = engine.getUpstreamOutputs(skillId);

      // Skill-to-skill context is direction-agnostic: ANY connected skill that has a
      // result is injected as analysis context (no matter which way the link was drawn).
      connections.forEach(c => {
        if (c.fromId !== skillId && c.toId !== skillId) return;
        const otherId = c.fromId === skillId ? c.toId : c.fromId;
        if (!otherId || otherId === skillId) return;
        const peer = skills.find(s => s.id === otherId);
        if (peer && peer.result) upstreamOutputs[otherId] = peer.result;
      });

      // Group-to-skill context is ALSO direction-agnostic: if a group card is connected
      // either way, its product data MUST flow to the skill.
      connections.forEach(c => {
        if (c.fromId !== skillId && c.toId !== skillId) return;
        const otherId = c.fromId === skillId ? c.toId : c.fromId;
        if (!otherId || otherId === skillId) return;
        const m = String(otherId).match(/^group_(\d+)$/);
        if (m && groups) {
          const g = groups[parseInt(m[1])];
          if (g) upstreamOutputs[otherId] = g;
        }
      });

      // Product-to-skill context is ALSO direction-agnostic: if a product node is
      // connected (standalone OR inside a group), inject the FULL product object so
      // grounding (extractProductFacts) can read its name/description/offer/price.
      connections.forEach(c => {
        if (c.fromId !== skillId && c.toId !== skillId) return;
        const otherId = c.fromId === skillId ? c.toId : c.fromId;
        if (!otherId || otherId === skillId) return;
        let prod = products.find(p => p.id === otherId);
        if (!prod && groups) {
          for (const g of groups) {
            const f = (g.products || []).find(p => p.id === otherId);
            if (f) { prod = f; break; }
          }
        }
        if (prod) upstreamOutputs[otherId] = prod;
      });

      // Debug: remember which nodes were connected at run time
      setSkills(prev => prev.map(s => s.id === skillId ? { ...s, connectedNodes: Object.keys(upstreamOutputs) } : s));

      // 2. Resolve Inputs
      const { isReady, missingInputs, resolvedInput, rawMergedContext } = resolveSkillInput({
        skillDef,
        nodeInputs: {
          targetCountry: skill.targetCountry,
          depth: skill.depth,
          maxResults: skill.maxResults,
          targetMarket: skill.targetMarket,
          marketplaces: skill.marketplaces,
          rankingPriority: skill.rankingPriority,
          maxUnitCost: skill.maxUnitCost,
          maxMoq: skill.maxMoq
        },
        globalContext,
        connectedOutputs: upstreamOutputs
      });

      if (!isReady) {
        throw new Error(`Missing required inputs: ${missingInputs.join(", ")}. Connect required nodes.`);
      }

      // 2b. Persist resolved input on the skill so specialized runners (e.g. the
      // Methods Library skills) can use the connected product/group context.
      setSkills(prev => prev.map(s => s.id === skillId ? { ...s, resolvedInput } : s));

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
      let prompt = skillDef.buildPrompt({ ...resolvedInput, instructions: skill.instructions, segmentDuration: skill.segmentDuration || 10, selectedStages: skill.selectedStages || null });

      // Inject MY COMPANY NAME for the LLC Company skill so the AI can tailor the plan to the user's company.
      if (COMPANY_PLAN_SKILLS.includes(skill.type) && skill.companyName && skill.companyName.trim()) {
        prompt += `\n\nMY COMPANY: ${skill.companyName.trim()}\nFocus the full LLC plan on THIS company: use this name in the companyName field, and give info specific to it (what to verify about it, its timeline, taxes). If you are not sure about live/registered details of this exact company, clearly say what the user must verify and where.`;
        if (skill.targetUrl && skill.targetUrl.trim()) {
          prompt += `\nCompany website to check: ${skill.targetUrl.trim()}`;
        }
      }

      // Inject all connected outputs into the prompt so the AI has context
      let connectedContextString = Object.values(upstreamOutputs).map(out =>
        typeof out === 'object' ? JSON.stringify(out, null, 2) : String(out)
      ).join("\n\n");

      const MAX_CTX = 22000;
      if (connectedContextString.length > MAX_CTX) {
        connectedContextString = connectedContextString.slice(0, MAX_CTX) + "\n...[context truncated to fit the model window]";
      }

      if (connectedContextString) {
        prompt += `\n\n=== UPSTREAM CONTEXT / DATA ===\n${connectedContextString}\n===============================\n\nPlease analyze the above upstream data and fulfill the skill's purpose based on it.`;
      }

      if (skill.type === 'image_ad_concept_generator' || skill.type === 'ugc_creative_prompt_generator') {
        const facts = extractProductFacts(upstreamOutputs);
        setSkills(prev => prev.map(s => s.id === skillId ? { ...s, grounding: facts || "NONE" } : s));
        if (facts) {
          prompt += `\n\n=== REAL PRODUCT FACTS EXTRACTED FROM YOUR CONNECTED GROUP (USE ONLY THESE) ===\n${facts}\n===============================================================================================\nGROUNDING RULE: base EVERY concept, hook, headline, script, shot list and generation prompt on THIS product from the group. Never generate for a different or generic product.`;
        } else {
          prompt += `\n\n=== WARNING ===\nNo product identity found in the connected group. Do NOT invent a product. Set ${skill.type === 'ugc_creative_prompt_generator' ? 'summary.product to "NO PRODUCT DATA" and return concepts: []' : 'creative_strategy.product to "NO PRODUCT DATA" and return selected_concepts: []'} , and explain in next_steps which product skills/group to connect and run first.`;
        }
      }

      prompt += `\nOutput Language: ${skill.language}`;
      
      if (skill.type === 'cinematic_storyboard_director' && skill.withVoiceover && skill.voiceoverScript) {
        prompt += `\n\n=== STRICT VOICEOVER SCRIPT ===\nThe user has provided the EXACT voiceover script to be used. You MUST split this script across the 10-second segments. Do not invent your own voiceover.\nScript: "${skill.voiceoverScript}"\n===============================\n`;
      } else if (skill.type === 'cinematic_storyboard_director' && !skill.withVoiceover) {
        prompt += `\n\n=== NO VOICEOVER ===\nThe user has chosen NOT to have a voiceover. Leave the "voiceover" field empty for ALL segments.\n===============================\n`;
      }

      if (COMPANY_PLAN_SKILLS.includes(skill.type)) {
        if ((skill.questions || []).some(q => q && q.trim())) {
          prompt += `\n\n=== MY QUESTIONS (answer EACH question clearly, one by one) ===\n` + (skill.questions || []).filter(q => q && q.trim()).map((q, i) => `${i + 1}. ${q.trim()}`).join("\n") + `\n===============================\n`;
        }
        if (skill.instructions) {
          prompt += `\nAdditional context/instructions: ${skill.instructions}`;
        }
      } else if (skill.instructions) {
        prompt += `\nStrict Custom Instructions: ${skill.instructions}`;
      }

      // [AP_PARAMS] Inject per-skill Advanced Product Intelligence parameters into the prompt.
      if (ADVANCED_PRODUCT_SKILLS.includes(skill.type)) {
        const apParts = [];
        if (skill.depth) apParts.push(`Output depth: ${skill.depth}${skill.depth === 'Quick' ? ' — concise summary only, skip lengthy explanations' : skill.depth === 'Full' ? ' — exhaustive detail with thorough analysis' : ' — balanced depth'}`);
        if (Array.isArray(skill.marketplaces) && skill.marketplaces.length) apParts.push(`Marketplaces to check: ${skill.marketplaces.join(", ")}`);
        if (skill.maxResults) apParts.push(`Max results to return: ${skill.maxResults}`);
        if (skill.targetMarket) apParts.push(`Target market: ${skill.targetMarket}`);
        if (skill.rankingPriority) apParts.push(`Ranking priority: ${skill.rankingPriority}`);
        if (skill.targetCountry) apParts.push(`Target country: ${skill.targetCountry}`);
        if (apParts.length) prompt += `\n\n=== ANALYSIS PARAMETERS ===\n${apParts.join("\n")}\n===========================\n\nUse these parameters to constrain your analysis strictly.`;
      }

      let schemaString = "Return a JSON object containing the exact keys requested by the skill definition.";

      if (skill.type === 'facebook_ads_testing') {
        schemaString = `Return ONLY a valid JSON object matching this structure exactly (do not wrap in markdown).
{
  "overallStrategy": "High level strategy and objectives",
  "campaigns": [
    {
      "campaignName": "Name of the campaign",
      "budgetType": "CBO (Campaign Budget Optimization) or ABO (Adset Budget Optimization)",
      "campaignBudget": "Suggested daily or lifetime budget (if CBO)",
      "campaignRules": "Automated rules (e.g. Kill ad if spend > $X and 0 sales, scale by 20% if CPA < $Y)",
      "adSets": [
        {
          "name": "Ad Set Name",
          "objective": "e.g. Website Conversions, Messages, Lead Gen",
          "targeting": "Detailed targeting (demographics, interests, behaviors)",
          "placement": "Placements (e.g., Advantage+ or Manual specific placements)",
          "budget": "Suggested budget (if ABO)",
          "parameters": "Optimization goal, attribution setting, etc.",
          "ads": [
            {
              "name": "Ad Name",
              "format": "e.g. Image, Video, Carousel",
              "description": "Ad concept/angle description"
            }
          ]
        }
      ]
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
      } else if (skill.type === 'liquid_prompt') {
        await runLiquidPromptSkill(skillId);
        return;
      } else if (skill.type === 'landing_page_builder') {
        await runLandingPageSkill(skillId, resolvedInput);
        return;
      } else if (skill.type === 'master_dz_landing_page_strategy') {
        await runMasterDzSkill(skillId, resolvedInput, skill.selectedSections || DZ_SECTIONS.map(s => s.key));
        return;
      } else if (METHOD_CHAPTERS[skill.type]) {
        await runMethodSkill(skillId, overrides);
        return;
      } else if (COMPANY_PLAN_SKILLS.includes(skill.type)) {
        schemaString = `Return ONLY a valid JSON object matching this structure exactly (do not wrap in markdown):
{
  "companyName": "Your LLC company name (or a suggested one for the business)",
  "overview": "2-3 sentences about what an LLC is, why you should form one for this business, and how it protects you",
  "whenToCreate": {
    "timing": "Ideal timing / when to form the LLC (e.g. before payment gateways, banks, Shopify/Amazon)",
    "duration": "How long formation takes (formation time + EIN)",
    "ifYouWait": "What happens if you run the business without an LLC"
  },
  "tax": {
    "annualDeadline": "WHICH DAY the federal tax return is due each year (April 15) and how to confirm",
    "quarterlyDates": ["List of quarterly estimated tax due dates (April 15, June 15, Sept 15, Jan 15)"],
    "stateDeadline": "State annual report / franchise tax deadline and cost",
    "whatToPay": "What taxes apply (self-employment / income / franchise) and rough estimate for a new e-commerce LLC"
  },
  "requiredDocuments": ["List every document needed: passport, proof of address, Articles of Organization, Operating Agreement, EIN confirmation, bank/Stripe verification, registered agent, etc."],
  "whereToApply": [
    { "authority": "Name of office/website (e.g. Delaware Division of Corporations, IRS for EIN, etc.)", "purpose": "What it is for", "order": "Step number / when to do it" }
  ],
  "banks": [
    { "name": "Bank / fintech name (e.g. Mercury, Relay, Brex, Wise Business, Payoneer, Stripe)",
      "type": "Traditional bank or neobank/fintech",
      "nonResidentOk": "YES/NO + notes on whether non-resident LLC owners (from Algeria) can open it",
      "requirements": "Documents needed (EIN, Articles of Organization, passport, address proof, etc.)",
      "feesAndMinimum": "Minimum deposit, monthly fees, opening cost",
      "bestFor": "Best for what (e-commerce, Stripe/PayPal, COD dropshipping, etc.)" }
  ],
  "qa": [
    { "question": "Each question the user asked in the Q&A section", "answer": "A clear, direct answer to that question" }
  ],
  "recommendations": ["3-5 actionable recommendations with concrete dates and costs"]
}`;
      } else if (skill.type === 'adset_table_generator') {
        schemaString = `Return ONLY a valid JSON object matching this structure exactly (do not wrap in markdown).
CRITICAL: Every ad set AND every ad from the group MUST appear. Use the group data provided in the prompt. Add benchmark KPI TARGETS at EVERY level (campaign, ad set AND each ad): impressions, reach, frequency, ctr_pct, cpm_usd, cpc_usd, cvr_pct, cpa_usd, roas, budget_usd, clicks, spend_usd, results, cost_per_result, add_to_cart_cost, initiate_checkout_cost, video_3s_views, engagement_rate — realistic for small-budget Facebook/Instagram ads in COD & e-commerce markets. ALSO include extra_kpis if the user's custom instructions ask for more KPIs.
{
  "campaign_metrics": {
    "name": "Campaign name from the group",
    "niche": "Niche / product group theme",
    "objective": "Objective (Sales / Traffic)",
    "total_ad_sets": "Number of ad sets",
    "kpis": { "impressions": "...", "reach": "...", "frequency": "...", "ctr_pct": "...", "cpm_usd": "...", "cpc_usd": "...", "cvr_pct": "...", "cpa_usd": "...", "roas": "...", "budget_usd": "...", "clicks": "...", "spend_usd": "...", "results": "...", "cost_per_result": "...", "add_to_cart_cost": "...", "initiate_checkout_cost": "...", "video_3s_views": "...", "engagement_rate": "...", "extra_kpis": { "user_requested_kpi": "value if requested, otherwise omit" } }
  },
  "ad_sets": [
    {
      "ad_set": "Ad Set name from the group",
      "targeting": "Targeting / audience",
      "placement": "Placements",
      "optimization_goal": "Optimization goal",
      "kpis": { "impressions": "...", "reach": "...", "frequency": "...", "ctr_pct": "...", "cpm_usd": "...", "cpc_usd": "...", "cvr_pct": "...", "cpa_usd": "...", "roas": "...", "budget_usd": "...", "clicks": "...", "spend_usd": "...", "results": "...", "cost_per_result": "...", "add_to_cart_cost": "...", "initiate_checkout_cost": "...", "video_3s_views": "...", "engagement_rate": "...", "extra_kpis": { "user_requested_kpi": "value if requested, otherwise omit" } },
      "ads": [
        { "ad": "Ad concept / specific hook", "format": "Image / Video / Carousel", "angle": "Creative angle this ad tests", "kpis": { "impressions": "...", "reach": "...", "frequency": "...", "ctr_pct": "1.2-2.0%", "cpm_usd": "$8-14", "cpc_usd": "$0.30-0.60", "cvr_pct": "1-2%", "cpa_usd": "concrete, based on product price", "roas": "2.0+", "budget_usd": "per-ad share", "clicks": "...", "spend_usd": "...", "results": "...", "cost_per_result": "...", "add_to_cart_cost": "...", "initiate_checkout_cost": "...", "video_3s_views": "...", "engagement_rate": "...", "extra_kpis": { "user_requested_kpi": "value if requested, otherwise omit" } } }
      ]
    }
  ],
  "observations": ["1 concrete observation per ad set: duplicates, overlapping angles, missing hooks/formats, untapped angles worth testing"]
}`;
      } else if (skill.type === 'campaign_analyzer') {
        schemaString = `Return ONLY a valid JSON object matching this structure exactly (do not wrap in markdown). Every KPI that can be compared across time uses {value, change, change_percent, period, source, confidence}. NEVER invent numbers — use "Not available" if missing.
{
  "overview": { "total_spend": {"value":"...","change_percent":"...","source":"Meta Ads"}, "revenue": {}, "orders": {}, "confirmed_orders": {}, "delivered_orders": {}, "returned_orders": {}, "net_revenue": {}, "net_profit": {}, "roas": {}, "real_roas": {}, "cac": {}, "cpa": {}, "delivery_rate": {}, "return_rate": {}, "confirmation_rate": {}, "net_margin": {} },
  "funnel": [ { "stage": "Ad Impression", "count":"...", "conversion":"...%", "dropoff":"...%", "status":"Healthy/Warning/Critical" } ],
  "advertising": {
    "kpis": { "impressions":{}, "reach":{}, "frequency":{}, "cpm_usd":{}, "ctr_pct":{}, "link_ctr_pct":{}, "outbound_ctr_pct":{}, "cpc_usd":{}, "cost_per_landing_page_view":{}, "landing_page_view_rate":{}, "engagement_rate":{}, "cost_per_engagement":{}, "video_views":{}, "2s_views":{}, "3s_views":{}, "25pct_views":{}, "50pct_views":{}, "75pct_views":{}, "95pct_views":{}, "100pct_views":{}, "video_completion_rate":{}, "thumb_stop_rate":{}, "hook_rate":{}, "avg_watch_time":{}, "cost_per_video_view":{}, "cost_per_engaged_view":{}, "conversion_rate":{}, "cpa":{}, "cac":{}, "roas":{}, "mer":{}, "budget":{}, "spend":{}, "revenue":{}, "purchases":{}, "purchase_value":{} },
    "winning_campaigns": ["..."], "winning_ad_sets": ["..."], "winning_ads": ["..."], "losing_ads": ["..."], "scaling_candidates": ["..."], "fatigue_candidates": ["..."], "expensive_audiences": ["..."], "cheap_audiences": ["..."], "high_converting_audiences": ["..."]
  },
  "creative": {
    "image": { "visual_hook": "Nota_Very strong", "product_visibility": "", "product_positioning": "", "background": "", "contrast": "", "composition": "", "before_after": "", "problem_visualization": "", "product_demonstration": "", "human_presence": "", "emotion": "", "text_overlay": "", "text_readability": "", "cta_visibility": "", "brand_visibility": "", "trust_elements": "", "offer_visibility": "", "mobile_readability": "" },
    "video": { "first_1s": "", "first_3s": "", "hook": "", "pattern_interrupt": "", "problem": "", "agitation": "", "product_reveal": "", "demonstration": "", "transformation": "", "proof": "", "social_proof": "", "offer": "", "cta": "", "video_length": "", "pacing": "", "scene_changes": "", "captions": "", "voiceover": "", "music": "", "product_visibility": "", "ugc_style": "", "demonstration_quality": "" },
    "why_it_works": "", "why_it_fails": "", "verdict": ""
  },
  "hooks": {
    "analysis": { "hook_type": "", "hook_strength": "", "curiosity": "", "problem_intensity": "", "emotional_impact": "", "pattern_interrupt": "", "specificity": "", "relevance": "", "audience_match": "", "time_to_product": "", "time_to_benefit": "" },
    "performance": [ { "type": "Problem hook", "ctr_pct": "2.8%", "conversion": "", "verdict": "" } ],
    "best_hook": ""
  },
  "copy": {
    "primary_text": { "hook": "", "pain_point": "", "desire": "", "problem": "", "benefit": "", "features": "", "mechanism": "", "proof": "", "objection_handling": "", "offer": "", "urgency": "", "cta": "", "length": "", "readability": "", "emotional_intensity": "" },
    "headline": { "clarity": "", "benefit": "", "curiosity": "", "offer": "", "cta": "", "product_relevance": "" },
    "description": {},
    "winning_copy_angle": "", "winning_pain_point": "", "winning_benefit": "", "winning_promise": "", "winning_cta": "", "winning_emotional_trigger": ""
  },
  "offer": {
    "elements": { "product_price": "", "discount": "", "previous_price": "", "bundle": "", "quantity": "", "free_shipping": "", "express_shipping": "", "cod": "", "guarantee": "", "warranty": "", "bonus": "", "upsell": "", "cross_sell": "", "scarcity": "", "urgency": "", "payment_options": "" },
    "calculations": { "avg_order_value": "", "revenue_per_visitor": "", "revenue_per_order": "", "discount_impact": "", "bundle_impact": "", "upsell_rate": "", "cross_sell_rate": "" },
    "diagnosis": "bad traffic / bad offer / bad product / bad landing page"
  },
  "landing_page": {
    "kpis": { "visits": {}, "unique_visitors": {}, "bounce_rate": {}, "engagement_rate": {}, "avg_time": {}, "scroll_depth": {}, "product_view_rate": {}, "cta_click_rate": {}, "add_to_cart_rate": {}, "checkout_initiation_rate": {}, "checkout_completion_rate": {}, "order_rate": {}, "exit_rate": {}, "mobile_performance": "", "desktop_performance": "", "page_speed": "", "image_loading": "", "video_performance": "" },
    "sections": [ { "name": "Hero", "purpose": "", "effectiveness": "", "conversion_contribution": "", "friction": "", "recommendation": "" } ],
    "copy_analysis": { "headline": "", "subheadline": "", "benefits": "", "product_description": "", "pain_points": "", "objections": "", "trust": "", "social_proof": "", "reviews": "", "guarantee": "", "cta": "", "urgency": "", "offer": "", "message_match": "", "message_mismatch": "", "strongest_selling_angle": "", "weakest_section": "", "missing_information": "", "trust_gaps": "" }
  },
  "message_match": { "score_overall": 87, "matches": [ { "item": "AD HOOK → LANDING HEADLINE", "score": 92 } ] },
  "orders": { "kpis": { "leads": {}, "orders": {}, "confirmed_orders": {}, "cancelled_orders": {}, "unreachable_customers": {}, "fake_orders": {}, "duplicate_orders": {}, "cod_confirmation_rate": {}, "confirmation_rate": {}, "cancellation_rate": {}, "preparation_rate": {}, "shipping_rate": {}, "delivery_attempt_rate": {}, "delivered_rate": {}, "refused_rate": {}, "return_rate": {}, "refund_rate": {} } },
  "cod": { "orders": {}, "confirmed": {}, "cancelled": {}, "unreachable": {}, "fake": {}, "shipped": {}, "delivered": {}, "refused": {}, "returned": {}, "real_delivery_conversion_rate": { "value": "55%", "example": "100 orders → 80 confirmed → 70 shipped → 55 delivered" }, "note": "100 purchases does NOT equal 100 successful sales" },
  "delivery": {
    "kpis": { "shipping_cost": {}, "delivery_cost": {}, "avg_delivery_time": {}, "first_attempt_rate": {}, "successful_delivery_rate": {}, "failed_delivery_rate": {}, "refusal_rate": {}, "return_to_origin_rate": {}, "courier_performance": "", "wilaya_performance": "", "city_performance": "", "delivery_time_by_region": "", "delivery_success_by_region": "" },
    "by_region": [ { "wilaya": "", "city": "", "courier": "", "delivery_rate": "", "refusal_rate": "", "return_rate": "", "cost": "", "profitability": "" } ],
    "best_regions": ["..."], "worst_regions": ["..."], "expensive_regions": ["..."], "high_refusal_regions": ["..."], "high_return_regions": ["..."], "fastest_regions": ["..."], "most_profitable_regions": ["..."]
  },
  "customers": { "quality_score": { "value": 0, "basis": "" }, "kpis": { "new_customers": {}, "returning_customers": {}, "repeat_purchase_rate": {}, "avg_order_value": {}, "cac": {}, "ltv": {}, "refund_rate": {}, "return_rate": {}, "cancellation_rate": {}, "refusal_rate": {}, "support_contacts": {}, "complaint_rate": {}, "satisfaction": {}, "review_rate": {} } },
  "returns": { "kpis": { "returned_orders": {}, "refunded_orders": {}, "return_rate": {}, "refund_rate": {}, "return_cost": {}, "refund_cost": {} } },
  "profitability": {
    "costs": { "product_cost": {}, "product_sourcing_cost": {}, "shipping_cost": {}, "delivery_cost": {}, "packaging": {}, "payment_fees": {}, "platform_fees": {}, "advertising_spend": {}, "returns": {}, "refunds": {}, "failed_deliveries": {}, "cod_refusal_costs": {}, "customer_service_costs": {}, "discounts": {}, "taxes": {} },
    "gross_profit": {}, "contribution_margin": {}, "net_profit": {}, "net_profit_margin": {}, "profit_per_order": {}, "profit_per_delivered_order": {}, "profit_per_customer": {}, "max_cac": {}, "break_even_cpa": {}, "break_even_roas": {}
  },
  "unit_economics": [ { "product": "", "cost": "", "selling_price": "", "gross_margin": "", "shipping": "", "avg_ad_cost": "", "cac": "", "delivery_cost": "", "return_cost": "", "refund_cost": "", "net_revenue": "", "net_profit": "", "profit_margin": "", "break_even_cpa": "", "max_acquisition_cost": "" } ],
  "audiences": { "segments": [ { "age": "", "gender": "", "location": "", "device": "", "placement": "", "ctr_pct": "", "cpc_usd": "", "cvr_pct": "", "cpa_usd": "", "cac": "", "delivery_rate": "", "return_rate": "", "net_profit": "" } ], "best_audience": "the one with highest NET PROFIT, not lowest CPA" },
  "attribution": { "platform_reported_purchases": {}, "store_purchases": {}, "crm_orders": {}, "confirmed_orders": {}, "delivered_orders": {}, "collected_revenue": {}, "discrepancy_note": "" },
  "creative_fatigue": { "state": "Fresh/Stable/Early fatigue/Fatigued/Dead", "signals": { "ctr_decline": "", "cpm_increase": "", "cpc_increase": "", "frequency_increase": "", "cvr_decline": "", "cpa_increase": "", "roas_decline": "", "engagement_decline": "" }, "recommended_next_test": { "new_hook": "", "new_opening": "", "new_visual": "", "new_angle": "", "new_copy": "", "new_ugc": "", "new_offer": "" } },
  "anomalies": [ { "severity": "🔴 Critical/🟠 Warning/🟢 Healthy", "metric": "", "change": "", "impact": "", "source": "" } ],
  "root_causes": [ { "symptom": "CPA increased 34%", "driver_analysis": "CPM +18%, CTR -12%, CPC +21%, CVR -9%", "primary_cause": "Creative fatigue", "evidence": "", "fix": "" } ],
  "diagnostics": [ { "scenario": "CTR low", "diagnosis": "Creative problem", "evidence": "" } ],
  "bottlenecks": [ { "stage": "", "severity": "🔴/🟠/🟢", "impact": "", "action": "" } ],
  "winners": [ { "type": "Product/Campaign/Ad/Creative/Hook/Copy/Audience/Region", "name": "", "metric": "", "why_it_wins": "" } ],
  "losers": [ { "type": "", "name": "", "metric": "", "why_it_loses": "" } ],
  "stop": ["..."], "fix": ["..."], "scale": ["..."], "test": ["..."],
  "scores": { "creative": 0, "hook": 0, "copy": 0, "offer": 0, "landing_page": 0, "ad": 0, "audience": 0, "conversion": 0, "customer_quality": 0, "delivery": 0, "profitability": 0, "scalability": 0, "overall": 0 },
  "recommendations": ["3-7 prioritized, with numbers and costs"]
}`;
      } else if (skill.type === 'ad_kpi_analyzer') {
        schemaString = `Return ONLY a valid JSON object matching this structure exactly (do not wrap in markdown): a senior media buyer report. Every level from the upstream AdSet & Ad Table MUST have a row. NEVER invent numbers — use "Not available" if a metric is missing.
{
  "executive_summary": { "priority_1": "what to SCALE / what to KILL this week", "budget_plan": "where the budget goes if we follow the recommendations", "main_alert": "the key alert to watch" },
  "summary": { "total_spend": "", "avg_ctr_pct": "", "avg_cpm_usd": "", "avg_cpc_usd": "", "avg_cvr_pct": "", "avg_cpa_usd": "", "avg_roas": "2.0", "trend_period": "current period vs previous period compared", "top_kpi_insight": "headline finding with numbers" },
  "levels": [
    { "level": "Campaign / Ad Set / Ad", "name": "Name from the table",
      "kpis": { "ctr_pct": "", "cpm_usd": "", "cpc_usd": "", "cvr_pct": "", "cpa_usd": "", "roas": "", "spend_usd": "", "results": "", "frequency": "" },
      "trend": { "ctr_pct": "↑/↓/→", "cpm_usd": "↑/↓/→", "cpc_usd": "↑/↓/→", "cvr_pct": "↑/↓/→", "cpa_usd": "↑/↓/→", "roas": "↑/↓/→" },
      "kpi_status": [ { "kpi": "CTR", "value": "1.9%", "benchmark": "1.2-3% (sector/context)", "status": "GOOD / OK / BAD / CRITICAL", "why": "why this KPI is good or not good in this context", "fix": "exact thing to change to improve it" } ],
      "healthy_kpis": ["kpi names that beat benchmark"], "weak_kpis": ["kpi names below benchmark"],
      "verdict": "SCALE / TEST / PAUSE / KILL",
      "confidence": "High / Medium / Low (based on data volume, see significance rule; below 50 conversions or 3-4 stable days => Low + say data insufficient and let it run X days)",
      "diagnostic": "root cause of the KPI movement (fatigue / auction / landing page / AOV...)",
      "action": "numbered action: exact new budget amount, +%, scale rule respected (+20-30% max every 2-3 days), re-evaluation at D+X, where the budget is reallocated",
      "risk": "what to watch in the next 3-5 days", "why": "" }
  ],
  "winners": [ { "name": "", "metric": "", "why_it_wins": "" } ],
  "losers": [ { "name": "", "metric": "", "why_it_loses": "" } ],
  "fatigue_risks": [ { "name": "", "signals": "CTR drop / CPM up / frequency up / CVR down" } ],
  "audience_overlap": [ { "audiences": "Broad + Lookalike + Retargeting", "risk": "cannibalization risk", "exclusions": "suggested exclusions if needed" } ],
  "scaling_candidates": [ { "name": "", "plan": "exact next budget step" } ],
  "actions": [ { "type": "STOP / FIX / SCALE / TEST", "what": "concrete action with figures" } ],
  "recommendations": ["3-7 prioritized recommendations with numbers"]
}`;
      } else if (skill.type === 'fb_ads_performance_engine') {
        schemaString = `Return ONLY a valid JSON object matching this structure exactly (do not wrap in markdown): a Facebook Ads ACTION ENGINE report built from the upstream AdSet & Ad Table. Every campaign, ad set and ad from the table MUST have a row. NEVER invent numbers — use "Not available" if a metric is missing. Answer "WHAT SHOULD I DO NOW?" not just "WHAT HAPPENED?". Use precise orders: "Launch 2 new hooks for Ad X", "Keep Ad Y unchanged", "Push Ad Z at 10% for 2 days", "Do not push Ad A (enough spend, poor purchase conversion)", "Reduce budget on Ad Set B". Never generic advice.
{
  "data_quality": { "flag": "DATA_INSUFFICIENT / LOW_SAMPLE / RELIABLE / HIGH_CONFIDENCE", "issues": [ { "issue": "missing/zero/suspicious/duplicate/insufficient spend/insufficient impressions/paused/learning", "impact": "what it limits" } ], "missing": ["list of unavailable KPIs that limit diagnosis"] },
  "executive_summary": { "account_health": "one line overall", "main_problem": "", "main_opportunity": "", "most_important_action": "exact action to do now" },
  "top_actions": [ { "priority": "P0/P1/P2/P3", "action": "exact action", "why": "evidence-based reason" } ],
  "campaign_analysis": [ { "name": "", "status": "WINNER/HEALTHY/WATCH/WEAK/INSUFFICIENT_DATA", "spend": "", "cpa": "", "roas": "", "bottleneck": "A Delivery / B Creative / C Hook / D Audience / E Offer / F Landing / G Checkout / H Tracking / I Budget / J Scaling", "diagnosis": "why it performs this way", "action": "exact action with numbers" } ],
  "adset_analysis": [ { "name": "", "campaign": "", "audience": "", "status": "WINNER/HEALTHY/WATCH/WEAK/INSUFFICIENT_DATA", "spend": "", "cpa": "", "roas": "", "main_issue": "strongest/weakest, saturation, frequency, placement, geo/demo, high CTR low conversion vs high conversion audiences", "action": "" } ],
  "ad_analysis": [ { "name": "", "adset": "", "status": "WINNER / PROMISING / TESTING / WEAK / FATIGUED / INSUFFICIENT_DATA", "creative_type": "", "format": "", "spend": "", "ctr": "", "cpc": "", "cpa": "", "roas": "", "funnel_issue": "largest drop-off stage + cause (hook/creative, click quality/load, landing/offer/product, checkout/trust/shipping/price, payment/COD)", "diagnosis": "include winning/weak hook, angle, CTA, format; analyze the copy text if available", "action": "" } ],
  "push_delivery_recommendations": [ { "ad": "", "campaign": "", "current_spend": "", "current_delivery": "", "recommendation": "PUSH / DO_NOT_PUSH", "suggested_percentage": "e.g. 10%", "suggested_duration": "e.g. 2 days", "estimated_daily_test_budget": "e.g. $2.50 (respect existing campaign budget)", "reason": "", "success_criteria": "", "stop_condition": "" } ],
  "winners": [ { "name": "", "evidence": "", "action": "KEEP/SCALE/DUPLICATE (never scale from one good day; purchase winners judged on purchases, CPA, ROAS, purchase rate, sample size)" } ],
  "losers": [ { "name": "", "evidence": "why it loses with data" } ],
  "test_plan": [ { "what": "exact test (e.g. 2 new hooks for Ad X)", "why": "", "budget": "", "duration": "", "success_metric": "", "stop_condition": "" } ],
  "budget_action_plan": { "current": "", "recommended": "", "reason": "" },
  "next_48_hours": ["exact actions with numbers and names"],
  "next_7_days": ["strategic actions"],
  "recommendations": ["3-7 prioritized recommendations with numbers"]
}`;
      } else if (skill.type === 'breakdown_intelligence') {
        schemaString = `Return ONLY a valid JSON object matching this structure exactly (do not wrap in markdown): a Meta Ads BREAKDOWN INTELLIGENCE report built from the upstream breakdown rows. Every important segment must have a row. NEVER invent numbers — use "Not available". Never declare a winner from the lowest CPA alone (a $3 CPA with 1 purchase is not a winner vs a $6 CPA with 50 purchases): weigh volume, spend, reliability, CPA, ROAS, revenue. Never decide from tiny samples. Compare segments within the same campaign/optimization event/date range only.
{
  "breakdown_summary": { "top_opportunities": ["1.", "2.", "3."], "main_inefficiencies": ["1.", "2.", "3."] },
  "segment_data": [ { "breakdown_type": "AGE/GENDER/LOCATION/PLACEMENT/PLATFORM/DEVICE/OS/TIME/DAY/AUDIENCE", "segment": "e.g. 25-34, Female, Paris, Mobile, Facebook Feed, 20h-23h, Monday", "spend": "", "purchases": "", "cpa": "", "roas": "", "share_of_spend_pct": "", "share_of_purchases_pct": "", "classification": "HIGH_VALUE_SEGMENT / PROMISING_SEGMENT / AVERAGE_SEGMENT / WEAK_SEGMENT / INEFFICIENT_SEGMENT / INSUFFICIENT_DATA", "diagnosis": "evidence-based why (include confidence INSUFFICIENT_DATA/EARLY_SIGNAL/RELIABLE/HIGH_CONFIDENCE)", "action": "exact action (SCALE/REDUCE/SEPARATE/CREATE_DEDICATED_ADSET/CHANGE_CREATIVE/CHANGE_HOOK/CHANGE_COPY/CHANGE_OFFER/CHANGE_LANDING_PAGE/EXCLUDE_TEST/TEST/BUDGET_FLAG…) with numbers", "confidence": "" } ],
  "budget_opportunities": [ { "segment": "", "detail": "segments deserving more exposure with numbers" } ],
  "budget_drain": [ { "segment": "", "detail": "segments consuming meaningful spend without sufficient results, with numbers" } ],
  "test_opportunities": [ { "segment": "", "detail": "segments to test separately (dedicated ad set / dedicated creative) with numbers" } ],
  "top_actions": ["exact actions, e.g. \"Create a dedicated creative variation for the 25-34 segment\", \"Reduce exposure on Paris\", numbers included"],
  "next_48_hours": ["immediate actions"],
  "next_7_days": ["follow-up actions"],
  "recommendations": ["3-7 prioritized recommendations with numbers"]
}`;
      } else if (skill.type === 'facebook_ads_scaling_system') {
        schemaString = `Return ONLY a valid JSON object matching this structure exactly (do not wrap in markdown): the Facebook Ads Scaling & Creative Testing System report built from the upstream AdSet & Ad Table. Never judge an ad on CTR alone — evaluate the full funnel (spend, purchases, CPA vs AOV, ROAS, profit, volume). Never kill ads with insufficient data (classify them INSUFFICIENT DATA). Never declare a winner from tiny samples. For COD ecommerce distinguish PURCHASE CPA from DELIVERED CUSTOMER ACQUISITION COST (confirmation/delivery/refusal rates, profit per delivered order). The next_7_day_test_plan MUST contain 4-6 concepts, each with its variations_count between 3 and 5, one full hypothesis, hook ideas and visual ideas specific to the product — never generic. Never invent data — use "Not available".
{
  "account_structure": { "current_structure": "", "campaign_count": "", "adset_count": "", "cbo_abo": "CBO / ABO / Mixed", "audience_structure": "", "problems": [], "simplification_opportunities": [], "complexity_score": "LOW_COMPLEXITY / MODERATE_COMPLEXITY / HIGH_COMPLEXITY" },
  "performance": { "spend": "", "purchases": "", "cpa": "", "aov": "", "roas": "", "profit": "", "conversion_rate": "", "cod_metrics": { "confirmation_rate": "", "delivery_rate": "", "refusal_rate": "", "cost_per_delivered_order": "", "revenue_per_delivered_order": "", "profit_per_delivered_order": "" } },
  "creative_testing": { "concepts_tested": "", "creatives_tested": "", "new_concepts_this_week": "", "winners": "", "potential_winners": "", "losers": "", "high_cpa": "", "insufficient_data": "" },
  "creative_matrix": [ { "concept": "", "hook": "", "angle": "", "visual": "", "offer": "", "spend": "", "purchases": "", "cpa": "", "aov": "", "roas": "", "profit": "", "status": "WINNER / POTENTIAL WINNER / STABLE / INSUFFICIENT DATA / LOSER / HIGH-SPEND LOSER / HIGH-CPA / LOW-VOLUME / NEEDS RETEST" } ],
  "winning_dna": { "concept": "", "hook": "", "angle": "", "visual": "", "offer": "", "product": "", "audience": "", "landing_page": "", "reason_it_won": "" },
  "hero_product": { "product": "", "classification": "HERO / SECONDARY / UPSELL / CROSS-SELL / LOW PRIORITY", "revenue": "", "purchases": "", "profit": "", "aov": "", "delivery_quality": "" },
  "hero_offer": { "offer": "", "is_hero": "yes/no", "perceived_value": "", "aov_impact": "", "cpa_impact": "", "profit_impact": "", "conversion_impact": "", "repeat_purchase_impact": "" },
  "next_7_day_test_plan": [ { "concept": "one creative Concept", "hypothesis": "one clear hypothesis", "hooks": ["hook ideas"], "visuals": ["visual executions"], "angle": "", "offer": "", "awareness_stage": "UNAWARE / PROBLEM_AWARE / SOLUTION_AWARE / PRODUCT_AWARE / MOST_AWARE", "variations_count": "3 to 5" } ],
  "scaling_plan": { "scale": ["controlled moves with numbers"], "iterate": ["new variations of winning concept"], "hold": ["stable, don't touch"], "retest": ["kill candidates to retest with better data"], "kill": ["actual losers"] },
  "creative_fatigue": [ { "creative": "", "state": "FRESH / STABLE / FATIGUED / DECLINING / DEAD", "evidence": "", "action": "" } ],
  "key_learnings": ["patterns learned from the data"],
  "next_actions": ["exact actions the media buyer should take next"],
  "recommendations": ["3-7 prioritized recommendations with numbers"]
}`;
      } else if (skill.type === 'ugc_creative_prompt_generator') {
        schemaString = `Return ONLY a valid JSON object matching this structure exactly (do not wrap in markdown): a UGC Creative Prompt Generator report for the REAL product from the connected group. The 5 concepts MUST be genuinely different (different angle, creator, hook, story, objection, setting, awareness) — never near-identical ads. EVERY concept MUST contain its "videos" array with 3-4 short video versions, EACH one ~10 seconds and genuinely different from the others (different hook line, different opening moment, different demonstration shot, different CTA). Each video entry includes its complete ~10s script, a compact shot_list (2-4 short shots), a complete production-ready 9:16 ai_video_prompt (dense ~90-120 words: creator appearance, age, clothing, location, lighting, camera, movement, framing, product handling, spoken dialogue, background sounds, one scene change max, 10 seconds), caption, primary_text, headline and recommended_cta. Never generic UGC, never invented product facts — mark assumptions. Never declare a winner before performance data exists.
{
  "summary": { "product": "THE REAL product from the connected group", "angle": "", "market": "", "primary_awareness_stage": "UNAWARE / PROBLEM_AWARE / SOLUTION_AWARE / PRODUCT_AWARE / MOST_AWARE", "recommended_direction": "one clear direction with reasoning" },
  "concepts": [ { "concept_name": "", "ugc_angle": "Problem→Solution / Product Discovery / First Reaction / Honest Review / Before→After / Unboxing / Demonstration / I Didn't Expect This / TikTok Made Me Buy It / Comparison / Alternative / Common Mistake / Daily-Life Integration / Test / Testimonial / Objection Killer / Price Revelation / Gift / Expert Explainer / Story-Based", "awareness_level": "", "target_audience": "", "customer_problem": "", "customer_desire": "", "main_objection": "", "emotional_trigger": "", "creator_profile": { "age": "", "gender": "", "appearance": "", "clothing": "", "personality": "", "environment": "", "lifestyle": "", "speaking_style": "", "why_uses_product": "" }, "location": "", "story": "", "product_demonstration": "", "key_benefit": "", "videos": [ { "version": "Video 1", "duration": "10 seconds", "hook": "", "script": "complete ~10s spoken script", "shot_list": [ { "scene": "", "visual": "", "camera_angle": "", "action": "", "dialogue": "", "on_screen_text": "", "product_visibility": "" } ], "ai_video_prompt": "complete ~100-word 9:16 prompt for this single 10s clip", "caption": "", "primary_text": "", "headline": "", "recommended_cta": "" } ] } ],
  "testing_matrix": [ { "concept": "", "hook": "", "angle": "", "awareness": "", "main_emotion": "", "objection": "", "visual_style": "" } ],
  "hook_variables": ["hooks to test"],
  "creative_variables": ["visual/story elements to test"],
  "message_variables": ["customer motivations to test"],
  "offer_variables": ["offers to test"],
  "performance_learnings": ["patterns from historical ad data, if provided"],
  "next_steps": ["what to generate/try next"]
}`;
      } else if (skill.type === 'meta_ads_scaling_system') {
        schemaString = `Return ONLY a valid JSON object matching this structure exactly (do not wrap in markdown): a profit-first Meta Ads Scaling & Creative Testing report built from the upstream AdSet & Ad Table and any business/COD inputs. Optimize for PROFITABLE DELIVERED ORDERS / REAL BUSINESS PROFIT, never Meta Purchase CPA alone. Never from one day of data (use the 7-day window); never kill on one bad day; never declare a winner by CTR alone; never scale aggressively when delivery quality deteriorates; never invent data — use "Not available". Every creative in the tables gets a status (IDEA / IN PRODUCTION / TESTING / EARLY SIGNAL / WINNER / EXPANSION / FATIGUED / ARCHIVED / LOSER).
{
  "account_diagnosis": { "current_structure": "", "main_problems": [], "unnecessary_complexity": [], "targeting_issues": [], "offer_issues": [] },
  "campaign_architecture": [ { "campaign": "Main product / Offer & Bundle / Influencer / Catalog retargeting (~10% max) / Short-term sales", "purpose": "", "ad_sets": [], "creative_concepts": [], "budget_split": "" } ],
  "creative_testing_plan": [ { "concept_id": "e.g. GARMIN-PROBLEM-GPS-001", "concept": "the marketing idea", "angle": "Problem / Benefit / Founder Story / US vs THEM / Review / Before After / Podcast / Demo / Objection / Offer", "hooks": [], "formats": ["static image / UGC video / founder video / animation / product demo"], "headline": "", "cta": "", "brief": "short production brief" } ],
  "scaling_decisions": [ { "campaign": "", "decision": "KEEP / SCALE / HOLD / REDUCE / PAUSE CANDIDATE / TEST MORE", "reason": "", "supporting_metrics": "" } ],
  "winner_expansion": [ { "creative_id": "", "concept_id": "", "winning_components": { "hook": "", "angle": "", "visual": "", "offer": "", "message": "", "proof": "", "cta": "" }, "variations": ["Variation 1: ...", "3-10 controlled variations"] } ],
  "fatigue": [ { "creative_id": "", "indicators": [], "detected": "yes/no", "action": "" } ],
  "profit_analysis": { "meta_cpa": "", "delivered_cpa": "", "real_revenue": "", "real_profit": "", "profit_margin": "", "confirmation_rate": "", "delivery_rate": "", "refusal_rate": "" },
  "cpa_targets": [ { "campaign": "Main / Bundle / Influencer / Limited offer", "target_cpa": "", "aov": "", "basis": "" } ],
  "dashboard": { "campaign_level": [ { "campaign": "", "spend": "", "purchases": "", "revenue": "", "cpa": "", "roas": "", "profit": "", "profit_margin": "", "trend_7d": "" } ], "creative_level": [ { "creative_id": "", "concept_id": "", "angle": "", "spend": "", "purchases": "", "cpa": "", "revenue": "", "profit": "", "ctr": "", "status": "IDEA / IN PRODUCTION / TESTING / EARLY SIGNAL / WINNER / EXPANSION / FATIGUED / ARCHIVED / LOSER" } ], "cod_level": { "orders": "", "confirmed": "", "shipped": "", "delivered": "", "refused": "", "delivery_rate": "", "delivered_cpa": "", "net_profit": "" } },
  "next_actions": ["prioritized exact actions the media buyer should take"],
  "recommendations": ["3-7 prioritized recommendations with numbers"]
}`;
      } else if (skill.type === 'meta_daily_decision_flow') {
        schemaString = `Return ONLY a valid JSON object matching this structure exactly (do not wrap in markdown): a Meta Ads daily decision-flow report that decides where the account sits on the daily decision tree and lights up the current path. Use the upstream AdSet & Ad Table and any business/COD inputs. Rules: evaluate on the 7-DAY AVERAGE, never one day (do not overreact to one bad day); compare against targets (CPA ≤ target, cost/session ≤ target, cost/ATC ≤ target, cost/checkout ≤ target, delivery rate ≥ target, profit ≥ target, traffic quality acceptable); ON TARGET → INCREASE BUDGET +10-20% then monitor next 7 days; BELOW TARGET → WAIT 24-48h, RE-CHECK, STILL BELOW TARGET → DECREASE BUDGET -10-20%, recovered → KEEP CURRENT BUDGET, then monitor and loop; high-AOV: never rely on Ads Manager attributed ROAS alone — evaluate ATC → checkout → purchase → revenue → profit; never auto-kill on frequency — check fatigue signals (frequency, CTR/CPC/CPM/CPA trends, session quality, CVR) and recommend a new creative variation; if bounce/session duration/ATC rate/checkout rate/cost-per-session deteriorate, investigate platform/tracking/website issues BEFORE budget changes. Never invent data — use "Not available". The summary MUST start with one of exactly: "ON TARGET — ", "BELOW TARGET — ", "STILL BELOW TARGET — ", "RECOVERED — " or "NO DATA — ".
{
  "summary": "ON TARGET / BELOW TARGET / STILL BELOW TARGET / RECOVERED / NO DATA — one-line status + the path + primary metric values",
  "keyPoints": [ "path taken in flow node order (e.g. collect → avg7d → compare → decision → inc_budget → monitor_a)", "budget_action (INCREASE +10-20% / DECREASE -10-20% / KEEP / WAIT)", "primary 7-day metric values used", "high_aov_note", "fatigue_and_traffic_flags" ],
  "recommendations": ["concrete next actions with numbers"]
}`;
      } else if (skill.type === 'bid_cap_analyzer') {
        schemaString = `Return ONLY a valid JSON object matching this structure exactly (do not wrap in markdown): a Meta Ads BID STRATEGY report for the campaign/ad set from the upstream data. NEVER invent data. NEVER guarantee a CPA — a Bid Cap is an auction bidding constraint, not a CPA target; actual CPA can be below, around, or above the cap. Base the starting cap on the actual historical CPA (use a range when uncertain), never on the lowest observed CPA (outlier risk).
{
  "bid_strategy_diagnosis": { "optimization_goal": "purchase/lead/ATC/LPV/traffic/engagement", "current_strategy": "Lowest Cost / Cost Cap / Bid Cap", "current_cpa": "", "historical_cpa": "", "purchase_volume": "", "delivery_status": "", "class": "BID_CAP_RECOMMENDED / BID_CAP_WORTH_TESTING / BID_CAP_NOT_RECOMMENDED / INSUFFICIENT_DATA" },
  "recommendation": { "strategy": "Highest volume / Lowest cost / Cost Cap / Bid Cap", "bid_cap": "e.g. $8-$10 (range when uncertain)", "confidence": "High/Medium/Low", "reason": "evidence-based explanation" },
  "delivery_risk": "LOW / MEDIUM / HIGH",
  "test_plan": { "budget": "", "duration": "", "starting_cap": "", "success_metric": "CPA within target range while maintaining acceptable conversion volume", "warning": "spend falls sharply / delivery collapses", "stop_condition": "delivery insufficient or purchase volume collapses" },
  "adjustment_rules": ["If performance improves: ...", "If CPA rises: ...", "If delivery drops: ...", "If purchases collapse: ...", "If CPA too high + healthy delivery: bid cap alone won't fix it — investigate creative, audience, offer, landing page, funnel", "If ROAS strong + volume strong: controlled scaling, don't aggressively tighten"],
  "final_action": "exact action the advertiser should take NOW",
  "recommendations": ["3-5 prioritized recommendations with numbers"]
}`;
      } else if (skill.type === 'image_ad_concept_generator') {
        schemaString = `Return ONLY a valid JSON object matching this structure exactly (do not wrap in markdown): an Image Ad Concept & Creative Prompt Engine report for the product using the UPSTREAM product/customer/competitor intelligence. Never invent product facts. NEVER output generic prompts like "Create a professional ad for this product" — every prompt must have full visual detail. Keep the product shape/colors/branding exact (no invented features). Aspect ratio 4:5 default. Distinct concepts (Warning Ad, This is Not an Ad, US vs Them, News Ad, Post Note, Before/After, Problem/Solution, Screenshot...) — NOT just variations of the same idea.
MANDATORY: selected_concepts must contain 4-5 concepts and EVERY concept MUST include at least one complete image_prompts entry (variation A with full prompt) and its clean_image_prompt. A concept without a prompt is NEVER acceptable. If the output gets too long, reduce to 4 concepts but NEVER drop prompts. Other variations (B/C/D) go in the short "variations" array (label + trigger + what changes), not in image_prompts.
COMPACTNESS: write each image prompt DENSE — maximum ~130 words (details in short packed phrases, no filler). Always include: subject, exact product appearance, scene, composition, camera angle, lighting, background, colors, exact text placement, style, aspect ratio 4:5, negative list.
{
  "creative_strategy": { "product": "THE REAL product from the connected group", "target_audience": "", "market": "", "primary_awareness_stage": "UNAWARE / PROBLEM_AWARE / SOLUTION_AWARE / PRODUCT_AWARE / MOST_AWARE", "main_customer_desire": "", "main_pain_point": "", "main_objection": "", "recommended_creative_direction": "one clear direction with reasoning" },
  "selected_concepts": [ { "name": "e.g. Warning Ad", "type": "WARNING / NOT_AN_AD / US_VS_THEM / NEWS / POST_NOTE / PROBLEM_SOLUTION / BEFORE_AFTER / PRODUCT_IN_USE / TESTIMONIAL / SCREENSHOT / CHECKLIST / ...", "awareness_stage": "", "primary_angle": "", "secondary_angle": "", "why_this_concept_fits": "product-specific reasoning grounded in the connected product", "hook": "", "headline": "", "supporting_copy": "", "cta": "", "visual_idea": "", "test_priority": "High / Medium / Low", "image_prompts": [ { "variation": "A", "emotional_trigger": "fulfillment/curiosity/avoidance/desire/unexpected...", "prompt": "COMPLETE dense copy-ready image prompt (~130 words): subject, product exact appearance, scene, composition, camera angle, framing, product position, human/hands, props, lighting, shadows, background, color direction, exact text placement (top/center/bottom) and text, typography area, visual hierarchy, professional advertising style, aspect ratio 4:5, realism, quality, DO-NOT list" } ], "variations": [ { "variation": "B", "emotional_trigger": "", "change": "what changes vs A in short form" } ], "clean_image_prompt": "version leaving empty text areas to add in Canva/Figma" } ],
  "creative_test_plan": { "test_batch_1": [ { "concept": "", "variations_count": 3, "main_hypothesis": "", "tested_variable": "hook/visual/angle/emotional trigger" } ], "test_batch_2": [ { "concept": "", "why_later": "" } ] },
  "test_matrix": [ { "concept": "", "angle": "", "hook": "", "visual": "", "awareness_stage": "", "priority": "" } ],
  "next_steps": ["ordered steps: copy concept, copy headline, paste prompt, generate image, add text if needed, launch as Meta ad, compare against other concepts"],
  "recommendations": ["3-7 prioritized, each with numbers where relevant"]
}`;
      } else if (skill.type === 'cinematic_storyboard_director') {
        schemaString = `Return ONLY a valid JSON object matching this structure exactly (do not wrap in markdown). YOU MUST RETURN EXACTLY 3 DISTINCT IDEAS IN THE 'ideas' ARRAY.
{
  "ideas": [
    {
      "title": "Title of the storyboard",
      "marketingMethod": "The marketing method used and a 1-sentence explanation why",
      "hookLine": "The hook used in the first 2 seconds",
      "beatMap": "Summary of how the method maps to the segments (e.g. Seg1=Problem, Seg2=Agitate, Seg3=Solution)",
      "masterPrompt": "The Master Storyboard Prompt containing the character lock, product lock, and continuity rules.",
      "segments": [
        {
          "segmentName": "e.g. Segment 1 (0:00 - 0:10)",
          "timeRange": "0:00 - 0:10",
          "startFrame": "Exact description of the first frame",
          "segmentPrompt": "The precise AI video generation prompt for these exact 10 seconds",
          "voiceover": "The voiceover script spoken during these 10 seconds",
          "onScreenText": "Big captions, max 5 words",
          "sfx": "Sound effects (whoosh, click, etc) and music energy note",
          "endFrame": "Exact description of the last frame",
          "extendPrompt": "One sentence continuing the action for seamless extension",
          "trimNote": "Trim instructions for the jump cut"
        }
      ],
      "cta": "The final call to action text",
      "checklist": ["continuity matches at every boundary", "timings add up", "character & product locks present"]
    }
  ]
}`;
      } else if (ADVANCED_PRODUCT_SCHEMA_STRINGS[skill.type]) {
        schemaString = ADVANCED_PRODUCT_SCHEMA_STRINGS[skill.type];
      }
      // 4. Execute
      const res = await fetch("/api/ai/execute-node", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, skillId: skill.type, schemaString })
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.rawOutput) {
          setSkills(prev => prev.map(s => s.id === skillId ? { ...s, status: 'done', result: data.rawOutput, isExpanded: true } : s));
          return;
        }
        throw new Error(data.error || "Failed to generate");
      }

      setSkills(prev => prev.map(s => s.id === skillId ? { ...s, status: 'done', result: data.result, lastPrompt: prompt, lastSchema: schemaString } : s));
    } catch (err) {
      setSkills(prev => prev.map(s => s.id === skillId ? { ...s, status: 'error', error: err.message } : s));
    }
  };

  // [F_handleAnalyzeProduct] Analyzes a standalone product card (runs autonomous_product_researcher).
  const handleAnalyzeProduct = async (spId) => {
    const sp = standaloneProducts.find(p => p.id === spId);
    if (!sp) return;

    setStandaloneProducts(prev => prev.map(p => p.id === spId ? { ...p, status: 'running', error: null, result: null } : p));

    try {
      const prompt = `Conduct a highly detailed product research analysis on the following product:\nName: ${sp.product.name}\nDescription: ${sp.product.description}\nPrice: ${sp.product.price}\nSupplier: ${typeof sp.product.supplier === 'object' ? JSON.stringify(sp.product.supplier) : sp.product.supplier}\n\nProvide key points and recommendations.`;
      const schemaString = `Return a JSON object with this exact structure: { "keyPoints": ["point 1", "point 2", "point 3"], "recommendations": ["rec 1", "rec 2"] }`;

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

  // [F_registerProductPort] Records each product port's canvas coordinates (used for connection endpoints).
  // Depends on [pan, zoom] so positions use CURRENT pan/zoom (refs are updated only after commit and would be stale).

  // Product port positions are tracked via ref callbacks on each render - no useEffect needed
  // Helper used in ProductNode via a ref callback - registers canvas position of the port
  const registerProductPort = useCallback((el, productId) => {
    if (!el || !containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const portRect = el.getBoundingClientRect();
    productPortPositions.current[productId] = {
      x: (portRect.left + portRect.width / 2 - containerRect.left - pan.x) / zoom,
      y: (portRect.top + portRect.height / 2 - containerRect.top - pan.y) / zoom,
    };
  }, [pan, zoom]);


  useEffect(() => { zoomRef.current = zoom; }, [zoom]);
  useEffect(() => { panRef.current = pan; }, [pan]);

  // [F_DelKey] Delete/Backspace removes the selected connection or drawn shape.
  useEffect(() => {
    const onKey = (e) => {
      const t = e.target;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedConnection != null) {
          setConnections(prev => prev.filter((_, idx) => idx !== selectedConnection));
          setSelectedConnection(null);
        }
        if (selectedShapeId) {
          setDrawnShapes(prev => prev.filter(s => s.id !== selectedShapeId));
          setSelectedShapeId(null);
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedConnection, selectedShapeId]);

  // [F_CloseMenu] Closes the right-click menu on outside click / Escape.
  useEffect(() => {
    if (!contextMenu) return;
    const close = () => setContextMenu(null);
    const esc = (e) => { if (e.key === 'Escape') setContextMenu(null); };
    window.addEventListener('click', close);
    window.addEventListener('keydown', esc);
    return () => { window.removeEventListener('click', close); window.removeEventListener('keydown', esc); };
  }, [contextMenu]);

  // [F_CloseNodeMenu] Closes the skill-node right-click menu on outside click / Escape.
  useEffect(() => {
    if (!nodeMenu) return;
    const close = () => setNodeMenu(null);
    const esc = (e) => { if (e.key === 'Escape') setNodeMenu(null); };
    window.addEventListener('click', close);
    window.addEventListener('keydown', esc);
    return () => { window.removeEventListener('click', close); window.removeEventListener('keydown', esc); };
  }, [nodeMenu]);

  // [F_FlashTimeout] Hides the "Copied!" toast after 1.6s.
  useEffect(() => {
    if (!flashMsg) return;
    const t = setTimeout(() => setFlashMsg(""), 1600);
    return () => clearTimeout(t);
  }, [flashMsg]);

  // [F_NodeCopy] Shared copy action from the right-click menu / parameters buttons.
  const handlerNodeCopy = async (skillId, mode) => {
    const skill = skills.find(s => s.id === skillId);
    if (!skill) return;
    const text = mode === 'code' ? skillToCode(skill) : skillToText(skill);
    const ok = await copyText(text);
    setNodeMenu(null);
    setFlashMsg(ok ? "Copied!" : "Nothing to copy");
  };

  const realProducts = products.filter(p => !p.isPlaceholder);

  useEffect(() => {
    if (groups && containerRef.current) {
      const vw = containerRef.current.clientWidth;
      setPan({ x: vw / 2 - 260, y: 60 });
      setZoom(0.9);
    }
  }, [groups]);

  // [F_handleGenerate] Calls /api/ai/create-ad-groups to build groups via AI.
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
  // [F_onMouseDown] Handles: resize handles, drawing shapes, dragging lines from ports, moving nodes, panning.
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

  // [F_onMouseMove] Updates resize, active shape, drawing line, node dragging, and panning.
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

  // [F_stopPan] Finishes interactions: commits finished shape, creates/drops connections, ends pan.
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
      // Scan ALL stacked elements at the cursor (not just the topmost one) so the drop still
      // lands on a skill node even when a connection line / its dot overlaps it.
      const stacked = document.elementsFromPoint(e.clientX, e.clientY);
      const pickNode = (selector) => {
        for (const el of stacked) {
          const m = el.closest ? el.closest(selector) : null;
          if (m) return m;
        }
        return null;
      };
      const sourceId = drawingRef.current.nodeId;
      const sourceIsSkill = sourceId?.startsWith('skill_');
      const sourceIsGroup = sourceId?.startsWith('group_');

      if (sourceIsSkill) {
        // Dragged FROM a Skill → drop on Group, Product, or another Skill
        const groupNode = pickNode('[data-node-id^="group_"]');
        const productNode = pickNode('[data-product-id]');
        const skillNode = pickNode('[data-skill-node]');

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
        const skillNode = pickNode('[data-skill-node]');
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
  // [F_onWheel] Mouse-wheel zoom toward the cursor position.
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

  // [F_zoomBy] Programmatic zoom by factor around a point (used by zoom +/- buttons).
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

  // [F_fitToScreen] Auto-zooms so all groups fit in the viewport.
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
  // [E_bgStyle] Background theme styles (dots / grid / dark / blueprint) — colors scale with zoom.
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
      {/* ══ [E_CanvasContainer] FIXED FULL-SCREEN CANVAS — the main interactive background.
          Handles mousedown/move/up for panning & dragging, wheel-zoom, right-click menu, and dropping skills. */}
      <div
        ref={containerRef}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={stopPan}
        onMouseLeave={stopPan}
        onWheel={onWheel}
        onContextMenu={(e) => {
          e.preventDefault();
          setContextMenu({ x: e.clientX, y: e.clientY });
        }}
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
          cursor: panning ? "grabbing" : (cursorMode === 'hand' ? "grab" : "default"),
          overflow: "hidden",
          userSelect: "none",
        }}
      >
        {/* Canvas layer — all content lives here and is transformed */}
        {/* ══ [E_CanvasLayer] Transformed layer — all canvas content translates/scales with pan & zoom. */}
        <div style={{
          position: "absolute", top: 0, left: 0,
          transform: `translate(${pan.x}px,${pan.y}px) scale(${zoom})`,
          transformOrigin: "0 0",
          willChange: "transform",
        }}>

          {/* ══ [E_DrawnShapes] Drawn Background Shapes (HTML divs) — selectable, resizable with handles. */}
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

          {/* ══ [E_ActiveShapePreview] Live preview while dragging to draw a rectangle/circle. */}
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

          {/* ══ [E_ConnectionSVG] SVG layer: org-chart lines (head→groups→adsets) + interactive skill connections.
              Interactive connections are clickable to select; Delete removes them. */}
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
                  <g key={`conn_${i}`} onClick={() => setSelectedConnection(isSelected ? null : i)} style={{ pointerEvents: 'auto' }}>
                    {/* Wide invisible hit area */}
                    <path d={d} stroke="transparent" strokeWidth="24" fill="none" style={{ cursor: 'pointer', pointerEvents: 'stroke' }} />
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

          {/* ══ [E_HeadNode] AD HEAD node — the big title card at the top-left of the canvas. Draggable. */}
          <div data-node-id="head" style={{ position: "absolute", left: positions.head?.x || 0, top: positions.head?.y || 0, display: "flex", flexDirection: "column", alignItems: "center", width: 520, cursor: draggingRef.current === "head" ? "grabbing" : "grab" }}>
            <div style={{ background: "#fff", border: "1.5px solid #c8d3db", borderRadius: 16, padding: "22px 30px", width: "100%", textAlign: "center", boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
              {/* ══ [E_HeadTitle] "AD HEAD" label + "ALGERIA AD TESTING" title. */}
              <div style={{ fontSize: 9, fontFamily: "monospace", textTransform: "uppercase", letterSpacing: 1.5, color: "#94a3b8", marginBottom: 10 }}>AD HEAD</div>
              <div style={{ fontSize: 24, fontWeight: 900, color: "#1a2332", marginBottom: 5, letterSpacing: -.5, display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                <DynamicIcon name="Map" size={24} color="#16a34a" />
                <span>ALGERIA AD TESTING</span>
              </div>
              <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.6, marginBottom: groups ? 14 : 0 }}>
                {groups ? `${groups.length} niche groups · ${totalGrouped} products · ${highCount} high priority`
                  : "smart niche grouping · one campaign per group · find winning products"}
              </div>
              {/* ══ [E_HeadStats] 3 stat chips: TOTAL GROUPS / HIGH PRIORITY / PRODUCTS PER GROUP. */}
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
              {/* ══ [E_HeadHowTo] "HOW TO USE" box with 1-campaign-per-group instructions. */}
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

          {/* ══ [E_GroupNodes] Group cards + their ad set cards (when expanded). Draggable via GroupCard header. */}
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

                {/* ══ [E_AdSetNodes] Ad Set cards rendered under an expanded group. */}
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

          {/* ══ [E_StandaloneTable] Standalone "Product Master List" table node dropped on canvas. */}
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
                  <div style={{ padding: "0", maxHeight: 600, overflowY: "auto" }} onWheel={e => e.stopPropagation()}>
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

            {/* ══ [E_StandaloneCard] Standalone product card node with Analyze button + result view. */}
            return (
              <div data-node-id={sp.id} key={sp.id} style={{
                position: "absolute", left: sp.x, top: sp.y,
                width: 320, background: "#fff", border: "1px solid #cbd5e1",
                borderRadius: 16, boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
                display: "flex", flexDirection: "column", overflow: "hidden"
              }}>
                {/* ══ [E_StandaloneCard_Port] Port OUT dot (bottom) — drag to a skill to connect. */}
                {/* Port Out dot (bottom) */}
                <div
                  ref={(el) => { if (el) registerProductPort(el, sp.id); }}
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
                        style={{ marginTop: 8, padding: 12, background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0", maxHeight: 380, overflowY: "auto", userSelect: "text", WebkitUserSelect: "text", cursor: "text" }}
                      >
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                          <span style={{ fontSize: 11, fontWeight: 800, color: "#10b981" }}>ANALYSIS RESULT</span>
                          <div style={{ display: "flex", gap: 8 }}>
                            <button onClick={(e) => { e.stopPropagation(); setStandaloneProducts(prev => prev.map(p => p.id === sp.id ? { ...p, isResultExpanded: false } : p)); }} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: 10, fontWeight: 700 }}>HIDE</button>
                            <button onClick={(e) => { e.stopPropagation(); setStandaloneProducts(prev => prev.map(p => p.id === sp.id ? { ...p, status: 'idle', result: null } : p)); }} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: 10, fontWeight: 700 }}>CLEAR</button>
                          </div>
                        </div>
                        <div style={{ fontSize: 12, color: "#475569", lineHeight: 1.5 }}>
                          <ul style={{ paddingLeft: 16, margin: 0, display: "flex", flexDirection: "column", gap: 6 }}>
                            {(sp.result.keyPoints || []).map((kp, i) => <li key={i}>{typeof kp === "object" && kp !== null ? JSON.stringify(kp) : kp}</li>)}
                          </ul>
                          {sp.result.recommendations && sp.result.recommendations.length > 0 && (
                            <>
                              <div style={{ marginTop: 12, marginBottom: 4, fontSize: 11, fontWeight: 800, color: "#f59e0b" }}>RECOMMENDATIONS</div>
                              <ul style={{ paddingLeft: 16, margin: 0, display: "flex", flexDirection: "column", gap: 6 }}>
                                {sp.result.recommendations.map((rec, i) => <li key={i}>{typeof rec === "object" && rec !== null ? JSON.stringify(rec) : rec}</li>)}
                              </ul>
                            </>
                          )}
                        </div>
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

          {/* ══ [E_SkillNodes] Skill (AI analysis) nodes — draggable, with ports, parameters, run button, inline results. */}
          {skills.map((skill) => {
            const isConnected = connections.some(c => c.toId === skill.id || c.fromId === skill.id);
            const incomingCount = connections.filter(c => c.toId === skill.id).length;
            const needsMulti = !!ADVANCED_PRODUCT_MULTI_NODE[skill.type];
            const needsCountry = skill.type === 'product_sourcing_compliance';
            const paramsOk = needsMulti ? incomingCount >= 2 : isConnected;
            const anyManual = (skill.questions || []).some(q => q && q.trim()) || !!skill.instructions || !!skill.companyName || skill.type === 'website_preview' || !!METHOD_CHAPTERS[skill.type];
            const canRun = (paramsOk || anyManual) && (!needsCountry || !!skill.targetCountry);
            return (
              <div data-skill-node={skill.id} key={skill.id}
                onContextMenu={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setNodeMenu({ x: e.clientX, y: e.clientY, skillId: skill.id });
                }}
                style={{
                position: "absolute", left: skill.x, top: skill.y,
                width: skill.type === 'landing_page_builder' && (skill.isExpanded || skill.status === 'running') ? 1120
                  : (skill.isExpanded && (skill.type === 'facebook_ads_testing' || skill.type === 'buyer_persona_testing')) ? "max-content"
                    : (skill.isExpanded && skill.type === 'adset_table_generator') ? "min(1180px, calc(100vw - 70px))"
                    : (skill.isExpanded && skill.type === 'campaign_analyzer') ? "min(1100px, calc(100vw - 70px))"
                    : (skill.isExpanded && skill.type === 'ad_kpi_analyzer') ? "min(1100px, calc(100vw - 70px))"
                    : (skill.isExpanded && skill.type === 'fb_ads_performance_engine') ? "min(1150px, calc(100vw - 70px))"
                    : (skill.isExpanded && skill.type === 'facebook_ads_scaling_system') ? "min(1150px, calc(100vw - 70px))"
                    : (skill.isExpanded && skill.type === 'ugc_creative_prompt_generator') ? "min(1150px, calc(100vw - 70px))"
                    : (skill.isExpanded && skill.type === 'meta_ads_scaling_system') ? "min(1150px, calc(100vw - 70px))"
                    : (skill.isExpanded && skill.type === 'meta_daily_decision_flow') ? "min(1250px, calc(100vw - 70px))"
                    : (skill.isExpanded && skill.type === 'breakdown_intelligence') ? "min(1150px, calc(100vw - 70px))"
                    : (skill.isExpanded && skill.type === 'image_ad_concept_generator') ? "min(1120px, calc(100vw - 70px))"
                    : (skill.isExpanded && skill.type === 'full_funnel_workflow_master') ? "min(1300px, calc(100vw - 70px))"
                    : (METHOD_CHAPTERS[skill.type] && (skill.isExpanded || skill.status === 'running')) ? 980 : 600,
                minWidth: 600,
                background: "#fff", border: "1px solid #cbd5e1",
                borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                display: "flex", flexDirection: "column"
              }}>
                {/* ══ [E_SkillNode_PortIn] Green "port in" dot — connect from other skills here. */}
                {/* Port In dot (for receiving from other skills) */}
                <div
                  className="port-in" data-skill-node={skill.id}
                  style={{
                    position: "absolute", left: -8, top: 100, marginTop: -8, width: 16, height: 16,
                    borderRadius: "50%", background: "#fff", border: "3px solid #10b981",
                    cursor: "crosshair", zIndex: 10, boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                  }}
                />

                {/* ══ [E_SkillNode_Header] Drag header: SECTION badge, title, description. */}
                {/* Drag Header / Title Area */}
                <div className="skill-drag-handle" style={{ background: "#fff", padding: "16px 20px", borderBottom: "1px solid #e2e8f0", borderTopLeftRadius: 12, borderTopRightRadius: 12, cursor: "grab" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: "#10b981", background: "#d1fae5", padding: "4px 8px", borderRadius: 16 }}>SECTION 01</span>
                    {skill.status === 'done' && <span style={{ fontSize: 10, fontWeight: 700, color: "#10b981", display: "flex", alignItems: "center", gap: 4 }}><DynamicIcon name="Check" size={12} /> Completed</span>}
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: "#1e293b", marginBottom: 4 }}>{SKILLS_DICT[skill.type].label}</div>
                  {skill.type === 'ad_kpi_analyzer' && (
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "#0f172a", color: "#7dd3fc", padding: "4px 10px", borderRadius: 999, fontSize: 10, fontWeight: 800, letterSpacing: 0.8, marginBottom: 8 }}>
                      📊 AD KPIs DASHBOARD v3
                    </div>
                  )}
                  <div style={{ fontSize: 12, color: "#64748b" }}>{SKILLS_DICT[skill.type].desc}.</div>
                </div>

                {/* ══ [E_SkillNode_Params] Parameters area: config row, textarea, run button. */}
                {/* Parameters Area */}
                <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 16, background: "#f8fafc", borderBottomLeftRadius: 12, borderBottomRightRadius: 12 }}>

                  {/* ══ [E_SkillNode_ConfigRow] Config chips: depends-on, LIVE WEB RESEARCH toggle, language select, website URL input. */}
                  {/* Config Row */}
                  <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#fff", border: "1px solid #e2e8f0", padding: "6px 12px", borderRadius: 20, fontSize: 11, color: "#475569" }}>
                      <span>Depends on:</span> <strong>{needsMulti ? `Connected Nodes (${incomingCount}/2+)` : isConnected ? "Connected Node" : "—"}</strong>
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
                    {ADVANCED_PRODUCT_SKILLS.includes(skill.type) && (
                      <select title="Output depth: Quick / Standard / Full" value={skill.depth || 'Standard'} onChange={(e) => updateSkillData(skill.id, { depth: e.target.value })} style={{ background: "#fff", border: "1px solid #e2e8f0", padding: "6px 12px", borderRadius: 20, fontSize: 11, color: "#475569", cursor: "pointer", outline: "none" }}>
                        <option value="Quick">Quick</option>
                        <option value="Standard">Standard</option>
                        <option value="Full">Full</option>
                      </select>
                    )}
                  </div>

                  
                  {skill.type === 'cinematic_storyboard_director' && skill.status !== 'running' && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
                      <button onClick={() => updateSkillData(skill.id, { withVoiceover: !skill.withVoiceover })} style={{ alignSelf: "flex-start", display: "flex", alignItems: "center", gap: 6, background: skill.withVoiceover ? "#dcfce7" : "#fff", border: `1px solid ${skill.withVoiceover ? "#22c55e" : "#e2e8f0"}`, padding: "6px 12px", borderRadius: 20, fontSize: 11, color: skill.withVoiceover ? "#15803d" : "#475569", cursor: "pointer", fontWeight: 700 }}>
                        <DynamicIcon name="Mic" size={12} /> GENERATE VOICEOVER {skill.withVoiceover ? "ON" : "OFF"}
                      </button>
                      {skill.withVoiceover && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          
                          <div style={{ display: "flex", flexDirection: "column", gap: 8, background: "#f8fafc", padding: "12px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", width: "160px" }}>Total Video Duration (sec):</span>
                              <input
                                type="number"
                                min="10"
                                max="120"
                                step="10"
                                value={skill.videoDuration || 30}
                                onChange={(e) => updateSkillData(skill.id, { videoDuration: parseInt(e.target.value) || 30 })}
                                style={{ width: "60px", padding: "4px 8px", borderRadius: 6, border: "1px solid #cbd5e1", fontSize: 12, outline: "none" }}
                              />
                            </div>
                            
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", width: "160px" }}>Marketing Method:</span>
                              <select 
                                value={skill.marketingMethod || 'Auto'} 
                                onChange={(e) => updateSkillData(skill.id, { marketingMethod: e.target.value })}
                                style={{ flex: 1, padding: "4px 8px", borderRadius: 6, border: "1px solid #cbd5e1", fontSize: 11, outline: "none" }}
                              >
                                <option value="Auto">Auto (AI picks best for product)</option>
                                <option value="AIDA">AIDA – Attention, Interest, Desire, Action</option>
                                <option value="PAS">PAS – Problem, Agitate, Solution</option>
                                <option value="BAB">BAB – Before, After, Bridge</option>
                                <option value="4P">4P – Picture, Promise, Prove, Push</option>
                                <option value="FAB">FAB – Feature, Advantage, Benefit</option>
                                <option value="PPPP">PPPP – Problem, Promise, Proof, Proposal</option>
                                <option value="Hook-Story-Offer">Hook–Story–Offer (UGC/testimonial)</option>
                                <option value="Demo-Proof-CTA">Demo–Proof–CTA (product demonstration)</option>
                              </select>
                            </div>

                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", width: "160px" }}>Hook Style:</span>
                              <select 
                                value={skill.hookStyle || 'Pattern interrupt'} 
                                onChange={(e) => updateSkillData(skill.id, { hookStyle: e.target.value })}
                                style={{ flex: 1, padding: "4px 8px", borderRadius: 6, border: "1px solid #cbd5e1", fontSize: 11, outline: "none" }}
                              >
                                <option value="Shocking question">Shocking question</option>
                                <option value="Bold claim">Bold claim</option>
                                <option value="Pattern interrupt">Pattern interrupt</option>
                                <option value="Before/after split">Before/after split</option>
                                <option value="POV">POV</option>
                              </select>
                            </div>

                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", width: "160px" }}>Energy:</span>
                              <select 
                                value={skill.energy || 'Fast'} 
                                onChange={(e) => updateSkillData(skill.id, { energy: e.target.value })}
                                style={{ width: "120px", padding: "4px 8px", borderRadius: 6, border: "1px solid #cbd5e1", fontSize: 11, outline: "none" }}
                              >
                                <option value="Fast">Fast</option>
                                <option value="Very fast">Very fast</option>
                              </select>
                            </div>
                          </div>

                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Voiceover Scripts (3 Ideas)</span>
                            <button
                              disabled={skill.isGeneratingVo}
                              onClick={async () => {
                                updateSkillData(skill.id, { isGeneratingVo: true });
                                try {
                                  const upstream = connections.filter(c => c.toId === skill.id).map(c => c.fromId);
                                  const outputs = upstream.map(id => {
                                    if (id.startsWith('group_')) {
                                      const g = groups[parseInt(id.split('_')[1])];
                                      return g ? g.products : null;
                                    }
                                    const s = skills.find(sk => sk.id === id);
                                    return s ? s.result : null;
                                  }).filter(Boolean);
                                  
                                  const contextStr = outputs.length > 0 ? JSON.stringify(outputs).substring(0, 1200) : "product from connected node";
                                  const totalSecs = skill.videoDuration || 30;

                                  const res = await fetch("/api/ai/execute-node", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({
                                      prompt: `Write 3 DISTINCT high-converting, punchy video ad voiceover scripts (one for each distinct video idea) for a direct-response video ad selling this product context: ${contextStr}. \n\nCRITICAL: The user wants exactly a ${totalSecs}-second video for each idea. You MUST explicitly write out the script separated by 10-second timestamps.\n\nFormat your output exactly like this:\n\n--- VIDEO IDEA 1 ---\n[0:00 - 0:10]: (voiceover for this chunk)\n[0:10 - 0:20]: (voiceover for this chunk)\n... (continue up to ${totalSecs} seconds)\n\n--- VIDEO IDEA 2 ---\n[0:00 - 0:10]: ...\n\nReturn ONLY the raw scripts in this format without any extra intro or outro.`,
                                      skillId: 'generic',
                                      schemaString: ''
                                    })
                                  });
                                  const data = await res.json();
                                  updateSkillData(skill.id, { 
                                    voiceoverScript: typeof data.result === 'string' ? data.result : (data.rawOutput || ''), 
                                    isGeneratingVo: false 
                                  });
                                } catch(e) {
                                  updateSkillData(skill.id, { isGeneratingVo: false });
                                }
                              }}
                              style={{ display: "flex", alignItems: "center", gap: 4, background: "#f1f5f9", border: "1px solid #cbd5e1", padding: "4px 10px", borderRadius: 6, fontSize: 10, fontWeight: 700, color: "#334155", cursor: skill.isGeneratingVo ? "wait" : "pointer" }}
                            >
                              <DynamicIcon name="Sparkles" size={12} color="#8b5cf6" /> 
                              {skill.isGeneratingVo ? "GENERATING..." : "GENERATE 3 SCRIPTS WITH AI"}
                            </button>
                          </div>
                          <textarea
                            value={skill.voiceoverScript || ''}
                            onChange={(e) => updateSkillData(skill.id, { voiceoverScript: e.target.value })}
                            placeholder="Paste your 3 specific voiceover scripts here... (The AI will split them across the segments)"
                            style={{ width: "100%", height: 120, padding: "10px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 12, outline: "none", resize: "vertical", fontFamily: "inherit" }}
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* ══ [E_SkillNode_ApInputs] Advanced Product Intelligence — per-skill optional parameter inputs. */}
                  {ADVANCED_PRODUCT_SKILLS.includes(skill.type) && skill.type !== 'winning_product_methods' && skill.status !== 'running' && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "flex-end" }}>
                      {skill.type === 'product_master_list' && (
                        <div>
                          <div style={{ fontSize: 10, fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: 4 }}>Marketplaces to check</div>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                            {["Amazon", "TikTok Shop", "Etsy", "AliExpress", "Shopify stores"].map(m => {
                              const active = (skill.marketplaces || []).includes(m);
                              return (
                                <button key={m} onClick={() => updateSkillData(skill.id, { marketplaces: active ? (skill.marketplaces || []).filter(x => x !== m) : [...(skill.marketplaces || []), m] })} style={{ padding: "4px 10px", borderRadius: 14, border: `1px solid ${active ? "#10b981" : "#cbd5e1"}`, background: active ? "#d1fae5" : "#fff", color: active ? "#047857" : "#475569", fontSize: 10, fontWeight: 600, cursor: "pointer" }}>{m}</button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                      {skill.type === 'untapped_product_finder' && (
                        <div>
                          <div style={{ fontSize: 10, fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: 4 }}>Max results</div>
                          <select value={skill.maxResults || '5'} onChange={(e) => updateSkillData(skill.id, { maxResults: e.target.value })} style={{ background: "#fff", border: "1px solid #cbd5e1", padding: "6px 10px", borderRadius: 8, fontSize: 11, color: "#1e293b", outline: "none" }}>
                            <option value="3">3</option>
                            <option value="5">5</option>
                            <option value="10">10</option>
                          </select>
                        </div>
                      )}
                      {skill.type === 'scale_potential' && (
                        <div>
                          <div style={{ fontSize: 10, fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: 4 }}>Target market</div>
                          <select value={skill.targetMarket || 'Single country (Algeria)'} onChange={(e) => updateSkillData(skill.id, { targetMarket: e.target.value })} style={{ background: "#fff", border: "1px solid #cbd5e1", padding: "6px 10px", borderRadius: 8, fontSize: 11, color: "#1e293b", outline: "none" }}>
                            <option value="Single country (Algeria)">Single country (Algeria)</option>
                            <option value="Global">Global</option>
                          </select>
                        </div>
                      )}
                      {skill.type === 'portfolio_product_ranking' && (
                        <div>
                          <div style={{ fontSize: 10, fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: 4 }}>Ranking priority</div>
                          <select value={skill.rankingPriority || 'Highest Potential'} onChange={(e) => updateSkillData(skill.id, { rankingPriority: e.target.value })} style={{ background: "#fff", border: "1px solid #cbd5e1", padding: "6px 10px", borderRadius: 8, fontSize: 11, color: "#1e293b", outline: "none" }}>
                            <option value="Highest Potential">Highest Potential</option>
                            <option value="Lowest Risk">Lowest Risk</option>
                            <option value="Fastest to Test">Fastest to Test</option>
                          </select>
                        </div>
                      )}
                      {skill.type === 'product_sourcing_compliance' && (
                        <div style={{ flex: 1, minWidth: 200 }}>
                          <div style={{ fontSize: 10, fontWeight: 700, color: "#ef4444", textTransform: "uppercase", marginBottom: 4 }}>Target country (required)</div>
                          <input type="text" value={skill.targetCountry || ''} onChange={(e) => updateSkillData(skill.id, { targetCountry: e.target.value })} placeholder="e.g. Algeria" style={{ width: "100%", background: "#fff", border: skill.targetCountry ? "1px solid #cbd5e1" : "1.5px solid #fca5a5", borderRadius: 8, padding: "7px 10px", fontSize: 11, color: "#1e293b", outline: "none", fontFamily: "inherit" }} />
                        </div>
                      )}
                    </div>
                  )}

                  {/* ══ [E_SkillNode_WinInputs] Winning Products — Max unit cost / Max MOQ constraints. */}
                  {skill.type === 'winning_product_methods' && skill.status !== 'running' && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "flex-end" }}>
                      <div style={{ flex: 1, minWidth: 120 }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: 4 }}>Max unit cost ($)</div>
                        <input type="number" min="0" step="1" value={skill.maxUnitCost || ''} onChange={(e) => updateSkillData(skill.id, { maxUnitCost: e.target.value || '' })} placeholder="e.g. 10" style={{ width: "100%", background: "#fff", border: "1px solid #cbd5e1", borderRadius: 8, padding: "7px 10px", fontSize: 11, color: "#1e293b", outline: "none", fontFamily: "inherit" }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 120 }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: 4 }}>Max MOQ (units)</div>
                        <input type="number" min="0" step="1" value={skill.maxMoq || ''} onChange={(e) => updateSkillData(skill.id, { maxMoq: e.target.value || '' })} placeholder="e.g. 50" style={{ width: "100%", background: "#fff", border: "1px solid #cbd5e1", borderRadius: 8, padding: "7px 10px", fontSize: 11, color: "#1e293b", outline: "none", fontFamily: "inherit" }} />
                      </div>
                    </div>
                  )}

                  {/* ══ [E_SkillNode_CompanyName] MY COMPANY NAME input (shown for all company-plan skills). */}
                  {COMPANY_PLAN_SKILLS.includes(skill.type) && (
                    <div style={{ marginTop: -4 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: "#0d9488", textTransform: "uppercase", marginBottom: 6 }}>MY COMPANY NAME / INFO</div>
                      <input
                        type="text"
                        value={skill.companyName || ''}
                        onChange={(e) => updateSkillData(skill.id, { companyName: e.target.value })}
                        placeholder="Type your company name, e.g. Acme LLC"
                        style={{ width: "100%", background: "#fff", border: "1.5px solid #5eead4", borderRadius: 8, padding: "10px", fontSize: 12, color: "#1e293b", outline: "none", fontFamily: "inherit" }}
                      />
                      <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 5 }}>The AI will use this to give info about YOUR company.</div>
                    </div>
                  )}

                  {/* ══ [E_SkillNode_UrlPreview] TARGET WEBSITE URL input + live site thumbnail (for web research skills). */}
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

                  {COMPANY_PLAN_SKILLS.includes(skill.type) && (
                    /* ══ [E_SkillNode_QA] Q&A — dynamic question list (company-plan skills only). */ 
                    <div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: .5 }}>Q&A</div>
                        <button onClick={() => updateSkillData(skill.id, { questions: [...(skill.questions || []), ""] })} style={{ background: "none", border: "1px dashed #94a3b8", borderRadius: 6, color: "#64748b", fontSize: 10, fontFamily: "monospace", fontWeight: 700, padding: "3px 8px", cursor: "pointer" }}>＋ ADD QUESTION</button>
                      </div>
                      {(skill.questions || []).length === 0 && (
                        <div style={{ fontSize: 11, color: "#94a3b8", fontStyle: "italic", paddingBottom: 4 }}>No questions yet — click "+ ADD QUESTION" and type what you want the AI to answer.</div>
                      )}
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {(skill.questions || []).map((q, idx) => (
                          <div key={idx} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={{ fontSize: 10, fontFamily: "monospace", fontWeight: 800, color: "#10b981", flexShrink: 0 }}>{idx + 1}.</span>
                            <input
                              type="text"
                              value={q}
                              onChange={(e) => updateSkillData(skill.id, { questions: (skill.questions || []).map((x, i) => i === idx ? e.target.value : x) })}
                              placeholder={`Question ${idx + 1} — e.g. Which bank is best for me?`}
                              style={{ flex: 1, width: "100%", background: "#fff", border: "1px solid #cbd5e1", borderRadius: 8, padding: "9px 10px", fontSize: 12, color: "#1e293b", outline: "none", fontFamily: "inherit" }}
                            />
                            <button onClick={() => updateSkillData(skill.id, { questions: (skill.questions || []).filter((_, i) => i !== idx) })} style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", borderRadius: 6, width: 26, height: 26, cursor: "pointer", fontSize: 13, lineHeight: 1, flexShrink: 0 }}>×</button>
                          </div>
                        ))}
                      </div>
                      <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 6 }}>When you press RUN, the AI answers every question above in the result.</div>
                    </div>
                  )}

                  {!COMPANY_PLAN_SKILLS.includes(skill.type) && (
                    /* ══ [E_SkillNode_Instructions] CUSTOM AI INSTRUCTIONS textarea (all other skills). For liquid_prompt it becomes the HTML page input with file upload. */
                    <div>
                      {skill.type === 'facebook_ads_testing' && (
                        <CustomMethodDropdown 
                          selectedId={skill.selectedMethodId || "custom"}
                          onSelect={(val) => {
                            if (val !== "custom") {
                              const allMethods = [...FB_ADS_DEFAULT_METHODS, ...customMethods];
                              const m = allMethods.find(x => x.id === val);
                              if (m) updateSkillData(skill.id, { selectedMethodId: val, instructions: m.text });
                            } else {
                              updateSkillData(skill.id, { selectedMethodId: val, instructions: "" });
                            }
                          }}
                          defaultMethods={FB_ADS_DEFAULT_METHODS}
                          customMethods={customMethods}
                          onRemove={removeCustomMethod}
                          onEdit={(id) => {
                            const m = customMethods.find(x => x.id === id);
                            if (m) {
                              const newName = window.prompt("Edit method name:", m.label);
                              if (newName && newName.trim()) {
                                saveCustomMethod({ ...m, label: newName.trim() });
                              }
                            }
                          }}
                        />
                      )}
                      <div style={{ fontSize: 10, fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: 6, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span>{skill.type === 'liquid_prompt' ? 'PASTE YOUR HTML PAGE' : skill.type === 'winning_digital_product' ? 'PASTE OR UPLOAD CSV' : (skill.type === 'facebook_ads_testing' && skill.selectedMethodId && skill.selectedMethodId !== 'custom' ? 'METHOD EXPLANATION' : 'CUSTOM AI INSTRUCTIONS')}</span>
                        {(skill.type === 'liquid_prompt' || skill.type === 'winning_digital_product') && (
                          <label style={{ display: "flex", alignItems: "center", gap: 4, color: "#047857", cursor: "pointer", fontSize: 10, fontWeight: 700, textTransform: "none" }}>
                            <DynamicIcon name="Upload" size={12} /> UPLOAD .{skill.type === 'liquid_prompt' ? 'HTML' : 'CSV'}
                            <input
                              type="file"
                              accept={skill.type === 'liquid_prompt' ? ".html,.htm,.txt" : ".csv,.txt"}
                              style={{ display: "none" }}
                              onChange={(e) => {
                                const file = e.target.files && e.target.files[0];
                                if (!file) return;
                                const reader = new FileReader();
                                reader.onload = () => {
                                  let text = String(reader.result || "");
                                  if (skill.type === 'winning_digital_product') {
                                    const lines = text.split('\n');
                                    if (lines.length > 51) {
                                      alert(`CSV is very large (${lines.length} rows). The AI can only analyze about 50 products at a time without hitting limits. Truncating to the first 50 rows.`);
                                      text = lines.slice(0, 51).join('\n');
                                    }
                                  }
                                  updateSkillData(skill.id, { instructions: text, isExpanded: false });
                                };
                                reader.readAsText(file);
                                e.target.value = "";
                              }}
                            />
                          </label>
                        )}
                      </div>
                      <textarea
                        value={skill.instructions}
                        onChange={(e) => updateSkillData(skill.id, { instructions: e.target.value })}
                        placeholder={skill.type === 'liquid_prompt'
                          ? "Paste your full HTML page here (or upload the .html file above) — the Liquid Prompt converter will split it into Shopify sections and rebuild it as a Liquid theme with live progress + ZIP."
                          : skill.type === 'winning_digital_product'
                            ? "Paste your CSV data here or upload the .csv file above."
                            : SKILLS_DICT[skill.type]?.placeholder || 'E.g. "Focus heavily on Algeria and French-speaking North Africa."'}
                        style={{ width: "100%", height: (skill.type === 'liquid_prompt' || skill.type === 'winning_digital_product') ? 160 : 60, background: "#fff", border: "1px solid #cbd5e1", borderRadius: 8, padding: "10px", fontSize: 12, color: "#1e293b", resize: "none", fontFamily: "inherit", outline: "none" }}
                      />
                      {skill.type === 'facebook_ads_testing' && (!skill.selectedMethodId || skill.selectedMethodId === 'custom') && skill.instructions?.trim() && (
                        <div style={{ marginTop: 8, display: "flex", justifyContent: "flex-end" }}>
                          <button 
                            onClick={() => {
                              const name = window.prompt("Enter a name for this new method:");
                              if (name) {
                                const newId = "custom_" + Date.now();
                                saveCustomMethod({ id: newId, label: name, text: skill.instructions });
                                updateSkillData(skill.id, { selectedMethodId: newId });
                              }
                            }}
                            style={{ background: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: 6, padding: "5px 12px", fontSize: 10, fontWeight: 700, color: "#475569", cursor: "pointer" }}
                          >
                            + SAVE METHOD TO LIST
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ══ [E_SkillNode_MasterDz] Master DZ section checkboxes (only for master_dz_landing_page_strategy). */}
                  {/* Section Selector for Master DZ skill */}
                  {skill.type === 'master_dz_landing_page_strategy' && skill.status !== 'running' && (
                    <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: "12px 14px" }}>
                      <MasterDzSelector
                        selected={skill.selectedSections || DZ_SECTIONS.map(s => s.key)}
                        onChange={(sel) => updateSkillData(skill.id, { selectedSections: sel })}
                      />
                    </div>
                  )}

                  {/* ══ [E_SkillNode_FunnelStageSelector] Stage selector for full_funnel_workflow_master (All In One). */}
                  {skill.type === 'full_funnel_workflow_master' && skill.status !== 'running' && (
                    <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: "12px 14px" }}>
                      <FunnelStageSelector
                        selected={skill.selectedStages || FUNNEL_STAGES.map(s => s.key)}
                        onChange={(sel) => updateSkillData(skill.id, { selectedStages: sel })}
                      />
                    </div>
                  )}

                  {/* ══ [E_SkillNode_MethodSelector] Methods Library checkboxes (testing / scaling / winning product / master guide). */}
                  {METHOD_CHAPTERS[skill.type] && skill.status !== 'running' && (
                    <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: "12px 14px" }}>
                      <MethodSelector
                        methods={getChapter(skill.type)?.methods || []}
                        selected={skill.selectedMethods || []}
                        onChange={(sel) => updateSkillData(skill.id, { selectedMethods: sel })}
                        unitLabel={METHOD_ANALYSIS_MODE[METHOD_CHAPTERS[skill.type]] ? "message" : "method"}
                        actionLabel={METHOD_ANALYSIS_MODE[METHOD_CHAPTERS[skill.type]] ? "strategy analysis" : "playbook"}
                      />
                    </div>
                  )}

                  {/* ══ [E_SkillNode_Actions] Actions row: Run button, status text, regenerate/expand/collapse/manual buttons. */}
                  {/* Actions Row */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 10, borderTop: "1px solid #e2e8f0" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      {skill.type === 'winning_product_methods' && skill.status !== 'running' && (
                        <button onClick={() => { updateSkillData(skill.id, { webResearch: true }); runSkill(skill.id, { webResearch: true }); }} title="Re-run the selected methods with LIVE WEB RESEARCH ON to verify current supplier links and prices" style={{ display: "flex", alignItems: "center", gap: 6, background: "#f0fdf4", color: "#15803d", border: "1px solid #86efac", padding: "8px 14px", borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                          <DynamicIcon name="RefreshCw" size={14}/> REFRESH SUPPLIER LINKS
                        </button>
                      )}
                      <button onClick={() => runSkill(skill.id)} disabled={!canRun || skill.status === 'running'} style={{ display: "flex", alignItems: "center", gap: 6, background: canRun ? "#047857" : "#94a3b8", color: "#fff", border: "none", padding: "8px 16px", borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: (!canRun || skill.status === 'running') ? "not-allowed" : "pointer", opacity: canRun ? 1 : 0.6 }}>
                        <DynamicIcon name={skill.status === 'running' ? "Loader2" : "Play"} size={14} />
                        {skill.status === 'running' ? "RUNNING..." :
                          skill.type === 'master_dz_landing_page_strategy'
                            ? `RUN ${(skill.selectedSections || DZ_SECTIONS.map(s => s.key)).length} SECTIONS`
                            : skill.type === 'full_funnel_workflow_master'
                              ? `RUN ${(skill.selectedStages || FUNNEL_STAGES.map(s => s.key)).length} STAGES`
                              : METHOD_CHAPTERS[skill.type]
                                ? `RUN ${(skill.selectedMethods || []).length} ${METHOD_ANALYSIS_MODE[METHOD_CHAPTERS[skill.type]] ? "MESSAGE" : "METHOD"}${(skill.selectedMethods || []).length !== 1 ? "S" : ""}`
                                : skill.type === 'liquid_prompt'
                                  ? "RUN LIQUID CONVERTER"
                                  : "RUN AI ANALYSIS"}
                      </button>
                      
                      {skill.type === 'cinematic_storyboard_director' && skill.status === 'done' && (
                        <>
                          <button onClick={() => { /* Placeholder for advanced script-only regen logic */ updateSkillData(skill.id, { isGeneratingVo: true }); setTimeout(() => updateSkillData(skill.id, { isGeneratingVo: false }), 1500); alert("Regenerating script only... (Coming soon)"); }} style={{ display: "flex", alignItems: "center", gap: 6, background: "#fef08a", color: "#854d0e", border: "1px solid #fde047", padding: "8px 14px", borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                            <DynamicIcon name="PenTool" size={14}/> REGENERATE SCRIPT ONLY
                          </button>
                          <button onClick={() => { /* Placeholder for advanced visuals-only regen logic */ updateSkillData(skill.id, { isGeneratingVo: true }); setTimeout(() => updateSkillData(skill.id, { isGeneratingVo: false }), 1500); alert("Regenerating visuals only... (Coming soon)"); }} style={{ display: "flex", alignItems: "center", gap: 6, background: "#e0e7ff", color: "#3730a3", border: "1px solid #c7d2fe", padding: "8px 14px", borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                            <DynamicIcon name="Video" size={14}/> REGENERATE VISUALS ONLY
                          </button>
                        </>
                      )}
                      {skill.status === 'done' && skill.type !== 'liquid_prompt' && !METHOD_CHAPTERS[skill.type] && skill.type !== 'full_funnel_workflow_master' && (
                        <button onClick={() => updateSkillData(skill.id, { showPlainText: !skill.showPlainText })} style={{ display: "flex", alignItems: "center", gap: 6, background: skill.showPlainText ? "#f1f5f9" : "#fff", color: "#64748b", border: "1px solid #e2e8f0", padding: "8px 16px", borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                          <DynamicIcon name={skill.showPlainText ? "EyeOff" : "AlignLeft"} size={14} /> {skill.showPlainText ? "HIDE TEXT" : "PREVIEW TEXT"}
                        </button>
                      )}
                      {skill.status === 'done' && (
                        <button onClick={() => updateSkillData(skill.id, { isExpanded: !skill.isExpanded })} style={{ display: "flex", alignItems: "center", gap: 6, background: skill.type === 'full_funnel_workflow_master' ? (skill.isExpanded ? "#4f46e5" : "#6366f1") : (skill.isExpanded ? "#f1f5f9" : "#fff"), color: skill.type === 'full_funnel_workflow_master' ? "#fff" : "#64748b", border: skill.type === 'full_funnel_workflow_master' ? "none" : "1px solid #e2e8f0", padding: "8px 16px", borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                          <DynamicIcon name={skill.isExpanded ? "EyeOff" : (skill.type === 'full_funnel_workflow_master' ? "Layers" : "Eye")} size={14} /> {skill.isExpanded ? "HIDE RESULT" : (skill.type === 'full_funnel_workflow_master' ? "VIEW DASHBOARD" : "VIEW RESULT")}
                        </button>
                      )}
                      {skill.status === 'done' && (
                        <button onClick={async () => { const ok = await copyText(skillToJson(skill)); setFlashMsg(ok ? "JSON copied!" : "Nothing to copy"); }} title="Copy the raw JSON result to the clipboard" style={{ display: "flex", alignItems: "center", gap: 6, background: "#f1f5f9", color: "#64748b", border: "1px solid #e2e8f0", padding: "8px 14px", borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                          <DynamicIcon name="Copy" size={14}/> COPY JSON
                        </button>
                      )}
                      {skill.status === 'done' && skill.lastPrompt && (
                        <button onClick={async () => { const ok = await copyText(skill.lastPrompt + (skill.lastSchema ? "\\n\\nSCHEMA:\\n" + skill.lastSchema : "")); setFlashMsg(ok ? "Prompt copied!" : "Nothing to copy"); }} title="Copy the exact prompt sent to the AI" style={{ display: "flex", alignItems: "center", gap: 6, background: "#f1f5f9", color: "#64748b", border: "1px solid #e2e8f0", padding: "8px 14px", borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                          <DynamicIcon name="FileText" size={14}/> COPY PROMPT
                        </button>
                      )}
                    </div>
                    {skill.status === 'error' && <div style={{ fontSize: 11, color: "#ef4444" }}>Error: {skill.error}</div>}
                  </div>
                </div>

                {/* Inline Result View */}
                {((skill.status === 'done' && skill.isExpanded) || (skill.status === 'running' && (skill.type === 'master_dz_landing_page_strategy' || skill.type === 'liquid_prompt' || skill.type === 'landing_page_builder' || !!METHOD_CHAPTERS[skill.type]))) && (
                  <div
                    onMouseDown={e => e.stopPropagation()}
                    style={{ padding: "0 20px 20px 20px", display: "flex", flexDirection: "column", gap: 16, userSelect: "text", cursor: "text" }}
                  >
                    {skill.type === 'product_sourcing_compliance' ? (
                      <div style={{ background: "#fff", borderRadius: 12, overflow: "hidden", border: "1px solid #e2e8f0" }}>
                        <ProductSourcingChart data={skill.result} />
                      </div>
                    ) : skill.type === 'facebook_ads_testing' ? (
                      <FacebookAdsOrgChart data={skill.result} />
                    ) : skill.type === 'buyer_persona_testing' ? (
                      <BuyerPersonaOrgChart data={skill.result} />
                    ) : skill.type === 'ecommerce_growth_loop_intelligence_engine' ? (
                      <GrowthLoopOrgChart data={skill.result} />
                    ) : skill.type === 'full_funnel_workflow_master' ? (
                      <div style={{ background: "transparent", borderRadius: 16, overflow: "visible" }}>
                        <FullFunnelViewer data={skill.result} selectedStages={skill.selectedStages} />
                      </div>
                    ) : skill.type === 'adset_table_generator' ? (
                      <div style={{ background: "#fff", borderRadius: 12, overflow: "hidden", border: "1px solid #e2e8f0" }}>
                        <AdSetDataTable data={skill.result} />
                      </div>
                    ) : skill.type === 'ad_kpi_analyzer' ? (
                      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", maxHeight: "min(600px, calc(100vh - 230px))", overflowY: "auto", overflowX: "auto", scrollbarWidth: "thin", scrollbarColor: "#94a3b8 #eef2f7" }}>
                        <AdKpiAnalysis data={skill.result} />
                      </div>
                    ) : skill.type === 'fb_ads_performance_engine' ? (
                      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", maxHeight: "min(720px, calc(100vh - 230px))", overflowY: "auto", overflowX: "auto", scrollbarWidth: "thin", scrollbarColor: "#94a3b8 #eef2f7" }}>
                        <PerformanceEngine data={skill.result} />
                      </div>
                    ) : skill.type === 'breakdown_intelligence' ? (
                      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", maxHeight: "min(700px, calc(100vh - 230px))", overflowY: "auto", overflowX: "auto", scrollbarWidth: "thin", scrollbarColor: "#94a3b8 #eef2f7" }}>
                        <BreakdownEngine data={skill.result} />
                      </div>
                    ) : skill.type === 'bid_cap_analyzer' ? (
                      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", maxHeight: "min(680px, calc(100vh - 230px))", overflowY: "auto", overflowX: "auto", scrollbarWidth: "thin", scrollbarColor: "#94a3b8 #eef2f7" }}>
                        <BidCapEngine data={skill.result} />
                      </div>
                    ) : skill.type === 'facebook_ads_scaling_system' ? (
                      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", maxHeight: "min(720px, calc(100vh - 230px))", overflowY: "auto", overflowX: "auto", scrollbarWidth: "thin", scrollbarColor: "#94a3b8 #eef2f7" }}>
                        <ScalingSystem data={skill.result} />
                      </div>
                    ) : skill.type === 'meta_ads_scaling_system' ? (
                      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", maxHeight: "min(720px, calc(100vh - 230px))", overflowY: "auto", overflowX: "auto", scrollbarWidth: "thin", scrollbarColor: "#94a3b8 #eef2f7" }}>
                        <MetaScalingSystem data={skill.result} />
                      </div>
                    ) : skill.type === 'meta_daily_decision_flow' ? (
                      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", maxHeight: "min(720px, calc(100vh - 230px))", overflowY: "auto", overflowX: "auto", scrollbarWidth: "thin", scrollbarColor: "#94a3b8 #eef2f7" }}>
                        <MetaDecisionFlow data={skill.result} />
                      </div>
                    ) : skill.type === 'ugc_creative_prompt_generator' ? (
                      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", maxHeight: "min(720px, calc(100vh - 230px))", overflowY: "auto", overflowX: "auto", scrollbarWidth: "thin", scrollbarColor: "#94a3b8 #eef2f7" }}>
                        <UGCGenerator data={skill.result} grounding={skill.grounding} />
                      </div>
                    ) : skill.type === 'cinematic_storyboard_director' ? (
                      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", maxHeight: "min(720px, calc(100vh - 230px))", overflowY: "auto", overflowX: "auto", scrollbarWidth: "thin", scrollbarColor: "#94a3b8 #eef2f7" }}>
                        <CinematicStoryboard data={skill.result} />
                      </div>
                    ) : skill.type === 'image_ad_concept_generator' ? (
                      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", maxHeight: "min(720px, calc(100vh - 230px))", overflowY: "auto", overflowX: "auto", scrollbarWidth: "thin", scrollbarColor: "#94a3b8 #eef2f7" }}>
                        <ImageAdConcepts data={skill.result} grounding={skill.grounding} connectedNodes={skill.connectedNodes} />
                      </div>
                    ) : skill.type === 'campaign_analyzer' ? (
                      <div style={{ background: "#f8fafc", borderRadius: 12, overflow: "hidden", border: "1px solid #e2e8f0", padding: 14 }}>
                        <FunnelAnalysis data={skill.result} />
                      </div>
                    ) : skill.type === 'liquid_prompt' ? (
                      <LiquidPromptCard data={skill.result} running={skill.status === 'running'} />
                    ) : skill.type === 'landing_page_builder' ? (
                      <LandingPageBuilder data={skill.result} running={skill.status === 'running'} onRegenerateSection={key => regenerateLandingSection(skill.id, key)} />
                    ) : skill.type === 'master_dz_landing_page_strategy' ? (
                      <MasterDzSections sections={skill.result?.sections || []} selectedKeys={skill.result?.selectedKeys} />
                    ) : METHOD_CHAPTERS[skill.type] ? (
                      <MethodLibraryResults data={skill.result} kind={skill.type} />
                    ) : COMPANY_PLAN_SKILLS.includes(skill.type) ? (
                      <CompanyPlanCard data={skill.result} />
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
                    ) : (skill.type?.startsWith('stage_') || SKILLS_DICT[skill.type]?.category === 'ALL_IN_ONE' || skill.result?.summary) ? (
                      <StageIntelligenceViewer
                        data={skill.result}
                        skillLabel={SKILLS_DICT[skill.type]?.label || skill.label || skill.type}
                        skillIcon={SKILLS_DICT[skill.type]?.icon || "Layers"}
                      />
                    ) : skill.type === 'ad_creative_style_detector' ? (
                      <div style={{ padding: "4px 0" }}>
                        <AdCreativeAnalyzerView data={skill.result} />
                      </div>
                    ) : skill.type === 'winning_digital_product' ? (
                      <div style={{ padding: 12, background: "#f8fafc", borderRadius: 12, border: "1px solid #e2e8f0" }}>
                        <WinningDigitalProductTable data={skill.result} />
                      </div>
                    ) : (
                      <div style={{ background: "#1e293b", padding: 16, borderRadius: 12, color: "#a5b4fc", fontFamily: "monospace", fontSize: 12, whiteSpace: "pre-wrap" }}>
                        {typeof skill.result === 'object' ? JSON.stringify(skill.result, null, 2) : skill.result}
                      </div>
                    )}
                  </div>
                )}

                {/* ══ [E_SkillNode_TextPreview] Separate clean-text preview area (independent from VIEW RESULT). */}
                {skill.status === 'done' && skill.showPlainText && (
                  <div
                    onMouseDown={e => e.stopPropagation()}
                    onWheel={e => e.stopPropagation()}
                    style={{ padding: "0 20px 20px 20px", maxHeight: 440, overflowY: "auto", userSelect: "text", cursor: "text", WebkitUserSelect: "text" }}
                  >
                    <TextPreviewCard data={skill.result} />
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

          {/* ══ [E_ErrorBanner] Error message + retry (shown when AI grouping fails). */}
          {error && (
            <div style={{ maxWidth: 440, margin: "24px auto", background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: 10, padding: "12px 16px", fontFamily: "monospace", fontSize: 11, color: "#dc2626", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>❌ {error}</span>
              <button onClick={() => { setGroups(null); setShowSizeModal(true); }} style={{ background: "#dc2626", color: "#fff", border: "none", borderRadius: 5, padding: "4px 10px", fontSize: 10, cursor: "pointer", fontFamily: "monospace" }}>retry</button>
            </div>
          )}
        </div>
      </div>

      {/* ══ FIXED OVERLAY UI (not affected by canvas transform) ══ */}

      {/* ══ [E_TopBar] Fixed TOP BAR: title, group/product count, REGROUP button, BACK TO BOARD. */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 10000, background: "rgba(248,250,252,0.92)", borderBottom: "1px solid #d1d9e0", backdropFilter: "blur(8px)", padding: "9px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 10, fontFamily: "monospace", textTransform: "uppercase", letterSpacing: 1.5, color: "#94a3b8" }}>FACEBOOK AD TESTING GROUPS</span>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {/* ══ [E_GroupCount] Group/product count text in the top bar. */}
          {groups && <span style={{ fontSize: 10, fontFamily: "monospace", color: "#64748b" }}>{groups.length} groups · {totalGrouped} products</span>}
          {/* ══ [E_RegroupBtn] REGROUP button — clears current groups and re-opens the size modal. */}
          {groups && (
            <button onClick={() => { setGroups(null); setShowSizeModal(true); }}
              style={{ background: "none", border: "1px solid #d1d9e0", borderRadius: 5, padding: "4px 12px", fontSize: 10, fontFamily: "monospace", color: "#64748b", cursor: "pointer" }}>
              REGROUP
            </button>
          )}
          {/* ══ [E_BackBtn] "BACK TO BOARD" — exits back to the board page. */}
          <button onClick={onBack}
            style={{ background: "#1a2332", border: "none", borderRadius: 5, padding: "6px 14px", fontSize: 10, fontFamily: "monospace", color: "#fff", cursor: "pointer", letterSpacing: .4 }}>
            ← BACK TO BOARD
          </button>
        </div>
      </div>

      {/* ── Miro-style zoom and theme controls (bottom-right) ── ══ [E_ZoomControls] */}
      <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 10000, display: "flex", flexDirection: "row", gap: 12, alignItems: "center" }}>

        {/* ══ [E_ThemeButtons] Background theme switcher: Dots / Grid / Blue / Dark */}
        {/* Theme Controls */}
        <div style={{ background: "rgba(255,255,255,0.95)", backdropFilter: "blur(6px)", border: "1px solid #d1d9e0", borderRadius: 10, boxShadow: "0 2px 12px rgba(0,0,0,0.1)", overflow: "hidden", display: "flex", flexDirection: "row" }}>
          <button onClick={() => setBgTheme('dots')} style={{ background: bgTheme === 'dots' ? "#e2e8f0" : "none", border: "none", padding: "8px 12px", cursor: "pointer", fontSize: 12, fontWeight: 700, color: "#1a2332" }} title="Dots">Dots</button>
          <button onClick={() => setBgTheme('grid')} style={{ background: bgTheme === 'grid' ? "#e2e8f0" : "none", border: "none", padding: "8px 12px", cursor: "pointer", fontSize: 12, fontWeight: 700, color: "#1a2332" }} title="Grid">Grid</button>
          <button onClick={() => setBgTheme('blueprint')} style={{ background: bgTheme === 'blueprint' ? "#2563eb" : "none", border: "none", padding: "8px 12px", cursor: "pointer", fontSize: 12, fontWeight: 700, color: bgTheme === 'blueprint' ? "#fff" : "#1a2332" }} title="Blueprint">Blue</button>
          <button onClick={() => setBgTheme('dark')} style={{ background: bgTheme === 'dark' ? "#1e293b" : "none", border: "none", padding: "8px 12px", cursor: "pointer", fontSize: 12, fontWeight: 700, color: bgTheme === 'dark' ? "#fff" : "#1a2332" }} title="Dark Mode">Dark</button>
        </div>

        {/* ══ [E_FitScreenBtn] "Fit to screen" button — auto-zooms all groups into view. */}
        {/* Fit to screen */}
        {groups && (
          <button onClick={fitToScreen}
            title="Fit to screen"
            style={{ width: 36, height: 36, borderRadius: 8, border: "1px solid #d1d9e0", background: "rgba(255,255,255,0.95)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 15, boxShadow: "0 2px 8px rgba(0,0,0,0.1)", color: "#1a2332", fontFamily: "monospace" }}>
            ⊡
          </button>
        )}
        {/* ══ [E_ZoomButtons] Zoom − / percentage / + controls. */}
        <div style={{ background: "rgba(255,255,255,0.95)", backdropFilter: "blur(6px)", border: "1px solid #d1d9e0", borderRadius: 10, boxShadow: "0 2px 12px rgba(0,0,0,0.1)", overflow: "hidden", display: "flex", flexDirection: "row" }}>
          <button onClick={() => zoomBy(0.8)}
            style={{ width: 36, height: 36, border: "none", borderRight: "1px solid #e8ecf0", background: "transparent", fontSize: 18, cursor: "pointer", color: "#1a2332", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 300 }}>−</button>
          <div style={{ width: 44, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontFamily: "monospace", color: "#64748b", borderRight: "1px solid #e8ecf0" }}>
            {Math.round(zoom * 100)}%
          </div>
          <button onClick={() => zoomBy(1.2)}
            style={{ width: 36, height: 36, border: "none", background: "transparent", fontSize: 18, cursor: "pointer", color: "#1a2332", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 300 }}>+</button>
        </div>
        {/* ══ [E_ResetZoomBtn] "100%" button — resets zoom to 100% and repositions pan. */}
        {/* Reset zoom */}
        <button onClick={() => { setZoom(1); setPan({ x: 0, y: 60 }); }}
          title="Reset zoom"
          style={{ width: 40, height: 36, borderRadius: 8, border: "1px solid #d1d9e0", background: "rgba(255,255,255,0.95)", backdropFilter: "blur(6px)", cursor: "pointer", fontSize: 10, fontFamily: "monospace", color: "#94a3b8", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
          100%
        </button>
      </div>

      {/* ══ [E_SkillSidebar] LEFT SIDEBAR — "Skill Library": search box + draggable skill categories. */}
      {/* ── Visual Programming Skills Sidebar (Left) ── */}
      {groups && (
        <div style={{
          position: "fixed", top: 80, left: 20, bottom: 20, width: 300,
          background: "#fff", border: "1px solid #e2e8f0", zIndex: 9999, borderRadius: 20,
          boxShadow: "0 10px 40px rgba(0,0,0,0.08)", display: "flex", flexDirection: "column",
          overflow: "hidden"
        }}>
          {/* ══ [E_SidebarHeader] Sidebar sticky header: icon + title + search input. */}
          {/* Sticky Header */}
          <div style={{ padding: "20px 20px 16px", background: "#ffffff", borderBottom: "1px solid #e2e8f0", zIndex: 10 }}>
{/* ══ [E_Modal_CustomSize] "custom:" number input for products per group. */}
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

          {/* ══ [E_SidebarScroll] Scrollable area: product previews (draggable) + skill categories. */}
          {/* Scrollable Content (Brainwave UI) */}
          <div style={{ padding: "0 20px 20px", overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: 16, paddingTop: 16, scrollbarWidth: "thin", scrollbarColor: "#94a3b8 #ffffff" }}>
            {/* ══ [E_ProductPreviewsHeader] "Product Previews" toggle row (draggable whole-list). */}
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

              {/* ══ [E_ProductPreviewRows] List of individual draggable product rows (drag to canvas). */}
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

            {/* ══ [E_SkillCategories] Each skill category (auto, etc.) with its draggable skill rows. */}
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
                  {/* ══ [E_CategoryHeader] Collapsible category header row (icon, name, count, chevron). */}
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

                  {/* ══ [E_CategorySkillsList] The draggable skill rows inside an expanded category. */}
                  {/* Skills List (Tree structure) */}
                  {isExpanded && (
                    <div style={{ position: "relative", paddingLeft: 23, marginTop: 4, display: "flex", flexDirection: "column", gap: 4 }}>
                      <div style={{ position: "absolute", left: 23, top: 0, bottom: 16, width: 1, background: "#e5e7eb" }} />

                      {/* ══ [E_CategorySkillRow] Individual draggable skill row (drag onto canvas). */}
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

      {/* ══ [E_SkillTooltip] Pop-out tooltip shown when hovering the info icon on a skill. */}
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

      {/* ── Modal (always on top) ── ══ [E_GroupSizeModalRender] */}
      {showSizeModal && <GroupSizeModal productCount={realProducts.length} onConfirm={handleGenerate} onClose={onBack} aiConfig={aiConfig} />}

      {/* ══ [E_DrawToolbar] RIGHT drawing toolbar: cursor modes, draw tools, colors, CLEAR. */}
      {/* ── Drawing Toolbar ── */}
      <div style={{ position: "fixed", right: 20, top: "50%", transform: "translateY(-50%)", background: "#1e293b", padding: "16px 10px", borderRadius: 100, display: "flex", flexDirection: "column", alignItems: "center", gap: 16, zIndex: 9999, boxShadow: "0 10px 25px rgba(0,0,0,0.2)" }}>
        {/* ══ [E_DrawToolModes] Tool mode icons: Arrow (select) / Hand (pan) / Rectangle / Circle. */}
        {/* Modes */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <button onClick={() => { setMode(null); setCursorMode('select'); }} title="Arrow (Select & Pan)" style={{ background: drawingMode === null && cursorMode === 'select' ? "#3b82f6" : "transparent", color: drawingMode === null && cursorMode === 'select' ? "#fff" : "#94a3b8", border: "none", width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><DynamicIcon name="MousePointer2" size={18} /></button>
          <button onClick={() => { setMode(null); setCursorMode('hand'); }} title="Hand (Pan)" style={{ background: cursorMode === 'hand' ? "#3b82f6" : "transparent", color: cursorMode === 'hand' ? "#fff" : "#94a3b8", border: "none", width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><DynamicIcon name="Hand" size={18} /></button>
          <div style={{ width: 20, height: 1, background: "#334155" }} />
          <button onClick={() => setMode('rect')} title="Draw Rectangle" style={{ background: drawingMode === 'rect' ? "#3b82f6" : "transparent", color: drawingMode === 'rect' ? "#fff" : "#94a3b8", border: "none", width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><DynamicIcon name="Square" size={18} /></button>
          <button onClick={() => setMode('circle')} title="Draw Circle" style={{ background: drawingMode === 'circle' ? "#3b82f6" : "transparent", color: drawingMode === 'circle' ? "#fff" : "#94a3b8", border: "none", width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><DynamicIcon name="Circle" size={18} /></button>
        </div>
        <div style={{ width: 20, height: 1, background: "#334155" }} />
        {/* ══ [E_DrawColorDots] Color palette for drawing shapes. */}
        {/* Colors */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          {["#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#94a3b8"].map(c => (
            <button key={c} onClick={() => setColor(c)} style={{ background: c, width: 24, height: 24, borderRadius: "50%", border: currentColor === c ? "2px solid #fff" : "2px solid transparent", cursor: "pointer", boxShadow: currentColor === c ? "0 0 0 2px #3b82f6" : "none" }} />
          ))}
        </div>
        <div style={{ width: 20, height: 1, background: "#334155" }} />
        {/* ══ [E_DrawClearBtn] "CLEAR" — removes all drawn shapes. */}
        <button onClick={() => setDrawnShapes([])} style={{ background: "transparent", color: "#ef4444", border: "none", padding: "6px 0", fontSize: 10, fontWeight: 700, cursor: "pointer", fontFamily: "monospace" }}>CLEAR</button>
      </div>

      {/* ══ [E_ContextMenu] RIGHT-CLICK MENU — switch cursor (Arrow/Hand), delete selected line/shape, or clear all. */}
      {/* ── Right-Click Context Menu ── */}
      {contextMenu && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: "fixed", left: contextMenu.x, top: contextMenu.y, zIndex: 10002,
            background: "#fff", border: "1px solid #d1d9e0", borderRadius: 10,
            boxShadow: "0 10px 30px rgba(0,0,0,0.18)", padding: "4px", minWidth: 190,
            fontFamily: "system-ui, -apple-system, sans-serif"
          }}
        >
          <div style={{ padding: "6px 10px 4px", fontSize: 9, fontFamily: "monospace", textTransform: "uppercase", letterSpacing: 1, color: "#94a3b8" }}>Cursor Mode</div>
          {/* ══ [E_ContextMenuItem_Arrow] Menu item: switch to Arrow (Select) cursor. */}
          <button
            onClick={() => { setCursorMode('select'); setMode(null); setContextMenu(null); }}
            style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "8px 10px", border: "none", background: cursorMode === 'select' ? "#eff6ff" : "transparent", borderRadius: 7, cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#0f172a" }}
          >
            <DynamicIcon name="MousePointer2" size={15} color={cursorMode === 'select' ? "#2563eb" : "#64748b"} />
            Arrow (Select)
            {cursorMode === 'select' && <span style={{ marginLeft: "auto", color: "#2563eb", fontSize: 12 }}>✓</span>}
          </button>
          {/* ══ [E_ContextMenuItem_Hand] Menu item: switch to Hand (Pan) cursor. */}
          <button
            onClick={() => { setCursorMode('hand'); setMode(null); setContextMenu(null); }}
            style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "8px 10px", border: "none", background: cursorMode === 'hand' ? "#eff6ff" : "transparent", borderRadius: 7, cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#0f172a" }}
          >
            <DynamicIcon name="Hand" size={15} color={cursorMode === 'hand' ? "#2563eb" : "#64748b"} />
            Hand (Pan)
            {cursorMode === 'hand' && <span style={{ marginLeft: "auto", color: "#2563eb", fontSize: 12 }}>✓</span>}
          </button>

          <div style={{ height: 1, background: "#e2e8f0", margin: "6px 8px" }} />

          <div style={{ padding: "6px 10px 4px", fontSize: 9, fontFamily: "monospace", textTransform: "uppercase", letterSpacing: 1, color: "#94a3b8" }}>Actions</div>
          {/* ══ [E_ContextMenuItem_DelLine] Menu item: delete the currently selected connection line. */}
          <button
            onClick={() => {
              if (selectedConnection != null) setConnections(prev => prev.filter((_, idx) => idx !== selectedConnection));
              setSelectedConnection(null);
              setContextMenu(null);
            }}
            style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "8px 10px", border: "none", background: "transparent", borderRadius: 7, cursor: "pointer", fontSize: 13, fontWeight: 600, color: selectedConnection != null ? "#0f172a" : "#94a3b8" }}
          >
            <DynamicIcon name="Unlink" size={15} color={selectedConnection != null ? "#ef4444" : "#cbd5e1"} />
            Delete Selected Line
          </button>
          {/* ══ [E_ContextMenuItem_DelShape] Menu item: delete the currently selected drawn shape. */}
          <button
            onClick={() => {
              if (selectedShapeId) setDrawnShapes(prev => prev.filter(s => s.id !== selectedShapeId));
              setSelectedShapeId(null);
              setContextMenu(null);
            }}
            style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "8px 10px", border: "none", background: "transparent", borderRadius: 7, cursor: "pointer", fontSize: 13, fontWeight: 600, color: selectedShapeId != null ? "#0f172a" : "#94a3b8" }}
          >
            <DynamicIcon name="Square" size={15} color={selectedShapeId != null ? "#ef4444" : "#cbd5e1"} />
            Delete Selected Shape
          </button>
          {/* ══ [E_ContextMenuItem_DelAllLines] Menu item: delete all connection lines. */}
          <button
            onClick={() => { setConnections([]); setSelectedConnection(null); setContextMenu(null); }}
            style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "8px 10px", border: "none", background: "transparent", borderRadius: 7, cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#0f172a" }}
          >
            <DynamicIcon name="Trash2" size={15} color="#ef4444" />
            Delete All Lines
          </button>
          {/* ══ [E_ContextMenuItem_DelAllShapes] Menu item: delete all drawn shapes. */}
          <button
            onClick={() => { setDrawnShapes([]); setSelectedShapeId(null); setContextMenu(null); }}
            style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "8px 10px", border: "none", background: "transparent", borderRadius: 7, cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#0f172a" }}
          >
            <DynamicIcon name="Eraser" size={15} color="#ef4444" />
            Delete All Shapes
          </button>
        </div>
      )}

      {/* ══ [E_NodeMenu] SKILL-NODE right-click menu: Copy / Copy Code / F12 inspect. */}
      {nodeMenu && (() => {
        const nmSkill = skills.find(s => s.id === nodeMenu.skillId);
        const hasResult = !!(nmSkill && nmSkill.result && (skillToText(nmSkill) || skillToCode(nmSkill)));
        return (
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "fixed", left: nodeMenu.x, top: nodeMenu.y, zIndex: 10003,
              background: "#fff", border: "1px solid #d1d9e0", borderRadius: 10,
              boxShadow: "0 10px 30px rgba(0,0,0,0.18)", padding: "4px", minWidth: 200,
              fontFamily: "system-ui, -apple-system, sans-serif"
            }}
          >
            <div style={{ padding: "6px 10px 4px", fontSize: 9, fontFamily: "monospace", textTransform: "uppercase", letterSpacing: 1, color: "#94a3b8" }}>Skill Node</div>
            {/* ══ [E_NodeMenuItem_Copy] Copy the skill result as plain text. */}
            <button
              onClick={() => handlerNodeCopy(nodeMenu.skillId, 'text')}
              disabled={!hasResult}
              style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "8px 10px", border: "none", background: "transparent", borderRadius: 7, cursor: hasResult ? "pointer" : "not-allowed", fontSize: 13, fontWeight: 600, color: hasResult ? "#0f172a" : "#94a3b8" }}
            >
              <DynamicIcon name="Copy" size={15} color={hasResult ? "#2563eb" : "#cbd5e1"} />
              Copy <span style={{ fontWeight: 400, color: hasResult ? "#64748b" : "#cbd5e1" }}>(result text)</span>
            </button>
            {/* ══ [E_NodeMenuItem_CopyCode] Copy the raw result as code (HTML/JSON). */}
            <button
              onClick={() => handlerNodeCopy(nodeMenu.skillId, 'code')}
              disabled={!hasResult}
              style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "8px 10px", border: "none", background: "transparent", borderRadius: 7, cursor: hasResult ? "pointer" : "not-allowed", fontSize: 13, fontWeight: 600, color: hasResult ? "#0f172a" : "#94a3b8" }}
            >
              <DynamicIcon name="FileCode2" size={15} color={hasResult ? "#7c3aed" : "#cbd5e1"} />
              Copy Code <span style={{ fontWeight: 400, color: hasResult ? "#64748b" : "#cbd5e1" }}>(HTML/JSON)</span>
            </button>
            <div style={{ height: 1, background: "#e2e8f0", margin: "6px 8px" }} />
            {/* ══ [E_NodeMenuItem_Inspect] F12 devtools-style code viewer + copy. */}
            <button
              onClick={() => { setInspector({ skillId: nodeMenu.skillId }); setNodeMenu(null); }}
              style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "8px 10px", border: "none", background: "transparent", borderRadius: 7, cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#0f172a" }}
            >
              <DynamicIcon name="Code2" size={15} color="#047857" />
              F12 — Inspect Code
            </button>
          </div>
        );
      })()}

      {/* ══ [E_InspectorModal] F12 code viewer: raw result (HTML/JSON), copy to clipboard, fullscreen panel. */}
      {inspector && (() => {
        const insSkill = skills.find(s => s.id === inspector.skillId);
        const insLabel = insSkill ? (SKILLS_DICT[insSkill.type] ? SKILLS_DICT[insSkill.type].label : insSkill.type) : "";
        const insCode = insSkill ? skillToCode(insSkill) : "";
        const insIsHtml = insSkill && (insSkill.type === 'landing_page_builder' || insSkill.type === 'liquid_prompt');
        return (
          <div
            tabIndex={-1} autoFocus
            onKeyDown={(e) => { if (e.key === 'Escape') setInspector(null); }}
            onClick={() => setInspector(null)}
            style={{ position: "fixed", inset: 0, zIndex: 10005, background: "rgba(15,23,42,0.65)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui, -apple-system, sans-serif" }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{ background: "#0b1220", border: "1px solid #334155", borderRadius: 14, width: "min(960px, 94vw)", maxHeight: "88vh", display: "flex", flexDirection: "column", overflow: "hidden" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderBottom: "1px solid #1e293b" }}>
                <DynamicIcon name="Code2" size={16} color="#34d399" />
                <div style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0" }}>
                  F12 INSPECTOR — {insLabel}
                </div>
                <span style={{ fontSize: 10, fontFamily: "monospace", padding: "2px 8px", borderRadius: 10, background: insIsHtml ? "#022c22" : "#312e81", color: insIsHtml ? "#6ee7b7" : "#a5b4fc", border: `1px solid ${insIsHtml ? "#065f46" : "#4338ca"}` }}>
                  {insIsHtml ? "HTML" : "JSON"}
                </span>
                <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
                  {insSkill && insSkill.lastPrompt && (
                    <button
                      onClick={async () => { const ok = await copyText(insSkill.lastPrompt + (insSkill.lastSchema ? "\\n\\nSCHEMA:\\n" + insSkill.lastSchema : "")); setFlashMsg(ok ? "Prompt copied!" : "Nothing to copy"); }}
                      style={{ display: "flex", alignItems: "center", gap: 6, background: "#3b82f6", color: "#eff6ff", border: "none", padding: "7px 14px", borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: "pointer" }}
                    >
                      <DynamicIcon name="FileText" size={13} /> COPY PROMPT
                    </button>
                  )}
                  <button
                    onClick={async () => { const ok = await copyText(insCode); setFlashMsg(ok ? "Copied!" : "Nothing to copy"); }}
                    style={{ display: "flex", alignItems: "center", gap: 6, background: "#10b981", color: "#022c22", border: "none", padding: "7px 14px", borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: "pointer" }}
                  >
                    <DynamicIcon name="Copy" size={13} /> COPY CODE
                  </button>
                  <button
                    onClick={() => setInspector(null)}
                    title="Close (Esc)"
                    style={{ background: "transparent", color: "#94a3b8", border: "none", cursor: "pointer", padding: 6, display: "flex" }}
                  >
                    <DynamicIcon name="X" size={18} />
                  </button>
                </div>
              </div>
              <div style={{ overflow: "auto", padding: "14px 16px", userSelect: "text" }}>
                {insCode ? (
                  <pre style={{ margin: 0, color: "#7dd3fc", fontSize: 12, lineHeight: 1.6, fontFamily: "'Cascadia Code', Consolas, monospace", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{insCode}</pre>
                ) : (
                  <div style={{ color: "#64748b", fontSize: 13, padding: 24, textAlign: "center" }}>No code output for this skill.</div>
                )}
              </div>
              <div style={{ padding: "8px 16px", borderTop: "1px solid #1e293b", fontSize: 10, fontFamily: "monospace", color: "#475569", display: "flex", justifyContent: "space-between" }}>
                <span>Close with Esc or click the backdrop</span>
                <span>{insCode.length.toLocaleString()} chars</span>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ══ [E_CopyToast] Small "Copied!" toast shown after a copy action. */}
      {flashMsg && (
        <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 10006, background: "#0f172a", color: "#e2e8f0", padding: "10px 18px", borderRadius: 10, fontSize: 12, fontWeight: 700, boxShadow: "0 10px 30px rgba(0,0,0,0.25)", display: "flex", alignItems: "center", gap: 8 }}>
          <DynamicIcon name="Check" size={14} color="#34d399" /> {flashMsg}
        </div>
      )}

      {/* ══ [E_LoadingOverlay] Full-screen overlay shown while AI groups are being generated. */}
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
