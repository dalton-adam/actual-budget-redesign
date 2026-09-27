# Stage 0 — verified architecture and development setup

## Source identity

- Installed desktop app metadata: Actual 26.9.0, bundle ID `com.actualbudget.actual`.
- Source release: `v26.9.0`, commit `59fe126f637d858c061e1eeedbef5436c8f2225a`.
- Official repository: https://github.com/actualbudget/actual (MIT).
- Personal public fork: https://github.com/dalton-adam/actual-budget-redesign.
- Integration branch: `redesign/main`. The fork's original `master` is retained.
- This is a version match, not a binary-reproducibility or code-signing audit of the installed app.
- Exact check outcomes and known limitations are in [the verification record](baseline/README.md).

## Isolation

The React interface lives in `packages/desktop-client` and is shared by browser and Electron builds. Stage 0 uses browser mode only.

Browser storage is SQLite backed by origin-scoped IndexedDB, implemented in `packages/loot-core/src/platform/server/fs/index.ts` and `packages/loot-core/src/platform/server/indexeddb/index.ts`. Loopback ports 3017 and 3018 are separate origins. The browser instance does not open the installed Electron application's filesystem budget.

No sync server is started or connected. No bank credentials or real budget exports are used. The launcher binds only to 127.0.0.1. Existing shared-memory COOP/COEP headers remain active.

Electron's `index.ts` has separate development and packaged-data handling. Its `watch` script specifies ACTUAL_DOCUMENT_DIR and ACTUAL_DATA_DIR, but packaged builds override these defaults. **Do not assume environment variables alone make a packaged app safe.** Native development and final app packaging need their own isolation review before launch.

## Code map

All paths below are relative to the repository root and were inspected at the pinned release.

| Responsibility                       | Files                                                                                                                                                                                          | Constraints                                                                                         |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Application providers/theme mounting | `packages/desktop-client/src/components/App.tsx`                                                                                                                                               | Keep providers, initialization and storage wiring intact                                            |
| Main frame and routing               | `packages/desktop-client/src/components/FinancesApp.tsx`                                                                                                                                       | Preserve routes, protected routes, narrow layouts and desktop titlebar drag regions                 |
| Navigation                           | `packages/desktop-client/src/components/sidebar/Sidebar.tsx`, `PrimaryButtons.tsx`, `Item.tsx`, `SidebarProvider.tsx`, `index.tsx`                                                             | Sidebar resize/pin/floating behavior exists; top navigation must preserve access                    |
| Accounts/budget switcher             | `packages/desktop-client/src/components/sidebar/Accounts.tsx`, `Account.tsx`, `BudgetName.tsx`                                                                                                 | Existing account actions and context menus must be reused                                           |
| Budget orchestration                 | `packages/desktop-client/src/components/budget/index.tsx`                                                                                                                                      | Contains mutations, prewarming and activity navigation; read first, do not rewrite for appearance   |
| Month width/layout                   | `packages/desktop-client/src/components/budget/DynamicBudgetTable.tsx`, `BudgetPageHeader.tsx`, `BudgetMonthCountContext.tsx`, `MonthsContext.tsx`                                             | Width controls how many months appear; a side panel can reduce that number                          |
| Budget table and rows                | `packages/desktop-client/src/components/budget/BudgetTable.tsx`, `BudgetCategories.tsx`, `ExpenseCategory.tsx`, `ExpenseGroup.tsx`, `SidebarCategory.tsx`, `SidebarGroup.tsx`                  | Preserve keyboard editing, drag/drop, collapse and scroll position                                  |
| Envelope amounts                     | `packages/desktop-client/src/components/budget/envelope/EnvelopeBudgetComponents.tsx`, `EnvelopeBudgetContext.tsx`                                                                             | Existing spreadsheet bindings and action handlers are authoritative                                 |
| Summary                              | `packages/desktop-client/src/components/budget/envelope/budgetsummary/BudgetSummary.tsx`, `TotalsList.tsx`, `ToBudget.tsx`, `ToBudgetAmount.tsx`                                               | Keep Available funds, previous overspending, Budgeted and For next month                            |
| Shared controls                      | `packages/component-library/src/Button.tsx`, `styles.ts`, `theme.ts`                                                                                                                           | Changes can affect all screens; use scoped variants first                                           |
| Themes                               | `packages/component-library/src/themes/{light,dark,midnight,palette}.css`; `packages/desktop-client/src/style/theme.tsx`, `customThemes.ts`                                                    | Keep CSS-variable contract and custom-style ordering                                                |
| Register                             | `packages/desktop-client/src/components/accounts/Account.tsx`; `packages/desktop-client/src/components/transactions/TransactionsTable.tsx`; `packages/desktop-client/src/components/table.tsx` | Shared table uses measured rows/virtualization                                                      |
| Reports                              | `packages/desktop-client/src/components/reports/ReportsDashboardRouter.tsx`, `ReportRouter.tsx`, `ReportCard.tsx`, `ReportTopbar.tsx`                                                          | Leave report selectors/calculations intact                                                          |
| Schedules                            | `packages/desktop-client/src/components/schedules/index.tsx`, `SchedulesTable.tsx`, `ScheduleEditForm.tsx`                                                                                     | Reuse existing recurrence and save behavior                                                         |
| Notes                                | `packages/desktop-client/src/hooks/useNotes.ts`, `components/NotesButton.tsx`, `components/modals/NotesModal.tsx`                                                                              | Read existing note query; use existing notes-save path for later editing                            |
| Detail-query reference               | `packages/desktop-client/src/components/mobile/budget/CategoryTransactions.tsx`                                                                                                                | Existing category/month filtering and inline splits; mobile markup itself is not the desktop design |
| Privacy/formatting                   | `packages/desktop-client/src/hooks/usePrivacyMode.ts`, `useFormat.ts`; `components/PrivacyFilter.tsx`, `FinancialText.tsx`                                                                     | New amounts must preserve privacy and locale/number formatting                                      |
| Test infrastructure                  | `packages/desktop-client/playwright.config.ts`, `e2e/fixtures.ts`, `e2e/page-models/configuration-page.ts`                                                                                     | Synthetic demo contexts; VRT screenshots are disabled unless VRT=true                               |

## Theme contract

Use imports from `@actual-app/components/theme`. Verified roles include `pageBackground`, `pageText`, `cardBackground`, `cardBorder`, `tableBackground`, `tableBorder`, `tableText`, `tableHeaderBackground`, `tableRowBackgroundHover`, `tableRowBackgroundHighlight`, `sidebarBackground`, `sidebarItemTextSelected`, `buttonPrimaryBackground`, `numberPositive`, `numberNegative`, and `numberNeutral`.

Budget-specific roles such as `budgetCurrentMonth`, `budgetOtherMonth`, `budgetHeaderCurrentMonth` and `budgetHeaderOtherMonth` distinguish current and adjacent months. Keep that meaning.

ThemeStyle injects base variables; CustomThemeStyle injects validated custom CSS and overrides afterward. Built-in modes include light, dark, midnight and system-auto. Existing custom-theme migration/validation code is not redesign scope.

Custom themes may contain more than palette values. Preserve the supported CSS contract, avoid unnecessary selector churn, and document any incompatibility rather than promising every arbitrary custom rule will survive structural changes.

## Interaction constraints discovered in source

1. DynamicBudgetTable computes 1–6 possible months from available width and the category-column width, then applies the user's maxMonths preference. The panel layout must explicitly accommodate this.
2. BudgetTable handles editing-cell state and keyboard movement. ExpenseCategory coordinates drag-and-drop and disables dragging during edits.
3. BudgetCategories renders mapped rows inside a scroll container; AutoSizer is used for available space. Do not describe every budget row as virtualized. The shared Table used by transaction views does virtualize rows.
4. Shared Table's ROW_HEIGHT is 32, and its virtual list uses rowHeight minus one. Changing visual height without changing measurements would break positioning.
5. Spent-amount activity navigation already applies a category ID and month filter and opens /accounts. Preserve it.
6. NotesButton uses the existing notes-save command. A new panel should initially read notes only.
7. Tracking and envelope budgeting are separate component providers. The redesign must not route a tracking budget into envelope calculations.
8. The application has mobile/narrow layouts in addition to desktop. Top navigation must not unintentionally replace their route handling.
9. FinancialText and PrivacyFilter already provide number/privacy behavior. Decorative replacement text must not bypass them.

## Protected implementation areas

Read as necessary but do not modify for this overhaul:

- `packages/loot-core/**` (financial logic, spreadsheet engine, storage, queries, migrations and transport).
- `packages/sync-server/**`, `packages/crdt/**`, `packages/api/**`.
- `packages/desktop-electron/**` until a separately scoped delivery task.
- Front-end `src/budget/mutations.ts`, `src/budget/queries.ts`, `src/spreadsheet/**`, `src/transactions/queries.ts`, account mutation/query modules and preference/storage semantics.
- Existing bank-sync/authentication flows, theme parsing/migrations, and money formatters.
- Lockfiles and dependency versions unless a specific approved task requires them.

Protected behavior also exists inside UI files. A permitted file does not permit changing its financial handlers.

## Preview strategy

Existing useFeatureFlag reads **synced budget preferences**, and the flag type lives in protected core types. The existing DevelopmentTopBar is for PR demo builds, not an arbitrary layout toggle.

Therefore Stage 1 should use a separate fictional-data prototype. Later staged integration should use an explicitly scoped front-end-only development switch (for example a build-time environment flag) after review, rather than adding a new synced preference. Stage 0 adds no production flag.

## Repository conventions

The root instructions require commands from the root, required type checks before committing, translated user-facing text, existing financial typography, and no manually edited generated icons. PR titles and commits use [AI]. Repository instructions prohibit agent-created issues, so the task tracker is Markdown.

The repository also asks design agents to install/use its Impeccable skill for UI design work. No UI design implementation was done in Stage 0; resolve that prerequisite at the start of Stage 1 and read PRODUCT.md and DESIGN.md.

## Deferred checks

Stage 0 establishes a starting point, not release certification. Native desktop packaging, live-server integrations, real-data migration/recovery, all accessibility scenarios, broad performance profiling, and redesigned-screen acceptance belong to later stages. Do not infer their success from a browser test.
