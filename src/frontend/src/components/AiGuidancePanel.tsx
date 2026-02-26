import { Lightbulb } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  useFinancialSummary,
  useGrocerySpending,
  useAllIncomeEntries,
  useAllReceiptEntries,
} from "@/hooks/useQueries";
import { getCurrentWeekId, getWeekById, HOUSEHOLD } from "@/data/householdData";

function fmt(n: number) {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

interface Tip {
  id: string;
  text: string;
  variant: "info" | "success" | "warning" | "danger";
}

export function AiGuidancePanel() {
  const currentWeekId = getCurrentWeekId();
  const currentWeek = getWeekById(currentWeekId);

  const { data: summary } = useFinancialSummary();
  const { data: grocerySpent } = useGrocerySpending(currentWeekId);
  const { data: incomeEntries } = useAllIncomeEntries();
  const { data: receiptEntries } = useAllReceiptEntries();

  const savingsAmount = summary?.savingsAmount ?? HOUSEHOLD.savingsStart;
  const housingFund = summary?.housingFund ?? 0;
  const checkingBalance = 0; // checkingBalance is now managed via Accounts
  const totalIncome = summary?.totalIncome ?? 0;

  // Use receipt data to ensure we use the param even if not directly
  const _receiptsLoaded = (receiptEntries ?? []).length;
  void _receiptsLoaded;

  const grocerySpentVal = grocerySpent ?? 0;
  const groceryTarget = currentWeek.groceryTarget;

  const tips: Tip[] = [];

  // Rule 1: checking < 100
  if (checkingBalance < 100) {
    tips.push({
      id: "checking-critical",
      text: "Your checking balance is below $100. Pause all non-essential spending until it recovers.",
      variant: "danger",
    });
  }

  // Rule 2: checking between 100 and 150
  if (checkingBalance >= 100 && checkingBalance < 150) {
    tips.push({
      id: "checking-low",
      text: "Your buffer is close to the minimum. Hold off on extras until it builds back up.",
      variant: "warning",
    });
  }

  // Rule 3: savings below floor
  if (savingsAmount < HOUSEHOLD.savingsFloor) {
    tips.push({
      id: "savings-floor-breach",
      text: "Your savings have dipped below the $7,500 floor. No new spending until it's back above the line.",
      variant: "danger",
    });
  }

  // Rule 4: savings just at floor
  if (savingsAmount >= HOUSEHOLD.savingsFloor && savingsAmount < HOUSEHOLD.savingsFloor + 500) {
    tips.push({
      id: "savings-at-floor",
      text: "Savings are right at the floor. Stay steady — keep essentials only.",
      variant: "warning",
    });
  }

  // Rule 5: savings healthy
  if (savingsAmount > HOUSEHOLD.savingsFloor + 1000) {
    tips.push({
      id: "savings-healthy",
      text: "Savings look healthy. Keep protecting that floor and stay consistent.",
      variant: "success",
    });
  }

  // Grocery rules
  if (groceryTarget > 0) {
    const ratio = grocerySpentVal / groceryTarget;
    if (ratio > 1) {
      tips.push({
        id: "grocery-over",
        text: "Grocery spending is over this week's target. Keep the rest of the week simple.",
        variant: "danger",
      });
    } else if (ratio > 0.88) {
      tips.push({
        id: "grocery-close",
        text: "Grocery spending is close to the weekly target. Watch the remaining days.",
        variant: "warning",
      });
    } else if (ratio <= 0.5) {
      tips.push({
        id: "grocery-on-track",
        text: "You're on track with groceries this week. Nice work staying in budget.",
        variant: "success",
      });
    }
  }

  // Rule 9: housing fund reached goal
  if (housingFund >= HOUSEHOLD.housingFundGoal) {
    tips.push({
      id: "housing-goal-reached",
      text: "Your Housing Fund has reached the goal — great milestone for the family.",
      variant: "success",
    });
  }

  // Rule 10: housing fund in progress
  if (housingFund > 0 && housingFund < HOUSEHOLD.housingFundGoal) {
    tips.push({
      id: "housing-in-progress",
      text: `Housing Fund is at $${fmt(housingFund)} — keep adding to it each month to reach $7,000.`,
      variant: "info",
    });
  }

  // Rule 11: housing fund is zero
  if (housingFund === 0) {
    tips.push({
      id: "housing-zero",
      text: "Start adding to your Housing Fund when possible — every bit moves you closer to a 4-bedroom home.",
      variant: "info",
    });
  }

  // Rule 12: income has been logged
  if (totalIncome > 0) {
    tips.push({
      id: "income-logged",
      text: "Income has been logged — you're building a clear picture of what's coming in.",
      variant: "success",
    });
  }

  // Fallback
  tips.push({
    id: "fallback",
    text: "Stay consistent. Small actions each day add up to big results over 6 months.",
    variant: "info",
  });

  // Take the first 3 unique tips
  const displayed = tips.slice(0, 3);

  const variantStyles: Record<Tip["variant"], string> = {
    info: "bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/40 dark:text-blue-200 dark:border-blue-900",
    success:
      "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-200 dark:border-emerald-900",
    warning:
      "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-900",
    danger:
      "bg-red-50 text-red-800 border-red-200 dark:bg-red-950/40 dark:text-red-200 dark:border-red-900",
  };

  const dotStyles: Record<Tip["variant"], string> = {
    info: "bg-blue-400",
    success: "bg-emerald-400",
    warning: "bg-amber-400",
    danger: "bg-red-400",
  };

  return (
    <Card className="card-shadow border-border">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-display font-semibold">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <Lightbulb className="h-4 w-4 text-primary" />
          </div>
          AI Guidance
        </CardTitle>
        <p className="text-xs text-muted-foreground font-body mt-0.5">
          Based on your current data
        </p>
      </CardHeader>
      <CardContent className="space-y-2.5">
        {displayed.map((tip) => (
          <div
            key={tip.id}
            className={cn(
              "flex items-start gap-2.5 text-sm px-3 py-2.5 rounded-lg border",
              variantStyles[tip.variant],
            )}
          >
            <span
              className={cn(
                "mt-1.5 h-2 w-2 rounded-full shrink-0",
                dotStyles[tip.variant],
              )}
            />
            <span className="leading-relaxed font-body">{tip.text}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
