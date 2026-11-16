import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { FileUploadZone, FormModal } from "@/components/common";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { Input } from "@/components/ui/input";
import { RadioGroup } from "@/components/ui/radio-group";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { uploadMediaAsset } from "@/lib/cloudUploader";
import {
  useCreateViolationMutation,
  useGetEligibleViolationResidentsQuery,
} from "../api/violationsApi";

const CATEGORY_OPTIONS = [
  "General Nuisance",
  "Noise & Disturbance",
  "Illegal Parking",
  "Unapproved Modifications",
  "Trash & Waste Disposal",
  "Pet Policy Violation",
  "Property Damage",
  "Other",
];

const createInitialForm = () => ({
  knows_violator: "yes",
  unit_id: "",
  violator_user_id: "",
  title: "",
  category: "General Nuisance",
  incident_at: "",
  description: "",
  proof_url: "",
  audio_url: "",
});

const createInitialErrors = () => ({
  title: "",
  description: "",
  proof: "",
  target: "",
});

export const ViolationFormModal: React.FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
}> = ({ open, onOpenChange }) => {
  const { data: residents = [] } = useGetEligibleViolationResidentsQuery(undefined, {
    skip: !open,
  });
  const [createViolation, { isLoading }] = useCreateViolationMutation();
  const [form, setForm] = useState(createInitialForm);
  const [errors, setErrors] = useState(createInitialErrors);
  const resetForm = () => {
    setForm(createInitialForm());
    setErrors(createInitialErrors());
  };

  useEffect(() => {
    if (!open) resetForm();
  }, [open]);
  const set = (key: keyof typeof form, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));
  const clearError = (key: keyof typeof errors) =>
    setErrors((current) => ({ ...current, [key]: "" }));
  const units = useMemo(
    () =>
      Array.from(
        new Map(
          residents.map((resident) => [
            resident.unit_id,
            {
              value: resident.unit_id,
              label: `${resident.block_name ? `${resident.block_name} · ` : ""}Unit ${
                resident.unit_number || "—"
              }`,
            },
          ]),
        ).values(),
      ),
    [residents],
  );
  const unitResidents = residents.filter((resident) => resident.unit_id === form.unit_id);
  const residentRoleLabel = (roleCode: string) => ({
    homeowner: "Homeowner",
    board_member: "Board member",
    committee_member: "Committee member",
  }[roleCode] || "Resident");

  const close = () => {
    resetForm();
    onOpenChange(false);
  };
  const submit = async () => {
    const knowsViolator = form.knows_violator === "yes";
    const nextErrors = {
      title: form.title.trim() ? "" : "Enter a subject.",
      description: form.description.trim() ? "" : "Enter the incident details.",
      proof: form.proof_url ? "" : "Upload a picture as evidence.",
      target:
        knowsViolator && (!form.unit_id || !form.violator_user_id)
          ? "Select the violator's unit and homeowner."
          : "",
    };

    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) {
      toast.error("Complete the highlighted required fields.");
      return;
    }
    try {
      await createViolation({
        knows_violator: knowsViolator,
        violator_user_id: knowsViolator ? form.violator_user_id : undefined,
        title: form.title,
        category: form.category,
        incident_at: form.incident_at || undefined,
        description: form.description,
        proof_url: form.proof_url,
        audio_url: form.audio_url || undefined,
      }).unwrap();
      toast.success("Violation submitted for administrative review.");
      close();
    } catch {
      toast.error("Unable to submit the violation.");
    }
  };

  return (
    <FormModal
      isOpen={open}
      onClose={close}
      title="Report homeowner violation"
      description="Provide the incident details and supporting evidence for review."
      size="xl"
      onSubmit={submit}
      isSubmitting={isLoading}
      submitText="Submit violation"
      loadingText="Submitting…"
    >
      <Input
        label="Subject"
        required
        value={form.title}
        onChange={(event) => {
          set("title", event.target.value);
          clearError("title");
        }}
        placeholder="e.g. Excessive noise after 11 PM"
        error={errors.title}
      />
      <RadioGroup
        label="Do you know the violator?"
        required
        orientation="horizontal"
        value={form.knows_violator}
        onChange={(value) =>
          setForm((current) => ({
            ...current,
            knows_violator: value,
            unit_id: "",
            violator_user_id: "",
          }))
        }
        options={[
          { value: "yes", label: "Yes" },
          { value: "no", label: "No, I could not identify them" },
        ]}
      />
      {form.knows_violator === "yes" && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Violator's unit"
            required
            value={form.unit_id}
            onValueChange={(unitId) => {
              setForm((current) => ({
                ...current,
                unit_id: unitId,
                violator_user_id: "",
              }));
              clearError("target");
            }}
            options={units}
            placeholder="Select unit"
            searchable
            disabled={!units.length}
            helperText={
              !units.length
                ? "No other resident units are currently available in your association."
                : undefined
            }
          />
          <Select
            label="Resident"
            required
            value={form.violator_user_id}
            onValueChange={(value) => {
              set("violator_user_id", value);
              clearError("target");
            }}
            options={unitResidents.map((resident) => ({
              value: resident.user_id,
              label: `${resident.name} · ${residentRoleLabel(resident.role_code)}`,
            }))}
            placeholder={form.unit_id ? "Select resident" : "Select unit first"}
            disabled={!form.unit_id}
            error={errors.target}
          />
        </div>
      )}
      <Select
        label="Violation category"
        required
        value={form.category}
        onValueChange={(value) => set("category", value)}
        options={CATEGORY_OPTIONS}
      />
      <DateTimePicker
        label="Incident date and time"
        value={form.incident_at}
        onChange={(value) => set("incident_at", value)}
        placeholder="Select incident date and time"
        minuteStep={5}
        timeFormat="12h"
        valueFormat="iso"
        maxDateTime="now"
      />
      <Textarea
        label="Details"
        required
        value={form.description}
        onChange={(event) => {
          set("description", event.target.value);
          clearError("description");
        }}
        error={errors.description}
        maxLength={5000}
        showCount
        rows={5}
        placeholder="Describe the nuisance incident, when it happened, and any relevant details."
      />
      <FileUploadZone
        value={form.proof_url || undefined}
        onChange={(url) => {
          set("proof_url", url || "");
          clearError("proof");
        }}
        onUpload={async (file) => {
          const upload = await uploadMediaAsset(file);
          if (!upload?.url) throw new Error("Upload did not return a URL");
          return upload.url;
        }}
        accept="image/png,image/jpeg,image/webp"
        label="Upload picture"
        helperText={errors.proof || "Required evidence: PNG, JPG, or WEBP up to 25 MB."}
        error={errors.proof}
      />
      <FileUploadZone
        value={form.audio_url || undefined}
        onChange={(url) => set("audio_url", url || "")}
        onUpload={async (file) => {
          const upload = await uploadMediaAsset(file);
          if (!upload?.url) throw new Error("Upload did not return a URL");
          return upload.url;
        }}
        accept="audio/mpeg,audio/wav,audio/mp4,audio/ogg"
        label="Upload audio recording"
        helperText="Optional evidence for noise-related reports."
      />
    </FormModal>
  );
};
