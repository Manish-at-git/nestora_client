import { z } from "zod";

export const meetingMinutesSchema = z.object({
  discussed_topic: z
    .string({ required_error: "Discussed topic is required" })
    .trim()
    .min(1, "Discussed topic is required")
    .max(200, "Discussed topic cannot exceed 200 characters"),
  meeting_minutes: z
    .string({ required_error: "Meeting minutes are required" })
    .trim()
    .min(1, "Meeting minutes are required")
    .max(10000, "Meeting minutes cannot exceed 10,000 characters"),
});

export type MeetingMinutesFormData = z.infer<typeof meetingMinutesSchema>;
