import React, { useEffect } from "react";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { FormField, FormModal } from "@/components/common";
import { Input } from "@/components/ui/input";
import { useAppForm } from "@/hooks/useAppForm";
import { formatApiErrorDetail } from "@/services/api/apiClient";
import { DEFAULT_EMAIL_TEMPLATE_CONTEXT } from "../constants";
import {
  emailTemplateTestSchema,
  type EmailTemplateTestFormData,
} from "../schemas";
import type { EmailTemplate } from "../types";
import { useSendEmailTemplateTestMutation } from "../api";

interface EmailTemplateTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  template?: EmailTemplate | null;
}

export const EmailTemplateTestModal: React.FC<
  EmailTemplateTestModalProps
> = ({ isOpen, onClose, template }) => {
  const [sendTest, { isLoading }] = useSendEmailTemplateTestMutation();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useAppForm<EmailTemplateTestFormData>({
    schema: emailTemplateTestSchema,
    defaultValues: {
      test_email: "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({ test_email: "" });
    }
  }, [isOpen, reset]);

  if (!template) {
    return null;
  }

  const onSubmit = async (data: EmailTemplateTestFormData) => {
    try {
      const result = await sendTest({
        id: template.id,
        data: {
          test_email: data.test_email.trim(),
          sample_context: DEFAULT_EMAIL_TEMPLATE_CONTEXT,
        },
      }).unwrap();

      const providerText = result.provider
        ? " via " + result.provider
        : "";
      toast.success("Test email sent" + providerText);
      onClose();
    } catch (error: any) {
      toast.error(
        formatApiErrorDetail(
          error?.data || error?.message || "Failed to send test email",
        ),
      );
    }
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title="Send Test Email"
      description={
        "Send a sample rendering of “" +
        template.name +
        "”. This does not connect the template to an application event."
      }
      icon={<Send size={18} />}
      size="md"
      onSubmit={handleSubmit(onSubmit)}
      isSubmitting={isLoading}
      submitText="Send Test"
      loadingText="Sending Test..."
    >
      <FormField
        label="Recipient Email"
        required
        error={errors.test_email?.message}
      >
        <Input
          type="email"
          placeholder="name@example.com"
          disabled={isLoading}
          autoFocus
          {...register("test_email")}
        />
      </FormField>
    </FormModal>
  );
};

export default EmailTemplateTestModal;
