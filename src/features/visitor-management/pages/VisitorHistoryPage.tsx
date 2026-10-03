import React, { useState } from "react";
import { AccessRestricted, DataTable, StatusPill, type Column } from "@/components/common";
import { isResidentVisitorRole, isVisitorOperationsRole } from "@/constants/roleCodes";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import { usePageHeader } from "@/hooks/usePageHeader";
import {
  useGetResidentVisitorHistoryQuery,
  useGetResidentGateRequestHistoryQuery,
  useGetSecurityGateRequestHistoryQuery,
  useGetVisitorHistoryQuery,
} from "../api";
import type { SecurityGateRequest, VisitorGateRow } from "../types";

const formatDateTime = (value?: string | null) =>
  value ? new Date(value).toLocaleString() : "—";

const requestStatusVariant = (status: SecurityGateRequest["status"]) => {
  if (status === "Approved") return "success";
  if (status === "Denied") return "danger";
  if (status === "Checked-In") return "info";
  if (status === "Checked-Out") return "neutral";
  return "warning";
};

export const VisitorHistoryPage: React.FC = () => {
  const { account } = useAuth();
  const [activeTab, setActiveTab] = useState("entries");
  const isSecurity = isVisitorOperationsRole(account?.role_code);
  const isResident = isResidentVisitorRole(account?.role_code);
  const residentHistory = useGetResidentVisitorHistoryQuery(undefined, { skip: !isResident });
  const securityHistory = useGetVisitorHistoryQuery(undefined, { skip: !isSecurity });
  const residentRequestHistory = useGetResidentGateRequestHistoryQuery(undefined, {
    skip: !isResident,
  });
  const securityRequestHistory = useGetSecurityGateRequestHistoryQuery(undefined, {
    skip: !isSecurity,
  });

  usePageHeader({
    title: "Visitor History",
    description: isSecurity
      ? "Review visitor activity and requests sent from the gate."
      : "Review visitor activity and gate requests received for your unit.",
  });

  if (!isSecurity && !isResident) {
    return <AccessRestricted moduleName="Visitor History" showAction />;
  }

  const entryColumns: Column<VisitorGateRow>[] = [
    {
      key: "visitor_name",
      header: "Visitor",
      render: (visitor) => (
        <div>
          <p className="text-xs font-semibold text-slate-800">{visitor.visitor_name}</p>
          <p className="text-[11px] text-slate-500">{visitor.mobile} · {visitor.visitor_type || "Visitor"}</p>
        </div>
      ),
    },
    {
      key: "unit_number",
      header: "Destination",
      render: (visitor) => `${visitor.block_name ? `${visitor.block_name} · ` : ""}Unit ${visitor.unit_number || "—"}`,
    },
    {
      key: "entry_type",
      header: "Entry Type",
      render: (visitor) => <StatusPill size="xs" status={visitor.entry_type}>{visitor.entry_type || "Visitor"}</StatusPill>,
    },
    {
      key: "check_in",
      header: "Check In",
      render: (visitor) => formatDateTime(visitor.check_in),
    },
    {
      key: "check_out",
      header: "Check Out",
      render: (visitor) => formatDateTime(visitor.check_out),
    },
    {
      key: "status",
      header: "Status",
      render: (visitor) => <StatusPill size="xs" status={visitor.status}>{visitor.status || "Completed"}</StatusPill>,
    },
  ];

  const requestColumns: Column<SecurityGateRequest>[] = [
    {
      key: "visitor_name",
      header: isSecurity ? "Request From" : "Visitor",
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
      header: isSecurity ? "Sent To" : "For Your Unit",
      render: (request) =>
        `${request.block_name ? `${request.block_name} · ` : ""}Unit ${request.unit_number || "—"}`,
    },
    {
      key: "purpose",
      header: "Purpose",
      render: (request) => request.purpose || "—",
    },
    {
      key: "status",
      header: "Request Status",
      render: (request) => (
        <StatusPill variant={requestStatusVariant(request.status)} size="xs" dot>
          {request.status}
        </StatusPill>
      ),
    },
    {
      key: "created_at",
      header: "Requested At",
      render: (request) => formatDateTime(request.created_at),
    },
  ];

  const entryRows = isSecurity
    ? securityHistory.data?.visitors || []
    : residentHistory.data?.visitors || [];
  const requestRows = isSecurity
    ? securityRequestHistory.data?.requests || []
    : residentRequestHistory.data?.requests || [];

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
      <div className="border-b border-slate-200 pb-3">
        <TabsList className="h-10 rounded-xl bg-slate-100 p-1">
          <TabsTrigger value="entries" className="rounded-lg px-4 py-1.5 text-xs font-semibold">
            Visitor Entries
          </TabsTrigger>
          <TabsTrigger value="requests" className="rounded-lg px-4 py-1.5 text-xs font-semibold">
            Gate Request History
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="entries" className="mt-0 focus-visible:outline-none">
        <DataTable
          data={entryRows}
          columns={entryColumns}
          density="compact"
          enableGlobalFilter
          searchKeys={["visitor_name", "mobile", "unit_number", "block_name", "entry_type", "status"]}
          searchPlaceholder="Search visitor entries..."
          enableSorting
          enableColumnFilters
          enablePagination
          pagination={{ isServer: false, pageSize: 10, pageSizeOptions: [10, 25, 50] }}
          isLoading={securityHistory.isLoading || residentHistory.isLoading}
          emptyTitle="No visitor entry history"
          emptyMessage="Completed entries and exits will appear here."
        />
      </TabsContent>

      <TabsContent value="requests" className="mt-0 focus-visible:outline-none">
        <DataTable
          data={requestRows}
          columns={requestColumns}
          density="compact"
          enableGlobalFilter
          searchKeys={["visitor_name", "mobile", "unit_number", "block_name", "purpose", "status"]}
          searchPlaceholder="Search gate request history..."
          enableSorting
          enableColumnFilters
          enablePagination
          pagination={{ isServer: false, pageSize: 10, pageSizeOptions: [10, 25, 50] }}
          isLoading={securityRequestHistory.isLoading || residentRequestHistory.isLoading}
          emptyTitle="No gate request history"
          emptyMessage={
            isSecurity
              ? "Requests sent from the gate will appear here."
              : "Requests received for your unit will appear here."
          }
        />
      </TabsContent>
    </Tabs>
  );
};

export default VisitorHistoryPage;
