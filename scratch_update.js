const fs = require('fs');
const path1 = 'c:\\Users\\yahia\\Downloads\\New folder\\BUILD THE AI PRODUCT RESEARCH & LANDING PAGE STRATEGY APP\\components\\AdTestingDashboard.jsx';
const path2 = 'c:\\Users\\yahia\\Downloads\\New folder\\BUILD THE AI PRODUCT RESEARCH & LANDING PAGE STRATEGY APP\\lib\\canvas\\SkillRegistry.js';

// 1. Update AdTestingDashboard.jsx
let content1 = fs.readFileSync(path1, 'utf8');

// Inject segmentDuration into buildPrompt context
content1 = content1.replace(
  /let prompt = skillDef\.buildPrompt\(\{ \.\.\.resolvedInput, instructions: skill\.instructions \}\);/,
  "let prompt = skillDef.buildPrompt({ ...resolvedInput, instructions: skill.instructions, segmentDuration: skill.segmentDuration || 10 });"
);

// Add the segment duration UI and update the AI generation prompt
const oldVoiceoverUI = /\{skill\.withVoiceover && \(\s*<div style=\{\{ display: "flex", flexDirection: "column", gap: 6 \}\}\>[\s\S]*?\}\)/;
const newVoiceoverUI = `{skill.withVoiceover && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Segment Duration (sec):</span>
                            <input
                              type="number"
                              min="1"
                              max="60"
                              value={skill.segmentDuration || 10}
                              onChange={(e) => updateSkillData(skill.id, { segmentDuration: parseInt(e.target.value) || 10 })}
                              style={{ width: "60px", padding: "4px 8px", borderRadius: 6, border: "1px solid #cbd5e1", fontSize: 12, outline: "none" }}
                            />
                          </div>

                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Voiceover Scripts (3 Ideas)</span>
                            <button
                              disabled={skill.isGeneratingVo}
                              onClick={async () => {
                                updateSkillData(skill.id, { isGeneratingVo: true });
                                try {
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
                                      prompt: "Write 3 DISTINCT high-converting, punchy 30-60 second voiceover scripts (one for each distinct video idea) for a direct-response video ad selling this product context: " + contextStr + ". Return ONLY the raw script texts clearly separated by '--- VIDEO IDEA 1 ---', '--- VIDEO IDEA 2 ---', and '--- VIDEO IDEA 3 ---', without any intro, outro, or markdown formatting.",
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
                              {skill.isGeneratingVo ? "GENERATING..." : "GENERATE 3 SCRIPTS WITH AI"}
                            </button>
                          </div>
                          <textarea
                            value={skill.voiceoverScript || ''}
                            onChange={(e) => updateSkillData(skill.id, { voiceoverScript: e.target.value })}
                            placeholder="Paste your 3 specific voiceover scripts here... (The AI will split them across the segments)"
                            style={{ width: "100%", height: 120, padding: "10px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 12, outline: "none", resize: "vertical", fontFamily: "inherit" }}
                          />
                        </div>
                      )}`;

if (content1.match(oldVoiceoverUI)) {
  content1 = content1.replace(oldVoiceoverUI, newVoiceoverUI);
  fs.writeFileSync(path1, content1, 'utf8');
  console.log('Modified AdTestingDashboard.jsx successfully.');
} else {
  console.log('Could not find voiceover UI in AdTestingDashboard.jsx.');
}

// 2. Update SkillRegistry.js
let content2 = fs.readFileSync(path2, 'utf8');
const oldPrompt = 'cinematic_storyboard_director: { category: "ADVANCED_CREATIVE", label: "Cinematic Storyboard Director & Prompt Engineer", icon: "Film", desc: "Storyboard. Cinematic Storyboard Director — turn a product brief into 3 distinct video ideas, each with a Master Storyboard Prompt and a chain of seamless 10-second AI-video Segment Prompts with voiceover", requiredInputs: ["productName"], outputSchema: SchemaCinematicStoryboard, buildPrompt: (ctx) => `You are a high-end Commercial AI Video Director and Master Prompt Engineer (Midjourney/Runway/Sora/Kling/Luma expert). Your goal is to design 3 DIFFERENT premium, high-converting cinematic video ad ideas for the product: "${ctx.productName}". For EACH idea, do the following: STEP 1: MASTER PROMPT: Create a "Continuity Bible". This must include: Exact Character Locks (MUST specify a visible human spokesperson/creator who speaks directly to the camera), Exact Product Locks (packaging, shape, colors, branding), and Cinematic Style (Camera type e.g. "Shot on ARRI Alexa 65", Lens e.g. "35mm prime lens", Lighting e.g. "Volumetric soft cinematic lighting", Color Grade). STEP 2: TIMELINE SEGMENTS: A full ad should be 30 to 60 seconds long. Break the entire video into a chain of exactly 10-second continuous segments (so 3 to 6 segments per idea). For EVERY segment, write an EXTREMELY PROFESSIONAL AI video generation prompt. A professional prompt MUST include: The continuity locks, Precise camera movement (e.g. "Slow tracking shot", "Fast whip pan"), Depth of field, Subject action (If there is voiceover, you MUST describe the character actively talking/lipsyncing to the camera), and highly descriptive visual details. Provide a perfectly paced Voiceover script for those 10 seconds. Output exactly according to the JSON schema, returning an array of exactly 3 ideas in the \\\'ideas\\\' array. Be highly descriptive, visually stunning, and tailored for high-converting marketing ads.` },';
const newPrompt = 'cinematic_storyboard_director: { category: "ADVANCED_CREATIVE", label: "Cinematic Storyboard Director & Prompt Engineer", icon: "Film", desc: "Storyboard. Cinematic Storyboard Director — turn a product brief into 3 distinct video ideas, each with a Master Storyboard Prompt and a chain of seamless segment AI-video Prompts with voiceover", requiredInputs: ["productName"], outputSchema: SchemaCinematicStoryboard, buildPrompt: (ctx) => `You are a high-end Commercial AI Video Director and Master Prompt Engineer (Midjourney/Runway/Sora/Kling/Luma expert). Your goal is to design 3 DIFFERENT premium, high-converting cinematic video ad ideas for the product: "${ctx.productName}". For EACH idea, do the following: STEP 1: MASTER PROMPT: Create a "Continuity Bible". This must include: Exact Character Locks (MUST specify a visible human spokesperson/creator who speaks directly to the camera), Exact Product Locks (packaging, shape, colors, branding), and Cinematic Style (Camera type e.g. "Shot on ARRI Alexa 65", Lens e.g. "35mm prime lens", Lighting e.g. "Volumetric soft cinematic lighting", Color Grade). STEP 2: TIMELINE SEGMENTS: A full ad should be 30 to 60 seconds long. Break the entire video into a chain of exactly ${ctx.segmentDuration || 10}-second continuous segments. For EVERY segment, write an EXTREMELY PROFESSIONAL AI video generation prompt. A professional prompt MUST include: The continuity locks, Precise camera movement (e.g. "Slow tracking shot", "Fast whip pan"), Depth of field, Subject action (If there is voiceover, you MUST describe the character actively talking/lipsyncing to the camera), and highly descriptive visual details. Provide a perfectly paced Voiceover script for those ${ctx.segmentDuration || 10} seconds. Output exactly according to the JSON schema, returning an array of exactly 3 ideas in the \\\'ideas\\\' array. Be highly descriptive, visually stunning, and tailored for high-converting marketing ads.` },';

if (content2.includes('cinematic_storyboard_director: { category: "ADVANCED_CREATIVE"')) {
  // Use regex to replace the old block robustly
  const regex = /cinematic_storyboard_director: \{[\s\S]*?buildPrompt: \(ctx\) => `You are a high-end Commercial AI Video Director[\s\S]*?ads\.` \},/;
  content2 = content2.replace(regex, newPrompt);
  
  // Need to also update the JSON schema descriptions in SkillRegistry.js that hardcode "10 seconds"
  content2 = content2.replace(
    /timeRange: z\.string\(\)\.describe\("Exact time range in seconds"\),\s*segmentPrompt: z\.string\(\)\.describe\("The precise AI video generation prompt for these exact 10 seconds"\),\s*voiceover: z\.string\(\)\.describe\("The voiceover script spoken during those 10 seconds"\)\s*\}\)\)\.describe\("The continuous chain of 10-second segments"\)/,
    'timeRange: z.string().describe("Exact time range in seconds"),\n      segmentPrompt: z.string().describe("The precise AI video generation prompt for the segment length"),\n      voiceover: z.string().describe("The voiceover script spoken during this segment")\n    })).describe("The continuous chain of segments")'
  );
  
  fs.writeFileSync(path2, content2, 'utf8');
  console.log('Modified SkillRegistry.js successfully.');
} else {
  console.log('Could not find cinematic_storyboard_director in SkillRegistry.js');
}

// 3. Update CinematicStoryboard.jsx hardcoded labels
const path3 = 'c:\\Users\\yahia\\Downloads\\New folder\\BUILD THE AI PRODUCT RESEARCH & LANDING PAGE STRATEGY APP\\components\\CinematicStoryboard.jsx';
let content3 = fs.readFileSync(path3, 'utf8');
content3 = content3.replace(/2\. TIMELINE SEGMENTS \(10s EACH\)/, "2. TIMELINE SEGMENTS");
fs.writeFileSync(path3, content3, 'utf8');
console.log('Modified CinematicStoryboard.jsx successfully.');
