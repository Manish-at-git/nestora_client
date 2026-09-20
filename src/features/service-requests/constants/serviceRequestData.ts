/**
 * Static Data & Constants for Service Requests Module
 * All keys use normalized lowercase_underscore format for safe, consistent comparisons.
 * Backend API string mappings are maintained cleanly in dictionaries.
 */

export const SERVICE_STATUS_KEYS = [
  "new",
  "in_progress",
  "completed",
  "cancelled",
] as const;

export type ServiceStatusKey = (typeof SERVICE_STATUS_KEYS)[number];

/**
 * Normalizes any backend or legacy status string into a clean lowercase_underscore key.
 */
export const normalizeServiceStatus = (
  rawStatus?: string | null
): ServiceStatusKey => {
  if (!rawStatus) return "new";
  const clean = String(rawStatus).trim().toLowerCase().replace(/[\s-]+/g, "_");
  if (clean === "pending" || clean === "new") return "new";
  if (clean === "in_progress") return "in_progress";
  if (clean === "complete" || clean === "completed") return "completed";
  if (clean === "cancel" || clean === "cancelled") return "cancelled";
  return "new";
};

/**
 * Mapping from frontend normalized keys to the exact status string expected by backend API.
 */
export const STATUS_API_VALUES: Record<ServiceStatusKey, string> = {
  new: "New",
  in_progress: "In Progress",
  completed: "Complete",
  cancelled: "Cancel",
};

/**
 * Tabs configuration for page filtering
 */
export const SERVICE_STATUS_TABS = [
  { key: "all", label: "All Requests" },
  { key: "new", label: "New / Pending" },
  { key: "in_progress", label: "In Progress" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
] as const;

export type ServiceStatusTabKey = "all" | ServiceStatusKey;

/**
 * Status color & badge styling configuration keyed by normalized lowercase_underscore keys
 */
export const STATUS_BADGE_CONFIG: Record<
  ServiceStatusKey,
  {
    label: string;
    variant: "warning" | "info" | "success" | "destructive" | "default";
    bgClass: string;
    textClass: string;
    borderClass: string;
  }
> = {
  new: {
    label: "New",
    variant: "warning",
    bgClass: "bg-amber-50 dark:bg-amber-950/30",
    textClass: "text-amber-700 dark:text-amber-400",
    borderClass: "border-amber-200 dark:border-amber-800/40",
  },
  in_progress: {
    label: "In Progress",
    variant: "info",
    bgClass: "bg-sky-50 dark:bg-sky-950/30",
    textClass: "text-sky-700 dark:text-sky-400",
    borderClass: "border-sky-200 dark:border-sky-800/40",
  },
  completed: {
    label: "Completed",
    variant: "success",
    bgClass: "bg-emerald-50 dark:bg-emerald-950/30",
    textClass: "text-emerald-700 dark:text-emerald-400",
    borderClass: "border-emerald-200 dark:border-emerald-800/40",
  },
  cancelled: {
    label: "Cancelled",
    variant: "destructive",
    bgClass: "bg-rose-50 dark:bg-rose-950/30",
    textClass: "text-rose-700 dark:text-rose-400",
    borderClass: "border-rose-200 dark:border-rose-800/40",
  },
};

/**
 * Service Types with lowercase_underscore keys
 */
export const SERVICE_TYPE_KEYS = [
  "plumbing",
  "cleaning",
  "electric",
  "other",
] as const;

export type ServiceTypeKey = (typeof SERVICE_TYPE_KEYS)[number];

export const SERVICE_TYPE_OPTIONS: Array<{
  value: ServiceTypeKey;
  label: string;
  apiValue: string;
}> = [
  { value: "plumbing", label: "Plumbing", apiValue: "Plumbing" },
  { value: "cleaning", label: "Cleaning", apiValue: "Cleaning" },
  { value: "electric", label: "Electric Component", apiValue: "Electric" },
  { value: "other", label: "Other", apiValue: "Other" },
];

export const SERVICE_CATEGORIES: Record<ServiceTypeKey, string[]> = {
  plumbing: [
    "Repair & Leak Detection",
    "Drain Cleaning & Unclogging",
    "Fixture Installation",
    "Other Option",
  ],
  cleaning: [
    "Deep Cleaning",
    "Carpet Cleaning",
    "Other Option",
  ],
  electric: [
    "Wiring Repair",
    "Fixture Install",
    "Appliance Fix",
    "Other Option",
  ],
  other: [],
};

export const normalizeServiceType = (rawType?: string | null): ServiceTypeKey => {
  if (!rawType) return "other";
  const clean = String(rawType).trim().toLowerCase();
  if (clean.includes("plumb")) return "plumbing";
  if (clean.includes("clean")) return "cleaning";
  if (clean.includes("electr")) return "electric";
  return "other";
};

export const SERVICE_PRIORITY_KEYS = [
  "low",
  "medium",
  "high",
  "urgent",
] as const;

export type ServicePriorityKey = (typeof SERVICE_PRIORITY_KEYS)[number];
