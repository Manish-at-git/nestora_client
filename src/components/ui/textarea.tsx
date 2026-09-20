import React, { useState, useEffect, useId } from "react";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "size"> {
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

  // Resize Options
  resize?: "none" | "vertical" | "horizontal" | "both";

  // Interactive Features
  isClearable?: boolean;
  onClear?: () => void;

  // Custom Class Names
  containerClassName?: string;
  textareaWrapperClassName?: string;
  labelClassName?: string;
  errorClassName?: string;
  helperClassName?: string;
}

export const Textarea = React.memo(
  React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    (
    {
      className,
      containerClassName,
      textareaWrapperClassName,
      labelClassName,
      errorClassName,
      helperClassName,
      size = "md",
      resize = "vertical",
      label,
      required = false,
      error,
      helperText,
      charCount,
      showCount,
      withFormField,
      isClearable = false,
      onClear,
      id: customId,
      disabled,
      value,
      defaultValue,
      onChange,
      rows = 3,
      ...props
    },
    ref
  ) => {
    const autoId = useId();
    const textareaId = customId || (label ? `textarea-${autoId}` : undefined);

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

    // Resolve error state
    const hasError = Boolean(error);
    const errorMessage = typeof error === "string" ? error : undefined;

    // Determine whether to wrap in FormField container
    const shouldRenderFormField =
      withFormField !== false &&
      (withFormField === true ||
        Boolean(label || errorMessage || helperText || resolvedCharCount));

    // Sizing styles (matching Input standards: rounded-lg corners, balanced padding)
    const isSm = size === "sm";
    const isLg = size === "lg";

    const sizeClasses = isSm
      ? "min-h-[70px] rounded-lg text-xs px-2.5 py-2"
      : isLg
      ? "min-h-[110px] rounded-2xl text-base px-3.5 py-3"
      : "min-h-[90px] rounded-lg text-sm px-3 py-2.5";

    const resizeClasses = {
      none: "resize-none",
      vertical: "resize-y",
      horizontal: "resize-x",
      both: "resize",
    }[resize];

    // Handle change
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
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
        } as React.ChangeEvent<HTMLTextAreaElement>;
        onChange(syntheticEvent);
      }
    };

    // Render the core textarea control
    const renderTextareaControl = () => (
      <div className={cn("relative w-full", textareaWrapperClassName)}>
        <textarea
          id={textareaId}
          ref={ref}
          rows={rows}
          disabled={disabled}
          value={value}
          defaultValue={defaultValue}
          onChange={handleChange}
          className={cn(
            "flex w-full bg-white border border-slate-200 text-slate-800 placeholder:text-slate-400 font-normal leading-relaxed transition-all duration-150 shadow-2xs outline-none",
            sizeClasses,
            resizeClasses,
            isClearable && hasValue && "pr-8",
            "hover:border-slate-300",
            "focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20",
            "disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 disabled:border-slate-200 disabled:shadow-none",
            hasError &&
              "border-red-400 focus:border-red-500 focus:ring-red-500/20 text-slate-900 hover:border-red-400",
            className
          )}
          {...props}
        />

        {/* Clear Button in Top Right */}
        {isClearable && hasValue && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            tabIndex={-1}
            className="absolute top-2.5 right-2.5 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Clear text"
          >
            <X size={isSm ? 12 : isLg ? 15 : 13} />
          </button>
        )}
      </div>
    );

    // If standalone mode without label/error/helper/charCount, return textarea directly
    if (!shouldRenderFormField) {
      return (
        <div className={cn("relative w-full", containerClassName)}>
          {renderTextareaControl()}
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
                htmlFor={textareaId}
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

        {/* Textarea Control */}
        {renderTextareaControl()}

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
)
);

Textarea.displayName = "Textarea";
export default Textarea;
