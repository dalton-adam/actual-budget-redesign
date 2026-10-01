import React from 'react';
import { Trans } from 'react-i18next';

import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';
import type { DashboardWidgetEntity } from '@actual-app/core/types/models';

import { EditablePageHeaderTitle } from '#components/EditablePageHeaderTitle';
import { useDashboardPages } from '#hooks/useDashboardPages';

import { REPORT_DISPLAY_STYLE } from './constants';

type ReportPageTitleProps = {
  title: string;
  /** The saved widget this page was opened from, if any. */
  widget?: Pick<DashboardWidgetEntity, 'dashboard_page_id'> | null;
  /** Renames the saved widget; the title is editable only with a widget. */
  onSave?: (newName: string) => void;
};

/**
 * A report page's title (APP-03b): a "Reports · <dashboard>" eyebrow over the
 * report's name at Display size. Without a saved widget the eyebrow is
 * "Reports" alone.
 */
export function ReportPageTitle({
  title,
  widget,
  onSave,
}: ReportPageTitleProps) {
  const { data: dashboardPages = [] } = useDashboardPages();
  const dashboardName = widget
    ? dashboardPages.find(page => page.id === widget.dashboard_page_id)?.name
    : undefined;

  return (
    <View style={{ minWidth: 0 }}>
      <View
        style={{
          fontSize: 13,
          fontWeight: 400,
          letterSpacing: 0,
          color: theme.pageTextSecondary,
        }}
      >
        <span>
          <Trans>Reports</Trans>
          {dashboardName && ` · ${dashboardName}`}
        </span>
      </View>
      <View style={REPORT_DISPLAY_STYLE}>
        {widget && onSave ? (
          <EditablePageHeaderTitle
            title={title}
            onSave={onSave}
            inputStyle={{ ...REPORT_DISPLAY_STYLE, marginTop: -2 }}
          />
        ) : (
          title
        )}
      </View>
    </View>
  );
}
