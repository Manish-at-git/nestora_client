import React, { useState, useMemo } from "react";
import { toast } from "sonner";
import { Shield, Pencil, Trash2, Building2, Globe, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DeleteModal, DataTable, Column, StatusPill } from "@/components/common";
import { usePermission } from "@/hooks/usePermission";
import { useDeleteRoleMutation } from "../api/rolesApi";
import type { Role } from "../types";
import { isSuperAdmin } from "@/lib/utils";
import { formatApiErrorDetail } from "@/services/api/apiClient";

export interface RoleTableProps {
  roles: Role[];
  onAdd?: () => void;
  onEdit: (role: Role) => void;
  onDeleted?: () => void;
  isLoading?: boolean;
}

export const RoleTable: React.FC<RoleTableProps> = ({
  roles,
  onAdd,
  onEdit,
  onDeleted,
  isLoading = false,
}) => {
  const { canCreate, canUpdate, canDelete } = usePermission();
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);
  const [deleteRole, { isLoading: isDeleting }] = useDeleteRoleMutation();

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

  const handleConfirmDelete = async () => {
    if (!roleToDelete) return;
    try {
      await deleteRole(roleToDelete.id).unwrap();
      toast.success(`Role "${roleToDelete.name}" deleted successfully`);
      setRoleToDelete(null);
      onDeleted?.();
    } catch (err: any) {
      toast.error(formatApiErrorDetail(err?.data || err?.message || "Failed to delete role"));
    }
  };

  const columns = useMemo<Column<Role>[]>(
    () => {
      const baseCols: Column<Role>[] = [
        {
          key: "sr_no",
          header: "Sr. No.",
          sortable: false,
          width: "64px",
          className: "text-center",
          render: (_row, index) => (
            <span className="font-medium text-slate-500 text-xs">
              {index + 1}
            </span>
          ),
        },
        {
          key: "name",
          header: "Role Name",
          sortable: true,
          filterable: true,
          width: "260px",
          render: (row) => (
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                <Shield size={14} />
              </div>
              <span className="font-semibold text-slate-800 text-xs truncate">
                {row.name}
              </span>
            </div>
          ),
        },
        {
          key: "code",
          header: "Code",
          sortable: true,
          filterable: true,
          width: "180px",
          render: (row) => (
            <span className="font-mono text-[11px] font-semibold text-slate-700">
              {row.code || "—"}
            </span>
          ),
        },
        {
          key: "description",
          header: "Description",
          sortable: true,
          filterable: true,
          minWidth: "220px",
          render: (row) => (
            <span className="text-xs text-slate-600 max-w-md line-clamp-2">
              {row.description || (
                <span className="text-slate-400 italic">
                  No description provided
                </span>
              )}
            </span>
          ),
        },
        {
          key: "entity_name",
          header: "Entity Scope",
          sortable: true,
          filterable: true,
          width: "160px",
          render: (row) => {
            const entityLabel =
              row.entity_name ||
              (row.entity_id ? `Entity (${row.entity_id.slice(0, 8)})` : null);

            if (entityLabel) {
              return (
                <StatusPill
                  variant="neutral"
                  shape="rounded"
                  size="xs"
                  icon={<Building2 size={12} className="text-slate-500" />}
                >
                  {entityLabel}
                </StatusPill>
              );
            }

            return (
              <StatusPill
                variant="neutral"
                shape="rounded"
                size="xs"
                icon={<Globe size={12} className="text-slate-500" />}
              >
                Global Role
              </StatusPill>
            );
          },
        },
        {
          key: "is_active",
          header: "Status",
          sortable: true,
          filterable: true,
          width: "110px",
          render: (row) => {
            const isActive = Boolean(row.is_active);
            return (
              <StatusPill
                variant={isActive ? "success" : "neutral"}
                shape="rounded"
                size="xs"
                dot={true}
              >
                {isActive ? "Active" : "Inactive"}
              </StatusPill>
            );
          },
        },
        {
          key: "created_at",
          header: "Created At",
          sortable: true,
          filterable: true,
          width: "130px",
          render: (row) => (
            <span className="text-xs text-slate-500 whitespace-nowrap">
              {row.created_at
                ? new Date(row.created_at).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })
                : "N/A"}
            </span>
          ),
        },
      ];

      if (canUpdate || canDelete) {
        baseCols.push({
          key: "actions",
          header: "Actions",
          sortable: false,
          width: "72px",
          className: "text-center",
          headerClassName: "text-center justify-center",
          render: (row) => (
            <div className="flex items-center justify-center gap-1">
              {canUpdate && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(row)}
                  className="rounded-lg h-7 w-7 text-slate-500 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
                  title="Edit Role"
                >
                  <Pencil size={13} />
                </Button>
              )}
              {canDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setRoleToDelete(row)}
                  className="rounded-lg h-7 w-7 text-rose-500 hover:text-rose-700 hover:bg-rose-50 cursor-pointer"
                  title="Delete Role"
                >
                  <Trash2 size={13} />
                </Button>
              )}
            </div>
          ),
        });
      }

      return baseCols;
    },
    [onEdit, canUpdate, canDelete]
  );

  return (
    <>
      <DataTable
        data={sortedRoles}
        columns={columns}
        density="compact"
        searchPlaceholder="Search roles..."
        searchKeys={["name", "code", "description", "entity_name"]}
        enableGlobalFilter={true}
        enableColumnFilters={true}
        enableSorting={true}
        pagination={{
          isServer: false,
          pageSize: 10,
          pageSizeOptions: [10, 25, 50],
        }}
        // Keep loaded rows visible during a refetch; skeletons are only for the
        // initial request while no role data is available yet.
        isLoading={isLoading && sortedRoles.length === 0}
        headerActions={
          canCreate && onAdd && (
            <Button onClick={onAdd}>
              <Plus size={15} className="mr-1.5" />
              <span>Add Role</span>
            </Button>
          )
        }
      />

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={Boolean(roleToDelete)}
        onClose={() => setRoleToDelete(null)}
        onDelete={handleConfirmDelete}
        itemName={roleToDelete?.name}
        itemType="Role"
        description={`Are you sure you want to delete the role "${roleToDelete?.name}"? Accounts associated with this role may be affected.`}
        isDeleting={isDeleting}
      />
    </>
  );
};

export default RoleTable;
