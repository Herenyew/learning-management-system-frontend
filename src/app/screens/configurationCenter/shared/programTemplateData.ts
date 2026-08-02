export type LearningProgramTemplate = {
  id: string;
  name: string;
  type: string;
  targetAudience: string;
  startDate: string;
  endDate: string;
  duration: string;
  courseCount: number;
  weeks: number;
  courses: number;
  taskList: string[];
  milestones: string[];
  active: boolean;
};

export type LearningProgramTemplateDraft = {
  name: string;
  type: string;
  targetAudience: string;
  startDate: string;
  endDate: string;
  duration: string;
  courseCount: string;
  taskText: string;
  milestoneText: string;
  active: boolean;
};

export const PROGRAM_TEMPLATE_CONFIG_STORAGE_KEY = "learnos_configuration_program_templates";

export const DEFAULT_CONFIG_PROGRAM_TEMPLATES: LearningProgramTemplate[] = [
  {
    id: "pt1",
    name: "New Hire Onboarding",
    type: "New Employee",
    targetAudience: "New hires",
    startDate: "2026-07-06",
    endDate: "2026-08-14",
    duration: "6 weeks",
    courseCount: 6,
    weeks: 6,
    courses: 6,
    taskList: ["Orientation checklist", "Mandatory policy courses", "Manager check-in"],
    milestones: ["Day 1 access ready", "Week 3 midpoint review", "Certificate on completion"],
    active: true,
  },
  {
    id: "pt2",
    name: "Leadership Development",
    type: "Leadership",
    targetAudience: "Managers",
    startDate: "2026-07-13",
    endDate: "2026-10-02",
    duration: "12 weeks",
    courseCount: 8,
    weeks: 12,
    courses: 8,
    taskList: ["Pre-assessment", "Leadership workshops", "Capstone reflection"],
    milestones: ["Kickoff", "Coaching checkpoint", "Final presentation"],
    active: true,
  },
  {
    id: "pt3",
    name: "Annual Compliance Pack",
    type: "Compliance",
    targetAudience: "All employees",
    startDate: "2026-08-01",
    endDate: "2026-08-28",
    duration: "4 weeks",
    courseCount: 5,
    weeks: 4,
    courses: 5,
    taskList: ["Policy acknowledgement", "Compliance quiz", "Manager attestation"],
    milestones: ["Launch notice", "Week 2 reminder", "Completion audit"],
    active: true,
  },
  {
    id: "pt4",
    name: "Graduate Talent Track",
    type: "Graduate Trainee",
    targetAudience: "Graduate trainees",
    startDate: "2026-09-01",
    endDate: "2027-02-16",
    duration: "24 weeks",
    courseCount: 12,
    weeks: 24,
    courses: 12,
    taskList: ["Rotation kickoff", "Project submission", "Skills assessment"],
    milestones: ["Cohort launch", "Mid-rotation review", "Final portfolio review"],
    active: false,
  },
];

export const normalizeConfigProgramTemplate = (
  template: Partial<LearningProgramTemplate> & Record<string, unknown>,
  index: number,
): LearningProgramTemplate => {
  const legacyWeeks = typeof template.weeks === "number" ? template.weeks : 8;
  const legacyCourses = typeof template.courses === "number" ? template.courses : 0;
  const duration =
    typeof template.duration === "string" && template.duration.trim()
      ? template.duration
      : `${legacyWeeks} weeks`;
  const courseCount = Number(template.courseCount ?? legacyCourses) || 0;
  return {
    id: typeof template.id === "string" ? template.id : `pt${index + 1}`,
    name: typeof template.name === "string" ? template.name : "Program Template",
    type: typeof template.type === "string" ? template.type : "Leadership",
    targetAudience:
      typeof template.targetAudience === "string" ? template.targetAudience : "Managers",
    startDate: typeof template.startDate === "string" ? template.startDate : "",
    endDate: typeof template.endDate === "string" ? template.endDate : "",
    duration,
    courseCount,
    weeks: legacyWeeks,
    courses: courseCount,
    taskList: Array.isArray(template.taskList)
      ? template.taskList.filter((item): item is string => typeof item === "string")
      : ["Course completion", "Milestone review"],
    milestones: Array.isArray(template.milestones)
      ? template.milestones.filter((item): item is string => typeof item === "string")
      : ["Kickoff", "Completion"],
    active: typeof template.active === "boolean" ? template.active : false,
  };
};

export const loadConfigProgramTemplates = () => {
  if (typeof window === "undefined") return DEFAULT_CONFIG_PROGRAM_TEMPLATES;
  try {
    const raw = window.localStorage.getItem(PROGRAM_TEMPLATE_CONFIG_STORAGE_KEY);
    if (!raw) return DEFAULT_CONFIG_PROGRAM_TEMPLATES;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return DEFAULT_CONFIG_PROGRAM_TEMPLATES;
    return parsed.map((template, index) => normalizeConfigProgramTemplate(template, index));
  } catch {
    return DEFAULT_CONFIG_PROGRAM_TEMPLATES;
  }
};

export const saveConfigProgramTemplates = (templates: LearningProgramTemplate[]) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PROGRAM_TEMPLATE_CONFIG_STORAGE_KEY, JSON.stringify(templates));
};

export const createProgramTemplateDraft = (
  template?: LearningProgramTemplate,
): LearningProgramTemplateDraft => ({
  name: template?.name ?? "",
  type: template?.type ?? "Leadership",
  targetAudience: template?.targetAudience ?? "",
  startDate: template?.startDate ?? "",
  endDate: template?.endDate ?? "",
  duration: template?.duration ?? "8 weeks",
  courseCount: String(template?.courseCount ?? 6),
  taskText: (template?.taskList ?? ["Enrollment approval", "Course completion"]).join("\n"),
  milestoneText: (template?.milestones ?? ["Kickoff", "Midpoint review", "Completion"]).join("\n"),
  active: template?.active ?? true,
});

export const splitTemplateLines = (value: string) =>
  value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
