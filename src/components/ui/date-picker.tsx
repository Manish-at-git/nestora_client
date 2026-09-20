import React, { useState, useEffect, useId, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  X,
  Clock,
  Check,
} from "lucide-react";
import {
  format,
  parseISO,
  isValid,
  isSameDay,
  isSameMonth,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  addMonths,
  subMonths,
  addYears,
  subYears,
  startOfYear,
  endOfYear,
  subDays,
  startOfDay,
  endOfDay,
  isWithinInterval,
  isAfter,
  isBefore,
} from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// --- Types ---

export type DatePickerMode = "date" | "month" | "year" | "range";

export interface DateRangeValue {
  from?: string | Date;
  to?: string | Date;
}

export interface DateRangeResult {
  from: string;
  to: string;
  fromDate?: Date;
  toDate?: Date;
}

export interface RangePreset {
  label: string;
  getValue: () => { from: Date; to: Date };
}

export interface DatePickerProps {
  mode?: DatePickerMode;

  // Values & Handlers
  value?: string | Date | number | DateRangeValue;
  onChange?: (value: any, extra?: any) => void;
  defaultValue?: string | Date | number | DateRangeValue;

  // Form Field Integration
  label?: React.ReactNode;
  required?: boolean;
  error?: string | boolean;
  helperText?: React.ReactNode;
  withFormField?: boolean;

  // Visual & Behavioral
  placeholder?: string;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  isClearable?: boolean;
  onClear?: () => void;
  leftIcon?: React.ReactNode;

  // Formatting & Constraints
  displayFormat?: string;
  valueFormat?: string;
  minDate?: string | Date;
  maxDate?: string | Date;

  // Range specific
  presets?: boolean | RangePreset[];

  // Custom ClassNames
  className?: string;
  containerClassName?: string;
  triggerClassName?: string;
  popoverClassName?: string;
  labelClassName?: string;
  errorClassName?: string;
  helperClassName?: string;
  id?: string;
}

const DAYS_OF_WEEK = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
const MONTH_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

const DEFAULT_RANGE_PRESETS: RangePreset[] = [
  {
    label: "Today",
    getValue: () => {
      const now = new Date();
      return { from: startOfDay(now), to: endOfDay(now) };
    },
  },
  {
    label: "Yesterday",
    getValue: () => {
      const y = subDays(new Date(), 1);
      return { from: startOfDay(y), to: endOfDay(y) };
    },
  },
  {
    label: "Last 7 Days",
    getValue: () => {
      const now = new Date();
      return { from: startOfDay(subDays(now, 6)), to: endOfDay(now) };
    },
  },
  {
    label: "Last 30 Days",
    getValue: () => {
      const now = new Date();
      return { from: startOfDay(subDays(now, 29)), to: endOfDay(now) };
    },
  },
  {
    label: "This Month",
    getValue: () => {
      const now = new Date();
      return { from: startOfMonth(now), to: endOfMonth(now) };
    },
  },
  {
    label: "Last Month",
    getValue: () => {
      const prev = subMonths(new Date(), 1);
      return { from: startOfMonth(prev), to: endOfMonth(prev) };
    },
  },
  {
    label: "This Year",
    getValue: () => {
      const now = new Date();
      return { from: startOfYear(now), to: endOfYear(now) };
    },
  },
];

// Helper to normalize any date input to a valid Date object
function toDateObj(val: any): Date | undefined {
  if (!val) return undefined;
  if (val instanceof Date) return isValid(val) ? val : undefined;
  if (typeof val === "number") {
    // If it's a 4 digit number, treat as a year
    if (val >= 1900 && val <= 2100) return new Date(val, 0, 1);
    const d = new Date(val);
    return isValid(d) ? d : undefined;
  }
  if (typeof val === "string") {
    const trimmed = val.trim();
    if (!trimmed) return undefined;
    // Year-only "2026"
    if (/^\d{4}$/.test(trimmed)) {
      return new Date(parseInt(trimmed, 10), 0, 1);
    }
    // Month-only "2026-09"
    if (/^\d{4}-\d{2}$/.test(trimmed)) {
      const [y, m] = trimmed.split("-");
      return new Date(parseInt(y, 10), parseInt(m, 10) - 1, 1);
    }
    // Full date "2026-09-05" or ISO
    const parsed = parseISO(trimmed);
    if (isValid(parsed)) return parsed;
    const nativeParsed = new Date(trimmed);
    if (isValid(nativeParsed)) return nativeParsed;
  }
  return undefined;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  mode = "date",
  value,
  onChange,
  defaultValue,
  label,
  required = false,
  error,
  helperText,
  withFormField,
  placeholder,
  disabled = false,
  size = "md",
  isClearable = false,
  onClear,
  leftIcon,
  displayFormat,
  valueFormat,
  minDate,
  maxDate,
  presets = true,
  className,
  containerClassName,
  triggerClassName,
  popoverClassName,
  labelClassName,
  errorClassName,
  helperClassName,
  id: customId,
}) => {
  const autoId = useId();
  const inputId = customId || (label ? `date-picker-${autoId}` : undefined);
  const [open, setOpen] = useState(false);

  // Parse min / max constraints
  const minDateObj = useMemo(() => toDateObj(minDate), [minDate]);
  const maxDateObj = useMemo(() => toDateObj(maxDate), [maxDate]);

  // Internal view navigation state
  const [viewDate, setViewDate] = useState<Date>(() => {
    if (mode === "range" && typeof value === "object" && value && "from" in value) {
      return toDateObj((value as DateRangeValue).from) || new Date();
    }
    return toDateObj(value) || toDateObj(defaultValue) || new Date();
  });

  // Active view level inside the calendar popover: "days" | "months" | "years"
  const [viewLevel, setViewLevel] = useState<"days" | "months" | "years">(() => {
    if (mode === "month") return "months";
    if (mode === "year") return "years";
    return "days";
  });

  // Range selection hover state
  const [rangeHoverDate, setRangeHoverDate] = useState<Date | undefined>(undefined);

  // Sync view date with incoming value when opening or value changing
  useEffect(() => {
    if (mode === "range") {
      if (value && typeof value === "object" && "from" in value) {
        const d = toDateObj((value as DateRangeValue).from);
        if (d) setViewDate(d);
      }
    } else {
      const d = toDateObj(value);
      if (d) setViewDate(d);
    }
  }, [value, mode]);

  useEffect(() => {
    if (open) {
      if (mode === "month") setViewLevel("months");
      else if (mode === "year") setViewLevel("years");
      else setViewLevel("days");
    }
  }, [open, mode]);

  // Resolve error & helper
  const hasError = Boolean(error);
  const errorMessage = typeof error === "string" ? error : undefined;

  const shouldRenderFormField =
    withFormField !== false &&
    (withFormField === true || Boolean(label || errorMessage || helperText));

  // Sizing styles (matching Input, NumberInput, Textarea standards: rounded-lg corners)
  const isSm = size === "sm";
  const isLg = size === "lg";

  const sizeClasses = isSm
    ? "h-8.5 rounded-lg text-xs px-2.5"
    : isLg
    ? "h-11 rounded-lg text-base px-3.5"
    : "h-10 rounded-lg text-sm px-3";

  // Check if a day is disabled
  const isDayDisabled = (d: Date) => {
    if (minDateObj && isBefore(startOfDay(d), startOfDay(minDateObj))) return true;
    if (maxDateObj && isAfter(startOfDay(d), startOfDay(maxDateObj))) return true;
    return false;
  };

  // Determine display label on the button trigger
  const renderDisplayLabel = () => {
    if (mode === "range") {
      const rangeVal = (value || defaultValue) as DateRangeValue | undefined;
      const fromObj = toDateObj(rangeVal?.from);
      const toObj = toDateObj(rangeVal?.to);

      if (fromObj && toObj) {
        const fmt = displayFormat || "MMM d, yyyy";
        return `${format(fromObj, fmt)} - ${format(toObj, fmt)}`;
      }
      if (fromObj) {
        const fmt = displayFormat || "MMM d, yyyy";
        return `${format(fromObj, fmt)} - ...`;
      }
      return placeholder || "Select date range...";
    }

    if (mode === "month") {
      const d = toDateObj(value || defaultValue);
      if (!d) return placeholder || "Select month...";
      return format(d, displayFormat || "MMMM yyyy");
    }

    if (mode === "year") {
      const d = toDateObj(value || defaultValue);
      if (!d) return placeholder || "Select year...";
      return format(d, displayFormat || "yyyy");
    }

    // Default: Single Date
    const d = toDateObj(value || defaultValue);
    if (!d) return placeholder || "Select date...";
    return format(d, displayFormat || "MMM d, yyyy");
  };

  const hasSelectedValue = useMemo(() => {
    if (mode === "range") {
      const rangeVal = (value || defaultValue) as DateRangeValue | undefined;
      return Boolean(rangeVal?.from || rangeVal?.to);
    }
    return Boolean(value || defaultValue);
  }, [value, defaultValue, mode]);

  // Handle Clear
  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onClear) {
      onClear();
    } else if (onChange) {
      if (mode === "range") {
        onChange({ from: "", to: "" });
      } else {
        onChange("");
      }
    }
  };

  // --- Date Selection Handlers ---

  const handleSelectDay = (day: Date) => {
    if (isDayDisabled(day)) return;

    if (mode === "range") {
      const currentRange = ((value || defaultValue) as DateRangeValue) || {};
      const fromObj = toDateObj(currentRange.from);
      const toObj = toDateObj(currentRange.to);

      const fmt = valueFormat || "yyyy-MM-dd";

      // If no start date or both already selected, start fresh selection
      if (!fromObj || (fromObj && toObj)) {
        onChange?.({ from: format(day, fmt), to: "", fromDate: day, toDate: undefined });
      } else {
        // We have start date, picking end date
        if (isBefore(day, fromObj)) {
          // If clicked before fromDate, make this the new fromDate
          onChange?.({ from: format(day, fmt), to: "", fromDate: day, toDate: undefined });
        } else {
          onChange?.({
            from: format(fromObj, fmt),
            to: format(day, fmt),
            fromDate: fromObj,
            toDate: day,
          });
          setOpen(false);
        }
      }
    } else {
      const fmt = valueFormat || "yyyy-MM-dd";
      const formatted = format(day, fmt);
      onChange?.(formatted, day);
      setOpen(false);
    }
  };

  const handleSelectMonth = (monthIndex: number) => {
    const newDate = new Date(viewDate.getFullYear(), monthIndex, 1);
    setViewDate(newDate);

    if (mode === "month") {
      const fmt = valueFormat || "yyyy-MM";
      onChange?.(format(newDate, fmt), newDate);
      setOpen(false);
    } else {
      setViewLevel("days");
    }
  };

  const handleSelectYear = (yearNum: number) => {
    const newDate = new Date(yearNum, viewDate.getMonth(), 1);
    setViewDate(newDate);

    if (mode === "year") {
      const fmt = valueFormat || "yyyy";
      onChange?.(format(newDate, fmt), yearNum);
      setOpen(false);
    } else if (mode === "month") {
      setViewLevel("months");
    } else {
      setViewLevel("months");
    }
  };

  // Navigation handlers
  const handlePrevMonth = () => setViewDate((d) => subMonths(d, 1));
  const handleNextMonth = () => setViewDate((d) => addMonths(d, 1));
  const handlePrevYear = () => setViewDate((d) => subYears(d, 1));
  const handleNextYear = () => setViewDate((d) => addYears(d, 1));
  const handlePrevDecade = () => setViewDate((d) => subYears(d, 12));
  const handleNextDecade = () => setViewDate((d) => addYears(d, 12));

  // Calendar Day Grid calculations
  const monthStart = startOfMonth(viewDate);
  const monthEnd = endOfMonth(viewDate);
  const startDayOfWeek = getDay(monthStart); // 0 = Sunday
  const daysInCurrentMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Decade calculations for Year Picker
  const currentYear = viewDate.getFullYear();
  const decadeStartYear = Math.floor(currentYear / 12) * 12;
  const decadeYears = Array.from({ length: 12 }, (_, i) => decadeStartYear + i);

  // Selected date object for single date
  const selectedDateObj = useMemo(() => {
    if (mode === "range") return undefined;
    return toDateObj(value || defaultValue);
  }, [value, defaultValue, mode]);

  // Range boundary objects
  const { rangeFromObj, rangeToObj } = useMemo(() => {
    if (mode !== "range") return { rangeFromObj: undefined, rangeToObj: undefined };
    const rangeVal = (value || defaultValue) as DateRangeValue | undefined;
    return {
      rangeFromObj: toDateObj(rangeVal?.from),
      rangeToObj: toDateObj(rangeVal?.to),
    };
  }, [value, defaultValue, mode]);

  // Render Trigger Button
  const renderTrigger = () => (
    <PopoverTrigger asChild>
      <button
        type="button"
        id={inputId}
        disabled={disabled}
        className={cn(
          "flex w-full items-center justify-between bg-white border border-slate-200 text-slate-800 placeholder:text-slate-400 font-normal transition-all duration-150 shadow-2xs outline-none text-left",
          sizeClasses,
          "hover:border-slate-300",
          "focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20",
          "disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 disabled:border-slate-200 disabled:shadow-none",
          hasError &&
            "border-red-400 focus:border-red-500 focus:ring-red-500/20 text-slate-900 hover:border-red-400",
          !hasSelectedValue && "text-slate-400",
          triggerClassName,
          className
        )}
      >
        <div className="flex items-center gap-2.5 truncate">
          <div className="text-slate-400 shrink-0">
            {leftIcon || <CalendarIcon size={isSm ? 13 : isLg ? 16 : 15} />}
          </div>
          <span className="truncate">{renderDisplayLabel()}</span>
        </div>

        {/* Clear Button or Quick Status */}
        <div className="flex items-center gap-1.5 ml-2 shrink-0">
          {isClearable && hasSelectedValue && !disabled && (
            <span
              role="button"
              tabIndex={-1}
              onClick={handleClear}
              className="p-0.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Clear date"
            >
              <X size={isSm ? 12 : isLg ? 15 : 13} />
            </span>
          )}
        </div>
      </button>
    </PopoverTrigger>
  );

  // Render Days Calendar View
  const renderDaysView = () => (
    <div className="flex flex-col justify-between min-h-[268px]">
      <div>
        {/* Month & Year Header with Quick Jumps */}
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handlePrevYear}
              className="p-1 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
              title="Previous Year"
            >
              <ChevronsLeft size={15} />
            </button>
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
              title="Previous Month"
            >
              <ChevronLeft size={15} />
            </button>
          </div>

          {/* Clickable Month & Year to switch views */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setViewLevel("months")}
              className="text-xs font-semibold text-slate-800 hover:text-blue-600 hover:bg-slate-100 px-2 py-1 rounded-md transition-colors"
            >
              {MONTH_NAMES[viewDate.getMonth()]}
            </button>
            <button
              type="button"
              onClick={() => setViewLevel("years")}
              className="text-xs font-semibold text-slate-800 hover:text-blue-600 hover:bg-slate-100 px-2 py-1 rounded-md transition-colors"
            >
              {viewDate.getFullYear()}
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
              title="Next Month"
            >
              <ChevronRight size={15} />
            </button>
            <button
              type="button"
              onClick={handleNextYear}
              className="p-1 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
              title="Next Year"
            >
              <ChevronsRight size={15} />
            </button>
          </div>
        </div>

        {/* Weekday Labels */}
        <div className="grid grid-cols-7 gap-1 text-center mb-1">
          {DAYS_OF_WEEK.map((d) => (
            <span key={d} className="text-[11px] font-semibold text-slate-400 py-1 select-none">
              {d}
            </span>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1 text-center">
          {/* Empty slots for starting day of month */}
          {Array.from({ length: startDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} className="h-8 w-8" />
          ))}

          {daysInCurrentMonth.map((day) => {
            const isToday = isSameDay(day, new Date());
            const isSelected = selectedDateObj ? isSameDay(day, selectedDateObj) : false;
            const isDisabled = isDayDisabled(day);

            // Range calculation
            let isRangeStart = false;
            let isRangeEnd = false;
            let isInRange = false;

            if (mode === "range") {
              if (rangeFromObj && isSameDay(day, rangeFromObj)) isRangeStart = true;
              if (rangeToObj && isSameDay(day, rangeToObj)) isRangeEnd = true;

              const effectiveTo = rangeToObj || rangeHoverDate;
              if (rangeFromObj && effectiveTo && isAfter(effectiveTo, rangeFromObj)) {
                if (
                  isWithinInterval(day, { start: rangeFromObj, end: effectiveTo }) &&
                  !isRangeStart &&
                  !isRangeEnd
                ) {
                  isInRange = true;
                }
              }
            }

            return (
              <button
                key={day.toISOString()}
                type="button"
                disabled={isDisabled}
                onClick={() => handleSelectDay(day)}
                onMouseEnter={() => mode === "range" && rangeFromObj && !rangeToObj && setRangeHoverDate(day)}
                className={cn(
                  "h-8 w-8 text-xs font-normal flex items-center justify-center transition-all mx-auto select-none rounded-lg",
                  // Range highlight
                  isInRange && "bg-blue-50 text-blue-800 rounded-none",
                  isRangeStart && "bg-blue-600 text-white font-medium shadow-xs rounded-r-none",
                  isRangeEnd && "bg-blue-600 text-white font-medium shadow-xs rounded-l-none",
                  isRangeStart && isRangeEnd && "rounded-lg",
                  // Single select
                  isSelected && !isRangeStart && !isRangeEnd && "bg-blue-600 text-white font-medium shadow-xs",
                  // Today indicator
                  isToday && !isSelected && !isRangeStart && !isRangeEnd && !isInRange &&
                    "text-blue-600 font-semibold bg-blue-50/50 border border-blue-200/80",
                  // Default interactive
                  !isSelected && !isRangeStart && !isRangeEnd && !isInRange && !isToday && !isDisabled &&
                    "text-slate-700 hover:bg-slate-100 hover:text-slate-900",
                  // Disabled
                  isDisabled && "text-slate-300 cursor-not-allowed hover:bg-transparent"
                )}
              >
                {day.getDate()}
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer Quick Shortcuts */}
      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
        <button
          type="button"
          onClick={() => {
            const now = new Date();
            setViewDate(now);
            if (mode !== "range") {
              handleSelectDay(now);
            }
          }}
          className="font-medium text-blue-600 hover:text-blue-700 hover:underline"
        >
          Today
        </button>

        {hasSelectedValue && (
          <button
            type="button"
            onClick={(e) => {
              handleClear(e);
              setOpen(false);
            }}
            className="font-normal text-slate-400 hover:text-slate-600 hover:underline"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );

  // Render Months Selector View
  const renderMonthsView = () => (
    <div className="flex flex-col justify-between min-h-[268px]">
      <div>
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
          <button
            type="button"
            onClick={handlePrevYear}
            className="p-1 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
          >
            <ChevronLeft size={16} />
          </button>

          <button
            type="button"
            onClick={() => setViewLevel("years")}
            className="text-xs font-semibold text-slate-800 hover:text-blue-600 hover:bg-slate-100 px-2 py-1 rounded-md transition-colors"
          >
            {viewDate.getFullYear()}
          </button>

          <button
            type="button"
            onClick={handleNextYear}
            className="p-1 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {MONTH_SHORT.map((mShort, idx) => {
            const currentMonthDate = new Date(viewDate.getFullYear(), idx, 1);
            const isSelected = selectedDateObj ? isSameMonth(currentMonthDate, selectedDateObj) : false;
            const isThisMonth = isSameMonth(currentMonthDate, new Date());

            return (
              <button
                key={mShort}
                type="button"
                onClick={() => handleSelectMonth(idx)}
                className={cn(
                  "py-2.5 px-2 rounded-lg text-xs font-normal transition-all flex flex-col items-center justify-center relative",
                  isSelected
                    ? "bg-blue-600 text-white font-medium shadow-xs"
                    : isThisMonth
                    ? "text-blue-600 font-semibold bg-blue-50/50 hover:bg-blue-50"
                    : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                )}
              >
                <span>{mShort}</span>
                {isThisMonth && !isSelected && (
                  <span className="w-1 h-1 rounded-full bg-blue-500 mt-0.5" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
        <button
          type="button"
          onClick={() => {
            const now = new Date();
            setViewDate(now);
            if (mode === "month") {
              handleSelectMonth(now.getMonth());
            } else {
              setViewLevel("days");
            }
          }}
          className="font-medium text-blue-600 hover:text-blue-700 hover:underline"
        >
          This Month
        </button>
        {mode !== "month" && (
          <button
            type="button"
            onClick={() => setViewLevel("days")}
            className="font-normal text-slate-400 hover:text-slate-600 hover:underline"
          >
            Back to Calendar
          </button>
        )}
      </div>
    </div>
  );

  // Render Years Selector View
  const renderYearsView = () => (
    <div className="flex flex-col justify-between min-h-[268px]">
      <div>
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
          <button
            type="button"
            onClick={handlePrevDecade}
            className="p-1 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
          >
            <ChevronLeft size={16} />
          </button>

          <span className="text-xs font-semibold text-slate-800">
            {decadeYears[0]} - {decadeYears[decadeYears.length - 1]}
          </span>

          <button
            type="button"
            onClick={handleNextDecade}
            className="p-1 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {decadeYears.map((yr) => {
            const isSelected = selectedDateObj ? selectedDateObj.getFullYear() === yr : false;
            const isThisYear = new Date().getFullYear() === yr;

            return (
              <button
                key={yr}
                type="button"
                onClick={() => handleSelectYear(yr)}
                className={cn(
                  "py-2.5 px-2 rounded-lg text-xs font-normal transition-all flex flex-col items-center justify-center font-mono relative",
                  isSelected
                    ? "bg-blue-600 text-white font-medium shadow-xs"
                    : isThisYear
                    ? "text-blue-600 font-semibold bg-blue-50/50 hover:bg-blue-50"
                    : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                )}
              >
                <span>{yr}</span>
                {isThisYear && !isSelected && (
                  <span className="w-1 h-1 rounded-full bg-blue-500 mt-0.5" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
        <button
          type="button"
          onClick={() => {
            const now = new Date();
            setViewDate(now);
            if (mode === "year") {
              handleSelectYear(now.getFullYear());
            } else {
              setViewLevel("months");
            }
          }}
          className="font-medium text-blue-600 hover:text-blue-700 hover:underline"
        >
          This Year
        </button>
        {mode !== "year" && (
          <button
            type="button"
            onClick={() => setViewLevel(mode === "month" ? "months" : "days")}
            className="font-normal text-slate-400 hover:text-slate-600 hover:underline"
          >
            Back
          </button>
        )}
      </div>
    </div>
  );

  // Render Range Presets Sidebar
  const renderRangePresets = () => {
    const activePresets = Array.isArray(presets) ? presets : DEFAULT_RANGE_PRESETS;
    if (!presets || activePresets.length === 0) return null;

    const fmt = valueFormat || "yyyy-MM-dd";

    return (
      <div className="w-36 border-r border-slate-100 p-2 space-y-1 bg-slate-50/60 shrink-0">
        <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Quick Presets
        </div>
        {activePresets.map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => {
              const { from, to } = p.getValue();
              onChange?.({
                from: format(from, fmt),
                to: format(to, fmt),
                fromDate: from,
                toDate: to,
              });
              setViewDate(from);
              setOpen(false);
            }}
            className="w-full text-left px-2 py-1.5 rounded-md text-xs font-normal text-slate-600 hover:bg-white hover:text-blue-600 hover:shadow-2xs transition-all"
          >
            {p.label}
          </button>
        ))}
      </div>
    );
  };

  const popoverContent = (
    <PopoverContent
      className={cn(
        "p-0 shadow-xl rounded-xl border border-slate-200/90 bg-white overflow-hidden z-50",
        mode === "range" && presets ? "w-auto flex flex-row" : "w-72",
        popoverClassName
      )}
      align="start"
    >
      {mode === "range" && renderRangePresets()}

      <div className="p-3.5 flex-1 min-w-[260px]">
        {viewLevel === "days" && renderDaysView()}
        {viewLevel === "months" && renderMonthsView()}
        {viewLevel === "years" && renderYearsView()}
      </div>
    </PopoverContent>
  );

  const mainControl = (
    <Popover open={open} onOpenChange={setOpen}>
      {renderTrigger()}
      {popoverContent}
    </Popover>
  );

  // If standalone mode without label/error/helper, return control directly
  if (!shouldRenderFormField) {
    return <div className={cn("relative w-full", containerClassName)}>{mainControl}</div>;
  }

  // Wrapped in accessible form field layout
  return (
    <div className={cn("space-y-1.5 w-full", containerClassName)}>
      {label && (
        <label
          htmlFor={inputId}
          className={cn(
            "block text-xs font-semibold text-slate-700 cursor-pointer",
            disabled && "opacity-60 cursor-not-allowed",
            labelClassName
          )}
        >
          {label} {required && <span className="text-red-500 font-bold ml-0.5">*</span>}
        </label>
      )}

      {mainControl}

      {/* Validation Error Message or Helper Text */}
      <AnimatePresence initial={false} mode="wait">
        {errorMessage ? (
          <motion.div
            key="error"
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: "auto", marginTop: 4 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <p
              className={cn(
                "text-xs text-red-600 font-normal flex items-center gap-1",
                errorClassName
              )}
            >
              {errorMessage}
            </p>
          </motion.div>
        ) : helperText ? (
          <motion.div
            key="helper"
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: "auto", marginTop: 4 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <p className={cn("text-xs text-slate-400 font-normal", helperClassName)}>{helperText}</p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

// --- Specialized Convenience Aliases ---

export const DateRangePicker: React.FC<Omit<DatePickerProps, "mode">> = (props) => (
  <DatePicker mode="range" {...props} />
);

export const MonthPicker: React.FC<Omit<DatePickerProps, "mode">> = (props) => (
  <DatePicker mode="month" placeholder="Select month..." {...props} />
);

export const YearPicker: React.FC<Omit<DatePickerProps, "mode">> = (props) => (
  <DatePicker mode="year" placeholder="Select year..." {...props} />
);

export { DateTimePicker, type DateTimePickerProps } from "./date-time-picker";

DatePicker.displayName = "DatePicker";
DateRangePicker.displayName = "DateRangePicker";
MonthPicker.displayName = "MonthPicker";
YearPicker.displayName = "YearPicker";

export default DatePicker;
