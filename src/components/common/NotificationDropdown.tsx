import React, { useState, useEffect, useRef } from "react";
import { Bell, CheckCheck, ChevronRight, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import apiClient from "@/services/api/apiClient";
import {
  NotificationAlertSettings,
  NotificationAlertSettingsButton,
} from "./notification-alerts/NotificationAlertSettings";
import {
  useNotificationAlerts,
  type LiveNotification,
} from "./notification-alerts/useNotificationAlerts";

export interface NotificationItem {
  id: string | number;
  title?: string;
  message: string;
  is_read?: number | boolean;
  created_at?: string;
  type?: string;
  entity_type?: string;
  entity_id?: string;
  action_url?: string;
  read_at?: string;
  metadata?: Record<string, unknown>;
}

interface NotificationPage {
  items: NotificationItem[];
  next_cursor?: string | null;
  unread_count: number;
}

export const NotificationDropdown: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [showAlertSettings, setShowAlertSettings] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { alertPreferences, setToastEnabled, setBrowserEnabled } = useNotificationAlerts(
    (notification: LiveNotification) => {
      setNotifications((previous) => {
        if (previous.some((item) => String(item.id) === String(notification.id))) {
          return previous;
        }
        setUnreadCount((count) => count + 1);
        return [notification, ...previous];
      });
    }
  );

  const fetchNotifications = async (cursor?: string) => {
    try {
      const res = await apiClient.get("/notifications", {
        params: cursor ? { cursor } : undefined,
      });
      const data = res.data?.data as NotificationPage | NotificationItem[] | undefined;
      if (Array.isArray(data)) {
        setNotifications(data);
        setNextCursor(null);
        setUnreadCount(data.filter((notification) => !notification.is_read).length);
      } else if (data && Array.isArray(data.items)) {
        setNotifications((previous) => {
          if (!cursor) {
            return data.items;
          }
          const knownIds = new Set(previous.map((notification) => String(notification.id)));
          return [...previous, ...data.items.filter((item) => !knownIds.has(String(item.id)))];
        });
        setNextCursor(data.next_cursor || null);
        setUnreadCount(data.unread_count);
      } else if (Array.isArray(res.data)) {
        setNotifications(res.data);
        setNextCursor(null);
        setUnreadCount(res.data.filter((notification: NotificationItem) => !notification.is_read).length);
      }
    } catch {
      // silently ignore polling failure
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id: string | number, isRead?: number | boolean) => {
    if (isRead) return true;
    try {
      await apiClient.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: 1 } : n))
      );
      setUnreadCount((count) => Math.max(0, count - 1));
      return true;
    } catch {
      return false;
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await apiClient.post("/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
      setUnreadCount(0);
    } catch {
      // ignore
    }
  };

  const handleNotificationClick = async (notification: NotificationItem) => {
    const markedRead = await handleMarkAsRead(notification.id, notification.is_read);
    const actionUrl = getNotificationActionUrl(notification);
    if (!markedRead || !actionUrl) {
      return;
    }
    setIsOpen(false);
    navigate(actionUrl);
  };

  return (
    <div className="relative" ref={dropdownRef}>

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-150 cursor-pointer select-none text-slate-600 hover:text-slate-900 hover:bg-white bg-white/70 border border-slate-200/60 shadow-2xs"
        title="Notifications"
        aria-label="Notifications"
      >
        <Bell size={19} />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-rose-500 animate-pulse" />
        )}
      </button>

      {isOpen && (
        <div className="fixed sm:absolute inset-x-3 sm:inset-x-auto sm:right-0 top-16 sm:top-auto sm:mt-2 w-auto sm:w-[24rem] max-w-[calc(100vw-1.5rem)] origin-top-right overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xl shadow-slate-900/15 z-50 animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-slate-50 to-indigo-50/50 px-3.5 py-2.5">
            <div className="flex items-center gap-2.5">
              <span className="text-sm font-bold tracking-tight text-slate-800">Notifications</span>
              {unreadCount > 0 && (
                <span className="rounded-full border border-indigo-100 bg-indigo-600 px-1.5 py-0.5 text-[10px] font-bold leading-none text-white shadow-sm shadow-indigo-200">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="flex items-center gap-1 rounded-lg px-1.5 py-1 text-[11px] font-semibold text-indigo-600 transition-colors hover:bg-indigo-100 hover:text-indigo-700 cursor-pointer"
                >
                  <CheckCheck size={13} /> Mark all read
                </button>
              )}
              <NotificationAlertSettingsButton
                onClick={() => setShowAlertSettings((visible) => !visible)}
              />
            </div>
          </div>

          {showAlertSettings ? (
            <NotificationAlertSettings
              preferences={alertPreferences}
              onToastEnabledChange={setToastEnabled}
              onBrowserEnabledChange={(enabled) => void setBrowserEnabled(enabled)}
            />
          ) : null}

          {/* List */}
          <div className="max-h-[22rem] overflow-y-auto sidebar-scrollbar">
            {notifications.length === 0 ? (
              <div className="px-4 py-9 text-center text-xs text-slate-400 animate-in fade-in duration-200">
                You are all caught up
              </div>
            ) : (
              notifications.map((n, index) => {
                const isUnread = !n.is_read;
                return (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => void handleNotificationClick(n)}
                    style={{ animationDelay: `${Math.min(index * 35, 210)}ms` }}
                    className={`group relative flex w-full items-start gap-2.5 border-b border-slate-100 px-3.5 py-2.5 text-left transition-all duration-200 motion-reduce:animate-none animate-in fade-in slide-in-from-right-2 ${isUnread
                        ? "border-l-2 border-l-indigo-500 bg-gradient-to-r from-indigo-50 via-indigo-50/60 to-white hover:from-indigo-100 hover:to-indigo-50"
                        : "border-l-2 border-l-transparent hover:bg-slate-50"
                      }`}
                  >
                    <div
                      className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full transition-all duration-200 ${isUnread
                          ? "bg-indigo-500 shadow-sm shadow-indigo-400"
                          : "bg-slate-200"
                        }`}
                    />
                    <div className="min-w-0 flex-1">
                      {n.title && (
                        <h4
                          className={`truncate text-xs ${isUnread
                              ? "font-bold text-slate-900"
                              : "font-semibold text-slate-700"
                            }`}
                        >
                          {n.title}
                        </h4>
                      )}
                      <p className="mt-0.5 line-clamp-2 text-[11px] leading-4 text-slate-500">
                        {n.message}
                      </p>
                      {n.created_at && (
                        <span className="mt-1 flex items-center gap-1 text-[10px] font-medium text-slate-400">
                          <Clock size={10} strokeWidth={2.25} />
                          {new Date(n.created_at).toLocaleString([], {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      )}
                    </div>
                    {getNotificationActionUrl(n) ? (
                      <ChevronRight
                        size={15}
                        className="mt-2 shrink-0 text-slate-300 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-indigo-500"
                      />
                    ) : null}
                  </button>
                );
              })
            )}
          </div>
          {nextCursor ? (
            <div className="border-t border-slate-100 bg-slate-50/70 p-2 text-center">
              <button
                type="button"
                onClick={() => void fetchNotifications(nextCursor)}
                className="rounded-lg px-2 py-1 text-[11px] font-semibold text-indigo-600 transition-colors hover:bg-indigo-100 hover:text-indigo-700"
              >
                Load older notifications
              </button>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

const isInternalActionUrl = (actionUrl?: string): actionUrl is string =>
  Boolean(actionUrl && actionUrl.startsWith("/") && !actionUrl.startsWith("//"));

const getNotificationActionUrl = (notification: NotificationItem): string | null => {
  if (notification.entity_id === undefined || notification.entity_id === null) {
    return isInternalActionUrl(notification.action_url) ? notification.action_url : null;
  }

  const entityId = encodeURIComponent(String(notification.entity_id));
  if (notification.entity_type === "service_request") {
    return `/service-requests/${entityId}`;
  }
  if (notification.entity_type === "board_task") {
    return `/board-tasks/${entityId}`;
  }

  return isInternalActionUrl(notification.action_url) ? notification.action_url : null;
};

export default NotificationDropdown;
