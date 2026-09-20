import React, { useState, useEffect, useId, useMemo, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Calendar as CalendarIcon,
  Clock,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  X,
  Check,
} from "lucide-react";
import {
  format,
  parseISO,
  isValid,
  isSameDay,
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
  startOfDay,
  endOfDay,
  isAfter,
  isBefore,
  setHours,
  setMinutes,
} from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface DateTimePickerProps {
  // Values & Handlers
  value?: string | Date | null;
  onChange?: (value: string, dateObj?: Date | null) => void;
  defaultValue?: string | Date | null;

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

  // Time Options
  minuteStep?: 1 | 5 | 10 | 15 | 30;
  timeFormat?: "12h" | "24h";
  displayFormat?: string; // e.g. "MMM d, yyyy h:mm a" or "yyyy-MM-dd HH:mm"
  valueFormat?: "iso" | "local-iso" | "datetime-local"; // default "datetime-local" e.g. "2026-09-12T18:30"

  // Constraints
  minDateTime?: string | Date;
  maxDateTime?: string | Date;

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

const TIME_PRESETS_12H = [
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "01:00 PM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
  "05:00 PM",
  "06:00 PM",
  "07:00 PM",
  "08:00 PM",
];

export const DateTimePicker: React.FC<DateTimePickerProps> = ({
  value: controlledValue,
  onChange,
  defaultValue,
  label,
  required = false,
  error,
  helperText,
  withFormField = false,
  placeholder = "Select date & time...",
  disabled = false,
  size = "md",
  isClearable = true,
  onClear,
  leftIcon,
  minuteStep = 1,
  timeFormat = "12h",
  displayFormat,
  valueFormat = "datetime-local",
  minDateTime,
  maxDateTime,
  className,
  containerClassName,
  triggerClassName,
  popoverClassName,
  labelClassName,
  errorClassName,
  helperClassName,
  id: customId,
}) => {
  const generatedId = useId();
  const inputId = customId || generatedId;

  // Safe Date parsing helper
  const parseSafeDate = (val?: string | Date | null): Date | null => {
    if (!val) return null;
    if (val instanceof Date) return isValid(val) ? val : null;
    if (typeof val === "string") {
      try {
        const parsed = parseISO(val);
        if (isValid(parsed)) return parsed;
        const fallback = new Date(val);
        return isValid(fallback) ? fallback : null;
      } catch {
        return null;
      }
    }
    return null;
  };

  const [internalDate, setInternalDate] = useState<Date | null>(() => {
    return parseSafeDate(controlledValue ?? defaultValue);
  });

  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState<Date>(() => internalDate || new Date());
  const [viewMode, setViewMode] = useState<"days" | "months" | "years">("days");

  // Sync internalDate with controlledValue
  useEffect(() => {
    if (controlledValue !== undefined) {
      setInternalDate(parseSafeDate(controlledValue));
    }
  }, [controlledValue]);

  // Keep viewDate updated when popover opens with a selected date or minDateTime
  useEffect(() => {
    if (isOpen) {
      if (internalDate) {
        setViewDate(internalDate);
      } else if (minDateTime) {
        const minD = parseSafeDate(minDateTime);
        if (minD && isValid(minD)) {
          setViewDate(minD);
        }
      }
    }
  }, [isOpen, internalDate, minDateTime]);

  const selectedDate = controlledValue !== undefined ? parseSafeDate(controlledValue) : internalDate;

  // Time state derived from selectedDate
  const currentHour24 = selectedDate ? selectedDate.getHours() : 12;
  const currentMinute = selectedDate ? selectedDate.getMinutes() : 0;
  const currentPeriod: "AM" | "PM" = currentHour24 >= 12 ? "PM" : "AM";
  const currentHour12 = currentHour24 % 12 || 12;

  // Formatter helpers
  const formatOutputValue = (d: Date | null): string => {
    if (!d || !isValid(d)) return "";
    if (valueFormat === "iso") return d.toISOString();
    // Default: local ISO string e.g. "2026-09-12T18:30"
    return format(d, "yyyy-MM-dd'T'HH:mm");
  };

  const getDisplayString = (): string => {
    if (!selectedDate || !isValid(selectedDate)) return "";
    if (displayFormat) return format(selectedDate, displayFormat);
    return timeFormat === "24h"
      ? format(selectedDate, "MMM d, yyyy HH:mm")
      : format(selectedDate, "MMM d, yyyy h:mm a");
  };

  // Selection handlers
  const updateDateTime = (newDate: Date | null) => {
    setInternalDate(newDate);
    if (newDate && isValid(newDate)) {
      const outStr = formatOutputValue(newDate);
      onChange?.(outStr, newDate);
    } else {
      onChange?.("", null);
    }
  };

  const handleDaySelect = (day: Date) => {
    const baseDate = selectedDate || new Date();
    const updated = setMinutes(setHours(day, baseDate.getHours()), baseDate.getMinutes());
    updateDateTime(updated);
  };

  const handleTimeChange = (hour12: number, minute: number, period: "AM" | "PM") => {
    const base = selectedDate || new Date();
    let hour24 = period === "PM" ? (hour12 === 12 ? 12 : hour12 + 12) : hour12 === 12 ? 0 : hour12;
    const updated = setMinutes(setHours(base, hour24), minute);
    updateDateTime(updated);
  };

  const handleTime24Change = (hour24: number, minute: number) => {
    const base = selectedDate || new Date();
    const updated = setMinutes(setHours(base, hour24), minute);
    updateDateTime(updated);
  };

  const handlePresetSelect = (presetStr: string) => {
    const match = presetStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!match) return;
    const h = parseInt(match[1], 10);
    const m = parseInt(match[2], 10);
    const p = match[3].toUpperCase() as "AM" | "PM";
    handleTimeChange(h, m, p);
  };

  const handleSetNow = () => {
    const now = new Date();
    setViewDate(now);
    updateDateTime(now);
  };

  const handleClear = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    updateDateTime(null);
    onClear?.();
  };

  // Calendar matrix calculations
  const monthStart = startOfMonth(viewDate);
  const monthEnd = endOfMonth(viewDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startingDayIndex = getDay(monthStart); // 0 (Sun) to 6 (Sat)

  const isDayDisabled = (day: Date) => {
    const minDate = parseSafeDate(minDateTime);
    if (minDate && isBefore(day, startOfDay(minDate))) return true;
    const maxDate = parseSafeDate(maxDateTime);
    if (maxDate && isAfter(day, endOfDay(maxDate))) return true;
    return false;
  };

  // Month & Year view items
  const months = useMemo(
    () => [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ],
    []
  );

  const currentYear = viewDate.getFullYear();
  const yearRangeStart = Math.floor(currentYear / 12) * 12;
  const years = useMemo(
    () => Array.from({ length: 12 }, (_, i) => yearRangeStart + i),
    [yearRangeStart]
  );

  // Minute options array based on step
  const minuteOptions = useMemo(() => {
    const arr: number[] = [];
    if (minuteStep === 1) {
      for (let m = 0; m < 60; m++) {
        arr.push(m);
      }
    } else {
      for (let m = 0; m < 60; m += minuteStep) {
        arr.push(m);
      }
      if (selectedDate && !arr.includes(selectedDate.getMinutes())) {
        arr.push(selectedDate.getMinutes());
        arr.sort((a, b) => a - b);
      }
    }
    return arr;
  }, [minuteStep, selectedDate]);

  // Size styling tokens
  const sizeClasses = {
    sm: "h-8 px-2.5 text-xs rounded-lg gap-1.5",
    md: "h-10 px-3.5 text-xs rounded-xl gap-2",
    lg: "h-12 px-4 text-sm rounded-xl gap-2.5",
  };

  const iconSizes = {
    sm: 13,
    md: 15,
    lg: 17,
  };

  const hasError = Boolean(error);
  const errorMessage = typeof error === "string" ? error : undefined;

  const triggerContent = (
    <PopoverTrigger asChild>
      <button
        type="button"
        id={inputId}
        disabled={disabled}
        className={cn(
          "w-full flex items-center justify-between border bg-white text-slate-800 transition-all duration-150 outline-none select-none cursor-pointer group",
          sizeClasses[size],
          hasError
            ? "border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/15"
            : "border-blue-200 hover:border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15",
          disabled && "bg-blue-50 text-blue-400 border-blue-200 cursor-not-allowed opacity-75",
          triggerClassName
        )}
      >
        <div className="flex items-center gap-2 truncate min-w-0">
          <span className={cn("text-slate-400 group-hover:text-slate-600 transition-colors shrink-0", hasError && "text-rose-400")}>
            {leftIcon || <CalendarIcon size={iconSizes[size]} />}
          </span>
          <span className={cn("truncate", !selectedDate && "text-slate-400 font-normal")}>
            {getDisplayString() || placeholder}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 ml-2">
          {isClearable && selectedDate && !disabled && (
            <span
              onClick={handleClear}
              title="Clear date and time"
              className="p-1 hover:bg-slate-100 rounded-md text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            >
              <X size={12} />
            </span>
          )}
          <Clock size={13} className="text-slate-400 group-hover:text-slate-600 transition-colors" />
        </div>
      </button>
    </PopoverTrigger>
  );

  const mainPicker = (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      {triggerContent}

      <PopoverContent
        align="start"
        sideOffset={6}
        className={cn(
          "p-0 w-auto bg-white rounded-2xl shadow-xl border border-slate-200/90 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150 select-none",
          popoverClassName
        )}
      >
        <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-100">
          {/* Left / Top: Calendar Grid */}
          <div className="p-3.5 sm:p-4 w-[280px]">
            {/* Calendar Header Navigation */}
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setViewMode(viewMode === "months" ? "days" : "months")}
                  className="px-2 py-1 text-xs font-bold text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  {format(viewDate, "MMMM")}
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode(viewMode === "years" ? "days" : "years")}
                  className="px-2 py-1 text-xs font-bold text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  {format(viewDate, "yyyy")}
                </button>
              </div>

              <div className="flex items-center gap-0.5">
                <button
                  type="button"
                  onClick={() => {
                    if (viewMode === "days") setViewDate(subMonths(viewDate, 1));
                    else if (viewMode === "months") setViewDate(subYears(viewDate, 1));
                    else setViewDate(subYears(viewDate, 12));
                  }}
                  className="p-1 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                >
                  <ChevronLeft size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (viewMode === "days") setViewDate(addMonths(viewDate, 1));
                    else if (viewMode === "months") setViewDate(addYears(viewDate, 1));
                    else setViewDate(addYears(viewDate, 12));
                  }}
                  className="p-1 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                >
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>

            {/* View Mode: Days */}
            {viewMode === "days" && (
              <>
                {/* Weekday Labels */}
                <div className="grid grid-cols-7 gap-1 text-center mb-1">
                  {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                    <span key={d} className="text-[10px] font-semibold text-slate-400 py-0.5">
                      {d}
                    </span>
                  ))}
                </div>

                {/* Day Buttons Grid */}
                <div className="grid grid-cols-7 gap-1">
                  {/* Empty slots before start of month */}
                  {Array.from({ length: startingDayIndex }).map((_, i) => (
                    <div key={`empty-${i}`} className="h-8 w-8" />
                  ))}

                  {daysInMonth.map((day) => {
                    const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
                    const isToday = isSameDay(day, new Date());
                    const disabledDay = isDayDisabled(day);

                    return (
                      <button
                        key={day.toISOString()}
                        type="button"
                        disabled={disabledDay}
                        onClick={() => handleDaySelect(day)}
                        className={cn(
                          "h-8 w-8 rounded-lg text-xs font-medium flex items-center justify-center transition-all duration-150 cursor-pointer",
                          isSelected
                            ? "bg-slate-900 text-white font-semibold shadow-xs"
                            : isToday
                            ? "border border-slate-900 text-slate-900 font-semibold hover:bg-slate-50"
                            : "text-slate-700 hover:bg-slate-100",
                          disabledDay && "text-slate-300 opacity-40 cursor-not-allowed hover:bg-transparent"
                        )}
                      >
                        {format(day, "d")}
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {/* View Mode: Months */}
            {viewMode === "months" && (
              <div className="grid grid-cols-3 gap-2 py-2">
                {months.map((m, idx) => {
                  const mDate = new Date(viewDate.getFullYear(), idx, 1);
                  const isCurrentMonth = isSameDay(startOfMonth(mDate), startOfMonth(viewDate));
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => {
                        setViewDate(mDate);
                        setViewMode("days");
                      }}
                      className={cn(
                        "py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer",
                        isCurrentMonth
                          ? "bg-slate-900 text-white"
                          : "text-slate-700 hover:bg-slate-100"
                      )}
                    >
                      {m}
                    </button>
                  );
                })}
              </div>
            )}

            {/* View Mode: Years */}
            {viewMode === "years" && (
              <div className="grid grid-cols-3 gap-2 py-2">
                {years.map((y) => {
                  const isCurrentYear = viewDate.getFullYear() === y;
                  return (
                    <button
                      key={y}
                      type="button"
                      onClick={() => {
                        setViewDate(new Date(y, viewDate.getMonth(), 1));
                        setViewMode("days");
                      }}
                      className={cn(
                        "py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer",
                        isCurrentYear
                          ? "bg-slate-900 text-white"
                          : "text-slate-700 hover:bg-slate-100"
                      )}
                    >
                      {y}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right / Bottom: Time Selector & Presets */}
          <div className="p-3.5 sm:p-4 bg-slate-50/50 w-[240px] flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 mb-3 pb-2 border-b border-slate-100">
                <Clock size={14} className="text-slate-500" />
                <span className="text-xs font-bold text-slate-800">Time Selection</span>
              </div>

              {/* Time Pickers (12h or 24h) */}
              {timeFormat === "12h" ? (
                <div className="grid grid-cols-3 gap-1.5 mb-3 items-end">
                  {/* Hours */}
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">
                      Hour
                    </label>
                    <Select
                      size="sm"
                      value={String(currentHour12)}
                      placeholder={String(currentHour12).padStart(2, "0")}
                      onValueChange={(val) =>
                        handleTimeChange(
                          parseInt(val, 10),
                          currentMinute,
                          currentPeriod
                        )
                      }
                      options={Array.from({ length: 12 }, (_, i) => i + 1).map((h) => ({
                        value: String(h),
                        label: String(h).padStart(2, "0"),
                      }))}
                      className="h-8 px-2 text-xs font-semibold rounded-lg"
                      contentClassName="min-w-[68px] z-[60]"
                    />
                  </div>

                  {/* Minutes */}
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">
                      Min
                    </label>
                    <Select
                      size="sm"
                      value={String(currentMinute)}
                      placeholder={String(currentMinute).padStart(2, "0")}
                      onValueChange={(val) =>
                        handleTimeChange(
                          currentHour12,
                          parseInt(val, 10),
                          currentPeriod
                        )
                      }
                      options={minuteOptions.map((m) => ({
                        value: String(m),
                        label: String(m).padStart(2, "0"),
                      }))}
                      className="h-8 px-2 text-xs font-semibold rounded-lg"
                      contentClassName="min-w-[68px] z-[60]"
                    />
                  </div>

                  {/* AM / PM */}
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">
                      Period
                    </label>
                    <div className="flex bg-slate-200/70 p-0.5 rounded-lg text-xs font-bold h-8 items-center">
                      <button
                        type="button"
                        onClick={() => handleTimeChange(currentHour12, currentMinute, "AM")}
                        className={cn(
                          "flex-1 h-7 rounded-md transition-colors cursor-pointer flex items-center justify-center",
                          currentPeriod === "AM"
                            ? "bg-white text-slate-900 shadow-2xs font-bold"
                            : "text-slate-500 hover:text-slate-800"
                        )}
                      >
                        AM
                      </button>
                      <button
                        type="button"
                        onClick={() => handleTimeChange(currentHour12, currentMinute, "PM")}
                        className={cn(
                          "flex-1 h-7 rounded-md transition-colors cursor-pointer flex items-center justify-center",
                          currentPeriod === "PM"
                            ? "bg-white text-slate-900 shadow-2xs font-bold"
                            : "text-slate-500 hover:text-slate-800"
                        )}
                      >
                        PM
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 mb-3 items-end">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">
                      Hour (24h)
                    </label>
                    <Select
                      size="sm"
                      value={String(currentHour24)}
                      placeholder={String(currentHour24).padStart(2, "0")}
                      onValueChange={(val) =>
                        handleTime24Change(parseInt(val, 10), currentMinute)
                      }
                      options={Array.from({ length: 24 }, (_, i) => i).map((h) => ({
                        value: String(h),
                        label: String(h).padStart(2, "0"),
                      }))}
                      className="h-8 px-2 text-xs font-semibold rounded-lg"
                      contentClassName="min-w-[68px] z-[60]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">
                      Minute
                    </label>
                    <Select
                      size="sm"
                      value={String(currentMinute)}
                      placeholder={String(currentMinute).padStart(2, "0")}
                      onValueChange={(val) =>
                        handleTime24Change(currentHour24, parseInt(val, 10))
                      }
                      options={minuteOptions.map((m) => ({
                        value: String(m),
                        label: String(m).padStart(2, "0"),
                      }))}
                      className="h-8 px-2 text-xs font-semibold rounded-lg"
                      contentClassName="min-w-[68px] z-[60]"
                    />
                  </div>
                </div>
              )}

              {/* Quick Preset Buttons */}
              <div className="mb-3">
                <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1.5">
                  Quick Times
                </label>
                <div className="grid grid-cols-2 gap-1 max-h-28 overflow-y-auto pr-1">
                  {TIME_PRESETS_12H.map((pst) => (
                    <button
                      key={pst}
                      type="button"
                      onClick={() => handlePresetSelect(pst)}
                      className="text-left px-2 py-1 text-[11px] font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors truncate"
                    >
                      {pst}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={handleSetNow}
                className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                Set Now
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="bg-slate-900 hover:bg-slate-800 text-white px-3 py-1 rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );

  if (withFormField || label || helperText || error) {
    return (
      <div className={cn("flex flex-col gap-1.5", containerClassName, className)}>
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              "text-xs font-semibold text-slate-700 flex items-center gap-1",
              labelClassName
            )}
          >
            {label}
            {required && <span className="text-rose-500 font-bold">*</span>}
          </label>
        )}

        {mainPicker}

        {errorMessage && (
          <p className={cn("text-[11px] text-rose-500 font-medium", errorClassName)}>
            {errorMessage}
          </p>
        )}

        {!errorMessage && helperText && (
          <p className={cn("text-[11px] text-slate-500", helperClassName)}>
            {helperText}
          </p>
        )}
      </div>
    );
  }

  return mainPicker;
};

export default DateTimePicker;
