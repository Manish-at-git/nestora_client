import React from "react";
import { DashboardOverview } from "../DashboardOverview";

export const HomeownerDashboard: React.FC = () => {
  return <DashboardOverview isTenant={false} />;
};

export default HomeownerDashboard;
