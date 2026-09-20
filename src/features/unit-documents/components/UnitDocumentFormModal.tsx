import React, { useEffect, useMemo } from "react";
import { Controller } from "react-hook-form";
import { Building2, FileText, Home, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import {
  FileUploadZone,
  FormField,
  FormModal,
} from "@/components/common";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAppForm } from "@/hooks/useAppForm";
import {
  uploadDocumentAsset,
  uploadMediaAsset,
} from "@/lib/cloudUploader";
import {
  useCreateUnitDocumentMutation,
  useGetUnitDocumentUnitsQuery,
  useUpdateUnitDocumentMutation,
} from "../api";
import {
  getUnitDocumentTypeId,
  getUnitDocumentTypeLabel,
  UNIT_DOCUMENT_TYPES,
} from "../constants";
import {
  unitDocumentSchema,
  type UnitDocumentFormValues,
} from "../schemas";
import type { UnitDocumentRecord } from "../types";

export interface UnitDocumentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  documentToEdit?: UnitDocumentRecord | null;
  associations?: Array<{ id: string | number; name: string }>;
  selectedAssociationId?: string | number;
  isAdmin: boolean;
  mode?: "edit" | "view";
}

const emptyValues = (associationId = ""): UnitDocumentFormValues => ({
  association_id: String(associationId || ""),
  unit_id: "",
  name: "",
  type_id: null,
  description: "",
  file_name: "",
  file_url: "",
  file_type: "",
  file_size_kb: null,
});

export const UnitDocumentFormModal: React.FC<
  UnitDocumentFormModalProps
> = ({
  isOpen,
  onClose,
  onSuccess,
  documentToEdit,
  associations = [],
  selectedAssociationId,
  isAdmin,
  mode = "edit",
}) => {
  const [createUnitDocument, { isLoading: isCreating }] =
    useCreateUnitDocumentMutation();
  const [updateUnitDocument, { isLoading: isUpdating }] =
    useUpdateUnitDocumentMutation();

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useAppForm<UnitDocumentFormValues>({
    schema: unitDocumentSchema,
    defaultValues: emptyValues(),
  });

  const isViewMode = mode === "view";
  const isEditMode = Boolean(documentToEdit) && !isViewMode;
  const associationId = watch("association_id");
  const selectedUnitId = watch("unit_id");
  const fileUrl = watch("file_url");
  const isBusy = isCreating || isUpdating || isSubmitting;
  const isDisabled = isBusy || isViewMode;
  const validAssociations = useMemo(
    () => associations.filter((association) => String(association.id) !== "ALL"),
    [associations],
  );

  const {
    data: units = [],
    isLoading: isLoadingUnits,
  } = useGetUnitDocumentUnitsQuery(associationId, {
    skip: !isAdmin || !associationId,
  });

  const unitOptions = useMemo(() => {
    const options = units.map((unit) => ({
      value: String(unit.id),
      label: unit.block_name
        ? `${unit.block_name} - ${unit.unit_number}`
        : unit.unit_number,
    }));
    const hasSelectedUnit = options.some(
      (option) => option.value === selectedUnitId,
    );

    if (documentToEdit && selectedUnitId && !hasSelectedUnit) {
      options.push({
        value: selectedUnitId,
        label: documentToEdit.unit_number
          ? `Unit ${documentToEdit.unit_number}`
          : "Selected unit",
      });
    }

    return options;
  }, [documentToEdit, selectedUnitId, units]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (!documentToEdit) {
      reset(emptyValues(String(selectedAssociationId || "")));
      return;
    }

    reset({
      association_id: String(documentToEdit.association_id || ""),
      unit_id: String(documentToEdit.unit_id || ""),
      name: documentToEdit.name || "",
      type_id:
        getUnitDocumentTypeId(documentToEdit.type) ||
        null,
      description: documentToEdit.description || "",
      file_name: documentToEdit.file_name || "",
      file_url: documentToEdit.file_url || "",
      file_type: documentToEdit.file_type || "",
      file_size_kb: documentToEdit.file_size_kb ?? null,
    });
  }, [documentToEdit, isOpen, reset, selectedAssociationId]);

  const handleFileUpload = async (file: File) => {
    const isImage = file.type ? file.type.startsWith("image/") : false;
    const response = isImage
      ? await uploadMediaAsset(file)
      : await uploadDocumentAsset(file);

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

  const onSubmit = async (data: UnitDocumentFormValues) => {
    if (isAdmin && !data.association_id?.trim()) {
      toast.error("Please select an association");
      return;
    }
    const documentType = getUnitDocumentTypeLabel(data.type_id);

    if (!documentType) {
      toast.error("Please select a valid document type");
      return;
    }

    try {
      const editableData = {
        name: data.name.trim(),
        type: documentType,
        description: data.description?.trim() || undefined,
      };

      if (documentToEdit) {
        await updateUnitDocument({
          id: documentToEdit.id,
          data: editableData,
        }).unwrap();
        toast.success("Unit document updated successfully");
      } else {
        await createUnitDocument({
          ...editableData,
          association_id: data.association_id || undefined,
          unit_id: data.unit_id || undefined,
          file_name: data.file_name || undefined,
          file_url: data.file_url,
          file_type: data.file_type || undefined,
          file_size_kb: data.file_size_kb ?? null,
        }).unwrap();
        toast.success("Unit document uploaded successfully");
      }

      onSuccess?.();
      onClose();
    } catch (err: any) {
      toast.error(
        err?.data?.detail || err?.message || "Failed to save unit document",
      );
    }
  };

  const fieldOrder: (keyof UnitDocumentFormValues)[] = [
    "association_id",
    "unit_id",
    "name",
    "type_id",
    "description",
    "file_url",
  ];
  const activeErrorKey = fieldOrder.find((key) => errors[key]);
  const getFieldError = (key: keyof UnitDocumentFormValues) =>
    activeErrorKey === key ? errors[key]?.message : undefined;

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={isViewMode ? "View Unit Document" : isEditMode ? "Edit Unit Document" : "Upload Unit Document"}
      subtitle="Manage title deeds, insurance records, plans, and other unit-specific files."
      icon={<Home size={18} className="text-slate-800" />}
      size="2xl"
      isSubmitting={isViewMode ? false : isBusy}
      submitText={isEditMode ? "Update Document" : "Upload Document"}
      loadingText={isEditMode ? "Updating..." : "Uploading..."}
      submitDisabled={isViewMode ? true : isEditMode ? false : !fileUrl}
      isForm={!isViewMode}
      onSubmit={
        isViewMode
          ? undefined
          : handleSubmit(onSubmit, (validationErrors) => {
              const firstError = Object.values(validationErrors)[0];
              toast.error(
                String(firstError?.message || "Please complete the required fields"),
              );
            })
      }
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
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            <FileText size={15} className="text-indigo-500" />
            Document information
          </div>

          {isAdmin ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      value={field.value || ""}
                      onValueChange={(value) => {
                        field.onChange(value);
                        setValue("unit_id", "", { shouldTouch: true });
                      }}
                      options={validAssociations.map((association) => ({
                        value: String(association.id),
                        label: association.name,
                      }))}
                      placeholder="Select association"
                      disabled={isDisabled || isEditMode}
                      error={Boolean(getFieldError("association_id"))}
                    />
                  )}
                />
              </FormField>

              <FormField label="Unit" error={getFieldError("unit_id")}>
                <Controller
                  name="unit_id"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value || ""}
                      onValueChange={field.onChange}
                      options={unitOptions}
                      showAllOption
                      allOptionLabel="All Units"
                      allOptionValue=""
                      placeholder={
                        isLoadingUnits ? "Loading units..." : "Select unit..."
                      }
                      disabled={
                        isDisabled || isEditMode || !associationId || isLoadingUnits
                      }
                      error={Boolean(getFieldError("unit_id"))}
                    />
                  )}
                />
              </FormField>
            </div>
          ) : isViewMode ? (
            <FormField label="Association">
              <Input
                value={documentToEdit?.association_name || documentToEdit?.association_id || ""}
                readOnly
                disabled
              />
            </FormField>
          ) : null}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Document name"
              required
              error={getFieldError("name")}
            >
              <Input
                placeholder="Enter document name"
                maxLength={100}
                disabled={isDisabled}
                error={Boolean(getFieldError("name"))}
                {...register("name")}
              />
            </FormField>

            <FormField
              label="Document type"
              required
              error={getFieldError("type_id")}
            >
              <Controller
                name="type_id"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value ? String(field.value) : ""}
                    onValueChange={(value) => field.onChange(Number(value))}
                    options={UNIT_DOCUMENT_TYPES.map((option) => ({
                      value: option.id,
                      label: option.label,
                    }))}
                    placeholder="Select document type..."
                    disabled={isDisabled}
                    error={Boolean(getFieldError("type_id"))}
                  />
                )}
              />
            </FormField>
          </div>

          <FormField
            label="Description"
            error={getFieldError("description")}
          >
            <Textarea
              rows={3}
              maxLength={1000}
              placeholder="Enter document description"
              disabled={isDisabled}
              error={Boolean(getFieldError("description"))}
              {...register("description")}
            />
          </FormField>
        </section>

        {!documentToEdit ? (
          <section className="space-y-4 border-t border-slate-100 pt-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
              <UploadCloud size={15} className="text-emerald-500" />
              File information
            </div>

            <FormField
              label="Upload file"
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
                onUpload={handleFileUpload}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                maxSizeMB={10}
                label="Upload a unit document"
                helperText="Drag and drop or choose a file"
                disabled={isDisabled}
                error={Boolean(getFieldError("file_url"))}
              />
            </FormField>
          </section>
        ) : isViewMode ? (
          <section className="space-y-4 border-t border-slate-100 pt-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
              <UploadCloud size={15} className="text-emerald-500" />
              File information
            </div>

            <FileUploadZone
              value={fileUrl}
              onChange={() => undefined}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
              maxSizeMB={10}
              label="Unit document"
              helperText="Uploaded file"
              disabled
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="File name">
                <Input
                  value={documentToEdit?.file_name || ""}
                  readOnly
                  disabled
                />
              </FormField>
              <FormField label="File type">
                <Input
                  value={documentToEdit?.file_type || ""}
                  readOnly
                  disabled
                />
              </FormField>
              <FormField label="File size (KB)">
                <Input
                  value={documentToEdit?.file_size_kb ?? ""}
                  readOnly
                  disabled
                />
              </FormField>
            </div>
          </section>
        ) : null}
      </div>
    </FormModal>
  );
};

export default UnitDocumentFormModal;
