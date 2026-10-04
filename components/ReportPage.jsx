"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useShell } from "./ProjectShell";
import { useApp } from "./AppContext";
import { api } from "@/lib/client/api";
import { Icon } from "./icons";
import { RichText } from "./renderers";

export default function ReportPage({ projectId }) {
  const router = useRouter();
  const { toast } = useApp();
  const { sections, product, project, aiConfig } = useShell();
  const [assembled, setAssembled] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await api.get(`/api/projects/${projectId}/report`);
      setAssembled(data.assembled);
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setLoading(false);
    }
  }, [projectId, toast]);

  useEffect(() => { load(); }, [load]);

  const generate = async () => {
    setGenerating(true);
    try {
      await api.post(`/api/projects/${projectId}/report`, {});
      toast("Final report synthesized.");
      await load();
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setGenerating(false);
    }
  };

  const doneCount = Object.values(sections || {}).filter((s) => s.status === "completed").length;
  const execDone = Boolean(assembled?.sections?.find((s) => s.heading === "Executive Summary")?.done);

  const printPdf = () => {
    window.open(`/api/projects/${projectId}/export?format=pdf`, "_blank");
  };

  const copyReport = async () => {
    const raw = await api.get(`/api/projects/${projectId}/export?format=txt`);
    await api.copy(raw);
    toast("Full report copied.");
  };

  if (loading) return <div className="content-wrap"><div className="card"><div className="skeleton" style={{ height: 300 }} /></div></div>;

  return (
    <div className="content-wrap">
      <div style={{ marginBottom: 18 }}>
        <h1>Final Report</h1>
        <p className="muted small">
          Combines your approved section outputs into a structured professional report. {doneCount}/17 sections completed.
        </p>
      </div>

      <div className="stats-row">
        <div className="stat-card"><div className="stat-value">{doneCount}/17</div><div className="stat-label">Sections done</div></div>
        <div className="stat-card"><div className="stat-value">{project?.status === "complete" ? "100%" : `${Math.round((doneCount / 17) * 100)}%`}</div><div className="stat-label">Workflow progress</div></div>
        <div className="stat-card"><div className="stat-value">{product?.name || "—"}</div><div style={{ fontSize: 12 }} className="stat-label">Product</div></div>
        <div className="stat-card"><div className="stat-value">{execDone ? "✓" : "○"}</div><div className="stat-label">Executive summary</div></div>
      </div>

      <div className="card" style={{ marginBottom: 18 }}>
        <div className="row-between wrap">
          <div>
            <h3 style={{ margin: 0 }}>Executive Summary &amp; Final Recommendations</h3>
            <div className="small muted">{execDone ? "Generated from your research package" : "Synthesized from all approved sections"}</div>
          </div>
          <div className="row">
            <button className="btn btn-primary" onClick={generate} disabled={generating}>
              {generating ? <span className="spin" /> : <Icon.Sparkle />} {generating ? "Synthesizing…" : "GENERATE FINAL REPORT"}
            </button>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 18 }}>
        <div className="row wrap">
          <button className="btn" onClick={() => api.download(`/api/projects/${projectId}/export?format=txt`, "ai-product-research-report.txt")}><Icon.Download /> Export TXT</button>
          <button className="btn" onClick={() => api.download(`/api/projects/${projectId}/export?format=md`, "ai-product-research-report.md")}><Icon.Download /> Export Markdown</button>
          <button className="btn" onClick={() => api.download(`/api/projects/${projectId}/export?format=json`, "ai-product-research-report.json")}><Icon.Download /> Export JSON</button>
          <button className="btn" onClick={printPdf}><Icon.Download /> Export PDF (print)</button>
          <button className="btn btn-ghost" onClick={copyReport}><Icon.Copy /> Copy Full Report</button>
        </div>
        <p className="small muted mt-8">
          TXT and Markdown preserve the master workflow structure. PDF opens a print dialog — choose “Save as PDF”.
        </p>
      </div>

      {(assembled?.sections || []).map((s) => (
        <div key={s.heading} className="card" style={{ marginBottom: 14 }}>
          <div className="row-between" style={{ marginBottom: 6 }}>
            <h2 style={{ margin: 0, fontSize: 16 }}>{s.heading}</h2>
            {s.src === 99 ? (
              <span className="badge badge-info">AI synthesis</span>
            ) : s.done ? (
              <button className="btn btn-sm">From Section {String(s.src).padStart(2, "0")} · open →</button>
            ) : (
              <button className="btn btn-sm" onClick={() => s.src <= 17 && router.push(`/projects/${projectId}/sections/${s.src}`)}>Section {String(s.src).padStart(2, "0")} — not done</button>
            )}
          </div>
          {s.done ? <RichText text={s.content} /> : s.src === 99 ? <RichText text={s.content} /> : <p className="muted small">Not completed yet. Run Section {s.src} first.</p>}
        </div>
      ))}

      <div className="mt-16" style={{ paddingBottom: 40 }}>
        <button className="btn btn-secondary btn-lg" onClick={() => router.push(`/projects/${projectId}/sections/1`)}><Icon.Prev /> Back to workflow</button>
      </div>
    </div>
  );
}