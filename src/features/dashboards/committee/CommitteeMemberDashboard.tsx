import React from "react";
import { DashboardOverview } from "../DashboardOverview";

export const CommitteeMemberDashboard: React.FC = () => {
  return <DashboardOverview isTenant={false} />;
};

export default CommitteeMemberDashboard;
