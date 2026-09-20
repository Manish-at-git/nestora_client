import { z } from "zod";

export const MEETING_TYPES = [
  "Annual General Meeting (AGM)",
  "General Meeting",
  "Committee Meeting",
  "Budget Meeting",
  "Maintenance Meeting",
  "Emergency Meeting",
  "Vendor Meeting",
  "Resident Meeting",
] as const;

export const PRIORITIES = ["Low", "Medium", "High"] as const;

export const AUDIENCES = [
  "Board Members",
  "Committee Member",
  "Homeowner",
] as const;

export const DURATIONS = [
  "15 Mins",
  "30 Mins",
  "45 Mins",
  "1 Hour",
  "1.5 Hours",
  "2 Hours",
  "3 Hours",
] as const;

export const meetingSchema = z.object({
  title: z
    .string({ required_error: "Meeting title is required" })
    .trim()
    .min(1, "Meeting title is required")
    .max(100, "Title cannot exceed 100 characters"),
  meeting_type: z
    .string({ required_error: "Please select a meeting type" })
    .min(1, "Please select a meeting type"),
  priority: z
    .string({ required_error: "Please select a priority" })
    .min(1, "Please select a priority"),
  audience: z
    .string({ required_error: "Please select target audience" })
    .min(1, "Please select target audience"),
  agenda: z
    .string({ required_error: "Meeting agenda is required" })
    .trim()
    .min(1, "Meeting agenda is required")
    .max(100, "Agenda cannot exceed 100 characters"),
  description: z
    .string()
    .trim()
    .max(5000, "Description cannot exceed 5000 characters")
    .optional()
    .or(z.literal("")),
  meeting_date: z
    .string({ required_error: "Please select meeting date" })
    .min(1, "Please select meeting date"),
  meeting_time: z
    .string({ required_error: "Please select meeting time" })
    .min(1, "Please select meeting time"),
  duration: z
    .string({ required_error: "Please select duration" })
    .min(1, "Please select duration"),
  venue: z
    .string({ required_error: "Venue is required" })
    .trim()
    .min(1, "Venue is required")
    .max(100, "Venue cannot exceed 100 characters"),
  organizer: z
    .string({ required_error: "Meeting organizer is required" })
    .min(1, "Please select an organizer"),
  association_id: z
    .string({ required_error: "Please select an association" })
    .min(1, "Please select an association"),
  meeting_link: z
    .string()
    .trim()
    .url("Please enter a valid URL")
    .optional()
    .or(z.literal("")),
  attachment_url: z.string().optional().or(z.literal("")),
  target_block_id: z.string().optional().or(z.literal("")),
});

export type MeetingFormData = z.infer<typeof meetingSchema>;
