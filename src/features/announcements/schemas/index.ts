import { z } from "zod";

export const announcementSchema = z.object({
  association_id: z.union([
    z.string().min(1, "Please select an association."),
    z.number(),
  ]),
  title: z
    .string()
    .trim()
    .min(2, "Headline / Title must be at least 2 characters.")
    .max(100, "Headline / Title cannot exceed 100 characters."),
  category: z
    .string()
    .min(1, "Please select a category."),
  audience: z
    .string()
    .min(1, "Please select a target audience."),
  body: z
    .string()
    .trim()
    .min(5, "Announcement details must be at least 5 characters.")
    .max(5000, "Announcement details cannot exceed 5000 characters."),
  attachment_url: z.string().optional(),
  pinned: z.boolean().default(false),
});

export type AnnouncementFormValues = z.infer<typeof announcementSchema>;
