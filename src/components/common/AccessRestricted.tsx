import React from "react";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface AccessRestrictedProps {
  /** Optional module/feature name to automatically format description (e.g., "Entity Types") */
  moduleName?: string;
  /** Custom title for the restriction message */
  title?: string;
  /** Custom description text */
  description?: string;
  /** Custom icon component or node */
  icon?: React.ReactNode | React.ElementType;
  /** Custom action button text */
  actionLabel?: string;
  /** Custom action callback (defaults to navigating back or dashboard) */
  onAction?: () => void;
  /** Whether to show a fallback action button (default: false) */
  showAction?: boolean;
  /** Optional extra CSS classes */
  className?: string;
  /** Compact mode for smaller inline containers */
  compact?: boolean;
}

export const AccessRestricted: React.FC<AccessRestrictedProps> = ({
  moduleName,
  title = "Access Restricted",
  description,
  icon = ShieldAlert,
  actionLabel = "Back to Dashboard",
  onAction,
  showAction = false,
  className,
  compact = false,
}) => {
  const navigate = useNavigate();

  const finalDescription =
    description ||
    (moduleName
      ? `Your role does not have permission to view the ${moduleName} module. Contact an administrator to request access.`
      : "Your role does not have permission to view this module. Contact an administrator to request access.");

  const handleAction = () => {
    if (onAction) {
      onAction();
    } else {
      navigate("/dashboard");
    }
  };

  const renderIcon = () => {
    if (React.isValidElement(icon)) return icon;
    if (typeof icon === "function" || (typeof icon === "object" && icon !== null)) {
      const IconComp = icon as React.ElementType;
      return <IconComp size={compact ? 20 : 28} className="text-rose-600" />;
    }
    return <ShieldAlert size={compact ? 20 : 28} className="text-rose-600" />;
  };

  if (compact) {
    return (
      <div
        className={cn(
          "p-4 rounded-xl border border-rose-200 bg-rose-50/60 flex items-center gap-3 text-left",
          className
        )}
      >
        <div className="w-9 h-9 rounded-lg bg-rose-100/80 text-rose-600 flex items-center justify-center shrink-0">
          {renderIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-semibold text-rose-900">{title}</h4>
          <p className="text-[11px] text-rose-600 mt-0.5 leading-snug">{finalDescription}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "p-10 rounded-3xl border border-rose-200/80 bg-gradient-to-b from-rose-50/60 to-white flex flex-col items-center justify-center text-center space-y-4 max-w-lg mx-auto shadow-sm my-6",
        className
      )}
    >
      <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shadow-inner">
        {renderIcon()}
      </div>

      <div className="space-y-1.5 max-w-sm">
        <h3 className="text-base font-semibold text-rose-950 font-display">{title}</h3>
        <p className="text-xs text-rose-600 leading-relaxed">{finalDescription}</p>
      </div>

      {showAction && (
        <Button
          onClick={handleAction}
          variant="outline"
          className="rounded-xl border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-800 cursor-pointer mt-2"
        >
          <ArrowLeft size={13} className="mr-1.5" />
          <span>{actionLabel}</span>
        </Button>
      )}
    </div>
  );
};

export default AccessRestricted;
