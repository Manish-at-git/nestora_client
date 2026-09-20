import React, { useState, useMemo } from "react";
import { toast } from "sonner";
import {
  Pencil,
  Trash2,
  Plus,
  Layers,
  Clock,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable, Column } from "@/components/common/DataTable";
import { DeleteModal } from "@/components/common/DeleteModal";
import { StatusPill } from "@/components/common/StatusPill";
import { usePermission } from "@/hooks/usePermission";
import { getCurrencySymbol, COUNTRIES } from "@/utils/currency";
import { useDeleteSubscriptionPlanMutation } from "../api/subscriptionsApi";
import type { SubscriptionPlan } from "../types";
import { formatApiErrorDetail } from "@/services/api/apiClient";

export interface SubscriptionPlanTableProps {
  plans: SubscriptionPlan[];
  isLoading?: boolean;
  onAdd?: () => void;
  onEdit: (plan: SubscriptionPlan) => void;
  onDeleted?: () => void;
}

export const SubscriptionPlanTable: React.FC<SubscriptionPlanTableProps> = ({
  plans,
  isLoading = false,
  onAdd,
  onEdit,
  onDeleted,
}) => {
  const { canCreate, canUpdate, canDelete } = usePermission();
  const [planToDelete, setPlanToDelete] = useState<SubscriptionPlan | null>(null);
  const [deletePlan, { isLoading: isDeleting }] = useDeleteSubscriptionPlanMutation();

  const handleConfirmDelete = async () => {
    if (!planToDelete) return;
    try {
      await deletePlan(planToDelete.id).unwrap();
      toast.success(`Plan "${planToDelete.name}" deleted successfully.`);
      setPlanToDelete(null);
      onDeleted?.();
    } catch (err: any) {
      toast.error(
        formatApiErrorDetail(err?.data || err?.message || "Failed to delete subscription plan.")
      );
    }
  };

  const columns = useMemo<Column<SubscriptionPlan>[]>(
    () => {
      const baseCols: Column<SubscriptionPlan>[] = [
      {
        key: "sr_no",
        header: "Sr. No.",
        sortable: false,
        width: "64px",
        className: "text-center",
        render: (_row, index) => (
          <span className="font-medium text-slate-500 text-xs">
            {index + 1}
          </span>
        ),
      },
      {
        key: "name",
        header: "Plan Name",
        sortable: true,
        filterable: true,
        width: "140px",
        render: (row) => (
          <div className="font-semibold text-slate-800 text-xs truncate">
            {row.name}
          </div>
        ),
      },
      {
        key: "name",
        header: "Plan Code",
        sortable: true,
        filterable: true,
        width: "140px",
        render: (row) => (
          <div className="font-semibold text-slate-800 text-xs truncate">
            <StatusPill variant="info" shape="rounded" size="xs">
              <span>{row.code}</span>
            </StatusPill>
          </div>
        ),
      },
      {
        key: "country",
        header: "Country",
        sortable: true,
        filterable: true,
        width: "140px",
        render: (row) => {
          const countryInfo = COUNTRIES.find(
            (c) => c.name.toLowerCase() === (row.country || "").toLowerCase()
          );
          return (
            <StatusPill variant="neutral" shape="rounded" size="xs">
              <span>{row.country || "Global"}</span>
            </StatusPill>
          );
        },
      },
      {
        key: "pricing",
        header: "Pricing",
        sortable: true,
        filterable: false,
        width: "140px",
        render: (row) => {
          const currency = getCurrencySymbol(row.country);
          return (
            <div className="flex flex-col text-xs">
              <span className="font-semibold text-slate-800">
                {currency}
                {row.monthly_price !== null && row.monthly_price !== undefined
                  ? Number(row.monthly_price).toLocaleString()
                  : "0"}
                <span className="text-slate-400 font-normal"> / mo</span>
              </span>
              {row.yearly_price !== null && row.yearly_price !== undefined && (
                <span className="text-slate-500 text-[11px] mt-0.5">
                  {currency}
                  {Number(row.yearly_price).toLocaleString()}
                  <span className="text-slate-400 font-normal"> / yr</span>
                </span>
              )}
            </div>
          );
        },
      },
      {
        key: "trial_days",
        header: "Trial",
        sortable: true,
        filterable: true,
        width: "140px",
        render: (row) =>
          row.trial_days > 0 ? (
            <StatusPill
              variant="info"
              shape="rounded"
              size="xs"
              icon={<Clock size={11} className="text-blue-400" />}
            >
              <span>{row.trial_days} days</span>
            </StatusPill>
          ) : (
            <span className="text-xs text-slate-400">None</span>
          ),
      },
      {
        key: "features",
        header: "Features",
        sortable: true,
        filterable: false,
        width: "140px",
        render: (row) => (
          <StatusPill
            variant="info"
            shape="rounded"
            size="xs"
            icon={<Layers size={11} className="text-indigo-500" />}
          >
            <span>{(row.features || []).length} features</span>
          </StatusPill>
        ),
      },
      {
        key: "is_active",
        header: "Status",
        sortable: true,
        filterable: true,
        width: "140px",
        render: (row) => (
          <StatusPill
            variant={row.is_active ? "success" : "neutral"}
            shape="rounded"
            size="xs"
            dot
          >
            {row.is_active ? "Active" : "Inactive"}
          </StatusPill>
        ),
      },
    ];

    if (canUpdate || canDelete) {
      baseCols.push({
        key: "actions",
        header: "Actions",
        sortable: false,
        width: "72px",
        className: "text-center",
        headerClassName: "text-center justify-center",
        render: (row) => (
          <div className="flex items-center justify-center gap-1">
            {canUpdate && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(row)}
                className="rounded-lg h-7 w-7 text-slate-500 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
                title="Edit Plan"
              >
                <Pencil size={13} />
              </Button>
            )}
            {canDelete && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setPlanToDelete(row)}
                className="rounded-lg h-7 w-7 text-rose-500 hover:text-rose-700 hover:bg-rose-50 cursor-pointer"
                title="Delete Plan"
              >
                <Trash2 size={13} />
              </Button>
            )}
          </div>
        ),
      });
    }

    return baseCols;
  }, [onEdit, canUpdate, canDelete]);

  return (
    <>
      <DataTable
        data={plans}
        columns={columns}
        density="compact"
        searchPlaceholder="Search plans by name, code, country..."
        searchKeys={["name", "code", "country", "description"]}
        enableGlobalFilter={true}
        enableColumnFilters={true}
        enableSorting={true}
        pagination={{
          isServer: false,
          pageSize: 10,
          pageSizeOptions: [10, 25, 50],
        }}
        isLoading={isLoading}
        emptyTitle="No subscription plans found"
        emptyMessage="No subscription plans match your search criteria."
        onEmptyAction={canCreate ? onAdd : undefined}
        headerActions={
          canCreate && onAdd && (
            <Button onClick={onAdd}>
              <Plus size={15} className="mr-1.5" />
              <span>Add Plan</span>
            </Button>
          )
        }
      />

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={Boolean(planToDelete)}
        onClose={() => setPlanToDelete(null)}
        onDelete={handleConfirmDelete}
        itemName={planToDelete?.name}
        itemType="Subscription Plan"
        description={`Are you sure you want to delete the plan "${planToDelete?.name}" (${planToDelete?.country})? Associations subscribed to this plan may be affected.`}
        isDeleting={isDeleting}
      />
    </>
  );
};

export default SubscriptionPlanTable;
