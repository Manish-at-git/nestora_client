import React, { useState } from "react";
import { usePageHeader } from "@/hooks/usePageHeader";
import { usePermission } from "@/hooks/usePermission";
import { AccessRestricted } from "@/components/common";
import { useGetRolesQuery } from "../api/rolesApi";
import { RoleTable, RoleFormModal } from "../components";
import type { Role } from "../types";

export const RolesPage: React.FC = () => {
  const { canView, isLoading: isPermLoading } = usePermission();
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedToEdit, setSelectedToEdit] = useState<Role | null>(null);

  usePageHeader({
    title: "Roles",
    description:
      "Configure system access roles, define operational responsibilities, and control permissions.",
  });

  const { data: roles = [], isLoading, refetch } = useGetRolesQuery(undefined, {
    skip: !canView,
  });

  const handleOpenAdd = () => {
    setSelectedToEdit(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (role: Role) => {
    setSelectedToEdit(role);
    setModalOpen(true);
  };

  if (!isPermLoading && !canView) {
    return <AccessRestricted moduleName="Roles & Permissions" showAction />;
  }

  return (
    <div className="space-y-6">
      <RoleTable
        roles={roles}
        isLoading={isLoading}
        onAdd={handleOpenAdd}
        onEdit={handleOpenEdit}
        onDeleted={() => refetch()}
      />

      {/* Add / Edit Form Modal */}
      <RoleFormModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        roleToEdit={selectedToEdit}
        onSuccess={() => refetch()}
      />
    </div>
  );
};

export default RolesPage;
