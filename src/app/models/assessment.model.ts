export type AssessmentQuestionType =
  | "multiple_choice"
  | "true_false"
  | "multi_select"
  | "fill_blank"
  | "matching"
  | "drag_drop"
  | "short_answer"
  | "essay";

export type AssessmentQuestion = {
  questionId: number;
  questionVersionId: number;
  type: AssessmentQuestionType;
  questionText: string;
  weight: number;
  isRequired: boolean;
  options: Array<{ id: number; optionLabel: string | null; optionText: string }>;
  blankIndexes: number[];
  leftItems: Array<{ id: number; value: string }>;
  rightItems: Array<{ id: number; value: string }>;
};

export type AssessmentAnswerInput =
  | { optionIds: number[] }
  | { blanks: Array<{ blankIndex: number; typedText: string }> }
  | { matches: Array<{ leftPairId: number; rightPairId: number }> }
  | { answerText: string };

export type AssessmentAttempt = {
  id: number;
  assessmentId: number;
  enrollmentId: number;
  attemptNo: number;
  status: "IN_PROGRESS" | "SUBMITTED" | "GRADED" | "EXPIRED";
  startedAt: string;
  submittedAt: string | null;
  gradedAt: string | null;
  durationMinutes: number | null;
  title: string;
  totalMarks: number;
  passingScore: number;
  questions: AssessmentQuestion[];
  answers: Array<AssessmentAnswerInput & { id: number; questionVersionId: number; reviewStatus: string }>;
};

export type AssessmentAttemptResult = {
  attemptId: number;
  assessmentId: number;
  enrollmentId: number;
  attemptNo: number;
  status: "SUBMITTED" | "GRADED" | "EXPIRED";
  submittedAt: string | null;
  gradedAt: string | null;
  pendingReview: boolean;
  score: number | null;
  totalMarks: number;
  percentage: number | null;
  passed: boolean | null;
};
