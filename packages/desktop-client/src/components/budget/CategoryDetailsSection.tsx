import React from 'react';
import type { ReactNode } from 'react';

import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';

type CategoryDetailsSectionProps = {
  title: ReactNode;
  /** Shown at the end of the title row, e.g. a count. */
  aside?: ReactNode;
  children: ReactNode;
};

/** A titled block in the details panel (notes, transactions). */
export function CategoryDetailsSection({
  title,
  aside,
  children,
}: CategoryDetailsSectionProps) {
  return (
    <section>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          gap: 8,
          marginBottom: 8,
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: 13,
            fontWeight: 600,
            color: theme.pageText,
          }}
        >
          {title}
        </h3>
        {aside && (
          <View style={{ fontSize: 12, color: theme.pageTextSecondary }}>
            {aside}
          </View>
        )}
      </View>
      <View>{children}</View>
    </section>
  );
}
