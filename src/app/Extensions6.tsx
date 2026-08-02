// Extensions6.tsx - compatibility exports for content workflow modules.
export {
  ATTEMPT_SCORING_POLICY_STORAGE_KEY,
  ATTEMPT_SCORING_POLICY_UPDATED_EVENT,
  CONTENT_TYPES,
  ContentWorkflowModal,
  DEFAULT_ATTEMPT_SCORING_POLICY,
  DEFAULT_QUESTION_TYPE_CONFIG,
  QuizOnlyModal,
  QuizPreviewModal,
  QuizRow,
  describeAttemptScoringPolicy,
  loadAttemptScoringPolicy,
  normalizeAttemptScoringPolicy,
  saveAttemptScoringPolicy,
} from "./screens/contentWorkflow";
export type {
  AttemptScoringMode,
  AttemptScoringPolicy,
  BuiltInQType,
  ContentAttachment,
  ContentType,
  QType,
  QuestionTypeConfig,
  QuizQuestion,
  QuizSettings,
  SavedContentItem,
  SavedQuiz,
} from "./screens/contentWorkflow";
