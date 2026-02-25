import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChevronDown,
  ChevronRight,
  Loader2,
  Check,
  DollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  WEEKS,
  getCurrentWeekId,
  type WeekId,
  type ChecklistTask,
} from "@/data/householdData";
import { useAllChecklistStates, useToggleChecklistItem } from "@/hooks/useQueries";

function fmt(n: number) {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

interface ChecklistItemRowProps {
  task: ChecklistTask;
  checked: boolean;
  isToggling: boolean;
  onToggle: () => void;
}

function ChecklistItemRow({ task, checked, isToggling, onToggle }: ChecklistItemRowProps) {
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
          {task.deadline && (
            <span className="ml-2 text-xs font-semibold text-warning not-italic">
              · Due {task.deadline}
            </span>
          )}
          {task.note && (
            <span className="block text-xs text-muted-foreground mt-0.5">
              {task.note}
            </span>
          )}
        </Label>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        {task.amount !== undefined && (
          <span
            className={cn(
              "font-bold font-display text-sm",
              checked ? "text-muted-foreground line-through" : "text-foreground",
            )}
          >
            ${fmt(task.amount)}
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

interface WeekSectionProps {
  weekId: WeekId;
  isCurrentWeek: boolean;
  defaultOpen?: boolean;
  statesMap: Map<string, boolean>;
  onToggle: (group: string, item: string) => void;
  togglingId: string | null;
}

function WeekSection({
  weekId,
  isCurrentWeek,
  defaultOpen = false,
  statesMap,
  onToggle,
  togglingId,
}: WeekSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const week = WEEKS.find((w) => w.id === weekId)!;

  const doneTasks = week.tasks.filter((t) => statesMap.get(`${weekId}::${t.id}`) === true);
  const progressPct =
    week.tasks.length > 0
      ? Math.round((doneTasks.length / week.tasks.length) * 100)
      : 0;

  return (
    <Card className={cn("card-shadow overflow-hidden", isCurrentWeek && "border-primary/40")}>
      {/* Header (always visible) */}
      <button
        type="button"
        className="w-full text-left"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <CardHeader className="pb-3 pt-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {open ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <CardTitle className="text-base font-display font-bold">
                    {weekId.replace("week", "Week ")} — {week.label}
                  </CardTitle>
                  {isCurrentWeek && (
                    <Badge className="bg-primary/10 text-primary border-primary/20 text-xs font-display px-2 py-0">
                      Current
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{week.dateRange}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-semibold font-display text-muted-foreground">
                {doneTasks.length}/{week.tasks.length}
              </span>
              {progressPct === 100 && (
                <Check className="h-4 w-4 text-success" />
              )}
            </div>
          </div>
          {/* Mini progress bar always visible */}
          <Progress value={progressPct} className="h-1.5 mt-2" />
        </CardHeader>
      </button>

      {/* Collapsible content */}
      {open && (
        <CardContent className="pb-4 pt-0 space-y-2">
          {week.tasks.map((task) => (
            <ChecklistItemRow
              key={task.id}
              task={task}
              checked={statesMap.get(`${weekId}::${task.id}`) === true}
              isToggling={togglingId === `${weekId}::${task.id}`}
              onToggle={() => onToggle(weekId, task.id)}
            />
          ))}
          {/* Week total summary line */}
          {week.weekTotal && (
            <div className="mt-3 px-4 py-3 rounded-xl bg-primary/5 border border-primary/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-primary" />
                <span className="text-sm font-bold font-display text-primary">
                  Week 1 Total
                </span>
              </div>
              <span className="text-sm font-bold font-display text-primary">
                ${fmt(week.weekTotal)}
              </span>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

export function Month1RoadmapTab() {
  const currentWeekId = getCurrentWeekId();
  const { data: allStates, isLoading } = useAllChecklistStates();
  const toggleMutation = useToggleChecklistItem();
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Build a flat map: "weekId::itemId" -> boolean
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
          Month 1 Roadmap
        </h2>
        <p className="text-sm text-muted-foreground mt-0.5 font-body">
          Feb 25 – Mar 26, 2026 · Toggle items as you complete them
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {WEEKS.map((w) => (
            <Skeleton key={w.id} className="h-20 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {WEEKS.map((week) => (
            <WeekSection
              key={week.id}
              weekId={week.id}
              isCurrentWeek={week.id === currentWeekId}
              defaultOpen={week.id === currentWeekId}
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
