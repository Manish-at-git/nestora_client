import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { useGetUserDetailsQuery, useCreateAccountMutation } from "../api/authApi";
import { formatApiErrorDetail } from "@/services/api/apiClient";
import { PasswordStrength } from "../components/PasswordStrength";
import { useAuth } from "@/context/AuthContext";

export const CreateAccountPage: React.FC = () => {
  const navigate = useNavigate();
  const { refresh, connectRealtime } = useAuth();
  const [code, setCode] = useState("");
  const [form, setForm] = useState({ email: "", password: "", confirm_password: "" });
  const [showPw, setShowPw] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    const c = sessionStorage.getItem("nestora_code");
    if (!c) {
      navigate("/");
      return;
    }
    setCode(c);
  }, [navigate]);

  const { data: prefill } = useGetUserDetailsQuery(code, {
    skip: !code,
  });

  useEffect(() => {
    if (prefill?.email && !form.email) {
      setForm((f) => ({ ...f, email: prefill.email }));
    }
  }, [prefill]);

  const [createAccount, { isLoading: loading }] = useCreateAccountMutation();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    if (form.password !== form.confirm_password) {
      setErr("Passwords don't match.");
      return;
    }
    try {
      await createAccount({ code, ...form }).unwrap();
      // Account creation establishes the same HttpOnly cookie session as login.
      // Refresh through the session endpoint instead of expecting a client token.
      await refresh();
      try {
        await connectRealtime();
      } catch {
        // Realtime availability must not block account creation.
      }
      sessionStorage.removeItem("nestora_code");
      toast.success("Welcome to Nestora!");
      navigate("/");
    } catch (e: any) {
      const msg = formatApiErrorDetail(e.data || e.message);
      setErr(msg);
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left panel — testimonial/branding */}
      <aside className="hidden lg:flex flex-col justify-between p-14 bg-moss text-white relative overflow-hidden">
        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-clay/30 blur-3xl" />
        <div className="relative z-10">
          <p className="uppercase tracking-[0.28em] text-[11px] text-white/60 mb-3 font-mono">
            Final step · 03
          </p>
          <h2 className="font-display text-5xl italic leading-[1.05] mb-8">
            One password.<br />A lifetime of community.
          </h2>
          <p className="text-white/80 max-w-sm leading-relaxed text-[15px]">
            Your account gives you a private, ad-free hub for announcements,
            dues, members, and the events that make your association feel
            like home.
          </p>
        </div>
        <div className="relative z-10 flex items-center gap-3 text-white/70 text-sm">
          <ShieldCheck size={16} />
          <span>End-to-end encrypted · No spam, ever</span>
        </div>
      </aside>

      {/* Right form */}
      <section className="flex items-center justify-center px-6 lg:px-16 py-16">
        <div className="w-full max-w-md">
          <button
            onClick={() => navigate("/verify")}
            className="text-sm text-muted hover:text-ink inline-flex items-center gap-2 mb-8 cursor-pointer"
            data-testid="create-back"
          >
            <ArrowLeft size={14} /> Back
          </button>
          <p className="uppercase tracking-[0.28em] text-[11px] text-muted mb-3">
            Create your account
          </p>
          <h1 className="font-display text-4xl mb-2">
            {prefill ? `Hi, ${prefill.name.split(" ")[0]}.` : "Almost there."}
          </h1>
          <p className="text-muted mb-8">
            Set the email &amp; password you'll use to sign in from now on.
          </p>

          <form onSubmit={submit} className="space-y-6" data-testid="create-account-form">
            <div>
              <label className="block uppercase tracking-[0.22em] text-[11px] text-muted mb-2">
                Email
              </label>
              <input
                type="email"
                className="input-underline"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                data-testid="create-email"
              />
            </div>
            <div>
              <label className="block uppercase tracking-[0.22em] text-[11px] text-muted mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  className="input-underline pr-10"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  data-testid="create-password"
                  placeholder="8+ chars, 1 upper, 1 number, 1 symbol"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((s) => !s)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-muted hover:text-ink cursor-pointer"
                  aria-label="Toggle password visibility"
                  data-testid="toggle-password"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <PasswordStrength value={form.password} />
            </div>
            <div>
              <label className="block uppercase tracking-[0.22em] text-[11px] text-muted mb-2">
                Confirm password
              </label>
              <input
                type={showPw ? "text" : "password"}
                className="input-underline"
                value={form.confirm_password}
                onChange={(e) => setForm({ ...form, confirm_password: e.target.value })}
                required
                data-testid="create-confirm-password"
              />
            </div>

            {err && (
              <div
                className="text-sm px-4 py-3 rounded-lg"
                style={{ background: "#F5E3DE", color: "#A64A38" }}
                data-testid="create-error"
              >
                {err}
              </div>
            )}

            <button
              type="submit"
              className="btn-primary w-full justify-center group cursor-pointer"
              disabled={loading}
              data-testid="create-account-submit"
            >
              {loading ? "Creating…" : "Create account"}
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-200" />
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default CreateAccountPage;
