import { z } from "zod";

export const documentSchema = z
  .object({
    association_id: z.string().trim().min(1, "Please select an association"),
    title: z
      .string()
      .trim()
      .min(1, "Document title is required")
      .max(100, "Document title cannot exceed 100 characters"),
    document_number: z.string().trim().max(100, "Document number cannot exceed 100 characters").optional(),
    document_type: z.number().optional(),
    category: z.number().optional(),
    file_name: z.string().optional(),
    file_url: z.string().trim().min(1, "Please upload a document"),
    file_type: z.string().optional(),
    file_size_kb: z.number().nullable().optional(),
    department: z.string().trim().max(100, "Department cannot exceed 100 characters").optional(),
    related_module: z.number().optional(),
    visibility: z.array(z.number()).min(1, "Select at least one visibility option"),
    allow_download: z.boolean(),
    issue_date: z.string().optional(),
    expiry_date: z.string().optional(),
    reminder_before_expiry_days: z.number().nullable().optional(),
    status: z.number(),
    keywords: z.string().trim().max(300, "Keywords cannot exceed 300 characters").optional(),
    remarks: z.string().trim().max(1000, "Remarks cannot exceed 1000 characters").optional(),
  })
  .refine((data) => !data.issue_date || !data.expiry_date || data.expiry_date >= data.issue_date, {
    message: "Expiry date cannot be before issue date",
    path: ["expiry_date"],
  });

export type DocumentFormValues = z.infer<typeof documentSchema>;
