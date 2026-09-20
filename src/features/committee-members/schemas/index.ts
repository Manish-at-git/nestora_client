import { z } from "zod";

export const committeeMemberSchema = z
  .object({
    association_id: z
      .string()
      .min(1, "Please select an association"),
    committee_id: z
      .string()
      .min(1, "Please select a committee"),
    user_id: z
      .string()
      .min(1, "Please select a homeowner candidate"),
    start_date: z
      .string()
      .min(1, "Term start date is required"),
    end_date: z
      .string()
      .min(1, "Term end date is required"),
  })
  .refine(
    (data) => {
      if (!data.start_date || !data.end_date) return true;
      return new Date(data.end_date) >= new Date(data.start_date);
    },
    {
      message: "Term end date cannot be before start date",
      path: ["end_date"],
    }
  );

export type CommitteeMemberFormValues = z.infer<typeof committeeMemberSchema>;
