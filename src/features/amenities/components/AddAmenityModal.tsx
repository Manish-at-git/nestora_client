import React, { useEffect, useMemo } from "react";
import { Controller } from "react-hook-form";
import { toast } from "sonner";
import { Coffee, Building } from "lucide-react";
import { FormModal, FormField } from "@/components/common";
import { Input } from "@/components/ui/input";
import { NumberInput } from "@/components/ui/number-input";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useAppForm } from "@/hooks/useAppForm";
import { useCreateAmenityMutation } from "../api/amenitiesApi";
import { useGetAdminAssociationsQuery } from "@/services/api/associationsApi";
import { amenitySchema, type AmenityFormData } from "../schemas";

export interface AddAmenityModalProps {
  isOpen: boolean;
  onClose: () => void;
  associationId?: string | number;
  currencySymbol?: string;
}

export const AddAmenityModal: React.FC<AddAmenityModalProps> = ({
  isOpen,
  onClose,
  associationId,
  currencySymbol = "$",
}) => {
  const [createAmenity, { isLoading: isCreating }] = useCreateAmenityMutation();
  const { data: adminAssocs = [] } = useGetAdminAssociationsQuery(undefined, {
    skip: !isOpen,
  });

  const validAssocs = useMemo(
    () => adminAssocs.filter((a) => String(a.id) !== "ALL" && a.name !== "All Associations"),
    [adminAssocs]
  );

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useAppForm<AmenityFormData>({
    schema: amenitySchema,
    defaultValues: {
      association_id: "",
      name: "",
      charges: undefined as any,
      status: true,
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        association_id: associationId ? String(associationId) : "",
        name: "",
        charges: "" as any,
        status: true,
      });
    }
  }, [isOpen, associationId, reset]);

  const onSubmit = async (data: AmenityFormData) => {
    const targetAssocId = data.association_id || associationId;
    if (!targetAssocId) {
      toast.error("Please select an association.");
      return;
    }

    try {
      const res = await createAmenity({
        associationId: targetAssocId,
        data: {
          name: data.name.trim(),
          charges: Number(data.charges) || 0,
          status: data.status,
        },
      }).unwrap();

      if (res.ok) {
        toast.success(res.message || "Amenity added successfully.");
        onClose();
      }
    } catch (err: any) {
      toast.error(err?.data?.detail || err?.data || "Failed to add amenity. Please try again.");
    }
  };

  // Top-to-bottom single error display (Sequential validation rule)
  const fieldOrder: (keyof AmenityFormData)[] = ["association_id", "name", "charges", "status"];
  const activeErrorKey = fieldOrder.find((key) => errors[key]);
  const getFieldError = (key: keyof AmenityFormData) =>
    activeErrorKey === key ? errors[key]?.message : undefined;

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Amenity"
      subtitle="Define a new community facility or recreation space for booking."
      icon={<Coffee size={18} className="text-slate-800" />}
      submitText="Add Amenity"
      loadingText="Adding Amenity..."
      isSubmitting={isCreating}
      size="md"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="space-y-4 py-1">
        {/* Association Selector */}
        <FormField label="Association" required error={getFieldError("association_id")}>
          <Controller
            name="association_id"
            control={control}
            render={({ field }) => (
              <Select
                icon={<Building size={15} />}
                value={field.value}
                onValueChange={field.onChange}
                options={validAssocs.map((a) => ({
                  value: String(a.id),
                  label: a.name,
                }))}
                placeholder="Select association..."
                disabled={isCreating}
                error={Boolean(getFieldError("association_id"))}
                size="md"
              />
            )}
          />
        </FormField>

        {/* Amenity Name with Icon */}
        <FormField label="Amenity Name" required error={getFieldError("name")}>
          <Input
            icon={<Coffee size={15} />}
            placeholder="e.g. Badminton Court, Swimming Pool, Clubhouse"
            disabled={isCreating}
            {...register("name")}
            error={Boolean(getFieldError("name"))}
            size="md"
          />
        </FormField>

        {/* Hourly Rate with Currency Prefix */}
        <FormField
          label={`Hourly Rate (${currencySymbol})`}
          required
          error={getFieldError("charges")}
          helperText="Enter 0 if this amenity is complimentary for residents."
        >
          <Controller
            name="charges"
            control={control}
            render={({ field }) => (
              <NumberInput
                prefix={<span className="font-semibold text-slate-600">{currencySymbol}</span>}
                placeholder="0.00"
                min={0}
                step={1}
                allowDecimals={true}
                decimalScale={2}
                value={field.value}
                onValueChange={(val) => field.onChange(val ?? 0)}
                disabled={isCreating}
                error={Boolean(getFieldError("charges"))}
                size="md"
              />
            )}
          />
        </FormField>

        {/* Active Status */}
        <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
          <div>
            <p className="text-xs font-semibold text-slate-800">Active for Booking</p>
            <p className="text-xs text-slate-500">
              Allow residents to view and book this amenity immediately
            </p>
          </div>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Switch
                checked={Boolean(field.value)}
                onCheckedChange={field.onChange}
                disabled={isCreating}
              />
            )}
          />
        </div>
      </div>
    </FormModal>
  );
};
