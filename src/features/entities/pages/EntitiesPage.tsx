import React, { useState } from "react";
import { usePageHeader } from "@/hooks/usePageHeader";
import { usePermission } from "@/hooks/usePermission";
import { AccessRestricted } from "@/components/common";
import { useGetEntitiesQuery } from "../api/entitiesApi";
import { EntityTable, EntityFormModal } from "../components";
import type { Entity } from "../types";

export const EntitiesPage: React.FC = () => {
  const { canView, isLoading: isPermLoading } = usePermission();
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedToEdit, setSelectedToEdit] = useState<Entity | null>(null);

  usePageHeader({
    title: "Entities",
    description:
      "Configure master property management companies, community bodies, and holding entities.",
  });

  const {
    data: entities = [],
    isLoading,
    refetch,
  } = useGetEntitiesQuery(undefined, {
    skip: !canView,
  });

  const handleOpenAdd = () => {
    setSelectedToEdit(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (entity: Entity) => {
    setSelectedToEdit(entity);
    setModalOpen(true);
  };

  if (!isPermLoading && !canView) {
    return <AccessRestricted moduleName="Entities" showAction />;
  }

  return (
    <div className="space-y-6">
      <EntityTable
        entities={entities}
        isLoading={isLoading}
        onAdd={handleOpenAdd}
        onEdit={handleOpenEdit}
        onDeleted={() => refetch()}
      />

      {/* Add / Edit Form Modal */}
      <EntityFormModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        entityToEdit={selectedToEdit}
        onSuccess={() => refetch()}
      />
    </div>
  );
};

export default EntitiesPage;
