import { describe, expect, it } from 'vitest';

import {
  getEnvelopeColumnWidths,
  getEnvelopeMonthWidth,
} from './envelopeTable';

describe('getEnvelopeColumnWidths', () => {
  it('uses the wide widths from 1280px', () => {
    const widths = getEnvelopeColumnWidths(1440);
    expect(widths).toEqual({
      categoryMin: 160,
      assigned: 120,
      activity: 230,
      available: 120,
    });
    expect(getEnvelopeColumnWidths(1280)).toEqual(widths);
    expect(getEnvelopeMonthWidth(widths)).toBe(470);
  });

  it('narrows the columns between 900px and 1279px', () => {
    const widths = getEnvelopeColumnWidths(1000);
    expect(widths).toEqual({
      categoryMin: 140,
      assigned: 112,
      activity: 180,
      available: 104,
    });
    expect(getEnvelopeColumnWidths(900)).toEqual(widths);
    expect(getEnvelopeColumnWidths(1279)).toEqual(widths);
  });

  it('hides the Activity column below 900px', () => {
    const widths = getEnvelopeColumnWidths(899);
    expect(widths).toEqual({
      categoryMin: 120,
      assigned: 112,
      activity: 0,
      available: 104,
    });
    expect(getEnvelopeMonthWidth(widths)).toBe(
      widths.assigned + widths.available,
    );
  });
});
