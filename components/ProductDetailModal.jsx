"use client";
import { useState, useEffect } from "react";
import { getV, fDZD, fUSD, getDZD, getProfitDZD, getMarginPct, getCostUSD, getVerdict, getPlatform } from "./ProductCard";

const DZD_RATE = 135;

/* ─────────────────────────────────────────
   SHARED SUB-COMPONENTS
───────────────────────────────────────── */
function na(v, suffix = "") {
  if (v == null || v === "") return <span style={{ color: "var(--muted-2)", fontSize: 12 }}>—</span>;
  if (typeof v === "boolean") return v ? <span style={{ color: "#16a34a", fontWeight: 700 }}>✓ Yes</span> : <span style={{ color: "#dc2626", fontWeight: 700 }}>✗ No</span>;
  return `${v}${suffix}`;
}

function SectionHeader({ title, subtitle }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <h3 style={{ margin: 0, fontSize: 11.5, textTransform: "uppercase", letterSpacing: 1.3, fontWeight: 800, color: "var(--muted)" }}>{title}</h3>
      {subtitle && <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--muted)", fontWeight: 500 }}>{subtitle}</p>}
    </div>
  );
}

function Box({ children, style = {}, accent }) {
  return (
    <div style={{ background: "var(--surface-2)", borderRadius: 14, padding: 20, border: `1px solid ${accent ? `${accent}40` : "var(--border)"}`, borderLeft: accent ? `3px solid ${accent}` : undefined, ...style }}>
      {children}
    </div>
  );
}

function KV({ label, value, mono, accent }) {
  if (value == null || value === "") return null;
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
      <span style={{ fontSize: 12.5, color: "var(--muted)", fontWeight: 600, flexShrink: 0, maxWidth: "45%" }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 700, textAlign: "right", color: accent || "var(--text)", fontFamily: mono ? "var(--mono)" : undefined, wordBreak: "break-all" }}>
        {typeof value === "boolean" ? (value ? "✓ Yes" : "✗ No") : value}
      </span>
    </div>
  );
}

function StatCard({ label, value, sub, color, large }) {
  return (
    <div style={{ background: "var(--surface)", borderRadius: 12, padding: "14px 16px", border: "1px solid var(--border)", textAlign: "center" }}>
      <div style={{ fontSize: large ? 28 : 22, fontWeight: 900, color: color || "var(--text)", letterSpacing: -0.5, lineHeight: 1 }}>{value ?? "—"}</div>
      {sub && <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600, marginTop: 3 }}>{sub}</div>}
      <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.6, marginTop: 4 }}>{label}</div>
    </div>
  );
}

function ScoreBarFull({ label, value, max = 100, invert = false, hint }) {
  if (value == null) return null;
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const col = (() => {
    const v = invert ? 100 - value : value;
    if (v >= 70) return "#16a34a";
    if (v >= 45) return "#d97706";
    return "#dc2626";
  })();
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ minWidth: 150, fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{label}</div>
      <div style={{ flex: 1, height: 7, background: "var(--border)", borderRadius: 999, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: `linear-gradient(90deg, ${col}aa, ${col})`, borderRadius: 999, transition: "width 0.7s ease" }} />
      </div>
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <span style={{ fontSize: 14, fontWeight: 800, color: col, minWidth: 32, textAlign: "right" }}>{value}</span>
        {hint && <span style={{ fontSize: 11, color: "var(--muted)", minWidth: 28 }}>{hint}</span>}
      </div>
    </div>
  );
}

function Badge({ children, color = "#6366f1" }) {
  return (
    <span style={{ fontSize: 11.5, fontWeight: 700, padding: "4px 10px", borderRadius: 999, background: `${color}18`, color, border: `1px solid ${color}35` }}>
      {children}
    </span>
  );
}

function AnglePill({ angle, strength }) {
  const strengthColor = strength >= 8 ? "#16a34a" : strength >= 6 ? "#d97706" : "#9ca3af";
  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "12px 14px", display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 11, fontWeight: 800, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.6 }}>{angle.type}</span>
        {strength != null && <span style={{ fontSize: 11, fontWeight: 800, color: strengthColor }}>Strength {strength}/10</span>}
      </div>
      <p style={{ margin: 0, fontSize: 13, fontWeight: 600, lineHeight: 1.45, color: "var(--text)" }}>{angle.angle}</p>
    </div>
  );
}

/* ─────────────────────────────────────────
   TAB RENDERERS
───────────────────────────────────────── */

function TabOverview({ p }) {
  const verdict = getVerdict(p);
  const overallScore = p.algeria?.overallScore ?? p.opportunity?.overallScore ?? null;
  const images = [
    p.mainImage?.url ?? (typeof p.mainImage === "string" ? p.mainImage : null),
    ...(p.gallery ?? []).map(g => g?.url ?? (typeof g === "string" ? g : null)),
  ].filter(Boolean);
  const [activeImg, setActiveImg] = useState(0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Top grid: image + verdict */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Images */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ borderRadius: 14, overflow: "hidden", background: "var(--surface-2)", border: "1px solid var(--border)", height: 260, position: "relative" }}>
            {images[activeImg] ? (
              <img src={images[activeImg]} alt="Product" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 8 }}>
                <span style={{ fontSize: 64, opacity: 0.2 }}>📦</span>
                <span style={{ fontSize: 13, color: "var(--muted)" }}>No image available</span>
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {images.map((img, i) => (
                <button key={i} onClick={() => setActiveImg(i)} style={{ width: 52, height: 52, borderRadius: 8, overflow: "hidden", border: `2px solid ${i === activeImg ? "var(--primary)" : "var(--border)"}`, cursor: "pointer", padding: 0, background: "var(--surface-2)", transition: "border-color 0.15s", flexShrink: 0 }}>
                  <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Verdict + Info */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {verdict && (
            <div style={{ borderRadius: 14, padding: "18px 20px", background: verdict.bg, border: `1px solid ${verdict.border}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8, color: verdict.color, marginBottom: 4 }}>Algeria Verdict</div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: verdict.color }}>{verdict.emoji} {verdict.label}</div>
                </div>
                {overallScore != null && (
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 38, fontWeight: 900, color: verdict.color, lineHeight: 1 }}>{overallScore}</div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: verdict.color, opacity: 0.75 }}>/ 100</div>
                  </div>
                )}
              </div>
              {p.algeria?.analystNote && <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: verdict.color, opacity: 0.9, fontStyle: "italic", lineHeight: 1.5 }}>"{p.algeria.analystNote}"</p>}
              {p.algeria?.mainAdvantage && <div style={{ marginTop: 8, fontSize: 12, fontWeight: 600, color: verdict.color }}>✅ {p.algeria.mainAdvantage}</div>}
              {p.algeria?.mainRisk && <div style={{ marginTop: 4, fontSize: 12, fontWeight: 600, color: verdict.color }}>⚠️ {p.algeria.mainRisk}</div>}
            </div>
          )}

          <Box>
            <SectionHeader title="Product Details" />
            <div>
              {Object.entries(p.details || {}).slice(0, 6).map(([k, v]) => (
                <KV key={k} label={k.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())} value={Array.isArray(v) ? v.join(", ") : v} />
              ))}
              {Object.keys(p.details || {}).length === 0 && <span style={{ color: "var(--muted)", fontSize: 13 }}>No product details provided.</span>}
            </div>
          </Box>
        </div>
      </div>

      {/* Checklist */}
      {(p.checklist || []).length > 0 && (
        <Box>
          <SectionHeader title={`Research Checklist (${(p.checklist || []).filter(c => c.done).length}/${(p.checklist || []).length} done)`} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 8 }}>
            {p.checklist.map((c, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 8, background: c.done ? "#dcfce710" : "var(--surface)", border: `1px solid ${c.done ? "#bbf7d0" : "var(--border)"}` }}>
                <div style={{ width: 18, height: 18, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: c.done ? "#16a34a" : "transparent", border: `2px solid ${c.done ? "#16a34a" : "var(--border-strong)"}` }}>
                  {c.done && <span style={{ color: "#fff", fontSize: 10, fontWeight: 900 }}>✓</span>}
                </div>
                <span style={{ fontSize: 13, fontWeight: 500, color: c.done ? "var(--muted)" : "var(--text)", textDecoration: c.done ? "line-through" : "none" }}>{c.text}</span>
              </div>
            ))}
          </div>
        </Box>
      )}
    </div>
  );
}

function TabPricing({ p }) {
  const dzdInfo = getDZD(p);
  const profitDZD = getProfitDZD(p);
  const marginPct = getMarginPct(p);
  const costUSD = getCostUSD(p);
  const fin = p.financials ?? {};

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Main pricing grid */}
      <Box>
        <SectionHeader title="Cost & Revenue Breakdown" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 12 }}>
          <StatCard label="Supplier Cost" value={fUSD(costUSD) ?? "—"} color="var(--text)" />
          <StatCard label="Shipping" value={fUSD(fin.shippingCost) ?? "—"} color="var(--text)" />
          <StatCard label="Landed Cost" value={fin.landedCost ? fUSD(fin.landedCost) : (costUSD != null && fin.shippingCost != null ? fUSD(costUSD + fin.shippingCost) : "—")} color="var(--muted)" />
          <StatCard label="Sell Price (DZD)" value={dzdInfo ? `${dzdInfo.estimated ? "~" : ""}${fDZD(dzdInfo.value)}` : "—"} color="#0f3d2e" large />
          <StatCard label="Est. Profit" value={profitDZD != null ? fDZD(profitDZD) : "—"} color={profitDZD > 0 ? "#16a34a" : "#dc2626"} />
          <StatCard label="Margin" value={marginPct != null ? `${marginPct}%` : "—"} color={marginPct >= 50 ? "#16a34a" : marginPct >= 30 ? "#d97706" : "#dc2626"} />
        </div>
      </Box>

      {/* Additional financials */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <Box>
          <SectionHeader title="Pricing Details" />
          <div>
            <KV label="Original Price" value={fUSD(fin.originalPrice)} />
            <KV label="Discount %" value={fin.discountPercent != null ? `${fin.discountPercent}%` : null} />
            <KV label="Suggested DZD Range" value={fin.suggestedPriceRangeDZD ? `${fDZD(fin.suggestedPriceRangeDZD[0])} – ${fDZD(fin.suggestedPriceRangeDZD[1])}` : (p.algeria?.priceRangeDZD ? `${fDZD(p.algeria.priceRangeDZD[0])} – ${fDZD(p.algeria.priceRangeDZD[1])}` : null)} />
            <KV label="ROI" value={fin.roi != null ? `${fin.roi}%` : null} />
            <KV label="Break-Even Price" value={fUSD(fin.breakEvenPrice)} />
          </div>
        </Box>
        <Box>
          <SectionHeader title="Competitor Market" />
          {(p.competitors || []).length === 0 ? (
            <span style={{ fontSize: 13, color: "var(--muted)" }}>No competitor data.</span>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
              <thead>
                <tr>
                  {["Platform", "Price", "Ship", "Rating"].map(h => (
                    <th key={h} style={{ textAlign: "left", padding: "0 0 8px", color: "var(--muted)", fontWeight: 700, fontSize: 11, textTransform: "uppercase", borderBottom: "2px solid var(--border)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {p.competitors.map((c, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "10px 4px 10px 0", fontWeight: 700 }}>{c.name}</td>
                    <td style={{ padding: "10px 4px" }}>{fUSD(c.price) ?? "—"}</td>
                    <td style={{ padding: "10px 4px" }}>{c.shipping === 0 ? <Badge color="#16a34a">FREE</Badge> : fUSD(c.shipping)}</td>
                    <td style={{ padding: "10px 0", color: "#f59e0b", fontWeight: 700 }}>{c.rating ? `${c.rating}★` : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Box>
      </div>
    </div>
  );
}

function TabAlgeria({ p }) {
  const alg = p.algeria ?? {};
  const scoreColor = (v, inv = false) => {
    if (v == null) return "#9ca3af";
    const n = inv ? 100 - v : v;
    if (n >= 70) return "#16a34a";
    if (n >= 45) return "#d97706";
    return "#dc2626";
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Score overview */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: 12 }}>
        {[
          { label: "Market Fit", value: alg.marketFitScore != null ? `${alg.marketFitScore}/10` : null, color: scoreColor(alg.marketFitScore ? alg.marketFitScore * 10 : null) },
          { label: "Demand", value: alg.demandScore, color: scoreColor(alg.demandScore) },
          { label: "Competition", value: alg.competitionScore, color: scoreColor(alg.competitionScore, true) },
          { label: "Confidence", value: alg.confidenceScore, color: scoreColor(alg.confidenceScore) },
        ].map(s => s.value != null && (
          <StatCard key={s.label} label={s.label} value={s.value} color={s.color} />
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Market suitability */}
        <Box>
          <SectionHeader title="Market Suitability" />
          <KV label="Saturation Level" value={alg.saturationLevel} accent={alg.saturationLevel === "Low" ? "#16a34a" : alg.saturationLevel === "High" ? "#dc2626" : "#d97706"} />
          <KV label="COD Suitable" value={alg.codSuitable} accent={alg.codSuitable ? "#16a34a" : "#dc2626"} />
          <KV label="Delivery Suitable" value={alg.deliverySuitable} accent={alg.deliverySuitable ? "#16a34a" : "#dc2626"} />
          <KV label="Product Fragility" value={alg.fragility} accent={alg.fragility === "Low" ? "#16a34a" : alg.fragility === "High" ? "#dc2626" : "#d97706"} />
          <KV label="Return/Refund Risk" value={alg.returnRisk} accent={alg.returnRisk === "Low" ? "#16a34a" : alg.returnRisk === "High" ? "#dc2626" : "#d97706"} />
          <KV label="Seasonality" value={alg.seasonality} />
        </Box>

        {/* Audience & Pricing */}
        <Box>
          <SectionHeader title="Algeria Audience & Pricing" />
          <KV label="Target Audience" value={alg.targetAudience} />
          <KV label="Best Segment" value={alg.bestSegment} />
          <KV label="Price Range (DZD)" value={alg.priceRangeDZD ? `${fDZD(alg.priceRangeDZD[0])} – ${fDZD(alg.priceRangeDZD[1])}` : null} accent="#0f3d2e" />
          <KV label="Main Buy Reason" value={alg.mainBuyReason} />
        </Box>
      </div>

      {/* Analyst verdict */}
      {(alg.analystNote || alg.mainAdvantage || alg.mainRisk) && (
        <Box accent="#0f3d2e" style={{ background: "var(--primary-soft)" }}>
          <SectionHeader title="Analyst Assessment" />
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {alg.mainAdvantage && (
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <span style={{ fontSize: 16 }}>✅</span>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "#16a34a", marginBottom: 3 }}>Main Advantage</div>
                  <p style={{ margin: 0, fontSize: 13.5, fontWeight: 600, color: "var(--text)" }}>{alg.mainAdvantage}</p>
                </div>
              </div>
            )}
            {alg.mainRisk && (
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <span style={{ fontSize: 16 }}>⚠️</span>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "#d97706", marginBottom: 3 }}>Main Risk</div>
                  <p style={{ margin: 0, fontSize: 13.5, fontWeight: 600, color: "var(--text)" }}>{alg.mainRisk}</p>
                </div>
              </div>
            )}
            {alg.analystNote && (
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <span style={{ fontSize: 16 }}>💡</span>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "#0f3d2e", marginBottom: 3 }}>Recommendation</div>
                  <p style={{ margin: 0, fontSize: 13.5, fontWeight: 600, color: "var(--text)", fontStyle: "italic" }}>{alg.analystNote}</p>
                </div>
              </div>
            )}
          </div>
        </Box>
      )}
    </div>
  );
}

function TabResearch({ p }) {
  const wm = p.winningMetrics ?? {};
  const opp = p.opportunity ?? {};
  const intel = p.intelligence ?? {};

  const metrics = [
    { label: "Wow Factor",              value: wm.wowFactor,                max: 10 },
    { label: "Problem-Solving",         value: wm.problemSolvingScore,      max: 10 },
    { label: "Impulse Buy Potential",   value: wm.impulseBuyPotential,      max: 10 },
    { label: "Perceived Value",         value: wm.perceivedValue,           max: 10 },
    { label: "Demo Potential",          value: wm.demonstrationPotential,   max: 10 },
    { label: "Video Ad Potential",      value: wm.videoAdPotential,         max: 10 },
    { label: "Facebook Ad Potential",   value: wm.facebookAdPotential,      max: 10 },
    { label: "TikTok Ad Potential",     value: wm.tiktokAdPotential,        max: 10 },
    { label: "Upsell Potential",        value: wm.upsellPotential,          max: 10 },
    { label: "Bundle Potential",        value: wm.bundlePotential,          max: 10 },
    { label: "Repeat Purchase",         value: wm.repeatPurchasePotential,  max: 10 },
    { label: "Local Availability Diff", value: wm.localAvailabilityDifficulty, max: 10 },
    { label: "Market Saturation",       value: wm.marketSaturation,        max: 10, invert: true },
  ].filter(m => m.value != null);

  const oppMetrics = [
    { label: "Demand",      value: opp.demand,      hint: "/100" },
    { label: "Competition", value: opp.competition, hint: "/100", invert: true },
    { label: "Margin",      value: opp.margin,      hint: "/100" },
    { label: "Supplier",    value: opp.supplier,    hint: "/100" },
    { label: "Trend",       value: opp.trend,       hint: "/100" },
  ].filter(m => m.value != null);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Winning product metrics */}
      {metrics.length > 0 && (
        <Box>
          <SectionHeader title="Winning Product Metrics" subtitle="Scores out of 10 — higher is better (except Market Saturation)" />
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {metrics.map(m => (
              <ScoreBarFull key={m.label} label={m.label} value={m.value * 10} max={100} invert={m.invert} hint={`${m.value}/10`} />
            ))}
          </div>
        </Box>
      )}

      {/* Opportunity scores */}
      {oppMetrics.length > 0 && (
        <Box>
          <SectionHeader title="Opportunity Scores" />
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {oppMetrics.map(m => (
              <ScoreBarFull key={m.label} label={m.label} value={m.value} invert={m.invert} hint={m.hint} />
            ))}
          </div>
        </Box>
      )}

      {/* Intelligence flags */}
      {Object.keys(intel).length > 0 && (
        <Box>
          <SectionHeader title="Market Intelligence" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>
            <KV label="Demand Level" value={intel.demandLevel} accent={intel.demandLevel === "HIGH" ? "#16a34a" : intel.demandLevel === "LOW" ? "#dc2626" : "#d97706"} />
            <KV label="Competition Level" value={intel.competitionLevel} accent={intel.competitionLevel === "LOW" ? "#16a34a" : "#d97706"} />
            <KV label="Trend Direction" value={intel.trendDirection} />
            <KV label="Seasonality" value={intel.seasonality} />
            <KV label="Impulse Buy" value={intel.impulseBuy} />
            <KV label="Target Customer" value={intel.targetCustomer} />
          </div>
        </Box>
      )}

      {/* AI Analysis */}
      {p.aiAnalysis && (
        <Box accent="#6366f1" style={{ background: "rgba(99,102,241,0.03)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <SectionHeader title="✨ AI Product Analysis" />
            {p.aiAnalysis.adScore && <Badge color="#6366f1">Ad Score: {p.aiAnalysis.adScore}/10</Badge>}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {(p.aiAnalysis.whySell || []).length > 0 && (
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", color: "#16a34a", marginBottom: 8 }}>Why It Could Sell</div>
                <ul style={{ margin: 0, paddingLeft: 16, display: "flex", flexDirection: "column", gap: 4 }}>
                  {p.aiAnalysis.whySell.map((w, i) => <li key={i} style={{ fontSize: 13, lineHeight: 1.4 }}>{w}</li>)}
                </ul>
              </div>
            )}
            {(p.aiAnalysis.risks || []).length > 0 && (
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", color: "#dc2626", marginBottom: 8 }}>Potential Risks</div>
                <ul style={{ margin: 0, paddingLeft: 16, display: "flex", flexDirection: "column", gap: 4 }}>
                  {p.aiAnalysis.risks.map((r, i) => <li key={i} style={{ fontSize: 13, lineHeight: 1.4 }}>{r}</li>)}
                </ul>
              </div>
            )}
          </div>
          {p.aiAnalysis.marketingAngle && (
            <div style={{ marginTop: 16, padding: "10px 14px", background: "rgba(99,102,241,0.06)", borderRadius: 8, borderLeft: "3px solid #6366f1" }}>
              <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", color: "#6366f1", marginBottom: 4 }}>Best Marketing Angle</div>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 600, fontStyle: "italic", color: "var(--text)" }}>{p.aiAnalysis.marketingAngle}</p>
            </div>
          )}
        </Box>
      )}
    </div>
  );
}

function TabMarketing({ p }) {
  const angles = p.marketingAngles ?? [];
  const adIdeas = p.adIdeas ?? {};
  const audience = p.targetAudience ?? {};

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Marketing Angles */}
      {angles.length > 0 && (
        <Box>
          <SectionHeader title="Marketing Angles" subtitle="Ranked by strength" />
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[...angles].sort((a, b) => (b.strength ?? 0) - (a.strength ?? 0)).map((angle, i) => (
              <AnglePill key={i} angle={angle} strength={angle.strength} />
            ))}
          </div>
        </Box>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Ad Ideas */}
        {Object.keys(adIdeas).length > 0 && (
          <Box>
            <SectionHeader title="Ad Content Ideas" />
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {adIdeas.bestHook && (
                <div style={{ padding: "10px 12px", background: "var(--surface)", borderRadius: 10, border: "1px solid var(--border)", borderLeft: "3px solid #ef4444" }}>
                  <div style={{ fontSize: 10, fontWeight: 800, color: "#ef4444", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>🎣 Best Hook</div>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600, lineHeight: 1.4 }}>{adIdeas.bestHook}</p>
                </div>
              )}
              {adIdeas.bestAngle && (
                <div style={{ padding: "10px 12px", background: "var(--surface)", borderRadius: 10, border: "1px solid var(--border)", borderLeft: "3px solid #6366f1" }}>
                  <div style={{ fontSize: 10, fontWeight: 800, color: "#6366f1", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>🎯 Creative Angle</div>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600, lineHeight: 1.4 }}>{adIdeas.bestAngle}</p>
                </div>
              )}
              {adIdeas.tiktokConcept && (
                <div style={{ padding: "10px 12px", background: "var(--surface)", borderRadius: 10, border: "1px solid var(--border)", borderLeft: "3px solid #000" }}>
                  <div style={{ fontSize: 10, fontWeight: 800, color: "#000", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>🎵 TikTok/Reels Concept</div>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600, lineHeight: 1.4 }}>{adIdeas.tiktokConcept}</p>
                </div>
              )}
              {adIdeas.suggestedHeadline && <KV label="Headline" value={adIdeas.suggestedHeadline} />}
              {adIdeas.suggestedCta && <KV label="CTA" value={adIdeas.suggestedCta} accent="#0f3d2e" />}
            </div>
          </Box>
        )}

        {/* Target Audience */}
        {(Object.keys(audience).length > 0 || p.algeria?.targetAudience) && (
          <Box>
            <SectionHeader title="Target Audience Profile" />
            <div>
              <KV label="Gender" value={audience.gender} />
              <KV label="Age Range" value={audience.ageRange} />
              <KV label="Customer Type" value={audience.customerType} />
              <KV label="Main Pain Point" value={audience.mainPainPoint} />
              <KV label="Main Desire" value={audience.mainDesire} />
              <KV label="Best Use Case" value={audience.bestUseCase} />
            </div>
            {(audience.interests || []).length > 0 && (
              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--muted)", marginBottom: 8 }}>Interests</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {audience.interests.map((int, i) => <Badge key={i} color="#6366f1">{int}</Badge>)}
                </div>
              </div>
            )}
          </Box>
        )}
      </div>
    </div>
  );
}

function TabNotes({ p }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 20 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <Box>
          <SectionHeader title="Structured Notes" />
          {[
            ["Supplier Notes", p.structuredNotes?.supplierNotes],
            ["Pricing Notes", p.structuredNotes?.pricingNotes],
            ["Competition Notes", p.structuredNotes?.competitionNotes],
            ["AI Notes", p.structuredNotes?.aiNotes],
          ].map(([lbl, text]) => text ? (
            <div key={lbl} style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 11.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, color: "var(--muted)", marginBottom: 8 }}>{lbl}</label>
              <textarea readOnly value={text} style={{ width: "100%", minHeight: 80, padding: 12, borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface)", fontSize: 13, resize: "vertical", fontFamily: "inherit", lineHeight: 1.55, color: "var(--text)" }} />
            </div>
          ) : null)}
          {!p.structuredNotes && <span style={{ color: "var(--muted)", fontSize: 13 }}>No notes added.</span>}
        </Box>

        {/* Supplier details */}
        {p.supplier && (
          <Box>
            <SectionHeader title="Supplier Information" />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>
              <KV label="Supplier Name" value={p.supplier.name} />
              <KV label="Rating" value={p.supplier.rating ? `${p.supplier.rating} ★` : null} accent="#f59e0b" />
              <KV label="Reliability Score" value={p.supplier.reliabilityScore ? `${p.supplier.reliabilityScore}/100` : null} />
              <KV label="Store Age" value={p.supplier.storeAge} />
              <KV label="Total Orders" value={p.supplier.orders?.toLocaleString()} />
              <KV label="MOQ" value={p.supplier.moq ? `${p.supplier.moq} unit(s)` : null} />
              <KV label="Shipping Time" value={p.supplier.shippingTime} />
              <KV label="Processing Time" value={p.supplier.processingTime} />
              <KV label="Location" value={p.supplier.location} />
            </div>
          </Box>
        )}
      </div>

      {/* Timeline */}
      <Box style={{ background: "var(--surface)", height: "fit-content" }}>
        <SectionHeader title="Activity Timeline" />
        {(p.timeline || []).length === 0 ? (
          <span style={{ color: "var(--muted)", fontSize: 13 }}>No activity recorded.</span>
        ) : (
          <div style={{ borderLeft: "2px solid var(--border)", paddingLeft: 16, display: "flex", flexDirection: "column", gap: 20 }}>
            {p.timeline.map((ev, i) => (
              <div key={i} style={{ position: "relative" }}>
                <div style={{ position: "absolute", left: -21, top: 4, width: 10, height: 10, borderRadius: "50%", background: "var(--primary)", border: "2px solid var(--surface)" }} />
                <div style={{ fontSize: 11, fontWeight: 800, color: "var(--primary)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>{ev.type}</div>
                <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>{ev.text}</div>
                <div style={{ fontSize: 11, color: "var(--muted)" }}>{ev.date ? new Date(ev.date).toLocaleDateString() : ""}</div>
              </div>
            ))}
          </div>
        )}
      </Box>
    </div>
  );
}

/* ─────────────────────────────────────────
   MAIN MODAL
───────────────────────────────────────── */
const TABS = [
  { id: "overview",   label: "Overview",         icon: "🏠" },
  { id: "pricing",    label: "Pricing",           icon: "💰" },
  { id: "algeria",    label: "Algeria Analysis",  icon: "🇩🇿" },
  { id: "research",   label: "Research Metrics",  icon: "📊" },
  { id: "marketing",  label: "Marketing",         icon: "📣" },
  { id: "notes",      label: "Notes",             icon: "📝" },
];

export default function ProductDetailModal({ p, onClose, onUpdate }) {
  const [tab, setTab] = useState("overview");
  const [enriching, setEnriching] = useState(false);
  const [editingImage, setEditingImage] = useState(false);
  const [imageInput, setImageInput] = useState("");
  const platform = getPlatform(p);
  const verdict = getVerdict(p);

  const currentImage = p.mainImage?.url ?? (typeof p.mainImage === "string" ? p.mainImage : null);

  const handleSaveImage = () => {
    const url = imageInput.trim();
    if (!url) return;
    onUpdate?.({ ...p, mainImage: url });
    setEditingImage(false);
    setImageInput("");
  };

  useEffect(() => {
    const esc = e => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, [onClose]);

  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
    >
      <div style={{ background: "var(--surface)", borderRadius: 20, width: "100%", maxWidth: 1100, height: "92vh", display: "flex", flexDirection: "column", boxShadow: "0 32px 96px rgba(0,0,0,0.35)", border: "1px solid var(--border)", overflow: "hidden" }}>

        {/* ── Sticky Header ── */}
        <div style={{ padding: "20px 28px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--surface)", zIndex: 10, flexShrink: 0 }}>
          <div style={{ display: "flex", gap: 16, alignItems: "center", minWidth: 0 }}>
          {/* Thumbnail — click to edit image URL */}
          <div style={{ position: "relative", flexShrink: 0 }}>
            <div
              onClick={() => { setEditingImage(v => !v); setImageInput(currentImage || ""); }}
              title="Click to edit image URL"
              style={{ width: 58, height: 58, borderRadius: 12, background: "var(--surface-2)", overflow: "hidden", border: "2px solid var(--border)", flexShrink: 0, cursor: "pointer", position: "relative" }}
            >
              {currentImage ? (
                <img src={currentImage} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>📦</div>}
              {/* Edit overlay */}
              <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0, transition: "0.2s" }}
                onMouseEnter={e => e.currentTarget.style.opacity = 1}
                onMouseLeave={e => e.currentTarget.style.opacity = 0}
              >
                <span style={{ fontSize: 18 }}>✏️</span>
              </div>
            </div>

            {/* Inline image URL editor */}
            {editingImage && (
              <div style={{
                position: "absolute", top: "calc(100% + 8px)", left: 0, zIndex: 100,
                background: "var(--surface)", border: "1px solid var(--border)",
                borderRadius: 12, padding: 14, boxShadow: "0 12px 32px rgba(0,0,0,0.18)",
                width: 340, display: "flex", flexDirection: "column", gap: 10,
              }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>Edit Image URL</div>
                <input
                  autoFocus
                  value={imageInput}
                  onChange={e => setImageInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") handleSaveImage(); if (e.key === "Escape") setEditingImage(false); }}
                  placeholder="https://example.com/image.jpg"
                  style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 13, fontFamily: "var(--mono)", outline: "none", boxSizing: "border-box", background: "var(--surface-2)" }}
                />
                {imageInput.trim() && (
                  <img src={imageInput.trim()} alt="preview" onError={e => e.target.style.display="none"}
                    style={{ width: "100%", height: 120, objectFit: "cover", borderRadius: 8, border: "1px solid var(--border)" }}
                  />
                )}
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={handleSaveImage}
                    style={{ flex: 1, padding: "9px 0", background: "var(--primary)", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer" }}
                  >✓ Save Image</button>
                  <button onClick={() => setEditingImage(false)}
                    style={{ padding: "9px 14px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: "pointer", color: "var(--muted)" }}
                  >Cancel</button>
                </div>
              </div>
            )}
          </div>

            {/* Title area */}
            <div style={{ minWidth: 0 }}>
              <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 5, flexWrap: "wrap" }}>
                {p.category && <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: "var(--primary-soft)", color: "var(--primary)" }}>{p.category}</span>}
                {platform.label && <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: platform.bg, color: platform.text }}>{platform.label}</span>}
                {p.status && <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: "var(--surface-2)", color: "var(--muted)", border: "1px solid var(--border)" }}>{p.status}</span>}
                {verdict && <span style={{ fontSize: 11, fontWeight: 800, padding: "2px 8px", borderRadius: 999, background: verdict.bg, color: verdict.color }}>{verdict.emoji} {verdict.label}</span>}
              </div>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 900, letterSpacing: -0.3, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 520 }}>{p.name || "Unnamed Product"}</h2>
              <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 4, fontSize: 12.5, color: "var(--muted)" }}>
                {p.supplier?.name && <span>Supplier: <strong style={{ color: "var(--text)" }}>{p.supplier.name}</strong></span>}
                {p.country && <span>Country: <strong style={{ color: "var(--text)" }}>{p.country}</strong></span>}
                {p.sku && <span>SKU: <strong style={{ color: "var(--text)", fontFamily: "var(--mono)" }}>{p.sku}</strong></span>}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
            {(p.links?.supplierLink || p.links?.productLink || p.productUrl) && (
              <button
                className="btn btn-sm"
                onClick={() => window.open(p.links?.supplierLink || p.links?.productLink || p.productUrl, "_blank")}
              >
                🔗 Open Supplier
              </button>
            )}
            <button
              className="btn btn-primary btn-sm"
              onClick={async () => {
                setEnriching(true);
                try {
                  const res = await fetch("/api/ai/enrich-product", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ product: p }) });
                  const data = await res.json();
                  if (data.error) throw new Error(data.error);
                  onUpdate?.({ ...p, structuredNotes: { ...p.structuredNotes, aiNotes: (p.structuredNotes?.aiNotes ? p.structuredNotes.aiNotes + "\n\n" : "") + data.result } });
                } catch (e) { alert(e.message); } finally { setEnriching(false); }
              }}
              disabled={enriching}
            >
              {enriching ? "Analyzing…" : "✨ AI Analysis"}
            </button>
            <button
              onClick={onClose}
              style={{ width: 36, height: 36, borderRadius: 9, border: "1px solid var(--border)", background: "var(--surface-2)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: "var(--muted)", fontWeight: 700 }}
            >×</button>
          </div>
        </div>

        {/* ── Tab Nav ── */}
        <div style={{ display: "flex", gap: 0, padding: "0 28px", borderBottom: "1px solid var(--border)", background: "var(--surface)", flexShrink: 0, overflowX: "auto" }}>
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{ padding: "14px 18px", background: "none", border: "none", borderBottom: `3px solid ${tab === t.id ? "var(--primary)" : "transparent"}`, color: tab === t.id ? "var(--primary)" : "var(--muted)", fontWeight: tab === t.id ? 800 : 600, fontSize: 13, cursor: "pointer", transition: "all 0.15s", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 6, marginBottom: -1 }}
            >
              <span>{t.icon}</span> {t.label}
            </button>
          ))}
        </div>

        {/* ── Content ── */}
        <div style={{ flex: 1, overflowY: "auto", padding: 28, background: "#f8fafc" }}>
          {tab === "overview"  && <TabOverview p={p} />}
          {tab === "pricing"   && <TabPricing p={p} />}
          {tab === "algeria"   && <TabAlgeria p={p} />}
          {tab === "research"  && <TabResearch p={p} />}
          {tab === "marketing" && <TabMarketing p={p} />}
          {tab === "notes"     && <TabNotes p={p} />}
        </div>
      </div>
    </div>
  );
}
