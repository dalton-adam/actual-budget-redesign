import React from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import { useResponsive } from '@actual-app/components/hooks/useResponsive';
import { SvgArrowDown } from '@actual-app/components/icons/v1';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';
import { css } from '@emotion/css';

import { Information } from '#components/alerts';
import {
  dialogButtonStyle,
  dialogNoteIconStyle,
  dialogNoteStyle,
  dialogPrimaryButtonStyle,
} from '#components/common/dialogStyles';
import { Modal, ModalButtons, ModalHeader } from '#components/common/Modal';
import { usePayees } from '#hooks/usePayees';
import type { Modal as ModalType } from '#modals/modalsSlice';

const mergePayeeStyle = {
  padding: 10,
  border: 'solid',
  borderWidth: 1,
  borderRadius: 6,
  borderColor: theme.tableBorder,
  backgroundColor: theme.tableBackground,
};

const targetPayeeStyle = {
  ...mergePayeeStyle,
  backgroundColor: theme.tableRowBackgroundHighlight,
};

// The desktop look (design-decisions §10k): the merged payees as one
// hairline list, the target on the selection tint.
const mergeListStyle = {
  border: `1px solid ${theme.cardHairline}`,
  borderRadius: 12,
  overflow: 'hidden',
};

const mergeListRowStyle = {
  minHeight: 40,
  padding: '0 14px',
  justifyContent: 'center',
  fontSize: 13.5,
  borderTop: `1px solid ${theme.cardHairline}`,
};

const targetCardStyle = {
  minHeight: 40,
  padding: '0 14px',
  justifyContent: 'center',
  borderRadius: 12,
  border: `1px solid ${theme.selectionBorder}`,
  backgroundColor: theme.selectionBackground,
};

type ConfirmPayeesMergeModalProps = Extract<
  ModalType,
  { name: 'confirm-payees-merge' }
>['options'];

export function ConfirmPayeesMergeModal({
  payeeIds,
  targetPayeeId,
  onConfirm,
}: ConfirmPayeesMergeModalProps) {
  const { t } = useTranslation();
  const { isNarrowWidth } = useResponsive();
  const { data: allPayees = [] } = usePayees();

  const mergePayees = allPayees.filter(p => payeeIds.includes(p.id));

  const targetPayee = allPayees.find(p => p.id === targetPayeeId);

  if (!targetPayee || mergePayees.length === 0) {
    return null;
  }

  const isCard = !isNarrowWidth;

  return (
    <Modal name="confirm-payees-merge">
      {({ state }) => (
        <>
          <ModalHeader title={t('Confirm Merge')} />

          <View style={{ maxWidth: 500, marginTop: isCard ? 4 : 20 }}>
            <View
              style={{
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: isCard ? 8 : 20,
              }}
            >
              <View
                style={
                  isCard
                    ? { width: '100%', ...mergeListStyle }
                    : { width: '100%', flexDirection: 'column', gap: 10 }
                }
              >
                {mergePayees.map((payee, i) => (
                  <View
                    style={
                      isCard
                        ? {
                            ...mergeListRowStyle,
                            ...(i === 0 && { borderTopWidth: 0 }),
                          }
                        : mergePayeeStyle
                    }
                    key={payee.id}
                  >
                    <Text>{payee.name}</Text>
                  </View>
                ))}
              </View>
              <SvgArrowDown
                width={isCard ? 18 : 20}
                height={isCard ? 18 : 20}
                style={isCard ? { color: theme.pageTextFaint } : undefined}
              />
              <View style={{ width: '100%' }}>
                <View style={isCard ? targetCardStyle : targetPayeeStyle}>
                  <Text
                    style={
                      isCard
                        ? { fontSize: 13.5, fontWeight: 600 }
                        : {
                            fontWeight: 700,
                            color: theme.tableRowBackgroundHighlightText,
                          }
                    }
                  >
                    {targetPayee.name}
                  </Text>
                </View>
              </View>
            </View>

            <Information
              style={
                isCard
                  ? { marginTop: 14, ...dialogNoteStyle }
                  : { marginTop: 20 }
              }
              iconStyle={isCard ? dialogNoteIconStyle : undefined}
            >
              <Trans>
                Merging will delete the selected payee(s) and transfer any
                associated rules to the target payee.
              </Trans>
            </Information>

            <ModalButtons style={{ marginTop: 20 }} focusButton>
              <Button
                variant={isCard ? 'control' : 'normal'}
                className={isCard ? css(dialogButtonStyle) : undefined}
                style={{ marginRight: isCard ? 8 : 10 }}
                onPress={() => state.close()}
              >
                <Trans>Cancel</Trans>
              </Button>
              <Button
                variant="primary"
                className={isCard ? css(dialogPrimaryButtonStyle) : undefined}
                style={isCard ? undefined : { marginRight: 10 }}
                onPress={async () => {
                  onConfirm?.();
                  state.close();
                }}
              >
                <Trans>Merge</Trans>
              </Button>
            </ModalButtons>
          </View>
        </>
      )}
    </Modal>
  );
}
