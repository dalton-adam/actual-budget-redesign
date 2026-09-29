import React from 'react';
import { useTranslation } from 'react-i18next';

import { SvgTarget } from '@actual-app/components/icons/v1';
import { ProgressBar } from '@actual-app/components/progress-bar';
import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';
import type { CategoryEntity } from '@actual-app/core/types/models';

import { getAutomationEntries } from '#components/budget/goals/CategoryAutomationButton';
import { displayTemplateTypes } from '#components/budget/goals/constants';
import { TemplateSentence } from '#components/budget/goals/TemplateSentence';
import { PrivacyFilter } from '#components/PrivacyFilter';
import { useCategories } from '#hooks/useCategories';
import { useFeatureFlag } from '#hooks/useFeatureFlag';
import { useFormat } from '#hooks/useFormat';

import { getGoalStatus } from './categoryPresentation';

type CategoryDetailsGoalProps = {
  category: CategoryEntity;
  goal: number;
  isLongGoal: boolean;
  available: number;
  assigned: number;
};

/**
 * The goal/template box (design-decisions §5, item 4): a status line, the
 * progress toward the target, the full sentence the Available pill reads
 * out, and the category's templates as the automation button lists them.
 */
export function CategoryDetailsGoal({
  category,
  goal,
  isLongGoal,
  available,
  assigned,
}: CategoryDetailsGoalProps) {
  const { t } = useTranslation();
  const format = useFormat();
  const isTemplatesUIEnabled = useFeatureFlag('goalTemplatesUIEnabled');
  const { data: categoriesData } = useCategories();

  const status = getGoalStatus({ goal, isLongGoal, available, assigned });
  const target = format(goal, 'financial');
  const remaining = format(status.remaining, 'financial');

  let headline;
  let sentence;
  if (isLongGoal) {
    headline = t('Goal {{goal}} · {{percent}}% saved', {
      goal: target,
      // Never round up to 100% before the goal is met.
      percent: status.isMet ? 100 : Math.min(99, Math.round(status.fill * 100)),
    });
    sentence = status.isMet
      ? t('Goal of {{goal}} reached.', { goal: target })
      : t('Long-term goal of {{goal}}. {{amount}} to go.', {
          goal: target,
          amount: remaining,
        });
  } else {
    headline = status.isMet
      ? t('Template {{goal}} · Funded', { goal: target })
      : t('Template {{goal}} · {{amount}} short', {
          goal: target,
          amount: remaining,
        });
    sentence = status.isMet
      ? t('Template of {{goal}} funded.', { goal: target })
      : t('Template asks for {{goal}}. Underfunded by {{amount}}.', {
          goal: target,
          amount: remaining,
        });
  }

  const automations = isTemplatesUIEnabled
    ? getAutomationEntries(category.goal_def).sort(
        (a, b) =>
          displayTemplateTypes.indexOf(a.displayType) -
          displayTemplateTypes.indexOf(b.displayType),
      )
    : [];
  const categoryNameMap: Record<string, string> = {};
  for (const cat of categoriesData?.list ?? []) {
    categoryNameMap[cat.id] = cat.name;
  }

  const color = status.isMet ? theme.pillPositiveText : theme.pillWarningText;

  return (
    <View
      data-testid="category-details-goal"
      style={{
        padding: '11px 12px',
        borderRadius: 12,
        backgroundColor: theme.cardInset,
        gap: 8,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 7,
          fontSize: 13,
          fontWeight: 600,
          color,
        }}
      >
        <SvgTarget
          aria-hidden
          width={12}
          height={12}
          style={{ flexShrink: 0 }}
        />
        <PrivacyFilter>
          <span data-testid="category-details-goal-status">{headline}</span>
        </PrivacyFilter>
      </View>
      <ProgressBar value={status.fill} height={5} color={color} />
      <PrivacyFilter>
        <View
          data-testid="category-details-goal-sentence"
          style={{
            fontSize: 12.5,
            lineHeight: 1.4,
            color: theme.pageTextSecondary,
          }}
        >
          {sentence}
        </View>
      </PrivacyFilter>
      {automations.length > 0 && (
        <PrivacyFilter>
          <ul
            data-testid="category-details-goal-templates"
            style={{
              listStyle: 'none',
              margin: 0,
              padding: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
              fontSize: 12.5,
              lineHeight: 1.4,
              color: theme.pageTextSecondary,
            }}
          >
            {automations.map(entry => (
              <li key={entry.id}>
                <TemplateSentence
                  template={entry.template}
                  categoryNameMap={categoryNameMap}
                />
              </li>
            ))}
          </ul>
        </PrivacyFilter>
      )}
    </View>
  );
}
