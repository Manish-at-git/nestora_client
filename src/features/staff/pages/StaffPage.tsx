import { useState } from "react";
import { ScanLine } from "lucide-react";
import { usePageHeader } from "@/hooks/usePageHeader";
import { usePermission } from "@/hooks/usePermission";
import { AccessRestricted } from "@/components/common";
import { FEATURES } from "@/constants/featureCodes";
import { ROLE_CODE } from "@/constants/roleCodes";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetStaffAttendanceQuery, useGetStaffQuery } from "../api";
import { StaffAttendanceTable, StaffFormModal, StaffPassModal, StaffPastAttendanceModal, StaffScannerModal, StaffTable } from "../components";
import type { StaffMember } from "../types";

export function StaffPage() {
  const { account } = useAuth();
  const featureCode = account?.role_code === ROLE_CODE.SECURITY
    ? FEATURES.STAFF_ENTRY.FEATURE_CODE
    : FEATURES.STAFF.FEATURE_CODE;
  const { canCreate, canUpdate, canView, isLoading: isPermissionLoading } = usePermission(featureCode);
  const { data: staff = [], isLoading: staffLoading } = useGetStaffQuery(undefined, { skip: !canView });
  const { data: attendance = [], isLoading: attendanceLoading } = useGetStaffAttendanceQuery(undefined, { skip: !canView });
  const [formStaff, setFormStaff] = useState<StaffMember | null | undefined>(undefined);
  const [passStaff, setPassStaff] = useState<StaffMember | null>(null);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [pastAttendanceOpen, setPastAttendanceOpen] = useState(false);
  const canAddPastAttendance = account?.role_code === ROLE_CODE.SUPER_ADMIN || account?.role_code === ROLE_CODE.ADMIN;

  usePageHeader({ title: "Staff", description: "Manage daily association workers, their permanent QR passes, and attendance." });

  if (!isPermissionLoading && !canView) return <AccessRestricted moduleName="Staff" showAction />;

  return <div className="space-y-5">
    <Tabs defaultValue="directory">
      <TabsList><TabsTrigger value="directory">Staff Directory</TabsTrigger><TabsTrigger value="attendance">Attendance History</TabsTrigger></TabsList>
      <TabsContent value="directory"><StaffTable staff={staff} isLoading={staffLoading} canManage={canCreate} canScan={canUpdate} onAdd={() => setFormStaff(null)} onEdit={setFormStaff} onPass={setPassStaff} onScan={() => setScannerOpen(true)} /></TabsContent>
      <TabsContent value="attendance"><StaffAttendanceTable attendance={attendance} isLoading={attendanceLoading} canAddPastAttendance={canAddPastAttendance} onAddPastAttendance={() => setPastAttendanceOpen(true)} /></TabsContent>
    </Tabs>
    <StaffFormModal isOpen={formStaff !== undefined} staff={formStaff || null} onClose={() => setFormStaff(undefined)} />
    <StaffPassModal staff={passStaff} onClose={() => setPassStaff(null)} />
    <StaffScannerModal isOpen={scannerOpen} onClose={() => setScannerOpen(false)} />
    <StaffPastAttendanceModal isOpen={pastAttendanceOpen} staff={staff} onClose={() => setPastAttendanceOpen(false)} />
  </div>;
}
