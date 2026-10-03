# Release 01 (RELEASE-01)

Prepared October 3, 2026. This is the first release of the redesign: a
browser build you run on your own computer next to the installed desktop app,
which it never touches. Plan §13 asks for a controlled, reversible release.
This document is the build record, the install steps, the walkthrough to run
on a copy of your budget, and the way back.

**State: waiting for the owner's check.** The build passes its tests (below).
Plan §13 counts the release as delivered only once you have run it on a copy
of your own budget (step 3) and found it usable.

## What it is

| Item          | Value                                                                                                                                                                            |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Source        | `redesign/main` at `1f687b25d` (UNDO-FIX merge). Tag it `redesign-r01` when this release is merged                                                                               |
| Upstream base | Actual v26.10.0 (`2bebdbaae`, merged in SYNC-01)                                                                                                                                 |
| Version shown | "App: v26.10.0", the same as upstream. The fork has no version of its own; the git revision identifies the build                                                                 |
| Build         | `node .yarn/releases/yarn-4.17.1.cjs build:browser` → `packages/desktop-client/build/` (209 files, 53 MB). Built here on Windows with Node 24.14.1                               |
| Delivery      | Browser build served at http://127.0.0.1:3016 by `node scripts/redesign.mjs release`. No desktop package: a packaged fork build would open the installed app's data (stage-0.md) |
| Data change   | None made by the release. A budget you import is a copy; it is migrated to v26.10.0 like any budget opened in official 26.10.0                                                   |

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
  site's own storage for `127.0.0.1:3016`. Actual does not ask the browser
  to keep that storage, so clearing site data, a browser reset or storage
  pressure can remove it. Safari also clears storage for sites you have not
  visited in a while. Use Chrome or Edge, and export after each session
  (step 4).

## Verification of this build

Source checks come from QA-01 (verification.md) plus the tasks merged since
(APP-07, A11Y-01, UNDO-FIX; task-reports.md). On this revision:

| Check                               | Result                                                                                                                                                                                           |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Typecheck, lint on changed files    | Pass (UNDO-FIX)                                                                                                                                                                                  |
| `C/budget` unit tests               | 92/92                                                                                                                                                                                            |
| E2E, every desktop file, this build | **124/124** with the installed Edge, one worker, no retries: 116 on the first run, and the 8 `accounts` failures (a test locator broken by A11Y-01's names, fixed in `5cc5c7f89`) 12/12 on rerun |
| Release server                      | Starts on 127.0.0.1:3016, cross-origin isolated, welcome screen lists no budgets, no console errors                                                                                              |

## 1. Before you start

- **Keep using the desktop app for real work** until you decide otherwise
  (step 5). Nothing here changes it or its files.
- **Check the desktop app's version** (Settings, bottom of the page). If it
  is older than 26.10.0, a budget changed in the redesign can't go back into
  it until you update it (see Rollback).
- Don't connect a sync server or bank sync to the redesign in this release.
  Both would share your real budget with a second, unreviewed app.

## 2. Install (on the Mac)

From a terminal, in your clone of the fork, after pushing `redesign/main`:

```sh
git fetch
git checkout redesign-r01
node .yarn/releases/yarn-4.17.1.cjs install --immutable
node .yarn/releases/yarn-4.17.1.cjs build:browser
node scripts/redesign.mjs release
```

Open http://127.0.0.1:3016 in Chrome or Edge. The server listens on this
computer only. Stop it with Ctrl+C; start it again with the last command.
The budgets stay in the browser between runs as long as you use the same
browser, profile and port.

Use port 3016 only for your budget. Ports 3017 (dev) and 3018 (preview) are
for tests and the demo; each port keeps its own budgets, so they never mix.

## 3. Check it on a copy of your budget

1. In the **desktop app**: Settings → **Export data**. This saves a zip
   copy; the desktop app's budget is unchanged.
2. At http://127.0.0.1:3016: **Import my budget** → **Actual** →
   **Select file...**, and choose the zip.
3. Walk through what you do in a normal week, comparing with the desktop
   app as you go:
   - Ready to Assign, Assigned, Activity and Available match the desktop
     app for this month and last month.
   - Assign money until Ready to Assign is zero; cover an overspent
     category; press Ctrl+Z and Ctrl+Shift+Z.
   - Open a category's details panel; open its transactions.
   - Find an account, add a transaction, edit and split one, reconcile.
   - Open Reports, Schedules, Payees and Rules.
   - Switch light, dark and midnight; turn privacy mode on and off.
4. Write down anything wrong or confusing. Each one becomes a task.

Changes you make in this copy stay in the browser. They don't reach the
desktop app.

## 4. Export after each session

Settings → **Export data** in the redesign, every time you finish. Keep the
zips somewhere backed up. An export is the only copy outside the browser.

## 5. Switching for real

The release does not decide this. If the copy works for you, the choice is:

- **Keep both, the desktop app primary.** Use the redesign to look, not to
  edit. Nothing to manage.
- **Make the redesign primary.** Import a fresh export, stop editing in the
  desktop app, and export after each session (step 4). Editing both splits
  your budget into two that can't be merged.

A desktop package of the redesign, installed next to the official app with
its own name and folders, is a separate packaging task.

## Rollback

- **Stop using the redesign:** stop the server (Ctrl+C) and keep using the
  desktop app. Its budget and settings were never touched.
- **Take changes back to the desktop app:** export from the redesign, then
  in the desktop app's budget list use **Import file** → **Actual**. This needs the desktop app at
  26.10.0 or newer: the redesign's budgets carry upstream's 26.10.0
  migration (`1788468782000_add_messages_pending`), and older versions
  show "Please update Actual!" and close the budget.
- **Go back to an earlier build of the redesign:** check out the earlier
  revision or tag and run step 2 again. No release changes the data format
  beyond upstream's, so the budget in the browser keeps working.
- **Remove the redesign's data:** in the browser, delete site data for
  `127.0.0.1:3016`. Export first if you want to keep it.

## After this release

- Plan §13: once the redesign is accepted, remove preview scaffolding in a
  separate change.
- Next tasks: GOAL-01 and LOAN-01 (each designed and approved first), the
  packaging task, and optional PERF-04.
