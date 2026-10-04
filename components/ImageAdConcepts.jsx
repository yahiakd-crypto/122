import { useState } from "react";

const STEPS = [
  { id: "strategy", label: "Strategy" },
  { id: "concepts", label: "Concepts & Prompts" },
  { id: "tests", label: "Test Plan" },
];

const STAGE_COLOR = {
  UNAWARE: { bg: "#dbeafe", fg: "#1d4ed8" },
  PROBLEM_AWARE: { bg: "#fef3c7", fg: "#b45309" },
  SOLUTION_AWARE: { bg: "#ede9fe", fg: "#6d28d9" },
  PRODUCT_AWARE: { bg: "#dcfce7", fg: "#047857" },
  MOST_AWARE: { bg: "#fee2e2", fg: "#b91c1c" },
};

export default function ImageAdConcepts({ data, grounding, connectedNodes }) {
  const [step, setStep] = useState(0);
  const [open, setOpen] = useState({});
  const [copied, setCopied] = useState(null);
  const rawText = typeof data === "string" ? data : null;
  const parsed = data && typeof data === "object" && !Array.isArray(data) ? data : null;
  const d = parsed || {};
  const rawConcepts = d.selected_concepts || d.concepts || [];
  const concepts = Array.isArray(rawConcepts)
    ? rawConcepts.map((c) => {
        const obj = c && typeof c === "object" ? c : {};
        let prompts = Array.isArray(obj.image_prompts) ? obj.image_prompts : [];
        if (!prompts.length && obj.image_prompt) prompts = [{ variation: "A", prompt: obj.image_prompt }];
        if (!prompts.length && obj.prompt) prompts = [{ variation: "A", prompt: obj.prompt }];
        prompts = prompts.map((p) => (typeof p === "string" ? { variation: "A", prompt: p } : p));
        return { ...obj, image_prompts: prompts };
      })
    : [];
  const strategy = d.creative_strategy || {};

  const copy = async (text, key) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      setCopied(null);
    }
  };

  const C = ({ children, style }) => (
    <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "14px 16px", marginBottom: 10, ...style }}>
      {children}
    </div>
  );

  const SectionTitle = ({ children }) => (
    <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", margin: "18px 0 10px" }}>{children}</div>
  );

  const StagePill = ({ text }) => {
    const c = STAGE_COLOR[text] || STAGE_COLOR.SOLUTION_AWARE;
    return (
      <span style={{ background: c.bg, color: c.fg, fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 999, whiteSpace: "nowrap", textTransform: "uppercase" }}>
        {text}
      </span>
    );
  };

  const PromptBlock = ({ label, value, color }) => (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
        <b style={{ color }}>{label}</b>
        <button
          onClick={() => copy(value, label)}
          style={{ background: "#f1f5f9", border: "1px solid #e2e8f0", color: "#475569", borderRadius: 6, padding: "3px 10px", fontSize: 11, fontWeight: 600, cursor: "pointer" }}
        >
          {copied === label ? "Copied!" : "Copy"}
        </button>
      </div>
      <div
        style={{
          background: "#f8fafc",
          border: "1px solid #e2e8f0",
          borderRadius: 8,
          padding: 10,
          fontSize: 12,
          lineHeight: 1.5,
          color: "#334155",
          whiteSpace: "pre-wrap",
          maxHeight: 260,
          overflowY: "auto",
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          scrollbarWidth: "thin",
          scrollbarColor: "#94a3b8 #eef2f7",
        }}
      >
        {value}
      </div>
    </div>
  );

  return (
    <div style={{ background: "#f3f6fa", borderRadius: 12, padding: 16, fontFamily: "'Inter', system-ui, sans-serif", fontSize: 13, color: "#1e293b", lineHeight: 1.55 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <div style={{ width: 10, height: 10, borderRadius: 999, background: "#f43f5e" }} />
        <div style={{ fontSize: 15, fontWeight: 800, color: "#0f172a" }}>Image Ad Concept Generator</div>
        {strategy.primary_awareness_stage ? <StagePill text={strategy.primary_awareness_stage} /> : null}
      </div>

      <div
        style={{
          background: grounding && grounding !== "NONE" ? "#eff6ff" : "#fef2f2",
          border: grounding && grounding !== "NONE" ? "1px solid #bfdbfe" : "1px solid #fecaca",
          borderRadius: 10,
          padding: "10px 14px",
          marginBottom: 14,
        }}
      >
        {grounding && grounding !== "NONE" ? (
          <span>
            <b style={{ color: "#1d4ed8" }}>Product read from your group:</b>{" "}
            <span style={{ color: "#334155", whiteSpace: "pre-wrap" }}>{grounding.slice(0, 500)}{grounding.length > 500 ? "..." : ""}</span>
          </span>
        ) : (
          <span>
            <b style={{ color: "#b91c1c" }}>No product data was read from the connected group.</b>{" "}
            <span style={{ color: "#7f1d1d" }}>Run the product skills inside the group first (Product Deep Dive, Why People Buy, Target Audience...), then re-run this skill.</span>
            {connectedNodes?.length ? (
              <div style={{ marginTop: 6, fontSize: 11, color: "#991b1b" }}>
                Connected nodes detected: <b>{connectedNodes.join(", ")}</b> — if you don't see <b>group_0 / group_1...</b> here, the link to the group is missing or reversed. Re-draw a link from the group to this skill.
              </div>
            ) : (
              <div style={{ marginTop: 6, fontSize: 11, color: "#991b1b" }}>
                No connected node detected at run time — re-draw the link from the group card to this skill, then run again.
              </div>
            )}
          </span>
        )}
      </div>

      {rawText ? (
        <div style={{ background: "#fff7ed", border: "1px solid #fdba74", borderRadius: 10, padding: "12px 16px", marginBottom: 14 }}>
          <b style={{ color: "#c2410c" }}>The result could not be parsed as structured concepts.</b>{" "}
          <span style={{ color: "#9a3412" }}>The full generated content is below (concepts and prompts are inside). Regenerate to get the clean structured view.</span>
          <div style={{ whiteSpace: "pre-wrap", fontFamily: "'JetBrains Mono', monospace", fontSize: 12, lineHeight: 1.5, background: "#fff", border: "1px solid #fed7aa", borderRadius: 8, padding: 10, maxHeight: 420, overflowY: "auto", marginTop: 10, scrollbarWidth: "thin", scrollbarColor: "#94a3b8 #eef2f7" }}>
            {rawText}
          </div>
        </div>
      ) : !concepts.length ? (
        <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 10, padding: "12px 16px", marginBottom: 14 }}>
          <b style={{ color: "#1d4ed8" }}>No concepts were generated.</b>{" "}
          <span style={{ color: "#475569" }}>Connect this skill to a product group (Product Deep Dive, Why People Buy, Target Audience, Competitor Recon...) then run it again. If it still shows nothing, run twice — the model sometimes needs the context present.</span>
        </div>
      ) : null}

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
        {STEPS.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setStep(i)}
            style={{
              border: i === step ? "1px solid #f43f5e" : "1px solid #cbd5e1",
              background: i === step ? "#fff1f2" : "#ffffff",
              color: i === step ? "#be123c" : "#475569",
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
            <SectionTitle>Creative Strategy</SectionTitle>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "8px 20px" }}>
              {strategy.product && <div><b>Product:</b> {strategy.product}</div>}
              {strategy.target_audience && <div><b>Audience:</b> {strategy.target_audience}</div>}
              {strategy.market && <div><b>Market:</b> {strategy.market}</div>}
              {strategy.primary_awareness_stage && <div><b>Stage:</b> {strategy.primary_awareness_stage}</div>}
              {strategy.main_customer_desire && <div><b>Desire:</b> {strategy.main_customer_desire}</div>}
              {strategy.main_pain_point && <div><b>Pain point:</b> {strategy.main_pain_point}</div>}
              {strategy.main_objection && <div><b>Objection:</b> {strategy.main_objection}</div>}
            </div>
            {strategy.recommended_creative_direction ? (
              <div style={{ background: "#fff1f2", border: "1px solid #fecdd3", borderRadius: 8, padding: 10, marginTop: 10 }}>
                <b style={{ color: "#be123c" }}>Recommended direction:</b> {strategy.recommended_creative_direction}
              </div>
            ) : null}
          </C>
          <C>
            <SectionTitle>Next Steps</SectionTitle>
            {(d.next_steps || []).map((n, i) => (
              <div key={i} style={{ display: "flex", gap: 10, padding: "7px 0", borderBottom: i < (d.next_steps || []).length - 1 ? "1px solid #eef2f7" : "none" }}>
                <div style={{ width: 22, height: 22, borderRadius: 999, background: "#be123c", color: "#fff", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{i + 1}</div>
                <div>{n}</div>
              </div>
            ))}
          </C>
        </div>
      )}

      {step === 1 && (
        <div>
          {concepts.map((c, ci) => {
            const isOpen = !!open[ci];
            const prompts = c.image_prompts || [];
            return (
              <C key={ci}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, cursor: "pointer" }} onClick={() => setOpen((o) => ({ ...o, [ci]: !o[ci] }))}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>
                    {ci + 1}. {c.name}
                    {c.type ? <span style={{ color: "#64748b", fontWeight: 500, marginLeft: 8, fontSize: 12 }}>{c.type}</span> : null}
                  </div>
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    {c.awareness_stage ? <StagePill text={c.awareness_stage} /> : null}
                    <span style={{ color: "#94a3b8", fontSize: 12 }}>{isOpen ? "−" : "+"}</span>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "3px 16px", color: "#475569", marginBottom: 6 }}>
                  {c.primary_angle ? <div><b>Angle:</b> {c.primary_angle}</div> : null}
                  {c.secondary_angle ? <div><b>Secondary:</b> {c.secondary_angle}</div> : null}
                  {c.test_priority ? <div><b>Priority:</b> {c.test_priority}</div> : null}
                </div>
                {c.why_this_concept_fits ? <div style={{ color: "#475569", marginBottom: 4 }}>{c.why_this_concept_fits}</div> : null}
                {c.hook ? <div style={{ marginBottom: 2 }}><b>Hook:</b> <i>{c.hook}</i></div> : null}
                {c.headline ? <div style={{ marginBottom: 2 }}><b>Headline:</b> <span style={{ fontSize: 14, fontWeight: 700 }}>{c.headline}</span></div> : null}
                {c.supporting_copy ? <div style={{ marginBottom: 2 }}><b>Supporting copy:</b> {c.supporting_copy}</div> : null}
                {c.cta ? <div style={{ marginBottom: 2 }}><b>CTA:</b> {c.cta}</div> : null}
                {c.visual_idea ? <div style={{ marginBottom: 6 }}><b>Visual idea:</b> {c.visual_idea}</div> : null}

                {isOpen ? (
                  <div style={{ marginTop: 8, borderTop: "1px dashed #e2e8f0", paddingTop: 10 }}>
                    {prompts.map((p, pi) => (
                      <PromptBlock key={pi} label={`IMAGE PROMPT ${p.variation || String.fromCharCode(65 + pi)}` + (p.emotional_trigger ? ` — ${p.emotional_trigger}` : "")} value={p.prompt} color="#be123c" />
                    ))}
                    {c.variations?.length ? (
                      <div style={{ marginBottom: 8 }}>
                        <b style={{ color: "#475569" }}>Variations to test next:</b>
                        <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 4 }}>
                          {(c.variations || []).map((v, vi) => (
                            <div key={vi} style={{ background: "#faf5ff", border: "1px solid #ede9fe", borderRadius: 7, padding: "6px 10px", fontSize: 12 }}>
                              <b>Variation {v.variation || String.fromCharCode(66 + vi)}</b>
                              {v.emotional_trigger ? <span style={{ color: "#6d28d9" }}> — {v.emotional_trigger}</span> : null}
                              {v.change ? <div style={{ color: "#64748b" }}>{v.change}</div> : null}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}
                    {c.clean_image_prompt ? <PromptBlock label="CLEAN IMAGE PROMPT (empty text areas)" value={c.clean_image_prompt} color="#047857" /> : null}
                  </div>
                ) : (
                  <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>Click to show prompts ({prompts.length} variations)</div>
                )}
              </C>
            );
          })}
        </div>
      )}

      {step === 2 && (
        <div>
          <SectionTitle>Test Batch 1 — strongest 3-5 concepts</SectionTitle>
          {(d.creative_test_plan?.test_batch_1 || []).map((t, i) => (
            <C key={i} style={{ borderColor: "#fecdd3" }}>
              <div style={{ fontWeight: 700, color: "#be123c" }}>{t.concept || t}</div>
              {t.variations_count ? <div>Variations: {t.variations_count}</div> : null}
              {t.main_hypothesis ? <div><b>Hypothesis:</b> {t.main_hypothesis}</div> : null}
              {t.tested_variable ? <div><b>Tested:</b> {t.tested_variable}</div> : null}
            </C>
          ))}
          {!(d.creative_test_plan?.test_batch_1 || []).length ? <div style={{ color: "#64748b" }}>No batch 1 returned.</div> : null}

          <SectionTitle>Test Batch 2 — after Batch 1</SectionTitle>
          {(d.creative_test_plan?.test_batch_2 || []).map((t, i) => (
            <C key={i}>
              <div style={{ fontWeight: 600 }}>{t.concept || t}</div>
              {t.why_later ? <div style={{ color: "#64748b" }}>{t.why_later}</div> : null}
            </C>
          ))}

          <SectionTitle>Test Matrix</SectionTitle>
          {(d.test_matrix || []).map((m, i) => (
            <C key={i}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "3px 16px", color: "#475569" }}>
                {m.concept ? <div><b>Concept:</b> {m.concept}</div> : null}
                {m.angle ? <div><b>Angle:</b> {m.angle}</div> : null}
                {m.hook ? <div><b>Hook:</b> <i>{m.hook}</i></div> : null}
                {m.visual ? <div><b>Visual:</b> {m.visual}</div> : null}
              </div>
            </C>
          ))}
          {!(d.test_matrix || []).length ? <div style={{ color: "#64748b" }}>No matrix returned.</div> : null}

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
        <button onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0} style={{ background: "#ffffff", border: "1px solid #cbd5e1", color: "#334155", borderRadius: 7, padding: "7px 18px", fontSize: 13, fontWeight: 600, cursor: step === 0 ? "default" : "pointer", opacity: step === 0 ? 0.4 : 1 }}>Back</button>
        <button onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))} disabled={step === STEPS.length - 1} style={{ background: "#f43f5e", border: "none", color: "#fff", borderRadius: 7, padding: "7px 18px", fontSize: 13, fontWeight: 600, cursor: step === STEPS.length - 1 ? "default" : "pointer", opacity: step === STEPS.length - 1 ? 0.4 : 1 }}>Next →</button>
      </div>
    </div>
  );
}