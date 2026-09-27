# Behavior inventory

Preserve every behavior below. “Source mapped” means the implementation path was identified; it does not mean every branch was manually exercised. Executed checks are recorded separately in baseline/README.md.

| Area                 | Existing behavior to retain                                                                                | Source/evidence entry                                                        |
| -------------------- | ---------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Budget selection     | Budget switcher and its context menu                                                                       | sidebar/BudgetName.tsx; budget.test.ts                                       |
| Primary navigation   | Budget, Reports and Schedules                                                                              | sidebar/PrimaryButtons.tsx; FinancesApp.tsx                                  |
| Secondary navigation | Payees, Rules, Tags, Settings, conditional bank-sync destination                                           | sidebar/PrimaryButtons.tsx                                                   |
| Accounts             | All/on/off budget, individual and closed accounts, create account, account context menu                    | sidebar/Accounts.tsx and Account.tsx                                         |
| Global controls      | Privacy, uncategorized count, server/connection status, help, command bar, notifications                   | Titlebar.tsx, FinancesApp.tsx, privacy hooks                                 |
| Month navigation     | Previous/next/current month, left/right/0 shortcuts, bounds, max-month preference                          | DynamicBudgetTable.tsx, BudgetPageHeader.tsx                                 |
| Summary              | Available funds and breakdown, previous overspending, budgeted, future-month hold, To budget               | envelope/budgetsummary/*                                                     |
| Category structure   | Group collapse, rename, add/hide/delete, reordering/drag handles, context menus                            | BudgetTable.tsx, BudgetCategories.tsx, SidebarCategory.tsx, SidebarGroup.tsx |
| Amount editing       | Existing inline editor, keyboard movement, commit/cancel, budget/transfer/cover menus                      | BudgetTable.tsx, EnvelopeBudgetComponents.tsx and existing menus             |
| Category activity    | Clicking Spent opens month/category-filtered transactions                                                  | budget/index.tsx onShowActivity; budget.test.ts                              |
| Notes                | Existing category and month note IDs, editor lifecycle and save handler                                    | NotesButton.tsx, NotesModal.tsx                                              |
| Budget modes         | Envelope and tracking providers, correct calculations per mode                                             | budget/index.tsx                                                             |
| Scroll/layout        | Stable scroll after edit, shared row metrics, multiple months, narrow layout                               | budget.test.ts; components/table.tsx                                         |
| Register             | Search/filter, splits, payment/deposit, cleared/reconciled state, selection, bulk edit, transfers, imports | accounts.test.ts; TransactionsTable.tsx                                      |
| Reports              | Dashboard and report routing, saved reports, date ranges, widgets and chart controls                       | reports.test.ts; reports/*                                                   |
| Schedules            | List, create/edit, recurrence, skipped/paid state, associated transactions                                 | schedules/*; schedules.test.ts                                               |
| Theme                | Light/dark/midnight/system-auto, installed custom themes, CSS overrides                                    | style/theme.tsx, customThemes.test.ts, settings/Themes.test.tsx              |
| Formatting           | Locale, date and money formatting, negative values, tabular figures                                        | useFormat.ts, FinancialText.tsx                                              |
| Privacy              | Obscured financial values throughout new surfaces                                                          | usePrivacyMode.ts, PrivacyFilter.tsx                                         |
| Desktop shell        | Window drag region and native controls                                                                     | FinancesApp.tsx Titlebar; desktop-electron untouched                         |
| Smaller screens      | Mobile routes, navigation and forms                                                                        | FinancesApp.tsx; existing mobile e2e tests                                   |

## Test data

Use upstream **Try the demo** data. Automated tests create it in fresh browser contexts using e2e/page-models/configuration-page.ts. The manual preview should also use the demo, not a real budget export.

Do not create a parallel mock finance engine. UI prototypes may have explicit fictional constants; integrated tests should use the existing fixture and budget mutations.

## Review checklist for each new surface

- Values agree with the existing screen before and after the same action.
- A meaningful zero, negative amount or warning is not lost through muted styling.
- Themes still affect backgrounds, text, controls, financial status and selection.
- Keyboard focus remains visible; opening/closing panels restores useful focus.
- Existing click, right-click, double-click and drag meanings remain intact.
- Small windows and multi-month budgeting are inspected.
- Money is hidden when the existing privacy option is enabled.
- No budget calculation, data shape, stored setting or sync behavior changed.
