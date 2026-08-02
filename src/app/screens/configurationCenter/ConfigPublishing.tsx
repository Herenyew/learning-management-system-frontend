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

export function ConfigPublishing() {
  const [publishSteps, setPublishSteps] = useState([
    { id: "pw1", label: "Creator Self-Review", role: "Creator", required: true },
    { id: "pw2", label: "Peer Review", role: "Creator (peer)", required: true },
    { id: "pw3", label: "HR Content Approval", role: "HR Admin", required: false },
    { id: "pw4", label: "L&D Sign-off", role: "L&D Manager", required: true },
  ]);
  const [approvalSteps, setApprovalSteps] = useState([
    { id: "ap1", label: "Department Head Review", role: "Department Head", required: false },
    { id: "ap2", label: "HR Final Approval", role: "HR Admin", required: true },
  ]);
  const [reviewChecklist, setReviewChecklist] = useState([
    { id: "rc1", label: "Accurate and up-to-date content", active: true },
    { id: "rc2", label: "Learning objectives clearly stated", active: true },
    { id: "rc3", label: "All media loads correctly", active: true },
    { id: "rc4", label: "Assessment questions reviewed", active: true },
    { id: "rc5", label: "Accessibility standards met (WCAG 2.1)", active: true },
    { id: "rc6", label: "ADIU branding guidelines followed", active: false },
    { id: "rc7", label: "No plagiarised content", active: true },
    { id: "rc8", label: "Duration accurately stated", active: false },
  ]);
  const [moderationRules, setModerationRules] = useState([
    {
      id: "mr1",
      label: "Flag content with profanity or hate speech",
      severity: "Block",
      active: true,
    },
    { id: "mr2", label: "Flag outdated regulatory references", severity: "Review", active: true },
    {
      id: "mr3",
      label: "Flag content without learning objectives",
      severity: "Warning",
      active: true,
    },
    { id: "mr4", label: "Flag duplicate course titles", severity: "Warning", active: false },
    { id: "mr5", label: "Flag courses with no assessment", severity: "Review", active: true },
    { id: "mr6", label: "Auto-flag learner reports (3+ reports)", severity: "Block", active: true },
  ]);

  const severityColor = (s: string) =>
    s === "Block"
      ? { bg: "#FEE2E2", color: "#B91C1C" }
      : s === "Review"
        ? { bg: P.goldLight, color: "#8A6A1A" }
        : { bg: P.lightSage, color: P.darkOlive };

  const WorkflowBuilder = ({
    steps,
    setSteps,
    title,
    sub,
  }: {
    steps: { id: string; label: string; role: string; required: boolean }[];
    setSteps: React.Dispatch<React.SetStateAction<typeof steps>>;
    title: string;
    sub?: string;
  }) => (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <div>
          <p className="text-xs font-semibold" style={{ color: P.textMid }}>
            {title}
          </p>
          {sub && (
            <p className="text-[10px]" style={{ color: P.textMuted }}>
              {sub}
            </p>
          )}
        </div>
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
                "Creator",
                "Creator (peer)",
                "HR Admin",
                "L&D Manager",
                "Department Head",
                "Compliance Officer",
                "CEO",
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
      {/* Publishing Workflow */}
      <CfgSection title="Publishing Workflow">
        <p className="text-[11px] mb-4" style={{ color: P.textMuted }}>
          Steps a course must pass through before it can go live. Applied to all new course
          submissions.
        </p>
        <WorkflowBuilder
          steps={publishSteps}
          setSteps={setPublishSteps}
          title="Publishing Steps (in order)"
          sub="Each step must be completed before the next begins unless parallel mode is on"
        />
        <div className="grid sm:grid-cols-2 gap-4 pt-2">
          <CfgField
            label="Who can initiate publishing"
            options={["Course Creator", "HR Admin", "L&D Manager", "Any HR role"]}
          />
          <CfgField label="Maximum publish review time (days)" value="5" type="number" />
        </div>
        <CfgToggle
          label="Enable parallel review steps"
          desc="All reviewers are notified simultaneously"
        />
        <CfgToggle label="Notify creator on each step completion" defaultOn />
        <CfgToggle
          label="Require mandatory courses to follow stricter workflow"
          desc="Mandatory courses always require HR + L&D sign-off regardless of settings"
          defaultOn
        />
        <CfgToggle
          label="Allow scheduled publish date"
          desc="Creator sets a future date; course auto-publishes when approved"
          defaultOn
        />
      </CfgSection>

      {/* Approval Workflow */}
      <CfgSection title="Approval Workflow">
        <p className="text-[11px] mb-4" style={{ color: P.textMuted }}>
          Secondary approval layer for escalated or sensitive content, applied after the publishing
          workflow.
        </p>
        <WorkflowBuilder
          steps={approvalSteps}
          setSteps={setApprovalSteps}
          title="Approval Steps"
          sub="Triggered for courses marked as mandatory, sensitive, or flagged during review"
        />
        <div className="grid sm:grid-cols-2 gap-4 pt-2">
          <CfgField
            label="Trigger approval workflow for"
            options={["Mandatory courses only", "All courses", "Flagged courses", "Custom rule"]}
          />
          <CfgField label="Approval timeout (days)" value="3" type="number" />
        </div>
        <CfgToggle label="Auto-reject if approval not completed in time" />
        <CfgToggle
          label="Allow appeal of rejected courses"
          desc="Creator can request a second review from a senior approver"
          defaultOn
        />
        <CfgToggle label="Notify all stakeholders on final decision" defaultOn />
      </CfgSection>

      {/* Content Review Process */}
      <CfgSection title="Content Review Process">
        <p className="text-[11px] mb-3" style={{ color: P.textMuted }}>
          Define the checklist reviewers must complete before approving a course for publishing.
        </p>
        <div className="space-y-1.5 mb-3">
          {reviewChecklist.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 p-3 rounded-xl border"
              style={{ borderColor: P.border, background: "white" }}
            >
              <CheckCircle
                size={13}
                style={{ color: item.active ? "#5A7A2A" : P.border, flexShrink: 0 }}
              />
              <p className="flex-1 text-xs font-medium" style={{ color: P.textMid }}>
                {item.label}
              </p>
              <button
                onClick={() =>
                  setReviewChecklist((rc) =>
                    rc.map((x) => (x.id === item.id ? { ...x, active: !x.active } : x)),
                  )
                }
                className="w-10 h-5 rounded-full relative transition-colors flex-shrink-0"
                style={{ background: item.active ? P.olive : P.border, width: 36, height: 20 }}
              >
                <span
                  className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all"
                  style={{ left: item.active ? "18px" : "2px" }}
                />
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={() =>
            setReviewChecklist((rc) => [
              ...rc,
              { id: `rc${Date.now()}`, label: "New checklist item", active: true },
            ])
          }
          className="flex items-center gap-1.5 text-xs font-semibold"
          style={{ color: P.olive }}
        >
          <Plus size={12} /> Add Checklist Item
        </button>
        <CfgToggle
          label="Reviewer must complete all active checklist items"
          desc="Approval is blocked until every active item is checked off"
          defaultOn
        />
        <CfgField
          label="Reviewer role"
          options={["Peer Creator", "HR Admin", "L&D Manager", "Subject Matter Expert"]}
        />
        <CfgField label="Minimum review score required (%)" value="80" type="number" />
      </CfgSection>

      {/* Moderation Rules */}
      <CfgSection title="Moderation Rules">
        <p className="text-[11px] mb-3" style={{ color: P.textMuted }}>
          Automated rules applied during and after publishing. Severity levels determine what action
          is taken.
        </p>
        <div className="space-y-1.5 mb-4">
          {moderationRules.map((rule) => {
            const sc = severityColor(rule.severity);
            return (
              <div
                key={rule.id}
                className="flex items-center gap-3 p-3 rounded-xl border"
                style={{ borderColor: P.border, background: "white" }}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium" style={{ color: P.textMid }}>
                    {rule.label}
                  </p>
                </div>
                <select
                  defaultValue={rule.severity}
                  className="text-xs px-2 py-1 rounded-lg flex-shrink-0"
                  style={{ border: `1px solid ${P.border}`, color: sc.color, background: sc.bg }}
                >
                  <option>Block</option>
                  <option>Review</option>
                  <option>Warning</option>
                </select>
                <button
                  onClick={() =>
                    setModerationRules((mr) =>
                      mr.map((x) => (x.id === rule.id ? { ...x, active: !x.active } : x)),
                    )
                  }
                  className="rounded-full relative transition-colors flex-shrink-0"
                  style={{ background: rule.active ? P.olive : P.border, width: 36, height: 20 }}
                >
                  <span
                    className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all"
                    style={{ left: rule.active ? "18px" : "2px" }}
                  />
                </button>
              </div>
            );
          })}
        </div>
        <button
          onClick={() =>
            setModerationRules((mr) => [
              ...mr,
              { id: `mr${Date.now()}`, label: "New rule", severity: "Warning", active: true },
            ])
          }
          className="flex items-center gap-1.5 text-xs font-semibold"
          style={{ color: P.olive }}
        >
          <Plus size={12} /> Add Rule
        </button>
        <div className="grid sm:grid-cols-2 gap-4 pt-2">
          <CfgField
            label="AI screening sensitivity"
            options={["High (more flags)", "Medium (balanced)", "Low (fewer flags)"]}
          />
          <CfgField label="Learner reports to trigger auto-flag" value="3" type="number" />
        </div>
        <CfgToggle
          label="Enable AI content screening on upload"
          desc="Content is screened before even entering the review queue"
          defaultOn
        />
        <CfgToggle
          label="Auto-unpublish on Block-severity flag"
          desc="Course is immediately removed from the catalog pending review"
          defaultOn
        />
        <CfgToggle label="Notify content creator of moderation action" defaultOn />
        <CfgToggle
          label="Moderation log visible to HR"
          desc="Full history of flags and actions is auditable"
          defaultOn
        />
      </CfgSection>

      <SaveBar />
    </div>
  );
}
