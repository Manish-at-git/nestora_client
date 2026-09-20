import React from "react";
import {
  Calendar,
  Clock,
  Mail,
  Phone,
  StopCircle,
  ShieldCheck,
  Building,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDate, getTwoLetterInitials } from "@/utils";
import { resolveMediaUrl } from "@/lib/cloudUploader";
import type { BoardMember } from "../types";

export interface BoardMemberCardProps {
  member: BoardMember;
  canManage?: boolean;
  onEndTerm?: (member: BoardMember) => void;
  onOverview?: (member: BoardMember) => void;
}

export const BoardMemberCard: React.FC<BoardMemberCardProps> = ({
  member,
  canManage,
  onEndTerm,
  onOverview,
}) => {
  const isActive = member.status !== "past";

  const termDisplay = member.term_start_date && member.term_end_date
    ? `${formatDate(member.term_start_date)} — ${formatDate(member.term_end_date)}`
    : member.board_member_since
    ? `Since ${formatDate(member.board_member_since)}`
    : "Active Term";

  return (
    <div
      onClick={() => onOverview?.(member)}
      className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group cursor-pointer"
      data-testid={`board-member-card-${member.account_id || member.id}`}
    >
      <div>
        {/* Top Header: Status & Actions */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-1.5 flex-wrap">
            {isActive ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                ACTIVE
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
                <Clock size={11} /> PAST
              </span>
            )}
            {member.association_name && (
              <span className="text-[11px] text-slate-500 font-medium bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-full truncate max-w-[140px]">
                {member.association_name}
              </span>
            )}
          </div>

          {canManage && isActive && member.id && onEndTerm && (
            <div onClick={(e) => e.stopPropagation()}>
              <Button
                type="button"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  onEndTerm(member);
                }}
                className="h-7 px-2 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg cursor-pointer"
                title="End term early"
              >
                <StopCircle size={13} className="mr-1" /> End Term
              </Button>
            </div>
          )}
        </div>

        {/* Member Profile Info */}
        <div className="flex items-center gap-3.5 mb-4">
          {member.profile_pic_url ? (
            <img
              src={resolveMediaUrl(member.profile_pic_url)}
              alt={member.name}
              className="w-12 h-12 rounded-full object-cover border border-slate-200/80 shadow-2xs shrink-0"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-600 via-indigo-700 to-purple-600 text-white shadow-2xs flex items-center justify-center font-bold text-sm shrink-0">
              {getTwoLetterInitials(member.name)}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-base text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
              {member.name}
            </h3>
            <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
              <ShieldCheck size={13} className="text-emerald-600 shrink-0" />
              <span className="truncate">Board Member</span>
            </div>
          </div>
        </div>

        {/* Horizontal Divider */}
        <div className="border-t border-slate-100 my-3" />

        {/* Metadata Details List */}
        <div className="space-y-2 text-xs text-slate-600">
          {/* Term Period */}
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-slate-400 shrink-0" />
            <span className="truncate">
              Term: <span className="font-medium text-slate-800">{termDisplay}</span>
            </span>
          </div>

          {/* Email */}
          {member.email && (
            <div className="flex items-center gap-2">
              <Mail size={14} className="text-slate-400 shrink-0" />
              <a
                href={`mailto:${member.email}`}
                onClick={(e) => e.stopPropagation()}
                className="text-slate-600 hover:text-indigo-600 truncate hover:underline"
              >
                {member.email}
              </a>
            </div>
          )}

          {/* Contact Number */}
          {member.contact_number && (
            <div className="flex items-center gap-2">
              <Phone size={14} className="text-slate-400 shrink-0" />
              <a
                href={`tel:${member.contact_number}`}
                onClick={(e) => e.stopPropagation()}
                className="text-slate-600 hover:text-indigo-600 truncate hover:underline"
              >
                {member.contact_number}
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BoardMemberCard;
