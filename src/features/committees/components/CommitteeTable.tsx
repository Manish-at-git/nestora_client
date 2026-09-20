import React, { useState, useMemo } from "react";
import { toast } from "sonner";
import {
  Pencil,
  Trash2,
  Users,
  Building,
  Calendar,
  Eye,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DeleteModal, DataTable, type Column } from "@/components/common";
import { usePermission } from "@/hooks/usePermission";
import { useDeleteCommitteeMutation } from "../api/committeesApi";
import type { Committee } from "../types";

export interface CommitteeTableProps {
  committees: Committee[];
  onAdd?: () => void;
  onEdit: (committee: Committee) => void;
  onView: (committee: Committee) => void;
  onDeleted?: () => void;
  isLoading?: boolean;
}

export const CommitteeTable: React.FC<CommitteeTableProps> = ({
  committees,
  onAdd,
  onEdit,
  onView,
  onDeleted,
  isLoading = false,
}) => {
  const { canCreate, canUpdate, canDelete } = usePermission();
  const [committeeToDelete, setCommitteeToDelete] = useState<Committee | null>(null);
  const [deleteCommittee, { isLoading: isDeleting }] = useDeleteCommitteeMutation();

  const handleConfirmDelete = async () => {
    if (!committeeToDelete) return;

    try {
      await deleteCommittee(committeeToDelete.id).unwrap();
      toast.success(
        `Committee "${committeeToDelete.name}" deleted successfully`
      );
      setCommitteeToDelete(null);
      onDeleted?.();
    } catch (err: any) {
      toast.error(
        err.data?.detail || err.message || "Failed to delete committee"
      );
    }
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return isNaN(date.getTime())
      ? dateStr
      : date.toLocaleDateString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
  };

  const columns = useMemo<Column<Committee>[]>(() => {
    const baseCols: Column<Committee>[] = [
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
        header: "Committee Name",
        sortable: true,
        filterable: true,
        width: "240px",
        minWidth: "180px",
        render: (row) => (
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Users size={14} />
            </div>
            <button
              type="button"
              onClick={() => onView(row)}
              className="text-left font-semibold text-slate-800 text-xs hover:text-indigo-600 transition-colors truncate cursor-pointer"
              title="Click to view details"
            >
              {row.name}
            </button>
          </div>
        ),
      },
      {
        key: "association_name",
        header: "Association",
        sortable: true,
        filterable: true,
        width: "200px",
        minWidth: "150px",
        render: (row) => (
          <div className="flex items-center gap-1.5 text-xs text-slate-700">
            <Building size={13} className="text-slate-400 shrink-0" />
            <span className="truncate">{row.association_name || "N/A"}</span>
          </div>
        ),
      },
      {
        key: "member_count",
        header: "Members",
        sortable: true,
        width: "110px",
        className: "text-center",
        headerClassName: "text-center justify-center",
        render: (row) => {
          const count = row.member_count ?? row.members?.length ?? 0;
          return (
            <Badge
              variant="outline"
              className="bg-slate-50 text-slate-700 border-slate-200 text-[11px] font-semibold px-2 py-0.5"
            >
              {count} {count === 1 ? "Member" : "Members"}
            </Badge>
          );
        },
      },
      {
        key: "term",
        header: "Term Period",
        sortable: false,
        width: "190px",
        render: (row) => {
          const start = formatDate(row.start_date);
          const end = formatDate(row.end_date);
          if (!start && !end) {
            return (
              <span className="text-xs text-slate-400 italic">
                Active / Ongoing
              </span>
            );
          }
          return (
            <div className="flex items-center gap-1 text-xs text-slate-600 whitespace-nowrap">
              <Calendar size={12} className="text-slate-400 shrink-0" />
              <span>{start || "Start"}</span>
              <span className="text-slate-300">-</span>
              <span>{end || "Present"}</span>
            </div>
          );
        },
      },
      {
        key: "description",
        header: "Description",
        sortable: true,
        filterable: true,
        minWidth: "220px",
        render: (row) => (
          <span className="text-xs text-slate-600 line-clamp-2 max-w-sm">
            {row.description || (
              <span className="text-slate-400 italic">
                No description provided
              </span>
            )}
          </span>
        ),
      },
    ];

    baseCols.push({
      key: "actions",
      header: "Actions",
      sortable: false,
      width: "100px",
      className: "text-center",
      headerClassName: "text-center justify-center",
      render: (row) => (
        <div className="flex items-center justify-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onView(row)}
            className="rounded-lg h-7 w-7 text-slate-500 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
            title="View Details"
          >
            <Eye size={13} />
          </Button>
          {canUpdate && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(row)}
              className="rounded-lg h-7 w-7 text-slate-500 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
              title="Edit Committee"
            >
              <Pencil size={13} />
            </Button>
          )}
          {canDelete && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCommitteeToDelete(row)}
              className="rounded-lg h-7 w-7 text-rose-500 hover:text-rose-700 hover:bg-rose-50 cursor-pointer"
              title="Delete Committee"
            >
              <Trash2 size={13} />
            </Button>
          )}
        </div>
      ),
    });

    return baseCols;
  }, [onEdit, onView, canUpdate, canDelete]);

  return (
    <>
      <DataTable
        data={committees}
        columns={columns}
        density="compact"
        searchPlaceholder="Search committees by name, association, description..."
        searchKeys={["name", "association_name", "description"]}
        enableGlobalFilter={true}
        enableColumnFilters={true}
        enableSorting={true}
        pagination={{
          isServer: false,
          pageSize: 10,
          pageSizeOptions: [10, 25, 50],
        }}
        isLoading={isLoading}
        emptyTitle="No committees found"
        emptyMessage="No committees match your search or filter criteria."
        onEmptyAction={canCreate ? onAdd : undefined}
        headerActions={
          canCreate && onAdd && (
            <Button onClick={onAdd}>
              <Plus size={15} className="mr-1.5" />
              <span>Add Committee</span>
            </Button>
          )
        }
      />

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={Boolean(committeeToDelete)}
        onClose={() => setCommitteeToDelete(null)}
        onDelete={handleConfirmDelete}
        itemName={committeeToDelete?.name}
        itemType="Committee"
        description={`Are you sure you want to delete the "${committeeToDelete?.name}" committee? All member assignments under this committee will also be removed.`}
        isDeleting={isDeleting}
      />
    </>
  );
};

export default CommitteeTable;
