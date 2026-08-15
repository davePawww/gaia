# WealthCompass authenticated smoke test

Last run: 2026-08-15

- Environment: production (`https://gaia-wealth-compass.vercel.app`)
- Deployment: Vercel `dpl_3ej4ogaZZrwtygK6cbMK3CaNCq5T`
- Commit: `678471c5a0a0f2483121335c037c4fdb0dbfb8fe`
- Session: signed-in WealthCompass account
- Browser: Brave via the connected external browser

## Repeatable checklist

Run this checklist against a non-production test account where possible. Record the deployment URL, commit, browser, date, account type, and console result before starting. Use small test amounts and delete all test transactions and goals at the end.

| Area | Result | Evidence / notes |
| --- | --- | --- |
| Sign-up | Not run | Requires creating a separate account and, if applicable, completing its email/authentication flow. |
| Sign-in | Partial | An existing authenticated session loaded `/dashboard` and showed the signed-in user. Credentials were not re-entered in this run. |
| Jar initialization | Pass | Dashboard loaded six jars with the expected default percentages and zero balances. |
| Income allocation | Pass | Allocated `$1.00`; six income transactions were created and balances reflected the 55/10/10/10/10/5 split. |
| Withdrawal | Pass | Withdrew `$0.10` from NEC with a note; balance and spending insight updated. |
| Transfer | Pass | Transferred `$0.05` from FFA to LTSS with a note; both balances updated. |
| Add to jar | Pass | Added `$0.10` directly to NEC with a note; transaction and balance updated. |
| Goals | Pass | Created a `$99.99` net-worth goal, verified its card/progress, then deleted it. |
| Settings | Pass | Saved an income-allocation reminder preference, verified the saved state, then restored the original value. Currency/profile/settings rendered correctly. |
| Insights | Pass | Insights loaded authenticated spending totals, breakdown, trends tabs, and comparison data. |
| Export | Pass | Export dialog opened and CSV download completed with the in-app `Exported 9 transactions` confirmation. Field-level export acceptance remains tracked separately in MY-206. |
| Representative error | Pass | Attempting to withdraw `$0.01` from a zero-balance jar displayed `Insufficient balance` without creating a transaction. |
| Ownership isolation | Not run | Needs a second account and a deliberate cross-account access attempt; do not use the primary account for this check. |
| Browser console | Pass with known blocker | No additional visible errors occurred during the authenticated flows. Push subscription continues to be rejected by Brave's push service; Settings reports `Blocked by browser settings`. |

## Cleanup verification

The run created nine temporary transactions and one temporary goal. All were deleted through the production UI. A final dashboard check showed:

- Net Worth: `$0.00`
- Total Allocated: `$0.00`
- Transactions: `0`
- No goals

## Remaining follow-up

Create an isolated test account to complete credential-based sign-up/sign-in and ownership checks. Keep those results separate from the primary user's financial data. Push delivery also needs Brave's `Use Google Services for Push Messaging` setting enabled before it can be validated end-to-end.
