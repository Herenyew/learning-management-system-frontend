import React, { useEffect, useState } from "react";
import {
  AICard,
  AlertCircle,
  Archive,
  Area,
  AreaChart,
  Av,
  Award,
  Badge,
  Bar,
  BarChart2,
  BookOpen,
  Bot,
  Building,
  CERT_TEMPLATES,
  Calendar,
  CartesianGrid,
  Cell,
  Check,
  CheckCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clock,
  ConfigPublishing,
  Copy,
  Cpu,
  Download,
  Edit,
  EditableSelect,
  Eye,
  FilePlus,
  FileText,
  Filter,
  Flag,
  Globe,
  HelpCircle,
  Input,
  Layers,
  Link,
  Lock,
  MODERATION_ITEMS,
  Medal,
  MessageSquare,
  MoreHorizontal,
  P,
  PBar,
  PROGRAMS_DATA,
  PROGRAM_TASKS_INITIAL,
  PROGRAM_TEMPLATE_LIBRARY,
  PROGRAM_TYPE_DEFAULTS,
  PUBLISHING_QUEUE,
  PageHeader,
  Pie,
  PieChart,
  Play,
  Plus,
  PlusCircle,
  ReBarChart,
  RefreshCw,
  ResponsiveContainer,
  SCORM_PACKAGES,
  Search,
  Select,
  Send,
  Settings,
  Shield,
  Signature,
  Sparkles,
  Stamp,
  Star,
  StatCard,
  TEAM_MEMBERS,
  TNA_DEPT_DATA,
  TNA_REQUESTS,
  TNA_TREND,
  Target,
  Textarea,
  ToggleLeft,
  ToggleRight,
  Tooltip,
  Trash2,
  TrendingDown,
  TrendingUp,
  Trophy,
  Upload,
  User,
  UserCheck,
  Users,
  Video,
  Wand2,
  X,
  XAxis,
  YAxis,
  Zap,
} from "./extended.shared";
import type { Screen } from "../../models/app.model";
import type {
  HRProgram,
  ProgramCohort,
  ProgramTask,
  ProgramTaskSource,
  ProgramTaskType,
  ProgramTemplate,
  ProgramTypeOption,
} from "./extended.shared";

export function TNAFormScreen({ navigate }: { navigate: (s: string) => void }) {
  const [step, setStep] = useState(1);
  const [requestType, setRequestType] = useState<"free" | "paid">("free");
  const [submitter, setSubmitter] = useState<"employee" | "manager">("employee");
  const [tnaDepartment, setTnaDepartment] = useState("");
  const [tnaWorkUnit, setTnaWorkUnit] = useState("");
  const [tnaJobTitle, setTnaJobTitle] = useState("");
  const [tnaCompetencyGap, setTnaCompetencyGap] = useState("");
  const [tnaDepartments, setTnaDepartments] = useState([
    "Engineering",
    "Sales",
    "HR",
    "Finance",
    "Marketing",
    "Legal",
    "Operations",
  ]);
  const [tnaWorkUnits, setTnaWorkUnits] = useState([
    "Platform Engineering",
    "Data Engineering",
    "Frontend",
    "Backend",
    "Infrastructure",
  ]);
  const [tnaJobTitles, setTnaJobTitles] = useState([
    "Senior Engineer",
    "Engineering Manager",
    "Product Manager",
    "Marketing Manager",
    "HR Specialist",
  ]);
  const [tnaCompetencyGapAreas, setTnaCompetencyGapAreas] = useState([
    "AI & Automation",
    "Data Literacy",
    "Leadership",
    "Communication",
    "Security",
    "Financial Modeling",
    "Change Management",
  ]);
  const totalSteps = requestType === "paid" ? 4 : 3;

  const approvalStages =
    requestType === "paid"
      ? [
          { label: "Manager Review", status: "approved", date: "Jan 16" },
          { label: "HR Review", status: "approved", date: "Jan 17" },
          { label: "CEO Approval", status: "pending", date: "—" },
        ]
      : [
          { label: "Line Manager Endorsement", status: "approved", date: "Jan 16" },
          { label: "HR Approval", status: "pending", date: "—" },
        ];

  return (
    <div className="p-6 max-w-[860px]">
      <button
        onClick={() => navigate("tna")}
        className="flex items-center gap-1.5 text-sm mb-5"
        style={{ color: P.textMuted }}
      >
        <ChevronLeft size={16} /> Back to TNA Dashboard
      </button>

      <PageHeader
        title="Submit Training Need Request"
        sub="Request training for yourself or your team — free or funded programs"
      />

      {/* Step indicator */}
      <div className="flex items-center gap-0 mt-6 mb-8">
        {Array(totalSteps)
          .fill(0)
          .map((_, i) => (
            <div key={i} className="flex items-center flex-1">
              <div className="flex items-center gap-2 flex-shrink-0">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all"
                  style={{
                    background: step > i + 1 ? "#5A7A2A" : step === i + 1 ? P.olive : P.lightSage,
                    color: step >= i + 1 ? "white" : P.textMuted,
                  }}
                >
                  {step > i + 1 ? <CheckCircle size={16} /> : i + 1}
                </div>
                <span
                  className="text-xs font-medium hidden sm:block"
                  style={{ color: step === i + 1 ? P.olive : P.textMuted }}
                >
                  {["Request Type", "Training Details", "Description", "Budget & Approval"][i]}
                </span>
              </div>
              {i < totalSteps - 1 && (
                <div
                  className="flex-1 h-0.5 mx-2"
                  style={{ background: step > i + 1 ? "#5A7A2A" : P.lightSage }}
                />
              )}
            </div>
          ))}
      </div>

      {/* Step content */}
      <div className="bg-white rounded-2xl border p-6 space-y-6" style={{ borderColor: P.border }}>
        {/* Step 1: Request Type */}
        {step === 1 && (
          <div className="space-y-5">
            <h2
              className="text-base font-bold"
              style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", color: P.text }}
            >
              Request Type & Submitter
            </h2>

            <div>
              <p className="text-xs font-semibold mb-3" style={{ color: P.textMid }}>
                Who is submitting this request?
              </p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  ["employee", "Self (Employee)", "I am requesting training for myself", "User"],
                  [
                    "manager",
                    "My Team (Manager)",
                    "I am requesting training for a team member",
                    "Users",
                  ],
                ].map(([val, label, desc, _]) => (
                  <button
                    key={val}
                    onClick={() => setSubmitter(val as "employee" | "manager")}
                    className="p-4 rounded-xl border-2 text-left transition-all"
                    style={{
                      borderColor: submitter === val ? P.olive : P.border,
                      background: submitter === val ? P.lightSage : "white",
                    }}
                  >
                    <p className="text-sm font-semibold mb-0.5" style={{ color: P.text }}>
                      {label}
                    </p>
                    <p className="text-xs" style={{ color: P.textMuted }}>
                      {desc}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold mb-3" style={{ color: P.textMid }}>
                Funding Type
              </p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  [
                    "free",
                    "Free Training",
                    "No cost — internal resources, open courses, or HR-sponsored",
                  ],
                  [
                    "paid",
                    "Paid Training",
                    "External vendor, certification program, or conference requiring budget",
                  ],
                ].map(([val, label, desc]) => (
                  <button
                    key={val}
                    onClick={() => setRequestType(val as "free" | "paid")}
                    className="p-4 rounded-xl border-2 text-left transition-all"
                    style={{
                      borderColor: requestType === val ? P.olive : P.border,
                      background: requestType === val ? P.lightSage : "white",
                    }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-semibold" style={{ color: P.text }}>
                        {label}
                      </p>
                      {val === "paid" && <Badge label="Budget Required" variant="gold" />}
                    </div>
                    <p className="text-xs" style={{ color: P.textMuted }}>
                      {desc}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {requestType === "paid" && (
              <div
                className="p-4 rounded-xl"
                style={{ background: P.goldLight, border: `1px solid ${P.gold}40` }}
              >
                <p className="text-xs font-semibold mb-1" style={{ color: "#8A6A1A" }}>
                  Paid Request Approval Workflow
                </p>
                <div className="flex items-center gap-2 mt-2">
                  {approvalStages.map((s, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5">
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center"
                          style={{ background: s.status === "approved" ? "#5A7A2A" : P.gold }}
                        >
                          {s.status === "approved" ? (
                            <CheckCircle size={11} className="text-white" />
                          ) : (
                            <Clock size={11} className="text-white" />
                          )}
                        </div>
                        <span className="text-[10px] font-medium" style={{ color: "#8A6A1A" }}>
                          {s.label}
                        </span>
                      </div>
                      {i < approvalStages.length - 1 && (
                        <ChevronRight size={12} style={{ color: P.gold }} />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Training Details */}
        {step === 2 && (
          <div className="space-y-5">
            <h2
              className="text-base font-bold"
              style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", color: P.text }}
            >
              Training Details
            </h2>
            {submitter === "manager" && (
              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Employee Name"
                  options={[
                    "Marcus Johnson",
                    "Priya Nair",
                    "Carlos Mendez",
                    "Luca Ferrari",
                    "Mei Lin",
                  ]}
                  required
                />
                <Input label="Employee ID" placeholder="EMP-0001" />
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <EditableSelect
                label="Department"
                options={tnaDepartments}
                value={tnaDepartment}
                onChange={setTnaDepartment}
                onAdd={(value) => setTnaDepartments((departments) => [...departments, value])}
                required
              />
              <EditableSelect
                label="Work Unit"
                options={tnaWorkUnits}
                value={tnaWorkUnit}
                onChange={setTnaWorkUnit}
                onAdd={(value) => setTnaWorkUnits((workUnits) => [...workUnits, value])}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <EditableSelect
                label="Role / Job Title"
                options={tnaJobTitles}
                value={tnaJobTitle}
                onChange={setTnaJobTitle}
                onAdd={(value) => setTnaJobTitles((jobTitles) => [...jobTitles, value])}
                required
              />
              <EditableSelect
                label="Competency Gap Area"
                options={tnaCompetencyGapAreas}
                value={tnaCompetencyGap}
                onChange={setTnaCompetencyGap}
                onAdd={(value) => setTnaCompetencyGapAreas((areas) => [...areas, value])}
                required
              />
            </div>
            <Select
              label="Preferred Training Format"
              options={[
                "Online Self-Paced",
                "Instructor-Led (Virtual)",
                "Instructor-Led (In-Person)",
                "Workshop",
                "Conference",
                "Certification Program",
              ]}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Preferred Start Date" type="date" />
              <Input label="Target Completion Date" type="date" />
            </div>
          </div>
        )}

        {/* Step 3: Description */}
        {step === 3 && (
          <div className="space-y-5">
            <h2
              className="text-base font-bold"
              style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", color: P.text }}
            >
              Training Need Description
            </h2>
            <Input
              label="Training Program / Course Name"
              placeholder="e.g. AWS Cloud Practitioner Certification"
              required
            />
            <Input label="Vendor / Provider" placeholder="e.g. AWS, Coursera, LinkedIn Learning" />
            <Textarea
              label="Competency Gap Description"
              placeholder="Describe the specific skill or knowledge gap that this training addresses…"
              rows={3}
              required
            />
            <Textarea
              label="Business Justification"
              placeholder="Explain how this training supports your role, team objectives, or company goals…"
              rows={3}
              required
            />
            <Textarea
              label="Expected Outcomes"
              placeholder="What will you be able to do after completing this training?"
              rows={2}
            />
            <div>
              <p className="text-xs font-semibold mb-2" style={{ color: P.textMid }}>
                Priority Level
              </p>
              <div className="flex gap-2">
                {["Low", "Medium", "High", "Critical"].map((p) => (
                  <button
                    key={p}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium border"
                    style={{
                      borderColor: p === "High" ? P.olive : P.border,
                      background: p === "High" ? P.lightSage : "white",
                      color: p === "High" ? P.olive : P.textMid,
                    }}
                    data-prototype-action="true"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Budget & Approval (Paid only) */}
        {step === 4 && requestType === "paid" && (
          <div className="space-y-5">
            <h2
              className="text-base font-bold"
              style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", color: P.text }}
            >
              Budget & Approval Details
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Training Cost (USD)" type="number" placeholder="0.00" required />
              <Input label="Cost Center Code" placeholder="CC-ENG-001" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="GL Account Code" placeholder="7001-Training" />
              <Input label="PO Number (if existing)" placeholder="PO-2025-XXXX" />
            </div>
            <Select
              label="Budget Period"
              options={["Q1 FY2025", "Q2 FY2025", "Q3 FY2025", "Q4 FY2025", "FY2026"]}
              required
            />
            <Textarea
              label="Budget Justification"
              placeholder="Provide justification for the budget allocation including ROI expectations…"
              rows={3}
              required
            />

            {/* Approval chain status */}
            <div
              className="p-4 rounded-xl border"
              style={{ background: P.paleGreen, borderColor: P.sage + "60" }}
            >
              <p className="text-xs font-semibold mb-3" style={{ color: P.darkOlive }}>
                Approval Pipeline — Paid Request
              </p>
              <div className="space-y-2.5">
                {[
                  {
                    label: "Line Manager Approval",
                    name: "Your direct manager will be notified",
                    status: "auto",
                  },
                  {
                    label: "HR Review & Validation",
                    name: "HR L&D team assesses alignment",
                    status: "auto",
                  },
                  {
                    label: "CEO / C-Suite Approval",
                    name: "Required for all paid training requests",
                    status: "auto",
                  },
                ].map(({ label, name, status }, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-2.5 bg-white rounded-lg"
                    style={{ border: `1px solid ${P.border}` }}
                  >
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 mt-0.5"
                      style={{ background: P.olive }}
                    >
                      {i + 1}
                    </div>
                    <div>
                      <p className="text-xs font-semibold" style={{ color: P.text }}>
                        {label}
                      </p>
                      <p className="text-[10px]" style={{ color: P.textMuted }}>
                        {name}
                      </p>
                    </div>
                    <Badge label="Auto-notified" variant="sage" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-5">
        <button
          onClick={() => step > 1 && setStep(step - 1)}
          disabled={step === 1}
          className="px-5 py-2.5 rounded-xl text-sm font-medium disabled:opacity-40"
          style={{ border: `1px solid ${P.border}`, color: P.textMid }}
        >
          ← Previous
        </button>
        <div className="flex items-center gap-2">
          <span className="text-xs" style={{ color: P.textMuted }}>
            Step {step} of {totalSteps}
          </span>
          {step < totalSteps ? (
            <button
              onClick={() => setStep(step + 1)}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white"
              style={{ background: P.olive }}
            >
              Continue →
            </button>
          ) : (
            <button
              onClick={() => navigate("tna-agg")}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white"
              style={{ background: P.olive }}
            >
              Submit Request ✓
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 2. TNA AGGREGATION DASHBOARD
// ─────────────────────────────────────────────────────────────
