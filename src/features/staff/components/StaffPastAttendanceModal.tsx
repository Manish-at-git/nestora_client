import { useEffect, useState } from "react";
import { CalendarPlus } from "lucide-react";
import { toast } from "sonner";
import { FormField, FormModal } from "@/components/common";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { TimePicker } from "@/components/ui/time-picker";
import { useCreatePastStaffAttendanceMutation } from "../api";
import type { StaffMember } from "../types";

interface StaffPastAttendanceModalProps {
  isOpen: boolean;
  staff: StaffMember[];
  onClose: () => void;
}

interface PastAttendanceForm {
  staff_id: string;
  attendance_date: string;
  check_in_time: string;
  check_out_time: string;
  gate: string;
  remarks: string;
}

const emptyForm: PastAttendanceForm = {
  staff_id: "",
  attendance_date: "",
  check_in_time: "",
  check_out_time: "",
  gate: "",
  remarks: "",
};

const yesterday = () => {
  const value = new Date();
  value.setDate(value.getDate() - 1);
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${value.getFullYear()}-${month}-${day}`;
};

export function StaffPastAttendanceModal({ isOpen, staff, onClose }: StaffPastAttendanceModalProps) {
  const [form, setForm] = useState<PastAttendanceForm>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [createPastAttendance, createState] = useCreatePastStaffAttendanceMutation();

  useEffect(() => {
    if (isOpen) {
      setForm(emptyForm);
      setErrors({});
    }
  }, [isOpen]);

  const change = (field: keyof PastAttendanceForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
  };

  const changeCheckInTime = (value: string) => {
    setForm((current) => ({ ...current, check_in_time: value }));
    setErrors((current) => ({
      ...current,
      check_in_time: "",
      check_out_time: form.check_out_time && value && form.check_out_time <= value
        ? "Check-out must be after check-in"
        : "",
    }));
  };

  const changeCheckOutTime = (value: string) => {
    setForm((current) => ({ ...current, check_out_time: value }));
    setErrors((current) => ({
      ...current,
      check_out_time: form.check_in_time && value && value <= form.check_in_time
        ? "Check-out must be after check-in"
        : "",
    }));
  };

  const hasInvalidTimeRange = Boolean(
    form.check_in_time && form.check_out_time && form.check_out_time <= form.check_in_time
  );

  const submit = async () => {
    const nextErrors: Record<string, string> = {};
    if (!form.staff_id) nextErrors.staff_id = "Staff member is required";
    if (!form.attendance_date) nextErrors.attendance_date = "Attendance date is required";
    if (!form.check_in_time) nextErrors.check_in_time = "Check-in time is required";
    if (!form.check_out_time) nextErrors.check_out_time = "Check-out time is required";
    if (form.check_in_time && form.check_out_time && form.check_out_time <= form.check_in_time) {
      nextErrors.check_out_time = "Check-out must be after check-in";
    }
    if (form.attendance_date && form.attendance_date > yesterday()) {
      nextErrors.attendance_date = "Select a previous date";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      toast.error("Please correct the highlighted fields before saving");
      return;
    }
    try {
      await createPastAttendance({
        staff_id: form.staff_id,
        check_in_at: `${form.attendance_date}T${form.check_in_time}`,
        check_out_at: `${form.attendance_date}T${form.check_out_time}`,
        gate: form.gate?.trim() || undefined,
        remarks: form.remarks?.trim() || undefined,
      }).unwrap();
      toast.success("Past attendance recorded");
      onClose();
    } catch (error: any) {
      toast.error(error?.data || "Unable to record past attendance");
    }
  };

  return <FormModal isOpen={isOpen} onClose={onClose} title="Add Past Attendance" description="Record a completed check-in and check-out for a previous date." icon={<CalendarPlus size={18} />} size="lg" onSubmit={submit} isSubmitting={createState.isLoading} submitDisabled={hasInvalidTimeRange} submitText="Save Attendance" loadingText="Saving Attendance">
    <div className="space-y-4">
      <FormField label="Staff Member" required error={errors.staff_id}><Select value={form.staff_id} onValueChange={(value) => change("staff_id", value)} options={staff.filter((member) => member.is_active).map((member) => ({ value: member.id, label: `${member.first_name} ${member.last_name} (${member.staff_code})` }))} placeholder="Select staff member" disabled={createState.isLoading} /></FormField>
      <DatePicker label="Attendance Date" required withFormField value={form.attendance_date} onChange={(value) => change("attendance_date", value)} maxDate={yesterday()} placeholder="Select attendance date" error={errors.attendance_date} disabled={createState.isLoading} />
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Check-in Time" required error={errors.check_in_time}><TimePicker value={form.check_in_time} onChange={changeCheckInTime} minuteStep={5} placeholder="Select check-in time" disabled={createState.isLoading} /></FormField>
        <FormField label="Check-out Time" required error={errors.check_out_time}><TimePicker value={form.check_out_time} onChange={changeCheckOutTime} minuteStep={5} placeholder="Select check-out time" disabled={createState.isLoading} /></FormField>
      </div>
      <FormField label="Gate (optional)"><Input value={form.gate || ""} onChange={(event) => change("gate", event.target.value)} placeholder="e.g. Main Gate" disabled={createState.isLoading} /></FormField>
    </div>
  </FormModal>;
}
