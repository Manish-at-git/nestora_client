import React, { useEffect, useMemo, useState } from "react";
import { CalendarDays, CheckCircle2, Lightbulb, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { FormModal } from "@/components/common";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Select } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCreateIncomeStatementMutation, useUpdateIncomeStatementMutation } from "../api";
import type { IncomeStatement, IncomeStatementInsight, IncomeStatementItemInput, IncomeStatementItemType, IncomeStatementPayload } from "../types";

interface Props {
  isOpen: boolean;
  associationId: string;
  statement: IncomeStatement | null;
  onClose: () => void;
  onSaved: (period: string) => void;
}

interface Row extends IncomeStatementItemInput { key: string; }
type Tab = "items" | "insights";

const today = () => new Date().toISOString().slice(0, 10);
const formatDate = (date: string) => {
  const [year, month, day] = date.split("-").map(Number);
  return date && year && month && day
    ? new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(year, month - 1, day))
    : "";
};
const parsePeriodDate = (value: string | undefined) => {
  if (!value) return "";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? "" : parsed.toISOString().slice(0, 10);
};
const money = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 });

const defaultPeriod = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), 3, 1);
  const end = new Date(now.getFullYear() + 1, 2, 31);
  return { start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) };
};

export const IncomeStatementEditorModal: React.FC<Props> = ({ isOpen, associationId, statement, onClose, onSaved }) => {
  const [tab, setTab] = useState<Tab>("items");
  const [periodStart, setPeriodStart] = useState(defaultPeriod().start);
  const [periodEnd, setPeriodEnd] = useState(defaultPeriod().end);
  const [rows, setRows] = useState<Row[]>([]);
  const [growth, setGrowth] = useState({ income: "", expenses: "", surplus: "", margin: "" });
  const [insights, setInsights] = useState<IncomeStatementInsight[]>([]);
  const [error, setError] = useState("");
  const [createStatement, createState] = useCreateIncomeStatementMutation();
  const [updateStatement, updateState] = useUpdateIncomeStatementMutation();

  useEffect(() => {
    if (!isOpen) return;
    setTab("items");
    if (statement) {
      const [start, end] = statement.fiscal_period.split(" - ");
      setPeriodStart(parsePeriodDate(start) || defaultPeriod().start);
      setPeriodEnd(parsePeriodDate(end) || defaultPeriod().end);
      setRows(statement.items.map((item) => ({ key: item.id, item_type: item.item_type, name: item.name, current_amount: String(item.current_amount), previous_amount: String(item.previous_amount) })));
      setGrowth({ income: statement.income_growth_pct || "", expenses: statement.expenses_growth_pct || "", surplus: statement.net_surplus_growth_pct || "", margin: statement.operating_margin_growth_pct || "" });
      setInsights(statement.insights || []);
    } else {
      const period = defaultPeriod();
      setPeriodStart(period.start); setPeriodEnd(period.end); setRows([]); setGrowth({ income: "", expenses: "", surplus: "", margin: "" }); setInsights([]);
    }
    setError("");
  }, [isOpen, statement]);

  const totals = useMemo(() => {
    const income = rows.filter((row) => row.item_type === "income").reduce((sum, row) => sum + (Number(row.current_amount) || 0), 0);
    const expenses = rows.filter((row) => row.item_type === "expense").reduce((sum, row) => sum + (Number(row.current_amount) || 0), 0);
    const previousIncome = rows.filter((row) => row.item_type === "income").reduce((sum, row) => sum + (Number(row.previous_amount) || 0), 0);
    const previousExpenses = rows.filter((row) => row.item_type === "expense").reduce((sum, row) => sum + (Number(row.previous_amount) || 0), 0);
    const surplus = income - expenses;
    return { income, expenses, surplus, margin: income ? (surplus / income) * 100 : 0, previousIncome, previousExpenses };
  }, [rows]);

  const updateRow = (key: string, field: keyof IncomeStatementItemInput, value: string) => setRows((items) => items.map((item) => item.key === key ? { ...item, [field]: value } : item));
  const addRow = (item_type: IncomeStatementItemType) => setRows((items) => [...items, { key: crypto.randomUUID(), item_type, name: "", current_amount: "0", previous_amount: "0" }]);
  const removeRow = (key: string) => setRows((items) => items.filter((item) => item.key !== key));
  const period = `${formatDate(periodStart)} - ${formatDate(periodEnd)}`;

  const submit = async () => {
    if (!periodStart || !periodEnd || !rows.length || rows.some((row) => !row.name.trim() || !Number.isFinite(Number(row.current_amount)) || !Number.isFinite(Number(row.previous_amount)))) {
      setError("Choose a fiscal period and provide a valid name and amount for every line item."); return;
    }
    const payload: IncomeStatementPayload = {
      association_id: associationId, fiscal_period: period, items: rows.map(({ key: _key, ...row }) => ({ ...row, name: row.name.trim() })),
      income_growth_pct: growth.income || null, expenses_growth_pct: growth.expenses || null, net_surplus_growth_pct: growth.surplus || null, operating_margin_growth_pct: growth.margin || null,
      insights, monthly_trend: statement?.monthly_trend || [],
    };
    try {
      if (statement) await updateStatement({ id: statement.id, data: payload }).unwrap();
      else await createStatement(payload).unwrap();
      toast.success(statement ? "Income Statement updated successfully" : "Income Statement created successfully");
      onSaved(period); onClose();
    } catch (requestError: any) {
      const message = requestError?.data?.message || "Unable to save the Income Statement";
      setError(message); toast.error(message);
    }
  };

  const renderRows = (type: IncomeStatementItemType) => rows.filter((row) => row.item_type === type).map((row) => {
    const previous = Number(row.previous_amount) || 0;
    const current = Number(row.current_amount) || 0;
    const variance = previous ? ((current - previous) / previous) * 100 : 0;
    return <div key={row.key} className="grid grid-cols-[minmax(0,1fr)_150px_150px_70px_32px] gap-2 items-center">
      <input value={row.name} onChange={(event) => updateRow(row.key, "name", event.target.value)} placeholder="Particular name" className="h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-sm outline-none focus:border-indigo-400" />
      <input type="number" step="0.01" value={row.current_amount} onChange={(event) => updateRow(row.key, "current_amount", event.target.value)} className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-right font-mono text-sm outline-none focus:border-indigo-400" />
      <input type="number" step="0.01" value={row.previous_amount} onChange={(event) => updateRow(row.key, "previous_amount", event.target.value)} className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-right font-mono text-sm outline-none focus:border-indigo-400" />
      <span className="text-right text-xs font-semibold text-slate-500">{variance.toFixed(0)}%</span>
      <Button type="button" variant="ghost" size="iconSm" onClick={() => removeRow(row.key)} aria-label="Remove row"><Trash2 className="h-4 w-4 text-slate-400 hover:text-rose-500" /></Button>
    </div>;
  });

  const section = (type: IncomeStatementItemType, title: string) => {
    const amount = type === "income" ? totals.income : totals.expenses;
    return <section className={`rounded-xl border p-3.5 ${type === "income" ? "border-emerald-200 bg-emerald-50/50" : "border-rose-200 bg-rose-50/50"}`}>
      <div className="mb-3 flex items-center justify-between"><div><h3 className="text-sm font-semibold text-slate-800">{title}</h3><p className="text-xs text-slate-500">Subtotal: {money.format(amount)}</p></div><Button type="button" variant="ghost" size="sm" className={type === "income" ? "text-emerald-700" : "text-rose-700"} onClick={() => addRow(type)}><Plus className="h-3.5 w-3.5" /> Add row</Button></div>
      <div className="mb-2 grid grid-cols-[minmax(0,1fr)_150px_150px_70px_32px] gap-2 px-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400"><span>Particulars</span><span className="text-right">Current Year (₹)</span><span className="text-right">Previous Year (₹)</span><span className="text-right">Var</span><span /></div>
      <div className="space-y-2">{renderRows(type)}</div>
    </section>;
  };

  return <FormModal isOpen={isOpen} onClose={onClose} title={statement ? "Update Income Statement" : "Create Income Statement"} description="Manage financial performance for this association" size="3xl" isSubmitting={createState.isLoading || updateState.isLoading} submitText="Save Income Statement" loadingText="Saving..." onSubmit={submit}>
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-sky-100 bg-sky-50/50 px-3.5 py-2.5"><div className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-sky-600" /><span className="text-xs font-semibold text-sky-900">Fiscal period:</span><DatePicker value={periodStart} onChange={(value) => setPeriodStart(value || "")} displayFormat="MMM d, yyyy" size="sm" containerClassName="w-auto" triggerClassName="h-8 w-32 text-xs" /><span className="text-xs text-slate-500">to</span><DatePicker value={periodEnd} onChange={(value) => setPeriodEnd(value || "")} displayFormat="MMM d, yyyy" size="sm" containerClassName="w-auto" triggerClassName="h-8 w-32 text-xs" /></div><div className="flex flex-wrap gap-3 text-xs font-semibold"><span className="text-emerald-700">Income: {money.format(totals.income)}</span><span className="text-rose-700">Expenses: {money.format(totals.expenses)}</span><span className="text-sky-700">Surplus: {money.format(totals.surplus)}</span><span className="text-indigo-700">Margin: {totals.margin.toFixed(1)}%</span></div></div>
      <Tabs value={tab} onValueChange={(value) => setTab(value as Tab)}><TabsList className="grid h-auto w-full grid-cols-2 rounded-xl bg-slate-100/80 p-1"><TabsTrigger value="items" className="rounded-lg py-2 text-xs font-semibold">Income & Expenses Line Items</TabsTrigger><TabsTrigger value="insights" className="rounded-lg py-2 text-xs font-semibold">YoY Growth & Key Insights</TabsTrigger></TabsList><TabsContent value="items" className="space-y-3"><div className="space-y-3">{section("income", "Income items")}{section("expense", "Expense items")}</div><div className="grid grid-cols-2 gap-3 rounded-xl border border-sky-200 bg-sky-50 p-3 text-center sm:grid-cols-4"><div><p className="text-xs text-slate-500">Total income</p><p className="font-mono font-bold text-emerald-700">{money.format(totals.income)}</p></div><div><p className="text-xs text-slate-500">Total expenses</p><p className="font-mono font-bold text-rose-700">{money.format(totals.expenses)}</p></div><div><p className="text-xs text-slate-500">Net surplus</p><p className="font-mono font-bold text-sky-700">{money.format(totals.surplus)}</p></div><div><p className="text-xs text-slate-500">Operating margin</p><p className="font-mono font-bold text-indigo-700">{totals.margin.toFixed(1)}%</p></div></div></TabsContent><TabsContent value="insights" className="space-y-4"><section className="rounded-xl border border-slate-200 bg-slate-50/80 p-3.5"><h3 className="text-sm font-semibold text-slate-800">YoY percentage growth</h3><div className="mt-3 grid gap-3 sm:grid-cols-4">{([ ["income", "Total income growth %"], ["expenses", "Total expenses growth %"], ["surplus", "Net surplus growth %"], ["margin", "Operating margin growth %"] ] as const).map(([key, label]) => <label key={key} className="text-xs font-medium text-slate-600">{label}<input type="number" step="0.1" value={growth[key]} onChange={(event) => setGrowth((current) => ({ ...current, [key]: event.target.value }))} className="mt-1 h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-sm outline-none focus:border-indigo-400" /></label>)}</div></section><section className="rounded-xl border border-slate-200 bg-slate-50/80 p-3.5"><div className="mb-3 flex items-center justify-between"><h3 className="text-sm font-semibold text-slate-800">Key insights</h3><Button type="button" variant="ghost" size="sm" onClick={() => setInsights((items) => [...items, { type: "insight", title: "", description: "" }])}><Plus className="h-3.5 w-3.5" /> Add insight</Button></div><div className="space-y-2">{insights.map((insight, index) => <div key={`${index}-${insight.title}`} className="grid gap-2 rounded-lg border border-slate-200 bg-white p-3 sm:grid-cols-[180px_minmax(0,1fr)_32px]"><input value={insight.title} onChange={(event) => setInsights((items) => items.map((item, i) => i === index ? { ...item, title: event.target.value } : item))} placeholder="Insight title" className="h-9 rounded-lg border border-slate-200 px-2 text-sm font-semibold" /><input value={insight.description} onChange={(event) => setInsights((items) => items.map((item, i) => i === index ? { ...item, description: event.target.value } : item))} placeholder="Explanation" className="h-9 rounded-lg border border-slate-200 px-2 text-sm" /><Button type="button" variant="ghost" size="iconSm" onClick={() => setInsights((items) => items.filter((_, i) => i !== index))}><Trash2 className="h-4 w-4 text-slate-400" /></Button></div>)}</div></section></TabsContent></Tabs>
      {error ? <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : <p className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700"><CheckCircle2 className="h-4 w-4" /> All totals calculated dynamically</p>}
    </div>
  </FormModal>;
};
