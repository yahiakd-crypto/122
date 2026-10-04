"use client";
import { useState, useRef, useEffect, useCallback } from "react";

const STORAGE_KEY = (pid) => `lib:${pid}`;

function loadLib(pid) {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY(pid)) || "null") || { images: [], copies: [] };
  } catch {
    return { images: [], copies: [] };
  }
}
function saveLib(pid, data) {
  try { localStorage.setItem(STORAGE_KEY(pid), JSON.stringify(data)); } catch {}
}

function useCopied() {
  const [id, setId] = useState(null);
  const copy = useCallback((uid, text) => {
    if (navigator.clipboard) navigator.clipboard.writeText(text).catch(() => {});
    setId(uid);
    setTimeout(() => setId((c) => (c === uid ? null : c)), 1600);
  }, []);
  return { copiedId: id, copy };
}

export default function WorkspaceLibrary({ projectId, fullPage = false }) {
  const [lib, setLib] = useState(() => loadLib(projectId));
  const [tab, setTab] = useState("images");
  const [addCopyOpen, setAddCopyOpen] = useState(false);
  const [copyTitle, setCopyTitle] = useState("");
  const [copyText, setCopyText] = useState("");
  const [dragging, setDragging] = useState(false);
  const [lightbox, setLightbox] = useState(null); // src string
  const fileRef = useRef(null);
  const { copiedId, copy } = useCopied();

  useEffect(() => { saveLib(projectId, lib); }, [projectId, lib]);

  /* ── Image upload ── */
  const handleFiles = (files) => {
    [...files].forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const max = 1200;
          let { width, height } = img;
          if (width > max || height > max) {
            const r = Math.min(max / width, max / height);
            width = Math.round(width * r); height = Math.round(height * r);
          }
          const c = document.createElement("canvas");
          c.width = width; c.height = height;
          c.getContext("2d").drawImage(img, 0, 0, width, height);
          const dataUrl = c.toDataURL("image/jpeg", 0.85);
          setLib((l) => ({
            ...l,
            images: [{ id: Date.now() + Math.random(), name: file.name, src: dataUrl, addedAt: Date.now() }, ...l.images],
          }));
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const addCopy = () => {
    if (!copyText.trim()) return;
    setLib((l) => ({
      ...l,
      copies: [{ id: Date.now(), title: copyTitle.trim() || "Untitled", text: copyText.trim(), addedAt: Date.now() }, ...l.copies],
    }));
    setCopyTitle(""); setCopyText(""); setAddCopyOpen(false);
  };

  const delImage = (id) => setLib((l) => ({ ...l, images: l.images.filter((x) => x.id !== id) }));
  const delCopy  = (id) => setLib((l) => ({ ...l, copies: l.copies.filter((x) => x.id !== id) }));

  const TABS = [
    { key: "images", label: "🖼 Images", count: lib.images.length },
    { key: "copy",   label: "📋 Ad Copy", count: lib.copies.length },
  ];

  return (
    <div className="content-wrap">
      {/* ── Page header ── */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: "0 0 4px" }}>📚 Library</h1>
        <p className="muted small" style={{ margin: 0 }}>
          Save reference images and ad copy snippets for this project. Stored locally in your browser.
        </p>
      </div>

      {/* ── Tab bar ── */}
      <div className="tabs" style={{ marginBottom: 20 }}>
        {TABS.map(({ key, label, count }) => (
          <button
            key={key}
            className={`tab ${tab === key ? "active" : ""}`}
            onClick={() => setTab(key)}
          >
            {label}
            <span className="small muted" style={{ marginLeft: 6 }}>({count})</span>
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════
          IMAGES TAB
      ══════════════════════════════════════ */}
      {tab === "images" && (
        <div>
          {/* Upload zone */}
          <div
            className="card"
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
            style={{
              border: `2px dashed ${dragging ? "var(--primary)" : "var(--border-strong)"}`,
              background: dragging ? "var(--primary-soft, #eef2ff)" : "var(--surface-2)",
              cursor: "pointer", textAlign: "center", padding: "32px 20px",
              marginBottom: 24, transition: "all .15s",
            }}
          >
            <div style={{ fontSize: 40, marginBottom: 8 }}>🖼</div>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>
              {dragging ? "Drop images here" : "Click or drag & drop to upload images"}
            </div>
            <div className="muted small">JPG, PNG, GIF, WebP · auto-compressed · stored locally</div>
            <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: "none" }}
              onChange={(e) => { handleFiles(e.target.files); e.target.value = ""; }} />
          </div>

          {/* Image grid */}
          {lib.images.length === 0 ? (
            <div className="card empty">
              <div className="empty-icon">🖼</div>
              <h3>No images yet</h3>
              <p className="muted">Upload reference images, ad mockups, or product photos to keep them handy.</p>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span className="small muted">{lib.images.length} image{lib.images.length !== 1 ? "s" : ""}</span>
                <button className="btn btn-sm btn-danger" onClick={() => { if (confirm("Clear all images?")) setLib((l) => ({ ...l, images: [] })); }}>
                  Clear all
                </button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
                {lib.images.map((img) => (
                  <div key={img.id} className="card" style={{ padding: 0, overflow: "hidden", cursor: "pointer" }}>
                    <div style={{ position: "relative" }} onClick={() => setLightbox(img.src)}>
                      <img
                        src={img.src}
                        alt={img.name}
                        style={{ width: "100%", height: 160, objectFit: "cover", display: "block" }}
                      />
                      <div style={{
                        position: "absolute", inset: 0, background: "rgba(0,0,0,0)",
                        transition: "background .15s", display: "flex", alignItems: "center", justifyContent: "center",
                      }}
                        onMouseEnter={(e) => e.currentTarget.style.background = "rgba(0,0,0,0.25)"}
                        onMouseLeave={(e) => e.currentTarget.style.background = "rgba(0,0,0,0)"}
                      >
                        <span style={{ color: "#fff", fontSize: 22, opacity: 0, transition: "opacity .15s" }}
                          onMouseEnter={(e) => { e.currentTarget.style.opacity = 1; }}
                          onMouseLeave={(e) => { e.currentTarget.style.opacity = 0; }}
                        >🔍</span>
                      </div>
                    </div>
                    <div style={{ padding: "8px 10px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                      <span style={{ fontSize: 11.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "var(--muted)", flex: 1 }}>
                        {img.name}
                      </span>
                      <button
                        onClick={() => delImage(img.id)}
                        style={{ background: "none", border: "none", color: "var(--danger, #dc2626)", cursor: "pointer", fontSize: 16, padding: "0 2px", fontWeight: 800, flexShrink: 0 }}
                        aria-label="Remove image"
                      >×</button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════
          AD COPY TAB
      ══════════════════════════════════════ */}
      {tab === "copy" && (
        <div>
          {/* Add form */}
          {addCopyOpen ? (
            <div className="card" style={{ marginBottom: 20 }}>
              <h3 style={{ margin: "0 0 14px" }}>Add Ad Copy</h3>
              <div className="field" style={{ marginBottom: 10 }}>
                <label className="lbl" htmlFor="lib-copy-title">Label</label>
                <input id="lib-copy-title" className="input" placeholder='E.g. "Hero Headline A", "CTA Variant 2"'
                  value={copyTitle} onChange={(e) => setCopyTitle(e.target.value)} />
              </div>
              <div className="field" style={{ marginBottom: 14 }}>
                <label className="lbl" htmlFor="lib-copy-text">Copy text</label>
                <textarea id="lib-copy-text" className="textarea" rows={5}
                  placeholder="Paste your headline, body copy, CTA or any ad text here…"
                  value={copyText} onChange={(e) => setCopyText(e.target.value)} />
              </div>
              <div className="row">
                <button className="btn btn-primary" onClick={addCopy} disabled={!copyText.trim()}>Save to Library</button>
                <button className="btn" onClick={() => { setAddCopyOpen(false); setCopyTitle(""); setCopyText(""); }}>Cancel</button>
              </div>
            </div>
          ) : (
            <button className="btn btn-primary" style={{ marginBottom: 20 }} onClick={() => setAddCopyOpen(true)}>
              + Add Ad Copy
            </button>
          )}

          {lib.copies.length === 0 ? (
            <div className="card empty">
              <div className="empty-icon">📋</div>
              <h3>No copy saved yet</h3>
              <p className="muted">Save headlines, CTAs, hooks and any ad copy you want to keep handy while building.</p>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span className="small muted">{lib.copies.length} snippet{lib.copies.length !== 1 ? "s" : ""}</span>
                <button className="btn btn-sm btn-danger" onClick={() => { if (confirm("Clear all copy snippets?")) setLib((l) => ({ ...l, copies: [] })); }}>
                  Clear all
                </button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {lib.copies.map((item) => (
                  <div key={item.id} className="card" style={{ padding: 0, overflow: "hidden" }}>
                    {/* Title bar */}
                    <div style={{
                      padding: "10px 16px",
                      background: "var(--surface-2)",
                      borderBottom: "1px solid var(--border)",
                      display: "flex", alignItems: "center", gap: 10,
                    }}>
                      <span style={{ fontWeight: 700, fontSize: 13, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {item.title}
                      </span>
                      <button
                        className="btn btn-sm btn-primary"
                        style={{ flexShrink: 0, minWidth: 80 }}
                        onClick={() => copy(item.id, item.text)}
                      >
                        {copiedId === item.id ? "✓ Copied!" : "Copy"}
                      </button>
                      <button
                        style={{ background: "none", border: "none", color: "var(--danger, #dc2626)", cursor: "pointer", fontSize: 18, fontWeight: 800, padding: "0 4px", flexShrink: 0 }}
                        onClick={() => delCopy(item.id)}
                        aria-label="Delete snippet"
                      >×</button>
                    </div>
                    {/* Text */}
                    <div style={{
                      padding: "14px 16px",
                      fontSize: 13.5, lineHeight: 1.7,
                      whiteSpace: "pre-wrap", wordBreak: "break-word",
                      color: "var(--text)",
                      direction: /[\u0600-\u06FF]/.test(item.text) ? "rtl" : "ltr",
                      maxHeight: 220, overflowY: "auto",
                    }}>
                      {item.text}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Lightbox ── */}
      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          style={{
            position: "fixed", inset: 0, zIndex: 9999,
            background: "rgba(0,0,0,0.85)",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "zoom-out",
          }}
        >
          <img src={lightbox} alt="Preview"
            style={{ maxWidth: "90vw", maxHeight: "90vh", borderRadius: 12, boxShadow: "0 8px 60px rgba(0,0,0,0.5)" }}
          />
        </div>
      )}
    </div>
  );
}
