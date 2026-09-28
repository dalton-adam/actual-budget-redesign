import type { ReactNode } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import { Button } from './Button';
import { CategoryTile } from './CategoryTile';
import { ProgressBar } from './ProgressBar';
import { StatusPill, StatusPillButton } from './StatusPill';
import { styles } from './styles';
import { SurfaceCard } from './SurfaceCard';
import { theme } from './theme';
import { View } from './View';

const meta = {
  title: 'Redesign/State preview',
  parameters: {
    layout: 'padded',
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View style={{ gap: 6 }}>
      <View style={{ fontSize: 12, color: theme.pageTextFaint }}>{label}</View>
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 10,
        }}
      >
        {children}
      </View>
    </View>
  );
}

const LONG_NAME =
  'Home maintenance and unexpected repairs for the old farmhouse';

export const AllStates: Story = {
  render: () => (
    <View
      style={{
        gap: 20,
        padding: 20,
        maxWidth: 760,
        backgroundColor: theme.pageBackground,
        color: theme.pageText,
        // The app sets this on body; Storybook does not.
        fontFamily: "'Inter Variable', -apple-system, 'Segoe UI', sans-serif",
      }}
    >
      <Row label="Control buttons: default, disabled, icon">
        <Button variant="control" onPress={fn()}>
          Today
        </Button>
        <Button variant="control" isDisabled>
          Today
        </Button>
        <Button variant="control" aria-label="Previous month">
          ‹
        </Button>
        <Button variant="control" aria-label="Next month">
          ›
        </Button>
      </Row>

      <Row label="Pill navigation: selected, default, disabled">
        <View
          role="navigation"
          aria-label="Preview navigation"
          style={{
            flexDirection: 'row',
            gap: 2,
            padding: 3,
            borderRadius: 13,
            backgroundColor: theme.navTrack,
            border: `1px solid ${theme.cardHairline}`,
          }}
        >
          <Button variant="tabSelected" aria-current="page">
            Budget
          </Button>
          <Button variant="tab">Accounts ▾</Button>
          <Button variant="tab">Reports</Button>
          <Button variant="tab" isDisabled>
            Schedules
          </Button>
        </View>
      </Row>

      <Row label="Status pills (static and interactive) and badges">
        <StatusPill tone="positive">$360.00</StatusPill>
        <StatusPill tone="neutral">$0.00</StatusPill>
        <StatusPill tone="negative">−$42.18</StatusPill>
        <StatusPill tone="warning">◎ $110.00</StatusPill>
        <StatusPillButton
          tone="positive"
          aria-label="Available $120. Open balance menu"
          onPress={fn()}
        >
          $120.00
        </StatusPillButton>
        <StatusPillButton
          tone="negative"
          aria-label="Overspent by $1,204.55. Open balance menu"
          isDisabled
        >
          −$1,204.55
        </StatusPillButton>
        <StatusPill tone="neutral" size="small">
          All assigned
        </StatusPill>
        <StatusPill tone="negative" size="small">
          Overassigned
        </StatusPill>
      </Row>

      <Row label="Category tiles: accents 1–10, neutral, emoji, 30px">
        {Array.from({ length: 10 }, (_, i) => (
          <CategoryTile
            key={i}
            name={`${'GRTUSDEVHM'[i]}`}
            accentIndex={i + 1}
          />
        ))}
        <CategoryTile name="Income" />
        <CategoryTile name="🏠 Home" accentIndex={4} />
        <CategoryTile name="Groceries" accentIndex={2} size={30} />
      </Row>

      <View style={{ fontSize: 12, color: theme.pageTextFaint }}>
        Progress bars: 0%, 40%, 100% overspent, clamped &gt;100%, 5px goal bar
      </View>
      <View style={{ gap: 10, maxWidth: 240 }}>
        <ProgressBar value={0} color={theme.categoryAccent1} />
        <ProgressBar value={0.4} color={theme.categoryAccent2} />
        <ProgressBar
          value={1}
          color={theme.pillNegativeText}
          aria-label="Dining out activity, overspent"
        />
        <ProgressBar value={3.2} color={theme.categoryAccent5} />
        <ProgressBar value={0.49} color={theme.pillWarningText} height={5} />
      </View>

      <Row label="Surface cards, including a long label">
        <SurfaceCard style={{ padding: '16px 18px', width: 220 }}>
          <View style={{ fontSize: 12.5, color: theme.pageTextSecondary }}>
            Assigned
          </View>
          <View
            style={{
              fontSize: 26,
              fontWeight: 700,
              marginTop: 4,
              ...styles.tnum,
            }}
          >
            $4,200.00
          </View>
          <View style={{ fontSize: 12, color: theme.pageTextFaint }}>
            across 9 categories
          </View>
        </SurfaceCard>
        <SurfaceCard
          style={{
            padding: 12,
            width: 260,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <CategoryTile name={LONG_NAME} accentIndex={7} />
          <View
            style={{
              flex: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              display: 'block',
            }}
            title={LONG_NAME}
          >
            {LONG_NAME}
          </View>
          <StatusPill tone="positive">$1,234,567.89</StatusPill>
        </SurfaceCard>
      </Row>
    </View>
  ),
};
