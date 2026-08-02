import React, { useMemo, useState } from "react";
import {
  AlertCircle,
  Archive,
  Award,
  BarChart2,
  BookOpen,
  Calendar,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  Confirm,
  Copy,
  CrudModal,
  CrudShell,
  Download,
  Edit,
  Eye,
  Field,
  FileText,
  Filter,
  GitBranch,
  HelpCircle,
  Inp,
  Layers,
  LayoutDashboard,
  MessageSquare,
  MoreHorizontal,
  P,
  Plus,
  RefreshCw,
  SaveBtn,
  Search,
  Sel,
  Shield,
  StatusBadge,
  Target,
  Textarea,
  Trash2,
  TrendingUp,
  UserCheck,
  Users,
  X,
  Zap,
} from "./adminRecords.shared";
import type { CrudColumn, CrudRow } from "./adminRecords.shared";

type NotifTemplate = CrudRow & {
  event: string;
  recipients: string;
  channels: string;
  category: string;
};

const NOTIF_INIT: NotifTemplate[] = [
  {
    id: "nt1",
    name: "Welcome / Onboarding Email",
    event: "New learner first login",
    recipients: "Learner",
    channels: "Email",
    category: "System",
    status: "Active",
  },
  {
    id: "nt2",
    name: "Course Enrollment Confirmed",
    event: "Learner enrolls in course",
    recipients: "Learner",
    channels: "Email + In-app",
    category: "Course",
    status: "Active",
  },
  {
    id: "nt3",
    name: "Assignment Deadline — 7 Days",
    event: "7 days before deadline",
    recipients: "Learner",
    channels: "Email",
    category: "Reminder",
    status: "Active",
  },
  {
    id: "nt4",
    name: "Assignment Deadline — 3 Days",
    event: "3 days before deadline",
    recipients: "Learner, Manager",
    channels: "Email + In-app",
    category: "Reminder",
    status: "Active",
  },
  {
    id: "nt5",
    name: "Course Completion",
    event: "Learner completes course",
    recipients: "Learner, Manager",
    channels: "In-app",
    category: "Course",
    status: "Active",
  },
  {
    id: "nt6",
    name: "Certificate Issued",
    event: "Certificate generated",
    recipients: "Learner",
    channels: "Email",
    category: "Certification",
    status: "Active",
  },
  {
    id: "nt7",
    name: "Certificate Expiry — 30 Days",
    event: "30 days before cert expiry",
    recipients: "Learner, Manager",
    channels: "Email",
    category: "Certification",
    status: "Active",
  },
  {
    id: "nt8",
    name: "TNA Request Approved",
    event: "TNA request approved",
    recipients: "Learner",
    channels: "Email",
    category: "TNA",
    status: "Active",
  },
  {
    id: "nt9",
    name: "TNA Request Rejected",
    event: "TNA request rejected",
    recipients: "Learner",
    channels: "Email",
    category: "TNA",
    status: "Active",
  },
  {
    id: "nt10",
    name: "Leaderboard Position Change",
    event: "Rank changes on leaderboard",
    recipients: "Learner",
    channels: "In-app",
    category: "Gamification",
    status: "Disabled",
  },
  {
    id: "nt11",
    name: "Manager Weekly Team Summary",
    event: "Weekly digest — Monday 8am",
    recipients: "Manager",
    channels: "Email",
    category: "Digest",
    status: "Active",
  },
];

export function NotificationsCrud() {
  const [rows, setRows] = useState<NotifTemplate[]>(NOTIF_INIT);
  const catColor = (c: string) =>
    c === "Course"
      ? { bg: P.lightSage, color: P.darkOlive }
      : c === "Certification"
        ? { bg: P.goldLight, color: "#8A6A1A" }
        : c === "TNA"
          ? { bg: "#EDE9FE", color: "#5B21B6" }
          : c === "Reminder"
            ? { bg: "#FEE2E2", color: "#B91C1C" }
            : c === "Gamification"
              ? { bg: "#D8EDCC", color: "#3A6420" }
              : { bg: P.paleGreen, color: P.textMid };
  return (
    <CrudShell<NotifTemplate>
      title="Notification Templates"
      sub="Create, edit, and disable notification templates — no code changes required"
      icon={MessageSquare}
      columns={[
        {
          key: "name",
          label: "Template Name",
          sortable: true,
          render: (r) => (
            <p className="text-xs font-semibold" style={{ color: P.text }}>
              {r.name}
            </p>
          ),
        },
        {
          key: "category",
          label: "Category",
          sortable: true,
          render: (r) => {
            const s = catColor(r.category);
            return (
              <span
                className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                style={{ background: s.bg, color: s.color }}
              >
                {r.category}
              </span>
            );
          },
        },
        {
          key: "event",
          label: "Trigger Event",
          render: (r) => (
            <p className="text-xs" style={{ color: P.textMuted }}>
              {r.event}
            </p>
          ),
        },
        {
          key: "recipients",
          label: "Recipients",
          render: (r) => (
            <p className="text-xs" style={{ color: P.textMuted }}>
              {r.recipients}
            </p>
          ),
        },
        { key: "channels", label: "Channels" },
        {
          key: "status",
          label: "Status",
          sortable: true,
          render: (r) => <StatusBadge status={r.status} />,
        },
      ]}
      rows={rows}
      onRows={setRows}
      filterOptions={{ label: "Status", values: ["Active", "Disabled"] }}
      createLabel="New Template"
      showArchive={false}
      toggleStatus={{
        enabled: "Active",
        disabled: "Disabled",
        enableLabel: "Enable",
        disableLabel: "Disable",
      }}
      cloneRow={(r) => ({
        ...r,
        id: `nt${Date.now()}`,
        name: `${r.name} (Copy)`,
        status: "Disabled",
      })}
      renderForm={(row, onSave, onClose) => {
        const [form, setForm] = useState<NotifTemplate>(
          row ?? {
            id: `nt${Date.now()}`,
            name: "",
            event: "",
            recipients: "Learner",
            channels: "Email",
            category: "Course",
            status: "Active",
          },
        );
        return (
          <CrudModal
            title={row ? "Edit Notification Template" : "New Notification Template"}
            onClose={onClose}
          >
            <div className="space-y-4">
              <Field label="Template Name" required>
                <Inp
                  value={form.name}
                  onChange={(v) => setForm({ ...form, name: v })}
                  placeholder="e.g. Course Completion Confirmation"
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Category">
                  <Sel
                    value={form.category}
                    onChange={(v) => setForm({ ...form, category: v })}
                    options={[
                      "System",
                      "Course",
                      "Reminder",
                      "Certification",
                      "TNA",
                      "Gamification",
                      "Digest",
                      "Program",
                    ]}
                  />
                </Field>
                <Field label="Status">
                  <Sel
                    value={form.status}
                    onChange={(v) => setForm({ ...form, status: v })}
                    options={["Active", "Disabled"]}
                  />
                </Field>
              </div>
              <Field label="Trigger Event">
                <Inp
                  value={form.event}
                  onChange={(v) => setForm({ ...form, event: v })}
                  placeholder="e.g. Learner completes a course"
                />
              </Field>
              <Field label="Recipients">
                <Inp
                  value={form.recipients}
                  onChange={(v) => setForm({ ...form, recipients: v })}
                  placeholder="e.g. Learner, Manager"
                />
              </Field>
              <Field label="Channels">
                <Sel
                  value={form.channels}
                  onChange={(v) => setForm({ ...form, channels: v })}
                  options={["Email", "In-app", "Email + In-app", "SMS", "Push", "None"]}
                />
              </Field>
              <SaveBtn onSave={() => onSave(form)} onClose={onClose} />
            </div>
          </CrudModal>
        );
      }}
    />
  );
}

// ─── 8. XP Rules ─────────────────────────────────────────────
