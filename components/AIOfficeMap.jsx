"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import { useShell } from "@/components/ProjectShell";
import { SECTIONS } from "@/lib/client/constants";
import AIOfficeDepartment from "./AIOfficeDepartment";
import SectionWorkspace from "./SectionWorkspace";

export default function AIOfficeMap({ projectId }) {
  const { sections, product } = useShell();
  
  // ── Canvas State ──
  const [zoom, setZoom] = useState(0.8);
  const [pan, setPan] = useState({ x: 300, y: 150 });
  const [isIsometric, setIsIsometric] = useState(true);
  const [selectedDept, setSelectedDept] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  const containerRef = useRef(null);
  const isPanning = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });

  // ── Panning & Zooming Logic ──
  const onMouseDown = useCallback((e) => {
    if (e.button !== 0) return;
    if (e.target.closest(".office-department") || e.target.closest("button")) return;
    isPanning.current = true;
    lastMouse.current = { x: e.clientX, y: e.clientY };
    e.preventDefault();
  }, []);

  const onMouseMove = useCallback((e) => {
    if (!isPanning.current) return;
    const dx = e.clientX - lastMouse.current.x;
    const dy = e.clientY - lastMouse.current.y;
    lastMouse.current = { x: e.clientX, y: e.clientY };
    setPan(p => ({ x: p.x + dx, y: p.y + dy }));
  }, []);

  const stopPan = useCallback(() => { isPanning.current = false; }, []);

  const onWheel = useCallback((e) => {
    if (e.target.closest(".drawer-content")) return;
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.05 : 1 / 1.05;
    setZoom(z => Math.min(Math.max(z * factor, 0.3), 3));
  }, []);

  // ── Department Layout (Circle around Orchestrator) ──
  const RADIUS = 450;
  const layout = SECTIONS.map((sec, i) => {
    const angle = (i / SECTIONS.length) * Math.PI * 2;
    return {
      section: sec,
      x: Math.cos(angle) * RADIUS,
      y: Math.sin(angle) * RADIUS,
    };
  });

  // ── Interaction ──
  const handleSelect = (sec, x, y) => {
    setSelectedDept(sec.num);
    setDrawerOpen(true);
    // Center camera on the selected department
    if (containerRef.current) {
      const vw = containerRef.current.clientWidth;
      const vh = containerRef.current.clientHeight;
      // In isometric view, the coordinates are skewed. 
      // This is a rough estimation for centering.
      setPan({
        x: vw / 2 - (x * zoom) - 300, // Shift left to make room for drawer
        y: vh / 2 - (y * zoom),
      });
    }
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setSelectedDept(null);
  };

  // Compute metrics
  const doneCount = Object.values(sections || {}).filter((s) => s.status === "completed").length;
  const pct = Math.round((doneCount / 17) * 100);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", background: "#f8fafc" }}>
      
      {/* ── TOP CONTROLS ── */}
      <div style={{ position: "absolute", top: 20, left: 20, zIndex: 100, display: "flex", gap: 10 }}>
        <button 
          className="btn btn-sm" 
          onClick={() => setIsIsometric(true)}
          style={{ background: isIsometric ? "#1a2332" : "#fff", color: isIsometric ? "#fff" : "#1a2332" }}
        >
          🏢 Office View
        </button>
        <button 
          className="btn btn-sm" 
          onClick={() => setIsIsometric(false)}
          style={{ background: !isIsometric ? "#1a2332" : "#fff", color: !isIsometric ? "#fff" : "#1a2332" }}
        >
          🔗 Workflow View
        </button>
      </div>

      <div style={{ position: "absolute", bottom: 20, left: 20, zIndex: 100, display: "flex", gap: 8 }}>
        <button className="btn btn-icon" onClick={() => setZoom(z => Math.min(z * 1.2, 3))}>+</button>
        <button className="btn btn-icon" onClick={() => setZoom(z => Math.max(z / 1.2, 0.3))}>−</button>
        <button className="btn btn-icon" onClick={() => { setZoom(0.8); setPan({ x: 300, y: 150 }); }}>⌂</button>
      </div>

      {/* ── 3D CANVAS ── */}
      <div
        ref={containerRef}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={stopPan}
        onMouseLeave={stopPan}
        onWheel={onWheel}
        style={{
          position: "absolute", inset: 0,
          cursor: isPanning.current ? "grabbing" : "grab",
          background: "#f4ede4", // warm off-white
          perspective: 1200,
        }}
      >
        <div style={{
          position: "absolute",
          top: "50%", left: "50%",
          transform: `translate(calc(-50% + ${pan.x}px), calc(-50% + ${pan.y}px)) scale(${zoom}) ${isIsometric ? "rotateX(60deg) rotateZ(-45deg)" : "rotateX(0deg) rotateZ(0deg)"}`,
          transformStyle: "preserve-3d",
          transition: "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
          width: 0, height: 0,
        }}>
          
          {/* Physical CSS Pathways (Bridges) */}
          {layout.map((item, i) => {
            const length = Math.sqrt(item.x * item.x + item.y * item.y);
            const angle = Math.atan2(item.y, item.x) * (180 / Math.PI);
            return (
              <div key={`path_${i}`} style={{
                position: "absolute",
                top: 0, left: 0,
                width: length,
                height: 16,
                background: "#e8cba5", // same as slab top
                transformOrigin: "0 50%",
                transform: `translateY(-8px) rotate(${angle}deg)`,
                transformStyle: "preserve-3d",
              }}>
                {/* Pathway depth */}
                <div style={{ position: "absolute", top: "100%", left: 0, width: "100%", height: 6, background: "#cda67b", transformOrigin: "top", transform: "rotateX(-90deg)" }} />
                {/* Pathway shadow */}
                <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.1)", filter: "blur(4px)", transform: "translateZ(-1px)" }} />
              </div>
            );
          })}

          {/* Central Orchestrator Platform */}
          <div style={{
            position: "absolute",
            transform: "translate(-50%, -50%) translateZ(10px)",
            width: 200, height: 200,
            transformStyle: "preserve-3d",
          }}>
            {/* Top Face */}
            <div style={{ position: "absolute", inset: 0, background: "#e8cba5", borderRadius: 4, boxShadow: "inset 0 0 40px rgba(255,255,255,0.4)" }} />
            {/* Front depth */}
            <div style={{ position: "absolute", top: "100%", left: 0, width: "100%", height: 16, background: "#cda67b", transformOrigin: "top", transform: "rotateX(-90deg)" }} />
            {/* Right depth */}
            <div style={{ position: "absolute", top: 0, left: "100%", height: "100%", width: 16, background: "#e0c19a", transformOrigin: "left", transform: "rotateY(90deg)" }} />
            {/* Shadow */}
            <div style={{ position: "absolute", inset: -15, background: "rgba(0,0,0,0.2)", filter: "blur(15px)", transform: "translateZ(-1px)" }} />
            
            {/* Swarm Particles in Center */}
            <svg width="200" height="200" style={{ position: "absolute", top: 0, left: 0, transform: "translateZ(30px) rotateX(-90deg)", overflow: "visible" }}>
              {Array.from({ length: 60 }).map((_, i) => (
                <circle 
                  key={i} 
                  cx={100 + (Math.random() - 0.5) * 80} 
                  cy={100 + (Math.random() - 0.5) * 80} 
                  r={Math.random() * 2 + 1} 
                  fill={Math.random() > 0.5 ? "#1a2332" : "#d97706"}
                  className="particle-swarm"
                  style={{ animationDelay: `${Math.random() * 2}s` }}
                />
              ))}
            </svg>
          </div>

          {/* 17 AI Departments */}
          {layout.map((item) => {
            const st = sections?.[item.section.num]?.status || "not_started";
            const isSelected = selectedDept === item.section.num;
            return (
              <div key={item.section.num} style={{
                position: "absolute",
                left: item.x, top: item.y,
                transform: "translate(-50%, -50%)",
                transformStyle: "preserve-3d",
              }}>
                <AIOfficeDepartment 
                  section={item.section} 
                  status={st} 
                  isSelected={isSelected}
                  onClick={() => handleSelect(item.section, item.x, item.y)} 
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* ── RIGHT DRAWER (REAL WORKSPACE) ── */}
      <div style={{
        position: "absolute",
        top: 0, right: 0, bottom: 0,
        width: 600,
        background: "#fff",
        boxShadow: "-10px 0 30px rgba(0,0,0,0.1)",
        transform: drawerOpen ? "translateX(0)" : "translateX(100%)",
        transition: "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        zIndex: 200,
        display: "flex",
        flexDirection: "column",
      }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f8fafc" }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", fontFamily: "monospace" }}>DEPT {String(selectedDept).padStart(2, "0")}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#1a2332" }}>
              {SECTIONS.find(s => s.num === selectedDept)?.title || "Department"}
            </div>
          </div>
          <button className="btn btn-icon" onClick={closeDrawer} style={{ background: "#e2e8f0", color: "#1a2332" }}>✕</button>
        </div>
        
        {/* Render the EXISTING functional component! */}
        <div className="drawer-content section-scroll" style={{ flex: 1, overflowY: "auto", position: "relative" }}>
          {selectedDept && <SectionWorkspace num={selectedDept} isDrawer={true} />}
        </div>
      </div>

      <style jsx>{`
        /* Particle Animation */
        @keyframes swarm-float {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translateY(-40px) translateX(20px); opacity: 0; }
        }
        :global(.particle-swarm) {
          animation: swarm-float 3s ease-in-out infinite;
        }

        /* 3D Agent Walking Animations */
        @keyframes walk-x {
          0% { transform: translateX(0) translateY(0) scaleY(1); }
          25% { transform: translateX(8px) translateY(-2px) scaleY(0.95); }
          50% { transform: translateX(15px) translateY(0) scaleY(1); }
          75% { transform: translateX(8px) translateY(-2px) scaleY(0.95); }
          100% { transform: translateX(0) translateY(0) scaleY(1); }
        }

        @keyframes walk-y {
          0% { transform: translateX(0) translateY(0) scaleY(1); }
          25% { transform: translateX(0) translateY(6px) scaleY(0.95); }
          50% { transform: translateX(0) translateY(12px) scaleY(1); }
          75% { transform: translateX(0) translateY(6px) scaleY(0.95); }
          100% { transform: translateX(0) translateY(0) scaleY(1); }
        }

        @keyframes idle-bob {
          0% { transform: translateY(0) scaleY(1); }
          50% { transform: translateY(-1px) scaleY(0.98); }
          100% { transform: translateY(0) scaleY(1); }
        }

        :global(.agent-walk-fast-x) {
          animation: walk-x 1.2s linear infinite;
        }
        :global(.agent-walk-fast-y) {
          animation: walk-y 1.4s linear infinite;
        }
        :global(.agent-walk-idle) {
          animation: idle-bob 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
