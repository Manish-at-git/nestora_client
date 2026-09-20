import React from "react";
import { ModalWrapper } from "@/components/common/ModalWrapper";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/common/StatusPill";
import {
  Building,
  Zap,
} from "lucide-react";
import type { BankAccount } from "../types";

export interface ViewBankModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: BankAccount | null;
  onEdit?: (account: BankAccount) => void;
}

export const ViewBankModal: React.FC<ViewBankModalProps> = ({
  isOpen,
  onClose,
  account,
  onEdit,
}) => {
  if (!account) return null;

  const isSuccess = (account.status || "active").toLowerCase() === "active";

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title={account.bank_name}
      subtitle={account.account_name}
      icon={
        <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm shadow-xs">
          {account.bank_name ? account.bank_name.charAt(0).toUpperCase() : "B"}
        </div>
      }
      badge={
        <div className="flex items-center gap-1.5">
          {account.is_default ? (
            <StatusPill variant="indigo" shape="rounded" size="xs">
              Primary
            </StatusPill>
          ) : <></>}
          <StatusPill
            variant={isSuccess ? "success" : "neutral"}
            shape="rounded"
            size="xs"
            dot
          >
            {account.status || "Active"}
          </StatusPill>
        </div>
      }
      size="2xl"
      footer={
        <div className="flex items-center justify-between w-full">
          {onEdit ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onClose();
                onEdit(account);
              }}
              className="rounded-xl border-slate-200 text-slate-700 hover:bg-slate-100 cursor-pointer"
            >
              Edit Account
            </Button>
          ) : (
            <div />
          )}
          <Button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white shadow-xs cursor-pointer"
          >
            Close
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Bank Account Details Card */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Settlement Account Info
          </h4>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                Account Beneficiary
              </span>
              <span className="text-xs font-semibold text-slate-800">
                {account.account_holder_name}
              </span>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                Account Number
              </span>
              <span className="text-xs font-mono font-bold text-slate-800">
                {account.account_number}
              </span>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                IFSC Code
              </span>
              <span className="text-xs font-mono font-bold text-slate-800">
                {account.ifsc_code}
              </span>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                Branch Name
              </span>
              <span className="text-xs font-medium text-slate-800">
                {account.branch_name || "—"}
              </span>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                Account Type
              </span>
              <span className="text-xs font-medium text-slate-800">
                {account.account_type || "Current"}
              </span>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                Currency
              </span>
              <span className="text-xs font-medium text-slate-800">
                {account.currency || "INR"}
              </span>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                Assigned Association
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Building size={12} className="text-indigo-500" />
                <span className="text-xs font-medium text-slate-800">
                  {account.association_name || "No Association"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Gateway & UPI Card */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Payment Gateway & Online Collections
          </h4>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                Gateway Provider
              </span>
              {account.gateway_provider ? (
                <div className="flex items-center gap-1 text-xs font-bold text-indigo-700 mt-0.5">
                  <Zap size={13} className="text-indigo-500" />
                  <span>{account.gateway_provider}</span>
                </div>
              ) : (
                <span className="text-xs text-slate-400 italic">None (Offline Bank Transfer)</span>
              )}
            </div>

            {account.merchant_id && (
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                  Merchant ID
                </span>
                <span className="text-xs font-mono font-bold text-slate-800">
                  {account.merchant_id}
                </span>
              </div>
            )}

            {account.upi_id && (
              <div className="sm:col-span-2">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                  UPI Virtual Payment Address (VPA)
                </span>
                <span className="text-xs font-mono font-bold text-slate-800">
                  {account.upi_id}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </ModalWrapper>
  );
};

export default ViewBankModal;
