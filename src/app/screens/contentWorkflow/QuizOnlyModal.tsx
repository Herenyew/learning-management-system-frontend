import React from "react";
import { QuizWorkflow, type QuestionTypeConfig } from "./QuizWorkflow";
import type { SavedContentItem } from "./ContentWorkflowModal";

export function QuizOnlyModal({
  moduleName,
  onClose,
  onSave,
  questionTypeConfig,
}: {
  moduleName: string;
  onClose: () => void;
  onSave: (item: SavedContentItem) => void;
  questionTypeConfig?: QuestionTypeConfig[];
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop"
      onClick={onClose}
    >
      <QuizWorkflow
        onClose={onClose}
        questionTypeConfig={questionTypeConfig}
        onSave={(quiz) => {
          if (quiz) {
            onSave({
              type: "Quiz",
              title: quiz.name,
              meta: `${quiz.questionCount} Questions · Pass: ${quiz.passScore}%`,
              quizData: quiz,
            });
          }
          onClose();
        }}
      />
    </div>
  );
}
