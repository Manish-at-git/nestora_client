import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Visual styling definition for StatusPill using class-variance-authority
 */
export const statusPillVariants = cva(
  "inline-flex items-center justify-center border font-sans font-medium transition-all duration-150 shrink-0 select-none",
  {
    variants: {
      variant: {
        // Semantic Status Variants
        success: "",
        danger: "",
        warning: "",
        info: "",
        neutral: "",
        slate: "",
        indigo: "",
        purple: "",
        teal: "",
        moss: "",
        clay: "",
        default: "",
      },
      appearance: {
        subtle: "",
        outline: "bg-transparent",
        solid: "text-white border-transparent shadow-xs",
        ghost: "bg-transparent border-transparent",
      },
      size: {
        xs: "text-xs px-2.5 py-0.5 gap-1.5 leading-normal",
        sm: "text-xs px-3 py-1 gap-1.5 leading-normal",
        md: "text-sm px-3.5 py-1.5 gap-2 leading-normal",
        lg: "text-base px-4 py-2 gap-2.5 leading-relaxed",
      },
      shape: {
        pill: "rounded-full",
        rounded: "rounded-lg",
        square: "rounded-md",
      },
      interactive: {
        true: "cursor-pointer hover:opacity-90 active:scale-95 focus:outline-hidden focus:ring-2 focus:ring-offset-1",
        false: "",
      },
    },
    compoundVariants: [
      // --- SUBTLE APPEARANCE (Soft background + Subtle matching border + Darker text) ---
      { variant: "success", appearance: "subtle", className: "bg-emerald-50/90 text-emerald-700 border-emerald-200/90" },
      { variant: "danger", appearance: "subtle", className: "bg-rose-50/90 text-rose-700 border-rose-200/90" },
      { variant: "warning", appearance: "subtle", className: "bg-amber-50/90 text-amber-800 border-amber-200/90" },
      { variant: "info", appearance: "subtle", className: "bg-blue-50/80 text-blue-700 border-blue-200/80" },
      { variant: "neutral", appearance: "subtle", className: "bg-slate-50/80 text-slate-700 border-slate-200" },
      { variant: "slate", appearance: "subtle", className: "bg-slate-50/80 text-slate-700 border-slate-200" },
      { variant: "indigo", appearance: "subtle", className: "bg-indigo-50/70 text-indigo-700 border-indigo-200/80" },
      { variant: "purple", appearance: "subtle", className: "bg-purple-50/70 text-purple-700 border-purple-200/80" },
      { variant: "teal", appearance: "subtle", className: "bg-teal-50/80 text-teal-700 border-teal-200/80" },
      { variant: "moss", appearance: "subtle", className: "bg-moss-soft text-moss border-moss/20" },
      { variant: "clay", appearance: "subtle", className: "bg-clay-soft text-clay border-clay/20" },
      { variant: "default", appearance: "subtle", className: "bg-slate-50/80 text-slate-700 border-slate-200" },

      // --- OUTLINE APPEARANCE (Transparent background + Colored border + Colored text) ---
      { variant: "success", appearance: "outline", className: "text-emerald-700 border-emerald-300 hover:bg-emerald-50/40" },
      { variant: "danger", appearance: "outline", className: "text-rose-700 border-rose-300 hover:bg-rose-50/40" },
      { variant: "warning", appearance: "outline", className: "text-amber-800 border-amber-300 hover:bg-amber-50/40" },
      { variant: "info", appearance: "outline", className: "text-blue-700 border-blue-300 hover:bg-blue-50/40" },
      { variant: "neutral", appearance: "outline", className: "text-slate-700 border-slate-300 hover:bg-slate-50/80" },
      { variant: "slate", appearance: "outline", className: "text-slate-700 border-slate-300 hover:bg-slate-50/80" },
      { variant: "indigo", appearance: "outline", className: "text-indigo-700 border-indigo-300 hover:bg-indigo-50/40" },
      { variant: "purple", appearance: "outline", className: "text-purple-700 border-purple-300 hover:bg-purple-50/40" },
      { variant: "teal", appearance: "outline", className: "text-teal-700 border-teal-300 hover:bg-teal-50/40" },
      { variant: "moss", appearance: "outline", className: "text-moss border-moss/40 hover:bg-moss-soft/40" },
      { variant: "clay", appearance: "outline", className: "text-clay border-clay/40 hover:bg-clay-soft/40" },
      { variant: "default", appearance: "outline", className: "text-slate-700 border-slate-300 hover:bg-slate-50/80" },

      // --- SOLID APPEARANCE (Solid vibrant background + Crisp white text) ---
      { variant: "success", appearance: "solid", className: "bg-emerald-600 text-white" },
      { variant: "danger", appearance: "solid", className: "bg-rose-600 text-white" },
      { variant: "warning", appearance: "solid", className: "bg-amber-500 text-white" },
      { variant: "info", appearance: "solid", className: "bg-blue-600 text-white" },
      { variant: "neutral", appearance: "solid", className: "bg-slate-700 text-white" },
      { variant: "slate", appearance: "solid", className: "bg-slate-700 text-white" },
      { variant: "indigo", appearance: "solid", className: "bg-indigo-600 text-white" },
      { variant: "purple", appearance: "solid", className: "bg-purple-600 text-white" },
      { variant: "teal", appearance: "solid", className: "bg-teal-600 text-white" },
      { variant: "moss", appearance: "solid", className: "bg-moss text-white" },
      { variant: "clay", appearance: "solid", className: "bg-clay text-white" },
      { variant: "default", appearance: "solid", className: "bg-slate-700 text-white" },

      // --- GHOST APPEARANCE (No border, transparent background, soft hover) ---
      { variant: "success", appearance: "ghost", className: "text-emerald-700 hover:bg-emerald-50" },
      { variant: "danger", appearance: "ghost", className: "text-rose-700 hover:bg-rose-50" },
      { variant: "warning", appearance: "ghost", className: "text-amber-800 hover:bg-amber-50" },
      { variant: "info", appearance: "ghost", className: "text-blue-700 hover:bg-blue-50" },
      { variant: "neutral", appearance: "ghost", className: "text-slate-700 hover:bg-slate-100" },
      { variant: "slate", appearance: "ghost", className: "text-slate-700 hover:bg-slate-100" },
      { variant: "indigo", appearance: "ghost", className: "text-indigo-700 hover:bg-indigo-50" },
      { variant: "purple", appearance: "ghost", className: "text-purple-700 hover:bg-purple-50" },
      { variant: "teal", appearance: "ghost", className: "text-teal-700 hover:bg-teal-50" },
      { variant: "moss", appearance: "ghost", className: "text-moss hover:bg-moss-soft/50" },
      { variant: "clay", appearance: "ghost", className: "text-clay hover:bg-clay-soft/50" },
      { variant: "default", appearance: "ghost", className: "text-slate-700 hover:bg-slate-100" },
    ],
    defaultVariants: {
      variant: "neutral",
      appearance: "subtle",
      size: "sm",
      shape: "pill",
      interactive: false,
    },
  }
);

export type StatusPillVariant =
  | "success"
  | "danger"
  | "warning"
  | "info"
  | "neutral"
  | "slate"
  | "indigo"
  | "purple"
  | "teal"
  | "moss"
  | "clay"
  | "default"
  | (string & {});

export type StatusPillAppearance = "subtle" | "outline" | "solid" | "ghost";
export type StatusPillSize = "xs" | "sm" | "md" | "lg";
export type StatusPillShape = "pill" | "rounded" | "square";

export interface StatusPillProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "children">,
    Omit<
      VariantProps<typeof statusPillVariants>,
      "variant" | "appearance" | "size" | "shape"
    > {
  /** Text content or custom children */
  children?: React.ReactNode;
  /** Status string or label (e.g. "Active", "Global Role", "2 days") */
  status?: string | null;
  /** Explicit label if not using children */
  label?: React.ReactNode;
  /** Color variant or semantic status */
  variant?: StatusPillVariant;
  /** Visual style: subtle (soft bg + border), outline, solid, or ghost */
  appearance?: StatusPillAppearance;
  /** Pill size: xs, sm (default), md, lg */
  size?: StatusPillSize;
  /** Border radius shape: pill (rounded-full, default), rounded (rounded-md), square */
  shape?: StatusPillShape;
  /** Whether to show the leading dot indicator (e.g., • Active) */
  dot?: boolean;
  /** Alias for dot */
  showDot?: boolean;
  /** Custom color class for the dot indicator (e.g. "bg-emerald-500", "bg-sky-400") */
  dotColor?: string;
  /** Add a live pulsing ripple effect to the dot */
  dotPulse?: boolean;
  /** Leading icon slot (e.g. <Globe />, <Clock />, <Layers />) */
  icon?: React.ReactNode;
  /** Trailing icon slot (e.g. close icon, count badge, chevron) */
  endIcon?: React.ReactNode;
  /** Custom classes for the icon wrapper */
  iconClassName?: string;
}

/**
 * Color mapping for the status dot based on variant and appearance
 */
const DOT_COLORS: Record<string, string> = {
  success: "bg-emerald-500",
  danger: "bg-rose-500",
  warning: "bg-amber-500",
  info: "bg-blue-500",
  neutral: "bg-slate-500",
  slate: "bg-slate-500",
  indigo: "bg-indigo-500",
  purple: "bg-purple-500",
  teal: "bg-teal-500",
  moss: "bg-moss",
  clay: "bg-clay",
  default: "bg-slate-500",
};

/**
 * Dot sizes mapped to pill size
 */
const DOT_SIZES: Record<StatusPillSize, string> = {
  xs: "w-1.5 h-1.5",
  sm: "w-1.5 h-1.5",
  md: "w-2 h-2",
  lg: "w-2.5 h-2.5",
};

/**
 * Icon container sizes mapped to pill size
 */
const ICON_SIZES: Record<StatusPillSize, string> = {
  xs: "[&>svg]:w-3.5 [&>svg]:h-3.5",
  sm: "[&>svg]:w-3.5 [&>svg]:h-3.5",
  md: "[&>svg]:w-4 [&>svg]:h-4",
  lg: "[&>svg]:w-4.5 [&>svg]:h-4.5",
};

/**
 * Auto-detects status variant and dot presence if not explicitly provided
 */
function resolveStatusConfig(status?: string | null, customVariant?: StatusPillVariant, hasExplicitDot?: boolean) {
  if (customVariant) {
    return {
      variant: customVariant,
      shouldShowDot: hasExplicitDot ?? false,
    };
  }

  if (!status) {
    return {
      variant: "neutral",
      shouldShowDot: hasExplicitDot ?? false,
    };
  }

  const norm = String(status).trim().toLowerCase();

  // Green / Active statuses -> Default show dot
  if (["active", "completed", "resolved", "approved", "ok", "live", "published", "enabled", "online", "success", "verified"].includes(norm)) {
    return { variant: "success", shouldShowDot: hasExplicitDot ?? true };
  }

  // Red / Danger statuses -> Default show dot
  if (["inactive", "cancelled", "expired", "rejected", "failed", "disabled", "offline", "danger", "error", "urgent", "high"].includes(norm)) {
    return { variant: "danger", shouldShowDot: hasExplicitDot ?? true };
  }

  // Amber / Warning statuses -> Default show dot
  if (["pending", "in progress", "in_progress", "processing", "review", "warning", "waiting", "medium"].includes(norm)) {
    return { variant: "warning", shouldShowDot: hasExplicitDot ?? true };
  }

  // Blue / Info statuses
  if (["info", "information", "low", "open", "new", "scheduled"].includes(norm)) {
    return { variant: "info", shouldShowDot: hasExplicitDot ?? false };
  }

  // Neutral / Slate
  return {
    variant: "neutral",
    shouldShowDot: hasExplicitDot ?? false,
  };
}

/**
 * Universal StatusPill Component
 *
 * Satisfies both:
 * 1. Dot indicator status pills (e.g. `• Active`, `• Pending`, `• Inactive`)
 * 2. Icon + Text tag pills (e.g. `🌐 Global Role`, `🕒 2 days`, `📚 30 features`)
 *
 * Fully customizable via `variant`, `appearance`, `size`, `shape`, `icon`, `dot`, `className`, etc.
 */
export const StatusPill = React.forwardRef<HTMLSpanElement, StatusPillProps>(
  (
    {
      status,
      label,
      children,
      variant: customVariant,
      appearance = "subtle",
      size = "sm",
      shape = "pill",
      dot,
      showDot,
      dotColor,
      dotPulse = false,
      icon,
      endIcon,
      iconClassName,
      className,
      onClick,
      ...props
    },
    ref
  ) => {
    const hasExplicitDot = dot ?? showDot;
    const { variant: resolvedVariant, shouldShowDot } = resolveStatusConfig(
      status,
      customVariant,
      hasExplicitDot
    );

    const isInteractive = Boolean(onClick);
    const content = children ?? label ?? status ?? "";

    // Determine dot color based on variant and appearance
    const isSolid = appearance === "solid";
    const finalDotColor =
      dotColor ?? (isSolid ? "bg-white" : DOT_COLORS[resolvedVariant] || DOT_COLORS.neutral);

    const dotSizeClass = DOT_SIZES[size] || DOT_SIZES.sm;
    const iconSizeClass = ICON_SIZES[size] || ICON_SIZES.sm;

    return (
      <span
        ref={ref}
        onClick={onClick}
        className={cn(
          statusPillVariants({
            variant: resolvedVariant as any,
            appearance,
            size,
            shape,
            interactive: isInteractive,
          }),
          className
        )}
        {...props}
      >
        {/* Leading Dot Indicator */}
        {shouldShowDot && (
          <span className="relative inline-flex items-center justify-center shrink-0">
            {dotPulse && (
              <span
                className={cn(
                  "absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping",
                  finalDotColor
                )}
              />
            )}
            <span
              className={cn(
                "inline-block rounded-full shrink-0",
                dotSizeClass,
                finalDotColor
              )}
            />
          </span>
        )}

        {/* Leading Icon Slot */}
        {icon && (
          <span
            className={cn(
              "inline-flex items-center justify-center shrink-0 opacity-90",
              iconSizeClass,
              iconClassName
            )}
          >
            {icon}
          </span>
        )}

        {/* Text / Label */}
        {content && <span className="truncate">{content}</span>}

        {/* Trailing End Icon Slot */}
        {endIcon && (
          <span
            className={cn(
              "inline-flex items-center justify-center shrink-0 opacity-80 ml-0.5",
              iconSizeClass
            )}
          >
            {endIcon}
          </span>
        )}
      </span>
    );
  }
);

StatusPill.displayName = "StatusPill";

export default StatusPill;
