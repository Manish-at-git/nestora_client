import React, { useMemo } from "react";
import { Tag } from "lucide-react";
import { DataTable, Column } from "@/components/common/DataTable";
import { StatusPill } from "@/components/common/StatusPill";
import type { ChartOfAccount } from "../types";

export interface COATableProps {
  accounts: ChartOfAccount[];
  isLoading?: boolean;
}

export const COATable: React.FC<COATableProps> = ({
  accounts,
  isLoading = false,
}) => {
  const getStructureVariant = (structure?: string | null) => {
    const s = (structure || "").toLowerCase();
    if (s.includes("asset")) return "info";
    if (s.includes("liab")) return "danger";
    if (s.includes("equity")) return "purple";
    if (s.includes("income") || s.includes("revenue")) return "success";
    if (s.includes("expense")) return "warning";
    return "neutral";
  };

  const columns = useMemo<Column<ChartOfAccount>[]>(
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
        key: "gl_code",
        header: "GL Code",
        width: "140px",
        sortable: true,
        render: (item) => (
          <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-slate-100 text-slate-800 border border-slate-200/80 tracking-wide">
            {item.gl_code}
          </span>
        ),
      },
      {
        key: "gl_name",
        header: "Account Ledger Name",
        sortable: true,
        render: (item) => (
          <span className="font-semibold text-slate-900">{item.gl_name}</span>
        ),
      },
      {
        key: "structure",
        header: "Structure",
        sortable: true,
        render: (item) => (
          <StatusPill
            status={item.structure || "General"}
            variant={getStructureVariant(item.structure) as any}
            icon={<Tag className="w-3.5 h-3.5" />}
            size="sm"
          />
        ),
      },
      {
        key: "grouping",
        header: "Grouping / Category",
        sortable: true,
        render: (item) => (
          <span className="text-slate-600 font-medium text-xs">
            {item.grouping || "—"}
          </span>
        ),
      },
    ],
    []
  );

  return (
    <DataTable
      data={accounts}
      columns={columns}
      isLoading={isLoading}
      enableGlobalFilter={false}
      pagination={{
        pageSize: 25,
        pageSizeOptions: [25, 50, 100],
      }}
      emptyTitle="No chart of accounts"
      emptyMessage="No general ledger codes found matching the criteria."
    />
  );
};

