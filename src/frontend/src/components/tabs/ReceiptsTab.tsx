import { useState, useRef, useCallback } from "react";
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
  ScanLine,
  Camera,
  Upload,
  Plus,
  Trash2,
  Loader2,
  ShoppingBag,
  Receipt,
  Pencil,
  Check,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useCamera } from "@/camera/useCamera";
import {
  useAllReceiptEntries,
  useAddReceiptEntry,
  useDeleteReceiptEntry,
  useUpdateReceiptCategory,
} from "@/hooks/useQueries";

function fmt(n: number) {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function currentMonthPrefix() {
  return new Date().toISOString().slice(0, 7);
}

function currentWeekRange(): { start: string; end: string } {
  const now = new Date();
  // ISO week: Monday = 0
  const dayOfWeek = (now.getDay() + 6) % 7; // 0=Mon, 6=Sun
  const monday = new Date(now);
  monday.setDate(now.getDate() - dayOfWeek);
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return {
    start: monday.toISOString().slice(0, 10),
    end: sunday.toISOString().slice(0, 10),
  };
}

const MAIN_CATEGORIES = ["Bills", "Household Goods"] as const;
type MainCategory = (typeof MAIN_CATEGORIES)[number];

const SUB_CATEGORIES: Record<MainCategory, string[]> = {
  Bills: ["Credit Card", "Auto Insurance", "Utilities", "Loans", "Other"],
  "Household Goods": ["Groceries", "Clothing", "Healthcare Goods", "Gas", "Fast Food"],
};

function defaultSubCategory(main: MainCategory) {
  return SUB_CATEGORIES[main][0];
}

function formatDisplayDate(dateStr: string) {
  const [year, month, day] = dateStr.split("-").map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function MainCategoryBadge({ main, sub }: { main: string; sub: string }) {
  const isBills = main === "Bills";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold font-body",
        isBills ? "bg-orange-100 text-orange-700" : "bg-blue-100 text-blue-700",
      )}
    >
      {isBills ? <Receipt className="h-3 w-3" /> : <ShoppingBag className="h-3 w-3" />}
      {sub}
    </span>
  );
}

interface ReceiptFormState {
  amount: string;
  date: string;
  mainCategory: MainCategory;
  subCategory: string;
  note: string;
}

function defaultForm(): ReceiptFormState {
  return {
    amount: "",
    date: todayStr(),
    mainCategory: "Bills",
    subCategory: defaultSubCategory("Bills"),
    note: "",
  };
}

// ── Camera Dialog ──────────────────────────────────────────────────────────────

interface CameraDialogProps {
  open: boolean;
  onClose: () => void;
  onCapture: (file: File) => void;
}

function CameraDialog({ open, onClose, onCapture }: CameraDialogProps) {
  const camera = useCamera({ facingMode: "environment" });

  const handleOpen = useCallback(async () => {
    if (open) {
      await camera.startCamera();
    }
  }, [open, camera]);

  // Start camera when dialog opens
  useState(() => {
    if (open) {
      camera.startCamera();
    }
  });

  async function handleCapture() {
    const file = await camera.capturePhoto();
    if (file) {
      onCapture(file);
      await camera.stopCamera();
      onClose();
    } else {
      toast.error("Failed to capture photo. Please try again.");
    }
  }

  async function handleClose() {
    await camera.stopCamera();
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden">
        <DialogHeader className="px-4 pt-4 pb-2">
          <DialogTitle className="font-display font-bold flex items-center gap-2">
            <Camera className="h-5 w-5 text-primary" />
            Take Photo
          </DialogTitle>
        </DialogHeader>

        <div className="relative bg-black aspect-video w-full overflow-hidden">
          {camera.isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80">
              <Loader2 className="h-8 w-8 text-white animate-spin" />
            </div>
          )}
          {camera.error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 p-4 text-center gap-3">
              <Camera className="h-10 w-10 text-white/40" />
              <p className="text-white/80 text-sm font-body">{camera.error.message}</p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => camera.retry()}
                className="text-white border-white/30 hover:bg-white/10"
              >
                Retry
              </Button>
            </div>
          )}
          <video
            ref={camera.videoRef}
            autoPlay
            playsInline
            muted
            onPlay={handleOpen}
            className="w-full h-full object-cover"
          />
          <canvas ref={camera.canvasRef} className="hidden" />
        </div>

        <DialogFooter className="px-4 pb-4 pt-3 gap-2">
          <Button variant="outline" onClick={handleClose} className="font-body">
            <X className="h-4 w-4 mr-1.5" />
            Cancel
          </Button>
          <Button
            onClick={handleCapture}
            disabled={!camera.isActive || camera.isLoading}
            className="gap-1.5 font-display font-semibold"
          >
            <Camera className="h-4 w-4" />
            Capture
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Receipt Form Dialog ────────────────────────────────────────────────────────

interface ReceiptFormDialogProps {
  open: boolean;
  onClose: () => void;
  imagePreviewUrl: string | null;
}

function ReceiptFormDialog({ open, onClose, imagePreviewUrl }: ReceiptFormDialogProps) {
  const addReceipt = useAddReceiptEntry();
  const [form, setForm] = useState<ReceiptFormState>(defaultForm);

  function updateMain(val: string) {
    const main = val as MainCategory;
    setForm((f) => ({
      ...f,
      mainCategory: main,
      subCategory: defaultSubCategory(main),
    }));
  }

  function handleClose() {
    setForm(defaultForm());
    onClose();
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

    try {
      await addReceipt.mutateAsync({
        amount,
        date: form.date,
        mainCategory: form.mainCategory,
        subCategory: form.subCategory,
        note: form.note.trim() || null,
      });
      toast.success("Receipt saved!");
      handleClose();
    } catch {
      toast.error("Failed to save receipt. Please try again.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display font-bold flex items-center gap-2">
            <Receipt className="h-5 w-5 text-primary" />
            {imagePreviewUrl ? "Save Receipt" : "Add Receipt Manually"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Image preview */}
          {imagePreviewUrl && (
            <div className="rounded-xl overflow-hidden border border-border">
              <img
                src={imagePreviewUrl}
                alt="Receipt preview"
                className="w-full max-h-48 object-cover"
              />
            </div>
          )}

          {/* Amount */}
          <div className="space-y-1.5">
            <Label htmlFor="receipt-amount" className="font-semibold text-sm font-body">
              Amount <span className="text-danger">*</span>
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">
                $
              </span>
              <Input
                id="receipt-amount"
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
            <Label htmlFor="receipt-date" className="font-semibold text-sm font-body">
              Date <span className="text-danger">*</span>
            </Label>
            <Input
              id="receipt-date"
              type="date"
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
            />
          </div>

          {/* Main Category */}
          <div className="space-y-1.5">
            <Label className="font-semibold text-sm font-body">
              Main Category <span className="text-danger">*</span>
            </Label>
            <Select value={form.mainCategory} onValueChange={updateMain}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MAIN_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sub Category */}
          <div className="space-y-1.5">
            <Label className="font-semibold text-sm font-body">
              Sub Category <span className="text-danger">*</span>
            </Label>
            <Select
              value={form.subCategory}
              onValueChange={(val) => setForm((f) => ({ ...f, subCategory: val }))}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SUB_CATEGORIES[form.mainCategory].map((sub) => (
                  <SelectItem key={sub} value={sub}>
                    {sub}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Note */}
          <div className="space-y-1.5">
            <Label htmlFor="receipt-note" className="font-semibold text-sm font-body">
              Note{" "}
              <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Input
              id="receipt-note"
              type="text"
              placeholder="e.g. Weekly groceries"
              value={form.note}
              onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose} className="font-body">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={addReceipt.isPending}
            className="gap-1.5 font-display font-semibold"
          >
            {addReceipt.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                Save Receipt
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Edit Category Popover (inline) ────────────────────────────────────────────

interface EditCategoryInlineProps {
  id: string;
  currentMain: string;
  currentSub: string;
  onDone: () => void;
}

function EditCategoryInline({ id, currentMain, currentSub, onDone }: EditCategoryInlineProps) {
  const updateCategory = useUpdateReceiptCategory();
  const [main, setMain] = useState<MainCategory>(currentMain as MainCategory);
  const [sub, setSub] = useState(currentSub);

  function handleMainChange(val: string) {
    const m = val as MainCategory;
    setMain(m);
    setSub(defaultSubCategory(m));
  }

  async function handleSave() {
    try {
      await updateCategory.mutateAsync({ id, mainCategory: main, subCategory: sub });
      toast.success("Category updated.");
      onDone();
    } catch {
      toast.error("Failed to update category.");
    }
  }

  return (
    <div className="mt-2 p-3 rounded-xl bg-card border border-border space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <Select value={main} onValueChange={handleMainChange}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MAIN_CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat} className="text-xs">
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sub} onValueChange={setSub}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SUB_CATEGORIES[main].map((s) => (
              <SelectItem key={s} value={s} className="text-xs">
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          className="h-7 text-xs flex-1 font-body"
          onClick={onDone}
        >
          Cancel
        </Button>
        <Button
          size="sm"
          className="h-7 text-xs flex-1 font-body gap-1"
          onClick={handleSave}
          disabled={updateCategory.isPending}
        >
          {updateCategory.isPending ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Check className="h-3 w-3" />
          )}
          Save
        </Button>
      </div>
    </div>
  );
}

// ── Main ReceiptsTab ───────────────────────────────────────────────────────────

export function ReceiptsTab() {
  const { data: entries, isLoading } = useAllReceiptEntries();
  const deleteReceipt = useDeleteReceiptEntry();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [cameraOpen, setCameraOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const allEntries = entries ?? [];

  // Sort by date descending
  const sorted = [...allEntries].sort((a, b) => b.date.localeCompare(a.date));

  // Summaries
  const monthPrefix = currentMonthPrefix();
  const weekRange = currentWeekRange();

  const weeklyTotal = allEntries
    .filter((e) => e.date >= weekRange.start && e.date <= weekRange.end)
    .reduce((sum, e) => sum + e.amount, 0);

  const monthlyTotal = allEntries
    .filter((e) => e.date.startsWith(monthPrefix))
    .reduce((sum, e) => sum + e.amount, 0);

  const totalBills = allEntries
    .filter((e) => e.mainCategory === "Bills")
    .reduce((sum, e) => sum + e.amount, 0);

  const totalHousehold = allEntries
    .filter((e) => e.mainCategory === "Household Goods")
    .reduce((sum, e) => sum + e.amount, 0);

  // ── Handlers ──

  function handleUploadClick() {
    fileInputRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImagePreviewUrl(url);
    setFormOpen(true);
    // Reset file input so same file can be re-selected
    e.target.value = "";
  }

  function handleCameraCapture(file: File) {
    const url = URL.createObjectURL(file);
    setImagePreviewUrl(url);
    setFormOpen(true);
  }

  function handleAddManually() {
    setImagePreviewUrl(null);
    setFormOpen(true);
  }

  function handleFormClose() {
    setFormOpen(false);
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
      setImagePreviewUrl(null);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await deleteReceipt.mutateAsync(id);
      toast.success("Receipt removed.");
    } catch {
      toast.error("Failed to delete receipt.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header + Action buttons */}
      <div className="px-1">
        <h2 className="text-xl font-bold font-display text-foreground">Receipts</h2>
        <p className="text-sm text-muted-foreground mt-0.5 font-body">
          Track bills and household spending with photos or manual entry
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 font-display font-semibold"
          onClick={handleUploadClick}
        >
          <Upload className="h-4 w-4" />
          Upload Receipt
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 font-display font-semibold"
          onClick={() => setCameraOpen(true)}
        >
          <Camera className="h-4 w-4" />
          Take Photo
        </Button>
        <Button
          size="sm"
          className="gap-1.5 font-display font-semibold"
          onClick={handleAddManually}
        >
          <Plus className="h-4 w-4" />
          Add Manually
        </Button>
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="card-shadow border-border">
          <CardHeader className="pb-1 pt-3 px-4">
            <CardTitle className="text-xs font-display font-semibold text-muted-foreground uppercase tracking-wide">
              This Week
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            {isLoading ? (
              <Skeleton className="h-7 w-20" />
            ) : (
              <p className="text-xl font-bold font-display">${fmt(weeklyTotal)}</p>
            )}
          </CardContent>
        </Card>

        <Card className="card-shadow border-border">
          <CardHeader className="pb-1 pt-3 px-4">
            <CardTitle className="text-xs font-display font-semibold text-muted-foreground uppercase tracking-wide">
              This Month
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            {isLoading ? (
              <Skeleton className="h-7 w-20" />
            ) : (
              <p className="text-xl font-bold font-display">${fmt(monthlyTotal)}</p>
            )}
          </CardContent>
        </Card>

        <Card className="card-shadow border-orange-200">
          <CardHeader className="pb-1 pt-3 px-4">
            <CardTitle className="text-xs font-display font-semibold text-orange-600 uppercase tracking-wide flex items-center gap-1">
              <Receipt className="h-3 w-3" />
              Total Bills
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            {isLoading ? (
              <Skeleton className="h-7 w-20" />
            ) : (
              <p className="text-xl font-bold font-display text-orange-700">
                ${fmt(totalBills)}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="card-shadow border-blue-200">
          <CardHeader className="pb-1 pt-3 px-4">
            <CardTitle className="text-xs font-display font-semibold text-blue-600 uppercase tracking-wide flex items-center gap-1">
              <ShoppingBag className="h-3 w-3" />
              Household Goods
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            {isLoading ? (
              <Skeleton className="h-7 w-20" />
            ) : (
              <p className="text-xl font-bold font-display text-blue-700">
                ${fmt(totalHousehold)}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Receipt history */}
      <Card className="card-shadow border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-display font-semibold flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-warning-bg">
              <ScanLine className="h-4 w-4 text-warning" />
            </div>
            Receipt History
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
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : sorted.length === 0 ? (
            <div className="text-center py-10 space-y-2">
              <ScanLine className="h-10 w-10 text-muted-foreground/30 mx-auto" />
              <p className="text-sm font-body text-muted-foreground">
                No receipts yet.
              </p>
              <p className="text-xs text-muted-foreground/70 font-body">
                Upload a receipt or take a photo to start tracking.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {sorted.map((entry) => (
                <div key={entry.id}>
                  <div className="flex items-center justify-between gap-3 px-3 py-3 rounded-xl bg-secondary border border-border/50">
                    <div className="min-w-0 flex-1 space-y-1">
                      <MainCategoryBadge main={entry.mainCategory} sub={entry.subCategory} />
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-muted-foreground font-body">
                          {formatDisplayDate(entry.date)}
                        </span>
                        {entry.note && (
                          <span className="text-xs text-muted-foreground/70 font-body italic truncate max-w-[140px]">
                            · {entry.note}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-base font-bold font-display text-foreground">
                        ${fmt(entry.amount)}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-primary hover:bg-primary/10"
                        onClick={() =>
                          setEditingId(editingId === entry.id ? null : entry.id)
                        }
                        aria-label="Edit category"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-danger hover:bg-danger-bg"
                        onClick={() => handleDelete(entry.id)}
                        disabled={deletingId === entry.id}
                        aria-label="Delete receipt"
                      >
                        {deletingId === entry.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Inline category editor */}
                  {editingId === entry.id && (
                    <EditCategoryInline
                      id={entry.id}
                      currentMain={entry.mainCategory}
                      currentSub={entry.subCategory}
                      onDone={() => setEditingId(null)}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Camera dialog */}
      <CameraDialog
        open={cameraOpen}
        onClose={() => setCameraOpen(false)}
        onCapture={handleCameraCapture}
      />

      {/* Receipt form dialog */}
      <ReceiptFormDialog
        open={formOpen}
        onClose={handleFormClose}
        imagePreviewUrl={imagePreviewUrl}
      />
    </div>
  );
}
