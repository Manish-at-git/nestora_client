import React, { useEffect, useMemo, useState } from "react";
import { Controller } from "react-hook-form";
import { toast } from "sonner";
import {
  Calendar,
  Building,
  MapPin,
  IndianRupee,
  Users,
  Clock,
  Phone,
  User as UserIcon,
  Eye,
} from "lucide-react";
import { FormModal, FormField, FileUploadZone } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { useAppForm } from "@/hooks/useAppForm";
import { useAuth } from "@/context/AuthContext";
import { uploadMediaAsset } from "@/lib/cloudUploader";
import { ROLE_CODE } from "@/constants/roleCodes";
import { useCreateEventMutation, useUpdateEventMutation } from "../api/eventsApi";
import { eventSchema, type EventFormValues } from "../schemas";
import type { EventItem, EventFormData } from "../types";
import { EventOverviewModal } from "./EventOverviewModal";

export interface EventFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialData?: EventItem | null;
  adminAssociations?: Array<{ id: string | number; name: string }>;
  selectedAssociationId?: string | number;
  onSubmit?: (data: EventFormData) => Promise<void>;
  loading?: boolean;
  associationsLoading?: boolean;
}

const CATEGORY_OPTIONS = [
  { value: "Festival", label: "Festival" },
  { value: "Community Gathering", label: "Community Gathering" },
  { value: "Meeting", label: "Official Meeting" },
  { value: "Sports & Fitness", label: "Sports & Fitness" },
  { value: "Kids & Family", label: "Kids & Family" },
  { value: "Holiday Celebration", label: "Holiday Celebration" },
  { value: "Maintenance", label: "Maintenance Window" },
];

const AUDIENCE_OPTIONS = [
  { value: "Homeowners", label: "Homeowners" },
  { value: "All", label: "All Members & Residents" },
  { value: "Board Member", label: "Board Members Only" },
  { value: "Committee Members", label: "Committee Members Only" },
  { value: "Tenant", label: "Tenants Only" },
];

export const EventFormModal: React.FC<EventFormModalProps> = ({
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
  const [isUploading, setIsUploading] = useState(false);
  const [draftSubmitting, setDraftSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [createEvent, { isLoading: isCreating }] = useCreateEventMutation();
  const [updateEvent, { isLoading: isUpdating }] = useUpdateEventMutation();

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
  } = useAppForm<EventFormValues>({
    schema: eventSchema,
    defaultValues: {
      association_id: "",
      title: "",
      category: "",
      description: "",
      banner_url: "",
      starts_at: "",
      ends_at: "",
      location: "",
      is_registration_required: false,
      registration_deadline: "",
      max_capacity: undefined,
      audience: "",
      send_notifications: false,
      is_paid: false,
      fee_amount: undefined,
      organizer_name: "",
      organizer_contact: "",
      status: "Published",
    },
  });

  const formValues = watch();
  const bannerUrl = watch("banner_url");
  const isPaid = watch("is_paid");
  const isRegistrationRequired = watch("is_registration_required");
  const startsAt = watch("starts_at");

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset({
          association_id: initialData.association_id ? String(initialData.association_id) : "",
          title: initialData.title || "",
          category: initialData.category || "",
          description: initialData.description || "",
          banner_url: initialData.banner_url || "",
          starts_at: initialData.starts_at ? initialData.starts_at.slice(0, 16) : "",
          ends_at: initialData.ends_at ? initialData.ends_at.slice(0, 16) : "",
          location: initialData.location || "",
          is_registration_required: Boolean(initialData.is_registration_required),
          registration_deadline: initialData.registration_deadline
            ? initialData.registration_deadline.slice(0, 16)
            : "",
          max_capacity: initialData.max_capacity ?? undefined,
          audience: initialData.audience || "",
          send_notifications: false,
          is_paid: Boolean(initialData.is_paid),
          fee_amount: initialData.fee_amount ?? undefined,
          organizer_name: initialData.organizer_name || "",
          organizer_contact: initialData.organizer_contact || "",
          status: initialData.status || "Published",
        });
      } else {
        reset({
          association_id: selectedAssociationId ? String(selectedAssociationId) : "",
          title: "",
          category: "",
          description: "",
          banner_url: "",
          starts_at: "",
          ends_at: "",
          location: "",
          is_registration_required: false,
          registration_deadline: "",
          max_capacity: undefined,
          audience: "",
          send_notifications: false,
          is_paid: false,
          fee_amount: undefined,
          organizer_name: "",
          organizer_contact: "",
          status: "Published",
        });
      }
    }
  }, [isOpen, initialData, selectedAssociationId, reset]);

  const handleFormSubmit = async (data: EventFormValues) => {
    const associationId = data.association_id || selectedAssociationId;
    if (showAssociationSelector && !associationId) {
      toast.error("Please select an association.");
      return;
    }

    const payload: EventFormData = {
      title: data.title.trim(),
      category: data.category,
      description: data.description?.trim() || undefined,
      banner_url: data.banner_url || undefined,
      starts_at: data.starts_at,
      ends_at: data.ends_at || undefined,
      location: data.location?.trim() || undefined,
      is_registration_required: Boolean(data.is_registration_required),
      registration_deadline: data.is_registration_required && data.registration_deadline
        ? data.registration_deadline
        : undefined,
      max_capacity: data.is_registration_required && data.max_capacity
        ? Number(data.max_capacity)
        : undefined,
      audience: data.audience,
      send_notifications: Boolean(data.send_notifications),
      is_paid: Boolean(data.is_paid),
      fee_amount: data.is_paid && data.fee_amount ? Number(data.fee_amount) : 0,
      organizer_name: data.organizer_name?.trim() || undefined,
      organizer_contact: data.organizer_contact?.trim() || undefined,
      status: data.status || "Published",
      association_id: associationId || undefined,
    };

    try {
      if (onSubmit) {
        await onSubmit(payload);
      } else if (initialData) {
        await updateEvent({
          id: initialData.id,
          data: payload,
        }).unwrap();
      } else {
        await createEvent(payload).unwrap();
      }
      toast.success(initialData ? "Event updated successfully." : "Event created successfully.");
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err?.data?.detail || err?.message || "Failed to save event. Please try again.");
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
  const fieldOrder: (keyof EventFormValues)[] = [
    "association_id",
    "title",
    "category",
    "description",
    "banner_url",
    "starts_at",
    "ends_at",
    "location",
    "registration_deadline",
    "max_capacity",
    "audience",
    "fee_amount",
    "organizer_name",
    "organizer_contact",
  ];
  const activeErrorKey = fieldOrder.find((key) => errors[key]);
  const getFieldError = (key: keyof EventFormValues) =>
    activeErrorKey === key ? errors[key]?.message : undefined;

  const isFormDisabled =
    isFormSubmitting ||
    draftSubmitting ||
    externalLoading ||
    isCreating ||
    isUpdating;

  const isSubmitDisabled = isFormDisabled || isUploading;

  // Mock EventItem for live preview
  const previewEventItem: EventItem = {
    id: initialData?.id || "preview",
    title: formValues.title || "Untitled Event",
    description: formValues.description || "",
    category: formValues.category || "Festival",
    banner_url: formValues.banner_url || "",
    starts_at: formValues.starts_at || new Date().toISOString(),
    ends_at: formValues.ends_at || undefined,
    location: formValues.location || "Community Grounds",
    audience: formValues.audience || "Homeowners",
    is_registration_required: formValues.is_registration_required,
    registration_deadline: formValues.registration_deadline || undefined,
    max_capacity: formValues.max_capacity ? Number(formValues.max_capacity) : undefined,
    is_paid: formValues.is_paid,
    fee_amount: formValues.fee_amount ? Number(formValues.fee_amount) : 0,
    organizer_name: formValues.organizer_name || "",
    organizer_contact: formValues.organizer_contact || "",
    status: formValues.status || "Draft",
    rsvps_count: initialData?.rsvps_count || 0,
    created_at: initialData?.created_at || new Date().toISOString(),
  };

  return (
    <>
      <FormModal
        isOpen={isOpen}
        onClose={onClose}
        title={initialData ? "Edit Event" : "Create Event"}
        icon={<Calendar size={18} className="text-slate-800" />}
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
                  disabled={isSubmitDisabled}
                  className="rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Save as Draft
                </Button>
              )}
              <Button
                type="submit"
                disabled={isSubmitDisabled}
                className="rounded-xl text-xs font-semibold cursor-pointer"
              >
                {isFormSubmitting || isCreating || isUpdating || draftSubmitting
                  ? initialData
                    ? "Updating"
                    : "Submiting"
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
              label="Target Association"
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

        {/* Event Name & Category Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Event Name" required error={getFieldError("title")}>
            <Input
              placeholder="e.g. Summer Festival 2026"
              maxLength={200}
              disabled={isFormDisabled}
              {...register("title")}
              error={Boolean(getFieldError("title"))}
              size="md"
            />
          </FormField>

          <FormField label="Event Category" required error={getFieldError("category")}>
            <Controller
              name="category"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  options={CATEGORY_OPTIONS}
                  placeholder="Select category"
                  disabled={isFormDisabled}
                  error={Boolean(getFieldError("category"))}
                  size="md"
                />
              )}
            />
          </FormField>
        </div>

        {/* Event Description */}
        <FormField label="Event Description" error={getFieldError("description")}>
          <Textarea
            rows={4}
            maxLength={3000}
            disabled={isFormDisabled}
            placeholder="Details about the event..."
            {...register("description")}
            error={Boolean(getFieldError("description"))}
            size="md"
          />
        </FormField>

        {/* Event Banner Upload */}
        <FormField label="Event Banner (Optional)">
          <FileUploadZone
            value={bannerUrl}
            onChange={(url) => setValue("banner_url", url)}
            onUpload={async (file) => {
              const res = await uploadMediaAsset(file);
              return res?.url;
            }}
            onUploadingChange={setIsUploading}
            accept="image/*"
            label="Upload Banner Image"
            helperText="Drag & drop PNG, JPG, WEBP, or click to browse"
            disabled={isFormDisabled}
          />
        </FormField>

        {/* Start Date & Time and End Date & Time Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Start Date & Time" required error={getFieldError("starts_at")}>
            <Controller
              name="starts_at"
              control={control}
              render={({ field }) => (
                <DateTimePicker
                  value={field.value}
                  onChange={field.onChange}
                  minDateTime={new Date()}
                  disabled={isFormDisabled}
                  error={Boolean(getFieldError("starts_at"))}
                  size="md"
                  placeholder="Select start date & time"
                />
              )}
            />
          </FormField>

          <FormField label="End Date & Time" error={getFieldError("ends_at")}>
            <Controller
              name="ends_at"
              control={control}
              render={({ field }) => (
                <DateTimePicker
                  value={field.value}
                  onChange={field.onChange}
                  minDateTime={startsAt ? new Date(startsAt) : new Date()}
                  disabled={isFormDisabled}
                  error={Boolean(getFieldError("ends_at"))}
                  size="md"
                  placeholder="Select end date & time"
                />
              )}
            />
          </FormField>
        </div>

        {/* Venue Name */}
        <FormField label="Venue Name" error={getFieldError("location")}>
          <Input
            icon={<MapPin size={15} />}
            placeholder="e.g. Clubhouse Main Hall"
            maxLength={200}
            disabled={isFormDisabled}
            {...register("location")}
            error={Boolean(getFieldError("location"))}
            size="md"
          />
        </FormField>

        {/* Registration Section Card */}
        <div className="p-4 bg-slate-50/70 border border-slate-200/90 rounded-2xl space-y-3">
          <Controller
            name="is_registration_required"
            control={control}
            render={({ field }) => (
              <Checkbox
                checked={Boolean(field.value)}
                onCheckedChange={field.onChange}
                disabled={isFormDisabled}
                label="Registration Required"
              />
            )}
          />

          {isRegistrationRequired && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200/70">
              <FormField
                label="Registration Deadline"
                error={getFieldError("registration_deadline")}
              >
                <Controller
                  name="registration_deadline"
                  control={control}
                  render={({ field }) => (
                    <DateTimePicker
                      value={field.value}
                      onChange={field.onChange}
                      minDateTime={new Date()}
                      maxDateTime={startsAt ? new Date(startsAt) : undefined}
                      disabled={isFormDisabled}
                      error={Boolean(getFieldError("registration_deadline"))}
                      size="md"
                      placeholder="Select deadline date & time"
                    />
                  )}
                />
              </FormField>

              <FormField
                label="Maximum Capacity"
                error={getFieldError("max_capacity")}
              >
                <Input
                  type="number"
                  min={1}
                  icon={<Users size={15} />}
                  placeholder="e.g. 100"
                  disabled={isFormDisabled}
                  {...register("max_capacity")}
                  error={Boolean(getFieldError("max_capacity"))}
                  size="md"
                />
              </FormField>
            </div>
          )}
        </div>

        {/* Event Visibility & Push Notification */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
          <FormField label="Event Visibility" required error={getFieldError("audience")}>
            <Controller
              name="audience"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  options={AUDIENCE_OPTIONS}
                  placeholder="Select audience"
                  disabled={isFormDisabled}
                  error={Boolean(getFieldError("audience"))}
                  size="md"
                />
              )}
            />
          </FormField>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl h-11 flex items-center">
            <Controller
              name="send_notifications"
              control={control}
              render={({ field }) => (
                <Checkbox
                  checked={Boolean(field.value)}
                  onCheckedChange={field.onChange}
                  disabled={isFormDisabled}
                  label="Create in-app notification"
                />
              )}
            />
          </div>
        </div>

        {/* Paid Event Card */}
        <div className="p-4 bg-slate-50/70 border border-slate-200/90 rounded-2xl space-y-3">
          <Controller
            name="is_paid"
            control={control}
            render={({ field }) => (
              <Checkbox
                checked={Boolean(field.value)}
                onCheckedChange={field.onChange}
                disabled={isFormDisabled}
                label="Paid Event"
              />
            )}
          />

          {isPaid && (
            <div className="pt-2 border-t border-slate-200/70">
              <FormField
                label="Registration Fee (₹)"
                required
                error={getFieldError("fee_amount")}
              >
                <Input
                  type="number"
                  step="0.01"
                  min={0}
                  icon={<IndianRupee size={15} />}
                  placeholder="e.g. 25.00"
                  disabled={isFormDisabled}
                  {...register("fee_amount")}
                  error={Boolean(getFieldError("fee_amount"))}
                  size="md"
                />
              </FormField>
            </div>
          )}
        </div>

        {/* Organizer Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Organizer Name" error={getFieldError("organizer_name")}>
            <Input
              icon={<UserIcon size={15} />}
              placeholder="e.g. Social Committee / John Doe"
              maxLength={100}
              disabled={isFormDisabled}
              {...register("organizer_name")}
              error={Boolean(getFieldError("organizer_name"))}
              size="md"
            />
          </FormField>

          <FormField
            label="Organizer Contact Number"
            error={getFieldError("organizer_contact")}
          >
            <Input
              icon={<Phone size={15} />}
              placeholder="e.g. +91 98765 43210"
              maxLength={50}
              disabled={isFormDisabled}
              {...register("organizer_contact")}
              error={Boolean(getFieldError("organizer_contact"))}
              size="md"
            />
          </FormField>
        </div>
      </div>
    </FormModal>
      <EventOverviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        event={previewEventItem}
      />
    </>
  );
};

export default EventFormModal;
