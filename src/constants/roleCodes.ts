/** Stable authorization values shared by feature UI decisions. */
export const ROLE_CODE = {
  SUPER_ADMIN: "super_admin",
  ADMIN: "admin",
  BOARD_MEMBER: "board_member",
  COMMITTEE_MEMBER: "committee_member",
  HOMEOWNER: "homeowner",
  TENANT: "tenant",
  ACCOUNTANT: "accountant",
  SECURITY: "security",
  CSR: "csr",
} as const;

/** Roles allowed to load the association directory used by admin forms. */
export const ASSOCIATION_DIRECTORY_ROLE_CODES = [
  ROLE_CODE.SUPER_ADMIN,
  ROLE_CODE.ADMIN,
  ROLE_CODE.ACCOUNTANT,
  ROLE_CODE.BOARD_MEMBER,
] as const;

/** Roles allowed to operate the visitor gate workflows. */
export const isVisitorOperationsRole = (roleCode?: string): boolean =>
  roleCode === ROLE_CODE.SECURITY ||
  roleCode === ROLE_CODE.ADMIN ||
  roleCode === ROLE_CODE.SUPER_ADMIN;
