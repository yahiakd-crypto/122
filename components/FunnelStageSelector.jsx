"use client";
import { useState } from "react";
import * as LucideIcons from "lucide-react";

const DynamicIcon = ({ name, size = 16, color = "currentColor" }) => {
  const IconComponent = LucideIcons[name] || LucideIcons.Circle;
  return <IconComponent size={size} color={color} strokeWidth={2.5} />;
};

export const FUNNEL_STAGES = [
  {
    id: 1, key: "product", title: "Product Intelligence", emoji: "🛒", icon: "Package", color: "#6366f1",
    desc: "Find, validate, and prepare the product.",
    subs: ["Product Discovery","Winning Product Finder","Product Deep Dive","Product Demand Analysis","Product Market Research","Product Trend Analysis","Product Validation","Product DNA Analysis","Product Problem-Solution Fit","Product Differentiation","Product Profitability","Product Sourcing","Supplier Research","Supplier Quality Check","Product Cost Analysis","Product Risk Analysis","Product Compliance Check","Product Test Recommendation","Product Launch Readiness"]
  },
  {
    id: 2, key: "strategy", title: "Strategy Intelligence", emoji: "🎯", icon: "Target", color: "#8b5cf6",
    desc: "Define the offer, audience, and positioning.",
    subs: ["Market Strategy","Target Market Research","Buyer Persona Research","Customer Segmentation","Pain Point Discovery","Desire & Motivation Analysis","Customer Awareness Level","Buying Intent Analysis","Customer Jobs-to-be-Done","Offer Strategy","Unique Selling Proposition (USP)","Value Proposition","Product Positioning","Pricing Strategy","Discount Strategy","Bundle Strategy","Upsell Strategy","Cross-Sell Strategy","Guarantee Strategy","COD Offer Strategy","Competitor Strategy","Funnel Strategy","Customer Acquisition Strategy","Profit Margin Strategy","Launch Strategy","Scaling Strategy"]
  },
  {
    id: 3, key: "creative", title: "Creative Intelligence", emoji: "🎨", icon: "Palette", color: "#ec4899",
    desc: "Generate and analyze ads that communicate the offer.",
    subs: ["Creative Strategy","Creative Angle Discovery","Marketing Angle Analyzer","Buyer Persona Creative Matcher","Hook Generator","Hook Analyzer","Pattern Interrupt Generator","Pain Point Creative","Desire-Based Creative","Problem-Solution Creative","Before & After Creative","Demonstration Creative","Testimonial Creative","UGC Creative","Founder-Style Creative","Lifestyle Creative","Product Showcase Creative","Comparison Creative","Offer Creative","Objection-Handling Creative","Image Ad Analyzer","Video Ad Analyzer","Ad Copy Analyzer","Primary Text Generator","Headline Generator","CTA Generator","Thumbnail Analyzer","Creative Fatigue Detector","Creative Winner Detector","Creative Testing Matrix","AI Image Generation","AI Video Generation"]
  },
  {
    id: 4, key: "campaign", title: "Campaign Intelligence", emoji: "🚀", icon: "Megaphone", color: "#f59e0b",
    desc: "Build, launch, and manage ad campaigns.",
    subs: ["Campaign Strategy","Campaign Structure","Campaign Objective Selection","Sales Campaign Setup","Traffic Campaign Setup","Engagement Campaign Setup","Messages Campaign Setup","Awareness Campaign Setup","Conversion Campaign Setup","CBO Campaign Strategy","ABO Campaign Strategy","Ad Set Structure","Audience Setup","Broad Targeting","Interest Targeting","Lookalike Audience","Retargeting Campaign","Budget Allocation","Budget Scaling","Bid Strategy","Bid Cap Strategy","Cost Cap Strategy","Lowest Cost Strategy","Campaign Testing","Creative Testing Campaign","Campaign Launch Checklist","Campaign Monitoring","Campaign Troubleshooting","Campaign Scaling","Campaign Pause / Restart"]
  },
  {
    id: 5, key: "traffic", title: "Traffic Intelligence", emoji: "🚦", icon: "MousePointer", color: "#10b981",
    desc: "Understand where visitors come from and how they behave.",
    subs: ["Traffic Acquisition","Traffic Source Analysis","Meta Traffic Analysis","Organic Traffic Analysis","Paid Traffic Analysis","Website Visitor Analysis","Landing Page Traffic","Product Page Traffic","Mobile Traffic Analysis","Desktop Traffic Analysis","New Visitor Analysis","Returning Visitor Analysis","Traffic Quality Analysis","Click Quality Analysis","CTR Analysis","CPC Analysis","CPM Analysis","Landing Page View Rate","Add to Cart Rate","Checkout Initiation Rate","Traffic-to-Order Conversion","Visitor Behavior Analysis","Bounce Rate Analysis","Funnel Drop-Off Analysis","Traffic Source Comparison","UTM Tracking","Pixel Event Tracking","Traffic Scaling"]
  },
  {
    id: 6, key: "order", title: "Order Intelligence", emoji: "🧾", icon: "ShoppingCart", color: "#06b6d4",
    desc: "Track the customer journey from checkout to submitted order.",
    subs: ["Order Tracking","Order Analytics","Order Volume Analysis","Order Conversion Rate","Checkout Analysis","Checkout Drop-Off","Cart Abandonment","Add to Cart Analysis","Order Value Analysis","Average Order Value (AOV)","Orders by Product","Orders by Creative","Orders by Campaign","Orders by Ad Set","Orders by Wilaya","Orders by Customer Segment","First-Time Order Analysis","Repeat Order Analysis","Order Source Attribution","Order Fraud Detection","Duplicate Order Detection","COD Order Management","Order Quality Scoring"]
  },
  {
    id: 7, key: "confirmation", title: "Confirmation Intelligence", emoji: "📞", icon: "PhoneCall", color: "#3b82f6",
    desc: "Improve confirmed orders and reduce invalid submissions.",
    subs: ["Order Confirmation","Confirmation Rate","Confirmation Call Analysis","Confirmation Script Generator","Confirmation Team Performance","Customer Contact Rate","Customer Response Rate","Unreachable Customer Analysis","Wrong Phone Number Detection","Fake Order Detection","Duplicate Order Detection","Customer Intent Verification","Order Cancellation Analysis","Confirmation Time Analysis","Confirmation by Wilaya","Confirmation by Product","Confirmation by Campaign","Confirmation by Creative","Confirmed Order Value","Confirmed Order Attribution","Confirmation Optimization"]
  },
  {
    id: 8, key: "delivery", title: "Delivery Intelligence", emoji: "🚚", icon: "Truck", color: "#14b8a6",
    desc: "Track shipments, delivery performance, and successful receipts.",
    subs: ["Delivery Tracking","Delivery Rate","Successful Delivery Rate","Delivery Time Analysis","Average Delivery Time","Delivery by Wilaya","Delivery by Courier","Delivery by Product","Delivery by Campaign","Delivery by Customer","Delivery Cost Analysis","Shipping Cost Analysis","Shipping Profitability","Failed Delivery Analysis","Delivery Delay Analysis","Courier Performance","Wilaya Performance","First Attempt Delivery Rate","Reattempt Delivery Analysis","Delivery Experience Analysis","Delivery Optimization"]
  },
  {
    id: 9, key: "rto", title: "RTO Intelligence", emoji: "📦", icon: "RotateCcw", color: "#ef4444",
    desc: "Analyze returns to origin and their financial impact.",
    subs: ["RTO Analysis","RTO Rate","Return to Origin Tracking","RTO Reason Analysis","RTO by Wilaya","RTO by Courier","RTO by Product","RTO by Campaign","RTO by Ad Set","RTO by Creative","RTO by Customer Segment","RTO by Order Source","Customer Refusal Analysis","Wrong Address Analysis","Unreachable Customer RTO","Delivery Delay RTO","RTO Cost Analysis","Reverse Shipping Cost","Return Handling Cost","RTO Profit Impact","RTO Prediction","RTO Risk Scoring","RTO Reduction Strategy","RTO Prevention"]
  },
  {
    id: 10, key: "revenue", title: "Revenue Intelligence", emoji: "💰", icon: "DollarSign", color: "#f59e0b",
    desc: "Measure money generated by the business.",
    subs: ["Revenue Analytics","Gross Revenue","Net Revenue","Delivered Revenue","Collected Revenue","Revenue by Product","Revenue by Campaign","Revenue by Ad Set","Revenue by Creative","Revenue by Wilaya","Revenue by Customer","Revenue by Date","Revenue Growth","Revenue Forecasting","Revenue Attribution","Revenue per Customer","Average Order Value","Revenue per Ad Spend","Daily Revenue Tracking","Weekly Revenue Tracking","Monthly Revenue Tracking","Revenue Dashboard"]
  },
  {
    id: 11, key: "profit", title: "Profit Intelligence", emoji: "📈", icon: "TrendingUp", color: "#22c55e",
    desc: "Calculate the real economics of every sale.",
    subs: ["Profit Analytics","Gross Profit","Net Profit","Contribution Margin","Profit Margin","Profit per Order","Profit per Delivered Order","Profit per Product","Profit per Campaign","Profit per Ad Set","Profit per Creative","Profit per Wilaya","Cost of Goods Sold (COGS)","Shipping Cost","Confirmation Cost","Return Cost","RTO Cost","Ad Spend","Operating Expenses","Break-Even Analysis","Break-Even ROAS","Break-Even CPA","Maximum CPA","Maximum CAC","Target ROAS","Profit Forecasting","Profit Optimization","Scaling Profitability"]
  },
  {
    id: 12, key: "customer_quality", title: "Customer Quality", emoji: "🧑‍🤝‍🧑", icon: "Users", color: "#8b5cf6",
    desc: "Measure whether acquired customers create sustainable value.",
    subs: ["Customer Quality Score","Customer Lifetime Value (LTV)","Customer Acquisition Cost (CAC)","Customer Retention","Repeat Purchase Rate","Repeat Order Analysis","Customer Segmentation","High-Value Customer Detection","Low-Value Customer Detection","RTO-Prone Customer Analysis","Customer Refusal Rate","Customer Cancellation Rate","Customer Confirmation Rate","Customer Delivery Rate","Customer Profitability","Customer Feedback Analysis","Customer Satisfaction Analysis","Customer Complaints","Customer Loyalty","Customer Cohort Analysis","Customer Quality by Wilaya","Customer Quality by Product","Customer Quality by Campaign","Customer Quality by Creative","Customer Quality Prediction"]
  },
  {
    id: 13, key: "ad_signal", title: "Ad Platform Signal", emoji: "📡", icon: "Radio", color: "#0ea5e9",
    desc: "Analyze the signals sent back to Meta and other ad platforms.",
    subs: ["Pixel Signal Analysis","Conversion API (CAPI) Analysis","Event Tracking","Event Match Quality","Purchase Event Quality","Lead Event Quality","Add to Cart Signal","Initiate Checkout Signal","Confirmed Order Signal","Delivered Order Signal","Purchase Value Signal","Revenue Signal Quality","Customer Quality Signal","Offline Conversion Tracking","Server-Side Tracking","Browser-Side Tracking","Deduplication Analysis","Event Match Rate","Signal Loss Detection","Event Delay Analysis","Conversion Attribution","Data Quality Monitoring","Signal-to-Conversion Analysis","Signal Optimization","Meta Learning Phase Analysis","Audience Feedback Loop"]
  },
  {
    id: 14, key: "optimization", title: "AI Optimization Engine", emoji: "🤖", icon: "Sliders", color: "#a855f7",
    desc: "Turn business and customer data into better campaign decisions.",
    subs: ["AI Campaign Optimization","AI Budget Optimization","AI Bid Optimization","AI Creative Optimization","AI Audience Optimization","AI Targeting Optimization","AI Product Optimization","AI Offer Optimization","AI Funnel Optimization","AI Landing Page Optimization","AI Conversion Rate Optimization (CRO)","AI CPA Optimization","AI ROAS Optimization","AI Profit Optimization","AI Revenue Optimization","AI RTO Reduction","AI Delivery Rate Optimization","AI Confirmation Rate Optimization","AI Customer Quality Optimization","AI Signal Optimization","Budget Reallocation","Creative Rotation","Creative Fatigue Prevention","Audience Expansion","Audience Exclusion","Broad vs Interest Targeting","Scaling Recommendations","Kill / Keep / Scale Analysis","Daily Performance Monitoring","Automated Decision Rules","7-Day Average Comparison","Anomaly Detection","Performance Alerts","Testing Prioritization"]
  },
  {
    id: 15, key: "new_traffic", title: "New Traffic Acquisition", emoji: "🌊", icon: "Globe", color: "#0284c7",
    desc: "Use optimization insights to acquire the next wave of customers.",
    subs: ["New Traffic Generation","New Audience Discovery","Audience Expansion","Lookalike Expansion","Broad Audience Expansion","New Interest Discovery","New Buyer Persona Discovery","New Market Discovery","New Wilaya Expansion","New Creative Launch","New Offer Testing","New Product Testing","New Campaign Launch","New Traffic Source Discovery","Organic Traffic Expansion","Paid Traffic Expansion","Influencer Traffic","UGC Traffic","Social Media Traffic","Search Traffic","Retargeting Expansion","Customer Referral Traffic","New Customer Acquisition","Traffic Scaling","Market Expansion","Growth Loop"]
  },
];

// ─── Selector UI shown BEFORE running ────────────────────────────────────────
export function FunnelStageSelector({ selected, onChange }) {
  const [expandedStage, setExpandedStage] = useState(null);

  const toggle = (key) => {
    if (selected.includes(key)) onChange(selected.filter(k => k !== key));
    else onChange([...selected, key]);
  };

  const toggleExpand = (key) => {
    setExpandedStage(prev => prev === key ? null : key);
  };

  return (
    <div onMouseDown={e => e.stopPropagation()} onWheel={e => e.stopPropagation()} style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <span style={{ fontSize: 11, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: 1 }}>
          Select Funnel Stages to Analyze
        </span>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={() => onChange(FUNNEL_STAGES.map(s => s.key))}
            style={{ padding: "3px 10px", borderRadius: 6, border: "1px solid #d1d5db", background: "#f8fafc", fontSize: 11, fontWeight: 700, color: "#475569", cursor: "pointer" }}>
            All 15
          </button>
          <button onClick={() => onChange([])}
            style={{ padding: "3px 10px", borderRadius: 6, border: "1px solid #d1d5db", background: "#f8fafc", fontSize: 11, fontWeight: 700, color: "#475569", cursor: "pointer" }}>
            None
          </button>
        </div>
      </div>

      {/* Stage count info */}
      <div style={{ marginBottom: 10, padding: "6px 10px", background: selected.length > 0 ? "#f0fdf4" : "#fff7ed", border: `1px solid ${selected.length > 0 ? "#86efac" : "#fed7aa"}`, borderRadius: 8, fontSize: 11, color: selected.length > 0 ? "#15803d" : "#c2410c", fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
        <DynamicIcon name="Layers" size={12} color={selected.length > 0 ? "#15803d" : "#c2410c"} />
        {selected.length === 0 ? "⚠️ Select at least one stage to run" : `${selected.length} stage${selected.length !== 1 ? "s" : ""} selected — AI will produce full visual dashboards for each`}
      </div>

      {/* Stage list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 400, overflowY: "auto", paddingRight: 4 }}>
        {FUNNEL_STAGES.map(stage => {
          const isChecked = selected.includes(stage.key);
          const isOpen = expandedStage === stage.key;
          return (
            <div key={stage.key} style={{ border: `1px solid ${isChecked ? stage.color + "44" : "#e2e8f0"}`, borderRadius: 10, overflow: "hidden", background: isChecked ? stage.color + "08" : "#fafafa", transition: "all 0.15s" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", cursor: "pointer" }}
                onClick={() => toggle(stage.key)}>
                {/* Checkbox */}
                <div style={{ width: 18, height: 18, borderRadius: 5, border: `2px solid ${isChecked ? stage.color : "#d1d5db"}`, background: isChecked ? stage.color : "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.15s" }}>
                  {isChecked && <DynamicIcon name="Check" size={11} color="#fff" />}
                </div>
                {/* Emoji + Icon */}
                <span style={{ fontSize: 16, flexShrink: 0 }}>{stage.emoji}</span>
                {/* Title */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: isChecked ? stage.color : "#334155" }}>
                    {stage.id}. {stage.title}
                  </div>
                  <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {stage.desc}
                  </div>
                </div>
                {/* Sub-count badge */}
                <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", flexShrink: 0 }}>
                  {stage.subs.length} items
                </div>
                {/* Expand toggle */}
                <button
                  onClick={e => { e.stopPropagation(); toggleExpand(stage.key); }}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: 2, display: "flex", alignItems: "center" }}>
                  <DynamicIcon name={isOpen ? "ChevronUp" : "ChevronDown"} size={14} />
                </button>
              </div>

              {/* Expanded sub-items */}
              {isOpen && (
                <div style={{ padding: "0 12px 12px 42px", borderTop: "1px solid #f1f5f9" }}>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 8 }}>
                    {stage.subs.map((sub, i) => (
                      <span key={i} style={{ fontSize: 10, background: isChecked ? stage.color + "18" : "#f1f5f9", color: isChecked ? stage.color : "#64748b", border: `1px solid ${isChecked ? stage.color + "33" : "#e2e8f0"}`, borderRadius: 20, padding: "2px 8px", fontWeight: 500 }}>
                        {sub}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
