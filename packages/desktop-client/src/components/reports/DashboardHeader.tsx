import { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import { SvgPencil1 } from '@actual-app/components/icons/v2';
import { InitialFocus } from '@actual-app/components/initial-focus';
import { Input } from '@actual-app/components/input';
import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';
import type { DashboardPageEntity } from '@actual-app/core/types/models';

import { useRenameDashboardPageMutation } from '#reports/mutations';

type DashboardHeaderProps = {
  dashboard: DashboardPageEntity;
};

export function DashboardHeader({ dashboard }: DashboardHeaderProps) {
  const { t } = useTranslation();
  const [editingName, setEditingName] = useState(false);

  const renameDashboardPageMutation = useRenameDashboardPageMutation();

  const handleSaveName = async (newName: string) => {
    const trimmedName = newName.trim();
    if (!trimmedName || trimmedName === dashboard.name) {
      setEditingName(false);
      return;
    }

    renameDashboardPageMutation.mutate(
      { id: dashboard.id, name: trimmedName },
      {
        onSuccess: () => {
          setEditingName(false);
        },
      },
    );
  };

  // "Reports" eyebrow over the dashboard name at Display size (APP-03).
  const titleStyle = {
    fontSize: 28,
    fontWeight: 700,
    letterSpacing: -0.4,
    lineHeight: 1.2,
  } as const;

  return (
    <View
      style={{
        marginLeft: 20,
        flexGrow: 1,
        flexShrink: 1,
        flexBasis: 'auto',
        minWidth: 0,
      }}
    >
      <View style={{ fontSize: 13, color: theme.pageTextSecondary }}>
        <Trans>Reports</Trans>
      </View>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          whiteSpace: 'nowrap',
          gap: 3,
          minWidth: 0,
          '& .hover-visible': {
            opacity: 0,
          },
          '&:hover .hover-visible, & .hover-visible[data-focus-visible]': {
            opacity: 1,
          },
          '@media (prefers-reduced-motion: no-preference)': {
            '& .hover-visible': { transition: 'opacity .15s' },
          },
        }}
      >
        {editingName ? (
          <InitialFocus>
            <Input
              defaultValue={dashboard.name}
              onEnter={handleSaveName}
              onUpdate={handleSaveName}
              onEscape={() => setEditingName(false)}
              style={{
                ...titleStyle,
                marginTop: -3,
                marginBottom: -4,
                paddingTop: 2,
                paddingBottom: 2,
              }}
            />
          </InitialFocus>
        ) : (
          <>
            <View
              style={{
                ...titleStyle,
                marginRight: 5,
                flexGrow: 0,
                flexShrink: 1,
                flexBasis: 'auto',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                minWidth: 0,
              }}
            >
              {dashboard.name}
            </View>
            <Button
              variant="bare"
              aria-label={t('Rename dashboard')}
              className="hover-visible"
              style={{
                marginRight: 5,
              }}
              onPress={() => setEditingName(true)}
            >
              <SvgPencil1
                style={{
                  width: 13,
                  height: 13,
                  flexGrow: 0,
                  flexShrink: 0,
                  flexBasis: 'auto',
                  color: theme.pageTextSecondary,
                }}
              />
            </Button>
          </>
        )}
      </View>
    </View>
  );
}
