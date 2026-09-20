import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  className?: string;
}

const sizeMap = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-10 w-10",
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  text,
  className,
}) => {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-2 p-6", className)}>
      <Loader2 className={cn("animate-spin text-slate-700", sizeMap[size])} />
      {text && <p className="text-xs text-slate-500 font-mono tracking-wide">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
