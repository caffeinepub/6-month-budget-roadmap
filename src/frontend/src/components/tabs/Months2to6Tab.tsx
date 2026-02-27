import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { MONTHS, type MonthId, type MonthlyTask } from "@/data/householdData";
import {
  useAllChecklistStates,
  useToggleChecklistItem,
} from "@/hooks/useQueries";
import { cn } from "@/lib/utils";
import {
  Check,
  ChevronDown,
  ChevronRight,
  Loader2,
  Wrench,
  Zap,
} from "lucide-react";
import { useState } from "react";

interface MonthlyItemRowProps {
  task: MonthlyTask;
  checked: boolean;
  isToggling: boolean;
  onToggle: () => void;
}

function MonthlyItemRow({
  task,
  checked,
  isToggling,
  onToggle,
}: MonthlyItemRowProps) {
  return (
    <div
      className={cn(
        "flex items-start justify-between gap-3 px-4 py-3 rounded-xl border transition-all duration-200",
        checked
          ? "bg-success/5 border-success/20 opacity-80"
          : "bg-card border-border hover:border-primary/30",
      )}
    >
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <Switch
          id={task.id}
          checked={checked}
          onCheckedChange={onToggle}
          disabled={isToggling}
          className="mt-0.5 shrink-0"
        />
        <Label
          htmlFor={task.id}
          className={cn(
            "cursor-pointer font-body leading-snug text-sm",
            checked ? "line-through text-muted-foreground" : "text-foreground",
          )}
        >
          {task.label}
        </Label>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        {task.amount && (
          <span
            className={cn(
              "text-xs font-semibold text-muted-foreground",
              checked && "line-through",
            )}
          >
            {task.amount}
          </span>
        )}
        {isToggling && (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground ml-1" />
        )}
        {!isToggling && checked && (
          <Check className="h-3.5 w-3.5 text-success ml-1" />
        )}
      </div>
    </div>
  );
}

interface MonthCardProps {
  monthId: MonthId;
  statesMap: Map<string, boolean>;
  onToggle: (group: string, item: string) => void;
  togglingId: string | null;
}

function MonthCard({
  monthId,
  statesMap,
  onToggle,
  togglingId,
}: MonthCardProps) {
  const [open, setOpen] = useState(monthId === "month2");
  const month = MONTHS.find((m) => m.id === monthId)!;
  const isMayMilestone = month.milestone != null;

  const doneCount = month.tasks.filter(
    (t) => statesMap.get(`${monthId}::${t.id}`) === true,
  ).length;

  return (
    <Card
      className={cn(
        "card-shadow overflow-hidden",
        isMayMilestone && "border-warning/40",
      )}
    >
      {/* May milestone banner */}
      {isMayMilestone && (
        <div className="bg-gradient-to-r from-warning/20 to-success/10 border-b border-warning/30 px-4 py-3 flex items-start gap-2">
          <div className="p-1.5 rounded-full bg-warning/20 shrink-0">
            <Zap className="h-4 w-4 text-warning" />
          </div>
          <div>
            <p className="text-sm font-bold font-display text-warning">
              🎉 HVAC Income Milestone
            </p>
            <p className="text-xs text-foreground/80 mt-0.5 font-body">
              {month.milestone}
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <button
        type="button"
        className="w-full text-left"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <CardHeader className="pb-3 pt-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {open ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
              )}
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <CardTitle className="text-base font-display font-bold">
                    {month.label}
                  </CardTitle>
                  {isMayMilestone && (
                    <Badge className="bg-warning/20 text-warning border-warning/30 text-xs font-display px-2 py-0">
                      <Wrench className="h-3 w-3 mr-1" />
                      HVAC Starts
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {month.dateRange}
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold font-display text-muted-foreground shrink-0">
              {doneCount}/{month.tasks.length}
            </span>
          </div>
        </CardHeader>
      </button>

      {/* Collapsible tasks */}
      {open && (
        <CardContent className="pb-4 pt-0 space-y-2">
          {month.tasks.map((task) => (
            <MonthlyItemRow
              key={task.id}
              task={task}
              checked={statesMap.get(`${monthId}::${task.id}`) === true}
              isToggling={togglingId === `${monthId}::${task.id}`}
              onToggle={() => onToggle(monthId, task.id)}
            />
          ))}
        </CardContent>
      )}
    </Card>
  );
}

export function Months2to6Tab() {
  const { data: allStates, isLoading } = useAllChecklistStates();
  const toggleMutation = useToggleChecklistItem();
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Build flat map: "monthId::itemId" -> boolean
  const statesMap = new Map<string, boolean>();
  if (allStates) {
    for (const [group, items] of allStates) {
      for (const [itemId, checked] of items) {
        statesMap.set(`${group}::${itemId}`, checked);
      }
    }
  }

  async function handleToggle(group: string, item: string) {
    const key = `${group}::${item}`;
    setTogglingId(key);
    try {
      await toggleMutation.mutateAsync({ group, item });
    } finally {
      setTogglingId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="px-1">
        <h2 className="text-xl font-bold font-display text-foreground">
          Months 2–6 Plan
        </h2>
        <p className="text-sm text-muted-foreground mt-0.5 font-body">
          April through August · Monthly recurring checklist
        </p>
      </div>

      {/* HVAC milestone callout */}
      <div className="px-4 py-3 rounded-xl bg-gradient-to-r from-warning/10 to-success/10 border border-warning/25 flex items-start gap-3">
        <Zap className="h-5 w-5 text-warning shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold font-display text-foreground">
            May 28 — HVAC Income Begins
          </p>
          <p className="text-xs text-muted-foreground mt-0.5 font-body">
            Christopher's HVAC work adds new income. Use it intentionally:
            rebuild savings, pay down credit cards, grow the housing fund.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {MONTHS.map((m) => (
            <Skeleton key={m.id} className="h-20 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {MONTHS.map((month) => (
            <MonthCard
              key={month.id}
              monthId={month.id}
              statesMap={statesMap}
              onToggle={handleToggle}
              togglingId={togglingId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
