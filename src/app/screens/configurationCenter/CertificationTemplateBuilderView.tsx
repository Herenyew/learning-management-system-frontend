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
  type CertificateTextAlign,
} from "./certificateDesigner.shared";
import { CertificationBuilderDetailsStep } from "./certification/CertificationBuilderDetailsStep";
import { CertificationBuilderSignersStep } from "./certification/CertificationBuilderSignersStep";
import { CertificationBuilderStepper } from "./certification/CertificationBuilderStepper";
import { CertificationLivePreview } from "./certification/CertificationLivePreview";

type CertificateSigner = {
  id: string;
  name: string;
  title: string;
  dept: string;
  signature: string;
  auth: string;
  status: string;
};

type CertificateStampAsset = {
  id: string;
  name: string;
  owner: string;
  status: string;
};

export type CertificationBuilderViewContext = {
  activeDesign: CertificateDesignPreset;
  backendSigners: CertificateSigner[];
  builderStep: 1 | 2 | 3;
  canvasOrientation: CertificateCanvasOrientation;
  certificateDesigns: CertificateDesignPreset[];
  certificateElements: CertificateElement[];
  designMode: CertificateDesignMode;
  expiryRule: string;
  filteredCertificateDesigns: CertificateDesignPreset[];
  getTemplateBackgroundStyle: (
    design: CertificateDesignPreset,
    compact?: boolean,
  ) => React.CSSProperties;
  includeStamp: boolean;
  presetCategories: string[];
  presetCategory: string;
  primarySigner: string;
  primarySignerRecord: CertificateSigner;
  renderCertificatePresetCanvas: (
    design: CertificateDesignPreset,
    compact?: boolean,
  ) => React.ReactElement;
  renderTemplateBackgroundLayer: (
    design: CertificateDesignPreset,
    compact?: boolean,
  ) => React.ReactElement;
  resolveCertificateElementValue: (element: CertificateElement) => string;
  saveCertificateTemplate: () => void;
  scratchAccentColor: string;
  scratchBackgroundColor: string;
  scratchBackgroundType: CertificateBackgroundType;
  scratchBorderCss: string;
  scratchBorderStyle: CertificateBorderStyle;
  scratchBorderWidth: number;
  scratchCanvasBackground: string;
  scratchDesignPayload: { layers: unknown[] };
  secondarySigner: string;
  secondarySignerRecord: CertificateSigner;
  selectCertificateBlock: (type: CertificateElementType) => void;
  selectedBorderOption: (typeof CERT_BORDER_OPTIONS)[number];
  selectedDesign: string;
  selectedElement: CertificateElement;
  selectedElementId: string;
  setBuilderOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setBuilderStep: React.Dispatch<React.SetStateAction<1 | 2 | 3>>;
  setCanvasOrientation: React.Dispatch<React.SetStateAction<CertificateCanvasOrientation>>;
  setDesignMode: React.Dispatch<React.SetStateAction<CertificateDesignMode>>;
  setExpiryRule: React.Dispatch<React.SetStateAction<string>>;
  setIncludeStamp: React.Dispatch<React.SetStateAction<boolean>>;
  setPresetCategory: React.Dispatch<React.SetStateAction<string>>;
  setPrimarySigner: React.Dispatch<React.SetStateAction<string>>;
  setScratchAccentColor: React.Dispatch<React.SetStateAction<string>>;
  setScratchBackgroundColor: React.Dispatch<React.SetStateAction<string>>;
  setScratchBackgroundType: React.Dispatch<React.SetStateAction<CertificateBackgroundType>>;
  setScratchBorderStyle: React.Dispatch<React.SetStateAction<CertificateBorderStyle>>;
  setScratchBorderWidth: React.Dispatch<React.SetStateAction<number>>;
  setSecondarySigner: React.Dispatch<React.SetStateAction<string>>;
  setSelectedDesign: React.Dispatch<React.SetStateAction<string>>;
  setSelectedElementId: React.Dispatch<React.SetStateAction<string>>;
  setTemplateName: React.Dispatch<React.SetStateAction<string>>;
  setTemplateType: React.Dispatch<React.SetStateAction<string>>;
  stampAssets: CertificateStampAsset[];
  templateName: string;
  templateType: string;
  updateCertificateElement: (id: string, patch: Partial<CertificateElement>) => void;
  visibleCertificateElements: CertificateElement[];
};

export function CertificationTemplateBuilderView({
  ctx,
}: {
  ctx: CertificationBuilderViewContext;
}) {
  const {
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
  } = ctx;

  return (
    <div className="p-6 space-y-5 max-w-[1400px]">
      <PageHeader
        title="Certificate Template Builder"
        sub="Design the certificate, bind approved backend signers, and preview the issued document"
        actions={
          <>
            <button
              onClick={() => setBuilderOpen(false)}
              className="flex items-center gap-1.5 px-3 py-2 bg-white rounded-lg text-sm"
              style={{ border: `1px solid ${P.border}`, color: P.textMid }}
            >
              <ChevronLeft size={14} /> Back to Library
            </button>
            <button
              onClick={saveCertificateTemplate}
              className="flex items-center gap-1.5 px-3 py-2 text-white rounded-lg text-sm font-semibold"
              style={{ background: P.olive }}
            >
              <Check size={14} /> Save Template
            </button>
          </>
        }
      />

      <div className="grid xl:grid-cols-[420px_minmax(0,1fr)] gap-5 items-start">
        <div className="space-y-4">
          <CertificationBuilderStepper builderStep={builderStep} onStepChange={setBuilderStep} />

          {builderStep === 1 && <CertificationBuilderDetailsStep ctx={ctx} />}

          {builderStep === 2 && (
            <div
              className="bg-white rounded-xl border p-5 space-y-4"
              style={{ borderColor: P.border }}
            >
              <div>
                <p className="text-sm font-semibold" style={{ color: P.text }}>
                  Certificate Design
                </p>
                <p className="text-xs mt-1" style={{ color: P.textMuted }}>
                  Choose a full certificate background or build one from controlled blocks.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 p-1 rounded-lg" style={{ background: P.bg }}>
                {(
                  [
                    ["preset", "Template background", LayoutDashboard],
                    ["scratch", "Design from scratch", MousePointer2],
                  ] as [CertificateDesignMode, string, React.ElementType][]
                ).map(([mode, label, Icon]) => (
                  <button
                    key={mode}
                    onClick={() => setDesignMode(mode)}
                    className="flex items-center justify-center gap-2 px-3 py-2 rounded-md text-xs font-semibold"
                    style={{
                      background: designMode === mode ? "white" : "transparent",
                      color: designMode === mode ? P.olive : P.textMuted,
                      boxShadow: designMode === mode ? "0 1px 3px rgba(46,58,21,0.12)" : "none",
                    }}
                  >
                    <Icon size={14} />
                    {label}
                  </button>
                ))}
              </div>

              {designMode === "preset" ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-bold uppercase" style={{ color: P.textMuted }}>
                      Template Gallery
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {presetCategories.map((category) => (
                        <button
                          key={category}
                          onClick={() => setPresetCategory(category)}
                          className="px-2.5 py-1 rounded-full text-[10px] font-semibold"
                          style={{
                            background: presetCategory === category ? P.olive : P.bg,
                            border: `1px solid ${presetCategory === category ? P.olive : P.border}`,
                            color: presetCategory === category ? "white" : P.textMid,
                          }}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {filteredCertificateDesigns.map((design) => (
                      <button
                        key={design.id}
                        onClick={() => {
                          setSelectedDesign(design.id);
                          setTemplateName(design.name);
                          setTemplateType(
                            design.category === "Compliance"
                              ? "Compliance attestation"
                              : design.category === "Participation"
                                ? "External certification"
                                : "Program completion",
                          );
                        }}
                        className="rounded-xl text-left overflow-hidden"
                        style={{
                          background: selectedDesign === design.id ? P.lightSage : "white",
                          border: `1px solid ${
                            selectedDesign === design.id ? design.accent : P.border
                          }`,
                          boxShadow:
                            selectedDesign === design.id
                              ? "0 8px 20px rgba(46,58,21,0.12)"
                              : "none",
                        }}
                      >
                        <div className="p-2">
                          <div
                            className="relative overflow-hidden"
                            style={getTemplateBackgroundStyle(design, true)}
                          >
                            {renderTemplateBackgroundLayer(design, true)}
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                              <div
                                className="h-2 w-20 rounded-full opacity-60"
                                style={{ background: design.accent }}
                              />
                              <div
                                className="mt-2 h-1.5 w-28 rounded-full opacity-30"
                                style={{ background: P.textMuted }}
                              />
                              <div
                                className="mt-1 h-1.5 w-20 rounded-full opacity-20"
                                style={{ background: P.textMuted }}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="px-3 pb-3">
                          <div className="flex items-center justify-between gap-2">
                            <p
                              className="text-xs font-semibold leading-tight"
                              style={{ color: P.text }}
                            >
                              {design.name}
                            </p>
                            {selectedDesign === design.id && (
                              <CheckCircle size={13} style={{ color: design.accent }} />
                            )}
                          </div>
                          <p
                            className="text-[10px] mt-1 leading-relaxed"
                            style={{ color: P.textMuted }}
                          >
                            {design.desc}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Palette size={14} style={{ color: P.olive }} />
                      <p className="text-xs font-bold uppercase" style={{ color: P.textMuted }}>
                        Canvas
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {(
                        [
                          ["landscape", "Landscape"],
                          ["portrait", "Portrait"],
                        ] as [CertificateCanvasOrientation, string][]
                      ).map(([orientation, label]) => (
                        <button
                          key={orientation}
                          onClick={() => setCanvasOrientation(orientation)}
                          className="px-3 py-2 rounded-lg text-xs font-semibold"
                          style={{
                            background: canvasOrientation === orientation ? P.lightSage : "white",
                            border: `1px solid ${
                              canvasOrientation === orientation ? P.olive : P.border
                            }`,
                            color: canvasOrientation === orientation ? P.olive : P.textMid,
                          }}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {(
                        [
                          ["solid", "Solid"],
                          ["gradient", "Gradient"],
                          ["image", "Image area"],
                          ["template", "Template"],
                        ] as [CertificateBackgroundType, string][]
                      ).map(([type, label]) => (
                        <button
                          key={type}
                          onClick={() => {
                            setScratchBackgroundType(type);
                            if (type === "template") setCanvasOrientation("landscape");
                          }}
                          className="px-2 py-2 rounded-lg text-[11px] font-semibold"
                          style={{
                            background: scratchBackgroundType === type ? P.lightSage : "white",
                            border: `1px solid ${
                              scratchBackgroundType === type ? P.olive : P.border
                            }`,
                            color: scratchBackgroundType === type ? P.olive : P.textMid,
                          }}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                    {scratchBackgroundType === "template" ? (
                      <div className="space-y-3">
                        <div>
                          <p className="text-[10px] font-semibold" style={{ color: P.textMid }}>
                            Template background
                          </p>
                          <p className="text-[10px] mt-1" style={{ color: P.textMuted }}>
                            Artwork stays locked as the background. Editable fields remain as
                            separate layers above it.
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {certificateDesigns.map((design) => (
                            <button
                              key={design.id}
                              onClick={() => {
                                setSelectedDesign(design.id);
                                setScratchAccentColor(design.accent);
                              }}
                              className="rounded-lg overflow-hidden p-1"
                              style={{
                                background: selectedDesign === design.id ? P.lightSage : "white",
                                border: `1px solid ${
                                  selectedDesign === design.id ? design.accent : P.border
                                }`,
                              }}
                            >
                              <div
                                className="relative overflow-hidden"
                                style={getTemplateBackgroundStyle(design, true)}
                              >
                                {renderTemplateBackgroundLayer(design, true)}
                              </div>
                              <p
                                className="text-[10px] font-semibold mt-1 truncate"
                                style={{ color: P.text }}
                              >
                                {design.name}
                              </p>
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3">
                        <label className="space-y-1">
                          <span className="text-[10px] font-semibold" style={{ color: P.textMid }}>
                            Background
                          </span>
                          <input
                            type="color"
                            value={scratchBackgroundColor}
                            onChange={(e) => setScratchBackgroundColor(e.target.value)}
                            className="h-10 w-full rounded-lg"
                            style={{ border: `1px solid ${P.border}` }}
                          />
                        </label>
                        <label className="space-y-1">
                          <span className="text-[10px] font-semibold" style={{ color: P.textMid }}>
                            Accent
                          </span>
                          <input
                            type="color"
                            value={scratchAccentColor}
                            onChange={(e) => setScratchAccentColor(e.target.value)}
                            className="h-10 w-full rounded-lg"
                            style={{ border: `1px solid ${P.border}` }}
                          />
                        </label>
                      </div>
                    )}
                    {scratchBackgroundType === "template" ? (
                      <div
                        className="p-3 rounded-lg text-[10px] leading-relaxed"
                        style={{ background: P.paleGreen, color: P.textMid }}
                      >
                        Border, ribbons, geometric panels, and seal artwork come from the chosen
                        template background. Use the layer stack below to position names, courses,
                        signers, stamp, and QR code.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-[10px] font-semibold" style={{ color: P.textMid }}>
                            Border type
                          </span>
                          <label className="flex items-center gap-2">
                            <span
                              className="text-[10px] font-semibold"
                              style={{ color: P.textMid }}
                            >
                              Width
                            </span>
                            <input
                              type="number"
                              min={0}
                              max={18}
                              value={scratchBorderWidth}
                              onChange={(e) => setScratchBorderWidth(Number(e.target.value))}
                              className="w-20 px-2 py-1.5 text-xs rounded-lg bg-white"
                              style={{ border: `1px solid ${P.border}`, color: P.text }}
                            />
                          </label>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {CERT_BORDER_OPTIONS.map((option) => (
                            <button
                              key={option.id}
                              onClick={() => setScratchBorderStyle(option.id)}
                              className="p-2 rounded-lg text-left"
                              style={{
                                background:
                                  scratchBorderStyle === option.id ? P.lightSage : "white",
                                border: `1px solid ${
                                  scratchBorderStyle === option.id ? P.olive : P.border
                                }`,
                              }}
                            >
                              <div
                                className="h-10 rounded-md mb-2 relative overflow-hidden"
                                style={{
                                  background:
                                    option.id === "banded"
                                      ? `linear-gradient(to bottom, ${scratchAccentColor} 0 20%, white 20% 80%, ${scratchAccentColor} 80% 100%)`
                                      : "white",
                                  border:
                                    option.id === "none"
                                      ? "1px solid transparent"
                                      : `3px ${option.line === "none" ? "solid" : option.line} ${scratchAccentColor}`,
                                }}
                              >
                                {option.id === "corner" && (
                                  <>
                                    <span
                                      className="absolute left-1 top-1 w-3 h-3"
                                      style={{
                                        borderLeft: `2px solid ${scratchAccentColor}`,
                                        borderTop: `2px solid ${scratchAccentColor}`,
                                      }}
                                    />
                                    <span
                                      className="absolute right-1 bottom-1 w-3 h-3"
                                      style={{
                                        borderRight: `2px solid ${scratchAccentColor}`,
                                        borderBottom: `2px solid ${scratchAccentColor}`,
                                      }}
                                    />
                                  </>
                                )}
                                {option.id === "inset" && (
                                  <span
                                    className="absolute inset-2 rounded-sm"
                                    style={{ border: `1px solid ${scratchAccentColor}` }}
                                  />
                                )}
                              </div>
                              <p className="text-[11px] font-bold" style={{ color: P.text }}>
                                {option.label}
                              </p>
                              <p className="text-[9px]" style={{ color: P.textMuted }}>
                                {option.desc}
                              </p>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <PlusCircle size={14} style={{ color: P.olive }} />
                      <p className="text-xs font-bold uppercase" style={{ color: P.textMuted }}>
                        Block Library
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {CERT_DESIGN_BLOCK_LIBRARY.map(({ type, label, icon: Icon }) => (
                        <button
                          key={type}
                          onClick={() => selectCertificateBlock(type)}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-left text-xs font-semibold"
                          style={{
                            background: selectedElement?.type === type ? P.lightSage : P.paleGreen,
                            border: `1px solid ${
                              selectedElement?.type === type ? P.olive : P.border
                            }`,
                            color: selectedElement?.type === type ? P.olive : P.textMid,
                          }}
                        >
                          <Icon size={14} />
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Layers size={14} style={{ color: P.olive }} />
                      <p className="text-xs font-bold uppercase" style={{ color: P.textMuted }}>
                        Layer Stack
                      </p>
                    </div>
                    <div className="space-y-2">
                      {certificateElements.map((element, index) => (
                        <div
                          key={element.id}
                          className="flex items-center gap-2 rounded-lg px-2 py-2"
                          style={{
                            background: selectedElementId === element.id ? P.lightSage : P.bg,
                            border: `1px solid ${
                              selectedElementId === element.id ? P.olive : P.border
                            }`,
                          }}
                        >
                          <button
                            onClick={() => setSelectedElementId(element.id)}
                            className="flex-1 flex items-center gap-2 text-left min-w-0"
                          >
                            <Move size={13} style={{ color: P.textMuted }} />
                            <span className="text-[10px] font-bold" style={{ color: P.textMuted }}>
                              {index + 1}
                            </span>
                            <span
                              className="text-xs font-semibold truncate"
                              style={{ color: P.text }}
                            >
                              {element.label}
                            </span>
                          </button>
                          <input
                            type="checkbox"
                            checked={element.visible}
                            disabled={element.locked}
                            onChange={(e) =>
                              updateCertificateElement(element.id, {
                                visible: e.target.checked,
                              })
                            }
                            style={{ accentColor: P.olive, width: 15, height: 15 }}
                            title={element.locked ? "Required backend field" : "Show layer"}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {selectedElement && (
                    <div
                      className="space-y-3 p-3 rounded-xl"
                      style={{ background: P.bg, border: `1px solid ${P.border}` }}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-xs font-bold" style={{ color: P.text }}>
                          {selectedElement.label}
                        </p>
                        {selectedElement.locked && <Chip label="Required" variant="gold" />}
                      </div>
                      <label className="space-y-1 block">
                        <span className="text-[10px] font-semibold" style={{ color: P.textMid }}>
                          Block text or token
                        </span>
                        <input
                          value={selectedElement.value}
                          disabled={selectedElement.locked}
                          onChange={(e) =>
                            updateCertificateElement(selectedElement.id, {
                              value: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 text-xs rounded-lg bg-white"
                          style={{ border: `1px solid ${P.border}`, color: P.text }}
                        />
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {(
                          [
                            ["X", "x", 0, 95],
                            ["Y", "y", 0, 95],
                            ["W", "w", 5, 100],
                            ["H", "h", 4, 60],
                          ] as [string, "x" | "y" | "w" | "h", number, number][]
                        ).map(([label, key, min, max]) => (
                          <label key={key} className="space-y-1">
                            <span
                              className="text-[10px] font-semibold"
                              style={{ color: P.textMid }}
                            >
                              {label}
                            </span>
                            <input
                              type="number"
                              min={min}
                              max={max}
                              value={selectedElement[key]}
                              onChange={(e) =>
                                updateCertificateElement(selectedElement.id, {
                                  [key]: Number(e.target.value),
                                } as Partial<CertificateElement>)
                              }
                              className="w-full px-2 py-2 text-xs rounded-lg bg-white"
                              style={{ border: `1px solid ${P.border}`, color: P.text }}
                            />
                          </label>
                        ))}
                      </div>
                      <div className="grid grid-cols-[1fr_92px] gap-3">
                        <label className="space-y-1">
                          <span className="text-[10px] font-semibold" style={{ color: P.textMid }}>
                            Font size
                          </span>
                          <input
                            type="range"
                            min={8}
                            max={42}
                            value={selectedElement.fontSize}
                            onChange={(e) =>
                              updateCertificateElement(selectedElement.id, {
                                fontSize: Number(e.target.value),
                              })
                            }
                            className="w-full"
                            style={{ accentColor: P.olive }}
                          />
                        </label>
                        <label className="space-y-1">
                          <span className="text-[10px] font-semibold" style={{ color: P.textMid }}>
                            Color
                          </span>
                          <input
                            type="color"
                            value={selectedElement.color}
                            onChange={(e) =>
                              updateCertificateElement(selectedElement.id, {
                                color: e.target.value,
                              })
                            }
                            className="h-9 w-full rounded-lg"
                            style={{ border: `1px solid ${P.border}` }}
                          />
                        </label>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {(
                          [
                            ["left", AlignLeft],
                            ["center", AlignCenter],
                            ["right", AlignRight],
                          ] as [CertificateTextAlign, React.ElementType][]
                        ).map(([align, Icon]) => (
                          <button
                            key={align}
                            onClick={() => updateCertificateElement(selectedElement.id, { align })}
                            className="flex items-center justify-center py-2 rounded-lg"
                            style={{
                              background: selectedElement.align === align ? P.lightSage : "white",
                              border: `1px solid ${
                                selectedElement.align === align ? P.olive : P.border
                              }`,
                              color: selectedElement.align === align ? P.olive : P.textMuted,
                            }}
                          >
                            <Icon size={14} />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <p className="text-xs font-bold uppercase" style={{ color: P.textMuted }}>
                      Backend dynamic fields
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {CERT_DYNAMIC_FIELDS.map((field) => (
                        <span
                          key={field}
                          className="px-2 py-1 rounded-md text-[10px] font-mono"
                          style={{ background: P.paleGreen, color: P.textMid }}
                        >
                          {field}
                        </span>
                      ))}
                    </div>
                    <p className="text-[10px] leading-relaxed" style={{ color: P.textMuted }}>
                      Saved as structured JSON with {scratchDesignPayload.layers.length} layers, not
                      a freehand canvas, so rendering stays consistent in PDF exports.
                    </p>
                  </div>
                </div>
              )}

              <label
                className="flex items-center justify-between p-3 rounded-lg cursor-pointer"
                style={{ background: P.bg, border: `1px solid ${P.border}` }}
              >
                <span className="text-xs font-semibold" style={{ color: P.textMid }}>
                  Include approved official stamp
                </span>
                <input
                  type="checkbox"
                  checked={includeStamp}
                  onChange={(e) => setIncludeStamp(e.target.checked)}
                  style={{ accentColor: P.olive, width: 16, height: 16 }}
                />
              </label>
            </div>
          )}

          {builderStep === 3 && <CertificationBuilderSignersStep ctx={ctx} />}
        </div>

        <CertificationLivePreview ctx={ctx} />
      </div>
    </div>
  );
}
