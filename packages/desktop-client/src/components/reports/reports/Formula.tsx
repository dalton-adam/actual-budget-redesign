import { lazy, Suspense, useCallback, useMemo, useRef, useState } from 'react';
import type { ChangeEvent, ReactNode } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useParams } from 'react-router';

import { Button } from '@actual-app/components/button';
import { useResponsive } from '@actual-app/components/hooks/useResponsive';
import { Input } from '@actual-app/components/input';
import { Select } from '@actual-app/components/select';
import { styles } from '@actual-app/components/styles';
import { theme } from '@actual-app/components/theme';
import { Toggle } from '@actual-app/components/toggle';
import { View } from '@actual-app/components/view';
import type { FormulaWidget } from '@actual-app/core/types/models';

import { QueryManager } from '#components/formula/QueryManager';
import { MobileBackButton } from '#components/mobile/MobileBackButton';
import { MobilePageHeader, Page, PageHeader } from '#components/Page';
import { FormulaResult } from '#components/reports/FormulaResult';
import { LoadingIndicator } from '#components/reports/LoadingIndicator';
import { ReportPageCard } from '#components/reports/ReportPageCard';
import { ReportPageTitle } from '#components/reports/ReportPageTitle';
import { ReportSegmentedControl } from '#components/reports/ReportSegmentedControl';
import { useAccounts } from '#hooks/useAccounts';
import { useCategories } from '#hooks/useCategories';
import { useDashboardWidget } from '#hooks/useDashboardWidget';
import { useFormulaExecution } from '#hooks/useFormulaExecution';
import { useNavigate } from '#hooks/useNavigate';
import { useThemeColors } from '#hooks/useThemeColors';
import { addNotification } from '#notifications/notificationsSlice';
import { useDispatch } from '#redux';
import { useUpdateDashboardWidgetMutation } from '#reports/mutations';

const FormulaEditor = lazy(() =>
  import('#components/formula/FormulaEditor').then(module => ({
    default: module.FormulaEditor,
  })),
);

export function Formula() {
  const params = useParams();
  const { data: widget, isPending } = useDashboardWidget<FormulaWidget>({
    id: params.id,
    type: 'formula-card',
  });

  if (isPending) {
    return <LoadingIndicator />;
  }

  return <FormulaInner widget={widget} />;
}

type FormulaInnerProps = {
  widget?: FormulaWidget;
};

function FormulaInner({ widget }: FormulaInnerProps) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isNarrowWidth, width } = useResponsive();
  const themeColors = useThemeColors();

  const queriesRef = useRef(widget?.meta?.queries || {});
  const [queriesVersion, setQueriesVersion] = useState(0);
  const {
    data: { list: categories, grouped: categoryGroups } = {
      list: [],
      grouped: [],
    },
  } = useCategories();
  const { data: accounts = [] } = useAccounts();

  const [formula, setFormula] = useState(
    widget?.meta?.formula || '=SUM(1, 2, 3)',
  );

  const [fontSizeMode, setFontSizeMode] = useState<'dynamic' | 'static'>(
    widget?.meta?.fontSizeMode || 'dynamic',
  );
  const [staticFontSize, setStaticFontSize] = useState<number>(
    widget?.meta?.staticFontSize || 32,
  );
  const [showTitle, setShowTitle] = useState(widget?.meta?.showTitle ?? true);
  const [colorFormula, setColorFormula] = useState(
    widget?.meta?.colorFormula || '',
  );

  const title = widget?.meta?.name || t('Formula');

  const simpleAccounts = useMemo(
    () =>
      accounts
        .filter(account => !account.tombstone)
        .map(account => ({ id: account.id, name: account.name })),
    [accounts],
  );

  const {
    result,
    isLoading: isExecuting,
    error,
  } = useFormulaExecution(
    formula,
    queriesRef.current,
    queriesVersion,
    undefined,
    simpleAccounts,
  );

  const colorVariables = useMemo(
    () => ({
      RESULT: result ?? 0,
      ...Object.entries(themeColors).reduce(
        (acc, [key, value]) => {
          acc[`theme_${key}`] = value;
          return acc;
        },
        {} as Record<string, string>,
      ),
    }),
    [result, themeColors],
  );
  const categoryBadges = useMemo(() => {
    const categoryGroupNames = Object.fromEntries(
      categoryGroups.map(group => [group.id, group.name]),
    );

    return Object.fromEntries(
      categories
        .filter(category => !category.tombstone && !category.hidden)
        .map(category => {
          const groupName = categoryGroupNames[category.group];
          return [
            category.id,
            groupName ? `${groupName} -> ${category.name}` : category.name,
          ];
        }),
    );
  }, [categories, categoryGroups]);
  const { result: colorResult, error: colorError } = useFormulaExecution(
    colorFormula,
    queriesRef.current,
    queriesVersion,
    colorVariables,
    simpleAccounts,
  );

  const handleQueriesChange = useCallback(
    (newQueries: typeof queriesRef.current) => {
      queriesRef.current = newQueries;
      setQueriesVersion(v => v + 1);
    },
    [],
  );

  const updateDashboardWidgetMutation = useUpdateDashboardWidgetMutation();

  const onSaveWidgetName = async (newName: string) => {
    if (!widget) {
      dispatch(
        addNotification({
          notification: {
            type: 'error',
            message: t('Cannot save: No widget available.'),
          },
        }),
      );
      return;
    }

    const name = newName || t('Formula');
    updateDashboardWidgetMutation.mutate({
      widget: {
        id: widget.id,
        meta: {
          ...(widget.meta ?? {}),
          name,
          formula,
          queries: queriesRef.current,
          fontSizeMode,
          staticFontSize,
          showTitle,
          colorFormula,
        },
      },
    });
  };

  async function onSaveWidget() {
    if (!widget) {
      dispatch(
        addNotification({
          notification: {
            type: 'error',
            message: t('Cannot save: No widget available.'),
          },
        }),
      );
      return;
    }

    updateDashboardWidgetMutation.mutate(
      {
        widget: {
          id: widget.id,
          meta: {
            ...(widget.meta ?? {}),
            formula,
            queries: queriesRef.current,
            fontSizeMode,
            staticFontSize,
            showTitle,
            colorFormula,
          },
        },
      },
      {
        onSuccess: () => {
          dispatch(
            addNotification({
              notification: {
                type: 'message',
                message: t('Dashboard widget successfully saved.'),
              },
            }),
          );
        },
      },
    );
  }

  // Determine the custom color from color formula result
  const customColor =
    colorFormula && !colorError && colorResult ? String(colorResult) : null;

  return (
    <Page
      header={
        isNarrowWidth ? (
          <MobilePageHeader
            title={title}
            leftContent={
              <MobileBackButton onPress={() => navigate('/reports')} />
            }
          />
        ) : (
          <PageHeader
            title={
              <ReportPageTitle
                title={title}
                widget={widget}
                onSave={onSaveWidgetName}
              />
            }
          />
        )
      }
      padding={0}
    >
      {widget && (
        <View
          style={{
            padding: 20,
            display: 'flex',
            justifyContent: 'flex-end',
            flexDirection: 'row',
            background: theme.pageBackground,
          }}
        >
          <Button
            variant="primary"
            onPress={onSaveWidget}
            style={{ width: 100 }}
          >
            <Trans>Save widget</Trans>
          </Button>
        </View>
      )}
      {isNarrowWidth ? (
        <View
          style={{
            width: '100%',
            height: '100%',
            background: theme.pageBackground,
            display: 'flex',
            flexDirection: 'row',
          }}
        >
          <View
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <View style={{ padding: 20, paddingBottom: 0 }}>
              <div
                style={{
                  fontSize: 13,
                  color: theme.pageTextSubdued,
                  marginBottom: 5,
                }}
              >
                <label htmlFor="formula-show-title">
                  <Trans>Show title:</Trans>
                </label>
              </div>
              <Toggle
                id="formula-show-title"
                isOn={showTitle}
                onToggle={setShowTitle}
              />
            </View>
            <View
              style={{
                padding: 20,
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: 10,
                minHeight: 120,
              }}
            >
              <div
                style={{
                  fontSize: 14,
                  color: theme.pageTextSubdued,
                }}
              >
                <Trans>Result:</Trans>
              </div>
              <View
                style={{
                  height: 120,
                  width: '100%',
                  overflow: 'auto',
                  backgroundColor: theme.cardBackground,
                  borderRadius: 6,
                  ...styles.horizontalScrollbar,
                  '::-webkit-scrollbar': {
                    height: '8px',
                  },
                }}
              >
                <FormulaResult
                  value={result}
                  error={error}
                  loading={isExecuting}
                  fontSizeMode={fontSizeMode}
                  staticFontSize={staticFontSize}
                  customColor={customColor}
                />
              </View>
            </View>
            <View
              style={{
                flex: 1,
                minHeight: 50,
                margin: 20,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  color: theme.pageTextSubdued,
                  marginBottom: 5,
                }}
              >
                <Trans>Formula:</Trans>
              </div>
              <Suspense
                fallback={<div style={{ padding: 10 }}>Loading...</div>}
              >
                <FormulaEditor
                  value={formula}
                  onChange={setFormula}
                  mode="query"
                  queries={queriesRef.current}
                  categoryBadges={categoryBadges}
                  singleLine={false}
                  showLineNumbers
                />
              </Suspense>
            </View>
            <View
              style={{
                padding: '0 20px 20px 20px',
                display: 'flex',
                flexDirection: 'row',
                gap: 20,
                alignItems: 'flex-end',
              }}
            >
              <View>
                <div
                  style={{
                    fontSize: 13,
                    color: theme.pageTextSubdued,
                    marginBottom: 5,
                  }}
                >
                  <Trans>Font size:</Trans>
                </div>
                <Select
                  value={fontSizeMode}
                  onChange={(value: 'dynamic' | 'static') =>
                    setFontSizeMode(value)
                  }
                  options={[
                    ['dynamic', t('Dynamic')],
                    ['static', t('Static')],
                  ]}
                />
              </View>

              {fontSizeMode === 'static' && (
                <View>
                  <div
                    style={{
                      fontSize: 13,
                      color: theme.pageTextSubdued,
                      marginBottom: 5,
                    }}
                  >
                    <Trans>Font size (px):</Trans>
                  </div>
                  <Input
                    type="number"
                    value={String(staticFontSize)}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setStaticFontSize(Number(e.target.value))
                    }
                  />
                </View>
              )}
            </View>
            <View
              style={{
                padding: 20,
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  color: theme.pageTextSubdued,
                  marginBottom: 5,
                }}
              >
                <Trans>Conditional color (optional):</Trans>
              </div>
              <View
                style={{
                  border: `1px solid ${theme.formInputBorder}`,
                  borderRadius: 4,
                  overflow: 'hidden',
                  backgroundColor: theme.tableBackground,
                }}
              >
                <Suspense fallback={<div style={{ height: 32 }} />}>
                  <FormulaEditor
                    value={colorFormula}
                    variables={colorVariables}
                    onChange={setColorFormula}
                    mode="query"
                    queries={queriesRef.current}
                    categoryBadges={categoryBadges}
                    singleLine
                    showLineNumbers={false}
                  />
                </Suspense>
              </View>
              <div
                style={{
                  fontSize: 11,
                  color: theme.pageTextSubdued,
                  marginTop: 5,
                }}
              >
                <Trans>
                  Formula that returns a color (e.g., &ldquo;red&rdquo;,
                  &ldquo;#ff0000&rdquo;). Leave blank for default. Use RESULT
                  variable to access the main formula result.
                </Trans>
              </div>
            </View>
          </View>

          <View
            style={{
              overflowY: 'auto',
            }}
          >
            <QueryManager
              queries={queriesRef.current}
              onQueriesChange={handleQueriesChange}
            />
          </View>
        </View>
      ) : (
        <View
          style={{
            flexDirection: width >= FORMULA_SIDE_COLUMN_FROM ? 'row' : 'column',
            alignItems:
              width >= FORMULA_SIDE_COLUMN_FROM ? 'flex-start' : 'stretch',
            gap: 14,
            padding: '0 20px 20px',
            flex: 1,
            overflowY: 'auto',
          }}
        >
          <View
            style={{
              minWidth: 0,
              gap: 14,
              ...(width >= FORMULA_SIDE_COLUMN_FROM
                ? { flex: 1 }
                : { flexShrink: 0 }),
            }}
          >
            <ReportPageCard style={{ flexShrink: 0 }}>
              <FormulaCardTitle>
                <Trans>Result</Trans>
              </FormulaCardTitle>
              <View
                style={{
                  height: 120,
                  width: '100%',
                  overflow: 'auto',
                  backgroundColor: theme.cardInset,
                  borderRadius: 10,
                  ...styles.horizontalScrollbar,
                  '::-webkit-scrollbar': {
                    height: '8px',
                  },
                }}
              >
                <FormulaResult
                  value={result}
                  error={error}
                  loading={isExecuting}
                  fontSizeMode={fontSizeMode}
                  staticFontSize={staticFontSize}
                  customColor={customColor}
                />
              </View>
            </ReportPageCard>
            <ReportPageCard style={{ flexShrink: 0 }}>
              <FormulaCardTitle>
                <Trans>Formula</Trans>
              </FormulaCardTitle>
              <View
                style={{
                  minHeight: 120,
                  border: `1px solid ${theme.cardHairline}`,
                  borderRadius: 10,
                  overflow: 'hidden',
                }}
              >
                <Suspense
                  fallback={<div style={{ padding: 10 }}>Loading...</div>}
                >
                  <FormulaEditor
                    value={formula}
                    onChange={setFormula}
                    mode="query"
                    queries={queriesRef.current}
                    categoryBadges={categoryBadges}
                    singleLine={false}
                    showLineNumbers
                  />
                </Suspense>
              </View>
            </ReportPageCard>
            <ReportPageCard style={{ flexShrink: 0 }}>
              <FormulaCardTitle>
                <Trans>Appearance</Trans>
              </FormulaCardTitle>
              <View
                style={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  alignItems: 'flex-start',
                  gap: '18px 28px',
                }}
              >
                <View style={{ gap: 6 }}>
                  <label
                    htmlFor="formula-show-title"
                    style={FORMULA_FIELD_LABEL_STYLE}
                  >
                    <Trans>Show title:</Trans>
                  </label>
                  <Toggle
                    id="formula-show-title"
                    isOn={showTitle}
                    onToggle={setShowTitle}
                  />
                </View>
                <View style={{ gap: 6 }}>
                  <View style={FORMULA_FIELD_LABEL_STYLE}>
                    <Trans>Font size:</Trans>
                  </View>
                  <ReportSegmentedControl
                    aria-label={t('Font size')}
                    options={[
                      { value: 'dynamic', label: t('Dynamic') },
                      { value: 'static', label: t('Static') },
                    ]}
                    value={fontSizeMode}
                    onChange={setFontSizeMode}
                  />
                </View>
                {fontSizeMode === 'static' && (
                  <View style={{ gap: 6 }}>
                    <View style={FORMULA_FIELD_LABEL_STYLE}>
                      <Trans>Font size (px):</Trans>
                    </View>
                    <Input
                      type="number"
                      value={String(staticFontSize)}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setStaticFontSize(Number(e.target.value))
                      }
                      style={{ width: 88 }}
                    />
                  </View>
                )}
              </View>
              <View style={{ gap: 6, marginTop: 16 }}>
                <View style={FORMULA_FIELD_LABEL_STYLE}>
                  <Trans>Conditional color (optional):</Trans>
                </View>
                <View
                  style={{
                    border: `1px solid ${theme.cardHairline}`,
                    borderRadius: 10,
                    overflow: 'hidden',
                    backgroundColor: theme.tableBackground,
                  }}
                >
                  <Suspense fallback={<div style={{ height: 32 }} />}>
                    <FormulaEditor
                      value={colorFormula}
                      variables={colorVariables}
                      onChange={setColorFormula}
                      mode="query"
                      queries={queriesRef.current}
                      categoryBadges={categoryBadges}
                      singleLine
                      showLineNumbers={false}
                    />
                  </Suspense>
                </View>
                <div
                  style={{
                    fontSize: 12,
                    lineHeight: 1.5,
                    color: theme.pageTextSecondary,
                  }}
                >
                  <Trans>
                    Formula that returns a color (e.g., &ldquo;red&rdquo;,
                    &ldquo;#ff0000&rdquo;). Leave blank for default. Use RESULT
                    variable to access the main formula result.
                  </Trans>
                </div>
              </View>
            </ReportPageCard>
          </View>
          <ReportPageCard
            style={{
              flexShrink: 0,
              ...(width >= FORMULA_SIDE_COLUMN_FROM && {
                width: 380,
                flexShrink: 0,
              }),
            }}
          >
            <QueryManager
              queries={queriesRef.current}
              onQueriesChange={handleQueriesChange}
              isCard
            />
          </ReportPageCard>
        </View>
      )}
    </Page>
  );
}

// From this width the query definitions sit beside the editor (APP-03c).
const FORMULA_SIDE_COLUMN_FROM = 1280;

const FORMULA_FIELD_LABEL_STYLE = {
  fontSize: 12,
  fontWeight: 600,
  color: theme.pageTextSecondary,
} as const;

function FormulaCardTitle({ children }: { children: ReactNode }) {
  return (
    <View
      style={{
        fontSize: 15,
        fontWeight: 600,
        color: theme.pageText,
        marginBottom: 10,
      }}
    >
      {children}
    </View>
  );
}
