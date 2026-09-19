import React, { useEffect, useState } from "react";
import {
  AICard,
  AlertCircle,
  Archive,
  Area,
  AreaChart,
  Av,
  Award,
  Badge,
  Bar,
  BarChart2,
  BookOpen,
  Bot,
  Building,
  CERT_TEMPLATES,
  Calendar,
  CartesianGrid,
  Cell,
  Check,
  CheckCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clock,
  ConfigPublishing,
  Copy,
  Cpu,
  Download,
  Edit,
  EditableSelect,
  Eye,
  FilePlus,
  FileText,
  Filter,
  Flag,
  Globe,
  HelpCircle,
  Input,
  Layers,
  Link,
  Lock,
  MODERATION_ITEMS,
  Medal,
  MessageSquare,
  MoreHorizontal,
  P,
  PBar,
  PROGRAMS_DATA,
  PROGRAM_TASKS_INITIAL,
  PROGRAM_TYPE_DEFAULTS,
  PUBLISHING_QUEUE,
  PageHeader,
  Pie,
  PieChart,
  Play,
  Plus,
  PlusCircle,
  ReBarChart,
  RefreshCw,
  ResponsiveContainer,
  SCORM_PACKAGES,
  Search,
  Select,
  Send,
  Settings,
  Shield,
  Signature,
  Sparkles,
  Stamp,
  Star,
  StatCard,
  TEAM_MEMBERS,
  TNA_DEPT_DATA,
  TNA_REQUESTS,
  TNA_TREND,
  Target,
  Textarea,
  ToggleLeft,
  ToggleRight,
  Tooltip,
  Trash2,
  TrendingDown,
  TrendingUp,
  Trophy,
  Upload,
  User,
  UserCheck,
  Users,
  Video,
  Wand2,
  X,
  XAxis,
  YAxis,
  Zap,
} from "./extended.shared";
import type { Screen } from "../../models/app.model";
import type {
  HRProgram,
  ProgramCohort,
  ProgramTask,
  ProgramTaskSource,
  ProgramTaskType,
  ProgramTemplate,
  ProgramTypeOption,
} from "./extended.shared";

import { ProgramTaskModal, type ProgramTaskModalContext } from "./ProgramTaskModal";
import { HRProgramTasksTab, type HRProgramTasksTabContext } from "./HRProgramTasksTab";
import { HRProgramsProgramsTab, type HRProgramsProgramsTabContext } from "./HRProgramsProgramsTab";
import {
  HRProgramsTemplatesTab,
  type HRProgramsTemplatesTabContext,
} from "./HRProgramsTemplatesTab";
import { HRProgramCreateTab, type HRProgramCreateTabContext } from "./HRProgramCreateTab";
import {
  catalogConfigurationApi,
  type CreateProgramTemplateInput,
  type ProgramCategoryDto,
  type ProgramTemplateDto,
  type ProgramTypeDto,
} from "../../API/catalogConfiguration.api";
import { programApi } from "../../API/program.api";
import type {
  CreateProgramInput,
  Program,
  ProgramOwnerOption,
  ProgramVisibility,
} from "../../models/program.model";

type EmployeeOption = ProgramOwnerOption;

const localToday = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const calculateProgramDuration = (startDate?: string | null, endDate?: string | null) => {
  if (!startDate || !endDate) return "Dates not set";
  const start = new Date(`${startDate.slice(0, 10)}T00:00:00`);
  const end = new Date(`${endDate.slice(0, 10)}T00:00:00`);
  const days = Math.round((end.getTime() - start.getTime()) / 86_400_000);
  if (days <= 0) return "Invalid date range";
  const weeks = Math.ceil(days / 7);
  return `${days} day${days === 1 ? "" : "s"} (${weeks} week${weeks === 1 ? "" : "s"})`;
};

const toHRProgram = (
  program: Program,
  programTypes: ProgramTypeDto[],
  employees: EmployeeOption[],
): HRProgram => {
  const typeName =
    program.programType?.name ??
    programTypes.find((type) => type.id === program.programTypeId)?.name ??
    "Program";
  const owner = program.ownerEmployee ?? program.owner;
  const ownerName =
    owner?.name ??
    owner?.fullName ??
    employees.find((employee) => employee.id === program.ownerEmployeeId)?.name ??
    program.ownerEmployeeId;

  return {
    id: String(program.id),
    type: typeName,
    name: program.name,
    employees: program.maxEnrollments ?? 0,
    completed: 0,
    inProgress: 0,
    duration: calculateProgramDuration(program.startDate, program.endDate),
    tasks: 0,
    progress: 0,
    color: typeName === "Compliance" ? "#C0392B" : P.olive,
    owner: ownerName,
    visibility: program.visibility === "COMPANY" ? "HR Users Only" : "Public",
    description: program.description ?? undefined,
  };
};

export function HRProgramsScreen({ navigate }: { navigate: (s: string, id?: string) => void }) {
  const [activeTab, setActiveTab] = useState<"programs" | "create" | "templates" | "tasks">(
    "programs",
  );
  const [selectedProg, setSelectedProg] = useState("Future Leaders Initiative");
  const [taskModalType, setTaskModalType] = useState<ProgramTaskType | null>(null);
  const [taskSource, setTaskSource] = useState<ProgramTaskSource>("device");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDetail, setTaskDetail] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskFileName, setTaskFileName] = useState("");
  const [taskDriveUrl, setTaskDriveUrl] = useState("");
  const [taskTimelineWeek, setTaskTimelineWeek] = useState(1);
  const [taskStartDate, setTaskStartDate] = useState("2026-07-06");
  const [taskDueDate, setTaskDueDate] = useState("2026-07-12");
  const [taskMilestone, setTaskMilestone] = useState("Program Kickoff");
  const [taskUnlockRule, setTaskUnlockRule] = useState("Available at program start");
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [programTasks, setProgramTasks] = useState<ProgramTask[]>(PROGRAM_TASKS_INITIAL);
  const [programList, setProgramList] = useState<HRProgram[]>([]);
  const [programTemplates, setProgramTemplates] = useState<ProgramTemplateDto[]>([]);
  const [programName, setProgramName] = useState("");
  const [programDescription, setProgramDescription] = useState("");
  const [programType, setProgramType] = useState("Leadership");
  const [duration, setDuration] = useState(PROGRAM_TYPE_DEFAULTS.Leadership.duration);
  const [visibility, setVisibility] = useState<"Public" | "Private">(
    PROGRAM_TYPE_DEFAULTS.Leadership.visibility,
  );
  const [programOwner, setProgramOwner] = useState(PROGRAM_TYPE_DEFAULTS.Leadership.owner);
  const [certTemplate, setCertTemplate] = useState(
    PROGRAM_TYPE_DEFAULTS.Leadership.certificationTemplate,
  );
  const [xpMultiplier, setXpMultiplier] = useState(PROGRAM_TYPE_DEFAULTS.Leadership.xpMultiplier);
  const [approvalWorkflow, setApprovalWorkflow] = useState(
    PROGRAM_TYPE_DEFAULTS.Leadership.approvalWorkflow,
  );
  const [cohortsEnabled, setCohortsEnabled] = useState(true);
  const [cohortName, setCohortName] = useState("");
  const [cohortStartDate, setCohortStartDate] = useState("");
  const [programCohorts, setProgramCohorts] = useState<ProgramCohort[]>([]);
  const [assignmentMode, setAssignmentMode] = useState<
    "Individual" | "By Department" | "By Role" | "By Group" | "Import CSV"
  >("Individual");
  const [selectedCohortId, setSelectedCohortId] = useState("");
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);
  const [programNotice, setProgramNotice] = useState("");
  const [editingProgramId, setEditingProgramId] = useState<string | null>(null);
  const [archivedProgramIds, setArchivedProgramIds] = useState<string[]>([]);
  const [programTypeId, setProgramTypeId] = useState("");
  const [programCategoryId, setProgramCategoryId] = useState("");
  const [ownerEmployeeId, setOwnerEmployeeId] = useState("");
  const [detailsVisibility, setDetailsVisibility] = useState<ProgramVisibility>("COMPANY");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [rollingEnrollment, setRollingEnrollment] = useState(false);
  const [maxEnrollments, setMaxEnrollments] = useState("");
  const [programTypeOptions, setProgramTypeOptions] = useState<ProgramTypeDto[]>([]);
  const [programCategoryOptions, setProgramCategoryOptions] = useState<ProgramCategoryDto[]>([]);
  const [employeeOptions, setEmployeeOptions] = useState<EmployeeOption[]>([]);
  const [referenceLoading, setReferenceLoading] = useState(true);
  const [programsLoading, setProgramsLoading] = useState(true);
  const [formError, setFormError] = useState("");
  const [listError, setListError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [templatesLoading, setTemplatesLoading] = useState(true);
  const [templateError, setTemplateError] = useState("");
  const [deletingTemplateId, setDeletingTemplateId] = useState<number | null>(null);
  const [applyingTemplateId, setApplyingTemplateId] = useState<number | null>(null);

  // ── Management state for configurable lists ────────────────
  const [progTypes, setProgTypes] = useState<ProgramTypeOption[]>([
    { id: "new-employee", name: "New Employee", status: "active" },
    { id: "graduate-trainee", name: "Graduate Trainee", status: "active" },
    { id: "leadership", name: "Leadership", status: "active" },
    { id: "technical", name: "Technical", status: "active" },
    { id: "compliance", name: "Compliance", status: "active" },
  ]);
  const [programOwnerOptions, setProgramOwnerOptions] = useState(() =>
    Array.from(
      new Set([
        ...Object.values(PROGRAM_TYPE_DEFAULTS).map((defaults) => defaults.owner),
        "Learning & Development",
        "Compliance Office",
        "Engineering Enablement",
        "Talent Development",
        "HR Operations",
      ]),
    ),
  );
  const [approvalWorkflowOptions, setApprovalWorkflowOptions] = useState(() =>
    Array.from(
      new Set([
        ...Object.values(PROGRAM_TYPE_DEFAULTS).map((d) => d.approvalWorkflow),
        "No approval required",
        "HR approval",
        "Manager approval + HR completion review",
      ]),
    ),
  );

  // Inline editor state
  const [editingList, setEditingList] = useState<"types" | null>(null);
  const [newItem, setNewItem] = useState("");
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editVal, setEditVal] = useState("");
  const activeProgTypes = progTypes.filter((type) => type.status === "active");
  const selectedProgramTypeRecord = progTypes.find((type) => type.name === programType);
  const activeProgramList = programList.filter(
    (program) => !archivedProgramIds.includes(program.id),
  );

  const addManagedOption = (
    setOptions: React.Dispatch<React.SetStateAction<string[]>>,
    value: string,
  ) => {
    const cleaned = value.trim();
    if (!cleaned) return;
    setOptions((options) =>
      options.some((option) => option.toLowerCase() === cleaned.toLowerCase())
        ? options
        : [...options, cleaned],
    );
  };

  useEffect(() => {
    const controller = new AbortController();
    setReferenceLoading(true);
    setProgramsLoading(true);

    void Promise.all([
      catalogConfigurationApi.listProgramTypes(controller.signal),
      catalogConfigurationApi.listProgramCategories(controller.signal),
      programApi.listOwnerOptions(controller.signal),
    ])
      .then(([types, categories, employees]) => {
        if (controller.signal.aborted) return;
        const activeTypes = types.filter((type) => type.isActive);
        const activeCategories = categories.filter((category) => category.isActive);
        setProgramTypeOptions(activeTypes);
        setProgramCategoryOptions(activeCategories);
        setEmployeeOptions(employees);
        setProgTypes(
          types.map((type) => ({
            id: String(type.id),
            name: type.name,
            status: type.isActive ? "active" : "retired",
          })),
        );
        setProgramTypeId((current) => current || String(activeTypes[0]?.id ?? ""));
        setProgramType((current) => current || activeTypes[0]?.name || "");
        setOwnerEmployeeId((current) => current || employees[0]?.id || "");
        return programApi.list(controller.signal).then((programs) => {
          if (!controller.signal.aborted) {
            setProgramList(programs.map((program) => toHRProgram(program, types, employees)));
          }
        });
      })
      .catch((reason: unknown) => {
        if (controller.signal.aborted) return;
        const message = reason instanceof Error ? reason.message : "Unable to load program data.";
        setListError(message);
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setReferenceLoading(false);
          setProgramsLoading(false);
        }
      });

    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setTemplatesLoading(true);
    setTemplateError("");

    void catalogConfigurationApi
      .listProgramTemplates({ isActive: true, page: 1, pageSize: 100 }, controller.signal)
      .then((templates) => {
        if (!controller.signal.aborted)
          setProgramTemplates(templates.filter((template) => template.isActive));
      })
      .catch((reason: unknown) => {
        if (!controller.signal.aborted) {
          setTemplateError(
            reason instanceof Error ? reason.message : "Unable to load program templates.",
          );
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setTemplatesLoading(false);
      });

    return () => controller.abort();
  }, []);

  useEffect(() => {
    const requestedTab = window.sessionStorage.getItem("hr-programs-tab");
    if (
      requestedTab === "programs" ||
      requestedTab === "create" ||
      requestedTab === "templates" ||
      requestedTab === "tasks"
    ) {
      setActiveTab(requestedTab);
      window.sessionStorage.removeItem("hr-programs-tab");
    }
  }, []);

  const applyProgramTypeDefaults = (type: string) => {
    const defaults = PROGRAM_TYPE_DEFAULTS[type] ?? PROGRAM_TYPE_DEFAULTS.Leadership;
    setProgramType(type);
    setDuration(defaults.duration);
    setCertTemplate(defaults.certificationTemplate);
    setXpMultiplier(defaults.xpMultiplier);
    setApprovalWorkflow(defaults.approvalWorkflow);
    setVisibility(defaults.visibility);
    setProgramOwner(defaults.owner);
  };

  const getProgramColor = (type: string) => {
    if (type === "Compliance") return "#C0392B";
    if (type === "Leadership") return P.gold;
    if (type === "Technical") return P.darkOlive;
    if (type === "Graduate Trainee") return "#4A7A5A";
    return P.olive;
  };

  const resetProgramForm = () => {
    setEditingProgramId(null);
    setProgramName("");
    setProgramDescription("");
    applyProgramTypeDefaults("Leadership");
    setCohortsEnabled(true);
    setProgramCohorts([]);
    setCohortName("");
    setCohortStartDate("");
    setAssignmentMode("Individual");
    setSelectedCohortId("");
    setSaveAsTemplate(false);
    setEditingList(null);
    setProgramTypeId(String(programTypeOptions[0]?.id ?? ""));
    setProgramCategoryId("");
    setOwnerEmployeeId(employeeOptions[0]?.id ?? "");
    setDetailsVisibility("COMPANY");
    setStartDate("");
    setEndDate("");
    setRollingEnrollment(false);
    setMaxEnrollments("");
    setFormError("");
  };

  const renameProgramType = (index: number, nextName: string) => {
    const cleaned = nextName.trim();
    if (!cleaned) return;
    const previousName = progTypes[index]?.name;
    setProgTypes((types) =>
      types.map((type, typeIndex) =>
        typeIndex === index
          ? { ...type, id: cleaned.toLowerCase().replace(/\s+/g, "-"), name: cleaned }
          : type,
      ),
    );
    if (previousName === programType) setProgramType(cleaned);
    setEditIdx(null);
  };

  const retireProgramType = (typeId: string) => {
    const typeToRetire = progTypes.find((type) => type.id === typeId);
    if (typeToRetire?.status === "active" && activeProgTypes.length <= 1) {
      setProgramNotice("At least one active program type is required for new program creation.");
      return;
    }
    setProgTypes((types) =>
      types.map((type) =>
        type.id === typeId
          ? { ...type, status: "retired", retiredAt: new Date().toLocaleDateString() }
          : type,
      ),
    );
    if (typeToRetire?.name === programType) {
      const nextActiveType = progTypes.find(
        (type) => type.id !== typeId && type.status === "active",
      );
      if (nextActiveType) applyProgramTypeDefaults(nextActiveType.name);
    }
    setProgramNotice(
      `${typeToRetire?.name ?? "Program type"} retired. Historical programs remain visible.`,
    );
  };

  const restoreProgramType = (typeId: string) => {
    const typeToRestore = progTypes.find((type) => type.id === typeId);
    setProgTypes((types) =>
      types.map((type) =>
        type.id === typeId ? { ...type, status: "active", retiredAt: undefined } : type,
      ),
    );
    setProgramNotice(`${typeToRestore?.name ?? "Program type"} restored for new programs.`);
  };

  const createProgramType = (name: string) => {
    const cleaned = name.trim();
    if (!cleaned) return;

    const existingType = progTypes.find(
      (type) => type.name.toLowerCase() === cleaned.toLowerCase(),
    );

    if (existingType) {
      if (existingType.status === "retired") {
        restoreProgramType(existingType.id);
      } else {
        setProgramNotice(`${existingType.name} is already available for new programs.`);
      }
      setNewItem("");
      return;
    }

    const baseId = cleaned.toLowerCase().replace(/\s+/g, "-");
    const id = progTypes.some((type) => type.id === baseId) ? `${baseId}-${Date.now()}` : baseId;
    setProgTypes((types) => [...types, { id, name: cleaned, status: "active" }]);
    applyProgramTypeDefaults(cleaned);
    setProgramNotice(`${cleaned} added as an active program type.`);
    setNewItem("");
  };

  const addProgramCohort = () => {
    if (!cohortName.trim() || !cohortStartDate) return;
    const nextCohortId = `cohort-${Date.now()}`;

    setProgramCohorts((cohorts) => [
      ...cohorts,
      {
        id: nextCohortId,
        name: cohortName.trim(),
        startDate: cohortStartDate,
        employeeNames: [],
      },
    ]);
    setSelectedCohortId(nextCohortId);
    setCohortName("");
    setCohortStartDate("");
  };

  const removeProgramCohort = (id: string) => {
    setProgramCohorts((cohorts) => cohorts.filter((cohort) => cohort.id !== id));
    if (selectedCohortId === id) {
      setSelectedCohortId("");
    }
  };

  const toggleEmployeesInSelectedCohort = (employeeNames: string[], assigned: boolean) => {
    if (!selectedCohortId || employeeNames.length === 0) return;
    setProgramCohorts((cohorts) => {
      const assignedElsewhere = new Set(
        cohorts
          .filter((cohort) => cohort.id !== selectedCohortId)
          .flatMap((cohort) => cohort.employeeNames ?? []),
      );
      const eligibleNames = employeeNames.filter((name) => !assignedElsewhere.has(name));

      return cohorts.map((cohort) =>
        cohort.id === selectedCohortId
          ? {
              ...cohort,
              employeeNames: assigned
                ? Array.from(new Set([...(cohort.employeeNames ?? []), ...eligibleNames]))
                : (cohort.employeeNames ?? []).filter((name) => !employeeNames.includes(name)),
            }
          : cohort,
      );
    });
  };

  const removeEmployeeFromCohort = (cohortId: string, employeeName: string) => {
    setProgramCohorts((cohorts) =>
      cohorts.map((cohort) =>
        cohort.id === cohortId
          ? {
              ...cohort,
              employeeNames: (cohort.employeeNames ?? []).filter((name) => name !== employeeName),
            }
          : cohort,
      ),
    );
  };

  const taskTypeDefaults: Record<ProgramTaskType, { title: string; detail: string }> = {
    Video: { title: "", detail: "24 min" },
    Reading: { title: "", detail: "10 pages" },
    Quiz: { title: "", detail: "10 questions" },
  };

  const taskMilestones = [
    "Program Kickoff",
    "Foundation Review",
    "Module Checkpoint",
    "Applied Practice",
    "Final Assessment",
  ];

  const getNextTaskSchedule = () => {
    const selectedTasks = programTasks.filter((task) => task.programName === selectedProg);
    const nextWeek = Math.max(1, ...selectedTasks.map((task) => task.timelineWeek));

    return {
      timelineWeek: selectedTasks.length ? nextWeek : 1,
      startDate: selectedTasks.length ? "2026-07-15" : "2026-07-06",
      dueDate: selectedTasks.length ? "2026-07-21" : "2026-07-12",
      milestone: selectedTasks.length ? "Module Checkpoint" : "Program Kickoff",
      unlockRule: selectedTasks.length
        ? "Unlock after previous task completion"
        : "Available at program start",
    };
  };

  const openTaskModal = (type: ProgramTaskType, task?: ProgramTask) => {
    const scheduleDefaults = task ?? getNextTaskSchedule();
    setTaskModalType(type);
    setEditingTaskId(task?.id ?? null);
    setTaskSource(task?.source ?? "device");
    setTaskTitle(task?.title ?? taskTypeDefaults[type].title);
    setTaskDetail(task?.detail ?? taskTypeDefaults[type].detail);
    setTaskDescription(task?.description ?? "");
    setTaskFileName(task?.fileName ?? "");
    setTaskDriveUrl(task?.driveUrl ?? "");
    setTaskTimelineWeek(scheduleDefaults.timelineWeek);
    setTaskStartDate(scheduleDefaults.startDate);
    setTaskDueDate(scheduleDefaults.dueDate);
    setTaskMilestone(scheduleDefaults.milestone);
    setTaskUnlockRule(scheduleDefaults.unlockRule);
  };

  const closeTaskModal = () => {
    setTaskModalType(null);
    setEditingTaskId(null);
    setTaskFileName("");
    setTaskDriveUrl("");
  };

  const saveProgramTask = () => {
    if (!taskModalType || !taskTitle.trim()) return;
    if (taskSource === "device" && !taskFileName) return;
    if (taskSource === "gdrive" && !taskDriveUrl.trim()) return;

    const nextTask: ProgramTask = {
      id: `ptask-${Date.now()}`,
      programName: selectedProg,
      type: taskModalType,
      title: taskTitle.trim(),
      detail: taskDetail.trim() || taskTypeDefaults[taskModalType].detail,
      source: taskSource,
      timelineWeek: Math.max(1, Number(taskTimelineWeek) || 1),
      startDate: taskStartDate,
      dueDate: taskDueDate,
      milestone: taskMilestone.trim() || "Program Milestone",
      unlockRule: taskUnlockRule.trim() || "Available at program start",
      fileName: taskSource === "device" ? taskFileName : undefined,
      driveUrl: taskSource === "gdrive" ? taskDriveUrl.trim() : undefined,
      description: taskDescription.trim() || undefined,
    };

    if (editingTaskId) {
      setProgramTasks((tasks) =>
        tasks.map((task) =>
          task.id === editingTaskId ? { ...nextTask, id: editingTaskId } : task,
        ),
      );
      setProgramNotice(`${nextTask.title} schedule updated in ${selectedProg}.`);
      closeTaskModal();
      return;
    }

    setProgramTasks((tasks) => [...tasks, nextTask]);
    setProgramList((programs) =>
      programs.map((program) =>
        program.name === selectedProg ? { ...program, tasks: program.tasks + 1 } : program,
      ),
    );
    setProgramNotice(`${nextTask.type} task saved to ${selectedProg}.`);
    closeTaskModal();
  };

  const applyProgramTemplate = async (template: ProgramTemplateDto) => {
    const requestedName = window.prompt("Name for the new program:", `${template.name} Program`);
    if (requestedName === null) return;
    const name = requestedName.trim();
    if (!name) {
      setTemplateError("Program name is required.");
      return;
    }

    const requestedStartDate = window.prompt(
      "Program start date (YYYY-MM-DD). Leave blank to create without dates:",
      localToday(),
    );
    if (requestedStartDate === null) return;
    const selectedStartDate = requestedStartDate.trim();
    if (selectedStartDate && !/^\d{4}-\d{2}-\d{2}$/.test(selectedStartDate)) {
      setTemplateError("Start date must use YYYY-MM-DD format.");
      return;
    }

    setApplyingTemplateId(template.id);
    setTemplateError("");
    setProgramNotice("");
    try {
      const program = await programApi.createFromTemplate(template.id, {
        name,
        ...(selectedStartDate ? { startDate: selectedStartDate } : {}),
      });
      navigate("program-detail", String(program.id));
    } catch (reason: unknown) {
      setTemplateError(
        reason instanceof Error ? reason.message : "Unable to create a program from this template.",
      );
    } finally {
      setApplyingTemplateId(null);
    }
  };

  const buildProgramTemplateInput = (name: string): CreateProgramTemplateInput => {
    const selectedCategoryId = programCategoryId ? Number(programCategoryId) : null;
    const selectedTypeId = programTypeId ? Number(programTypeId) : null;
    const capacity = maxEnrollments ? Number(maxEnrollments) : null;
    let durationWeeks: number | null = null;
    if (startDate && endDate) {
      const start = new Date(`${startDate}T00:00:00`);
      const end = new Date(`${endDate}T00:00:00`);
      durationWeeks = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / 604_800_000));
    }

    return {
      name: `${name} Template`,
      description: programDescription.trim() || null,
      categoryId: selectedCategoryId,
      programTypeId: selectedTypeId,
      durationWeeks,
      visibility: detailsVisibility === "PUBLIC" ? "PUBLIC" : "COMPANY",
      ownerEmployeeId,
      rollingEnrollment,
      capacity,
      isActive: true,
    };
  };

  const saveProgramTemplate = async (program: HRProgram) => {
    try {
      const template = await catalogConfigurationApi.createProgramTemplate(
        buildProgramTemplateInput(program.name),
      );
      setProgramTemplates((templates) => [
        template,
        ...templates.filter((item) => item.id !== template.id),
      ]);
      setProgramNotice(`${program.name} saved as a reusable template.`);
      setActiveTab("templates");
    } catch (reason: unknown) {
      setTemplateError(
        reason instanceof Error ? reason.message : "Unable to save the program template.",
      );
      setActiveTab("templates");
    }
  };

  const deleteProgramTemplate = async (template: ProgramTemplateDto) => {
    if (!window.confirm(`Delete the program template “${template.name}”?`)) return;
    setDeletingTemplateId(template.id);
    setTemplateError("");
    try {
      await catalogConfigurationApi.deleteProgramTemplate(template.id);
      setProgramTemplates((templates) => templates.filter((item) => item.id !== template.id));
      setProgramNotice(`${template.name} deleted.`);
    } catch (reason: unknown) {
      setTemplateError(
        reason instanceof Error ? reason.message : "Unable to delete the program template.",
      );
    } finally {
      setDeletingTemplateId(null);
    }
  };

  const duplicateProgram = (program: HRProgram) => {
    const duplicate: HRProgram = {
      ...program,
      id: `pg-${Date.now()}`,
      name: `${program.name} Copy`,
      progress: 0,
      completed: 0,
      inProgress: program.employees,
    };
    setProgramList((programs) => [duplicate, ...programs]);
    setProgramNotice(`${program.name} duplicated with courses, tasks, and rules.`);
  };

  const editProgram = (program: HRProgram) => {
    const defaults = PROGRAM_TYPE_DEFAULTS[program.type] ?? PROGRAM_TYPE_DEFAULTS.Leadership;
    setEditingProgramId(program.id);
    setProgramName(program.name);
    setProgramDescription(program.description ?? "");
    setProgramType(program.type);
    setDuration(program.duration || defaults.duration);
    setVisibility(program.visibility === "Public" ? "Public" : "Private");
    setProgramOwner(program.owner ?? defaults.owner);
    setCertTemplate(program.certificationTemplate ?? defaults.certificationTemplate);
    setXpMultiplier(program.xpMultiplier ?? defaults.xpMultiplier);
    setApprovalWorkflow(program.approvalWorkflow ?? defaults.approvalWorkflow);
    setCohortsEnabled(Boolean(program.cohorts?.length));
    setProgramCohorts(program.cohorts ?? []);
    setAssignmentMode("Individual");
    setSelectedCohortId(program.cohorts?.[0]?.id ?? "");
    setCohortName("");
    setCohortStartDate("");
    setSaveAsTemplate(false);
    setProgramNotice(`Editing ${program.name}.`);
    setActiveTab("create");
  };

  const archiveProgram = (program: HRProgram) => {
    setArchivedProgramIds((programIds) =>
      programIds.includes(program.id) ? programIds : [...programIds, program.id],
    );
    const nextActiveProgram = activeProgramList.find((candidate) => candidate.id !== program.id);
    if (selectedProg === program.name && nextActiveProgram) {
      setSelectedProg(nextActiveProgram.name);
    }
    setProgramNotice(`${program.name} archived. Historical data remains preserved.`);
  };

  const createPrototypeProgram = () => {
    const defaults = PROGRAM_TYPE_DEFAULTS[programType] ?? PROGRAM_TYPE_DEFAULTS.Leadership;
    const nextProgramName = programName.trim() || `${programType} Program`;
    const pendingCohort =
      cohortsEnabled && cohortName.trim() && cohortStartDate
        ? [
            {
              id: `cohort-${Date.now()}`,
              name: cohortName.trim(),
              startDate: cohortStartDate,
              employeeNames: [],
            },
          ]
        : [];
    const cohortsForProgram = cohortsEnabled ? [...programCohorts, ...pendingCohort] : [];
    const uniqueAssignedEmployees = Array.from(
      new Set(cohortsForProgram.flatMap((cohort) => cohort.employeeNames ?? [])),
    );

    if (editingProgramId) {
      const existingProgram = programList.find((program) => program.id === editingProgramId);
      if (!existingProgram) {
        setEditingProgramId(null);
        setProgramNotice("That program could not be found. Please choose a program again.");
        setActiveTab("programs");
        return;
      }

      const updatedProgram: HRProgram = {
        ...existingProgram,
        type: programType,
        name: nextProgramName,
        duration: duration || defaults.duration,
        color: getProgramColor(programType),
        owner: programOwner,
        visibility,
        description: programDescription,
        certificationTemplate: certTemplate,
        xpMultiplier,
        approvalWorkflow,
        cohorts: cohortsForProgram,
        employees: uniqueAssignedEmployees.length || existingProgram.employees,
        inProgress:
          uniqueAssignedEmployees.length > 0
            ? Math.max(0, uniqueAssignedEmployees.length - existingProgram.completed)
            : existingProgram.inProgress,
      };

      setProgramList((programs) =>
        programs.map((program) => (program.id === editingProgramId ? updatedProgram : program)),
      );
      if (existingProgram.name !== nextProgramName) {
        setProgramTasks((tasks) =>
          tasks.map((task) =>
            task.programName === existingProgram.name
              ? { ...task, programName: nextProgramName }
              : task,
          ),
        );
        if (selectedProg === existingProgram.name) setSelectedProg(nextProgramName);
      }
      resetProgramForm();
      if (saveAsTemplate) saveProgramTemplate(updatedProgram);
      else {
        setProgramNotice(`${updatedProgram.name} updated.`);
        setActiveTab("programs");
      }
      return;
    }

    const newProgram: HRProgram = {
      id: `pg-${Date.now()}`,
      type: programType,
      name: nextProgramName,
      completed: 0,
      duration: duration || defaults.duration,
      tasks: 0,
      progress: 0,
      color: getProgramColor(programType),
      owner: programOwner,
      visibility,
      description: programDescription,
      certificationTemplate: certTemplate,
      xpMultiplier,
      approvalWorkflow,
      courseList: ["Starter course list"],
      milestones: ["Program launched"],
      assessmentRules: ["Completion rule pending"],
      cohorts: cohortsForProgram,
      employees: uniqueAssignedEmployees.length,
      inProgress: uniqueAssignedEmployees.length,
    };

    setProgramList((programs) => [newProgram, ...programs]);
    resetProgramForm();
    if (saveAsTemplate) saveProgramTemplate(newProgram);
    else {
      setProgramNotice(`${newProgram.name} created.`);
      setActiveTab("programs");
    }
  };

  const createProgram = async () => {
    setFormError("");
    const name = programName.trim();
    const selectedTypeId = Number(programTypeId);
    const selectedCategoryId = programCategoryId ? Number(programCategoryId) : undefined;
    const capacity = maxEnrollments ? Number(maxEnrollments) : undefined;

    if (!name) {
      setFormError("Program name is required.");
      return;
    }
    if (!Number.isInteger(selectedTypeId) || selectedTypeId <= 0) {
      setFormError("Select a predefined program type.");
      return;
    }
    if (!ownerEmployeeId) {
      setFormError("Select an HR owner.");
      return;
    }
    if (startDate && startDate < localToday()) {
      setFormError("Start date cannot be before today.");
      return;
    }
    if (startDate && endDate && endDate <= startDate) {
      setFormError("End date must be after the start date.");
      return;
    }
    if (capacity !== undefined && (!Number.isInteger(capacity) || capacity <= 0)) {
      setFormError("Expected cohort size must be a positive whole number.");
      return;
    }

    const input: CreateProgramInput = {
      name,
      programTypeId: selectedTypeId,
      ownerEmployeeId,
      visibility: detailsVisibility,
      rollingEnrollment,
      ...(programDescription.trim() ? { description: programDescription.trim() } : {}),
      ...(selectedCategoryId ? { programCategoryId: selectedCategoryId } : {}),
      ...(startDate ? { startDate } : {}),
      ...(endDate ? { endDate } : {}),
      ...(capacity !== undefined ? { maxEnrollments: capacity } : {}),
    };

    setIsSaving(true);
    try {
      const saved = await programApi.create(input);
      setProgramList((programs) => [
        toHRProgram(saved, programTypeOptions, employeeOptions),
        ...programs.filter((program) => program.id !== String(saved.id)),
      ]);

      if (saveAsTemplate) {
        try {
          const template = await programApi.saveAsTemplate(saved.id, {
            name: `${name} Template`,
            description: programDescription.trim() || null,
          });
          setProgramTemplates((templates) => [
            template,
            ...templates.filter((item) => item.id !== template.id),
          ]);
          setProgramNotice(`${name} saved as a draft and reusable template.`);
        } catch (reason: unknown) {
          setTemplateError(
            reason instanceof Error
              ? `Program draft saved, but its template could not be saved: ${reason.message}`
              : "Program draft saved, but its template could not be saved.",
          );
        }
        resetProgramForm();
        setActiveTab("templates");
        return;
      }

      resetProgramForm();
      navigate("program-detail", String(saved.id));
    } catch (reason: unknown) {
      setFormError(reason instanceof Error ? reason.message : "Unable to save the program draft.");
    } finally {
      setIsSaving(false);
    }
  };

  void createPrototypeProgram;

  const selectedProgramTasks = programTasks
    .filter((task) => task.programName === selectedProg)
    .sort(
      (a, b) =>
        a.timelineWeek - b.timelineWeek ||
        a.startDate.localeCompare(b.startDate) ||
        a.title.localeCompare(b.title),
    );
  const timelineWeeks = Array.from(
    selectedProgramTasks.reduce((weeks, task) => {
      const week = weeks.get(task.timelineWeek) ?? [];
      weeks.set(task.timelineWeek, [...week, task]);
      return weeks;
    }, new Map<number, ProgramTask[]>()),
  );

  const taskModalContext: ProgramTaskModalContext = {
    closeTaskModal,
    editingTaskId,
    saveProgramTask,
    selectedProg,
    setTaskDescription,
    setTaskDetail,
    setTaskDriveUrl,
    setTaskDueDate,
    setTaskFileName,
    setTaskMilestone,
    setTaskSource,
    setTaskStartDate,
    setTaskTimelineWeek,
    setTaskTitle,
    setTaskUnlockRule,
    taskDescription,
    taskDetail,
    taskDriveUrl,
    taskDueDate,
    taskFileName,
    taskMilestone,
    taskMilestones,
    taskModalType,
    taskSource,
    taskStartDate,
    taskTimelineWeek,
    taskTitle,
    taskTypeDefaults,
    taskUnlockRule,
  };

  const tasksTabContext: HRProgramTasksTabContext = {
    activeProgramList,
    activeTab,
    openTaskModal,
    selectedProg,
    selectedProgramTasks,
    setProgramList,
    setProgramTasks,
    setSelectedProg,
    timelineWeeks,
  };

  const programsTabContext: HRProgramsProgramsTabContext = {
    activeProgramList,
    archiveProgram,
    duplicateProgram,
    editProgram: (program) => navigate("program-detail", program.id),
    listError,
    programsLoading,
    programNotice,
    progTypes,
  };

  const templatesTabContext: HRProgramsTemplatesTabContext = {
    applyProgramTemplate,
    applyingTemplateId,
    deleteProgramTemplate,
    deletingTemplateId,
    employeeOptions,
    programCategoryOptions,
    programNotice,
    programTemplates,
    programTypeOptions,
    templateError,
    templatesLoading,
  };

  const createTabContext: HRProgramCreateTabContext = {
    activeProgTypes,
    addManagedOption,
    addProgramCohort,
    applyProgramTemplate: (template: ProgramTemplate) => {
      setProgramName(template.name);
      setProgramDescription("");
      const matchingType = programTypeOptions.find((type) => type.name === template.type);
      setProgramTypeId(matchingType == null ? "" : String(matchingType.id));
      setProgramType(template.type);
      setActiveTab("create");
    },
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
    programTemplates: [],
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
    setApprovalWorkflowOptions,
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
  };

  return (
    <div className="p-6 space-y-5 max-w-[1400px]">
      <ProgramTaskModal ctx={taskModalContext} />
      <PageHeader
        title="Learning Program Management"
        sub="Create, assign, and track structured learning programs"
        actions={
          <button
            onClick={() => {
              resetProgramForm();
              setActiveTab("create");
            }}
            className="flex items-center gap-1.5 px-3 py-2 text-white rounded-lg text-sm font-semibold"
            style={{ background: P.olive }}
          >
            <Plus size={14} /> New Program
          </button>
        }
      />

      <div className="flex gap-0" style={{ borderBottom: `1px solid ${P.border}` }}>
        {[
          ["programs", "Programs"],
          ["create", editingProgramId ? "Edit Program" : "Create Program"],
          ["templates", "Templates"],
          ["tasks", "Program Tasks"],
        ].map(([id, label]) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as typeof activeTab)}
            className="px-5 py-3 text-xs font-semibold"
            style={
              activeTab === id
                ? { color: P.olive, borderBottom: `2px solid ${P.olive}` }
                : { color: P.textMuted }
            }
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === "programs" && <HRProgramsProgramsTab ctx={programsTabContext} />}

      {activeTab === "templates" && <HRProgramsTemplatesTab ctx={templatesTabContext} />}

      {activeTab === "create" && <HRProgramCreateTab ctx={createTabContext} />}

      <HRProgramTasksTab ctx={tasksTabContext} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 5. HR PUBLISHING GOVERNANCE
// ─────────────────────────────────────────────────────────────
