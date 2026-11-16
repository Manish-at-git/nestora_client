import { useEffect, useState } from "react";
import { Pencil, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { FileUploadZone, FormField, FormModal } from "@/components/common";
import { Input } from "@/components/ui/input";
import { RadioGroup } from "@/components/ui/radio-group";
import { Select } from "@/components/ui/select";
import { useGetAdminAssociationsQuery } from "@/services/api/associationsApi";
import {
  useGetLocationCitiesQuery,
  useGetLocationCountriesQuery,
  useGetLocationRegionsQuery,
} from "@/features/locations/api/locationsApi";
import { isEmail, isPersonName, isPhoneNumber, isPincode } from "@/utils/validation";
import { useCreateStaffMutation, useGetStaffAssociationBlocksQuery, useGetStaffBlockUnitsQuery, useUpdateStaffMutation } from "../api";
import { STAFF_WORK_TYPES } from "../constants";
import type { StaffMember, StaffPayload } from "../types";

interface StaffFormModalProps {
  isOpen: boolean;
  staff: StaffMember | null;
  onClose: () => void;
}

const emptyForm: StaffPayload = {
  association_id: "", first_name: "", last_name: "", designation: "", contact_number: "",
  email: "", assignment_type: "common_area", block_id: "", unit_id: "", address_line_1: "", address_line_2: "", city_id: "", pincode: "",
  emergency_contact_name: "", emergency_contact_number: "", id_proof_url: "", profile_pic_url: "",
  is_active: true,
};

export function StaffFormModal({ isOpen, staff, onClose }: StaffFormModalProps) {
  const [form, setForm] = useState<StaffPayload>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [countryId, setCountryId] = useState("");
  const [regionId, setRegionId] = useState("");
  const { data: associations = [] } = useGetAdminAssociationsQuery(undefined, { skip: !isOpen });
  const { data: countries = [], isLoading: countriesLoading } = useGetLocationCountriesQuery(undefined, { skip: !isOpen });
  const { data: regions = [], isLoading: regionsLoading } = useGetLocationRegionsQuery(countryId, { skip: !isOpen || !countryId });
  const { data: cities = [], isLoading: citiesLoading } = useGetLocationCitiesQuery(regionId, { skip: !isOpen || !regionId });
  const { data: blocks = [], isLoading: blocksLoading } = useGetStaffAssociationBlocksQuery(form.association_id, { skip: !isOpen || form.assignment_type !== "unit" || !form.association_id });
  const { data: units = [], isLoading: unitsLoading } = useGetStaffBlockUnitsQuery(form.block_id || "", { skip: !isOpen || form.assignment_type !== "unit" || !form.block_id });
  const [createStaff, createState] = useCreateStaffMutation();
  const [updateStaff, updateState] = useUpdateStaffMutation();
  const isEditing = Boolean(staff);
  const isSaving = createState.isLoading || updateState.isLoading;

  useEffect(() => {
    if (!isOpen) return;
    setErrors({});
    setCountryId(staff?.country_id || "");
    setRegionId(staff?.region_id || "");
    setForm(staff ? {
      association_id: staff.association_id, first_name: staff.first_name, last_name: staff.last_name,
      designation: staff.designation, contact_number: staff.contact_number, email: staff.email || "",
      assignment_type: staff.assignment_type || "common_area", block_id: staff.block_id || "", unit_id: staff.unit_id || "",
      address_line_1: staff.address_line_1 || "", address_line_2: staff.address_line_2 || "",
      city_id: staff.city_id || "", pincode: staff.pincode || "",
      emergency_contact_name: staff.emergency_contact_name || "", emergency_contact_number: staff.emergency_contact_number || "",
      id_proof_url: staff.id_proof_url || "", profile_pic_url: staff.profile_pic_url || "", is_active: staff.is_active,
    } : emptyForm);
  }, [isOpen, staff]);

  const change = (field: keyof StaffPayload, value: string | boolean) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
  };

  const phoneChange = (field: "contact_number" | "emergency_contact_number", value: string) => {
    const prefix = value.startsWith("+") ? "+" : "";
    change(field, `${prefix}${value.replace(/\D/g, "").slice(0, 15)}`);
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!form.association_id) nextErrors.association_id = "Association is required";
    if (form.assignment_type === "unit" && !form.block_id) nextErrors.block_id = "Block is required for a unit assignment";
    if (form.assignment_type === "unit" && !form.unit_id) nextErrors.unit_id = "Unit is required for a unit assignment";
    if (!isPersonName(form.first_name)) nextErrors.first_name = "Enter a valid first name";
    if (!isPersonName(form.last_name)) nextErrors.last_name = "Enter a valid last name";
    if (!form.designation.trim()) nextErrors.designation = "Work type is required";
    else if (!(STAFF_WORK_TYPES as readonly string[]).includes(form.designation)) {
      nextErrors.designation = "Select one of the listed work types";
    }
    if (!isPhoneNumber(form.contact_number)) nextErrors.contact_number = "Enter a valid contact number";
    if (!form.email.trim()) nextErrors.email = "Email address is required for staff login";
    else if (!isEmail(form.email)) nextErrors.email = "Enter a valid email address";
    if (!form.address_line_1.trim()) nextErrors.address_line_1 = "Address line 1 is required";
    if (!countryId) nextErrors.country_id = "Country is required";
    if (!regionId) nextErrors.region_id = "State / region is required";
    if (!form.city_id) nextErrors.city_id = "City is required";
    if (!isPincode(form.pincode)) nextErrors.pincode = "Pincode must be exactly 6 digits";
    if (form.emergency_contact_number?.trim() && !isPhoneNumber(form.emergency_contact_number)) nextErrors.emergency_contact_number = "Enter a valid emergency contact number";
    setErrors(nextErrors);

    const [firstInvalidField] = Object.keys(nextErrors);
    if (firstInvalidField) {
      toast.error("Please correct the highlighted fields before saving");
      window.requestAnimationFrame(() => {
        document.querySelector("#staff-form [aria-invalid='true']")?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      });
    }

    return !firstInvalidField;
  };

  const submit = async () => {
    if (!validate()) return;
    const payload: StaffPayload = {
      ...form,
      first_name: form.first_name.trim(), last_name: form.last_name.trim(), designation: form.designation.trim(),
      contact_number: form.contact_number.trim(), email: form.email.trim(),
      address_line_1: form.address_line_1.trim(), address_line_2: form.address_line_2?.trim() || undefined,
      pincode: form.pincode.trim(), emergency_contact_name: form.emergency_contact_name?.trim() || undefined,
      emergency_contact_number: form.emergency_contact_number?.trim() || undefined,
      id_proof_url: form.id_proof_url?.trim() || undefined, profile_pic_url: form.profile_pic_url?.trim() || undefined,
    };
    try {
      if (staff) await updateStaff({ id: staff.id, data: payload }).unwrap();
      else await createStaff(payload).unwrap();
      toast.success(staff ? "Staff member updated" : "Staff member added and QR pass generated");
      onClose();
    } catch (error: any) {
      toast.error(error?.data || "Unable to save staff member");
    }
  };

  return <FormModal isOpen={isOpen} onClose={onClose} title={isEditing ? "Edit Staff Member" : "Add Staff Member"} description="Staff can sign in with their email and generated temporary password. Their permanent QR pass records attendance." icon={isEditing ? <Pencil size={18} /> : <UserPlus size={18} />} size="2xl" isSubmitting={isSaving} submitText={isEditing ? "Save Changes" : "Add Staff"} loadingText="Saving Staff" onSubmit={submit} formProps={{ id: "staff-form" }}>
    <div className="space-y-5">
      <FormField label="Association" required error={errors.association_id}><Select value={form.association_id} onChange={(event) => { change("association_id", event.target.value); change("block_id", ""); change("unit_id", ""); }} options={associations.map((association) => ({ value: String(association.id), label: association.name }))} placeholder="Select association" disabled={isSaving} /></FormField>
      <section className="space-y-3 border-t border-slate-100 pt-4">
        <RadioGroup label="Assignment Type" required orientation="horizontal" value={form.assignment_type} onChange={(value) => { change("assignment_type", value as "common_area" | "unit"); if (value === "common_area") { change("block_id", ""); change("unit_id", ""); } }} options={[{ value: "common_area", label: "Common Area" }, { value: "unit", label: "Unit" }]} error={errors.assignment_type} disabled={isSaving} />
        {form.assignment_type === "unit" ? <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Block" required error={errors.block_id}><Select value={form.block_id || ""} onValueChange={(value) => { change("block_id", value); change("unit_id", ""); }} options={blocks.map((block) => ({ value: block.id, label: block.name }))} placeholder="Select block" disabled={isSaving || !form.association_id || blocksLoading} /></FormField>
          <FormField label="Unit" required error={errors.unit_id}><Select value={form.unit_id || ""} onValueChange={(value) => change("unit_id", value)} options={units.map((unit) => ({ value: unit.id, label: unit.unit_number }))} placeholder="Select unit" disabled={isSaving || !form.block_id || unitsLoading} /></FormField>
        </div> : <p className="text-xs text-slate-500">This staff member works across the association’s shared areas.</p>}
      </section>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="First Name" required error={errors.first_name}><Input value={form.first_name} onChange={(event) => change("first_name", event.target.value)} placeholder="e.g. Asha" disabled={isSaving} autoFocus /></FormField>
        <FormField label="Last Name" required error={errors.last_name}><Input value={form.last_name} onChange={(event) => change("last_name", event.target.value)} placeholder="e.g. Rao" disabled={isSaving} /></FormField>
        <FormField label="Email Address" required error={errors.email} helperText="Used to sign in; a temporary password is generated automatically."><Input type="email" value={form.email || ""} onChange={(event) => change("email", event.target.value)} placeholder="e.g. asha.rao@example.com" disabled={isSaving} /></FormField>
        <FormField label="Contact Phone" required error={errors.contact_number}><Input type="tel" value={form.contact_number} onChange={(event) => phoneChange("contact_number", event.target.value)} placeholder="e.g. +91 98765 43210" inputMode="tel" maxLength={16} disabled={isSaving} /></FormField>
        <FormField label="Work Type" required error={errors.designation}><Select value={form.designation} onChange={(event) => change("designation", event.target.value)} options={STAFF_WORK_TYPES.map((workType) => ({ value: workType, label: workType }))} placeholder="Select work type" disabled={isSaving} /></FormField>
        {isEditing ? <FormField label="Status"><Select value={String(form.is_active)} onChange={(event) => change("is_active", event.target.value === "true")} options={[{ value: "true", label: "Active" }, { value: "false", label: "Inactive" }]} disabled={isSaving} /></FormField> : null}
      </div>
      <section className="space-y-3 border-t border-slate-100 pt-4">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700">Residential Address</h4>
        <FormField label="Address Line 1" required error={errors.address_line_1}><Input value={form.address_line_1} onChange={(event) => change("address_line_1", event.target.value)} placeholder="Street address / House No." disabled={isSaving} /></FormField>
        <FormField label="Address Line 2"><Input value={form.address_line_2 || ""} onChange={(event) => change("address_line_2", event.target.value)} placeholder="Apartment, area, or landmark" disabled={isSaving} /></FormField>
        <div className="grid gap-3 sm:grid-cols-2">
          <FormField label="Country" required error={errors.country_id}><Select value={countryId} onValueChange={(value) => { setCountryId(value); setRegionId(""); change("city_id", ""); }} options={countries.map((country) => ({ value: country.id, label: country.name }))} placeholder="Select country" disabled={isSaving || countriesLoading} /></FormField>
          <FormField label="State / Region" required error={errors.region_id}><Select value={regionId} onValueChange={(value) => { setRegionId(value); change("city_id", ""); }} options={regions.map((region) => ({ value: region.id, label: region.name }))} placeholder="Select state" disabled={isSaving || !countryId || regionsLoading} /></FormField>
          <FormField label="City" required error={errors.city_id}><Select value={form.city_id} onValueChange={(value) => change("city_id", value)} options={cities.map((city) => ({ value: city.id, label: city.name }))} placeholder="Select city" disabled={isSaving || !regionId || citiesLoading} /></FormField>
          <FormField label="Pincode" required error={errors.pincode}><Input value={form.pincode} onChange={(event) => change("pincode", event.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" maxLength={6} placeholder="e.g. 400001" disabled={isSaving} /></FormField>
        </div>
      </section>
      <section className="space-y-3 border-t border-slate-100 pt-4">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700">Emergency Contact</h4>
        <div className="grid gap-3 sm:grid-cols-2">
          <FormField label="Emergency Contact Name"><Input value={form.emergency_contact_name || ""} onChange={(event) => change("emergency_contact_name", event.target.value)} placeholder="Name of spouse or guardian" disabled={isSaving} /></FormField>
          <FormField label="Emergency Contact Phone" error={errors.emergency_contact_number}><Input type="tel" value={form.emergency_contact_number || ""} onChange={(event) => phoneChange("emergency_contact_number", event.target.value)} placeholder="e.g. +91 98765 43210" inputMode="tel" maxLength={16} disabled={isSaving} /></FormField>
        </div>
      </section>
      <section className="space-y-3 border-t border-slate-100 pt-4">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700">Government ID Proof</h4>
        <FormField label="Valid ID Proof" helperText="Upload Aadhar, PAN, or passport (PDF, PNG, JPG up to 10MB)"><FileUploadZone value={form.id_proof_url || ""} onChange={(url) => change("id_proof_url", url)} label="Upload valid ID proof" accept=".pdf,.png,.jpg,.jpeg" maxSizeMB={10} disabled={isSaving} /></FormField>
      </section>
    </div>
  </FormModal>;
}
