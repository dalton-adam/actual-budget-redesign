import React from 'react';

import { Block } from '@actual-app/components/block';
import { useResponsive } from '@actual-app/components/hooks/useResponsive';
import { AnimatedLoading } from '@actual-app/components/icons/AnimatedLoading';
import { styles } from '@actual-app/components/styles';
import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';

type LoadingIndicatorProps = {
  message?: string;
};

export const LoadingIndicator = ({ message }: LoadingIndicatorProps) => {
  const { isNarrowWidth } = useResponsive();
  return (
    <View
      style={{
        flex: 1,
        gap: isNarrowWidth ? 20 : 12,
        justifyContent: 'center',
        alignItems: 'center',
        ...styles.delayedFadeIn,
      }}
    >
      {message && (
        <Block
          style={
            isNarrowWidth
              ? { marginBottom: 20, fontSize: 18 }
              : {
                  fontSize: 13.5,
                  fontWeight: 500,
                  color: theme.pageTextSecondary,
                }
          }
        >
          {message}
        </Block>
      )}
      <AnimatedLoading
        style={
          isNarrowWidth
            ? { width: 25, height: 25, color: theme.pageTextDark }
            : { width: 20, height: 20, color: theme.pageTextSecondary }
        }
      />
    </View>
  );
};
