$ErrorActionPreference = "Stop"
# REAL compiled path (matches the Next error shown by user)
$reg = "C:\Users\yahia\Downloads\New folder\BUILD THE AI PRODUCT RESEARCH & LANDING PAGE STRATEGY APP\lib\canvas\SkillRegistry.js"
$lines = [System.IO.File]::ReadAllLines($reg)

# --- rebuild cinematic_storyboard_director line as a single template literal with EXACTLY 2 backticks ---
$tick = [string][char]96
$bq = "@@BQUOTE@@"
$cinBody = "You are a world-class Cinematic Storyboard Director and prompt engineer for AI video generation. Build a premium seamless ASMR cinematic storyboard for the product: " + $tick + "${" + "ctx.productName" + "}" + $tick + ". HARD DURATION RULE: total_duration MUST be 30 seconds or 45 seconds ONLY - NEVER anything else. Default to 30s. If the user asks for less than 30s clamp UP to exactly 30s. If they ask for more than 45s clamp DOWN to exactly 45s. NEVER generate a video longer than 45s. segments = ceil(duration / 10): 30s -> 3 segments (10+10+10); 45s -> 4 segments (10+10+10+5, last 5s). STEP 1 - MASTER STORYBOARD (Prompt 0): one locked continuity bible: character sheet (locked identity + profile / 3-quarter / back / lifestyle reference shots), product lock (packaging colors, logo, front text, badge, hero shot), palette (5 hex), full shot list per 10s with time ranges following the arc Hook -> Open/Unbox -> Texture macro -> Pour/Prepare -> Add toppings -> Consume -> Beauty shot -> Product CTA, mood/vibe, camera & technique, props, video goal, hashtags, ASMR sound design with no dialog / no narrator / no subtitles. STEP 2 - ONE PROMPT PER 10s SEGMENT (Prompt 1..N) chained: each segment prompt starts EXACTLY at the END FRAME of the previous prompt (copy that end frame verbatim), repeats the continuity bible + character lock + product lock verbatim, lists 1-3 shots for its 10s window with time range, visual, camera, ASMR sound, and ends on the frame the next segment starts from. NEVER re-introduce character or product identity in later segments. Output ONLY structured JSON per the schema: summary = the MASTER STORYBOARD prompt; keyPoints[] = one segment prompt per 10s (30s->3 entries, 45s->4 with the last 5s on a CTA frame); recommendations[] = continuity checklist + shot timing map + duration clamp note (30s or 45s only)."
$entryLine = '  cinematic_storyboard_director: { category: "ADVANCED_CREATIVE", label: "Cinematic Storyboard Director & Prompt Engineer", icon: "Film", desc: "ASMR cinematic storyboard with hard 30s/45s cap, locked continuity bible, chained per-10s segment prompts with exact end-frame continuity", requiredInputs: ["productName"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => ' + $bq + $cinBody + $bq + ' },'

$entry = $entryLine.Replace($bq, $tick)
$evaluated = $entry  # already swapped
Write-Output ("cinTicks=" + ([regex]::Matches($entry, [regex]::Escape($tick))).Count)

# locate cinematic line
$cinAt = -1
for ($i = 0; $i -lt $lines.Count; $i++) { if ($lines[$i].TrimStart().StartsWith("cinematic_storyboard_director:")) { $cinAt = $i; break } }
Write-Output ("cinAt=" + $cinAt)
if ($cinAt -lt 0) { Write-Output "NO CIN LINE"; exit 1 }

# locate end of that entry = the closing "  }," or "  }, //" line
$cinEnd = $cinAt
for ($i = $cinAt + 1; $i -lt $lines.Count; $i++) {
  $t = $lines[$i].Trim()
  if ($t -eq "}," -or $t -eq "}," -or $t.StartsWith("},")) { $cinEnd = $i; break }
}
Write-Output ("cinEnd=" + $cinEnd)

$new = New-Object System.Collections.Generic.List[string]
for ($i = 0; $i -lt $cinAt; $i++) { $new.Add($lines[$i]) }
$new.Add($evaluated)             # validated: exactly 2 backticks + balanced
for ($i = $cinEnd + 1; $i -lt $lines.Count; $i++) { $new.Add($lines[$i]) }

$text = [string]::Join("`n", $new.ToArray()) + "`n"
[System.IO.File]::WriteAllText($reg, $text)
Write-Output ("writtenLines=" + $new.Count)

# --- verify ---
$v = [System.IO.File]::ReadAllText($reg)
Write-Output ("len=" + $v.Length)
Write-Output ("cin=" + $v.Contains("cinematic_storyboard_director:"))
Write-Output ("cinDup=" + ([regex]::Matches($v, "cinematic_storyboard_director:")).Count)
Write-Output ("ad=" + $v.Contains("ad_creative_style_detector:"))
$ob=0;$cb=0; foreach($c in $v.ToCharArray()){if($c -eq '{'){$ob++}elseif($c -eq '}'){$cb++}}
Write-Output ("braces=" + $ob + "/" + $cb)
Write-Output ("export=" + $v.Contains("export default"))
Write-Output ("tailOK=" + $v.TrimEnd().EndsWith("};"))