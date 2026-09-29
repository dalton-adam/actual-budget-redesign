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
