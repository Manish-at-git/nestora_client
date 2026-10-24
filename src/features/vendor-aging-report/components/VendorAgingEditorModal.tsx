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
  useCreateVendorAgingReportMutation,
  useUpdateVendorAgingReportMutation,
} from "../api";
import type {
  VendorAgingReport,
  VendorAgingReportPayload,
  VendorAgingRowInput,
} from "../types";

interface Props {
  isOpen: boolean;
  associationId: string;
  report: VendorAgingReport | null;
  onClose: () => void;
  onSaved: (period: string) => void;
}

interface EditorRow extends VendorAgingRowInput {
  key: string;
}

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

const defaultPeriod = () => {
  const now = new Date();
  return {
    start: new Date(now.getFullYear(), 3, 1).toISOString().slice(0, 10),
    end: new Date(now.getFullYear() + 1, 2, 31).toISOString().slice(0, 10),
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
  vendor_name: "",
  category: "",
  invoice_number: "",
  invoice_date: "",
  current_due: "0",
  days_1_30: "0",
  days_31_60: "0",
  days_61_90: "0",
  days_over_90: "0",
});

const amountFields: Array<keyof Pick<
  VendorAgingRowInput,
  "current_due" | "days_1_30" | "days_31_60" | "days_61_90" | "days_over_90"
>> = ["current_due", "days_1_30", "days_31_60", "days_61_90", "days_over_90"];

export const VendorAgingEditorModal: React.FC<Props> = ({
  isOpen,
  associationId,
  report,
  onClose,
  onSaved,
}) => {
  const [periodStart, setPeriodStart] = useState(defaultPeriod().start);
  const [periodEnd, setPeriodEnd] = useState(defaultPeriod().end);
  const [rows, setRows] = useState<EditorRow[]>([]);
  const [activeTab, setActiveTab] = useState<"invoices" | "kpis" | "insights">("invoices");
  const [error, setError] = useState("");
  const [createReport, createState] = useCreateVendorAgingReportMutation();
  const [updateReport, updateState] = useUpdateVendorAgingReportMutation();

  useEffect(() => {
    if (!isOpen) return;
    if (report) {
      const [start, end] = report.fiscal_period.split(" - ");
      setPeriodStart(parsePeriodDate(start) || defaultPeriod().start);
      setPeriodEnd(parsePeriodDate(end) || defaultPeriod().end);
      setRows(
        report.rows.map((row) => ({
          key: row.id,
          vendor_name: row.vendor_name,
          category: row.category,
          invoice_number: row.invoice_number,
          invoice_date: row.invoice_date,
          current_due: String(row.current_due),
          days_1_30: String(row.days_1_30),
          days_31_60: String(row.days_31_60),
          days_61_90: String(row.days_61_90),
          days_over_90: String(row.days_over_90),
        })),
      );
    } else {
      const period = defaultPeriod();
      setPeriodStart(period.start);
      setPeriodEnd(period.end);
      setRows([emptyRow()]);
    }
    setError("");
    setActiveTab("invoices");
  }, [isOpen, report]);

  const totals = useMemo(() => {
    let current = 0;
    let overdue = 0;
    for (const row of rows) {
      current += Number(row.current_due) || 0;
      overdue +=
        (Number(row.days_1_30) || 0) +
        (Number(row.days_31_60) || 0) +
        (Number(row.days_61_90) || 0) +
        (Number(row.days_over_90) || 0);
    }
    return { current, overdue, outstanding: current + overdue };
  }, [rows]);

  const period = `${formatDate(periodStart)} - ${formatDate(periodEnd)}`;
  const categoryDistribution = useMemo(() => {
    const grouped = new Map<string, number>();
    rows.forEach((row) => {
      const name = row.category.trim() || "Uncategorized";
      const amount = amountFields.reduce((sum, field) => sum + (Number(row[field]) || 0), 0);
      grouped.set(name, (grouped.get(name) || 0) + amount);
    });
    return Array.from(grouped.entries())
      .map(([name, amount]) => ({
        name,
        amount,
        percentage: totals.outstanding ? Math.round((amount / totals.outstanding) * 100) : 0,
      }))
      .sort((left, right) => right.amount - left.amount);
  }, [rows, totals.outstanding]);
  const agingDistribution = useMemo(() => {
    const values = [
      { name: "Current", amount: totals.current },
      { name: "1-30 days", amount: rows.reduce((sum, row) => sum + (Number(row.days_1_30) || 0), 0) },
      { name: "31-60 days", amount: rows.reduce((sum, row) => sum + (Number(row.days_31_60) || 0), 0) },
      { name: "61-90 days", amount: rows.reduce((sum, row) => sum + (Number(row.days_61_90) || 0), 0) },
      { name: ">90 days", amount: rows.reduce((sum, row) => sum + (Number(row.days_over_90) || 0), 0) },
    ];
    return values.map((item) => ({
      ...item,
      percentage: totals.outstanding ? Math.round((item.amount / totals.outstanding) * 100) : 0,
    }));
  }, [rows, totals]);
  const insights = useMemo(() => {
    const values: string[] = [];
    if (rows.length) {
      values.push(`${money.format(totals.outstanding)} outstanding across ${rows.length} vendor invoice${rows.length === 1 ? "" : "s"}.`);
    }
    const overdue = rows.filter((row) => amountFields.slice(1).some((field) => (Number(row[field]) || 0) > 0)).length;
    if (overdue) values.push(`${overdue} invoice${overdue === 1 ? "" : "s"} have an overdue balance.`);
    const leadingCategory = categoryDistribution[0];
    if (leadingCategory) values.push(`${leadingCategory.name} represents ${leadingCategory.percentage}% of outstanding vendor balances.`);
    return values;
  }, [categoryDistribution, rows, totals.outstanding]);
  const updateRow = (
    key: string,
    field: keyof VendorAgingRowInput,
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
    if (!rows.length) return "Add at least one vendor invoice row.";
    for (const [index, row] of rows.entries()) {
      if (
        !row.vendor_name.trim() ||
        !row.category.trim() ||
        !row.invoice_number.trim() ||
        !row.invoice_date
      ) {
        return `Complete all required fields in row ${index + 1}.`;
      }
      if (
        amountFields.some((field) => {
          const amount = Number(row[field]);
          return !Number.isFinite(amount) || amount < 0;
        })
      ) {
        return `Aging amounts in row ${index + 1} must be non-negative numbers.`;
      }
    }
    const invoiceKeys = rows.map(
      (row) => `${row.vendor_name.trim().toLocaleLowerCase()}::${row.invoice_number.trim().toLocaleLowerCase()}`,
    );
    if (new Set(invoiceKeys).size !== invoiceKeys.length) {
      return "Invoice numbers must be unique for each vendor.";
    }
    return "";
  };

  const submit = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    const payload: VendorAgingReportPayload = {
      association_id: associationId,
      fiscal_period: period,
      rows: rows.map(({ key: _key, ...row }) => ({
        ...row,
        vendor_name: row.vendor_name.trim(),
        category: row.category.trim(),
        invoice_number: row.invoice_number.trim(),
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
          ? "Vendor Aging Report updated successfully"
          : "Vendor Aging Report created successfully",
      );
      onSaved(period);
      onClose();
    } catch (requestError: unknown) {
      const detail = requestError as { data?: unknown };
      const message = formatApiErrorDetail(
        detail.data || "Unable to save the Vendor Aging Report",
      );
      setError(message);
      toast.error(message);
    }
  };

  const renderAmount = (
    row: EditorRow,
    field: (typeof amountFields)[number],
  ) => (
    <Input
      type="number"
      min="0"
      step="0.01"
      value={row[field]}
      onChange={(event) => updateRow(row.key, field, event.target.value)}
      className="h-9 rounded-lg border border-slate-200 px-2 text-right font-mono text-sm"
    />
  );

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={report ? "Update Vendor Aging Report" : "Create Vendor Aging Report"}
      description="Manage vendor invoice balances across aging buckets"
      size="full"
      isSubmitting={createState.isLoading || updateState.isLoading}
      submitText="Save Vendor Aging Report"
      loadingText="Saving..."
      onSubmit={submit}
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-blue-100 bg-blue-50/50 px-3.5 py-2.5">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-blue-600" />
            <span className="text-xs font-semibold text-blue-900">Fiscal period:</span>
            <DatePicker
              value={periodStart}
              onChange={(value) => setPeriodStart(value || "")}
              displayFormat="MMM d, yyyy"
              size="sm"
              triggerClassName="h-8 w-32 text-xs"
            />
            <span className="text-xs text-slate-500">to</span>
            <DatePicker
              value={periodEnd}
              onChange={(value) => setPeriodEnd(value || "")}
              displayFormat="MMM d, yyyy"
              size="sm"
              triggerClassName="h-8 w-32 text-xs"
            />
          </div>
          <div className="flex flex-wrap gap-3 text-xs font-semibold">
            <span className="text-blue-700">Outstanding: {money.format(totals.outstanding)}</span>
            <span className="text-rose-700">Overdue: {money.format(totals.overdue)}</span>
            <span className="text-emerald-700">Current: {money.format(totals.current)}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pb-3">
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as "invoices" | "kpis" | "insights")}
          >
            <TabsList className="grid h-auto w-full grid-cols-3 rounded-xl bg-slate-100/80 p-1">
              <TabsTrigger value="invoices" className="min-w-0 whitespace-normal rounded-lg px-2 py-2 text-xs font-semibold leading-tight">
                Vendor Invoices ({rows.length})
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

        {activeTab === "invoices" ? (
        <section className="rounded-xl border border-slate-200 bg-slate-50/40 p-3.5">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-800">Vendor invoices</h3>
              <p className="text-xs text-slate-500">
                Total outstanding and payment status are calculated automatically.
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700"
              onClick={() => setRows((items) => [...items, emptyRow()])}
            >
              <Plus className="h-3.5 w-3.5" /> Add invoice
            </Button>
          </div>
          <div className="overflow-hidden">
            <div className="space-y-2">
              <div className="grid grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)_minmax(0,.9fr)_minmax(0,1fr)_repeat(5,minmax(0,.8fr))_28px] gap-2 px-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                <span>Vendor</span>
                <span>Category</span>
                <span>Invoice</span>
                <span>Date</span>
                <span className="text-right">Current</span>
                <span className="text-right">1-30</span>
                <span className="text-right">31-60</span>
                <span className="text-right">61-90</span>
                <span className="text-right">&gt; 90</span>
                <span />
              </div>
              {rows.map((row) => (
                <div
                  key={row.key}
                  className="grid grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)_minmax(0,.9fr)_minmax(0,1fr)_repeat(5,minmax(0,.8fr))_28px] items-center gap-2 [&>*]:min-w-0"
                >
                  <Input
                    value={row.vendor_name}
                    onChange={(event) => updateRow(row.key, "vendor_name", event.target.value)}
                    placeholder="Vendor name"
                    className="h-9 rounded-lg border border-slate-200 px-2 text-sm"
                  />
                  <Input
                    value={row.category}
                    onChange={(event) => updateRow(row.key, "category", event.target.value)}
                    placeholder="Category"
                    className="h-9 rounded-lg border border-slate-200 px-2 text-sm"
                  />
                  <Input
                    value={row.invoice_number}
                    onChange={(event) => updateRow(row.key, "invoice_number", event.target.value)}
                    placeholder="Invoice no."
                    className="h-9 rounded-lg border border-slate-200 px-2 text-sm"
                  />
                  <DatePicker
                    value={row.invoice_date}
                    onChange={(value) => updateRow(row.key, "invoice_date", value || "")}
                    displayFormat="MMM d, yyyy"
                    size="sm"
                    triggerClassName="h-9 w-full text-xs"
                  />
                  {renderAmount(row, "current_due")}
                  {renderAmount(row, "days_1_30")}
                  {renderAmount(row, "days_31_60")}
                  {renderAmount(row, "days_61_90")}
                  {renderAmount(row, "days_over_90")}
                  <Button
                    type="button"
                    variant="ghost"
                    size="iconSm"
                    onClick={() =>
                      setRows((items) => items.filter((item) => item.key !== row.key))
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
                ["Outstanding", money.format(totals.outstanding)],
                ["Overdue", money.format(totals.overdue)],
                ["Current due", money.format(totals.current)],
                ["Invoices", String(rows.length)],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
                  <p className="text-xs font-semibold text-slate-500">{label}</p>
                  <p className="mt-1 text-lg font-bold text-slate-900">{value}</p>
                </div>
              ))}
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              {[
                { title: "Outstanding by category", values: categoryDistribution },
                { title: "Outstanding by aging bucket", values: agingDistribution },
              ].map((section) => (
                <section key={section.title} className="rounded-xl border border-slate-200 p-3.5">
                  <h3 className="mb-3 text-sm font-semibold text-slate-800">{section.title}</h3>
                  <div className="space-y-2">
                    {section.values.map((item) => (
                      <div key={item.name} className="grid grid-cols-[1fr_auto_auto] gap-3 text-sm">
                        <span className="truncate text-slate-700">{item.name}</span>
                        <span className="text-slate-500">{item.percentage}%</span>
                        <span className="font-mono text-slate-800">{money.format(item.amount)}</span>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </div>
        ) : (
          <section className="rounded-xl border border-slate-200 p-3.5">
            <h3 className="text-sm font-semibold text-slate-800">Report insights</h3>
            <p className="mb-3 text-xs text-slate-500">Insights are derived from the current invoice rows and aging totals.</p>
            <div className="space-y-2">
              {insights.length ? insights.map((insight, index) => (
                <div key={insight} className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50/60 p-3 text-sm text-slate-700">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-semibold text-blue-700">{index + 1}</span>
                  <span>{insight}</span>
                </div>
              )) : <p className="text-sm text-slate-500">Add invoice rows to generate report insights.</p>}
            </div>
          </section>
        )}

        {error ? (
          <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
        ) : (
          <p className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
            <CheckCircle2 className="h-4 w-4" /> All summaries and aging statuses are calculated by the server
          </p>
        )}
      </div>
    </FormModal>
  );
};
