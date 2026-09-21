import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Wrench,
  Pencil,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Star,
  CheckCircle2,
} from "lucide-react";
import { FormModal } from "@/components/common/FormModal";
import { FormField } from "@/components/common/FormField";
import { FileUploadZone } from "@/components/common/FileUploadZone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import {
  useGetLocationCitiesQuery,
  useGetLocationCountriesQuery,
  useGetLocationRegionsQuery,
} from "@/features/locations/api/locationsApi";
import { useCreateVendorMutation, useUpdateVendorMutation } from "../api/vendorsApi";
import { useGetAssociationsQuery } from "@/features/associations/api";
import type { Vendor } from "../types";

export interface VendorFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  vendorToEdit?: Vendor | null;
  onSuccess?: () => void;
}

export const SERVICE_SUBCATEGORIES: Record<string, string[]> = {
  Electrician: ["Wiring", "Lighting", "Panel Upgrade", "General Repair", "Other"],
  Plumber: ["Pipe Leak", "Drain Cleaning", "Fixture Install", "Water Heater", "Other"],
  Carpenter: ["Furniture", "Doors/Windows", "Cabinetry", "Wood Repair", "Other"],
  Painter: ["Interior", "Exterior", "Touch-up", "Texture", "Other"],
  Housekeeping: ["Daily Cleaning", "Deep Cleaning", "Waste Management", "Other"],
  "Security Agency": ["Guards", "CCTV Monitoring", "Access Control", "Other"],
  "Lift Maintenance": ["Routine Inspection", "Repair", "Emergency Rescue", "Other"],
  "Pest Control": ["Insects", "Rodents", "Termites", "Other"],
  Gardening: ["Lawn Care", "Tree Trimming", "Landscaping", "Other"],
  "Water Tank Cleaning": ["Underground Tank", "Overhead Tank", "Disinfection", "Other"],
  "Generator Maintenance": ["Routine Service", "Repair", "Fuel Management", "Other"],
  "Fire Safety": ["Extinguisher Refill", "Alarm System", "Hydrant Maintenance", "Other"],
  "CCTV Maintenance": ["Camera Repair", "DVR/NVR Service", "Wiring", "Other"],
  "Internet Service Provider": ["Broadband", "Fiber", "Leased Line", "Other"],
  "Civil Contractor": ["Masonry", "Waterproofing", "Plastering", "Other"],
  "Event Organizer": ["Setup", "Decoration", "Sound/Lighting", "Other"],
  Catering: ["Buffet", "Packed Meals", "Beverages", "Other"],
  Other: ["General", "Specialized"],
};

export interface ContactPersonItem {
  name: string;
  role: string;
  mobile: string;
}

export interface ServiceItem {
  category: string;
  subcategory: string;
  available_days: string;
  working_hours: string;
  emergency: boolean;
  support_24_7: boolean;
}

const STEP_TITLES = [
  "",
  "1. Basic Information",
  "2. Contact Information",
  "3. Services Offered",
  "4. Business Details",
  "5. Contract Details",
  "6. Bank Details",
  "7. Documents (Upload Files)",
  "8. Performance & Rating",
  "9. Association Mapping",
  "10. Status & Remarks",
];

export const VendorFormModal: React.FC<VendorFormModalProps> = ({
  isOpen,
  onClose,
  vendorToEdit,
  onSuccess,
}) => {
  const isEditing = Boolean(vendorToEdit);
  const [currentStep, setCurrentStep] = useState(1);

  // Core Form State
  const [formData, setFormData] = useState<Partial<Vendor>>({});
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

  // Dynamic Contacts
  const [contacts, setContacts] = useState<ContactPersonItem[]>([
    { name: "", role: "Owner", mobile: "" },
  ]);

  // Dynamic Services
  const [services, setServices] = useState<ServiceItem[]>([
    {
      category: "Security Agency",
      subcategory: "Guards",
      available_days: "Mon-Sat",
      working_hours: "9 A.M. to 6 A.M.",
      emergency: false,
      support_24_7: true,
    },
  ]);

  // Errors state (Strict Sequential Validation: only one active error at a time)
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: associations = [] } = useGetAssociationsQuery(undefined, {
    skip: !isOpen,
  });
  const [createVendor, { isLoading: isCreating }] = useCreateVendorMutation();
  const [updateVendor, { isLoading: isUpdating }] = useUpdateVendorMutation();
  const isSaving = isCreating || isUpdating;

  useEffect(() => {
    if (isOpen) {
      if (vendorToEdit) {
        setFormData({ ...vendorToEdit });

        // Parse Contacts
        if (vendorToEdit.contact_details_json) {
          try {
            const parsed =
              typeof vendorToEdit.contact_details_json === "string"
                ? JSON.parse(vendorToEdit.contact_details_json)
                : vendorToEdit.contact_details_json;
            if (Array.isArray(parsed) && parsed.length > 0) {
              setContacts(parsed);
            } else {
              setContacts([
                {
                  name: vendorToEdit.contact_person || vendorToEdit.name || "",
                  role: "Owner",
                  mobile:
                    vendorToEdit.contact_number ||
                    vendorToEdit.mobile_number ||
                    "",
                },
              ]);
            }
          } catch {
            setContacts([
              {
                name: vendorToEdit.contact_person || "",
                role: "Owner",
                mobile: vendorToEdit.contact_number || "",
              },
            ]);
          }
        } else {
          setContacts([
            {
              name: vendorToEdit.contact_person || "",
              role: "Owner",
              mobile:
                vendorToEdit.contact_number ||
                vendorToEdit.mobile_number ||
                "",
            },
          ]);
        }

        // Parse Services
        if (vendorToEdit.services_offered_json) {
          try {
            const parsed =
              typeof vendorToEdit.services_offered_json === "string"
                ? JSON.parse(vendorToEdit.services_offered_json)
                : vendorToEdit.services_offered_json;
            if (Array.isArray(parsed) && parsed.length > 0) {
              setServices(parsed);
            } else {
              setServices([
                {
                  category: vendorToEdit.vendor_category || "Security Agency",
                  subcategory: vendorToEdit.service_type || "Guards",
                  available_days: vendorToEdit.available_days || "Mon-Sat",
                  working_hours: vendorToEdit.working_hours || "9 A.M. to 6 A.M.",
                  emergency: Boolean(vendorToEdit.emergency_service),
                  support_24_7: Boolean(vendorToEdit.support_24_7),
                },
              ]);
            }
          } catch {
            setServices([
              {
                category: vendorToEdit.vendor_category || "Security Agency",
                subcategory: vendorToEdit.service_type || "Guards",
                available_days: vendorToEdit.available_days || "Mon-Sat",
                working_hours: vendorToEdit.working_hours || "9 A.M. to 6 A.M.",
                emergency: Boolean(vendorToEdit.emergency_service),
                support_24_7: Boolean(vendorToEdit.support_24_7),
              },
            ]);
          }
        } else {
          setServices([
            {
              category: vendorToEdit.vendor_category || "Security Agency",
              subcategory: vendorToEdit.service_type || "Guards",
              available_days: vendorToEdit.available_days || "Mon-Sat",
              working_hours: vendorToEdit.working_hours || "9 A.M. to 6 A.M.",
              emergency: Boolean(vendorToEdit.emergency_service),
              support_24_7: Boolean(vendorToEdit.support_24_7),
            },
          ]);
        }
      } else {
        setFormData({
          status: "Active",
          vendor_code: "",
          vendor_rating: 4.5,
        });
        setContacts([{ name: "", role: "Owner", mobile: "" }]);
        setServices([
          {
            category: "Security Agency",
            subcategory: "Guards",
            available_days: "Mon-Sat",
            working_hours: "9 A.M. to 6 A.M.",
            emergency: false,
            support_24_7: true,
          },
        ]);
      }
      setCurrentStep(1);
      setCountryId("");
      setRegionId("");
      setErrors({});
    }
  }, [vendorToEdit, isOpen]);

  const handleFieldChange = (field: keyof Vendor, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
  };

  // Sequential Validation for current step
  const validateStep = (step: number): boolean => {
    if (step === 1) {
      if (!formData.name?.trim()) {
        setErrors({ name: "Vendor Name is required" });
        return false;
      }
    } else if (step === 2) {
      if (!contacts[0]?.name?.trim()) {
        setErrors({ contact_person_0: "Contact person name is required" });
        return false;
      }
      if (!contacts[0]?.mobile?.trim()) {
        setErrors({ contact_mobile_0: "Contact mobile number is required" });
        return false;
      }
    } else if (step === 3) {
      if (!services[0]?.category) {
        setErrors({ service_category_0: "Service category is required" });
        return false;
      }
    }

    setErrors({});
    return true;
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!validateStep(currentStep)) return;
    setCurrentStep((prev) => Math.min(prev + 1, 10));
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault();
    setErrors({});
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleVendorSubmit = async (statusOverride?: string) => {
    // Validate required steps top-to-bottom
    if (!formData.name?.trim()) {
      setErrors({ name: "Vendor Name is required" });
      setCurrentStep(1);
      return;
    }
    if (!contacts[0]?.name?.trim()) {
      setErrors({ contact_person_0: "Contact person name is required" });
      setCurrentStep(2);
      return;
    }
    if (!contacts[0]?.mobile?.trim()) {
      setErrors({ contact_mobile_0: "Contact mobile number is required" });
      setCurrentStep(2);
      return;
    }
    if (!services[0]?.category) {
      setErrors({ service_category_0: "Service category is required" });
      setCurrentStep(3);
      return;
    }

    try {
      const payload: any = { ...formData };

      // Attach Contacts
      if (contacts.length > 0) {
        payload.contact_details_json = JSON.stringify(contacts);
        payload.contact_person = contacts[0]?.name || "";
        payload.contact_number = contacts[0]?.mobile || "";
      }

      // Attach Services
      if (services.length > 0) {
        payload.services_offered_json = JSON.stringify(services);
        payload.vendor_category = services[0]?.category || "";
        payload.service_type =
          services[0]?.subcategory || services[0]?.category || "General";
        payload.available_days = services[0]?.available_days || "";
        payload.working_hours = services[0]?.working_hours || "";
        payload.emergency_service = services.some((s) => s.emergency);
        payload.support_24_7 = services.some((s) => s.support_24_7);
      }

      if (statusOverride) {
        payload.status = statusOverride;
      }

      if (!payload.vendor_code && !isEditing) {
        payload.vendor_code =
          "VND-" + Math.random().toString(36).substring(2, 8).toUpperCase();
      }

      if (isEditing && vendorToEdit?.id) {
        await updateVendor({ id: vendorToEdit.id, data: payload }).unwrap();
        toast.success("Vendor updated successfully");
      } else {
        await createVendor(payload).unwrap();
        toast.success("Vendor registered successfully");
      }

      onSuccess?.();
      onClose();
    } catch (err: any) {
      toast.error(
        err?.data?.detail ||
          err?.data?.message ||
          err?.message ||
          "Failed to save vendor"
      );
    }
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Vendor" : "Register Vendor"}
      description={
        isEditing
          ? "Update contractor profile, services offered, contract terms, or bank accounts."
          : "Onboard an approved service contractor, technician or agency."
      }
      icon={
        isEditing ? (
          <Pencil size={18} className="text-slate-800" />
        ) : (
          <Wrench size={18} className="text-slate-800" />
        )
      }
      size="3xl"
      isSubmitting={isSaving}
      customFooter={
        <div className="flex items-center justify-between w-full">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="h-9 px-4 rounded-xl text-xs font-semibold border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            Cancel
          </Button>

          <div className="flex items-center gap-2.5">
            {currentStep > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={handlePrev}
                className="h-9 px-4 rounded-xl text-xs font-semibold border-slate-200 cursor-pointer"
              >
                <ChevronLeft size={14} className="mr-1" />
                Previous
              </Button>
            )}

            {currentStep < 10 ? (
              <Button
                type="button"
                onClick={handleNext}
                className="h-9 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs cursor-pointer"
              >
                <span>Next</span>
                <ChevronRight size={14} className="ml-1" />
              </Button>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleVendorSubmit("Draft")}
                  disabled={isSaving}
                  className="h-9 px-4 rounded-xl text-xs font-semibold border-slate-200 text-slate-700 cursor-pointer"
                >
                  Save Draft
                </Button>
                <Button
                  type="button"
                  onClick={() => handleVendorSubmit()}
                  disabled={isSaving}
                  className="h-9 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs cursor-pointer"
                >
                  {isSaving
                    ? "Saving..."
                    : isEditing
                    ? "Save Changes"
                    : "Register Vendor"}
                </Button>
              </>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Step Wizard Header */}
        <div className="bg-slate-50/90 p-3.5 rounded-xl border border-slate-200/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-900">
              {STEP_TITLES[currentStep]}
            </span>
            <span className="text-[11px] font-semibold text-slate-600 bg-white px-2.5 py-0.5 rounded-full border border-slate-200/80 shadow-2xs">
              Step {currentStep} of 10
            </span>
          </div>

          {/* Progress Segmented Bar */}
          <div className="grid grid-cols-10 gap-1">
            {Array.from({ length: 10 }).map((_, i) => {
              const stepNumber = i + 1;
              const isPast = stepNumber < currentStep;
              const isCurrent = stepNumber === currentStep;

              return (
                <div
                  key={i}
                  onClick={() => {
                    if (isPast) {
                      setErrors({});
                      setCurrentStep(stepNumber);
                    }
                  }}
                  className={`h-1.5 rounded-full transition-all ${
                    isCurrent
                      ? "bg-indigo-600"
                      : isPast
                      ? "bg-indigo-300 cursor-pointer hover:bg-indigo-400"
                      : "bg-slate-200"
                  }`}
                  title={STEP_TITLES[stepNumber]}
                />
              );
            })}
          </div>
        </div>

        {/* STEP 1: Basic Information */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                label="Vendor Name"
                required
                error={errors.name}
                helperText="Primary brand or individual name"
              >
                <Input
                  type="text"
                  placeholder="e.g. Acme Facility Services"
                  value={formData.name || ""}
                  onChange={(e) => handleFieldChange("name", e.target.value)}
                  disabled={isSaving}
                  autoFocus
                />
              </FormField>

              <FormField
                label="Vendor Code"
                helperText="Optional custom ID or auto-generated"
              >
                <Input
                  type="text"
                  placeholder="Auto-generated if blank (e.g. VND-8X9Y2)"
                  value={formData.vendor_code || ""}
                  onChange={(e) =>
                    handleFieldChange("vendor_code", e.target.value)
                  }
                  disabled={isSaving}
                />
              </FormField>
            </div>

            <FormField
              label="Business / Enterprise Name"
              helperText="Legal registered entity name if different"
            >
              <Input
                type="text"
                placeholder="e.g. Acme Services Private Limited"
                value={formData.business_name || ""}
                onChange={(e) =>
                  handleFieldChange("business_name", e.target.value)
                }
                disabled={isSaving}
              />
            </FormField>

            {/* Address */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                Registered Office Address
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormField label="Address Line 1">
                  <Input
                    type="text"
                    placeholder="Street address, building, suite"
                    value={formData.address_line_1 || ""}
                    onChange={(e) =>
                      handleFieldChange("address_line_1", e.target.value)
                    }
                    disabled={isSaving}
                  />
                </FormField>

                <FormField label="Address Line 2 (Optional)">
                  <Input
                    type="text"
                    placeholder="Landmark, area"
                    value={formData.address_line_2 || ""}
                    onChange={(e) =>
                      handleFieldChange("address_line_2", e.target.value)
                    }
                    disabled={isSaving}
                  />
                </FormField>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <FormField label="Country" error={errors.country_id}>
                    <Select value={countryId} onValueChange={(value) => { setCountryId(value); setRegionId(""); handleFieldChange("city_id", ""); }} options={countries.map((country) => ({ value: country.id, label: country.name }))} placeholder="Select country..." disabled={isSaving || isLoadingCountries} error={Boolean(errors.country_id)} />
                  </FormField>
                  <FormField label="State / Region" error={errors.region_id}>
                    <Select value={regionId} onValueChange={(value) => { setRegionId(value); handleFieldChange("city_id", ""); }} options={regions.map((region) => ({ value: region.id, label: region.name }))} placeholder="Select state..." disabled={isSaving || !countryId || isLoadingRegions} error={Boolean(errors.region_id)} />
                  </FormField>
                  <FormField label="City" error={errors.city_id}>
                    <Select value={formData.city_id || ""} onValueChange={(value) => handleFieldChange("city_id", value)} options={cities.map((city) => ({ value: city.id, label: city.name }))} placeholder="Select city..." disabled={isSaving || !regionId || isLoadingCities} error={Boolean(errors.city_id)} />
                  </FormField>
                </div>
                <FormField label="ZIP / Postal Code">
                  <Input
                    type="text"
                    placeholder="e.g. 400001"
                    value={formData.zip_code || ""}
                    onChange={(e) =>
                      handleFieldChange("zip_code", e.target.value)
                    }
                    disabled={isSaving}
                  />
                </FormField>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Contact Information */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormField label="Email Address">
                <Input
                  type="email"
                  placeholder="vendor@example.com"
                  value={formData.email || ""}
                  onChange={(e) => handleFieldChange("email", e.target.value)}
                  disabled={isSaving}
                />
              </FormField>

              <FormField label="Website URL">
                <Input
                  type="url"
                  placeholder="https://www.vendor.com"
                  value={formData.website || ""}
                  onChange={(e) => handleFieldChange("website", e.target.value)}
                  disabled={isSaving}
                />
              </FormField>

              <FormField label="WhatsApp Number">
                <Input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={formData.whatsapp_number || ""}
                  onChange={(e) =>
                    handleFieldChange("whatsapp_number", e.target.value)
                  }
                  disabled={isSaving}
                />
              </FormField>
            </div>

            {/* Dynamic Contacts */}
            <div className="space-y-2.5 pt-2">
              <div className="flex items-center justify-between">
                <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Contact Persons
                </h5>
                <button
                  type="button"
                  onClick={() =>
                    setContacts((prev) => [
                      ...prev,
                      { name: "", role: "Manager", mobile: "" },
                    ])
                  }
                  className="text-xs bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Plus size={14} />
                  <span>Add Person</span>
                </button>
              </div>

              <div className="space-y-3">
                {contacts.map((contact, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row gap-3 items-end sm:items-center bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/80 relative"
                  >
                    <div className="flex-1 w-full sm:w-auto">
                      <FormField
                        label="Name"
                        required={idx === 0}
                        error={idx === 0 ? errors.contact_person_0 : undefined}
                      >
                        <Input
                          type="text"
                          placeholder="Contact person name"
                          value={contact.name}
                          onChange={(e) => {
                            const next = [...contacts];
                            next[idx].name = e.target.value;
                            setContacts(next);
                            if (errors.contact_person_0) {
                              setErrors((prev) => {
                                const up = { ...prev };
                                delete up.contact_person_0;
                                return up;
                              });
                            }
                          }}
                          disabled={isSaving}
                          className="bg-white"
                        />
                      </FormField>
                    </div>

                    <div className="w-full sm:w-40">
                      <FormField label="Role / Designation">
                        <Select
                          value={contact.role}
                          onChange={(e) => {
                            const next = [...contacts];
                            next[idx].role = e.target.value;
                            setContacts(next);
                          }}
                          options={[
                            { value: "Owner", label: "Owner" },
                            { value: "Manager", label: "Manager" },
                            { value: "Technician", label: "Technician" },
                            { value: "Worker", label: "Worker" },
                          ]}
                          disabled={isSaving}
                        />
                      </FormField>
                    </div>

                    <div className="flex-1 w-full sm:w-auto">
                      <FormField
                        label="Mobile Number"
                        required={idx === 0}
                        error={idx === 0 ? errors.contact_mobile_0 : undefined}
                      >
                        <Input
                          type="tel"
                          placeholder="+91 98765 43210"
                          value={contact.mobile}
                          onChange={(e) => {
                            const next = [...contacts];
                            next[idx].mobile = e.target.value;
                            setContacts(next);
                            if (errors.contact_mobile_0) {
                              setErrors((prev) => {
                                const up = { ...prev };
                                delete up.contact_mobile_0;
                                return up;
                              });
                            }
                          }}
                          disabled={isSaving}
                          className="bg-white"
                        />
                      </FormField>
                    </div>

                    {contacts.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          setContacts((prev) => prev.filter((_, i) => i !== idx))
                        }
                        className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 p-2 rounded-lg transition-colors cursor-pointer shrink-0 mb-1"
                        title="Remove Contact"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Services Offered */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-slate-500">
                Specify primary contractor trade categories and working coverage.
              </p>
              <button
                type="button"
                onClick={() =>
                  setServices((prev) => [
                    ...prev,
                    {
                      category: "Electrician",
                      subcategory: "",
                      available_days: "Mon-Sat",
                      working_hours: "9 A.M. to 6 A.M.",
                      emergency: false,
                      support_24_7: false,
                    },
                  ])
                }
                className="text-xs bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Plus size={14} />
                <span>Add Service</span>
              </button>
            </div>

            <div className="space-y-3.5">
              {services.map((service, idx) => (
                <div
                  key={idx}
                  className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/80 relative space-y-3"
                >
                  {services.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        setServices((prev) => prev.filter((_, i) => i !== idx))
                      }
                      className="absolute top-3 right-3 text-rose-500 hover:text-rose-700 hover:bg-rose-50 p-1.5 rounded-lg transition-colors cursor-pointer"
                      title="Remove Service"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <FormField
                      label="Service Category"
                      required={idx === 0}
                      error={idx === 0 ? errors.service_category_0 : undefined}
                    >
                      <Select
                        value={service.category}
                        onChange={(e) => {
                          const next = [...services];
                          next[idx].category = e.target.value;
                          next[idx].subcategory = "";
                          setServices(next);
                          if (errors.service_category_0) {
                            setErrors((prev) => {
                              const up = { ...prev };
                              delete up.service_category_0;
                              return up;
                            });
                          }
                        }}
                        options={[
                          { value: "", label: "Select Category..." },
                          ...Object.keys(SERVICE_SUBCATEGORIES).map((c) => ({
                            value: c,
                            label: c,
                          })),
                        ]}
                        disabled={isSaving}
                        error={Boolean(idx === 0 && errors.service_category_0)}
                      />
                    </FormField>

                    <FormField label="Subcategory / Specialization">
                      <Select
                        value={service.subcategory}
                        onChange={(e) => {
                          const next = [...services];
                          next[idx].subcategory = e.target.value;
                          setServices(next);
                        }}
                        options={[
                          { value: "", label: "Select Subcategory..." },
                          ...(SERVICE_SUBCATEGORIES[service.category] || []).map(
                            (sc) => ({ value: sc, label: sc })
                          ),
                        ]}
                        disabled={isSaving}
                      />
                    </FormField>

                    <FormField label="Available Days">
                      <Input
                        type="text"
                        placeholder="e.g. Mon-Sat"
                        value={service.available_days}
                        onChange={(e) => {
                          const next = [...services];
                          next[idx].available_days = e.target.value;
                          setServices(next);
                        }}
                        disabled={isSaving}
                        className="bg-white"
                      />
                    </FormField>

                    <FormField label="Working Hours">
                      <Input
                        type="text"
                        placeholder="e.g. 9 A.M. to 6 P.M."
                        value={service.working_hours}
                        onChange={(e) => {
                          const next = [...services];
                          next[idx].working_hours = e.target.value;
                          setServices(next);
                        }}
                        disabled={isSaving}
                        className="bg-white"
                      />
                    </FormField>

                    <div className="sm:col-span-2 flex items-center gap-6 pt-1">
                      <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(service.emergency)}
                          onChange={(e) => {
                            const next = [...services];
                            next[idx].emergency = e.target.checked;
                            setServices(next);
                          }}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span>Emergency On-Call Service</span>
                      </label>

                      <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(service.support_24_7)}
                          onChange={(e) => {
                            const next = [...services];
                            next[idx].support_24_7 = e.target.checked;
                            setServices(next);
                          }}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span>24×7 Support Team</span>
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 4: Business Details */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="GSTIN / GST Number">
                <Input
                  type="text"
                  placeholder="e.g. 27ABCDE1234F1Z5"
                  value={formData.gst_number || ""}
                  onChange={(e) =>
                    handleFieldChange("gst_number", e.target.value)
                  }
                  disabled={isSaving}
                />
              </FormField>

              <FormField label="PAN Number">
                <Input
                  type="text"
                  placeholder="e.g. ABCDE1234F"
                  value={formData.pan_number || ""}
                  onChange={(e) =>
                    handleFieldChange("pan_number", e.target.value)
                  }
                  disabled={isSaving}
                />
              </FormField>

              <FormField label="Company Registration Number">
                <Input
                  type="text"
                  placeholder="Registration Number / CIN"
                  value={formData.registration_number || ""}
                  onChange={(e) =>
                    handleFieldChange("registration_number", e.target.value)
                  }
                  disabled={isSaving}
                />
              </FormField>

              <FormField label="License Number">
                <Input
                  type="text"
                  placeholder="License Number"
                  value={formData.license_number || ""}
                  onChange={(e) =>
                    handleFieldChange("license_number", e.target.value)
                  }
                  disabled={isSaving}
                />
              </FormField>

              <FormField label="Trade License Number">
                <Input
                  type="text"
                  placeholder="Trade License Number"
                  value={formData.trade_license_number || ""}
                  onChange={(e) =>
                    handleFieldChange("trade_license_number", e.target.value)
                  }
                  disabled={isSaving}
                />
              </FormField>

              <FormField label="Years of Experience">
                <Input
                  type="number"
                  placeholder="e.g. 5"
                  value={formData.years_of_experience ?? ""}
                  onChange={(e) =>
                    handleFieldChange("years_of_experience", e.target.value)
                  }
                  disabled={isSaving}
                />
              </FormField>
            </div>
          </div>
        )}

        {/* STEP 5: Contract Details */}
        {currentStep === 5 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Contract Start Date">
                <DatePicker
                  value={
                    formData.contract_start_date
                      ? formData.contract_start_date.slice(0, 10)
                      : ""
                  }
                  onChange={(date) =>
                    handleFieldChange("contract_start_date", date)
                  }
                  placeholder="Select start date"
                  disabled={isSaving}
                />
              </FormField>

              <FormField label="Contract End Date">
                <DatePicker
                  value={
                    formData.contract_end_date
                      ? formData.contract_end_date.slice(0, 10)
                      : ""
                  }
                  onChange={(date) =>
                    handleFieldChange("contract_end_date", date)
                  }
                  placeholder="Select end date"
                  disabled={isSaving}
                />
              </FormField>

              <FormField label="Contract Value (₹)">
                <Input
                  type="number"
                  placeholder="e.g. 500000"
                  value={formData.contract_value ?? ""}
                  onChange={(e) =>
                    handleFieldChange("contract_value", e.target.value)
                  }
                  disabled={isSaving}
                />
              </FormField>

              <FormField label="Payment Terms">
                <Input
                  type="text"
                  placeholder="e.g. Net 30, Monthly Advance"
                  value={formData.payment_terms || ""}
                  onChange={(e) =>
                    handleFieldChange("payment_terms", e.target.value)
                  }
                  disabled={isSaving}
                />
              </FormField>

              <div className="sm:col-span-2">
                <FormField label="Contract Document / SLA">
                  <FileUploadZone
                    value={formData.contract_document_url || ""}
                    onChange={(url) =>
                      handleFieldChange("contract_document_url", url)
                    }
                    label="Upload Contract Document"
                    helperText="PDF or DOCX document up to 20MB"
                    accept=".pdf,.doc,.docx"
                    maxSizeMB={20}
                    disabled={isSaving}
                  />
                </FormField>
              </div>

              <div className="sm:col-span-2 pt-1">
                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={Boolean(formData.renewal_reminder)}
                    onChange={(e) =>
                      handleFieldChange("renewal_reminder", e.target.checked)
                    }
                    disabled={isSaving}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Enable automatic contract renewal reminder</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* STEP 6: Bank Details */}
        {currentStep === 6 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Beneficiary / Account Holder Name">
                <Input
                  type="text"
                  placeholder="Name on bank account"
                  value={formData.bank_account_name || ""}
                  onChange={(e) =>
                    handleFieldChange("bank_account_name", e.target.value)
                  }
                  disabled={isSaving}
                />
              </FormField>

              <FormField label="Bank Name">
                <Input
                  type="text"
                  placeholder="e.g. HDFC Bank"
                  value={formData.bank_name || ""}
                  onChange={(e) =>
                    handleFieldChange("bank_name", e.target.value)
                  }
                  disabled={isSaving}
                />
              </FormField>

              <FormField label="Account Number">
                <Input
                  type="text"
                  placeholder="Bank Account Number"
                  value={formData.bank_account_number || ""}
                  onChange={(e) =>
                    handleFieldChange("bank_account_number", e.target.value)
                  }
                  disabled={isSaving}
                />
              </FormField>

              <FormField label="IFSC Code">
                <Input
                  type="text"
                  placeholder="e.g. HDFC0001234"
                  value={formData.bank_ifsc_code || ""}
                  onChange={(e) =>
                    handleFieldChange("bank_ifsc_code", e.target.value)
                  }
                  disabled={isSaving}
                />
              </FormField>

              <div className="sm:col-span-2">
                <FormField label="UPI ID (VPA)">
                  <Input
                    type="text"
                    placeholder="e.g. vendor@okhdfcbank"
                    value={formData.bank_upi_id || ""}
                    onChange={(e) =>
                      handleFieldChange("bank_upi_id", e.target.value)
                    }
                    disabled={isSaving}
                  />
                </FormField>
              </div>
            </div>
          </div>
        )}

        {/* STEP 7: Documents (Upload Files) */}
        {currentStep === 7 && (
          <div className="space-y-4">
            <p className="text-xs text-slate-500">
              Upload scanned vendor registration certificates, tax cards, and agreements.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="GST Certificate">
                <FileUploadZone
                  value={formData.gst_certificate_url || ""}
                  onChange={(url) =>
                    handleFieldChange("gst_certificate_url", url)
                  }
                  label="Upload GST Certificate"
                  helperText="PDF or PNG up to 10MB"
                  accept=".pdf,.png,.jpg,.jpeg"
                  maxSizeMB={10}
                  disabled={isSaving}
                />
              </FormField>

              <FormField label="PAN Card Copy">
                <FileUploadZone
                  value={formData.pan_card_url || ""}
                  onChange={(url) => handleFieldChange("pan_card_url", url)}
                  label="Upload PAN Card Copy"
                  helperText="PDF or image document"
                  accept=".pdf,.png,.jpg,.jpeg"
                  maxSizeMB={10}
                  disabled={isSaving}
                />
              </FormField>

              <FormField label="Business License">
                <FileUploadZone
                  value={formData.business_license_url || ""}
                  onChange={(url) =>
                    handleFieldChange("business_license_url", url)
                  }
                  label="Upload Business License"
                  helperText="Shop & Est. / Trade license"
                  accept=".pdf,.png,.jpg,.jpeg"
                  maxSizeMB={10}
                  disabled={isSaving}
                />
              </FormField>

              <FormField label="Insurance Certificate">
                <FileUploadZone
                  value={formData.insurance_certificate_url || ""}
                  onChange={(url) =>
                    handleFieldChange("insurance_certificate_url", url)
                  }
                  label="Upload Insurance Certificate"
                  helperText="Workmen / General Liability"
                  accept=".pdf,.png,.jpg,.jpeg"
                  maxSizeMB={10}
                  disabled={isSaving}
                />
              </FormField>

              <FormField label="Agreement Copy">
                <FileUploadZone
                  value={formData.agreement_copy_url || ""}
                  onChange={(url) =>
                    handleFieldChange("agreement_copy_url", url)
                  }
                  label="Upload Agreement Copy"
                  helperText="Signed Service Agreement"
                  accept=".pdf,.doc,.docx"
                  maxSizeMB={20}
                  disabled={isSaving}
                />
              </FormField>

              <FormField label="Identity Proof (Authorized Signatory)">
                <FileUploadZone
                  value={formData.identity_proof_url || ""}
                  onChange={(url) =>
                    handleFieldChange("identity_proof_url", url)
                  }
                  label="Upload Identity Proof"
                  helperText="Aadhar / Passport copy"
                  accept=".pdf,.png,.jpg,.jpeg"
                  maxSizeMB={10}
                  disabled={isSaving}
                />
              </FormField>

              <FormField label="Address Proof">
                <FileUploadZone
                  value={formData.address_proof_url || ""}
                  onChange={(url) =>
                    handleFieldChange("address_proof_url", url)
                  }
                  label="Upload Address Proof"
                  helperText="Utility bill / Lease deed"
                  accept=".pdf,.png,.jpg,.jpeg"
                  maxSizeMB={10}
                  disabled={isSaving}
                />
              </FormField>

              <FormField label="Other Supporting Documents">
                <FileUploadZone
                  value={formData.other_documents_url || ""}
                  onChange={(url) =>
                    handleFieldChange("other_documents_url", url)
                  }
                  label="Upload Other Documents"
                  helperText="Certifications / Portfolios"
                  accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                  maxSizeMB={20}
                  disabled={isSaving}
                />
              </FormField>
            </div>
          </div>
        )}

        {/* STEP 8: Performance & Rating */}
        {currentStep === 8 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                label="Vendor Rating (0 - 5)"
                helperText="Baseline contractor rating score"
              >
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  placeholder="e.g. 4.5"
                  value={formData.vendor_rating ?? ""}
                  onChange={(e) =>
                    handleFieldChange("vendor_rating", e.target.value)
                  }
                  disabled={isSaving}
                />
              </FormField>
            </div>

            <div className="flex items-center gap-6 p-4 bg-slate-50 rounded-xl border border-slate-200/80">
              <label className="flex items-center gap-2 text-xs font-medium text-slate-800 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={Boolean(formData.preferred_vendor)}
                  onChange={(e) =>
                    handleFieldChange("preferred_vendor", e.target.checked)
                  }
                  disabled={isSaving}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="flex items-center gap-1">
                  <Star size={14} className="text-amber-500 fill-amber-500" />
                  Preferred Vendor
                </span>
              </label>

              <label className="flex items-center gap-2 text-xs font-medium text-slate-800 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={Boolean(formData.verified_vendor)}
                  onChange={(e) =>
                    handleFieldChange("verified_vendor", e.target.checked)
                  }
                  disabled={isSaving}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="flex items-center gap-1">
                  <CheckCircle2 size={14} className="text-emerald-600" />
                  Verified Vendor
                </span>
              </label>
            </div>
          </div>
        )}

        {/* STEP 9: Association Mapping */}
        {currentStep === 9 && (
          <div className="space-y-4 max-w-lg">
            <FormField
              label="Assigned Association"
              helperText="Link vendor to a specific association or keep unmapped"
            >
              <Select
                value={formData.association_name || ""}
                onChange={(e) =>
                  handleFieldChange("association_name", e.target.value)
                }
                options={[
                  { value: "", label: "Not Assigned (Global Contractor)" },
                  ...associations.map((a) => ({
                    value: a.name,
                    label: a.name,
                  })),
                ]}
                disabled={isSaving}
              />
            </FormField>

            <FormField
              label="Assigned Blocks / Towers"
              helperText="e.g. Block A, Block B (leave empty for all blocks)"
            >
              <Input
                type="text"
                placeholder="e.g. Tower 1, Tower 2"
                value={formData.assigned_blocks || ""}
                onChange={(e) =>
                  handleFieldChange("assigned_blocks", e.target.value)
                }
                disabled={isSaving}
              />
            </FormField>

            <FormField
              label="Assigned Services / Scopes"
              helperText="Specific scopes of work within the community"
            >
              <Input
                type="text"
                placeholder="e.g. Common Area Electrical Maintenance"
                value={formData.assigned_services || ""}
                onChange={(e) =>
                  handleFieldChange("assigned_services", e.target.value)
                }
                disabled={isSaving}
              />
            </FormField>
          </div>
        )}

        {/* STEP 10: Status & Remarks */}
        {currentStep === 10 && (
          <div className="space-y-4 max-w-lg">
            <FormField
              label="Vendor Operational Status"
              helperText="Platform access state for this contractor"
            >
              <Select
                value={formData.status || "Active"}
                onChange={(e) => handleFieldChange("status", e.target.value)}
                options={[
                  { value: "Active", label: "Active" },
                  { value: "Draft", label: "Draft" },
                  { value: "Pending Approval", label: "Pending Approval" },
                  { value: "Inactive", label: "Inactive" },
                  { value: "Suspended", label: "Suspended / Blacklisted" },
                ]}
                disabled={isSaving}
              />
            </FormField>

            <FormField
              label="Remarks / Notes"
              helperText="Administrative notes, approval references or comments"
            >
              <Input
                type="text"
                placeholder="e.g. Approved by committee on Jan 2026"
                value={formData.remarks || ""}
                onChange={(e) => handleFieldChange("remarks", e.target.value)}
                disabled={isSaving}
              />
            </FormField>
          </div>
        )}
      </div>
    </FormModal>
  );
};

export default VendorFormModal;
