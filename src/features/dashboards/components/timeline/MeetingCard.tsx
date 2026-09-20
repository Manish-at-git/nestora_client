import React from "react";
import { Users } from "lucide-react";

export interface MeetingItem {
  id: string | number;
  title?: string;
  description?: string;
  agenda?: string;
  meeting_date?: string;
  meeting_time?: string;
  duration?: string;
  venue?: string;
  organizer_name?: string;
  priority?: string;
  meeting_link?: string;
  my_attendance_status?: string;
}

export interface MeetingCardProps {
  item: MeetingItem;
  onRSVP: (meetingId: string | number, status: string) => void;
  formatShortDate: (isoString?: string) => { month: string; day: string | number };
  isRSVPLocked: (dateStr?: string, timeStr?: string) => boolean;
}

export const MeetingCard: React.FC<MeetingCardProps> = ({
  item,
  onRSVP,
  formatShortDate,
  isRSVPLocked,
}) => {
  const { month, day } = formatShortDate(item.meeting_date);
  const locked = isRSVPLocked(item.meeting_date, item.meeting_time);

  return (
    <div
      key={`m-${item.id}`}
      className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-6"
    >
      <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-slate-500 uppercase mb-4">
        <Users size={14} className="text-purple-500" /> Association Meeting
      </div>
      <div className="flex flex-col sm:flex-row gap-6">
        <div className="border border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center min-w-[100px] bg-purple-50 h-fit">
          <span className="text-xs font-semibold tracking-widest text-purple-600 uppercase">
            {month}
          </span>
          <span className="text-3xl font-display text-purple-700 my-1">{day}</span>
          <span className="text-xs text-purple-500 font-mono mt-1">
            {item.meeting_time}
          </span>
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <h3 className="text-xl font-display text-slate-800 mb-2">{item.title}</h3>
            {item.priority && (
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${
                  item.priority === "High"
                    ? "bg-red-100 text-red-700"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                {item.priority} Priority
              </span>
            )}
          </div>
          <p className="text-slate-600 text-sm mb-3">
            {item.description || item.agenda}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-600 mb-4 bg-slate-50 p-4 rounded-xl">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700 w-20">Duration:</span>{" "}
              {item.duration || "N/A"}
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700 w-20">Venue:</span>{" "}
              {item.venue || "N/A"}
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700 w-20">Organizer:</span>{" "}
              {item.organizer_name || "N/A"}
            </div>
            {item.meeting_link && (
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-700 w-20">Link:</span>
                <a
                  href={item.meeting_link}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 hover:underline font-medium truncate"
                >
                  Join Meeting
                </a>
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-semibold text-slate-700 tracking-wide">
                RSVP: Are you going?
              </span>
              {locked && (
                <span className="text-[10px] uppercase font-bold text-red-600 bg-red-50 px-2 py-1 rounded-full tracking-wider border border-red-100">
                  Locked (&lt; 24h)
                </span>
              )}
            </div>
            <div
              className={`flex gap-2 ${
                locked ? "opacity-60 pointer-events-none" : ""
              }`}
            >
              <button
                onClick={() => onRSVP(item.id, "Yes")}
                className={`px-4 py-2 text-xs font-semibold rounded-full transition-all cursor-pointer ${
                  item.my_attendance_status === "Yes"
                    ? "bg-emerald-500 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
                }`}
              >
                ✓ Going
              </button>
              <button
                onClick={() => onRSVP(item.id, "Maybe")}
                className={`px-4 py-2 text-xs font-semibold rounded-full transition-all cursor-pointer ${
                  item.my_attendance_status === "Maybe"
                    ? "bg-amber-500 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-amber-50 hover:text-amber-700"
                }`}
              >
                Maybe
              </button>
              <button
                onClick={() => onRSVP(item.id, "No")}
                className={`px-4 py-2 text-xs font-semibold rounded-full transition-all cursor-pointer ${
                  item.my_attendance_status === "No"
                    ? "bg-red-500 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-700"
                }`}
              >
                ✕ Not going
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeetingCard;

