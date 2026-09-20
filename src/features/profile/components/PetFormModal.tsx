import React, { useEffect, useMemo } from "react";
import { Controller, useWatch } from "react-hook-form";
import { Dog } from "lucide-react";
import { toast } from "sonner";
import { FormModal } from "@/components/common/FormModal";
import { FormField } from "@/components/common/FormField";
import { FileUploadZone } from "@/components/common/FileUploadZone";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { DatePicker } from "@/components/ui/date-picker";
import { useAppForm } from "@/hooks/useAppForm";
import { useAddPetMutation, useUpdatePetMutation } from "../api/profileApi";
import { PetFormData } from "../types";
import {
  petSchema,
  PetFormValues,
  PET_TYPES,
  DOG_BREEDS,
  CAT_BREEDS,
} from "../schemas";

export interface PetFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: PetFormData | null;
  onSuccess?: () => void;
}

export const PetFormModal: React.FC<PetFormModalProps> = ({
  isOpen,
  onClose,
  initialData,
  onSuccess,
}) => {
  const [addPet, { isLoading: isAdding }] = useAddPetMutation();
  const [updatePet, { isLoading: isUpdating }] = useUpdatePetMutation();
  const isSaving = isAdding || isUpdating;
  const isEditMode = Boolean(initialData?.id);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useAppForm<PetFormValues>({
    schema: petSchema,
    defaultValues: {
      type: "dog",
      name: "",
      breed: "",
      vaccinated: false,
      vaccination_date: "",
      next_vaccination_reminder: false,
      reminder_date: "",
      vaccination_certificate_url: "",
    },
  });

  const selectedType = useWatch({ control, name: "type" });
  const isVaccinated = useWatch({ control, name: "vaccinated" });
  const hasReminder = useWatch({ control, name: "next_vaccination_reminder" });

  const breedOptions = useMemo(() => {
    const typeLower = (selectedType || "").toLowerCase();
    if (typeLower === "dog") return DOG_BREEDS;
    if (typeLower === "cat") return CAT_BREEDS;
    return [{ value: "other", label: "Other" }];
  }, [selectedType]);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset({
          id: initialData.id,
          type: initialData.type?.toLowerCase() || "dog",
          name: initialData.name || "",
          breed: initialData.breed || "",
          vaccinated: Boolean(initialData.vaccinated),
          vaccination_date: initialData.vaccination_date || "",
          next_vaccination_reminder: Boolean(initialData.next_vaccination_reminder),
          reminder_date: initialData.reminder_date || "",
          vaccination_certificate_url: initialData.vaccination_certificate_url || "",
        });
      } else {
        reset({
          type: "dog",
          name: "",
          breed: "",
          vaccinated: false,
          vaccination_date: "",
          next_vaccination_reminder: false,
          reminder_date: "",
          vaccination_certificate_url: "",
        });
      }
    }
  }, [initialData, isOpen, reset]);

  const onSubmit = async (values: PetFormValues) => {
    const payload: PetFormData = {
      id: initialData?.id,
      type: values.type || "dog",
      name: values.name || "",
      breed: values.breed || "",
      vaccinated: Boolean(values.vaccinated),
      vaccination_date: values.vaccinated && values.vaccination_date ? values.vaccination_date : null,
      next_vaccination_reminder: Boolean(values.next_vaccination_reminder),
      reminder_date: values.next_vaccination_reminder && values.reminder_date ? values.reminder_date : null,
      vaccination_certificate_url: values.vaccinated && values.vaccination_certificate_url ? values.vaccination_certificate_url : null,
    };

    try {
      if (isEditMode && initialData?.id) {
        await updatePet({ id: initialData.id, data: payload }).unwrap();
        toast.success("Pet updated successfully!");
      } else {
        await addPet(payload).unwrap();
        toast.success("Pet added successfully!");
      }
      onClose();
      onSuccess?.();
    } catch (err: any) {
      toast.error(err?.data?.detail || err?.data || "Error saving pet");
    }
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? "Edit Pet" : "Add New Pet"}
      icon={<Dog className="w-5 h-5 text-[#232C3E]" />}
      size="lg"
      onSubmit={handleSubmit(onSubmit)}
      isSubmitting={isSaving}
      submitText={isEditMode ? "Save Changes" : "Save Pet"}
      loadingText={isEditMode ? "Saving Changes..." : "Saving Pet..."}
    >
      <div className="space-y-4">
        {/* Type and Name Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Controller
            name="type"
            control={control}
            render={({ field }) => (
              <FormField label="Pet Type" required error={errors.type?.message}>
                <Select
                  options={PET_TYPES}
                  value={field.value}
                  onValueChange={field.onChange}
                  placeholder="Select pet type"
                  error={Boolean(errors.type)}
                />
              </FormField>
            )}
          />

          <FormField
            label="Pet Name"
            required
            error={errors.name?.message}
          >
            <Input
              {...register("name")}
              placeholder="e.g. Max or Bella"
              error={Boolean(errors.name)}
            />
          </FormField>
        </div>

        {/* Breed */}
        <Controller
          name="breed"
          control={control}
          render={({ field }) => (
            <FormField label="Breed" error={errors.breed?.message}>
              <Select
                options={breedOptions}
                value={field.value || ""}
                onValueChange={field.onChange}
                placeholder="Select or specify breed"
                error={Boolean(errors.breed)}
              />
            </FormField>
          )}
        />

        {/* Vaccination Section */}
        <div className="pt-2 pb-1 border-t border-slate-100">
          <Controller
            name="vaccinated"
            control={control}
            render={({ field }) => (
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
                label="Is Vaccinated?"
                description="Check if this pet has received up-to-date vaccinations"
              />
            )}
          />

          {isVaccinated && (
            <div className="mt-3 p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-3">
              <Controller
                name="vaccination_date"
                control={control}
                render={({ field }) => (
                  <FormField
                    label="Last Vaccination Date"
                    error={errors.vaccination_date?.message}
                  >
                    <DatePicker
                      value={field.value || ""}
                      onChange={(date) => field.onChange(date || "")}
                      placeholder="Select vaccination date"
                      maxDate={new Date()}
                      isClearable
                    />
                  </FormField>
                )}
              />

              <Controller
                name="vaccination_certificate_url"
                control={control}
                render={({ field }) => (
                  <FormField
                    label="Vaccination Certificate"
                    error={errors.vaccination_certificate_url?.message}
                  >
                    <FileUploadZone
                      value={field.value || ""}
                      onChange={field.onChange}
                      label="Upload Vaccination Certificate"
                      helperText="Upload veterinary certificate PDF or image (max 10MB)"
                      accept=".pdf,.png,.jpg,.jpeg"
                      maxSizeMB={10}
                    />
                  </FormField>
                )}
              />
            </div>
          )}
        </div>

        {/* Next Reminder Section */}
        <div className="pt-2 border-t border-slate-100">
          <Controller
            name="next_vaccination_reminder"
            control={control}
            render={({ field }) => (
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
                label="Set reminder for next vaccination"
                description="Get notified before the next scheduled booster or vaccine"
              />
            )}
          />

          {hasReminder && (
            <div className="mt-3 p-4 rounded-xl border border-slate-200/80 bg-slate-50/50">
              <Controller
                name="reminder_date"
                control={control}
                render={({ field }) => (
                  <FormField
                    label="Reminder Date"
                    error={errors.reminder_date?.message}
                  >
                    <DatePicker
                      value={field.value || ""}
                      onChange={(date) => field.onChange(date || "")}
                      placeholder="Select reminder date"
                      minDate={new Date()}
                      isClearable
                    />
                  </FormField>
                )}
              />
            </div>
          )}
        </div>
      </div>
    </FormModal>
  );
};

export default PetFormModal;
