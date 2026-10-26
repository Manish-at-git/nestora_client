import React, { useDeferredValue, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Banknote,
  Building2,
  FileSpreadsheet,
  FileText,
  Lightbulb,
  MoreHorizontal,
  Pencil,
  Plus,
  Printer,
  Search,
  Timer,
  UploadCloud,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";

import { useAppSelector } from "@/app/hooks";
import { useAuth } from "@/context/AuthContext";
import { AccessRestricted, EmptyState, LoadingSpinner } from "@/components/common";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select } from "@/components/ui/select";
import { FEATURES } from "@/constants/featureCodes";
import { isFinancialViewOnlyRole } from "@/constants/roleCodes";
import { usePageHeader } from "@/hooks/usePageHeader";
import { usePermission } from "@/hooks/usePermission";
import apiClient, { formatApiErrorDetail } from "@/services/api/apiClient";
import {
  useGetVendorAgingPeriodsQuery,
  useGetVendorAgingReportQuery,
} from "../api";
import {
  VendorAgingEditorModal,
  VendorAgingReportImportModal,
} from "../components";
import type { VendorAgingReport } from "../types";

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});
const colors = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444", "#64748b"];
const pageSize = 10;

const MetricCard: React.FC<{
  label: string;
  value: string;
  note: string;
  icon: React.ReactNode;
}> = ({ label, value, note, icon }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
    <div className="flex items-center gap-3">
      <span className="rounded-xl bg-blue-50 p-2.5 text-blue-600">{icon}</span>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">{label}</p>
        <p className="truncate text-xl font-bold text-slate-900">{value}</p>
        <p className="text-[10px] text-slate-500">{note}</p>
      </div>
    </div>
  </div>
);

export const VendorAgingReportPage: React.FC = () => {
  const { account } = useAuth();
  const isFinancialViewOnly = isFinancialViewOnlyRole(account?.role_code);
  const associationId = useAppSelector((state) => state.ui.activeAssociationId);
  const { canView, canCreate: canCreatePermission, canUpdate: canUpdatePermission, isLoading: permissionLoading } =
    usePermission(FEATURES.VENDOR_AGING_REPORT.FEATURE_CODE);
  const canCreate = canCreatePermission && !isFinancialViewOnly;
  const canUpdate = canUpdatePermission && !isFinancialViewOnly;
  const canExport = !isFinancialViewOnly;
  const [selectedPeriod, setSelectedPeriod] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [editorOpen, setEditorOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [editorReport, setEditorReport] = useState<VendorAgingReport | null>(null);
  const deferredSearch = useDeferredValue(search.trim());
  const skip = !canView || !associationId || associationId === "ALL";

  const {
    data: periods = [],
    isLoading: periodsLoading,
    isError: periodsError,
  } = useGetVendorAgingPeriodsQuery(String(associationId || ""), { skip });
  const {
    data: fullReport,
    isLoading: fullReportLoading,
    isError: fullReportError,
  } = useGetVendorAgingReportQuery(
    {
      associationId: String(associationId || ""),
      fiscalPeriod: selectedPeriod || undefined,
    },
    { skip },
  );
  const hasFilters = Boolean(selectedCategory || deferredSearch);
  const {
    data: filteredReport,
    isLoading: filteredReportLoading,
    isError: filteredReportError,
  } = useGetVendorAgingReportQuery(
    {
      associationId: String(associationId || ""),
      fiscalPeriod: selectedPeriod || undefined,
      category: selectedCategory || undefined,
      search: deferredSearch || undefined,
    },
    { skip: skip || !hasFilters },
  );
  const report = hasFilters ? filteredReport : fullReport;

  usePageHeader({
    title: "Vendor Aging Report",
    description: "Review vendor invoices and outstanding balances by aging bucket.",
  });

  useEffect(() => {
    setSelectedPeriod("");
    setSelectedCategory("");
    setSearch("");
    setPage(1);
  }, [associationId]);

  useEffect(() => {
    if (!selectedPeriod && periods.length) setSelectedPeriod(periods[0]);
  }, [periods, selectedPeriod]);

  useEffect(() => {
    setPage(1);
  }, [selectedPeriod, selectedCategory, deferredSearch]);

  useEffect(() => {
    if (
      selectedCategory &&
      fullReport &&
      !fullReport.available_categories.includes(selectedCategory)
    ) {
      setSelectedCategory("");
    }
  }, [fullReport, selectedCategory]);

  const totalPages = Math.max(1, Math.ceil((report?.rows.length || 0) / pageSize));
  const agingChart = useMemo(
    () => report?.aging_distribution.map((item) => ({
      name: item.name,
      amount: Number(item.amount),
      percentage: Number(item.percentage),
    })) || [],
    [report],
  );
  const categoryChart = useMemo(
    () => report?.category_distribution.map((item) => ({
      name: item.name,
      amount: Number(item.amount),
    })) || [],
    [report],
  );

  const openCreate = () => {
    setEditorReport(null);
    setEditorOpen(true);
  };
  const openUpdate = () => {
    setEditorReport(fullReport || null);
    setEditorOpen(true);
  };

  const exportExcel = async () => {
    if (!report) return;
    try {
      const response = await apiClient.get("/vendor-aging-reports/export", {
        params: {
          association_id: String(associationId),
          fiscal_period: report.fiscal_period,
          category: selectedCategory || undefined,
          search: deferredSearch || undefined,
        },
        responseType: "blob",
      });
      const url = URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = `vendor_aging_report_${report.id}.xlsx`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success("Vendor Aging Report exported");
    } catch (requestError: unknown) {
      const detail = requestError as { response?: { data?: unknown }; message?: string };
      toast.error(
        formatApiErrorDetail(
          detail.response?.data ||
            detail.message ||
            "Unable to export the Vendor Aging Report",
        ),
      );
    }
  };

  if (
    permissionLoading ||
    periodsLoading ||
    fullReportLoading ||
    (hasFilters && filteredReportLoading)
  ) {
    return <LoadingSpinner />;
  }
  if (!canView) return <AccessRestricted moduleName="Vendor Aging Report" showAction />;
  if (!associationId || associationId === "ALL") {
    return (
      <EmptyState
        icon={Building2}
        title="Select an association"
        description="Choose an association to view its Vendor Aging Report."
        className="min-h-[420px]"
      />
    );
  }
  if (periodsError || fullReportError || filteredReportError) {
    return (
      <EmptyState
        icon={FileText}
        title="Unable to load the Vendor Aging Report"
        description="The report could not be loaded. Please try again."
        className="min-h-[420px]"
      />
    );
  }

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #vendor-aging-print, #vendor-aging-print * { visibility: visible; }
          #vendor-aging-print { position: absolute; inset: 0; width: 100%; }
          .vendor-aging-no-print { display: none !important; }
          .vendor-aging-extra-row { display: table-row !important; }
        }
      `}</style>
      <div id="vendor-aging-print" className="space-y-5">
        <div className="vendor-aging-no-print flex flex-wrap items-center justify-end gap-2">
          <Select
            options={periods.map((period) => ({ value: period, label: period }))}
            value={selectedPeriod}
            placeholder="Saved periods"
            onChange={(event) => {
              setSelectedPeriod(event.target.value);
              setSelectedCategory("");
              setSearch("");
            }}
            size="sm"
            containerClassName="w-auto"
            className="min-w-48"
          />
          <Select
            options={[
              { value: "", label: "All categories" },
              ...(fullReport?.available_categories || []).map((category) => ({
                value: category,
                label: category,
              })),
            ]}
            value={selectedCategory}
            placeholder="All categories"
            onChange={(event) => setSelectedCategory(event.target.value)}
            size="sm"
            containerClassName="w-auto"
            className="min-w-44"
          />
          <label className="relative">
            <Search className="absolute left-2.5 top-2 h-4 w-4 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search vendor or invoice"
              className="h-8 w-52 rounded-lg border border-slate-200 pl-8 pr-3 text-xs outline-none focus:border-blue-400"
            />
          </label>
          {((report && canExport) || canCreate) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="iconSm"
                  aria-label="Vendor Aging Report actions"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {report && canExport && (
                  <>
                    <DropdownMenuItem onSelect={exportExcel}>
                      <FileSpreadsheet className="h-4 w-4" /> Export Excel
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => window.print()}>
                      <Printer className="h-4 w-4" /> Print report
                    </DropdownMenuItem>
                  </>
                )}
                {canCreate && (
                  <DropdownMenuItem onSelect={openCreate}>
                    <Plus className="h-4 w-4" /> Create manually
                  </DropdownMenuItem>
                )}
                {canCreate && (
                  <DropdownMenuItem onSelect={() => setImportOpen(true)}>
                    <UploadCloud className="h-4 w-4" /> Import Excel
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          {fullReport && canUpdate ? (
            <Button onClick={openUpdate}>
              <Pencil className="h-4 w-4" /> Update Vendor Aging
            </Button>
          ) : null}
        </div>

        {!report ? (
          <div className="flex min-h-[360px] items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-8 text-center">
            <div className="max-w-md">
              <FileText className="mx-auto h-10 w-10 text-slate-400" />
              <h2 className="mt-4 text-lg font-semibold text-slate-900">
                No Vendor Aging Report for this period
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Import a completed Excel template or create the report manually.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="hidden print:block">
              <h1 className="text-2xl font-bold">
                {report.association_name} - Vendor Aging Report
              </h1>
              <p className="text-sm text-slate-500">
                {report.fiscal_period} · {selectedCategory || "All categories"}
                {deferredSearch ? ` · Search: ${deferredSearch}` : ""}
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <MetricCard
                label="Total vendors"
                value={String(report.summary.vendor_count)}
                note={`${report.summary.invoice_count} invoices`}
                icon={<Building2 className="h-5 w-5" />}
              />
              <MetricCard
                label="Total outstanding"
                value={money.format(Number(report.summary.total_outstanding))}
                note="Across the current view"
                icon={<Banknote className="h-5 w-5" />}
              />
              <MetricCard
                label="Overdue amount"
                value={money.format(Number(report.summary.overdue_amount))}
                note={`${report.summary.overdue_percentage}% of outstanding`}
                icon={<AlertTriangle className="h-5 w-5" />}
              />
              <MetricCard
                label="Current due"
                value={money.format(Number(report.summary.current_amount))}
                note={`${report.summary.overdue_invoice_count} overdue invoices`}
                icon={<Timer className="h-5 w-5" />}
              />
            </div>

            <div className="grid gap-5">
              <section className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <div className="border-b border-slate-100 px-5 py-4">
                  <h2 className="font-semibold text-slate-900">Vendor invoice aging</h2>
                  <p className="text-xs text-slate-500">{report.fiscal_period}</p>
                </div>
                <div className="overflow-hidden">
                  <table className="w-full table-fixed text-xs">
                    <thead className="bg-slate-50 text-left uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="w-10 px-3 py-3 text-center">#</th>
                        <th className="px-4 py-3">Vendor</th>
                        <th className="px-3 py-3">Invoice</th>
                        <th className="px-3 py-3">Date</th>
                        <th className="px-3 py-3 text-right">Current</th>
                        <th className="px-3 py-3 text-right">1-30</th>
                        <th className="px-3 py-3 text-right">31-60</th>
                        <th className="px-3 py-3 text-right">61-90</th>
                        <th className="px-3 py-3 text-right">&gt; 90</th>
                        <th className="px-3 py-3 text-right">Outstanding</th>
                        <th className="px-4 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {report.rows.map((row, index) => {
                        const visible = index >= (page - 1) * pageSize && index < page * pageSize;
                        return (
                        <tr
                          key={row.id}
                          className={visible ? undefined : "vendor-aging-extra-row hidden"}
                        >
                          <td className="px-3 py-2 text-center text-slate-400">{index + 1}</td>
                          <td className="truncate px-4 py-2">
                            <p className="font-semibold text-slate-800">{row.vendor_name}</p>
                            <p className="text-[10px] text-slate-400">{row.category}</p>
                          </td>
                          <td className="px-3 py-3 text-slate-600">{row.invoice_number}</td>
                          <td className="px-3 py-3 text-slate-600">
                            {new Date(`${row.invoice_date}T00:00:00`).toLocaleDateString("en-IN")}
                          </td>
                          {[
                            row.current_due,
                            row.days_1_30,
                            row.days_31_60,
                            row.days_61_90,
                            row.days_over_90,
                          ].map((amount, index) => (
                            <td
                              key={index}
                              className="px-3 py-3 text-right font-mono text-slate-600"
                            >
                              {money.format(Number(amount))}
                            </td>
                          ))}
                          <td className="px-3 py-3 text-right font-mono font-bold text-slate-900">
                            {money.format(Number(row.total_outstanding))}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`rounded-full px-2 py-1 text-[10px] font-bold ${
                                row.status === "overdue"
                                  ? "bg-rose-50 text-rose-700"
                                  : row.status === "settled"
                                    ? "bg-emerald-50 text-emerald-700"
                                    : "bg-amber-50 text-amber-700"
                              }`}
                            >
                              {row.status.replace("_", " ")}
                            </span>
                          </td>
                        </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {!report.rows.length && (
                  <div className="p-10 text-center text-sm text-slate-500">
                    No vendor invoices match the selected filters.
                  </div>
                )}
                {report.rows.length > pageSize && (
                  <div className="vendor-aging-no-print flex items-center justify-between border-t border-slate-100 px-4 py-3 text-xs text-slate-500">
                    <span>Page {page} of {totalPages}</span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={page === 1}
                        onClick={() => setPage((value) => Math.max(1, value - 1))}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={page === totalPages}
                        onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </section>

              <aside className="grid gap-5 md:grid-cols-2">
                <section className="rounded-2xl border border-slate-200 bg-white p-4">
                  <h3 className="font-semibold text-slate-900">Outstanding by aging bucket</h3>
                  <div className="h-52">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={agingChart} dataKey="amount" nameKey="name" innerRadius={46} outerRadius={75} paddingAngle={2}>
                          {agingChart.map((item, index) => <Cell key={item.name} fill={colors[index % colors.length]} />)}
                        </Pie>
                        <RechartsTooltip formatter={(value) => money.format(Number(value))} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-1.5">
                    {report.aging_distribution.map((item, index) => (
                      <div key={item.name} className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-2 text-slate-600">
                          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: colors[index % colors.length] }} />
                          {item.name}
                        </span>
                        <span className="font-semibold">{item.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-4">
                  <h3 className="font-semibold text-slate-900">Outstanding by category</h3>
                  {categoryChart.length ? (
                    <div className="mt-3 h-52">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={categoryChart} layout="vertical" margin={{ left: 5, right: 8 }}>
                          <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                          <XAxis type="number" hide />
                          <YAxis type="category" dataKey="name" width={95} tick={{ fontSize: 9 }} />
                          <RechartsTooltip formatter={(value) => money.format(Number(value))} />
                          <Bar dataKey="amount" fill="#3b82f6" radius={[0, 4, 4, 0]} maxBarSize={14} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <p className="py-8 text-center text-sm text-slate-500">No category data.</p>
                  )}
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-4">
                  <h3 className="flex items-center gap-2 font-semibold text-slate-900">
                    <Lightbulb className="h-4 w-4 text-amber-500" /> Key insights
                  </h3>
                  <ul className="mt-3 space-y-2">
                    {report.insights.map((insight) => (
                      <li key={insight} className="rounded-xl bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-600">
                        {insight}
                      </li>
                    ))}
                  </ul>
                </section>
              </aside>
            </div>
          </>
        )}
      </div>

      <VendorAgingEditorModal
        isOpen={editorOpen}
        associationId={String(associationId)}
        report={editorReport}
        onClose={() => {
          setEditorOpen(false);
          setEditorReport(null);
        }}
        onSaved={(period) => {
          setSelectedPeriod(period);
          setSelectedCategory("");
          setSearch("");
          setPage(1);
        }}
      />
      <VendorAgingReportImportModal
        isOpen={importOpen}
        associationId={String(associationId)}
        initialPeriod={selectedPeriod}
        onClose={() => setImportOpen(false)}
        onImported={(period) => {
          setSelectedPeriod(period);
          setSelectedCategory("");
          setSearch("");
          setPage(1);
        }}
      />
    </>
  );
};

export default VendorAgingReportPage;
