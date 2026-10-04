const STAGE_META = {
  product:          { title: "PRODUCT 🛒",            layer: 1,  output: "Product Scorecard (weighted table: demand/wow factor/problem severity/profit margin/risk, each scored 1-10 + total), Supplier comparison table, Compliance checklist ✅/❌, Launch-readiness checklist." },
  strategy:         { title: "STRATEGY 🎯",           layer: 2,  output: "Org chart: USP → Value Prop → Positioning → Pricing (ASCII diagram). Buyer Persona cards (avatar | pain | desire | awareness level | objection). Pricing strategy comparison table (ranked 1-10). COD Funnel flow: Ad → LP → Checkout → COD (ASCII)." },
  creative:         { title: "CREATIVE 🎨",           layer: 3,  output: "Creative Angle cards (angle name | hook formula | visual concept | emotion targeted). Hook bank table (10+ hooks ranked by predicted CTR %). Creative Testing Matrix grid (angles × formats: P1/P2/P3 priority). Creative rotation calendar table (week | angle | format | audience)." },
  campaign:         { title: "CAMPAIGN 🚀",           layer: 4,  output: "Campaign structure tree diagram (CBO/ABO → Ad sets → Ads). Budget allocation table (campaign | daily budget DZD | % share | objective). Campaign launch checklist ✅. Troubleshooting decision tree: IF CPM high → THEN check X." },
  traffic:          { title: "TRAFFIC 🚦",            layer: 5,  output: "Traffic KPI dashboard table: metric | benchmark | current | status 🟢🟡🔴 (CTR, CPC, CPM, LPV rate, ATC rate). Funnel drop-off ASCII diagram with % at each step. UTM tracking template table (param | value | example)." },
  order:            { title: "ORDER 🧾",              layer: 6,  output: "Order funnel dashboard (ATC → IC → Purchase with % conversion each step). AOV card with formula. Orders breakdown table (by campaign / creative / wilaya). Cart abandonment card: top 3 causes + fix for each." },
  confirmation:     { title: "CONFIRMATION 📞",       layer: 7,  output: "Confirmation KPI dashboard (rate | contact rate | response rate — 🟢🟡🔴 vs target). Ready-to-use confirmation phone script card. Failure reason Pareto table (reason | % of failures | fix). Optimization action list." },
  delivery:         { title: "DELIVERY 🚚",           layer: 8,  output: "Delivery performance table (courier | delivery rate % | avg days | cost DZD | 🟢🟡🔴). Wilaya ranking table (best → worst: wilaya | delivery rate | RTO rate | recommendation). Failed delivery reason cards." },
  rto:              { title: "RTO 📦",                layer: 9,  output: "RTO Pareto table (reason | % of RTOs | cumulative % | priority). RTO cost calculator card (formula: RTO% × (product cost + shipping + confirmation cost) = cost per order). RTO reduction action matrix (action | impact 1-5 | effort 1-5 | priority 🟥🟨🟩)." },
  revenue:          { title: "REVENUE 💰",            layer: 10, output: "Revenue dashboard cards (gross | net | delivered | collected — each with formula). Revenue breakdown table (product / campaign / wilaya | revenue | % share). Revenue trend structure (daily/weekly targets)." },
  profit:           { title: "PROFIT 📈",             layer: 11, output: "UNIT ECONOMICS TABLE: Selling Price − COGS − Shipping − Confirmation Cost − (RTO% × cost) − Ad Spend per Order = Net Profit. Each line must show the number AND formula. Break-even ROAS card (formula shown). Profit per campaign ranked table 🟢🟡🔴." },
  customer_quality: { title: "CUSTOMER QUALITY 🧑‍🤝‍🧑", layer: 12, output: "Customer Quality Scorecard (weighted formula: LTV × 40% + confirmation rate × 30% + delivery rate × 20% + refusal rate penalty × 10%). High-value vs RTO-prone customer side-by-side comparison table. Retention opportunity cards (segment | action | expected impact)." },
  ad_signal:        { title: "AD PLATFORM SIGNAL 📡", layer: 13, output: "Signal quality dashboard (Event Match Quality score | CAPI status ✅/❌ | deduplication ✅/❌ | each with 🟢🟡🔴). Pixel event tracking checklist (event | fired ✅/❌ | value sent ✅/❌). Signal loss risk cards (risk | impact | fix)." },
  optimization:     { title: "AI OPTIMIZATION 🤖",   layer: 14, output: "KILL / KEEP / SCALE matrix (campaign | CPA | ROAS | RTO% | verdict 🟥🟨🟩 | action). Daily monitoring dashboard template (time | metric | check | alert threshold). Automated rules table (IF condition → THEN action | priority). 7-day average comparison table." },
  new_traffic:      { title: "NEW TRAFFIC 🌊",        layer: 15, output: "Expansion opportunity cards (audience/wilaya/channel | priority score 1-10 | rationale | first action). 30-day scaling roadmap timeline table (week | action | budget | expected outcome). Growth loop ASCII diagram (Data → Optimization → New Traffic → Better Signal → loop)." },
};

export function buildFullFunnelWorkflowMasterPrompt(ctx) {
  // selectedStages comes from the skill node's selectedStages array
  const selectedKeys = (ctx && ctx.selectedStages && ctx.selectedStages.length > 0)
    ? ctx.selectedStages
    : Object.keys(STAGE_META);

  const selectedMeta = selectedKeys.map(k => STAGE_META[k]).filter(Boolean);

  const layerInstructions = selectedMeta.map((m, i) =>
    `\nLAYER ${i + 1}/${selectedKeys.length} — ${m.title}\nOutput required: ${m.output}\nEnd this layer with a 💡 "TOP 3 ACTIONS" card.\n`
  ).join("\n---\n");

  return `ROLE:
You are "Ecom Intelligence Architect" — an elite e-commerce analyst for COD (Cash on Delivery) businesses in Algeria. You do NOT write paragraphs. You build VISUAL INTELLIGENCE DASHBOARDS in markdown.

PRODUCT CONTEXT:
${ctx && ctx.productName ? `Product: ${ctx.productName}` : "Use the product information from connected nodes."}
${ctx && ctx.instructions ? `Additional context: ${ctx.instructions}` : ""}

GOLDEN RULES:
1. NEVER output walls of text. Every output = visual structures (tables, scorecards, ASCII diagrams, matrices, checklists).
2. Every claim must be SPECIFIC: real numbers, %, estimated ranges, DZD amounts, formulas — never vague.
3. Always show the WHY → WHAT → HOW chain.
4. Use emoji icons as visual anchors for every card/section.
5. If data is missing, show a ⚠️ "DATA NEEDED" card listing EXACTLY what to collect.
6. Use DZD (Algerian Dinar) for all monetary values. Typical COD selling prices: 1,500–3,000 DZD.

OUTPUT FORMAT LIBRARY:
- 🃏 INFO CARDS: | 🎯 Metric | Value | Why it matters |
- 📊 COMPARISON TABLES: options ranked with scores (1–10)
- 🗺️ ASCII DIAGRAMS: for funnels and flows
- 🧮 MATRICES: grid showing best/worst combos
- 🎛️ KPI DASHBOARD: metric | current/estimate | target | status 🟢🟡🔴
- 🔀 DECISION TREES: IF metric X > Y → THEN action Z
- 📈 SCORECARDS: weighted scoring models with formulas
- ✅ CHECKLISTS: checkbox items for launch/readiness
- 🥧 UNIT ECONOMICS: cost breakdown table with formulas

EXECUTE THESE ${selectedKeys.length} LAYERS IN ORDER:
${layerInstructions}

━━ FINAL ━━
After all layers, output a MASTER DASHBOARD — one summary table:
| Layer | Stage | Key Metric | Status 🟢🟡🔴 | #1 Next Action |
List every layer you analyzed in this table.

CRITICAL JSON OUTPUT REQUIREMENT:
You MUST respond with ONLY valid JSON in this exact structure (no markdown outside JSON):
{
  "summary": "The MASTER DASHBOARD summary table in markdown",
  "keyPoints": [
    "Full markdown dashboard for layer 1 (must include tables, ASCII diagrams, scorecards as instructed)",
    "Full markdown dashboard for layer 2",
    ... one entry per layer selected
  ],
  "recommendations": [
    "Top global action 1 with specifics",
    "Top global action 2 with specifics",
    "Top global action 3 with specifics"
  ]
}

The keyPoints array MUST have EXACTLY ${selectedKeys.length} entries (one per selected stage). Each entry MUST be rich markdown with real tables and visual structures — not paragraphs.`;
}
