import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Receipt,
  ShoppingCart,
  Wallet,
  PiggyBank,
  Home,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  ShoppingBag,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusBadge } from "@/components/StatusBadge";
import { AiGuidancePanel } from "@/components/AiGuidancePanel";
import { getCurrentWeekId, getWeekById, HOUSEHOLD } from "@/data/householdData";
import {
  useFinancialSummary,
  useGrocerySpending,
  useAllChecklistStates,
  useAllIncomeEntries,
  useAllReceiptEntries,
} from "@/hooks/useQueries";

function fmt(n: number) {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function DashboardTab() {
  const currentWeekId = getCurrentWeekId();
  const currentWeek = getWeekById(currentWeekId);

  const [dashFilter, setDashFilter] = useState<"All" | "Christopher" | "Tamara">("All");

  const { data: overview, isLoading: overviewLoading } = useFinancialSummary();
  const { data: grocerySpent, isLoading: groceryLoading } = useGrocerySpending(currentWeekId);
  const { data: allStates } = useAllChecklistStates();
  const { data: incomeEntries } = useAllIncomeEntries();
  const { data: receiptEntries } = useAllReceiptEntries();

  const savingsVal = overview?.savingsAmount ?? HOUSEHOLD.savingsStart;
  const housingFund = overview?.housingFund ?? 0;
  const checkingVal = 0; // checkingBalance is now managed via Accounts

  // Filtered totals for income/bills/goods
  const filteredIncome = (incomeEntries ?? [])
    .filter((e) => dashFilter === "All" || e.user === dashFilter)
    .reduce((sum, e) => sum + e.amount, 0);

  const filteredBills = (receiptEntries ?? [])
    .filter((e) => e.mainCategory === "Bills" && (dashFilter === "All" || e.user === dashFilter))
    .reduce((sum, e) => sum + e.amount, 0);

  const filteredHouseholdGoods = (receiptEntries ?? [])
    .filter(
      (e) => e.mainCategory === "Household Goods" && (dashFilter === "All" || e.user === dashFilter),
    )
    .reduce((sum, e) => sum + e.amount, 0);

  const savingsStatus: "green" | "yellow" | "red" =
    savingsVal >= HOUSEHOLD.savingsFloor + 500
      ? "green"
      : savingsVal >= HOUSEHOLD.savingsFloor
      ? "yellow"
      : "red";

  const checkingStatus: "green" | "red" = checkingVal >= HOUSEHOLD.checkingBuffer ? "green" : "red";

  const housingPct = Math.min(100, (housingFund / HOUSEHOLD.housingFundGoal) * 100);
  const housingStatus: "green" | "yellow" | "red" =
    housingFund >= HOUSEHOLD.housingFundGoal
      ? "green"
      : housingFund >= HOUSEHOLD.housingFundGoal * 0.5
      ? "yellow"
      : "red";

  const grocerySpentVal = grocerySpent ?? 0;
  const groceryTarget = currentWeek.groceryTarget;
  const groceryPct =
    groceryTarget > 0 ? Math.min(100, (grocerySpentVal / groceryTarget) * 100) : 0;

  // Bills due this week
  const billTasks = currentWeek.tasks.filter((t) => t.amount !== undefined);

  // Checklist completion for this week
  const weekStateMap = new Map<string, boolean>();
  if (allStates) {
    const weekEntry = allStates.find(([group]) => group === currentWeekId);
    if (weekEntry) {
      for (const [itemId, checked] of weekEntry[1]) {
        weekStateMap.set(itemId, checked);
      }
    }
  }
  const doneCount = currentWeek.tasks.filter((t) => weekStateMap.get(t.id) === true).length;
  const totalCount = currentWeek.tasks.length;

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="px-1">
        <h2 className="text-2xl font-bold font-display text-foreground">
          Hi Christopher & Tamara 👋
        </h2>
        <p className="text-muted-foreground mt-1 font-body text-sm">
          <span className="font-semibold text-foreground">{currentWeek.label}</span>{" "}
          · {currentWeek.dateRange}
          {totalCount > 0 && (
            <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-semibold">
              {doneCount}/{totalCount} done
            </span>
          )}
        </p>
      </div>

      {/* Status cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Savings */}
        <Card className="card-shadow border-border">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-display font-semibold">
              <div
                className={cn(
                  "p-1.5 rounded-lg",
                  savingsStatus === "green"
                    ? "bg-success/10"
                    : savingsStatus === "yellow"
                    ? "bg-warning-bg"
                    : "bg-danger-bg",
                )}
              >
                <PiggyBank
                  className={cn(
                    "h-4 w-4",
                    savingsStatus === "green"
                      ? "text-success"
                      : savingsStatus === "yellow"
                      ? "text-warning"
                      : "text-danger",
                  )}
                />
              </div>
              Savings Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {overviewLoading ? (
              <Skeleton className="h-9 w-32" />
            ) : (
              <>
                <p className="text-2xl font-bold font-display">${fmt(savingsVal)}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Floor: $7,500</span>
                  <StatusBadge status={savingsStatus}>
                    {savingsStatus === "green"
                      ? "Safe"
                      : savingsStatus === "yellow"
                      ? "At floor"
                      : "Warning!"}
                  </StatusBadge>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Housing Fund */}
        <Card className="card-shadow border-border">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-display font-semibold">
              <div className={cn("p-1.5 rounded-lg", housingStatus === "green" ? "bg-success/10" : "bg-primary/10")}>
                <Home className={cn("h-4 w-4", housingStatus === "green" ? "text-success" : "text-primary")} />
              </div>
              Housing Fund
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {overviewLoading ? (
              <Skeleton className="h-9 w-32" />
            ) : (
              <>
                <p className="text-2xl font-bold font-display">${fmt(housingFund)}</p>
                <Progress value={housingPct} className="h-2" />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Goal: $7,000</span>
                  <span className="text-xs font-semibold text-primary">
                    {housingPct.toFixed(0)}%
                  </span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Checking Buffer */}
        <Card className="card-shadow border-border">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-display font-semibold">
              <div
                className={cn(
                  "p-1.5 rounded-lg",
                  checkingStatus === "green" ? "bg-success/10" : "bg-danger-bg",
                )}
              >
                <Wallet
                  className={cn(
                    "h-4 w-4",
                    checkingStatus === "green" ? "text-success" : "text-danger",
                  )}
                />
              </div>
              Checking Buffer
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {overviewLoading ? (
              <Skeleton className="h-9 w-32" />
            ) : (
              <>
                <p className="text-2xl font-bold font-display">${fmt(checkingVal)}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Min: $100</span>
                  <StatusBadge status={checkingStatus}>
                    {checkingStatus === "green" ? "Buffer OK" : "Below min!"}
                  </StatusBadge>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* This Week's Groceries */}
        <Card className="card-shadow border-border">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-display font-semibold">
              <div className="p-1.5 rounded-lg bg-success/10">
                <ShoppingCart className="h-4 w-4 text-success" />
              </div>
              This Week's Groceries
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {groceryLoading ? (
              <Skeleton className="h-9 w-32" />
            ) : groceryTarget === 0 ? (
              <p className="text-xs text-muted-foreground italic">
                {currentWeek.groceryNote ?? "No grocery target this week"}
              </p>
            ) : (
              <>
                <p className="text-2xl font-bold font-display">${fmt(grocerySpentVal)}</p>
                <Progress
                  value={groceryPct}
                  className={cn("h-2", groceryPct > 100 ? "[&>div]:bg-danger" : "")}
                />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Target: ${fmt(groceryTarget)}</span>
                  <StatusBadge
                    status={groceryPct > 100 ? "red" : groceryPct > 88 ? "yellow" : "green"}
                  >
                    {groceryPct > 100
                      ? "Over budget"
                      : `$${fmt(groceryTarget - grocerySpentVal)} left`}
                  </StatusBadge>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Income & Spending Summary */}
      <div className="space-y-3">
        {/* Filter buttons */}
        <div className="flex gap-2 items-center">
          <span className="text-xs text-muted-foreground font-body">View:</span>
          {(["All", "Christopher", "Tamara"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setDashFilter(f)}
              className={cn(
                "text-xs font-semibold font-body px-3 py-1 rounded-full border transition-colors",
                dashFilter === f
                  ? f === "Christopher"
                    ? "bg-blue-500 text-white border-blue-500"
                    : f === "Tamara"
                    ? "bg-rose-500 text-white border-rose-500"
                    : "bg-primary text-primary-foreground border-primary"
                  : "bg-transparent text-muted-foreground border-border hover:text-foreground",
              )}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-3">
          {/* Monthly Income */}
          <Card className="card-shadow border-border">
            <CardHeader className="pb-1 pt-3 px-3">
              <CardTitle className="flex items-center gap-1.5 text-xs font-display font-semibold text-success">
                <TrendingUp className="h-3.5 w-3.5" />
                Income
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3">
              {overviewLoading ? (
                <Skeleton className="h-6 w-16" />
              ) : (
                <p className="text-base font-bold font-display text-success">
                  ${fmt(filteredIncome)}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Total Bills */}
          <Card className="card-shadow border-border">
            <CardHeader className="pb-1 pt-3 px-3">
              <CardTitle className="flex items-center gap-1.5 text-xs font-display font-semibold text-warning">
                <Receipt className="h-3.5 w-3.5" />
                Bills
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3">
              {overviewLoading ? (
                <Skeleton className="h-6 w-16" />
              ) : (
                <p className="text-base font-bold font-display text-warning">
                  ${fmt(filteredBills)}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Household Goods */}
          <Card className="card-shadow border-border">
            <CardHeader className="pb-1 pt-3 px-3">
              <CardTitle className="flex items-center gap-1.5 text-xs font-display font-semibold text-primary">
                <ShoppingBag className="h-3.5 w-3.5" />
                Goods
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3">
              {overviewLoading ? (
                <Skeleton className="h-6 w-16" />
              ) : (
                <p className="text-base font-bold font-display text-primary">
                  ${fmt(filteredHouseholdGoods)}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bills Due Soon */}
      {billTasks.length > 0 && (
        <Card className="card-shadow border-border">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-display font-semibold">
              <div className="p-1.5 rounded-lg bg-warning-bg">
                <Receipt className="h-4 w-4 text-warning" />
              </div>
              Bills Due This Week
              <span className="ml-auto text-xs font-normal text-muted-foreground">
                {currentWeek.label}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {billTasks.map((task) => {
              const done = weekStateMap.get(task.id) === true;
              return (
                <div
                  key={task.id}
                  className={cn(
                    "flex justify-between items-center text-sm px-3 py-2 rounded-lg",
                    done ? "bg-success/5 opacity-60" : "bg-secondary",
                  )}
                >
                  <div className="flex items-center gap-2">
                    {done ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0" />
                    ) : (
                      <AlertTriangle className="h-3.5 w-3.5 text-warning shrink-0" />
                    )}
                    <span className={cn("text-foreground/80", done && "line-through")}>
                      {task.label}
                      {task.deadline && (
                        <span className="ml-1 text-xs text-warning font-semibold">
                          · by {task.deadline}
                        </span>
                      )}
                    </span>
                  </div>
                  <span className={cn("font-bold font-display shrink-0", done && "text-muted-foreground line-through")}>
                    ${fmt(task.amount!)}
                  </span>
                </div>
              );
            })}
            {currentWeek.weekTotal && (
              <div className="pt-2 border-t border-border flex justify-between text-sm font-bold font-display">
                <span>Week 1 Total</span>
                <span>${fmt(currentWeek.weekTotal)}</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* AI Guidance */}
      <AiGuidancePanel />
    </div>
  );
}
