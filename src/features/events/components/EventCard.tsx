import React from "react";
import { Calendar, MapPin, Users, Edit3, Trash2, Heart, MessageSquare, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { resolveMediaUrl } from "@/lib/cloudUploader";
import { formatDateTime } from "@/utils";
import { RsvpControl } from "./RsvpControl";
import { useToggleLikeEventMutation } from "../api/eventsApi";
import type { EventItem } from "../types";
import { cn } from "@/lib/utils";

export interface EventCardProps {
  event: EventItem;
  canEdit?: boolean;
  canDelete?: boolean;
  canEditOrDelete?: boolean;
  onEdit?: (event: EventItem) => void;
  onDelete?: (id: string | number) => void;
  onOverview?: (event: EventItem) => void;
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  canEdit,
  canDelete,
  canEditOrDelete,
  onEdit,
  onDelete,
  onOverview,
}) => {
  const [toggleLike, { isLoading: isLiking }] = useToggleLikeEventMutation();
  const startDate = event.starts_at ? new Date(event.starts_at) : null;
  const isPaid = Boolean(event.is_paid && (event.fee_amount || 0) > 0);

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await toggleLike(event.id).unwrap();
    } catch {
      // Ignored
    }
  };

  return (
    <div
      className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group"
      data-testid={`event-card-${event.id}`}
    >
      <div>
        {/* Banner Cover Photo / Fallback Banner */}
        {event.banner_url ? (
          <div
            onClick={() => onOverview?.(event)}
            className="h-40 w-full rounded-xl bg-slate-100 mb-4 overflow-hidden border border-slate-200/70 relative cursor-pointer"
          >
            <img
              src={resolveMediaUrl(event.banner_url)}
              alt={event.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {event.category && (
              <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-medium tracking-wide">
                {event.category}
              </span>
            )}
            <span
              className={cn(
                "absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide shadow-xs",
                isPaid
                  ? "bg-emerald-600 text-white"
                  : "bg-white/90 text-slate-700 backdrop-blur-xs"
              )}
            >
              {isPaid ? `₹${event.fee_amount}` : "Free"}
            </span>
          </div>
        ) : (
          <div
            onClick={() => onOverview?.(event)}
            className="h-32 w-full rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 mb-4 flex items-center justify-center border border-slate-100 relative cursor-pointer"
          >
            <Calendar className="text-slate-300" size={36} />
            {event.category && (
              <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-white/90 shadow-2xs border border-slate-200/80 text-slate-700 text-[11px] font-medium tracking-wide">
                {event.category}
              </span>
            )}
            <span
              className={cn(
                "absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide",
                isPaid
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-200/80 text-slate-700"
              )}
            >
              {isPaid ? `₹${event.fee_amount}` : "Free"}
            </span>
          </div>
        )}

        {/* Title & Description */}
        <h3
          onClick={() => onOverview?.(event)}
          className="font-serif text-lg font-bold text-slate-900 mb-1.5 leading-snug line-clamp-2 cursor-pointer hover:text-slate-700 transition-colors"
        >
          {event.title}
        </h3>

        {event.description && (
          <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed mb-3.5">
            {event.description}
          </p>
        )}

        {/* Metadata Details */}
        <div className="space-y-1.5 text-xs text-slate-600">
          {event.starts_at && (
            <div className="flex items-center gap-2">
              <Calendar size={13.5} className="text-slate-400 shrink-0" />
              <span className="font-medium text-slate-700">
                {formatDateTime(event.starts_at)}
              </span>
            </div>
          )}

          {event.location && (
            <div className="flex items-center gap-2">
              <MapPin size={13.5} className="text-slate-400 shrink-0" />
              <span className="truncate text-slate-600">{event.location}</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-slate-500 pt-0.5">
            <Users size={13} className="text-slate-400 shrink-0" />
            <span>
              {event.max_capacity ? `Capacity: ${event.max_capacity}` : "Open registration"}
            </span>
          </div>
        </div>
      </div>

      {/* RSVP Controls & Card Footer */}
      <div>
        <RsvpControl event={event} />

        <div className="flex items-center justify-between mt-3 pt-2.5">
          {/* <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleLike}
              disabled={isLiking}
              className={cn(
                "inline-flex items-center gap-1 text-xs transition-colors cursor-pointer",
                event.user_has_liked
                  ? "text-rose-600 font-semibold"
                  : "text-slate-400 hover:text-slate-600"
              )}
              title="Like this event"
            >
              <Heart
                size={14}
                className={cn(event.user_has_liked && "fill-rose-500 text-rose-500")}
              />
              <span>{event.like_count || 0}</span>
            </button>

            <button
              type="button"
              onClick={() => onOverview?.(event)}
              className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              title="View comments"
            >
              <MessageSquare size={14} />
              <span>{event.comment_count || 0}</span>
            </button>
          </div> */}

          {(canEdit || canDelete || canEditOrDelete) && (
            <div className="flex items-center justify-end gap-1 w-full">
              {(canEdit ?? canEditOrDelete) && onEdit && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => onEdit(event)}
                  className="h-7 px-3 font-medium text-xs text-slate-600 hover:text-slate-900 rounded-lg cursor-pointer"
                >
                  <Pencil size={13} className="mr-1" /> Edit
                </Button>
              )}
              {(canDelete ?? canEditOrDelete) && onDelete && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => onDelete(event.id)}
                  className="h-7 p-3 font-medium text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg cursor-pointer"
                >
                  <Trash2 size={12} className="mr-1" /> Delete
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventCard;
