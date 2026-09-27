import { z } from "zod";
import { CUSTOM_EVENT_TYPE } from "../constants";

const requiredText = (label: string, maximum: number) =>
  z
    .string()
    .trim()
    .min(1, label + " is required")
    .max(maximum, label + " must be " + maximum + " characters or fewer");

export const emailTemplateSchema = z
  .object({
    name: requiredText("Template name", 150),
    event_type: requiredText("Event trigger", 100),
    custom_event_type: z.string().trim().max(100).optional(),
    content_source: z.enum(["template", "html_file"]),
    subject: requiredText("Subject line", 255),
    body: z.string().trim().max(65535, "Template body must be 65535 characters or fewer"),
    html_content: z
      .string()
      .trim()
      .max(65535, "HTML file content must be 65535 characters or fewer"),
    is_active: z.boolean(),
  })
  .superRefine((data, context) => {
    if (data.content_source === "template" && !data.body) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["body"],
        message: "Enter a template message body",
      });
    }

    if (data.content_source === "html_file" && !data.html_content) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["html_content"],
        message: "Upload an HTML file",
      });
    }

    if (data.event_type !== CUSTOM_EVENT_TYPE) {
      return;
    }

    const customEventType = data.custom_event_type?.trim() || "";
    if (!customEventType) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["custom_event_type"],
        message: "Custom event key is required",
      });
      return;
    }

    if (!/^[a-z][a-z0-9_]*$/.test(customEventType)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["custom_event_type"],
        message:
          "Use lowercase letters, numbers, and underscores, starting with a letter",
      });
    }
  });

export const emailTemplateTestSchema = z.object({
  test_email: z
    .string()
    .trim()
    .min(1, "Recipient email is required")
    .email("Enter a valid recipient email"),
});

export type EmailTemplateFormData = z.infer<typeof emailTemplateSchema>;
export type EmailTemplateTestFormData = z.infer<typeof emailTemplateTestSchema>;
