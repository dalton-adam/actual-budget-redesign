import { Trans } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';
import { css } from '@emotion/css';

type AccountEmptyMessageProps = {
  onAdd: () => void;
};

export function AccountEmptyMessage({ onAdd }: AccountEmptyMessageProps) {
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        padding: '64px 24px 72px',
        textAlign: 'center',
      }}
    >
      <Text
        className={css({
          maxWidth: 420,
          fontSize: 13.5,
          lineHeight: 1.5,
          color: theme.pageTextSecondary,
          '& strong': {
            display: 'block',
            marginBottom: 6,
            fontSize: 16,
            fontWeight: 600,
            color: theme.pageText,
          },
        })}
      >
        <Trans>
          <strong>Let's add your first account.</strong> Accounts hold your
          transactions, like everyday spending, savings, credit cards, or cash.
          You can connect to your bank to import transactions automatically, or
          add them yourself.
        </Trans>
      </Text>

      <Button
        variant="primary"
        style={{ marginTop: 18 }}
        autoFocus
        onPress={onAdd}
      >
        <Trans>Add account</Trans>
      </Button>

      <View
        style={{
          marginTop: 14,
          fontSize: 12,
          color: theme.pageTextSecondary,
        }}
      >
        <Trans>You can add more accounts at any time from the sidebar.</Trans>
      </View>
    </View>
  );
}
