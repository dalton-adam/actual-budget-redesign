import { render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CustomThemeStyle } from './theme';

let mockTheme: string = 'light';
let mockInstalledLight: string | undefined = undefined;
let mockInstalledDark: string | undefined = undefined;
let mockCustomCssOverride: string | undefined = undefined;

// Vitest does not process CSS, so `?inline` imports are empty in tests.
// Substitute the contents of the real fallback layer.
vi.mock('@actual-app/components/themes/fallback.css?inline', async () => {
  const { readFileSync } = await import('node:fs');
  const { createRequire } = await import('node:module');
  const path = createRequire(`${process.cwd()}/`).resolve(
    '@actual-app/components/themes/fallback.css',
  );
  return { default: readFileSync(path, 'utf8') };
});

vi.mock('#hooks/useGlobalPref', () => ({
  useGlobalPref: (key: string) => {
    switch (key) {
      case 'theme':
        return [mockTheme, vi.fn()];
      case 'installedCustomLightTheme':
        return [mockInstalledLight, vi.fn()];
      case 'installedCustomDarkTheme':
        return [mockInstalledDark, vi.fn()];
      case 'customCssOverride':
        return [mockCustomCssOverride, vi.fn()];
      default:
        return [undefined, vi.fn()];
    }
  },
}));

function installedTheme(cssContent: string) {
  return JSON.stringify({
    id: 'test',
    name: 'Test',
    repo: 'owner/test',
    cssContent,
    baseTheme: 'light',
  });
}

function renderedCss() {
  const { container } = render(<CustomThemeStyle />);
  return container.querySelector('#custom-theme-active')?.textContent ?? null;
}

describe('CustomThemeStyle', () => {
  beforeEach(() => {
    mockTheme = 'light';
    mockInstalledLight = undefined;
    mockInstalledDark = undefined;
    mockCustomCssOverride = undefined;
  });

  it('renders nothing without a custom theme', () => {
    expect(renderedCss()).toBeNull();
  });

  it('puts the fallback roles before the custom theme', () => {
    mockInstalledLight = installedTheme(
      ':root { --color-pillPositiveText: #ff0000; }',
    );

    const css = renderedCss() ?? '';
    const fallbackAt = css.indexOf(
      '--color-pillPositiveText: var(--color-numberPositive)',
    );
    const customAt = css.indexOf('--color-pillPositiveText: #ff0000');

    expect(fallbackAt).toBeGreaterThan(-1);
    expect(customAt).toBeGreaterThan(fallbackAt);
  });

  it('leaves category accents to the base theme', () => {
    mockInstalledLight = installedTheme(':root { --color-pageText: #ff0000; }');

    expect(renderedCss()).not.toContain('--color-categoryAccent1');
  });

  it('scopes the fallback to the matching color scheme in auto mode', () => {
    mockTheme = 'auto';
    mockInstalledDark = installedTheme(':root { --color-pageText: #ff0000; }');

    const css = renderedCss() ?? '';

    expect(css).not.toContain('prefers-color-scheme: light');
    expect(css.indexOf('@media (prefers-color-scheme: dark)')).toBeLessThan(
      css.indexOf('--color-pillPositiveText'),
    );
  });

  it('does not add the fallback for a CSS override alone', () => {
    mockCustomCssOverride = ':root { --color-pageText: #ff0000; }';

    const css = renderedCss() ?? '';

    expect(css).toContain('--color-pageText: #ff0000');
    expect(css).not.toContain('--color-pillPositiveText');
  });
});
