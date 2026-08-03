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

export function ConfigQuestionTypes({
  questionTypes,
  setQuestionTypes,
}: {
  questionTypes?: QuestionTypeConfig[];
  setQuestionTypes?: React.Dispatch<React.SetStateAction<QuestionTypeConfig[]>>;
}) {
  const [localTypes, setLocalTypes] = useState<QuestionTypeConfig[]>(DEFAULT_QUESTION_TYPE_CONFIG);
  const types = questionTypes ?? localTypes;
  const setTypes = setQuestionTypes ?? setLocalTypes;
  const [newTypeName, setNewTypeName] = useState("");
  const [newTypeDesc, setNewTypeDesc] = useState("");
  const [newTypeGrading, setNewTypeGrading] = useState<QuestionTypeConfig["grading"]>("Manual");
  const builtInTypes = new Set(
    DEFAULT_QUESTION_TYPE_CONFIG.filter((type) => type.type !== "custom").map((type) => type.type),
  );
  const enabledForCreators = types.filter((type) => type.enabled && type.allowCreator).length;

  const update = (typeId: QuestionTypeConfig["type"], patch: Partial<QuestionTypeConfig>) =>
    setTypes((items) => items.map((item) => (item.type === typeId ? { ...item, ...patch } : item)));

  const addQuestionType = () => {
    const label = newTypeName.trim();
    if (!label) return;

    const id = `custom-${label
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")}`;
    const existing = types.find(
      (type) => type.type === id || type.label.toLowerCase() === label.toLowerCase(),
    );

    if (existing) {
      update(existing.type, { enabled: true, allowCreator: true });
      setNewTypeName("");
      setNewTypeDesc("");
      return;
    }

    setTypes((items) => [
      ...items,
      {
        type: id,
        label,
        desc: newTypeDesc.trim() || "HR-approved custom question format",
        enabled: true,
        allowCreator: true,
        grading: newTypeGrading,
      },
    ]);
    setNewTypeName("");
    setNewTypeDesc("");
    setNewTypeGrading("Manual");
  };

  const deleteCustomQuestionType = (typeId: QuestionTypeConfig["type"]) =>
    setTypes((items) => items.filter((item) => item.type !== typeId));

  return (
    <div className="space-y-5">
      <CfgSection title="Question Type Availability">
        <div
          className="rounded-xl border p-3 text-xs"
          style={{ borderColor: P.border, background: P.paleGreen, color: P.textMid }}
        >
          <span className="font-semibold">{enabledForCreators}</span> question type
          {enabledForCreators === 1 ? "" : "s"} currently visible to course creators. Disabled
          formats are hidden from the quiz builder and question picker.
        </div>

        <div className="space-y-2">
          {types.map((type) => {
            const isCustomBucket = type.type === "custom";
            const isBuiltIn = builtInTypes.has(type.type);
            const canDelete = !isBuiltIn && !isCustomBucket;

            return (
              <div
                key={type.type}
                className="rounded-xl border p-3"
                style={{
                  borderColor: type.enabled ? P.sage : P.border,
                  background: type.enabled ? "white" : P.bg,
                }}
              >
                <div className="flex flex-wrap items-start gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: type.enabled ? P.lightSage : P.paleGreen }}
                  >
                    <HelpCircle size={15} style={{ color: type.enabled ? P.olive : P.textMuted }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p
                        className="text-xs font-semibold"
                        style={{ color: type.enabled ? P.text : P.textMuted }}
                      >
                        {type.label}
                      </p>
                      <span
                        className="rounded-full px-2 py-0.5 text-[9px] font-bold"
                        style={{
                          background: isBuiltIn ? P.lightSage : P.goldLight,
                          color: isBuiltIn ? P.darkOlive : "#8A6A1A",
                        }}
                      >
                        {isBuiltIn ? "Built-in" : isCustomBucket ? "Custom control" : "Custom"}
                      </span>
                      <span
                        className="rounded-full px-2 py-0.5 text-[9px] font-bold"
                        style={{
                          background: type.allowCreator ? "#D8EDCC" : P.paleGreen,
                          color: type.allowCreator ? "#3A6420" : P.textMuted,
                        }}
                      >
                        {type.enabled && type.allowCreator ? "Creator visible" : "Hidden"}
                      </span>
                    </div>
                    <p className="mt-1 text-[10px]" style={{ color: P.textMuted }}>
                      {type.desc}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <select
                      value={type.grading}
                      onChange={(event) =>
                        update(type.type, {
                          grading: event.target.value as QuestionTypeConfig["grading"],
                        })
                      }
                      className="px-2 py-1.5 text-[11px] rounded-lg bg-white focus:outline-none"
                      style={{ border: `1px solid ${P.border}`, color: P.textMid }}
                    >
                      <option>Auto</option>
                      <option>Manual</option>
                      <option>Mixed</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => update(type.type, { allowCreator: !type.allowCreator })}
                      className="px-2.5 py-1.5 rounded-lg text-[10px] font-semibold"
                      style={{
                        border: `1px solid ${type.allowCreator ? P.olive : P.border}`,
                        color: type.allowCreator ? P.olive : P.textMuted,
                        background: type.allowCreator ? P.lightSage : "white",
                      }}
                    >
                      {type.allowCreator ? "Visible" : "Hidden"}
                    </button>
                    <button
                      type="button"
                      onClick={() => update(type.type, { enabled: !type.enabled })}
                      className="rounded-full relative transition-colors"
                      style={{
                        background: type.enabled ? P.olive : P.border,
                        width: 36,
                        height: 20,
                      }}
                      aria-label={`${type.enabled ? "Disable" : "Enable"} ${type.label}`}
                    >
                      <span
                        className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all"
                        style={{ left: type.enabled ? "18px" : "2px" }}
                      />
                    </button>
                    {canDelete && (
                      <button
                        type="button"
                        onClick={() => deleteCustomQuestionType(type.type)}
                        className="p-1.5 rounded-lg hover:bg-red-50"
                        style={{ color: "#C0392B" }}
                        aria-label={`Delete ${type.label}`}
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CfgSection>

      <CfgSection title="Add HR-Approved Question Type">
        <div className="grid md:grid-cols-[1fr_1.4fr_150px_auto] gap-2 items-end">
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: P.textMid }}>
              Type Name
            </label>
            <input
              value={newTypeName}
              onChange={(event) => setNewTypeName(event.target.value)}
              placeholder="e.g. Scenario Analysis"
              className="w-full px-3 py-2 text-sm rounded-lg bg-white focus:outline-none"
              style={{ border: `1px solid ${P.border}`, color: P.text }}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: P.textMid }}>
              Description
            </label>
            <input
              value={newTypeDesc}
              onChange={(event) => setNewTypeDesc(event.target.value)}
              placeholder="Shown to creators in the question picker"
              className="w-full px-3 py-2 text-sm rounded-lg bg-white focus:outline-none"
              style={{ border: `1px solid ${P.border}`, color: P.text }}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: P.textMid }}>
              Grading
            </label>
            <select
              value={newTypeGrading}
              onChange={(event) =>
                setNewTypeGrading(event.target.value as QuestionTypeConfig["grading"])
              }
              className="w-full px-3 py-2 text-sm rounded-lg bg-white focus:outline-none"
              style={{ border: `1px solid ${P.border}`, color: P.text }}
            >
              <option>Manual</option>
              <option>Mixed</option>
              <option>Auto</option>
            </select>
          </div>
          <button
            type="button"
            onClick={addQuestionType}
            disabled={!newTypeName.trim()}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-white flex items-center justify-center gap-1.5"
            style={{
              background: newTypeName.trim() ? P.olive : P.sage,
              opacity: newTypeName.trim() ? 1 : 0.65,
            }}
          >
            <Plus size={12} /> Add
          </button>
        </div>
        <div
          className="flex items-start gap-2 rounded-lg p-3 text-[11px]"
          style={{ background: P.bg, color: P.textMuted }}
        >
          <AlertCircle size={13} className="mt-0.5 flex-shrink-0" />
          <span>
            Use the creator-defined custom types row above to decide whether creators can add their
            own ad-hoc formats. Use this form when HR wants to pre-approve a reusable custom format.
          </span>
        </div>

        <SaveBar />
      </CfgSection>
    </div>
  );
}
