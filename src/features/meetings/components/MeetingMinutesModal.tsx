import React, { useEffect } from "react";
import { toast } from "sonner";
import { FileText } from "lucide-react";
import { FormModal } from "@/components/common/FormModal";
import { FormField } from "@/components/common/FormField";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAppForm } from "@/hooks/useAppForm";
import { useAddMeetingMinutesMutation } from "../api/meetingsApi";
import {
  meetingMinutesSchema,
  type MeetingMinutesFormData,
} from "../schemas";
import type { Meeting } from "../types";

export interface MeetingMinutesModalProps {
  isOpen: boolean;
  onClose: () => void;
  meeting?: Meeting | null;
  onSuccess?: () => void;
}

export const MeetingMinutesModal: React.FC<MeetingMinutesModalProps> = ({
  isOpen,
  onClose,
  meeting,
  onSuccess,
}) => {
  const [addMeetingMinutes, { isLoading: isSubmitting }] =
    useAddMeetingMinutesMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useAppForm<MeetingMinutesFormData>({
    schema: meetingMinutesSchema,
    defaultValues: {
      discussed_topic: "",
      meeting_minutes: "",
    },
  });

  useEffect(() => {
    if (meeting && isOpen) {
      reset({
        discussed_topic: meeting.discussed_topic || "",
        meeting_minutes: meeting.meeting_minutes || "",
      });
    } else if (!isOpen) {
      reset({ discussed_topic: "", meeting_minutes: "" });
    }
  }, [meeting, isOpen, reset]);

  if (!meeting) return null;

  const onSubmit = async (data: MeetingMinutesFormData) => {
    try {
      await addMeetingMinutes({
        id: meeting.id,
        discussed_topic: data.discussed_topic.trim(),
        meeting_minutes: data.meeting_minutes.trim(),
      }).unwrap();
      toast.success("Meeting minutes recorded successfully");
      onSuccess?.();
      onClose();
    } catch (err: any) {
      toast.error(
        err.data?.detail || err.message || "Failed to record meeting minutes"
      );
    }
  };

  const fieldOrder: (keyof MeetingMinutesFormData)[] = [
    "discussed_topic",
    "meeting_minutes",
  ];
  const activeErrorKey = fieldOrder.find((key) => errors[key]);
  const getFieldError = (key: keyof MeetingMinutesFormData) =>
    activeErrorKey === key ? errors[key]?.message : undefined;

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Meeting Minutes"
      description={`Document discussed resolutions, key outcomes, and minutes for: "${meeting.title}"`}
      icon={<FileText size={18} className="text-slate-800" />}
      size="lg"
      isSubmitting={isSubmitting}
      submitText="Save Minutes"
      loadingText="Recording Minutes..."
      submitVariant="default"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="space-y-4">
        <FormField
          label="Discussed Topic"
          required
          error={getFieldError("discussed_topic")}
        >
          <Input
            placeholder="e.g. Budget Allocation & Exterior Painting Vendor Approval"
            disabled={isSubmitting}
            autoFocus
            maxLength={200}
            {...register("discussed_topic")}
          />
        </FormField>

        <FormField
          label="Meeting Minutes & Resolutions"
          required
          error={getFieldError("meeting_minutes")}
        >
          <Textarea
            placeholder="Record comprehensive discussion points, votes taken, unanimous resolutions, and follow-up assignments..."
            rows={7}
            disabled={isSubmitting}
            maxLength={10000}
            className="resize-none text-xs"
            {...register("meeting_minutes")}
          />
        </FormField>
      </div>
    </FormModal>
  );
};

export default MeetingMinutesModal;
