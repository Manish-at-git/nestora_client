import React, { useEffect, useMemo } from "react";
import { Controller } from "react-hook-form";
import { toast } from "sonner";
import { Shield, Building2 } from "lucide-react";
import { FormModal } from "@/components/common/FormModal";
import { FormField } from "@/components/common/FormField";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useAppForm } from "@/hooks/useAppForm";
import { formatApiErrorDetail } from "@/services/api/apiClient";
import {
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useGetEntitiesForRolesQuery,
} from "../api/rolesApi";
import { roleSchema, type RoleFormData } from "../schemas/roleSchema";
import type { Role } from "../types";

export interface RoleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  roleToEdit?: Role | null;
  onSuccess?: () => void;
}

export const RoleFormModal: React.FC<RoleFormModalProps> = ({
  isOpen,
  onClose,
  roleToEdit,
  onSuccess,
}) => {
  const { data: entities = [], isLoading: isEntitiesLoading } =
    useGetEntitiesForRolesQuery(undefined, { skip: !isOpen });

  const [createRole, { isLoading: isCreating }] = useCreateRoleMutation();
  const [updateRole, { isLoading: isUpdating }] = useUpdateRoleMutation();

  const isSubmitting = isCreating || isUpdating;
  const isEditMode = Boolean(roleToEdit);

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    clearErrors,
    formState: { errors },
  } = useAppForm<RoleFormData>({
    schema: roleSchema,
    defaultValues: {
      name: "",
      code: "",
      description: "",
      entity_id: "",
      is_active: true,
    },
  });

  const entityOptions = useMemo(() => {
    return [
      { value: "global", label: "Global Role (System-wide)" },
      ...(Array.isArray(entities) ? entities : [])
        .filter((e) => Boolean(e?.id))
        .map((e) => ({
          value: String(e.id),
          label: e.name,
        })),
    ];
  }, [entities]);

  useEffect(() => {
    if (isOpen) {
      if (roleToEdit) {
        reset({
          name: roleToEdit.name || "",
          code: roleToEdit.code || "",
          description: roleToEdit.description || "",
          entity_id: roleToEdit.entity_id || "global",
          is_active: Boolean(roleToEdit.is_active),
        });
      } else {
        reset({
          name: "",
          code: "",
          description: "",
          entity_id: "",
          is_active: true,
        });
      }
    }
  }, [isOpen, roleToEdit, reset]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setValue("name", newName, { shouldValidate: false, shouldDirty: true });
    if (errors.name && newName.trim()) {
      clearErrors("name");
    }
    // In Add mode, auto-suggest lowercase code slug
    if (!isEditMode) {
      const suggestedCode = newName
        .toLowerCase()
        .replace(/[^a-z0-9_-]+/g, "_")
        .replace(/^_+|_+$/g, "");
      setValue("code", suggestedCode, { shouldValidate: false, shouldDirty: true });
      if (errors.code && suggestedCode.trim()) {
        clearErrors("code");
      }
    }
  };

  const onSubmit = async (data: RoleFormData) => {
    const payload = {
      name: data.name.trim(),
      code: data.code.trim().toLowerCase(),
      description: data.description?.trim() || undefined,
      entity_id: data.entity_id && data.entity_id !== "global" ? data.entity_id : undefined,
      is_active: data.is_active,
    };

    try {
      if (isEditMode && roleToEdit) {
        await updateRole({ id: roleToEdit.id, data: payload }).unwrap();
        toast.success(`Role "${payload.name}" updated successfully`);
      } else {
        await createRole(payload).unwrap();
        toast.success(`Role "${payload.name}" created successfully`);
      }

      onSuccess?.();
      onClose();
    } catch (err: any) {
      toast.error(
        formatApiErrorDetail(
          err.data || err.message || `Failed to ${isEditMode ? "update" : "create"} role`
        )
      );
    }
  };

  const fieldOrder: (keyof RoleFormData)[] = [
    "name",
    "code",
    "entity_id",
    "description",
  ];
  const activeErrorKey = fieldOrder.find((key) => errors[key]);
  const getFieldError = (key: keyof RoleFormData) =>
    activeErrorKey === key ? errors[key]?.message : undefined;

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? "Edit Role" : "Add Role"}
      icon={<Shield size={18} className="text-slate-800" />}
      size="md"
      isSubmitting={isSubmitting}
      submitText="Save Changes"
      loadingText="Saving Changes..."
      submitVariant="default"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="space-y-4">
        {/* Role Name */}
        <FormField label="Role Name" required error={getFieldError("name")}>
          <Input
            placeholder="e.g. Facilities Manager, Inspector, Legal Advisor"
            disabled={isSubmitting}
            autoFocus
            {...register("name")}
            onChange={handleNameChange}
          />
        </FormField>

        {/* Role Code */}
        <FormField
          label="Role Code"
          required
          helperText="Unique system identifier for RBAC access control (alphanumeric, _ or - only)"
          error={getFieldError("code")}
        >
          <Input
            placeholder="e.g. facilities_manager, inspector, legal_advisor"
            disabled={isSubmitting}
            className="font-mono text-sm lowercase"
            {...register("code")}
            onChange={(e) => {
              const val = e.target.value.toLowerCase();
              setValue("code", val, { shouldValidate: false, shouldDirty: true });
              if (errors.code && val.trim()) {
                clearErrors("code");
              }
            }}
          />
        </FormField>

        {/* Entity Scope (Optional) */}
        <FormField
          label="Entity Scope (Optional)"
          helperText="Optionally restrict this role to a specific business entity (or leave Global)"
          error={getFieldError("entity_id")}
        >
          <Controller
            name="entity_id"
            control={control}
            render={({ field }) => (
              <Select
                icon={<Building2 size={15} />}
                options={entityOptions}
                value={field.value || ""}
                onValueChange={field.onChange}
                placeholder={
                  isEntitiesLoading
                    ? "Loading entities..."
                    : "Select entity scope..."
                }
                disabled={isSubmitting || isEntitiesLoading}
                error={Boolean(getFieldError("entity_id"))}
              />
            )}
          />
        </FormField>

        {/* Description */}
        <FormField
          label="Description"
          helperText="Summarize responsibilities and privileges"
          error={getFieldError("description")}
        >
          <Textarea
            placeholder="Enter a brief summary of what accounts with this role can manage..."
            rows={3}
            disabled={isSubmitting}
            className="resize-none"
            {...register("description")}
          />
        </FormField>

        {/* Active Status */}
        <div className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-colors">
          <Controller
            name="is_active"
            control={control}
            render={({ field }) => (
              <Checkbox
                id="role-is-active-checkbox"
                label="Active Role"
                description="Active roles can be assigned to staff, admins, and members"
                checked={field.value}
                onCheckedChange={field.onChange}
                disabled={isSubmitting}
              />
            )}
          />
        </div>
      </div>
    </FormModal>
  );
};

export default RoleFormModal;
