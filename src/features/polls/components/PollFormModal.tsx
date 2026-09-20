import React, { useEffect, useMemo, useState } from "react";
import { Controller, useFieldArray } from "react-hook-form";
import { toast } from "sonner";
import {
  BarChart2,
  Building,
  Plus,
  Trash2,
  Clock,
  Eye,
  Users,
} from "lucide-react";
import { FormModal, FormField } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { useAppForm } from "@/hooks/useAppForm";
import { useAuth } from "@/context/AuthContext";
import { ROLE_CODE } from "@/constants/roleCodes";
import { useCreatePollMutation, useUpdatePollMutation } from "../api/pollsApi";
import { pollSchema, type PollFormValues } from "../schemas";
import type { Poll, PollFormData } from "../types";
import { PollOverviewModal } from "./PollOverviewModal";

export interface PollFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialData?: Poll | null;
  adminAssociations?: Array<{ id: string | number; name: string }>;
  selectedAssociationId?: string | number;
  onSubmit?: (data: PollFormData) => Promise<void>;
  loading?: boolean;
  associationsLoading?: boolean;
}

const VISIBILITY_OPTIONS = [
  { value: "All", label: "All Members & Residents" },
  { value: "Homeowners", label: "Homeowners Only" },
  { value: "Board Member", label: "Board Members Only" },
  { value: "Committee Members", label: "Committee Members Only" },
  { value: "Tenant", label: "Tenants Only" },
];

export const PollFormModal: React.FC<PollFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialData,
  adminAssociations = [],
  selectedAssociationId,
  onSubmit,
  loading: externalLoading = false,
  associationsLoading = false,
}) => {
  const { account } = useAuth();
  const [draftSubmitting, setDraftSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [createPoll, { isLoading: isCreating }] = useCreatePollMutation();
  const [updatePoll, { isLoading: isUpdating }] = useUpdatePollMutation();

  const validAssocs = useMemo(
    () =>
      adminAssociations.filter(
        (association) =>
          String(association.id) !== "ALL" &&
          association.name !== "All Associations"
      ),
    [adminAssociations]
  );

  const userRole = account?.role_code;
  const userIsAdmin =
    userRole === ROLE_CODE.ADMIN || userRole === ROLE_CODE.SUPER_ADMIN;
  const userHasLockedAssociation =
    userRole === ROLE_CODE.BOARD_MEMBER ||
    userRole === ROLE_CODE.COMMITTEE_MEMBER ||
    userRole === ROLE_CODE.HOMEOWNER ||
    userRole === ROLE_CODE.TENANT;
  const showAssociationSelector = userIsAdmin || userHasLockedAssociation;

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting: isFormSubmitting },
  } = useAppForm<PollFormValues>({
    schema: pollSchema,
    defaultValues: {
      association_id: "",
      question: "",
      description: "",
      options: ["", ""],
      is_multiple_choice: false,
      visibility: "",
      end_date: "",
      status: "Published",
    },
  });

  const formValues = watch();
  const options = watch("options") || ["", ""];

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset({
          association_id: initialData.association_id ? String(initialData.association_id) : "",
          question: initialData.question || "",
          description: initialData.description || "",
          options:
            initialData.options && initialData.options.length >= 2
              ? initialData.options.map((o) => o.text)
              : ["", ""],
          is_multiple_choice: Boolean(initialData.is_multiple_choice),
          visibility: initialData.visibility || "",
          end_date: initialData.end_date ? initialData.end_date.slice(0, 16) : "",
          status: initialData.status || "Published",
        });
      } else {
        reset({
          association_id: selectedAssociationId ? String(selectedAssociationId) : "",
          question: "",
          description: "",
          options: ["", ""],
          is_multiple_choice: false,
          visibility: "",
          end_date: "",
          status: "Published",
        });
      }
    }
  }, [isOpen, initialData, selectedAssociationId, reset]);

  const handleAddOption = () => {
    if (options.length >= 10) {
      toast.error("Maximum 10 options allowed per poll.");
      return;
    }
    setValue("options", [...options, ""]);
  };

  const handleRemoveOption = (index: number) => {
    if (options.length <= 2) {
      toast.error("A poll requires at least 2 options.");
      return;
    }
    const updated = options.filter((_, i) => i !== index);
    setValue("options", updated);
  };

  const handleOptionTextChange = (index: number, val: string) => {
    const updated = [...options];
    updated[index] = val;
    setValue("options", updated);
  };

  const handleFormSubmit = async (data: PollFormValues) => {
    const associationId = data.association_id || selectedAssociationId;
    if (showAssociationSelector && !associationId) {
      toast.error("Please select an association.");
      return;
    }

    const validOptions = data.options.map((o) => o.trim()).filter(Boolean);
    if (validOptions.length < 2) {
      toast.error("Please provide at least 2 valid non-empty options.");
      return;
    }

    const payload: PollFormData = {
      question: data.question.trim(),
      description: data.description?.trim() || undefined,
      options: validOptions,
      is_multiple_choice: Boolean(data.is_multiple_choice),
      visibility: data.visibility || "All",
      status: data.status || "Published",
      end_date: data.end_date || undefined,
      association_id: associationId || undefined,
    };

    try {
      if (onSubmit) {
        await onSubmit(payload);
      } else if (initialData) {
        await updatePoll({
          id: initialData.id,
          data: payload,
        }).unwrap();
      } else {
        await createPoll(payload).unwrap();
      }
      toast.success(initialData ? "Poll updated successfully." : "Poll created successfully.");
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err?.data?.detail || err?.message || "Failed to save poll. Please try again.");
    }
  };

  const handleSaveAsDraft = async () => {
    setValue("status", "Draft");
    setDraftSubmitting(true);
    try {
      await handleSubmit((data) => handleFormSubmit({ ...data, status: "Draft" }))();
    } finally {
      setDraftSubmitting(false);
    }
  };

  // Top-to-bottom single error display (Sequential validation rule)
  const fieldOrder: (keyof PollFormValues)[] = [
    "association_id",
    "question",
    "description",
    "options",
    "is_multiple_choice",
    "visibility",
    "end_date",
  ];
  const activeErrorKey = fieldOrder.find((key) => errors[key]);
  const getFieldError = (key: keyof PollFormValues) =>
    activeErrorKey === key ? errors[key]?.message : undefined;

  const isFormDisabled =
    isFormSubmitting ||
    draftSubmitting ||
    externalLoading ||
    isCreating ||
    isUpdating;

  // Mock Poll for live preview
  const previewPoll: Poll = {
    id: initialData?.id || "preview",
    question: formValues.question || "Untitled Poll",
    description: formValues.description || "",
    options: options.map((opt, idx) => ({
      id: idx + 1,
      text: opt || `Option ${idx + 1}`,
      votes_count: 0,
      percentage: 0,
    })),
    is_multiple_choice: formValues.is_multiple_choice,
    visibility: formValues.visibility || "All",
    status: formValues.status || "Draft",
    end_date: formValues.end_date || undefined,
    total_votes: 0,
    my_votes: [],
    created_at: initialData?.created_at || new Date().toISOString(),
  };

  return (
    <>
      <FormModal
        isOpen={isOpen}
        onClose={onClose}
        title={initialData ? "Edit Poll" : "Create Community Poll"}
        icon={<BarChart2 size={18} className="text-slate-800" />}
        size="2xl"
        onSubmit={handleSubmit(handleFormSubmit)}
        customFooter={
          <div className="flex items-center justify-between w-full">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowPreview(true)}
              className="rounded-xl text-xs font-semibold gap-1.5 text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              <Eye size={15} />
              Preview
            </Button>
            <div className="flex items-center gap-3">
              {!initialData && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSaveAsDraft}
                  disabled={isFormDisabled}
                  className="rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Save as Draft
                </Button>
              )}
              <Button
                type="submit"
                disabled={isFormDisabled}
                className="rounded-xl text-xs font-semibold cursor-pointer"
              >
                {isFormSubmitting || isCreating || isUpdating || draftSubmitting
                  ? initialData
                    ? "Updating"
                    : "Submitting"
                  : initialData
                  ? "Update"
                  : "Submit"}
              </Button>
            </div>
          </div>
        }
      >
        <div className="space-y-4 py-1">
          {/* Admins choose an association; member roles are locked to their own. */}
          {showAssociationSelector && (
            <FormField
              label="Association"
              required
              error={getFieldError("association_id")}
            >
              <Controller
                name="association_id"
                control={control}
                render={({ field }) => (
                  <Select
                    icon={<Building size={15} />}
                    value={field.value ? String(field.value) : ""}
                    onValueChange={field.onChange}
                    options={validAssocs.map((association) => ({
                      value: String(association.id),
                      label: association.name,
                    }))}
                    placeholder={
                      associationsLoading
                        ? "Loading association..."
                        : userHasLockedAssociation
                        ? "Association not assigned"
                        : "Select association"
                    }
                    disabled={
                      isFormDisabled ||
                      associationsLoading ||
                      userHasLockedAssociation
                    }
                    error={Boolean(getFieldError("association_id"))}
                    size="md"
                  />
                )}
              />
            </FormField>
          )}

          {/* Question */}
          <FormField label="Poll Question" required error={getFieldError("question")}>
            <Input
              placeholder="e.g. Should we install solar lighting in common areas?"
              maxLength={300}
              disabled={isFormDisabled}
              {...register("question")}
              error={Boolean(getFieldError("question"))}
              size="md"
            />
          </FormField>

          {/* Context / Description */}
          <FormField label="Poll Context & Details" error={getFieldError("description")}>
            <Textarea
              rows={3}
              maxLength={2000}
              disabled={isFormDisabled}
              placeholder="Provide background, rationale, or instructions for voters..."
              {...register("description")}
              error={Boolean(getFieldError("description"))}
              size="md"
            />
          </FormField>

          {/* Dynamic Options Section */}
          <div className="p-4 bg-slate-50/70 border border-slate-200/90 rounded-2xl space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-800">
                  Poll Options <span className="text-red-500">*</span>
                </label>
                <p className="text-[11px] text-slate-500">Provide at least 2 voting choices</p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={handleAddOption}
                disabled={isFormDisabled || options.length >= 10}
                className="h-8 rounded-xl text-xs font-semibold gap-1 cursor-pointer shrink-0 whitespace-nowrap px-3"
              >
                <Plus size={13} /> Add Option
              </Button>
            </div>

            {getFieldError("options") && (
              <p className="text-xs text-red-600 font-medium">{getFieldError("options")}</p>
            )}

            <div className="space-y-2.5 pt-1">
              {options.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-400 w-16 shrink-0">
                    Option {idx + 1}
                  </span>
                  <Input
                    value={opt}
                    onChange={(e) => handleOptionTextChange(idx, e.target.value)}
                    placeholder={`e.g. ${idx === 0 ? "Yes, proceed with installation" : idx === 1 ? "No, keep current lighting" : "Alternative proposal"}`}
                    maxLength={150}
                    disabled={isFormDisabled}
                    size="md"
                    className="flex-1"
                  />
                  {options.length > 2 && (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => handleRemoveOption(idx)}
                      disabled={isFormDisabled}
                      className="h-9 w-9 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl cursor-pointer shrink-0"
                      title="Remove option"
                    >
                      <Trash2 size={15} />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Voting Controls: Multiple Choice & Visibility */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Poll Visibility" required error={getFieldError("visibility")}>
              <Controller
                name="visibility"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    options={VISIBILITY_OPTIONS}
                    placeholder="Select visibility"
                    disabled={isFormDisabled}
                    error={Boolean(getFieldError("visibility"))}
                    size="md"
                  />
                )}
              />
            </FormField>

            <FormField label="Poll Expiration (Optional)" error={getFieldError("end_date")}>
              <Controller
                name="end_date"
                control={control}
                render={({ field }) => (
                  <DateTimePicker
                    value={field.value}
                    onChange={field.onChange}
                    minDateTime={new Date()}
                    disabled={isFormDisabled}
                    error={Boolean(getFieldError("end_date"))}
                    size="md"
                    placeholder="Select end date & time"
                  />
                )}
              />
            </FormField>
          </div>

          {/* Multiple Choice Toggle Checkbox */}
          <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl">
            <Controller
              name="is_multiple_choice"
              control={control}
              render={({ field }) => (
                <Checkbox
                  checked={Boolean(field.value)}
                  onCheckedChange={field.onChange}
                  disabled={isFormDisabled}
                  label="Multiple Choice Voting"
                  description="Allow community members to select multiple options instead of just one"
                />
              )}
            />
          </div>
        </div>
      </FormModal>

      {/* Live Preview Modal */}
      <PollOverviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        poll={previewPoll}
      />
    </>
  );
};

export default PollFormModal;
