import React from "react";
import {
  Calendar,
  Clock,
  Mail,
  Phone,
  Pencil,
  Users,
  Crown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDate, getTwoLetterInitials } from "@/utils";
import { resolveMediaUrl } from "@/lib/cloudUploader";
import type { CommitteeMember } from "../types";

export interface CommitteeMemberCardProps {
  member: CommitteeMember;
  canManage?: boolean;
  onEdit?: (member: CommitteeMember) => void;
  onOverview?: (member: CommitteeMember) => void;
}

export const CommitteeMemberCard: React.FC<CommitteeMemberCardProps> = ({
  member,
  canManage,
  onEdit,
  onOverview,
}) => {
  const startDate = member.role_start_date || member.start_date;
  const endDate = member.role_end_date || member.end_date;

  const isPast =
    member.status === "past" ||
    (endDate ? new Date(endDate) < new Date(new Date().setHours(0, 0, 0, 0)) : false);
  const isActive = !isPast;

  const termDisplay =
    startDate && endDate
      ? `${formatDate(startDate)} — ${formatDate(endDate)}`
      : startDate
        ? `Since ${formatDate(startDate)}`
        : "Active Member";

  return (
    <div
      onClick={() => onOverview?.(member)}
      className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group cursor-pointer"
      data-testid={`committee-member-card-${member.user_id || member.id}`}
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
        </div>

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
            <div className="inline-flex items-center gap-1.5 text-xs text-slate-600 font-medium bg-slate-100/80 px-2 py-0.5 rounded-md mt-1 truncate max-w-full">
              {member.is_head ? (
                <Crown size={12} className="text-amber-500 shrink-0" />
              ) : (
                <Users size={12} className="text-slate-500 shrink-0" />
              )}
              <span className="truncate">{member.committee_name || "Committee Member"}</span>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 my-3" />

        <div className="space-y-2 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-slate-400 shrink-0" />
            <span className="truncate">
              Term: <span className="font-medium text-slate-800">{termDisplay}</span>
            </span>
          </div>

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

          {member.phone && (
            <div className="flex items-center gap-2">
              <Phone size={14} className="text-slate-400 shrink-0" />
              <a
                href={`tel:${member.phone}`}
                onClick={(e) => e.stopPropagation()}
                className="text-slate-600 hover:text-indigo-600 truncate hover:underline"
              >
                {member.phone}
              </a>
            </div>
          )}
        </div>

        {canManage && isActive && onEdit && (
          <div className="flex items-center justify-end gap-1 w-full">
            <Button
              type="button"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(member);
              }}
              className="h-7 px-3 font-medium text-xs text-slate-600 hover:text-slate-900 rounded-lg cursor-pointer"
            >
              <Pencil size={13} className="mr-1" /> Edit
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommitteeMemberCard;
