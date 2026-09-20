import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowRight, KeyRound, Send, Building2 } from "lucide-react";
import { CodeInput } from "../components/CodeInput";
import { useLoginCodeMutation, useRequestCodeMutation } from "../api/authApi";
import { formatApiErrorDetail } from "@/services/api/apiClient";

const IMG =
  "https://images.unsplash.com/photo-1707857858965-03a0f42dd053?w=1600&q=80";

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"login" | "request">("login");

  return (
    <div className="split-screen bg-bg">
      {/* Left visual pane */}
      <aside className="split-visual" aria-hidden>
        <img src={IMG} alt="" />
        <div className="content">
          <div className="flex items-center gap-3 text-white/90">
            <div className="w-9 h-9 rounded-full bg-white/12 border border-white/25 backdrop-blur flex items-center justify-center">
              <Building2 size={18} />
            </div>
            <span className="font-display italic text-xl">Nestora</span>
          </div>
          <div className="space-y-4 max-w-md">
            <p className="uppercase tracking-[0.3em] text-xs text-white/60">
              Association Portal · v1
            </p>
            <h1 className="font-display italic text-5xl leading-[1.05] text-white">
              A quiet place<br />for the people<br />who make yours.
            </h1>
            <p className="text-white/70 text-[15px] leading-relaxed max-w-sm">
              Nestora is the private space where your association's members
              stay in the loop — with dignity, warmth, and a little more
              elegance than a group chat.
            </p>
          </div>
          <div className="text-white/50 text-xs font-mono">
            © {new Date().getFullYear()} · A Membership OS
          </div>
        </div>
        <div className="vertical-word">nestora.</div>
      </aside>

      {/* Right form pane */}
      <section className="flex items-center justify-center px-4 sm:px-6 lg:px-12 py-8 sm:py-16">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-6 sm:mb-10">
            <div className="w-8 h-8 rounded-full bg-moss text-white flex items-center justify-center">
              <Building2 size={16} />
            </div>
            <span className="font-display italic text-xl">Nestora</span>
          </div>

          <div className="mb-8">
            <p className="uppercase tracking-[0.28em] text-[11px] text-muted mb-3">
              Welcome home
            </p>
            <h2 className="font-display text-4xl leading-tight mb-2">
              Step inside.
            </h2>
            <p className="text-muted text-[15px] leading-relaxed">
              Use the access code shared with you during onboarding. New here?
              Request a code and an admin will send one your way.
            </p>
          </div>

          <div className="flex items-center gap-8 border-b border-line mb-8" role="tablist">
            <button
              className={`tab-btn cursor-pointer ${tab === "login" ? "active" : ""}`}
              onClick={() => setTab("login")}
              data-testid="tab-login"
              role="tab"
              aria-selected={tab === "login"}
            >
              <span className="inline-flex items-center gap-2">
                <KeyRound size={15} /> Login
              </span>
            </button>
            <button
              className={`tab-btn cursor-pointer ${tab === "request" ? "active" : ""}`}
              onClick={() => setTab("request")}
              data-testid="tab-request-code"
              role="tab"
              aria-selected={tab === "request"}
            >
              <span className="inline-flex items-center gap-2">
                <Send size={15} /> Request for Code
              </span>
            </button>
          </div>

          {tab === "login" ? <LoginTab navigate={navigate} /> : <RequestTab />}

          <div className="mt-10 pt-6 border-t border-line text-sm">
            <span className="text-muted">Already have an account? </span>
            <button
              className="text-moss underline underline-offset-4 hover:text-moss-hover cursor-pointer"
              onClick={() => navigate("/signin")}
              data-testid="link-signin"
            >
              Sign in with email
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

const LoginTab: React.FC<{ navigate: (to: string) => void }> = ({ navigate }) => {
  const [code, setCode] = useState("");
  const [err, setErr] = useState("");
  const [loginCode, { isLoading: loading }] = useLoginCodeMutation();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    if (code.length < 4) {
      setErr("Please enter your full access code.");
      return;
    }
    try {
      const data = await loginCode({ code: code.trim() }).unwrap();
      sessionStorage.setItem("nestora_code", code.trim());
      if (data.already_registered) {
        toast.info("This code is already linked to an account — please sign in.");
        navigate("/signin");
        return;
      }
      navigate("/verify");
    } catch (e: any) {
      const msg = formatApiErrorDetail(e.data || e.message);
      setErr(msg);
      toast.error(msg);
    }
  };

  return (
    <form onSubmit={submit} data-testid="login-form">
      <label className="block uppercase tracking-[0.22em] text-[11px] text-muted mb-4">
        Access code
      </label>
      <CodeInput length={10} value={code} onChange={setCode} />
      <p className="mt-3 font-mono text-xs text-muted">
        Hint · try <span className="text-moss font-semibold">NST-DEMO1</span>, DEMO2 or DEMO3
      </p>

      {err && (
        <div
          className="mt-4 text-sm px-4 py-3 rounded-lg"
          style={{ background: "#F5E3DE", color: "#A64A38" }}
          data-testid="login-error"
        >
          {err}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="btn-primary mt-8 w-full justify-center group cursor-pointer"
        data-testid="login-submit-button"
      >
        {loading ? "Verifying…" : "Continue"}
        <ArrowRight
          size={18}
          className="group-hover:translate-x-1 transition-transform duration-200"
        />
      </button>
    </form>
  );
};

const RequestTab: React.FC = () => {
  const [form, setForm] = useState({ name: "", email: "", contact_number: "" });
  const [submitted, setSubmitted] = useState(false);
  const [err, setErr] = useState("");
  const [requestCode, { isLoading: loading }] = useRequestCodeMutation();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    try {
      await requestCode(form).unwrap();
      setSubmitted(true);
      toast.success("Request submitted!");
    } catch (e: any) {
      const msg = formatApiErrorDetail(e.data || e.message);
      setErr(msg);
      toast.error(msg);
    }
  };

  if (submitted) {
    return (
      <div className="card p-8" data-testid="request-code-success">
        <p className="uppercase tracking-[0.22em] text-[11px] text-ok mb-3 font-semibold text-emerald-700">
          Request received
        </p>
        <h3 className="font-display text-2xl mb-3">
          Thank you, {form.name.split(" ")[0]}.
        </h3>
        <p className="text-muted text-[15px] leading-relaxed">
          An administrator will review your request. Once approved, your
          personal access code will land in your inbox at{" "}
          <span className="text-ink font-medium">{form.email}</span>.
        </p>
        <button
          onClick={() => {
            setSubmitted(false);
            setForm({ name: "", email: "", contact_number: "" });
          }}
          className="btn-ghost mt-6 cursor-pointer"
          data-testid="request-code-new"
        >
          Submit another request
        </button>
      </div>
    );
  }

  return (
    <form className="space-y-6" onSubmit={submit} data-testid="request-code-form">
      <div>
        <label className="block uppercase tracking-[0.22em] text-[11px] text-muted mb-2">
          Full name
        </label>
        <input
          className="input-underline"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Jane Doe"
          required
          data-testid="request-code-name"
        />
      </div>
      <div>
        <label className="block uppercase tracking-[0.22em] text-[11px] text-muted mb-2">
          Email address
        </label>
        <input
          className="input-underline"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="jane@example.com"
          required
          data-testid="request-code-email"
        />
      </div>
      <div>
        <label className="block uppercase tracking-[0.22em] text-[11px] text-muted mb-2">
          Contact number
        </label>
        <input
          className="input-underline"
          value={form.contact_number}
          onChange={(e) => setForm({ ...form, contact_number: e.target.value })}
          placeholder="+91 98765 43210"
          required
          data-testid="request-code-contact"
        />
      </div>

      {err && (
        <div
          className="text-sm px-4 py-3 rounded-lg"
          style={{ background: "#F5E3DE", color: "#A64A38" }}
          data-testid="request-code-error"
        >
          {err}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full justify-center group cursor-pointer"
        data-testid="request-code-submit"
      >
        {loading ? "Submitting…" : "Submit request"}
        <Send size={16} className="group-hover:translate-x-1 transition-transform duration-200" />
      </button>
    </form>
  );
};

export default LoginPage;
