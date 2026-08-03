import type React from "react";
import { FileText, UserCheck, Wand2 } from "lucide-react";
import { P } from "../configuration.shared";

type BuilderStep = 1 | 2 | 3;

type StepDefinition = [BuilderStep, string, React.ElementType];

const steps: StepDefinition[] = [
  [1, "Details", FileText],
  [2, "Design", Wand2],
  [3, "Signers", UserCheck],
];

type CertificationBuilderStepperProps = {
  builderStep: BuilderStep;
  onStepChange: (step: BuilderStep) => void;
};

export function CertificationBuilderStepper({
  builderStep,
  onStepChange,
}: CertificationBuilderStepperProps) {
  return (
    <div className="bg-white rounded-xl border p-4" style={{ borderColor: P.border }}>
      <div className="grid grid-cols-3 gap-2">
        {steps.map(([step, label, Icon]) => {
          const active = builderStep === step;

          return (
            <button
              key={label}
              type="button"
              onClick={() => onStepChange(step)}
              className="p-3 rounded-lg text-left"
              style={{
                background: active ? P.lightSage : P.bg,
                border: `1px solid ${active ? P.olive : P.border}`,
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <Icon size={14} style={{ color: active ? P.olive : P.textMuted }} />
                <span className="text-[10px] font-bold" style={{ color: P.textMuted }}>
                  Step {step}
                </span>
              </div>
              <p className="text-xs font-semibold" style={{ color: P.text }}>
                {label}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
