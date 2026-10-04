import React from "react";

export default function BuyerPersonaOrgChart({ data }) {
  if (!data) return null;
  
  // Backwards compatibility if AI still returns old structure
  const isOldFormat = !data.products && data.personas;
  const products = isOldFormat ? [{ productName: data.productName || "Product", personas: data.personas }] : (data.products || []);
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', overflowX: 'auto', padding: '40px 24px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* ── Level 0: Group / Strategy ── */}
      <div style={{ background: "#fff", padding: "20px 24px", borderRadius: 16, textAlign: "center", maxWidth: 600, boxShadow: "0 4px 24px rgba(0,0,0,0.04)", zIndex: 2, position: "relative" }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "#f3e8ff", color: "#9333ea", display: "flex", alignItems: "center", justifyContent: "center" }}>
             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#0f172a" }}>{data.groupName || data.productName || "Product Group"}</div>
        </div>
        <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.6 }}>{data.overallStrategy}</div>
      </div>

      {/* ── Level 1: Products ── */}
      {products && products.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
          {/* Stem down from Group */}
          <div style={{ width: 1, height: 40, borderLeft: "1px dashed #a1a1aa", position: "relative" }}>
             {/* Arrow down */}
             <div style={{ position: 'absolute', bottom: -4, left: -4, color: '#a1a1aa' }}>
               <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
             </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }}>
            {products.map((product, i) => {
              const isFirst = i === 0;
              const isLast = i === products.length - 1;
              const isOnly = products.length === 1;

              return (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', padding: '0 20px', minWidth: 320 }}>
                  
                  {/* Curved dashed connection lines */}
                  {!isOnly && (
                    <>
                      {isFirst ? (
                        <div style={{ position: 'absolute', top: 0, right: 0, width: '50%', height: 20, borderTop: "1px dashed #a1a1aa", borderLeft: "1px dashed #a1a1aa", borderTopLeftRadius: 16 }} />
                      ) : isLast ? (
                        <div style={{ position: 'absolute', top: 0, left: 0, width: '50%', height: 20, borderTop: "1px dashed #a1a1aa", borderRight: "1px dashed #a1a1aa", borderTopRightRadius: 16 }} />
                      ) : (
                        <>
                           <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 1, borderTop: "1px dashed #a1a1aa" }} />
                           <div style={{ width: 1, height: 20, borderLeft: "1px dashed #a1a1aa" }} />
                        </>
                      )}
                    </>
                  )}
                  {isOnly && <div style={{ width: 1, height: 20, borderLeft: "1px dashed #a1a1aa" }} />}
                  
                  {/* Product Box */}
                  <div style={{ width: 320, background: "#fff", borderRadius: 16, padding: "20px", boxShadow: "0 4px 24px rgba(0,0,0,0.04)", position: "relative", zIndex: 2 }}>
                    
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: "#dcfce7", color: "#16a34a", display: "flex", alignItems: "center", justifyContent: "center" }}>
                           <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>
                        </div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>{product.productName}</div>
                      </div>
                      <div style={{ color: "#94a3b8" }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
                      </div>
                    </div>
                    
                    {product.productSummary && (
                      <div style={{ fontSize: 11, color: "#64748b", lineHeight: 1.5 }}>
                        {product.productSummary}
                      </div>
                    )}
                  </div>

                  {/* ── Level 2: Personas (Hanging below product) ── */}
                  {product.personas && product.personas.length > 0 && (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", position: "relative" }}>
                      
                      {/* Stem down to personas */}
                      <div style={{ width: 1, height: 30, borderLeft: "1px dashed #a1a1aa", position: "relative" }}>
                         <div style={{ position: 'absolute', bottom: -4, left: -4, color: '#a1a1aa' }}>
                           <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                         </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, width: '100%', alignItems: 'center' }}>
                        {product.personas.map((persona, j) => (
                          <div key={j} style={{ width: 320, background: "#fff", borderRadius: 16, padding: "20px", boxShadow: "0 4px 24px rgba(0,0,0,0.04)", position: "relative", zIndex: 2 }}>
                            
                            {/* Persona Header */}
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <div style={{ width: 32, height: 32, borderRadius: 8, background: j % 2 === 0 ? "#e0e7ff" : "#fce7f3", color: j % 2 === 0 ? "#4f46e5" : "#db2777", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                                </div>
                                <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{persona.name}</div>
                              </div>
                              <div style={{ color: "#94a3b8" }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
                              </div>
                            </div>
                            
                            {/* Persona Body */}
                            <div style={{ fontSize: 11, color: "#64748b", lineHeight: 1.6, marginBottom: 16 }}>
                              <div style={{ marginBottom: 4 }}><strong style={{ color: "#334155" }}>Demographics:</strong> {persona.demographics}</div>
                              <div style={{ marginBottom: 4 }}><strong style={{ color: "#334155" }}>Psychographics:</strong> {persona.psychographics}</div>
                              {persona.keywords && (
                                <div><strong style={{ color: "#334155" }}>Keywords:</strong> {persona.keywords}</div>
                              )}
                            </div>
                            
                            {/* Persona Badges / Footer */}
                            <div style={{ display: "flex", flexDirection: "column", gap: 8, borderTop: "1px solid #f1f5f9", paddingTop: 16 }}>
                              
                              <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                                <div style={{ background: "#ffedd5", color: "#ea580c", padding: "4px 8px", borderRadius: 12, fontSize: 10, fontWeight: 700, whiteSpace: "nowrap" }}>
                                  Targeting
                                </div>
                                <div style={{ fontSize: 11, color: "#475569", lineHeight: 1.4 }}>{persona.directTargeting}</div>
                              </div>
                              
                              <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                                <div style={{ background: "#e0f2fe", color: "#0284c7", padding: "4px 8px", borderRadius: 12, fontSize: 10, fontWeight: 700, whiteSpace: "nowrap" }}>
                                  Strategy
                                </div>
                                <div style={{ fontSize: 11, color: "#475569", lineHeight: 1.4 }}>{persona.testingStrategy}</div>
                              </div>

                            </div>
                            
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
