import React from "react";
import { LogOut, Users } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";

export interface SidebarFooterProps {
  sidebarCollapsed: boolean;
  displayName: string;
  role?: string;
  onProfileClick: () => void;
  onLogout: () => void;
}

export const SidebarFooter: React.FC<SidebarFooterProps> = ({
  sidebarCollapsed,
  displayName,
  role = "Member",
  onProfileClick,
  onLogout,
}) => {
  return (
    <div className="pt-4 border-t border-white/10 mt-3 shrink-0">
      {!sidebarCollapsed ? (
        <>
          <div className="flex items-center gap-3 mb-3">
            <Avatar
              size="sm"
              fallbackText={displayName}
              className="bg-slate-800 text-white border border-white/20"
            />
            <div className="overflow-hidden">
              <div className="text-xs font-semibold text-white truncate">
                {displayName}
              </div>
              <div className="text-[10px] text-white/50 uppercase tracking-wider font-mono">
                {role}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-white/5">
            <button
              onClick={onProfileClick}
              className="flex-1 py-1.5 px-2.5 rounded-lg text-xs text-white/70 hover:text-white hover:bg-white/10 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Users size={13} /> Profile
            </button>
            <button
              onClick={onLogout}
              className="py-1.5 px-2.5 rounded-lg text-xs text-rose-300 hover:text-rose-100 hover:bg-rose-900/30 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Sign out"
            >
              <LogOut size={13} /> Logout
            </button>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <Avatar
            size="sm"
            fallbackText={displayName}
            className="bg-slate-800 text-white border border-white/20 cursor-pointer hover:ring-2 hover:ring-white/40 transition-all"
            onClick={onProfileClick}
            title={displayName}
          />
          <button
            onClick={onLogout}
            className="text-white/60 hover:text-rose-300 p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            title="Sign out"
          >
            <LogOut size={15} />
          </button>
        </div>
      )}
    </div>
  );
};

export default SidebarFooter;
