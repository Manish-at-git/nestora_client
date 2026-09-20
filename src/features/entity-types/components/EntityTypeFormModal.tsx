import React, { useEffect } from "react";
import { toast } from "sonner";
import { Layers } from "lucide-react";
import { FormModal } from "@/components/common/FormModal";
import { FormField } from "@/components/common/FormField";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAppForm } from "@/hooks/useAppForm";
import { formatApiErrorDetail } from "@/services/api/apiClient";
import {
  useCreateEntityTypeMutation,
  useUpdateEntityTypeMutation,
} from "../api/entityTypesApi";
import {
  entityTypeSchema,
  type EntityTypeFormData,
} from "../schemas/entityTypeSchema";
import type { EntityType } from "../types";

export interface EntityTypeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityTypeToEdit?: EntityType | null;
  onSuccess?: () => void;
}

export const EntityTypeFormModal: React.FC<EntityTypeFormModalProps> = ({
  isOpen,
  onClose,
  entityTypeToEdit,
  onSuccess,
}) => {
  const [createEntityType, { isLoading: isCreating }] =
    useCreateEntityTypeMutation();
  const [updateEntityType, { isLoading: isUpdating }] =
    useUpdateEntityTypeMutation();

  const isSubmitting = isCreating || isUpdating;
  const isEditMode = Boolean(entityTypeToEdit);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useAppForm<EntityTypeFormData>({
    schema: entityTypeSchema,
    defaultValues: {
      name: "",
      description: "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        name: entityTypeToEdit?.name || "",
        description: entityTypeToEdit?.description || "",
      });
    }
  }, [isOpen, entityTypeToEdit, reset]);

  const onSubmit = async (data: EntityTypeFormData) => {
    try {
      if (isEditMode && entityTypeToEdit) {
        await updateEntityType({
          id: entityTypeToEdit.id,
          data: {
            name: data.name.trim(),
            description: data.description?.trim() || undefined,
          },
        }).unwrap();
        toast.success("Entity type updated successfully");
      } else {
        await createEntityType({
          name: data.name.trim(),
          description: data.description?.trim() || undefined,
        }).unwrap();
        toast.success("Entity type created successfully");
      }

      onSuccess?.();
      onClose();
    } catch (err: any) {
      toast.error(
        formatApiErrorDetail(err.data || err.message || "Failed to save entity type")
      );
    }
  };

  const fieldOrder: (keyof EntityTypeFormData)[] = ["name", "description"];
  const activeErrorKey = fieldOrder.find((key) => errors[key]);
  const getFieldError = (key: keyof EntityTypeFormData) =>
    activeErrorKey === key ? errors[key]?.message : undefined;

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? "Edit Entity Type" : "Add Entity Type"}
      icon={<Layers size={18} className="text-slate-800" />}
      size="md"
      isSubmitting={isSubmitting}
      submitText="Save Changes"
      loadingText="Saving Changes..."
      submitVariant="default"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="space-y-4">
        <FormField label="Name" required error={getFieldError("name")}>
          <Input
            placeholder="e.g. HOA, Condominium, Co-Op"
            disabled={isSubmitting}
            autoFocus
            {...register("name")}
          />
        </FormField>

        <FormField label="Description" error={getFieldError("description")}>
          <Textarea
            placeholder="Enter a brief description of this entity classification..."
            disabled={isSubmitting}
            rows={3}
            {...register("description")}
          />
        </FormField>
      </div>
    </FormModal>
  );
};

export default EntityTypeFormModal;
