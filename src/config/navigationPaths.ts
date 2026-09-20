/**
 * Database-backed feature-code routes. This fallback map mirrors active
 * feature records that the client currently implements.
 */
export const NAV_KEY_TO_PATH: Record<string, string> = {
  overview: "/dashboard",
  entity_types: "/entity-types",
  entities: "/entities",
  roles: "/roles",
  features: "/features",
  permissions: "/permissions",
  subscription_plans: "/subscriptions",
  associations: "/associations",
  bank: "/bank",
  financials: "/financials",
  employees: "/employees",
  users: "/users",
  vendors: "/vendors",
  service_request: "/service-requests",
  board_task: "/board-tasks",
  meetings: "/meetings",
  committees: "/committees",
  election: "/election",
  socials: "/socials",
  announcement: "/announcements",
  events: "/events",
  polls: "/polls",
  board_member: "/board-members",
  committee_member: "/committee-members",
  amenities: "/amenities",
  marketplace: "/marketplace",
  documents: "/documents",
  board_document: "/board-documents",
  resident_document: "/resident-documents",
  unit_document: "/unit-documents",
  budget: "/budget",
  chart_of_account: "/chart-of-accounts",
  email_activity: "/email-activity",
  inspection: "/inspection",
  wallet: "/wallet",
  visitor_management: "/visitor-management",
  new_visitor: "/visitor-management/new",
  pre_approved_visitors: "/visitor-management/preapproved",
  check_in: "/visitor-management/checkin",
  check_out: "/visitor-management/checkout",
  visitor_history: "/visitor-management/history",
  delivery: "/deliveries",
  new_delivery: "/deliveries/new",
  active_deliveries: "/deliveries/active",
  delivery_history: "/deliveries/history",
  vehicles: "/vehicles",
  staff_entry: "/staff",
  incidents: "/incidents",
  balance_sheet: "/financials/balance-sheet",
  income_statement: "/financials/income-statement",
  delinquency_report: "/financials/delinquency-report",
  prepaid_report: "/financials/prepaid-report",
  vendor_aging_report: "/financials/vendor-aging",
  invoice: "/financials/invoices",
  bank_transaction: "/financials/bank-transactions",
  bank_statement: "/financials/bank-statements",
  other_report: "/financials/other-reports",
};

/**
 * Reverse lookup generated from the same feature-code route catalogue.
 */
export const PATH_TO_NAV_KEY: Record<string, string> = Object.fromEntries(
  Object.entries(NAV_KEY_TO_PATH).map(([key, path]) => [path, key])
);

/**
 * Returns the URL path for a given nav key and role
 */
export const getPathForNavKey = (key: string): string | undefined => NAV_KEY_TO_PATH[key];

/**
 * Resolves the active tab key from a given pathname
 */
export const getNavKeyFromPath = (pathname: string, defaultKey: string = "overview"): string => {
  // Direct match
  if (PATH_TO_NAV_KEY[pathname]) {
    return PATH_TO_NAV_KEY[pathname];
  }

  // Trim trailing slashes
  const cleanPath = pathname.replace(/\/+$/, "");
  if (PATH_TO_NAV_KEY[cleanPath]) {
    return PATH_TO_NAV_KEY[cleanPath];
  }

  // Handle role dashboard tab subroutes (e.g. /dashboard/:tab or /homeowner-dashboard/:tab)
  const segments = cleanPath.split("/").filter(Boolean);
  if (segments.length >= 2) {
    const lastSegment = segments[segments.length - 1];
    if (PATH_TO_NAV_KEY[`/${lastSegment}`]) {
      return PATH_TO_NAV_KEY[`/${lastSegment}`];
    }
    return lastSegment;
  }

  return defaultKey;
};
