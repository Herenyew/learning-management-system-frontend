import type React from "react";
import type { ContentType, QuestionTypeConfig, SavedContentItem } from "../../Extensions6";
import type {
  CourseContentTypeConfig,
  CourseCreationTemplate,
  CourseDraftDetails,
  CourseMini,
  CreatorCertificateTemplate,
  EMPLOYEES,
} from "./configuration.shared";

export type AssignedIndividual = {
  name: string;
  initials: string;
  role: string;
  dept: string;
  color: string;
};

export type EmployeeDirectoryEntry = (typeof EMPLOYEES)[number];

export type QuizConfigState = {
  negativeMarking: boolean;
  negativeRatio: boolean;
  varyPerAttempt: boolean;
  attempt1Full: boolean;
  attempt2Reduced: boolean;
  attempt3Min: boolean;
  timeLimitMin: number;
  perQuestionSec: number;
  section1Min: number;
  section2Min: number;
  section3Min: number;
};

export type MyCoursesDashboardViewContext = {
  activeCertificateTemplateReview?: CreatorCertificateTemplate;
  activeCompanyCourseTemplates: CourseCreationTemplate[];
  activeContentChapter: string | null;
  activePreCourseAssessment: CourseDraftDetails["preCourseAssessment"];
  activeQuizModule: string | null;
  allowedCreatorContentTypes: ContentType[];
  assignMode: "individual" | "group";
  builderPanel: string;
  canAddQuiz: boolean;
  categoryOptions: string[];
  certEnabled: boolean;
  certScore: number;
  certTemplate: string;
  certTemplateReview: string | null;
  contactSearch: string;
  contentTypes: CourseContentTypeConfig[];
  course: CourseMini | null;
  courseDetails: CourseDraftDetails | null;
  courseEndQuizzes: Record<string, SavedContentItem[]>;
  createDraftCourse: (draft: CourseDraftDetails) => void;
  currentCourseEndQuizzes: SavedContentItem[];
  employeePickerOpen: boolean;
  employeePickerResults: EmployeeDirectoryEntry[];
  employeePickerSearch: string;
  enrollType: string;
  filter: string;
  filtered: CourseMini[];
  filteredCourses: CourseMini[];
  filteredEmployees: EmployeeDirectoryEntry[];
  individuals: AssignedIndividual[];
  levelOptions: string[];
  moduleQuizzes: Record<string, SavedContentItem[]>;
  navigate: (screen: string) => void;
  openCourseBuilder: (courseId: string, panel?: string) => void;
  openCourseTemplateChooser: () => void;
  prereqMode: "all" | "any";
  prereqSearch: string;
  prereqs: string[];
  previewQuiz: SavedContentItem | null;
  questionTypes: QuestionTypeConfig[];
  quizConfig: QuizConfigState;
  quizOption: "template" | "duplicate" | "custom";
  quizStep: 1 | 2 | 3;
  saveActiveCourse: () => void;
  search: string;
  selectedCategory: string;
  selectedContact: EmployeeDirectoryEntry | null;
  selectedGroups: string[];
  selectedLevel: string;
  setActiveContentChapter: React.Dispatch<React.SetStateAction<string | null>>;
  setActiveQuizModule: React.Dispatch<React.SetStateAction<string | null>>;
  setAssignMode: React.Dispatch<React.SetStateAction<"individual" | "group">>;
  setBuilderPanel: React.Dispatch<React.SetStateAction<string>>;
  setCertEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  setCertScore: React.Dispatch<React.SetStateAction<number>>;
  setCertTemplate: React.Dispatch<React.SetStateAction<string>>;
  setCertTemplateReview: React.Dispatch<React.SetStateAction<string | null>>;
  setContactSearch: React.Dispatch<React.SetStateAction<string>>;
  setCourseEndQuizzes: React.Dispatch<React.SetStateAction<Record<string, SavedContentItem[]>>>;
  setCourses: React.Dispatch<React.SetStateAction<CourseMini[]>>;
  setEmployeePickerOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setEmployeePickerSearch: React.Dispatch<React.SetStateAction<string>>;
  setEnrollType: React.Dispatch<React.SetStateAction<string>>;
  setFilter: React.Dispatch<React.SetStateAction<string>>;
  setIndividuals: React.Dispatch<React.SetStateAction<AssignedIndividual[]>>;
  setModuleQuizzes: React.Dispatch<React.SetStateAction<Record<string, SavedContentItem[]>>>;
  setOpenBuilder: React.Dispatch<React.SetStateAction<string | null>>;
  setPrereqMode: React.Dispatch<React.SetStateAction<"all" | "any">>;
  setPrereqSearch: React.Dispatch<React.SetStateAction<string>>;
  setPrereqs: React.Dispatch<React.SetStateAction<string[]>>;
  setPreviewQuiz: React.Dispatch<React.SetStateAction<SavedContentItem | null>>;
  setQuizConfig: React.Dispatch<React.SetStateAction<QuizConfigState>>;
  setQuizOption: React.Dispatch<React.SetStateAction<"template" | "duplicate" | "custom">>;
  setQuizStep: React.Dispatch<React.SetStateAction<1 | 2 | 3>>;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
  setSelectedContact: React.Dispatch<React.SetStateAction<EmployeeDirectoryEntry | null>>;
  setSelectedGroups: React.Dispatch<React.SetStateAction<string[]>>;
  setShowAddItem: React.Dispatch<React.SetStateAction<boolean>>;
  setShowContactDrop: React.Dispatch<React.SetStateAction<boolean>>;
  setShowCourseQuizWorkflow: React.Dispatch<React.SetStateAction<boolean>>;
  setShowCourseTemplateChooser: React.Dispatch<React.SetStateAction<boolean>>;
  setShowQuizModal: React.Dispatch<React.SetStateAction<boolean>>;
  setShowQuizWorkflow: React.Dispatch<React.SetStateAction<boolean>>;
  setUseCustomConfig: React.Dispatch<React.SetStateAction<boolean>>;
  setVisibilityScope: React.Dispatch<React.SetStateAction<string>>;
  showAddItem: boolean;
  showContactDrop: boolean;
  showCourseQuizWorkflow: boolean;
  showCourseTemplateChooser: boolean;
  showQuizModal: boolean;
  showQuizWorkflow: boolean;
  statusCounts: Record<string, number>;
  statuses: string[];
  toggleIndividualEmployee: (employee: EmployeeDirectoryEntry) => void;
  updateActiveCourseDraft: (updater: (draft: CourseDraftDetails) => CourseDraftDetails) => void;
  updateCertScore: (value: number) => void;
  useCustomConfig: boolean;
  visibilityScope: string;
};

export type MyCoursesBuilderViewContext = MyCoursesDashboardViewContext & {
  course: CourseMini;
  courseDetails: CourseDraftDetails;
};
