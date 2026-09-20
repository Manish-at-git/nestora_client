import { z } from "zod";

export const featureSchema = z.object({
  name: z
    .string()
    .min(1, "Feature name is required")
    .max(100, "Feature name cannot exceed 100 characters"),
  code: z
    .string()
    .min(1, "Feature code is required")
    .max(100, "Feature code cannot exceed 100 characters")
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Code can only contain letters, numbers, underscores (_), and hyphens (-)"
    ),
  description: z
    .string()
    .max(500, "Description cannot exceed 500 characters")
    .optional()
    .or(z.literal("")),
  parent_id: z
    .string()
    .optional()
    .or(z.literal("")),
  url: z
    .string()
    .max(255, "Route path cannot exceed 255 characters")
    .optional()
    .or(z.literal("")),
  icon: z
    .string()
    .optional()
    .or(z.literal("")),
  is_active: z
    .boolean()
    .default(true),
});

export type FeatureFormData = z.infer<typeof featureSchema>;
