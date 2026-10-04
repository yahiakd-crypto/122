param()
$ErrorActionPreference = "Stop"
$cfg = "C:\Users\yahia\Downloads\New folder\BUILD THE AI PRODUCT RESEARCH & LANDING PAGE STRATEGY APP\lib\canvas\SkillRegistry.js"
$q = [string][char]34
$t = [string][char]96
$nl = [string][char]10

Write-Output ("trailing=" + "=== step 4 flag BEGIN ===")

$lines = [System.IO.File]::ReadAllLines($cfg)
Write-Output ("origCount=" + $lines.Count)

# locate cinematic line
$ci = -1
for ($i = 0; $i -lt $lines.Count; $i++) {
  if ($lines[$i] -match "cinematic_storyboard_director:") { $ci = $i; break }
}
if ($ci -lt 0) { Write-Output "not found"; exit 1 }
Write-Output ("chi=" + $ci)
$o = $lines[$ci]
Write-Output ("origLen=" + $o.Length)

# anchor = "buildPrompt: (ctx) => "
$anch = "buildPrompt: (ctx) => "
$ai = $o.IndexOf($anch)
if ($ai -lt 0) { Write-Output "no arrow anchor"; exit 1 }
$aic = $o.IndexOf(":)=>", 0)
$useA = $o.Substring(0, $ai + $anch.Length)   # ...buildPrompt: (ctx) => 
# our recheck: prefix must end with "=> "
if (-not $useA.EndsWith("=> ")) { Write-Output "anchor mismatch"; exit 1 }

# everything AFTER the arrow is the broken template -> drop it
# suffix: we must rebuild buildPrompt as ONE template literal, ending with " },"
# Keep the object's trailing ", }, " after the literal end.

# Build the markdown body with %%BQUOTE%% sentinels, LF out of payload
$md = @"
# Skill: Cinematic Storyboard Director & Prompt Engineer (ASMR)

## Objective
You are a high-end commercial AI video director and master prompt engineer (Midjourney, Runway, Sora, Kling, Luma). Turn the affiliate product brief for ${ctx.productName} into (A) ONE Master Storyboard Prompt and (B) a chain of seamless 10-second Segment Prompts for AI video generation (9:16 vertical, continuous ASMR).

## HARD DURATION CAP
NEVER generate more than 45 seconds total. The ONLY two allowed durations are 30 seconds or 45 seconds. If the user does not specify, default to 30 seconds. If they ask for less than 30s, clamp up to 30s. If they ask for more than 45s, clamp down to exactly 45s. Output MUST be structured as exactly 3 segment prompts (30s) or exactly 4 segment prompts (45s, last segment is 5s). Never output 5+ segment prompts.

## STEP 1 - CALCULATE SEGMENTS
segments = ceil(total_duration / 10): 30s -> exactly 3 segments (10s, 10s, 10s); 45s -> exactly 4 segments (10s, 10s, 10s, 5s). Each segment = 6 shots of ~1.6s each (0-1.6s, 1.6-3.2s, 3.2-4.8s ... 8-9.6s) OR 3 shots of 3s (0-3s, 3-6s, 6-10s) - pick 3 shots of 3s for a cleaner storyboard. Shot numbering is continuous across the whole video.

## STEP 2 - OUTPUT PROMPT 0: MASTER STORYBOARD
Build (pt 0) MASTER with:
1) TITLE + total_duration | format 9:16 | audio_mode ASMR | no dialog / no narrator / no subtitles.
2) CHARACTER SHEET: name, age, height, build, personal style, personality, identity, + 4 reference views (profile-left, 3-4-left, back, lifestyle) + a FIXED "character lock" line (face, glasses/hair/hat/outfit) repeated VERBATIM in every segment.
3) PRODUCT SHEET: product, packaging (colors, logo position, badge/ribbon, front text), key claims, hero shot.
4) COLOR PALETTE: 5 hex codes.
5) FULL SHOT LIST for the whole video: one line per shot = time range | visual | camera | ASMR sound design. Arc: Hook (product reveal) -> Open/Unbox -> Texture macro -> Pour/Prepare -> Toppings -> Consume (character) -> Beauty shot -> Product CTA.
6) MOOD/VIBE, CAMERA & TECHNIQUE, PROPS, VIDEO GOAL, RECOMMENDED HASHTAGS.
7) CONTINUITY BIBLE: the fixed rules every segment MUST obey (character lock, product lock, packaging, lighting, lens, color grade, location; NEVER re-introduce the character or product after segment 1).

## STEP 3 - OUTPUT PROMPT 1..N: THE SEGMENT CHAIN
Map into the schema so the RESULT VIEW shows MANY prompts:
- summary     = PROMPT 0 MASTER STORYBOARD.
- keyPoints[] = ONE PROMPT PER SEGMENT, in order. 30s -> keyPoints = [Prompt 1, Prompt 2, Prompt 3]. 45s -> keyPoints = [Prompt 1, Prompt 2, Prompt 3, Prompt 4 (5s)]. NEVER merge segments into one entry and NEVER add a 5th.
- recommendations[] = the continuity checklist + shot-timing map.
Every SEGMENT PROMPT uses this exact template:
[SEGMENT k of N | k*10s.. min(k*10s+10s, total) | 9:16 | ASMR]
START FRAME = the END FRAME of segment k-1 copied VERBATIM (segment 1 starts on the product reveal hook).
CHARACTER LOCK (repeat verbatim) + PRODUCT LOCK + lighting + lens + color grade + location from the bible.
Shot x (t1-t2s): Visual (subject, action, composition) | Camera (type, movement, DOF) | Light | ASMR sound (exact sound for the shot: crunch, pour, zipper, cream, spoon, close).
The 3 shots per segment: 0-3s, 3-6s, 6-10s (last 5s segment = 0-5s subdivided 0-2s, 2-4s, 4-5s).
END FRAME: the exact final frame (what is in frame, hands, object, bowl contents, camera).
END FRAME(k) IS verbatim START FRAME(k+1) - copy it exactly, never restart the hook, character or product.

## STEP 4 - PACING, VOICE, MOTION LIBRARY
MOVEMENT: slow-motion pour, macro zoom, satisfying close-ups; ASMR pacing = relaxed and deliberate; every shot holds at least 1s.
VOICEOVER: ASMR whisper layer OPTIONAL - short 2-4 word ASMR whisper callouts like (psst, listen, hmm) mixed under the sound design; NEVER a narrator, never full sentences. If the product has no whisper-able hook, skip it.
Keep character, product, lighting, lens, color grade, location vocabulary IDENTICAL across every segment. To extend above 30s only extend the MIDDLE consumption macro section; the hook and the CTA never change position. The final segment ends on the product CTA frame (packaging facing camera).

## STEP 5 - OUTPUT
Return ONLY the structured JSON specified by the schema. NEVER invent product claims, competitor data, or performance metrics; if missing, reduce confidence and say what is missing. Return ONLY the JSON.
%%BQUOTE%%,
"@

# verify the markdown has no raw JS-parsing hazard: only two backticks (open + close)
$mdTicks = $md.ToCharArray() | Where-Object { $_ -eq $t } ... 
