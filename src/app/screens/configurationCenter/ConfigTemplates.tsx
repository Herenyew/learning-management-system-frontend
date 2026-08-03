import React, { useMemo, useState } from "react";
import {
  Award,
  BookOpen,
  ChevronLeft,
  Edit3,
  Eye,
  FileQuestion,
  Layers,
  Mail,
  Plus,
  Trash2,
} from "lucide-react";
import { P } from "./configuration.shared";

type TemplateCategoryId = "program" | "course" | "quiz" | "email" | "certificate";

type TemplateRecord = {
  id: string;
  category: TemplateCategoryId;
  name: string;
  description: string;
  details: string;
  audience: string;
  updatedAt: string;
};

type TemplateDraft = Omit<TemplateRecord, "id" | "updatedAt">;

const STORAGE_KEY = "learnos-template-management-v2";
const INITIAL_VISIBLE_COUNT = 4;

const CATEGORIES: {
  id: TemplateCategoryId;
  label: string;
  singular: string;
  description: string;
  icon: React.ComponentType<{ size?: number }>;
  color: string;
  background: string;
}[] = [
  {
    id: "program",
    label: "Program Templates",
    singular: "Program Template",
    description: "Reusable structures for learning programs and cohorts",
    icon: Layers,
    color: "#3F651E",
    background: "#E5F4DD",
  },
  {
    id: "course",
    label: "Course Templates",
    singular: "Course Template",
    description: "Standard course layouts, chapters, and learning content",
    icon: BookOpen,
    color: "#067A5B",
    background: "#DDF6EC",
  },
  {
    id: "quiz",
    label: "Quiz Templates",
    singular: "Quiz Template",
    description: "Assessment structures, scoring, and question guidance",
    icon: FileQuestion,
    color: "#8A6A1A",
    background: "#FFF4D6",
  },
  {
    id: "email",
    label: "Email Templates",
    singular: "Email Template",
    description: "Messages used throughout learner and manager workflows",
    icon: Mail,
    color: "#5B4AB8",
    background: "#EEEAFF",
  },
  {
    id: "certificate",
    label: "Certificate Templates",
    singular: "Certificate Template",
    description: "Certificate formats, wording, and issuance details",
    icon: Award,
    color: "#B45309",
    background: "#FFF0D9",
  },
];

const DEFAULT_TEMPLATES: TemplateRecord[] = [
  {
    id: "program-new-employee",
    category: "program",
    name: "New Employee Onboarding",
    description: "A structured onboarding journey for new employees.",
    details:
      "Orientation and company introduction\nMandatory policy courses\nRole-specific learning plan\n30-day manager check-in\nProgram completion review",
    audience: "New employees",
    updatedAt: "02 Aug 2026",
  },
  {
    id: "program-graduate",
    category: "program",
    name: "Graduate Trainee Journey",
    description: "A rotational development path for graduate trainees.",
    details:
      "Business orientation\nDepartment rotations\nMentor check-ins\nCapstone assignment\nFinal skills assessment",
    audience: "Graduate trainees",
    updatedAt: "30 Jul 2026",
  },
  {
    id: "program-leadership",
    category: "program",
    name: "Leadership Development",
    description: "Core management capabilities for current and future leaders.",
    details:
      "Leading teams\nCoaching and feedback\nDecision making\nChange leadership\nLeadership action plan",
    audience: "Managers and team leads",
    updatedAt: "28 Jul 2026",
  },
  {
    id: "program-technical",
    category: "program",
    name: "Technical Excellence",
    description: "A reusable framework for technical capability programs.",
    details:
      "Baseline technical assessment\nCore technical modules\nApplied project\nPeer review\nFinal demonstration",
    audience: "Technical teams",
    updatedAt: "25 Jul 2026",
  },
  {
    id: "program-compliance",
    category: "program",
    name: "Annual Compliance",
    description: "An annual sequence of mandatory compliance learning.",
    details:
      "Code of conduct\nInformation security\nData privacy\nWorkplace safety\nAnnual attestation",
    audience: "All employees",
    updatedAt: "22 Jul 2026",
  },
  {
    id: "course-standard",
    category: "course",
    name: "Standard Instructor-Led Course",
    description: "A complete structure for instructor-led delivery.",
    details:
      "Course overview and objectives\nPre-reading material\nInstructor-led session\nKnowledge check\nCourse evaluation",
    audience: "Course creators",
    updatedAt: "01 Aug 2026",
  },
  {
    id: "course-self-paced",
    category: "course",
    name: "Self-Paced Digital Course",
    description: "A modular template for asynchronous digital learning.",
    details:
      "Welcome module\nShort learning chapters\nInteractive activities\nFinal quiz\nCompletion resources",
    audience: "Course creators",
    updatedAt: "29 Jul 2026",
  },
  {
    id: "course-compliance",
    category: "course",
    name: "Compliance Course",
    description: "A controlled course layout for mandatory learning.",
    details:
      "Policy introduction\nRequired content\nScenario examples\nMandatory assessment\nLearner attestation",
    audience: "Compliance owners",
    updatedAt: "26 Jul 2026",
  },
  {
    id: "course-workshop",
    category: "course",
    name: "Practical Workshop",
    description: "A workshop structure focused on applied learning.",
    details:
      "Preparation activity\nFacilitator guide\nGroup exercises\nPractical assignment\nReflection and feedback",
    audience: "Facilitators",
    updatedAt: "23 Jul 2026",
  },
  {
    id: "course-microlearning",
    category: "course",
    name: "Microlearning Series",
    description: "A sequence of short, focused learning modules.",
    details: "Five-minute concept\nWorked example\nQuick practice\nKnowledge check\nJob aid",
    audience: "Course creators",
    updatedAt: "20 Jul 2026",
  },
  {
    id: "quiz-knowledge",
    category: "quiz",
    name: "Standard Knowledge Check",
    description: "A general-purpose knowledge check for course chapters.",
    details:
      "10 questions\n70% passing score\n3 attempts\nQuestion order randomized\nFeedback shown after submission",
    audience: "Course creators",
    updatedAt: "03 Aug 2026",
  },
  {
    id: "quiz-compliance",
    category: "quiz",
    name: "Compliance Attestation Quiz",
    description: "A stricter assessment for compliance learning.",
    details:
      "15 questions\n80% passing score\n2 attempts\nAll questions required\nAttestation recorded on pass",
    audience: "Compliance owners",
    updatedAt: "31 Jul 2026",
  },
  {
    id: "quiz-pre-post",
    category: "quiz",
    name: "Pre/Post Assessment",
    description: "Matching assessments for measuring knowledge improvement.",
    details:
      "20 questions\nPre-course baseline\nPost-course comparison\n60% minimum score\nResults included in analytics",
    audience: "Learning administrators",
    updatedAt: "27 Jul 2026",
  },
  {
    id: "quiz-practical",
    category: "quiz",
    name: "Scenario-Based Assessment",
    description: "An applied assessment using workplace scenarios.",
    details:
      "8 workplace scenarios\nWeighted answers\nDetailed feedback\nOne final attempt\nManager-visible results",
    audience: "Course creators",
    updatedAt: "24 Jul 2026",
  },
  {
    id: "quiz-certification",
    category: "quiz",
    name: "Certification Exam",
    description: "A controlled final exam for internal certification.",
    details:
      "40 questions\n85% passing score\nTimed assessment\nSingle attempt\nCertificate issued on pass",
    audience: "Certification owners",
    updatedAt: "21 Jul 2026",
  },
  {
    id: "email-welcome",
    category: "email",
    name: "Welcome and Onboarding",
    description: "Sent when a learner first joins LearnOS.",
    details:
      "Subject: Welcome to ADIU LearnOS\nGreeting with learner name\nGetting-started instructions\nSupport contact\nSign-in link",
    audience: "New learners",
    updatedAt: "03 Aug 2026",
  },
  {
    id: "email-enrollment",
    category: "email",
    name: "Course Enrollment Confirmation",
    description: "Confirms a learner's course enrollment.",
    details:
      "Course title\nEnrollment date\nExpected completion date\nCourse access link\nContact person",
    audience: "Enrolled learners",
    updatedAt: "01 Aug 2026",
  },
  {
    id: "email-deadline",
    category: "email",
    name: "Assignment Deadline Reminder",
    description: "Reminds learners about approaching assignment deadlines.",
    details: "Assignment title\nDue date\nCourse name\nSubmission link\nManager escalation note",
    audience: "Assigned learners",
    updatedAt: "28 Jul 2026",
  },
  {
    id: "email-certificate",
    category: "email",
    name: "Certificate Issued",
    description: "Notifies a learner that a certificate is available.",
    details: "Certificate title\nIssue date\nCredential number\nDownload link\nVerification link",
    audience: "Certified learners",
    updatedAt: "25 Jul 2026",
  },
  {
    id: "email-tna",
    category: "email",
    name: "TNA Request Decision",
    description: "Communicates approval or rejection of a TNA request.",
    details: "Request reference\nDecision status\nHR comment\nNext steps\nTraining details",
    audience: "TNA requesters",
    updatedAt: "22 Jul 2026",
  },
  {
    id: "certificate-standard",
    category: "certificate",
    name: "Standard Completion Certificate",
    description: "The default credential for completed courses.",
    details:
      "ADIU company heading\nLearner full name\nCourse title\nCompletion date\nCertificate ID and verification QR",
    audience: "Course completers",
    updatedAt: "02 Aug 2026",
  },
  {
    id: "certificate-program",
    category: "certificate",
    name: "Program Completion Certificate",
    description: "Issued after successful completion of a learning program.",
    details:
      "Program title\nLearner name\nProgram period\nCompletion statement\nApproved signatories",
    audience: "Program completers",
    updatedAt: "30 Jul 2026",
  },
  {
    id: "certificate-leadership",
    category: "certificate",
    name: "Executive Leadership Credential",
    description: "A premium credential for leadership programs.",
    details:
      "Executive credential heading\nLeadership program title\nLearner name\nExecutive signatures\nOfficial company seal",
    audience: "Leadership participants",
    updatedAt: "27 Jul 2026",
  },
  {
    id: "certificate-compliance",
    category: "certificate",
    name: "Compliance Attestation",
    description: "Records successful completion of mandatory compliance learning.",
    details:
      "Compliance subject\nEmployee name and ID\nAttestation wording\nCompletion and expiry dates\nCompliance officer signature",
    audience: "All employees",
    updatedAt: "24 Jul 2026",
  },
  {
    id: "certificate-external",
    category: "certificate",
    name: "External Certification Recognition",
    description: "Recognizes an externally issued professional certification.",
    details:
      "External credential name\nIssuing organization\nEmployee name\nOriginal issue and expiry dates\nVerification reference",
    audience: "Certified employees",
    updatedAt: "20 Jul 2026",
  },
];

const emptyDraft = (category: TemplateCategoryId): TemplateDraft => ({
  category,
  name: "",
  description: "",
  details: "",
  audience: "",
});

const loadTemplates = (): TemplateRecord[] => {
  if (typeof window === "undefined") return DEFAULT_TEMPLATES;

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return DEFAULT_TEMPLATES;
    const parsed = JSON.parse(stored) as TemplateRecord[];
    return Array.isArray(parsed) ? parsed : DEFAULT_TEMPLATES;
  } catch {
    return DEFAULT_TEMPLATES;
  }
};

const todayLabel = () =>
  new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date());

export function ConfigTemplates() {
  const [templates, setTemplates] = useState<TemplateRecord[]>(loadTemplates);
  const [activeCategory, setActiveCategory] = useState<TemplateCategoryId | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [draft, setDraft] = useState<TemplateDraft>(() => emptyDraft("program"));
  const [showAll, setShowAll] = useState(false);
  const [notice, setNotice] = useState("");

  const activeCategoryConfig = CATEGORIES.find((category) => category.id === activeCategory);
  const selectedTemplate = templates.find((template) => template.id === selectedTemplateId);
  const categoryTemplates = useMemo(
    () => templates.filter((template) => template.category === activeCategory),
    [activeCategory, templates],
  );
  const visibleTemplates = showAll
    ? categoryTemplates
    : categoryTemplates.slice(0, INITIAL_VISIBLE_COUNT);

  const persistTemplates = (next: TemplateRecord[]) => {
    setTemplates(next);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const flashNotice = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2500);
  };

  const openCategory = (category: TemplateCategoryId) => {
    setActiveCategory(category);
    setSelectedTemplateId(null);
    setEditingTemplateId(null);
    setShowAll(false);
  };

  const openCreate = () => {
    if (!activeCategory) return;
    setDraft(emptyDraft(activeCategory));
    setEditingTemplateId("new");
    setSelectedTemplateId(null);
  };

  const openEdit = (template: TemplateRecord) => {
    setDraft({
      category: template.category,
      name: template.name,
      description: template.description,
      details: template.details,
      audience: template.audience,
    });
    setEditingTemplateId(template.id);
    setSelectedTemplateId(null);
  };

  const saveTemplate = () => {
    const name = draft.name.trim();
    if (!name) {
      flashNotice("Template name is required.");
      return;
    }

    if (editingTemplateId === "new") {
      const created: TemplateRecord = {
        ...draft,
        id: `${draft.category}-${Date.now()}`,
        name,
        description: draft.description.trim(),
        details: draft.details.trim(),
        audience: draft.audience.trim(),
        updatedAt: todayLabel(),
      };
      persistTemplates([created, ...templates]);
      setEditingTemplateId(null);
      setSelectedTemplateId(created.id);
      flashNotice(`${created.name} created.`);
      return;
    }

    const next = templates.map((template) =>
      template.id === editingTemplateId
        ? {
            ...template,
            ...draft,
            name,
            description: draft.description.trim(),
            details: draft.details.trim(),
            audience: draft.audience.trim(),
            updatedAt: todayLabel(),
          }
        : template,
    );
    persistTemplates(next);
    const savedId = editingTemplateId;
    setEditingTemplateId(null);
    setSelectedTemplateId(savedId);
    flashNotice(`${name} updated.`);
  };

  const deleteTemplate = (template: TemplateRecord) => {
    persistTemplates(templates.filter((item) => item.id !== template.id));
    if (selectedTemplateId === template.id) setSelectedTemplateId(null);
    flashNotice(`${template.name} deleted.`);
  };

  const returnToCategory = () => {
    setSelectedTemplateId(null);
    setEditingTemplateId(null);
  };

  if (!activeCategory || !activeCategoryConfig) {
    return (
      <div className="space-y-5">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {CATEGORIES.map((category) => {
            const Icon = category.icon;
            const count = templates.filter((template) => template.category === category.id).length;
            return (
              <button
                key={category.id}
                onClick={() => openCategory(category.id)}
                className="group rounded-2xl border bg-white p-5 text-left transition-all hover:-translate-y-0.5 hover:shadow-lg"
                style={{ borderColor: P.border }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-xl"
                    style={{ background: category.background, color: category.color }}
                  >
                    <Icon size={20} />
                  </div>
                  <span
                    className="rounded-full px-2.5 py-1 text-[10px] font-bold"
                    style={{ background: P.paleGreen, color: P.olive }}
                  >
                    {count} templates
                  </span>
                </div>
                <h2 className="mt-5 text-base font-bold" style={{ color: P.text }}>
                  {category.label}
                </h2>
                <p className="mt-1 text-xs leading-5" style={{ color: P.textMuted }}>
                  {category.description}
                </p>
                <span
                  className="mt-5 inline-flex items-center gap-1 text-xs font-semibold"
                  style={{ color: P.olive }}
                >
                  Open library <span aria-hidden="true">→</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (editingTemplateId) {
    return (
      <div className="space-y-5">
        <button
          onClick={returnToCategory}
          className="flex items-center gap-1 text-sm font-medium"
          style={{ color: P.textMuted }}
        >
          <ChevronLeft size={16} /> Back to {activeCategoryConfig.label}
        </button>

        <div>
          <h1 className="text-2xl font-bold" style={{ color: P.text }}>
            {editingTemplateId === "new" ? "Add" : "Edit"} {activeCategoryConfig.singular}
          </h1>
          <p className="mt-1 text-sm" style={{ color: P.textMuted }}>
            Define the reusable template content shown in its preview.
          </p>
        </div>

        <div
          className="max-w-4xl space-y-5 rounded-2xl border bg-white p-6"
          style={{ borderColor: P.border }}
        >
          <div>
            <label className="mb-1.5 block text-xs font-semibold" style={{ color: P.textMid }}>
              Template name *
            </label>
            <input
              value={draft.name}
              onChange={(event) =>
                setDraft((current) => ({ ...current, name: event.target.value }))
              }
              placeholder={`e.g. Standard ${activeCategoryConfig.singular}`}
              className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none"
              style={{ borderColor: P.border, color: P.text }}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold" style={{ color: P.textMid }}>
              Intended audience
            </label>
            <input
              value={draft.audience}
              onChange={(event) =>
                setDraft((current) => ({ ...current, audience: event.target.value }))
              }
              placeholder="Who should use or receive this template?"
              className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none"
              style={{ borderColor: P.border, color: P.text }}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold" style={{ color: P.textMid }}>
              Preview summary
            </label>
            <textarea
              value={draft.description}
              onChange={(event) =>
                setDraft((current) => ({ ...current, description: event.target.value }))
              }
              rows={3}
              placeholder="Short summary shown on the preview page"
              className="w-full resize-y rounded-lg border px-3 py-2.5 text-sm outline-none"
              style={{ borderColor: P.border, color: P.text }}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold" style={{ color: P.textMid }}>
              Template contents
            </label>
            <textarea
              value={draft.details}
              onChange={(event) =>
                setDraft((current) => ({ ...current, details: event.target.value }))
              }
              rows={8}
              placeholder="Enter one template detail or section per line"
              className="w-full resize-y rounded-lg border px-3 py-2.5 text-sm outline-none"
              style={{ borderColor: P.border, color: P.text }}
            />
          </div>
          <div className="flex justify-end gap-2 border-t pt-4" style={{ borderColor: P.border }}>
            <button
              onClick={returnToCategory}
              className="rounded-lg border px-4 py-2.5 text-sm font-semibold"
              style={{ borderColor: P.border, color: P.textMid }}
            >
              Cancel
            </button>
            <button
              onClick={saveTemplate}
              className="rounded-lg px-5 py-2.5 text-sm font-semibold text-white"
              style={{ background: P.olive }}
            >
              Save Template
            </button>
          </div>
        </div>

        {notice && (
          <p className="text-xs font-semibold" style={{ color: P.olive }}>
            {notice}
          </p>
        )}
      </div>
    );
  }

  if (selectedTemplate) {
    const Icon = activeCategoryConfig.icon;
    const detailLines = selectedTemplate.details
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    return (
      <div className="space-y-5">
        <button
          onClick={returnToCategory}
          className="flex items-center gap-1 text-sm font-medium"
          style={{ color: P.textMuted }}
        >
          <ChevronLeft size={16} /> Back to {activeCategoryConfig.label}
        </button>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-xl"
              style={{
                background: activeCategoryConfig.background,
                color: activeCategoryConfig.color,
              }}
            >
              <Icon size={22} />
            </div>
            <div>
              <p className="text-xs font-semibold" style={{ color: P.olive }}>
                {activeCategoryConfig.singular} Preview
              </p>
              <h1 className="mt-1 text-2xl font-bold" style={{ color: P.text }}>
                {selectedTemplate.name}
              </h1>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => openEdit(selectedTemplate)}
              className="flex items-center gap-1.5 rounded-lg border px-4 py-2.5 text-sm font-semibold"
              style={{ borderColor: P.border, color: P.olive }}
            >
              <Edit3 size={14} /> Edit
            </button>
            <button
              onClick={() => deleteTemplate(selectedTemplate)}
              className="flex items-center gap-1.5 rounded-lg border px-4 py-2.5 text-sm font-semibold"
              style={{ borderColor: "#F1B5AF", color: "#B42318" }}
            >
              <Trash2 size={14} /> Delete
            </button>
          </div>
        </div>

        <div
          className="max-w-5xl overflow-hidden rounded-2xl border bg-white"
          style={{ borderColor: P.border }}
        >
          <div className="border-b p-6" style={{ borderColor: P.border, background: P.paleGreen }}>
            <p
              className="text-xs font-semibold uppercase tracking-wide"
              style={{ color: P.textMuted }}
            >
              Preview summary
            </p>
            <p className="mt-2 text-sm leading-6" style={{ color: P.text }}>
              {selectedTemplate.description || "No preview summary has been added."}
            </p>
          </div>
          <div className="grid gap-6 p-6 md:grid-cols-[1fr_260px]">
            <div>
              <h2 className="text-sm font-bold" style={{ color: P.text }}>
                Template contents
              </h2>
              {detailLines.length ? (
                <ol className="mt-4 space-y-3">
                  {detailLines.map((line, index) => (
                    <li key={`${line}-${index}`} className="flex items-start gap-3">
                      <span
                        className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
                        style={{ background: P.lightSage, color: P.olive }}
                      >
                        {index + 1}
                      </span>
                      <span className="pt-0.5 text-sm" style={{ color: P.textMid }}>
                        {line}
                      </span>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="mt-3 text-sm" style={{ color: P.textMuted }}>
                  No template contents have been added.
                </p>
              )}
            </div>
            <aside className="rounded-xl border p-4" style={{ borderColor: P.border }}>
              <p
                className="text-[10px] font-bold uppercase tracking-wide"
                style={{ color: P.textMuted }}
              >
                Intended audience
              </p>
              <p className="mt-1 text-sm font-semibold" style={{ color: P.text }}>
                {selectedTemplate.audience || "Not specified"}
              </p>
              <div className="my-4 border-t" style={{ borderColor: P.border }} />
              <p
                className="text-[10px] font-bold uppercase tracking-wide"
                style={{ color: P.textMuted }}
              >
                Last updated
              </p>
              <p className="mt-1 text-sm font-semibold" style={{ color: P.text }}>
                {selectedTemplate.updatedAt}
              </p>
            </aside>
          </div>
        </div>

        {notice && (
          <p className="text-xs font-semibold" style={{ color: P.olive }}>
            {notice}
          </p>
        )}
      </div>
    );
  }

  const CategoryIcon = activeCategoryConfig.icon;

  return (
    <div className="space-y-5">
      <button
        onClick={() => setActiveCategory(null)}
        className="flex items-center gap-1 text-sm font-medium"
        style={{ color: P.textMuted }}
      >
        <ChevronLeft size={16} /> All template categories
      </button>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-xl"
            style={{
              background: activeCategoryConfig.background,
              color: activeCategoryConfig.color,
            }}
          >
            <CategoryIcon size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: P.text }}>
              {activeCategoryConfig.label}
            </h1>
            <p className="mt-1 text-sm" style={{ color: P.textMuted }}>
              Select a card to preview its complete contents.
            </p>
          </div>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center justify-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-semibold text-white"
          style={{ background: P.olive }}
        >
          <Plus size={15} /> Add Template
        </button>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        {visibleTemplates.map((template) => (
          <div
            key={template.id}
            role="button"
            tabIndex={0}
            onClick={() => setSelectedTemplateId(template.id)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") setSelectedTemplateId(template.id);
            }}
            className="group flex cursor-pointer items-center gap-3 rounded-2xl border bg-white p-4 transition-all hover:border-emerald-500 hover:shadow-md"
            style={{ borderColor: P.border }}
          >
            <div
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
              style={{
                background: activeCategoryConfig.background,
                color: activeCategoryConfig.color,
              }}
            >
              <CategoryIcon size={18} />
            </div>
            <h2 className="min-w-0 flex-1 truncate text-sm font-bold" style={{ color: P.text }}>
              {template.name}
            </h2>
            <div className="flex flex-shrink-0 gap-1.5">
              <button
                onClick={(event) => {
                  event.stopPropagation();
                  setSelectedTemplateId(template.id);
                }}
                className="flex items-center gap-1 rounded-lg px-2.5 py-2 text-xs font-semibold"
                style={{ background: P.lightSage, color: P.olive }}
              >
                <Eye size={13} /> Preview
              </button>
              <button
                onClick={(event) => {
                  event.stopPropagation();
                  openEdit(template);
                }}
                className="rounded-lg border p-2"
                style={{ borderColor: P.border, color: P.olive }}
                aria-label={`Edit ${template.name}`}
              >
                <Edit3 size={14} />
              </button>
              <button
                onClick={(event) => {
                  event.stopPropagation();
                  deleteTemplate(template);
                }}
                className="rounded-lg border p-2"
                style={{ borderColor: "#F1B5AF", color: "#B42318" }}
                aria-label={`Delete ${template.name}`}
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {categoryTemplates.length === 0 && (
        <div
          className="rounded-2xl border bg-white px-6 py-14 text-center"
          style={{ borderColor: P.border }}
        >
          <p className="text-sm font-bold" style={{ color: P.text }}>
            No templates in this category
          </p>
          <button
            onClick={openCreate}
            className="mt-2 text-xs font-semibold"
            style={{ color: P.olive }}
          >
            Add the first template
          </button>
        </div>
      )}

      {categoryTemplates.length > INITIAL_VISIBLE_COUNT && (
        <div className="flex justify-center">
          <button
            onClick={() => setShowAll((current) => !current)}
            className="rounded-lg border px-5 py-2.5 text-sm font-semibold"
            style={{ borderColor: P.border, background: "white", color: P.olive }}
          >
            {showAll
              ? "Show less"
              : `View more (${categoryTemplates.length - INITIAL_VISIBLE_COUNT})`}
          </button>
        </div>
      )}

      {notice && (
        <p className="text-center text-xs font-semibold" style={{ color: P.olive }}>
          {notice}
        </p>
      )}
    </div>
  );
}
