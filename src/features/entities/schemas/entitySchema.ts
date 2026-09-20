import { z } from "zod";

export const entitySchema = z.object({
  name: z
    .string({ required_error: "Entity name is required" })
    .trim()
    .min(1, "Entity name is required")
    .max(150, "Entity name cannot exceed 150 characters"),
  entity_type_id: z
    .string({ required_error: "Please select an entity type" })
    .min(1, "Please select an entity type"),
  association_id: z
    .string()
    .trim()
    .max(100, "Association identifier cannot exceed 100 characters")
    .optional()
    .or(z.literal("")),
  description: z
    .string()
    .trim()
    .max(500, "Description cannot exceed 500 characters")
    .optional()
    .or(z.literal("")),
});

export type EntityFormData = z.infer<typeof entitySchema>;
