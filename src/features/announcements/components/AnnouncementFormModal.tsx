import React, { useEffect, useMemo, useState } from "react";
import { Controller } from "react-hook-form";
import { toast } from "sonner";
import { Megaphone, Building, Upload, FileText, X } from "lucide-react";
import { FormModal, FormField } from "@/components/common";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useAppForm } from "@/hooks/useAppForm";
import { useAuth } from "@/context/AuthContext";
import { ROLE_CODE } from "@/constants/roleCodes";
import { uploadMediaAsset, uploadDocumentAsset } from "@/lib/cloudUploader";
import { useCreateAnnouncementMutation, useUpdateAnnouncementMutation } from "../api/announcementsApi";
import { announcementSchema, type AnnouncementFormValues } from "../schemas";
import type { Announcement } from "../types";

export interface AnnouncementFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialData?: Announcement | null;
  adminAssociations?: Array<{ id: string | number; name: string }>;
  selectedAssociationId?: string | number;
  onSubmit?: (data: AnnouncementFormValues) => Promise<void>;
  loading?: boolean;
  associationsLoading?: boolean;
}

const CATEGORY_OPTIONS = [
  { value: "general", label: "General" },
  { value: "maintenance", label: "Maintenance" },
  { value: "urgent", label: "Urgent" },
  { value: "celebration", label: "Celebration" },
];

const AUDIENCE_OPTIONS = [
  { value: "All", label: "All Members & Residents" },
  { value: "Homeowners", label: "Homeowners Only" },
  { value: "Board Member", label: "Board Members Only" },
  { value: "Committee Members", label: "Committee Members Only" },
];

export const AnnouncementFormModal: React.FC<AnnouncementFormModalProps> = ({
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
  const [createAnnouncement, { isLoading: isCreating }] = useCreateAnnouncementMutation();
  const [updateAnnouncement, { isLoading: isUpdating }] = useUpdateAnnouncementMutation();

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
  } = useAppForm<AnnouncementFormValues>({
    schema: announcementSchema,
    defaultValues: {
      association_id: "",
      title: "",
      body: "",
      category: "general",
      audience: "All",
      attachment_url: "",
      pinned: false,
    },
  });

  const attachmentUrl = watch("attachment_url");

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset({
          association_id: initialData.association_id ? String(initialData.association_id) : "",
          title: initialData.title || "",
          body: initialData.body || "",
          category: (initialData.category || "general").toLowerCase(),
          audience: initialData.audience || "All",
          attachment_url: initialData.attachment_url || "",
          pinned: Boolean(initialData.pinned),
        });
      } else {
        reset({
          association_id: selectedAssociationId ? String(selectedAssociationId) : "",
          title: "",
          body: "",
          category: "general",
          audience: "All",
          attachment_url: "",
          pinned: false,
        });
      }
    }
  }, [isOpen, initialData, selectedAssociationId, reset]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setIsUploading(true);
        toast.info("Uploading attachment...");
        const uploader = file.type.startsWith("image/") ? uploadMediaAsset : uploadDocumentAsset;
        const res = await uploader(file);
        if (res && res.ok && res.url) {
          toast.success("Attachment uploaded successfully.");
          setValue("attachment_url", res.url);
        }
      } catch {
        toast.error("Failed to upload attachment. Please try again.");
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleFormSubmit = async (data: AnnouncementFormValues) => {
    const associationId = data.association_id || selectedAssociationId;
    if (showAssociationSelector && !associationId) {
      toast.error("Please select an association.");
      return;
    }

    const submittedData: AnnouncementFormValues = {
      ...data,
      association_id: associationId,
    };

    try {
      if (onSubmit) {
        await onSubmit(submittedData);
      } else if (initialData) {
        await updateAnnouncement({
          id: initialData.id,
          data: {
            title: submittedData.title.trim(),
            body: submittedData.body.trim(),
            category: submittedData.category,
            audience: submittedData.audience,
            attachment_url: submittedData.attachment_url,
            association_id: submittedData.association_id,
            pinned: submittedData.pinned,
          },
        }).unwrap();
      } else {
        await createAnnouncement({
          title: submittedData.title.trim(),
          body: submittedData.body.trim(),
          category: submittedData.category,
          audience: submittedData.audience,
          attachment_url: submittedData.attachment_url,
          association_id: submittedData.association_id,
          pinned: submittedData.pinned,
        }).unwrap();
      }
      toast.success(initialData ? "Announcement updated successfully." : "Announcement published successfully.");
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err?.data?.detail || err?.message || "Failed to save announcement. Please try again.");
    }
  };

  // Top-to-bottom single error display (Sequential validation rule)
  const fieldOrder: (keyof AnnouncementFormValues)[] = [
    "association_id",
    "title",
    "category",
    "audience",
    "body",
  ];
  const activeErrorKey = fieldOrder.find((key) => errors[key]);
  const getFieldError = (key: keyof AnnouncementFormValues) =>
    activeErrorKey === key ? errors[key]?.message : undefined;

  // Uploading is independent from publishing: it only locks the submit action.
  // Keep the form controls editable so users can continue composing the announcement.
  const isSubmitting = isFormSubmitting || externalLoading || isCreating || isUpdating;

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? "Edit Announcement" : "Publish Announcement"}
      subtitle="Broadcast official notices, alerts, and bulletins to society members."
      icon={<Megaphone size={18} className="text-slate-800" />}
      submitText={initialData ? "Update Announcement" : "Publish Announcement"}
      loadingText={initialData ? "Updating..." : "Publishing..."}
      isSubmitting={isSubmitting}
      submitDisabled={isUploading}
      size="lg"
      onSubmit={handleSubmit(handleFormSubmit)}
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
                    isSubmitting ||
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

        {/* Headline / Title */}
        <FormField label="Headline / Title" required error={getFieldError("title")}>
          <Input
            icon={<Megaphone size={15} />}
            placeholder="e.g. Annual General Meeting Notice, Lift Maintenance Alert"
            maxLength={100}
            disabled={isSubmitting}
            {...register("title")}
            error={Boolean(getFieldError("title"))}
            size="md"
          />
        </FormField>

        {/* Category & Target Audience Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Category" required error={getFieldError("category")}>
            <Controller
              name="category"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  options={CATEGORY_OPTIONS}
                  placeholder="Select category..."
                  disabled={isSubmitting}
                  error={Boolean(getFieldError("category"))}
                  size="md"
                />
              )}
            />
          </FormField>

          <FormField label="Target Audience" required error={getFieldError("audience")}>
            <Controller
              name="audience"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  options={AUDIENCE_OPTIONS}
                  placeholder="Select audience..."
                  disabled={isSubmitting}
                  error={Boolean(getFieldError("audience"))}
                  size="md"
                />
              )}
            />
          </FormField>
        </div>

        {/* Announcement Body */}
        <FormField label="Announcement Details" required error={getFieldError("body")}>
          <textarea
            rows={5}
            maxLength={5000}
            disabled={isSubmitting}
            placeholder="Write the full content, instructions, and schedule details of the announcement..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 resize-none transition-all placeholder:text-slate-400"
            {...register("body")}
          />
        </FormField>

        {/* Attachment Upload */}
        <FormField label="Attachment (Optional)">
          {attachmentUrl ? (
            <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="flex items-center gap-2 truncate mr-3">
                <FileText size={16} className="text-slate-500 shrink-0" />
                <span className="text-xs text-slate-700 font-mono truncate">{attachmentUrl}</span>
              </div>
              <button
                type="button"
                onClick={() => setValue("attachment_url", "")}
                className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 p-1"
              >
                <X size={14} /> Remove
              </button>
            </div>
          ) : (
            <label className="flex items-center justify-center gap-2 w-full border-2 border-dashed border-slate-200 rounded-xl px-4 py-5 text-slate-500 hover:bg-slate-50 hover:text-slate-800 hover:border-slate-300 transition-colors cursor-pointer text-xs">
              <Upload size={16} />
              <span className="font-medium">Upload Image or PDF Document</span>
              <input
                type="file"
                className="hidden"
                accept="*/*"
                onChange={handleFileUpload}
                disabled={isUploading || isSubmitting}
              />
            </label>
          )}
        </FormField>

        {/* Pinned Switch */}
        <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
          <div>
            <p className="text-xs font-semibold text-slate-800">Pin to Top</p>
            <p className="text-xs text-slate-500">
              Pin this bulletin prominently at the top of the community feed
            </p>
          </div>
          <Controller
            name="pinned"
            control={control}
            render={({ field }) => (
              <Switch
                checked={Boolean(field.value)}
                onCheckedChange={field.onChange}
                disabled={isSubmitting}
              />
            )}
          />
        </div>
      </div>
    </FormModal>
  );
};

export default AnnouncementFormModal;
