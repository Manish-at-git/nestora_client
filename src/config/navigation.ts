import type { NavItem } from "@/types/navigation";
import type { Account, RolePermission } from "@/types/auth";

// ============================================================================
// Master Navigation Configuration for Admin
// ============================================================================
export const ADMIN_NAV_ITEMS: NavItem[] = [
  { key: "overview", path: "/dashboard", icon: "Overview", label: "Overview" },
  { key: "service_request", path: "/service-requests", icon: "ServiceRequests", label: "Service Request" },
  { key: "board_task", path: "/board-tasks", icon: "BoardTasks", label: "Board Task" },
  { key: "meetings", path: "/meetings", icon: "Meetings", label: "Meetings" },
  { key: "committees", path: "/committees", icon: "Committees", label: "Committees" },
  { key: "election", path: "/election", icon: "Election", label: "Election" },
  {
    key: "socials",
    path: "/socials",
    icon: "Socials",
    label: "Socials",
    subItems: [
      { key: "announcement", path: "/announcements", label: "Announcement" },
      { key: "events", path: "/events", label: "Events" },
      { key: "polls", path: "/polls", label: "Polls" },
      { key: "board_member", path: "/board-members", label: "Board Member" },
      { key: "committee_member", path: "/committee-members", label: "Committee Member" },
    ],
  },
  { key: "amenities", path: "/amenities", icon: "Amenities", label: "Amenities" },
  { key: "documents", path: "/documents", icon: "Documents", label: "Documents" },
  {
    key: "financials",
    path: "/financials",
    icon: "Financials",
    label: "Financials",
    subItems: [
      { key: "balance_sheet", path: "/financials/balance-sheet", label: "Balance Sheet" },
      { key: "income_statement", path: "/financials/income-statement", label: "Income Statement" },
      { key: "delinquency_report", path: "/financials/delinquency-report", label: "Delinquency Report" },
      { key: "prepaid_report", path: "/financials/prepaid-report", label: "Prepaid Report" },
      { key: "vendor_aging_report", path: "/financials/vendor-aging", label: "Vendor Aging Report" },
      { key: "invoice", path: "/financials/invoices", label: "Invoice" },
      { key: "bank_transaction", path: "/financials/bank-transactions", label: "Bank Transaction" },
      { key: "bank_statement", path: "/financials/bank-statements", label: "Bank Statement" },
      { key: "other_report", path: "/financials/other-reports", label: "Other Report" },
    ],
  },
  { key: "budget", path: "/budget", icon: "Budget", label: "Budget" },
  { key: "chart_of_account", path: "/chart-of-accounts", icon: "Documents", label: "Chart of Account" },
  { key: "bank", path: "/bank", icon: "Bank", label: "Bank" },
  { key: "unit_document", path: "/unit-documents", icon: "UnitDocument", label: "Unit Document" },
  { key: "email_activity", path: "/email-activity", icon: "EmailActivity", label: "Email Activity" },
  { key: "inspection", path: "/inspection", icon: "Inspection", label: "Inspection" },
];

// ============================================================================
// Master Navigation Configuration for Super Admin
// ============================================================================
export const SUPER_ADMIN_NAV_ITEMS: NavItem[] = [
  { key: "overview", path: "/dashboard", icon: "Overview", label: "Overview" },
  { key: "entity_types", path: "/entity-types", icon: "Layers", label: "Entity Types" },
  { key: "entities", path: "/entities", icon: "Building2", label: "Entities" },
  { key: "roles", path: "/roles", icon: "Shield", label: "Roles" },
  { key: "features", path: "/features", icon: "LayoutGrid", label: "Features" },
  { key: "permissions", path: "/permissions", icon: "Key", label: "Permissions" },
  { key: "subscription_plans", path: "/subscriptions", icon: "CreditCard", label: "Subscriptions" },
  { key: "associations", path: "/associations", icon: "Building", label: "Associations" },
  { key: "bank", path: "/bank", icon: "Bank", label: "Bank" },
  { key: "financials", path: "/financials", icon: "Financials", label: "Financials" },
  { key: "employees", path: "/employees", icon: "Users", label: "Employees" },
  { key: "users", path: "/users", icon: "User", label: "Users" },
  { key: "vendors", path: "/vendors", icon: "Store", label: "Vendors" },
];

// ============================================================================
// Master Navigation Configuration for Board Member
// ============================================================================
export const BOARD_MEMBER_NAV_ITEMS: NavItem[] = [
  { key: "overview", path: "/dashboard", icon: "Overview", label: "Overview" },
  { key: "wallet", path: "/wallet", icon: "Wallet", label: "Wallet" },
  { key: "board_task", path: "/board-tasks", icon: "BoardTasks", label: "Board Task" },
  { key: "service_request", path: "/service-requests", icon: "ServiceRequests", label: "Service Request" },
  { key: "inspection", path: "/inspection", icon: "Inspection", label: "Inspection" },
  { key: "meetings", path: "/meetings", icon: "Meetings", label: "Meetings" },
  { key: "committees", path: "/committees", icon: "Committees", label: "Committees" },
  { key: "election", path: "/election", icon: "Election", label: "Election" },
  {
    key: "socials",
    path: "/socials",
    icon: "Socials",
    label: "Socials",
    subItems: [
      { key: "announcement", path: "/announcements", label: "Announcement" },
      { key: "events", path: "/events", label: "Events" },
      { key: "polls", path: "/polls", label: "Polls" },
      { key: "board_member", path: "/board-members", label: "Board Member" },
      { key: "committee_member", path: "/committee-members", label: "Committee Member" },
    ],
  },
  {
    key: "visitor_management",
    path: "/visitor-management",
    icon: "Users",
    label: "Visitor Management",
    subItems: [
      { key: "pre_approved_visitors", path: "/visitor-management/preapproved", label: "Pre-Approved Visitors" },
    ],
  },
  { key: "delivery", path: "/deliveries", icon: "Package", label: "Delivery" },
  { key: "marketplace", path: "/marketplace", icon: "ShoppingBag", label: "Marketplace" },
  { key: "amenities", path: "/amenities", icon: "Amenities", label: "Amenities" },
  { key: "documents", path: "/documents", icon: "Documents", label: "Documents" },
];

// ============================================================================
// Master Navigation Configuration for Homeowner
// ============================================================================
export const HOMEOWNER_NAV_ITEMS: NavItem[] = [
  { key: "overview", path: "/dashboard", icon: "Overview", label: "Overview" },
  { key: "wallet", path: "/wallet", icon: "Wallet", label: "Wallet" },
  { key: "service_request", path: "/service-requests", icon: "ServiceRequests", label: "Service Request" },
  { key: "meetings", path: "/meetings", icon: "Meetings", label: "Meetings" },
  { key: "election", path: "/election", icon: "Election", label: "Election" },
  {
    key: "socials",
    path: "/socials",
    icon: "Socials",
    label: "Socials",
    subItems: [
      { key: "announcement", path: "/announcements", label: "Announcement" },
      { key: "events", path: "/events", label: "Events" },
      { key: "polls", path: "/polls", label: "Polls" },
      { key: "board_member", path: "/board-members", label: "Board Member" },
      { key: "committee_member", path: "/committee-members", label: "Committee Member" },
    ],
  },
  { key: "committees", path: "/committees", icon: "Committees", label: "Committees" },
  { key: "marketplace", path: "/marketplace", icon: "ShoppingBag", label: "Marketplace" },
  { key: "amenities", path: "/amenities", icon: "Amenities", label: "Amenities" },
  {
    key: "visitor_management",
    path: "/visitor-management",
    icon: "Users",
    label: "Visitor Management",
    subItems: [
      { key: "pre_approved_visitors", path: "/visitor-management/preapproved", label: "Pre-Approved Visitors" },
    ],
  },
  { key: "delivery", path: "/deliveries", icon: "Package", label: "Delivery" },
  { key: "documents", path: "/documents", icon: "Documents", label: "Documents" },
];

// ============================================================================
// Master Navigation Configuration for Tenant
// ============================================================================
export const TENANT_NAV_ITEMS: NavItem[] = [
  { key: "overview", path: "/dashboard", icon: "Overview", label: "Overview" },
  { key: "wallet", path: "/wallet", icon: "Wallet", label: "Wallet" },
  { key: "service_request", path: "/service-requests", icon: "ServiceRequests", label: "Service Request" },
  { key: "meetings", path: "/meetings", icon: "Meetings", label: "Meetings" },
  {
    key: "socials",
    path: "/socials",
    icon: "Socials",
    label: "Socials",
    subItems: [
      { key: "announcement", path: "/announcements", label: "Announcement" },
      { key: "events", path: "/events", label: "Events" },
      { key: "polls", path: "/polls", label: "Polls" },
    ],
  },
  { key: "marketplace", path: "/marketplace", icon: "ShoppingBag", label: "Marketplace" },
  { key: "amenities", path: "/amenities", icon: "Amenities", label: "Amenities" },
  {
    key: "visitor_management",
    path: "/visitor-management",
    icon: "Users",
    label: "Visitor Management",
    subItems: [
      { key: "pre_approved_visitors", path: "/visitor-management/preapproved", label: "Pre-Approved Visitors" },
    ],
  },
  { key: "delivery", path: "/deliveries", icon: "Package", label: "Delivery" },
  { key: "documents", path: "/documents", icon: "Documents", label: "Documents" },
];

// ============================================================================
// Master Navigation Configuration for Security
// ============================================================================
export const SECURITY_NAV_ITEMS: NavItem[] = [
  { key: "overview", path: "/dashboard", icon: "Overview", label: "Overview" },
  {
    key: "visitor_management",
    path: "/visitor-management",
    icon: "Users",
    label: "Visitor Management",
    subItems: [
      { key: "new_visitor", path: "/visitor-management/new", label: "New Visitor" },
      { key: "pre_approved_visitors", path: "/visitor-management/preapproved", label: "Pre-Approved Visitors" },
      { key: "check_in", path: "/visitor-management/checkin", label: "Check-In" },
      { key: "check_out", path: "/visitor-management/checkout", label: "Check-Out" },
      { key: "visitor_history", path: "/visitor-management/history", label: "Visitor History" },
    ],
  },
  {
    key: "delivery",
    path: "/deliveries",
    icon: "Package",
    label: "Delivery",
    subItems: [
      { key: "new_delivery", path: "/deliveries/new", label: "New Delivery" },
      { key: "active_deliveries", path: "/deliveries/active", label: "Active Deliveries" },
      { key: "delivery_history", path: "/deliveries/history", label: "Delivery History" },
    ],
  },
  { key: "vehicles", path: "/vehicles", icon: "Car", label: "Vehicles" },
  { key: "staff_entry", path: "/staff", icon: "UserCheck", label: "Staff Entry" },
  { key: "incidents", path: "/incidents", icon: "ShieldAlert", label: "Incidents" },
];

// ============================================================================
// Master Navigation Configuration for Accountant
// ============================================================================
export const ACCOUNTANT_NAV_ITEMS: NavItem[] = [
  { key: "overview", path: "/dashboard", icon: "Overview", label: "Overview" },
  { key: "service_request", path: "/service-requests", icon: "ServiceRequests", label: "Service Request" },
  { key: "board_task", path: "/board-tasks", icon: "BoardTasks", label: "Board Task" },
  { key: "meetings", path: "/meetings", icon: "Meetings", label: "Meetings" },
  { key: "committees", path: "/committees", icon: "Committees", label: "Committees" },
  { key: "election", path: "/election", icon: "Election", label: "Election" },
  {
    key: "socials",
    path: "/socials",
    icon: "Socials",
    label: "Socials",
    subItems: [
      { key: "announcement", path: "/announcements", label: "Announcement" },
      { key: "events", path: "/events", label: "Events" },
      { key: "polls", path: "/polls", label: "Polls" },
      { key: "board_member", path: "/board-members", label: "Board Member" },
      { key: "committee_member", path: "/committee-members", label: "Committee Member" },
    ],
  },
  { key: "amenities", path: "/amenities", icon: "Amenities", label: "Amenities" },
  { key: "documents", path: "/documents", icon: "Documents", label: "Documents" },
  {
    key: "financials",
    path: "/financials",
    icon: "Financials",
    label: "Financials",
    subItems: [
      { key: "balance_sheet", path: "/financials/balance-sheet", label: "Balance Sheet" },
      { key: "income_statement", path: "/financials/income-statement", label: "Income Statement" },
      { key: "delinquency_report", path: "/financials/delinquency-report", label: "Delinquency Report" },
      { key: "prepaid_report", path: "/financials/prepaid-report", label: "Prepaid Report" },
      { key: "vendor_aging_report", path: "/financials/vendor-aging", label: "Vendor Aging Report" },
      { key: "invoice", path: "/financials/invoices", label: "Invoice" },
      { key: "bank_transaction", path: "/financials/bank-transactions", label: "Bank Transaction" },
      { key: "bank_statement", path: "/financials/bank-statements", label: "Bank Statement" },
      { key: "other_report", path: "/financials/other-reports", label: "Other Report" },
    ],
  },
  { key: "budget", path: "/budget", icon: "Budget", label: "Budget" },
  { key: "chart_of_account", path: "/chart-of-accounts", icon: "Documents", label: "Chart of Account" },
  { key: "bank", path: "/bank", icon: "Bank", label: "Bank" },
  { key: "unit_document", path: "/unit-documents", icon: "UnitDocument", label: "Unit Document" },
  { key: "email_activity", path: "/email-activity", icon: "EmailActivity", label: "Email Activity" },
  { key: "inspection", path: "/inspection", icon: "Inspection", label: "Inspection" },
];

// ============================================================================
// Master Navigation Configuration for Committee Member
// ============================================================================
export const COMMITTEE_MEMBER_NAV_ITEMS: NavItem[] = [
  { key: "overview", path: "/dashboard", icon: "Overview", label: "Overview" },
  { key: "committees", path: "/committees", icon: "Committees", label: "Committees" },
  { key: "meetings", path: "/meetings", icon: "Meetings", label: "Meetings" },
  { key: "service_request", path: "/service-requests", icon: "ServiceRequests", label: "Service Request" },
  {
    key: "socials",
    path: "/socials",
    icon: "Socials",
    label: "Socials",
    subItems: [
      { key: "announcement", path: "/announcements", label: "Announcement" },
      { key: "events", path: "/events", label: "Events" },
      { key: "polls", path: "/polls", label: "Polls" },
      { key: "committee_member", path: "/committee-members", label: "Committee Member" },
    ],
  },
  { key: "documents", path: "/documents", icon: "Documents", label: "Documents" },
];

// ============================================================================
// Master Navigation Configuration for Generic Member
// ============================================================================
export const MEMBER_NAV_ITEMS: NavItem[] = [
  { key: "overview", path: "/dashboard", icon: "Overview", label: "Overview" },
  { key: "wallet", path: "/wallet", icon: "Wallet", label: "Wallet" },
  { key: "service_request", path: "/service-requests", icon: "ServiceRequests", label: "Service Request" },
  { key: "meetings", path: "/meetings", icon: "Meetings", label: "Meetings" },
  {
    key: "socials",
    path: "/socials",
    icon: "Socials",
    label: "Socials",
    subItems: [
      { key: "announcement", path: "/announcements", label: "Announcement" },
      { key: "events", path: "/events", label: "Events" },
      { key: "polls", path: "/polls", label: "Polls" },
    ],
  },
  { key: "marketplace", path: "/marketplace", icon: "ShoppingBag", label: "Marketplace" },
  { key: "amenities", path: "/amenities", icon: "Amenities", label: "Amenities" },
  { key: "documents", path: "/documents", icon: "Documents", label: "Documents" },
];

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
  if (account.role === "Super admin") {
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
  if (account.role === "Admin" || account.role === "Security") {
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

  if (role?.toLowerCase() === "admin") {
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
  // 1. Prioritize Dynamic Database-Driven Sidebar (Option B)
  if (
    !customNavItems &&
    account?.role_permissions &&
    Array.isArray(account.role_permissions) &&
    account.role_permissions.length > 0
  ) {
    const dynamicItems = buildDynamicNavItemsFromPermissions(
      account.role_permissions,
      account.role
    );
    if (dynamicItems.length > 0) {
      return dynamicItems;
    }
  }

  // 2. Fallback: Determine base list by static role configuration if not supplied by DB
  let baseItems = customNavItems;
  if (!baseItems || baseItems.length === 0) {
    if (!account) {
      baseItems = MEMBER_NAV_ITEMS;
    } else {
      const roleLower = account.role?.toLowerCase() || "";
      switch (roleLower) {
        case "super admin":
          baseItems = SUPER_ADMIN_NAV_ITEMS;
          break;
        case "admin":
          baseItems = ADMIN_NAV_ITEMS;
          break;
        case "board member":
          baseItems = BOARD_MEMBER_NAV_ITEMS;
          break;
        case "homeowner":
          baseItems = HOMEOWNER_NAV_ITEMS;
          break;
        case "tenant":
          baseItems = TENANT_NAV_ITEMS;
          break;
        case "security":
          baseItems = SECURITY_NAV_ITEMS;
          break;
        case "accountant":
          baseItems = ACCOUNTANT_NAV_ITEMS;
          break;
        case "committee member":
          baseItems = COMMITTEE_MEMBER_NAV_ITEMS;
          break;
        default:
          baseItems = MEMBER_NAV_ITEMS;
          break;
      }
    }
  }

  if (!account) {
    // In preview/unauthenticated mode, show all navigation items
    return baseItems;
  }

  const isAdmin = account.role === "Super admin" || account.role === "Admin";
  const result: NavItem[] = [];

  baseItems.forEach((item) => {
    const isLocked = !checkFeatureAccess(
      item.label,
      account,
      associationAllowedFeatures
    );

    // Non-admins only see features they actually have access to
    if (!isAdmin && isLocked) return;

    if (item.subItems && item.subItems.length > 0) {
      const mappedSub = item.subItems
        .map((sub) => {
          const subLocked = !checkFeatureAccess(
            sub.label,
            account,
            associationAllowedFeatures
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
