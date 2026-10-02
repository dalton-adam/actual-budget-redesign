import { useEffect, useRef, useState } from 'react';
import type {
  ComponentProps,
  ComponentType,
  CSSProperties,
  KeyboardEvent,
  ReactNode,
  SVGProps,
} from 'react';

import { Button } from './Button';
import { useResponsive } from './hooks/useResponsive';
import { styles } from './styles';
import { Text } from './Text';
import { theme } from './theme';
import { Toggle } from './Toggle';
import { View } from './View';

const MenuLine: unique symbol = Symbol('menu-line');
const MenuLabel: unique symbol = Symbol('menu-label');
Menu.line = MenuLine as typeof MenuLine;
Menu.label = MenuLabel as typeof MenuLabel;

type KeybindingProps = {
  keyName: ReactNode;
};

function Keybinding({ keyName }: KeybindingProps) {
  const { isNarrowWidth } = useResponsive();
  if (!isNarrowWidth) {
    return (
      <Text
        style={{
          marginLeft: 10,
          minWidth: 18,
          height: 18,
          padding: '0 5px',
          borderRadius: 5,
          backgroundColor: theme.cardInset,
          color: theme.pageTextSubdued,
          fontSize: 11,
          fontWeight: 600,
          lineHeight: '18px',
          textAlign: 'center',
        }}
      >
        {keyName}
      </Text>
    );
  }
  return (
    <Text style={{ fontSize: 10, color: theme.menuKeybindingText }}>
      {keyName}
    </Text>
  );
}

export type MenuItemObject<NameType, Type extends string | symbol = string> = {
  type?: Type;
  name: NameType;
  disabled?: boolean;
  icon?: ComponentType<SVGProps<SVGSVGElement>>;
  iconSize?: number;
  text: string;
  key?: string;
  toggle?: boolean;
  tooltip?: string;
};

export type MenuItem<NameType = string> =
  | MenuItemObject<NameType>
  | MenuItemObject<string, typeof Menu.label>
  | typeof Menu.line;

function isLabel<T>(
  item: MenuItemObject<T> | MenuItemObject<string, typeof Menu.label>,
): item is MenuItemObject<string, typeof Menu.label> {
  return item.type === Menu.label;
}

type MenuProps<NameType> = {
  header?: ReactNode;
  footer?: ReactNode;
  items: Array<MenuItem<NameType>>;
  onMenuSelect?: (itemName: NameType) => void;
  style?: CSSProperties;
  className?: string;
  getItemStyle?: (item: MenuItemObject<NameType>) => CSSProperties;
  slot?: ComponentProps<typeof Button>['slot'];
};

export function Menu<const NameType = string>({
  header,
  footer,
  items: allItems,
  onMenuSelect,
  style,
  className,
  getItemStyle,
  slot,
}: MenuProps<NameType>) {
  const elRef = useRef<HTMLDivElement>(null);
  const items = allItems.filter(x => x);
  const filteredItems = items.filter(
    item => item && item !== Menu.line && item.type !== Menu.label,
  );
  const { isNarrowWidth } = useResponsive();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  // Arrow keys move the highlight; on desktop that row also shows the
  // focus ring so keyboard users can tell it apart from the pointer.
  const [isKeyboardHighlight, setIsKeyboardHighlight] = useState(false);
  const currentIndex = filteredItems.indexOf(items[hoveredIndex || 0]);
  const transformIndex = (idx: number) => items.indexOf(filteredItems[idx]);

  function hoverPrevious() {
    setHoveredIndex(
      hoveredIndex === null ? 0 : transformIndex(Math.max(currentIndex - 1, 0)),
    );
  }

  function hoverNext() {
    setHoveredIndex(
      hoveredIndex === null
        ? 0
        : transformIndex(Math.min(currentIndex + 1, filteredItems.length - 1)),
    );
  }

  function selectItem() {
    const item = items[hoveredIndex || 0];
    if (
      hoveredIndex !== null &&
      item !== Menu.line &&
      !isLabel(item) &&
      !item.disabled
    ) {
      onMenuSelect?.(item.name);
    }
  }

  function onKeyDown(e: KeyboardEvent) {
    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        setIsKeyboardHighlight(true);
        hoverPrevious();
        break;
      case 'ArrowDown':
        e.preventDefault();
        setIsKeyboardHighlight(true);
        hoverNext();
        break;
      case 'Enter':
        e.preventDefault();
        selectItem();
        break;
      default:
    }
  }

  useEffect(() => {
    const activeElement = document.activeElement;

    if (
      activeElement &&
      (['input', 'select', 'textarea'].includes(
        activeElement.tagName.toLowerCase(),
      ) ||
        activeElement.hasAttribute('contenteditable') ||
        activeElement.getAttribute('role') === 'textbox')
    ) {
      return;
    }

    const el = elRef.current;
    el?.focus();
  }, []);

  return (
    <View
      role="menu"
      className={className}
      style={{
        outline: 'none',
        borderRadius: 4,
        overflow: 'hidden',
        ...(!isNarrowWidth && { padding: 6, borderRadius: 12 }),
        ...style,
      }}
      tabIndex={0}
      onKeyDown={onKeyDown}
      innerRef={elRef}
    >
      {header}
      {items.map((item, idx) => {
        if (item === Menu.line) {
          return (
            <View
              key={idx}
              style={{ margin: isNarrowWidth ? '3px 0px' : '6px 4px' }}
            >
              <View
                style={{
                  borderTop:
                    '1px solid ' +
                    (isNarrowWidth ? theme.menuBorder : theme.cardHairline),
                }}
              />
            </View>
          );
        } else if (isLabel(item)) {
          return (
            <Text
              key={idx}
              style={
                isNarrowWidth
                  ? {
                      color: theme.menuItemTextHeader,
                      fontSize: 11,
                      lineHeight: '1em',
                      textTransform: 'uppercase',
                      margin: '3px 9px',
                      marginTop: 5,
                    }
                  : {
                      color: theme.pageTextFaint,
                      fontSize: 11,
                      fontWeight: 600,
                      letterSpacing: '0.06em',
                      lineHeight: '1em',
                      textTransform: 'uppercase',
                      padding: '10px 10px 4px',
                    }
              }
            >
              {item.name}
            </Text>
          );
        }

        const Icon = item.icon;

        return (
          <Button
            excludeFromTabOrder
            key={String(item.name)}
            variant="bare"
            slot={slot}
            style={{
              cursor: 'default',
              padding: 10,
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              color: theme.menuItemText,
              ...(!isNarrowWidth && {
                minHeight: 32,
                padding: '0 10px',
                borderRadius: 8,
                fontSize: 13,
                backgroundColor: 'transparent',
                color: theme.pageText,
              }),
              ...(item.disabled && { color: theme.buttonBareDisabledText }),
              ...(!item.disabled &&
                hoveredIndex === idx &&
                (isNarrowWidth
                  ? {
                      backgroundColor: theme.menuItemBackgroundHover,
                      color: theme.menuItemTextHover,
                    }
                  : {
                      backgroundColor: theme.tableRowHover,
                      ...(isKeyboardHighlight && {
                        ...styles.focusRing,
                        outlineOffset: -2,
                      }),
                    })),
              ...(!isLabel(item) && getItemStyle?.(item)),
            }}
            onHoverStart={() => {
              setIsKeyboardHighlight(false);
              setHoveredIndex(idx);
            }}
            onHoverEnd={() => setHoveredIndex(null)}
            onPress={() => {
              if (
                !item.disabled &&
                item.toggle === undefined &&
                !isLabel(item)
              ) {
                onMenuSelect?.(item.name);
              }
            }}
          >
            {/* Force it to line up evenly */}
            {item.toggle === undefined ? (
              <>
                {Icon && (
                  <Icon
                    width={item.iconSize || 10}
                    height={item.iconSize || 10}
                    style={{ marginRight: 7, width: item.iconSize || 10 }}
                  />
                )}
                <Text title={item.tooltip}>{item.text}</Text>
                <View style={{ flex: 1 }} />
              </>
            ) : (
              <View
                style={{
                  flexDirection: 'row',
                  flex: 1,
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <label htmlFor={String(item.name)} title={item.tooltip}>
                  {item.text}
                </label>
                <Toggle
                  id={String(item.name)}
                  isOn={item.toggle}
                  style={{ marginLeft: 5 }}
                  onToggle={() =>
                    !item.disabled &&
                    !isLabel(item) &&
                    item.toggle !== undefined &&
                    onMenuSelect?.(item.name)
                  }
                />
              </View>
            )}
            {item.key && <Keybinding keyName={item.key} />}
          </Button>
        );
      })}
      {footer}
    </View>
  );
}
