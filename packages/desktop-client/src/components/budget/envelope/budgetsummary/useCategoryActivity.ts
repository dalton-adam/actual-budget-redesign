import { useEffect, useState } from 'react';

import * as monthUtils from '@actual-app/core/shared/months';

import { useSpreadsheet } from '#hooks/useSpreadsheet';
import { envelopeBudget } from '#spreadsheet/bindings';

/**
 * Each category's existing envelope activity (`sum-amount`) for a month,
 * read from the same spreadsheet cells the budget table shows. Categories
 * whose value has not loaded yet are left out.
 */
export function useCategoryActivity(
  month: string,
  categoryIds: string[],
): Array<{ id: string; activity: number }> {
  const spreadsheet = useSpreadsheet();
  const [values, setValues] = useState<{
    sheetName: string;
    byId: Record<string, number>;
  }>({ sheetName: '', byId: {} });
  const sheetName = monthUtils.sheetForMonth(month);
  const idsKey = categoryIds.join(',');

  useEffect(() => {
    let isMounted = true;
    const ids = idsKey ? idsKey.split(',') : [];
    const unbinds = ids.map(id =>
      spreadsheet.bind(
        sheetName,
        { name: envelopeBudget.catSumAmount(id) },
        node => {
          if (!isMounted) {
            return;
          }
          const activity = typeof node.value === 'number' ? node.value : 0;
          setValues(prev =>
            prev.sheetName === sheetName && prev.byId[id] === activity
              ? prev
              : {
                  sheetName,
                  byId: {
                    ...(prev.sheetName === sheetName ? prev.byId : {}),
                    [id]: activity,
                  },
                },
          );
        },
      ),
    );

    return () => {
      isMounted = false;
      unbinds.forEach(unbind => unbind());
    };
  }, [spreadsheet, sheetName, idsKey]);

  const byId = values.sheetName === sheetName ? values.byId : {};
  return categoryIds
    .filter(id => id in byId)
    .map(id => ({ id, activity: byId[id] }));
}
