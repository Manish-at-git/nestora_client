import { z } from "zod";

export const roleSchema = z.object({
  name: z
    .string()
    .min(1, "Role name is required")
    .max(100, "Role name cannot exceed 100 characters"),
  code: z
    .string()
    .min(1, "Role code is required")
    .max(100, "Role code cannot exceed 100 characters")
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Code can only contain letters, numbers, underscores (_), and hyphens (-)"
    ),
  description: z
    .string()
    .max(500, "Description cannot exceed 500 characters")
    .optional()
    .or(z.literal("")),
  entity_id: z
    .string()
    .optional()
    .or(z.literal("")),
  is_active: z
    .boolean()
    .default(true),
});

export type RoleFormData = z.infer<typeof roleSchema>;
