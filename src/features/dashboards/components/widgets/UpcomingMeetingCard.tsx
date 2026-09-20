import React from "react";
import { Users } from "lucide-react";

export interface UpcomingMeetingData {
  id: string | number;
  title: string;
  venue?: string;
  meeting_date: string;
  meeting_time?: string;
  duration?: string;
  [key: string]: any;
}

export interface UpcomingMeetingCardProps {
  meeting: UpcomingMeetingData | null;
  onViewAgenda: (meeting: UpcomingMeetingData) => void;
}

export const UpcomingMeetingCard: React.FC<UpcomingMeetingCardProps> = ({
  meeting,
  onViewAgenda,
}) => {
  const meetingDateObj = meeting ? new Date(meeting.meeting_date) : null;
  const day = meetingDateObj ? meetingDateObj.getDate() : null;
  const month = meetingDateObj
    ? meetingDateObj.toLocaleString("default", { month: "short" })
    : null;

  const formattedTime = meeting?.meeting_time
    ? new Date(`2000-01-01T${meeting.meeting_time}`).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "TBA";

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-slate-500 uppercase mb-4">
        <Users size={14} className="text-slate-500" /> Upcoming Meeting
      </div>

      {meeting ? (
        <>
          <div className="mb-4">
            <h4 className="text-base font-display text-slate-800 mb-1">
              {meeting.title}
            </h4>
            <p className="text-xs text-slate-500">{meeting.venue || "Virtual"}</p>
          </div>

          <div className="flex items-center gap-4 mb-5">
            <div className="text-center">
              <div className="text-2xl font-display text-slate-800">{day}</div>
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                {month}
              </div>
            </div>
            <div className="w-px h-10 bg-slate-200" />
            <div>
              <div className="text-sm font-medium text-slate-700">{formattedTime}</div>
              <div className="text-xs text-slate-500">
                Duration: {meeting.duration || "N/A"}
              </div>
            </div>
          </div>

          <button
            onClick={() => onViewAgenda(meeting)}
            className="w-full py-2 bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl font-medium hover:bg-slate-100 transition-colors cursor-pointer"
          >
            View Agenda
          </button>
        </>
      ) : (
        <div className="py-8 text-center border-2 border-dashed border-slate-100 rounded-xl">
          <p className="text-sm text-slate-400">No Upcoming Meeting</p>
        </div>
      )}
    </div>
  );
};

export default UpcomingMeetingCard;

