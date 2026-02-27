import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useActor } from "./useActor";

// ─── Financial Overview (load all at once) ────────────────────────────────────

export function useFinancialOverview() {
  const { actor, isFetching } = useActor();
  return useQuery<{ housingFund: number; savingsAmount: number }>({
    queryKey: ["financialOverview"],
    queryFn: async () => {
      if (!actor) return { housingFund: 0, savingsAmount: 10563 };
      return actor.getFinancialOverview();
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Savings ──────────────────────────────────────────────────────────────────

export function useSavingsAmount() {
  const { actor, isFetching } = useActor();
  return useQuery<number>({
    queryKey: ["savingsAmount"],
    queryFn: async () => {
      if (!actor) return 10563;
      return actor.getSavingsAmount();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUpdateSavingsAmount() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (amount: number) => {
      if (!actor) return;
      await actor.updateSavingsAmount(amount);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["savingsAmount"] });
      qc.invalidateQueries({ queryKey: ["financialOverview"] });
    },
  });
}

// ─── Housing Fund ─────────────────────────────────────────────────────────────

export function useHousingFund() {
  const { actor, isFetching } = useActor();
  return useQuery<number>({
    queryKey: ["housingFund"],
    queryFn: async () => {
      if (!actor) return 0;
      return actor.getHousingFund();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUpdateHousingFund() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (amount: number) => {
      if (!actor) return;
      await actor.updateHousingFund(amount);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["housingFund"] });
      qc.invalidateQueries({ queryKey: ["financialOverview"] });
    },
  });
}

// ─── Checking Balance (deprecated — balance is now managed via Accounts) ──────

export function useCheckingBalance() {
  return useQuery<number>({
    queryKey: ["checkingBalance"],
    queryFn: async () => 0,
    enabled: false,
  });
}

export function useUpdateCheckingBalance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (_amount: number) => {
      // No-op: checking balance is now managed through individual accounts
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["checkingBalance"] });
    },
  });
}

// ─── Grocery Spending ─────────────────────────────────────────────────────────

export function useGrocerySpending(week: string) {
  const { actor, isFetching } = useActor();
  return useQuery<number>({
    queryKey: ["grocerySpending", week],
    queryFn: async () => {
      if (!actor) return 0;
      return actor.getGrocerySpending(week);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUpdateGrocerySpending() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ week, amount }: { week: string; amount: number }) => {
      if (!actor) return;
      await actor.updateGrocerySpending(week, amount);
    },
    onSuccess: (_data, { week }) =>
      qc.invalidateQueries({ queryKey: ["grocerySpending", week] }),
  });
}

// ─── Non-Essential Spending ───────────────────────────────────────────────────

export function useNonEssentialSpending(week: string) {
  const { actor, isFetching } = useActor();
  return useQuery<number>({
    queryKey: ["nonEssentialSpending", week],
    queryFn: async () => {
      if (!actor) return 0;
      return actor.getNonEssentialSpending(week);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUpdateNonEssentialSpending() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ week, amount }: { week: string; amount: number }) => {
      if (!actor) return;
      await actor.updateNonEssentialSpending(week, amount);
    },
    onSuccess: (_data, { week }) =>
      qc.invalidateQueries({ queryKey: ["nonEssentialSpending", week] }),
  });
}

// ─── Checklist ────────────────────────────────────────────────────────────────

export function useAllChecklistStates() {
  const { actor, isFetching } = useActor();
  return useQuery<Array<[string, Array<[string, boolean]>]>>({
    queryKey: ["allChecklistStates"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllChecklistStates();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useToggleChecklistItem() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ group, item }: { group: string; item: string }) => {
      if (!actor) return false;
      return actor.toggleChecklistItem(group, item);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["allChecklistStates"] }),
  });
}

// ─── Financial Summary (extended) ────────────────────────────────────────────

export function useFinancialSummary() {
  const { actor, isFetching } = useActor();
  return useQuery<{
    savingsAmount: number;
    housingFund: number;
    totalIncome: number;
    totalBills: number;
    totalHouseholdGoods: number;
  }>({
    queryKey: ["financialSummary"],
    queryFn: async () => {
      if (!actor)
        return {
          savingsAmount: 10563,
          housingFund: 0,
          totalIncome: 0,
          totalBills: 0,
          totalHouseholdGoods: 0,
        };
      return actor.getFinancialSummary();
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Income ───────────────────────────────────────────────────────────────────

export function useAllIncomeEntries() {
  const { actor, isFetching } = useActor();
  return useQuery<
    Array<{
      id: string;
      date: string;
      note?: string;
      user: string;
      category: string;
      amount: number;
    }>
  >({
    queryKey: ["allIncomeEntries"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllIncomeEntries();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddIncomeEntry() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      amount,
      date,
      category,
      note,
      user,
      accountId,
    }: {
      amount: number;
      date: string;
      category: string;
      note: string | null;
      user: string;
      accountId: string;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.addIncomeEntry(
        amount,
        date,
        category,
        note,
        user,
        accountId,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allIncomeEntries"] });
      qc.invalidateQueries({ queryKey: ["financialSummary"] });
      qc.invalidateQueries({ queryKey: ["allAccounts"] });
    },
  });
}

export function useDeleteIncomeEntry() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.deleteIncomeEntry(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allIncomeEntries"] });
      qc.invalidateQueries({ queryKey: ["financialSummary"] });
    },
  });
}

// ─── Receipts ─────────────────────────────────────────────────────────────────

export function useAllReceiptEntries() {
  const { actor, isFetching } = useActor();
  return useQuery<
    Array<{
      id: string;
      subCategory: string;
      date: string;
      note?: string;
      user: string;
      amount: number;
      mainCategory: string;
    }>
  >({
    queryKey: ["allReceiptEntries"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllReceiptEntries();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddReceiptEntry() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      amount,
      date,
      mainCategory,
      subCategory,
      note,
      user,
      accountId,
    }: {
      amount: number;
      date: string;
      mainCategory: string;
      subCategory: string;
      note: string | null;
      user: string;
      accountId: string;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.addReceiptEntry(
        amount,
        date,
        mainCategory,
        subCategory,
        note,
        user,
        accountId,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allReceiptEntries"] });
      qc.invalidateQueries({ queryKey: ["financialSummary"] });
      qc.invalidateQueries({ queryKey: ["allAccounts"] });
    },
  });
}

export function useDeleteReceiptEntry() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.deleteReceiptEntry(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allReceiptEntries"] });
      qc.invalidateQueries({ queryKey: ["financialSummary"] });
    },
  });
}

export function useUpdateReceiptCategory() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      mainCategory,
      subCategory,
    }: {
      id: string;
      mainCategory: string;
      subCategory: string;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.updateReceiptCategory(id, mainCategory, subCategory);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allReceiptEntries"] });
      qc.invalidateQueries({ queryKey: ["financialSummary"] });
    },
  });
}

// ─── Accounts ─────────────────────────────────────────────────────────────────

export function useAllAccounts() {
  const { actor, isFetching } = useActor();
  return useQuery<
    Array<{ id: string; balance: number; name: string; accountType: string }>
  >({
    queryKey: ["allAccounts"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllAccounts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddAccount() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      name,
      accountType,
      initialBalance,
    }: {
      name: string;
      accountType: string;
      initialBalance: number;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.addAccount(name, accountType, initialBalance);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allAccounts"] });
    },
  });
}

export function useUpdateAccount() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      name,
      accountType,
      balance,
    }: {
      id: string;
      name: string;
      accountType: string;
      balance: number;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.updateAccount(id, name, accountType, balance);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allAccounts"] });
    },
  });
}

export function useDeleteAccount() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.deleteAccount(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allAccounts"] });
    },
  });
}
