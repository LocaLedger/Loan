# LocaLoan — Use Cases

All IDs prefixed `UC-LN-`. Run specific cases with:
```bash
npx playwright test --grep "UC-LN-04"
```

---

## UC-LN-00 · App Renders

| ID | Scenario | Expected |
|----|----------|----------|
| UC-LN-00a | Page loads | Title contains "LocaLoan" |
| UC-LN-00b | App shell renders | `#app` has child elements |
| UC-LN-00c | Empty state dashboard | Shows `$` total (even if $0.00) |

---

## UC-LN-01 · Bottom Navigation

| ID | Scenario | Expected |
|----|----------|----------|
| UC-LN-01a | Dashboard tab | Visible in bottom nav |
| UC-LN-01b | Add tab | Visible in bottom nav |
| UC-LN-01c | Loans tab | Visible in bottom nav |
| UC-LN-01d | Settings tab | Visible in header (gear icon) |

---

## UC-LN-02 · Dashboard Tab

| ID | Scenario | Expected |
|----|----------|----------|
| UC-LN-02a | Click Dashboard | Content renders without crash |
| UC-LN-02b | Seeded loan: total debt | `$4,200` visible in stat cards |
| UC-LN-02c | Strategy label | "Avalanche" or "Snowball" appears |
| UC-LN-02d | Payoff date estimate | Year or `mo`/`yr` label appears |

**Stat card trio**: Total Debt / Monthly Minimum / Loan Count

---

## UC-LN-03 · Add Tab — Form Presence

| ID | Scenario | Expected |
|----|----------|----------|
| UC-LN-03a | Click Add tab | `#loanForm` renders |
| UC-LN-03b | Balance input | Present and focusable |
| UC-LN-03c | Label input | Present (`#labelInput`) |
| UC-LN-03d | APR input | Present (`#aprInput`) |
| UC-LN-03e | Min payment input | Present (`#minPmtInput`) |
| UC-LN-03f | Loan type chips | At least 4 `.type-chip` elements |
| UC-LN-03g | Submit button | `button[type="submit"]` in form |

**Type chips**: Credit Card · Auto · Student · Personal · Mortgage · Other

---

## UC-LN-04 · Add a Loan (End-to-End)

| ID | Scenario | Expected |
|----|----------|----------|
| UC-LN-04a | Fill form and submit | Navigates to Loans tab; label/amount appear |
| UC-LN-04b | Added loan updates dashboard | Dashboard total reflects new balance |

**Data path**: `saveLoan()` → `saveData()` → `localStorage.setItem('locaLoanData')` → `switchTab('loans')`

---

## UC-LN-05 · Loans Tab

| ID | Scenario | Expected |
|----|----------|----------|
| UC-LN-05a | Seeded loan card | Loan label (`Chase Sapphire`) visible |
| UC-LN-05b | Loan balance visible | `$4,200` on card |
| UC-LN-05c | APR visible | `24.99%` on card |
| UC-LN-05d | TARGET badge (avalanche) | First card shows TARGET badge (highest APR) |
| UC-LN-05e | Two loans listed | Both labels visible |

**Sort order** — Avalanche: highest APR first. Snowball: smallest balance first.

---

## UC-LN-06 · Strategy Toggle

| ID | Scenario | Expected |
|----|----------|----------|
| UC-LN-06a | Dashboard with 2 loans | Strategy name (Avalanche/Snowball) visible |
| UC-LN-06b | Toggle to Snowball | "Snowball" label appears after toggle |
| UC-LN-06c | Snowball sort order | TARGET on Visa Platinum ($2,100 < $8,500) |

**Math**: Avalanche saves most interest. Snowball provides motivational quick wins.

---

## UC-LN-07 · Extra Monthly Payment

| ID | Scenario | Expected |
|----|----------|----------|
| UC-LN-07a | `#extraInput` visible | Present on dashboard when loans exist |
| UC-LN-07b | Enter $500 extra | Dashboard re-renders (payoff moves earlier) |

**Debounce**: input fires re-render after ~400ms idle.

---

## UC-LN-08 · Loan Detail / Amortization

| ID | Scenario | Expected |
|----|----------|----------|
| UC-LN-08a | Tap loan card | Detail sheet opens with amortization table |

Amortization table columns: Month · Date · Payment · Principal · Interest · Balance · APR  
First 24 months shown inline; remaining months noted as "X more months".

---

## UC-LN-09 · Promo APR Alert

| ID | Scenario | Expected |
|----|----------|----------|
| UC-LN-09a | Promo expiring in 30 days | Dashboard alert references promo / 0% / card name |

**Logic**: `_effectiveApr()` uses `promoApr` until `promoAprEnds` date. Alert fires when end ≤ 60 days out.

---

## UC-LN-10 · Settings Tab

| ID | Scenario | Expected |
|----|----------|----------|
| UC-LN-10a | Click Settings | Renders without crash |
| UC-LN-10b | Export button | "Export" text on button/link |
| UC-LN-10c | Clear data option | "Clear" or "Reset" text on button/link |

**Export**: JSON download (or clipboard share fallback).  
**Import**: Merges by loan ID, advances `nextId` past highest existing suffix.  
**Clear**: Programmatic confirm sheet — **no `window.confirm()` used**.

---

## UC-LN-11 · Tab Switching

| ID | Scenario | Expected |
|----|----------|----------|
| UC-LN-11a | Cycle all tabs | No crash, `#app` always populated |
| UC-LN-11b | Add → Loans → Add | `#loanForm` still renders on return |

---

## UC-LN-12 · Suite Drum

| ID | Scenario | Expected |
|----|----------|----------|
| UC-LN-12 | Header drum element | `#suiteDrum` visible |

The drum starts at face 3 (Loan). Spinning navigates to Labor/Loss (live) or Coming Soon pages for Limit/Legacy/Liquid.

---

## UC-LN-13 · Charts

| ID | Scenario | Expected |
|----|----------|----------|
| UC-LN-13a | Dashboard with 2 loans | Chart container or `.chart-tab` buttons present |
| UC-LN-13b | "By Loan" tab | Breakdown renders with loan names |

**Chart views**: Payoff Curve · By Loan · Avl vs Snwbl  
Rendered as pure CSS/HTML — no canvas, no Chart.js. Powered by `offline-charts.js`.

---

## Data Model Reference

```json
{
  "loans": [{
    "id":              "loan_user1_1",
    "label":           "Chase Sapphire",
    "type":            "credit_card",
    "balance":         4200.00,
    "originalBalance": 5000.00,
    "apr":             24.99,
    "promoApr":        null,
    "promoAprEnds":    null,
    "minimumPayment":  85,
    "openedDate":      "2024-01-15",
    "deleted":         false,
    "createdAt":       1710000000000,
    "updatedAt":       1710000000000
  }],
  "strategies": { "active": "avalanche", "extraMonthly": 200 },
  "version": 1
}
```

**Storage keys**: `locaLoanData` / `locaLoanMeta`

---

## Key Functions

| Function | Purpose |
|----------|---------|
| `buildAmortTable(loan)` | Full amortization schedule (months → 0 or 600 cap) |
| `simulateStrategy(loans, extra, strategy)` | Returns `{months, totalInterest, payoffByLoanId}` |
| `_effectiveApr(loan, currentDate)` | Returns promo APR if within promo window, else regular APR |
| `loadData()` / `saveData(data)` | localStorage read/write |
| `generateId(meta, prefix)` | `prefix_userId_nextId` pattern |
| `switchTab(tab)` | Renders tab content into `#app` |
| `switchSuiteModule(mod)` | Navigates to other LocaLedger apps via absolute URLs |
