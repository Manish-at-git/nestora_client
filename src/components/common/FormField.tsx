import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  charCount?: { current: number; max: number };
  children: React.ReactNode;
  className?: string;
  htmlFor?: string;
  errorClassName?: string;
  helperClassName?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  required,
  error,
  helperText,
  charCount,
  children,
  className,
  htmlFor,
  errorClassName,
  helperClassName,
}) => {
  const autoId = React.useId();
  const fieldId = htmlFor || (React.isValidElement(children) && (children.props as any)?.id) || `field-${autoId}`;
  const hasError = Boolean(error);

  const cloneWithProps = (child: React.ReactNode): React.ReactNode => {
    if (!React.isValidElement(child)) return child;
    const childProps = (child.props as any) || {};
    const targetId = childProps.id || fieldId;
    const targetError = childProps.error !== undefined ? childProps.error : hasError;
    if (childProps.id === targetId && childProps.error === targetError) {
      return child;
    }
    return React.cloneElement(child as React.ReactElement<any>, {
      id: targetId,
      error: targetError,
    });
  };

  const renderedChildren = React.isValidElement(children)
    ? cloneWithProps(children)
    : children;

  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center justify-between">
        <label
          htmlFor={fieldId}
          className="block text-sm font-semibold text-slate-700 cursor-pointer"
        >
          {label} {required && <span className="text-red-500 font-bold">*</span>}
        </label>
        {charCount && (
          <span className="text-xs text-slate-400 font-mono">
            {charCount.current}/{charCount.max}
          </span>
        )}
      </div>

      <div>{renderedChildren}</div>


      <AnimatePresence initial={false} mode="wait">
        {error ? (
          <motion.div
            key="error"
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: "auto", marginTop: 4 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <p className={cn("text-xs text-red-600 font-normal", errorClassName)}>
              {error}
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
            <p className={cn("text-xs text-slate-400", helperClassName)}>
              {helperText}
            </p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

export default FormField;

