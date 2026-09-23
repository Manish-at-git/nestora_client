/** Shared client-side validation helpers for form and field validation. */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\+?[1-9]\d{6,14}$/;
const PINCODE_PATTERN = /^\d{6}$/;
const PERSON_NAME_PATTERN = /^[\p{L}]+(?:[ '\u2019-][\p{L}]+)*$/u;
const ALPHANUMERIC_PATTERN = /^[a-zA-Z0-9]+$/;
const DECIMAL_PATTERN = /^\d+(?:\.\d+)?$/;

const toDate = (value: string | Date): Date | null => {
  if (value instanceof Date) {
    const date = new Date(value.getTime());
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const [, year, month, day] = match;
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  return date.getUTCFullYear() === Number(year) &&
      date.getUTCMonth() === Number(month) - 1 &&
      date.getUTCDate() === Number(day)
    ? date
    : null;
};

export const isEmail = (value: string): boolean => EMAIL_PATTERN.test(value.trim());

export const isPhoneNumber = (value: string): boolean => {
  const normalized = value.trim().replace(/[\s().-]/g, "");
  return PHONE_PATTERN.test(normalized);
};

export const isPincode = (value: string): boolean => PINCODE_PATTERN.test(value.trim());

export const isRequiredText = (value: string): boolean => value.trim().length > 0;

export const isPersonName = (value: string): boolean => PERSON_NAME_PATTERN.test(value.trim());

export const isAlphanumeric = (value: string): boolean => ALPHANUMERIC_PATTERN.test(value.trim());

export const isPositiveInteger = (value: string | number): boolean => {
  const text = String(value).trim();
  return /^\d+$/.test(text) && Number(text) > 0;
};

export const isNonNegativeInteger = (value: string | number): boolean => {
  const text = String(value).trim();
  return /^\d+$/.test(text) && Number(text) >= 0;
};

export const isDecimal = (value: string | number): boolean =>
  DECIMAL_PATTERN.test(String(value).trim());

export const isValidDate = (value: string | Date): boolean => toDate(value) !== null;

export const isDateAfter = (
  value: string | Date,
  reference: string | Date,
  inclusive = false,
): boolean => {
  const date = toDate(value);
  const referenceDate = toDate(reference);
  if (!date || !referenceDate) return false;
  return inclusive ? date >= referenceDate : date > referenceDate;
};

export const isDateBefore = (
  value: string | Date,
  reference: string | Date,
  inclusive = false,
): boolean => {
  const date = toDate(value);
  const referenceDate = toDate(reference);
  if (!date || !referenceDate) return false;
  return inclusive ? date <= referenceDate : date < referenceDate;
};

export const isDateRangeValid = (
  start: string | Date,
  end: string | Date,
  inclusive = true,
): boolean => {
  const startDate = toDate(start);
  const endDate = toDate(end);
  if (!startDate || !endDate) return false;
  return inclusive ? startDate <= endDate : startDate < endDate;
};
