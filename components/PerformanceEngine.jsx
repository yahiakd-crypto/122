import { useState } from "react";

const STATUS_COLOR = {
  WINNER: { bg: "#dcfce7", fg: "#047857" },
  PROMISING: { bg: "#dbeafe", fg: "#1d4ed8" },
  TESTING: { bg: "#f1f5f9", fg: "#475569" },
  WEAK: { bg: "#fee2e2", fg: "#b91c1c" },
  FATIGUED: { bg: "#fef3c7", fg: "#b45309" },
  INSUFFICIENT_DATA: { bg: "#f1f5f9", fg: "#64748b" },
  DATA_INSUFFICIENT: { bg: "#fee2e2", fg: "#b91c1c" },
  LOW_SAMPLE: { bg: "#fef3c7", fg: "#b45309" },
  RELIABLE: { bg: "#dcfce7", fg: "#047857" },
  HIGH_CONFIDENCE: { bg: "#dcfce7", fg: "#047857" },
};

const STEPS = [
  { id: "overview", label: "Overview" },
  { id: "campaigns", label: "Campaigns" },
  { id: "adsets", label: "Ad Sets" },
  { id: "ads", label: "Ads" },
  { id: "push", label: "Push & Winners" },
  { id: "tests", label: "Tests & Budget" },
  { id: "next", label: "Next Steps" },
];

export default function PerformanceEngine({ data }) {
  const [step, setStep] = useState(0);
  const d = data && typeof data === "object" ? data : {};
  const statusColor = (s) => STATUS_COLOR[s] || STATUS_COLOR.INSUFFICIENT_DATA;

  const C = ({ children, style }) => (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: 10,
        padding: "14px 16px",
        marginBottom: 10,
        ...style,
      }}
    >
      {children}
    </div>
  );

  const Pill = ({ text }) => {
    const c = statusColor(text);
    return (
      <span
        style={{
          background: c.bg,
          color: c.fg,
          fontSize: 11,
          fontWeight: 700,
          padding: "2px 8px",
          borderRadius: 999,
          whiteSpace: "nowrap",
        }}
      >
        {text}
      </span>
    );
  };

  const SectionTitle = ({ children }) => (
    <div
      style={{
        fontSize: 14,
        fontWeight: 700,
        color: "#0f172a",
        margin: "18px 0 10px",
      }}
    >
      {children}
    </div>
  );

  return (
    <div
      style={{
        background: "#f3f6fa",
        borderRadius: 12,
        padding: 16,
        fontFamily: "'Inter', system-ui, sans-serif",
        fontSize: 13,
        color: "#1e293b",
        lineHeight: 1.5,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 14,
        }}
      >
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: 999,
            background: "#2563eb",
          }}
        />
        <div style={{ fontSize: 15, fontWeight: 800, color: "#0f172a" }}>
          Facebook Ads Performance Engine
        </div>
        {d.data_quality?.flag ? (
          <Pill text={d.data_quality.flag} />
        ) : null}
      </div>

      {d.data_quality?.issues?.length ? (
        <C style={{ background: "#fff7ed", borderColor: "#fdba74" }}>
          <SectionTitle>Data Quality Flags</SectionTitle>
          {d.data_quality.issues.map((i, k) => (
            <div key={k} style={{ marginBottom: 4 }}>
              <span
                style={{
                  display: "inline-block",
                  background: "#ffedd5",
                  color: "#c2410c",
                  fontSize: 11,
                  fontWeight: 700,
                  borderRadius: 4,
                  padding: "1px 6px",
                  marginRight: 6,
                }}
              >
                {i.issue}
              </span>
              {i.impact}
            </div>
          ))}
          {d.data_quality.missing?.length ? (
            <div style={{ marginTop: 6, color: "#9a3412" }}>
              Missing: {d.data_quality.missing.join(", ")}
            </div>
          ) : null}
        </C>
      ) : null}

      <div
        style={{
          display: "flex",
          gap: 6,
          flexWrap: "wrap",
          marginBottom: 14,
        }}
      >
        {STEPS.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setStep(i)}
            style={{
              border: i === step ? "1px solid #2563eb" : "1px solid #cbd5e1",
              background: i === step ? "#eff6ff" : "#ffffff",
              color: i === step ? "#1d4ed8" : "#475569",
              padding: "5px 12px",
              borderRadius: 7,
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {i + 1}. {s.label}
          </button>
        ))}
      </div>

      {step === 0 && (
        <div>
          <C>
            <SectionTitle>Executive Summary</SectionTitle>
            {d.executive_summary?.account_health ? (
              <div>
                <b>Account health:</b> {d.executive_summary.account_health}
              </div>
            ) : null}
            {d.executive_summary?.main_problem ? (
              <div>
                <b>Main problem:</b> {d.executive_summary.main_problem}
              </div>
            ) : null}
            {d.executive_summary?.main_opportunity ? (
              <div>
                <b>Main opportunity:</b> {d.executive_summary.main_opportunity}
              </div>
            ) : null}
            {d.executive_summary?.most_important_action ? (
              <div>
                <b>Most important action:</b>{" "}
                {d.executive_summary.most_important_action}
              </div>
            ) : null}
          </C>
          <C>
            <SectionTitle>Top Actions</SectionTitle>
            {(d.top_actions || []).map((a, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: 10,
                  padding: "9px 0",
                  borderBottom:
                    i < (d.top_actions || []).length - 1
                      ? "1px solid #eef2f7"
                      : "none",
                }}
              >
                <div
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 999,
                    background: "#2563eb",
                    color: "#fff",
                    fontSize: 11,
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {i + 1}
                </div>
                <div>
                  <div style={{ fontWeight: 600 }}>{a.action}</div>
                  {a.why ? (
                    <div style={{ color: "#64748b" }}>
                      Why: {a.why}
                      {a.priority ? ` | Priority ${a.priority}` : ""}
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </C>
        </div>
      )}

      {step === 1 && (
        <div>
          <SectionTitle>Campaign Analysis</SectionTitle>
          {(d.campaign_analysis || []).map((c, i) => (
            <C key={i}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 6,
                }}
              >
                <div style={{ fontWeight: 700 }}>{c.name}</div>
                {c.status ? <Pill text={c.status} /> : null}
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: "2px 16px",
                  color: "#475569",
                  marginBottom: 8,
                }}
              >
                <div>Spend: {c.spend || "n/a"}</div>
                <div>CPA: {c.cpa || "n/a"}</div>
                <div>ROAS: {c.roas || "n/a"}</div>
                <div>Bottleneck: {c.bottleneck || "n/a"}</div>
              </div>
              {c.diagnosis ? (
                <div
                  style={{
                    background: "#f8fafc",
                    borderRadius: 7,
                    padding: 8,
                    marginBottom: 6,
                  }}
                >
                  {c.diagnosis}
                </div>
              ) : null}
              {c.action ? (
                <div style={{ fontWeight: 600, color: "#1d4ed8" }}>
                  Action: {c.action}
                </div>
              ) : null}
            </C>
          ))}
        </div>
      )}

      {step === 2 && (
        <div>
          <SectionTitle>Ad Set Analysis</SectionTitle>
          {(d.adset_analysis || []).map((a, i) => (
            <C key={i}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 6,
                }}
              >
                <div style={{ fontWeight: 700 }}>{a.name}</div>
                {a.status ? <Pill text={a.status} /> : null}
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: "2px 16px",
                  color: "#475569",
                  marginBottom: 8,
                }}
              >
                {a.campaign ? <div>Campaign: {a.campaign}</div> : null}
                {a.audience ? <div>Audience: {a.audience}</div> : null}
                <div>Spend: {a.spend || "n/a"}</div>
                <div>CPA: {a.cpa || "n/a"}</div>
                <div>ROAS: {a.roas || "n/a"}</div>
              </div>
              {a.main_issue ? (
                <div style={{ color: "#b91c1c", marginBottom: 4 }}>
                  Issue: {a.main_issue}
                </div>
              ) : null}
              {a.action ? (
                <div style={{ fontWeight: 600, color: "#1d4ed8" }}>
                  Action: {a.action}
                </div>
              ) : null}
            </C>
          ))}
        </div>
      )}

      {step === 3 && (
        <div>
          <SectionTitle>Ad / Creative Analysis</SectionTitle>
          {(d.ad_analysis || []).map((ad, i) => (
            <C key={i}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 6,
                }}
              >
                <div style={{ fontWeight: 700 }}>{ad.name}</div>
                {ad.status ? <Pill text={ad.status} /> : null}
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "2px 12px",
                  color: "#475569",
                  marginBottom: 8,
                }}
              >
                {ad.creative_type ? (
                  <div>Creative: {ad.creative_type}</div>
                ) : null}
                {ad.format ? <div>Format: {ad.format}</div> : null}
                {ad.adset ? <div>Ad set: {ad.adset}</div> : null}
                <div>Spend: {ad.spend || "n/a"}</div>
                <div>CTR: {ad.ctr || "n/a"}</div>
                <div>CPC: {ad.cpc || "n/a"}</div>
                <div>CPA: {ad.cpa || "n/a"}</div>
                <div>ROAS: {ad.roas || "n/a"}</div>
                {ad.funnel_issue ? (
                  <div>Funnel: {ad.funnel_issue}</div>
                ) : null}
              </div>
              {ad.diagnosis ? (
                <div
                  style={{
                    background: "#f8fafc",
                    borderRadius: 7,
                    padding: 8,
                    marginBottom: 6,
                  }}
                >
                  {ad.diagnosis}
                </div>
              ) : null}
              {ad.action ? (
                <div style={{ fontWeight: 600, color: "#1d4ed8" }}>
                  Action: {ad.action}
                </div>
              ) : null}
            </C>
          ))}
        </div>
      )}

      {step === 4 && (
        <div>
          <SectionTitle>Push Delivery Recommendations</SectionTitle>
          {(d.push_delivery_recommendations || []).map((p, i) => (
            <C
              key={i}
              style={{
                borderColor:
                  p.recommendation === "PUSH" ? "#86efac" : "#fda4af",
              }}
            >
              <div style={{ fontWeight: 700 }}>{p.ad}</div>
              <div style={{ color: "#64748b", marginBottom: 6 }}>
                {p.campaign ? `Campaign: ${p.campaign} | ` : ""}
                Current spend: {p.current_spend || "n/a"} | Current delivery:{" "}
                {p.current_delivery || "n/a"}
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: "2px 16px",
                  color: "#475569",
                  marginBottom: 6,
                }}
              >
                <div>
                  Recommendation:{" "}
                  <b style={{ color: p.recommendation === "PUSH" ? "#047857" : "#b91c1c" }}>
                    {p.recommendation}
                  </b>
                </div>
                <div>
                  Push: {p.suggested_percentage || "—"} for{" "}
                  {p.suggested_duration || "—"}
                </div>
                <div>
                  Est. daily test budget:{" "}
                  {p.estimated_daily_test_budget || "n/a"}
                </div>
              </div>
              {p.reason ? <div>Reason: {p.reason}</div> : null}
              {p.success_criteria ? (
                <div style={{ color: "#475569" }}>
                  Success: {p.success_criteria}
                </div>
              ) : null}
              {p.stop_condition ? (
                <div style={{ color: "#b91c1c" }}>
                  Stop: {p.stop_condition}
                </div>
              ) : null}
            </C>
          ))}

          <SectionTitle>Winners & Losers</SectionTitle>
          {(d.winners || []).map((w, i) => (
            <C key={i} style={{ borderColor: "#86efac" }}>
              <div style={{ fontWeight: 700 }}>
                {w.name}{" "}
                {w.action ? (
                  <span style={{ color: "#047857", fontSize: 12 }}>
                    → {w.action}
                  </span>
                ) : null}
              </div>
              {w.evidence ? (
                <div style={{ color: "#475569" }}>{w.evidence}</div>
              ) : null}
            </C>
          ))}
          {(d.losers || []).map((l, i) => (
            <C key={i} style={{ borderColor: "#fda4af" }}>
              <div style={{ fontWeight: 700, color: "#b91c1c" }}>{l.name}</div>
              {l.evidence ? (
                <div style={{ color: "#64748b" }}>{l.evidence}</div>
              ) : null}
            </C>
          ))}
        </div>
      )}

      {step === 5 && (
        <div>
          <SectionTitle>Test Plan</SectionTitle>
          {(d.test_plan || []).map((t, i) => (
            <C key={i}>
              <div style={{ fontWeight: 700 }}>
                Test {i + 1}: {t.what || t.test}
              </div>
              {t.why ? <div>Why: {t.why}</div> : null}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: "2px 16px",
                  color: "#475569",
                }}
              >
                <div>Budget: {t.budget || "n/a"}</div>
                <div>Duration: {t.duration || "n/a"}</div>
                <div>Success: {t.success_metric || "n/a"}</div>
                <div>Stop: {t.stop_condition || "n/a"}</div>
              </div>
            </C>
          ))}

          <SectionTitle>Budget Action Plan</SectionTitle>
          {d.budget_action_plan ? (
            <C>
              <div>
                <b>Current:</b> {d.budget_action_plan.current || "n/a"}
              </div>
              <div>
                <b>Recommended:</b>{" "}
                {d.budget_action_plan.recommended || "n/a"}
              </div>
              {d.budget_action_plan.reason ? (
                <div style={{ color: "#64748b" }}>
                  Reason: {d.budget_action_plan.reason}
                </div>
              ) : null}
            </C>
          ) : null}
        </div>
      )}

      {step === 6 && (
        <div>
          <SectionTitle>Next 48 Hours</SectionTitle>
          {(d.next_48_hours || []).map((n, i) => (
            <C key={i}>
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 999,
                  background: "#2563eb",
                  color: "#fff",
                  fontSize: 11,
                  fontWeight: 700,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 8,
                }}
              >
                {i + 1}
              </div>
              {n}
            </C>
          ))}
          <SectionTitle>Next 7 Days</SectionTitle>
          {(d.next_7_days || []).map((n, i) => (
            <C key={i}>
              <span style={{ fontWeight: 700, color: "#1d4ed8" }}>
                Day {i + 1}:
              </span>{" "}
              {n}
            </C>
          ))}
          {d.recommendations?.length ? (
            <C>
              <SectionTitle>Recommendations</SectionTitle>
              {(d.recommendations || []).map((r, i) => (
                <div key={i} style={{ marginBottom: 3 }}>
                  - {r}
                </div>
              ))}
            </C>
          ) : null}
        </div>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 12,
        }}
      >
        <button
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          style={{
            background: "#ffffff",
            border: "1px solid #cbd5e1",
            color: "#334155",
            borderRadius: 7,
            padding: "7px 18px",
            fontSize: 13,
            fontWeight: 600,
            cursor: step === 0 ? "default" : "pointer",
            opacity: step === 0 ? 0.4 : 1,
          }}
        >
          Back
        </button>
        <button
          onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
          disabled={step === STEPS.length - 1}
          style={{
            background: "#2563eb",
            border: "none",
            color: "#fff",
            borderRadius: 7,
            padding: "7px 18px",
            fontSize: 13,
            fontWeight: 600,
            cursor: step === STEPS.length - 1 ? "default" : "pointer",
            opacity: step === STEPS.length - 1 ? 0.4 : 1,
          }}
        >
          Next →
        </button>
      </div>
    </div>
  );
}