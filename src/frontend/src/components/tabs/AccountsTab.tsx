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
  Wallet,
  Plus,
  Trash2,
  Pencil,
  Loader2,
  CreditCard,
  PiggyBank,
  Landmark,
  CircleHelp,
  Check,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  useAllAccounts,
  useAddAccount,
  useUpdateAccount,
  useDeleteAccount,
} from "@/hooks/useQueries";

function fmt(n: number) {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const ACCOUNT_TYPES = ["Checking", "Savings", "Credit Card", "Other"] as const;
type AccountType = (typeof ACCOUNT_TYPES)[number];

function accountTypeIcon(type: string) {
  switch (type) {
    case "Checking":
      return Landmark;
    case "Savings":
      return PiggyBank;
    case "Credit Card":
      return CreditCard;
    default:
      return CircleHelp;
  }
}

function AccountTypeBadge({ type }: { type: string }) {
  const Icon = accountTypeIcon(type);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold font-body",
        type === "Checking" && "bg-blue-100 text-blue-700",
        type === "Savings" && "bg-emerald-100 text-emerald-700",
        type === "Credit Card" && "bg-orange-100 text-orange-700",
        type === "Other" && "bg-gray-100 text-gray-600",
      )}
    >
      <Icon className="h-3 w-3" />
      {type}
    </span>
  );
}

// ── Add / Edit Account Dialog ──────────────────────────────────────────────────

interface AccountFormState {
  name: string;
  accountType: AccountType;
  balance: string;
}

function defaultAccountForm(): AccountFormState {
  return { name: "", accountType: "Checking", balance: "0.00" };
}

interface AccountDialogProps {
  open: boolean;
  onClose: () => void;
  editAccount?: { id: string; name: string; accountType: string; balance: number } | null;
}

function AccountDialog({ open, onClose, editAccount }: AccountDialogProps) {
  const addAccount = useAddAccount();
  const updateAccount = useUpdateAccount();

  const isEdit = !!editAccount;

  const [form, setForm] = useState<AccountFormState>(() =>
    editAccount
      ? {
          name: editAccount.name,
          accountType: editAccount.accountType as AccountType,
          balance: editAccount.balance.toFixed(2),
        }
      : defaultAccountForm(),
  );

  // Reset when dialog opens/closes
  function handleOpenChange(o: boolean) {
    if (!o) {
      onClose();
    }
  }

  // Re-sync form when editAccount changes
  const [lastEditId, setLastEditId] = useState<string | undefined>(undefined);
  if (editAccount && editAccount.id !== lastEditId) {
    setLastEditId(editAccount.id);
    setForm({
      name: editAccount.name,
      accountType: editAccount.accountType as AccountType,
      balance: editAccount.balance.toFixed(2),
    });
  }

  async function handleSubmit() {
    const name = form.name.trim();
    if (!name) {
      toast.error("Please enter an account name.");
      return;
    }
    const balance = parseFloat(form.balance);
    if (isNaN(balance)) {
      toast.error("Please enter a valid balance.");
      return;
    }

    try {
      if (isEdit && editAccount) {
        await updateAccount.mutateAsync({
          id: editAccount.id,
          name,
          accountType: form.accountType,
          balance,
        });
        toast.success("Account updated.");
      } else {
        await addAccount.mutateAsync({
          name,
          accountType: form.accountType,
          initialBalance: balance,
        });
        toast.success("Account created.");
      }
      onClose();
      setForm(defaultAccountForm());
    } catch {
      toast.error(isEdit ? "Failed to update account." : "Failed to create account.");
    }
  }

  const isPending = addAccount.isPending || updateAccount.isPending;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-display font-bold flex items-center gap-2">
            <Wallet className="h-5 w-5 text-primary" />
            {isEdit ? "Edit Account" : "Add Account"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="account-name" className="font-semibold text-sm font-body">
              Account Name <span className="text-danger">*</span>
            </Label>
            <Input
              id="account-name"
              type="text"
              placeholder="e.g. Fairwinds Checking"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              autoFocus
            />
          </div>

          {/* Type */}
          <div className="space-y-1.5">
            <Label className="font-semibold text-sm font-body">
              Account Type <span className="text-danger">*</span>
            </Label>
            <Select
              value={form.accountType}
              onValueChange={(val) => setForm((f) => ({ ...f, accountType: val as AccountType }))}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ACCOUNT_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Balance */}
          <div className="space-y-1.5">
            <Label htmlFor="account-balance" className="font-semibold text-sm font-body">
              {isEdit ? "Current Balance" : "Initial Balance"}
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">
                $
              </span>
              <Input
                id="account-balance"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={form.balance}
                onChange={(e) => setForm((f) => ({ ...f, balance: e.target.value }))}
                className="pl-7"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} className="font-body">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isPending}
            className="gap-1.5 font-display font-semibold"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                {isEdit ? "Save Changes" : "Add Account"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Delete Confirmation ────────────────────────────────────────────────────────

interface DeleteConfirmProps {
  accountName: string;
  onConfirm: () => void;
  onCancel: () => void;
  isPending: boolean;
}

function DeleteConfirm({ accountName, onConfirm, onCancel, isPending }: DeleteConfirmProps) {
  return (
    <div className="mt-2 p-3 rounded-xl bg-danger-bg border border-danger/20 space-y-2">
      <p className="text-sm font-body text-danger font-semibold">
        Delete &ldquo;{accountName}&rdquo;?
      </p>
      <p className="text-xs text-muted-foreground font-body">
        This cannot be undone. Past transactions will keep their account reference.
      </p>
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          className="h-7 text-xs flex-1 font-body"
          onClick={onCancel}
        >
          <X className="h-3 w-3 mr-1" />
          Cancel
        </Button>
        <Button
          size="sm"
          variant="destructive"
          className="h-7 text-xs flex-1 font-body gap-1"
          onClick={onConfirm}
          disabled={isPending}
        >
          {isPending ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Trash2 className="h-3 w-3" />
          )}
          Delete
        </Button>
      </div>
    </div>
  );
}

// ── Main AccountsTab ───────────────────────────────────────────────────────────

export function AccountsTab() {
  const { data: accounts, isLoading } = useAllAccounts();
  const deleteAccount = useDeleteAccount();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<{
    id: string;
    name: string;
    accountType: string;
    balance: number;
  } | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const allAccounts = accounts ?? [];
  const totalBalance = allAccounts.reduce((sum, a) => sum + a.balance, 0);

  function openAddDialog() {
    setEditingAccount(null);
    setDialogOpen(true);
  }

  function openEditDialog(account: { id: string; name: string; accountType: string; balance: number }) {
    setEditingAccount(account);
    setDialogOpen(true);
  }

  function closeDialog() {
    setDialogOpen(false);
    setEditingAccount(null);
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await deleteAccount.mutateAsync(id);
      toast.success("Account deleted.");
      setConfirmDeleteId(null);
    } catch {
      toast.error("Failed to delete account.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="px-1 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold font-display text-foreground">Accounts</h2>
          <p className="text-sm text-muted-foreground mt-0.5 font-body">
            Manage checking, savings, and credit card accounts
          </p>
        </div>
        <Button
          onClick={openAddDialog}
          size="sm"
          className="shrink-0 gap-1.5 font-display font-semibold"
        >
          <Plus className="h-4 w-4" />
          Add Account
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="card-shadow border-border">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-display font-semibold">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <Wallet className="h-4 w-4 text-primary" />
              </div>
              Total Accounts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <p className="text-2xl font-bold font-display text-primary">{allAccounts.length}</p>
            )}
          </CardContent>
        </Card>

        <Card className="card-shadow border-border">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-display font-semibold">
              <div className="p-1.5 rounded-lg bg-success/10">
                <Landmark className="h-4 w-4 text-success" />
              </div>
              Combined Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-28" />
            ) : (
              <p className="text-2xl font-bold font-display text-success">
                ${fmt(totalBalance)}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Accounts list */}
      <Card className="card-shadow border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-display font-semibold flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <CreditCard className="h-4 w-4 text-primary" />
            </div>
            Your Accounts
            {allAccounts.length > 0 && (
              <span className="ml-auto text-xs font-normal text-muted-foreground">
                {allAccounts.length} {allAccounts.length === 1 ? "account" : "accounts"}
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
          ) : allAccounts.length === 0 ? (
            <div className="text-center py-10 space-y-2">
              <Wallet className="h-10 w-10 text-muted-foreground/30 mx-auto" />
              <p className="text-sm font-body text-muted-foreground">No accounts yet.</p>
              <p className="text-xs text-muted-foreground/70 font-body">
                Tap &ldquo;Add Account&rdquo; to create your first one.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {allAccounts.map((account) => (
                <div key={account.id}>
                  <div className="flex items-center justify-between gap-3 px-3 py-3 rounded-xl bg-secondary border border-border/50">
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-semibold text-sm font-body text-foreground">
                          {account.name}
                        </span>
                        <AccountTypeBadge type={account.accountType} />
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span
                        className={cn(
                          "text-base font-bold font-display",
                          account.balance < 0 ? "text-danger" : "text-foreground",
                        )}
                      >
                        ${fmt(account.balance)}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-primary hover:bg-primary/10"
                        onClick={() => openEditDialog(account)}
                        aria-label={`Edit ${account.name}`}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-danger hover:bg-danger-bg"
                        onClick={() =>
                          setConfirmDeleteId(
                            confirmDeleteId === account.id ? null : account.id,
                          )
                        }
                        aria-label={`Delete ${account.name}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  {/* Inline delete confirmation */}
                  {confirmDeleteId === account.id && (
                    <DeleteConfirm
                      accountName={account.name}
                      onConfirm={() => handleDelete(account.id)}
                      onCancel={() => setConfirmDeleteId(null)}
                      isPending={deletingId === account.id}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add / Edit dialog */}
      <AccountDialog
        open={dialogOpen}
        onClose={closeDialog}
        editAccount={editingAccount}
      />
    </div>
  );
}
