import React, { useEffect, useState, useMemo } from "react";
import { Controller } from "react-hook-form";
import { toast } from "sonner";
import {
  Calendar as CalendarIcon,
  Video,
  Building2,
  Users,
  User,
  Clock,
} from "lucide-react";
import { FormModal, FormField, FileUploadZone } from "@/components/common";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { TimePicker } from "@/components/ui/time-picker";
import { Button } from "@/components/ui/button";
import { useAppForm } from "@/hooks/useAppForm";
import { useAuth } from "@/context/AuthContext";
import apiClient from "@/services/api/apiClient";
import { useGetAdminAssociationsQuery } from "@/services/api/associationsApi";
import {
  ASSOCIATION_DIRECTORY_ROLE_CODES,
  ROLE_CODE,
} from "@/constants/roleCodes";
import {
  useCreateMeetingMutation,
  useUpdateMeetingDetailsMutation,
} from "../api/meetingsApi";
import {
  meetingSchema,
  type MeetingFormData,
  MEETING_TYPES,
  PRIORITIES,
  AUDIENCES,
  DURATIONS,
} from "../schemas";
import type { Meeting } from "../types";

const normalizeMeetingTime = (value?: string | null) => {
  if (!value) return "";
  const match = String(value).match(/^(\d{1,2}:\d{2})/);
  return match?.[1] || "";
};

export interface MeetingFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  meetingToEdit?: Meeting | null;
  onSuccess?: () => void;
  adminAssociations?: Array<{ id: string | number; name: string }>;
  selectedAssociationId?: string | number;
}

export const MeetingFormModal: React.FC<MeetingFormModalProps> = ({
  isOpen,
  onClose,
  meetingToEdit,
  onSuccess,
  adminAssociations = [],
  selectedAssociationId,
}) => {
  const { account, profile } = useAuth();
  const [createMeeting, { isLoading: isCreating }] = useCreateMeetingMutation();
  const [updateMeetingDetails, { isLoading: isUpdating }] =
    useUpdateMeetingDetailsMutation();

  const isEditMode = Boolean(meetingToEdit);
  const isBoardMember = account?.role_code === ROLE_CODE.BOARD_MEMBER;
  const canLoadAdminAssociations = ASSOCIATION_DIRECTORY_ROLE_CODES.includes(
    account?.role_code as (typeof ASSOCIATION_DIRECTORY_ROLE_CODES)[number],
  );

  // Fallback query to load associations if not passed via props
  const { data: fetchedAssocs = [], isLoading: isAssocsLoading } =
    useGetAdminAssociationsQuery(undefined, {
      skip:
        !isOpen ||
        !canLoadAdminAssociations ||
        (adminAssociations && adminAssociations.length > 0),
    });

  const effectiveAdminAssociations = useMemo(() => {
    if (adminAssociations && adminAssociations.length > 0) {
      return adminAssociations;
    }
    if (fetchedAssocs && fetchedAssocs.length > 0) {
      return fetchedAssocs;
    }
    if (account?.association_id) {
      return [
        {
          id: account.association_id,
          name:
            account.association_name || `Association ${account.association_id}`,
        },
      ];
    }
    return [];
  }, [adminAssociations, fetchedAssocs, account]);

  const validAssociations = useMemo(
    () =>
      effectiveAdminAssociations.filter(
        (a) => String(a.id) !== "ALL" && a.name !== "All Associations"
      ),
    [effectiveAdminAssociations]
  );

  const [boardMembers, setBoardMembers] = useState<
    Array<{ account_id?: string | number; user_id?: string | number; name: string; email?: string }>
  >([]);
  const [blocks, setBlocks] = useState<Array<{ id: string | number; name: string }>>([]);
  const [fetchingMembers, setFetchingMembers] = useState(false);
  const [fetchingBlocks, setFetchingBlocks] = useState(false);

  const minDate = new Date().toISOString().split("T")[0];

  // const defaultAssocId =
  //   selectedAssociationId && selectedAssociationId !== "ALL"
  //     ? String(selectedAssociationId)
  //     : validAssociations.length === 1
  //     ? String(validAssociations[0].id)
  //     : validAssociations[0]?.id
  //     ? String(validAssociations[0].id)
  //     : "";

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    clearErrors,
    formState: { errors },
  } = useAppForm<MeetingFormData>({
    schema: meetingSchema,
    defaultValues: {
      association_id: "",
      title: "",
      meeting_type: "",
      priority: "",
      audience: "",
      agenda: "",
      description: "",
      meeting_date: "",
      meeting_time: "",
      duration: "",
      venue: "",
      meeting_link: "",
      organizer: "",
      attachment_url: "",
      target_block_id: "",
    },
  });

  const selectedAssoc = watch("association_id");
  const currentAudience = watch("audience");
  const watchAttachmentUrl = watch("attachment_url");

  // Populate data when modal opens
  useEffect(() => {
    if (isOpen) {
      if (meetingToEdit) {
        reset({
          association_id: String(
            meetingToEdit.association_id || selectedAssociationId
          ),
          title: meetingToEdit.title || "",
          meeting_type: meetingToEdit.meeting_type || "",
          priority: meetingToEdit.priority || "",
          audience: meetingToEdit.audience || "",
          agenda: meetingToEdit.agenda || "",
          description: meetingToEdit.description || "",
          meeting_date: meetingToEdit.meeting_date
            ? meetingToEdit.meeting_date.split("T")[0]
            : "",
          meeting_time: normalizeMeetingTime(meetingToEdit.meeting_time),
          duration: meetingToEdit.duration || "",
          venue: meetingToEdit.venue || "",
          meeting_link: meetingToEdit.meeting_link || "",
          organizer: String(meetingToEdit.organizer || ""),
          attachment_url: meetingToEdit.attachment_url || "",
          target_block_id: meetingToEdit.target_block_id
            ? String(meetingToEdit.target_block_id)
            : "",
        });
      } else {
        reset({
          association_id: isBoardMember ? "me" : "",
          title: "",
          meeting_type: "",
          priority: "",
          audience: "",
          agenda: "",
          description: "",
          meeting_date: "",
          meeting_time: "",
          duration: "",
          venue: "",
          meeting_link: "",
          organizer: "",
          attachment_url: "",
          target_block_id: "",
        });
      }
    }
  }, [isOpen, meetingToEdit, selectedAssociationId, reset, isBoardMember]);

  // Fetch Board Members for Organizer selection
  useEffect(() => {
    if (!isOpen) return;
    const assocId = selectedAssoc;
    if (assocId && assocId !== "me") {
      setFetchingMembers(true);
      apiClient
        .get(`/associations/${assocId}/board-members`)
        .then((res) => {
          const members = res.data?.data || [];
          setBoardMembers(members);
        })
        .catch(() => {})
        .finally(() => setFetchingMembers(false));
    }
  }, [isOpen, selectedAssoc]);

  // Fetch Blocks when Audience is Homeowner
  useEffect(() => {
    if (!isOpen) return;
    const assocId = selectedAssoc;
    if (assocId && currentAudience === "Homeowner") {
      setFetchingBlocks(true);
      apiClient
        .get(`/associations/${assocId}/blocks`)
        .then((res) => {
          setBlocks(res.data?.data || []);
        })
        .catch(() => {})
        .finally(() => setFetchingBlocks(false));
    } else {
      setBlocks([]);
      setValue("target_block_id", "");
    }
  }, [isOpen, selectedAssoc, currentAudience, setValue]);

  const handleGenerateMeetLink = () => {
    const mockId = Math.random().toString(36).substring(2, 12);
    const link = `https://meet.google.com/${mockId.substring(0, 3)}-${mockId.substring(3, 7)}-${mockId.substring(7, 10)}`;
    setValue("meeting_link", link, { shouldValidate: true, shouldDirty: true });
    if (errors.meeting_link) {
      clearErrors("meeting_link");
    }
  };

  const onSubmit = async (data: MeetingFormData) => {
    const payload = {
      ...data,
      title: data.title.trim(),
      agenda: data.agenda.trim(),
      description: data.description?.trim() || "",
      venue: data.venue.trim(),
      meeting_link: data.meeting_link?.trim() || undefined,
      attachment_url: data.attachment_url?.trim() || undefined,
      target_block_id: data.target_block_id?.trim() || undefined,
    };

    try {
      if (isEditMode && meetingToEdit) {
        await updateMeetingDetails({ id: meetingToEdit.id, ...payload }).unwrap();
        toast.success("Meeting details updated successfully");
      } else {
        await createMeeting(payload).unwrap();
        toast.success("Meeting scheduled successfully");
      }
      onSuccess?.();
      onClose();
    } catch (err: any) {
      toast.error(
        err.data?.detail || err.message || "Failed to save meeting details"
      );
    }
  };

  const isSubmitting = isCreating || isUpdating;

  // Field error priority order (aligned with form visual order)
  const fieldOrder: (keyof MeetingFormData)[] = [
    "title",
    "association_id",
    "meeting_type",
    "priority",
    "audience",
    "target_block_id",
    "organizer",
    "agenda",
    "meeting_date",
    "meeting_time",
    "duration",
    "venue",
    "meeting_link",
    "description",
    "attachment_url",
  ];
  const activeErrorKey = fieldOrder.find((key) => errors[key]);
  const getFieldError = (key: keyof MeetingFormData) =>
    activeErrorKey === key ? errors[key]?.message : undefined;

  const associationOptions = useMemo(() => {
    return validAssociations.map((assoc) => ({
      value: String(assoc.id),
      label: assoc.name,
    }));
  }, [validAssociations]);

  const organizerOptions = useMemo(() => {
    const options = boardMembers.map((m) => {
      const id = String(m.account_id || m.user_id || "");
      return {
        value: id,
        label: m.name,
        description: m.email || undefined,
      };
    });

    // If current logged-in user is not in the list, offer them as an organizer option
    const currentUserId = account?.id || (account as any)?.account_id;
    if (currentUserId && !options.some((o) => o.value === String(currentUserId))) {
      const displayName =
        profile?.name || account?.name || account?.email || "Admin";
      options.unshift({
        value: String(currentUserId),
        label: `${displayName} (${account?.role_code || "Organizer"})`,
        description: account?.email || undefined,
      });
    }

    // If editing a meeting and existing organizer isn't in options, preserve them
    if (
      meetingToEdit?.organizer &&
      !options.some((o) => o.value === String(meetingToEdit.organizer))
    ) {
      options.unshift({
        value: String(meetingToEdit.organizer),
        label: meetingToEdit.organizer_name || "Assigned Organizer",
        description: undefined,
      });
    }

    return options;
  }, [boardMembers, account, profile, meetingToEdit]);

  const blockOptions = useMemo(() => {
    return [
      { value: "", label: "All Association Blocks" },
      ...blocks.map((b) => ({
        value: String(b.id),
        label: `${b.name} Block`,
      })),
    ];
  }, [blocks]);

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? "Edit Meeting Details" : "Schedule Meeting"}
      icon={<CalendarIcon size={18} className="text-slate-800" />}
      size="2xl"
      isSubmitting={isSubmitting}
      submitText={isEditMode ? "Save Changes" : "Schedule Meeting"}
      loadingText={isEditMode ? "Saving Changes" : "Saving Meeting"}
      submitVariant="default"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="space-y-4">

        <FormField
          label="Meeting Title"
          required
          error={getFieldError("title")}
        >
          <Input
            placeholder="e.g. Annual General Body Meeting (AGM) 2026"
            disabled={isSubmitting}
            autoFocus
            maxLength={100}
            {...register("title")}
          />
        </FormField>

          {!isBoardMember && <FormField
            label="Association"
            required
            error={getFieldError("association_id")}
          >
            <Controller
              name="association_id"
              control={control}
              render={({ field }) => (
                <Select
                  icon={<Building2 size={15} />}
                  options={associationOptions}
                  value={field.value || ""}
                  onValueChange={field.onChange}
                  placeholder={
                    isAssocsLoading ? "Loading associations..." : "Select Association"
                  }
                  disabled={isSubmitting || isAssocsLoading}
                  error={Boolean(getFieldError("association_id"))}
                />
              )}
            />
          </FormField>}

        {/* Meeting Type & Priority */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            label="Meeting Type"
            required
            error={getFieldError("meeting_type")}
          >
            <Controller
              name="meeting_type"
              control={control}
              render={({ field }) => (
                <Select
                  options={MEETING_TYPES.map((t) => ({ value: t, label: t }))}
                  value={field.value || ""}
                  onValueChange={field.onChange}
                  placeholder="Select meeting type"
                  disabled={isSubmitting}
                  error={Boolean(getFieldError("meeting_type"))}
                />
              )}
            />
          </FormField>

          <FormField label="Priority" required error={getFieldError("priority")}>
            <Controller
              name="priority"
              control={control}
              render={({ field }) => (
                <Select
                  options={PRIORITIES.map((p) => ({ value: p, label: `${p} Priority` }))}
                  value={field.value || ""}
                  onValueChange={field.onChange}
                  placeholder="Select priority"
                  disabled={isSubmitting}
                  error={Boolean(getFieldError("priority"))}
                />
              )}
            />
          </FormField>
        </div>

        {/* Audience & Target Block */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            label="Target Audience (RSVP & Alerts)"
            required
            error={getFieldError("audience")}
          >
            <Controller
              name="audience"
              control={control}
              render={({ field }) => (
                <Select
                  icon={<Users size={15} />}
                  options={AUDIENCES.map((a) => ({ value: a, label: a }))}
                  value={field.value || ""}
                  onValueChange={(val) => {
                    field.onChange(val);
                    if (val !== "Homeowner") {
                      setValue("target_block_id", "");
                    }
                  }}
                  placeholder="Select target audience"
                  disabled={isSubmitting}
                  error={Boolean(getFieldError("audience"))}
                />
              )}
            />
          </FormField>

          {currentAudience === "Homeowner" && (
            <FormField
              label="Block Scope (Optional)"
              helperText="Notify all blocks or isolate to a single block"
              error={getFieldError("target_block_id")}
            >
              <Controller
                name="target_block_id"
                control={control}
                render={({ field }) => (
                  <Select
                    options={blockOptions}
                    value={field.value || ""}
                    onValueChange={field.onChange}
                    placeholder={
                      fetchingBlocks ? "Loading blocks" : "All Association Blocks"
                    }
                    disabled={isSubmitting || fetchingBlocks}
                    error={Boolean(getFieldError("target_block_id"))}
                  />
                )}
              />
            </FormField>
          )}

          {/* Organizer */}
          <FormField
            label="Organizer"
            required
            error={getFieldError("organizer")}
            className={currentAudience !== "Homeowner" ? "sm:col-span-1" : "sm:col-span-2"}
          >
            <Controller
              name="organizer"
              control={control}
              render={({ field }) => (
                <Select
                  icon={<User size={15} />}
                  options={organizerOptions}
                  value={field.value || ""}
                  onValueChange={field.onChange}
                  placeholder={
                    fetchingMembers
                      ? "Loading organizers"
                      : organizerOptions.length === 0
                      ? "No organizers found"
                      : "Select meeting organizer"
                  }
                  disabled={isSubmitting || fetchingMembers}
                  error={Boolean(getFieldError("organizer"))}
                />
              )}
            />
          </FormField>
        </div>

        {/* Agenda */}
        <FormField
          label="Meeting Agenda"
          required
          error={getFieldError("agenda")}
        >
          <Input
            placeholder="Brief goals and topics for review"
            disabled={isSubmitting}
            maxLength={100}
            {...register("agenda")}
          />
        </FormField>

        {/* Date, Time & Duration */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <FormField label="Meeting Date" required error={getFieldError("meeting_date")}>
            <Controller
              name="meeting_date"
              control={control}
              render={({ field }) => (
                <DatePicker
                  value={field.value}
                  onChange={(val) => {
                    field.onChange(val);
                  }}
                  minDate={minDate}
                  placeholder="Select date"
                  disabled={isSubmitting}
                  error={Boolean(getFieldError("meeting_date"))}
                />
              )}
            />
          </FormField>

          <FormField label="Meeting Time" required error={getFieldError("meeting_time")}>
            <Controller
              name="meeting_time"
              control={control}
              render={({ field }) => (
                <TimePicker
                  value={field.value}
                  onChange={(val) => {
                    field.onChange(val);
                  }}
                  placeholder="Select time"
                  disabled={isSubmitting}
                  error={Boolean(getFieldError("meeting_time"))}
                />
              )}
            />
          </FormField>

          <FormField label="Duration" required error={getFieldError("duration")}>
            <Controller
              name="duration"
              control={control}
              render={({ field }) => (
                <Select
                  icon={<Clock size={15} />}
                  options={DURATIONS.map((d) => ({ value: d, label: d }))}
                  value={field.value || ""}
                  onValueChange={field.onChange}
                  placeholder="Select duration"
                  disabled={isSubmitting}
                  error={Boolean(getFieldError("duration"))}
                />
              )}
            />
          </FormField>
        </div>

        {/* Venue */}
        <FormField
          label="Venue / Meeting Location"
          required
          error={getFieldError("venue")}
        >
          <Input
            placeholder="e.g. Community Clubhouse Hall A or Online Meet"
            disabled={isSubmitting}
            maxLength={100}
            {...register("venue")}
          />
        </FormField>

        {/* Virtual Meeting Link */}
        <FormField
          label="Virtual Meeting Link (Optional)"
          error={getFieldError("meeting_link")}
        >
          <div className="flex gap-2 items-center">
            <Input
              placeholder="https://meet.google.com/..."
              disabled={isSubmitting}
              {...register("meeting_link")}
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleGenerateMeetLink}
              disabled={isSubmitting}
            >
              <Video size={14} className="text-indigo-600" />
              <span>Auto-generate</span>
            </Button>
          </div>
        </FormField>

        {/* Description */}
        <FormField
          label="Detailed Description & Notes"
          error={getFieldError("description")}
        >
          <Textarea
            placeholder="Provide discussion context, resolutions up for vote, and advance instructions..."
            rows={3}
            maxLength={5000}
            disabled={isSubmitting}
            className="resize-none text-xs"
            {...register("description")}
          />
        </FormField>

        {/* Document Attachment using common FileUploadZone */}
        <FormField
          label="Document Attachment (Optional)"
          error={getFieldError("attachment_url")}
        >
          <FileUploadZone
            value={watchAttachmentUrl}
            onChange={(url) =>
              setValue("attachment_url", url, {
                shouldValidate: true,
                shouldDirty: true,
              })
            }
            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
            maxSizeMB={25}
            label="Upload Document Attachment"
            helperText="PDF, DOC, DOCX, or Image (Max 25MB)"
            disabled={isSubmitting}
          />
        </FormField>
      </div>
    </FormModal>
  );
};

export default MeetingFormModal;
