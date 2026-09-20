import { z } from "zod";

export const boardMemberSchema = z
  .object({
    association_id: z
      .string()
      .min(1, "Please select an association"),
    account_id: z
      .string()
      .min(1, "Please select a homeowner to nominate"),
    term_start_date: z
      .string()
      .min(1, "Term start date is required"),
    term_end_date: z
      .string()
      .min(1, "Term end date is required"),
  })
  .refine(
    (data) => {
      if (!data.term_start_date || !data.term_end_date) return true;
      return new Date(data.term_end_date) >= new Date(data.term_start_date);
    },
    {
      message: "Term end date cannot be before start date",
      path: ["term_end_date"],
    }
  );

export type BoardMemberFormValues = z.infer<typeof boardMemberSchema>;
