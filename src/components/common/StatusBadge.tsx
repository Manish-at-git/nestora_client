import React from "react";
import { StatusPill, type StatusPillProps, type StatusPillVariant, type StatusPillAppearance, type StatusPillSize } from "./StatusPill";

export type DomainStatus =
  | "Active"
  | "Inactive"
  | "Pending"
  | "In Progress"
  | "Completed"
  | "Resolved"
  | "Cancelled"
  | "Expired"
  | "Approved"
  | "Rejected"
  | "High"
  | "Medium"
  | "Low"
  | "Urgent"
  | string;

export interface StatusBadgeProps extends Omit<StatusPillProps, "status"> {
  status: DomainStatus;
  variant?:
    | "default"
    | "outline"
    | "secondary"
    | "moss"
    | "clay"
    | "success"
    | "warning"
    | "danger"
    | "info"
    | "maintenance"
    | "celebration"
    | StatusPillVariant;
  appearance?: StatusPillAppearance;
  size?: StatusPillSize;
  className?: string;
  showDot?: boolean;
}

/**
 * Backward-compatible StatusBadge wrapper around StatusPill
 */
export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  variant,
  appearance = "subtle",
  ...props
}) => {
  return (
    <StatusPill
      status={status}
      variant={variant as any}
      appearance={appearance}
      {...props}
    />
  );
};

export default StatusBadge;
