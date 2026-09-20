import React, { useEffect, useMemo, useState } from "react";
import { Controller, useFieldArray } from "react-hook-form";
import { toast } from "sonner";
import {
  Building,
  Users,
  Calendar,
  Trash2,
  UserPlus,
  User,
} from "lucide-react";
import { FormModal, FormField } from "@/components/common";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { Button } from "@/components/ui/button";
import { useAppForm } from "@/hooks/useAppForm";
import { useAuth } from "@/context/AuthContext";
import { ASSOCIATION_DIRECTORY_ROLE_CODES } from "@/constants/roleCodes";
import { useGetAdminAssociationsQuery } from "@/services/api/associationsApi";
import {
  useCreateCommitteeMutation,
  useUpdateCommitteeMutation,
  useLazyGetAssociationHomeownersQuery,
} from "../api/committeesApi";
import {
  committeeSchema,
  type CommitteeFormData,
} from "../schemas/committeeSchema";
import type { Committee } from "../types";

export interface CommitteeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  committeeToEdit?: Committee | null;
  onSuccess?: () => void;
  adminAssociations?: Array<{ id: string | number; name: string }>;
}

export const CommitteeFormModal: React.FC<CommitteeFormModalProps> = ({
  isOpen,
  onClose,
  committeeToEdit,
  onSuccess,
  adminAssociations = [],
}) => {
  const { account } = useAuth();
  const [createCommittee, { isLoading: isCreating }] =
    useCreateCommitteeMutation();
  const [updateCommittee, { isLoading: isUpdating }] =
    useUpdateCommitteeMutation();

  const [triggerGetHomeowners, { data: homeowners = [], isFetching: isFetchingHomeowners }] =
    useLazyGetAssociationHomeownersQuery();

  const [selectedHomeownerToAdd, setSelectedHomeownerToAdd] = useState<string>("");

  const isSubmitting = isCreating || isUpdating;
  const isEditMode = Boolean(committeeToEdit);
  const canLoadAdminAssociations = ASSOCIATION_DIRECTORY_ROLE_CODES.includes(
    account?.role_code as (typeof ASSOCIATION_DIRECTORY_ROLE_CODES)[number],
  );

  // Fetch admin associations if not provided
  const { data: fetchedAssocs = [] } = useGetAdminAssociationsQuery(undefined, {
    skip: !isOpen || !canLoadAdminAssociations || adminAssociations.length > 0,
  });

  const effectiveAssocs = adminAssociations.length > 0 ? adminAssociations : fetchedAssocs;

  const validAssocs = useMemo(
    () => effectiveAssocs.filter((a) => String(a.id) !== "ALL" && a.name !== "All Associations"),
    [effectiveAssocs]
  );

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useAppForm<CommitteeFormData>({
    schema: committeeSchema,
    defaultValues: {
      association_id: "",
      name: "",
      description: "",
      start_date: "",
      end_date: "",
      members: [],
    },
  });

  const { fields: memberFields, append, remove } = useFieldArray({
    control,
    name: "members",
  });

  const selectedAssocId = watch("association_id");
  const committeeStartDate = watch("start_date");
  const committeeEndDate = watch("end_date");
  const currentMembers = watch("members") || [];

  // When modal opens or resets
  useEffect(() => {
    if (isOpen) {
      setSelectedHomeownerToAdd("");
      if (committeeToEdit) {
        const initialMembers = (committeeToEdit.members || []).map((m) => ({
          user_id: m.user_id,
          name: m.name,
          email: m.email,
          profile_pic_url: m.profile_pic_url,
          start_date: m.start_date || committeeToEdit.start_date || "",
          end_date: m.end_date || committeeToEdit.end_date || "",
        }));

        reset({
          association_id: String(committeeToEdit.association_id || ""),
          name: committeeToEdit.name || "",
          description: committeeToEdit.description || "",
          start_date: committeeToEdit.start_date || "",
          end_date: committeeToEdit.end_date || "",
          members: initialMembers,
        });

        if (committeeToEdit.association_id) {
          triggerGetHomeowners(committeeToEdit.association_id);
        }
      } else {
        // Never auto-select anything in Add modal
        reset({
          association_id: "",
          name: "",
          description: "",
          start_date: "",
          end_date: "",
          members: [],
        });
      }
    }
  }, [isOpen, committeeToEdit, reset, triggerGetHomeowners]);

  // Load homeowners when association changes
  useEffect(() => {
    if (selectedAssocId && selectedAssocId !== "ALL") {
      triggerGetHomeowners(selectedAssocId);
    }
  }, [selectedAssocId, triggerGetHomeowners]);

  // Available homeowners that are not yet added to the committee
  const availableHomeownerOptions = useMemo(() => {
    const assignedUserIds = new Set(currentMembers.map((m) => m.user_id));
    return homeowners
      .filter((h) => !assignedUserIds.has(h.user_id))
      .map((h) => ({
        value: h.user_id,
        label: h.name ? `${h.name}${h.email ? ` (${h.email})` : ""}` : h.email || "Unnamed User",
      }));
  }, [homeowners, currentMembers]);

  const handleAddMember = (userId: string) => {
    if (!userId) return;
    const found = homeowners.find((h) => h.user_id === userId);
    if (found) {
      append({
        user_id: found.user_id,
        name: found.name,
        email: found.email,
        profile_pic_url: found.profile_pic_url,
        start_date: committeeStartDate || "",
        end_date: committeeEndDate || "",
      });
      setSelectedHomeownerToAdd("");
    }
  };

  const onSubmit = async (data: CommitteeFormData) => {
    try {
      const formattedMembers = (data.members || []).map((m) => ({
        user_id: m.user_id,
        start_date: m.start_date || undefined,
        end_date: m.end_date || undefined,
      }));

      if (isEditMode && committeeToEdit) {
        await updateCommittee({
          id: committeeToEdit.id,
          data: {
            association_id: data.association_id,
            name: data.name.trim(),
            description: data.description?.trim() || undefined,
            start_date: data.start_date || undefined,
            end_date: data.end_date || undefined,
            members: formattedMembers,
          },
        }).unwrap();
        toast.success("Committee updated successfully");
      } else {
        await createCommittee({
          association_id: data.association_id,
          name: data.name.trim(),
          description: data.description?.trim() || undefined,
          start_date: data.start_date || undefined,
          end_date: data.end_date || undefined,
          members: formattedMembers,
        }).unwrap();
        toast.success("Committee created successfully");
      }

      onSuccess?.();
      onClose();
    } catch (err: any) {
      toast.error(
        err.data?.detail || err.message || "Failed to save committee"
      );
    }
  };

  // Top-to-bottom error prioritization
  const fieldOrder: (keyof CommitteeFormData)[] = [
    "association_id",
    "name",
    "start_date",
    "end_date",
    "description",
  ];
  const activeErrorKey = fieldOrder.find((key) => errors[key]);
  const getFieldError = (key: keyof CommitteeFormData) =>
    activeErrorKey === key ? errors[key]?.message : undefined;

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? "Edit Committee" : "Add Committee"}
      icon={<Users size={18} className="text-slate-800" />}
      size="xl"
      isSubmitting={isSubmitting}
      submitText={isEditMode ? "Update Committee" : "Create Committee"}
      loadingText={isEditMode ? "Updating Committee..." : "Creating Committee..."}
      submitVariant="default"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="space-y-4 py-1">
        {/* Association Selector */}
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
                onValueChange={(val) => {
                  field.onChange(val);
                  // Clear member fields if association changed
                  if (val !== field.value && !isEditMode) {
                    setValue("members", []);
                  }
                }}
                options={validAssocs.map((a) => ({
                  value: String(a.id),
                  label: a.name,
                }))}
                placeholder={
                  validAssocs.length === 0
                    ? "Loading associations..."
                    : "Select association"
                }
                disabled={isSubmitting || validAssocs.length === 0}
                error={Boolean(getFieldError("association_id"))}
                size="md"
              />
            )}
          />
        </FormField>

        {/* Committee Name */}
        <FormField label="Committee Name" required error={getFieldError("name")}>
          <Input
            placeholder="e.g. Architectural Review Committee, Social Events, Maintenance"
            disabled={isSubmitting}
            {...register("name")}
          />
        </FormField>

        {/* Term Dates Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            label="Committee Start Date"
            error={getFieldError("start_date")}
          >
            <Controller
              name="start_date"
              control={control}
              render={({ field }) => (
                <DatePicker
                  value={field.value || undefined}
                  onChange={field.onChange}
                  placeholder="Select committee start date"
                  disabled={isSubmitting}
                  error={Boolean(getFieldError("start_date"))}
                  size="md"
                />
              )}
            />
          </FormField>

          <FormField
            label="Committee End Date"
            error={getFieldError("end_date")}
          >
            <Controller
              name="end_date"
              control={control}
              render={({ field }) => (
                <DatePicker
                  value={field.value || undefined}
                  onChange={field.onChange}
                  minDate={committeeStartDate || undefined}
                  placeholder="Select committee end date"
                  disabled={isSubmitting}
                  error={Boolean(getFieldError("end_date"))}
                  size="md"
                />
              )}
            />
          </FormField>
        </div>

        {/* Description */}
        <FormField label="Description" error={getFieldError("description")}>
          <Textarea
            placeholder="Describe the committee's charter, scope, duties, or guidelines..."
            disabled={isSubmitting}
            rows={3}
            {...register("description")}
          />
        </FormField>

        {/* Assign Members Section */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <div>
            <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
              <UserPlus size={16} className="text-slate-500" />
              <span>Assign Members (Optional)</span>
            </h3>
          </div>

          {/* Member Selector Dropdown */}
          <Select
            icon={<User size={15} />}
            value={selectedHomeownerToAdd}
            onValueChange={(val) => {
              setSelectedHomeownerToAdd(val);
              handleAddMember(val);
            }}
            options={availableHomeownerOptions}
            placeholder={
              !selectedAssocId
                ? "-- Select association first --"
                : isFetchingHomeowners
                ? "Loading members..."
                : availableHomeownerOptions.length === 0
                ? "-- No more available members --"
                : "-- Select Committee Member --"
            }
            disabled={
              isSubmitting ||
              !selectedAssocId ||
              isFetchingHomeowners ||
              availableHomeownerOptions.length === 0
            }
            size="md"
          />

          {/* Assigned Members List */}
          {memberFields.length > 0 && (
            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {memberFields.map((field, index) => {
                const memberStart = watch(`members.${index}.start_date`);
                const memberError = errors.members?.[index]?.end_date?.message;

                return (
                  <div
                    key={field.id}
                    className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-slate-800 text-xs truncate">
                        {field.name || "Member"}
                      </p>
                      {field.email && (
                        <p className="text-[11px] text-slate-400 truncate">
                          {field.email}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0 flex-wrap sm:flex-nowrap">
                      {/* Role Start Date */}
                      <div className="w-36">
                        <span className="block text-[10px] font-medium text-slate-500 mb-0.5">
                          Role Start
                        </span>
                        <Controller
                          name={`members.${index}.start_date`}
                          control={control}
                          render={({ field: startField }) => (
                            <DatePicker
                              value={startField.value || undefined}
                              onChange={startField.onChange}
                              placeholder="Role start"
                              disabled={isSubmitting}
                            />
                          )}
                        />
                      </div>

                      {/* Role End Date */}
                      <div className="w-36">
                        <span className="block text-[10px] font-medium text-slate-500 mb-0.5">
                          Role End
                        </span>
                        <Controller
                          name={`members.${index}.end_date`}
                          control={control}
                          render={({ field: endField }) => (
                            <DatePicker
                              value={endField.value || undefined}
                              onChange={endField.onChange}
                              minDate={memberStart || undefined}
                              placeholder="Role end"
                              disabled={isSubmitting}
                              error={Boolean(memberError)}
                            />
                          )}
                        />
                      </div>

                      {/* Remove Member Button */}
                      <div className="pt-3.5">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => remove(index)}
                          disabled={isSubmitting}
                          className="h-8 w-8 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg cursor-pointer"
                          title="Remove member"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </FormModal>
  );
};

export default CommitteeFormModal;
