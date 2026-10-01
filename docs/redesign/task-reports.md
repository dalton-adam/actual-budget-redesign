# Redesign task reports

The full completion report for each finished task: scope changes, owner
decisions made during the task, checks run with counts, visual evidence and
gaps left open. Moved here from the backlog on September 28, 2026 so the
backlog can stay a short ledger. Add a new entry here when a task finishes and
update the ledger in [backlog.md](backlog.md).

Paths use the backlog's abbreviations: `C/` is
`packages/desktop-client/src/components/`, `L/` is
`packages/component-library/src/`.

- DISC-01 and DISC-02: documented in [Stage 0](stage-0.md) and the
  [behavior inventory](behavior-inventory.md). Baseline has an explicit wider
  Reports coverage gap: **58 passed, 1 failed, 15 skipped**, not 73 passes.
- DESIGN-01 and DESIGN-02: **done September 27, 2026.** Owner decisions are in
  the [prototype README](prototype/README.md); the
  [accounts review](accounts-review/README.md) covers the register.
- Current choices: Layout A, summary cards, Inter, all three built-in themes,
  44px rows, one month at a time, collapsible accounts pane, Budget-only
  details panel open by default with device-local open state. Concept B and
  Concept C's Budget header are reference material, not tasks to build.
- DESIGN-03: **done September 27, 2026** —
  [design-decisions.md](design-decisions.md). Implementation tasks are released
  in dependency order; items marked "Shown" in its §11 are confirmed with the
  owner before the task that needs them starts.
- UI-01: **done September 27, 2026**, merged into `redesign/main` with owner
  approval. Scope grew, with owner approval, to cover the fallback layer:
  `L/themes/fallback.css`, the component-library `package.json` export, and
  `packages/desktop-client/src/style/theme.tsx` plus an adjacent test. Results
  and the accepted light-theme contrast shortfalls are in design-decisions §8 "As
  implemented". Checks: typecheck pass; theme-related UNIT 256/256; E2E(settings)
  2/2; VISUAL in light, dark, midnight and a custom theme at 1440×900 and
  1000×700. Rebased onto `redesign/main` after the prototype lint fixes and
  UI-03; typecheck, lint and theme UNIT rerun after the rebase.
- UI-03: **done September 27, 2026**, merged into `redesign/main`. New files
  only: `C/budget/categoryPresentation.ts` and
  `C/budget/categoryPresentation.test.ts` — accent index (§7.3), progress bar
  (§7.1), pace chart data and summary (§7.2, the "Shown" default in §11 item 2,
  with the owner's past-month summary change) and summary stacked bar (§7.4).
  Helpers take amounts and transactions the app already provides and return
  numbers and summary kinds; wording, formatting and theme roles are left to
  the components that use them. Nothing calls them yet. Checks: typecheck
  pass; lint pass; UNIT `src/components/budget/categoryPresentation.test.ts`
  28/28.
- UI-02: **done September 27, 2026**, merged into `redesign/main` with owner
  approval. Existing Button variants are
  unchanged; the new pieces are opt-in. `L/Button.tsx` gains `control`, `tab`
  and `tabSelected` variants (keyboard focus ring in `selectionBorder`,
  disabled dimmed by opacity so it always reads quieter than enabled, colour
  transitions only without reduced motion). `L/styles.ts` gains `focusRing`
  and `surfaceCard`. New files: `L/SurfaceCard.tsx`, `L/StatusPill.tsx`
  (`StatusPill` and `StatusPillButton`, which requires a full-sentence
  accessible name), `L/ProgressBar.tsx` (clamped; decorative unless labelled),
  `L/CategoryTile.tsx` (first grapheme, accent index 1–10 or neutral,
  `aria-hidden`), `L/RedesignPrimitives.stories.tsx` (state preview) and
  `L/RedesignPrimitives.web.test.tsx`; new export entries in the
  component-library `package.json` so the app can import them (outside the
  card's listed files, same as UI-01). Checks: typecheck pass; lint pass;
  component UNIT 42/42 (23 new). VISUAL in Storybook at 1000×700 and
  1440×900: light, dark, midnight, and a simulated custom theme
  (`fallback.css` plus a custom palette over light) — all surfaces follow the
  palette; Tab reaches each enabled control with a visible ring and skips
  disabled ones; the existing `normal` Button computes the same as before.
  Storybook needed a local, uncommitted change to start on macOS (`src/Themes`
  and `src/themes` clash on a case-insensitive disk). **Resolved with the owner:** in light,
  the app's `pageTextSubdued` (`#9fb3c8`) reads at only 1.81:1, so a new
  `pageTextSecondary` role (design-decisions §8, "Added in UI-02") gives the
  new controls `#62626e` in light (5.07:1 on the page, 4.58:1 on the nav
  track) and matches `pageTextSubdued` in dark, midnight and custom themes.
  Rerun after the role: typecheck, lint, component UNIT 42/42, theme UNIT
  `src/style/` 215/215, light VISUAL.
- NAV-01: **done September 27, 2026**, merged into `redesign/main` with
  owner approval. Scope grew, with owner approval, to
  `C/Titlebar.tsx` (the tabs render in its left slot; right-side buttons
  unchanged) and to building the Accounts ▾ menu here rather than in NAV-02.
  Top bar: pill tabs **Budget, Accounts ▾, Reports, Schedules, More ▾**
  (`C/navigation/`). Accounts ▾ lists All / On / Off budget with totals, each
  account with sync-status dot and balance, Closed accounts, Add account, and
  the same right-click menu (Rename, Close/Reopen). More ▾ lists Payees,
  Rules, Bank Sync (same condition as before), Tags, Settings. Below 900px the
  tabs and sidebar give way to a drawer with every destination plus the budget
  file menu (Rename, Settings, Load backup, Switch file). Menus are
  disclosure navigation (buttons + links), so links keep `role=link` and
  `aria-current`; the selected menu tab also carries `aria-current`. Removed
  `sidebar/{PrimaryButtons,Item}.tsx`; the sidebar keeps the budget name,
  account list and Add account until NAV-02. The tab track keeps
  `data-testid="sidebar-primary-buttons"` so the tour's "Getting around"
  step still anchors. Checks: typecheck pass; lint pass; UNIT
  `src/components/navigation src/components/sidebar` 6/6 (3 new);
  E2E(help-menu, accounts, settings) 16/16; also E2E(payees, rules,
  schedules, transactions, budget, bank-sync, reports) 52/52 (default
  config against the 3018 preview). VISUAL on Try the demo: dark, light and
  midnight at 1000×700; drawer at 800×700; route matrix (every tab, More and
  Accounts destination lands on the right path and marks the right tab
  current; browser Back restores Budget); keyboard: Enter opens a menu, Tab
  reaches each link with a visible ring, Escape closes and returns focus;
  Escape while renaming cancels only the rename. Reduced motion checked in Playwright against the 3018 preview with `reducedMotion: 'reduce'`: drawer animation `none`, tab and menu-tab transitions `none`; with motion allowed the drawer runs `nav-drawer-in` and tabs fade over 0.15s. `generate:i18n` run: all seven new strings are in `locale/en.json` (git-ignored, so nothing to stage). Custom theme at 1440×900 and 800×700: installed the Alucard catalog theme, with and without a pasted warm palette on top; the tab track, selected tab, unselected text, both menus and the drawer all resolve from the custom palette through the UI-01 fallbacks (`navTrack` → `cardBackground`, `navActive` → 12% `pageText`, `pageTextSecondary` → `pageTextSubdued`). A pasted override on a built-in theme keeps that theme's tuned tab colors, as UI-01 intends. Tour: with owner approval, `C/tour/steps.tsx`'s "Getting around" step now reads "The tabs at the top take you to your budget, accounts, reports, and scheduled transactions…" and points down at the tab bar (placement `bottom`); checked by running the tour to step 6 of 8 at 1000×700. Follow-ups: the drawer's budget file menu repeats `sidebar/BudgetName.tsx`'s items until NAV-02 moves the budget switcher to the top bar; below 900px the tour's navigation and Add account targets are hidden (tabs and sidebar give way to the drawer), which NAV-02 should revisit with the accounts pane.
- NAV-02: **done September 27, 2026** on `redesign/nav-02`. The old
  floating/resizable sidebar is now the approved Accounts pane on every
  desktop page at 900px and wider. It defaults open at 1280px and wider and
  collapsed below, remembers an explicit choice in device-local browser
  storage (no core preference or sync change), and respects reduced motion.
  Open mode retains All / On / Off budget balances, account drag ordering,
  closed accounts, Add account, account tooltips and right-click Rename /
  Close / Reopen actions. Collapsed mode is a 56px rail with accessible
  account initials, connection-status dots, Add account and an expand button;
  below 900px the NAV-01 drawer remains authoritative. The existing budget
  name/actions moved to the title bar beside the preserved privacy, server,
  user and help controls; the compact drawer keeps its budget file menu.
  Renaming from the collapsed rail expands the pane and opens the inline
  editor (now labelled "Account name"). UNIT `src/components/sidebar
src/components/navigation src/components/settings/Themes.test.tsx` passed
  15/15. CHECK passed: root typecheck and lint (after removing an unused `t`
  in `C/Titlebar.tsx` and renaming the JSX-free test to
  `SidebarProvider.test.ts`). Browser build passed. E2E(accounts, budget,
  settings, nav-02) passed 26/26 against the rebuilt 3018 preview, including
  the 1279/1280 default, reload persistence, rail rename and proof that All
  accounts navigation leaves envelope totals unchanged. Rail initials were
  re-checked at 1100×720 after centring them in their chips. VISUAL inspected light 1440×900, midnight 1000×700,
  dark 800×700 drawer, dark privacy mode and a simulated warm custom palette;
  account values redact through the existing `CellValue` privacy path and the
  No server / Help / budget controls remain reachable.
- NAV-02 follow-up (E2E page model): **done September 27, 2026** on
  `redesign/fix-accounts-e2e-1000`. The WIDE run failed
  `accounts.test.ts:242` at 1000px on `redesign/main` because the collapsed
  rail has no All / On / Off budget links. `Navigation.goToAccountPage` in
  `packages/desktop-client/e2e/page-models/navigation.ts` now clicks the
  accounts-pane link when it is visible and otherwise goes through the
  top-bar Accounts ▾ menu, so it never changes the pane state. The app and
  the NAV-02 default are unchanged. Browser build passed. WIDE against a
  preview of this branch's build: 58 passed, 1 failed (the known Reports
  baseline `reports.test.ts:33` at 1440), 15 did not run. Other
  `goToAccountPage` callers (rules, schedules, transactions, onboarding,
  nav-02) at both widths: 62/62 passed. `transactions.test.ts:247`
  ("creates a transfer test transaction") had also failed at 1000px, because
  it reads `sidebar-all-accounts-balance` / `sidebar-on-budget-balance`,
  which only render when the pane is open. It now calls the new
  `Navigation.expandAccountsPane()` before entering the transaction. That
  helper clicks "Expand accounts" only when the pane is collapsed, so runs
  at 1280px and wider (including the default VRT viewport) are unaffected.
  CHECK passed (root typecheck and lint).
- BUD-01: **done September 27, 2026**, merged into `redesign/main` with
  owner approval. Envelope budgets get the design-decisions §3
  header: "Budget" eyebrow (plus "· Past month" / "· Future month"), the
  month as an `h1`, a month stepper (‹ Sep 2026 ›, disabled at the budget
  bounds), **Today** away from the current month, the month notes button and
  the month menu ⋯ (`BudgetMonthMenu` items and undo messages unchanged, now
  shared through `BudgetMonthMenuButton`). Below it, three cards for the
  focused month: **Ready to Assign** (positive colour and glow with "`X`
  available funds"; zero neutral with "All assigned" and "Every dollar has a
  job"; negative with "Overassigned", "More assigned than you have" and the
  negative glow), **Assigned** ("across N categories") and **Activity** with
  the §7.4 stacked bar from UI-03's `getSpendingBarSegments`. Pressing or
  right-clicking the Ready to Assign card opens one popover: the existing
  breakdown (Available funds with its Income / From Last Month tooltip,
  Overspent in _previous month_, Budgeted, For next month, then Ready to
  Assign) followed by the existing To Budget menu and its Move / Hold / Cover
  steps, extracted unchanged from `ToBudget` as `ToBudgetPopover`. Once the
  table scrolls past 40px on windows shorter than 900px the cards give way to
  the 46px strip, returning at the top. Every value is an existing envelope
  spreadsheet cell; no total or formula was added. Owner decisions (September 27, 2026): tracking budgets keep the old month
  picker and per-month summaries; with more than one envelope month visible
  (until BUD-03) the cards describe the first month and the per-month column
  summaries stay; the stepper replaces the 12-month strip (←, → and 0
  shortcuts unchanged) and its month label opens a **month picker** (a year
  of months with previous/next year, months outside the budget disabled);
  "N categories" counts **all** expense categories, hidden included, because
  the Assigned total includes their money; the breakdown keeps "Budgeted"
  until TERM-01; zero uses neutral `pageText` rather than the green-leaning
  `toBudgetZero`; the details-panel toggle is added with DETAIL-01. The card
  subscribes to the breakdown and menu cells while it is shown, because the
  spreadsheet cache only refreshes subscribed cells and the popover mounts on
  demand. **Scope grew beyond the card, with owner approval (September 27, 2026):**
  `C/budget/DynamicBudgetTable.tsx` (passes type and scroll state to the
  header), `C/budget/BudgetTable.tsx` (hides the per-month summary row for a
  single envelope month), new `C/budget/BudgetMonthToolbar.tsx`, a
  `#components/budget/categoryPresentation` import alias in
  `packages/desktop-client/package.json`, and E2E updates:
  `e2e/page-models/budget-page.ts` (Ready to Assign locator and breakdown
  helper; next-month button by role or title), `e2e/budget.test.ts` (summary
  test opens the breakdown; same four labels asserted plus the total) and new
  `e2e/bud-01.test.ts`. Checks: typecheck pass; lint pass; UNIT
  `src/components/budget` 47/47. E2E(bud-01, budget) 12/12 (after adding the month picker); E2E(accounts,
  settings, nav-02, help-menu, transactions, schedules) 37/37. WIDE: 57
  passed, 2 failed, 15 not run — the known Reports failure (1440) and
  `accounts.test.ts:242` at 1000px, which failed the same way on
  `redesign/main` without BUD-01 (the NAV-02 collapsed pane hid the "On
  budget" link the page model clicked; fixed by the NAV-02 follow-up above,
  not a BUD-01 regression). WIDE rerun on the merged `redesign/main`: 58 passed, 1 failed (the known
  Reports baseline at 1440), 15 did not run — back to baseline. VISUAL on Try the demo: dark 1440×900 in all three Ready to
  Assign states (zero, positive after "Reset next month's buffer", negative
  after assigning 9,000 to Food; the breakdown sums to the card each time);
  light 1000×700 including the compact strip and its popover; midnight
  1440×900 with privacy mode (amounts redact, hover reveals as elsewhere);
  midnight 800×700 drawer layout; keyboard: Enter on the card opens the
  popover with focus in the menu, Escape closes and returns focus to the
  card with a visible ring. **Not yet checked:** a custom theme, reduced
  motion (no new animation added), and the per-month summaries with
  several envelope months visible.
- TERM-01: **done September 28, 2026**, merged into `redesign/main` with owner
  approval (branch `redesign/term-01`). Design-decisions §9 wording applied as visible text only; the owner
  approved the "Shown" rows and asked to match YNAB, which added the Cover /
  Transfer picker entry, the envelope goal tooltip and two automation help
  sentences (listed under §9 "As implemented"). No identifier, binding,
  preference, API or `'to-budget'` id changed. Files:
  `C/budget/{BalanceWithCarryover.tsx,util.ts}`,
  `C/budget/envelope/EnvelopeBudgetComponents.tsx`,
  `C/budget/envelope/budgetsummary/{ReadyToAssignBreakdown,ToBudgetAmount,TotalsList}.tsx`,
  `C/budget/goals/displayTemplateMeta.ts`,
  `C/budget/goals/editor/CleanupAutomation.tsx`,
  `C/mobile/budget/{BalanceCell,BudgetCell,BudgetPage,BudgetTable,SpentCell}.tsx`,
  `C/modals/{EnvelopeBalanceMenuModal,EnvelopeBudgetMenuModal,EnvelopeBudgetSummaryModal}.tsx`,
  `C/modals/BudgetAutomationsModal/BudgetAutomationsBody.tsx`, and E2E
  `e2e/budget.test.ts` (breakdown asserts "Assigned"; test title kept so
  snapshot names don't change) and `e2e/page-models/mobile-budget-page.ts`
  (envelope and tracking header names). Locale output is gitignored; nothing
  to stage. Checks: typecheck pass; lint pass; UNIT `src/components/budget`,
  `src/components/mobile`, `src/components/modals` 194/194;
  `generate:i18n` ran; E2E(budget, budget.mobile, bud-01,
  budget-automations.mobile) 51/51. VISUAL on the local test budget
  (dark): desktop envelope 1440×900 (headers, breakdown, transfer picker
  shows "Ready to Assign"), mobile envelope 375×812 (Overassigned, headers,
  "You have assigned more than your available funds"), then switched to
  tracking: desktop and mobile keep Budgeted / Spent / Balance; switched
  back to envelope. **Not yet checked:** WIDE, light/midnight themes, the
  multi-month `ToBudgetAmount` label ("Ready to Assign:" / "Overassigned:")
  on screen, and Linux VRT snapshots (not regenerated).
- BUD-02: **done September 28, 2026**, merged into `redesign/main` with owner
  approval (branch `redesign/bud-02`). Envelope budgets get the design-decisions §4 table; tracking
  budgets are unchanged (owner decision, September 28, 2026: gate on
  `budgetType`, as BUD-01 did). 44px category rows and 40px group rows set
  through `Row`'s `height` (shared `ROW_HEIGHT` untouched; the group drop
  target height uses the new heights); the table is a card with uppercase
  column headers over the existing totals; tinted group rows; row hover
  tint; the editing row gets `selectionBackground` and the input a 1.5px
  `selectionBorder`. Name cell: UI-02 `CategoryTile` (accent from UI-03's
  `getCategoryAccentIndex`, neutral for income) outside the `category-name`
  element, a "Hidden" tag for hidden categories, and row tools that also
  appear on `:focus-within`. Activity: the existing amount (and schedule
  indicator) plus the §7.1 percentage ("Over" when overspent; hidden in
  privacy mode and when more than one month is shown) and progress bar.
  Available: a `StatusPill` inside the existing balance-menu button; tone
  maps `makeBalanceAmountStyle`'s colour (`envelope/availableStatus.ts`),
  target icon for templates/goals, carryover arrow inside the pill with a
  tooltip naming the month, and a full-sentence accessible name; the pill's
  text is still only the amount. Several months visible (until BUD-03): the
  new cells render per month column (owner decision). **Scope grew, with
  owner approval (September 28, 2026)** to `C/budget/{SidebarCategory,
SidebarGroup,BudgetTotals,IncomeCategory,IncomeGroup}.tsx`; new files
  `C/budget/envelopeTable.ts`,
  `C/budget/envelope/{CategoryActivityContent,EnvelopeAvailableButton}.tsx`,
  `C/budget/envelope/availableStatus{,.test}.ts`; a
  `#components/budget/envelopeTable` import alias in
  `packages/desktop-client/package.json`; and E2E page model
  `e2e/page-models/budget-page.ts`: `scrollToBottom` now waits for BUD-01's
  compact strip on windows shorter than 900px. Without it "scroll position
  is restored" failed at 1000px in every full `budget.test.ts` run (saved
  1384, restored 1299): the strip lowers the maximum scroll by 85px and the
  heavier rows now render the swap after the click. The same file passed on
  a `redesign/main` build (8/8), and still passes there with the page-model
  change (16/16). Checks: typecheck pass; lint pass; UNIT
  `src/components/budget` 53/53 (6 new); `generate:i18n` ran (new strings
  in the gitignored `locale/en.json`); E2E(budget, bud-01, accounts,
  settings) 26/26; `budget.test.ts` with `--repeat-each=3` at both WIDE
  sizes 48/48; WIDE 58 passed, 1 failed (known Reports baseline at 1440), 15
  did not run. VISUAL on the local test budget: dark 1440×900 and 1000×700,
  light and midnight 1000×700, compact strip with the table; keyboard:
  click to edit, Enter moves down, Shift+Tab moves up, Enter on a focused
  pill opens the balance menu (Cover / Rollover overspending); Activity
  click still opens the filtered transactions; switched to tracking (32px
  rows, no tiles/pills/bars, Budgeted / Spent / Balance) and back.
  **Not done / not yet checked:** the §4.2 goal/template caption under the
  name (needs a "% saved" formula not in §7; left out); Escape in the
  Assigned input resets the value but leaves the cell open (existing shared
  `Input` behaviour, not changed); a custom theme; reduced motion on screen;
  several envelope months visible; long labels (BUD-03); scrolling
  performance with the extra per-row cell subscriptions; Linux VRT
  snapshots (not regenerated). The existing row chevron buttons still have
  no accessible name (upstream).
- BUD-03: **done September 28, 2026**, merged into `redesign/main` with owner
  approval (branch `redesign/bud-03`). One month only
  (design-decisions §6): the months-shown control is no longer rendered in
  `C/Titlebar.tsx` and `C/budget/index.tsx` passes one month; the `maxMonths`
  global preference is not read, written or migrated. Owner decision
  (September 28, 2026, "YNAB type behavior"): this applies to tracking
  budgets too, which keep their old month picker, per-month summary and
  fixed Category width. Envelope budgets fill the page (§4.1): the Category
  column flexes (minimum 160 / 140 / 120px) and the month columns are fixed
  by window width (≥1280: Assigned 120, Activity 230, Available 120;
  900–1279: 112 / 180 / 104; <900: 112 / hidden / 104). Two widths differ from §4.1, which allows tuning for a real overflow: Assigned is 112px below 1280px (§4.1: 100 / 84px) because the month notes button shares that cell and 84px clipped "1,145.62" at 820px; Available is 104px below 900px (§4.1: 96px) because 96px clipped "12,366.00". The Assigned input is held to its cell (the default 156px input spilled into the Category column once columns were fixed). With Activity hidden, its
  header total, group total and the row's filtered-transactions link are
  not shown at that width. Long names end in an ellipsis inside the 44px
  row. The Category width toggle (Expand / Fully Expand) is hidden for
  envelope budgets (owner decision; `categoryExpandedState` untouched) and
  the column ⋯ menu now sits beside the "Category" label (§4.2). No
  handler, binding, menu item or preference changed. Scope grew, with owner
  approval, to `C/budget/{SidebarCategory,SidebarGroup,BudgetTotals,
IncomeHeader,RenderMonths}.tsx`, `C/budget/envelope/EnvelopeBudgetComponents.tsx`,
  `C/budget/envelopeTable.ts` and new `C/budget/envelopeTable.test.ts`;
  `ExpenseCategory.tsx`, `ExpenseGroup.tsx` and `BudgetTable.tsx` needed no
  change. `MonthCountSelector.tsx` and `BudgetMonthCountContext.tsx` are
  left in place (unused by the UI) so reverting is a small UI change.
  Checks: typecheck pass; lint pass; UNIT `src/components/budget` 56/56 (3
  new); E2E(budget, bud-01, accounts, settings) 26/26; WIDE 58 passed, 1
  failed (known Reports baseline at 1440), 15 did not run. VISUAL on the
  local test budget (dark): 1440×900, 1000×700 (compact strip too) and
  820×700 with a temporarily renamed 84-character category (fits at 1440,
  ellipsis at 1000 and 820; renamed back afterwards); row tools, group tools
  and the column menu (Toggle hidden categories, Expand all, Collapse all)
  still appear and work; switched to tracking (one month, old layout) and
  back. Follow-up pass (Playwright on the preview, fresh demo budgets): light,
  dark and midnight at 1440×900, 1000×700 and 820×700 with a 12,345.67
  Assigned amount, at rest and with the row hovered (budget-menu chevron
  shown) — no Assigned or Available cell clips after the two fixes above;
  privacy mode redacts every amount and the percentage; the column menu
  opens with Enter from the keyboard and lists its three items; reduced
  motion shows the same layout (no animation added). Rerun after the fixes:
  UNIT 56/56, typecheck, lint, E2E(budget, bud-01, accounts, settings)
  26/26, WIDE 58 / 1 known Reports failure / 15 did not run.
  **Not yet checked:** a custom theme; Linux VRT snapshots (not
  regenerated; Docker is available). **Found, not BUD-03:** category-name
  row tools (menu chevron) never take keyboard focus because they are
  `display: none` until hover, so the BUD-02 `:focus-within` rule cannot
  reveal them; Tab goes month notes → budget menu → Available pill. The
  category menu is still reachable by right-click. DETAIL-01's dedicated
  name opener is the natural place to fix this.
- DETAIL-01: **done September 28, 2026**, merged into `redesign/main` with
  owner approval (branch `redesign/detail-01`). The owner approved the
  overlay, fallback, default-subject, column-width and scope decisions below
  (September 28, 2026). Panel frame,
  opener, closing and focus (design-decisions §5); the details themselves
  (hero, stat tiles, goal box, notes, transactions, the panel's own month
  stepper) are DETAIL-02 to DETAIL-04, so the panel shows only its header
  for now: tile, name (wraps), group (plus "Hidden") · month, and ×.
  Envelope budgets only; tracking budgets have no panel, opener or toggle.
  **Open state:** device-local browser storage
  (`actual-budget-details-panel-open`, like the accounts pane); open by
  default; no synced or core preference. **Layout:** 360px from 1280px,
  320px below, pushing the header and table. Below 900px, _or_ when the
  table would not keep its minimum width beside the panel (for example
  1000px with the accounts pane expanded), it becomes an overlay with the
  `scrim` (react-aria modal: focus stays inside, Escape or a scrim click
  closes). **Owner decision:** the overlay starts closed and opening
  or closing it never changes the stored choice, so a narrow window is not
  covered on every visit. **Subject:** the first visible expense category
  until one is chosen; a deleted choice falls back the same way; income
  categories have no opener. **Opener:** the tile and name are one button
  ("Show details for _name_"); click or Enter opens; right-click still opens
  the category menu (Rename / Hide / Delete); the selected row gets the
  selection tint and a 3px `selectionBorder` bar. Because the name now takes
  focus, `:focus-within` reveals the row tools, which fixes the BUD-03
  finding: Tab goes name → category menu ⌄ → notes → Assigned.
  **Closing:** × and Escape (inside the panel) close it and return focus to
  the selected category's name without scrolling; the table's scroll
  position is put back. The header toggle (after the month menu,
  `aria-pressed`, "Show / Hide category details") reopens it. **Columns
  with the panel pushed** (§4.1 rows): 900–1279px: Category ≥120, Assigned
  112, Activity 120, Available 104; ≥1280px with the accounts pane open:
  150 / 112 / 170 / 108. Assigned and Available keep BUD-03's anti-clipping
  minimums instead of §4.1's 84–104 / 92–108. The Activity percentage is
  hidden at those widths. **Scope grew beyond the card, with owner
  approval:** `C/budget/{SidebarCategory,envelopeTable}.ts(x)` (opener;
  panel-aware widths), `C/budget/envelope/EnvelopeBudgetComponents.tsx`
  (percentage visibility), `C/budget/envelope/budgetsummary/EnvelopeBudgetPageHeader.tsx`
  (toggle), `C/budget/envelopeTable.test.ts`. New files:
  `C/budget/CategoryDetails{Context,Panel,Header,Toggle}.tsx`,
  `C/budget/CategoryDetailsContext.test.ts`, `e2e/detail-01.test.ts`.
  `BudgetTable.tsx` and `index.tsx` unchanged; no handler, binding, menu item
  or preference changed. Checks: typecheck pass; lint pass; UNIT
  `src/components/budget` 69/69 (13 new: layout, default/fallback subject,
  storage, toggle, focus return, overlay not stored); `generate:i18n` ran
  (strings in the gitignored `locale/en.json`); E2E(detail-01) 6/6;
  E2E(budget, bud-01, accounts, settings, detail-01) 32/32; WIDE 58 passed, 1 failed (known Reports baseline at 1440), 15 did not run.
  VISUAL (Playwright against the 3018 preview; the in-app browser pane stalls
  at "Initializing the connection to the local database" for both 3017 and
  3018): dark 1440×900 with accounts pane open (narrow Activity, no
  percentage) and collapsed; keyboard focus ring on the name with the row
  tools shown; light 1000×700 open and closed; a 71-character category name
  (row ellipsis, panel heading wraps); midnight 1000×700 pushed, then with
  the accounts pane expanded (falls back to the overlay); dark 820×700
  overlay. **Not yet checked:** a custom theme; reduced motion on screen (no
  animation added); privacy mode (the panel shows no amounts yet); Linux VRT
  snapshots (not regenerated — `budget.test.ts` screenshots at the default
  viewport now include the open panel, so they will need regenerating in
  Docker).
- DETAIL-02: **done September 28, 2026**, merged into `redesign/main` with
  owner approval (branch `redesign/detail-02`). Read-only panel contents
  below the DETAIL-01 header (design-decisions §5 items 2, 3, 6 and 7).
  **Owner decisions (September 28, 2026):** the third stat tile is "From
  _previous month_" (§11 item 1, now Approved); the scope is the core
  read-only content, with the goal box and pace chart left to DETAIL-04 and
  the panel's own month stepper, transaction links and notes editing to
  DETAIL-03 (until then the panel follows the budget month); the list shows
  posted transactions only, not scheduled previews, so it matches Activity.
  **Hero:** Available (`catBalance`), labelled "Available" or "Overspent";
  when negative, the rollover sentence if `catCarryover` is set, otherwise
  "If it isn't covered, this comes out of _next month_'s Ready to Assign";
  then the row's §7.1 progress bar (`getCategoryProgress`). **Tiles:** From
  _previous month_, Assigned (`catBudgeted`), Activity (`catSumAmount`). The
  carried-in amount is read back as Available − Assigned − Activity (new
  `getCarriedIn` in `categoryPresentation.ts`) because the envelope sheet
  builds Available from exactly those three; the rollover rule is not
  repeated. **Notes:** the `useNotes` query read directly (to tell loading
  from empty) and shown with the existing `Notes` markdown view; "No
  notes." when empty; editing stays with the row's notes button.
  **Transactions:** the category balance bindings' filter (category and
  month, `splits: 'inline'`), newest first (`date`, then `sort_order`),
  five rows through `useTransactions`; payee names from
  `DisplayPayeeProvider` (the registers' transfer and split naming), date ·
  account, amount. Split parts appear under their own category; refunds
  and transfers keep their sign. The heading shows the month's total from a
  live `$count` query cell (the `balance-query-*` binding pattern in
  `accounts/Balance.tsx`). **Stale data:** the body is keyed by category and
  month, and `useTransactions` placeholder rows (it keeps the previous
  query's data while loading) count as loading, so switching never shows
  another category's notes or transactions. Loading, empty and error states
  in both sections. **Privacy:** every amount uses `PrivacyFilter`, sized to
  the amount so it doesn't push the label or clip account names. **Scope
  grew beyond the card, with owner approval:** `getCarriedIn` and its tests
  in `C/budget/categoryPresentation{,.test}.ts`; `e2e/fixtures.ts` pins
  category accents in VRT screenshots (accents come from category IDs, which
  the demo budget regenerates for every test, so Budget-page screenshots
  could never match twice; each theme keeps its own `categoryAccent1`); 245
  regenerated Linux VRT baselines. New files:
  `C/budget/CategoryDetails{Body,Summary,StatTile,Notes,Section,Transactions,TransactionRow}.tsx`
  and `e2e/detail-02.test.ts`; `CategoryDetailsPanel.tsx` renders the body.
  No handler, binding, query engine, preference or saved value changed.
  Checks: typecheck pass; lint pass; UNIT `src/components/budget` 74/74 (5
  new for `getCarriedIn`: empty, carried in, rolled-over negative, refund,
  overspent); `generate:i18n` ran; E2E(detail-02) 6/6 (panel amounts match
  the row for three categories, with the carried-in identity; up to five
  transactions and the count; a note added from the row appears read-only;
  next month refreshes to the row's values and "No transactions this
  month."; fast switching ends on the last choice; privacy hides the hero);
  E2E(detail-02, detail-01, budget, bud-01, accounts, transactions,
  settings) 49/49 before the count was added and E2E(detail-02, detail-01,
  budget, bud-01) 24/24 after; WIDE 58 passed, 1 failed (known Reports
  baseline at 1440), 15 did not run. **Fixture comparison** (hand-calculated,
  on a disposable demo budget seeded through `window.$send`): a category
  with 100.00 assigned and 30.00 spent in August, 50.00 assigned in
  September and six September transactions (−20.00; a −45.00 split with
  −25.00 in the category; a +12.00 refund; a −15.00 transfer to off-budget
  Vanguard 401k; −8.00; −4.00) showed From Aug 70.00, Assigned 50.00,
  Activity −60.00, Available 60.00, a count of 6 and the five newest (the
  September 3 row left out, the transfer named "Vanguard 401k", the split
  shown as its −25.00 part). A rollover category (40.00 overspent in August;
  10.00 assigned and 5.00 spent in September) showed From Aug −40.00,
  Overspent −35.00 and the rollover sentence. All matched the calculation
  and the table row. VISUAL (Playwright against the 3018 preview): dark
  1440×900 with a markdown note, overspent and in privacy mode (found and
  fixed: the redaction overlay pushed "Overspent" aside and clipped account
  names); light 1000×700 overspent and the next, empty month; midnight
  820×700 overlay; a custom theme that sets only pre-redesign roles at
  1440×900 and 1000×700 (tiles and notes use the fallback `cardInset`);
  reduced motion: no animations or transitions in the panel. **Linux VRT**
  (Playwright v1.61.1 image against the HTTPS dev server): the first full
  run had 95 passed, 53 failed, 15 did not run. The 52 screenshot failures
  across 15 files were all reviewed as intended changes (NAV-01/02
  navigation and the Budget page with the panel on desktop; TERM-01 wording
  on mobile; two plural fixes, "1 associated rule" and "1 uncategorized
  transaction", that no redesign commit touched). 245 baselines regenerated
  (`9d3472cd8`); every updated test then passed a run without
  `--update-snapshots`. Run VRT with one worker: two containers in parallel
  caused timeouts, not mismatches, and a loaded run can capture a
  tracking-budget screenshot before the budget type switch renders (the
  mobile one was restored to its original; the Reports tracking forecast was
  recaptured and checked in all three themes). **Found, not DETAIL-02:** the
  tour skips its "budget summary" step on envelope budgets because BUD-01
  hid the element it targets, and its text still says "To Budget",
  "Budgeted" and "Balance" (fix on `redesign/tour-fix`); in light, the open
  account in the accounts pane is only faintly highlighted (NAV-02).
  **Not yet checked:** the overlay in a custom theme; performance with the
  panel's queries (→ QA-00).
- TOUR-FIX (bug fix, no task card): **done September 28, 2026**, merged
  into `redesign/main` with owner approval (`485a7fbe3`). **Problem:** on
  envelope budgets the in-app tour skipped its third step ("budget
  summary"): BUD-01 hid the per-month summary row it targeted
  (`[data-testid="budget-summary"]`), so react-joyride found no target and
  moved on. `e2e/tour.test.ts` failed with "Expected 3 of 8,
  Received 4 of 8" (reproduced on unmodified `redesign/main` at
  `1e6b570ed`: tour 1 failed, 1 passed; budget 8/8). TERM-01 also missed the
  tour's text ("To Budget", "Budgeted", "Balance"). **Changes, all in
  `C/tour/steps.tsx` and `steps.test.ts`:** the envelope summary step
  targets the Ready to Assign card (its existing `data-testid`), or the
  compact strip's copy when a short window's table has scrolled and the
  strip has replaced the cards; the envelope wording follows
  design-decisions §9. Two problems found while verifying and fixed with
  owner approval: the tracking summary step preferred the current month's
  summary, which `BudgetSummaries` renders clipped beside the shown month
  for its slide animation, so on any other month it spotlighted a blank
  area; it now matches the month the picker shows. The month step no longer
  mentions the calendar icons for choosing how many months are shown, which
  BUD-03 removed (both budget types). No budget component, handler,
  preference or saved value changed. Checks (after rebasing on
  `28fe2ec08`): typecheck pass; lint pass; UNIT `src/components/tour` 12/12
  (6 new: envelope picks the shown card, the strip when the cards are
  hidden, nothing when neither is shown; tracking picks the current month,
  the shown month beside its clipped neighbours, nothing when the shown
  month has no summary; the envelope and shown-month cases fail on the old
  code); `generate:i18n` ran, and the only keys that changed are the three
  tour sentences plus "To Budget", which no longer has a use; tracking's
  category sentence keeps its key, so its translations still apply;
  E2E(tour, budget) 10/10, the tour walking every step to "8 of 8". A
  scratch Playwright script (not committed) against the 3018 preview on the
  demo budget passed 4/4, each walking all 8 steps: envelope at 1440×900
  (step 3 anchored under the card; steps 4 and 5 show the new text);
  envelope at 1000×700 with the table scrolled (step 3 anchored under the
  strip); tracking at 1440×900 (step 3 under the January summary, category
  text unchanged); tracking moved to February (step 3 under the February
  summary). No VRT: the tour test takes no screenshots.
- THEME-02: **done September 28, 2026**, merged into `redesign/main` with
  owner approval (`f9f4e1892`, branch `redesign/theme-02`; decision D-4).
  Dark and midnight values of existing roles retuned so unmigrated pages
  share the Budget page's surfaces; values and contrast are recorded in
  design-decisions §8 "Retuned in THEME-02". **Scope grew beyond the card,
  with owner approval:** the card covered only the table and card roles, but
  in dark Settings sections (`pill*`), search and rule inputs
  (`formInput*`), menus, tooltips and normal buttons had navy roles of their
  own, so they were included. Only `L/themes/{dark,midnight}.css` changed; no
  component, handler, preference or saved value changed, and light and
  `fallback.css` are untouched. **Found and fixed during review:** matching
  `pillBackground` to the card made the rule editor's condition rows (which
  use `styles.editorPill`) disappear into the modal, so dark's pill is one
  step lighter (`gray700`); the first gray-ramp mapping made row hover,
  table and input borders, menu hover, autocomplete hover and midnight
  button hover less distinct than today, so those use calibrated grays that
  keep today's ratios. Checks: typecheck pass; lint: oxlint pass and the
  changed files are formatted (the root `lint` format check fails only on
  the gitignored local `.impeccable/design.json`); UNIT `src/style` 215/215
  and `@actual-app/components` 42/42; `build:browser`; E2E(budget, accounts,
  reports, schedules, settings) 45/45 against the 3018 preview; Impeccable
  detector on both theme files: no findings. A scratch contrast audit
  (not committed) resolved every changed role before and after: all text
  pairs rise except the midnight table header (11.44 → 10.41:1); hover and
  selection pairs are equal or higher; lower edge distinctions for pills,
  rule chips and the dark modal border were accepted by the owner. VISUAL
  (scratch Playwright script against the 3017 dev server, one demo budget
  kept across runs so accents match): Budget, All accounts, an account
  register with a hovered row, Reports, Schedules, Payees, Rules, Tags,
  Settings, the rule editor modal and the account menu, in dark and midnight
  at 1440×900 and 1000×700, before and after (88 images, reviewed by the
  owner); a custom theme on the dark base that sets only four pre-redesign
  roles, at both sizes (loads and stays readable; unset table roles now take
  the gray base instead of navy). **Not yet run:** WIDE, and Linux VRT
  regeneration: dark and midnight screenshots change across most VRT tests
  (→ QA-00).
- QA-00: **done September 29, 2026**, merged into `redesign/main` with
  owner approval (`1e94b0559`, branch `redesign/qa-00`; the
  owner moved it ahead of THEME-02 and asked that the Linux VRT run wait
  for THEME-02 to merge, which happened during QA-00). Full record in
  [verification.md](verification.md). No application file changed. New
  files: `docs/redesign/verification.md`, five evidence screenshots in
  `docs/redesign/verification/qa-00/`, and `scripts/redesign-perf.mjs`
  (outside the app, so QA-01 can rerun the same method; its `summary` mode
  prints the tables). **Performance:** v26.9.0 (`59fe126f6`, own worktree, 3019) against `redesign/main` (3018), the demo plus 100 added categories,
  7 rounds at 1440×900 and 1000×700, a third variant with the details panel
  closed; 42 runs, none failed. Assigned edits are 36% (1440) and 47%
  (1000) slower, with or without the panel; the table drops 2–3 frames
  (49–85 ms) whenever it leaves or returns to the top, traced to the
  `isScrolled` flip in `DynamicBudgetTable`; the large budget settles
  17–19% later after load (part of it the panel's queries). Month switching
  and opening a register are not slower. Opened **PERF-01** (edits and
  settle) and **PERF-02** (scroll flip); proposed QA-01 thresholds (within
  10% of the base medians, no frame over 33 ms while scrolling). Another
  session rebuilt the shared browser build with THEME-02 at 21:17, partway
  through the timing run; THEME-02 changes only dark and midnight values,
  the runs used light, and rounds before and after the rebuild agree.
  **Custom theme:** two installed custom themes (dark and light bases) that
  set every pre-redesign role, hue-rotated, and no redesign role; every
  redesigned surface at 1440, 1000, the 820 overlay and mobile checked by
  script (every computed colour comes from a theme role; outside the custom
  CSS and `fallback.css` only the category accents, as design-decisions §8
  intends) and by eye. Pass; clears BUD-01, BUD-02, BUD-03 and DETAIL-01's
  gap. **Reduced motion:** every redesign transition stops; only the
  upstream Reports loading animation remains. Pass. **Carried forward:**
  the open account in light has no visible fill (white on white, 1.00:1;
  added to BUD-04); TERM-01 wording correct in light and midnight,
  including the mobile Budget Summary modal, the only place the
  multi-month "Ready to Assign:" label still shows. **Linux VRT:**
  after THEME-02 merged (`5b6df214b`), Playwright v1.61.1 Docker image,
  one worker. The full run had 56 passed, 92 failed (all screenshot
  mismatches) and 15 did not run. Three light failures ("1 associated
  rules", "1 uncategorized transactions") came from the new worktree
  missing the gitignored `locale/` files; with them copied in, the
  baselines' singular text returned. Updating the 21 failing files changed
  204 snapshots (141 dark, 63 midnight, no light, no new files, no size
  changes). A before/after review of the most-changed snapshot per file
  showed only THEME-02's surface retune. The rerun without updating passed
  141/141. **For the owner (backlog D-5):** THEME-02 also recoloured the
  mobile screens in dark and midnight, where plan §19.4 keeps the upstream
  look. Checks: typecheck pass (10 tasks); lint pass. **Review gap accepted
  at merge:** 23 of the 204 changed snapshots were compared by eye (the
  most-changed per test file plus two of the smallest); the other 181 were
  checked by script only (no light change, no size change, rerun passes). No UI file changed, so
  the Impeccable detector does not apply.
- BUD-04: **done September 29, 2026**, merged into `redesign/main` with
  owner approval (`c0527171d`, branch `redesign/bud-04`). Four Budget-page fixes from the mid-project review and
  QA-00; no handler, binding, value or query change. **Files:**
  `C/budget/envelope/CategoryActivityContent.tsx` (the bar is positioned
  under the amount instead of stacked with it, so only the amount line is
  centred in the cell); `C/budget/envelope/budgetsummary/ReadyToAssignCard.tsx`
  (container query on the card: when the label and badge don't fit on one
  line, the badge takes the subline's place under the amount;
  thresholds 223px for "All assigned", 243px for "Overassigned", measured
  from the English label 99px, badges 80/99px, the 32px chevron gap);
  `C/sidebar/Accounts.tsx`, `C/sidebar/Account.tsx` and new
  `C/sidebar/railInitials.ts` + `railInitials.test.ts` (collision-aware rail
  initials; the open account uses the new role; the pane's account name is
  now centred in its 32px row, which it wasn't in any theme); new role
  `navListActive` in `L/theme.ts` and `L/themes/{light,dark,midnight,fallback}.css`
  (design-decisions §8). **Scope beyond the card:** the new theme role (the
  only way to change light without changing `navActive` for the top tabs or
  the look of dark and midnight) and the centring fix in the pane.
  **Measured** (the demo, 3018 preview, Playwright, before on `9fb57f6d6`,
  after on this branch): the first row's Activity amount was 5.5px above
  Assigned and Available at 1000×700 and 1440×900 in all three themes; now
  all three share the row's centre line to 0.1px. The Ready to Assign label
  row was 37px (badge wrapped) at 1000×700; now one 16px line with the badge
  under the amount; unchanged at 820 (overlay) and 1440 for "All assigned";
  "Overassigned" would also have wrapped at 1440 (card 273px) and now moves
  under the amount there too. Rail at 1000×700: B A C **H** V M **H** R →
  B A C **HS** V M **HA** R. Open account fill: light white on white
  (1.00:1) → `rgba(15,15,30,.1)` (1.24:1), no shadow; dark and midnight
  computed values unchanged. Evidence in `docs/redesign/verification/bud-04/`
  (activity rows before/after at 1440 light and 1000 dark; Ready to Assign
  at 1000 before, after zero, after negative in three themes, and negative
  at 1440; rail before/after; open account before/after in light plus dark
  and midnight). **Checks:** typecheck pass (7 tasks); `oxlint
--type-aware --quiet` pass; `oxfmt --check` passes on everything tracked
  (the root `yarn lint` stops at the gitignored local
  `.impeccable/design.json`, which is not formatted; not in this diff).
  UNIT `src/style src/components/budget src/components/sidebar` 304/304
  (9 new rail tests); `@actual-app/components` 42/42. E2E(budget, nav-02,
  bud-01, accounts) 28/28 against the rebuilt 3018 preview. Impeccable
  detector on the changed UI and theme files: one advisory, the upstream
  tooltip's `0px 5px 5px 0px` radius in `Account.tsx` (not touched here).
  **Not checked:** a custom theme by eye (the fallback maps `navListActive`
  to `navActive`, which is what the pane used before, so custom themes
  should look as QA-00 recorded); keyboard focus on the moved badge (it is
  not focusable; the card button's accessible name now omits the hidden
  copy); WIDE and Linux VRT (light budget and account screenshots will
  change: the Activity row, the rail and the open account). **Seen, not
  fixed:** a very large negative Ready to Assign (−99,599.00) overflows the
  34px hero amount at 1000×700; that is the BUD-01 amount style, not
  this change. The badge thresholds are English; a longer translation of
  the label or badge can still wrap.
- PERF-01: **done September 29, 2026**, merged into `redesign/main` with
  owner approval (`8f88c6841`, branch `redesign/perf-01` from `6eb4efc7a`). **Cause, found by
  profiling:** each Assigned edit re-rendered every category row three
  times, in the base too: once when the edit moved to the next row, and
  once each when the save mutation went pending and settled. The React
  Compiler skipped `Budget`, `BudgetTable` and `DynamicBudgetTable`
  (a default inside an object destructure, reported by the compiler as
  `Expected object property value to be an LVal, got: AssignmentPattern`),
  so every handler they passed was new on each render and no row's `memo`
  held. The redesign's rows cost more to render (tile, Available pill,
  details opener, progress bar, per-row preference reads), and that cost
  was paid three times per edit. **Files:** `C/budget/index.tsx`,
  `C/budget/BudgetTable.tsx`, `C/budget/DynamicBudgetTable.tsx` (the
  destructure defaults rewritten to give the same values, so all three
  compile; `index.tsx` also passes each mutation's stable `mutate`, since
  TanStack's mutation result object is new on every render, and declares
  `onApplyBudgetTemplatesInGroup` after the mutation it calls so the
  compiler can memoize it; `DynamicBudgetTable` drops a `maxMonths = 3`
  default that never applied, the prop being required, and `AutoSizer`'s
  `width = 0, height = 0` became a falsy check);
  `C/budget/envelopeTable.ts` (new `EnvelopeTableLayoutProvider`: budget
  type, column widths and the category column style worked out once per
  page and shared through a memoized context; `useIsEnvelopeTable`,
  `useEnvelopeColumnWidths` and `useCategoryColumnStyle` keep their names
  and read it, and throw outside the provider; every caller is under
  `DynamicBudgetTable`); `L/CategoryTile.tsx` (one shared
  `Intl.Segmenter`; tile classes cached per size and accent). Handlers call
  the same mutations with the same arguments; no binding, saved value or
  query changed, and the panel still opens by default. **Scope beyond the
  card:** `C/budget/index.tsx`, approved by the owner on September 29, 2026;
  it is upstream code and may conflict at SYNC-01, though the rewrite is
  small. **Renders per edit** (demo, dev server, React DevTools' did-render
  rule): the two mutation commits went from about 1,000 components each
  (every row) to 2 (`Budget` and one child); the commit that moves the
  edit to the next row still re-renders the table, as in the base.
  **Measured** (`scripts/redesign-perf.mjs run 7`, v26.9.0 `59fe126f6` on
  3019 and this branch on 3018 in the same session, 42 runs, none failed):

  | Measure                       | 1440 base | 1440 redesign | 1000 base | 1000 redesign |
  | ----------------------------- | --------: | ------------: | --------: | ------------: |
  | Assigned edit: median         |       124 |     52 (−58%) |       125 |     51 (−59%) |
  | Assigned edit: p90            |       163 |     69 (−58%) |       160 |     69 (−57%) |
  | First paint, large: first row |      1519 |    1512 (−0%) |      1530 |    1486 (−3%) |
  | First paint, large: settled   |      1632 |    1744 (+7%) |      1635 |    1718 (+5%) |

  The panel-closed variant matches (52 ms at both sizes). Assigned edits
  pass D-6 at both sizes, and are now faster than the base. Large
  first-paint settled (reported, not blocking) went from +17–19% in QA-00
  to +5–7%. Before the compiler fix, the layout context and tile caching
  alone reached 159 ms against a 167 ms start. **Seen for PERF-02:** in this
  run no scroll frame went over 33 ms (longest 17.7 ms at 1440, 33.3 ms at
  1000; QA-00 had 49–85 ms), probably because `DynamicBudgetTable` now
  compiles and its `isScrolled` re-render no longer reaches the rows.
  PERF-02 still has to confirm it. **Checks:** typecheck pass; `oxlint
--type-aware --quiet` and `oxfmt --check` pass on the changed files. UNIT
  `src/components/budget` 74/74 (including `envelopeTable.test.ts`);
  `@actual-app/components` 42/42. E2E(budget, detail-01, detail-02) 20/20
  against the rebuilt 3018 preview. Tracking-budget smoke test (demo
  switched to tracking at 1440×900, script): the table keeps its upstream
  layout, an Assigned edit saves, and renaming a category through the row
  menu saves, with no console errors. Impeccable detector on the changed
  files: clean. **Reorder and templates** (script, demo at 1440×900, run
  the same way on this branch's 3018 build and on the v26.9.0 base at 3019,
  9/9 on both): a category dragged within its group, then across groups,
  then within the first group again (checking that a third drag uses the
  updated order), then a group dragged above another. Each order is read
  back from `get-categories`, is unchanged after a reload, and the table
  shows the same order. Then "Overwrite with templates" on Usual Expenses
  with `#template` notes on Food and General, run from the month after the
  first one shown: the amounts land in that month and the first month is
  unchanged. No console errors. Playwright's one-step `dragTo` drops before
  the table works out above or below and fails the same way on both builds,
  so the script uses a slow mouse drag with pauses. **Not checked:** WIDE
  and Linux VRT (nothing visual changed, so no snapshot should move).

- PERF-02: **closed September 29, 2026 with no source change**, by owner
  decision (branch `redesign/perf-02` from `320071bc7`; documentation
  only). PERF-01's compiler fix already removed the long frames: with
  `DynamicBudgetTable` compiled, flipping `isScrolled` no longer re-renders
  the rows. **Measured** (`scripts/redesign-perf.mjs run 7`, v26.9.0
  `59fe126f6` on 3019 and a fresh `build:browser` of `320071bc7` on 3018 in
  the same session, 42 runs, none failed):

  | Measure                            | 1440 base | 1440 redesign | 1000 base | 1000 redesign |
  | ---------------------------------- | --------: | ------------: | --------: | ------------: |
  | Scroll: frames over 33 ms (of 359) |         0 |             0 |         0 |             0 |
  | Scroll: longest frame              |      18.7 |          18.6 |      18.5 |          33.3 |
  | Scroll: p95 frame                  |      17.9 |          17.7 |      17.8 |          18.0 |

  QA-00 had 2–3 frames of 49–85 ms per run. The other blocking measures
  also pass D-6 in this run (Assigned edit median 51 ms against the base's
  124 ms at both sizes). **Near miss, accepted by the owner:** at 1000×700
  the redesign dropped one frame (33.3 ms, two refreshes at 60 fps) in 5 of
  7 runs, and the panel-closed variant in 2 of 7; never at 1440×900, and
  the base's longest at 1000×700 was 25.5 ms. The script counts frames over
  33.4 ms, so these pass. It is probably the layout change when the cards
  give way to the strip, which only happens below 900 px tall; not
  profiled. QA-01 should watch it. A scratch profile with Long Animation
  Frame entries (3 runs a size, without the reload the script does first)
  saw no frame over 18.7 ms and ~16.7 ms frames on either side of every
  swap. The flip still re-renders `DynamicBudgetTable` at 1440×900, where
  nothing visible changes; cheap now, left as is. **Checks:** E2E(budget,
  bud-01, tour) 14/14 against 3018. VISUAL (script, demo, light): at
  1000×700 the strip replaces the cards after scrolling and the cards
  return at the top; at 1440×900 the cards stay
  ([1000](verification/perf-02/light-budget-1000-scrolled.png),
  [1440](verification/perf-02/light-budget-1440-scrolled.png)). No
  typecheck, lint or UNIT: no source changed.

- ASSIGN-FIX (bug fix, no task card): **done September 29, 2026**, merged
  into `redesign/main` with owner approval (`cc078bd06`, branch
  `redesign/bud-assigned-hover` from `c53871325`). **Problem:** the Linux
  VRT `Budget-transfer-funds-to-another-category-2` (1280×720, dark, panel
  open) showed Food's Assigned as "-755...." beside the month notes icon
  and budget menu chevron, though design-decisions §4.2 says row tools
  take no width. **Cause:** in `ExpenseCategoryMonth` the notes button
  (about 23px, always in the flex row) and the `hover-expand` chevron
  wrapper (0px at rest, about 23px on hover or focus) sat beside the
  amount inside the 112px Assigned cell. On hover the amount's box shrank
  to 66px with the panel open, or 74px with it closed (from 112 or 120px).
  Measured on the unmodified build: every signed 7-character amount
  overflowed with the panel open, and `12,366.00` overflowed in every
  layout. **First attempt, dropped:** laying the tools over the cell's
  left edge gave the amount the whole column, but at 112px a 9-character
  amount ran into the chevron and the edit box's hover ring enclosed the
  icons. **Change:** the tools move into an absolutely positioned layer
  just left of the Assigned column (`right: 100%`, width
  `ENVELOPE_ASSIGNED_TOOLS_WIDTH` = 48px, new in `C/budget/envelopeTable.ts`).
  In envelope budgets the Category cell keeps a matching 48px right
  padding, so a long name and its own tools end before the gutter. DOM
  order, tab order, hover and focus rules, the budget menu's anchor (still
  the Assigned cell), handlers, bindings and saved values are unchanged.
  Column widths are unchanged. The `getEnvelopeColumnWidths` comment no
  longer says the notes button shares the cell. DESIGN.md's envelope table
  paragraph records the gutter. **Files:**
  `C/budget/envelope/EnvelopeBudgetComponents.tsx`,
  `C/budget/SidebarCategory.tsx`, `C/budget/envelopeTable.ts`, `DESIGN.md`,
  three Linux snapshots, and the docs. **Checks:** typecheck pass; lint
  pass; UNIT `src/components/budget` 74/74; E2E(budget, bud-01, detail-01)
  18/18 against a fresh `build:browser` preview (port 3028). Impeccable
  detector on the three changed source files: two `layout-transition`
  warnings on the `hover-expand` `max-width` rules. The base file has the
  same two warnings, and they are 0s delayed snaps, not animations.
  **VISUAL** (scratch Playwright script, not committed, demo budget):
  1000×700, 1280×720 and 1440×900, light, dark and midnight, panel open
  and closed, hovering three rows (a signed 7-character amount,
  `12,366.00`, and a 45-character category name). 54 of 54 cases: the
  amount's text box is the whole column (96 or 104px) and never overflows,
  and the long name always ends before the tools (for example 416px
  against 457px at 1280×720). Before and after:
  [before](verification/assign-fix/before-dark-1280-panel-hover.png),
  [after](verification/assign-fix/after-dark-1280-panel-hover.png),
  [long name, light 1000](verification/assign-fix/after-light-1000-panel-long-name.png),
  [midnight 1440](verification/assign-fix/after-midnight-1440-hover.png).
  Keyboard: Tab goes name, category menu, category notes, month notes,
  budget menu (unchanged), and the month notes focus ring shows. The
  budget menu opens below the Assigned cell, and the notes popover opens.
  **Linux VRT** (Playwright v1.61.1 image, HTTPS `vite preview` over the
  LAN address, one worker): budget, command-bar, help-menu and onboarding
  had 12 passed, 6 failed. To keep only this change's snapshots, all
  screenshots in the three failing files were captured from a base build
  and from this branch. Only the three `transfer funds to another category`
  snapshots differ (about 645 pixels each, all in the Food row's
  Assigned and tools area). Those three were updated; the rerun without
  `--update-snapshots` passed 1/1. **Gaps:** the other failures (the
  `renders the summary information` budget snapshots, command-bar and
  help-menu) are identical on the base build. They are BUD-04's layout
  (Ready to Assign badge, Activity amounts on the centre line), which BUD-04
  did not regenerate, and are left for a separate VRT refresh. The three
  updated snapshots also pick up that BUD-04 layout, since a snapshot
  cannot take one change without the other. Not checked: a custom theme
  (no colour or theme role changed), WIDE, and pixel-exact `-755.00` in the
  scratch script (the demo's dates move, so it used other signed
  7-character amounts; the Linux VRT shows the exact `-755.00` case). At
  window widths where the Category column is at its minimum, the gutter
  leaves 48px less for the name.
- DETAIL-03: **done September 29, 2026**, merged into `redesign/main` with
  owner approval (`658a38c90`; branch `redesign/detail-03` from
  `c53871325`). The merge regenerated the three transfer-funds Budget
  snapshots on top of ASSIGN-FIX. Panel actions (design-decisions §5
  items 1, 6 and 7; plan §10 Part B). **Owner decisions (September 29,
  2026):** the five transaction rows stay read-only (the desktop app has no
  view for a single transaction), and "View in Accounts" under the list is
  the only link; notes are edited with the row's own `NotesButton`, placed
  beside the Notes heading, so there is no second save path. **Month
  stepper:** ‹ month › in the header, labelled "Details: month before" and
  "Details: month after" (a first draft's "Next month in details" matched the
  Budget page model's `Next month` locator and would have broken every E2E
  test that changes month). The panel follows the budget month until the
  stepper is used, and again whenever the budget month changes
  (`resolveDetailsMonth`); it stops at the budget's month bounds
  (`stepDetailsMonth`). The Budget page's month does not move. **View in
  Accounts:** shown when the list has transactions; calls the page's
  existing `onShowActivity` (the handler behind the row's Activity amount)
  with the panel's month, after saving the table scroll position under the
  same `budget-scroll-position` key `BudgetTable` restores. **Notes:** the
  popover editor saves when it closes and only if the text changed, as in the
  row. Escape closes the editor first, not the panel (react-aria stops the
  event); the editor takes the first click outside it, so switching category
  or closing the panel while editing always saves first. **Scope grew beyond
  the card:** the chosen category and panel month are kept in
  `sessionStorage` (`actual-budget-details-category`,
  `actual-budget-details-month`), because going to Accounts and back
  otherwise reset the panel to the first category. This is browser-session
  storage, not a synced or core preference. Changed files:
  `C/budget/CategoryDetails{Context,Context.test,Header,Notes,Panel,Transactions,TransactionRow}.ts(x)`,
  `C/budget/DynamicBudgetTable.tsx` (passes the budget month, month bounds and
  `onShowActivity` to the provider); new `e2e/detail-03.test.ts`.
  `NotesButton.tsx` and `NotesModal.tsx` unchanged. No handler, query,
  preference or saved value changed. Checks: typecheck pass; lint pass; UNIT
  `src/components/budget` 81/81 (7 new: month follow/reset, step bounds,
  provider stepping and reset, bounds at the last month, category and month
  kept across remount, scroll saved and handler called); `generate:i18n`
  ran; E2E(detail-03) 6/6 (stepper moves the panel only, and values in the
  stepped month match the table on that month; keyboard stepping; View in
  Accounts gives the same register rows as Activity and back keeps the
  category; the link uses the panel month and back keeps it; a note edited
  in the panel saves on Escape and shows in the row; clicking away saves to
  the right category); E2E(detail-01, detail-02, detail-03, budget, bud-01,
  transactions, accounts, settings) 55/55 and E2E(nav-02, tour, help-menu)
  8/8, with `--ignore-snapshots`; after the header's last change,
  E2E(detail-01, detail-02, detail-03, budget) 26/26. Impeccable detector:
  no findings. VISUAL (Playwright against its own dev server, demo budget;
  [screenshots](verification/detail-03/)): dark 1440×900, with focus rings
  on the stepper and the link, the notes editor open, and privacy mode (every
  panel amount redacted; the link shows no amount); light 1000×700 and
  stepped back to an empty month (found and fixed: at 320px the stepper wraps
  and left a dangling "·" after the group name, so the separator was
  removed); midnight 820×700 overlay, with a note saved by Escape and the
  overlay still open, then Escape closing it. **Custom theme** (the QA-00
  method rebuilt: every v26.9.0 `--color-*` role resolved through the
  palette and hue-rotated 150°, none of the redesign roles; "custom dark" 224
  roles on base `dark`, "custom light" 226 on base `light`; installed through
  `installedCustomLightTheme` and reloaded): panel pushed at 1440×900 and
  1000×700, with and without the notes editor open, and the 820×700 overlay.
  Every computed text, background, border and outline colour in the panel and
  the notes popover matched an active theme role. The only roles not set by
  the custom CSS are `categoryAccent1`–`10` (kept from the base by design,
  design-decisions §8) and `cardInset` and `progressTrack` (derived by the
  fallback layer from the custom colours). One colour matched no role: the
  browser-default fill of react-aria's visually hidden dismiss button inside
  the popover (also seen in QA-00). No console errors. Screenshots:
  `custom-dark-1440.png`, `custom-light-1440-notes.png`,
  `custom-dark-820-overlay.png`, `custom-light-1000.png`. **Linux VRT**
  (Playwright v1.61.1 image against the HTTPS dev server): the first full
  run had 123 passed, 31 failed, 15 did not run; all 31 were screenshot
  mismatches. A script compared each regenerated snapshot with the committed
  one: 156 of the 177 changed snapshots differ only inside the accounts pane
  (BUD-04's pane changes, which were never regenerated), and 21 are over the
  Budget page (Budget ×6, command bar ×3, help menu and keyboard shortcuts
  ×12), combining BUD-04's shorter summary cards with this task's panel
  controls. Reviewed by eye: the Budget, command bar and shortcuts shots in
  dark and midnight, and a pane-only Payees shot. Regenerated with
  `--update-snapshots=changed` on those 11 files (the long schedules test
  needed `--timeout=240000`). Verification run without updating: 168 passed,
  1 flaky (`budget.mobile.test.ts` "set budget to 3 month average", passed
  on retry; it passed in the first run and this task doesn't touch mobile), 0
  failed. Found in review, not caused by this task: the Food row in
  `Budget-transfer-funds-to-another-category-2` shows its Assigned amount
  cut to "-755...." beside the row's hover tools; the committed snapshot
  already had it (split into its own task).
  **WIDE** (the recipe's config, pointed at this branch's own production
  build served on 3028 from a scratch folder, so the other session's 3018
  preview and `build/` were left alone): 58 passed, 1 failed (the known
  Reports baseline at 1440: more widgets fit than the test expects), 15 did
  not run, matching the recorded baseline.
  **Known limits:** the empty-notes button keeps the row's
  30% placeholder opacity, which is faint; notes text is not redacted in
  privacy mode (unchanged from DETAIL-02 and the row's tooltip).
- DETAIL-04: **done September 29, 2026**, merged into `redesign/main` with
  owner approval (`9059b8491`; branch `redesign/detail-04` from `225c5bfc3`). Goal box and pace chart in the details panel
  (design-decisions §5 items 4 and 5, §7.2; plan §10 Part A). **Owner
  decisions (September 29, 2026):** past and future months follow §7.2 as
  shown (§11 item 2, now Approved); the goal box shows the goal values and
  the category's template sentences. **Goal box:** reads the goal bindings
  the Available pill reads (`catGoal`, `catLongGoal`), only when goal
  templates are on and the month has a goal. New `getGoalStatus` compares
  Assigned for a template and Available for a long-term goal, as
  `makeBalanceAmountStyle` does. Status line ("Template 250.00 · 30.00
  short", "Goal 10,000.00 · 49% saved") with the target icon in warning
  until met, then positive (the percentage stays below 100% until then); a
  bar; the pill's sentence; then the template sentences through the existing `TemplateSentence`, when the automations UI
  flag is on (as the automation button's tooltip; `getAutomationEntries` is
  now exported from `CategoryAutomationButton.tsx` for this). A long-term
  goal replaces the pace chart. **Pace:** spending by day from the
  transaction list's filter (category and month, `splits: 'inline'`)
  grouped by date and summed, into UI-03's `getCategoryPace`; start is
  Available − Activity (carried in + Assigned). Recharts (already used by
  Reports), animation off: stepped cumulative line in the accent (negative
  when Available is negative), dashed even-pace line, dotted today line in
  the current month; a future month shows the pace line and "No activity
  yet". Legend and summary below; the accessible name is the text
  equivalent ("Spent 229.09 of 483.80 by Sep 29. 238.58 under even pace.").
  Loading and error states. **Privacy:** the chart is replaced by "Chart
  hidden in privacy mode", its accessible name has no amounts, and the
  summary and goal text are redacted. **Found and fixed:** the panel's
  sections squashed and overlapped instead of scrolling once the content was
  taller than the card (`View` sets `min-height: 0`); the new sections made
  it show at 1000×700 and 1440×900. `CategoryDetailsPanel.tsx` now stops the
  card's children from shrinking. Changed files:
  `C/budget/CategoryDetails{Body,Panel}.tsx`,
  `C/budget/categoryPresentation{,.test}.ts`,
  `C/budget/goals/CategoryAutomationButton.tsx` (export only); new
  `C/budget/CategoryDetails{Outlook,Goal,Pace,PaceChart,LegendKey}.tsx`,
  `e2e/detail-04.test.ts`. No handler, binding, query engine, preference or
  saved value changed. Checks: typecheck pass; lint pass; UNIT
  `src/components/budget` 86/86 (5 new for `getGoalStatus`: long-term goal,
  template against Assigned, met and capped, overspent goal, zero target);
  `generate:i18n` ran; E2E(detail-04) 6/6 (the current month's text
  equivalent and summary match a hand calculation from the panel's tiles and
  the Sep 1 – 30 range; a past month's "Finished …" matches Available; a
  future month shows "… to spend from … 1" equal to Available; assigning
  exactly minus the carried-in amount gives "Nothing assigned, so no pace
  line" and no pace line; a template 30.00 short and a long-term goal with
  its percentage, which hides the pace chart; privacy hides the chart and
  its amounts); E2E(detail-01, detail-02, detail-03, detail-04, budget,
  bud-01, transactions, accounts, settings, nav-02, tour, help-menu) 69/69
  with `--ignore-snapshots`. These E2E and WIDE runs used this branch's own
  Vite dev server on 3027, not a `build:browser` preview: another session
  was rebuilding loot-core's browser worker while this ran, so a production
  build here would have raced it, and `build/` backs that session's 3018
  preview. Impeccable detector: no findings. **Fixture comparison**
  (hand-calculated, demo budget, September 29): Food, 83.80 carried in,
  400.00 assigned, 229.09 spent: even pace by day 29 is 483.80 × 29 / 30 =
  467.67, so 238.58 under, as shown. Clothing, 50.00 template, nothing
  carried in: 50.00 × 29 / 30 = 48.33 against 495.44 spent, 447.11 over.
  Food in August: 400.00 − 477.99 = 77.99 overspent. Food in October:
  September's 230.82 to spend from Oct 1. VISUAL (Playwright against the
  3027 dev server, demo budget; [screenshots](verification/detail-04/)):
  dark 1440×900 for a current month, a template and a long-term goal; light
  1000×700 current, past and future months; midnight 820×700 overlay; dark
  privacy mode. Found and fixed: the future month's "No activity yet" sat on
  the pace line, so it has a Card Inset backing. Reduced motion: the chart
  never animates; the only transitions left in the panel are the notes
  buttons' existing 0.25s focus shadow. **Custom theme** (DETAIL-03's
  method: every v26.9.0 role hue-rotated 150°, none of the redesign roles;
  a template seeded so the goal box shows): 1440×900, 1000×700 and the
  820×700 overlay in custom dark and custom light. Every computed text,
  background, border, outline and SVG stroke and fill colour in the panel
  matched an active role; not set by the custom CSS were `cardInset`,
  `progressTrack` and `pageTextFaint` (derived by the fallback layer) and
  the category accents (kept from the base by design). No console errors.
  **WIDE:** 58 passed, 1 failed (the known Reports baseline at 1440), 15 did
  not run, matching the recorded baseline.
  **Linux VRT** (Playwright v1.61.1 image against the HTTPS dev server,
  one worker): the full run had 169 passed, 6 failed. One was a timeout in
  `accounts.test.ts`'s setup, the first desktop test while the dev server
  warmed up. The other five were screenshot mismatches (Budget summary and
  transfer funds, command bar, help menu, keyboard shortcuts). Pixel
  comparison put every change inside the panel (x ≥ 931), except 2
  anti-aliasing pixels on a table progress bar; the changes are the new Pace
  section and the sections below it moving down. Reviewed by eye: Budget
  summary (light) and transfer funds (dark; 800.00 carried in − 755.00
  assigned = 45.00 start, all spent on day 1, 43.55 over even pace, correct),
  keyboard shortcuts (midnight). 21 snapshots regenerated with
  `--update-snapshots=changed`, scoped to those five tests. Verification
  without updating, on budget, command-bar, help-menu and accounts: 24/24.
  **Known limits:** template sentences appear only with the automations UI
  flag on, like the automation button's tooltip (checked by hand on the dev
  server: "Budget 50.00 every 1 months" under the sentence).
- ELEC-01: **done September 29, 2026**, merged into `redesign/main` with
  owner approval (`0a8582cea`, branch `redesign/elec-01`). Desktop isolation review written into
  [stage-0.md](stage-0.md#desktop-isolation-review-elec-01) first, then the
  smoke test in [verification.md](verification.md#elec-01-september-29-2026).
  **Findings:** a development build launched the upstream way keeps its
  budgets in `data/` but writes Chromium's storage (localStorage, IndexedDB,
  caches) into the installed app's `~/Library/Application Support/Actual`,
  because an unpackaged build is named after `productName` and
  `ACTUAL_DATA_DIR` does not move Chromium's folder. `--user-data-dir` does;
  `HOME` does not. Packaged builds overwrite both directory variables and
  share the installed app's bundle ID, so they stay unsafe to launch until a
  separately scoped source change. **Scope added (not in the card):**
  `scripts/redesign-electron.mjs`, a launcher that applies the isolation,
  refuses overlapping paths, binds the renderer to loopback and checks the
  installed app's folders for changes on exit, so the procedure is enforced
  rather than only written down. No application or `desktop-electron` file
  changed. **Checks:** typecheck pass; lint pass (after replacing the
  launcher's `require('electron')` with the package's own `path.txt`
  lookup). No UNIT or E2E: no application code changed. Three manual desktop
  runs plus two Playwright Electron runs, all isolated: `lsof`, the
  launcher's change check (3/3 clean) and `find -newer` (0 files) show
  nothing touched in the installed app's folders. **Smoke test:** first
  paint, Assigned edit and restore, month switch, Reports, Schedules,
  register, native menus, zoom in/out/reset, smallest window (mobile layout,
  no minimum size, as upstream), accounts pane and details panel state across
  two restarts, window position. Dragging works from the native title bar
  only; the in-page drag region is upstream's and has no effect in a framed
  window. **Defect found:** the title bar wraps at 1000px with the accounts
  pane expanded (Help and the privacy/server controls cut off at the top);
  opened as TOPBAR-FIX. **Environment note:** the Electron rebuild of
  `better-sqlite3` was reverted from a backup and loads under Node again.
  **Not checked:** themes and privacy mode in the desktop shell, the packaged
  `app://` bundle.
- TOPBAR-FIX: **done September 29, 2026**, merged into `redesign/main` with
  owner approval (`107560a51`, branch `redesign/topbar-fix`). Results in
  [verification.md](verification.md#topbar-fix-september-29-2026).
  **Cause:** the title bar's right-hand group wrapped, and nothing responded
  to the width the expanded pane takes; ELEC-01's run also had the
  development theme switcher. **Change:** the title bar is a size container;
  the group never wraps; below an 800px title bar the tabs and gaps tighten
  and Help shows its icon only (accessible name kept); the budget name and
  uncategorized count ellipsize last. **Scope added (not in the card):**
  `C/HelpMenu.tsx` (the Help label needed its own element to hide) and
  `C/sidebar/BudgetName.tsx` (the switcher shrinks). No handler or route
  changed. **Checks:** typecheck and lint pass; web unit tests 1052 passed,
  1 skipped; E2E budget, accounts, help-menu, nav-02 26/26 (dev server);
  12 width × pane cases in the browser and 8 in the isolated desktop build
  all fit; light, dark and midnight screenshots at 1000, 1100 and 1440.
  **Environment note:** `better-sqlite3` was rebuilt for Electron for the
  desktop check and restored from a backup; it loads under Node again.
  **Not checked:** Linux VRT, a `build:browser` preview, custom theme,
  server-online/offline labels, long translations. **Owner decision:** the
  icon-only Help at narrow widths is a new "Shown" row (design-decisions §2,
  §11 item 6).
- APP-01: **in review September 29, 2026** on branch
  `redesign/app-01-account-header`; not merged. Screenshots in
  [verification/app-01](verification/app-01/). **Owner decisions before
  starting:** design-decisions §11 item 5 (the hero) confirmed as drawn;
  Cleared/Uncleared keep today's toggle; the bank-sync error moves from the
  title bar into the hero. **Change:** new `C/accounts/AccountHero.tsx`
  (hero card and compact band); `C/accounts/Header.tsx` builds the hero
  (eyebrow On/Off budget, 28px name, Bank Sync and Reconcile as Control
  buttons, reconciliation status chip, chart card) and moves Reconcile out
  of the toolbar, whose buttons become Control buttons with Add New as
  primary; `C/accounts/Balance.tsx` splits the balance into `BalanceAmount`
  (hero amount, same `account-balance` button and toggle) and `BalanceChips`
  (neutral pills, same labels); `C/accounts/Reconcile.tsx` turns the
  reconciling message into the hero's band (Difference pill, same sentence
  and buttons; its line break is hidden, so the translation key is
  unchanged); `C/accounts/AccountSyncCheck.tsx` is restyled as a negative
  pill; `C/Titlebar.tsx` no longer renders it. **Scope added (approved):**
  `C/Titlebar.tsx`. **Test change:** `C/accounts/Reconcile.test.tsx` now
  expects the difference twice (pill and sentence) and the "Difference"
  label. **Deviations from the drawing:** the compact band also applies
  under 900px tall (a 1280×720 window lost two register rows with the full
  hero, failing `transactions.test.ts` "by payee"); the chart stays visible
  when compact. No handler, binding, pref or route changed; one new string,
  "Difference". **Checks:** typecheck and lint pass; accounts unit tests
  12/12 and the full web suite 1052 passed, 1 skipped; E2E accounts, transactions, bank-sync, budget, nav-02, help-menu,
  detail-03 44/44 (dev server on port 3029); Impeccable detector: no
  findings; light, dark and midnight at 1440×900 and 1000×700 for a single
  account, extra balances, reconciling, balance chart and All accounts.
  **Follow-up checks (same day):** _Custom theme_ (QA-00 method: every
  v26.9.0 role, 226, hue-rotated 150°, no redesign roles, installed as
  `installedCustomLightTheme` with base light or dark): the hero, chart card
  and toolbar with extra balances, a selection, the chart and reconciling
  on, at 1440×900 and 1000×700 — every text, background and border colour
  equals a theme role (0 misses in 4 runs). _Keyboard:_ every header control
  is reachable by Tab; Enter toggles the balance chips, opens Reconcile with
  its input focused (Escape returns focus to Reconcile), starts and exits
  reconciling and opens the account menu. **Fixed:** the notes and rename
  buttons took focus while invisible (upstream shows them on hover only);
  they now also show on focus. _Privacy:_ the balance, chips, Difference pill
  and chart value are masked. **Fixed:** the reconciliation sentence
  (upstream never masked it) is now masked too; its translation key is
  unchanged. _Bank-sync error:_ with the demo account marked failed in the
  page's query cache only (no saved data changed), the hero shows the
  negative chip, the title bar shows none, and Enter opens the existing
  popover with Unlink and Reauthorize (light 1440, dark 1000). _Built
  preview:_ a `vite build --mode=browser` into a scratch folder, served on
  port 3030: E2E for the same seven files 44/44; WIDE 58 passed, 1 failed,
  15 skipped, the recorded baseline (the known Reports case, APP-03).
  Typecheck, lint and accounts unit tests pass after the fixes.
  **Not checked:** Linux VRT (the accounts and transactions screenshot tests
  will differ); the wide hero in the desktop build (the window could not be
  resized from the background; the same layout passes in the browser).
  _Desktop build (same day):_ through `scripts/redesign-electron.mjs` with
  the sandboxed demo, window 1000×732: the compact hero renders; the balance
  toggles the extra chips; Reconcile opens its popover, and entering 100.00
  shows the band with the Difference pill, sentence and both buttons and
  the selection border; Exit reconciliation turns the chip positive
  (screenshots `desktop-compact-1000.jpg`, `desktop-reconciling-1000.jpg`).
  The launcher reported no change in the real Actual folders.
  `better-sqlite3` was rebuilt for Electron and restored from a backup
  afterwards; it loads under Node again.
  _Linux VRT (September 30, 2026):_ 69 snapshots regenerated in the
  accounts, rules, schedules and transactions tests, each showing the hero;
  TOPBAR-FIX changed none (verification.md).
- APP-02: **done September 30, 2026**, merged into `redesign/main` with
  owner approval (`f8fcc70d8`, branch `redesign/app-02-register`). Screenshots in
  [verification/app-02](verification/app-02/). **Owner decisions before
  starting:** design-decisions §11 item 5 (the register) confirmed as drawn;
  hairline dividers instead of stripes; the payee initial takes the row's
  category accent; square-ish tags in the register only. **Change:**
  `C/transactions/TransactionsTable.tsx` takes an opt-in `isRegister` (and
  `isReconciling`) prop, shared with its rows through a context in the new
  `C/transactions/registerAppearance.ts`; with it the table sits in one card,
  rows, header and new-transaction rows are 36px through the shared table's
  `rowHeight` prop (`ROW_HEIGHT` unchanged), headers are Eyebrow text, rows
  have hairline dividers, selected rows the Selection Tint and 3px bar, the
  row being edited the tint, the cleared icons are 15px with a muted lock,
  schedule status pills are upright, and the cleared header turns purple
  while reconciling. New `C/transactions/CategoryAccentDot.tsx` and
  `C/transactions/PayeeInitialTile.tsx` (the letter is drawn with CSS so the
  payee cell's text is unchanged). `useTagCSS` gains a `square` option,
  passed through `NotesTagFormatter` and `DesktopTaggedNotes`.
  `C/transactions/TransactionList.tsx` passes the props through and
  `C/accounts/Account.tsx` sets them; the Calendar report keeps upstream's
  look (APP-03). **Scope added (not in the card):** `hooks/useTagCSS.ts`,
  `notes/NotesTagFormatter.tsx`, `notes/DesktopTaggedNotes.tsx`,
  `C/accounts/Account.tsx`. No handler, binding, pref, route or string
  changed. **Checks:** typecheck and lint pass; web unit tests 1052 passed,
  1 skipped (transactions and notes 75 passed, 1 skipped); E2E on a dev
  server (port 3031) accounts, transactions, bank-sync, budget, nav-02,
  help-menu, detail-03: first run 41 passed, 3 failed (the payee initial's
  letter was in the payee cell's text; fixed by drawing it with CSS); rerun
  of accounts and transactions 22 passed, 1 failed: `transactions.test.ts`
  "by payee" asserts 19 rendered rows after a filter and 36px rows render 18
  at 1280×720 (13 visible plus 5 overscan). Impeccable detector: two
  advisory radius findings, both in the untouched upstream Imported Payee
  tooltip. Light 1000×700 (selected and editing, adding), dark 1000×700
  reconciling, midnight 1440×900. **Observed once, not reproduced:** after a
  theme switch, reconcile exit and a 1000→1440 resize in quick succession,
  the header kept a stale 440px scrollbar padding (the shared table
  re-measures 200ms after a render); repeated resizes on this branch and on
  the September 29 `redesign/main` build stayed aligned. **Not checked:**
  custom theme, keyboard-only pass, privacy mode, split transactions by
  eye (unit and E2E cover splits), built preview, WIDE, Linux VRT, desktop
  build.
  **E2E fix (owner's choice, same day):** "by payee" now checks every
  rendered row after the "does not contain" filter (at least 15) instead of
  a fixed 19; `e2e/transactions.test.ts` is an upstream file, so expect a
  possible conflict at SYNC-01. Accounts and transactions E2E 23/23.
  **Follow-up checks (same day):** _Custom theme_ (QA-00 method and themes:
  every v26.9.0 role hue-rotated 150°, no redesign roles, installed as
  `installedCustomLightTheme`, bases dark and light), register with a split
  transaction, a selected row and a cell being edited, at 1440×900 and
  1000×700: every colour in the card is a theme role except the tag
  backgrounds (the tags' own user colours, kept by design); muted header
  text, the selection tint and the accents come from the fallback layer or
  base (design-decisions §8); no console errors. _Keyboard:_ the same
  scripted sequence (click a date, Tab ×4, Shift+Tab, Enter, Shift+Enter,
  Escape, split toggle, Tab to the cleared cell) gives a focus path
  identical to the September 29 `redesign/main` build; every step shows
  the purple edit border and the row tint. _Privacy:_ every payment and
  deposit cell is masked on the branch build, split children included.
  _Splits by eye:_ the parent is italic with the split icon and a neutral
  payee initial; children are plain with accent dots; the date and account
  placeholders are transparent. _Built preview_ (`vite build --mode=browser`
  into a scratch folder, port 3032): E2E for the seven files 44/44; WIDE
  58 passed, 1 failed, 15 did not run, the recorded baseline (the known
  Reports case, APP-03). _Desktop build:_ prepared and launched through
  `scripts/redesign-electron.mjs` ("Isolation check: nothing changed"), but
  the owner declined screen control, so the register was not exercised in
  the desktop window. `better-sqlite3` was rebuilt for Electron and
  restored from a backup; it loads under Node again. _Linux VRT (September 30, 2026):_ 66 snapshots regenerated in the
  accounts, rules, schedules and transactions tests, each showing the
  restyled register; nothing else changed (verification.md).
  _Desktop window (September 30, 2026, on Windows):_ the isolated
  development build, driven through Playwright over CDP, sandboxed demo:
  the register renders as in the browser at 1000×700 and 1440×900 (36px
  rows, selection bar and tint, edit tint, adding row, splits, schedule
  pills, a tag filter); the keyboard path matches the browser; reconciling
  accents the cleared header in dark; privacy masks every amount; midnight
  at 1440. No console error from the register. Nothing written outside
  `data/redesign-electron/` (verification.md). Screenshots `desktop-*.jpg`.
  Every APP-02 check is now done.
- APP-03a: **done September 30, 2026**, merged into `redesign/main` with
  owner approval (`d63b275d0`, branch `redesign/app-03-reports`). Screenshots in
  [verification/app-03a](verification/app-03a/). **Owner decisions before
  starting:** the Reports drawing (prototype shots `51`–`58`) approved as
  drawn, split into APP-03a/b/c, hairline cards with no shadow, chart
  colours unchanged, summary amounts at Display size, edit mode keeps
  colours, change amounts as pills (design-decisions §10a). **Change:**
  `ReportCard.tsx` is a hairline Surface card without elevation (hover and
  keyboard focus turn the border Page Text Faint; the focus ring on the
  card's button); edit mode drops the greyscale for a dashed border, an
  always-visible ⋯ Control button and header room reserved for it;
  `ReportCardName.tsx` titles are 13.5px/600 on one line; `DateRange.tsx`
  gains an `isWidget` subline (12px Secondary); new `ChangePill.tsx` shows
  change amounts as small status pills with the sign kept (Net Worth, Cash
  Flow and the spending cards; an increase in spending is negative, as its
  colour was); `SummaryNumber.tsx` gains `maxFontSize`, used only by
  `SummaryCard.tsx` (28px, bottom-left; the saved font size and the Summary
  report page are unchanged); headline values in five cards share
  `WIDGET_VALUE_STYLE` (`constants.ts`); card headers are 16px 20px in every
  widget; `DashboardHeader.tsx` is a "Reports" line over the name at
  Display size; `Overview.tsx` makes the selector, Edit dashboard and ⋯
  Control buttons, drops the divider, puts Edit dashboard before Add new
  widget, and sets a 14px grid gap; `DashboardSelector.tsx` is a Control
  button. No handler, query, saved layout, pref, route or string changed.
  **E2E fix (in scope):** `e2e/reports.test.ts` "loads net worth and cash
  flow reports" now scrolls every widget into view and expects all 11
  default widgets, so it passes at any window size; "right clicking a
  report card" anchors its name (`/^Net Worth/`), because at 1440 wide
  "Recent Net Worth Change" matched too (one of the 15 cases that never ran
  at 1440 in the baseline). **Deviations from the drawing:** the ⋯ menu
  stays edit-mode only (as upstream); the selector shows the name without
  "Dashboard:"; no title grip; Finish editing stays a Control button.
  **Checks:** typecheck passes; `oxlint --type-aware` reports two errors,
  both in `budget/{envelope,tracking}/*BudgetComponents.tsx` (untouched,
  same on `redesign/main`); the format check passes for every changed file
  (the repo-wide check lists 472 files with CRLF line endings in this
  Windows checkout, unrelated); web unit tests 1052 passed, 1 skipped
  (reports 271/271). E2E against the dev server (port 3001) with the
  installed Edge (Playwright's Chromium is not installed here), at
  1000×700 and 1440×900: reports 34/34 with **zero skipped** (the recorded
  baseline was 58 passed, 1 failed, 15 skipped across WIDE); budget and
  accounts 40/40, so WIDE is 74/74. Screenshots: dark 1440, light 1440,
  midnight 1000, light 1000 editing, keyboard focus, privacy. Keyboard: Tab
  reaches the header controls then each widget with a visible 2px ring;
  Enter opens the report. Privacy: every widget amount and pill is masked.
  Console: one warning, a button inside a button in the Transaction
  Calendar widget (its day buttons inside the card's button; the same
  structure on `redesign/main`). **Follow-up checks (same day):** custom
  theme 0 misses in 4 runs; reduced motion 0 transitions with `reduce`
  after gating the summary amount's font-size transition
  (`SummaryNumber.tsx`); built preview 74/74; Linux VRT 12 snapshots
  regenerated (reports and command bar), rerun 19/19; Impeccable detector
  two advisories on untouched calendar lines; desktop build checked, with
  "Isolation check: nothing changed" (verification.md). Every APP-03a
  check is now done.
- LINT budget-import: **done September 30, 2026.** `EnvelopeBudgetComponents.tsx` and `TrackingBudgetComponents.tsx` now import the month prop types from `#components/budget` instead of `'..'`, clearing the two `absolute-parent-import` oxlint errors; typecheck, oxlint 0 errors, budget tests 86/86.
