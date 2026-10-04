export function buildStageIntelligencePrompt(stageName, tasksList, ctx = {}) {
  const productContext = ctx.productName
    ? `\nTARGET PRODUCT FOR ANALYSIS:
- Product Name: ${ctx.productName}
- Category / Niche: ${ctx.productCategory || ctx.category || "E-commerce"}
- Selling Price: ${ctx.productPrice || ctx.price || "N/A"}
- Description: ${ctx.productDescription || ctx.description || "N/A"}
- Supplier Info: ${typeof ctx.supplier === "object" ? JSON.stringify(ctx.supplier) : (ctx.supplier || "Verified Supplier Pool")}\n`
    : `\nCONTEXT: General E-commerce / Cash on Delivery (COD) business analysis.\n`;

  return `You are "Ecom Intelligence Architect" — an elite e-commerce analyst specializing in the **${stageName}** stage of the 15-stage E-commerce Growth Loop.
${productContext}
Your objective is to execute an exhaustive, actionable intelligence analysis for this stage covering ALL of the following sub-workflows:

${tasksList}

GOLDEN RULES:
1. Do not output vague advice. Provide specific numbers, formulas, percentages, benchmark ranges, and actionable frameworks.
2. Structure your output into visual Markdown blocks (cards with emojis, ranked comparison tables, testing matrices, and step-by-step action plans).
3. If data is missing for any workflow, explicitly mark it with ⚠️ "DATA NEEDED" and provide the exact industry benchmark and setup instructions.

REQUIRED JSON OUTPUT FORMAT:
Return a JSON object with this exact structure:
{
  "summary": "Executive summary of the ${stageName} stage with a Master Status Table (Workflow | Metric | Status 🟢🟡🔴 | #1 Next Action).",
  "keyPoints": [
    "### 🃏 ${stageName} Core Scorecard & Metrics\\n| Metric | Value | Benchmark | Impact |\\n|---|---|---|---|\\n...",
    "### 📊 Detailed Workflow Analysis\\n- Exhaustive breakdown of each sub-workflow...",
    "### 🎛️ Actionable Matrix & Testing Framework\\n| Step | Workflow | Required Action | Expected Impact |\\n|---|---|---|---|\\n..."
  ],
  "recommendations": [
    "High-priority immediate action 1",
    "High-priority immediate action 2",
    "High-priority immediate action 3"
  ]
}
`;
}
