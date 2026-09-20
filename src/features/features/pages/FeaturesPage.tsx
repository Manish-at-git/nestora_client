import React, { useState } from "react";
import { usePageHeader } from "@/hooks/usePageHeader";
import { usePermission } from "@/hooks/usePermission";
import { AccessRestricted } from "@/components/common";
import { useGetFeaturesQuery } from "../api/featuresApi";
import { FeatureTable, FeatureFormModal } from "../components";
import type { Feature } from "../types";

export const FeaturesPage: React.FC = () => {
  const { canView, isLoading: isPermLoading } = usePermission();
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedToEdit, setSelectedToEdit] = useState<Feature | null>(null);

  usePageHeader({
    title: "Features",
    description:
      "Configure platform feature modules, hierarchy, icons, and dynamic routing permissions.",
  });

  const { data: features = [], isLoading, refetch } = useGetFeaturesQuery(undefined, {
    skip: !canView,
  });

  const handleOpenAdd = () => {
    setSelectedToEdit(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (feature: Feature) => {
    setSelectedToEdit(feature);
    setModalOpen(true);
  };

  if (!isPermLoading && !canView) {
    return <AccessRestricted moduleName="Features Management" showAction />;
  }

  return (
    <div className="space-y-6">
      <FeatureTable
        features={features}
        isLoading={isLoading}
        onAdd={handleOpenAdd}
        onEdit={handleOpenEdit}
        onDeleted={() => refetch()}
      />

      {/* Add / Edit Form Modal */}
      <FeatureFormModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        featureToEdit={selectedToEdit}
        onSuccess={() => refetch()}
      />
    </div>
  );
};

export default FeaturesPage;
