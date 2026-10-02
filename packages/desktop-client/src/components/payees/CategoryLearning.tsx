import React from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import { useResponsive } from '@actual-app/components/hooks/useResponsive';
import { Paragraph } from '@actual-app/components/paragraph';
import { theme } from '@actual-app/components/theme';
import { css } from '@emotion/css';

import {
  dialogButtonStyle,
  dialogPrimaryButtonStyle,
} from '#components/common/dialogStyles';
import { Link } from '#components/common/Link';
import {
  Modal,
  ModalButtons,
  ModalCloseButton,
  ModalHeader,
} from '#components/common/Modal';
import { useSyncedPref } from '#hooks/useSyncedPref';

export function CategoryLearning() {
  const { t } = useTranslation();
  const { isNarrowWidth } = useResponsive();
  const [learnCategories = 'true', setLearnCategories] =
    useSyncedPref('learn-categories');
  const isLearnCategoriesEnabled = String(learnCategories) === 'true';

  // Secondary body text, the bold term in Page Text, the link underlined and
  // the button at the right (design-decisions §10k). Narrow keeps upstream.
  const paragraphStyle = isNarrowWidth
    ? undefined
    : {
        fontSize: 13.5,
        color: theme.pageTextSecondary,
        '& strong': { color: theme.pageText },
        // External links set their colour inline, so this one needs
        // !important to take Page Text.
        '& a, & a:visited': {
          color: `${theme.pageText} !important`,
          textDecoration: 'underline',
          textUnderlineOffset: 2,
        },
      };

  const toggleButton = (
    <Button
      onPress={() => setLearnCategories(String(!isLearnCategoriesEnabled))}
      variant={
        isLearnCategoriesEnabled
          ? isNarrowWidth
            ? 'normal'
            : 'control'
          : 'primary'
      }
      className={
        isNarrowWidth
          ? undefined
          : css(
              isLearnCategoriesEnabled
                ? dialogButtonStyle
                : dialogPrimaryButtonStyle,
            )
      }
    >
      {isLearnCategoriesEnabled ? (
        <Trans>Disable category learning</Trans>
      ) : (
        <Trans>Enable category learning</Trans>
      )}
    </Button>
  );

  return (
    <Modal
      name="payee-category-learning"
      containerProps={{ style: { width: 600 } }}
    >
      {({ state }) => (
        <>
          <ModalHeader
            title={t('Category Learning')}
            rightContent={<ModalCloseButton onPress={() => state.close()} />}
          />
          <Paragraph style={paragraphStyle}>
            <Trans>
              <strong>Category Learning</strong> will automatically determine
              the best category for a transaction and create a rule that sets
              the category for the payee.{' '}
              <Link
                variant="external"
                to="https://actualbudget.org/docs/budgeting/rules/#automatic-rules"
                linkColor="purple"
              >
                Learn more
              </Link>
            </Trans>
          </Paragraph>
          <Paragraph style={paragraphStyle}>
            <Trans>
              Disabling Category Learning will not delete any existing rules but
              will prevent new rules from being created automatically on a
              global level.
            </Trans>
          </Paragraph>
          {isNarrowWidth ? (
            toggleButton
          ) : (
            <ModalButtons style={{ marginTop: 18 }}>
              {toggleButton}
            </ModalButtons>
          )}
        </>
      )}
    </Modal>
  );
}
