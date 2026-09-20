import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock } from "lucide-react";
import { NavSubItem } from "@/types/navigation";
import { cn } from "@/lib/utils";

export interface SidebarSubMenuProps {
  subItems: NavSubItem[];
  isExpanded: boolean;
  sidebarCollapsed: boolean;
  isNavActive: (path?: string, key?: string) => boolean;
  onSelect: (sub: NavSubItem) => void;
}

export const SidebarSubMenu: React.FC<SidebarSubMenuProps> = ({
  subItems,
  isExpanded,
  sidebarCollapsed,
  isNavActive,
  onSelect,
}) => {
  return (
    <AnimatePresence initial={false}>
      {isExpanded && !sidebarCollapsed && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="overflow-hidden ml-5 mt-1 pl-2.5 border-l border-white/10 space-y-0.5"
        >
          {subItems.map((sub) => {
            const isSubActive = isNavActive(sub.path, sub.key);
            return (
              <button
                key={sub.key}
                onClick={() => onSelect(sub)}
                className={cn(
                  "w-full text-left px-2.5 py-1.5 rounded-lg cursor-pointer text-xs transition-colors duration-150 flex items-center justify-between",
                  isSubActive
                    ? "bg-white/15 text-white font-semibold shadow-2xs"
                    : "text-white/60 hover:bg-white/8 hover:text-white"
                )}
              >
                <span className="truncate">{sub.label}</span>
                {sub.isLocked && <Lock size={11} className="opacity-40 ml-1 shrink-0" />}
              </button>
            );
          })}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SidebarSubMenu;
