const fs = require('fs');

const path = 'c:\\Users\\yahia\\Downloads\\New folder\\BUILD THE AI PRODUCT RESEARCH & LANDING PAGE STRATEGY APP\\components\\AdTestingDashboard.jsx';

let content = fs.readFileSync(path, 'utf8');

if (!content.includes("skill.type === 'cinematic_storyboard_director'")) {
  const insertSchema = `      } else if (skill.type === 'cinematic_storyboard_director') {
        schemaString = \`Return ONLY a valid JSON object matching this structure exactly (do not wrap in markdown).
{
  "title": "Title of the storyboard",
  "masterPrompt": "The Master Storyboard Prompt containing the character lock, product lock, and continuity rules.",
  "segments": [
    {
      "segmentName": "e.g. Segment 1 (0:00 - 0:10)",
      "timeRange": "0:00 - 0:10",
      "segmentPrompt": "The precise AI video generation prompt for these exact 10 seconds",
      "voiceover": "The voiceover script spoken during these 10 seconds"
    }
  ],
  "checklist": ["continuity matches at every boundary", "timings add up", "character & product locks present"]
}\`;
`;

  content = content.replace(
    "} else if (ADVANCED_PRODUCT_SCHEMA_STRINGS[skill.type]) {",
    insertSchema + "} else if (ADVANCED_PRODUCT_SCHEMA_STRINGS[skill.type]) {"
  );
  
  fs.writeFileSync(path, content, 'utf8');
  console.log('Modified AdTestingDashboard.jsx successfully.');
} else {
  console.log('Schema string for cinematic_storyboard_director already exists or not injected correctly.');
}
