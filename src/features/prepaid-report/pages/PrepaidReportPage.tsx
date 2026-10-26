import React, { useEffect, useMemo, useState } from "react";
import {
  Activity,
  Banknote,
  FileSpreadsheet,
  FileText,
  Lightbulb,
  MoreHorizontal,
  Pencil,
  PieChart as PieChartIcon,
  Plus,
  Printer,
  UploadCloud,
  Users,
  WalletCards,
} from "lucide-react";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
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
  useGetPrepaidReportPeriodsQuery,
  useGetPrepaidReportQuery,
} from "../api";
import {
  PrepaidReportEditorModal,
  PrepaidReportImportModal,
} from "../components";
import type { PrepaidReport } from "../types";

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

const chartColors = ["#10b981", "#3b82f6", "#f59e0b", "#8b5cf6", "#ec4899", "#64748b"];

const MetricCard: React.FC<{
  label: string;
  value: string;
  note: string;
  icon: React.ReactNode;
}> = ({ label, value, note, icon }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
    <div className="flex items-center gap-3">
      <span className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600">{icon}</span>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">{label}</p>
        <p className="truncate text-xl font-bold text-slate-900">{value}</p>
        <p className="text-[10px] text-slate-500">{note}</p>
      </div>
    </div>
  </div>
);

export const PrepaidReportPage: React.FC = () => {
  const { account } = useAuth();
  const isFinancialViewOnly = isFinancialViewOnlyRole(account?.role_code);
  const associationId = useAppSelector((state) => state.ui.activeAssociationId);
  const { canView, canCreate: canCreatePermission, canUpdate: canUpdatePermission, isLoading: permissionLoading } =
    usePermission(FEATURES.PREPAID_REPORT.FEATURE_CODE);
  const canCreate = canCreatePermission && !isFinancialViewOnly;
  const canUpdate = canUpdatePermission && !isFinancialViewOnly;
  const canExport = !isFinancialViewOnly;
  const [selectedPeriod, setSelectedPeriod] = useState("");
  const [selectedBlock, setSelectedBlock] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [editorReport, setEditorReport] = useState<PrepaidReport | null>(null);

  const skip = !canView || !associationId || associationId === "ALL";
  const {
    data: periods = [],
    isLoading: periodsLoading,
    isError: periodsError,
  } = useGetPrepaidReportPeriodsQuery(String(associationId || ""), { skip });
  const {
    data: fullReport,
    isLoading: fullReportLoading,
    isError: fullReportError,
  } = useGetPrepaidReportQuery(
    {
      associationId: String(associationId || ""),
      fiscalPeriod: selectedPeriod || undefined,
    },
    { skip },
  );
  const {
    data: filteredReport,
    isLoading: filteredReportLoading,
    isError: filteredReportError,
  } = useGetPrepaidReportQuery(
    {
      associationId: String(associationId || ""),
      fiscalPeriod: selectedPeriod || undefined,
      block: selectedBlock,
    },
    { skip: skip || !selectedBlock },
  );
  const report = selectedBlock ? filteredReport : fullReport;

  usePageHeader({
    title: "Prepaid Report",
    description: "Review member prepaid balances, utilization, expiries, and categories.",
  });

  useEffect(() => {
    setSelectedPeriod("");
    setSelectedBlock("");
  }, [associationId]);

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

  const categoryChart = useMemo(
    () => report?.category_distribution.map((item) => ({
      name: item.name,
      value: Number(item.amount),
      percentage: Number(item.percentage),
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
      const response = await apiClient.get("/prepaid-reports/export", {
        params: {
          association_id: String(associationId),
          fiscal_period: report.fiscal_period,
          block: selectedBlock || undefined,
        },
        responseType: "blob",
      });
      const url = URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = `prepaid_report_${report.id}.xlsx`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success("Prepaid Report exported");
    } catch (requestError: unknown) {
      const detail = requestError as { response?: { data?: unknown }; message?: string };
      toast.error(
        formatApiErrorDetail(
          detail.response?.data || detail.message || "Unable to export the Prepaid Report",
        ),
      );
    }
  };

  if (
    permissionLoading ||
    periodsLoading ||
    fullReportLoading ||
    (selectedBlock && filteredReportLoading)
  ) {
    return <LoadingSpinner />;
  }
  if (!canView) return <AccessRestricted moduleName="Prepaid Report" showAction />;
  if (!associationId || associationId === "ALL") {
    return (
      <EmptyState
        icon={WalletCards}
        title="Select an association"
        description="Choose an association to view its Prepaid Report."
        className="min-h-[420px]"
      />
    );
  }
  if (periodsError || fullReportError || filteredReportError) {
    return (
      <EmptyState
        icon={FileText}
        title="Unable to load the Prepaid Report"
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
          #prepaid-report-print, #prepaid-report-print * { visibility: visible; }
          #prepaid-report-print { position: absolute; inset: 0; width: 100%; }
          .prepaid-report-no-print { display: none !important; }
        }
      `}</style>
      <div id="prepaid-report-print" className="space-y-5">
        <div className="prepaid-report-no-print flex flex-col justify-end gap-3 bg-white lg:flex-row lg:items-center">
          <Select
            icon={<FileText size={15} />}
            options={periods.map((period) => ({ value: period, label: period }))}
            value={selectedPeriod}
            placeholder="Saved periods"
            onChange={(event) => {
              setSelectedPeriod(event.target.value);
              setSelectedBlock("");
            }}
            size="sm"
            containerClassName="w-auto"
            className="min-w-48"
          />
          <Select
            options={[
              { value: "", label: "All blocks" },
              ...(fullReport?.available_blocks || []).map((block) => ({ value: block, label: block })),
            ]}
            value={selectedBlock}
            placeholder="All blocks"
            onChange={(event) => setSelectedBlock(event.target.value)}
            size="sm"
            containerClassName="w-auto"
            className="min-w-36"
          />
          {((report && canExport) || canCreate) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="iconSm"
                  aria-label="Prepaid Report actions"
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
          {report && canUpdate ? (
            <Button onClick={openUpdate}>
              <Pencil className="h-4 w-4" /> Update Prepaid Report
            </Button>
          ) : null}
        </div>

        {!report ? (
          <div className="flex min-h-[360px] items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-8 text-center">
            <div className="max-w-md">
              <FileText className="mx-auto h-10 w-10 text-slate-400" />
              <h2 className="mt-4 text-lg font-semibold text-slate-900">
                No Prepaid Report for this period
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Import a completed Excel template or create the report manually.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="hidden print:block">
              <h1 className="text-2xl font-bold">{report.association_name} - Prepaid Report</h1>
              <p className="text-sm text-slate-500">
                {report.fiscal_period} · {selectedBlock || "All blocks"}
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <MetricCard
                label="Total prepaid"
                value={money.format(Number(report.summary.total_prepaid_amount))}
                note={`${report.summary.member_count} member rows`}
                icon={<Banknote className="h-5 w-5" />}
              />
              <MetricCard
                label="Available balance"
                value={money.format(Number(report.summary.total_available_balance))}
                note={`${money.format(Number(report.summary.total_used_amount))} used`}
                icon={<WalletCards className="h-5 w-5" />}
              />
              <MetricCard
                label="Average prepaid"
                value={money.format(Number(report.summary.average_prepaid_amount))}
                note="Per member row"
                icon={<Users className="h-5 w-5" />}
              />
              <MetricCard
                label="Utilization"
                value={`${Number(report.summary.utilization_pct).toFixed(2)}%`}
                note={`${report.summary.active_count} active · ${report.summary.expired_count} expired`}
                icon={<Activity className="h-5 w-5" />}
              />
            </div>

            <div className="grid gap-5">
              <section className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                  <div>
                    <h2 className="font-semibold text-slate-900">Prepaid details</h2>
                    <p className="text-xs text-slate-500">{report.fiscal_period}</p>
                  </div>
                  {selectedBlock && (
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                      {selectedBlock}
                    </span>
                  )}
                </div>
                <div className="overflow-hidden">
                  <table className="w-full table-fixed text-xs">
                    <thead className="bg-slate-50 text-left text-[10px] uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="w-10 px-3 py-3 text-center">#</th>
                        <th className="px-4 py-3">Member</th>
                        <th className="px-3 py-3">Unit</th>
                        <th className="px-3 py-3">Block</th>
                        <th className="px-3 py-3">Category</th>
                        <th className="px-3 py-3 text-right">Prepaid</th>
                        <th className="px-3 py-3 text-right">Used</th>
                        <th className="px-3 py-3 text-right">Available</th>
                        <th className="px-3 py-3">Expiry</th>
                        <th className="px-4 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {report.rows.map((row, index) => (
                        <tr key={row.id}>
                          <td className="px-3 py-2 text-center text-slate-400">{index + 1}</td>
                          <td className="truncate px-4 py-2 font-medium text-slate-800">{row.member_name}</td>
                          <td className="px-3 py-3 text-slate-600">{row.unit_number}</td>
                          <td className="px-3 py-3 text-slate-600">{row.block || "—"}</td>
                          <td className="px-3 py-3 text-slate-600">{row.category}</td>
                          <td className="px-3 py-3 text-right font-mono">{money.format(Number(row.prepaid_amount))}</td>
                          <td className="px-3 py-3 text-right font-mono text-slate-600">{money.format(Number(row.used_amount))}</td>
                          <td className="px-3 py-3 text-right font-mono font-semibold text-emerald-700">
                            {money.format(Number(row.available_balance))}
                          </td>
                          <td className="px-3 py-3 text-slate-600">
                            {new Date(`${row.expiry_date}T00:00:00`).toLocaleDateString("en-IN")}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`rounded-full px-2 py-1 text-xs font-semibold ${
                                row.status === "active"
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-rose-50 text-rose-700"
                              }`}
                            >
                              {row.status === "active" ? "Active" : "Expired"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-slate-50 font-semibold text-slate-800">
                      <tr>
                        <td className="px-4 py-3" colSpan={5}>Totals</td>
                        <td className="px-3 py-3 text-right font-mono">
                          {money.format(Number(report.summary.total_prepaid_amount))}
                        </td>
                        <td className="px-3 py-3 text-right font-mono">
                          {money.format(Number(report.summary.total_used_amount))}
                        </td>
                        <td className="px-3 py-3 text-right font-mono text-emerald-700">
                          {money.format(Number(report.summary.total_available_balance))}
                        </td>
                        <td colSpan={2} />
                      </tr>
                    </tfoot>
                  </table>
                </div>
                {!report.rows.length && (
                  <div className="p-8 text-center text-sm text-slate-500">
                    No prepaid rows match the selected block.
                  </div>
                )}
              </section>

              <aside className="grid gap-5 md:grid-cols-2">
                <section className="rounded-2xl border border-slate-200 bg-white p-4">
                  <h3 className="flex items-center gap-2 font-semibold text-slate-900">
                    <PieChartIcon className="h-4 w-4 text-emerald-600" />
                    Available balance by category
                  </h3>
                  {categoryChart.length ? (
                    <div className="h-56">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={categoryChart} dataKey="value" nameKey="name" innerRadius={48} outerRadius={78} paddingAngle={2}>
                            {categoryChart.map((item, index) => <Cell key={item.name} fill={chartColors[index % chartColors.length]} />)}
                          </Pie>
                          <RechartsTooltip formatter={(value) => money.format(Number(value))} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  ) : <p className="py-8 text-center text-sm text-slate-500">No category balance to chart.</p>}
                  <div className="space-y-2">
                    {report.category_distribution.map((item, index) => (
                      <div key={item.name} className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-2 text-slate-600">
                          <span
                            className="h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: chartColors[index % chartColors.length] }}
                          />
                          {item.name}
                        </span>
                        <span className="font-semibold text-slate-800">
                          {item.percentage}%
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
                <section className="rounded-2xl border border-slate-200 bg-white p-4">
                  <h3 className="flex items-center gap-2 font-semibold text-slate-900">
                    <Lightbulb className="h-4 w-4 text-amber-500" /> Data insights
                  </h3>
                  <ul className="mt-3 space-y-2">
                    {report.insights.map((insight) => (
                      <li
                        key={insight}
                        className="rounded-xl bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-600"
                      >
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

      <PrepaidReportEditorModal
        isOpen={editorOpen}
        associationId={String(associationId)}
        report={editorReport}
        onClose={() => {
          setEditorOpen(false);
          setEditorReport(null);
        }}
        onSaved={(period) => {
          setSelectedPeriod(period);
          setSelectedBlock("");
        }}
      />
      <PrepaidReportImportModal
        isOpen={importOpen}
        associationId={String(associationId)}
        initialPeriod={selectedPeriod}
        onClose={() => setImportOpen(false)}
        onImported={(period) => {
          setSelectedPeriod(period);
          setSelectedBlock("");
        }}
      />
    </>
  );
};

export default PrepaidReportPage;
