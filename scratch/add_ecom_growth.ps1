param()
$ErrorActionPreference = "Stop"
$tick = [string][char]96

# REAL file the app loads (confirmed path from compile error)
$reg = "C:\Users\yahia\Downloads\New folder\BUILD THE AI PRODUCT RESEARCH & LANDING PAGE STRATEGY APP\lib\canvas\SkillRegistry.js"
if (-not (Test-Path -LiteralPath $reg)) {
  # fallback: single prefix we verified
  $reg = "C:\Users\yahia\Downloads\New folder\BUILD THE AI PRODUCT RESEARCH & LANDING PAGE STRATEGY APP\lib\canvas\SkillRegistry.js"
}
$lines = [System.IO.File]::ReadAllLines($reg)
Write-Output ("origLines=" + $lines.Count)

# ---- built entry ----
$entry = @'
  ecommerce_growth_loop_intelligence_engine: { category: "ADVANCED_OFFER", label: "E-Commerce Growth Loop Intelligence Engine", icon: "TrendingUp", desc: "GrowthLoop. Analyze the complete connected e-commerce feedback loop product->strategy->creative->campaign->traffic->order->confirmation->delivery->RTO->revenue->profit->customer quality->ad-platform signal->better targeting->new traffic and identify what is generating profitable customers, what is destroying profit, the weakest funnel stage and the next optimized traffic strategy", requiredInputs: ["productName"], outputSchema: SchemaStandardInsight, buildPrompt: (ctx) => %%BQUOTE%%You are an advanced AI E-commerce Growth Loop Intelligence Engine for COD and online commerce. Your job is to analyze the complete business as ONE connected feedback loop and NEVER as independent stages. The loop: PRODUCT -> STRATEGY -> CREATIVE -> CAMPAIGN -> TRAFFIC -> ORDER -> CONFIRMATION -> DELIVERY -> RTO -> REVENUE -> PROFIT -> CUSTOMER QUALITY -> AD PLATFORM SIGNAL -> BETTER TARGETING / OPTIMIZATION -> NEW TRAFFIC -> PRODUCT / STRATEGY / CREATIVE IMPROVEMENT. The ultimate objective is to find what generates PROFITABLE CUSTOMERS, identify what DESTROYS PROFIT, improve the weakest part of the funnel, improve ad-platform signals, and generate the next optimized traffic strategy.

## INPUT
Analyze: product data, product image, product URL, supplier data, product cost, selling price, product category, product description, buyer persona, competitor data, creative data, image ads, video ads, ad copy, hooks, campaign data, ad set data, ad data, Meta Ads metrics, pixel data, CAPI data, website analytics, landing page data, orders, confirmation data, delivery data, RTO data, revenue, costs, customer data, wilaya/location data, courier data, historical performance, 7-day/14-day/30-day averages whenever available. If some data is missing: do not invent it, mark it as missing, continue with available data)Skip and identify which missing data would materially improve the analysis.

## STEP 1 - PRODUCT INTELLIGENCE
Analyze: demand, problem solved, customer need, differentiation, market size, competition, trend, seasonality, lifecycle, quality risk, supplier risk, cost, price, margin, shipping, RTO exposure, customer quality, repeat purchase, upsell, cross-sell, expansion. Generate: positioning, USP, strengths, weaknesses, risks, opportunities, test recommendation.

## STEP 2 - STRATEGY INTELLIGENCE
Analyze target market: segments, personas, demographics, psychographics, behaviors, pain points, desires, objections, buying triggers, barriers, awareness level. Analyze the offer: price, discount, bundle, shipping, COD, guarantee, urgency, scarcity, bonus, upsell, cross-sell. Generate core offer, alternatives, positioning angles, per-persona offers.

## STEP 3 - CREATIVE INTELLIGENCE
Analyze every creative: format, hook, first 3 seconds, pattern interrupt, visual hierarchy, product visibility, problem presentation, desire, demonstration, social proof, UGC, testimonial, before/after, comparison, objection handling, offer, CTA, copy, headline, landing page consistency. Generate creative direction and test plan.

## STEP 4 - CAMPAIGN INTELLIGENCE
Analyze: objective, structure, CBO/ABO, budget, ad sets, audiences, placements, optimization event, bid strategy, learning phase, creative distribution, frequency, spend distribution. Identify bottlenecks, budget waste, underfunded opportunities.

## STEP 5 - TRAFFIC INTELLIGENCE
Analyze: impressions, reach, frequency, CPM, CTR, CPC, LPV rate, ATC rate, checkout, conversion, traffic source, device, placement, geography, wilaya, new vs returning,Skip. Identify cheap/expensive, high/low quality, high/low intent.

## STEP 6 - ORDER INTELLIGENCE
Analyze orders, order value, AOV, by product/campaign/ad set/creative/audience/wilaya/day/source. Order conversion rate, AOV, cost per order. Which sources/creatives generate orders.

## STEP 7 - CONFIRMATION INTELLIGENCE
Analyze submitted/confirmed/cancelled/unreachable/wrong/fake/duplicate orders, confirmation time, confirmation rate = Confirmed / Submitted x 100. Analyze by product, creative, campaign, ad set, audience, wilaya, customer segment.

## STEP 8 - DELIVERY INTELLIGENCE
Analyze confirmed/shipped/delivered/failed, delivery time, courier, wilaya, product, campaign, creative.Skip Delivery rate = Delivered / Confirmed x 100. Identify bottlenecks by wilaya/courier/product/campaign.

## STEP 9 - RTO INTELLIGENCE
Analyze RTO orders, rate, reasons, customer quality,Skip RTO rate = RTO / Shipped x 100. Analyze by product, wilaya, courier, campaign, ad set, creative, customer, order value. Estimate financial impact. Generate RTO reduction actions.

## STEP 10 - REVENUE INTELLIGENCE
Separate submitted/confirmed/shipped/delivered/collected revenue. Never treat submitted as revenue. Revenue by product, campaign, ad set, creative, customer, wilaya, day.

## STEP 11 - PROFIT INTELLIGENCE
Include product cost, shipping, confirmation, delivery, RTO, ad spend, payment, operating costs. Calculate gross/net profit, margin, profit per order, CPA, CAC, ROAS, break-even ROAS, break-even CPA,Skip max profitable CPA, contribution margin. Never calculate profit from revenue alone.

## STEP 12 - CUSTOMER QUALITY INTELLIGENCE
Score quality from available data: confirmation, delivery, RTO, AOV,Skip repeat, profitability,Skip CLV,Skip cancellation, refund,Skip segment high-value/repeat/normal/RTO-risk/low-value,Skip Never invent customer behavior.

## STEP 13 - AD PLATFORM SIGNAL INTELLIGENCE
Analyze signals sent: ViewContent, AddToCart, InitiateCheckout, Purchase, Confirmed, Delivered, Revenue, customer quality,Skip volume, accuracy,Skip timeliness,Skip quality,Skip Distinguish ORDER SIGNAL vs QUALITY CUSTOMER SIGNAL vs DELIVERED REVENUE SIGNAL.

## STEP 14 - WEAKEST LINK / BOTTLENECK
Identify largest meaningful loss across traffic->order->confirmation->delivery->RTO->revenue->profit,Skip return BOTTLENECK, CAUSE,Skip EVIDENCE,Skip IMPACT,Skip ACTION,Skip Never blame ads automatically,Skip separate product/creative/audience/offer/campaign/traffic/landing/confirmation/delivery/customerSkip

## STEP 15 - GROWTH LOOP / NEW TRAFFIC
After optimization generate NEW TRAFFIC opportunities from winning product+persona+angle+creative+offer+audience+wilaya+customer quality,Skip generate NEW persona, angle,Skip creative,Skip audience,Skip offer,Skip market,Skip traffic source,Skip product variant,Skip Increase PROFITABLE traffic,Skip not merely more traffic.

## STEP 16 - DECISION ENGINE
Every recommendation: ACTION, REASON,Skip DATA,Skip EXPECTED IMPACT,Skip RISK,Skip CONFIDENCE,Skip NEXT TEST,Skip Never claim guaranteed results.

## STEP 17 - FINAL OUTPUT
Return structured JSON per schema: summary = Executive Overview + funnel health + loop analysis in one paragraph,Skip keyPoints[] = one entry per stage (Product, Strategy,Skip Creative,Skip Campaign,Skip Traffic,Skip Order,Skip Confirmation,Skip Delivery,Skip RTO,Skip Revenue,Skip Profit,Skip Customer Quality,Skip Ad Signal,Skip New Traffic) each = stage + status + evidence + bottleneck + action,Skip recommendations[] = prioritized next actions + testing plan + what to avoid,Skip Never invent data,Skip Return ONLY structured JSON specified by the schema.%%BQUOTE%% },
'@
$entry = $entry.Replace("%%BQUOTE%%", $tick)

# ---- insert before closing of SKILLS_DICT (the "export default" line is last; entries object ends with "};") ----
# find the line containing "export default" (registry is named export const SKILLS_DICT = { ... } object + export default of registry list)
$insertBefore = -1
for ($i = $lines.Count - 1; $i -ge 0; $i--) {
  if ($lines[$i].TrimStart().StartsWith("};") -or $lines[$i].TrimStart().StartsWith("},")) { $insertBefore = $i; break }
}
# be safe: insert right before the line that is exactly "};"
$ins2 = -1
for ($i = $lines.Count - 1; $i -ge 0; $i--) {
  if ($lines[$i].Trim() -eq "};") { $ins2 = $i; break }
}
if ($ins2 -lt 0) { Write-Output "NO CLOSE ANCHOR"; exit 1 }
Write-Output ("insAt=" + $ins2)

$newList = New-Object System.Collections.Generic.List[string]
for ($i = 0; $i -lt $ins2; $i++) { $newList.Add($lines[$i]) }
$newList.Add($entry.TrimEnd())
for ($i = $ins2; $i -lt $lines.Count; $i++) { $newList.Add($lines[$i]) }

$text = [string]::Join("`n", $newList.ToArray()) + "`n"
[System.IO.File]::WriteAllText($reg, $text)
Write-Output ("writtenLines=" + $newList.Count)

# ---- verify ----
$v = [System.IO.File]::ReadAllText($reg)
Write-Output ("cinematic=" + $v.Contains("cinematic_storyboard_director:"))
Write-Output ("ecom=" + $v.Contains("ecommerce_growth_loop_intelligence_engine:"))
Write-Output ("ecomDup=" + $v.Split("ecommerce_growth_loop_intelligence_engine:").Count)
$ob = 0; $cb = 0
foreach ($c in $v.ToCharArray()) { if ($c -eq '{') { $ob++ } elseif ($c -eq '}') { $cb++ } }
Write-Output ("braces=" + $ob + "/" + $cb)
Write-Output ("export=" + $v.Contains("export default"))
Write-Output ("tailOK=" + $v.TrimEnd().EndsWith("};"))
# count entries
$n = ([regex]::Matches($v, "(?m)^  [a-z_]+: \{")).Count
Write-Output ("entries=" + $n)
# cinematic still clean?
$cinIdx = -1
for ($i = 0; $i -lt $newList.Count; $i++) { if ($newList[$i].TrimStart().StartsWith("cinematic_storyboard_director:")) { $cinIdx = $i; break } }
if ($cinIdx -ge 0) {
  $cl = $newList[$cinIdx]
  Write-Output ("cinLineLen=" + $cl.Length)
  Write-Output ("cinWasCap=" + ($cl.Contains("HARD DURATION CAP")))
}