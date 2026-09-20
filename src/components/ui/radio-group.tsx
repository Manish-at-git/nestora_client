import React, { createContext, useContext, useId } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

// --- Context for Compound RadioGroup ---

interface RadioGroupContextValue {
  name: string;
  value?: string;
  onChange?: (value: string) => void;
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "moss" | "slate" | "danger";
  variantStyle?: "default" | "card";
  disabled?: boolean;
}

const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);

// --- Radio Option Interface ---

export interface RadioOption {
  value: string;
  label: React.ReactNode;
  description?: React.ReactNode;
  disabled?: boolean;
  badge?: React.ReactNode;
  icon?: React.ReactNode;
}

// --- Radio Item Component ---

export interface RadioProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "onChange"> {
  label?: React.ReactNode;
  description?: React.ReactNode;
  badge?: React.ReactNode;
  icon?: React.ReactNode;
  value: string;
  checked?: boolean;
  onChange?: (value: string) => void;
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "moss" | "slate" | "danger";
  variantStyle?: "default" | "card";
  error?: string | boolean;
  containerClassName?: string;
  labelClassName?: string;
  descriptionClassName?: string;
}

export const Radio = React.memo(
  React.forwardRef<HTMLInputElement, RadioProps>(
    (
    {
      className,
      containerClassName,
      labelClassName,
      descriptionClassName,
      label,
      description,
      badge,
      icon,
      value,
      checked: checkedProp,
      onChange: onChangeProp,
      name: nameProp,
      size: sizeProp,
      variant: variantProp,
      variantStyle: variantStyleProp,
      disabled: disabledProp,
      error,
      id: customId,
      ...props
    },
    ref
  ) => {
    const autoId = useId();
    const radioId = customId || (label ? `radio-${autoId}` : undefined);
    const ctx = useContext(RadioGroupContext);

    // Resolve context vs direct props
    const name = nameProp || ctx?.name || "radio-group";
    const isChecked = checkedProp !== undefined ? checkedProp : ctx?.value === value;
    const disabled = disabledProp ?? ctx?.disabled ?? false;
    const size = sizeProp || ctx?.size || "md";
    const variant = variantProp || ctx?.variant || "primary";
    const variantStyle = variantStyleProp || ctx?.variantStyle || "default";

    const isSm = size === "sm";
    const isLg = size === "lg";

    // Circle Sizing Tokens
    const outerCircleSize = isSm ? "h-4 w-4" : isLg ? "h-6 w-6" : "h-5 w-5";
    const innerDotSize = isSm ? "h-1.5 w-1.5" : isLg ? "h-2.5 w-2.5" : "h-2 w-2";

    // Color Variants
    const activeColorClasses = {
      primary: "border-blue-600 bg-blue-600 text-white",
      moss: "border-moss bg-moss text-white",
      slate: "border-slate-900 bg-slate-900 text-white",
      danger: "border-rose-600 bg-rose-600 text-white",
    }[variant];

    const cardActiveClass = {
      primary: "border-blue-500 bg-blue-50/30 ring-1 ring-blue-500/80 shadow-xs",
      moss: "border-moss bg-moss-soft/40 ring-1 ring-moss/80 shadow-xs",
      slate: "border-slate-700 bg-slate-50 ring-1 ring-slate-700 shadow-xs",
      danger: "border-rose-500 bg-rose-50/30 ring-1 ring-rose-500/80 shadow-xs",
    }[variant];

    const handleChange = () => {
      if (disabled) return;
      onChangeProp?.(value);
      ctx?.onChange?.(value);
    };

    const hasError = Boolean(error);

    // --- Card Variant Layout ---
    if (variantStyle === "card") {
      return (
        <label
          htmlFor={radioId}
          className={cn(
            "relative flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 bg-white cursor-pointer transition-all duration-150",
            "hover:border-slate-300 hover:bg-slate-50/50",
            isChecked && cardActiveClass,
            disabled && "opacity-50 cursor-not-allowed bg-slate-50 hover:bg-slate-50 hover:border-slate-200",
            hasError && "border-red-400 bg-red-50/20",
            containerClassName
          )}
        >
          <input
            ref={ref}
            type="radio"
            id={radioId}
            name={name}
            value={value}
            checked={isChecked}
            disabled={disabled}
            onChange={handleChange}
            className="sr-only"
            {...props}
          />

          {/* Radio Indicator */}
          <div
            className={cn(
              "rounded-full border border-slate-300 bg-white flex items-center justify-center shrink-0 mt-0.5 transition-all shadow-2xs",
              outerCircleSize,
              isChecked && activeColorClasses,
              disabled && "bg-slate-100 border-slate-200"
            )}
          >
            {isChecked && <span className={cn("rounded-full bg-white", innerDotSize)} />}
          </div>

          {/* Optional Icon Addon */}
          {icon && <div className="text-slate-500 mt-0.5 shrink-0">{icon}</div>}

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className={cn("text-xs font-medium text-slate-800", labelClassName)}>
                {label}
              </span>
              {badge && <div>{badge}</div>}
            </div>
            {description && (
              <p
                className={cn(
                  "text-[11px] text-slate-400 font-normal leading-normal mt-0.5",
                  descriptionClassName
                )}
              >
                {description}
              </p>
            )}
          </div>
        </label>
      );
    }

    // --- Standard Default Inline/Stacked Layout ---
    return (
      <label
        htmlFor={radioId}
        className={cn(
          "inline-flex items-start gap-2.5 cursor-pointer transition-opacity",
          disabled && "opacity-50 cursor-not-allowed",
          containerClassName
        )}
      >
        <input
          ref={ref}
          type="radio"
          id={radioId}
          name={name}
          value={value}
          checked={isChecked}
          disabled={disabled}
          onChange={handleChange}
          className="sr-only"
          {...props}
        />

        {/* Radio Indicator */}
        <div
          className={cn(
            "rounded-full border border-slate-300 bg-white flex items-center justify-center shrink-0 mt-0.5 transition-all shadow-2xs",
            outerCircleSize,
            isChecked && activeColorClasses,
            "hover:border-slate-400",
            disabled && "bg-slate-100 border-slate-200"
          )}
        >
          {isChecked && <span className={cn("rounded-full bg-white", innerDotSize)} />}
        </div>

        {/* Label & Description */}
        {(label || description) && (
          <div className="flex-1 leading-snug">
            {label && (
              <span
                className={cn(
                  "text-xs font-medium text-slate-800 block",
                  disabled && "cursor-not-allowed",
                  labelClassName
                )}
              >
                {label}
              </span>
            )}
            {description && (
              <p
                className={cn(
                  "text-[11px] text-slate-400 font-normal leading-normal mt-0.5",
                  descriptionClassName
                )}
              >
                {description}
              </p>
            )}
          </div>
        )}
      </label>
    );
  }
)
);

// --- Radio Group Container ---

export interface RadioGroupProps {
  name?: string;
  label?: React.ReactNode;
  description?: React.ReactNode;
  required?: boolean;
  options?: RadioOption[];
  children?: React.ReactNode;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  orientation?: "vertical" | "horizontal";
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "moss" | "slate" | "danger";
  variantStyle?: "default" | "card";
  error?: string | boolean;
  helperText?: React.ReactNode;
  className?: string;
  containerClassName?: string;
}

export const RadioGroup: React.FC<RadioGroupProps> = React.memo(({
  name: customName,
  label,
  description,
  required = false,
  options,
  children,
  value: controlledValue,
  defaultValue = "",
  onChange,
  orientation = "vertical",
  disabled = false,
  size = "md",
  variant = "primary",
  variantStyle = "default",
  error,
  helperText,
  className,
  containerClassName,
}) => {
  const autoId = useId();
  const groupName = customName || `radiogroup-${autoId}`;

  const isControlled = controlledValue !== undefined;
  const [internalValue, setInternalValue] = React.useState<string>(defaultValue);

  const currentValue = isControlled ? controlledValue : internalValue;

  const handleValueChange = React.useCallback((newVal: string) => {
    if (!isControlled) {
      setInternalValue(newVal);
    }
    onChange?.(newVal);
  }, [isControlled, onChange]);

  const contextValue = React.useMemo<RadioGroupContextValue>(() => ({
    name: groupName,
    value: currentValue,
    onChange: handleValueChange,
    size,
    variant,
    variantStyle,
    disabled,
  }), [groupName, currentValue, handleValueChange, size, variant, variantStyle, disabled]);

  const errorMessage = typeof error === "string" ? error : undefined;

  return (
    <RadioGroupContext.Provider value={contextValue}>
      <div className={cn("space-y-2", containerClassName)} role="radiogroup">
        {/* Group Header Label & Description */}
        {(label || description) && (
          <div className="space-y-0.5">
            {label && (
              <span className="block text-xs font-semibold text-slate-700">
                {label} {required && <span className="text-red-500 font-bold ml-0.5">*</span>}
              </span>
            )}
            {description && (
              <p className="text-[11px] text-slate-400 font-normal">{description}</p>
            )}
          </div>
        )}

        {/* Options or Children */}
        <div
          className={cn(
            "gap-3",
            orientation === "horizontal"
              ? "flex flex-wrap items-center"
              : "flex flex-col space-y-2",
            className
          )}
        >
          {options
            ? options.map((opt) => (
                <Radio
                  key={opt.value}
                  value={opt.value}
                  label={opt.label}
                  description={opt.description}
                  badge={opt.badge}
                  icon={opt.icon}
                  disabled={opt.disabled}
                />
              ))
            : children}
        </div>

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
              <p className="text-xs text-red-600 font-normal">
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
              <p className="text-xs text-slate-400 font-normal">{helperText}</p>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </RadioGroupContext.Provider>
  );
});

Radio.displayName = "Radio";
RadioGroup.displayName = "RadioGroup";

export default RadioGroup;
