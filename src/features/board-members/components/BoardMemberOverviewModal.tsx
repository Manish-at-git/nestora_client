import React from "react";
import {
  Building,
  Calendar,
  Clock,
  Mail,
  Phone,
  Shield,
  ShieldCheck,
  User,
} from "lucide-react";
import { ModalWrapper } from "@/components/common/ModalWrapper";
import { Button } from "@/components/ui/button";
import { formatDate, getTwoLetterInitials } from "@/utils";
import { resolveMediaUrl } from "@/lib/cloudUploader";
import type { BoardMember } from "../types";

export interface BoardMemberOverviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: BoardMember | null;
}

export const BoardMemberOverviewModal: React.FC<BoardMemberOverviewModalProps> = ({
  isOpen,
  onClose,
  member,
}) => {
  if (!member) return null;

  const isActive = member.status !== "past";

  const getStatusBadge = () => {
    if (isActive) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200/80">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          ACTIVE
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
        <Clock size={11} /> PAST
      </span>
    );
  };

  const termDisplay = member.term_start_date && member.term_end_date
    ? `${formatDate(member.term_start_date)} — ${formatDate(member.term_end_date)}`
    : member.board_member_since
    ? `Since ${formatDate(member.board_member_since)}`
    : "Active Term";

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title={member.name}
      icon={<Shield size={18} className="text-slate-800" />}
      badge={getStatusBadge()}
      size="md"
      footer={
        <div className="flex justify-end w-full">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="rounded-xl text-xs font-semibold cursor-pointer"
          >
            Close
          </Button>
        </div>
      }
    >
      <div className="space-y-4 py-2">
        {/* Profile Card Header */}
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
          {member.profile_pic_url ? (
            <img
              src={resolveMediaUrl(member.profile_pic_url)}
              alt={member.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm shrink-0"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-600 via-indigo-700 to-purple-600 text-white shadow-2xs flex items-center justify-center font-bold text-lg shrink-0">
              {getTwoLetterInitials(member.name)}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-lg text-slate-900 truncate">{member.name}</h3>
            <div className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/70 mt-1">
              <ShieldCheck size={13} /> Board Member
            </div>
          </div>
        </div>

        {/* Metadata Details Grid */}
        <div className="space-y-2.5">
          {member.association_name && (
            <div className="flex items-start gap-3 text-xs p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="bg-white p-2 rounded-lg text-slate-600 shadow-2xs shrink-0 border border-slate-100">
                <Building size={15} />
              </div>
              <div className="min-w-0">
                <p className="text-slate-400 font-medium mb-0.5">Association</p>
                <p className="text-slate-800 font-semibold truncate">{member.association_name}</p>
              </div>
            </div>
          )}

          <div className="flex items-start gap-3 text-xs p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div className="bg-white p-2 rounded-lg text-slate-600 shadow-2xs shrink-0 border border-slate-100">
              <Calendar size={15} />
            </div>
            <div>
              <p className="text-slate-400 font-medium mb-0.5">Term Period</p>
              <p className="text-slate-800 font-semibold">{termDisplay}</p>
            </div>
          </div>

          {member.email && (
            <div className="flex items-start gap-3 text-xs p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="bg-white p-2 rounded-lg text-slate-600 shadow-2xs shrink-0 border border-slate-100">
                <Mail size={15} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-slate-400 font-medium mb-0.5">Email Address</p>
                <a
                  href={`mailto:${member.email}`}
                  className="text-slate-800 font-semibold hover:text-slate-600 truncate block hover:underline"
                >
                  {member.email}
                </a>
              </div>
            </div>
          )}

          {member.contact_number && (
            <div className="flex items-start gap-3 text-xs p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="bg-white p-2 rounded-lg text-slate-600 shadow-2xs shrink-0 border border-slate-100">
                <Phone size={15} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-slate-400 font-medium mb-0.5">Contact Number</p>
                <a
                  href={`tel:${member.contact_number}`}
                  className="text-slate-800 font-semibold hover:text-slate-600 truncate block hover:underline"
                >
                  {member.contact_number}
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </ModalWrapper>
  );
};

export default BoardMemberOverviewModal;
