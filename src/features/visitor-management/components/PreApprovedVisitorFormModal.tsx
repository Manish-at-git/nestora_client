import React, { useEffect } from "react";
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
import {
  DEFAULT_END_TIME,
  DEFAULT_START_TIME,
  VISITOR_TYPE_OPTIONS,
} from "../constants";
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
  visit_date: todayValue(),
  start_time: DEFAULT_START_TIME,
  end_time: DEFAULT_END_TIME,
  number_of_visitors: 1,
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
    formState: { errors, isSubmitting },
  } = useAppForm<PreApprovedVisitorFormValues>({
    schema: preApprovedVisitorSchema,
    defaultValues: createDefaultValues(),
  });

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
    try {
      const payload: CreatePreApprovedVisitorPayload = {
        ...values,
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

      toast.success("Visitor pass created successfully");
      onClose();
      onCreated(createdVisitor);
    } catch (error: any) {
      toast.error(
        error?.data?.detail || error?.data || error?.message || "Failed to create visitor pass",
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
      subtitle="Create an advance visitor pass for faster gate entry."
      icon={<CalendarCheck size={18} className="text-slate-800" />}
      size="2xl"
      submitText="Generate Pass"
      loadingText="Generating Pass..."
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
