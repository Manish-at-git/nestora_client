import React, { useState, useEffect, useId, forwardRef } from "react";
import { ChevronUp, ChevronDown, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface NumberInputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "size" | "prefix" | "onChange" | "value" | "defaultValue" | "type"
  > {
  // Value & Change handlers
  value?: number | string | null;
  defaultValue?: number | string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onValueChange?: (value: number | undefined, valueString: string) => void;

  // Number Constraints & Formatting
  min?: number;
  max?: number;
  step?: number;
  allowDecimals?: boolean;
  allowNegative?: boolean;
  decimalScale?: number; // Max decimal places (e.g., 2)
  clampOnBlur?: boolean; // Clamp value between min/max on blur (default true)

  // Label & FormField integration
  label?: React.ReactNode;
  required?: boolean;
  error?: string | boolean;
  helperText?: React.ReactNode;
  charCount?: { current: number; max: number };
  withFormField?: boolean;

  // Size Variants
  size?: "sm" | "md" | "lg";

  // Icons & Addons
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  icon?: React.ReactNode;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;

  // Steppers & Reset
  showSteppers?: boolean;
  isClearable?: boolean;
  onClear?: () => void;

  // Custom Class Names
  containerClassName?: string;
  inputWrapperClassName?: string;
  labelClassName?: string;
  errorClassName?: string;
  helperClassName?: string;
}

/**
 * Pure sanitizer for number strings.
 * Disallows `e`, `E`, `+`, letters and invalid symbols.
 * Automatically transforms `.2` into `0.2`.
 * Normalizes leading zeros like `0000.2` into `0.2` and `0005` into `5`.
 */
export function sanitizeNumberInput(
  raw: string,
  options: {
    allowDecimals?: boolean;
    allowNegative?: boolean;
    decimalScale?: number;
  } = {}
): string {
  const { allowDecimals = true, allowNegative = false, decimalScale } = options;
  if (!raw) return "";

  let cleaned = raw.trim();

  // Check negative sign
  let isNegative = false;
  if (allowNegative && cleaned.startsWith("-")) {
    isNegative = true;
    cleaned = cleaned.slice(1);
  }

  // Remove any non-numeric and non-decimal characters (strips e, E, +, alphabets, symbols)
  if (allowDecimals) {
    cleaned = cleaned.replace(/[^0-9.]/g, "");
  } else {
    cleaned = cleaned.replace(/[^0-9]/g, "");
  }

  if (!cleaned) {
    return isNegative ? "-" : "";
  }

  // Handle decimal normalization
  if (allowDecimals) {
    const parts = cleaned.split(".");
    const integerPart = parts[0];
    let decimalPart = parts.length > 1 ? parts.slice(1).join("") : null;

    if (decimalScale !== undefined && decimalPart !== null) {
      decimalPart = decimalPart.slice(0, decimalScale);
    }

    // Format integer part:
    // If empty and decimal point exists (e.g. ".2" or ".") -> "0"
    let formattedInt = integerPart;
    if (formattedInt === "" && decimalPart !== null) {
      formattedInt = "0";
    } else if (formattedInt !== "") {
      // Remove leading zeros, preserving single "0" (e.g., "0000.2" -> "0.2", "005" -> "5")
      formattedInt = formattedInt.replace(/^0+(?=\d)/, "");
    }

    let result = formattedInt;
    if (decimalPart !== null) {
      result = `${formattedInt}.${decimalPart}`;
    }

    return isNegative ? `-${result}` : result;
  } else {
    // Integer only
    const formattedInt = cleaned.replace(/^0+(?=\d)/, "");
    return isNegative ? `-${formattedInt}` : formattedInt;
  }
}

export const NumberInput = React.memo(
  forwardRef<HTMLInputElement, NumberInputProps>(
    (
    {
      className,
      containerClassName,
      inputWrapperClassName,
      labelClassName,
      errorClassName,
      helperClassName,
      size = "md",
      value: controlledValue,
      defaultValue,
      onChange,
      onValueChange,
      min,
      max,
      step = 1,
      allowDecimals = true,
      allowNegative = false,
      decimalScale,
      clampOnBlur = true,
      label,
      required = false,
      error,
      helperText,
      charCount,
      withFormField,
      leftIcon,
      rightIcon,
      icon,
      prefix,
      suffix,
      showSteppers = false,
      isClearable = false,
      onClear,
      id: customId,
      disabled,
      placeholder,
      onKeyDown,
      onBlur,
      ...props
    },
    ref
  ) => {
    const autoId = useId();
    const inputId = customId || (label ? `number-input-${autoId}` : undefined);

    // Track internal string state
    const isControlled = controlledValue !== undefined;
    const initialRaw = isControlled
      ? controlledValue === null || controlledValue === undefined
        ? ""
        : String(controlledValue)
      : defaultValue !== undefined && defaultValue !== null
      ? String(defaultValue)
      : "";

    const [displayValue, setDisplayValue] = useState<string>(() =>
      sanitizeNumberInput(initialRaw, { allowDecimals, allowNegative, decimalScale })
    );

    // Sync controlled value changes
    useEffect(() => {
      if (isControlled) {
        const nextStr =
          controlledValue === null || controlledValue === undefined
            ? ""
            : String(controlledValue);
        const nextSanitized = sanitizeNumberInput(nextStr, {
          allowDecimals,
          allowNegative,
          decimalScale,
        });
        setDisplayValue((prev) => (prev === nextSanitized ? prev : nextSanitized));
      }
    }, [controlledValue, allowDecimals, allowNegative, decimalScale, isControlled]);

    // Resolve icons
    const effectiveLeftIcon = leftIcon || icon;

    // Resolve error state
    const hasError = Boolean(error);
    const errorMessage = typeof error === "string" ? error : undefined;

    // Determine whether to wrap in FormField container
    const shouldRenderFormField =
      withFormField !== false &&
      (withFormField === true || Boolean(label || errorMessage || helperText || charCount));

    // Sizing styles
    const isSm = size === "sm";
    const isLg = size === "lg";

    const sizeClasses = isSm
      ? "h-8.5 rounded-lg text-xs px-2.5"
      : isLg
      ? "h-11 rounded-lg text-base px-3.5"
      : "h-10 rounded-lg text-sm px-3";

    // Handle string change and notify parent handlers
    const updateValue = (
      rawString: string,
      originalEvent?: React.ChangeEvent<HTMLInputElement>
    ) => {
      const sanitized = sanitizeNumberInput(rawString, {
        allowDecimals,
        allowNegative,
        decimalScale,
      });

      setDisplayValue((prev) => (prev === sanitized ? prev : sanitized));

      const parsedNumber =
        sanitized === "" || sanitized === "-" || sanitized === "." || sanitized === "-."
          ? undefined
          : Number(sanitized);

      onValueChange?.(isNaN(parsedNumber as number) ? undefined : parsedNumber, sanitized);

      if (onChange) {
        if (originalEvent) {
          originalEvent.target.value = sanitized;
          onChange(originalEvent);
        } else {
          const syntheticEvent = {
            target: { value: sanitized },
            currentTarget: { value: sanitized },
          } as React.ChangeEvent<HTMLInputElement>;
          onChange(syntheticEvent);
        }
      }
    };

    // Block non-numeric keys in onKeyDown (disallowing 'e', 'E', '+', etc.)
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      const allowedKeys = [
        "Backspace",
        "Delete",
        "Tab",
        "Escape",
        "Enter",
        "ArrowLeft",
        "ArrowRight",
        "ArrowUp",
        "ArrowDown",
        "Home",
        "End",
      ];

      // Allow shortcut keys (Ctrl/Cmd + A, C, V, X, Z)
      if (e.ctrlKey || e.metaKey) {
        onKeyDown?.(e);
        return;
      }

      if (allowedKeys.includes(e.key)) {
        if (e.key === "ArrowUp") {
          e.preventDefault();
          handleStep(1);
        } else if (e.key === "ArrowDown") {
          e.preventDefault();
          handleStep(-1);
        }
        onKeyDown?.(e);
        return;
      }

      // Block 'e', 'E', '+' and invalid characters explicitly
      if (e.key === "e" || e.key === "E" || e.key === "+") {
        e.preventDefault();
        return;
      }

      // Block '-' if allowNegative is false
      if (e.key === "-" && !allowNegative) {
        e.preventDefault();
        return;
      }

      // Block '.' if allowDecimals is false or already has a dot
      if (e.key === "." && (!allowDecimals || displayValue.includes("."))) {
        e.preventDefault();
        return;
      }

      // Block any non-digit character
      if (!/^[0-9.-]$/.test(e.key)) {
        e.preventDefault();
        return;
      }

      onKeyDown?.(e);
    };

    // Handle Input Change
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      updateValue(e.target.value, e);
    };

    // Handle Blur with optional clamping and trailing dot cleanup
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      let finalVal = displayValue;

      // Clean trailing dot (e.g. "5." -> "5")
      if (finalVal.endsWith(".")) {
        finalVal = finalVal.slice(0, -1);
      }

      if (finalVal !== "" && finalVal !== "-") {
        let num = Number(finalVal);
        if (!isNaN(num) && clampOnBlur) {
          if (min !== undefined && num < min) {
            num = min;
          }
          if (max !== undefined && num > max) {
            num = max;
          }
          finalVal = String(num);
        }
      } else if (finalVal === "-") {
        finalVal = "";
      }

      if (finalVal !== displayValue) {
        updateValue(finalVal);
      }

      onBlur?.(e);
    };

    // Handle Step Increment / Decrement
    const handleStep = (direction: 1 | -1) => {
      if (disabled) return;
      const currentNum = displayValue === "" || isNaN(Number(displayValue)) ? 0 : Number(displayValue);
      let nextNum = currentNum + direction * step;

      if (min !== undefined && nextNum < min) nextNum = min;
      if (max !== undefined && nextNum > max) nextNum = max;

      // Handle precision issues with decimals
      if (allowDecimals && decimalScale !== undefined) {
        nextNum = Number(nextNum.toFixed(decimalScale));
      } else if (allowDecimals && String(step).includes(".")) {
        const stepDecimals = String(step).split(".")[1]?.length || 2;
        nextNum = Number(nextNum.toFixed(stepDecimals));
      }

      updateValue(String(nextNum));
    };

    // Handle Clear
    const hasValue = displayValue.length > 0;
    const handleClear = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (onClear) {
        onClear();
      }
      updateValue("");
    };

    // Render the core input with prefix, suffix, steppers, and icons
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

          {/* HTML Input (type="text" with inputMode="decimal" to avoid native browser 'e' handling) */}
          <input
            id={inputId}
            ref={ref}
            type="text"
            inputMode={allowDecimals ? "decimal" : "numeric"}
            disabled={disabled}
            value={displayValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            placeholder={placeholder}
            className={cn(
              "flex w-full bg-white border border-slate-200 text-slate-800 placeholder:text-slate-400 font-normal transition-all duration-150 shadow-2xs outline-none font-mono",
              sizeClasses,
              prefix && "rounded-l-none",
              suffix && "rounded-r-none",
              effectiveLeftIcon && (isSm ? "pl-8" : isLg ? "pl-11" : "pl-9"),
              // Right padding adjustments based on steppers or right actions
              (rightIcon || (isClearable && hasValue) || showSteppers) &&
                (showSteppers
                  ? isSm
                    ? "pr-14"
                    : isLg
                    ? "pr-16"
                    : "pr-14"
                  : isSm
                  ? "pr-8"
                  : isLg
                  ? "pr-11"
                  : "pr-9"),
              "hover:border-slate-300",
              "focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20",
              "disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 disabled:border-slate-200 disabled:shadow-none",
              hasError &&
                "border-red-400 focus:border-red-500 focus:ring-red-500/20 text-slate-900 hover:border-red-400",
              className
            )}
            {...props}
          />

          {/* Right Action Icons / Clear Button / Stepper Controls */}
          <div
            className={cn(
              "absolute top-1/2 -translate-y-1/2 flex items-center gap-1 z-10",
              isSm ? "right-1.5" : isLg ? "right-2.5" : "right-2"
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
            {rightIcon && !showSteppers && (
              <div className="text-slate-400 pointer-events-none flex items-center pr-1">
                {rightIcon}
              </div>
            )}

            {/* Stepper Buttons (Up / Down) */}
            {showSteppers && !disabled && (
              <div className="flex flex-col border-l border-slate-200 pl-1 my-0.5">
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => handleStep(1)}
                  className="px-1 py-0.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xs transition-colors cursor-pointer"
                  title="Increment"
                >
                  <ChevronUp size={isSm ? 10 : 12} />
                </button>
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => handleStep(-1)}
                  className="px-1 py-0.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xs transition-colors cursor-pointer"
                  title="Decrement"
                >
                  <ChevronDown size={isSm ? 10 : 12} />
                </button>
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
        {(label || charCount) && (
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

            {charCount && (
              <span className="text-[11px] text-slate-400 font-mono select-none">
                {charCount.current}/{charCount.max}
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
)
);

NumberInput.displayName = "NumberInput";
export default NumberInput;
