# LocaLoan — Feature Roadmap

## Status: 3 high-value features planned

---

## LN-F1: Per-Loan Amortization Table

**Summary:** On the Loans tab, each loan card gets an "Amortize" button that expands a scrollable month-by-month table showing payment, principal, interest, and remaining balance.

**Value:** This is the single most requested feature in any debt app. Users want to see *exactly* when they'll be free. The `buildAmortization()` function already exists — this is a UI-only feature.

**UI:**
- "Amortize" button in each loan card action row (next to Update Price / Edit / Delete)
- Click toggles a `<div id="amort_${id}">` below the card actions
- Table has columns: Month | Date | Payment | Principal | Interest | Balance
- Max 120 rows shown; "Show more" for the rest
- Table styled with `Space Mono`, alternating row tints, final row in emerald when balance = 0

**TODO:**
- [ ] Add `renderAmortTable(loanId)` function that calls `buildAmortization()` and renders HTML table
- [ ] Add `toggleAmort(loanId)` function with open/close state tracking
- [ ] Add "Amortize" button to loan card template in `renderLoans()`
- [ ] Insert `<div id="amort_${id}" class="hidden">` in each card
- [ ] Add `data-testid="amort-btn-${id}"` and `data-testid="amort-table-${id}"` for tests

---

## LN-F2: Debt Freedom Progress Ring

**Summary:** A circular SVG progress ring on the Dashboard showing the overall percentage of debt paid off (original balance → current balance), with the percentage in the center and the payoff date below.

**Value:** Pure motivation. Watching the ring grow is addictive. The `originalBalance` field is already stored per loan — this just visualizes it.

**Calculation:** `paidPct = 1 - (sum(currentBalance) / sum(originalBalance))` — capped at 100%.

**UI:**
- SVG ring: 96px diameter, 8px stroke, orange fill, gray-800 background track
- Center text: `{pct}%` in bold Space Mono
- Below ring: "Debt-free by {date}" from the existing strategy simulation
- Card sits at the top of the dashboard above the stats row when there are loans

**TODO:**
- [ ] Add `renderDebtRing(loans, simResult)` returning HTML string
- [ ] Integrate ring into `renderDashboard()` above the stats grid
- [ ] Add `data-testid="debt-ring"` wrapper and `data-testid="ring-pct"` text span
- [ ] Handle edge case: no `originalBalance` stored → fall back to ring at 0%

---

## LN-F3: Refinance Analyzer

**Summary:** A bottom sheet (using the existing `#sheet` / `#overlay` pattern) for any individual loan that lets users enter a hypothetical new APR and term, then shows: new monthly payment, total interest saved, and break-even month.

**Value:** When a user's credit score improves or rates drop, they want to know if refi is worth it. This answers that question in 15 seconds.

**Inputs (in sheet):**
- New APR (%)
- New term (months)  
- Closing costs ($, optional)

**Outputs (computed live):**
- New monthly payment
- Old total interest vs new total interest → savings
- Break-even: `closingCosts / (oldMonthlyPmt - newMonthlyPmt)` months

**TODO:**
- [ ] Add `openRefiSheet(loanId)` function
- [ ] Add refi button to each loan card in `renderLoans()`
- [ ] Build sheet HTML with 3 float inputs + live-update output section
- [ ] Add `calcRefi(loan, newApr, newTerm, closingCosts)` computation function
- [ ] Wire `oninput` on each field to call `updateRefiCalc()`
- [ ] Add `data-testid="refi-btn-${id}"`, `data-testid="refi-sheet"`, `data-testid="refi-savings"` for tests
