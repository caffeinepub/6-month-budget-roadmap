import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Receipt {
    id: string;
    subCategory: string;
    date: string;
    note?: string;
    amount: number;
    mainCategory: string;
}
export interface Income {
    id: string;
    date: string;
    note?: string;
    category: string;
    amount: number;
}
export interface backendInterface {
    addIncomeEntry(amount: number, date: string, category: string, note: string | null): Promise<string>;
    addNote(week: string, note: string): Promise<void>;
    addReceiptEntry(amount: number, date: string, mainCategory: string, subCategory: string, note: string | null): Promise<string>;
    deleteIncomeEntry(id: string): Promise<void>;
    deleteReceiptEntry(id: string): Promise<void>;
    getAllChecklistStates(): Promise<Array<[string, Array<[string, boolean]>]>>;
    getAllIncomeEntries(): Promise<Array<Income>>;
    getAllNotes(): Promise<Array<[string, string]>>;
    getAllReceiptEntries(): Promise<Array<Receipt>>;
    getCheckingBalance(): Promise<number>;
    getFinancialOverview(): Promise<{
        housingFund: number;
        savingsAmount: number;
        checkingBalance: number;
    }>;
    getFinancialSummary(): Promise<{
        totalIncome: number;
        housingFund: number;
        totalBills: number;
        savingsAmount: number;
        totalHouseholdGoods: number;
        checkingBalance: number;
    }>;
    getGrocerySpending(week: string): Promise<number>;
    getHousingFund(): Promise<number>;
    getMonthlyIncomeTotal(month: string): Promise<number>;
    getMonthlyReceiptTotal(month: string): Promise<number>;
    getNonEssentialSpending(week: string): Promise<number>;
    getNote(week: string): Promise<string | null>;
    getSavingsAmount(): Promise<number>;
    getTotalBills(): Promise<number>;
    getTotalHouseholdGoods(): Promise<number>;
    getTotalIncome(): Promise<number>;
    getWeeklyReceiptTotal(week: string): Promise<number>;
    toggleChecklistItem(group: string, item: string): Promise<boolean>;
    updateCheckingBalance(amount: number): Promise<void>;
    updateGrocerySpending(week: string, amount: number): Promise<void>;
    updateHousingFund(amount: number): Promise<void>;
    updateNonEssentialSpending(week: string, amount: number): Promise<void>;
    updateReceiptCategory(id: string, mainCategory: string, subCategory: string): Promise<void>;
    updateSavingsAmount(amount: number): Promise<void>;
}
