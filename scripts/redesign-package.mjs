// Builds the redesign as a packaged macOS desktop app named "Actual Redesign",
// with its own bundle ID, settings folder and budget folder, so it can sit
// beside the installed Actual app without opening its data.
// Procedure and reasoning: docs/redesign/stage-0.md, "Packaged desktop build".
import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// oxlint-disable-next-line actual/no-extraneous-dependencies -- installed for electron-builder, which reads the packaged app.asar the same way
import { extractFile } from '@electron/asar';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const home = os.homedir();
const yarn = path.join(root, '.yarn/releases/yarn-4.17.1.cjs');

const productName = 'Actual Redesign';
const appId = 'io.github.dalton-adam.actual-redesign';
const installedAppId = 'com.actualbudget.actual';

if (process.platform !== 'darwin') {
  console.error(
    'Only macOS packaging is set up. Use node scripts/redesign-electron.mjs on other platforms.',
  );
  process.exit(1);
}

const arch = os.arch() === 'arm64' ? 'arm64' : 'x64';
const appPath = path.join(
  root,
  'packages/desktop-electron/dist',
  arch === 'arm64' ? 'mac-arm64' : 'mac',
  `${productName}.app`,
);

function run(command, args, options = {}) {
  console.log(`\n> ${[command, ...args].join(' ')}`);
  execFileSync(command, args, { cwd: root, stdio: 'inherit', ...options });
}

// electron-builder's beforePackHook rebuilds these for Electron in the shared
// node_modules. Node loads a build/ folder ahead of the prebuilds, so a left-
// over Electron build breaks Node tests. Put each back as it was.
const nativeModules = ['better-sqlite3', 'bcrypt', 'argon2'];
const backupDir = path.join(root, 'data/redesign-package/native-backup');

function backUpNativeBuilds() {
  rmSync(backupDir, { recursive: true, force: true });
  mkdirSync(backupDir, { recursive: true });
  return nativeModules.map(name => {
    const build = path.join(root, 'node_modules', name, 'build');
    const backup = path.join(backupDir, name);
    const existed = existsSync(build);
    if (existed) {
      cpSync(build, backup, { recursive: true });
    }
    return { name, build, backup, existed };
  });
}

function restoreNativeBuilds(saved) {
  for (const { build, backup, existed } of saved) {
    rmSync(build, { recursive: true, force: true });
    if (existed) {
      cpSync(backup, build, { recursive: true });
    }
  }
  execFileSync(
    process.execPath,
    [
      '-e',
      "new (require('better-sqlite3'))(':memory:'); require('bcrypt'); require('argon2');",
    ],
    { cwd: root, stdio: 'inherit' },
  );
  console.log('Native modules restored for Node.');
}

function plistValue(key) {
  return execFileSync(
    '/usr/libexec/PlistBuddy',
    ['-c', `Print ${key}`, path.join(appPath, 'Contents/Info.plist')],
    { encoding: 'utf8' },
  ).trim();
}

function checkPackagedApp() {
  const bundleId = plistValue('CFBundleIdentifier');
  const bundleName = plistValue('CFBundleName');
  const asarPackage = JSON.parse(
    extractFile(
      path.join(appPath, 'Contents/Resources/app.asar'),
      'package.json',
    ).toString('utf8'),
  );
  const problems = [];
  // Every JavaScript migration must be in the packaged backend, or budgets
  // fail to open ("Could not find JS migration code to run").
  const backend = extractFile(
    path.join(appPath, 'Contents/Resources/app.asar'),
    'build/loot-core/lib-dist/electron/bundle.desktop.js',
  ).toString('utf8');
  const jsMigrations = readdirSync(
    path.join(root, 'packages/loot-core/migrations'),
  ).filter(name => name.endsWith('.js'));
  for (const name of jsMigrations) {
    if (!backend.includes(name.replace(/\.js$/, ''))) {
      problems.push(`backend bundle is missing migration ${name}`);
    }
  }
  if (bundleId === installedAppId || bundleId !== appId) {
    problems.push(`bundle ID is ${bundleId}, expected ${appId}`);
  }
  if (bundleName !== productName) {
    problems.push(`bundle name is ${bundleName}, expected ${productName}`);
  }
  // app.getName() reads productName from the packaged package.json; it names
  // the settings folder and, through index.ts, the budget folder.
  if (asarPackage.productName !== productName) {
    problems.push(
      `packaged productName is ${asarPackage.productName}, expected ${productName}`,
    );
  }
  if (problems.length > 0) {
    throw new Error(`Packaged app failed its checks: ${problems.join('; ')}`);
  }
}

const saved = backUpNativeBuilds();
let failed = false;
try {
  // Everything upstream's package script builds, without downloading
  // translations (English only) and without its electron-builder step.
  run('./bin/package-electron', ['--skip-exe-build', '--skip-translations']);
  // package-electron builds the desktop backend before `yarn build:browser`,
  // whose lage `build` step can restore a cached, older lib-dist/** over it
  // (a bundle missing newer migrations). Rebuild it, then recopy and recompile
  // as package-electron does.
  run(process.execPath, [yarn, 'workspace', '@actual-app/core', 'build:node']);
  run(process.execPath, [
    yarn,
    'workspace',
    'desktop-electron',
    'update-client',
  ]);
  run(process.execPath, [yarn, 'workspace', 'desktop-electron', 'build:dist']);

  rmSync(path.dirname(appPath), { recursive: true, force: true });
  run(
    process.execPath,
    [
      yarn,
      'workspace',
      'desktop-electron',
      'exec',
      'electron-builder',
      '--mac',
      'dir',
      `--${arch}`,
      '--publish',
      'never',
      `-c.appId=${appId}`,
      `-c.productName=${productName}`,
      `-c.extraMetadata.productName=${productName}`,
    ],
    // No signing identity: afterSignHook signs ad hoc, which a locally built
    // app needs to run on Apple silicon.
    { env: { ...process.env, CSC_IDENTITY_AUTO_DISCOVERY: 'false' } },
  );

  checkPackagedApp();
} catch (error) {
  failed = true;
  console.error(error instanceof Error ? error.message : error);
} finally {
  restoreNativeBuilds(saved);
}

if (failed) {
  process.exit(1);
}

console.log(`
Built ${appPath}
  bundle ID: ${appId}
  settings:  ${path.join(home, 'Library/Application Support', productName)}
  budgets:   ${path.join(home, 'Documents', productName, 'Actual')}
Install by dragging it into /Applications. It never reads the installed
Actual app's folders (~/Library/Application Support/Actual, ~/Documents/Actual).`);
