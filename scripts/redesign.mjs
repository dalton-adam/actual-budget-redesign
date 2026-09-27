import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const mode = process.argv[2] ?? 'dev';
if (!['dev', 'preview'].includes(mode)) {
  console.error('Usage: node scripts/redesign.mjs [dev|preview]');
  process.exit(1);
}
if (
  mode === 'preview' &&
  !existsSync(path.join(root, 'packages/desktop-client/build/index.html'))
) {
  console.error(
    'Build the browser app first: node .yarn/releases/yarn-4.17.1.cjs build:browser',
  );
  process.exit(1);
}
const port = mode === 'preview' ? '3018' : '3017';
const args = [
  path.join(root, '.yarn/releases/yarn-4.17.1.cjs'),
  'workspace',
  '@actual-app/web',
  'exec',
  'vite',
  ...(mode === 'preview' ? ['preview'] : []),
  '--mode=browser',
  '--host',
  '127.0.0.1',
  '--port',
  port,
  '--strictPort',
];
console.log('Actual redesign ' + mode + ': http://127.0.0.1:' + port);
console.log(
  'Use Try the demo. Do not connect a server or import a real budget.',
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
