import React, { useState, useMemo } from "react";
import {
  Landmark,
  Eye,
  Pencil,
  Trash2,
  Building,
  Plus,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable, Column } from "@/components/common/DataTable";
import { DeleteModal } from "@/components/common/DeleteModal";
import { StatusPill } from "@/components/common/StatusPill";
import { usePermission } from "@/hooks/usePermission";
import { toast } from "sonner";
import { useDeleteBankAccountMutation } from "../api/bankApi";
import type { BankAccount } from "../types";

export interface BankTableProps {
  accounts: BankAccount[];
  isLoading?: boolean;
  onAdd?: () => void;
  onView: (account: BankAccount) => void;
  onEdit: (account: BankAccount) => void;
  onDeleted?: () => void;
}

export const BankTable: React.FC<BankTableProps> = ({
  accounts,
  isLoading = false,
  onAdd,
  onView,
  onEdit,
  onDeleted,
}) => {
  const { canCreate, canUpdate, canDelete } = usePermission();
  const [accountToDelete, setAccountToDelete] = useState<BankAccount | null>(null);
  const [deleteAccount, { isLoading: isDeleting }] = useDeleteBankAccountMutation();

  const handleDeleteConfirm = async () => {
    if (!accountToDelete) return;
    try {
      await deleteAccount(accountToDelete.id).unwrap();
      toast.success(`Bank account "${accountToDelete.account_name}" deleted successfully.`);
      setAccountToDelete(null);
      onDeleted?.();
    } catch (err: any) {
      toast.error(err?.data || err?.message || "Failed to delete bank account");
    }
  };

  const columns = useMemo<Column<BankAccount>[]>(
    () => [
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
        key: "bank_name",
        header: "Bank & Account Name",
        sortable: true,
        filterable: true,
        width: "240px",
        render: (row) => (
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-semibold text-slate-800 text-xs truncate">
                  {row.bank_name}
                </span>
                {row.is_default ? (
                  <StatusPill variant="indigo" shape="rounded" size="xs">
                    Primary
                  </StatusPill>
                ) : <></>}
              </div>
              <span className="text-[11px] text-slate-400 truncate mt-0.5">
                {row.account_name}
              </span>
            </div>
          </div>
        ),
      },
      {
        key: "account_holder_name",
        header: "Account Holder",
        sortable: true,
        filterable: true,
        width: "180px",
        render: (row) => (
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-slate-800 text-xs truncate block">
              {row.account_holder_name}
            </span>
            {row.branch_name && (
              <span className="text-[11px] text-slate-400 truncate block mt-0.5">
                {row.branch_name} Branch
              </span>
            )}
          </div>
        ),
      },
      {
        key: "account_number",
        header: "Account Number & IFSC",
        sortable: true,
        filterable: true,
        width: "180px",
        render: (row) => (
          <div className="flex flex-col gap-0.5">
            <span className="font-mono text-xs font-bold text-slate-800 tracking-tight">
              {row.account_number}
            </span>
            <span className="font-mono text-[11px] text-slate-500 font-medium">
              IFSC: {row.ifsc_code}
            </span>
          </div>
        ),
      },
      {
        key: "account_type",
        header: "Type & Gateway",
        sortable: true,
        filterable: true,
        width: "170px",
        render: (row) => (
          <div className="flex flex-col gap-1 items-start">
            <StatusPill variant="neutral" shape="rounded" size="xs">
              {row.account_type || "Current"}
            </StatusPill>
            {row.gateway_provider && (
              <div className="flex items-center gap-1 text-[11px] text-indigo-600 font-semibold">
                <Zap className="w-3 h-3 text-indigo-500" />
                <span>{row.gateway_provider}</span>
              </div>
            )}
            {row.upi_id && (
              <span className="text-[11px] font-mono text-slate-500 truncate max-w-[150px]">
                UPI: {row.upi_id}
              </span>
            )}
          </div>
        ),
      },
      {
        key: "association_name",
        header: "Association",
        sortable: true,
        filterable: true,
        width: "160px",
        render: (row) =>
          row.association_name ? (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 truncate">
              <Building className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <span className="truncate">{row.association_name}</span>
            </div>
          ) : (
            <span className="text-xs text-slate-400 italic">No Association</span>
          ),
      },
      {
        key: "status",
        header: "Status",
        sortable: true,
        filterable: true,
        width: "110px",
        render: (row) => {
          const statusLower = (row.status || "active").toLowerCase();
          const isSuccess = statusLower === "active";
          return (
            <StatusPill
              variant={isSuccess ? "success" : "neutral"}
              shape="rounded"
              size="xs"
              dot
            >
              {row.status || "Active"}
            </StatusPill>
          );
        },
      },
      {
        key: "actions",
        header: "Actions",
        sortable: false,
        width: "90px",
        className: "text-center",
        headerClassName: "text-center justify-center",
        render: (row) => (
          <div className="flex items-center justify-center gap-0.5">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onView(row)}
              className="rounded-lg h-7 w-7 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 cursor-pointer"
              title="View Bank Details"
            >
              <Eye size={13} />
            </Button>
            {canUpdate && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(row)}
                className="rounded-lg h-7 w-7 text-slate-500 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
                title="Edit Bank Account"
              >
                <Pencil size={13} />
              </Button>
            )}
            {canDelete && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setAccountToDelete(row)}
                className="rounded-lg h-7 w-7 text-rose-500 hover:text-rose-700 hover:bg-rose-50 cursor-pointer"
                title="Delete Bank Account"
              >
                <Trash2 size={13} />
              </Button>
            )}
          </div>
        ),
      },
    ],
    [onView, onEdit, canUpdate, canDelete]
  );

  return (
    <>
      <DataTable
        data={accounts}
        columns={columns}
        density="compact"
        searchPlaceholder="Search bank name, account label, number, IFSC..."
        searchKeys={[
          "bank_name",
          "account_name",
          "account_holder_name",
          "account_number",
          "ifsc_code",
          "association_name",
          "gateway_provider",
          "upi_id",
        ]}
        enableGlobalFilter={true}
        enableColumnFilters={true}
        enableSorting={true}
        pagination={{
          isServer: false,
          pageSize: 10,
          pageSizeOptions: [10, 25, 50],
        }}
        isLoading={isLoading}
        emptyTitle="No bank accounts found"
        emptyMessage="No bank accounts match your search criteria."
        onEmptyAction={canCreate ? onAdd : undefined}
        headerActions={
          canCreate && onAdd && (
            <Button onClick={onAdd}>
              <Plus size={15} className="mr-1.5" />
              <span>Add Bank Account</span>
            </Button>
          )
        }
      />

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={Boolean(accountToDelete)}
        onClose={() => setAccountToDelete(null)}
        onDelete={handleDeleteConfirm}
        itemName={accountToDelete?.account_name || accountToDelete?.bank_name}
        itemType="Bank Account"
        description={`Are you sure you want to delete the bank account ${accountToDelete?.account_name}? Any settlement rules associated with this account may be affected.`}
        isDeleting={isDeleting}
      />
    </>
  );
};

export default BankTable;
