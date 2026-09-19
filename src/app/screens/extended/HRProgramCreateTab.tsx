import React from "react";
import {
  Archive,
  Av,
  Edit,
  EditableSelect,
  Input,
  P,
  Plus,
  PROGRAM_TYPE_DEFAULTS,
  RefreshCw,
  Settings,
  Textarea,
  Trash2,
  X,
} from "./extended.shared";
import type { ProgramCohort, ProgramTemplate, ProgramTypeOption } from "./extended.shared";
import type { ProgramCategoryDto, ProgramTypeDto } from "../../API/catalogConfiguration.api";
import type { ProgramVisibility } from "../../models/program.model";
import { HRProgramTemplatePicker } from "./HRProgramTemplatePicker";
import { HRProgramTypeSection } from "./HRProgramTypeSection";
import { HRProgramTargetingSection } from "./HRProgramTargetingSection";
import { HRProgramDefaultsSection } from "./HRProgramDefaultsSection";
import { HRProgramCohortsAssignmentSection } from "./HRProgramCohortsAssignmentSection";

type ProgramManagementTab = "programs" | "create" | "templates" | "tasks";
type EditableProgramList = "types" | null;
type AssignmentMode = "Individual" | "By Department" | "By Role" | "By Group" | "Import CSV";

const localToday = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export type HRProgramCreateTabContext = {
  activeProgTypes: ProgramTypeOption[];
  addManagedOption: (
    setOptions: React.Dispatch<React.SetStateAction<string[]>>,
    value: string,
  ) => void;
  addProgramCohort: () => void;
  applyProgramTemplate: (template: ProgramTemplate) => void;
  applyProgramTypeDefaults: (type: string) => void;
  approvalWorkflow: string;
  approvalWorkflowOptions: string[];
  assignmentMode: AssignmentMode;
  cohortName: string;
  cohortStartDate: string;
  cohortsEnabled: boolean;
  createProgram: () => void;
  createProgramType: (name: string) => void;
  duration: string;
  editIdx: number | null;
  editVal: string;
  editingList: EditableProgramList;
  editingProgramId: string | null;
  newItem: string;
  programCohorts: ProgramCohort[];
  programDescription: string;
  programName: string;
  programOwner: string;
  programOwnerOptions: string[];
  programTemplates: ProgramTemplate[];
  programType: string;
  progTypes: ProgramTypeOption[];
  removeEmployeeFromCohort: (cohortId: string, employeeName: string) => void;
  removeProgramCohort: (id: string) => void;
  renameProgramType: (index: number, nextName: string) => void;
  resetProgramForm: () => void;
  restoreProgramType: (typeId: string) => void;
  retireProgramType: (typeId: string) => void;
  saveAsTemplate: boolean;
  selectedCohortId: string;
  selectedProgramTypeRecord?: ProgramTypeOption;
  setActiveTab: React.Dispatch<React.SetStateAction<ProgramManagementTab>>;
  setApprovalWorkflow: React.Dispatch<React.SetStateAction<string>>;
  setApprovalWorkflowOptions: React.Dispatch<React.SetStateAction<string[]>>;
  setAssignmentMode: React.Dispatch<React.SetStateAction<AssignmentMode>>;
  setCohortName: React.Dispatch<React.SetStateAction<string>>;
  setCohortStartDate: React.Dispatch<React.SetStateAction<string>>;
  setCohortsEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  setDuration: React.Dispatch<React.SetStateAction<string>>;
  setEditIdx: React.Dispatch<React.SetStateAction<number | null>>;
  setEditingList: React.Dispatch<React.SetStateAction<EditableProgramList>>;
  setEditVal: React.Dispatch<React.SetStateAction<string>>;
  setNewItem: React.Dispatch<React.SetStateAction<string>>;
  setProgramDescription: React.Dispatch<React.SetStateAction<string>>;
  setProgramName: React.Dispatch<React.SetStateAction<string>>;
  setProgramOwner: React.Dispatch<React.SetStateAction<string>>;
  setProgramOwnerOptions: React.Dispatch<React.SetStateAction<string[]>>;
  setSaveAsTemplate: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedCohortId: React.Dispatch<React.SetStateAction<string>>;
  setVisibility: React.Dispatch<React.SetStateAction<"Public" | "Private">>;
  toggleEmployeesInSelectedCohort: (employeeNames: string[], assigned: boolean) => void;
  visibility: "Public" | "Private";
  detailsVisibility: ProgramVisibility;
  employeeOptions: { id: string; name: string; email: string }[];
  endDate: string;
  formError: string;
  isSaving: boolean;
  maxEnrollments: string;
  ownerEmployeeId: string;
  programCategoryId: string;
  programCategoryOptions: ProgramCategoryDto[];
  programTypeId: string;
  programTypeOptions: ProgramTypeDto[];
  referenceLoading: boolean;
  rollingEnrollment: boolean;
  startDate: string;
  setDetailsVisibility: React.Dispatch<React.SetStateAction<ProgramVisibility>>;
  setEndDate: React.Dispatch<React.SetStateAction<string>>;
  setMaxEnrollments: React.Dispatch<React.SetStateAction<string>>;
  setOwnerEmployeeId: React.Dispatch<React.SetStateAction<string>>;
  setProgramCategoryId: React.Dispatch<React.SetStateAction<string>>;
  setProgramTypeId: React.Dispatch<React.SetStateAction<string>>;
  setRollingEnrollment: React.Dispatch<React.SetStateAction<boolean>>;
  setStartDate: React.Dispatch<React.SetStateAction<string>>;
};

export function HRProgramCreateTab({ ctx }: { ctx: HRProgramCreateTabContext }) {
  const {
    activeProgTypes,
    addManagedOption,
    addProgramCohort,
    applyProgramTemplate,
    applyProgramTypeDefaults,
    approvalWorkflow,
    approvalWorkflowOptions,
    assignmentMode,
    cohortName,
    cohortStartDate,
    cohortsEnabled,
    createProgram,
    createProgramType,
    duration,
    editIdx,
    editVal,
    editingList,
    editingProgramId,
    newItem,
    programCohorts,
    programDescription,
    programName,
    programOwner,
    programOwnerOptions,
    programTemplates,
    programType,
    progTypes,
    removeEmployeeFromCohort,
    removeProgramCohort,
    renameProgramType,
    resetProgramForm,
    restoreProgramType,
    retireProgramType,
    saveAsTemplate,
    selectedCohortId,
    selectedProgramTypeRecord,
    setActiveTab,
    setApprovalWorkflow,
    setAssignmentMode,
    setCohortName,
    setCohortStartDate,
    setCohortsEnabled,
    setDuration,
    setEditIdx,
    setEditingList,
    setEditVal,
    setNewItem,
    setProgramDescription,
    setProgramName,
    setProgramOwner,
    setProgramOwnerOptions,
    setSaveAsTemplate,
    setSelectedCohortId,
    setVisibility,
    setApprovalWorkflowOptions,
    toggleEmployeesInSelectedCohort,
    visibility,
    detailsVisibility,
    employeeOptions,
    endDate,
    formError,
    isSaving,
    maxEnrollments,
    ownerEmployeeId,
    programCategoryId,
    programCategoryOptions,
    programTypeId,
    programTypeOptions,
    referenceLoading,
    rollingEnrollment,
    startDate,
    setDetailsVisibility,
    setEndDate,
    setMaxEnrollments,
    setOwnerEmployeeId,
    setProgramCategoryId,
    setProgramTypeId,
    setRollingEnrollment,
    setStartDate,
  } = ctx;

  const calculatedDuration = (() => {
    if (!startDate || !endDate) return "Set both dates to calculate duration";
    const start = new Date(`${startDate}T00:00:00`);
    const end = new Date(`${endDate}T00:00:00`);
    const days = Math.round((end.getTime() - start.getTime()) / 86_400_000);
    if (days <= 0) return "End date must be after start date";
    const weeks = Math.ceil(days / 7);
    return `${days} day${days === 1 ? "" : "s"} (${weeks} week${weeks === 1 ? "" : "s"})`;
  })();

  return (
    <div className="max-w-3xl">
      <div className="space-y-5 rounded-2xl border bg-white p-6" style={{ borderColor: P.border }}>
        <div>
          <h2
            className="text-base font-bold"
            style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", color: P.text }}
          >
            Program Details
          </h2>
          <p className="mt-1 text-xs" style={{ color: P.textMuted }}>
            Save the core program record as a draft. Additional setup can continue from its detail
            page.
          </p>
        </div>

        {formError && (
          <div
            className="rounded-xl border px-4 py-3 text-sm"
            style={{ borderColor: "#F2B8B5", background: "#FFF4F3", color: "#9B2C2C" }}
            role="alert"
          >
            {formError}
          </div>
        )}

        <div>
          <label className="mb-1.5 block text-xs font-semibold" style={{ color: P.textMid }}>
            Program Name <span className="text-red-500">*</span>
          </label>
          <input
            value={programName}
            onChange={(event) => setProgramName(event.target.value)}
            placeholder="e.g. Engineering Excellence Track 2026"
            className="w-full rounded-lg bg-white px-3 py-2 text-sm focus:outline-none"
            style={{ border: `1px solid ${P.border}`, color: P.text }}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold" style={{ color: P.textMid }}>
            Description
          </label>
          <textarea
            value={programDescription}
            onChange={(event) => setProgramDescription(event.target.value)}
            placeholder="Describe the purpose and expected outcomes…"
            rows={3}
            className="w-full rounded-lg bg-white px-3 py-2 text-sm focus:outline-none"
            style={{ border: `1px solid ${P.border}`, color: P.text }}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-semibold" style={{ color: P.textMid }}>
              Program Type <span className="text-red-500">*</span>
            </label>
            <select
              value={programTypeId}
              onChange={(event) => setProgramTypeId(event.target.value)}
              disabled={referenceLoading}
              className="w-full rounded-lg bg-white px-3 py-2 text-sm focus:outline-none"
              style={{ border: `1px solid ${P.border}`, color: P.text }}
            >
              <option value="">
                {referenceLoading ? "Loading program types…" : "Select program type"}
              </option>
              {programTypeOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold" style={{ color: P.textMid }}>
              Program Category{" "}
              <span className="font-normal" style={{ color: P.textMuted }}>
                (optional)
              </span>
            </label>
            <select
              value={programCategoryId}
              onChange={(event) => setProgramCategoryId(event.target.value)}
              disabled={referenceLoading}
              className="w-full rounded-lg bg-white px-3 py-2 text-sm focus:outline-none"
              style={{ border: `1px solid ${P.border}`, color: P.text }}
            >
              <option value="">No category</option>
              {programCategoryOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-semibold" style={{ color: P.textMid }}>
              HR Owner <span className="text-red-500">*</span>
            </label>
            <select
              value={ownerEmployeeId}
              onChange={(event) => setOwnerEmployeeId(event.target.value)}
              disabled={referenceLoading}
              className="w-full rounded-lg bg-white px-3 py-2 text-sm focus:outline-none"
              style={{ border: `1px solid ${P.border}`, color: P.text }}
            >
              <option value="">
                {referenceLoading ? "Loading employees…" : "Select HR owner"}
              </option>
              {employeeOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                  {option.email ? ` — ${option.email}` : ""}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold" style={{ color: P.textMid }}>
              Expected Cohort Size
            </label>
            <input
              type="number"
              min="1"
              step="1"
              value={maxEnrollments}
              onChange={(event) => setMaxEnrollments(event.target.value)}
              placeholder="e.g. 30"
              className="w-full rounded-lg bg-white px-3 py-2 text-sm focus:outline-none"
              style={{ border: `1px solid ${P.border}`, color: P.text }}
            />
            <p className="mt-1 text-[10px]" style={{ color: P.textMuted }}>
              Saved as maximum enrollments.
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-semibold" style={{ color: P.textMid }}>
              Start Date
            </label>
            <input
              type="date"
              min={localToday()}
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              className="w-full rounded-lg bg-white px-3 py-2 text-sm"
              style={{ border: `1px solid ${P.border}`, color: P.text }}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold" style={{ color: P.textMid }}>
              End Date
            </label>
            <input
              type="date"
              min={startDate || undefined}
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              className="w-full rounded-lg bg-white px-3 py-2 text-sm"
              style={{ border: `1px solid ${P.border}`, color: P.text }}
            />
          </div>
        </div>
        <div
          className="rounded-xl border px-4 py-3"
          style={{ borderColor: P.border, background: P.paleGreen }}
        >
          <p className="text-[10px] font-bold uppercase" style={{ color: P.textMuted }}>
            Calculated Duration
          </p>
          <p className="mt-1 text-sm font-semibold" style={{ color: P.darkOlive }}>
            {calculatedDuration}
          </p>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold" style={{ color: P.textMid }}>
            Visibility <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                { label: "HR Users Only", value: "COMPANY" },
                { label: "Public", value: "PUBLIC" },
              ] as const
            ).map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setDetailsVisibility(option.value)}
                className="rounded-lg px-3 py-2 text-xs font-semibold"
                style={{
                  background: detailsVisibility === option.value ? P.lightSage : "white",
                  border: `1px solid ${detailsVisibility === option.value ? P.olive : P.border}`,
                  color: detailsVisibility === option.value ? P.olive : P.textMid,
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <label
          className="flex items-center justify-between rounded-xl border p-4"
          style={{ borderColor: P.border, background: P.bg }}
        >
          <span>
            <span className="block text-xs font-semibold" style={{ color: P.text }}>
              Rolling Enrollment
            </span>
            <span className="block text-[10px]" style={{ color: P.textMuted }}>
              Allow enrollment throughout the program period.
            </span>
          </span>
          <input
            type="checkbox"
            checked={rollingEnrollment}
            onChange={(event) => setRollingEnrollment(event.target.checked)}
            style={{ accentColor: P.olive, width: 16, height: 16 }}
          />
        </label>

        <div className="grid gap-3 md:grid-cols-2">
          {[
            {
              title: "Target Audience",
              copy: "Deferred — audience rules are not part of Program Details creation yet.",
            },
            {
              title: "Cohorts / Batches",
              copy: "Deferred — create the draft first; cohort setup will be added in a later step.",
            },
          ].map((notice) => (
            <div
              key={notice.title}
              className="rounded-xl border p-4"
              style={{ borderColor: P.border, background: P.bg }}
            >
              <p className="text-xs font-semibold" style={{ color: P.text }}>
                {notice.title}
              </p>
              <p className="mt-1 text-[11px] leading-5" style={{ color: P.textMuted }}>
                {notice.copy}
              </p>
            </div>
          ))}
        </div>

        <label
          className="flex items-center justify-between rounded-xl border p-4"
          style={{ borderColor: P.border, background: P.bg }}
        >
          <span>
            <span className="block text-xs font-semibold" style={{ color: P.text }}>
              Save as reusable template
            </span>
            <span className="block text-[10px]" style={{ color: P.textMuted }}>
              After creating the draft, snapshot its current courses, tasks, and milestones into a
              persistent template.
            </span>
          </span>
          <input
            type="checkbox"
            checked={saveAsTemplate}
            onChange={(event) => setSaveAsTemplate(event.target.checked)}
            style={{ accentColor: P.olive, width: 16, height: 16 }}
          />
        </label>

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={() => {
              resetProgramForm();
              setActiveTab("programs");
            }}
            disabled={isSaving}
            className="rounded-xl px-5 py-2.5 text-sm"
            style={{ border: `1px solid ${P.border}`, color: P.textMid }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void createProgram()}
            disabled={isSaving || referenceLoading}
            className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white"
            style={{ background: isSaving || referenceLoading ? P.sage : P.olive }}
          >
            {isSaving ? "Saving Draft…" : "Save as Draft"}
          </button>
        </div>
      </div>
    </div>
  );
}
