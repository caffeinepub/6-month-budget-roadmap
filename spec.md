# 6-Month Budget Roadmap

## Current State
The app has 5 tabs: Dashboard, Month 1 Roadmap, Months 2–6, Savings & Housing Fund, and Rules of the Road.
- Backend stores: savings amount, housing fund, checking balance, checklist states, grocery/non-essential spending, and notes.
- Dashboard shows: savings status, housing fund progress, checking buffer, and weekly grocery tracker.
- No income tracking or receipt scanning exists.

## Requested Changes (Diff)

### Add
- **Income Tracking tab** with:
  - "Add Income" button opening a modal/form for manual entry (amount, date, category)
  - File upload (paystub/photo) with automatic amount + date extraction (client-side parsing or OCR-lite via image text)
  - Categories: Social Security, Tamara Job Income, Other Income
  - Income history list
  - Monthly income total displayed
- **Receipt Scanning tab** with:
  - "Upload Receipt" (file) and "Take Photo" (camera) buttons
  - Amount + date extraction from image
  - Auto-categorization into Bills (Credit Card, Auto Insurance, Utilities, Loans, Other) and Household Goods (Groceries, Clothing, Healthcare Goods, Gas, Fast Food)
  - Manual category change allowed
  - Receipt history list
  - Adds amount to weekly and monthly totals
- **Backend**: new endpoints for storing income entries and receipt entries, and querying monthly/weekly totals for both
- **Dashboard updates**: add new summary cards for Income (monthly total), Bills total, Household Goods total, Weekly spending, Monthly spending — all pulled from backend

### Modify
- App.tsx: add two new tabs (Income Tracking, Receipts) to the tab bar (now 7 tabs)
- DashboardTab.tsx: add income, bills, household goods, weekly spending, and monthly spending summary cards using new backend queries

### Remove
- Nothing removed

## Implementation Plan
1. Generate Motoko backend with income entry storage (amount, date, category, id) and receipt entry storage (amount, date, category, subcategory, id), plus query functions for monthly/weekly totals
2. Select camera component for "Take Photo"
3. Build IncomeTab component: form modal, file upload (extract amount/date from filename or manual), category picker, history list, monthly total
4. Build ReceiptsTab component: upload + camera buttons, manual category/subcategory picker, history list, weekly + monthly totals
5. Update DashboardTab to show income, bills, household goods, weekly spending, monthly spending cards
6. Update App.tsx to add the two new tabs

## UX Notes
- Keep existing tabs exactly as-is — no changes to Month 1, Months 2–6, Savings, or Rules tabs
- New tabs appear after existing 5 tabs (Income and Receipts)
- Image OCR is not available natively; use manual entry as primary flow, with file upload as convenience (user confirms extracted data)
- Tone: simple, supportive, clear — no jargon
- Tab bar scrolls horizontally on mobile to accommodate 7 tabs
