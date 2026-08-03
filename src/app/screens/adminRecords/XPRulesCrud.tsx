import React, { useEffect, useState } from "react";
import {
  CrudModal,
  CrudShell,
  Field,
  Inp,
  P,
  SaveBtn,
  Sel,
  StatusBadge,
  Zap,
} from "./adminRecords.shared";
import type { CrudRow } from "./adminRecords.shared";

type XPRule = CrudRow & {
  trigger: string;
  xp: number;
  category: string;
  cap: number | null;
};

const XP_RULES_STORAGE_KEY = "learnos.xp-rules";

const XP_INIT: XPRule[] = [
  {
    id: "xp1",
    name: "Course Completion",
    trigger: "Learner completes a course",
    xp: 300,
    category: "Completion",
    cap: null,
    status: "Active",
  },
  {
    id: "xp2",
    name: "Program Completion",
    trigger: "Learner completes a full program",
    xp: 1200,
    category: "Completion",
    cap: null,
    status: "Active",
  },
  {
    id: "xp3",
    name: "Quiz Pass",
    trigger: "Quiz passed (≥70%)",
    xp: 80,
    category: "Assessment",
    cap: 400,
    status: "Active",
  },
  {
    id: "xp4",
    name: "Quiz High Score",
    trigger: "Quiz score ≥90%",
    xp: 150,
    category: "Assessment",
    cap: null,
    status: "Active",
  },
  {
    id: "xp5",
    name: "Perfect Quiz Score",
    trigger: "Quiz score = 100%",
    xp: 250,
    category: "Assessment",
    cap: null,
    status: "Active",
  },
  {
    id: "xp6",
    name: "Program Milestone",
    trigger: "Learner reaches a program milestone",
    xp: 100,
    category: "Program",
    cap: null,
    status: "Active",
  },
  {
    id: "xp7",
    name: "Early Completion Bonus",
    trigger: "Completed before deadline",
    xp: 50,
    category: "Bonus",
    cap: null,
    status: "Active",
  },
  {
    id: "xp8",
    name: "Streak Bonus — 7 Days",
    trigger: "7-day consecutive learning streak",
    xp: 75,
    category: "Engagement",
    cap: null,
    status: "Active",
  },
  {
    id: "xp9",
    name: "Course Rating Submitted",
    trigger: "Learner submits course rating",
    xp: 20,
    category: "Engagement",
    cap: 100,
    status: "Disabled",
  },
];

function loadXpRules(): XPRule[] {
  if (typeof window === "undefined") return XP_INIT;

  try {
    const stored = window.localStorage.getItem(XP_RULES_STORAGE_KEY);
    if (!stored) return XP_INIT;

    const parsed: unknown = JSON.parse(stored);
    if (
      Array.isArray(parsed) &&
      parsed.every(
        (item) =>
          typeof item === "object" &&
          item !== null &&
          typeof item.id === "string" &&
          typeof item.name === "string" &&
          typeof item.trigger === "string" &&
          typeof item.xp === "number" &&
          typeof item.category === "string" &&
          (item.cap === null || typeof item.cap === "number") &&
          typeof item.status === "string",
      )
    ) {
      return parsed as XPRule[];
    }
  } catch {
    // Ignore malformed prototype data and restore the default rules.
  }

  return XP_INIT;
}

function FormError({ children }: { children?: string }) {
  if (!children) return null;
  return (
    <p className="mt-1.5 text-xs" role="alert" style={{ color: "#B91C1C" }}>
      {children}
    </p>
  );
}

function XPRuleForm({
  row,
  rows,
  onSave,
  onClose,
}: {
  row: XPRule | null;
  rows: XPRule[];
  onSave: (row: XPRule) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<XPRule>(() =>
    row
      ? { ...row }
      : {
          id: `xp${Date.now()}`,
          name: "",
          trigger: "",
          xp: 100,
          category: "Completion",
          cap: null,
          status: "Active",
        },
  );
  const [errors, setErrors] = useState<Partial<Record<"name" | "trigger" | "xp" | "cap", string>>>(
    {},
  );

  const clearError = (field: keyof typeof errors) =>
    setErrors((current) => ({ ...current, [field]: undefined }));

  const handleSave = () => {
    const name = form.name.trim();
    const trigger = form.trigger.trim();
    const nextErrors: typeof errors = {};

    if (!name) nextErrors.name = "Rule name is required.";
    else if (
      rows.some(
        (item) => item.id !== form.id && item.name.trim().toLowerCase() === name.toLowerCase(),
      )
    ) {
      nextErrors.name = "An XP rule with this name already exists.";
    }
    if (!trigger) nextErrors.trigger = "Trigger condition is required.";
    if (!Number.isFinite(form.xp) || form.xp < 0) {
      nextErrors.xp = "XP awarded must be zero or greater.";
    }
    if (form.cap !== null && (!Number.isFinite(form.cap) || form.cap < 0)) {
      nextErrors.cap = "Cap must be blank or zero or greater.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    onSave({ ...form, name, trigger });
  };

  return (
    <CrudModal title={row ? "Edit XP Rule" : "New XP Rule"} onClose={onClose}>
      <div className="space-y-4">
        <Field label="Rule Name" required>
          <Inp
            value={form.name}
            onChange={(value) => {
              setForm({ ...form, name: value });
              clearError("name");
            }}
            placeholder="e.g. Course Completion"
          />
          <FormError>{errors.name}</FormError>
        </Field>
        <Field label="Trigger Condition" required>
          <Inp
            value={form.trigger}
            onChange={(value) => {
              setForm({ ...form, trigger: value });
              clearError("trigger");
            }}
            placeholder="e.g. Learner completes a course"
          />
          <FormError>{errors.trigger}</FormError>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Category">
            <Sel
              value={form.category}
              onChange={(value) => setForm({ ...form, category: value })}
              options={["Completion", "Assessment", "Program", "Bonus", "Engagement", "Social"]}
            />
          </Field>
          <Field label="XP Awarded" required>
            <Inp
              type="number"
              value={String(form.xp)}
              onChange={(value) => {
                setForm({ ...form, xp: Number(value) });
                clearError("xp");
              }}
            />
            <FormError>{errors.xp}</FormError>
          </Field>
          <Field label="Cap (leave blank for none)">
            <Inp
              type="number"
              value={form.cap == null ? "" : String(form.cap)}
              onChange={(value) => {
                setForm({ ...form, cap: value === "" ? null : Number(value) });
                clearError("cap");
              }}
            />
            <FormError>{errors.cap}</FormError>
          </Field>
          <Field label="Status">
            <Sel
              value={form.status}
              onChange={(value) => setForm({ ...form, status: value })}
              options={["Active", "Disabled"]}
            />
          </Field>
        </div>
        <SaveBtn onSave={handleSave} onClose={onClose} />
      </div>
    </CrudModal>
  );
}

export function XPRulesCrud() {
  const [rows, setRows] = useState<XPRule[]>(loadXpRules);

  useEffect(() => {
    window.localStorage.setItem(XP_RULES_STORAGE_KEY, JSON.stringify(rows));
  }, [rows]);

  return (
    <CrudShell<XPRule>
      title="XP Rules"
      sub="Create, edit, and delete XP earning rules — configurable without code changes"
      icon={Zap}
      columns={[
        {
          key: "name",
          label: "Rule Name",
          sortable: true,
          render: (rule) => (
            <p className="text-xs font-semibold" style={{ color: P.text }}>
              {rule.name}
            </p>
          ),
        },
        {
          key: "category",
          label: "Category",
          sortable: true,
          render: (rule) => (
            <span
              className="rounded-full px-2 py-0.5 text-[10px]"
              style={{ background: P.lightSage, color: P.darkOlive }}
            >
              {rule.category}
            </span>
          ),
        },
        {
          key: "trigger",
          label: "Trigger",
          render: (rule) => (
            <p className="text-xs" style={{ color: P.textMuted }}>
              {rule.trigger}
            </p>
          ),
        },
        {
          key: "xp",
          label: "XP Awarded",
          render: (rule) => (
            <p className="font-mono text-xs font-bold" style={{ color: P.gold }}>
              {rule.xp} XP
            </p>
          ),
        },
        {
          key: "cap",
          label: "Cap",
          render: (rule) => (
            <p className="font-mono text-xs" style={{ color: P.textMuted }}>
              {rule.cap ?? "None"}
            </p>
          ),
        },
        {
          key: "status",
          label: "Status",
          sortable: true,
          render: (rule) => <StatusBadge status={rule.status} />,
        },
      ]}
      rows={rows}
      onRows={setRows}
      filterOptions={{ label: "Status", values: ["Active", "Disabled"] }}
      createLabel="New XP Rule"
      showArchive={false}
      pageSize={20}
      renderForm={(row, onSave, onClose) => (
        <XPRuleForm row={row} rows={rows} onSave={onSave} onClose={onClose} />
      )}
    />
  );
}
