import { useCallback, useEffect, useRef, useState } from "react";
import { notificationApi } from "../API/notification.api";
import type { NotificationPagination, NotificationRecord } from "../models/notification.model";

/**
 * Window event name broadcast by App.tsx whenever the backend notification
 * SSE stream delivers a "notifications.changed" event (a new notification was
 * created, a read-state changed, etc.). Consumers (TopBar bell + notification
 * center screen) listen for this and refresh their inbox in real time.
 */
export const NOTIFICATIONS_CHANGED_WINDOW_EVENT = "app:notifications-changed";

const LIST_PAGE_SIZE = 100;
const REALTIME_REFRESH_DEBOUNCE_MS = 300;

const EMPTY_PAGINATION: NotificationPagination = {
  page: 1,
  pageSize: LIST_PAGE_SIZE,
  totalRecords: 0,
  totalPages: 0,
};

export function useNotificationCenter() {
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [pagination, setPagination] = useState(EMPTY_PAGINATION);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [markingIds, setMarkingIds] = useState<Set<string>>(new Set());
  const [markingAll, setMarkingAll] = useState(false);

  const hasLoaded = useRef(false);
  const loadController = useRef<AbortController | null>(null);
  const refreshTimer = useRef<number | null>(null);

  const refresh = useCallback(async () => {
    loadController.current?.abort();
    const controller = new AbortController();
    loadController.current = controller;
    setError("");

    if (hasLoaded.current) setRefreshing(true);
    else setLoading(true);

    try {
      const [inbox, count] = await Promise.all([
        notificationApi.list(
          { page: 1, pageSize: LIST_PAGE_SIZE, unreadOnly: false },
          controller.signal,
        ),
        notificationApi.unreadCount(controller.signal),
      ]);
      if (controller.signal.aborted) return;

      // The apiRequest client unwraps the { success, data } envelope, and this
      // backend's GET /notifications returns the items array directly in
      // `data` with `pagination` beside it — so at runtime `inbox` is the bare
      // array. Accept both that shape and the older { items, pagination }
      // object shape defensively so `notifications` is always a real array.
      const inboxObject = inbox as
        | NotificationRecord[]
        | { items: NotificationRecord[]; pagination: NotificationPagination };
      const items = Array.isArray(inboxObject)
        ? inboxObject
        : Array.isArray(inboxObject.items)
          ? inboxObject.items
          : [];
      const receivedPagination = Array.isArray(inboxObject) ? undefined : inboxObject.pagination;

      setNotifications(items);
      setPagination(receivedPagination ?? EMPTY_PAGINATION);
      setUnreadCount(count.count);
      hasLoaded.current = true;
    } catch (reason) {
      if (!controller.signal.aborted) {
        setError(reason instanceof Error ? reason.message : "Unable to load notifications.");
      }
    } finally {
      if (loadController.current === controller) {
        loadController.current = null;
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  const scheduleRealtimeRefresh = useCallback(() => {
    if (refreshTimer.current !== null) window.clearTimeout(refreshTimer.current);
    refreshTimer.current = window.setTimeout(() => {
      refreshTimer.current = null;
      void refresh();
    }, REALTIME_REFRESH_DEBOUNCE_MS);
  }, [refresh]);

  // Initial fetch on mount; abort in-flight request on unmount.
  useEffect(() => {
    void refresh();
    return () => {
      loadController.current?.abort();
    };
  }, [refresh]);

  // Refresh when the SSE stream (via App.tsx) says the inbox changed, and
  // also whenever the window regains focus so the badge is always fresh.
  useEffect(() => {
    const handleChanged = () => scheduleRealtimeRefresh();
    const handleFocus = () => void refresh();

    window.addEventListener(NOTIFICATIONS_CHANGED_WINDOW_EVENT, handleChanged);
    window.addEventListener("focus", handleFocus);
    return () => {
      window.removeEventListener(NOTIFICATIONS_CHANGED_WINDOW_EVENT, handleChanged);
      window.removeEventListener("focus", handleFocus);
      if (refreshTimer.current !== null) window.clearTimeout(refreshTimer.current);
    };
  }, [refresh, scheduleRealtimeRefresh]);

  const markRead = useCallback(
    async (id: string) => {
      const current = notifications.find((item) => item.id === id);
      if (!current || current.readAt || markingIds.has(id)) return;

      setMarkingIds((ids) => new Set(ids).add(id));
      setError("");
      try {
        const updated = await notificationApi.markRead(id);
        setNotifications((items) => items.map((item) => (item.id === id ? updated : item)));
        setUnreadCount((count) => Math.max(0, count - 1));
      } catch (reason) {
        setError(
          reason instanceof Error ? reason.message : "Unable to mark the notification as read.",
        );
      } finally {
        setMarkingIds((ids) => {
          const next = new Set(ids);
          next.delete(id);
          return next;
        });
      }
    },
    [markingIds, notifications],
  );

  const markAllRead = useCallback(async () => {
    if (markingAll || unreadCount === 0) return;

    setMarkingAll(true);
    setError("");
    try {
      await notificationApi.markAllRead();
      const readAt = new Date().toISOString();
      setNotifications((items) => items.map((item) => (item.readAt ? item : { ...item, readAt })));
      setUnreadCount(0);
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Unable to mark all notifications as read.",
      );
    } finally {
      setMarkingAll(false);
    }
  }, [markingAll, unreadCount]);

  return {
    notifications,
    pagination,
    unreadCount,
    loading,
    refreshing,
    error,
    markingIds,
    markingAll,
    refresh,
    markRead,
    markAllRead,
  };
}
