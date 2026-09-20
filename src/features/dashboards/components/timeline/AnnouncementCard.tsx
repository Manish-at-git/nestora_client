import React from "react";
import { Megaphone, FileText, Heart, MessageCircle } from "lucide-react";
import { resolveMediaUrl } from "@/lib/cloudUploader";

export interface AnnouncementItem {
  id: string | number;
  title?: string;
  body?: string;
  category?: string;
  audience?: string;
  pinned?: boolean;
  banner_url?: string;
  attachment_url?: string;
  created_at?: string;
  author_name?: string;
  like_count?: number;
  comment_count?: number;
  user_has_liked?: boolean;
}

export interface AnnouncementCardProps {
  item: AnnouncementItem;
  onToggleLike: (id: string | number, userHasLiked?: boolean) => void;
  onOpenComments: (item: { id: string | number; title?: string }) => void;
  formatDate: (isoString?: string) => string;
}

export const AnnouncementCard: React.FC<AnnouncementCardProps> = ({
  item,
  onToggleLike,
  onOpenComments,
  formatDate,
}) => {
  return (
    <div
      key={`a-${item.id}`}
      className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3 text-xs font-semibold tracking-wider text-slate-500 uppercase">
          <span className="flex items-center gap-1.5">
            <Megaphone size={14} className="text-blue-500" /> Announcement
          </span>
          {item.audience && (
            <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
              {item.audience}
            </span>
          )}
        </div>
        {item.pinned && (
          <span className="px-2.5 py-1 bg-red-100 text-red-700 text-[10px] rounded-full font-bold uppercase tracking-wider">
            Pinned
          </span>
        )}
      </div>

      <h3 className="text-xl font-display text-slate-800 mb-2">{item.title}</h3>
      <p className="text-slate-600 text-sm leading-relaxed mb-4 whitespace-pre-line">
        {item.body}
      </p>

      {item.attachment_url && (
        <div className="mb-4">
          <a
            href={resolveMediaUrl(item.attachment_url)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
          >
            <FileText size={16} /> View Attachment
          </a>
        </div>
      )}

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
  );
};

export default AnnouncementCard;

