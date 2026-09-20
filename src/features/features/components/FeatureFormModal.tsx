import React, { useEffect, useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { LayoutGrid, Upload, Trash2, Link as LinkIcon } from "lucide-react";
import { FormModal } from "@/components/common/FormModal";
import { FormField } from "@/components/common/FormField";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  useCreateFeatureMutation,
  useUpdateFeatureMutation,
  useGetFeaturesQuery,
} from "../api/featuresApi";
import { featureSchema, type FeatureFormData } from "../schemas/featureSchema";
import type { Feature } from "../types";
import { formatApiErrorDetail } from "@/services/api/apiClient";
import { uploadMediaAsset } from "@/lib/cloudUploader";

export interface FeatureFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureToEdit?: Feature | null;
  onSuccess?: () => void;
}

export const FeatureFormModal: React.FC<FeatureFormModalProps> = ({
  isOpen,
  onClose,
  featureToEdit,
  onSuccess,
}) => {
  const { data: allFeatures = [], isLoading: isFeaturesLoading } =
    useGetFeaturesQuery(undefined, { skip: !isOpen });

  const [createFeature, { isLoading: isCreating }] = useCreateFeatureMutation();
  const [updateFeature, { isLoading: isUpdating }] = useUpdateFeatureMutation();
  const [isUploadingIcon, setIsUploadingIcon] = useState(false);

  const isSaving = isCreating || isUpdating;
  const isEditMode = Boolean(featureToEdit);

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FeatureFormData>({
    resolver: zodResolver(featureSchema),
    defaultValues: {
      name: "",
      code: "",
      description: "",
      parent_id: "",
      url: "",
      icon: "",
      is_active: true,
    },
  });

  const currentIcon = watch("icon");
  const watchName = watch("name");

  // Available parent options (exclude the current feature to avoid cycles)
  const parentOptions = useMemo(() => {
    return [
      { value: "root", label: "Top-level (Root Module)" },
      ...allFeatures
        .filter((f) => Boolean(f?.id) && (!featureToEdit || f.id !== featureToEdit.id))
        .map((f) => ({
          value: String(f.id),
          label: f.name,
        })),
    ];
  }, [allFeatures, featureToEdit]);

  useEffect(() => {
    if (isOpen) {
      if (featureToEdit) {
        reset({
          name: featureToEdit.name || "",
          code: featureToEdit.code || "",
          description: featureToEdit.description || "",
          parent_id: featureToEdit.parent_id || "root",
          url: featureToEdit.url || "",
          icon: featureToEdit.icon || "",
          is_active: Boolean(featureToEdit.is_active),
        });
      } else {
        reset({
          name: "",
          code: "",
          description: "",
          parent_id: "",
          url: "",
          icon: "",
          is_active: true,
        });
      }
    }
  }, [isOpen, featureToEdit, reset]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setValue("name", newName, { shouldValidate: true });
    // In Add mode, auto-suggest code slug if code hasn't been manually customized
    if (!isEditMode) {
      const suggestedCode = newName
        .toLowerCase()
        .replace(/[^a-z0-9_-]+/g, "_")
        .replace(/^_+|_+$/g, "");
      setValue("code", suggestedCode, { shouldValidate: false });
    }
  };

  const handleIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith(".svg") && file.type !== "image/svg+xml") {
        toast.error("Please upload an SVG file (.svg only).");
        return;
      }
      setIsUploadingIcon(true);
      try {
        const result = await uploadMediaAsset(file);
        setValue("icon", result.url, { shouldDirty: true });
        toast.success("Feature icon uploaded successfully");
      } catch (err: any) {
        toast.error(formatApiErrorDetail(err?.response?.data || err?.message || "Failed to upload feature icon"));
      } finally {
        setIsUploadingIcon(false);
        e.target.value = "";
      }
    }
  };

  const onSubmit = async (data: FeatureFormData) => {
    const payload = {
      name: data.name.trim(),
      code: data.code.trim().toLowerCase(),
      description: data.description?.trim() || undefined,
      parent_id: data.parent_id && data.parent_id !== "root" ? data.parent_id : undefined,
      url: data.url?.trim() || undefined,
      icon: data.icon || undefined,
      is_active: data.is_active,
    };

    try {
      if (isEditMode && featureToEdit) {
        await updateFeature({ id: featureToEdit.id, data: payload }).unwrap();
        toast.success(`Feature "${payload.name}" updated successfully`);
      } else {
        await createFeature(payload).unwrap();
        toast.success(`Feature "${payload.name}" created successfully`);
      }

      onSuccess?.();
      onClose();
    } catch (err: any) {
      toast.error(
        formatApiErrorDetail(
          err?.data || err?.message || `Failed to ${isEditMode ? "update" : "create"} feature`
        )
      );
    }
  };

  const fieldOrder: (keyof FeatureFormData)[] = [
    "name",
    "code",
    "parent_id",
    "url",
    "description",
    "icon",
  ];
  const activeErrorKey = fieldOrder.find((key) => errors[key]);
  const getFieldError = (key: keyof FeatureFormData) =>
    activeErrorKey === key ? errors[key]?.message : undefined;

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? "Edit Feature" : "Add Feature"}
      icon={<LayoutGrid size={18} className="text-slate-800" />}
      size="lg"
      isSubmitting={isSaving}
      submitDisabled={isUploadingIcon}
      submitText="Save Changes"
      loadingText="Saving Changes..."
      submitVariant="default"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="space-y-4">
        {/* Feature Name */}
        <FormField label="Feature Name" required error={getFieldError("name")}>
          <Input
            placeholder="e.g. Board Governance, Asset Registry, Gate Security"
            disabled={isSaving}
            autoFocus
            {...register("name")}
            onChange={handleNameChange}
          />
        </FormField>

        {/* Feature Code */}
        <FormField
          label="Feature Code"
          required
          helperText="Unique identifier for RBAC permissions & API routing (alphanumeric, _ or - only)"
          error={getFieldError("code")}
        >
          <Input
            placeholder="e.g. board_governance, asset_registry, gate_security"
            disabled={isSaving}
            className="font-mono text-sm lowercase"
            {...register("code")}
            onChange={(e) =>
              setValue("code", e.target.value.toLowerCase(), { shouldValidate: true })
            }
          />
        </FormField>

        {/* Parent Feature Hierarchy */}
        <FormField
          label="Parent Feature (Optional)"
          helperText="Nest under an existing root module for hierarchical navigation"
          error={getFieldError("parent_id")}
        >
          <Controller
            name="parent_id"
            control={control}
            render={({ field }) => (
              <Select
                icon={<LayoutGrid size={15} />}
                options={parentOptions}
                value={field.value || ""}
                onValueChange={field.onChange}
                placeholder={
                  isFeaturesLoading ? "Loading features..." : "Select parent feature..."
                }
                disabled={isSaving || isFeaturesLoading}
                error={Boolean(getFieldError("parent_id"))}
              />
            )}
          />
        </FormField>

        {/* URL / Navigation Route */}
        <FormField
          label="URL / Navigation Route"
          helperText="Client route path (e.g. /board-tasks)"
          error={getFieldError("url")}
        >
          <Input
            icon={<LinkIcon size={14} className="text-slate-400" />}
            placeholder="/board-tasks"
            disabled={isSaving}
            className="font-mono text-sm"
            {...register("url")}
          />
        </FormField>

        {/* Description */}
        <FormField
          label="Description"
          helperText="Brief overview of module capabilities and scope"
          error={getFieldError("description")}
        >
          <Textarea
            placeholder="Brief overview of module capabilities and scope..."
            rows={2}
            disabled={isSaving}
            className="resize-none"
            {...register("description")}
          />
        </FormField>

        {/* SVG Icon Upload */}
        <FormField
          label="Feature Icon (.svg only)"
          helperText="Upload an SVG icon for menu visualization"
          error={getFieldError("icon")}
        >
          <div className="flex items-center gap-3">
            {currentIcon ? (
              <div className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-200 bg-slate-50 w-full justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center p-1">
                    <img
                      src={currentIcon}
                      alt="Icon preview"
                      className="w-5 h-5 object-contain"
                    />
                  </div>
                  <span className="text-xs text-slate-700 font-medium">
                    SVG Icon Selected
                  </span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setValue("icon", "", { shouldDirty: true })}
                  className="h-7 w-7 p-0 text-red-500 hover:bg-red-50 rounded-lg cursor-pointer"
                  title="Remove Icon"
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            ) : (
              <label className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl border border-dashed border-slate-300 hover:border-slate-400 bg-slate-50/50 hover:bg-slate-50 text-slate-600 text-xs font-medium cursor-pointer transition-colors">
                <Upload size={15} />
                <span>Upload .svg icon</span>
                <input
                  type="file"
                  accept=".svg,image/svg+xml"
                  onChange={handleIconUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </FormField>

        {/* Active Toggle */}
        <div className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-colors">
          <Controller
            name="is_active"
            control={control}
            render={({ field }) => (
              <Checkbox
                id="feature-is-active-checkbox"
                label="Active Status"
                description="Active features are visible and eligible for permission assignment"
                checked={field.value}
                onCheckedChange={field.onChange}
                  disabled={isSaving}
              />
            )}
          />
        </div>
      </div>
    </FormModal>
  );
};

export default FeatureFormModal;
