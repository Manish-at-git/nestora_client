import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Eye, EyeOff } from "lucide-react";
import { MotionPage } from "@/components/common/MotionWrapper";
import { formatApiErrorDetail } from "@/services/api/apiClient";
import { useConfirmPasswordResetTokenMutation, useResetPasswordMutation, useVerifyPasswordResetTokenMutation } from "../api/authApi";

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { email?: string; otp?: string } | null;
  const email = state?.email || "";
  const otp = state?.otp || "";
  const token = new URLSearchParams(location.search).get("token") || "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [resetPassword, { isLoading }] = useResetPasswordMutation();
  const [confirmToken, { isLoading: isTokenLoading }] = useConfirmPasswordResetTokenMutation();
  const [verifyToken] = useVerifyPasswordResetTokenMutation();

  useEffect(() => {
    if (!token && (!email || !otp)) {
      navigate("/forgot-password", { replace: true });
      return;
    }
    if (token) {
      void verifyToken({ token }).unwrap().catch(() => navigate("/forgot-password", { replace: true }));
    }
  }, [email, otp, navigate, token, verifyToken]);

  if (!token && (!email || !otp)) return null;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    if (password !== confirm) return setError("Passwords do not match.");
    try {
      if (token) {
        await confirmToken({ token, password }).unwrap();
      } else {
        await resetPassword({ email, otp, new_password: password }).unwrap();
      }
      toast.success("Password reset successfully. You can now sign in.");
      navigate("/signin", { replace: true });
    } catch (cause) {
      const message = formatApiErrorDetail((cause as any)?.data) || "Unable to reset password.";
      setError(message);
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <MotionPage className="w-full max-w-md">
        <button type="button" onClick={() => navigate("/forgot-password")} className="text-sm text-muted hover:text-ink inline-flex items-center gap-2 mb-8 cursor-pointer"><ArrowLeft size={14} /> Back</button>
        <p className="uppercase tracking-[0.28em] text-[11px] text-muted mb-3">Account recovery</p>
        <h1 className="font-display text-4xl mb-2">Create a new password.</h1>
        <p className="text-muted mb-8">Use a strong password with upper-case, lower-case, number, and symbol characters.</p>
        <form onSubmit={submit} className="space-y-6">
          {!token && <div><label className="block uppercase tracking-[0.22em] text-[11px] text-muted mb-2">Email</label><input className="input-underline opacity-60" value={email} readOnly /></div>}
          <div><label className="block uppercase tracking-[0.22em] text-[11px] text-muted mb-2">New password</label><div className="relative"><input className="input-underline pr-10" type={show ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} minLength={8} required autoComplete="new-password" /><button type="button" onClick={() => setShow((value) => !value)} className="absolute right-0 top-1/2 -translate-y-1/2 text-muted cursor-pointer">{show ? <EyeOff size={16} /> : <Eye size={16} />}</button></div></div>
          <div><label className="block uppercase tracking-[0.22em] text-[11px] text-muted mb-2">Confirm password</label><input className="input-underline" type={show ? "text" : "password"} value={confirm} onChange={(event) => setConfirm(event.target.value)} required autoComplete="new-password" /></div>
          {error && <div className="text-sm px-4 py-3 rounded-lg" style={{ background: "#F5E3DE", color: "#A64A38" }}>{error}</div>}
          <button type="submit" disabled={isLoading || isTokenLoading || !password || !confirm} className="btn-primary w-full justify-center group cursor-pointer">{isLoading || isTokenLoading ? "Resetting…" : "Reset password"}<ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-200" /></button>
        </form>
      </MotionPage>
    </div>
  );
};

export default ResetPasswordPage;
