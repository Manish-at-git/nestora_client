import { z } from "zod";

export const entityTypeSchema = z.object({
  name: z
    .string({ required_error: "Entity type name is required" })
    .trim()
    .min(1, "Entity type name is required")
    .max(100, "Entity type name cannot exceed 100 characters"),
  description: z
    .string()
    .trim()
    .max(500, "Description cannot exceed 500 characters")
    .optional()
    .or(z.literal("")),
});

export type EntityTypeFormData = z.infer<typeof entityTypeSchema>;
