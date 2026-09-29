// Times the same demo-budget actions in the v26.9.0 base build and the
// redesign build (QA-00; QA-01 reruns it against the recorded medians).
// Method and results: docs/redesign/verification.md.
//
// Serve both builds first (the redesign with `node scripts/redesign.mjs
// preview`, the base from a v26.9.0 worktree on another port), then:
//   node scripts/redesign-perf.mjs run [runs] [out.json] [WxH ...]
//   node scripts/redesign-perf.mjs summary [out.json]
// PERF_BASE_URL and PERF_REDESIGN_URL override the default ports.
import { readFileSync, writeFileSync } from 'node:fs';

import { chromium } from '@playwright/test';

const BUILDS = {
  base: process.env.PERF_BASE_URL ?? 'http://127.0.0.1:3019',
  redesign: process.env.PERF_REDESIGN_URL ?? 'http://127.0.0.1:3018',
  'redesign-closed': process.env.PERF_REDESIGN_URL ?? 'http://127.0.0.1:3018',
};
const [mode = 'run', ...args] = process.argv.slice(2);
const RUNS = Number(args[0] ?? 7);
const OUT = args[1] ?? 'data/redesign/perf.json';
const VIEWPORTS = (
  args.length > 2 ? args.slice(2) : ['1440x900', '1000x700']
).map(v => v.split('x').map(Number));

const EXTRA_GROUPS = 5;
const EXTRA_PER_GROUP = 20;

// Records the time of the last DOM mutation under #root so a step can be
// timed until the page stops changing, and when the first category row
// with a name was painted after load.
const INIT = () => {
  window.__qa = { last: 0, firstRow: 0 };
  const start = () => {
    const root = document.getElementById('root');
    if (!root) return requestAnimationFrame(start);
    new MutationObserver(() => {
      window.__qa.last = performance.now();
      if (!window.__qa.firstRow) {
        const name = document.querySelector(
          '[data-testid="budget-table"] [data-testid="row"] [data-testid="category-name"]',
        );
        if (name && name.textContent.trim()) {
          requestAnimationFrame(() => {
            if (!window.__qa.firstRow) window.__qa.firstRow = performance.now();
          });
        }
      }
    }).observe(root, {
      subtree: true,
      childList: true,
      attributes: true,
      characterData: true,
    });
  };
  start();
};

async function now(page) {
  return page.evaluate(() => performance.now());
}

// Waits until nothing under #root has changed for `quiet` ms and returns the
// time of the last change.
async function settle(page, quiet = 250, timeout = 20000) {
  return page.evaluate(
    ([quiet, timeout]) =>
      new Promise(resolve => {
        const t0 = performance.now();
        const tick = () => {
          const t = performance.now();
          if (t - window.__qa.last >= quiet || t - t0 > timeout) {
            resolve(window.__qa.last);
          } else {
            setTimeout(tick, 20);
          }
        };
        tick();
      }),
    [quiet, timeout],
  );
}

async function seed(page) {
  await page.evaluate(
    async ([groups, per]) => {
      for (let g = 0; g < groups; g++) {
        const groupId = await window.$send('category-group-create', {
          name: `QA group ${g + 1}`,
        });
        for (let c = 0; c < per; c++) {
          await window.$send('category-create', {
            name: `QA ${g + 1}.${String(c + 1).padStart(2, '0')}`,
            groupId,
          });
        }
      }
    },
    [EXTRA_GROUPS, EXTRA_PER_GROUP],
  );
  await page.waitForFunction(
    n =>
      document.querySelectorAll(
        '[data-testid="budget-table"] [data-testid="category-name"]',
      ).length >= n,
    13 + EXTRA_GROUPS * EXTRA_PER_GROUP,
    { timeout: 60000 },
  );
}

async function measureFirstPaint(page) {
  await page.reload();
  await page.getByTestId('budget-table').waitFor({ timeout: 60000 });
  await page.waitForFunction(() => window.__qa.firstRow > 0, null, {
    timeout: 60000,
  });
  const settled = await settle(page, 500);
  const firstRow = await page.evaluate(() => window.__qa.firstRow);
  return { firstRow, settled };
}

async function measureScroll(page) {
  return page.evaluate(
    () =>
      new Promise(resolve => {
        const sc = document.querySelector(
          '[data-testid="budget-table-scroll-container"]',
        );
        sc.scrollTop = 0;
        const FRAMES = 90;
        const PASSES = 4; // down, up, down, up
        const intervals = [];
        let frame = 0;
        let prev = performance.now();
        const t0 = prev;
        const step = t => {
          intervals.push(t - prev);
          prev = t;
          frame++;
          const pass = Math.floor(frame / FRAMES);
          if (pass >= PASSES) {
            resolve({
              intervals: intervals.slice(1),
              total: t - t0,
              range: sc.scrollHeight - sc.clientHeight,
            });
            return;
          }
          const p = (frame % FRAMES) / FRAMES;
          const max = sc.scrollHeight - sc.clientHeight;
          sc.scrollTop = Math.round((pass % 2 === 0 ? p : 1 - p) * max);
          requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }),
  );
}

async function measureEdits(page, run) {
  await page
    .getByTestId('budget-table-scroll-container')
    .evaluate(el => (el.scrollTop = 0));
  const row = page
    .getByTestId('budget-table')
    .getByTestId('row')
    .filter({ hasText: 'Food' })
    .first();
  await row.getByTestId('budget').first().click();
  const latencies = [];
  const names = [];
  for (let i = 0; i < 20; i++) {
    const input = page.locator('[data-testid="budget-table"] input:focus');
    await input.waitFor({ timeout: 10000 });
    const name = await input.evaluate(el =>
      el
        .closest('[data-testid="row"]')
        ?.querySelector('[data-testid="category-name"]')
        ?.textContent.trim(),
    );
    names.push(name);
    const value = String(1000 + run * 50 + i);
    await input.fill(value);
    const t0 = await now(page);
    await page.keyboard.press('Enter');
    await page.waitForFunction(
      ([name, value]) => {
        const rows = document.querySelectorAll(
          '[data-testid="budget-table"] [data-testid="row"]',
        );
        for (const r of rows) {
          const n = r.querySelector('[data-testid="category-name"]');
          if (n && n.textContent.trim() === name) {
            const cell = r.querySelector('[data-testid="budget"]');
            if (!cell || cell.querySelector('input')) return false;
            return cell.textContent.replace(/[^0-9.]/g, '') === value + '.00';
          }
        }
        return false;
      },
      [name, value],
      { polling: 'raf', timeout: 10000 },
    );
    latencies.push((await now(page)) - t0);
  }
  await page.keyboard.press('Escape');
  await settle(page);
  return { latencies, names };
}

async function measureMonths(page) {
  const next = page
    .getByRole('button', { name: 'Next month' })
    .or(page.getByTitle('Next month'))
    .first();
  const prev = page
    .getByRole('button', { name: 'Previous month' })
    .or(page.getByTitle('Previous month'))
    .first();
  const label = page.getByTestId('selected-budget-month');
  const results = [];
  for (const [button, n] of [
    [next, 5],
    [prev, 5],
  ]) {
    for (let i = 0; i < n; i++) {
      const month = await label.getAttribute('data-month');
      await settle(page);
      const t0 = await now(page);
      await button.click();
      await page.waitForFunction(
        m =>
          document
            .querySelector('[data-testid="selected-budget-month"]')
            ?.getAttribute('data-month') !== m,
        month,
        { polling: 'raf' },
      );
      const labelAt = await now(page);
      const settled = await settle(page);
      results.push({ label: labelAt - t0, settled: settled - t0 });
    }
  }
  return results;
}

async function openAccount(page) {
  await settle(page);
  const t0 = await now(page);
  await page
    .getByRole('link', { name: /^Bank of America/ })
    .first()
    .click();
  await page
    .getByTestId('transaction-table')
    .getByTestId('row')
    .first()
    .waitFor({ timeout: 30000 });
  const rowsAt = await now(page);
  const settled = await settle(page);
  return { rows: rowsAt - t0, settled: settled - t0 };
}

async function measureAccounts(page) {
  const first = await openAccount(page);
  await page.getByRole('link', { name: 'Budget', exact: true }).first().click();
  await page.getByTestId('budget-table').waitFor();
  const second = await openAccount(page);
  await page.getByRole('link', { name: 'Budget', exact: true }).first().click();
  await page.getByTestId('budget-table').waitFor();
  return { first, second };
}

async function oneRun(browser, build, [width, height], run) {
  const context = await browser.newContext({ viewport: { width, height } });
  const page = await context.newPage();
  await page.addInitScript(INIT);
  if (build === 'redesign-closed') {
    // Same build with the details panel closed (its device-local choice).
    await page.addInitScript(() =>
      localStorage.setItem('actual-budget-details-panel-open', 'false'),
    );
  }
  const result = { build, viewport: `${width}x${height}`, run };

  await page.goto(BUILDS[build]);
  const tDemo = await now(page);
  await page.getByRole('button', { name: 'Try the demo', exact: true }).click();
  await page.getByTestId('budget-table').waitFor({ timeout: 60000 });
  result.demoCreate = (await settle(page, 500)) - tDemo;

  result.firstPaintDemo = await measureFirstPaint(page);
  await seed(page);
  await settle(page, 500);
  result.firstPaintLarge = await measureFirstPaint(page);
  await page.mouse.move(0, 0);
  result.scroll = await measureScroll(page);
  result.edits = await measureEdits(page, run);
  result.months = await measureMonths(page);
  result.accounts = await measureAccounts(page);
  result.panel = await page.getByTestId('category-details-panel').count();
  await context.close();
  return result;
}

async function runAll() {
  const browser = await chromium.launch();
  const results = [];
  for (let run = 0; run < RUNS; run++) {
    for (const viewport of VIEWPORTS) {
      // Rotate the order so no build always runs first.
      const all = ['base', 'redesign', 'redesign-closed'];
      const order = all.map((_, i) => all[(i + run) % all.length]);
      for (const build of order) {
        try {
          const r = await oneRun(browser, build, viewport, run);
          results.push(r);
          console.log(
            `${build} ${viewport.join('x')} run ${run}: edit median ${median(r.edits.latencies).toFixed(0)}ms`,
          );
        } catch (error) {
          console.error(
            `${build} ${viewport.join('x')} run ${run} failed:`,
            error.message,
          );
          results.push({
            build,
            viewport: viewport.join('x'),
            run,
            error: error.message,
          });
        }
        writeFileSync(OUT, JSON.stringify(results, null, 1));
      }
    }
  }
  await browser.close();
}

function median(xs) {
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

function percentile(xs, q) {
  const s = [...xs].sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.floor(q * s.length))];
}

/** @type {Array<[string, (r: any) => number]>} */
const METRICS = [
  ['Demo created, page settled', r => r.demoCreate],
  ['First paint, demo: first row', r => r.firstPaintDemo.firstRow],
  [
    'First paint, demo: settled',
    r => Math.max(r.firstPaintDemo.firstRow, r.firstPaintDemo.settled),
  ],
  ['First paint, large: first row', r => r.firstPaintLarge.firstRow],
  [
    'First paint, large: settled',
    r => Math.max(r.firstPaintLarge.firstRow, r.firstPaintLarge.settled),
  ],
  [
    'Scroll: mean frame',
    r => r.scroll.intervals.reduce((a, b) => a + b) / r.scroll.intervals.length,
  ],
  ['Scroll: p95 frame', r => percentile(r.scroll.intervals, 0.95)],
  ['Scroll: longest frame', r => Math.max(...r.scroll.intervals)],
  [
    'Scroll: frames over 33 ms (of 359)',
    r => r.scroll.intervals.filter(i => i > 33.4).length,
  ],
  ['Assigned edit: median', r => median(r.edits.latencies)],
  ['Assigned edit: p90', r => percentile(r.edits.latencies, 0.9)],
  [
    'Assigned edit: 20 edits total',
    r => r.edits.latencies.reduce((a, b) => a + b),
  ],
  ['Month switch: label', r => median(r.months.map(m => m.label))],
  [
    'Month switch: settled',
    r => median(r.months.map(m => Math.max(m.label, m.settled))),
  ],
  ['Open register: first rows', r => r.accounts.first.rows],
  [
    'Open register: settled',
    r => Math.max(r.accounts.first.rows, r.accounts.first.settled),
  ],
  ['Open register again: rows', r => r.accounts.second.rows],
];

function summarize(results) {
  const ok = results.filter(r => !r.error);
  const failed = results.filter(r => r.error);
  const builds = ['base', 'redesign', 'redesign-closed'];
  for (const vp of [...new Set(ok.map(r => r.viewport))]) {
    console.log(`\n### ${vp}\n`);
    const counts = builds.map(
      b => ok.filter(r => r.viewport === vp && r.build === b).length,
    );
    console.log(
      `| Measure | base (n=${counts[0]}) | redesign (n=${counts[1]}) | change | redesign, panel closed (n=${counts[2]}) |`,
    );
    console.log('| --- | ---: | ---: | ---: | ---: |');
    for (const [label, f] of METRICS) {
      const cells = builds.map(b => {
        const xs = ok.filter(r => r.viewport === vp && r.build === b).map(f);
        return xs.length
          ? { m: median(xs), lo: Math.min(...xs), hi: Math.max(...xs) }
          : null;
      });
      const fmt = c => {
        if (!c) return '—';
        const d = label.includes('frames over')
          ? 0
          : label.includes('frame')
            ? 1
            : 0;
        return `${c.m.toFixed(d)} (${c.lo.toFixed(d)}–${c.hi.toFixed(d)})`;
      };
      const change =
        cells[0] && cells[1] && cells[0].m
          ? `${cells[1].m >= cells[0].m ? '+' : ''}${(((cells[1].m - cells[0].m) / cells[0].m) * 100).toFixed(0)}%`
          : '—';
      console.log(
        `| ${label} | ${fmt(cells[0])} | ${fmt(cells[1])} | ${change} | ${fmt(cells[2])} |`,
      );
    }
    const extra = ok.filter(r => r.viewport === vp);
    console.log(
      `\nPanel present: redesign ${[...new Set(extra.filter(r => r.build === 'redesign').map(r => r.panel))].join(', ')}, closed variant ${[...new Set(extra.filter(r => r.build === 'redesign-closed').map(r => r.panel))].join(', ')}; ` +
        `scroll range px: ${builds.map(b => [...new Set(extra.filter(r => r.build === b).map(r => r.scroll.range))].join('/')).join(' | ')}`,
    );
  }
  if (failed.length) console.log('\nFailed runs:', failed);
}

if (mode === 'summary') {
  summarize(
    JSON.parse(readFileSync(args[0] ?? 'data/redesign/perf.json', 'utf8')),
  );
} else {
  await runAll();
}
