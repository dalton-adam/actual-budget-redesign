import path from 'node:path';

import { defineConfig } from '@playwright/test';

import original from '../packages/desktop-client/playwright.config';

const root = path.resolve(__dirname, '..');

export default defineConfig({
  ...original,
  testDir: path.join(root, 'packages/desktop-client/e2e'),
  testMatch: ['budget.test.ts', 'accounts.test.ts', 'reports.test.ts'],
  workers: 1,
  retries: 0,
  reporter: [['list']],
  outputDir: path.join(root, 'data/redesign/test-results'),
  snapshotPathTemplate: path.join(
    root,
    'docs/redesign/baseline/screenshots/{projectName}/{testFilePath}/{arg}{ext}',
  ),
  webServer: undefined,
  use: {
    ...original.use,
    baseURL: 'http://127.0.0.1:3018',
    browserName: 'chromium',
  },
  projects: [
    { name: 'desktop-1000', use: { viewport: { width: 1000, height: 700 } } },
    { name: 'desktop-1440', use: { viewport: { width: 1440, height: 900 } } },
  ],
});
