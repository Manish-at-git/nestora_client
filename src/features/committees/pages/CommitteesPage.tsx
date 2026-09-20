import React, { useState } from "react";
import { usePageHeader } from "@/hooks/usePageHeader";
import { usePermission } from "@/hooks/usePermission";
import { useAuth } from "@/context/AuthContext";
import { AccessRestricted } from "@/components/common";
import { useAppSelector } from "@/app/hooks";
import { useGetAdminAssociationsQuery } from "@/services/api/associationsApi";
import { ASSOCIATION_DIRECTORY_ROLE_CODES } from "@/constants/roleCodes";
import { useGetCommitteesQuery } from "../api/committeesApi";
import {
  CommitteeTable,
  CommitteeFormModal,
  ViewCommitteeModal,
} from "../components";
import type { Committee } from "../types";

export const CommitteesPage: React.FC = () => {
  const { account } = useAuth();
  const { canView, canUpdate, isLoading: isPermLoading } = usePermission("committees");
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedToEdit, setSelectedToEdit] = useState<Committee | null>(null);
  const [viewingCommittee, setViewingCommittee] = useState<Committee | null>(null);

  const globalActiveAssocId = useAppSelector(
    (state) => state.ui.activeAssociationId
  );
  const canLoadAdminAssociations = ASSOCIATION_DIRECTORY_ROLE_CODES.includes(
    account?.role_code as (typeof ASSOCIATION_DIRECTORY_ROLE_CODES)[number],
  );

  usePageHeader({
    title: "Committees",
    description: "Manage association committees, committee charters, terms, and member groups.",
  });

  const { data: adminAssociations = [] } = useGetAdminAssociationsQuery(undefined, {
    skip: !canLoadAdminAssociations,
  });

  const effectiveAssocId =
    globalActiveAssocId && globalActiveAssocId !== "ALL"
      ? globalActiveAssocId
      : undefined;

  const {
    data: committees = [],
    isLoading,
    refetch,
  } = useGetCommitteesQuery(
    effectiveAssocId ? { assoc_id: effectiveAssocId } : undefined,
    {
      skip: !canView,
    }
  );

  const handleOpenAdd = () => {
    setSelectedToEdit(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (committee: Committee) => {
    setSelectedToEdit(committee);
    setModalOpen(true);
  };

  const handleOpenView = (committee: Committee) => {
    setViewingCommittee(committee);
  };

  if (!isPermLoading && !canView) {
    return <AccessRestricted moduleName="Committees" showAction />;
  }

  return (
    <div className="space-y-6">
      <CommitteeTable
        committees={committees}
        isLoading={isLoading}
        onAdd={handleOpenAdd}
        onEdit={handleOpenEdit}
        onView={handleOpenView}
        onDeleted={() => refetch()}
      />

      {/* Add / Edit Committee Modal */}
      <CommitteeFormModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        committeeToEdit={selectedToEdit}
        onSuccess={() => refetch()}
        adminAssociations={adminAssociations}
      />

      {/* View Committee Overview Modal */}
      <ViewCommitteeModal
        isOpen={Boolean(viewingCommittee)}
        onClose={() => setViewingCommittee(null)}
        committee={viewingCommittee}
        onEdit={handleOpenEdit}
        canEdit={canUpdate}
      />
    </div>
  );
};

export default CommitteesPage;
