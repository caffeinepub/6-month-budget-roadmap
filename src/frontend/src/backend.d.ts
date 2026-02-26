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
    accountId: string;
    date: string;
    note?: string;
    user: string;
    amount: number;
    mainCategory: string;
}
export interface Account {
    id: string;
    balance: number;
    name: string;
    accountType: string;
}
export interface Income {
    id: string;
    accountId: string;
    date: string;
    note?: string;
    user: string;
    category: string;
    amount: number;
}
export interface backendInterface {
    addAccount(name: string, accountType: string, initialBalance: number): Promise<string>;
    addIncomeEntry(amount: number, date: string, category: string, note: string | null, user: string, accountId: string): Promise<string>;
    addNote(week: string, note: string): Promise<void>;
    addReceiptEntry(amount: number, date: string, mainCategory: string, subCategory: string, note: string | null, user: string, accountId: string): Promise<string>;
    deleteAccount(id: string): Promise<void>;
    deleteIncomeEntry(id: string): Promise<void>;
    deleteReceiptEntry(id: string): Promise<void>;
    getAccount(id: string): Promise<Account | null>;
    getAllAccounts(): Promise<Array<Account>>;
    getAllChecklistStates(): Promise<Array<[string, Array<[string, boolean]>]>>;
    getAllIncomeEntries(): Promise<Array<Income>>;
    getAllNotes(): Promise<Array<[string, string]>>;
    getAllReceiptEntries(): Promise<Array<Receipt>>;
    getFinancialOverview(): Promise<{
        housingFund: number;
        savingsAmount: number;
    }>;
    getFinancialSummary(): Promise<{
        totalIncome: number;
        housingFund: number;
        totalBills: number;
        savingsAmount: number;
        totalHouseholdGoods: number;
    }>;
    getFinancialSummaryByUser(user: string): Promise<{
        totalIncome: number;
        totalBills: number;
        totalHouseholdGoods: number;
    }>;
    getGrocerySpending(week: string): Promise<number>;
    getHousingFund(): Promise<number>;
    getIncomeEntriesByUser(user: string): Promise<Array<Income>>;
    getMonthlyIncomeTotal(month: string): Promise<number>;
    getMonthlyReceiptTotal(month: string): Promise<number>;
    getNonEssentialSpending(week: string): Promise<number>;
    getNote(week: string): Promise<string | null>;
    getReceiptEntriesByUser(user: string): Promise<Array<Receipt>>;
    getSavingsAmount(): Promise<number>;
    getTotalBills(): Promise<number>;
    getTotalHouseholdGoods(): Promise<number>;
    getTotalIncome(): Promise<number>;
    getWeeklyReceiptTotal(week: string): Promise<number>;
    toggleChecklistItem(group: string, item: string): Promise<boolean>;
    updateAccount(id: string, name: string, accountType: string, balance: number): Promise<void>;
    updateGrocerySpending(week: string, amount: number): Promise<void>;
    updateHousingFund(amount: number): Promise<void>;
    updateNonEssentialSpending(week: string, amount: number): Promise<void>;
    updateReceiptCategory(id: string, mainCategory: string, subCategory: string): Promise<void>;
    updateSavingsAmount(amount: number): Promise<void>;
}
