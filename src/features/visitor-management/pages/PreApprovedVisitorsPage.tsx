import React, { useState } from "react";
import { AccessRestricted, LoadingSpinner } from "@/components/common";
import { useAuth } from "@/context/AuthContext";
import { usePageHeader } from "@/hooks/usePageHeader";
import { usePermission } from "@/hooks/usePermission";
import { isVisitorOperationsRole } from "@/constants/roleCodes";
import { useGetPreApprovedVisitorsQuery } from "../api";
import {
  PreApprovedVisitorFormModal,
  PreApprovedVisitorTable,
  VisitorPassModal,
} from "../components";
import { VisitorOperationsPage } from "./VisitorOperationsPage";
import type { PreApprovedVisitor } from "../types";

export const PreApprovedVisitorsPage: React.FC = () => {
  const { account } = useAuth();
  const { canView, canCreate, canDelete, isLoading: isPermissionLoading } =
    usePermission("pre_approved_visitors");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [activePass, setActivePass] = useState<PreApprovedVisitor | null>(null);

  usePageHeader({
    title: "Visitor Management",
    description: "Create and manage visitor passes in advance for quick entry.",
  });

  const isSecurityUser = isVisitorOperationsRole(account?.role_code);
  const { data, isLoading } = useGetPreApprovedVisitorsQuery(undefined, {
    skip: !canView || isSecurityUser,
  });

  if (isPermissionLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (isSecurityUser) {
    return <VisitorOperationsPage mode="checkin" />;
  }

  if (!canView) {
    return <AccessRestricted moduleName="Pre-Approved Visitors" showAction />;
  }

  return (
    <div className="space-y-6">
      <PreApprovedVisitorTable
        visitors={data?.visitors || []}
        isLoading={isLoading}
        canCreate={canCreate}
        canDelete={canDelete}
        onAdd={() => setIsCreateOpen(true)}
        onView={setActivePass}
      />

      <PreApprovedVisitorFormModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={setActivePass}
      />

      <VisitorPassModal visitor={activePass} onClose={() => setActivePass(null)} />
    </div>
  );
};

export default PreApprovedVisitorsPage;
