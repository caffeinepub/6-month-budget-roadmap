import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  PiggyBank,
  Home,
  Wallet,
  Loader2,
  Check,
  AlertTriangle,
  CheckCircle2,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusBadge } from "@/components/StatusBadge";
import { HOUSEHOLD } from "@/data/householdData";
import {
  useSavingsAmount,
  useUpdateSavingsAmount,
  useHousingFund,
  useUpdateHousingFund,
  useCheckingBalance,
  useUpdateCheckingBalance,
} from "@/hooks/useQueries";
import { toast } from "sonner";

function fmt(n: number) {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function SavingsHousingTab() {
  const { data: savings, isLoading: savingsLoading } = useSavingsAmount();
  const updateSavings = useUpdateSavingsAmount();

  const { data: housing, isLoading: housingLoading } = useHousingFund();
  const updateHousing = useUpdateHousingFund();

  const { data: checking, isLoading: checkingLoading } = useCheckingBalance();
  const updateChecking = useUpdateCheckingBalance();

  const [savingsInput, setSavingsInput] = useState("");
  const [housingInput, setHousingInput] = useState("");
  const [checkingInput, setCheckingInput] = useState("");

  // ── Savings ──
  const savingsVal = savings ?? HOUSEHOLD.savingsStart;
  const savingsFloor = HOUSEHOLD.savingsFloor;
  const savingsMax = Math.max(savingsVal, HOUSEHOLD.savingsStart);
  const savingsAboveFloor = savingsVal - savingsFloor;
  const savingsBarPct =
    savingsMax > savingsFloor
      ? Math.min(100, Math.max(0, (savingsAboveFloor / (savingsMax - savingsFloor)) * 100))
      : 0;
  const savingsStatus: "green" | "yellow" | "red" =
    savingsVal >= savingsFloor + 500
      ? "green"
      : savingsVal >= savingsFloor
      ? "yellow"
      : "red";

  // ── Housing Fund ──
  const housingVal = housing ?? 0;
  const housingGoal = HOUSEHOLD.housingFundGoal;
  const housingMin = HOUSEHOLD.housingFundMin;
  const housingMax = HOUSEHOLD.housingFundMax;
  const housingPct = Math.min(100, (housingVal / housingGoal) * 100);
  const housingMinPct = Math.min(100, (housingMin / housingMax) * 100);

  // ── Checking ──
  const checkingVal = checking ?? 0;
  const checkingStatus: "green" | "red" = checkingVal >= HOUSEHOLD.checkingBuffer ? "green" : "red";

  async function handleSavingsSave() {
    const parsed = parseFloat(savingsInput);
    if (isNaN(parsed) || parsed < 0) return;
    await updateSavings.mutateAsync(parsed);
    setSavingsInput("");
    toast.success("Savings updated");
  }

  async function handleHousingSave() {
    const parsed = parseFloat(housingInput);
    if (isNaN(parsed) || parsed < 0) return;
    await updateHousing.mutateAsync(parsed);
    setHousingInput("");
    toast.success("Housing fund updated");
  }

  async function handleCheckingSave() {
    const parsed = parseFloat(checkingInput);
    if (isNaN(parsed) || parsed < 0) return;
    await updateChecking.mutateAsync(parsed);
    setCheckingInput("");
    toast.success("Checking balance updated");
  }

  return (
    <div className="space-y-6">
      <div className="px-1">
        <h2 className="text-xl font-bold font-display text-foreground">
          Savings & Housing Fund
        </h2>
        <p className="text-sm text-muted-foreground mt-0.5 font-body">
          Track your balances and progress toward your housing goal
        </p>
      </div>

      {/* ── Savings Tracker ── */}
      <Card className="card-shadow">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-display font-semibold">
            <div
              className={cn(
                "p-2 rounded-lg",
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
            Savings Tracker
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {savingsLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-10 w-40" />
              <Skeleton className="h-4 w-full" />
            </div>
          ) : (
            <>
              <div className="flex items-end justify-between gap-2">
                <div>
                  <p className="text-xs text-muted-foreground">Current savings</p>
                  <p className="text-3xl font-bold font-display">${fmt(savingsVal)}</p>
                </div>
                <StatusBadge status={savingsStatus}>
                  {savingsStatus === "green"
                    ? "Safe"
                    : savingsStatus === "yellow"
                    ? "At floor"
                    : "Warning!"}
                </StatusBadge>
              </div>

              {/* Progress bar: floor to starting point */}
              <div className="space-y-1.5">
                <Progress
                  value={savingsVal < savingsFloor ? 0 : savingsBarPct}
                  className={cn(
                    "h-3 rounded-full",
                    savingsStatus === "green"
                      ? "[&>div]:bg-success"
                      : savingsStatus === "yellow"
                      ? "[&>div]:bg-warning"
                      : "[&>div]:bg-danger",
                  )}
                />
                <div className="flex justify-between text-xs">
                  <span className="font-semibold flex items-center gap-1">
                    <Shield className="h-3 w-3 text-muted-foreground" />
                    Floor: ${fmt(savingsFloor)}
                  </span>
                  <span className="text-muted-foreground">${fmt(savingsMax)}</span>
                </div>
                {savingsVal >= savingsFloor ? (
                  <p className="text-sm text-success font-semibold">
                    ${fmt(savingsAboveFloor)} above floor · Protected ✓
                  </p>
                ) : (
                  <p className="text-sm text-danger font-semibold flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4" />
                    ${fmt(savingsFloor - savingsVal)} below floor — act now
                  </p>
                )}
              </div>
            </>
          )}

          <div className="space-y-1.5 pt-2 border-t border-border">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Update Balance
            </Label>
            <div className="flex gap-2">
              <Input
                type="number"
                min="0"
                step="0.01"
                value={savingsInput}
                onChange={(e) => setSavingsInput(e.target.value)}
                placeholder="Enter new amount"
                className="flex-1"
                onKeyDown={(e) => e.key === "Enter" && handleSavingsSave()}
              />
              <Button
                size="sm"
                variant="secondary"
                onClick={handleSavingsSave}
                disabled={updateSavings.isPending || !savingsInput}
              >
                {updateSavings.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  "Save"
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Housing Fund Tracker ── */}
      <Card className="card-shadow">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-display font-semibold">
            <div className="p-2 rounded-lg bg-primary/10">
              <Home className="h-4 w-4 text-primary" />
            </div>
            Housing Fund
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {housingLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-10 w-40" />
              <Skeleton className="h-4 w-full" />
            </div>
          ) : (
            <>
              <div className="flex items-end justify-between gap-2">
                <div>
                  <p className="text-xs text-muted-foreground">Current housing fund</p>
                  <p className="text-3xl font-bold font-display">${fmt(housingVal)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Goal</p>
                  <p className="text-sm font-bold font-display text-primary">${fmt(housingGoal)}</p>
                </div>
              </div>

              {/* Progress bar with range markers */}
              <div className="space-y-2">
                <div className="relative">
                  <Progress value={housingPct} className="h-3 rounded-full" />
                  {/* $6k range marker */}
                  <div
                    className="absolute top-0 h-3 w-0.5 bg-foreground/30 rounded"
                    style={{ left: `${housingMinPct}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>$0</span>
                  <span className="font-semibold text-foreground/60">
                    Range: $6k–$8k
                  </span>
                  <span>${fmt(housingMax)}</span>
                </div>
                <p className="text-sm font-semibold text-primary">
                  {housingPct.toFixed(0)}% of goal · ${fmt(Math.max(0, housingGoal - housingVal))} to go
                </p>
              </div>
            </>
          )}

          <div className="space-y-1.5 pt-2 border-t border-border">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Update Housing Fund
            </Label>
            <div className="flex gap-2">
              <Input
                type="number"
                min="0"
                step="0.01"
                value={housingInput}
                onChange={(e) => setHousingInput(e.target.value)}
                placeholder="Enter new amount"
                className="flex-1"
                onKeyDown={(e) => e.key === "Enter" && handleHousingSave()}
              />
              <Button
                size="sm"
                variant="secondary"
                onClick={handleHousingSave}
                disabled={updateHousing.isPending || !housingInput}
              >
                {updateHousing.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  "Save"
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Checking Balance ── */}
      <Card className="card-shadow">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-display font-semibold">
            <div
              className={cn(
                "p-2 rounded-lg",
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
            Checking Balance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {checkingLoading ? (
            <Skeleton className="h-10 w-40" />
          ) : (
            <div className="flex items-center justify-between gap-2">
              <p className="text-3xl font-bold font-display">${fmt(checkingVal)}</p>
              <div className="flex items-center gap-2">
                {checkingStatus === "green" ? (
                  <CheckCircle2 className="h-5 w-5 text-success" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-danger" />
                )}
                <StatusBadge status={checkingStatus}>
                  {checkingStatus === "green" ? "Buffer OK" : "Below $100!"}
                </StatusBadge>
              </div>
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            Always keep at least $100 in checking at all times.
          </p>
          <div className="flex gap-2">
            <Input
              type="number"
              min="0"
              step="0.01"
              value={checkingInput}
              onChange={(e) => setCheckingInput(e.target.value)}
              placeholder="Update balance"
              className="flex-1"
              onKeyDown={(e) => e.key === "Enter" && handleCheckingSave()}
            />
            <Button
              size="sm"
              variant="secondary"
              onClick={handleCheckingSave}
              disabled={updateChecking.isPending || !checkingInput}
            >
              {updateChecking.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                "Save"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
