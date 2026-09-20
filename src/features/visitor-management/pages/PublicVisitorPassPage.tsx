import React from "react";
import { Copy, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { AccessRestricted, FileActions, LoadingSpinner } from "@/components/common";
import { Button } from "@/components/ui/button";
import { useParams } from "react-router-dom";
import { useGetPublicVisitorPassQuery } from "../api";
import { formatVisitDate, formatVisitTime } from "../utils/formatters";
import { downloadVisitorPassPdf } from "../utils/pdf";
import { cn } from "@/lib/utils";
import { STATUS_HEADER_CLASS } from "../constants";

export const PublicVisitorPassPage: React.FC = () => {
  const { passCode = "" } = useParams<{ passCode: string }>();
  const { data: visitor, isLoading, isError } = useGetPublicVisitorPassQuery(passCode, {
    skip: !passCode,
  });

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center bg-slate-50"><LoadingSpinner /></div>;
  }

  if (isError || !visitor) {
    return <AccessRestricted moduleName="Visitor Pass" />;
  }

  const shareUrl = `${window.location.origin}/visitor-pass/${encodeURIComponent(visitor.pass_code)}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=${encodeURIComponent(shareUrl)}&margin=0`;

  const copyOtp = async () => {
    if (!visitor.otp) return;
    await navigator.clipboard.writeText(visitor.otp);
    toast.success("Security OTP copied");
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-8">
      <section className="w-full max-w-md overflow-hidden rounded-[2rem] bg-white shadow-2xl">
        <div
          className={cn(
            "rounded-b-[2.5rem] px-6 pb-10 pt-6 text-center text-white",
            STATUS_HEADER_CLASS[visitor.status] || "bg-slate-700",
          )}
        >
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20">
            <ShieldCheck size={30} />
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">Nestora</p>
          <h1 className="mt-1 text-2xl font-bold">Visitor Pass</h1>
          <p className="mt-1 text-sm text-white/80">{visitor.status}</p>
        </div>
    
        <div className="space-y-5 p-6">
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 text-center">
            <img
              src={qrUrl}
              alt={`QR code for visitor pass ${visitor.pass_code}`}
              className="mx-auto h-44 w-44 rounded-xl"
            />
            <p className="mt-4 text-xs font-bold uppercase tracking-wider text-slate-500">Pass Code</p>
            <p className="font-mono text-xl font-bold tracking-widest text-slate-800">{visitor.pass_code}</p>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Visitor</p>
            <p className="text-lg font-bold text-slate-800">{visitor.visitor_name}</p>
            <p className="text-sm text-slate-500">{visitor.mobile} • {visitor.visitor_type}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Date</p>
              <p className="mt-1 text-sm font-semibold text-slate-800">{formatVisitDate(visitor.visit_date)}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Time</p>
              <p className="mt-1 text-sm font-semibold text-slate-800">{formatVisitTime(visitor.start_time)} – {formatVisitTime(visitor.end_time)}</p>
            </div>
          </div>

          {visitor.otp ? (
            <div className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 p-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-amber-600">Security OTP</p>
                <p className="font-mono text-2xl font-bold tracking-widest text-amber-700">{visitor.otp}</p>
              </div>
              <Button type="button" variant="ghost" size="iconSm" onClick={copyOtp} title="Copy security OTP">
                <Copy size={17} />
              </Button>
            </div>
          ) : null}

          <div className="flex justify-end">
            <FileActions
              fileUrl={shareUrl}
              downloadUrl={qrUrl}
              onDownload={() => downloadVisitorPassPdf(visitor, qrUrl)}
              downloadName={`${visitor.pass_code}.pdf`}
              size="md"
            />
          </div>
        </div>
      </section>
    </main>
  );
};

export default PublicVisitorPassPage;
