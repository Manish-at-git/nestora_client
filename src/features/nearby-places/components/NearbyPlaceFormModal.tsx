import React, { useEffect } from "react";
import { Controller } from "react-hook-form";
import { MapPin } from "lucide-react";
import { toast } from "sonner";
import { FileUploadZone, FormField, FormModal } from "@/components/common";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useAppForm } from "@/hooks/useAppForm";
import { uploadMediaAsset } from "@/lib/cloudUploader";
import { formatApiErrorDetail } from "@/services/api/apiClient";
import {
  useCreateNearbyPlaceMutation,
  useUpdateNearbyPlaceMutation,
} from "../api";
import { EMPTY_NEARBY_PLACE_VALUES, NEARBY_CATEGORIES } from "../constants";
import { nearbyPlaceSchema, type NearbyPlaceFormData } from "../schemas";
import type { NearbyPlace, NearbyPlacePayload } from "../types";

interface NearbyPlaceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  placeToEdit: NearbyPlace | null;
}

const toOptional = (value: string) => value.trim() || null;

export const NearbyPlaceFormModal: React.FC<NearbyPlaceFormModalProps> = ({
  isOpen,
  onClose,
  placeToEdit,
}) => {
  const isEditMode = Boolean(placeToEdit);
  const [createPlace, { isLoading: isCreating }] =
    useCreateNearbyPlaceMutation();
  const [updatePlace, { isLoading: isUpdating }] =
    useUpdateNearbyPlaceMutation();
  const isSubmitting = isCreating || isUpdating;
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useAppForm<NearbyPlaceFormData>({
    schema: nearbyPlaceSchema,
    defaultValues: EMPTY_NEARBY_PLACE_VALUES,
  });

  useEffect(() => {
    if (!isOpen) return;
    reset(
      placeToEdit
        ? {
            name: placeToEdit.name,
            category: placeToEdit.category,
            distance: placeToEdit.distance,
            rating: Number(placeToEdit.rating),
            reviews: placeToEdit.reviews,
            status: placeToEdit.status,
            address: placeToEdit.address,
            phone: placeToEdit.phone || "",
            image: placeToEdit.image || "",
            tags: placeToEdit.tags || "",
            website: placeToEdit.website || "",
            is_active: placeToEdit.is_active,
          }
        : EMPTY_NEARBY_PLACE_VALUES,
    );
  }, [isOpen, placeToEdit, reset]);

  const submit = async (values: NearbyPlaceFormData) => {
    const payload: NearbyPlacePayload = {
      name: values.name?.trim() ?? "",
      category: values.category ?? "",
      distance: values.distance?.trim() ?? "",
      rating: values.rating,
      reviews: values.reviews,
      status: values.status?.trim() ?? "",
      address: values.address?.trim() ?? "",
      phone: toOptional(values.phone ?? ""),
      image: toOptional(values.image ?? ""),
      tags: toOptional(values.tags ?? ""),
      website: toOptional(values.website ?? ""),
      is_active: values.is_active,
    };
    try {
      if (placeToEdit) {
        await updatePlace({ id: placeToEdit.id, data: payload }).unwrap();
        toast.success("Nearby place updated successfully");
      } else {
        await createPlace(payload).unwrap();
        toast.success("Nearby place created successfully");
      }
      onClose();
    } catch (error: any) {
      toast.error(
        formatApiErrorDetail(
          error?.data || error?.message || "Failed to save nearby place",
        ),
      );
    }
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? "Edit Nearby Place" : "Add Nearby Place"}
      description="Maintain the global catalogue displayed to permitted residents and staff."
      icon={<MapPin size={19} />}
      size="2xl"
      onSubmit={handleSubmit(submit)}
      isSubmitting={isSubmitting}
      submitText={isEditMode ? "Save Changes" : "Create Place"}
      loadingText={isEditMode ? "Saving Changes..." : "Creating Place..."}
    >
      <div className="space-y-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            label="Place / Service Name"
            required
            error={errors.name?.message}
          >
            <Input
              autoFocus
              disabled={isSubmitting}
              placeholder="e.g. Gold's Gym"
              {...register("name")}
            />
          </FormField>
          <FormField label="Category" required error={errors.category?.message}>
            <Controller
              name="category"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={isSubmitting}
                  options={NEARBY_CATEGORIES.filter(
                    (item) => item.value !== "all",
                  )}
                />
              )}
            />
          </FormField>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Distance" required error={errors.distance?.message}>
            <Input
              disabled={isSubmitting}
              placeholder="e.g. 0.4 km away"
              {...register("distance")}
            />
          </FormField>
          <FormField
            label="Operating Status"
            required
            error={errors.status?.message}
          >
            <Input
              disabled={isSubmitting}
              placeholder="e.g. Open 24/7"
              {...register("status")}
            />
          </FormField>
        </div>
        <FormField label="Address" required error={errors.address?.message}>
          <Textarea
            disabled={isSubmitting}
            rows={2}
            placeholder="Full street address or sector location"
            {...register("address")}
          />
        </FormField>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Contact Phone" error={errors.phone?.message}>
            <Input
              disabled={isSubmitting}
              placeholder="+91 98765 00000"
              {...register("phone")}
            />
          </FormField>
          <FormField
            label="Google Maps Link"
            helperText="Paste the Google Maps share link used by the Directions button."
            error={errors.website?.message}
          >
            <Input
              disabled={isSubmitting}
              placeholder="https://maps.google.com/?q=..."
              {...register("website")}
            />
          </FormField>
        </div>
        <FormField
          label="Image Banner"
          helperText="Upload an image or paste its URL below."
          error={errors.image?.message}
        >
          <Controller
            name="image"
            control={control}
            render={({ field }) => (
              <div className="space-y-3">
                <FileUploadZone
                  value={field.value}
                  onChange={field.onChange}
                  onUpload={async (file) => (await uploadMediaAsset(file)).url}
                  accept="image/*"
                  label="Upload nearby place image"
                  helperText="PNG, JPG, WEBP, or another supported image"
                  disabled={isSubmitting}
                />
                <Input
                  value={field.value}
                  onChange={field.onChange}
                  disabled={isSubmitting}
                  placeholder="Or paste an image URL"
                />
              </div>
            )}
          />
        </FormField>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Rating" required error={errors.rating?.message}>
            <Input
              type="number"
              min="1"
              max="5"
              step="0.1"
              disabled={isSubmitting}
              {...register("rating")}
            />
          </FormField>
          <FormField
            label="Reviews Count"
            required
            error={errors.reviews?.message}
          >
            <Input
              type="number"
              min="0"
              step="1"
              disabled={isSubmitting}
              {...register("reviews")}
            />
          </FormField>
        </div>
        <FormField
          label="Tags"
          helperText="Separate tags with commas."
          error={errors.tags?.message}
        >
          <Input
            disabled={isSubmitting}
            placeholder="e.g. Emergency, ICU, Pharmacy"
            {...register("tags")}
          />
        </FormField>
        <Controller
          name="is_active"
          control={control}
          render={({ field }) => (
            <Switch
              label="Active catalogue entry"
              description="Visible to users who can access Nearby Places."
              checked={field.value}
              onCheckedChange={field.onChange}
              disabled={isSubmitting}
            />
          )}
        />
      </div>
    </FormModal>
  );
};
