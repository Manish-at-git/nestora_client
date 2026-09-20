import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Mail } from "lucide-react";
import { MotionPage } from "@/components/common/MotionWrapper";
import { CodeInput } from "../components/CodeInput";
import { formatApiErrorDetail } from "@/services/api/apiClient";
import { useRequestPasswordResetMutation, useVerifyPasswordResetOtpMutation } from "../api/authApi";

export const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [seconds, setSeconds] = useState(0);
  const [requestReset, requestState] = useRequestPasswordResetMutation();
  const [verifyOtp, verifyState] = useVerifyPasswordResetOtpMutation();

  useEffect(() => {
    if (!seconds) return;
    const timer = window.setInterval(() => setSeconds((value) => Math.max(value - 1, 0)), 1000);
    return () => window.clearInterval(timer);
  }, [seconds]);

  const submitEmail = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    try {
      await requestReset({ email: email.trim() }).unwrap();
      setStep("otp");
      setSeconds(60);
      toast.success("If an account exists, a reset code has been sent.");
    } catch (cause) {
      const message = formatApiErrorDetail((cause as any)?.data) || "Unable to send reset code.";
      setError(message);
      toast.error(message);
    }
  };

  const submitOtp = async (event: React.FormEvent) => {
    event.preventDefault();
    if (otp.length !== 6) return setError("Enter the complete 6-digit code.");
    setError("");
    try {
      await verifyOtp({ email: email.trim(), otp }).unwrap();
      navigate("/reset-password", { state: { email: email.trim(), otp } });
    } catch (cause) {
      const message = formatApiErrorDetail((cause as any)?.data) || "Invalid or expired reset code.";
      setError(message);
      toast.error(message);
    }
  };

  const resend = async () => {
    if (seconds) return;
    try {
      await requestReset({ email: email.trim() }).unwrap();
      setSeconds(60);
      setOtp("");
      toast.success("A new reset code has been sent.");
    } catch (cause) {
      toast.error(formatApiErrorDetail((cause as any)?.data) || "Unable to resend code.");
    }
  };

  const loading = requestState.isLoading || verifyState.isLoading;
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <MotionPage className="w-full max-w-md">
        <button type="button" onClick={() => (step === "email" ? navigate("/signin") : setStep("email"))} className="text-sm text-muted hover:text-ink inline-flex items-center gap-2 mb-8 cursor-pointer">
          <ArrowLeft size={14} /> Back
        </button>
        <p className="uppercase tracking-[0.28em] text-[11px] text-muted mb-3">Account recovery</p>
        <h1 className="font-display text-4xl mb-2">{step === "email" ? "Forgot password." : "Verify your code."}</h1>
        <p className="text-muted mb-8">{step === "email" ? "Enter your registered email and we’ll send a one-time code." : `We sent a 6-digit code to ${email}.`}</p>
        <form onSubmit={step === "email" ? submitEmail : submitOtp}>
          {step === "email" ? (
            <div className="relative">
              <label className="block uppercase tracking-[0.22em] text-[11px] text-muted mb-2">Registered email</label>
              <input className="input-underline pr-10" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" />
              <Mail size={16} className="absolute right-0 bottom-3 text-muted" />
            </div>
          ) : (
            <>
              <label className="block uppercase tracking-[0.22em] text-[11px] text-muted mb-4">6-digit code</label>
              <CodeInput length={6} value={otp} onChange={(value) => setOtp(value.replace(/\D/g, ""))} testIdPrefix="reset-otp" />
              <div className="flex justify-between mt-4 text-sm">
                <span className="text-muted font-mono">{seconds ? `00:${String(seconds).padStart(2, "0")}` : "00:00"}</span>
                <button type="button" onClick={resend} disabled={Boolean(seconds) || loading} className="text-moss underline underline-offset-4 disabled:opacity-50 cursor-pointer">Resend code</button>
              </div>
            </>
          )}
          {error && <div className="mt-6 text-sm px-4 py-3 rounded-lg" style={{ background: "#F5E3DE", color: "#A64A38" }}>{error}</div>}
          <button type="submit" disabled={loading || (step === "email" ? !email : otp.length !== 6)} className="btn-primary mt-8 w-full justify-center group cursor-pointer">
            {loading ? "Working…" : step === "email" ? "Send code" : "Verify code"}
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-200" />
          </button>
        </form>
      </MotionPage>
    </div>
  );
};

export default ForgotPasswordPage;
