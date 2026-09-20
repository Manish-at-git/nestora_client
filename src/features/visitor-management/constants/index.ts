export const VISITOR_TYPES = [
  "Family",
  "Friend",
  "Guest",
  "Technician",
  "Tutor",
  "Driver",
  "Others",
] as const;

export const VISITOR_TYPE_OPTIONS = VISITOR_TYPES.map((type) => ({
  value: type,
  label: type,
}));

export const DEFAULT_START_TIME = "09:00";
export const DEFAULT_END_TIME = "18:00";

export const STATUS_HEADER_CLASS: Record<string, string> = {
  Active: "bg-indigo-600",
  Used: "bg-amber-500",
  Expired: "bg-rose-500",
  Cancelled: "bg-rose-500",
};