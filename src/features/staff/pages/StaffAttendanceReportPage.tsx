import { useEffect, useMemo, useState } from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { AccessRestricted, DataTable, FormField, StatusPill, type Column } from "@/components/common";
import { Button } from "@/components/ui/button";
import { usePageHeader } from "@/hooks/usePageHeader";
import { useAppSelector } from "@/app/hooks";
import { MonthPicker } from "@/components/ui/month-picker";
import { Select } from "@/components/ui/select";
import { usePermission } from "@/hooks/usePermission";
import { FEATURES } from "@/constants/featureCodes";
import apiClient, { formatApiErrorDetail } from "@/services/api/apiClient";
import { useGetMonthlyStaffAttendanceReportQuery, useGetStaffQuery } from "../api";
import { STAFF_WORK_TYPES } from "../constants";
import type { StaffMonthlyAttendanceRow } from "../types";

const currentMonth = () => new Date().toISOString().slice(0, 7);

export function StaffAttendanceReportPage() {
  const { canView, isLoading: permissionLoading } = usePermission(FEATURES.STAFF_ATTENDANCE_REPORT.FEATURE_CODE);
  const activeAssociationId = useAppSelector((state) => state.ui.activeAssociationId);
  const associationId = activeAssociationId && activeAssociationId !== "ALL" ? String(activeAssociationId) : "";
  const [month, setMonth] = useState(currentMonth);
  const [designation, setDesignation] = useState("");
  const [staffId, setStaffId] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const { data: staff = [] } = useGetStaffQuery(undefined, { skip: !canView });
  const query = { association_id: associationId, month, staff_id: staffId || undefined, designation: designation || undefined };
  const { data: report, isLoading } = useGetMonthlyStaffAttendanceReportQuery(query, { skip: !canView || !associationId || !month });

  useEffect(() => {
    setStaffId("");
  }, [associationId]);

  const dayColumns = useMemo<Column<StaffMonthlyAttendanceRow>[]>(() => (report?.rows[0]?.days || []).map((day) => ({
    key: day.date,
    header: String(new Date(`${day.date}T00:00:00`).getDate()),
    width: "42px",
    sortable: false,
    className: "text-center",
    headerClassName: "justify-center text-center",
    render: (row) => {
      const value = row.days.find((item) => item.date === day.date);
      if (!value || value.status === "absent") return <span className="text-xs text-slate-300">—</span>;
      return <StatusPill size="xs" shape="rounded" variant={value.status === "present" ? "success" : "warning"} title={value.status === "present" ? `${value.check_in_at} to ${value.check_out_at}` : "Open / incomplete check-in"}>{value.status === "present" ? "P" : "IN"}</StatusPill>;
    },
  })), [report]);
  const columns = useMemo<Column<StaffMonthlyAttendanceRow>[]>(() => [
    { key: "staff_name", header: "Staff Member", minWidth: "180px", render: (row) => <div><p className="text-xs font-semibold text-slate-900">{row.staff_name}</p><p className="text-xs text-slate-500">{row.staff_code} · {row.designation}</p></div> },
    ...dayColumns,
    { key: "present_days", header: "Present", width: "80px", className: "text-center", headerClassName: "justify-center text-center" },
  ], [dayColumns]);

  usePageHeader({ title: "Staff Attendance Report", description: "Review month-wise staff attendance and work hours." });

  const exportExcel = async () => {
    if (!associationId || !month) return;
    try {
      setIsExporting(true);
      const response = await apiClient.get("/staff/reports/monthly/export", { params: query, responseType: "blob" });
      const url = URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = `staff_attendance_${month}.xlsx`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      toast.error(formatApiErrorDetail(error));
    } finally {
      setIsExporting(false);
    }
  };

  if (!permissionLoading && !canView) return <AccessRestricted moduleName="Staff Attendance Report" showAction />;

  return <div className="space-y-5">
    <div className="flex flex-wrap items-end gap-3">
      <FormField label="Month" className="w-44"><MonthPicker value={month} onChange={(value) => setMonth(value || currentMonth())} /></FormField>
      <FormField label="Work Type" className="w-48"><Select value={designation} onValueChange={setDesignation} options={[{ value: "", label: "All work types" }, ...STAFF_WORK_TYPES.map((item) => ({ value: item, label: item }))]} /></FormField>
      <FormField label="Staff Member" className="w-52"><Select value={staffId} onValueChange={setStaffId} options={[{ value: "", label: "All staff" }, ...staff.filter((item) => item.association_id === associationId).map((item) => ({ value: item.id, label: `${item.first_name} ${item.last_name}` }))]} /></FormField>
      <Button variant="outline" onClick={exportExcel} disabled={!report || isExporting} className="mb-0.5"><Download size={15} className="mr-1.5" />{isExporting ? "Exporting..." : "Export Excel"}</Button>
    </div>
    {report ? <DataTable data={report.rows} columns={columns} density="compact" isLoading={isLoading} enableGlobalFilter={false} enableSorting searchKeys={["staff_name", "staff_code", "designation"]} pagination={{ isServer: false, pageSize: 15, pageSizeOptions: [15, 25, 50] }} emptyTitle="No staff found" emptyMessage="No staff members match the selected report filters." /> : <div className="rounded-xl border border-dashed border-slate-200 bg-white p-12 text-center text-sm text-slate-500">Select an association to view its monthly attendance report.</div>}
  </div>;
}
