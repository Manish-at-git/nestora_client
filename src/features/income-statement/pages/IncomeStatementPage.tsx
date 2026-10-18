import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  BarChart3,
  Building2,
  Coins,
  CreditCard,
  FileSpreadsheet,
  FileText,
  Lightbulb,
  MoreHorizontal,
  Pencil,
  Percent,
  Plus,
  ShieldCheck,
  UploadCloud,
  Wallet,
  Wrench,
  Zap,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";

import { useAppSelector } from "@/app/hooks";
import { AccessRestricted, EmptyState, LoadingSpinner } from "@/components/common";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select } from "@/components/ui/select";
import { FEATURES } from "@/constants/featureCodes";
import { usePageHeader } from "@/hooks/usePageHeader";
import { usePermission } from "@/hooks/usePermission";
import apiClient from "@/services/api/apiClient";
import {
  useGetIncomeStatementPeriodsQuery,
  useGetIncomeStatementQuery,
} from "../api";
import {
  IncomeStatementEditorModal,
  IncomeStatementImportModal,
} from "../components";
import type {
  IncomeStatement,
  IncomeStatementInsight,
  IncomeStatementItem,
} from "../types";

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const moneyWithDecimals = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

const months = [
  "Apr", "May", "Jun", "Jul", "Aug", "Sep",
  "Oct", "Nov", "Dec", "Jan", "Feb", "Mar",
];

const statementGridStyle: React.CSSProperties = {
  gridTemplateColumns: "minmax(0, 1fr) 145px 145px 72px",
};

const growthText = (value?: string | null) =>
  value == null
    ? "No prior statement"
    : `${Number(value) >= 0 ? "+" : ""}${value}% vs last year`;

const variancePercent = (current: number, previous: number) =>
  previous === 0 ? 0 : ((current - previous) / Math.abs(previous)) * 100;

const getItemIcon = (item: IncomeStatementItem) => {
  const name = item.name.toLowerCase();

  if (item.item_type === "income") {
    if (name.includes("interest")) return Coins;
    if (name.includes("other") || name.includes("rental")) return Building2;
    return Wallet;
  }

  if (name.includes("utility") || name.includes("electric") || name.includes("water")) {
    return Zap;
  }
  if (name.includes("security")) return ShieldCheck;
  if (name.includes("administrative") || name.includes("professional")) return FileText;
  if (name.includes("maintenance") || name.includes("repair")) return Wrench;
  return CreditCard;
};

const Kpi: React.FC<{
  label: string;
  value: string;
  note: string;
  tone: string;
  icon: React.ReactNode;
}> = ({ label, value, note, tone, icon }) => {
  const iconBackground =
    label === "Total income"
      ? "bg-emerald-100"
      : label === "Total expenses"
        ? "bg-rose-100"
        : label === "Net surplus"
          ? "bg-violet-100"
          : "bg-sky-100";

  return (
    <div className={`rounded-xl border bg-white p-3 shadow-sm ${tone}`}>
      <div className="flex items-center gap-2.5">
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${iconBackground}`}>
          {icon}
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">{label}</p>
          <p className="mt-0.5 text-xl font-bold tracking-tight text-slate-900">{value}</p>
          <p className="mt-0.5 text-[10px] font-semibold text-emerald-700">↗ {note}</p>
        </div>
      </div>
    </div>
  );
};

const LineItem: React.FC<{ item: IncomeStatementItem }> = ({ item }) => {
  const Icon = getItemIcon(item);

  return (
    <div
      className="grid items-center gap-4 border-b border-slate-100 px-1 py-2 text-sm last:border-b-0"
      style={statementGridStyle}
    >
      <span className="flex min-w-0 items-center gap-2">
        <span
          className={`rounded-md p-1 ${
            item.item_type === "income"
              ? "bg-emerald-50 text-emerald-600"
              : "bg-rose-50 text-rose-600"
          }`}
        >
          <Icon className="h-3.5 w-3.5" />
        </span>
        <span className="truncate">{item.name}</span>
      </span>
      <span className="text-right font-mono">
        {moneyWithDecimals.format(Number(item.current_amount))}
      </span>
      <span className="text-right font-mono text-slate-500">
        {moneyWithDecimals.format(Number(item.previous_amount))}
      </span>
      <span className="text-right font-mono">
        {Number(item.variance_pct).toFixed(0)}%
      </span>
    </div>
  );
};

const SectionTotal: React.FC<{
  label: string;
  current: number;
  previous: number;
  tone: string;
}> = ({ label, current, previous, tone }) => (
  <div
    className={`mt-3 grid items-center gap-4 rounded-lg px-3 py-2 text-sm font-bold ${tone}`}
    style={statementGridStyle}
  >
    <span>{label}</span>
    <span className="text-right font-mono">{money.format(current)}</span>
    <span className="text-right font-mono">{money.format(previous)}</span>
    <span className="text-right font-mono">
      {variancePercent(current, previous).toFixed(0)}%
    </span>
  </div>
);

const InsightCard: React.FC<{ insight: IncomeStatementInsight }> = ({ insight }) => {
  const type = insight.type.toLowerCase();
  const isExpense = type.includes("expense");
  const isSurplus = type.includes("surplus");
  const Icon = isExpense
    ? ArrowDown
    : isSurplus
      ? Coins
      : type.includes("margin")
        ? Percent
        : ArrowUp;
  const tone = isExpense
    ? "bg-blue-50 text-blue-600"
    : isSurplus
      ? "bg-violet-50 text-violet-600"
      : type.includes("margin")
        ? "bg-amber-50 text-amber-600"
        : "bg-emerald-50 text-emerald-600";

  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white px-3 py-2.5">
      <span className={`rounded-full p-2 ${tone}`}><Icon className="h-4 w-4" /></span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-bold text-slate-800">{insight.title}</p>
        <p className="truncate text-[10px] text-slate-500">{insight.description}</p>
      </div>
      <span className="text-slate-300">›</span>
    </div>
  );
};

export const IncomeStatementPage: React.FC = () => {
  const associationId = useAppSelector((state) => state.ui.activeAssociationId);
  const { canView, canCreate, canUpdate, isLoading: permissionLoading } =
    usePermission(FEATURES.INCOME_STATEMENT.FEATURE_CODE);
  const [selectedPeriod, setSelectedPeriod] = useState("");
  const [customDate, setCustomDate] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorStatement, setEditorStatement] = useState<IncomeStatement | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const { data: periods = [], isLoading: periodsLoading } = useGetIncomeStatementPeriodsQuery(
    String(associationId || ""),
    { skip: !canView || !associationId || associationId === "ALL" },
  );

  useEffect(() => {
    if (!selectedPeriod && periods.length) setSelectedPeriod(periods[0]);
  }, [periods, selectedPeriod]);

  const queryPeriod = customDate || selectedPeriod;
  const { data: statement, isLoading } = useGetIncomeStatementQuery(
    { associationId: String(associationId || ""), fiscalPeriod: queryPeriod || undefined },
    { skip: !canView || !associationId || associationId === "ALL" },
  );
  usePageHeader({ title: "Income Statement", description: "Review association income, expenses, and net surplus by fiscal period." });

  const totals = statement
    ? {
        income: Number(statement.total_income),
        expenses: Number(statement.total_expenses),
        surplus: Number(statement.net_surplus),
        margin: Number(statement.operating_margin_pct),
      }
    : { income: 0, expenses: 0, surplus: 0, margin: 0 };
  const incomeItems = statement?.items.filter((item) => item.item_type === "income") || [];
  const expenseItems = statement?.items.filter((item) => item.item_type === "expense") || [];
  const incomePrevious = incomeItems.reduce((total, item) => total + Number(item.previous_amount), 0);
  const expensePrevious = expenseItems.reduce((total, item) => total + Number(item.previous_amount), 0);
  const previousSurplus = incomePrevious - expensePrevious;
  const chartData = useMemo(
    () => statement?.monthly_trend?.length
      ? statement.monthly_trend
      : months.map((month) => ({ month, income: totals.income / 12, expenses: totals.expenses / 12 })),
    [statement?.monthly_trend, totals.income, totals.expenses],
  );
  const insightCards = useMemo(
    () => statement?.insights?.length
      ? statement.insights
      : [
          { type: "income", title: `Income ${statement?.income_growth_pct ? `increased by ${statement.income_growth_pct}%` : "overview"}`, description: "Based on the current fiscal-period statement." },
          { type: "expenses", title: `Expenses ${statement?.expenses_growth_pct ? `increased by ${statement.expenses_growth_pct}%` : "overview"}`, description: "Review expense line items for changes." },
          { type: "surplus", title: `Net surplus ${statement?.net_surplus_growth_pct ? `improved by ${statement.net_surplus_growth_pct}%` : "reported"}`, description: "Current income less current expenses." },
          { type: "margin", title: `Operating margin at ${totals.margin.toFixed(1)}%`, description: "Operating margin for this fiscal period." },
        ],
    [statement, totals.margin],
  );

  const openCreate = () => { setEditorStatement(null); setEditorOpen(true); };
  const openUpdate = () => { setEditorStatement(statement); setEditorOpen(true); };
  const exportExcel = async () => {
    if (!statement) return;
    const response = await apiClient.get("/income-statements/export", {
      params: { association_id: String(associationId), fiscal_period: statement.fiscal_period },
      responseType: "blob",
    });
    const url = URL.createObjectURL(response.data);
    const link = document.createElement("a");
    link.href = url;
    link.download = `income_statement_${statement.id}.xlsx`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Income Statement exported");
  };

  if (permissionLoading || periodsLoading || isLoading) return <LoadingSpinner />;
  if (!canView) return <AccessRestricted moduleName="Income Statement" showAction />;
  if (!associationId || associationId === "ALL") {
    return (
      <EmptyState
        icon={BarChart3}
        title="Select an association"
        description="Choose an association to view the Income Statement."
        className="min-h-[420px]"
      />
    );
  }

  return (
    <>
      <div className="space-y-5">
        <div className="flex flex-col gap-3 rounded-2xl bg-white lg:flex-row lg:items-center justify-end">
          <div className="flex shrink-0 items-center gap-2 whitespace-nowrap">
            <Select icon={<BarChart3 size={15} />} options={periods.map((period) => ({ value: period, label: period }))} value={customDate ? "" : selectedPeriod} placeholder="Saved periods" onChange={(event) => { setCustomDate(""); setSelectedPeriod(event.target.value); }} size="sm" containerClassName="w-auto" className="min-w-44" />
            <DatePicker value={customDate} onChange={(value) => setCustomDate(value || "")} placeholder="Custom period date" displayFormat="MM/dd/yyyy" size="sm" containerClassName="w-auto" triggerClassName="h-8 min-w-36 text-xs" />
            <DropdownMenu><DropdownMenuTrigger asChild><Button variant="outline" size="iconSm" aria-label="Income Statement actions"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onSelect={exportExcel}><FileSpreadsheet className="h-4 w-4" /> Export Excel</DropdownMenuItem>{canCreate && <DropdownMenuItem onSelect={openCreate}><Plus className="h-4 w-4" /> Create manually</DropdownMenuItem>}<DropdownMenuItem onSelect={() => setImportOpen(true)}><UploadCloud className="h-4 w-4" /> Import Excel</DropdownMenuItem></DropdownMenuContent></DropdownMenu>
            {statement && canUpdate ? <Button onClick={openUpdate}><Pencil className="h-4 w-4" /> Update Income Statement</Button> : canCreate ? <Button onClick={openCreate}><Plus className="h-4 w-4" /> Create manually</Button> : null}
          </div>
        </div>

        {!statement ? <EmptyState icon={FileText} title="No Income Statement for this period" description="Create a fiscal-period statement or choose another saved period." /> : <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"><Kpi label="Total income" value={money.format(totals.income)} note={growthText(statement.income_growth_pct)} tone="border-emerald-100 bg-emerald-50/60" icon={<ArrowUp className="h-5 w-5 text-emerald-600" />} /><Kpi label="Total expenses" value={money.format(totals.expenses)} note={growthText(statement.expenses_growth_pct)} tone="border-rose-100 bg-rose-50/60" icon={<ArrowDown className="h-5 w-5 text-rose-600" />} /><Kpi label="Net surplus" value={money.format(totals.surplus)} note={growthText(statement.net_surplus_growth_pct)} tone="border-violet-100 bg-violet-50/60" icon={<Coins className="h-5 w-5 text-violet-600" />} /><Kpi label="Operating margin" value={`${totals.margin.toFixed(1)}%`} note={growthText(statement.operating_margin_growth_pct)} tone="border-sky-100 bg-sky-50/60" icon={<Percent className="h-5 w-5 text-sky-600" />} /></div>
          <div className="grid gap-5 xl:grid-cols-12"><section className="rounded-2xl border border-slate-200 bg-white p-5 xl:col-span-8"><div className="mb-4 flex items-center justify-between"><h3 className="text-lg font-semibold text-slate-900">Income Statement</h3><span className="text-xs text-slate-400">{statement.fiscal_period}</span></div><div className="grid gap-4 border-b border-slate-100 pb-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400" style={statementGridStyle}><span>Particulars</span><span className="text-right">Current Year (₹)</span><span className="text-right">Previous Year (₹)</span><span className="text-right">Variance (%)</span></div><SectionTotal label="Income" current={totals.income} previous={incomePrevious} tone="bg-emerald-50 text-emerald-800" />{incomeItems.map((item) => <LineItem item={item} key={item.id} />)}<SectionTotal label="Expenses" current={totals.expenses} previous={expensePrevious} tone="bg-rose-50 text-rose-800" />{expenseItems.map((item) => <LineItem item={item} key={item.id} />)}<div className="mt-4 grid items-center gap-4 rounded-lg border border-sky-100 bg-sky-50 px-3 py-3 text-sm font-bold text-sky-800" style={statementGridStyle}><span>Net Surplus / (Deficit)</span><span className="text-right font-mono">{money.format(totals.surplus)}</span><span className="text-right font-mono">{money.format(previousSurplus)}</span><span className="text-right font-mono">{variancePercent(totals.surplus, previousSurplus).toFixed(0)}%</span></div></section><aside className="space-y-5 xl:col-span-4"><section className="rounded-2xl border border-slate-200 bg-white p-4"><div className="flex items-center justify-between"><h3 className="font-semibold text-slate-900">Income vs Expenses Trend</h3><div className="flex items-center gap-3 text-[10px] font-semibold"><span className="flex items-center gap-1 text-teal-500"><span className="h-2 w-2 rounded-full bg-teal-400" />Income</span><span className="flex items-center gap-1 text-blue-500"><span className="h-2 w-2 rounded-full bg-blue-500" />Expenses</span></div></div><div className="mt-3 h-64"><ResponsiveContainer width="100%" height="100%"><BarChart data={chartData} barGap={3} margin={{ top: 4, right: 0, left: -18, bottom: 0 }}><CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e2e8f0" /><XAxis dataKey="month" fontSize={10} tickLine={false} axisLine={false} /><YAxis fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${Math.round(Number(value) / 100000)}L`} /><RechartsTooltip formatter={(value: number) => moneyWithDecimals.format(value)} /><Legend content={() => null} /><Bar dataKey="income" name="Income" fill="#2dd4bf" radius={[4, 4, 0, 0]} maxBarSize={10} /><Bar dataKey="expenses" name="Expenses" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={10} /></BarChart></ResponsiveContainer></div></section><section className="rounded-2xl border border-slate-200 bg-white p-4"><h3 className="flex items-center gap-2 font-semibold text-slate-900"><span className="rounded-lg bg-sky-50 p-1.5 text-sky-600"><Lightbulb className="h-4 w-4" /></span> Key Insights</h3><div className="mt-3 space-y-2">{insightCards.map((insight) => <InsightCard insight={insight} key={`${insight.type}-${insight.title}`} />)}</div></section></aside></div>
        </>}
      </div>
      <IncomeStatementEditorModal isOpen={editorOpen} associationId={String(associationId)} statement={editorStatement} onClose={() => { setEditorOpen(false); setEditorStatement(null); }} onSaved={setSelectedPeriod} />
      <IncomeStatementImportModal isOpen={importOpen} associationId={String(associationId)} initialPeriod={selectedPeriod} onClose={() => setImportOpen(false)} onImported={setSelectedPeriod} />
    </>
  );
};
