import React, { useEffect, useMemo } from "react";
import { Controller } from "react-hook-form";
import { toast } from "sonner";
import { Building, Layers } from "lucide-react";
import { FormModal } from "@/components/common/FormModal";
import { FormField } from "@/components/common/FormField";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { useAppForm } from "@/hooks/useAppForm";
import { formatApiErrorDetail } from "@/services/api/apiClient";
import {
  useCreateEntityMutation,
  useUpdateEntityMutation,
  useGetEntityTypesForEntitiesQuery,
} from "../api/entitiesApi";
import { entitySchema, type EntityFormData } from "../schemas/entitySchema";
import type { Entity } from "../types";

export interface EntityFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityToEdit?: Entity | null;
  onSuccess?: () => void;
}

export const EntityFormModal: React.FC<EntityFormModalProps> = ({
  isOpen,
  onClose,
  entityToEdit,
  onSuccess,
}) => {
  const { data: entityTypes = [], isLoading: isTypesLoading } =
    useGetEntityTypesForEntitiesQuery();

  const [createEntity, { isLoading: isCreating }] = useCreateEntityMutation();
  const [updateEntity, { isLoading: isUpdating }] = useUpdateEntityMutation();

  const isSubmitting = isCreating || isUpdating;
  const isEditMode = Boolean(entityToEdit);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useAppForm<EntityFormData>({
    schema: entitySchema,
    defaultValues: {
      name: "",
      entity_type_id: "",
      association_id: "",
      description: "",
    },
  });

  const entityTypeOptions = useMemo(() => {
    return (Array.isArray(entityTypes) ? entityTypes : [])
      .filter((t) => Boolean(t?.id))
      .map((t) => ({
        value: String(t.id),
        label: t.name,
      }));
  }, [entityTypes]);

  useEffect(() => {
    if (isOpen) {
      if (entityToEdit) {
        reset({
          name: entityToEdit.name || "",
          entity_type_id: entityToEdit.entity_type_id
            ? String(entityToEdit.entity_type_id)
            : "",
          association_id: entityToEdit.association_id || "",
          description: entityToEdit.description || "",
        });
      } else {
        reset({
          name: "",
          entity_type_id: "",
          association_id: "",
          description: "",
        });
      }
    }
  }, [isOpen, entityToEdit, reset]);

  const onSubmit = async (data: EntityFormData) => {
    try {
      if (isEditMode && entityToEdit) {
        await updateEntity({
          id: entityToEdit.id,
          data: {
            name: data.name.trim(),
            description: data.description?.trim() || undefined,
            entity_type_id: data.entity_type_id,
            association_id: data.association_id?.trim() || undefined,
          },
        }).unwrap();
        toast.success("Entity updated successfully");
      } else {
        await createEntity({
          name: data.name.trim(),
          description: data.description?.trim() || undefined,
          entity_type_id: data.entity_type_id,
          association_id: data.association_id?.trim() || undefined,
        }).unwrap();
        toast.success("Entity created successfully");
      }

      onSuccess?.();
      onClose();
    } catch (err: any) {
      toast.error(formatApiErrorDetail(err.data || err.message || "Failed to save entity"));
    }
  };

  const fieldOrder: (keyof EntityFormData)[] = [
    "name",
    "entity_type_id",
    "association_id",
    "description",
  ];
  const activeErrorKey = fieldOrder.find((key) => errors[key]);
  const getFieldError = (key: keyof EntityFormData) =>
    activeErrorKey === key ? errors[key]?.message : undefined;

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? "Edit Entity" : "Add Entity"}
      icon={<Building size={18} className="text-slate-800" />}
      size="md"
      isSubmitting={isSubmitting}
      submitText="Save Changes"
      loadingText="Saving Changes..."
      submitVariant="default"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="space-y-4">
        <FormField label="Entity Name" required error={getFieldError("name")}>
          <Input
            placeholder="e.g. Greenfield Heights Management, Palm Grove Holding"
            disabled={isSubmitting}
            autoFocus
            {...register("name")}
          />
        </FormField>

        <FormField label="Entity Type" required error={getFieldError("entity_type_id")}>
          <Controller
            name="entity_type_id"
            control={control}
            render={({ field }) => (
              <Select
                icon={<Layers size={15} />}
                options={entityTypeOptions}
                value={field.value}
                onValueChange={field.onChange}
                placeholder={
                  isTypesLoading ? "Loading entity types..." : "Select an entity type..."
                }
                disabled={isSubmitting || isTypesLoading}
                error={Boolean(getFieldError("entity_type_id"))}
              />
            )}
          />
        </FormField>

        <FormField label="Association Identifier (Optional)" error={getFieldError("association_id")}>
          <Input
            placeholder="e.g. HOA-102, ASSOC-NYC-01"
            disabled={isSubmitting}
            {...register("association_id")}
          />
        </FormField>

        <FormField label="Description" error={getFieldError("description")}>
          <Textarea
            placeholder="Enter details about this business entity or jurisdiction..."
            disabled={isSubmitting}
            rows={3}
            {...register("description")}
          />
        </FormField>
      </div>
    </FormModal>
  );
};

export default EntityFormModal;
