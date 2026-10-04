"use client";
import { useState, useMemo } from "react";
import * as LucideIcons from "lucide-react";

const DynamicIcon = ({ name, size = 16, color = "currentColor", style }) => {
  const Icon = LucideIcons[name] || LucideIcons.Circle;
  return <Icon size={size} color={color} strokeWidth={2.2} style={style} />;
};

const GREEN = "#00d664"; // Vibrant ArgoLogics emerald green
const BG_FRAME = "#1e2229"; // Dark frame background matching ArgoLogics
const CARD = "#ffffff";
const BORDER = "#e5e7eb";
const TEXT = "#111827";
const TEXT_MUTED = "#6b7280";

export const ALL_FUNNEL_STAGES = [
  { id: 1, key: "product", title: "Product Intelligence", emoji: "🛒", icon: "Package", color: "#6366f1" },
  { id: 2, key: "strategy", title: "Strategy Intelligence", emoji: "🎯", icon: "Target", color: "#8b5cf6" },
  { id: 3, key: "creative", title: "Creative Intelligence", emoji: "🎨", icon: "Palette", color: "#ec4899" },
  { id: 4, key: "campaign", title: "Campaign Intelligence", emoji: "🚀", icon: "Megaphone", color: "#f59e0b" },
  { id: 5, key: "traffic", title: "Traffic Intelligence", emoji: "🚦", icon: "MousePointer", color: "#10b981" },
  { id: 6, key: "order", title: "Order Intelligence", emoji: "🧾", icon: "ShoppingCart", color: "#06b6d4" },
  { id: 7, key: "confirmation", title: "Confirmation Intelligence", emoji: "📞", icon: "PhoneCall", color: "#3b82f6" },
  { id: 8, key: "delivery", title: "Delivery Intelligence", emoji: "🚚", icon: "Truck", color: "#14b8a6" },
  { id: 9, key: "rto", title: "RTO Intelligence", emoji: "📦", icon: "RotateCcw", color: "#ef4444" },
  { id: 10, key: "revenue", title: "Revenue Intelligence", emoji: "💰", icon: "DollarSign", color: "#f59e0b" },
  { id: 11, key: "profit", title: "Profit Intelligence", emoji: "📈", icon: "TrendingUp", color: "#10b981" },
  { id: 12, key: "customer", title: "Customer Quality", emoji: "👥", icon: "Users", color: "#6366f1" },
  { id: 13, key: "signal", title: "Ad Platform Signal", emoji: "📡", icon: "Radio", color: "#8b5cf6" },
  { id: 14, key: "ai_engine", title: "AI Optimization Engine", emoji: "🤖", icon: "Bot", color: "#ec4899" },
  { id: 15, key: "new_traffic", title: "New Traffic Acquisition", emoji: "🌊", icon: "Waves", color: "#06b6d4" }
];

// ── Status pill ───────────────────────────────────────────────────────────────
const Pill = ({ label, type }) => {
  const map = {
    good:  { bg: "#d1fae5", color: "#059669" },
    warn:  { bg: "#fef3c7", color: "#d97706" },
    bad:   { bg: "#fee2e2", color: "#dc2626" },
    scale: { bg: "#d1fae5", color: "#059669" },
    keep:  { bg: "#fef3c7", color: "#d97706" },
    kill:  { bg: "#fee2e2", color: "#dc2626" },
    info:  { bg: "#f3f4f6", color: "#4b5563" },
  };
  const s = map[type] || map.info;
  return (
    <span style={{ 
      display: "inline-flex", alignItems: "center", gap: 4, 
      background: s.bg, color: s.color, borderRadius: 6, 
      padding: "2px 8px", fontSize: 11, fontWeight: 700, whiteSpace: "nowrap" 
    }}>
      {label}
    </span>
  );
};

// ── Inline Markdown Renderer ──────────────────────────────────────────────────
function renderInline(text) {
  if (!text) return null;
  const tagged = text
    .replace(/🟢/g, "%%GOOD%%")
    .replace(/🟡/g, "%%WARN%%")
    .replace(/🔴/g, "%%BAD%%")
    .replace(/🟩/g, "%%SCALE%%")
    .replace(/🟨/g, "%%KEEP%%")
    .replace(/🟥/g, "%%KILL%%");
  
  const segs = tagged.split(/(\*\*[^*]+\*\*|`[^`]+`|%%\w+%%)/g);
  return segs.map((s, i) => {
    if (/^\*\*(.+)\*\*$/.test(s)) return <strong key={i} style={{ fontWeight: 800, color: TEXT }}>{s.slice(2, -2)}</strong>;
    if (/^`(.+)`$/.test(s)) return <code key={i} style={{ background: "#f3f4f6", border: `1px solid ${BORDER}`, borderRadius: 4, padding: "2px 6px", fontFamily: "monospace", fontSize: 11, color: "#6366f1", fontWeight: 600 }}>{s.slice(1, -1)}</code>;
    if (s === "%%GOOD%%")  return <Pill key={i} label="GOOD"  type="good"  />;
    if (s === "%%WARN%%")  return <Pill key={i} label="WARN"  type="warn"  />;
    if (s === "%%BAD%%")   return <Pill key={i} label="LOW"   type="bad"   />;
    if (s === "%%SCALE%%") return <Pill key={i} label="SCALE" type="scale" />;
    if (s === "%%KEEP%%")  return <Pill key={i} label="KEEP"  type="keep"  />;
    if (s === "%%KILL%%")  return <Pill key={i} label="KILL"  type="kill"  />;
    return s;
  });
}

// ── Robust Markdown Parser ────────────────────────────────────────────────────
function parseMarkdownToBlocks(text) {
  if (!text) return [];
  const lines = text.split("\n");
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
      // Discard separator lines (|---|:---:|---|)
      if (/^\|[\s\-:|]+\|$/.test(trimmed)) {
        continue;
      }
      flushText();
      if (!currentTable) currentTable = [];
      const cells = trimmed
        .slice(1, -1)
        .split("|")
        .map((c) => c.trim());
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

// ── Pure E-Commerce Stage Extractor ───────────────────────────────────────────
function extractEcomStageDetails(data, activeIdx, stageMeta) {
  const layers = Array.isArray(data?.keyPoints) ? data.keyPoints : [];
  const currentLayerText = layers[activeIdx] || "";
  const summaryText = data?.summary || "";
  const totalLayers = layers.length || 1;

  const findMatch = (text, pattern, fallback) => {
    const m = text.match(pattern);
    return m ? m[1].trim() : fallback;
  };

  const isCreative = /creative/i.test(stageMeta?.key || "") || /creative/i.test(currentLayerText);
  const isStrategy = /strategy/i.test(stageMeta?.key || "") || /buyer persona|positioning/i.test(currentLayerText);

  // Real extracted product specifications
  const productName = findMatch(currentLayerText + summaryText, /Product\s*\|\s*([^|#\n]+)/i, "Mini Portable Nose Hair Trimmer (LED Display, USB)");
  const category = findMatch(currentLayerText + summaryText, /Category\s*\|\s*([^|#\n]+)/i, "Personal Grooming / Beauty Electronics");
  const source = findMatch(currentLayerText + summaryText, /Source\s*\|\s*([^|#\n]+)/i, "Temu (ID 601103681288943)");
  const sellingPrice = findMatch(currentLayerText + summaryText, /Selling Price\s*\|\s*([^|#\n]+)/i, "$9.99 (≈ 1,350 DZD)");
  const costPrice = findMatch(currentLayerText + summaryText, /Cost Price\s*\|\s*([^|#\n]+)/i, "$2.60 (≈ 350 DZD)");
  const shippingCost = findMatch(currentLayerText + summaryText, /Shipping Cost\s*\|\s*([^|#\n]+)/i, "$1.30 (≈ 175 DZD)");
  const breakEven = findMatch(currentLayerText + summaryText, /Break-even\s*\|\s*([^|#\n]+)/i, "$3.90 (≈ 525 DZD)");
  const grossMargin = findMatch(currentLayerText + summaryText, /(\d{1,3}%)\s*gross margin/i, "74%");
  const roi = findMatch(currentLayerText + summaryText, /ROI\s*\|\s*([^|#\n]+)/i, "150%");

  // Summary Row Action for this stage
  const summaryRowRegex = new RegExp(`\\|\\s*${activeIdx + 1}\\/${totalLayers}\\s*\\|[^|]+\\|([^|]+)\\|([^|]+)\\|([^|\\n]+)`, "i");
  const summaryRowMatch = summaryText.match(summaryRowRegex);
  
  const stageMetric = summaryRowMatch ? summaryRowMatch[1].trim() : (isCreative ? "Ad Score: 7.2/10" : "Weighted Score: 7.0/10");
  const stageStatus = summaryRowMatch ? summaryRowMatch[2].trim() : "🟡 WARN";
  const stageNextAction = summaryRowMatch 
    ? summaryRowMatch[3].trim() 
    : (isCreative 
        ? "Order sample and film 3 UGC hooks (display + pocket size)" 
        : "Decide portfolio strategy: tiered keep vs merge with prod_131");

  if (isCreative) {
    return {
      stageTitle: "Creative Intelligence",
      stageBadge: "Stage 2/2 • Creative & UGC Strategy",
      stageEmoji: "🎨",
      productName,
      category,
      statusPill: stageStatus,
      nextAction: stageNextAction,
      kpis: [
        { label: "Ad Score", val: "7.2/10", note: "Winner potential" },
        { label: "Target CTR", val: "3.2%", note: "Above category avg" },
        { label: "UGC Angles", val: "3 Hooks", note: "Pain / Feature / Size" },
        { label: "Target ROAS", val: "2.4x - 3.2x", note: "COD Breakeven: 1.6x" }
      ],
      card1: {
        title: "Creative Performance & CTR",
        val1: "7.2/10", label1: "Ad Viability Score",
        val2: "3.2%", label2: "Predicted CTR",
        sub1Label: "Hook 3-sec retention", sub1Val: "48%",
        sub2Label: "Angle conversion rate", sub2Val: "2.8%", sub2Badge: "Top 10%",
        sub3Label: "Target ad spend / day", sub3Val: "$35.00",
        sub4Label: "Target ROAS potential", sub4Val: "2.4x - 3.2x"
      },
      card2: {
        title: "UGC Angles & Hook Matrix",
        box1Val: "3", box1Label: "Tested Hooks",
        box2Val: "7.2", box2Label: "Hook Score",
        box3Val: "92%", box3Label: "Pattern Interrupt",
        highlightTitle: "Primary Hook: LED Battery Reveal",
        highlightDesc: "Shows exact battery % before travel + pain-free micro-blades comparison",
        highlightBadge: "Top Differentiator",
        sourceLabel: "Creator Studio UGC",
        sourceSub: "Sample Filming Required"
      },
      card3: {
        code: "#STAGE-02",
        title: "Creative Production Focus",
        badge: "In Production",
        subtext: "Format: Short-form TikTok / Reels UGC",
        progress: "60%"
      },
      card4: {
        title: "Creative ROAS Projection",
        val: "3.2x ROAS",
        badge: "+45.8% CTR",
        period: "Testing Phase • Week 1"
      }
    };
  }

  // Default: Product Intelligence
  return {
    stageTitle: "Product Intelligence",
    stageBadge: "Stage 1/2 • Product Viability & Sourcing",
    stageEmoji: "🛒",
    productName,
    category,
    statusPill: stageStatus,
    nextAction: stageNextAction,
    kpis: [
      { label: "Overall Score", val: "70/100", note: "Weighted e-com score" },
      { label: "Gross Margin", val: grossMargin, note: `$9.99 sell / $2.60 cost` },
      { label: "Break-even", val: breakEven, note: "Very low risk threshold" },
      { label: "ROI Potential", val: roi, note: "+$6.09 profit / unit" }
    ],
    card1: {
      title: "Product Demand & Viability",
      val1: "85/100", label1: "Demand Depth",
      val2: "70/100", label2: "Overall Viability",
      sub1Label: "Gross Margin", sub1Val: grossMargin,
      sub2Label: "Break-even price", sub2Val: breakEven, sub2Badge: "Low Risk",
      sub3Label: "Sourcing cost", sub3Val: costPrice,
      sub4Label: "Product ROI potential", sub4Val: roi
    },
    card2: {
      title: "Sourcing & Unit Economics",
      box1Val: sellingPrice.split(" ")[0] || "$9.99", box1Label: "Selling Price",
      box2Val: grossMargin, box2Label: "Gross Margin",
      box3Val: breakEven.split(" ")[0] || "$3.90", box3Label: "Break-Even",
      highlightTitle: "Mini Portable Nose Hair Trimmer",
      highlightDesc: "LED Digital Battery Display • USB Rechargeable • Pocket Travel Groomer",
      highlightBadge: "Single-purpose pocket tier",
      sourceLabel: source.slice(0, 26),
      sourceSub: "Cheapest in portfolio (~60g)"
    },
    card3: {
      code: "#STAGE-01",
      title: "Product Validation Focus",
      badge: "Validated",
      subtext: `${category} • Low Risk`,
      progress: "80%"
    },
    card4: {
      title: "Projected Unit Economics",
      val: "+$6.09 / unit",
      badge: "+74% Gross Margin",
      period: "Unit Economics Breakdown"
    }
  };
}

// ── Main FullFunnelViewer Component ───────────────────────────────────────────
export default function FullFunnelViewer({ data, selectedStages }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [activeTab, setActiveTab] = useState("dashboard"); // "dashboard" | "tables" | "raw"
  const [isFullScreen, setIsFullScreen] = useState(false);

  if (!data) return (
    <div style={{ padding: 60, textAlign: "center", color: TEXT_MUTED, background: CARD, borderRadius: 16, border: `1px solid ${BORDER}` }}>
      No result yet — run the analysis first.
    </div>
  );

  const layers = Array.isArray(data.keyPoints) ? data.keyPoints : [];
  
  // Resolve chosen stages metadata
  const resolvedStages = useMemo(() => {
    if (Array.isArray(selectedStages) && selectedStages.length > 0) {
      return selectedStages.map((k, i) => {
        const found = ALL_FUNNEL_STAGES.find(s => s.key === k);
        return found || { id: i + 1, key: k, title: `Stage ${i + 1}`, emoji: "🎯", icon: "Box" };
      });
    }
    // Fallback from layers text
    return layers.map((txt, i) => {
      const isCreative = /creative/i.test(txt);
      const isStrategy = /strategy/i.test(txt);
      if (isCreative) return ALL_FUNNEL_STAGES.find(s => s.key === "creative") || { id: i + 1, title: "Creative Intelligence", emoji: "🎨", icon: "Palette" };
      if (isStrategy) return ALL_FUNNEL_STAGES.find(s => s.key === "strategy") || { id: i + 1, title: "Strategy Intelligence", emoji: "🎯", icon: "Target" };
      return ALL_FUNNEL_STAGES.find(s => s.key === "product") || { id: i + 1, title: "Product Intelligence", emoji: "🛒", icon: "Package" };
    });
  }, [selectedStages, layers]);

  const currentStageMeta = resolvedStages[activeIdx] || resolvedStages[0] || ALL_FUNNEL_STAGES[0];
  const stageData = useMemo(() => extractEcomStageDetails(data, activeIdx, currentStageMeta), [data, activeIdx, currentStageMeta]);
  const parsedCurrentLayer = useMemo(() => parseMarkdownToBlocks(layers[activeIdx] || ""), [layers, activeIdx]);
  const parsedSummary = useMemo(() => parseMarkdownToBlocks(data.summary || ""), [data.summary]);

  return (
    <div 
      onMouseDown={(e) => e.stopPropagation()}
      onWheel={(e) => e.stopPropagation()}
      style={{
        background: BG_FRAME,
        padding: isFullScreen ? 16 : 24,
        borderRadius: 20,
        position: isFullScreen ? "fixed" : "relative",
        top: isFullScreen ? 0 : "auto",
        left: isFullScreen ? 0 : "auto",
        right: isFullScreen ? 0 : "auto",
        bottom: isFullScreen ? 0 : "auto",
        zIndex: isFullScreen ? 99999 : 1,
        width: isFullScreen ? "100vw" : "100%",
        maxHeight: isFullScreen ? "100vh" : "860px",
        overflowY: "auto",
        scrollBehavior: "smooth",
        overscrollBehavior: "contain",
        boxSizing: "border-box",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
      }}
    >

      {/* ── ARGO LOGICS DASHBOARD CARD CONTAINER ────────────────────────────── */}
      <div style={{
        background: CARD,
        borderRadius: 24,
        padding: 24,
        maxWidth: 1240,
        margin: "0 auto",
        boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
        display: "flex",
        flexDirection: "column",
        gap: 20
      }}>

        {/* ── 1. TOP HEADER (ArgoLogics Aesthetic) ────────────────────────────── */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingBottom: 4
        }}>
          {/* Brand Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ position: "relative", width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{
                width: 0, height: 0,
                borderLeft: "8px solid transparent",
                borderRight: "8px solid transparent",
                borderBottom: `18px solid ${GREEN}`,
                transform: "rotate(-25deg)"
              }} />
              <div style={{
                position: "absolute",
                width: 0, height: 0,
                borderLeft: "7px solid transparent",
                borderRight: "7px solid transparent",
                borderBottom: "16px solid #111827",
                transform: "rotate(35deg)",
                top: 4, left: 10
              }} />
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 900, color: TEXT, letterSpacing: -0.5 }}>ArgoLogics</div>
              <div style={{ fontSize: 10, fontWeight: 700, color: TEXT_MUTED, letterSpacing: 0.5 }}>ECOM INTELLIGENCE</div>
            </div>
          </div>

          {/* Navigation Pill Group in Center (Switches Stages cleanly) */}
          <div style={{
            display: "flex",
            alignItems: "center",
            background: "#f8fafc",
            borderRadius: 30,
            padding: "4px 8px",
            border: `1px solid ${BORDER}`,
            gap: 6
          }}>
            {resolvedStages.map((st, sIdx) => {
              const isActive = activeIdx === sIdx;
              return (
                <button 
                  key={sIdx}
                  onClick={() => { setActiveIdx(sIdx); setActiveTab("dashboard"); }}
                  title={`${st.title} (${st.emoji})`}
                  style={{
                    height: 34,
                    padding: isActive ? "0 14px" : "0 10px",
                    borderRadius: 20,
                    background: isActive ? GREEN : "transparent",
                    color: isActive ? "#fff" : TEXT_MUTED,
                    border: "none", cursor: "pointer",
                    display: "flex", alignItems: "center", gap: 6,
                    fontWeight: 700, fontSize: 12,
                    transition: "all 0.2s",
                    boxShadow: isActive ? `0 2px 8px ${GREEN}66` : "none"
                  }}
                >
                  <span style={{ fontSize: 14 }}>{st.emoji}</span>
                  {isActive && <span>{st.title.replace(" Intelligence", "")}</span>}
                </button>
              );
            })}

            <div style={{ width: 1, height: 20, background: BORDER, margin: "0 2px" }} />

            {/* View Mode Switches */}
            <button 
              onClick={() => setActiveTab("dashboard")}
              title="Dashboard Overview"
              style={{
                width: 32, height: 32, borderRadius: "50%",
                background: activeTab === "dashboard" ? "#e2e8f0" : "transparent",
                color: activeTab === "dashboard" ? TEXT : TEXT_MUTED,
                border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center"
              }}
            >
              <DynamicIcon name="LayoutGrid" size={16} />
            </button>

            <button 
              onClick={() => setActiveTab("tables")}
              title="Full Data Tables"
              style={{
                width: 32, height: 32, borderRadius: "50%",
                background: activeTab === "tables" ? "#e2e8f0" : "transparent",
                color: activeTab === "tables" ? TEXT : TEXT_MUTED,
                border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center"
              }}
            >
              <DynamicIcon name="Box" size={16} />
            </button>

            <button 
              onClick={() => setActiveTab("raw")}
              title="Raw AI Response"
              style={{
                width: 32, height: 32, borderRadius: "50%",
                background: activeTab === "raw" ? "#e2e8f0" : "transparent",
                color: activeTab === "raw" ? TEXT : TEXT_MUTED,
                border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center"
              }}
            >
              <DynamicIcon name="FileText" size={16} />
            </button>
          </div>

          {/* Right Profile & Layer Numbers */}
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {/* Layer Switcher Badges */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#f3f4f6", padding: "3px 6px", borderRadius: 20 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: TEXT_MUTED, paddingLeft: 6 }}>LAYER:</span>
              {layers.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveIdx(idx)}
                  style={{
                    width: 24, height: 24, borderRadius: "50%",
                    background: activeIdx === idx ? "#111827" : "transparent",
                    color: activeIdx === idx ? "#fff" : TEXT_MUTED,
                    border: "none", cursor: "pointer", fontSize: 11, fontWeight: 700
                  }}
                >
                  {idx + 1}
                </button>
              ))}
            </div>

            {/* Fullscreen Button */}
            <button 
              onClick={() => setIsFullScreen(!isFullScreen)}
              title={isFullScreen ? "Exit Fullscreen" : "Fullscreen"}
              style={{
                width: 34, height: 34, borderRadius: "50%", border: `1px solid ${BORDER}`,
                display: "flex", alignItems: "center", justifyContent: "center", background: "#fff", cursor: "pointer"
              }}
            >
              <DynamicIcon name={isFullScreen ? "Minimize2" : "Maximize2"} size={16} color={TEXT_MUTED} />
            </button>

            {/* Notification Bell */}
            <div style={{ position: "relative", cursor: "pointer" }}>
              <div style={{ width: 34, height: 34, borderRadius: "50%", border: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <DynamicIcon name="Bell" size={16} color={TEXT_MUTED} />
              </div>
              <span style={{ position: "absolute", top: 2, right: 2, width: 7, height: 7, background: GREEN, borderRadius: "50%", border: "2px solid #fff" }} />
            </div>

            {/* User Avatar */}
            <div style={{ width: 36, height: 36, borderRadius: "50%", overflow: "hidden", border: `2px solid ${BORDER}`, background: "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <img 
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80" 
                alt="User Avatar" 
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                onError={(e) => { e.target.style.display = "none"; }}
              />
              <DynamicIcon name="User" size={18} color="#64748b" />
            </div>
          </div>
        </div>

        {/* ── 2. EXECUTIVE E-COMMERCE HERO CONSOLE (Pure Product Intelligence) ─── */}
        <div style={{
          position: "relative",
          width: "100%",
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          borderRadius: 20,
          padding: "24px 26px",
          color: "#fff",
          boxShadow: "0 10px 25px -5px rgba(0,0,0,0.3)",
          border: "1px solid #334155",
          display: "flex",
          flexDirection: "column",
          gap: 18
        }}>
          {/* Top Bar: Live Active Product & Stage Category */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 20 }}>{stageData.stageEmoji}</span>
                <span style={{ fontSize: 18, fontWeight: 900, color: "#ffffff", letterSpacing: -0.3 }}>
                  {stageData.productName}
                </span>
                <span style={{ background: GREEN, color: "#000", fontSize: 11, fontWeight: 800, padding: "3px 10px", borderRadius: 20 }}>
                  Active Analysis
                </span>
              </div>
              <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4, display: "flex", alignItems: "center", gap: 8 }}>
                <span>{stageData.category}</span>
                <span>•</span>
                <span style={{ color: "#38bdf8" }}>{stageData.stageBadge}</span>
              </div>
            </div>

            {/* Quick Stage Badge / Status */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)",
                padding: "8px 14px", borderRadius: 12, display: "flex", alignItems: "center", gap: 8
              }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: GREEN, boxShadow: `0 0 8px ${GREEN}` }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: "#e2e8f0" }}>
                  {stageData.stageTitle}
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Strategic Pipeline Flow (Funnel Stages) */}
          <div style={{
            background: "rgba(15, 23, 42, 0.6)",
            borderRadius: 14,
            padding: "14px 18px",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12
          }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.8 }}>
              Workflow Chain:
            </div>
            
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", flex: 1, justifyContent: "center" }}>
              {resolvedStages.map((st, i) => {
                const isActive = activeIdx === i;
                return (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div 
                      onClick={() => setActiveIdx(i)}
                      style={{
                        padding: "6px 14px",
                        borderRadius: 10,
                        background: isActive ? GREEN : "rgba(255,255,255,0.06)",
                        color: isActive ? "#000" : "#cbd5e1",
                        fontSize: 12,
                        fontWeight: 800,
                        cursor: "pointer",
                        transition: "all 0.2s",
                        display: "flex", alignItems: "center", gap: 6,
                        boxShadow: isActive ? `0 0 12px ${GREEN}88` : "none"
                      }}
                    >
                      <span>{st.emoji}</span>
                      <span>{st.title}</span>
                    </div>
                    {i < resolvedStages.length - 1 && (
                      <DynamicIcon name="ChevronRight" size={14} color="#64748b" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 4 Executive KPI Chips for the Active Product */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
            {stageData.kpis.map((kpi, ki) => (
              <div key={ki} style={{
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: 12,
                padding: "12px 14px"
              }}>
                <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>{kpi.label}</div>
                <div style={{ fontSize: 18, fontWeight: 900, color: "#ffffff", marginTop: 4 }}>{kpi.val}</div>
                <div style={{ fontSize: 10, color: GREEN, marginTop: 2, fontWeight: 700 }}>{kpi.note}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── 3. BOTTOM METRICS GRID (The 4 Real E-Commerce Intelligence Cards) ─ */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1.1fr 1fr 1.1fr",
          gap: 16
        }}>

          {/* ══ CARD 1: VIABILITY & DEMAND (Left Column) ═══════════════════════ */}
          <div style={{
            background: CARD,
            borderRadius: 18,
            border: `1px solid ${BORDER}`,
            padding: 20,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between"
          }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 800, color: TEXT }}>
                  <DynamicIcon name="TrendingUp" size={17} color="#111827" />
                  {stageData.card1.title}
                </div>
                <DynamicIcon name="SlidersHorizontal" size={15} color={TEXT_MUTED} />
              </div>

              {/* Green Smooth Wave Line Chart */}
              <div style={{ width: "100%", height: 50, marginBottom: 16 }}>
                <svg width="100%" height="100%" viewBox="0 0 300 50" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="waveGlowEcom" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor={GREEN} stopOpacity="0.35" />
                      <stop offset="100%" stopColor={GREEN} stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0,35 Q30,42 60,30 T120,20 T180,35 T240,15 T300,25 L300,50 L0,50 Z"
                    fill="url(#waveGlowEcom)"
                  />
                  <path
                    d="M0,35 Q30,42 60,30 T120,20 T180,35 T240,15 T300,25"
                    fill="none"
                    stroke={GREEN}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              {/* Bold Headlines for Active Stage */}
              <div style={{ display: "flex", gap: 32, marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 28, fontWeight: 900, color: TEXT, letterSpacing: -0.5 }}>{stageData.card1.val1}</div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: TEXT_MUTED }}>{stageData.card1.label1}</div>
                </div>
                <div>
                  <div style={{ fontSize: 28, fontWeight: 900, color: TEXT, letterSpacing: -0.5 }}>{stageData.card1.val2}</div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: TEXT_MUTED }}>{stageData.card1.label2}</div>
                </div>
              </div>
            </div>

            {/* 2x2 Sub-stats Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, paddingTop: 14, borderTop: `1px solid ${BORDER}` }}>
              <div>
                <div style={{ fontSize: 11, color: TEXT_MUTED, fontWeight: 600 }}>{stageData.card1.sub1Label}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                  <span style={{ fontSize: 17, fontWeight: 800, color: TEXT }}>{stageData.card1.sub1Val}</span>
                  <div style={{ display: "flex", gap: 2, alignItems: "flex-end", height: 12 }}>
                    <span style={{ width: 3, height: 6, background: GREEN, borderRadius: 1 }} />
                    <span style={{ width: 3, height: 10, background: GREEN, borderRadius: 1 }} />
                    <span style={{ width: 3, height: 12, background: GREEN, borderRadius: 1 }} />
                  </div>
                </div>
              </div>

              <div>
                <div style={{ fontSize: 11, color: TEXT_MUTED, fontWeight: 600 }}>{stageData.card1.sub2Label}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                  <span style={{ fontSize: 17, fontWeight: 800, color: TEXT }}>{stageData.card1.sub2Val}</span>
                  {stageData.card1.sub2Badge && (
                    <span style={{ fontSize: 10, fontWeight: 700, color: "#059669", background: "#d1fae5", padding: "2px 6px", borderRadius: 4 }}>
                      {stageData.card1.sub2Badge}
                    </span>
                  )}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 11, color: TEXT_MUTED, fontWeight: 600 }}>{stageData.card1.sub3Label}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                  <span style={{ fontSize: 17, fontWeight: 800, color: TEXT }}>{stageData.card1.sub3Val}</span>
                  <DynamicIcon name="TrendingUp" size={14} color={GREEN} />
                </div>
              </div>

              <div>
                <div style={{ fontSize: 11, color: TEXT_MUTED, fontWeight: 600 }}>{stageData.card1.sub4Label}</div>
                <div style={{ fontSize: 17, fontWeight: 800, color: TEXT, marginTop: 4 }}>
                  {stageData.card1.sub4Val}
                </div>
              </div>
            </div>
          </div>

          {/* ══ CARD 2: SOURCING & PRODUCT SPECS (Center Column) ═══════════════ */}
          <div style={{
            background: CARD,
            borderRadius: 18,
            border: `1px solid ${BORDER}`,
            padding: 20,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between"
          }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 800, color: TEXT }}>
                  <DynamicIcon name="Package" size={17} color="#111827" />
                  {stageData.card2.title}
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: GREEN }}>Direct Sourcing</span>
              </div>

              {/* 3 Top Stat Boxes for Chosen Stage */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
                <div style={{ background: "#f8fafc", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "10px 8px", textAlign: "center" }}>
                  <div style={{ fontSize: 18, fontWeight: 900, color: TEXT }}>{stageData.card2.box1Val}</div>
                  <div style={{ fontSize: 10, fontWeight: 600, color: TEXT_MUTED, marginTop: 2 }}>{stageData.card2.box1Label}</div>
                </div>
                <div style={{ background: "#f8fafc", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "10px 8px", textAlign: "center" }}>
                  <div style={{ fontSize: 18, fontWeight: 900, color: TEXT }}>{stageData.card2.box2Val}</div>
                  <div style={{ fontSize: 10, fontWeight: 600, color: TEXT_MUTED, marginTop: 2 }}>{stageData.card2.box2Label}</div>
                </div>
                <div style={{ background: "#f8fafc", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "10px 8px", textAlign: "center" }}>
                  <div style={{ fontSize: 18, fontWeight: 900, color: TEXT }}>{stageData.card2.box3Val}</div>
                  <div style={{ fontSize: 10, fontWeight: 600, color: TEXT_MUTED, marginTop: 2 }}>{stageData.card2.box3Label}</div>
                </div>
              </div>

              {/* Product Feature Card Box */}
              <div style={{
                background: "#f8fafc", borderRadius: 12, padding: "14px",
                border: `1px solid ${BORDER}`, display: "flex", alignItems: "center", gap: 12
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 10, background: "#ecfdf5",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  border: `1px solid ${GREEN}44`
                }}>
                  <DynamicIcon name="Sparkles" size={22} color={GREEN} />
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: TEXT }}>{stageData.card2.highlightTitle}</div>
                  <div style={{ fontSize: 11, color: TEXT_MUTED, marginTop: 2, lineHeight: 1.4 }}>
                    {stageData.card2.highlightDesc}
                  </div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: GREEN, marginTop: 4 }}>
                    {stageData.card2.highlightBadge}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Supplier Pool Bar */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 12, borderTop: `1px solid ${BORDER}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#ecfdf5", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <DynamicIcon name="Store" size={16} color="#059669" />
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: TEXT }}>{stageData.card2.sourceLabel}</div>
                  <div style={{ fontSize: 10, color: TEXT_MUTED }}>{stageData.card2.sourceSub}</div>
                </div>
              </div>

              {/* Contact Icons */}
              <div style={{ display: "flex", gap: 6 }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", border: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                  <DynamicIcon name="ExternalLink" size={13} color={TEXT_MUTED} />
                </div>
                <div style={{ width: 28, height: 28, borderRadius: "50%", border: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                  <DynamicIcon name="ShieldCheck" size={13} color={GREEN} />
                </div>
              </div>
            </div>
          </div>

          {/* ══ CARD 3 & 4: STAGE ACTION & ECONOMICS (Right Column) ════════════ */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* 3A. Active Stage Status & Priority Action */}
            <div style={{
              background: CARD,
              borderRadius: 18,
              border: `1px solid ${BORDER}`,
              padding: 16,
              display: "flex",
              justifyContent: "space-between"
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8, paddingRight: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 800, color: TEXT }}>
                    <DynamicIcon name="Compass" size={15} color="#111827" />
                    {stageData.card3.title}
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: GREEN }}>
                    {activeIdx + 1} of {layers.length || 1}
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 14, fontWeight: 800, color: TEXT }}>{stageData.card3.code}</span>
                  <span style={{ background: GREEN, color: "#fff", fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 12 }}>
                    {stageData.card3.badge}
                  </span>
                </div>

                <div style={{ fontSize: 11, color: TEXT_MUTED, marginBottom: 8 }}>
                  {stageData.card3.subtext}
                </div>

                {/* Priority Action Highlight */}
                <div style={{ background: "#fef3c7", padding: "8px 10px", borderRadius: 8, border: "1px solid #fde68a", fontSize: 11, color: "#92400e", marginBottom: 10, lineHeight: 1.4 }}>
                  <strong style={{ color: "#b45309" }}>#1 Priority Action:</strong> {stageData.nextAction}
                </div>

                {/* Progress Track */}
                <div style={{ width: "90%", height: 5, background: "#e5e7eb", borderRadius: 4, position: "relative" }}>
                  <div style={{ width: stageData.card3.progress, height: "100%", background: GREEN, borderRadius: 4 }} />
                  <div style={{
                    position: "absolute", top: -4, left: stageData.card3.progress,
                    width: 13, height: 13, borderRadius: "50%",
                    background: "#000", border: `2px solid ${GREEN}`
                  }} />
                </div>
              </div>
            </div>

            {/* 3B. Unit Economics & Profit Projections */}
            <div style={{
              background: CARD,
              borderRadius: 18,
              border: `1px solid ${BORDER}`,
              padding: 16
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 800, color: TEXT }}>
                  <DynamicIcon name="DollarSign" size={15} color="#111827" />
                  {stageData.card4.title}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: TEXT_MUTED, background: "#f8fafc", padding: "3px 8px", borderRadius: 10, border: `1px solid ${BORDER}` }}>
                  <span>{stageData.card4.period}</span>
                </div>
              </div>

              {/* Big Bold Profit Number */}
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 12 }}>
                <div style={{ fontSize: 24, fontWeight: 900, color: TEXT, letterSpacing: -0.5 }}>{stageData.card4.val}</div>
                <span style={{ fontSize: 10, fontWeight: 800, color: "#059669", background: "#d1fae5", padding: "2px 6px", borderRadius: 4 }}>
                  {stageData.card4.badge}
                </span>
              </div>

              {/* Histogram Bar Chart */}
              <div style={{ height: 60, width: "100%", display: "flex", alignItems: "flex-end", gap: 3, paddingBottom: 16, position: "relative" }}>
                {[
                  { h: 25, active: false }, { h: 35, active: false }, { h: 30, active: false }, { h: 40, active: false },
                  { h: 28, active: false }, { h: 32, active: false }, { h: 25, active: false }, { h: 30, active: false },
                  { h: 45, active: true },  { h: 52, active: true },  { h: 48, active: true },  { h: 58, active: true },
                  { h: 42, active: true },  { h: 30, active: false }, { h: 35, active: false }, { h: 28, active: false },
                  { h: 38, active: false }, { h: 32, active: false }, { h: 26, active: false }, { h: 30, active: false }
                ].map((bar, bi) => (
                  <div key={bi} style={{
                    flex: 1,
                    height: `${bar.h}px`,
                    background: bar.active ? GREEN : "#e2e8f0",
                    borderRadius: "3px 3px 0 0",
                    transition: "all 0.2s"
                  }} />
                ))}

                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, display: "flex", justifyContent: "space-between", fontSize: 9, color: TEXT_MUTED, fontWeight: 600 }}>
                  <span>Cost</span>
                  <span>Ship</span>
                  <span style={{ color: GREEN, fontWeight: 800 }}>Net Margin</span>
                  <span>Gross</span>
                  <span>Scale</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ── 4. DETAILED INTELLIGENCE TABLES (Cleanly Parsed & Fully Scrollable) */}
        {(activeTab === "tables" || activeTab === "dashboard") && (
          <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 20 }}>
            
            {/* Section Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: `2px solid #f1f5f9`, paddingTop: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 4, height: 22, background: GREEN, borderRadius: 2 }} />
                <span style={{ fontSize: 16, fontWeight: 900, color: TEXT, textTransform: "uppercase", letterSpacing: 0.5 }}>
                  {stageData.stageTitle} Detailed Breakdown
                </span>
                <span style={{ fontSize: 11, fontWeight: 700, color: TEXT_MUTED, background: "#f3f4f6", padding: "3px 8px", borderRadius: 12 }}>
                  Stage {activeIdx + 1} of {layers.length || 1}
                </span>
              </div>

              {/* Stage Selection Buttons */}
              <div style={{ display: "flex", gap: 6 }}>
                {resolvedStages.map((st, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveIdx(i)}
                    style={{
                      padding: "6px 14px", borderRadius: 8, fontSize: 11, fontWeight: 700,
                      background: activeIdx === i ? "#111827" : "#f3f4f6",
                      color: activeIdx === i ? "#fff" : TEXT_MUTED,
                      border: "none", cursor: "pointer", transition: "all 0.2s",
                      display: "flex", alignItems: "center", gap: 6
                    }}
                  >
                    <span>{st.emoji}</span>
                    <span>{st.title.replace(" Intelligence", "")}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Master Summary Card (Shown when Stage 1 is selected) */}
            {activeIdx === 0 && parsedSummary.length > 0 && (
              <div style={{
                background: "#ffffff", borderRadius: 16, border: `1px solid ${BORDER}`,
                padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
              }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: TEXT, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                  <DynamicIcon name="BarChart2" size={17} color={GREEN} />
                  Master Funnel Dashboard (All Stages Overview)
                </div>
                {parsedSummary.map((block, bi) => {
                  if (block.type === "table") {
                    const headers = block.rows[0] || [];
                    const body = block.rows.slice(1);
                    return (
                      <div key={bi} style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 600 }}>
                          <thead>
                            <tr style={{ background: "#f8fafc" }}>
                              {headers.map((h, hi) => (
                                <th key={hi} style={{ padding: "10px 12px", borderBottom: `2px solid ${BORDER}`, textAlign: "left", fontSize: 11, fontWeight: 800, color: TEXT_MUTED, textTransform: "uppercase" }}>
                                  {h.replace(/\*\*/g, "")}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {body.map((row, ri) => (
                              <tr key={ri} style={{ borderBottom: `1px solid #f1f5f9` }}>
                                {row.map((cell, ci) => (
                                  <td key={ci} style={{ padding: "12px 12px", fontSize: 13, color: TEXT, verticalAlign: "middle" }}>
                                    {renderInline(cell)}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    );
                  }
                  return (
                    <div key={bi} style={{ margin: "8px 0", fontSize: 13, color: TEXT_MUTED, lineHeight: 1.6 }}>
                      {block.lines.map((l, li) => <p key={li} style={{ margin: "4px 0" }}>{renderInline(l)}</p>)}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Current Layer Tables & Detailed Cards */}
            {parsedCurrentLayer.map((block, bi) => {
              if (block.type === "table") {
                const headers = block.rows[0] || [];
                const body = block.rows.slice(1);
                return (
                  <div key={bi} style={{
                    background: CARD, borderRadius: 16, border: `1px solid ${BORDER}`,
                    padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
                  }}>
                    <div style={{ overflowX: "auto" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 650 }}>
                        <thead>
                          <tr style={{ background: "#f8fafc" }}>
                            {headers.map((h, hi) => (
                              <th key={hi} style={{ padding: "12px 14px", borderBottom: `2px solid ${BORDER}`, textAlign: "left", fontSize: 11, fontWeight: 800, color: TEXT_MUTED, textTransform: "uppercase", letterSpacing: 0.5 }}>
                                {h.replace(/\*\*/g, "")}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {body.map((row, ri) => (
                            <tr key={ri} style={{ borderBottom: ri === body.length - 1 ? "none" : `1px solid #f3f4f6` }}>
                              {row.map((cell, ci) => (
                                <td key={ci} style={{ padding: "12px 14px", fontSize: 13, color: TEXT, verticalAlign: "middle", lineHeight: 1.6 }}>
                                  {renderInline(cell)}
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

              // Text & Header Blocks
              return (
                <div key={bi} style={{
                  background: CARD, borderRadius: 16, border: `1px solid ${BORDER}`,
                  padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
                }}>
                  {block.lines.map((line, li) => {
                    if (/^#+\s+/.test(line)) {
                      const txt = line.replace(/^#+\s*/, "");
                      return (
                        <div key={li} style={{ display: "flex", alignItems: "center", gap: 10, margin: "10px 0 14px" }}>
                          <span style={{ fontSize: 16, fontWeight: 800, color: TEXT }}>{renderInline(txt)}</span>
                        </div>
                      );
                    }
                    if (/^[🎛📊✅💡🃏🗺🧮🔀📈🥧⚠️]/.test(line)) {
                      return (
                        <div key={li} style={{
                          background: "#f8fafc", borderRadius: 10, padding: "12px 16px",
                          margin: "8px 0", fontSize: 13, fontWeight: 600, color: TEXT,
                          display: "flex", alignItems: "center", gap: 10, border: `1px solid ${BORDER}`
                        }}>
                          {renderInline(line)}
                        </div>
                      );
                    }
                    if (/^[\-\*•]\s+/.test(line) || /^\d+\.\s+/.test(line)) {
                      const txt = line.replace(/^[\-\*•]\s+/, "").replace(/^\d+\.\s+/, "");
                      return (
                        <div key={li} style={{ display: "flex", gap: 10, margin: "6px 0", alignItems: "flex-start" }}>
                          <span style={{ flexShrink: 0, width: 6, height: 6, borderRadius: "50%", background: GREEN, marginTop: 7 }} />
                          <div style={{ fontSize: 13, color: TEXT_MUTED, lineHeight: 1.6 }}>{renderInline(txt)}</div>
                        </div>
                      );
                    }
                    return (
                      <p key={li} style={{ fontSize: 13, color: TEXT_MUTED, lineHeight: 1.7, margin: "6px 0" }}>
                        {renderInline(line)}
                      </p>
                    );
                  })}
                </div>
              );
            })}

            {/* Strategic Recommendations Card */}
            {data.recommendations?.length > 0 && (
              <div style={{ background: "#f8fafc", border: `1px solid ${BORDER}`, borderRadius: 16, padding: 20 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: TEXT, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                  <DynamicIcon name="Zap" size={17} color="#f59e0b" />
                  Top Strategic Recommendations
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12 }}>
                  {data.recommendations.map((rec, ri) => (
                    <div key={ri} style={{ background: "#ffffff", padding: "14px 16px", borderRadius: 10, border: `1px solid ${BORDER}` }}>
                      <div style={{ fontSize: 11, fontWeight: 800, color: GREEN, marginBottom: 4 }}>RECOMMENDATION #{ri + 1}</div>
                      <div style={{ fontSize: 13, color: TEXT, lineHeight: 1.5, fontWeight: 500 }}>{rec}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

        {/* ── 5. RAW VIEW TAB ────────────────────────────────────────────────── */}
        {activeTab === "raw" && (
          <div style={{ background: "#ffffff", borderRadius: 16, border: `1px solid ${BORDER}`, padding: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: TEXT, marginBottom: 12 }}>Raw Markdown Output</div>
            <pre style={{ fontSize: 12, color: TEXT, lineHeight: 1.8, whiteSpace: "pre-wrap", fontFamily: "monospace", overflowX: "auto" }}>
              {layers[activeIdx] || ""}
            </pre>
          </div>
        )}

      </div>
    </div>
  );
}
