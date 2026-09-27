const { chromium } = require('@playwright/test');
const path = require('path');
const fs = require('fs');
(async () => {
  const dir = path.resolve('docs/redesign/prototype');
  const out = path.join(dir, 'shots');
  fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch();
  const shots = [
    ['01-A-dark-wide-panel', 1440, 900, 'layout=a&theme=dark&panel=1'],
    ['02-B-light-wide-panel', 1440, 900, 'layout=b&theme=light&panel=1'],
    [
      '03-A-midnight-wide-trend',
      1440,
      900,
      'layout=a&theme=midnight&header=trend&panel=0',
    ],
    [
      '04-B-dark-wide-trend-panel',
      1440,
      900,
      'layout=b&theme=dark&header=trend&panel=1',
    ],
    ['05-A-light-1000-closed', 1000, 700, 'layout=a&theme=light&panel=0'],
    ['06-A-dark-1000-panel', 1000, 700, 'layout=a&theme=dark&panel=1'],
    ['07-B-light-1000-panel', 1000, 700, 'layout=b&theme=light&panel=1'],
    [
      '08-A-dark-wide-accounts-menu',
      1440,
      900,
      'layout=a&theme=dark&panel=0&menu=accounts',
    ],
    [
      '09-B-light-wide-more-menu',
      1440,
      900,
      'layout=b&theme=light&panel=0&menu=more',
    ],
    [
      '10-A-dark-wide-budget-menu',
      1440,
      900,
      'layout=a&theme=dark&panel=0&menu=budget',
    ],
    [
      '11-narrow-760-drawer',
      760,
      900,
      'layout=a&theme=dark&panel=0&menu=drawer',
    ],
    ['12-narrow-760-panel-overlay', 760, 900, 'layout=a&theme=light&panel=1'],
    [
      '13-A-dark-wide-privacy',
      1440,
      900,
      'layout=a&theme=dark&panel=1&privacy=1',
    ],
    ['14-account-dark-wide', 1440, 900, 'page=account&theme=dark'],
    [
      '15-account-light-wide-selected',
      1440,
      900,
      'page=account&theme=light&sel=1',
    ],
    [
      '16-account-midnight-1000-adding',
      1000,
      700,
      'page=account&theme=midnight&adding=1',
    ],
    ['17-account-light-1000', 1000, 700, 'page=account&theme=light'],
  ];
  for (const [name, w, h, q] of shots) {
    const p = await b.newPage({
      viewport: { width: w, height: h },
      deviceScaleFactor: 2,
    });
    const errs = [];
    p.on('pageerror', e => errs.push(e.message));
    await p.goto('file://' + dir + '/index.html?controls=0&' + q);
    await p.evaluate(() => document.fonts.ready);
    await p.waitForTimeout(150);
    const overflow = await p.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    );
    await p.screenshot({ path: `${out}/${name}.png` });
    console.log(
      name,
      errs.length ? 'ERR ' + errs : 'ok',
      overflow ? 'H-OVERFLOW' : '',
    );
    await p.close();
  }
  await b.close();
})();
