# Owner budget import verification

Checked October 3, 2026 against `redesign/main` at `da94d2471`, with a
browser build on macOS served at `http://127.0.0.1:3016`.

## Result

A full YNAB API JSON export was imported through the existing nYNAB
importer. The community exporter was unavailable, so an existing authorized
YNAB API connection supplied the read-only export. YNAB and the original
application data were not modified.

The owner opened the same YNAB budget in the browser for a direct
comparison with the release copy. These checks passed:

- All account balances and open/closed states match.
- Parent transaction counts, split transaction counts and transfer links
  match the source.
- Monthly Assigned values match throughout the imported history.
- Current category Assigned and Available values match, including hidden
  categories. YNAB's Available summary includes its credit card payment
  reserves; excluding those reserves produces Actual's category total.
- Normal payees and scheduled transaction counts match.
- An Actual-format ZIP of the same imported snapshot was independently
  restored through the Actual API; account balances, transactions, splits
  and schedules survived the round trip.
- Reloading the release page reopened the saved budget; its month totals
  remained unchanged.

Ready to Assign differs between the two applications. The entire
difference reconciles to future assignments deducted by the live YNAB
screen, the excess of YNAB's card payment reserves over card debt, and
uncategorized outflows excluded from Actual's budget calculations. The
YNAB API's monthly Ready to Assign field also differs from its live screen
because the screen deducts future assignments. This does not indicate
missing imported transactions.

Existing uncategorized expenses still need categorization. No current
expense category is overspent. This check does not establish that every
YNAB feature is supported, or approve replacing YNAB for daily budgeting.
The remaining edit/undo, split/reconcile, theme and navigation walkthrough
in [release step 3](release.md#3-check-it-on-a-copy-of-your-ynab-budget)
remains pending.

## Keeping and restoring the private budget

The release budget lives in browser storage, separate from Git. Actual
requests persistent storage and reopens the last budget, but a browser may
deny persistence and the user can still clear site data. Keep using the
same browser, profile and release port.

A private Actual ZIP and original YNAB JSON are retained locally under
`data/redesign/private-budget/`, already covered by the root `/data/*`
ignore rule. Neither is served by the app or included in a Git commit.
Restore the ZIP through **Import file** → **Actual** in the budget list.
Use a fresh browser profile to restore a separate copy. An Actual archive
retains its budget ID, so importing into a profile that already contains
that budget replaces its data; export newer work first. Export new ZIPs
after subsequent work; this backup covers the import only.

This public record contains no personal account names, budget identifiers,
payees, transactions, dollar amounts, credentials or financial screenshots.
