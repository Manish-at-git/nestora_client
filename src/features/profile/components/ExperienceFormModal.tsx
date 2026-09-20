import React, { useEffect } from "react";
import { Controller } from "react-hook-form";
import { Briefcase } from "lucide-react";
import { toast } from "sonner";
import { FormModal } from "@/components/common/FormModal";
import { FormField } from "@/components/common/FormField";
import { FileUploadZone } from "@/components/common/FileUploadZone";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { DatePicker } from "@/components/ui/date-picker";
import { useAppForm } from "@/hooks/useAppForm";
import { useAddExperienceMutation, useUpdateExperienceMutation } from "../api/profileApi";
import { ExperienceFormData } from "../types";
import {
  experienceSchema,
  ExperienceFormValues,
  EMPLOYMENT_TYPES,
  WORK_MODES,
} from "../schemas";

export interface ExperienceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: ExperienceFormData | null;
  onSuccess?: () => void;
}

export const ExperienceFormModal: React.FC<ExperienceFormModalProps> = ({
  isOpen,
  onClose,
  initialData,
  onSuccess,
}) => {
  const [addExperience, { isLoading: isAdding }] = useAddExperienceMutation();
  const [updateExperience, { isLoading: isUpdating }] = useUpdateExperienceMutation();
  const isSaving = isAdding || isUpdating;
  const isEditMode = Boolean(initialData?.id);

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useAppForm<ExperienceFormValues>({
    schema: experienceSchema,
    defaultValues: {
      job_title: "",
      employment_type: "full_time",
      company: "",
      industry: "",
      location: "",
      work_mode: "on_site",
      start_date: "",
      end_date: "",
      currently_working: false,
      description: "",
      skills: "",
      website_url: "",
      certificate_url: "",
    },
  });

  const currentlyWorking = watch("currently_working");

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset({
          id: initialData.id,
          job_title: initialData.job_title || "",
          employment_type: initialData.employment_type?.toLowerCase().replace("-", "_") || "full_time",
          company: initialData.company || "",
          industry: initialData.industry || "",
          location: initialData.location || "",
          work_mode: initialData.work_mode?.toLowerCase().replace("-", "_") || "on_site",
          start_date: initialData.start_date || "",
          end_date: initialData.end_date || "",
          currently_working: Boolean(initialData.currently_working),
          description: initialData.description || "",
          skills: initialData.skills || "",
          website_url: initialData.website_url || "",
          certificate_url: initialData.certificate_url || "",
        });
      } else {
        reset({
          job_title: "",
          employment_type: "full_time",
          company: "",
          industry: "",
          location: "",
          work_mode: "on_site",
          start_date: "",
          end_date: "",
          currently_working: false,
          description: "",
          skills: "",
          website_url: "",
          certificate_url: "",
        });
      }
    }
  }, [initialData, isOpen, reset]);

  const onSubmit = async (values: ExperienceFormValues) => {
    const payload: ExperienceFormData = {
      id: initialData?.id,
      job_title: values.job_title?.trim() || "",
      employment_type: values.employment_type || "full_time",
      company: values.company?.trim() || "",
      industry: values.industry?.trim() || "",
      location: values.location?.trim() || "",
      work_mode: values.work_mode || "on_site",
      start_date: values.start_date || "",
      end_date: values.currently_working ? "" : values.end_date || "",
      currently_working: Boolean(values.currently_working),
      description: values.description?.trim() || "",
      skills: values.skills?.trim() || "",
      website_url: values.website_url?.trim() || "",
      certificate_url: values.certificate_url || null,
    };

    try {
      if (isEditMode && initialData?.id) {
        await updateExperience({ id: initialData.id, data: payload }).unwrap();
        toast.success("Experience updated successfully!");
      } else {
        await addExperience(payload).unwrap();
        toast.success("Experience added successfully!");
      }
      onClose();
      onSuccess?.();
    } catch (err: any) {
      toast.error(err?.data?.detail || err?.data || "Error saving experience");
    }
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? "Edit Experience" : "Add New Experience"}
      icon={<Briefcase className="w-5 h-5 text-[#232C3E]" />}
      size="2xl"
      onSubmit={handleSubmit(onSubmit)}
      isSubmitting={isSaving}
      submitText={isEditMode ? "Save Changes" : "Add Experience"}
      loadingText={isEditMode ? "Saving Changes..." : "Adding Experience..."}
    >
      <div className="space-y-4">
        {/* Job Title & Employment Type */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            label="Job Title / Designation"
            required
            error={errors.job_title?.message}
          >
            <Input
              {...register("job_title")}
              placeholder="e.g. Senior Property Manager"
              error={Boolean(errors.job_title)}
            />
          </FormField>

          <Controller
            name="employment_type"
            control={control}
            render={({ field }) => (
              <FormField
                label="Employment Type"
                required
                error={errors.employment_type?.message}
              >
                <Select
                  options={EMPLOYMENT_TYPES}
                  value={field.value}
                  onValueChange={field.onChange}
                  placeholder="Select type"
                  error={Boolean(errors.employment_type)}
                />
              </FormField>
            )}
          />
        </div>

        {/* Company & Industry */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            label="Company / Employer"
            required
            error={errors.company?.message}
          >
            <Input
              {...register("company")}
              placeholder="e.g. Nestora Property Services"
              error={Boolean(errors.company)}
            />
          </FormField>

          <FormField
            label="Industry / Domain"
            error={errors.industry?.message}
          >
            <Input
              {...register("industry")}
              placeholder="e.g. Real Estate, Facilities"
              error={Boolean(errors.industry)}
            />
          </FormField>
        </div>

        {/* Location & Work Mode */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Location" error={errors.location?.message}>
            <Input
              {...register("location")}
              placeholder="e.g. Mumbai, India"
              error={Boolean(errors.location)}
            />
          </FormField>

          <Controller
            name="work_mode"
            control={control}
            render={({ field }) => (
              <FormField label="Work Mode" error={errors.work_mode?.message}>
                <Select
                  options={WORK_MODES}
                  value={field.value}
                  onValueChange={field.onChange}
                  placeholder="Select work mode"
                  error={Boolean(errors.work_mode)}
                />
              </FormField>
            )}
          />
        </div>

        {/* Dates & Currently Working */}
        <div className="space-y-2.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Controller
              name="start_date"
              control={control}
              render={({ field }) => (
                <FormField
                  label="Start Date"
                  required
                  error={errors.start_date?.message}
                >
                  <DatePicker
                    value={field.value || ""}
                    onChange={(val) => field.onChange(val || "")}
                    placeholder="Select start date"
                    isClearable
                  />
                </FormField>
              )}
            />

            <Controller
              name="end_date"
              control={control}
              render={({ field }) => (
                <FormField
                  label="End Date"
                  error={errors.end_date?.message}
                  helperText={currentlyWorking ? "Currently working in this role" : undefined}
                >
                  <DatePicker
                    value={field.value || ""}
                    onChange={(val) => field.onChange(val || "")}
                    placeholder="Select end date"
                    disabled={currentlyWorking}
                    isClearable
                  />
                </FormField>
              )}
            />
          </div>

          <Controller
            name="currently_working"
            control={control}
            render={({ field }) => (
              <div className="flex items-center gap-2.5 pt-0.5">
                <Checkbox
                  id="currently_working"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
                <label
                  htmlFor="currently_working"
                  className="text-sm font-medium text-slate-700 cursor-pointer select-none leading-none"
                >
                  Currently Working Here
                </label>
              </div>
            )}
          />
        </div>

        {/* Company Website */}
        <FormField label="Company Website URL" error={errors.website_url?.message}>
          <Input
            {...register("website_url")}
            placeholder="e.g. https://company.com"
            error={Boolean(errors.website_url)}
          />
        </FormField>

        {/* Certificate Upload */}
        <Controller
          name="certificate_url"
          control={control}
          render={({ field }) => (
            <FormField
              label="Experience Certificate / Relieving Letter"
              error={errors.certificate_url?.message}
              helperText="Upload scanned copy of experience certificate or offer letter (PDF or image, max 10MB)"
            >
              <FileUploadZone
                value={field.value || ""}
                onChange={field.onChange}
                label="Upload Experience Document"
                helperText="Upload PDF or certificate image (max 10MB)"
                accept=".pdf,.png,.jpg,.jpeg"
                maxSizeMB={10}
              />
            </FormField>
          )}
        />
      </div>
    </FormModal>
  );
};

export default ExperienceFormModal;
