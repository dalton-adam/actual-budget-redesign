import React from 'react';
import { animated, useTransition } from 'react-spring';

import { Block } from '@actual-app/components/block';
import { useResponsive } from '@actual-app/components/hooks/useResponsive';
import { AnimatedLoading } from '@actual-app/components/icons/AnimatedLoading';
import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';
import { css } from '@emotion/css';

import { useSelector } from '#redux';

import { Background } from './Background';

type AppBackgroundProps = {
  isLoading?: boolean;
};

export function AppBackground({ isLoading }: AppBackgroundProps) {
  const { isNarrowWidth } = useResponsive();
  const loadingText = useSelector(state => state.app.loadingText);
  const showLoading = isLoading || loadingText !== null;
  const transitions = useTransition(loadingText, {
    from: { opacity: 0, transform: 'translateY(-100px)' },
    enter: { opacity: 1, transform: 'translateY(0)' },
    leave: { opacity: 0, transform: 'translateY(100px)' },
  });

  return (
    <>
      <Background />

      {showLoading &&
        transitions((style, item) => (
          <animated.div key={item} style={style}>
            <View
              className={css({
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                padding: 50,
                paddingTop: 200,
                color: theme.pageText,
                alignItems: 'center',
              })}
            >
              <Block
                style={
                  isNarrowWidth
                    ? { marginBottom: 20, fontSize: 18 }
                    : {
                        marginBottom: 12,
                        fontSize: 13.5,
                        fontWeight: 500,
                        color: theme.pageTextSecondary,
                      }
                }
              >
                {loadingText}
              </Block>
              <AnimatedLoading
                width={isNarrowWidth ? 25 : 20}
                color={isNarrowWidth ? theme.pageText : theme.pageTextSecondary}
              />
            </View>
          </animated.div>
        ))}
    </>
  );
}
