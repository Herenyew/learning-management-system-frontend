export const NOTIFICATION_EVENT_CODES = [
  "COURSE_ENROLLMENT_CONFIRMED",
  "PROGRAM_ENROLLMENT_CONFIRMED",
  "TNA_REQUEST_SUBMITTED",
  "TNA_REQUEST_APPROVED",
  "TNA_REQUEST_REJECTED",
  "COURSE_PUBLISHING_REVIEW_REQUESTED",
  "COURSE_PUBLISHED",
  "COURSE_REJECTED",
  "COURSE_REVISION_REQUESTED",
  "CERTIFICATE_ISSUED",
  "CERTIFICATE_EXPIRING",
] as const;

export type NotificationEventCode = (typeof NOTIFICATION_EVENT_CODES)[number];

export type NotificationRecord = {
  id: string;
  title: string;
  body: string | null;
  eventCode: NotificationEventCode;
  notificationType: string;
  actionUrl: string | null;
  readAt: string | null;
  createdAt: string;
};

export type NotificationPagination = {
  page: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
};

export type NotificationListResponse = {
  items: NotificationRecord[];
  pagination: NotificationPagination;
};

export type NotificationListQuery = {
  page?: number;
  pageSize?: number;
  unreadOnly?: boolean;
};

export type NotificationUnreadCountResponse = { count: number };
export type NotificationMarkAllReadResponse = { updatedCount: number };
