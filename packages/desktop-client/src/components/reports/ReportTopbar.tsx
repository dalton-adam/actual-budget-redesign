import React from 'react';
import type { ComponentProps } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import { useResponsive } from '@actual-app/components/hooks/useResponsive';
import {
  SvgCalculator,
  SvgCamera,
  SvgChart,
  SvgChartArea,
  SvgChartBar,
  SvgChartPie,
  SvgListBullet,
  SvgQueue,
  SvgTag,
} from '@actual-app/components/icons/v1';
import { styles } from '@actual-app/components/styles';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { Tooltip } from '@actual-app/components/tooltip';
import { View } from '@actual-app/components/view';
import * as monthUtils from '@actual-app/core/shared/months';
import type {
  CustomReportEntity,
  RuleConditionEntity,
} from '@actual-app/core/types/models';
import { toPng } from 'html-to-image';

import { FilterButton } from '#components/filters/FiltersMenu';

import { ReportSegmentedControl } from './ReportSegmentedControl';
import { SaveReportWrapper } from './SaveReport';
import type { SavedStatus } from './SaveReportMenu';
import { setSessionReport } from './setSessionReport';

type ReportTopbarProps = {
  customReportItems: CustomReportEntity;
  report: CustomReportEntity;
  savedStatus: SavedStatus;
  setGraphType: (value: string) => void;
  viewLegend: boolean;
  viewSummary: boolean;
  viewLabels: boolean;
  onApplyFilter: (newFilter: RuleConditionEntity) => void;
  onChangeViews: (viewType: string) => void;
  onReportChange: ComponentProps<typeof SaveReportWrapper>['onReportChange'];
  isItemDisabled: (type: string) => boolean;
  defaultItems: (item: string) => void;
};

export function ReportTopbar({
  customReportItems,
  report,
  savedStatus,
  setGraphType,
  viewLegend,
  viewSummary,
  viewLabels,
  onApplyFilter,
  onChangeViews,
  onReportChange,
  isItemDisabled,
  defaultItems,
}: ReportTopbarProps) {
  const { t } = useTranslation();
  const { width } = useResponsive();
  const onChangeGraph = (cond: string) => {
    setSessionReport('graphType', cond);
    onReportChange({ type: 'modify' });
    setGraphType(cond);
    defaultItems(cond);
  };

  const downloadSnapshot = async () => {
    const reportElement = document.getElementById('custom-report-content');
    const title = report.name;
    if (reportElement) {
      const dataUrl = await toPng(reportElement);
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `${monthUtils.currentDay()} - ${title}.png`;
      link.click();
    } else {
      console.error('Report container not found.');
    }
  };

  const barGraphType =
    customReportItems.mode === 'total' ? 'BarGraph' : 'StackedBarGraph';
  const graphOptions = [
    {
      value: 'TableGraph',
      title: t('Data Table'),
      label: <SvgQueue width={15} height={15} />,
    },
    {
      value: barGraphType,
      title:
        customReportItems.mode === 'total'
          ? t('Bar Graph')
          : t('Stacked Bar Graph'),
      label: <SvgChartBar width={15} height={15} />,
    },
    {
      value: 'LineGraph',
      title: t('Line Graph'),
      label: <SvgChart width={15} height={15} />,
    },
    {
      value: 'AreaGraph',
      title: t('Area Graph'),
      label: <SvgChartArea width={15} height={15} />,
    },
    {
      value: 'DonutGraph',
      title: t('Donut Graph'),
      label: <SvgChartPie width={15} height={15} />,
    },
  ].map(option => ({ ...option, isDisabled: isItemDisabled(option.value) }));

  const viewToggles = [
    {
      view: 'viewLegend',
      isOn: viewLegend,
      title: t('Show Legend'),
      label: t('Legend'),
      icon: <SvgListBullet width={14} height={14} />,
      isDisabled: isItemDisabled('ShowLegend'),
    },
    {
      view: 'viewSummary',
      isOn: viewSummary,
      title: t('Show Summary'),
      label: t('Summary'),
      icon: <SvgCalculator width={14} height={14} />,
      isDisabled: false,
    },
    {
      view: 'viewLabels',
      isOn: viewLabels,
      title: t('Show Labels'),
      label: t('Labels'),
      icon: <SvgTag width={14} height={14} />,
      isDisabled: isItemDisabled('ShowLabels'),
    },
  ];

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 14,
        flexShrink: 0,
      }}
    >
      <ReportSegmentedControl
        aria-label={t('Graph type')}
        isIconOnly
        options={graphOptions}
        value={
          customReportItems.graphType === 'BarGraph' ||
          customReportItems.graphType === 'StackedBarGraph'
            ? barGraphType
            : customReportItems.graphType
        }
        onChange={onChangeGraph}
      />
      {viewToggles.map(toggle => (
        <Tooltip
          key={toggle.view}
          placement="bottom start"
          content={<Text>{toggle.title}</Text>}
          style={{ ...styles.tooltip, lineHeight: 1.5, padding: '6px 10px' }}
        >
          <Button
            variant="control"
            aria-label={toggle.title}
            aria-pressed={toggle.isOn}
            isDisabled={toggle.isDisabled}
            onPress={() => onChangeViews(toggle.view)}
            style={{
              gap: 6,
              ...(toggle.isOn
                ? { backgroundColor: theme.cardInset }
                : { color: theme.pageTextSecondary }),
            }}
          >
            {toggle.icon}
            {width >= REPORT_TOOLBAR_LABELS_FROM && toggle.label}
          </Button>
        </Tooltip>
      ))}
      <Tooltip
        placement="bottom start"
        content={<Text>{t('Download Snapshot')}</Text>}
        style={{ ...styles.tooltip, lineHeight: 1.5, padding: '6px 10px' }}
      >
        <Button
          variant="control"
          aria-label={t('Download Snapshot')}
          onPress={downloadSnapshot}
        >
          <SvgCamera width={15} height={15} />
        </Button>
      </Tooltip>
      <FilterButton
        compact={false}
        hover={false}
        variant="control"
        onApply={(e: RuleConditionEntity) => {
          setSessionReport('conditions', [
            ...(customReportItems.conditions ?? []),
            e,
          ]);
          onApplyFilter(e);
          onReportChange({ type: 'modify' });
        }}
        exclude={
          customReportItems.balanceType === 'Budgeted'
            ? [
                'date',
                'account',
                'payee',
                'notes',
                'amount',
                'cleared',
                'reconciled',
                'transfer',
                'saved',
              ]
            : []
        }
      />
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginLeft: 'auto',
        }}
      >
        <SaveReportWrapper
          customReportItems={customReportItems}
          report={report}
          savedStatus={savedStatus}
          onReportChange={onReportChange}
        />
      </View>
    </View>
  );
}

// Below this width the view toggles show their icons only (APP-03c).
const REPORT_TOOLBAR_LABELS_FROM = 1280;
