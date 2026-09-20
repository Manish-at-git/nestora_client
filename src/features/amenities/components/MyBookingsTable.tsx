import React, { useMemo } from "react";
import { DataTable, Column } from "@/components/common/DataTable";
import { StatusPill } from "@/components/common/StatusPill";
import { EmptyState } from "@/components/common/EmptyState";
import { Calendar, Clock } from "lucide-react";
import type { AmenityBooking } from "../types";

export interface MyBookingsTableProps {
  bookings: AmenityBooking[];
  isLoading?: boolean;
  currencySymbol?: string;
}

export const MyBookingsTable: React.FC<MyBookingsTableProps> = ({
  bookings = [],
  isLoading = false,
  currencySymbol = "$",
}) => {
  const formatTime = (timeVal: string | number | null | undefined): string => {
    if (timeVal == null) return "N/A";
    if (typeof timeVal === "string") return timeVal.substring(0, 5);
    if (typeof timeVal === "number") {
      const hrs = Math.floor(timeVal / 3600);
      const mins = Math.floor((timeVal % 3600) / 60);
      return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
    }
    return String(timeVal).substring(0, 5);
  };

  const columns = useMemo<Column<AmenityBooking>[]>(
    () => [
      {
        key: "sr_no",
        header: "Sr. No.",
        width: "70px",
        className: "text-center",
        render: (_row, index) => (
          <span className="text-xs text-slate-500 font-medium">{index + 1}</span>
        ),
      },
      {
        key: "amenity_name",
        header: "Amenity",
        width: "220px",
        sortable: true,
        render: (row) => (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0 border border-slate-200">
              {(String(row.amenity_name || "A")[0] || "A").toUpperCase()}
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-900">{row.amenity_name || "Amenity"}</p>
              {row.association_name && (
                <p className="text-[11px] text-slate-500">{row.association_name}</p>
              )}
            </div>
          </div>
        ),
      },
      {
        key: "booking_date",
        header: "Date",
        width: "150px",
        sortable: true,
        render: (row) => {
          if (!row.booking_date) return <span className="text-xs text-slate-400">N/A</span>;
          const d = new Date(String(row.booking_date));
          return (
            <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
              <Calendar size={13} className="text-slate-400" />
              {d.toLocaleDateString(undefined, { dateStyle: "medium" })}
            </div>
          );
        },
      },
      {
        key: "start_time",
        header: "Time Slot",
        width: "160px",
        render: (row) => (
          <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
            <Clock size={13} className="text-slate-400" />
            {formatTime(row.start_time)} – {formatTime(row.end_time)}
            {row.duration_hours ? (
              <span className="text-[10px] text-slate-400">({row.duration_hours}h)</span>
            ) : null}
          </div>
        ),
      },
      {
        key: "amount",
        header: "Amount",
        width: "120px",
        sortable: true,
        render: (row) => {
          const amt =
            typeof row.amount === "number"
              ? row.amount
              : parseFloat(String(row.amount || "0"));
          return (
            <span className="text-xs font-bold text-slate-900">
              {currencySymbol}
              {amt.toFixed(2)}
            </span>
          );
        },
      },
      {
        key: "payment_status",
        header: "Payment Status",
        width: "140px",
        sortable: true,
        render: (row) => {
          const status = String(row.payment_status || "Pending");
          const variant =
            status.toLowerCase() === "confirmed"
              ? "success"
              : status.toLowerCase() === "failed"
              ? "danger"
              : "warning";
          return <StatusPill status={status} variant={variant} dot={true} size="xs" />;
        },
      },
    ],
    [currencySymbol]
  );

  if (!isLoading && bookings.length === 0) {
    return (
      <EmptyState
        title="No Bookings Yet"
        description="You have not reserved any amenities. Browse available amenities to make your first reservation."
        icon={Calendar}
      />
    );
  }

  return (
    <DataTable
      data={bookings}
      columns={columns}
      isLoading={isLoading}
      searchKeys={["amenity_name", "booking_date", "payment_status"]}
      searchPlaceholder="Search your bookings..."
      enableGlobalFilter={true}
      enableColumnFilters={true}
      enableSorting={true}
      density="compact"
    />
  );
};
