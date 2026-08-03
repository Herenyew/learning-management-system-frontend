import React, { useState } from "react";
import { Plus, X } from "lucide-react";
import { CfgField, CfgSection, P, SaveBar } from "./configuration.shared";

type AssessmentQuestion = {
  id: string;
  text: string;
  type: string;
  required: boolean;
};

type KirkpatrickLevel = {
  id: string;
  level: string;
  name: string;
  trigger: string;
  weight: number;
};

type CalculationRule = {
  id: string;
  label: string;
  weight: number;
};

const QUESTION_TYPES = ["Scale (1–5)", "Scale (1–10)", "Yes / No", "MCQ", "Open text"];

function QuestionBuilder({
  questions,
  setQuestions,
  addLabel,
  placeholder = "Question text...",
  types = QUESTION_TYPES,
}: {
  questions: AssessmentQuestion[];
  setQuestions: React.Dispatch<React.SetStateAction<AssessmentQuestion[]>>;
  addLabel: string;
  placeholder?: string;
  types?: string[];
}) {
  const addQuestion = () => {
    setQuestions((current) => [
      ...current,
      {
        id: `question-${Date.now()}`,
        text: "",
        type: types[0],
        required: false,
      },
    ]);
  };

  const updateQuestion = (id: string, patch: Partial<AssessmentQuestion>) => {
    setQuestions((current) =>
      current.map((question) => (question.id === id ? { ...question, ...patch } : question)),
    );
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-end">
        <button
          onClick={addQuestion}
          className="flex items-center gap-1 text-xs font-semibold"
          style={{ color: P.olive }}
        >
          <Plus size={12} /> {addLabel}
        </button>
      </div>

      {questions.map((question, index) => (
        <div
          key={question.id}
          className="flex flex-col gap-2 rounded-xl border bg-white p-3 sm:flex-row sm:items-center"
          style={{ borderColor: P.border }}
        >
          <span
            className="w-5 flex-shrink-0 text-center text-[10px] font-bold"
            style={{ color: P.textMuted }}
          >
            {index + 1}
          </span>
          <input
            value={question.text}
            onChange={(event) => updateQuestion(question.id, { text: event.target.value })}
            placeholder={placeholder}
            className="min-w-0 flex-1 rounded-lg border bg-white px-3 py-2 text-xs outline-none"
            style={{ borderColor: P.border, color: P.text }}
          />
          <select
            value={question.type}
            onChange={(event) => updateQuestion(question.id, { type: event.target.value })}
            className="rounded-lg border bg-white px-3 py-2 text-xs outline-none"
            style={{ borderColor: P.border, color: P.text }}
          >
            {types.map((type) => (
              <option key={type}>{type}</option>
            ))}
          </select>
          <label
            className="flex flex-shrink-0 items-center gap-1 text-[10px]"
            style={{ color: P.textMuted }}
          >
            <input
              type="checkbox"
              checked={question.required}
              onChange={(event) => updateQuestion(question.id, { required: event.target.checked })}
              style={{ accentColor: P.olive }}
            />
            Required
          </label>
          <button
            onClick={() =>
              setQuestions((current) =>
                current.filter((currentQuestion) => currentQuestion.id !== question.id),
              )
            }
            className="self-end p-1 sm:self-auto"
            style={{ color: "#C0392B" }}
            aria-label={`Delete question ${index + 1}`}
          >
            <X size={13} />
          </button>
        </div>
      ))}
    </div>
  );
}

export function ConfigTrainingEffectiveness() {
  const [preQuestions, setPreQuestions] = useState<AssessmentQuestion[]>([
    {
      id: "pre-1",
      text: "What is your current knowledge level on this topic?",
      type: "Scale (1–5)",
      required: true,
    },
    {
      id: "pre-2",
      text: "What do you hope to achieve from this course?",
      type: "Open text",
      required: false,
    },
    {
      id: "pre-3",
      text: "How confident are you in applying this skill at work today?",
      type: "Scale (1–5)",
      required: true,
    },
  ]);
  const [postQuestions, setPostQuestions] = useState<AssessmentQuestion[]>([
    {
      id: "post-1",
      text: "How would you rate your knowledge level now?",
      type: "Scale (1–5)",
      required: true,
    },
    {
      id: "post-2",
      text: "How confident are you in applying what you learned?",
      type: "Scale (1–5)",
      required: true,
    },
    {
      id: "post-3",
      text: "Would you recommend this course to a colleague?",
      type: "Yes / No",
      required: true,
    },
    {
      id: "post-4",
      text: "What would you improve about this course?",
      type: "Open text",
      required: false,
    },
  ]);
  const [kirkpatrickLevels, setKirkpatrickLevels] = useState<KirkpatrickLevel[]>([
    {
      id: "level-1",
      level: "Level 1",
      name: "Reaction",
      trigger: "On course completion",
      weight: 10,
    },
    {
      id: "level-2",
      level: "Level 2",
      name: "Learning",
      trigger: "Pre-enroll + Post-complete",
      weight: 30,
    },
    {
      id: "level-3",
      level: "Level 3",
      name: "Behaviour",
      trigger: "30 days after completion",
      weight: 40,
    },
    {
      id: "level-4",
      level: "Level 4",
      name: "Results",
      trigger: "90 days after completion (manual)",
      weight: 20,
    },
  ]);
  const [behaviorItems, setBehaviorItems] = useState<AssessmentQuestion[]>([
    {
      id: "behavior-1",
      text: "I am applying the skills from this course in my daily work",
      type: "Learner",
      required: true,
    },
    {
      id: "behavior-2",
      text: "I have shared key learnings with my team",
      type: "Learner",
      required: false,
    },
    {
      id: "behavior-3",
      text: "The learner is demonstrating the skills covered in the course",
      type: "Manager",
      required: true,
    },
    {
      id: "behavior-4",
      text: "What specific behaviours have you observed?",
      type: "Manager",
      required: false,
    },
  ]);
  const [calculationRules, setCalculationRules] = useState<CalculationRule[]>([
    { id: "knowledge", label: "Knowledge Lift Score", weight: 30 },
    { id: "reaction", label: "Reaction Score", weight: 10 },
    { id: "behavior", label: "Behaviour Change Score", weight: 40 },
    { id: "completion", label: "Completion Rate Contribution", weight: 20 },
    { id: "results", label: "Results / KPI Score", weight: 0 },
  ]);

  const updateKirkpatrickLevel = (id: string, patch: Partial<KirkpatrickLevel>) => {
    setKirkpatrickLevels((current) =>
      current.map((level) => (level.id === id ? { ...level, ...patch } : level)),
    );
  };

  const updateCalculationRule = (id: string, weight: number) => {
    setCalculationRules((current) =>
      current.map((rule) => (rule.id === id ? { ...rule, weight } : rule)),
    );
  };

  return (
    <div className="space-y-5">
      <CfgSection title="Pre-Course Assessment Questions">
        <QuestionBuilder
          questions={preQuestions}
          setQuestions={setPreQuestions}
          addLabel="Add Question"
        />
      </CfgSection>

      <CfgSection title="Post-Course Assessment Questions">
        <QuestionBuilder
          questions={postQuestions}
          setQuestions={setPostQuestions}
          addLabel="Add Question"
          types={[...QUESTION_TYPES, "NPS (0–10)"]}
        />
      </CfgSection>

      <CfgSection title="Kirkpatrick Surveys">
        <div className="grid gap-3 lg:grid-cols-2">
          {kirkpatrickLevels.map((level) => (
            <div
              key={level.id}
              className="rounded-xl border bg-white p-4"
              style={{ borderColor: P.border }}
            >
              <p className="mb-3 text-sm font-bold" style={{ color: P.text }}>
                {level.level} — {level.name}
              </p>
              <div className="grid gap-3 sm:grid-cols-[1fr_120px]">
                <select
                  value={level.trigger}
                  onChange={(event) =>
                    updateKirkpatrickLevel(level.id, { trigger: event.target.value })
                  }
                  className="w-full rounded-lg border bg-white px-3 py-2 text-xs outline-none"
                  style={{ borderColor: P.border, color: P.text }}
                  aria-label={`${level.level} trigger`}
                >
                  {[
                    "On course completion",
                    "24 hours after completion",
                    "7 days after completion",
                    "30 days after completion",
                    "90 days after completion (manual)",
                    "Pre-enroll + Post-complete",
                  ].map((trigger) => (
                    <option key={trigger}>{trigger}</option>
                  ))}
                </select>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={level.weight}
                  onChange={(event) =>
                    updateKirkpatrickLevel(level.id, { weight: Number(event.target.value) })
                  }
                  className="w-full rounded-lg border bg-white px-3 py-2 text-xs outline-none"
                  style={{ borderColor: P.border, color: P.text }}
                  aria-label={`${level.level} weight percentage`}
                />
              </div>
            </div>
          ))}
        </div>
      </CfgSection>

      <CfgSection title="Behaviour Follow-Up Survey">
        <div className="mb-4 grid gap-3 sm:grid-cols-2">
          <CfgField label="Learner follow-up (days)" value="30" type="number" />
          <CfgField label="Manager follow-up (days)" value="30" type="number" />
          <CfgField label="Reminder after (days)" value="7" type="number" />
          <CfgField label="Minimum manager responses" value="3" type="number" />
        </div>
        <QuestionBuilder
          questions={behaviorItems}
          setQuestions={setBehaviorItems}
          addLabel="Add Item"
          placeholder="Behaviour statement..."
          types={["Learner", "Manager", "Both"]}
        />
      </CfgSection>

      <CfgSection title="Effectiveness Calculation">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {calculationRules.map((rule) => (
            <label
              key={rule.id}
              className="rounded-xl border bg-white p-3 text-xs font-semibold"
              style={{ borderColor: P.border, color: P.textMid }}
            >
              {rule.label}
              <input
                type="number"
                min={0}
                max={100}
                value={rule.weight}
                onChange={(event) => updateCalculationRule(rule.id, Number(event.target.value))}
                className="mt-2 w-full rounded-lg border bg-white px-3 py-2 text-xs outline-none"
                style={{ borderColor: P.border, color: P.text }}
              />
            </label>
          ))}
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <CfgField label="Effectiveness alert threshold (%)" value="60" type="number" />
          <CfgField label="Minimum data points" value="5" type="number" />
        </div>
      </CfgSection>

      <SaveBar />
    </div>
  );
}
