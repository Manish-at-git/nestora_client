import React, { useState } from "react";
import { Shield, KeyRound, CheckCircle2, Sliders } from "lucide-react";
import { usePageHeader } from "@/hooks/usePageHeader";
import { usePermission } from "@/hooks/usePermission";
import { AccessRestricted } from "@/components/common";
import { useGetRolesPermissionsSummaryQuery } from "../api/permissionsApi";
import { PermissionTable, RolePermissionMatrixModal } from "../components";
import type { RolePermissionSummary } from "../types";

export const PermissionsPage: React.FC = () => {
  const { canView, isLoading: isPermLoading } = usePermission();
  const [selectedRoleForMatrix, setSelectedRoleForMatrix] =
    useState<RolePermissionSummary | null>(null);
  const [isMatrixOpen, setMatrixOpen] = useState(false);
  const [isMatrixReadOnly, setIsMatrixReadOnly] = useState(false);

  usePageHeader({
    title: "Permissions",
    description:
      "Configure granular access rules, CRUD privileges, and module authorizations for system roles.",
  });

  const {
    data: roles = [],
    isLoading,
    refetch,
  } = useGetRolesPermissionsSummaryQuery(undefined, {
    skip: !canView,
  });

  const handleOpenMatrix = (role: RolePermissionSummary, readOnly = false) => {
    setSelectedRoleForMatrix(role);
    setIsMatrixReadOnly(readOnly);
    setMatrixOpen(true);
  };

  if (!isPermLoading && !canView) {
    return <AccessRestricted moduleName="Role Permissions Matrix" showAction />;
  }

  return (
    <div className="space-y-6">
      {/* Role Permissions Summary Table */}
      <PermissionTable
        roles={roles}
        isLoading={isLoading}
        onOpenMatrix={handleOpenMatrix}
      />

      {/* Bulk Granular Matrix Modal */}
      <RolePermissionMatrixModal
        isOpen={isMatrixOpen}
        onClose={() => {
          setMatrixOpen(false);
          setSelectedRoleForMatrix(null);
          setIsMatrixReadOnly(false);
        }}
        role={selectedRoleForMatrix}
        readOnly={isMatrixReadOnly}
        onSuccess={() => refetch()}
      />
    </div>
  );
};

export default PermissionsPage;

