# Actual Budget UI overhaul — staged implementation plan

Status: approved implementation plan. Stage 0 complete; next is Stage 1 (prototype).
Prepared September 27, 2026. Revised September 27, 2026 for the Copilot-inspired visual direction (see §1.1).

## 1. The outcome we are aiming for

Make Actual Budget feel like a carefully designed modern desktop application while retaining the budgeting system that already works for you. The redesign should make information easier to scan, everyday actions easier to find, and controls more consistent.

The direction has two halves:

- **How it works: YNAB-style envelope budgeting.** Every dollar is given a job, categories are envelopes, and "Ready to Assign" is the number you drive to zero. Actual's existing envelope budget already does this, and it is not negotiable. It does not have to copy YNAB screen for screen; where Actual's behavior differs, Actual's behavior wins unless a change is explicitly reviewed.
- **How it looks: the Copilot Money visual language.** Soft, rounded, floating cards; a deep near-black dark mode and a warm off-white light mode; one confident hero number per surface; a colored accent per category, used for its tile and progress bar; pill-shaped status amounts; thin rounded progress bars; restrained, meaningful charts; and generous spacing with tabular numbers.

The chosen references are three Copilot-inspired variations. All three share the same top navigation, month selector, summary row, and grouped envelope table:

- [Concept A — Midnight](design-concepts/copilot/A-midnight-ledger-details.png): dark theme, one continuous envelope table with per-category progress in the Activity column, and a floating category-details card.
- [Concept B — Daylight](design-concepts/copilot/B-daylight-grouped-cards.png): light theme; each category group is its own card; same details card.
- [Concept C — Focus ledger](design-concepts/copilot/C-focus-ledger-trend.png): no details panel; a month spending-trend card and progress rings in the header; each category's progress bar sits under its name, with Assigned, Activity, and Available in aligned numeric columns.

The source for all three is [`design-concepts/copilot/concepts.html`](design-concepts/copilot/concepts.html) (render with `?v=1`, `?v=2`, `?v=3`). The owner likes all three. **The Stage 1 prototype chooses between them**: build A's single table and B's grouped cards, both with the details panel, plus C's trend header, then decide at real window sizes. Borrowing elements across variations is expected.

The earlier Codex concepts ([03](design-concepts/superseded/03-budget-with-details.png), [05](design-concepts/superseded/05-wide-ledger.png)) are superseded but kept for history. Their layout ideas (horizontal navigation, wide table, optional details panel) carry over into A–C.

This is a substantial front-end redesign. It is not a rewrite of Actual Budget. Work should proceed in small, reviewable changes that an implementation agent can complete without inventing architecture or redesigning unrelated screens.

### 1.1 Owner decisions (September 27, 2026)

| Topic           | Decision                                                                                                                                                                                                                                                 |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Visual language | Copilot-inspired (see above). Supersedes the earlier "layout only, the theme supplies the colors" rule; see §2 and §3.                                                                                                                                   |
| Budgeting model | Envelope budgeting as in YNAB, using Actual's existing envelope engine. Tracking budgets must keep working, but they are not the design target.                                                                                                          |
| Wording         | YNAB-style words in the envelope budget UI: **Assigned** (was Budgeted), **Activity** (was Spent), **Available** (was Balance), **Ready to Assign** (was To Budget). See §3 "Wording".                                                                   |
| Category icons  | **Automatic colors, no emoji.** Each category gets a stable accent chosen from its ID; its tile shows the category's first letter. Nothing new is stored. A user-chosen icon or emoji is a possible later project because it needs stored data (see §2). |
| Themes          | Design for the built-in **light, dark, and midnight** themes. Custom themes must still load and stay readable, but they may not style every new surface. Best effort, not a blocker.                                                                     |
| Layout          | Stage 1 prototype decides between A, B, and C.                                                                                                                                                                                                           |
| Font            | Keep Actual's bundled **Inter**. The mockups use the Mac system font, but Inter works on every platform and its figures already line up. Tune weights and tracking to get close to Copilot's look.                                                       |
| Charts          | Allowed where they explain the budget (category pace, month spending trend), built only from data the app already exposes. See §3 "Charts".                                                                                                              |

### What has and has not been established

Stage 0 is complete. The source, version, code map, theme contract, protected areas, and baseline checks are recorded in [stage-0.md](stage-0.md), [behavior-inventory.md](behavior-inventory.md), and [baseline/README.md](baseline/README.md). Where this plan and Stage 0 findings disagree about code, Stage 0 is authoritative.

The pictures are visual references, not exact functional specifications. They omit some existing controls (for example the budget menu, notes buttons, multi-month columns, and "For next month") and include an illustrative logo and sample data. The "Assign" button, the "All accounts" control, the notification bell, and the Month/Quarter/Year switch are styling placeholders, not approved features. Existing product behavior takes precedence over incidental details in the pictures.

## 2. Non-negotiable boundaries

### Preserve budgeting behavior

The same budget data must produce the same displayed financial results and the same saved changes before and after the redesign.

Preserve existing handling of allocations, balances, income, overspending, carryover, funds held for future months, transfers, transactions, and any additional budgeting modes found during discovery. A formula running in the browser is still budgeting logic: its location does not make it safe to change for this project.

Use existing selectors, formatters, query paths, commands, and mutation handlers. Do not introduce a second calculation engine or copy financial formulas into new presentation components.

### Leave the back end alone

This project does not authorize changes to servers, database schemas, migrations, sync protocols, storage formats, bank connections, authentication, or financial calculation code.

UI code may call existing APIs in the same supported ways. If a proposed design needs a new API, new persisted field, or changed calculation, document that dependency and choose a simpler presentation where possible. Do not silently expand the project.

Known deferred example: **user-chosen category icons, emoji, or colors** would need new stored category data (loot-core schema, sync, and API), so they are out of scope. The approved alternative is an automatic color derived from the category ID (§3). If the owner later wants user-chosen icons, plan it as a separate project with its own back-end review.

A file can contain both styling and business logic. Review the changed lines as well as file locations; a front-end filename is not proof that a change is presentation-only.

### Keep colors in the theme system

The Copilot look needs colors the current themes don't define: category accents, tinted status pills, card elevation, and hero glows. **Add these as new theme roles** in the existing theme files (`packages/component-library/src/themes/*.css`, exposed through `@actual-app/components/theme`), with values for light, dark, and midnight. Components use theme roles only and never raw hex values. That keeps dark mode, light mode, and future palette changes in one place.

Existing roles keep their meaning. Change a built-in theme's existing values only when a reviewed design decision requires it, and check the other screens that use the role.

Custom themes: every new role must have a sensible fallback, meaning a built-in value or an existing role, so a custom theme that doesn't define it still loads and stays readable. It is acceptable for a custom theme to show new surfaces in the built-in accent colors. Do not change custom-theme parsing or validation.

### Keep financial meaning in existing code

Progress bars, percentages, and charts are **presentation-only**. They may derive display values from amounts the app already provides (assigned, activity, available, and transactions from existing queries), but:

- they never feed a saved value, a total, or another calculation;
- they never replace or contradict an existing number; the number stays on screen next to the visual;
- their formula is written down in the design-decisions record (§6) and has a unit test for edge cases (zero, negative, overspent, carryover);
- any day-by-day math for charts lives in one small, tested presentation helper, not scattered across components.

### Preserve working features and access

Moving a control is acceptable only when it remains discoverable and usable. Budget switching, account access, closed accounts, adding accounts, payees, rules, tags, settings, help, connection status, privacy mode, and uncategorized-transaction access must be accounted for.

Preserve supported keyboard actions, inline editing, context menus, scrolling, filtering, and navigation. Inventory the actual capabilities before promising feature parity.

### Keep the real budget safe during development

Develop and exercise mutations against a disposable budget using fictional data. Start by confirming that the development instance cannot accidentally open or change the live budget.

No production migration, live financial-data editing, or replacement of the installed app is part of this planning deliverable.

## 3. Proposed design specification

These are starting decisions to validate in the Stage 1 prototype. Values are targets, not global CSS rules.

### Visual language

| Element        | Target                                                                                                                                                                                                                                         |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Surfaces       | Page background with a very soft colored glow at the top (dark: near-black; light: warm off-white). Content sits on **cards**: 1px hairline border, soft shadow, 16–20px corner radius.                                                        |
| Controls       | 36–40px high, 10–12px radius. Primary navigation is a **segmented pill tab bar**. Icon buttons are rounded squares.                                                                                                                            |
| Typography     | Inter (bundled). Hero amounts 28–40px bold with tight tracking (about −0.03em); card labels 13px medium in secondary text; table column headers 12px uppercase with wide tracking; tabular figures everywhere money appears (`FinancialText`). |
| Status amounts | Available amounts shown as **pills**: tinted background plus colored text. Positive = positive tint, zero = neutral, negative = negative tint **and** a minus sign or "Overspent" label, never color alone.                                    |
| Progress       | Thin (5–8px) fully rounded bars on a subtle track, filled with the category accent; the negative color when overspent.                                                                                                                         |
| Spacing        | 4/8px scale; card padding 18–22px; 14–20px gaps between cards.                                                                                                                                                                                 |
| Motion         | Short (≤200ms) fades and slides for the panel and progress fills only. Honor reduced-motion preferences.                                                                                                                                       |
| Brand          | Keep Actual's existing logo and name. The gradient "A" in the mockups is a placeholder.                                                                                                                                                        |

### Navigation and accounts

Use the horizontal navigation shared by all three concepts on sufficiently wide desktop windows: Budget, Accounts, Reports, and Schedules, styled as a segmented pill bar.

Place secondary destinations (payees, rules, tags, settings, help) in a clearly labeled menu, with settings and important status indicators readily accessible. Retain the existing budget switcher.

Provide an account navigation control that reveals the existing account list and actions. Opening an account should navigate to its transactions using existing routing.

**Do not implement the mockups' "All accounts" control as a filter that changes envelope budget totals.** Envelope budgets and bank accounts are different views of money. The control in the pictures is a placeholder for account access, not a budget filter.

On smaller windows, use a compact navigation menu or drawer that preserves access to all destinations. Do not maintain two independently implemented sets of navigation behavior.

### Budget header and summary

Header: a small "Budget" eyebrow, the month as the page title, and the existing month navigation as a pill control.

Summary row, as in Concepts A and B:

1. **Ready to Assign** hero card: the existing To Budget amount, the largest number on the page. Positive gets the positive color and soft glow; zero is neutral ("All money assigned"); negative uses the negative style and an explicit label. Clicking it opens the **existing** To Budget menu. The mockups' "Assign" button is not a new action.
2. **Assigned** card: the existing total budgeted.
3. **Activity** card: the existing total spent, with a stacked bar split by category accent (largest categories, then "Other"). The bar is decoration next to the number and adds no new total.

The existing breakdown (Available funds, Overspent in previous month, Assigned, For next month) must stay reachable, for example as an expandable section of the hero card. Rearrange existing summary information; don't replace it with the mockups' simplified three-number formula.

Concept C's alternative: a month spending-trend card (see "Charts") plus progress rings for Ready to Assign and Assigned. The prototype decides whether this is the default header, an optional state, or dropped.

Multi-month views: the summary cards describe the focused month. When several months are visible, keep per-month summary information available per column as today; the prototype must show this.

### Envelope table

Columns: **Category | Assigned | Activity | Available**.

- **Assigned** remains the inline-editable amount with existing keyboard behavior.
- **Activity** shows the amount plus a progress bar (Concept A/B), or the bar sits under the category name (Concept C). Clicking the amount keeps its existing navigation to filtered transactions.
- **Available** is a status pill. Clicking it keeps the existing balance menu (cover, transfer, rollover). Existing carryover indicators and goal/template status meanings must survive, mapped onto pill tints rather than removed.

**Progress-bar formula** (presentation only; record in design decisions and unit-test it):

- `spent = max(0, −activity)`; `startingAvailable = spent + available`.
- If `available < 0`: overspent. Full bar in the negative color, and the pill shows the negative amount.
- Else if `startingAvailable ≤ 0` or `spent = 0`: empty bar.
- Else: fill = `spent / startingAvailable`.
- This counts carryover, so the bar answers "how much of this envelope is used?", which is the YNAB meaning. It uses only amounts already displayed.

**Category tile:** a rounded square with the category accent at low opacity and the first character of the name (first grapheme cluster, so names starting with an emoji or a non-Latin letter work). The tile is decorative (`aria-hidden`) because the name is next to it. Group rows have no tile.

**Grouping:** Concept A uses one continuous table with tinted group rows; Concept B puts each group in its own card. The prototype decides. Group rows show group totals and a group Available pill, and keep collapse, drag-and-drop, menus, and notes.

**Density:** the mockups use about 50px rows. Actual currently uses much denser rows. Prototype a comfortable density (about 44–50px) and check how many categories fit at about 1000×700. BudgetCategories is not virtualized (Stage 0), but do not change the shared Table's `ROW_HEIGHT` for this.

Avoid adding a second set of editable balances or a decorative total whose meaning differs from existing totals.

### Category accent colors

- Add a fixed set of about 10 category-accent theme roles (e.g. `categoryAccent1`…`categoryAccent10`), tuned separately for light, dark, and midnight.
- `accent = roles[stableHash(category.id) % roles.length]`. Based on the ID, so the color survives renames and is the same on every device without storing anything.
- Two categories sharing a color is acceptable.
- Income categories and group rows use neutral styling.
- The accent always sits next to text, so color is never the only carrier of meaning.

### Wording

In the envelope budget UI (desktop budget table and summary, details panel, and the matching mobile envelope screens):

| Current (Actual) | New (YNAB-style) |
| ---------------- | ---------------- |
| Budgeted         | Assigned         |
| Spent            | Activity         |
| Balance          | Available        |
| To Budget        | Ready to Assign  |
| Overbudgeted     | Overassigned     |

Rules:

- Change **visible text only**. Do not rename code identifiers, spreadsheet bindings, preference keys, API fields, or stored data.
- Keep a complete old→new list in the design-decisions record. Change menu items and tooltips that use these words in the same pass, so a menu doesn't say "budgeted" next to a column saying "Assigned".
- Tracking budgets keep their current wording unless the prototype review decides otherwise.
- Actual's translations use the English text as the key (`packages/desktop-client/src/i18n.ts`: `keySeparator: false`, `fallbackLng: false`). A changed string means non-English languages show the new English text until translated. That is acceptable for this fork; record it. Regenerate i18n files with the repository's `generate:i18n` script.
- Actual's published docs still use the old words. Don't edit `packages/docs` for this fork unless asked.

### Category details

A floating card beside the table (Concepts A and B). Start read-only:

- Tile, category name, and group name.
- Hero: the category's **Available** amount with an "Available" label, plus the same progress bar as the row.
- Small stat tiles: Assigned, Activity, and last month's Activity from the existing per-month bindings.
- **Pace chart**, current month only: cumulative spending by day from the existing category/month transaction query (see `CategoryTransactions.tsx`), against a dashed even-pace line from 0 to `startingAvailable` across the month, plus a text summary ("$140 under pace"). Past months show the completed line without a pace label; future months hide the chart.
- Notes (read-only at first) and the month's transactions, using the existing query and its handling of splits, transfers, and refunds.

Use a dedicated details control or an existing compatible selection action. Clicking an Assigned amount must continue to start editing. Do not repurpose double-click, right-click, or row selection until their current behavior has been mapped.

At wide widths, show the side card (about 340–380px). At narrower widths, use an accessible overlay or drawer so financial columns stay readable. DynamicBudgetTable's month count must account for the panel's width.

Closing the panel should restore focus to its opener and keep the table's scroll position. Changing month must refresh the panel consistently. Deleting, hiding, or changing the selected category must not leave stale details.

Transaction entries can first open the existing transaction view. Editable notes or transaction actions come only after the read-only integration is sound, and must reuse the current save handlers.

### Charts

Allowed charts:

- **Activity stacked bar** in the summary.
- **Category pace chart** in the details panel.
- **Month trend** (Concept C): cumulative spending this month against last month.

Rules:

- Use the chart library the app already uses for reports; no new dependency.
- Build charts only from existing queries and bindings, through the tested presentation helper required in §2.
- Every chart has a text equivalent next to it.
- Privacy mode hides chart values and blurs or hides the chart.
- Respect reduced motion.
- The Month/Quarter/Year switch in Concept C is a placeholder. Only add it if existing data paths support it without new calculations.

### Visual boundaries

- No new logo or brand identity, no custom fonts, and no illustrations.
- Charts only as listed above.
- Financial warnings must remain clear without relying on color alone.

## 4. How we will organize the work

There are three responsibilities, even if only you and one AI are actively working:

- **You, the product owner:** judge whether the design is attractive and whether familiar tasks feel comfortable.
- **The coordinating agent:** inspect architecture, settle design decisions, define bounded tasks, review changes, and verify integration.
- **An implementation agent:** complete one specified task with an explicit file scope and acceptance checks.

A less capable implementation agent should not receive “redesign Actual Budget” as its assignment. It should receive something like: “Restyle this existing month toolbar using these theme values; preserve these handlers; change only these files; verify these behaviors.”

Each task produces a small change, a brief explanation, and evidence that its acceptance checks passed. Keep source changes separate from broad formatting or dependency upgrades.

Do not dispatch overlapping edits to shared components. Several tasks can eventually run independently, but parallel work should follow a confirmed dependency map and ownership boundaries.

## 5. Stage 0 — Locate the code and establish the baseline

### Purpose

Remove assumptions before an agent edits the application.

### Work

1. Locate the correct source repository and identify its version, branch, upstream relationship, local changes, and repository instructions.
2. Establish an isolated development checkout and a disposable budget. Confirm how desktop and browser builds relate.
3. Run the app using the repository's supported setup. Record exact working commands and relevant environment requirements without recording secrets.
4. Locate navigation, the budget table, budget summary, account register, report dashboard, settings, theme definitions, accessibility utilities, and existing tests.
5. Map every visible action to its existing route, state source, and mutation path.
6. Identify virtualization, measured row heights, drag-and-drop behavior, keyboard handling, and supported multi-month budgeting.
7. Identify the existing feature-switch or development-preview mechanism. Prefer that mechanism; do not invent a persisted setting solely for rollout.
8. Capture screenshots and behavior notes from representative workflows, themes, and window sizes.
9. Run existing relevant checks and distinguish pre-existing failures from new problems.

### Deliverables

- A repository map with verified file paths and commands.
- A behavior inventory, including controls absent from the mockups.
- A protected-code list covering financial logic, storage, server, and sync areas.
- A disposable test fixture and baseline screenshots.
- A dependency-ordered backlog using the actual code structure.

### Exit condition

The coordinating agent can explain exactly where presentation changes belong and demonstrate a working development instance without relying on the live budget.

**No production UI implementation should precede this stage.**

**Status: complete.** See [stage-0.md](stage-0.md) and [baseline/README.md](baseline/README.md). The backlog deliverable is the task table in §14; `backlog.md` referenced from the handbook has not been written yet.

## 6. Stage 1 — Resolve the combined design in a prototype

### Purpose

Make layout decisions cheaply before integrating with complex budgeting interactions.

### Work

Build a local front-end prototype with fictional data. Start from [`design-concepts/copilot/concepts.html`](design-concepts/copilot/concepts.html), or build it inside the app behind a front-end-only switch (see stage-0.md "Preview strategy"). A static prototype is acceptable if clearly labeled and never used as the source of financial calculations. Install and use the repository's Impeccable design skill, and read `PRODUCT.md` and `DESIGN.md` first (stage-0.md).

Demonstrate, in both light and dark:

- **Layout candidates side by side:** A (one continuous table), B (group cards), and C's trend header over either one.
- Horizontal pill navigation, account access, and secondary destinations.
- Details panel closed and open, including the pace chart for current, past, and future months.
- Summary: Ready to Assign positive, zero, and negative, and the breakdown expanded.
- Row states: normal, hover, selected, editing, **overspent** (negative pill and full negative bar), zero assigned, carryover, and goal/template status.
- Long category names, names starting with an emoji or a non-Latin letter, and many categories (30 or more).
- Multi-month view with two or three months, which Actual supports.
- Density: about 44px and about 50px rows at about 1000×700.
- Narrow-screen fallback.
- The category-accent palette on all three built-in themes, plus one custom theme to confirm the fallbacks.

The original observed app window was approximately 1000 by 700 pixels. A design that only works in a large presentation image is insufficient.

### Decisions to record

Confirm: layout A vs B, whether to use C's trend header, top navigation vs a retained sidebar, how accounts are reached, how the details panel opens, row density, where the summary breakdown lives, the final category-accent palette values, the complete wording list (old → new), and the progress-bar and pace formulas.

Record these choices in a short design-decisions document. Implementation agents follow that document instead of making independent aesthetic choices.

### Exit condition

You can review the prototype and agree on the direction. The coordinating agent verifies that it preserves the known workflows. This is the main design checkpoint; routine implementation tasks afterward do not each need a new design discussion.

## 7. Stage 2 — Establish reusable styling and theme compatibility

### Purpose

Create a small set of consistent UI foundations so later screens do not diverge.

### Work

Map the approved design to existing theme roles, and **add the new roles** it needs to light, dark, and midnight: card surface and elevation, hairline border, page glow, positive/neutral/negative pill tints, progress track, and the category-accent set. Give every new role a fallback. Define spacing, text hierarchy, control sizes, corner rounding, and focus treatment using the repository's conventions.

Style a limited set of reusable pieces: card, buttons, icon buttons, fields, segmented pill navigation, page headers, hero/summary values, status pill, progress bar, category tile, and the details-panel frame.

Add the tested presentation helpers: category accent from ID, progress fraction, and pace series.

Reuse existing components where possible. If changing a shared component would immediately affect many unrelated screens, introduce an opt-in visual variant or scope the change to the redesigned area first.

Create a lightweight preview of the component states: default, hover, focused, active, disabled, loading, error, and long-label cases.

### Exit condition

The components look right in light, dark, and midnight. Components contain no raw hex values; all colors come from theme roles. An existing custom theme still loads and stays readable, falling back to built-in values for new roles. Helper unit tests cover zero, negative, overspent, and carryover cases.

## 8. Stage 3 — Integrate the application navigation

### Purpose

Introduce the new application frame without altering page behavior.

### Work

Add the approved top navigation and account access using current routes and existing account-list components. Keep the redesigned frame available through the verified preview mechanism while the existing layout remains the default.

Account switching, budget switching, browser back/forward where applicable, help, privacy mode, connection indicators, and secondary destinations must remain functional.

Apply the shared header and content-width conventions. At this point, the pages inside the new frame can retain their existing appearance.

### Exit condition

Every item in the navigation inventory is reachable. All supported direct links still work. Narrow windows expose the same destinations without overlap or inaccessible controls.

Opening the account menu does not change financial state. Privacy mode also covers any balance shown in the new frame.

## 9. Stage 4 — Redesign the budget header and table

### Purpose

Deliver the core visual improvement using existing budgeting behavior.

### Work, in order

1. Restyle the month toolbar and rebuild the summary as cards (Ready to Assign hero, Assigned, Activity), keeping the existing breakdown and To Budget menu.
2. Apply the approved wording in the envelope budget (§3 "Wording"). Change only `Balance` strings that refer to category balances, not account balances. Regenerate i18n files.
3. Restyle table headers and group rows, or group cards, per the Stage 1 decision.
4. Add category tiles, Available pills, and progress bars; align amounts; restyle separators, selection, and focus.
5. Verify inline editing before adding any details-panel interaction.
6. Preserve existing menus, notes access, group collapse, drag-and-drop, and category organization.
7. Verify scroll behavior, row measurements, long lists, and multi-month layouts at the chosen density.
8. Check summary and row values against the baseline fixture after each relevant action.
9. If chosen in Stage 1, add Concept C's trend header as a separate task after the table is stable.

Do not replace the existing table or grid library simply to match the mockup. First determine whether the current implementation can support the design through styles and small presentation changes.

### Exit condition

The new budget screen is usable on its own with the details panel closed. Existing budgeting tasks produce the same results as before, and keyboard entry remains reliable.

A visual match is not sufficient if editing or scrolling regresses.

## 10. Stage 5 — Add category details progressively

### Purpose

Make category context easier to inspect without destabilizing the main table.

### Part A: read-only integration

Connect selection to the approved panel opener. Read category and month data through existing application mechanisms. Display the existing formatted amounts, notes, and last month's activity. Add the pace chart last, using the tested pace helper, with its text summary and privacy handling.

Reuse existing transaction queries or selectors for the category and selected month. Preserve established treatment of split transactions, refunds, transfers, and hidden or deleted data. Do not infer query rules from the displayed category name.

Provide loading, empty, unavailable, and error states. Prevent a slow response for a previous selection from overwriting the current selection.

Verify that opening the panel does not save or alter budget data.

### Part B: existing actions

Add links to the current transaction view and, if useful, existing notes editing. Keep one source of truth for editing and saving.

Preserve existing handling of unsaved edits. Closing the panel must not silently discard a note or save it in a new, surprising way.

Do not build a second full transaction editor inside the panel during this stage.

### Exit condition

Panel values agree with the table, month changes refresh both, keyboard focus behaves predictably, and narrow-screen presentation is usable. Existing privacy mode hides all relevant information in the panel, including chart values. The pace chart matches a hand-checked fixture month.

## 11. Stage 6 — Extend the design to the rest of the app

### Purpose

Make the application feel coherent beyond its main screen.

### Order

1. **Accounts and transactions:** balance hero card, header, search, filters, toolbar, table styling, and editor presentation in the card style. Payee avatars (a colored circle with the initial, color from the payee ID, as in the details panel) are optional styling that stores nothing. Preserve reconciliation, splits, sorting, selection, bulk actions, and other discovered capabilities.
2. **Reports:** widgets as Copilot-style cards, consistent dashboard controls, spacing, and text hierarchy, and chart colors from the new accent roles where the chart library allows. Preserve report calculations, filters, saved configurations, and interactions. Do not replace charting libraries for cosmetic reasons.
3. **Schedules:** apply shared controls and table conventions while preserving recurrence, status, and transaction-creation behavior.
4. **Payees, rules, tags, and settings:** improve page structure and control consistency without changing how rules run or settings are stored.
5. **Dialogs, menus, and feedback:** finish remaining confirmation dialogs, errors, empty states, loading states, and notifications.

Treat each screen or tightly related component as a separate task. The first redesigned account register should be reviewed before spreading its table styles to other pages.

### Exit condition

The agreed major surfaces use the same design conventions. Any intentionally deferred screen is explicitly listed; the project must not claim a complete overhaul while substantial unfinished screens remain.

## 12. Stage 7 — Verify the integrated experience

### Purpose

Find problems that individual component checks will not catch.

### Required verification areas

| Area                | Evidence required                                                                                                                                                             |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Budget correctness  | Same fixture values and saved outcomes before and after representative allocation, month, and transaction actions; progress bars and pace charts agree with displayed amounts |
| Theme compatibility | Light, dark, and midnight look as designed; an existing custom theme loads and stays readable                                                                                 |
| Navigation          | Every inventoried destination, account and budget switching, direct links, and back/forward where supported                                                                   |
| Editing             | Keyboard and pointer entry, commit/cancel, menus, selection, splits, and unsaved-note handling                                                                                |
| Details panel       | Correct category/month, loading and empty states, rapid switching, close/reopen, privacy                                                                                      |
| Layout              | Approximately 1000×700, common laptop and large desktop widths, narrow layout, and 200% zoom                                                                                  |
| Accessibility       | Visible focus, logical tab order, meaningful labels, keyboard operation, no color-only financial warnings, AA contrast for pill text and secondary text on cards              |
| Long content        | Long names, emoji or non-Latin first characters, large and negative amounts, currency/locale formatting, many rows, and overflowing menus                                     |
| Performance         | No material regression against the same baseline fixture and machine; table edits and scrolling remain responsive; shadows and blur don't slow scrolling                      |
| Scope               | Diff review confirms no unauthorized financial, server, schema, storage, or sync changes                                                                                      |

Use the repository's existing automated checks. Add focused behavior tests where interactions changed, such as panel selection and navigation. Use screenshot comparisons and manual review for visual changes rather than tests that merely repeat CSS values.

Establish concrete performance thresholds from the measured baseline in Stage 0. Do not invent universal timings or claim success without measurement.

### User walkthrough

Ask you to perform a short set of familiar tasks in the disposable budget: find an account, inspect an envelope, assign money until Ready to Assign reaches zero, cover an overspent category, switch months, inspect a transaction, and switch between light and dark.

Record points of confusion as work items. You should not have to know implementation details to give useful feedback.

### Exit condition

Required checks pass, significant regressions are fixed, and the evidence is recorded. Any remaining limitation is documented with its impact and an explicit scope decision.

## 13. Stage 8 — Release and preserve a recovery path

### Purpose

Make the redesigned build available in a controlled, reversible way.

### Work

Prepare the build using the repository's established release process. Record the version, relevant changes, verification evidence, and how to return to the previous version.

Enable the new presentation only after integration checks and the user walkthrough. Avoid retaining two hidden, active copies of complex screens; that can duplicate handlers or work.

Keep the old presentation or a practical code-revert path available during initial use. Because this project introduces no data migration, recovery should be a UI/build rollback rather than a database transformation.

Remove temporary preview scaffolding in a separate reviewed change once the redesign is accepted. Do not combine cleanup with unrelated refactoring.

### Exit condition

The installed or deployed build is verified, normal workflows have been exercised, and recovery instructions are usable. Creating a build alone is not evidence that delivery succeeded.

## 14. Initial task breakdown for implementation agents

These are planning IDs, not created GitHub issues. Stage 0 must add verified file allowlists, exact commands, and repository-specific details before a ticket becomes ready.

| ID         | Task                                                                 | Depends on               | Completion evidence                                                       |
| ---------- | -------------------------------------------------------------------- | ------------------------ | ------------------------------------------------------------------------- |
| DISC-01    | Locate repository, instructions, and runnable development setup      | None                     | Verified version, paths, commands, isolated sample budget                 |
| DISC-02    | Map behavior, themes, protected code, and baseline checks            | DISC-01                  | Repository map, behavior inventory, screenshots, baseline results         |
| DESIGN-01  | Prototype layouts A/B (+ C header), navigation, and account access   | DISC-02                  | Side-by-side light/dark previews at wide and ~1000×700; destination map   |
| DESIGN-02  | Prototype details panel, summary states, row states, and multi-month | DESIGN-01                | Closed/open states, overspent/zero/carryover rows, narrow fallback        |
| DESIGN-03  | Record design decisions: layout, density, palette, wording, formulas | DESIGN-02                | `design-decisions.md` approved by owner                                   |
| UI-01      | Add new theme roles (cards, pills, track, accents) with fallbacks    | DESIGN-03                | Light/dark/midnight previews; custom theme still loads                    |
| UI-02      | Style shared controls, card, pill, progress bar, tile, focus states  | UI-01                    | State preview and targeted interaction checks                             |
| UI-03      | Presentation helpers: accent-from-ID, progress fraction, pace series | DESIGN-03                | Unit tests for zero/negative/overspent/carryover/empty month              |
| NAV-01     | Integrate top navigation and secondary destinations                  | UI-02                    | Route and keyboard checks                                                 |
| NAV-02     | Integrate account access, budget switcher, and status controls       | NAV-01                   | Account actions, privacy, and small-window checks                         |
| BUD-01     | Month toolbar and summary cards (Ready to Assign hero)               | NAV-02                   | Identical values, complete breakdown, To Budget menu, date navigation     |
| TERM-01    | Apply YNAB-style wording to envelope budget UI and menus             | BUD-01                   | Old→new list fully applied; account "Balance" untouched; i18n regenerated |
| BUD-02     | Restyle grouped table: tiles, pills, progress bars, chosen density   | TERM-01, UI-03           | Visual review and edit/scroll/drag regression checks                      |
| BUD-03     | Complete budget menus, long content, and multi-month support         | BUD-02                   | Behavior inventory reconciled with new budget screen                      |
| DETAIL-01  | Implement panel frame, opener, closing, and focus                    | BUD-03                   | Selection and narrow-layout checks                                        |
| DETAIL-02  | Connect read-only category/month details                             | DETAIL-01                | Correct values, transactions, loading/error and rapid-switch tests        |
| DETAIL-04  | Add pace chart with text summary and privacy handling                | DETAIL-02, UI-03         | Matches hand-checked fixture month; current/past/future month states      |
| BUD-04     | Concept C trend header (only if chosen in DESIGN-03)                 | BUD-03, UI-03            | Values from existing queries; privacy and reduced-motion checks           |
| DETAIL-03  | Integrate existing transaction links and notes action                | DETAIL-02                | Existing routes/save behavior retained; privacy verified                  |
| APP-01     | Restyle account/register headers and controls                        | BUD-03                   | Search/filter/account action checks                                       |
| APP-02     | Restyle transaction table and editor presentation                    | APP-01                   | Editing, splits, selection, and reconciliation checks where supported     |
| APP-03     | Restyle Reports dashboard and controls                               | UI-02, NAV-02            | Report behavior and saved-layout checks                                   |
| APP-04     | Restyle Schedules                                                    | UI-02, NAV-02            | Existing schedule behaviors checked                                       |
| APP-05     | Restyle Payees, Rules, Tags, and Settings in separate small changes  | UI-02, NAV-02            | Per-page behavior checks; no logic changes                                |
| APP-06     | Finish remaining dialogs, menus, loading, empty, and error states    | APP-01–05, DETAIL-03     | Consistency review and keyboard checks                                    |
| QA-01      | Run cross-screen, theme, accessibility, and performance review       | All implementation tasks | Recorded verification matrix and resolved regressions                     |
| RELEASE-01 | Prepare build, user walkthrough, delivery, and rollback instructions | QA-01                    | Verified release and recovery path                                        |

The table expresses dependencies, not a requirement to launch multiple agents. The coordinating agent should split any ticket further if it affects unrelated behaviors or exceeds a clear reviewable scope.

## 15. Ready-to-use implementation-agent brief

Copy this section into an individual task after filling every required field.

> **Task ID and objective:** [One visible outcome.]
>
> **Read first:** [Repository instructions, architecture notes, approved design decision, relevant reference image.]
>
> **Starting state:** [Branch/commit, existing local changes to preserve, prerequisite task status.]
>
> **Allowed files:** [Exact verified paths or a tightly bounded directory.]
>
> **Protected behavior:** [Specific routes, handlers, editing behavior, financial values, theme support, and keyboard actions this task must retain.]
>
> **Implementation instructions:** [A short sequence of concrete changes, naming existing components and theme roles verified from source.]
>
> **Out of scope:** Backend, schemas, sync, storage formats, financial formulas, unrelated refactors, new dependencies unless explicitly included, and other unassigned screens.
>
> **Acceptance checks:** [Observable pass/fail criteria, including relevant negative and edge cases.]
>
> **Verification:** [Exact commands, fixture, UI steps, themes, and viewport sizes.]
>
> **Stop and report:** If the design needs protected-code changes, the stated APIs do not exist, the baseline is unclear, or a required behavior cannot be preserved. Explain the conflict and propose the smallest alternative.
>
> **Return:** Changed files; concise explanation; checks actually run and their results; before/after screenshots where relevant; remaining limitations. Do not claim completion for a check that was skipped.

Example of an appropriately narrow outcome: “The existing budget month selector uses the approved spacing and button style, retains its existing handlers and keyboard navigation, and does not overlap the summary at 1000×700.”

Example of an assignment that needs splitting: “Make the budget page look like Concept A, with the Copilot colors and the details panel.”

## 16. Review and handoff rules

A task is ready when its dependencies are complete, the file scope is known, the desired behavior is explicit, and the required checks can be run.

A task is done when the implementation is present, acceptance checks have passed, the diff has been reviewed, and the next agent has enough evidence to continue.

Keep a small status ledger with task ID, state, change/commit reference, checks, and open questions. Use states such as not started, ready, in progress, review, verified, and blocked. “Implemented” and “verified” are different.

When practical, keep each task in a separate commit or reviewable change. Do not bundle financial refactors with visual polish. Preserve unrelated user work.

A reviewer should specifically inspect:

- Whether the change duplicated financial logic or state.
- Whether a custom theme still controls every new surface.
- Whether any control disappeared or changed meaning.
- Whether table measurements, focus, scrolling, and editing remain coordinated.
- Whether a screenshot hides a failure at smaller sizes or in another theme.
- Whether the reported tests actually cover the changed interaction.

Do not update screenshot baselines merely to make a failing comparison pass. Inspect the difference and explain why the new result is intentional.

## 17. Fixture guidance and interpreting the mockups

Use fictional data consistently so before/after comparisons are meaningful. Verify fixture values through the application rather than treating a generated picture as an accounting specification.

For the example rows used in the pictures (activity shown as money spent):

| Category                  | Assigned | Activity | Available |
| ------------------------- | -------: | -------: | --------: |
| Rent                      |    1,800 |    1,800 |         0 |
| Groceries                 |      600 |      240 |       360 |
| Utilities                 |      250 |      160 |        90 |
| Transport                 |      200 |       80 |       120 |
| Subscriptions             |      100 |       60 |        40 |
| Dining out                |      250 |      100 |       150 |
| Monthly expenses subtotal |    3,200 |    2,440 |       760 |
| Emergency fund            |      700 |        0 |       700 |
| Vacation                  |      300 |        0 |       300 |
| Overall total             |    4,200 |    2,440 |     1,760 |

These simple totals are illustration-only. Use the actual app's fixture and existing calculation paths for real verification, especially where carryover, refunds, or other budgeting rules affect balances. Also add cases for overspending, a zero allocation, long category names, negative values, empty transactions, and multi-month views.

Do not assume the header's simplified available-funds equation describes every valid budget state. Do not use the mockup account balances as an accounting fixture.

## 18. Timeline and the first useful milestone

The earlier 4–8 week estimate was a rough planning range before inspecting the repository. It should not be treated as a delivery commitment or converted into exact ticket deadlines.

Re-estimate after Stage 0 and again after the first integrated budget screen. Setup complexity, existing test quality, virtualized tables, theme compatibility, and the time spent choosing the design will strongly affect the schedule.

The first milestone worth aiming for is:

**A functioning development build with the approved pill navigation, the Copilot-style summary cards and envelope table (tiles, pills, progress bars, YNAB wording) in light and dark, unchanged financial behavior, and the details panel still optional or not yet integrated.**

That provides a useful, testable result before the full cross-app overhaul. The next milestone is the working details panel; the final milestone is consistency and verification across the rest of the app.

Stage 0 (DISC-01, DISC-02) is complete. The next assignment is DESIGN-01. No application source changes have been made yet.
