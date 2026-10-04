import React from 'react';

export default function GrowthLoopOrgChart({ data }) {
  if (!data) return null;
  
  const stages = [
    { id: 'product', label: 'Product', icon: 'Package' },
    { id: 'strategy', label: 'Strategy', icon: 'Target' },
    { id: 'creative', label: 'Creative', icon: 'Image' },
    { id: 'campaign', label: 'Campaign', icon: 'Megaphone' },
    { id: 'traffic', label: 'Traffic', icon: 'Users' },
    { id: 'order', label: 'Order', icon: 'ShoppingCart' },
    { id: 'confirmation', label: 'Confirmation', icon: 'CheckCircle' },
    { id: 'delivery', label: 'Delivery', icon: 'Truck' },
    { id: 'rto', label: 'RTO', icon: 'AlertTriangle' },
    { id: 'revenue', label: 'Revenue', icon: 'DollarSign' },
    { id: 'profit', label: 'Profit', icon: 'TrendingUp' },
    { id: 'quality', label: 'Customer Quality', icon: 'Star' },
    { id: 'signal', label: 'Ad Signal', icon: 'Activity' },
    { id: 'optimization', label: 'Optimization', icon: 'Settings' }
  ];

  // Try to extract stage insights from keyPoints
  const extractStageData = (stageLabel) => {
    if (!data.keyPoints) return null;
    const point = data.keyPoints.find(p => p.toLowerCase().includes(stageLabel.toLowerCase()));
    return point ? point.replace(new RegExp(`^.*${stageLabel}.*?[:\\-]`, 'i'), '').trim() : null;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 24px', fontFamily: 'system-ui, -apple-system, sans-serif', background: '#f8fafc', borderRadius: 24 }}>
      <h2 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', marginBottom: 12 }}>Growth Loop Intelligence</h2>
      <p style={{ color: '#64748b', marginBottom: 40, textAlign: 'center', maxWidth: 600 }}>{data.summary || 'Analyzing the complete COD/E-commerce feedback loop.'}</p>
      
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: 800 }}>
        {stages.map((stage, index) => {
          const insight = extractStageData(stage.label);
          const isLast = index === stages.length - 1;
          
          return (
            <React.Fragment key={stage.id}>
              {/* Node */}
              <div style={{ display: 'flex', width: '100%', background: '#fff', borderRadius: 16, padding: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9', position: 'relative', zIndex: 2, alignItems: 'center', gap: 20 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: '#e0e7ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: 20, flexShrink: 0 }}>
                  {index + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>{stage.label}</div>
                  <div style={{ fontSize: 13, color: insight ? '#334155' : '#94a3b8', lineHeight: 1.5 }}>
                    {insight || 'Awaiting data...'}
                  </div>
                </div>
              </div>
              
              {/* Connecting Line & Arrow */}
              {!isLast && (
                <div style={{ width: 2, height: 30, background: '#cbd5e1', position: 'relative', margin: '4px 0' }}>
                   <div style={{ position: 'absolute', bottom: -6, left: -5, color: '#cbd5e1' }}>
                     <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                   </div>
                </div>
              )}
            </React.Fragment>
          );
        })}
        
        {/* Loop Back Line (Visual Representation) */}
        <div style={{ width: '100%', height: 40, borderBottom: '2px dashed #94a3b8', borderLeft: '2px dashed #94a3b8', borderRight: '2px dashed #94a3b8', borderBottomLeftRadius: 24, borderBottomRightRadius: 24, marginTop: 20, position: 'relative' }}>
            <div style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translate(-50%, -50%)', background: '#f8fafc', padding: '0 16px', color: '#64748b', fontSize: 12, fontWeight: 'bold' }}>
              REPEATS WITH NEW TRAFFIC
            </div>
        </div>
      </div>
      
      {data.recommendations && data.recommendations.length > 0 && (
        <div style={{ marginTop: 60, width: '100%', maxWidth: 800 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', marginBottom: 16 }}>Decision Engine Recommendations</h3>
          <div style={{ display: 'grid', gap: 16 }}>
            {data.recommendations.map((rec, i) => (
              <div key={i} style={{ background: '#fff', borderRadius: 12, padding: '16px', borderLeft: '4px solid #10b981', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                <div style={{ fontSize: 14, color: '#334155', lineHeight: 1.6 }}>{rec}</div>
              </div>
            ))}
          </div>
          
          <div style={{ marginTop: 40, display: 'flex', justifyContent: 'center' }}>
            <button style={{ background: '#0f172a', color: '#fff', border: 'none', padding: '16px 32px', borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 10px 25px rgba(15, 23, 42, 0.2)', transition: 'transform 0.2s' }} onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
              Execute Next Steps
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
