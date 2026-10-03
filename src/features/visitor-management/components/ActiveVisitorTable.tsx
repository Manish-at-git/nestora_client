import React, { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog, DataTable, StatusPill, type Column } from "@/components/common";
import { Button } from "@/components/ui/button";
import {
  useCheckOutVisitorMutation,
  useCheckOutWalkInVisitorMutation,
  useGetVisitorCheckinsQuery,
} from "../api";
import type { VisitorGateRow } from "../types";
import { VisitorCheckoutButton } from "./VisitorCheckoutButton";

interface ActiveVisitorTableProps {
  onCreateVisitor: () => void;
}

const formatDateTime = (value?: string | null) =>
  value ? new Date(value).toLocaleString() : "—";

export const ActiveVisitorTable: React.FC<ActiveVisitorTableProps> = ({ onCreateVisitor }) => {
  const { data, isLoading } = useGetVisitorCheckinsQuery();
  const [selectedVisitor, setSelectedVisitor] = useState<VisitorGateRow | null>(null);
  const [checkOutPreApproved, preApprovedState] = useCheckOutVisitorMutation();
  const [checkOutWalkIn, walkInState] = useCheckOutWalkInVisitorMutation();

  const confirmCheckOut = async () => {
    if (!selectedVisitor?.entry_id) return;
    try {
      if (selectedVisitor.source_type === "walk_in") {
        await checkOutWalkIn(selectedVisitor.entry_id).unwrap();
      } else {
        await checkOutPreApproved(selectedVisitor.entry_id).unwrap();
      }
      toast.success(`${selectedVisitor.visitor_name} checked out`);
      setSelectedVisitor(null);
    } catch (error: any) {
      toast.error(error?.data?.detail || "Unable to check out this visitor");
    }
  };

  const columns: Column<VisitorGateRow>[] = [
    {
      key: "visitor_name",
      header: "Visitor",
      render: (visitor) => (
        <div>
          <p className="text-xs font-semibold text-slate-800">{visitor.visitor_name}</p>
          <p className="text-[11px] text-slate-500">
            {visitor.mobile} · {visitor.visitor_type || "Visitor"}
          </p>
        </div>
      ),
    },
    {
      key: "unit_number",
      header: "Destination",
      render: (visitor) =>
        `${visitor.block_name ? `${visitor.block_name} · ` : ""}Unit ${visitor.unit_number || "—"}`,
    },
    {
      key: "source_type",
      header: "Entry Type",
      render: (visitor) => (
        <StatusPill size="xs" status={visitor.source_type}>
          {visitor.source_type === "walk_in" ? "Walk-In" : "Pre-Approved"}
        </StatusPill>
      ),
    },
    {
      key: "check_in",
      header: "Checked In",
      render: (visitor) => formatDateTime(visitor.check_in),
    },
    {
      key: "actions",
      header: "Action",
      width: "130px",
      render: (visitor) => (
        <VisitorCheckoutButton onClick={() => setSelectedVisitor(visitor)} />
      ),
    },
  ];

  return (
    <>
      <DataTable
        data={data?.visitors || []}
        columns={columns}
        density="compact"
        enableGlobalFilter
        searchKeys={["visitor_name", "mobile", "unit_number", "block_name"]}
        searchPlaceholder="Search active visitors..."
        enablePagination
        pagination={{ isServer: false, pageSize: 10, pageSizeOptions: [10, 25, 50] }}
        isLoading={isLoading}
        emptyTitle="No active visitors"
        emptyMessage="Checked-in visitors will appear here."
        headerActions={
          <Button type="button" onClick={onCreateVisitor}>
            <Plus size={15} /> New Visitor
          </Button>
        }
      />
      <ConfirmDialog
        isOpen={Boolean(selectedVisitor)}
        onClose={() => setSelectedVisitor(null)}
        onConfirm={confirmCheckOut}
        title="Check Out Visitor"
        description={
          selectedVisitor ? `Record the exit of ${selectedVisitor.visitor_name}?` : undefined
        }
        confirmText="Check Out"
        isLoading={preApprovedState.isLoading || walkInState.isLoading}
      />
    </>
  );
};

export default ActiveVisitorTable;
