import React, { useState } from "react";

const BORDER = "#e2e8f0";
const PAPER = "#ffffff";
const INK = "#0f172a";
const MUTED = "#64748b";
const FOCUS = "#6366f1";

const NODES = [
  { id: "everyday", t: "EVERY DAY", s: "fixed time", d: "The daily loop begins at a fixed time, no exceptions.", m: "09:00 sharp" },
  { id: "collect", t: "COLLECT DATA", s: "4 sources", d: "Gather raw numbers from ALL four sources BEFORE any decision.", m: "4 exports / day" },
  { id: "avg7", t: "7-DAY AVERAGE", s: "not one day", d: "One day is noise, not signal. Always use the 7-day average.", m: "CPA 7d $18.7" },
  { id: "compare", t: "COMPARE VS TARGET", s: "your OWN targets", d: "Compare your 7-day average against your OWN targets.", m: "CPA $18.7 vs $20" },
  { id: "decision", t: "DECISION", s: "route", d: "The comparison routes the flow.", m: "Route the flow" },
  { id: "incbudget", t: "INCREASE +10-20%", s: "on target", d: "Only on-target 7-day metrics justify +10-20%.", m: "$500 -> $575" },
  { id: "wait", t: "WAIT 24-48H", s: "below target", d: "Below target is not an emergency; wait before acting.", m: "wait 1-2 days" },
  { id: "recheck", t: "RE-CHECK", s: "recompute", d: "Recompute the 7-day average after waiting.", m: "fresh CPA 7d" },
  { id: "stillbelow", t: "STILL BELOW?", s: "route again", d: "Still below routes to DECREASE; recovered routes to KEEP.", m: "YES / RECOVERED" },
  { id: "decrease", t: "DECREASE -10-20%", s: "two below", d: "Two consecutive below-target checks justify -10-20%.", m: "$500 -> $425-450" },
  { id: "keep", t: "KEEP CURRENT", s: "recovered", d: "Recovered after wait -> keep unchanged.", m: "$500 unchanged" },
  { id: "monitor", t: "MONITOR 7 DAYS", s: "loop back", d: "Monitor for 7 days then loop back.", m: "loop daily" },
];
const getNode = (id) => NODES.find((n) => n.id === id);

export default function MetaDecisionFlow() {
  const [sel, setSel] = useState(null);

  const Card = ({ id }) => {
    const n = getNode(id);
    if (!n) return null;
    const active = sel === id;
    return (
      <div
        onClick={() => setSel(id)}
        style={{
          background: PAPER,
          border: "1px solid " + (active ? FOCUS : BORDER),
          borderRadius: 8,
          padding: "10px 14px",
          width: 230,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          boxShadow: active ? "0 0 0 2px rgba(99,102,241,0.15)" : "0 1px 2px rgba(15,23,42,0.05)",
          textAlign: "center",
          transition: "all 0.15s ease"
        }}
      >
        <div style={{ fontSize: 12, fontWeight: 900, color: INK, letterSpacing: 0.4, lineHeight: 1.3 }}>{n.t}</div>
        <div style={{ fontSize: 10, fontWeight: 600, color: MUTED, marginTop: 4 }}>{n.m}</div>
        {!active ? null : (
          <div style={{ fontSize: 9, color: FOCUS, fontWeight: 700, marginTop: 8 }}>click for details</div>
        )}
      </div>
    );
  };

  const VLine = ({ h = 16 }) => <div style={{ width: 2, height: h, background: BORDER }} />;
  const HLine = ({ w = 22 }) => <div style={{ height: 2, width: w, background: BORDER }} />
  const Tag = ({ children, ok }) => (
    <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: 1, color: ok ? "#16a34a" : "#dc2626", background: PAPER, border: "1px solid " + BORDER, borderRadius: 6, padding: "2px 8px", marginBottom: 6 }}>{children}</div>
  );

  return (
    <div style={{ display: "flex", height: 640, border: "1px solid " + BORDER, borderRadius: 10, background: "#fafafa", overflow: "hidden", fontFamily: "system-ui, sans-serif" }}>

      <div style={{ flex: 1, overflowY: "auto", padding: 22, display: "flex", flexDirection: "column" }}>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Card id="everyday" />
          <VLine />
          <Card id="collect" />
          <VLine />
          <Card id="avg7" />
          <VLine />
          <Card id="compare" />
          <VLine />
          <Card id="decision" />
          <VLine h={22} />

          <div style={{ border: "1px dashed " + BORDER, borderRadius: 8, padding: 6, display: "flex", gap: 16, alignItems: "flex-start" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <Tag ok>ON TARGET</Tag>
              <Card id="incbudget" />
              <VLine />
              <Card id="monitor" />
            </div>
            <VLine h={40} />
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <Tag>BELOW TARGET</Tag>
              <Card id="wait" />
              <VLine />
              <Card id="recheck" />
              <VLine />
              <Card id="stillbelow" />
              <VLine />
              <div style={{ display: "flex", gap: 18 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <Tag>STILL BELOW</Tag>
                  <Card id="decrease" />
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <Tag ok>RECOVERED</Tag>
                  <Card id="keep" />
                </div>
              </div>
            </div>
          </div>

          <VLine />
          <Card id="monitor" />
        </div>
      </div>
      {sel ? (
        <div style={{ width: 270, borderLeft: "1px solid " + BORDER, background: PAPER, padding: 18, fontSize: 12, overflowY: "auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
            <div>
              <div style={{ fontWeight: 900, fontSize: 13, color: INK }}>{getNode(sel).t}</div>
              <div style={{ fontSize: 10, color: MUTED, fontWeight: 600 }}>{getNode(sel).s}</div>
            </div>
            <button onClick={() => setSel(null)} style={{ border: "1px solid " + BORDER, background: "none", borderRadius: 6, cursor: "pointer", fontSize: 11, color: MUTED, padding: "2px 8px" }}>Close</button>
          </div>
          <div style={{ lineHeight: 1.5, color: "#334155", marginBottom: 14 }}>{getNode(sel).d}</div>
          <div style={{ fontSize: 10, fontWeight: 800, color: MUTED, textTransform: "uppercase", letterSpacing: 0.6 }}>Preview metric</div>
          <div style={{ marginTop: 6, background: "#f8fafc", border: "1px solid " + BORDER, borderRadius: 8, padding: "10px 12px", fontSize: 13, fontWeight: 700, color: INK }}>{getNode(sel).m}</div>
        </div>
      ) : null}

    </div>
  );
}