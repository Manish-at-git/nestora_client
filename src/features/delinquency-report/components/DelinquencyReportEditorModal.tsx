import React, { useEffect, useMemo, useState } from "react";
import { CalendarDays, CheckCircle2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { FormModal } from "@/components/common";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatApiErrorDetail } from "@/services/api/apiClient";
import {
  useCreateDelinquencyReportMutation,
  useUpdateDelinquencyReportMutation,
} from "../api";
import type {
  DelinquencyReport,
  DelinquencyReportPayload,
  DelinquencyRowInput,
} from "../types";

interface Props {
  isOpen: boolean;
  associationId: string;
  associationName?: string;
  report: DelinquencyReport | null;
  onClose: () => void;
  onSaved: (period: string) => void;
}

interface EditorRow extends DelinquencyRowInput {
  key: string;
}

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

const defaultPeriod = () => {
  const now = new Date();
  const startYear = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
  return {
    start: `${startYear}-04-01`,
    end: `${startYear + 1}-03-31`,
  };
};

const formatDate = (value: string) => {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return "";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(year, month - 1, day));
};

const parsePeriodDate = (value?: string) => {
  if (!value) return "";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? "" : parsed.toISOString().slice(0, 10);
};

const emptyRow = (): EditorRow => ({
  key: crypto.randomUUID(),
  member_name: "",
  unit_number: "",
  block: "",
  charge_category: "",
  outstanding_amount: "0",
  days_overdue: 0,
  last_payment_date: null,
});

export const DelinquencyReportEditorModal: React.FC<Props> = ({
  isOpen,
  associationId,
  associationName,
  report,
  onClose,
  onSaved,
}) => {
  const [periodStart, setPeriodStart] = useState(defaultPeriod().start);
  const [periodEnd, setPeriodEnd] = useState(defaultPeriod().end);
  const [billedAmount, setBilledAmount] = useState("0");
  const [collectedAmount, setCollectedAmount] = useState("0");
  const [rows, setRows] = useState<EditorRow[]>([]);
  const [activeTab, setActiveTab] = useState<"members" | "kpis" | "insights">("members");
  const [error, setError] = useState("");
  const [createReport, createState] = useCreateDelinquencyReportMutation();
  const [updateReport, updateState] = useUpdateDelinquencyReportMutation();

  useEffect(() => {
    if (!isOpen) return;
    if (report) {
      const [start, end] = report.fiscal_period.split(" - ");
      setPeriodStart(parsePeriodDate(start) || defaultPeriod().start);
      setPeriodEnd(parsePeriodDate(end) || defaultPeriod().end);
      setBilledAmount(String(report.summary.total_billed_amount));
      setCollectedAmount(String(report.summary.total_collected_amount));
      setRows(
        report.rows.map((row) => ({
          key: row.id,
          member_name: row.member_name,
          unit_number: row.unit_number,
          block: row.block || "",
          charge_category: row.charge_category,
          outstanding_amount: String(row.outstanding_amount),
          days_overdue: row.days_overdue,
          last_payment_date: row.last_payment_date || null,
        })),
      );
    } else {
      const period = defaultPeriod();
      setPeriodStart(period.start);
      setPeriodEnd(period.end);
      setBilledAmount("0");
      setCollectedAmount("0");
      setRows([emptyRow()]);
    }
    setError("");
    setActiveTab("members");
  }, [isOpen, report]);

  const totalOutstanding = useMemo(
    () => rows.reduce((sum, row) => sum + (Number(row.outstanding_amount) || 0), 0),
    [rows],
  );
  const averageDaysOverdue = useMemo(
    () =>
      rows.length
        ? Math.round(
            rows.reduce((sum, row) => sum + (Number(row.days_overdue) || 0), 0) /
              rows.length,
          )
        : 0,
    [rows],
  );
  const collectionRate = useMemo(() => {
    const billed = Number(billedAmount) || 0;
    const collected = Number(collectedAmount) || 0;
    return billed ? Math.round((collected / billed) * 100) : 0;
  }, [billedAmount, collectedAmount]);
  const blockOptions = useMemo(
    () => Array.from(new Set(rows.map((row) => row.block?.trim()).filter(Boolean))) as string[],
    [rows],
  );
  const categoryOptions = useMemo(
    () => Array.from(new Set(rows.map((row) => row.charge_category.trim()).filter(Boolean))),
    [rows],
  );
  const chargeDistribution = useMemo(() => {
    const grouped = new Map<string, { amount: number; count: number }>();
    rows.forEach((row) => {
      const name = row.charge_category.trim() || "Uncategorized";
      const current = grouped.get(name) || { amount: 0, count: 0 };
      grouped.set(name, {
        amount: current.amount + (Number(row.outstanding_amount) || 0),
        count: current.count + 1,
      });
    });
    return Array.from(grouped.entries())
      .map(([name, value]) => ({
        name,
        ...value,
        percentage: totalOutstanding ? Math.round((value.amount / totalOutstanding) * 100) : 0,
      }))
      .sort((left, right) => right.amount - left.amount);
  }, [rows, totalOutstanding]);
  const agingDistribution = useMemo(() => {
    const buckets = [
      { name: "1-30 days", min: 1, max: 30, amount: 0, count: 0 },
      { name: "31-60 days", min: 31, max: 60, amount: 0, count: 0 },
      { name: "61-90 days", min: 61, max: 90, amount: 0, count: 0 },
      { name: ">90 days", min: 91, max: Infinity, amount: 0, count: 0 },
    ];
    rows.forEach((row) => {
      const bucket = buckets.find((item) => row.days_overdue >= item.min && row.days_overdue <= item.max);
      if (bucket) {
        bucket.amount += Number(row.outstanding_amount) || 0;
        bucket.count += 1;
      }
    });
    return buckets.map((bucket) => ({
      ...bucket,
      percentage: totalOutstanding ? Math.round((bucket.amount / totalOutstanding) * 100) : 0,
    }));
  }, [rows, totalOutstanding]);
  const insights = useMemo(() => {
    const values: string[] = [];
    if (totalOutstanding > 0 && rows.length) {
      values.push(`${money.format(totalOutstanding)} is outstanding across ${rows.length} delinquent member${rows.length === 1 ? "" : "s"}.`);
    }
    const overNinety = rows.filter((row) => row.days_overdue > 90).length;
    if (overNinety) values.push(`${overNinety} member${overNinety === 1 ? "" : "s"} have more than 90 days overdue.`);
    const leadingCategory = chargeDistribution[0];
    if (leadingCategory) values.push(`${leadingCategory.name} accounts for ${leadingCategory.percentage}% of total outstanding.`);
    return values;
  }, [chargeDistribution, rows, totalOutstanding]);
  const period = `${formatDate(periodStart)} - ${formatDate(periodEnd)}`;

  const updateText = (
    key: string,
    field: "member_name" | "unit_number" | "block" | "charge_category" | "outstanding_amount",
    value: string,
  ) => {
    setRows((current) =>
      current.map((row) => (row.key === key ? { ...row, [field]: value } : row)),
    );
  };

  const validate = () => {
    const billed = Number(billedAmount);
    const collected = Number(collectedAmount);
    if (!periodStart || !periodEnd || periodStart > periodEnd) {
      return "Choose a valid fiscal-period start and end date.";
    }
    if (!Number.isFinite(billed) || !Number.isFinite(collected) || billed < 0 || collected < 0) {
      return "Billed and collected amounts must be non-negative numbers.";
    }
    if (collected > billed) return "Collected amount cannot exceed billed amount.";
    if (!rows.length) return "Add at least one delinquency row.";
    for (const [index, row] of rows.entries()) {
      const amount = Number(row.outstanding_amount);
      if (!row.member_name.trim() || !row.unit_number.trim() || !row.charge_category.trim()) {
        return `Complete all required fields in row ${index + 1}.`;
      }
      if (!Number.isFinite(amount) || amount < 0 || row.days_overdue < 0) {
        return `Outstanding amount and days overdue in row ${index + 1} must be non-negative.`;
      }
    }
    return "";
  };

  const submit = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    const payload: DelinquencyReportPayload = {
      association_id: associationId,
      fiscal_period: period,
      total_billed_amount: billedAmount,
      total_collected_amount: collectedAmount,
      rows: rows.map(({ key: _key, ...row }) => ({
        ...row,
        member_name: row.member_name.trim(),
        unit_number: row.unit_number.trim(),
        block: row.block?.trim() || null,
        charge_category: row.charge_category.trim(),
        last_payment_date: row.last_payment_date || null,
      })),
    };
    try {
      if (report) await updateReport({ id: report.id, data: payload }).unwrap();
      else await createReport(payload).unwrap();
      toast.success(
        report
          ? "Delinquency Report updated successfully"
          : "Delinquency Report created successfully",
      );
      onSaved(period);
      onClose();
    } catch (requestError: unknown) {
      const detail = requestError as { data?: unknown };
      const message = formatApiErrorDetail(
        detail.data || "Unable to save the Delinquency Report",
      );
      setError(message);
      toast.error(message);
    }
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={report ? "Update Delinquency Report" : "Create Delinquency Report"}
      description="Record delinquent balances for one association and fiscal period"
      size="full"
      isSubmitting={createState.isLoading || updateState.isLoading}
      submitText="Save Delinquency Report"
      loadingText="Saving..."
      onSubmit={submit}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-2 rounded-xl border border-slate-200 bg-slate-50/70 p-3 sm:grid-cols-3 lg:grid-cols-5">
          <div className="col-span-2 min-w-0 sm:col-span-3 lg:col-span-1">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Association
            </p>
            <p className="truncate text-sm font-semibold text-slate-800">
              {associationName || "Selected association"}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Total outstanding
            </p>
            <p className="text-sm font-bold text-rose-700">{money.format(totalOutstanding)}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Delinquent members
            </p>
            <p className="text-sm font-bold text-slate-800">{rows.length}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Avg. days overdue
            </p>
            <p className="text-sm font-bold text-blue-700">{averageDaysOverdue} days</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Collection rate
            </p>
            <p className="text-sm font-bold text-emerald-700">{collectionRate}%</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pb-3">
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as "members" | "kpis" | "insights")}
          >
            <TabsList className="grid h-auto w-full grid-cols-3 rounded-xl bg-slate-100/80 p-1">
              <TabsTrigger
                value="members"
                className="min-w-0 whitespace-normal rounded-lg px-2 py-2 text-xs font-semibold leading-tight"
              >
                Delinquent Members ({rows.length})
              </TabsTrigger>
              <TabsTrigger
                value="kpis"
                className="min-w-0 whitespace-normal rounded-lg px-2 py-2 text-xs font-semibold leading-tight"
              >
                KPIs &amp; Charge Distribution
              </TabsTrigger>
              <TabsTrigger
                value="insights"
                className="min-w-0 whitespace-normal rounded-lg px-2 py-2 text-xs font-semibold leading-tight"
              >
                Insights ({insights.length})
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="flex items-center gap-2 pb-1">
            <CalendarDays className="h-4 w-4 text-slate-400" />
            <span className="text-xs font-medium text-slate-600">{period}</span>
          </div>
        </div>

        {activeTab === "members" ? (
          <>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-100 bg-rose-50/50 px-3.5 py-2.5">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-rose-600" />
            <DatePicker value={periodStart} onChange={(value) => setPeriodStart(value || "")} displayFormat="MMM d, yyyy" size="sm" triggerClassName="h-8 w-32 text-xs" />
            <span className="text-xs text-slate-500">to</span>
            <DatePicker value={periodEnd} onChange={(value) => setPeriodEnd(value || "")} displayFormat="MMM d, yyyy" size="sm" triggerClassName="h-8 w-32 text-xs" />
          </div>
          <span className="text-xs font-semibold text-rose-700">
            Outstanding: {money.format(totalOutstanding)}
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-xs font-semibold text-slate-600">
            Total billed amount
            <Input type="number" min="0" step="0.01" value={billedAmount} onChange={(event) => setBilledAmount(event.target.value)} className="mt-1 h-9 w-full text-right font-mono text-sm" />
          </label>
          <label className="text-xs font-semibold text-slate-600">
            Total collected amount
            <Input type="number" min="0" step="0.01" value={collectedAmount} onChange={(event) => setCollectedAmount(event.target.value)} className="mt-1 h-9 w-full text-right font-mono text-sm" />
          </label>
        </div>

        <section className="rounded-xl border border-slate-200 bg-slate-50/40 p-3.5">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-800">Delinquent member rows</h3>
              <p className="text-xs text-slate-500">Totals, risk status, charts, and insights are calculated by the server.</p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700"
              onClick={() => setRows((current) => [...current, emptyRow()])}
            >
              <Plus className="h-3.5 w-3.5" /> Add row
            </Button>
          </div>
          <div className="overflow-hidden">
            <div className="space-y-2">
              <div className="grid grid-cols-[minmax(0,1.5fr)_minmax(0,.9fr)_minmax(0,.8fr)_minmax(0,1.4fr)_minmax(0,1.1fr)_minmax(0,.9fr)_minmax(0,1.3fr)_28px] gap-2 px-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                <span>Member</span><span>Unit</span><span>Block</span><span>Charge category</span><span className="text-right">Outstanding</span><span>Days overdue</span><span>Last payment</span><span />
              </div>
              {rows.map((row) => (
                <div key={row.key} className="grid grid-cols-[minmax(0,1.5fr)_minmax(0,.9fr)_minmax(0,.8fr)_minmax(0,1.4fr)_minmax(0,1.1fr)_minmax(0,.9fr)_minmax(0,1.3fr)_28px] items-center gap-2 [&>*]:min-w-0">
                  <Input value={row.member_name} onChange={(event) => updateText(row.key, "member_name", event.target.value)} className="h-9 min-w-0 text-sm" placeholder="Member name" />
                  <Input value={row.unit_number} onChange={(event) => updateText(row.key, "unit_number", event.target.value)} className="h-9 min-w-0 text-sm" placeholder="Unit" />
                  {blockOptions.length ? (
                    <Select
                      value={row.block || ""}
                      onValueChange={(value) => updateText(row.key, "block", value)}
                      options={[
                        { value: "", label: "No block" },
                        ...blockOptions.map((block) => ({ value: block, label: block })),
                      ]}
                      size="sm"
                      className="h-9 w-full min-w-0 text-xs"
                    />
                  ) : (
                    <Input value={row.block || ""} onChange={(event) => updateText(row.key, "block", event.target.value)} className="h-9 min-w-0 text-sm" placeholder="Block" />
                  )}
                  {categoryOptions.length ? (
                    <Select
                      value={row.charge_category}
                      onValueChange={(value) => updateText(row.key, "charge_category", value)}
                      options={[
                        { value: "", label: "Select category" },
                        ...categoryOptions.map((category) => ({ value: category, label: category })),
                      ]}
                      size="sm"
                      className="h-9 w-full min-w-0 text-xs"
                    />
                  ) : (
                    <Input value={row.charge_category} onChange={(event) => updateText(row.key, "charge_category", event.target.value)} className="h-9 min-w-0 text-sm" placeholder="Category" />
                  )}
                  <Input type="number" min="0" step="0.01" value={row.outstanding_amount} onChange={(event) => updateText(row.key, "outstanding_amount", event.target.value)} className="h-9 min-w-0 text-right font-mono text-sm" />
                  <Input type="number" min="0" step="1" value={row.days_overdue} onChange={(event) => setRows((current) => current.map((item) => item.key === row.key ? { ...item, days_overdue: Number(event.target.value) } : item))} className="h-9 min-w-0 text-center text-sm" />
                  <DatePicker value={row.last_payment_date || ""} onChange={(value) => setRows((current) => current.map((item) => item.key === row.key ? { ...item, last_payment_date: value || null } : item))} displayFormat="MMM d, yyyy" size="sm" triggerClassName="h-9 w-full text-xs" />
                  <Button type="button" variant="ghost" size="iconSm" onClick={() => setRows((current) => current.filter((item) => item.key !== row.key))} aria-label="Remove row"><Trash2 className="h-4 w-4 text-slate-400 hover:text-rose-500" /></Button>
                </div>
              ))}
            </div>
          </div>
        </section>

          </>
        ) : activeTab === "kpis" ? (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ["Total outstanding", money.format(totalOutstanding)],
                ["Delinquent members", String(rows.length)],
                ["Average days overdue", `${averageDaysOverdue} days`],
                ["Collection rate", `${collectionRate}%`],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
                  <p className="text-xs font-semibold text-slate-500">{label}</p>
                  <p className="mt-1 text-lg font-bold text-slate-900">{value}</p>
                </div>
              ))}
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <section className="rounded-xl border border-slate-200 p-3.5">
                <h3 className="mb-3 text-sm font-semibold text-slate-800">Delinquency by charge type</h3>
                <div className="space-y-2">
                  {chargeDistribution.length ? chargeDistribution.map((item) => (
                    <div key={item.name} className="grid grid-cols-[1fr_auto_auto] gap-3 text-sm">
                      <span className="truncate text-slate-700">{item.name}</span>
                      <span className="text-slate-500">{item.percentage}%</span>
                      <span className="font-mono text-slate-800">{money.format(item.amount)}</span>
                    </div>
                  )) : <p className="text-sm text-slate-500">Add member rows to calculate charge distribution.</p>}
                </div>
              </section>
              <section className="rounded-xl border border-slate-200 p-3.5">
                <h3 className="mb-3 text-sm font-semibold text-slate-800">Days overdue distribution</h3>
                <div className="space-y-2">
                  {agingDistribution.map((item) => (
                    <div key={item.name} className="grid grid-cols-[1fr_auto_auto] gap-3 text-sm">
                      <span className="text-slate-700">{item.name}</span>
                      <span className="text-slate-500">{item.percentage}%</span>
                      <span className="font-mono text-slate-800">{money.format(item.amount)}</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        ) : (
          <section className="rounded-xl border border-slate-200 p-3.5">
            <h3 className="text-sm font-semibold text-slate-800">Delinquency insights</h3>
            <p className="mb-3 text-xs text-slate-500">Insights are derived from the current member rows and calculated totals.</p>
            <div className="space-y-2">
              {insights.length ? insights.map((insight, index) => (
                <div key={insight} className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50/60 p-3 text-sm text-slate-700">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-50 text-xs font-semibold text-rose-600">{index + 1}</span>
                  <span>{insight}</span>
                </div>
              )) : <p className="text-sm text-slate-500">Add member rows to generate report insights.</p>}
            </div>
          </section>
        )}

        {error ? (
          <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
        ) : (
          <p className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700"><CheckCircle2 className="h-4 w-4" /> Server validation and derived calculations are enabled</p>
        )}
      </div>
    </FormModal>
  );
};
