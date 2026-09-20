import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { FormField } from "@/components/common/FormField";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ModalWrapper } from "@/components/common/ModalWrapper";
import { StatusPill } from "@/components/common/StatusPill";
import { useGetSubscriptionPlansQuery } from "@/features/subscriptions/api/subscriptionsApi";
import {
  useGetAssociationStatsQuery,
  useUpdateAssociationSubscriptionMutation,
} from "../api/associationsApi";
import { getCurrencySymbol, COUNTRIES } from "@/utils/currency";
import { DatePicker } from "@/components/ui/date-picker";
import type { Association, AssociationSubscriptionPayload } from "../types";
import { formatApiErrorDetail } from "@/services/api/apiClient";
import {
  CreditCard,
  Layers,
  Home,
  Users,
  FileText,
  ExternalLink,
  Building,
} from "lucide-react";

export interface ViewAssociationModalProps {
  association: Association | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ViewAssociationModal: React.FC<ViewAssociationModalProps> = ({
  association,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [lastAssociation, setLastAssociation] = useState<Association | null>(association);

  useEffect(() => {
    if (association) {
      setLastAssociation(association);
    }
  }, [association]);

  const activeAssociation = association || lastAssociation;

  const { data: stats, isLoading: isLoadingStats } = useGetAssociationStatsQuery(
    activeAssociation?.id || "",
    { skip: !isOpen || !activeAssociation?.id }
  );
  const { data: plans = [] } = useGetSubscriptionPlansQuery(undefined, {
    skip: !isOpen,
  });
  const [updateSubscription, { isLoading: isUpdatingSub }] =
    useUpdateAssociationSubscriptionMutation();

  const [subForm, setSubForm] = useState<AssociationSubscriptionPayload>({
    plan_id: "",
    subscription_start: "",
    subscription_end: "",
    renewal_date: "",
    payment_status: "Pending",
    subscription_status: "Trial",
  });

  useEffect(() => {
    if (activeAssociation) {
      setSubForm({
        plan_id:
          activeAssociation.current_plan_id ||
          plans.find(
            (plan) =>
              plan.name?.toLowerCase() === activeAssociation.plan_name?.toLowerCase()
          )?.id ||
          "",
        subscription_start: activeAssociation.subscription_start
          ? activeAssociation.subscription_start.slice(0, 10)
          : "",
        subscription_end: activeAssociation.subscription_end
          ? activeAssociation.subscription_end.slice(0, 10)
          : "",
        renewal_date: activeAssociation.renewal_date
          ? activeAssociation.renewal_date.slice(0, 10)
          : "",
        payment_status: activeAssociation.payment_status || "Pending",
        subscription_status: activeAssociation.subscription_status || "Trial",
      });
    }
  }, [activeAssociation, isOpen, plans]);

  if (!activeAssociation) return null;

  const currentPlan = plans.find((p) => p.id === subForm.plan_id);

  const handleSaveSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateSubscription({
        id: activeAssociation.id,
        data: {
          ...subForm,
          plan_id: subForm.plan_id || null,
          subscription_start: subForm.subscription_start || null,
          subscription_end: subForm.subscription_end || null,
          renewal_date: subForm.renewal_date || null,
        },
      }).unwrap();
      toast.success("Association subscription updated successfully!");
      onSuccess?.();
    } catch (err: any) {
      toast.error(
        formatApiErrorDetail(err?.data || err?.message || "Failed to update subscription.")
      );
    }
  };

  const activePlans = plans.filter((p) => Boolean(p.is_active));
  const currencySymbol = getCurrencySymbol(activeAssociation.country);

  const planOptions = [
    { value: "", label: "-- No Plan Selected --" },
    ...activePlans.map((p) => {
      const countryFlag =
        COUNTRIES.find((c) => c.name === p.country)?.flag || "";
      return {
        value: p.id,
        label: `${p.name} ${countryFlag ? `(${countryFlag})` : ""} (${currencySymbol}${p.monthly_price}/mo)`,
      };
    }),
  ];

  const statusOptions = [
    { value: "Active", label: "Active" },
    { value: "Trial", label: "Trial" },
    { value: "Expired", label: "Expired" },
    { value: "Cancelled", label: "Cancelled" },
  ];

  const paymentStatusOptions = [
    { value: "Paid", label: "Paid" },
    { value: "Pending", label: "Pending" },
    { value: "Overdue", label: "Overdue" },
    { value: "Failed", label: "Failed" },
  ];

  const isActive =
    activeAssociation.is_active === true ||
    activeAssociation.is_active === 1 ||
    (activeAssociation.subscription_status || "").toLowerCase() === "active";

  const statusText = activeAssociation.subscription_status
    ? activeAssociation.subscription_status.charAt(0).toUpperCase() +
      activeAssociation.subscription_status.slice(1).toLowerCase()
    : isActive
    ? "Active"
    : "Inactive";

  const isStatusActive = statusText.toLowerCase() === "active";

  const descriptionParts = [
    activeAssociation.city,
    activeAssociation.country || "Global",
    activeAssociation.association_code
      ? `Code: ${activeAssociation.association_code}`
      : "",
  ].filter(Boolean);

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title={activeAssociation.name}
      description={descriptionParts.join(" • ")}
      icon={
        <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
          <Building size={18} />
        </div>
      }
      badge={
        <StatusPill
          variant={isStatusActive ? "success" : "neutral"}
          dot={true}
          size="xs"
        >
          {statusText}
        </StatusPill>
      }
      size="3xl"
      footer={
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          className="rounded-xl border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer h-9 px-4"
        >
          Close
        </Button>
      }
    >
      <div className="space-y-6">
        {/* 4 Quick Stat Cards */}
        {isLoadingStats ? (
          <div className="py-6 flex justify-center">
            <LoadingSpinner size="sm" text="Loading association metrics..." />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Total Blocks */}
            <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/80 flex items-center gap-3 shadow-2xs">
              <div className="p-2.5 bg-white text-blue-600 rounded-xl shadow-2xs shrink-0 border border-blue-100/60">
                <Layers className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-medium text-slate-500 truncate">Total Blocks</p>
                <p className="text-base font-bold text-slate-900">
                  {stats?.total_blocks ?? stats?.block_count ?? 0}
                </p>
              </div>
            </div>

            {/* Total Units */}
            <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/80 flex items-center gap-3 shadow-2xs">
              <div className="p-2.5 bg-white text-emerald-600 rounded-xl shadow-2xs shrink-0 border border-emerald-100/60">
                <Home className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-medium text-slate-500 truncate">Total Units</p>
                <p className="text-base font-bold text-slate-900">
                  {stats?.total_units ?? stats?.unit_count ?? activeAssociation.unit_count ?? 0}
                </p>
              </div>
            </div>

            {/* Rented Units */}
            <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/80 flex items-center gap-3 shadow-2xs">
              <div className="p-2.5 bg-white text-purple-600 rounded-xl shadow-2xs shrink-0 border border-purple-100/60">
                <Users className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-medium text-slate-500 truncate">Rented Units</p>
                <p className="text-base font-bold text-slate-900">
                  {stats?.rented_units ?? stats?.homeowner_count ?? 0}
                </p>
              </div>
            </div>

            {/* Contract */}
            <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/80 flex items-center gap-3 shadow-2xs">
              <div className="p-2.5 bg-white text-amber-600 rounded-xl shadow-2xs shrink-0 border border-amber-100/60">
                <FileText className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-medium text-slate-500 truncate">Contract</p>
                {stats?.contract_url || activeAssociation.contract_url ? (
                  <a
                    href={(stats?.contract_url || activeAssociation.contract_url) as string}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-bold text-indigo-600 hover:underline inline-flex items-center gap-1 truncate"
                  >
                    <span>View File</span>
                    <ExternalLink size={11} className="shrink-0" />
                  </a>
                ) : (
                  <p className="text-xs font-semibold text-slate-400">Not Uploaded</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Subscription Management Section */}
        <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200/60">
            <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
              <CreditCard size={16} className="text-indigo-600" />
              <span>Subscription & Plan Allocation</span>
            </div>
          </div>

          {/* Selected Plan Summary Card */}
          {currentPlan && (
            <div className="p-4 bg-white rounded-xl border border-indigo-100 flex flex-col sm:flex-row justify-between sm:items-center gap-2 shadow-2xs">
              <div>
                <h4 className="font-bold text-indigo-900 text-sm flex items-center gap-2">
                  <span>{currentPlan.name}</span>
                  <span className="text-[10px] font-semibold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                    Active Tier
                  </span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  {currentPlan.description || "Allocated platform features and quotas."}
                </p>
              </div>
              <div className="text-left sm:text-right shrink-0">
                <div className="text-base font-bold text-slate-900">
                  {currencySymbol}
                  {currentPlan.monthly_price}
                  <span className="text-xs font-normal text-slate-500">/mo</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  or {currencySymbol}
                  {currentPlan.yearly_price}/yr
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSaveSubscription} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
              {/* Plan select using common Select */}
              <div>
                <FormField label="Plan">
                  <Select
                    value={subForm.plan_id || ""}
                    onValueChange={(val) =>
                      setSubForm((prev) => ({
                        ...prev,
                        plan_id: val,
                      }))
                    }
                    options={planOptions}
                    placeholder="-- Select Plan --"
                  />
                </FormField>
              </div>

              {/* Status using common Select */}
              <div>
                <FormField label="Status">
                  <Select
                    value={subForm.subscription_status || "Trial"}
                    onValueChange={(val) =>
                      setSubForm((prev) => ({
                        ...prev,
                        subscription_status: val,
                      }))
                    }
                    options={statusOptions}
                  />
                </FormField>
              </div>

              {/* Payment Status using common Select */}
              <div>
                <FormField label="Payment Status">
                  <Select
                    value={subForm.payment_status || "Pending"}
                    onValueChange={(val) =>
                      setSubForm((prev) => ({
                        ...prev,
                        payment_status: val,
                      }))
                    }
                    options={paymentStatusOptions}
                  />
                </FormField>
              </div>

              {/* Subscription Start */}
              <div>
                <FormField label="Start Date">
                  <DatePicker
                    value={subForm.subscription_start || ""}
                    onChange={(e) =>
                      setSubForm((prev) => ({ ...prev, subscription_start: e || "" }))
                    }
                    placeholder="Select start date"
                    isClearable
                    onClear={() => setSubForm((prev) => ({ ...prev, subscription_start: "" }))}
                  />
                </FormField>
              </div>

              {/* Subscription End */}
              <div>
                <FormField label="End Date">
                  <DatePicker
                    value={subForm.subscription_end || ""}
                    onChange={(e) =>
                      setSubForm((prev) => ({ ...prev, subscription_end: e || "" }))
                    }
                    placeholder="Select end date"
                    isClearable
                    onClear={() => setSubForm((prev) => ({ ...prev, subscription_end: "" }))}
                  />
                </FormField>
              </div>

              {/* Renewal Date */}
              <div>
                <FormField label="Renewal Date">
                  <DatePicker
                    value={subForm.renewal_date || ""}
                    onChange={(e) =>
                      setSubForm((prev) => ({ ...prev, renewal_date: e || "" }))
                    }
                    placeholder="Select renewal date"
                    isClearable
                    onClear={() => setSubForm((prev) => ({ ...prev, renewal_date: "" }))}
                  />
                </FormField>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <Button
                type="submit"
                disabled={isUpdatingSub}
                className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold px-4 h-9 cursor-pointer shadow-2xs"
              >
                {isUpdatingSub ? "Updating..." : "Update Subscription"}
              </Button>
            </div>
          </form>
        </div>

        {/* Floors per Block Section */}
        <div>
          <h3 className="text-xs font-bold text-slate-800 mb-3 uppercase tracking-wider">
            Floors per Block
          </h3>
          {stats?.floors_per_block && stats.floors_per_block.length > 0 ? (
            <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/75 border-b border-slate-100">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-slate-600">Block Name</th>
                    <th className="px-4 py-3 font-semibold text-slate-600 text-right">Floors</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stats.floors_per_block.map((f, i) => (
                    <tr key={i} className="hover:bg-slate-50/50">
                      <td className="px-4 py-2.5 font-semibold text-slate-800">
                        {f.block_name}
                      </td>
                      <td className="px-4 py-2.5 text-slate-600 font-medium text-right">
                        {f.floors}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic bg-slate-50 p-4 rounded-xl border border-slate-200/60">
              No block floor details available.
            </p>
          )}
        </div>
      </div>
    </ModalWrapper>
  );
};

export default ViewAssociationModal;
