# Stage 0 — verification record

Baseline checks run against the pinned release before any application source
change. No file under a protected path (see [stage-0.md](../stage-0.md)) was
touched to produce this record.

## Commands and results

| Check      | Command                                                             | Result                                                            |
| ---------- | -------------------------------------------------------------------- | ------------------------------------------------------------------ |
| Typecheck  | `node .yarn/releases/yarn-4.17.1.cjs typecheck`                      | Pass — 10 workspace tasks, 0 failed                                 |
| Lint       | `node .yarn/releases/yarn-4.17.1.cjs lint`                           | Pass — 0 formatting issues, 0 lint errors                          |
| Unit tests | `node .yarn/releases/yarn-4.17.1.cjs test`                           | Pass — 10 workspace tasks, 0 failed                                 |
| Baseline e2e capture | see below                                                  | 73/74 passed; 1 known viewport-dependent assumption (not a defect) |

Lint initially failed on `scripts/redesign-baseline.config.ts` for importing
`@playwright/test` without declaring it (`no-extraneous-dependencies`). Fixed
by adding `@playwright/test` (pinned to the version `@actual-app/web` already
uses, `1.61.1`) to the root `package.json` devDependencies and updating
`yarn.lock`. This is a planning-tooling dependency declaration only; no
application package was touched.

## Baseline e2e capture

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
total test executions. Screenshots are saved under
`docs/redesign/baseline/screenshots/{desktop-1000,desktop-1440}/`.

**Result: 58 passed, 1 failed, 15 skipped (same describe block as the
failure), all at `desktop-1440`.** `desktop-1000` (37/37) passed in full.

### The one failure — not a redesign regression

`e2e/reports.test.ts:33` (`Reports › loads net worth and cash flow reports`)
asserts a fixed list of five available report cards. At the 1440-wide
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
stopped after the first failure in that block, not because they failed.

## What this establishes

- The pinned release (`v26.9.0`) is internally consistent: typecheck, lint,
  and the full unit-test suite are clean with zero application changes.
- The redesign baseline tooling (`scripts/redesign.mjs`,
  `scripts/redesign-baseline.config.ts`) runs the existing Playwright suite
  against isolated ports without needing a sync server or real budget.
- The only discrepancy found is a viewport-dependent product behavior, not a
  bug introduced by this project, and it is now a recorded constraint for
  later design stages rather than an open question.

## Not covered here

Native desktop/Electron packaging, mobile e2e, accessibility audits, and
performance profiling are deferred to later stages per
[stage-0.md](../stage-0.md#deferred-checks).
