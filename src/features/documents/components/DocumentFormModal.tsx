import React, { useEffect, useMemo } from "react";
import { Controller } from "react-hook-form";
import { Building2, FileText, Shield, Tag, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import {
  DatePicker,
  FileUploadZone,
  FormField,
  FormModal,
} from "@/components/common";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAppForm } from "@/hooks/useAppForm";
import { uploadDocumentAsset } from "@/lib/cloudUploader";
import {
  useCreateDocumentMutation,
  useUpdateDocumentMutation,
} from "../api";
import {
  DOCUMENT_CATEGORIES,
  DOCUMENT_TYPES,
  getOptionId,
  getOptionLabel,
  MODULE_OPTIONS,
  STATUS_OPTIONS,
  VISIBILITY_OPTIONS,
} from "../constants";
import { documentSchema, type DocumentFormValues } from "../schemas";
import type { DocumentRecord } from "../types";

export interface DocumentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  documentToEdit?: DocumentRecord | null;
  associations?: Array<{ id: string | number; name: string }>;
  selectedAssociationId?: string | number;
  mode?: "edit" | "view";
}

const emptyValues = (associationId = ""): DocumentFormValues => ({
  association_id: String(associationId || ""),
  title: "",
  document_number: "",
  document_type: undefined,
  category: undefined,
  file_name: "",
  file_url: "",
  file_type: "",
  file_size_kb: null,
  department: "",
  related_module: undefined,
  visibility: [5],
  allow_download: true,
  issue_date: "",
  expiry_date: "",
  reminder_before_expiry_days: null,
  status: 2,
  keywords: "",
  remarks: "",
});

const labelsToIds = (
  labels: string | null | undefined,
  options: typeof VISIBILITY_OPTIONS,
) => {
  return (labels || "")
    .split(",")
    .map((label) => getOptionId(options, label.trim()))
    .filter((id): id is number => id !== undefined);
};

const idsToLabels = (
  ids: number[],
  options: typeof VISIBILITY_OPTIONS,
) => {
  return ids
    .map((id) => getOptionLabel(options, id))
    .filter((label): label is string => Boolean(label))
    .join(", ");
};

export const DocumentFormModal: React.FC<DocumentFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  documentToEdit,
  associations = [],
  selectedAssociationId,
  mode = "edit",
}) => {
  const [createDocument, { isLoading: isCreating }] =
    useCreateDocumentMutation();
  const [updateDocument, { isLoading: isUpdating }] =
    useUpdateDocumentMutation();

  const isViewMode = mode === "view";
  const isEditMode = Boolean(documentToEdit) && !isViewMode;
  const validAssociations = useMemo(
    () => associations.filter((association) => String(association.id) !== "ALL"),
    [associations],
  );

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useAppForm<DocumentFormValues>({
    schema: documentSchema,
    defaultValues: emptyValues(),
  });

  const fileUrl = watch("file_url");
  const visibility = watch("visibility") || [];
  const documentType = watch("document_type");
  const categoryOptions = documentType
    ? DOCUMENT_CATEGORIES[documentType] || []
    : [];
  const isBusy = isCreating || isUpdating || isSubmitting;
  const isDisabled = isBusy || isViewMode;

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (!documentToEdit) {
      reset(emptyValues(String(selectedAssociationId || "")));
      return;
    }

    const typeId = getOptionId(DOCUMENT_TYPES, documentToEdit.document_type);
    const editCategoryOptions = typeId
      ? DOCUMENT_CATEGORIES[typeId] || []
      : [];

    reset({
      ...emptyValues(documentToEdit.association_id),
      title: documentToEdit.title || "",
      document_number: documentToEdit.document_number || "",
      document_type: typeId,
      category: getOptionId(editCategoryOptions, documentToEdit.category),
      file_name: documentToEdit.file_name || "",
      file_url: documentToEdit.file_url || "",
      file_type: documentToEdit.file_type || "",
      file_size_kb: documentToEdit.file_size_kb ?? null,
      department: documentToEdit.department || "",
      related_module: getOptionId(MODULE_OPTIONS, documentToEdit.related_module),
      visibility: labelsToIds(documentToEdit.visibility, VISIBILITY_OPTIONS),
      allow_download: documentToEdit.allow_download !== false,
      issue_date: documentToEdit.issue_date?.slice(0, 10) || "",
      expiry_date: documentToEdit.expiry_date?.slice(0, 10) || "",
      reminder_before_expiry_days:
        documentToEdit.reminder_before_expiry_days ?? null,
      status: getOptionId(STATUS_OPTIONS, documentToEdit.status) || 2,
      keywords: documentToEdit.keywords || "",
      remarks: documentToEdit.remarks || "",
    });
  }, [documentToEdit, isOpen, reset, selectedAssociationId]);

  const handleUpload = async (file: File) => {
    const response = await uploadDocumentAsset(file);

    if (!response?.url) {
      throw new Error("The document upload did not return a URL");
    }

    setValue("file_name", file.name, { shouldTouch: true });
    setValue(
      "file_type",
      file.name.split(".").pop()?.toUpperCase() || "FILE",
      { shouldTouch: true },
    );
    setValue("file_size_kb", Math.round(file.size / 1024), {
      shouldTouch: true,
    });

    return response.url;
  };

  const onSubmit = async (data: DocumentFormValues) => {
    try {
      const payload = {
        title: data.title.trim(),
        document_number: data.document_number?.trim() || undefined,
        document_type: getOptionLabel(DOCUMENT_TYPES, data.document_type),
        category: getOptionLabel(categoryOptions, data.category),
        department: data.department?.trim() || undefined,
        related_module: getOptionLabel(MODULE_OPTIONS, data.related_module),
        visibility: idsToLabels(data.visibility, VISIBILITY_OPTIONS),
        allow_download: data.allow_download,
        issue_date: data.issue_date || undefined,
        expiry_date: data.expiry_date || undefined,
        reminder_before_expiry_days:
          data.reminder_before_expiry_days ?? null,
        status: getOptionLabel(STATUS_OPTIONS, data.status) || getOptionLabel(STATUS_OPTIONS, 2),
        keywords: data.keywords?.trim() || undefined,
        remarks: data.remarks?.trim() || undefined,
      };

      if (documentToEdit) {
        await updateDocument({ id: documentToEdit.id, data: payload }).unwrap();
        toast.success("Document updated successfully");
      } else {
        await createDocument({
          ...payload,
          association_id: data.association_id,
          file_name: data.file_name || undefined,
          file_url: data.file_url,
          file_type: data.file_type || undefined,
          file_size_kb: data.file_size_kb ?? null,
        }).unwrap();
        toast.success("Document uploaded successfully");
      }

      onSuccess?.();
      onClose();
    } catch (err: any) {
      toast.error(
        err?.data?.detail || err?.message || "Failed to save document",
      );
    }
  };

  const fieldOrder: (keyof DocumentFormValues)[] = [
    "association_id",
    "title",
    "file_url",
    "document_type",
    "category",
    "visibility",
    "expiry_date",
    "department",
    "related_module",
    "status",
    "keywords",
    "remarks",
  ];
  const activeErrorKey = fieldOrder.find((key) => errors[key]);
  const getFieldError = (key: keyof DocumentFormValues) =>
    activeErrorKey === key ? errors[key]?.message : undefined;

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={isViewMode ? "View Document" : isEditMode ? "Edit Document" : "Upload Document"}
      subtitle="Store association records, policies, certificates, and other official files."
      icon={<FileText size={18} className="text-slate-800" />}
      size="2xl"
      isSubmitting={isViewMode ? false : isBusy}
      submitText={isEditMode ? "Update Document" : "Upload Document"}
      loadingText={isEditMode ? "Updating..." : "Uploading..."}
      submitDisabled={isViewMode ? true : !fileUrl}
      isForm={!isViewMode}
      onSubmit={isViewMode ? undefined : handleSubmit(onSubmit)}
      customFooter={
        isViewMode ? (
          <div className="flex w-full justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        ) : undefined
      }
    >
      <div className="space-y-6">
        <section className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {validAssociations.length > 0 ? (
              <FormField
                label="Association"
                required
                error={getFieldError("association_id")}
              >
                <Controller
                  name="association_id"
                  control={control}
                  render={({ field }) => (
                    <Select
                      icon={<Building2 size={15} />}
                      value={String(field.value || "")}
                      onValueChange={field.onChange}
                      options={validAssociations.map((association) => ({
                        value: String(association.id),
                        label: association.name,
                      }))}
                      placeholder="Select association..."
                      disabled={isDisabled || isEditMode}
                      error={Boolean(getFieldError("association_id"))}
                    />
                  )}
                />
              </FormField>
            ) : isViewMode ? (
              <FormField label="Association">
                <Input
                  value={documentToEdit?.association_name || documentToEdit?.association_id || ""}
                  readOnly
                  disabled
                />
              </FormField>
            ) : null}

            <FormField label="Document title" required error={getFieldError("title")}>
              <Input
                placeholder="Enter document title"
                maxLength={100}
                disabled={isDisabled}
                error={Boolean(getFieldError("title"))}
                {...register("title")}
              />
            </FormField>

            <FormField
              label="Document number"
              error={getFieldError("document_number")}
            >
              <Input
                placeholder="e.g. DOC-2026-001"
                maxLength={100}
                disabled={isDisabled}
                error={Boolean(getFieldError("document_number"))}
                {...register("document_number")}
              />
            </FormField>

            <FormField
              label="Document type"
              error={getFieldError("document_type")}
            >
              <Controller
                name="document_type"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value ? String(field.value) : ""}
                    onValueChange={(value) => {
                      field.onChange(Number(value));
                      setValue("category", undefined, { shouldTouch: true });
                    }}
                    options={DOCUMENT_TYPES.map((option) => ({
                      value: option.id,
                      label: option.label,
                    }))}
                    placeholder="Select type..."
                    disabled={isDisabled}
                    error={Boolean(getFieldError("document_type"))}
                  />
                )}
              />
            </FormField>

            {documentType ? (
              <FormField label="Category" error={getFieldError("category")}>
                <Controller
                  name="category"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value ? String(field.value) : ""}
                      onValueChange={(value) => field.onChange(Number(value))}
                      options={categoryOptions.map((option) => ({
                        value: option.id,
                        label: option.label,
                      }))}
                      placeholder="Select category..."
                      disabled={isDisabled}
                      error={Boolean(getFieldError("category"))}
                    />
                  )}
                />
              </FormField>
            ) : null}
          </div>
        </section>

        <section className="space-y-4 border-t border-slate-100 pt-5">
          <FormField
            label="Upload document"
            required
            error={getFieldError("file_url")}
            helperText="PDF, DOCX, XLSX, JPG, or PNG up to 10MB."
          >
            <FileUploadZone
              value={fileUrl}
              onChange={(value) => {
                setValue("file_url", value, {
                  shouldTouch: true,
                  shouldValidate: true,
                });
                if (!value) {
                  setValue("file_name", "");
                  setValue("file_type", "");
                  setValue("file_size_kb", null);
                }
              }}
              onUpload={handleUpload}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
              maxSizeMB={10}
              label="Upload a document"
              helperText="Drag and drop or choose a file"
              disabled={isDisabled}
              error={Boolean(getFieldError("file_url"))}
            />
          </FormField>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField label="File name">
              <Input readOnly className="bg-slate-50" {...register("file_name")} />
            </FormField>
            <FormField label="File type">
              <Input readOnly className="bg-slate-50" {...register("file_type")} />
            </FormField>
            <FormField label="File size (KB)">
              <Input
                readOnly
                className="bg-slate-50"
                {...register("file_size_kb")}
              />
            </FormField>
          </div>
        </section>

        <section className="space-y-4 border-t border-slate-100 pt-5">
          <FormField
            label="Visibility"
            required
            error={getFieldError("visibility")}
          >
            <div className="flex flex-wrap gap-2">
              {VISIBILITY_OPTIONS.map((option) => (
                <Checkbox
                  key={option.id}
                  checked={visibility.includes(option.id)}
                  onCheckedChange={(checked) => {
                    const next = checked
                      ? [...visibility, option.id]
                      : visibility.filter((id) => id !== option.id);
                    setValue("visibility", next, {
                      shouldTouch: true,
                      shouldValidate: true,
                    });
                  }}
                  label={option.label}
                  size="sm"
                  disabled={isDisabled}
                />
              ))}
            </div>
          </FormField>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField label="Issue date">
              <Controller
                name="issue_date"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    value={field.value || ""}
                    onChange={field.onChange}
                    onClear={() => field.onChange("")}
                    isClearable
                    disabled={isDisabled}
                    placeholder="Select issue date..."
                    valueFormat="yyyy-MM-dd"
                  />
                )}
              />
            </FormField>

            <FormField label="Expiry date" error={getFieldError("expiry_date")}>
              <Controller
                name="expiry_date"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    value={field.value || ""}
                    onChange={field.onChange}
                    onClear={() => field.onChange("")}
                    isClearable
                    disabled={isDisabled}
                    placeholder="Select expiry date..."
                    valueFormat="yyyy-MM-dd"
                    error={Boolean(getFieldError("expiry_date"))}
                  />
                )}
              />
            </FormField>

            <FormField label="Reminder (days before expiry)">
              <Input
                type="number"
                min={0}
                disabled={isDisabled}
                {...register("reminder_before_expiry_days", {
                  setValueAs: (value) => (value === "" ? null : Number(value)),
                })}
              />
            </FormField>
          </div>
        </section>

        <section className="space-y-4 border-t border-slate-100 pt-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField label="Department">
              <Input disabled={isDisabled} {...register("department")} />
            </FormField>

            <FormField label="Related module">
              <Controller
                name="related_module"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value ? String(field.value) : ""}
                    onValueChange={(value) => field.onChange(Number(value))}
                    options={MODULE_OPTIONS.map((option) => ({
                      value: option.id,
                      label: option.label,
                    }))}
                    placeholder="Select module..."
                    disabled={isDisabled}
                  />
                )}
              />
            </FormField>

            <FormField label="Status">
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select
                    value={String(field.value)}
                    onValueChange={(value) => field.onChange(Number(value))}
                    options={STATUS_OPTIONS.map((option) => ({
                      value: option.id,
                      label: option.label,
                    }))}
                    disabled={isDisabled}
                  />
                )}
              />
            </FormField>
          </div>

          <FormField label="Keywords">
            <Input
              placeholder="e.g. audit, 2026, compliance"
              disabled={isDisabled}
              {...register("keywords")}
            />
          </FormField>

          <FormField label="Remarks" error={getFieldError("remarks")}>
            <Textarea
              rows={3}
              placeholder="Any additional notes..."
              disabled={isDisabled}
              error={Boolean(getFieldError("remarks"))}
              {...register("remarks")}
            />
          </FormField>

          <Controller
            name="allow_download"
            control={control}
            render={({ field }) => (
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
                label="Allow download"
                disabled={isDisabled}
              />
            )}
          />
        </section>
      </div>
    </FormModal>
  );
};

export default DocumentFormModal;
