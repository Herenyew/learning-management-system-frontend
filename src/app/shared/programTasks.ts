// Shared program-task model + seed data.
// Lives in a neutral module so both the HR screens (screens-hr chunk) and the
// Learner screens (screens-learner chunk) can import it without creating a
// circular chunk dependency between the two bundles.

export type ProgramTaskType = "Video" | "Reading" | "Quiz";
export type ProgramTaskSource = "device" | "gdrive";

export type ProgramTask = {
  id: string;
  programName: string;
  type: ProgramTaskType;
  title: string;
  detail: string;
  source: ProgramTaskSource;
  timelineWeek: number;
  startDate: string;
  dueDate: string;
  milestone: string;
  unlockRule: string;
  fileName?: string;
  driveUrl?: string;
  description?: string;
};

export const PROGRAM_TASKS_INITIAL: ProgramTask[] = [
  {
    id: "ptask-1",
    programName: "Future Leaders Initiative",
    type: "Video",
    title: "Introduction to Engineering Excellence",
    detail: "24 min",
    source: "device",
    timelineWeek: 1,
    startDate: "2026-07-06",
    dueDate: "2026-07-10",
    milestone: "Program Kickoff",
    unlockRule: "Available at program start",
    fileName: "engineering-excellence-intro.mp4",
  },
  {
    id: "ptask-2",
    programName: "Future Leaders Initiative",
    type: "Reading",
    title: "Engineering Standards Documentation",
    detail: "18 pages",
    source: "gdrive",
    timelineWeek: 1,
    startDate: "2026-07-08",
    dueDate: "2026-07-14",
    milestone: "Foundation Review",
    unlockRule: "Unlock after kickoff video",
    driveUrl: "https://drive.google.com/file/d/engineering-standards",
  },
  {
    id: "ptask-3",
    programName: "Future Leaders Initiative",
    type: "Quiz",
    title: "Module 1 Knowledge Check",
    detail: "15 questions",
    source: "device",
    timelineWeek: 2,
    startDate: "2026-07-15",
    dueDate: "2026-07-18",
    milestone: "Module 1 Checkpoint",
    unlockRule: "Unlock after required readings",
    fileName: "module-1-knowledge-check.xlsx",
  },
  {
    id: "ptask-4",
    programName: "Future Leaders Initiative",
    type: "Video",
    title: "Advanced Architecture Patterns",
    detail: "38 min",
    source: "gdrive",
    timelineWeek: 3,
    startDate: "2026-07-22",
    dueDate: "2026-07-28",
    milestone: "Applied Practice",
    unlockRule: "Unlock after Module 1 quiz pass",
    driveUrl: "https://drive.google.com/file/d/architecture-patterns-video",
  },
];
