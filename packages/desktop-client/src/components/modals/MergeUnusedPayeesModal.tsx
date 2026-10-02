import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import { useResponsive } from '@actual-app/components/hooks/useResponsive';
import { Paragraph } from '@actual-app/components/paragraph';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';
import { send } from '@actual-app/core/platform/client/connection';
import type { PayeeEntity } from '@actual-app/core/types/models';
import type { TransObjectLiteral } from '@actual-app/core/types/util';
import { css } from '@emotion/css';

import { Information } from '#components/alerts';
import {
  dialogButtonStyle,
  dialogNoteIconStyle,
  dialogNoteStyle,
  dialogPrimaryButtonStyle,
} from '#components/common/dialogStyles';
import { Modal, ModalButtons } from '#components/common/Modal';
import { usePayees } from '#hooks/usePayees';
import { replaceModal } from '#modals/modalsSlice';
import type { Modal as ModalType } from '#modals/modalsSlice';
import { useDispatch, useSelector } from '#redux';

const upstreamHighlightStyle = { color: theme.pageTextPositive };
/** Payee names in Page Text 600 on desktop (design-decisions §10k). */
const cardHighlightStyle = { color: theme.pageText, fontWeight: 600 };

type MergeUnusedPayeesModalProps = Extract<
  ModalType,
  { name: 'merge-unused-payees' }
>['options'];

export function MergeUnusedPayeesModal({
  payeeIds,
  targetPayeeId,
}: MergeUnusedPayeesModalProps) {
  const { t } = useTranslation();
  const { isNarrowWidth } = useResponsive();
  const isCard = !isNarrowWidth;
  const highlightStyle = isCard ? cardHighlightStyle : upstreamHighlightStyle;
  const { data: allPayees = [] } = usePayees();
  const modalStack = useSelector(state => state.modals.modalStack);
  const isEditingRule = !!modalStack.find(m => m.name === 'edit-rule');
  const dispatch = useDispatch();
  const [shouldCreateRule, setShouldCreateRule] = useState(true);
  const flashRef = useRef<HTMLUListElement | null>(null);

  useEffect(() => {
    // Flash the scrollbar
    if (flashRef.current) {
      const el = flashRef.current;
      const top = el.scrollTop;
      el.scrollTop = top + 1;
      el.scrollTop = top;
    }
  }, []);

  // We store the orphaned payees into state because when we merge it,
  // it will be deleted and this component will automatically
  // rerender. Is there a better pattern for live bindings?
  //
  // TODO: I think a custom `useSelector` hook that doesn't bind would
  // be nice
  const [payees] = useState<PayeeEntity[]>(() =>
    allPayees.filter(p => payeeIds.includes(p.id)),
  );

  const onMerge = useCallback(
    async (targetPayee: PayeeEntity) => {
      await send('payees-merge', {
        targetId: targetPayee.id,
        mergeIds: payees.map(payee => payee.id),
      });

      let ruleId;
      if (shouldCreateRule && !isEditingRule) {
        const id = await send('rule-add-payee-rename', {
          fromNames: payees.map(payee => payee.name),
          to: targetPayee.id,
        });
        ruleId = id;
      }

      return ruleId;
    },
    [shouldCreateRule, isEditingRule, payees],
  );

  const onMergeAndCreateRule = useCallback(
    async (targetPayee: PayeeEntity) => {
      const ruleId = await onMerge(targetPayee);

      if (ruleId) {
        const rule = await send('rule-get', { id: ruleId });
        if (!rule) {
          return;
        }

        dispatch(
          replaceModal({ modal: { name: 'edit-rule', options: { rule } } }),
        );
      }
    },
    [onMerge, dispatch],
  );

  const targetPayee = allPayees.find(p => p.id === targetPayeeId);
  if (!targetPayee) {
    return null;
  }

  return (
    <Modal name="merge-unused-payees">
      {({ state }) => (
        <View style={{ padding: isCard ? '4px 0 0' : 20, maxWidth: 500 }}>
          <View>
            <Paragraph
              style={
                isCard
                  ? { marginBottom: 12, fontSize: 14 }
                  : { marginBottom: 10, fontWeight: 500 }
              }
            >
              {payees.length === 1 ? (
                <Trans>
                  The payee{' '}
                  <Text style={highlightStyle}>
                    {{ previousPayee: payees[0].name } as TransObjectLiteral}
                  </Text>{' '}
                  is not used by transactions any more. Would you like to merge
                  it with{' '}
                  <Text style={highlightStyle}>
                    {{ payee: targetPayee.name } as TransObjectLiteral}
                  </Text>
                  ?
                </Trans>
              ) : (
                <>
                  <Trans>
                    The following payees are not used by transactions any more.
                    Would you like to merge them with{' '}
                    <Text style={highlightStyle}>
                      {{ payee: targetPayee.name } as TransObjectLiteral}
                    </Text>
                    ?
                  </Trans>
                  <ul
                    ref={flashRef}
                    style={{
                      margin: 0,
                      marginTop: 10,
                      maxHeight: 140,
                      overflow: 'auto',
                    }}
                  >
                    {payees.map(payee => (
                      <li key={payee.id}>
                        <Text style={highlightStyle}>{payee.name}</Text>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </Paragraph>

            <Information
              style={isCard ? dialogNoteStyle : undefined}
              iconStyle={isCard ? dialogNoteIconStyle : undefined}
            >
              <Trans>
                Merging will remove the payee and transfer any existing rules to
                the new payee.
              </Trans>
              {!isEditingRule && (
                <>
                  {' '}
                  <Trans>
                    If checked below, a rule will be created to do this rename
                    while importing transactions.
                  </Trans>
                </>
              )}
            </Information>

            {!isEditingRule && (
              <label
                style={{
                  fontSize: 13,
                  marginTop: 10,
                  color: theme.pageTextLight,
                  userSelect: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  // Start-aligned under the note on desktop.
                  ...(isCard && {
                    marginTop: 12,
                    color: theme.pageText,
                    justifyContent: 'flex-start',
                  }),
                }}
                aria-label={t(
                  'Automatically rename these payees in the future',
                )}
              >
                <input
                  type="checkbox"
                  checked={shouldCreateRule}
                  onChange={e => setShouldCreateRule(e.target.checked)}
                />
                <Text style={{ marginLeft: isCard ? 8 : 3 }}>
                  <Trans>Automatically rename these payees in the future</Trans>
                </Text>
              </label>
            )}

            {isCard ? (
              // "Do nothing" at the left and Merge as primary at the right, as
              // in the other dialogs (design-decisions §10k). Merge keeps the
              // initial focus through autoFocus.
              <ModalButtons
                style={{ marginTop: 20, gap: 8 }}
                leftContent={
                  <Button
                    variant="control"
                    className={css(dialogButtonStyle)}
                    onPress={() => state.close()}
                  >
                    <Trans>Do nothing</Trans>
                  </Button>
                }
              >
                {!isEditingRule && shouldCreateRule && (
                  <Button
                    variant="control"
                    className={css(dialogButtonStyle)}
                    onPress={() => {
                      void onMergeAndCreateRule(targetPayee);
                      state.close();
                    }}
                  >
                    <Trans>Merge and edit rule</Trans>
                  </Button>
                )}
                <Button
                  variant="primary"
                  autoFocus
                  className={css(dialogPrimaryButtonStyle)}
                  onPress={() => {
                    void onMerge(targetPayee);
                    state.close();
                  }}
                >
                  <Trans>Merge</Trans>
                </Button>
              </ModalButtons>
            ) : (
              <ModalButtons style={{ marginTop: 20 }} focusButton>
                <Button
                  variant="primary"
                  autoFocus
                  style={{ marginRight: 10 }}
                  onPress={() => {
                    void onMerge(targetPayee);
                    state.close();
                  }}
                >
                  <Trans>Merge</Trans>
                </Button>
                {!isEditingRule && shouldCreateRule && (
                  <Button
                    style={{ marginRight: 10 }}
                    onPress={() => {
                      void onMergeAndCreateRule(targetPayee);
                      state.close();
                    }}
                  >
                    <Trans>Merge and edit rule</Trans>
                  </Button>
                )}
                <Button
                  style={{ marginRight: 10 }}
                  onPress={() => state.close()}
                >
                  <Trans>Do nothing</Trans>
                </Button>
              </ModalButtons>
            )}
          </View>
        </View>
      )}
    </Modal>
  );
}
