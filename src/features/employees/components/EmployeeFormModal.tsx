import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { UserPlus, Pencil, Check } from "lucide-react";
import { FormModal } from "@/components/common/FormModal";
import { FormField } from "@/components/common/FormField";
import { FileUploadZone } from "@/components/common/FileUploadZone";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import {
  useGetLocationCitiesQuery,
  useGetLocationCountriesQuery,
  useGetLocationRegionsQuery,
} from "@/features/locations/api/locationsApi";
import { ROLES_STRING } from "@/lib/staticData";
import { useGetRolesQuery } from "@/features/roles/api/rolesApi";
import { useGetAssociationsQuery } from "@/features/associations/api/associationsApi";
import {
  useCreateEmployeeMutation,
  useUpdateEmployeeMutation,
} from "../api/employeesApi";
import type { Employee, EmployeeCreatePayload } from "../types";

export interface EmployeeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  employeeToEdit?: Employee | null;
  onSuccess?: () => void;
}

export const EmployeeFormModal: React.FC<EmployeeFormModalProps> = ({
  isOpen,
  onClose,
  employeeToEdit,
  onSuccess,
}) => {
  const isEditMode = Boolean(employeeToEdit);

  const { data: roles = [], isLoading: isLoadingRoles } = useGetRolesQuery(
    undefined,
    { skip: !isOpen }
  );
  const { data: associations = [] } = useGetAssociationsQuery(undefined, {
    skip: !isOpen,
  });

  const [createEmployee, { isLoading: isCreating }] =
    useCreateEmployeeMutation();
  const [updateEmployee, { isLoading: isUpdating }] =
    useUpdateEmployeeMutation();
  const isSaving = isCreating || isUpdating;

  const [formData, setFormData] = useState<EmployeeCreatePayload>({
    first_name: "",
    last_name: "",
    email: "",
    contact_number: "",
    role_id: "",
    association_ids: [],
    address_line_1: "",
    address_line_2: "",
    city_id: "",
    pincode: "",
    emergency_contact_name: "",
    emergency_contact_number: "",
    id_proof_url: "",
    onboard_date: "",
    end_date: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [countryId, setCountryId] = useState("");
  const [regionId, setRegionId] = useState("");
  const { data: countries = [], isLoading: isLoadingCountries } = useGetLocationCountriesQuery(undefined, {
    skip: !isOpen,
  });
  const { data: regions = [], isLoading: isLoadingRegions } = useGetLocationRegionsQuery(countryId, {
    skip: !isOpen || !countryId,
  });
  const { data: cities = [], isLoading: isLoadingCities } = useGetLocationCitiesQuery(regionId, {
    skip: !isOpen || !regionId,
  });

  useEffect(() => {
    if (isOpen) {
      if (employeeToEdit) {
        setFormData({
          first_name: employeeToEdit.first_name || "",
          last_name: employeeToEdit.last_name || "",
          email: employeeToEdit.email || "",
          contact_number: employeeToEdit.contact_number || "",
          role_id: employeeToEdit.role_id || "",
          association_ids:
            employeeToEdit.associations?.map((a) => a.id) || [],
          address_line_1: employeeToEdit.address_line_1 || "",
          address_line_2: employeeToEdit.address_line_2 || "",
          city_id: employeeToEdit.city_id || "",
          pincode: employeeToEdit.pincode || "",
          emergency_contact_name: employeeToEdit.emergency_contact_name || "",
          emergency_contact_number:
            employeeToEdit.emergency_contact_number || "",
          id_proof_url: employeeToEdit.id_proof_url || "",
          onboard_date: employeeToEdit.onboard_date
            ? employeeToEdit.onboard_date.slice(0, 10)
            : "",
          end_date: employeeToEdit.end_date
            ? employeeToEdit.end_date.slice(0, 10)
            : "",
        });
      } else {
        setFormData({
          first_name: "",
          last_name: "",
          email: "",
          contact_number: "",
          role_id: "",
          association_ids: [],
          address_line_1: "",
          address_line_2: "",
          city_id: "",
          pincode: "",
          emergency_contact_name: "",
          emergency_contact_number: "",
          id_proof_url: "",
          onboard_date: new Date().toISOString().slice(0, 10),
          end_date: "",
        });
      }
      setCountryId("");
      setRegionId("");
      setErrors({});
    }
  }, [employeeToEdit, isOpen]);

  const handleFieldChange = (
    field: keyof EmployeeCreatePayload,
    value: any
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
  };

  const validate = () => {
    if (!isEditMode) {
      if (!formData.first_name.trim()) {
        setErrors({ first_name: "First name is required" });
        return false;
      }
      if (!formData.last_name.trim()) {
        setErrors({ last_name: "Last name is required" });
        return false;
      }
      if (!formData.email.trim()) {
        setErrors({ email: "Email address is required" });
        return false;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        setErrors({ email: "Please enter a valid email address" });
        return false;
      }
      if (!formData.contact_number.trim()) {
        setErrors({ contact_number: "Contact number is required" });
        return false;
      }
      if (!formData.role_id) {
        setErrors({ role_id: "Please select a role" });
        return false;
      }
      if (!formData.address_line_1.trim()) {
        setErrors({ address_line_1: "Address is required" });
        return false;
      }
      if (!countryId) {
        setErrors({ country_id: "Country is required" });
        return false;
      }
      if (!regionId) {
        setErrors({ region_id: "State is required" });
        return false;
      }
      if (!formData.city_id) {
        setErrors({ city_id: "City is required" });
        return false;
      }
      if (!formData.pincode.trim()) {
        setErrors({ pincode: "Pincode is required" });
        return false;
      }
    } else {
      if (!formData.role_id) {
        setErrors({ role_id: "Please select a role" });
        return false;
      }
    }

    setErrors({});
    return true;
  };

  const handleToggleAssociation = (id: string) => {
    setFormData((prev) => {
      const exists = prev.association_ids.includes(id);
      return {
        ...prev,
        association_ids: exists
          ? prev.association_ids.filter((aid) => aid !== id)
          : [...prev.association_ids, id],
      };
    });
  };

  const handleSelectAllAssocs = () => {
    setFormData((prev) => ({
      ...prev,
      association_ids: associations.map((a) => a.id),
    }));
  };

  const handleClearAssocs = () => {
    setFormData((prev) => ({ ...prev, association_ids: [] }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      if (isEditMode && employeeToEdit) {
        await updateEmployee({
          account_id: employeeToEdit.account_id,
          data: {
            role_id: formData.role_id,
          association_ids: formData.association_ids,
          onboard_date: formData.onboard_date || undefined,
          end_date: formData.end_date || undefined,
          },
        }).unwrap();
        toast.success("Employee updated successfully");
      } else {
        const res = await createEmployee({
          ...formData,
          first_name: formData.first_name.trim(),
          last_name: formData.last_name.trim(),
          email: formData.email.trim(),
          contact_number: formData.contact_number.trim(),
          address_line_1: formData.address_line_1.trim(),
          address_line_2: formData.address_line_2?.trim() || undefined,
          city_id: formData.city_id,
          pincode: formData.pincode.trim(),
          onboard_date: formData.onboard_date || undefined,
          end_date: formData.end_date || undefined,
          emergency_contact_name:
            formData.emergency_contact_name?.trim() || undefined,
          emergency_contact_number:
            formData.emergency_contact_number?.trim() || undefined,
          id_proof_url: formData.id_proof_url?.trim() || undefined,
        }).unwrap();
        toast.success(
          `Employee onboarded! Temporary password: ${res.temp_password || "Generated and emailed"}`
        );
      }
      onSuccess?.();
      onClose();
    } catch (err: any) {
      toast.error(
        err?.data?.detail || err?.data || "Failed to save employee profile"
      );
    }
  };

  const EXCLUDED_PLATFORM_ROLE_CODES = new Set([
    ROLES_STRING.HOMEOWNER,
    ROLES_STRING.TENANT,
    ROLES_STRING.BOARD_MEMBER,
    ROLES_STRING.COMMITTEE_MEMBER,
    ROLES_STRING.SECURITY,
    ROLES_STRING.SUPER_ADMIN,
  ]);

  const platformRoles = roles.filter(
    (r) =>
      Boolean(r.is_active) &&
      !EXCLUDED_PLATFORM_ROLE_CODES.has(r.code)
  );

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? "Edit Employee" : "Add Employee"}
      description={
        isEditMode
          ? "Update role assignments and associated community access."
          : "Onboard operational staff, create system accounts, and set permissions."
      }
      icon={
        isEditMode ? (
          <Pencil size={18} className="text-slate-800" />
        ) : (
          <UserPlus size={18} className="text-slate-800" />
        )
      }
      size="2xl"
      isSubmitting={isSaving}
      submitText={isEditMode ? "Save Changes" : "Add Employee"}
      loadingText={isEditMode ? "Saving Changes" : "Onboarding Employee"}
      submitVariant="default"
      onSubmit={handleSubmit}
    >
      <div className="space-y-4">
        {/* Identity Information (Add Mode only) */}
        {!isEditMode && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                label="First Name"
                required
                error={errors.first_name}
              >
                <Input
                  type="text"
                  placeholder="e.g. John"
                  value={formData.first_name}
                  onChange={(e) =>
                    handleFieldChange("first_name", e.target.value)
                  }
                  disabled={isSaving}
                  autoFocus
                />
              </FormField>

              <FormField
                label="Last Name"
                required
                error={errors.last_name}
              >
                <Input
                  type="text"
                  placeholder="e.g. Doe"
                  value={formData.last_name}
                  onChange={(e) =>
                    handleFieldChange("last_name", e.target.value)
                  }
                  disabled={isSaving}
                />
              </FormField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                label="Email Address (Login Username)"
                required
                error={errors.email}
              >
                <Input
                  type="email"
                  placeholder="john.doe@nestora.com"
                  value={formData.email}
                  onChange={(e) => handleFieldChange("email", e.target.value)}
                  disabled={isSaving}
                />
              </FormField>

              <FormField
                label="Contact Phone"
                required
                error={errors.contact_number}
              >
                <Input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={formData.contact_number}
                  onChange={(e) =>
                    handleFieldChange("contact_number", e.target.value)
                  }
                  disabled={isSaving}
                />
              </FormField>
            </div>
          </>
        )}

        {/* Role & Dates Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-1">
            <FormField
              label="Role Designation"
              required
              error={errors.role_id}
              helperText="System access role"
            >
              <Select
                value={formData.role_id}
                onChange={(e) => handleFieldChange("role_id", e.target.value)}
                options={[
                  ...platformRoles.map((r) => ({
                    value: r.id,
                    label: r.name,
                  })),
                ]}
                placeholder="Select role..."
                disabled={isSaving || isLoadingRoles}
                error={Boolean(errors.role_id)}
              />
            </FormField>
          </div>

          <div>
            <FormField label="Onboard Date">
              <DatePicker
                value={formData.onboard_date || ""}
                onChange={(date) => handleFieldChange("onboard_date", date)}
                placeholder="Select onboard date"
                disabled={isSaving}
              />
            </FormField>
          </div>

          <div>
            <FormField label="Contract End Date (Optional)">
              <DatePicker
                value={formData.end_date || ""}
                onChange={(date) => handleFieldChange("end_date", date)}
                placeholder="Select end date"
                disabled={isSaving}
              />
            </FormField>
          </div>
        </div>

        {/* Association Assignments */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
              Assigned Associations
            </label>
            <div className="flex items-center gap-2 text-xs">
              <button
                type="button"
                onClick={handleSelectAllAssocs}
                className="text-indigo-600 hover:underline font-medium cursor-pointer"
                disabled={isSaving}
              >
                Select All
              </button>
              <span className="text-slate-300">|</span>
              <button
                type="button"
                onClick={handleClearAssocs}
                className="text-slate-500 hover:underline font-medium cursor-pointer"
                disabled={isSaving}
              >
                Clear ({formData.association_ids.length})
              </button>
            </div>
          </div>

          <div className="max-h-40 overflow-y-auto pr-1 grid grid-cols-1 sm:grid-cols-2 gap-2 border border-slate-200/80 p-2.5 rounded-xl bg-slate-50/50">
            {associations.length === 0 ? (
              <p className="text-xs text-slate-400 p-2 col-span-2 text-center">
                No associations available
              </p>
            ) : (
              associations.map((assoc) => {
                const isSelected = formData.association_ids.includes(assoc.id);
                return (
                  <div
                    key={assoc.id}
                    onClick={() =>
                      !isSaving && handleToggleAssociation(assoc.id)
                    }
                    className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer select-none text-xs transition-all ${
                      isSelected
                        ? "bg-indigo-50 border-indigo-200 text-indigo-900 font-semibold"
                        : "bg-white border-slate-200/70 text-slate-700 hover:bg-slate-50"
                    } ${isSaving ? "opacity-60 cursor-not-allowed" : ""}`}
                  >
                    <div
                      className={`w-4 h-4 rounded flex items-center justify-center border shrink-0 ${
                        isSelected
                          ? "bg-indigo-600 border-indigo-600 text-white"
                          : "border-slate-300 bg-white"
                      }`}
                    >
                      {isSelected && <Check size={11} className="stroke-[3]" />}
                    </div>
                    <span className="truncate">{assoc.name}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Residential Address (Add Mode only) */}
        {!isEditMode && (
          <>
            <div className="pt-2 space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                Residential Address
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <FormField
                    label="Address Line 1"
                    required
                    error={errors.address_line_1}
                  >
                    <Input
                      type="text"
                      placeholder="Street address / House No..."
                      value={formData.address_line_1}
                      onChange={(e) =>
                        handleFieldChange("address_line_1", e.target.value)
                      }
                      disabled={isSaving}
                    />
                  </FormField>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <FormField label="Country" required error={errors.country_id}>
                    <Select value={countryId} onValueChange={(value) => { setCountryId(value); setRegionId(""); handleFieldChange("city_id", ""); }} options={countries.map((country) => ({ value: country.id, label: country.name }))} placeholder="Select country..." disabled={isSaving || isLoadingCountries} error={Boolean(errors.country_id)} />
                  </FormField>
                  <FormField label="State / Region" required error={errors.region_id}>
                    <Select value={regionId} onValueChange={(value) => { setRegionId(value); handleFieldChange("city_id", ""); }} options={regions.map((region) => ({ value: region.id, label: region.name }))} placeholder="Select state..." disabled={isSaving || !countryId || isLoadingRegions} error={Boolean(errors.region_id)} />
                  </FormField>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                 <FormField label="City" required error={errors.city_id}>
                    <Select value={formData.city_id} onValueChange={(value) => handleFieldChange("city_id", value)} options={cities.map((city) => ({ value: city.id, label: city.name }))} placeholder="Select city..." disabled={isSaving || !regionId || isLoadingCities} error={Boolean(errors.city_id)} />
                  </FormField>
                <FormField label="Pincode" required error={errors.pincode}>
                  <Input
                    type="text"
                    placeholder="e.g. 400001"
                    value={formData.pincode}
                    onChange={(e) =>
                      handleFieldChange("pincode", e.target.value)
                    }
                    disabled={isSaving}
                  />
                </FormField>
              </div>
            </div>

            {/* Emergency Contact Details (Add Mode only) */}
            <div className="pt-2 space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                Emergency Contact Details
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormField label="Emergency Contact Name">
                  <Input
                    type="text"
                    placeholder="e.g. Jane Doe (Spouse / Guardian)"
                    value={formData.emergency_contact_name || ""}
                    onChange={(e) =>
                      handleFieldChange(
                        "emergency_contact_name",
                        e.target.value
                      )
                    }
                    disabled={isSaving}
                  />
                </FormField>

                <FormField label="Emergency Contact Phone">
                  <Input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={formData.emergency_contact_number || ""}
                    onChange={(e) =>
                      handleFieldChange(
                        "emergency_contact_number",
                        e.target.value
                      )
                    }
                    disabled={isSaving}
                  />
                </FormField>
              </div>
            </div>

            {/* Government ID Proof Upload */}
            <div className="pt-2 space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                Government ID Proof
              </h4>
              <FormField
                label="Valid ID Proof (Aadhar / PAN / Passport)"
                error={errors.id_proof_url}
                helperText="Upload official identity document (PDF, PNG, JPG up to 10MB)"
              >
                <FileUploadZone
                  value={formData.id_proof_url || ""}
                  onChange={(url) => handleFieldChange("id_proof_url", url)}
                  label="Upload Valid ID Proof (Aadhar)"
                  helperText="Drag & drop your ID proof document here, or click to browse"
                  accept=".pdf,.png,.jpg,.jpeg"
                  maxSizeMB={10}
                  disabled={isSaving}
                  error={Boolean(errors.id_proof_url)}
                />
              </FormField>
            </div>
          </>
        )}
      </div>
    </FormModal>
  );
};

export default EmployeeFormModal;
