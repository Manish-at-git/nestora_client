import { Settings2 } from "lucide-react";

import type { NotificationAlertPreferences } from "./useNotificationAlerts";

interface NotificationAlertSettingsProps {
  preferences: NotificationAlertPreferences;
  onToastEnabledChange: (enabled: boolean) => void;
  onBrowserEnabledChange: (enabled: boolean) => void;
}

interface NotificationAlertSettingsButtonProps {
  onClick: () => void;
}

export const NotificationAlertSettingsButton = ({
  onClick,
}: NotificationAlertSettingsButtonProps) => (
  <button
    onClick={onClick}
    className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded cursor-pointer"
    title="Notification alert settings"
    aria-label="Notification alert settings"
  >
    <Settings2 size={15} />
  </button>
);

export const NotificationAlertSettings = ({
  preferences,
  onToastEnabledChange,
  onBrowserEnabledChange,
}: NotificationAlertSettingsProps) => (
  <div className="px-4 py-3 border-b border-slate-100 bg-white space-y-2">
    <label className="flex items-center justify-between gap-3 text-xs text-slate-700 cursor-pointer">
      <span>In-app toast alerts</span>
      <input
        type="checkbox"
        checked={preferences.toastEnabled}
        onChange={(event) => onToastEnabledChange(event.target.checked)}
        className="h-4 w-4 accent-moss"
      />
    </label>
    <label className="flex items-center justify-between gap-3 text-xs text-slate-700 cursor-pointer">
      <span>Browser alerts when this tab is inactive</span>
      <input
        type="checkbox"
        checked={preferences.browserEnabled}
        onChange={(event) => onBrowserEnabledChange(event.target.checked)}
        className="h-4 w-4 accent-moss"
      />
    </label>
  </div>
);
