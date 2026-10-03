import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const mode = process.argv[2] ?? 'dev';
if (!['dev', 'preview', 'release'].includes(mode)) {
  console.error('Usage: node scripts/redesign.mjs [dev|preview|release]');
  process.exit(1);
}
// release serves the same built files as preview on its own port, so a copy
// of a real budget lives in a browser origin that tests and demos never use
// (docs/redesign/release.md).
const isBuilt = mode !== 'dev';
if (
  isBuilt &&
  !existsSync(path.join(root, 'packages/desktop-client/build/index.html'))
) {
  console.error(
    'Build the browser app first: node .yarn/releases/yarn-4.17.1.cjs build:browser',
  );
  process.exit(1);
}
const port = { dev: '3017', preview: '3018', release: '3016' }[mode];
const args = [
  path.join(root, '.yarn/releases/yarn-4.17.1.cjs'),
  'workspace',
  '@actual-app/web',
  'exec',
  'vite',
  ...(isBuilt ? ['preview'] : []),
  '--mode=browser',
  '--host',
  '127.0.0.1',
  '--port',
  port,
  '--strictPort',
];
console.log('Actual redesign ' + mode + ': http://127.0.0.1:' + port);
console.log(
  mode === 'release'
    ? 'Budgets here live only in this browser. Export after each session (docs/redesign/release.md).'
    : 'Use Try the demo. Do not connect a server or import a real budget.',
);
const child = spawn(process.execPath, args, {
  cwd: root,
  env: { ...process.env, BROWSER: 'none' },
  stdio: 'inherit',
});
child.on('error', error => {
  console.error(error);
  process.exitCode = 1;
});
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => child.kill(signal));
}
child.on('exit', (code, signal) => {
  process.exitCode = code ?? (signal === 'SIGINT' ? 130 : 1);
});
