import React from "react";
import { ChevronRight, Lock } from "lucide-react";
import { Icon, IconName } from "@/components/icons";
import { NavItem } from "@/types/navigation";
import { SidebarSubMenu } from "./SidebarSubMenu";
import { cn } from "@/lib/utils";

export interface SidebarNavItemProps {
  item: NavItem;
  isActive: boolean;
  isExpanded: boolean;
  sidebarCollapsed: boolean;
  isNavActive: (path?: string, key?: string) => boolean;
  onClick: () => void;
  onToggleChevron: () => void;
  onSubItemClick: (sub: any) => void;
}

export const SidebarNavItem: React.FC<SidebarNavItemProps> = ({
  item,
  isActive,
  isExpanded,
  sidebarCollapsed,
  isNavActive,
  onClick,
  onToggleChevron,
  onSubItemClick,
}) => {
  const renderIcon = (icon: NavItem["icon"]) => {
    if (typeof icon === "string") {
      return <Icon name={icon as IconName} size={18} />;
    }
    const IconComp = icon;
    return <IconComp size={18} />;
  };

  const hasSubItems = Boolean(item.subItems && item.subItems.length > 0);

  return (
    <div className="mb-0.5">
      <button
        type="button"
        onClick={onClick}
        title={sidebarCollapsed ? item.label : undefined}
        className={cn(
          "w-full text-left flex items-center px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 group relative",
          isActive && !hasSubItems
            ? "bg-white/15 text-white font-medium shadow-xs"
            : "text-white/70 hover:bg-white/10 hover:text-white",
          sidebarCollapsed ? "justify-center px-2" : "justify-between"
        )}
      >
        <div className="flex items-center gap-3 truncate">
          <div className="shrink-0 text-white/80 group-hover:text-white transition-transform duration-200 group-hover:scale-105">
            {renderIcon(item.icon)}
          </div>
          {!sidebarCollapsed && (
            <span className="truncate text-[13.5px]">{item.label}</span>
          )}
          {item.isLocked && !sidebarCollapsed && (
            <Lock size={13} className="opacity-50 ml-auto mr-1" />
          )}
        </div>

        {hasSubItems && !sidebarCollapsed && (
          <span
            onClick={(e) => {
              e.stopPropagation();
              onToggleChevron();
            }}
            className="p-1 hover:bg-white/10 rounded-md transition-colors cursor-pointer"
            title={isExpanded ? "Collapse submenu" : "Expand submenu"}
          >
            <ChevronRight
              size={14}
              className={cn(
                "text-white/50 shrink-0 transition-transform duration-200",
                isExpanded && "rotate-90 text-white"
              )}
            />
          </span>
        )}
      </button>

      {hasSubItems && (
        <SidebarSubMenu
          subItems={item.subItems!}
          isExpanded={isExpanded}
          sidebarCollapsed={sidebarCollapsed}
          isNavActive={isNavActive}
          onSelect={onSubItemClick}
        />
      )}
    </div>
  );
};

export default SidebarNavItem;
