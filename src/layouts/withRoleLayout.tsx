import React, { useState } from "react";
import { RoleLayout, RoleLayoutProps } from "./RoleLayout";
import { NavItem } from "@/types/navigation";

export interface WithRoleLayoutOptions {
  title?: string;
  description?: string;
  defaultTab?: string;
  navItems?: NavItem[];
  headerControls?: React.ReactNode | ((props: any) => React.ReactNode);
}

/**
 * Higher-Order Component (HOC) to wrap any page/feature component with RoleLayout
 *
 * Usage:
 * export default withRoleLayout(AdminDashboard, {
 *   title: "Admin Portal",
 *   description: "Association management hub",
 *   defaultTab: "overview",
 * });
 */
export function withRoleLayout<P extends object>(
  WrappedComponent: React.ComponentType<P & { activeTab: string; onTabChange: (tab: string) => void }>,
  options: WithRoleLayoutOptions = {}
) {
  const WithRoleLayoutComponent: React.FC<P & { initialTab?: string }> = (props) => {
    const [activeTab, setActiveTab] = useState<string>(
      props.initialTab || options.defaultTab || "overview"
    );

    const title = options.title || "Dashboard";
    const description = options.description;
    const headerControls =
      typeof options.headerControls === "function"
        ? options.headerControls(props)
        : options.headerControls;

    return (
      <RoleLayout
        title={title}
        description={description}
        navItems={options.navItems}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        headerControls={headerControls}
      >
        <WrappedComponent
          {...props}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </RoleLayout>
    );
  };

  WithRoleLayoutComponent.displayName = `withRoleLayout(${
    WrappedComponent.displayName || WrappedComponent.name || "Component"
  })`;

  return WithRoleLayoutComponent;
}

export default withRoleLayout;
