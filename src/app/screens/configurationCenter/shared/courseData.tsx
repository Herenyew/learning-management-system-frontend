import React, { useEffect, useState } from "react";
import {
  BookOpen,
  Award,
  BarChart2,
  Target,
  CheckCircle,
  AlertCircle,
  Plus,
  Download,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
  MessageSquare,
  Star,
  Play,
  Video,
  FileText,
  HelpCircle,
  Globe,
  Search,
  Sparkles,
  TrendingUp,
  TrendingDown,
  X,
  Copy,
  Archive,
  Send,
  Link,
  UserCheck,
  Layers,
  Shield,
  Eye,
  Settings,
  Zap,
  Lock,
  Users,
  Clock,
  Filter,
  MoreHorizontal,
  Flag,
  Upload,
  User,
  LayoutDashboard,
  Activity,
  Cpu,
  Music,
  RefreshCw,
  GitBranch,
  Tag,
  ChevronDown,
  ChevronUp,
  ToggleLeft,
  Trophy,
  Medal,
  Check,
  Wand2,
  PlusCircle,
  FileCheck,
  Bookmark,
  AlertTriangle,
  Image as ImageIcon,
  MousePointer2,
  Move,
  Palette,
  Square,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from "lucide-react";

import type { ContentAttachment, ContentType, SavedContentItem } from "../../../Extensions6";
import { P } from "./theme";

export type CourseContentTypeConfig = {
  id: string;
  fr: string;
  label: ContentType;
  desc: string;
  enabled: boolean;
  maxSizeMB: number;
  formats: string;
  requiresLRS: boolean;
  allowCreator: boolean;
  allowLearnerUpload: boolean;
};

export const DEFAULT_CONTENT_TYPE_CONFIG: CourseContentTypeConfig[] = [
  {
    id: "video",
    fr: "FR-111",
    label: "Video",
    desc: "MP4, MOV, AVI - streamed or uploaded. Supports auto-captions and playback speed control.",
    enabled: true,
    maxSizeMB: 2048,
    formats: "MP4, MOV, AVI, WEBM",
    requiresLRS: false,
    allowCreator: true,
    allowLearnerUpload: false,
  },
  {
    id: "document",
    fr: "FR-112",
    label: "Document",
    desc: "PDF, DOCX, PPTX - rendered inline in the course player with page navigation.",
    enabled: true,
    maxSizeMB: 100,
    formats: "PDF, DOCX, PPTX, XLSX",
    requiresLRS: false,
    allowCreator: true,
    allowLearnerUpload: false,
  },
  {
    id: "quiz",
    fr: "FR-113",
    label: "Quiz",
    desc: "Built-in quiz engine with MCQ, true/false, fill-in-the-blank, and matching question types.",
    enabled: true,
    maxSizeMB: 0,
    formats: "Built-in (no upload)",
    requiresLRS: false,
    allowCreator: true,
    allowLearnerUpload: false,
  },
  {
    id: "scorm",
    fr: "FR-114",
    label: "SCORM / xAPI",
    desc: "SCORM 1.2 and 2004 packages. Requires an LRS for xAPI/Tin Can tracking and completion reporting.",
    enabled: true,
    maxSizeMB: 500,
    formats: "ZIP (SCORM 1.2, SCORM 2004, xAPI)",
    requiresLRS: true,
    allowCreator: true,
    allowLearnerUpload: false,
  },
  {
    id: "audio",
    fr: "FR-115",
    label: "Audio",
    desc: "MP3 and WAV podcasts, voice-overs, and audio lessons with transcript support.",
    enabled: true,
    maxSizeMB: 200,
    formats: "MP3, WAV, OGG",
    requiresLRS: false,
    allowCreator: true,
    allowLearnerUpload: false,
  },
  {
    id: "assignment",
    fr: "FR-116",
    label: "Assignment",
    desc: "Structured submission tasks - file upload, text entry, or external link - with due dates and manager review.",
    enabled: true,
    maxSizeMB: 50,
    formats: "PDF, DOCX, ZIP, images",
    requiresLRS: false,
    allowCreator: true,
    allowLearnerUpload: true,
  },
  {
    id: "survey",
    fr: "FR-117",
    label: "Survey",
    desc: "Learner feedback forms - reaction surveys, satisfaction ratings, and open-ended responses.",
    enabled: true,
    maxSizeMB: 0,
    formats: "Built-in (no upload)",
    requiresLRS: false,
    allowCreator: true,
    allowLearnerUpload: false,
  },
  {
    id: "live",
    fr: "FR-118a",
    label: "Live Session",
    desc: "Scheduled virtual or in-person sessions with calendar integration, attendance tracking, and recording links.",
    enabled: true,
    maxSizeMB: 0,
    formats: "Zoom, Teams, Google Meet, In-person",
    requiresLRS: false,
    allowCreator: true,
    allowLearnerUpload: false,
  },
  {
    id: "external",
    fr: "FR-118b",
    label: "External Link",
    desc: "Link to third-party content - Coursera, LinkedIn Learning, YouTube, or any URL. Completion is self-reported or tracked via LRS.",
    enabled: true,
    maxSizeMB: 0,
    formats: "URL (any external site)",
    requiresLRS: false,
    allowCreator: true,
    allowLearnerUpload: false,
  },
];

export const CONTENT_TYPE_ICONS: Record<string, React.ElementType> = {
  video: Video,
  document: FileText,
  quiz: HelpCircle,
  scorm: Cpu,
  audio: Music,
  assignment: Upload,
  survey: MessageSquare,
  live: Video,
  external: Globe,
};

// ─── Local data ───────────────────────────────────────────────
export const EMPLOYEES = [
  {
    id: "e1",
    name: "Dr. Sarah Chen",
    role: "AI Course Lead",
    dept: "Technology",
    email: "sarah.chen@acmecorp.com",
    phone: "+1 555 0101",
  },
  {
    id: "e2",
    name: "Marcus Johnson",
    role: "Leadership Trainer",
    dept: "L&D",
    email: "marcus.j@acmecorp.com",
    phone: "+1 555 0102",
  },
  {
    id: "e3",
    name: "Priya Sharma",
    role: "Compliance Officer",
    dept: "Legal",
    email: "priya.s@acmecorp.com",
    phone: "+1 555 0103",
  },
  {
    id: "e4",
    name: "James Okafor",
    role: "HR Business Partner",
    dept: "HR",
    email: "james.o@acmecorp.com",
    phone: "+1 555 0104",
  },
  {
    id: "e5",
    name: "Sofia Andersen",
    role: "Finance Trainer",
    dept: "Finance",
    email: "sofia.a@acmecorp.com",
    phone: "+1 555 0105",
  },
  {
    id: "e6",
    name: "L&D Administrator",
    role: "Admin",
    dept: "Learning & Development",
    email: "l&d@acmecorp.com",
    phone: "+1 555 0199",
  },
];

export const COURSES_MINI = [
  {
    id: "1",
    title: "AI & ML for Business Leaders",
    category: "Technology",
    level: "Intermediate",
    status: "Published",
    enrolled: 12840,
    rating: 4.9,
    thumb:
      "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=200&h=112&fit=crop&auto=format",
  },
  {
    id: "2",
    title: "Data-Driven Leadership",
    category: "Leadership",
    level: "Advanced",
    status: "Published",
    enrolled: 9320,
    rating: 4.8,
    thumb:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=200&h=112&fit=crop&auto=format",
  },
  {
    id: "3",
    title: "Cybersecurity Fundamentals",
    category: "Compliance",
    level: "Beginner",
    status: "Published",
    enrolled: 24100,
    rating: 4.7,
    thumb:
      "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=200&h=112&fit=crop&auto=format",
  },
  {
    id: "4",
    title: "Effective Communication",
    category: "Soft Skills",
    level: "Beginner",
    status: "In Review",
    enrolled: 0,
    rating: 0,
    thumb:
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=200&h=112&fit=crop&auto=format",
  },
  {
    id: "5",
    title: "Financial Modeling",
    category: "Finance",
    level: "Advanced",
    status: "Draft",
    enrolled: 0,
    rating: 0,
    thumb:
      "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=200&h=112&fit=crop&auto=format",
  },
  {
    id: "6",
    title: "Design Thinking Workshop",
    category: "Design",
    level: "Intermediate",
    status: "Archived",
    enrolled: 8900,
    rating: 4.7,
    thumb:
      "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=200&h=112&fit=crop&auto=format",
  },
];

export type CourseMini = (typeof COURSES_MINI)[number];

export type CourseTemplateContentItem = {
  title: string;
  type: ContentType;
  duration: string;
  meta?: string;
  description?: string;
  source?: SavedContentItem["source"];
  primaryFile?: string;
  attachments?: ContentAttachment[];
};

export type CourseTemplateChapter = {
  title: string;
  contentItems: CourseTemplateContentItem[];
};

export type PreCourseAssessmentPolicy = "disabled" | "optional" | "mandatory";
export type CoursePlacement = "standalone" | "program";

export type CourseCreationTemplate = {
  id: string;
  name: string;
  title: string;
  description: string;
  level: string;
  category: string;
  chapters: CourseTemplateChapter[];
  xpValue: number;
  passThreshold: number;
  preCourseAssessment?: PreCourseAssessmentPolicy;
  active: boolean;
};

export type CourseDraftDetails = {
  sourceLabel: string;
  sourceType: "custom" | "existing-course" | "template";
  sourceTemplateId?: string;
  sourceTemplateName?: string;
  placement: CoursePlacement;
  programId?: string;
  programName?: string;
  title: string;
  description: string;
  level: string;
  category: string;
  duration: string;
  thumbnail: string;
  chapters: CourseTemplateChapter[];
  xpValue: number;
  passThreshold: number;
  preCourseAssessment: PreCourseAssessmentPolicy;
};

export type SavedCreatorCourse = {
  id: string;
  title: string;
  description: string;
  category: string;
  level: string;
  duration: string;
  chapters: CourseTemplateChapter[];
  thumbnail: string;
  lessons: number;
  xpValue: number;
  passThreshold: number;
  preCourseAssessment: PreCourseAssessmentPolicy;
  sourceType?: CourseDraftDetails["sourceType"];
  sourceTemplateId?: string;
  sourceTemplateName?: string;
  placement?: CoursePlacement;
  programId?: string;
  programName?: string;
};

export const COURSE_TEMPLATE_STORAGE_KEY = "learnos_course_creation_templates";

export const DEFAULT_COURSE_CREATION_TEMPLATES: CourseCreationTemplate[] = [
  {
    id: "ct-standard-self-paced",
    name: "Standard Self-Paced Course",
    title: "Role-Based Skills Course",
    description: "A structured async course with videos, reading material, and chapter checks.",
    level: "Intermediate",
    category: "Technology",
    xpValue: 450,
    passThreshold: 80,
    active: true,
    chapters: [
      {
        title: "Chapter 1: Foundations",
        contentItems: [
          { type: "Video", title: "Concept overview", duration: "12 min" },
          { type: "Document", title: "Reference guide", duration: "8 pages" },
          { type: "Quiz", title: "Foundation knowledge check", duration: "10 min" },
        ],
      },
      {
        title: "Chapter 2: Applied Practice",
        contentItems: [
          { type: "Video", title: "Worked example", duration: "18 min" },
          { type: "Assignment", title: "Practice activity", duration: "30 min" },
        ],
      },
      {
        title: "Chapter 3: Assessment",
        contentItems: [
          { type: "Quiz", title: "Chapter assessment", duration: "15 min" },
          { type: "Document", title: "Next steps checklist", duration: "2 pages" },
        ],
      },
    ],
  },
  {
    id: "ct-compliance-mandatory",
    name: "Compliance Mandatory Course",
    title: "Mandatory Compliance Training",
    description: "Policy learning path with attestation, required quiz, and completion evidence.",
    level: "Beginner",
    category: "Compliance",
    xpValue: 300,
    passThreshold: 90,
    active: true,
    chapters: [
      {
        title: "Chapter 1: Policy Overview",
        contentItems: [
          { type: "Document", title: "Policy document", duration: "12 pages" },
          { type: "Video", title: "Compliance briefing", duration: "9 min" },
        ],
      },
      {
        title: "Chapter 2: Scenarios",
        contentItems: [
          { type: "Video", title: "Scenario walkthrough", duration: "14 min" },
          { type: "Quiz", title: "Scenario check", duration: "12 min" },
        ],
      },
      {
        title: "Chapter 3: Attestation",
        contentItems: [
          { type: "Quiz", title: "Final compliance quiz", duration: "20 min" },
          { type: "Assignment", title: "Policy acknowledgement", duration: "5 min" },
        ],
      },
    ],
  },
  {
    id: "ct-live-workshop",
    name: "Live Workshop",
    title: "Facilitated Skills Workshop",
    description: "Blended course template with a live session, resources, and post-session quiz.",
    level: "Intermediate",
    category: "Leadership",
    xpValue: 350,
    passThreshold: 70,
    active: true,
    chapters: [
      {
        title: "Chapter 1: Pre-work",
        contentItems: [
          { type: "Document", title: "Pre-read pack", duration: "10 pages" },
          { type: "External Link", title: "Reflection prompt", duration: "10 min" },
        ],
      },
      {
        title: "Chapter 2: Live Session",
        contentItems: [
          { type: "Live Session", title: "Instructor-led workshop", duration: "90 min" },
          { type: "Assignment", title: "Breakout activity", duration: "30 min" },
        ],
      },
      {
        title: "Chapter 3: Wrap-up",
        contentItems: [
          { type: "Quiz", title: "Post-workshop quiz", duration: "10 min" },
          { type: "Assignment", title: "Action plan submission", duration: "20 min" },
        ],
      },
    ],
  },
  {
    id: "ct-microlearning",
    name: "Microlearning Module",
    title: "Focused Microlearning Topic",
    description: "Short course template for a single focused learning outcome.",
    level: "Beginner",
    category: "Soft Skills",
    xpValue: 150,
    passThreshold: 60,
    active: false,
    chapters: [
      {
        title: "Chapter 1: Quick Learn",
        contentItems: [
          { type: "Video", title: "Short explainer", duration: "7 min" },
          { type: "Quiz", title: "Quick check", duration: "5 min" },
        ],
      },
    ],
  },
];

export const loadCourseCreationTemplates = (): CourseCreationTemplate[] => {
  if (typeof window === "undefined") return DEFAULT_COURSE_CREATION_TEMPLATES;

  try {
    const saved = window.localStorage.getItem(COURSE_TEMPLATE_STORAGE_KEY);
    if (!saved) return DEFAULT_COURSE_CREATION_TEMPLATES;
    const parsed = JSON.parse(saved) as CourseCreationTemplate[];
    return Array.isArray(parsed) && parsed.length ? parsed : DEFAULT_COURSE_CREATION_TEMPLATES;
  } catch {
    return DEFAULT_COURSE_CREATION_TEMPLATES;
  }
};

export const saveCourseCreationTemplates = (templates: CourseCreationTemplate[]) => {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(COURSE_TEMPLATE_STORAGE_KEY, JSON.stringify(templates));
  }
};

export const createBlankCourseTemplate = (): CourseCreationTemplate => ({
  id: `ct${Date.now()}`,
  name: "New Company Course Template",
  title: "Untitled Course",
  description: "Describe the purpose, audience, and expected learning outcomes.",
  level: "Beginner",
  category: "Technology",
  xpValue: 300,
  passThreshold: 70,
  preCourseAssessment: "optional",
  active: false,
  chapters: [
    {
      title: "Chapter 1: Introduction",
      contentItems: [{ type: "Video", title: "Introductory lesson", duration: "10 min" }],
    },
  ],
});

export const createCustomCourseDraft = (): CourseDraftDetails => ({
  sourceLabel: "Custom Course",
  sourceType: "custom",
  placement: "standalone",
  title: "Untitled Custom Course",
  description: "",
  level: "Beginner",
  category: "Technology",
  duration: "8h 30m",
  thumbnail:
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&h=675&fit=crop&auto=format",
  xpValue: 300,
  passThreshold: 70,
  preCourseAssessment: "optional",
  chapters: [
    {
      title: "Chapter 1: New Chapter",
      contentItems: [{ type: "Video", title: "New content item", duration: "10 min" }],
    },
  ],
});

export const createExistingCourseDraft = (course: CourseMini): CourseDraftDetails => ({
  sourceLabel: "Existing Course",
  sourceType: "existing-course",
  placement: "standalone",
  title: course.title,
  description: "Describe what learners will gain from this course.",
  level: course.level,
  category: course.category,
  duration: "8h 30m",
  thumbnail: course.thumb,
  xpValue: 300,
  passThreshold: 80,
  preCourseAssessment: "optional",
  chapters: [
    {
      title: "Module 1: AI Foundations",
      contentItems: [
        { type: "Video", title: "What is AI?", duration: "12:40" },
        { type: "Document", title: "AI Industry Report", duration: "15 pages" },
        { type: "Quiz", title: "AI Foundations Quiz", duration: "10 min" },
      ],
    },
    {
      title: "Module 2: Machine Learning Concepts",
      contentItems: [],
    },
    {
      title: "Module 3: AI Strategy",
      contentItems: [],
    },
  ],
});

export const createSavedCreatorCourseDraft = (course: SavedCreatorCourse): CourseDraftDetails => ({
  sourceLabel:
    course.sourceType === "template" && course.sourceTemplateName
      ? `${course.sourceTemplateName} template`
      : course.sourceType === "existing-course"
        ? "Existing Course"
        : "Custom Course",
  sourceType: course.sourceType ?? "custom",
  sourceTemplateId: course.sourceTemplateId,
  sourceTemplateName: course.sourceTemplateName,
  placement: course.placement === "program" ? "program" : "standalone",
  programId: course.placement === "program" ? course.programId : undefined,
  programName: course.placement === "program" ? course.programName : undefined,
  title: course.title,
  description: course.description,
  level: course.level,
  category: course.category,
  duration: course.duration,
  thumbnail: course.thumbnail,
  xpValue: course.xpValue,
  passThreshold: course.passThreshold,
  preCourseAssessment: course.preCourseAssessment,
  chapters: course.chapters.map((chapter) => ({
    ...chapter,
    contentItems: chapter.contentItems.map((item) => ({ ...item })),
  })),
});

export const createCourseDraftFromTemplate = (
  template: CourseCreationTemplate,
): CourseDraftDetails => ({
  sourceLabel: `${template.name} template`,
  sourceType: "template",
  sourceTemplateId: template.id,
  sourceTemplateName: template.name,
  placement: "standalone",
  title: `${template.title} (Copy)`,
  description: template.description,
  level: template.level,
  category: template.category,
  duration: "8h 30m",
  thumbnail:
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&h=675&fit=crop&auto=format",
  xpValue: template.xpValue,
  passThreshold: template.passThreshold,
  preCourseAssessment: template.preCourseAssessment ?? "optional",
  chapters: template.chapters.map((chapter) => ({
    ...chapter,
    contentItems: chapter.contentItems.map((item) => ({ ...item })),
  })),
});

export const serializeCourseTemplateChapters = (chapters: CourseTemplateChapter[]) =>
  chapters
    .map(
      (chapter) =>
        `${chapter.title} | ${chapter.contentItems
          .map((item) => `${item.type}: ${item.title} (${item.duration})`)
          .join("; ")}`,
    )
    .join("\n");

export const parseCourseTemplateChapters = (value: string): CourseTemplateChapter[] => {
  const chapters = value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index): CourseTemplateChapter => {
      const [titlePart, itemsPart = ""] = line.split("|");
      const contentItems = itemsPart
        .split(";")
        .map((itemText) => itemText.trim())
        .filter(Boolean)
        .map((itemText): CourseTemplateContentItem => {
          const [rawType, rawRest = "New content item"] = itemText.split(":");
          const durationMatch = rawRest.match(/\(([^)]+)\)\s*$/);
          const title = rawRest.replace(/\([^)]+\)\s*$/, "").trim() || "New content item";
          const allowedTypes: CourseTemplateContentItem["type"][] = [
            "Video",
            "Document",
            "Quiz",
            "SCORM / xAPI",
            "Audio",
            "Interactive Video",
            "Assignment",
            "Survey",
            "Live Session",
            "External Link",
          ];
          const cleanType = rawType.trim() as CourseTemplateContentItem["type"];

          return {
            type: allowedTypes.includes(cleanType) ? cleanType : "Video",
            title,
            duration: durationMatch?.[1] ?? "10 min",
          };
        });

      return {
        title: titlePart.trim() || `Chapter ${index + 1}`,
        contentItems: contentItems.length
          ? contentItems
          : [
              {
                type: "Video",
                title: "New content item",
                duration: "10 min",
              } as CourseTemplateContentItem,
            ],
      };
    });

  return chapters.length ? chapters : createBlankCourseTemplate().chapters;
};

export const contentSourceLabelFor = (
  source?: SavedContentItem["source"],
): ContentAttachment["source"] =>
  source === "gdrive" ? "Google Drive" : source === "external" ? "External link" : "Device upload";

export const createCourseContentItemFromSaved = (
  item: SavedContentItem,
): CourseTemplateContentItem => ({
  title: item.title || item.type,
  type: item.type,
  duration: item.duration || item.meta || "10 min",
  meta: item.meta,
  description: item.description,
  source: item.source,
  primaryFile: item.primaryFile,
  attachments: item.attachments,
});

export const getContentItemAttachments = (item: CourseTemplateContentItem): ContentAttachment[] => {
  if (item.attachments?.length) return item.attachments;
  if (item.primaryFile) {
    return [
      {
        name: item.primaryFile,
        source: contentSourceLabelFor(item.source),
        detail: "Primary file",
      },
    ];
  }
  return [];
};
