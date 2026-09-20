import React, { useMemo } from "react";
import {
  FileText,
  Building,
  Calendar,
  ExternalLink,
  Receipt,
} from "lucide-react";
import { DataTable, Column } from "@/components/common/DataTable";
import { StatusPill } from "@/components/common/StatusPill";
import type { FinancialReport } from "../types";

export interface FinancialReportsTableProps {
  reports: FinancialReport[];
  isLoading?: boolean;
}

export const FinancialReportsTable: React.FC<FinancialReportsTableProps> = ({
  reports,
  isLoading = false,
}) => {
  const getReportTypeVariant = (type: string) => {
    const t = (type || "").toLowerCase();
    if (t.includes("balance")) return "indigo";
    if (t.includes("income") || t.includes("profit")) return "success";
    if (t.includes("trial")) return "warning";
    if (t.includes("cash")) return "info";
    if (t.includes("audit")) return "purple";
    return "neutral";
  };

  const formatReportingPeriod = (period?: string) => {
    if (!period) return "—";
    if (/^\d{4}-\d{2}$/.test(period)) {
      const [year, month] = period.split("-");
      const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1);
      return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
    }
    return period;
  };

  const columns = useMemo<Column<FinancialReport>[]>(
    () => [
      {
        key: "sr_no",
        header: "Sr. No.",
        width: "64px",
        sortable: false,
        className: "text-center",
        headerClassName: "justify-center text-center",
        render: (_row, idx) => (
          <span className="text-slate-400 font-medium text-xs">{idx + 1}</span>
        ),
      },
      {
        key: "title",
        header: "Statement Title",
        minWidth: "200px",
        sortable: true,
        render: (report) => (
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
              <FileText className="w-4 h-4" />
            </div>
            <span className="font-semibold text-slate-900 truncate">
              {report.title}
            </span>
          </div>
        ),
      },
      {
        key: "report_type",
        header: "Report Type",
        width: "150px",
        minWidth: "140px",
        sortable: true,
        render: (report) => (
          <StatusPill
            status={report.report_type}
            variant={getReportTypeVariant(report.report_type) as any}
            icon={<Receipt className="w-3.5 h-3.5" />}
            size="sm"
          />
        ),
      },
      {
        key: "association_name",
        header: "Association",
        minWidth: "160px",
        sortable: true,
        render: (report) =>
          report.association_name ? (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 truncate">
              <Building className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <span className="truncate">{report.association_name}</span>
            </div>
          ) : (
            <span className="text-xs text-slate-400 italic">All Associations</span>
          ),
      },
      {
        key: "published_month",
        header: "Reporting Period",
        width: "140px",
        minWidth: "130px",
        sortable: true,
        render: (report) => (
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-700">
            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="whitespace-nowrap">{formatReportingPeriod(report.published_month)}</span>
          </div>
        ),
      },
      {
        key: "created_at",
        header: "Published Date",
        width: "130px",
        minWidth: "120px",
        sortable: true,
        render: (report) => (
          <span className="text-xs text-slate-500 whitespace-nowrap">
            {report.created_at
              ? new Date(report.created_at).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
              : "—"}
          </span>
        ),
      },
      {
        key: "actions",
        header: "Document",
        width: "160px",
        minWidth: "150px",
        sortable: false,
        className: "text-right",
        headerClassName: "justify-end text-right",
        render: (report) =>
          report.file_url ? (
            <a
              href={report.file_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors border border-indigo-200/60 shadow-2xs whitespace-nowrap shrink-0"
            >
              <ExternalLink className="w-3.5 h-3.5 shrink-0" />
              <span className="whitespace-nowrap">View Statement</span>
            </a>
          ) : (
            <span className="text-xs text-slate-400 italic whitespace-nowrap">No document</span>
          ),
      },
    ],
    []
  );

  return (
    <DataTable
      data={reports}
      columns={columns}
      isLoading={isLoading}
      enableGlobalFilter={false}
      pagination={{
        pageSize: 15,
        pageSizeOptions: [15, 25, 50, 100],
      }}
      emptyTitle="No financial statements"
      emptyMessage="No published financial statements found matching the criteria."
    />
  );
};


