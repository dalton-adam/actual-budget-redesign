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

Electron's `index.ts` has separate development and packaged-data handling. Its `watch` script specifies ACTUAL_DOCUMENT_DIR and ACTUAL_DATA_DIR, but packaged builds override these defaults. **Do not assume environment variables alone make a packaged app safe.** The desktop review below (ELEC-01) covers development builds; packaged builds are still not safe to launch.

## Desktop isolation review (ELEC-01)

Written September 29, 2026 against `redesign/main` at `cb9cefab0` and Electron 43.4.0 on macOS. Evidence and smoke-test results are in the [verification record](verification.md#elec-01-september-29-2026).

### What the installed app uses

The installed app (`/Applications/Actual.app`, 26.9.0, `com.actualbudget.actual`) keeps its data in two places:

| What                                                                                                                | Where                                                                                                          |
| ------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Settings (`global-store.json`), window position (`window.json`), Chromium storage (localStorage, IndexedDB, caches) | `~/Library/Application Support/Actual` (Electron `userData`)                                                   |
| Budget files                                                                                                        | `~/Documents/Actual`, unless Settings → Files points elsewhere (the `document-dir` key in `global-store.json`) |

On this machine `document-dir` is not set, so budgets are in `~/Documents/Actual` (one budget folder).

### How a desktop build chooses its folders

Traced through `packages/desktop-electron/index.ts`, `window-state.ts`, `packages/loot-core/src/server/main.ts` (`setupDocumentsDir`) and `packages/loot-core/src/platform/server/asyncStorage/index.electron.ts`:

1. `ACTUAL_DATA_DIR` holds `global-store.json`, `window.json` and the built-in sync server's files. `ACTUAL_DOCUMENT_DIR` is the parent of the default budget folder (`<ACTUAL_DOCUMENT_DIR>/Actual`).
2. **Development build** (unpackaged, no `EXECUTION_CONTEXT`): the two variables are honoured if set; either one left unset falls back to `userData` or `~/Documents`.
3. **Packaged build**: both variables are always overwritten with `userData` and `~/Documents`. A packaged build of this fork has the same `productName` and `appId` as the installed app, so it would open the installed app's settings and budgets.
4. **Chromium's own storage ignores both variables.** It always lives in `userData`. An unpackaged build takes its folder name from `productName` ("Actual"), so a development build launched as upstream documents (`yarn start:desktop`, or `watch`) writes its localStorage, IndexedDB and caches into the installed app's `~/Library/Application Support/Actual`, even though its budgets go to `data/`. A probe with a throwaway name confirmed the naming rule; launching Electron at all creates the folder. That is where the redesign's device-local state lives (accounts pane, details panel).
5. What moves `userData`: Electron's `--user-data-dir=<path>` switch moves `userData`, the session data and crash dumps. Setting `HOME` does not; Electron resolves these folders through macOS, not the environment.
6. `global-store.json`'s `document-dir` is read from `ACTUAL_DATA_DIR`, so an isolated data folder also means the installed app's custom budget folder, if any, is never seen.

### Procedure

Only this procedure is approved for running the redesign as a desktop app. Use it for every desktop check until a packaging task changes the answer for packaged builds.

1. **Never** run upstream's `yarn start:desktop`, `yarn workspace desktop-electron watch`, `yarn build:desktop` or the resulting `.app`/`.dmg` for this fork. Never open the fork's build with `open` or from Finder: it shares the installed app's bundle ID.
2. One-time preparation, from the repository root:

   ```sh
   node node_modules/electron/install.js
   ./node_modules/.bin/electron-rebuild -m ./packages/desktop-electron -o better-sqlite3 --build-from-source -f
   node .yarn/releases/yarn-4.17.1.cjs build:plugins-service
   node .yarn/releases/yarn-4.17.1.cjs workspace @actual-app/core build:node
   node .yarn/releases/yarn-4.17.1.cjs workspace desktop-electron build:dist
   ```

   The rebuild replaces the Node build of `better-sqlite3` in the shared `node_modules` with an Electron build, which breaks Node tests. Back up `node_modules/better-sqlite3/build` first and put it back afterwards (or run `npm rebuild better-sqlite3`), then check that `node -e "new (require('better-sqlite3'))(':memory:')"` succeeds.

3. Launch with `node scripts/redesign-electron.mjs`. The script:
   - puts `ACTUAL_DATA_DIR`, `ACTUAL_DOCUMENT_DIR` and `--user-data-dir` under `data/redesign-electron/` (git-ignored by `/data/*`);
   - refuses to start if any of them resolves inside `~/Library/Application Support/Actual`, `~/Documents/Actual` or the installed app's `document-dir`;
   - serves the renderer on 127.0.0.1:3001 only (upstream's `yarn start` listens on every interface);
   - when the app quits, lists any file in those folders that changed during the run and exits non-zero if there is one. Quit the installed app first, or its own writes will show up.
4. In the app: **Don't use a server**, then **Try the demo**. The welcome screen must show no existing budgets; if it lists one, quit and stop. Do not connect a server, import a file, change the budget folder (Settings → Files), or open files from native dialogs.
5. Close with Electron → Quit Actual and check the script's last line reads "Isolation check: nothing changed". Delete `data/redesign-electron/` to start fresh.

### Remaining risks

- **Packaged builds are not isolated** (point 3 above). Running one needs a separately scoped source change first, for example a distinct `productName`/`appId` for fork builds and honouring the directory variables when packaged. RELEASE-01 must not build or install a desktop package until that exists.
- The development build loads the renderer from Vite (`http://localhost:3001`) rather than the packaged `app://actual` bundle, so desktop-only issues in the production bundle are not covered.
- The script's change check compares modification times. It cannot see reads, and it would miss a change made and reverted within one run. `lsof` on the running processes (recorded in the verification record) is the check for open files.

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
