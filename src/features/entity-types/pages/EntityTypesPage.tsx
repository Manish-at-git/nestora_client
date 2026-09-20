import React, { useState } from "react";
import { usePageHeader } from "@/hooks/usePageHeader";
import { usePermission } from "@/hooks/usePermission";
import { AccessRestricted } from "@/components/common";
import { useGetEntityTypesQuery } from "../api/entityTypesApi";
import { EntityTypeTable, EntityTypeFormModal } from "../components";
import type { EntityType } from "../types";

export const EntityTypesPage: React.FC = () => {
  const { canView, isLoading: isPermLoading } = usePermission();
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedToEdit, setSelectedToEdit] = useState<EntityType | null>(null);

  usePageHeader({
    title: "Entity Types",
    description: "Define classification schema for communities, societies, and condominiums.",
  });

  const { data: entityTypes = [], isLoading, refetch } = useGetEntityTypesQuery(undefined, {
    skip: !canView,
  });

  const handleOpenAdd = () => {
    setSelectedToEdit(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (entityType: EntityType) => {
    setSelectedToEdit(entityType);
    setModalOpen(true);
  };

  if (!isPermLoading && !canView) {
    return <AccessRestricted moduleName="Entity Types" showAction />;
  }

  return (
    <div className="space-y-6">
      <EntityTypeTable
        entityTypes={entityTypes}
        isLoading={isLoading}
        onAdd={handleOpenAdd}
        onEdit={handleOpenEdit}
        onDeleted={() => refetch()}
      />

      {/* Add / Edit Form Modal */}
      <EntityTypeFormModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        entityTypeToEdit={selectedToEdit}
        onSuccess={() => refetch()}
      />
    </div>
  );
};

export default EntityTypesPage;

