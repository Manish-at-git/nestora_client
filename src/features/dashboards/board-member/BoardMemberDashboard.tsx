import React from "react";
import { DashboardOverview } from "../DashboardOverview";

export const BoardMemberDashboard: React.FC = () => {
  return <DashboardOverview isTenant={false} />;
};

export default BoardMemberDashboard;
