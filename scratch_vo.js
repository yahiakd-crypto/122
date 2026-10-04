const fs = require('fs');

const path = 'c:\\Users\\yahia\\Downloads\\New folder\\BUILD THE AI PRODUCT RESEARCH & LANDING PAGE STRATEGY APP\\components\\AdTestingDashboard.jsx';

let content = fs.readFileSync(path, 'utf8');

// 1. Inject the UI
if (!content.includes("skill.type === 'cinematic_storyboard_director' && skill.status !== 'running'")) {
  const uiInjection = `
                  {skill.type === 'cinematic_storyboard_director' && skill.status !== 'running' && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
                      <button onClick={() => updateSkillData(skill.id, { withVoiceover: !skill.withVoiceover })} style={{ alignSelf: "flex-start", display: "flex", alignItems: "center", gap: 6, background: skill.withVoiceover ? "#dcfce7" : "#fff", border: \`1px solid \${skill.withVoiceover ? "#22c55e" : "#e2e8f0"}\`, padding: "6px 12px", borderRadius: 20, fontSize: 11, color: skill.withVoiceover ? "#15803d" : "#475569", cursor: "pointer", fontWeight: 700 }}>
                        <DynamicIcon name="Mic" size={12} /> GENERATE VOICEOVER {skill.withVoiceover ? "ON" : "OFF"}
                      </button>
                      {skill.withVoiceover && (
                        <textarea
                          value={skill.voiceoverScript || ''}
                          onChange={(e) => updateSkillData(skill.id, { voiceoverScript: e.target.value })}
                          placeholder="Paste your specific voiceover script here... (The AI will split it across the 10-second segments)"
                          style={{ width: "100%", height: 60, padding: "10px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 12, outline: "none", resize: "vertical", fontFamily: "inherit" }}
                        />
                      )}
                    </div>
                  )}
`;
  
  content = content.replace(
    /(\{\/\* ══ \[E_SkillNode_ApInputs\] Advanced Product Intelligence)/,
    uiInjection + "\n                  $1"
  );
}

// 2. Inject the prompt logic
if (!content.includes("=== STRICT VOICEOVER SCRIPT ===")) {
  const promptInjection = `
      if (skill.type === 'cinematic_storyboard_director' && skill.withVoiceover && skill.voiceoverScript) {
        prompt += \`\\n\\n=== STRICT VOICEOVER SCRIPT ===\\nThe user has provided the EXACT voiceover script to be used. You MUST split this script across the 10-second segments. Do not invent your own voiceover.\\nScript: "\${skill.voiceoverScript}"\\n===============================\\n\`;
      } else if (skill.type === 'cinematic_storyboard_director' && !skill.withVoiceover) {
        prompt += \`\\n\\n=== NO VOICEOVER ===\\nThe user has chosen NOT to have a voiceover. Leave the "voiceover" field empty for ALL segments.\\n===============================\\n\`;
      }
`;
  
  content = content.replace(
    /(if \(COMPANY_PLAN_SKILLS\.includes\(skill\.type\)\) \{)/,
    promptInjection + "\n      $1"
  );
}

fs.writeFileSync(path, content, 'utf8');
console.log('Modified AdTestingDashboard.jsx successfully with voiceover feature.');
