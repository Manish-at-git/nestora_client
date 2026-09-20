import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { ROLES_STRING } from "@/lib/staticData";

export interface PermissionResult {
  canCreate: boolean;
  canView: boolean;
  canUpdate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  isSuperAdmin: boolean;
  isLoading: boolean;
  role?: string;
}

/**
 * Custom React Hook for evaluating feature-level CRUD permissions for the active user.
 * 
 * @param featureCodeOrName - Optional feature identifier (e.g. "entity_types", "/entity-types", "Entity Types").
 *                            If omitted, it automatically resolves permissions from the current URL location (pathname).
 * @returns PermissionResult with flags for create, view, update, delete actions
 */
export const usePermission = (featureCodeOrName?: string): PermissionResult => {
  const { account, checking } = useAuth();
  const location = useLocation();

  return useMemo<PermissionResult>(() => {
    // While authenticating / loading session
    if (checking) {
      return {
        canCreate: false,
        canView: false,
        canUpdate: false,
        canEdit: false,
        canDelete: false,
        isSuperAdmin: false,
        isLoading: true,
        role: account?.role,
      };
    }

    // Unauthenticated
    if (!account) {
      return {
        canCreate: false,
        canView: false,
        canUpdate: false,
        canEdit: false,
        canDelete: false,
        isSuperAdmin: false,
        isLoading: false,
      };
    }

    const isSuperAdmin = account.role === ROLES_STRING.SUPER_ADMIN;

    // Target identifier: either passed explicitly, or derived from current route location
    const target = featureCodeOrName || location.pathname;

    if (!target) {
      return {
        canCreate: false,
        canView: true,
        canUpdate: false,
        canEdit: false,
        canDelete: false,
        isSuperAdmin,
        isLoading: false,
        role: account.role,
      };
    }

    const rawTarget = target.trim().toLowerCase();
    const cleanTarget = rawTarget.replace(/^\/+|\/+$/g, ""); // e.g. "entity-types" or "entity_types"
    const underscoredTarget = cleanTarget.replace(/[-\s]+/g, "_"); // e.g. "entity_types"
    const dashedTarget = cleanTarget.replace(/[_\s]+/g, "-"); // e.g. "entity-types"
    const spacedTarget = cleanTarget.replace(/[-_]+/g, " "); // e.g. "entity types"

    // Also get the last segment of the path (e.g. for /admin/entity-types -> entity-types)
    const segments = cleanTarget.split("/");
    const lastSegment = segments[segments.length - 1];
    const lastUnderscored = lastSegment ? lastSegment.replace(/[-\s]+/g, "_") : "";

    const matchesFeature = (p: any) => {
      if (!p) return false;

      // Match by URL
      if (p.url) {
        const cleanUrl = p.url.trim().toLowerCase().replace(/^\/+|\/+$/g, "");
        if (
          cleanUrl === cleanTarget ||
          cleanUrl === underscoredTarget ||
          cleanUrl === dashedTarget ||
          cleanUrl === lastSegment ||
          cleanUrl === lastUnderscored ||
          p.url.trim().toLowerCase() === rawTarget
        ) {
          return true;
        }
      }

      // Match by feature_code
      if (p.feature_code) {
        const cleanCode = p.feature_code.trim().toLowerCase().replace(/^\/+|\/+$/g, "");
        if (
          cleanCode === cleanTarget ||
          cleanCode === underscoredTarget ||
          cleanCode === dashedTarget ||
          cleanCode === lastSegment ||
          cleanCode === lastUnderscored
        ) {
          return true;
        }
      }

      // Match by feature_name
      if (p.feature_name) {
        const cleanName = p.feature_name.trim().toLowerCase();
        if (
          cleanName === cleanTarget ||
          cleanName === spacedTarget ||
          cleanName === underscoredTarget ||
          cleanName === dashedTarget
        ) {
          return true;
        }
      }

      return false;
    };

    const rolePerms = account.role_permissions;
    let matchedPerm: any = null;

    if (Array.isArray(rolePerms) && rolePerms.length > 0) {
      matchedPerm = rolePerms.find(matchesFeature);
    } else if (rolePerms && typeof rolePerms === "object" && Object.keys(rolePerms).length > 0) {
      matchedPerm =
        rolePerms[target] ||
        rolePerms[cleanTarget] ||
        rolePerms[underscoredTarget] ||
        rolePerms[dashedTarget];

      if (!matchedPerm) {
        matchedPerm = Object.values(rolePerms).find(matchesFeature);
      }
    }

    if (matchedPerm) {
      const canCreate = Boolean(matchedPerm.can_create);
      const canView = Boolean(matchedPerm.can_view);
      const canUpdate = Boolean(matchedPerm.can_update || matchedPerm.can_edit);
      const canDelete = Boolean(matchedPerm.can_delete);

      return {
        canCreate,
        canView,
        canUpdate,
        canEdit: canUpdate,
        canDelete,
        isSuperAdmin,
        isLoading: false,
        role: account.role,
      };
    }

    // If role_permissions is explicitly defined for this role but this feature was not found or has no permissions:
    if (Array.isArray(rolePerms) && rolePerms.length > 0) {
      return {
        canCreate: false,
        canView: false,
        canUpdate: false,
        canEdit: false,
        canDelete: false,
        isSuperAdmin,
        isLoading: false,
        role: account.role,
      };
    }

    // Check allowed_features fallback for basic view access
    const isAllowedInPlan =
      account.allowed_features?.some((f) => {
        const lf = f.toLowerCase();
        return (
          lf === cleanTarget ||
          lf === underscoredTarget ||
          lf === dashedTarget ||
          lf === spacedTarget
        );
      }) ?? false;

    return {
      canCreate: false,
      canView: isAllowedInPlan,
      canUpdate: false,
      canEdit: false,
      canDelete: false,
      isSuperAdmin,
      isLoading: false,
      role: account.role,
    };
  }, [account, checking, featureCodeOrName, location.pathname]);
};

export default usePermission;

