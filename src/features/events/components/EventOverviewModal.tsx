import React from "react";
import { Calendar, MapPin, Users, IndianRupee, Clock, Info, User } from "lucide-react";
import { ModalWrapper } from "@/components/common/ModalWrapper";
import { Button } from "@/components/ui/button";
import { resolveMediaUrl } from "@/lib/cloudUploader";
import { formatDateTime } from "@/utils";
import type { EventItem } from "../types";

export interface EventOverviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: EventItem | null;
}

export const EventOverviewModal: React.FC<EventOverviewModalProps> = ({
  isOpen,
  onClose,
  event,
}) => {
  if (!event) return null;

  const isPaid = !!event.is_paid && (event.fee_amount || 0) > 0;

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title={event.title}
      icon={<Calendar size={18} className="text-slate-800" />}
      badge={
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 bg-slate-200/70 px-2.5 py-0.5 rounded-full">
          {event.category || "Community Event"}
        </span>
      }
      size="lg"
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
        {/* Banner preview if available */}
        {event.banner_url && (
          <div className="h-44 w-full rounded-2xl bg-slate-100 overflow-hidden border border-slate-200/70 relative">
            <img
              src={resolveMediaUrl(event.banner_url)}
              alt={event.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Description */}
        <div className="bg-slate-50 border border-slate-200/80 text-slate-800 p-4 rounded-2xl flex items-start gap-3 min-w-0">
          <Info className="text-slate-500 shrink-0 mt-0.5" size={18} />
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Event Description
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
              {event.description || "No specific details provided for this event."}
            </p>
          </div>
        </div>

        {/* Event Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="flex items-start gap-3 text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <div className="bg-white p-2 rounded-lg text-slate-600 shadow-2xs shrink-0 border border-slate-100">
              <Clock size={15} />
            </div>
            <div>
              <p className="text-slate-400 font-medium mb-0.5">Starts At</p>
              <p className="text-slate-800 font-semibold">{formatDateTime(event.starts_at)}</p>
            </div>
          </div>

          {event.ends_at && (
            <div className="flex items-start gap-3 text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <div className="bg-white p-2 rounded-lg text-slate-600 shadow-2xs shrink-0 border border-slate-100">
                <Calendar size={15} />
              </div>
              <div>
                <p className="text-slate-400 font-medium mb-0.5">Ends At</p>
                <p className="text-slate-800 font-semibold">{formatDateTime(event.ends_at)}</p>
              </div>
            </div>
          )}

          <div className="flex items-start gap-3 text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <div className="bg-white p-2 rounded-lg text-slate-600 shadow-2xs shrink-0 border border-slate-100">
              <MapPin size={15} />
            </div>
            <div className="min-w-0">
              <p className="text-slate-400 font-medium mb-0.5">Location / Venue</p>
              <p className="text-slate-800 font-semibold truncate">{event.location || "Community Grounds"}</p>
            </div>
          </div>

          <div className="flex items-start gap-3 text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <div className="bg-white p-2 rounded-lg text-slate-600 shadow-2xs shrink-0 border border-slate-100">
              <Users size={15} />
            </div>
            <div>
              <p className="text-slate-400 font-medium mb-0.5">Audience</p>
              <p className="text-slate-800 font-semibold">{event.audience || "All Residents"}</p>
            </div>
          </div>

          <div className="flex items-start gap-3 text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <div className="bg-white p-2 rounded-lg text-slate-600 shadow-2xs shrink-0 border border-slate-100">
              <IndianRupee size={15} />
            </div>
            <div>
              <p className="text-slate-400 font-medium mb-0.5">Ticket / Fee</p>
              <p className="text-slate-800 font-semibold">
                {isPaid ? `₹${event.fee_amount}` : "Free Admission"}
              </p>
            </div>
          </div>

          {event.is_registration_required && (
            <div className="flex items-start gap-3 text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <div className="bg-white p-2 rounded-lg text-slate-600 shadow-2xs shrink-0 border border-slate-100">
                <Users size={15} />
              </div>
              <div>
                <p className="text-slate-400 font-medium mb-0.5">Registration & Capacity</p>
                <p className="text-slate-800 font-semibold">
                  {event.max_capacity ? `Max ${event.max_capacity} attendees` : "Registration Required"}
                  {event.registration_deadline && ` (Deadline: ${formatDateTime(event.registration_deadline)})`}
                </p>
              </div>
            </div>
          )}

          {(event.organizer_name || event.organizer_contact || event.author_name) && (
            <div className="flex items-start gap-3 text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <div className="bg-white p-2 rounded-lg text-slate-600 shadow-2xs shrink-0 border border-slate-100">
                <User size={15} />
              </div>
              <div className="min-w-0">
                <p className="text-slate-400 font-medium mb-0.5">Organizer</p>
                <p className="text-slate-800 font-semibold truncate">
                  {event.organizer_name || event.author_name}
                  {event.organizer_contact && ` • ${event.organizer_contact}`}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </ModalWrapper>
  );
};

export default EventOverviewModal;
