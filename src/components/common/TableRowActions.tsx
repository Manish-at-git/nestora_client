import React from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface TableRowActionsProps {
  /** Callback when View button is clicked */
  onView?: () => void;
  /** Callback when Edit button is clicked */
  onEdit?: () => void;
  /** Callback when Delete button is clicked */
  onDelete?: () => void;

  /** Whether the user has permission to view (defaults to true if onView provided) */
  canView?: boolean;
  /** Whether the user has permission to edit (defaults to true if onEdit provided) */
  canEdit?: boolean;
  /** Whether the user has permission to delete (defaults to true if onDelete provided) */
  canDelete?: boolean;
  /** Reserves the View button position when another row can be viewed. */
  reserveViewSlot?: boolean;
  /** Reserves the Edit button position when another row can be edited. */
  reserveEditSlot?: boolean;
  /** Reserves the Delete button position when another row can be deleted. */
  reserveDeleteSlot?: boolean;

  /** Whether the View button is disabled */
  viewDisabled?: boolean;
  /** Whether the Edit button is disabled */
  editDisabled?: boolean;
  /** Whether the Delete button is disabled */
  deleteDisabled?: boolean;

  /** Tooltip for View action */
  viewTooltip?: string;
  /** Tooltip for Edit action */
  editTooltip?: string;
  /** Tooltip for Delete action */
  deleteTooltip?: string;

  /** Button size: "xs" (h-6 w-6), "sm" (h-7 w-7, default), or "md" (h-8 w-8) */
  size?: "xs" | "sm" | "md";

  /** Custom container class name */
  className?: string;

  /** Optional extra action buttons / elements to render alongside */
  extraActions?: React.ReactNode;
}

export const TableRowActions: React.FC<TableRowActionsProps> = ({
  onView,
  onEdit,
  onDelete,
  canView = true,
  canEdit = true,
  canDelete = true,
  reserveViewSlot = false,
  reserveEditSlot = false,
  reserveDeleteSlot = false,
  viewDisabled = false,
  editDisabled = false,
  deleteDisabled = false,
  viewTooltip = "View Details",
  editTooltip = "Edit",
  deleteTooltip = "Delete",
  size = "sm",
  className,
  extraActions,
}) => {
  const sizeClasses = {
    xs: "h-6 w-6 rounded-md",
    sm: "h-7 w-7 rounded-lg",
    md: "h-8 w-8 rounded-lg",
  }[size];

  const iconSizes = {
    xs: 12,
    sm: 13,
    md: 14,
  }[size];

  const showView = onView ? canView : false;
  const showEdit = onEdit ? canEdit : false;
  const showDelete = onDelete ? canDelete : false;
  const hasViewSlot = showView || reserveViewSlot;
  const hasEditSlot = showEdit || reserveEditSlot;
  const hasDeleteSlot = showDelete || reserveDeleteSlot;

  if (!hasViewSlot && !hasEditSlot && !hasDeleteSlot && !extraActions) {
    return null;
  }

  return (
    <div className={cn("flex items-center justify-center gap-1", className)}>
      {extraActions}

      {showView ? (
        <Button
          variant="ghost"
          size="icon"
          onClick={onView}
          disabled={viewDisabled}
          className={cn(
            sizeClasses,
            "text-slate-500 hover:text-slate-900 hover:bg-slate-100 cursor-pointer transition-colors",
            viewDisabled
              ? "cursor-not-allowed opacity-40 hover:bg-transparent"
              : undefined,
          )}
          title={viewTooltip}
        >
          <Eye size={iconSizes} />
        </Button>
      ) : reserveViewSlot ? (
        <span className={sizeClasses} aria-hidden="true" />
      ) : null}

      {showEdit ? (
        <Button
          variant="ghost"
          size="icon"
          onClick={onEdit}
          disabled={editDisabled}
          className={cn(
            sizeClasses,
            "text-slate-500 hover:text-slate-900 hover:bg-slate-100 cursor-pointer transition-colors",
            editDisabled
              ? "cursor-not-allowed opacity-40 hover:bg-transparent"
              : undefined,
          )}
          title={editTooltip}
        >
          <Pencil size={iconSizes} />
        </Button>
      ) : reserveEditSlot ? (
        <span className={sizeClasses} aria-hidden="true" />
      ) : null}

      {showDelete ? (
        <Button
          variant="ghost"
          size="icon"
          onClick={onDelete}
          disabled={deleteDisabled}
          className={cn(
            sizeClasses,
            "text-rose-500 hover:text-rose-700 hover:bg-rose-50 cursor-pointer transition-colors",
            deleteDisabled
              ? "cursor-not-allowed opacity-40 hover:bg-transparent"
              : undefined,
          )}
          title={deleteTooltip}
        >
          <Trash2 size={iconSizes} />
        </Button>
      ) : reserveDeleteSlot ? (
        <span className={sizeClasses} aria-hidden="true" />
      ) : null}
    </div>
  );
};

export default TableRowActions;
