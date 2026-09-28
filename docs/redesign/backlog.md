# Redesign implementation backlog

Prepared September 27, 2026. This supplies the task scopes and verification
missing from plan §14 and resolves the earlier note that this file did not exist.
It does not replace the design specification or authorize a new design direction.

## Current handoff and ownership

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
- UI-01: in review on branch `redesign/ui-01-theme-roles` (status recorded
  there).
- UI-03: **in review September 27, 2026**, branch
  `redesign/ui-03-presentation-helpers`, based on `redesign/main` (it does not
  depend on UI-01). New files only:
  `C/budget/categoryPresentation.ts` and `C/budget/categoryPresentation.test.ts`
  — accent index (§7.3), progress bar (§7.1), pace chart data and summary
  (§7.2, the "Shown" default in §11 item 2, with the owner's past-month summary change) and summary stacked bar (§7.4).
  Helpers take amounts and transactions the app already provides and return
  numbers and summary kinds; wording, formatting and theme roles are left to
  the components that use them. Nothing calls them yet. Checks: typecheck
  pass; lint pass; UNIT `src/components/budget/categoryPresentation.test.ts`
  28/28.
- All other application implementation below is pending. This document does not
  claim Claude's prototype is production-ready.

## Rules for every task

Read root AGENTS.md, the handbook, Stage 0 protected paths, and plan §15.
Use a small task branch; coordinate file ownership before editing. Never stage
another agent's files. Each task needs its own changed-file list and check results.

Paths below are relative to the repository root. `C/` abbreviates
`packages/desktop-client/src/components/`; `L/` abbreviates
`packages/component-library/src/`. Directory scopes are ceilings, not instructions
to rewrite the directory. Before a task starts, enumerate the exact existing files
and proposed new files in its brief. New components/tests stay beside the related
code. If the current code no longer matches the map, refresh the brief first.

Backend, financial calculations, data schemas, sync, authentication, bank
connections, custom-theme parsing, and persisted preference schemas stay protected.
Reuse current handlers, queries, formatting and privacy behavior. UI filenames can
contain protected logic too. Do not change shared table row-height constants as a
side effect of budget density. No production budgets in testing.

Every task's completion report includes commands actually run, pass/fail/skip
counts, fixture, screenshots when relevant, and remaining gaps. Never mark a task
done just because code exists or a screenshot looks right. A mismatch requiring
protected changes is a blocker to report, not permission to expand scope.

## Verification recipes

Run all commands from the repository root. These are future task requirements,
not claims that they ran during this documentation correction.

**CHECK** — required before an implementation commit (typecheck also required for
this documentation commit by AGENTS.md):

```sh
node .yarn/releases/yarn-4.17.1.cjs typecheck
node .yarn/releases/yarn-4.17.1.cjs lint
```

**UNIT** — frontend behavior/unit tests; for a small change pass the exact changed
or affected test path after `test`, and record that path in the task brief:

```sh
node .yarn/releases/yarn-4.17.1.cjs workspace @actual-app/web run test
```

For component-library changes use:

```sh
node .yarn/releases/yarn-4.17.1.cjs workspace @actual-app/components run test
```

**E2E(file)** — build once after the task's source changes, start the isolated
preview in another terminal, then substitute the specified filename for FILE:

```sh
node .yarn/releases/yarn-4.17.1.cjs build:browser
node scripts/redesign.mjs preview
E2E_START_URL=http://127.0.0.1:3018 node .yarn/releases/yarn-4.17.1.cjs workspace @actual-app/web exec playwright test '(^|/)FILE\.test\.ts$' --workers=1 --reporter=line
```

Example FILE values: `budget`, `accounts`, `transactions`, `reports`, `settings`,
`schedules`, `payees`, `rules`, `help-menu`. Run each required file, or combine
names into an anchored alternation. This excludes mobile files unintentionally
matched by a loose filename. These tests use disposable fixtures; manual testing
uses Try the demo. Do not connect the live server.

**WIDE** — baseline suites at both recorded viewport sizes, with preview running:

```sh
E2E_START_URL=http://127.0.0.1:3018 node .yarn/releases/yarn-4.17.1.cjs workspace @actual-app/web exec playwright test --config=../../scripts/redesign-baseline.config.ts --workers=1 --reporter=line
```

Known Reports failure/skips must be reported separately until APP-03 resolves
coverage. Screenshot comparison/capture follows the handbook's `VRT=true` recipe;
never refresh reference images just to make a failure disappear.

**VISUAL** — inspect light/dark/midnight and a custom theme at 1000×700 and
1440×900; test narrow fallback, keyboard-only access, focus visibility, long labels,
privacy mode and reduced motion where relevant. Record screenshots and actual
observations. Static prototypes use their README launch instructions; they do not
satisfy application behavior tests.

## Task cards

Each row supplies the task-specific scope, acceptance criteria, and checks.
Dependencies match plan §14. CHECK applies to application tasks in addition to the
checks named below. Existing application files are presentation-only scope.

| ID / dependency               | Allowed scope                                                                                                                                         | Done when / verification                                                                                                                                                                                                                                                                                                         |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| DISC-01 / none                | `docs/redesign/stage-0.md`, handbook; existing `scripts/redesign.mjs`                                                                                 | Version, remotes, isolation and runnable setup recorded. Delivered; verify setup instructions when environment changes.                                                                                                                                                                                                          |
| DISC-02 / DISC-01             | Stage 0, `behavior-inventory.md`, `baseline/`, this backlog; `scripts/redesign-baseline.config.ts`                                                    | Code map, protected areas and accurate baseline counts recorded. Delivered with explicit Reports coverage gap; WIDE records skips separately.                                                                                                                                                                                    |
| DESIGN-01 / DISC-02           | `docs/redesign/prototype/`, `accounts-review/`, design records                                                                                        | Claude-owned. Existing prototype demonstrates navigation/account access at both widths. Preserve latest owner choices; VISUAL and destination inventory review. No production code.                                                                                                                                              |
| DESIGN-02 / DESIGN-01         | Same prototype and design records, coordinated with Claude                                                                                            | Demonstrate zero/overspent/carryover, long labels, panel open/closed, narrow fallback and multi-month; resolve density/reconciliation questions. VISUAL, owner walkthrough. No app code.                                                                                                                                         |
| DESIGN-03 / DESIGN-02         | New `docs/redesign/design-decisions.md`; plan and backlog status                                                                                      | Record approved density, layouts, wording, theme fallback, presentation formulas and remaining exclusions with owner review evidence. Do not reopen settled choices. All implementation briefs reference this record.                                                                                                            |
| UI-01 / DESIGN-03             | `L/themes/{light,dark,midnight}.css`, `L/theme.ts`; related theme tests                                                                               | New roles and values per design-decisions §8, with derived fallbacks; custom themes load; existing roles retain meaning. UNIT for affected themes, E2E(settings), VISUAL. Theme parser stays untouched.                                                                                                                          |
| UI-02 / UI-01                 | `L/Button.tsx`, `L/styles.ts`; new card/pill/tile/progress presentation components and adjacent tests                                                 | Reusable controls expose hover/focus/disabled/selected states, tabular amounts and accessible names. Component UNIT, VISUAL including keyboard and reduced motion. Limit global impact and check existing screens.                                                                                                               |
| UI-03 / DESIGN-03             | New presentation helper and adjacent test files under `C/budget/`                                                                                     | Stable accent from ID and progress/pace calculations exactly as design-decisions §7 cover zero, refunds, negative, carryover, overspending and empty months. UNIT with exact new test paths. Helpers never affect saved amounts or financial totals.                                                                             |
| NAV-01 / UI-02                | `C/FinancesApp.tsx`, `C/sidebar/{Sidebar,PrimaryButtons,Item}.tsx`; new navigation presentation components                                            | Every existing primary/secondary route remains reachable, active state and browser history work, compact navigation works. E2E(help-menu, accounts, settings), VISUAL keyboard/route matrix.                                                                                                                                     |
| NAV-02 / NAV-01               | `C/sidebar/{Accounts,Account,BudgetName}.tsx`; navigation components from NAV-01                                                                      | Collapsible accounts pane with device-local open state (design-decisions §2); account list, closed/add accounts, budget switching, privacy and connection status retained. Account access never filters envelope totals. E2E(accounts, settings), VISUAL and inventory check.                                                    |
| BUD-01 / NAV-02               | `C/budget/{BudgetPageHeader,MonthPicker}.tsx`, `C/budget/envelope/budgetsummary/` presentation                                                        | Same focused-month values and full breakdown, current To Budget menu and month navigation preserved. E2E(budget), WIDE, VISUAL; compare fictional fixture totals before/after.                                                                                                                                                   |
| TERM-01 / BUD-01              | Envelope budget presentation/menu strings; matching `C/mobile/budget/` strings; generated locale output                                               | Wording table in design-decisions §9 applied without identifier/field renames; tracking/account balance labels unchanged. Run `node .yarn/releases/yarn-4.17.1.cjs generate:i18n`, E2E(budget), manually inspect mobile envelope and tracking views. Enumerate locale files before staging.                                      |
| BUD-02 / TERM-01, UI-03       | `C/budget/{BudgetTable,BudgetCategories,ExpenseCategory,ExpenseGroup}.tsx`, `C/budget/envelope/EnvelopeBudgetComponents.tsx`; presentation components | Approved single table density, tiles, pills and progress retain inline edit, collapse, drag, notes and status meanings. E2E(budget), WIDE, VISUAL; keyboard edit and large category list check.                                                                                                                                  |
| BUD-03 / BUD-02               | `C/budget/{DynamicBudgetTable,BudgetTable,ExpenseCategory,ExpenseGroup}.tsx`; envelope menu presentation                                              | Long labels fit at 44px rows (design-decisions §4); one month only: months-shown control hidden in `C/Titlebar.tsx` and `C/budget/index.tsx` passes one month, `maxMonths` pref untouched (§6); all inventory actions remain available. E2E(budget), WIDE, VISUAL at both widths; handler/binding diff review.                   |
| DETAIL-01 / BUD-03            | New panel components under `C/budget/`; `C/budget/{DynamicBudgetTable,ExpenseCategory}.tsx` integration                                               | Budget-only default-open panel; device-local open state; dedicated opener preserves edit/right-click actions; close restores focus and scroll; narrow overlay works (design-decisions §5). UNIT for lifecycle/storage, E2E(budget), VISUAL. No synced preference changes.                                                        |
| DETAIL-02 / DETAIL-01         | New panel components/tests; existing category/month query interfaces read-only                                                                        | Correct selected category/month values, notes and transaction list including splits/refunds; loading/error/empty and rapid switching never show stale details. UNIT, E2E(budget), manual fixture comparison. Reuse current query semantics; do not edit query engine.                                                            |
| DETAIL-04 / DETAIL-02, UI-03  | Panel chart presentation and helper tests                                                                                                             | Pace chart matches hand-calculated fictional data; past/future/current month rules per design-decisions §7.2, privacy and reduced motion work. UNIT, E2E(budget), VISUAL with textual equivalent; no financial calculation changes.                                                                                              |
| DETAIL-03 / DETAIL-02         | Panel actions; `C/NotesButton.tsx`, `C/modals/NotesModal.tsx` only if presentation integration requires it                                            | Links open existing transaction view and notes use existing save/cancel handlers. E2E(budget, transactions), UNIT for new interaction, privacy and keyboard checks.                                                                                                                                                              |
| APP-01 / BUD-03               | `C/accounts/` header/control presentation, exact files named in brief                                                                                 | Account review design applied; search/filter/account actions and reconciliation access remain intact; no budget details panel. E2E(accounts, transactions), VISUAL.                                                                                                                                                              |
| APP-02 / APP-01               | `C/transactions/` table/editor presentation, exact files named in brief                                                                               | Editing, split transactions, selection, scrolling, cleared/reconciled states and shortcuts preserved. E2E(transactions, accounts), affected UNIT, VISUAL on large fixture; no shared row-height changes without separate scoped review.                                                                                          |
| APP-03 / UI-02, NAV-02        | `C/reports/` presentation; `e2e/reports.test.ts` under `packages/desktop-client/`                                                                     | Filters, saved layouts and charts unchanged. Resolve viewport expectation without hiding real widgets; run all Reports cases at both widths with zero unexplained skips. E2E(reports), WIDE, VISUAL; preserve old baseline record and add new results.                                                                           |
| APP-04 / UI-02, NAV-02        | `C/schedules/{index,SchedulesTable,ScheduleEditForm}.tsx` presentation                                                                                | Schedule creation/edit/skip/post behavior unchanged. E2E(schedules), VISUAL; current handlers only.                                                                                                                                                                                                                              |
| APP-05 / UI-02, NAV-02        | `C/payees/`, `C/rules/`, `C/tags/`, `C/settings/` presentation                                                                                        | Split into APP-05a payees, b rules, c tags, d settings; one exact file allowlist per change. E2E(payees), E2E(rules), tags UNIT, E2E(settings) respectively plus VISUAL. Do not alter rules evaluation, theme parsing or settings persistence.                                                                                   |
| APP-06 / APP-01–05, DETAIL-03 | Named remaining presentation files from inventory, one surface per brief                                                                              | Dialog/menu/loading/error/empty-state gaps closed; no blanket directory restyle. Affected E2E file and UNIT, VISUAL with focus return/Escape checks. List each covered surface.                                                                                                                                                  |
| QA-01 / all implementation    | New `docs/redesign/verification.md`; targeted UI regressions/tests only                                                                               | Full matrix covers screens, themes/custom theme, sizes, keyboard, privacy, tracking budgets and performance versus baseline. CHECK, root `node .yarn/releases/yarn-4.17.1.cjs test`, WIDE, desktop E2E files above; record native/mobile checks separately. Protected diff reviewed. Unresolved behavior failures block release. |
| RELEASE-01 / QA-01            | New `docs/redesign/release.md`; existing build commands, no app replacement                                                                           | Record build revision, walkthrough, installation and rollback instructions. Run `node .yarn/releases/yarn-4.17.1.cjs build:browser`; native distribution requires separately scoped packaging review. Owner validates disposable copy before any installed-app replacement. No automatic production data migration.              |

For future tasks, resolve every abbreviation into real paths and every recipe into
exact commands in the copied plan §15 brief. New test files may accompany the
allowed UI files; updating tests must preserve behavior coverage rather than
weaken assertions. A card that still needs a design decision or an unknown API is
not ready for implementation.
