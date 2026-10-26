import React, { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Coins,
  Download,
  FileSpreadsheet,
  Lightbulb,
  MoreHorizontal,
  Pencil,
  Plus,
  Scale,
  TrendingDown,
  TrendingUp,
  UploadCloud,
  Users,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { Select } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { useAppSelector } from "@/app/hooks";
import { AccessRestricted, EmptyState, LoadingSpinner } from "@/components/common";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FEATURES } from "@/constants/featureCodes";
import { useAuth } from "@/context/AuthContext";
import { isFinancialViewOnlyRole } from "@/constants/roleCodes";
import { usePageHeader } from "@/hooks/usePageHeader";
import { usePermission } from "@/hooks/usePermission";
import apiClient from "@/services/api/apiClient";
import { useGetBalanceSheetDatesQuery, useGetBalanceSheetQuery } from "../api";
import {
  BalanceSheetEditorModal,
  BalanceSheetImportModal,
} from "../components";
import type { BalanceSheet, BalanceSheetItem, BalanceSheetSection } from "../types";

const SECTION_LABELS: Record<BalanceSheetSection, string> = {
  current_asset: "Current assets",
  non_current_asset: "Non-current assets",
  current_liability: "Current liabilities",
  non_current_liability: "Non-current liabilities",
  equity: "Equity",
};

const SECTION_ORDER = Object.keys(SECTION_LABELS) as BalanceSheetSection[];

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const formatDate = (value: string) => {
  const [year, month, day] = value.split("-").map(Number);
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(year, month - 1, day));
};

interface SummaryCardProps {
  label: string;
  value: string;
  tone: "blue" | "violet" | "emerald";
}

const SummaryCard: React.FC<SummaryCardProps> = ({ label, value, tone }) => {
  const tones = {
    blue: "border-blue-100 bg-blue-50/70 text-blue-700",
    violet: "border-violet-100 bg-violet-50/70 text-violet-700",
    emerald: "border-emerald-100 bg-emerald-50/70 text-emerald-700",
  };
  return (
    <div className={`rounded-2xl border p-5 ${tones[tone]}`}>
      <p className="text-xs font-semibold uppercase tracking-wide opacity-70">
        {label}
      </p>
      <p className="mt-2 text-2xl font-bold tracking-tight">{value}</p>
    </div>
  );
};

export const BalanceSheetPage: React.FC = () => {
  const { account } = useAuth();
  const isFinancialViewOnly = isFinancialViewOnlyRole(account?.role_code);
  const activeAssociationId = useAppSelector(
    (state) => state.ui.activeAssociationId,
  );
  const { canView, canCreate: canCreatePermission, canUpdate: canUpdatePermission, isLoading: permissionLoading } =
    usePermission(FEATURES.BALANCE_SHEET.FEATURE_CODE);
  const canCreate = canCreatePermission && !isFinancialViewOnly;
  const canUpdate = canUpdatePermission && !isFinancialViewOnly;
  const canExport = !isFinancialViewOnly;
  const [selectedDate, setSelectedDate] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorBalanceSheet, setEditorBalanceSheet] = useState<BalanceSheet | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  usePageHeader({
    title: "Balance Sheet",
    description:
      "Review association assets, liabilities, and equity by reporting date.",
  });

  const associationId = useMemo(() => {
    if (String(activeAssociationId || "") === "ALL") return undefined;
    if (activeAssociationId) return String(activeAssociationId);
    return account?.association_id ? String(account.association_id) : undefined;
  }, [account?.association_id, activeAssociationId]);

  const { data: dates = [], isLoading: datesLoading } =
    useGetBalanceSheetDatesQuery(associationId || "", {
      skip: !canView || !associationId,
    });

  useEffect(() => {
    setSelectedDate("");
  }, [associationId]);

  useEffect(() => {
    if (dates.length && !selectedDate) {
      setSelectedDate(dates[0]);
    }
  }, [dates, selectedDate]);

  const {
    data: balanceSheet = null,
    isLoading: statementLoading,
    isFetching,
  } = useGetBalanceSheetQuery(
    {
      associationId: associationId || "",
      asOnDate: selectedDate || undefined,
    },
    { skip: !canView || !associationId },
  );

  const groupedItems = useMemo(() => {
    const grouped = Object.fromEntries(
      SECTION_ORDER.map((section) => [section, []]),
    ) as Record<BalanceSheetSection, BalanceSheetItem[]>;
    for (const item of balanceSheet?.items || []) {
      grouped[item.section].push(item);
    }
    return grouped;
  }, [balanceSheet]);

  const exportStatement = async () => {
    if (!associationId || !balanceSheet) return;
    try {
      setIsExporting(true);
      const response = await apiClient.get("/balance-sheets/export", {
        params: {
          association_id: associationId,
          as_on_date: balanceSheet.as_on_date,
        },
        responseType: "blob",
      });
      const url = URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = `balance_sheet_${balanceSheet.as_on_date}.xlsx`;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Unable to export the Balance Sheet");
    } finally {
      setIsExporting(false);
    }
  };

  if (permissionLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!canView) {
    return <AccessRestricted moduleName="Balance Sheet" showAction />;
  }

  if (!associationId) {
    return (
      <EmptyState
        icon={Scale}
        title="Select an association"
        description="Balance Sheets are association-specific. Choose one association from the global selector to continue."
        className="min-h-[420px]"
      />
    );
  }

  const isLoading = datesLoading || statementLoading;

  return (
    <div className="">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #balance-sheet-print, #balance-sheet-print * { visibility: visible; }
          #balance-sheet-print { position: absolute; inset: 0; width: 100%; }
          .balance-sheet-no-print { display: none !important; }
        }
      `}</style>

      <div className="balance-sheet-no-print flex flex-col gap-3 bg-white lg:flex-row lg:items-center justify-end">
        <div className="flex shrink-0 items-center gap-2 whitespace-nowrap">
          <Select
            icon={<CalendarDays size={15} />}
            options={dates.map((date) => ({
              value: date,
              label: `As on ${formatDate(date)}`,
            }))}
            value={selectedDate}
            disabled={!dates.length}
            placeholder="No saved dates"
            onChange={(event) => setSelectedDate(event.target.value)}
            size="sm"
            containerClassName="w-auto shrink-0"
            className="min-w-40"
          />
          <DatePicker
            value={dates.includes(selectedDate) ? "" : selectedDate}
            onChange={(value) => setSelectedDate(value || "")}
            placeholder="Custom date"
            displayFormat="MM/dd/yyyy"
            size="sm"
            containerClassName="w-auto shrink-0"
            triggerClassName="h-8 min-w-32 rounded-lg px-2 text-xs font-medium"
          />
          {isFetching && !isLoading ? <span className="text-xs text-slate-400">Refreshing...</span> : null}
          {(balanceSheet && canExport) || canCreate ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="iconSm" aria-label="More actions">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {balanceSheet && canExport ? (
                  <>
                    <DropdownMenuItem onSelect={exportStatement}>
                      <FileSpreadsheet className="h-4 w-4" />
                      {isExporting ? "Exporting..." : "Export Excel"}
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => window.print()}>
                      <Download className="h-4 w-4" /> Download PDF
                    </DropdownMenuItem>
                  </>
                ) : null}
                {canCreate ? (
                  <DropdownMenuItem
                    onSelect={() => {
                      setEditorBalanceSheet(null);
                      setEditorOpen(true);
                    }}
                  >
                    <Plus className="h-4 w-4" /> Create manually
                  </DropdownMenuItem>
                ) : null}
                {canCreate ? (
                  <DropdownMenuItem onSelect={() => setImportOpen(true)}>
                    <UploadCloud className="h-4 w-4" /> Import Excel
                  </DropdownMenuItem>
                ) : null}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
          {balanceSheet && canUpdate ? (
            <Button
              onClick={() => {
                setEditorBalanceSheet(balanceSheet);
                setEditorOpen(true);
              }}
            >
              <Pencil className="h-4 w-4" /> Update Balance Sheet
            </Button>
          ) : null}
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <LoadingSpinner />
        </div>
      ) : balanceSheet ? (
        <LegacyStatement balanceSheet={balanceSheet} groupedItems={groupedItems} />
      ) : (
        <div className="flex min-h-[380px] items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <div className="max-w-md">
            <FileSpreadsheet className="mx-auto h-10 w-10 text-slate-400" />
            <h2 className="mt-4 text-lg font-semibold text-slate-900">
              No Balance Sheet yet
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Create the statement manually or download the Excel template and
              import a completed workbook.
            </p>
            {canCreate ? (
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                <Button variant="outline" onClick={() => setImportOpen(true)}>
                  <UploadCloud className="h-4 w-4" /> Import Excel
                </Button>
                <Button onClick={() => setEditorOpen(true)}>
                  <Plus className="h-4 w-4" /> Create manually
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      )}

      <BalanceSheetEditorModal
        isOpen={editorOpen}
        associationId={associationId}
        balanceSheet={editorBalanceSheet}
        onClose={() => {
          setEditorOpen(false);
          setEditorBalanceSheet(null);
        }}
        onSaved={setSelectedDate}
      />
      <BalanceSheetImportModal
        isOpen={importOpen}
        associationId={associationId}
        initialDate={selectedDate}
        onClose={() => setImportOpen(false)}
        onImported={setSelectedDate}
      />
    </div>
  );
};

const LegacyStatement: React.FC<{
  balanceSheet: BalanceSheet;
  groupedItems: Record<BalanceSheetSection, BalanceSheetItem[]>;
}> = ({ balanceSheet, groupedItems }) => {
  const { totals } = balanceSheet;
  const totalAssets = Number(totals.total_assets);
  const totalLiabilities = Number(totals.total_liabilities);
  const totalEquity = Number(totals.total_equity);
  const totalFunding = totalLiabilities + totalEquity;
  const liabilityPct = totalFunding ? (totalLiabilities / totalFunding) * 100 : 0;
  const equityPct = totalFunding ? 100 - liabilityPct : 0;
  const fundingChartData = [
    { name: "Liabilities", value: totalLiabilities, color: "#818cf8" },
    { name: "Equity", value: totalEquity, color: "#38bdf8" },
  ].filter((entry) => entry.value > 0);
  const growth = (value?: string | null) =>
    value == null ? "No prior statement" : `${Number(value) >= 0 ? "+" : ""}${value}% vs prior statement`;

  return (
    <div id="balance-sheet-print" className="space-y-5">
      <div className="grid gap-4 md:grid-cols-3">
        <ReportKpi label="Total assets" value={currency.format(totalAssets)} growth={growth(balanceSheet.assets_growth_pct)} tone="emerald" />
        <ReportKpi label="Total liabilities" value={currency.format(totalLiabilities)} growth={growth(balanceSheet.liabilities_growth_pct)} tone="rose" />
        <ReportKpi label="Equity" value={currency.format(totalEquity)} growth={growth(balanceSheet.equity_growth_pct)} tone="blue" />
      </div>

      <div className="grid gap-6 xl:grid-cols-12">
        <div className="grid gap-6 xl:col-span-8 lg:grid-cols-2">
          <ReportTable title="Assets" sections={["current_asset", "non_current_asset"]} items={groupedItems} totalLabel="Total Assets" total={totals.total_assets} tone="emerald" />
          <ReportTable title="Liabilities & Equity" sections={["current_liability", "non_current_liability", "equity"]} items={groupedItems} totalLabel="Total Liabilities & Equity" total={totals.liabilities_and_equity} tone="indigo" />
        </div>
        <aside className="space-y-6 xl:col-span-4">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-bold text-slate-800">Assets vs Liabilities</h2>
            <div className="mt-4 grid items-center gap-5 sm:grid-cols-[160px_minmax(0,1fr)]">
              <div className="relative h-40 w-40 shrink-0" aria-label="Assets, liabilities, and equity chart">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={fundingChartData}
                      dataKey="value"
                      cx="50%"
                      cy="50%"
                      innerRadius={48}
                      outerRadius={72}
                      paddingAngle={3}
                      stroke="#ffffff"
                      strokeWidth={2}
                      isAnimationActive
                      animationDuration={350}
                    >
                      {fundingChartData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number, name: string) => [currency.format(value), name]}
                      contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "12px" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-7 flex flex-col items-center justify-center rounded-full bg-white text-center">
                  <span className="text-sm font-bold text-slate-800">{currency.format(totalAssets)}</span>
                  <span className="text-[10px] text-slate-400">Total</span>
                </div>
              </div>
              <div className="w-full space-y-3 text-xs">
                <Legend label="Assets" value={currency.format(totalAssets)} color="bg-emerald-500" detail="100%" />
                <Legend label="Liabilities" value={currency.format(totalLiabilities)} color="bg-indigo-400" detail={`${liabilityPct.toFixed(0)}%`} />
                <Legend label="Equity" value={currency.format(totalEquity)} color="bg-sky-400" detail={`${equityPct.toFixed(0)}%`} />
              </div>
            </div>
          </section>
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-indigo-50 p-1.5 text-indigo-600"><FileSpreadsheet className="h-4 w-4" /></span>
              <h2 className="font-bold text-slate-800">Key Financial Ratios</h2>
            </div>
            <div className="mt-3 divide-y divide-slate-100">
              <Ratio label="Current Ratio" detail="Higher is better" value={totals.current_ratio || "—"} />
              <Ratio label="Debt to Equity Ratio" detail="Lower is better" value={totals.debt_to_equity_ratio || "—"} />
              <Ratio label="Working Capital" detail="Current assets - current liabilities" value={currency.format(Number(totals.working_capital))} />
            </div>
            <div className="mt-4 rounded-xl border border-sky-100 bg-sky-50 p-3"><div className="flex items-center gap-2"><span className="rounded-lg bg-sky-100 p-1.5 text-sky-600"><Lightbulb className="h-4 w-4" /></span><p className="text-sm font-semibold text-slate-800">Financial Health {balanceSheet.health_status ? `· ${balanceSheet.health_status}` : ""}</p></div><p className="mt-2 text-xs leading-relaxed text-slate-600">{balanceSheet.health_note || "No commentary has been added for this statement."}</p><span className="mt-2 inline-flex rounded-full border border-sky-200 bg-white px-2 py-0.5 text-[11px] font-semibold text-sky-700">{balanceSheet.health_status || "Not provided"}</span></div>
          </section>
        </aside>
      </div>
    </div>
  );
};

const ReportKpi: React.FC<{ label: string; value: string; growth: string; tone: "emerald" | "rose" | "blue" }> = ({ label, value, growth, tone }) => {
  const colors = {
    emerald: "bg-[#e6f7ef] text-[#059669]",
    rose: "bg-[#feecef] text-[#e11d48]",
    blue: "bg-[#eff6ff] text-[#2563eb]",
  };
  const Icon = tone === "emerald" ? Coins : tone === "rose" ? Wallet : Users;
  return <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm"><div className="flex items-start gap-3"><span className={`flex h-10 w-10 items-center justify-center rounded-xl ${colors[tone]}`}><Icon className="h-4.5 w-4.5" /></span><div><p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{label}</p><p className="mt-0.5 text-xl font-bold text-slate-800">{value}</p><p className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-emerald-600"><TrendingUp className="h-3 w-3" />{growth}</p></div></div></div>;
};

const ReportTable: React.FC<{ title: string; sections: BalanceSheetSection[]; items: Record<BalanceSheetSection, BalanceSheetItem[]>; totalLabel: string; total: string; tone: "emerald" | "indigo" }> = ({ title, sections, items, totalLabel, total, tone }) => { const Icon = tone === "emerald" ? Coins : Scale; return <section className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="p-5"><div className="flex items-center gap-2.5"><span className={`rounded-lg p-1.5 ${tone === "emerald" ? "bg-emerald-50 text-emerald-600" : "bg-indigo-50 text-indigo-600"}`}><Icon className="h-4 w-4" /></span><h2 className="text-lg font-bold text-slate-800">{title}</h2></div><div className="mt-3 flex justify-between border-b border-slate-100 pb-2 text-xs font-semibold uppercase tracking-wide text-slate-400"><span>Particulars</span><span>Amount (₹)</span></div>{sections.map((section) => { const rows = items[section]; const subtotal = rows.reduce((sum, item) => sum + Number(item.amount), 0); return <div key={section} className="mt-4"><h3 className="text-sm font-bold text-slate-800">{SECTION_LABELS[section]}</h3>{rows.map((item) => <div key={item.id} className="mt-2 flex justify-between gap-3 text-sm text-slate-600"><span className="truncate">{item.account_name}</span><span className="shrink-0 font-mono text-slate-800">{currency.format(Number(item.amount))}</span></div>)}<div className={`mt-3 flex justify-between rounded-lg px-3 py-2 text-sm font-bold ${tone === "emerald" ? "bg-emerald-50 text-emerald-800" : "bg-indigo-50 text-indigo-800"}`}><span>Total {SECTION_LABELS[section]}</span><span>{currency.format(subtotal)}</span></div></div>; })}</div><div className={`mt-auto flex justify-between p-4 font-bold text-white ${tone === "emerald" ? "bg-emerald-600" : "bg-indigo-600"}`}><span>{totalLabel}</span><span>{currency.format(Number(total))}</span></div></section>; };

const Legend: React.FC<{ label: string; value: string; detail: string; color: string }> = ({ label, value, detail, color }) => <div className="flex gap-2"><span className={`mt-1 h-2.5 w-2.5 rounded-full ${color}`} /><p><span className="block text-slate-500">{label}</span><span className="font-semibold text-slate-800">{value} <span className="font-normal text-slate-400">({detail})</span></span></p></div>;
const Ratio: React.FC<{ label: string; detail: string; value: string }> = ({ label, detail, value }) => <div className="flex items-center justify-between py-3"><p><span className="block text-sm font-semibold text-slate-800">{label}</span><span className="text-[11px] text-slate-400">{detail}</span></p><span className="flex items-center gap-1 font-mono font-bold text-slate-900">{value}{label === "Debt to Equity Ratio" ? <TrendingDown className="h-3.5 w-3.5 text-emerald-600" /> : <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />}</span></div>;

const StatementSection: React.FC<{
  section: BalanceSheetSection;
  items: BalanceSheetItem[];
}> = ({ section, items }) => (
  <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
    <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-5 py-3">
      <h2 className="text-sm font-semibold text-slate-800">
        {SECTION_LABELS[section]}
      </h2>
      <span className="text-sm font-semibold text-slate-700">
        {currency.format(
          items.reduce((sum, item) => sum + Number(item.amount), 0),
        )}
      </span>
    </div>
    {items.length ? (
      <div className="divide-y divide-slate-100">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between gap-4 px-5 py-3 text-sm"
          >
            <div className="min-w-0">
              <p className="truncate font-medium text-slate-700">
                {item.account_name}
              </p>
              {item.account_code ? (
                <p className="text-xs text-slate-400">{item.account_code}</p>
              ) : null}
            </div>
            <span className="shrink-0 font-mono text-slate-800">
              {currency.format(Number(item.amount))}
            </span>
          </div>
        ))}
      </div>
    ) : (
      <p className="px-5 py-5 text-center text-sm text-slate-400">No items</p>
    )}
  </section>
);

const StatementTotal: React.FC<{ label: string; amount: string }> = ({
  label,
  amount,
}) => (
  <div className="flex items-center justify-between rounded-2xl bg-slate-900 px-5 py-4 text-white">
    <span className="text-sm font-semibold">{label}</span>
    <span className="font-mono text-lg font-bold">
      {currency.format(Number(amount))}
    </span>
  </div>
);

const Metric: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div>
    <p className="text-xs font-medium text-slate-500">{label}</p>
    <p className="mt-1 text-lg font-bold text-slate-900">{value}</p>
  </div>
);

export default BalanceSheetPage;
