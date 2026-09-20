import React from "react";

export interface DashboardHeaderProps {
  displayName: string;
  subtitle?: string;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  displayName,
  subtitle = "This is your timeline. Announcements, events, and meetings all live right here.",
}) => {
  return (
    <div className="mb-8">
      <h2 className="text-3xl sm:text-4xl font-display text-slate-800 tracking-tight">
        Good to see you, <span className="capitalize">{displayName}</span>.
      </h2>
      <p className="text-slate-500 mt-2 text-sm sm:text-base">
        {subtitle}
      </p>
    </div>
  );
};

export default DashboardHeader;

