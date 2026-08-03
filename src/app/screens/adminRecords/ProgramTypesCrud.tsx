import React, { useEffect, useState } from "react";
import {
  CrudModal,
  CrudShell,
  Field,
  Inp,
  Layers,
  P,
  SaveBtn,
  Sel,
  StatusBadge,
  Textarea,
} from "./adminRecords.shared";
import type { CrudRow } from "./adminRecords.shared";

type ProgType = CrudRow & { description: string; color: string };

const PROG_TYPE_INIT: ProgType[] = [
  {
    id: "pt1",
    name: "New Employee",
    status: "Active",
    description: "Onboarding programs for new hires",
    color: P.olive,
  },
  {
    id: "pt2",
    name: "Graduate Trainee",
    status: "Active",
    description: "Programs for graduate talent pipelines",
    color: "#4A7A5A",
  },
  {
    id: "pt3",
    name: "Leadership",
    status: "Active",
    description: "Leadership development programs",
    color: P.gold,
  },
  {
    id: "pt4",
    name: "Technical",
    status: "Active",
    description: "Technical skills and engineering programs",
    color: P.darkOlive,
  },
  {
    id: "pt5",
    name: "Compliance",
    status: "Active",
    description: "Mandatory regulatory and compliance programs",
    color: "#C0392B",
  },
  {
    id: "pt6",
    name: "Refresher",
    status: "Archived",
    description: "Periodic knowledge refreshers",
    color: P.sage,
  },
];

const PROGRAM_TYPES_STORAGE_KEY = "learnos.catalog-program-types";

function loadProgramTypes(): ProgType[] {
  try {
    const stored = window.localStorage.getItem(PROGRAM_TYPES_STORAGE_KEY);
    if (!stored) return PROG_TYPE_INIT;

    const parsed: unknown = JSON.parse(stored);
    if (
      Array.isArray(parsed) &&
      parsed.every(
        (item) =>
          typeof item === "object" &&
          item !== null &&
          typeof item.id === "string" &&
          typeof item.name === "string" &&
          typeof item.status === "string" &&
          typeof item.description === "string" &&
          typeof item.color === "string",
      )
    ) {
      return parsed as ProgType[];
    }
  } catch {
    // Ignore invalid saved prototype data and restore the defaults.
  }

  return PROG_TYPE_INIT;
}

function ProgramTypeForm({
  row,
  rows,
  onSave,
  onClose,
}: {
  row: ProgType | null;
  rows: ProgType[];
  onSave: (row: ProgType) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<ProgType>(() =>
    row
      ? { ...row }
      : {
          id: `pt${Date.now()}`,
          name: "",
          status: "Active",
          description: "",
          color: P.olive,
        },
  );
  const [nameError, setNameError] = useState("");

  const handleSave = () => {
    const name = form.name.trim();
    if (!name) {
      setNameError("Type name is required.");
      return;
    }
    if (
      rows.some(
        (item) => item.id !== form.id && item.name.trim().toLowerCase() === name.toLowerCase(),
      )
    ) {
      setNameError("A program type with this name already exists.");
      return;
    }

    onSave({ ...form, name, description: form.description.trim() });
  };

  return (
    <CrudModal title={row ? "Edit Program Type" : "New Program Type"} onClose={onClose}>
      <div className="space-y-4">
        <Field label="Type Name" required>
          <Inp
            value={form.name}
            onChange={(value) => {
              setForm({ ...form, name: value });
              setNameError("");
            }}
            placeholder="e.g. Leadership Development"
          />
          {nameError && (
            <p className="mt-1.5 text-xs" role="alert" style={{ color: "#B91C1C" }}>
              {nameError}
            </p>
          )}
        </Field>
        <Field label="Description">
          <Textarea
            value={form.description}
            onChange={(value) => setForm({ ...form, description: value })}
            placeholder="Describe this program type..."
          />
        </Field>
        <Field label="Status">
          <Sel
            value={form.status}
            onChange={(value) => setForm({ ...form, status: value })}
            options={["Active", "Draft", "Archived", "Retired"]}
          />
        </Field>
        <SaveBtn onSave={handleSave} onClose={onClose} />
      </div>
    </CrudModal>
  );
}

export function ProgramTypesCrud() {
  const [rows, setRows] = useState<ProgType[]>(loadProgramTypes);

  useEffect(() => {
    window.localStorage.setItem(PROGRAM_TYPES_STORAGE_KEY, JSON.stringify(rows));
  }, [rows]);

  return (
    <CrudShell<ProgType>
      title="Program Types"
      sub="Define the types of learning programs available in the system"
      icon={Layers}
      columns={[
        {
          key: "name",
          label: "Type Name",
          sortable: true,
          render: (r) => (
            <p className="text-xs font-semibold" style={{ color: P.text }}>
              {r.name}
            </p>
          ),
        },
        {
          key: "description",
          label: "Description",
          render: (r) => (
            <p className="text-xs" style={{ color: P.textMuted }}>
              {r.description}
            </p>
          ),
        },
        {
          key: "status",
          label: "Status",
          sortable: true,
          render: (r) => <StatusBadge status={r.status} />,
        },
      ]}
      rows={rows}
      onRows={setRows}
      filterOptions={{ label: "Status", values: ["Active", "Archived"] }}
      createLabel="New Program Type"
      cloneRow={(r) => ({ ...r, id: `pt${Date.now()}`, name: `${r.name} (Copy)`, status: "Draft" })}
      renderForm={(row, onSave, onClose) => (
        <ProgramTypeForm row={row} rows={rows} onSave={onSave} onClose={onClose} />
      )}
    />
  );
}
