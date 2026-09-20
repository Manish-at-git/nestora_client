import React from "react";
import { IconName } from "@/components/icons";

export interface NavSubItem {
  key: string;
  label: string;
  path?: string;
  icon?: IconName | string | React.ComponentType<{ size?: number; className?: string }>;
  isLocked?: boolean;
  requiredFeature?: string;
}

export interface NavItem {
  key: string;
  label: string;
  path?: string;
  icon: IconName | string | React.ComponentType<{ size?: number; className?: string }>;
  isLocked?: boolean;
  requiredFeature?: string;
  subItems?: NavSubItem[];
}

export interface RolePermissionRule {
  can_view?: boolean;
  can_create?: boolean;
  can_update?: boolean;
  can_delete?: boolean;
}

export type RolePermissionsMap = Record<string, RolePermissionRule>;
