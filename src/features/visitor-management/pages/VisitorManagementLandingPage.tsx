import React from "react";
import { Navigate } from "react-router-dom";
import { AccessRestricted } from "@/components/common";
import { FEATURES } from "@/constants/featureCodes";
import { isResidentVisitorRole, isVisitorOperationsRole } from "@/constants/roleCodes";
import { useAuth } from "@/context/AuthContext";

export const VisitorManagementLandingPage: React.FC = () => {
  const { account } = useAuth();
  if (isVisitorOperationsRole(account?.role_code)) {
    return <Navigate to={FEATURES.GATE_CONSOLE.FEATURE_PATH} replace />;
  }
  if (isResidentVisitorRole(account?.role_code)) {
    return <Navigate to={FEATURES.PRE_APPROVED_VISITORS.FEATURE_PATH} replace />;
  }
  return <AccessRestricted moduleName="Visitor Management" showAction />;
};

export default VisitorManagementLandingPage;
