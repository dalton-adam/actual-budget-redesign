# Redesign handbook

## Read in this order

1. [Approved staged plan](plan.md).
2. [Stage 0 findings and code map](stage-0.md).
3. [Behavior inventory](behavior-inventory.md).
4. [Implementation backlog](backlog.md).
5. [Verification record](baseline/README.md).
6. Root `AGENTS.md`, `CODE_REVIEW_GUIDELINES.md`, and `.github/agents/pr-and-commit-rules.md`.

## Development setup

Use Node >=22.18.0 as required by package.json. Stage 0 used Node 24.14.1; upstream .nvmrc recommends 24.18.1. Yarn 4.17.1 is checked into the repository, so a global Yarn installation is unnecessary.

Run commands from the repository root:

```sh
node .yarn/releases/yarn-4.17.1.cjs install --immutable
node scripts/redesign.mjs dev
```

The dev app listens only at http://127.0.0.1:3017. It uses the existing browser build of Actual and a separate browser origin. Select **Try the demo**. Do not connect a sync server, import a real budget, or choose a real data directory.

If the unbundled development page is slow to load, use a built preview:

```sh
node .yarn/releases/yarn-4.17.1.cjs build:browser
node scripts/redesign.mjs preview
```

The preview listens only at http://127.0.0.1:3018. Its data is separate from port 3017 and the installed desktop app. Close the terminal process with Ctrl+C to stop it. A built preview must be rebuilt to show source changes.

## Baseline verification commands

```sh
node .yarn/releases/yarn-4.17.1.cjs typecheck
node .yarn/releases/yarn-4.17.1.cjs test
node .yarn/releases/yarn-4.17.1.cjs lint
node .yarn/releases/yarn-4.17.1.cjs workspace @actual-app/web exec playwright install chromium
```

With the preview running, run existing behavior tests against isolated browser contexts:

```sh
E2E_START_URL=http://127.0.0.1:3018 node .yarn/releases/yarn-4.17.1.cjs workspace @actual-app/web exec playwright test budget.test.ts accounts.test.ts settings.test.ts --workers=1 --reporter=line
```

Names match the desktop test files; use an anchored test-file pattern if the runner also selects `.mobile.test.ts`.

The dedicated baseline configuration reuses upstream tests and puts images in this documentation directory rather than overwriting upstream Linux snapshots:

```sh
VRT=true node .yarn/releases/yarn-4.17.1.cjs exec playwright test --config scripts/redesign-baseline.config.ts --grep 'renders the summary information|creates a new account and views the initial balance transaction|loads net worth and cash flow reports'
```

Only when intentionally establishing or reviewing a new visual reference, append `--update-snapshots`. A visual update is not a substitute for inspecting differences. These macOS/Chromium references are platform-specific.

## Branches and handoffs

Create a small task branch from `redesign/main`, for example `redesign/budget-toolbar`. Each task should have a narrow allowlist and checks from the backlog. Keep financial and server logic out of the diff.

The repository's inherited instructions prohibit agents from creating GitHub issues. The versioned Markdown backlog is the working tracker; this does not block implementation. Follow the inherited commit/PR naming and template rules if a PR is created. No upstream PR should be opened for this personal redesign unless explicitly requested.

The next stage is DESIGN-01: a fictional-data prototype. Stage 0 setup does not approve a final layout or begin the UI implementation.
