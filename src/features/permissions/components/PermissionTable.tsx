import React, { useMemo } from "react";
import { Shield, Building2, Globe, Users } from "lucide-react";
import {
  DataTable,
  Column,
  StatusPill,
  TableRowActions,
} from "@/components/common";
import { usePermission } from "@/hooks/usePermission";
import type { RolePermissionSummary } from "../types";
import { isSuperAdmin } from "@/lib/utils";

export interface PermissionTableProps {
  roles: RolePermissionSummary[];
  onOpenMatrix: (role: RolePermissionSummary, readOnly?: boolean) => void;
  isLoading?: boolean;
}

export const PermissionTable: React.FC<PermissionTableProps> = ({
  roles,
  onOpenMatrix,
  isLoading = false,
}) => {
  const { canUpdate } = usePermission();

  const sortedRoles = useMemo(() => {
    if (!roles || !Array.isArray(roles)) return [];
    return [...roles].sort((a, b) => {
      const aIsSuper = isSuperAdmin(a.code);
      const bIsSuper = isSuperAdmin(b.code);
      if (aIsSuper && !bIsSuper) return -1;
      if (!aIsSuper && bIsSuper) return 1;
      return 0;
    });
  }, [roles]);

  const columns = useMemo<Column<RolePermissionSummary>[]>(
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
        header: "Role",
        sortable: true,
        filterable: true,
        width: "220px",
        render: (row) => (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Shield size={15} />
            </div>
            <div className="min-w-0">
              <span className="font-semibold text-slate-900 text-xs truncate block">
                {row.name}
              </span>
              {row.description && (
                <span className="text-[11px] text-slate-500 truncate block max-w-[200px]" title={row.description}>
                  {row.description}
                </span>
              )}
            </div>
          </div>
        ),
      },
      {
        key: "code",
        header: "Role Code",
        sortable: true,
        filterable: true,
        width: "150px",
        render: (row) => (
          <span className="font-mono text-[11px] font-semibold text-slate-700 bg-slate-100/90 px-2 py-0.5 rounded-md border border-slate-200/80 inline-block">
            {row.code}
          </span>
        ),
      },
      {
        key: "entity_name",
        header: "Scope / Entity",
        sortable: true,
        filterable: true,
        width: "180px",
        render: (row) =>
          row.entity_name ? (
            <StatusPill
              variant="neutral"
              shape="rounded"
              size="xs"
              icon={<Building2 size={11} className="text-slate-500" />}
            >
              {row.entity_name}
            </StatusPill>
          ) : (
            <StatusPill
              variant="neutral"
              shape="rounded"
              size="xs"
              icon={<Globe size={11} className="text-slate-500" />}
            >
              Global Platform
            </StatusPill>
          ),
      },
      {
        key: "configured_features_count",
        header: "Configured Features",
        sortable: true,
        width: "180px",
        render: (row) => {
          const ratio =
            row.total_features_count > 0
              ? Math.round((row.configured_features_count / row.total_features_count) * 100)
              : 0;
          return (
            <div className="flex flex-col gap-1 max-w-[140px]">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-800 text-[11px]">
                  {row.configured_features_count} / {row.total_features_count || 70}
                </span>
                <span className="text-[10px] text-slate-500">{ratio}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    ratio === 100
                      ? "bg-emerald-500"
                      : ratio > 0
                      ? "bg-indigo-600"
                      : "bg-slate-300"
                  }`}
                  style={{ width: `${Math.max(ratio, 4)}%` }}
                />
              </div>
            </div>
          );
        },
      },
      {
        key: "accounts_count",
        header: "Assigned Users",
        sortable: true,
        width: "140px",
        render: (row) => (
          <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
            <Users size={13} className="text-slate-400" />
            <span>{row.accounts_count} {row.accounts_count === 1 ? "user" : "users"}</span>
          </div>
        ),
      },
      {
        key: "is_active",
        header: "Status",
        sortable: true,
        filterable: true,
        width: "100px",
        render: (row) => (
          <StatusPill
            variant={row.is_active ? "success" : "neutral"}
            shape="rounded"
            size="xs"
            dot={true}
          >
            {row.is_active ? "Active" : "Inactive"}
          </StatusPill>
        ),
      },
      {
        key: "actions",
        header: "Actions",
        sortable: false,
        width: "80px",
        className: "text-center",
        headerClassName: "text-center justify-center",
        render: (row) => {
          const isSuper = isSuperAdmin(row.code);
          return (
            <TableRowActions
              onView={() => onOpenMatrix(row, true)}
              onEdit={isSuper ? () => {} : () => onOpenMatrix(row, false)}
              editDisabled={isSuper}
              canEdit={canUpdate}
              viewTooltip="View Permissions"
              editTooltip="Edit Role Permissions"
            />
          );
        },
      },

    ],
    [onOpenMatrix, canUpdate]
  );

  return (
    <DataTable
      data={sortedRoles}
      columns={columns}
      density="compact"
      searchPlaceholder="Search roles by name, code or entity..."
      searchKeys={["name", "code", "entity_name"]}
      enableGlobalFilter={true}
      enableColumnFilters={true}
      enableSorting={true}
      pagination={{
        isServer: false,
        pageSize: 10,
        pageSizeOptions: [10, 25, 50],
      }}
      isLoading={isLoading}
      emptyTitle="No roles found"
      emptyMessage="No roles match your search criteria."
    />
  );
};

export default PermissionTable;

