import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] cursor-pointer",
  {
    variants: {
      variant: {
        default: "bg-slate-800 text-white hover:bg-slate-700 shadow-sm focus-visible:ring-slate-800",
        primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-sm focus-visible:ring-blue-600",
        moss: "bg-moss text-white hover:bg-moss-hover shadow-primary focus-visible:ring-moss",
        clay: "bg-clay text-white hover:bg-clay-hover shadow-clay focus-visible:ring-clay",
        outline: "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-sm focus-visible:ring-slate-300",
        secondary: "bg-slate-100 text-slate-800 hover:bg-slate-200 focus-visible:ring-slate-200",
        ghost: "text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-slate-200",
        danger: "bg-red-600 text-white hover:bg-red-700 shadow-sm focus-visible:ring-red-600",
        dangerGhost: "text-clay hover:bg-clay-soft/50 hover:text-clay-hover",
      },
      size: {
        md: "h-11 px-5 py-2.5",
        default: "h-9 rounded-lg px-3.5 text-xs",
        lg: "h-12 rounded-xl px-7 text-base",
        icon: "h-10 w-10 p-0 rounded-xl",
        iconSm: "h-8 w-8 p-0 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, children, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin text-current" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;
