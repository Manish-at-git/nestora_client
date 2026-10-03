import React from "react";
import { Check, X } from "lucide-react";
import { toast } from "sonner";
import { DataTable, type Column } from "@/components/common";
import { Button } from "@/components/ui/button";
import {
  useApproveVisitorRequestMutation,
  useGetPendingVisitorRequestsQuery,
  useRejectVisitorRequestMutation,
} from "../api";
import type { PendingVisitorRequest } from "../types";

interface PendingVisitorRequestsProps {
  showEmptyState?: boolean;
}

export const PendingVisitorRequests: React.FC<PendingVisitorRequestsProps> = ({
  showEmptyState = false,
}) => {
  const { data, isLoading } = useGetPendingVisitorRequestsQuery();
  const [approve, approveState] = useApproveVisitorRequestMutation();
  const [reject, rejectState] = useRejectVisitorRequestMutation();
  const requests = data?.requests || [];

  if (!showEmptyState && (isLoading || requests.length === 0)) {
    return null;
  }

  const processRequest = async (visitId: string, accepted: boolean) => {
    try {
      if (accepted) {
        await approve(visitId).unwrap();
        toast.success("Visitor approved");
      } else {
        await reject(visitId).unwrap();
        toast.success("Visitor rejected");
      }
    } catch (error: any) {
      toast.error(error?.data?.detail || "Unable to process the visitor request");
    }
  };

  const columns: Column<PendingVisitorRequest>[] = [
    {
      key: "name",
      header: "Visitor",
      width: "260px",
      sortable: false,
      render: (request) => (
        <div>
          <p className="text-xs font-semibold text-slate-800">{request.name}</p>
          <p className="text-[11px] text-slate-500">{request.mobile}</p>
        </div>
      ),
    },
    {
      key: "visitor_type",
      header: "Type",
      width: "150px",
      sortable: false,
      render: (request) => request.visitor_type || "Visitor",
    },
    {
      key: "purpose",
      header: "Purpose",
      width: "320px",
      sortable: false,
      render: (request) => request.purpose || "—",
    },
    {
      key: "actions",
      header: "Decision",
      width: "180px",
      sortable: false,
      className: "text-right",
      headerClassName: "justify-end text-right",
      render: (request) => (
        <div className="flex items-center justify-end gap-2 whitespace-nowrap">
          <Button
            type="button"
            size="sm"
            disabled={approveState.isLoading || rejectState.isLoading}
            onClick={() => processRequest(request.visit_id, true)}
          >
            <Check size={14} /> Approve
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={approveState.isLoading || rejectState.isLoading}
            onClick={() => processRequest(request.visit_id, false)}
          >
            <X size={14} /> Reject
          </Button>
        </div>
      ),
    },
  ];

  return (
    <section>
      <DataTable
        data={requests}
        columns={columns}
        density="compact"
        isLoading={isLoading}
        emptyTitle="No pending visitor approvals"
        emptyMessage="New walk-in approval requests from security will appear here."
        enableColumnFilters={false}
        enableSorting={false}
      />
    </section>
  );
};

export default PendingVisitorRequests;
