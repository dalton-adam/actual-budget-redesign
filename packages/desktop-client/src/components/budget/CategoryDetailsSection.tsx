import React from 'react';
import type { ReactNode } from 'react';

import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';

type CategoryDetailsSectionProps = {
  title: ReactNode;
  children: ReactNode;
};

/** A titled block in the details panel (notes, transactions). */
export function CategoryDetailsSection({
  title,
  children,
}: CategoryDetailsSectionProps) {
  return (
    <section>
      <h3
        style={{
          margin: '0 0 8px',
          fontSize: 13,
          fontWeight: 600,
          color: theme.pageText,
        }}
      >
        {title}
      </h3>
      <View>{children}</View>
    </section>
  );
}
