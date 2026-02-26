import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarCheck, Trash2, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useFinancialSummary,
  useAllIncomeEntries,
  useAllReceiptEntries,
  useAllChecklistStates,
  useGrocerySpending,
} from "@/hooks/useQueries";
import { getCurrentWeekId, getWeekById, HOUSEHOLD } from "@/data/householdData";

// ─── Types ────────────────────────────────────────────────────────────────────

interface WeeklySummary {
  id: string;
  generatedAt: string;
  weekLabel: string;
  weekDateRange: string;
  text: string;
}

// ─── localStorage helpers ─────────────────────────────────────────────────────

const STORAGE_KEY = "budgetRoadmap_weeklySummaries";

function loadSummaries(): WeeklySummary[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as WeeklySummary[];
  } catch {
    return [];
  }
}

function saveSummaries(summaries: WeeklySummary[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(summaries));
}

// ─── Formatting helpers ───────────────────────────────────────────────────────

function fmt(n: number) {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDateTime(isoString: string): string {
  const d = new Date(isoString);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

// ─── Summary text builder ─────────────────────────────────────────────────────

interface SummaryData {
  weekLabel: string;
  dateRange: string;
  incomeCount: number;
  incomeTotal: number;
  receiptCount: number;
  billsTotal: number;
  householdGoodsTotal: number;
  checklistDone: number;
  grocerySpent: number;
  groceryTarget: number;
  savings: number;
  housingFund: number;
}

function buildSummaryText(d: SummaryData): string {
  const incomeStr =
    d.incomeCount === 0
      ? "No income entries were logged this week."
      : `You logged ${d.incomeCount} income ${d.incomeCount === 1 ? "entry" : "entries"} totaling $${fmt(d.incomeTotal)}.`;

  const receiptStr =
    d.receiptCount === 0
      ? "No receipts were scanned this week."
      : `You scanned ${d.receiptCount} ${d.receiptCount === 1 ? "receipt" : "receipts"} covering $${fmt(d.billsTotal)} in bills and $${fmt(d.householdGoodsTotal)} in household goods.`;

  const checklistStr =
    d.checklistDone === 0
      ? "No checklist tasks are marked done yet this week."
      : `${d.checklistDone} checklist ${d.checklistDone === 1 ? "task is" : "tasks are"} marked done this week.`;

  const groceryStr =
    d.groceryTarget > 0
      ? `Grocery spending is at $${fmt(d.grocerySpent)} of the $${fmt(d.groceryTarget)} target.`
      : "No grocery target is set for this week.";

  const savingsStr = `Savings are at $${fmt(d.savings)} (floor: $7,500) and your Housing Fund stands at $${fmt(d.housingFund)}.`;

  let encouragement = "Keep going — every good week builds your path to that 4-bedroom home.";
  if (d.savings >= HOUSEHOLD.savingsFloor + 1000 && d.housingFund > 0) {
    encouragement = "Savings and the Housing Fund are both moving in the right direction — great momentum.";
  } else if (d.savings < HOUSEHOLD.savingsFloor) {
    encouragement = "Focus on rebuilding that savings floor first — it protects the whole family.";
  } else if (d.housingFund >= HOUSEHOLD.housingFundGoal) {
    encouragement = "The Housing Fund has hit the goal — that's a major win. Keep protecting it.";
  } else if (d.savings >= HOUSEHOLD.savingsFloor) {
    encouragement = "Savings are healthy. Stay the course and keep adding to the Housing Fund.";
  }

  return [
    `This week — ${d.weekLabel} (${d.dateRange}) —`,
    incomeStr,
    receiptStr,
    checklistStr,
    groceryStr,
    savingsStr,
    encouragement,
  ]
    .filter(Boolean)
    .join(" ");
}

// ─── Component ────────────────────────────────────────────────────────────────

export function WeeklySummaryTab() {
  const currentWeekId = getCurrentWeekId();
  const currentWeek = getWeekById(currentWeekId);

  const [summaries, setSummaries] = useState<WeeklySummary[]>(() => loadSummaries());
  const [generating, setGenerating] = useState(false);

  const { data: financialSummary } = useFinancialSummary();
  const { data: incomeEntries } = useAllIncomeEntries();
  const { data: receiptEntries } = useAllReceiptEntries();
  const { data: allChecklistStates } = useAllChecklistStates();
  const { data: grocerySpentData } = useGrocerySpending(currentWeekId);

  function handleGenerate() {
    setGenerating(true);

    // Gather data
    const incomeList = incomeEntries ?? [];
    const receiptList = receiptEntries ?? [];
    const checklistStates = allChecklistStates ?? [];

    const incomeTotal = incomeList.reduce((sum, e) => sum + e.amount, 0);
    const billsTotal = receiptList
      .filter((e) => e.mainCategory === "Bills")
      .reduce((sum, e) => sum + e.amount, 0);
    const householdGoodsTotal = receiptList
      .filter((e) => e.mainCategory === "Household Goods")
      .reduce((sum, e) => sum + e.amount, 0);

    // Count checklist tasks done for current week
    let checklistDone = 0;
    const weekEntry = checklistStates.find(([group]) => group === currentWeekId);
    if (weekEntry) {
      checklistDone = weekEntry[1].filter(([, done]) => done).length;
    }

    const summaryData: SummaryData = {
      weekLabel: currentWeek.label,
      dateRange: currentWeek.dateRange,
      incomeCount: incomeList.length,
      incomeTotal,
      receiptCount: receiptList.length,
      billsTotal,
      householdGoodsTotal,
      checklistDone,
      grocerySpent: grocerySpentData ?? 0,
      groceryTarget: currentWeek.groceryTarget,
      savings: financialSummary?.savingsAmount ?? HOUSEHOLD.savingsStart,
      housingFund: financialSummary?.housingFund ?? 0,
    };

    const newSummary: WeeklySummary = {
      id: crypto.randomUUID(),
      generatedAt: new Date().toISOString(),
      weekLabel: currentWeek.label,
      weekDateRange: currentWeek.dateRange,
      text: buildSummaryText(summaryData),
    };

    const updated = [newSummary, ...summaries];
    setSummaries(updated);
    saveSummaries(updated);
    setGenerating(false);
  }

  function handleDelete(id: string) {
    const updated = summaries.filter((s) => s.id !== id);
    setSummaries(updated);
    saveSummaries(updated);
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="px-1">
        <h2 className="text-2xl font-bold font-display text-foreground flex items-center gap-2">
          <CalendarCheck className="h-6 w-6 text-primary" />
          Weekly Summary
        </h2>
        <p className="text-muted-foreground mt-1 font-body text-sm">
          Generate a snapshot of this week's progress — income, receipts, checklists, and finances.
        </p>
      </div>

      {/* Generate button */}
      <Button
        onClick={handleGenerate}
        disabled={generating}
        className="w-full sm:w-auto"
        size="lg"
      >
        <CalendarCheck className="h-4 w-4 mr-2" />
        {generating ? "Generating…" : "Generate This Week's Summary"}
      </Button>

      {/* History */}
      {summaries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
          <div className="p-4 rounded-full bg-muted">
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground font-body text-sm max-w-xs">
            No summaries yet. Generate your first one above.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold font-display text-muted-foreground uppercase tracking-wide px-1">
            Summary History
          </h3>
          {summaries.map((summary, index) => (
            <Card
              key={summary.id}
              className={cn(
                "card-shadow border-border",
                index === 0 && "border-primary/30",
              )}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base font-display font-semibold text-foreground leading-tight">
                      {summary.weekLabel}
                      {index === 0 && (
                        <span className="ml-2 text-xs font-body font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                          Latest
                        </span>
                      )}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground font-body mt-0.5">
                      {summary.weekDateRange}
                    </p>
                    <p className="text-xs text-muted-foreground/70 font-body mt-0.5">
                      Generated {formatDateTime(summary.generatedAt)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(summary.id)}
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0 h-8 w-8 p-0"
                    aria-label="Delete summary"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-body text-foreground/80 leading-relaxed">
                  {summary.text}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
