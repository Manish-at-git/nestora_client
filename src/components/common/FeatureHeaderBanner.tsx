import React from "react";
import { cn } from "@/lib/utils";

export interface FeatureHeaderBannerProps {
  badge?: React.ReactNode;
  badgeColor?: "emerald" | "sky" | "amber" | "indigo" | "purple" | "slate";
  badgeClassName?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  "data-testid"?: string;
}

const BADGE_COLOR_MAP: Record<string, string> = {
  emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
  sky: "bg-sky-50 text-sky-700 border-sky-200",
  amber: "bg-amber-50 text-amber-800 border-amber-200",
  indigo: "bg-indigo-50 text-indigo-700 border-indigo-200",
  purple: "bg-purple-50 text-purple-700 border-purple-200",
  slate: "bg-slate-50 text-slate-700 border-slate-200",
};

export const FeatureHeaderBanner: React.FC<FeatureHeaderBannerProps> = ({
  badge,
  badgeColor = "emerald",
  badgeClassName,
  title,
  description,
  action,
  className,
  "data-testid": testId,
}) => {
  const resolvedBadgeColor = BADGE_COLOR_MAP[badgeColor] || BADGE_COLOR_MAP.emerald;

  return (
    <div
      className={cn(
        "flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-3 sm:p-6 rounded-3xl border border-slate-200 shadow-sm",
        className
      )}
      data-testid={testId}
    >
      <div>
        {badge && (
          <div className="flex items-center gap-2 mb-1">
            <span
              className={cn(
                "px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold border",
                resolvedBadgeColor,
                badgeClassName
              )}
            >
              {badge}
            </span>
          </div>
        )}
        <h1 className="text-2xl sm:text-3xl font-medium font-display text-slate-800 tracking-tight">
          {title}
        </h1>
        {description && (
          <p className="text-slate-500 text-xs sm:text-sm mt-1">{description}</p>
        )}
      </div>

      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
};

export default FeatureHeaderBanner;
