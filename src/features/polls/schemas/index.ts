import { z } from "zod";

export const pollSchema = z
  .object({
    association_id: z.union([
      z.string().min(1, "Please select an association."),
      z.number(),
    ]),
    question: z
      .string()
      .trim()
      .min(3, "Poll question must be at least 3 characters.")
      .max(300, "Poll question cannot exceed 300 characters."),
    description: z
      .string()
      .trim()
      .max(2000, "Description cannot exceed 2000 characters.")
      .optional(),
    options: z
      .array(z.string().trim())
      .min(2, "Please provide at least 2 options.")
      .refine(
        (opts) => opts.filter((o) => o.length > 0).length >= 2,
        {
          message: "Please provide at least 2 non-empty options.",
        }
      ),
    is_multiple_choice: z.boolean().default(false),
    visibility: z.string().min(1, "Please select poll visibility."),
    end_date: z.string().optional(),
    status: z.string().default("Published"),
  })
  .refine(
    (data) => {
      if (data.end_date) {
        const endDate = new Date(data.end_date);
        const now = new Date(Date.now() - 60000); // 1-minute grace margin
        return endDate >= now;
      }
      return true;
    },
    {
      message: "End date & time must be today or a future date/time.",
      path: ["end_date"],
    }
  );

export type PollFormValues = z.infer<typeof pollSchema>;
