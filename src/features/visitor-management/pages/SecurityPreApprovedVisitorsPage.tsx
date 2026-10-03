import React, { useState } from "react";
import { CalendarDays, DoorOpen, Search, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AccessRestricted, DataTable, FormField, FormModal, StatusPill, type Column } from "@/components/common";
import { FEATURES } from "@/constants/featureCodes";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { isVisitorOperationsRole } from "@/constants/roleCodes";
import { usePageHeader } from "@/hooks/usePageHeader";
import {
  useCheckInPreApprovedVisitorMutation,
  useGetSecurityPreApprovedVisitorsQuery,
} from "../api";
import type { PreApprovedVisitor, VisitorPassStatus } from "../types";
import { formatVisitDate, formatVisitTime } from "../utils/formatters";
import { VisitorCheckoutButton } from "../components";

const statusVariant = (status: VisitorPassStatus) => {
  if (status === "Active") return "info";
  if (status === "Used") return "success";
  if (status === "Expired" || status === "Cancelled") return "danger";
  return "neutral";
};

export const SecurityPreApprovedVisitorsPage: React.FC = () => {
  const { account } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [selectedPass, setSelectedPass] = useState<PreApprovedVisitor | null>(null);
  const [gate, setGate] = useState("");
  const [otp, setOtp] = useState("");
  const [remarks, setRemarks] = useState("");
  const query = search.trim();
  const isSecurity = isVisitorOperationsRole(account?.role_code);
  const { data, isLoading, isFetching } = useGetSecurityPreApprovedVisitorsQuery(query || undefined, {
    skip: !isSecurity,
  });
  const [checkIn, { isLoading: isCheckingIn }] = useCheckInPreApprovedVisitorMutation();

  usePageHeader({
    title: "Pre-Approved Visitors",
    description: "Verify homeowner-created pre-approved visitors and record gate entry.",
  });

  if (!isSecurity) {
    return <AccessRestricted moduleName="Pre-Approved Visitors" showAction />;
  }

  const closeCheckIn = () => {
    setSelectedPass(null);
    setGate("");
    setOtp("");
    setRemarks("");
  };

  const submitCheckIn = async () => {
    if (!selectedPass) return;
    if (!otp.trim()) {
      toast.error("Enter the visitor OTP before check-in");
      return;
    }
    try {
      await checkIn({
        passId: selectedPass.id,
        otp: otp.trim(),
        gate: gate.trim() || undefined,
        remarks: remarks.trim() || undefined,
      }).unwrap();
      toast.success(`${selectedPass.visitor_name} checked in`);
      closeCheckIn();
    } catch (error: any) {
      toast.error(error?.data?.detail || error?.data || "Unable to check in this visitor");
    }
  };

  const columns: Column<PreApprovedVisitor>[] = [
    {
      key: "visitor_name",
      header: "Visitor",
      minWidth: "210px",
      render: (visitor) => (
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <UserRound size={15} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-800">{visitor.visitor_name}</p>
            <p className="text-[11px] text-slate-500">{visitor.mobile} · {visitor.visitor_type}</p>
          </div>
        </div>
      ),
    },
    {
      key: "unit_number",
      header: "Destination",
      minWidth: "150px",
      render: (visitor) => (
        <span className="text-xs text-slate-600">
          {visitor.block_name ? `${visitor.block_name} · ` : ""}Unit {visitor.unit_number || "—"}
        </span>
      ),
    },
    {
      key: "visit_date",
      header: "Schedule",
      minWidth: "185px",
      render: (visitor) => (
        <div className="text-xs text-slate-600">
          <p className="flex items-center gap-1.5"><CalendarDays size={13} className="text-slate-400" />{formatVisitDate(visitor.visit_date)}</p>
          <p className="mt-1 text-[11px] text-slate-500">{formatVisitTime(visitor.start_time)} – {formatVisitTime(visitor.end_time)}</p>
        </div>
      ),
    },
    {
      key: "pass_code",
      header: "Pass Code",
      width: "135px",
      render: (visitor) => <span className="font-mono text-xs font-semibold text-slate-700">{visitor.pass_code}</span>,
    },
    {
      key: "status",
      header: "Status",
      width: "105px",
      render: (visitor) => <StatusPill variant={statusVariant(visitor.status)} size="xs" dot>{visitor.status}</StatusPill>,
    },
    {
      key: "actions",
      header: "Action",
      width: "145px",
      render: (visitor) => {
        if (visitor.active_log_id) {
          return (
            <VisitorCheckoutButton
              onClick={() => navigate(FEATURES.GATE_CONSOLE.FEATURE_PATH)}
            />
          );
        }

        if (visitor.status === "Active") {
          return (
            <Button type="button" size="sm" onClick={() => setSelectedPass(visitor)}>
              <DoorOpen size={14} /> Check In
            </Button>
          );
        }

        return <span className="text-xs text-slate-500">Not available</span>;
      },
    },
  ];

  return (
    <>
      <div className="mb-4 max-w-md">
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search name, mobile, unit, pass code, or OTP"
          leftIcon={<Search size={15} />}
        />
      </div>
      <DataTable
        data={data?.visitors || []}
        columns={columns}
        density="compact"
        enablePagination
        pagination={{ isServer: false, pageSize: 10, pageSizeOptions: [10, 25, 50] }}
        isLoading={isLoading || isFetching}
        emptyTitle={query ? "No matching pre-approved visitors" : "No pre-approved visitors today"}
        emptyMessage={query ? "Try a visitor name, mobile number, pass code, or OTP." : "Homeowner-created pre-approved visitors for today will appear here."}
      />

      <FormModal
        isOpen={Boolean(selectedPass)}
        onClose={closeCheckIn}
        title="Check In Visitor"
        description={selectedPass ? `Confirm entry for ${selectedPass.visitor_name} to Unit ${selectedPass.unit_number || "—"}.` : undefined}
        size="md"
        submitText="Confirm Check-In"
        loadingText="Checking In"
        isSubmitting={isCheckingIn}
        onSubmit={submitCheckIn}
      >
        <FormField label="Visitor OTP" required>
          <Input
            value={otp}
            onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 10))}
            placeholder="Enter the OTP shared by the resident"
            inputMode="numeric"
            disabled={isCheckingIn}
          />
        </FormField>
        <FormField label="Gate (Optional)">
          <Input value={gate} onChange={(event) => setGate(event.target.value)} placeholder="e.g. Main Gate" disabled={isCheckingIn} />
        </FormField>
        <FormField label="Guard Remarks (Optional)">
          <Input value={remarks} onChange={(event) => setRemarks(event.target.value)} placeholder="Verification notes" disabled={isCheckingIn} />
        </FormField>
      </FormModal>
    </>
  );
};

export default SecurityPreApprovedVisitorsPage;
