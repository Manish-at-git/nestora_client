import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { toggleSidebar, closeMobileSidebar } from "@/app/uiSlice";
import { NavItem, NavSubItem } from "@/types/navigation";
import { SidebarHeader } from "./SidebarHeader";
import { SidebarNavItem } from "./SidebarNavItem";
import { SidebarFooter } from "./SidebarFooter";
import { cn } from "@/lib/utils";

export interface SidebarProps {
  navItems: NavItem[];
  activeTab?: string;
  onTabChange?: (tabKey: string) => void;
  onUpgradeModalOpen?: (featureName: string) => void;
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  navItems,
  activeTab,
  onTabChange,
  onUpgradeModalOpen,
  className,
}) => {
  const { account, profile, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const sidebarCollapsed = useAppSelector((state) => state.ui.sidebarCollapsed);
  const mobileSidebarOpen = useAppSelector((state) => state.ui.mobileSidebarOpen);
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});

  // Auto-close mobile sidebar whenever route changes
  useEffect(() => {
    dispatch(closeMobileSidebar());
  }, [location.pathname, dispatch]);

  // Close mobile sidebar on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileSidebarOpen) {
        dispatch(closeMobileSidebar());
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileSidebarOpen, dispatch]);

  const toggleMenu = (key: string, currentExpandedState: boolean) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [key]: !currentExpandedState,
    }));
  };

  const displayName = profile?.name || account?.name || account?.email?.split("@")[0] || "User";

  const isNavActive = (itemPath?: string, itemKey?: string): boolean => {
    if (activeTab && activeTab === itemKey) return true;
    if (!itemPath) return false;
    if (
      itemPath === "/dashboard" ||
      itemPath === "/admin" ||
      itemPath === "/super-admin" ||
      itemPath === "/security" ||
      itemPath === "/financials"
    ) {
      return location.pathname === itemPath;
    }
    return (
      location.pathname === itemPath ||
      (itemPath !== "/" && location.pathname.startsWith(`${itemPath}/`))
    );
  };

  const handleItemClick = (it: NavItem, currentlyExpanded: boolean) => {
    if (it.isLocked) {
      onUpgradeModalOpen?.(it.label);
      return;
    }
    if (it.subItems && it.subItems.length > 0) {
      if (sidebarCollapsed) {
        dispatch(toggleSidebar());
        setExpandedMenus((prev) => ({ ...prev, [it.key]: true }));
      } else {
        toggleMenu(it.key, currentlyExpanded);
      }
      return;
    }
    if (it.path) {
      navigate(it.path);
      onTabChange?.(it.key);
    } else {
      onTabChange?.(it.key);
    }
    // Auto-close on mobile/tablet after navigation
    dispatch(closeMobileSidebar());
  };

  const handleSubItemClick = (sub: NavSubItem) => {
    if (sub.isLocked) {
      onUpgradeModalOpen?.(sub.label);
    } else if (sub.path) {
      navigate(sub.path);
      onTabChange?.(sub.key);
    } else {
      onTabChange?.(sub.key);
    }
    // Auto-close on mobile/tablet after navigation
    dispatch(closeMobileSidebar());
  };

  const handleHeaderToggle = () => {
    if (window.innerWidth < 1024) {
      dispatch(closeMobileSidebar());
    } else {
      dispatch(toggleSidebar());
    }
  };

  return (
    <>
      {/* Mobile & Tablet Backdrop Overlay */}
      {mobileSidebarOpen && (
        <div
          role="button"
          tabIndex={0}
          aria-label="Close navigation drawer"
          onClick={() => dispatch(closeMobileSidebar())}
          onKeyDown={(e) => {
            if (e.key === "Escape" || e.key === "Enter") dispatch(closeMobileSidebar());
          }}
          className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300 lg:hidden cursor-pointer"
        />
      )}

      {/* Main Sidebar (Floating on desktop, full-height slide-over drawer on mobile/tablet) */}
      <aside
        className={cn(
          "fixed z-[70] lg:z-30 flex flex-col bg-slate-900 text-white shadow-2xl transition-all duration-300 ease-in-out border border-white/10 select-none",
          // Mobile & Tablet (<1024px): off-canvas drawer
          "top-0 bottom-0 left-0 h-full w-72 p-5 rounded-r-3xl rounded-l-none",
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full",
          // Desktop (>=1024px): floating glassmorphic sidebar
          "lg:translate-x-0 lg:top-4 lg:bottom-4 lg:left-4 lg:rounded-3xl lg:h-[calc(100vh-2rem)]",
          sidebarCollapsed ? "lg:w-20 lg:p-3" : "lg:w-64 lg:p-5",
          className
        )}
      >
        {/* Header */}
        <SidebarHeader
          sidebarCollapsed={sidebarCollapsed}
          onToggle={handleHeaderToggle}
        />

        {/* Navigation List */}
        <nav className="space-y-1.5 text-sm overflow-y-auto flex-1 min-h-0 pr-1 sidebar-scrollbar">
          {navItems.map((it) => {
            const hasChildren = Boolean(it.subItems && it.subItems.length > 0);
            const isChildActive =
              hasChildren &&
              Boolean(it.subItems!.some((sub) => isNavActive(sub.path, sub.key)));
            const isActive =
              (!hasChildren && isNavActive(it.path, it.key)) || isChildActive;
            const isExpanded =
              expandedMenus[it.key] !== undefined
                ? expandedMenus[it.key]
                : isChildActive;

            return (
              <SidebarNavItem
                key={it.key}
                item={it}
                isActive={isActive}
                isExpanded={isExpanded}
                sidebarCollapsed={sidebarCollapsed}
                isNavActive={isNavActive}
                onClick={() => handleItemClick(it, isExpanded)}
                onToggleChevron={() => toggleMenu(it.key, isExpanded)}
                onSubItemClick={handleSubItemClick}
              />
            );
          })}
        </nav>

        {/* Footer */}
        <SidebarFooter
          sidebarCollapsed={sidebarCollapsed}
          displayName={displayName}
          role={account?.role}
          onProfileClick={() => {
            navigate("/profile");
            dispatch(closeMobileSidebar());
          }}
          onLogout={async () => {
            dispatch(closeMobileSidebar());
            await logout();
            navigate("/signin");
          }}
        />
      </aside>
    </>
  );
};

export default Sidebar;

