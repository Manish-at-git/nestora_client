import { z } from "zod";

export const eventSchema = z
  .object({
    association_id: z.union([z.string(), z.number()]).optional(),
    title: z
      .string()
      .trim()
      .min(2, "Event name must be at least 2 characters.")
      .max(200, "Event name cannot exceed 200 characters."),
    category: z.string().min(1, "Please select an event category."),
    description: z
      .string()
      .trim()
      .max(3000, "Description cannot exceed 3000 characters.")
      .optional(),
    banner_url: z.string().optional(),
    starts_at: z
      .string()
      .min(1, "Please select an event start date and time."),
    ends_at: z.string().optional(),
    location: z
      .string()
      .trim()
      .max(200, "Venue name cannot exceed 200 characters.")
      .optional(),
    is_registration_required: z.boolean().default(false),
    registration_deadline: z.string().optional(),
    max_capacity: z.coerce.number().min(0).max(100000).optional(),
    audience: z.string().min(1, "Please select event visibility."),
    send_notifications: z.boolean().default(false),
    is_paid: z.boolean().default(false),
    fee_amount: z.coerce.number().min(0, "Fee amount must be greater than or equal to 0.").optional(),
    organizer_name: z.string().trim().max(100).optional(),
    organizer_contact: z.string().trim().max(50).optional(),
    status: z.string().default("Published"),
  })
  .refine(
    (data) => {
      if (data.starts_at && data.ends_at) {
        return new Date(data.ends_at) >= new Date(data.starts_at);
      }
      return true;
    },
    {
      message: "End date & time cannot be earlier than start date & time.",
      path: ["ends_at"],
    }
  )
  .refine(
    (data) => {
      if (data.is_registration_required && data.registration_deadline) {
        const deadline = new Date(data.registration_deadline);
        const now = new Date(Date.now() - 60000);
        return deadline >= now;
      }
      return true;
    },
    {
      message: "Registration deadline must be today or a future date.",
      path: ["registration_deadline"],
    }
  )
  .refine(
    (data) => {
      if (data.is_registration_required && data.registration_deadline && data.starts_at) {
        return new Date(data.registration_deadline) <= new Date(data.starts_at);
      }
      return true;
    },
    {
      message: "Registration deadline cannot be after event start date & time.",
      path: ["registration_deadline"],
    }
  )
  .refine(
    (data) => {
      if (data.is_paid && (data.fee_amount === undefined || data.fee_amount === null || isNaN(data.fee_amount) || data.fee_amount <= 0)) {
        return false;
      }
      return true;
    },
    {
      message: "Please enter a valid registration fee amount.",
      path: ["fee_amount"],
    }
  );

export type EventFormValues = z.infer<typeof eventSchema>;
