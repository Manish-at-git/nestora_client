import React, { useEffect, useMemo, useState } from "react";
import { CalendarDays, CheckCircle2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { FormModal } from "@/components/common";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatApiErrorDetail } from "@/services/api/apiClient";
import {
  useCreatePrepaidReportMutation,
  useUpdatePrepaidReportMutation,
} from "../api";
import type {
  PrepaidReport,
  PrepaidReportPayload,
  PrepaidReportRowInput,
} from "../types";

interface Props {
  isOpen: boolean;
  associationId: string;
  report: PrepaidReport | null;
  onClose: () => void;
  onSaved: (period: string) => void;
}

interface EditorRow extends PrepaidReportRowInput {
  key: string;
}

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

const defaultPeriod = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), 3, 1);
  const end = new Date(now.getFullYear() + 1, 2, 31);
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
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
  category: "",
  prepaid_amount: "0",
  used_amount: "0",
  expiry_date: "",
});

export const PrepaidReportEditorModal: React.FC<Props> = ({
  isOpen,
  associationId,
  report,
  onClose,
  onSaved,
}) => {
  const [periodStart, setPeriodStart] = useState(defaultPeriod().start);
  const [periodEnd, setPeriodEnd] = useState(defaultPeriod().end);
  const [rows, setRows] = useState<EditorRow[]>([]);
  const [activeTab, setActiveTab] = useState<"members" | "kpis" | "insights">("members");
  const [error, setError] = useState("");
  const [createReport, createState] = useCreatePrepaidReportMutation();
  const [updateReport, updateState] = useUpdatePrepaidReportMutation();

  useEffect(() => {
    if (!isOpen) return;
    if (report) {
      const [start, end] = report.fiscal_period.split(" - ");
      setPeriodStart(parsePeriodDate(start) || defaultPeriod().start);
      setPeriodEnd(parsePeriodDate(end) || defaultPeriod().end);
      setRows(
        report.rows.map((row) => ({
          key: row.id,
          member_name: row.member_name,
          unit_number: row.unit_number,
          block: row.block || "",
          category: row.category,
          prepaid_amount: String(row.prepaid_amount),
          used_amount: String(row.used_amount),
          expiry_date: row.expiry_date,
        })),
      );
    } else {
      const period = defaultPeriod();
      setPeriodStart(period.start);
      setPeriodEnd(period.end);
      setRows([emptyRow()]);
    }
    setError("");
    setActiveTab("members");
  }, [isOpen, report]);

  const totals = useMemo(() => {
    const prepaid = rows.reduce(
      (sum, row) => sum + (Number(row.prepaid_amount) || 0),
      0,
    );
    const used = rows.reduce(
      (sum, row) => sum + (Number(row.used_amount) || 0),
      0,
    );
    return { prepaid, used, available: prepaid - used };
  }, [rows]);

  const period = `${formatDate(periodStart)} - ${formatDate(periodEnd)}`;
  const categoryDistribution = useMemo(() => {
    const grouped = new Map<string, { amount: number; count: number }>();
    rows.forEach((row) => {
      const name = row.category.trim() || "Uncategorized";
      const current = grouped.get(name) || { amount: 0, count: 0 };
      grouped.set(name, {
        amount: current.amount + (Number(row.prepaid_amount) || 0),
        count: current.count + 1,
      });
    });
    return Array.from(grouped.entries())
      .map(([name, value]) => ({
        name,
        ...value,
        percentage: totals.prepaid ? Math.round((value.amount / totals.prepaid) * 100) : 0,
      }))
      .sort((left, right) => right.amount - left.amount);
  }, [rows, totals.prepaid]);
  const expiredCount = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return rows.filter((row) => row.expiry_date < today || (Number(row.prepaid_amount) || 0) <= (Number(row.used_amount) || 0)).length;
  }, [rows]);
  const insights = useMemo(() => {
    const values: string[] = [];
    if (rows.length) values.push(`${money.format(totals.prepaid)} prepaid across ${rows.length} member${rows.length === 1 ? "" : "s"}.`);
    if (expiredCount) values.push(`${expiredCount} member${expiredCount === 1 ? "" : "s"} have expired or fully used prepaid balances.`);
    const leadingCategory = categoryDistribution[0];
    if (leadingCategory) values.push(`${leadingCategory.name} represents ${leadingCategory.percentage}% of prepaid funds.`);
    return values;
  }, [categoryDistribution, expiredCount, rows.length, totals.prepaid]);
  const rowStatus = (row: EditorRow) => {
    const today = new Date().toISOString().slice(0, 10);
    return row.expiry_date < today || (Number(row.prepaid_amount) || 0) <= (Number(row.used_amount) || 0)
      ? "Expired"
      : "Active";
  };
  const updateRow = (
    key: string,
    field: keyof PrepaidReportRowInput,
    value: string,
  ) => {
    setRows((current) =>
      current.map((row) => (row.key === key ? { ...row, [field]: value } : row)),
    );
  };

  const validate = () => {
    if (!periodStart || !periodEnd || periodStart > periodEnd) {
      return "Choose a valid fiscal-period start and end date.";
    }
    if (!rows.length) return "Add at least one prepaid member row.";
    for (const [index, row] of rows.entries()) {
      const prepaid = Number(row.prepaid_amount);
      const used = Number(row.used_amount);
      if (
        !row.member_name.trim() ||
        !row.unit_number.trim() ||
        !row.category.trim() ||
        !row.expiry_date
      ) {
        return `Complete all required fields in row ${index + 1}.`;
      }
      if (!Number.isFinite(prepaid) || !Number.isFinite(used) || prepaid < 0 || used < 0) {
        return `Amounts in row ${index + 1} must be non-negative numbers.`;
      }
      if (used > prepaid) {
        return `Used amount cannot exceed prepaid amount in row ${index + 1}.`;
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

    const payload: PrepaidReportPayload = {
      association_id: associationId,
      fiscal_period: period,
      rows: rows.map(({ key: _key, ...row }) => ({
        ...row,
        member_name: row.member_name.trim(),
        unit_number: row.unit_number.trim(),
        block: row.block?.trim() || null,
        category: row.category.trim(),
      })),
    };

    try {
      if (report) {
        await updateReport({ id: report.id, data: payload }).unwrap();
      } else {
        await createReport(payload).unwrap();
      }
      toast.success(
        report
          ? "Prepaid Report updated successfully"
          : "Prepaid Report created successfully",
      );
      onSaved(period);
      onClose();
    } catch (requestError: unknown) {
      const detail = requestError as { data?: unknown };
      const message = formatApiErrorDetail(
        detail.data || "Unable to save the Prepaid Report",
      );
      setError(message);
      toast.error(message);
    }
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={report ? "Update Prepaid Report" : "Create Prepaid Report"}
      description="Manage association prepaid balances for one fiscal period"
      size="full"
      isSubmitting={createState.isLoading || updateState.isLoading}
      submitText="Save Prepaid Report"
      loadingText="Saving..."
      onSubmit={submit}
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-100 bg-emerald-50/50 px-3.5 py-2.5">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-emerald-600" />
            <span className="text-xs font-semibold text-emerald-900">Fiscal period:</span>
            <DatePicker
              value={periodStart}
              onChange={(value) => setPeriodStart(value || "")}
              displayFormat="MMM d, yyyy"
              size="sm"
              containerClassName="w-auto"
              triggerClassName="h-8 w-32 text-xs"
            />
            <span className="text-xs text-slate-500">to</span>
            <DatePicker
              value={periodEnd}
              onChange={(value) => setPeriodEnd(value || "")}
              displayFormat="MMM d, yyyy"
              size="sm"
              containerClassName="w-auto"
              triggerClassName="h-8 w-32 text-xs"
            />
          </div>
          <div className="flex flex-wrap gap-3 text-xs font-semibold">
            <span className="text-emerald-700">Prepaid: {money.format(totals.prepaid)}</span>
            <span className="text-amber-700">Used: {money.format(totals.used)}</span>
            <span className="text-sky-700">Available: {money.format(totals.available)}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pb-3">
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as "members" | "kpis" | "insights")}
          >
            <TabsList className="grid h-auto w-full grid-cols-3 rounded-xl bg-slate-100/80 p-1">
              <TabsTrigger value="members" className="min-w-0 whitespace-normal rounded-lg px-2 py-2 text-xs font-semibold leading-tight">
                Member Details ({rows.length})
              </TabsTrigger>
              <TabsTrigger value="kpis" className="min-w-0 whitespace-normal rounded-lg px-2 py-2 text-xs font-semibold leading-tight">
                KPIs &amp; Distribution
              </TabsTrigger>
              <TabsTrigger value="insights" className="min-w-0 whitespace-normal rounded-lg px-2 py-2 text-xs font-semibold leading-tight">
                Insights ({insights.length})
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <span className="pb-1 text-xs font-medium text-slate-600">{period}</span>
        </div>

        {activeTab === "members" ? (
          <section className="rounded-xl border border-slate-200 bg-slate-50/40 p-3.5">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-800">Member rows</h3>
              <p className="text-xs text-slate-500">
                Available balance and status are calculated by the server.
              </p>
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
              <div className="grid grid-cols-[minmax(0,1.3fr)_minmax(0,.8fr)_minmax(0,.7fr)_minmax(0,1fr)_minmax(0,.9fr)_minmax(0,.9fr)_minmax(0,.85fr)_minmax(0,.75fr)_minmax(0,.75fr)_28px] gap-2 px-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                <span>Member name</span>
                <span>Unit</span>
                <span>Block</span>
                <span>Category</span>
                <span className="text-right">Prepaid</span>
                <span className="text-right">Used</span>
                <span className="text-right">Available</span>
                <span>Expiry date</span>
                <span>Status</span>
                <span />
              </div>
              {rows.map((row) => (
                <div
                  key={row.key}
                  className="grid grid-cols-[minmax(0,1.3fr)_minmax(0,.8fr)_minmax(0,.7fr)_minmax(0,1fr)_minmax(0,.9fr)_minmax(0,.9fr)_minmax(0,.85fr)_minmax(0,.75fr)_minmax(0,.75fr)_28px] items-center gap-2 [&>*]:min-w-0"
                >
                  <Input
                    value={row.member_name}
                    onChange={(event) => updateRow(row.key, "member_name", event.target.value)}
                    className="h-9 rounded-lg border border-slate-200 px-2 text-sm"
                    placeholder="Member name"
                  />
                  <Input
                    value={row.unit_number}
                    onChange={(event) => updateRow(row.key, "unit_number", event.target.value)}
                    className="h-9 rounded-lg border border-slate-200 px-2 text-sm"
                    placeholder="Unit"
                  />
                  <Input
                    value={row.block || ""}
                    onChange={(event) => updateRow(row.key, "block", event.target.value)}
                    className="h-9 rounded-lg border border-slate-200 px-2 text-sm"
                    placeholder="Block"
                  />
                  <Input
                    value={row.category}
                    onChange={(event) => updateRow(row.key, "category", event.target.value)}
                    className="h-9 rounded-lg border border-slate-200 px-2 text-sm"
                    placeholder="Category"
                  />
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={row.prepaid_amount}
                    onChange={(event) => updateRow(row.key, "prepaid_amount", event.target.value)}
                    className="h-9 rounded-lg border border-slate-200 px-2 text-right font-mono text-sm"
                  />
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={row.used_amount}
                    onChange={(event) => updateRow(row.key, "used_amount", event.target.value)}
                    className="h-9 rounded-lg border border-slate-200 px-2 text-right font-mono text-sm"
                  />
                  <span className="truncate text-right text-xs font-semibold text-sky-700">
                    {money.format((Number(row.prepaid_amount) || 0) - (Number(row.used_amount) || 0))}
                  </span>
                  <DatePicker
                    value={row.expiry_date}
                    onChange={(value) => updateRow(row.key, "expiry_date", value || "")}
                    displayFormat="MMM d, yyyy"
                    size="sm"
                    triggerClassName="h-9 w-full text-xs"
                  />
                  <span className={`truncate rounded-md px-2 py-1 text-center text-xs font-semibold ${rowStatus(row) === "Active" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
                    {rowStatus(row)}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="iconSm"
                    onClick={() =>
                      setRows((current) => current.filter((item) => item.key !== row.key))
                    }
                    aria-label="Remove row"
                  >
                    <Trash2 className="h-4 w-4 text-slate-400 hover:text-rose-500" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
          </section>
        ) : activeTab === "kpis" ? (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ["Total prepaid", money.format(totals.prepaid)],
                ["Total used", money.format(totals.used)],
                ["Available balance", money.format(totals.available)],
                ["Expired balances", String(expiredCount)],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
                  <p className="text-xs font-semibold text-slate-500">{label}</p>
                  <p className="mt-1 text-lg font-bold text-slate-900">{value}</p>
                </div>
              ))}
            </div>
            <section className="rounded-xl border border-slate-200 p-3.5">
              <h3 className="mb-3 text-sm font-semibold text-slate-800">Prepaid balance distribution</h3>
              <div className="space-y-2">
                {categoryDistribution.length ? categoryDistribution.map((item) => (
                  <div key={item.name} className="grid grid-cols-[1fr_auto_auto] gap-3 text-sm">
                    <span className="truncate text-slate-700">{item.name}</span>
                    <span className="text-slate-500">{item.percentage}%</span>
                    <span className="font-mono text-slate-800">{money.format(item.amount)}</span>
                  </div>
                )) : <p className="text-sm text-slate-500">Add member rows to calculate distribution.</p>}
              </div>
            </section>
          </div>
        ) : (
          <section className="rounded-xl border border-slate-200 p-3.5">
            <h3 className="text-sm font-semibold text-slate-800">Report insights</h3>
            <p className="mb-3 text-xs text-slate-500">Insights are derived from the current member rows and calculated totals.</p>
            <div className="space-y-2">
              {insights.length ? insights.map((insight, index) => (
                <div key={insight} className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50/60 p-3 text-sm text-slate-700">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-xs font-semibold text-emerald-700">{index + 1}</span>
                  <span>{insight}</span>
                </div>
              )) : <p className="text-sm text-slate-500">Add member rows to generate report insights.</p>}
            </div>
          </section>
        )}

        {error ? (
          <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
        ) : (
          <p className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
            <CheckCircle2 className="h-4 w-4" /> Totals, available balances, and statuses are calculated automatically
          </p>
        )}
      </div>
    </FormModal>
  );
};
