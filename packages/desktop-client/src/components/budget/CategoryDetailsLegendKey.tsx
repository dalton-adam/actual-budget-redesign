import React from 'react';
import type { ReactNode } from 'react';

type CategoryDetailsLegendKeyProps = {
  color: string;
  /** A short vertical tick (a marker line) instead of a swatch. */
  isTick?: boolean;
  children: ReactNode;
};

/** One entry in the pace chart's legend. */
export function CategoryDetailsLegendKey({
  color,
  isTick = false,
  children,
}: CategoryDetailsLegendKeyProps) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        whiteSpace: 'nowrap',
      }}
    >
      <i
        aria-hidden
        style={{
          display: 'inline-block',
          width: isTick ? 1 : 10,
          height: isTick ? 10 : 3,
          borderRadius: 2,
          backgroundColor: color,
        }}
      />
      {children}
    </span>
  );
}
