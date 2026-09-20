import { z } from "zod";

export const serviceRequestSchema = z
  .object({
    association_id: z.string().optional().or(z.literal("")),
    block_id: z.string().optional().or(z.literal("")),
    unit_id: z.string().optional().or(z.literal("")),
    user_id: z.string().optional().or(z.literal("")),
    incoming_call_no: z
      .string()
      .trim()
      .max(25, "Phone number cannot exceed 25 characters")
      .optional()
      .or(z.literal("")),
    service_type: z
      .string({ required_error: "Please select a service type" })
      .min(1, "Please select a service type"),
    sub_category: z.string().optional().or(z.literal("")),
    custom_title: z
      .string()
      .trim()
      .max(120, "Title cannot exceed 120 characters")
      .optional()
      .or(z.literal("")),
    description: z
      .string()
      .trim()
      .max(5000, "Description cannot exceed 5000 characters")
      .optional()
      .or(z.literal("")),
    image_url: z.string().optional().or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    const isOther =
      data.service_type === "Other" || data.sub_category === "Other Option";
    if (isOther && (!data.custom_title || !data.custom_title.trim())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["custom_title"],
        message: "Please enter a title for this service request",
      });
    }
  });

export type ServiceRequestFormData = z.infer<typeof serviceRequestSchema>;

export const serviceRequestMappingSchema = z.object({
  association_id: z
    .string({ required_error: "Please select an association" })
    .min(1, "Please select an association"),
  unit_id: z
    .string({ required_error: "Please select a unit" })
    .min(1, "Please select a unit"),
  user_id: z
    .string({ required_error: "Please select a resident" })
    .min(1, "Please select a resident"),
});

export type ServiceRequestMappingFormData = z.infer<typeof serviceRequestMappingSchema>;
