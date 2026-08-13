import React, { useEffect, useState } from "react";
import {
  catalogConfigurationApi,
  type ProgramTypeDto,
  type RecordStatus,
} from "../../API/catalogConfiguration.api";
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

const statusLabel = (status: RecordStatus) =>
  ({ ACTIVE: "Active", INACTIVE: "Inactive", ARCHIVED: "Archived", RETIRED: "Retired" })[status];

const statusValue = (status: string): RecordStatus => {
  const statuses: Record<string, RecordStatus> = {
    Active: "ACTIVE",
    Inactive: "INACTIVE",
    Archived: "ARCHIVED",
    Retired: "RETIRED",
  };
  return statuses[status] ?? "ACTIVE";
};

const toProgramType = (item: ProgramTypeDto): ProgType => ({
  id: item.id,
  name: item.name,
  description: item.description ?? "",
  color: item.color,
  status: statusLabel(item.status),
});

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
            options={["Active", "Inactive", "Archived", "Retired"]}
          />
        </Field>
        <SaveBtn onSave={handleSave} onClose={onClose} />
      </div>
    </CrudModal>
  );
}

export function ProgramTypesCrud() {
  const [rows, setRows] = useState<ProgType[]>(PROG_TYPE_INIT);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    catalogConfigurationApi
      .listProgramTypes(controller.signal)
      .then((items) => setRows(items.map(toProgramType)))
      .catch((reason: unknown) => {
        if (reason instanceof DOMException && reason.name === "AbortError") return;
        setError(reason instanceof Error ? reason.message : "Unable to load program types.");
      });
    return () => controller.abort();
  }, []);

  const persistSave = async (row: ProgType) => {
    setError("");
    try {
      const input = {
        name: row.name,
        description: row.description || null,
        color: row.color,
        status: statusValue(row.status),
      };
      const saved = rows.some((item) => item.id === row.id)
        ? await catalogConfigurationApi.updateProgramType(row.id, input)
        : await catalogConfigurationApi.createProgramType(input);
      return toProgramType(saved);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to save program type.");
      throw reason;
    }
  };

  const persistDelete = async (id: string) => {
    setError("");
    try {
      await catalogConfigurationApi.deleteProgramType(id);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to delete program type.");
      throw reason;
    }
  };

  return (
    <>
      {error && <p className="text-xs text-red-700">{error}</p>}
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
        persistSave={persistSave}
        persistDelete={persistDelete}
        filterOptions={{ label: "Status", values: ["Active", "Archived"] }}
        createLabel="New Program Type"
        showDuplicate={false}
        showArchive={false}
        renderForm={(row, onSave, onClose) => (
          <ProgramTypeForm row={row} rows={rows} onSave={onSave} onClose={onClose} />
        )}
      />
    </>
  );
}
