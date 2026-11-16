import React, { useMemo } from "react";
import { Eye } from "lucide-react";
import { DataTable, StatusPill, type Column } from "@/components/common";
import { Button } from "@/components/ui/button";
import type { Violation } from "../types";

const HomeownerResponsePill: React.FC<{ violation: Violation }> = ({ violation }) => {
  if (violation.action === "Waive Off" && violation.status === "Approved") {
    return <StatusPill status="Waived off" variant="success" size="xs" />;
  }

  if (violation.violator_response === "Accept" || violation.violator_response === "Accepts") {
    return <StatusPill status="Accepted" variant="success" size="xs" />;
  }

  if (violation.violator_response === "Discuss with Board") {
    return <StatusPill status="Discuss with Board" variant="info" size="xs" />;
  }

  if (violation.violator_response === "Extension") {
    return <StatusPill status="Extension" variant="warning" size="xs" />;
  }

  if (violation.status === "Approved") {
    return <StatusPill status="Awaiting response" variant="warning" size="xs" />;
  }

  return <span className="text-xs text-slate-400">Not applicable</span>;
};

export const ViolationTable: React.FC<{
  violations: Violation[];
  isLoading: boolean;
  scope: "my_violations" | "against_me" | "new_admin" | "pending_board" | "approved" | "active" | "dismissed" | "all" | "board_all";
  showReporter?: boolean;
  showTarget?: boolean;
  onView: (violation: Violation) => void;
}> = ({ violations, isLoading, scope, showReporter = false, showTarget = true, onView }) => {
  const showHomeownerResponse = ["against_me", "approved", "active", "all", "board_all"].includes(scope);
  const columns = useMemo<Column<Violation>[]>(
    () => [
      {
        key: "display_id",
        header: "Violation ID",
        sortable: true,
        width: "130px",
        render: (row) => <span className="font-mono text-xs font-semibold">{row.display_id}</span>,
      },
      {
        key: "category",
        header: "Category",
        sortable: true,
        filterable: true,
        minWidth: "170px",
        render: (row) => <span className="text-xs font-medium text-slate-700">{row.category}</span>,
      },
      {
        key: "title",
        header: "Subject and details",
        sortable: true,
        filterable: true,
        minWidth: "280px",
        render: (row) => (
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-slate-800">{row.title}</p>
            <p className="line-clamp-2 text-xs text-slate-500">{row.description}</p>
          </div>
        ),
      },
      ...(showReporter
        ? [
            {
              key: "reporter_name",
              header: "Reporter",
              minWidth: "160px",
              render: (row: Violation) => (
                <span className="text-xs text-slate-700">
                  {row.reporter_name || "Homeowner"}
                  {row.reporter_unit_number ? ` · Unit ${row.reporter_unit_number}` : ""}
                </span>
              ),
            },
          ]
        : []),
      ...(showTarget
        ? [
            {
              key: "violator_name",
              header: "Target homeowner",
              minWidth: "160px",
              render: (row: Violation) => (
                <span className="text-xs text-slate-700">
                  {row.knows_violator
                    ? `${row.violator_name || "Homeowner"}${
                        row.violator_unit_number ? ` · Unit ${row.violator_unit_number}` : ""
                      }`
                    : "Unidentified"}
                </span>
              ),
            },
          ]
        : []),
      ...(showHomeownerResponse
        ? [
            {
              key: "violator_response",
              header: "Homeowner response",
              minWidth: "170px",
              render: (row: Violation) => <HomeownerResponsePill violation={row} />,
            },
          ]
        : []),
      {
        key: "status",
        header: "Status",
        sortable: true,
        width: "140px",
        render: (row) => {
          const displayStatus = scope === "active"
            ? "Active"
            : row.action === "Waive Off" && row.status === "Approved"
              ? "Waived off"
              : row.status;
          return <StatusPill status={displayStatus} variant={displayStatus === "Waived off" ? "success" : undefined} size="xs" />;
        },
      },
      {
        key: "created_at",
        header: "Created",
        sortable: true,
        width: "130px",
        render: (row) => (
          <span className="whitespace-nowrap text-xs text-slate-500">
            {new Date(row.created_at).toLocaleDateString()}
          </span>
        ),
      },
      {
        key: "actions",
        header: "Actions",
        width: "72px",
        className: "text-right",
        headerClassName: "text-right justify-end",
        render: (row) => (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onView(row)}
            className="h-7 w-7 cursor-pointer rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            title="View violation details"
          >
            <Eye size={14} />
          </Button>
        ),
      },
    ],
    [onView, scope, showHomeownerResponse, showReporter, showTarget],
  );

  return (
    <DataTable
      data={violations}
      columns={columns}
      isLoading={isLoading}
      enableGlobalFilter
      searchPlaceholder="Search violations…"
      searchKeys={["display_id", "title", "category", "status", "violator_response"]}
      emptyTitle="No violations found"
      emptyMessage={
        scope === "against_me"
          ? "There are no current violation reports registered against you."
          : scope === "pending_board"
            ? "No verified violations are awaiting board approval."
          : "Violations matching this view will appear here."
      }
      enablePagination={false}
      onRowClick={onView}
    />
  );
};
