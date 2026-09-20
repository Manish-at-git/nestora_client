import React from "react";
import { Check, X, HelpCircle, Users } from "lucide-react";
import { toast } from "sonner";
import { useSubmitRSVPMutation } from "../api/eventsApi";
import type { EventItem, RSVPStatus } from "../types";
import { cn } from "@/lib/utils";

export interface RsvpControlProps {
  event: EventItem;
  onUpdated?: () => void;
}

const OPTIONS: Array<{
  value: RSVPStatus;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  activeClass: string;
}> = [
  {
    value: "going",
    label: "Going",
    icon: Check,
    activeClass: "bg-emerald-600 text-white border-emerald-600 shadow-xs",
  },
  {
    value: "maybe",
    label: "Maybe",
    icon: HelpCircle,
    activeClass: "bg-amber-500 text-white border-amber-500 shadow-xs",
  },
  {
    value: "not_going",
    label: "Not Going",
    icon: X,
    activeClass: "bg-rose-500 text-white border-rose-500 shadow-xs",
  },
];

export const RsvpControl: React.FC<RsvpControlProps> = ({ event, onUpdated }) => {
  const [submitRSVP, { isLoading }] = useSubmitRSVPMutation();
  const currentStatus = (event.my_rsvp_status || event.my_rsvp || "")
    .toLowerCase()
    .replace(/\s+/g, "_");

  const counts = event.rsvp_counts || {
    going: event.rsvps?.filter((r) => r.status?.toLowerCase() === "going").length || 0,
    maybe: event.rsvps?.filter((r) => r.status?.toLowerCase() === "maybe").length || 0,
    not_going: event.rsvps?.filter((r) => r.status?.toLowerCase() === "not_going" || r.status?.toLowerCase() === "not going").length || 0,
  };

  const handleSelect = async (status: RSVPStatus) => {
    try {
      await submitRSVP({ eventId: event.id, status }).unwrap();
      const label = status === "going" ? "Going" : status === "maybe" ? "Maybe" : "Not Going";
      toast.success(`RSVP updated: ${label}`);
      if (onUpdated) onUpdated();
    } catch (err: any) {
      toast.error(err?.data?.detail || "Failed to submit RSVP");
    }
  };

  return (
    <div className="mt-3.5 pt-3 border-t border-slate-100" data-testid={`rsvp-control-${event.id}`}>
      <div className="flex items-center gap-1.5 flex-wrap">
        {OPTIONS.map((opt) => {
          const isActive = currentStatus === opt.value;
          const Icon = opt.icon;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleSelect(opt.value)}
              disabled={isLoading}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-150 cursor-pointer",
                isActive
                  ? opt.activeClass
                  : "bg-white text-slate-600 border-slate-200/90 hover:border-slate-300 hover:bg-slate-50"
              )}
              data-testid={`rsvp-${opt.value}-${event.id}`}
            >
              <Icon size={13} />
              <span>{opt.label}</span>
              {isActive && <span className="text-[10px]">✓</span>}
            </button>
          );
        })}
      </div>

      <div className="mt-2.5 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <Users size={13} className="text-slate-400" />
          <span>
            <strong className="text-emerald-700 font-semibold">{counts.going || 0}</strong> going
            {(counts.maybe || 0) > 0 && (
              <span className="ml-1.5">
                · <strong className="text-amber-700 font-semibold">{counts.maybe}</strong> maybe
              </span>
            )}
          </span>
        </div>

        {event.attendees_preview && event.attendees_preview.length > 0 && (
          <span className="text-[11px] text-slate-400 truncate max-w-[150px]">
            {event.attendees_preview.slice(0, 2).join(", ")}
            {event.attendees_preview.length > 2 ? ` +${event.attendees_preview.length - 2}` : ""}
          </span>
        )}
      </div>
    </div>
  );
};

export default RsvpControl;
