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
  CfgToggle,
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

  const iconBg = (enabled: boolean) => (enabled ? P.lightSage : P.paleGreen);
  const iconColor = (enabled: boolean) => (enabled ? P.olive : P.textMuted);

  return (
    <div className="space-y-5">
      {/* Master availability grid */}
      <CfgSection title="System-wide Content Type Availability">
        <p className="text-[11px] mb-4" style={{ color: P.textMuted }}>
          Enable or disable content types platform-wide. Disabled types are hidden from course
          builders and learners. Expand each row to configure type-specific settings.
        </p>

        <div className="space-y-2">
          {types.map((t) => {
            const Icon = CONTENT_TYPE_ICONS[t.id] ?? FileText;
            const open = expanded === t.id;
            return (
              <div
                key={t.id}
                className="rounded-xl border overflow-hidden transition-all"
                style={{ borderColor: t.enabled ? P.sage : P.border }}
              >
                {/* Row header */}
                <div
                  className="flex items-center gap-3 px-4 py-3 cursor-pointer"
                  style={{ background: t.enabled ? "white" : P.bg }}
                  onClick={() => toggle(t.id)}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: iconBg(t.enabled) }}
                  >
                    <Icon size={15} style={{ color: iconColor(t.enabled) }} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p
                        className="text-xs font-semibold"
                        style={{ color: t.enabled ? P.text : P.textMuted }}
                      >
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
                    <span
                      className="text-[10px] font-medium"
                      style={{ color: t.enabled ? "#5A7A2A" : P.textMuted }}
                    >
                      {t.enabled ? "Enabled" : "Disabled"}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        update(t.id, { enabled: !t.enabled });
                      }}
                      className="rounded-full relative transition-colors"
                      style={{ background: t.enabled ? P.olive : P.border, width: 36, height: 20 }}
                    >
                      <span
                        className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all"
                        style={{ left: t.enabled ? "18px" : "2px" }}
                      />
                    </button>
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
                    <div className="flex flex-wrap gap-5">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={t.allowCreator}
                          onChange={(e) => update(t.id, { allowCreator: e.target.checked })}
                          style={{ accentColor: P.olive, width: 14, height: 14 }}
                        />
                        <span className="text-xs" style={{ color: P.textMid }}>
                          Creators can add this type to courses
                        </span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={t.allowLearnerUpload}
                          onChange={(e) => update(t.id, { allowLearnerUpload: e.target.checked })}
                          style={{ accentColor: P.olive, width: 14, height: 14 }}
                        />
                        <span className="text-xs" style={{ color: P.textMid }}>
                          Learners can upload (e.g. assignment submissions)
                        </span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={t.requiresLRS}
                          onChange={(e) => update(t.id, { requiresLRS: e.target.checked })}
                          style={{ accentColor: "#5B21B6", width: 14, height: 14 }}
                        />
                        <span className="text-xs" style={{ color: P.textMid }}>
                          Requires LRS for completion tracking
                        </span>
                      </label>
                    </div>
                    {t.id === "video" && (
                      <div className="p-3 rounded-lg space-y-2" style={{ background: P.bg }}>
                        <p
                          className="text-[10px] font-bold uppercase tracking-widest"
                          style={{ color: P.textMuted }}
                        >
                          Video-specific
                        </p>
                        <CfgToggle
                          label="Auto-generate captions"
                          desc="AI-powered transcription on upload"
                          defaultOn
                        />
                        <CfgToggle
                          label="Allow playback speed control"
                          desc="Learners can change 0.5× – 2×"
                          defaultOn
                        />
                        <CfgToggle
                          label="Enforce minimum watch percentage for completion"
                          desc="Links to Completion Criteria in XP config"
                          defaultOn
                        />
                      </div>
                    )}
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
                        <CfgToggle label="Pass SCORM completion to LRS" defaultOn />
                        <CfgToggle
                          label="Fall back to SCORM 1.2 if package version undetected"
                          defaultOn
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
                        <CfgToggle label="Auto-create calendar invite on scheduling" defaultOn />
                        <CfgToggle label="Send reminder 1 hour before session" defaultOn />
                        <CfgToggle label="Mark attendance from join/leave log" defaultOn />
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
                        <CfgToggle
                          label="Allow late submissions"
                          desc="After deadline, submission still accepted with flag"
                          defaultOn
                        />
                        <CfgToggle label="Require reviewer sign-off for completion" defaultOn />
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
                        <CfgToggle label="Allow anonymous survey responses" defaultOn />
                        <CfgToggle
                          label="Make survey mandatory for course completion"
                          desc="Learner must submit before receiving certificate"
                        />
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
                        <CfgToggle label="Open link in new tab" defaultOn />
                        <CfgToggle
                          label="Allow any URL"
                          desc="When off, only whitelisted domains are permitted"
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
