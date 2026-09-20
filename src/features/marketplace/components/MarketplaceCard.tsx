import React from "react";
import {
  Heart,
  Star,
  MapPin,
  Clock,
  Eye,
  Pencil,
  Trash2,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { resolveMediaUrl } from "@/lib/cloudUploader";
import type { MarketplaceItem } from "../types";

export interface MarketplaceCardProps {
  item: MarketplaceItem;
  onClick: (item: MarketplaceItem) => void;
  onSaveToggle?: (itemId: string, isSaved: boolean) => void;
  onEdit?: (item: MarketplaceItem) => void;
  onDelete?: (item: MarketplaceItem) => void;
  canManage?: boolean;
}

export const MarketplaceCard: React.FC<MarketplaceCardProps> = ({
  item,
  onClick,
  onSaveToggle,
  onEdit,
  onDelete,
  canManage = false,
}) => {
  const isSaved = Boolean(item.is_saved);

  const getTimeAgo = (dateStr?: string) => {
    if (!dateStr) return "Recently";
    const d = new Date(dateStr);
    const now = new Date();
    const diff = (now.getTime() - d.getTime()) / 1000;
    if (isNaN(diff) || diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const coverImage =
    item.images && item.images.length > 0
      ? resolveMediaUrl(item.images[0])
      : "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&auto=format&fit=crop&q=80";

  return (
    <div
      className="group bg-white rounded-2xl border border-slate-200/80 hover:border-slate-300 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col cursor-pointer"
      onClick={() => onClick(item)}
    >
      {/* Cover Image Area */}
      <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
        <img
          src={coverImage}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&auto=format&fit=crop&q=80";
          }}
        />

        {/* Favorite Heart Button */}
        {onSaveToggle && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSaveToggle(item.id, !isSaved);
            }}
            className="absolute top-2.5 right-2.5 p-2 bg-white/90 backdrop-blur-md rounded-full text-slate-400 hover:text-rose-500 hover:bg-white shadow-sm transition-all duration-150 cursor-pointer active:scale-90"
            title={isSaved ? "Remove from saved" : "Save to favorites"}
          >
            <Heart
              size={15}
              className={isSaved ? "text-rose-500 fill-rose-500" : ""}
            />
          </button>
        )}

        {/* Status Badge */}
        {item.status && item.status !== "Active" && (
          <div className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-semibold tracking-wider uppercase rounded-md shadow-sm">
            {item.status}
          </div>
        )}

        {/* Listing Type Tag */}
        <div className="absolute bottom-2.5 left-2.5">
          <span className="bg-white/95 backdrop-blur-md text-indigo-700 border border-indigo-100/80 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md shadow-xs">
            {item.listing_type || "Sell"}
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 flex flex-col flex-1">
        {/* Title */}
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-semibold text-slate-800 text-sm leading-snug line-clamp-1 group-hover:text-indigo-600 transition-colors">
            {item.title}
          </h3>
        </div>

        {/* Price & Negotiable */}
        <div className="flex items-baseline gap-2 mb-2">
          <span className="font-bold text-slate-900 text-base">
            ₹{Number(item.price || 0).toLocaleString()}
          </span>
          {item.is_negotiable ? (
            <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
              Negotiable
            </span>
          ) : <></>}
        </div>

        {/* Meta Info (Category, Condition, Location) */}
        <div className="space-y-1 text-xs text-slate-500 mb-3">
          <div className="flex items-center gap-1.5 text-slate-600">
            <Star size={12} className="text-amber-500 fill-amber-500 shrink-0" />
            <span className="truncate">{item.condition_state || "Good"}</span>
            {item.brand && (
              <>
                <span className="text-slate-300">•</span>
                <span className="truncate">{item.brand}</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-1 text-slate-500">
            <MapPin size={12} className="text-slate-400 shrink-0" />
            <span className="truncate">{item.location || "Community"}</span>
          </div>
        </div>

        {/* Card Footer: Views, Time, and Owner/Admin Actions */}
        <div className="mt-auto pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1">
            <Clock size={11} className="text-slate-400" />
            <span>{getTimeAgo(item.created_at)}</span>
          </div>

          <div className="flex items-center gap-2">
            {item.views_count !== undefined && (
              <span className="flex items-center gap-1 text-slate-400">
                <Eye size={11} />
                {item.views_count}
              </span>
            )}

            {/* Quick Actions for Owner/Admin */}
            {canManage && (
              <div
                className="flex items-center gap-1 ml-1"
                onClick={(e) => e.stopPropagation()}
              >
                {onEdit && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => onEdit(item)}
                    className="h-7 px-3 font-medium text-xs text-slate-600 hover:text-slate-900 rounded-lg cursor-pointer"
                  >
                    <Pencil size={13} className="mr-1" /> Edit
                  </Button>
                )}
                {onDelete && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => onDelete(item)}
                    className="h-7 px-3 font-medium text-xs text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                  >
                    <Trash2 size={13} className="mr-1" /> Delete
                  </Button>

                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketplaceCard;
