import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { CheckCircle2, XCircle, MapPin, User, ArrowRight, ArrowLeft } from "lucide-react";
import { useGetUserDetailsQuery, useUpdateDetailsRequestMutation } from "../api/authApi";
import { formatApiErrorDetail } from "@/services/api/apiClient";

export const VerifyDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [correcting, setCorrecting] = useState(false);

  useEffect(() => {
    const c = sessionStorage.getItem("nestora_code");
    if (!c) {
      navigate("/");
      return;
    }
    setCode(c);
  }, [navigate]);

  const {
    data: details,
    isLoading: loading,
    isError,
    error,
  } = useGetUserDetailsQuery(code, {
    skip: !code,
  });

  useEffect(() => {
    if (isError && error) {
      const errObj = error as any;
      toast.error(formatApiErrorDetail(errObj.data || errObj.message));
      navigate("/");
    }
  }, [isError, error, navigate]);

  if (loading || !code) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="font-mono text-muted text-sm">Fetching your record…</p>
      </div>
    );
  }

  if (correcting) {
    return <UpdateRequestForm code={code} back={() => setCorrecting(false)} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-3xl">
        <button
          onClick={() => navigate("/")}
          className="text-sm text-muted hover:text-ink inline-flex items-center gap-2 mb-8 cursor-pointer"
          data-testid="verify-back"
        >
          <ArrowLeft size={14} /> Back to code entry
        </button>

        <p className="uppercase tracking-[0.28em] text-[11px] text-muted mb-3 font-mono">
          Step 02 · Details Verification
        </p>
        <h1 className="font-display text-4xl leading-tight mb-3">
          Is this you?
        </h1>
        <p className="text-muted mb-10 max-w-xl leading-relaxed">
          We have these details on file for your access code. Please confirm
          they're correct before creating your account.
        </p>

        {/* ID card */}
        <div className="relative card p-8 md:p-10 mb-8" data-testid="verify-details-card">
          <div className="absolute top-6 right-6 font-mono text-xs tracking-widest text-muted uppercase">
            Member · {code}
          </div>
          <div className="grid md:grid-cols-2 gap-8 mt-6">
            <div>
              <p className="flex items-center gap-2 uppercase text-[11px] tracking-[0.22em] text-muted mb-3">
                <User size={12} /> Name on record
              </p>
              <p className="font-display text-3xl leading-tight" data-testid="verify-name">
                {details?.name}
              </p>
            </div>
            <div>
              <p className="flex items-center gap-2 uppercase text-[11px] tracking-[0.22em] text-muted mb-3">
                <MapPin size={12} /> Address
              </p>
              <p className="text-[17px] leading-relaxed" data-testid="verify-address">
                {details?.address}
              </p>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-line grid md:grid-cols-2 gap-8 text-sm text-muted">
            <div>
              <span className="uppercase text-[11px] tracking-[0.22em]">Email</span>
              <p className="text-ink mt-1 font-medium">{details?.email}</p>
            </div>
            <div>
              <span className="uppercase text-[11px] tracking-[0.22em]">Contact</span>
              <p className="text-ink mt-1 font-mono">{details?.contact_number}</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <button
            className="btn-primary justify-center group cursor-pointer"
            onClick={() => navigate("/create-account")}
            data-testid="verify-details-correct"
          >
            <CheckCircle2 size={18} /> Details are correct
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-200" />
          </button>
          <button
            className="btn-ghost justify-center inline-flex items-center gap-2 cursor-pointer"
            onClick={() => setCorrecting(true)}
            data-testid="verify-details-incorrect"
          >
            <XCircle size={16} /> Something's off — request update
          </button>
        </div>
      </div>
    </div>
  );
};

interface UpdateRequestFormProps {
  code: string;
  back: () => void;
}

const UpdateRequestForm: React.FC<UpdateRequestFormProps> = ({ code, back }) => {
  const [form, setForm] = useState({
    requested_name: "",
    requested_address: "",
    requested_email: "",
    requested_contact: "",
    note: "",
  });
  const [done, setDone] = useState(false);
  const [updateDetailsRequest, { isLoading: loading }] = useUpdateDetailsRequestMutation();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateDetailsRequest({ code, ...form }).unwrap();
      setDone(true);
      toast.success("Update request sent to support.");
    } catch (e: any) {
      toast.error(formatApiErrorDetail(e.data || e.message));
    }
  };

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="card p-10 max-w-lg" data-testid="update-request-success">
          <p className="uppercase tracking-[0.22em] text-[11px] text-ok mb-3 text-emerald-700 font-semibold">
            Sent · #{code}
          </p>
          <h2 className="font-display text-3xl mb-3 text-ink">We're on it.</h2>
          <p className="text-ink/80 leading-relaxed">
            Our support team just received your correction request. You'll
            hear back at the email you provided within one business day.
          </p>
          <button className="btn-ghost mt-6 cursor-pointer" onClick={back} data-testid="update-request-back">
            <ArrowLeft size={14} className="inline mr-2" /> Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-16">
      <form onSubmit={submit} className="w-full max-w-2xl" data-testid="update-request-form">
        <button
          type="button"
          onClick={back}
          className="text-sm text-muted hover:text-ink inline-flex items-center gap-2 mb-6 cursor-pointer"
        >
          <ArrowLeft size={14} /> Back
        </button>
        <p className="uppercase tracking-[0.28em] text-[11px] text-muted mb-3 font-mono">
          Detail correction request
        </p>
        <h1 className="font-display text-3xl mb-2">Tell us what needs fixing.</h1>
        <p className="text-muted mb-10">
          Fill in the fields that need updates — leave others blank.
        </p>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block uppercase tracking-[0.22em] text-[11px] text-muted mb-2">
              Correct name
            </label>
            <input
              className="input-boxed"
              value={form.requested_name}
              onChange={(e) => setForm({ ...form, requested_name: e.target.value })}
              data-testid="update-name"
              required
            />
          </div>
          <div>
            <label className="block uppercase tracking-[0.22em] text-[11px] text-muted mb-2">
              Correct address
            </label>
            <input
              className="input-boxed"
              value={form.requested_address}
              onChange={(e) => setForm({ ...form, requested_address: e.target.value })}
              data-testid="update-address"
              required
            />
          </div>
          <div>
            <label className="block uppercase tracking-[0.22em] text-[11px] text-muted mb-2">
              Correct email
            </label>
            <input
              type="email"
              className="input-boxed"
              value={form.requested_email}
              onChange={(e) => setForm({ ...form, requested_email: e.target.value })}
              data-testid="update-email"
              required
            />
          </div>
          <div>
            <label className="block uppercase tracking-[0.22em] text-[11px] text-muted mb-2">
              Correct contact number
            </label>
            <input
              className="input-boxed"
              value={form.requested_contact}
              onChange={(e) => setForm({ ...form, requested_contact: e.target.value })}
              data-testid="update-contact"
              required
            />
          </div>
        </div>
        <div className="mb-8">
          <label className="block uppercase tracking-[0.22em] text-[11px] text-muted mb-2">
            Note to admin (optional)
          </label>
          <textarea
            className="input-boxed min-h-[100px]"
            value={form.note}
            onChange={(e) => setForm({ ...form, note: e.target.value })}
            data-testid="update-note"
          />
        </div>

        <button className="btn-clay cursor-pointer" disabled={loading} data-testid="update-submit">
          {loading ? "Sending…" : "Send correction request"}
        </button>
      </form>
    </div>
  );
};

export default VerifyDetailsPage;
