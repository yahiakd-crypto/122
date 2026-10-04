const fs = require('fs');
const readline = require('readline');

async function processTranscript() {
  const fileStream = fs.createReadStream('C:/Users/yahia/.gemini/antigravity-ide/brain/3eb38eac-6c8a-4620-a5ed-64e71779cf82/.system_generated/logs/transcript_full.jsonl');
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  for await (const line of rl) {
    if (line.includes('# BUILD THIS SKILL: E-COMMERCE GROWTH LOOP INTELLIGENCE ENGINE')) {
      const obj = JSON.parse(line);
      const text = obj.content;
      
      const startMarker = '# BUILD THIS SKILL: E-COMMERCE GROWTH LOOP INTELLIGENCE ENGINE';
      let startIndex = text.indexOf(startMarker);
      if (startIndex === -1) continue;
      
      const promptText = text.substring(startIndex);
      
      const fileContent = `export function buildGrowthLoopPrompt(ctx) {
  return \`${promptText.replace(/`/g, '\\`')}

---
# REQUIRED JSON OUTPUT FORMAT

You must output exactly this JSON schema. Do not include markdown blocks outside the JSON:
{
  "summary": "Executive summary of the entire loop.",
  "keyPoints": [
    "PRODUCT: [your analysis here]",
    "STRATEGY: [your analysis here]",
    "CREATIVE: [your analysis here]",
    "CAMPAIGN: [your analysis here]",
    "TRAFFIC: [your analysis here]",
    "ORDER: [your analysis here]",
    "CONFIRMATION: [your analysis here]",
    "DELIVERY: [your analysis here]",
    "RTO: [your analysis here]",
    "REVENUE: [your analysis here]",
    "PROFIT: [your analysis here]",
    "QUALITY: [your analysis here]",
    "SIGNAL: [your analysis here]",
    "OPTIMIZATION: [your analysis here]"
  ],
  "recommendations": [
    "Actionable next step 1",
    "Actionable next step 2"
  ]
}
\`;
}
`;

      fs.writeFileSync('lib/canvas/prompts/ecommerce_growth_loop_prompt.js', fileContent);
      console.log('Restored and updated ecommerce_growth_loop_prompt.js successfully!');
      return;
    }
  }
}

processTranscript().catch(console.error);
