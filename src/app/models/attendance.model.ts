export type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE" | "PARTIAL" | "NO_SHOW";

export type LiveSessionAttendance = {
  id: number;
  sessionId: number;
  enrollmentId: number;
  attendanceStatus: AttendanceStatus;
  checkInTime: string | null;
  checkOutTime: string | null;
  attendancePercentage: number | null;
  remarks: string | null;
};

export type LearnerLiveSession = {
  id: number;
  title: string;
  description: string | null;
  sessionType: "VIRTUAL" | "PHYSICAL" | "HYBRID";
  status: "SCHEDULED" | "LIVE" | "COMPLETED" | "CANCELLED";
  startTime: string;
  endTime: string;
  timezone: string;
  venue: string | null;
  meetingUrl: string | null;
  attendanceRequired: boolean;
  courseVersion: { course: { id: number; title: string } };
  attendees: LiveSessionAttendance[];
};

export type AttendanceRoster = {
  session: LearnerLiveSession & { courseVersionId: number };
  enrollments: Array<{
    id: number;
    status: string;
    employee: { id: string; fullName: string };
    liveSessionAttendances: LiveSessionAttendance[];
  }>;
};
