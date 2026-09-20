import React, { useMemo } from "react";
import {
  ExternalLink,
  Layers,
  Eye,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable, Column, StatusPill } from "@/components/common";
import { usePermission } from "@/hooks/usePermission";
import type { Association } from "../types";

export interface AssociationTableProps {
  associations: Association[];
  isLoading?: boolean;
  onAdd?: () => void;
  onView: (association: Association) => void;
}

export const AssociationTable: React.FC<AssociationTableProps> = ({
  associations,
  isLoading = false,
  onAdd,
  onView,
}) => {
  const { canCreate } = usePermission();
  const columns = useMemo<Column<Association>[]>(
    () => [
      {
        key: "sr_no",
        header: "Sr. No.",
        sortable: false,
        width: "60px",
        className: "text-center",
        render: (_row, index) => (
          <span className="font-medium text-slate-500 text-xs">
            {index + 1}
          </span>
        ),
      },
      {
        key: "name",
        header: "Association Name",
        sortable: true,
        filterable: true,
        width: "250px",
        render: (row) => {
          const initial = row.name ? row.name.charAt(0).toUpperCase() : "A";

          return (
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0 border border-indigo-100/80">
                {initial}
              </div>
              <span className="font-semibold text-slate-900 text-xs truncate">
                {row.name}
              </span>
            </div>
          );
        },
      },
      {
        key: "association_code",
        header: "Assoc. Code",
        sortable: true,
        filterable: true,
        width: "130px",
        render: (row) =>
          row.association_code ? (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-mono font-semibold bg-slate-100 text-slate-700 border border-slate-200/80">
              {row.association_code}
            </span>
          ) : (
            <span className="text-xs text-slate-400">—</span>
          ),
      },
      {
        key: "url",
        header: "Portal Link",
        sortable: false,
        minWidth: "220px",
        render: (row) => {
          const assocUrl = row.url || row.association_url;
          if (!assocUrl) {
            return <span className="text-xs text-slate-400">—</span>;
          }
          const href = assocUrl.startsWith("http") ? assocUrl : `https://${assocUrl}`;
          const cleanDisplay = assocUrl.replace(/^https?:\/\//, "");

          return (
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800 hover:underline"
            >
              <span className="truncate max-w-[240px]">{cleanDisplay}</span>
              <ExternalLink size={12} className="shrink-0" />
            </a>
          );
        },
      },
      {
        key: "unit_count",
        header: "Units",
        sortable: true,
        width: "90px",
        className: "text-center",
        render: (row) => (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
            <Layers size={12} />
            {row.unit_count ?? 0}
          </span>
        ),
      },
      {
        key: "plan_name",
        header: "Subscription Plan",
        sortable: true,
        filterable: true,
        width: "150px",
        render: (row) =>
          row.plan_name ? (
            <StatusPill
              variant="neutral"
              shape="rounded"
              size="xs"
              className="font-medium text-indigo-700 bg-indigo-50/70 border-indigo-200/60"
            >
              {row.plan_name}
            </StatusPill>
          ) : (
            <span className="text-xs text-slate-400 italic">No Plan</span>
          ),
      },
      {
        key: "is_active",
        header: "Status",
        sortable: true,
        filterable: true,
        width: "110px",
        render: (row) => {
          const isActive =
            row.is_active === true ||
            row.is_active === 1 ||
            (row.subscription_status || "").toLowerCase() === "active";

          const statusText = row.subscription_status
            ? row.subscription_status.charAt(0).toUpperCase() +
              row.subscription_status.slice(1).toLowerCase()
            : isActive
            ? "Active"
            : "Inactive";

          const isStatusActive = statusText.toLowerCase() === "active";

          return (
            <StatusPill
              variant={isStatusActive ? "success" : "neutral"}
              dot={true}
              size="xs"
            >
              {statusText}
            </StatusPill>
          );
        },
      },
      {
        key: "actions",
        header: "Actions",
        sortable: false,
        width: "80px",
        className: "text-center",
        render: (row) => (
          <div className="flex items-center justify-center">
            <Button
              variant="ghost"
              onClick={() => onView(row)}
              className="h-7 px-2.5 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 rounded-lg text-xs font-medium cursor-pointer inline-flex items-center gap-1"
              title="View Association Details"
            >
              <Eye size={13} />
              <span>View</span>
            </Button>
          </div>
        ),
      },
    ],
    [onView]
  );

  return (
    <DataTable
      data={associations}
      columns={columns}
      density="compact"
      searchPlaceholder="Search associations by name, code, location..."
      searchKeys={[
        "name",
        "association_code",
        "city",
        "country",
        "plan_name",
        "entity_name",
      ]}
      enableGlobalFilter={true}
      enableColumnFilters={true}
      enableSorting={true}
      pagination={{
        isServer: false,
        pageSize: 15,
        pageSizeOptions: [10, 15, 25, 50],
      }}
      isLoading={isLoading}
      emptyTitle="No associations found"
      emptyMessage="No associations matched your criteria. Onboard an association to get started."
      emptyActionLabel={canCreate && onAdd ? "+ Onboard Association" : undefined}
      onEmptyAction={canCreate ? onAdd : undefined}
      headerActions={
        canCreate && onAdd && (
          <Button
            onClick={onAdd}
          >
            <Plus size={14} className="mr-1.5" />
            <span>Onboard Association</span>
          </Button>
        )
      }
    />
  );
};

export default AssociationTable;
