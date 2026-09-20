import React, { useEffect, useState, useMemo, useRef } from "react";
import { Controller } from "react-hook-form";
import { toast } from "sonner";
import {
  Wrench,
  Building2,
  Layers,
  Home,
  User,
  Phone,
  Tag,
  FileText,
  AlertCircle,
} from "lucide-react";
import { FormModal, FormField, FileUploadZone } from "@/components/common";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { useAppForm } from "@/hooks/useAppForm";
import { useAuth } from "@/context/AuthContext";
import { isAdmin, isSuperAdmin } from "@/lib/utils";
import { uploadMediaAsset } from "@/lib/cloudUploader";
import { useGetAdminAssociationsQuery } from "@/services/api/associationsApi";
import {
  useCreateServiceRequestMutation,
  useGetAssociationBlocksQuery,
  useGetBlockUnitsQuery,
  useGetUnitHomeownersQuery,
} from "../api/serviceRequestsApi";
import {
  SERVICE_TYPE_OPTIONS,
  SERVICE_CATEGORIES,
  normalizeServiceType,
  type ServiceTypeKey,
} from "../constants";
import {
  serviceRequestSchema,
  type ServiceRequestFormData,
} from "../schemas";

export interface ServiceRequestFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  adminAssociations?: Array<{ id: string | number; name: string }>;
  selectedAssociationId?: string | number;
}

export const ServiceRequestFormModal: React.FC<ServiceRequestFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  adminAssociations = [],
  selectedAssociationId,
}) => {
  const { account, profile } = useAuth();
  const [createServiceRequest, { isLoading: isSubmitting }] =
    useCreateServiceRequestMutation();
  const [isUploadingFile, setIsUploadingFile] = useState(false);

  const userRole = account?.role_code;
  const userIsAdmin = isAdmin(userRole) || isSuperAdmin(userRole);

  // Fallback to load associations if not passed
  const { data: fetchedAssocs = [], isLoading: isAssocsLoading } =
    useGetAdminAssociationsQuery(undefined, {
      skip: !isOpen || !userIsAdmin || adminAssociations.length > 0,
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
          name: account.association_name || `Association ${account.association_id}`,
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

  const prevIsOpenRef = useRef(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useAppForm<ServiceRequestFormData>({
    schema: serviceRequestSchema,
    defaultValues: {
      association_id: "",
      block_id: "",
      unit_id: "",
      user_id: "",
      incoming_call_no: "",
      service_type: "",
      sub_category: "",
      custom_title: "",
      description: "",
      image_url: "",
    },
  });

  const selectedAssocId = watch("association_id");
  const selectedBlockId = watch("block_id");
  const selectedUnitId = watch("unit_id");
  const selectedServiceType = watch("service_type");
  const selectedSubCategory = watch("sub_category");
  const watchImageUrl = watch("image_url");

  const showCustomTitle =
    selectedServiceType === "Other" || selectedSubCategory === "Other Option";

  // Cascading queries for Admin
  const { data: blocks = [], isFetching: isBlocksLoading } =
    useGetAssociationBlocksQuery(selectedAssocId || "", {
      skip: !isOpen || !userIsAdmin || !selectedAssocId,
    });

  const { data: units = [], isFetching: isUnitsLoading } =
    useGetBlockUnitsQuery(selectedBlockId || "", {
      skip: !isOpen || !userIsAdmin || !selectedBlockId,
    });

  const { data: homeowners = [], isFetching: isHomeownersLoading } =
    useGetUnitHomeownersQuery(selectedUnitId || "", {
      skip: !isOpen || !userIsAdmin || !selectedUnitId,
    });

  // Reset dependent fields on association change
  useEffect(() => {
    if (userIsAdmin && selectedAssocId) {
      setValue("block_id", "");
      setValue("unit_id", "");
      setValue("user_id", "");
    }
  }, [selectedAssocId, setValue, userIsAdmin]);

  // Reset dependent fields on block change
  useEffect(() => {
    if (userIsAdmin && selectedBlockId) {
      setValue("unit_id", "");
      setValue("user_id", "");
    }
  }, [selectedBlockId, setValue, userIsAdmin]);

  // Auto-select homeowner if only 1 exists for unit
  useEffect(() => {
    if (userIsAdmin && selectedUnitId && homeowners.length === 1) {
      setValue("user_id", String(homeowners[0].user_id));
    }
  }, [homeowners, selectedUnitId, setValue, userIsAdmin]);

  // Initialize form on modal open (only once when opening, not on every re-render)
  useEffect(() => {
    if (isOpen && !prevIsOpenRef.current) {
      const defaultAssoc =
        selectedAssociationId && String(selectedAssociationId) !== "ALL"
          ? String(selectedAssociationId)
          : validAssociations.length === 1
          ? String(validAssociations[0].id)
          : "";

      reset({
        association_id: defaultAssoc,
        block_id: "",
        unit_id: "",
        user_id: "",
        incoming_call_no: "",
        service_type: "",
        sub_category: "",
        custom_title: "",
        description: "",
        image_url: "",
      });
    }
    prevIsOpenRef.current = isOpen;
  }, [isOpen, selectedAssociationId, validAssociations, reset]);

  // Sequential error prioritization
  const fieldOrder: (keyof ServiceRequestFormData)[] = [
    "association_id",
    "block_id",
    "unit_id",
    "user_id",
    "service_type",
    "custom_title",
    "sub_category",
    "description",
    "incoming_call_no",
    "image_url",
  ];

  const activeErrorKey = fieldOrder.find((key) => errors[key]);
  const getFieldError = (key: keyof ServiceRequestFormData) =>
    activeErrorKey === key ? errors[key]?.message : undefined;

  // Options mapped from static data & queries
  const associationOptions = useMemo(
    () =>
      validAssociations.map((a) => ({
        value: String(a.id),
        label: a.name,
      })),
    [validAssociations]
  );

  const blockOptions = useMemo(
    () =>
      blocks.map((b) => ({
        value: String(b.id),
        label: b.name,
      })),
    [blocks]
  );

  const unitOptions = useMemo(
    () =>
      units.map((u) => ({
        value: String(u.id),
        label: `Unit ${u.unit_number}`,
      })),
    [units]
  );

  const homeownerOptions = useMemo(
    () =>
      homeowners.map((h) => ({
        value: String(h.user_id),
        label: h.name || `${h.first_name || ""} ${h.last_name || ""}`.trim() || h.email || "Unknown Resident",
        description: h.email || undefined,
      })),
    [homeowners]
  );

  const serviceTypeOptions = useMemo(
    () =>
      SERVICE_TYPE_OPTIONS.map((st) => ({
        value: st.apiValue,
        label: st.label,
      })),
    []
  );

  const subCategoryOptions = useMemo(() => {
    if (!selectedServiceType) return [];
    const typeKey = normalizeServiceType(selectedServiceType);
    const subcats = SERVICE_CATEGORIES[typeKey] || [];
    return subcats.map((sc) => ({
      value: sc,
      label: sc,
    }));
  }, [selectedServiceType]);

  const onSubmit = async (data: ServiceRequestFormData) => {
    if (isUploadingFile) {
      toast.error("Please wait for the photo attachment to finish uploading");
      return;
    }

    if (userIsAdmin && !data.user_id) {
      toast.error("Please select a resident to create request on their behalf");
      return;
    }

    try {
      const payload = {
        service_type: data.service_type,
        sub_category: data.sub_category || undefined,
        custom_title: showCustomTitle ? data.custom_title : undefined,
        description: data.description || undefined,
        incoming_call_no: data.incoming_call_no || undefined,
        image_url: data.image_url || undefined,
        user_id: userIsAdmin ? data.user_id : undefined,
        association_id: data.association_id || undefined,
      };

      const res = await createServiceRequest(payload).unwrap();
      if (res.ok) {
        toast.success("Service request submitted successfully!");
        if (onSuccess) onSuccess();
        onClose();
      } else {
        toast.error("Failed to submit service request");
      }
    } catch (err: any) {
      const errorMsg =
        err?.data?.detail || err?.data?.message || "Failed to create service request";
      toast.error(errorMsg);
    }
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={() => {
        setIsUploadingFile(false);
        onClose();
      }}
      title="Create Service Request"
      description={
        userIsAdmin
          ? "Create a service ticket on behalf of a resident."
          : "Submit a maintenance or repair ticket for your unit."
      }
      onSubmit={handleSubmit(onSubmit)}
      isSubmitting={isSubmitting || isUploadingFile}
      submitText={
        isUploadingFile
          ? "Uploading image..."
          : isSubmitting
          ? "Submitting..."
          : "Submit Request"
      }
      size="xl"
    >
      <div className="space-y-4">
        {userIsAdmin ? (
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 space-y-3 dark:border-slate-800 dark:bg-slate-900/50">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <Building2 size={14} />
              <span>Property Assignment</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                      icon={<Building2 size={15} />}
                      options={associationOptions}
                      value={field.value || ""}
                      onValueChange={field.onChange}
                      placeholder={
                        isAssocsLoading
                          ? "Loading associations..."
                          : "Select Association"
                      }
                      disabled={isSubmitting || isAssocsLoading}
                      error={Boolean(getFieldError("association_id"))}
                    />
                  )}
                />
              </FormField>

              <FormField
                label="Block"
                required
                error={getFieldError("block_id")}
              >
                <Controller
                  name="block_id"
                  control={control}
                  render={({ field }) => (
                    <Select
                      icon={<Layers size={15} />}
                      options={blockOptions}
                      value={field.value || ""}
                      onValueChange={field.onChange}
                      placeholder={
                        !selectedAssocId
                          ? "Select association first"
                          : isBlocksLoading
                          ? "Loading blocks..."
                          : blockOptions.length === 0
                          ? "No blocks found"
                          : "Select Block"
                      }
                      disabled={
                        isSubmitting ||
                        !selectedAssocId ||
                        isBlocksLoading ||
                        blockOptions.length === 0
                      }
                      error={Boolean(getFieldError("block_id"))}
                    />
                  )}
                />
              </FormField>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <FormField
                label="Unit"
                required
                error={getFieldError("unit_id")}
              >
                <Controller
                  name="unit_id"
                  control={control}
                  render={({ field }) => (
                    <Select
                      icon={<Home size={15} />}
                      options={unitOptions}
                      value={field.value || ""}
                      onValueChange={field.onChange}
                      placeholder={
                        !selectedBlockId
                          ? "Select block first"
                          : isUnitsLoading
                          ? "Loading units..."
                          : unitOptions.length === 0
                          ? "No units found"
                          : "Select Unit"
                      }
                      disabled={
                        isSubmitting ||
                        !selectedBlockId ||
                        isUnitsLoading ||
                        unitOptions.length === 0
                      }
                      error={Boolean(getFieldError("unit_id"))}
                    />
                  )}
                />
              </FormField>

              <FormField
                label="Resident"
                required
                error={getFieldError("user_id")}
              >
                <Controller
                  name="user_id"
                  control={control}
                  render={({ field }) => (
                    <Select
                      icon={<User size={15} />}
                      options={homeownerOptions}
                      value={field.value || ""}
                      onValueChange={field.onChange}
                      placeholder={
                        !selectedUnitId
                          ? "Select unit first"
                          : isHomeownersLoading
                          ? "Loading residents..."
                          : homeownerOptions.length === 0
                          ? "No resident found"
                          : "Select Resident"
                      }
                      disabled={
                        isSubmitting ||
                        !selectedUnitId ||
                        isHomeownersLoading ||
                        homeownerOptions.length === 0
                      }
                      error={Boolean(getFieldError("user_id"))}
                    />
                  )}
                />
              </FormField>
            </div>

            <FormField
              label="Incoming Call Number (Optional)"
              error={getFieldError("incoming_call_no")}
            >
              <Input
                icon={<Phone size={15} />}
                placeholder="e.g. +1 555-0123"
                {...register("incoming_call_no")}
                disabled={isSubmitting}
                error={Boolean(getFieldError("incoming_call_no"))}
              />
            </FormField>
          </div>
        ) : (
          /* Resident Context Display */
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 text-xs dark:border-slate-800 dark:bg-slate-900/50">
            <div className="font-semibold text-slate-800 dark:text-slate-200">
              Resident: {profile?.name || account?.name || "Homeowner"}
            </div>
            <div className="text-slate-500 dark:text-slate-400 mt-1">
              Unit Address: {profile?.address || account?.email || "Registered Unit"}
            </div>
          </div>
        )}

        {/* Service Type Selection */}
        <FormField
          label="Service Type"
          required
          error={getFieldError("service_type")}
        >
          <Controller
            name="service_type"
            control={control}
            render={({ field }) => (
              <Select
                icon={<Wrench size={15} />}
                options={serviceTypeOptions}
                value={field.value || ""}
                onValueChange={(val) => {
                  field.onChange(val);
                  setValue("sub_category", "");
                  setValue("custom_title", "");
                }}
                placeholder="Select Service Type"
                disabled={isSubmitting || isUploadingFile}
                error={Boolean(getFieldError("service_type"))}
              />
            )}
          />
        </FormField>

        {/* Sub Category Selection (Only shown for Plumbing, Cleaning, Electric) */}
        {selectedServiceType && selectedServiceType !== "Other" && (
          <FormField
            label="Sub Category"
            error={getFieldError("sub_category")}
          >
            <Controller
              name="sub_category"
              control={control}
              render={({ field }) => (
                <Select
                  icon={<Layers size={15} />}
                  options={subCategoryOptions}
                  value={field.value || ""}
                  onValueChange={(val) => {
                    field.onChange(val);
                    if (val !== "Other Option") {
                      setValue("custom_title", "");
                    }
                  }}
                  placeholder="Select a sub category"
                  disabled={isSubmitting || isUploadingFile}
                  error={Boolean(getFieldError("sub_category"))}
                />
              )}
            />
          </FormField>
        )}

        {/* Title Input (Shown when Service Type is "Other" or Sub Category is "Other Option", matching old frontend) */}
        {showCustomTitle && (
          <FormField
            label={selectedServiceType === "Other" ? "Custom Title" : "Title"}
            required
            error={getFieldError("custom_title")}
          >
            <Input
              withFormField={false}
              placeholder="Enter title"
              {...register("custom_title")}
              disabled={isSubmitting || isUploadingFile}
              error={Boolean(getFieldError("custom_title"))}
            />
          </FormField>
        )}

        {/* Description */}
        <FormField
          label="Description"
          error={getFieldError("description")}
        >
          <Textarea
            placeholder="Please provide details about the issue or maintenance request..."
            rows={3}
            {...register("description")}
            disabled={isSubmitting || isUploadingFile}
            error={Boolean(getFieldError("description"))}
          />
        </FormField>

        {/* Image Attachment Upload using common FileUploadZone */}
        <FormField
          label="Attachment Image (Optional)"
          error={getFieldError("image_url")}
        >
          <FileUploadZone
            value={watchImageUrl}
            onUploadingChange={setIsUploadingFile}
            onChange={(url) =>
              setValue("image_url", url, {
                shouldValidate: true,
                shouldDirty: true,
              })
            }
            onUpload={async (file) => {
              const res = await uploadMediaAsset(file);
              return res.url;
            }}
            accept=".png,.jpg,.jpeg,.webp"
            maxSizeMB={10}
            label="Upload Repair Photo"
            helperText="Upload photo of the repair issue (PNG, JPG, WEBP up to 10MB)"
            disabled={isSubmitting || isUploadingFile}
            error={Boolean(getFieldError("image_url"))}
          />
        </FormField>
      </div>
    </FormModal>
  );
};

export default ServiceRequestFormModal;
