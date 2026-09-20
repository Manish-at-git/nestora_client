import React, { useEffect, useMemo } from "react";
import { Controller } from "react-hook-form";
import { toast } from "sonner";
import { Building, Calendar, Shield, User } from "lucide-react";
import { FormModal, FormField } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { useAppForm } from "@/hooks/useAppForm";
import { useGetAdminAssociationsQuery } from "@/services/api/associationsApi";
import {
  useAddBoardMemberMutation,
  useLazyGetAssociationHomeownersQuery,
} from "../api/boardMembersApi";
import { boardMemberSchema, type BoardMemberFormValues } from "../schemas";
import type { BoardMemberFormData } from "../types";

export interface BoardMemberFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  adminAssociations?: Array<{ id: string | number; name: string }>;
  selectedAssociationId?: string | number;
}

export const BoardMemberFormModal: React.FC<BoardMemberFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  adminAssociations = [],
}) => {
  const [addBoardMember, { isLoading: isNominating }] = useAddBoardMemberMutation();
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
  } = useAppForm<BoardMemberFormValues>({
    schema: boardMemberSchema,
    defaultValues: {
      association_id: "",
      account_id: "",
      term_start_date: "",
      term_end_date: "",
    },
  });

  const selectedAssocId = watch("association_id");
  const termStartDate = watch("term_start_date");

  useEffect(() => {
    if (isOpen) {
      reset({
        association_id: "",
        account_id: "",
        term_start_date: "",
        term_end_date: "",
      });
    }
  }, [isOpen, reset]);

  // When association is selected or changed by the user, load candidate homeowners
  useEffect(() => {
    if (selectedAssocId) {
      triggerGetHomeowners(selectedAssocId);
      setValue("account_id", "");
    }
  }, [selectedAssocId, triggerGetHomeowners, setValue]);

  const handleFormSubmit = async (values: BoardMemberFormValues) => {
    try {
      const payload: BoardMemberFormData = {
        association_id: values.association_id,
        account_id: values.account_id,
        term_start_date: values.term_start_date,
        term_end_date: values.term_end_date,
      };

      await addBoardMember(payload).unwrap();
      toast.success("Board member nominated successfully!");
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(
        err?.data?.detail || err?.message || "Failed to nominate board member. Please try again."
      );
    }
  };

  // Top-to-bottom single error display
  const fieldOrder: (keyof BoardMemberFormValues)[] = [
    "association_id",
    "account_id",
    "term_start_date",
    "term_end_date",
  ];
  const activeErrorKey = fieldOrder.find((key) => errors[key]);
  const getFieldError = (key: keyof BoardMemberFormValues) =>
    activeErrorKey === key ? errors[key]?.message : undefined;

  const isFormDisabled = isFormSubmitting || isNominating;

  const homeownerOptions = homeowners.map((h) => ({
    value: String(h.account_id),
    label: `${h.name}${h.email ? ` (${h.email})` : ""}`,
  }));

  const getHomeownerPlaceholder = () => {
    if (!selectedAssocId) return "Select association first";
    if (isFetchingHomeowners) return "Loading homeowners...";
    if (homeownerOptions.length === 0) return "No homeowners available";
    return "Choose a homeowner candidate";
  };

  const getHomeownerHelperText = () => {
    if (!selectedAssocId) return "Please select an association first to view eligible candidates.";
    if (isFetchingHomeowners) return "Loading eligible homeowners...";
    if (homeownerOptions.length === 0) return "No homeowners found in this association.";
    return "Select a verified homeowner to grant Board Member privileges";
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title="Nominate Board Member"
      icon={<Shield size={18} className="text-slate-800" />}
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
            {isFormDisabled ? "Nominating..." : "Nominate Member"}
          </Button>
        </div>
      }
    >
      <div className="space-y-4 py-1">
        {/* Association Selector */}
        <FormField label="Target Association" required error={getFieldError("association_id")}>
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
                disabled={isFormDisabled || validAssocs.length === 0}
                error={Boolean(getFieldError("association_id"))}
                size="md"
              />
            )}
          />
        </FormField>

        {/* Homeowner Candidate Selection */}
        <FormField
          label="Select Homeowner"
          required
          error={getFieldError("account_id")}
          helperText={getHomeownerHelperText()}
        >
          <Controller
            name="account_id"
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
                  !selectedAssocId ||
                  isFetchingHomeowners ||
                  homeownerOptions.length === 0
                }
                error={Boolean(getFieldError("account_id"))}
                size="md"
              />
            )}
          />
        </FormField>

        {/* Term Dates Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Term Start Date" required error={getFieldError("term_start_date")}>
            <Controller
              name="term_start_date"
              control={control}
              render={({ field }) => (
                <DatePicker
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Select term start date"
                  disabled={isFormDisabled}
                  error={Boolean(getFieldError("term_start_date"))}
                  size="md"
                />
              )}
            />
          </FormField>

          <FormField label="Term End Date" required error={getFieldError("term_end_date")}>
            <Controller
              name="term_end_date"
              control={control}
              render={({ field }) => (
                <DatePicker
                  value={field.value}
                  onChange={field.onChange}
                  minDate={termStartDate || undefined}
                  placeholder="Select term end date"
                  disabled={isFormDisabled}
                  error={Boolean(getFieldError("term_end_date"))}
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

export default BoardMemberFormModal;
