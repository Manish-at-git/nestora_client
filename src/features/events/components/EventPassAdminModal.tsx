import { useEffect, useRef, useState } from "react";
import { QrCode } from "lucide-react";
import { toast } from "sonner";
import { ModalWrapper } from "@/components/common/ModalWrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { ROLE_CODE } from "@/constants/roleCodes";
import { formatDateTime } from "@/utils/commonFunctions";
import type { EventItem } from "../types";
import {
  useCheckInEventPassMutation, useGetEventPassesQuery, useVerifyEventPassMutation,
} from "../api/eventsApi";

const showError = (error: unknown) => {
  const value = error as { data?: string };
  toast.error(value?.data || "The pass action failed.");
};

type BarcodeReader = { detect: (video: HTMLVideoElement) => Promise<Array<{ rawValue: string }>> };
type BarcodeReaderConstructor = new (options: { formats: string[] }) => BarcodeReader;

export function EventPassScannerModal({ event, onClose }: { event: EventItem | null; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<any>(null);
  const [admitCount, setAdmitCount] = useState(1);
  const [cameraError, setCameraError] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const [verify, { isLoading: verifying }] = useVerifyEventPassMutation();
  const [checkIn, { isLoading: checkingIn }] = useCheckInEventPassMutation();

  const lookup = async (value: string) => {
    if (!event || !value.trim()) return;
    try {
      const found = await verify({ eventId: event.id, query: value.trim() }).unwrap();
      setResult(found);
      setAdmitCount(1);
    } catch (error) {
      showError(error);
    }
  };

  useEffect(() => {
    if (!event || result) return;
    let stream: MediaStream | null = null;
    let timer: number | undefined;
    let cancelled = false;

    const start = async () => {
      const Detector = (window as Window & { BarcodeDetector?: BarcodeReaderConstructor }).BarcodeDetector;
      if (!Detector) {
        setCameraError("Camera scanning is unavailable in this browser. Use manual lookup.");
        return;
      }
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        if (cancelled || !videoRef.current) return;
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        const detector = new Detector({ formats: ["qr_code"] });
        timer = window.setInterval(async () => {
          if (!videoRef.current || videoRef.current.readyState < 2) return;
          try {
            const codes = await detector.detect(videoRef.current);
            if (codes[0]?.rawValue) {
              window.clearInterval(timer);
              setQuery(codes[0].rawValue);
              lookup(codes[0].rawValue);
            }
          } catch {
            // Retry on the next frame.
          }
        }, 450);
      } catch {
        setCameraError("Camera unavailable. Allow camera access or use manual lookup.");
      }
    };

    start();
    return () => {
      cancelled = true;
      if (timer) window.clearInterval(timer);
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, [event?.id, result]);

  const admit = async () => {
    if (!event || !result?.pass) return;
    try {
      const response = await checkIn({ eventId: event.id, passId: result.pass.id, admit_count: admitCount }).unwrap();
      toast.success(response.message);
      setResult(null);
      setQuery("");
    } catch (error) {
      showError(error);
    }
  };

  return (
    <ModalWrapper isOpen={Boolean(event)} onClose={onClose} title={`Gate scanner · ${event?.title || ""}`} size="lg">
      <div className="space-y-4">
        {!result && <video ref={videoRef} muted playsInline className="w-full max-h-56 rounded-xl bg-slate-900" />}
        {cameraError && <p className="text-sm text-slate-600">{cameraError}</p>}
        <div className="flex gap-2">
          <Input placeholder="Pass code, link, ID, or mobile" value={query} onChange={(change) => setQuery(change.target.value)} />
          <Button type="button" disabled={verifying || !query.trim()} onClick={() => lookup(query)}>Verify</Button>
        </div>
        {result?.wrong_event && <p className="text-rose-600">{result.message}</p>}
        {result && !result.wrong_event && (
          <div className="space-y-3 rounded-xl border p-4">
            <p className="font-semibold">{result.pass.buyer_name} · {result.pass.pass_code}</p>
            <p>{result.remaining_passes} remaining · {result.checked_in_passes} checked in</p>
            {result.can_check_in ? (
              <div className="flex items-center gap-2">
                <Input type="number" min={1} max={result.remaining_passes} value={admitCount} onChange={(change) => setAdmitCount(Math.max(1, Math.min(result.remaining_passes, Number(change.target.value) || 1)))} />
                <Button type="button" disabled={checkingIn} onClick={admit}>Admit</Button>
              </div>
            ) : <p className="text-amber-700">All attendees on this pass have entered.</p>}
          </div>
        )}
        {result && <Button type="button" variant="outline" onClick={() => { setResult(null); setQuery(""); }}>Scan next pass</Button>}
      </div>
    </ModalWrapper>
  );
}

export function AdminEventPassesModal({ event, onClose, onView }: {
  event: EventItem | null;
  onClose: () => void;
  onView: (id: string) => void;
}) {
  const { account } = useAuth();
  const isBoardMember = account?.role_code === ROLE_CODE.BOARD_MEMBER;
  const { data, isLoading } = useGetEventPassesQuery(event?.id || "", { skip: !event });
  const [search, setSearch] = useState("");
  const [checkIn, { isLoading: checkingIn }] = useCheckInEventPassMutation();
  const passes = data?.passes.filter((pass) =>
    `${pass.buyer_name} ${pass.buyer_mobile} ${pass.pass_code}`.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const admitOne = async (id: string) => {
    if (!event) return;
    try {
      await checkIn({ eventId: event.id, passId: id, admit_count: 1 }).unwrap();
      toast.success("Admitted one attendee.");
    } catch (error) {
      showError(error);
    }
  };

  return (
    <ModalWrapper
      isOpen={Boolean(event)}
      onClose={onClose}
      title="Issued event passes"
      description={event?.title || "Review issued passes and admission progress."}
      size="3xl"
    >
      <div className="space-y-5">
        {data && (
          <div className={`grid gap-2 ${isBoardMember ? "grid-cols-4" : "grid-cols-3"}`}>
            <div className="flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50 px-3 py-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-blue-700">Booked</p>
              <p className="text-base font-bold text-blue-950">{data.summary.total_passes_booked}</p>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-700">Checked in</p>
              <p className="text-base font-bold text-emerald-950">{data.summary.total_checked_in}</p>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-700">Remaining</p>
              <p className="text-base font-bold text-amber-950">{data.summary.total_active_passes}</p>
            </div>
            {isBoardMember && (
              <div className="flex items-center justify-between rounded-lg border border-violet-200 bg-violet-50 px-3 py-2">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-violet-700">Revenue</p>
                <p className="text-base font-bold text-violet-950">₹{data.summary.total_revenue ?? 0}</p>
              </div>
            )}
          </div>
        )}

        <Input
          placeholder="Search by attendee, mobile number, or pass code"
          value={search}
          onChange={(change) => setSearch(change.target.value)}
        />

        {isLoading && <p className="text-sm text-slate-500">Loading issued passes…</p>}

        {!isLoading && passes.length > 0 && (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="hidden grid-cols-[minmax(0,1.1fr)_minmax(0,1.5fr)_auto] gap-4 border-b border-slate-200 bg-slate-50 px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500 sm:grid">
              <span>Attendee</span>
              <span>Pass details</span>
              <span>Actions</span>
            </div>
            {passes.map((pass) => (
              <div key={pass.id} className="grid gap-3 border-b border-slate-100 p-4 transition-colors last:border-b-0 hover:bg-slate-50/70 sm:grid-cols-[minmax(0,1.1fr)_minmax(0,1.5fr)_auto] sm:items-center sm:gap-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">{pass.buyer_name || "Member"}</p>
                  {pass.shared_from_pass_id ? (
                    <span className="mt-1.5 inline-flex rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700">
                      Shared pass
                    </span>
                  ) : <></>}
                </div>
                <div className="grid gap-x-4 gap-y-2 text-xs sm:grid-cols-[minmax(0,1.2fr)_auto_auto] sm:items-center">
                  <div>
                    <p className="text-slate-500">Pass code</p>
                    <p className="mt-0.5 truncate font-mono font-semibold text-blue-700">{pass.pass_code}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Remaining</p>
                    <p className="mt-0.5 inline-flex rounded-full bg-emerald-50 px-2 py-0.5 font-semibold text-emerald-700">{pass.remaining_passes} / {pass.total_passes}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Admitted</p>
                    <p className="mt-0.5 font-semibold text-slate-800">{pass.checked_in_passes}</p>
                  </div>
                  <div className="sm:col-span-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${pass.status === "Active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                      {pass.status === "Active" ? "Active · entry allowed" : pass.status}
                    </span>
                    {pass.last_checked_in_at && (
                      <span className="ml-2 text-[11px] text-slate-500">
                        Last admitted {formatDateTime(pass.last_checked_in_at)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:justify-end">
                  <Button type="button" size="sm" disabled={checkingIn || pass.status !== "Active" || pass.remaining_passes <= 0} onClick={() => admitOne(pass.id)}>Admit 1</Button>
                  <Button type="button" variant="outline" size="iconSm" aria-label={`View pass ${pass.pass_code}`} title="View pass" onClick={() => onView(pass.id)}>
                    <QrCode size={15} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && passes.length === 0 && (
          <p className="rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
            No issued passes match this search.
          </p>
        )}
      </div>
    </ModalWrapper>
  );
}
