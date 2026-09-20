import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { LoginPage } from "@/features/auth";

export const RoleRedirect: React.FC = () => {
  const { account, checking } = useAuth();

  if (checking) return null;
  if (!account) return <LoginPage />;

  return <Navigate to="/dashboard" replace />;
};

export default RoleRedirect;
