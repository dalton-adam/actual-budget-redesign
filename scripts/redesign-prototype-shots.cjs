// Screenshots of the static redesign prototype (docs/redesign/prototype).
// Usage: node scripts/redesign-prototype-shots.cjs [--design-01 | --app-03 | --app-03c | --app-03d | --app-04 |
//   --app-05a]
// Default: the DESIGN-02 set (18+). --design-01 regenerates 01-17 from the
// current prototype with the fixture and row height they were taken with.
// --app-03 takes the Reports proposal (51+); --app-03c the custom report,
// Calendar and Formula proposal (59+); --app-03d Monte Carlo (67+);
// --app-04 Schedules (73+); --app-05a Payees (80+).
const { chromium } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

const W = 1440,
  H = 900,
  w = 1000,
  h = 700;

const design01 = [
  ['01-A-dark-wide-panel', W, H, 'layout=a&theme=dark&panel=1'],
  ['02-B-light-wide-panel', W, H, 'layout=b&theme=light&panel=1'],
  [
    '03-A-midnight-wide-trend',
    W,
    H,
    'layout=a&theme=midnight&header=trend&panel=0',
  ],
  [
    '04-B-dark-wide-trend-panel',
    W,
    H,
    'layout=b&theme=dark&header=trend&panel=1',
  ],
  ['05-A-light-1000-closed', w, h, 'layout=a&theme=light&panel=0'],
  ['06-A-dark-1000-panel', w, h, 'layout=a&theme=dark&panel=1'],
  ['07-B-light-1000-panel', w, h, 'layout=b&theme=light&panel=1'],
  [
    '08-A-dark-wide-accounts-menu',
    W,
    H,
    'layout=a&theme=dark&panel=0&menu=accounts',
  ],
  ['09-B-light-wide-more-menu', W, H, 'layout=b&theme=light&panel=0&menu=more'],
  [
    '10-A-dark-wide-budget-menu',
    W,
    H,
    'layout=a&theme=dark&panel=0&menu=budget',
  ],
  ['11-narrow-760-drawer', 760, H, 'layout=a&theme=dark&panel=0&menu=drawer'],
  ['12-narrow-760-panel-overlay', 760, H, 'layout=a&theme=light&panel=1'],
  ['13-A-dark-wide-privacy', W, H, 'layout=a&theme=dark&panel=1&privacy=1'],
  ['14-account-dark-wide', W, H, 'page=account&theme=dark'],
  ['15-account-light-wide-selected', W, H, 'page=account&theme=light&sel=1'],
  [
    '16-account-midnight-1000-adding',
    w,
    h,
    'page=account&theme=midnight&adding=1',
  ],
  ['17-account-light-1000', w, h, 'page=account&theme=light'],
].map(([n, sw, sh, q]) => [n, sw, sh, 'data=basic&density=50&' + q]);

const design02 = [
  // Row states and the details panel
  ['18-states-dark-wide', W, H, 'theme=dark'],
  [
    '19-states-light-1000-hover-edit',
    w,
    h,
    'theme=light&hover=c-trans&edit=c-subs:0',
  ],
  ['20-overspent-midnight-wide', W, H, 'theme=midnight&cat=c-dine'],
  ['21-rollover-light-wide', W, H, 'theme=light&cat=c-med'],
  ['22-long-goal-dark-1000', w, h, 'theme=dark&cat=c-emerg'],
  ['23-past-month-light-wide', W, H, 'theme=light&when=past&cat=c-dine'],
  ['24-future-month-dark-wide', W, H, 'theme=dark&when=future&cat=c-util'],
  // Ready to Assign states and breakdown
  ['25-rta-zero-light-wide', W, H, 'theme=light&rta=zero&panel=0'],
  [
    '26-rta-negative-dark-wide-breakdown',
    W,
    H,
    'theme=dark&rta=neg&panel=0&menu=breakdown&for=0',
  ],
  [
    '27-rta-positive-midnight-1000-breakdown',
    w,
    h,
    'theme=midnight&menu=breakdown&for=0',
  ],
  // Density at the original window size, 34 categories
  ['28-density-50-light-1000', w, h, 'theme=light&data=many&density=50'],
  ['29-density-44-light-1000', w, h, 'theme=light&data=many&density=44'],
  ['30-density-38-light-1000', w, h, 'theme=light&data=many&density=38'],
  [
    '31-density-38-dark-1000-compact',
    w,
    h,
    'theme=dark&data=many&density=38&compact=1',
  ],
  // Narrow fallback and long labels
  [
    '35-narrow-760-light-long-labels',
    760,
    H,
    'theme=light&panel=0&collapsed=g1,g2',
  ],
  ['36-narrow-760-dark-panel', 760, H, 'theme=dark&cat=c-kids'],
  // Custom theme fallbacks
  ['37-custom-theme-wide', W, H, 'theme=custom&cat=c-util'],
  ['38-custom-theme-account', W, H, 'theme=custom&page=account&recon=diff'],
  // Menus: every item exists in the app today
  ['39-month-menu-dark-wide', W, H, 'theme=dark&panel=0&menu=month&for=0'],
  ['40-column-menu-light-wide', W, H, 'theme=light&panel=0&menu=column'],
  [
    '41-category-menu-dark-wide',
    W,
    H,
    'theme=dark&menu=catmenu&for=c-util&hover=c-util',
  ],
  ['42-group-menu-midnight-wide', W, H, 'theme=midnight&menu=groupmenu&for=g2'],
  [
    '43-balance-menu-light-wide',
    W,
    H,
    'theme=light&menu=balance&for=c-med:0&cat=c-med',
  ],
  // Accounts: reconciliation, Activity link, pinned list
  [
    '44-reconcile-popover-light-wide',
    W,
    H,
    'theme=light&page=account&menu=recon',
  ],
  [
    '45-reconcile-difference-dark-wide',
    W,
    H,
    'theme=dark&page=account&recon=diff',
  ],
  [
    '46-reconcile-matched-midnight-1000',
    w,
    h,
    'theme=midnight&page=account&recon=done',
  ],
  [
    '47-activity-filter-light-wide',
    W,
    H,
    'theme=light&page=account&filter=c-groc:0',
  ],
  ['48-accounts-pane-collapsed-dark-wide', W, H, 'theme=dark&pane=collapsed'],
  [
    '49-accounts-pane-open-light-1000-account',
    w,
    h,
    'theme=light&pane=open&page=account',
  ],
  ['50-privacy-dark-wide', W, H, 'theme=dark&privacy=1&cat=c-dine'],
];

const app03 = [
  ['51-reports-dark-wide', W, H, 'page=reports&theme=dark&whover=nw'],
  ['52-reports-light-wide', W, H, 'page=reports&theme=light'],
  ['53-reports-midnight-1000', w, h, 'page=reports&theme=midnight'],
  ['54-reports-light-1000-editing', w, h, 'page=reports&theme=light&redit=1'],
  ['55-networth-dark-wide', W, H, 'page=reports&rview=networth&theme=dark'],
  ['56-networth-light-1000', w, h, 'page=reports&rview=networth&theme=light'],
  ['57-reports-custom-wide', W, H, 'page=reports&theme=custom'],
  ['58-reports-privacy-dark-wide', W, H, 'page=reports&theme=dark&privacy=1'],
];

const app03c = [
  ['59-custom-report-dark-wide', W, H, 'page=reports&rview=custom&theme=dark'],
  [
    '60-custom-report-light-1000',
    w,
    h,
    'page=reports&rview=custom&theme=light',
  ],
  [
    '61-custom-report-table-midnight-wide',
    W,
    H,
    'page=reports&rview=custom&theme=midnight&rgraph=table',
  ],
  ['62-calendar-dark-wide', W, H, 'page=reports&rview=calendar&theme=dark'],
  ['63-calendar-light-1000', w, h, 'page=reports&rview=calendar&theme=light'],
  ['64-formula-dark-wide', W, H, 'page=reports&rview=formula&theme=dark'],
  ['65-formula-light-1000', w, h, 'page=reports&rview=formula&theme=light'],
  [
    '66-app03c-custom-theme-wide',
    W,
    H,
    'page=reports&rview=custom&theme=custom',
  ],
];

const mc = 'page=reports&rview=montecarlo';
const app03d = [
  ['67-montecarlo-dark-wide', W, H, `${mc}&theme=dark`],
  ['68-montecarlo-light-1000', w, h, `${mc}&theme=light`],
  ['69-montecarlo-pots-midnight-wide', W, H, `${mc}&theme=midnight&mctab=pots`],
  ['70-montecarlo-runs-dark-wide', W, H, `${mc}&theme=dark&mcview=runs`],
  ['71-montecarlo-light-wide-full', W, H, `${mc}&theme=light`, true],
  ['72-montecarlo-custom-theme-wide', W, H, `${mc}&theme=custom`],
];

const sc = 'page=schedules';
const app04 = [
  ['73-schedules-dark-wide', W, H, `${sc}&theme=dark&shover=s3`],
  ['74-schedules-light-1000', w, h, `${sc}&theme=light`],
  [
    '75-schedules-midnight-wide-menu',
    W,
    H,
    `${sc}&theme=midnight&smenu=s2&scompleted=1`,
  ],
  ['76-schedules-custom-theme-wide', W, H, `${sc}&theme=custom`],
  ['77-schedule-edit-dark-wide', W, H, `${sc}&theme=dark&sdlg=s3&ssel=1`],
  ['78-schedule-add-light-1000', w, h, `${sc}&theme=light&sdlg=add`],
  ['79-schedules-empty-light-wide', W, H, `${sc}&theme=light&sempty=1`],
];

const py = 'page=payees';
const app05a = [
  ['80-payees-dark-wide', W, H, `${py}&theme=dark&phover=p4`],
  ['81-payees-light-1000', w, h, `${py}&theme=light&pane=collapsed`],
  [
    '82-payees-midnight-wide-selected',
    W,
    H,
    `${py}&theme=midnight&psel=1&pmenu=1`,
  ],
  ['83-payees-custom-theme-wide', W, H, `${py}&theme=custom&phover=p7`],
  ['84-payees-unused-light-wide', W, H, `${py}&theme=light&punused=1`],
  ['85-payees-row-menu-dark-1000', w, h, `${py}&theme=dark&prow=p6&phover=p6`],
  [
    '86-payees-no-match-dark-wide',
    W,
    H,
    `${py}&theme=dark&pfilter=asdf&pempty=1`,
  ],
];

(async () => {
  const dir = path.resolve('docs/redesign/prototype');
  const out = path.join(dir, 'shots');
  fs.mkdirSync(out, { recursive: true });
  const shots = process.argv.includes('--design-01')
    ? design01
    : process.argv.includes('--app-05a')
      ? app05a
      : process.argv.includes('--app-04')
        ? app04
        : process.argv.includes('--app-03d')
          ? app03d
          : process.argv.includes('--app-03c')
            ? app03c
            : process.argv.includes('--app-03')
              ? app03
              : design02;
  // PW_CHANNEL=msedge uses an installed browser instead of Playwright's.
  const b = await chromium.launch(
    process.env.PW_CHANNEL ? { channel: process.env.PW_CHANNEL } : {},
  );
  for (const [name, sw, sh, q, full] of shots) {
    const p = await b.newPage({
      viewport: { width: sw, height: sh },
      deviceScaleFactor: 2,
    });
    const errs = [];
    p.on('pageerror', e => errs.push(e.message));
    await p.goto('file://' + dir + '/index.html?controls=0&' + q);
    await p.evaluate(() => document.fonts.ready);
    await p.waitForTimeout(150);
    const info = await p.evaluate(() => {
      const wrap = document.querySelector('.ledger-wrap');
      const box = wrap && wrap.getBoundingClientRect();
      const rows = [...document.querySelectorAll('.crow:not(.irow)')];
      return {
        overflow: document.documentElement.scrollWidth > window.innerWidth,
        clipped: [...document.querySelectorAll('.cols')].filter(
          r => r.scrollWidth > r.clientWidth + 1,
        ).length,
        visible: box
          ? rows.filter(r => {
              const b = r.getBoundingClientRect();
              return b.top >= box.top && b.bottom <= box.bottom;
            }).length
          : null,
      };
    });
    if (full) {
      // Unclip the scrolling report so the whole page is captured.
      await p.evaluate(() => {
        for (const el of document.querySelectorAll(
          'html, body, .app, .page, .rmain',
        ))
          Object.assign(el.style, { height: 'auto', overflow: 'visible' });
      });
    }
    await p.screenshot({ path: `${out}/${name}.png`, fullPage: !!full });
    console.log(
      name,
      errs.length ? 'ERR ' + errs : 'ok',
      info.overflow ? 'H-OVERFLOW' : '',
      info.clipped ? `CLIPPED-ROWS:${info.clipped}` : '',
      info.visible == null ? '' : `categories fully visible: ${info.visible}`,
    );
    await p.close();
  }
  await b.close();
})().catch(err => {
  console.error(err);
  process.exitCode = 1;
});
