import React, { useState, useEffect } from "react";
import {
  Building,
  Mail,
  Phone,
  Copy,
  Check,
  Send,
  MapPin,
  Shield,
  Loader2,
} from "lucide-react";
import { ModalWrapper } from "@/components/common/ModalWrapper";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useSendActivationCodeMutation } from "../api/usersApi";
import type { SystemUser } from "../types";

export interface ViewUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: SystemUser | null;
  onEdit?: (user: SystemUser) => void;
}

export const ViewUserModal: React.FC<ViewUserModalProps> = ({
  isOpen,
  onClose,
  user,
  onEdit,
}) => {
  const [lastUser, setLastUser] = useState<SystemUser | null>(user);
  const [copiedCode, setCopiedCode] = useState(false);
  const [sendActivationCode, { isLoading: isSending }] =
    useSendActivationCodeMutation();

  useEffect(() => {
    if (user) {
      setLastUser(user);
    }
  }, [user]);

  const activeUser = user || lastUser;
  if (!activeUser) return null;

  const fullName =
    activeUser.first_name || activeUser.last_name
      ? `${activeUser.first_name || ""} ${activeUser.last_name || ""}`.trim()
      : activeUser.name ||
        (activeUser.email ? activeUser.email.split("@")[0] : "Resident User");

  const handleCopyCode = () => {
    if (!activeUser.activation_code) return;
    navigator.clipboard.writeText(activeUser.activation_code);
    setCopiedCode(true);
    toast.success("Activation code copied to clipboard!");
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleSendCode = async () => {
    if (!activeUser.activation_code) {
      toast.error("User does not have an activation code.");
      return;
    }
    if (!activeUser.email) {
      toast.error("User does not have an email address.");
      return;
    }

    try {
      const res = await sendActivationCode(activeUser.user_id).unwrap();
      toast.success(res.message || "Activation code sent to user email!");
    } catch (err: any) {
      toast.error(
        err?.data || err?.message || "Failed to send activation code"
      );
    }
  };

  const formattedAddress = [
    activeUser.assoc_addr1,
    activeUser.assoc_addr2,
    activeUser.assoc_city,
    activeUser.assoc_state,
    activeUser.assoc_pincode,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title={fullName}
      description={activeUser.role_name || "Community Resident"}
      icon={
        <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm shrink-0 border border-indigo-100">
          {fullName.charAt(0).toUpperCase()}
        </div>
      }
      badge={
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
          <Shield className="w-3 h-3" />
          {activeUser.role_name || "Homeowner"}
        </span>
      }
      size="xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="rounded-xl border-slate-200 hover:bg-slate-50 text-slate-700 font-medium cursor-pointer"
          >
            Close
          </Button>

          {onEdit && (
            <Button
              onClick={() => {
                onClose();
                onEdit(activeUser);
              }}
              className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold px-4 cursor-pointer shadow-xs"
            >
              Edit User Profile
            </Button>
          )}
        </div>
      }
    >
      <div className="space-y-4">
        {/* Activation Code Box */}
        {activeUser.activation_code && (
          <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider block">
                Portal Activation Code
              </span>
              <div className="font-mono font-extrabold text-base text-amber-950 tracking-wider mt-0.5">
                {activeUser.activation_code}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleCopyCode}
                className="h-8 gap-1.5 bg-white border-amber-200 text-amber-900 hover:bg-amber-100/50 rounded-lg text-xs cursor-pointer"
              >
                {copiedCode ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>{copiedCode ? "Copied" : "Copy"}</span>
              </Button>
              {activeUser.email && (
                <Button
                  type="button"
                  onClick={handleSendCode}
                  disabled={isSending}
                  className="h-8 gap-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs shadow-xs cursor-pointer"
                >
                  {isSending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span>Email Code</span>
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Contact Details Card */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Contact Information
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/60">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-white border border-slate-200/60 text-slate-500 shadow-2xs">
                <Mail className="w-4 h-4 text-indigo-500" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                  Email
                </span>
                <span className="text-xs font-semibold text-slate-800 truncate block">
                  {activeUser.email || "—"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-white border border-slate-200/60 text-slate-500 shadow-2xs">
                <Phone className="w-4 h-4 text-indigo-500" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                  Phone
                </span>
                <span className="text-xs font-semibold text-slate-800 truncate block">
                  {activeUser.contact_number || "—"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Community & Residence Card */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Community & Residence
          </h4>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-white border border-slate-200/60 text-slate-500 shadow-2xs mt-0.5 shrink-0">
                <Building className="w-4 h-4 text-indigo-500" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                  Association
                </span>
                <span className="text-sm font-bold text-slate-900 block">
                  {activeUser.association_name || "Not assigned"}
                </span>
                {formattedAddress && (
                  <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{formattedAddress}</span>
                  </div>
                )}

                {(activeUser.block_name || activeUser.unit_number) && (
                  <div className="pt-3 mt-3 border-t border-slate-200/60 flex items-center gap-8">
                    {activeUser.block_name && (
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                          Block
                        </span>
                        <span className="text-xs font-bold text-slate-800">
                          {activeUser.block_name}
                        </span>
                      </div>
                    )}
                    {activeUser.unit_number && (
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                          Unit Number
                        </span>
                        <span className="text-xs font-bold text-slate-800">
                          #{activeUser.unit_number}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ModalWrapper>
  );
};

export default ViewUserModal;
