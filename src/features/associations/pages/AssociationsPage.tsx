import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { usePageHeader } from "@/hooks/usePageHeader";
import { usePermission } from "@/hooks/usePermission";
import { AccessRestricted } from "@/components/common";
import {
  AssociationTable,
  OnboardAssociationModal,
  ViewAssociationModal,
} from "../components";
import { useGetAssociationsQuery } from "../api/associationsApi";
import type { Association } from "../types";

export const AssociationsPage: React.FC = () => {
  const { canView, isLoading: isPermLoading } = usePermission();
  const [searchParams, setSearchParams] = useSearchParams();

  usePageHeader({
    title: "Associations Directory",
    description:
      "Super admin master association management, provisioning, and subscription tier allocation.",
  });

  const {
    data: associations = [],
    isLoading,
    refetch,
  } = useGetAssociationsQuery(undefined, {
    skip: !canView,
  });

  const [isOnboardModalOpen, setIsOnboardModalOpen] = useState(false);
  const [selectedAssociation, setSelectedAssociation] = useState<Association | null>(null);

  const isCreateRouteOpen = searchParams.get("create") === "1" && canView;

  const clearCreateParameter = () => {
    if (searchParams.get("create") !== "1") return;

    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("create");
    setSearchParams(nextParams, { replace: true });
  };

  const handleOpenOnboard = () => {
    setIsOnboardModalOpen(true);
  };

  const handleViewAssociation = (assoc: Association) => {
    setSelectedAssociation(assoc);
  };

  const handleCloseOnboard = () => {
    setIsOnboardModalOpen(false);
    clearCreateParameter();
  };

  const handleCloseView = () => {
    setSelectedAssociation(null);
  };

  if (!isPermLoading && !canView) {
    return <AccessRestricted moduleName="Associations Directory" showAction />;
  }

  return (
    <div className="space-y-6">
      {/* Association Data Table */}
      <AssociationTable
        associations={associations}
        isLoading={isLoading}
        onAdd={handleOpenOnboard}
        onView={handleViewAssociation}
      />

      {/* Onboard Association Modal - Unconditionally mounted for smooth exit animation */}
      <OnboardAssociationModal
        isOpen={isOnboardModalOpen || isCreateRouteOpen}
        onClose={handleCloseOnboard}
        onSuccess={() => refetch()}
      />

      {/* View Association Modal - Unconditionally mounted for smooth exit animation */}
      <ViewAssociationModal
        association={selectedAssociation}
        isOpen={Boolean(selectedAssociation)}
        onClose={handleCloseView}
        onSuccess={() => refetch()}
      />
    </div>
  );
};

export default AssociationsPage;
