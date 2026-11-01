import React from "react";
import { cn } from "@/lib/utils";

export type LoadingSpinnerVariant = "orbit" | "pulse" | "dots";

export interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  /** Selects the branded loading motion. Defaults to the standard orbit. */
  variant?: LoadingSpinnerVariant;
  text?: string;
  className?: string;
}

const sizeMap = {
  sm: {
    frame: "h-8 w-8",
    icon: "h-5 w-5",
    ring: "border-2",
    dot: "h-1 w-1",
  },
  md: {
    frame: "h-12 w-12",
    icon: "h-8 w-8",
    ring: "border-[3px]",
    dot: "h-1.5 w-1.5",
  },
  lg: {
    frame: "h-16 w-16",
    icon: "h-11 w-11",
    ring: "border-4",
    dot: "h-2 w-2",
  },
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  variant = "orbit",
  text = "Loading",
  className,
}) => {
  const styles = sizeMap[size];

  return (
    <div
      className={cn("flex flex-col items-center justify-center gap-2 p-6", className)}
      role="status"
      aria-live="polite"
    >
      <div className={cn("relative flex items-center justify-center", styles.frame)} aria-hidden="true">
        {variant === "orbit" && (
          <span
            className={cn(
              "absolute inset-0 rounded-full border-moss/20 border-t-moss animate-spin motion-reduce:animate-none",
              styles.ring,
            )}
          />
        )}

        {variant === "pulse" && (
          <span className="absolute inset-0 rounded-full bg-moss/10 animate-ping motion-reduce:animate-none" />
        )}

        <img
          src="/icon.png"
          alt=""
          className={cn(
            "relative object-contain",
            styles.icon,
            variant === "pulse" && "animate-pulse motion-reduce:animate-none",
          )}
        />

        {variant === "dots" && (
          <span className="absolute -bottom-2 left-1/2 flex -translate-x-1/2 gap-1">
            {[0, 1, 2].map((dot) => (
              <span
                key={dot}
                className={cn(
                  "rounded-full bg-moss animate-bounce motion-reduce:animate-none",
                  styles.dot,
                )}
                style={{ animationDelay: `${dot * 120}ms` }}
              />
            ))}
          </span>
        )}
      </div>
      {text && <p className="text-xs text-slate-500 font-mono tracking-wide">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
