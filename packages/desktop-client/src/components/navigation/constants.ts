// Below this width the pill tabs and the sidebar give way to the
// navigation drawer (design-decisions §2).
export const COMPACT_NAV_WIDTH = 900;

// The title bar is a named size container, so its controls respond to the
// width they actually get rather than the window's: the expanded accounts
// pane takes 236px of it.
export const TITLEBAR_CONTAINER = 'titlebar';

// Below this title bar width the tabs tighten and Help shows only its icon,
// so every control stays on one line. A window under about 1036px with the
// pane expanded lands here; with the rail collapsed it never does.
export const TITLEBAR_TIGHT = `@container ${TITLEBAR_CONTAINER} (width < 800px)`;
