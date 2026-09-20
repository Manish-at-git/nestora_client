import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide transition-colors uppercase border font-mono",
  {
    variants: {
      variant: {
        default: "border-slate-200 bg-slate-100 text-slate-700",
        outline: "border-slate-200 text-slate-700 bg-transparent",
        secondary: "border-transparent bg-slate-100 text-slate-800",
        moss: "border-moss/20 bg-moss-soft text-moss",
        clay: "border-clay/20 bg-clay-soft text-clay",
        success: "border-emerald-200 bg-emerald-50 text-emerald-700",
        warning: "border-amber-200 bg-amber-50 text-amber-700",
        danger: "border-rose-200 bg-rose-50 text-rose-700",
        info: "border-blue-200 bg-blue-50 text-blue-700",
        maintenance: "border-[#E8D09B] bg-[#FFF3D9] text-[#7A5A1C]",
        celebration: "border-[#D6C4EC] bg-[#E8DDF5] text-[#5B3E86]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export const Badge: React.FC<BadgeProps> = ({ className, variant, ...props }) => {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
};

export default Badge;
