import React from "react";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SidebarHeaderProps {
  sidebarCollapsed: boolean;
  onToggle: () => void;
}

export const SidebarHeader: React.FC<SidebarHeaderProps> = ({
  sidebarCollapsed,
  onToggle,
}) => {
  return (
    <div
      className={cn(
        "flex items-center justify-between mb-6 shrink-0",
        sidebarCollapsed && "justify-center"
      )}
    >
      {!sidebarCollapsed && (
        <div className="flex items-center gap-2.5">
          <span className="font-display italic text-2xl font-bold tracking-tight text-white select-none">
            Nestora
          </span>
        </div>
      )}
      <button
        onClick={onToggle}
        className="p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        aria-label={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
      >
        {sidebarCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
      </button>
    </div>
  );
};

export default SidebarHeader;
