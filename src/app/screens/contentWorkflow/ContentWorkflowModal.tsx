import React, { useState } from "react";
import { AssignmentWorkflow } from "./AssignmentWorkflow";
import { AudioWorkflow } from "./AudioWorkflow";
import { DocumentWorkflow } from "./DocumentWorkflow";
import { ExternalLinkWorkflow } from "./ExternalLinkWorkflow";
import { InteractiveVideoWorkflow } from "./InteractiveVideoWorkflow";
import { LiveSessionWorkflow } from "./LiveSessionWorkflow";
import { QuizWorkflow } from "./QuizWorkflow";
import { ScormWorkflow } from "./ScormWorkflow";
import { SurveyWorkflow } from "./SurveyWorkflow";
import { VideoWorkflow } from "./VideoWorkflow";
import { CONTENT_TYPES, ModalHeader, P, SourceStep } from "./contentWorkflow.shared";
import type {
  ContentAttachment,
  ContentType,
  ContentWorkflowSavePayload as SharedContentWorkflowSavePayload,
} from "./contentWorkflow.shared";
import type { QuestionTypeConfig, SavedQuiz } from "./QuizWorkflow";

export interface SavedContentItem {
  type: ContentType;
  title: string;
  meta: string;
  duration?: string;
  description?: string;
  source?: "upload" | "gdrive" | "manual" | "external";
  primaryFile?: string;
  attachments?: ContentAttachment[];
  quizData?: SavedQuiz;
}

type ContentWorkflowSavePayload = Partial<SavedContentItem>;
type ContentWorkflowSaveInput = SavedQuiz | ContentWorkflowSavePayload;

const isSavedQuizPayload = (payload: ContentWorkflowSaveInput | undefined): payload is SavedQuiz =>
  !!payload &&
  typeof payload === "object" &&
  "questionCount" in payload &&
  "passScore" in payload &&
  "questions" in payload;

const sourceLabelFor = (source: "upload" | "gdrive") =>
  source === "upload" ? "Device upload" : "Google Drive";

const resourceToAttachment = (resource: string): ContentAttachment => ({
  name: resource,
  source: /^https?:\/\//i.test(resource) ? "External link" : "Resource",
  detail: /^https?:\/\//i.test(resource) ? "Reference URL" : "Attached resource",
});

export function ContentWorkflowModal({
  onClose,
  onSaveItem,
  allowedTypes,
  questionTypeConfig,
}: {
  onClose: () => void;
  onSaveItem?: (item: SavedContentItem) => void;
  allowedTypes?: ContentType[];
  questionTypeConfig?: QuestionTypeConfig[];
}) {
  const [activeType, setActiveType] = useState<ContentType | null>(null);
  const [source, setSource] = useState<"upload" | "gdrive" | null>(null);
  const availableContentTypes = allowedTypes
    ? CONTENT_TYPES.filter((type) => allowedTypes.includes(type.label))
    : CONTENT_TYPES;

  // Types that skip the source step
  const noSourceTypes: ContentType[] = [
    "Quiz",
    "Survey",
    "Live Session",
    "External Link",
    "Assignment",
  ];

  const handleTypeSelect = (type: ContentType) => {
    setActiveType(type);
    setSource(null);
    if (noSourceTypes.includes(type)) setSource("upload");
  };

  const handleSourceSelect = (src: "upload" | "gdrive") => setSource(src);

  const handleSave = (payload?: ContentWorkflowSaveInput) => {
    if (onSaveItem && activeType) {
      if (activeType === "Quiz" && isSavedQuizPayload(payload)) {
        onSaveItem({
          type: "Quiz",
          title: payload.name,
          meta: `${payload.questionCount} Questions · Pass: ${payload.passScore}%`,
          duration: `${payload.questionCount} questions`,
          quizData: payload,
        });
      } else {
        const itemPayload = isSavedQuizPayload(payload) ? {} : (payload ?? {});
        onSaveItem({
          ...itemPayload,
          type: activeType,
          title: itemPayload.title?.trim() || activeType,
          meta: itemPayload.meta ?? "",
        });
      }
    }
    onClose();
  };
  const handleWorkflowSave = (payload: SharedContentWorkflowSavePayload) => {
    handleSave(payload as ContentWorkflowSavePayload);
  };

  const handleBack = () => {
    if (source && !noSourceTypes.includes(activeType!)) {
      setSource(null);
      return;
    }
    setActiveType(null);
    setSource(null);
  };

  const typeMeta = CONTENT_TYPES.find((t) => t.label === activeType);

  // ── Type picker ────────────────────────────────────────────
  if (!activeType) {
    return (
      <div
        className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl modal-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <ModalHeader title="Add Content Item" onClose={onClose} />
        {availableContentTypes.length ? (
          <div className="grid grid-cols-2 gap-2">
            {availableContentTypes.map(({ icon: Icon, label, color, desc }) => (
              <button
                key={label}
                onClick={() => handleTypeSelect(label)}
                className="flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all group"
                style={{ borderColor: P.border }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = color;
                  (e.currentTarget as HTMLButtonElement).style.background = `${color}08`;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = P.border;
                  (e.currentTarget as HTMLButtonElement).style.background = "white";
                }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110"
                  style={{ background: `${color}15` }}
                >
                  <Icon size={17} style={{ color }} />
                </div>
                <div>
                  <p className="text-xs font-semibold" style={{ color: P.text }}>
                    {label}
                  </p>
                  <p className="text-[9px] leading-tight mt-0.5" style={{ color: P.textMuted }}>
                    {desc}
                  </p>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div
            className="rounded-xl border p-4 text-sm"
            style={{ borderColor: P.border, background: P.bg, color: P.textMuted }}
          >
            No content types are currently enabled for course creators.
          </div>
        )}
      </div>
    );
  }

  // ── Source step ────────────────────────────────────────────
  if (!source && typeMeta && !noSourceTypes.includes(activeType)) {
    return (
      <div onClick={(e) => e.stopPropagation()}>
        <SourceStep typeMeta={typeMeta} onSelect={handleSourceSelect} onClose={onClose} />
      </div>
    );
  }

  // ── Type-specific workflows ────────────────────────────────
  const src = source!;
  if (activeType === "Video")
    return <VideoWorkflow source={src} onClose={handleBack} onSave={handleWorkflowSave} />;
  if (activeType === "Document")
    return <DocumentWorkflow source={src} onClose={handleBack} onSave={handleWorkflowSave} />;
  if (activeType === "Audio")
    return <AudioWorkflow source={src} onClose={handleBack} onSave={handleWorkflowSave} />;
  if (activeType === "SCORM / xAPI")
    return <ScormWorkflow source={src} onClose={handleBack} onSave={handleWorkflowSave} />;
  if (activeType === "Interactive Video")
    return (
      <InteractiveVideoWorkflow source={src} onClose={handleBack} onSave={handleWorkflowSave} />
    );
  if (activeType === "Assignment")
    return <AssignmentWorkflow onClose={handleBack} onSave={() => handleSave()} />;
  if (activeType === "Survey")
    return <SurveyWorkflow onClose={handleBack} onSave={() => handleSave()} />;
  if (activeType === "Live Session")
    return <LiveSessionWorkflow onClose={handleBack} onSave={() => handleSave()} />;
  if (activeType === "External Link")
    return <ExternalLinkWorkflow onClose={handleBack} onSave={handleWorkflowSave} />;
  if (activeType === "Quiz")
    return (
      <QuizWorkflow
        onClose={handleBack}
        onSave={(quiz) => handleSave(quiz)}
        questionTypeConfig={questionTypeConfig}
      />
    );

  return null;
}

// ─── QuizRow — clickable module list row for a saved quiz ─────
