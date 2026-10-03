import React, { useState } from "react";
import { LogIn } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog, DataTable, StatusPill, type Column } from "@/components/common";
import { Button } from "@/components/ui/button";
import { useCheckInWalkInVisitorMutation } from "../api";
import type { SecurityGateRequest } from "../types";

interface GateRequestTableProps {
  requests: SecurityGateRequest[];
  isLoading: boolean;
}

const formatRequestedAt = (value?: string) => (value ? new Date(value).toLocaleString() : "—");

const statusVariant = (status: SecurityGateRequest["status"]) => {
  if (status === "Approved") return "success";
  if (status === "Denied") return "danger";
  return "warning";
};

export const GateRequestTable: React.FC<GateRequestTableProps> = ({ requests, isLoading }) => {
  const [selectedRequest, setSelectedRequest] = useState<SecurityGateRequest | null>(null);
  const [checkIn, checkInState] = useCheckInWalkInVisitorMutation();

  const confirmCheckIn = async () => {
    if (!selectedRequest) return;
    try {
      await checkIn(selectedRequest.visit_id).unwrap();
      toast.success(`${selectedRequest.visitor_name} checked in`);
      setSelectedRequest(null);
    } catch (error: any) {
      toast.error(error?.data?.detail || "Unable to check in this visitor");
    }
  };

  const columns: Column<SecurityGateRequest>[] = [
    {
      key: "visitor_name",
      header: "Visitor",
      width: "250px",
      render: (request) => (
        <div>
          <p className="text-xs font-semibold text-slate-800">{request.visitor_name}</p>
          <p className="text-[11px] text-slate-500">
            {request.mobile} · {request.visitor_type || "Visitor"}
          </p>
        </div>
      ),
    },
    {
      key: "unit_number",
      header: "Destination",
      width: "220px",
      render: (request) =>
        `${request.block_name ? `${request.block_name} · ` : ""}Unit ${request.unit_number || "—"}`,
    },
    {
      key: "purpose",
      header: "Purpose",
      width: "200px",
      render: (request) => request.purpose || "—",
    },
    {
      key: "status",
      header: "Status",
      width: "140px",
      render: (request) => (
        <StatusPill variant={statusVariant(request.status)} size="xs" dot>
          {request.status}
        </StatusPill>
      ),
    },
    {
      key: "created_at",
      header: "Requested",
      width: "190px",
      render: (request) => formatRequestedAt(request.created_at),
    },
    {
      key: "actions",
      header: "Action",
      width: "170px",
      render: (request) =>
        request.status === "Approved" ? (
          <Button type="button" size="sm" onClick={() => setSelectedRequest(request)}>
            <LogIn size={14} /> Check In
          </Button>
        ) : (
          <StatusPill variant={statusVariant(request.status)} size="xs" dot>
            {request.status === "Pending" ? "Awaiting approval" : "Rejected"}
          </StatusPill>
        ),
    },
  ];

  return (
    <>
      <DataTable
        data={requests}
        columns={columns}
        density="compact"
        enableGlobalFilter
        searchKeys={["visitor_name", "mobile", "unit_number", "block_name", "status"]}
        searchPlaceholder="Search gate requests..."
        enablePagination
        pagination={{ isServer: false, pageSize: 10, pageSizeOptions: [10, 25, 50] }}
        isLoading={isLoading}
        emptyTitle="No gate requests"
        emptyMessage="Submitted walk-in requests will appear here until they are checked in."
      />
      <ConfirmDialog
        isOpen={Boolean(selectedRequest)}
        onClose={() => setSelectedRequest(null)}
        onConfirm={confirmCheckIn}
        title="Check In Visitor"
        description={
          selectedRequest
            ? `Check in ${selectedRequest.visitor_name} for Unit ${selectedRequest.unit_number || "—"}?`
            : undefined
        }
        confirmText="Check In"
        isLoading={checkInState.isLoading}
      />
    </>
  );
};

export default GateRequestTable;
