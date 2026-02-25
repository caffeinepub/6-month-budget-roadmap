import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useActor } from "./useActor";

// ─── Financial Overview (load all at once) ────────────────────────────────────

export function useFinancialOverview() {
  const { actor, isFetching } = useActor();
  return useQuery<{ housingFund: number; savingsAmount: number; checkingBalance: number }>({
    queryKey: ["financialOverview"],
    queryFn: async () => {
      if (!actor) return { housingFund: 0, savingsAmount: 10563, checkingBalance: 0 };
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

// ─── Checking Balance ─────────────────────────────────────────────────────────

export function useCheckingBalance() {
  const { actor, isFetching } = useActor();
  return useQuery<number>({
    queryKey: ["checkingBalance"],
    queryFn: async () => {
      if (!actor) return 0;
      return actor.getCheckingBalance();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUpdateCheckingBalance() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (amount: number) => {
      if (!actor) return;
      await actor.updateCheckingBalance(amount);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["checkingBalance"] });
      qc.invalidateQueries({ queryKey: ["financialOverview"] });
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
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["allChecklistStates"] }),
  });
}

// ─── Financial Summary (extended) ────────────────────────────────────────────

export function useFinancialSummary() {
  const { actor, isFetching } = useActor();
  return useQuery<{
    savingsAmount: number;
    housingFund: number;
    checkingBalance: number;
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
          checkingBalance: 0,
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
    Array<{ id: string; date: string; note?: string; category: string; amount: number }>
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
    }: {
      amount: number;
      date: string;
      category: string;
      note: string | null;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.addIncomeEntry(amount, date, category, note);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allIncomeEntries"] });
      qc.invalidateQueries({ queryKey: ["financialSummary"] });
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
    }: {
      amount: number;
      date: string;
      mainCategory: string;
      subCategory: string;
      note: string | null;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.addReceiptEntry(amount, date, mainCategory, subCategory, note);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allReceiptEntries"] });
      qc.invalidateQueries({ queryKey: ["financialSummary"] });
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
