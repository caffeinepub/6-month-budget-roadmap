# 6-Month Budget Roadmap

## Current State
- Full backend exists with `addReceiptEntry`, `getAllReceiptEntries`, `updateReceiptCategory`, `getAllAccounts`, etc.
- ReceiptsTab has "Upload Receipt", "Take Photo", and "Add Manually" buttons.
- Upload/camera capture an image and open a form dialog -- but the form is always blank; no extraction is attempted.
- The form already has all fields: amount, date, mainCategory, subCategory, fromAccount, note.
- Backend deducts from account and saves to history when `addReceiptEntry` is called.

## Requested Changes (Diff)

### Add
- Client-side OCR using Tesseract.js to extract amount and date from uploaded/photographed receipt images.
- Auto-categorization logic: keyword matching on OCR text to guess Bills or Household Goods and the matching subcategory (Groceries, Gas, Utilities, etc.).
- An "Extracting..." loading state shown while OCR runs so the user knows something is happening.
- Pre-fill the ReceiptFormDialog with extracted amount, date, mainCategory, and subCategory -- all fields remain editable.

### Modify
- `handleFileChange` and `handleCameraCapture` in ReceiptsTab: after receiving the image file, run Tesseract OCR, extract amount/date, auto-categorize, then open the form pre-filled.
- `ReceiptFormDialog`: accept optional `initialValues` prop so it can be pre-filled when opened from an image source.
- Show a visual "Reading receipt..." spinner overlay while OCR is running, between image capture and form open.

### Remove
- Nothing removed. No changes to backend, other tabs, roadmap, checklists, accounts tab, dashboard, or any other component.

## Implementation Plan
1. Install `tesseract.js` via pnpm in the frontend package.
2. Create a `src/utils/receiptOcr.ts` utility that:
   - Accepts a File or Blob
   - Runs Tesseract OCR (English)
   - Parses the resulting text for dollar amounts (regex: `\$\d+\.?\d*` or `\d+\.\d{2}`) -- picks the largest value as the receipt total
   - Parses dates in common formats (MM/DD/YYYY, YYYY-MM-DD, Mon DD YYYY)
   - Applies keyword-to-category mapping (e.g. "grocery", "walmart", "kroger" → Groceries; "shell", "chevron", "gas" → Gas; "at&t", "spectrum", "verizon" → Utilities; "insurance" → Auto Insurance; etc.)
   - Returns `{ amount: number | null, date: string | null, mainCategory, subCategory }`
3. In `ReceiptsTab`, add an `isExtracting` boolean state. When a file is received:
   - Set `isExtracting = true`, show overlay on the action button area
   - Call `extractReceiptData(file)`
   - Set `isExtracting = false`, populate `initialValues`, open form dialog
4. Update `ReceiptFormDialog` to accept and apply `initialValues` on open (useEffect on open change).
5. Validate that the form still works for "Add Manually" (no image, no pre-fill).
6. Run typecheck and build to confirm no errors.
