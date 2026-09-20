import React, { useState, useEffect, useMemo, useRef } from "react";
import { Clock, Check, X, ChevronDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface TimePickerProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  isClearable?: boolean;
  size?: "sm" | "md" | "lg";
  minuteStep?: 1 | 5 | 10 | 15 | 30;
  format?: "12h" | "24h";
  error?: string | boolean;
  className?: string;
  popoverClassName?: string;
  id?: string;
  presets?: string[];
}

const DEFAULT_PRESETS_12H = [
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
  "06:00 PM",
  "07:00 PM",
];

/**
 * Parse any time string (HH:mm, H:mm, hh:mm a, hh:mma) into { hour12, minute, period, raw24 }
 */
function parseTimeString(timeStr?: string): {
  hour12: number;
  minute: number;
  period: "AM" | "PM";
  raw24: string;
} | null {
  if (!timeStr || !timeStr.trim()) return null;
  const str = timeStr.trim();

  // Check 12-hour format e.g. "10:30 AM" or "2:15pm"
  const match12 = str.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (match12) {
    let h = parseInt(match12[1], 10);
    const m = parseInt(match12[2], 10);
    const period = match12[3].toUpperCase() as "AM" | "PM";
    if (h < 1 || h > 12 || m < 0 || m > 59) return null;
    const h24 = period === "PM" ? (h === 12 ? 12 : h + 12) : h === 12 ? 0 : h;
    const raw24 = `${String(h24).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    return { hour12: h, minute: m, period, raw24 };
  }

  // Check 24-hour format e.g. "14:30" or "09:00"
  const match24 = str.match(/^(\d{1,2}):(\d{2})$/);
  if (match24) {
    const h24 = parseInt(match24[1], 10);
    const m = parseInt(match24[2], 10);
    if (h24 < 0 || h24 > 23 || m < 0 || m > 59) return null;
    const period: "AM" | "PM" = h24 >= 12 ? "PM" : "AM";
    const hour12 = h24 % 12 || 12;
    const raw24 = `${String(h24).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    return { hour12, minute: m, period, raw24 };
  }

  return null;
}

/**
 * Format hours, minutes and period into 24-hour "HH:mm" (standard API string)
 */
function to24HourString(hour12: number, minute: number, period: "AM" | "PM"): string {
  const h24 = period === "PM" ? (hour12 === 12 ? 12 : hour12 + 12) : hour12 === 12 ? 0 : hour12;
  return `${String(h24).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

/**
 * Format into human-friendly 12-hour string e.g. "10:00 AM"
 */
function to12HourString(hour12: number, minute: number, period: "AM" | "PM"): string {
  return `${String(hour12).padStart(2, "0")}:${String(minute).padStart(2, "0")} ${period}`;
}

export const TimePicker: React.FC<TimePickerProps> = ({
  value,
  onChange,
  placeholder = "Select time",
  disabled = false,
  isClearable = true,
  size = "md",
  minuteStep = 5,
  format = "12h",
  error = false,
  className,
  popoverClassName,
  id,
  presets = DEFAULT_PRESETS_12H,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const parsed = useMemo(() => parseTimeString(value), [value]);

  const [selectedHour, setSelectedHour] = useState<number>(parsed?.hour12 ?? 10);
  const [selectedMinute, setSelectedMinute] = useState<number>(
    parsed ? Math.round(parsed.minute / minuteStep) * minuteStep : 0
  );
  const [selectedPeriod, setSelectedPeriod] = useState<"AM" | "PM">(parsed?.period ?? "AM");

  // Keep internal state in sync with external value
  useEffect(() => {
    if (parsed) {
      setSelectedHour(parsed.hour12);
      setSelectedMinute(parsed.minute);
      setSelectedPeriod(parsed.period);
    }
  }, [value, parsed]);

  const hourList = useMemo(() => [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], []);

  const minuteList = useMemo(() => {
    const list: number[] = [];
    for (let i = 0; i < 60; i += minuteStep) {
      list.push(i);
    }
    return list;
  }, [minuteStep]);

  const handleUpdate = (h: number, m: number, p: "AM" | "PM") => {
    setSelectedHour(h);
    setSelectedMinute(m);
    setSelectedPeriod(p);
    const time24 = to24HourString(h, m, p);
    onChange?.(time24);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.("");
  };

  const handleSelectPreset = (presetStr: string) => {
    const p = parseTimeString(presetStr);
    if (p) {
      handleUpdate(p.hour12, p.minute, p.period);
      setIsOpen(false);
    }
  };

  const handleSetCurrentTime = () => {
    const now = new Date();
    let h24 = now.getHours();
    let m = now.getMinutes();
    m = Math.round(m / minuteStep) * minuteStep;
    if (m === 60) {
      m = 0;
      h24 = (h24 + 1) % 24;
    }
    const period: "AM" | "PM" = h24 >= 12 ? "PM" : "AM";
    const h12 = h24 % 12 || 12;
    handleUpdate(h12, m, period);
    setIsOpen(false);
  };

  const displayValue = useMemo(() => {
    if (!parsed) return "";
    return to12HourString(parsed.hour12, parsed.minute, parsed.period);
  }, [parsed]);

  const isSm = size === "sm";
  const isLg = size === "lg";
  const hasError = Boolean(error);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          id={id}
          disabled={disabled}
          className={cn(
            "flex w-full items-center justify-between bg-white border border-slate-200 text-slate-800 transition-all duration-200 select-none outline-none font-normal",
            "hover:border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20",
            "disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 disabled:border-slate-200",
            isSm
              ? "h-9 rounded-lg text-xs px-3 shadow-xs gap-1.5"
              : isLg
              ? "h-12 rounded-lg text-base px-4 shadow-xs gap-2.5"
              : "h-11 rounded-lg text-sm px-3.5 shadow-xs gap-2",
            hasError && "border-red-500 focus:border-red-500 focus:ring-red-500/20 text-slate-800",
            className
          )}
        >
          <div className="flex items-center gap-2.5 min-w-0 flex-1 text-left">
            <Clock
              size={isSm ? 14 : isLg ? 18 : 15}
              className={cn("shrink-0", parsed ? "text-slate-600" : "text-slate-400")}
            />
            {displayValue ? (
              <span className="font-medium text-slate-800 truncate">{displayValue}</span>
            ) : (
              <span className="text-slate-400 truncate">{placeholder}</span>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0 ml-1">
            {isClearable && Boolean(value) && !disabled && (
              <span
                role="button"
                tabIndex={-1}
                aria-label="Clear time"
                onClick={handleClear}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X size={14} />
              </span>
            )}
            <ChevronDown
              size={isSm ? 14 : isLg ? 18 : 16}
              className={cn(
                "text-slate-400 transition-transform duration-200",
                isOpen && "rotate-180"
              )}
            />
          </div>
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        sideOffset={6}
        className={cn(
          "w-72 p-3.5 bg-white rounded-2xl shadow-xl border border-slate-200/90 z-50 overflow-hidden flex flex-col",
          popoverClassName
        )}
      >
        {/* Header Preview & "Now" Button */}
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
            <Clock size={14} className="text-blue-600" />
            <span>
              {to12HourString(selectedHour, selectedMinute, selectedPeriod)}
            </span>
          </div>
          <button
            type="button"
            onClick={handleSetCurrentTime}
            className="text-[11px] font-medium text-blue-600 hover:text-blue-700 hover:underline px-1.5 py-0.5 rounded"
          >
            Current Time
          </button>
        </div>

        {/* 3 Columns: Hour, Minute, Period */}
        <div className="grid grid-cols-3 gap-2 h-44 min-h-0 py-1">
          {/* Hour Column */}
          <div className="flex flex-col h-full min-h-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center mb-1 shrink-0">
              Hour
            </span>
            <div className="flex-1 overflow-y-auto min-h-0 space-y-1 pr-1 overscroll-contain">
              {hourList.map((h) => {
                const isSelected = selectedHour === h;
                return (
                  <button
                    key={h}
                    type="button"
                    onClick={() => handleUpdate(h, selectedMinute, selectedPeriod)}
                    className={cn(
                      "w-full py-1.5 rounded-lg text-xs font-medium text-center transition-all",
                      isSelected
                        ? "bg-blue-600 text-white shadow-xs font-semibold"
                        : "text-slate-700 hover:bg-slate-100"
                    )}
                  >
                    {String(h).padStart(2, "0")}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Minute Column */}
          <div className="flex flex-col h-full min-h-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center mb-1 shrink-0">
              Minute
            </span>
            <div className="flex-1 overflow-y-auto min-h-0 space-y-1 pr-1 overscroll-contain">
              {minuteList.map((m) => {
                const isSelected = selectedMinute === m;
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => handleUpdate(selectedHour, m, selectedPeriod)}
                    className={cn(
                      "w-full py-1.5 rounded-lg text-xs font-medium text-center transition-all",
                      isSelected
                        ? "bg-blue-600 text-white shadow-xs font-semibold"
                        : "text-slate-700 hover:bg-slate-100"
                    )}
                  >
                    {String(m).padStart(2, "0")}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Period Column */}
          <div className="flex flex-col h-full min-h-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center mb-1 shrink-0">
              Period
            </span>
            <div className="flex flex-col gap-1.5 pt-0.5 shrink-0">
              {(["AM", "PM"] as const).map((p) => {
                const isSelected = selectedPeriod === p;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => handleUpdate(selectedHour, selectedMinute, p)}
                    className={cn(
                      "w-full py-2.5 rounded-lg text-xs font-semibold text-center transition-all",
                      isSelected
                        ? "bg-blue-600 text-white shadow-xs"
                        : "text-slate-700 hover:bg-slate-100 border border-slate-200"
                    )}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Quick Presets */}
        {presets && presets.length > 0 && (
          <div className="mt-2.5 pt-2 border-t border-slate-100 shrink-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
              Quick Select
            </span>
            <div className="grid grid-cols-3 gap-1">
              {presets.slice(0, 6).map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className="px-1.5 py-1 rounded-md text-[11px] font-medium bg-slate-50 text-slate-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 border border-slate-200/80 transition-colors text-center truncate"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default TimePicker;
