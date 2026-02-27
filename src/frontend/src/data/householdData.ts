// ─── Household constants ────────────────────────────────────────────────────

export const HOUSEHOLD = {
  adults: ["Christopher", "Tamara"],
  kids: 3,
  savingsFloor: 7500,
  savingsStart: 10563,
  checkingBuffer: 100,
  weeklyGroceryTarget: { min: 90, max: 95 },
  weeklyNonEssentialLimit: { min: 30, max: 50 },
  cashAppResumeCap: { min: 25, max: 50 },
  housingFundGoal: 7000,
  housingFundMin: 6000,
  housingFundMax: 8000,
  maxRent: 2500,
  monthlyGroceryBudget: 375,
} as const;

// ─── Week definitions ─────────────────────────────────────────────────────────

export type WeekId = "week0" | "week1" | "week2" | "week3" | "week4";

export interface ChecklistTask {
  id: string;
  label: string;
  amount?: number;
  deadline?: string;
  note?: string;
}

export interface WeekData {
  id: WeekId;
  label: string;
  dateRange: string;
  groceryTarget: number;
  groceryNote?: string;
  tasks: ChecklistTask[];
  weekTotal?: number;
}

export const WEEKS: WeekData[] = [
  {
    id: "week0",
    label: "Freeze & Prepare",
    dateRange: "Feb 25–28, 2026",
    groceryTarget: 0,
    groceryNote: "Minimize grocery spending this week",
    tasks: [
      { id: "freeze_spending", label: "Freeze discretionary spending" },
      { id: "pause_cashapp", label: "Pause Cash App transfers" },
      { id: "wait_ss", label: "Wait for SS deposit (~Feb 27–28)" },
    ],
  },
  {
    id: "week1",
    label: "Big Payment Week",
    dateRange: "Feb 27–Mar 5, 2026",
    groceryTarget: 190,
    weekTotal: 3525.26,
    tasks: [
      { id: "spectrum", label: "Spectrum (Internet)", amount: 452.4 },
      { id: "spectrum_mobile", label: "Spectrum Mobile", amount: 185.86 },
      { id: "cashapp_payment", label: "Cash App", amount: 24.0 },
      { id: "milestone", label: "Milestone card", amount: 160.0 },
      { id: "credit_one", label: "Credit One card", amount: 159.0 },
      { id: "oil_changes", label: "Oil Changes (2 cars)", amount: 120.0 },
      { id: "groceries_w1", label: "Groceries", amount: 190.0 },
      {
        id: "hvac_tools",
        label: "Tools (HVAC)",
        amount: 2000.0,
        deadline: "March 1",
      },
      { id: "capital_one", label: "Capital One Platinum", amount: 234.0 },
    ],
  },
  {
    id: "week2",
    label: "Insurance & Steady",
    dateRange: "Mar 6–12, 2026",
    groceryTarget: 92,
    tasks: [
      { id: "auto_insurance", label: "Auto Insurance", amount: 242.97 },
      {
        id: "groceries_w2",
        label: "Groceries",
        note: "$90–95 target",
        amount: 92,
      },
    ],
  },
  {
    id: "week3",
    label: "Card & Mobile Week",
    dateRange: "Mar 13–19, 2026",
    groceryTarget: 92,
    tasks: [
      { id: "capital_one_w3", label: "Capital One Platinum", amount: 234.0 },
      { id: "spectrum_mobile_w3", label: "Spectrum Mobile", amount: 185.86 },
      {
        id: "groceries_w3",
        label: "Groceries",
        note: "$90–95 target",
        amount: 92,
      },
    ],
  },
  {
    id: "week4",
    label: "Steady & Review",
    dateRange: "Mar 20–26, 2026",
    groceryTarget: 92,
    tasks: [
      {
        id: "groceries_w4",
        label: "Groceries",
        note: "$90–95 target",
        amount: 92,
      },
      { id: "review_utilities", label: "Review utilities" },
      { id: "maintain_buffer", label: "Maintain buffer ≥ $100" },
    ],
  },
];

export function getCurrentWeekId(): WeekId {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const day = today.getDate();

  if (year < 2026 || (year === 2026 && month === 2 && day < 27)) return "week0";
  if (year === 2026 && month === 2 && day >= 27) return "week1";
  if (year === 2026 && month === 3 && day <= 5) return "week1";
  if (year === 2026 && month === 3 && day <= 12) return "week2";
  if (year === 2026 && month === 3 && day <= 19) return "week3";
  if (year === 2026 && month === 3 && day <= 26) return "week4";
  return "week4";
}

export function getWeekById(id: WeekId): WeekData {
  return WEEKS.find((w) => w.id === id)!;
}

export function getNextWeekId(id: WeekId): WeekId | null {
  const idx = WEEKS.findIndex((w) => w.id === id);
  if (idx === -1 || idx === WEEKS.length - 1) return null;
  return WEEKS[idx + 1].id as WeekId;
}

// ─── Monthly Plan (Months 2–6) ────────────────────────────────────────────────

export type MonthId = "month2" | "month3" | "month4" | "month5" | "month6";

export interface MonthlyTask {
  id: string;
  label: string;
  amount?: string;
}

export interface MonthData {
  id: MonthId;
  label: string;
  dateRange: string;
  milestone?: string;
  tasks: MonthlyTask[];
}

const RECURRING_MONTHLY_TASKS: MonthlyTask[] = [
  { id: "groceries_mo", label: "Groceries", amount: "$375/mo" },
  { id: "spectrum_mobile_mo", label: "Spectrum Mobile", amount: "$185/mo" },
  { id: "insurance_mo", label: "Auto Insurance", amount: "Ongoing" },
  { id: "savings_floor_mo", label: "Keep savings ≥ $7,500" },
  { id: "housing_fund_mo", label: "Add to Housing Fund" },
  { id: "cards_current_mo", label: "Keep cards current" },
  { id: "no_new_debt_mo", label: "No new debt" },
];

export const MONTHS: MonthData[] = [
  {
    id: "month2",
    label: "Month 2 — April",
    dateRange: "Apr 2026",
    tasks: RECURRING_MONTHLY_TASKS.map((t) => ({ ...t, id: `m2_${t.id}` })),
  },
  {
    id: "month3",
    label: "Month 3 — May",
    dateRange: "May 2026",
    milestone:
      "May 28 — HVAC income begins! Start rebuilding savings and housing fund.",
    tasks: RECURRING_MONTHLY_TASKS.map((t) => ({ ...t, id: `m3_${t.id}` })),
  },
  {
    id: "month4",
    label: "Month 4 — June",
    dateRange: "Jun 2026",
    tasks: RECURRING_MONTHLY_TASKS.map((t) => ({ ...t, id: `m4_${t.id}` })),
  },
  {
    id: "month5",
    label: "Month 5 — July",
    dateRange: "Jul 2026",
    tasks: RECURRING_MONTHLY_TASKS.map((t) => ({ ...t, id: `m5_${t.id}` })),
  },
  {
    id: "month6",
    label: "Month 6 — August",
    dateRange: "Aug 2026",
    tasks: RECURRING_MONTHLY_TASKS.map((t) => ({ ...t, id: `m6_${t.id}` })),
  },
];

// ─── Rules of the Road ────────────────────────────────────────────────────────

export const RULES = [
  { icon: "shield", text: "No overdrafts" },
  { icon: "x-circle", text: "No new debt" },
  { icon: "wallet", text: "Checking balance must stay ≥ $100" },
  {
    icon: "smartphone",
    text: "Cash App paused until April (capped at $25–$50/week after April)",
  },
  {
    icon: "shopping-bag",
    text: "Weekly non-essential spending limit: $30–$50",
  },
  { icon: "shopping-cart", text: "Weekly groceries: $90–95" },
  { icon: "piggy-bank", text: "Savings must stay above $7,500" },
  { icon: "home", text: "Goal: 4-bedroom home in 6 months (max rent $2,500)" },
  { icon: "target", text: "Housing fund target: $6,000–$8,000" },
] as const;
