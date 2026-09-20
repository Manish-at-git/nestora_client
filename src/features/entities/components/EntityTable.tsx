import React, { useState, useMemo } from "react";
import { toast } from "sonner";
import { Pencil, Trash2, Building2, Layers, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DeleteModal, DataTable, Column, StatusPill } from "@/components/common";
import { usePermission } from "@/hooks/usePermission";
import { formatApiErrorDetail } from "@/services/api/apiClient";
import { useDeleteEntityMutation } from "../api/entitiesApi";
import type { Entity } from "../types";

export interface EntityTableProps {
  entities: Entity[];
  onAdd?: () => void;
  onEdit: (entity: Entity) => void;
  onDeleted?: () => void;
  isLoading?: boolean;
}

export const EntityTable: React.FC<EntityTableProps> = ({
  entities,
  onAdd,
  onEdit,
  onDeleted,
  isLoading = false,
}) => {
  const { canCreate, canUpdate, canDelete } = usePermission();
  const [entityToDelete, setEntityToDelete] = useState<Entity | null>(null);
  const [deleteEntity, { isLoading: isDeleting }] = useDeleteEntityMutation();

  const handleConfirmDelete = async () => {
    if (!entityToDelete) return;

    try {
      await deleteEntity(entityToDelete.id).unwrap();
      toast.success(`Entity "${entityToDelete.name}" deleted successfully`);
      setEntityToDelete(null);
      onDeleted?.();
    } catch (err: any) {
      toast.error(formatApiErrorDetail(err.data || err.message || "Failed to delete entity"));
    }
  };

  const columns = useMemo<Column<Entity>[]>(
    () => {
      const baseCols: Column<Entity>[] = [
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
          header: "Entity Name",
          sortable: true,
          filterable: true,
          width: "280px",
          minWidth: "180px",
          render: (row) => (
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Building2 size={14} />
              </div>
              <div className="min-w-0">
                <span className="block font-semibold text-slate-800 text-xs truncate">
                  {row.name}
                </span>
                {row.description && (
                  <span className="block text-[11px] text-slate-400 truncate max-w-xs">
                    {row.description}
                  </span>
                )}
              </div>
            </div>
          ),
        },
        {
          key: "entity_type_name",
          header: "Entity Type",
          sortable: true,
          filterable: true,
          width: "180px",
          render: (row) => (
            <div className="flex items-center gap-1.5">
              <Layers size={13} className="text-slate-400 shrink-0" />
              <span className="text-xs font-medium text-slate-700">
                {row.entity_type_name || "General"}
              </span>
            </div>
          ),
        },
        // {
        //   key: "status",
        //   header: "Status",
        //   sortable: true,
        //   filterable: true,
        //   width: "120px",
        //   render: (row) => (
        //     <StatusPill status={row.status || "Unknown"} size="xs" />
        //   ),
        // },
        {
          key: "created_at",
          header: "Created At",
          sortable: true,
          filterable: true,
          width: "140px",
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
                  title="Edit Entity"
                >
                  <Pencil size={13} />
                </Button>
              )}
              {canDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setEntityToDelete(row)}
                  className="rounded-lg h-7 w-7 text-rose-500 hover:text-rose-700 hover:bg-rose-50 cursor-pointer"
                  title="Delete Entity"
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
        data={entities}
        columns={columns}
        density="compact"
        searchPlaceholder="Search entities..."
        searchKeys={["name", "description", "entity_type_name"]}
        enableGlobalFilter={true}
        enableColumnFilters={true}
        enableSorting={true}
        pagination={{
          isServer: false,
          pageSize: 10,
          pageSizeOptions: [10, 25, 50],
        }}
        isLoading={isLoading}
        emptyTitle="No entities found"
        emptyMessage="No entities match your search criteria."
        onEmptyAction={canCreate ? onAdd : undefined}
        headerActions={
          canCreate && onAdd && (
            <Button onClick={onAdd}>
              <Plus size={15} className="mr-1.5" />
              <span>Add Entity</span>
            </Button>
          )
        }
      />

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={Boolean(entityToDelete)}
        onClose={() => setEntityToDelete(null)}
        onDelete={handleConfirmDelete}
        itemName={entityToDelete?.name}
        itemType="Entity"
        description={`Are you sure you want to delete "${entityToDelete?.name}"? Any associations or sub-entities linked to this entity may be affected.`}
        isDeleting={isDeleting}
      />
    </>
  );
};

export default EntityTable;
