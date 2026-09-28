import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import { Button } from './Button';

const meta = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    onClick: { action: 'clicked' },
  },
  args: { onClick: fn() },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    variant: 'primary',
    bounce: false,
    children: 'Button Text',
  },
  parameters: {
    docs: {
      description: {
        story: `
Primary button variant uses the following theme CSS variables:
  - \`--color-buttonPrimaryText\`
  - \`--color-buttonPrimaryTextHover\`
  - \`--color-buttonPrimaryBackground\`
  - \`--color-buttonPrimaryBackgroundHover\`
  - \`--color-buttonPrimaryBorder\`
  - \`--color-buttonPrimaryShadow\`
  - \`--color-buttonPrimaryDisabledText\`
  - \`--color-buttonPrimaryDisabledBackground\`
  - \`--color-buttonPrimaryDisabledBorder\`
`,
      },
    },
  },
};

export const Normal: Story = {
  args: {
    variant: 'normal',
    bounce: false,
    children: 'Button Text',
  },
  parameters: {
    docs: {
      description: {
        story: `
Normal button variant uses the following theme CSS variables:
  - \`--color-buttonNormalText\`
  - \`--color-buttonNormalTextHover\`
  - \`--color-buttonNormalBackground\`
  - \`--color-buttonNormalBackgroundHover\`
  - \`--color-buttonNormalBorder\`
  - \`--color-buttonNormalShadow\`
  - \`--color-buttonNormalSelectedText\`
  - \`--color-buttonNormalSelectedBackground\`
  - \`--color-buttonNormalDisabledText\`
  - \`--color-buttonNormalDisabledBackground\`
  - \`--color-buttonNormalDisabledBorder\`
`,
      },
    },
  },
};

export const Bare: Story = {
  args: {
    variant: 'bare',
    bounce: false,
    children: 'Button Text',
  },
  parameters: {
    docs: {
      description: {
        story: `
Bare button variant uses the following theme CSS variables:
  - \`--color-buttonBareText\`
  - \`--color-buttonBareTextHover\`
  - \`--color-buttonBareBackground\`
  - \`--color-buttonBareBackgroundHover\`
  - \`--color-buttonBareBackgroundActive\`
  - \`--color-buttonBareDisabledText\`
  - \`--color-buttonBareDisabledBackground\`
`,
      },
    },
  },
};

export const Control: Story = {
  args: {
    variant: 'control',
    children: 'Today',
  },
  parameters: {
    docs: {
      description: {
        story: `
Redesign control (month stepper, Today, icon buttons). Opt-in; uses:
  - \`--color-controlBackground\`
  - \`--color-cardHairline\`
  - \`--color-tableRowHover\` (hover)
  - \`--color-navActive\` (pressed)
  - \`--color-pageText\` (disabled is dimmed with opacity)
  - \`--color-selectionBorder\` (keyboard focus ring)
`,
      },
    },
  },
};

export const Tab: Story = {
  args: {
    variant: 'tab',
    children: 'Reports',
  },
  parameters: {
    docs: {
      description: {
        story: `
Redesign pill-navigation tab. Opt-in; uses \`--color-pageTextSubdued\`,
\`--color-pageText\`, \`--color-tableRowHover\` and \`--color-selectionBorder\`.
`,
      },
    },
  },
};

export const TabSelected: Story = {
  args: {
    variant: 'tabSelected',
    children: 'Budget',
    'aria-current': 'page',
  },
  parameters: {
    docs: {
      description: {
        story: `
Selected pill-navigation tab. Set \`aria-current\` (or \`aria-pressed\`) so the
state is not conveyed by color alone. Uses \`--color-navActive\` and
\`--color-navActiveShadow\`.
`,
      },
    },
  },
};
