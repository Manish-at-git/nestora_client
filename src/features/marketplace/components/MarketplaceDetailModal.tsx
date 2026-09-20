import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  X,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Heart,
  Share2,
  Phone,
  MessageCircle,
  AlertTriangle,
  Clock,
  Star,
  Tag,
  Shield,
  Pencil,
  Trash2,
} from "lucide-react";
import { ModalWrapper } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { resolveMediaUrl } from "@/lib/cloudUploader";
import { useRetainedModalData } from "@/hooks/useRetainedModalData";
import {
  useToggleMarketplaceFavoriteMutation,
  useReportMarketplaceItemMutation,
  useRecordMarketplaceViewMutation,
} from "../api/marketplaceApi";
import type { MarketplaceItem } from "../types";

export interface MarketplaceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: MarketplaceItem | null;
  onOpenChat: (item: MarketplaceItem) => void;
  onEdit?: (item: MarketplaceItem) => void;
  onDelete?: (item: MarketplaceItem) => void;
  canManage?: boolean;
  onSaveToggled?: (itemId: string, saved: boolean) => void;
}

const slideVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? "100%" : "-100%",
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (dir: number) => ({
    x: dir < 0 ? "100%" : "-100%",
    opacity: 0,
  }),
};

export const MarketplaceDetailModal: React.FC<MarketplaceDetailModalProps> = ({
  isOpen,
  onClose,
  item: activeItem,
  onOpenChat,
  onEdit,
  onDelete,
  canManage = false,
  onSaveToggled,
}) => {
  const item = useRetainedModalData(activeItem);
  const [currentImgIdx, setCurrentImgIdx] = useState(0);
  const [direction, setDirection] = useState(0);
  const [toggleFavorite, { isLoading: isTogglingSave }] =
    useToggleMarketplaceFavoriteMutation();
  const [reportItem, { isLoading: isReporting }] =
    useReportMarketplaceItemMutation();

  if (!item) return null;

  const images =
    item.images && item.images.length > 0
      ? item.images
      : ["https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&auto=format&fit=crop&q=80"];

  const isSaved = Boolean(item.is_saved);

  const paginate = (newDirection: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setDirection(newDirection);
    setCurrentImgIdx((prev) => {
      let nextIdx = prev + newDirection;
      if (nextIdx < 0) nextIdx = images.length - 1;
      if (nextIdx >= images.length) nextIdx = 0;
      return nextIdx;
    });
  };

  const handleDotClick = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setDirection(idx > currentImgIdx ? 1 : -1);
    setCurrentImgIdx(idx);
  };

  const handleToggleFavorite = async () => {
    try {
      const res = await toggleFavorite(item.id).unwrap();
      toast.success(res.saved ? "Saved to favorites" : "Removed from favorites");
      onSaveToggled?.(item.id, res.saved);
    } catch (err: any) {
      toast.error(err?.data?.detail || "Failed to update saved item");
    }
  };

  const handleReport = async () => {
    const reason = window.prompt("Please state the reason for reporting this listing:");
    if (!reason || !reason.trim()) return;

    try {
      await reportItem({ id: item.id, reason: reason.trim() }).unwrap();
      toast.success("Listing reported to community moderation");
    } catch (err: any) {
      toast.error(err?.data?.detail || "Failed to report listing");
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: item.title,
          text: `Check out "${item.title}" on Nestora Community Marketplace!`,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Listing link copied to clipboard");
    }
  };

  const getTimeAgo = (dateStr?: string) => {
    if (!dateStr) return "Recently";
    const d = new Date(dateStr);
    const now = new Date();
    const diff = (now.getTime() - d.getTime()) / 1000;
    if (isNaN(diff) || diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)} mins ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return `${Math.floor(diff / 86400)} days ago`;
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title={item.title}
      subheader={`Posted ${getTimeAgo(item.created_at)} in ${item.location || "Community"}`}
      size="2xl"
      bodyClassName="p-0 overflow-hidden"
    >
      <div className="flex flex-col md:flex-row max-h-[80vh] overflow-y-auto">
        {/* Left Side: Photo Carousel with Ambient Backdrop & Slide Animation */}
        <div className="w-full md:w-1/2 bg-slate-950 relative min-h-[300px] md:min-h-[440px] flex items-center justify-center select-none shrink-0 overflow-hidden">
          {/* Ambient blurred backdrop so image never has a harsh empty black screen */}
          <div
            className="absolute inset-0 bg-cover bg-center filter blur-3xl opacity-40 scale-125 transition-all duration-700 pointer-events-none"
            style={{
              backgroundImage: `url(${resolveMediaUrl(images[currentImgIdx])})`,
            }}
          />
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px] pointer-events-none" />

          {/* Animated Slide Image Display */}
          <div className="relative z-10 w-full h-full min-h-[280px] md:min-h-[420px] flex items-center justify-center p-4">
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.img
                key={currentImgIdx}
                src={resolveMediaUrl(images[currentImgIdx])}
                alt={item.title}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 },
                }}
                className="max-w-full max-h-[360px] md:max-h-[400px] object-contain drop-shadow-2xl rounded-lg select-none"
              />
            </AnimatePresence>
          </div>

          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => paginate(-1, e)}
                className="absolute z-20 left-3 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/80 text-white rounded-full backdrop-blur-md transition-all cursor-pointer shadow-lg active:scale-95"
                title="Previous image"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                onClick={(e) => paginate(1, e)}
                className="absolute z-20 right-3 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/80 text-white rounded-full backdrop-blur-md transition-all cursor-pointer shadow-lg active:scale-95"
                title="Next image"
              >
                <ChevronRight size={18} />
              </button>

              {/* Dots Indicator */}
              <div className="absolute z-20 bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 bg-black/50 px-2.5 py-1 rounded-full backdrop-blur-md shadow-md">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={(e) => handleDotClick(idx, e)}
                    className={`h-2 rounded-full transition-all cursor-pointer ${
                      idx === currentImgIdx
                        ? "bg-white w-4"
                        : "bg-white/40 hover:bg-white/70 w-2"
                    }`}
                  />
                ))}
              </div>
            </>
          )}

          {/* Type Badge on Top Left */}
          <div className="absolute z-20 top-3 left-3">
            <span className="bg-white/95 backdrop-blur-md text-indigo-700 font-bold uppercase tracking-wider text-[10px] px-2.5 py-1 rounded-md shadow-xs">
              {item.listing_type || "Sell"}
            </span>
          </div>
        </div>

        {/* Right Side: Details & Actions */}
        <div className="w-full md:w-1/2 p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            {/* Price & Favorite Action */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-2xl font-black text-slate-900 tracking-tight">
                  ₹{Number(item.price || 0).toLocaleString()}
                </span>
                {item.is_negotiable ? (
                  <span className="ml-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                    Negotiable
                  </span>
                ) : <></>}
              </div>

              <div className="flex items-center gap-1.5">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleToggleFavorite}
                  disabled={isTogglingSave}
                  className="rounded-xl h-9 w-9 text-slate-500 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                  title={isSaved ? "Remove from favorites" : "Save to favorites"}
                >
                  <Heart
                    size={18}
                    className={isSaved ? "text-rose-500 fill-rose-500" : ""}
                  />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleShare}
                  className="rounded-xl h-9 w-9 text-slate-500 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
                  title="Share listing"
                >
                  <Share2 size={18} />
                </Button>
              </div>
            </div>

            {/* Spec Matrix */}
            <div className="grid grid-cols-2 gap-2.5 bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs">
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                  Condition
                </span>
                <span className="font-semibold text-slate-700 flex items-center gap-1 mt-0.5">
                  <Star size={12} className="text-amber-500 fill-amber-500" />
                  {item.condition_state || "Good"}
                </span>
              </div>

              {item.category_name && (
                <div>
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                    Category
                  </span>
                  <span className="font-semibold text-slate-700 mt-0.5 block truncate">
                    {item.category_name}
                  </span>
                </div>
              )}

              {item.brand && (
                <div>
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                    Brand
                  </span>
                  <span className="font-semibold text-slate-700 mt-0.5 block truncate">
                    {item.brand}
                  </span>
                </div>
              )}

              {item.item_age && (
                <div>
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                    Age
                  </span>
                  <span className="font-semibold text-slate-700 mt-0.5 block truncate">
                    {item.item_age}
                  </span>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="space-y-1">
              <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Description
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap max-h-32 overflow-y-auto">
                {item.description || "No additional description provided."}
              </p>
            </div>

            {/* Seller Contact & Verification Card */}
            <div className="bg-white border border-slate-200/80 rounded-xl p-3 space-y-2">
              <div className="flex items-center gap-2.5">
                <Avatar
                  size="sm"
                  fallbackText={item.seller_name || "Resident"}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-800 truncate">
                    {item.seller_name || "Community Resident"}
                  </p>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1 truncate">
                    <MapPin size={11} className="shrink-0" />
                    {item.location || "Community"}
                  </p>
                </div>
              </div>

              {item.contact_number && (
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 pt-1 border-t border-slate-100">
                  <Phone size={13} className="text-indigo-600 shrink-0" />
                  <span>{item.contact_number}</span>
                </div>
              )}
            </div>
          </div>

          {/* CTAs & Options */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <Button
              onClick={() => {
                onClose();
                onOpenChat(item);
              }}
              className="w-full rounded-xl gap-2 font-semibold text-xs cursor-pointer shadow-sm"
            >
              <MessageCircle size={15} />
              <span>Message / Chat with Seller</span>
            </Button>

            <div className="flex items-center justify-between pt-1">
              {/* Report button */}
              <button
                type="button"
                onClick={handleReport}
                disabled={isReporting}
                className="text-[11px] text-slate-400 hover:text-rose-600 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <AlertTriangle size={12} />
                <span>Report listing</span>
              </button>

              {/* Owner/Admin management controls */}
              {canManage && (
                <div className="flex items-center gap-2">
                  {onEdit && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        onClose();
                        onEdit(item);
                      }}
                      className="rounded-lg text-xs h-7 px-2.5 gap-1 cursor-pointer"
                    >
                      <Pencil size={11} />
                      <span>Edit</span>
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        onClose();
                        onDelete(item);
                      }}
                      className="rounded-lg text-xs h-7 px-2.5 gap-1 text-rose-600 border-rose-200 hover:bg-rose-50 cursor-pointer"
                    >
                      <Trash2 size={11} />
                      <span>Delete</span>
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ModalWrapper>
  );
};

export default MarketplaceDetailModal;
