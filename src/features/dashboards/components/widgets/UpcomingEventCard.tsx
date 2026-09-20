import React from "react";
import { Calendar as CalendarIcon } from "lucide-react";

export interface UpcomingEventData {
  id: string | number;
  title: string;
  location?: string;
  starts_at: string;
  is_paid?: boolean;
  fee_amount?: number | string;
  [key: string]: any;
}

export interface UpcomingEventCardProps {
  event: UpcomingEventData | null;
  currencySymbol: string;
  onViewEvent: (event: UpcomingEventData) => void;
}

export const UpcomingEventCard: React.FC<UpcomingEventCardProps> = ({
  event,
  currencySymbol,
  onViewEvent,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-slate-500 uppercase mb-4">
        <CalendarIcon size={14} className="text-slate-500" /> Upcoming Event
      </div>

      {event ? (
        <>
          <div className="mb-4">
            <h4 className="text-base font-display text-slate-800 mb-1">
              {event.title}
            </h4>
            <p className="text-xs text-slate-500">{event.location || "TBA"}</p>
          </div>

          <div className="flex items-center gap-4 mb-5">
            <div className="text-center">
              <div className="text-2xl font-display text-slate-800">
                {new Date(event.starts_at).getDate()}
              </div>
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                {new Date(event.starts_at).toLocaleString("default", {
                  month: "short",
                })}
              </div>
            </div>
            <div className="w-px h-10 bg-slate-200" />
            <div>
              <div className="text-sm font-medium text-slate-700">
                {new Date(event.starts_at).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
              <div className="text-xs text-slate-500">
                {event.is_paid ? `${currencySymbol}${event.fee_amount}` : "Free"}
              </div>
            </div>
          </div>

          <button
            onClick={() => onViewEvent(event)}
            className="w-full py-2 bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl font-medium hover:bg-slate-100 transition-colors cursor-pointer"
          >
            View Event
          </button>
        </>
      ) : (
        <div className="py-8 text-center border-2 border-dashed border-slate-100 rounded-xl">
          <p className="text-sm text-slate-400">No Upcoming Event</p>
        </div>
      )}
    </div>
  );
};

export default UpcomingEventCard;

