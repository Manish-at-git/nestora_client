import { useState } from "react";
import { Calendar, CheckCircle2, Copy, MapPin, QrCode, Share2, Ticket } from "lucide-react";
import { toast } from "sonner";
import { ModalWrapper } from "@/components/common/ModalWrapper";
import { FormField } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppForm } from "@/hooks/useAppForm";
import { formatDateTime } from "@/utils";
import { useGetEventPassQuery, useShareEventPassMutation, type EventPassDetail } from "../api/eventsApi";
import { eventPassTransferSchema, type EventPassTransferFormValues } from "../schemas";
import { PassQRCode } from "./PassQRCode";

export const passLink = (id: string) => `${window.location.origin}/event-pass/${id}`;

export function EventPassContent({
  data,
  showBookingSuccess = false,
  allowSharing = false,
}: {
  data: EventPassDetail;
  showBookingSuccess?: boolean;
  allowSharing?: boolean;
}) {
  const { pass, event, association, transfers, is_owner: isOwner } = data;
  const [lastLink, setLastLink] = useState("");
  const [lastRecipientMobile, setLastRecipientMobile] = useState("");
  const [showShareForm, setShowShareForm] = useState(true);
  const [share, { isLoading }] = useShareEventPassMutation();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useAppForm<EventPassTransferFormValues>({
    schema: eventPassTransferSchema(pass.remaining_passes),
    defaultValues: { recipient_mobile: "", count: 1 },
  });
  const recipientMobileField = register("recipient_mobile");
  const url = passLink(pass.id);
  const transferCount = watch("count") || 1;
  const canShare = Boolean(allowSharing && isOwner && !pass.is_shared && pass.remaining_passes > 0);

  const copy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success("Pass link copied.");
    } catch {
      toast.error("Could not copy the link.");
    }
  };

  const transfer = async (values: EventPassTransferFormValues) => {
    try {
      const result = await share({
        passId: pass.id,
        recipient_mobile: values.recipient_mobile,
        count: values.count,
      }).unwrap();
      setLastLink(`${window.location.origin}${result.new_pass_link}`);
      setLastRecipientMobile(values.recipient_mobile);
      reset({ recipient_mobile: "", count: 1 });
      toast.success(result.message);
    } catch (error: any) {
      toast.error(error?.data || "Could not transfer passes.");
    }
  };

  const updateTransferCount = (value: number) => {
    setValue("count", Math.max(1, Math.min(pass.remaining_passes, value || 1)), { shouldValidate: true });
  };

  return (
    <div className="space-y-5">
      {showBookingSuccess && (
        <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-950">
          <CheckCircle2 size={22} className="mt-0.5 shrink-0 text-emerald-600" />
          <div>
            <p className="font-semibold">Payment successful — your pass is ready</p>
            <p className="mt-0.5 text-sm text-emerald-800">
              Your QR code has been generated. Save or share this pass before the event.
            </p>
          </div>
        </div>
      )}
      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5 text-white shadow-sm">
        <div className="flex items-center justify-between gap-3">
          {event.category ? (
            <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-blue-700">
              {event.category}
            </span>
          ) : <span />}
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
            {pass.status}
          </span>
        </div>

        <div className="mt-3">
          <h2 className="text-lg font-bold text-white">{event.title}</h2>
          {association?.name && <p className="text-sm text-slate-300">{association.name}</p>}
        </div>

        <div className="mt-4 flex justify-center rounded-xl border border-slate-700 bg-slate-800 p-4">
          <PassQRCode url={url} />
        </div>

        <div className="mt-4 flex items-center justify-center gap-2 text-center">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-300">Pass code:</span>
          <span className="font-mono text-sm font-bold tracking-wide text-white">{pass.pass_code}</span>
          <Button type="button" variant="ghost" size="iconSm" className="text-slate-200 hover:bg-slate-800 hover:text-white" aria-label="Copy pass code" onClick={() => copy(pass.pass_code)}>
            <Copy size={14} />
          </Button>
        </div>

        <div className="mt-4 grid gap-3 rounded-xl border border-slate-700 bg-slate-950/50 p-3 sm:grid-cols-2">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Attendee</p>
            <p className="mt-1 text-sm font-semibold text-white">{pass.buyer_name || "Member"}</p>
          </div>
          <div className="sm:text-right">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Available passes</p>
            <p className="mt-1 text-sm font-semibold text-emerald-400">
              {pass.remaining_passes} <span className="font-normal text-slate-400">/ {pass.total_passes}</span>
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-2 text-xs text-slate-300 sm:grid-cols-2">
          {event.starts_at && <span className="flex items-center gap-2"><Calendar size={14} className="text-blue-600" /> {formatDateTime(event.starts_at)}</span>}
          {event.location && <span className="flex items-center gap-2"><MapPin size={14} className="text-rose-500" /> {event.location}</span>}
        </div>
      </section>

      <div className="flex flex-wrap gap-2">
        {canShare && (
          <Button type="button" variant="primary" className="flex-1" onClick={() => setShowShareForm((visible) => !visible)}>
            <Share2 size={15} /> {showShareForm ? "Close share form" : "Share pass to a member"}
          </Button>
        )}
        <Button type="button" variant="outline" onClick={() => copy(url)}>
          <Copy size={15} /> Copy link
        </Button>
      </div>

      {canShare && showShareForm && (
        <form onSubmit={handleSubmit(transfer)} noValidate className="space-y-4 rounded-xl border border-blue-200 bg-blue-50/40 p-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="flex items-center gap-2 font-semibold text-slate-900"><Ticket size={16} className="text-blue-600" /> Share pass to another member</h3>
            <span className="text-xs font-semibold text-blue-700">Available to share: {pass.remaining_passes}</span>
          </div>
          <FormField label="Recipient member's mobile number" required error={errors.recipient_mobile?.message}>
            <Input
              type="tel"
              minLength={7}
              maxLength={15}
              placeholder="e.g. 9876543210"
              inputMode="numeric"
              pattern="[0-9]*"
              disabled={isLoading}
              error={Boolean(errors.recipient_mobile)}
              {...recipientMobileField}
              onChange={(event) => {
                event.target.value = event.target.value.replace(/\D/g, "").slice(0, 15);
                recipientMobileField.onChange(event);
              }}
            />
          </FormField>
          <p className="-mt-2 text-xs text-slate-500">If the member is registered, this pass will also link to their account.</p>
          <FormField label="Number of passes to transfer" required error={errors.count?.message}>
            <Input
              type="number"
              min={1}
              max={pass.remaining_passes}
              value={transferCount}
              onChange={(event) => updateTransferCount(Number(event.target.value))}
              disabled={isLoading}
              error={Boolean(errors.count)}
            />
          </FormField>
          <p className="-mt-2 text-xs text-slate-500">
            Deducting {transferCount} pass{transferCount === 1 ? "" : "es"}. You will have {pass.remaining_passes - transferCount} remaining.
          </p>
          <Button type="submit" className="w-full" disabled={isLoading} isLoading={isLoading}>
            <Share2 size={15} /> Transfer {transferCount} pass{transferCount === 1 ? "" : "es"} to member
          </Button>
          {lastLink && (
            <div className="space-y-2 rounded-lg border border-slate-200 bg-white p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                Recipient's pass link {lastRecipientMobile && `(${lastRecipientMobile})`}
              </p>
              <div className="flex items-center gap-2">
                <Input value={lastLink} readOnly aria-label="Recipient pass link" className="min-w-0 font-mono text-xs" />
                <Button
                  type="button"
                  variant="primary"
                  size="icon"
                  aria-label="Copy recipient pass link"
                  title="Copy recipient pass link"
                  onClick={() => copy(lastLink)}
                >
                  <Copy size={16} />
                </Button>
              </div>
            </div>
          )}
        </form>
      )}
      {allowSharing && isOwner && transfers.length > 0 && (
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-slate-900">Transfer history</h3>
            <p className="mt-0.5 text-xs text-slate-500">Passes you have shared with other members.</p>
          </div>
          {transfers.map((transfer) => (
            <div key={transfer.new_pass_id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/80 p-3.5">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                  <Share2 size={16} />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900">Shared with member</p>
                  <p className="truncate font-mono text-xs text-slate-600">{transfer.recipient_mobile}</p>
                  <p className="mt-1 text-[11px] text-slate-500">{formatDateTime(transfer.created_at)}</p>
                </div>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-2">
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                  {transfer.count} pass{transfer.count === 1 ? "" : "es"}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  aria-label="Copy recipient pass link"
                  onClick={() => copy(passLink(transfer.new_pass_id))}
                >
                  <Copy size={13} /> Copy link
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function EventPassModal({
  passId,
  onClose,
  showBookingSuccess = false,
  allowSharing = false,
}: {
  passId: string | null;
  onClose: () => void;
  showBookingSuccess?: boolean;
  allowSharing?: boolean;
}) {
  const { data, isLoading, error } = useGetEventPassQuery(passId || "", { skip: !passId });
  return (
    <ModalWrapper
      isOpen={Boolean(passId)}
      onClose={onClose}
      title={showBookingSuccess ? "Payment successful" : "Digital event pass"}
      description={showBookingSuccess ? "Your event pass has been generated." : undefined}
      icon={showBookingSuccess ? <CheckCircle2 size={18} className="text-emerald-600" /> : <QrCode size={18} />}
      size="lg"
    >
      {isLoading && <p>Loading pass…</p>}
      {error && <p className="text-rose-600">Could not load this pass.</p>}
      {data && (
        <EventPassContent
          data={data}
          showBookingSuccess={showBookingSuccess}
          allowSharing={allowSharing}
        />
      )}
    </ModalWrapper>
  );
}
