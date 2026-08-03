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

function ConfigStub({ title, items }: { title: string; items: [string, string, boolean?][] }) {
  return (
    <div className="space-y-5">
      <CfgSection title={title}>
        {items.map(([l, d, on]) => (
          <CfgToggle key={l} label={l} desc={d} defaultOn={on ?? false} />
        ))}
      </CfgSection>
      <SaveBar />
    </div>
  );
}

export function ConfigCertifications() {
  const [templates, setTemplates] = useState([
    { id: "t1", name: "Standard Completion", layout: "Landscape", active: true },
    { id: "t2", name: "Compliance Attestation", layout: "Portrait", active: true },
    { id: "t3", name: "Leadership Excellence", layout: "Landscape", active: false },
  ]);
  const [signers, setSigners] = useState([
    {
      id: "sg1",
      name: "Dawit Bekele",
      title: "CEO, ADIU Communication Service PLC",
      role: "Primary",
      required: true,
    },
    {
      id: "sg2",
      name: "Hiwot Tadesse",
      title: "Head of Learning & Development",
      role: "Secondary",
      required: true,
    },
    { id: "sg3", name: "Meron Alemu", title: "HR Director", role: "Witness", required: false },
  ]);
  const [stamps, setStamps] = useState([
    {
      id: "st1",
      label: "ADIU Official Seal",
      type: "Embossed",
      position: "Bottom-right",
      active: true,
    },
    {
      id: "st2",
      label: "L&D Department Stamp",
      type: "Digital",
      position: "Bottom-left",
      active: false,
    },
  ]);
  const [thresholds, setThresholds] = useState([
    {
      id: "th1",
      label: "Pass",
      min: 70,
      color: "#5A7A2A",
      desc: "Minimum passing score for certificate issuance",
    },
    {
      id: "th2",
      label: "Merit",
      min: 80,
      color: "#C8A85D",
      desc: "Issued with Merit notation on certificate",
    },
    {
      id: "th3",
      label: "Distinction",
      min: 90,
      color: "#065F46",
      desc: "Issued with Distinction and special border",
    },
  ]);
  const [renewalSteps, setRenewalSteps] = useState([
    { id: "r1", label: "Renewal Reminder Sent", offset: 30, channel: "Email" },
    { id: "r2", label: "Second Reminder", offset: 14, channel: "Email + In-app" },
    { id: "r3", label: "Manager Notified", offset: 7, channel: "Email" },
    { id: "r4", label: "Certificate Expired", offset: 0, channel: "System" },
  ]);

  return (
    <div className="space-y-5">
      {/* Certificate Templates */}
      <CfgSection title="Certificate Templates">
        <div className="space-y-2 mb-3">
          {templates.map((t) => (
            <div
              key={t.id}
              className="flex items-center gap-3 p-3 rounded-xl border"
              style={{ borderColor: P.border, background: "white" }}
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: P.lightSage }}
              >
                <Award size={16} style={{ color: P.olive }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold" style={{ color: P.text }}>
                  {t.name}
                </p>
                <p className="text-[10px]" style={{ color: P.textMuted }}>
                  {t.layout} layout
                </p>
              </div>
              <select
                className="text-xs px-2 py-1 rounded-lg bg-white flex-shrink-0"
                style={{ border: `1px solid ${P.border}`, color: P.text }}
              >
                <option>Landscape</option>
                <option>Portrait</option>
              </select>
              <button
                onClick={() =>
                  setTemplates((ts) =>
                    ts.map((x) => (x.id === t.id ? { ...x, active: !x.active } : x)),
                  )
                }
                className="w-10 h-5 rounded-full relative transition-colors flex-shrink-0"
                style={{ background: t.active ? P.olive : P.border }}
              >
                <span
                  className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all"
                  style={{ left: t.active ? "22px" : "2px" }}
                />
              </button>
              <button
                style={{ color: "#C0392B" }}
                onClick={() => setTemplates((ts) => ts.filter((x) => x.id !== t.id))}
              >
                <X size={13} />
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={() =>
            setTemplates((ts) => [
              ...ts,
              { id: `t${Date.now()}`, name: "New Template", layout: "Landscape", active: false },
            ])
          }
          className="flex items-center gap-1.5 text-xs font-semibold"
          style={{ color: P.olive }}
        >
          <Plus size={12} /> Add Template
        </button>
        <div className="grid sm:grid-cols-2 gap-4 pt-2">
          <CfgField
            label="Default Certificate Background"
            options={["ADIU Official", "Minimalist", "Award Style", "Gold Border", "Custom Upload"]}
          />
          <CfgField
            label="Font Style"
            options={["Serif (Formal)", "Sans-serif (Modern)", "Script (Classic)"]}
          />
        </div>
        <CfgToggle label="Include ADIU organisation letterhead" defaultOn />
        <CfgToggle
          label="Show learner photo on certificate"
          desc="Learner profile photo is printed on the certificate"
        />
      </CfgSection>

      {/* Signatures */}
      <CfgSection title="Signatures & Signers">
        <p className="text-[11px] mb-3" style={{ color: P.textMuted }}>
          Configure who must sign each certificate before it can be issued.
        </p>
        <div className="space-y-2 mb-3">
          {signers.map((s, i) => (
            <div
              key={s.id}
              className="flex items-start gap-3 p-3 rounded-xl border"
              style={{ borderColor: P.border, background: "white" }}
            >
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 mt-0.5"
                style={{ background: P.olive }}
              >
                {i + 1}
              </div>
              <div className="flex-1 grid grid-cols-2 gap-2">
                <input
                  defaultValue={s.name}
                  className="px-2.5 py-1.5 text-xs rounded-lg bg-white"
                  style={{ border: `1px solid ${P.border}`, color: P.text }}
                  placeholder="Full name"
                />
                <input
                  defaultValue={s.title}
                  className="px-2.5 py-1.5 text-xs rounded-lg bg-white"
                  style={{ border: `1px solid ${P.border}`, color: P.text }}
                  placeholder="Title / designation"
                />
              </div>
              <select
                defaultValue={s.role}
                className="text-xs px-2 py-1.5 rounded-lg bg-white flex-shrink-0"
                style={{ border: `1px solid ${P.border}`, color: P.text }}
              >
                <option>Primary</option>
                <option>Secondary</option>
                <option>Witness</option>
              </select>
              <label
                className="flex items-center gap-1 text-[10px] flex-shrink-0 mt-1"
                style={{ color: P.textMuted }}
              >
                <input
                  type="checkbox"
                  defaultChecked={s.required}
                  style={{ accentColor: P.olive }}
                />{" "}
                Required
              </label>
              <button
                onClick={() => setSigners((sg) => sg.filter((x) => x.id !== s.id))}
                style={{ color: "#C0392B" }}
                className="mt-0.5"
              >
                <X size={13} />
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={() =>
            setSigners((sg) => [
              ...sg,
              { id: `sg${Date.now()}`, name: "", title: "", role: "Secondary", required: false },
            ])
          }
          className="flex items-center gap-1.5 text-xs font-semibold"
          style={{ color: P.olive }}
        >
          <Plus size={12} /> Add Signer
        </button>
        <CfgToggle
          label="Require digital signature upload"
          desc="Signers must upload a scanned signature image"
          defaultOn
        />
        <CfgToggle
          label="Enable e-signature integration"
          desc="Connect DocuSign or similar for electronic signing"
        />
        <CfgToggle
          label="Require all signers before issuance"
          desc="Certificate cannot be issued until all Required signers have signed"
          defaultOn
        />
      </CfgSection>

      {/* Stamps */}
      <CfgSection title="Stamps & Seals">
        <div className="space-y-2 mb-3">
          {stamps.map((s) => (
            <div
              key={s.id}
              className="flex items-center gap-3 p-3 rounded-xl border"
              style={{ borderColor: P.border, background: "white" }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: P.goldLight }}
              >
                <Shield size={14} style={{ color: P.gold }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold" style={{ color: P.text }}>
                  {s.label}
                </p>
                <p className="text-[10px]" style={{ color: P.textMuted }}>
                  {s.type} · {s.position}
                </p>
              </div>
              <select
                defaultValue={s.position}
                className="text-xs px-2 py-1 rounded-lg bg-white"
                style={{ border: `1px solid ${P.border}`, color: P.text }}
              >
                {["Bottom-right", "Bottom-left", "Bottom-center", "Top-right"].map((pos) => (
                  <option key={pos}>{pos}</option>
                ))}
              </select>
              <button
                onClick={() =>
                  setStamps((st) =>
                    st.map((x) => (x.id === s.id ? { ...x, active: !x.active } : x)),
                  )
                }
                className="w-10 h-5 rounded-full relative transition-colors flex-shrink-0"
                style={{ background: s.active ? P.olive : P.border }}
              >
                <span
                  className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all"
                  style={{ left: s.active ? "22px" : "2px" }}
                />
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={() =>
            setStamps((st) => [
              ...st,
              {
                id: `st${Date.now()}`,
                label: "New Stamp",
                type: "Digital",
                position: "Bottom-right",
                active: false,
              },
            ])
          }
          className="flex items-center gap-1.5 text-xs font-semibold"
          style={{ color: P.olive }}
        >
          <Plus size={12} /> Add Stamp
        </button>
      </CfgSection>

      {/* Certification Thresholds */}
      <CfgSection title="Certification Thresholds">
        <p className="text-[11px] mb-3" style={{ color: P.textMuted }}>
          Define score bands that determine whether and how a certificate is issued.
        </p>
        <div className="space-y-2">
          {thresholds.map((t) => (
            <div
              key={t.id}
              className="flex items-center gap-3 p-3 rounded-xl border"
              style={{ borderColor: P.border, background: "white" }}
            >
              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: t.color }} />
              <input
                defaultValue={t.label}
                className="w-28 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-white"
                style={{ border: `1px solid ${P.border}`, color: P.text }}
              />
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="text-[10px]" style={{ color: P.textMuted }}>
                  Min score
                </span>
                <input
                  type="number"
                  defaultValue={t.min}
                  className="w-16 px-2 py-1.5 text-xs rounded-lg bg-white text-right"
                  style={{ border: `1px solid ${P.border}`, color: P.text }}
                />
                <span className="text-[10px]" style={{ color: P.textMuted }}>
                  %
                </span>
              </div>
              <input
                defaultValue={t.desc}
                className="flex-1 min-w-0 px-2.5 py-1.5 text-xs rounded-lg bg-white"
                style={{ border: `1px solid ${P.border}`, color: P.textMuted }}
              />
              <button
                onClick={() => setThresholds((th) => th.filter((x) => x.id !== t.id))}
                style={{ color: "#C0392B" }}
              >
                <X size={13} />
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={() =>
            setThresholds((th) => [
              ...th,
              { id: `th${Date.now()}`, label: "New Band", min: 0, color: P.sage, desc: "" },
            ])
          }
          className="flex items-center gap-1.5 text-xs font-semibold mt-1"
          style={{ color: P.olive }}
        >
          <Plus size={12} /> Add Threshold
        </button>
        <CfgToggle
          label="Block certificate if below minimum pass score"
          desc="Score below the lowest threshold prevents issuance"
          defaultOn
        />
        <CfgToggle
          label="Print threshold band on certificate"
          desc="e.g. 'Awarded with Distinction'"
          defaultOn
        />
      </CfgSection>

      {/* Expiry Rules */}
      <CfgSection title="Expiry Rules">
        <CfgToggle
          label="Enable certificate expiry"
          desc="Certificates are valid for a defined period before they must be renewed"
          defaultOn
        />
        <div className="grid sm:grid-cols-2 gap-4">
          <CfgField label="Default Validity Period (months)" value="24" type="number" />
          <CfgField
            label="Expiry Date Basis"
            options={["From issue date", "From course end date", "Fixed calendar date"]}
          />
        </div>
        <CfgToggle
          label="Per-course expiry override"
          desc="Course owners can set a different validity period for their course"
          defaultOn
        />
        <CfgToggle label="Auto-change status to Expired on expiry date" defaultOn />
        <CfgToggle
          label="Hide expired certificates from learner profile"
          desc="Expired certs move to archive tab"
        />
        <CfgToggle label="Notify learner's line manager on expiry" defaultOn />
      </CfgSection>

      {/* Renewal Rules */}
      <CfgSection title="Renewal Rules">
        <p className="text-[11px] mb-3" style={{ color: P.textMuted }}>
          Configure the renewal notification ladder — reminders sent before expiry in descending
          order.
        </p>
        <div className="space-y-2 mb-3">
          {renewalSteps.map((step, i) => (
            <div
              key={step.id}
              className="flex items-center gap-3 p-3 rounded-xl border"
              style={{ borderColor: step.offset === 0 ? "#FECACA" : P.border, background: "white" }}
            >
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                style={{ background: step.offset === 0 ? "#C0392B" : P.olive }}
              >
                {i + 1}
              </div>
              <div className="flex-1">
                <input
                  defaultValue={step.label}
                  className="w-full px-2 py-1 text-xs rounded-lg bg-white"
                  style={{ border: `1px solid ${P.border}`, color: P.text }}
                />
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {step.offset > 0 && (
                  <>
                    <input
                      type="number"
                      defaultValue={step.offset}
                      className="w-14 px-2 py-1 text-xs rounded-lg bg-white text-right"
                      style={{ border: `1px solid ${P.border}`, color: P.text }}
                    />
                    <span className="text-[10px]" style={{ color: P.textMuted }}>
                      days before
                    </span>
                  </>
                )}
                {step.offset === 0 && (
                  <span className="text-[10px] font-semibold" style={{ color: "#C0392B" }}>
                    On expiry
                  </span>
                )}
              </div>
              <select
                defaultValue={step.channel}
                className="text-xs px-2 py-1 rounded-lg bg-white flex-shrink-0"
                style={{ border: `1px solid ${P.border}`, color: P.text }}
              >
                {["Email", "In-app", "Email + In-app", "System", "None"].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
              {step.offset > 0 && (
                <button
                  onClick={() => setRenewalSteps((rs) => rs.filter((x) => x.id !== step.id))}
                  style={{ color: "#C0392B" }}
                >
                  <X size={13} />
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          onClick={() =>
            setRenewalSteps((rs) => [
              ...rs.slice(0, -1),
              { id: `r${Date.now()}`, label: "Reminder", offset: 21, channel: "Email" },
              rs[rs.length - 1],
            ])
          }
          className="flex items-center gap-1.5 text-xs font-semibold"
          style={{ color: P.olive }}
        >
          <Plus size={12} /> Add Reminder Step
        </button>
        <CfgToggle
          label="Allow self-service renewal"
          desc="Learner can re-take the course to renew without manager action"
          defaultOn
        />
        <CfgToggle
          label="Require manager to initiate renewal"
          desc="Only a manager can trigger the renewal workflow"
        />
        <CfgField label="Renewal grace period after expiry (days)" value="14" type="number" />
        <CfgToggle
          label="Keep history of all previous certificates"
          desc="Archived versions remain viewable but not active"
          defaultOn
        />
      </CfgSection>

      <SaveBar />
    </div>
  );
}
