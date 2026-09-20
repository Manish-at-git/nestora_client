import { z } from "zod";
export { VEHICLE_TYPES } from "@/lib/staticData";

export const vehicleSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  type: z.string().min(1, "Please select vehicle type"),
  registration_number: z
    .string()
    .min(3, "Registration number must be at least 3 characters")
    .max(20, "Registration number cannot exceed 20 characters")
    .regex(/^[A-Za-z0-9\s-]+$/, "Only letters, numbers, hyphens, and spaces are allowed")
    .transform((val) => val.trim().toUpperCase()),
  insurance_url: z.string().optional().nullable().default(""),
  puc_url: z.string().optional().nullable().default(""),
});

export type VehicleFormValues = z.infer<typeof vehicleSchema>;

