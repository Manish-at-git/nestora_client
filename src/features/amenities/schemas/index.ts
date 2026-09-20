import { z } from "zod";

export const amenitySchema = z.object({
  association_id: z
    .string({ required_error: "Please select an association" })
    .min(1, "Please select an association"),
  name: z
    .string({ required_error: "Amenity name is required" })
    .trim()
    .min(1, "Amenity name is required")
    .min(2, "Amenity name must be at least 2 characters"),
  charges: z.coerce
    .number({ invalid_type_error: "Hourly rate must be a valid number" })
    .min(0, "Hourly rate cannot be negative"),
  status: z.boolean().default(true),
});

export type AmenityFormData = z.infer<typeof amenitySchema>;
