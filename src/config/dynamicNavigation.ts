import type { NavItem } from "@/types/navigation";
import type { Account, RolePermission } from "@/types/auth";
import { ROLE_CODE } from "@/constants/roleCodes";

/**
 * Access Control Evaluator
 * Checks whether the user has permission to view a given feature based on:
 * 1. Super Admin / Admin role bypass
 * 2. `account.role_permissions` map
 * 3. `account.allowed_features` subscription plan
 * 4. Association allowed features override
 */
export const checkFeatureAccess = (
  featureIdentifier: string,
  account: Account | null,
  associationAllowedFeatures?: string[]
): boolean => {
  if (!account) return false;

  // Overview / Dashboard is always accessible
  const normalized = featureIdentifier.trim().toLowerCase();
  if (
    normalized === "overview" ||
    normalized === "dashboard" ||
    featureIdentifier === "Overview" ||
    featureIdentifier === "Dashboard"
  ) {
    return true;
  }

  // Super admin has global unrestricted access
  if (account.role_code === ROLE_CODE.SUPER_ADMIN) {
    return true;
  }

  // Association-level feature overrides
  if (associationAllowedFeatures !== undefined) {
    if (
      !associationAllowedFeatures.includes(featureIdentifier) &&
      !associationAllowedFeatures.some((f) => f.toLowerCase() === normalized)
    ) {
      return false;
    }
  }

  // Check fine-grained role_permissions (Array or Object)
  if (account.role_permissions) {
    if (Array.isArray(account.role_permissions)) {
      if (account.role_permissions.length > 0) {
        const found = account.role_permissions.find(
          (p) =>
            (p.feature_code && p.feature_code.toLowerCase() === normalized) ||
            (p.feature_name && p.feature_name.toLowerCase() === normalized) ||
            (p.url && p.url.toLowerCase() === normalized)
        );
        if (found) {
          return Boolean(found.can_view);
        }
        return false;
      }
    } else if (typeof account.role_permissions === "object" && Object.keys(account.role_permissions).length > 0) {
      // 1. Direct key match (e.g. "Amenities", "amenities", "/amenities")
      if (account.role_permissions[featureIdentifier]) {
        return Boolean(account.role_permissions[featureIdentifier].can_view);
      }
      // 2. Lowercase match
      if (account.role_permissions[normalized]) {
        return Boolean(account.role_permissions[normalized].can_view);
      }
      // 3. Match against feature_name or feature_code
      const match = Object.values(account.role_permissions).find(
        (p) =>
          (p.feature_name && p.feature_name.toLowerCase() === normalized) ||
          (p.feature_code && p.feature_code.toLowerCase() === normalized)
      );
      if (match) {
        return Boolean(match.can_view);
      }
      return false;
    }
  }

  // Admin and Security fallback when no role_permissions configured
  if (account.role_code === ROLE_CODE.ADMIN || account.role_code === ROLE_CODE.SECURITY) {
    return true;
  }

  // Fallback to Plan-based `allowed_features`
  const allowed = account.allowed_features || [];
  if (!allowed || allowed.length === 0) return false;
  return (
    allowed.includes(featureIdentifier) ||
    allowed.some((f) => f.toLowerCase() === normalized)
  );
};

/**
 * Constructs dynamic NavItem tree directly from database permissions array
 */
export const buildDynamicNavItemsFromPermissions = (
  permissions: RolePermission[],
  role?: string
): NavItem[] => {
  // A zero position keeps the permission but hides the item from the sidebar.
  const allowed = permissions.filter(
    (p) => Boolean(p.can_view) && Number(p.sidebar_order ?? 0) > 0
  );

  if (allowed.length === 0) return [];

  // Map to store children by parent_id
  const childrenMap = new Map<
    string,
    { key: string; label: string; path?: string; sidebarOrder: number }[]
  >();

  allowed.forEach((p) => {
    if (p.parent_id) {
      const list = childrenMap.get(p.parent_id) || [];
      const key = p.feature_code || p.feature_name?.toLowerCase().replace(/\s+/g, "_") || "";
      list.push({
        key,
        label: p.feature_name || "",
        path: p.url || undefined,
        sidebarOrder: Number(p.sidebar_order ?? 0),
      });
      childrenMap.set(p.parent_id, list);
    }
  });

  childrenMap.forEach((children) => {
    children.sort(
      (a, b) => a.sidebarOrder - b.sidebarOrder || a.label.localeCompare(b.label)
    );
  });

  // Build top-level items
  let topLevel: NavItem[] = [];
  allowed.forEach((p) => {
    if (!p.parent_id) {
      const subItems = p.feature_id ? childrenMap.get(p.feature_id) : undefined;
      const key = p.feature_code || p.feature_name?.toLowerCase().replace(/\s+/g, "_") || "";
      topLevel.push({
        key,
        label: p.feature_name || "",
        path: p.url || subItems?.[0]?.path,
        icon: p.icon || "LayoutGrid",
        subItems: subItems && subItems.length > 0 ? subItems : undefined,
      });
    }
  });

  if (role?.toLowerCase() === ROLE_CODE.ADMIN) {
    // For Admin, Overview is /admin. Do not show a duplicate "Associations" tab.
    topLevel = topLevel.filter((item) => item.key !== "associations");
  }

  topLevel.sort((a, b) => {
    const aPermission = allowed.find(
      (p) => (p.feature_code || p.feature_name?.toLowerCase().replace(/\s+/g, "_")) === a.key
    );
    const bPermission = allowed.find(
      (p) => (p.feature_code || p.feature_name?.toLowerCase().replace(/\s+/g, "_")) === b.key
    );
    const orderDifference =
      Number(aPermission?.sidebar_order ?? 0) - Number(bPermission?.sidebar_order ?? 0);
    return orderDifference || a.label.localeCompare(b.label);
  });

  return topLevel;
};

/**
 * Returns the filtered, role-authorized navigation list for any account
 */
export const getNavItemsForAccount = (
  account: Account | null,
  customNavItems?: NavItem[],
  associationAllowedFeatures?: string[]
): NavItem[] => {
  // The application sidebar is database-driven. Static role menus are
  // intentionally not used as a fallback when permissions are missing.
  if (
    !customNavItems &&
    account?.role_permissions &&
    Array.isArray(account.role_permissions) &&
    account.role_permissions.length > 0
  ) {
    return buildDynamicNavItemsFromPermissions(
      account.role_permissions,
      account.role_code,
    );
  }

  if (!customNavItems || customNavItems.length === 0) {
    return [];
  }

  if (!account) {
    return customNavItems;
  }

  const isAdmin = account.role_code === ROLE_CODE.SUPER_ADMIN || account.role_code === ROLE_CODE.ADMIN;
  const result: NavItem[] = [];

  customNavItems.forEach((item) => {
    const isLocked = !checkFeatureAccess(
      item.label,
      account,
      associationAllowedFeatures,
    );

    if (!isAdmin && isLocked) return;

    if (item.subItems && item.subItems.length > 0) {
      const mappedSub = item.subItems
        .map((sub) => {
          const subLocked = !checkFeatureAccess(
            sub.label,
            account,
            associationAllowedFeatures,
          );
          if (!isAdmin && subLocked) return null;
          return { ...sub, isLocked: subLocked };
        })
        .filter(Boolean) as typeof item.subItems;

      if (mappedSub.length > 0) {
        result.push({ ...item, isLocked, subItems: mappedSub });
      }
    } else {
      result.push({ ...item, isLocked });
    }
  });

  return result;
};
