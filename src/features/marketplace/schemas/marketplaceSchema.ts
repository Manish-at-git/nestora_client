import { z } from "zod";

export const marketplaceSchema = z.object({
  title: z
    .string({ required_error: "Title is required" })
    .trim()
    .min(2, "Title must be at least 2 characters")
    .max(255, "Title cannot exceed 255 characters"),
  listing_type: z
    .string({ required_error: "Listing type is required" })
    .min(1, "Listing type is required"),
  category_id: z
    .string({ required_error: "Category is required" })
    .min(1, "Please select a category"),
  price: z.preprocess(
    (val) => (val === "" || val === undefined || val === null ? "" : Number(val)),
    z
      .number({ required_error: "Price is required", invalid_type_error: "Price must be a valid number" })
      .min(0, "Price cannot be negative")
  ),
  condition_state: z
    .string({ required_error: "Condition is required" })
    .min(1, "Condition is required"),
  brand: z
    .string()
    .trim()
    .max(100, "Brand cannot exceed 100 characters")
    .optional()
    .or(z.literal("")),
  item_age: z
    .string()
    .trim()
    .max(50, "Item age cannot exceed 50 characters")
    .optional()
    .or(z.literal("")),
  location: z
    .string({ required_error: "Location (Tower/Block) is required" })
    .trim()
    .min(1, "Location is required")
    .max(100, "Location cannot exceed 100 characters"),
  contact_number: z
    .string({ required_error: "Contact number is required" })
    .trim()
    .min(10, "Contact number must be at least 10 digits")
    .regex(/^\+?[0-9\s\-()]{10,20}$/, "Please enter a valid phone number (10-20 digits)"),
  is_negotiable: z.boolean().default(false),
  description: z
    .string()
    .trim()
    .max(5000, "Description cannot exceed 5000 characters")
    .optional()
    .or(z.literal("")),
  status: z
    .string()
    .min(1, "Status is required")
    .default("Active"),
  images: z.array(z.string()).default([]),
});

export type MarketplaceFormData = z.infer<typeof marketplaceSchema>;
