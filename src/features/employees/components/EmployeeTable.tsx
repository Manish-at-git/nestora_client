import React, { useMemo } from "react";
import { Eye, Pencil, Shield, Building, Calendar, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable, Column, StatusPill } from "@/components/common";
import { usePermission } from "@/hooks/usePermission";
import type { Employee } from "../types";

export interface EmployeeTableProps {
  employees: Employee[];
  isLoading?: boolean;
  onAdd?: () => void;
  onView: (employee: Employee) => void;
  onEdit: (employee: Employee) => void;
}

export const EmployeeTable: React.FC<EmployeeTableProps> = ({
  employees,
  isLoading = false,
  onAdd,
  onView,
  onEdit,
}) => {
  const { canCreate, canUpdate } = usePermission();
  const columns = useMemo<Column<Employee>[]>(
    () => [
      {
        key: "sr_no",
        header: "Sr. No.",
        sortable: false,
        width: "64px",
        className: "text-center",
        render: (_row, index) => (
          <span className="font-medium text-slate-500 text-xs">
            {index + 1}
          </span>
        ),
      },
      {
        key: "employee_id_number",
        header: "Employee ID",
        sortable: true,
        filterable: true,
        width: "130px",
        render: (row) =>
          row.employee_id_number ? (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-mono font-semibold bg-slate-100 text-slate-700 border border-slate-200/80">
              {row.employee_id_number}
            </span>
          ) : (
            <span className="text-xs text-slate-400">—</span>
          ),
      },
      {
        key: "name",
        header: "Name",
        sortable: true,
        filterable: true,
        width: "180px",
        render: (row) => {
          const fullName =
            row.first_name || row.last_name
              ? `${row.first_name || ""} ${row.last_name || ""}`.trim()
              : row.name || row.email?.split("@")[0] || "Employee";

          return (
            <span className="font-semibold text-slate-900 text-xs truncate">
              {fullName}
            </span>
          );
        },
      },
      {
        key: "temp_password",
        header: "Temp Password",
        sortable: false,
        filterable: false,
        width: "150px",
        render: (row) =>
          row.temp_password ? (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-mono font-semibold bg-amber-50 text-amber-900 border border-amber-200">
              {row.temp_password}
            </span>
          ) : (
            <span className="text-xs text-slate-400">—</span>
          ),
      },
      {
        key: "email",
        header: "Email",
        sortable: true,
        filterable: true,
        minWidth: "190px",
        render: (row) => (
          <span className="text-xs text-slate-600 truncate">{row.email}</span>
        ),
      },
      {
        key: "role_name",
        header: "Role",
        sortable: true,
        filterable: true,
        width: "150px",
        render: (row) => (
          <StatusPill
            variant="neutral"
            shape="rounded"
            size="xs"
            icon={<Shield size={12} className="text-indigo-600" />}
          >
            {row.role_name || "Platform Staff"}
          </StatusPill>
        ),
      },
      {
        key: "associations",
        header: "Assigned Associations",
        sortable: false,
        minWidth: "180px",
        render: (row) => {
          const associations = row.associations || [];
          if (associations.length === 0) {
            return (
              <span className="text-xs text-slate-400 italic">
                All Associations
              </span>
            );
          }

          return (
            <div className="flex flex-wrap gap-1 max-w-xs">
              {associations.slice(0, 2).map((a) => (
                <span
                  key={a.id}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200/60"
                >
                  <Building size={10} />
                  <span className="truncate max-w-[100px]">{a.name}</span>
                </span>
              ))}
              {associations.length > 2 && (
                <span className="px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-slate-200/70 text-slate-700">
                  +{associations.length - 2}
                </span>
              )}
            </div>
          );
        },
      },
      {
        key: "onboard_date",
        header: "Onboard Date",
        sortable: true,
        filterable: true,
        width: "130px",
        render: (row) =>
          row.onboard_date ? (
            <span className="inline-flex items-center gap-1.5 text-xs text-slate-600">
              <Calendar size={12} className="text-slate-400" />
              {new Date(row.onboard_date).toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
          ) : (
            <span className="text-xs text-slate-400">—</span>
          ),
      },
      {
        key: "actions",
        header: "Actions",
        sortable: false,
        width: "80px",
        className: "text-center",
        headerClassName: "text-center justify-center",
        render: (row) => (
          <div className="flex items-center justify-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onView(row)}
              className="rounded-lg h-7 w-7 text-slate-500 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
              title="View Employee Profile"
            >
              <Eye size={14} />
            </Button>
            {canUpdate && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(row)}
                className="rounded-lg h-7 w-7 text-slate-500 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
                title="Edit Employee"
              >
                <Pencil size={13} />
              </Button>
            )}
          </div>
        ),
      },
    ],
    [onView, onEdit, canUpdate]
  );

  return (
    <DataTable
      data={employees}
      columns={columns}
      density="compact"
      searchPlaceholder="Search employees by name, ID, email or role..."
      searchKeys={[
        "first_name",
        "last_name",
        "name",
        "email",
        "employee_id_number",
        "role_name",
      ]}
      enableGlobalFilter={true}
      enableColumnFilters={true}
      enableSorting={true}
      pagination={{
        isServer: false,
        pageSize: 15,
        pageSizeOptions: [15, 25, 50],
      }}
      isLoading={isLoading}
      emptyTitle="No employees found"
      emptyMessage="No employee records have been onboarded yet."
      emptyActionLabel={canCreate && onAdd ? "+ Add Employee" : undefined}
      onEmptyAction={canCreate ? onAdd : undefined}
      headerActions={
        canCreate && onAdd && (
          <Button onClick={onAdd}>
            <Plus size={15} className="mr-1.5" />
            <span>Add Employee</span>
          </Button>
        )
      }
    />
  );
};

export default EmployeeTable;
