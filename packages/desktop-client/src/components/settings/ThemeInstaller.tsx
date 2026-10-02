import React, { useCallback, useEffect, useState } from 'react';
import { TextArea } from 'react-aria-components';
import { Trans, useTranslation } from 'react-i18next';
import { AutoSizer } from 'react-virtualized-auto-sizer';

import { Button } from '@actual-app/components/button';
import { AnimatedLoading } from '@actual-app/components/icons/AnimatedLoading';
import { SvgExclamationOutline } from '@actual-app/components/icons/v1';
import { baseInputStyle } from '@actual-app/components/input';
import { SpaceBetween } from '@actual-app/components/space-between';
import { styles } from '@actual-app/components/styles';
import type { CSSProperties } from '@actual-app/components/styles';
import { Text } from '@actual-app/components/text';
import { TextOneLine } from '@actual-app/components/text-one-line';
import { theme as themeStyle } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';
import { css } from '@emotion/css';

import {
  dialogButtonStyle,
  dialogEyebrowStyle,
} from '#components/common/dialogStyles';
import { Link } from '#components/common/Link';
import { FixedSizeList } from '#components/FixedSizeList';
import { useGlobalPref } from '#hooks/useGlobalPref';
import { useThemeCatalog } from '#hooks/useThemeCatalog';
import {
  embedThemeFonts,
  extractRepoOwner,
  fetchThemeCss,
  generateThemeId,
  normalizeGitHubRepo,
  validateThemeCss,
} from '#style/customThemes';
import type { CatalogTheme, InstalledTheme } from '#style/customThemes';

import { ColorPalette } from './ColorPalette';
import { useSettingsRedesign } from './UI';

// Theme item dimensions
const ITEMS_PER_ROW = 3;
const THEME_ITEM_GAP = 12;
const THEME_ITEM_PADDING = 4; // horizontal padding on each side
const SCROLLBAR_WIDTH = 8;
const CATALOG_MAX_HEIGHT = 300;

type ThemeInstallerProps = {
  onInstall: (theme: InstalledTheme) => void;
  onClose: () => void;
  installedTheme?: InstalledTheme | null;
  mode?: 'light' | 'dark';
};

export function ThemeInstaller({
  onInstall,
  onClose,
  installedTheme,
  mode,
}: ThemeInstallerProps) {
  const { t } = useTranslation();
  const isRedesign = useSettingsRedesign();
  const [customCssOverride, setCustomCssOverride] =
    useGlobalPref('customCssOverride');
  const [selectedCatalogTheme, setSelectedCatalogTheme] =
    useState<CatalogTheme | null>(null);
  const [erroringTheme, setErroringTheme] = useState<CatalogTheme | null>(null);
  const [pastedCss, setPastedCss] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch catalog from GitHub using custom hook
  const {
    data: catalog,
    isLoading: catalogLoading,
    error: catalogError,
  } = useThemeCatalog();

  // Mount-only: pref changes while the installer is open should not clobber
  // in-progress edits to the textarea.
  useEffect(() => {
    if (customCssOverride) {
      setPastedCss(customCssOverride);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Calculate theme item width based on container width (always 3 per row)
  const getItemWidth = useCallback((containerWidth: number) => {
    const availableWidth =
      containerWidth - THEME_ITEM_PADDING * 2 - SCROLLBAR_WIDTH;
    return Math.floor(
      (availableWidth - (ITEMS_PER_ROW - 1) * THEME_ITEM_GAP) / ITEMS_PER_ROW,
    );
  }, []);

  // Helper function to check if a catalog theme matches an installed theme
  const isCatalogThemeInstalled = useCallback(
    (catalogTheme: CatalogTheme): boolean => {
      if (!installedTheme) return false;
      try {
        const normalizedRepo = normalizeGitHubRepo(catalogTheme.repo);
        const themeId = generateThemeId(normalizedRepo);
        return themeId === installedTheme.id;
      } catch {
        return false;
      }
    },
    [installedTheme],
  );

  const installTheme = useCallback(
    async (options: {
      css: string | Promise<string>;
      name: string;
      repo: string;
      id: string;
      errorMessage: string;
      catalogTheme?: CatalogTheme | null;
      baseTheme?: 'light' | 'dark' | 'midnight';
    }) => {
      setError(null);
      setErroringTheme(null);
      setIsLoading(true);

      try {
        const css =
          typeof options.css === 'string' ? options.css : await options.css;
        const validatedCss = css ? validateThemeCss(css) : '';

        const newTheme: InstalledTheme = {
          id: options.id,
          name: options.name,
          repo: options.repo,
          cssContent: validatedCss,
          baseTheme: options.catalogTheme
            ? options.catalogTheme.mode === 'dark'
              ? 'dark'
              : 'light'
            : options.baseTheme,
        };
        onInstall(newTheme);
        // Only set selectedCatalogTheme on success if it's a catalog theme
        if (options.catalogTheme) {
          setSelectedCatalogTheme(options.catalogTheme);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : options.errorMessage);
        // Track which theme failed and clear selection
        if (options.catalogTheme) {
          setErroringTheme(options.catalogTheme);
        }
        setSelectedCatalogTheme(null);
      } finally {
        setIsLoading(false);
      }
    },
    [onInstall],
  );

  const handleCatalogThemeClick = useCallback(
    async (theme: CatalogTheme) => {
      setSelectedCatalogTheme(theme);

      const normalizedRepo = normalizeGitHubRepo(theme.repo);
      // Fetch CSS and embed any referenced font files as data: URIs
      const cssWithFonts = fetchThemeCss(theme.repo).then(css =>
        embedThemeFonts(css, theme.repo),
      );
      await installTheme({
        css: cssWithFonts,
        name: theme.name,
        repo: normalizedRepo,
        id: generateThemeId(normalizedRepo),
        errorMessage: t('Failed to load theme'),
        catalogTheme: theme,
      });
    },
    [installTheme, t],
  );

  const handlePastedCssChange = useCallback((value: string) => {
    setPastedCss(value);
    setErroringTheme(null);
    setError(null);
  }, []);

  const handleApplyOverride = useCallback(() => {
    setError(null);
    setErroringTheme(null);
    try {
      const validated = pastedCss.trim() ? validateThemeCss(pastedCss) : '';
      setCustomCssOverride(validated);
      setPastedCss(validated);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t('Failed to validate theme CSS'),
      );
    }
  }, [pastedCss, setCustomCssOverride, t]);

  return (
    <View
      style={
        isRedesign
          ? {
              // Card Inset panel in the Themes card (design-decisions §10l).
              padding: 16,
              backgroundColor: themeStyle.cardInset,
              borderRadius: 12,
            }
          : {
              padding: 16,
              backgroundColor: themeStyle.tableBackground,
              borderRadius: 8,
              border: `1px solid ${themeStyle.tableBorder}`,
            }
      }
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: isRedesign ? 10 : 16,
        }}
      >
        <Text
          style={
            isRedesign
              ? { fontWeight: 600, fontSize: 13.5, color: themeStyle.pageText }
              : { fontWeight: 600, fontSize: 14 }
          }
        >
          <Trans>Install Custom Theme</Trans>
        </Text>
        <Button
          variant={isRedesign ? 'control' : 'bare'}
          style={isRedesign ? dialogButtonStyle : undefined}
          onPress={onClose}
        >
          <Trans>Close</Trans>
        </Button>
      </View>

      {/* Catalog Virtualized List */}
      <Text style={isRedesign ? redesignLabelStyle : upstreamLabelStyle}>
        <Trans>Choose from catalog:</Trans>
      </Text>
      {catalogError ? (
        <Text style={isRedesign ? redesignMessageStyle : upstreamMessageStyle}>
          {isRedesign && <SvgExclamationOutline style={messageIconStyle} />}
          <Trans>
            Failed to load theme catalog. You can still paste custom CSS below.
          </Trans>
        </Text>
      ) : (
        <View
          style={{
            height: CATALOG_MAX_HEIGHT,
            marginBottom: 16,
          }}
        >
          {catalogLoading ? (
            <View
              style={{
                height: '100%',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AnimatedLoading
                style={{
                  width: 24,
                  height: 24,
                  color: themeStyle.pageText,
                }}
              />
            </View>
          ) : (
            <AutoSizer
              renderProp={({ width = 0, height = 0 }) => {
                if (width === 0 || height === 0) {
                  return null;
                }

                const catalogItems = [...(catalog ?? [])]
                  .filter(catalogTheme => !mode || catalogTheme.mode === mode)
                  .sort((a, b) => a.name.localeCompare(b.name));
                const itemWidth = getItemWidth(width);
                const rows: CatalogTheme[][] = [];
                for (let i = 0; i < catalogItems.length; i += ITEMS_PER_ROW) {
                  rows.push(catalogItems.slice(i, i + ITEMS_PER_ROW));
                }

                return (
                  <FixedSizeList
                    width={width}
                    height={height}
                    itemCount={rows.length}
                    itemSize={itemWidth + THEME_ITEM_GAP}
                    itemKey={index => `row-${index}`}
                    renderRow={({ index, key, style }) => {
                      const rowThemes = rows[index];
                      return (
                        <div
                          key={key}
                          style={{
                            ...style,
                            display: 'flex',
                            gap: THEME_ITEM_GAP,
                            padding: `0 ${THEME_ITEM_PADDING + SCROLLBAR_WIDTH}px ${THEME_ITEM_GAP}px ${THEME_ITEM_PADDING}px`,
                          }}
                        >
                          {rowThemes.map((theme, themeIndex) => {
                            const isActive = isCatalogThemeInstalled(theme);
                            const hasError =
                              erroringTheme?.name === theme.name &&
                              erroringTheme?.repo === theme.repo;
                            const isSelected =
                              selectedCatalogTheme?.name === theme.name &&
                              selectedCatalogTheme?.repo === theme.repo;

                            const isLoadingSelected = isLoading && isSelected;

                            return (
                              <Button
                                key={`${theme.name}-${index}-${themeIndex}`}
                                variant="bare"
                                aria-label={theme.name}
                                onPress={() => handleCatalogThemeClick(theme)}
                                style={{
                                  width: itemWidth,
                                  height: itemWidth,
                                  padding: 8,
                                  overflow: 'hidden',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  gap: 8,
                                  flexShrink: 0,
                                  position: 'relative',
                                  ...(!isRedesign &&
                                    getUpstreamTileLook({
                                      hasError,
                                      isActive,
                                    })),
                                }}
                                className={
                                  isRedesign
                                    ? hasError
                                      ? tileErrorClassName
                                      : isActive
                                        ? tileActiveClassName
                                        : tileClassName
                                    : undefined
                                }
                              >
                                <View
                                  style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    borderRadius: isRedesign ? 11 : 6,
                                    backgroundColor: isRedesign
                                      ? themeStyle.scrim
                                      : themeStyle.overlayBackground,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    zIndex: 1,
                                    opacity: isLoadingSelected ? 1 : 0,
                                    pointerEvents: isLoadingSelected
                                      ? 'auto'
                                      : 'none',
                                    transition: 'opacity 0.2s ease-in-out',
                                  }}
                                >
                                  <AnimatedLoading
                                    style={{
                                      width: 24,
                                      height: 24,
                                      color: themeStyle.pageText,
                                    }}
                                  />
                                </View>
                                <ColorPalette
                                  colors={theme.colors}
                                  radius={isRedesign ? 8 : undefined}
                                />
                                <TextOneLine
                                  style={{
                                    fontSize: isRedesign ? 12.5 : 12,
                                    fontWeight: isRedesign ? 600 : 500,
                                    textAlign: 'center',
                                    width: '100%',
                                  }}
                                  title={theme.name}
                                >
                                  {theme.name}
                                </TextOneLine>

                                <SpaceBetween
                                  direction="horizontal"
                                  align="center"
                                  wrap={false}
                                  gap={isRedesign ? 6 : 4}
                                  style={{ fontSize: isRedesign ? 11 : 10 }}
                                >
                                  <TextOneLine
                                    style={{
                                      color: isRedesign
                                        ? themeStyle.pageTextSecondary
                                        : themeStyle.pageTextSubdued,
                                    }}
                                  >
                                    {t('by')}{' '}
                                    <Text
                                      style={{
                                        fontWeight: isRedesign ? 600 : 'bold',
                                      }}
                                    >
                                      {extractRepoOwner(theme.repo)}
                                    </Text>
                                  </TextOneLine>
                                  <Link
                                    variant="external"
                                    to={normalizeGitHubRepo(theme.repo)}
                                    onClick={e => e.stopPropagation()}
                                    {...(isRedesign && {
                                      linkColor: 'muted',
                                      className: sourceLinkClassName,
                                    })}
                                  >
                                    <Trans>Source</Trans>
                                  </Link>
                                </SpaceBetween>
                              </Button>
                            );
                          })}
                        </div>
                      );
                    }}
                  />
                );
              }}
            />
          )}
        </View>
      )}

      {/* Paste CSS Input */}
      <View
        style={{
          borderTop: `1px solid ${
            isRedesign ? themeStyle.cardHairline : themeStyle.tableBorder
          }`,
          paddingTop: isRedesign ? 14 : 16,
          marginBottom: isRedesign ? 0 : 16,
        }}
      >
        <Text style={isRedesign ? redesignLabelStyle : upstreamLabelStyle}>
          <Trans>Additional CSS overrides:</Trans>
        </Text>
        <TextArea
          value={pastedCss}
          onChange={e => handlePastedCssChange(e.target.value)}
          placeholder={t(':root {\n  --color-sidebarItemSelected: #007bff;\n}')}
          aria-label={t('Custom Theme CSS')}
          className={isRedesign ? redesignTextAreaClassName : undefined}
          style={
            isRedesign
              ? undefined
              : {
                  ...baseInputStyle,
                  height: 120,
                  resize: 'vertical',
                }
          }
        />
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'flex-end',
            marginTop: 8,
          }}
        >
          <Button
            variant={isRedesign ? 'control' : 'normal'}
            style={isRedesign ? dialogButtonStyle : undefined}
            onPress={handleApplyOverride}
          >
            <Trans>Apply</Trans>
          </Button>
        </View>
      </View>

      {/* Error Message */}
      {error && (
        <Text
          style={
            isRedesign
              ? { ...redesignMessageStyle, marginTop: 10, marginBottom: 0 }
              : upstreamMessageStyle
          }
        >
          {isRedesign && <SvgExclamationOutline style={messageIconStyle} />}
          {error}
        </Text>
      )}
    </View>
  );
}

function getUpstreamTileLook({
  hasError,
  isActive,
}: {
  hasError: boolean;
  isActive: boolean;
}): CSSProperties {
  return {
    borderRadius: 6,
    border: `2px solid ${
      hasError
        ? themeStyle.errorText
        : isActive
          ? themeStyle.buttonPrimaryBackground
          : themeStyle.tableBorder
    }`,
    backgroundColor: hasError
      ? themeStyle.errorBackground
      : isActive
        ? themeStyle.tableRowBackgroundHover
        : 'transparent',
  };
}

// Desktop looks (design-decisions §10l); narrow widths keep upstream's.
// Classes rather than inline styles so hover and focus states apply.
const tileClassName = css({
  borderRadius: 12,
  border: `1px solid ${themeStyle.cardHairline}`,
  backgroundColor: themeStyle.cardBackground,
  '&[data-hovered]': { backgroundColor: themeStyle.tableRowHover },
  // Inside the edge: the list's rows leave no room above for an outer ring.
  '&[data-focus-visible]': { ...styles.focusRing, outlineOffset: -2 },
});

const tileActiveClassName = css({
  borderRadius: 12,
  border: `1px solid ${themeStyle.selectionBorder}`,
  boxShadow: `inset 0 0 0 0.5px ${themeStyle.selectionBorder}`,
  backgroundColor: themeStyle.selectionBackground,
  '&[data-hovered]': { backgroundColor: themeStyle.selectionBackground },
  '&[data-focus-visible]': { ...styles.focusRing, outlineOffset: -2 },
});

const tileErrorClassName = css({
  borderRadius: 12,
  border: `1px solid ${themeStyle.pillNegativeText}`,
  backgroundColor: themeStyle.pillNegativeBackground,
  '&[data-hovered]': { backgroundColor: themeStyle.pillNegativeBackground },
  '&[data-focus-visible]': { ...styles.focusRing, outlineOffset: -2 },
});

const upstreamLabelStyle: CSSProperties = {
  marginBottom: 8,
  color: themeStyle.pageTextSubdued,
};

const redesignLabelStyle: CSSProperties = {
  ...dialogEyebrowStyle,
  marginBottom: 8,
};

const upstreamMessageStyle: CSSProperties = {
  color: themeStyle.errorText,
  marginBottom: 12,
  fontSize: 12,
};

const redesignMessageStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: 6,
  color: themeStyle.pillNegativeText,
  marginBottom: 12,
  fontSize: 12.5,
  lineHeight: 1.4,
};

const messageIconStyle: CSSProperties = {
  width: 13,
  height: 13,
  flexShrink: 0,
  marginTop: 2,
};

// Doubled to outrank the Settings card's own link style.
const sourceLinkClassName = css({
  '&&': {
    color: themeStyle.pageText,
    fontWeight: 500,
    textDecoration: 'underline',
    textUnderlineOffset: 2,
  },
});

const redesignTextAreaClassName = css({
  height: 120,
  resize: 'vertical',
  margin: 0,
  padding: '8px 10px',
  borderRadius: 9,
  border: `1px solid ${themeStyle.cardHairline}`,
  backgroundColor: themeStyle.controlBackground,
  color: themeStyle.pageText,
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
  fontSize: 12,
  lineHeight: 1.5,
  outline: 0,
  '::placeholder': { color: themeStyle.pageTextFaint },
  '&[data-focus-visible], &[data-focused]': styles.focusRing,
});
