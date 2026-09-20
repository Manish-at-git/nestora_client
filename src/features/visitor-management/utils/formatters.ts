export const formatVisitDate = (value?: string | null) => {
  if (!value) return "—";
  const datePart = String(value).slice(0, 10);
  const [year, month, day] = datePart.split("-").map(Number);
  if (!year || !month || !day) return String(value);
  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(year, month - 1, day));
};

export const normalizeTime = (value?: string | number | null) => {
  if (value === null || value === undefined || value === "") return "";
  if (typeof value === "number" || (!String(value).includes(":") && !Number.isNaN(Number(value)))) {
    const seconds = Number(value);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  }
  return String(value).trim().slice(0, 5);
};

export const formatVisitTime = (value?: string | number | null) => {
  const normalized = normalizeTime(value);
  if (!normalized) return "—";
  const [hourValue, minuteValue] = normalized.split(":").map(Number);
  if (Number.isNaN(hourValue) || Number.isNaN(minuteValue)) return String(value);
  const period = hourValue >= 12 ? "PM" : "AM";
  const hour = hourValue % 12 || 12;
  return `${String(hour).padStart(2, "0")}:${String(minuteValue).padStart(2, "0")} ${period}`;
};
