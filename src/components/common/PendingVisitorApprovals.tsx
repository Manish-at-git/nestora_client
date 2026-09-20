import React, { useState, useEffect } from "react";
import { ShieldAlert, CheckCircle, XCircle } from "lucide-react";
import apiClient from "@/services/api/apiClient";
import { resolveMediaUrl } from "@/lib/cloudUploader";
import { toast } from "sonner";

interface VisitorRequest {
  visit_id: string | number;
  name: string;
  visitor_type?: string;
  number_of_visitors?: number;
  purpose?: string;
  photo_url?: string;
}

export const PendingVisitorApprovals: React.FC = () => {
  const [requests, setRequests] = useState<VisitorRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const res = await apiClient.get("/resident/visitor/pending");
      if (res.data?.requests && Array.isArray(res.data.requests)) {
        setRequests(res.data.requests);
      } else if (Array.isArray(res.data)) {
        setRequests(res.data);
      } else {
        setRequests([]);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, 12000); // 12s poll
    return () => clearInterval(interval);
  }, []);

  const handleApprove = async (id: string | number) => {
    try {
      const res = await apiClient.post(`/resident/visitor/${id}/approve`);
      toast.success(`Visitor Approved! Pass Code: ${res.data?.pass_code || "OK"}`);
      setRequests((prev) => prev.filter((r) => r.visit_id !== id));
    } catch {
      toast.error("Failed to approve visitor");
    }
  };

  const handleReject = async (id: string | number) => {
    try {
      await apiClient.post(`/resident/visitor/${id}/reject`);
      toast.success("Visitor Rejected");
      setRequests((prev) => prev.filter((r) => r.visit_id !== id));
    } catch {
      toast.error("Failed to reject visitor");
    }
  };

  if (loading || requests.length === 0) return null;

  return (
    <div className="mb-8 space-y-4">
      <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
        <ShieldAlert className="text-amber-500" /> Pending Visitor Approvals ({requests.length})
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {requests.map((req) => (
          <div
            key={req.visit_id}
            className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-4 items-start shadow-xs animate-in fade-in duration-200"
          >
            {req.photo_url ? (
              <img
                src={resolveMediaUrl(req.photo_url)}
                alt="Visitor"
                className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-xs shrink-0"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-xl border-2 border-white shadow-xs shrink-0">
                {req.name.charAt(0).toUpperCase()}
              </div>
            )}

            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-slate-800 text-sm truncate">{req.name}</h4>
              <p className="text-xs text-slate-600">
                {req.visitor_type || "Visitor"} • {req.number_of_visitors || 1} Person(s)
              </p>
              {req.purpose && <p className="text-xs text-slate-500 mt-0.5">Purpose: {req.purpose}</p>}

              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => handleApprove(req.visit_id)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <CheckCircle size={13} /> Approve
                </button>
                <button
                  onClick={() => handleReject(req.visit_id)}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <XCircle size={13} /> Reject
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PendingVisitorApprovals;
