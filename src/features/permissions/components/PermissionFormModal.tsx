import React, { useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ShieldCheck } from "lucide-react";
import { FormModal } from "@/components/common/FormModal";
import { FormField } from "@/components/common/FormField";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useGetRolesQuery } from "@/features/roles/api/rolesApi";
import { useGetFeaturesQuery } from "@/features/features/api/featuresApi";
import {
  useCreatePermissionMutation,
  useUpdatePermissionMutation,
} from "../api/permissionsApi";
import {
  permissionSchema,
  type PermissionFormData,
} from "../schemas/permissionSchema";
import type { Permission } from "../types";

export interface PermissionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  permissionToEdit?: Permission | null;
  onSuccess?: () => void;
}

export const PermissionFormModal: React.FC<PermissionFormModalProps> = ({
  isOpen,
  onClose,
  permissionToEdit,
  onSuccess,
}) => {
  const { data: roles = [], isLoading: isRolesLoading } = useGetRolesQuery(
    undefined,
    { skip: !isOpen }
  );
  const { data: features = [], isLoading: isFeaturesLoading } =
    useGetFeaturesQuery(undefined, { skip: !isOpen });

  const [createPermission, { isLoading: isCreating }] =
    useCreatePermissionMutation();
  const [updatePermission, { isLoading: isUpdating }] =
    useUpdatePermissionMutation();

  const isSubmitting = isCreating || isUpdating;
  const isEditMode = Boolean(permissionToEdit);

  const {
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm<PermissionFormData>({
    resolver: zodResolver(permissionSchema),
    defaultValues: {
      role_id: "",
      feature_id: "",
      can_create: false,
      can_view: true,
      can_update: false,
      can_delete: false,
    },
  });

  // Format role select options
  const roleOptions = useMemo(() => {
    return roles
      .filter((r) => Boolean(r.id))
      .map((role) => ({
        value: String(role.id),
        label: `${role.name}${role.entity_name ? ` (${role.entity_name})` : ""}`,
      }));
  }, [roles]);

  // Format feature select options (hierarchical display)
  const featureOptions = useMemo(() => {
    return features
      .filter((f) => Boolean(f.id))
      .map((feat) => ({
        value: String(feat.id),
        label: `${feat.parent_name ? `${feat.parent_name} → ` : ""}${feat.name}`,
      }));
  }, [features]);

  useEffect(() => {
    if (isOpen) {
      if (permissionToEdit) {
        reset({
          role_id: permissionToEdit.role_id || "",
          feature_id: permissionToEdit.feature_id || "",
          can_create: Boolean(Number(permissionToEdit.can_create)),
          can_view: Boolean(Number(permissionToEdit.can_view)),
          can_update: Boolean(Number(permissionToEdit.can_update)),
          can_delete: Boolean(Number(permissionToEdit.can_delete)),
        });
      } else {
        reset({
          role_id: "",
          feature_id: "",
          can_create: false,
          can_view: true,
          can_update: false,
          can_delete: false,
        });
      }
    }
  }, [isOpen, permissionToEdit, reset]);

  const handleToggleAll = (enable: boolean) => {
    setValue("can_create", enable, { shouldDirty: true, shouldValidate: true });
    setValue("can_view", enable, { shouldDirty: true, shouldValidate: true });
    setValue("can_update", enable, { shouldDirty: true, shouldValidate: true });
    setValue("can_delete", enable, { shouldDirty: true, shouldValidate: true });
  };

  const onSubmit = async (data: PermissionFormData) => {
    const payload = {
      role_id: data.role_id,
      feature_id: data.feature_id,
      can_create: Boolean(data.can_create),
      can_view: Boolean(data.can_view),
      can_update: Boolean(data.can_update),
      can_delete: Boolean(data.can_delete),
    };

    try {
      if (isEditMode && permissionToEdit) {
        await updatePermission({
          id: permissionToEdit.id,
          data: payload,
        }).unwrap();
        toast.success("Permission rule updated successfully");
      } else {
        await createPermission(payload).unwrap();
        toast.success("Permission rule created successfully");
      }

      onSuccess?.();
      onClose();
    } catch (err: any) {
      toast.error(
        err.data?.detail ||
          err.data ||
          err.message ||
          `Failed to ${isEditMode ? "update" : "create"} permission rule`
      );
    }
  };

  const fieldOrder: (keyof PermissionFormData)[] = ["role_id", "feature_id"];
  const activeErrorKey = fieldOrder.find((key) => errors[key]);
  const getFieldError = (key: keyof PermissionFormData) =>
    activeErrorKey === key ? errors[key]?.message : undefined;

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? "Edit Permission Rule" : "Add Permission Rule"}
      icon={<ShieldCheck size={18} className="text-slate-800" />}
      size="md"
      isSubmitting={isSubmitting}
      submitText="Save Changes"
      loadingText="Saving Changes..."
      submitVariant="default"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="space-y-4">
        {/* Role Select */}
        <FormField
          label="Role"
          required
          helperText="Select which role receives these permissions"
          error={getFieldError("role_id")}
        >
          <Controller
            name="role_id"
            control={control}
            render={({ field }) => (
              <Select
                options={roleOptions}
                value={field.value || ""}
                onValueChange={field.onChange}
                placeholder={
                  isRolesLoading ? "Loading roles..." : "Select a role..."
                }
                disabled={isSubmitting || isRolesLoading}
                error={Boolean(getFieldError("role_id"))}
              />
            )}
          />
        </FormField>

        {/* Feature Select */}
        <FormField
          label="Feature Module"
          required
          helperText="Select the target system module or screen"
          error={getFieldError("feature_id")}
        >
          <Controller
            name="feature_id"
            control={control}
            render={({ field }) => (
              <Select
                options={featureOptions}
                value={field.value || ""}
                onValueChange={field.onChange}
                placeholder={
                  isFeaturesLoading
                    ? "Loading features..."
                    : "Select a feature module..."
                }
                disabled={isSubmitting || isFeaturesLoading}
                error={Boolean(getFieldError("feature_id"))}
              />
            )}
          />
        </FormField>

        {/* CRUD Actions */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">
              CRUD Privileges
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleToggleAll(true)}
                disabled={isSubmitting}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium hover:underline cursor-pointer disabled:opacity-50"
              >
                Select All
              </button>
              <span className="text-slate-300">|</span>
              <button
                type="button"
                onClick={() => handleToggleAll(false)}
                disabled={isSubmitting}
                className="text-xs text-slate-500 hover:text-slate-700 font-medium hover:underline cursor-pointer disabled:opacity-50"
              >
                Clear
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {/* Create */}
            <div className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-colors">
              <Controller
                name="can_create"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    id="perm-can-create"
                    label="Create"
                    description="Allow adding new records"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isSubmitting}
                  />
                )}
              />
            </div>

            {/* View / Read */}
            <div className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-colors">
              <Controller
                name="can_view"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    id="perm-can-view"
                    label="View / Read"
                    description="Allow viewing and listing records"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isSubmitting}
                  />
                )}
              />
            </div>

            {/* Edit / Update */}
            <div className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-colors">
              <Controller
                name="can_update"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    id="perm-can-update"
                    label="Edit / Update"
                    description="Allow editing existing records"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isSubmitting}
                  />
                )}
              />
            </div>

            {/* Delete */}
            <div className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-colors">
              <Controller
                name="can_delete"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    id="perm-can-delete"
                    label="Delete"
                    description="Allow deleting records permanently"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isSubmitting}
                  />
                )}
              />
            </div>
          </div>
        </div>
      </div>
    </FormModal>
  );
};

export default PermissionFormModal;
