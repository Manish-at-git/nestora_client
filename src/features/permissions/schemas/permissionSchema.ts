import { z } from "zod";

export const permissionSchema = z.object({
  role_id: z.string().min(1, "Please select a role"),
  feature_id: z.string().min(1, "Please select a feature module"),
  can_create: z.boolean().default(false),
  can_view: z.boolean().default(true),
  can_update: z.boolean().default(false),
  can_delete: z.boolean().default(false),
});

export type PermissionFormData = z.infer<typeof permissionSchema>;
