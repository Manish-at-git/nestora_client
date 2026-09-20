import React, { useState } from "react";
import { usePageHeader } from "@/hooks/usePageHeader";
import { usePermission } from "@/hooks/usePermission";
import { AccessRestricted } from "@/components/common";
import {
  SubscriptionPlanTable,
  SubscriptionPlanFormModal,
} from "../components";
import { useGetSubscriptionPlansQuery } from "../api/subscriptionsApi";
import type { SubscriptionPlan } from "../types";

export const SubscriptionsPage: React.FC = () => {
  const { canView, isLoading: isPermLoading } = usePermission();
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedToEdit, setSelectedToEdit] = useState<SubscriptionPlan | null>(null);

  usePageHeader({
    title: "Subscription Plans",
    description:
      "Configure multi-currency subscription tiers, billing intervals, trial periods, and feature quotas.",
  });

  const {
    data: plans = [],
    isLoading,
    refetch,
  } = useGetSubscriptionPlansQuery(undefined, {
    skip: !canView,
  });

  const handleOpenAdd = () => {
    setSelectedToEdit(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (plan: SubscriptionPlan) => {
    setSelectedToEdit(plan);
    setModalOpen(true);
  };

  if (!isPermLoading && !canView) {
    return <AccessRestricted moduleName="Subscription Plans" showAction />;
  }

  return (
    <div className="space-y-6">
      <SubscriptionPlanTable
        plans={plans}
        isLoading={isLoading}
        onAdd={handleOpenAdd}
        onEdit={handleOpenEdit}
        onDeleted={() => refetch()}
      />

      {/* Add / Edit Form Modal */}
      <SubscriptionPlanFormModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        planToEdit={selectedToEdit}
        onSuccess={() => refetch()}
      />
    </div>
  );
};

export default SubscriptionsPage;
