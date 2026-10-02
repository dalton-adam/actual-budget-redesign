---
name: Actual Budget (redesign fork)
description: Local-first envelope budgeting with calm, card-based surfaces
# All color values are the light-theme mapping. Dark and midnight remap the
# same semantic roles via `theme.*` tokens (see The Semantic Token Rule).
# Owner-approved decisions live in docs/redesign/design-decisions.md; where
# this file and that record disagree, the decisions record wins.
colors:
  actual-purple: '#8719e0'
  actual-purple-hover: '#a368fc'
  selection-tint: 'rgba(135, 25, 224, 0.06)'
  navy-ink: '#102a43'
  navy-mist: '#e8ecf0'
  page-text: '#272630'
  page-text-secondary: '#62626e'
  page-text-faint: '#8d8d99'
  surface-white: '#ffffff'
  card-inset: '#f6f6f9'
  group-row: '#fafafc'
  hairline: 'rgba(15, 15, 30, 0.07)'
  nav-track: 'rgba(15, 15, 30, 0.05)'
  nav-list-active: 'rgba(15, 15, 30, 0.1)'
  row-hover: 'rgba(15, 15, 30, 0.025)'
  progress-track: 'rgba(15, 15, 30, 0.07)'
  positive-green: '#147d64'
  negative-red: '#e12d39'
  warning-gold: '#b88115'
  link-blue: '#1980d4'
  pill-positive-bg: 'rgba(20, 125, 100, 0.11)'
  pill-positive-text: '#0f6e57'
  pill-neutral-bg: 'rgba(15, 15, 30, 0.05)'
  pill-neutral-text: '#6b6b76'
  pill-negative-bg: 'rgba(225, 45, 57, 0.11)'
  pill-negative-text: '#c21f2c'
  pill-warning-bg: 'rgba(217, 119, 6, 0.12)'
  pill-warning-text: '#a15c07'
  accent-indigo: '#6366f1'
  accent-emerald: '#10b981'
  accent-amber: '#d97706'
  accent-blue: '#3b82f6'
  accent-pink: '#db2777'
  accent-orange: '#ea580c'
  accent-cyan: '#0891b2'
  accent-violet: '#7c3aed'
  accent-lime: '#65a30d'
  accent-rose: '#e11d48'
typography:
  hero-amount:
    fontFamily: 'Inter Variable, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif'
    fontSize: '34px'
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: '-0.8px'
    fontFeature: 'tnum, ss01, ss04'
  display:
    fontFamily: 'Inter Variable, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif'
    fontSize: '28px'
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: '-0.4px'
  headline:
    fontFamily: 'Inter Variable, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif'
    fontSize: '18px'
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: '-0.3px'
  title:
    fontFamily: 'Inter Variable, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif'
    fontSize: '13.5px'
    fontWeight: 600
  body:
    fontFamily: 'Inter Variable, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif'
    fontSize: '13px'
    fontWeight: 400
    fontFeature: 'tnum, ss01, ss04'
  label:
    fontFamily: 'Inter Variable, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif'
    fontSize: '12px'
    fontWeight: 600
  eyebrow:
    fontFamily: 'Inter Variable, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif'
    fontSize: '11px'
    fontWeight: 650
    letterSpacing: '0.07em'
rounded:
  xs: '4px'
  sm: '6px'
  md: '8px'
  control: '9px'
  tile: '10px'
  track: '12px'
  card: '18px'
  pill: '99px'
spacing:
  xs: '4px'
  sm: '8px'
  md: '14px'
  lg: '16px'
  xl: '20px'
components:
  surface-card:
    backgroundColor: '{colors.surface-white}'
    textColor: '{colors.page-text}'
    rounded: '{rounded.card}'
    padding: '16px 20px'
  stat-tile:
    backgroundColor: '{colors.card-inset}'
    textColor: '{colors.page-text}'
    rounded: '{rounded.tile}'
    padding: '8px 10px'
  status-pill-positive:
    backgroundColor: '{colors.pill-positive-bg}'
    textColor: '{colors.pill-positive-text}'
    rounded: '{rounded.pill}'
    padding: '4px 10px'
  status-pill-neutral:
    backgroundColor: '{colors.pill-neutral-bg}'
    textColor: '{colors.pill-neutral-text}'
    rounded: '{rounded.pill}'
    padding: '4px 10px'
  status-pill-negative:
    backgroundColor: '{colors.pill-negative-bg}'
    textColor: '{colors.pill-negative-text}'
    rounded: '{rounded.pill}'
    padding: '4px 10px'
  status-pill-warning:
    backgroundColor: '{colors.pill-warning-bg}'
    textColor: '{colors.pill-warning-text}'
    rounded: '{rounded.pill}'
    padding: '4px 10px'
  nav-track:
    backgroundColor: '{colors.nav-track}'
    rounded: '{rounded.track}'
    padding: '2px'
  button-tab:
    backgroundColor: 'transparent'
    textColor: '{colors.page-text-secondary}'
    rounded: '{rounded.tile}'
    padding: '7px 14px'
  button-tab-selected:
    backgroundColor: '{colors.surface-white}'
    textColor: '{colors.page-text}'
    rounded: '{rounded.tile}'
    padding: '7px 14px'
  button-control:
    backgroundColor: '{colors.surface-white}'
    textColor: '{colors.page-text}'
    rounded: '{rounded.control}'
    padding: '0 10px'
    height: '30px'
  button-primary:
    backgroundColor: '{colors.actual-purple}'
    textColor: '{colors.surface-white}'
    rounded: '{rounded.xs}'
    padding: '5px 10px'
  button-primary-hover:
    backgroundColor: '{colors.actual-purple-hover}'
    textColor: '{colors.surface-white}'
  category-tile:
    rounded: '{rounded.md}'
    size: '26px'
---

# Design System: Actual Budget (redesign fork)

## Overview

**Creative North Star: "The Calm Ledger"**

Actual is a tool people open every week for years to give each dollar a job, so the interface serves routine rather than first impressions. The redesign adds soft, rounded cards, one quiet color per category, progress bars and status pills. These help people find their way; they never compete with the money. Amounts are the loudest thing on every screen, set in tabular figures and colored only by meaning. Everything else — card, tile, glow — exists to make those numbers faster to read and easier to trust.

The look borrows Copilot Money's calm card language, applied on top of Actual's existing envelope engine and theme system. It stays restrained. Depth appears only where it was approved, and the category accent colors show identity, never status. The system must look equally correct in light, dark and midnight, and in any custom theme through derived fallbacks.

The redesign is being rolled out page by page. The Budget page, top navigation, accounts pane, the account page header, the account register, the Reports dashboard, the report pages, the custom report editor, the Formula editor, the Calendar report's transaction list and the Settings page use this vocabulary now. The Monte Carlo editor's body (APP-03d) and Schedules still use the upstream vocabulary until their APP tasks land. New work always uses the redesign vocabulary, and existing variants stay untouched so unmigrated screens look the same.

**Key Characteristics:**

- Numbers first: tabular figures, right-aligned, semantic color only
- Rounded surface cards (18px) with a hairline border and soft elevation
- Ten category accents for identity; four pill tones for status
- Segmented pill navigation instead of a dark sidebar
- Every color routed through `theme.*` roles, with fallbacks for custom themes

## Colors

A cool neutral base, one purple for selection and action, strict semantic tones for money, and a ten-color accent wheel for category identity.

All values in this file are the light-theme mapping. Dark and midnight remap the same roles, so components must never use these values directly.

### Primary

- **Actual Purple**: Primary buttons, the selection border, the 2px focus ring, and the editing input border. The **Selection Tint** (6% purple) fills selected and editing rows. **Lifted Purple** is primary-button hover.

### Secondary (category accents)

Ten accents — **Indigo, Emerald, Amber, Blue, Pink, Orange, Cyan, Violet, Lime, Rose** — are assigned to each category by a stable hash of its ID (design-decisions §7.3). Nothing is stored, and two categories may share one. They color the category tile (at 13% opacity in light), the progress-bar fill, and segments of the summary stacked bar. Income categories and group rows stay neutral.

### Tertiary (money and status)

- **Positive Green / Negative Red**: amounts and the Ready to Assign states.
- **Warning Gold**: underfunded templates.
- **Link Blue**: links.
- **Pill tones**: each money state has a pair — a tint background plus a darker text color — for positive, neutral, negative and warning pills. The pairs, not the raw greens and reds, are what appear on pills.

### Neutral

- **Page Ink**: primary text and amounts.
- **Secondary Text** (`pageTextSecondary`): unselected tabs, card labels, sublines. It replaces the light theme's `pageTextSubdued`, which fails contrast, in all redesigned controls.
- **Faint Text** (`pageTextFaint`): column headers and captions only, never body copy.
- **Surface White**: cards, table and controls. **Card Inset** fills stat tiles, and **Group Row** tints group rows.
- **Hairline**, **Row Hover**, **Nav Track** and **Progress Track**: low-alpha ink washes that give structure without borders shouting.
- **Nav List Active** (`navListActive`): the open account in the accounts pane and its rail chip. Light uses a 10% ink wash, because the white `navActive` of the top tabs vanishes on the white pane; dark and midnight use their `navActive`. No lift shadow.
- **Navy Ink / Navy Mist**: upstream light-theme sidebar and page colors, still in use on unmigrated screens. In dark and midnight, unmigrated tables, Settings, inputs, menus, tooltips and buttons use the same neutral grays as the Budget cards (THEME-02, design-decisions §8).

### Named Rules

**The Semantic Token Rule.** Components never use hex, rgba or `--palette-*` values. Every color goes through a `theme.*` role, and every redesign role has a custom-theme fallback in `themes/fallback.css`. A new role without a fallback is a bug.

**The Identity-Not-Status Rule.** Category accents say _which_ envelope, never _how it's doing_. Status comes only from the pill tones and the money colors. An overspent bar turns negative red regardless of its accent.

**The Never-Color-Alone Rule.** Every status has a second signal: a minus sign, a target icon, a rollover arrow, a badge word ("Overassigned", "All assigned"), a "Hidden" tag. Color only reinforces it.

**The Selection Rule.** Purple means "this is selected, focused or being edited." It does not decorate, fill charts or tint cards.

## Typography

**Body Font:** Inter Variable (bundled, with the system sans stack as fallback)

**Character:** One workhorse sans. Hierarchy comes from size and weight, with slightly tightened tracking on the large numerals. The typographic star is the amount, not the heading.

### Hierarchy

- **Hero Amount** (700, 34px, 1.1, −0.8px): Ready to Assign and the details panel's Available. At most one per surface.
- **Display** (700, 28px, 1.2, −0.4px): the budget month title and summary-card amounts.
- **Headline** (700, 18px, 1.25, −0.3px): the details-panel category name and section heads.
- **Title** (600, 13.5px): row names and emphasized cell text.
- **Body** (400–600, 13px): table cells and panel text. Table cell amounts use 600 in Secondary text.
- **Label** (600, 12–12.5px): sublines, pills (650), tab text (500, or 600 when selected).
- **Eyebrow** (650, 11px, uppercase, 0.07em): column headers and the "Budget" eyebrow, in Faint or Secondary text.

The upstream scale (30/20/15/16/13px) still applies on unmigrated screens.

### Named Rules

**The Tabular Number Rule.** Every standalone amount renders through `FinancialText` or `styles.tnum` (`"tnum", "ss01", "ss04"`). A proportional-figure money column is a bug.

**The One Hero Rule.** Each surface has one hero amount. Supporting figures step down to Display or smaller.

## Layout

The desktop shell has a pill-tab top bar, a collapsible accounts pane on the left, the page, and — on the Budget page only — the category details panel on the right. The budget shows one month at a time. Summary cards (Ready to Assign, Assigned, Activity) sit in a row with a 14px gap above one continuous envelope table.

- **Breakpoints (redesign):** at 1280px and wider the accounts pane defaults open and the table uses full column widths. From 900 to 1279px the pane defaults collapsed to a 56px rail and the panel narrows to 320px. Below 900px navigation moves into a drawer, the details panel becomes an overlay with a scrim, and the Activity column hides. Actual's own mobile screens take over below its mobile breakpoint.
- **Budget table density:** category rows are 44px, group rows 40px, and the sticky header is Eyebrow text. Column widths follow design-decisions §4.1 per breakpoint and panel state.
- **Register density:** account register rows are 36px, passed through the shared table's `rowHeight` prop; the shared 32px default is unchanged for every other table.
- **Details panel:** 360px (320px at 900–1279px). It pushes the table rather than covering it at desktop widths. Its header carries its own month stepper; its one link, "View in Accounts", uses Page Text Link.
- **Compact strip:** on windows shorter than 900px, a 46px one-line summary replaces the cards once the table scrolls past 40px.
- **Spacing rhythm:** 4 and 8px inside controls, 14px between cards, 16–20px card padding.

**The Every-Destination Rule.** Every destination stays reachable at every width. Collapsing moves things into a menu or drawer; it never removes them.

**The Device-Local Rule.** New layout state (pane collapsed, panel open) is stored per device in the front end. It is never a new synced preference.

## Elevation & Depth

This is a hybrid of hairlines and soft lift. Structure comes first from hairline borders and tonal washes. Depth is added only in a closed, approved list of places (design-decisions §1).

### Shadow Vocabulary

- **Card elevation** (`cardElevation`: `0 1px 2px rgba(15,15,30,.04), 0 10px 28px rgba(15,15,30,.05)` in light): surface cards — the summary cards, the details panel, and the account hero and balance chart cards (approved with design-decisions §10).
- **Active tab** (`navActiveShadow`: `0 1px 3px rgba(15,15,30,.12)`): the selected pill tab lifting out of its track.
- **Popover** (`popoverShadow`: `0 16px 40px rgba(15,15,30,.16), 0 2px 6px rgba(15,15,30,.06)`): menus, popovers, the Ready to Assign breakdown, desktop dialogs (APP-06a) and desktop toasts (APP-06c).
- **Hero glow** (`heroGlow` / `heroGlowNegative`): a soft positive or negative wash behind the Ready to Assign card. It is absent at zero.
- **Page glow** (`pageGlow`: a 7% purple radial gradient at the top left): approved and defined in all three themes, but not applied anywhere yet. Whichever task applies it must check text contrast over it in every theme.
- **Scrim** (`scrim`): behind the details-panel overlay below 900px and behind desktop dialogs.

### Named Rules

**The Approved-Depth-Only Rule.** Only the surfaces listed above may cast a shadow or glow. A new card-like surface uses a hairline border and tonal fill. Giving it elevation is an owner decision recorded in design-decisions.md, not an implementation choice.

**The No-Glow-on-Status Rule.** Glows appear only behind the Ready to Assign hero. They never mark rows, pills or alerts.

## Shapes

Softly rounded, with radius scaling to the size of the surface: 18px cards, 12px tracks, 10px tiles and tabs, 9px controls, 8px category tiles, and fully rounded pills and progress bars. Upstream components keep their 4–6px radii until migrated.

- **Category tile:** 26px square, radius 30% of its size, the first grapheme of the name in its accent over a tint of the same accent. It is decorative (`aria-hidden`), because the name always appears beside it.
- **Progress bar:** 6px tall, fully rounded, accent fill on a Progress Track. Width transitions only when reduced motion is not requested.
- **Selected row:** Selection Tint plus a 3px Actual Purple bar on the left edge. This is the one approved thick edge stripe.

## Components

Calm and tactile: redesign variants are opt-in, so existing variants and screens look the same until their task migrates them.

### Buttons

- **Tab / Tab selected:** transparent tabs inside a Nav Track (12px radius, 2px padding). The selected tab is Surface White, 600 weight, with the Active tab shadow. 7px 14px padding, 10px radius.
- **Control:** Surface White, hairline border, 9px radius, at least 30×30px. Used for steppers, toggles and the month menu. Hover is a Row Hover wash.
- **Primary / Normal / Bare:** upstream buttons, unchanged.
- **Focus:** a 2px Actual Purple outline at 2px offset (`styles.focusRing`) on every redesign control.
- **Disabled:** 45% opacity rather than a recolor, so disabled always reads as quieter in any theme.
- **Motion:** color transitions of .15s, only when reduced motion is not requested.

### Chips (Status pills)

- **Style:** fully rounded, weight 650 in tabular figures. Default is 4px 10px at 12.5px; small is 2px 7px at 11px.
- **Tones:** positive, neutral, negative and warning (§4.3 of the decisions record). The tone follows `makeBalanceAmountStyle` exactly.
- **Interactive pill:** the Available pill is a button. Hover adds a 1px inset ring in the text color, and its accessible name is the full sentence.

### Cards / Containers

- **Surface card:** Surface White, hairline border, 18px radius, Card elevation, 16px 20px padding.
- **Stat tile:** Card Inset fill, 10px radius, 8px 10px padding, no shadow. Used in the details panel.
- **Goal box:** Card Inset fill, 12px radius, 11px 12px padding. A target icon and a 13px/600 status line ("Template $280 · $30 short", "Goal $10,000 · 49% saved") in Pill Warning Text until the target is met, then Pill Positive Text; a 5px bar in the same colour; the Available pill's full sentence in Secondary text; and, when the automations UI is on, the category's template sentences. Shown only when goal templates are on and the month has a goal.
- **Pace chart:** 110px Recharts chart in the details panel with no axes. Cumulative spending by day is a stepped 2.5px line in the category accent (Pill Negative Text when Available is negative) over an 18% fill of the same colour; even pace is a dashed 1.5px Page Text Faint line; the current month adds a dotted Faint "today" line. A future month shows the pace line and a "No activity yet" chip on Card Inset. Legend and a 600-weight Secondary summary sit below; the text equivalent is the chart's accessible name. Privacy mode replaces the chart with a sentence. Long-term savings goals show the goal box instead.

### Inputs / Fields

- **Assigned cell editing:** the row takes the Selection Tint, and the input gets a 1.5px Actual Purple border. Upstream keyboard behavior is unchanged.
- Other inputs use the upstream style (4px radius, 1px border) until migrated.

### Navigation

- **Top bar:** segmented pill tabs (Budget, Accounts ▾, Reports, Schedules, More ▾), then utility controls on the right.
- **Accounts pane:** a collapsible list with On/Off budget totals, sync-status dots and balances. Collapsed, it is a 56px rail of initials and status dots. An account keeps one initial unless another account in the rail shares it; those take the first letters of two words (or the first two letters), then the letter plus position ("H1", "H2"). The full name stays the chip's accessible name and tooltip.
- **Menus:** Eyebrow group labels (0.06em tracking); rows and frame as in Menus and Popovers.

### Signature Component: The Envelope Table

One continuous table with Eyebrow column headers (Category | Assigned | Activity | Available). Group rows are tinted with Group Row and collapsible. Each category row holds the tile and name (the name is a button that opens the details panel), the editable Assigned amount, and the Activity amount with a percentage and progress bar. The Activity amount sits on the same line as Assigned and Available; the bar hangs 3px below it. It ends with an Available status pill. Row tools (notes, menu, drag handle) take no width and appear only on hover or keyboard focus. The Assigned cell's month notes and budget menu sit just left of the Assigned column, in a 48px gutter the Category cell keeps free, so the amount always has the whole column.

### Account Register

The account page's transaction table (APP-02), in one Surface card under the toolbar with the page's 20px side margins. Eyebrow column headers on the card, Card Hairline dividers and no stripes. Each row: a 22px payee initial circle tinted with the row's category accent (neutral for income, split, transfer, off-budget and uncategorized rows; the letter is drawn with CSS so the cell's text stays the payee name); tags keep their user colours with 4px corners; an 8px accent dot before the category name; cleared as a positive check, uncleared as a faint ring and reconciled as a faint lock, at 15px. Selected rows take Selection Tint and the 3px Actual Purple bar; the row being edited takes the tint. Schedule previews stay italic, with their upstream status colours in a small upright 6px-corner pill. While reconciling, the cleared column header turns Actual Purple. Columns are the user's; none are hidden at small widths. The look is opt-in (`isRegister`) so the Calendar report keeps upstream's until APP-03.

### Reports Dashboard

The Reports dashboard (APP-03a). The header is a "Reports" line in Secondary text over the dashboard name at Display size, with its rename pencil on hover or keyboard focus; the dashboard selector, Edit dashboard and ⋯ are Control buttons and Add new widget stays primary. Widgets sit on the user's saved grid with a 14px gap. Each widget is a Surface card **without** Card elevation (owner decision): hairline border, 18px radius, the border turning Page Text Faint on hover, and the focus ring on keyboard focus. Headers are 16px 20px: the title at 13.5px/600 on one line, the date range at 12px in Secondary text, and a headline value at 18px/700 where the widget has one. Change amounts are small status pills with their sign; the tone follows the colour the amount had before (for spending, an increase is negative). Summary widgets show their amount bottom-left at Display size, shrinking only to fit. Chart colours are the existing `reports*` roles, unchanged. Edit mode keeps colours: a dashed Page Text Faint border and an always-visible ⋯ Control button, with header room reserved for it.

### Report Pages

Each report page (APP-03b) follows the Net Worth drawing. The title is a "Reports · ‹dashboard›" eyebrow in Secondary text over the report's name at Display size (just "Reports" when the page was not opened from a saved widget), with the rename pencil on hover or keyboard focus. Choices between a few modes (Live/Static; Sankey's Spent/Budgeted; Spending's Single month/Budgeted/Average) are a **segmented control**: Tab and Tab Selected buttons on the Nav Track, 2px padding, 11px radius, each segment `aria-pressed`. Date range, Filter, interval, options and export are Control buttons; Save widget stays primary. The chart sits in a Surface card **without** Card elevation (20px 24px padding) on the page background: the report's name and its date range at 12px Secondary on the left; the headline total at Display size, any breakdown, and the change as a status pill on the right. Explanation text gets its own card. The Calendar report's month tiles and totals box are smaller Surface tiles (14px radius, 14px padding, no elevation). At narrow widths all of this stays upstream (mobile is deferred): the old toggle and button variants, the right-aligned total and coloured change, no cards.

The custom report editor (APP-03c) puts its toolbar above two cards. The chart choice is one five-segment **icon segmented control** (Data Table, Bar or Stacked Bar by mode, Line, Area, Donut; each segment named by `aria-label` with its tooltip, disabled segments at 45%); Legend, Summary and Labels are Control buttons with `aria-pressed`, Card Inset when on and their names hidden below 1280px; Download Snapshot and Filter are Control buttons; the saved-report menu is a "Report" Control button at the right, with "Unsaved changes" and a Pill Warning Text dot beside it while modified. The **settings card** (272px, hairline sections) holds Display (Mode as a segmented control; Split, Type, Interval, Sort and Options as full-width Control buttons), Date filters (Live/Static segmented, Range or From/To) and the category checklist, which scrolls inside the card; each category has an 8px accent dot. The **chart card** has the balance type and period on the left and the total at Display size; its summary (two Card Inset stat tiles with Eyebrow labels) and legend (10px chart-colour squares) sit in a 240px column beside the chart from 1280px and under it below. The Formula editor's Result, Formula and Appearance are cards, with Query Definitions as a card beside them from 1280px (queries as Card Inset tiles). The Calendar report's list is the account register (`isRegister`) without elevation or page margins (`isFlatRegister`). Narrow widths keep the upstream layout.

### Settings Page

The Settings page (APP-05d) is one 720px column at the page's left margin under the Display title. Each setting is a Surface card **without** elevation (18px 20px padding, 12px apart): the explanation in Secondary text with its bold lead term in Page Text, then the controls under a Card Hairline divider. Select labels are Eyebrow text; selects are Control buttons at least 32px tall and 170px wide; actions are Control buttons; checkboxes keep the shared checkbox with 5px corners and a Faint border. The version lines and IDs sit on Card Inset (10px radius); "You're up to date!" is a positive status pill; status text uses the pill text roles. "Show advanced settings" and the experimental-features reveal are Control buttons, and "Advanced Settings" is a Headline. Below the narrow breakpoint the page keeps the upstream look (mobile is deferred).

### Dialogs

Every desktop dialog (APP-06a, the shared `Modal` frame) is a Surface card with the Popover shadow: Card Hairline border, 18px radius, 18px 22px 20px padding, over the `scrim` without blur. The title is a left-aligned Headline on one line with the close button, a 30px icon button with no fill or border that takes the Row Hover wash on hover and the focus ring. `ModalButtons` sits 20px below the content; the buttons inside dialogs are still the upstream normal and primary buttons. The loading cover is Surface White with the card's radius. Each dialog's own contents keep their layout. Below the narrow breakpoint every dialog keeps the upstream frame (mobile is deferred).

### Menus and Popovers

Every desktop popover (APP-06b, the shared `Popover` frame) is a Surface card with the Popover shadow: Card Hairline border, 12px radius. Menus (`Menu`) sit 6px inside it. Rows are at least 32px tall with 0 10px padding, an 8px radius and 13px text; hover is the Row Hover wash, and a row reached with the arrow keys also takes the focus ring, inset 2px. Section labels are Eyebrows (11px/600, uppercase, 0.06em, Faint). Dividers are Card Hairline with a 6px 4px margin. Keyboard shortcuts sit at the right in an 18px key cap (Card Inset, 5px radius, 11px/600 Secondary). Toggles in menus are the upstream `Toggle`. Popover contents (date picker, autocomplete rows, notes, forms) keep their own layout; the autocomplete keeps its own background. Tooltips keep the upstream look. Below the narrow breakpoint menus and popovers keep the upstream frame.

### Toasts

Every desktop toast (APP-06c, `Notifications`) is a Surface card with the Popover shadow: Card Hairline border, 12px radius, 14px 44px 14px 14px padding, 13px text. The status is a 24px round icon in the type's pill tone (a check for messages, "!" for warnings, × for errors) and the card itself stays neutral; there is no coloured stripe. The title is 13.5px/600 Page Text, the message Secondary text, and links Page Text underlined. The action is a Control button; the close button is a 28px icon button with the Row Hover wash and the focus ring; `pre` text sits on Card Inset. Placement, the three-deep stack, timing and swipe-to-dismiss are upstream's. Below the narrow breakpoint toasts keep the upstream look.

### Account Hero

The account page's header (APP-01), a Surface card. From 1280px wide and 900px tall: an On budget / Off budget line in Secondary text, the account name at 28px/700 with its notes and rename buttons, Bank Sync and Reconcile as Control buttons at the top right, the balance as the Hero Amount, then a chip row. Smaller windows get one band: name and chips on the left, icon-only Bank Sync and Reconcile (accessible names kept) and the balance at Display size on the right. Chips are neutral pills for Cleared, Uncleared (after pressing the balance), Selected and Filtered totals; a lock chip for reconciliation status (positive once reconciled); and the bank-sync error as a negative pill that opens its existing popover. While reconciling, the card takes a 1px Actual Purple outline and holds a Card Inset band: a Difference pill (negative) or "All reconciled!" (positive), the existing sentence, and the existing buttons. The optional balance chart is a second Surface card beside the hero, or a short full-width card under the band when compact. Multi-account views show the name, balance and chips only.

### Signature Component: Ready to Assign Card

The page's hero card, with three states. Positive shows positive text and a hero glow. Zero shows neutral text and an "All assigned" badge. Negative shows negative text, an "Overassigned" badge and the negative glow. The badge sits beside the label; when the card is too narrow for both on one line, it takes the subline's place under the amount instead of wrapping. Clicking the card, or pressing Enter or Space, opens a popover with the existing breakdown and To Budget actions.

## Do's and Don'ts

### Do:

- **Do** route every color through `theme.*` roles and add a `fallback.css` entry for any new role. Check light, dark, midnight and one custom theme.
- **Do** wrap every standalone amount in `FinancialText` or `styles.tnum`.
- **Do** build new UI from the redesign primitives (`SurfaceCard`, `StatusPill`, `CategoryTile`, `ProgressBar`, the `tab` and `control` button variants) before writing new styles.
- **Do** give every status a non-color signal: a sign, icon, badge word or tag.
- **Do** keep row tools hidden until hover or keyboard focus, and keep them reachable by keyboard.
- **Do** gate every transition behind `prefers-reduced-motion: no-preference`.
- **Do** use Faint text only for headers and captions. Use Secondary text for readable supporting copy.

### Don't:

- **Don't** add shadows or glows beyond the approved list in Elevation & Depth.
- **Don't** use category accents to signal status, or purple as decoration.
- **Don't** use fintech-startup gloss: gradient heroes, glassmorphism, neon accents or crypto-dashboard styling. The approved page and hero glows are the only gradients.
- **Don't** use corporate banking patterns: navy-and-gold or enterprise-portal density.
- **Don't** add colored edge stripes thicker than 1px, except the approved 3px selected-row bar.
- **Don't** restyle existing upstream variants in place. Add an opt-in redesign variant so unmigrated screens don't change.
- **Don't** animate layout properties. Transitions are for color, opacity, shadow and progress width.

## Pending decisions

These are not rules yet. Until they are decided, follow the current behavior and do not record them as rules in this file.

- **Goal caption (D-3):** the caption under the category name for goal and template categories is left out. The target icon in the Available pill stays.
- **Mobile** is deferred. Mobile screens keep the upstream look apart from the TERM-01 wording.
