# Design decisions (DESIGN-03)

Recorded September 27, 2026. This is the design record that implementation
tasks follow (plan §6). Where this file and plan §3 disagree, **this file
wins**; the plan's §3 remains the rationale. Implementation briefs cite the
section numbers below instead of making their own aesthetic choices.

Status of each item:

- **Approved**: the owner decided it (dates and evidence in §12).
- **Shown**: drawn in the reviewed prototype and not objected to, but not
  separately decided. Listed again in §11 so the owner can confirm or change
  it before the task that needs it starts.

Reference prototype: [`prototype/index.html`](prototype/index.html) at commit
`aa422ef87` (screenshots in [`prototype/shots/`](prototype/shots/)). The
prototype is a picture, not a specification of code, and none of its
formulas or data may be copied into the app as financial logic.

## 1. Direction and layout

| Decision                                                                                                 | Status   |
| -------------------------------------------------------------------------------------------------------- | -------- |
| Envelope budgeting on Actual's existing engine; Copilot-inspired look (plan §1)                          | Approved |
| **Layout A**: one continuous envelope table with tinted group rows. Layout B (group cards) is not built. | Approved |
| **Summary cards** header: Ready to Assign (hero), Assigned, Activity. Concept C's trend header dropped.  | Approved |
| **One month at a time** on the budget page (§6)                                                          | Approved |
| All three built-in themes (light, dark, midnight) are first-class; custom themes load with fallbacks     | Approved |
| Font: bundled Inter; tabular figures wherever money appears (`FinancialText`)                            | Approved |
| No new logo, brand, fonts or illustrations; existing Actual logo replaces the prototype's "A" mark       | Approved |

The owner-approved Copilot direction knowingly relaxes two points of the
upstream `PRODUCT.md`/`DESIGN.md` (gradient glows, card shadows on persistent
surfaces). The relaxation is limited to: the soft page glow, card shadows,
and the glow behind the Ready to Assign card. Semantic colors, tabular
figures and "never color alone" stay in force.

## 2. Navigation and accounts

| Decision                                                                                                                                                                                                                                                                                         | Status   |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- |
| Top bar: segmented pill tabs **Budget, Accounts ▾, Reports, Schedules, More ▾**; right side: uncategorized chip, sync, privacy, help, budget switcher                                                                                                                                            | Approved |
| Every destination in the [destination map](prototype/README.md#destination-map) stays reachable at every width                                                                                                                                                                                   | Approved |
| **Accounts pane**: on the left of every page, **collapsible**. Open: the full list (All accounts, On/Off budget with totals, each account with sync-status dot and balance, Closed accounts, Add account). Collapsed: 56px rail with initials and status dots, Add account, and an expand button | Approved |
| Pane open/collapsed state is **device-local** front-end storage (like the details panel); no new stored or synced preference                                                                                                                                                                     | Approved |
| Pane default: open at 1280px and wider, collapsed below                                                                                                                                                                                                                                          | Approved |
| The **Accounts ▾** menu stays in the top bar (same list); below 900px everything moves into the navigation drawer                                                                                                                                                                                | Approved |
| Account right-click menu keeps working from the pane and the menu                                                                                                                                                                                                                                | Approved |
| "All accounts" is navigation, never a filter on envelope totals                                                                                                                                                                                                                                  | Approved |

## 3. Budget header and summary

- Header: "Budget" eyebrow (plus "· Past month" / "· Future month" when not
  current), month as the title, month stepper pill, **Today** button when not
  on the current month, month-notes button, **month menu ⋯**
  (`BudgetMonthMenu` items unchanged), details-panel toggle. **Approved**
  (shown and reviewed; `18`, `39`).
- The header ⋯ is the **month menu**, not a "budget page menu" (that menu
  does not exist; DESIGN-01's map was corrected).
- **Ready to Assign card** (approved states, `18`, `25`, `26`):
  - positive: positive color and soft glow, subline "`$X` available funds";
  - zero: neutral text, no glow, "All assigned" badge, subline "Every dollar
    has a job";
  - negative: negative color, **"Overassigned"** badge, subline "More
    assigned than you have", negative-tinted glow.
  - When the card is too narrow for the label and badge on one line (1000×700
    with the panel open, or "Overassigned" at 1440×900), the badge takes the
    subline's place under the amount instead of wrapping under the label; for
    these two states the subline repeats the badge. The widths are set for
    the English label and badges (BUD-04, approved at merge).
- Clicking the card (or Enter/Space) opens **one popover** containing the full
  existing breakdown (Available funds, Overspent in _previous month_,
  Assigned, For next month, = Ready to Assign) followed by the existing To
  Budget menu actions in their existing conditions (Move to a category, Hold
  for next month, Cover from a category, Reset next month's buffer, Disable
  current auto hold). No new "Assign" action. **Approved.**
- **Assigned** card: existing total budgeted, subline "across N categories".
- **Activity** card: existing total spent plus a stacked bar of the six
  largest spending categories in their accents, then "other" (faint), then
  the unspent remainder (track). Decoration next to the number; no new total.
- **Compact summary strip** (46px, one line: Ready to Assign with badge,
  Assigned, Activity) replaces the cards once the table has scrolled more
  than 40px on windows shorter than 900px, and returns at the top. **Approved**
  with the density decision.

## 4. Envelope table

### 4.1 Density and structure

| Decision                                                                                                                          | Status   |
| --------------------------------------------------------------------------------------------------------------------------------- | -------- |
| **Category rows 44px**, group rows 40px, category tile 26px (radius 8), progress bar 6px                                          | Approved |
| Columns **Category \| Assigned \| Activity \| Available**                                                                         | Approved |
| Sticky column header; group rows tinted and collapsible; Income section last with "Received"                                      | Approved |
| The shared `table.tsx` `ROW_HEIGHT` is not changed for this; the budget table sets its own heights                                | Approved |
| Measured result: 7 categories fully visible at 1000×700 with the panel open (8 with the compact strip); today's app shows about 8 | Evidence |

Column widths (from the prototype CSS; tune only if a task finds a real
overflow):

| Window / state                                | Category         | Assigned | Activity         | Available |
| --------------------------------------------- | ---------------- | -------- | ---------------- | --------- |
| ≥1280px                                       | minmax(160, 1fr) | 120      | minmax(150, 230) | 120       |
| ≥1280px, accounts pane and details panel open | minmax(150, 1fr) | 104      | minmax(100, 170) | 108       |
| 900–1279px                                    | minmax(140, 1fr) | 100      | minmax(120, 180) | 104       |
| 900–1279px, details panel open                | minmax(120, 1fr) | 84       | minmax(72, 120)  | 92        |
| <900px (Activity column hidden)               | minmax(120, 1fr) | 84       | hidden           | 96        |

The Activity percentage label is hidden whenever the Activity column is at
its narrow widths. Actual's own mobile screens take over below its mobile
breakpoint; the <900px layout is only the in-between width.

### 4.2 Row anatomy and interactions

- **Name cell**: tile (first grapheme of the name, accent at low opacity,
  `aria-hidden`) + name, ellipsis when long. The name is a **dedicated
  details opener** (button; Enter opens the panel). Right-click on it opens
  the existing category menu. **Approved** (`18`, `41`).
- Caption under the name for template/goal categories ("Template $280 · $30
  short", "Goal $10,000 · 49% saved").
- A small notes icon after the name marks categories with notes.
- **Row tools** (notes button, category menu ⋯, drag handle) take no width
  and appear only on hover or keyboard focus within the row.
- Group rows: collapse caret, name, and on hover/focus: Add category, group
  notes, group menu (existing items: Rename, Hide, Delete, Sort A to Z, Sort
  Z to A, Overwrite with templates).
- Category column header: "Category" plus a ⋯ with the existing column menu
  (Toggle hidden categories, Expand all, Collapse all) and Add group.
- **Assigned**: click to edit in place (existing keyboard behavior: Enter
  and Tab move down, Shift moves up, Escape cancels and returns focus).
  Editing row gets the selection tint; the input has a 1.5px selection
  border.
- **Activity**: amount (refunds shown with "+"), percentage, progress bar
  (§7.1). The amount sits on the row's centre line with Assigned and
  Available; the bar hangs 3px below it (BUD-04). Clicking the amount keeps today's navigation to the filtered
  transactions (`47`).
- **Available**: status pill (§4.3). Clicking it opens the existing balance
  menu (Transfer to another category, Cover overspending, Rollover
  overspending / Remove overspending rollover, under their existing
  conditions).
- Hidden categories (when shown): row at 50% opacity plus a "Hidden" tag, so
  the state is not conveyed by opacity alone.
- Selected category (details panel subject): selection tint plus a 3px
  selection bar on the left edge.

### 4.3 Available pill states

| State                                        | Tint     | Extra marker                                                    |
| -------------------------------------------- | -------- | --------------------------------------------------------------- |
| Positive                                     | positive | none                                                            |
| Zero                                         | neutral  | none                                                            |
| Negative (overspent)                         | negative | minus sign                                                      |
| Template underfunded / long goal not reached | warning  | target icon; caption under the name                             |
| Template funded                              | by value | target icon                                                     |
| Overspending rollover on                     | by value | → arrow after the amount; tooltip names the month it rolls into |

Colors follow `makeBalanceAmountStyle` exactly: negative first, then
template/goal status (a long-term goal compares the balance; a template
compares the budgeted amount), then positive/zero. The pill's accessible
name contains the full sentence (for example "Available $110. Template asks
for $280 a month. Underfunded by $30.").

## 5. Category details panel

| Decision                                                                                           | Status   |
| -------------------------------------------------------------------------------------------------- | -------- |
| Budget page only; **open by default**; open state remembered per device (front-end storage)        | Approved |
| Not on account registers, Reports, Schedules, Payees, Rules, Tags or Settings                      | Approved |
| Width 360px (320px at 900–1279px); pushes the table. Below 900px it is an overlay with a scrim     | Approved |
| Opens from the category name (click or Enter); × and Escape close it; the header toggle reopens it | Approved |
| Close restores focus to the opener and keeps the table scroll position (DETAIL-01)                 | Approved |

Contents, top to bottom (`18`, `20`–`24`):

1. Tile, name (wraps), group name, the panel's own month stepper (follows
   the budget month by default).
2. Hero: Available amount; label "Available", or "Overspent" when negative.
   Rollover categories add "Overspending rolls over to _next month_ instead
   of reducing Ready to Assign"; other overspent categories add "If it isn't
   covered, this comes out of _next month_'s Ready to Assign". Then the row's
   progress bar.
3. Three stat tiles: **From _previous month_** (carried in), **Assigned**,
   **Activity**. (Approved September 28, 2026, replacing plan §3's "last
   month's Activity"; the carried-in amount is read back as Available −
   Assigned − Activity, see §11.)
4. Goal/template box when the category has one: status line with icon,
   progress toward the target, and the full sentence.
5. Pace chart (§7.2) with legend and text summary. Omitted for long-term
   savings goals, where the goal box replaces it.
6. Notes (read-only first).
7. The month's transactions, newest first, up to five, then "View in
   Accounts" (the existing filtered view). Posted transactions only:
   scheduled previews are left out so the list matches Activity (owner
   decision, September 28, 2026). The five rows stay read-only; "View in
   Accounts" opens the panel's month (owner decision, September 29, 2026).

Notes are edited from the panel with the row's own notes button, saving
the same way (owner decision, September 29, 2026). The month stepper stays
within the budget's months and follows the budget month again whenever it
changes (DETAIL-03).

Privacy mode hides the chart and uses the redacted font for amounts (`50`).

## 6. Excluded or removed (approved)

| Item                                                                                                             | Note                                                                                                                                                                                                                                                                                                               |
| ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Multi-month budget view**                                                                                      | Removed. The months-shown control (`MonthCountSelector` in `Titlebar.tsx`) is not shown and the desktop budget always renders one month. The stored `maxMonths` global preference is left untouched (not deleted or migrated), so reverting is a UI change only. Users who show several months today will see one. |
| Layout B (group cards)                                                                                           | Reference only.                                                                                                                                                                                                                                                                                                    |
| Concept C trend header and progress rings                                                                        | Dropped from the budget page; a month-trend chart may be proposed later as a Reports widget.                                                                                                                                                                                                                       |
| User-chosen category icons, emoji or colors                                                                      | Needs stored data; separate project.                                                                                                                                                                                                                                                                               |
| "Compact rows" setting (38px)                                                                                    | Would need a new preference; not planned.                                                                                                                                                                                                                                                                          |
| Transaction inspector panel on account registers                                                                 | Not planned.                                                                                                                                                                                                                                                                                                       |
| Mockup placeholders: "Assign" button, "All accounts" budget filter, notification bell, Month/Quarter/Year switch | Not features.                                                                                                                                                                                                                                                                                                      |
| Sidebar resize and floating behavior                                                                             | Replaced by the collapsible accounts pane.                                                                                                                                                                                                                                                                         |

## 7. Presentation formulas (UI-03)

These are display-only. They read amounts the app already provides, never
feed a saved value or total, and each needs unit tests for zero, negative,
refund, carryover, overspent and empty-month cases.

### 7.1 Progress bar (approved, including the September 27 change)

```
spent     = max(0, −activity)          // this month's outflow net of refunds
available = the category's Available (leftover) for the month

if available < 0:
    if spent > 0: fill = 1, color = negative     // overspent this month
    else:         fill = 0                       // negative carried in, no spending:
                                                 // empty bar, the pill carries the warning
else:
    start = spent + available                    // money the envelope started with
    fill  = (start > 0 and spent > 0) ? spent / start : 0
    color = category accent
```

Percentage label: `round(fill × 100)%`, "Over" when overspent, blank when
nothing was spent.

### 7.2 Pace chart (shown; see §11)

```
start    = carried-in balance + assigned       // money at the start of the month
days     = days in the month
upto     = today's day (current month) | days (past) | 0 (future)
series   = cumulative outflow by day from the existing category/month
           transaction query (refunds reduce it)
even(d)  = start > 0 ? start × d / days : none
```

- Current month: series to today, dashed even-pace line, faint "today"
  marker, summary "`$X` under even pace" / "`$X` over even pace", or "No
  activity yet this month" when there are no transactions.
- Past month: full series and line; summary "Finished with `$X` left" or
  "Finished `$X` overspent".
- Future month: even-pace line only, a "No activity yet" label, summary
  "`$X` to spend from _Month_ 1".
- `start ≤ 0`: no pace line. A past month keeps its "Finished …" summary
  (owner decision, September 27, 2026); the current month's summary is
  "Nothing assigned, so no pace line".
- Long-term savings goal: no pace chart.
- Text equivalent: the chart's accessible name states spent, start amount,
  date and the summary.

### 7.3 Category accent

```
accent = categoryAccent[(stableHash(category.id) % 10) + 1]
stableHash = 32-bit FNV-1a over the ID's code points
```

Income categories and group rows use neutral styling. Two categories may
share a color. Nothing is stored.

### 7.4 Summary stacked bar

Six largest positive-spend categories in their accents, remaining spending as
one faint segment, then `max(0, assigned − spent)` as track.

## 8. Theme roles (UI-01)

New roles, added to `packages/component-library/src/themes/{light,dark,midnight}.css`
with the prototype's values (the `:root`, `[data-theme='dark']` and
`[data-theme='midnight']` blocks at the top of `prototype/index.html` are
the value source). Existing roles keep their meaning.

| New role                                                        | Use                             | Custom-theme fallback (derived from existing roles)                     |
| --------------------------------------------------------------- | ------------------------------- | ----------------------------------------------------------------------- |
| `pageGlow`                                                      | page background glow            | none                                                                    |
| `pageTextFaint`                                                 | captions, column headers        | `color-mix(pageTextSubdued 70%, pageBackground)`                        |
| `cardBorder`, `cardShadow`, `cardInset`                         | cards, stat tiles               | `tableBorder`; no shadow; `color-mix(pageText 6%, transparent)`         |
| `controlBackground`, `navTrack`, `navActive`, `navActiveShadow` | controls, pill navigation       | `cardBackground`; `cardBackground`; `color-mix(pageText 12%)`; none     |
| `selectionBackground`, `selectionBorder`                        | selected row, focus, editing    | `color-mix(buttonPrimaryBackground 16%)`; `buttonPrimaryBackground`     |
| `tableRowHover`, `groupRowBackground`, `progressTrack`          | rows and bars                   | `color-mix(pageText 4% / 3% / 10%)`                                     |
| `pillPositive{Background,Text}`                                 | Available pill                  | `color-mix(numberPositive 18%)`; `numberPositive`                       |
| `pillNeutral{Background,Text}`                                  | zero pill, badges               | `color-mix(pageText 8%)`; `pageTextSubdued`                             |
| `pillNegative{Background,Text}`                                 | overspent pill, negative badges | `color-mix(numberNegative 18%)`; `numberNegative`                       |
| `pillWarning{Background,Text}`                                  | template underfunded            | `color-mix(templateNumberUnderFunded 18%)`; `templateNumberUnderFunded` |
| `heroGlow`, `heroGlowNegative`                                  | Ready to Assign glow            | transparent                                                             |
| `popoverShadow`, `scrim`                                        | menus, overlays                 | a plain dark shadow; `rgba(0,0,0,.5)`                                   |
| `categoryAccent1`–`categoryAccent10`, `tileAlpha`               | tiles, bars, dots               | the built-in set of the custom theme's base                             |

Mechanism (approved direction, `37`, `38`): a custom theme overrides existing
roles on top of a built-in base. New roles fall back to expressions of
existing roles as above, so new surfaces follow the custom palette. Built-in
themes keep tuned literal values. Theme parsing and validation are not
touched. How the fallback layer is wired (for example only when a custom
theme is active) is UI-01's implementation choice.

Category accents (final values):

| #            | Light     | Dark      | Midnight  |
| ------------ | --------- | --------- | --------- |
| 1            | `#6366f1` | `#818cf8` | `#a5b4fc` |
| 2            | `#10b981` | `#34d399` | `#34d399` |
| 3            | `#d97706` | `#fbbf24` | `#fbbf24` |
| 4            | `#3b82f6` | `#60a5fa` | `#7dd3fc` |
| 5            | `#db2777` | `#f472b6` | `#f472b6` |
| 6            | `#ea580c` | `#fb923c` | `#fb923c` |
| 7            | `#0891b2` | `#22d3ee` | `#22d3ee` |
| 8            | `#7c3aed` | `#a78bfa` | `#c4b5fd` |
| 9            | `#65a30d` | `#a3e635` | `#a3e635` |
| 10           | `#e11d48` | `#fb7185` | `#fb7185` |
| Tile opacity | 0.13      | 0.17      | 0.18      |

UI-01 must check each accent's tile letter contrast against its tint in all
three themes and report any pair below 3:1 (the letter is decorative, but
should stay legible).

### As implemented (UI-01, September 27, 2026)

- **Renamed:** `cardBorder` and `cardShadow` already existed (the purple
  `Card` border and a shadow color used by `mobileAccountShadow`), so the new
  hairline and elevation roles are `cardHairline` and `cardElevation`. The
  existing roles are unchanged.
- **Fallback wiring (owner-approved):** fallback expressions live in
  `packages/component-library/src/themes/fallback.css`.
  `CustomThemeStyle` (`packages/desktop-client/src/style/theme.tsx`) inserts
  that file before each custom theme's CSS, inside the same
  `prefers-color-scheme` block in auto mode. Custom-theme roles still win. It
  is not added for a CSS override on its own, so built-in themes with an
  override keep their tuned values. Theme parsing and validation are
  unchanged. `popoverShadow` falls back to `0 8px 24px rgba(0, 0, 0, 0.3)`.
- **Tile letter contrast** (letter on its tint over `cardBackground`):
  dark 4.81–8.26 and midnight 5.34–8.34, all at least 3:1. Light: 1 3.79,
  **2 2.24**, **3 2.77**, 4 3.17, 5 3.78, 6 3.04, 7 3.16, 8 4.69, **9 2.71**,
  10 3.82. Accents 2 (emerald), 3 (amber) and 9 (lime) are below 3:1
  in light. **Owner accepted them as they are (September 27, 2026):** the
  letter is decorative, since the category name appears alongside it.

Rail initials (BUD-04, approved at merge): an account keeps its first
letter unless another account in the rail shares it. Those take the first
letters of their first two words, or their first two letters ("HSBC" → HS,
"House Asset" → HA in the demo); any that still collide take the letter and
their position among the accounts sharing it ("C1", "C2"). The chip's
accessible name and tooltip stay the full account name.

### Added in UI-02 (owner decision, September 27, 2026)

- **`pageTextSecondary`**: secondary text for the redesigned controls
  (unselected tabs, neutral tiles, card labels). The app's light
  `pageTextSubdued` is `#9fb3c8`, not the `#62626e` the prototype assumed, and
  reads at only 1.81:1 on the light page background. Light uses `#62626e`;
  dark and midnight use `var(--color-pageTextSubdued)` (unchanged look); the
  custom-theme fallback is `pageTextSubdued`. `pageTextSubdued` keeps its
  value and meaning everywhere else.

### Retuned in THEME-02 (owner decision D-4, September 28, 2026)

Existing dark and midnight roles changed value so every page shares the
Budget page's surfaces (plan §19.1). Role meanings are unchanged; light and
`fallback.css` are untouched. Scope approved by the owner beyond the task
card: the Settings (`pill*`), input, menu, tooltip and normal-button roles as
well as the table roles.

- **Dark:** navy surfaces become the neutral gray ramp. Solid surfaces use
  palette grays: `tableBackground`, `tableHeaderBackground`, `menuBackground`,
  `menuItemBackground`, `formInputBackground`, `buttonNormalBackground`,
  `buttonNormalDisabledBackground` and `tooltipBackground` are `gray800` (the
  Budget card); `pillBackground` is `gray700`, one step lighter so a pill
  still shows on a modal or card (the rule editor's condition rows);
  `pillBackgroundLight`, `menuBorder` and `menuAutoCompleteBackground` are
  `gray900`; `tableBorderSeparator` is `gray400`; `buttonNormalBorder` is
  `gray300`; `menuAutoCompleteBackgroundHover` is `gray500`. Hover fills,
  borders and menu hover use three literal grays, each the smallest step on
  the ramp that stays as distinct from `gray800` as the navy value was:
  `#2a2e3b` (`tableRowBackgroundHover`, `tableRowHeaderBackground`,
  `formInputBackgroundSelected`, `pillBorder`, `tooltipBorder`), `#3f4554`
  (`tableBorder`, `formInputBorder`, `modalBorder`,
  `buttonNormalBackgroundHover`) and `#535d6d` (`menuItemBackgroundHover`,
  `buttonMenuBorder`, `buttonNormalDisabledBorder`).
- **Midnight:** `tableHeaderBackground`, `pillBackground`, `menuBackground`,
  `buttonNormalBackground` and `buttonNormalDisabledBackground` are `gray800`;
  `buttonNormalBackgroundHover` is `#525b6c` (keeps today's 2.65:1 against the
  button).
- **Left as they were:** all text roles, calendar and date-picker roles,
  sidebar hover, `reportsInnerLabel`, the multi-month budget roles, mobile
  roles and `cardShadow`.
- **Contrast:** text on every changed surface is higher than before, and
  hover and selection surfaces are at least as distinct, except the midnight
  table header text (11.44 → 10.41:1, because the header now matches the
  card). Owner accepted these lower edge distinctions: pills against the page
  or a modal (dark 1.73/1.58 → 1.34/1.22; midnight modal 2.04 → 1.22), rule
  chips on a table (1.27 → 1.10) and the dark modal border (2.98 → 1.89).

### Added in BUD-04 (September 29, 2026; approved at merge)

- **`navListActive`**: the open account in the accounts pane and its rail
  chip. The pane used `navActive`, which is white in light (it is the top
  tab lifting out of its grey track), so on the white pane the open account
  had no visible fill (1.00:1, QA-00). Light uses `rgba(15, 15, 30, 0.1)`
  (1.24:1 on the pane; hover stays at 1.04:1); dark and midnight use
  `var(--color-navActive)` (unchanged look); the custom-theme fallback is
  `navActive`. The pane's items drop `navActiveShadow`, which only showed in
  light. `navActive` keeps its value and meaning for tabs and toggles.

## 9. Wording (TERM-01)

Visible text only; no identifier, binding, preference or API renames.
Scope: envelope budget screens on desktop and the matching mobile envelope
screens. Tracking budgets, account registers ("Balance", "Cleared total")
and `packages/docs` keep their wording. Changed English strings are
translation keys, so other languages show the new English text until
translated; accepted for this fork. Run `generate:i18n` after the change.

| Current                                                                                                                                                    | New                                              | Where (enumerate exact lines in the TERM-01 brief)                                 | Status   |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ | ---------------------------------------------------------------------------------- | -------- |
| Budgeted                                                                                                                                                   | Assigned                                         | envelope column header, TotalsList, EnvelopeBudgetMenuModal, mobile envelope table | Approved |
| Spent                                                                                                                                                      | Activity                                         | envelope column header, mobile envelope table                                      | Approved |
| Balance                                                                                                                                                    | Available                                        | envelope column header, EnvelopeBalanceMenuModal, mobile envelope table            | Approved |
| To Budget / To Budget:                                                                                                                                     | Ready to Assign                                  | ToBudgetAmount, mobile BudgetTable/BudgetPage, BudgetAutomationsBody text          | Approved |
| Overbudgeted / Overbudgeted:                                                                                                                               | Overassigned                                     | ToBudgetAmount, mobile BudgetTable                                                 | Approved |
| Cover overbudgeted                                                                                                                                         | Cover overassigned                               | mobile BudgetPage, EnvelopeBudgetSummaryModal                                      | Approved |
| Covered overbudgeted from {{categoryName}}                                                                                                                 | Covered overassigned from {{categoryName}}       | notification text                                                                  | Approved |
| You have budgeted more than your available funds                                                                                                           | You have assigned more than your available funds | mobile BudgetPage                                                                  | Approved |
| Budgeted amount for {{categoryName}} category (aria)                                                                                                       | Assigned amount for {{categoryName}} category    | envelope inputs                                                                    | Approved |
| Spent amount for {{categoryName}} category (aria)                                                                                                          | Activity for {{categoryName}} category           | envelope cells                                                                     | Approved |
| Balance for {{categoryName}} category (aria)                                                                                                               | Available for {{categoryName}} category          | envelope cells                                                                     | Approved |
| Open balance menu for {{categoryName}} category (aria)                                                                                                     | unchanged                                        |                                                                                    | Shown    |
| Available funds, Overspent in {{month}}, For next month                                                                                                    | unchanged                                        | TotalsList                                                                         | Shown    |
| Copy last month's budget, Set budgets to zero, Set budgets to N month average, Apply/Overwrite with budget template, Check templates, End of month cleanup | unchanged                                        | BudgetMonthMenu and mobile equivalents                                             | Shown    |
| Transfer to another category, Cover overspending, Rollover overspending, Hold for next month, Move to a category, Cover from a category                    | unchanged                                        | balance and To Budget menus                                                        | Shown    |
| Received (income)                                                                                                                                          | unchanged                                        |                                                                                    | Shown    |
| New: "All assigned", "Overassigned" badges; "Every dollar has a job"; "More assigned than you have"; "Overspent" (panel label); pace summaries (§7.2)      | new strings                                      | new components only                                                                | Shown    |

If `Balance` in `EnvelopeIncomeBalanceMenuModal` refers to an income
category's received amount, keep it unchanged; the TERM-01 brief confirms
from source.

**As implemented (TERM-01, September 28, 2026).** The owner approved the
"Shown" rewording rows above and asked to match YNAB wherever the envelope
UI names these amounts, which added three places the table did not list:

| Current                                                 | New                                                        | Where                                                                                  |
| ------------------------------------------------------- | ---------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| To Budget (source/target in Cover and Transfer pickers) | Ready to Assign                                            | `C/budget/util.ts` `addToBeBudgetedGroup`; mobile "Covered X overspending from"        |
| Budgeted: / Balance: (goal tooltip)                     | Assigned: / Available:                                     | `C/budget/BalanceWithCarryover.tsx`, envelope only                                     |
| …the pool is To Budget / Split any remaining To Budget… | …the pool is Ready to Assign / …remaining Ready to Assign… | `C/budget/goals/editor/CleanupAutomation.tsx`, `C/budget/goals/displayTemplateMeta.ts` |

`EnvelopeIncomeBalanceMenuModal` shows `catSumAmount` for an income
category, which is the received amount, so its "Balance" stays. Mobile
column headers, cell aria labels and the goal tooltip are shared with
tracking budgets and pick the wording from the `budgetType` synced pref;
tracking keeps Budgeted / Spent / Balance. The mobile cell aria labels are
passed to `CellValue`, which does not render them, so that change has no
effect on screen readers today (unchanged upstream behavior). Generated
locale files (`packages/desktop-client/locale/`) are gitignored, so
`generate:i18n` produces nothing to stage.

**Tour (TOUR-FIX, September 28, 2026).** TERM-01 missed the in-app tour.
Its envelope text now uses the same words; tracking budgets keep "Saved
This Month", Budgeted and Balance, with unchanged translation keys:

| Current                                                        | New                                                              | Where                                           |
| -------------------------------------------------------------- | ---------------------------------------------------------------- | ----------------------------------------------- |
| To Budget (summary step title); "The To Budget amount shows…"  | Ready to Assign; "The Ready to Assign amount shows…"             | `C/tour/steps.tsx` summary step, envelope only  |
| "Click the Budgeted amount… keep an eye on the Balance column" | "Click the Assigned amount… keep an eye on the Available column" | `C/tour/steps.tsx` category step, envelope only |

## 10. Accounts screens (APP-01/APP-02 inputs)

- Account hero card (type eyebrow, editable name, notes, balance, chips for
  Cleared, Uncleared, Selected, Filtered and reconciliation status; Bank Sync
  and Reconcile buttons) and optional balance chart card; compact one-band
  hero below 1280px. Shown in DESIGN-01 (`14`–`17`); not separately approved.
- Register: 36px rows **passed through the existing `rowHeight` prop for the
  register only**; category accent dot; payee initial; cleared as check /
  ring / lock; tags keep user colors and a square-ish shape. User-configured
  columns are never auto-hidden.
- **Reconciliation mode, approved as drawn** (`44`–`46`): the existing
  reconcile popover (statement balance, last bank balance, Use last synced
  total, Reconcile); then a band in the hero with a "Difference" chip, the
  existing sentence, **Create reconciliation transaction** and **Exit
  reconciliation**; at zero difference "All reconciled" and **Lock
  transactions**. Hero gets a selection outline; the cleared column header
  is accented. On the compact hero the band sits below the balance.
- Bank-sync error for the account: warning chip in the hero with the
  existing actions (from the accounts review).

## 11. Items shown but not separately decided

Confirm or change these before the named task starts; until then the
"Shown" behavior above is the default.

1. ~~Details panel third stat tile: **From previous month** (carried in)
   instead of the plan's "last month's Activity" (DETAIL-02).~~
   **Confirmed by the owner September 28, 2026**; now Approved in §5.
2. Pace chart for past and future months as in §7.2 (the plan said past
   months without a label and future months without a chart) (DETAIL-04).
3. ~~The "Shown" wording rows in §9 (TERM-01).~~
   **Confirmed by the owner September 28, 2026**; now Approved in §9.
4. ~~Accounts pane default open at ≥1280px, collapsed below (NAV-02).~~
   **Confirmed by the owner September 27, 2026**; now Approved in §2.
5. Account hero and register treatment in §10 (APP-01, APP-02).

## 12. Evidence

| Date         | Review                                                                                                                                                   | Record                                                                                                                           |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Sep 27, 2026 | Plan §1.1 owner decisions                                                                                                                                | [plan.md](plan.md) §1.1                                                                                                          |
| Sep 27, 2026 | DESIGN-01 review: layout A, summary cards, all three themes, panel on Budget only                                                                        | [prototype README](prototype/README.md#owner-decisions-september-27-2026), commit `78f444a86`                                    |
| Sep 27, 2026 | DESIGN-02 walkthrough: 44px rows, collapsible accounts pane, one month at a time, empty bar for negative Available without spending, reconciliation band | [prototype README](prototype/README.md#owner-decisions-september-27-2026-walkthrough), commit `aa422ef87`, screenshots `18`–`50` |
| Sep 27, 2026 | After NAV-01: accounts pane default confirmed (open at 1280px and wider, collapsed below; §2, §11 item 4)                                                | Owner confirmation in the NAV-01 session                                                                                         |
| Sep 28, 2026 | DETAIL-02: third stat tile "From previous month" confirmed (§5, §11 item 1); the panel lists posted transactions only                                    | Owner confirmation in the DETAIL-02 session                                                                                      |
