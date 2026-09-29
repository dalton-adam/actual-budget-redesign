# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

One responsive web design language serves the browser build, the Electron desktop app, and the Capacitor mobile wrapper (`packages/mobile-client`).

## Users

People managing their own household finances: privacy-minded budgeters, self-hosters, and families who want full control of their money data. They use Actual regularly (often daily or weekly check-ins) on desktop and mobile, mid-workflow: reconciling accounts, categorizing transactions, adjusting envelope budgets, reviewing reports. Many migrated from other budgeting apps and value that Actual is local-first, free, and open-source.

## Product Purpose

Actual Budget is a local-first personal finance tool built around envelope budgeting. It exists so people can track and plan their money without handing data to a third party — everything runs on their own device or server, with optional sync. Success looks like users trusting the numbers, completing routine money tasks quickly, and sticking with their budget over months and years.

## Positioning

This repository is a redesign fork of Actual v26.9.0. It offers YNAB-style envelope budgeting (every dollar assigned to an envelope, Ready to Assign as the central figure) on Actual's existing local-first engine. The redesign changes how the product looks and flows, not what it calculates or where data lives.

## Capabilities and Constraints

- Preserve the envelope budgeting workflow, all existing financial calculations, and all back-end behavior. The redesign is front-end only.
- Preserve custom themes. The built-in light, dark, and midnight themes are all first-class.
- Every existing destination must stay reachable. New UI state (such as panel open/collapsed) is device-local, never a new stored or synced preference.
- Owner-approved decisions live in `docs/redesign/design-decisions.md`, and task status lives in `docs/redesign/backlog.md`. Where they differ from this file on visual matters, the decisions record wins.

## Evidence on Hand

- The built-in demo budget (**Try the demo**) and synthetic test fixtures are the only data sources for screenshots, prototypes, and tests.
- The repository is public. Never commit real budget exports, personal screenshots, or real financial data, and never invent customer testimonials or usage claims.

## Brand Personality

Calm, trustworthy, practical. The interface should feel like a dependable tool that stays out of the way: quiet confidence, no flash, no urgency theatrics. Money is stressful enough — the UI's job is to make it feel manageable and under control.

## Anti-references

- Fintech-startup gloss: gradient heroes, glassmorphism, crypto-dashboard neon.
- Corporate banking UI: navy-and-gold, enterprise-portal density, legalese energy.

## Design Principles

- **The numbers are the interface.** Financial figures are the primary content; typography, alignment, and tabular numerals serve legibility of amounts above all decoration.
- **Trust through restraint.** No visual tricks that could make users doubt what they're seeing. Boring and correct beats clever.
- **Fast routine, gentle depth.** Everyday tasks (categorize, reconcile, budget) must be frictionless; power features reveal themselves progressively without cluttering the default view.
- **Local-first honesty.** The UI reflects the product's values: no dark patterns, no upsells, no attention-grabbing — the user owns the tool, not the other way around.
- **Consistent across surfaces.** Desktop, web, and mobile share one design language via the shared component library; new work reuses existing components and theme tokens.

## Accessibility & Inclusion

Target WCAG 2.1 AA: sufficient contrast in all themes (light, dark, midnight), full keyboard navigation, respect for reduced-motion preferences, and color-blind-safe use of color (never color alone to convey positive/negative amounts).
