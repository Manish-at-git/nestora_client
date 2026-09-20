import React, { useEffect, useMemo } from "react";
import { Controller } from "react-hook-form";
import { toast } from "sonner";
import { Building, Calendar, Users, User, ShieldAlert } from "lucide-react";
import { FormModal, FormField } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { useAppForm } from "@/hooks/useAppForm";
import { useGetAdminAssociationsQuery } from "@/services/api/associationsApi";
import {
  useGetCommitteesQuery,
  useLazyGetAssociationHomeownersQuery,
  useAssignCommitteeMemberMutation,
  useUpdateCommitteeMemberMutation,
} from "../api/committeeMembersApi";
import { committeeMemberSchema, type CommitteeMemberFormValues } from "../schemas";
import type { CommitteeMember, CommitteeMemberFormData } from "../types";

export interface CommitteeMemberFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  adminAssociations?: Array<{ id: string | number; name: string }>;
  selectedAssociationId?: string | number;
  editingMember?: CommitteeMember | null;
}

export const CommitteeMemberFormModal: React.FC<CommitteeMemberFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  adminAssociations = [],
  editingMember,
}) => {
  const isEditing = Boolean(editingMember);

  const [assignMember, { isLoading: isAssigning }] = useAssignCommitteeMemberMutation();
  const [updateMember, { isLoading: isUpdating }] = useUpdateCommitteeMemberMutation();
  const [triggerGetHomeowners, { data: homeowners = [], isFetching: isFetchingHomeowners }] =
    useLazyGetAssociationHomeownersQuery();

  // Fetch admin associations if not passed down as props
  const { data: fetchedAssocs = [] } = useGetAdminAssociationsQuery(undefined, {
    skip: adminAssociations.length > 0,
  });

  const effectiveAssocs = adminAssociations.length > 0 ? adminAssociations : fetchedAssocs;

  const validAssocs = useMemo(
    () => effectiveAssocs.filter((a) => String(a.id) !== "ALL" && a.name !== "All Associations"),
    [effectiveAssocs]
  );

  const {
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting: isFormSubmitting },
  } = useAppForm<CommitteeMemberFormValues>({
    schema: committeeMemberSchema,
    defaultValues: {
      association_id: "",
      committee_id: "",
      user_id: "",
      start_date: "",
      end_date: "",
    },
  });

  const selectedAssocId = watch("association_id");
  const startDate = watch("start_date");

  // Fetch committees for the selected association
  const { data: committees = [], isFetching: isFetchingCommittees } = useGetCommitteesQuery(
    selectedAssocId ? { assoc_id: selectedAssocId } : undefined,
    { skip: !selectedAssocId }
  );

  useEffect(() => {
    if (isOpen) {
      if (editingMember) {
        const memberStartDate = editingMember.role_start_date || editingMember.start_date || "";
        const memberEndDate = editingMember.role_end_date || editingMember.end_date || "";
        const memberAssocId = editingMember.association_id ? String(editingMember.association_id) : "";

        reset({
          association_id: memberAssocId,
          committee_id: editingMember.committee_id ? String(editingMember.committee_id) : "",
          user_id: String(editingMember.user_id),
          start_date: memberStartDate,
          end_date: memberEndDate,
        });

        if (memberAssocId) {
          triggerGetHomeowners(memberAssocId);
        }
      } else {
        reset({
          association_id: "",
          committee_id: "",
          user_id: "",
          start_date: "",
          end_date: "",
        });
      }
    }
  }, [isOpen, editingMember, reset, triggerGetHomeowners]);

  // When association is selected or changed by the user in create mode, reload candidate homeowners & clear dependents
  useEffect(() => {
    if (selectedAssocId && !isEditing) {
      triggerGetHomeowners(selectedAssocId);
      setValue("committee_id", "");
      setValue("user_id", "");
    }
  }, [selectedAssocId, isEditing, triggerGetHomeowners, setValue]);

  const handleFormSubmit = async (values: CommitteeMemberFormValues) => {
    try {
      if (isEditing && editingMember) {
        await updateMember({
          committee_id: values.committee_id,
          user_id: values.user_id,
          data: {
            start_date: values.start_date,
            end_date: values.end_date,
          },
        }).unwrap();
        toast.success("Committee member updated successfully!");
      } else {
        const payload: CommitteeMemberFormData = {
          association_id: values.association_id,
          committee_id: values.committee_id,
          user_id: values.user_id,
          start_date: values.start_date,
          end_date: values.end_date,
        };

        await assignMember(payload).unwrap();
        toast.success("Committee member appointed successfully!");
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(
        err?.data?.detail || err?.message || `Failed to ${isEditing ? "update" : "appoint"} committee member. Please try again.`
      );
    }
  };

  // Top-to-bottom single error display
  const fieldOrder: (keyof CommitteeMemberFormValues)[] = [
    "association_id",
    "committee_id",
    "user_id",
    "start_date",
    "end_date",
  ];
  const activeErrorKey = fieldOrder.find((key) => errors[key]);
  const getFieldError = (key: keyof CommitteeMemberFormValues) =>
    activeErrorKey === key ? errors[key]?.message : undefined;

  const isFormDisabled = isFormSubmitting || isAssigning || isUpdating;

  // Merge editingMember into homeowner options if not present
  const homeownerOptions = useMemo(() => {
    const opts = homeowners.map((h) => ({
      value: String(h.user_id || h.account_id),
      label: `${h.name}${h.email ? ` (${h.email})` : ""}`,
    }));

    if (isEditing && editingMember && !opts.some((o) => o.value === String(editingMember.user_id))) {
      opts.unshift({
        value: String(editingMember.user_id),
        label: `${editingMember.name}${editingMember.email ? ` (${editingMember.email})` : ""}`,
      });
    }

    return opts;
  }, [homeowners, isEditing, editingMember]);

  const committeeOptions = useMemo(() => {
    const options = committees.map((committee) => ({
      value: String(committee.id),
      label: committee.name,
    }));

    // Preserve the assigned committee in edit mode while the filtered list is
    // loading or when an older membership references a committee omitted from it.
    if (
      isEditing &&
      editingMember?.committee_id &&
      !options.some((option) => option.value === String(editingMember.committee_id))
    ) {
      options.unshift({
        value: String(editingMember.committee_id),
        label: editingMember.committee_name || "Assigned committee",
      });
    }

    return options;
  }, [committees, editingMember, isEditing]);

  const getCommitteePlaceholder = () => {
    if (!selectedAssocId) return "Select association first";
    if (isFetchingCommittees) return "Loading committees...";
    if (committeeOptions.length === 0) return "No committees found in this association";
    return "Select target committee";
  };

  const getHomeownerPlaceholder = () => {
    if (!selectedAssocId) return "Select association first";
    if (isFetchingHomeowners) return "Loading homeowners...";
    if (homeownerOptions.length === 0) return "No homeowners available";
    return "Choose a homeowner candidate";
  };

  const getHomeownerHelperText = () => {
    if (isEditing) return "Assigned homeowner member profile";
    if (!selectedAssocId) return "Please select an association first to view eligible candidates.";
    if (isFetchingHomeowners) return "Loading eligible homeowners...";
    if (homeownerOptions.length === 0) return "No homeowners found in this association.";
    return "Select a verified homeowner to appoint to the committee";
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Committee Member" : "Appoint Committee Member"}
      icon={<Users size={18} className="text-slate-800" />}
      size="lg"
      onSubmit={handleSubmit(handleFormSubmit)}
      customFooter={
        <div className="flex items-center justify-end gap-3 w-full">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isFormDisabled}
            className="rounded-xl text-xs font-semibold cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isFormDisabled}
            className="rounded-xl text-xs font-semibold cursor-pointer"
          >
            {isFormDisabled
              ? isEditing
                ? "Saving..."
                : "Appointing..."
              : isEditing
              ? "Save Changes"
              : "Appoint Member"}
          </Button>
        </div>
      }
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
                value={field.value ? String(field.value) : ""}
                onValueChange={field.onChange}
                options={validAssocs.map((a) => ({
                  value: String(a.id),
                  label: a.name,
                }))}
                placeholder={
                  validAssocs.length === 0 ? "Loading associations..." : "Select association"
                }
                disabled={isFormDisabled || isEditing || validAssocs.length === 0}
                error={Boolean(getFieldError("association_id"))}
                size="md"
              />
            )}
          />
        </FormField>

        {/* Committee Selector */}
        <FormField label="Committee" required error={getFieldError("committee_id")}>
          <Controller
            name="committee_id"
            control={control}
            render={({ field }) => (
              <Select
                icon={<Users size={15} />}
                value={field.value ? String(field.value) : ""}
                onValueChange={field.onChange}
                options={committeeOptions}
                placeholder={getCommitteePlaceholder()}
                disabled={
                  isFormDisabled ||
                  isEditing ||
                  !selectedAssocId ||
                  isFetchingCommittees ||
                  committeeOptions.length === 0
                }
                error={Boolean(getFieldError("committee_id"))}
                size="md"
              />
            )}
          />
        </FormField>

        {/* Candidate Selection */}
        <FormField
          label="Select Homeowner"
          required
          error={getFieldError("user_id")}
          helperText={getHomeownerHelperText()}
        >
          <Controller
            name="user_id"
            control={control}
            render={({ field }) => (
              <Select
                icon={<User size={15} />}
                value={field.value ? String(field.value) : ""}
                onValueChange={field.onChange}
                options={homeownerOptions}
                placeholder={getHomeownerPlaceholder()}
                disabled={
                  isFormDisabled ||
                  isEditing ||
                  !selectedAssocId ||
                  isFetchingHomeowners ||
                  homeownerOptions.length === 0
                }
                error={Boolean(getFieldError("user_id"))}
                size="md"
              />
            )}
          />
        </FormField>

        {/* Term Dates Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Term Start Date" required error={getFieldError("start_date")}>
            <Controller
              name="start_date"
              control={control}
              render={({ field }) => (
                <DatePicker
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Select term start date"
                  disabled={isFormDisabled}
                  error={Boolean(getFieldError("start_date"))}
                  size="md"
                />
              )}
            />
          </FormField>

          <FormField label="Term End Date" required error={getFieldError("end_date")}>
            <Controller
              name="end_date"
              control={control}
              render={({ field }) => (
                <DatePicker
                  value={field.value}
                  onChange={field.onChange}
                  minDate={startDate || undefined}
                  placeholder="Select term end date"
                  disabled={isFormDisabled}
                  error={Boolean(getFieldError("end_date"))}
                  size="md"
                />
              )}
            />
          </FormField>
        </div>
      </div>
    </FormModal>
  );
};

export default CommitteeMemberFormModal;
