$ErrorActionPreference = "Stop"
$reg = "C:\Users\yahia\Downloads\New folder\BUILD THE AI PRODUCT RESEARCH & LANDING PAGE STRATEGY APP\lib\canvas\SkillRegistry.js"
$t = [System.IO.File]::ReadAllText($reg)

# Locate the cinematic_storyboard_director entry
$start = $t.IndexOf("cinematic_storyboard_director:")
if ($start -lt 0) { Write-Output "ENTRY MISSING"; exit 1 }

# Find the buildPrompt backtick that opens the template literal right after "=> `"
$openMarker = "=> `"
$openIdx = $t.IndexOf($openMarker, $start)
if ($openIdx -lt 0) { Write-Output "OPEN MISSING"; exit 1 }
$openIdx += $openMarker.Length - 1   # now points AT the backtick

# Find the closing backtick that ends this template: the first "`" followed by " }" 
# that belongs to this entry (scan forward from openIdx, tracking ${...} nesting is unnecessary
# since any `${` is escaped as `\${` only inside... check).
$closeIdx = -1
for ($i = $openIdx + 1; $i -lt $t.Length; $i++) {
  $c = $t[$i]
  if ($c -eq '`' -and $i + 1 -lt $t.Length) {
    $n = $t[$i + 1]
    if ($n -eq '}') { $i++ ; continue }        # escaped `} inside ${...}
    if ($n -eq '{') { $i += 3; continue }       # ${  ... } skip
    if ($n -eq '$' ) { $i += 1; continue }      # `$ escaped
    if ($n -eq '`') { $i += 1; continue }       # ``
    if ($n -eq ' ' -and $i + 2 -lt $t.Length -and $t[$i+2] -eq '}') {  # backtick + space + } => template close
      $closeIdx = $i; break
    }
  }
}
if ($closeIdx -lt 0) { Write-Output "CLOSE MISSING"; exit 1 }

$newPrompt = @'
=> `You are a Cinematic Storyboard Director and Prompt Engineer for AI video generation. Turn the product brief for "${ctx.productName}" into (A) ONE Master Storyboard Prompt and (B) a chain of seamless 10-second Segment Prompts. STEP 1 - CALCULATE SEGMENTS: segments = ceil(total_duration / 10). Each segment = 10 seconds except the last if the total is not a multiple of 10 (e.g. 45s -> 4 segments: 10+10+10+5). Each 10s segment has 3 shots: 0-3s, 3-6s, 6-10s (3+3+4). Shot numbering is continuous across the whole video (Shot 01, 02, 03...continuity). STEP 2 - OUTPUT PROMPT 0: MASTER STORYBOARD. Sections in ORDER: (1) TITLE "Cinematic Storyboard (POV Character) - Affiliate Product ${ctx.productName}" + total_duration | audio_mode (default ASMR) | no dialog / no narrator / no subtitles, (2) CHARACTER SHEET: name, age, height, build, personal style, personality, identity + 4 reference views (profile-left, 3/4-left, back, lifestyle) + a fixed "character lock" one-liner (face, glasses, outfit, hat, hair) that is repeated VERBATIM in EVERY segment prompt, (3) PRODUCT SHEET: product, packaging description (colors, logo position, badge/ribbon, front text), key claims, hero-shot description, (4) COLOR PALETTE: 5 hex codes, (5) FULL SHOT LIST for the whole video with one entry per shot: time range, visual description, camera type, ASMR sound design. Follow this arc: Hook (product reveal) -> Open / Unbox -> Texture macro -> Pour / Prepare -> Add toppings -> Consume (character) -> Beauty shot -> Product CTA. (6) MOOD / VIBE, CAMERA & TECHNIQUE, PROPS, VIDEO GOAL, RECOMMENDED HASHTAGS, (7) CONTINUITY BIBLE: the RULES EVERY SEGMENT MUST OBEY (character lock, product lock, lighting, lens, color grade, location, never re-introduce character or product in segments 2+ unless the shot list says so). STEP 3 - OUTPUT PROMPT 1..N: SEGMENT PROMPTS, ONE prompt per 10-second segment, using this template for EVERY segment: [SEGMENT k of N | start-end in seconds | format 9:16 | audio_mode ASMR] START FRAME = exact END FRAME of the previous segment (copy the previous segment's END FRAME literally; for segment 1 it is the last frame of PROMPT 0's hook shot), CONTINUITY LOCK (character lock + product lock + lighting + lens + color grade + location + no re-introduction), SHOT x (t1-t2s): Visual (subject, action, composition), Camera (POV / close-up / macro, movement, DOF), Light (natural soft daylight, direction), Sound (ASMR details: crunch, pour, zipper, spoon — name every sound the shot needs), repeated for the 1-3 shots of that segment, END FRAME: the exact final frame (what is in frame, hand positions, object positions, bowl contents, camera angle), TRANSITION: cut / match cut / continuous. SEGMENT 1 must begin at Shot 01 of the shot list and N must end on the CTA frame (packaging facing camera). Never shorten the hook or CTA to gain length; to extend beyond 30s only extend the MIDDLE consumption section with more toppings and more macro angles. CHARACTER, PRODUCT, LIGHTING, LENS, COLOR GRADE and LOCATION vocabulary MUST be identical across ALL prompts. STEP 4 - THE RESULT VIEW SHOWS THE FULL CHAIN: write PROMPT 0 as the single "summary" string, write EACH of the N segment prompts as ITS OWN entry in "keyPoints" (so a 30s video produces exactly 3 keyPoints entries: Prompt 1 = 0-10s hook+open, Prompt 2 = 10-20s texture+pour, Prompt 3 = 20-30s consume+CTA; a 45s video produces exactly 4: 10+10+10+5), each keyPoints entry containing its full "=> `"-prefixed segment prompt with START FRAME -> CONTINUITY LOCK -> SHOT list -> END FRAME -> TRANSITION, and write the continuity checklist as "recommendations". Never invent data about the product, character or performance — use "Not available". Use simple, clear, concrete writing in the buyer's words. Return ONLY the structured JSON specified by the schema.
'
