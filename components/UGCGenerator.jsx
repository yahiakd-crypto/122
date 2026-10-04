import { useState } from "react";

const STEPS = ["Concepts", "Full Concept", "Ad Texts", "Test Plan"];
const TEAL = "#0d9488";
const INK = "#1e293b";
const MUTED = "#64748b";
const CARD = "#f8fafc";
const LINE = "#e2e8f0";

function Pill({ children, color = "#ccfbf1", text = "#115e59" }) {
  return (
    <span style={{ display: "inline-block", padding: "2px 10px", borderRadius: 999, fontSize: 12, fontWeight: 600, background: color, color: text, margin: "0 6px 6px 0" }}>
      {children}
    </span>
  );
}

function box(items, empty) {
  if (!Array.isArray(items) || items.length === 0) return <div style={{ color: MUTED, fontSize: 13 }}>{empty || "Aucune donnée."}</div>;
  return (
    <ul style={{ margin: "6px 0 0 0", paddingLeft: 18, color: MUTED, fontSize: 13, lineHeight: 1.8 }}>
      {items.map((it, i) => <li key={i}>{it}</li>)}
    </ul>
  );
}

async function copyText(t) {
  try { await navigator.clipboard.writeText(t); } catch (_) {}
}

function CopyBtn({ text }) {
  if (!text) return null;
  return (
    <button
      onClick={e => { e.stopPropagation(); copyText(text); }}
      style={{ flex: "0 0 auto", padding: "3px 10px", borderRadius: 8, border: "1px solid " + LINE, background: "#fff", color: TEAL, fontSize: 12, fontWeight: 600, cursor: "pointer" }}
    >
      Copy
    </button>
  );
}

function KV({ k, v }) {
  return (
    <div style={{ lineHeight: 1.85 }}>
      <b style={{ color: INK }}>{k}:</b> <span style={{ color: MUTED }}>{v || "—"}</span>
    </div>
  );
}

const AWARE_BG = {
  "UNAWARE": ["#fef3c7", "#92400e"],
  "PROBLEM AWARE": ["#fee2e2", "#991b1b"],
  "SOLUTION AWARE": ["#e0f2fe", "#075985"],
  "PRODUCT AWARE": ["#ede9fe", "#5b21b6"],
  "MOST AWARE": ["#dcfce7", "#166534"],
};

export default function UGCGenerator({ data, grounding }) {
  const [step, setStep] = useState(0);
  const [active, setActive] = useState(0);
  const [videoIdx, setVideoIdx] = useState(0);
  const d = data || {};
  const summary = d.summary || {};
  const concepts = Array.isArray(d.concepts) ? d.concepts : [];
  const matrix = Array.isArray(d.testing_matrix) ? d.testing_matrix : [];

  const showConcept = concepts.length > 0 ? concepts[Math.min(active, concepts.length - 1)] : null;
  const rawVideos = showConcept && (showConcept.videos || showConcept.video_versions || showConcept.versions || showConcept.vidéos);
  const videos = Array.isArray(rawVideos) ? rawVideos : (rawVideos && typeof rawVideos === "object" ? Object.values(rawVideos) : []);
  const vid = videos.length ? videos[Math.min(videoIdx, videos.length - 1)] : null;
  const vPrompt = (v) => (v && (v.ai_video_prompt || v.video_prompt || v.prompt || v.prompt_text)) || "";
  const cPrompt = (showConcept && (showConcept.ai_video_prompt || showConcept.video_prompt || showConcept.prompt)) || "";
  const hookOf = (c) => c.hook || (Array.isArray(c?.videos) && c.videos[0] ? c.videos[0].hook : "");

  const awBg = (s) => AWARE_BG[String(s || "").toUpperCase()] || ["#f1f5f9", INK];

  return (
    <div style={{ background: "#fff", color: INK, borderRadius: 16, padding: 18, fontFamily: "Segoe UI, system-ui, sans-serif" }}>
      <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 10, marginBottom: 16, borderBottom: "1px solid " + LINE }}>
        {STEPS.map((s, i) => (
          <button key={s} onClick={() => setStep(i)} style={{ flex: "0 0 auto", padding: "7px 14px", borderRadius: 999, border: "1px solid " + (i === step ? TEAL : LINE), background: i === step ? TEAL : "#fff", color: i === step ? "#fff" : MUTED, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            {i + 1}. {s}
          </button>
        ))}
      </div>

      {/* STEP 0 — Concepts overview */}
      {step === 0 && (
        <div>
          <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
            <b style={{ fontSize: 16 }}>{summary.product || "UGC Concepts"}</b>
            {summary.primary_awareness_stage && <Pill color={awBg(summary.primary_awareness_stage)[0]} text={awBg(summary.primary_awareness_stage)[1]}>{String(summary.primary_awareness_stage).replace(/_/g, " ")}</Pill>}
            <Pill color="#fce7f3" text="#9d174d">{summary.market || "—"}</Pill>
          </div>
          {(summary.angle || summary.recommended_direction) && (
            <div style={{ background: CARD, borderRadius: 14, padding: 12, marginBottom: 14, fontSize: 13, lineHeight: 1.7, color: MUTED }}>
              {summary.angle && <><b style={{ color: INK }}>Angle: </b>{summary.angle}<br /></>}
              {summary.recommended_direction && <><b style={{ color: INK }}>Direction: </b>{summary.recommended_direction}</>}
            </div>
          )}
          {concepts.length === 0 ? (
            <div style={{ background: "#fef2f2", borderRadius: 14, padding: 14, fontSize: 13, color: "#991b1b" }}>
              Aucun concept généré. {grounding && grounding !== "NONE" ? "Relance le skill." : "Connecte un groupe produit avec ses skills (Product Deep Dive...) puis relance."}
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 12 }}>
              {concepts.map((c, i) => {
                const ab = awBg(c.awareness_level);
                return (
                  <div key={i} onClick={() => { setActive(i); setStep(1); }} style={{ background: CARD, border: "1px solid " + LINE, borderRadius: 14, padding: 14, cursor: "pointer" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                      <span style={{ background: TEAL, color: "#fff", borderRadius: 999, width: 22, height: 22, flex: "0 0 auto", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>{i + 1}</span>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 700 }}>{c.concept_name || "Concept " + (i + 1)}</div>
                        <div style={{ fontSize: 12 }}>
                          <Pill>{(c.ugc_angle || "—").replace(/_/g, " ")}</Pill>
                          <Pill color={ab[0]} text={ab[1]}>{String(c.awareness_level || "—").replace(/_/g, " ")}</Pill>
                        </div>
                      </div>
                    </div>
                    {hookOf(c) && <div style={{ fontSize: 13, lineHeight: 1.6, color: INK, margin: "8px 0 4px" }}><b>Hook: </b>{hookOf(c)}</div>}
                    <div style={{ fontSize: 12, color: MUTED }}>{c.main_objection ? <><b style={{ color: "#92400e" }}>Objection: </b>{c.main_objection}</> : null}</div>
                  </div>
                );
              })}
            </div>
          )}
          {matrix.length > 0 && (
            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: TEAL, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>Creative Testing Matrix</div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ borderCollapse: "collapse", fontSize: 12, width: "100%" }}>
                  <thead>
                    <tr style={{ color: MUTED, textAlign: "left" }}>
                      {["Concept", "Hook", "Angle", "Awareness", "Emotion", "Objection", "Visual Style"].map(h => (
                        <th key={h} style={{ padding: "8px 10px", borderBottom: "2px solid " + LINE, whiteSpace: "nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {matrix.map((r, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid " + LINE }}>
                        <td style={{ padding: "8px 10px", fontWeight: 700, whiteSpace: "nowrap" }}>{r.concept || "—"}</td>
                        <td style={{ padding: "8px 10px" }}>{r.hook || "—"}</td>
                        <td style={{ padding: "8px 10px" }}>{r.angle || "—"}</td>
                        <td style={{ padding: "8px 10px" }}>{r.awareness || "—"}</td>
                        <td style={{ padding: "8px 10px" }}>{r.main_emotion || "—"}</td>
                        <td style={{ padding: "8px 10px" }}>{r.objection || "—"}</td>
                        <td style={{ padding: "8px 10px" }}>{r.visual_style || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* STEP 1 — Full concept */}
      {step === 1 && (
        <div>
          {concepts.length > 0 && (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
              {concepts.map((c, i) => (
                <button key={i} onClick={() => { setActive(i); setVideoIdx(0); }} style={{ padding: "6px 12px", borderRadius: 999, border: "1px solid " + (i === active ? TEAL : LINE), background: i === active ? TEAL : "#fff", color: i === active ? "#fff" : MUTED, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                  #{i + 1} {c.concept_name || ""}
                </button>
              ))}
            </div>
          )}
          {!showConcept ? (
            <div style={{ color: MUTED, fontSize: 13 }}>Aucun concept.</div>
          ) : (
            <div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
                <b style={{ fontSize: 17 }}>{showConcept.concept_name || "Concept"}</b>
                <Pill>{(showConcept.ugc_angle || "—").replace(/_/g, " ")}</Pill>
                <Pill color={awBg(showConcept.awareness_level)[0]} text={awBg(showConcept.awareness_level)[1]}>{String(showConcept.awareness_level || "—").replace(/_/g, " ")}</Pill>
                <Pill color="#fce7f3" text="#9d174d">Emotion: {(showConcept.emotional_trigger || "—").replace(/_/g, " ")}</Pill>
                {videos.length > 0 && <Pill color="#dcfce7" text="#166534">{videos.length} videos · 10s each</Pill>}
              </div>
              {(videos.length > 0 || cPrompt) && (
                <div style={{ background: "#f0fdfa", borderRadius: 14, padding: 14, marginBottom: 12, border: "1px solid #99f6e4" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#0f766e", marginBottom: 8 }}>AI Video Prompts (9:16 · 10s) — copy & paste in your video tool</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 8 }}>
                    {videos.length > 0 ? (
                      videos.map((v, i) => (
                        <div key={i} style={{ background: "#fff", borderRadius: 10, padding: 10, border: "1px solid #ccfbf1" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                            <b style={{ fontSize: 12, color: "#0f766e" }}>{v.version || "Video " + (i + 1)}</b>
                            <span style={{ marginLeft: "auto" }}><CopyBtn text={vPrompt(v)} /></span>
                          </div>
                          {v.hook && <div style={{ fontSize: 12, color: "#475569", marginBottom: 4 }}><b>Hook: </b>{v.hook}</div>}
                          {vPrompt(v) && <div style={{ fontSize: 12, color: "#0f766e", lineHeight: 1.6 }}>{vPrompt(v).slice(0, 280)}{vPrompt(v).length > 280 ? "…" : ""}</div>}
                          <button
                            onClick={() => setVideoIdx(i)}
                            style={{ marginTop: 6, padding: "3px 10px", borderRadius: 8, border: "1px solid " + LINE, background: "#fff", color: TEAL, fontSize: 11, fontWeight: 600, cursor: "pointer" }}
                          >
                            Open video detail ↓
                          </button>
                        </div>
                      ))
                    ) : (
                      <div style={{ background: "#fff", borderRadius: 10, padding: 10, border: "1px solid #ccfbf1" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <b style={{ fontSize: 12, color: "#0f766e" }}>Full prompt</b>
                          <span style={{ marginLeft: "auto" }}><CopyBtn text={cPrompt} /></span>
                        </div>
                        <div style={{ fontSize: 12, color: "#0f766e", lineHeight: 1.6 }}>{cPrompt.slice(0, 280)}{cPrompt.length > 280 ? "…" : ""}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 12 }}>
                <div style={{ background: CARD, borderRadius: 14, padding: 14, border: "1px solid " + LINE }}>
                  <KV k="Target audience" v={showConcept.target_audience} />
                  <KV k="Customer problem" v={showConcept.customer_problem} />
                  <KV k="Customer desire" v={showConcept.customer_desire} />
                  <KV k="Objection" v={showConcept.main_objection} />
                  <KV k="Location" v={showConcept.location} />
                  <KV k="Key benefit" v={showConcept.key_benefit} />
                </div>
                <div style={{ background: CARD, borderRadius: 14, padding: 14, border: "1px solid " + LINE }}>
                  <KV k="Hook" v={showConcept.hook || videos[0]?.hook} />
                  <KV k="Story" v={showConcept.story} />
                  <KV k="Demonstration" v={showConcept.product_demonstration} />
                </div>
                {showConcept.creator_profile && (
                  <div style={{ background: CARD, borderRadius: 14, padding: 14, border: "1px solid " + LINE }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: TEAL, marginBottom: 4 }}>Creator profile</div>
                    {typeof showConcept.creator_profile === "string" ? (
                      <div style={{ color: MUTED, fontSize: 13, lineHeight: 1.7 }}>{showConcept.creator_profile}</div>
                    ) : (
                      Object.entries(showConcept.creator_profile).map(([k, v]) => <KV key={k} k={k.replace(/_/g, " ")} v={v} />)
                    )}
                  </div>
                )}
              </div>
              {videos.length > 0 ? (
                <div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", margin: "14px 0 10px", alignItems: "center" }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: TEAL }}>Videos (each ~10s)</span>
                    {videos.map((v, i) => (
                      <button key={i} onClick={() => setVideoIdx(i)} style={{ padding: "6px 12px", borderRadius: 999, border: "1px solid " + (i === videoIdx ? TEAL : LINE), background: i === videoIdx ? TEAL : "#fff", color: i === videoIdx ? "#fff" : MUTED, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                        {v.version || "Video " + (i + 1)}{v.duration ? " · " + v.duration : ""}
                      </button>
                    ))}
                  </div>
                  {vid && (
                    <div>
                      {vid.hook && (
                        <div style={{ background: CARD, borderRadius: 14, padding: 14, marginBottom: 10, border: "1px solid " + LINE }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: TEAL, marginBottom: 4 }}>Hook</div>
                          <div style={{ fontSize: 13.5, color: INK, lineHeight: 1.7 }}>{vid.hook}</div>
                        </div>
                      )}
                      {vid.script && (
                        <div style={{ background: CARD, borderRadius: 14, padding: 14, marginBottom: 10, border: "1px solid " + LINE }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: TEAL, marginBottom: 4 }}>Script (10s)</div>
                          <div style={{ fontSize: 13.5, lineHeight: 1.8, color: INK, whiteSpace: "pre-wrap", fontStyle: "italic" }}>{vid.script}</div>
                        </div>
                      )}
                      {(vid.shot_list?.length > 0) && (
                        <div style={{ marginBottom: 10 }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: TEAL, marginBottom: 6 }}>Shot list</div>
                          <div style={{ overflowX: "auto" }}>
                            <table style={{ borderCollapse: "collapse", fontSize: 12, width: "100%" }}>
                              <thead>
                                <tr style={{ color: MUTED, textAlign: "left" }}>
                                  {["Scene", "Visual", "Camera", "Action", "Dialogue", "On-screen", "Product"].map(h => (
                                    <th key={h} style={{ padding: "8px 10px", borderBottom: "2px solid " + LINE, whiteSpace: "nowrap" }}>{h}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {vid.shot_list.map((r, i) => (
                                  <tr key={i} style={{ borderBottom: "1px solid " + LINE, verticalAlign: "top" }}>
                                    <td style={{ padding: "8px 10px", fontWeight: 700, whiteSpace: "nowrap" }}>{r.scene || i + 1}</td>
                                    <td style={{ padding: "8px 10px", maxWidth: 260 }}>{r.visual || "—"}</td>
                                    <td style={{ padding: "8px 10px" }}>{r.camera_angle || "—"}</td>
                                    <td style={{ padding: "8px 10px", maxWidth: 220 }}>{r.action || r.creator_action || "—"}</td>
                                    <td style={{ padding: "8px 10px", maxWidth: 240 }}>{r.dialogue || "—"}</td>
                                    <td style={{ padding: "8px 10px" }}>{r.on_screen_text || "—"}</td>
                                    <td style={{ padding: "8px 10px" }}>{r.product_visibility || "—"}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                      {vPrompt(vid) && (
                        <div style={{ background: "#fff", borderRadius: 14, padding: 14, border: "1px solid " + LINE }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                            <span style={{ fontSize: 12, fontWeight: 700, color: TEAL }}>AI Video Generation Prompt (9:16 · 10s)</span>
                            <CopyBtn text={vPrompt(vid)} />
                          </div>
                          <div style={{ fontSize: 13, color: INK, lineHeight: 1.75, whiteSpace: "pre-wrap" }}>{vPrompt(vid)}</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <LegacyVideoConcept c={showConcept} />
              )}
            </div>
          )}
        </div>
      )}

      {/* STEP 2 — Ad texts */}
      {step === 2 && (
        <div>
          {concepts.length > 0 && (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
              {concepts.map((c, i) => (
                <button key={i} onClick={() => { setActive(i); setVideoIdx(0); }} style={{ padding: "6px 12px", borderRadius: 999, border: "1px solid " + (i === active ? TEAL : LINE), background: i === active ? TEAL : "#fff", color: i === active ? "#fff" : MUTED, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                  #{i + 1} {c.concept_name || ""}
                </button>
              ))}
            </div>
          )}
          {!showConcept ? (
            <div style={{ color: MUTED, fontSize: 13 }}>Aucun concept.</div>
          ) : (
            <div>
              {videos.length > 0 && (
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12, alignItems: "center" }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: TEAL }}>Videos</span>
                  {videos.map((v, i) => (
                    <button key={i} onClick={() => setVideoIdx(i)} style={{ padding: "6px 12px", borderRadius: 999, border: "1px solid " + (i === videoIdx ? TEAL : LINE), background: i === videoIdx ? TEAL : "#fff", color: i === videoIdx ? "#fff" : MUTED, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                      {v.version || "Video " + (i + 1)}
                    </button>
                  ))}
                </div>
              )}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 12 }}>
                {[["Caption", vid?.caption || showConcept.caption], ["Primary text (Meta)", vid?.primary_text || showConcept.primary_text], ["Headline", vid?.headline || showConcept.headline], ["Recommended CTA", vid?.recommended_cta || showConcept.recommended_cta]].map(([label, txt]) => (
                  <div key={label} style={{ background: CARD, borderRadius: 14, padding: 14, border: "1px solid " + LINE }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: TEAL }}>{label}</span>
                      <CopyBtn text={txt} />
                    </div>
                    <div style={{ fontSize: 13, color: INK, lineHeight: 1.7 }}>{txt}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* STEP 3 — Test plan */}
      {step === 3 && (
        <div>
          {[["Hook variables", d.hook_variables], ["Creative variables", d.creative_variables], ["Message variables", d.message_variables], ["Offer variables", d.offer_variables]].map(([label, arr]) => (
            <div key={label} style={{ background: CARD, borderRadius: 14, padding: 14, marginBottom: 10, border: "1px solid " + LINE }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: TEAL, marginBottom: 4 }}>{label}</div>
              {box(arr)}
            </div>
          ))}
          {d.performance_learnings && d.performance_learnings.length > 0 && (
            <div style={{ background: "#ecfeff", borderRadius: 14, padding: 14, marginBottom: 10, border: "1px solid #a5f3fc" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#155e75", marginBottom: 4 }}>Performance learnings</div>
              {box(d.performance_learnings)}
            </div>
          )}
          {d.next_steps && d.next_steps.length > 0 && (
            <div style={{ background: CARD, borderRadius: 14, padding: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: TEAL, marginBottom: 4 }}>Next steps</div>
              {box(d.next_steps)}
            </div>
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
    padding: "8px 18px", borderRadius: 10, border: "1px solid " + (primary ? TEAL : LINE),
    background: primary ? TEAL : "#fff", color: primary ? "#fff" : MUTED,
    fontSize: 13, fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1,
  };
}

function LegacyVideoConcept({ c }) {
  if (!c) return null;
  return (
    <div>
      {c.script && (
        <div style={{ background: CARD, borderRadius: 14, padding: 14, marginTop: 12, border: "1px solid " + LINE }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: TEAL, marginBottom: 4 }}>Script</div>
          <div style={{ fontSize: 13.5, lineHeight: 1.8, color: INK, whiteSpace: "pre-wrap", fontStyle: "italic" }}>{c.script}</div>
        </div>
      )}
      {(c.shot_list?.length > 0) && (
        <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: TEAL, marginBottom: 6 }}>Shot list</div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ borderCollapse: "collapse", fontSize: 12, width: "100%" }}>
              <thead>
                <tr style={{ color: MUTED, textAlign: "left" }}>
                  {["Scene", "Visual", "Camera", "Action", "Dialogue", "On-screen", "Product"].map(h => (
                    <th key={h} style={{ padding: "8px 10px", borderBottom: "2px solid " + LINE, whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {c.shot_list.map((r, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid " + LINE, verticalAlign: "top" }}>
                    <td style={{ padding: "8px 10px", fontWeight: 700, whiteSpace: "nowrap" }}>{r.scene || i + 1}</td>
                    <td style={{ padding: "8px 10px", maxWidth: 260 }}>{r.visual || "—"}</td>
                    <td style={{ padding: "8px 10px" }}>{r.camera_angle || "—"}</td>
                    <td style={{ padding: "8px 10px", maxWidth: 220 }}>{r.creator_action || r.action || "—"}</td>
                    <td style={{ padding: "8px 10px", maxWidth: 240 }}>{r.dialogue || "—"}</td>
                    <td style={{ padding: "8px 10px" }}>{r.on_screen_text || "—"}</td>
                    <td style={{ padding: "8px 10px" }}>{r.product_visibility || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {c.ai_video_prompt && (
        <div style={{ background: "#fff", borderRadius: 14, padding: 14, marginTop: 12, border: "1px solid " + LINE }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: TEAL }}>AI Video Generation Prompt (9:16)</span>
            <CopyBtn text={c.ai_video_prompt} />
          </div>
          <div style={{ fontSize: 13, color: INK, lineHeight: 1.75, whiteSpace: "pre-wrap" }}>{c.ai_video_prompt}</div>
        </div>
      )}
      {!c.script && !(c.shot_list?.length > 0) && !c.ai_video_prompt && (
        <div style={{ background: CARD, borderRadius: 14, padding: 14, marginTop: 12, border: "1px solid " + LINE, fontSize: 12, color: MUTED }}>
          Aucune vidéo ni prompt dans ce concept (format de données encore inconnu).
        </div>
      )}
    </div>
  );
}