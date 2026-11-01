import React, { useState } from "react";
import { ExternalLink, FileText, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DeleteModal, EmptyState } from "@/components/common";
import { useDeleteUnitDocumentMutation } from "@/features/unit-documents/api";
import type { UnitDocumentRecord } from "@/features/unit-documents/types";

export interface TenantDocumentsSectionProps {
  documents: UnitDocumentRecord[];
  isLoading?: boolean;
  onAdd: () => void;
  onDeleted?: () => void;
}

export const TenantDocumentsSection: React.FC<TenantDocumentsSectionProps> = ({
  documents,
  isLoading = false,
  onAdd,
  onDeleted,
}) => {
  const [documentToDelete, setDocumentToDelete] = useState<UnitDocumentRecord | null>(null);
  const [deleteUnitDocument, { isLoading: isDeleting }] = useDeleteUnitDocumentMutation();
  const hasRentAgreement = documents.some((document) => document.type === "Rent Agreement");
  const hasPoliceVerification = documents.some(
    (document) => document.type === "Police Verification",
  );
  const hasAllRequiredDocuments = hasRentAgreement && hasPoliceVerification;
  const actionLabel = hasAllRequiredDocuments
    ? "Edit tenant documents"
    : documents.length > 0
      ? "Add missing tenant document"
      : "Upload tenant documents";

  const confirmDelete = async () => {
    if (!documentToDelete) return;
    try {
      await deleteUnitDocument(documentToDelete.id).unwrap();
      toast.success("Tenant document deleted successfully");
      setDocumentToDelete(null);
      onDeleted?.();
    } catch (error: any) {
      toast.error(error?.data?.detail || error?.message || "Failed to delete tenant document");
    }
  };

  return (
  <>
    <section className="rounded-2xl border border-border bg-white p-5 shadow-xs sm:p-6">
    <div className="mb-5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#232C3E]/20 bg-[#232C3E]/10 text-[#232C3E]">
          <FileText size={20} />
        </div>
        <h3 className="text-base font-medium leading-tight text-slate-900">Tenant Documents</h3>
      </div>
      <Button
        onClick={onAdd}
        className="h-9 w-9 cursor-pointer rounded-xl bg-[#232C3E] p-0 text-white shadow-xs hover:bg-[#232C3E]/90"
        title={actionLabel}
        aria-label={actionLabel}
      >
        {hasAllRequiredDocuments ? <Pencil size={16} /> : <Plus size={16} />}
      </Button>
    </div>
    {isLoading ? (
      <div className="py-10 text-center text-sm text-slate-500">Loading tenant documents...</div>
    ) : documents.length === 0 ? (
      <EmptyState
        icon={FileText}
        title="No tenant documents uploaded"
        description="Upload your rent agreement and police verification document for board review."
        className="py-10"
        showIcon={false}
      />
    ) : (
      <div className="space-y-3.5">
        {documents.map((document) => (
          <div
            key={document.id}
            className="flex flex-col gap-3 rounded-xl border border-slate-200/80 bg-slate-50/40 p-4 transition-colors hover:bg-slate-50/90"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-indigo-600 shadow-2xs">
                  <FileText size={18} />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-slate-900">{document.name}</p>
                  <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wider text-slate-600">
                    {document.type}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                {document.file_url ? (
                  <a
                    href={document.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200/70 bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700 transition-colors hover:bg-blue-100"
                  >
                    <FileText size={13} />
                    View Document
                    <ExternalLink size={11} className="opacity-60" />
                  </a>
                ) : null}
                <Button
                  variant="ghost"
                  onClick={() => setDocumentToDelete(document)}
                  className="h-8 w-8 cursor-pointer rounded-lg p-0 text-red-600 hover:bg-red-50"
                  title="Delete document"
                  aria-label={`Delete ${document.name}`}
                >
                  <Trash2 size={15} />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    )}
    </section>
    <DeleteModal
      isOpen={Boolean(documentToDelete)}
      onClose={() => setDocumentToDelete(null)}
      onDelete={confirmDelete}
      itemName={documentToDelete?.name}
      itemType="Tenant document"
      description={`Are you sure you want to delete "${documentToDelete?.name}"? This action cannot be undone.`}
      isDeleting={isDeleting}
    />
  </>
  );
};

export default TenantDocumentsSection;
