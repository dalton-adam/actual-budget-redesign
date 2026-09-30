# Stage 0 — verification record

Baseline checks run against the pinned release before any application source
change. No file under a protected path (see [stage-0.md](../stage-0.md)) was
touched to produce this record.

## Commands and results

| Check               | Command                                         | Result                                                       |
| ------------------- | ----------------------------------------------- | ------------------------------------------------------------ |
| Typecheck           | `node .yarn/releases/yarn-4.17.1.cjs typecheck` | Pass — 10 workspace tasks, 0 failed                          |
| Lint                | `node .yarn/releases/yarn-4.17.1.cjs lint`      | Pass — 0 formatting issues, 0 lint errors                    |
| Unit tests          | `node .yarn/releases/yarn-4.17.1.cjs test`      | Pass — 10 workspace tasks, 0 failed                          |
| Baseline e2e checks | see below                                       | 58 passed, 1 failed, 15 skipped — incomplete at desktop-1440 |

Lint initially failed on `scripts/redesign-baseline.config.ts` for importing
`@playwright/test` without declaring it (`no-extraneous-dependencies`). Fixed
by adding `@playwright/test` (pinned to the version `@actual-app/web` already
uses, `1.61.1`) to the root `package.json` devDependencies and updating
`yarn.lock`. This is a planning-tooling dependency declaration only; no
application package was touched.

## Baseline e2e checks

Command:

```sh
node .yarn/releases/yarn-4.17.1.cjs build:browser
node scripts/redesign.mjs preview   # http://127.0.0.1:3018
E2E_START_URL=http://127.0.0.1:3018 node .yarn/releases/yarn-4.17.1.cjs \
  workspace @actual-app/web run playwright test \
  --config=../../scripts/redesign-baseline.config.ts --workers=1 --reporter=line
```

Scope: `budget.test.ts`, `accounts.test.ts`, `reports.test.ts`, each run at
two viewports (`desktop-1000` = 1000×700, `desktop-1440` = 1440×900), for 74
scheduled test cases. The command above checks behavior; screenshot capture
requires `VRT=true` (see the [handbook](../README.md)). Previously captured
screenshots are under `docs/redesign/baseline/screenshots/`.

**Result: 58 passed, 1 failed, 15 skipped.**

| Viewport     | Passed | Failed | Skipped | Total |
| ------------ | -----: | -----: | ------: | ----: |
| desktop-1000 |     37 |      0 |       0 |    37 |
| desktop-1440 |     21 |      1 |      15 |    37 |
| Total        |     58 |      1 |      15 |    74 |

The failed test and all 15 skipped tests belong to `desktop-1440`.
Skipped tests are unverified, not passes. These are the previously recorded
run results, corrected for consistency; this documentation correction does
not represent a new test run.

### The one failure — not a redesign regression

`e2e/reports.test.ts:33` (`Reports › loads net worth and cash flow reports`)
asserts a fixed list of nine available report cards. At the 1440-wide
viewport the app shows two additional cards, `Transaction Calendar` and
`Recent Net Worth Change`, that are not present at the repo's own default
test viewport.

Confirmed pre-existing and viewport-dependent, not caused by this project:

```sh
E2E_START_URL=http://127.0.0.1:3018 node .yarn/releases/yarn-4.17.1.cjs \
  workspace @actual-app/web run playwright test e2e/reports.test.ts:33 --workers=1 --reporter=line
# 1 passed — using the repo's own default (unmodified) e2e config/viewport
```

No application file was changed between the failing and passing runs; only
the viewport differed. Record this as a genuine, pre-existing behavior for
later stages: **the reports dashboard reveals additional widgets at wider
viewport widths**, so any redesigned reports/dashboard surface (Stage 6) must
account for a viewport-dependent widget set rather than a fixed list. The
remaining 15 skipped tests are later cases in the same `reports.test.ts`
describe block at `desktop-1440`; they were not run because Playwright
stopped after the first failure in that block, not because they failed. Their behavior at this viewport remains unverified.

## What this establishes

- The pinned release (`v26.9.0`) is internally consistent: typecheck, lint,
  and the full unit-test suite are clean with zero application changes.
- The redesign baseline tooling (`scripts/redesign.mjs`,
  `scripts/redesign-baseline.config.ts`) runs the existing Playwright suite
  against isolated ports without needing a sync server or real budget.
- The only discrepancy found is a viewport-dependent product behavior, not a
  bug introduced by this project, and it is recorded for later design stages. The wider Reports suite
  is not fully verified: resolve the viewport-specific test expectation in
  APP-03, then rerun all Reports cases at both widths and record the results.
  Do not remove actual widgets to satisfy the old expectation or count the
  default-viewport single-test rerun as coverage of the skipped cases.
  **Resolved in APP-03a (September 30, 2026):** the test now scrolls every
  widget into view and expects all 11; all 34 Reports cases pass at both
  widths with none skipped (task-reports.md).

## Not covered here

Native desktop/Electron packaging, mobile e2e, accessibility audits, and
performance profiling are deferred to later stages per
[stage-0.md](../stage-0.md#deferred-checks).
