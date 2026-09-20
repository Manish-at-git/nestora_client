import React from "react";
import {
  Calendar as CalendarIcon,
  MapPin,
  IndianRupee,
  DollarSign,
  Users,
  Heart,
  MessageCircle,
} from "lucide-react";
import { resolveMediaUrl } from "@/lib/cloudUploader";

export interface EventItem {
  id: string | number;
  title?: string;
  category?: string;
  banner_url?: string;
  starts_at?: string;
  ends_at?: string;
  location?: string;
  is_paid?: boolean;
  fee_amount?: number | string;
  description?: string;
  is_registration_required?: boolean;
  registration_deadline?: string;
  my_rsvp_status?: string;
  like_count?: number;
  comment_count?: number;
  user_has_liked?: boolean;
  created_at?: string;
  author_name?: string;
}

export interface EventCardProps {
  item: EventItem;
  currencySymbol: string;
  onRSVP: (eventId: string | number, status: string) => void;
  onToggleLike: (id: string | number, userHasLiked?: boolean) => void;
  onOpenComments: (item: { id: string | number; title?: string }) => void;
  formatDate: (isoString?: string) => string;
}

export const EventCard: React.FC<EventCardProps> = ({
  item,
  currencySymbol,
  onRSVP,
  onToggleLike,
  onOpenComments,
  formatDate,
}) => {
  return (
    <div
      key={`e-${item.id}`}
      className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden mt-4 mb-8"
    >
      {item.banner_url ? (
        <div className="w-full h-48 sm:h-48 bg-slate-200 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent z-10" />
          <img
            src={resolveMediaUrl(item.banner_url)}
            alt={item.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-4 left-4 z-20">
            <span className="bg-blue-600 text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
              {item.category || "Event"}
            </span>
          </div>
        </div>
      ) : (
        <div className="w-full h-32 bg-blue-50 relative flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-indigo-50 opacity-50" />
          <span className="bg-blue-600 text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-md z-10">
            {item.category || "Event"}
          </span>
        </div>
      )}

      <div className="p-6">
        <h3 className="text-2xl font-bold text-slate-800 mb-3 leading-tight">
          {item.title || "Untitled Event"}
        </h3>

        <div className="flex flex-col gap-3 mb-5">
          {/* Date & Time Row */}
          <div className="flex items-start gap-3">
            <div className="bg-blue-50 p-2 rounded-xl text-blue-600 mt-0.5">
              <CalendarIcon size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-700 leading-snug">
                {item.starts_at
                  ? new Date(item.starts_at).toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })
                  : "Date & Time TBD"}
              </p>
              {item.ends_at && (
                <p className="text-xs text-slate-500 mt-0.5">
                  to{" "}
                  {new Date(item.ends_at).toLocaleDateString("en-US", {
                    month: "numeric",
                    day: "numeric",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </p>
              )}
            </div>
          </div>

          {/* Location Row */}
          {item.location && (
            <div className="flex items-center gap-3">
              <div className="bg-rose-50 p-2 rounded-xl text-rose-600">
                <MapPin size={20} />
              </div>
              <p className="text-sm font-semibold text-slate-700">{item.location}</p>
            </div>
          )}

          {item.is_paid ? (
            <div className="flex items-center gap-3">
              <div className="bg-emerald-50 p-2 rounded-xl text-emerald-600">
                {currencySymbol === "₹" ? (
                  <IndianRupee size={20} />
                ) : (
                  <DollarSign size={20} />
                )}
              </div>
              <p className="text-sm font-semibold text-emerald-700">
                {parseFloat(String(item.fee_amount || 0)).toFixed(2)} Entry
              </p>
            </div>
          ) : <></>}
        </div>

        {/* Description Box */}
        {item.description && (
          <div className="bg-slate-50 rounded-2xl p-4 mb-5 border border-slate-100">
            <p className="text-sm text-slate-600 whitespace-pre-wrap">{item.description}</p>
          </div>
        )}

        {/* Registration / RSVP Buttons */}
        {item.is_registration_required ? (
          <div className="pt-4 border-t border-slate-100 mb-5">
            <button
              onClick={() => onRSVP(item.id, "going")}
              disabled={item.my_rsvp_status === "going"}
              className={`w-full font-bold py-3 px-4 rounded-xl shadow-xs transition-transform active:scale-95 flex justify-center items-center gap-2 cursor-pointer ${
                item.my_rsvp_status === "going"
                  ? "bg-emerald-600 text-white shadow-emerald-200"
                  : "bg-blue-600 text-white shadow-blue-200 hover:bg-blue-700"
              }`}
            >
              <Users size={20} />
              {item.my_rsvp_status === "going" ? "Registered" : "Register Now"}
            </button>
            {item.registration_deadline && (
              <p className="text-center text-xs text-slate-400 mt-2">
                Deadline: {new Date(item.registration_deadline).toLocaleDateString()}
              </p>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-3 pt-4 border-t border-slate-100 mb-2">
            <button
              onClick={() => onRSVP(item.id, "going")}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                item.my_rsvp_status === "going"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
              }`}
            >
              ✓ Going
            </button>
            <button
              onClick={() => onRSVP(item.id, "maybe")}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                item.my_rsvp_status === "maybe"
                  ? "bg-amber-500 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-amber-50 hover:text-amber-700"
              }`}
            >
              Maybe
            </button>
            <button
              onClick={() => onRSVP(item.id, "declined")}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                item.my_rsvp_status === "declined"
                  ? "bg-rose-500 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-700"
              }`}
            >
              ✕ Not going
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
          <div className="flex gap-4">
            <button
              onClick={() => onToggleLike(item.id, item.user_has_liked)}
              className={`flex items-center gap-1.5 text-sm font-medium transition-colors cursor-pointer ${
                item.user_has_liked ? "text-red-500" : "text-slate-500 hover:text-red-500"
              }`}
            >
              <Heart size={18} className={item.user_has_liked ? "fill-current" : ""} />{" "}
              {item.like_count || 0}
            </button>
            <button
              onClick={() =>
                onOpenComments({
                  id: item.id,
                  title: item.title,
                })
              }
              className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-blue-500 transition-colors cursor-pointer"
            >
              <MessageCircle size={18} /> {item.comment_count || 0}
            </button>
          </div>
          <div className="text-xs text-slate-400 font-mono">
            <span>
              {formatDate(item.created_at)} - by {item.author_name || "Admin"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCard;

