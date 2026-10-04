"use client";
import React, { useState, useEffect, useMemo, useCallback, useRef, useDeferredValue } from "react";
import * as LucideIcons from "lucide-react";

/* ════════════════════════════════════════════════════════════════
   LandingPageBuilder — AI Product → CRO Strategy → Landing Page.
   Split view: LEFT = editable sections + parameters (like Problem,
   Hero, FAQ…) · RIGHT = live mobile preview (scrollable) where you
   can CLICK any text element to edit it in place.
   Includes: live generation progress, CRO score, auto-optimization
   patches, per-section regenerate/reorder/hide, one-click export.
   ════════════════════════════════════════════════════════════════ */

const LP_ICONS = {
  running: "Loader2", done: "CheckCircle", error: "XCircle", pending: "Circle",
};
const LP_COLORS = { running: "#3b82f6", done: "#10b981", error: "#ef4444", pending: "#94a3b8" };

const STAT_NAMES = {
  valueProposition: "Value Prop", hero: "Hero", productClarity: "Product Clarity",
  visualHierarchy: "Visual Hierarchy", benefits: "Benefits", trust: "Trust",
  socialProof: "Social Proof", offer: "Offer", cta: "CTA", pricing: "Pricing",
  objectionHandling: "Objection Handling", mobileUx: "Mobile UX",
};
const PRIORITY_COLOR = { CRITICAL: "#ef4444", HIGH: "#f97316", MEDIUM: "#eab308", LOW: "#64748b" };

const DynIcon = ({ name, size = 16, color = "currentColor" }) => {
  const IconComponent = LucideIcons[name] || LucideIcons.Circle;
  return <IconComponent size={size} color={color} strokeWidth={2.2} />;
};

function friendlyLabel(field) {
  const last = String(field || "").split(".").pop() || field;
  return last.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/[_-]+/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

// Parse a section HTML fragment → list of editable fields (data-lp-f).
function extractFields(html) {
  let fields = [];
  if (!html || typeof document === "undefined") return fields;
  const div = document.createElement("div");
  div.innerHTML = html;
  div.querySelectorAll("[data-lp-f]").forEach(el => {
    const field = el.getAttribute("data-lp-f");
    if (field && !fields.some(o => o.field === field)) {
      fields.push({ field, tag: el.tagName.toLowerCase(), label: friendlyLabel(field), text: (el.textContent || "").replace(/\s+/g, " ").trim() });
    }
  });
  return fields;
}

// Build the full <html> document that goes into the preview iframe.
function buildSrcDoc(sections, edits) {
  if (typeof document === "undefined") {
    return `<!DOCTYPE html><html><body>${(sections || []).map(s => s.html || "").join("\n")}</body></html>`;
  }
  const container = document.createElement("div");
  container.innerHTML = sections.map(s => s.html || "").join("\n");
  container.querySelectorAll("[data-lp-f]").forEach(el => {
    const field = el.getAttribute("data-lp-f");
    if (edits[field] != null) el.textContent = edits[field];
  });

  const body = container.innerHTML || "<div style='font-family:system-ui;padding:24px;text-align:center;color:#94a3b8'>Waiting for the first section…</div>";

  const script = [
    "(function(){",
    "var lpEl=null;",
    "function fieldOf(t){while(t&&t!==document.body&&!t.getAttribute)t=t.parentNode;if(t&&t.getAttribute)t=t.getAttribute('data-lp-f');return t;}",
    "document.addEventListener('click',function(e){",
    "  var t=e.target;while(t&&t!==document.body&&!t.getAttribute)t=t.parentNode;",
    "  var f=t&&t.getAttribute?t.getAttribute('data-lp-f'):null;",
    "  if(!f){window.parent.postMessage({$lp:true,type:'deselect'},'*');return;}",
    "  e.preventDefault();",
    "  window.parent.postMessage({$lp:true,type:'select',field:f},'*');",
    "  t.setAttribute('contenteditable','true');t.focus();lpEl=t;",
    "  try{var sel=window.getSelection();sel.selectAllChildren(t);}catch(err){}",
    "},true);",
    "document.addEventListener('input',function(e){",
    "  var t=e.target;",
    "  if(t&&t.getAttribute&&t.getAttribute('contenteditable')==='true'&&t.getAttribute('data-lp-f')){",
    "    window.parent.postMessage({$lp:true,type:'edit',field:t.getAttribute('data-lp-f'),value:t.innerText},'*');",
    "  }",
    "},true);",
    "document.addEventListener('keydown',function(e){",
    "  if(e.key==='Escape'&&lpEl){lpEl.removeAttribute('contenteditable');lpEl=null;window.parent.postMessage({$lp:true,type:'deselect'},'*');}",
    "},true);",
    "document.addEventListener('click',function(e){var t=e.target;if(t&&lpEl&&t!==lpEl){lpEl.removeAttribute('contenteditable');lpEl=null;}},false);",
    "})();"
  ].join("\n");

  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<style>
  html,body{margin:0;padding:0;background:#ffffff;font-family:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;}
  *[data-lp-f]{outline:1px dashed transparent;outline-offset:1px;transition:outline-color .12s;}
  *[data-lp-f]:hover{outline-color:rgba(59,130,246,.85);outline-width:2px;}
  *[data-lp-f][contenteditable="true"]{outline-color:#2563eb;outline-width:3px;background:rgba(219,234,254,.45);border-radius:3px;}
</style></head>
<body>${body}
<script>${script}</script>
</body></html>`;
}

function downloadHtml(html, name) {
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = name || "landing-page.html";
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

const DEVICE_W = { mobile: 390, tablet: 768, desktop: "100%" };

export default function LandingPageBuilder({ data, running, onRegenerateSection }) {
  const [edits, setEdits] = useState({});
  const [hidden, setHidden] = useState({});
  const [order, setOrder] = useState(null);
  const [device, setDevice] = useState("mobile");
  const [selectedField, setSelectedField] = useState(null);
  const [showCode, setShowCode] = useState(false);
  const [copyMsg, setCopyMsg] = useState("");
  const [expanded, setExpanded] = useState({});

  const progress = (data && data.progress) || [];
  const strategy = (data && data.strategy) || {};
  const allSections = (data && data.sections) || [];
  const audit = (data && data.audit) || null;
  const patches = (data && data.patches) || [];
  const isRunning = !!running;

  // Seed order from sections (fall back to strategy orderIndex).
  useEffect(() => {
    if (!order && allSections.length) {
      const mapped = allSections.map((s, i) => ({ key: s.key, name: s.name || s.key, idx: i }));
      mapped.sort((a, b) => {
        const sa = allSections[a.idx], sb = allSections[b.idx];
        const oa = (sa && sa.orderIndex != null) ? sa.orderIndex : a.idx;
        const ob = (sb && sb.orderIndex != null) ? sb.orderIndex : b.idx;
        return oa - ob;
      });
      setOrder(mapped.map(m => m.key));
    }
  }, [allSections, order]);

  // Optimization patches → applied as pre-filled edits once.
  const patchesApplied = useRef(false);
  useEffect(() => {
    if (patches && patches.length && !patchesApplied.current) {
      const map = {};
      patches.forEach(p => { if (p && p.field && p.newText != null) map[p.field] = p.newText; });
      setEdits(prev => ({ ...map, ...prev }));
      patchesApplied.current = true;
    }
  }, [patches]);

  // Live in-iframe click/edit messages.
  useEffect(() => {
    const handler = (e) => {
      const d = e.data;
      if (!d || !(d.$lp === true)) return;
      if (d.type === "select") setSelectedField(d.field);
      else if (d.type === "edit") { setEdits(prev => ({ ...prev, [d.field]: d.value })); }
      else if (d.type === "deselect") setSelectedField(null);
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  // Auto-scroll + expand the section panel of the selected field.
  useEffect(() => {
    if (!selectedField) return;
    const key = String(selectedField).split(".")[0];
    setExpanded(prev => ({ ...prev, [key]: true }));
    setTimeout(() => {
      const el = document.getElementById("lp-sec-" + key);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 120);
  }, [selectedField]);

  const keyOrder = useMemo(() => order || allSections.map(s => s.key), [order, allSections]);
  const orderedSections = useMemo(() => {
    const map = {};
    allSections.forEach(s => { map[s.key] = s; });
    return keyOrder.map(k => map[k]).filter(Boolean);
  }, [keyOrder, allSections]);

  const visibleDone = orderedSections.filter(s => s.html && s.status === "done" && !hidden[s.key]);
  const deferredEdits = useDeferredValue(edits);
  const srcDoc = useMemo(() => buildSrcDoc(visibleDone, deferredEdits), [visibleDone, deferredEdits]);

  const onMove = useCallback((key, dir) => {
    setOrder(prev => {
      const cur = prev || allSections.map(s => s.key);
      const i = cur.indexOf(key);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= cur.length) return prev || cur;
      const next = cur.slice();
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }, [allSections]);

  const onHide = (key) => setHidden(prev => ({ ...prev, [key]: !prev[key] }));
  const onField = (field, value) => setEdits(prev => ({ ...prev, [field]: value }));

  const exportHtml = () => downloadHtml(srcDoc, "landing-page.html");
  const copyHtml = async () => {
    try { await navigator.clipboard.writeText(srcDoc); setCopyMsg("Copied!"); setTimeout(() => setCopyMsg(""), 1600); }
    catch { setCopyMsg("Copy failed"); }
  };

  const runningCount = orderedSections.filter(s => s.status === "running").length;
  const doneCount = orderedSections.filter(s => s.status === "done").length;
  const totalScore = audit ? audit.totalScore : null;

  return (
    <div style={{ minWidth: 0, overflowWrap: "anywhere" }}>
      {/* ── Header: status + actions ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#eef6ff", border: "1px solid #bfdbfe", borderRadius: 12, padding: "10px 14px", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <DynIcon name="MonitorSmartphone" size={20} color="#2563eb" />
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#1e3a8a" }}>AI Landing Page Builder</div>
            <div style={{ fontSize: 11, color: "#1d4ed8", fontWeight: 600 }}>
              {isRunning
                ? (strategy ? `Building… ${doneCount}/${orderedSections.length} sections done` : "Analyzing product → strategy…")
                : `${doneCount} sections · CRO ${totalScore != null ? Math.round(totalScore) + "/100" : "—"} · click any text in the preview to edit it`}
            </div>
          </div>
        </div>

        <div style={{ flex: 1 }} />

        {/* Device toggle */}
        <div style={{ display: "flex", gap: 4, background: "#fff", border: "1px solid #dbeafe", borderRadius: 8, padding: 3 }}>
          {[["mobile", "Smartphone", "390"], ["tablet", "Tablet", "768"], ["desktop", "Monitor", "Full"]].map(([key, icon, label]) => (
            <button key={key} onClick={() => setDevice(key)} title={label + " px"}
              style={{ display: "flex", alignItems: "center", gap: 5, border: "none", borderRadius: 6, background: device === key ? "#2563eb" : "transparent", color: device === key ? "#fff" : "#64748b", padding: "5px 9px", fontSize: 10.5, fontWeight: 700, cursor: "pointer" }}>
              <DynIcon name={icon} size={13} color={device === key ? "#fff" : "#64748b"} /> {label}
            </button>
          ))}
        </div>

        <button onClick={() => setShowCode(v => !v)} style={{ display: "flex", alignItems: "center", gap: 6, border: "1px solid #bfdbfe", background: "#fff", color: "#2563eb", borderRadius: 8, padding: "6px 11px", fontSize: 11, fontWeight: 800, cursor: "pointer" }}>
          <DynIcon name="Code2" size={13} color="#2563eb" /> {showCode ? "Hide Code" : "View Code"}
        </button>
        <button onClick={copyHtml} style={{ display: "flex", alignItems: "center", gap: 6, border: "1px solid #bfdbfe", background: "#fff", color: "#2563eb", borderRadius: 8, padding: "6px 11px", fontSize: 11, fontWeight: 800, cursor: "pointer" }}>
          <DynIcon name="Copy" size={13} color="#2563eb" /> {copyMsg || "Copy Code"}
        </button>
        <button onClick={exportHtml} disabled={visibleDone.length === 0} style={{ display: "flex", alignItems: "center", gap: 6, border: "none", background: "#15803d", color: "#fff", borderRadius: 8, padding: "7px 13px", fontSize: 11, fontWeight: 800, cursor: visibleDone.length ? "pointer" : "not-allowed", opacity: visibleDone.length ? 1 : .5 }}>
          <DynIcon name="Download" size={13} color="#fff" /> EXPORT HTML
        </button>
      </div>

      {/* ── Split: LEFT sections | RIGHT live preview ── */}
      <div style={{ display: "flex", gap: 12, marginTop: 12, alignItems: "stretch" }}>
        {/* LEFT */}
        <div style={{ width: "36%", minWidth: 260, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "9px 12px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0", fontSize: 11, fontWeight: 800, color: "#2563eb", textTransform: "uppercase", letterSpacing: .7, display: "flex", alignItems: "center", gap: 6 }}>
            <DynIcon name="PanelsLeftBottom" size={13} color="#2563eb" /> SECTIONS — EDIT PARAMETERS
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: 10, display: "flex", flexDirection: "column", gap: 8, maxHeight: 640 }}>
            {/* Strategy summary */}
            {strategy && ((strategy.brandIdentity && strategy.brandIdentity.brandName) || strategy.conversion || strategy.sections) && (
              <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "8px 10px" }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: "#15803d", textTransform: "uppercase", letterSpacing: .7, marginBottom: 4 }}>Part 1 — Discovery Locked</div>
                {strategy.brandIdentity && strategy.brandIdentity.brandName ? (
                  <div style={{ fontSize: 11.5, color: "#166534", fontWeight: 700 }}>Brand: {strategy.brandIdentity.brandName}</div>
                ) : null}
                {(strategy.design && (strategy.design.primaryColor || strategy.design.accentColor)) ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                    <span style={{ fontSize: 10, color: "#166534", fontWeight: 600 }}>Palette:</span>
                    {["primaryColor", "secondaryColor", "accentColor", "backgroundColor"].map(k => strategy.design[k] ? (
                      <span key={k} title={k + " " + strategy.design[k]} style={{ width: 14, height: 14, borderRadius: 4, background: strategy.design[k], border: "1px solid rgba(0,0,0,.15)" }} />
                    ) : null)}
                    {strategy.design.fontHeadline ? <span style={{ fontSize: 9.5, color: "#166534" }}>· {strategy.design.fontHeadline}</span> : null}
                  </div>
                ) : null}
                {strategy.conversion && strategy.conversion.primaryCta ? (
                  <div style={{ fontSize: 10.5, color: "#166534", marginTop: 3 }}>CTA: <b>{strategy.conversion.primaryCta.label}</b> · Price: <b>{(strategy.pricingOffer && (strategy.pricingOffer.discountPrice || strategy.pricingOffer.regularPrice)) || "—"}</b></div>
                ) : null}
                {Array.isArray(strategy.gaps) && strategy.gaps.length > 0 && (
                  <div style={{ marginTop: 5, paddingTop: 5, borderTop: "1px dashed #bbf7d0", fontSize: 9.5, color: "#b45309" }}>
                    <span style={{ fontWeight: 800 }}>TO CONFIRM ({strategy.gaps.length}):</span> {strategy.gaps.map(g => g.field).join(" · ")}
                    <div style={{ fontSize: 9, color: "#92400e", marginTop: 2 }}>Open the live preview, edit any of these, or re-run with more product details.</div>
                  </div>
                )}
              </div>
            )}

            {orderedSections.length === 0 && (
              <div style={{ fontSize: 11, color: "#94a3b8", padding: "10px 4px" }}>Waiting for Part 1 discovery… the fixed 12 sections (announcement bar → sticky nav → hero → … → footer) will appear here live.</div>
            )}

            {orderedSections.map((sec, si) => {
              const key = sec.key;
              const isOpen = !!expanded[key] || selectedField?.startsWith(key + ".");
              const fields = sec.status === "done" && sec.html ? extractFields(sec.html) : [];
              const stColor = LP_COLORS[sec.status] || "#94a3b8";
              const hiddenThis = !!hidden[key];
              return (
                <div key={key} id={"lp-sec-" + key} style={{ border: selectedField?.startsWith(key + ".") ? "1.5px solid #2563eb" : "1px solid #e2e8f0", borderRadius: 8, overflow: "hidden", background: "#fff", opacity: hiddenThis ? .55 : 1 }}>
                  <div style={{ padding: "7px 9px", background: "#f8fafc", display: "flex", alignItems: "center", gap: 6 }}>
                    {sec.status === "running" ? (
                      <DynIcon name="Loader2" size={12} color={stColor} />
                    ) : sec.status === "done" ? (
                      <DynIcon name="CheckCircle" size={12} color={stColor} />
                    ) : sec.status === "error" ? (
                      <DynIcon name="XCircle" size={12} color={stColor} />
                    ) : (
                      <DynIcon name="Circle" size={12} color={stColor} />
                    )}
                    <span style={{ flex: 1, fontSize: 11.5, fontWeight: 800, color: "#1e293b" }}>{sec.name || key}</span>
                    <span style={{ fontSize: 9.5, color: "#94a3b8", fontFamily: "monospace" }}>{sec.orderIndex != null ? `#${sec.orderIndex + 1}` : `#${si + 1}`}</span>
                    <button onClick={() => onMove(key, -1)} title="Move up" style={miniBtn}><DynIcon name="ChevronUp" size={12} /></button>
                    <button onClick={() => onMove(key, 1)} title="Move down" style={miniBtn}><DynIcon name="ChevronDown" size={12} /></button>
                    <button onClick={() => onHide(key)} title={hiddenThis ? "Show" : "Hide"} style={miniBtn}><DynIcon name={hiddenThis ? "EyeOff" : "Eye"} size={12} /></button>
                    <button onClick={() => onRegenerateSection && onRegenerateSection(key)} title="Regenerate section" style={miniBtn}><DynIcon name="RefreshCw" size={12} /></button>
                    <button onClick={() => setExpanded(prev => ({ ...prev, [key]: !prev[key] }))} style={miniBtn}><DynIcon name="ChevronsUpDown" size={12} /></button>
                  </div>

                  {isOpen && fields.length > 0 && (
                    <div style={{ padding: "8px 10px", display: "flex", flexDirection: "column", gap: 6, borderTop: "1px solid #eef2f7" }}>
                      {fields.map((f) => (
                        <div key={f.field} style={{ position: "relative" }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 3 }}>
                            <label style={{ fontSize: 9.5, fontWeight: 800, color: selectedField === f.field ? "#2563eb" : "#64748b", textTransform: "uppercase", letterSpacing: .5 }}>{f.label}</label>
                            {selectedField === f.field && <span style={{ fontSize: 9, color: "#2563eb", fontWeight: 700 }}>● editing</span>}
                          </div>
                          {f.tag === "button" || (f.text && f.text.length < 40) ? (
                            <input
                              value={edits[f.field] != null ? edits[f.field] : f.text}
                              onChange={e => onField(f.field, e.target.value)}
                              onFocus={() => setSelectedField(f.field)}
                              style={{ width: "100%", boxSizing: "border-box", border: selectedField === f.field ? "1.5px solid #2563eb" : "1px solid #e2e8f0", borderRadius: 6, padding: "5px 8px", fontSize: 11.5, color: "#0f172a", background: selectedField === f.field ? "#eff6ff" : "#fff", outline: "none" }}
                            />
                          ) : (
                            <textarea
                              value={edits[f.field] != null ? edits[f.field] : f.text}
                              onChange={e => onField(f.field, e.target.value)}
                              onFocus={() => setSelectedField(f.field)}
                              rows={2}
                              style={{ width: "100%", boxSizing: "border-box", resize: "vertical", border: selectedField === f.field ? "1.5px solid #2563eb" : "1px solid #e2e8f0", borderRadius: 6, padding: "5px 8px", fontSize: 11.5, color: "#0f172a", background: selectedField === f.field ? "#eff6ff" : "#fff", outline: "none", fontFamily: "inherit" }}
                            />
                          )}
                        </div>
                      ))}
                      {sec.error && <div style={{ fontSize: 10, color: "#b91c1c" }}>Error: {sec.error}</div>}
                    </div>
                  )}
                  {isOpen && fields.length === 0 && sec.status === "done" && (
                    <div style={{ padding: "8px 10px", fontSize: 10.5, color: "#94a3b8", borderTop: "1px solid #eef2f7" }}>No editable fields found yet — regenerate to retry.</div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Audit */}
          {audit && (
            <div style={{ borderTop: "1px solid #e2e8f0", padding: "9px 12px", background: "#f8fafc", maxHeight: 150, overflowY: "auto" }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: "#b45309", textTransform: "uppercase", letterSpacing: .7, marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
                <DynIcon name="Gauge" size={13} color="#b45309" /> CRO AUDIT — {Math.round(totalScore)}/100
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 6 }}>
                {Object.keys(STAT_NAMES).map(k => audit.scores && audit.scores[k] != null ? (
                  <span key={k} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 5, padding: "2px 6px", fontSize: 9.5, color: "#334155" }}>{STAT_NAMES[k]}: <b>{Math.round(audit.scores[k])}</b></span>
                ) : null)}
              </div>
              {(audit.problems || []).slice(0, 5).map((p, i) => (
                <div key={i} style={{ fontSize: 10.5, color: "#475569", lineHeight: 1.5, marginBottom: 4, borderLeft: "3px solid " + (PRIORITY_COLOR[p.priority] || "#64748b"), paddingLeft: 7 }}>
                  <b>[{p.priority}]</b> {p.problem} — <i>{p.recommendedFix}</i>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT — live preview */}
        <div style={{ flex: 1, minWidth: 0, background: "#0f172a", border: "1px solid #0f172a", borderRadius: 12, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "8px 12px", background: "#1e293b", display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ display: "flex", gap: 4 }}>
              <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#f87171" }} />
              <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#fbbf24" }} />
              <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#34d399" }} />
            </div>
            <span style={{ flex: 1, fontSize: 10, color: "#94a3b8", fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
              <DynIcon name="MousePointerClick" size={11} color="#60a5fa" /> LIVE PREVIEW — {DEVICE_W[device] === "100%" ? "Desktop" : DEVICE_W[device] + "px"} · click any text to edit
            </span>
            <span style={{ fontSize: 9.5, color: "#64748b", fontWeight: 700 }}>{visibleDone.length}/{orderedSections.length} sections</span>
          </div>
          <div style={{ flex: 1, overflow: "hidden", display: "flex", justifyContent: "center", padding: 10, background: "repeating-linear-gradient(45deg,#111827,#111827 8px,#0f172a 8px,#0f172a 16px)" }}>
            <div style={{ width: DEVICE_W[device], maxWidth: "100%", borderRadius: device === "mobile" ? 14 : 10, overflow: "hidden", boxShadow: "0 8px 30px rgba(0,0,0,.45)", border: device === "mobile" ? "4px solid #334155" : "3px solid #1e293b" }}>
              {srcDoc ? (
                <iframe title="Landing page live preview" srcDoc={srcDoc} style={{ width: "100%", height: 640, border: "none", display: "block", background: "#fff" }} />
              ) : (
                <div style={{ height: 640, display: "flex", alignItems: "center", justifyContent: "center", background: "#fff", color: "#94a3b8", fontSize: 12 }}>Generating…</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Live progress log */}
      {progress.length > 0 && (
        <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 5, maxHeight: 130, overflowY: "auto", background: "#1e293b", borderRadius: 10, padding: 10 }}>
          <div style={{ fontSize: 9.5, fontWeight: 800, color: "#60a5fa", textTransform: "uppercase", letterSpacing: .7 }}>LIVE GENERATION LOG</div>
          {progress.map((p, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#cbd5e1", borderLeft: "3px solid " + (LP_COLORS[p.state] || "#94a3b8"), paddingLeft: 8 }}>
              <DynIcon name={LP_ICONS[p.state] || "Circle"} size={11} color={LP_COLORS[p.state] || "#94a3b8"} />
              <span>{p.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Code view */}
      {showCode && (
        <div style={{ marginTop: 10, background: "#0b1120", border: "1px solid #1e293b", borderRadius: 10, padding: 12, position: "relative" }}>
          <div style={{ fontSize: 9.5, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: .7, marginBottom: 8 }}>PAGE CODE ({srcDoc.length.toLocaleString()} chars)</div>
          <pre style={{ margin: 0, color: "#a5b4fc", fontFamily: "monospace", fontSize: 10.5, whiteSpace: "pre-wrap", wordBreak: "break-word", maxHeight: 300, overflowY: "auto", direction: "ltr", textAlign: "left" }}>{srcDoc}</pre>
        </div>
      )}
    </div>
  );
}

const miniBtn = { border: "none", background: "transparent", color: "#64748b", cursor: "pointer", padding: 2, display: "flex", alignItems: "center", borderRadius: 4 };