import React, { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Plus,
  Scale,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { FormModal } from "@/components/common";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Select } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useCreateBalanceSheetMutation,
  useUpdateBalanceSheetMutation,
} from "../api";
import type {
  BalanceSheet,
  BalanceSheetItemInput,
  BalanceSheetPayload,
  BalanceSheetSection,
} from "../types";

interface EditorRow extends BalanceSheetItemInput {
  key: string;
}

interface BalanceSheetEditorModalProps {
  isOpen: boolean;
  associationId: string;
  balanceSheet: BalanceSheet | null;
  onClose: () => void;
  onSaved: (date: string) => void;
}

type EditorTab = "assets" | "liabilities" | "health";

const SECTIONS: Array<{
  value: BalanceSheetSection;
  label: string;
}> = [
  { value: "current_asset", label: "Current assets" },
  { value: "non_current_asset", label: "Non-current assets" },
  { value: "current_liability", label: "Current liabilities" },
  { value: "non_current_liability", label: "Non-current liabilities" },
  { value: "equity", label: "Equity" },
];

const HEALTH_STATUS_OPTIONS = [
  { value: "", label: "No status selected" },
  { value: "Healthy", label: "Healthy" },
  { value: "Stable", label: "Stable" },
  { value: "Attention Needed", label: "Attention needed" },
  { value: "Critical", label: "Critical" },
];

const createKey = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random()}`;

const today = () => {
  const value = new Date();
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

const percentage = (value: string | number | null | undefined) =>
  value === null || value === undefined
    ? "No prior statement"
    : `${Number(value) >= 0 ? "+" : ""}${value}%`;

export const BalanceSheetEditorModal: React.FC<
  BalanceSheetEditorModalProps
> = ({ isOpen, associationId, balanceSheet, onClose, onSaved }) => {
  const [activeTab, setActiveTab] = useState<EditorTab>("assets");
  const [asOnDate, setAsOnDate] = useState(today());
  const [rows, setRows] = useState<EditorRow[]>([]);
  const [healthStatus, setHealthStatus] = useState("");
  const [healthNote, setHealthNote] = useState("");
  const [formError, setFormError] = useState("");
  const [createBalanceSheet, createState] = useCreateBalanceSheetMutation();
  const [updateBalanceSheet, updateState] = useUpdateBalanceSheetMutation();
  const isSaving = createState.isLoading || updateState.isLoading;

  useEffect(() => {
    if (!isOpen) return;

    setActiveTab("assets");
    setAsOnDate(balanceSheet?.as_on_date || today());
    setRows(
      (balanceSheet?.items || []).map((item) => ({
        key: item.id,
        section: item.section,
        account_name: item.account_name,
        amount: String(item.amount),
        chart_of_account_id: item.chart_of_account_id,
      })),
    );
    setHealthStatus(balanceSheet?.health_status || "");
    setHealthNote(balanceSheet?.health_note || "");
    setFormError("");
  }, [balanceSheet, isOpen]);

  const totals = useMemo(() => {
    const bySection = Object.fromEntries(
      SECTIONS.map(({ value }) => [value, 0]),
    ) as Record<BalanceSheetSection, number>;

    for (const row of rows) {
      bySection[row.section] += Number(row.amount) || 0;
    }

    const assets = bySection.current_asset + bySection.non_current_asset;
    const liabilitiesAndEquity =
      bySection.current_liability +
      bySection.non_current_liability +
      bySection.equity;

    return {
      bySection,
      assets,
      liabilitiesAndEquity,
      difference: assets - liabilitiesAndEquity,
    };
  }, [rows]);

  const isBalanced = Math.abs(totals.difference) < 0.005;
  const updateRow = (
    key: string,
    field: "account_name" | "amount",
    value: string,
  ) => {
    setRows((current) =>
      current.map((row) =>
        row.key === key ? { ...row, [field]: value } : row,
      ),
    );
  };

  const addRow = (section: BalanceSheetSection) => {
    setRows((current) => [
      ...current,
      {
        key: createKey(),
        section,
        account_name: "",
        amount: "0",
      },
    ]);
  };

  const removeRow = (key: string) => {
    setRows((current) => current.filter((row) => row.key !== key));
  };

  const submit = async () => {
    const cleanedRows = rows.map(({ key: _key, ...row }) => ({
      ...row,
      account_name: row.account_name.trim(),
      amount: String(row.amount),
    }));

    if (!cleanedRows.length) {
      setFormError("Add at least one Balance Sheet item");
      return;
    }
    if (cleanedRows.some((row) => !row.account_name)) {
      setFormError("Every Balance Sheet item needs an account name");
      return;
    }
    if (cleanedRows.some((row) => !Number.isFinite(Number(row.amount)))) {
      setFormError("Every Balance Sheet item needs a valid amount");
      return;
    }
    if (!isBalanced) {
      setFormError(
        `The statement is out of balance by ${currency.format(Math.abs(totals.difference))}`,
      );
      return;
    }

    const payload: BalanceSheetPayload = {
      association_id: associationId,
      as_on_date: asOnDate,
      items: cleanedRows,
      health_status: healthStatus || null,
      health_note: healthNote.trim() || null,
    };

    try {
      if (balanceSheet) {
        await updateBalanceSheet({ id: balanceSheet.id, data: payload }).unwrap();
      } else {
        await createBalanceSheet(payload).unwrap();
      }
      toast.success(
        balanceSheet
          ? "Balance Sheet updated successfully"
          : "Balance Sheet created successfully",
      );
      onSaved(asOnDate);
      onClose();
    } catch (error: any) {
      const message =
        typeof error?.data === "string"
          ? error.data
          : error?.data?.message || "Unable to save the Balance Sheet";
      setFormError(message);
      toast.error(message);
    }
  };

  const renderSection = (section: (typeof SECTIONS)[number]) => {
    const sectionRows = rows.filter((row) => row.section === section.value);
    const subtotal = totals.bySection[section.value];

    return (
      <section
        key={section.value}
        className="rounded-xl border border-slate-200 bg-slate-50/80 p-3.5"
      >
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-800">
              {section.label}
            </h3>
            <p className="text-xs text-slate-500">
              Subtotal: {currency.format(subtotal)}
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700"
            onClick={() => addRow(section.value)}
          >
            <Plus className="h-3.5 w-3.5" /> Add row
          </Button>
        </div>

        {sectionRows.length ? (
          <div className="space-y-2">
            {sectionRows.map((row) => (
              <div
                key={row.key}
                className="grid grid-cols-[minmax(0,1fr)_144px_32px] gap-2"
              >
                <input
                  value={row.account_name}
                  onChange={(event) =>
                    updateRow(row.key, "account_name", event.target.value)
                  }
                  placeholder="Account name"
                  className="h-9 min-w-0 rounded-lg border border-slate-200 bg-white px-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                />
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-2.5 flex items-center text-xs text-slate-400">
                    ₹
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    value={row.amount}
                    onChange={(event) =>
                      updateRow(row.key, "amount", event.target.value)
                    }
                    aria-label={`${section.label} amount`}
                    className="h-9 w-full rounded-lg border border-slate-200 bg-white py-1 pl-6 pr-2.5 text-right font-mono text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Remove item"
                  onClick={() => removeRow(row.key)}
                >
                  <Trash2 className="h-4 w-4 text-slate-400 hover:text-rose-500" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="rounded-lg border border-dashed border-slate-200 bg-white px-3 py-3 text-center text-xs text-slate-400">
            No items in this section
          </p>
        )}

        {section.value === "non_current_asset" ? (
          <p className="mt-2 text-xs text-slate-400">
            Enter depreciation as a negative amount to subtract it from assets.
          </p>
        ) : null}

        <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3 text-sm font-semibold text-slate-700">
          <span>Total {section.label}</span>
          <span className="font-mono">{currency.format(subtotal)}</span>
        </div>
      </section>
    );
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={balanceSheet ? "Update Balance Sheet" : "Create Balance Sheet"}
      description="Manage the financial position for this association"
      icon={<Scale className="h-5 w-5 text-indigo-600" />}
      size="3xl"
      isSubmitting={isSaving}
      submitText={balanceSheet ? "Save Balance Sheet" : "Create Balance Sheet"}
      loadingText="Saving"
      submitIcon={<Scale className="h-4 w-4" />}
      // submitVariant="primary"
      extraActions={
        <div
          className={`flex items-center gap-1.5 text-xs ${
            isBalanced ? "text-emerald-700" : "text-amber-700"
          }`}
        >
          <AlertCircle className="h-4 w-4" />
          {isBalanced
            ? "Balance Sheet is balanced"
            : "Please verify line items to balance the sheet"}
        </div>
      }
      onSubmit={submit}
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-indigo-100 bg-indigo-50/50 px-3.5 py-2.5">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-indigo-600" />
            <label className="text-xs font-medium text-slate-700" htmlFor="balance-sheet-date">
              Statement as-on date:
            </label>
            <DatePicker
              id="balance-sheet-date"
              value={asOnDate}
              onChange={(value) => setAsOnDate(value || "")}
              displayFormat="MM/dd/yyyy"
              placeholder="Select date"
              size="sm"
              containerClassName="w-auto"
              triggerClassName="h-8 min-w-28 rounded-lg border-indigo-200 px-2 text-xs font-medium"
            />
          </div>

          <div
            className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
              isBalanced
                ? "bg-emerald-100 text-emerald-700"
                : "bg-amber-100 text-amber-700"
            }`}
          >
            {isBalanced ? (
              <CheckCircle2 className="h-3.5 w-3.5" />
            ) : (
              <AlertCircle className="h-3.5 w-3.5" />
            )}
            {isBalanced
              ? "Balanced"
              : `Unbalanced by ${currency.format(Math.abs(totals.difference))}`}
          </div>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as EditorTab)}
          className="w-full"
        >
          <TabsList className="grid h-auto w-full grid-cols-3 rounded-xl bg-slate-100/80 p-1">
            <TabsTrigger
              value="assets"
              className="min-w-0 whitespace-normal rounded-lg px-2 py-2 text-xs font-semibold leading-tight"
            >
              Assets ({currency.format(totals.assets)})
            </TabsTrigger>
            <TabsTrigger
              value="liabilities"
              className="min-w-0 whitespace-normal rounded-lg px-2 py-2 text-xs font-semibold leading-tight"
            >
              Liabilities & Equity ({currency.format(totals.liabilitiesAndEquity)})
            </TabsTrigger>
            <TabsTrigger
              value="health"
              className="min-w-0 whitespace-normal rounded-lg px-2 py-2 text-xs font-semibold leading-tight"
            >
              YoY Growth & Health Note
            </TabsTrigger>
          </TabsList>

          <TabsContent value="health" className="mt-4">
          <div className="space-y-4">
            <section className="rounded-xl border border-slate-200 bg-slate-50/80 p-3.5">
              <h3 className="text-sm font-semibold text-slate-800">
                Year-over-year growth
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Growth is calculated from the prior saved statement for this association.
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                {[
                  { label: "Total assets growth", value: balanceSheet?.assets_growth_pct },
                  {
                    label: "Total liabilities growth",
                    value: balanceSheet?.liabilities_growth_pct,
                  },
                  { label: "Equity growth", value: balanceSheet?.equity_growth_pct },
                ].map((growth) => (
                  <div key={growth.label}>
                    <p className="text-xs text-slate-500">{growth.label}</p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {percentage(growth.value)}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-xl border border-slate-200 bg-slate-50/80 p-3.5">
              <h3 className="text-sm font-semibold text-slate-800">
                Financial health indicator & commentary
              </h3>
              <div className="mt-3 space-y-3">
                <div className="max-w-xs">
                  <label className="mb-1 block text-xs font-medium text-slate-700">
                    Health status
                  </label>
                  <Select
                    value={healthStatus}
                    options={HEALTH_STATUS_OPTIONS}
                    placeholder="Select health status"
                    onChange={(event) => setHealthStatus(event.target.value)}
                    size="sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">
                    Financial health description
                  </label>
                  <textarea
                    rows={3}
                    value={healthNote}
                    onChange={(event) => setHealthNote(event.target.value)}
                    placeholder="Add financial health commentary"
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
              </div>
            </section>
          </div>
          </TabsContent>

          <TabsContent value="assets" className="mt-4">
          <div className="space-y-3">
            {SECTIONS.slice(0, 2).map(renderSection)}
            <div
              className="flex items-center justify-between rounded-xl bg-emerald-600 px-3.5 py-3 text-sm font-semibold text-white"
            >
              <span>Total assets</span>
              <span className="font-mono">{currency.format(totals.assets)}</span>
            </div>
          </div>
          </TabsContent>

          <TabsContent value="liabilities" className="mt-4">
            <div className="space-y-3">
              {SECTIONS.slice(2).map(renderSection)}
              <div className="flex items-center justify-between rounded-xl bg-indigo-600 px-3.5 py-3 text-sm font-semibold text-white">
                <span>Total liabilities & equity</span>
                <span className="font-mono">
                  {currency.format(totals.liabilitiesAndEquity)}
                </span>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {formError ? (
          <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {formError}
          </p>
        ) : null}
      </div>
    </FormModal>
  );
};
