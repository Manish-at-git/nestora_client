import { z } from "zod";

export const assignedMemberSchema = z
  .object({
    user_id: z.string().min(1, "User ID is required"),
    name: z.string().optional(),
    email: z.string().optional(),
    profile_pic_url: z.string().nullable().optional(),
    start_date: z.string().optional().or(z.literal("")),
    end_date: z.string().optional().or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    if (data.start_date && data.end_date) {
      const start = new Date(data.start_date);
      const end = new Date(data.end_date);
      if (end < start) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["end_date"],
          message: "Role end date cannot be earlier than role start date",
        });
      }
    }
  });

export const committeeSchema = z
  .object({
    association_id: z
      .string({ required_error: "Target association is required" })
      .trim()
      .min(1, "Target association is required"),
    name: z
      .string({ required_error: "Committee name is required" })
      .trim()
      .min(1, "Committee name is required")
      .max(150, "Committee name cannot exceed 150 characters"),
    description: z
      .string()
      .trim()
      .max(5000, "Description cannot exceed 5000 characters")
      .optional()
      .or(z.literal("")),
    start_date: z.string().optional().or(z.literal("")),
    end_date: z.string().optional().or(z.literal("")),
    members: z.array(assignedMemberSchema).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.start_date && data.end_date) {
      const start = new Date(data.start_date);
      const end = new Date(data.end_date);
      if (end < start) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["end_date"],
          message: "End date cannot be earlier than start date",
        });
      }
    }
  });

export type CommitteeFormData = z.infer<typeof committeeSchema>;
