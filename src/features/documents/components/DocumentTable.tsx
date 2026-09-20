import React, { useMemo, useState } from "react";
import { FileText, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DataTable,
  DeleteModal,
  FileActions,
  TableRowActions,
  type Column,
  StatusPill,
} from "@/components/common";
import { usePermission } from "@/hooks/usePermission";
import { useDeleteDocumentMutation } from "../api";
import type { DocumentRecord } from "../types";

export interface DocumentTableProps {
  documents: DocumentRecord[];
  isLoading?: boolean;
  onAdd?: () => void;
  onView?: (document: DocumentRecord) => void;
  onEdit?: (document: DocumentRecord) => void;
  onDeleted?: () => void;
}

export const DocumentTable: React.FC<DocumentTableProps> = ({
  documents,
  isLoading = false,
  onAdd,
  onView,
  onEdit,
  onDeleted,
}) => {
  const { canCreate, canUpdate, canDelete } = usePermission("resident-documents");
  const [documentToDelete, setDocumentToDelete] =
    useState<DocumentRecord | null>(null);
  const [deleteDocument, { isLoading: isDeleting }] =
    useDeleteDocumentMutation();
  const fileActionSlots = useMemo(
    () => ({
      reserveOpenSlot: documents.some((document) => Boolean(document.file_url)),
      reserveDownloadSlot: documents.some((document) =>
        document.file_url ? Boolean(document.allow_download) : false,
      ),
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
      await deleteDocument(documentToDelete.id).unwrap();
      toast.success("Document deleted successfully");
      setDocumentToDelete(null);
      onDeleted?.();
    } catch (err: any) {
      toast.error(
        err?.data?.detail || err?.message || "Failed to delete document",
      );
    }
  };

  const columns = useMemo<Column<DocumentRecord>[]>(() => {
    const columnsList: Column<DocumentRecord>[] = [
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
        key: "title",
        header: "Document",
        sortable: true,
        filterable: true,
        minWidth: "250px",
        render: (row) => (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <FileText size={15} />
            </div>
            <div className="min-w-0">
              <span className="block text-xs font-semibold text-slate-800 truncate">
                  {row.title}
                </span>
              <span className="block text-[11px] text-slate-400 truncate">
                {row.document_number || "No document number"} · {row.file_type || "File"}
              </span>
            </div>
          </div>
        ),
      },
      {
        key: "association_name",
        header: "Association",
        sortable: true,
        filterable: true,
        minWidth: "150px",
        render: (row) => (
          <span className="text-xs font-medium text-slate-700">
            {row.association_name || "—"}
          </span>
        ),
      },
      {
        key: "document_type",
        header: "Category",
        sortable: true,
        filterable: true,
        width: "160px",
        render: (row) => (
          <div>
            <span className="text-xs font-medium text-slate-700">
              {row.document_type || "Uncategorized"}
            </span>
            {row.category ? (
              <span className="block text-[11px] text-slate-400 truncate">
                {row.category}
              </span>
            ) : null}
          </div>
        ),
      },
      {
        key: "status",
        header: "Status",
        sortable: true,
        filterable: true,
        width: "110px",
        render: (row) => (
          <StatusPill status={row.status || "Unknown"} size="xs" />
        ),
      },
      {
        key: "visibility",
        header: "Visible to",
        sortable: false,
        minWidth: "140px",
        render: (row) => (
          <span className="text-xs text-slate-500">
            {row.visibility || "All"}
          </span>
        ),
      },
      {
        key: "expiry_date",
        header: "Expiry",
        sortable: true,
        filterable: true,
        width: "120px",
        render: (row) => (
          <span className="text-xs text-slate-500 whitespace-nowrap">
            {row.expiry_date
              ? new Date(row.expiry_date).toLocaleDateString()
              : "—"}
          </span>
        ),
      },
      {
        key: "file",
        header: "File",
        sortable: false,
        width: "82px",
        className: "text-center",
        headerClassName: "text-center justify-center",
        render: (row) => (
          <FileActions
            fileUrl={row.file_url}
            canDownload={Boolean(row.allow_download)}
            {...fileActionSlots}
          />
        ),
      },
    ];

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
            viewTooltip="View document"
            editTooltip="Edit document"
            deleteTooltip="Delete document"
          />
        ),
    });

    return columnsList;
  }, [canDelete, canUpdate, fileActionSlots, onEdit, onView, rowActionSlots]);

  return (
    <>
      <DataTable
        data={documents}
        columns={columns}
        density="compact"
        searchPlaceholder="Search documents..."
        searchKeys={[
          "title",
          "document_number",
          "document_type",
          "category",
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
        emptyTitle="No documents found"
        emptyMessage="No association documents match your search criteria."
        emptyActionLabel={canCreate ? (onAdd ? "+ Upload Document" : undefined) : undefined}
        onEmptyAction={canCreate ? onAdd : undefined}
        headerActions={
          canCreate ? (onAdd ? (
            <Button onClick={onAdd}>
              <Plus size={15} className="mr-1.5" />
              Upload Document
            </Button>
          ) : undefined) : undefined
        }
      />

      <DeleteModal
        isOpen={Boolean(documentToDelete)}
        onClose={() => setDocumentToDelete(null)}
        onDelete={confirmDelete}
        itemName={documentToDelete?.title}
        itemType="Document"
        description={`Are you sure you want to delete "${documentToDelete?.title}"? This action cannot be undone.`}
        isDeleting={isDeleting}
      />
    </>
  );
};

export default DocumentTable;
