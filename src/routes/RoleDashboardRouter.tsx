import React from "react";
import { useAuth } from "@/context/AuthContext";
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

  switch (account?.role?.toLowerCase()) {
    case "super admin":
      return <SuperAdminOverview />;
    case "admin":
      return <AdminDashboard />;
    case "accountant":
      return <AccountantDashboard />;
    case "security":
      return <SecurityDashboard />;
    case "tenant":
      return <TenantDashboard />;
    case "board member":
      return <BoardMemberDashboard />;
    case "committee member":
      return <CommitteeMemberDashboard />;
    case "homeowner":
      return <HomeownerDashboard />;
    case "member":
      return <MemberDashboard />;
    default:
      return <DashboardOverview />;
  }
};

export default RoleDashboardRouter;
