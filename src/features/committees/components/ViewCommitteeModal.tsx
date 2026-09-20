import React from "react";
import { Users, Building, Calendar, Mail, User, Clock, FileText } from "lucide-react";
import { ModalWrapper } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { useRetainedModalData } from "@/hooks/useRetainedModalData";
import type { Committee } from "../types";

export interface ViewCommitteeModalProps {
  isOpen: boolean;
  onClose: () => void;
  committee: Committee | null;
  onEdit?: (committee: Committee) => void;
  canEdit?: boolean;
}

export const ViewCommitteeModal: React.FC<ViewCommitteeModalProps> = ({
  isOpen,
  onClose,
  committee: activeCommittee,
  onEdit,
  canEdit = false,
}) => {
  const committee = useRetainedModalData(activeCommittee);

  if (!committee) return null;

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return isNaN(date.getTime())
      ? dateStr
      : date.toLocaleDateString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title={committee.name}
      subheader={`Committee in ${committee.association_name || "Association"}`}
      icon={<Users size={18} className="text-indigo-600" />}
      size="xl"
      footer={
        <div className="flex items-center justify-end gap-2 w-full">
          <Button
            variant="outline"
            onClick={onClose}
            className="rounded-xl text-xs font-semibold cursor-pointer"
          >
            Close
          </Button>
          {canEdit && onEdit && (
            <Button
              onClick={() => {
                onClose();
                onEdit(committee);
              }}
              className="rounded-xl text-xs font-semibold cursor-pointer"
            >
              Edit Committee
            </Button>
          )}
        </div>
      }
    >
      <div className="space-y-5 py-2">
        {/* Key Information Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Building size={16} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Association
              </p>
              <p className="text-xs font-semibold text-slate-800 truncate">
                {committee.association_name || "N/A"}
              </p>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Users size={16} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Members
              </p>
              <p className="text-xs font-semibold text-slate-800">
                {committee.member_count ?? committee.members?.length ?? 0} Members
              </p>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Calendar size={16} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Term Period
              </p>
              <p className="text-xs font-semibold text-slate-800 truncate">
                {committee.start_date || committee.end_date
                  ? `${formatDate(committee.start_date)} - ${formatDate(committee.end_date)}`
                  : "Active / Ongoing"}
              </p>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-4 space-y-1.5">
          <div className="flex items-center gap-2 text-slate-700 font-semibold text-xs">
            <FileText size={14} className="text-slate-400" />
            <span>Charter & Description</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">
            {committee.description || "No specific charter or description provided for this committee."}
          </p>
        </div>

        {/* Committee Members List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Users size={14} className="text-slate-500" />
              <span>Assigned Committee Members ({committee.members?.length || 0})</span>
            </h4>
          </div>

          {committee.members && committee.members.length > 0 ? (
            <div className="divide-y divide-slate-100 border border-slate-200/80 rounded-xl bg-white overflow-hidden max-h-56 overflow-y-auto">
              {committee.members.map((member) => (
                <div
                  key={member.id || member.user_id}
                  className="flex items-center justify-between p-3 hover:bg-slate-50/80 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar
                      size="sm"
                      src={member.profile_pic_url || undefined}
                      fallbackText={member.name}
                      className="shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-800 truncate">
                        {member.name}
                      </p>
                      {member.email && (
                        <p className="text-[11px] text-slate-400 truncate flex items-center gap-1">
                          <Mail size={11} />
                          {member.email}
                        </p>
                      )}
                    </div>
                  </div>

                  {(member.start_date || member.end_date) && (
                    <div className="text-right shrink-0">
                      <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                        <Clock size={11} className="text-slate-400" />
                        {formatDate(member.start_date)} - {formatDate(member.end_date)}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
              <User size={24} className="mx-auto text-slate-300 mb-1" />
              <p className="text-xs text-slate-500 font-medium">
                No members currently assigned to this committee.
              </p>
            </div>
          )}
        </div>
      </div>
    </ModalWrapper>
  );
};

export default ViewCommitteeModal;
