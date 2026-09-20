import React from "react";
import { DashboardOverview } from "../DashboardOverview";

export const MemberDashboard: React.FC = () => {
  return <DashboardOverview isTenant={false} />;
};

export default MemberDashboard;
