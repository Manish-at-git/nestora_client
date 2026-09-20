import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { ROLES, ROLES_STRING } from "./staticData";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const isSuperAdmin = (roleCode?: string | null): boolean => {
  if (!roleCode) return false;
  const cleanCode = String(roleCode).trim().toLowerCase().replace(/[\s-]+/g, "_");
  const superAdminRole = ROLES.find((item) => item.value === 1);
  return cleanCode === superAdminRole?.label || cleanCode === ROLES_STRING.SUPER_ADMIN;
};

export const isAdmin = (roleCode?: string | null): boolean => {
  if (!roleCode) return false;
  const cleanCode = String(roleCode).trim().toLowerCase().replace(/[\s-]+/g, "_");
  const adminRole = ROLES.find((item) => item.value === 2);
  return cleanCode === adminRole?.label || cleanCode === ROLES_STRING.ADMIN;
};

export const isHomeowner = (roleCode?: string | null): boolean => {
  if (!roleCode) return false;
  const cleanCode = String(roleCode).trim().toLowerCase().replace(/[\s-]+/g, "_");
  const homeownerRole = ROLES.find((item) => item.value === 5);
  return cleanCode === homeownerRole?.label || cleanCode === ROLES_STRING.HOMEOWNER;
};

export const isBoardMember = (roleCode?: string | null): boolean => {
  if (!roleCode) return false;
  const cleanCode = String(roleCode).trim().toLowerCase().replace(/[\s-]+/g, "_");
  const boardMemberRole = ROLES.find((item) => item.value === 4);
  return cleanCode === boardMemberRole?.label || cleanCode === ROLES_STRING.BOARD_MEMBER;
};

export const isCommitteeMember = (roleCode?: string | null): boolean => {
  if (!roleCode) return false;
  const cleanCode = String(roleCode).trim().toLowerCase().replace(/[\s-]+/g, "_");
  const cmRole = ROLES.find((item) => item.value === 3);
  return cleanCode === cmRole?.label || cleanCode === ROLES_STRING.COMMITTEE_MEMBER;
};

export const isTenant = (roleCode?: string | null): boolean => {
  if (!roleCode) return false;
  const cleanCode = String(roleCode).trim().toLowerCase().replace(/[\s-]+/g, "_");
  const tenantRole = ROLES.find((item) => item.value === 7);
  return cleanCode === tenantRole?.label || cleanCode === ROLES_STRING.TENANT;
};

