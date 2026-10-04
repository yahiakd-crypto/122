const fs = require('fs');

const path = 'c:\\Users\\yahia\\Downloads\\New folder\\BUILD THE AI PRODUCT RESEARCH & LANDING PAGE STRATEGY APP\\components\\AdTestingDashboard.jsx';

let content = fs.readFileSync(path, 'utf8');

const oldOnClick = /onClick=\{async \(\) => \{\s*updateSkillData\(skill\.id, \{ isGeneratingVo: true \}\);\s*try \{\s*const res = await fetch\("\/api\/ai\/execute-node"[\s\S]*?JSON\.stringify\(\{[\s\S]*?prompt: "Write a high-converting, punchy 30-45 second voiceover script for a direct-response video ad selling this product: " \+ JSON\.stringify\(upstreamOutputs\)\.substring\(0, 1000\) \+ "\.[\s\S]*?catch\(e\) \{\s*updateSkillData\(skill\.id, \{ isGeneratingVo: false \}\);\s*\}\s*\}\}/;

const newOnClick = `onClick={async () => {
                                updateSkillData(skill.id, { isGeneratingVo: true });
                                try {
                                  // Compute basic upstream context for the VO generator
                                  const upstream = connections.filter(c => c.toId === skill.id).map(c => c.fromId);
                                  const outputs = upstream.map(id => {
                                    if (id.startsWith('group_')) {
                                      const g = groups[parseInt(id.split('_')[1])];
                                      return g ? g.products : null;
                                    }
                                    const s = skills.find(sk => sk.id === id);
                                    return s ? s.result : null;
                                  }).filter(Boolean);
                                  
                                  const contextStr = outputs.length > 0 ? JSON.stringify(outputs).substring(0, 1200) : "product from connected node";

                                  const res = await fetch("/api/ai/execute-node", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({
                                      prompt: "Write a high-converting, punchy 30-45 second voiceover script for a direct-response video ad selling this product context: " + contextStr + ". The script should be engaging, highlight the main pain point, and present the product as the ultimate solution. Return ONLY the raw script text without any intro, outro, quotes, or markdown formatting.",
                                      skillId: 'generic',
                                      schemaString: ''
                                    })
                                  });
                                  const data = await res.json();
                                  updateSkillData(skill.id, { 
                                    voiceoverScript: typeof data.result === 'string' ? data.result : (data.rawOutput || ''), 
                                    isGeneratingVo: false 
                                  });
                                } catch(e) {
                                  updateSkillData(skill.id, { isGeneratingVo: false });
                                }
                              }}`;

if (content.match(oldOnClick)) {
  content = content.replace(oldOnClick, newOnClick);
  fs.writeFileSync(path, content, 'utf8');
  console.log('Fixed GENERATE WITH AI button scope issue.');
} else {
  console.log('Could not find the old onClick handler. The regex might need to be adjusted.');
}
