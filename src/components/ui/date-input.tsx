import React from "react";
import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DateInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  leftIcon?: React.ReactNode;
}

export const DateInput = React.memo(
  React.forwardRef<HTMLInputElement, DateInputProps>(
    ({ className, type = "date", error, leftIcon, ...props }, ref) => {
      return (
        <div className="relative w-full">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none flex items-center">
            {leftIcon || <Calendar className="w-4 h-4" />}
          </div>
          <input
            type={type}
            className={cn(
              "flex h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3.5 py-2 text-sm text-slate-800 transition-all duration-200",
              "focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20",
              "disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400",
              "[&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-60 hover:[&::-webkit-calendar-picker-indicator]:opacity-100",
              error && "border-red-500 focus:border-red-500 focus:ring-red-500/20 text-red-900",
              className
            )}
            ref={ref}
            {...props}
          />
        </div>
      );
    }
  )
);

DateInput.displayName = "DateInput";
