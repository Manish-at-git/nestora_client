import { z } from "zod";

const optionalText = z
  .string()
  .trim()
  .optional()
  .transform((value) => value || "");

export const nearbyPlaceSchema = z.object({
  name: z.string().trim().min(1, "Place name is required").max(255),
  category: z.string().min(1, "Category is required"),
  distance: z.string().trim().min(1, "Distance is required").max(100),
  rating: z.coerce
    .number()
    .min(1, "Rating must be at least 1")
    .max(5, "Rating cannot exceed 5"),
  reviews: z.coerce.number().int().min(0, "Reviews cannot be negative"),
  status: z.string().trim().min(1, "Operating status is required").max(100),
  address: z.string().trim().min(1, "Address is required").max(5000),
  phone: optionalText,
  image: optionalText,
  tags: optionalText,
  website: optionalText,
  is_active: z.boolean(),
});

export type NearbyPlaceFormData = z.infer<typeof nearbyPlaceSchema>;
