import React from "react";
import { LucideIcon } from "lucide-react";

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: React.ReactNode;
  icon?: LucideIcon;
  iconClassName?: string;
  iconWrapperClassName?: string;
  valueClassName?: string;
  titleClassName?: string;
  variant?: "default" | "gradient" | "subtle" | "plain";
  gradientClassName?: string;
  trend?: {
    value: string;
    isPositive?: boolean;
    label?: string;
  };
  className?: string;
  onClick?: () => void;
  children?: React.ReactNode;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  iconClassName = "size-5",
  iconWrapperClassName = "w-8 h-8 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center",
  valueClassName = "text-2xl font-bold font-mono text-slate-900 mt-2",
  titleClassName = "text-xs font-semibold text-slate-500 uppercase tracking-wider",
  variant = "default",
  gradientClassName = "bg-gradient-to-br from-blue-600 to-indigo-700 text-white",
  trend,
  className = "",
  onClick,
  children,
}) => {
  if (variant === "gradient") {
    return (
      <div
        onClick={onClick}
        className={`p-6 rounded-3xl text-white shadow-lg relative overflow-hidden ${gradientClassName} ${
          onClick ? "cursor-pointer hover:shadow-xl transition-shadow" : ""
        } ${className}`}
      >
        {Icon && (
          <div className="absolute right-0 top-0 p-4 opacity-15 pointer-events-none">
            <Icon size={72} />
          </div>
        )}
        <p className="text-white/80 font-medium text-xs uppercase tracking-wider">
          {title}
        </p>
        <h3 className="text-3xl font-bold font-display mt-2">{value}</h3>
        {trend && (
          <div className="mt-4 flex items-center gap-2 text-xs">
            <span className="px-2 py-0.5 rounded-full bg-white/20 font-semibold">
              {trend.value}
            </span>
            {trend.label && (
              <span className="text-white/70">{trend.label}</span>
            )}
          </div>
        )}
        {subtitle && !trend && (
          <div className="text-xs text-white/70 mt-2">{subtitle}</div>
        )}
        {children}
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`bg-white border border-slate-200 shadow-sm p-6 rounded-3xl ${
        onClick ? "cursor-pointer hover:shadow-md transition-shadow" : ""
      } ${className}`}
    >
      <div className="flex items-center justify-between">
        <span className={titleClassName}>{title}</span>
        {Icon && (
          <div className={iconWrapperClassName}>
            <Icon className={iconClassName} />
          </div>
        )}
      </div>
      <h3 className={valueClassName}>{value}</h3>
      {subtitle && (
        <div className="mt-1">{subtitle}</div>
      )}
      {children}
    </div>
  );
};

export default StatCard;

