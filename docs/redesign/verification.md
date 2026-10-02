# Redesign verification record

QA-00 started this record on September 28, 2026; QA-01 extends it with the
full plan §12 matrix. Stage 0's check results stay in
[baseline/README.md](baseline/README.md). Screenshots referenced below are in
[verification/qa-00/](verification/qa-00/).

## QA-00 (September 28, 2026)

Branch `redesign/qa-00`, started from `redesign/main` at `8d2cf7e6f` and
brought up to `5b6df214b` once THEME-02 merged. No application file changed.
The owner moved QA-00 ahead of THEME-02 and asked for the Linux VRT run to
wait until THEME-02 was merged; THEME-02 merged during QA-00, so the VRT run
is the last step ([below](#linux-vrt)).

**THEME-02 landed while QA-00 was measuring.** Another session rebuilt the
shared `packages/desktop-client/build` at 21:17, partway through the timing
run (about 21:05–21:30), so the later redesign runs were served a build that
also had THEME-02's retune. THEME-02 changes only values in `dark.css` and
`midnight.css`, and the timing runs used the light theme; the rounds before
and after the rebuild show the same slowdown (Assigned edit medians by round
at 1440×900: 166, 170, 166, 169, 199, 188, 167 ms). The custom-theme,
reduced-motion and wording checks ran after the rebuild, so they reflect the
merged `redesign/main`.

### Environment

| Item      | Value                                                                                                                                                               |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Machine   | Apple M1, 8 GB, macOS (Darwin 27.0.0), on mains power                                                                                                               |
| Runtime   | Node 24.14.1; Playwright 1.61.1 Chromium (headless), one browser, a fresh context per run                                                                           |
| Base      | v26.9.0 (`59fe126f6`) in a separate worktree: `install --immutable`, `build:browser`, `vite preview --mode=browser` on 127.0.0.1:3019                               |
| Redesign  | `redesign/main` (`8d2cf7e6f`): `build:browser`, `node scripts/redesign.mjs preview` on 127.0.0.1:3018                                                               |
| Fixture   | Try the demo in each fresh context (the demo generates new random transactions each time, so amounts differ between runs; the category structure and counts do not) |
| Isolation | Loopback only; no sync server, no real budget. An idle development server on port 3017 was running throughout, equally for both builds.                             |

### Performance baseline

**Method.** [`scripts/redesign-perf.mjs`](../../scripts/redesign-perf.mjs)
(outside the app; `run` and `summary` modes). Each run opens a fresh context
at the given viewport, creates the demo, then:

1. **First paint, demo:** reloads the Budget page. _First row_ is the first
   animation frame after a named category row exists; _settled_ is the last
   DOM change under `#root` before 500 ms of quiet.
2. Adds 5 groups × 20 categories through `window.$send` (113 expense
   categories in all; the demo alone has 13 and barely scrolls), then
   reloads again: **First paint, large**.
3. **Scroll:** drives the table's scroll container through its full range
   in 90 animation frames, four passes (down, up, down, up), and records
   every frame interval (359 per run).
4. **Assigned edits:** clicks Food's Assigned cell, then 20 times types a new
   amount and presses Enter. Each edit is timed from Enter until that row
   shows the new amount and no longer holds the input. Enter moves down the
   list, so the 20 edits cover the 13 demo categories and 7 added ones.
5. **Month switching:** Next month ×5, then Previous month ×5. _Label_ is
   when the selected month changes; _settled_ is the last DOM change before
   250 ms of quiet.
6. **Open register:** clicks Bank of America in the sidebar or accounts
   pane; timed to the first transaction row and to settled. Then Budget and
   the same account again.

Three variants per round, in rotating order: the base, the redesign as
shipped (details panel open by default), and the redesign with the panel
closed (its device-local choice set before load), to separate the panel's
cost. 7 rounds at 1440×900 and 7 at 1000×700: 42 runs, none failed. Both
builds show one month at both sizes (a new budget's default); the redesign's
accounts pane is expanded at 1440 and a rail at 1000. Raw results were kept
locally (`data/redesign/qa-00-perf.json`, gitignored);
`node scripts/redesign-perf.mjs summary <file>` prints these tables.

Medians of the 7 per-run values, in milliseconds (range in brackets).
"Change" compares the redesign as shipped with the base.

**1440×900**

| Measure                            |               Base |         Redesign |    Change | Redesign, panel closed |
| ---------------------------------- | -----------------: | ---------------: | --------: | ---------------------: |
| Demo created, page settled         |   1865 (1745–3228) | 1817 (1727–2687) |       −3% |       1851 (1752–3690) |
| First paint, demo: first row       |     780 (756–1174) |   787 (777–1033) |       +1% |         814 (764–1044) |
| First paint, demo: settled         |     797 (773–1186) |   872 (836–1148) |       +9% |         814 (764–1044) |
| First paint, large: first row      |   1565 (1498–1943) | 1611 (1569–2503) |       +3% |       1698 (1615–2140) |
| First paint, large: settled        |   1680 (1606–2083) | 1959 (1843–2957) |  **+17%** |       1836 (1749–2374) |
| Scroll: mean frame                 |   16.7 (16.7–29.2) | 17.0 (16.9–17.2) |       +2% |       17.0 (16.9–17.4) |
| Scroll: p95 frame                  |   17.6 (16.8–17.7) | 17.6 (17.3–18.2) |        0% |       17.6 (17.5–17.9) |
| Scroll: longest frame              | 17.7 (17.7–4500.5) | 66.7 (49.0–84.7) | **+277%** |      68.3 (65.7–150.0) |
| Scroll: frames over 33 ms (of 359) |            0 (0–1) |          3 (2–3) |         — |                2 (2–3) |
| Assigned edit: median              |      125 (124–136) |    169 (166–199) |  **+36%** |          177 (158–229) |
| Assigned edit: p90                 |      168 (144–204) |    237 (179–278) |  **+41%** |          276 (178–463) |
| Assigned edit: 20 edits in total   |   2624 (2489–2789) | 3562 (3376–4073) |  **+36%** |       3866 (3259–5341) |
| Month switch: label                |      240 (205–245) |    239 (235–255) |       −1% |          225 (220–257) |
| Month switch: settled              |      689 (654–691) |    274 (265–331) |      −60% |          225 (220–257) |
| Open register: first rows          |      244 (237–305) |    234 (192–277) |       −4% |          237 (190–328) |
| Open register: settled             |      250 (240–309) |    240 (198–277) |       −4% |          243 (198–335) |
| Open register again: first rows    |      183 (165–189) |    182 (176–309) |       −1% |          181 (153–200) |

**1000×700**

| Measure                            |             Base |          Redesign |    Change | Redesign, panel closed |
| ---------------------------------- | ---------------: | ----------------: | --------: | ---------------------: |
| Demo created, page settled         | 1772 (1748–1857) |  1850 (1707–1919) |       +4% |       1793 (1741–2138) |
| First paint, demo: first row       |   809 (763–1079) |     756 (733–916) |       −7% |          779 (750–848) |
| First paint, demo: settled         |   823 (780–1096) |     799 (775–966) |       −3% |          779 (750–848) |
| First paint, large: first row      | 1580 (1483–1938) |  1655 (1572–3009) |       +5% |       1598 (1523–2031) |
| First paint, large: settled        | 1691 (1597–2057) |  2004 (1860–3439) |  **+19%** |       1729 (1654–2196) |
| Scroll: mean frame                 | 16.7 (16.7–16.7) |  17.1 (16.9–19.9) |       +3% |       17.1 (17.0–17.3) |
| Scroll: p95 frame                  | 17.6 (16.7–18.0) |  17.6 (16.9–18.0) |        0% |       17.3 (16.7–18.0) |
| Scroll: longest frame              | 17.7 (17.7–18.7) | 67.0 (50.0–567.3) | **+279%** |      66.7 (66.7–100.0) |
| Scroll: frames over 33 ms (of 359) |          0 (0–0) |           3 (3–6) |         — |                3 (3–3) |
| Assigned edit: median              |    125 (116–165) |     183 (159–247) |  **+47%** |          169 (157–219) |
| Assigned edit: p90                 |    159 (125–246) |     265 (170–382) |  **+67%** |          218 (187–342) |
| Assigned edit: 20 edits in total   | 2611 (2354–3568) |  3771 (3186–5387) |  **+44%** |       3629 (3284–4748) |
| Month switch: label                |    236 (232–248) |     243 (229–306) |       +3% |          226 (217–309) |
| Month switch: settled              |    686 (679–695) |     281 (260–379) |      −59% |          226 (217–309) |
| Open register: first rows          |    244 (223–332) |     226 (200–331) |       −8% |          216 (196–267) |
| Open register: settled             |    250 (229–332) |     229 (204–331) |       −8% |          219 (201–272) |
| Open register again: first rows    |    175 (159–257) |     176 (150–267) |       +1% |          170 (143–224) |

**What the numbers show**

- **Assigned edits are slower: +36% at 1440, +47% at 1000** (about 45–60 ms
  per edit, 20 edits taking about a second longer). Closing the details
  panel does not remove it (the panel-closed variant is as slow), so the
  cost is in the table, not the panel. Regression → **PERF-01**.
- **Leaving the top of the table drops frames.** Every long frame (49–85 ms,
  2–3 per run) falls on the frame where the scroll position crosses 40 px
  down from the top or returns to 0. That is where `DynamicBudgetTable`
  flips `isScrolled` (`C/budget/DynamicBudgetTable.tsx`), the state that
  swaps the summary cards for the compact strip. It flips and re-renders at
  1440×900 too, where the strip never shows. Frames elsewhere in the scroll
  match the base (p95 17.6 ms in both). Regression → **PERF-02**.
- **The large budget takes longer to settle after load: +17% at 1440, +19%
  at 1000.** The first row appears at the same time (+3–5%). Closing the
  panel removes most of it at 1000 (1729 vs 1691) and about half at 1440
  (1836 vs 1680), so the panel's queries account for part and the table for
  the rest. On the plain demo the difference is under 80 ms. Tracked with
  PERF-01. This also answers DETAIL-02's open question about the panel's
  query cost.
- **Month switching is not slower.** The month label changes as fast as the
  base. The base keeps changing for about 450 ms longer because its month
  summary slides between months; the redesign hides that summary (BUD-01).
- **Opening a register is unchanged** (within run-to-run spread).
- Outliers: one base run had a 4.5 s frame (run 3, 1440; a single stall on
  the machine, not repeated), and one redesign run at 1000 had several long
  frames mid-scroll (run 2). Medians are used for that reason.

**Thresholds for QA-01 (owner decision D-6, September 29, 2026).** QA-01
reruns `scripts/redesign-perf.mjs` on this machine and measures the v26.9.0
base again in the same session; the numbers above show the method and
today's gap, not fixed targets.

- **Blocks release:** Assigned edit median and p90, first paint (first row,
  demo and large), month switch (label), and opening a register (first
  rows). Each passes when the redesign median is no more than 10% above the
  base median from the same session. Scrolling passes with no frame over
  33 ms (two frames at 60 fps).
- **Reported, not blocking:** everything "settled" (after load, after a
  month switch, after opening a register), and demo creation. Settling
  includes the details panel's own loading, which users see after the first
  row.
- **A miss blocks release** unless the owner accepts it in writing as a
  scope decision (plan §12).

10% is about the run-to-run noise: the base's own per-round edit medians
ranged from 116 to 165 ms. As of QA-00 the redesign fails Assigned edits and
scrolling at both sizes (PERF-01, PERF-02) and passes the other blocking
measures; large first-paint settled (+17–19%) is reported. PERF-01 and
PERF-02 (September 29, 2026) since measured both as passing; see
[task-reports.md](task-reports.md).

### Custom theme

Two custom themes installed the way the Themes installer stores them (a
catalog-style installed theme: the `installedCustomLightTheme` global pref
with CSS and a base, set through `save-global-prefs`, then reload; no network
catalog). Each sets every pre-redesign `--color-*` role (226, taken from the
v26.9.0 theme files) and **none** of the redesign roles, with every colour's
hue rotated 150° so any surface still using built-in values stands out:
"custom dark" (from v26.9.0 dark, base `dark`) and "custom light" (from
v26.9.0 light, base `light`). Both passed `validateThemeCss`; the page logged
no console errors.

Surfaces: top-bar tabs and menus, accounts pane (expanded and rail), Budget
header, summary cards, compact strip (1000×700 scrolled), table, details
panel pushed (1440 and 1000) and as the overlay (820×700), Ready to Assign
breakdown, transfer picker, top-bar Accounts menu, an account register's
frame, and the mobile budget at 375×812.

- **Automated check:** on every surface above, each computed text,
  background and border colour was compared with the active `--color-*`
  values. Every colour came from a theme role (the only other hit is
  react-aria's 1 px visually hidden Dismiss button). A stricter pass listed
  colours whose roles neither the custom CSS nor `fallback.css` sets: the
  only ones in both themes at 1440, 1000 and the 820 overlay are
  `categoryAccent1`–`10`, which design-decisions §8 keeps from the custom
  theme's base by design.
- **Visual:** every redesigned surface follows the custom palette, with
  readable text; the overlay has a scrim and a themed panel
  ([custom-light-overlay-820.png](verification/qa-00/custom-light-overlay-820.png),
  [custom-dark-budget-1440.png](verification/qa-00/custom-dark-budget-1440.png),
  [custom-dark-budget-1000-scrolled.png](verification/qa-00/custom-dark-budget-1000-scrolled.png)).

**Result: pass.** This clears the custom-theme gap from BUD-01, BUD-02,
BUD-03 and DETAIL-01 (the overlay). Not covered: a CSS override on its own
(the installer's "Additional CSS overrides"), which by design gets no
fallback layer, and auto mode with separate light and dark custom themes.

### Reduced motion

The same interactions at 1440×900 with `prefers-reduced-motion` unset and
set to `reduce`: hovering tabs and header buttons, Next and Previous month,
hovering a row, opening and closing the details panel from a row and from
the header toggle, collapsing and expanding the accounts pane, opening the
Ready to Assign breakdown, scrolling the table, then opening Reports. Every
`transitionrun` and `animationstart` was recorded.

- **Without reduced motion:** colour transitions on tabs and header buttons
  (0.15 s), the accounts pane width (0.18 s), progress fills (0.2 s), and
  the upstream notes-button fade and Reports loading animation.
- **With reduced motion:** none of the redesign's transitions run. What
  remains is the upstream Reports loading animation, and a 0 s `max-width`
  transition on a row (no movement).

**Result: pass** for the redesigned surfaces. The Reports animation is
upstream behaviour on a page not yet redesigned (APP-03).

### Other carried-forward checks

- **The open account in light (NAV-02):** confirmed. In built-in light the
  open account's fill is the same white as the pane (contrast 1.00:1); only
  the semibold name and a faint shadow mark it. Dark (1.31:1), midnight
  (1.29:1) and a light custom theme (1.26:1, through the fallback) show a
  visible fill
  ([open-account-highlight-1440.png](verification/qa-00/open-account-highlight-1440.png):
  light, dark, midnight, custom light). Added to **BUD-04**.
- **TERM-01 wording in light and midnight:** checked in both. The Ready to
  Assign breakdown (Available funds, Overspent in Aug, Assigned, For next
  month, Ready to Assign), the transfer picker's "Ready to Assign" group, the
  mobile envelope headers (Ready to Assign, Assigned, Activity, Available)
  and the mobile Budget Summary modal's "Ready to Assign:" label
  ([midnight-mobile-summary-modal-375.png](verification/qa-00/midnight-mobile-summary-modal-375.png)).
  That modal is the only place the multi-month `ToBudgetAmount` label still
  appears: desktop shows one month (BUD-03) and hides the per-month summary
  (BUD-01). "Overassigned:" (negative Ready to Assign) was confirmed in
  source only.
- **BUD-02 scroll performance and DETAIL-02 panel query cost:** measured
  above.

### Linux VRT

Run after THEME-02 merged, as the owner asked, against `redesign/main` at
`5b6df214b`: the `running-vrts` recipe (Playwright v1.61.1 Docker image,
HTTPS development server from the QA-00 worktree, reached over the LAN
address), one worker.

1. **Full run, no updates:** 56 passed, 92 failed, 15 did not run (163
   tests, 40 minutes). Every failure was a screenshot mismatch; eight tests
   ran out of time while retrying mismatched screenshots, and the 15 sit
   behind failures in serial blocks.
2. **Three light failures were the environment, not the app:** Payees and
   Mobile Payees showed "1 associated rules" and the Transactions title bar
   "1 uncategorized transactions". The new worktree had no generated
   `packages/desktop-client/locale/` (gitignored), so i18next could not
   choose the singular. With the main checkout's locale files copied in, the
   baselines' singular text returned. Any fresh checkout needs the locale
   files before a VRT run.
3. **Update, scoped to the 21 failing files** (`--update-snapshots=changed`):
   141 passed; **204 snapshots changed: 141 dark, 63 midnight, no light
   snapshot and no new file**, all the same size as before.
4. **Review:** the most-changed snapshot in each of the 21 files, plus the
   two smallest midnight changes, compared before and after. Each shows
   THEME-02's retune only: the navy table, card, input, menu and modal
   surfaces become the near-black surface family in dark, with small shifts
   in midnight. Text, layout and data are unchanged. That light is
   untouched fits THEME-02, which changed only `dark.css` and
   `midnight.css`.
5. **Rerun without updating:** the same 21 files, one worker, no
   retries: 141 passed. The other 22 tests passed in the first run.

**Mobile colours (owner decision D-5, September 29, 2026: keep).**
THEME-02's shared roles also changed the mobile screens in dark and
midnight (budget, accounts, payees, rules, schedules, settings, bank sync);
colours only. The owner kept it, so phone and desktop share one set of
surfaces; plan §19.4 now says mobile keeps the upstream layout, not its
colours. **Readability check** (375×812, the demo budget, on a fresh
`build:browser` of `redesign/main` at `b4d34113a`): on Budget, Accounts, an
account register, new transaction, Payees, Rules, Schedules and Settings,
every visible text element's contrast against its rendered background was
measured with THEME-02's values, then again with the pre-THEME-02 values
(`8d2cf7e6f`) applied over them in the same page. Dark: 247 text elements
changed, and every one reads better (for example, table text on the navy
`#243b53` now sits on `#141520`). Midnight: 50 changed; 34 read better and
16 (the Budget header and group rows) dropped from 14–17:1 to 13–15:1, far
above the 4.5:1 minimum. No text fell below AA or got worse below it. The
text that is below AA on mobile (in midnight, for example, zero amounts on
the Budget at 2.73:1, the Payees "Create rule" badges at 3.22:1 and schedule
field labels at 4.32:1) was already below AA with the old values, so it
predates THEME-02; mobile stays deferred.

### Regressions opened as tasks

| Task    | Regression                                                                                                                                                                              | Card                             |
| ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| PERF-01 | Assigned edits 36–47% slower; large budget settles 17–19% later after load. Fixed in PERF-01 (`8f88c6841`): edits 57–59% faster than the base, settle +5–7% ([report](task-reports.md)) | [backlog](backlog.md#task-cards) |
| PERF-02 | 2–3 dropped frames (49–85 ms) each time the table leaves or returns to the top                                                                                                          | [backlog](backlog.md#task-cards) |
| BUD-04  | (added) The open account in the accounts pane has no visible fill in light                                                                                                              | [backlog](backlog.md#task-cards) |

### Not checked in QA-00

Auto mode with custom light and dark themes; a
CSS override on its own; privacy mode and keyboard paths beyond what earlier
tasks recorded; 200% zoom; the desktop (Electron) build (ELEC-01); tracking
budgets (the redesign leaves them unchanged). Performance was measured in a
browser only, headless, on one machine.

## ELEC-01 (September 29, 2026)

Branch `redesign/elec-01` from `redesign/main` at `cb9cefab0`. The isolation
review and procedure are in [stage-0.md](stage-0.md#desktop-isolation-review-elec-01).
No application file changed. Screenshots are in
[verification/elec-01/](verification/elec-01/).

### Environment

| Item      | Value                                                                                                                                                 |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Machine   | Apple M1, macOS (Darwin 27.0.0), 1440×900 display                                                                                                     |
| Build     | Development desktop build: Electron 43.4.0, `@actual-app/core build:node`, `desktop-electron build:dist`, renderer from Vite on 127.0.0.1:3001        |
| Launcher  | `node scripts/redesign-electron.mjs` (three manual runs); the same paths through Playwright's Electron driver for the zoom, size and title bar checks |
| Fixture   | Don't use a server → Try the demo, in `data/redesign-electron/`                                                                                       |
| Installed | Actual 26.9.0 was not running; its folders were only read (to find `document-dir`), never opened by the test build                                    |

### Isolation evidence

| Check                                                                               | Result                                                                                                                                                        |
| ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Folder naming probe (throwaway `productName`, exits before any window)              | Unpackaged `userData` = `~/Library/Application Support/<productName>`; `--user-data-dir` moves `userData`, session data and crash dumps; `HOME` moves nothing |
| Files open in the running Electron processes (`lsof`, run 1, after the demo loaded) | Every file under the user folder was inside `data/redesign-electron/`; none in `~/Library/Application Support/Actual` or `~/Documents/Actual`                 |
| Welcome screen on first launch                                                      | "Welcome to Actual" with no budget list, although `~/Documents/Actual` holds a budget ([screenshot](verification/elec-01/run1-welcome-no-budgets.jpg))        |
| Budget path in the app's own log (runs 2 and 3)                                     | `Loading budget …/data/redesign-electron/documents/Actual/_test-budget`                                                                                       |
| Playwright runs, `app.getPath('userData')` and the two variables                    | All three under `data/redesign-electron/`                                                                                                                     |
| Launcher change check after each manual run                                         | Runs 1, 2 and 3: "nothing changed in ~/Library/Application Support/Actual, ~/Documents/Actual"                                                                |
| `find … -newer` over both folders after the Playwright runs                         | 0 files                                                                                                                                                       |
| `~/Library/Logs/Actual`                                                             | Not created (the probe's empty `ActualIsolationProbe` log folder was removed)                                                                                 |

### Smoke test

| Area                                  | Observation                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| First paint                           | Redesign renders as in the browser: tabs, accounts rail, summary cards, details panel with pace chart ([screenshot](verification/elec-01/run1-budget-1000x700.jpg))                                                                                                                                                                                                                                                                            |
| Title bar and dragging                | The window keeps macOS's native title bar (upstream sets no `frame`/`titleBarStyle`), with the in-app tab bar below it. Dragging the native title bar moves the window. Dragging empty space in the tab bar selects text instead: the `WebkitAppRegion: 'drag'` that `FinancesApp.tsx` gives the title bar is unchanged from v26.9.0 but has no effect in a framed window, so upstream behaves the same. Traffic lights never overlap the tabs |
| Budget flows                          | Assigned edit (Food 400 → 425: Ready to Assign 0.00 → −25.00, panel updated), restored to 400; month switch to October and back; Reports dashboard; Schedules; account register from the rail, with the rail tooltip                                                                                                                                                                                                                           |
| Native menus                          | App menu (Hide, Quit Actual), File, View (Reload, Toggle Developer Tools, Actual Size, Zoom In/Out, Toggle Full Screen), Edit, Window all present. Edit → Undo/Redo are always disabled (`enabled: false` in upstream `menu.ts`); ⌘Z works in the page. View lists "Toggle Full Screen" twice (the `togglefullscreen` role plus the item macOS adds); both upstream                                                                            |
| Zoom                                  | Menu Zoom In ×2 → zoom level 1 (page width 833 CSS px, compact navigation, nothing wider than the window); Zoom Out → 0.5; Actual Size → 0. Level 2 (694 CSS px) also fits ([level 1](verification/elec-01/zoom-level-1-window-1000.png), [level 2](verification/elec-01/zoom-level-2-window-1000.png))                                                                                                                                        |
| Minimum window size                   | None is set (`getMinimumSize()` = 0×0, as upstream). At 360×300 the app switches to the upstream mobile layout, as in a narrow browser ([screenshot](verification/elec-01/smallest-window.png)); 800×600 shows the compact navigation with the budget intact                                                                                                                                                                                   |
| Accounts pane and details panel state | Run 1: pane expanded, panel closed in the overlay → quit → run 2: pane expanded (kept); panel open in push mode (correct: closing the overlay never changes the stored choice, DETAIL-01). Run 2: pane collapsed, panel closed in push mode → quit → run 3: both kept ([screenshot](verification/elec-01/run3-state-restored.jpg)). Window position also kept (`window.json`)                                                                  |

### Defect found

**The title bar wraps at 1000px with the accounts pane expanded.** Measured
with the pane open: at 1000px the right-hand group (display, privacy, "No
server", Help) sits 15px above the top of the page, so its upper half is cut
off under the native title bar, and the budget switcher drops to a second line
([measured](verification/elec-01/titlebar-pane-open-1000.png),
[desktop](verification/elec-01/run1-titlebar-wrap-pane-open.jpg)). At 1100,
1200, 1280 and 1440px everything sits on one line
([1280](verification/elec-01/titlebar-pane-open-1280.png)). The layout depends
only on the window width, so the browser at the same width should show the same
thing. Opened as task TOPBAR-FIX; not fixed here.

### Not checked

Custom theme, dark/midnight and privacy mode in the desktop build (the UI code
is the browser's; only the shell differs); the packaged `app://` bundle
(blocked: packaged builds are not isolated); keyboard shortcuts delivered
through macOS menus while the window is in another Space (the test harness
could not deliver them reliably; the same menu items were triggered directly
instead).

## TOPBAR-FIX (September 29, 2026)

Branch `redesign/topbar-fix`. Fixes the title bar wrap found in ELEC-01.

### Cause

The right-hand group (`SpaceBetween` in `Titlebar.tsx`) wrapped by default,
and the layout had no response to the width the expanded accounts pane
(236px) takes. ELEC-01's 1000px run also showed the development-only theme
switcher, which pushed the group over; without it the demo fits at 1000px
but not at 900px, and the uncategorized-transactions button (about 195px)
overflows much wider windows.

### Change

The title bar is a named size container (`titlebar`), so its controls
respond to the width left after the pane, not the window. The right-hand
group never wraps. Below an 800px title bar (pane expanded under about
1036px; never with the rail collapsed) the tabs' side padding drops from 12
to 8px, the group's gaps from 10 to 6px, and Help shows only its icon; its
accessible name stays "Help". If that is still not enough, the budget name
and the uncategorized count ellipsize; every other control keeps its size.

### Measurements

Every control's box inside the 36px bar, the right-hand group starting after
the tabs and ending inside the bar's padding ("fits"). Demo budget, no
server, with the development theme switcher present (the ELEC-01 worst
case).

| Window | Pane      | Title bar | Result | Notes                                          |
| ------ | --------- | --------- | ------ | ---------------------------------------------- |
| 900    | expanded  | 664       | fits   | Tight; budget name ellipsized to 94px ("Tes…") |
| 950    | expanded  | 714       | fits   | Tight; name in full                            |
| 1000   | expanded  | 764       | fits   | Tight; name in full (ELEC-01's failing case)   |
| 1035   | expanded  | 799       | fits   | Tight (last width below the threshold)         |
| 1036   | expanded  | 800       | fits   | Full labels                                    |
| 1100   | expanded  | 864       | fits   | Full labels                                    |
| 1280   | expanded  | 1044      | fits   |                                                |
| 1440   | expanded  | 1204      | fits   |                                                |
| 900    | collapsed | 844       | fits   | Full labels                                    |
| 1000   | collapsed | 944       | fits   |                                                |
| 1100   | collapsed | 1044      | fits   |                                                |
| 1440   | collapsed | 1384      | fits   |                                                |

With 12 uncategorized transactions forced on locally (a temporary edit,
reverted before commit): 900 expanded fits with the count at "12 un…" and
the budget switcher at its initial; 1100 expanded fits with both shortened;
1280 expanded and 1440 collapsed show both in full
([900 worst case](verification/topbar-fix/light-900-pane-open-worst-case.jpg);
the pane balances read 0.00 because the capture was taken while the demo was
still loading).

### Checks

| Check                                                                     | Result                                                                                           |
| ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `yarn typecheck`                                                          | pass                                                                                             |
| `yarn lint`                                                               | pass                                                                                             |
| `yarn workspace @actual-app/web run test`                                 | 74 files, 1052 passed, 1 skipped                                                                 |
| E2E budget, accounts, help-menu, nav-02 (dev server on 3028)              | 26 passed                                                                                        |
| VISUAL light, dark, midnight at 1000, 1100, 1440 (pane expanded)          | all fit; screenshots below                                                                       |
| Desktop build (isolated, Playwright Electron, 900–1440, both pane states) | 8/8 fit; `userData` in `data/redesign-electron/`; 0 files changed in the installed app's folders |

Screenshots: light
[1000](verification/topbar-fix/light-1000-pane-open.jpg),
[1100](verification/topbar-fix/light-1100-pane-open.jpg),
[1440](verification/topbar-fix/light-1440-pane-open.jpg),
[1000 collapsed](verification/topbar-fix/light-1000-rail-collapsed.jpg),
[900](verification/topbar-fix/light-900-pane-open.jpg); dark
[1000](verification/topbar-fix/dark-1000-pane-open.jpg),
[1100](verification/topbar-fix/dark-1100-pane-open.jpg),
[1440](verification/topbar-fix/dark-1440-pane-open.jpg); midnight
[1000](verification/topbar-fix/midnight-1000-pane-open.jpg),
[1100](verification/topbar-fix/midnight-1100-pane-open.jpg),
[1440](verification/topbar-fix/midnight-1440-pane-open.jpg); desktop
[1000 expanded](verification/topbar-fix/desktop-1000-pane-open.png) (compare
ELEC-01's [wrapped bar](verification/elec-01/titlebar-pane-open-1000.png)),
[1000 collapsed](verification/topbar-fix/desktop-1000-pane-collapsed.png).

### Not checked

- E2E ran against a Vite dev server, not a `build:browser` preview: the
  shared preview on 3018 belonged to another session.
- Linux VRT not regenerated at the time. Run September 30, 2026 with APP-01
  ([below](#linux-vrt-for-topbar-fix-and-app-01-september-30-2026)): no
  snapshot changed.
- The desktop check drove the window with Playwright; the manual launcher
  run started and passed its isolation check, but its window was on another
  Space and could not be inspected. Custom theme, "Server online"/"Server
  offline" labels and long translations were not measured.

## Linux VRT for TOPBAR-FIX and APP-01 (September 30, 2026)

Against `redesign/main` at `bf9eb4a11` (both tasks merged), on Windows 11:
Docker Desktop 29.8.1 with the WSL2 backend, the `running-vrts` recipe
(Playwright v1.61.1 image, HTTPS Vite development server on port 3021 reached
over the LAN address), one worker, no retries. Checkout at
`C:\dev\actual-budget-redesign` (moved out of OneDrive), locale files cloned
from `actualbudget/translations`.

**Windows setup.** Yarn's workspace links in `node_modules` are Windows
junctions; inside the container Docker Desktop shows them as links to
`/mnt/host/c/dev/actual-budget-redesign/packages/...`, so a checkout mounted at
`/work` resolves linked packages outside the tree and cannot find their
dependencies (`Cannot find module 'date-fns'`). Mounting the checkout at
`/mnt/host/c/dev/actual-budget-redesign` and running from there fixes it; all
175 tests load.

1. **Full run, no updates:** 156 passed, 19 failed (175 tests, 27 minutes).
   Every failure was a screenshot mismatch, all in the four files that show an
   account register: `accounts`, `rules`, `schedules`, `transactions`.
2. **TOPBAR-FIX:** no snapshot changed. The title bar is pixel-identical in
   the failing account screenshots, and every other test passed.
3. **Update, scoped to the four files** (`--update-snapshots=changed`): 33
   passed; **69 snapshots changed** (the 19 tests, light, dark and midnight;
   four tests take two screenshots). No new file, nothing outside those tests.
4. **Review:** each change is APP-01's account hero (type, name, "Not yet
   reconciled" pill, lock and balance) replacing the plain header, with the
   register moved down. Checked light, dark and midnight of the page visuals,
   the Close Account modal, and the date-picker popover (only its corners,
   over the moved page, differ). Rows below the Close Account modal render
   unblurred in dark; the previous snapshot shows the same, so it predates
   APP-01.
5. **Rerun without updating:** the same four files: 33 passed.

## Linux VRT for APP-02 (September 30, 2026)

Against `redesign/main` at `60e349ce4` (APP-02 merged) plus the unpushed
APP-01 snapshot commit, on Windows 11 with the same setup as the
[APP-01 run](#linux-vrt-for-topbar-fix-and-app-01-september-30-2026): Docker
Desktop 29.8.1, Playwright v1.61.1 image, HTTPS Vite development server on
port 3021 over the LAN address, checkout mounted at
`/mnt/host/c/dev/actual-budget-redesign`, one worker, no retries.

1. **Full run, no updates:** 157 passed, 18 failed (175 tests, 26 minutes).
   Every failure was a screenshot mismatch, all in the four files that show
   an account register: `accounts` (5), `rules` (2), `schedules` (2),
   `transactions` (9, including the edited "by payee" test, whose row check
   passed). Budget, reports and notes tests, which use the tag style that
   `useTagCSS` shares, all passed.
2. **Update, scoped to the four files** (`--update-snapshots=changed`): 33
   passed; **66 snapshots changed** (the 18 tests in light, dark and
   midnight; four tests take two screenshots). No new file, nothing outside
   those tests.
3. **Review:** each change is APP-02's register: one card, Eyebrow headers,
   36px rows with hairline dividers, payee initial tiles, category accent
   dots and square tags. Checked by eye: page visuals in light, dark and
   midnight; the split transaction (italic parent, plain children with
   accent dots); the empty date-filter result; the closed account in dark;
   the schedules register with its hover state. Tag colours are unchanged
   (background and text pixels match the previous snapshot); only the
   corners and size differ.
4. **Rerun without updating:** the same four files: 33 passed.

## APP-02 desktop window (September 30, 2026)

Against `redesign/main` at `68e384cc4`, on Windows 11, Electron 43.4.0.

**Setup.** Prepared as in stage-0.md (Electron downloaded, `better-sqlite3`
rebuilt for Electron after backing up its Node build, `@actual-app/core`
`build:node` and `desktop-electron` `build:dist`). `scripts/redesign-electron.mjs`
guards only the macOS folders, so the build was started by hand with the
same isolation: `ACTUAL_DATA_DIR` and `ACTUAL_DOCUMENT_DIR` under
`data/redesign-electron/`, `--user-data-dir=data/redesign-electron/chromium`,
no `EXECUTION_CONTEXT`, `NODE_ENV=development`, the renderer from Vite on
127.0.0.1:3001. Two extra switches let Playwright drive the window without
screen control: `--remote-debugging-port` (the page, over CDP) and
`--inspect` (the main process, to set the window's content size). The
development build opens DevTools docked; it was closed before measuring.
The welcome screen listed no budget; **Don't use a server**, then **Try the
demo**. Actual is not installed on this machine.

| Check                                      | Result                                                                                                                                                                                 |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Register, light 1000×700 (Bank of America) | Card, Eyebrow headers, 36px rows (measured), payee initials, accent dots, square tags, upright schedule pills, splits with plain children                                              |
| Selection and editing                      | Selected row: tint `rgba(135, 25, 224, 0.06)` and a 3px inset bar; row being edited: the tint; a tag click applies its filter and the filtered register renders                        |
| Adding                                     | Add New shows the 36px new row, date picker, Cancel and Add; Cancel closes it                                                                                                          |
| Keyboard                                   | Date → payee → notes → category → payment with Tab, Shift+Tab back, Enter down a row, Shift+Enter up; the edit tint on every step                                                      |
| Reconciling, dark 1000×700                 | Band with the Difference pill, the cleared header accented; Exit reconciliation removes the band                                                                                       |
| Privacy, dark 1000×700                     | Every payment and deposit masked, split children included                                                                                                                              |
| Midnight 1440×900                          | Renders as in the browser with the accounts pane open                                                                                                                                  |
| Row weight after reconciling               | 400 before and after; rows only look heavier on dark backgrounds                                                                                                                       |
| Console                                    | One React development warning (key spread into JSX) from `CategoryAutocomplete.tsx`'s `SplitTransactionButton`, which the redesign has not changed; nothing from the register          |
| Isolation                                  | `%APPDATA%\Actual`, `%LOCALAPPDATA%\Actual`, `Documents\Actual` and `OneDrive\Documents\Actual` do not exist after the run; all app data is in `data/redesign-electron/` (git-ignored) |

`app.quit()` left the main process waiting on the inspector ("Debugger
ending"), so the sandbox processes were stopped afterwards. `better-sqlite3`
was restored from the backup; it loads under Node again. Screenshots in
[verification/app-02](verification/app-02/) (`desktop-*.jpg`).

**Not covered:** the packaged `app://actual` bundle (stage-0.md); the
launcher's own isolation check, which only knows macOS paths.

_Later, September 30, 2026:_ `086171905` taught the launcher the Windows
folders (`%APPDATA%\Actual` and `Actual` in the Documents known folder,
OneDrive redirection included) and added `--remote-debugging-port` /
`--inspect` pass-through. A run with both switches on this machine ended
with "Isolation check: nothing changed" for all three Windows folders.
The register checks above were not repeated through the launcher.

## APP-03a follow-up checks (September 30, 2026)

Against `redesign/app-03-reports` at `f1a6b0cd8` (APP-03a merged) plus the
reduced-motion fix below, on Windows 11. Screenshots in
[verification/app-03a](verification/app-03a/).

| Check               | Result                                                                                                                                                                                                                                                                                                                                                               |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Custom theme        | QA-00 method: every v26.9.0 `--color-*` role (225 from light, 222 from dark) hue-rotated 150°, no redesign roles, installed as `installedCustomLightTheme` with base light or dark. Dashboard at 1440×900 and 1000×700, normal and edit mode, one widget hovered: every text, background and border colour in the page equals a theme role (**0 misses in 4 runs**). |
| Reduced motion      | Hovering six widgets and the header buttons, entering and leaving edit mode, hovering a widget in edit mode, the rename pencil by keyboard. `no-preference`: 78 transitions and animations. `reduce`: **0**, after gating the summary amount's font-size transition in edit mode (upstream code in `SummaryNumber.tsx`; it ignored the setting).                     |
| Built preview       | `build:browser`, `scripts/redesign.mjs preview` (port 3018), installed Edge: reports, budget and accounts E2E at 1000×700 and 1440×900, **74/74**, none skipped.                                                                                                                                                                                                     |
| Linux VRT           | The APP-02 setup (Docker Playwright v1.61.1, HTTPS dev server on 3021 over the LAN address, checkout at `/mnt/host/c/...`). Full run: 158 passed, 2 failed, 15 did not run (the serial Reports block after its first failure). Update scoped to `reports` and `command-bar`: **12 snapshots changed**; rerun without updating 19/19.                                 |
| Impeccable detector | Installed with `npx impeccable install` (its rewrite of three committed hook files was reverted). Over every changed Reports file: two advisory font-size findings (10px), both on `CalendarCard.tsx` calendar-cell lines APP-03a did not change.                                                                                                                    |
| Desktop build       | `scripts/redesign-electron.mjs` with `--remote-debugging-port` and `--inspect`, Electron build of `better-sqlite3` (Node build backed up and restored; it loads under Node again). See below.                                                                                                                                                                        |

**VRT review.** `Reports › loads net worth and cash flow reports` (light,
dark, midnight): the restyled dashboard. `Command bar › search works
correctly` (three): the same dashboard behind the open command bar.
`loads net worth graph` and `loads cash flow graph` (three each): the report
pages are unchanged except the chart tooltip's position; the test opens the
page by clicking its dashboard card, which now sits a few pixels elsewhere,
so the pointer rests over a different point of the chart.

**Desktop.** The welcome screen listed no budget; **Don't use a server**,
**Try the demo**. The window first loaded from a leftover browser-mode Vite
server of mine on port 3001 (the "Version" component failed without
Electron's globals); after stopping it and reloading, from the launcher's
own server on 127.0.0.1:3001:

- Light 1000×700: 18px hairline cards, no shadow (measured); edit mode with
  dashed borders and the menu clear of every value.
- Dark 1440×900: Tab from Add new widget reaches the first widget with the
  focus ring; Enter opens its summary report.
- Midnight 1440×900 with privacy on: every amount and pill masked.
- Console: only the Transaction Calendar's nested-button warning (upstream
  structure, noted in the task report).
- Quit with `app.quit()` over the inspector: "Isolation check: nothing
  changed" for `%APPDATA%\Actual`, `OneDrive\Documents\Actual` and
  `Documents\Actual`.

## Linux VRT for APP-03b (September 30, 2026)

Against `redesign/app-03b-report-header` (uncommitted APP-03b changes), on
Windows 11 with the
[APP-01 setup](#linux-vrt-for-topbar-fix-and-app-01-september-30-2026):
Docker Desktop 29.8.1, Playwright v1.61.1 image, HTTPS Vite development
server on port 3021 over the LAN address, checkout mounted at
`/mnt/host/c/dev/actual-budget-redesign`, one worker, no retries.

1. **Update, scoped to `reports.test.ts`** (`--update-snapshots=changed`):
   17 passed; **15 snapshots changed**, light, dark and midnight of five
   tests: `loads net worth graph`, `loads cash flow graph` and the three
   `balance forecast` tests. No new file, nothing outside those tests. The
   date range picker test (popover only) and the custom report tests
   (APP-03c) did not change.
2. **Review:** each change is APP-03b's report page: the "Reports · Main"
   eyebrow and Display title, segmented Live/Static, Control buttons, and
   the chart in a hairline card with the total and change pill, the
   explanation in its own card. Checked Net Worth light, Cash Flow midnight
   and the tracking-budget forecast in dark; the forecast's two `Select`
   dropdowns keep their upstream look.
3. **Rerun without updating:** `reports.test.ts` and `command-bar.test.ts`,
   **19 passed**.

Not run: the full suite. The shared components changed here
(`DateRangePicker`, `FilterButton`) take new optional props whose defaults
are the old look, so other screens are unaffected by construction.

## Linux VRT for APP-03c (October 1, 2026)

Against `redesign/app-03c-editors` (uncommitted APP-03c changes), with the
[APP-01 setup](#linux-vrt-for-topbar-fix-and-app-01-september-30-2026):
Docker Desktop 29.8.1, Playwright v1.61.1 image, HTTPS Vite development
server on port 3021 over the LAN address, checkout mounted at
`/mnt/host/c/dev/actual-budget-redesign`, one worker, no retries.

1. **Update, scoped to `reports.test.ts`** (`--update-snapshots=changed`):
   17 passed; **24 snapshots changed**, light, dark and midnight of the eight
   `custom reports` tests. No new file, nothing outside those tests.
2. **Review:** each change is APP-03c's custom report: the toolbar's chart
   segments and Legend/Summary/Labels Control buttons, the settings card, and
   the chart card with the summary tiles or legend beside the chart (the
   test viewport is 1280 wide). Checked the legend in light, the summary in
   midnight and the data table in dark; Legend and Labels are dimmed where
   the data table disables them.
3. **Rerun without updating:** `reports.test.ts` and `command-bar.test.ts`,
   **19 passed**.

Not run: the full suite. `Select`'s `triggerVariant`, the table's
`isFlatRegister` and `QueryManager`'s `isCard` are new optional props whose
defaults are the old look. `CategorySelector` also changes Crossover's list,
which has no screenshot test.

## APP-03b and APP-03c follow-up checks (October 1, 2026)

Against `redesign/main` at `2c1a2d09a` (APP-03c merged), on Windows 11.
Screenshots in [verification/app-03c](verification/app-03c/) (`custom-*`
and `desktop-*`).

| Check         | Result                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Custom theme  | QA-00 method and themes (every v26.9.0 `--color-*` role hue-rotated 150°, no redesign roles, installed as `installedCustomLightTheme`, bases dark and light), dev server on 127.0.0.1:3001, installed Edge, 1440×900 and 1000×700. Pages: every widget on the demo dashboard (four Summary, Net Worth, Cash Flow, three Spending, Calendar), a second dashboard, Formula, the custom report with legend and summary on, Age of Money, Sankey, Forecast, and Crossover and Budget Analysis from new widgets (Sankey, Budget Analysis and Forecast flags on). Every text, background and border colour in the page is a theme role except the Calendar list's tags (each tag's own colour, as in the APP-02 register) and the Formula editor's CodeMirror defaults (gutter, active line, number colour; upstream `codeMirror-excelLanguage.tsx`, not changed). No page errors. |
| Desktop build | `scripts/redesign-electron.mjs` with `--remote-debugging-port` and `--inspect`, fresh `data/redesign-electron/`, `better-sqlite3` rebuilt for Electron and restored from a backup afterwards (it loads under Node again). See below.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |

**Desktop.** The welcome screen listed no budget; **Don't use a server**,
**Try the demo**. As in APP-03a, the window first loaded from a leftover
browser-mode Vite server of mine on the wildcard port 3001 (the page threw
"Cannot assign to read only property 'Actual'"); after stopping it and
reloading, from the launcher's own server on 127.0.0.1:3001:

- Net Worth, dark 1440×900: the APP-03b header, segmented Live/Static (Enter
  on Static by keyboard sets `aria-pressed`) and the chart card.
- Custom report, dark 1440×900: Time mode, Line Graph segment pressed, the
  settings card, the chart card with summary and legend beside it.
- Custom report, light 1000×700: summary and legend under the chart; the
  chart card has 18px corners, no shadow and scrolls (`overflowY: auto`).
  Saved as a new report, then the graph type changed: "Unsaved changes"
  shows beside **Report**.
- Calendar, midnight 1440×900: the flat register card, month names above
  their totals, the stat tiles; with privacy on, every amount in the tiles,
  months and list is masked.
- Formula (experimental flag on through Settings), midnight 1440×900 and
  1000×700: Result, Formula and Appearance cards stack without overlap
  (titles at 175, 380, 585 and 817px at 1000×700).
- Console: only the Transaction Calendar's nested-button warning (upstream
  structure, noted in APP-03a).
- Quit with `app.quit()` over the inspector: "Isolation check: nothing
  changed" for `%APPDATA%\Actual`, `OneDrive\Documents\Actual` and
  `Documents\Actual`.

**Observed, not changed:** in the Electron window the Formula Result box at
1000×700 shows a classic vertical scrollbar. The box is upstream's (120px,
`overflow: auto`), and the dynamically sized result is 3px taller than it
(scroll height 123). Edge's headless screenshots draw no scrollbar for the
same overflow.

## APP-04 and APP-03d follow-up checks (October 1, 2026)

Against `redesign/main` at `35a0d128b` (APP-04 merged), on Windows 11.
Browser checks ran against a fresh `build:browser` preview
(`scripts/redesign.mjs preview`, port 3018, demo budget) with the installed
Edge through a scratch Playwright script; the desktop checks over CDP.
Screenshots in [verification/app-04](verification/app-04/) and
[verification/app-03d](verification/app-03d/) (`keyboard-*`, `privacy-*`,
`custom-*`, `desktop-*`).

| Check                    | Result                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Schedules keyboard       | From the title, Tab reaches Add new schedule, Find schedules, Change upcoming length, the filter, the table, then each row's ⋯ button, each with a visible ring except the table container (upstream `table.tsx` sets `outline: none` on it; unchanged since v26.9.0). Enter on ⋯ opens the menu with its first item highlighted; Escape closes it and returns focus to ⋯. Enter on Add new schedule opens the dialog with focus in the name field; Escape closes it and returns focus to the button. Rows open by mouse only, as upstream. |
| Schedule dialog keyboard | Edit dialog at 1000×700: Tab runs name → payee → account → amount options → amount → date → Repeats → upcoming length → Automatically add → Edit as rule → Linked / Find matching transactions → transactions table → Cancel → Save, in visual order. Enter on Find matching transactions switches the segmented control (`aria-pressed` moves). Save shows its ring with the footer in view; after scrolling the dialog to its end, Save stays at the same place (sticky footer).                                                          |
| Schedules privacy        | Ctrl+Shift+P on the page turns privacy on. Dark 1440×900 and light 1000×700: all four amounts masked (the real text sits at opacity 0 under the redacted copy). The dialog's Amount field shows its value: upstream (`AmountInput` and `ScheduleEditForm` have no privacy handling at v26.9.0; APP-04 did not touch the field).                                                                                                                                                                                                             |
| Schedules custom theme   | APP-04's check covered `role="main"`, which holds the toolbar and table but not the page header. Rerun over the whole page with its header (QA-00 method, bases dark and light, 1440×900): **0 misses** in both.                                                                                                                                                                                                                                                                                                                            |
| Monte Carlo custom theme | QA-00 method, bases dark and light, 1440×900 and 1000×700, experimental flag on. Per run: Results with the chart, each configuration tab (Investment pots with a pot's settings expanded, Contributions, Spending, Tax) and the Runs view, over the whole page with its header: **0 misses in 24 views**. No page errors.                                                                                                                                                                                                                   |
| Monte Carlo keyboard     | Dark 1440×900, from Configuration: Plan details, Investment pots, Contributions, Spending, Tax (segmented, ring on each), then the plan's fields and Help buttons, Return model, Simulations, the today's-money checkbox, Chart, Runs, All scenarios. Enter on Spending and on Runs presses them. In Runs: the sort control, then each run row with a ring.                                                                                                                                                                                 |
| Monte Carlo privacy      | Midnight 1440×900: the Median ending balance and Median total withdrawn tiles, the chart's axis labels, the pot's Starting balance and Fixed yearly fee, and all 20 run amounts are masked. Percentages and ages are not amounts and stay visible.                                                                                                                                                                                                                                                                                          |
| Desktop build            | `scripts/redesign-electron.mjs --remote-debugging-port=9333 --inspect=9339`, fresh `data/redesign-electron/`, `better-sqlite3` rebuilt for Electron and restored from a backup afterwards (it loads under Node again). See below.                                                                                                                                                                                                                                                                                                           |

**Desktop.** The welcome screen listed no budget; **Don't use a server**,
**Try the demo**, then in the Electron window:

- Schedules, dark 1440×900: the card table and toolbar as in the browser;
  the same Tab order; Enter on ⋯ opens the menu and Escape returns focus to
  it; Enter on Add new schedule opens the dialog and Escape closes it, focus
  back on the button.
- Schedule dialog, light 1000×700: Enter on Find matching transactions
  presses it; Save's bottom edge at 655 of 700px, and still at 655 after
  scrolling the dialog body to its end.
- Schedules, midnight 1440×900 with privacy on: every amount masked.
- Monte Carlo, dark 1440×900: Results, the pots tab with settings
  expanded and Runs; Investment pots and Runs pressed by Enter. Light
  1000×700: no horizontal page overflow. Midnight with privacy on: tiles
  and chart axis masked.
- Console: one React warning, "`value` prop on `input` should not be null",
  when the Add schedule dialog opens: upstream's name field
  (`value={fields.name}` with `name: null` for a new schedule at v26.9.0).
  The Vite log also shows react-aria's "Draggable items in a GridList must
  contain a `<Button slot="drag">`" on the Monte Carlo pots table; upstream
  has no drag button there either.
- Quit with `app.quit()` over the inspector: "Isolation check: nothing
  changed" for `%APPDATA%\Actual`, `OneDrive\Documents\Actual` and
  `Documents\Actual`.

## APP-05a follow-up checks (October 1, 2026)

Against `redesign/main` at `01f7b9a12` (APP-05a merged), on Windows 11, then
the fix below. Browser checks ran against a fresh `build:browser` preview
(`scripts/redesign.mjs preview`, port 3018, demo budget) with the installed
Edge through a scratch Playwright script; the desktop checks over CDP.
Screenshots in [verification/app-05a](verification/app-05a/).

| Check                | Result                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Payees custom theme  | QA-00 method, bases dark and light, 1440×900 and 1000×700, a row hovered, over the whole page with its header: **0 misses** in all four. The screenshots showed a defect the colour check cannot: every quiet "Create rule" button had a filled background, `CellButton`'s default `buttonNormalBackground`, which matches the row in the built-in themes. **Fixed** (`a55a98620`): the quiet state sets a transparent background. Rerun: 0 misses, no fill.                                                                                                                                                                                                                                                                                  |
| Payees keyboard      | The selection button is disabled until a payee is selected, so Tab runs Category learning settings → the filter (ring on its wrapper) → the table (upstream container without a ring) → the header checkbox. In the table, Tab from a name moves to its rule button. Its only focus sign was `CellButton`'s 2px shadow, nearly invisible on the quiet button; **fixed** in the same commit with the redesign focus ring (`styles.focusRing`). Space opens the rule editor (Enter moves down a row, as upstream's `CellButton` intends) and Escape returns focus to the button. Category learning settings opens its dialog by Enter and Escape returns focus to it; the selection menu opens by Enter and Escape returns focus to the button. |
| Unused payees toggle | Not reachable in the demo budget (it has no unused payees); covered by the E2E fixture's screenshots (`Show 3 unused payees`), not by keyboard.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| Privacy              | The page shows no amounts; it renders unchanged with privacy on (desktop, midnight).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| After the fix        | E2E payees, payees.mobile and rules **14/14** against a rebuilt preview; Linux VRT payees **5/5** with no snapshot changes (the fill matched the row in the built-in themes, and the ring shows only on keyboard focus).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| Desktop build        | `scripts/redesign-electron.mjs --remote-debugging-port=9333 --inspect=9339`, fresh `data/redesign-electron/`, `better-sqlite3` rebuilt for Electron and restored from a backup afterwards (it loads under Node again). See below.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |

**Desktop.** The welcome screen listed no budget; **Don't use a server**,
**Try the demo**, then More → Payees in the Electron window:

- Dark 1440×900: the card table and toolbar as in the browser; Tab to a
  rule button shows the 2px ring; Space opens the rule editor and Escape
  returns focus; selecting a payee enables the selection button and its menu
  opens.
- Light 1000×700: no horizontal overflow; the Category Learning dialog opens
  (upstream look, APP-06).
- Midnight 1440×900 with privacy on: renders.
- Console: no errors.
- Quit with `app.quit()` over the inspector: "Isolation check: nothing
  changed" for `%APPDATA%\Actual`, `OneDrive\Documents\Actual` and
  `Documents\Actual`.
