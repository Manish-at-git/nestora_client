import React, { useMemo, useState } from "react";
import { CalendarDays, Clock, Plus, UserRound, UsersRound } from "lucide-react";
import { toast } from "sonner";
import {
  ConfirmDialog,
  DataTable,
  StatusPill,
  TableRowActions,
  type Column,
} from "@/components/common";
import { Button } from "@/components/ui/button";
import { useCancelPreApprovedVisitorMutation } from "../api";
import type { PreApprovedVisitor, VisitorPassStatus } from "../types";
import { formatVisitDate, formatVisitTime } from "../utils/formatters";

interface PreApprovedVisitorTableProps {
  visitors: PreApprovedVisitor[];
  isLoading: boolean;
  canCreate: boolean;
  canDelete: boolean;
  onAdd: () => void;
  onView: (visitor: PreApprovedVisitor) => void;
}

const statusVariant = (status: VisitorPassStatus) => {
  if (status === "Active") return "success";
  if (status === "Used") return "info";
  if (status === "Cancelled") return "danger";
  return "neutral";
};

export const PreApprovedVisitorTable: React.FC<PreApprovedVisitorTableProps> = ({
  visitors,
  isLoading,
  canCreate,
  canDelete,
  onAdd,
  onView,
}) => {
  const [visitorToCancel, setVisitorToCancel] = useState<PreApprovedVisitor | null>(null);
  const [cancelVisitor, { isLoading: isCancelling }] =
    useCancelPreApprovedVisitorMutation();
  const reserveCancelSlot = canDelete && visitors.some((visitor) => visitor.status === "Active");

  const confirmCancel = async () => {
    if (!visitorToCancel) return;
    try {
      await cancelVisitor(visitorToCancel.id).unwrap();
      toast.success("Visitor pass cancelled");
      setVisitorToCancel(null);
    } catch (error: any) {
      toast.error(
        error?.data?.detail || error?.data || error?.message || "Failed to cancel visitor pass",
      );
    }
  };

  const columns = useMemo<Column<PreApprovedVisitor>[]>(
    () => [
      {
        key: "sr_no",
        header: "Sr. No.",
        sortable: false,
        width: "64px",
        className: "text-center",
        render: (_row, index) => <span className="text-xs text-slate-500">{index + 1}</span>,
      },
      {
        key: "visitor_name",
        header: "Visitor",
        sortable: true,
        filterable: true,
        minWidth: "220px",
        render: (row) => (
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <UserRound size={15} />
            </div>
            <div className="min-w-0">
              <span className="block truncate text-xs font-semibold text-slate-800">
                {row.visitor_name}
              </span>
              <span className="block truncate text-[11px] text-slate-400">
                {row.mobile} • {row.visitor_type}
              </span>
            </div>
          </div>
        ),
      },
      {
        key: "visit_date",
        header: "Visit Schedule",
        sortable: true,
        filterable: true,
        minWidth: "210px",
        render: (row) => (
          <div className="space-y-1 text-xs text-slate-600">
            <span className="flex items-center gap-1.5">
              <CalendarDays size={13} className="text-slate-400" />
              {formatVisitDate(row.visit_date)}
            </span>
            <span className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <Clock size={12} className="text-slate-400" />
              {formatVisitTime(row.start_time)} – {formatVisitTime(row.end_time)}
            </span>
          </div>
        ),
      },
      {
        key: "number_of_visitors",
        header: "Visitors",
        sortable: true,
        width: "105px",
        className: "text-center",
        headerClassName: "justify-center text-center",
        render: (row) => (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600">
            <UsersRound size={13} className="text-slate-400" />
            {row.number_of_visitors || 1}
          </span>
        ),
      },
      {
        key: "pass_code",
        header: "Pass Code",
        sortable: true,
        filterable: true,
        width: "145px",
        render: (row) => (
          <span className="font-mono text-xs font-semibold tracking-wide text-slate-700">
            {row.pass_code}
          </span>
        ),
      },
      {
        key: "status",
        header: "Status",
        sortable: true,
        filterable: true,
        width: "115px",
        className: "text-center",
        headerClassName: "justify-center text-center",
        render: (row) => (
          <StatusPill variant={statusVariant(row.status)} size="xs" dot>
            {row.status}
          </StatusPill>
        ),
      },
      {
        key: "actions",
        header: "Actions",
        sortable: false,
        width: "92px",
        className: "text-center",
        headerClassName: "justify-center text-center",
        render: (row) => (
          <TableRowActions
            onView={() => onView(row)}
            onDelete={row.status === "Active" ? () => setVisitorToCancel(row) : undefined}
            canDelete={canDelete}
            reserveViewSlot
            reserveDeleteSlot={reserveCancelSlot}
            viewTooltip="View visitor pass"
            deleteTooltip="Cancel visitor pass"
          />
        ),
      },
    ],
    [canDelete, onView, reserveCancelSlot],
  );

  const headerAction = canCreate ? (
    <Button type="button" onClick={onAdd}>
      <Plus size={15} /> Add New Visitor
    </Button>
  ) : undefined;

  return (
    <>
      <DataTable
        data={visitors}
        columns={columns}
        density="compact"
        searchPlaceholder="Search visitors, mobile, type, or pass code..."
        searchKeys={["visitor_name", "mobile", "visitor_type", "pass_code", "status"]}
        enableGlobalFilter
        enableColumnFilters
        enableSorting
        pagination={{ isServer: false, pageSize: 10, pageSizeOptions: [10, 25, 50] }}
        isLoading={isLoading}
        emptyTitle="No visitor passes found"
        emptyMessage="Create a visitor pass in advance for quick entry at the gate."
        emptyActionLabel={canCreate ? "+ Add New Visitor" : undefined}
        onEmptyAction={canCreate ? onAdd : undefined}
        headerActions={headerAction}
      />

      <ConfirmDialog
        isOpen={Boolean(visitorToCancel)}
        onClose={() => setVisitorToCancel(null)}
        onConfirm={confirmCancel}
        title="Cancel Visitor Pass"
        description={
          visitorToCancel
            ? `Cancel the active pass for ${visitorToCancel.visitor_name}? It can no longer be used at the gate.`
            : undefined
        }
        confirmText="Cancel Pass"
        variant="warning"
        isLoading={isCancelling}
      />
    </>
  );
};

export default PreApprovedVisitorTable;
