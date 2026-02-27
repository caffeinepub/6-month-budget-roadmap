import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { HOUSEHOLD, RULES, getCurrentWeekId } from "@/data/householdData";
import {
  useGrocerySpending,
  useNonEssentialSpending,
  useUpdateGrocerySpending,
  useUpdateNonEssentialSpending,
} from "@/hooks/useQueries";
import { cn } from "@/lib/utils";
import {
  Home,
  Loader2,
  PiggyBank,
  Shield,
  ShoppingBag,
  ShoppingCart,
  Smartphone,
  Target,
  Wallet,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

function fmt(n: number) {
  return n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

const RULE_ICONS = [
  Shield,
  XCircle,
  Wallet,
  Smartphone,
  ShoppingBag,
  ShoppingCart,
  PiggyBank,
  Home,
  Target,
];

// Determine current month key for grocery budget
function getCurrentMonthKey(): string {
  const today = new Date();
  const y = today.getFullYear();
  const m = (today.getMonth() + 1).toString().padStart(2, "0");
  return `month_${y}_${m}`;
}

export function RulesTab() {
  const currentWeekId = getCurrentWeekId();
  const currentMonthKey = getCurrentMonthKey();

  const { data: weekNonEssential, isLoading: nonEssLoading } =
    useNonEssentialSpending(currentWeekId);
  const updateNonEssential = useUpdateNonEssentialSpending();

  const { data: monthGrocery, isLoading: monthGrocLoading } =
    useGrocerySpending(currentMonthKey);
  const updateMonthGrocery = useUpdateGrocerySpending();

  const [nonEssInput, setNonEssInput] = useState("");
  const [monthGrocInput, setMonthGrocInput] = useState("");

  const nonEssVal = weekNonEssential ?? 0;
  const nonEssLimit = HOUSEHOLD.weeklyNonEssentialLimit.max;
  const nonEssPct = Math.min(100, (nonEssVal / nonEssLimit) * 100);
  const nonEssStatus: "green" | "yellow" | "red" =
    nonEssVal > nonEssLimit
      ? "red"
      : nonEssVal > nonEssLimit * 0.7
        ? "yellow"
        : "green";

  const monthGrocVal = monthGrocery ?? 0;
  const monthGrocBudget = HOUSEHOLD.monthlyGroceryBudget;
  const monthGrocPct = Math.min(100, (monthGrocVal / monthGrocBudget) * 100);

  async function handleNonEssSave() {
    const parsed = Number.parseFloat(nonEssInput);
    if (Number.isNaN(parsed) || parsed < 0) return;
    await updateNonEssential.mutateAsync({
      week: currentWeekId,
      amount: parsed,
    });
    setNonEssInput("");
    toast.success("Non-essential spending updated");
  }

  async function handleMonthGrocSave() {
    const parsed = Number.parseFloat(monthGrocInput);
    if (Number.isNaN(parsed) || parsed < 0) return;
    await updateMonthGrocery.mutateAsync({
      week: currentMonthKey,
      amount: parsed,
    });
    setMonthGrocInput("");
    toast.success("Monthly grocery spending updated");
  }

  return (
    <div className="space-y-6">
      <div className="px-1">
        <h2 className="text-xl font-bold font-display text-foreground">
          Rules of the Road
        </h2>
        <p className="text-sm text-muted-foreground mt-0.5 font-body">
          Your household financial guardrails — keep these in mind every day
        </p>
      </div>

      {/* Rules list */}
      <Card className="card-shadow">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-display font-semibold">
            <div className="p-2 rounded-lg bg-primary/10">
              <Shield className="h-4 w-4 text-primary" />
            </div>
            Household Rules
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {RULES.map((rule, i) => {
              const IconComp = RULE_ICONS[i] ?? Shield;
              return (
                <div
                  key={rule.text}
                  className="flex items-start gap-3 px-3 py-3 rounded-xl bg-secondary border border-border"
                >
                  <div className="p-1.5 rounded-lg bg-primary/10 text-primary shrink-0 mt-0.5">
                    <IconComp className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-sm font-body text-foreground leading-snug">
                    {rule.text}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Monthly Grocery Budget Tracker */}
      <Card className="card-shadow">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-display font-semibold">
            <div className="p-2 rounded-lg bg-success/10">
              <ShoppingCart className="h-4 w-4 text-success" />
            </div>
            This Month's Grocery Budget
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {monthGrocLoading ? (
            <Skeleton className="h-10 w-40" />
          ) : (
            <>
              <div className="flex items-end justify-between gap-2">
                <div>
                  <p className="text-xs text-muted-foreground">
                    Spent this month
                  </p>
                  <p className="text-2xl font-bold font-display">
                    ${fmt(monthGrocVal)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">
                    Monthly budget
                  </p>
                  <p className="text-sm font-bold font-display text-success">
                    ${fmt(monthGrocBudget)}
                  </p>
                </div>
              </div>
              <Progress
                value={monthGrocPct}
                className={cn(
                  "h-2.5",
                  monthGrocPct > 100
                    ? "[&>div]:bg-danger"
                    : "[&>div]:bg-success",
                )}
              />
              <p
                className={cn(
                  "text-sm font-semibold",
                  monthGrocPct > 100 ? "text-danger" : "text-success",
                )}
              >
                {monthGrocPct > 100
                  ? `Over budget by $${fmt(monthGrocVal - monthGrocBudget)}`
                  : `$${fmt(monthGrocBudget - monthGrocVal)} remaining`}
              </p>
            </>
          )}

          <div className="space-y-1.5 pt-2 border-t border-border">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Update Amount Spent
            </Label>
            <div className="flex gap-2">
              <Input
                type="number"
                min="0"
                step="0.01"
                value={monthGrocInput}
                onChange={(e) => setMonthGrocInput(e.target.value)}
                placeholder="Enter amount"
                className="flex-1"
                onKeyDown={(e) => e.key === "Enter" && handleMonthGrocSave()}
              />
              <Button
                size="sm"
                variant="secondary"
                onClick={handleMonthGrocSave}
                disabled={updateMonthGrocery.isPending || !monthGrocInput}
              >
                {updateMonthGrocery.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  "Save"
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Non-Essential Spending Tracker */}
      <Card className="card-shadow">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-display font-semibold">
            <div
              className={cn(
                "p-2 rounded-lg",
                nonEssStatus === "green"
                  ? "bg-success/10"
                  : nonEssStatus === "yellow"
                    ? "bg-warning-bg"
                    : "bg-danger-bg",
              )}
            >
              <ShoppingBag
                className={cn(
                  "h-4 w-4",
                  nonEssStatus === "green"
                    ? "text-success"
                    : nonEssStatus === "yellow"
                      ? "text-warning"
                      : "text-danger",
                )}
              />
            </div>
            This Week's Non-Essential Spending
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {nonEssLoading ? (
            <Skeleton className="h-10 w-40" />
          ) : (
            <>
              <div className="flex items-end justify-between gap-2">
                <div>
                  <p className="text-xs text-muted-foreground">
                    Spent this week
                  </p>
                  <p className="text-2xl font-bold font-display">
                    ${fmt(nonEssVal)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Weekly cap</p>
                  <p className="text-sm font-bold font-display text-warning">
                    ${fmt(nonEssLimit)}
                  </p>
                </div>
              </div>
              <Progress
                value={nonEssPct}
                className={cn(
                  "h-2.5",
                  nonEssStatus === "red"
                    ? "[&>div]:bg-danger"
                    : nonEssStatus === "yellow"
                      ? "[&>div]:bg-warning"
                      : "[&>div]:bg-success",
                )}
              />
              <p
                className={cn(
                  "text-sm font-semibold",
                  nonEssStatus === "red"
                    ? "text-danger"
                    : nonEssStatus === "yellow"
                      ? "text-warning"
                      : "text-success",
                )}
              >
                {nonEssVal > nonEssLimit
                  ? `Over cap by $${fmt(nonEssVal - nonEssLimit)}`
                  : `$${fmt(nonEssLimit - nonEssVal)} remaining (limit $30–$50/week)`}
              </p>
            </>
          )}

          <div className="space-y-1.5 pt-2 border-t border-border">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Update This Week's Spending
            </Label>
            <div className="flex gap-2">
              <Input
                type="number"
                min="0"
                step="0.01"
                value={nonEssInput}
                onChange={(e) => setNonEssInput(e.target.value)}
                placeholder="Enter amount"
                className="flex-1"
                onKeyDown={(e) => e.key === "Enter" && handleNonEssSave()}
              />
              <Button
                size="sm"
                variant="secondary"
                onClick={handleNonEssSave}
                disabled={updateNonEssential.isPending || !nonEssInput}
              >
                {updateNonEssential.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  "Save"
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
