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

import {
  CERT_BORDER_OPTIONS,
  CERT_DESIGN_BLOCK_LIBRARY,
  CERT_DYNAMIC_FIELDS,
  CERTIFICATE_DESIGN_PRESETS,
  DEFAULT_CERTIFICATE_ELEMENTS,
  type CertificateBackgroundType,
  type CertificateBorderStyle,
  type CertificateCanvasOrientation,
  type CertificateDesignMode,
  type CertificateDesignPreset,
  type CertificateElement,
  type CertificateElementType,
} from "./certificateDesigner.shared";

import {
  CertificationTemplateBuilderView,
  type CertificationBuilderViewContext,
} from "./CertificationTemplateBuilderView";
import { CertificationIssuedTab } from "./certification/CertificationIssuedTab";
import { CertificationProvidersTab } from "./certification/CertificationProvidersTab";
import { CertificationRenewalsTab } from "./certification/CertificationRenewalsTab";
import { CertificationStatsGrid } from "./certification/CertificationStatsGrid";
import { CertificationTemplatesTab } from "./certification/CertificationTemplatesTab";

export function CertificationMgmtScreen({ navigate }: { navigate: (s: string) => void }) {
  const [tab, setTab] = useState<"templates" | "issued" | "providers" | "renewals">("templates");
  const [templateLibrary, setTemplateLibrary] = useState<CertificationTemplate[]>(() => {
    if (typeof window === "undefined") return CERT_TEMPLATES;
    const savedTemplates = window.localStorage.getItem(CERT_TEMPLATE_STORAGE_KEY);
    if (!savedTemplates) return CERT_TEMPLATES;

    try {
      const parsed = JSON.parse(savedTemplates) as CertificationTemplate[];
      return Array.isArray(parsed) ? parsed : CERT_TEMPLATES;
    } catch {
      return CERT_TEMPLATES;
    }
  });
  const [templateSaveNotice, setTemplateSaveNotice] = useState("");
  const [templateDeleteId, setTemplateDeleteId] = useState<string | null>(null);
  const [builderOpen, setBuilderOpen] = useState(false);
  const [builderStep, setBuilderStep] = useState<1 | 2 | 3>(1);
  const [templateName, setTemplateName] = useState("Leadership Excellence Certificate");
  const [templateType, setTemplateType] = useState("Program completion");
  const [expiryRule, setExpiryRule] = useState("Valid for 2 years");
  const [selectedDesign, setSelectedDesign] = useState("executive");
  const [presetCategory, setPresetCategory] = useState("All");
  const [primarySigner, setPrimarySigner] = useState("sg1");
  const [secondarySigner, setSecondarySigner] = useState("sg2");
  const [includeStamp, setIncludeStamp] = useState(true);
  const [designMode, setDesignMode] = useState<CertificateDesignMode>("preset");
  const [canvasOrientation, setCanvasOrientation] =
    useState<CertificateCanvasOrientation>("landscape");
  const [scratchBackgroundType, setScratchBackgroundType] =
    useState<CertificateBackgroundType>("gradient");
  const [scratchBackgroundColor, setScratchBackgroundColor] = useState("#FFFDF6");
  const [scratchAccentColor, setScratchAccentColor] = useState(P.olive);
  const [scratchBorderStyle, setScratchBorderStyle] = useState<CertificateBorderStyle>("double");
  const [scratchBorderWidth, setScratchBorderWidth] = useState(8);
  const [selectedElementId, setSelectedElementId] = useState("learner");
  const [certificateElements, setCertificateElements] = useState<CertificateElement[]>(
    DEFAULT_CERTIFICATE_ELEMENTS,
  );

  const certificateDesigns = CERTIFICATE_DESIGN_PRESETS;

  const backendSigners = [
    {
      id: "sg1",
      name: "Hana Tadesse",
      title: "Chief Human Resources Officer",
      dept: "Human Resources",
      signature: "Hana Tadesse",
      auth: "All certificates",
      status: "Active",
    },
    {
      id: "sg2",
      name: "Yared Bekele",
      title: "Learning & Development Director",
      dept: "L&D",
      signature: "Yared Bekele",
      auth: "Course and program completion",
      status: "Active",
    },
    {
      id: "sg3",
      name: "Meron Alemu",
      title: "Compliance Officer",
      dept: "Legal",
      signature: "Meron Alemu",
      auth: "Compliance certificates",
      status: "Active",
    },
  ];

  const stampAssets = [
    { id: "official", name: "ADIU Official Seal", owner: "Corporate Services", status: "Approved" },
    { id: "ld", name: "L&D Department Stamp", owner: "Human Resources", status: "Approved" },
  ];

  const activeDesign =
    certificateDesigns.find((d) => d.id === selectedDesign) ?? certificateDesigns[0];
  const presetCategories = [
    "All",
    ...Array.from(new Set(certificateDesigns.map((design) => design.category))),
  ];
  const filteredCertificateDesigns =
    presetCategory === "All"
      ? certificateDesigns
      : certificateDesigns.filter((design) => design.category === presetCategory);
  const primarySignerRecord =
    backendSigners.find((s) => s.id === primarySigner) ?? backendSigners[0];
  const secondarySignerRecord =
    backendSigners.find((s) => s.id === secondarySigner) ?? backendSigners[1];
  const selectedElement =
    certificateElements.find((element) => element.id === selectedElementId) ??
    certificateElements[0];
  const visibleCertificateElements = certificateElements.filter(
    (element) => element.visible && (element.type !== "stamp" || includeStamp),
  );
  const selectedBorderOption =
    CERT_BORDER_OPTIONS.find((option) => option.id === scratchBorderStyle) ??
    CERT_BORDER_OPTIONS[0];
  const scratchCanvasBackground =
    scratchBackgroundType === "template"
      ? activeDesign.style === "navyWave"
        ? `linear-gradient(135deg, ${activeDesign.bg} 0%, #FFFFFF 54%, ${activeDesign.accent}14 100%)`
        : activeDesign.bg
      : scratchBackgroundType === "gradient"
        ? `linear-gradient(135deg, ${scratchBackgroundColor} 0%, #FFFFFF 52%, ${scratchAccentColor}24 100%)`
        : scratchBackgroundType === "image"
          ? `linear-gradient(rgba(255,255,255,0.88), rgba(255,255,255,0.88)), repeating-linear-gradient(135deg, ${scratchAccentColor}30 0 2px, transparent 2px 18px)`
          : scratchBackgroundColor;
  const scratchBorderCss =
    scratchBackgroundType === "template"
      ? activeDesign.style === "minimalFrame"
        ? `5px solid ${activeDesign.border}`
        : `7px double ${activeDesign.border}`
      : scratchBorderStyle === "none"
        ? "none"
        : `${scratchBorderWidth}px ${selectedBorderOption.line === "none" ? "solid" : selectedBorderOption.line} ${scratchAccentColor}`;
  const scratchDesignPayload = {
    mode: designMode,
    canvas: {
      orientation: canvasOrientation,
      backgroundType: scratchBackgroundType,
      backgroundColor: scratchBackgroundColor,
      accentColor: scratchAccentColor,
      borderStyle: scratchBorderStyle,
      borderWidth: scratchBorderWidth,
      templateBackgroundId: scratchBackgroundType === "template" ? activeDesign.id : undefined,
    },
    layers: certificateElements.map(
      ({ id, type, x, y, w, h, fontSize, color, align, visible }) => ({
        id,
        type,
        x,
        y,
        w,
        h,
        fontSize,
        color,
        align,
        visible,
      }),
    ),
  };

  const updateCertificateElement = (id: string, patch: Partial<CertificateElement>) => {
    setCertificateElements((elements) =>
      elements.map((element) => (element.id === id ? { ...element, ...patch } : element)),
    );
  };

  const selectCertificateBlock = (type: CertificateElementType) => {
    const element = certificateElements.find((item) => item.type === type);
    if (!element) return;
    updateCertificateElement(element.id, { visible: true });
    setSelectedElementId(element.id);
  };

  const resolveCertificateElementValue = (element: CertificateElement) => {
    if (element.type === "title") return templateName || element.value;
    if (element.type === "learner") return "Alex Mercer";
    if (element.type === "course") return "Future Leaders Initiative";
    if (element.type === "date") return "Issued Jun 24, 2026 | ID ADIU-FLI-2026-0001";
    if (element.type === "logo") return "ADIU Communication Service PLC";
    return element.value;
  };

  const renderPresetDecorations = (design: CertificateDesignPreset, compact = false) => {
    const ribbonWidth = compact ? 42 : 88;
    const cornerSize = compact ? 26 : 58;

    if (design.style === "blueRibbon") {
      return (
        <>
          <div
            className="absolute -left-6 top-2 rotate-[-42deg]"
            style={{ width: ribbonWidth, height: compact ? 10 : 22, background: design.secondary }}
          />
          <div
            className="absolute -left-2 top-5 rotate-[-42deg]"
            style={{ width: ribbonWidth, height: compact ? 9 : 18, background: design.accent }}
          />
          <div
            className="absolute -right-6 bottom-2 rotate-[-42deg]"
            style={{ width: ribbonWidth, height: compact ? 10 : 22, background: design.secondary }}
          />
          <div
            className="absolute -right-2 bottom-5 rotate-[-42deg]"
            style={{ width: ribbonWidth, height: compact ? 9 : 18, background: design.accent }}
          />
          <div
            className="absolute left-[7%] right-[7%] top-[8%] bottom-[8%] pointer-events-none"
            style={{ border: `${compact ? 1 : 2}px solid ${design.accent}` }}
          />
          <div
            className="absolute left-[9%] right-[9%] top-[10%] bottom-[10%] pointer-events-none"
            style={{ border: `${compact ? 1 : 2}px solid ${design.accent}` }}
          />
        </>
      );
    }

    if (design.style === "navyWave") {
      return (
        <>
          <div
            className="absolute -left-[7%] -top-[22%] rounded-full"
            style={{
              width: compact ? 150 : 360,
              height: compact ? 105 : 250,
              background: design.accent,
            }}
          />
          <div
            className="absolute -right-[11%] -bottom-[26%] rounded-full"
            style={{
              width: compact ? 165 : 390,
              height: compact ? 110 : 260,
              background: design.accent,
            }}
          />
          <div
            className="absolute left-[4%] top-[4%] rounded-full border-white/70"
            style={{
              width: compact ? 38 : 90,
              height: compact ? 38 : 90,
              borderWidth: compact ? 1 : 2,
            }}
          />
          <div
            className="absolute right-[5%] bottom-[7%] rounded-full border-white/70"
            style={{
              width: compact ? 44 : 110,
              height: compact ? 44 : 110,
              borderWidth: compact ? 1 : 2,
            }}
          />
          <div
            className="absolute left-[12%] top-[16%] rounded-full"
            style={{
              width: compact ? 24 : 56,
              height: compact ? 24 : 56,
              background: `radial-gradient(circle, #F7E5A0 0 38%, ${design.secondary} 40% 70%, #8A6A13 72% 100%)`,
              boxShadow: "0 3px 10px rgba(0,0,0,0.18)",
            }}
          />
        </>
      );
    }

    if (design.style === "geometric") {
      return (
        <>
          <div
            className="absolute inset-y-0 left-0"
            style={{
              width: compact ? "22%" : "21%",
              backgroundColor: "#564C49",
              backgroundImage: `linear-gradient(135deg, ${design.secondary} 25%, transparent 25%), linear-gradient(225deg, ${design.secondary} 25%, transparent 25%), linear-gradient(45deg, ${design.secondary} 25%, transparent 25%), linear-gradient(315deg, ${design.secondary} 25%, #564C49 25%)`,
              backgroundPosition: "10px 0, 10px 0, 0 0, 0 0",
              backgroundSize: compact ? "20px 20px" : "42px 42px",
            }}
          />
          <div
            className="absolute right-[6%] top-0"
            style={{
              width: compact ? 15 : 36,
              height: compact ? 34 : 84,
              background: design.secondary,
              clipPath: "polygon(0 0, 100% 0, 100% 100%, 50% 78%, 0 100%)",
            }}
          />
          <div
            className="absolute right-[5%] bottom-[8%]"
            style={{
              width: cornerSize,
              height: cornerSize,
              background:
                "linear-gradient(135deg, transparent 0 50%, rgba(184,137,38,0.45) 50% 100%)",
            }}
          />
        </>
      );
    }

    if (design.style === "goldSeal") {
      return (
        <>
          <div
            className="absolute inset-[6%] pointer-events-none"
            style={{ border: `${compact ? 2 : 5}px double ${design.border}` }}
          />
          {[
            ["left", "top"],
            ["right", "top"],
            ["left", "bottom"],
            ["right", "bottom"],
          ].map(([x, y]) => (
            <div
              key={`${x}-${y}`}
              className="absolute rounded-full"
              style={{
                [x]: compact ? 10 : 26,
                [y]: compact ? 10 : 26,
                width: compact ? 14 : 34,
                height: compact ? 14 : 34,
                background: `radial-gradient(circle, #F8E6A3 0 28%, ${design.secondary} 32% 44%, ${design.accent} 48% 100%)`,
              }}
            />
          ))}
        </>
      );
    }

    if (design.style === "minimalFrame") {
      return (
        <>
          <div
            className="absolute inset-x-[8%] top-[13%] h-px"
            style={{ background: design.border }}
          />
          <div
            className="absolute inset-x-[8%] bottom-[13%] h-px"
            style={{ background: design.border }}
          />
          <div
            className="absolute right-[8%] top-[10%] rounded-full opacity-25"
            style={{
              width: compact ? 40 : 92,
              height: compact ? 40 : 92,
              background: design.secondary,
            }}
          />
        </>
      );
    }

    if (design.style === "compliance") {
      return (
        <>
          <div
            className="absolute inset-[6%] border-dashed"
            style={{ borderColor: design.border, borderWidth: compact ? 1 : 2 }}
          />
          <div
            className="absolute right-[8%] top-[10%] rotate-12 rounded-md px-2 py-1 font-bold uppercase"
            style={{
              color: design.accent,
              border: `${compact ? 1 : 2}px solid ${design.accent}`,
              fontSize: compact ? 7 : 12,
              opacity: 0.72,
            }}
          >
            Verified
          </div>
        </>
      );
    }

    return (
      <div
        className="absolute inset-[6%] pointer-events-none"
        style={{ border: `${compact ? 2 : 6}px double ${design.border}` }}
      />
    );
  };

  const getTemplateBackgroundStyle = (
    design: CertificateDesignPreset,
    compact = false,
  ): React.CSSProperties => ({
    aspectRatio: "1.414 / 1",
    background:
      design.style === "navyWave"
        ? `linear-gradient(135deg, ${design.bg} 0%, #FFFFFF 54%, ${design.accent}14 100%)`
        : design.bg,
    border:
      design.style === "minimalFrame"
        ? `${compact ? 2 : 5}px solid ${design.border}`
        : `${compact ? 2 : 7}px double ${design.border}`,
    boxShadow: compact ? "none" : "0 18px 45px rgba(46,58,21,0.10)",
  });

  const renderTemplateBackgroundLayer = (design: CertificateDesignPreset, compact = false) => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {renderPresetDecorations(design, compact)}
    </div>
  );

  const renderCertificatePresetCanvas = (design: CertificateDesignPreset, compact = false) => {
    const title = templateName || design.name;
    const isGeometric = design.style === "geometric";
    const isNavy = design.style === "navyWave";

    return (
      <div
        className="relative overflow-hidden bg-white"
        style={getTemplateBackgroundStyle(design, compact)}
      >
        {renderTemplateBackgroundLayer(design, compact)}
        <div
          className="relative z-10 h-full flex flex-col items-center text-center"
          style={{
            padding: compact ? "10px 12px" : "54px 70px 42px",
            marginLeft: isGeometric ? (compact ? "20%" : "18%") : 0,
          }}
        >
          <p
            className="font-bold uppercase"
            style={{
              color: isNavy ? design.secondary : design.accent,
              fontSize: compact ? 7 : 11,
              letterSpacing: compact ? 0 : "0.18em",
            }}
          >
            ADIU Communication Service PLC
          </p>
          <h2
            className="font-bold"
            style={{
              marginTop: compact ? 5 : 28,
              color: isGeometric ? design.accent : P.text,
              fontSize: compact ? 16 : 42,
              lineHeight: 1.05,
              fontFamily:
                design.style === "blueRibbon" || design.style === "goldSeal"
                  ? "Georgia, serif"
                  : "'Plus Jakarta Sans', sans-serif",
            }}
          >
            {compact ? "Certificate" : title}
          </h2>
          <p
            style={{
              marginTop: compact ? 4 : 16,
              color: P.textMuted,
              fontSize: compact ? 7 : 13,
            }}
          >
            This certificate is proudly presented to
          </p>
          <p
            className="font-bold"
            style={{
              marginTop: compact ? 4 : 14,
              color: design.style === "navyWave" ? design.accent : design.secondary,
              fontSize: compact ? 14 : 38,
              lineHeight: 1,
              fontFamily: "Georgia, serif",
            }}
          >
            Alex Mercer
          </p>
          <div
            style={{
              width: compact ? "58%" : "56%",
              height: 1,
              background: design.border,
              marginTop: compact ? 5 : 14,
            }}
          />
          <p
            style={{
              marginTop: compact ? 5 : 16,
              maxWidth: compact ? 165 : 480,
              color: P.textMid,
              fontSize: compact ? 7 : 13,
              lineHeight: 1.45,
            }}
          >
            has successfully completed Future Leaders Initiative.
          </p>
          {includeStamp && (
            <div
              className="absolute rounded-full flex items-center justify-center text-center font-bold uppercase"
              style={{
                left: isGeometric ? "57%" : "50%",
                bottom: compact ? 27 : 120,
                transform: "translateX(-50%)",
                width: compact ? 20 : 72,
                height: compact ? 20 : 72,
                border: `${compact ? 2 : 4}px solid ${design.secondary}`,
                color: design.secondary,
                background: `${design.bg}E6`,
                fontSize: compact ? 5 : 9,
                lineHeight: 1.05,
              }}
            >
              Official Seal
            </div>
          )}
          <div
            className="mt-auto grid grid-cols-2 items-end"
            style={{
              width: compact ? "76%" : "72%",
              gap: compact ? 16 : 64,
              color: P.text,
            }}
          >
            {[primarySignerRecord, secondarySignerRecord].map((signer) => (
              <div key={signer.id}>
                <p
                  style={{
                    color: design.accent,
                    fontSize: compact ? 9 : 20,
                    fontFamily: "Georgia, serif",
                    fontStyle: "italic",
                  }}
                >
                  {compact ? signer.name.split(" ")[0] : signer.signature}
                </p>
                <div style={{ borderTop: `1px solid ${design.border}` }} />
                <p
                  className="font-bold"
                  style={{ fontSize: compact ? 6 : 11, marginTop: compact ? 2 : 8 }}
                >
                  {compact ? "Signer" : signer.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const saveCertificateTemplate = () => {
    const savedName = templateName.trim() || "Untitled Certificate Template";
    const savedTemplate: CertificationTemplate = {
      id: `ct-${Date.now()}`,
      name: savedName,
      signers: [primarySignerRecord.name, secondarySignerRecord.name],
      hasStamp: includeStamp,
      active: 0,
      archived: 0,
      color:
        designMode === "scratch" && scratchBackgroundType === "template"
          ? activeDesign.accent
          : designMode === "scratch"
            ? scratchAccentColor
            : activeDesign.accent,
      designMode: designMode === "scratch" ? "Scratch" : "Preset",
      borderLabel:
        designMode === "scratch" && scratchBackgroundType === "template"
          ? `Background: ${activeDesign.name}`
          : designMode === "scratch"
            ? selectedBorderOption.label
            : activeDesign.name,
    };

    setTemplateLibrary((templates) => {
      const nextTemplates = [savedTemplate, ...templates];
      window.localStorage.setItem(CERT_TEMPLATE_STORAGE_KEY, JSON.stringify(nextTemplates));
      return nextTemplates;
    });
    setTemplateSaveNotice(`${savedName} saved to the templates list.`);
    window.setTimeout(() => setTemplateSaveNotice(""), 3500);
    setBuilderOpen(false);
    setTab("templates");
  };

  const deleteCertificateTemplate = (templateId: string) => {
    const deletedTemplate = templateLibrary.find((template) => template.id === templateId);

    setTemplateLibrary((templates) => {
      const nextTemplates = templates.filter((template) => template.id !== templateId);
      window.localStorage.setItem(CERT_TEMPLATE_STORAGE_KEY, JSON.stringify(nextTemplates));
      return nextTemplates;
    });
    setTemplateDeleteId(null);
    setTemplateSaveNotice(`${deletedTemplate?.name ?? "Certificate template"} deleted.`);
    window.setTimeout(() => setTemplateSaveNotice(""), 3500);
  };

  const builderContext: CertificationBuilderViewContext = {
    activeDesign,
    backendSigners,
    builderStep,
    canvasOrientation,
    certificateDesigns,
    certificateElements,
    designMode,
    expiryRule,
    filteredCertificateDesigns,
    getTemplateBackgroundStyle,
    includeStamp,
    presetCategories,
    presetCategory,
    primarySigner,
    primarySignerRecord,
    renderCertificatePresetCanvas,
    renderTemplateBackgroundLayer,
    resolveCertificateElementValue,
    saveCertificateTemplate,
    scratchAccentColor,
    scratchBackgroundColor,
    scratchBackgroundType,
    scratchBorderCss,
    scratchBorderStyle,
    scratchBorderWidth,
    scratchCanvasBackground,
    scratchDesignPayload,
    secondarySigner,
    secondarySignerRecord,
    selectCertificateBlock,
    selectedBorderOption,
    selectedDesign,
    selectedElement,
    selectedElementId,
    setBuilderOpen,
    setBuilderStep,
    setCanvasOrientation,
    setDesignMode,
    setExpiryRule,
    setIncludeStamp,
    setPresetCategory,
    setPrimarySigner,
    setScratchAccentColor,
    setScratchBackgroundColor,
    setScratchBackgroundType,
    setScratchBorderStyle,
    setScratchBorderWidth,
    setSecondarySigner,
    setSelectedDesign,
    setSelectedElementId,
    setTemplateName,
    setTemplateType,
    stampAssets,
    templateName,
    templateType,
    updateCertificateElement,
    visibleCertificateElements,
  };

  if (builderOpen) {
    return <CertificationTemplateBuilderView ctx={builderContext} />;
  }

  return (
    <div className="p-6 space-y-5 max-w-[1200px]">
      <PageHeader
        title="Certification Management"
        sub="Templates, signatures, issued certificates, external providers, and renewals"
        actions={
          <button
            onClick={() => {
              setTemplateSaveNotice("");
              setBuilderStep(1);
              setBuilderOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-2 text-white rounded-lg text-sm font-semibold"
            style={{ background: P.olive }}
          >
            <Plus size={14} /> New Template
          </button>
        }
      />

      <CertificationStatsGrid templateCount={templateLibrary.length} />

      <div className="flex gap-0" style={{ borderBottom: `1px solid ${P.border}` }}>
        {[
          ["templates", "Templates & Signatures"],
          ["issued", "Issued Certificates"],
          ["providers", "External Providers"],
          ["renewals", "Renewals"],
        ].map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id as typeof tab)}
            className="px-5 py-3 text-xs font-semibold"
            style={
              tab === id
                ? { color: P.olive, borderBottom: `2px solid ${P.olive}` }
                : { color: P.textMuted }
            }
          >
            {label}
          </button>
        ))}
      </div>

      {templateSaveNotice && (
        <div
          className="flex items-center gap-2 rounded-xl border px-4 py-3 text-sm"
          style={{ background: P.lightSage, borderColor: P.border, color: P.darkOlive }}
        >
          <CheckCircle size={16} />
          <span className="font-semibold">{templateSaveNotice}</span>
        </div>
      )}

      {tab === "templates" && (
        <CertificationTemplatesTab
          templateDeleteId={templateDeleteId}
          templateLibrary={templateLibrary}
          onCancelDelete={() => setTemplateDeleteId(null)}
          onDelete={deleteCertificateTemplate}
          onEdit={(template) => {
            setTemplateName(template.name);
            setBuilderStep(2);
            setBuilderOpen(true);
          }}
          onManageSigners={(template) => {
            setTemplateName(template.name);
            setBuilderStep(3);
            setBuilderOpen(true);
          }}
          onRequestDelete={setTemplateDeleteId}
        />
      )}

      {tab === "issued" && <CertificationIssuedTab />}
      {tab === "providers" && <CertificationProvidersTab />}
      {tab === "renewals" && <CertificationRenewalsTab />}
    </div>
  );
}
