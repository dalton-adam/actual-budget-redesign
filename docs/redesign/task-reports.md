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
