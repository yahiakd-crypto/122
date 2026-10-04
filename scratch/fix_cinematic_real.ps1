param()
$ErrorActionPreference = "Stop"
$tick = [string][char]96

# ============ 1) REAL cinematic line: rebuild ONLY its buildPrompt ============
$reg = "C:\Users\yahia\Downloads\New folder\BUILD THE AI PRODUCT RESEARCH & LANDING PAGE STRATEGY APP\lib\canvas\SkillRegistry.js"
$bytes = [System.IO.File]::ReadAllBytes($reg)
$v = [System.Text.Encoding]::UTF8.GetString($bytes)
Write-Output ("origLen=" + $v.Length)

# find cinematic key (only first occurrence)
$c0 = $v.IndexOf("cinematic_storyboard_director:")
if ($c0 -lt 0) { Write-Output "CIN NOT FOUND"; exit 1 }
# find "=> " that precedes the first real backtick (opening of template)
$arrow = $v.IndexOf("=>", $c0)
# anchor: opening tick right after "=> "
$open = $v.IndexOf($tick, $arrow)
if ($open -lt 0 -or $open -gt $arrow + 40) { Write-Output "NO OPEN TICK"; exit 1 }
# find the LAST backtick before ", }" (closing of template)
$close = $v.LastIndexOf($tick, $c0 + 150000)
# safer: the closing tick is the one immediately before ", }"
$comma = $v.IndexOf(", }", $c0)
$close = $v.LastIndexOf($tick, $comma)
if ($close -lt 0) { Write-Output "NO CLOSE TICK"; exit 1 }

$head = $v.Substring(0, $open + 1)          # everything through opening tick
$tail = $v.Substring($close)                # closing tick + ", }..." (rest of line)
Write-Output ("headOK=" + $head.EndsWith($tick) + " tailHeadTick=" + $tail.StartsWith($tick))

# ---- rebuild buildPrompt body (NO backticks: use SENTINEL tokens; no ${...} either - use PLACEHOLDER) ----
$body = @'
# Skill: Cinematic Storyboard Director & Prompt Engineer
## Objective
Analyze a product and create a professional video storyboard plan: master storyboard + one prompt per 10-second segment chained to the previous segment, exactly 30s or 45s, never more than 45s.

## INPUT
Product to analyze: PLACEHOLDER_PRODUCT
Accept:
{ "product": {...}, "market": {...}, "video": { "duration": "" } }
If fields are missing, do not invent data; mark assumptions.

## STEP 1 - CALCULATE SEGMENTS (HARD CAP)
HARD DURATION VALUES: ONLY "30s" or "45s" are allowed. Default to 30s. If no duration given -> 30s. If user asks for less than 30s -> clamp UP to 30s. If user asks for more than 45s -> clamp DOWN to exactly 45s. NEVER generate more than 45 seconds.
segments = ceil(total_duration / 10): 30s -> 3 segments; 45s -> 4 segments (last = 5s).
Each 10s segment = 3 shots (0-3s, 3-6s, 6-10s). Continuous shot numbering 01..N across the whole video.

## STEP 2 - OUTPUT PROMPT 0: MASTER STORYBOARD
(1) TITLE: "Cinematic Storyboard (POV Character) - Affiliate Product PLACEHOLDER_PRODUCT" + duration + audio_mode ASMR + no dialog / no narrator / no subtitles
(2) CHARACTER SHEET: name, age, height, build, style, personality, identity + 4 reference views (profile-left, 3/4-left, back, lifestyle) + fixed character-lock line (face, glasses, outfit, hat, hair) repeated VERBATIM in every segment prompt
(3) PRODUCT SHEET: product, packaging description (colors, logo position, badge/ribbon, front text), key claims, hero-shot description
(4) COLOR PALETTE: 5 hex codes
(5) FULL SHOT LIST for the whole video: one line per shot = time range, visual, camera, ASMR sound design. Arc: Hook(product reveal) -> Open/Unbox -> Texture macro -> Pour/Prepare -> Toppings -> Consume(character) -> Beauty shot -> Product CTA
(6) MOOD/VIBE, CAMERA & TECHNIQUE, PROPS, VIDEO GOAL, HASHTAGS
(7) CONTINUITY BIBLE: fixed rules every segment MUST obey (character lock, product lock, lighting, lens, color grade, location - never re-introduce after segment shown)

## STEP 3 - OUTPUT PROMPT 1..N: SEGMENT PROMPTS (one per segment, chained)
For EACH segment output ONE full segment prompt with template:
SEGMENT k/N | k*10 seconds | 9:16 | audio_mode ASMR
START FRAME = END FRAME of previous segment copied VERBATIM (segment 1 = first frame after hook)
CONTINUITY LOCK: repeat the bible verbatim (character lock + product lock + lighting + lens + color grade + location)
Shot x (t1-t2): Visual | Camera | ASMR sound design (per shot) | one line per shot in this segment
END FRAME: the exact final frame of this segment
TRANSITION: cut / match cut - must match the START FRAME of the next segment
Chain all segments. Do NOT re-introduce character/product in later segments. Keep character, product, lighting, lens, color grade, location vocabulary IDENTICAL.

## RULES
- 30s -> exactly 3 segment prompts. 45s -> exactly 4 (last 5s). NEVER fewer, NEVER more.
- To extend beyond 30s, ONLY extend the MIDDLE (texture macro / pouring / toppings); NEVER extend the hook or the CTA.
- Never invent product claims, reviews, market data or performance. Mark missing info and reduce confidence.
- Return ONLY the structured JSON specified by the schema (summary = Master Prompt 0, keyPoints = segment prompts 1..N, recommendations = continuity/checklist).
'@
$body = $body.Replace("PLACEHOLDER_PRODUCT", "PLACEHOLDER_C)
$body = $body -replace "PLACEHOLDER_C", ("$" + "{ctx.productName}")

# final assembled cinematic line (template literal using runtime ticks only via buildPrompt: (ctx) => `${...}` )
$cinLine = $head + $body + $tail
Write-Output ("cinTicksInLine=" + (($cinLine.ToCharArray() | Where-Object { $_ -eq $tick }).Count))

# swap line in the text
$v2 = $v.Substring(0, $c0) + $cinLine + $v.Substring($close + ($v.Length - $close - 0))  # placeholder, rebuilt below
