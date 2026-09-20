import React, { useMemo, useState } from "react";
import { FileText, Plus } from "lucide-react";
import { toast } from "sonner";
import {
  DataTable,
  DeleteModal,
  FileActions,
  TableRowActions,
  type Column,
} from "@/components/common";
import { Button } from "@/components/ui/button";
import { usePermission } from "@/hooks/usePermission";
import { useDeleteUnitDocumentMutation } from "../api";
import type { UnitDocumentRecord } from "../types";

export interface UnitDocumentTableProps {
  documents: UnitDocumentRecord[];
  isAdmin: boolean;
  isLoading?: boolean;
  onAdd?: () => void;
  onView?: (document: UnitDocumentRecord) => void;
  onEdit?: (document: UnitDocumentRecord) => void;
  onDeleted?: () => void;
}

export const UnitDocumentTable: React.FC<UnitDocumentTableProps> = ({
  documents,
  isAdmin,
  isLoading = false,
  onAdd,
  onView,
  onEdit,
  onDeleted,
}) => {
  const { canCreate, canUpdate, canDelete } = usePermission();
  const [documentToDelete, setDocumentToDelete] =
    useState<UnitDocumentRecord | null>(null);
  const [deleteUnitDocument, { isLoading: isDeleting }] =
    useDeleteUnitDocumentMutation();
  const fileActionSlots = useMemo(
    () => ({
      reserveOpenSlot: documents.some((document) => Boolean(document.file_url)),
      reserveDownloadSlot: documents.some((document) => Boolean(document.file_url)),
    }),
    [documents],
  );
  const rowActionSlots = useMemo(
    () => ({
      reserveViewSlot: Boolean(onView),
      reserveEditSlot: canUpdate ? Boolean(onEdit) : false,
      reserveDeleteSlot: canDelete,
    }),
    [canDelete, canUpdate, onEdit, onView],
  );

  const confirmDelete = async () => {
    if (!documentToDelete) {
      return;
    }

    try {
      await deleteUnitDocument(documentToDelete.id).unwrap();
      toast.success("Unit document deleted successfully");
      setDocumentToDelete(null);
      onDeleted?.();
    } catch (err: any) {
      toast.error(
        err?.data?.detail || err?.message || "Failed to delete unit document",
      );
    }
  };

  const columns = useMemo<Column<UnitDocumentRecord>[]>(() => {
    const columnsList: Column<UnitDocumentRecord>[] = [
      {
        key: "sr_no",
        header: "Sr. No.",
        sortable: false,
        width: "64px",
        className: "text-center",
        render: (_row, index) => (
          <span className="text-xs text-slate-500">{index + 1}</span>
        ),
      },
      {
        key: "name",
        header: "Document",
        sortable: true,
        filterable: true,
        minWidth: "260px",
        headerClassName: "justify-start text-left",
        render: (row) => (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <FileText size={15} />
            </div>
            <div className="min-w-0">
              <span className="block text-xs font-semibold text-slate-800 truncate">
                  {row.name}
                </span>
              <span className="block max-w-xs text-[11px] text-slate-400 truncate">
                {row.description || "No description"}
              </span>
            </div>
          </div>
        ),
      },
      {
        key: "type",
        header: "Type",
        sortable: true,
        filterable: true,
        width: "170px",
        render: (row) => (
          <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
            {row.type}
          </span>
        ),
      },
      {
        key: "unit_number",
        header: "Unit",
        sortable: true,
        filterable: true,
        width: "120px",
        render: (row) => (
          <span className="text-xs text-slate-600">
            {row.unit_number || "All units"}
          </span>
        ),
      },
    ];

    if (isAdmin) {
      columnsList.push({
        key: "user_name",
        header: "Uploaded by",
        sortable: true,
        filterable: true,
        minWidth: "150px",
        render: (row) => (
          <span className="text-xs text-slate-600">
            {row.user_name || "Unknown user"}
          </span>
        ),
      });
    }

    columnsList.push({
      key: "file",
      header: "File",
      sortable: false,
      width: "82px",
      className: "text-center",
      headerClassName: "text-center justify-center",
      render: (row) => (
        <FileActions fileUrl={row.file_url} {...fileActionSlots} />
      ),
    });

    columnsList.push({
      key: "actions",
      header: "Actions",
      sortable: false,
      width: "96px",
      className: "text-center",
      headerClassName: "text-center justify-center",
      render: (row) => (
        <TableRowActions
          onView={onView ? () => onView(row) : undefined}
          onEdit={onEdit ? () => onEdit(row) : undefined}
          onDelete={() => setDocumentToDelete(row)}
          canEdit={canUpdate}
          canDelete={canDelete}
          {...rowActionSlots}
          viewTooltip="View unit document"
          editTooltip="Edit unit document"
          deleteTooltip="Delete unit document"
        />
      ),
    });

    return columnsList;
  }, [
    canDelete,
    canUpdate,
    fileActionSlots,
    isAdmin,
    onEdit,
    onView,
    rowActionSlots,
  ]);

  const uploadActionLabel = canCreate
    ? onAdd
      ? "+ Upload Unit Document"
      : undefined
    : undefined;
  const headerAction = canCreate
    ? onAdd
      ? (
          <Button onClick={onAdd}>
            <Plus size={15} className="mr-1.5" />
            Upload Unit Document
          </Button>
        )
      : undefined
    : undefined;

  return (
    <>
      <DataTable
        data={documents}
        columns={columns}
        density="compact"
        searchPlaceholder="Search unit documents..."
        searchKeys={[
          "name",
          "description",
          "type",
          "unit_number",
          "user_name",
          "association_name",
        ]}
        enableGlobalFilter
        enableColumnFilters
        enableSorting
        pagination={{
          isServer: false,
          pageSize: 10,
          pageSizeOptions: [10, 25, 50],
        }}
        isLoading={isLoading}
        emptyTitle="No unit documents found"
        emptyMessage="No unit-specific documents match your search criteria."
        emptyActionLabel={uploadActionLabel}
        onEmptyAction={canCreate ? onAdd : undefined}
        headerActions={headerAction}
      />

      <DeleteModal
        isOpen={Boolean(documentToDelete)}
        onClose={() => setDocumentToDelete(null)}
        onDelete={confirmDelete}
        itemName={documentToDelete?.name}
        itemType="Unit document"
        description={`Are you sure you want to delete "${documentToDelete?.name}"? This action cannot be undone.`}
        isDeleting={isDeleting}
      />
    </>
  );
};

export default UnitDocumentTable;
