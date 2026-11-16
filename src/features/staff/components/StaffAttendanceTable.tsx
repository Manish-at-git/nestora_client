import { useMemo } from "react";
import { CalendarPlus } from "lucide-react";
import { DataTable, type Column } from "@/components/common";
import { Button } from "@/components/ui/button";
import type { StaffAttendance } from "../types";

const displayDateTime = (value?: string | null) => value ? new Date(value).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : "—";

export function StaffAttendanceTable({ attendance, isLoading, canAddPastAttendance, onAddPastAttendance }: { attendance: StaffAttendance[]; isLoading: boolean; canAddPastAttendance: boolean; onAddPastAttendance: () => void }) {
  const columns = useMemo<Column<StaffAttendance>[]>(() => [
    { key: "staff_name", header: "Staff Member", sortable: true, filterable: true, minWidth: "180px", render: (row) => <div><p className="text-xs font-semibold text-slate-900">{row.staff_name}</p><p className="font-mono text-xs text-slate-500">{row.staff_code}</p></div> },
    { key: "designation", header: "Work Type", sortable: true, filterable: true, width: "150px" },
    { key: "association_name", header: "Association", sortable: true, filterable: true, minWidth: "170px" },
    { key: "check_in_at", header: "Checked In", sortable: true, width: "190px", render: (row) => <span className="text-xs text-slate-700">{displayDateTime(row.check_in_at)}</span> },
    { key: "check_out_at", header: "Checked Out", sortable: true, width: "190px", render: (row) => <span className="text-xs text-slate-700">{displayDateTime(row.check_out_at)}</span> },
    { key: "gate", header: "Gate", width: "120px", render: (row) => <span className="text-xs text-slate-600">{row.gate || "—"}</span> },
  ], []);
  return <DataTable data={attendance} columns={columns} density="compact" isLoading={isLoading} enableGlobalFilter enableColumnFilters enableSorting searchKeys={["staff_name", "staff_code", "designation", "association_name"]} searchPlaceholder="Search attendance..." pagination={{ isServer: false, pageSize: 15, pageSizeOptions: [15, 25, 50] }} emptyTitle="No attendance records" emptyMessage="QR check-ins and check-outs will appear here." headerActions={canAddPastAttendance ? <Button onClick={onAddPastAttendance}><CalendarPlus size={15} className="mr-1.5" />Add Past Attendance</Button> : undefined} />;
}
