import React, { useEffect, useMemo } from "react";
import { Controller } from "react-hook-form";
import { CalendarCheck, Clock, Phone, UserRound, UsersRound } from "lucide-react";
import { toast } from "sonner";
import { FormField, FormModal } from "@/components/common";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { TimePicker } from "@/components/ui/time-picker";
import { useAppForm } from "@/hooks/useAppForm";
import { useCreatePreApprovedVisitorMutation } from "../api";
import { VISITOR_TYPE_OPTIONS } from "../constants";
import {
  preApprovedVisitorSchema,
  type PreApprovedVisitorFormValues,
} from "../schemas";
import type {
  CreatePreApprovedVisitorPayload,
  PreApprovedVisitor,
} from "../types";

interface PreApprovedVisitorFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (visitor: PreApprovedVisitor) => void;
}

const todayValue = () => {
  const now = new Date();
  const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
  return localDate.toISOString().slice(0, 10);
};

const createDefaultValues = (): PreApprovedVisitorFormValues => ({
  visitor_name: "",
  mobile: "",
  visitor_type: "",
  visit_date: "",
  start_time: "",
  end_time: "",
  number_of_visitors: undefined,
  vehicle_number: "",
  purpose: "",
  pass_type: "Single Entry",
});

export const PreApprovedVisitorFormModal: React.FC<
  PreApprovedVisitorFormModalProps
> = ({ isOpen, onClose, onCreated }) => {
  const [createVisitor, { isLoading }] = useCreatePreApprovedVisitorMutation();
  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useAppForm<PreApprovedVisitorFormValues>({
    schema: preApprovedVisitorSchema,
    defaultValues: createDefaultValues(),
  });
  const visitDate = watch("visit_date");
  const startTime = watch("start_time");
  const minimumStartTime = useMemo(() => {
    if (visitDate !== todayValue()) return undefined;

    const now = new Date();
    const nextFiveMinutes = new Date(now);
    nextFiveMinutes.setSeconds(0, 0);
    nextFiveMinutes.setMinutes(nextFiveMinutes.getMinutes() + (5 - (nextFiveMinutes.getMinutes() % 5)));
    return `${String(nextFiveMinutes.getHours()).padStart(2, "0")}:${String(
      nextFiveMinutes.getMinutes(),
    ).padStart(2, "0")}`;
  }, [visitDate]);
  const minimumEndTime = useMemo(() => {
    if (!startTime) return minimumStartTime;

    const [hours, minutes] = startTime.split(":").map(Number);
    const endMinutes = hours * 60 + minutes + 5;
    if (endMinutes >= 24 * 60) return undefined;
    const nextStartTime = `${String(Math.floor(endMinutes / 60)).padStart(2, "0")}:${String(
      endMinutes % 60,
    ).padStart(2, "0")}`;
    return minimumStartTime && minimumStartTime > nextStartTime
      ? minimumStartTime
      : nextStartTime;
  }, [minimumStartTime, startTime]);

  useEffect(() => {
    if (isOpen) reset(createDefaultValues());
  }, [isOpen, reset]);

  const fieldOrder: (keyof PreApprovedVisitorFormValues)[] = [
    "visitor_name",
    "mobile",
    "visitor_type",
    "visit_date",
    "start_time",
    "end_time",
    "number_of_visitors",
    "vehicle_number",
    "purpose",
  ];
  const activeErrorKey = fieldOrder.find((field) => errors[field]);
  const getFieldError = (field: keyof PreApprovedVisitorFormValues) =>
    activeErrorKey === field ? errors[field]?.message : undefined;

  const onSubmit = async (values: PreApprovedVisitorFormValues) => {
    if (!values.number_of_visitors) return;

    try {
      const payload: CreatePreApprovedVisitorPayload = {
        ...values,
        number_of_visitors: values.number_of_visitors,
        visitor_name: values.visitor_name.trim(),
        mobile: values.mobile.trim(),
        vehicle_number: values.vehicle_number?.trim() || undefined,
        purpose: values.purpose?.trim() || undefined,
      };
      const result = await createVisitor(payload).unwrap();
      const createdVisitor: PreApprovedVisitor = {
        ...payload,
        id: result.id,
        pass_code: result.pass_code,
        otp: result.otp,
        vehicle_number: payload.vehicle_number || null,
        purpose: payload.purpose || null,
        status: "Active",
      };

      toast.success("Pre-approved visitor created successfully");
      onClose();
      onCreated(createdVisitor);
    } catch (error: any) {
      toast.error(
        error?.data?.detail || error?.data || error?.message || "Failed to create pre-approved visitor",
      );
    }
  };

  const disabled = isLoading || isSubmitting;

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit(onSubmit)}
      title="Pre-Approve Visitor"
      subtitle="Create an advance visitor entry for faster gate verification."
      icon={<CalendarCheck size={18} className="text-slate-800" />}
      size="2xl"
      submitText="Pre-Approve Visitor"
      loadingText="Pre-Approving Visitor..."
      isSubmitting={disabled}
      contentClassName="space-y-4"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <FormField label="Visitor Name" required error={getFieldError("visitor_name")}>
            <Input
              placeholder="Enter visitor's full name"
              leftIcon={<UserRound size={15} />}
              maxLength={150}
              disabled={disabled}
              {...register("visitor_name")}
            />
          </FormField>
        </div>

        <FormField label="Mobile Number" required error={getFieldError("mobile")}>
          <Controller
            name="mobile"
            control={control}
            render={({ field }) => (
              <Input
                type="tel"
                inputMode="numeric"
                placeholder="10-digit mobile number"
                leftIcon={<Phone size={15} />}
                maxLength={10}
                value={field.value}
                onBlur={field.onBlur}
                onChange={(event) =>
                  field.onChange(event.target.value.replace(/\D/g, "").slice(0, 10))
                }
                disabled={disabled}
              />
            )}
          />
        </FormField>

        <FormField label="Visitor Type" required error={getFieldError("visitor_type")}>
          <Controller
            name="visitor_type"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value}
                options={VISITOR_TYPE_OPTIONS}
                placeholder="Select visitor type"
                onValueChange={(value) => {
                  field.onChange(value);
                  field.onBlur();
                }}
                disabled={disabled}
                error={Boolean(getFieldError("visitor_type"))}
              />
            )}
          />
        </FormField>

        <FormField label="Visit Date" required error={getFieldError("visit_date")}>
          <Controller
            name="visit_date"
            control={control}
            render={({ field }) => (
              <DatePicker
                value={field.value}
                minDate={todayValue()}
                placeholder="Select visit date"
                onChange={(value) => {
                  field.onChange(value);
                  field.onBlur();
                }}
                disabled={disabled}
                error={Boolean(getFieldError("visit_date"))}
              />
            )}
          />
        </FormField>

        <FormField
          label="Number of Visitors"
          required
          error={getFieldError("number_of_visitors")}
        >
          <Controller
            name="number_of_visitors"
            control={control}
            render={({ field }) => (
              <Input
                type="text"
                inputMode="numeric"
                leftIcon={<UsersRound size={15} />}
                value={field.value}
                onBlur={field.onBlur}
                onChange={(event) => {
                  const digits = event.target.value.replace(/\D/g, "").slice(0, 2);
                  field.onChange(digits ? Number(digits) : 0);
                }}
                disabled={disabled}
              />
            )}
          />
        </FormField>

        <FormField label="Start Time" required error={getFieldError("start_time")}>
          <Controller
            name="start_time"
            control={control}
            render={({ field }) => (
              <TimePicker
                value={field.value}
                onChange={(value) => {
                  field.onChange(value);
                  field.onBlur();
                }}
                minuteStep={5}
                minTime={minimumStartTime}
                placeholder="Select start time"
                disabled={disabled}
                error={Boolean(getFieldError("start_time"))}
              />
            )}
          />
        </FormField>

        <FormField label="End Time" required error={getFieldError("end_time")}>
          <Controller
            name="end_time"
            control={control}
            render={({ field }) => (
              <TimePicker
                value={field.value}
                onChange={(value) => {
                  field.onChange(value);
                  field.onBlur();
                }}
                minuteStep={5}
                minTime={minimumEndTime}
                placeholder="Select end time"
                disabled={disabled}
                error={Boolean(getFieldError("end_time"))}
              />
            )}
          />
        </FormField>

        <FormField label="Vehicle Number" error={getFieldError("vehicle_number")}>
          <Input
            placeholder="Optional vehicle number"
            maxLength={50}
            disabled={disabled}
            {...register("vehicle_number")}
          />
        </FormField>

        <FormField label="Purpose of Visit" error={getFieldError("purpose")}>
          <Input
            placeholder="Optional purpose"
            maxLength={255}
            disabled={disabled}
            {...register("purpose")}
          />
        </FormField>
      </div>
    </FormModal>
  );
};

export default PreApprovedVisitorFormModal;
