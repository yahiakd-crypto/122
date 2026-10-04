"use client";
import { statusTone } from "@/lib/client/constants";

export default function AIOfficeDepartment({ section, status, isSelected, onClick }) {
  const isRunning = status === "in_progress";
  const isDone = status === "completed";
  const isError = status === "error";

  // State colors
  let statusDotColor = "#94a3b8"; // default idle (grey)
  if (isRunning) statusDotColor = "#eab308"; // running (yellow/orange)
  if (isDone) statusDotColor = "#22c55e"; // done (green)
  if (isError) statusDotColor = "#ef4444"; // error (red)

  // Generate desk layout based on section num (pseudo-random)
  const agentCount = (section.num % 4) + 2; // 2 to 5 agents
  
  // Custom SVG desk render with animated agents
  const renderDesks = () => {
    const desks = [];
    for (let i = 0; i < agentCount; i++) {
      const row = Math.floor(i / 2);
      const col = i % 2;
      const x = 30 + col * 70;
      const y = 40 + row * 60;
      
      // Give each agent a random delay and slightly different animation path
      const delay = `-${Math.random() * 5}s`;
      const walkClass = isRunning ? (i % 2 === 0 ? "agent-walk-fast-x" : "agent-walk-fast-y") : "agent-walk-idle";

      desks.push(
        <g key={i} transform={`translate(${x}, ${y})`}>
          {/* Desk shadow */}
          <rect x="-5" y="10" width="45" height="25" fill="rgba(0,0,0,0.1)" rx="2" />
          {/* Desk top */}
          <rect x="0" y="0" width="40" height="20" fill="#d97706" rx="2" />
          {/* Desk side */}
          <rect x="0" y="20" width="40" height="5" fill="#b45309" rx="0" />
          {/* Monitor */}
          <rect x="15" y="5" width="10" height="12" fill="#1e293b" rx="1" />
          
          {/* Plant */}
          {i % 3 === 0 && <circle cx="5" cy="5" r="4" fill="#15803d" />}

          {/* Animated 3D Agent */}
          <g className={walkClass} style={{ animationDelay: delay, transformOrigin: "20px 30px" }}>
            {/* Agent Shadow */}
            <ellipse cx="20" cy="34" rx="8" ry="4" fill="rgba(0,0,0,0.2)" />
            {/* Agent Body */}
            <circle cx="20" cy="30" r="6" fill="#334155" />
            {/* Agent Head (gives a 3D perspective effect) */}
            <circle cx="20" cy="26" r="4" fill="#cbd5e1" />
          </g>
        </g>
      );
    }
    return desks;
  };

  return (
    <div 
      className={`office-dept ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
      style={{
        position: "relative",
        width: 180,
        height: 140,
        cursor: "pointer",
        transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        transform: isSelected ? "translateZ(30px) scale(1.05)" : "translateZ(0) scale(1)",
        zIndex: isSelected ? 10 : 1,
      }}
    >
      {/* ── 1. The Physical Beige Slab ── */}
      {/* Top Face */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: "#e8cba5", // warm sand
        borderRadius: "4px",
        boxShadow: "inset 0 0 20px rgba(255,255,255,0.4)", // soft inner light
        overflow: "hidden",
      }}>
        {/* Draw SVG Desks */}
        <svg width="100%" height="100%" style={{ position: "absolute", top: 0, left: 0 }}>
          {renderDesks()}
        </svg>
      </div>

      {/* Front/Bottom Extrusion (CSS 3D illusion) */}
      <div style={{
        position: "absolute",
        left: 0, right: 0, top: "100%", height: 12,
        background: "#cda67b",
        borderRadius: "0 0 4px 4px",
        transformOrigin: "top",
        transform: "rotateX(-90deg)", // Fold down
      }} />

      {/* Right Extrusion */}
      <div style={{
        position: "absolute",
        top: 0, bottom: 0, left: "100%", width: 12,
        background: "#e0c19a",
        borderRadius: "0 4px 4px 0",
        transformOrigin: "left",
        transform: "rotateY(90deg)", // Fold right
      }} />

      {/* Floor Shadow */}
      <div style={{
        position: "absolute",
        inset: -10,
        background: "rgba(0,0,0,0.15)",
        filter: "blur(12px)",
        transform: "translateZ(-1px)",
        pointerEvents: "none",
        zIndex: -1,
      }} />

      {/* ── 2. Floating Glass Data Card ── */}
      <div style={{
        position: "absolute",
        top: -60, left: "50%",
        transform: "translateX(-50%) translateZ(60px) rotateX(-60deg) rotateZ(45deg)", // Counter-rotate to face camera perfectly
        width: 140,
        background: "rgba(255, 255, 255, 0.9)",
        backdropFilter: "blur(8px)",
        border: "1px solid rgba(255, 255, 255, 1)",
        borderRadius: 8,
        padding: "10px 12px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.1), 0 1px 3px rgba(0,0,0,0.05)",
        color: "#475569",
        pointerEvents: "none", // Let clicks pass to the slab
      }}>
        
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8, borderBottom: "1px solid #e2e8f0", paddingBottom: 6 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: statusDotColor, boxShadow: `0 0 6px ${statusDotColor}` }} />
          <div style={{ fontSize: 9, fontWeight: 800, fontFamily: "monospace", letterSpacing: 0.5, textTransform: "uppercase", color: "#64748b" }}>
            {section.short}
          </div>
        </div>

        {/* Metrics */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
          <div style={{ fontSize: 20, fontWeight: 900, color: "#1a2332", lineHeight: 1 }}>{agentCount}</div>
          <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: 0.5, color: "#94a3b8" }}>AGENTS</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 8, fontFamily: "monospace", color: "#64748b" }}>
            <span>TASKS IN QUEUE</span>
            <strong>{isRunning ? 1 : 0}</strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 8, fontFamily: "monospace", color: "#64748b" }}>
            <span>PROCESSING COST</span>
            <strong>$0.{section.num}4</strong>
          </div>
        </div>

      </div>

    </div>
  );
}
