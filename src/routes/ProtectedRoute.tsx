import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { checkFeatureAccess } from "@/config/navigation";
import type { UserRole } from "@/types/auth";

export interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: (UserRole | string)[];
  featureKey?: string;
  requiredFeature?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  featureKey,
  requiredFeature,
}) => {
  const { account, checking } = useAuth();

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <LoadingSpinner size="md" text="Loading..." />
      </div>
    );
  }

  if (!account) {
    return <Navigate to="/signin" replace />;
  }

  // Check role-based route guard
  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = account.role_code?.toLowerCase();
    const roleMatch = allowedRoles.some(
      (role) => role.toLowerCase() === userRole
    );

    if (!roleMatch) {
      return <Navigate to="/" replace />;
    }
  }

  // Check dynamic feature permission route guard
  const targetFeature = featureKey || requiredFeature;
  if (targetFeature) {
    const hasAccess = checkFeatureAccess(targetFeature, account);
    if (!hasAccess) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
