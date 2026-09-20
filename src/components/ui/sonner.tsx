import React from "react";
import { Toaster as SonnerToaster, toast } from "sonner";

export type ToasterProps = React.ComponentProps<typeof SonnerToaster>;

export const Toaster: React.FC<ToasterProps> = ({ ...props }) => {
  return (
    <SonnerToaster
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white group-[.toaster]:text-slate-800 group-[.toaster]:border group-[.toaster]:border-slate-200/80 group-[.toaster]:shadow-xl group-[.toaster]:rounded-xl font-sans text-sm",
          description: "group-[.toast]:text-slate-500 text-xs mt-0.5",
          actionButton:
            "group-[.toast]:bg-slate-900 group-[.toast]:text-white font-medium text-xs px-3 py-1.5 rounded-lg",
          cancelButton:
            "group-[.toast]:bg-slate-100 group-[.toast]:text-slate-600 font-medium text-xs px-3 py-1.5 rounded-lg",
          success:
            "group-[.toaster]:!border-emerald-200 group-[.toaster]:!bg-emerald-50/80 group-[.toaster]:!text-emerald-950",
          error:
            "group-[.toaster]:!border-rose-200 group-[.toaster]:!bg-rose-50/80 group-[.toaster]:!text-rose-950",
          info:
            "group-[.toaster]:!border-sky-200 group-[.toaster]:!bg-sky-50/80 group-[.toaster]:!text-sky-950",
          warning:
            "group-[.toaster]:!border-amber-200 group-[.toaster]:!bg-amber-50/80 group-[.toaster]:!text-amber-950",
        },
      }}
      position="top-right"
      richColors
      closeButton
      {...props}
    />
  );
};

export { toast };
export default Toaster;
