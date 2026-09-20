import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { formatApiErrorDetail } from "@/services/api/apiClient";
import { MotionPage } from "@/components/common/MotionWrapper";

export const SignInPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success("Signed in.");
      navigate("/");
    } catch (e: any) {
      // The new server returns its common { success, message, data } envelope.
      const msg = formatApiErrorDetail(e.response?.data);
      setErr(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <MotionPage className="w-full max-w-md" data-testid="signin-form">
        <form onSubmit={submit}>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="text-sm text-muted hover:text-ink inline-flex items-center gap-2 mb-8 cursor-pointer"
            data-testid="signin-back"
          >
            <ArrowLeft size={14} /> Back to code entry
          </button>
          <p className="uppercase tracking-[0.28em] text-[11px] text-muted mb-3">
            Sign in with email
          </p>
          <h1 className="font-display text-4xl mb-2">Welcome back.</h1>
          <p className="text-muted mb-8">
            Already created your account? Sign in below.
          </p>

          <div className="space-y-6">
            <div>
              <label className="block uppercase tracking-[0.22em] text-[11px] text-muted mb-2">
                Email
              </label>
              <input
                className="input-underline"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                data-testid="signin-email"
              />
            </div>
            <div>
              <label className="block uppercase tracking-[0.22em] text-[11px] text-muted mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  className="input-underline pr-10"
                  type={show ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  data-testid="signin-password"
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-muted hover:text-ink cursor-pointer"
                  data-testid="signin-toggle-password"
                >
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>

          {err && (
            <div
              className="mt-6 text-sm px-4 py-3 rounded-lg"
              style={{ background: "#F5E3DE", color: "#A64A38" }}
              data-testid="signin-error"
            >
              {err}
            </div>
          )}

          <button
            type="button"
            onClick={() => navigate("/forgot-password")}
            className="mt-4 text-sm text-moss underline underline-offset-4 cursor-pointer"
            data-testid="signin-forgot-password"
          >
            Forgot password?
          </button>
          <button
            type="submit"
            className="btn-primary mt-8 w-full justify-center group cursor-pointer"
            disabled={loading}
            data-testid="signin-submit"
          >
            {loading ? "Signing in…" : "Sign in"}
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-200" />
          </button>
        </form>
      </MotionPage>
    </div>
  );
};

export default SignInPage;
