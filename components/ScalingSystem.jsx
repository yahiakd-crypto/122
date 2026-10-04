import { useState } from "react";

const STEPS = ["Account", "Testing", "Winners", "Test Plan", "Actions"];

const GREEN = "#059669";
const INK = "#1e293b";
const MUTED = "#64748b";
const CARD = "#f8fafc";
const LINE = "#e2e8f0";

function Pill({ children, color = "#e0f2fe", text = "#075985" }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 10px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 600,
        background: color,
        color: text,
        margin: "0 6px 6px 0",
      }}
    >
      {children}
    </span>
  );
}

function Chip({ label, value, sub }) {
  return (
    <div
      style={{
        flex: "0 0 auto",
        minWidth: 130,
        padding: "10px 14px",
        borderRadius: 12,
        background: "#fff",
        border: "1px solid " + LINE,
      }}
    >
      <div style={{ fontSize: 11, color: MUTED, textTransform: "uppercase", letterSpacing: "0.4px" }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 700, color: INK, marginTop: 2 }}>{value || "—"}</div>
      {sub ? <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>{sub}</div> : null}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: GREEN, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 10 }}>
        {title}
      </div>
      {children}
    </div>
  );
}

function KV({ k, v }) {
  return (
    <div style={{ lineHeight: 1.9 }}>
      <b style={{ color: INK }}>{k}:</b> <span style={{ color: MUTED }}>{v || "—"}</span>
    </div>
  );
}

function bulletList(items, color) {
  if (!Array.isArray(items) || items.length === 0) return null;
  return (
    <ul style={{ margin: "6px 0 0 0", paddingLeft: 18, color: MUTED, fontSize: 13, lineHeight: 1.8 }}>
      {items.map((it, i) => (
        <li key={i} style={color ? { color } : undefined}>{it}</li>
      ))}
    </ul>
  );
}

const STATUS_BG = {
  "WINNER": ["#dcfce7", "#166534"],
  "POTENTIAL WINNER": ["#dcfce7", "#166534"],
  "STABLE": ["#e0f2fe", "#075985"],
  "INSUFFICIENT DATA": ["#fef3c7", "#92400e"],
  "LOSER": ["#fee2e2", "#991b1b"],
  "HIGH-SPEND LOSER": ["#fee2e2", "#991b1b"],
  "HIGH-CPA": ["#fee2e2", "#991b1b"],
  "LOW-VOLUME": ["#fef3c7", "#92400e"],
  "NEEDS RETEST": ["#fef3c7", "#92400e"],
};

export default function ScalingSystem({ data }) {
  const [step, setStep] = useState(0);
  const d = data || {};
  const as = d.account_structure || {};
  const perf = d.performance || {};
  const ct = d.creative_testing || {};
  const matrix = d.creative_matrix || [];
  const dna = d.winning_dna || {};
  const heroP = d.hero_product || {};
  const heroO = d.hero_offer || {};
  const plan = d.next_7_day_test_plan || [];
  const scale = d.scaling_plan || {};
  const fatigue = d.creative_fatigue || [];
  const recs = d.recommendations || [];
  const learn = d.key_learnings || [];
  const actions = d.next_actions || [];

  const complexityColor =
    String(as.complexity_score || "").indexOf("HIGH") !== -1
      ? ["#fee2e2", "#991b1b"]
      : String(as.complexity_score || "").indexOf("MODERATE") !== -1
      ? ["#fef3c7", "#92400e"]
      : ["#dcfce7", "#166534"];

  return (
    <div style={{ background: "#fff", color: INK, borderRadius: 16, padding: 18, fontFamily: "Segoe UI, system-ui, sans-serif" }}>
      <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 10, marginBottom: 16, borderBottom: "1px solid " + LINE }}>
        {STEPS.map((s, i) => (
          <button
            key={s}
            onClick={() => setStep(i)}
            style={{
              flex: "0 0 auto",
              padding: "7px 14px",
              borderRadius: 999,
              border: "1px solid " + (i === step ? GREEN : LINE),
              background: i === step ? GREEN : "#fff",
              color: i === step ? "#fff" : MUTED,
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {i + 1}. {s}
          </button>
        ))}
      </div>

      {step === 0 && (
        <div>
          <Section title="Account Structure">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
              <Chip label="Campaigns" value={as.campaign_count} />
              <Chip label="Ad Sets" value={as.adset_count} />
              <Chip label="CBO / ABO" value={as.cbo_abo} />
              <div style={{ alignSelf: "center" }}>
                <Pill color={complexityColor[0]} text={complexityColor[1]}>{String(as.complexity_score || "—").replace(/_/g, " ")}</Pill>
              </div>
            </div>
            <div style={{ background: CARD, borderRadius: 14, padding: 14, marginBottom: 10 }}>
              <KV k="Current structure" v={as.current_structure} />
              <KV k="Audience structure" v={as.audience_structure} />
            </div>
            {as.problems?.length > 0 && (
              <div style={{ background: "#fef2f2", borderRadius: 14, padding: 14, marginBottom: 10 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#991b1b", marginBottom: 4 }}>Problems detected</div>
                {bulletList(as.problems, "#991b1b")}
              </div>
            )}
            {as.simplification_opportunities?.length > 0 && (
              <div style={{ background: CARD, borderRadius: 14, padding: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: GREEN, marginBottom: 4 }}>Simplification opportunities</div>
                {bulletList(as.simplification_opportunities)}
              </div>
            )}
          </Section>
          <Section title="Performance">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              <Chip label="Spend" value={perf.spend} />
              <Chip label="Purchases" value={perf.purchases} />
              <Chip label="CPA" value={perf.cpa} />
              <Chip label="AOV" value={perf.aov} />
              <Chip label="ROAS" value={perf.roas} />
              <Chip label="Profit" value={perf.profit} />
              <Chip label="Conv. Rate" value={perf.conversion_rate} />
            </div>
            {perf.cod_metrics && Object.keys(perf.cod_metrics).filter(k => perf.cod_metrics[k]).length > 0 && (
              <div style={{ background: CARD, borderRadius: 14, padding: 14, marginTop: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: GREEN, marginBottom: 4 }}>COD metrics (delivered-economics)</div>
                {bulletList(Object.entries(perf.cod_metrics).map(([k, v]) => `${k.replace(/_/g, " ")}: ${v}`))}
              </div>
            )}
          </Section>
        </div>
      )}

      {step === 1 && (
        <div>
          <Section title="Creative Testing">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              <Chip label="Concepts tested" value={ct.concepts_tested} />
              <Chip label="Creatives tested" value={ct.creatives_tested} />
              <Chip label="New this week" value={ct.new_concepts_this_week} />
              <Chip label="Winners" value={ct.winners} />
              <Chip label="Potential" value={ct.potential_winners} />
              <Chip label="Losers" value={ct.losers} />
              <Chip label="High CPA" value={ct.high_cpa} />
              <Chip label="Insuff. data" value={ct.insufficient_data} />
            </div>
          </Section>
          <Section title="Creative Test Matrix">
            {matrix.length === 0 ? (
              <div style={{ color: MUTED, fontSize: 13 }}>No matrix rows returned.</div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ borderCollapse: "collapse", fontSize: 12, width: "100%" }}>
                  <thead>
                    <tr style={{ color: MUTED, textAlign: "left" }}>
                      {["Concept", "Hook", "Angle", "Visual", "Offer", "Spend", "Pur.", "CPA", "AOV", "ROAS", "Profit", "Status"].map(h => (
                        <th key={h} style={{ padding: "8px 10px", borderBottom: "2px solid " + LINE, whiteSpace: "nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {matrix.map((r, i) => {
                      const sb = STATUS_BG[String(r.status || "").toUpperCase()] || ["#f1f5f9", INK];
                      return (
                        <tr key={i} style={{ borderBottom: "1px solid " + LINE }}>
                          <td style={{ padding: "8px 10px", fontWeight: 700, whiteSpace: "nowrap" }}>{r.concept || "—"}</td>
                          <td style={{ padding: "8px 10px" }}>{r.hook || "—"}</td>
                          <td style={{ padding: "8px 10px" }}>{r.angle || "—"}</td>
                          <td style={{ padding: "8px 10px" }}>{r.visual || "—"}</td>
                          <td style={{ padding: "8px 10px" }}>{r.offer || "—"}</td>
                          <td style={{ padding: "8px 10px" }}>{r.spend || "—"}</td>
                          <td style={{ padding: "8px 10px" }}>{r.purchases || "—"}</td>
                          <td style={{ padding: "8px 10px" }}>{r.cpa || "—"}</td>
                          <td style={{ padding: "8px 10px" }}>{r.aov || "—"}</td>
                          <td style={{ padding: "8px 10px" }}>{r.roas || "—"}</td>
                          <td style={{ padding: "8px 10px" }}>{r.profit || "—"}</td>
                          <td style={{ padding: "8px 10px" }}><Pill color={sb[0]} text={sb[1]}>{String(r.status || "—").replace(/_/g, " ")}</Pill></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Section>
        </div>
      )}

      {step === 2 && (
        <div>
          <Section title="Winning Creative DNA">
            <div style={{ background: CARD, borderRadius: 14, padding: 14, marginBottom: 10 }}>
              <KV k="Concept" v={dna.concept} />
              <KV k="Hook" v={dna.hook} />
              <KV k="Angle" v={dna.angle} />
              <KV k="Visual" v={dna.visual} />
              <KV k="Offer" v={dna.offer} />
              <KV k="Product" v={dna.product} />
              <KV k="Audience" v={dna.audience} />
              <KV k="Landing Page" v={dna.landing_page} />
              {dna.reason_it_won && <div style={{ marginTop: 6, fontSize: 13, lineHeight: 1.7, color: MUTED }}><b style={{ color: INK }}>Why it won: </b>{dna.reason_it_won}</div>}
            </div>
          </Section>
          <Section title="Hero Product">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
              <Chip label="Product" value={heroP.product} />
              <div style={{ alignSelf: "center" }}>
                <Pill>{(heroP.classification || "—").replace(/_/g, " ")}</Pill>
              </div>
            </div>
            <div style={{ background: CARD, borderRadius: 14, padding: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: GREEN, marginBottom: 4 }}>Availability</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {[["Revenue", heroP.revenue], ["Purchases", heroP.purchases], ["Profit", heroP.profit], ["AOV", heroP.aov], ["Delivery quality", heroP.delivery_quality]].map(([k, v]) => (
                  <div key={k} style={{ flex: "0 0 auto", minWidth: 110, padding: "8px 12px", background: "#fff", border: "1px solid " + LINE, borderRadius: 10 }}>
                    <div style={{ fontSize: 11, color: MUTED }}>{k}</div>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{v || "—"}</div>
                  </div>
                ))}
              </div>
            </div>
          </Section>
          <Section title="Hero Offer">
            <div style={{ background: CARD, borderRadius: 14, padding: 14 }}>
              <div style={{ marginBottom: 8 }}>
                <Pill color="#fce7f3" text="#9d174d">{(heroO.offer || "—").replace(/_/g, " ")}</Pill>
                <Pill color={String(heroO.is_hero).toLowerCase() === "yes" ? "#dcfce7" : "#fef3c7"} text={String(heroO.is_hero).toLowerCase() === "yes" ? "#166534" : "#92400e"}>
                  {String(heroO.is_hero || "—").toUpperCase()}
                </Pill>
              </div>
              <KV k="Perceived value" v={heroO.perceived_value} />
              <KV k="AOV impact" v={heroO.aov_impact} />
              <KV k="CPA impact" v={heroO.cpa_impact} />
              <KV k="Profit impact" v={heroO.profit_impact} />
              <KV k="Conversion impact" v={heroO.conversion_impact} />
              <KV k="Repeat purchase impact" v={heroO.repeat_purchase_impact} />
            </div>
          </Section>
        </div>
      )}

      {step === 3 && (
        <div>
          <Section title="Next 7-Day Test Plan (4-6 Concepts)">
            {plan.length === 0 ? (
              <div style={{ color: MUTED, fontSize: 13 }}>No test plan returned.</div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 12 }}>
                {plan.map((p, i) => (
                  <div key={i} style={{ background: CARD, borderRadius: 14, padding: 14, border: "1px solid " + LINE }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <span style={{ background: GREEN, color: "#fff", borderRadius: 999, width: 22, height: 22, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>{i + 1}</span>
                      <b style={{ fontSize: 15 }}>{(p.concept || "Concept").replace(/_/g, " ")}</b>
                      <span style={{ marginLeft: "auto", fontSize: 11, color: MUTED }}>{p.variations_count ? p.variations_count + " variations" : ""}</span>
                    </div>
                    {p.hypothesis && <div style={{ fontSize: 13, lineHeight: 1.6, color: INK, marginBottom: 8 }}><b>Hypothesis: </b>{p.hypothesis}</div>}
                    <Pill>{String(p.awareness_stage || "—").replace(/_/g, " ")}</Pill>
                    <Pill color="#fce7f3" text="#9d174d">Angle: {(p.angle || "—").replace(/_/g, " ")}</Pill>
                    <Pill color="#fef3c7" text="#92400e">Offer: {(p.offer || "—").replace(/_/g, " ")}</Pill>
                    <div style={{ fontSize: 12, color: MUTED, margin: "8px 0 3px", fontWeight: 600 }}>Hooks</div>
                    {bulletList(p.hooks)}
                    <div style={{ fontSize: 12, color: MUTED, margin: "6px 0 3px", fontWeight: 600 }}>Visuals</div>
                    {bulletList(p.visuals)}
                  </div>
                ))}
              </div>
            )}
          </Section>
        </div>
      )}

      {step === 4 && (
        <div>
          <Section title="Scaling Plan">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 12 }}>
              {[["Scale — controlled moves", scale.scale, "#dcfce7", "#166534"],
                ["Iterate — new variations of winners", scale.iterate, "#e0f2fe", "#075985"],
                ["Hold — stable", scale.hold, "#f1f5f9", "#475569"],
                ["Retest — with better data", scale.retest, "#fef3c7", "#92400e"],
                ["Kill — actual losers", scale.kill, "#fee2e2", "#991b1b"]].map(([title, items, bg, txt]) => (
                <div key={title} style={{ background: CARD, borderRadius: 14, padding: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: txt, marginBottom: 6 }}>{title}</div>
                  {bulletList(items, txt)}
                </div>
              ))}
            </div>
          </Section>
          <Section title="Creative Fatigue">
            {fatigue.length === 0 ? (
              <div style={{ color: MUTED, fontSize: 13 }}>No fatigue rows returned.</div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ borderCollapse: "collapse", fontSize: 12, width: "100%" }}>
                  <thead>
                    <tr style={{ color: MUTED, textAlign: "left" }}>
                      {["Creative", "State", "Evidence", "Action"].map(h => (
                        <th key={h} style={{ padding: "8px 10px", borderBottom: "2px solid " + LINE, whiteSpace: "nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {fatigue.map((r, i) => {
                      const st = String(r.state || "").toUpperCase();
                      const bg = st === "DEAD" || st === "DECLINING" ? "#fee2e2" : st === "FATIGUED" ? "#fef3c7" : "#dcfce7";
                      const txt = st === "DEAD" || st === "DECLINING" ? "#991b1b" : st === "FATIGUED" ? "#92400e" : "#166534";
                      return (
                        <tr key={i} style={{ borderBottom: "1px solid " + LINE }}>
                          <td style={{ padding: "8px 10px", fontWeight: 700 }}>{r.creative || "—"}</td>
                          <td style={{ padding: "8px 10px" }}><Pill color={bg} text={txt}>{st || "—"}</Pill></td>
                          <td style={{ padding: "8px 10px" }}>{r.evidence || "—"}</td>
                          <td style={{ padding: "8px 10px" }}>{r.action || "—"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Section>
          {learn.length > 0 && (
            <Section title="Key Learnings">
              <div style={{ background: CARD, borderRadius: 14, padding: 14 }}>{bulletList(learn)}</div>
            </Section>
          )}
          {actions.length > 0 && (
            <Section title="Next Actions">
              <div style={{ background: "#ecfdf5", borderRadius: 14, padding: 14 }}>{bulletList(actions, "#065f46")}</div>
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
        <button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0} style={navBtn(false, step === 0)}>
          ← Back
        </button>
        <button onClick={() => setStep(Math.min(STEPS.length - 1, step + 1))} disabled={step === STEPS.length - 1} style={navBtn(true, step === STEPS.length - 1)}>
          Next →
        </button>
      </div>
    </div>
  );
}

function navBtn(primary, disabled) {
  return {
    padding: "8px 18px",
    borderRadius: 10,
    border: "1px solid " + (primary ? GREEN : LINE),
    background: primary ? GREEN : "#fff",
    color: primary ? "#fff" : MUTED,
    fontSize: 13,
    fontWeight: 600,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1,
  };
}