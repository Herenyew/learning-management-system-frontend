import React, { useEffect, useState } from "react";
import {
  AlertCircle,
  Award,
  Bookmark,
  BookOpen,
  Building,
  CheckCircle,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Clock,
  Download,
  Globe,
  HelpCircle,
  Lock,
  MessageSquare,
  Play,
  Send,
  Share2,
  Star,
  ThumbsUp,
  Users,
  X,
} from "lucide-react";
import { AICard, Av, Chip, PBar } from "../../components/common";
import { COURSE_CONTACT } from "../../constants/courseMetadata.constants";
import { COURSES, QUIZ_QUESTIONS } from "../../constants/mockData";
import { P } from "../../constants/theme.constants";
import type { Course, NavigateFn } from "../../models/app.model";
import { ReviewsTab } from "./CourseReviewsTab";

export function CourseAssessmentModal({
  mode,
  courseTitle,
  skippable = false,
  onClose,
  onSkip,
  onComplete,
}: {
  mode: "pre" | "post";
  courseTitle: string;
  skippable?: boolean;
  onClose: () => void;
  onSkip?: () => void;
  onComplete: (score: number) => void;
}) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === QUIZ_QUESTIONS.length;
  const score = Math.round(
    (QUIZ_QUESTIONS.filter((question, index) => answers[index] === question.correct).length /
      QUIZ_QUESTIONS.length) *
      100,
  );
  const isPost = mode === "post";
  const preAssessmentDescription = skippable
    ? "Optional baseline quiz to measure your starting knowledge before enrollment."
    : "Mandatory baseline quiz required before enrollment.";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(46,58,21,0.7)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-2xl bg-white border shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        style={{ borderColor: P.border }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex items-start justify-between gap-4 p-5"
          style={{ borderBottom: `1px solid ${P.border}` }}
        >
          <div>
            <p className="text-base font-bold" style={{ color: P.text }}>
              {isPost ? "Post-course Assessment" : "Pre-course Baseline Assessment"}
            </p>
            <p className="text-xs mt-1" style={{ color: P.textMuted }}>
              {isPost
                ? "Complete this assessment before the certificate is issued."
                : preAssessmentDescription}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#F6FEFA]" type="button">
            <X size={16} style={{ color: P.textMuted }} />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-4">
          <div
            className="rounded-xl border p-3 flex items-center justify-between gap-3"
            style={{ background: P.bg, borderColor: P.border }}
          >
            <div>
              <p className="text-xs font-semibold" style={{ color: P.text }}>
                {courseTitle}
              </p>
              <p className="text-[10px] mt-0.5" style={{ color: P.textMuted }}>
                {isPost
                  ? "Final score is recorded for certificate eligibility."
                  : "Baseline score is stored separately from pass/fail course grading."}
              </p>
            </div>
            <Chip
              label={submitted ? `${score}%` : `${answeredCount}/${QUIZ_QUESTIONS.length}`}
              variant={submitted ? (score >= 70 ? "green" : "gold") : "sage"}
            />
          </div>

          {QUIZ_QUESTIONS.map((question, questionIndex) => (
            <div
              key={question.q}
              className="rounded-xl border p-4"
              style={{ borderColor: P.border, background: "white" }}
            >
              <p className="text-xs font-semibold mb-3" style={{ color: P.text }}>
                {questionIndex + 1}. {question.q}
              </p>
              <div className="space-y-2">
                {question.options.map((option, optionIndex) => {
                  const selected = answers[questionIndex] === optionIndex;
                  const correct = submitted && question.correct === optionIndex;
                  const wrong = submitted && selected && question.correct !== optionIndex;
                  return (
                    <button
                      key={option}
                      type="button"
                      disabled={submitted}
                      onClick={() =>
                        setAnswers((current) => ({ ...current, [questionIndex]: optionIndex }))
                      }
                      className="w-full rounded-lg border px-3 py-2 text-left text-xs transition-colors"
                      style={{
                        borderColor: correct
                          ? "#86C88A"
                          : wrong
                            ? "#F5A3A3"
                            : selected
                              ? P.olive
                              : P.border,
                        background: correct
                          ? "#F0FAF0"
                          : wrong
                            ? "#FEF2F2"
                            : selected
                              ? P.lightSage
                              : P.bg,
                        color: wrong ? "#B91C1C" : P.textMid,
                      }}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {submitted && (
            <div
              className="rounded-xl border p-4"
              style={{
                borderColor: score >= 70 ? "#B6D9B6" : P.goldMid,
                background: score >= 70 ? "#F0FAF0" : P.goldLight,
              }}
            >
              <p
                className="text-sm font-semibold"
                style={{ color: score >= 70 ? "#3D6B3D" : "#7A5A10" }}
              >
                {isPost
                  ? score >= 70
                    ? "Assessment passed. Certificate can be issued."
                    : "Assessment recorded. Retake can be configured by HR."
                  : "Baseline recorded. Enrollment can continue."}
              </p>
              <p className="text-xs mt-1" style={{ color: score >= 70 ? "#3D6B3D" : "#7A5A10" }}>
                Score: {score}% -{" "}
                {score >= 70 ? "Meets certificate threshold" : "Below 70% threshold"}
              </p>
            </div>
          )}
        </div>

        <div
          className="flex flex-wrap justify-end gap-2 p-5"
          style={{ borderTop: `1px solid ${P.border}`, background: P.bg }}
        >
          {!submitted && skippable && onSkip && (
            <button
              type="button"
              onClick={onSkip}
              className="px-4 py-2 rounded-lg text-xs font-semibold"
              style={{ border: `1px solid ${P.border}`, color: P.textMid, background: "white" }}
            >
              Skip Baseline and Enroll
            </button>
          )}
          {!submitted ? (
            <button
              type="button"
              onClick={() => setSubmitted(true)}
              disabled={!allAnswered}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-white"
              style={{
                background: allAnswered ? P.olive : P.sage,
                opacity: allAnswered ? 1 : 0.65,
              }}
            >
              Submit {isPost ? "Post-course Assessment" : "Baseline Assessment"}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onComplete(score)}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-white"
              style={{ background: P.olive }}
            >
              {isPost ? "Unlock Certificate" : "Enroll and Start Course"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function CourseDetailScreen({
  navigate,
  selectedCourseId,
  courses,
}: {
  navigate: NavigateFn;
  selectedCourseId: string;
  courses: Course[];
}) {
  const course = courses.find((c) => c.id === selectedCourseId) ?? courses[0] ?? COURSES[0];
  const preCourseAssessment = course.preCourseAssessment ?? "optional";
  const preAssessmentEnabled = preCourseAssessment !== "disabled";
  const preAssessmentMandatory = preCourseAssessment === "mandatory";
  const [tab, setTab] = useState<"overview" | "curriculum" | "instructor" | "reviews" | "contact">(
    "overview",
  );
  const [openMod, setOpenMod] = useState<number | null>(0);
  const [locallyEnrolled, setLocallyEnrolled] = useState(false);
  const [showPreAssessment, setShowPreAssessment] = useState(false);
  const [baselineStatus, setBaselineStatus] = useState<
    "not-started" | "skipped" | "completed" | "not-required"
  >(course.isEnrolled ? "completed" : preAssessmentEnabled ? "not-started" : "not-required");
  const [baselineScore, setBaselineScore] = useState<number | null>(null);
  const isEnrolled = course.isEnrolled || locallyEnrolled;
  const displayedProgress = course.isEnrolled ? course.progress : 0;
  const baselineLabel =
    baselineStatus === "completed"
      ? `${baselineScore ?? 82}%`
      : baselineStatus === "skipped"
        ? "Skipped"
        : baselineStatus === "not-required"
          ? "Not required"
          : preAssessmentMandatory
            ? "Mandatory"
            : "Optional";
  const baselineVariant =
    baselineStatus === "completed"
      ? "green"
      : baselineStatus === "not-required"
        ? "neutral"
        : preAssessmentMandatory
          ? "red"
          : "gold";
  const startEnrollmentOrCourse = () => {
    if (isEnrolled) {
      navigate("player");
      return;
    }

    if (!preAssessmentEnabled) {
      setBaselineStatus("not-required");
      setLocallyEnrolled(true);
      return;
    }

    setShowPreAssessment(true);
  };

  useEffect(() => {
    setLocallyEnrolled(false);
    setShowPreAssessment(false);
    setBaselineScore(null);
    setBaselineStatus(
      course.isEnrolled ? "completed" : preAssessmentEnabled ? "not-started" : "not-required",
    );
  }, [course.id, course.isEnrolled, preAssessmentEnabled]);

  const modules = [
    {
      title: "Module 1: AI Foundations for Business",
      lessons: [
        "What is Artificial Intelligence?",
        "AI vs ML vs Deep Learning",
        "Business Applications Overview",
        "Quiz: AI Fundamentals",
      ],
    },
    {
      title: "Module 2: Machine Learning Concepts",
      lessons: [
        "Supervised vs Unsupervised Learning",
        "Model Training Lifecycle",
        "Overfitting & Regularization",
        "Hands-on Demo",
        "Assessment",
      ],
    },
    {
      title: "Module 3: AI Strategy & Implementation",
      lessons: [
        "Building an AI Roadmap",
        "Data Requirements",
        "Change Management",
        "Case Study",
        "Final Project",
      ],
    },
    {
      title: "Module 4: Ethics & Responsible AI",
      lessons: [
        "Bias in AI Systems",
        "Fairness & Transparency",
        "Regulatory Landscape",
        "Ethical AI Frameworks",
      ],
    },
  ];

  return (
    <div className="max-w-[1200px] mx-auto p-6">
      {showPreAssessment && (
        <CourseAssessmentModal
          mode="pre"
          courseTitle={course.title}
          skippable={!preAssessmentMandatory}
          onClose={() => setShowPreAssessment(false)}
          onSkip={() => {
            setLocallyEnrolled(true);
            setBaselineStatus("skipped");
            setShowPreAssessment(false);
          }}
          onComplete={(score) => {
            setBaselineScore(score);
            setBaselineStatus("completed");
            setLocallyEnrolled(true);
            setShowPreAssessment(false);
          }}
        />
      )}
      <button
        onClick={() => navigate("catalog")}
        className="flex items-center gap-1.5 text-sm mb-5"
        style={{ color: P.textMuted }}
      >
        <ChevronLeft size={16} /> Back to Catalog
      </button>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <div
            className="rounded-2xl p-8 text-white relative overflow-hidden"
            style={{ background: `linear-gradient(135deg, ${course.color}, ${P.darkOlive})` }}
          >
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <Chip label={course.category} variant="sage" />
                <Chip label={course.level} variant="gold" />
                {course.mandatory && <Chip label="Mandatory" variant="red" />}
              </div>
              <h1
                className="text-2xl font-bold mb-3 leading-tight"
                style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}
              >
                {course.title}
              </h1>
              <p className="text-sm mb-4 max-w-xl" style={{ color: "rgba(231,238,220,0.85)" }}>
                Build a strategic understanding of AI and ML to lead AI-driven initiatives with
                confidence.
              </p>
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <span className="flex items-center gap-1">
                  <Star size={14} className="fill-amber-300 text-amber-300" /> {course.rating} (847
                  reviews)
                </span>
                <span className="flex items-center gap-1">
                  <Users size={14} /> {course.enrolled.toLocaleString()} learners
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={14} /> {course.duration}
                </span>
              </div>
            </div>
          </div>

          <div
            className="bg-white rounded-xl border overflow-hidden"
            style={{ borderColor: P.border }}
          >
            <div className="flex" style={{ borderBottom: `1px solid ${P.border}` }}>
              {(["overview", "curriculum", "instructor", "reviews", "contact"] as const).map(
                (t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className="flex-1 py-3 text-xs font-semibold capitalize transition-colors"
                    style={
                      tab === t
                        ? {
                            color: P.olive,
                            borderBottom: `2px solid ${P.olive}`,
                            background: P.lightSage,
                          }
                        : { color: P.textMuted }
                    }
                  >
                    {t}
                  </button>
                ),
              )}
            </div>
            <div className="p-5">
              {tab === "overview" && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold mb-2" style={{ color: P.text }}>
                      What you'll learn
                    </h3>
                    <div className="grid sm:grid-cols-2 gap-2">
                      {[
                        "Understand core AI/ML concepts and business applications",
                        "Build an AI strategy roadmap for your organization",
                        "Navigate ethical considerations and regulatory landscape",
                        "Lead cross-functional AI implementation teams",
                        "Evaluate AI vendor solutions",
                        "Measure AI ROI and communicate results",
                      ].map((item) => (
                        <div key={item} className="flex items-start gap-2">
                          <CheckCircle
                            size={14}
                            className="mt-0.5 flex-shrink-0"
                            style={{ color: "#5A7A2A" }}
                          />
                          <p className="text-xs" style={{ color: P.textMid }}>
                            {item}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <AICard title="AI Course Summary">
                    <p className="text-xs leading-relaxed" style={{ color: "#7A5A10" }}>
                      This course is highly relevant to your current role. Completing it would close
                      a key skill gap and aligns with ADIU Communication Service PLC's Q1 digital
                      transformation goals. 84% of Senior Engineers at L8+ have completed this or
                      equivalent.
                    </p>
                  </AICard>

                  {/* Prerequisites */}
                  <div
                    className="p-4 rounded-xl"
                    style={{ background: P.bg, border: `1px solid ${P.border}` }}
                  >
                    <p
                      className="text-xs font-semibold mb-2 flex items-center gap-1.5"
                      style={{ color: P.text }}
                    >
                      <Lock size={13} style={{ color: P.olive }} /> Prerequisites
                    </p>
                    <div className="space-y-1.5">
                      {[
                        { title: "Data Fundamentals for Business", status: "Completed" },
                        { title: "Introduction to Digital Strategy", status: "Recommended" },
                      ].map(({ title, status }) => (
                        <div key={title} className="flex items-center justify-between">
                          <p className="text-xs" style={{ color: P.textMid }}>
                            {title}
                          </p>
                          <Chip
                            label={status}
                            variant={status === "Completed" ? "green" : "gold"}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Attendance Policy */}
                  <div
                    className="p-4 rounded-xl"
                    style={{ background: P.bg, border: `1px solid ${P.border}` }}
                  >
                    <p className="text-xs font-semibold mb-1.5" style={{ color: P.text }}>
                      Attendance Policy
                    </p>
                    <p className="text-xs leading-relaxed" style={{ color: P.textMid }}>
                      Learners must complete at least <strong>80% of video content</strong> and pass
                      the final assessment with a minimum score of 70% to receive a certificate.
                      Self-paced — no mandatory session attendance required.
                    </p>
                    <p className="text-xs mt-2" style={{ color: P.textMuted }}>
                      📧 Contact: {COURSE_CONTACT["1"]}
                    </p>
                  </div>
                </div>
              )}
              {tab === "curriculum" && (
                <div className="space-y-2">
                  {modules.map((mod, mi) => (
                    <div
                      key={mi}
                      className="border rounded-lg overflow-hidden"
                      style={{ borderColor: P.border }}
                    >
                      <button
                        onClick={() => setOpenMod(openMod === mi ? null : mi)}
                        className="w-full flex items-center justify-between p-3.5 text-left"
                        style={{ background: openMod === mi ? P.paleGreen : "white" }}
                      >
                        <div>
                          <p className="text-xs font-semibold" style={{ color: P.text }}>
                            {mod.title}
                          </p>
                          <p className="text-[11px] mt-0.5" style={{ color: P.textMuted }}>
                            {mod.lessons.length} lessons
                          </p>
                        </div>
                        {openMod === mi ? (
                          <ChevronUp size={15} style={{ color: P.sage }} />
                        ) : (
                          <ChevronDown size={15} style={{ color: P.sage }} />
                        )}
                      </button>
                      {openMod === mi && (
                        <div style={{ borderTop: `1px solid ${P.border}` }}>
                          {mod.lessons.map((lesson, li) => (
                            <div
                              key={li}
                              onClick={startEnrollmentOrCourse}
                              className="flex items-center gap-3 px-4 py-2.5 cursor-pointer"
                              style={{ borderBottom: `1px solid ${P.border}40` }}
                            >
                              <div
                                className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                                style={{ background: P.lightSage }}
                              >
                                {lesson.includes("Quiz") || lesson.includes("Assessment") ? (
                                  <HelpCircle size={12} style={{ color: P.olive }} />
                                ) : (
                                  <Play size={11} style={{ color: P.olive }} />
                                )}
                              </div>
                              <p className="text-xs flex-1" style={{ color: P.textMid }}>
                                {lesson}
                              </p>
                              <span
                                className="text-[10px] font-mono"
                                style={{ color: P.textMuted }}
                              >
                                15 min
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {tab === "instructor" && (
                <div className="flex items-start gap-4">
                  <Av initials="SC" size={64} color={P.olive} />
                  <div>
                    <p className="text-sm font-bold" style={{ color: P.text }}>
                      Dr. Sarah Chen
                    </p>
                    <p className="text-xs mb-2" style={{ color: P.textMuted }}>
                      AI Research Director · Former Google Brain · Stanford PhD
                    </p>
                    <div
                      className="flex items-center gap-3 text-xs mb-3"
                      style={{ color: P.textMuted }}
                    >
                      <span className="flex items-center gap-1">
                        <Star size={11} className="text-amber-500 fill-amber-500" /> 4.9
                      </span>
                      <span className="flex items-center gap-1">
                        <Users size={11} /> 48,200
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen size={11} /> 12 courses
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed" style={{ color: P.textMid }}>
                      Dr. Chen brings 15 years of AI research and enterprise implementation
                      experience. She has led AI transformation at 3 Fortune 100 companies.
                    </p>
                  </div>
                </div>
              )}
              {tab === "reviews" && <ReviewsTab isEnrolled={isEnrolled} />}
              {tab === "contact" && (
                <div className="space-y-5">
                  {/* Primary contact */}
                  <div>
                    <p className="text-xs font-semibold mb-3" style={{ color: P.text }}>
                      Course Coordinator
                    </p>
                    <div
                      className="flex items-start gap-4 p-4 rounded-xl"
                      style={{ background: P.bg, border: `1px solid ${P.border}` }}
                    >
                      <Av initials="SC" size={48} color={P.olive} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold" style={{ color: P.text }}>
                          Dr. Sarah Chen
                        </p>
                        <p className="text-xs mb-3" style={{ color: P.textMuted }}>
                          AI Research Director · Course Owner
                        </p>
                        <div className="space-y-2">
                          <a
                            href="mailto:sarah.chen@adiu.com"
                            className="flex items-center gap-2 text-xs group"
                            style={{ color: P.textMid }}
                          >
                            <div
                              className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
                              style={{ background: P.lightSage }}
                            >
                              <MessageSquare size={11} style={{ color: P.olive }} />
                            </div>
                            <span className="group-hover:underline">sarah.chen@adiu.com</span>
                          </a>
                          <div
                            className="flex items-center gap-2 text-xs"
                            style={{ color: P.textMid }}
                          >
                            <div
                              className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
                              style={{ background: P.lightSage }}
                            >
                              <Building size={11} style={{ color: P.olive }} />
                            </div>
                            <span>AI Center of Excellence · Building 4, Floor 3</span>
                          </div>
                          <div
                            className="flex items-center gap-2 text-xs"
                            style={{ color: P.textMid }}
                          >
                            <div
                              className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
                              style={{ background: P.lightSage }}
                            >
                              <Clock size={11} style={{ color: P.olive }} />
                            </div>
                            <span>Office hours: Mon–Wed, 2pm – 4pm</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* L&D support */}
                  <div>
                    <p className="text-xs font-semibold mb-3" style={{ color: P.text }}>
                      L&D Support Team
                    </p>
                    <div
                      className="p-4 rounded-xl space-y-3"
                      style={{ background: P.bg, border: `1px solid ${P.border}` }}
                    >
                      {[
                        {
                          name: "L&D Helpdesk",
                          role: "General enquiries & enrollment support",
                          email: "l&d@adiu.com",
                          initials: "LD",
                          color: P.sage,
                        },
                        {
                          name: "Compliance Training",
                          role: "Mandatory course waivers & exemptions",
                          email: "compliance@adiu.com",
                          initials: "CT",
                          color: "#C0392B",
                        },
                      ].map(({ name, role, email, initials, color }, index, contacts) => (
                        <div
                          key={name}
                          className="flex items-center gap-3 pb-3 last:pb-0"
                          style={{
                            borderBottom:
                              index === contacts.length - 1 ? "none" : `1px solid ${P.border}`,
                          }}
                        >
                          <Av initials={initials} size={36} color={color} />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold" style={{ color: P.text }}>
                              {name}
                            </p>
                            <p className="text-[11px]" style={{ color: P.textMuted }}>
                              {role}
                            </p>
                          </div>
                          <a
                            href={`mailto:${email}`}
                            className="text-[11px] font-medium px-2.5 py-1 rounded-lg flex-shrink-0"
                            style={{ background: P.lightSage, color: P.darkOlive }}
                          >
                            Email
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Escalation note */}
                  <div
                    className="flex items-start gap-2.5 p-3.5 rounded-xl"
                    style={{ background: P.goldLight, border: `1px solid ${P.gold}40` }}
                  >
                    <AlertCircle size={14} style={{ color: P.gold, flexShrink: 0, marginTop: 1 }} />
                    <p className="text-xs leading-relaxed" style={{ color: "#7A5A10" }}>
                      For urgent deadline extensions or technical issues, contact your line manager
                      who can escalate directly to the L&D team.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div
            className="bg-white rounded-xl border p-5 sticky top-6"
            style={{ borderColor: P.border }}
          >
            {/* Capacity indicator */}
            <div
              className="flex items-center justify-between mb-3 pb-3"
              style={{ borderBottom: `1px solid ${P.border}` }}
            >
              <div>
                <p className="text-xs font-semibold" style={{ color: P.text }}>
                  Capacity
                </p>
                <p className="text-[10px]" style={{ color: P.textMuted }}>
                  847 / 1,000 enrolled
                </p>
              </div>
              <div>
                <PBar value={84.7} color={P.olive} height={5} />
                <p className="text-[10px] mt-0.5 text-right" style={{ color: "#5A7A2A" }}>
                  153 spots left
                </p>
              </div>
            </div>
            <div className="mb-4">
              <p className="text-xs mb-1" style={{ color: P.textMuted }}>
                {isEnrolled ? "Your progress" : "Enrollment status"}
              </p>
              {isEnrolled ? (
                <>
                  <PBar value={displayedProgress} color={course.color} height={8} />
                  <p className="text-xs mt-1" style={{ color: P.textMuted }}>
                    {displayedProgress}% complete
                  </p>
                </>
              ) : (
                <p
                  className="text-xs rounded-lg px-3 py-2"
                  style={{ color: "#7A5A10", background: P.goldLight }}
                >
                  Not enrolled yet. Enroll first to access lessons and leave a course rating.
                </p>
              )}
            </div>
            <div
              className="mb-3 rounded-xl border p-3 space-y-2"
              style={{ borderColor: P.border, background: P.bg }}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <HelpCircle size={13} style={{ color: P.olive }} />
                  <span className="text-xs font-semibold" style={{ color: P.text }}>
                    Pre-course baseline
                  </span>
                </div>
                <Chip label={baselineLabel} variant={baselineVariant} />
              </div>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Award size={13} style={{ color: P.olive }} />
                  <span className="text-xs font-semibold" style={{ color: P.text }}>
                    Certificate gate
                  </span>
                </div>
                <Chip label="Post-assessment required" variant="sage" />
              </div>
            </div>
            <button
              onClick={startEnrollmentOrCourse}
              className="w-full py-2.5 rounded-xl text-sm font-semibold text-white mb-2 flex items-center justify-center gap-2"
              style={{ background: course.color }}
            >
              <Play size={15} className="fill-white" />{" "}
              {isEnrolled
                ? displayedProgress > 0
                  ? "Resume Course"
                  : "Start Course"
                : "Enroll Course"}
            </button>
            <button
              className="w-full py-2 rounded-xl text-xs font-medium mb-2.5"
              style={{ border: `1px solid ${P.border}`, color: P.textMid }}
              data-prototype-action="true"
            >
              Join Waitlist (If Full)
            </button>
            <div className="flex gap-2">
              <button
                className="flex-1 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5"
                style={{ border: `1px solid ${P.border}`, color: P.textMid }}
                data-prototype-action="true"
              >
                <Bookmark size={13} /> Save
              </button>
              <button
                className="flex-1 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5"
                style={{ border: `1px solid ${P.border}`, color: P.textMid }}
                data-prototype-action="true"
              >
                <Share2 size={13} /> Share
              </button>
            </div>
            <div className="mt-4 pt-4 space-y-2" style={{ borderTop: `1px solid ${P.border}` }}>
              {(
                [
                  ["Certificate of Completion", CheckCircle],
                  ["Downloadable Resources", Download],
                  ["Full Lifetime Access", Lock],
                  ["Mobile & Desktop", Globe],
                ] as [string, React.ElementType][]
              ).map(([label, Icon]) => (
                <div
                  key={label}
                  className="flex items-center gap-2 text-xs"
                  style={{ color: P.textMid }}
                >
                  <Icon size={13} style={{ color: "#5A7A2A" }} /> {label}
                </div>
              ))}
            </div>
          </div>
          <AICard title="Skill Impact Analysis">
            <p className="text-xs mb-2" style={{ color: "#7A5A10" }}>
              Completing this course will boost:
            </p>
            {[
              ["AI Strategy", "+34%"],
              ["Data Literacy", "+28%"],
              ["Digital Leadership", "+22%"],
            ].map(([skill, boost]) => (
              <div key={skill} className="flex items-center justify-between text-xs mb-1.5">
                <span style={{ color: P.textMid }}>{skill}</span>
                <span className="font-semibold" style={{ color: "#5A7A2A" }}>
                  {boost}
                </span>
              </div>
            ))}
          </AICard>
        </div>
      </div>
    </div>
  );
}
