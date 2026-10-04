import React from "react";

export default function FacebookAdsOrgChart({ data }) {
  if (!data) return null;
  
  // Normalize data: support new multiple campaigns schema or fallback to legacy single campaign
  const campaigns = Array.isArray(data.campaigns) 
    ? data.campaigns 
    : (data.campaignName ? [data] : []);

  if (campaigns.length === 0) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', overflowX: 'auto', padding: '24px', background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
      
      {/* ── Optional: Overall Strategy ── */}
      {data.overallStrategy && (
        <div style={{ marginBottom: 24, padding: "12px 20px", background: "#fff", borderLeft: "4px solid #3b82f6", borderRadius: "0 8px 8px 0", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", maxWidth: 800, textAlign: "left" }}>
          <strong style={{ display: "block", fontSize: 12, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>OVERALL STRATEGY</strong>
          <span style={{ fontSize: 14, color: "#334155", lineHeight: 1.5 }}>{data.overallStrategy}</span>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 48, width: "100%", alignItems: "center" }}>
        {campaigns.map((campaign, cIdx) => (
          <div key={cIdx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
            
            {/* ── Level 0: Campaign ── */}
            <div style={{ background: "#fff", border: "2px solid #1e293b", padding: "16px 24px", borderRadius: 12, textAlign: "center", maxWidth: 600, boxShadow: "0 10px 30px rgba(0,0,0,0.06)", zIndex: 2, position: "relative" }}>
              <div style={{ fontSize: 16, fontWeight: 900, color: "#1e293b", marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>{campaign.campaignName || `Campaign ${cIdx + 1}`}</div>
              
              {/* Campaign Info */}
              <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap", marginBottom: 10 }}>
                {campaign.budgetType && <span style={{ background: "#f1f5f9", padding: "4px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700, color: "#0ea5e9" }}>{campaign.budgetType}</span>}
                {campaign.campaignBudget && <span style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "3px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700, color: "#16a34a" }}>Budget: {campaign.campaignBudget}</span>}
              </div>
              
              {campaign.campaignRules && (
                <div style={{ background: "#fffbeb", border: "1px dashed #fcd34d", padding: "8px 12px", borderRadius: 8, fontSize: 11, color: "#b45309", textAlign: "left" }}>
                  <strong style={{ display: "block", marginBottom: 4 }}>⚡ Automated Rules:</strong>
                  {campaign.campaignRules}
                </div>
              )}
            </div>

            {/* ── Level 1: Ad Sets ── */}
            {campaign.adSets && campaign.adSets.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                {/* Stem down from Campaign */}
                <div style={{ width: 2, height: 24, background: "#94a3b8" }} />
                
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }}>
                  {campaign.adSets.map((adSet, i) => {
                    const isFirst = i === 0;
                    const isLast = i === campaign.adSets.length - 1;
                    const isOnly = campaign.adSets.length === 1;

                    return (
                      <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', padding: '0 16px', minWidth: 320 }}>
                        
                        {/* Horizontal connection line */}
                        {!isOnly && (
                          <div style={{ 
                            position: 'absolute', top: 0, height: 2, background: "#94a3b8",
                            left: isFirst ? '50%' : 0,
                            right: isLast ? '50%' : 0
                          }} />
                        )}
                        
                        {/* Stem down to Ad Set */}
                        <div style={{ width: 2, height: 24, background: "#94a3b8" }} />
                        
                        {/* Ad Set Box */}
                        <div style={{ width: 280, background: "#fff", border: "1px solid #cbd5e1", borderRadius: 12, padding: "16px", boxShadow: "0 4px 16px rgba(0,0,0,0.04)", position: "relative", zIndex: 2 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                            <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#3b82f6", boxShadow: "0 0 8px rgba(59,130,246,0.4)" }} />
                            <div style={{ fontSize: 14, fontWeight: 800, color: "#0f172a" }}>{adSet.name}</div>
                          </div>
                          {adSet.objective && <div style={{ fontSize: 12, color: "#475569", marginBottom: 6 }}><strong style={{ color: "#334155" }}>Objective:</strong> <span style={{ background: "#fef3c7", color: "#b45309", padding: "2px 6px", borderRadius: 4, fontWeight: 700 }}>{adSet.objective}</span></div>}
                          <div style={{ fontSize: 12, color: "#475569", marginBottom: 6 }}><strong style={{ color: "#334155" }}>Targeting:</strong> {adSet.targeting}</div>
                          {adSet.placement && <div style={{ fontSize: 12, color: "#475569", marginBottom: 6 }}><strong style={{ color: "#334155" }}>Placement:</strong> {adSet.placement}</div>}
                          <div style={{ fontSize: 12, color: "#475569", marginBottom: 6 }}><strong style={{ color: "#334155" }}>Budget:</strong> {adSet.budget}</div>
                          <div style={{ fontSize: 12, color: "#475569", marginBottom: 0 }}><strong style={{ color: "#334155" }}>Parameters:</strong> {adSet.parameters}</div>
                        </div>

                        {/* ── Level 2: Ads (Vertical Tree Layout) ── */}
                        {adSet.ads && adSet.ads.length > 0 && (
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", width: 280, position: "relative" }}>
                            {/* Vertical line passing through all ads */}
                            <div style={{ position: "absolute", top: 0, bottom: 20, left: 24, width: 2, background: "#cbd5e1" }} />
                            
                            {adSet.ads.map((ad, j) => (
                              <div key={j} style={{ position: "relative", paddingTop: 16, width: "100%", display: "flex" }}>
                                {/* Horizontal branch to this ad */}
                                <div style={{ position: "absolute", top: 36, left: 24, width: 16, height: 2, background: "#cbd5e1" }} />
                                
                                {/* Ad Box */}
                                <div style={{ marginLeft: 40, width: "calc(100% - 40px)", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.02)", position: "relative", zIndex: 2 }}>
                                  <div style={{ fontSize: 10, fontWeight: 800, color: "#10b981", textTransform: "uppercase", marginBottom: 6, letterSpacing: 0.5 }}>
                                    {ad.name || `Ad ${j+1}`}
                                    {ad.format && <span style={{ marginLeft: 6, background: "#e2e8f0", color: "#475569", padding: "2px 6px", borderRadius: 4, fontSize: 9 }}>{ad.format}</span>}
                                  </div>
                                  <div style={{ fontSize: 11, color: "#334155", lineHeight: 1.5 }}>{typeof ad === 'string' ? ad : ad.description}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
