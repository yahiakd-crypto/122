import React, { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';

export default function ProductIntelligenceDashboard({ data }) {
  const [activeTab, setActiveTab] = useState('discovery');

  if (!data) return <div className="p-4 text-slate-500">No data available.</div>;

  const discoveryData = data.discovery || { title: "Discovery Phase", checklist: [] };
  const profitabilityData = data.profitability || { title: "Profitability Phase", checklist: [] };
  
  const currentView = activeTab === 'discovery' ? discoveryData : profitabilityData;
  const score = data.score || "—";
  const actionText = data.actionText || "View Details";

  return (
    <div style={{
      width: '100%',
      maxWidth: '600px',
      margin: '0 auto',
      background: '#ffffff',
      borderRadius: '24px',
      boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
      overflow: 'hidden',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Light Green Gradient Top Section */}
      <div style={{
        background: 'linear-gradient(180deg, #e8f5e9 0%, #ffffff 100%)',
        padding: '40px 32px 24px 32px',
        textAlign: 'center'
      }}>
        <h2 style={{ 
          fontSize: '24px', 
          fontWeight: '800', 
          color: '#1a1a1a', 
          margin: '0 0 16px 0',
          letterSpacing: '-0.5px'
        }}>
          {data.title || "Product Intelligence Report"}
        </h2>
        
        <p style={{
          fontSize: '15px',
          color: '#52525b',
          margin: '0 0 32px 0',
          lineHeight: '1.5',
          fontWeight: '500'
        }}>
          {data.subtitle || "Comprehensive analysis across 17 evaluation skills to determine market viability."}
        </p>

        {/* Toggle Switch */}
        <div style={{
          background: '#f4f4f5',
          borderRadius: '12px',
          padding: '6px',
          display: 'flex',
          gap: '8px'
        }}>
          <button
            onClick={() => setActiveTab('discovery')}
            style={{
              flex: 1,
              padding: '12px 24px',
              border: 'none',
              borderRadius: '8px',
              background: activeTab === 'discovery' ? '#ffffff' : 'transparent',
              color: '#1a1a1a',
              fontSize: '15px',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: activeTab === 'discovery' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            Group 01: Discovery
          </button>
          <button
            onClick={() => setActiveTab('profitability')}
            style={{
              flex: 1,
              padding: '12px 24px',
              border: 'none',
              borderRadius: '8px',
              background: activeTab === 'profitability' ? '#ffffff' : 'transparent',
              color: '#1a1a1a',
              fontSize: '15px',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: activeTab === 'profitability' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            Group 02: Profitability
          </button>
        </div>
      </div>

      {/* Checklist Section */}
      <div style={{ padding: '32px' }}>
        <h3 style={{
          fontSize: '18px',
          fontWeight: '800',
          color: '#1a1a1a',
          margin: '0 0 24px 0'
        }}>
          {currentView.title}
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {(currentView.checklist || []).map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              <div style={{ flexShrink: 0, marginTop: '2px' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" fill="#1a1a1a"/>
                  <path d="M8 12.5L10.5 15L16 9" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span style={{ fontSize: '15px', color: '#52525b', lineHeight: '1.5', fontWeight: '600' }}>
                {item}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Footer Section */}
      <div style={{ 
        padding: '24px 32px', 
        borderTop: '1px solid #f4f4f5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline' }}>
          <span style={{ fontSize: '18px', fontWeight: '800', color: '#1a1a1a' }}>Score</span>
          <span style={{ fontSize: '42px', fontWeight: '900', color: '#1a1a1a', marginLeft: '4px', lineHeight: '1' }}>{score}</span>
          <span style={{ fontSize: '14px', fontWeight: '700', color: '#52525b', marginLeft: '4px' }}>/100</span>
        </div>
        
        <button style={{
          background: '#0bd126',
          color: '#ffffff',
          border: 'none',
          borderRadius: '8px',
          padding: '16px 32px',
          fontSize: '16px',
          fontWeight: '800',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(11, 209, 38, 0.3)',
          transition: 'transform 0.1s'
        }}
        onMouseOver={e => e.currentTarget.style.transform = 'scale(1.02)'}
        onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          {actionText}
        </button>
      </div>
    </div>
  );
}

