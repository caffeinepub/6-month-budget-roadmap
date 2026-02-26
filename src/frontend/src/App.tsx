import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toaster } from "@/components/ui/sonner";
import {
  LayoutDashboard,
  MapIcon,
  CalendarRange,
  PiggyBank,
  BookOpen,
  Heart,
  DollarSign,
  ScanLine,
  CalendarCheck,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DashboardTab } from "@/components/tabs/DashboardTab";
import { Month1RoadmapTab } from "@/components/tabs/Month1RoadmapTab";
import { Months2to6Tab } from "@/components/tabs/Months2to6Tab";
import { SavingsHousingTab } from "@/components/tabs/SavingsHousingTab";
import { RulesTab } from "@/components/tabs/RulesTab";
import { IncomeTab } from "@/components/tabs/IncomeTab";
import { ReceiptsTab } from "@/components/tabs/ReceiptsTab";
import { WeeklySummaryTab } from "@/components/tabs/WeeklySummaryTab";
import { AccountsTab } from "@/components/tabs/AccountsTab";
import { useActiveUser } from "@/hooks/useActiveUser";

export default function App() {
  const { activeUser, setActiveUser } = useActiveUser();

  return (
    <div className="app-bg min-h-screen">
      <Toaster />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-card/90 backdrop-blur-sm border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10">
            <MapIcon className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold font-display text-foreground leading-tight">
              6-Month Budget Roadmap
            </h1>
            <p className="text-xs text-muted-foreground font-body leading-tight">
              Christopher & Tamara · Family of 5
            </p>
          </div>
          {/* Active user toggle pill */}
          <div className="bg-secondary border border-border rounded-full p-0.5 flex gap-0.5 shrink-0">
            <button
              type="button"
              onClick={() => setActiveUser("Christopher")}
              className={cn(
                "text-xs font-semibold font-body px-3 py-1 rounded-full transition-colors",
                activeUser === "Christopher"
                  ? "bg-blue-500 text-white"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Christopher
            </button>
            <button
              type="button"
              onClick={() => setActiveUser("Tamara")}
              className={cn(
                "text-xs font-semibold font-body px-3 py-1 rounded-full transition-colors",
                activeUser === "Tamara"
                  ? "bg-rose-500 text-white"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Tamara
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-2xl mx-auto px-4 pb-24">
        <Tabs defaultValue="dashboard" className="mt-5">
          {/* Tab nav */}
          <TabsList className="w-full h-auto grid grid-cols-9 bg-card border border-border p-1 rounded-xl mb-6 card-shadow">
            <TabsTrigger
              value="dashboard"
              className="flex flex-col items-center gap-0.5 py-2 px-1 text-xs font-display font-semibold rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
            >
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline text-[10px]">Dashboard</span>
              <span className="sm:hidden text-[10px]">Home</span>
            </TabsTrigger>
            <TabsTrigger
              value="month1"
              className="flex flex-col items-center gap-0.5 py-2 px-1 text-xs font-display font-semibold rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
            >
              <MapIcon className="h-4 w-4" />
              <span className="text-[10px]">Month 1</span>
            </TabsTrigger>
            <TabsTrigger
              value="months2to6"
              className="flex flex-col items-center gap-0.5 py-2 px-1 text-xs font-display font-semibold rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
            >
              <CalendarRange className="h-4 w-4" />
              <span className="text-[10px]">Months 2–6</span>
            </TabsTrigger>
            <TabsTrigger
              value="savings"
              className="flex flex-col items-center gap-0.5 py-2 px-1 text-xs font-display font-semibold rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
            >
              <PiggyBank className="h-4 w-4" />
              <span className="text-[10px]">Savings</span>
            </TabsTrigger>
            <TabsTrigger
              value="rules"
              className="flex flex-col items-center gap-0.5 py-2 px-1 text-xs font-display font-semibold rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
            >
              <BookOpen className="h-4 w-4" />
              <span className="text-[10px]">Rules</span>
            </TabsTrigger>
            <TabsTrigger
              value="income"
              className="flex flex-col items-center gap-0.5 py-2 px-1 text-xs font-display font-semibold rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
            >
              <DollarSign className="h-4 w-4" />
              <span className="text-[10px]">Income</span>
            </TabsTrigger>
            <TabsTrigger
              value="receipts"
              className="flex flex-col items-center gap-0.5 py-2 px-1 text-xs font-display font-semibold rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
            >
              <ScanLine className="h-4 w-4" />
              <span className="text-[10px]">Receipts</span>
            </TabsTrigger>
            <TabsTrigger
              value="summary"
              className="flex flex-col items-center gap-0.5 py-2 px-1 text-xs font-display font-semibold rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
            >
              <CalendarCheck className="h-4 w-4" />
              <span className="text-[10px]">Summary</span>
            </TabsTrigger>
            <TabsTrigger
              value="accounts"
              className="flex flex-col items-center gap-0.5 py-2 px-1 text-xs font-display font-semibold rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
            >
              <Wallet className="h-4 w-4" />
              <span className="text-[10px]">Accounts</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-0 focus-visible:outline-none">
            <DashboardTab />
          </TabsContent>
          <TabsContent value="month1" className="mt-0 focus-visible:outline-none">
            <Month1RoadmapTab />
          </TabsContent>
          <TabsContent value="months2to6" className="mt-0 focus-visible:outline-none">
            <Months2to6Tab />
          </TabsContent>
          <TabsContent value="savings" className="mt-0 focus-visible:outline-none">
            <SavingsHousingTab />
          </TabsContent>
          <TabsContent value="rules" className="mt-0 focus-visible:outline-none">
            <RulesTab />
          </TabsContent>
          <TabsContent value="income" className="mt-0 focus-visible:outline-none">
            <IncomeTab />
          </TabsContent>
          <TabsContent value="receipts" className="mt-0 focus-visible:outline-none">
            <ReceiptsTab />
          </TabsContent>
          <TabsContent value="summary" className="mt-0 focus-visible:outline-none">
            <WeeklySummaryTab />
          </TabsContent>
          <TabsContent value="accounts" className="mt-0 focus-visible:outline-none">
            <AccountsTab />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/60 py-4">
        <div className="max-w-2xl mx-auto px-4 flex items-center justify-center gap-1.5 text-xs text-muted-foreground font-body">
          <span>© 2026. Built with</span>
          <Heart className="h-3 w-3 text-danger fill-danger" />
          <span>using</span>
          <a
            href="https://caffeine.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary font-semibold hover:underline"
          >
            caffeine.ai
          </a>
        </div>
      </footer>
    </div>
  );
}
