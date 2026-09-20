import React from "react";
import { FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  icon?: React.ReactNode | React.ElementType;
  title?: string;
  description?: string;
  actionText?: string;
  actionLabel?: string;
  onAction?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = FolderOpen,
  title = "No data found",
  description = "Get started by adding your first record.",
  actionText,
  actionLabel,
  onAction,
  action,
  className,
}) => {
  const label = actionText || actionLabel || action?.label;
  const handler = onAction || action?.onClick;

  const renderIcon = () => {
    if (!icon) return <FolderOpen size={40} className="text-slate-400" />;
    if (React.isValidElement(icon)) return icon;
    if (typeof icon === "function" || (typeof icon === "object" && icon !== null)) {
      const IconComp = icon as React.ElementType;
      return <IconComp size={40} className="text-slate-400" />;
    }
    return <FolderOpen size={40} className="text-slate-400" />;
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-12 text-center rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/50",
        className
      )}
    >
      <div className="p-4 rounded-2xl bg-white shadow-sm border border-slate-100 mb-4 flex items-center justify-center">
        {renderIcon()}
      </div>
      <h4 className="text-lg font-display font-bold text-slate-800 mb-1">{title}</h4>
      <p className="text-sm text-slate-500 max-w-sm mb-6">{description}</p>
      {/* {label && handler && (
        <Button onClick={handler} variant="default" className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white cursor-pointer">
          {label}
        </Button>
      )} */}
    </div>
  );
};

export default EmptyState;
