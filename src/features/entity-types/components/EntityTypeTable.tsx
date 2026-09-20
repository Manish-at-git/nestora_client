import React, { useState, useMemo } from "react";
import { toast } from "sonner";
import { Pencil, Trash2, Layers, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DeleteModal, DataTable, Column } from "@/components/common";
import { usePermission } from "@/hooks/usePermission";
import { formatApiErrorDetail } from "@/services/api/apiClient";
import { useDeleteEntityTypeMutation } from "../api/entityTypesApi";
import type { EntityType } from "../types";

export interface EntityTypeTableProps {
  entityTypes: EntityType[];
  onAdd?: () => void;
  onEdit: (entityType: EntityType) => void;
  onDeleted?: () => void;
  isLoading?: boolean;
}

export const EntityTypeTable: React.FC<EntityTypeTableProps> = ({
  entityTypes,
  onAdd,
  onEdit,
  onDeleted,
  isLoading = false,
}) => {
  const { canCreate, canUpdate, canDelete } = usePermission();
  const [entityToDelete, setEntityToDelete] = useState<EntityType | null>(null);
  const [deleteEntityType, { isLoading: isDeleting }] =
    useDeleteEntityTypeMutation();

  const handleConfirmDelete = async () => {
    if (!entityToDelete) return;

    try {
      await deleteEntityType(entityToDelete.id).unwrap();
      toast.success(
        `Entity type "${entityToDelete.name}" deleted successfully`
      );
      setEntityToDelete(null);
      onDeleted?.();
    } catch (err: any) {
      toast.error(
        formatApiErrorDetail(err.data || err.message || "Failed to delete entity type")
      );
    }
  };

  const columns = useMemo<Column<EntityType>[]>(() => {
    const baseCols: Column<EntityType>[] = [
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
        header: "Name",
        sortable: true,
        filterable: true, // Column-specific filter
        width: "300px",
        minWidth: "180px",
        render: (row) => (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Layers size={14} />
            </div>
            <span className="font-semibold text-slate-800 text-xs truncate">{row.name}</span>
          </div>
        ),
      },
      {
        key: "description",
        header: "Description",
        sortable: true,
        filterable: true, // Column-specific filter
        minWidth: "240px", // Expands to fill available room
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
                title="Edit Entity Type"
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
                title="Delete Entity Type"
              >
                <Trash2 size={13} />
              </Button>
            )}
          </div>
        ),
      });
    }

    return baseCols;
  }, [onEdit, canUpdate, canDelete]);

  return (
    <>
      <DataTable
        data={entityTypes}
        columns={columns}
        density="compact"
        searchPlaceholder="Search entity types..."
        searchKeys={["name", "description"]}
        enableGlobalFilter={true}
        enableColumnFilters={true}
        enableSorting={true}
        pagination={{
          isServer: false,
          pageSize: 10,
          pageSizeOptions: [10, 25, 50],
        }}
        isLoading={isLoading}
        emptyTitle="No entity types found"
        onEmptyAction={canCreate ? onAdd : undefined}
        headerActions={
          canCreate && onAdd && (
            <Button
              onClick={onAdd}
            >
              <Plus size={15} className="mr-1.5" />
              <span>Add Entity Type</span>
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
        itemType="Entity Type"
        description={`Are you sure you want to delete "${entityToDelete?.name}"? Any associations categorized under this entity type may be affected.`}
        isDeleting={isDeleting}
      />
    </>
  );
};

export default EntityTypeTable;
