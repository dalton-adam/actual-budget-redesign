# Actual Budget redesign fork

This fork starts from Actual **v26.9.0**, commit `59fe126f637d858c061e1eeedbef5436c8f2225a`.
The working integration branch is `redesign/main`; `upstream` points to the official project.

Start with [the redesign handbook](docs/redesign/README.md).
The approved direction is YNAB-style envelope budgeting with a Copilot Money-inspired look: rounded cards, category accent colors, progress bars and status pills, and an optional category details panel. See the [Copilot concepts](docs/redesign/design-concepts/copilot/).

The redesign must preserve custom themes, the envelope budgeting workflow, existing financial calculations, and all back-end behavior. No application implementation has changed during Stage 0.

This repository is public. Only source, design references with fictional data, and synthetic test evidence belong here. Keep real budget exports and personal screenshots out of the repository.
