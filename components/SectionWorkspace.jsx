"use client";
import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useShell } from "./ProjectShell";
import { useApp } from "./AppContext";
import { api } from "@/lib/client/api";
import { Icon } from "./icons";
import Modal from "./Modal";
import {
  CompetitorsView, ColorsView, LogosView, PersonasView, KeywordsView, OffersView,
  LandingView, ImagePromptsView, CopywritingView, SocialProofView, FaqView, PopupsView,
  ReferencesView, AdCreativesView, AdImagesView, RichText, JsonFallback,
} from "./renderers";
import { SECTIONS, LANGUAGE_OPTIONS } from "@/lib/client/constants";

const DESCRIPTIONS = {
  1: "Deep research on the product: problem, benefits, motivations, market, pricing and opportunity.",
  2: "Ten real competitors analyzed across branding, landing pages, offers and CTAs.",
  3: "Three complete conversion-ready color systems with psychology behind every hex.",
  4: "Three designer-ready logo directions, including text-to-image prompts.",
  5: "Three full buyer personas covering psychology, objections and triggers.",
  6: "700 pre-written, conversion-ready keywords across 7 psychological categories.",
  7: "Fifteen promotional offers plus the single best offer for this product.",
  8: "Three complete landing-page blueprints (A, B, C) — 7 sections each.",
  9: "Production-ready image prompts for every landing-page section.",
  10: "140 copy blocks: headlines, subheads, CTAs, trust, urgency, guarantees, benefits.",
  11: "Fifteen testimonial concepts to inspire your social proof.",
  12: "Twenty FAQs engineered to remove buying objections.",
  13: "Four conversion popups: welcome, exit-intent, discount and cart recovery.",
  14: "The complete developer-ready design system for your landing page.",
  15: "Ten proven brands to study strategically — each with a CRO lesson.",
  16: "Ten paid-social creative concepts across every proven ad format.",
  17: "Ten static ad concepts with production-ready image prompts.",
};

const LOADING_STAGES = {
  1: ["Reading product profile", "Analyzing market", "Mapping benefits & motivations", "Building recommendation"],
  2: ["Scanning competitor landscape", "Researching landing pages", "Comparing offer strategies", "Compiling competitor report"],
  3: ["Analyzing brand psychology", "Testing color harmonies", "Selecting palettes", "Building color systems"],
  4: ["Analyzing brand identity", "Studying competitor logos", "Drafting directions", "Writing generation prompts"],
  5: ["Analyzing audience segments", "Building psychology profiles", "Mapping objections", "Writing personas"],
  6: ["Mapping conversion psychology", "Generating emotional keywords", "Filtering by category", "Counting keywords"],
  7: ["Analyzing price psychology", "Designing offer mechanics", "Stress-testing angles", "Selecting best offer"],
  8: ["Planning conversion flows", "Architecting sections", "Distributing trust elements", "Writing blueprints"],
  9: ["Reviewing page structure", "Describing scenes", "Writing image prompts", "Applying image safety rules"],
  10: ["Analyzing buyer psychology", "Writing headlines", "Crafting CTA variants", "Polishing messaging"],
  11: ["Analyzing testimonial psychology", "Writing review concepts", "Covering objections", "Finalizing social proof"],
  12: ["Collecting buyer objections", "Drafting questions", "Writing answers", "Finalizing FAQ"],
  13: ["Analyzing popup psychology", "Designing offers", "Writing copy", "Finalizing popups"],
  14: ["Reading brand colors", "Defining typography", "Writing design tokens", "Composing design guide"],
  15: ["Scanning reference brands", "Analyzing CRO patterns", "Extracting lessons", "Compiling references"],
  16: ["Analyzing platform formats", "Designing hooks", "Writing storyboards", "Finalizing creatives"],
  17: ["Analyzing ad psychology", "Designing compositions", "Writing image prompts", "Applying image safety rules"],
};

export default function SectionWorkspace({ num }) {
  const router = useRouter();
  const { toast } = useApp();
  const { product, sections, aiConfig, settings, reloadSections, updateSettings } = useShell();
  const section = sections[num] || {};
  const meta = SECTIONS.find((s) => s.num === num);

  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState("");
  const [running, setRunning] = useState(false);
  const [stage, setStage] = useState(0);
  const [custom, setCustom] = useState("");
  const [regenOpen, setRegenOpen] = useState(false);
  const [skipOpen, setSkipOpen] = useState(false);
  const [showRaw, setShowRaw] = useState(false);
  const [modelOverride, setModelOverride] = useState("");
  const [needsProduct, setNeedsProduct] = useState(false);
  const stageTimer = useRef(null);

  useEffect(() => {
    setCustom(section.customInstructions || "");
    setEditing(false);
    setShowRaw(false);
    setNeedsProduct(false);
    // Auto-run support for "Auto Run Next Section"
    const flag = `autopilot:${projectId}:${num}`;
    if (sessionStorage.getItem(flag)) {
      sessionStorage.removeItem(flag);
      setTimeout(() => run("run"), 250);
    }
  }, [num]);

  useEffect(() => () => clearInterval(stageTimer.current), []);

  const availableModels = useMemo(() => {
    const set = new Set();
    if (aiConfig?.models) { Object.values(aiConfig.models).forEach((m) => m && set.add(m)); }
    if (aiConfig?.model) set.add(aiConfig.model);
    return [...set].filter(Boolean);
  }, [aiConfig]);

  const currentModel = modelOverride || aiConfig?.models?.[`${num}`] || aiConfig?.models?.same || aiConfig?.model || "";

  const run = useCallback(
    async (mode, regenPayload) => {
      setRunning(true);
      setStage(0);
      setEditing(false);
      const stages = LOADING_STAGES[num] || ["Generating…"];
      let i = 0;
      stageTimer.current = setInterval(() => {
        i = (i + 1) % stages.length;
        setStage(i);
      }, 4500);
      try {
        const payload = {
          customInstructions: custom.trim() || undefined,
          liveWebResearch: settings.liveWebResearch,
        };
        if (mode === "regenerate") payload.regenerate = regenPayload;
        const res = await api.post(`/api/projects/${projectId}/sections/${num}/run`, payload);
        clearInterval(stageTimer.current);
        await reloadSections();
        if (res.validation?.score >= 60) toast(`Section generated · Quality ${res.validation.score}/100`);
        else toast("Output does not meet the minimum requirements. Review and regenerate.", "warn");
      } catch (e) {
        clearInterval(stageTimer.current);
        await reloadSections();
        if (e.code === "needs_product") setNeedsProduct(true);
        else toast(e.detail ? `${e.message} — ${e.detail}` : e.message, "error");
      } finally {
        setRunning(false);
      }
    },
    [num, custom, settings.liveWebResearch, reloadSections, toast]
  );

  const { projectId } = useShellData();
  return (
    <div>
      <div className="content-wrap">
        {/* ── Missing product warning ── */}
        {(!product?.name || needsProduct) && (
          <div className="card" style={{ marginBottom: 16, borderColor: "var(--error)", background: "var(--error-soft)" }}>
            <div className="row wrap" style={{ gap: 12, alignItems: "center" }}>
              <span className="badge badge-error"><Icon.Warn /></span>
              <div className="grow" style={{ minWidth: 240 }}>
                <strong>Product info is missing for this project.</strong>
                <div className="small muted">Run the first step on the Product Setup page before the AI can analyse anything here.</div>
              </div>
              <button className="btn btn-primary" onClick={() => router.push(`/projects/${projectId}/product`)}>Set up product now →</button>
            </div>
          </div>
        )}
        {/* ── Header ── */}
        <div className="row-between wrap" style={{ marginBottom: 18 }}>
          <div style={{ minWidth: 0 }}>
            <div className="row" style={{ gap: 8, marginBottom: 4 }}>
              <span className="badge badge-primary" style={{ fontSize: 12.5 }}>SECTION {String(num).padStart(2, "0")}</span>
              <StatusBadge status={section.status} />
            </div>
            <h1 style={{ margin: 0 }}>{meta.title}</h1>
            <p className="muted small" style={{ maxWidth: 640 }}>{DESCRIPTIONS[num]}</p>
          </div>
        </div>

        {/* ── Mini info: dependencies + requirements ── */}
        <div className="row wrap" style={{ marginBottom: 16 }}>
          <span className="chip">Depends on: {depsLabel(num)}</span>
          <span className="chip" title="Minimum content lines validated on every run">Min ~{metaLines(num)} lines</span>
          <button className={`chip ${settings.liveWebResearch ? "on" : ""}`} onClick={() => updateSettings({ liveWebResearch: !settings.liveWebResearch })}>
            <Icon.Globe /> LIVE WEB RESEARCH {settings.liveWebResearch ? "ON" : "OFF"}
          </button>
          <select className="select" style={{ width: "auto", padding: "4px 26px 4px 10px", fontSize: 12.5 }} value={settings.language} onChange={(e) => { updateSettings({ language: e.target.value }); toast("Language updated."); }} aria-label="Output language">
            {LANGUAGE_OPTIONS.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
          </select>
        </div>

        {/* ── Action bar ── */}
        <div className="card" style={{ marginBottom: 18, padding: 16 }}>
          <div className="row wrap" style={{ marginBottom: 12 }}>
            <div className="row">
              <div className="small muted" style={{ fontWeight: 700, marginRight: 6 }}>AI Model</div>
              <select className="select" style={{ width: "auto", padding: "5px 28px 5px 10px", fontSize: 12.5 }} value={modelOverride} onChange={(e) => setModelOverride(e.target.value)} aria-label="Model override for this section">
                <option value="">{currentModel || "Use AI parameters"}</option>
                {availableModels.filter((m) => m !== currentModel).map((m) => <option key={m} value={m}>{m}</option>)}
                <option value="__reset">Reset to default</option>
              </select>
            </div>
            <div className="grow" />
            {section.cost && (
              <div className="small muted" style={{ fontSize: 12 }}>
                <Icon.Clock /> {(section.cost.elapsedMs / 1000).toFixed(1)}s · ${section.cost.usd.toFixed(4)}
              </div>
            )}
          </div>

          <div className="action-bar">
            <button className="btn btn-primary" disabled={running} onClick={() => run("run")}>
              {running ? <span className="spin" /> : <Icon.Play />} {running ? `Generating… ${LOADING_STAGES[num][stage] || ""}` : "RUN AI ANALYSIS"}
            </button>
            <button className="btn" disabled={running || !section.result} onClick={() => setRegenOpen(true)}>
              <Icon.Refresh /> REGENERATE
            </button>
            <button className="btn" onClick={() => { setEditText(section.result || ""); setEditing(true); }} disabled={running || !section.result}>
              <Icon.Edit /> EDIT
            </button>
            <button className="btn" onClick={save} disabled={running || !(editing ? editText : section.result)}>
              <Icon.Save /> SAVE
            </button>
            <button className="btn" onClick={copyAll} disabled={!section.result}><Icon.Copy /> COPY</button>
            <button className="btn" onClick={downloadSection} disabled={!section.result}><Icon.Download /> DOWNLOAD</button>
            {section.rawResponse && (
              <button className="btn btn-ghost" onClick={() => setShowRaw(!showRaw)}><Icon.Braces /> {showRaw ? "HIDE RAW" : "VIEW RAW RESPONSE"}</button>
            )}
            {section.result && (
              <button className="btn btn-ghost" onClick={() => { setEditing(false); }}><Icon.Eye /> {editing ? "EXIT EDIT" : "VIEW RESULT"}</button>
            )}
          </div>

          <div className="field mt-16" style={{ marginBottom: 0 }}>
            <label className="lbl" htmlFor="custom">CUSTOM AI INSTRUCTIONS</label>
            <textarea id="custom" className="textarea" rows={2} placeholder='E.g. "Focus heavily on Algeria and French-speaking North Africa."' value={custom} onChange={(e) => setCustom(e.target.value)} />
            {custom.trim() && <button className="btn btn-sm mt-4" onClick={() => { setCustom(""); toast("Custom instructions cleared."); }}>Clear</button>}
          </div>
        </div>

        {/* ── Quality score ── */}
        {section.validation && <QualityPanel validation={section.validation} />}

        {/* ── Output ── */}
        {running && <LoadingStages stages={LOADING_STAGES[num] || []} active={stage} />}

        {!editing && section.result && !running && (
          <div className="card" style={{ marginBottom: 18 }}>
            <div className="row-between" style={{ marginBottom: 10 }}>
              <h3 style={{ margin: 0 }}>{meta.title} — Result</h3>
              {section.updatedAt > 0 && <span className="small muted">Saved {new Date(section.updatedAt).toLocaleString()}</span>}
            </div>
            {showRaw && section.rawResponse ? (
              <div className="raw-block">{section.rawResponse}</div>
            ) : (
              <SectionBody num={num} section={section} projectId={projectId} />
            )}
          </div>
        )}

        {editing && !running && (
          <div className="card" style={{ marginBottom: 18 }}>
            <div className="row-between" style={{ marginBottom: 10 }}>
              <h3 style={{ margin: 0 }}>Edit Section {num} — {meta.title}</h3>
              <div className="row">
                <button className="btn btn-sm" onClick={() => setEditing(false)}>Exit</button>
                <button className="btn btn-sm btn-primary" onClick={save}><Icon.Save /> SAVE EDITS</button>
              </div>
            </div>
            <textarea className="editor" value={editText} onChange={(e) => setEditText(e.target.value)} aria-label="Editable AI result" />
            <div className="row mt-8 small muted">Edit freely — your version is what gets used in the final report.</div>
          </div>
        )}

        {!section.result && !running && !editing && (
          <div className="card empty" style={{ marginBottom: 18 }}>
            <div className="empty-icon"><Icon.Sparkle /></div>
            <h3>This section is ready to run</h3>
            <p className="muted">{DESCRIPTIONS[num]}</p>
            <div className="row center" style={{ justifyContent: "center", marginTop: 12 }}>
              <button className="btn btn-primary btn-lg" onClick={() => run("run")}><Icon.Play /> RUN AI ANALYSIS</button>
              {product?.name ? null : (
                <button className="btn btn-lg" onClick={() => router.push(`/projects/${projectId}/product`)}>Add product info first</button>
              )}
            </div>
          </div>
        )}

        {/* ── Sources ── */}
        {section.sources?.length > 0 && (
          <div className="card" style={{ marginBottom: 18 }}>
            <h3 style={{ margin: 0, marginBottom: 8 }}>Sources ({section.sources.length})</h3>
            {section.sources.map((s, i) => (
              <div key={i} className="row-between small" style={{ padding: "6px 0", borderBottom: "1px dashed var(--border)" }}>
                <div><b>{s.name}</b> — {s.claim}</div>
                {s.url && s.url !== "not available" ? <a href={s.url} target="_blank" rel="noreferrer" style={{ fontSize: 12 }}>Open <Icon.Link /></a> : <span className="small muted">unverified</span>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Bottom nav ── */}
      <div className="nav-bottom mobile-offset no-print">
        <div className="row">
          <button className="btn" disabled={num <= 1} onClick={() => router.push(`/projects/${projectId}/sections/${num - 1}`)}><Icon.Prev /> PREVIOUS</button>
        </div>
        <div className="row">
          <button className="btn btn-ghost" onClick={() => setSkipOpen(true)}><Icon.X /> SKIP</button>
          <button className="btn" onClick={save}><Icon.Save /> SAVE</button>
          <button className={`btn ${num < 17 ? "btn-primary" : "btn-secondary"}`} onClick={goNext}><Icon.Next /> {num < 17 ? "NEXT SECTION" : "FINAL REPORT"} →</button>
        </div>
      </div>

      {/* ── Regenerate modal ── */}
      <Modal open={regenOpen} onClose={() => setRegenOpen(false)} title={`Regenerate Section ${num}`}>
        <div className="grid-2">
          {regenOptions.map((o) => (
            <button key={o.mode} className="card card-hover" style={{ textAlign: "left", padding: 14 }} onClick={() => { setRegenOpen(false); run("regenerate", { mode: o.mode, custom: "" }); }}>
              <div style={{ fontWeight: 750, fontSize: 13.5 }}>⟳ {o.label}</div>
              <div className="small muted" style={{ marginTop: 4 }}>{o.desc}</div>
            </button>
          ))}
        </div>
        <div className="field mt-16">
          <label className="lbl" htmlFor="regenCustom">Custom regenerator instruction</label>
          <textarea id="regenCustom" className="textarea" rows={2} defaultValue={custom} onBlur={(e) => { if (e.target.value.trim()) run("regenerate", { mode: "", custom: e.target.value.trim() }); setRegenOpen(false); }} placeholder='E.g. "Make this more focused on Algerian women aged 25–45."' />
        </div>
      </Modal>

      {/* ── Skip modal ── */}
      <Modal open={skipOpen} onClose={() => setSkipOpen(false)} title={`Skip Section ${num}?`}>
        <div className="badge badge-warn" style={{ marginBottom: 12 }}>This section may affect the quality of later recommendations.</div>
        <div className="grid-2">
          <button className="btn btn-block" onClick={async () => { await api.post(`/api/projects/${projectId}/sections/${num}`, { action: "skip" }); await reloadSections(); setSkipOpen(false); toast("Section skipped.", "warn"); }}>
            Skip once
          </button>
          <button className="btn btn-block" onClick={() => { setSkipOpen(false); router.push(`/projects/${projectId}/sections/${num + 1 <= 17 ? num + 1 : num}`); }}>
            Return later
          </button>
        </div>
      </Modal>
    </div>
  );

  async function save() {
    try {
      const content = editing ? editText : (section.result || "");
      if (!content.trim()) { toast("Nothing to save yet — run AI first.", "warn"); return; }
      await api.put(`/api/projects/${projectId}/sections/${num}`, { result: content, status: "completed" });
      await reloadSections();
      setEditing(false);
      toast("Section saved.");
    } catch (e) {
      toast(e.message, "error");
    }
  }

  async function copyAll() {
    await api.copy(section.result || "");
    toast("Copied full result.");
  }

  function downloadSection() {
    const blob = new Blob([section.result || ""], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `section-${String(num).padStart(2, "0")}-${meta.short.toLowerCase().replace(/\s+/g, "-")}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast("Downloaded section.");
  }

  async function goNext() {
    if (section.result) {
      try {
        await api.put(`/api/projects/${projectId}/sections/${num}`, { result: section.result, status: "completed" });
        await reloadSections();
      } catch {
        toast("Could not save this section — navigating anyway.", "warn");
      }
    }
    if (num < 17) {
      if (settings.autoRunNext) sessionStorage.setItem(`autopilot:${projectId}:${num + 1}`, "1");
      router.push(`/projects/${projectId}/sections/${num + 1}`);
    } else {
      router.push(`/projects/${projectId}/report`);
    }
  }
}

function useShellData() {
  const shell = useShell();
  return shell;
}

const regenOptions = [
  { mode: "everything", label: "Regenerate everything", desc: "Fresh full output, same structure" },
  { mode: "quality", label: "Improve quality", desc: "Sharper reasoning, less fluff" },
  { mode: "detailed", label: "Make more detailed", desc: "Expand every item in depth" },
  { mode: "persuasive", label: "Make more persuasive", desc: "Stronger psychological triggers" },
  { mode: "local", label: "Make more local", desc: "More culturally specific to your market" },
  { mode: "tone", label: "Change tone", desc: "Match premium positioning & audience" },
  { mode: "audience", label: "Change target audience", desc: "Re-focus on target audience data" },
];

function depsLabel(num) {
  const deps = { 2: "1", 3: "1, 2", 4: "1, 3", 5: "1, 2", 6: "1, 5", 7: "1, 3, 5", 8: "1, 3, 5, 7", 9: "8", 10: "1, 5, 6, 7, 8", 11: "5", 12: "5, 7", 13: "7, 10", 14: "1, 3, 8", 15: "2", 16: "5, 8", 17: "16" };
  return deps[num] || "—";
}

function metaLines(num) {
  const m = { 1: 50, 2: 150, 3: 60, 4: 60, 5: 120, 6: 200, 7: 120, 8: 210, 9: 175, 10: 140, 11: 60, 12: 70, 13: 60, 14: 80, 15: 100, 16: 150, 17: 120 };
  return m[num] || 60;
}

function StatusBadge({ status }) {
  if (status === "completed") return <span className="badge badge-success"><Icon.Check /> Completed</span>;
  if (status === "in_progress") return <span className="badge badge-warn"><span className="dot dot-warn" /> In Progress</span>;
  if (status === "skipped") return <span className="badge badge-muted">Skipped</span>;
  return <span className="badge badge-muted"><span className="dot dot-muted" /> Not Started</span>;
}

function QualityPanel({ validation }) {
  const { toast } = useApp();
  return (
    <div className="card" style={{ marginBottom: 18, borderColor: validation.score >= 60 ? "var(--success)" : "var(--warning)", background: "linear-gradient(180deg," + (validation.score >= 60 ? "var(--success-soft)" : "var(--warning-soft)") + ", var(--surface))" }}>
      <div className="row-between wrap">
        <div className="row">
          <div style={{ fontSize: 34, fontWeight: 900, letterSpacing: "-0.02em" }}>{validation.score}/100</div>
          <div>
            <div style={{ fontWeight: 800 }}>AI QUALITY SCORE</div>
            <div className="small muted">{validation.isValid ? "Meets minimum requirements" : "Below minimum — regenerate for better results"}</div>
          </div>
        </div>
        {validation.score < 60 && (
          <button className="btn" onClick={async () => { await api.copy(JSON.stringify(validation, null, 2)); toast("Validation copied."); }}>Inspect checks</button>
        )}
      </div>
      <div className="grid-2 mt-16" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))" }}>
        {validation.checks.map((c, i) => (
          <div key={i} className="scorerow">
            <span className={`badge ${c.pass ? "badge-success" : "badge-error"}`} style={{ minWidth: 26, justifyContent: "center" }}>{c.pass ? <Icon.Check /> : <Icon.X />}</span>
            <span style={{ fontWeight: 650, fontSize: 12.5 }}>{c.label}</span>
            <span className="grow" />
            {c.detail && <span className="small muted" style={{ fontSize: 11, textAlign: "right" }}>{c.detail}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

function LoadingStages({ stages, active }) {
  return (
    <div className="card" style={{ marginBottom: 18, textAlign: "center", padding: 40 }}>
      <div className="row" style={{ justifyContent: "center", marginBottom: 14 }}>
        <div className="pulse-dot" style={{ width: 14, height: 14 }} />
        <div className="spin spin-dark" style={{ width: 22, height: 22, marginLeft: 10 }} />
      </div>
      <div style={{ fontWeight: 800, fontSize: 15 }}>AI is working…</div>
      <div className="muted small" style={{ marginTop: 6 }}>{stages[active]}</div>
      <div className="progress-track" style={{ maxWidth: 420, margin: "18px auto 0" }}>
        <div className="progress-fill" style={{ width: `${Math.min(100, ((active + 1) / Math.max(stages.length, 1)) * 100)}%` }} />
      </div>
    </div>
  );
}

/* ── Body renderer by section type ── */
function SectionBody({ num, section, projectId }) {
  const parsed = section.parsed;
  if (section.format === "json" && parsed) {
    switch (num) {
      case 2: return <CompetitorsView data={parsed} projectId={projectId} sectionId={num} />;
      case 3: return <ColorsView data={parsed} projectId={projectId} sectionId={num} />;
      case 4: return <LogosView data={parsed} projectId={projectId} sectionId={num} />;
      case 5: return <PersonasView data={parsed} projectId={projectId} sectionId={num} />;
      case 6: return <KeywordsView data={parsed} projectId={projectId} sectionId={num} />;
      case 7: return <OffersView data={parsed} projectId={projectId} sectionId={num} />;
      case 8: return <LandingView data={parsed} projectId={projectId} sectionId={num} />;
      case 9: return <ImagePromptsView data={parsed} projectId={projectId} sectionId={num} />;
      case 10: return <CopywritingView data={parsed} projectId={projectId} sectionId={num} />;
      case 11: return <SocialProofView data={parsed} projectId={projectId} sectionId={num} />;
      case 12: return <FaqView data={parsed} />;
      case 13: return <PopupsView data={parsed} projectId={projectId} sectionId={num} />;
      case 15: return <ReferencesView data={parsed} projectId={projectId} sectionId={num} />;
      case 16: return <AdCreativesView data={parsed} projectId={projectId} sectionId={num} />;
      case 17: return <AdImagesView data={parsed} projectId={projectId} sectionId={num} />;
      default: return <JsonFallback data={parsed} />;
    }
  }
  if (section.format === "json" && !parsed) {
    return <div>
      <div className="badge badge-error" style={{ marginBottom: 12 }}>Could not parse structured JSON — showing raw text. Use RAW VIEW or regenerate.</div>
      <RichText text={section.result} />
    </div>;
  }
  return <RichText text={section.result} />;
}