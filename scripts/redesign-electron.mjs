// Launches the development desktop (Electron) build of the redesign with
// every data path inside data/redesign-electron/, and checks afterwards that
// nothing in the installed Actual app's folders changed.
// Procedure and reasoning: docs/redesign/stage-0.md, "Desktop isolation review".
import { spawn } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  realpathSync,
  statSync,
} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const home = os.homedir();
const installedDataDir = path.join(home, 'Library/Application Support/Actual');

const sandbox = path.join(root, 'data/redesign-electron');
const dirs = {
  data: path.join(sandbox, 'data'),
  documents: path.join(sandbox, 'documents'),
  chromium: path.join(sandbox, 'chromium'),
};

// The installed app's settings folder, its default budget folder, and any
// budget folder it has been pointed at (Settings → Files).
function protectedDirs() {
  const found = [installedDataDir, path.join(home, 'Documents/Actual')];
  try {
    const store = JSON.parse(
      readFileSync(path.join(installedDataDir, 'global-store.json'), 'utf8'),
    );
    if (typeof store['document-dir'] === 'string') {
      found.push(store['document-dir']);
    }
  } catch {
    // No installed app settings; the defaults above still apply.
  }
  return found.map(dir => (existsSync(dir) ? realpathSync(dir) : dir));
}

function overlaps(a, b) {
  const rel = path.relative(a, b);
  const bInsideA =
    rel === '' || (!rel.startsWith('..') && !path.isAbsolute(rel));
  const relBack = path.relative(b, a);
  const aInsideB = !relBack.startsWith('..') && !path.isAbsolute(relBack);
  return bInsideA || aInsideB;
}

function changedSince(dir, sinceMs, found = []) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return found;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    try {
      const stat = statSync(full);
      if (stat.mtimeMs > sinceMs || stat.ctimeMs > sinceMs) {
        found.push(full);
      }
      if (entry.isDirectory()) {
        changedSince(full, sinceMs, found);
      }
    } catch {
      // Vanished while walking; ignore.
    }
  }
  return found;
}

const guarded = protectedDirs();
for (const dir of Object.values(dirs)) {
  mkdirSync(dir, { recursive: true });
  const real = realpathSync(dir);
  const clash = guarded.find(p => overlaps(p, real));
  if (clash) {
    console.error(`Refusing to start: ${real} overlaps ${clash}.`);
    process.exit(1);
  }
}

const prerequisites = [
  [
    'packages/loot-core/lib-dist/electron/bundle.desktop.js',
    'node .yarn/releases/yarn-4.17.1.cjs workspace @actual-app/core build:node',
  ],
  [
    'packages/desktop-electron/build/desktop-electron/index.js',
    'node .yarn/releases/yarn-4.17.1.cjs workspace desktop-electron build:dist',
  ],
];
for (const [file, command] of prerequisites) {
  if (!existsSync(path.join(root, file))) {
    console.error(`Missing ${file}. Build it first:\n  ${command}`);
    process.exit(1);
  }
}

// The same lookup as the electron package's index.js, which the root
// workspace does not list as a dependency.
const electronDir = path.join(root, 'node_modules/electron');
const electronPathFile = path.join(electronDir, 'path.txt');
const electronBinary = existsSync(electronPathFile)
  ? path.join(electronDir, 'dist', readFileSync(electronPathFile, 'utf8'))
  : '';
if (!electronBinary || !existsSync(electronBinary)) {
  console.error(
    'Electron is not downloaded yet: node node_modules/electron/install.js',
  );
  process.exit(1);
}

const startedAt = Date.now();
console.log('Actual redesign desktop build (development)');
console.log(`  budgets and settings: ${sandbox}`);
console.log('  renderer: http://127.0.0.1:3001');
console.log(
  'Use Try the demo. Do not connect a server, import a real budget or change the budget folder.',
);

// The Electron development build loads http://localhost:3001 (fixed in
// packages/desktop-electron/index.ts). Upstream's `yarn start` binds every
// interface; bind loopback only, as the browser previews do.
const vite = spawn(
  process.execPath,
  [
    path.join(root, '.yarn/releases/yarn-4.17.1.cjs'),
    'workspace',
    '@actual-app/web',
    'exec',
    'vite',
    '--host',
    '127.0.0.1',
    '--port',
    '3001',
    '--strictPort',
  ],
  { cwd: root, env: { ...process.env, BROWSER: 'none' }, stdio: 'inherit' },
);

const electronEnv = {
  ...process.env,
  ACTUAL_DATA_DIR: dirs.data,
  ACTUAL_DOCUMENT_DIR: dirs.documents,
  NODE_ENV: 'development',
};
// Playwright mode changes the user agent and requires its own setup.
delete electronEnv.EXECUTION_CONTEXT;

// --user-data-dir moves Chromium's own storage (localStorage, IndexedDB,
// cookies, caches, crash dumps). Without it an unpackaged build named
// "Actual" uses the installed app's ~/Library/Application Support/Actual.
const electron = spawn(
  electronBinary,
  [
    path.join(root, 'packages/desktop-electron'),
    `--user-data-dir=${dirs.chromium}`,
  ],
  { cwd: root, env: electronEnv, stdio: 'inherit' },
);

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => electron.kill(signal));
}

electron.on('exit', code => {
  vite.kill('SIGTERM');
  const changed = guarded.flatMap(dir => changedSince(dir, startedAt));
  if (changed.length > 0) {
    console.error(
      "These files in the installed app's folders changed during the run " +
        '(if the installed app was open, it may have changed them):',
    );
    for (const file of changed) {
      console.error(`  ${file}`);
    }
    process.exitCode = 1;
  } else {
    console.log(
      `Isolation check: nothing changed in ${guarded.join(', ')} during the run.`,
    );
    process.exitCode = code ?? 1;
  }
});
