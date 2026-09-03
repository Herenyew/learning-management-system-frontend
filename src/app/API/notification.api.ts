import type {
  NotificationListQuery,
  NotificationListResponse,
  NotificationMarkAllReadResponse,
  NotificationRecord,
  NotificationUnreadCountResponse,
} from "../models/notification.model";
import { ApiClientError, apiRequest, apiStreamResponse } from "./httpClient";

const NOTIFICATIONS_CHANGED_EVENT = "notifications.changed";
const PERMISSIONS_CHANGED_REASON = "permissions.changed";

type NotificationChangeListenerOptions = {
  signal: AbortSignal;
  onConnected: () => void;
  onChanged: () => void;
  onPermissionsChanged?: () => void;
};

const dispatchSseEvent = (
  record: string,
  onChanged: () => void,
  onPermissionsChanged?: () => void,
) => {
  let eventName = "message";
  let dataPayload = "";

  for (const line of record.split(/\r\n|\r|\n/)) {
    if (!line || line.startsWith(":")) continue;
    const separatorIndex = line.indexOf(":");
    const field = separatorIndex === -1 ? line : line.slice(0, separatorIndex);
    let value = separatorIndex === -1 ? "" : line.slice(separatorIndex + 1);
    if (value.startsWith(" ")) value = value.slice(1);
    if (field === "event") eventName = value;
    if (field === "data") dataPayload = value;
  }

  if (eventName === NOTIFICATIONS_CHANGED_EVENT) {
    // Check the reason field in the data payload to route the event correctly
    try {
      const parsed = JSON.parse(dataPayload) as { reason?: string };
      if (parsed.reason === PERMISSIONS_CHANGED_REASON) {
        onPermissionsChanged?.();
        return;
      }
    } catch {
      // malformed data — fall through to onChanged
    }
    onChanged();
  }
};

const listenForNotificationChanges = async ({
  signal,
  onConnected,
  onChanged,
  onPermissionsChanged,
}: NotificationChangeListenerOptions) => {
  const response = await apiStreamResponse("/notifications/stream", {
    signal,
    headers: {
      Accept: "text/event-stream",
      "Cache-Control": "no-cache",
    },
  });

  if (!response.body) {
    throw new ApiClientError(
      "The notification stream did not provide a readable response body.",
      response.status,
      "NOTIFICATION_STREAM_UNAVAILABLE",
    );
  }

  onConnected();
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  const dispatchCompleteEvents = () => {
    let boundary = /\r\n\r\n|\n\n|\r\r/.exec(buffer);
    while (boundary?.index !== undefined) {
      const record = buffer.slice(0, boundary.index);
      buffer = buffer.slice(boundary.index + boundary[0].length);
      dispatchSseEvent(record, onChanged, onPermissionsChanged);
      boundary = /\r\n\r\n|\n\n|\r\r/.exec(buffer);
    }
  };

  try {
    while (!signal.aborted) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      dispatchCompleteEvents();
    }
    if (!signal.aborted) {
      buffer += decoder.decode();
      dispatchCompleteEvents();
    }
  } finally {
    reader.releaseLock();
  }
};

const queryString = ({ page = 1, pageSize = 20, unreadOnly = false }: NotificationListQuery) =>
  new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
    unreadOnly: String(unreadOnly),
  }).toString();

export const notificationApi = {
  list: (query: NotificationListQuery = {}, signal?: AbortSignal) =>
    apiRequest<NotificationListResponse>(`/notifications?${queryString(query)}`, { signal }),
  unreadCount: (signal?: AbortSignal) =>
    apiRequest<NotificationUnreadCountResponse>("/notifications/unread-count", { signal }),
  markRead: (id: string) =>
    apiRequest<NotificationRecord>(`/notifications/${encodeURIComponent(id)}/read`, {
      method: "PATCH",
    }),
  markAllRead: () =>
    apiRequest<NotificationMarkAllReadResponse>("/notifications/read-all", { method: "PATCH" }),
  listenForChanges: listenForNotificationChanges,
};
