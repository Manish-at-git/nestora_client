import React, { useEffect, useMemo } from "react";
import { Controller } from "react-hook-form";
import { toast } from "sonner";
import { Building2, Home, User } from "lucide-react";
import { FormModal, FormField } from "@/components/common";
import { Select } from "@/components/ui/select";
import { useAppForm } from "@/hooks/useAppForm";
import { useGetAdminAssociationsQuery } from "@/services/api/associationsApi";
import {
  useMapServiceRequestMutation,
  useGetAssociationAllUnitsQuery,
  useGetUnitHomeownersQuery,
} from "../api/serviceRequestsApi";
import {
  serviceRequestMappingSchema,
  type ServiceRequestMappingFormData,
} from "../schemas";
import type { ServiceRequest } from "../types";

export interface ServiceRequestMappingModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: ServiceRequest | null;
  onSuccess?: () => void;
  adminAssociations?: Array<{ id: string | number; name: string }>;
}

export const ServiceRequestMappingModal: React.FC<ServiceRequestMappingModalProps> = ({
  isOpen,
  onClose,
  request,
  onSuccess,
  adminAssociations = [],
}) => {
  const [mapServiceRequest, { isLoading: isSubmitting }] =
    useMapServiceRequestMutation();

  const { data: fetchedAssocs = [], isLoading: isAssocsLoading } =
    useGetAdminAssociationsQuery(undefined, {
      skip: !isOpen || adminAssociations.length > 0,
    });

  const effectiveAdminAssociations = useMemo(() => {
    if (adminAssociations && adminAssociations.length > 0) {
      return adminAssociations;
    }
    return fetchedAssocs;
  }, [adminAssociations, fetchedAssocs]);

  const validAssociations = useMemo(
    () =>
      effectiveAdminAssociations.filter(
        (a) => String(a.id) !== "ALL" && a.name !== "All Associations"
      ),
    [effectiveAdminAssociations]
  );

  const {
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useAppForm<ServiceRequestMappingFormData>({
    schema: serviceRequestMappingSchema,
    defaultValues: {
      association_id: "",
      unit_id: "",
      user_id: "",
    },
  });

  const selectedAssocId = watch("association_id");
  const selectedUnitId = watch("unit_id");

  // Fetch all units for association
  const { data: units = [], isFetching: isUnitsLoading } =
    useGetAssociationAllUnitsQuery(selectedAssocId || "", {
      skip: !isOpen || !selectedAssocId,
    });

  // Fetch homeowners for unit
  const { data: homeowners = [], isFetching: isHomeownersLoading } =
    useGetUnitHomeownersQuery(selectedUnitId || "", {
      skip: !isOpen || !selectedUnitId,
    });

  useEffect(() => {
    if (selectedAssocId) {
      setValue("unit_id", "");
      setValue("user_id", "");
    }
  }, [selectedAssocId, setValue]);

  useEffect(() => {
    if (selectedUnitId) {
      setValue("user_id", "");
    }
  }, [selectedUnitId, setValue]);

  useEffect(() => {
    if (selectedUnitId && homeowners.length === 1) {
      setValue("user_id", String(homeowners[0].user_id));
    }
  }, [homeowners, selectedUnitId, setValue]);

  useEffect(() => {
    if (isOpen && request) {
      reset({
        association_id: request.association_id ? String(request.association_id) : "",
        unit_id: request.unit_id ? String(request.unit_id) : "",
        user_id: request.user_id ? String(request.user_id) : "",
      });
    }
  }, [isOpen, request, reset]);

  const fieldOrder: (keyof ServiceRequestMappingFormData)[] = [
    "association_id",
    "unit_id",
    "user_id",
  ];
  const activeErrorKey = fieldOrder.find((key) => errors[key]);
  const getFieldError = (key: keyof ServiceRequestMappingFormData) =>
    activeErrorKey === key ? errors[key]?.message : undefined;

  const associationOptions = useMemo(
    () =>
      validAssociations.map((a) => ({
        value: String(a.id),
        label: a.name,
      })),
    [validAssociations]
  );

  const unitOptions = useMemo(
    () =>
      units.map((u) => ({
        value: String(u.id),
        label: `${u.block_name || "Block"} - Unit ${u.unit_number}`,
      })),
    [units]
  );

  const homeownerOptions = useMemo(
    () =>
      homeowners.map((h) => ({
        value: String(h.user_id),
        label:
          h.name ||
          `${h.first_name || ""} ${h.last_name || ""}`.trim() ||
          h.email ||
          "Resident",
        description: h.email || undefined,
      })),
    [homeowners]
  );

  const onSubmit = async (data: ServiceRequestMappingFormData) => {
    if (!request?.id) return;
    try {
      const res = await mapServiceRequest({
        id: request.id,
        association_id: data.association_id,
        unit_id: data.unit_id,
        user_id: data.user_id,
      }).unwrap();

      if (res.ok) {
        toast.success("Service request mapped successfully!");
        if (onSuccess) onSuccess();
        onClose();
      } else {
        toast.error(res.message || "Failed to map service request");
      }
    } catch (err: any) {
      toast.error(err?.data?.detail || "Failed to map service request");
    }
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title="Map Service Request"
      description={`Assign ${request?.sr_display_id || "ticket"} to a specific association and property unit.`}
      onSubmit={handleSubmit(onSubmit)}
      isSubmitting={isSubmitting}
      submitText={isSubmitting ? "Mapping..." : "Save Mapping"}
      size="md"
    >
      <div className="space-y-4">
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
                  isAssocsLoading ? "Loading associations..." : "Select Association"
                }
                disabled={isSubmitting || isAssocsLoading}
                error={Boolean(getFieldError("association_id"))}
              />
            )}
          />
        </FormField>

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
                  !selectedAssocId
                    ? "Select association first"
                    : isUnitsLoading
                    ? "Loading units..."
                    : unitOptions.length === 0
                    ? "No units available"
                    : "Select Unit"
                }
                disabled={
                  isSubmitting ||
                  !selectedAssocId ||
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
                    ? "No residents for unit"
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
    </FormModal>
  );
};
