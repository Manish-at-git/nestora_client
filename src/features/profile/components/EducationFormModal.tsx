import React, { useEffect } from "react";
import { Controller } from "react-hook-form";
import { GraduationCap } from "lucide-react";
import { toast } from "sonner";
import { FormModal } from "@/components/common/FormModal";
import { FormField } from "@/components/common/FormField";
import { FileUploadZone } from "@/components/common/FileUploadZone";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { DatePicker } from "@/components/ui/date-picker";
import { useAppForm } from "@/hooks/useAppForm";
import { useAddEducationMutation, useUpdateEducationMutation } from "../api/profileApi";
import { EducationFormData } from "../types";
import { educationSchema, EducationFormValues, EDUCATION_LEVELS } from "../schemas";

export interface EducationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: EducationFormData | null;
  onSuccess?: () => void;
}

export const EducationFormModal: React.FC<EducationFormModalProps> = ({
  isOpen,
  onClose,
  initialData,
  onSuccess,
}) => {
  const [addEducation, { isLoading: isAdding }] = useAddEducationMutation();
  const [updateEducation, { isLoading: isUpdating }] = useUpdateEducationMutation();
  const isSaving = isAdding || isUpdating;
  const isEditMode = Boolean(initialData?.id);

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useAppForm<EducationFormValues>({
    schema: educationSchema,
    defaultValues: {
      education_level: "bachelor",
      degree: "",
      field_of_study: "",
      institution: "",
      board_university: "",
      start_date: "",
      end_date: "",
      currently_studying: false,
      grade: "",
      location: "",
      description: "",
      certificate_url: "",
    },
  });

  const currentlyStudying = watch("currently_studying");

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset({
          id: initialData.id,
          education_level: initialData.education_level?.toLowerCase() || "bachelor",
          degree: initialData.degree || "",
          field_of_study: initialData.field_of_study || "",
          institution: initialData.institution || "",
          board_university: initialData.board_university || "",
          start_date: initialData.start_date || "",
          end_date: initialData.end_date || "",
          currently_studying: Boolean(initialData.currently_studying),
          grade: initialData.grade || "",
          location: initialData.location || "",
          description: initialData.description || "",
          certificate_url: initialData.certificate_url || "",
        });
      } else {
        reset({
          education_level: "bachelor",
          degree: "",
          field_of_study: "",
          institution: "",
          board_university: "",
          start_date: "",
          end_date: "",
          currently_studying: false,
          grade: "",
          location: "",
          description: "",
          certificate_url: "",
        });
      }
    }
  }, [initialData, isOpen, reset]);

  const onSubmit = async (values: EducationFormValues) => {
    const payload: EducationFormData = {
      id: initialData?.id,
      education_level: values.education_level || "bachelor",
      degree: values.degree?.trim() || "",
      field_of_study: values.field_of_study?.trim() || "",
      institution: values.institution?.trim() || "",
      board_university: values.board_university?.trim() || "",
      start_date: values.start_date || "",
      end_date: values.currently_studying ? "" : values.end_date || "",
      currently_studying: Boolean(values.currently_studying),
      grade: values.grade?.trim() || "",
      location: values.location?.trim() || "",
      description: values.description?.trim() || "",
      certificate_url: values.certificate_url || null,
    };

    try {
      if (isEditMode && initialData?.id) {
        await updateEducation({ id: initialData.id, data: payload }).unwrap();
        toast.success("Education updated successfully!");
      } else {
        await addEducation(payload).unwrap();
        toast.success("Education added successfully!");
      }
      onClose();
      onSuccess?.();
    } catch (err: any) {
      toast.error(err?.data?.detail || err?.data || "Error saving education");
    }
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? "Edit Education" : "Add New Education"}
      icon={<GraduationCap className="w-5 h-5 text-[#232C3E]" />}
      size="2xl"
      onSubmit={handleSubmit(onSubmit)}
      isSubmitting={isSaving}
      submitText={isEditMode ? "Save Changes" : "Add Education"}
      loadingText={isEditMode ? "Saving Changes..." : "Adding Education..."}
    >
      <div className="space-y-4">
        {/* Education Level & Degree */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Controller
            name="education_level"
            control={control}
            render={({ field }) => (
              <FormField
                label="Education Level"
                required
                error={errors.education_level?.message}
              >
                <Select
                  options={EDUCATION_LEVELS}
                  value={field.value}
                  onValueChange={field.onChange}
                  placeholder="Select level"
                  error={Boolean(errors.education_level)}
                />
              </FormField>
            )}
          />

          <FormField
            label="Degree / Qualification"
            required
            error={errors.degree?.message}
          >
            <Input
              {...register("degree")}
              placeholder="e.g. B.Tech / B.Sc / MBA"
              error={Boolean(errors.degree)}
            />
          </FormField>
        </div>

        {/* Field of Study */}
        <FormField
          label="Field of Study / Major"
          error={errors.field_of_study?.message}
        >
          <Input
            {...register("field_of_study")}
            placeholder="e.g. Computer Science, Accounting, Civil"
            error={Boolean(errors.field_of_study)}
          />
        </FormField>

        {/* Institution & Board / University */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            label="College / Institute"
            required
            error={errors.institution?.message}
          >
            <Input
              {...register("institution")}
              placeholder="e.g. University of Mumbai"
              error={Boolean(errors.institution)}
            />
          </FormField>

          <FormField
            label="Board / Affiliated University"
            error={errors.board_university?.message}
          >
            <Input
              {...register("board_university")}
              placeholder="e.g. State University"
              error={Boolean(errors.board_university)}
            />
          </FormField>
        </div>

        {/* Dates & Currently Studying */}
        <div className="space-y-2.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Controller
              name="start_date"
              control={control}
              render={({ field }) => (
                <FormField label="Start Date" error={errors.start_date?.message}>
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
                  helperText={currentlyStudying ? "Currently studying here" : undefined}
                >
                  <DatePicker
                    value={field.value || ""}
                    onChange={(val) => field.onChange(val || "")}
                    placeholder="Select end date"
                    disabled={currentlyStudying}
                    isClearable
                  />
                </FormField>
              )}
            />
          </div>

          <Controller
            name="currently_studying"
            control={control}
            render={({ field }) => (
              <div className="flex items-center gap-2.5 pt-0.5">
                <Checkbox
                  id="currently_studying"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
                <label
                  htmlFor="currently_studying"
                  className="text-sm font-medium text-slate-700 cursor-pointer select-none leading-none"
                >
                  Currently Studying Here
                </label>
              </div>
            )}
          />
        </div>

        {/* Grade & Location */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            label="Grade / Percentage / CGPA"
            error={errors.grade?.message}
          >
            <Input
              {...register("grade")}
              placeholder="e.g. 8.5 CGPA or 85%"
              error={Boolean(errors.grade)}
            />
          </FormField>

          <FormField
            label="Location"
            error={errors.location?.message}
          >
            <Input
              {...register("location")}
              placeholder="e.g. Mumbai, India"
              error={Boolean(errors.location)}
            />
          </FormField>
        </div>

        {/* Certificate Upload */}
        <Controller
          name="certificate_url"
          control={control}
          render={({ field }) => (
            <FormField
              label="Degree / Certificate Document"
              error={errors.certificate_url?.message}
              helperText="Upload scanned copy or degree certificate (PDF or image, max 10MB)"
            >
              <FileUploadZone
                value={field.value || ""}
                onChange={field.onChange}
                label="Upload Degree / Certificate"
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

export default EducationFormModal;
