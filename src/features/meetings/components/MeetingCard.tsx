import React from "react";
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  User,
  Video,
  Paperclip,
  PieChart,
  Check,
  HelpCircle,
  X as XIcon,
  Edit2,
  FileText,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Meeting } from "../types";

export interface MeetingCardProps {
  meeting: Meeting;
  canRSVP: boolean;
  isAdmin?: boolean;
  isBoardOrAdmin?: boolean;
  canEdit?: boolean;
  canAddMinutes?: boolean;
  canViewOverview?: boolean;
  onRSVP: (meetingId: string | number, status: string) => void;
  onEdit: (meeting: Meeting) => void;
  onAddMinutes: (meeting: Meeting) => void;
  onOverview: (meeting: Meeting) => void;
}

export const MeetingCard: React.FC<MeetingCardProps> = ({
  meeting,
  canRSVP,
  isAdmin = false,
  isBoardOrAdmin = false,
  canEdit: canEditProp,
  canAddMinutes: canAddMinutesProp,
  canViewOverview: canViewOverviewProp,
  onRSVP,
  onEdit,
  onAddMinutes,
  onOverview,
}) => {
  const allowEdit = canEditProp;
  const allowMinutes = canAddMinutesProp;
  const allowOverview = canViewOverviewProp;
  const formatTime = (timeStr?: string) => {
    if (!timeStr) return "";
    try {
      const date = new Date(`2000-01-01T${timeStr}`);
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return timeStr;
    }
  };

  const isRSVPLocked = (dateStr?: string, timeStr?: string) => {
    if (!dateStr || !timeStr) return false;
    try {
      const meetingDate = new Date(`${dateStr.split("T")[0]}T${timeStr}`);
      const now = new Date();
      const diffHours = (meetingDate.getTime() - now.getTime()) / (1000 * 60 * 60);
      return diffHours < 24;
    } catch {
      return false;
    }
  };

  const canEdit = (createdAt?: string) => {
    if (!createdAt) return false;
    try {
      const diffHours =
        (new Date().getTime() - new Date(createdAt).getTime()) / (1000 * 60 * 60);
      return diffHours < 2;
    } catch {
      return false;
    }
  };

  const isCompleted = meeting.status === "Completed";
  const locked = isRSVPLocked(meeting.meeting_date, meeting.meeting_time);
  const editable = canEdit(meeting.created_at);

  const priorityStyles: Record<string, string> = {
    High: "bg-rose-50 text-rose-700 border-rose-200",
    Medium: "bg-amber-50 text-amber-800 border-amber-200",
    Low: "bg-sky-50 text-sky-700 border-sky-200",
  };

  return (
    <div
      className={cn(
        "rounded-3xl border p-6 transition-all duration-200 flex flex-col justify-between shadow-sm hover:shadow-md",
        isCompleted
          ? "bg-emerald-50/20 border-emerald-200/80"
          : "bg-white border-slate-200/90"
      )}
      data-testid={`meeting-card-${meeting.id}`}
    >
      <div>
        {/* Card Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
          <div className="space-y-1 pr-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                {meeting.meeting_type}
              </span>
              {meeting.target_block_name && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                  {meeting.target_block_name} Block
                </span>
              )}
            </div>
            <h3 className="text-xl font-bold font-display text-slate-900 tracking-tight leading-snug">
              {meeting.title}
            </h3>
          </div>

          <div className="flex items-center gap-2 self-start shrink-0">
            {isCompleted && (
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                Completed
              </span>
            )}
            <span
              className={cn(
                "px-2.5 py-1 rounded-full text-xs font-semibold border whitespace-nowrap",
                priorityStyles[meeting.priority] || priorityStyles.Medium
              )}
            >
              {meeting.priority} Priority
            </span>
          </div>
        </div>

        {/* Schedule & Venue Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600 bg-slate-50/80 border border-slate-100 p-4 rounded-2xl mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-white flex items-center justify-center text-slate-500 shadow-2xs shrink-0">
              <CalendarIcon size={14} />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-semibold uppercase">Date</p>
              <p className="font-medium text-slate-800">
                {new Date(meeting.meeting_date).toLocaleDateString(undefined, {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-white flex items-center justify-center text-slate-500 shadow-2xs shrink-0">
              <Clock size={14} />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-semibold uppercase">Time & Duration</p>
              <p className="font-medium text-slate-800">
                {formatTime(meeting.meeting_time)} ({meeting.duration})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:col-span-2">
            <div className="w-7 h-7 rounded-xl bg-white flex items-center justify-center text-slate-500 shadow-2xs shrink-0">
              <MapPin size={14} />
            </div>
            <div className="truncate">
              <p className="text-[10px] text-slate-400 font-semibold uppercase">Venue</p>
              <p className="font-medium text-slate-800 truncate">{meeting.venue}</p>
            </div>
          </div>

          {(meeting.organizer_name || meeting.organizer) && (
            <div className="flex items-center gap-2.5 sm:col-span-2">
              <div className="w-7 h-7 rounded-xl bg-white flex items-center justify-center text-slate-500 shadow-2xs shrink-0">
                <User size={14} />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-semibold uppercase">Organizer</p>
                <p className="font-medium text-slate-800">
                  {meeting.organizer_name || "Assigned Organizer"}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Agenda Section */}
        {meeting.agenda && (
          <div className="bg-white border border-slate-200/80 p-3.5 rounded-2xl mb-3 text-xs">
            <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px] block mb-1">
              Agenda
            </span>
            <p className="text-slate-600 whitespace-pre-wrap leading-relaxed">{meeting.agenda}</p>
          </div>
        )}

        {/* Description Section */}
        {meeting.description && (
          <p className="text-slate-600 text-xs leading-relaxed mb-4 whitespace-pre-wrap">
            {meeting.description}
          </p>
        )}

        {/* Meeting Minutes (if completed) */}
        {isCompleted && meeting.meeting_minutes && (
          <div className="mt-3 p-4 bg-emerald-50/50 border border-emerald-200/90 rounded-2xl text-xs space-y-2">
            <div className="flex items-center gap-2 text-emerald-800 font-semibold text-xs">
              <FileText size={14} />
              <span>Official Meeting Minutes</span>
            </div>
            {meeting.discussed_topic && (
              <p className="font-medium text-slate-800">
                <span className="text-slate-500">Topic: </span>
                {meeting.discussed_topic}
              </p>
            )}
            <p className="text-slate-600 whitespace-pre-wrap leading-relaxed bg-white/70 p-3 rounded-xl border border-emerald-100">
              {meeting.meeting_minutes}
            </p>
          </div>
        )}

        {/* Action Links */}
        <div className="flex flex-wrap gap-2.5 items-center mt-4">
          {meeting.meeting_link && (
            <a
              href={meeting.meeting_link}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-colors"
            >
              <Video size={14} /> Join Meeting
            </a>
          )}
          {meeting.attachment_url && (
            <a
              href={meeting.attachment_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors"
            >
              <Paperclip size={13} /> Attachment
            </a>
          )}
          {allowOverview && (
            <button
              onClick={() => onOverview(meeting)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <PieChart size={13} /> Attendance Overview
            </button>
          )}
        </div>
      </div>

      {/* Bottom RSVP & Admin Controls */}
      <div className="mt-5 pt-4 border-t border-slate-100 space-y-3">
        {canRSVP && (
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-slate-700">RSVP: Are you attending?</span>
              {locked && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                  <Lock size={10} /> Locked (&lt; 24h)
                </span>
              )}
            </div>
            <div className={cn("flex gap-2", locked && "opacity-60 pointer-events-none")}>
              <button
                onClick={() => onRSVP(meeting.id, "Yes")}
                className={cn(
                  "px-3.5 py-1.5 text-xs font-medium rounded-full transition-all cursor-pointer inline-flex items-center gap-1",
                  meeting.my_attendance_status === "Yes"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
                )}
              >
                <Check size={12} /> Going
              </button>
              <button
                onClick={() => onRSVP(meeting.id, "Maybe")}
                className={cn(
                  "px-3.5 py-1.5 text-xs font-medium rounded-full transition-all cursor-pointer inline-flex items-center gap-1",
                  meeting.my_attendance_status === "Maybe"
                    ? "bg-amber-500 text-white shadow-xs"
                    : "bg-slate-100 text-slate-700 hover:bg-amber-50 hover:text-amber-700"
                )}
              >
                <HelpCircle size={12} /> Maybe
              </button>
              <button
                onClick={() => onRSVP(meeting.id, "No")}
                className={cn(
                  "px-3.5 py-1.5 text-xs font-medium rounded-full transition-all cursor-pointer inline-flex items-center gap-1",
                  meeting.my_attendance_status === "No"
                    ? "bg-rose-500 text-white shadow-xs"
                    : "bg-slate-100 text-slate-700 hover:bg-rose-50 hover:text-rose-700"
                )}
              >
                <XIcon size={12} /> Not going
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 text-[11px] text-slate-400">
          <div>
            {meeting.created_by_name && (
              <span>Created by <strong className="text-slate-600 font-medium">{meeting.created_by_name}</strong></span>
            )}
            {meeting.created_at && (
              <span className="ml-2">
                on {new Date(meeting.created_at).toLocaleDateString()}
              </span>
            )}
          </div>

          {(allowEdit || allowMinutes) && (
            <div className="flex items-center gap-2 self-end sm:self-auto">
              {allowEdit && editable && (
                <button
                  onClick={() => onEdit(meeting)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  <Edit2 size={11} /> Edit Details
                </button>
              )}
              {allowMinutes && !isCompleted && (
                <button
                  onClick={() => onAddMinutes(meeting)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-colors cursor-pointer"
                >
                  <FileText size={11} /> Add Minutes
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MeetingCard;
