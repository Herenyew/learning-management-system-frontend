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
import { HRProgramTemplatePicker } from "./HRProgramTemplatePicker";
import { HRProgramTypeSection } from "./HRProgramTypeSection";
import { HRProgramTargetingSection } from "./HRProgramTargetingSection";
import { HRProgramDefaultsSection } from "./HRProgramDefaultsSection";
import { HRProgramCohortsAssignmentSection } from "./HRProgramCohortsAssignmentSection";

type ProgramManagementTab = "programs" | "create" | "templates" | "tasks";
type EditableProgramList = "types" | null;
type AssignmentMode = "Individual" | "By Department" | "By Role" | "By Group" | "Import CSV";

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
  } = ctx;

  return (
    <div className="max-w-2xl">
      <div className="bg-white rounded-2xl border p-6 space-y-5" style={{ borderColor: P.border }}>
        <h2
          className="text-base font-bold"
          style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", color: P.text }}
        >
          {editingProgramId ? "Edit Learning Program" : "Create New Learning Program"}
        </h2>
        <HRProgramTemplatePicker ctx={ctx} />

        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: P.textMid }}>
            Program Name <span className="text-red-500">*</span>
          </label>
          <input
            value={programName}
            onChange={(e) => setProgramName(e.target.value)}
            placeholder="e.g. Engineering Excellence Track 2025"
            className="w-full px-3 py-2 text-sm rounded-lg focus:outline-none bg-white"
            style={{ border: `1px solid ${P.border}`, color: P.text }}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          {/* ── Program Type management ── */}
          <HRProgramTypeSection ctx={ctx} />
          <HRProgramTargetingSection ctx={ctx} />
        </div>
        <HRProgramDefaultsSection ctx={ctx} />
        <HRProgramCohortsAssignmentSection ctx={ctx} />

        <div className="flex gap-2 pt-2">
          <button
            onClick={() => {
              resetProgramForm();
              setActiveTab("programs");
            }}
            className="px-5 py-2.5 rounded-xl text-sm"
            style={{ border: `1px solid ${P.border}`, color: P.textMid }}
          >
            Cancel
          </button>
          <button
            onClick={createProgram}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
            style={{ background: P.olive }}
          >
            {editingProgramId ? "Save Changes" : "Create Program"}
          </button>
        </div>
      </div>
    </div>
  );
}
