import { useEffect, useState } from "react";
import {
  ArrowRight,
  Calendar,
  MapPin,
  Minus,
  Plus,
  QrCode,
  ShieldCheck,
  Ticket,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { FormModal, FormField } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGetWalletQuery } from "@/features/wallet/api/walletApi";
import { formatDateTime } from "@/utils";
import type { EventItem } from "../types";
import { useBookEventPassMutation } from "../api/eventsApi";

export function EventPassBookingModal({ event, onClose, onBooked }: {
  event: EventItem | null;
  onClose: () => void;
  onBooked: (id: string) => void;
}) {
  const [count, setCount] = useState(1);
  const [pin, setPin] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"wallet" | "upi">("wallet");
  const [book, { isLoading }] = useBookEventPassMutation();
  const { data: wallet } = useGetWalletQuery(undefined, { skip: !event });
  const price = Number(event?.pass_price ?? event?.fee_amount ?? 0);
  const total = price * count;
  const limit = Math.min(event?.max_passes_per_user || 10, 50);
  const walletBalance = Number(wallet?.balance || 0);
  const hasEnoughBalance = walletBalance >= total;

  useEffect(() => {
    setCount(1);
    setPin("");
    setPaymentMethod("wallet");
  }, [event?.id]);

  const updateCount = (nextCount: number) => {
    setCount(Math.max(1, Math.min(limit, nextCount || 1)));
  };

  const submit = async () => {
    if (!event) return;
    try {
      const result = await book({
        eventId: event.id,
        member_count: count,
        payment_method: paymentMethod,
        pin: paymentMethod === "wallet" ? pin : undefined,
      }).unwrap();
      toast.success(result.message);
      onClose();
      onBooked(result.pass_id);
    } catch (error: any) {
      toast.error(error?.data || "Could not book passes.");
    }
  };

  return (
    <FormModal
      isOpen={Boolean(event)}
      onClose={onClose}
      title="Book event pass"
      description="Choose the number of attendees and complete payment securely."
      icon={<Ticket size={18} />}
      onSubmit={submit}
      isSubmitting={isLoading}
      submitText={total > 0
        ? paymentMethod === "upi"
          ? `Pay ₹${total.toFixed(2)} via UPI`
          : `Pay ₹${total.toFixed(2)} and generate pass`
        : "Generate free pass"}
      submitIcon={<ArrowRight size={16} />}
      submitVariant="primary"
      submitDisabled={total > 0 && (!wallet || (paymentMethod === "wallet" && (!hasEnoughBalance || !pin)))}
      size="lg"
    >
      <div className="space-y-5">
        <section className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
          <p className="font-semibold text-slate-900">{event?.title}</p>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-600">
            {event?.starts_at && (
              <span className="inline-flex items-center gap-1.5">
                <Calendar size={13} className="text-blue-600" /> {formatDateTime(event.starts_at)}
              </span>
            )}
            {event?.location && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin size={13} className="text-rose-500" /> {event.location}
              </span>
            )}
          </div>
        </section>

        <section className="rounded-xl border border-blue-200 bg-blue-50/60 p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Select pass count</h3>
              <p className="mt-0.5 text-xs text-slate-500">How many attendees are you booking for?</p>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-slate-500">Fee per member</p>
              <p className="text-base font-bold text-blue-700">₹{price.toFixed(2)}</p>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-blue-200 bg-white p-2.5">
            <div className="flex items-center rounded-lg bg-slate-50 p-1">
              <Button
                type="button"
                variant="ghost"
                size="iconSm"
                aria-label="Remove one pass"
                disabled={isLoading || count <= 1}
                onClick={() => updateCount(count - 1)}
              >
                <Minus size={15} />
              </Button>
              <Input
                type="number"
                min={1}
                max={limit}
                value={count}
                disabled={isLoading}
                aria-label="Number of attendees"
                className="h-8 w-full appearance-none border-0 bg-transparent px-1 text-center font-semibold shadow-none [-moz-appearance:textfield] focus-visible:ring-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                onChange={(change) => updateCount(Number(change.target.value))}
              />
              <Button
                type="button"
                variant="ghost"
                size="iconSm"
                aria-label="Add one pass"
                disabled={isLoading || count >= limit}
                onClick={() => updateCount(count + 1)}
              >
                <Plus size={15} />
              </Button>
            </div>
            <div className="text-right">
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Total amount</p>
              <p className="text-xl font-bold text-emerald-600">₹{total.toFixed(2)}</p>
            </div>
          </div>

          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
            <span>₹{price.toFixed(2)} × {count} pass{count === 1 ? "" : "es"}</span>
            <span>Maximum {limit} per member</span>
          </div>
        </section>

        {total > 0 ? (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900">Payment method</h3>
              <span className="text-xs font-medium text-slate-500">Choose one option</span>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                disabled={isLoading}
                onClick={() => setPaymentMethod("wallet")}
                className={`flex items-center justify-between rounded-xl border p-3 text-left transition-colors ${paymentMethod === "wallet"
                  ? "border-blue-500 bg-blue-50"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"}`}
              >
                <span className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white">
                    <Wallet size={17} />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-slate-900">Nestora Wallet</span>
                    <span className="block text-xs text-slate-500">Balance: ₹{walletBalance.toFixed(2)}</span>
                  </span>
                </span>
                <span className={`h-4 w-4 rounded-full border-2 ${paymentMethod === "wallet" ? "border-blue-600 bg-blue-600 shadow-[inset_0_0_0_3px_white]" : "border-slate-300"}`} />
              </button>
              <button
                type="button"
                disabled={isLoading}
                onClick={() => setPaymentMethod("upi")}
                className={`flex items-center justify-between rounded-xl border p-3 text-left transition-colors ${paymentMethod === "upi"
                  ? "border-emerald-500 bg-emerald-50"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"}`}
              >
                <span className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white">
                    <QrCode size={17} />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-slate-900">Instant UPI</span>
                    <span className="block text-xs text-slate-500">GPay, PhonePe, Paytm</span>
                  </span>
                </span>
                <span className={`h-4 w-4 rounded-full border-2 ${paymentMethod === "upi" ? "border-emerald-600 bg-emerald-600 shadow-[inset_0_0_0_3px_white]" : "border-slate-300"}`} />
              </button>
            </div>

            {paymentMethod === "wallet" ? (
              <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Pay securely from your wallet</p>
                    <p className="mt-0.5 text-xs text-slate-500">Enter your security PIN to authorize this payment.</p>
                  </div>
                  <ShieldCheck size={19} className="shrink-0 text-blue-600" aria-label="Secure payment" />
                </div>

                {!wallet ? (
                  <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
                    A Nestora Wallet is required to complete this booking.
                  </p>
                ) : !hasEnoughBalance ? (
                  <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">
                    Insufficient wallet balance. Add money before booking this pass.
                  </p>
                ) : (
                  <p className="mt-3 text-xs text-emerald-700">Your wallet has enough balance for this booking.</p>
                )}

                <div className="mt-4">
                  <FormField label="Wallet security PIN">
                    <Input
                      type="password"
                      inputMode="numeric"
                      value={pin}
                      disabled={isLoading}
                      placeholder="Enter your PIN"
                      onChange={(change) => setPin(change.target.value)}
                      required
                    />
                  </FormField>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white">
                    <QrCode size={19} />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-emerald-950">Instant UPI payment</p>
                  </div>
                </div>
                {!wallet ? (
                  <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
                    A Nestora Wallet profile is required to record the UPI payment.
                  </p>
                ) : <></>}
              </div>
            )}
          </section>
        ) : (
          <section className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white">
              <Ticket size={17} />
            </span>
            <span>This is a free event. Your QR pass will be generated immediately.</span>
          </section>
        )}

        <p className="flex items-center gap-2 text-xs text-slate-500">
          <QrCode size={15} className="text-blue-600" /> Your unique QR pass can be shared after booking.
        </p>
      </div>
    </FormModal>
  );
}
