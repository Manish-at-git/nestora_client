import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Banknote,
  Building2,
  CalendarClock,
  FileSpreadsheet,
  FileText,
  Lightbulb,
  MoreHorizontal,
  Pencil,
  Plus,
  Printer,
  Search,
  UploadCloud,
  Users,
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
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { FEATURES } from "@/constants/featureCodes";
import { isFinancialViewOnlyRole } from "@/constants/roleCodes";
import { usePageHeader } from "@/hooks/usePageHeader";
import { usePermission } from "@/hooks/usePermission";
import apiClient, { formatApiErrorDetail } from "@/services/api/apiClient";
import {
  useGetDelinquencyPeriodsQuery,
  useGetDelinquencyReportQuery,
} from "../api";
import {
  DelinquencyReportEditorModal,
  DelinquencyReportImportModal,
} from "../components";
import type { DelinquencyReport } from "../types";

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});
const colors = ["#dc2626", "#f59e0b", "#3b82f6", "#8b5cf6", "#10b981"];

const MetricCard: React.FC<{
  label: string;
  value: string;
  note: string;
  icon: React.ReactNode;
}> = ({ label, value, note, icon }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
    <div className="flex items-center gap-3">
      <span className="rounded-xl bg-rose-50 p-2.5 text-rose-600">{icon}</span>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
          {label}
        </p>
        <p className="truncate text-xl font-bold text-slate-900">{value}</p>
        <p className="text-[10px] text-slate-500">{note}</p>
      </div>
    </div>
  </div>
);

export const DelinquencyReportPage: React.FC = () => {
  const { account } = useAuth();
  const isFinancialViewOnly = isFinancialViewOnlyRole(account?.role_code);
  const associationId = useAppSelector((state) => state.ui.activeAssociationId);
  const { canView, canCreate: canCreatePermission, canUpdate: canUpdatePermission, isLoading: permissionLoading } =
    usePermission(FEATURES.DELINQUENCY_REPORT.FEATURE_CODE);
  const canCreate = canCreatePermission && !isFinancialViewOnly;
  const canUpdate = canUpdatePermission && !isFinancialViewOnly;
  const canExport = !isFinancialViewOnly;
  const [selectedPeriod, setSelectedPeriod] = useState("");
  const [selectedBlock, setSelectedBlock] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [editorReport, setEditorReport] = useState<DelinquencyReport | null>(null);
  const skip = !canView || !associationId || associationId === "ALL";

  const {
    data: periods = [],
    isLoading: periodsLoading,
    isError: periodsError,
  } = useGetDelinquencyPeriodsQuery(String(associationId || ""), { skip });
  const {
    data: fullReport,
    isLoading: fullLoading,
    isError: fullError,
  } = useGetDelinquencyReportQuery(
    {
      associationId: String(associationId || ""),
      fiscalPeriod: selectedPeriod || undefined,
    },
    { skip },
  );
  const hasFilters = Boolean(selectedBlock || debouncedSearch);
  const {
    data: filteredReport,
    isLoading: filteredLoading,
    isError: filteredError,
  } = useGetDelinquencyReportQuery(
    {
      associationId: String(associationId || ""),
      fiscalPeriod: selectedPeriod || undefined,
      block: selectedBlock || undefined,
      search: debouncedSearch || undefined,
    },
    { skip: skip || !hasFilters },
  );
  const report = hasFilters ? filteredReport : fullReport;

  usePageHeader({
    title: "Delinquency Report",
    description: "Track overdue member balances, collection performance, and risk aging.",
  });

  useEffect(() => {
    setSelectedPeriod("");
    setSelectedBlock("");
    setSearch("");
    setDebouncedSearch("");
  }, [associationId]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 400);

    return () => window.clearTimeout(timeoutId);
  }, [search]);

  useEffect(() => {
    if (!selectedPeriod && periods.length) setSelectedPeriod(periods[0]);
  }, [periods, selectedPeriod]);

  useEffect(() => {
    if (
      selectedBlock &&
      fullReport &&
      !fullReport.available_blocks.includes(selectedBlock)
    ) {
      setSelectedBlock("");
    }
  }, [fullReport, selectedBlock]);

  const agingChart = useMemo(
    () =>
      report?.aging_distribution.map((item) => ({
        name: item.name,
        amount: Number(item.amount),
      })) || [],
    [report],
  );
  const chargeChart = useMemo(
    () =>
      report?.charge_distribution.map((item) => ({
        name: item.name,
        amount: Number(item.amount),
      })) || [],
    [report],
  );

  const exportExcel = async () => {
    if (!report) return;
    try {
      const response = await apiClient.get("/delinquency-reports/export", {
        params: {
          association_id: String(associationId),
          fiscal_period: report.fiscal_period,
          block: selectedBlock || undefined,
          search: debouncedSearch || undefined,
        },
        responseType: "blob",
      });
      const url = URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = `delinquency_report_${report.id}.xlsx`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success("Delinquency Report exported");
    } catch (requestError: unknown) {
      const detail = requestError as {
        response?: { data?: unknown };
        message?: string;
      };
      toast.error(
        formatApiErrorDetail(
          detail.response?.data ||
            detail.message ||
            "Unable to export the Delinquency Report",
        ),
      );
    }
  };

  if (
    permissionLoading ||
    periodsLoading ||
    fullLoading ||
    (hasFilters && filteredLoading)
  ) {
    return <LoadingSpinner />;
  }
  if (!canView) return <AccessRestricted moduleName="Delinquency Report" showAction />;
  if (!associationId || associationId === "ALL") {
    return (
      <EmptyState
        icon={Building2}
        title="Select an association"
        description="Choose an association to view its Delinquency Report."
        className="min-h-[420px]"
      />
    );
  }
  if (periodsError || fullError || filteredError) {
    return (
      <EmptyState
        icon={FileText}
        title="Unable to load the Delinquency Report"
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
          #delinquency-print, #delinquency-print * { visibility: visible; }
          #delinquency-print { position: absolute; inset: 0; width: 100%; }
          .delinquency-no-print { display: none !important; }
        }
      `}</style>
      <div id="delinquency-print" className="space-y-5">
        <div className="delinquency-no-print flex flex-wrap items-center justify-end gap-2">
          <Select
            options={periods.map((period) => ({ value: period, label: period }))}
            value={selectedPeriod}
            placeholder="Saved periods"
            onChange={(event) => {
              setSelectedPeriod(event.target.value);
              setSelectedBlock("");
              setSearch("");
              setDebouncedSearch("");
            }}
            containerClassName="w-auto"
            className="min-w-48"
          />
          <Select
            options={[
              { value: "", label: "All blocks" },
              ...(fullReport?.available_blocks || []).map((block) => ({
                value: block,
                label: block,
              })),
            ]}
            value={selectedBlock}
            placeholder="All blocks"
            onChange={(event) => setSelectedBlock(event.target.value)}
            containerClassName="w-auto"
            className="min-w-36"
          />
          <Input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onClear={() => {
              setSearch("");
              setDebouncedSearch("");
            }}
            placeholder="Search member or unit"
            leftIcon={<Search className="h-4 w-4" />}
            isClearable
            containerClassName="w-56"
          />
          {((report && canExport) || canCreate) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="iconSm"
                  aria-label="Delinquency Report actions"
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
                  <DropdownMenuItem
                    onSelect={() => {
                      setEditorReport(null);
                      setEditorOpen(true);
                    }}
                  >
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
            <Button
              onClick={() => {
                setEditorReport(fullReport);
                setEditorOpen(true);
              }}
            >
              <Pencil className="h-4 w-4" /> Update Report
            </Button>
          ) : null}
        </div>

        {!report ? (
          <div className="flex min-h-[360px] items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-8 text-center">
            <div className="max-w-md">
              <FileText className="mx-auto h-10 w-10 text-slate-400" />
              <h2 className="mt-4 text-lg font-semibold text-slate-900">
                No Delinquency Report for this period
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
                {report.association_name} - Delinquency Report
              </h1>
              <p className="text-sm text-slate-500">
                {report.fiscal_period} · {selectedBlock || "All blocks"}
                {debouncedSearch ? ` · Search: ${debouncedSearch}` : ""}
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <MetricCard
                label="Total outstanding"
                value={money.format(Number(report.summary.total_outstanding))}
                note={`${report.summary.row_count} delinquency rows`}
                icon={<Banknote className="h-5 w-5" />}
              />
              <MetricCard
                label="Delinquent members"
                value={String(report.summary.delinquent_member_count)}
                note={`${report.summary.high_risk_count} high-risk rows`}
                icon={<Users className="h-5 w-5" />}
              />
              <MetricCard
                label="Average days overdue"
                value={String(report.summary.average_days_overdue)}
                note="Across the current view"
                icon={<CalendarClock className="h-5 w-5" />}
              />
              <MetricCard
                label="Collection rate"
                value={`${report.summary.collection_rate_percentage}%`}
                note={`${money.format(Number(report.summary.total_collected_amount))} collected`}
                icon={<AlertTriangle className="h-5 w-5" />}
              />
            </div>

            <div className="grid gap-5">
              <section className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <div className="border-b border-slate-100 px-5 py-4">
                  <h2 className="font-semibold text-slate-900">Delinquent member balances</h2>
                  <p className="text-xs text-slate-500">{report.fiscal_period}</p>
                </div>
                <div className="overflow-hidden">
                  <table className="w-full table-fixed text-xs">
                    <thead className="bg-slate-50 text-left uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="w-10 px-3 py-3 text-center">#</th>
                        <th className="px-4 py-3">Member</th>
                        <th className="px-3 py-3">Unit / Block</th>
                        <th className="px-3 py-3">Charge category</th>
                        <th className="px-3 py-3 text-right">Outstanding</th>
                        <th className="px-3 py-3 text-center">Days overdue</th>
                        <th className="px-3 py-3">Last payment</th>
                        <th className="px-4 py-3">Risk</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {report.rows.map((row, index) => (
                        <tr key={row.id}>
                          <td className="px-3 py-2 text-center text-slate-400">{index + 1}</td>
                          <td className="truncate px-4 py-2 font-semibold text-slate-800">{row.member_name}</td>
                          <td className="truncate px-3 py-2 text-slate-600">{row.unit_number}{row.block ? ` · ${row.block}` : ""}</td>
                          <td className="truncate px-3 py-2 text-slate-600">{row.charge_category}</td>
                          <td className="px-3 py-3 text-right font-mono font-bold text-slate-900">{money.format(Number(row.outstanding_amount))}</td>
                          <td className="px-3 py-3 text-center text-slate-600">{row.days_overdue}</td>
                          <td className="px-3 py-3 text-slate-600">{row.last_payment_date ? new Date(`${row.last_payment_date}T00:00:00`).toLocaleDateString("en-IN") : "—"}</td>
                          <td className="px-4 py-3">
                            <span className={`rounded-full px-2 py-1 text-[10px] font-bold ${row.status === "high" ? "bg-rose-50 text-rose-700" : row.status === "medium" ? "bg-amber-50 text-amber-700" : row.status === "resolved" ? "bg-emerald-50 text-emerald-700" : "bg-blue-50 text-blue-700"}`}>{row.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {!report.rows.length && (
                  <div className="p-10 text-center text-sm text-slate-500">No rows match the selected filters.</div>
                )}
              </section>

              <aside className="grid gap-5 md:grid-cols-2">
                <section className="order-2 rounded-2xl border border-slate-200 bg-white p-4">
                  <h3 className="font-semibold text-slate-900">Outstanding by age</h3>
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
                        <span className="flex items-center gap-2 text-slate-600"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: colors[index % colors.length] }} />{item.name}</span>
                        <span className="font-semibold">{item.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="order-1 rounded-2xl border border-slate-200 bg-white p-4">
                  <h3 className="font-semibold text-slate-900">Outstanding by charge</h3>
                  {chargeChart.length ? (
                    <div className="mt-3 h-52">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chargeChart} layout="vertical" margin={{ left: 5, right: 8 }}>
                          <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                          <XAxis type="number" hide />
                          <YAxis type="category" dataKey="name" width={95} tick={{ fontSize: 9 }} />
                          <RechartsTooltip formatter={(value) => money.format(Number(value))} />
                          <Bar dataKey="amount" fill="#dc2626" radius={[0, 4, 4, 0]} maxBarSize={14} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <p className="py-8 text-center text-sm text-slate-500">No charge data.</p>
                  )}
                </section>

                <section className="order-3 rounded-2xl border border-slate-200 bg-white p-4">
                  <h3 className="flex items-center gap-2 font-semibold text-slate-900"><Lightbulb className="h-4 w-4 text-amber-500" /> Key insights</h3>
                  <ul className="mt-3 space-y-2">
                    {report.insights.map((insight) => (
                      <li key={insight} className="rounded-xl bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-600">{insight}</li>
                    ))}
                  </ul>
                </section>
              </aside>
            </div>
          </>
        )}
      </div>

      <DelinquencyReportEditorModal
        isOpen={editorOpen}
        associationId={String(associationId)}
        associationName={fullReport?.association_name}
        report={editorReport}
        onClose={() => setEditorOpen(false)}
        onSaved={(period) => setSelectedPeriod(period)}
      />
      <DelinquencyReportImportModal
        isOpen={importOpen}
        associationId={String(associationId)}
        initialPeriod={selectedPeriod}
        onClose={() => setImportOpen(false)}
        onImported={(period) => setSelectedPeriod(period)}
      />
    </>
  );
};
