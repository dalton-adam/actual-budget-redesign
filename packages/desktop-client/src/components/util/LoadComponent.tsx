import { useEffect, useState } from 'react';
import type { ComponentType } from 'react';

import { Block } from '@actual-app/components/block';
import { useResponsive } from '@actual-app/components/hooks/useResponsive';
import { AnimatedLoading } from '@actual-app/components/icons/AnimatedLoading';
import { styles } from '@actual-app/components/styles';
import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';
import { LazyLoadFailedError } from '@actual-app/core/shared/errors';
import { retry as promiseRetry } from '@actual-app/core/shared/retry';

type ProplessComponent = ComponentType<Record<string, never>>;
type LoadComponentProps<K extends string> = {
  name: K;
  message?: string;
  importer: () => Promise<{ [key in K]: ProplessComponent }>;
};
export function LoadComponent<K extends string>(props: LoadComponentProps<K>) {
  // need to set `key` so the component is reloaded when the name changes
  // otherwise the old component will be rendered while the new one is being loaded
  return <LoadComponentInner key={props.name} {...props} />;
}

function LoadComponentInner<K extends string>({
  name,
  message,
  importer,
}: LoadComponentProps<K>) {
  const [Component, setComponent] = useState<ProplessComponent | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const { isNarrowWidth } = useResponsive();

  useEffect(() => {
    let isUnmounted = false;
    setError(null);
    setComponent(null);

    // Load the module; if it fails - retry with exponential backoff
    promiseRetry(
      retry =>
        importer()
          .then(module => {
            // Handle possibly being unmounted while retrying.
            if (!isUnmounted) {
              setComponent(() => module[name]);
            }
          })
          .catch(retry),
      {
        retries: 5,
      },
    ).catch(e => {
      if (!isUnmounted) {
        setError(e);
      }
    });

    return () => {
      isUnmounted = true;
    };
  }, [name, importer]);

  if (error) {
    throw new LazyLoadFailedError(name, error);
  }

  if (!Component) {
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
          width={isNarrowWidth ? 25 : 20}
          color={isNarrowWidth ? theme.pageTextDark : theme.pageTextSecondary}
        />
      </View>
    );
  }

  return <Component />;
}
