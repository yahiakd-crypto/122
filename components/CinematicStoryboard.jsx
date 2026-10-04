import React, { useState } from "react";
import { Icon } from "./icons";
import { api } from "@/lib/client/api";
import { useApp } from "./AppContext";

export default function CinematicStoryboard({ data }) {
  const { toast } = useApp();
  const [activeIdx, setActiveIdx] = useState(0);
  
  if (!data) return null;

  const copyPrompt = async (text, label) => {
    try {
      await api.copy(text);
      toast(`${label} copied to clipboard!`);
    } catch (e) {
      toast("Failed to copy", "error");
    }
  };

  const ideas = data.ideas || [data];
  const activeIdea = ideas[activeIdx] || ideas[0];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      
      {/* Tabs */}
      {ideas.length > 1 && (
        <div style={{ display: "flex", gap: "8px", borderBottom: "1px solid #e2e8f0", paddingBottom: "12px" }}>
          {ideas.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIdx(idx)}
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: 700,
                cursor: "pointer",
                border: activeIdx === idx ? "1px solid #3b82f6" : "1px solid #cbd5e1",
                background: activeIdx === idx ? "#eff6ff" : "#f8fafc",
                color: activeIdx === idx ? "#1d4ed8" : "#475569",
                transition: "all 0.2s"
              }}
            >
              Video Idea {idx + 1}
            </button>
          ))}
        </div>
      )}

      {/* Active Idea Content */}
      <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "24px", background: "#ffffff", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
        
        {/* Title & Overview */}
        <div style={{ borderBottom: "2px solid #e2e8f0", paddingBottom: "16px" }}>
          <h2 style={{ fontSize: "20px", fontWeight: 800, margin: "0 0 16px 0", color: "#0f172a" }}>
            {activeIdea.title || `Cinematic Storyboard Idea ${activeIdx + 1}`}
          </h2>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
            {activeIdea.marketingMethod && (
              <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: "4px" }}>Marketing Method</div>
                <div style={{ fontSize: "13px", color: "#334155" }}>{activeIdea.marketingMethod}</div>
              </div>
            )}
            {activeIdea.hookLine && (
              <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: "4px" }}>The Hook (First 2s)</div>
                <div style={{ fontSize: "13px", color: "#334155", fontWeight: 700 }}>{activeIdea.hookLine}</div>
              </div>
            )}
            {activeIdea.beatMap && (
              <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "8px", border: "1px solid #e2e8f0", gridColumn: "1 / -1" }}>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: "4px" }}>Beat Map</div>
                <div style={{ fontSize: "13px", color: "#334155" }}>{activeIdea.beatMap}</div>
              </div>
            )}
          </div>
          
          {activeIdea.checklist && activeIdea.checklist.length > 0 && (
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {activeIdea.checklist.map((item, idx) => (
                <span key={idx} style={{ background: "#f1f5f9", padding: "4px 10px", borderRadius: "100px", fontSize: "11px", fontWeight: 600, color: "#475569" }}>
                  ✓ {item}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Master Prompt Section */}
        <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "12px", overflow: "hidden" }}>
          <div style={{ padding: "16px", background: "#f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e2e8f0" }}>
            <div style={{ fontWeight: 800, fontSize: "14px", color: "#334155" }}>1. MASTER STORYBOARD PROMPT</div>
            <button 
              className="btn btn-sm btn-primary"
              onClick={() => copyPrompt(activeIdea.masterPrompt, "Master Prompt")}
              style={{ display: "flex", alignItems: "center", gap: "6px" }}
            >
              <Icon.Copy /> COPY MASTER PROMPT
            </button>
          </div>
          <div style={{ padding: "16px", fontSize: "13px", color: "#475569", whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
            {activeIdea.masterPrompt}
          </div>
        </div>

        {/* Segments Section */}
        <div>
          <div style={{ fontWeight: 800, fontSize: "14px", color: "#334155", marginBottom: "16px" }}>
            2. TIMELINE SEGMENTS
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {activeIdea.segments && activeIdea.segments.map((segment, idx) => (
              <div key={idx} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "16px", display: "flex", flexDirection: "column", gap: "12px", position: "relative" }}>
                
                <div style={{ position: "absolute", top: -10, left: 16, background: "#10b981", color: "#fff", padding: "2px 10px", borderRadius: "10px", fontSize: "10px", fontWeight: 800 }}>
                  {segment.timeRange}
                </div>
                
                <div style={{ fontWeight: 800, fontSize: "14px", color: "#0f172a", marginTop: "8px" }}>
                  {segment.segmentName || `Segment ${idx + 1}`}
                </div>

                {segment.startFrame && (
                  <div style={{ background: "#f1f5f9", padding: "10px", borderRadius: "6px", fontSize: "11px", color: "#475569", borderLeft: "4px solid #cbd5e1" }}>
                    <strong>Start Frame:</strong> {segment.startFrame}
                  </div>
                )}

                <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "16px" }}>
                  
                  {/* Visuals Box */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div style={{ background: "#f8fafc", borderRadius: "8px", padding: "12px", border: "1px solid #e2e8f0" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                        <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Video Prompt</div>
                        <button onClick={() => copyPrompt(segment.segmentPrompt, "Segment Prompt")} style={{ background: "none", border: "none", cursor: "pointer", color: "#3b82f6", fontSize: "11px", fontWeight: 600 }}>Copy</button>
                      </div>
                      <div style={{ fontSize: "12px", color: "#334155", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
                        {segment.segmentPrompt}
                      </div>
                    </div>

                    {(segment.extendPrompt || segment.trimNote) && (
                      <div style={{ background: "#fffbeb", borderRadius: "8px", padding: "12px", border: "1px solid #fde68a" }}>
                        <div style={{ fontSize: "11px", fontWeight: 700, color: "#b45309", textTransform: "uppercase", marginBottom: "8px" }}>Seamless Extension</div>
                        {segment.extendPrompt && <div style={{ fontSize: "12px", color: "#92400e", marginBottom: segment.trimNote ? "8px" : "0" }}><strong>Extend:</strong> {segment.extendPrompt}</div>}
                        {segment.trimNote && <div style={{ fontSize: "12px", color: "#92400e" }}><strong>Trim:</strong> {segment.trimNote}</div>}
                      </div>
                    )}
                  </div>

                  {/* Audio/Copy Box */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div style={{ background: "#f0fdf4", borderRadius: "8px", padding: "12px", border: "1px solid #bbf7d0" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                        <div style={{ fontSize: "11px", fontWeight: 700, color: "#166534", textTransform: "uppercase" }}>🎙️ Voiceover Script</div>
                        <button onClick={() => copyPrompt(segment.voiceover, "Voiceover")} style={{ background: "none", border: "none", cursor: "pointer", color: "#16a34a", fontSize: "11px", fontWeight: 600 }}>Copy</button>
                      </div>
                      <div style={{ fontSize: "12px", color: "#166534", lineHeight: 1.5, whiteSpace: "pre-wrap", fontStyle: "italic" }}>
                        "{segment.voiceover}"
                      </div>
                    </div>

                    {(segment.onScreenText || segment.sfx) && (
                      <div style={{ background: "#f8fafc", borderRadius: "8px", padding: "12px", border: "1px solid #e2e8f0" }}>
                        {segment.onScreenText && <div style={{ fontSize: "12px", color: "#334155", marginBottom: segment.sfx ? "8px" : "0" }}><strong>Text:</strong> {segment.onScreenText}</div>}
                        {segment.sfx && <div style={{ fontSize: "12px", color: "#475569" }}><strong>SFX:</strong> {segment.sfx}</div>}
                      </div>
                    )}
                  </div>

                </div>

                {segment.endFrame && (
                  <div style={{ background: "#f1f5f9", padding: "10px", borderRadius: "6px", fontSize: "11px", color: "#475569", borderLeft: "4px solid #cbd5e1" }}>
                    <strong>End Frame:</strong> {segment.endFrame}
                  </div>
                )}

              </div>
            ))}
          </div>
          
          {activeIdea.cta && (
            <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "12px", padding: "16px", marginTop: "16px" }}>
              <div style={{ fontSize: "11px", fontWeight: 800, color: "#1d4ed8", textTransform: "uppercase", marginBottom: "4px" }}>Final Call to Action</div>
              <div style={{ fontSize: "16px", fontWeight: 700, color: "#1e3a8a" }}>{activeIdea.cta}</div>
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}
