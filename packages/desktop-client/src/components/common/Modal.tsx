import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type {
  ComponentPropsWithoutRef,
  ComponentPropsWithRef,
  CSSProperties,
  ReactNode,
} from 'react';
import {
  Dialog,
  Modal as ReactAriaModal,
  ModalOverlay as ReactAriaModalOverlay,
} from 'react-aria-components';
import { ErrorBoundary } from 'react-error-boundary';
import { useHotkeysContext } from 'react-hotkeys-hook';
import { useTranslation } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import { useResponsive } from '@actual-app/components/hooks/useResponsive';
import { AnimatedLoading } from '@actual-app/components/icons/AnimatedLoading';
import { SvgLogo } from '@actual-app/components/icons/logo';
import { SvgDelete } from '@actual-app/components/icons/v0';
import { Input } from '@actual-app/components/input';
import { styles } from '@actual-app/components/styles';
import { Text } from '@actual-app/components/text';
import { TextOneLine } from '@actual-app/components/text-one-line';
import { theme } from '@actual-app/components/theme';
import { tokens } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';
import { css } from '@emotion/css';
import { AutoTextSize } from 'auto-text-size';

import { FeatureErrorFallback } from '#components/FeatureErrorFallback';
import { useModalState } from '#hooks/useModalState';

export const MODAL_Z_INDEX = 3000;

type ModalProps = ComponentPropsWithRef<typeof ReactAriaModal> & {
  name: string;
  isLoading?: boolean;
  noAnimation?: boolean;
  style?: CSSProperties;
  onClose?: () => void;
  wrapperProps?: {
    style?: CSSProperties;
  };
  containerProps?: {
    style?: CSSProperties;
  };
};

export const Modal = ({
  name,
  isLoading = false,
  noAnimation = false,
  style,
  children,
  onClose,
  wrapperProps,
  containerProps,
  ...props
}: ModalProps) => {
  const { t } = useTranslation();
  const { isNarrowWidth } = useResponsive();
  const { enableScope, disableScope } = useHotkeysContext();

  // This deactivates any key handlers in the "app" scope
  useEffect(() => {
    enableScope(name);
    return () => disableScope(name);
  }, [enableScope, disableScope, name]);

  const { isHidden, isActive, onClose: closeModal } = useModalState();

  const handleOnClose = () => {
    closeModal();
    onClose?.();
  };

  return (
    <ErrorBoundary FallbackComponent={FeatureErrorFallback}>
      <ReactAriaModalOverlay
        data-testid={`${name}-modal`}
        isDismissable
        defaultOpen
        onOpenChange={isOpen => !isOpen && handleOnClose?.()}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: MODAL_Z_INDEX,
          fontSize: 14,
          // on mobile, we disable the blurred background for performance reasons
          ...(isNarrowWidth
            ? {
                backgroundColor: 'rgba(0, 0, 0, 0.4)',
              }
            : {
                // Redesign (design-decisions §10g): the scrim, no blur.
                backgroundColor: theme.scrim,
              }),
          ...style,
        }}
        {...props}
      >
        {/* A container for positioning the modal relative to the visual viewport */}
        <View
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: 'var(--visual-viewport-height)',
            overflowY: 'auto',
            ...wrapperProps?.style,
          }}
        >
          <ReactAriaModal>
            {modalProps => (
              <Dialog
                aria-label={t('Modal dialog')}
                className={css(styles.lightScrollbar)}
                style={{
                  outline: 'none', // remove focus outline
                }}
              >
                <ModalContentContainer
                  noAnimation={noAnimation}
                  isActive={isActive(name)}
                  {...containerProps}
                  style={{
                    flex: 1,
                    padding: 10,
                    willChange: 'opacity, transform',
                    maxWidth: '90vw',
                    minWidth: '90vw',
                    maxHeight: 'calc(var(--visual-viewport-height) * 0.9)',
                    minHeight: 0,
                    borderRadius: 6,
                    //border: '1px solid ' + theme.modalBorder,
                    color: theme.pageText,
                    backgroundColor: theme.modalBackground,
                    opacity: isHidden ? 0 : 1,
                    [`@media (min-width: ${tokens.breakpoint_small})`]: {
                      minWidth: tokens.breakpoint_small,
                    },
                    overflowY: 'auto',
                    ...styles.shadowLarge,
                    // Redesign (design-decisions §10g): a Surface card with
                    // the popover shadow. Mobile keeps the upstream frame.
                    ...(!isNarrowWidth && {
                      padding: '18px 22px 20px',
                      borderRadius: 18,
                      border: `1px solid ${theme.cardHairline}`,
                      backgroundColor: theme.cardBackground,
                      boxShadow: theme.popoverShadow,
                    }),
                    ...containerProps?.style,
                  }}
                >
                  <View style={{ paddingTop: 0, flex: 1, flexShrink: 0 }}>
                    <ErrorBoundary FallbackComponent={FeatureErrorFallback}>
                      {typeof children === 'function'
                        ? children(modalProps)
                        : children}
                    </ErrorBoundary>
                  </View>
                  {isLoading && (
                    <View
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: isNarrowWidth
                          ? theme.pageBackground
                          : theme.cardBackground,
                        borderRadius: isNarrowWidth ? undefined : 18,
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                      }}
                    >
                      <AnimatedLoading
                        style={{ width: 20, height: 20 }}
                        color={
                          isNarrowWidth ? theme.pageText : theme.pageTextSubdued
                        }
                      />
                    </View>
                  )}
                </ModalContentContainer>
              </Dialog>
            )}
          </ReactAriaModal>
        </View>
      </ReactAriaModalOverlay>
    </ErrorBoundary>
  );
};

type ModalContentContainerProps = {
  style?: CSSProperties;
  noAnimation?: boolean;
  isActive?: boolean;
  children: ReactNode;
};

const ModalContentContainer = ({
  style,
  noAnimation,
  isActive,
  children,
}: ModalContentContainerProps) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const mounted = useRef(false);
  const rotateFactor = useRef(Math.random() * 10 - 5);

  useLayoutEffect(() => {
    if (!contentRef.current) {
      return;
    }

    function setProps() {
      if (!contentRef.current) {
        return;
      }

      if (isActive) {
        contentRef.current.style.transform = 'none';
        contentRef.current.style.willChange = 'auto';
        contentRef.current.style.pointerEvents = 'auto';
      } else {
        contentRef.current.style.transform = `translateY(-40px) scale(.95) rotate(${rotateFactor.current}deg)`;
        contentRef.current.style.pointerEvents = 'none';
      }
    }

    if (!mounted.current) {
      if (noAnimation) {
        contentRef.current.style.opacity = '1';
        contentRef.current.style.transform = 'translateY(0px) scale(1)';

        setTimeout(() => {
          if (contentRef.current) {
            contentRef.current.style.transition =
              'opacity .1s, transform .1s cubic-bezier(.42, 0, .58, 1)';
          }
        }, 0);
      } else {
        contentRef.current.style.opacity = '0';
        contentRef.current.style.transform = 'translateY(10px) scale(1)';

        setTimeout(() => {
          if (contentRef.current) {
            mounted.current = true;
            contentRef.current.style.transition =
              'opacity .1s, transform .1s cubic-bezier(.42, 0, .58, 1)';
            contentRef.current.style.opacity = '1';
            setProps();
          }
        }, 0);
      }
    } else {
      setProps();
    }
  }, [noAnimation, isActive]);

  return (
    <View
      innerRef={contentRef}
      style={{
        ...style,
        ...(noAnimation && !isActive && { display: 'none' }),
      }}
    >
      {children}
    </View>
  );
};

type ModalButtonsProps = {
  style?: CSSProperties;
  leftContent?: ReactNode;
  focusButton?: boolean;
  children: ReactNode;
};

export const ModalButtons = ({
  style,
  leftContent,
  focusButton = false,
  children,
}: ModalButtonsProps) => {
  const { isNarrowWidth } = useResponsive();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (focusButton && containerRef.current) {
      const button = containerRef.current.querySelector<HTMLButtonElement>(
        'button:not([data-hidden])',
      );

      if (button) {
        button.focus();
      }
    }
  }, [focusButton]);

  return (
    <View
      innerRef={containerRef}
      style={{
        flexDirection: 'row',
        marginTop: isNarrowWidth ? 30 : 20,
        ...style,
      }}
    >
      {leftContent}
      <View style={{ flex: 1 }} />
      {children}
    </View>
  );
};

type ModalHeaderProps = {
  leftContent?: ReactNode;
  showLogo?: boolean;
  title?: ReactNode;
  rightContent?: ReactNode;
};

export function ModalHeader({
  leftContent,
  showLogo,
  title,
  rightContent,
}: ModalHeaderProps) {
  const { t } = useTranslation();
  const { isNarrowWidth } = useResponsive();

  if (!isNarrowWidth) {
    // Redesign (design-decisions §10g): one row with the title on the left
    // and the close button at the right.
    return (
      <h1
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          minHeight: 32,
          flex: 'none',
          margin: '0 0 12px',
          padding: 0,
        }}
      >
        {leftContent}
        <View style={{ flex: 1, minWidth: 0 }}>
          {showLogo && (
            <SvgLogo aria-label={t('Modal logo')} width={30} height={30} />
          )}
          {title &&
            (typeof title === 'string' || typeof title === 'number' ? (
              <ModalTitle title={`${title}`} />
            ) : (
              title
            ))}
        </View>
        {rightContent}
      </h1>
    );
  }

  return (
    <h1
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        height: 60,
        flex: 'none',
        display: 'flex',
        margin: 0,
        padding: 0,
      }}
    >
      <View
        style={{
          position: 'absolute',
          left: 0,
        }}
      >
        {leftContent}
      </View>

      {(title || showLogo) && (
        <View
          style={{
            textAlign: 'center',
            // We need to force a width for the text-overflow
            // ellipses to work because we are aligning center.
            width: 'calc(100% - 60px)',
          }}
        >
          {showLogo && (
            <SvgLogo
              aria-label={t('Modal logo')}
              width={30}
              height={30}
              style={{ justifyContent: 'center', alignSelf: 'center' }}
            />
          )}
          {title &&
            (typeof title === 'string' || typeof title === 'number' ? (
              <ModalTitle title={`${title}`} />
            ) : (
              title
            ))}
        </View>
      )}

      {rightContent && (
        <View
          style={{
            position: 'absolute',
            right: 0,
          }}
        >
          {rightContent}
        </View>
      )}
    </h1>
  );
}

type ModalTitleProps = {
  title: string;
  isEditable?: boolean;
  getStyle?: (isEditing: boolean) => CSSProperties;
  onEdit?: (isEditing: boolean) => void;
  onTitleUpdate?: (newName: string) => void;
  shrinkOnOverflow?: boolean;
};

export function ModalTitle({
  title,
  isEditable,
  getStyle,
  onTitleUpdate,
  shrinkOnOverflow = false,
}: ModalTitleProps) {
  const [isEditing, setIsEditing] = useState(false);

  const onTitleClick = () => {
    if (isEditable) {
      setIsEditing(true);
    }
  };

  const _onTitleUpdate = (newTitle: string) => {
    if (newTitle !== title) {
      onTitleUpdate?.(newTitle);
    }
    setIsEditing(false);
  };

  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (isEditing) {
      if (inputRef.current) {
        inputRef.current.scrollLeft = 0;
      }
    }
  }, [isEditing]);

  const { isNarrowWidth } = useResponsive();
  const style = getStyle?.(isEditing);
  // Redesign (design-decisions §10g): a left-aligned Headline on desktop.
  const titleStyle: CSSProperties = isNarrowWidth
    ? { fontSize: 25, fontWeight: 700, textAlign: 'center' }
    : {
        fontSize: 18,
        fontWeight: 700,
        letterSpacing: '-0.3px',
        lineHeight: 1.25,
        textAlign: 'left',
      };

  return isEditing ? (
    <Input
      ref={inputRef}
      style={{
        ...titleStyle,
        ...style,
      }}
      defaultValue={title}
      onUpdate={_onTitleUpdate}
      onEnter={(value, e) => {
        e.preventDefault();
        _onTitleUpdate?.(value);
      }}
    />
  ) : (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: isNarrowWidth ? 'center' : 'flex-start',
        alignItems: 'center',
      }}
    >
      {shrinkOnOverflow ? (
        <AutoTextSize
          as={Text}
          minFontSizePx={15}
          maxFontSizePx={isNarrowWidth ? 25 : 18}
          onClick={onTitleClick}
          style={{
            ...titleStyle,
            ...(isEditable && styles.underlinedText),
            ...style,
          }}
        >
          {title}
        </AutoTextSize>
      ) : (
        <TextOneLine
          onClick={onTitleClick}
          style={{
            ...titleStyle,
            ...(isEditable && styles.underlinedText),
            ...style,
          }}
        >
          {title}
        </TextOneLine>
      )}
    </View>
  );
}

type ModalCloseButtonProps = {
  onPress: ComponentPropsWithoutRef<typeof Button>['onPress'];
  style?: CSSProperties;
};

export function ModalCloseButton({ onPress, style }: ModalCloseButtonProps) {
  const { t } = useTranslation();
  const { isNarrowWidth } = useResponsive();
  return (
    <Button
      variant={isNarrowWidth ? 'bare' : 'control'}
      onPress={onPress}
      style={isNarrowWidth ? { padding: '10px 10px' } : undefined}
      className={
        isNarrowWidth
          ? undefined
          : // Redesign (design-decisions §10g): a 30px icon button with the
            // Control hover wash and focus ring, but no fill or border.
            css({
              width: 30,
              height: 30,
              padding: 0,
              backgroundColor: 'transparent',
              borderColor: 'transparent',
              color: theme.pageTextSubdued,
              '&[data-hovered]': {
                backgroundColor: theme.tableRowHover,
                color: theme.pageText,
              },
            })
      }
      aria-label={t('Close')}
    >
      <SvgDelete width={10} style={style} />
    </Button>
  );
}
