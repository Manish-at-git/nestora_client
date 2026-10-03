import React from "react";
import { Navigate } from "react-router-dom";
import { RoleRedirect } from "./RoleRedirect";
import RoleLayout from "@/layouts/RoleLayout";
import {
  LoginPage,
  SignInPage,
  VerifyDetailsPage,
  CreateAccountPage,
  ForgotPasswordPage,
  ResetPasswordPage,
} from "@/features/auth";
import { RoleDashboardRouter } from "./RoleDashboardRouter";
import { AnnouncementsPage } from "@/features/announcements";
import { EventsPage, EventPassPage } from "@/features/events";
import { PollsPage } from "@/features/polls";
import { BoardMembersPage } from "@/features/board-members";
import { CommitteesPage } from "@/features/committees";
import { CommitteeMembersPage } from "@/features/committee-members";
import { WalletPage } from "@/features/wallet";
import { UserProfilePage } from "@/features/profile";
import { MeetingsPage } from "@/features/meetings";
import { ServiceRequestsPage } from "@/features/service-requests";
import { BoardTasksPage } from "@/features/board-tasks";
import { EntityTypesPage } from "@/features/entity-types";
import { EntitiesPage } from "@/features/entities";
import { RolesPage } from "@/features/roles";
import { FeaturesPage } from "@/features/features";
import { PermissionsPage } from "@/features/permissions";
import { SubscriptionsPage } from "@/features/subscriptions";
import { AssociationsPage } from "@/features/associations";
import { EmployeesPage } from "@/features/employees";
import { UsersPage } from "@/features/users";
import { VendorsPage } from "@/features/vendors";
import { BankPage } from "@/features/bank";
import { EmailTemplatesPage } from "@/features/email-templates";
import { NearbyPlacesPage } from "@/features/nearby-places";
import { ChatPoolPage } from "@/features/chat-pool";
import { FinancialsPage } from "@/features/financials";
import { ChartOfAccountsPage } from "@/features/chart-of-accounts";
import DesignSystemPage from "@/features/design-system/DesignSystemPage";
import { ModulePlaceholder } from "@/components/common/ModulePlaceholder";
import { ElectionPage } from "@/features/election";
import { AmenitiesPage } from "@/features/amenities";
import { MarketplacePage } from "@/features/marketplace";
import { DocumentsPage } from "@/features/documents";
import { UnitDocumentsPage } from "@/features/unit-documents";
import {
  PreApprovedVisitorsPage,
  PublicVisitorPassPage,
  VisitorOperationsPage,
  GateConsolePage,
  VisitorHistoryPage,
  VisitorManagementLandingPage,
} from "@/features/visitor-management";
import { ROLE_CODE } from "@/constants/roleCodes";
import { FEATURES, LEGACY_FEATURE_PATHS } from "@/constants/featureCodes";

export interface AppRoute {
  path: string;
  element: React.ReactNode;
  isProtected?: boolean;
  allowedRoles?: string[];
}

/**
 * Public Authentication & Marketing Routes
 */
export const publicRoutes: AppRoute[] = [
  {
    path: "/event-pass/:passId",
    element: <EventPassPage />,
  },
  {
    path: FEATURES.ROOT.FEATURE_PATH,
    element: <RoleRedirect />,
  },
  {
    path: FEATURES.LOGIN.FEATURE_PATH,
    element: <RoleRedirect />,
  },
  {
    path: FEATURES.SIGNIN.FEATURE_PATH,
    element: <SignInPage />,
  },
  {
    path: FEATURES.VERIFY.FEATURE_PATH,
    element: <VerifyDetailsPage />,
  },
  {
    path: FEATURES.CREATE_ACCOUNT.FEATURE_PATH,
    element: <CreateAccountPage />,
  },
  {
    path: FEATURES.FORGOT_PASSWORD.FEATURE_PATH,
    element: <ForgotPasswordPage />,
  },
  {
    path: FEATURES.RESET_PASSWORD.FEATURE_PATH,
    element: <ResetPasswordPage />,
  },
  {
    path: FEATURES.DESIGN_SYSTEM.FEATURE_PATH,
    element: <DesignSystemPage />,
  },
  {
    path: FEATURES.VISITOR_PASS.FEATURE_PATH,
    element: <PublicVisitorPassPage />,
  },
];

/**
 * Modern Protected Application Routes
 * Rendered inside the persistent RoleLayout shell (<Outlet />)
 */
export const protectedAppRoutes: AppRoute[] = [
  // ==========================================
  // Primary Dashboard Overview
  // ==========================================
  {
    path: FEATURES.DASHBOARD.FEATURE_PATH,
    element: <RoleDashboardRouter />,
  },

  // ==========================================
  // Socials & Community Module
  // ==========================================
  {
    path: FEATURES.ANNOUNCEMENT.FEATURE_PATH,
    element: <AnnouncementsPage />,
  },
  {
    path: FEATURES.EVENTS.FEATURE_PATH,
    element: <EventsPage />,
  },
  {
    path: FEATURES.POLLS.FEATURE_PATH,
    element: <PollsPage />,
  },
  {
    path: FEATURES.BOARD_MEMBER.FEATURE_PATH,
    element: <BoardMembersPage />,
  },
  {
    path: FEATURES.COMMITTEE_MEMBER.FEATURE_PATH,
    element: <CommitteeMembersPage />,
  },
  {
    path: FEATURES.COMMITTEES.FEATURE_PATH,
    element: <CommitteesPage />,
  },

  // ==========================================
  // Governance & Operations
  // ==========================================
  {
    path: FEATURES.MEETINGS.FEATURE_PATH,
    element: <MeetingsPage />,
  },
  {
    path: FEATURES.MEETING_DETAIL.FEATURE_PATH,
    element: <MeetingsPage />,
  },
  {
    path: FEATURES.BOARD_TASK.FEATURE_PATH,
    element: <BoardTasksPage />,
  },
  {
    path: FEATURES.BOARD_TASK_DETAIL.FEATURE_PATH,
    element: <BoardTasksPage />,
  },
  {
    path: FEATURES.WALLET.FEATURE_PATH,
    element: <WalletPage />,
  },
  {
    path: FEATURES.PROFILE.FEATURE_PATH,
    element: <UserProfilePage />,
  },
  {
    path: FEATURES.ELECTION.FEATURE_PATH,
    element: (
      <ModulePlaceholder
        moduleName="Elections"
        title="Election Management"
        description="View election results, candidate information, and voting details."
      />
    ),
  },

  // ==========================================
  // Management & Placeholder Modules
  // ==========================================
  {
    path: FEATURES.SERVICE_REQUEST.FEATURE_PATH,
    element: <ServiceRequestsPage />,
  },
  {
    path: FEATURES.SERVICE_REQUEST_DETAIL.FEATURE_PATH,
    element: <ServiceRequestsPage />,
  },
  {
    path: FEATURES.RESIDENT_DOCUMENT.FEATURE_PATH,
    element: <DocumentsPage />,
  },
  {
    path: FEATURES.DOCUMENTS.FEATURE_PATH,
    element: <DocumentsPage />,
  },
  {
    path: FEATURES.BOARD_DOCUMENT.FEATURE_PATH,
    element: <DocumentsPage />,
  },
  {
    path: FEATURES.AMENITIES.FEATURE_PATH,
    element: <AmenitiesPage />,
  },
  {
    path: FEATURES.MARKETPLACE.FEATURE_PATH,
    element: <MarketplacePage />,
  },
  {
    path: FEATURES.FINANCIALS.FEATURE_PATH,
    element: <FinancialsPage />,
  },
  {
    path: FEATURES.INSPECTION.FEATURE_PATH,
    element: (
      <ModulePlaceholder
        moduleName="inspection"
        title="Property Inspections"
        description="Schedule site inspections, log compliance violations, and track resolutions."
      />
    ),
  },

  // ==========================================
  // Admin & Management Workspace
  // ==========================================
  {
    path: FEATURES.ADMIN.FEATURE_PATH,
    element: <Navigate to={FEATURES.DASHBOARD.FEATURE_PATH} replace />,
    allowedRoles: [ROLE_CODE.ADMIN, ROLE_CODE.SUPER_ADMIN],
  },
  {
    path: FEATURES.ADMIN_OVERVIEW.FEATURE_PATH,
    element: <Navigate to={FEATURES.DASHBOARD.FEATURE_PATH} replace />,
    allowedRoles: [ROLE_CODE.ADMIN, ROLE_CODE.SUPER_ADMIN],
  },
  {
    path: FEATURES.ADMIN_ASSOCIATIONS.FEATURE_PATH,
    element: <Navigate to={FEATURES.DASHBOARD.FEATURE_PATH} replace />,
    allowedRoles: [ROLE_CODE.ADMIN, ROLE_CODE.SUPER_ADMIN],
  },
  {
    path: FEATURES.BUDGET.FEATURE_PATH,
    element: (
      <ModulePlaceholder
        moduleName="budget"
        title="Annual Budget Management"
        description="View and configure association operating budgets and capital reserves."
      />
    ),
  },
  {
    path: FEATURES.CHART_OF_ACCOUNT.FEATURE_PATH,
    element: <ChartOfAccountsPage />,
  },
  {
    path: FEATURES.BANK.FEATURE_PATH,
    element: <BankPage />,
  },
  {
    path: FEATURES.UNIT_DOCUMENT.FEATURE_PATH,
    element: <UnitDocumentsPage />,
  },
  {
    path: FEATURES.EMAIL_ACTIVITY.FEATURE_PATH,
    element: (
      <ModulePlaceholder
        moduleName="email_activity"
        title="Email & Notification Activity"
        description="Audit sent email blasts, delivery statuses, and resident announcements."
      />
    ),
  },
  // ==========================================
  // Super Admin Platform Controls
  // ==========================================
  {
    path: FEATURES.SUPER_ADMIN.FEATURE_PATH,
    element: <Navigate to={FEATURES.DASHBOARD.FEATURE_PATH} replace />,
    allowedRoles: [ROLE_CODE.SUPER_ADMIN],
  },
  {
    path: FEATURES.SUBSCRIPTION_PLANS.FEATURE_PATH,
    element: <SubscriptionsPage />,
  },
  {
    path: FEATURES.ASSOCIATIONS.FEATURE_PATH,
    element: <AssociationsPage />,
  },
  {
    path: FEATURES.EMPLOYEES.FEATURE_PATH,
    element: <EmployeesPage />,
  },
  {
    path: FEATURES.USERS.FEATURE_PATH,
    element: <UsersPage />,
  },
  {
    path: FEATURES.VENDORS.FEATURE_PATH,
    element: <VendorsPage />,
  },
  {
    path: FEATURES.ENTITIES.FEATURE_PATH,
    element: <EntitiesPage />,
  },
  {
    path: FEATURES.ENTITY_TYPES.FEATURE_PATH,
    element: <EntityTypesPage />,
  },
  {
    path: FEATURES.ROLES.FEATURE_PATH,
    element: <RolesPage />,
  },
  {
    path: FEATURES.FEATURES.FEATURE_PATH,
    element: <FeaturesPage />,
  },
  {
    path: FEATURES.PERMISSIONS.FEATURE_PATH,
    element: <PermissionsPage />,
  },
  {
    path: FEATURES.EMAIL_TEMPLATES.FEATURE_PATH,
    element: <EmailTemplatesPage />,
    allowedRoles: [ROLE_CODE.SUPER_ADMIN],
  },
  {
    path: FEATURES.NEARBY_PLACES.FEATURE_PATH,
    element: <NearbyPlacesPage />,
  },
  {
    path: FEATURES.CHAT_POOL.FEATURE_PATH,
    element: <ChatPoolPage />,
  },
  {
    path: `${FEATURES.CHAT_POOL.FEATURE_PATH}/:poolType/:poolId`,
    element: <ChatPoolPage />,
  },

  // ==========================================
  // Security & Gate Operations
  // ==========================================
  {
    path: FEATURES.SECURITY.FEATURE_PATH,
    element: <Navigate to={FEATURES.DASHBOARD.FEATURE_PATH} replace />,
  },
  {
    path: FEATURES.VISITOR_MANAGEMENT.FEATURE_PATH,
    element: <VisitorManagementLandingPage />,
  },
  {
    path: LEGACY_FEATURE_PATHS.VISITOR_PASSES,
    element: <Navigate to={FEATURES.PRE_APPROVED_VISITORS.FEATURE_PATH} replace />,
  },
  {
    path: FEATURES.GATE_CONSOLE.FEATURE_PATH,
    element: <GateConsolePage />,
  },
  {
    path: FEATURES.PRE_APPROVED_VISITORS.FEATURE_PATH,
    element: <PreApprovedVisitorsPage />,
  },
  {
    path: FEATURES.CHECK_IN.FEATURE_PATH,
    element: <Navigate to={FEATURES.GATE_CONSOLE.FEATURE_PATH} replace />,
  },
  {
    path: FEATURES.CHECK_OUT.FEATURE_PATH,
    element: <Navigate to={FEATURES.GATE_CONSOLE.FEATURE_PATH} replace />,
  },
  {
    path: LEGACY_FEATURE_PATHS.GATE_CONSOLE,
    element: <Navigate to={FEATURES.GATE_CONSOLE.FEATURE_PATH} replace />,
  },
  {
    path: LEGACY_FEATURE_PATHS.ACTIVE_VISITORS,
    element: <Navigate to={FEATURES.GATE_CONSOLE.FEATURE_PATH} replace />,
  },
  {
    path: FEATURES.VISITOR_HISTORY.FEATURE_PATH,
    element: <VisitorHistoryPage />,
  },
  {
    path: FEATURES.DELIVERY.FEATURE_PATH,
    element: <VisitorOperationsPage mode="delivery" />,
  },
  {
    path: FEATURES.NEW_DELIVERY.FEATURE_PATH,
    element: (
      <ModulePlaceholder
        moduleName="delivery"
        title="Log New Delivery"
        description="Accept parcel from courier and notify resident."
      />
    ),
  },
  {
    path: FEATURES.ACTIVE_DELIVERIES.FEATURE_PATH,
    element: <VisitorOperationsPage mode="delivery" />,
  },
  {
    path: FEATURES.DELIVERY_HISTORY.FEATURE_PATH,
    element: <VisitorOperationsPage mode="delivery-history" />,
  },
  {
    path: FEATURES.VEHICLES.FEATURE_PATH,
    element: (
      <ModulePlaceholder
        moduleName="vehicles"
        title="Vehicle Registry"
        description="Scan license plates, manage resident parking slots, and log visitor parking."
      />
    ),
  },
  {
    path: FEATURES.STAFF_ENTRY.FEATURE_PATH,
    element: (
      <ModulePlaceholder
        moduleName="staff"
        title="Domestic & Gate Staff"
        description="Track security guard shift attendance and domestic staff passes."
      />
    ),
  },
  {
    path: FEATURES.INCIDENTS.FEATURE_PATH,
    element: (
      <ModulePlaceholder
        moduleName="incidents"
        title="Incident Reports"
        description="Record security breaches, emergency alarms, and facility damage reports."
      />
    ),
  },

  // ==========================================
  // Accounting & Financials
  // ==========================================
  {
    path: FEATURES.FINANCIALS.FEATURE_PATH,
    element: <FinancialsPage />,
  },
  {
    path: FEATURES.FINANCIAL_REPORT.FEATURE_PATH,
    element: <FinancialsPage />,
  },

  // ==========================================
  // User Profile
  // ==========================================
  {
    path: FEATURES.PROFILE.FEATURE_PATH,
    element: <UserProfilePage />,
  },

  // ==========================================
  // Legacy URL Redirects
  // ==========================================
  {
    path: FEATURES.HOMEOWNER_DASHBOARD.FEATURE_PATH,
    element: <Navigate to={FEATURES.DASHBOARD.FEATURE_PATH} replace />,
  },
  {
    path: FEATURES.TENANT_DASHBOARD.FEATURE_PATH,
    element: <Navigate to={FEATURES.DASHBOARD.FEATURE_PATH} replace />,
  },
  {
    path: FEATURES.BOARD_DASHBOARD.FEATURE_PATH,
    element: <Navigate to={FEATURES.DASHBOARD.FEATURE_PATH} replace />,
  },
  {
    path: FEATURES.COMMITTEE_DASHBOARD.FEATURE_PATH,
    element: <Navigate to={FEATURES.DASHBOARD.FEATURE_PATH} replace />,
  },
  {
    path: FEATURES.SECURITY_DASHBOARD.FEATURE_PATH,
    element: <Navigate to={FEATURES.DASHBOARD.FEATURE_PATH} replace />,
  },
  {
    path: FEATURES.ACCOUNTANT_DASHBOARD.FEATURE_PATH,
    element: <Navigate to={FEATURES.DASHBOARD.FEATURE_PATH} replace />,
  },
];

/**
 * Centralized list for index export
 */
export const appRoutes: AppRoute[] = [
  ...publicRoutes.map((r) => ({ ...r, isProtected: false })),
  ...protectedAppRoutes.map((r) => ({ ...r, isProtected: true })),
  {
    path: FEATURES.NOT_FOUND.FEATURE_PATH,
    element: <Navigate to={FEATURES.ROOT.FEATURE_PATH} replace />,
    isProtected: false,
  },
];

export default appRoutes;
