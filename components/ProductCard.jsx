"use client";
import { useState, useRef, useEffect, useCallback } from "react";

/* ─────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────── */
const DZD_RATE = 135; // fallback USD → DZD conversion rate

const PLATFORM_COLORS = {
  aliexpress: { bg: "#ff4747", text: "#fff", label: "AliExpress" },
  temu: { bg: "#ff5500", text: "#fff", label: "Temu" },
  alibaba: { bg: "#ff6a00", text: "#fff", label: "Alibaba" },
  amazon: { bg: "#ff9900", text: "#000", label: "Amazon" },
  shein: { bg: "#000", text: "#fff", label: "Shein" },
  default: { bg: "#6366f1", text: "#fff", label: null },
};

const VERDICT_CONFIG = {
  "Strong Opportunity": { color: "#16a34a", bg: "#dcfce7", border: "#bbf7d0", emoji: "🟢" },
  "Needs Testing":       { color: "#d97706", bg: "#fef3c7", border: "#fde68a", emoji: "🟡" },
  "Avoid":               { color: "#dc2626", bg: "#fee2e2", border: "#fecaca", emoji: "🔴" },
  "Research More":       { color: "#2563eb", bg: "#dbeafe", border: "#bfdbfe", emoji: "🔵" },
  "Interesting":         { color: "#7c3aed", bg: "#ede9fe", border: "#ddd6fe", emoji: "🔵" },
};

/* ─────────────────────────────────────────
   HELPERS
───────────────────────────────────────── */
export function getV(obj, ...keys) {
  for (const k of keys) {
    if (obj?.[k] != null && obj[k] !== "") return obj[k];
  }
  return null;
}

export function fDZD(val) {
  if (val == null) return null;
  return Number(val).toLocaleString("fr-DZ") + " DA";
}

export function fUSD(val) {
  if (val == null) return null;
  return "$" + Number(val).toFixed(2);
}

export function getDZD(p) {
  const explicit = getV(p, "financials")?.suggestedPriceDZD
    ?? getV(p, "algeria")?.priceRangeDZD?.[0]
    ?? null;
  if (explicit) return { value: explicit, estimated: false };
  const sell = getV(p, "financials")?.sellingPrice ?? getV(p, "sellingPrice") ?? null;
  if (sell) return { value: Math.round(sell * DZD_RATE), estimated: true };
  return null;
}

export function getProfitDZD(p) {
  const explicit = getV(p, "financials")?.grossProfitDZD ?? getV(p, "algeria")?.grossProfitDZD ?? null;
  if (explicit) return explicit;
  const fin = getV(p, "financials") ?? {};
  const sell = fin.sellingPrice ?? getV(p, "sellingPrice") ?? null;
  const cost = fin.supplierPrice ?? fin.costPrice ?? getV(p, "costPrice") ?? null;
  const ship = fin.shippingCost ?? getV(p, "shippingCost") ?? 0;
  if (sell != null && cost != null) return Math.round((sell - cost - ship) * DZD_RATE);
  return null;
}

export function getMarginPct(p) {
  const explicit = getV(p, "financials")?.profitMarginPct ?? getV(p, "algeria")?.profitMarginPct ?? null;
  if (explicit != null) return Math.round(explicit);
  const fin = getV(p, "financials") ?? {};
  const sell = fin.sellingPrice ?? getV(p, "sellingPrice") ?? null;
  const cost = fin.supplierPrice ?? fin.costPrice ?? getV(p, "costPrice") ?? null;
  const ship = fin.shippingCost ?? getV(p, "shippingCost") ?? 0;
  if (sell && cost) return Math.round(((sell - cost - ship) / sell) * 100);
  return null;
}

export function getCostUSD(p) {
  const fin = getV(p, "financials") ?? {};
  return fin.supplierPrice ?? fin.costPrice ?? getV(p, "costPrice") ?? null;
}

export function getVerdict(p) {
  const v = p.algeria?.verdict ?? p.verdict ?? null;
  if (v && VERDICT_CONFIG[v]) return { label: v, ...VERDICT_CONFIG[v] };
  const score = p.algeria?.overallScore ?? p.opportunity?.overallScore ?? null;
  if (score == null) return null;
  if (score >= 75) return { label: "Strong Opportunity", ...VERDICT_CONFIG["Strong Opportunity"] };
  if (score >= 55) return { label: "Needs Testing", ...VERDICT_CONFIG["Needs Testing"] };
  if (score >= 35) return { label: "Research More", ...VERDICT_CONFIG["Research More"] };
  return { label: "Avoid", ...VERDICT_CONFIG["Avoid"] };
}

export function getPlatform(p) {
  const src = (p.source || "").toLowerCase();
  for (const [key, cfg] of Object.entries(PLATFORM_COLORS)) {
    if (key !== "default" && src.includes(key)) return { ...cfg, key };
  }
  const cfg = PLATFORM_COLORS.default;
  return { ...cfg, label: p.source || null, key: "default" };
}

function scoreColor(val, invert = false) {
  if (val == null) return "#9ca3af";
  const v = invert ? 100 - val : val;
  if (v >= 70) return "#16a34a";
  if (v >= 45) return "#d97706";
  return "#dc2626";
}

function margColor(pct) {
  if (pct == null) return "#9ca3af";
  if (pct >= 50) return "#16a34a";
  if (pct >= 30) return "#d97706";
  return "#dc2626";
}

/* ─────────────────────────────────────────
   SUB-COMPONENTS
───────────────────────────────────────── */

/** Lazy-loading product image with gallery support */
function ImageArea({ p, showQuickView, onQuickView, onRemove }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  const [imgIdx, setImgIdx] = useState(0);
  const [hovered, setHovered] = useState(false);

  const images = [
    p.mainImage?.url ?? (typeof p.mainImage === "string" ? p.mainImage : null),
    ...(p.gallery ?? []).map(g => g?.url ?? (typeof g === "string" ? g : null)),
  ].filter(Boolean);

  const currentImg = images[imgIdx] ?? null;
  const hasMultiple = images.length > 1;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { rootMargin: "300px" });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const platform = getPlatform(p);
  const verdict = getVerdict(p);

  return (
    <div
      ref={ref}
      style={{ position: "relative", height: 200, background: "var(--surface-2)", overflow: "hidden", borderRadius: "16px 16px 0 0", flexShrink: 0 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image */}
      {visible && currentImg ? (
        <img
          src={currentImg}
          alt={p.name || "Product"}
          loading="lazy"
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.4s ease" }}
        />
      ) : (
        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 6 }}>
          <span style={{ fontSize: 48, opacity: 0.25 }}>📦</span>
          <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600 }}>No Image</span>
        </div>
      )}

      {/* Gradient overlay */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.0) 40%, rgba(0,0,0,0.55) 100%)", pointerEvents: "none" }} />

      {/* Top-left: Category + Platform badges */}
      <div style={{ position: "absolute", top: 10, left: 10, display: "flex", gap: 5, flexWrap: "wrap", maxWidth: "calc(100% - 80px)" }}>
        {p.category && (
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.3, padding: "3px 8px", borderRadius: 999, background: "rgba(0,0,0,0.55)", color: "#fff", backdropFilter: "blur(6px)" }}>
            {p.category}
          </span>
        )}
        {platform.label && (
          <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: 0.3, padding: "3px 8px", borderRadius: 999, background: platform.bg, color: platform.text }}>
            {platform.label}
          </span>
        )}
      </div>

      {/* Top-right: Favorite + Quick view + Remove buttons */}
      <div style={{ position: "absolute", top: 8, right: 8, display: "flex", flexDirection: "column", gap: 5 }}>
        {onRemove && (
          <button
            onClick={e => { e.stopPropagation(); onRemove(); }}
            title="Remove product"
            style={{ width: 30, height: 30, borderRadius: 999, border: "none", background: "rgba(255,255,255,0.9)", color: "#dc2626", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(6px)", transition: "all 0.15s", fontSize: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.2)" }}
          >
            ×
          </button>
        )}
        <button
          onClick={e => { e.stopPropagation(); }}
          title="Save to favorites"
          style={{ width: 30, height: 30, borderRadius: 999, border: "none", background: p.favorite ? "#ef4444" : "rgba(255,255,255,0.9)", color: p.favorite ? "#fff" : "#9ca3af", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(6px)", transition: "all 0.15s", fontSize: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.2)" }}
        >
          {p.favorite ? "♥" : "♡"}
        </button>
        {showQuickView && (
          <button
            onClick={e => { e.stopPropagation(); onQuickView?.(); }}
            title="Quick view"
            style={{ width: 30, height: 30, borderRadius: 999, border: "none", background: "rgba(255,255,255,0.9)", color: "#374151", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(6px)", transition: "all 0.15s", fontSize: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.2)" }}
          >
            👁
          </button>
        )}
      </div>

      {/* Hot / Trending / New badges */}
      <div style={{ position: "absolute", bottom: 10, left: 10, display: "flex", gap: 4 }}>
        {p.hot && <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 7px", borderRadius: 999, background: "#ef4444", color: "#fff" }}>🔥 HOT</span>}
        {p.pinned && <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 7px", borderRadius: 999, background: "#6366f1", color: "#fff" }}>📌 PINNED</span>}
        {p.highMargin && <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 7px", borderRadius: 999, background: "#16a34a", color: "#fff" }}>💰 HIGH MARGIN</span>}
        {p.isPlaceholder && <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 999, background: "rgba(0,0,0,0.45)", color: "#fff" }}>SAMPLE</span>}
      </div>

      {/* Gallery dots */}
      {hasMultiple && (
        <div style={{ position: "absolute", bottom: 10, right: 10, display: "flex", gap: 4, alignItems: "center" }}>
          {images.map((_, i) => (
            <button
              key={i}
              onClick={e => { e.stopPropagation(); setImgIdx(i); }}
              style={{ width: i === imgIdx ? 16 : 6, height: 6, borderRadius: 999, border: "none", background: i === imgIdx ? "#fff" : "rgba(255,255,255,0.5)", cursor: "pointer", padding: 0, transition: "all 0.2s" }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/** Horizontal score bar */
function ScoreBar({ label, value, max = 100, invert = false, compact = false }) {
  if (value == null) return null;
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const color = scoreColor(value, invert);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: compact ? 6 : 8 }}>
      {label && <span style={{ fontSize: compact ? 10 : 11, color: "var(--muted)", fontWeight: 600, minWidth: compact ? 58 : 70, flexShrink: 0 }}>{label}</span>}
      <div style={{ flex: 1, height: compact ? 4 : 5, background: "var(--border)", borderRadius: 999, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 999, transition: "width 0.6s ease" }} />
      </div>
      <span style={{ fontSize: compact ? 10 : 11, fontWeight: 700, color, minWidth: 26, textAlign: "right" }}>{value}</span>
    </div>
  );
}

/** Circular score ring */
function ScoreRing({ score, size = 52, strokeWidth = 5, label }) {
  if (score == null) return null;
  const r = (size - strokeWidth * 2) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const color = scoreColor(score);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border)" strokeWidth={strokeWidth} />
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={strokeWidth}
            strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round" style={{ transition: "stroke-dasharray 0.6s ease" }} />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 13, fontWeight: 900, color }}>{score}</span>
        </div>
      </div>
      {label && <span style={{ fontSize: 9, color: "var(--muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, textAlign: "center" }}>{label}</span>}
    </div>
  );
}

/** Compact metric pill */
function MetricPill({ icon, label, value, color }) {
  if (value == null) return null;
  return (
    <div title={label} style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 11, fontWeight: 600, color: color || "var(--muted)", background: color ? `${color}12` : "var(--surface-2)", borderRadius: 6, padding: "3px 7px", border: `1px solid ${color ? `${color}25` : "var(--border)"}`, whiteSpace: "nowrap" }}>
      {icon && <span style={{ fontSize: 11 }}>{icon}</span>}
      <span>{value}</span>
    </div>
  );
}

/* ─────────────────────────────────────────
   MAIN PRODUCT CARD
───────────────────────────────────────── */
export default function ProductCard({ p, onClick, compareMode, isSelected, onToggleCompare, onRemove }) {
  const [hovered, setHovered] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef(null);

  // Close "more" menu when clicking outside
  useEffect(() => {
    if (!moreOpen) return;
    const handler = e => { if (!moreRef.current?.contains(e.target)) setMoreOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [moreOpen]);

  /* ── Derived values ── */
  const verdict = getVerdict(p);
  const dzdInfo = getDZD(p);
  const profitDZD = getProfitDZD(p);
  const marginPct = getMarginPct(p);
  const costUSD = getCostUSD(p);

  const overallScore = p.algeria?.overallScore ?? p.opportunity?.overallScore ?? null;
  const demandScore = p.algeria?.demandScore ?? p.opportunity?.demand ?? null;
  const compScore = p.algeria?.competitionScore ?? p.opportunity?.competition ?? null;
  const wowFactor = p.winningMetrics?.wowFactor ?? p.aiAnalysis?.adScore ?? null;
  const adPotential = p.winningMetrics?.videoAdPotential ?? p.winningMetrics?.facebookAdPotential ?? null;
  const rating = p.rating ?? p.supplier?.rating ?? null;
  const platform = getPlatform(p);

  const imgUrl = p.mainImage?.url ?? (typeof p.mainImage === "string" ? p.mainImage : null);

  return (
    <div
      style={{
        borderRadius: 16,
        background: "#fff",
        border: `1px solid ${isSelected ? "#10b981" : hovered ? "#cbd5e1" : "#e2e8f0"}`,
        boxShadow: hovered
          ? `0 12px 24px -8px rgba(0,0,0,0.08), 0 4px 12px -4px rgba(0,0,0,0.04)`
          : isSelected
          ? "0 0 0 3px rgba(16,185,129,0.15)"
          : "0 2px 4px rgba(0,0,0,0.02)",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        transition: "all 0.2s ease",
        transform: hovered ? "translateY(-4px)" : "none",
        position: "relative",
        overflow: "visible",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
    >
      {/* ── Compare checkbox ── */}
      {compareMode && (
        <div
          onClick={e => { e.stopPropagation(); onToggleCompare?.(); }}
          style={{ position: "absolute", top: -8, left: -8, zIndex: 20, width: 24, height: 24, borderRadius: 8, border: `2px solid ${isSelected ? "#10b981" : "#cbd5e1"}`, background: isSelected ? "#10b981" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}
        >
          {isSelected && <span style={{ color: "#fff", fontSize: 14, fontWeight: 900 }}>✓</span>}
        </div>
      )}

      {/* ── Badges (Hot/High Margin) ── */}
      <div style={{ position: "absolute", top: -10, right: 16, display: "flex", gap: 6, zIndex: 10 }}>
        {p.hot && <span style={{ fontSize: 9, fontWeight: 800, padding: "3px 8px", borderRadius: 999, background: "#ef4444", color: "#fff", boxShadow: "0 2px 4px rgba(239,68,68,0.3)" }}>🔥 HOT</span>}
        {p.highMargin && <span style={{ fontSize: 9, fontWeight: 800, padding: "3px 8px", borderRadius: 999, background: "#10b981", color: "#fff", boxShadow: "0 2px 4px rgba(16,185,129,0.3)" }}>💰 MARGIN+</span>}
      </div>

      {/* ── 1. HEADER (Image + Title + Tags) ── */}
      <div style={{ position: "relative", width: "100%", height: 200, background: "#f1f5f9", overflow: "hidden", borderRadius: "16px 16px 0 0", flexShrink: 0 }}>
        {imgUrl ? (
          <img src={imgUrl} alt={p.name} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s", transform: hovered ? "scale(1.05)" : "scale(1)" }} />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, opacity: 0.2 }}>📦</div>
        )}
        
        {/* Gradient overlay */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.0) 50%, rgba(0,0,0,0.5) 100%)", pointerEvents: "none" }} />
        
        {/* Quick Remove inside image */}
        {onRemove && (
          <button
            onClick={e => { e.stopPropagation(); onRemove(); }}
            title="Remove product"
            style={{ position: "absolute", top: 12, right: 12, width: 28, height: 28, borderRadius: 999, border: "none", background: "rgba(255,255,255,0.9)", color: "#ef4444", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, boxShadow: "0 2px 4px rgba(0,0,0,0.15)", opacity: hovered ? 1 : 0.55, transition: "0.2s" }}
          >×</button>
        )}
        
        {/* Favorite Button */}
        <button onClick={e => e.stopPropagation()} style={{ position: "absolute", top: 12, right: onRemove ? 48 : 12, width: 28, height: 28, borderRadius: 999, border: "none", background: p.favorite ? "#ef4444" : "rgba(255,255,255,0.9)", color: p.favorite ? "#fff" : "#94a3b8", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, boxShadow: "0 2px 4px rgba(0,0,0,0.15)", transition: "0.2s" }}>
          {p.favorite ? "♥" : "♡"}
        </button>

        {/* Platform & Category Tags Bottom of Image */}
        <div style={{ position: "absolute", bottom: 12, left: 12, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", paddingRight: 12 }}>
          {platform.label && <span style={{ fontSize: 9, fontWeight: 800, padding: "3px 8px", borderRadius: 6, background: platform.bg, color: platform.text, textTransform: "uppercase", boxShadow: "0 2px 4px rgba(0,0,0,0.2)" }}>{platform.label}</span>}
          {p.category && <span style={{ fontSize: 10, fontWeight: 700, color: "#fff", padding: "2px 8px", background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", borderRadius: 6 }}>{p.category}</span>}
        </div>
      </div>

      <div style={{ padding: "16px 20px 0" }}>
        <div style={{ fontWeight: 800, fontSize: 16, lineHeight: 1.3, color: "#0f172a", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {p.name || "Unnamed Product"}
        </div>
      </div>

      <div style={{ height: 1, background: "#f1f5f9", margin: "0 20px" }} />

      {/* ── 2. INTELLIGENCE (Verdict + Scores) ── */}
      <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        {/* Verdict Badge */}
        {verdict && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: verdict.bg, border: `1px solid ${verdict.border}`, padding: "6px 12px", borderRadius: 8 }}>
            <span style={{ fontSize: 14 }}>{verdict.emoji}</span>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: 9, textTransform: "uppercase", fontWeight: 700, color: verdict.color, letterSpacing: 0.5, opacity: 0.8 }}>AI Verdict</span>
              <span style={{ fontSize: 12, fontWeight: 800, color: verdict.color, letterSpacing: -0.2 }}>{verdict.label}</span>
            </div>
          </div>
        )}

        {/* AI Score */}
        {overallScore != null && (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Overall Score</span>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ fontSize: 24, fontWeight: 900, color: scoreColor(overallScore), lineHeight: 1 }}>{overallScore}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#cbd5e1" }}>/100</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── 3. FINANCIALS ── */}
      <div style={{ margin: "0 20px", background: "#f8fafc", borderRadius: 12, padding: "12px 16px", border: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5 }}>Cost</span>
          <span style={{ fontSize: 14, fontWeight: 800, color: "#475569" }}>{costUSD ? fUSD(costUSD) : "—"}</span>
        </div>
        <div style={{ width: 1, height: 24, background: "#cbd5e1" }} />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5 }}>Sell Price</span>
          <span style={{ fontSize: 16, fontWeight: 900, color: "#0f172a" }}>{dzdInfo ? fDZD(dzdInfo.value) : "—"}</span>
        </div>
        <div style={{ width: 1, height: 24, background: "#cbd5e1" }} />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: profitDZD > 0 ? "#059669" : "#64748b", textTransform: "uppercase", letterSpacing: 0.5 }}>Profit / Margin</span>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 15, fontWeight: 900, color: profitDZD > 0 ? "#10b981" : "#475569" }}>{profitDZD > 0 ? "+" : ""}{fDZD(profitDZD) || "—"}</span>
            {marginPct != null && <span style={{ fontSize: 11, fontWeight: 800, background: profitDZD > 0 ? "#d1fae5" : "#e2e8f0", color: profitDZD > 0 ? "#059669" : "#64748b", padding: "2px 6px", borderRadius: 4 }}>{marginPct}%</span>}
          </div>
        </div>
      </div>

      {/* ── 4. QUICK METRICS ── */}
      <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 8 }}>
        <ScoreBar label="Demand" value={demandScore} compact />
        <ScoreBar label="Competition" value={compScore} invert compact />
      </div>

      <div style={{ padding: "0 20px 16px", display: "flex", gap: 6, flexWrap: "wrap" }}>
        {rating != null && <MetricPill icon="★" label="Rating" value={`${rating}/5`} color="#f59e0b" />}
        {wowFactor != null && <MetricPill icon="🔥" label="Wow Factor" value={`W${wowFactor}`} color="#ef4444" />}
        {adPotential != null && <MetricPill icon="📱" label="Ad Potential" value={`Ad${adPotential}`} color="#8b5cf6" />}
      </div>

      {/* ── 5. ACTION BAR ── */}
      <div
        style={{ padding: "12px 20px", borderTop: "1px solid #f1f5f9", display: "flex", gap: 8, alignItems: "center", marginTop: "auto", background: "#f8fafc", borderRadius: "0 0 16px 16px" }}
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClick}
          style={{ flex: 1, padding: "10px 0", background: "#0f172a", border: "none", borderRadius: 8, color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "0.2s" }}
          onMouseEnter={e => e.currentTarget.style.background = "#1e293b"}
          onMouseLeave={e => e.currentTarget.style.background = "#0f172a"}
        >
          Intelligence Report →
        </button>

        {(p.links?.supplierLink || p.links?.productLink || p.productUrl) && (
          <button
            onClick={e => { e.stopPropagation(); window.open(p.links?.supplierLink || p.links?.productLink || p.productUrl, "_blank"); }}
            title="Open Supplier"
            style={{ width: 36, height: 36, border: "1px solid #cbd5e1", borderRadius: 8, background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, transition: "0.15s", flexShrink: 0 }}
            onMouseEnter={e => { e.currentTarget.style.background = "#f1f5f9"; e.currentTarget.style.borderColor = "#94a3b8"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.borderColor = "#cbd5e1"; }}
          >
            🔗
          </button>
        )}

        {/* More actions (WITH FIXED DELETE) */}
        <div ref={moreRef} style={{ position: "relative", flexShrink: 0 }}>
          <button
            onClick={e => { e.stopPropagation(); setMoreOpen(v => !v); }}
            title="More actions"
            style={{ width: 36, height: 36, border: "1px solid #cbd5e1", borderRadius: 8, background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, color: "#64748b", transition: "0.15s" }}
            onMouseEnter={e => { e.currentTarget.style.background = "#f1f5f9"; e.currentTarget.style.borderColor = "#94a3b8"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.borderColor = "#cbd5e1"; }}
          >
            ⋯
          </button>

          {moreOpen && (
            <div style={{ position: "absolute", bottom: "calc(100% + 6px)", right: 0, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)", padding: 6, display: "flex", flexDirection: "column", gap: 2, minWidth: 160, zIndex: 50 }}>
              {[
                { icon: "📋", label: "Copy JSON", action: () => { navigator.clipboard.writeText(JSON.stringify(p, null, 2)); setMoreOpen(false); } },
                { icon: "🔗", label: "Copy URL", action: () => { navigator.clipboard.writeText(p.productUrl || p.links?.productLink || ""); setMoreOpen(false); }, show: !!(p.productUrl || p.links?.productLink) },
                { icon: "🗑", label: "Delete", action: () => { setMoreOpen(false); onRemove && onRemove(); }, danger: true },
              ].filter(a => a.show !== false).map((a) => (
                <button
                  key={a.label}
                  onClick={e => { e.stopPropagation(); a.action(); }}
                  style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", border: "none", background: "none", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600, color: a.danger ? "#ef4444" : "#334155", textAlign: "left", transition: "0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.background = a.danger ? "#fee2e2" : "#f1f5f9"}
                  onMouseLeave={e => e.currentTarget.style.background = "none"}
                >
                  <span style={{ fontSize: 14 }}>{a.icon}</span>
                  {a.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
