import React, { useState } from "react";
import { FileText } from "lucide-react";
import { toast } from "sonner";

import { DatePicker, FileUploadZone, FormField, FormModal } from "@/components/common";
import { Input } from "@/components/ui/input";
import { uploadDocumentAsset } from "@/lib/cloudUploader";
import { useCreateDocumentMutation } from "@/features/documents/api";

interface InvoiceUploadModalProps {
  associationId: string;
  isOpen: boolean;
  onClose: () => void;
  onUploaded?: () => void;
}

export const InvoiceUploadModal: React.FC<InvoiceUploadModalProps> = ({
  associationId,
  isOpen,
  onClose,
  onUploaded,
}) => {
  const [vendorName, setVendorName] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileType, setFileType] = useState("");
  const [fileSizeKb, setFileSizeKb] = useState<number | null>(null);
  const [createDocument, createState] = useCreateDocumentMutation();

  const reset = () => {
    setVendorName("");
    setInvoiceNumber("");
    setIssueDate("");
    setFileUrl("");
    setFileName("");
    setFileType("");
    setFileSizeKb(null);
  };

  const close = () => {
    reset();
    onClose();
  };

  const uploadFile = async (file: File) => {
    const response = await uploadDocumentAsset(file);
    if (!response?.url) throw new Error("The invoice upload did not return a file URL");

    setFileName(file.name);
    setFileType(file.name.split(".").pop()?.toUpperCase() || "FILE");
    setFileSizeKb(Math.round(file.size / 1024));
    return response.url;
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedVendorName = vendorName.trim();
    if (!normalizedVendorName) {
      toast.error("Enter the third-party vendor name");
      return;
    }
    if (!fileUrl) {
      toast.error("Upload the invoice file");
      return;
    }

    try {
      await createDocument({
        association_id: associationId,
        title: `${normalizedVendorName}${invoiceNumber.trim() ? ` — ${invoiceNumber.trim()}` : ""}`,
        document_number: invoiceNumber.trim() || undefined,
        document_type: "Finance",
        category: "Vendor Invoices",
        file_name: fileName || undefined,
        file_url: fileUrl,
        file_type: fileType || undefined,
        file_size_kb: fileSizeKb,
        department: "Finance",
        related_module: "Vendor",
        visibility: "Admin Only",
        allow_download: true,
        issue_date: issueDate || undefined,
        status: "Active",
        remarks: "Third-party vendor invoice uploaded from Invoices.",
      }).unwrap();
      toast.success("Third-party invoice uploaded");
      onUploaded?.();
      close();
    } catch (error: any) {
      toast.error(error?.data?.detail || error?.message || "Unable to upload invoice");
    }
  };

  return <FormModal
    isOpen={isOpen}
    onClose={close}
    title="Upload Invoice"
    subtitle="Store an invoice received from a third-party vendor."
    icon={<FileText className="h-5 w-5 text-slate-800" />}
    size="lg"
    submitText="Upload Invoice"
    loadingText="Uploading invoice..."
    isSubmitting={createState.isLoading}
    submitDisabled={!vendorName.trim() || !fileUrl}
    onSubmit={submit}
  >
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Third-party vendor" required>
          <Input value={vendorName} onChange={(event) => setVendorName(event.target.value)} placeholder="Enter vendor name" maxLength={100} disabled={createState.isLoading} />
        </FormField>
        <FormField label="Invoice number">
          <Input value={invoiceNumber} onChange={(event) => setInvoiceNumber(event.target.value)} placeholder="Enter invoice number" maxLength={100} disabled={createState.isLoading} />
        </FormField>
        <FormField label="Invoice date">
          <DatePicker
            value={issueDate}
            onChange={(value) => setIssueDate(value || "")}
            onClear={() => setIssueDate("")}
            isClearable
            disabled={createState.isLoading}
            placeholder="Select invoice date..."
            valueFormat="yyyy-MM-dd"
          />
        </FormField>
      </div>
      <FormField label="Invoice file" required helperText="PDF, DOCX, XLSX, JPG, or PNG up to 10 MB.">
        <FileUploadZone
          value={fileUrl}
          onChange={setFileUrl}
          onUpload={uploadFile}
          accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
          maxSizeMB={10}
          label="Upload invoice"
          helperText="Drag and drop or choose the vendor invoice"
          disabled={createState.isLoading}
        />
      </FormField>
    </div>
  </FormModal>;
};
