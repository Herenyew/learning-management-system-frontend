import type {
  AttendanceRoster,
  AttendanceStatus,
  LearnerLiveSession,
  LiveSessionAttendance,
} from "../models/attendance.model";
import { apiRequest } from "./httpClient";

const id = (value: number) => encodeURIComponent(String(value));
const json = (value: unknown) => JSON.stringify(value);

export const liveSessionAttendanceApi = {
  listMine: (signal?: AbortSignal) =>
    apiRequest<LearnerLiveSession[]>("/live-sessions/my", { signal }),
  createChallenge: (sessionId: number) =>
    apiRequest<{ challenge: string; expiresInSeconds: number }>(
      `/live-sessions/${id(sessionId)}/check-in-challenge`,
      { method: "POST", body: json({}) },
    ),
  checkIn: (sessionId: number, challenge: string) =>
    apiRequest<LiveSessionAttendance>(`/live-sessions/${id(sessionId)}/check-in`, {
      method: "POST",
      body: json({ challenge }),
    }),
  roster: (sessionId: number, signal?: AbortSignal) =>
    apiRequest<AttendanceRoster>(`/live-sessions/${id(sessionId)}/attendance`, { signal }),
  finalize: (
    sessionId: number,
    records: Array<{
      enrollmentId: number;
      attendanceStatus: AttendanceStatus;
      attendancePercentage?: number | null;
      remarks?: string | null;
    }>,
  ) =>
    apiRequest(`/live-sessions/${id(sessionId)}/attendance/finalize`, {
      method: "POST",
      body: json({ records }),
    }),
};
