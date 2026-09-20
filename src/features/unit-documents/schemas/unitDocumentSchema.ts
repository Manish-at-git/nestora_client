import { z } from "zod";

export const unitDocumentSchema = z.object({
  association_id: z
    .string()
    .trim()
    .optional(),
  unit_id: z.string().optional(),
  name: z
    .string()
    .trim()
    .min(1, "Document name is required")
    .max(100, "Document name cannot exceed 100 characters"),
  type_id: z
    .number()
    .nullable()
    .refine((value) => value !== null, "Please select a document type"),
  description: z
    .string()
    .trim()
    .max(1000, "Description cannot exceed 1000 characters")
    .optional(),
  file_name: z.string().optional(),
  file_url: z.string().trim().min(1, "Please upload a document"),
  file_type: z.string().optional(),
  file_size_kb: z.number().nullable().optional(),
});

export type UnitDocumentFormValues = z.infer<typeof unitDocumentSchema>;
