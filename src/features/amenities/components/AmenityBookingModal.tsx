import React, { useState, useEffect, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Wallet,
  QrCode,
  CheckCircle2,
  Calendar as CalendarIcon,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { ModalWrapper, FormField } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { StatusPill } from "@/components/common/StatusPill";
import { useRetainedModalData } from "@/hooks/useRetainedModalData";
import {
  useLazyGetAmenityMonthBookingsQuery,
  useBookAmenityMutation,
} from "../api/amenitiesApi";
import type { Amenity, TimeSlot, MonthBookingSlot } from "../types";

export interface AmenityBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  amenity: Amenity | null;
  currencySymbol?: string;
  onBookingSuccess?: () => void;
}

export const AmenityBookingModal: React.FC<AmenityBookingModalProps> = ({
  isOpen,
  onClose,
  amenity: activeAmenity,
  currencySymbol = "$",
  onBookingSuccess,
}) => {
  const amenity = useRetainedModalData(activeAmenity);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [bookingDate, setBookingDate] = useState<string>("");
  const [timePeriod, setTimePeriod] = useState<string>("2");
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"wallet" | "upi">("wallet");
  const [payPin, setPayPin] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [fetchMonthBookings, { data: monthBookings = [] }] = useLazyGetAmenityMonthBookingsQuery();
  const [bookAmenity, { isLoading: isBooking }] = useBookAmenityMutation();

  // Reset state when opening or when amenity changes
  useEffect(() => {
    if (isOpen && amenity) {
      setStep(1);
      const now = new Date();
      setCurrentMonth(now);
      setBookingDate("");
      setSelectedSlot(null);
      setTimePeriod("2");
      setPaymentMethod("wallet");
      setPayPin("");
      setErrors({});

      const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
      fetchMonthBookings({ amenityId: amenity.id, month: monthStr });
    }
  }, [isOpen, amenity, fetchMonthBookings]);

  const changeMonth = (offset: number) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset, 1);
    setCurrentMonth(newDate);
    if (amenity) {
      const monthStr = `${newDate.getFullYear()}-${String(newDate.getMonth() + 1).padStart(2, "0")}`;
      fetchMonthBookings({ amenityId: amenity.id, month: monthStr });
    }
  };

  // Calendar calculations
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  const today = useMemo(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  }, []);

  const formatTime = (timeVal: string | number | null | undefined): string => {
    if (timeVal == null) return "";
    if (typeof timeVal === "string") return timeVal.substring(0, 5);
    if (typeof timeVal === "number") {
      const hrs = Math.floor(timeVal / 3600);
      const mins = Math.floor((timeVal % 3600) / 60);
      return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
    }
    return String(timeVal).substring(0, 5);
  };

  // Dynamic Slot generation
  const slots = useMemo<TimeSlot[]>(() => {
    const duration = timePeriod === "1 Day" ? 17 : parseInt(timePeriod, 10) || 1;
    const res: TimeSlot[] = [];
    let currentHour = 6; // 06:00
    while (currentHour + duration <= 23) {
      const start = `${String(currentHour).padStart(2, "0")}:00`;
      const end = `${String(currentHour + duration).padStart(2, "0")}:00`;
      res.push({ start, end, duration });
      currentHour += duration;
    }
    return res;
  }, [timePeriod]);

  const isSlotAvailable = (slot: TimeSlot, dateStr: string): boolean => {
    if (!dateStr) return false;

    // Check if slot is in the past for today's date
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

    if (dateStr === todayStr) {
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentTimeStr = `${String(currentHour).padStart(2, "0")}:${String(currentMinute).padStart(2, "0")}`;
      if (slot.start < currentTimeStr) {
        return false;
      }
    }

    const dayBookings = (monthBookings as MonthBookingSlot[]).filter(
      (b) => b.booking_date === dateStr
    );

    for (const b of dayBookings) {
      if (b.start_time == null || b.end_time == null) continue;
      const bStart = formatTime(b.start_time);
      const bEnd = formatTime(b.end_time);
      // Overlap check
      if (slot.start < bEnd && slot.end > bStart) {
        return false;
      }
    }
    return true;
  };

  const chargePerHour = typeof amenity?.charges === "number" ? amenity.charges : parseFloat(String(amenity?.charges || "0"));
  const totalAmount = selectedSlot ? selectedSlot.duration * chargePerHour : 0;

  const handleProceedToPayment = () => {
    if (!bookingDate) {
      toast.error("Please select a date on the calendar.");
      return;
    }
    if (!selectedSlot) {
      toast.error("Please select an available time slot.");
      return;
    }
    setStep(2);
  };

  const handleConfirmAndPay = async () => {
    if (!amenity || !selectedSlot || !bookingDate) return;

    // Validation
    if (paymentMethod === "wallet") {
      if (!payPin.trim()) {
        setErrors({ pin: "Security PIN is required for wallet payment." });
        return;
      }
      if (payPin.trim().length < 4) {
        setErrors({ pin: "Security PIN must be at least 4 digits." });
        return;
      }
    }

    setErrors({});

    try {
      const res = await bookAmenity({
        amenityId: amenity.id,
        payload: {
          booking_date: bookingDate,
          start_time: selectedSlot.start,
          end_time: selectedSlot.end,
          duration_hours: selectedSlot.duration,
          payment_method: paymentMethod,
          pin: paymentMethod === "wallet" ? payPin : undefined,
        },
      }).unwrap();

      if (res.ok) {
        setStep(3);
        if (onBookingSuccess) onBookingSuccess();
      }
    } catch (err: any) {
      toast.error(err?.data?.detail || err?.data || "Failed to complete booking. Please check your balance/PIN.");
    }
  };

  if (!amenity) return null;

  // Standard Modal Footer Buttons
  const renderFooter = () => {
    if (step === 3) return null;

    if (step === 1) {
      return (
        <div className="flex items-center justify-end gap-3 w-full">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold"
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={!bookingDate || !selectedSlot}
            onClick={handleProceedToPayment}
            className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-5"
          >
            Proceed to Payment
          </Button>
        </div>
      );
    }

    if (step === 2) {
      return (
        <div className="flex items-center justify-end gap-3 w-full">
          <Button
            type="button"
            variant="outline"
            onClick={() => setStep(1)}
            disabled={isBooking}
            className="rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold"
          >
            Back
          </Button>
          <Button
            type="button"
            disabled={isBooking}
            onClick={handleConfirmAndPay}
            className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-5"
          >
            {isBooking ? "Authorizing..." : `Pay ${currencySymbol}${totalAmount.toFixed(2)}`}
          </Button>
        </div>
      );
    }

    return null;
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title={
        step === 1
          ? `Book ${amenity.name}`
          : step === 2
          ? "Confirm Booking & Payment"
          : "Booking Confirmed"
      }
      subtitle={
        step === 1
          ? "Select your preferred date and time duration."
          : step === 2
          ? "Review booking breakdown and authorize transaction."
          : "Your reservation is confirmed and active."
      }
      size="2xl"
      badge={
        <StatusPill
          status={step === 1 ? "Step 1 of 2" : step === 2 ? "Step 2 of 2" : "Completed"}
          variant={step === 3 ? "success" : "info"}
          dot={true}
          size="xs"
        />
      }
      footer={renderFooter()}
    >
      <div className="py-1">
        {/* STEP 1: Date & Time Slots Selection */}
        {step === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column: Calendar */}
            <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-slate-800">
                  {currentMonth.toLocaleString("default", { month: "long", year: "numeric" })}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => changeMonth(-1)}
                    className="p-1.5 hover:bg-white rounded-lg text-slate-600 transition-colors border border-transparent hover:border-slate-200"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => changeMonth(1)}
                    className="p-1.5 hover:bg-white rounded-lg text-slate-600 transition-colors border border-transparent hover:border-slate-200"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-slate-400 mb-2">
                <div>Su</div><div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                  <div key={`blank-${i}`} className="p-2" />
                ))}

                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                  const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                  const isPast = date < today;
                  const isSelected = bookingDate === dateStr;

                  const dayBookings = (monthBookings as MonthBookingSlot[]).filter(
                    (b) => b.booking_date === dateStr
                  );
                  const isBooked = dayBookings.length > 0;
                  const totalHrs = dayBookings.reduce((acc, curr) => acc + (curr.duration_hours || 0), 0);
                  const isFullyBooked = totalHrs >= 16;

                  return (
                    <button
                      key={day}
                      type="button"
                      disabled={isPast || isFullyBooked}
                      onClick={() => {
                        setBookingDate(dateStr);
                        setSelectedSlot(null);
                      }}
                      className={`relative h-9 rounded-xl flex flex-col items-center justify-center text-xs font-medium transition-all ${
                        isSelected
                          ? "bg-slate-900 text-white shadow-xs font-semibold"
                          : isPast
                          ? "text-slate-300 cursor-not-allowed"
                          : isFullyBooked
                          ? "text-slate-400 bg-slate-100 cursor-not-allowed line-through"
                          : "text-slate-700 hover:bg-slate-100 hover:text-slate-900 bg-white border border-slate-100 cursor-pointer"
                      }`}
                    >
                      <span>{day}</span>
                      {isBooked && !isPast && !isSelected && (
                        <span
                          className={`absolute bottom-1 w-1 h-1 rounded-full ${
                            isFullyBooked ? "bg-rose-500" : "bg-amber-400"
                          }`}
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-500">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> Available
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400" /> Partially Booked
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-400" /> Fully Booked
                </div>
              </div>
            </div>

            {/* Right Column: Duration & Slots */}
            <div className="space-y-4 flex flex-col">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Booking Duration
                </label>
                <Select
                  value={timePeriod}
                  onValueChange={(val) => {
                    setTimePeriod(val);
                    setSelectedSlot(null);
                  }}
                  options={[
                    { value: "1", label: "1 Hour" },
                    { value: "2", label: "2 Hours" },
                    { value: "3", label: "3 Hours" },
                    { value: "4", label: "4 Hours" },
                    { value: "6", label: "6 Hours" },
                    { value: "8", label: "8 Hours" },
                    { value: "10", label: "10 Hours" },
                    { value: "12", label: "12 Hours" },
                    { value: "1 Day", label: "Full Day (06:00 - 23:00)" },
                  ]}
                  size="sm"
                />
              </div>

              {bookingDate ? (
                <div className="flex-1 flex flex-col">
                  <p className="text-xs font-semibold text-slate-700 mb-2">
                    Available Slots for {new Date(bookingDate).toLocaleDateString(undefined, { dateStyle: "medium" })}
                  </p>
                  <div className="grid grid-cols-2 gap-2 max-h-[190px] overflow-y-auto pr-1">
                    {slots.map((slot, i) => {
                      const available = isSlotAvailable(slot, bookingDate);
                      const isSelected = selectedSlot?.start === slot.start;

                      return (
                        <button
                          key={i}
                          type="button"
                          disabled={!available}
                          onClick={() => setSelectedSlot(slot)}
                          className={`p-2.5 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                            !available
                              ? "bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed opacity-60"
                              : isSelected
                              ? "bg-slate-900 border-slate-900 text-white shadow-xs font-semibold"
                              : "bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                          }`}
                        >
                          <Clock size={13} className={!available ? "opacity-50" : ""} />
                          {slot.start} - {slot.end}
                        </button>
                      );
                    })}
                  </div>

                  {/* Summary Rate Footer */}
                  {selectedSlot && (
                    <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">Estimated Total:</span>
                      <span className="text-sm font-bold text-slate-900">
                        {currencySymbol}
                        {totalAmount.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400 border border-dashed border-slate-200 rounded-2xl p-6">
                  <CalendarIcon size={28} className="opacity-40 mb-2 text-slate-400" />
                  <p className="text-xs font-medium text-slate-600">Select a date to view available slots</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 2: Payment Details */}
        {step === 2 && selectedSlot && (
          <div className="max-w-md mx-auto space-y-5">
            {/* Booking Summary Box */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center space-y-1.5">
              <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Total Amount</span>
              <p className="text-3xl font-extrabold text-slate-900">
                {currencySymbol}
                {totalAmount.toFixed(2)}
              </p>
              <p className="text-xs text-slate-600">
                {selectedSlot.duration} hour(s) reservation for{" "}
                <strong className="text-slate-800">{amenity.name}</strong> on{" "}
                {new Date(bookingDate).toLocaleDateString(undefined, { dateStyle: "medium" })} ({selectedSlot.start} - {selectedSlot.end})
              </p>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2.5">
              <label className="block text-xs font-semibold text-slate-700">Choose Payment Method</label>
              
              <button
                type="button"
                onClick={() => setPaymentMethod("wallet")}
                className={`w-full p-3.5 rounded-2xl border flex items-center justify-between transition-all ${
                  paymentMethod === "wallet"
                    ? "border-slate-900 bg-slate-50/80 shadow-xs ring-1 ring-slate-900/10"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                    <Wallet size={18} />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-slate-800">Nestora Wallet</p>
                    <p className="text-[11px] text-slate-500">Instant deduction with security PIN</p>
                  </div>
                </div>
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    paymentMethod === "wallet" ? "border-slate-900" : "border-slate-300"
                  }`}
                >
                  {paymentMethod === "wallet" && <div className="w-2 h-2 rounded-full bg-slate-900" />}
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("upi")}
                className={`w-full p-3.5 rounded-2xl border flex items-center justify-between transition-all ${
                  paymentMethod === "upi"
                    ? "border-slate-900 bg-slate-50/80 shadow-xs ring-1 ring-slate-900/10"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <QrCode size={18} />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-slate-800">UPI / QR Code</p>
                    <p className="text-[11px] text-slate-500">Google Pay, PhonePe, Paytm</p>
                  </div>
                </div>
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    paymentMethod === "upi" ? "border-slate-900" : "border-slate-300"
                  }`}
                >
                  {paymentMethod === "upi" && <div className="w-2 h-2 rounded-full bg-slate-900" />}
                </div>
              </button>
            </div>

            {/* Wallet PIN Input */}
            {paymentMethod === "wallet" && (
              <FormField
                label="Wallet Security PIN"
                required={true}
                error={errors.pin}
                helperText="Enter your 4–6 digit security PIN to authorize this deduction."
              >
                <div className="relative">
                  <Input
                    type="password"
                    maxLength={6}
                    value={payPin}
                    onChange={(e) => {
                      setPayPin(e.target.value);
                      if (errors.pin) {
                        setErrors((prev) => {
                          const n = { ...prev };
                          delete n.pin;
                          return n;
                        });
                      }
                    }}
                    placeholder="••••"
                    className="text-center font-mono tracking-widest text-lg h-11"
                    error={Boolean(errors.pin)}
                  />
                  <ShieldCheck size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </FormField>
            )}
          </div>
        )}

        {/* STEP 3: Booking Success */}
        {step === 3 && selectedSlot && (
          <div className="py-6 text-center space-y-4 max-w-sm mx-auto">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 size={36} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Reservation Confirmed!</h3>
              <p className="text-xs text-slate-500 mt-1">
                You have successfully reserved <strong className="text-slate-800">{amenity.name}</strong>.
              </p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs space-y-1 text-slate-600">
              <p>
                <strong>Date:</strong> {new Date(bookingDate).toLocaleDateString(undefined, { dateStyle: "full" })}
              </p>
              <p>
                <strong>Time:</strong> {selectedSlot.start} – {selectedSlot.end} ({selectedSlot.duration} hrs)
              </p>
              <p>
                <strong>Paid:</strong> {currencySymbol}{totalAmount.toFixed(2)} ({paymentMethod === "wallet" ? "Wallet" : "UPI"})
              </p>
            </div>

            <Button
              onClick={onClose}
              className="w-full h-10 rounded-xl bg-slate-900 text-white font-medium text-xs shadow-xs hover:bg-slate-800"
            >
              Done
            </Button>
          </div>
        )}
      </div>
    </ModalWrapper>
  );
};
