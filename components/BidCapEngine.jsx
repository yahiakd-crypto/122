const RISK_COLOR = {
  LOW: { bg: "#dcfce7", fg: "#047857" },
  MEDIUM: { bg: "#fef3c7", fg: "#b45309" },
  HIGH: { bg: "#fee2e2", fg: "#b91c1c" },
};

const CLASS_COLOR = {
  BID_CAP_RECOMMENDED: { bg: "#dcfce7", fg: "#047857" },
  BID_CAP_WORTH_TESTING: { bg: "#dbeafe", fg: "#1d4ed8" },
  BID_CAP_NOT_RECOMMENDED: { bg: "#fee2e2", fg: "#b91c1c" },
  INSUFFICIENT_DATA: { bg: "#f1f5f9", fg: "#64748b" },
};

export default function BidCapEngine({ data }) {
  const d = data && typeof data === "object" ? data : {};
  const diag = d.bid_strategy_diagnosis || {};
  const rec = d.recommendation || {};
  const tp = d.test_plan || {};

  const C = ({ children, style }) => (
    <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "14px 16px", marginBottom: 12, ...style }}>
      {children}
    </div>
  );

  const Pill = ({ text, map }) => {
    const c = (map || RISK_COLOR)[text] || CLASS_COLOR.INSUFFICIENT_DATA;
    return (
      <span style={{ background: c.bg, color: c.fg, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 999, whiteSpace: "nowrap" }}>
        {text}
      </span>
    );
  };

  const Field = ({ label, value }) => (
    <div>
      <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.4 }}>{label}</div>
      <div style={{ fontWeight: 600, color: "#0f172a", marginTop: 2 }}>{value || "n/a"}</div>
    </div>
  );

  const SectionTitle = ({ children }) => (
    <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", margin: "18px 0 10px" }}>{children}</div>
  );

  return (
    <div style={{ background: "#f3f6fa", borderRadius: 12, padding: 16, fontFamily: "'Inter', system-ui, sans-serif", fontSize: 13, color: "#1e293b", lineHeight: 1.55 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <div style={{ width: 10, height: 10, borderRadius: 999, background: "#059669" }} />
        <div style={{ fontSize: 15, fontWeight: 800, color: "#0f172a" }}>Meta Ads Bid Cap Analyzer</div>
        {diag.classification ? <Pill text={diag.classification} map={CLASS_COLOR} /> : null}
      </div>

      <C>
        <SectionTitle>Bid Strategy Diagnosis</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px 20px" }}>
          <Field label="Current strategy" value={diag.current_strategy} />
          <Field label="Current CPA" value={diag.current_cpa} />
          <Field label="Historical CPA" value={diag.historical_cpa} />
          <Field label="Purchase volume" value={diag.purchase_volume} />
          <Field label="Delivery status" value={diag.delivery_status} />
        </div>
      </C>

      <C style={{ borderColor: rec.strategy ? "#34d399" : "#e2e8f0" }}>
        <SectionTitle>Recommendation</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px 20px", marginBottom: 8 }}>
          <Field label="Strategy" value={rec.strategy} />
          <Field label="Bid Cap" value={rec.bid_cap} />
        </div>
        {rec.confidence ? <Field label="Confidence" value={rec.confidence} /> : null}
        {rec.reason ? (
          <div style={{ background: "#f8fafc", borderRadius: 7, padding: 10, marginTop: 8 }}>{rec.reason}</div>
        ) : null}
      </C>

      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>Delivery risk:</span>
        <Pill text={d.delivery_risk || "n/a"} map={RISK_COLOR} />
        <span style={{ fontSize: 11, color: "#94a3b8" }}>
          A Bid Cap is an auction bidding constraint — actual CPA can be below, around, or above the cap. It is NOT a guaranteed CPA target.
        </span>
      </div>

      <C>
        <SectionTitle>Test Plan</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px 20px", marginBottom: 8 }}>
          <Field label="Starting cap" value={tp.starting_cap} />
          <Field label="Duration" value={tp.duration} />
          <Field label="Budget" value={tp.budget} />
        </div>
        <div style={{ marginTop: 4 }}>
          <div style={{ marginBottom: 4 }}><b style={{ color: "#047857" }}>Success:</b> {tp.success_metric || "n/a"}</div>
          <div style={{ marginBottom: 4 }}><b style={{ color: "#b45309" }}>Warning:</b> {tp.warning || "n/a"}</div>
          <div><b style={{ color: "#b91c1c" }}>Stop:</b> {tp.stop_condition || "n/a"}</div>
        </div>
      </C>

      <C>
        <SectionTitle>Adjustment Rules</SectionTitle>
        {(d.adjustment_rules || []).map((r, i) => (
          <div key={i} style={{ display: "flex", gap: 10, padding: "7px 0", borderBottom: i < (d.adjustment_rules || []).length - 1 ? "1px solid #eef2f7" : "none" }}>
            <div style={{ width: 22, height: 22, borderRadius: 999, background: "#059669", color: "#fff", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{i + 1}</div>
            <div>{r}</div>
          </div>
        ))}
      </C>

      {d.final_action ? (
        <C style={{ background: "#ecfdf5", borderColor: "#6ee7b7" }}>
          <SectionTitle>Final Action</SectionTitle>
          <div style={{ fontWeight: 700, color: "#047857" }}>{d.final_action}</div>
        </C>
      ) : null}

      {d.recommendations?.length ? (
        <C>
          <SectionTitle>Recommendations</SectionTitle>
          {(d.recommendations || []).map((r, i) => (
            <div key={i} style={{ marginBottom: 3 }}>- {r}</div>
          ))}
        </C>
      ) : null}
    </div>
  );
}