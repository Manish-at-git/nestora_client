import React, { useMemo, useState } from "react";
import {
  Eye,
  Pencil,
  Building,
  Mail,
  Phone,
  Copy,
  Check,
  Send,
  Home,
  Shield,
  Loader2,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable, Column, StatusPill } from "@/components/common";
import { usePermission } from "@/hooks/usePermission";
import { toast } from "sonner";
import { useSendActivationCodeMutation } from "../api/usersApi";
import type { SystemUser } from "../types";

export interface UserTableProps {
  users: SystemUser[];
  isLoading?: boolean;
  onAdd?: () => void;
  onView: (user: SystemUser) => void;
  onEdit: (user: SystemUser) => void;
}

export const UserTable: React.FC<UserTableProps> = ({
  users,
  isLoading = false,
  onAdd,
  onView,
  onEdit,
}) => {
  const { canCreate, canUpdate } = usePermission();
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [sendingCodeUserId, setSendingCodeUserId] = useState<string | null>(
    null
  );

  const [sendActivationCode] = useSendActivationCodeMutation();

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    toast.success("Activation code copied to clipboard!");
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const handleSendCode = async (user: SystemUser) => {
    if (!user.activation_code) {
      toast.error("User has no activation code to send.");
      return;
    }
    if (!user.email) {
      toast.error("User does not have an email address.");
      return;
    }

    try {
      setSendingCodeUserId(user.user_id);
      const res = await sendActivationCode(user.user_id).unwrap();
      toast.success(res.message || "Activation code sent successfully!");
    } catch (err: any) {
      toast.error(
        err?.data || err?.message || "Failed to send activation code"
      );
    } finally {
      setSendingCodeUserId(null);
    }
  };

  const columns = useMemo<Column<SystemUser>[]>(
    () => [
      {
        key: "sr_no",
        header: "Sr. No.",
        sortable: false,
        width: "60px",
        className: "text-center",
        render: (_row, index) => (
          <span className="font-medium text-slate-500 text-xs">
            {index + 1}
          </span>
        ),
      },
      {
        key: "name",
        header: "User Details",
        sortable: true,
        filterable: true,
        width: "170px",
        render: (row) => {
          const fullName =
            row.first_name || row.last_name
              ? `${row.first_name || ""} ${row.last_name || ""}`.trim()
              : row.name || (row.email ? row.email.split("@")[0] : "Resident");

          return (
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs shrink-0 border border-indigo-100/60">
                {fullName.charAt(0).toUpperCase()}
              </div>
              <span className="font-semibold text-slate-900 text-xs truncate">
                {fullName}
              </span>
            </div>
          );
        },
      },
      {
        key: "contact",
        header: "Contact Info",
        sortable: false,
        width: "185px",
        render: (row) => (
          <div className="flex flex-col gap-0.5 min-w-0 max-w-[210px]">
            {row.email ? (
              <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium truncate">
                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{row.email}</span>
              </div>
            ) : null}
            {row.contact_number ? (
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 truncate">
                <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                <span className="truncate">{row.contact_number}</span>
              </div>
            ) : !row.email ? (
              <span className="text-xs text-slate-400 italic">
                No contact info
              </span>
            ) : null}
          </div>
        ),
      },
      {
        key: "role_name",
        header: "Role",
        sortable: true,
        filterable: true,
        width: "135px",
        render: (row) => (
          <StatusPill
            variant="neutral"
            shape="rounded"
            size="xs"
            icon={<Shield size={12} className="text-indigo-600" />}
          >
            {row.role_name || "Homeowner"}
          </StatusPill>
        ),
      },
      {
        key: "association_name",
        header: "Community",
        sortable: true,
        filterable: true,
        width: "155px",
        render: (row) =>
          row.association_name ? (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 truncate">
              <Building className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <span className="truncate">{row.association_name}</span>
            </div>
          ) : (
            <span className="text-xs text-slate-400 italic">
              No association
            </span>
          ),
      },
      {
        key: "residence",
        header: "Residence",
        sortable: true,
        filterable: true,
        width: "140px",
        render: (row) => {
          const hasBlock = Boolean(row.block_name);
          const hasUnit = Boolean(row.unit_number);

          if (!hasBlock && !hasUnit) {
            return <span className="text-xs text-slate-400 italic">—</span>;
          }

          return (
            <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium truncate">
              <Home className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">
                {hasBlock && `Blk ${row.block_name}`}
                {hasBlock && hasUnit && " • "}
                {hasUnit && `Unit ${row.unit_number}`}
              </span>
            </div>
          );
        },
      },
      {
        key: "activation_code",
        header: "Activation Code",
        sortable: true,
        filterable: true,
        width: "145px",
        render: (row) => {
          const isCopying = copiedCodeId === row.user_id;
          const isSending = sendingCodeUserId === row.user_id;

          if (!row.activation_code) {
            return (
              <span className="text-xs text-slate-400 italic">No code</span>
            );
          }

          return (
            <div className="flex items-center gap-1.5">
              <span className={`px-2 py-0.5 rounded-md text-xs font-mono font-bold border tracking-wider ${
                row.activation_status === "used"
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200/80"
                  : "bg-amber-50 text-amber-900 border-amber-200/80"
              }`}>
                {row.activation_code}
              </span>
              <button
                type="button"
                onClick={() =>
                  handleCopyCode(row.activation_code!, row.user_id)
                }
                title="Copy Code"
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                {isCopying ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
              {row.email && (
                <button
                  type="button"
                  onClick={() => handleSendCode(row)}
                  disabled={isSending}
                  title="Send code via email"
                  className="p-1 rounded-md text-indigo-500 hover:text-indigo-700 hover:bg-indigo-50 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isSending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                </button>
              )}
            </div>
          );
        },
      },
      {
        key: "actions",
        header: "Actions",
        sortable: false,
        width: "72px",
        className: "text-center",
        headerClassName: "text-center justify-center",
        render: (row) => (
          <div className="flex items-center justify-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onView(row)}
              className="rounded-lg h-7 w-7 text-slate-500 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
              title="View User Details"
            >
              <Eye size={14} />
            </Button>
            {canUpdate && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(row)}
                className="rounded-lg h-7 w-7 text-slate-500 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
                title="Edit User"
              >
                <Pencil size={13} />
              </Button>
            )}
          </div>
        ),
      },
    ],
    [onView, onEdit, copiedCodeId, sendingCodeUserId, canUpdate]
  );

  return (
    <DataTable
      data={users}
      columns={columns}
      density="compact"
      searchPlaceholder="Search users by name, email, community, code..."
      searchKeys={[
        "first_name",
        "last_name",
        "name",
        "email",
        "contact_number",
        "association_name",
        "role_name",
        "activation_code",
        "block_name",
        "unit_number",
      ]}
      enableGlobalFilter={true}
      enableColumnFilters={true}
      enableSorting={true}
      pagination={{
        isServer: false,
        pageSize: 15,
        pageSizeOptions: [15, 25, 50],
      }}
      isLoading={isLoading}
      emptyTitle="No users found"
      emptyMessage="No system users have been registered yet."
      emptyActionLabel={canCreate && onAdd ? "+ Add User" : undefined}
      onEmptyAction={canCreate ? onAdd : undefined}
      headerActions={
        canCreate && onAdd && (
          <Button onClick={onAdd}>
            <Plus size={15} className="mr-1.5" />
            <span>Add User</span>
          </Button>
        )
      }
    />
  );
};

export default UserTable;
