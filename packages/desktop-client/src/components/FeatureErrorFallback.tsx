import React, { useEffect } from 'react';
import type { FallbackProps } from 'react-error-boundary';
import { Trans } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import { useResponsive } from '@actual-app/components/hooks/useResponsive';
import { styles } from '@actual-app/components/styles';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';
import { css } from '@emotion/css';

export function FeatureErrorFallback({
  error,
  resetErrorBoundary,
}: FallbackProps) {
  const { isNarrowWidth } = useResponsive();

  useEffect(() => {
    console.error(error);
  }, [error]);

  const message = error instanceof Error ? error.message : undefined;

  if (!isNarrowWidth) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20,
          textAlign: 'center',
        }}
      >
        <View
          aria-hidden="true"
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 14,
            backgroundColor: theme.pillNegativeBackground,
            color: theme.pillNegativeText,
            fontSize: 18,
            fontWeight: 700,
          }}
        >
          !
        </View>
        <Text
          style={{
            fontSize: 15,
            fontWeight: 600,
            lineHeight: 1.35,
            color: theme.pageText,
          }}
        >
          <Trans>Something went wrong loading this section.</Trans>
        </Text>
        {message && (
          <Text
            style={{
              marginTop: 12,
              padding: '10px 12px',
              maxWidth: 520,
              borderRadius: 8,
              backgroundColor: theme.cardInset,
              color: theme.pageTextSecondary,
              fontFamily: 'monospace',
              fontSize: 12,
              lineHeight: 1.45,
              textAlign: 'left',
              whiteSpace: 'pre-wrap',
              userSelect: 'text',
            }}
          >
            {message}
          </Text>
        )}
        <Button
          variant="control"
          onPress={resetErrorBoundary}
          className={css({
            marginTop: 18,
            padding: '0 12px',
            fontWeight: 600,
          })}
        >
          <Trans>Try again</Trans>
        </Button>
      </View>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
      }}
    >
      <Text style={{ ...styles.mediumText, color: theme.errorText }}>
        <Trans>Something went wrong loading this section.</Trans>
      </Text>
      {message && (
        <Text
          style={{
            ...styles.smallText,
            fontFamily: 'monospace',
            color: theme.errorText,
            marginTop: 10,
            maxWidth: 600,
            textAlign: 'center',
            userSelect: 'text',
          }}
        >
          {message}
        </Text>
      )}
      <Button onPress={resetErrorBoundary} style={{ marginTop: 15 }}>
        <Trans>Try again</Trans>
      </Button>
    </View>
  );
}
