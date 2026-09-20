import { z } from "zod";

const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

const todayValue = () => {
  const now = new Date();
  const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
  return localDate.toISOString().slice(0, 10);
};

export const preApprovedVisitorSchema = z
  .object({
    visitor_name: z
      .string()
      .trim()
      .min(2, "Visitor name must contain at least 2 characters")
      .max(150, "Visitor name cannot exceed 150 characters"),
    mobile: z
      .string()
      .trim()
      .regex(/^\d{10}$/, "Enter a valid 10-digit mobile number"),
    visitor_type: z.string().trim().min(1, "Please select a visitor type"),
    visit_date: z
      .string()
      .min(1, "Visit date is required")
      .refine((value) => value >= todayValue(), "Visit date cannot be in the past"),
    start_time: z
      .string()
      .regex(timePattern, "Please select a valid start time"),
    end_time: z
      .string()
      .regex(timePattern, "Please select a valid end time"),
    number_of_visitors: z
      .number()
      .int("Number of visitors must be a whole number")
      .min(1, "At least one visitor is required")
      .max(50, "Number of visitors cannot exceed 50"),
    vehicle_number: z
      .string()
      .trim()
      .max(50, "Vehicle number cannot exceed 50 characters")
      .optional(),
    purpose: z
      .string()
      .trim()
      .max(255, "Purpose cannot exceed 255 characters")
      .optional(),
    pass_type: z.string().default("Single Entry"),
  })
  .superRefine((values, context) => {
    if (values.start_time >= values.end_time) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["end_time"],
        message: "End time must be later than start time",
      });
    }
  });

export interface PreApprovedVisitorFormValues {
  visitor_name: string;
  mobile: string;
  visitor_type: string;
  visit_date: string;
  start_time: string;
  end_time: string;
  number_of_visitors: number;
  vehicle_number?: string;
  purpose?: string;
  pass_type: string;
}
