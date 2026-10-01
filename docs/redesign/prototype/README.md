# Stage 1 prototype — DESIGN-01

A static, fictional-data prototype of the redesigned app frame and budget screen. It is not connected to Actual's code and performs no budget calculations beyond the illustration formulas noted below.

Status: **DESIGN-01 and DESIGN-02 reviewed** (see [DESIGN-02 decisions](#owner-decisions-september-27-2026-walkthrough)). DESIGN-03 (decisions record) is next.

## Opening it

Run `yarn install` first (the prototype loads Inter and the privacy font from `node_modules`), then open `docs/redesign/prototype/index.html` in a browser. The bar at the bottom switches:

- layout: A, one continuous table; B, group cards
- header: summary cards, or Concept C's trend header
- theme: light, dark, midnight
- details panel: open or closed
- page: Budget, or an account register (also reachable from the Accounts menu)

Clicking a category row opens the panel. Escape closes menus, then the panel. Resize the window to see the ~1000px and narrow layouts. URL parameters are listed at the top of `index.html`, and `controls=0` hides the bar.

Regenerate the screenshots:

```sh
node scripts/redesign-prototype-shots.cjs              # DESIGN-02 set, 18–50
node scripts/redesign-prototype-shots.cjs --design-01  # 01–17 from the current prototype
```

The DESIGN-01 images (01–17) are kept as the historical record. Regenerating them reproduces their fixture and 50px rows, but the current prototype adds the Income section and row tools, so they will differ slightly.

## Screenshots

| File                                        | Shows                                                                 |
| ------------------------------------------- | --------------------------------------------------------------------- |
| `shots/01-A-dark-wide-panel.png`            | Layout A, dark, 1440×900, details panel open                          |
| `shots/02-B-light-wide-panel.png`           | Layout B, light, 1440×900, panel open                                 |
| `shots/03-A-midnight-wide-trend.png`        | Layout A, midnight, Concept C trend header, panel closed              |
| `shots/04-B-dark-wide-trend-panel.png`      | Layout B, dark, trend header with panel                               |
| `shots/05-A-light-1000-closed.png`          | ~1000×700, panel closed                                               |
| `shots/06-A-dark-1000-panel.png`            | ~1000×700, panel open (compressed columns)                            |
| `shots/07-B-light-1000-panel.png`           | ~1000×700, layout B, panel open                                       |
| `shots/08-A-dark-wide-accounts-menu`        | Accounts menu                                                         |
| `shots/09-B-light-wide-more-menu`           | More menu (secondary destinations)                                    |
| `shots/10-A-dark-wide-budget-menu`          | Budget switcher menu                                                  |
| `shots/11-narrow-760-drawer.png`            | Narrow window: navigation drawer                                      |
| `shots/12-narrow-760-panel-overlay`         | Narrow window: details panel as an overlay                            |
| `shots/13-A-dark-wide-privacy.png`          | Privacy mode (amounts in the redacted font, chart hidden)             |
| `shots/14-account-dark-wide.png`            | Account register, dark, 1440×900: hero card, balance chart, 36px rows |
| `shots/15-account-light-wide-selected.png`  | Two rows selected: selection button and Selected chip                 |
| `shots/16-account-midnight-1000-adding.png` | ~1000×700, midnight, adding a transaction                             |
| `shots/17-account-light-1000.png`           | ~1000×700, compact hero band                                          |

## Destination map

Every navigation and global item in [behavior-inventory.md](../behavior-inventory.md), and where it lives in the prototype.

| Item                                                                | Today (source)                                   | Wide window (≥900px)                                                    | Narrow window (<900px)                         |
| ------------------------------------------------------------------- | ------------------------------------------------ | ----------------------------------------------------------------------- | ---------------------------------------------- |
| Budget, Reports, Schedules                                          | Sidebar `PrimaryButtons.tsx`                     | Pill tabs in the top bar                                                | Drawer                                         |
| All accounts, On budget, Off budget (with totals)                   | Sidebar `Accounts.tsx`                           | Collapsible **Accounts pane** on the left, plus the **Accounts ▾** menu | Drawer "Accounts" section                      |
| Individual accounts, with sync status and balance                   | Sidebar `Account.tsx`                            | Accounts ▾ menu rows (status dot and balance)                           | Drawer                                         |
| Account context menu (right-click)                                  | `Account.tsx`                                    | Same menu on right-click of a row in the Accounts menu (not drawn)      | Long-press / right-click in drawer (not drawn) |
| Closed accounts                                                     | Sidebar toggle                                   | Accounts ▾ → Closed accounts                                            | Drawer                                         |
| Add account                                                         | Sidebar button (`Sidebar.tsx`)                   | Accounts ▾ → Add account                                                | Drawer                                         |
| Payees, Rules, Bank Sync (conditional), Tags, Settings              | Sidebar "More"                                   | **More ▾** menu                                                         | Drawer "More" section                          |
| Budget switcher: Rename, Settings, Load backup…, Switch file        | Sidebar `BudgetName.tsx`                         | Top-right budget button menu                                            | Drawer footer                                  |
| Uncategorized count                                                 | Titlebar `UncategorizedButton`                   | Top-right chip; collapses to the count alone below 1280px               | Drawer item with count                         |
| Server sync status                                                  | Titlebar `ServerSyncButton` (only with a server) | Top-right cloud button with status dot                                  | Top bar                                        |
| Privacy mode                                                        | Titlebar `PrivacyButton`                         | Top-right eye button                                                    | Top bar                                        |
| Help                                                                | Titlebar `HelpMenu`                              | Top-right ? button                                                      | Drawer                                         |
| Logged-in user (server login)                                       | Titlebar `LoggedInUser`                          | **Not drawn.** Proposal: inside the budget switcher menu                | Drawer footer                                  |
| Months shown (1–N)                                                  | Titlebar `MonthCountSelector` on /budget         | **Removed** (owner decision: one month at a time)                       | Removed                                        |
| Previous / next / current month                                     | `MonthPicker.tsx`                                | Budget header month pill and **Today**                                  | Budget header                                  |
| Month menu and month notes (DESIGN-01 called it "budget page menu") | `BudgetMonthMenu.tsx`, `BudgetSummary.tsx`       | Budget header ⋯ button                                                  | Budget header                                  |
| To Budget menu and breakdown                                        | `budgetsummary/*`                                | Ready to Assign card (click; "Breakdown" affordance)                    | Same card                                      |
| Category activity → transactions                                    | `onShowActivity`                                 | Activity amount in each row (unchanged behavior)                        | Same                                           |
| Command bar (Ctrl/Cmd+K), notifications                             | Global                                           | Unchanged: keyboard shortcut and existing toasts                        | Unchanged                                      |
| Back button (`location.state.goBack`)                               | Titlebar                                         | **Not drawn.** Proposal: left of the page eyebrow when present          | Same                                           |
| Desktop window drag region                                          | Titlebar                                         | The top bar becomes the drag region; buttons excluded                   | n/a                                            |

## Findings

1. **Density is the biggest open problem.** At about 1000×700 with 50px rows, only about seven categories are visible below the summary (`05`, `06`). Copilot's airy rows suit its small category lists, but envelope budgets often have 20–40 categories. DESIGN-02 should compare 50, 44, and about 38px rows, plus a smaller summary once the page scrolls. Keep the tiles and pills at the smaller sizes.
2. **Layout A vs B.** A packs more rows into the same height. B's group cards read more like Copilot but cost about 20px per group and make the sticky column header less useful. A is the better default for large budgets; B suits small ones.
3. **Concept C's trend header** takes about 280px of height. It fits at 1440×900 but crowds out rows at 1000×700; the prototype hides its ring cards when the panel is open at that width. Suggest offering it as a collapsible card rather than the default header.
4. **Panel at 1000px** works when columns compress: the percentage label is dropped and the activity bar narrows (`06`, `07`). Budget views showing two or more months will need the panel to overlay rather than push; confirm in DESIGN-02 with `DynamicBudgetTable`.
5. **Top navigation removes the sidebar's resize, pin, and floating behavior.** The account list is now one click away instead of always visible. If you check accounts constantly, a pinnable accounts popover or an optional retained sidebar are the alternatives.
6. **Narrow layout** hides the Activity column and shows the panel as an overlay. Actual already has dedicated mobile routes below its own breakpoint, so this drawer only covers the in-between width. Don't build a second mobile UI.
7. **Tension with upstream design docs.** `PRODUCT.md` lists "gradient heroes" as an anti-reference, and `DESIGN.md` reserves shadows for transient surfaces and allows one accent color. The owner-approved Copilot direction knowingly relaxes these. The prototype keeps the glow subtle (behind the Ready to Assign card only) and keeps semantic tokens, tabular figures, and never-color-alone. DESIGN-03 should record this as a deliberate fork decision.

## Prototype-only shortcuts

- Category accents are pinned per fixture row so the screenshots read well; the planned app behavior is `stableHash(category.id) % 10`, and the helper is included.
- The trend and pace series are hard-coded illustrations.
- Menus are not keyboard-navigable and right-click menus are not drawn. Real implementations reuse the existing menu components.
- The "A" logo mark is a placeholder for Actual's logo.

## Owner decisions (September 27, 2026)

1. **Layout A** (one table) is the default. Layout B stays in the prototype for reference only.
2. **Summary cards** over Concept C's trend header.
3. **All three themes**, light, dark, and midnight, are first-class.
4. **Details panel** is open by default on the Budget page. It is not used on account registers; see [the accounts review](../accounts-review/README.md). The prototype's **Page → Account** switch shows the register treatment.

DESIGN-02 took up the open items: row density, whether losing the always-visible account sidebar is acceptable, and reconciliation-mode layout. See below.

## DESIGN-02: states and walkthrough decisions

Prepared September 27, 2026. Still a static, fictional-data prototype; nothing here changes application code. The bar at the bottom gains **Data** (basic, states, 34 categories), **Rows** (50/44/38px, for comparison), **Month** (past, current, future), **Ready** (positive, zero, negative), a **Custom** theme, **Accounts pane** (open or collapsed), and on the account page **Reconcile**. **Reset** reloads the fixture. All URL parameters are listed at the top of `index.html`.

### Owner decisions (September 27, 2026 walkthrough)

1. **Row height: 44px**, with the compact summary strip once the table scrolls.
2. **Accounts pane: always present and collapsible.** Open, it is the full list (all/on/off budget, closed accounts, add account); collapsed, it is a 56px rail with each account's initial and sync-status dot, plus add account. The Accounts menu in the top bar stays for narrow windows. The open/collapsed state is remembered per device (front-end storage, like the details panel). Prototype default: open at 1280px and wider, collapsed below.
3. **One month at a time.** The months-shown control is removed from the budget. This deliberately drops an existing feature (`MonthCountSelector` and the `maxMonths` global preference); DESIGN-03 records it as an approved exclusion, and budgets set to show several months today will show one. The multi-month prototype (rail/overlay panel, per-month summary cards) was removed with it.
4. **Progress bar with a negative Available and no spending this month: empty bar.** The bar only shows this month's spending; the negative pill carries the warning. With spending, an overspent category still shows a full bar in the negative color.
5. **Reconciliation band approved as drawn** (`44`–`46`).

### What is demonstrated

| Required by backlog / plan §6                                         | Where                                                              |
| --------------------------------------------------------------------- | ------------------------------------------------------------------ |
| Normal, hover, selected, editing rows                                 | `18`, `19` (hover on Transport, editing Subscriptions)             |
| Overspent (negative pill, full negative bar)                          | Dining out; `20`                                                   |
| Zero assigned, zero available, hidden category                        | Gifts, Rent, Old car loan (faded, "Hidden" tag); `18`              |
| Carryover: positive carry and overspending rollover (→ marker)        | Transport (From Aug), Medical; `21`                                |
| Goal/template status: funded, underfunded, long-term goal             | Rent, Utilities (amber pill, caption), Emergency fund; `18`, `22`  |
| Refund (positive activity)                                            | Clothing                                                           |
| Ready to Assign positive, zero, negative ("Overassigned")             | `18`, `25`, `26`                                                   |
| Breakdown expanded (TotalsList lines plus existing To Budget actions) | `26`, `27`                                                         |
| Pace chart for current, past and future months                        | `18`, `23`, `24`                                                   |
| Long names, emoji first, non-Latin, 34 categories                     | `35`, `28`–`31`                                                    |
| Density 50 / 44 / 38px at 1000×700                                    | `28`, `29`, `30`, `31`                                             |
| Details panel open and closed                                         | `18`, `25`                                                         |
| Narrow fallback                                                       | `35`, `36`                                                         |
| Custom theme fallbacks                                                | `37`, `38`                                                         |
| Every existing menu, drawn with its current items                     | month `39`, column `40`, category `41`, group `42`, Available `43` |
| Reconciliation mode                                                   | `44`, `45`, `46`                                                   |
| Activity → filtered transactions                                      | `47`                                                               |
| Accounts pane collapsed and open                                      | `48`, `49`; open beside the details panel in `18`                  |
| Privacy mode with the new states                                      | `50`                                                               |

Interactions work in the browser: click a name to open details (right-click for its menu), click Assigned to edit (Enter/Tab moves down, Escape cancels and returns focus), click Available for its menu, click Activity to open the filtered register, collapse groups, step months, collapse and expand the accounts pane.

### Findings

1. **Density measurements.** Categories fully visible at 1000×700 with the details panel open, 34-category fixture: 50px → 6, 44px → 7, 38px → 9; with the compact summary strip: 7, 8 and 10. Today's app shows about 8 at the same size (31px rows, baseline `desktop-1000/budget.test.ts`). At 1440×900: 10 / 11 / 12 (compact 11 / 12 / 14). The approved 44px with the compact strip matches today's count.
2. **Width with both side panes.** At 1440 with the accounts pane and details panel open, the Activity column narrows to 100–170px and drops its percentage; at 1000 the collapsed rail leaves long names readable. Row tools (notes, menu, drag handle) take no width until hover or keyboard focus; a small notes icon after the name marks categories that have notes.
3. **The ⋯ in the budget header is the month menu** (`BudgetMonthMenu`: copy last month, set to zero, averages, templates), plus a month-notes button. DESIGN-01 labeled it "budget page menu"; that menu does not exist. The category column's own menu (toggle hidden, expand/collapse all) and the add-group action sit on the Category header. Category and group menus, notes buttons and the drag handle appear on hover and on keyboard focus.
4. **Goal/template status is never color alone**: a target icon in the pill, a caption under the name ("Template $280 · $30 short"), and the full sentence in the pill's accessible name and the panel. Colors follow `makeBalanceAmountStyle`: underfunded uses the existing `templateNumberUnderFunded` meaning (new `pillWarning*` roles), and a long-term goal shows as underfunded until the balance reaches it, as the app does today.
5. **Progress bar formula** (with decision 4): spent = this month's outflow net of refunds, floored at 0. If Available < 0: full negative bar when spent > 0, empty bar otherwise. Else fill = spent ÷ (spent + Available).
6. **Pace chart rules.** Money at the start of the month (carried + assigned) spread evenly across the month, against cumulative outflow; refunds reduce it. Past months show the full month and "Finished with $X left / overspent". Future months show the even-pace line and "No activity yet". No line when nothing was assigned (for example Medical) or for long-term savings goals, where the goal box replaces it. DESIGN-03 records these formulas for UI-03.
7. **Custom themes.** A custom theme overrides existing roles on top of a built-in base. If new roles are defined as `color-mix()` expressions of existing roles (cards from `cardBackground`/`tableBorder`, pills from `numberPositive`/`numberNegative`/`templateNumberUnderFunded`, selection from `buttonPrimaryBackground`), every new surface follows the custom palette (`37`, `38`, a Solarized-style test). Category accents fall back to the built-in set. This is the proposed UI-01 fallback mechanism; built-in themes keep their tuned literal values.
8. **Reconciliation mode** is a state of the account hero: the existing reconcile popover (statement balance, last bank balance, "Use last synced total"), then a band with the difference chip, the existing sentence, **Create reconciliation transaction** and **Exit reconciliation**; when the difference is zero, "All reconciled" and **Lock transactions**. The hero gets a selection outline and the cleared column is accented. On the compact hero the band sits below the balance.
9. **Future months go negative quickly.** With nothing held for next month, October's Ready to Assign in the fixture is −$5,048 (`24`), which is how the app behaves. The "Overassigned" badge makes the state explicit. No change proposed.
10. **Wording used in this prototype** for DESIGN-03's old → new list: To Budget → Ready to Assign, Overbudgeted → Overassigned, Budgeted → Assigned, Spent → Activity, Balance → Available (budget only; the register's Balance stays), plus the unchanged menu item texts from the source.

Next: DESIGN-03 writes `docs/redesign/design-decisions.md` from these decisions.

## APP-03: Reports proposal (September 30, 2026)

**Status: approved as drawn September 30, 2026**, with the owner's answers to
the three questions: summary amounts at Display size (they shrink only to
fit), edit mode keeps colours, and change amounts become pills.
Choose **Page → Reports** in the bar at the bottom, then **View** (Dashboard or
the Net Worth report page) and **Edit** (dashboard edit mode). URL parameters:
`page=reports`, `rview=dash|networth`, `redit=0|1`, `whover=<widget id>`.

Owner decisions before drawing (September 30, 2026):

1. Draw first, then build (as for APP-01 and APP-02).
2. Widget cards get a **hairline border and no shadow** (the Approved-Depth-Only
   rule stands; Card elevation is not extended to Reports).
3. **Chart and amount colours stay as they are**: Actual's existing `reports*`
   and number roles. Only cards, controls, spacing and text change.
4. **Split in three**: APP-03a dashboard, widget cards and the E2E viewport fix;
   APP-03b the report page header and controls; APP-03c the custom report
   sidebar and the Calendar report's transaction list.

What the drawing proposes (each item is presentation only):

| Surface            | Today                                                                         | Proposed                                                                                                                                                                                  |
| ------------------ | ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Dashboard title    | "Reports: Main", 25px/500, pencil on hover                                    | "Reports" eyebrow over the dashboard name at Display (28px/700); the same rename pencil on hover or focus                                                                                 |
| Dashboard controls | Dashboard selector, divider, Add new widget (primary), Edit dashboard, ⋯ menu | Same controls and order of importance as Control buttons: "Dashboard: Main ▾", Edit dashboard, Add new widget (primary), ⋯; Finish editing dashboard becomes the primary                  |
| Widget card        | `tableBackground`, 2px bottom radius, drop shadow that deepens on hover       | Surface card fill, hairline border, 18px radius, 16px 20px padding, **no shadow**; hover and keyboard focus strengthen the border; 14px grid gap                                          |
| Widget header      | Title 15px, subline subdued                                                   | Title 13.5px/600, subline 12px in Secondary text; the widget's ⋯ menu (edit mode only, as today; the hovered card in `51` is drawn wrongly) has reserved space so it never covers a value |
| Summary widgets    | Amount auto-sized to fill the card (up to ~60px)                              | Amount at Display (28px/700) in tabular figures, bottom-left, same colour meaning as today. **Question for the owner:** this drops the fill-the-card sizing.                              |
| Change amounts     | Coloured text ("+19,511.15")                                                  | Status pills with the sign kept (positive or negative tone), so colour is never the only signal                                                                                           |
| Charts             | Recharts, existing colours                                                    | Unchanged series colours; charts run to the card's edges; axis text Faint 11px; dashed hairline grid                                                                                      |
| Edit mode          | Cards turn greyscale; move cursor                                             | Cards keep their colours; dashed border, a grip before each title, the ⋯ menu always visible and a resize corner                                                                          |
| Report page header | Title, then a row of upstream buttons (Live/Static, date range, Filter, …)    | "Reports · Main" eyebrow, title at Display; Live/Static as a segmented tab control; date range, Filter, Monthly and Trend as Control buttons; Save widget stays primary (APP-03b)         |
| Report page body   | Chart on the page background; explanation text below                          | The chart in a Surface card with the total and change pill; the explanation in its own card (APP-03b)                                                                                     |

Unchanged by design: which widgets exist and where (the user's saved layout),
widget sizes and drag/resize, every menu item, report calculations, filters,
privacy mode (amounts use the privacy font; charts stay visible, as today), and
mobile (deferred, plan §19.4). Not drawn: the custom report editor and the
Calendar report's transaction list (APP-03c), the widget menu contents, the
Add new widget menu, and the other eight report pages, which would follow the
Net Worth page's header and card pattern.

| File                                  | Shows                                                  |
| ------------------------------------- | ------------------------------------------------------ |
| `shots/51-reports-dark-wide.png`      | Dashboard, dark, 1440×900, Net Worth widget hovered    |
| `shots/52-reports-light-wide.png`     | Dashboard, light, 1440×900                             |
| `shots/53-reports-midnight-1000.png`  | Dashboard, midnight, 1000×700, accounts pane collapsed |
| `shots/54-reports-light-1000-editing` | Edit mode, light, 1000×700                             |
| `shots/55-networth-dark-wide.png`     | Net Worth report page, dark, 1440×900                  |
| `shots/56-networth-light-1000.png`    | Net Worth report page, light, 1000×700                 |
| `shots/57-reports-custom-wide.png`    | Custom theme through the fallback layer                |
| `shots/58-reports-privacy-dark-wide`  | Privacy mode                                           |

Regenerate with `node scripts/redesign-prototype-shots.cjs --app-03`
(`PW_CHANNEL=msedge` uses the installed Edge when Playwright's Chromium is not
installed).

## APP-03c: custom report, Calendar and Formula proposal (October 1, 2026)

**Status: approved October 1, 2026**, with the owner's answers: yes to the
"Unsaved changes" label and the "Report ▾" menu button (question 1); the
summary and legend placement below 1280px was left to the implementer
(question 2): they move **under the chart** inside the same card (stat tiles
in a row, then the legend in columns) rather than hiding, because the legend
is the only key to the colours in the donut, stacked, line and area views,
and a side column at 1000px would squeeze the chart to about 360px. Choose **Page →
Reports**, then **View** Custom, Calendar or Formula. URL parameters:
`rview=custom|calendar|formula`; for the custom report also
`rgraph=table|bar|stacked|line|area|donut` and `rlegend`, `rsummary`,
`rlabels` (`0|1`).

Owner decisions before drawing (October 1, 2026):

1. **Scope:** the custom report editor, the Calendar report's transaction list
   and the Formula editor body. Monte Carlo moves to its own task (APP-03d).
2. **Custom report settings sit in a Settings card** beside the chart card,
   not flush on the page background.
3. **The six chart types become one segmented icon control**; Legend, Summary
   and Labels become toggle Control buttons.

What the drawing proposes (each item is presentation only):

| Surface                   | Today                                                                                   | Proposed                                                                                                                                                                                                                                                                                                                           |
| ------------------------- | --------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Custom report header      | "Custom Report: ‹name›" in purple, 25px; saved-report menu at the right of the icon row | The APP-03b pattern: "Reports · ‹dashboard›" over the report name at Display. The saved-report menu moves to the header as a Control button ("Report ▾"), with the unsaved state as a dot and "Unsaved changes" (the existing modified status)                                                                                     |
| Custom report toolbar     | 11 bare icon buttons with dividers                                                      | One segmented icon control for the six chart types (`aria-pressed`, same icons and order); Legend, Summary and Labels as toggle Control buttons with their names; Copy to clipboard and Filter as Control buttons; Save widget primary at the right. Below 1280px the toggles show icons only, named by `aria-label`               |
| Custom report settings    | Flush sidebar, 13px labels, upstream selects and toggle                                 | A Surface card: **Display** (Mode as a segmented control; Split, Type, Interval, Sort and Options as full-width Control buttons), **Date filters** (Live/Static segmented, Range), **Categories** (select all/none tools, Hide unchecked, the checklist with each category's accent dot). The checklist scrolls inside the card    |
| Custom report chart       | Chart on the table background; "Payment: −7,768.41" right-aligned above it              | The chart in a Surface card: title and date range left, total at Display right. Summary and legend share a right column inside the card (stat tiles, then legend rows with amounts); below 1280px they move under the chart in the same card (owner decision, question 2). The data table view sits in the same card               |
| Calendar transaction list | Upstream table on the page background                                                   | The APP-02 register (`isRegister`) in its own card: Eyebrow headers, payee initials in the category accent, accent dots before categories, reconciled locks. Read-only as today: no selection column, no balance, no cleared column                                                                                                |
| Calendar month tiles      | Surface tiles (APP-03b), month name and totals on one line                              | Month name on its own line with the totals under it, so long names ("September 2026") never wrap into the grid; the totals card uses stat tiles. Below 1280px the tiles scroll sideways, as they do today                                                                                                                          |
| Formula body              | Labels and fields on the page background; result in a 6px-corner box                    | Cards: **Result** (the existing result on a Card Inset well), **Formula** (the editor with line numbers), **Appearance** (Show title, Font size as Dynamic/Static segments, size, conditional color and its help text). **Query Definitions** is a card on the right (below the others under 1280px), each query a Card Inset tile |

Unchanged by design: every setting, menu item, filter, saved report, the
chart colours (`chartQual*` and `reports*` roles), Formula's editor and
QueryManager behavior, the Calendar's sort and its read-only rows, strings
(the "Unsaved changes" label reuses the existing modified status; see
question 1), and mobile. Not drawn: Monte Carlo (APP-03d), the Options menu
contents, the saved-report menu contents, the stacked/line/area/donut views
(the card frames them as it frames the bar graph).

Questions for the owner:

1. The header shows **"Unsaved changes"** for the existing modified status.
   Today that status only shows as "(modified)" inside the saved-report menu
   button, which is labelled with the report's name. The drawing labels the
   button "Report ▾" because the name is now the page title. Are the new
   wording and label acceptable (two new strings), or should the button keep
   "‹name› (modified)" with no separate label?
2. Should the **summary and legend column** hide below 1280px as drawn, or
   stay and narrow the chart?

| File                                         | Shows                                            |
| -------------------------------------------- | ------------------------------------------------ |
| `shots/59-custom-report-dark-wide.png`       | Custom report, bar graph, dark, 1440×900         |
| `shots/60-custom-report-light-1000.png`      | Custom report, light, 1000×700, pane collapsed   |
| `shots/61-custom-report-table-midnight-wide` | Custom report, data table, midnight, 1440×900    |
| `shots/62-calendar-dark-wide.png`            | Calendar report with the register list, dark     |
| `shots/63-calendar-light-1000.png`           | Calendar report, light, 1000×700                 |
| `shots/64-formula-dark-wide.png`             | Formula editor body, dark, 1440×900              |
| `shots/65-formula-light-1000.png`            | Formula editor body, light, 1000×700             |
| `shots/66-app03c-custom-theme-wide.png`      | Custom report in a custom theme (fallback layer) |

Regenerate with `node scripts/redesign-prototype-shots.cjs --app-03c`
(`PW_CHANNEL=msedge` uses the installed Edge).

## APP-03d: Monte Carlo proposal (October 1, 2026)

**Status: approved October 1, 2026.** The owner left the three questions
below to the implementer, who chose: Configuration stays above Results (the
order upstream users know, inputs before outputs; question 1); the
histogram and explanation sit side by side at 1280px and wider (question 2);
the "Summary" label is dropped (question 3). Choose **Page → Reports**, then
**View** Monte Carlo. URL parameters: `rview=montecarlo`, `mctab=plan|pots`
(configuration tab), `mcview=chart|runs` (results view). The page title and
eyebrow already follow the APP-03b pattern; this drawing covers the body.

What the drawing proposes (each item is presentation only):

| Surface               | Today                                                                                           | Proposed                                                                                                                                                                                                                                                                         |
| --------------------- | ----------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Save widget           | Primary button beside a "Configuration" heading on the page background                          | In the page header, as on the other report pages (APP-03b)                                                                                                                                                                                                                       |
| Configuration         | `tableBackground` block; five `ModeButton` tabs; 600-weight field labels; uppercase group heads | A Surface card titled **Configuration** with the five tabs as one segmented control (`role="tab"`), the tab's description in Secondary text, field groups under Eyebrow headings split by hairlines, Control-style inputs and the Return model select as a Control button        |
| Investment pots       | Upstream table container and header; inline inputs                                              | A hairline-bordered table inside the card with Eyebrow column headers and 46px rows; each field is a Control-style input; drag grip, expand and remove stay where they are; the expanded row's Access, Tax and Fees groups sit on a Card Inset well. Add pot is a Control button |
| Other tabs            | Contributions, Spending, Tax                                                                    | **Not drawn**; they take the same field, table and Control button styles                                                                                                                                                                                                         |
| Results headline      | "Results" heading and checkbox on the page; stats on `tableBackground`, success rate 36px       | A **Results** card: the today's-money checkbox at the right of its title; five stat tiles on Card Inset, Success rate at Display in the same colour thresholds; the summary sentence below (the old "Summary" label is dropped, see question 3)                                  |
| Portfolio performance | `tableBackground` block; Chart/Runs `ModeButton`s; scenario `Select`                            | A Surface chart card: Chart/Runs as a segmented control beside the title, the scenario select as a Control button at the right; axis text Faint 11px and a dashed hairline grid; bands and median line keep `reportsChartFill` and their opacities                               |
| Simulation runs       | Upstream table with rank, outcome, balances, pager                                              | The same card: Eyebrow headers, 50px rows; outcome as a status pill ("Survived" positive, "Ran out at age N" negative) so colour is never the only signal; sort, Jump to, Previous and Next as Control buttons                                                                   |
| Depletion histogram   | `tableBackground` block, red bars, median reference line                                        | A Surface card; bars keep `reportsNumberNegative`, the median line keeps its colour, dashed; both sentences in Secondary text                                                                                                                                                    |
| Explanation           | Full-width block                                                                                | The APP-03b explanation card. At 1280px and wider it sits beside the histogram; below 1280px they stack                                                                                                                                                                          |

Below 1280px the stat tiles fall to three columns with Success rate spanning
two rows, and the pots table scrolls sideways as it does today.

Unchanged by design: every field, help tooltip, validation and default; the
simulation and its results; drag-to-reorder pots; the runs table's paging and
drill-in to a single run (not drawn; it takes the same table style); the chart
and histogram colours; all strings; privacy mode; and mobile.

Questions for the owner:

1. **Order:** the drawing keeps Configuration above Results, as today. On a
   1440×900 window only the headline stats show without scrolling (`67`).
   Should Results come first, with Configuration below?
2. **Histogram and explanation side by side** at 1280px and wider (`71`), or
   keep every card full width as today?
3. The **"Summary" label** above the summary sentence is dropped, since the
   sentence sits directly under the stats in the Results card. Fine to drop,
   or keep it?

| File                                         | Shows                                                |
| -------------------------------------------- | ---------------------------------------------------- |
| `shots/67-montecarlo-dark-wide.png`          | Plan details tab and results, dark, 1440×900         |
| `shots/68-montecarlo-light-1000.png`         | Light, 1000×700, pane collapsed                      |
| `shots/69-montecarlo-pots-midnight-wide.png` | Investment pots tab with one pot expanded, midnight  |
| `shots/70-montecarlo-runs-dark-wide.png`     | Simulation runs view, dark                           |
| `shots/71-montecarlo-light-wide-full.png`    | Whole page, light, 1440 wide (histogram beside text) |
| `shots/72-montecarlo-custom-theme-wide.png`  | Custom theme through the fallback layer              |

Regenerate with `node scripts/redesign-prototype-shots.cjs --app-03d`
(`PW_CHANNEL=msedge` uses the installed Edge).

## APP-04: Schedules proposal (October 1, 2026)

**Status: approved October 1, 2026.** The owner left the four questions
below to the implementer, who chose: the actions move to the top toolbar
(question 1); pills keep their icon (question 2); no new headings, the
existing "Date" label becomes its section's Eyebrow and the rest are split
by hairlines (question 3); the two other dialogs wait for APP-06
(question 4). Choose **Page → Schedules** (or the
Schedules tab). URL parameters: `sdlg=<schedule id>|add` (the schedule
dialog), `stx=linked|matched`, `scompleted=0|1`, `sempty=0|1`, and for
screenshots `sfilter`, `shover`, `smenu`, `ssel`.

Source traced for the brief: the page is `C/schedules/index.tsx`, the table
`C/schedules/SchedulesTable.tsx` (also used, `minimal`, by the Find schedules
and link-schedule dialogs), the status pill `C/schedules/StatusBadge.tsx`
(its colours, `getStatusProps`, are shared with the account register and the
rule editor), the dialog `C/schedules/ScheduleEditModal.tsx`, and its body
`C/schedules/ScheduleEditForm.tsx` (shared with the mobile schedule page).

What the drawing proposes (each item is presentation only):

| Surface             | Today                                                                                | Proposed                                                                                                                                                                                                                                                                                                                                                                                                  |
| ------------------- | ------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Page title          | Regular-weight page header                                                           | The 28px bold title used on the account and report pages; no eyebrow (no new string)                                                                                                                                                                                                                                                                                                                      |
| Actions             | Find schedules and Change upcoming length bottom left, Add new schedule bottom right | One toolbar above the table, as on the account page: **Add new schedule** (primary), Find schedules, Change upcoming length, and the filter at the right. Below 1280px the three buttons drop to icons with their accessible names, as the account toolbar does                                                                                                                                           |
| Table               | `tableBackground` container, 43px rows, sentence-case headers                        | A Surface card with Eyebrow headers, hairline dividers and 44px rows; Name in 600 weight; Account in Secondary text; "None" in Faint; long names truncate, full name on hover                                                                                                                                                                                                                             |
| Status              | 13px icon and label badge, radius 4                                                  | The register's status pill shape (22px, radius 6, 11.5px semibold) **with its icon kept** at 12px; colours unchanged (`getStatusProps`)                                                                                                                                                                                                                                                                   |
| Amount              | `~` / `±` glyph left, amount right, positive in `noticeTextLight`                    | Same meaning; glyph in Faint, positive amounts in the positive number role, tabular                                                                                                                                                                                                                                                                                                                       |
| Recurring, ⋯ menu   | Check; bare ⋯ button opening the row's context menu                                  | Same check in Secondary text; ⋯ as a 28px tool button opening the existing menu (Post transaction, Post transaction today, Skip next scheduled date or Restart, Complete, Delete)                                                                                                                                                                                                                         |
| Completed schedules | Italic centred row                                                                   | A quiet centred row in Secondary semibold (same string, same click)                                                                                                                                                                                                                                                                                                                                       |
| Empty               | "No schedules" / "No matching schedules"                                             | Same strings, centred in the card                                                                                                                                                                                                                                                                                                                                                                         |
| Schedule dialog     | One long form; 600-weight labels; Linked / Find matching as link buttons             | Sections split by hairlines with Eyebrow heads (**Date**, **Options**; see question 3); Control-style inputs and selects; upcoming dates in a Card Inset well beside the date; Edit as rule at the right of Options; Linked / Find matching as a segmented control; the transactions table in a hairline card with Eyebrow headers; Cancel and Save in a footer that stays visible while the body scrolls |

Unchanged by design: every handler (post, post today, skip, complete,
restart, delete, add, edit, link, unlink, find, upcoming length), the
filter's matching, the order of schedules, the status rules and colours, the
date and recurrence pickers (`DateSelect`, `RecurringSchedulePicker`), the
amount inputs and `OpSelect`, validation and error text, privacy mode, and
mobile (the form's new look applies at desktop widths only, so
`MobileScheduleEditPage` keeps the upstream layout).

Questions for the owner:

1. **Toolbar on top:** move Find schedules, Change upcoming length and Add
   new schedule from the bottom of the page into the toolbar (`73`, `74`)?
2. **Status icon:** keep the icon in the pill (drawn), or drop it to match
   the account register's pills exactly?
3. **Dialog section heads:** add the Eyebrow headings **Date** and
   **Options** (Date already exists as a string; Options would be new), or
   split the dialog by hairlines only?
4. The **Find schedules and link-schedule dialogs** also use this table.
   Give them the new table look too, or leave them for APP-06 (the default,
   as APP-02 did for the Calendar list)?

| File                                        | Shows                                               |
| ------------------------------------------- | --------------------------------------------------- |
| `shots/73-schedules-dark-wide.png`          | Schedules, dark, 1440×900, a row hovered            |
| `shots/74-schedules-light-1000.png`         | Light, 1000×700, pane collapsed, icon-only toolbar  |
| `shots/75-schedules-midnight-wide-menu.png` | Row menu open; completed schedules shown; midnight  |
| `shots/76-schedules-custom-theme-wide.png`  | Custom theme through the fallback layer             |
| `shots/77-schedule-edit-dark-wide.png`      | Editing a schedule, one linked transaction selected |
| `shots/78-schedule-add-light-1000.png`      | Adding a schedule, light, 1000×700                  |
| `shots/79-schedules-empty-light-wide.png`   | No schedules                                        |

Regenerate with `node scripts/redesign-prototype-shots.cjs --app-04`
(`PW_CHANNEL=msedge` uses the installed Edge).
