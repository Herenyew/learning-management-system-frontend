import { CheckCircle, HelpCircle, Lock, Plus, X } from "lucide-react";

import type { CourseAssessmentPolicy, CourseAssessmentQuestion } from "./configuration.shared";
import { P } from "./configuration.shared";
import type { MyCoursesBuilderViewContext } from "./MyCoursesDashboard.types";

const QUESTION_TYPES: CourseAssessmentQuestion["type"][] = [
  "Scale (1–5)",
  "Scale (1–10)",
  "Yes / No",
  "Multiple choice",
  "Open text",
];

const POLICY_OPTIONS: Array<{
  id: CourseAssessmentPolicy;
  label: string;
  description: string;
  icon: typeof CheckCircle;
}> = [
  {
    id: "disabled",
    label: "Disabled",
    description: "This assessment is not included in the course.",
    icon: CheckCircle,
  },
  {
    id: "optional",
    label: "Optional",
    description: "Learners may skip the assessment.",
    icon: HelpCircle,
  },
  {
    id: "mandatory",
    label: "Mandatory",
    description: "The creator must define the questions for this course.",
    icon: Lock,
  },
];

function AssessmentSection({
  title,
  description,
  policy,
  questions,
  onPolicyChange,
  onQuestionsChange,
}: {
  title: string;
  description: string;
  policy: CourseAssessmentPolicy;
  questions: CourseAssessmentQuestion[];
  onPolicyChange: (policy: CourseAssessmentPolicy) => void;
  onQuestionsChange: (questions: CourseAssessmentQuestion[]) => void;
}) {
  const addQuestion = () => {
    onQuestionsChange([
      ...questions,
      {
        id: `assessment-question-${Date.now()}-${questions.length}`,
        text: "",
        type: "Scale (1–5)",
        required: true,
      },
    ]);
  };

  const updateQuestion = (id: string, patch: Partial<CourseAssessmentQuestion>) => {
    onQuestionsChange(
      questions.map((question) => (question.id === id ? { ...question, ...patch } : question)),
    );
  };

  return (
    <section
      className="space-y-4 rounded-2xl border bg-white p-5"
      style={{ borderColor: P.border }}
    >
      <div>
        <h3 className="text-sm font-bold" style={{ color: P.text }}>
          {title}
        </h3>
        <p className="mt-1 text-[11px]" style={{ color: P.textMuted }}>
          {description}
        </p>
      </div>

      <div className="grid gap-2 sm:grid-cols-3">
        {POLICY_OPTIONS.map(({ id, label, description: optionDescription, icon: Icon }) => {
          const selected = policy === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onPolicyChange(id)}
              className="rounded-xl border-2 p-3 text-left transition-all"
              style={{
                borderColor: selected ? P.darkOlive : P.border,
                background: selected ? P.lightSage : P.bg,
              }}
              aria-pressed={selected}
            >
              <div className="mb-2 flex items-center gap-2">
                <span
                  className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg"
                  style={{
                    background: selected ? P.darkOlive : "white",
                    color: selected ? "white" : P.olive,
                  }}
                >
                  <Icon size={13} />
                </span>
                <span className="text-xs font-bold" style={{ color: P.text }}>
                  {label}
                </span>
              </div>
              <p className="text-[10px] leading-relaxed" style={{ color: P.textMuted }}>
                {optionDescription}
              </p>
            </button>
          );
        })}
      </div>

      {policy === "mandatory" && (
        <div className="space-y-3 border-t pt-4" style={{ borderColor: P.border }}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold" style={{ color: P.text }}>
                Assessment Questions <span className="text-red-500">*</span>
              </p>
              <p className="mt-0.5 text-[10px]" style={{ color: P.textMuted }}>
                At least one completed question is required before the course can be saved.
              </p>
            </div>
            <button
              type="button"
              onClick={addQuestion}
              className="flex flex-shrink-0 items-center gap-1 text-xs font-semibold"
              style={{ color: P.olive }}
            >
              <Plus size={13} /> Add Question
            </button>
          </div>

          {questions.map((question, index) => (
            <div
              key={question.id}
              className="grid gap-2 rounded-xl border p-3 sm:grid-cols-[24px_minmax(0,1fr)_150px_auto_auto] sm:items-center"
              style={{ borderColor: P.border, background: P.bg }}
            >
              <span className="text-center text-[10px] font-bold" style={{ color: P.textMuted }}>
                {index + 1}
              </span>
              <input
                value={question.text}
                onChange={(event) => updateQuestion(question.id, { text: event.target.value })}
                placeholder="Enter the assessment question..."
                className="min-w-0 rounded-lg border bg-white px-3 py-2 text-xs outline-none"
                style={{ borderColor: P.border, color: P.text }}
                aria-label={`${title} question ${index + 1}`}
              />
              <select
                value={question.type}
                onChange={(event) =>
                  updateQuestion(question.id, {
                    type: event.target.value as CourseAssessmentQuestion["type"],
                  })
                }
                className="rounded-lg border bg-white px-3 py-2 text-xs outline-none"
                style={{ borderColor: P.border, color: P.text }}
                aria-label={`${title} question ${index + 1} type`}
              >
                {QUESTION_TYPES.map((type) => (
                  <option key={type}>{type}</option>
                ))}
              </select>
              <label className="flex items-center gap-1 text-[10px]" style={{ color: P.textMuted }}>
                <input
                  type="checkbox"
                  checked={question.required}
                  onChange={(event) =>
                    updateQuestion(question.id, { required: event.target.checked })
                  }
                  style={{ accentColor: P.olive }}
                />
                Required
              </label>
              <button
                type="button"
                onClick={() =>
                  onQuestionsChange(
                    questions.filter((currentQuestion) => currentQuestion.id !== question.id),
                  )
                }
                className="p-1"
                style={{ color: "#C0392B" }}
                aria-label={`Delete ${title.toLowerCase()} question ${index + 1}`}
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export function MyCoursesAssessmentsPanel({ ctx }: { ctx: MyCoursesBuilderViewContext }) {
  const { builderPanel, courseDetails, updateActiveCourseDraft } = ctx;

  if (builderPanel !== "assessments") return null;

  const updatePolicy = (
    policyKey: "preCourseAssessment" | "postCourseAssessment",
    questionKey: "preCourseAssessmentQuestions" | "postCourseAssessmentQuestions",
    policy: CourseAssessmentPolicy,
  ) => {
    updateActiveCourseDraft((draft) => ({
      ...draft,
      [policyKey]: policy,
      [questionKey]:
        policy === "mandatory"
          ? draft[questionKey].length
            ? draft[questionKey]
            : [
                {
                  id: `${questionKey}-${Date.now()}`,
                  text: "",
                  type: "Scale (1–5)",
                  required: true,
                },
              ]
          : [],
    }));
  };

  return (
    <div className="max-w-4xl space-y-5">
      <div>
        <h2
          className="text-base font-bold"
          style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", color: P.text }}
        >
          Course Assessments
        </h2>
        <p className="mt-1 text-xs" style={{ color: P.textMuted }}>
          Questions are configured here only when an assessment is mandatory for this course.
        </p>
      </div>

      <AssessmentSection
        title="Pre-Course Assessment"
        description="Runs before enrollment to establish the learner’s baseline knowledge."
        policy={courseDetails.preCourseAssessment}
        questions={courseDetails.preCourseAssessmentQuestions}
        onPolicyChange={(policy) =>
          updatePolicy("preCourseAssessment", "preCourseAssessmentQuestions", policy)
        }
        onQuestionsChange={(questions) =>
          updateActiveCourseDraft((draft) => ({
            ...draft,
            preCourseAssessmentQuestions: questions,
          }))
        }
      />

      <AssessmentSection
        title="Post-Course Assessment"
        description="Runs after course content to confirm learning before completion."
        policy={courseDetails.postCourseAssessment}
        questions={courseDetails.postCourseAssessmentQuestions}
        onPolicyChange={(policy) =>
          updatePolicy("postCourseAssessment", "postCourseAssessmentQuestions", policy)
        }
        onQuestionsChange={(questions) =>
          updateActiveCourseDraft((draft) => ({
            ...draft,
            postCourseAssessmentQuestions: questions,
          }))
        }
      />
    </div>
  );
}
