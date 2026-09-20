import React from "react";
import { Copy, Share2, ShieldCheck, X } from "lucide-react";
import { toast } from "sonner";
import { FileActions, ModalWrapper } from "@/components/common";
import { Button } from "@/components/ui/button";
import { useRetainedModalData } from "@/hooks/useRetainedModalData";
import { cn } from "@/lib/utils";
import type { PreApprovedVisitor } from "../types";
import { formatVisitDate, formatVisitTime } from "../utils/formatters";
import { downloadVisitorPassPdf } from "../utils/pdf";
import { STATUS_HEADER_CLASS } from "../constants";

interface VisitorPassModalProps {
  visitor: PreApprovedVisitor | null;
  onClose: () => void;
}


export const VisitorPassModal: React.FC<VisitorPassModalProps> = ({
  visitor: activeVisitor,
  onClose,
}) => {
  const visitor = useRetainedModalData(activeVisitor);

  if (!visitor) return null;

  const shareText = [
    "Nestora Visitor Pass",
    `Visitor: ${visitor.visitor_name}`,
    `Pass code: ${visitor.pass_code}`,
    visitor.otp ? `Security OTP: ${visitor.otp}` : undefined,
    `Date: ${formatVisitDate(visitor.visit_date)}`,
    `Time: ${formatVisitTime(visitor.start_time)} - ${formatVisitTime(visitor.end_time)}`,
  ]
    .filter(Boolean)
    .join("\n");

  const copyOtp = async () => {
    if (!visitor.otp) return;
    try {
      await navigator.clipboard.writeText(visitor.otp);
      toast.success("Security OTP copied");
    } catch {
      toast.error("Unable to copy the security OTP");
    }
  };

  const shareUrl = `${window.location.origin}/visitor-pass/${encodeURIComponent(visitor.pass_code)}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=${encodeURIComponent(shareUrl)}&margin=0`;

  const sharePass = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: "Visitor Pass", text: shareText, url: shareUrl });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Visitor pass link copied for sharing");
      }
    } catch (error: any) {
      if (error?.name !== "AbortError") toast.error("Unable to share the visitor pass");
    }
  };

  return (
    <ModalWrapper
      isOpen={Boolean(activeVisitor)}
      onClose={onClose}
      size="md"
      hideClose
      bodyClassName="flex-none overflow-hidden p-0"
      className="max-w-sm overflow-hidden rounded-[2rem] border-0"
    >
      <div className="relative bg-white">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-20 rounded-full p-2 text-white transition-colors hover:bg-white/20"
          aria-label="Close visitor pass"
        >
          <X size={20} />
        </button>

        <div
          className={cn(
            "rounded-b-[2.5rem] px-6 pb-10 pt-6 text-center text-white",
            STATUS_HEADER_CLASS[visitor.status] || "bg-slate-700",
          )}
        >
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 shadow-inner backdrop-blur-md">
            <ShieldCheck size={34} />
          </div>
          <h3 className="text-2xl font-bold tracking-tight">Visitor Pass</h3>
          <p className="mt-1 font-medium text-white/80">{visitor.status}</p>
        </div>

        <div className="relative z-10 -mt-8 px-6 pb-6">
          <div className="mb-4 rounded-3xl border border-slate-100 bg-white p-4 text-center shadow-xl">
            <img
              src={qrUrl}
              alt={`QR code for visitor pass ${visitor.pass_code}`}
              className="mx-auto h-40 w-40 rounded-xl"
            />
            <div className="mt-3 inline-block rounded-full border border-slate-200 bg-slate-50 px-5 py-1.5">
              <p className="mb-0.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                Pass Code
              </p>
              <p className="font-mono text-lg font-bold tracking-widest text-slate-800">
                {visitor.pass_code}
              </p>
            </div>
          </div>

          <div className="space-y-3 px-1">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Visitor</p>
              <p className="text-base font-bold text-slate-800">{visitor.visitor_name}</p>
              <p className="text-sm text-slate-500">
                {visitor.mobile} • {visitor.visitor_type}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-2.5">
                <p className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-500">Date</p>
                <p className="font-semibold text-slate-800">{formatVisitDate(visitor.visit_date)}</p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-2.5">
                <p className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-500">Time</p>
                <p className="text-sm font-semibold text-slate-800">
                  {formatVisitTime(visitor.start_time)} – {formatVisitTime(visitor.end_time)}
                </p>
              </div>
            </div>

            {visitor.otp ? (
              <div className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 p-3">
                <div>
                  <p className="mb-0.5 text-xs font-bold uppercase tracking-wider text-amber-600">
                    Security OTP
                  </p>
                  <p className="font-mono text-2xl font-bold tracking-widest text-amber-700">
                    {visitor.otp}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="iconSm"
                  onClick={copyOtp}
                  className="text-amber-500 hover:bg-amber-100 hover:text-amber-700"
                  title="Copy security OTP"
                >
                  <Copy size={17} />
                </Button>
              </div>
            ) : null}
          </div>

          <div className="mt-4 flex items-center gap-2">
            <FileActions
              fileUrl={shareUrl}
              downloadUrl={qrUrl}
              onDownload={() => downloadVisitorPassPdf(visitor, qrUrl)}
              downloadName={`${visitor.pass_code}.pdf`}
              size="md"
              className="shrink-0"
            />
            <Button type="button" onClick={sharePass} className="h-12 flex-1 rounded-2xl text-sm">
              <Share2 size={18} /> Share Visitor Pass
            </Button>
          </div>
        </div>
      </div>
    </ModalWrapper>
  );
};

export default VisitorPassModal;
