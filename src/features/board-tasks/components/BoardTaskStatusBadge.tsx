import React from "react";
import { cn } from "@/lib/utils";
import type { BoardTaskStatus } from "../types";

export interface BoardTaskStatusBadgeProps {
  status: BoardTaskStatus | string;
  className?: string;
  size?: "sm" | "md";
}

export const BoardTaskStatusBadge: React.FC<BoardTaskStatusBadgeProps> = ({
  status,
  className,
  size = "md",
}) => {
  const getStatusStyles = (st: string) => {
    switch (st) {
      case "Completed":
        return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/50";
      case "In Progress":
        return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800/50";
      case "New":
        return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/50";
      case "Cancelled":
        return "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/50";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800";
    }
  };

  const sizeStyles =
    size === "sm" ? "px-2.5 py-0.5 text-xs font-medium" : "px-3 py-1 text-xs font-semibold";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border shadow-sm transition-colors",
        getStatusStyles(status),
        sizeStyles,
        className
      )}
    >
      <span
        className={cn(
          "w-1.5 h-1.5 rounded-full mr-1.5",
          status === "Completed"
            ? "bg-emerald-500"
            : status === "In Progress"
            ? "bg-blue-500"
            : status === "New"
            ? "bg-amber-500"
            : status === "Cancelled"
            ? "bg-rose-500"
            : "bg-slate-400"
        )}
      />
      {status}
    </span>
  );
};

export default BoardTaskStatusBadge;
