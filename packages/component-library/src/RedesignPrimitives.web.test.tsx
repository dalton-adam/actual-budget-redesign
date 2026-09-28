import { act, fireEvent, render, screen } from '@testing-library/react';

import { Button } from './Button';
import { CategoryTile, getAccentColor, getTileLetter } from './CategoryTile';
import { clampProgress, ProgressBar } from './ProgressBar';
import { StatusPill, StatusPillButton } from './StatusPill';
import { SurfaceCard } from './SurfaceCard';
import { theme } from './theme';

describe('Button redesign variants', () => {
  it('renders control and tab variants as named buttons', () => {
    render(
      <>
        <Button variant="control" aria-label="Previous month">
          ‹
        </Button>
        <Button variant="tabSelected" aria-current="page">
          Budget
        </Button>
        <Button variant="tab">Reports</Button>
      </>,
    );

    expect(screen.getByRole('button', { name: 'Previous month' })).toBeTruthy();
    expect(
      screen
        .getByRole('button', { name: 'Budget' })
        .getAttribute('aria-current'),
    ).toBe('page');
    expect(
      screen.getByRole<HTMLButtonElement>('button', { name: 'Reports' })
        .disabled,
    ).toBe(false);
  });

  it('exposes the disabled state and ignores presses', async () => {
    const onPress = vi.fn();
    render(
      <Button variant="control" isDisabled onPress={onPress}>
        Today
      </Button>,
    );

    const button = screen.getByRole<HTMLButtonElement>('button', {
      name: 'Today',
    });
    expect(button.disabled).toBe(true);
    fireEvent.click(button);
    expect(onPress).not.toHaveBeenCalled();
  });

  it('marks keyboard focus for the focus ring', () => {
    render(<Button variant="control">Today</Button>);
    const button = screen.getByRole('button', { name: 'Today' });

    fireEvent.keyDown(document.body, { key: 'Tab' });
    act(() => button.focus());
    expect(button.getAttribute('data-focus-visible')).toBe('true');
  });
});

describe('StatusPill', () => {
  it('renders static content without a role', () => {
    render(<StatusPill tone="positive">$110.00</StatusPill>);

    expect(screen.getByText('$110.00').tagName).toBe('SPAN');
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('gives the interactive pill the full sentence as its name', () => {
    const onPress = vi.fn();
    render(
      <StatusPillButton
        tone="warning"
        aria-label="Available $110. Underfunded by $30."
        onPress={onPress}
      >
        $110.00
      </StatusPillButton>,
    );

    const pill = screen.getByRole('button', {
      name: 'Available $110. Underfunded by $30.',
    });
    fireEvent.click(pill);
    expect(onPress).toHaveBeenCalledTimes(1);

    act(() => pill.focus());
    fireEvent.keyDown(pill, { key: 'Enter' });
    fireEvent.keyUp(pill, { key: 'Enter' });
    expect(onPress).toHaveBeenCalledTimes(2);
  });
});

describe('ProgressBar', () => {
  it.each([
    [0.5, 0.5],
    [0, 0],
    [1, 1],
    [1.4, 1],
    [-0.2, 0],
    [Number.NaN, 0],
    [Number.POSITIVE_INFINITY, 0],
  ])('clamps %s to %s', (value, expected) => {
    expect(clampProgress(value)).toBe(expected);
  });

  it('is decorative without a label', () => {
    const { container } = render(
      <ProgressBar value={0.4} color={theme.categoryAccent1} />,
    );

    expect(screen.queryByRole('progressbar')).toBeNull();
    expect(container.firstElementChild?.getAttribute('aria-hidden')).toBe(
      'true',
    );
    expect(screen.getByTestId('progress-fill').style.width).toBe('40%');
  });

  it('exposes a named progressbar when labelled', () => {
    render(
      <ProgressBar
        value={2}
        color={theme.pillNegativeText}
        aria-label="Groceries activity"
      />,
    );

    const bar = screen.getByRole('progressbar', { name: 'Groceries activity' });
    expect(bar.getAttribute('aria-valuenow')).toBe('100');
    expect(screen.getByTestId('progress-fill').style.width).toBe('100%');
  });
});

describe('CategoryTile', () => {
  it.each([
    ['groceries', 'G'],
    ['  rent', 'R'],
    ['🏠 Home', '🏠'],
    ['👨‍👩‍👧 Family', '👨‍👩‍👧'],
    ['éclair fund', 'É'],
    ['', ''],
  ])('uses the first grapheme of %j', (name, letter) => {
    expect(getTileLetter(name)).toBe(letter);
  });

  it('maps accent indexes to theme roles and falls back to neutral', () => {
    expect(getAccentColor(1)).toBe(theme.categoryAccent1);
    expect(getAccentColor(10)).toBe(theme.categoryAccent10);
    expect(getAccentColor(undefined)).toBe(theme.pageTextSecondary);
    expect(getAccentColor(0)).toBe(theme.pageTextSecondary);
    expect(getAccentColor(11)).toBe(theme.pageTextSecondary);
    expect(getAccentColor(2.5)).toBe(theme.pageTextSecondary);
  });

  it('is hidden from assistive technology', () => {
    const { container } = render(
      <CategoryTile name="Groceries" accentIndex={3} />,
    );

    expect(container.firstElementChild?.getAttribute('aria-hidden')).toBe(
      'true',
    );
    expect(container.textContent).toBe('G');
  });
});

describe('SurfaceCard', () => {
  it('renders its children and passes props through', () => {
    render(
      <SurfaceCard role="region" aria-label="Assigned">
        $4,200.00
      </SurfaceCard>,
    );

    expect(screen.getByRole('region', { name: 'Assigned' }).textContent).toBe(
      '$4,200.00',
    );
  });
});
