# 6-Month Budget Roadmap

## Current State

The app has a full-featured backend (`main.mo`) with:
- Account CRUD (`addAccount`, `updateAccount`, `deleteAccount`, `getAllAccounts`, `getAccount`)
- Income tracking (`addIncomeEntry`, `deleteIncomeEntry`, `getAllIncomeEntries`)
- Receipt tracking (`addReceiptEntry`, `deleteReceiptEntry`, `updateReceiptCategory`, `getAllReceiptEntries`)
- Financial overview, savings, housing fund, checklist, grocery/non-essential spending

The frontend has:
- `AccountsTab.tsx` — full UI for create/edit/delete accounts, wired to `useAddAccount`, `useUpdateAccount`, `useDeleteAccount`, `useAllAccounts`
- `IncomeTab.tsx` — Add Income form with required "To Account" dropdown
- `ReceiptsTab.tsx` — Add Receipt form with required "From Account" dropdown
- `useQueries.ts` — hooks that call the correct backend methods

**Root problem:** The backend uses `nextId.toText()` on an `Int` value. In Motoko, `Int` does not have a `.toText()` instance method — the correct call is `Int.toText(nextId)` (requires importing `Int`). This causes a compile error, preventing any account (or income/receipt entry) from being saved. The entire account system silently fails.

## Requested Changes (Diff)

### Add
- Import `Int "mo:core/Int"` in `main.mo`

### Modify
- Replace every `nextId.toText()` call with `Int.toText(nextId)` so IDs are generated correctly

### Remove
- Nothing — no other logic, UI, or behavior changes

## Implementation Plan

1. Add `import Int "mo:core/Int"` to the top of `main.mo`
2. Replace all three occurrences of `nextId.toText()` with `Int.toText(nextId)` in `main.mo`
3. Validate the build compiles cleanly
