import type { ComponentProps } from 'react';

import type { Button } from '@actual-app/components/button';
import { useResponsive } from '@actual-app/components/hooks/useResponsive';

type ButtonVariant = NonNullable<ComponentProps<typeof Button>['variant']>;

/**
 * A report page control's button variant (APP-03b): Control on desktop; at
 * narrow widths, where mobile keeps the upstream look (plan §19.4), the
 * variant the control had before.
 */
export function useReportControlVariant(
  narrowVariant: ButtonVariant,
): ButtonVariant {
  const { isNarrowWidth } = useResponsive();
  return isNarrowWidth ? narrowVariant : 'control';
}
