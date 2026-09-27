# Stage 1 prototype — DESIGN-01

A static, fictional-data prototype of the redesigned app frame and budget screen. It is not connected to Actual's code and performs no budget calculations beyond the illustration formulas noted below.

Status: **DESIGN-01 ready for owner review.** DESIGN-02 (row states, multi-month, summary breakdown) and DESIGN-03 (decisions record) follow.

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
node scripts/redesign-prototype-shots.cjs
```

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

| Item                                                         | Today (source)                                   | Wide window (≥900px)                                               | Narrow window (<900px)                         |
| ------------------------------------------------------------ | ------------------------------------------------ | ------------------------------------------------------------------ | ---------------------------------------------- |
| Budget, Reports, Schedules                                   | Sidebar `PrimaryButtons.tsx`                     | Pill tabs in the top bar                                           | Drawer                                         |
| All accounts, On budget, Off budget (with totals)            | Sidebar `Accounts.tsx`                           | **Accounts ▾** menu                                                | Drawer "Accounts" section                      |
| Individual accounts, with sync status and balance            | Sidebar `Account.tsx`                            | Accounts ▾ menu rows (status dot and balance)                      | Drawer                                         |
| Account context menu (right-click)                           | `Account.tsx`                                    | Same menu on right-click of a row in the Accounts menu (not drawn) | Long-press / right-click in drawer (not drawn) |
| Closed accounts                                              | Sidebar toggle                                   | Accounts ▾ → Closed accounts                                       | Drawer                                         |
| Add account                                                  | Sidebar button (`Sidebar.tsx`)                   | Accounts ▾ → Add account                                           | Drawer                                         |
| Payees, Rules, Bank Sync (conditional), Tags, Settings       | Sidebar "More"                                   | **More ▾** menu                                                    | Drawer "More" section                          |
| Budget switcher: Rename, Settings, Load backup…, Switch file | Sidebar `BudgetName.tsx`                         | Top-right budget button menu                                       | Drawer footer                                  |
| Uncategorized count                                          | Titlebar `UncategorizedButton`                   | Top-right chip; collapses to the count alone below 1280px          | Drawer item with count                         |
| Server sync status                                           | Titlebar `ServerSyncButton` (only with a server) | Top-right cloud button with status dot                             | Top bar                                        |
| Privacy mode                                                 | Titlebar `PrivacyButton`                         | Top-right eye button                                               | Top bar                                        |
| Help                                                         | Titlebar `HelpMenu`                              | Top-right ? button                                                 | Drawer                                         |
| Logged-in user (server login)                                | Titlebar `LoggedInUser`                          | **Not drawn.** Proposal: inside the budget switcher menu           | Drawer footer                                  |
| Months shown (1–N)                                           | Titlebar `MonthCountSelector` on /budget         | Budget header segmented 1 / 2 / 3                                  | Budget header                                  |
| Previous / next / current month                              | `MonthPicker.tsx`                                | Budget header month pill and **Today**                             | Budget header                                  |
| Budget page menu                                             | `BudgetPageHeader.tsx`                           | Budget header ⋯ button                                             | Budget header                                  |
| To Budget menu and breakdown                                 | `budgetsummary/*`                                | Ready to Assign card (click; "Breakdown" affordance)               | Same card                                      |
| Category activity → transactions                             | `onShowActivity`                                 | Activity amount in each row (unchanged behavior)                   | Same                                           |
| Command bar (Ctrl/Cmd+K), notifications                      | Global                                           | Unchanged: keyboard shortcut and existing toasts                   | Unchanged                                      |
| Back button (`location.state.goBack`)                        | Titlebar                                         | **Not drawn.** Proposal: left of the page eyebrow when present     | Same                                           |
| Desktop window drag region                                   | Titlebar                                         | The top bar becomes the drag region; buttons excluded              | n/a                                            |

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

Still open for DESIGN-02: row density, whether losing the always-visible account sidebar is acceptable, and reconciliation-mode layout.
