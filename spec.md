# 6-Month Budget Roadmap

## Current State

The app has:
- Dashboard, Month 1 roadmap, Months 2-6 plan, Savings/Housing tab, Rules tab, Income tab, Receipts tab, Weekly Summary tab
- Backend stores income entries (id, amount, date, category, note, user) and receipt entries (id, amount, date, mainCategory, subCategory, note, user)
- Shared user toggle (Christopher / Tamara) in the header
- Financial overview: savingsAmount, housingFund, checkingBalance as flat scalars in the backend
- Income entries and receipt entries do NOT currently reference which bank/credit account the money goes into or out of

## Requested Changes (Diff)

### Add
- Account management: users can create, edit, and delete named accounts (e.g. "Fairwinds Checking," "McCoy Checking," "Emergency Savings," credit cards)
- Each account has: id, name, type (Checking / Savings / Credit Card / Other), balance (Float)
- New "Accounts" tab in the app displaying all accounts with their balances, plus buttons to add/edit/delete
- When adding income: a required "To Account" dropdown lists all accounts; selected account balance is increased by the income amount
- When adding a receipt/expense: a required "From Account" dropdown lists all accounts; selected account balance is decreased by the expense amount
- Income and receipt entries store the accountId of the linked account
- Backend: addAccount, updateAccount, deleteAccount, getAllAccounts, getAccount
- Backend: addIncomeEntry and addReceiptEntry accept an accountId param and auto-update that account's balance
- Frontend: AccountsTab component for CRUD management of accounts
- Frontend: account selector dropdown wired into IncomeTab (Add Income dialog) and ReceiptsTab (Add Receipt form dialog)

### Modify
- addIncomeEntry backend function: add accountId parameter, increase account balance by amount
- addReceiptEntry backend function: add accountId parameter, decrease account balance by amount
- IncomeTab: add "To Account" select field in the Add Income dialog
- ReceiptsTab: add "From Account" select field in the Receipt Form dialog
- App.tsx: add Accounts tab (9th tab)
- useQueries.ts: add account query hooks; update addIncomeEntry and addReceiptEntry hooks to accept accountId
- backend.d.ts: updated types for accounts and updated income/receipt entry signatures

### Remove
- Nothing removed

## Implementation Plan
1. Generate updated Motoko backend with Account type and updated Income/Receipt entry functions
2. Add account query hooks and updated income/receipt hooks to useQueries.ts
3. Create AccountsTab.tsx with add/edit/delete account UI
4. Update IncomeTab.tsx Add Income dialog with "To Account" selector
5. Update ReceiptsTab.tsx form dialog with "From Account" selector
6. Add AccountsTab to App.tsx (9th tab)

## UX Notes
- Account selector is required when adding income or expense; show validation error if not selected
- Accounts tab shows balance for each account, clearly labeled by type
- When deleting an account, confirm before deleting
- Default accounts tab is empty with a prompt to create the first account
- Account type options: Checking, Savings, Credit Card, Other
