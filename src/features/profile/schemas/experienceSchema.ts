import { z } from "zod";
export { EMPLOYMENT_TYPES, WORK_MODES } from "@/lib/staticData";

export const experienceSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  job_title: z.string().min(2, "Job title must be at least 2 characters"),
  employment_type: z.string().min(1, "Please select employment type"),
  company: z.string().min(2, "Company name must be at least 2 characters"),
  industry: z.string().optional().default(""),
  location: z.string().optional().default(""),
  work_mode: z.string().optional().default(""),
  start_date: z.string().min(1, "Please select start date"),
  end_date: z.string().optional().default(""),
  currently_working: z.boolean().default(false),
  description: z.string().optional().default(""),
  skills: z.string().optional().default(""),
  website_url: z.string().optional().default(""),
  certificate_url: z.string().optional().nullable().default(""),
});

export type ExperienceFormValues = z.infer<typeof experienceSchema>;
