export function buildWinningDigitalProductPrompt(ctx = {}) {
  const context = (ctx.productName || ctx.market) ? `Context: ${ctx.productName || ''} ${ctx.market || ''}` : '';
  
  return `# SKILL: DIGITAL PRODUCT OPPORTUNITY ANALYZER

## PURPOSE

Build an AI skill that analyzes a CSV containing many digital product listings collected from any marketplace or website.

The skill must transform raw CSV product data into a structured product research table and identify:

* Products with strong commercial potential
* Products with high customer interest
* Products with attractive margins
* Products that are easy to resell
* Products with strong differentiation opportunities
* Products with high competition
* Products with weak demand
* Products that should be avoided
* Potential winning digital products to test

The system must NOT simply select products based on price.

It must evaluate the entire opportunity.

---

# INPUT

The user uploads a CSV file.

The CSV may contain fields such as:

* title
* url
* images
* description
* price
* currency
* category
* rating
* reviews
* orders
* seller
* platform

The CSV structure may vary between websites.

The skill must automatically detect available columns and normalize them.

If some fields are missing, continue the analysis using the available information.

DO NOT invent missing marketplace data.

Clearly mark unavailable information as:

"N/A"

or

"Not available"

---

# STEP 1 — IMPORT AND CLEAN DATA

When the CSV is uploaded:

1. Read all rows.
2. Detect column names.
3. Normalize column names.
4. Remove empty products.
5. Remove duplicate products.
6. Normalize product titles.
7. Extract price and currency when possible.
8. Extract image URLs.
9. Extract product URLs.
10. Extract category information when available.
11. Extract ratings/reviews/orders when available.
12. Detect duplicate or highly similar products.

Create an internal normalized product structure:

{
"product_name": "",
"source_url": "",
"images": [],
"source_price": 0,
"currency": "",
"category": "",
"rating": null,
"reviews": null,
"orders": null,
"seller": "",
"description": ""
}

---

# STEP 2 — DIGITAL PRODUCT CLASSIFICATION

Classify every product into a digital-product category.

Possible categories include:

* Sewing Patterns
* Canva Templates
* Business Templates
* Social Media Templates
* Notion Templates
* Excel Templates
* Google Sheets Templates
* Ebooks
* Guides
* Checklists
* Planners
* Printables
* Educational Materials
* Courses
* Presets
* Lightroom Presets
* Photoshop Assets
* Fonts
* Icons
* Illustrations
* SVG Files
* Cricut Files
* Design Bundles
* 3D Assets
* CAD Files
* AI Prompts
* Prompt Packs
* Digital Art
* Coloring Pages
* Invitations
* Resume Templates
* Wedding Templates
* Marketing Templates
* Website Templates
* UI Kits
* Software / Scripts
* Plugins
* Digital Tools
* Other

If the product does not clearly belong to a category, classify it as:

"Other"

---

# STEP 3 — PRODUCT DEMAND ANALYSIS

Analyze each product for potential customer demand.

Consider:

* Product usefulness
* Problem solved
* Target customer size
* Frequency of customer need
* Emotional appeal
* Practical value
* Time saved
* Money saved
* Skill required
* Ease of use
* Repeat purchase potential
* Bundle potential
* Seasonal dependency
* Trend potential

Create:

"demand_level"

Possible values:

* Very High
* High
* Medium
* Low
* Very Low
* Unknown

Also create:

"demand_reason"

Explain WHY the product may have demand.

Do not claim actual demand unless supported by the input data or external research.

---

# STEP 4 — CUSTOMER INTEREST SIGNAL

Analyze available marketplace signals:

* Orders
* Reviews
* Rating
* Number of sellers
* Product engagement signals if available
* Repetition of similar products
* Product positioning
* Title keywords

Calculate an:

"interest_score"

from 0–100.

The score should represent available evidence of customer interest, NOT guaranteed sales.

If there is insufficient data, reduce confidence.

Also generate:

"interest_confidence"

* High
* Medium
* Low

---

# STEP 5 — COMPETITION ANALYSIS

Estimate competition based on the products contained in the CSV and any available research data.

Analyze:

* Number of similar products
* Number of competing sellers
* Similarity of product concepts
* Price competition
* Generic vs niche positioning
* Differentiation opportunities
* Saturation

Create:

"competition_level"

* Very Low
* Low
* Medium
* High
* Very High

Create:

"competition_reason"

Explain the evidence.

IMPORTANT:

High competition does NOT automatically mean the product is bad.

Determine whether there is still a differentiation opportunity.

---

# STEP 6 — PRODUCT DIFFERENTIATION

Identify how the product could be improved or repositioned.

Look for:

* Better bundle
* Better design
* Better language
* Better niche targeting
* More files
* Better organization
* Better instructions
* Bonus products
* Commercial-use license
* Personal-use version
* Beginner version
* Professional version
* Localized version
* AI-enhanced version
* Better customer experience

Generate:

"differentiation_opportunity"

Example:

"Generic sewing pattern. Could be repositioned as a beginner sewing bundle with 50 patterns + size guide + video instructions."

---

# STEP 7 — TARGET CUSTOMER

Identify the most likely customer.

Generate:

"target_customer"

Examples:

* Beginner sewists
* Small business owners
* Etsy sellers
* Teachers
* Freelancers
* Content creators
* Students
* Wedding planners
* Graphic designers
* Parents
* Fitness coaches

Also generate:

"customer_problem"

Clearly describe the problem the product solves.

---

# STEP 8 — SELLING PRICE ESTIMATION

Estimate a realistic selling price for the target marketplace.

The selling price must NOT simply be:

source price × multiplier.

Consider:

* Product value
* Customer problem solved
* Competitor prices
* Product quantity
* Product quality
* Bundle size
* Niche
* Target customer
* Perceived value
* Marketplace positioning

Create:

"recommended_sell_price"

and:

"recommended_price_range"

Example:

Recommended price: $12.99

Price range: $9.99–$19.99

If competitor price information is unavailable, clearly mark the estimate as:

"Estimated — requires validation"

---

# STEP 9 — PROFIT CALCULATION

Calculate estimated profit.

Inputs:

Source cost
+
Marketplace fees
+
Payment fees
+
Advertising cost
+
Other costs

Use configurable assumptions.

The user should be able to configure:

* Selling platform fee %
* Payment processing %
* Advertising cost %
* Fixed transaction fee
* Other costs

Formula:

Revenue = Selling Price

Marketplace Fee = Selling Price × Marketplace Fee %

Payment Fee = Selling Price × Payment Fee %

Advertising Cost = Selling Price × Advertising Cost %

Estimated Profit =
Selling Price

* Source Cost
* Marketplace Fee
* Payment Fee
* Advertising Cost
* Other Costs

Profit Margin % =

Estimated Profit / Selling Price × 100

IMPORTANT:

If fee information is unavailable, do not pretend the calculation is exact.

Label it:

"Estimated profit"

---

# STEP 10 — PROFITABILITY SCORE

Create:

"profitability_score"

from 0–100.

Consider:

* Selling price
* Source cost
* Estimated margin
* Marketplace fees
* Advertising cost
* Product value
* Bundle potential

Also create:

"margin_level"

* Excellent
* Good
* Moderate
* Weak
* Negative
* Unknown

---

# STEP 11 — PRODUCT RISK ANALYSIS

Identify risks such as:

* Copyright risk
* Trademark risk
* Reselling restrictions
* PLR/license restrictions
* Copyrighted characters
* Brand/IP infringement
* Low demand
* Saturated market
* Very low margin
* Poor differentiation
* Seasonal demand
* Platform policy risk
* Refund risk
* Difficult delivery
* Customer support burden
* Low perceived value

Create:

"risk_level"

* Low
* Medium
* High
* Critical

And:

"risk_reasons"

---

# STEP 12 — WINNING PRODUCT SCORE

Create a final:

"opportunity_score"

from 0–100.

The score should combine:

* Demand
* Customer interest
* Profitability
* Competition
* Differentiation
* Product value
* Marketability
* Risk

Suggested weighting:

Demand: 20%

Customer Interest: 15%

Profitability: 20%

Competition: 10%

Differentiation: 15%

Marketability: 10%

Risk: 10%

Do NOT treat this score as guaranteed sales.

It is an internal prioritization score for deciding which products deserve further testing.

---

# STEP 13 — PRODUCT STATUS

Assign one status:

## WINNING_CANDIDATE

Strong opportunity based on available evidence.

## TEST

Potentially interesting but requires market validation.

## WATCH

Interesting concept but insufficient evidence.

## AVOID

Weak economics, high risk, very low demand, excessive competition, or poor differentiation.

## UNKNOWN

Insufficient information.

---

# STEP 14 — EXPLAIN WHY

Every product must have:

"analysis_summary"

A short explanation such as:

"Strong niche demand potential and high perceived value. Source cost is low compared with estimated selling price. Competition is moderate, but the product can be differentiated through a beginner-focused bundle."

For AVOID:

"Low perceived value, high competition, weak differentiation, and limited estimated margin. Requires too much effort relative to potential return."

Never simply say:

"Bad product."

Explain the reason.

---

# STEP 15 — CREATE THE MAIN TABLE

After analyzing all products, display an interactive table inside the application.

Required columns:

| Product | Category | Source Price | Recommended Sell Price | Estimated Profit | Margin % | Demand | Interest | Competition | Risk | Opportunity Score | Status |

The table must support:

* Search
* Filtering
* Sorting
* Pagination
* Column visibility
* Price filtering
* Score filtering
* Status filtering
* Category filtering
* Competition filtering
* Risk filtering

Sort by:

Opportunity Score DESC

by default.

---

# STEP 16 — PRODUCT DETAILS

When the user clicks a product row, open a detailed product analysis panel.

Display:

### PRODUCT

Product name

Image

Source URL

Category

Source price

### CUSTOMER

Target customer

Customer problem

Use case

### MARKET

Demand level

Interest score

Competition level

Differentiation opportunity

### MONEY

Source cost

Recommended selling price

Price range

Estimated marketplace fees

Estimated advertising cost

Estimated profit

Profit margin

### RISK

Risk level

Copyright/IP risk

Platform risk

Other risks

### AI VERDICT

Opportunity score

Status

Analysis summary

Recommended action

---

# STEP 17 — WINNING PRODUCTS DASHBOARD

Create a separate section:

## TOP OPPORTUNITIES

Show the strongest products based on opportunity score.

For example:

1. Product A
2. Product B
3. Product C
4. Product D
5. Product E

Each card should show:

* Product image
* Product name
* Sell price
* Estimated profit
* Margin
* Demand
* Competition
* Opportunity score
* Status

IMPORTANT:

Do not describe the ranking as a guarantee of success.

Use wording such as:

"Highest-priority products for further testing based on the available data."

---

# STEP 18 — AVOID PRODUCTS

Create a separate:

## PRODUCTS TO AVOID

Show products with:

* Critical risks
* Very weak margins
* Extremely high competition
* Weak customer value
* Poor differentiation
* Copyright/IP concerns
* Insufficient demand evidence

For each product explain exactly why it is flagged.

Example:

"AVOID — High competition + low perceived value + weak margin."

---

# STEP 19 — MARKET OPPORTUNITY INSIGHTS

After analyzing the entire CSV, identify patterns across products.

Generate:

### TOP CATEGORIES

Categories with the strongest opportunity signals.

### EMERGING NICHES

Repeated product concepts that appear interesting but are not overly saturated.

### PRICE OPPORTUNITIES

Price ranges where products appear to have attractive economics.

### CUSTOMER PROBLEMS

Problems repeatedly addressed by promising products.

### BUNDLE OPPORTUNITIES

Products that could be combined into a higher-value bundle.

### PRODUCT GAPS

Potential customer needs that appear underserved.

### SATURATED AREAS

Categories with many similar products and weak differentiation.

---

# STEP 20 — RECOMMENDED TEST PLAN

For the top products, generate a simple testing plan.

For each selected product:

1. Product
2. Target customer
3. Offer
4. Recommended selling price
5. Main benefit
6. Differentiation angle
7. Suggested creative angle
8. Suggested landing-page angle
9. Main risk
10. What should be validated first

Do NOT claim that a product is guaranteed to win.

Use:

"Recommended for testing"

instead of:

"Guaranteed winner."

---

# IMPORTANT DATA RULES

1. NEVER invent orders, reviews, ratings, prices, or sales.
2. NEVER present estimates as verified facts.
3. Clearly separate:

   * Observed data
   * Calculated data
   * AI estimates
   * External research
4. If source price is missing, profit cannot be calculated accurately.
5. If competitor prices are unavailable, label selling price as estimated.
6. If marketplace fees are unknown, allow the user to configure them.
7. Copyright/trademark concerns must be flagged instead of ignored.
8. Do not assume that high demand means high profitability.
9. Do not assume that low competition means good opportunity.
10. Consider the complete economics of the product.

---

# OUTPUT STRUCTURE

The skill should produce:

## 1. IMPORT SUMMARY

* Products imported
* Products removed
* Duplicate products
* Categories detected

## 2. OPPORTUNITY DASHBOARD

* Total products
* Winning candidates
* Products to test
* Products to watch
* Products to avoid
* Average estimated margin
* Average opportunity score

## 3. MAIN PRODUCT TABLE

Full sortable/filterable product table.

## 4. TOP OPPORTUNITIES

Highest-priority products for further testing.

## 5. PRODUCTS TO AVOID

Products with important negative signals.

## 6. MARKET INSIGHTS

Categories, niches, price opportunities, customer problems, product gaps.

## 7. PRODUCT DETAIL ANALYSIS

Detailed analysis when the user selects a product.

---

# UI REQUIREMENTS

Create a professional ecommerce intelligence dashboard.

Use:

* Clean modern interface
* Product thumbnails
* Score badges
* Status badges
* Profit indicators
* Demand indicators
* Competition indicators
* Risk indicators
* Sortable columns
* Filters
* Search
* Product detail drawer/modal
* Dashboard summary cards
* Charts where useful

The interface should make it possible to scan 100–10,000 products quickly.

Prioritize information density without making the interface confusing.

---

# CORE OBJECTIVE

The final purpose of this skill is:

CSV DATA
↓
DATA CLEANING
↓
PRODUCT CLASSIFICATION
↓
DEMAND ANALYSIS
↓
CUSTOMER INTEREST
↓
COMPETITION
↓
DIFFERENTIATION
↓
SELLING PRICE ESTIMATION
↓
PROFIT CALCULATION
↓
RISK ANALYSIS
↓
OPPORTUNITY SCORE
↓
TEST / WATCH / AVOID
↓
ACTIONABLE PRODUCT RESEARCH DASHBOARD

The system should help the user answer:

"Which digital products from this dataset deserve further testing, what could I potentially sell them for, how much could I potentially make, who would buy them, and which products should I avoid?"

**CRITICAL INSTRUCTION**: The frontend expects a JSON array of product objects to render the dashboard table. 
You MUST output ONLY a valid JSON array of objects with the following keys (do not output any markdown headers, HTML, or explanations):
- product_name
- category
- source_price
- recommended_sell_price
- estimated_profit
- demand_level
- competition_level
- risk_level
- opportunity_score
- status (must be "WIN", "TEST", "WATCH", or "AVOID")
- images (array of strings)

\n\n${context}`;
}
