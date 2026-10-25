import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { usePageHeader } from "@/hooks/usePageHeader";
import { usePermission } from "@/hooks/usePermission";
import { AccessRestricted } from "@/components/common";
import { useGetUsersQuery } from "../api/usersApi";
import { UserTable, UserFormModal, ViewUserModal } from "../components";
import type { SystemUser } from "../types";

export const UsersPage: React.FC = () => {
  const { canView, isLoading: isPermLoading } = usePermission();
  const [searchParams, setSearchParams] = useSearchParams();

  usePageHeader({
    title: "Users",
    description:
      "Manage system residents, administrators, unit allocations, and activation credentials.",
  });

  const { data: users = [], isLoading, refetch } = useGetUsersQuery(undefined, {
    skip: !canView,
  });

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<SystemUser | null>(null);
  const [userToView, setUserToView] = useState<SystemUser | null>(null);

  const isCreateRouteOpen = searchParams.get("create") === "1" && canView;

  const clearCreateParameter = () => {
    if (searchParams.get("create") !== "1") return;

    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("create");
    setSearchParams(nextParams, { replace: true });
  };

  const handleOpenCreate = () => {
    setUserToEdit(null);
    setIsFormModalOpen(true);
  };

  const handleEdit = (user: SystemUser) => {
    setUserToEdit(user);
    setIsFormModalOpen(true);
  };

  const handleView = (user: SystemUser) => {
    setUserToView(user);
  };

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
    clearCreateParameter();
  };

  const handleCloseViewModal = () => {
    setUserToView(null);
  };

  if (!isPermLoading && !canView) {
    return <AccessRestricted moduleName="Users Directory" showAction />;
  }

  return (
    <div className="space-y-6">
      <UserTable
        users={users}
        isLoading={isLoading}
        onAdd={handleOpenCreate}
        onView={handleView}
        onEdit={handleEdit}
      />

      {/* Form Modal */}
      <UserFormModal
        isOpen={isFormModalOpen || isCreateRouteOpen}
        onClose={handleCloseFormModal}
        userToEdit={userToEdit}
        onSuccess={() => refetch()}
      />

      {/* View Modal */}
      <ViewUserModal
        isOpen={Boolean(userToView)}
        onClose={handleCloseViewModal}
        user={userToView}
        onEdit={handleEdit}
      />
    </div>
  );
};

export default UsersPage;
