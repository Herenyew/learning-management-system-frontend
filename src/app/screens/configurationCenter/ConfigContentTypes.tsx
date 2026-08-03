// Extensions3.tsx — Configuration Center, Analytics Center, Course Builder,
// Certification Management, Gamification, Two-Level Moderation
// Olive / Sage / Gold enterprise design language

import React, { useEffect, useState } from "react";
import {
  ContentWorkflowModal,
  DEFAULT_QUESTION_TYPE_CONFIG,
  describeAttemptScoringPolicy,
  loadAttemptScoringPolicy,
  saveAttemptScoringPolicy,
  type AttemptScoringMode,
  type AttemptScoringPolicy,
  type ContentAttachment,
  type ContentType,
  type QuestionTypeConfig,
  SavedContentItem,
  QuizOnlyModal,
  QuizRow,
  QuizPreviewModal,
} from "../../Extensions6";
import {
  EnrollmentRulesCrud,
  ReportsCrud,
  WidgetsCrud,
  WorkflowsCrud,
  XPRulesCrud,
} from "../../Extensions5";
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
import {
  AreaChart,
  Area,
  BarChart as ReBarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  AICard,
  ANALYTICS_TREND,
  Av,
  CERT_TEMPLATES,
  CERT_TEMPLATE_STORAGE_KEY,
  CONTENT_TYPES,
  CONTENT_TYPE_ICONS,
  COURSES_MINI,
  COURSE_COMMENTS,
  COURSE_TEMPLATE_STORAGE_KEY,
  CREATOR_CERTIFICATE_TEMPLATES,
  CertificateTemplateReviewModal,
  CertificationTemplate,
  CfgField,
  CfgSection,
  Chip,
  CourseContentTypeConfig,
  CourseCreationTemplate,
  CourseDraftDetails,
  CourseMini,
  CourseTemplateChapter,
  CourseTemplateContentItem,
  CreatorCertificateTemplate,
  DEFAULT_CONFIG_PROGRAM_TEMPLATES,
  DEFAULT_CONTENT_TYPE_CONFIG,
  DEFAULT_COURSE_CREATION_TEMPLATES,
  EMPLOYEES,
  EXTERNAL_PROVIDERS,
  LearningProgramTemplate,
  LearningProgramTemplateDraft,
  MODERATION_ITEMS,
  ModerationItem,
  P,
  PBar,
  PROGRAM_TEMPLATE_CONFIG_STORAGE_KEY,
  PageHeader,
  PreCourseAssessmentPolicy,
  SaveBar,
  SavedCreatorCourse,
  VERSIONS,
  contentSourceLabelFor,
  createBlankCourseTemplate,
  createCourseContentItemFromSaved,
  createCourseDraftFromTemplate,
  createCustomCourseDraft,
  createExistingCourseDraft,
  createProgramTemplateDraft,
  createSavedCreatorCourseDraft,
  getContentItemAttachments,
  loadConfigProgramTemplates,
  loadCourseCreationTemplates,
  normalizeConfigProgramTemplate,
  parseCourseTemplateChapters,
  saveConfigProgramTemplates,
  saveCourseCreationTemplates,
  serializeCourseTemplateChapters,
  splitTemplateLines,
} from "./configuration.shared";

export function ConfigContentTypes({
  contentTypes,
  setContentTypes,
}: {
  contentTypes?: CourseContentTypeConfig[];
  setContentTypes?: React.Dispatch<React.SetStateAction<CourseContentTypeConfig[]>>;
}) {
  const [localTypes, setLocalTypes] = useState<CourseContentTypeConfig[]>(
    DEFAULT_CONTENT_TYPE_CONFIG,
  );
  const types = contentTypes ?? localTypes;
  const setTypes = setContentTypes ?? setLocalTypes;
  const [expanded, setExpanded] = useState<string | null>(null);
  const toggle = (id: string) => setExpanded((e) => (e === id ? null : id));
  const update = (id: string, patch: Partial<CourseContentTypeConfig>) =>
    setTypes((ts) => ts.map((t) => (t.id === id ? { ...t, ...patch } : t)));

  return (
    <div className="space-y-5">
      {/* Master availability grid */}
      <CfgSection title="System-wide Content Type Availability">
        <p className="text-[11px] mb-4" style={{ color: P.textMuted }}>
          Expand each content type to configure its accepted formats, file limits, and essential
          type-specific settings.
        </p>

        <div className="space-y-2">
          {types.map((t) => {
            const Icon = CONTENT_TYPE_ICONS[t.id] ?? FileText;
            const open = expanded === t.id;
            return (
              <div
                key={t.id}
                className="rounded-xl border overflow-hidden transition-all"
                style={{ borderColor: P.border }}
              >
                {/* Row header */}
                <div
                  className="flex items-center gap-3 px-4 py-3 cursor-pointer"
                  style={{ background: "white" }}
                  onClick={() => toggle(t.id)}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: P.lightSage }}
                  >
                    <Icon size={15} style={{ color: P.olive }} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-semibold" style={{ color: P.text }}>
                        {t.label}
                      </p>
                      <span
                        className="text-[9px] font-bold px-1.5 py-0.5 rounded font-mono"
                        style={{ background: P.lightSage, color: P.darkOlive }}
                      >
                        {t.fr}
                      </span>
                      {t.requiresLRS && (
                        <span
                          className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                          style={{ background: "#EDE9FE", color: "#5B21B6" }}
                        >
                          LRS
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] mt-0.5 truncate" style={{ color: P.textMuted }}>
                      {t.desc}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div
                      style={{
                        color: P.textMuted,
                        transition: "transform 0.2s",
                        transform: open ? "rotate(180deg)" : "none",
                      }}
                    >
                      <ChevronDown size={14} />
                    </div>
                  </div>
                </div>

                {/* Expanded settings */}
                {open && (
                  <div
                    className="px-4 pb-4 pt-1 space-y-4"
                    style={{ borderTop: `1px solid ${P.border}50`, background: "white" }}
                  >
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label
                          className="block text-[10px] font-bold uppercase tracking-widest mb-1.5"
                          style={{ color: P.textMuted }}
                        >
                          Accepted Formats
                        </label>
                        <input
                          defaultValue={t.formats}
                          onChange={(e) => update(t.id, { formats: e.target.value })}
                          className="w-full px-3 py-2 text-xs rounded-lg bg-white focus:outline-none"
                          style={{ border: `1px solid ${P.border}`, color: P.text }}
                        />
                      </div>
                      {t.maxSizeMB > 0 && (
                        <div>
                          <label
                            className="block text-[10px] font-bold uppercase tracking-widest mb-1.5"
                            style={{ color: P.textMuted }}
                          >
                            Max File Size (MB)
                          </label>
                          <input
                            type="number"
                            defaultValue={t.maxSizeMB}
                            onChange={(e) => update(t.id, { maxSizeMB: Number(e.target.value) })}
                            className="w-full px-3 py-2 text-xs rounded-lg bg-white focus:outline-none"
                            style={{ border: `1px solid ${P.border}`, color: P.text }}
                          />
                        </div>
                      )}
                    </div>
                    {t.id === "scorm" && (
                      <div className="p-3 rounded-lg space-y-2" style={{ background: P.bg }}>
                        <p
                          className="text-[10px] font-bold uppercase tracking-widest"
                          style={{ color: P.textMuted }}
                        >
                          SCORM / xAPI-specific
                        </p>
                        <CfgField
                          label="SCORM version supported"
                          options={["SCORM 1.2 only", "SCORM 2004 only", "Both", "SCORM + xAPI"]}
                        />
                      </div>
                    )}
                    {t.id === "live" && (
                      <div className="p-3 rounded-lg space-y-2" style={{ background: P.bg }}>
                        <p
                          className="text-[10px] font-bold uppercase tracking-widest"
                          style={{ color: P.textMuted }}
                        >
                          Live Session-specific
                        </p>
                        <CfgField
                          label="Default conferencing platform"
                          options={[
                            "Zoom",
                            "Microsoft Teams",
                            "Google Meet",
                            "Webex",
                            "Custom URL",
                          ]}
                        />
                      </div>
                    )}
                    {t.id === "assignment" && (
                      <div className="p-3 rounded-lg space-y-2" style={{ background: P.bg }}>
                        <p
                          className="text-[10px] font-bold uppercase tracking-widest"
                          style={{ color: P.textMuted }}
                        >
                          Assignment-specific
                        </p>
                        <CfgField
                          label="Default reviewer"
                          options={["Line Manager", "Course Creator", "HR Admin", "Peer Learner"]}
                        />
                      </div>
                    )}
                    {t.id === "survey" && (
                      <div className="p-3 rounded-lg space-y-2" style={{ background: P.bg }}>
                        <p
                          className="text-[10px] font-bold uppercase tracking-widest"
                          style={{ color: P.textMuted }}
                        >
                          Survey-specific
                        </p>
                        <CfgField
                          label="Minimum required responses for reporting"
                          value="5"
                          type="number"
                        />
                      </div>
                    )}
                    {t.id === "external" && (
                      <div className="p-3 rounded-lg space-y-2" style={{ background: P.bg }}>
                        <p
                          className="text-[10px] font-bold uppercase tracking-widest"
                          style={{ color: P.textMuted }}
                        >
                          External Link-specific
                        </p>
                        <CfgField
                          label="Completion method"
                          options={[
                            "Self-reported by learner",
                            "Manager confirmation",
                            "LRS tracking (xAPI)",
                            "Time-on-page estimate",
                          ]}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CfgSection>

      <SaveBar />
    </div>
  );
}
