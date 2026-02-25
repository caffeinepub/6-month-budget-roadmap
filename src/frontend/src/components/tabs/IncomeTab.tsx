import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DollarSign,
  Plus,
  Trash2,
  TrendingUp,
  Loader2,
  Banknote,
  Briefcase,
  CircleDollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  useAllIncomeEntries,
  useAddIncomeEntry,
  useDeleteIncomeEntry,
} from "@/hooks/useQueries";

function fmt(n: number) {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function currentMonthPrefix() {
  return new Date().toISOString().slice(0, 7); // "YYYY-MM"
}

const CATEGORIES = [
  { value: "Social Security", label: "Social Security", color: "blue" },
  { value: "Tamara Job Income", label: "Tamara Job Income", color: "green" },
  { value: "Other Income", label: "Other Income", color: "gray" },
] as const;

type CategoryColor = "blue" | "green" | "gray";

function categoryColor(cat: string): CategoryColor {
  if (cat === "Social Security") return "blue";
  if (cat === "Tamara Job Income") return "green";
  return "gray";
}

function CategoryBadge({ category }: { category: string }) {
  const color = categoryColor(category);
  const Icon =
    color === "blue" ? Banknote : color === "green" ? Briefcase : CircleDollarSign;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold font-body",
        color === "blue" && "bg-blue-100 text-blue-700",
        color === "green" && "bg-emerald-100 text-emerald-700",
        color === "gray" && "bg-gray-100 text-gray-600",
      )}
    >
      <Icon className="h-3 w-3" />
      {category}
    </span>
  );
}

function formatDisplayDate(dateStr: string) {
  // dateStr is "YYYY-MM-DD"
  const [year, month, day] = dateStr.split("-").map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

interface AddIncomeFormState {
  amount: string;
  date: string;
  category: string;
  note: string;
}

const defaultForm: AddIncomeFormState = {
  amount: "",
  date: todayStr(),
  category: "",
  note: "",
};

export function IncomeTab() {
  const { data: entries, isLoading } = useAllIncomeEntries();
  const addIncome = useAddIncomeEntry();
  const deleteIncome = useDeleteIncomeEntry();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<AddIncomeFormState>(defaultForm);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const allEntries = entries ?? [];

  // Sort by date descending
  const sorted = [...allEntries].sort((a, b) => b.date.localeCompare(a.date));

  // Monthly income total (current month)
  const monthPrefix = currentMonthPrefix();
  const monthlyTotal = allEntries
    .filter((e) => e.date.startsWith(monthPrefix))
    .reduce((sum, e) => sum + e.amount, 0);

  // Overall total
  const overallTotal = allEntries.reduce((sum, e) => sum + e.amount, 0);

  function openDialog() {
    setForm({ ...defaultForm, date: todayStr() });
    setDialogOpen(true);
  }

  function closeDialog() {
    setDialogOpen(false);
    setForm(defaultForm);
  }

  async function handleSubmit() {
    const amount = parseFloat(form.amount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount.");
      return;
    }
    if (!form.date) {
      toast.error("Please select a date.");
      return;
    }
    if (!form.category) {
      toast.error("Please select a category.");
      return;
    }

    try {
      await addIncome.mutateAsync({
        amount,
        date: form.date,
        category: form.category,
        note: form.note.trim() || null,
      });
      toast.success("Income added successfully!");
      closeDialog();
    } catch {
      toast.error("Failed to add income. Please try again.");
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await deleteIncome.mutateAsync(id);
      toast.success("Income entry removed.");
    } catch {
      toast.error("Failed to delete entry.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="px-1 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold font-display text-foreground">
            Income Tracking
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5 font-body">
            Track Social Security, Tamara's income, and other earnings
          </p>
        </div>
        <Button
          onClick={openDialog}
          size="sm"
          className="shrink-0 gap-1.5 font-display font-semibold"
        >
          <Plus className="h-4 w-4" />
          Add Income
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="card-shadow border-border">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-display font-semibold">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
              This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-28" />
            ) : (
              <p className="text-2xl font-bold font-display text-primary">
                ${fmt(monthlyTotal)}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-0.5 font-body">
              {new Date().toLocaleString("en-US", { month: "long", year: "numeric" })}
            </p>
          </CardContent>
        </Card>

        <Card className="card-shadow border-border">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-display font-semibold">
              <div className="p-1.5 rounded-lg bg-success/10">
                <DollarSign className="h-4 w-4 text-success" />
              </div>
              Total Income
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-28" />
            ) : (
              <p className="text-2xl font-bold font-display text-success">
                ${fmt(overallTotal)}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-0.5 font-body">
              All time
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Income history */}
      <Card className="card-shadow border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-display font-semibold flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <Banknote className="h-4 w-4 text-primary" />
            </div>
            Income History
            {sorted.length > 0 && (
              <span className="ml-auto text-xs font-normal text-muted-foreground">
                {sorted.length} {sorted.length === 1 ? "entry" : "entries"}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : sorted.length === 0 ? (
            <div className="text-center py-10 space-y-2">
              <DollarSign className="h-10 w-10 text-muted-foreground/30 mx-auto" />
              <p className="text-sm font-body text-muted-foreground">
                No income recorded yet.
              </p>
              <p className="text-xs text-muted-foreground/70 font-body">
                Tap &ldquo;Add Income&rdquo; to get started.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {sorted.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between gap-3 px-3 py-3 rounded-xl bg-secondary border border-border/50"
                >
                  <div className="min-w-0 flex-1 space-y-1">
                    <CategoryBadge category={entry.category} />
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-muted-foreground font-body">
                        {formatDisplayDate(entry.date)}
                      </span>
                      {entry.note && (
                        <span className="text-xs text-muted-foreground/70 font-body italic truncate max-w-[160px]">
                          · {entry.note}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-base font-bold font-display text-foreground">
                      +${fmt(entry.amount)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-danger hover:bg-danger-bg"
                      onClick={() => handleDelete(entry.id)}
                      disabled={deletingId === entry.id}
                      aria-label="Delete income entry"
                    >
                      {deletingId === entry.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Income Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display font-bold flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Add Income
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Amount */}
            <div className="space-y-1.5">
              <Label htmlFor="income-amount" className="font-semibold text-sm font-body">
                Amount <span className="text-danger">*</span>
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">
                  $
                </span>
                <Input
                  id="income-amount"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={form.amount}
                  onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                  className="pl-7"
                  autoFocus
                />
              </div>
            </div>

            {/* Date */}
            <div className="space-y-1.5">
              <Label htmlFor="income-date" className="font-semibold text-sm font-body">
                Date <span className="text-danger">*</span>
              </Label>
              <Input
                id="income-date"
                type="date"
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              />
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <Label className="font-semibold text-sm font-body">
                Category <span className="text-danger">*</span>
              </Label>
              <Select
                value={form.category}
                onValueChange={(val) => setForm((f) => ({ ...f, category: val }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Note (optional) */}
            <div className="space-y-1.5">
              <Label htmlFor="income-note" className="font-semibold text-sm font-body">
                Note{" "}
                <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <Input
                id="income-note"
                type="text"
                placeholder="e.g. February deposit"
                value={form.note}
                onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={closeDialog} className="font-body">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={addIncome.isPending}
              className="gap-1.5 font-display font-semibold"
            >
              {addIncome.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Add Income
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
