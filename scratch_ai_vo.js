const fs = require('fs');

const path = 'c:\\Users\\yahia\\Downloads\\New folder\\BUILD THE AI PRODUCT RESEARCH & LANDING PAGE STRATEGY APP\\components\\AdTestingDashboard.jsx';

let content = fs.readFileSync(path, 'utf8');

// Find the textarea block and replace it with a block containing the textarea and the button
const targetMatch = /(\{skill\.withVoiceover && \(\s*<textarea[\s\S]*?\/>\s*\)\})/;

const newUi = `{skill.withVoiceover && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Voiceover Script</span>
                            <button
                              disabled={skill.isGeneratingVo}
                              onClick={async () => {
                                updateSkillData(skill.id, { isGeneratingVo: true });
                                try {
                                  const res = await fetch("/api/ai/execute-node", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({
                                      prompt: "Write a high-converting, punchy 30-45 second voiceover script for a direct-response video ad selling this product: " + JSON.stringify(upstreamOutputs).substring(0, 1000) + ". The script should be engaging, highlight the main pain point, and present the product as the ultimate solution. Return ONLY the raw script text without any intro, outro, quotes, or markdown formatting.",
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
                              }}
                              style={{ display: "flex", alignItems: "center", gap: 4, background: "#f1f5f9", border: "1px solid #cbd5e1", padding: "4px 10px", borderRadius: 6, fontSize: 10, fontWeight: 700, color: "#334155", cursor: skill.isGeneratingVo ? "wait" : "pointer" }}
                            >
                              <DynamicIcon name="Sparkles" size={12} color="#8b5cf6" /> 
                              {skill.isGeneratingVo ? "GENERATING..." : "GENERATE WITH AI"}
                            </button>
                          </div>
                          <textarea
                            value={skill.voiceoverScript || ''}
                            onChange={(e) => updateSkillData(skill.id, { voiceoverScript: e.target.value })}
                            placeholder="Paste your specific voiceover script here... (The AI will split it across the 10-second segments)"
                            style={{ width: "100%", height: 80, padding: "10px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 12, outline: "none", resize: "vertical", fontFamily: "inherit" }}
                          />
                        </div>
                      )}`;

if (content.match(targetMatch)) {
  content = content.replace(targetMatch, newUi);
  fs.writeFileSync(path, content, 'utf8');
  console.log('Modified AdTestingDashboard.jsx successfully with AI Generation button.');
} else {
  console.log('Could not find the target match.');
}
