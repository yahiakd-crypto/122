import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { SECTIONS } from "@/lib/client/constants";
import { Icon } from "./icons";
import { statusTone } from "@/lib/client/constants";

export default function Sidebar({ projectId, currentNum, sections, project, mobileOpen, onClose }) {
  const router = useRouter();
  const [expanded, setExpanded] = useState({
    workspace: true,
    research: true,
    studio: true,
    settings: true
  });

  const doneCount = Object.values(sections || {}).filter((s) => s.status === "completed").length;
  const pct = Math.round((doneCount / 17) * 100);

  const nav = (path) => {
    router.push(path);
    if (onClose) onClose();
  };

  const toggle = (key) => setExpanded(prev => ({ ...prev, [key]: !prev[key] }));

  return (
    <>
      <style>{`
        .bw-sidebar {
          width: 280px;
          height: 100vh;
          background: #ffffff;
          display: flex;
          flex-direction: column;
          overflow-y: auto;
          font-family: 'Inter', sans-serif;
          border-right: 1px solid #f3f4f6;
          padding: 24px 20px;
          transition: transform 0.3s ease;
        }
        .bw-sidebar::-webkit-scrollbar { width: 4px; }
        .bw-sidebar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 4px; }
        
        .bw-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          padding-bottom: 24px;
          border-bottom: 1px dashed #e5e7eb;
          margin-bottom: 24px;
        }
        .bw-brand-icon {
          width: 32px;
          height: 32px;
          background: #000;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
        }
        .bw-brand-text {
          font-size: 18px;
          font-weight: 800;
          color: #111827;
          letter-spacing: -0.02em;
        }

        .bw-section {
          margin-bottom: 24px;
        }
        .bw-section-divider {
          border-bottom: 1px dashed #e5e7eb;
          margin: 24px 0;
        }
        
        .bw-group-header {
          display: flex;
          align-items: center;
          padding: 10px 12px;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          color: #4b5563;
          font-weight: 600;
          font-size: 14px;
        }
        .bw-group-header:hover {
          background: #f9fafb;
          color: #111827;
        }
        .bw-group-header.active {
          background: #f3f4f6;
          color: #111827;
        }
        .bw-icon-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          margin-right: 12px;
          color: inherit;
        }
        
        .bw-badge {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          padding: 2px 6px;
          font-size: 11px;
          font-weight: 600;
          color: #6b7280;
          margin-left: auto;
          margin-right: 8px;
        }

        .bw-chevron {
          width: 16px;
          height: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #9ca3af;
          transition: transform 0.2s;
        }
        .bw-chevron.open {
          transform: rotate(180deg);
        }

        .bw-tree {
          position: relative;
          padding-left: 23px; /* align with center of parent icon (12px padding + 12px half icon - 1px border) */
          margin-top: 4px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .bw-tree::before {
          content: '';
          position: absolute;
          left: 23px;
          top: 0;
          bottom: 16px;
          width: 1px;
          background: #e5e7eb;
        }

        .bw-tree-item {
          position: relative;
          display: flex;
          align-items: center;
          padding: 8px 12px 8px 16px;
          font-size: 13px;
          font-weight: 500;
          color: #6b7280;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-left: 16px;
        }
        .bw-tree-item::before {
          content: '';
          position: absolute;
          left: -16px;
          top: 50%;
          width: 16px;
          height: 1px;
          background: #e5e7eb;
        }
        .bw-tree-item:hover {
          color: #111827;
        }
        .bw-tree-item.active {
          color: #111827;
          font-weight: 600;
          background: #f9fafb;
        }

        .bw-label {
          font-size: 12px;
          font-weight: 600;
          color: #9ca3af;
          margin-bottom: 12px;
          padding-left: 12px;
        }

        .bw-standalone-item {
          display: flex;
          align-items: center;
          padding: 10px 12px;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          color: #111827;
          font-weight: 600;
          font-size: 14px;
        }
        .bw-standalone-item:hover {
          background: #f9fafb;
        }

        .bw-folder-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 12px;
        }
      `}</style>

      <aside className={`bw-sidebar ${mobileOpen ? "mobile-open" : ""}`} aria-label="Workflow navigation">
        <div className="bw-brand">
          <div className="bw-brand-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
          </div>
          <div className="bw-brand-text">AI Strategy Lab</div>
        </div>

        {/* Workspace Section */}
        <div className="bw-section">
          <div className={`bw-group-header ${expanded.workspace ? 'active' : ''}`} onClick={() => toggle('workspace')}>
            <div className="bw-icon-wrap"><Icon.Dashboard /></div>
            <span>Workspace</span>
            <div className={`bw-chevron ${expanded.workspace ? 'open' : ''}`}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </div>
          </div>
          {expanded.workspace && (
            <div className="bw-tree">
              <div className="bw-tree-item" onClick={() => nav("/")}>Dashboard</div>
              <div className="bw-tree-item" onClick={() => nav(`/projects/${projectId}/office`)}>AI Office (3D)</div>
              <div className="bw-tree-item" onClick={() => nav(`/projects/${projectId}/report`)}>Final Report</div>
              <div className="bw-tree-item" onClick={() => nav(`/projects/${projectId}/favorites`)}>Favorites</div>
              <div className="bw-tree-item" onClick={() => nav(`/projects/${projectId}/library`)}>Library</div>
              <div className="bw-tree-item" onClick={() => nav(`/board`)}>Product Board</div>
            </div>
          )}
        </div>

        {/* Research Sections */}
        <div className="bw-section">
          <div className={`bw-group-header ${expanded.research ? 'active' : ''}`} onClick={() => toggle('research')}>
            <div className="bw-icon-wrap">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            </div>
            <span>Research</span>
            <div className="bw-badge">{doneCount}/17</div>
            <div className={`bw-chevron ${expanded.research ? 'open' : ''}`}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </div>
          </div>
          {expanded.research && (
            <div className="bw-tree">
              {SECTIONS.map((s) => {
                const active = currentNum === s.num;
                return (
                  <div key={s.num} className={`bw-tree-item ${active ? "active" : ""}`} onClick={() => nav(`/projects/${projectId}/sections/${s.num}`)}>
                    <span style={{ flexGrow: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.title}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bw-section-divider"></div>

        {/* AI Studio */}
        <div className="bw-label">AI Studio</div>
        <div className="bw-section" style={{ marginBottom: 12 }}>
          <div className="bw-standalone-item" onClick={() => nav(`/projects/${projectId}/ai-studio/generate`)}>
            <div className="bw-folder-icon" style={{ color: '#8b5cf6' }}>
              <Icon.Sparkle />
            </div>
            Generate Image
          </div>
          <div className="bw-standalone-item" onClick={() => nav(`/projects/${projectId}/ai-studio/generations`)}>
            <div className="bw-folder-icon" style={{ color: '#f97316' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
            </div>
            Generations
          </div>
        </div>

        <div className="bw-section-divider"></div>

        {/* Settings */}
        <div className="bw-label">Configuration</div>
        <div className="bw-section">
          <div className="bw-standalone-item" onClick={() => nav(`/projects/${projectId}/settings/ai`)}>
            <div className="bw-folder-icon" style={{ color: '#10b981' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
            </div>
            AI Parameters
          </div>
          <div className="bw-standalone-item" onClick={() => nav(`/projects/${projectId}/product`)}>
            <div className="bw-folder-icon" style={{ color: '#6b7280' }}>
              <Icon.Gear />
            </div>
            Product Setup
          </div>
        </div>

      </aside>
    </>
  );
}