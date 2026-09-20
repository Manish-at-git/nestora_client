import React from "react";
import { Lock, ShieldAlert, Key, CheckCircle } from "lucide-react";

export interface SecurityItemData {
  id: string;
  label: string;
  value: React.ReactNode;
  subtext: string;
}

export interface SecurityItemProps {
  item: SecurityItemData;
}

export const SecurityItem: React.FC<SecurityItemProps> = ({ item }) => {
  return (
    <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-1">
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
        {item.label}
      </span>
      <div className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
        {item.value}
      </div>
      <span className="text-[11px] text-slate-500 block pt-1">
        {item.subtext}
      </span>
    </div>
  );
};

export interface SecurityNoticeProps {
  title?: string;
  message: React.ReactNode;
}

export const SecurityNotice: React.FC<SecurityNoticeProps> = ({
  title = "Security Notice:",
  message,
}) => {
  return (
    <div className="flex items-start gap-3 p-3.5 rounded-xl border border-amber-200/80 bg-amber-50/60 text-amber-900 text-xs">
      <ShieldAlert size={18} className="text-amber-600 shrink-0 mt-0.5" />
      <p className="text-[11px] text-amber-800 leading-relaxed">
        <strong>{title}</strong> {message}
      </p>
    </div>
  );
};

export interface SuperAdminSecurityCardProps {
  email?: string;
  createdAt?: string;
}

export const SuperAdminSecurityCard: React.FC<SuperAdminSecurityCardProps> = ({
  email = "superadmin@nestora.io",
  createdAt,
}) => {
  const securityItems: SecurityItemData[] = [
    {
      id: "auth-identity",
      label: "Authentication Identity",
      value: (
        <>
          <Key size={13} className="text-slate-400" />
          <span className="truncate">{email}</span>
        </>
      ),
      subtext: "Standard root credential verified",
    },
    {
      id: "role-enforcement",
      label: "Role Enforcement",
      value: (
        <span className="font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md inline-block border border-indigo-200/60">
          code: super_admin
        </span>
      ),
      subtext: "Protected against runtime permission modification",
    },
    {
      id: "session-protocol",
      label: "Session Protocol",
      value: (
        <>
          <CheckCircle size={13} className="text-emerald-600" />
          <span>JWT Bearer Token Encrypted</span>
        </>
      ),
      subtext: "Automatic invalidation on logout",
    },
    {
      id: "account-init",
      label: "Account Initialization",
      value: (
        <span>
          {createdAt
            ? new Date(createdAt).toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
              })
            : "Master Seed Account"}
        </span>
      ),
      subtext: "Primary system administrator",
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 sm:p-7 space-y-5">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-900 text-emerald-400 flex items-center justify-center shrink-0 shadow-xs">
            <Lock size={18} />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 leading-tight">
              Security & Credentials
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Root security configurations and session encryption protocols
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {securityItems.map((item) => (
          <SecurityItem key={item.id} item={item} />
        ))}
      </div>

      <SecurityNotice
        title="Security Notice:"
        message="The Super Administrator role holds global authority over all tenants, associations, and system features. System policies prevent editing this role's RBAC matrix to preserve platform accessibility."
      />
    </div>
  );
};

export default SuperAdminSecurityCard;
