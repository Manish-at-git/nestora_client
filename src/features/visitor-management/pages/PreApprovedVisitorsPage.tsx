import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AccessRestricted, LoadingSpinner } from "@/components/common";
import { FEATURES } from "@/constants/featureCodes";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import { usePageHeader } from "@/hooks/usePageHeader";
import { usePermission } from "@/hooks/usePermission";
import { listenSocketMessage } from "@/services/realtime";
import { isVisitorOperationsRole } from "@/constants/roleCodes";
import { useGetPendingVisitorRequestsQuery, useGetPreApprovedVisitorsQuery } from "../api";
import {
  PreApprovedVisitorFormModal,
  PreApprovedVisitorTable,
  VisitorPassModal,
  PendingVisitorRequests,
} from "../components";
import { SecurityPreApprovedVisitorsPage } from "./SecurityPreApprovedVisitorsPage";
import type { PreApprovedVisitor } from "../types";

export const PreApprovedVisitorsPage: React.FC = () => {
  const { account } = useAuth();
  const { canView, canCreate, canDelete, isLoading: isPermissionLoading } =
    usePermission(FEATURES.PRE_APPROVED_VISITORS.FEATURE_CODE);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [activePass, setActivePass] = useState<PreApprovedVisitor | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") === "approvals" ? "approvals" : "preapproved";

  usePageHeader({
    title: "Pre-Approved Visitors",
    description: "Create and manage visitors in advance for quick entry.",
  });

  const isSecurityUser = isVisitorOperationsRole(account?.role_code);
  const { data, isLoading } = useGetPreApprovedVisitorsQuery(undefined, {
    skip: !canView || isSecurityUser,
  });
  const pendingRequestsQuery = useGetPendingVisitorRequestsQuery(undefined, {
    skip: !canView || isSecurityUser,
  });
  const pendingApprovalCount = pendingRequestsQuery.data?.requests.length || 0;

  const handleTabChange = (tab: string) => {
    const nextParams = new URLSearchParams(searchParams);
    if (tab === "approvals") {
      nextParams.set("tab", "approvals");
    } else {
      nextParams.delete("tab");
    }
    setSearchParams(nextParams, { replace: true });
  };

  useEffect(() => {
    if (!canView || isSecurityUser) return;

    return listenSocketMessage((event) => {
      const notification = event.notification as { type?: string } | undefined;
      if (event.type === "notification.created" && notification?.type === "visitor") {
        void pendingRequestsQuery.refetch();
      }
    });
  }, [canView, isSecurityUser, pendingRequestsQuery.refetch]);

  if (isPermissionLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (isSecurityUser) {
    return <SecurityPreApprovedVisitorsPage />;
  }

  if (!canView) {
    return <AccessRestricted moduleName="Pre-Approved Visitors" showAction />;
  }

  return (
    <div className="space-y-5">
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
        <div className="border-b border-slate-200 pb-3">
          <TabsList className="h-10 rounded-xl bg-slate-100 p-1">
            <TabsTrigger value="preapproved" className="rounded-lg px-4 py-1.5 text-xs font-semibold">
              Pre-Approved Visitors
            </TabsTrigger>
            <TabsTrigger value="approvals" className="rounded-lg px-4 py-1.5 text-xs font-semibold">
              Gate Approvals
              {pendingApprovalCount > 0 ? (
                <span className="ml-1.5 inline-flex min-w-4 items-center justify-center rounded-full bg-blue-600 px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
                  {pendingApprovalCount}
                </span>
              ) : null}
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="preapproved" className="mt-0 focus-visible:outline-none">
          <PreApprovedVisitorTable
            visitors={data?.visitors || []}
            isLoading={isLoading}
            canCreate={canCreate}
            canDelete={canDelete}
            onAdd={() => setIsCreateOpen(true)}
            onView={setActivePass}
          />
        </TabsContent>

        <TabsContent value="approvals" className="mt-0 focus-visible:outline-none">
          <PendingVisitorRequests showEmptyState />
        </TabsContent>
      </Tabs>

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
