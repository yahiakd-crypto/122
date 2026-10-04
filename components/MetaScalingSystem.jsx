import { useState } from "react";

const STEPS = ["Diagnosis", "Architecture", "Testing", "Dashboard", "Actions"];
const INDIGO = "#4f46e5";
const INK = "#1e293b";
const MUTED = "#64748b";
const CARD = "#f8fafc";
const LINE = "#e2e8f0";

function Pill({ children, color = "#e0e7ff", text = "#3730a3" }) {
  return (
    <span style={{ display: "inline-block", padding: "2px 10px", borderRadius: 999, fontSize: 12, fontWeight: 600, background: color, color: text, margin: "0 6px 6px 0" }}>
      {children}
    </span>
  );
}

function Chip({ label, value, sub }) {
  return (
    <div style={{ flex: "0 0 auto", minWidth: 130, padding: "10px 14px", borderRadius: 12, background: "#fff", border: "1px solid " + LINE }}>
      <div style={{ fontSize: 11, color: MUTED, textTransform: "uppercase", letterSpacing: "0.4px" }}>{label}</div>
      <div style={{ fontSize: 15, fontWeight: 700, color: INK, marginTop: 2 }}>{value || "—"}</div>
      {sub ? <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>{sub}</div> : null}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: INDIGO, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 10 }}>{title}</div>
      {children}
    </div>
  );
}

function KV({ k, v }) {
  return <div style={{ lineHeight: 1.9 }}><b style={{ color: INK }}>{k}:</b> <span style={{ color: MUTED }}>{v || "—"}</span></div>;
}

function bulletList(items, color) {
  if (!Array.isArray(items) || items.length === 0) return null;
  return (
    <ul style={{ margin: "6px 0 0 0", paddingLeft: 18, color: MUTED, fontSize: 13, lineHeight: 1.8 }}>
      {items.map((it, i) => <li key={i} style={color ? { color } : undefined}>{it}</li>)}
    </ul>
  );
}

const DEC_BG = {
  "KEEP": ["#dcfce7", "#166534"],
  "HOLD": ["#e0f2fe", "#075985"],
  "SCALE": ["#dcfce7", "#166534"],
  "TEST MORE": ["#fef3c7", "#92400e"],
  "REDUCE": ["#fef3c7", "#92400e"],
  "PAUSE CANDIDATE": ["#fee2e2", "#991b1b"],
};

const STATUS_BG = {
  "WINNER": ["#dcfce7", "#166534"],
  "EXPANSION": ["#dcfce7", "#166534"],
  "EARLY SIGNAL": ["#e0f2fe", "#075985"],
  "TESTING": ["#e0f2fe", "#075985"],
  "IN PRODUCTION": ["#e0f2fe", "#075985"],
  "IDEA": ["#f1f5f9", "#475569"],
  "FATIGUED": ["#fef3c7", "#92400e"],
  "ARCHIVED": ["#f1f5f9", "#475569"],
  "LOSER": ["#fee2e2", "#991b1b"],
};

export default function MetaScalingSystem({ data }) {
  const [step, setStep] = useState(0);
  const d = data || {};
  const diag = d.account_diagnosis || {};
  const arch = Array.isArray(d.campaign_architecture) ? d.campaign_architecture : [];
  const plan = Array.isArray(d.creative_testing_plan) ? d.creative_testing_plan : [];
  const dec = Array.isArray(d.scaling_decisions) ? d.scaling_decisions : [];
  const winners = Array.isArray(d.winner_expansion) ? d.winner_expansion : [];
  const fatigue = Array.isArray(d.fatigue) ? d.fatigue : [];
  const profit = d.profit_analysis || {};
  const cpaT = Array.isArray(d.cpa_targets) ? d.cpa_targets : [];
  const dash = d.dashboard || {};
  const cLevel = Array.isArray(dash.campaign_level) ? dash.campaign_level : [];
  const crLevel = Array.isArray(dash.creative_level) ? dash.creative_level : [];
  const cod = dash.cod_level || {};
  const actions = Array.isArray(d.next_actions) ? d.next_actions : [];
  const recs = Array.isArray(d.recommendations) ? d.recommendations : [];

  return (
    <div style={{ background: "#fff", color: INK, borderRadius: 16, padding: 18, fontFamily: "Segoe UI, system-ui, sans-serif" }}>
      <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 10, marginBottom: 16, borderBottom: "1px solid " + LINE }}>
        {STEPS.map((s, i) => (
          <button key={s} onClick={() => setStep(i)} style={{ flex: "0 0 auto", padding: "7px 14px", borderRadius: 999, border: "1px solid " + (i === step ? INDIGO : LINE), background: i === step ? INDIGO : "#fff", color: i === step ? "#fff" : MUTED, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            {i + 1}. {s}
          </button>
        ))}
      </div>

      {step === 0 && (
        <div>
          <Section title="Account Diagnosis">
            <div style={{ background: CARD, borderRadius: 14, padding: 14, marginBottom: 10 }}>
              <KV k="Current structure" v={diag.current_structure} />
            </div>
            {diag.main_problems?.length > 0 && (
              <div style={{ background: "#fef2f2", borderRadius: 14, padding: 14, marginBottom: 10 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#991b1b", marginBottom: 4 }}>Main problems</div>
                {bulletList(diag.main_problems, "#991b1b")}
              </div>
            )}
            {(diag.unnecessary_complexity?.length > 0 || diag.targeting_issues?.length > 0 || diag.offer_issues?.length > 0) && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 10 }}>
                {[["Unnecessary complexity", diag.unnecessary_complexity], ["Targeting issues", diag.targeting_issues], ["Offer issues", diag.offer_issues]].map(([t, arr]) => (
                  <div key={t} style={{ background: CARD, borderRadius: 14, padding: 14 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: INDIGO, marginBottom: 4 }}>{t}</div>
                    {bulletList(arr)}
                  </div>
                ))}
              </div>
            )}
          </Section>
          <Section title="Profit Analysis (Meta vs Delivered vs Real)">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              <Chip label="Meta CPA" value={profit.meta_cpa} />
              <Chip label="Delivered CPA" value={profit.delivered_cpa} />
              <Chip label="Real Revenue" value={profit.real_revenue} />
              <Chip label="Real Profit" value={profit.real_profit} />
              <Chip label="Profit Margin" value={profit.profit_margin} />
              <Chip label="Confirmation Rate" value={profit.confirmation_rate} />
              <Chip label="Delivery Rate" value={profit.delivery_rate} />
              <Chip label="Refusal Rate" value={profit.refusal_rate} />
            </div>
          </Section>
          <Section title="Campaign-Specific CPA Targets">
            {cpaT.length === 0 ? <div style={{ color: MUTED, fontSize: 13 }}>Aucune cible renvoyée.</div> : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ borderCollapse: "collapse", fontSize: 12, width: "100%" }}>
                  <thead>
                    <tr style={{ color: MUTED, textAlign: "left" }}>
                      {["Campaign", "Target CPA", "AOV", "Basis"].map(h => <th key={h} style={{ padding: "8px 10px", borderBottom: "2px solid " + LINE, whiteSpace: "nowrap" }}>{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {cpaT.map((r, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid " + LINE }}>
                        <td style={{ padding: "8px 10px", fontWeight: 700, whiteSpace: "nowrap" }}>{r.campaign || "—"}</td>
                        <td style={{ padding: "8px 10px" }}>{r.target_cpa || "—"}</td>
                        <td style={{ padding: "8px 10px" }}>{r.aov || "—"}</td>
                        <td style={{ padding: "8px 10px" }}>{r.basis || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Section>
        </div>
      )}

      {step === 1 && (
        <div>
          <Section title="Recommended Campaign Architecture (per offer)">
            {arch.length === 0 ? <div style={{ color: MUTED, fontSize: 13 }}>Aucune architecture renvoyée.</div> : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(330px, 1fr))", gap: 12 }}>
                {arch.map((c, i) => (
                  <div key={i} style={{ background: CARD, borderRadius: 14, padding: 14, border: "1px solid " + LINE }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <span style={{ background: INDIGO, color: "#fff", borderRadius: 999, width: 22, height: 22, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>{i + 1}</span>
                      <b style={{ fontSize: 14 }}>{c.campaign || "Campaign"}</b>
                      <span style={{ marginLeft: "auto", fontSize: 11, color: MUTED }}>{c.budget_split}</span>
                    </div>
                    {c.purpose && <div style={{ fontSize: 13, color: MUTED, lineHeight: 1.6, marginBottom: 6 }}>{c.purpose}</div>}
                    <div style={{ fontSize: 12, fontWeight: 700, color: INDIGO, margin: "6px 0 2px" }}>Ad sets</div>
                    {bulletList(c.ad_sets)}
                    <div style={{ fontSize: 12, fontWeight: 700, color: INDIGO, margin: "6px 0 2px" }}>Creative concepts</div>
                    {bulletList(c.creative_concepts)}
                  </div>
                ))}
              </div>
            )}
          </Section>
        </div>
      )}

      {step === 2 && (
        <div>
          <Section title="Creative Testing Plan (new concepts)">
            {plan.length === 0 ? <div style={{ color: MUTED, fontSize: 13 }}>Aucun plan renvoyé.</div> : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(330px, 1fr))", gap: 12 }}>
                {plan.map((p, i) => (
                  <div key={i} style={{ background: CARD, borderRadius: 14, padding: 14, border: "1px solid " + LINE }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <span style={{ background: INDIGO, color: "#fff", borderRadius: 999, width: 22, height: 22, flex: "0 0 auto", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>{i + 1}</span>
                      <b style={{ fontSize: 14 }}>{(p.concept || "Concept").replace(/_/g, " ")}</b>
                    </div>
                    <Pill>{p.concept_id || "—"}</Pill>
                    <Pill color="#fce7f3" text="#9d174d">{(p.angle || "—").replace(/_/g, " ")}</Pill>
                    {p.hooks?.length > 0 && (
                      <>
                        <div style={{ fontSize: 12, fontWeight: 700, color: INDIGO, margin: "6px 0 2px" }}>Hooks</div>
                        {bulletList(p.hooks)}
                      </>
                    )}
                    <div style={{ fontSize: 12, fontWeight: 700, color: INDIGO, margin: "6px 0 2px" }}>Formats</div>
                    {bulletList(p.formats)}
                    <KV k="Headline" v={p.headline} />
                    <KV k="CTA" v={p.cta} />
                    {p.brief && <div style={{ fontSize: 12, color: MUTED, marginTop: 6, lineHeight: 1.6 }}><b style={{ color: INK }}>Brief: </b>{p.brief}</div>}
                  </div>
                ))}
              </div>
            )}
          </Section>
          <Section title="Winner Expansion">
            {winners.length === 0 ? <div style={{ color: MUTED, fontSize: 13 }}>Aucun winner expansion renvoyé.</div> : winners.map((w, i) => (
              <div key={i} style={{ background: CARD, borderRadius: 14, padding: 14, marginBottom: 10, border: "1px solid " + LINE }}>
                <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                  <b>{w.creative_id || "Creative " + (i + 1)}</b>
                  <Pill>{w.concept_id || "—"}</Pill>
                </div>
                {w.winning_components && (
                  <div style={{ fontSize: 12, color: MUTED, marginBottom: 8 }}>
                    {"hook angle visual offer message proof cta".split(" ").map(k => w.winning_components[k] ? <Pill key={k} color="#f1f5f9" text="#475569">{k}: {String(w.winning_components[k]).slice(0, 60)}</Pill> : null)}
                  </div>
                )}
                <div style={{ fontSize: 12, fontWeight: 700, color: INDIGO, margin: "6px 0 2px" }}>Controlled variations</div>
                {bulletList(w.variations)}
              </div>
            ))}
          </Section>
        </div>
      )}

      {step === 3 && (
        <div>
          <Section title="Scaling Decisions">
            {dec.length === 0 ? <div style={{ color: MUTED, fontSize: 13 }}>Aucune décision renvoyée.</div> : dec.map((r, i) => {
              const bg = DEC_BG[String(r.decision || "").toUpperCase()] || ["#f1f5f9", INK];
              return (
                <div key={i} style={{ background: CARD, borderRadius: 14, padding: 14, marginBottom: 10, border: "1px solid " + LINE }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <b>{r.campaign || "—"}</b>
                    <Pill color={bg[0]} text={bg[1]}>{String(r.decision || "—").toUpperCase()}</Pill>
                  </div>
                  {r.reason && <div style={{ fontSize: 13, color: MUTED, lineHeight: 1.6, marginTop: 6 }}><b style={{ color: INK }}>Why: </b>{r.reason}</div>}
                  {r.supporting_metrics && <div style={{ fontSize: 13, color: MUTED, lineHeight: 1.6, marginTop: 4 }}><b style={{ color: INK }}>Metrics: </b>{r.supporting_metrics}</div>}
                </div>
              );
            })}
          </Section>
          <Section title="Profit-First Dashboard">
            <div style={{ fontSize: 12, fontWeight: 700, color: INDIGO, marginBottom: 6 }}>Campaign level</div>
            {cLevel.length === 0 ? <div style={{ color: MUTED, fontSize: 13, marginBottom: 12 }}>Aucune ligne campagne.</div> : (
              <div style={{ overflowX: "auto", marginBottom: 16 }}>
                <table style={{ borderCollapse: "collapse", fontSize: 12, width: "100%" }}>
                  <thead>
                    <tr style={{ color: MUTED, textAlign: "left" }}>
                      {["Campaign", "Spend", "Purch.", "Revenue", "CPA", "ROAS", "Profit", "Margin", "7d trend"].map(h => <th key={h} style={{ padding: "8px 10px", borderBottom: "2px solid " + LINE, whiteSpace: "nowrap" }}>{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {cLevel.map((r, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid " + LINE }}>
                        <td style={{ padding: "8px 10px", fontWeight: 700, whiteSpace: "nowrap" }}>{r.campaign || "—"}</td>
                        <td style={{ padding: "8px 10px" }}>{r.spend || "—"}</td>
                        <td style={{ padding: "8px 10px" }}>{r.purchases || "—"}</td>
                        <td style={{ padding: "8px 10px" }}>{r.revenue || "—"}</td>
                        <td style={{ padding: "8px 10px" }}>{r.cpa || "—"}</td>
                        <td style={{ padding: "8px 10px" }}>{r.roas || "—"}</td>
                        <td style={{ padding: "8px 10px" }}>{r.profit || "—"}</td>
                        <td style={{ padding: "8px 10px" }}>{r.profit_margin || "—"}</td>
                        <td style={{ padding: "8px 10px" }}>{r.trend_7d || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div style={{ fontSize: 12, fontWeight: 700, color: INDIGO, marginBottom: 6 }}>Creative level</div>
            {crLevel.length === 0 ? <div style={{ color: MUTED, fontSize: 13, marginBottom: 16 }}>Aucune ligne créative.</div> : (
              <div style={{ overflowX: "auto", marginBottom: 16 }}>
                <table style={{ borderCollapse: "collapse", fontSize: 12, width: "100%" }}>
                  <thead>
                    <tr style={{ color: MUTED, textAlign: "left" }}>
                      {["Creative", "Concept", "Angle", "Spend", "Pur.", "CPA", "Revenue", "Profit", "CTR", "Status"].map(h => <th key={h} style={{ padding: "8px 10px", borderBottom: "2px solid " + LINE, whiteSpace: "nowrap" }}>{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {crLevel.map((r, i) => {
                      const sb = STATUS_BG[String(r.status || "").toUpperCase()] || ["#f1f5f9", INK];
                      return (
                        <tr key={i} style={{ borderBottom: "1px solid " + LINE }}>
                          <td style={{ padding: "8px 10px", fontWeight: 700, whiteSpace: "nowrap" }}>{r.creative_id || "—"}</td>
                          <td style={{ padding: "8px 10px" }}>{r.concept_id || "—"}</td>
                          <td style={{ padding: "8px 10px" }}>{r.angle || "—"}</td>
                          <td style={{ padding: "8px 10px" }}>{r.spend || "—"}</td>
                          <td style={{ padding: "8px 10px" }}>{r.purchases || "—"}</td>
                          <td style={{ padding: "8px 10px" }}>{r.cpa || "—"}</td>
                          <td style={{ padding: "8px 10px" }}>{r.revenue || "—"}</td>
                          <td style={{ padding: "8px 10px" }}>{r.profit || "—"}</td>
                          <td style={{ padding: "8px 10px" }}>{r.ctr || "—"}</td>
                          <td style={{ padding: "8px 10px" }}><Pill color={sb[0]} text={sb[1]}>{String(r.status || "—").toUpperCase()}</Pill></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            <div style={{ fontSize: 12, fontWeight: 700, color: INDIGO, marginBottom: 6 }}>COD level</div>
            {Object.values(cod).some(v => v) ? (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {[["Orders", cod.orders], ["Confirmed", cod.confirmed], ["Shipped", cod.shipped], ["Delivered", cod.delivered], ["Refused", cod.refused], ["Delivery Rate", cod.delivery_rate], ["Delivered CPA", cod.delivered_cpa], ["Net Profit", cod.net_profit]].map(([k, v]) => <Chip key={k} label={k} value={v} />)}
              </div>
            ) : <div style={{ color: MUTED, fontSize: 13 }}>Aucune donnée COD.</div>}
          </Section>
        </div>
      )}

      {step === 4 && (
        <div>
          <Section title="Creative Fatigue">
            {fatigue.length === 0 ? <div style={{ color: MUTED, fontSize: 13 }}>Aucune fatigue détectée/renvoyée.</div> : fatigue.map((r, i) => {
              const fg = String(r.detected || "").toLowerCase() === "yes" ? ["#fee2e2", "#991b1b"] : ["#dcfce7", "#166534"];
              return (
                <div key={i} style={{ background: CARD, borderRadius: 14, padding: 14, marginBottom: 10, border: "1px solid " + LINE }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <b>{r.creative_id || "—"}</b>
                    <Pill color={fg[0]} text={fg[1]}>{String(r.detected || "—").toUpperCase()}</Pill>
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: INDIGO, margin: "6px 0 2px" }}>Indicators</div>
                  {bulletList(r.indicators)}
                  {r.action && <div style={{ fontSize: 13, color: MUTED, lineHeight: 1.6, marginTop: 6 }}><b style={{ color: INK }}>Action: </b>{r.action}</div>}
                </div>
              );
            })}
          </Section>
          {actions.length > 0 && (
            <Section title="Next Actions">
              <div style={{ background: "#eef2ff", borderRadius: 14, padding: 14 }}>{bulletList(actions, "#3730a3")}</div>
            </Section>
          )}
          {recs.length > 0 && (
            <Section title="Top Recommendations">
              <div style={{ background: CARD, borderRadius: 14, padding: 14 }}>{bulletList(recs)}</div>
            </Section>
          )}
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 18, paddingTop: 14, borderTop: "1px solid " + LINE }}>
        <button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0} style={navBtn(false, step === 0)}>← Back</button>
        <button onClick={() => setStep(Math.min(STEPS.length - 1, step + 1))} disabled={step === STEPS.length - 1} style={navBtn(true, step === STEPS.length - 1)}>Next →</button>
      </div>
    </div>
  );
}

function navBtn(primary, disabled) {
  return {
    padding: "8px 18px", borderRadius: 10, border: "1px solid " + (primary ? INDIGO : LINE),
    background: primary ? INDIGO : "#fff", color: primary ? "#fff" : MUTED,
    fontSize: 13, fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1,
  };
}