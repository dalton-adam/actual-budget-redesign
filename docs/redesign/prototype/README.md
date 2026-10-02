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

## APP-05a: Payees proposal (October 1, 2026)

**Status: approved October 1, 2026.** The owner left the four questions
below to the implementer, who chose: Category learning settings moves to
the toolbar (question 1); the quiet Create rule with pills only where rules
exist (question 2); no header on the rule column (question 3); both dialogs
wait for APP-06 (question 4). Choose **Page → Payees** (or More →
Payees). URL parameters: `psel=0|1` (three payees selected), `pmenu=0|1`
(the selection menu), `punused=0|1` (unused payees only), `pempty=0|1`
(no match), and for screenshots `pfilter`, `phover`, `prow` (a row's
context menu).

Source traced for the brief: the page is `C/payees/ManagePayeesPage.tsx`
(the `Page` and its header), the toolbar, header row, empty state and the
Category learning settings button are in `C/payees/ManagePayees.tsx`, the
table in `C/payees/PayeeTable.tsx` (the shared `Table` with its default
32px rows; `rowHeight` is a prop, so no shared constant changes), each row
with its icons, rule button and context menu in `C/payees/PayeeTableRow.tsx`,
and the selection menu in `C/payees/PayeeMenu.tsx`.
`C/payees/PayeeRuleCountLabel.tsx` is shared with the mobile payee list
(`C/mobile/payees/PayeesListItem.tsx`), so its text stays as it is. The
Category Learning dialog (`C/payees/CategoryLearning.tsx`) and the merge
confirmation (`C/modals/`) are dialogs. E2E: `e2e/payees.test.ts` with
`e2e/page-models/payees-page.ts` (finds the filter by its placeholder,
`Filter payees...`, and rows by the `table` and `row` test ids).

What the drawing proposes (each item is presentation only):

| Surface     | Today                                                                           | Proposed                                                                                                                                                                                                                |
| ----------- | ------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Page title  | Regular-weight page header                                                      | The 28px bold title used on the account, report and schedule pages                                                                                                                                                      |
| Toolbar     | Bare text buttons (selection, unused payees); Category learning settings bottom | One toolbar above the table, as on Schedules: the selection button and Show unused payees as control buttons (the unused toggle shows as pressed while on), Category learning settings beside them, filter at the right |
| Table       | `tableBackground` container, 32px rows, sentence-case header                    | A Surface card with an Eyebrow header, hairline dividers and 44px rows; names in 500 weight; transfer payees in Secondary text with "Transfer:" in Faint                                                                |
| Row icons   | Favourite bookmark in text colour; learning-off bulb hard-coded `red`           | Bookmark in the accent; bulb in the warning pill colour (a theme role, so custom themes reach it); tooltip unchanged                                                                                                    |
| Rule button | Green notice button on every row ("Create rule →" / "N associated rules →")     | Rows with rules: an accent pill on the selection tint. Rows without: quiet Secondary text with the arrow, a hairline border on row hover. Same strings, same click and keyboard focus                                   |
| Selection   | Row highlight, checkbox shown on hover                                          | Same behaviour; selected rows on the selection tint, accent checkbox; while anything is selected every selectable row shows its checkbox                                                                                |
| Menus       | Selection menu and row context menu (shared `Menu`)                             | Unchanged content; they already follow the popover look                                                                                                                                                                 |
| Empty       | Italic "No payees" under the header                                             | Same string, centred in the card, not italic                                                                                                                                                                            |

Unchanged by design: every handler (rename, delete, favourite, merge,
category learning per payee and globally, view and create rule, select
all and range select), the filter's matching, the unused-payees list, the
sort order, transfer payees being read-only, keyboard navigation between
select, name and rule cells, and mobile.

Questions for the owner:

1. **Category learning settings in the toolbar:** move it from below the
   table into the toolbar (drawn), or keep it at the bottom?
2. **Rule button:** quiet "Create rule" with an accent pill only where rules
   exist (drawn), or the same pill on every row?
3. **Rule column header:** leave it blank (drawn; no new string), or label it
   "Rules" (an existing string)?
4. The **Category Learning dialog** and **merge confirmation**: leave them
   for APP-06 (the default, as APP-04 did for its other dialogs), or restyle
   the Category Learning dialog here since it sits in `C/payees/`?

| File                                         | Shows                                                |
| -------------------------------------------- | ---------------------------------------------------- |
| `shots/80-payees-dark-wide.png`              | Payees, dark, 1440×900, a row hovered                |
| `shots/81-payees-light-1000.png`             | Light, 1000×700, pane collapsed                      |
| `shots/82-payees-midnight-wide-selected.png` | Three payees selected, selection menu open, midnight |
| `shots/83-payees-custom-theme-wide.png`      | Custom theme through the fallback layer              |
| `shots/84-payees-unused-light-wide.png`      | Unused payees only, toggle pressed                   |
| `shots/85-payees-row-menu-dark-1000.png`     | A row's context menu                                 |
| `shots/86-payees-no-match-dark-wide.png`     | No matching payees                                   |

Regenerate with `node scripts/redesign-prototype-shots.cjs --app-05a`
(`PW_CHANNEL=msedge` uses the installed Edge).

## APP-05b: Rules proposal (October 1, 2026)

**Status: approved October 1, 2026.** The owner left the four questions
below to the implementer, who chose: Create new rule moves to the toolbar
(question 1); the desktop chips are restyled through an opt-in prop (question
2); the payee rules dialog gets the new rows and chips but keeps its own
layout and footer (question 3); the rule editor waits for APP-06 (question 4).
Choose **Page → Rules** (or More →
Rules). URL parameters: `rusel=0|1` (two rules selected), `ruempty=0|1` (no
match), and for screenshots `rufilter`, `ruhover`, `rumenu` (a row's context
menu).

Source traced for the brief: the page is `C/ManageRulesPage.tsx` (the `Page`
and its header). The intro sentence, filter, table container, empty state and
the Delete / Create new rule footer are in `C/ManageRules.tsx`, which the
payee rules dialog (`C/modals/ManageRulesModal.tsx`, `isModal`) shares. The
header row is `C/rules/RulesHeader.tsx`, the list `C/rules/RulesList.tsx`,
each row with its stage pill, split groups, Edit button and context menu
`C/rules/RuleRow.tsx`. The condition and action chips
(`C/rules/ConditionExpression.tsx`, `C/rules/ActionExpression.tsx`) are shared
with the mobile rules list (`C/mobile/rules/RulesListItem.tsx`), and
`C/rules/Value.tsx` with the filter chips (`C/filters/FilterExpression.tsx`),
so any change to them is an opt-in prop the desktop rows pass. The rule
editor (`C/rules/RuleEditor.tsx`) is a dialog. E2E: `e2e/rules.test.ts` with
`e2e/page-models/rules-page.ts` (finds the filter by `Filter rules...`, the
button by its name `Create new rule`, rows by the `table` and `row` test ids
and their chips as direct children of `conditions` and `actions`).

What the drawing proposes (each item is presentation only):

| Surface      | Today                                                                | Proposed                                                                                                                                                             |
| ------------ | -------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Page title   | Regular-weight page header; intro sentence beside the filter         | The 28px bold title; the intro sentence and Learn more under it in Secondary text                                                                                    |
| Toolbar      | Filter top right; Delete N rules and Create new rule below the table | One toolbar above the table: Create new rule (primary, plus icon, label kept at every width), Delete N rules beside it while rules are selected, filter at the right |
| Table        | `tableContainer`, sentence-case header, 15px row padding             | A Surface card with an Eyebrow header (Stage, Rule), hairline dividers, rows at least 44px with 10px padding; selected rows on the selection tint                    |
| Stage        | Purple selected-pill                                                 | Neutral pill (22px, radius 6)                                                                                                                                        |
| Chips        | `pillBackgroundLight` chips; field and value both purple             | Card Inset chips with a hairline; the field in text colour 600, the operator Secondary, the value in the accent 600, "and" Faint; amounts tabular                    |
| Arrow        | Text colour                                                          | Faint                                                                                                                                                                |
| Split groups | Thin bordered box, small Secondary label                             | Hairline box, radius 10, Eyebrow label ("Apply to all", "Split 1")                                                                                                   |
| Edit         | Bare button                                                          | Small control button (30px)                                                                                                                                          |
| Menus        | Row context menu (Edit, Delete unless linked to a schedule)          | Unchanged content; already the popover look                                                                                                                          |
| Empty        | Italic "No rules"                                                    | Same string, centred in the card, not italic                                                                                                                         |

Unchanged by design: every handler (create, edit, delete one, delete
selected and its schedule-linked warning), rule order, the filter's matching,
loading 100 then 50 more on scroll, select all and range select, hiding
completed schedules' rules, the strings, and mobile.

Questions for the owner:

1. **Create new rule in the toolbar** (drawn), or keep it with Delete below
   the table?
2. **Chips:** restyle the desktop chips as drawn (opt-in, mobile and filter
   chips untouched), or keep upstream's chips and change only the page around
   them?
3. **Payee rules dialog** (opened from a payee's rule button, same
   `ManageRules`): give it the card table and chips too but keep its footer
   (default), or leave the whole dialog for APP-06?
4. The **rule editor** dialog: leave it for APP-06 (the default, as APP-04
   and APP-05a did), or restyle it here?

| File                                        | Shows                                             |
| ------------------------------------------- | ------------------------------------------------- |
| `shots/87-rules-dark-wide.png`              | Rules, dark, 1440×900, a row hovered              |
| `shots/88-rules-light-1000.png`             | Light, 1000×700, pane collapsed                   |
| `shots/89-rules-midnight-wide-selected.png` | Two rules selected, Delete 2 rules, midnight      |
| `shots/90-rules-custom-theme-wide.png`      | Custom theme through the fallback layer           |
| `shots/91-rules-row-menu-dark-1000.png`     | A schedule-linked rule's context menu (Edit only) |
| `shots/92-rules-no-match-light-wide.png`    | No matching rules                                 |

Regenerate with `node scripts/redesign-prototype-shots.cjs --app-05b`
(`PW_CHANNEL=msedge` uses the installed Edge).

## APP-05c: Tags proposal (October 1, 2026)

**Status: approved October 1, 2026.** The owner chose the drawn option
for all four questions: Add New and the selection button at the left, the
filter and `…` at the right (question 1); the register's square tag shape
(question 2); quiet View Transactions (question 3); a filter with no match
keeps today's empty card (question 4). Choose **Page → Tags** (or More →
Tags). URL parameters: `tsel=0|1` (three tags selected), `tmenu=0|1` (the
selection menu), `tdots=0|1` (the page menu), `tadd=0|1` (the new-tag row),
`thidden=0|1` (hidden tags shown), `tempty=0|1` (no tags), and for
screenshots `tfilter`, `thover`, `trow` (a row's context menu).

Source traced for the brief: the page is `C/tags/ManageTagsPage.tsx` (the
`Page` and its header). The intro sentence, Add New, the filter, the
selection button, the page menu button, table container and empty state are
in `C/tags/ManageTags.tsx`. The header row is `C/tags/TagsHeader.tsx`, the
list `C/tags/TagsList.tsx` (the shared `Table`; row height is a prop, so no
shared constant changes), each row with its description cell, View
Transactions button and context menu `C/tags/TagRow.tsx`, the coloured tag
button that opens the colour picker `C/tags/TagEditor.tsx`, the new-tag row
`C/tags/TagCreationRow.tsx`, the selection menu `C/tags/SelectedTagsButton.tsx`
(through the shared `SelectedItemsButton` in `C/table.tsx`, which renders
nothing until a tag is selected) and the page menu `C/tags/TagsMenuButton.tsx`.
The tag colours come from `hooks/useTagCSS.ts`, shared with the register and
notes, so any shape change there is an option the tags page passes. None of
these components is used outside the page. Tests: `C/tags/ManageTags.test.tsx`
(UNIT; finds the row by its `data-test-id`, the new-tag row by `new-tag`, and
the Add and Cancel buttons by `add-button` and `close-button`). There is no
Tags E2E file and no Tags VRT.

What the drawing proposes (each item is presentation only):

| Surface           | Today                                                                               | Proposed                                                                                                                                                                    |
| ----------------- | ----------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Page title        | Regular-weight page header; intro sentence above the toolbar                        | The 28px bold title; the intro sentence under it in Secondary text, as on Rules                                                                                             |
| Toolbar           | Bare "Add New" at the left; filter, selection button and `…` menu at the right      | Add New as the primary button with a plus icon; "N Tags" beside it as a control button while tags are selected; filter, then `…` as a 34px icon control button at the right |
| Table             | `tableContainer`, sentence-case header, 32px rows                                   | A Surface card with an Eyebrow header (Tag, Description), hairline dividers, 44px rows; selected rows on the selection tint                                                 |
| Tag               | The tag's colour on a round pill (radius 16)                                        | Same colours and black/white text rule; the square shape the register uses (radius 4), so a tag looks the same on both pages                                                |
| Description       | Italic "No description" in light table text                                         | Same string in Faint, not italic; long text truncates                                                                                                                       |
| Hidden tags       | Tag and description at half opacity                                                 | Unchanged                                                                                                                                                                   |
| View Transactions | Green notice button on every row                                                    | Quiet Secondary text with the arrow, a hairline border on row hover (as Payees' Create rule). Same string, click and focus                                                  |
| New-tag row       | Two plain rows: inputs, then "Choose Color:", Cancel, Add                           | One Card Inset block at the top of the card: the two inputs as 30px fields, the colour preview, Cancel and Add (primary) as small buttons                                   |
| Menus             | Selection menu (Rename, Delete, Hide, Unhide with keys), `…` menu, row context menu | Unchanged content; they already follow the popover look                                                                                                                     |
| Empty             | Italic "No Tags"                                                                    | Same string, centred in the card, not italic                                                                                                                                |

Unchanged by design: every handler (create, rename, recolour, describe,
delete, hide, unhide, show hidden, discover, view transactions), the
filter's matching, sort order, select all and range select, the R/D/H/U
shortcuts, keyboard navigation between cells, the strings, and mobile.

Questions for the owner:

1. **Toolbar order:** Add New and the selection button at the left, filter
   and `…` at the right (drawn), or keep today's order with the selection
   button beside the filter?
2. **Tag shape:** the register's square pill (drawn), or keep today's round
   pill on this page?
3. **View Transactions:** quiet text that shows a border on row hover
   (drawn), or a pill on every row?
4. **No match:** today a filter that matches nothing leaves the card empty
   ("No Tags" shows only when there are no tags at all). Show "No Tags" in
   that case too (a small behaviour change), or keep it (default)?

| File                                       | Shows                                         |
| ------------------------------------------ | --------------------------------------------- |
| `shots/93-tags-dark-wide.png`              | Tags, dark, 1440×900, a row hovered           |
| `shots/94-tags-light-1000.png`             | Light, 1000×700, pane collapsed               |
| `shots/95-tags-midnight-wide-selected.png` | Three tags selected, selection menu, midnight |
| `shots/96-tags-custom-theme-wide.png`      | Custom theme through the fallback layer       |
| `shots/97-tags-new-tag-dark-1000.png`      | Adding a tag                                  |
| `shots/98-tags-hidden-menu-light-wide.png` | Hidden tags shown, the `…` menu open          |
| `shots/99-tags-row-menu-dark-1000.png`     | A row's context menu                          |
| `shots/100-tags-empty-light-wide.png`      | No tags                                       |

Regenerate with `node scripts/redesign-prototype-shots.cjs --app-05c`
(`PW_CHANNEL=msedge` uses the installed Edge).

## APP-05d: Settings proposal (October 1, 2026)

**Status: approved October 1, 2026.** The owner left the four questions
to the implementer, who chose the drawn option for each: the 720px column
(question 1), controls under a hairline (question 2), no section headings
(question 3) and Control buttons for the reveals (question 4). Choose **Page → Settings** (or
More → Settings). URL parameters: `sadv=0|1` (advanced settings shown and
scrolled to), `sexp=0|1` (experimental features listed), `sauto=0|1` (theme
follows the system, so the Light and Dark theme menus show), `sserver=0|1`
(a sync server: server version, Authentication method, encryption available,
Reset sync enabled) and `stmenu=theme` (the theme menu open).

Source traced for the brief: the page is `C/settings/index.tsx` (the `Page`
header, the 530px column, the narrow-only budget name and Switch file row,
`About` and `AdvancedAbout`). Every block is the shared `Setting` box in
`C/settings/UI.tsx`, which also holds `AdvancedToggle` (the "Show advanced
settings" link, the "Advanced Settings" heading, `#advanced` scrolling) and
`Column` (the bold label above each select). The blocks: `Themes.tsx` (theme
selects; the custom-theme installer `ThemeInstaller.tsx` and its
`ColorPalette.tsx` open inside this block), `Format.tsx`, `Currency.tsx`
(only with the currency feature flag), `LanguageSettings.tsx`,
`AuthSettings.tsx` (only with a server), `Encryption.tsx`,
`BudgetTypeSettings.tsx`, `Backups.tsx` (desktop app only), `Export.tsx`,
`Reset.tsx` (Reset budget cache, Reset sync), `RepairTransactions.tsx` and
`Experimental.tsx` (feature flag checkboxes). The selects are the shared
`Select`, the checkboxes the shared `forms` `Checkbox`, the links the shared
`Link` (`linkColor="purple"`). None of the settings components is used
outside the page; the shared ones are, so any change to them must be an
opt-in prop or a local style. Tests: `settings/Themes.test.tsx`,
`ThemeInstaller.test.tsx`, `AuthSettings.test.tsx` (UNIT);
`e2e/settings.test.ts` (page visuals in three themes, export) with page model
`e2e/page-models/settings-page.ts` (finds `data-testid` `settings`,
`advanced-settings`, `experimental-settings` and buttons by name; many other
E2E files enable experimental features through it); and
`e2e/settings.mobile.test.ts` (mobile visuals). **The same component renders
the mobile Settings screen**, so the restyle must be gated on
`isNarrowWidth` to keep mobile on the upstream look (plan §19.4).

What the drawing proposes (each item is presentation only):

| Surface             | Today                                                                     | Proposed                                                                                                                                        |
| ------------------- | ------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Page                | Regular-weight header; one 530px column (centred with a floating sidebar) | The 28px bold title; one 720px column at the page's left margin                                                                                 |
| Each setting        | `pillBackground` box, 4px radius, `pillBorderDark` border, 15px padding   | A Surface card **without** elevation (hairline, 18px radius, 18px 20px padding), 12px apart; text in Secondary, the bold lead term in Page Text |
| Controls            | Action under the text, no separator                                       | Under a hairline divider inside the card, in a row that wraps                                                                                   |
| Select labels       | 500-weight sentence-case label above each select                          | Eyebrow labels (Theme, Numbers, Dates…); same strings, CSS uppercase                                                                            |
| Selects and buttons | Upstream `Select` and normal buttons                                      | 32px Control style (9px radius, hairline, chevron); buttons the small Control button; disabled at 45%                                           |
| Checkboxes          | Upstream checkbox                                                         | The redesign checkbox (rounded, Actual Purple when on), label in Page Text                                                                      |
| About               | Version lines in a two-column grid; "You're up to date!" in green 600     | The grid on Card Inset with the values at 600 (tabular); "You're up to date!" as a positive pill; Release Notes as a link                       |
| IDs (advanced)      | Text lines                                                                | The two ID lines on Card Inset                                                                                                                  |
| Show advanced       | Green text link                                                           | A Control button with a chevron; "Advanced Settings" heading at Headline (18px/700)                                                             |
| Experimental        | Green "I understand the risks…" link; checkbox list                       | The link as a Control button; the list unchanged in content, "(give feedback)" in the link colour, the deprecated note in Pill Warning Text     |
| Status text         | `noticeText`, `warningText`, `errorText`                                  | Pill Positive / Warning / Negative Text (repair results, export warnings, OpenID warnings, encryption on)                                       |
| Links               | `pageTextPositive` (purple)                                               | Unchanged colour; 600 weight, no underline (as the details panel's link)                                                                        |
| Theme installer     | Catalogue and CSS box inside the Themes block                             | Unchanged until APP-06; it sits inside the new card                                                                                             |
| Narrow / mobile     | Upstream                                                                  | Unchanged (upstream look below the narrow breakpoint)                                                                                           |

Unchanged by design: every handler and preference write (theme, dark theme,
custom themes, formats, currency, language, OpenID, encryption, budget type,
export, reset cache, reset sync, repair, feature flags, update
notification), the order of the blocks, which blocks show when, the
`#advanced` link, every string, test id and accessible name, and mobile.

Questions for the owner:

1. **Column:** 720px at the page's left margin (drawn), or keep today's
   530px column?
2. **Controls:** under a hairline inside each card (drawn), or text on the
   left and controls on the right?
3. **Grouping:** keep one list of cards in today's order (drawn; no new
   strings), or add section headings (for example General, Budget file,
   Advanced), which adds new translatable strings?
4. **Advanced and experimental reveals:** Control buttons (drawn), or keep
   the green text links?

| File                                              | Shows                                                     |
| ------------------------------------------------- | --------------------------------------------------------- |
| `shots/101-settings-dark-wide.png`                | Settings, dark, 1440×900, no server                       |
| `shots/102-settings-light-1000.png`               | Light, 1000×700, pane collapsed                           |
| `shots/103-settings-midnight-wide-theme-menu.png` | The theme menu open, midnight                             |
| `shots/104-settings-custom-theme-wide.png`        | Custom theme through the fallback layer                   |
| `shots/105-settings-advanced-light-wide.png`      | Advanced settings shown (IDs, resets, repair)             |
| `shots/106-settings-experimental-dark-1000.png`   | Experimental features listed                              |
| `shots/107-settings-server-auto-light-wide.png`   | With a server, theme following the system (three selects) |

Regenerate with `node scripts/redesign-prototype-shots.cjs --app-05d`
(`PW_CHANNEL=msedge` uses the installed Edge).

## APP-06a: shared dialog frame proposal (October 1, 2026)

**Status: approved October 1, 2026.** The owner approved the popover
shadow (question 1) and left the other three to the implementer, who chose
the drawn option for each: left-aligned Headline title (question 2), the
`scrim` backdrop (question 3) and upstream buttons inside dialogs for now
(question 4). Choose any page,
then **App dialog** in the prototype controls (Confirm, Close account, New
group, Loading); **Frame → Today** draws today's frame over the same
contents for comparison. URL parameters: `dlg=confirm|close|group|loading`,
`dlgold=0|1`, `dlgx=hover|focus` (the close button's state). The "Today"
frame is an approximation in the prototype's palette, not a screenshot of
the app.

Source traced for the brief: every desktop and mobile dialog renders inside
`Modal` in `C/common/Modal.tsx` (react-aria `ModalOverlay` / `Modal` /
`Dialog`): the backdrop (`blur(1px) brightness(0.9)`, or 40% black when
narrow), the container (`modalBackground`, 6px radius, 10px padding,
`shadowLarge`, min width 512px, max 90vw and 90% of the viewport height),
the `isLoading` cover (`pageBackground` with `AnimatedLoading`) and the open
animation. The same file holds `ModalHeader` (a 60px `h1` row with the title
centred and `leftContent` / `rightContent` absolutely placed), `ModalTitle`
(25px/700, optionally editable or shrink-to-fit), `ModalCloseButton` (a bare
button with a 10px ✕) and `ModalButtons` (a row with a 30px top margin). 80
files use `ModalHeader` and 12 use `ModalButtons`; most dialogs lay out their
own Cancel / confirm buttons with the shared `Button`. The mobile menus
(`EnvelopeBudgetMenuModal`, `AccountMenuModal`, the autocomplete modals and
others) use the same frame, so the restyle must be gated on `isNarrowWidth`
to keep mobile on the upstream look (plan §19.4). No unit test covers the
frame; E2E page models find dialogs by `data-testid="<name>-modal"` and by
role and accessible name (`Close`), which stay. Dialogs appear in many VRT
files (accounts, transactions, schedules, payees, rules, budget, onboarding),
so 06a will change snapshots across several suites.

What the drawing proposes (frame only; each item is presentation only):

| Surface         | Today                                                  | Proposed                                                                                         |
| --------------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------ |
| Backdrop        | `blur(1px) brightness(0.9)`                            | The `scrim` role (already behind the details-panel overlay), no blur                             |
| Container       | `modalBackground`, 6px radius, no border, 10px padding | Surface card: `cardBackground`, Card Hairline border, 18px radius, 18px 22px 20px padding        |
| Elevation       | `shadowLarge` (hard-coded black)                       | `popoverShadow`, as menus and popovers (needs owner approval: the Approved-Depth-Only Rule)      |
| Title           | 25px/700, centred in a 60px row                        | Headline (18px/700, −0.3px), left-aligned, one line with ellipsis; `leftContent` sits before it  |
| Close button    | Bare button, 10px ✕                                    | 30px icon button, 9px radius, Secondary icon, Row Hover wash on hover, 2px focus ring            |
| Button row      | `ModalButtons` 30px above                              | 20px above; the buttons themselves unchanged                                                     |
| Loading cover   | `pageBackground`, square corners over a rounded box    | `cardBackground` with the card's radius; spinner in Secondary; spins only without reduced motion |
| Contents        | Per dialog                                             | Unchanged: text, fields, upstream buttons and each dialog's own layout                           |
| Narrow / mobile | Upstream                                               | Unchanged                                                                                        |

Unchanged by design: every dialog's contents, strings, handlers, focus
management (`InitialFocus`, `focusButton`), Escape and click-outside
closing, the hotkey scope, `data-testid`s, accessible names, the modal stack
and the open animation's timing. The rule editor, Category Learning, the
payee merge confirmation and the Find / link schedules dialogs get the new
frame here but keep their inner layouts until APP-06e.

Questions for the owner:

1. **Elevation:** give dialogs the popover shadow (drawn), or a hairline
   only? (Dialogs are not on the approved depth list yet.)
2. **Title:** left-aligned Headline beside the close button (drawn), or
   keep the title centred at a smaller size?
3. **Backdrop:** the `scrim` dim without blur (drawn), or keep today's blur
   and brightness?
4. **Buttons inside dialogs:** keep the upstream normal / primary buttons in
   06a (drawn; the frame alone changes 80 files' look), or also move dialog
   buttons to the Control style later, in APP-06e?

| File                                             | Shows                                                 |
| ------------------------------------------------ | ----------------------------------------------------- |
| `shots/108-dialog-close-dark-wide.png`           | Close Account with a transfer error, dark, 1440×900   |
| `shots/109-dialog-close-today-dark-wide.png`     | The same dialog in today's frame                      |
| `shots/110-dialog-confirm-light-1000.png`        | Confirm Delete over the register, light, 1000×700     |
| `shots/111-dialog-confirm-today-light-1000.png`  | The same dialog in today's frame                      |
| `shots/112-dialog-group-midnight-wide-focus.png` | New Category Group, close button focused, midnight    |
| `shots/113-dialog-loading-light-wide.png`        | The loading cover (Close Account while saving), light |
| `shots/114-dialog-close-custom-theme-wide.png`   | Close Account in the custom theme                     |

Regenerate with `node scripts/redesign-prototype-shots.cjs --app-06a`
(`PW_CHANNEL=msedge` uses the installed Edge).

## APP-06b: menus and popovers proposal (October 2, 2026)

**Status: approved October 2, 2026.** The owner chose the drawn option for
all four questions (12px radius, Row Hover wash, key caps, tooltips left
for later). Choose any page, then **Menu** in
the prototype controls (Selection, Help, Toggles, Date picker); **Menu
frame → Today** draws today's frame over the same contents; **First row**
shows the hover and keyboard-focus states. URL parameters:
`mnu=select|help|toggles|date`, `mnuold=0|1`, `mnuhl=hover|focus`. The
"Today" frame is an approximation in the prototype's palette, not a
screenshot of the app.

Source traced for the brief: every desktop popover renders inside
`Popover` in `L/Popover.tsx` (react-aria), whose frame is `styles.tooltip`:
`tooltipBackground`, a 2px `tooltipBorder`, 4px radius, `shadowLarge`
(hard-coded black). About 40 desktop files use it (60 uses), and not only
for menus: date pickers, autocomplete, the month picker, budget cell menus,
filters, report menus, notes and the save-report form. `Menu` in
`L/Menu.tsx` draws the rows: bare buttons with 10px padding,
`menuItemBackgroundHover` on hover, `Menu.label` (11px uppercase,
`menuItemTextHeader`), `Menu.line` (`menuBorder`), optional 10px icons,
upstream `Toggle`s and a 10px keybinding in `menuKeybindingText`. About 50
files use `Menu`, including the mobile menu dialogs, so 06b is gated on
`isNarrowWidth` like 06a. `C/ContextMenu.tsx` is a 200px `Popover` around a
`Menu`. The Accounts and More menus (NAV-01) already pass `menuPanelStyle`
(12px radius, 6px padding, 32px rows with 8px radius); 06b makes that the
default and keeps their rows. Tooltips (`L/Tooltip.tsx`) share
`styles.tooltip` but are not menus; they stay out of 06b unless the owner
says otherwise.

What the drawing proposes (presentation only):

| Surface         | Today                                                | Proposed                                                                                    |
| --------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Popover frame   | `tooltipBackground`, 2px `tooltipBorder`, 4px radius | `cardBackground`, 1px Card Hairline, 12px radius (as the NAV-01 menus and Schedules ⋯ menu) |
| Elevation       | `shadowLarge`                                        | `popoverShadow` (already approved for menus and popovers)                                   |
| Menu padding    | none                                                 | 6px inside the frame, so row hovers sit inset                                               |
| Rows            | 10px padding, square, `menuItemBackgroundHover`      | 32px min height, 0 10px padding, 8px radius, 13px, Row Hover wash (`tableRowHover`)         |
| Keyboard focus  | hover colour only                                    | the shared 2px focus ring, inset (`outlineOffset: -2`)                                      |
| Section labels  | 11px uppercase, `menuItemTextHeader`, 3px 9px        | Eyebrow: 11px/600 uppercase, 0.06em tracking, 10px 10px 4px                                 |
| Dividers        | `menuBorder`, 3px 0                                  | Card Hairline, 6px 4px                                                                      |
| Keybindings     | 10px text, `menuKeybindingText`                      | an 18px key cap: `cardInset`, 5px radius, 11px/600 Secondary text                           |
| Toggles         | upstream `Toggle`                                    | unchanged                                                                                   |
| Content         | per popover (date picker, notes, forms)              | unchanged; only the frame around it changes                                                 |
| Narrow / mobile | upstream                                             | unchanged                                                                                   |

Unchanged by design: items, strings, order, handlers, `role="menu"` and
arrow-key / Enter navigation, placement, offsets, `isNonModal`, widths that
callers pass, test ids and accessible names.

Questions for the owner:

1. **Radius:** 12px (drawn; matches the menus already shipped in NAV-01 and
   Schedules), or 16px like the prototype's budget popovers?
2. **Row hover:** the Row Hover wash (drawn; matches tables and the dialog
   close button), or keep the menu-specific `menuItemBackgroundHover`?
3. **Keybindings:** a small key cap (drawn), or plain Secondary text?
4. **Tooltips:** leave `Tooltip` on today's look (drawn), or give it the
   same frame in 06b?

| File                                             | Shows                                                        |
| ------------------------------------------------ | ------------------------------------------------------------ |
| `shots/115-menu-select-dark-wide-hover.png`      | The transaction selection menu, first row hovered, dark      |
| `shots/116-menu-select-today-dark-wide.png`      | The same menu in today's frame                               |
| `shots/117-menu-help-light-1000.png`             | The Help menu, light, 1000×700                               |
| `shots/118-menu-help-today-light-1000.png`       | The same menu in today's frame                               |
| `shots/119-menu-toggles-midnight-wide-focus.png` | A report menu with toggles, first row keyboard-focused       |
| `shots/120-popover-date-light-wide.png`          | The date picker in the new frame (calendar unchanged), light |
| `shots/121-popover-date-today-light-wide.png`    | The same date picker in today's frame                        |
| `shots/122-menu-select-custom-theme-wide.png`    | The selection menu in the custom theme                       |

Regenerate with `node scripts/redesign-prototype-shots.cjs --app-06b`
(`PW_CHANNEL=msedge` uses the installed Edge).

## APP-06c: toasts proposal (October 2, 2026)

**Status: approved October 2, 2026.** The owner chose the drawn option for
all three questions (popover shadow, neutral card with a status icon, a
check for `message`). Choose any page, then **Toast** in
the prototype controls (Update, Saved, Warning, Error, Stack of 3); **Toast
look → Today** draws today's toast with the same text; **Toast state** shows
the action button hovered or the close button keyboard-focused. URL
parameters: `tst=update|saved|warning|error|stack`, `tstold=0|1`,
`tsthl=hover|focus`. The strings are real upstream notifications. "Today" is
an approximation in the prototype's palette, not a screenshot of the app.

Source traced for the brief: every toast renders in `Notifications` in
`C/Notifications.tsx`, mounted by `C/FinancesApp.tsx` and
`C/manager/ManagementApp.tsx` (the budget list), with `C/reports/Overview.tsx`
only setting the inset. A toast is `role="alert"` with a type of `message`
(used for successes and the update prompts), `warning` or `error`; an optional
bold title; a message with Markdown-style links (external, or `#action`
links); an optional button; optional `pre` text (monospace); and a close
button. Today it is tinted by type (`noticeBackgroundLight`,
`warningBackground`, `errorBackground`), has a 3px coloured top border, an 8px
radius, `shadowLarge`, and text in the type's dark colour. The stack shows the
newest three, each older one 20px higher and 5% smaller; non-sticky toasts
close after 6.5s; touch and mouse swipe dismiss. Narrow widths (the mobile
screens) use the same component, so 06c is gated on `isNarrowWidth` like 06a
and 06b. No E2E page model or unit test refers to toasts.

What the drawing proposes (presentation only):

| Surface       | Today                                            | Proposed                                                                                                          |
| ------------- | ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------- |
| Frame         | Status tint, 3px coloured top border, 8px radius | `cardBackground`, 1px `cardBorder`, 12px radius (as menus)                                                        |
| Elevation     | `shadowLarge`                                    | `popoverShadow` (needs approval: toasts are not on the approved-depth list)                                       |
| Status signal | Background and text colour only                  | A 24px round icon in the pill tone: check (`message`), "!" (`warning`), × (`error`); the frame stays neutral      |
| Title         | 13px/700 in the status colour                    | Title: 13.5px/600 Page Text                                                                                       |
| Message       | 13px in the status colour, links `currentColor`  | 13px Secondary text, 1.45 line height; links Page Text, underlined                                                |
| Action button | Bare, 1px status-colour border, 4px radius       | Control: Surface, Card Hairline, 9px radius, 30px tall, 13px/600 Page Text, Row Hover on hover, shared focus ring |
| Close button  | 10px ×, 70% opacity, no hover                    | 28px icon button, 8px radius, Secondary ×, Row Hover on hover, shared focus ring (as the dialog close button)     |
| `pre` text    | `rgba(0,0,0,.05)`, 4px radius                    | Card Inset, 8px radius, Page Text                                                                                 |
| Loading cover | `tableBackground`                                | Surface White with the toast's radius, as the dialog cover (not drawn)                                            |
| Narrow/mobile | upstream                                         | unchanged                                                                                                         |

Unchanged by design: text, types, `role="alert"`, the close button's
accessible name, placement (bottom right, 400px wide, the inset callers set),
the three-deep stack and its offsets, timing, swipe-to-dismiss, link and button
handlers, and the spinner on the button while its action runs.

Questions for the owner:

1. **Shadow:** give toasts the Popover shadow (drawn), or a hairline only?
   They float over the page like a popover, so the drawing treats them as one.
2. **Status signal:** a neutral card with a coloured icon (drawn), or keep a
   tinted card? The 3px top stripe goes either way (DESIGN.md allows no
   coloured edge thicker than 1px except the selected-row bar).
3. **`message` icon:** a check for every `message` toast (drawn; nearly all are
   successes or "update available"), or a neutral "i"?

| File                                                | Shows                                                       |
| --------------------------------------------------- | ----------------------------------------------------------- |
| `shots/123-toast-update-light-wide.png`             | The update prompt with its button, light                    |
| `shots/124-toast-update-today-light-wide.png`       | The same toast as it looks today                            |
| `shots/125-toast-warning-dark-wide.png`             | The out-of-sync warning with a link and Repair button, dark |
| `shots/126-toast-warning-today-dark-wide.png`       | The same toast today                                        |
| `shots/127-toast-error-midnight-1000.png`           | An error with `pre` text, midnight, 1000×700                |
| `shots/128-toast-error-today-midnight-1000.png`     | The same toast today                                        |
| `shots/129-toast-stack-light-wide.png`              | Three toasts stacked (upstream offsets), light              |
| `shots/130-toast-saved-custom-theme-wide-focus.png` | A one-line success, close button focused, custom theme      |

Regenerate with `node scripts/redesign-prototype-shots.cjs --app-06c`
(`PW_CHANNEL=msedge` uses the installed Edge).

## APP-06d: loading, error and empty states proposal (October 2, 2026)

**Status: approved October 2, 2026.** The owner chose the drawn option for
both questions and left the rest to the implementer. Choose any page, then
**State** in the prototype controls (Fatal error, Loading error, Section
error, Page loading, Budget loading, First account, No transactions);
**State look → Today** draws today's version with the same text; **Error
details** shows the fatal error's stack. URL parameters:
`sst=fatal|lazy|feature|loading|appload|firstacct|notx`, `sstold=0|1`,
`sststack=0|1`. Strings are upstream; the error message and stack are
examples. "Today" is an approximation in the prototype's palette, not a
screenshot of the app. The first-account drawing sits under a sample account
header; in the app it shows on All accounts when there are no accounts.

Source traced for the brief (the backlog's list, rebuilt October 2):

- `C/FatalError.tsx`: the app-level error dialog (`App.tsx`), inside the
  APP-06a frame, not dismissable. Three bodies (UI error, lazy-load error,
  app-init failures such as IndexedDB or `SharedArrayBuffer`), a "Restart
  app" button, and a "Show Error" link that reveals the stack. Covered by
  `FatalError.test.tsx`.
- `C/FeatureErrorFallback.tsx`: the error boundary fallback for every route
  in `FinancesApp.tsx`, the budget table, the account page, rules, reports
  and the dialog body in `Modal.tsx`. Red title, red monospace message, "Try
  again".
- Loading: `C/reports/LoadingIndicator.tsx` (reports, account balance
  graph), the identical copy inside `C/util/LoadComponent.tsx` (lazy routes)
  and `C/AppBackground.tsx` (budget open/close/download text over the
  background). 18px message, 25px spinner.
- Empty: `C/accounts/AccountEmptyMessage.tsx` (no accounts yet) and the
  register's italic "No transactions" in `C/accounts/Account.tsx`. Other
  desktop lists already use the APP-04/05 empty line (13px Secondary, 40px
  padding).

What the drawing proposes (presentation only, desktop only; narrow widths
keep upstream as in 06a – c):

| Surface           | Today                                                                                                 | Proposed                                                                                                                                                                                                              |
| ----------------- | ----------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fatal error body  | 15px text; normal "Restart app" button in its own line; 11px purple "Show Error" link; unstyled stack | Dialog body text (14px, Page Text); a button row with "Show Error" (12.5px Secondary, underlined) on the left and "Restart app" as primary on the right; stack on Card Inset, 8px radius, monospace, scrolls at 140px |
| Fatal error links | Accent                                                                                                | Page Text, underlined (as toasts)                                                                                                                                                                                     |
| Section error     | Red 15px title, red monospace message, normal button                                                  | 40px round "!" in the negative pill tone; 15px/600 Page Text title; message on Card Inset, 8px radius, Secondary; "Try again" as a control button (as the toast action)                                               |
| Loading           | 18px Page Text message, 25px spinner, 40px gap                                                        | 13.5px/500 Secondary message, 20px Secondary spinner, 12px gap; same fade-in delay                                                                                                                                    |
| Budget loading    | Same as loading, over the app background                                                              | Same as the proposed loading; slide-in unchanged                                                                                                                                                                      |
| First account     | 15px Page Text, bold first sentence inline, table border                                              | First sentence on its own line, 16px/600 Page Text; body 13.5px Secondary, 420px wide; footer 12px Secondary; no extra border                                                                                         |
| No transactions   | Italic Page Text, 20px from the header                                                                | The shared empty line: 13px Secondary, 40px padding, not italic                                                                                                                                                       |

Unchanged by design: every string, the dialog frame (06a), which errors show
which body, the `SharedArrayBuffer` override flow, `role`s, handlers ("Restart
app", "Try again", "Add account"), the loading fade-in delay and the budget
loading slide.

Questions for the owner:

1. **Section error tone:** a neutral title with a red icon (drawn, as toasts),
   or keep red text?
2. **Fatal error buttons:** "Restart app" as the primary button at the right
   of a button row, with "Show Error" at the left (drawn), or keep today's
   stacked layout?

| File                                                   | Shows                                               |
| ------------------------------------------------------ | --------------------------------------------------- |
| `shots/131-state-fatal-light-wide-details.png`         | Fatal error with the stack shown, light             |
| `shots/132-state-fatal-today-light-wide-details.png`   | The same dialog today                               |
| `shots/133-state-lazy-dark-1000.png`                   | Loading error, dark, 1000×700                       |
| `shots/134-state-section-error-dark-wide.png`          | Section error replacing the Budget page, dark       |
| `shots/135-state-section-error-today-dark-wide.png`    | The same today                                      |
| `shots/136-state-page-loading-midnight-1000.png`       | "Loading reports...", midnight, 1000×700            |
| `shots/137-state-page-loading-today-midnight-1000.png` | The same today                                      |
| `shots/138-state-budget-loading-light-wide.png`        | "Opening last budget..." over the background, light |
| `shots/139-state-budget-loading-today-light-wide.png`  | The same today                                      |
| `shots/140-state-first-account-light-wide.png`         | The first-account empty state, light                |
| `shots/141-state-first-account-today-light-wide.png`   | The same today                                      |
| `shots/142-state-no-transactions-dark-wide.png`        | The empty register line, dark                       |
| `shots/143-state-no-transactions-today-dark-wide.png`  | The same today                                      |
| `shots/144-state-section-error-custom-theme-wide.png`  | Section error, custom theme                         |

Regenerate with `node scripts/redesign-prototype-shots.cjs --app-06d`
(`PW_CHANNEL=msedge` uses the installed Edge).

## APP-06e: dialogs with their own layouts proposal (October 2, 2026)

**Status: approved October 2, 2026.** The owner chose the drawn option for
all four questions (Control buttons, Page Text field names, "Do nothing" at
the left, `MergeUnusedPayeesModal` included). Choose any page, then
**Own-layout dialog**
in the prototype controls (Rule, Rule with splits, Category Learning,
Confirm Merge, Merge unused, Found Schedules, Link schedule); **Dialog look
→ Today** draws today's contents in today's frame. URL parameters:
`odlg=rule|rulesplit|learn|merge|unused|discover|link`, `odlgold=0|1`.
Strings are upstream; rows are fictional. "Today" is an approximation in the
prototype's palette, not a screenshot of the app.

Source traced for the brief (the backlog's list, rebuilt October 2):

- `C/modals/EditRuleModal.tsx` wraps `C/rules/RuleEditor.tsx` (900px wide,
  80vh). The editor is also used full-screen by
  `C/mobile/rules/MobileRuleEditPage.tsx`, so its restyle must be opt-in from
  the desktop dialog (as APP-05b did for rule rows). It draws the stage
  buttons (`StageButton`, bare with `pillBackgroundSelected`), the
  conditions and actions as `styles.editorPill` rows (pill background, 4px
  radius) with green (`pageTextPositive`) field selects, small − / +
  buttons, split groups in a 1px `tableBorder` box with "Apply to all" /
  "Split N" small text, upstream "Add condition", "Add action" and split
  buttons, the matching transactions (`SimpleTransactionsTable`, its own
  border) with "Apply actions (n)", and Delete / Cancel / Save. `FieldSelect`
  and `OpSelect` are also imported by the filter menu, the Summary report
  and the schedule form, so any colour change is passed in, not changed at
  the source.
- `C/payees/CategoryLearning.tsx`: two paragraphs, a purple "Learn more" link
  and a left-aligned toggle button.
- `C/modals/ConfirmPayeesMergeModal.tsx`: payees in 6px `tableBorder` boxes,
  a 20px arrow, the target on `tableRowBackgroundHighlight`, an `Information`
  alert, Cancel / Merge. No close button (unchanged).
- **Added on rebuild:** `C/modals/MergeUnusedPayeesModal.tsx`, the other
  payee merge dialog (shown after renaming a payee to an existing one): no
  title, payee names in green, an `Information` alert, a centred checkbox,
  and Merge / Merge and edit rule / Do nothing, primary first.
- `C/schedules/DiscoverSchedules.tsx` (Found Schedules, 850×650): two
  paragraphs, an upstream table (43px rows, `tableBorder`), "Create
  schedules".
- `C/schedules/ScheduleLink.tsx` (Link schedule, 800px): one row with the
  sentence, the search and "Create New", then `SchedulesTable` in `minimal`
  mode without the APP-04 card look (`isCard`).
- Already done elsewhere: the schedule dialog (APP-04), the payee rules
  dialog (`ManageRulesModal`, APP-05b), the frame (APP-06a).

What the drawing proposes (presentation only, desktop only; narrow widths
and the mobile rule page keep upstream):

| Surface                    | Today                                                        | Proposed                                                                                                                                      |
| -------------------------- | ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Dialog buttons (all six)   | Upstream normal / primary, 4px radius                        | Control buttons (30px, 9px radius, 13px/600; primary in the accent), as the toast action and "Try again"                                      |
| Rule: stage                | Bare buttons, selected on `pillBackgroundSelected`           | A segmented control (as the schedule dialog's Linked / Find matching); info icon Faint                                                        |
| Rule: sections             | Stage row, a bordered scroll area, the table, the buttons    | Hairline-separated sections; the footer (Delete left, Cancel / Save right) stays in view, as in the schedule dialog                           |
| Rule: lead lines           | 13px Page Text; "all/any" a green bare select                | 13.5px/600 Page Text; "all/any" a small control select                                                                                        |
| Rule: condition and action | `editorPill` row: pill background, green field, 4px radius   | Card Inset row, Card Hairline, 10px radius, 44px min; field 600 Page Text, operator Secondary, value a 30px control input (as the rule chips) |
| Rule: − / +                | Small icons, 7px padding                                     | 28px icon buttons, Secondary icon, Row Hover on hover, focus ring                                                                             |
| Rule: splits               | 1px `tableBorder` box, 5px radius, "Split 1" small text      | Hairline box, 12px radius, Eyebrow label ("APPLY TO ALL", "SPLIT 1"), 24px delete icon button                                                 |
| Rule: transactions         | Secondary sentence, bordered table, 6px top corners          | Same sentence; table in a hairline card (12px radius) with Eyebrow headers                                                                    |
| Category Learning          | 13px Page Text, purple link, button under the text           | 13.5px Secondary text with the bold term in Page Text; link Page Text, underlined; button at the right of a button row                        |
| Confirm Merge              | Separate 6px boxes, 20px arrow, highlighted target, alert    | One hairline list (12px radius); 18px Faint arrow; target on the selection tint with the selection border, 600; note as Secondary text + icon |
| Merge unused               | Green payee names, alert, centred checkbox, primary first    | Names 600 Page Text; note as Secondary text + icon; checkbox start-aligned; "Do nothing" left, Merge primary at the right                     |
| Found Schedules            | Upstream table, fixed 650px height                           | Hairline card table, Eyebrow headers, 44px rows, payee 600, account Secondary, selection tint; height fits the rows up to 650px               |
| Link schedule              | Sentence, search and "Create New" on one row; upstream table | Sentence on its own line (Secondary); search left, "Create New" (primary, plus) right; table takes the APP-04 card look (`isCard`)            |

Unchanged by design: every string, field and operator list, handler,
validation and error text, focus (`InitialFocus`, `focusButton`), test ids
(`editor-row`, `condition-list`, `action-split-list`, `add-split-transactions`,
`field-select`, `conditions-op`), accessible names ("Delete entry", "Add
entry", "Delete split"), the stage tooltip, which buttons show when, and the
mobile rule page.

Questions for the owner:

1. **Dialog buttons:** move these dialogs' buttons to the Control style
   (drawn), or keep upstream buttons until a pass covers every dialog?
   (APP-06a left this to 06e; the schedule dialog kept upstream buttons.)
2. **Rule field colour:** field names in Page Text 600, matching the rule
   chips on the Rules page (drawn), or keep the green field selects?
3. **Merge unused button order:** "Do nothing" at the left and Merge
   (primary) at the right like the other dialogs (drawn), or keep upstream's
   primary-first order?
4. **Scope:** include `MergeUnusedPayeesModal` in 06e (drawn; found on
   rebuild), or leave it upstream?

| File                                                    | Shows                                                 |
| ------------------------------------------------------- | ----------------------------------------------------- |
| `shots/145-dialog-rule-light-wide.png`                  | The rule editor, light                                |
| `shots/146-dialog-rule-today-light-wide.png`            | The same rule today                                   |
| `shots/147-dialog-rule-splits-dark-wide.png`            | A rule with split actions, dark                       |
| `shots/148-dialog-rule-splits-today-dark-wide.png`      | The same today                                        |
| `shots/149-dialog-learning-midnight-1000.png`           | Category Learning, midnight, 1000×700                 |
| `shots/150-dialog-learning-today-midnight-1000.png`     | The same today                                        |
| `shots/151-dialog-merge-light-wide.png`                 | Confirm Merge, light                                  |
| `shots/152-dialog-merge-today-light-wide.png`           | The same today                                        |
| `shots/153-dialog-merge-unused-dark-wide.png`           | Merge unused payees, dark                             |
| `shots/154-dialog-merge-unused-today-dark-wide.png`     | The same today                                        |
| `shots/155-dialog-found-schedules-light-wide.png`       | Found Schedules with two selected, light              |
| `shots/156-dialog-found-schedules-today-light-wide.png` | The same today                                        |
| `shots/157-dialog-link-schedule-dark-wide.png`          | Link schedule over the register, search focused, dark |
| `shots/158-dialog-link-schedule-today-dark-wide.png`    | The same today                                        |
| `shots/159-dialog-rule-custom-theme-wide.png`           | The rule editor, custom theme                         |
| `shots/160-dialog-rule-midnight-1000.png`               | The rule editor, midnight, 1000×700                   |

Regenerate with `node scripts/redesign-prototype-shots.cjs --app-06e`
(`PW_CHANNEL=msedge` uses the installed Edge).

## APP-06f: accessibility leftovers proposal (October 2, 2026)

**Status: drawn for approval.** On **Settings**, choose **Theme installer**
(Open, Loading, Error, No catalog) and **Installer look → Today**; on
**Payees**, **Rules** or **Tags**, choose **Table focus → Keyboard**. URL
parameters: `sinst=open|loading|error|nocat`, `sinstold=0|1`,
`tblfocus=0|1`. Strings are upstream; catalog names, owners and colours are
fictional. "Today" is an approximation in the prototype's palette.

Source traced for the brief (the backlog's list, rebuilt October 2):

- **Table container** (`C/table.tsx`, `Table`): the outer `View` takes
  `tabIndex={0}` and the keyboard navigator, with `outline: 'none'`, so a
  Tab stop on it shows nothing (verification.md, Schedules and Payees
  keyboard). Used by Payees, Rules, Tags, Schedules, Found Schedules,
  Link schedule, the linked-accounts dialog, the user directory and the
  rule editor's transactions table; the register uses its own table.
- **`CellButton`** (`C/table.tsx`): a focusable `div` with no role, so
  screen readers don't announce it as a button (found in APP-05c). Space
  and `x` select on key down; Enter moves down a row (kept). Users: Tags'
  View Transactions, Payees' rule button, the register's cleared status,
  split toggle and parent payee, and `SelectCell`'s checkbox (Payees,
  Rules, user directory). The cleared status and `SelectCell` are
  icon-only, so they have no accessible name either.
- **Custom-theme installer** (`C/settings/ThemeInstaller.tsx`, opened from
  the Themes setting by choosing a custom theme): a `tableBackground` box
  with a `tableBorder` border and 8px radius; 14px/600 title and a bare
  "Close"; subdued "Choose from catalog:"; a 300px virtualised grid of
  square tiles three to a row (2px `tableBorder`, 6px radius; active in
  the primary colour on `tableRowBackgroundHover`; error on
  `errorBackground`; a loading cover); "Additional CSS overrides:", a
  textarea and a normal "Apply"; red error text. APP-05d left it upstream.

What the drawing proposes (presentation and semantics only, desktop only):

| Surface             | Today                                             | Proposed                                                                                                                                                                                         |
| ------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Table container     | No focus sign                                     | On keyboard focus only (`:focus-visible`), a 2px Selection Border ring drawn inside the table's edge, following its radius                                                                       |
| `CellButton`        | `div`, no role                                    | `role="button"`, `aria-disabled` when disabled; no visual change                                                                                                                                 |
| `SelectCell`        | `div`, no role, no name                           | `role="checkbox"` with `aria-checked`; no visual change                                                                                                                                          |
| Icon-only cells     | No name                                           | The cleared status and selection checkboxes get a name (see question 2)                                                                                                                          |
| Installer panel     | Table box, 8px radius, border                     | Card Inset panel (12px radius, no border) under the Themes controls; title 13.5px/600                                                                                                            |
| Installer labels    | Subdued 13px                                      | Eyebrow ("CHOOSE FROM CATALOG:", "ADDITIONAL CSS OVERRIDES:"); strings unchanged, case is CSS                                                                                                    |
| Close, Apply        | Bare "Close", normal "Apply"                      | Control buttons (30px, 9px radius, 13px/600)                                                                                                                                                     |
| Catalog tiles       | 2px border, 6px radius; active in the primary hue | Surface tile with hairline, 12px radius; name 600 Page Text, "by" Secondary, Source Page Text underlined; Row Hover on hover; active on the selection tint with the selection border; focus ring |
| Tile error, loading | `errorBackground`; overlay                        | Negative pill tint and border; Scrim cover with the APP-06a spinner                                                                                                                              |
| CSS box             | Upstream input, 4px radius                        | Control input look (9px radius, hairline), monospace 12px                                                                                                                                        |
| Error text          | 12px red                                          | 12.5px negative pill text with an alert icon (also the catalog error)                                                                                                                            |

Unchanged by design: every string, the catalog fetch, install and
validation, the virtualised grid and its three-per-row sizing, the tile
`aria-label`s, the textarea's accessible name, Enter moving down a row in
tables, and narrow widths (the installer is gated with the Settings
redesign, as `Themes.tsx` already is).

Questions for the owner:

1. **Selection checkbox role:** give `SelectCell` the checkbox role with
   its checked state (drawn as the proposal), or the button role like
   every other `CellButton`?
2. **Names for icon-only cells:** add accessible names to the register's
   cleared status (its status: "Cleared", "Uncleared", "Reconciled"…) and
   the selection checkboxes, reusing existing translated strings where
   they exist and adding new ones otherwise (proposed), or leave them
   unnamed in 06f?
3. **Table focus ring:** ring on keyboard focus only, drawn inside the edge
   (drawn), or outside the edge like other controls (`styles.focusRing`,
   which some parents would clip)?
4. **Installer panel:** Card Inset panel inside the Themes card (drawn), or
   a hairline-divided section with no fill?

| File                                                | Shows                                                                  |
| --------------------------------------------------- | ---------------------------------------------------------------------- |
| `shots/161-installer-light-wide.png`                | The installer, Paper Mint active, Linen hovered, Meadow focused, light |
| `shots/162-installer-today-light-wide.png`          | The same today                                                         |
| `shots/163-installer-loading-dark-wide.png`         | A tile loading, dark                                                   |
| `shots/164-installer-error-midnight-wide.png`       | A tile that failed and its message, midnight                           |
| `shots/165-installer-error-today-midnight-wide.png` | The same today                                                         |
| `shots/166-installer-no-catalog-dark-1000.png`      | Catalog failed to load, dark, 1000×700                                 |
| `shots/167-installer-custom-theme-wide.png`         | The installer, custom theme                                            |
| `shots/168-table-focus-payees-light-wide.png`       | Payees table focused from the keyboard, light                          |
| `shots/169-table-focus-tags-dark-1000.png`          | Tags table focused, dark, 1000×700                                     |
| `shots/170-table-focus-rules-midnight-wide.png`     | Rules table focused, midnight                                          |

Regenerate with `node scripts/redesign-prototype-shots.cjs --app-06f`
(`PW_CHANNEL=msedge` uses the installed Edge).
