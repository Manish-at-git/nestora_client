import React from "react";
import { Pin, Edit3, Trash2, FileText, ExternalLink, User, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Announcement } from "../types";

export interface AnnouncementCardProps {
  announcement: Announcement;
  canEditOrDelete?: boolean;
  isBoardMember?: boolean;
  onEdit?: (announcement: Announcement) => void;
  onDelete?: (id: string | number) => void;
}

const CATEGORY_STYLES: Record<string, string> = {
  general: "bg-emerald-50 text-emerald-700 border-emerald-200",
  "meeting notice": "bg-sky-50 text-sky-700 border-sky-200",
  "financial updates": "bg-blue-50 text-blue-700 border-blue-200",
  "safety advisory": "bg-amber-50 text-amber-700 border-amber-200",
  maintenance: "bg-orange-50 text-orange-700 border-orange-200",
  urgent: "bg-rose-50 text-rose-700 border-rose-200",
  celebration: "bg-violet-50 text-violet-700 border-violet-200",
};

export const AnnouncementCard: React.FC<AnnouncementCardProps> = ({
  announcement,
  canEditOrDelete,
  isBoardMember,
  onEdit,
  onDelete,
}) => {
  const catKey = announcement.category?.toLowerCase() || "general";
  const catStyle = CATEGORY_STYLES[catKey] || "bg-slate-100 text-slate-700 border-slate-200";
  const catLabel = catKey.charAt(0).toUpperCase() + catKey.slice(1);

  return (
    <div
      className={`bg-white rounded-2xl p-6 border transition-all duration-200 hover:shadow-md relative flex flex-col justify-between ${
        announcement.pinned
          ? "border-amber-200/90 bg-gradient-to-b from-amber-50/20 to-white ring-1 ring-amber-300/40"
          : "border-slate-200/90"
      }`}
      data-testid={`announcement-row-${announcement.id}`}
    >
      <div>
        {/* Header Badges & Date */}
        <div className="flex items-center gap-2.5 flex-wrap mb-3.5">
          <span className={`text-xs font-medium px-3 py-0.5 rounded-full border ${catStyle}`}>
            {catLabel}
          </span>

          {announcement.pinned && (
            <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full bg-amber-100/80 text-amber-800 border border-amber-200">
              <Pin size={11} className="fill-amber-700" /> Pinned Notice
            </span>
          )}

          {announcement.created_at && (
            <span className="text-xs text-slate-400 ml-auto">
              {new Date(announcement.created_at).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          )}
        </div>

        {/* Title & Body */}
        <h3 className="text-base sm:text-lg font-medium text-slate-800 mb-2 tracking-tight line-clamp-2">
          {announcement.title}
        </h3>
        <p className="text-slate-600 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap mb-4 line-clamp-6">
          {announcement.body}
        </p>

        {/* Attachment Link */}
        {announcement.attachment_url && (
          <div className="mb-4">
            <a
              href={announcement.attachment_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 text-slate-700 border border-slate-200 text-xs font-medium hover:bg-slate-100 transition-colors shadow-xs"
            >
              <FileText size={14} className="text-slate-500" />
              <span>View Attachment</span>
              <ExternalLink size={12} className="opacity-60" />
            </a>
          </div>
        )}
      </div>

      {/* Footer Info & Admin Actions */}
      <div className="flex items-center justify-between pt-4 mt-2 border-t border-slate-100 text-xs text-slate-500">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-slate-600 flex items-center gap-1 text-xs">
            <User size={13} className="text-slate-400" />
            {announcement.author_name || "Association Admin"}
          </span>
          {announcement.audience && (
            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[11px]">
              Audience: {announcement.audience}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {canEditOrDelete ? (
            <>
              {onEdit && (
                <Button
                  variant="ghost"
                  onClick={() => onEdit(announcement)}
                  className="h-8 px-2.5 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
                  data-testid={`announcement-edit-${announcement.id}`}
                >
                  <Pencil size={13} className="mr-1" /> <span className="font-normal">Edit</span>
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="ghost"
                  onClick={() => onDelete(announcement.id)}
                  className="h-8 px-2.5 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg"
                  data-testid={`announcement-delete-${announcement.id}`}
                >
                  <Trash2 size={13} className="mr-1" /> <span className="font-normal">Delete</span>
                </Button>
              )}
            </>
          ) : (
            isBoardMember && (
              <span className="text-[10px] text-slate-400 uppercase font-semibold">
                Locked (past 2h)
              </span>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default AnnouncementCard;
