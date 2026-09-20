import React, { useEffect } from "react";
import { Controller } from "react-hook-form";
import { Car } from "lucide-react";
import { toast } from "sonner";
import { FormModal } from "@/components/common/FormModal";
import { FormField } from "@/components/common/FormField";
import { FileUploadZone } from "@/components/common/FileUploadZone";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useAppForm } from "@/hooks/useAppForm";
import { useAddVehicleMutation, useUpdateVehicleMutation } from "../api/profileApi";
import { VehicleFormData } from "../types";
import { vehicleSchema, VehicleFormValues, VEHICLE_TYPES } from "../schemas";

export interface VehicleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: VehicleFormData | null;
  onSuccess?: () => void;
}

export const VehicleFormModal: React.FC<VehicleFormModalProps> = ({
  isOpen,
  onClose,
  initialData,
  onSuccess,
}) => {
  const [addVehicle, { isLoading: isAdding }] = useAddVehicleMutation();
  const [updateVehicle, { isLoading: isUpdating }] = useUpdateVehicleMutation();
  const isSaving = isAdding || isUpdating;
  const isEditMode = Boolean(initialData?.id);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useAppForm<VehicleFormValues>({
    schema: vehicleSchema,
    defaultValues: {
      type: "car",
      registration_number: "",
      insurance_url: "",
      puc_url: "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset({
          id: initialData.id,
          type: initialData.type?.toLowerCase() || "car",
          registration_number: initialData.registration_number || "",
          insurance_url: initialData.insurance_url || "",
          puc_url: initialData.puc_url || "",
        });
      } else {
        reset({
          type: "car",
          registration_number: "",
          insurance_url: "",
          puc_url: "",
        });
      }
    }
  }, [initialData, isOpen, reset]);

  const onSubmit = async (values: VehicleFormValues) => {
    const payload: VehicleFormData = {
      type: values.type || "car",
      registration_number: values.registration_number?.trim().toUpperCase() || "",
      insurance_url: values.insurance_url || null,
      puc_url: values.puc_url || null,
    };

    try {
      if (isEditMode && initialData?.id) {
        await updateVehicle({ id: initialData.id, data: payload }).unwrap();
        toast.success("Vehicle updated successfully!");
      } else {
        await addVehicle(payload).unwrap();
        toast.success("Vehicle added successfully!");
      }
      onClose();
      onSuccess?.();
    } catch (err: any) {
      toast.error(err?.data?.detail || err?.data || "Error saving vehicle");
    }
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? "Edit Vehicle" : "Add New Vehicle"}
      icon={<Car className="w-5 h-5 text-[#232C3E]" />}
      size="lg"
      onSubmit={handleSubmit(onSubmit)}
      isSubmitting={isSaving}
      submitText={isEditMode ? "Save Changes" : "Add Vehicle"}
      loadingText={isEditMode ? "Saving Changes..." : "Adding Vehicle..."}
    >
      <div className="space-y-4">
        {/* Vehicle Type */}
        <Controller
          name="type"
          control={control}
          render={({ field }) => (
            <FormField label="Vehicle Type" required error={errors.type?.message}>
              <Select
                options={VEHICLE_TYPES}
                value={field.value}
                onValueChange={field.onChange}
                placeholder="Select vehicle type"
                error={Boolean(errors.type)}
              />
            </FormField>
          )}
        />

        {/* Registration Number */}
        <FormField
          label="Registration Number"
          required
          error={errors.registration_number?.message}
          helperText="Format: GJ-01-AB-1234 or state standard format"
        >
          <Input
            {...register("registration_number")}
            placeholder="e.g. GJ-01-AB-1234"
            className="uppercase font-mono"
            error={Boolean(errors.registration_number)}
          />
        </FormField>

        {/* Documents */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <Controller
            name="insurance_url"
            control={control}
            render={({ field }) => (
              <FormField
                label="Insurance Policy Document"
                error={errors.insurance_url?.message}
              >
                <FileUploadZone
                  value={field.value || ""}
                  onChange={field.onChange}
                  label="Upload Insurance Document"
                  helperText="Upload PDF or document image (max 10MB)"
                  accept=".pdf,.png,.jpg,.jpeg"
                  maxSizeMB={10}
                />
              </FormField>
            )}
          />

          <Controller
            name="puc_url"
            control={control}
            render={({ field }) => (
              <FormField
                label="PUC Certificate"
                error={errors.puc_url?.message}
              >
                <FileUploadZone
                  value={field.value || ""}
                  onChange={field.onChange}
                  label="Upload PUC Document"
                  helperText="Upload PDF or certificate image (max 10MB)"
                  accept=".pdf,.png,.jpg,.jpeg"
                  maxSizeMB={10}
                />
              </FormField>
            )}
          />
        </div>
      </div>
    </FormModal>
  );
};

export default VehicleFormModal;
