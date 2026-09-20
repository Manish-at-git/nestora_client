import React from "react";
import { DashboardOverview } from "../DashboardOverview";

export const TenantDashboard: React.FC = () => {
  return <DashboardOverview isTenant={true} />;
};

export default TenantDashboard;
