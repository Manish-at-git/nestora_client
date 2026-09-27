import React from "react";
import { MapPin, Navigation, Phone, Share2, Star } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { resolveMediaUrl } from "@/lib/cloudUploader";
import type { NearbyPlace } from "../types";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=60";

export const NearbyPlaceCard: React.FC<{ place: NearbyPlace }> = ({
  place,
}) => {
  const tags = (place.tags || "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
  const directionsUrl =
    place.website ||
    `https://maps.google.com/?q=${encodeURIComponent(place.name + " " + place.address)}`;
  const copyPhone = async () => {
    if (!place.phone) return;
    await navigator.clipboard.writeText(place.phone);
    toast.success("Contact number copied");
  };
  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white transition-shadow hover:shadow-md">
      <div className="relative h-40 overflow-hidden bg-slate-100">
        <img
          src={resolveMediaUrl(place.image, FALLBACK_IMAGE)}
          alt={place.name}
          className="h-full w-full object-cover"
        />
        <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-slate-900/80 px-2.5 py-1 text-xs font-semibold text-white">
          <MapPin size={12} />
          {place.distance}
        </span>
        <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-xs font-bold text-slate-800">
          <Star size={12} className="fill-amber-500 text-amber-500" />
          {place.rating} ({place.reviews})
        </span>
        <span className="absolute bottom-3 left-3 rounded-md bg-indigo-600/90 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-white">
          {place.category}
        </span>
      </div>
      <div className="p-4">
        <h2 className="text-base font-bold text-slate-800">{place.name}</h2>
        <p className="mt-1 text-xs font-medium text-emerald-700">
          {place.status}
        </p>
        <p className="mt-2 line-clamp-2 text-xs text-slate-600">
          {place.address}
        </p>
        {tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="flex gap-2 border-t border-slate-100 bg-slate-50 px-4 py-3">
        {place.phone && (
          <a
            href={`tel:${place.phone}`}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-slate-800 px-3 py-2 text-xs font-semibold text-white"
          >
            <Phone size={14} />
            Call
          </a>
        )}
        {place.phone && (
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-9 w-9 rounded-xl"
            title="Copy contact number"
            onClick={copyPhone}
          >
            <Share2 size={14} />
          </Button>
        )}
        <a
          href={directionsUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center gap-1 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700"
        >
          <Navigation size={14} />
          Directions
        </a>
      </div>
    </article>
  );
};
