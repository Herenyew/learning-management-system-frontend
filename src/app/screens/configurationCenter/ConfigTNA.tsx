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

export function ConfigTNA() {
  const [formFields, setFormFields] = useState([
    { id: "f1", label: "Training Title", type: "Text", required: true },
    { id: "f2", label: "Training Provider", type: "Text", required: true },
    { id: "f3", label: "Training Objective", type: "Textarea", required: true },
    { id: "f4", label: "Expected Outcome", type: "Textarea", required: false },
    { id: "f5", label: "Training Start Date", type: "Date", required: true },
    { id: "f6", label: "Training End Date", type: "Date", required: false },
    { id: "f7", label: "Estimated Cost (USD)", type: "Number", required: false },
    { id: "f9", label: "Competency Category", type: "Dropdown", required: true },
    {
      id: "f10",
      label: "Supporting Justification",
      type: "File Upload",
      required: false,
    },
  ]);
  const [freeApproval, setFreeApproval] = useState([
    { id: "fa1", label: "Line Manager", role: "Manager", required: true },
  ]);
  const [paidApproval, setPaidApproval] = useState([
    { id: "pa1", label: "Line Manager", role: "Manager", required: true },
    { id: "pa2", label: "HR Review", role: "HR Admin", required: true },
    { id: "pa3", label: "Finance Approval", role: "Finance Manager", required: true },
    { id: "pa4", label: "CEO Sign-off", role: "CEO", required: true },
  ]);
  const [competencies, setCompetencies] = useState([
    "AI & Automation",
    "Data Literacy",
    "Leadership",
    "Cybersecurity",
    "Communication",
    "Finance & Compliance",
    "Technical Skills",
    "Soft Skills",
  ]);
  const [newComp, setNewComp] = useState("");

  const WorkflowBuilder = ({
    steps,
    setSteps,
    title,
  }: {
    steps: { id: string; label: string; role: string; required: boolean }[];
    setSteps: React.Dispatch<React.SetStateAction<typeof steps>>;
    title: string;
  }) => (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold" style={{ color: P.textMid }}>
          {title}
        </p>
        <button
          onClick={() =>
            setSteps((s) => [
              ...s,
              { id: `s${Date.now()}`, label: "New Step", role: "HR Admin", required: false },
            ])
          }
          className="flex items-center gap-1 text-xs font-semibold"
          style={{ color: P.olive }}
        >
          <Plus size={11} /> Add Step
        </button>
      </div>
      <div className="space-y-1.5">
        {steps.map((step, i) => (
          <div
            key={step.id}
            className="flex items-center gap-2 p-2.5 rounded-xl border"
            style={{ borderColor: P.border, background: "white" }}
          >
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0"
              style={{ background: P.olive }}
            >
              {i + 1}
            </div>
            <input
              defaultValue={step.label}
              className="flex-1 min-w-0 px-2 py-1 text-xs rounded-lg bg-white"
              style={{ border: `1px solid ${P.border}`, color: P.text }}
            />
            <select
              defaultValue={step.role}
              className="text-xs px-2 py-1 rounded-lg bg-white flex-shrink-0"
              style={{ border: `1px solid ${P.border}`, color: P.text }}
            >
              {[
                "Manager",
                "HR Admin",
                "Finance Manager",
                "CEO",
                "Department Head",
                "L&D Manager",
              ].map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
            <label
              className="flex items-center gap-1 text-[10px] flex-shrink-0"
              style={{ color: P.textMuted }}
            >
              <input
                type="checkbox"
                defaultChecked={step.required}
                style={{ accentColor: P.olive }}
              />{" "}
              Req.
            </label>
            <button
              onClick={() => setSteps((s) => s.filter((x) => x.id !== step.id))}
              style={{ color: "#C0392B" }}
            >
              <X size={12} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-5">
      {/* TNA Form Fields */}
      <CfgSection title="TNA Form Fields">
        <p className="text-[11px] mb-3" style={{ color: P.textMuted }}>
          Configure which fields appear on the TNA request form. Drag to reorder (display only).
        </p>
        <div className="space-y-1.5">
          {formFields.map((f) => (
            <div
              key={f.id}
              className="flex items-center gap-3 p-3 rounded-xl border"
              style={{ borderColor: P.border, background: "white" }}
            >
              <div
                className="flex flex-col gap-0.5 flex-shrink-0 cursor-grab"
                style={{ color: P.border }}
              >
                <div className="w-3.5 h-0.5 rounded" style={{ background: "currentColor" }} />
                <div className="w-3.5 h-0.5 rounded" style={{ background: "currentColor" }} />
                <div className="w-3.5 h-0.5 rounded" style={{ background: "currentColor" }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold" style={{ color: P.text }}>
                  {f.label}
                </p>
                <p className="text-[10px]" style={{ color: P.textMuted }}>
                  {f.type}
                </p>
              </div>
              <label
                className="flex items-center gap-1 text-[10px] flex-shrink-0"
                style={{ color: P.textMuted }}
              >
                <input
                  type="checkbox"
                  defaultChecked={f.required}
                  style={{ accentColor: P.olive }}
                />{" "}
                Required
              </label>
            </div>
          ))}
        </div>
        <button
          onClick={() =>
            setFormFields((ff) => [
              ...ff,
              {
                id: `f${Date.now()}`,
                label: "Custom Field",
                type: "Text",
                required: false,
              },
            ])
          }
          className="flex items-center gap-1.5 text-xs font-semibold mt-1"
          style={{ color: P.olive }}
        >
          <Plus size={12} /> Add Custom Field
        </button>
      </CfgSection>

      {/* Free / Paid Training Types */}
      <CfgSection title="Free / Paid Training Types">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border space-y-3" style={{ borderColor: P.border }}>
            <p className="text-xs font-bold" style={{ color: P.text }}>
              Free Training
            </p>
            <CfgField label="Max requests per employee per year" value="10" type="number" />
            <CfgField label="Max hours per request" value="40" type="number" />
          </div>
          <div className="p-4 rounded-xl border space-y-3" style={{ borderColor: P.border }}>
            <p className="text-xs font-bold" style={{ color: P.text }}>
              Paid Training
            </p>
            <CfgField label="Annual budget cap per employee (USD)" value="5000" type="number" />
            <CfgField label="Max cost per single request (USD)" value="2000" type="number" />
          </div>
        </div>
        <CfgField label="CEO approval threshold (USD)" value="1500" type="number" />
      </CfgSection>

      {/* Approval Chains */}
      <CfgSection title="Approval Chains">
        <p className="text-[11px] mb-4" style={{ color: P.textMuted }}>
          Define separate approval workflows for free and paid requests. Steps execute in order
          unless parallel approval is enabled.
        </p>
        <div className="space-y-5">
          <WorkflowBuilder
            steps={freeApproval}
            setSteps={setFreeApproval}
            title="Free Training Approval Chain"
          />
          <WorkflowBuilder
            steps={paidApproval}
            setSteps={setPaidApproval}
            title="Paid Training Approval Chain"
          />
        </div>
        <div className="grid sm:grid-cols-2 gap-4 pt-2">
          <CfgField label="Auto-rejection timeout (days)" value="14" type="number" />
          <CfgField label="Escalation after no response (days)" value="7" type="number" />
        </div>
      </CfgSection>

      {/* Budget Fields */}
      <CfgSection title="Budget Fields">
        <div className="grid sm:grid-cols-2 gap-4">
          <CfgField label="Organisation Annual L&D Budget (USD)" value="500000" type="number" />
          <CfgField label="Default Currency" options={["USD", "ETB", "EUR", "GBP"]} />
          <CfgField
            label="Budget Year Start Month"
            options={["January", "April", "July", "October"]}
          />
          <CfgField label="Budget Alert Threshold (%)" value="80" type="number" />
        </div>
      </CfgSection>

      {/* Competency Categories */}
      <CfgSection title="Competency Categories">
        <p className="text-[11px] mb-3" style={{ color: P.textMuted }}>
          Categories used to classify training needs. Appears as a dropdown in the TNA form.
        </p>
        <div className="flex flex-wrap gap-2 mb-3">
          {competencies.map((c) => (
            <div
              key={c}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
              style={{ background: P.goldLight, color: "#8A6A1A" }}
            >
              {c}
              <button onClick={() => setCompetencies((cs) => cs.filter((x) => x !== c))}>
                <X size={10} className="ml-0.5" />
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={newComp}
            onChange={(e) => setNewComp(e.target.value)}
            placeholder="Add competency category…"
            onKeyDown={(e) => {
              if (e.key === "Enter" && newComp.trim()) {
                setCompetencies((c) => [...c, newComp.trim()]);
                setNewComp("");
              }
            }}
            className="flex-1 px-3 py-2 text-sm rounded-lg bg-white focus:outline-none"
            style={{ border: `1px solid ${P.border}`, color: P.text }}
          />
          <button
            onClick={() => {
              if (newComp.trim()) {
                setCompetencies((c) => [...c, newComp.trim()]);
                setNewComp("");
              }
            }}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
            style={{ background: P.olive }}
          >
            Add
          </button>
        </div>
      </CfgSection>

      <SaveBar />
    </div>
  );
}
