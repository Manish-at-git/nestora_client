import { z } from "zod";
export { PET_TYPES, DOG_BREEDS, CAT_BREEDS } from "@/lib/staticData";

export const petSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  type: z.string().min(1, "Please select pet type"),
  name: z
    .string()
    .min(1, "Pet name is required")
    .max(50, "Name cannot exceed 50 characters")
    .transform((val) => val.trim()),
  breed: z.string().optional().nullable().default(""),
  vaccinated: z.boolean().default(false),
  vaccination_date: z.string().optional().nullable().default(""),
  next_vaccination_reminder: z.boolean().default(false),
  reminder_date: z.string().optional().nullable().default(""),
  vaccination_certificate_url: z.string().optional().nullable().default(""),
});

export type PetFormValues = z.infer<typeof petSchema>;

