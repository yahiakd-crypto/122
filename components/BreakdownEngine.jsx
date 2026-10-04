import { useState } from "react";

const CLASS_COLOR = {
  HIGH_VALUE_SEGMENT: { bg: "#dcfce7", fg: "#047857" },
  SCALE_OPPORTUNITY: { bg: "#dcfce7", fg: "#047857" },
  PROMISING_SEGMENT: { bg: "#dbeafe", fg: "#1d4ed8" },
  UNDEREXPLOITED_OPPORTUNITY: { bg: "#dbeafe", fg: "#1d4ed8" },
  AVERAGE_SEGMENT: { bg: "#f1f5f9", fg: "#475569" },
  WEAK_SEGMENT: { bg: "#fef3c7", fg: "#b45309" },
  INEFFICIENT_SEGMENT: { bg: "#fee2e2", fg: "#b91c1c" },
  BUDGET_DRAIN: { bg: "#fee2e2", fg: "#b91c1c" },
  CLICK_QUALITY_PROBLEM: { bg: "#fee2e2", fg: "#b91c1c" },
  INSUFFICIENT_DATA: { bg: "#f1f5f9", fg: "#64748b" },
  EARLY_SIGNAL: { bg: "#fef3c7", fg: "#b45309" },
  RELIABLE: { bg: "#dbeafe", fg: "#1d4ed8" },
  HIGH_CONFIDENCE: { bg: "#dcfce7", fg: "#047857" },
  HIGH: { bg: "#fee2e2", fg: "#b91c1c" },
  MEDIUM: { bg: "#fef3c7", fg: "#b45309" },
  LOW: { bg: "#dcfce7", fg: "#047857" },
};

const STEPS = [
  { id: "summary", label: "Summary" },
  { id: "segments", label: "Segments" },
  { id: "budget", label: "Budget & Tests" },
  { id: "next", label: "Next Steps" },
];

export default function BreakdownEngine({ data }) {
  const [step, setStep] = useState(0);
  const [typeFilter, setTypeFilter] = useState("ALL");
  const d = data && typeof data === "object" ? data : {};
  const segments = d.segment_data || [];
  const types = ["ALL", ...new Set(segments.map((s) => s.breakdown_type).filter(Boolean))];
  const filtered = typeFilter === "ALL" ? segments : segments.filter((s) => s.breakdown_type === typeFilter);
  const colorOf = (t) => CLASS_COLOR[t] || CLASS_COLOR.INSUFFICIENT_DATA;

  const C = ({ children, style }) => (
    <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "14px 16px", marginBottom: 10, ...style }}>
      {children}
    </div>
  );

  const Pill = ({ text }) => {
    const c = colorOf(text);
    return (
      <span style={{ background: c.bg, color: c.fg, fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 999, whiteSpace: "nowrap" }}>
        {text}
      </span>
    );
  };

  const Numbered = ({ i }) => (
    <div style={{ width: 22, height: 22, borderRadius: 999, background: "#2563eb", color: "#fff", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      {i + 1}
    </div>
  );

  const SectionTitle = ({ children }) => (
    <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", margin: "18px 0 10px" }}>{children}</div>
  );

  const SegCard = ({ s, i }) => (
    <C key={i}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
        <div style={{ fontWeight: 700 }}>
          {s.breakdown_type ? <span style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5, marginRight: 6 }}>{s.breakdown_type}</span> : null}
          {s.segment}
        </div>
        {s.classification ? <Pill text={s.classification} /> : null}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "2px 12px", color: "#475569", marginBottom: 6 }}>
        <div>Spend: {s.spend || "n/a"}</div>
        <div>Purchases: {s.purchases != null ? s.purchases : "n/a"}</div>
        <div>CPA: {s.cpa || "n/a"}</div>
        <div>ROAS: {s.roas || "n/a"}</div>
        <div>Share spend: {s.share_of_spend_pct != null ? s.share_of_spend_pct + "%" : "n/a"}</div>
        <div>Share buys: {s.share_of_purchases_pct != null ? s.share_of_purchases_pct + "%" : "n/a"}</div>
      </div>
      {s.diagnosis ? <div style={{ background: "#f8fafc", borderRadius: 7, padding: 8, marginBottom: 5 }}>{s.diagnosis}</div> : null}
      {s.action ? <div style={{ fontWeight: 600, color: "#1d4ed8" }}>Action: {s.action}{s.confidence ? <span style={{ color: "#64748b", fontWeight: 500 }}> | Confidence: {s.confidence}</span> : null}</div> : null}
    </C>
  );

  return (
    <div style={{ background: "#f3f6fa", borderRadius: 12, padding: 16, fontFamily: "'Inter', system-ui, sans-serif", fontSize: 13, color: "#1e293b", lineHeight: 1.5 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <div style={{ width: 10, height: 10, borderRadius: 999, background: "#8b5cf6" }} />
        <div style={{ fontSize: 15, fontWeight: 800, color: "#0f172a" }}>Meta Ads Breakdown Intelligence</div>
      </div>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
        {STEPS.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setStep(i)}
            style={{
              border: i === step ? "1px solid #8b5cf6" : "1px solid #cbd5e1",
              background: i === step ? "#f5f3ff" : "#ffffff",
              color: i === step ? "#6d28d9" : "#475569",
              padding: "5px 12px", borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: "pointer",
            }}
          >
            {i + 1}. {s.label}
          </button>
        ))}
      </div>

      {step === 0 && (
        <div>
          <C>
            <SectionTitle>Top Opportunities</SectionTitle>
            {(d.breakdown_summary?.top_opportunities || []).map((t, i) => (
              <div key={i} style={{ display: "flex", gap: 10, padding: "7px 0", borderBottom: i < (d.breakdown_summary?.top_opportunities || []).length - 1 ? "1px solid #eef2f7" : "none" }}>
                <Numbered i={i} />
                <div>{t}</div>
              </div>
            ))}
          </C>
          <C>
            <SectionTitle>Main Inefficiencies</SectionTitle>
            {(d.breakdown_summary?.main_inefficiencies || []).map((t, i) => (
              <div key={i} style={{ display: "flex", gap: 10, padding: "7px 0", borderBottom: i < (d.breakdown_summary?.main_inefficiencies || []).length - 1 ? "1px solid #eef2f7" : "none" }}>
                <Numbered i={i} />
                <div>{t}</div>
              </div>
            ))}
          </C>
          <C>
            <SectionTitle>Top Actions</SectionTitle>
            {(d.top_actions || []).map((a, i) => (
              <div key={i} style={{ display: "flex", gap: 10, padding: "7px 0", borderBottom: i < (d.top_actions || []).length - 1 ? "1px solid #eef2f7" : "none" }}>
                <Numbered i={i} />
                <div style={{ fontWeight: 600 }}>{a}</div>
              </div>
            ))}
          </C>
        </div>
      )}

      {step === 1 && (
        <div>
          <div style={{ margin: "6px 0 12px", display: "flex", gap: 6, flexWrap: "wrap" }}>
            {types.map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                style={{
                  border: t === typeFilter ? "1px solid #8b5cf6" : "1px solid #cbd5e1",
                  background: t === typeFilter ? "#f5f3ff" : "#ffffff",
                  color: t === typeFilter ? "#6d28d9" : "#475569",
                  padding: "4px 10px", borderRadius: 999, fontSize: 11, fontWeight: 600, cursor: "pointer", textTransform: "uppercase",
                }}
              >
                {t}
              </button>
            ))}
          </div>
          <SectionTitle>Segments{typeFilter !== "ALL" ? ` — ${typeFilter}` : ""}</SectionTitle>
          {filtered.map((s, i) => <SegCard s={s} i={i} key={i} />)}
          {!filtered.length ? <div style={{ color: "#64748b" }}>No segment data returned.</div> : null}
        </div>
      )}

      {step === 2 && (
        <div>
          <SectionTitle>Budget Opportunities (deserve more exposure)</SectionTitle>
          {(d.budget_opportunities || []).map((b, i) => (
            <C key={i}>
              <div style={{ fontWeight: 700 }}>{b.segment || b}</div>
              {typeof b === "object" && b.detail ? <div style={{ color: "#64748b" }}>{b.detail}</div> : null}
            </C>
          ))}
          {!(d.budget_opportunities || []).length ? <div style={{ color: "#64748b" }}>None flagged.</div> : null}

          <SectionTitle>Budget Drain</SectionTitle>
          {(d.budget_drain || []).map((b, i) => (
            <C key={i} style={{ borderColor: "#fda4af" }}>
              <div style={{ fontWeight: 700, color: "#b91c1c" }}>{b.segment || b}</div>
              {typeof b === "object" && b.detail ? <div style={{ color: "#64748b" }}>{b.detail}</div> : null}
            </C>
          ))}
          {!(d.budget_drain || []).length ? <div style={{ color: "#64748b" }}>None flagged.</div> : null}

          <SectionTitle>Test Opportunities (test separately)</SectionTitle>
          {(d.test_opportunities || []).map((t, i) => (
            <C key={i} style={{ borderColor: "#a5b4fc" }}>
              <div style={{ fontWeight: 700, color: "#4338ca" }}>{t.segment || t}</div>
              {typeof t === "object" && t.detail ? <div style={{ color: "#64748b" }}>{t.detail}</div> : null}
            </C>
          ))}
          {!(d.test_opportunities || []).length ? <div style={{ color: "#64748b" }}>None flagged.</div> : null}
        </div>
      )}

      {step === 3 && (
        <div>
          <SectionTitle>Next 48 Hours</SectionTitle>
          {(d.next_48_hours || []).map((n, i) => (
            <C key={i}>
              <Numbered i={i} /> <span style={{ verticalAlign: "middle", marginLeft: 6 }}>{n}</span>
            </C>
          ))}
          <SectionTitle>Next 7 Days</SectionTitle>
          {(d.next_7_days || []).map((n, i) => (
            <C key={i}>
              <span style={{ fontWeight: 700, color: "#6d28d9" }}>Day {i + 1}:</span> {n}
            </C>
          ))}
          {d.recommendations?.length ? (
            <C>
              <SectionTitle>Recommendations</SectionTitle>
              {(d.recommendations || []).map((r, i) => (
                <div key={i} style={{ marginBottom: 3 }}>- {r}</div>
              ))}
            </C>
          ) : null}
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12 }}>
        <button
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          style={{ background: "#ffffff", border: "1px solid #cbd5e1", color: "#334155", borderRadius: 7, padding: "7px 18px", fontSize: 13, fontWeight: 600, cursor: step === 0 ? "default" : "pointer", opacity: step === 0 ? 0.4 : 1 }}
        >
          Back
        </button>
        <button
          onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
          disabled={step === STEPS.length - 1}
          style={{ background: "#8b5cf6", border: "none", color: "#fff", borderRadius: 7, padding: "7px 18px", fontSize: 13, fontWeight: 600, cursor: step === STEPS.length - 1 ? "default" : "pointer", opacity: step === STEPS.length - 1 ? 0.4 : 1 }}
        >
          Next →
        </button>
      </div>
    </div>
  );
}