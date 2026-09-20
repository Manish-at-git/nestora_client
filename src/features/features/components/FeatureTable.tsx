import React, { useState, useMemo } from "react";
import { toast } from "sonner";
import { LayoutGrid, Pencil, Trash2, Link as LinkIcon, CornerDownRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DeleteModal, DataTable, Column, StatusPill } from "@/components/common";
import { Icon as FeatureIcon } from "@/components/icons";
import { usePermission } from "@/hooks/usePermission";
import { useDeleteFeatureMutation } from "../api/featuresApi";
import type { Feature } from "../types";
import { formatApiErrorDetail } from "@/services/api/apiClient";

export interface FeatureTableProps {
  features: Feature[];
  onAdd?: () => void;
  onEdit: (feature: Feature) => void;
  onDeleted?: () => void;
  isLoading?: boolean;
}

export const FeatureTable: React.FC<FeatureTableProps> = ({
  features,
  onAdd,
  onEdit,
  onDeleted,
  isLoading = false,
}) => {
  const { canCreate, canUpdate, canDelete } = usePermission();
  const safeFeatures = Array.isArray(features) ? features : [];
  const [featureToDelete, setFeatureToDelete] = useState<Feature | null>(null);
  const [deleteFeature, { isLoading: isDeleting }] = useDeleteFeatureMutation();

  const handleConfirmDelete = async () => {
    if (!featureToDelete) return;
    try {
      await deleteFeature(featureToDelete.id).unwrap();
      toast.success(`Feature "${featureToDelete.name}" deleted successfully`);
      setFeatureToDelete(null);
      onDeleted?.();
    } catch (err: any) {
      toast.error(formatApiErrorDetail(err?.data || err?.message || "Failed to delete feature"));
    }
  };

  const columns = useMemo<Column<Feature>[]>(
    () => {
      const baseCols: Column<Feature>[] = [
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
          header: "Feature Name",
          sortable: true,
          filterable: true,
          width: "260px",
          render: (row) => {
            const isChild = Boolean(row.parent_id);

            return (
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 overflow-hidden border border-slate-200/60 p-1">
                  {typeof row.icon === "string" && row.icon.trim() ? (
                    <FeatureIcon name={row.icon} size={18} className="text-slate-500" />
                  ) : (
                    <LayoutGrid size={14} className="text-slate-500" />
                  )}
                </div>

                <span className="font-semibold text-slate-800 text-xs truncate flex items-center gap-1.5">
                  {isChild && (
                    <CornerDownRight
                      size={13}
                      className="text-slate-400 shrink-0"
                    />
                  )}
                  {row.name}
                </span>
              </div>
            );
          },
        },
        {
          key: "code",
          header: "Code",
          sortable: true,
          filterable: true,
          width: "170px",
          render: (row) => (
            <span>
              {row.code || "—"}
            </span>
          ),
        },
        {
          key: "parent_name",
          header: "Parent Feature",
          sortable: true,
          filterable: true,
          width: "180px",
          render: (row) =>
            row.parent_name ? (
              <StatusPill
                variant="neutral"
                shape="rounded"
                size="xs"
              >
                {row.parent_name}
              </StatusPill>
            ) : (
              <span className="text-xs text-slate-400 font-normal">
                Root Module
              </span>
            ),
        },
        {
          key: "url",
          header: "URL / Route",
          sortable: true,
          filterable: true,
          width: "250px",
          render: (row) =>
            row.url ? (
              <StatusPill
                variant="neutral"
                shape="rounded"
                size="xs"
                icon={<LinkIcon size={11} className="text-slate-400" />}
                className="font-mono text-[11px]"
              >
                {row.url}
              </StatusPill>
            ) : (
              <span className="text-slate-400 text-xs italic">—</span>
            ),
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
                  title="Edit Feature"
                >
                  <Pencil size={13} />
                </Button>
              )}
              {canDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setFeatureToDelete(row)}
                  className="rounded-lg h-7 w-7 text-rose-500 hover:text-rose-700 hover:bg-rose-50 cursor-pointer"
                  title="Delete Feature"
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
        data={safeFeatures}
        columns={columns}
        density="compact"
        searchPlaceholder="Search features..."
        searchKeys={["name", "code", "description", "parent_name", "url"]}
        enableGlobalFilter={true}
        enableColumnFilters={true}
        enableSorting={true}
        pagination={{
          isServer: false,
          pageSize: 10,
          pageSizeOptions: [10, 25, 50],
        }}
        isLoading={isLoading && safeFeatures.length === 0}
        emptyTitle="No features found"
        emptyMessage="No feature modules match your search criteria."
        onEmptyAction={canCreate ? onAdd : undefined}
        headerActions={
          canCreate && onAdd && (
            <Button onClick={onAdd}>
              <Plus size={15} className="mr-1.5" />
              <span>Add Feature</span>
            </Button>
          )
        }
      />

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={Boolean(featureToDelete)}
        onClose={() => setFeatureToDelete(null)}
        onDelete={handleConfirmDelete}
        itemName={featureToDelete?.name}
        itemType="Feature"
        description={`Are you sure you want to delete "${featureToDelete?.name}"? All associated role permissions will also be removed.`}
        isDeleting={isDeleting}
      />
    </>
  );
};

export default FeatureTable;
