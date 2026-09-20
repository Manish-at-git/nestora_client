import { z } from "zod";
export { EDUCATION_LEVELS } from "@/lib/staticData";

export const educationSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  education_level: z.string().min(1, "Please select education level"),
  degree: z.string().min(2, "Degree name must be at least 2 characters"),
  field_of_study: z.string().optional().default(""),
  institution: z.string().min(2, "Institution name must be at least 2 characters"),
  board_university: z.string().optional().default(""),
  start_date: z.string().optional().default(""),
  end_date: z.string().optional().default(""),
  currently_studying: z.boolean().default(false),
  grade: z.string().optional().default(""),
  location: z.string().optional().default(""),
  description: z.string().optional().default(""),
  certificate_url: z.string().optional().nullable().default(""),
});

export type EducationFormValues = z.infer<typeof educationSchema>;
