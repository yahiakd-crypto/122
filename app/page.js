"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/client/api";
import { Icon } from "@/components/icons";
import { useApp } from "@/components/AppContext";
import ProductResearchBoard from "@/components/ProductResearchBoard";


export default function Dashboard() {
  const router = useRouter();
  const { toast } = useApp();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");

  const load = useCallback(async () => {
    try {
      const { projects } = await api.get("/api/projects");
      setProjects(projects || []);
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  const create = async () => {
    setCreating(true);
    try {
      const { project } = await api.post("/api/projects", { name: newName.trim() || "New Project" });
      toast("Project created. Enter your product to begin.");
      router.push(`/projects/${project.id}/product`);
    } catch (e) {
      toast(e.message, "error");
      setCreating(false);
    }
  };

  const del = async (id) => {
    if (!confirm("Delete this project and all its research?")) return;
    await api.del(`/api/projects/${id}`);
    load();
    toast("Project deleted.", "warn");
  };

  const dup = async (id) => {
    const { project } = await api.post(`/api/projects/${id}`, {});
    toast("Project duplicated.");
    load();
    router.push(`/projects/${project.id}/product`);
  };

  const total = projects.length;
  const sectionsDone = projects.reduce((s, p) => s + (p.sectionsDone || 0), 0);
  const avgProgress = total ? Math.round(projects.reduce((s, p) => s + (p.progress || 0), 0) / total) : 0;
  const completed = projects.filter((p) => p.status === "complete").length;
  const inProgress = projects.filter((p) => p.status === "in_progress").length;
  const draft = total - completed - inProgress;

  const donut = [
    { label: "Completed", value: completed, color: "#10b981" },
    { label: "In Progress", value: inProgress, color: "#34d399" },
    { label: "Draft", value: draft, color: "#cbd5e1" },
  ];

  return (
    <div className="app-shell">
      <div style={{ flex: 1, padding: "30px", maxWidth: 1240, margin: "0 auto", width: "100%" }}>
        <div className="dash">
          {/* ── Row 1: Hero + Key insights ── */}
          <div className="dash-row dash-row-top">
            <HeroCard onViewReport={() => router.push(total ? `/projects/${projects[0].id}/sections/1` : "/projects/new")} total={total} />
            <InsightsCard total={total} sectionsDone={sectionsDone} avgProgress={avgProgress} completed={completed} />
          </div>

          {/* ── Row 2: Stat cards ── */}
          <div className="dash-row dash-row-stats">
            <StatCard icon={<Icon.Folder />} tone="p" trend="+1" trendUp label="Total Projects" value={total} />
            <StatCard icon={<Icon.Check />} tone="g" trend="+18%" trendUp label="Sections Completed" value={sectionsDone} />
            <StatCard icon={<Icon.Layers />} tone="t" trend={`${avgProgress}%`} trendUp={avgProgress >= 50} label="Avg. Completion" value={`${avgProgress}%`} />
            <StatCard icon={<Icon.Star />} tone="o" trend="+2" trendUp label="Completed Reports" value={completed} />
          </div>

          {/* ── Row 3: Charts ── */}
          <div className="dash-row dash-row-charts">
            <ProgressChart projects={projects} />
            <StatusDonut segments={donut} total={total} />
          </div>

          {/* ── Projects list ── */}
          <ProjectsSection
            loading={loading}
            projects={projects}
            newName={newName}
            setNewName={setNewName}
            create={create}
            creating={creating}
            onOpen={(id) => router.push(`/projects/${id}/sections/1`)}
            onDel={del}
            onDup={dup}
          />

          {/* ── Product Board ── */}
          <div style={{ marginTop: 40 }}>
            <ProductResearchBoard />
          </div>
        </div>
      </div>
    </div>
  );
}

function HeroCard({ onViewReport, total }) {
  const hour = new Date().getHours();
  const greet = hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";
  return (
    <div className="hero">
      <div className="hero-content">
        <span className="hero-tag">
          <Icon.Sparkle /> Research &amp; CRO Lab
        </span>
        <h1>{greet}, Researcher 👋</h1>
        <p>
          You have <strong style={{ color: "#fff" }}>{total || "no"}</strong> active {total === 1 ? "project" : "projects"}.
          Keep building high-converting landing pages with fresh, data-backed strategy.
        </p>
        <button className="hero-cta" onClick={onViewReport}>
          View Full Report <Icon.Next />
        </button>
      </div>
      <div className="hero-art">
        <HeroIllustration />
      </div>
    </div>
  );
}

function HeroIllustration() {
  return (
    <svg width="240" height="190" viewBox="0 0 240 190" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* upward arrow */}
      <path d="M30 172 L196 172" stroke="rgba(255,255,255,0.25)" strokeWidth="2" strokeLinecap="round" />
      <path d="M210 150 L196 172 L180 156" stroke="#A4F542" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      {/* bar steps */}
      <rect x="40" y="138" width="26" height="34" rx="4" fill="#1d6a4c" />
      <rect x="74" y="112" width="26" height="60" rx="4" fill="#245f47" />
      <rect x="108" y="86" width="26" height="86" rx="4" fill="#1d6a4c" />
      <rect x="142" y="60" width="26" height="112" rx="4" fill="#2d7a5a" />
      {/* briefcase held by runner */}
      <g>
        <rect x="150" y="46" width="22" height="16" rx="3" fill="#E07B39" />
        <rect x="159" y="43" width="4" height="5" rx="1.5" fill="#E07B39" />
        <path d="M142 62 h38 v12 a6 6 0 0 1 -6 6 h-26 a6 6 0 0 1 -6 -6 z" fill="#E07B39" />
      </g>
      {/* runner */}
      <g>
        <circle cx="166" cy="34" r="8" fill="#FFB26B" />
        <path d="M159 46 h14 a7 7 0 0 1 7 7 v2 a9 9 0 0 1 -9 9 h-10 a9 9 0 0 1 -9 -9 v-2 a7 7 0 0 1 7 -7 z" fill="#FFB26B" />
        <path d="M158 30 c3 2 4 4 8 4 c4 0 5 -2 8 -4" stroke="#7a4420" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M160 56 l-14 16 a6 6 0 0 0 8 9 l14 -16" fill="#E07B39" />
        <path d="M172 56 l14 14 a6 6 0 0 1 -9 8 l-13 -13" fill="#C75B2B" />
        <path d="M160 52 l-12 -14 a5 5 0 0 1 9 -4 l13 15" fill="#E07B39" />
      </g>
    </svg>
  );
}

function InsightsCard({ total, sectionsDone, avgProgress, completed }) {
  return (
    <div className="dcard insights">
      <div className="dcard-title" style={{ marginBottom: 8 }}>Key Insights</div>
      <div className="dcard-sub" style={{ marginBottom: 4 }}>Your research workflow at a glance</div>
      <div className="insight-item">
        <div className="insight-ico t"><Icon.Layers /></div>
        <div className="insight-body">
          <div className="insight-value">{avgProgress}%</div>
          <div className="insight-label">Average project completion</div>
          <div className="insight-note">{completed === 0 ? "Finish a project to seed your playbook" : `${completed} report${completed === 1 ? "" : "s"} ready to ship`}</div>
        </div>
      </div>
      <div className="insight-item">
        <div className="insight-ico g"><Icon.Check /></div>
        <div className="insight-body">
          <div className="insight-value">{sectionsDone}<span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600 }}> / {total * 17}</span></div>
          <div className="insight-label">Sections researched</div>
          <div className="insight-note">Across all {total} active projects</div>
        </div>
      </div>
      <div className="insight-item">
        <div className="insight-ico o"><Icon.Sparkle /></div>
        <div className="insight-body">
          <div className="insight-value">{completed * 100 || "—"}</div>
          <div className="insight-label">Strategy points banked</div>
          <div className="insight-note">{total ? "Reuse insights to speed up the next build" : "Create a project to begin"}</div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, tone = "p", trend, trendUp = true, label, value }) {
  return (
    <div className="dcard stat-card">
      <div className="stat-top">
        <span className={`stat-ico ${tone}`}>{icon}</span>
        <span className={`stat-trend ${trendUp ? "" : "down"}`}>
          {trendUp ? "▲" : "▼"} {trend}
        </span>
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

function ProgressChart({ projects }) {
  const shown = projects.slice(0, 7);
  const bars = shown.length ? shown : [];
  return (
    <div className="dcard">
      <div className="dcard-title">Project Progress</div>
      <div className="dcard-sub">Completion rate by research project</div>
      {bars.length === 0 ? (
        <div className="muted small" style={{ padding: "50px 0", textAlign: "center" }}>No projects yet — create one to start tracking progress.</div>
      ) : (
        <div className="bar-chart">
          {bars.map((p, i) => (
            <div className="bar-col" key={p.id} title={`${p.productName || p.name}: ${p.progress}%`}>
              <span className="bar-pct">{p.progress}%</span>
              <div className="bar-track">
                <div className={`bar-fill ${p.status === "complete" ? "g" : p.status === "in_progress" ? "" : "o"}`} style={{ height: `${Math.max(p.progress, 2)}%` }} />
              </div>
              <span className="bar-label">{p.productName || (p.name || "").split(" ")[0]}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusDonut({ segments, total }) {
  const active = segments.filter((s) => s.value > 0);
  const sum = active.reduce((s, a) => s + a.value, 0) || 1;
  const R = 54;
  const C = 2 * Math.PI * R;
  let offset = 0;
  return (
    <div className="dcard">
      <div className="dcard-title">Research Status</div>
      <div className="dcard-sub">Distribution across all projects</div>
      {total === 0 ? (
        <div className="muted small" style={{ padding: "50px 0", textAlign: "center" }}>No data yet</div>
      ) : (
        <div className="donut-wrap">
          <div className="donut">
            <svg width="150" height="150" viewBox="0 0 150 150">
              <circle cx="75" cy="75" r={R} fill="none" stroke="var(--surface-2)" strokeWidth="17" />
              {active.map((s) => {
                const frac = s.value / sum;
                const dash = frac * C;
                const el = (
                  <circle
                    key={s.label}
                    cx="75" cy="75" r={R} fill="none" stroke={s.color} strokeWidth="17"
                    strokeDasharray={`${dash} ${C - dash}`}
                    strokeDashoffset={-offset}
                    transform="rotate(-90 75 75)"
                    strokeLinecap="butt"
                  />
                );
                offset += dash;
                return el;
              })}
            </svg>
            <div className="donut-center">
              <div>
                <div className="donut-val">{total}</div>
                <div className="donut-sublbl">projects</div>
              </div>
            </div>
          </div>
          <div className="legend">
            {segments.map((s) => (
              <div className="legend-item" key={s.label}>
                <span className="legend-dot" style={{ background: s.color }} />
                {s.label}
                <span className="legend-count">{s.value}</span>
                <span className="legend-pct">{Math.round((s.value / sum) * 100)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ProjectsSection({ loading, projects, newName, setNewName, create, creating, onOpen, onDel, onDup }) {
  return (
    <div className="dcard" style={{ padding: 0, overflow: "hidden" }}>
      <div className="row-between" style={{ padding: "20px 22px", borderBottom: "1px solid var(--border)" }}>
        <div>
          <h2 style={{ margin: 0 }}>Projects</h2>
          <div className="muted small">Research once, build landing pages that convert.</div>
        </div>
        <div className="row">
          <input
            className="input" style={{ width: 220 }}
            placeholder="Project name…" value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && create()}
            aria-label="New project name"
          />
          <button className="btn btn-primary" onClick={create} disabled={creating}>
            <Icon.Plus /> {creating ? "Creating…" : "New Project"}
          </button>
        </div>
      </div>

      <div style={{ padding: "22px" }}>
        {loading ? (
          <div className="grid-3">
            {[...Array(3)].map((_, i) => <div key={i} className="card" style={{ height: 150 }}><div className="skeleton" style={{ height: 90 }} /></div>)}
          </div>
        ) : projects.length === 0 ? (
          <div className="card empty" style={{ border: "1px dashed var(--border-strong)" }}>
            <div className="empty-icon">◈</div>
            <h2>Start your first research project</h2>
            <p className="muted">
              Enter a product, configure your AI provider, then work through 17 research sections to build a high-converting landing page strategy.
            </p>
            <button className="btn btn-primary btn-lg" onClick={create}><Icon.Plus /> Create Project</button>
          </div>
        ) : (
          <div className="grid-3">
            {projects.map((p) => (
              <ProjectCard key={p.id} p={p} onOpen={() => onOpen(p.id)} onDel={() => onDel(p.id)} onDup={() => onDup(p.id)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ProjectCard({ p, onOpen, onDel, onDup }) {
  const statusBadge =
    p.status === "complete" ? <span className="badge badge-success">Complete</span> :
    p.status === "in_progress" ? <span className="badge badge-info">In Progress</span> :
    <span className="badge badge-muted">Draft</span>;

  return (
    <div className="card card-hover" style={{ padding: 0, overflow: "hidden" }}>
      {/* ── Product image banner ── */}
      <div style={{ position: "relative", width: "100%", height: 160, overflow: "hidden", flexShrink: 0 }}>
        {p.productImage ? (
          <img
            src={p.productImage}
            alt={p.productName || "Product"}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        ) : (
          <div style={{
            width: "100%", height: "100%",
            background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-strong) 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 52, fontWeight: 800, color: "rgba(255,255,255,0.35)",
            letterSpacing: -2,
          }}>
            {p.productName ? p.productName[0].toUpperCase() : "P"}
          </div>
        )}
        {/* Status badge overlay */}
        <div style={{ position: "absolute", top: 10, right: 10 }}>{statusBadge}</div>
        {/* Dark gradient overlay for text legibility */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: 60,
          background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 100%)",
        }} />
      </div>

      {/* ── Card body ── */}
      <div style={{ padding: "14px 16px" }}>
        <h3 style={{ margin: "0 0 4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: 15 }}>
          {p.productName || p.name}
        </h3>
        <div className="muted small" style={{ marginBottom: 10 }}>
          {p.productName ? p.name : "No product yet"} · S{p.sectionsDone}/17 · {p.progress}%
        </div>
        <div className="progress-track" style={{ marginBottom: 12 }}>
          <div className="progress-fill" style={{ width: `${p.progress}%` }} />
        </div>
        <div className="row wrap">
          <button className="btn btn-sm btn-primary" onClick={onOpen}><span className="small" style={{ fontWeight: 600 }}>Open</span></button>
          <button className="btn btn-sm" onClick={onDup} aria-label="Duplicate project"><Icon.Copy /></button>
          <button className="btn btn-sm" onClick={() => api.download(`/api/projects/${p.id}/export?format=json`, "report.json")} aria-label="Export JSON"><Icon.Download /></button>
          <button className="btn btn-sm btn-danger" onClick={onDel} aria-label="Delete project"><Icon.Trash /></button>
        </div>
      </div>
    </div>
  );
}

