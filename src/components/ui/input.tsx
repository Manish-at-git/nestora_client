import React, { useState, useEffect, useId } from "react";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "prefix"> {
  // Label & FormField integration
  label?: React.ReactNode;
  required?: boolean;
  error?: string | boolean;
  helperText?: React.ReactNode;
  charCount?: { current?: number; max: number } | number;
  showCount?: boolean;
  withFormField?: boolean;

  // Size Variants
  size?: "sm" | "md" | "lg";

  // Icons & Addons
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  icon?: React.ReactNode; // Alias for leftIcon
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;

  // Interactive Features
  isClearable?: boolean;
  onClear?: () => void;

  // Custom Class Names
  containerClassName?: string;
  inputWrapperClassName?: string;
  labelClassName?: string;
  errorClassName?: string;
  helperClassName?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      containerClassName,
      inputWrapperClassName,
      labelClassName,
      errorClassName,
      helperClassName,
      type = "text",
      size = "md",
      label,
      required = false,
      error,
      helperText,
      charCount,
      showCount,
      withFormField,
      leftIcon,
      rightIcon,
      icon,
      prefix,
      suffix,
      isClearable = false,
      onClear,
      id: customId,
      disabled,
      value,
      defaultValue,
      onChange,
      ...props
    },
    ref
  ) => {
    const autoId = useId();
    const inputId = customId || (label ? `input-${autoId}` : undefined);

    // Value tracking for dynamic character counting and clearable button
    const needsValueTracking = Boolean(charCount || showCount || isClearable);
    const isControlled = value !== undefined;
    const [internalVal, setInternalVal] = useState<string>(() =>
      needsValueTracking && defaultValue !== undefined && defaultValue !== null ? String(defaultValue) : ""
    );

    useEffect(() => {
      if (needsValueTracking && isControlled) {
        setInternalVal(value !== null && value !== undefined ? String(value) : "");
      }
    }, [value, isControlled, needsValueTracking]);

    const currentVal = isControlled ? (value ?? "") : (needsValueTracking ? internalVal : "");
    const currentLength = needsValueTracking ? String(currentVal).length : 0;

    // Resolve charCount dynamically based on input length
    const resolvedCharCount =
      typeof charCount === "number"
        ? { current: currentLength, max: charCount }
        : charCount
        ? {
            current: charCount.current !== undefined ? charCount.current : currentLength,
            max: charCount.max,
          }
        : showCount && props.maxLength
        ? { current: currentLength, max: props.maxLength }
        : undefined;

    // Resolve left icon
    const effectiveLeftIcon = leftIcon || icon;

    // Resolve error state
    const hasError = Boolean(error);
    const errorMessage = typeof error === "string" ? error : undefined;

    // Determine whether to wrap in FormField container
    const shouldRenderFormField =
      withFormField !== false &&
      (withFormField === true ||
        Boolean(label || errorMessage || helperText || resolvedCharCount));

    // Sizing styles (moderately refined height, rounded-lg corners, and balanced padding)
    const isSm = size === "sm";
    const isLg = size === "lg";

    const sizeClasses = isSm
      ? "h-8.5 rounded-lg text-xs px-2.5"
      : isLg
      ? "h-11 rounded-2xl text-base px-3.5"
      : "h-10 rounded-lg text-sm px-3";

    // Handle change
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (needsValueTracking && !isControlled) {
        setInternalVal(e.target.value);
      }
      onChange?.(e);
    };

    // Handle clear
    const hasValue = currentLength > 0;
    const handleClear = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (needsValueTracking && !isControlled) {
        setInternalVal("");
      }
      if (onClear) {
        onClear();
      } else if (onChange) {
        const syntheticEvent = {
          target: { value: "" },
          currentTarget: { value: "" },
        } as React.ChangeEvent<HTMLInputElement>;
        onChange(syntheticEvent);
      }
    };

    // Render the core input with prefix, suffix, and icons
    const renderInputControl = () => (
      <div className={cn("relative flex items-center w-full", inputWrapperClassName)}>
        {/* Optional Prefix Addon */}
        {prefix && (
          <div
            className={cn(
              "inline-flex items-center justify-center border border-r-0 border-slate-200 bg-slate-50/80 text-slate-500 font-medium select-none shrink-0",
              isSm
                ? "h-8.5 rounded-l-md px-2 text-xs"
                : isLg
                ? "h-11 rounded-l-lg px-3 text-sm"
                : "h-10 rounded-l-lg px-2.5 text-xs sm:text-sm",
              hasError && "border-red-400 bg-red-50/30 text-red-700",
              disabled && "bg-slate-100 text-slate-400"
            )}
          >
            {prefix}
          </div>
        )}

        {/* Input Wrapper Container */}
        <div className="relative flex-1 flex items-center">
          {/* Left Icon */}
          {effectiveLeftIcon && (
            <div
              className={cn(
                "pointer-events-none absolute top-1/2 -translate-y-1/2 text-slate-400 flex items-center justify-center shrink-0 z-10",
                isSm ? "left-2.5" : isLg ? "left-3.5" : "left-3"
              )}
            >
              {effectiveLeftIcon}
            </div>
          )}

          {/* Native HTML Input */}
          <input
            id={inputId}
            ref={ref}
            type={type}
            disabled={disabled}
            value={value}
            defaultValue={defaultValue}
            onChange={handleChange}
            className={cn(
              "flex w-full bg-white border border-slate-200 text-slate-800 placeholder:text-slate-400 font-normal transition-all duration-150 shadow-2xs outline-none",
              sizeClasses,
              prefix && "rounded-l-none",
              suffix && "rounded-r-none",
              effectiveLeftIcon && (isSm ? "pl-8" : isLg ? "pl-11" : "pl-9"),
              // Right padding adjustments based on right actions
              (rightIcon || (isClearable && hasValue)) &&
                (isSm ? "pr-8" : isLg ? "pr-11" : "pr-9"),
              "hover:border-slate-300",
              "focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20",
              "disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 disabled:border-slate-200 disabled:shadow-none",
              hasError &&
                "border-red-400 focus:border-red-500 focus:ring-red-500/20 text-slate-900 hover:border-red-400",
              className
            )}
            {...props}
          />

          {/* Right Action Icons / Clear Button */}
          <div
            className={cn(
              "absolute top-1/2 -translate-y-1/2 flex items-center gap-1.5 z-10",
              isSm ? "right-2.5" : isLg ? "right-3" : "right-2.5"
            )}
          >
            {/* Clearable button */}
            {isClearable && hasValue && !disabled && (
              <button
                type="button"
                onClick={handleClear}
                tabIndex={-1}
                className="p-0.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Clear input"
              >
                <X size={isSm ? 12 : isLg ? 15 : 13} />
              </button>
            )}

            {/* Custom Right Icon */}
            {rightIcon && (
              <div className="text-slate-400 pointer-events-none flex items-center">
                {rightIcon}
              </div>
            )}
          </div>
        </div>

        {/* Optional Suffix Addon */}
        {suffix && (
          <div
            className={cn(
              "inline-flex items-center justify-center border border-l-0 border-slate-200 bg-slate-50/80 text-slate-500 font-medium select-none shrink-0",
              isSm
                ? "h-8.5 rounded-r-md px-2 text-xs"
                : isLg
                ? "h-11 rounded-r-lg px-3 text-sm"
                : "h-10 rounded-r-lg px-2.5 text-xs sm:text-sm",
              hasError && "border-red-400 bg-red-50/30 text-red-700",
              disabled && "bg-slate-100 text-slate-400"
            )}
          >
            {suffix}
          </div>
        )}
      </div>
    );

    // If standalone mode without label/error/helper, return input directly
    if (!shouldRenderFormField) {
      return (
        <div className={cn("relative w-full", containerClassName)}>
          {renderInputControl()}
        </div>
      );
    }

    // Otherwise wrap in accessible form field layout
    return (
      <div className={cn("space-y-1.5 w-full", containerClassName)}>
        {/* Label & Character Counter Header */}
        {(label || resolvedCharCount) && (
          <div className="flex items-center justify-between gap-2">
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

            {resolvedCharCount && (
              <span
                className={cn(
                  "text-[11px] font-mono select-none transition-colors",
                  resolvedCharCount.current > resolvedCharCount.max
                    ? "text-rose-600 font-bold"
                    : resolvedCharCount.current === resolvedCharCount.max
                    ? "text-amber-600 font-semibold"
                    : "text-slate-400"
                )}
              >
                {resolvedCharCount.current}/{resolvedCharCount.max}
              </span>
            )}
          </div>
        )}

        {/* Input Control */}
        {renderInputControl()}

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
              <p className={cn("text-xs text-slate-400 font-normal", helperClassName)}>
                {helperText}
              </p>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
