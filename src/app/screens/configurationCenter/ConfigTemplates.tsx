// ConfigTemplates.tsx — Centralized Template Management
// All six template types backed by the new /configuration/templates/* API.
import React, { useState } from "react";
import { BookOpen, Layers, HelpCircle, FileText, Award, MessageSquare, ChevronLeft, LayoutGrid } from "lucide-react";
import { P, CfgSection } from "./configuration.shared";
import { CourseTemplatesCrud } from "../adminRecords/CourseTemplatesCrud";
import { ProgramTemplatesCrud } from "../adminRecords/ProgramTemplatesCrud";
import { AssessmentTemplatesCrud } from "../adminRecords/AssessmentTemplatesCrud";
import { SurveyTemplatesSection } from "./SurveyTemplatesSection";
import { CertificateTemplatesCrud } from "../adminRecords/CertificateTemplatesCrud";
import { NotificationsCrud } from "../adminRecords/NotificationsCrud";

type TemplateCategoryId = "course" | "program" | "assessment" | "survey" | "certificate" | "notification";

const TEMPLATE_CATEGORIES: {
  id: TemplateCategoryId; label: string; description: string;
  icon: React.ElementType; color: string; background: string;
}[] = [
  { id: "course", label: "Course Templates", description: "Reusable course layouts, chapters, and learning content", icon: BookOpen, color: "#067A5B", background: "#DDF6EC" },
  { id: "program", label: "Program Templates", description: "Reusable structures for learning programs and cohorts", icon: Layers, color: "#3F651E", background: "#E5F4DD" },
  { id: "assessment", label: "Assessment Templates", description: "Assessment structures, scoring, and question guidance", icon: HelpCircle, color: "#8A6A1A", background: "#FFF4D6" },
  { id: "survey", label: "Survey Templates", description: "Reusable survey templates with dynamic question builders", icon: FileText, color: "#1D4ED8", background: "#EFF6FF" },
  { id: "certificate", label: "Certificate Templates", description: "Certificate formats, wording, and issuance details", icon: Award, color: "#B45309", background: "#FFF0D9" },
  { id: "notification", label: "Notification Templates", description: "Messages used throughout learner and manager workflows", icon: MessageSquare, color: "#5B4AB8", background: "#EEEAFF" },
];

export function ConfigTemplates() {
  const [activeCategory, setActiveCategory] = useState<TemplateCategoryId | null>(null);
  const activeCategoryConfig = TEMPLATE_CATEGORIES.find((c) => c.id === activeCategory);

  if (!activeCategory) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-2">
          <LayoutGrid size={18} style={{ color: P.olive }} />
          <h2 className="text-base font-bold" style={{ color: P.text }}>Template Management</h2>
        </div>
        <p className="text-[11px]" style={{ color: P.textMuted }}>
          Centralized template library for all learning configuration. Select a category to manage its templates.
        </p>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {TEMPLATE_CATEGORIES.map((category) => {
            const Icon = category.icon;
            return (
              <button key={category.id} onClick={() => setActiveCategory(category.id)}
                className="group rounded-2xl border bg-white p-5 text-left transition-all hover:-translate-y-0.5 hover:shadow-lg"
                style={{ borderColor: P.border }}>
                <span className="flex h-12 w-12 items-center justify-center rounded-xl"
                  style={{ background: category.background, color: category.color }}>
                  <Icon size={23} />
                </span>
                <h2 className="mt-5 text-base font-bold" style={{ color: P.text }}>{category.label}</h2>
                <p className="mt-1 min-h-10 text-xs leading-5" style={{ color: P.textMuted }}>{category.description}</p>
                <span className="mt-5 inline-flex text-xs font-semibold" style={{ color: P.olive }}>
                  Open library <span aria-hidden="true">&nbsp;→</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => setActiveCategory(null)}
          className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: P.olive }}>
          <ChevronLeft size={15} /> Back to Template Management
        </button>
        <div className="flex items-center gap-2 ml-auto">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg"
            style={{ background: activeCategoryConfig?.background, color: activeCategoryConfig?.color }}>
            {activeCategoryConfig && <activeCategoryConfig.icon size={15} />}
          </span>
          <p className="text-sm font-bold" style={{ color: P.text }}>{activeCategoryConfig?.label}</p>
        </div>
      </div>
      <CfgSection title={activeCategoryConfig?.label ?? "Templates"}>
        {activeCategory === "course" && <CourseTemplatesCrud />}
        {activeCategory === "program" && <ProgramTemplatesCrud />}
        {activeCategory === "assessment" && <AssessmentTemplatesCrud />}
        {activeCategory === "survey" && <SurveyTemplatesSection />}
        {activeCategory === "certificate" && <CertificateTemplatesCrud />}
        {activeCategory === "notification" && <NotificationsCrud />}
      </CfgSection>
    </div>
  );
}