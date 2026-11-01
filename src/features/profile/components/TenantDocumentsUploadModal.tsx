import React, { useEffect, useState } from "react";
import { FileText } from "lucide-react";
import { toast } from "sonner";
import { FileUploadZone, FormField, FormModal } from "@/components/common";
import { uploadDocumentAsset, uploadMediaAsset } from "@/lib/cloudUploader";
import {
  useCreateUnitDocumentMutation,
  useUpdateUnitDocumentMutation,
} from "@/features/unit-documents/api";
import type { UnitDocumentRecord } from "@/features/unit-documents/types";

interface UploadedFile {
  url: string;
  name: string;
  type: string;
  sizeKb: number | null;
  documentId?: string;
}

const emptyFile = (): UploadedFile => ({ url: "", name: "", type: "", sizeKb: null });

const toUploadedFile = (document?: UnitDocumentRecord): UploadedFile =>
  document
    ? {
        url: document.file_url || "",
        name: document.file_name || document.name,
        type: document.file_type || "FILE",
        sizeKb: document.file_size_kb ?? null,
        documentId: document.id,
      }
    : emptyFile();

export interface TenantDocumentsUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  documents: UnitDocumentRecord[];
}

export const TenantDocumentsUploadModal: React.FC<TenantDocumentsUploadModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  documents,
}) => {
  const [rentAgreement, setRentAgreement] = useState<UploadedFile>(emptyFile);
  const [policeVerification, setPoliceVerification] = useState<UploadedFile>(emptyFile);
  const [createUnitDocument, { isLoading: isCreating }] = useCreateUnitDocumentMutation();
  const [updateUnitDocument, { isLoading: isUpdating }] = useUpdateUnitDocumentMutation();
  const isLoading = isCreating || isUpdating;

  useEffect(() => {
    if (!isOpen) return;

    setRentAgreement(toUploadedFile(documents.find((document) => document.type === "Rent Agreement")));
    setPoliceVerification(
      toUploadedFile(documents.find((document) => document.type === "Police Verification")),
    );
  }, [documents, isOpen]);

  const uploadFile = async (file: File): Promise<UploadedFile> => {
    const response = file.type.startsWith("image/")
      ? await uploadMediaAsset(file)
      : await uploadDocumentAsset(file);
    if (!response?.url) {
      throw new Error("The document upload did not return a URL");
    }
    return {
      url: response.url,
      name: file.name,
      type: file.name.split(".").pop()?.toUpperCase() || "FILE",
      sizeKb: Math.round(file.size / 1024),
    };
  };

  const save = async () => {
    const documentsToSave = [
      { file: rentAgreement, name: "Rent Agreement", type: "Rent Agreement" },
      { file: policeVerification, name: "Police Verification Document", type: "Police Verification" },
    ].filter(({ file }) => file.url);

    if (documentsToSave.length === 0) {
      toast.error("Please upload at least one tenant document");
      return;
    }

    try {
      await Promise.all(
        documentsToSave.map(({ file, name, type }) => {
          const data = {
            name,
            type,
            file_url: file.url,
            file_name: file.name,
            file_type: file.type,
            file_size_kb: file.sizeKb,
            is_visible_to_board: true,
          };
          return file.documentId
            ? updateUnitDocument({ id: file.documentId, data }).unwrap()
            : createUnitDocument(data).unwrap();
        }),
      );
      toast.success("Tenant documents saved successfully");
      setRentAgreement(emptyFile());
      setPoliceVerification(emptyFile());
      onSuccess?.();
      onClose();
    } catch (error: any) {
      toast.error(error?.data?.detail || error?.message || "Failed to upload tenant documents");
    }
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title="Tenant Documents"
      subtitle="Saved documents are shown below. Remove one to choose a replacement; board members can view both documents."
      icon={<FileText size={18} className="text-slate-800" />}
      size="2xl"
      isForm={false}
      isSubmitting={isLoading}
      submitText="Save Documents"
      loadingText="Saving..."
      submitDisabled={!rentAgreement.url && !policeVerification.url}
      onSubmit={() => {
        void save();
      }}
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-1">
        <FormField label="Rent Agreement" helperText="PDF, DOCX, XLSX, JPG, or PNG up to 10MB.">
          <FileUploadZone
            value={rentAgreement.url}
            preselectedFileName={rentAgreement.name}
            onChange={(url) => !url && setRentAgreement((current) => ({ ...emptyFile(), documentId: current.documentId }))}
            onUpload={async (file) => {
              const uploaded = await uploadFile(file);
              setRentAgreement((current) => ({ ...uploaded, documentId: current.documentId }));
              return uploaded.url;
            }}
            accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
            maxSizeMB={10}
            label={rentAgreement.documentId ? "Replace rent agreement" : "Upload rent agreement"}
            helperText="Drag and drop or choose a file"
            disabled={isLoading}
          />
        </FormField>
        <FormField label="Police Verification Document" helperText="PDF, DOCX, XLSX, JPG, or PNG up to 10MB.">
          <FileUploadZone
            value={policeVerification.url}
            preselectedFileName={policeVerification.name}
            onChange={(url) => !url && setPoliceVerification((current) => ({ ...emptyFile(), documentId: current.documentId }))}
            onUpload={async (file) => {
              const uploaded = await uploadFile(file);
              setPoliceVerification((current) => ({ ...uploaded, documentId: current.documentId }));
              return uploaded.url;
            }}
            accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
            maxSizeMB={10}
            label={policeVerification.documentId ? "Replace police verification" : "Upload police verification"}
            helperText="Drag and drop or choose a file"
            disabled={isLoading}
          />
        </FormField>
      </div>
    </FormModal>
  );
};

export default TenantDocumentsUploadModal;
