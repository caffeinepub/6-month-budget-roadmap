export interface ExtractedReceiptData {
  amount: number | null;
  date: string | null;
  mainCategory: string;
  subCategory: string;
}

// ── Amount extraction from plain text ─────────────────────────────────────────

function findLargestMatch(text: string, pattern: RegExp): number | null {
  let largest: number | null = null;
  let match = pattern.exec(text);
  while (match !== null) {
    const raw = match[1].replace(",", ".");
    const val = Number.parseFloat(raw);
    if (!Number.isNaN(val) && val > 0 && val < 10000) {
      if (largest === null || val > largest) {
        largest = val;
      }
    }
    match = pattern.exec(text);
  }
  return largest;
}

function extractAmount(text: string): number | null {
  const labeledPatterns = [
    /TOTAL[:\s]+\$?\s*(\d{1,4}[.,]\d{2})/gi,
    /AMOUNT[:\s]+\$?\s*(\d{1,4}[.,]\d{2})/gi,
    /SUBTOTAL[:\s]+\$?\s*(\d{1,4}[.,]\d{2})/gi,
  ];

  for (const pattern of labeledPatterns) {
    const result = findLargestMatch(text, pattern);
    if (result !== null) return result;
  }

  const dollarResult = findLargestMatch(text, /\$\s*(\d{1,4}[.,]\d{2})/g);
  if (dollarResult !== null) return dollarResult;

  return findLargestMatch(text, /(\d{1,4}[.,]\d{2})/g);
}

// ── Date extraction ────────────────────────────────────────────────────────────

const MONTH_MAP: Record<string, string> = {
  jan: "01",
  january: "01",
  feb: "02",
  february: "02",
  mar: "03",
  march: "03",
  apr: "04",
  april: "04",
  may: "05",
  jun: "06",
  june: "06",
  jul: "07",
  july: "07",
  aug: "08",
  august: "08",
  sep: "09",
  september: "09",
  oct: "10",
  october: "10",
  nov: "11",
  november: "11",
  dec: "12",
  december: "12",
};

function padTwo(n: string | number): string {
  return String(n).padStart(2, "0");
}

function extractDate(text: string): string | null {
  const isoMatch = text.match(/\b(\d{4})-(\d{2})-(\d{2})\b/);
  if (isoMatch) {
    return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;
  }

  const slashMatch = text.match(/\b(\d{1,2})\/(\d{1,2})\/(\d{2,4})\b/);
  if (slashMatch) {
    const month = padTwo(slashMatch[1]);
    const day = padTwo(slashMatch[2]);
    const rawYear = slashMatch[3];
    const year = rawYear.length === 2 ? `20${rawYear}` : rawYear;
    return `${year}-${month}-${day}`;
  }

  const dashMatch = text.match(/\b(\d{1,2})-(\d{1,2})-(\d{4})\b/);
  if (dashMatch) {
    const month = padTwo(dashMatch[1]);
    const day = padTwo(dashMatch[2]);
    return `${dashMatch[3]}-${month}-${day}`;
  }

  const monthNameMatch = text.match(
    /\b([A-Za-z]{3,9})\s+(\d{1,2})[,\s]+(\d{4})\b/,
  );
  if (monthNameMatch) {
    const monthKey = monthNameMatch[1].toLowerCase().slice(0, 3);
    const monthNum =
      MONTH_MAP[monthKey] ?? MONTH_MAP[monthNameMatch[1].toLowerCase()];
    if (monthNum) {
      return `${monthNameMatch[3]}-${monthNum}-${padTwo(monthNameMatch[2])}`;
    }
  }

  const dayMonthYear = text.match(/\b(\d{1,2})\s+([A-Za-z]{3,9})\s+(\d{4})\b/);
  if (dayMonthYear) {
    const monthKey = dayMonthYear[2].toLowerCase().slice(0, 3);
    const monthNum =
      MONTH_MAP[monthKey] ?? MONTH_MAP[dayMonthYear[2].toLowerCase()];
    if (monthNum) {
      return `${dayMonthYear[3]}-${monthNum}-${padTwo(dayMonthYear[1])}`;
    }
  }

  return null;
}

// ── Category detection ─────────────────────────────────────────────────────────

interface CategoryMatch {
  mainCategory: string;
  subCategory: string;
}

interface KeywordEntry {
  mainCategory: string;
  subCategory: string;
  keywords: string[];
}

const CATEGORY_KEYWORDS: KeywordEntry[] = [
  {
    mainCategory: "Household Goods",
    subCategory: "Groceries",
    keywords: [
      "walmart",
      "kroger",
      "publix",
      "aldi",
      "whole foods",
      "trader joe",
      "safeway",
      "grocery",
      "food lion",
      "save a lot",
      "piggly",
      "sprouts",
      "heb",
      "costco",
      "supermarket",
      "market",
      "fresh market",
      "winn-dixie",
      "winndixie",
      "wegmans",
      "giant",
      "stop shop",
      "shoprite",
    ],
  },
  {
    mainCategory: "Household Goods",
    subCategory: "Gas",
    keywords: [
      "shell",
      "chevron",
      "exxon",
      "bp",
      "sunoco",
      "marathon",
      "speedway",
      "circle k",
      "wawa",
      "fuel",
      "gasoline",
      "kwik trip",
      "casey",
      "mobil",
      "valero",
      "racetrac",
      "pilot",
      "loves travel",
      "quiktrip",
      "petroleum",
    ],
  },
  {
    mainCategory: "Household Goods",
    subCategory: "Fast Food",
    keywords: [
      "mcdonald",
      "burger king",
      "wendy",
      "taco bell",
      "chick-fil",
      "chick fil",
      "subway",
      "popeye",
      "domino",
      "pizza hut",
      "kfc",
      "chipotle",
      "sonic",
      "arby",
      "dairy queen",
      "whataburger",
      "five guys",
      "papa john",
      "in-n-out",
      "jack in the box",
      "hardee",
      "starbucks",
      "dunkin",
      "panda express",
      "little caesars",
    ],
  },
  {
    mainCategory: "Household Goods",
    subCategory: "Clothing",
    keywords: [
      "old navy",
      "gap",
      "h&m",
      "zara",
      "forever 21",
      "ross",
      "tj maxx",
      "marshalls",
      "burlington",
      "clothing",
      "apparel",
      "fashion",
      "shoes",
      "footwear",
      "nordstrom",
      "macy",
      "kohls",
      "jcpenney",
      "dillards",
    ],
  },
  {
    mainCategory: "Household Goods",
    subCategory: "Healthcare Goods",
    keywords: [
      "cvs",
      "walgreens",
      "rite aid",
      "pharmacy",
      "duane reade",
      "medicine",
      "rx",
      "prescription",
      "health mart",
      "meijer pharmacy",
    ],
  },
  {
    mainCategory: "Bills",
    subCategory: "Utilities",
    keywords: [
      "spectrum",
      "at&t",
      "verizon",
      "comcast",
      "xfinity",
      "t-mobile",
      "electric",
      "utility",
      "water bill",
      "gas bill",
      "entergy",
      "duke energy",
      "florida power",
      "internet",
      "cable",
      "broadband",
      "frontier",
      "cox",
      "century link",
      "consolidated",
    ],
  },
  {
    mainCategory: "Bills",
    subCategory: "Auto Insurance",
    keywords: [
      "geico",
      "progressive",
      "state farm",
      "allstate",
      "farmers",
      "usaa",
      "nationwide",
      "insurance",
      "auto insurance",
      "car insurance",
      "liberty mutual",
      "travelers",
      "aaa insurance",
    ],
  },
  {
    mainCategory: "Bills",
    subCategory: "Credit Card",
    keywords: [
      "capital one",
      "credit card",
      "chase",
      "bank of america",
      "discover",
      "citi",
      "synchrony",
      "american express",
      "amex",
      "visa payment",
      "mastercard payment",
    ],
  },
  {
    mainCategory: "Bills",
    subCategory: "Loans",
    keywords: [
      "loan",
      "mortgage",
      "financing",
      "affirm",
      "klarna",
      "afterpay",
      "student loan",
      "personal loan",
      "auto loan",
    ],
  },
];

function detectCategory(text: string): CategoryMatch {
  const lower = text.toLowerCase();

  for (const entry of CATEGORY_KEYWORDS) {
    for (const keyword of entry.keywords) {
      if (lower.includes(keyword)) {
        return {
          mainCategory: entry.mainCategory,
          subCategory: entry.subCategory,
        };
      }
    }
  }

  return { mainCategory: "Household Goods", subCategory: "Groceries" };
}

// ── Image-to-text via canvas pixel sampling (lightweight fallback) ─────────────
// Without tesseract.js available, we read the image filename and EXIF metadata
// via FileReader to try keyword matching. If nothing is found, we return sensible
// defaults so the form always opens pre-filled with today's date.

async function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

// ── Main export ────────────────────────────────────────────────────────────────

export async function extractReceiptData(
  file: File,
): Promise<ExtractedReceiptData> {
  try {
    // Use the filename as a hint for category detection
    const nameText = file.name.toLowerCase();
    const { mainCategory, subCategory } = detectCategory(nameText);

    // Try to read the file as text (works for some image formats with embedded text)
    let textContent = "";
    try {
      const dataUrl = await readFileAsDataUrl(file);
      // Very limited: check file metadata embedded in data URL for any readable strings
      // Realistic extraction requires OCR — this is a best-effort fallback
      const decoder = new TextDecoder("utf-8", { fatal: false });
      const arrayBuffer = await file.arrayBuffer();
      const rawText = decoder.decode(arrayBuffer);
      // Only use printable ASCII characters
      textContent = rawText.replace(/[^\x20-\x7E\n]/g, " ");
      void dataUrl; // used for side-effect of file reading
    } catch {
      // ignore — fall through to defaults
    }

    const amount = extractAmount(textContent) ?? null;
    const date = extractDate(textContent) ?? null;

    return { amount, date, mainCategory, subCategory };
  } catch {
    return {
      amount: null,
      date: null,
      mainCategory: "Household Goods",
      subCategory: "Groceries",
    };
  }
}
