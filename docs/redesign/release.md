# Release 01 (RELEASE-01)

Prepared October 3, 2026. This is the first release of the redesign: a
browser build you run on your own computer. Plan §13 asks for a controlled,
reversible release. This document is the build record, the install steps,
the walkthrough to run on a copy of your YNAB budget, and the way back.

**A copy of the owner's YNAB budget is now imported** (October 3, 2026)
at the isolated release origin. The installed Actual desktop app and the
original YNAB budget were not changed. The way back remains using YNAB.

**State: import reconciliation passed; editing walkthrough still pending.**
The owner reviewed the live YNAB budget against the imported copy. Account
balances and current category totals match; the Ready to Assign difference
is explained. See the [import verification record](ynab-import-check.md).
Plan §13 counts the release as delivered only once the remaining workflow
checks in step 3 are run on this copy and the owner finds it usable.

## What it is

| Item          | Value                                                                                                                                                                                            |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Source        | `redesign/main` at `1f687b25d` (UNDO-FIX merge). Tag it `redesign-r01` when this release is merged                                                                                               |
| Upstream base | Actual v26.10.0 (`2bebdbaae`, merged in SYNC-01)                                                                                                                                                 |
| Version shown | "App: v26.10.0", the same as upstream. The fork has no version of its own; the git revision identifies the build                                                                                 |
| Build         | `node .yarn/releases/yarn-4.17.1.cjs build:browser` → `packages/desktop-client/build/` (209 files, 53 MB). Built here on Windows with Node 24.14.1                                               |
| Delivery      | Browser build served at http://127.0.0.1:3016 by `node scripts/redesign.mjs release`. No desktop package yet: a packaged fork build would share the official app's name and folders (stage-0.md) |
| Data change   | None. Importing reads a YNAB export file; YNAB itself is never contacted or changed by the app                                                                                                   |

What changed for you: every desktop screen in the redesigned look (Layout A
navigation, summary cards, the Budget table and details panel, Accounts,
Reports, Schedules, Payees, Rules, Tags, Settings, dialogs, menus and
notices), the envelope wording from design-decisions §9, and three follow-ups
from QA-01 and the walkthrough: named row buttons (A11Y-01), the restyled
Notifications page and Monte Carlo Income table (APP-07), and Ctrl+Z right
after Enter saves an amount (UNDO-FIX). Full task list: the backlog ledger.

### Known limits

- **Mobile layout is upstream's** (plan §19.4); only its envelope wording
  and colours changed. **Tracking budgets** keep upstream's table inside the
  new shell (QA-01 finding 2).
- **Month switch** on a large budget at 1000×700 with the details panel open
  is 11% slower than v26.10.0, over the 10% limit; you accepted this on
  October 3, 2026 (PERF-03). PERF-04 may cut it later.
- **Not checked:** a screen reader; the desktop (Electron) bundle; the
  tracking budget's Ctrl+Z by hand.
- **Budgets live in the browser.** The browser build stores budgets in the
  site's own storage for `127.0.0.1:3016`. Actual requests persistent
  storage, but the browser may deny that request. Clearing site data or
  resetting the browser can still remove the budget; storage pressure can
  remove it if persistence was not granted. Use the same browser, profile
  and port, and export after each session (step 4).

## Verification of this build

Source checks come from QA-01 (verification.md) plus the tasks merged since
(APP-07, A11Y-01, UNDO-FIX; task-reports.md). On this revision:

| Check                               | Result                                                                                                                                                                                           |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Typecheck, lint on changed files    | Pass (UNDO-FIX)                                                                                                                                                                                  |
| `C/budget` unit tests               | 92/92                                                                                                                                                                                            |
| E2E, every desktop file, this build | **124/124** with the installed Edge, one worker, no retries: 116 on the first run, and the 8 `accounts` failures (a test locator broken by A11Y-01's names, fixed in `5cc5c7f89`) 12/12 on rerun |
| YNAB import, this build             | `onboarding.test.ts` **6/6**: a fictional nYNAB file imports with the right account balances and schedules (also YNAB4 and Actual imports)                                                       |
| Release server                      | Starts on 127.0.0.1:3016, cross-origin isolated, welcome screen lists no budgets, no console errors                                                                                              |

## 1. Before you start

- **Keep using YNAB for real work** until you decide otherwise (step 5).
  Nothing here changes it.
- Don't connect a sync server or bank sync to the redesign in this release.
- Run it on whichever computer you'll budget on. The commands are the same
  on Windows (PowerShell or Git Bash) and macOS. It needs Node 22.18 or
  newer.

## 2. Install

From a terminal, in your clone of the fork, after pushing `redesign/main`
and the tag:

```sh
git fetch --tags
git checkout redesign-r01
node .yarn/releases/yarn-4.17.1.cjs install --immutable
node .yarn/releases/yarn-4.17.1.cjs build:browser
node scripts/redesign.mjs release
```

On the Windows machine this was built on, the last command is enough: the
build is already in `packages/desktop-client/build/`.

Open http://127.0.0.1:3016 in Chrome or Edge. The server listens on this
computer only. Stop it with Ctrl+C; start it again with the last command.
The budgets stay in the browser between runs as long as you use the same
browser, profile and port.

Use port 3016 only for your budget. Ports 3017 (dev) and 3018 (preview) are
for tests and the demo; each port keeps its own budgets, so they never mix.

## 3. Check it on a copy of your YNAB budget

1. **Export from YNAB as a JSON file.** Actual's guide,
   [Migrating from nYNAB](https://actualbudget.org/docs/migration/nynab)
   (also in this repo at `packages/docs/docs/migration/nynab.md`), gives
   three ways. The community web exporter is the quickest; the others use
   a YNAB Personal Access Token on YNAB's own API pages. Treat that token
   like a password: delete it in YNAB's Developer Settings when you are
   done, and keep the JSON file private (it holds your whole budget).
2. At http://127.0.0.1:3016: **Import my budget** → **nYNAB** →
   **Select file...**, and choose the JSON file.
3. Expect differences. Actual's import notes that budgets "may not match up
   exactly". Compare with YNAB as you go:
   - Account balances match YNAB's.
   - Each category's Available for this month matches YNAB's, and Ready to
     Assign is close; note any that differ and by how much.
   - Assign money until Ready to Assign is zero; cover an overspent
     category; press Ctrl+Z and Ctrl+Shift+Z.
   - Open a category's details panel; open its transactions.
   - Find an account, add a transaction, edit and split one, reconcile.
   - Open Reports, Schedules, Payees and Rules.
   - Switch light, dark and midnight; turn privacy mode on and off.
4. Write down anything wrong or confusing, including import differences.
   Each one becomes a task (an import mismatch is an upstream import
   question, not a redesign one, but worth recording).

Nothing you do in this copy reaches YNAB.

## 4. Export after each session

Settings → **Export data** in the redesign, every time you finish. Keep the
zips somewhere backed up. An export is the only copy outside the browser.

The October 3 import has a private, restore-checked Actual ZIP at
`data/redesign/private-budget/actual-test-budget-2026-10-03.zip` in the local
checkout. The original YNAB JSON is alongside it. This directory is ignored
by Git and is not served by the release server; it does not travel with a
clone or a push. Copy the ZIP separately to your private backup location.
It captures the imported snapshot, not edits made after that snapshot.

To restore a separate copy, use a fresh browser profile, start the release
server, open the budget list and choose **Import file** → **Actual**, then
select the ZIP. Actual preserves the archive's budget ID: restoring into a
profile that already contains that budget replaces its current data.
Export any newer work before restoring there.

## 5. Switching for real

The release does not decide this. If the copy works for you:

- **Run both for a while.** Keep YNAB as the record and use the redesign
  alongside it. Re-import a fresh YNAB export whenever you want to compare
  again (a new import makes a new budget; delete the old one in the budget
  list).
- **Move to the redesign.** Import a final YNAB export, enter new
  transactions only in the redesign from then on, and export after each
  session (step 4). Entering the same spending in both means keeping two
  budgets by hand.

A desktop package of the redesign now exists for macOS (PKG-01): see
"Desktop app" below.

## Desktop app (macOS)

Instead of the browser build, you can run the redesign as a Mac app named
**Actual Redesign**. It has its own settings and budget folders and never
opens the official Actual app's data (stage-0.md, "Packaged desktop build").

```sh
node scripts/redesign-package.mjs
```

Drag `packages/desktop-electron/dist/mac-arm64/Actual Redesign.app` into
`/Applications`. Budgets are saved as files in
`~/Documents/Actual Redesign/Actual`, which Time Machine backs up. To move
your budget over, export it from the browser build (Settings → **Export
data**), then in the app choose **Import file** → **Actual**. After that,
use one or the other; they do not sync with each other.

To update: pull, rerun the script, quit the app and replace it in
`/Applications`. Your budgets stay in `~/Documents/Actual Redesign`.

## Rollback

- **Stop using the redesign:** stop the server (Ctrl+C) and carry on in
  YNAB. YNAB was never changed. Anything you entered only in the redesign
  would need entering in YNAB by hand; there is no export back to YNAB.
- **Move to official Actual instead:** export from the redesign, then in
  official Actual's budget list use **Import file** → **Actual**. That
  needs official Actual 26.10.0 or newer: the redesign's budgets carry
  upstream's 26.10.0 migration (`1788468782000_add_messages_pending`), and
  older versions show "Please update Actual!" and close the budget.
- **Go back to an earlier build of the redesign:** check out the earlier
  revision or tag and run step 2 again. No release changes the data format
  beyond upstream's, so the budget in the browser keeps working.
- **Remove the redesign's data:** in the browser, delete site data for
  `127.0.0.1:3016`. Export first if you want to keep it.

## After this release

- Plan §13: once the redesign is accepted, remove preview scaffolding in a
  separate change.
- Next tasks: GOAL-01 and LOAN-01 (each designed and approved first), the
  packaging task (done for macOS: PKG-01), and optional PERF-04.
