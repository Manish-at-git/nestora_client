import React, { useState } from "react";
import { useAppSelector } from "@/app/hooks";
import { AccessRestricted, LoadingSpinner } from "@/components/common";
import { useAuth } from "@/context/AuthContext";
import { usePageHeader } from "@/hooks/usePageHeader";
import { usePermission } from "@/hooks/usePermission";
import { ROLE_CODE } from "@/constants/roleCodes";
import { useGetAdminAssociationsQuery } from "@/services/api/associationsApi";
import { useGetUnitDocumentsQuery } from "../api";
import {
  UnitDocumentFormModal,
  UnitDocumentTable,
} from "../components";
import type { UnitDocumentRecord } from "../types";

export const UnitDocumentsPage: React.FC = () => {
  const { account } = useAuth();
  const activeAssociationId = useAppSelector(
    (state) => state.ui.activeAssociationId,
  );
  const {
    canView,
    isLoading: isPermissionLoading,
  } = usePermission();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [documentToEdit, setDocumentToEdit] =
    useState<UnitDocumentRecord | null>(null);
  const [documentToView, setDocumentToView] =
    useState<UnitDocumentRecord | null>(null);

  usePageHeader({
    title: "Unit Documents",
    description: "Manage title deeds, insurance records, plans, and unit-specific files.",
  });

  const userIsAssociationManager =
    account?.role_code === ROLE_CODE.ADMIN || account?.role_code === ROLE_CODE.SUPER_ADMIN;
  const canManageAssociationDocuments = userIsAssociationManager;
  const canCreateUnitDocument = [
    ROLE_CODE.ADMIN,
    ROLE_CODE.SUPER_ADMIN,
    ROLE_CODE.BOARD_MEMBER,
    ROLE_CODE.COMMITTEE_MEMBER,
    ROLE_CODE.HOMEOWNER,
  ].includes(account?.role_code as string);
  const { data: associations = [] } = useGetAdminAssociationsQuery(undefined, {
    skip: !canManageAssociationDocuments,
  });
  const selectedAssociationId = activeAssociationId
    ? String(activeAssociationId) === "ALL"
      ? undefined
      : String(activeAssociationId)
    : account?.association_id
      ? String(account.association_id)
      : canManageAssociationDocuments && associations.length > 0
        ? String(associations[0].id)
      : undefined;

  const {
    data: documents = [],
    isLoading,
    refetch,
  } = useGetUnitDocumentsQuery(
    selectedAssociationId
      ? { associationId: selectedAssociationId }
      : undefined,
    { skip: !canView },
  );

  const openCreateModal = () => {
    setDocumentToEdit(null);
    setIsModalOpen(true);
  };

  const openEditModal = (document: UnitDocumentRecord) => {
    setDocumentToEdit(document);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setDocumentToEdit(null);
  };

  const closeViewModal = () => {
    setDocumentToView(null);
  };

  if (isPermissionLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!canView) {
    return <AccessRestricted moduleName="Unit Documents" showAction />;
  }

  return (
    <div className="space-y-6">
      <UnitDocumentTable
        documents={documents}
        isAdmin={canManageAssociationDocuments}
        isLoading={isLoading}
        onAdd={openCreateModal}
        onView={setDocumentToView}
        onEdit={openEditModal}
        onDeleted={refetch}
      />

      {canCreateUnitDocument || documentToEdit ? (
        <UnitDocumentFormModal
          isOpen={isModalOpen}
          onClose={closeModal}
          onSuccess={refetch}
          documentToEdit={documentToEdit}
          associations={associations}
          selectedAssociationId={selectedAssociationId}
          isAdmin={canManageAssociationDocuments}
        />
      ) : null}

      <UnitDocumentFormModal
        isOpen={Boolean(documentToView)}
        onClose={closeViewModal}
        documentToEdit={documentToView}
        associations={associations}
        selectedAssociationId={selectedAssociationId}
        isAdmin={canManageAssociationDocuments}
        mode="view"
      />
    </div>
  );
};

export default UnitDocumentsPage;
