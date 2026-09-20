import React from "react";
import {
  Coffee,
  Calendar as CalendarIcon,
  Activity,
  Dumbbell,
  Sparkles,
  Waves,
  Gamepad2,
  Users,
  Building,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/common/StatusPill";
import type { Amenity } from "../types";

export interface AmenityCardProps {
  amenity: Amenity;
  currencySymbol?: string;
  onBook: (amenity: Amenity) => void;
  canBook?: boolean;
  isAdmin?: boolean;
  onToggleStatus?: (amenity: Amenity) => void;
  isToggling?: boolean;
}

export const AmenityIcon: React.FC<{ name?: string; className?: string; size?: number }> = ({
  name = "",
  className = "",
  size = 24,
}) => {
  const lower = name.toLowerCase();

  if (lower.includes("badminton") || lower.includes("shuttle")) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
      >
        <path d="M9 17a3 3 0 0 0 6 0Z" />
        <path d="M9 17L4 3l5 3 3-4 3 4 5-3-5 14" />
        <path d="M6 8h12" />
        <path d="M7.5 12h9" />
      </svg>
    );
  }

  if (lower.includes("swimming") || lower.includes("pool") || lower.includes("water")) {
    return <Waves size={size} className={className} />;
  }

  if (lower.includes("gym") || lower.includes("fitness") || lower.includes("workout")) {
    return <Dumbbell size={size} className={className} />;
  }

  if (lower.includes("tennis") || lower.includes("squash") || lower.includes("court")) {
    return <Activity size={size} className={className} />;
  }

  if (lower.includes("game") || lower.includes("gaming") || lower.includes("billiards") || lower.includes("tt") || lower.includes("table tennis")) {
    return <Gamepad2 size={size} className={className} />;
  }

  if (lower.includes("club") || lower.includes("hall") || lower.includes("lounge") || lower.includes("party")) {
    return <Building size={size} className={className} />;
  }

  if (lower.includes("community") || lower.includes("gathering")) {
    return <Users size={size} className={className} />;
  }

  if (lower.includes("spa") || lower.includes("sauna") || lower.includes("yoga")) {
    return <Sparkles size={size} className={className} />;
  }

  return <Coffee size={size} className={className} />;
};

export const AmenityCard: React.FC<AmenityCardProps> = ({
  amenity,
  currencySymbol = "$",
  onBook,
  canBook = true,
  isAdmin = false,
  onToggleStatus,
  isToggling = false,
}) => {
  const isActive = Boolean(amenity.status);
  const chargeNum = typeof amenity.charges === "number" ? amenity.charges : parseFloat(String(amenity.charges || "0"));

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col group hover:border-slate-300">
      {/* Visual Header Banner */}
      <div className="h-36 bg-gradient-to-br from-slate-100/80 via-slate-50 to-slate-100/50 flex items-center justify-center relative overflow-hidden border-b border-slate-100">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-0" />
        <div className="relative z-10 w-16 h-16 rounded-2xl bg-white/90 backdrop-blur-xs border border-white shadow-xs flex items-center justify-center text-slate-800 group-hover:scale-110 group-hover:text-slate-900 transition-all duration-300">
          <AmenityIcon name={amenity.name} size={30} />
        </div>

        <div className="absolute top-3 right-3 z-10">
          <StatusPill
            status={isActive ? "Active" : "Inactive"}
            variant={isActive ? "success" : "neutral"}
            dot={true}
            size="xs"
          />
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h3 className="text-base font-semibold text-slate-800 group-hover:text-slate-900 transition-colors line-clamp-1">
            {amenity.name}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Available for verified residents & community members
          </p>
        </div>

        <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium block">Rate</span>
            <span className="text-2xl font-bold text-slate-900 tracking-tight">
              {currencySymbol}
              {chargeNum.toFixed(2)}
            </span>
            <span className="text-xs text-slate-500 ml-1">/ hr</span>
          </div>

          {isAdmin && onToggleStatus && (
            <Button
              variant="outline"
              size="sm"
              disabled={isToggling}
              onClick={() => onToggleStatus(amenity)}
              className="text-xs rounded-xl h-8 border-slate-200 hover:bg-slate-50"
            >
              {isActive ? "Deactivate" : "Activate"}
            </Button>
          )}
        </div>

        <Button
          onClick={() => onBook(amenity)}
          disabled={!isActive || !canBook}
          className="w-full h-10 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs shadow-xs transition-colors flex items-center justify-center gap-2"
        >
          <CalendarIcon size={15} />
          {isActive ? "Book Now" : "Unavailable"}
        </Button>
      </div>
    </div>
  );
};
