import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { connectSocket, listenSocketMessage } from "@/services/realtime";

export interface LiveNotification {
  id: string | number;
  title?: string;
  message: string;
}

export interface NotificationAlertPreferences {
  toastEnabled: boolean;
  browserEnabled: boolean;
}

const ALERT_PREFERENCES_KEY = "nestora.notification-alert-preferences";
const defaultAlertPreferences: NotificationAlertPreferences = {
  toastEnabled: false,
  browserEnabled: true,
};

const loadAlertPreferences = (): NotificationAlertPreferences => {
  try {
    const stored = window.localStorage.getItem(ALERT_PREFERENCES_KEY);
    return stored
      ? { ...defaultAlertPreferences, ...JSON.parse(stored) }
      : defaultAlertPreferences;
  } catch {
    return defaultAlertPreferences;
  }
};

export const useNotificationAlerts = (
  onNotification: (notification: LiveNotification) => void
) => {
  const [alertPreferences, setAlertPreferences] =
    useState<NotificationAlertPreferences>(loadAlertPreferences);
  const alertPreferencesRef = useRef(alertPreferences);
  const onNotificationRef = useRef(onNotification);

  useEffect(() => {
    alertPreferencesRef.current = alertPreferences;
    window.localStorage.setItem(ALERT_PREFERENCES_KEY, JSON.stringify(alertPreferences));
  }, [alertPreferences]);

  useEffect(() => {
    onNotificationRef.current = onNotification;
  }, [onNotification]);

  useEffect(() => {
    const unsubscribe = listenSocketMessage((event) => {
      if (event.type !== "notification.created") return;
      const notification = event.notification as LiveNotification | undefined;
      if (!notification?.id || !notification.message) return;

      onNotificationRef.current(notification);
      showLiveAlert(notification, alertPreferencesRef.current);
    });
    void connectSocket().catch(() => {
      // Inbox polling remains available when realtime is unavailable.
    });
    return unsubscribe;
  }, []);

  const setToastEnabled = (toastEnabled: boolean) => {
    setAlertPreferences((previous) => ({ ...previous, toastEnabled }));
  };

  const setBrowserEnabled = async (browserEnabled: boolean) => {
    if (!browserEnabled) {
      setAlertPreferences((previous) => ({ ...previous, browserEnabled: false }));
      return;
    }
    if (!("Notification" in window)) {
      toast.error("Browser notifications are not supported by this browser.");
      return;
    }
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      toast.error("Browser notification permission was not granted.");
      setAlertPreferences((previous) => ({ ...previous, browserEnabled: false }));
      return;
    }
    setAlertPreferences((previous) => ({ ...previous, browserEnabled: true }));
  };

  return { alertPreferences, setToastEnabled, setBrowserEnabled };
};

const showLiveAlert = (
  notification: LiveNotification,
  preferences: NotificationAlertPreferences
) => {
  const title = notification.title || "New notification";
  if (preferences.toastEnabled && document.visibilityState === "visible") {
    toast(title, { description: notification.message });
  }
  if (
    preferences.browserEnabled &&
    document.visibilityState !== "visible" &&
    "Notification" in window &&
    Notification.permission === "granted"
  ) {
    new Notification(title, { body: notification.message, tag: String(notification.id) });
  }
};
