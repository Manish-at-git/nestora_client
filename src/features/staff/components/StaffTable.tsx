import { useMemo } from "react";
import { Eye, Pencil, Plus, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable, StatusPill, type Column } from "@/components/common";
import type { StaffMember } from "../types";

interface StaffTableProps {
  staff: StaffMember[];
  isLoading: boolean;
  canManage: boolean;
  canScan: boolean;
  onAdd: () => void;
  onEdit: (staff: StaffMember) => void;
  onPass: (staff: StaffMember) => void;
  onScan: () => void;
}

export function StaffTable({ staff, isLoading, canManage, canScan, onAdd, onEdit, onPass, onScan }: StaffTableProps) {
  const columns = useMemo<Column<StaffMember>[]>(() => [
    { key: "staff_code", header: "Staff ID", width: "145px", render: (row) => <span className="font-mono text-xs font-semibold text-slate-700">{row.staff_code}</span> },
    { key: "name", header: "Staff Member", sortable: true, filterable: true, minWidth: "180px", render: (row) => <div><p className="text-xs font-semibold text-slate-900">{row.first_name} {row.last_name}</p><p className="text-xs text-slate-500">{row.contact_number}</p></div> },
    { key: "temp_password", header: "Temp Password", width: "150px", render: (row) => row.temp_password ? <span className="inline-flex rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 font-mono text-xs font-semibold text-amber-900">{row.temp_password}</span> : <span className="text-xs text-slate-400">—</span> },
    { key: "email", header: "Email", sortable: true, filterable: true, minWidth: "190px", render: (row) => <span className="text-xs text-slate-600">{row.email}</span> },
    { key: "designation", header: "Work Type", sortable: true, filterable: true, width: "150px" },
    { key: "association_name", header: "Association", sortable: true, filterable: true, minWidth: "180px" },
    { key: "assignment", header: "Assignment", width: "145px", render: (row) => <span className="text-xs text-slate-600">{row.assignment_type === "unit" ? `${row.block_name || "Block"} · ${row.unit_number || "Unit"}` : "Common Area"}</span> },
    { key: "attendance", header: "Today", width: "130px", render: (row) => <StatusPill size="xs" shape="rounded" variant={row.active_attendance_id ? "success" : "neutral"}>{row.active_attendance_id ? "Checked in" : row.today_check_out_at ? "Checked out" : "Not checked in"}</StatusPill> },
    { key: "status", header: "Status", width: "100px", render: (row) => <StatusPill size="xs" shape="rounded" variant={row.is_active ? "success" : "neutral"}>{row.is_active ? "Active" : "Inactive"}</StatusPill> },
    { key: "actions", header: "Actions", width: "112px", className: "text-center", headerClassName: "justify-center text-center", render: (row) => <div className="flex items-center justify-center gap-1"><Button type="button" variant="ghost" size="icon" title="View staff QR pass" onClick={() => onPass(row)}><QrCode size={15} /></Button>{canManage ? <Button type="button" variant="ghost" size="icon" title="Edit staff member" onClick={() => onEdit(row)}><Pencil size={15} /></Button> : null}</div> },
  ], [canManage, onEdit, onPass]);

  return <DataTable
    data={staff}
    columns={columns}
    density="compact"
    isLoading={isLoading}
    enableGlobalFilter
    enableColumnFilters
    enableSorting
    searchKeys={["staff_code", "first_name", "last_name", "email", "designation", "association_name", "contact_number"]}
    searchPlaceholder="Search staff by name, ID, email, work type, or association..."
    pagination={{ isServer: false, pageSize: 15, pageSizeOptions: [15, 25, 50] }}
    emptyTitle="No staff members found"
    emptyMessage="Add daily workers to generate their permanent QR attendance pass."
    emptyActionLabel={canManage ? "+ Add Staff" : undefined}
    onEmptyAction={canManage ? onAdd : undefined}
    headerActions={
      canScan || canManage ? (
        <div className="flex items-center gap-2">
          {canScan ? <Button variant="outline" onClick={onScan}>Scan Staff QR</Button> : null}
          {canManage ? <Button onClick={onAdd}><Plus size={15} className="mr-1.5" />Add Staff</Button> : null}
        </div>
      ) : undefined
    }
  />;
}
