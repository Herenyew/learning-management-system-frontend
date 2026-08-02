import { useState } from "react";

import { CfgSection, P, SaveBar } from "./configuration.shared";

type NotificationAreaId = "course" | "program" | "assignment" | "certificate-expiry";

type NotificationArea = {
  id: NotificationAreaId;
  label: string;
  description: string;
  channels: string[];
};

const CHANNELS = ["Email", "In-app", "SMS", "Push"];

const DEFAULT_NOTIFICATION_AREAS: NotificationArea[] = [
  {
    id: "course",
    label: "Course",
    description: "Course publishing, updates, and learner activity",
    channels: ["Email", "In-app"],
  },
  {
    id: "program",
    label: "Program",
    description: "Program enrollment, progress, and completion",
    channels: ["Email", "In-app"],
  },
  {
    id: "assignment",
    label: "Assignment",
    description: "New assignments, due dates, and overdue reminders",
    channels: ["Email", "In-app"],
  },
  {
    id: "certificate-expiry",
    label: "Certificate Expiry",
    description: "Upcoming certificate expiry and renewal reminders",
    channels: ["Email", "In-app"],
  },
];

export function ConfigNotifications() {
  const [notificationAreas, setNotificationAreas] = useState(DEFAULT_NOTIFICATION_AREAS);

  const toggleChannel = (areaId: NotificationAreaId, channel: string) => {
    setNotificationAreas((areas) =>
      areas.map((area) =>
        area.id === areaId
          ? {
              ...area,
              channels: area.channels.includes(channel)
                ? area.channels.filter((item) => item !== channel)
                : [...area.channels, channel],
            }
          : area,
      ),
    );
  };

  return (
    <div className="space-y-5">
      <CfgSection title="Notification Channels">
        <p className="mb-4 text-[11px]" style={{ color: P.textMuted }}>
          Choose how notifications are delivered for each learning area.
        </p>

        <div className="space-y-2">
          {notificationAreas.map((area) => (
            <div
              key={area.id}
              className="grid gap-3 rounded-xl border px-4 py-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
              style={{ borderColor: P.border, background: "white" }}
            >
              <div>
                <p className="text-xs font-semibold" style={{ color: P.textMid }}>
                  {area.label}
                </p>
                <p className="mt-0.5 text-[10px]" style={{ color: P.textMuted }}>
                  {area.description}
                </p>
              </div>

              <div className="flex flex-wrap gap-1.5" aria-label={`${area.label} channels`}>
                {CHANNELS.map((channel) => {
                  const selected = area.channels.includes(channel);

                  return (
                    <button
                      key={channel}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => toggleChannel(area.id, channel)}
                      className="rounded-full px-3 py-1 text-[10px] font-medium transition-colors"
                      style={{
                        background: selected ? P.lightSage : P.bg,
                        color: selected ? P.darkOlive : P.textMuted,
                        border: `1px solid ${selected ? P.sage : P.border}`,
                      }}
                    >
                      {channel}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </CfgSection>

      <SaveBar />
    </div>
  );
}
