import React from "react";
import { useAuth } from "@/context/AuthContext";
import { ROLE_CODE } from "@/constants/roleCodes";
import {
  AccountantDashboard,
  AdminDashboard,
  BoardMemberDashboard,
  CommitteeMemberDashboard,
  DashboardOverview,
  HomeownerDashboard,
  MemberDashboard,
  SecurityDashboard,
  SuperAdminOverview,
  TenantDashboard,
} from "@/features/dashboards";

/**
 * The application has one canonical dashboard URL. The authenticated role
 * determines which dashboard experience is rendered at /dashboard.
 */
export const RoleDashboardRouter: React.FC = () => {
  const { account } = useAuth();

  switch (account?.role_code?.toLowerCase()) {
    case ROLE_CODE.SUPER_ADMIN:
      return <SuperAdminOverview />;
    case ROLE_CODE.ADMIN:
      return <AdminDashboard />;
    case ROLE_CODE.ACCOUNTANT:
      return <AccountantDashboard />;
    case ROLE_CODE.SECURITY:
      return <SecurityDashboard />;
    case ROLE_CODE.TENANT:
      return <TenantDashboard />;
    case ROLE_CODE.BOARD_MEMBER:
      return <BoardMemberDashboard />;
    case ROLE_CODE.COMMITTEE_MEMBER:
      return <CommitteeMemberDashboard />;
    case ROLE_CODE.HOMEOWNER:
      return <HomeownerDashboard />;
    case ROLE_CODE.CSR:
      return <MemberDashboard />;
    default:
      return <DashboardOverview />;
  }
};

export default RoleDashboardRouter;
