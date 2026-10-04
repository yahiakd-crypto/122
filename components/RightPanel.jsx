import { SECTIONS } from "@/lib/client/constants";

function Field({ label, children }) {
  return (
    <div className="mb-8">
      <div className="small muted" style={{ fontWeight: 700, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
      <div style={{ fontSize: 13, marginTop: 2 }}>{children}</div>
    </div>
  );
}

export default function RightPanel({ product, section, sectionNum, modelLabel, aiConfig }) {
  const current = SECTIONS.find((s) => s.num === (sectionNum || section?.num));
  const status = section?.status || "not_started";

  return (
    <aside className="right-panel" aria-label="Context panel">
      {product?.name ? (
        <div className="card" style={{ padding: 14 }}>
          <div className="row" style={{ marginBottom: 10 }}>
            {product.images?.[0] ? (
              <img src={product.images[0]} alt={product.name} style={{ width: 44, height: 44, borderRadius: 10, objectFit: "cover", border: "1px solid var(--border)" }} />
            ) : (
              <div className="avatar">{product.name[0] || "?"}</div>
            )}
            <div style={{ minWidth: 0 }}>
              <div className="small" style={{ fontSize: 11, color: "var(--muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.05 }}>Product</div>
              <div className="small" style={{ fontWeight: 800, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{product.name}</div>
            </div>
          </div>
          <Field label="Category">{product.category || "—"}</Field>
          <Field label="Price">
            {product.price ? `${product.price} ${product.currency}` : "—"}
          </Field>
          <Field label="Market">
            {[product.targetCountry, product.targetMarket].filter(Boolean).join(" / ") || "—"}
          </Field>
          <Field label="Audience">{product.targetAudience || "—"}</Field>
          <Field label="USP">
            <span style={{ display: "block", maxHeight: 60, overflow: "hidden" }}>{product.usp || "—"}</span>
          </Field>
          <Field label="Status">
            <span className={`badge ${status === "completed" ? "badge-success" : status === "in_progress" ? "badge-warn" : "badge-muted"}`}>
              <span className={`dot ${status === "completed" ? "dot-success" : status === "in_progress" ? "dot-warn" : "dot-muted"}`} />
              {status === "completed" ? "Analysis complete" : status === "in_progress" ? "Analysis in progress" : status === "skipped" ? "Skipped" : "Not started"}
            </span>
          </Field>
        </div>
      ) : null}

      <div className="card" style={{ padding: 14 }}>
        <Field label="Current Section">{current ? `${String(current.num).padStart(2, "0")} · ${current.title}` : "—"}</Field>
        <Field label="AI Model"><span className="mono small" style={{ wordBreak: "break-all" }}>{modelLabel || (aiConfig?.model) || "—"}</span></Field>
        <Field label="Provider">{aiConfig?.provider || "—"}</Field>
      </div>

      {section?.sources?.length > 0 && (
        <div className="card" style={{ padding: 14 }}>
          <Field label={`Sources (${section.sources.length})`}>
            <div style={{ maxHeight: 180, overflowY: "auto" }}>
              {section.sources.map((tmp, i) => (
                <div key={i} className="small" style={{ marginBottom: 6 }}>
                  <div style={{ fontWeight: 650 }}>{tmp.name}</div>
                  <a href={tmp.url} target="_blank" rel="noreferrer" className="small" style={{ fontSize: 11 }}>
                    {tmp.url}
                  </a>
                  <div className="muted small" style={{ fontSize: 11 }}>{tmp.claim}</div>
                </div>
              ))}
            </div>
          </Field>
        </div>
      )}

      {section?.cost && (
        <div className="card" style={{ padding: 14 }}>
          <Field label="Last AI call">
            <div className="small" style={{ fontSize: 12 }}>
              <div className="row-between"><span className="muted">Model</span><span className="mono small">{section.cost.model}</span></div>
              <div className="row-between"><span className="muted">Tokens</span><span className="mono small">↑{section.cost.inputTokens} ↓{section.cost.outputTokens}</span></div>
              <div className="row-between"><span className="muted">Estimated</span><span className="mono small">${section.cost.usd.toFixed(4)}</span></div>
              <div className="row-between"><span className="muted">Time</span><span className="small">{(section.cost.elapsedMs / 1000).toFixed(1)}s</span></div>
            </div>
          </Field>
        </div>
      )}
    </aside>
  );
}