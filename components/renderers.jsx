import { useState, useMemo } from "react";
import { api } from "@/lib/client/api";
import { Icon } from "./icons";
import { useApp } from "./AppContext";

/* ── Shared item actions: copy + favorite ────────────────────────── */
export function ItemActions({ projectId, sectionId, sectionTitle, label, content }) {
  const { toast } = useApp();
  const [fav, setFav] = useState(false);
  const copy = async () => {
    await api.copy(content);
    toast("Copied to clipboard.");
  };
  const addFav = async () => {
    try {
      await api.post(`/api/projects/${projectId}/favorites`, { sectionId, sectionTitle, label, content, type: "item" });
      setFav(true);
      toast("Favorited.");
    } catch (e) {
      toast(e.message, "error");
    }
  };
  return (
    <div className="row" style={{ gap: 6 }}>
      <button className="copy-btn" onClick={copy} aria-label="Copy" title="Copy"><Icon.Copy /></button>
      <button className={`fav-btn ${fav ? "on" : ""}`} onClick={addFav} aria-label="Favorite" title="Favorite">{fav ? <Icon.Heart /> : <Icon.HeartOutline />}</button>
    </div>
  );
}

export function Flag({ verified }) {
  return verified ? (
    <span className="flag flag-verified" title="Confirmed via available research">Verified research</span>
  ) : (
    <span className="flag flag-analysis" title="AI analysis / hypothesis">AI analysis / hypothesis</span>
  );
}

/* ── Text (markdown-lite) renderer ────────────────────────────────── */
function inlineMd(text) {
  const parts = [];
  const re = /(\*\*[^*]+\*\*)|(\*[^*]+\*)|(`[^`]+`)/g;
  let last = 0;
  let m;
  let key = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    if (m[1]) parts.push(<strong key={key++}>{m[1].slice(2, -2)}</strong>);
    else if (m[2]) parts.push(<em key={key++}>{m[2].slice(1, -1)}</em>);
    else parts.push(<code key={key++}>{m[3].slice(1, -1)}</code>);
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

export function RichText({ text }) {
  if (!text) return <p className="muted">No content yet.</p>;
  const lines = String(text).split("\n");
  const out = [];
  let list = [];
  let i = 0;
  const flush = (key) => {
    if (!list.length) return;
    out.push(<ul key={key}>{list}</ul>);
    list = [];
  };
  lines.forEach((raw, idx) => {
    const l = raw.trim();
    if (!l) { flush(idx); return; }
    if (/^-{3,}|^\*{3,}|^\s*[\u2500-]/u.test(l)) {
      flush(idx);
      out.push(<div key={idx} className="divider" style={{ margin: "8px 0" }} />);
      return;
    }
    if (l.match(/^#{1,4}\s/)) {
      flush(idx);
      const level = l.indexOf(" ");
      const t = l.slice(level + 1);
      const Tag = level <= 1 ? "h2" : "h3";
      out.push(<Tag key={idx}>{inlineMd(t)}</Tag>);
      return;
    }
    const bullet = l.match(/^[-*•]\s+(.*)/);
    if (bullet) {
      list.push(<li key={idx}>{inlineMd(bullet[1])}</li>);
      return;
    }
    const num = l.match(/^\d+[.)]\s+(.*)/);
    if (num) {
      flush(idx);
      out.push(<p key={idx}><span style={{ fontWeight: 700, color: "var(--muted)" }}>{num[0].trim()} </span>{inlineMd(num[1])}</p>);
      return;
    }
    const quote = l.match(/^>\s?(.*)/);
    if (quote) { flush(idx); out.push(<blockquote key={idx}>{inlineMd(quote[1])}</blockquote>); return; }

    flush(idx);
    out.push(<p key={idx}>{inlineMd(l)}</p>);
  });
  flush(i);
  return <div className="rich-text">{out}</div>;
}

export function RawToggle({ text, toggleRaw, raw }) {
  return raw === undefined || raw === null || raw === text ? null : (
    <button className="btn btn-sm btn-ghost" onClick={toggleRaw}>Toggle raw</button>
  );
}

/* ── Section 2 · Competitors ─────────────────────────────────────── */
function websitePreview(url) {
  if (!url || url === "not available") return null;
  const clean = url.replace(/^https?:\/\//i, "").split("/")[0];
  return `https://image.thum.io/get/width/600/crop/900/https://${clean}`;
}

export function CompetitorsView({ data, projectId, sectionId }) {
  const c = data?.competitors || [];
  if (!c.length) return <RichText text={data ? JSON.stringify(data, null, 2) : ""} />;
  return (
    <div className="grid-col-3">
      {c.map((x, i) => (
        <div key={i} className="card">
          <div className="row-between" style={{ marginBottom: 8 }}>
            <div className="row">
              <div className="avatar" style={{ width: 32, height: 32, fontSize: 13 }}>{x.company?.[0] || "?"}</div>
              <div>
                <div style={{ fontWeight: 750 }}>{x.company}</div>
                {x.website && x.website !== "not available" ? (
                  <a href={x.website} target="_blank" rel="noreferrer" className="small" style={{ fontSize: 11 }}>{x.website}</a>
                ) : <div className="small muted" style={{ fontSize: 11 }}>No verified site</div>}
              </div>
            </div>
            {x.isVerified === false && <Flag verified={false} />}
          </div>
          <div style={{ marginBottom: 10 }}>
            {x.website && x.website !== "not available" ? (
              <a href={x.website} target="_blank" rel="noreferrer" aria-label={`Preview of ${x.company}`}>
                <div className="site-preview" style={{ backgroundImage: `url("${websitePreview(x.website)}")` }}>
                  <span className="site-preview-open">Open site ↗</span>
                </div>
              </a>
            ) : (
              <div className="site-preview site-preview-empty">No website preview</div>
            )}
          </div>
          <div className="small" style={{ marginBottom: 6 }}>
            <div className="kv"><span className="k">Strengths</span><span>{join(x.strengths)}</span></div>
            <div className="kv"><span className="k">Weaknesses</span><span>{join(x.weaknesses)}</span></div>
            <div className="kv"><span className="k">Visual</span><span>{x.visualBranding}</span></div>
            <div className="kv"><span className="k">Landing style</span><span>{x.landingPageStyle}</span></div>
            <div className="kv"><span className="k">Offer</span><span>{x.offerStrategy}</span></div>
            <div className="kv"><span className="k">CTA strategy</span><span>{x.ctaStrategy}</span></div>
          </div>
          {x.colorPalette?.length > 0 && (
            <div className="row" style={{ marginBottom: 8 }}>{x.colorPalette.map((hex, h) => <div key={h} className="swatch" style={{ width: 44, height: 22, background: hex }}>{hex}</div>)}</div>
          )}
          <div className="row-between">
            <div className="small muted" style={{ fontSize: 11 }}>{x.typography}</div>
            <ItemActions projectId={projectId} sectionId={sectionId} sectionTitle="Top 10 Competitors" label={x.company} content={JSON.stringify(x, null, 2)} />
          </div>
        </div>
      ))}
    </div>
  );
}

function join(arr) {
  return Array.isArray(arr) ? arr.join(" · ") : arr || "—";
}

/* ── Section 3 · Brand Colors ────────────────────────────────────── */
export function ColorsView({ data, projectId, sectionId }) {
  const options = data?.options || [];
  if (!options.length) return <RichText text={data ? JSON.stringify(data, null, 2) : ""} />;
  return (
    <div className="grid-col-3">
      {options.map((o, i) => (
        <div key={i} className="card">
          <div className="row-between" style={{ marginBottom: 10 }}>
            <h3 style={{ margin: 0 }}>Option {i + 1} · {o.name}</h3>
            <ItemActions projectId={projectId} sectionId={sectionId} sectionTitle="Brand Colors" label={o.name} content={JSON.stringify(o, null, 2)} />
          </div>
          <div className="grid-2" style={{ gap: 6, marginBottom: 12 }}>
            {[["Primary", o.primary], ["Secondary", o.secondary], ["Accent", o.accent], ["Background", o.background], ["Text", o.text], ["Button", o.button]].map(([n, hex]) => (
              <div key={n}>
                <div className="swatch" style={{ background: hex }}>{hex}</div>
                <div className="small muted" style={{ fontSize: 10.5, marginTop: 2 }}>{n}</div>
              </div>
            ))}
          </div>
          <div className="small" style={{ marginBottom: 8 }}><b>Psychology:</b><RichText text={o.psychology} /></div>
          {o.competitivePositioning && <p className="small" style={{ marginBottom: 4 }}><b>Positioning:</b> {o.competitivePositioning}</p>}
          {o.usage && <div className="small muted">{o.usage}</div>}
        </div>
      ))}
    </div>
  );
}

/* ── Section 4 · Logo Research ───────────────────────────────────── */
export function LogosView({ data, projectId, sectionId }) {
  const logos = data?.logos || [];
  if (!logos.length) return <RichText text={data ? JSON.stringify(data, null, 2) : ""} />;
  return (
    <div className="grid-col-3">
      {logos.map((l, i) => (
        <div key={i} className="card">
          <div className="row-between" style={{ marginBottom: 8 }}>
            <h3 style={{ margin: 0 }}>{i + 1}. {l.name}</h3>
            <ItemActions projectId={projectId} sectionId={sectionId} sectionTitle="Logo Research" label={l.name} content={JSON.stringify(l, null, 2)} />
          </div>
          <div className="small" style={{ marginBottom: 8 }}>
            <div className="kv"><span className="k">Style</span><span>{l.style} {l.minimal ? `· minimal: ${l.minimal}` : ""} {l.luxury ? `· luxury: ${l.luxury}` : ""}</span></div>
            <div className="kv"><span className="k">Shape</span><span>{l.shape}</span></div>
            <div className="kv"><span className="k">Typography</span><span>{l.typography}</span></div>
            <div className="kv"><span className="k">Icon</span><span>{l.icon}</span></div>
            <div className="kv"><span className="k">Feeling</span><span>{l.brandFeeling}</span></div>
          </div>
          <div className="row" style={{ marginBottom: 10 }}>
            {(l.colors || []).map((hex, h) => <div key={h} className="swatch" style={{ width: 46, height: 28, background: hex }}>{hex}</div>)}
          </div>
          {l.aiLogoPrompt && (
            <details>
              <summary className="small muted" style={{ cursor: "pointer" }}>AI logo prompt</summary>
              <div className="raw-block mt-8" style={{ maxHeight: 260, fontSize: 11.5 }}>{l.aiLogoPrompt}</div>
            </details>
          )}
        </div>
      ))}
    </div>
  );
}

/* ── Section 5 · Buyer Personas ──────────────────────────────────── */
export function PersonasView({ data, projectId, sectionId }) {
  const personas = data?.personas || [];
  if (!personas.length) return <RichText text={data ? JSON.stringify(data, null, 2) : ""} />;
  return (
    <div className="grid-col-3">
      {personas.map((p, i) => (
        <div key={i} className="card">
          <div className="row-between" style={{ marginBottom: 12 }}>
            <div className="row" style={{ gap: 12 }}>
              <PersonaIcon icon={p.icon} gender={p.gender} />
              <div>
                <h3 style={{ margin: 0 }}>{p.name}</h3>
                <div className="small muted">{p.archetype || p.nickname} · {p.age} · {p.country}</div>
              </div>
            </div>
            <ItemActions projectId={projectId} sectionId={sectionId} sectionTitle="Buyer Personas" label={`${p.name} persona`} content={JSON.stringify(p, null, 2)} />
          </div>
          <div className="row wrap" style={{ marginBottom: 12 }}>
            {[p.gender, p.income, p.profession, p.familyStatus].filter(Boolean).map((t, k) => <span key={k} className="chip">{t}</span>)}
          </div>
          {p.demographics && <KvList label="Demographics" value={p.demographics} />}
          <KvList label="Lifestyle" value={p.lifestyle} />
          <KvList label="Goals" value={p.goals} />
          <KvList label="Dreams" value={p.dreams} />
          <KvList label="Pain points" value={p.painPoints} />
          <KvList label="Fears" value={p.fears} />
          <KvList label="Frustrations" value={p.frustrations} />
          <KvList label="Objections" value={p.objections} />
          <KvList label="Buying motivation" value={p.buyingMotivation} />
          <KvList label="Shopping habits" value={p.shoppingHabits} />
          <KvList label="Social media" value={p.socialMedia} />
          <KvList label="Buying trigger" value={p.buyingTrigger} />
          <KvList label="Decision factors" value={p.decisionFactors} />
          <KvList label="Expected results" value={p.expectedResults} />
          <KvList label="Words they use" value={p.wordsTheyUse} />
          <KvList label="Tone they respond to" value={p.toneTheyRespondTo} />
          {p.quote && <Blockquote text={p.quote} />}
          <PersonaFlow flow={p.flow} />
        </div>
      ))}
    </div>
  );
}

function PersonaIcon({ icon, gender }) {
  const g = (gender || "").toLowerCase();
  const isFemale = g.includes("f") || g.includes("woman") || g.includes("أنثى") || g.includes("امرأة") || g.includes("أنثى");
  const isMale = !isFemale && (g.includes("m") || g.includes("man") || g.includes("ذكر") || g.includes("رجل"));
  const color = isFemale ? "var(--accent)" : isMale ? "var(--secondary)" : "var(--primary)";
  return (
    <div className="persona-icon" style={{ color, background: isFemale ? "var(--accent-soft)" : isMale ? "var(--secondary-soft)" : "var(--primary-soft)" }}>
      {icon && icon !== "🧑" && icon !== "👤" ? (
        <span style={{ fontSize: 22 }}>{icon}</span>
      ) : isFemale ? (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="12" cy="5" r="3.2" /><path d="M12 9a5 5 0 0 0-5 5v4a1 1 0 0 0 1 1h2v4a1 1 0 0 0 2 0v-4h1v4a1 1 0 0 0 2 0v-4h2a1 1 0 0 0 1-1v-4a5 5 0 0 0-5-5z" /></svg>
      ) : (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="12" cy="5" r="3.2" /><path d="M12 9a5 5 0 0 0-5 5v4a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-4a5 5 0 0 0-5-5z" /><path d="M8.5 16.5 7 18h10l-1.5 4-1.5-1.5 1-2h-6z" /></svg>
      )}
    </div>
  );
}

function PersonaFlow({ flow }) {
  if (!Array.isArray(flow) || flow.length === 0) return null;
  return (
    <div className="persona-flow">
      {flow.map((f, i) => (
        <div key={i} className="persona-flow-step">
          <div className="persona-flow-stage">{f.stage}</div>
          {f.detail && <div className="persona-flow-detail">{f.detail}</div>}
          {i < flow.length - 1 && <div className="persona-flow-arrow">→</div>}
        </div>
      ))}
    </div>
  );
}

function Blockquote({ text }) {
  return (
    <div style={{ background: "var(--surface-2)", borderLeft: "3px solid var(--accent)", padding: "9px 12px", borderRadius: "0 8px 8px 0", fontStyle: "italic", fontSize: 13, marginTop: 10 }}>
      "{text}"
    </div>
  );
}

function KvList({ label, value }) {
  if (value === undefined || value === null || value === "") return null;
  const v = Array.isArray(value) ? value.join(" · ") : value;
  return <div className="small" style={{ marginBottom: 6 }}><b style={{ color: "var(--muted)", fontWeight: 650 }}>{label}: </b>{v}</div>;
}

/* ── Section 6 · Keywords ────────────────────────────────────────── */
const KEYWORD_CATS = [
  { key: "emotional", label: "Emotional" },
  { key: "urgency", label: "Urgency" },
  { key: "trust", label: "Trust" },
  { key: "social", label: "Social Proof" },
  { key: "curiosity", label: "Curiosity" },
  { key: "value", label: "Value / Price" },
  { key: "identity", label: "Identity / Belonging" },
];

function normKeywords(arr) {
  return (arr || []).map((k) => (typeof k === "string" ? { keyword: k, score: 50 } : k)).filter((k) => k && k.keyword);
}

function chipStyle(score) {
  const s = Number(score) || 50;
  if (s <= 40) {
    return {
      background: "linear-gradient(145deg, #fafbfc, #e5e7eb)",
      color: "#5b6270",
      border: "1px solid #d1d5db",
      boxShadow: "0 2px 4px rgba(0,0,0,0.08)",
    };
  }
  if (s <= 70) {
    const t = (s - 41) / 29;
    return {
      background: `linear-gradient(145deg, hsl(42 96% ${88 - t * 18}%), hsl(28 95% ${72 - t * 12}%))`,
      color: "#92400E",
      border: "1px solid #f0c074",
      boxShadow: "0 2px 5px rgba(217,119,6,0.22)",
    };
  }
  const t = Math.min(1, Math.max(0, (s - 71) / 29));
  const light = `hsl(150, 74%, ${80 - t * 22}%)`;
  const dark = `hsl(157, 74%, ${52 - t * 18}%)`;
  return {
    background: `linear-gradient(145deg, ${light}, ${dark})`,
    color: t > 0.55 ? "#fff" : "#0d4a2e",
    border: "1px solid transparent",
    boxShadow: `0 2px 6px rgba(16,185,129,${0.18 + t * 0.25})`,
  };
}

export function KeywordsView({ data, projectId, sectionId }) {
  const { toast } = useApp();
  const raw = data?.categories || {};
  const cats = {};
  KEYWORD_CATS.forEach(({ key, label }) => {
    const items = normKeywords(raw[key] || raw[label] || raw[key.toLowerCase()] || []);
    cats[key] = { label, items: [...items].sort((a, b) => (b.score || 0) - (a.score || 0)) };
  });
  const total = Object.values(cats).reduce((s, c) => s + c.items.length, 0);
  const [open, setOpen] = useState({}); // per-category open state
  const [copied, setCopied] = useState(""); // chip id that was just copied
  const [q, setQ] = useState("");

  const copyChip = async (key, k) => {
    await api.copy(k.keyword);
    const id = `${key}:${k.keyword}`;
    setCopied(id);
    setTimeout(() => setCopied(""), 1100);
    toast(`Copied "${k.keyword}"`);
  };

  const copyAllCat = async (key, c) => {
    await api.copy(c.items.map((k) => k.keyword).join("\n"));
    toast(`Copied ${c.label} (${c.items.length})`);
  };

  const filter = (k) => k.keyword.toLowerCase().includes(q.toLowerCase());

  return (
    <div>
      <div className="card" style={{ marginBottom: 14 }}>
        <div className="row-between wrap" style={{ marginBottom: 12 }}>
          <div className="row">
            <span className={`badge badge-success`}>{total} / 700 keywords</span>
            <span className="small muted">{total < 700 ? "AI returned fewer — regenerating usually fills the rest" : "Complete set"}</span>
          </div>
          <div style={{ position: "relative", width: 260 }}>
            <span style={{ position: "absolute", left: 10, top: 9, color: "var(--muted-2)" }}><Icon.Search /></span>
            <input className="input" style={{ paddingLeft: 32 }} placeholder="Filter keywords…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
        </div>
        <div className="kw-legend" style={{ display: "flex", gap: 18, flexWrap: "wrap", fontSize: 12, color: "var(--muted)" }}>
          <span className="row" style={{ gap: 6 }}><span className="kw-legend-chip" style={{ background: "#E5E7EB" }} /> Low (0-40)</span>
          <span className="row" style={{ gap: 6 }}><span className="kw-legend-chip" style={{ background: "linear-gradient(135deg,#FEF3C7,#FDBA74)" }} /> Medium (41-70)</span>
          <span className="row" style={{ gap: 6 }}><span className="kw-legend-chip" style={{ background: "linear-gradient(135deg,#A7F3D0,#10B981)" }} /> High (71-100)</span>
        </div>
      </div>

      {KEYWORD_CATS.map(({ key, label }) => {
        const c = cats[key];
        const shown = q ? c.items.filter(filter) : c.items;
        const isOpen = open[key];
        return (
          <div className="card" key={key} style={{ marginBottom: 14, padding: 0, overflow: "hidden" }}>
            <div className="row-between" style={{ padding: "13px 18px", cursor: "pointer", userSelect: "none" }} onClick={() => setOpen((o) => ({ ...o, [key]: !o[key] }))}>
              <div className="row" style={{ gap: 10 }}>
                <span style={{ display: "inline-flex", transition: "transform 0.15s", transform: isOpen ? "rotate(90deg)" : "none", color: "var(--muted)" }}><Icon.Chevron /></span>
                <b style={{ fontSize: 14 }}>{label}</b>
                <span className="badge badge-muted">{c.items.length}</span>
              </div>
              <button className="btn btn-sm" onClick={(e) => { e.stopPropagation(); copyAllCat(key, c); }}><Icon.Copy /> Copy</button>
            </div>
            {isOpen && (
              <div style={{ padding: "0 18px 16px", borderTop: "1px solid var(--border)" }}>
                <div className="kw-chips">
                  {shown.map((k) => {
                    const st = chipStyle(k.score);
                    const id = `${key}:${k.keyword}`;
                    const isCopied = copied === id;
                    return (
                      <button
                        key={id}
                        className="kw-chip"
                        style={{ ...st, ...(isCopied ? { border: "2px solid var(--success)" } : {}) }}
                        title={`${k.score}/100 effectiveness`}
                        onClick={() => copyChip(key, k)}
                      >
                        {isCopied ? <Icon.Check /> : null} {k.keyword}
                      </button>
                    );
                  })}
                  {shown.length === 0 && <div className="small muted" style={{ padding: "12px 0" }}>No keywords match your filter.</div>}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── Section 7 · Offers ──────────────────────────────────────────── */
export function OffersView({ data, projectId, sectionId }) {
  const { toast } = useApp();
  const offers = (data?.offers || []).map(normalizeOffer);
  const best = data?.bestOffer;
  const [openRisk, setOpenRisk] = useState({});
  const [mechFilter, setMechFilter] = useState("all");
  const [whenFilter, setWhenFilter] = useState("all");

  const mechs = ["all", ...Array.from(new Set(offers.map((o) => o.mechanism).filter(Boolean)))];
  const whens = ["all", ...Array.from(new Set(offers.map((o) => o.whenToUse).filter(Boolean)))];

  const bestOffer = best ? offers.find((o) => o.name === best.name) : null;

  const visible = offers.filter(
    (o) => (mechFilter === "all" || o.mechanism === mechFilter) && (whenFilter === "all" || o.whenToUse === whenFilter)
  );

  return (
    <div>
      {best && (
        <div className="offer-best" style={{ marginBottom: 18 }}>
          <div className="offer-ribbon">★ Recommended</div>
          <div className="row-between wrap" style={{ gap: 12 }}>
            <div className="row" style={{ gap: 14 }}>
              <div className="offer-disc" style={{ fontSize: 34 }}>{bestOffer?.discount || best.name}</div>
              <div style={{ minWidth: 0 }}>
                <h3 style={{ margin: 0, fontSize: 18 }}>{best.name}</h3>
                {bestOffer?.emotionalHook && <div className="small muted" style={{ marginTop: 2 }}>{bestOffer.emotionalHook}</div>}
                {bestOffer && <div className="offer-fit" style={{ marginTop: 8 }}>Best overall — {bestOffer.targetPersona}</div>}
              </div>
            </div>
            <ItemActions projectId={projectId} sectionId={sectionId} sectionTitle="Offers" label={`Best offer: ${best.name}`} content={JSON.stringify({ ...best, ...(bestOffer || {}) }, null, 2)} />
          </div>
          {best.whyItWins && <p className="small" style={{ margin: "12px 0 0", color: "var(--muted)" }}>{best.whyItWins}</p>}
          {bestOffer?.cta && <button className="offer-cta" style={{ marginTop: 12, fontSize: 14 }}>{bestOffer.cta}</button>}
        </div>
      )}

      {(mechs.length > 1 || whens.length > 1) && (
        <div className="row wrap" style={{ gap: 8, marginBottom: 14 }}>
          <span className="small muted" style={{ fontWeight: 700 }}>Filter:</span>
          {mechs.map((m) => (
            <button key={m} className={`offer-filter ${mechFilter === m ? "on" : ""}`} onClick={() => setMechFilter(m)}>
              {m === "all" ? "All mechanisms" : m}
            </button>
          ))}
          {whens.filter((w) => w !== "all").map((w) => (
            <button key={w} className={`offer-filter ${whenFilter === w ? "on" : ""}`} onClick={() => setWhenFilter(w)}>
              {w}
            </button>
          ))}
          {(mechFilter !== "all" || whenFilter !== "all") && (
            <button className="offer-filter" onClick={() => { setMechFilter("all"); setWhenFilter("all"); }}>Clear</button>
          )}
        </div>
      )}

      <div className="offer-grid">
        {visible.map((o, i) => (
          <div key={i} className="offer-card">
            <div className="row-between" style={{ marginBottom: 8 }}>
              <span className={`offer-mech mech-${mechTone(o.mechanism)}`}>{o.mechanism}</span>
              {o.impact && <span className={`offer-impact imp-${impactTone(o.impact)}`}>{impactIcon(o.impact)} {impactLabel(o.impact)}</span>}
            </div>
            <h3 className="offer-name">{o.name}</h3>
            {o.discount && <div className="offer-disc">{o.discount}</div>}
            {o.emotionalHook && <div className="offer-hook">{o.emotionalHook}</div>}
            {o.targetPersona && <div className="offer-fit"><span className="offer-fit-label">Best fits:</span> {o.targetPersona}</div>}
            {o.whenToUse && (
              <div className="row" style={{ gap: 6, fontSize: 12.5, color: "var(--muted)", marginTop: 8 }}>
                <Icon.Clock /> {o.whenToUse}
              </div>
            )}
            {o.cta && (
              <button className="offer-cta" onClick={async () => { await api.copy(o.cta); toast("CTA copied"); }}>
                {o.cta}
              </button>
            )}
            {o.risk && (
              <div className="offer-risk">
                <button className="offer-risk-toggle" onClick={() => setOpenRisk((s) => ({ ...s, [i]: !s[i] }))}>
                  ⓘ Risk {openRisk[i] ? "▾" : "▸"}
                </button>
                {openRisk[i] && <div className="offer-risk-body">{o.risk}</div>}
              </div>
            )}
            <ItemActions projectId={projectId} sectionId={sectionId} sectionTitle="Offers" label={o.name} content={JSON.stringify(o, null, 2)} />
          </div>
        ))}
      </div>
      {visible.length === 0 && <div className="card muted small" style={{ textAlign: "center", padding: 24 }}>No offers match the selected filter.</div>}
    </div>
  );
}

function normalizeOffer(o) {
  return {
    name: o.name,
    discount: o.discount,
    emotionalHook: o.emotionalHook || o.psychologicalAngle,
    mechanism: o.mechanism,
    targetPersona: o.targetPersona,
    impact: o.impact || o.conversionImpact,
    whenToUse: o.whenToUse,
    cta: o.cta || o.recommendedCta,
    risk: Array.isArray(o.risk) ? o.risk.join(" ") : o.risk || (Array.isArray(o.risks) ? o.risks.join(" ") : ""),
  };
}

function mechTone(m) {
  const s = (m || "").toLowerCase();
  if (s.includes("flash") || s.includes("scarc") || s.includes("limit") || s.includes("urgen")) return "orange";
  if (s.includes("subscri")) return "purple";
  if (s.includes("loyal") || s.includes("referr")) return "green";
  if (s.includes("trial")) return "indigo";
  if (s.includes("bundle") || s.includes("upsell") || s.includes("bogo") || s.includes("gift")) return "teal";
  return "blue"; // discount / tiered / default
}
function impactTone(v) {
  const s = (v || "").toLowerCase();
  if (s.includes("very high")) return "veryhigh";
  if (s.includes("high")) return "high";
  if (s.includes("low")) return "low";
  return "medium";
}
function impactIcon(v) {
  const s = (v || "").toLowerCase();
  if (s.includes("very high")) return "🔥";
  if (s.includes("high")) return "⭐";
  return "➖";
}
function impactLabel(v) {
  const s = (v || "").toLowerCase();
  if (s.includes("very high")) return "Very High";
  if (s.includes("high")) return "High";
  if (s.includes("low")) return "Low";
  return "Medium";
}

/* ── Section 8 · Landing pages ───────────────────────────────────── */
const LANDING_TONES = ["#16a34a", "#2563eb", "#ea580c", "#7c3aed", "#0d9488", "#ca8a04", "#dc2626"];

/** Render an AI prompt as a clean copyable prompt card. */
function PromptBlock({ text }) {
  if (!text) return null;
  const isArabic = /[\u0600-\u06FF]/.test(text);
  return (
    <div style={{
      background: "linear-gradient(135deg, var(--surface-2, #f8fafc) 0%, var(--surface-3, #f1f5f9) 100%)",
      border: "1px solid var(--border)",
      borderLeft: "3px solid var(--primary)",
      borderRadius: 8,
      padding: "12px 14px",
      fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
      fontSize: 13,
      lineHeight: 1.75,
      color: "var(--text, #1e293b)",
      whiteSpace: "pre-wrap",
      wordBreak: "break-word",
      direction: isArabic ? "rtl" : "ltr",
      textAlign: isArabic ? "right" : "left",
    }}>
      {text.trim()}
    </div>
  );
}

/**
 * Build a clean numbered-section design prompt from a landing-page section's data.
 * Format: "N. SECTION NAME\nField: value\nField: value..."
 */
function buildDesignPrompt(s, sectionIndex, page) {
  const name = (s.sectionName || "Section").toUpperCase();
  const num  = typeof sectionIndex === "number" ? sectionIndex + 1 : "";
  const out  = [];

  out.push(`${num}. ${name}`);
  out.push(`Mobile Viewport: 390 × 844 px — single-column vertical layout (9:16). Optimize for smartphone only.`);

  const rows = [
    ["Purpose",               s.purpose],
    ["Psychological Goal",    s.psychologicalGoal],
    ["Visual Direction",      s.visualDirection],
    ["Copywriting Goal",      s.copywritingGoal],
    ["CTA",                   s.ctaLabel ? `${s.ctaLabel}${s.ctaWhy ? ` — ${s.ctaWhy}` : ""}` : s.cta],
    ["Suggested Icons",       Array.isArray(s.suggestedIcons) && s.suggestedIcons.length ? s.suggestedIcons.join(", ") : (typeof s.suggestedIcons === "string" ? s.suggestedIcons : null)],
    ["Suggested Images",      s.suggestedImages || null],
    ["Layout Description",    s.layoutDescription],
    ["Animation Ideas",       s.animationIdeas || null],
    ["Color Recommendation",  s.colorRecommendation || null],
    ["Mobile UX Notes",       s.mobileUxNotes || null],
    ["Trust Elements",        s.trustChips?.length ? s.trustChips.join(", ") : null],
    ["Conversion Tips",       s.conversionTips || null],
  ];

  rows.forEach(([label, value]) => {
    if (value) out.push(`${label}: ${value}`);
  });

  return out.join("\n");
}


export function LandingView({ data, projectId, sectionId }) {
  const { toast } = useApp();
  const pages = data?.pages || [];
  const [tab, setTab] = useState(pages[0]?.variant || "A");
  const [copied, setCopied] = useState({});
  const page = pages.find((p) => p.variant === tab) || pages[0];
  if (!page) return <RichText text={data ? JSON.stringify(data, null, 2) : ""} />;
  const sections = (page.sections || []).map((s) => normLandingSection(s));

  const copyPrompt = async (i, txt) => {
    if (!txt) return;
    await api.copy(txt);
    setCopied((c) => ({ ...c, [i]: true }));
    toast("AI copywriting prompt copied.");
    setTimeout(() => setCopied((c) => ({ ...c, [i]: false })), 1600);
  };

  const generateCopy = async (s, i) => {
    const instruction =
      s.aiPrompt && s.aiPrompt.length > 3
        ? s.aiPrompt
        : `Write the actual landing-page copy (headline, subheadline, body, CTA) for this section based on the following brief. Follow it precisely:\n\n${briefText(s)}`;
    try {
      await api.post(`/api/projects/${projectId}/sections/${sectionId}/run`, {
        regenerate: { mode: "custom", custom: instruction },
      });
      toast("Generating copy… refresh the section when done.");
    } catch (e) {
      toast(e.message || "Generation failed", "error");
    }
  };

  return (
    <div>
      {/* ── Page tabs ── */}
      <div className="tabs">
        {pages.map((p) => (
          <button key={p.variant} className={`tab ${tab === p.variant ? "active" : ""}`} onClick={() => setTab(p.variant)} role="tab" aria-selected={tab === p.variant}>
            Landing Page {p.variant} <span className="small muted">({(p.sections || []).length} sections)</span>
          </button>
        ))}
      </div>

      {/* ── Page strategy banner ── */}
      {page.strategy && (
        <div className="img-tip" style={{ marginBottom: 20 }}>
          📌 <strong>{page.strategy}</strong>{page.theme ? ` — ${page.theme}` : ""}
        </div>
      )}

      {/* ── Document-style section list ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        {sections.map((s, i) => {
          const code   = `${page.variant}${i + 1}`;
          const dp     = buildDesignPrompt(s, i, page);
          const dpKey  = `dp_${i}`;
          const brKey  = `br_${i}`;
          const genKey = `gen_${i}`;

          const fields = [
            ["Section Name",      s.sectionName],
            ["Purpose",           s.purpose],
            ["Psychological Goal", s.psychologicalGoal],
            ["Visual Direction",   s.visualDirection],
            ["Copywriting Goal",   s.copywritingGoal],
            ["CTA",                s.ctaLabel ? `${s.ctaLabel}${s.ctaWhy ? ` — ${s.ctaWhy}` : ""}` : s.cta],
            ["Suggested Icons",    Array.isArray(s.suggestedIcons) && s.suggestedIcons.length ? s.suggestedIcons.join(", ") : (s.suggestedIcons || null)],
            ["Suggested Images",   s.suggestedImages || null],
            ["Layout Description", s.layoutDescription],
            ["Animation Ideas",    s.animationIdeas || null],
            ["Color Recommendation", s.colorRecommendation || null],
            ["Mobile UX Notes",    s.mobileUxNotes || null],
            ["Trust Elements",     s.trustChips?.length ? s.trustChips.join(", ") : null],
            ["Conversion Tips",    s.conversionTips || null],
          ].filter(([, v]) => v);

          return (
            <div key={i} className="card" style={{ padding: 0, overflow: "hidden" }}>

              {/* ── Section header ── */}
              <div style={{
                background: "linear-gradient(135deg, var(--primary) 0%, var(--secondary, #7c3aed) 100%)",
                padding: "18px 24px 14px",
                color: "#fff",
              }}>
                <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 3, opacity: 0.75, textTransform: "uppercase", marginBottom: 4 }}>
                  SECTION {code}
                </div>
                <div style={{ fontSize: 20, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.5, lineHeight: 1.2 }}>
                  {s.sectionName}
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
                  {(s.landTags || []).map((t, ti) => (
                    <span key={ti} style={{ background: "rgba(255,255,255,0.18)", borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 600 }}>{t}</span>
                  ))}
                  <span style={{ background: "rgba(255,255,255,0.30)", borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 700 }}>{s.specPill}</span>
                </div>
              </div>

              {/* ── Divider ── */}
              <div style={{ height: 1, background: "var(--border)" }} />

              {/* ── Fields ── */}
              <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 0 }}>
                {fields.map(([label, value], fi) => (
                  <div key={label} style={{
                    display: "flex",
                    gap: 0,
                    borderBottom: fi < fields.length - 1 ? "1px solid var(--border)" : "none",
                    padding: "10px 0",
                    alignItems: "flex-start",
                  }}>
                    <span style={{
                      fontWeight: 700,
                      color: "var(--primary)",
                      minWidth: 190,
                      flexShrink: 0,
                      fontSize: 12.5,
                      lineHeight: 1.6,
                      paddingRight: 16,
                    }}>
                      {label}
                    </span>
                    <span style={{ fontSize: 13.5, lineHeight: 1.65, color: "var(--text)", flex: 1 }}>
                      {value}
                    </span>
                  </div>
                ))}

                {/* Color swatches */}
                {s.colorPair && s.colorPair.length > 0 && (
                  <div style={{ paddingTop: 12, display: "flex", gap: 6 }}>
                    {s.colorPair.map((hex, h) => (
                      <div key={h} className="swatch" style={{ width: 52, height: 30, background: hex }}>{hex}</div>
                    ))}
                  </div>
                )}

                {/* Tip */}
                <div style={{ marginTop: 14, padding: "10px 14px", background: "var(--surface-2)", borderRadius: 8, fontSize: 12.5, color: "var(--warning)", borderLeft: "3px solid var(--warning)" }}>
                  💡 {landingTip(s.sectionName)}
                </div>
              </div>

              {/* ── Action footer ── */}
              <div style={{
                borderTop: "1px solid var(--border)",
                background: "var(--surface-2)",
                padding: "12px 24px",
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
                alignItems: "center",
              }}>
                {/* 🎨 Copy Design Prompt */}
                <button
                  className="btn btn-sm btn-primary"
                  onClick={async () => {
                    await api.copy(dp);
                    setCopied((c) => ({ ...c, [dpKey]: true }));
                    toast("Design prompt copied — paste into your AI agent.");
                    setTimeout(() => setCopied((c) => ({ ...c, [dpKey]: false })), 1800);
                  }}
                >
                  {copied[dpKey] ? <Icon.Check /> : <Icon.Copy />} {copied[dpKey] ? "Copied!" : "🎨 Copy Design Prompt"}
                </button>

                {/* 📋 Copy Copywriting Brief */}
                {s.aiPrompt && (
                  <button
                    className="btn btn-sm"
                    onClick={async () => {
                      await api.copy(s.aiPrompt);
                      setCopied((c) => ({ ...c, [brKey]: true }));
                      toast("Copywriting brief copied.");
                      setTimeout(() => setCopied((c) => ({ ...c, [brKey]: false })), 1800);
                    }}
                  >
                    {copied[brKey] ? <Icon.Check /> : <Icon.Copy />} {copied[brKey] ? "Copied!" : "📋 Copy Brief"}
                  </button>
                )}

                {/* ✨ Generate copy */}
                <button
                  className="btn btn-sm"
                  onClick={async () => {
                    setCopied((c) => ({ ...c, [genKey]: true }));
                    await generateCopy(s, i);
                    setTimeout(() => setCopied((c) => ({ ...c, [genKey]: false })), 3000);
                  }}
                >
                  {copied[genKey] ? <Icon.Check /> : null} ✨ Generate copy
                </button>

                {/* Favorite / copy JSON */}
                <ItemActions projectId={projectId} sectionId={sectionId} sectionTitle="Landing Page Structure" label={`${page.variant}${i + 1} · ${s.sectionName}`} content={JSON.stringify(s, null, 2)} />

                {/* Expandable prompts */}
                <div style={{ flex: 1 }} />
                {s.aiPrompt && (
                  <details style={{ fontSize: 12 }}>
                    <summary className="small muted" style={{ cursor: "pointer" }}>📋 View brief</summary>
                    <div style={{ position: "absolute", zIndex: 10, marginTop: 4, width: 520, right: 24 }}>
                      <PromptBlock text={s.aiPrompt} />
                    </div>
                  </details>
                )}
                <details style={{ fontSize: 12 }}>
                  <summary className="small muted" style={{ cursor: "pointer" }}>🎨 View design prompt</summary>
                  <div style={{ position: "absolute", zIndex: 10, marginTop: 4, width: 560, right: 24 }}>
                    <PromptBlock text={dp} />
                  </div>
                </details>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}



function highlightBrief(text, { cta, colors }) {
  const targets = [];
  if (cta && cta.length > 2) targets.push(cta);
  (colors || []).forEach((c) => { if (c && c.length > 2) targets.push(c); });
  const unique = Array.from(new Set(targets)).filter((t) => text.includes(t));
  if (unique.length === 0) return text;
  const re = new RegExp("(" + unique.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|") + ")", "g");
  const parts = text.split(re);
  return parts.map((p, idx) =>
    unique.includes(p) ? <mark key={idx} className="highlight-in-block">{p}</mark> : p
  );
}

function briefText(s) {
  const parts = [];
  if (s.purpose) parts.push("Purpose: " + s.purpose);
  if (s.psychologicalGoal) parts.push("Psychological goal: " + s.psychologicalGoal);
  if (s.visualDirection) parts.push("Visual direction: " + s.visualDirection);
  if (s.copywritingGoal) parts.push("Copywriting goal: " + s.copywritingGoal);
  if (s.layoutDescription) parts.push("Layout: " + s.layoutDescription);
  if (s.mobileUxNotes) parts.push("Mobile UX: " + s.mobileUxNotes);
  if (s.trustChips && s.trustChips.length) parts.push("Trust elements: " + s.trustChips.join("; "));
  if (s.conversionTips) parts.push("Conversion tips: " + s.conversionTips);
  if (s.animationIdeas) parts.push("Animation: " + s.animationIdeas);
  if (s.colorRecommendation) parts.push("Colors: " + s.colorRecommendation);
  if (s.cta || s.ctaWhy) parts.push("CTA: " + [s.ctaLabel || s.cta, s.ctaWhy].filter(Boolean).join(" — "));
  return parts.join("\n\n");
}

function landTags(s) {
  const tags = [];
  const hay = ((s.sectionName || "") + " " + (s.purpose || "") + " " + (s.psychologicalGoal || "")).toLowerCase();
  const map = [
    ["hero", /hero|above the fold|first impression|headline/],
    ["emotional", /emotion|feeling|story|identity|belong/],
    ["problem-aware", /problem|pain|agitat|frustrat|struggle/],
    ["solution", /solution|intro|product|how it works/],
    ["benefit", /benefit|value|result|outcome/],
    ["social proof", /social|proof|testimonial|trust|review/],
    ["urgency", /urgent|scarcity|limited|deadline|fear of missing/],
    ["objection", /objection|faq|concern|doubt|hesitat/],
    ["offer", /offer|pricing|price|discount|promo/],
    ["closing", /closing|final|last call|cta/],
  ];
  for (const [label, re] of map) {
    if (re.test(hay) && !tags.includes(label)) tags.push(label);
  }
  return tags.slice(0, 3).length ? tags.slice(0, 3) : ["landing"];
}

function landSpecPill(sectionName) {
  const s = (sectionName || "").toLowerCase();
  if (/hero|closing|final|captur/.test(s)) return "Above fold";
  if (/faq|social|proof/.test(s)) return "Long scroll";
  return "Full width";
}

function landingTip(sectionName) {
  const s = (sectionName || "").toLowerCase();
  if (/hero/.test(s)) return "Tip: keep the Hero focused on ONE primary message and ONE CTA — don't crowd the above-fold with secondary links.";
  if (/problem|agitat/.test(s)) return "Tip: agitate the pain with specifics the reader already feels, then pivot to your solution — avoid dwelling so long it feels negative.";
  if (/solution|how it works|intro/.test(s)) return "Tip: show the product actually being used — a 3-step 'how it works' beats a wall of features.";
  if (/social|proof|testimonial/.test(s)) return "Tip: pair each testimonial with a real name/photo/result and put the most credible one first.";
  if (/faq/.test(s)) return "Tip: answer real objections from Section 05 personas first — the FAQ should reduce risk, not just add length.";
  if (/offer|pricing|price/.test(s)) return "Tip: anchor price against value and make the offer deadline visible, but don't let the pricing CTA compete with the Hero's primary CTA.";
  if (/closing|final/.test(s)) return "Tip: repeat the core offer + guarantee one last time and close with a single, urgent CTA.";
  return "Tip: make sure this section's CTA doesn't compete with the Hero's primary CTA — keep secondary CTAs visually lighter.";
}

function normLandingSection(s) {
  const cta = s.cta || "";
  let ctaLabel = "", ctaWhy = "";
  const m = cta.match(/^(.*?)(\s*[—–-]\s*.*)$/);
  if (m) { ctaLabel = m[1]; ctaWhy = m[2].replace(/^[\s—–-]+/, ""); }
  else if (cta) { ctaLabel = cta; }
  const colors = s.colorPair || s.colors || (s.colorRecommendation ? /#([0-9a-fA-F]{6})/.test(s.colorRecommendation) && s.colorRecommendation.match(/#[0-9a-fA-F]{6}/g) : []) || [];
  const n = {
    sectionName: s.sectionName,
    purpose: s.purpose,
    psychologicalGoal: s.psychologicalGoal,
    visualDirection: s.visualDirection,
    copywritingGoal: s.copywritingGoal || s.copyGoal,
    conversionTips: Array.isArray(s.conversionTips) ? s.conversionTips.join(" · ") : s.conversionTips || (Array.isArray(s.copyTips) ? s.copyTips.join(" · ") : ""),
    layoutDescription: s.layoutDescription || s.layout,
    mobileUxNotes: s.mobileUxNotes || s.mobileUx,
    suggestedIcons: s.suggestedIcons || s.icons || [],
    suggestedImages: s.suggestedImages || "",
    animationIdeas: s.animationIdeas || s.animation || "",
    colorRecommendation: s.colorRecommendation || "",
    colorPair: Array.isArray(colors) ? colors : [],
    trustChips: Array.isArray(s.trustElements) ? s.trustElements : s.trustElement ? [s.trustElement] : [],
    cta: cta, ctaLabel, ctaWhy,
    buildGuide: s.buildGuide || "",
    aiPrompt: s.aiPrompt || s.copilotPrompt || "",
  };
  n.landTags = landTags(n);
  n.specPill = landSpecPill(n.sectionName);
  return n;
}


/* ── Section 9 · Image prompts ───────────────────────────────────── */
export function ImagePromptsView({ data, projectId, sectionId }) {
  const prompts = data?.prompts || [];
  if (!prompts.length) return <RichText text={data ? JSON.stringify(data, null, 2) : ""} />;
  const groups = {};
  prompts.forEach((p) => { (groups[p.variant || "All"] = groups[p.variant || "All"] || []).push(p); });
  const variants = Object.keys(groups);
  const [tab, setTab] = useState(variants[0]);
  return (
    <div>
      <div className="tabs">
        {variants.map((v) => <button key={v} className={`tab ${tab === v ? "active" : ""}`} onClick={() => setTab(v)}>Variant {v} <span className="small muted">({groups[v].length})</span></button>)}
      </div>
      {(groups[tab] || []).map((p, i) => (
        <div key={i} className="card" style={{ marginBottom: 14 }}>
          <div className="row-between" style={{ marginBottom: 8 }}>
            <h3 style={{ margin: 0, fontSize: 14 }}>
              <span className="badge badge-primary" style={{ marginRight: 6 }}>{p.variant}</span>{p.sectionName}
              <span className="chip" style={{ marginLeft: 8 }}>{p.style}</span>
              <span className="chip" style={{ marginLeft: 6 }}>{p.aspectRatio}</span>
            </h3>
            <div className="row">
              <button className="btn btn-sm" onClick={async () => { await api.copy(p.prompt); toast("Prompt copied."); }}><Icon.Copy /> COPY PROMPT</button>
              <button className="btn btn-sm btn-primary" onClick={async () => { try { await navigator.clipboard.writeText(p.prompt); } catch { await api.copy(p.prompt); } window.open("https://labs.google/fx/tools/flow/project/245ff325-111b-4c5d-a9dc-0db0723725da", "_blank"); toast("Prompt copied! Paste it in Google Labs Flow."); }}><Icon.Sparkle /> GENERATE IMAGE</button>
              <ItemActions projectId={projectId} sectionId={sectionId} sectionTitle="Section Image Prompts" label={`${p.variant} · ${p.sectionName}`} content={p.prompt} />
            </div>
          </div>
          <div className="raw-block" style={{ maxHeight: 320, fontSize: 11.5 }}>{p.prompt}</div>
          {p.prompt && !/no buttons/i.test(p.prompt) && (
            <div className="small" style={{ marginTop: 6, color: "var(--warning)" }}>Tip: this prompt may contain UI elements. Regenerate or add "no buttons, no CTA text, no fake UI inside image" manually.</div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ── Section 10 · Copywriting ────────────────────────────────────── */
export function CopywritingView({ data, projectId, sectionId }) {
  const cats = data?.categories || {};
  const keys = Object.keys(cats);
  const [tab, setTab] = useState(keys[0] || "Headlines");
  const { toast } = useApp();
  return (
    <div>
      <div className="tabs">
        {keys.map((k) => <button key={k} className={`tab ${tab === k ? "active" : ""}`} onClick={() => setTab(k)}>{k} <span className="small muted">({(cats[k] || []).length})</span></button>)}
      </div>
      <div className="grid-3">
        {(cats[tab] || []).map((item, i) => (
          <div key={i} className="card" style={{ padding: 12 }}>
            <div className="row-between" style={{ marginBottom: 6 }}>
              <span className="small muted" style={{ fontSize: 11 }}>{i + 1}</span>
              <ItemActions projectId={projectId} sectionId={sectionId} sectionTitle="Copywriting" label={`${tab} #${i + 1}`} content={item} />
            </div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{item}</div>
            <button className="btn btn-sm mt-8" style={{ display: "none" }}>Edit</button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Section 11 · Social proof ───────────────────────────────────── */
export function SocialProofView({ data, projectId, sectionId }) {
  const reviews = data?.reviews || [];
  return (
    <div>
      <div className="badge badge-info" style={{ marginBottom: 12 }}>
        AI-generated testimonial concepts — replace with real customer feedback before publishing.
      </div>
      <div className="grid-col-3">
        {reviews.map((r, i) => (
          <div key={i} className="card">
            <div className="row-between" style={{ marginBottom: 6 }}>
              <div className="row">
                <div className="avatar" style={{ width: 30, height: 30, fontSize: 12 }}>{r.name?.[0]}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13.5 }}>{r.name}</div>
                  <div className="small muted" style={{ fontSize: 11 }}>{r.age} · {r.country}</div>
                </div>
              </div>
              <div style={{ color: "var(--accent)" }}>{"★".repeat(r.stars || 5)}{"☆".repeat(Math.max(0, 5 - (r.stars || 5)))}</div>
            </div>
            <p className="small" style={{ fontSize: 13 }}>“{r.review}”</p>
            <div className="row-between small muted" style={{ fontSize: 11 }}>
              <span>{r.writingStyle}</span>
              <ItemActions projectId={projectId} sectionId={sectionId} sectionTitle="Social Proof" label={r.name} content={r.review} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Section 12 · FAQ ────────────────────────────────────────────── */
export function FaqView({ data }) {
  const faqs = data?.faqs || [];
  return (
    <div>
      {faqs.map((f, i) => (
        <details key={i} className="card" style={{ marginBottom: 10, padding: "12px 16px" }}>
          <summary style={{ fontWeight: 750, fontSize: 14, cursor: "pointer" }}>
            <span className="badge badge-muted" style={{ marginRight: 10 }}>{i + 1}</span>{f.question}
          </summary>
          <div className="mt-12 small">
            <p style={{ marginBottom: 6 }}>{f.answer}</p>
            <div className="muted" style={{ fontSize: 12 }}><b>Objection addressed:</b> {f.objectionAddressed}</div>
            <div className="muted" style={{ fontSize: 12 }}><b>Conversion purpose:</b> {f.conversionPurpose}</div>
          </div>
        </details>
      ))}
    </div>
  );
}

/* ── Section 13 · Popups ─────────────────────────────────────────── */
export function PopupsView({ data, projectId, sectionId }) {
  const popups = data?.popups || [];
  return (
    <div className="grid-col-3">
      {popups.map((p, i) => (
        <div key={i} className="card" style={{ borderTop: "3px solid var(--primary)" }}>
          <div className="row-between" style={{ marginBottom: 10 }}>
            <h3 style={{ margin: 0 }}>{p.type}</h3>
            <ItemActions projectId={projectId} sectionId={sectionId} sectionTitle="Email Popup" label={p.type} content={JSON.stringify(p, null, 2)} />
          </div>
          <div className="small">
            <div className="kv"><span className="k">Headline</span><span><b>{p.headline}</b></span></div>
            <div className="kv"><span className="k">Body</span><span>{p.body}</span></div>
            <div className="kv"><span className="k">Offer</span><span className="badge badge-warn">{p.offer}</span></div>
            <div className="kv"><span className="k">CTA</span><span><b>{p.cta}</b></span></div>
            <div className="kv"><span className="k">Psych angle</span><span>{p.psychologicalAngle}</span></div>
            <div className="kv"><span className="k">Design</span><span>{p.designRecommendation}</span></div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Section 15 · Design references ──────────────────────────────── */
export function ReferencesView({ data, projectId, sectionId }) {
  const refs = data?.references || [];
  return (
    <div className="grid-col-3">
      {refs.map((r, i) => (
        <div key={i} className="card">
          <div className="row-between" style={{ marginBottom: 6 }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 15 }}>{r.brand}</h3>
              {r.website && r.website !== "not available" && <a href={r.website} target="_blank" rel="noreferrer" className="small" style={{ fontSize: 11 }}>{r.website}</a>}
            </div>
            {r.isVerified === false && <Flag verified={false} />}
          </div>
          <div className="row" style={{ marginBottom: 8 }}>{(r.brandColors || []).map((hex) => <div key={hex} className="swatch" style={{ width: 40, height: 20 }}>{hex}</div>)}</div>
          <div className="small" style={{ marginBottom: 8 }}>
            <div className="kv"><span className="k">Why successful</span><span>{r.whySuccessful}</span></div>
            <div className="kv"><span className="k">Landing style</span><span>{r.landingPageStyle}</span></div>
            <div className="kv"><span className="k">Photography</span><span>{r.photography}</span></div>
            <div className="kv"><span className="k">UX strategy</span><span>{r.uxStrategy}</span></div>
            <div className="kv"><span className="k">CRO lesson</span><span><b>{r.croLesson}</b></span></div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Section 16 · Ad creatives ───────────────────────────────────── */
const safeStr = (val) => typeof val === "object" && val !== null ? JSON.stringify(val) : val;

export function AdCreativesView({ data, projectId, sectionId }) {
  const list = data?.creatives || [];
  return (
    <div className="grid-col-3">
      {list.map((c, i) => (
        <div key={i} className="card">
          <div className="row-between" style={{ marginBottom: 8 }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 14 }}>{safeStr(c.name)}</h3>
              <span className="chip" style={{ marginTop: 4 }}>{safeStr(c.format)}</span>
            </div>
            <ItemActions projectId={projectId} sectionId={sectionId} sectionTitle="Ad Creative Ideas" label={c.name} content={JSON.stringify(c, null, 2)} />
          </div>
          <div className="small">
            <div className="kv"><span className="k">Platform</span><span>{safeStr(c.platform)}</span></div>
            <div className="kv"><span className="k">Hook</span><span><b>{safeStr(c.hook)}</b></span></div>
            <div className="kv"><span className="k">Core angle</span><span>{safeStr(c.coreAngle)}</span></div>
            <div className="kv"><span className="k">On-screen</span><span>{safeStr(c.onScreenText)}</span></div>
            <div className="kv"><span className="k">Voiceover</span><span>{safeStr(c.voiceover)}</span></div>
            <div className="kv"><span className="k">Copy</span><span>{safeStr(c.primaryCopy)}</span></div>
            <div className="kv"><span className="k">CTA</span><span><b>{safeStr(c.cta)}</b></span></div>
            <div className="kv"><span className="k">Sound</span><span>{safeStr(c.sound)}</span></div>
            <div className="kv"><span className="k">Persona</span><span>{safeStr(c.targetPersona)}</span></div>
            <div className="kv"><span className="k">Why it converts</span><span>{safeStr(c.conversionReasoning)}</span></div>
          </div>
          {c.aiStoryboardPrompt && (
            <details className="mt-8">
              <summary className="small muted" style={{ cursor: "pointer" }}>Storyboard prompt</summary>
              <div className="raw-block mt-8" style={{ maxHeight: 220, fontSize: 11 }}>{c.aiStoryboardPrompt}</div>
            </details>
          )}
        </div>
      ))}
    </div>
  );
}

/* ── Section 17 · Ad image concepts ──────────────────────────────── */
export function AdImagesView({ data, projectId, sectionId }) {
  const list = data?.concepts || [];
  const { toast } = useApp();
  return (
    <div className="grid-col-3">
      {list.map((c, i) => (
        <div key={i} className="card">
          <div className="row-between" style={{ marginBottom: 8 }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 14 }}>{c.concept}</h3>
              <span className="chip" style={{ marginTop: 4 }}>{c.type}</span>
            </div>
            <ItemActions projectId={projectId} sectionId={sectionId} sectionTitle="Ad Image Concepts" label={c.concept} content={JSON.stringify(c, null, 2)} />
          </div>
          <div className="small">
            <div className="kv"><span className="k">Visual idea</span><span>{c.visualIdea}</span></div>
            <div className="kv"><span className="k">Composition</span><span>{c.composition}</span></div>
            <div className="kv"><span className="k">Product</span><span>{c.productPlacement}</span></div>
            <div className="kv"><span className="k">Background</span><span>{c.background}</span></div>
            <div className="kv"><span className="k">Color mood</span><span>{c.colorMood}</span></div>
            <div className="kv"><span className="k">Lighting</span><span>{c.lighting}</span></div>
            <div className="kv"><span className="k">Emotion</span><span>{c.emotionalAngle}</span></div>
            <div className="kv"><span className="k">Platform</span><span>{c.platform} · {c.targetPersona}</span></div>
          </div>
          {c.imagePrompt && (
            <div className="mt-8">
              <button className="btn btn-sm btn-block" onClick={async () => { await api.copy(c.imagePrompt); toast("Prompt copied."); }}><Icon.Copy /> COPY IMAGE PROMPT</button>
              <details className="mt-8">
                <summary className="small muted" style={{ cursor: "pointer" }}>View prompt</summary>
                <div className="raw-block mt-8" style={{ maxHeight: 220, fontSize: 11 }}>{c.imagePrompt}</div>
              </details>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ── Generic JSON code view ──────────────────────────────────────── */
export function JsonFallback({ data }) {
  if (!data) return null;
  return <pre className="raw-block">{JSON.stringify(data, null, 2)}</pre>;
}

/* ── Ad Creative Performance Analyzer Result View ─────────────────── */
const CONFIDENCE_COLORS = {
  HIGH:        { bg: "#d1fae5", text: "#065f46", border: "#6ee7b7" },
  MEDIUM:      { bg: "#fef3c7", text: "#92400e", border: "#fcd34d" },
  LOW:         { bg: "#fee2e2", text: "#991b1b", border: "#fca5a5" },
  INCONCLUSIVE:{ bg: "#f1f5f9", text: "#475569", border: "#cbd5e1" },
};

export function AdCreativeAnalyzerView({ data }) {
  const [tab, setTab] = useState("video");
  const [expandedCards, setExpandedCards] = useState({});

  if (!data) return null;

  const {
    productSummary,
    topRecommendedStyles = [],
    videoCreatives = [],
    imageCreatives = [],
    marketingAngles = [],
    avoidStyles = [],
    testingPlan = [],
    verdict,
    styleRanking = [],
    topAds = [],
    recommendations = []
  } = data;

  const isLegacy = !videoCreatives.length && !marketingAngles.length && (verdict || styleRanking.length || topAds.length);

  const toggleExpand = (id) => {
    setExpandedCards(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const priorityColors = {
    PRIMARY: { bg: "rgba(16, 185, 129, 0.15)", text: "#34d399", border: "rgba(16, 185, 129, 0.4)" },
    SECONDARY: { bg: "rgba(59, 130, 246, 0.15)", text: "#60a5fa", border: "rgba(59, 130, 246, 0.4)" },
    TEST: { bg: "rgba(245, 158, 11, 0.15)", text: "#fbbf24", border: "rgba(245, 158, 11, 0.4)" },
    EXPERIMENTAL: { bg: "rgba(168, 85, 247, 0.15)", text: "#c084fc", border: "rgba(168, 85, 247, 0.4)" },
  };

  const tabStyle = (t) => ({
    padding: "9px 22px",
    borderRadius: "12px",
    fontSize: "0.85rem",
    fontWeight: 800,
    cursor: "pointer",
    border: tab === t ? "1px solid rgba(56, 189, 248, 0.5)" : "1px solid rgba(255, 255, 255, 0.08)",
    background: tab === t ? "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)" : "rgba(30, 41, 59, 0.6)",
    color: tab === t ? "#ffffff" : "#94a3b8",
    boxShadow: tab === t ? "0 0 20px rgba(56, 189, 248, 0.35)" : "none",
    transition: "all 0.2s ease"
  });

  if (isLegacy) {
    return (
      <div style={{ padding: 20, background: "#0f172a", borderRadius: 16, border: "1px solid rgba(255,255,255,0.1)", fontSize: 13, color: "#cbd5e1" }}>
        <div style={{ fontWeight: 800, color: "#38bdf8", marginBottom: 8 }}>📊 Analysis Result (Legacy Format)</div>
        {verdict && <p style={{ margin: "0 0 12px 0", lineHeight: 1.6 }}>{verdict}</p>}
        {recommendations.length > 0 && (
          <div>
            <strong style={{ color: "#f8fafc" }}>Recommendations:</strong>
            <ul style={{ margin: "6px 0 0 0", paddingLeft: 20 }}>
              {recommendations.map((r, i) => <li key={i}>{typeof r === 'string' ? r : JSON.stringify(r)}</li>)}
            </ul>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      gap: 24,
      fontFamily: "system-ui, -apple-system, sans-serif",
      background: "#0b1329",
      padding: "20px",
      borderRadius: "20px",
      border: "1px solid rgba(56, 189, 248, 0.15)",
      boxShadow: "0 20px 50px rgba(0, 0, 0, 0.4)",
      color: "#f8fafc"
    }}>

      {/* Product Summary Header */}
      {productSummary && (
        <div style={{
          background: "linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.9) 100%)",
          backdropFilter: "blur(12px)",
          borderRadius: "16px",
          padding: "22px 26px",
          border: "1px solid rgba(56, 189, 248, 0.3)",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)"
        }}>
          <div style={{ fontSize: "0.75rem", fontWeight: 800, color: "#38bdf8", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8 }}>
            ⚡ Product Strategy & Creative Vision
          </div>
          <p style={{ margin: 0, fontSize: "0.95rem", lineHeight: 1.7, color: "#e2e8f0" }}>{productSummary}</p>
          {topRecommendedStyles.length > 0 && (
            <div style={{ display: "flex", gap: 10, marginTop: 16, alignItems: "center", flexWrap: "wrap" }}>
              <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#94a3b8" }}>Winning Styles:</span>
              {topRecommendedStyles.map((style, i) => (
                <span key={i} style={{
                  background: "rgba(56, 189, 248, 0.12)",
                  color: "#38bdf8",
                  border: "1px solid rgba(56, 189, 248, 0.35)",
                  borderRadius: "20px",
                  padding: "4px 14px",
                  fontSize: "0.8rem",
                  fontWeight: 800,
                  boxShadow: "0 0 12px rgba(56, 189, 248, 0.15)"
                }}>
                  ✨ {style}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Navigation Tabs */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {[
          { key: "video",   label: `🎥 Video Ideas (${videoCreatives.length})` },
          { key: "image",   label: `🖼️ Image Ideas (${imageCreatives.length})` },
          { key: "angles",  label: `🎯 Marketing Angles (${marketingAngles.length})` },
          { key: "avoid",   label: `⚠️ Styles to Avoid (${avoidStyles.length})` },
          { key: "testing", label: `🧪 Testing Plan (${testingPlan.length})` },
        ].map(({ key, label }) => (
          <button key={key} style={tabStyle(key)} onClick={() => setTab(key)}>{label}</button>
        ))}
      </div>

      {/* TAB: Video Creatives */}
      {tab === "video" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(330px, 1fr))", gap: 20 }}>
          {videoCreatives.length === 0 ? (
            <div style={{ color: "#64748b", fontSize: 13, textAlign: "center", padding: 30, gridColumn: "1/-1" }}>No video creative ideas generated.</div>
          ) : (
            videoCreatives.map((item, i) => {
              const cardId = `video-${i}`;
              const isExpanded = expandedCards[cardId] ?? true;
              const prio = priorityColors[item.priority] || priorityColors.TEST;

              return (
                <div key={i} style={{
                  background: "rgba(30, 41, 59, 0.65)",
                  backdropFilter: "blur(14px)",
                  borderRadius: "18px",
                  padding: "20px",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.25)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: 16
                }}>
                  {/* Card Header */}
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <span style={{
                        background: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
                        color: "#fff",
                        padding: "4px 12px",
                        borderRadius: "20px",
                        fontSize: "0.75rem",
                        fontWeight: 800,
                        boxShadow: "0 0 12px rgba(2, 132, 199, 0.4)"
                      }}>
                        #{item.rank || i + 1} • Fit: {item.fitScore}/10
                      </span>
                      <span style={{ background: prio.bg, color: prio.text, border: `1px solid ${prio.border}`, borderRadius: "20px", padding: "4px 12px", fontSize: "0.75rem", fontWeight: 800 }}>
                        {item.priority}
                      </span>
                    </div>

                    <h3 style={{ margin: "0 0 8px 0", fontSize: "1.3rem", fontWeight: 800, color: "#f8fafc", lineHeight: 1.3 }}>
                      {item.style}
                    </h3>

                    <div style={{ fontSize: "0.8rem", color: "#94a3b8", display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 12 }}>
                      <span>📱 <strong>{item.format}</strong></span>
                      <span>⏱️ <strong>{item.duration}</strong></span>
                    </div>

                    <div style={{ background: "rgba(15, 23, 42, 0.6)", border: "1px solid rgba(56, 189, 248, 0.2)", borderRadius: "12px", padding: "12px", fontSize: "0.825rem", color: "#cbd5e1" }}>
                      <strong style={{ color: "#38bdf8" }}>💡 Why This Style Fits:</strong>
                      <div style={{ marginTop: 4, lineHeight: 1.5 }}>{item.whyItFits}</div>
                    </div>
                  </div>

                  {/* Body Content */}
                  {isExpanded && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {/* Visual Hook */}
                      <div style={{ background: "rgba(249, 115, 22, 0.12)", border: "1px solid rgba(249, 115, 22, 0.3)", borderRadius: "12px", padding: "12px" }}>
                        <div style={{ fontSize: "0.725rem", fontWeight: 800, color: "#fb923c", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4 }}>
                          🧲 First 3 Seconds (Visual Hook)
                        </div>
                        <div style={{ fontSize: "0.825rem", color: "#ffedd5", lineHeight: 1.5 }}>{item.first3Seconds}</div>
                      </div>

                      {/* Main Storyline */}
                      <div style={{ background: "rgba(16, 185, 129, 0.12)", border: "1px solid rgba(16, 185, 129, 0.3)", borderRadius: "12px", padding: "12px" }}>
                        <div style={{ fontSize: "0.725rem", fontWeight: 800, color: "#34d399", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4 }}>
                          🎬 Main Video Storyline / Flow
                        </div>
                        <div style={{ fontSize: "0.825rem", color: "#d1fae5", lineHeight: 1.5 }}>{item.mainBody}</div>
                      </div>

                      {/* Hook Options */}
                      {item.hookOptions && item.hookOptions.length > 0 && (
                        <div style={{ background: "rgba(168, 85, 247, 0.12)", border: "1px solid rgba(168, 85, 247, 0.3)", borderRadius: "12px", padding: "12px" }}>
                          <div style={{ fontSize: "0.725rem", fontWeight: 800, color: "#c084fc", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4 }}>
                            🎙️ Spoken / Text Hook Variations
                          </div>
                          <ul style={{ margin: 0, paddingLeft: 16, fontSize: "0.8rem", color: "#f3e8ff", lineHeight: 1.5 }}>
                            {item.hookOptions.map((h, k) => <li key={k}>{h}</li>)}
                          </ul>
                        </div>
                      )}

                      <div style={{ fontSize: "0.8rem", color: "#cbd5e1", background: "rgba(15, 23, 42, 0.5)", padding: "10px", borderRadius: "10px", border: "1px solid rgba(255, 255, 255, 0.05)" }}>
                        <strong style={{ color: "#38bdf8" }}>🎨 Visual Direction:</strong> {item.visualDirection}
                      </div>
                    </div>
                  )}

                  {/* Card Footer */}
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingTop: 12,
                    borderTop: "1px solid rgba(255, 255, 255, 0.08)",
                    gap: 10
                  }}>
                    <div style={{ background: "rgba(56, 189, 248, 0.15)", border: "1px solid rgba(56, 189, 248, 0.3)", padding: "4px 12px", borderRadius: "20px", fontSize: "0.75rem", color: "#38bdf8", fontWeight: 800 }}>
                      📣 CTA: {item.cta}
                    </div>

                    <button
                      onClick={() => toggleExpand(cardId)}
                      style={{
                        padding: "6px 16px",
                        borderRadius: "10px",
                        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
                        border: "1px solid rgba(56, 189, 248, 0.4)",
                        color: "#38bdf8",
                        fontSize: "0.8rem",
                        fontWeight: 700,
                        cursor: "pointer",
                        transition: "all 0.2s ease"
                      }}
                    >
                      {isExpanded ? "Collapse" : "Expand"}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB: Image Creatives */}
      {tab === "image" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20 }}>
          {imageCreatives.length === 0 ? (
            <div style={{ color: "#64748b", fontSize: 13, textAlign: "center", padding: 30, gridColumn: "1/-1" }}>No image creative ideas generated.</div>
          ) : (
            imageCreatives.map((item, i) => {
              const cardId = `image-${i}`;
              const isExpanded = expandedCards[cardId] ?? true;
              const prio = priorityColors[item.priority] || priorityColors.TEST;

              return (
                <div key={i} style={{
                  background: "rgba(30, 41, 59, 0.65)",
                  backdropFilter: "blur(14px)",
                  borderRadius: "18px",
                  padding: "20px",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.25)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: 14
                }}>
                  {/* Card Header */}
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <span style={{
                        background: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
                        color: "#fff",
                        padding: "4px 12px",
                        borderRadius: "20px",
                        fontSize: "0.75rem",
                        fontWeight: 800
                      }}>
                        #{item.rank || i + 1} • Fit: {item.fitScore}/10
                      </span>
                      <span style={{ background: prio.bg, color: prio.text, border: `1px solid ${prio.border}`, borderRadius: "20px", padding: "4px 12px", fontSize: "0.75rem", fontWeight: 800 }}>
                        {item.priority}
                      </span>
                    </div>

                    <h3 style={{ margin: "0 0 6px 0", fontSize: "1.25rem", fontWeight: 800, color: "#f8fafc" }}>
                      {item.style}
                    </h3>

                    <div style={{ fontSize: "0.8rem", color: "#94a3b8" }}>
                      Format: <strong style={{ color: "#38bdf8" }}>{item.format}</strong>
                    </div>
                  </div>

                  {/* Body Content */}
                  {isExpanded && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      <div style={{ background: "rgba(15, 23, 42, 0.6)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "12px", padding: "12px", fontSize: "0.825rem", color: "#e2e8f0" }}>
                        <div style={{ fontSize: "0.7rem", fontWeight: 800, color: "#38bdf8", textTransform: "uppercase", marginBottom: 2 }}>🖼️ Visual Concept</div>
                        {item.visualConcept}
                      </div>

                      <div style={{ background: "rgba(16, 185, 129, 0.12)", border: "1px solid rgba(16, 185, 129, 0.3)", borderRadius: "12px", padding: "12px", fontSize: "0.825rem", color: "#d1fae5" }}>
                        <div style={{ fontSize: "0.7rem", fontWeight: 800, color: "#34d399", textTransform: "uppercase", marginBottom: 2 }}>✍️ Headline Idea</div>
                        <strong>"{item.headlineIdea}"</strong>
                      </div>

                      {item.textOverlay && (
                        <div style={{ background: "rgba(245, 158, 11, 0.12)", border: "1px solid rgba(245, 158, 11, 0.3)", borderRadius: "12px", padding: "12px", fontSize: "0.8rem", color: "#fef3c7" }}>
                          <strong style={{ color: "#fbbf24" }}>Badge / Overlay:</strong> {item.textOverlay}
                        </div>
                      )}

                      <div style={{ fontSize: "0.8rem", color: "#94a3b8", lineHeight: 1.5 }}>
                        <strong style={{ color: "#cbd5e1" }}>Why it works:</strong> {item.whyItFits}
                      </div>
                    </div>
                  )}

                  {/* Footer */}
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingTop: 12,
                    borderTop: "1px solid rgba(255, 255, 255, 0.08)"
                  }}>
                    <span style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: 700 }}>🖼️ Static Image Concept</span>
                    <button
                      onClick={() => toggleExpand(cardId)}
                      style={{
                        padding: "6px 16px",
                        borderRadius: "10px",
                        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
                        border: "1px solid rgba(56, 189, 248, 0.4)",
                        color: "#38bdf8",
                        fontSize: "0.8rem",
                        fontWeight: 700,
                        cursor: "pointer"
                      }}
                    >
                      {isExpanded ? "Collapse" : "Expand"}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB: Marketing Angles */}
      {tab === "angles" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(330px, 1fr))", gap: 20 }}>
          {marketingAngles.length === 0 ? (
            <div style={{ color: "#64748b", fontSize: 13, textAlign: "center", padding: 30, gridColumn: "1/-1" }}>No marketing angles generated.</div>
          ) : (
            marketingAngles.map((item, i) => {
              const cardId = `angle-${i}`;
              const isExpanded = expandedCards[cardId] ?? true;

              return (
                <div key={i} style={{
                  background: "rgba(30, 41, 59, 0.65)",
                  backdropFilter: "blur(14px)",
                  borderRadius: "18px",
                  padding: "20px",
                  border: "1px solid rgba(56, 189, 248, 0.2)",
                  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.25)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: 14
                }}>
                  {/* Card Header */}
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <span style={{
                        background: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
                        color: "#fff",
                        padding: "4px 12px",
                        borderRadius: "20px",
                        fontSize: "0.75rem",
                        fontWeight: 800,
                        boxShadow: "0 0 12px rgba(2, 132, 199, 0.4)"
                      }}>
                        Angle #{i + 1} • Fit: {item.fitScore}/10
                      </span>
                      <span style={{ background: "rgba(56, 189, 248, 0.12)", color: "#38bdf8", border: "1px solid rgba(56, 189, 248, 0.3)", borderRadius: "20px", padding: "4px 12px", fontSize: "0.75rem", fontWeight: 800 }}>
                        {item.category}
                      </span>
                    </div>

                    <h3 style={{ margin: "0 0 6px 0", fontSize: "1.3rem", fontWeight: 800, color: "#38bdf8", lineHeight: 1.3 }}>
                      {item.angle}
                    </h3>

                    <div style={{ fontSize: "0.8rem", color: "#94a3b8" }}>
                      Best Platform: <strong style={{ color: "#f8fafc" }}>{item.bestPlatform}</strong>
                    </div>
                  </div>

                  {/* Body Content */}
                  {isExpanded && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      <div style={{ background: "rgba(56, 189, 248, 0.12)", border: "1px solid rgba(56, 189, 248, 0.3)", borderRadius: "12px", padding: "12px", fontSize: "0.8rem" }}>
                        <span style={{ fontWeight: 800, color: "#38bdf8" }}>🧠 Psychological Trigger: </span>
                        <span style={{ color: "#e2e8f0" }}>{item.corePsychTrigger}</span>
                      </div>

                      <div style={{ background: "rgba(16, 185, 129, 0.12)", border: "1px solid rgba(16, 185, 129, 0.3)", borderRadius: "12px", padding: "12px", fontSize: "0.8rem" }}>
                        <div style={{ fontSize: "0.7rem", fontWeight: 800, color: "#34d399", textTransform: "uppercase", marginBottom: 2 }}>Headline Example</div>
                        <div style={{ color: "#d1fae5", fontWeight: 700 }}>"{item.headlineExample}"</div>
                      </div>

                      <div style={{ background: "rgba(168, 85, 247, 0.12)", border: "1px solid rgba(168, 85, 247, 0.3)", borderRadius: "12px", padding: "12px", fontSize: "0.8rem" }}>
                        <div style={{ fontSize: "0.7rem", fontWeight: 800, color: "#c084fc", textTransform: "uppercase", marginBottom: 2 }}>Ad Copy / Hook Example</div>
                        <div style={{ color: "#f3e8ff" }}>{item.bodyExample}</div>
                      </div>
                    </div>
                  )}

                  {/* Footer */}
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingTop: 12,
                    borderTop: "1px solid rgba(255, 255, 255, 0.08)"
                  }}>
                    <span style={{ fontSize: "0.75rem", color: "#38bdf8", fontWeight: 800 }}>
                      ✨ Style: {item.bestCreativeStyle}
                    </span>
                    <button
                      onClick={() => toggleExpand(cardId)}
                      style={{
                        padding: "6px 16px",
                        borderRadius: "10px",
                        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
                        border: "1px solid rgba(56, 189, 248, 0.4)",
                        color: "#38bdf8",
                        fontSize: "0.8rem",
                        fontWeight: 700,
                        cursor: "pointer"
                      }}
                    >
                      {isExpanded ? "Collapse" : "Expand"}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB: Styles to Avoid */}
      {tab === "avoid" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
          {avoidStyles.length === 0 ? (
            <div style={{ color: "#64748b", fontSize: 13, textAlign: "center", padding: 30, gridColumn: "1/-1" }}>No specific styles flagged to avoid.</div>
          ) : (
            avoidStyles.map((item, i) => (
              <div key={i} style={{
                background: "rgba(239, 68, 68, 0.12)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                borderRadius: "16px",
                padding: "16px 20px",
                display: "flex",
                gap: 12,
                alignItems: "flex-start"
              }}>
                <span style={{ fontSize: 22 }}>🚫</span>
                <div>
                  <h4 style={{ margin: "0 0 4px 0", fontSize: "1.05rem", fontWeight: 800, color: "#fca5a5" }}>{item.style}</h4>
                  <p style={{ margin: 0, fontSize: "0.825rem", color: "#fecaca", lineHeight: 1.5 }}>{item.reason}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB: Testing Plan */}
      {tab === "testing" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {testingPlan.length === 0 ? (
            <div style={{ color: "#64748b", fontSize: 13, textAlign: "center", padding: 30 }}>No testing plan steps provided.</div>
          ) : (
            testingPlan.map((step, i) => (
              <div key={i} style={{
                background: "rgba(30, 41, 59, 0.6)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "14px",
                padding: "16px 20px",
                display: "flex",
                gap: 14,
                alignItems: "center"
              }}>
                <div style={{
                  background: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
                  color: "#ffffff",
                  borderRadius: "50%",
                  width: 30,
                  height: 30,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.85rem",
                  fontWeight: 800,
                  flexShrink: 0,
                  boxShadow: "0 0 12px rgba(2, 132, 199, 0.4)"
                }}>
                  {i + 1}
                </div>
                <div style={{ fontSize: "0.875rem", color: "#e2e8f0", lineHeight: 1.6, fontWeight: 600 }}>
                  {step}
                </div>
              </div>
            ))
          )}
        </div>
      )}

    </div>
  );
}