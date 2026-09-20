import React from "react";
import { toast } from "sonner";
import { AccessRestricted, LoadingSpinner } from "@/components/common";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { isVisitorOperationsRole } from "@/constants/roleCodes";
import { usePageHeader } from "@/hooks/usePageHeader";
import {
  useCheckOutVisitorMutation,
  useCompleteDeliveryMutation,
  useGetActiveDeliveriesQuery,
  useGetDeliveryHistoryQuery,
  useGetVisitorCheckinsQuery,
  useGetVisitorCheckoutsQuery,
  useGetVisitorHistoryQuery,
} from "../api";

type Mode = "checkin" | "checkout" | "history" | "delivery" | "delivery-history";

export interface VisitorOperationsPageProps { mode: Mode; }

const formatDate = (value?: string | null) => (value ? new Date(value).toLocaleString() : "—");

export const VisitorOperationsPage: React.FC<VisitorOperationsPageProps> = ({ mode }) => {
  const { account } = useAuth();
  const isSecurity = isVisitorOperationsRole(account?.role_code);
  usePageHeader({ title: mode === "delivery" || mode === "delivery-history" ? "Delivery Management" : "Visitor Gate Operations", description: "Review gate activity and complete visitor or delivery movements." });
  const checkins = useGetVisitorCheckinsQuery(undefined, { skip: !isSecurity || mode !== "checkin" });
  const checkouts = useGetVisitorCheckoutsQuery(undefined, { skip: !isSecurity || mode !== "checkout" });
  const history = useGetVisitorHistoryQuery(undefined, { skip: !isSecurity || mode !== "history" });
  const deliveries = useGetActiveDeliveriesQuery(undefined, { skip: !isSecurity || mode !== "delivery" });
  const deliveryHistory = useGetDeliveryHistoryQuery(undefined, { skip: !isSecurity || mode !== "delivery-history" });
  const [checkOutVisitor, { isLoading: isCheckingOut }] = useCheckOutVisitorMutation();
  const [completeDelivery, { isLoading: isCompleting }] = useCompleteDeliveryMutation();

  if (!isSecurity) return <AccessRestricted moduleName="Visitor Management" showAction />;
  const isLoading = checkins.isLoading || checkouts.isLoading || history.isLoading || deliveries.isLoading || deliveryHistory.isLoading;
  if (isLoading) return <div className="flex h-64 items-center justify-center"><LoadingSpinner /></div>;
  const visitors = mode === "checkin" ? checkins.data?.visitors || [] : mode === "checkout" ? checkouts.data?.visitors || [] : history.data?.visitors || [];
  const deliveryRows = mode === "delivery" ? deliveries.data?.deliveries || [] : deliveryHistory.data?.deliveries || [];

  if (mode === "delivery" || mode === "delivery-history") return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-slate-800">{mode === "delivery" ? "Active deliveries" : "Delivery history"}</h2>
      <div className="space-y-3">{deliveryRows.map((delivery) => <div key={delivery.id} className="flex items-center justify-between rounded-xl border border-slate-100 p-4"><div><p className="font-medium text-slate-800">{delivery.delivery_person_name || delivery.company_name || delivery.delivery_type}</p><p className="text-sm text-slate-500">Unit {delivery.unit_number || "—"} · {delivery.status} · {formatDate(delivery.check_in)}</p></div>{mode === "delivery" && <Button disabled={isCompleting} onClick={async () => { try { await completeDelivery(delivery.id).unwrap(); toast.success("Delivery completed"); } catch { toast.error("Unable to complete delivery"); } }}>Complete</Button>}</div>)}{!deliveryRows.length && <p className="py-10 text-center text-sm text-slate-500">No deliveries found.</p>}</div>
    </div>
  );

  return <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="mb-4 text-lg font-semibold text-slate-800">{mode === "checkin" ? "Visitors currently inside" : mode === "checkout" ? "Recent visitor check-outs" : "Visitor history"}</h2><div className="space-y-3">{visitors.map((visitor) => <div key={visitor.log_id || visitor.pass_id} className="flex items-center justify-between rounded-xl border border-slate-100 p-4"><div><p className="font-medium text-slate-800">{visitor.visitor_name}</p><p className="text-sm text-slate-500">Unit {visitor.unit_number || "—"} · {visitor.mobile} · In {formatDate(visitor.check_in)}{visitor.check_out ? ` · Out ${formatDate(visitor.check_out)}` : ""}</p></div>{mode === "checkin" && visitor.log_id && <Button disabled={isCheckingOut} onClick={async () => { try { await checkOutVisitor(visitor.log_id).unwrap(); toast.success("Visitor checked out"); } catch { toast.error("Unable to check out visitor"); } }}>Check out</Button>}</div>)}{!visitors.length && <p className="py-10 text-center text-sm text-slate-500">No visitors found.</p>}</div></div>;
};

export default VisitorOperationsPage;
