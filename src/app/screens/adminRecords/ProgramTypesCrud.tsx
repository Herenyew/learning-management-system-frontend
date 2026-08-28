import React, { useCallback, useEffect, useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import {
  catalogConfigurationApi,
  type ProgramTypeDto,
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
import { usePermission } from "../../hooks/usePermission";

type ProgType = CrudRow & { description: string };

function dtoToRow(dto: ProgramTypeDto): ProgType {
  return {
    id: String(dto.id),
    name: dto.name,
    description: dto.description ?? "",
    status: dto.isActive ? "Active" : "Disabled",
  };
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
          id: `new-${Date.now()}`,
          name: "",
          status: "Active",
          description: "",
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
              if (nameError) setNameError("");
            }}
            placeholder="e.g. New Employee"
          />
          {nameError && (
            <p className="mt-1 text-[10px]" style={{ color: "#B91C1C" }}>{nameError}</p>
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
            options={["Active", "Disabled"]}
          />
        </Field>
        <SaveBtn onSave={handleSave} onClose={onClose} />
      </div>
    </CrudModal>
  );
}

export function ProgramTypesCrud() {
  const can = usePermission();
  const [rows, setRows] = useState<ProgType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError("");
    try {
      const items = await catalogConfigurationApi.listProgramTypes(signal);
      if (!signal?.aborted) setRows(items.map(dtoToRow));
    } catch (e: any) {
      if (!signal?.aborted) setError(e?.message ?? "Unable to load program types.");
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal);
    return () => controller.abort();
  }, [load]);

  if (!can("program_type.view"))
    return (
      <div className="p-6 text-sm text-center" style={{ color: P.textMuted }}>
        You don't have permission to view program types.
      </div>
    );
  if (loading)
    return (
      <div className="flex items-center justify-center gap-2 py-12 text-xs" style={{ color: P.textMuted }}>
        <Loader2 size={15} className="animate-spin" /> Loading program types…
      </div>
    );

  const persistSave = async (row: ProgType): Promise<ProgType> => {
    setError("");
    try {
      const input = {
        name: row.name,
        description: row.description || null,
        isActive: row.status === "Active",
      };
      const isNew = row.id.startsWith("new-");
      const saved = isNew
        ? await catalogConfigurationApi.createProgramType(input)
        : await catalogConfigurationApi.updateProgramType(Number(row.id), input);
      return dtoToRow(saved);
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : "Unable to save program type.";
      setError(message);
      throw reason;
    }
  };

  const persistDelete = async (id: string) => {
    setError("");
    try {
      await catalogConfigurationApi.deleteProgramType(Number(id));
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : "Unable to delete program type.";
      setError(message);
      throw reason;
    }
  };

  const persistToggle = async (id: string, nextStatus: string) => {
    await catalogConfigurationApi.updateProgramType(Number(id), { isActive: nextStatus === "Active" });
  };

  return (
    <>
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
          <AlertCircle size={14} />
          {error}
          <button onClick={() => void load()} className="ml-auto underline">Retry</button>
        </div>
      )}
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
        persistToggle={persistToggle}
        filterOptions={{ label: "Status", values: ["Active", "Disabled"] }}
        createLabel="New Program Type"
        showDuplicate={false}
        showArchive={false}
        toggleStatus={{ enabled: "Active", disabled: "Disabled", enableLabel: "Activate", disableLabel: "Deactivate" }}
        renderForm={(row, onSave, onClose) => (
          <ProgramTypeForm row={row} rows={rows} onSave={onSave} onClose={onClose} />
        )}
      />
    </>
  );
}
