# Actual Budget UI overhaul — staged implementation plan

Status: proposed implementation plan, ready for repository discovery.
Prepared September 27, 2026.

## 1. The outcome we are aiming for

Make Actual Budget feel like a carefully designed modern desktop application while retaining the budgeting system that already works for you. The redesign should make information easier to scan, everyday actions easier to find, and controls more consistent.

The chosen references are:

- [Concept 5 — Wide ledger](design-concepts/05-wide-ledger.png): horizontal navigation, a wide budget table, a clear month selector, and a compact budget summary.
- [Concept 3 — Budget with details](design-concepts/03-budget-with-details.png): the same grouped envelope table with category information, notes, and related transactions available alongside it.

The recommended combination is **a wide budget workspace with a details panel that opens when needed**. We should prototype this combination before making it the final layout. Liking both pictures does not necessarily mean wanting every element of both.

This is a substantial front-end redesign. It is not a rewrite of Actual Budget. Work should proceed in small, reviewable changes that an implementation agent can complete without inventing architecture or redesigning unrelated screens.

### What has and has not been established

We have visually inspected Budget, All Accounts, and Reports in the installed application. We have not inspected its source code, confirmed its version or fork, located its test suites, or verified the internal theme and state-management APIs.

The current project workspace contains the concept images, not an application checkout. Therefore, component names, code paths, commands, and time estimates must be established in Stage 0. Names used below for proposed UI pieces describe responsibilities; they are not claims about existing code.

The generated pictures are visual references, not exact functional specifications. They omit some existing controls and include illustrative branding and sample data. Existing product behavior takes precedence over incidental details in the pictures.

## 2. Non-negotiable boundaries

### Preserve budgeting behavior

The same budget data must produce the same displayed financial results and the same saved changes before and after the redesign.

Preserve existing handling of allocations, balances, income, overspending, carryover, funds held for future months, transfers, transactions, and any additional budgeting modes found during discovery. A formula running in the browser is still budgeting logic: its location does not make it safe to change for this project.

Use existing selectors, formatters, query paths, commands, and mutation handlers. Do not introduce a second calculation engine or copy financial formulas into new presentation components.

### Leave the back end alone

This project does not authorize changes to servers, database schemas, migrations, sync protocols, storage formats, bank connections, authentication, or financial calculation code.

UI code may call existing APIs in the same supported ways. If a proposed design needs a new API, new persisted field, or changed calculation, document that dependency and choose a simpler presentation where possible. Do not silently expand the project.

A file can contain both styling and business logic. Review the changed lines as well as file locations; a front-end filename is not proof that a change is presentation-only.

### Keep custom themes meaningful

Use Actual's existing semantic theme values for backgrounds, text, borders, selection, focus, and financial status. Do not bake the mockup's purple, charcoal, or green into components.

Layout, spacing, typography, corner shapes, and icon alignment create the new appearance. The user's theme supplies the colors. Any additional theme role must have a compatible fallback for older custom themes and must not require users to rewrite their palettes.

### Preserve working features and access

Moving a control is acceptable only when it remains discoverable and usable. Budget switching, account access, closed accounts, adding accounts, payees, rules, tags, settings, help, connection status, privacy mode, and uncategorized-transaction access must be accounted for.

Preserve supported keyboard actions, inline editing, context menus, scrolling, filtering, and navigation. Inventory the actual capabilities before promising feature parity.

### Keep the real budget safe during development

Develop and exercise mutations against a disposable budget using fictional data. Start by confirming that the development instance cannot accidentally open or change the live budget.

No production migration, live financial-data editing, or replacement of the installed app is part of this planning deliverable.

## 3. Proposed design specification

These are starting decisions to validate in the prototype.

### Navigation and accounts

Use the horizontal navigation from Concept 5 on sufficiently wide desktop windows: Budget, Accounts, Reports, and Schedules.

Place secondary destinations in a clearly labeled menu, with settings and important status indicators readily accessible. Retain the existing budget switcher.

Provide an account navigation control that reveals the existing account list and actions. Opening an account should navigate to its transactions using existing routing.

**Do not implement the mockup's “All accounts” control as a filter that changes envelope budget totals.** The budget and bank accounts represent different views of money. If the app already has a particular account-filter behavior, document and preserve it; do not infer a new one from the picture.

On smaller windows, use a compact navigation menu or drawer that preserves access to all destinations. Do not maintain two independently implemented sets of navigation behavior.

### Budget header and summary

Give the page title, month selector, and budget status a clear hierarchy. Keep them compact enough that useful category rows remain visible.

Rearrange existing summary information rather than replacing it with the mockup's simplified three-number formula. Existing overspending and next-month information must remain available. A compact summary can reveal its breakdown if it is labeled and accessible.

Preserve existing date navigation and supported multi-month views. Multi-month budgeting is part of the discovery and layout review, not a feature to drop because the mockups show one month.

### Budget table

Keep categories grouped in a table with Budgeted, Spent, and Balance columns. Preserve established terms unless a specific wording change is reviewed.

Use aligned numerical columns, the existing money formatter, consistent row padding, subtle separators, clear group headings, and distinguishable hover, selection, editing, and keyboard-focus states.

Suggested initial design values: a 4/8-pixel spacing scale, controls around 32–36 pixels high, compact budget rows around 32–36 pixels, and modest corner rounding. These are prototype targets, not global CSS rules. Existing virtualized lists may rely on exact row measurements.

Use existing icons where possible. Category illustrations in the mockups are optional styling ideas, not a requirement for a new icon picker or saved category metadata. User-created category names must work without an icon mapping.

Avoid adding a second set of editable balances or a decorative total whose meaning differs from existing totals.

### Category details

Start with a read-only panel showing the selected category's existing name, budgeted amount, spending, balance, notes, and related transactions for the relevant month.

Use a dedicated details control or an existing compatible selection action. Clicking a budget amount must continue to initiate its current action. Do not repurpose double-click, right-click, or row selection until their current behavior has been mapped.

At wide widths, open a side panel. At narrower widths, use an accessible overlay or drawer so financial columns do not become unreadable. A provisional panel width of roughly 300–360 pixels can be explored.

Closing the panel should restore focus to its opener and retain table scroll position. Changing month must refresh the panel consistently. Deleting, hiding, or changing the selected category must not leave stale details.

Initially, transaction entries can open the existing transaction view. Editable notes or transaction actions should be added only after the read-only integration is sound, and must reuse current save handlers.

### Visual boundaries

No new brand identity, illustrations, decorative charts, animations, or custom fonts are required. Use the existing font and icon system first. A font change requires checking money alignment, text clipping, and all supported characters.

Keep animations minimal and honor reduced-motion preferences. Financial warnings must remain clear without relying on color alone.

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

## 6. Stage 1 — Resolve the combined design in a prototype

### Purpose

Make layout decisions cheaply before integrating with complex budgeting interactions.

### Work

Build a local front-end prototype with fictional data and the existing theme system where practical. A separate static prototype is acceptable if clearly labeled and never used as the source of financial calculations.

Demonstrate:

- Wide table with horizontal navigation.
- Account navigation and secondary destinations.
- Details panel closed and open.
- Summary breakdown expanded.
- Long category names and many categories.
- A multi-month example, if supported by the current app.
- A smaller desktop window and narrow-screen fallback.
- Existing light, dark, and a representative custom theme.

The original observed app window was approximately 1000 by 700 pixels. A design that only works in a large presentation image is insufficient.

### Decisions to record

Confirm top navigation versus a retained sidebar, how accounts are reached, how the details panel opens, table density, and where budget summary details belong.

Record these choices in a short design-decisions document. Implementation agents follow that document instead of making independent aesthetic choices.

### Exit condition

You can review the prototype and agree on the direction. The coordinating agent verifies that it preserves the known workflows. This is the main design checkpoint; routine implementation tasks afterward do not each need a new design discussion.

## 7. Stage 2 — Establish reusable styling and theme compatibility

### Purpose

Create a small set of consistent UI foundations so later screens do not diverge.

### Work

Map the approved design to the existing theme roles. Define spacing, text hierarchy, control sizes, corner rounding, and focus treatment using the repository's conventions.

Style a limited set of reusable pieces: buttons, icon buttons, fields, page headers, navigation items, summary values, and the details-panel frame.

Reuse existing components where possible. If changing a shared component would immediately affect many unrelated screens, introduce an opt-in visual variant or scope the change to the redesigned area first.

Create a lightweight preview of the component states: default, hover, focused, active, disabled, loading, error, and long-label cases.

### Exit condition

The components work in existing light and dark themes and the chosen custom theme. No raw palette colors have been introduced in production UI, and old custom theme definitions still load.

Changing a theme must visibly change the redesigned surfaces and controls.

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

1. Restyle the month toolbar and rearrange the summary.
2. Restyle table headers and category-group headings.
3. Improve category labels, amount alignment, separators, selection, and focus.
4. Verify inline editing before adding any details-panel interaction.
5. Preserve existing menus, notes access, group collapse, and category organization.
6. Verify scroll behavior, virtualized row measurements, long lists, and multi-month layouts.
7. Check summary and row values against the baseline fixture after each relevant action.

Do not replace the existing table or grid library simply to match the mockup. First determine whether the current implementation can support the design through styles and small presentation changes.

### Exit condition

The new budget screen is usable on its own with the details panel closed. Existing budgeting tasks produce the same results as before, and keyboard entry remains reliable.

A visual match is not sufficient if editing or scrolling regresses.

## 10. Stage 5 — Add category details progressively

### Purpose

Make category context easier to inspect without destabilizing the main table.

### Part A: read-only integration

Connect selection to the approved panel opener. Read category and month data through existing application mechanisms. Display the existing formatted amounts and notes.

Reuse existing transaction queries or selectors for the category and selected month. Preserve established treatment of split transactions, refunds, transfers, and hidden or deleted data. Do not infer query rules from the displayed category name.

Provide loading, empty, unavailable, and error states. Prevent a slow response for a previous selection from overwriting the current selection.

Verify that opening the panel does not save or alter budget data.

### Part B: existing actions

Add links to the current transaction view and, if useful, existing notes editing. Keep one source of truth for editing and saving.

Preserve existing handling of unsaved edits. Closing the panel must not silently discard a note or save it in a new, surprising way.

Do not build a second full transaction editor inside the panel during this stage.

### Exit condition

Panel values agree with the table, month changes refresh both, keyboard focus behaves predictably, and narrow-screen presentation is usable. Existing privacy mode hides all relevant information in the panel.

## 11. Stage 6 — Extend the design to the rest of the app

### Purpose

Make the application feel coherent beyond its main screen.

### Order

1. **Accounts and transactions:** header, balances, search, filters, toolbar, table styling, and editor presentation. Preserve reconciliation, splits, sorting, selection, bulk actions, and other discovered capabilities.
2. **Reports:** consistent dashboard controls, widget framing, spacing, and text hierarchy. Preserve report calculations, filters, saved configurations, and interactions. Do not replace charting libraries for cosmetic reasons.
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

| Area                | Evidence required                                                                                                 |
| ------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Budget correctness  | Same fixture values and saved outcomes before and after representative allocation, month, and transaction actions |
| Theme compatibility | Existing light, dark, and custom themes; legacy custom themes still load                                          |
| Navigation          | Every inventoried destination, account and budget switching, direct links, and back/forward where supported       |
| Editing             | Keyboard and pointer entry, commit/cancel, menus, selection, splits, and unsaved-note handling                    |
| Details panel       | Correct category/month, loading and empty states, rapid switching, close/reopen, privacy                          |
| Layout              | Approximately 1000×700, common laptop and large desktop widths, narrow layout, and 200% zoom                      |
| Accessibility       | Visible focus, logical tab order, meaningful labels, keyboard operation, no color-only financial warnings         |
| Long content        | Long names, large and negative amounts, currency/locale formatting, many rows, and overflowing menus              |
| Performance         | No material regression against the same baseline fixture and machine; table edits and scrolling remain responsive |
| Scope               | Diff review confirms no unauthorized financial, server, schema, storage, or sync changes                          |

Use the repository's existing automated checks. Add focused behavior tests where interactions changed, such as panel selection and navigation. Use screenshot comparisons and manual review for visual changes rather than tests that merely repeat CSS values.

Establish concrete performance thresholds from the measured baseline in Stage 0. Do not invent universal timings or claim success without measurement.

### User walkthrough

Ask you to perform a short set of familiar tasks in the disposable budget: find an account, inspect an envelope, enter a budget amount, switch months, inspect a transaction, and change themes.

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

| ID         | Task                                                                 | Depends on               | Completion evidence                                                   |
| ---------- | -------------------------------------------------------------------- | ------------------------ | --------------------------------------------------------------------- |
| DISC-01    | Locate repository, instructions, and runnable development setup      | None                     | Verified version, paths, commands, isolated sample budget             |
| DISC-02    | Map behavior, themes, protected code, and baseline checks            | DISC-01                  | Repository map, behavior inventory, screenshots, baseline results     |
| DESIGN-01  | Prototype wide layout and account navigation                         | DISC-02                  | Wide and small-window previews with complete destination map          |
| DESIGN-02  | Prototype details panel, summary expansion, and multi-month layout   | DESIGN-01                | Closed/open states, narrow fallback, recorded design decisions        |
| UI-01      | Map theme roles and define scoped visual conventions                 | DESIGN-02                | Light/dark/custom previews and compatibility notes                    |
| UI-02      | Style shared controls and focus states                               | UI-01                    | State preview and targeted interaction checks                         |
| NAV-01     | Integrate top navigation and secondary destinations                  | UI-02                    | Route and keyboard checks                                             |
| NAV-02     | Integrate account access, budget switcher, and status controls       | NAV-01                   | Account actions, privacy, and small-window checks                     |
| BUD-01     | Restyle month toolbar and existing summary                           | NAV-02                   | Identical values, complete breakdown, date-navigation checks          |
| BUD-02     | Restyle grouped table without changing editing                       | BUD-01                   | Visual review and edit/scroll regression checks                       |
| BUD-03     | Complete budget menus, long content, and multi-month support         | BUD-02                   | Behavior inventory reconciled with new budget screen                  |
| DETAIL-01  | Implement panel frame, opener, closing, and focus                    | BUD-03                   | Selection and narrow-layout checks                                    |
| DETAIL-02  | Connect read-only category/month details                             | DETAIL-01                | Correct values, transactions, loading/error and rapid-switch tests    |
| DETAIL-03  | Integrate existing transaction links and notes action                | DETAIL-02                | Existing routes/save behavior retained; privacy verified              |
| APP-01     | Restyle account/register headers and controls                        | BUD-03                   | Search/filter/account action checks                                   |
| APP-02     | Restyle transaction table and editor presentation                    | APP-01                   | Editing, splits, selection, and reconciliation checks where supported |
| APP-03     | Restyle Reports dashboard and controls                               | UI-02, NAV-02            | Report behavior and saved-layout checks                               |
| APP-04     | Restyle Schedules                                                    | UI-02, NAV-02            | Existing schedule behaviors checked                                   |
| APP-05     | Restyle Payees, Rules, Tags, and Settings in separate small changes  | UI-02, NAV-02            | Per-page behavior checks; no logic changes                            |
| APP-06     | Finish remaining dialogs, menus, loading, empty, and error states    | APP-01–05, DETAIL-03     | Consistency review and keyboard checks                                |
| QA-01      | Run cross-screen, theme, accessibility, and performance review       | All implementation tasks | Recorded verification matrix and resolved regressions                 |
| RELEASE-01 | Prepare build, user walkthrough, delivery, and rollback instructions | QA-01                    | Verified release and recovery path                                    |

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

Example of an assignment that needs splitting: “Make the entire budget page look like Concept 5 and add the Concept 3 panel.”

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

For the example rows used in the pictures:

| Category                  | Budgeted | Spent | Balance |
| ------------------------- | -------: | ----: | ------: |
| Rent                      |    1,800 | 1,800 |       0 |
| Groceries                 |      600 |   240 |     360 |
| Utilities                 |      250 |   160 |      90 |
| Transport                 |      200 |    80 |     120 |
| Subscriptions             |      100 |    60 |      40 |
| Dining out                |      250 |   100 |     150 |
| Monthly expenses subtotal |    3,200 | 2,440 |     760 |
| Emergency fund            |      700 |     0 |     700 |
| Vacation                  |      300 |     0 |     300 |
| Overall total             |    4,200 | 2,440 |   1,760 |

These simple totals are illustration-only. Use the actual app's fixture and existing calculation paths for real verification, especially where carryover, refunds, or other budgeting rules affect balances. Also add cases for overspending, a zero allocation, long category names, negative values, empty transactions, and multi-month views.

Do not assume the header's simplified available-funds equation describes every valid budget state. Do not use the mockup account balances as an accounting fixture.

## 18. Timeline and the first useful milestone

The earlier 4–8 week estimate was a rough planning range before inspecting the repository. It should not be treated as a delivery commitment or converted into exact ticket deadlines.

Re-estimate after Stage 0 and again after the first integrated budget screen. Setup complexity, existing test quality, virtualized tables, theme compatibility, and the time spent choosing the design will strongly affect the schedule.

The first milestone worth aiming for is:

**A functioning development build with the approved navigation, a redesigned budget header and table, existing financial behavior, working custom themes, and the details panel still optional or not yet integrated.**

That provides a useful, testable result before the full cross-app overhaul. The next milestone is the working details panel; the final milestone is consistency and verification across the rest of the app.

The next implementation assignment should be DISC-01. No application source changes, development-instance setup, tests, or release have been performed as part of writing this plan.
