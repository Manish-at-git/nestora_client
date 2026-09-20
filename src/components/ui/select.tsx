import React, { useState, useEffect, useId } from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { Check, ChevronDown, ChevronUp, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface SelectOptionItem {
  value?: string | number;
  label?: React.ReactNode;
  id?: string | number;
  name?: string;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
  group?: string;
}

export type SelectOption = SelectOptionItem | string | number;

export interface SelectProps {
  id?: string;
  name?: string;
  value?: string | number;
  defaultValue?: string | number;
  onValueChange?: (value: string) => void;
  onChange?: (eventOrValue: any) => void;
  options?: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  error?: boolean | string;
  icon?: React.ReactNode;
  clearable?: boolean;
  onClear?: () => void;
  size?: "sm" | "md" | "lg";
  showAllOption?: boolean;
  allOptionLabel?: string;
  allOptionValue?: string;
  className?: string;
  containerClassName?: string;
  contentClassName?: string;
  children?: React.ReactNode;
  label?: React.ReactNode;
  helperText?: React.ReactNode;
  labelClassName?: string;
  errorClassName?: string;
  helperClassName?: string;
}

export interface MultiSelectOptionItem {
  value: string | number;
  label: string;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
  group?: string;
}

export type MultiSelectOption = MultiSelectOptionItem | string | number;

export interface MultiSelectProps {
  id?: string;
  name?: string;
  value?: (string | number)[];
  defaultValue?: (string | number)[];
  onValueChange?: (values: string[]) => void;
  onChange?: (eventOrValues: any) => void;
  options?: MultiSelectOption[];
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  error?: boolean | string;
  icon?: React.ReactNode;
  clearable?: boolean;
  selectAllOption?: boolean;
  selectAllLabel?: string;
  maxDisplayTags?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
  containerClassName?: string;
  contentClassName?: string;
  label?: React.ReactNode;
  helperText?: React.ReactNode;
  labelClassName?: string;
  errorClassName?: string;
  helperClassName?: string;
}

// Special sentinel key for empty strings in Radix Select
const EMPTY_VALUE_SENTINEL = "__SELECT_EMPTY_VALUE__";

// Helper to stop pointer, mouse and click bubbling to trigger
const stopEvent = (e: React.SyntheticEvent | Event) => {
  e.stopPropagation();
  e.preventDefault();
};

// ============================================================================
// 1. SINGLE SELECT COMPONENT
// ============================================================================

export const Select = React.forwardRef<HTMLButtonElement, SelectProps>(
  (
    {
      id,
      name,
      value,
      defaultValue,
      onValueChange,
      onChange,
      options,
      placeholder = "Select an option...",
      disabled = false,
      required = false,
      error = false,
      icon,
      clearable = false,
      onClear,
      size = "md",
      showAllOption = false,
      allOptionLabel = "All",
      allOptionValue = "",
      className,
      containerClassName,
      contentClassName,
      children,
      label,
      helperText,
      labelClassName,
      errorClassName,
      helperClassName,
    },
    ref
  ) => {
    const autoId = useId();
    const selectId = id || (label ? `select-${autoId}` : undefined);
    const isSm = size === "sm";
    const isLg = size === "lg";
    const effectivePlaceholder = placeholder || "Select an option...";

    // Normalize options list
    const normalizedOptions: {
      value: string;
      label: React.ReactNode;
      description?: React.ReactNode;
      icon?: React.ReactNode;
      disabled?: boolean;
      group?: string;
    }[] = [];

    if (showAllOption) {
      normalizedOptions.push({
        value: allOptionValue === "" ? EMPTY_VALUE_SENTINEL : String(allOptionValue),
        label: allOptionLabel,
        disabled: false,
      });
    }

    if (options && Array.isArray(options)) {
      options.forEach((opt) => {
        if (typeof opt === "string" || typeof opt === "number") {
          normalizedOptions.push({
            value: String(opt),
            label: String(opt),
            disabled: false,
          });
        } else if (opt) {
          const rawVal =
            opt.value !== undefined
              ? String(opt.value)
              : opt.id !== undefined
              ? String(opt.id)
              : "";
          const lbl =
            opt.label !== undefined
              ? opt.label
              : opt.name !== undefined
              ? opt.name
              : rawVal;

          const val = rawVal === "" ? EMPTY_VALUE_SENTINEL : rawVal;

          normalizedOptions.push({
            value: val,
            label: lbl,
            description: opt.description,
            icon: opt.icon,
            disabled: Boolean(opt.disabled),
            group: opt.group,
          });
        }
      });
    }

    const [isOpen, setIsOpen] = useState(false);
    const [uncontrolledValue, setUncontrolledValue] = useState<string>(
      defaultValue !== undefined ? String(defaultValue) : ""
    );

    // Current resolved value (controlled vs uncontrolled, handles objects defensively)
    const currentValue =
      value !== undefined
        ? typeof value === "object"
          ? (value as any)?.target?.value ?? ""
          : String(value)
        : uncontrolledValue;

    // Resolve the selected option. An explicit "all" option uses an empty
    // external value, so it must remain visible instead of falling back to
    // the placeholder.
    const matchingOption = normalizedOptions.find((option) => {
      if (currentValue === "" || currentValue === undefined) {
        return showAllOption && option.value === EMPTY_VALUE_SENTINEL;
      }

      return option.value === currentValue;
    });

    const isOptionSelected = Boolean(matchingOption);
    const internalValue = isOptionSelected ? matchingOption!.value : undefined;

    const internalDefaultValue =
      defaultValue !== undefined
        ? defaultValue === ""
          ? normalizedOptions.some((o) => o.value === EMPTY_VALUE_SENTINEL)
            ? EMPTY_VALUE_SENTINEL
            : undefined
          : String(defaultValue)
        : undefined;

    const handleValueChange = (newVal: string) => {
      const resolvedVal = newVal === EMPTY_VALUE_SENTINEL ? "" : newVal;

      if (value === undefined) {
        setUncontrolledValue(resolvedVal);
      }

      if (onValueChange) {
        onValueChange(resolvedVal);
      }

      if (onChange) {
        // Support both direct value and standard synthetic event object
        const syntheticEvent = {
          target: { value: resolvedVal, name },
          currentTarget: { value: resolvedVal, name },
          persist: () => {},
        };
        onChange(syntheticEvent);
      }
    };

    const handleClear = (e: React.MouseEvent | React.PointerEvent) => {
      stopEvent(e);
      setIsOpen(false);
      if (value === undefined) {
        setUncontrolledValue("");
      }
      handleValueChange("");
      if (onClear) onClear();
    };

    const hasError = Boolean(error);
    const errorMessage = typeof error === "string" ? error : undefined;
    const shouldRenderWrapper = Boolean(label || errorMessage || helperText);
    const hasValue = isOptionSelected && currentValue !== "";

    // Group options if any option has group
    const groupedOptions = normalizedOptions.reduce<Record<string, typeof normalizedOptions>>(
      (acc, opt) => {
        const grp = opt.group || "__default__";
        if (!acc[grp]) acc[grp] = [];
        acc[grp].push(opt);
        return acc;
      },
      {}
    );

    const hasMultipleGroups = Object.keys(groupedOptions).length > 1;

    const renderControl = (
      <div className={cn("relative w-full", !shouldRenderWrapper && containerClassName)}>
        <SelectPrimitive.Root
          open={isOpen}
          onOpenChange={setIsOpen}
          value={internalValue}
          defaultValue={internalDefaultValue}
          onValueChange={handleValueChange}
          disabled={disabled}
          required={required}
          name={name}
        >
          <SelectPrimitive.Trigger
            ref={ref}
            id={selectId}
            className={cn(
              "flex w-full items-center justify-between bg-white border border-slate-200 text-slate-800 transition-all duration-200 select-none outline-none font-normal",
              "hover:border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20",
              "disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 disabled:border-slate-200",
              "data-[placeholder]:text-slate-400",
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
              {icon && (
                <span className="text-slate-400 shrink-0 flex items-center">{icon}</span>
              )}
              {isOptionSelected && matchingOption ? (
                <SelectPrimitive.Value placeholder={effectivePlaceholder}>
                  <span className="flex items-center gap-2 truncate">
                    {matchingOption.icon && <span className="shrink-0">{matchingOption.icon}</span>}
                    <span className="truncate">{matchingOption.label}</span>
                  </span>
                </SelectPrimitive.Value>
              ) : (
                <SelectPrimitive.Value placeholder={effectivePlaceholder} />
              )}
            </div>

            <div className="flex items-center gap-1 shrink-0 ml-1">
              {clearable && hasValue && !disabled && (
                <span
                  role="button"
                  tabIndex={-1}
                  aria-label="Clear selection"
                  onPointerDown={stopEvent}
                  onMouseDown={stopEvent}
                  onPointerUp={stopEvent}
                  onClick={handleClear}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X size={14} />
                </span>
              )}
              <SelectPrimitive.Icon asChild>
                <ChevronDown
                  size={isSm ? 14 : isLg ? 18 : 16}
                  className="text-slate-400 transition-transform duration-200 group-data-[state=open]:rotate-180"
                />
              </SelectPrimitive.Icon>
            </div>
          </SelectPrimitive.Trigger>

          <SelectPrimitive.Portal>
            <SelectPrimitive.Content
              position="popper"
              sideOffset={4}
              className={cn(
                "z-50 min-w-[var(--radix-select-trigger-width)] w-[var(--radix-select-trigger-width)] max-h-72 overflow-hidden rounded-xl bg-white border border-slate-200/90 shadow-xl outline-none",
                "duration-150 ease-out",
                "data-[state=open]:animate-in data-[state=closed]:animate-out",
                "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
                "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
                "data-[side=bottom]:slide-in-from-top-1.5 data-[side=top]:slide-in-from-bottom-1.5",
                contentClassName
              )}
            >
              <SelectPrimitive.ScrollUpButton className="flex items-center justify-center h-6 bg-white text-slate-500 cursor-default">
                <ChevronUp size={14} />
              </SelectPrimitive.ScrollUpButton>

              <SelectPrimitive.Viewport className="p-1 space-y-0.5 overscroll-contain">
                {options && normalizedOptions.length > 0 ? (
                  hasMultipleGroups ? (
                    Object.entries(groupedOptions).map(([grp, groupOpts], grpIdx) => (
                      <React.Fragment key={grp}>
                        {grp !== "__default__" && (
                          <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            {grp}
                          </div>
                        )}
                        {groupOpts.map((opt) => (
                          <SelectItem
                            key={opt.value}
                            value={opt.value}
                            disabled={opt.disabled}
                            description={opt.description}
                            icon={opt.icon}
                            size={size}
                          >
                            {opt.label}
                          </SelectItem>
                        ))}
                        {grpIdx < Object.keys(groupedOptions).length - 1 && (
                          <div className="h-px bg-slate-100 my-1 -mx-1" />
                        )}
                      </React.Fragment>
                    ))
                  ) : (
                    normalizedOptions.map((opt) => (
                      <SelectItem
                        key={opt.value}
                        value={opt.value}
                        disabled={opt.disabled}
                        description={opt.description}
                        icon={opt.icon}
                        size={size}
                      >
                        {opt.label}
                      </SelectItem>
                    ))
                  )
                ) : (
                  children
                )}
              </SelectPrimitive.Viewport>

              <SelectPrimitive.ScrollDownButton className="flex items-center justify-center h-6 bg-white text-slate-500 cursor-default">
                <ChevronDown size={14} />
              </SelectPrimitive.ScrollDownButton>
            </SelectPrimitive.Content>
          </SelectPrimitive.Portal>
        </SelectPrimitive.Root>
      </div>
    );

    if (!shouldRenderWrapper) {
      return renderControl;
    }

    return (
      <div className={cn("space-y-1.5 w-full", containerClassName)}>
        {label && (
          <label
            htmlFor={selectId}
            className={cn(
              "block text-xs font-semibold text-slate-700 cursor-pointer",
              disabled && "opacity-60 cursor-not-allowed",
              labelClassName
            )}
          >
            {label} {required && <span className="text-red-500 font-bold ml-0.5">*</span>}
          </label>
        )}
        {renderControl}
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
              <p className={cn("text-xs text-red-600 font-normal", errorClassName)}>
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

Select.displayName = "Select";

// ============================================================================
// 2. RADIX SELECT PRIMITIVE ITEM (Composition Subcomponent)
// ============================================================================

export interface SelectItemProps
  extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item> {
  icon?: React.ReactNode;
  description?: React.ReactNode;
  size?: "sm" | "md" | "lg";
}

export const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  SelectItemProps
>(({ className, children, icon, description, size = "md", ...props }, ref) => {
  const isSm = size === "sm";

  return (
    <SelectPrimitive.Item
      ref={ref}
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center rounded-lg transition-colors outline-none",
        "hover:bg-slate-100/80 focus:bg-slate-100/90 text-slate-700 data-[state=checked]:text-blue-600 data-[state=checked]:bg-blue-50/50 data-[state=checked]:font-medium",
        "disabled:pointer-events-none disabled:opacity-40",
        isSm ? "py-1.5 px-2 text-xs" : "py-2 px-3 text-sm",
        className
      )}
      {...props}
    >
      <div className={cn("flex items-center gap-2 flex-1 min-w-0", isSm ? "pr-5" : "pr-6")}>
        {icon && <span className="text-slate-400 shrink-0">{icon}</span>}
        <div className="truncate">
          <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
          {description && (
            <p className="text-[11px] text-slate-400 font-normal leading-normal truncate mt-0.5">
              {description}
            </p>
          )}
        </div>
      </div>

      <span className={cn("absolute flex items-center justify-center", isSm ? "right-1.5" : "right-2.5")}>
        <SelectPrimitive.ItemIndicator>
          <Check size={isSm ? 14 : 16} className="text-blue-600 stroke-[2.5]" />
        </SelectPrimitive.ItemIndicator>
      </span>
    </SelectPrimitive.Item>
  );
});

SelectItem.displayName = SelectPrimitive.Item.displayName;

// Compose exports for manual Radix composition
export const SelectTrigger = SelectPrimitive.Trigger;
export const SelectValue = SelectPrimitive.Value;
export const SelectContent = SelectPrimitive.Content;
export const SelectGroup = SelectPrimitive.Group;
export const SelectLabel = SelectPrimitive.Label;
export const SelectSeparator = SelectPrimitive.Separator;

// ============================================================================
// 3. MULTI-SELECT COMPONENT (Tag Pills & Checkbox Dropdown)
// ============================================================================

export const MultiSelect = React.forwardRef<HTMLButtonElement, MultiSelectProps>(
  (
    {
      id,
      name,
      value,
      defaultValue = [],
      onValueChange,
      onChange,
      options = [],
      placeholder = "Select multiple options...",
      disabled = false,
      required = false,
      error = false,
      icon,
      clearable = true,
      selectAllOption = true,
      selectAllLabel = "Select All",
      maxDisplayTags = 3,
      size = "md",
      className,
      containerClassName,
      contentClassName,
      label,
      helperText,
      labelClassName,
      errorClassName,
      helperClassName,
    },
    ref
  ) => {
    const autoId = useId();
    const selectId = id || (label ? `multiselect-${autoId}` : undefined);
    const isSm = size === "sm";
    const isLg = size === "lg";
    const effectivePlaceholder = placeholder || "Select options...";

    const [isOpen, setIsOpen] = useState(false);

    // Normalize options (ensure value is always string)
    const normalizedOptions: {
      value: string;
      label: string;
      description?: React.ReactNode;
      icon?: React.ReactNode;
      disabled?: boolean;
      group?: string;
    }[] = options.map((opt) => {
      if (typeof opt === "string" || typeof opt === "number") {
        return {
          value: String(opt),
          label: String(opt),
          disabled: false,
        };
      }
      return {
        value: String(opt.value),
        label: opt.label || String(opt.value),
        description: opt.description,
        icon: opt.icon,
        disabled: Boolean(opt.disabled),
        group: opt.group,
      };
    });

    // Controlled or uncontrolled state
    const [selectedValues, setSelectedValues] = useState<string[]>(() => {
      const initial = value !== undefined ? value : defaultValue;
      return Array.isArray(initial) ? initial.map(String) : [];
    });

    useEffect(() => {
      if (value !== undefined) {
        setSelectedValues(Array.isArray(value) ? value.map(String) : []);
      }
    }, [value]);

    const handleToggle = (val: string) => {
      let next: string[];
      if (selectedValues.includes(val)) {
        next = selectedValues.filter((v) => v !== val);
      } else {
        next = [...selectedValues, val];
      }

      if (value === undefined) {
        setSelectedValues(next);
      }

      if (onValueChange) onValueChange(next);
      if (onChange) {
        onChange({
          target: { value: next, name },
          currentTarget: { value: next, name },
          persist: () => {},
        });
      }
    };

    const handleRemove = (e: React.MouseEvent | React.PointerEvent, val: string) => {
      stopEvent(e);
      handleToggle(val);
    };

    const handleClearAll = (e: React.MouseEvent | React.PointerEvent) => {
      stopEvent(e);
      setIsOpen(false);
      const next: string[] = [];
      if (value === undefined) setSelectedValues(next);
      if (onValueChange) onValueChange(next);
      if (onChange) {
        onChange({
          target: { value: next, name },
          currentTarget: { value: next, name },
          persist: () => {},
        });
      }
    };

    const handleSelectAll = () => {
      const allEnabledValues = normalizedOptions
        .filter((o) => !o.disabled)
        .map((o) => o.value);

      const allSelected = allEnabledValues.every((val) => selectedValues.includes(val));
      const next = allSelected ? [] : allEnabledValues;

      if (value === undefined) setSelectedValues(next);
      if (onValueChange) onValueChange(next);
      if (onChange) {
        onChange({
          target: { value: next, name },
          currentTarget: { value: next, name },
          persist: () => {},
        });
      }
    };

    const hasError = Boolean(error);
    const errorMessage = typeof error === "string" ? error : undefined;
    const shouldRenderWrapper = Boolean(label || errorMessage || helperText);
    const hasValues = selectedValues.length > 0;
    const allSelected =
      normalizedOptions.length > 0 &&
      normalizedOptions
        .filter((o) => !o.disabled)
        .every((o) => selectedValues.includes(o.value));

    // Visible badges
    const visibleSelectedOptions = normalizedOptions.filter((o) =>
      selectedValues.includes(o.value)
    );
    const displayedTags = visibleSelectedOptions.slice(0, maxDisplayTags);
    const overflowCount = visibleSelectedOptions.length - maxDisplayTags;

    const renderControl = (
      <div className={cn("relative w-full", !shouldRenderWrapper && containerClassName)}>
        <PopoverPrimitive.Root open={isOpen} onOpenChange={setIsOpen}>
          <PopoverPrimitive.Trigger
            ref={ref}
            id={selectId}
            disabled={disabled}
            className={cn(
              "flex w-full items-center justify-between bg-white border border-slate-200 text-slate-800 transition-all duration-200 select-none outline-none font-normal",
              "hover:border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20",
              "disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 disabled:border-slate-200",
              isSm
                ? "min-h-9 rounded-lg text-xs py-1 px-2.5 shadow-xs gap-1.5"
                : isLg
                ? "min-h-12 rounded-lg text-base py-2 px-3.5 shadow-xs gap-2"
                : "min-h-11 rounded-lg text-sm py-1.5 px-3 shadow-xs gap-2",
              hasError && "border-red-500 focus:border-red-500 focus:ring-red-500/20 text-slate-800",
              className
            )}
          >
            <div className="flex items-center gap-1.5 flex-wrap min-w-0 flex-1 text-left py-0.5">
              {icon && (
                <span className="text-slate-400 shrink-0 mr-1 flex items-center">{icon}</span>
              )}

              {displayedTags.length > 0 ? (
                <>
                  {displayedTags.map((opt) => (
                    <span
                      key={opt.value}
                      className={cn(
                        "inline-flex items-center gap-1 rounded-md bg-slate-100 text-slate-800 border border-slate-200/80 font-medium px-2 py-0.5 leading-tight",
                        isSm ? "text-[10px]" : "text-xs"
                      )}
                    >
                      {opt.icon && <span className="scale-90">{opt.icon}</span>}
                      <span className="truncate max-w-[120px]">{opt.label}</span>
                      {!disabled && (
                        <span
                          role="button"
                          tabIndex={-1}
                          onPointerDown={stopEvent}
                          onMouseDown={stopEvent}
                          onPointerUp={stopEvent}
                          onClick={(e) => handleRemove(e, opt.value)}
                          className="hover:text-red-500 cursor-pointer text-slate-400 p-0.5 transition-colors"
                        >
                          <X size={12} />
                        </span>
                      )}
                    </span>
                  ))}

                  {overflowCount > 0 && (
                    <span
                      className={cn(
                        "inline-flex items-center rounded-md bg-blue-50 text-blue-700 border border-blue-200 font-semibold px-1.5 py-0.5",
                        isSm ? "text-[10px]" : "text-xs"
                      )}
                    >
                      +{overflowCount} more
                    </span>
                  )}
                </>
              ) : (
                <span className="text-slate-400 font-normal truncate">{effectivePlaceholder}</span>
              )}
            </div>

            <div className="flex items-center gap-1 shrink-0 ml-1">
              {clearable && hasValues && !disabled && (
                <span
                  role="button"
                  tabIndex={-1}
                  aria-label="Clear all selections"
                  onPointerDown={stopEvent}
                  onMouseDown={stopEvent}
                  onPointerUp={stopEvent}
                  onClick={handleClearAll}
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
          </PopoverPrimitive.Trigger>

          <PopoverPrimitive.Portal>
            <PopoverPrimitive.Content
              align="start"
              sideOffset={4}
              className={cn(
                "z-50 min-w-[var(--radix-popover-trigger-width)] w-[var(--radix-popover-trigger-width)] max-h-72 overflow-hidden rounded-xl bg-white border border-slate-200/90 shadow-xl outline-none",
                "duration-150 ease-out",
                "data-[state=open]:animate-in data-[state=closed]:animate-out",
                "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
                "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
                contentClassName
              )}
            >
              {selectAllOption && normalizedOptions.length > 0 && (
                <div className="p-2 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    {allSelected ? "Deselect All" : selectAllLabel}
                  </button>
                  <span className="text-[11px] text-slate-400 font-normal">
                    {selectedValues.length} of {normalizedOptions.length} selected
                  </span>
                </div>
              )}

              <div className="p-1.5 space-y-0.5 overflow-y-auto max-h-56 overscroll-contain">
                {normalizedOptions.map((opt) => {
                  const isChecked = selectedValues.includes(opt.value);

                  return (
                    <div
                      key={opt.value}
                      onClick={() => !opt.disabled && handleToggle(opt.value)}
                      className={cn(
                        "relative flex w-full cursor-pointer select-none items-center rounded-lg transition-colors outline-none",
                        "hover:bg-slate-100/80 text-slate-700",
                        isChecked && "bg-blue-50/50 text-blue-600 font-medium",
                        opt.disabled && "pointer-events-none opacity-40",
                        isSm ? "py-1.5 px-2.5 text-xs" : "py-2 px-3 text-sm"
                      )}
                    >
                      {/* Checkbox box */}
                      <div
                        className={cn(
                          "mr-2.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-md border transition-all",
                          isChecked
                            ? "border-blue-600 bg-blue-600 text-white"
                            : "border-slate-300 bg-white"
                        )}
                      >
                        {isChecked && <Check size={12} className="stroke-[3]" />}
                      </div>

                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {opt.icon && <span className="text-slate-400 shrink-0">{opt.icon}</span>}
                        <div className="truncate">
                          <span className="truncate block">{opt.label}</span>
                          {opt.description && (
                            <p className="text-[11px] text-slate-400 font-normal leading-normal truncate mt-0.5">
                              {opt.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </PopoverPrimitive.Content>
          </PopoverPrimitive.Portal>
        </PopoverPrimitive.Root>
      </div>
    );

    if (!shouldRenderWrapper) {
      return renderControl;
    }

    return (
      <div className={cn("space-y-1.5 w-full", containerClassName)}>
        {label && (
          <label
            htmlFor={selectId}
            className={cn(
              "block text-xs font-semibold text-slate-700 cursor-pointer",
              disabled && "opacity-60 cursor-not-allowed",
              labelClassName
            )}
          >
            {label} {required && <span className="text-red-500 font-bold ml-0.5">*</span>}
          </label>
        )}
        {renderControl}
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
              <p className={cn("text-xs text-red-600 font-normal", errorClassName)}>
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

MultiSelect.displayName = "MultiSelect";

export default Select;
