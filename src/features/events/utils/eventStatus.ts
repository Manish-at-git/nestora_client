import type { EventItem } from "../types";

export const isEventCompleted = (event: Pick<EventItem, "ends_at">): boolean => {
  if (!event.ends_at) return false;

  const endTime = new Date(event.ends_at).getTime();
  return Number.isFinite(endTime) && endTime <= Date.now();
};
