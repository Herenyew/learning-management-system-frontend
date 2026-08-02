import React from "react";
import { Award, BookOpen, CheckCircle, HelpCircle, Zap } from "lucide-react";
import { Chip, PBar } from "../../components/common";
import { COURSE_XP } from "../../constants/courseMetadata.constants";
import { COURSES } from "../../constants/mockData";
import { P } from "../../constants/theme.constants";
import type { NavigateFn } from "../../models/app.model";
import { PROFILE_CERTS, quizAttemptHistory } from "./profile.data";

export function ProfileProgressReportTab({ navigate }: { navigate: NavigateFn }) {
  const completedCourses = COURSES.filter((course) => course.isEnrolled && course.progress === 100);
  const pendingCourses = COURSES.filter((course) => course.isEnrolled && course.progress < 100);
  const activeCertificates = PROFILE_CERTS.filter((cert) => !cert.expired);
  const totalLearnerXp = 11250;
  const nextLevelXp = 14000;
  const courseXpEarned = COURSES.filter((course) => course.isEnrolled).reduce(
    (sum, course) => sum + Math.round((COURSE_XP[course.id] ?? 0) * (course.progress / 100)),
    0,
  );
  const passedAttempts = quizAttemptHistory.filter((attempt) => attempt.pass).length;

  return (
    <div className="space-y-5">
      <section className="grid sm:grid-cols-2 xl:grid-cols-4 gap-3">
        {[
          {
            label: "Completed Courses",
            value: completedCourses.length,
            sub: `${pendingCourses.length} pending`,
            icon: CheckCircle,
            color: "#5A7A2A",
          },
          {
            label: "Active Certifications",
            value: activeCertificates.length,
            sub: `${PROFILE_CERTS.length - activeCertificates.length} expired`,
            icon: Award,
            color: P.gold,
          },
          {
            label: "Total XP",
            value: totalLearnerXp.toLocaleString(),
            sub: `${nextLevelXp - totalLearnerXp} XP to Level 9`,
            icon: Zap,
            color: P.darkOlive,
          },
          {
            label: "Quiz Attempts",
            value: quizAttemptHistory.length,
            sub: `${passedAttempts} passed`,
            icon: HelpCircle,
            color: "#4A7A5A",
          },
        ].map(({ label, value, sub, icon: Icon, color }) => (
          <div
            key={label}
            className="bg-white rounded-xl border p-4"
            style={{ borderColor: P.border }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center mb-3"
              style={{ background: `${color}18` }}
            >
              <Icon size={16} style={{ color }} />
            </div>
            <p className="text-2xl font-bold" style={{ color: P.text }}>
              {value}
            </p>
            <p className="text-[11px] font-semibold mt-0.5" style={{ color: P.textMid }}>
              {label}
            </p>
            <p className="text-[10px] mt-1" style={{ color: P.textMuted }}>
              {sub}
            </p>
          </div>
        ))}
      </section>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <CourseListPanel
            title="Completed Courses"
            courses={completedCourses}
            navigate={navigate}
          />
          <CourseListPanel title="Pending Courses" courses={pendingCourses} navigate={navigate} />
          <QuizAttemptsTable />
        </div>

        <div className="space-y-5">
          <section className="bg-white rounded-xl border p-5" style={{ borderColor: P.border }}>
            <p className="text-sm font-semibold mb-3" style={{ color: P.text }}>
              XP Progress
            </p>
            <div className="rounded-xl p-4 mb-3" style={{ background: P.bg }}>
              <div className="flex items-end justify-between mb-2">
                <div>
                  <p className="text-2xl font-bold" style={{ color: P.text }}>
                    {totalLearnerXp.toLocaleString()}
                  </p>
                  <p className="text-[11px]" style={{ color: P.textMuted }}>
                    Total XP
                  </p>
                </div>
                <p className="text-xs font-semibold" style={{ color: P.olive }}>
                  Level 8
                </p>
              </div>
              <PBar value={(totalLearnerXp / nextLevelXp) * 100} color={P.olive} height={7} />
              <p className="text-[10px] mt-2" style={{ color: P.textMuted }}>
                {nextLevelXp - totalLearnerXp} XP remaining to Level 9.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                ["Course XP Earned", courseXpEarned.toLocaleString()],
                [
                  "Attempt Pass Rate",
                  `${Math.round((passedAttempts / quizAttemptHistory.length) * 100)}%`,
                ],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg p-3" style={{ background: P.bg }}>
                  <p className="text-xs font-bold" style={{ color: P.text }}>
                    {value}
                  </p>
                  <p className="text-[10px]" style={{ color: P.textMuted }}>
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white rounded-xl border p-5" style={{ borderColor: P.border }}>
            <p className="text-sm font-semibold mb-3" style={{ color: P.text }}>
              Certifications
            </p>
            <div className="space-y-2">
              {PROFILE_CERTS.map((cert) => (
                <div
                  key={cert.id}
                  className="flex items-center justify-between gap-3 rounded-lg p-3"
                  style={{ background: P.bg, border: `1px solid ${P.border}` }}
                >
                  <div className="min-w-0">
                    <p className="text-xs font-semibold truncate" style={{ color: P.text }}>
                      {cert.course}
                    </p>
                    <p className="text-[10px]" style={{ color: P.textMuted }}>
                      Score {cert.score}% - Expires {cert.expires}
                    </p>
                  </div>
                  <Chip
                    label={cert.expired ? "Expired" : "Active"}
                    variant={cert.expired ? "neutral" : "green"}
                  />
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function CourseListPanel({
  title,
  courses,
  navigate,
}: {
  title: string;
  courses: typeof COURSES;
  navigate: NavigateFn;
}) {
  return (
    <section className="bg-white rounded-xl border p-5" style={{ borderColor: P.border }}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm font-semibold" style={{ color: P.text }}>
            {title}
          </p>
          <p className="text-[11px]" style={{ color: P.textMuted }}>
            Course-level status and participation.
          </p>
        </div>
        <Chip
          label={`${courses.length} courses`}
          variant={title.includes("Completed") ? "green" : "gold"}
        />
      </div>
      <div className="space-y-2">
        {courses.map((course) => (
          <button
            type="button"
            key={course.id}
            onClick={() => navigate("course-detail", course.id)}
            aria-label={`Open details for ${course.title}`}
            className="w-full text-left rounded-lg p-3 transition-colors hover:bg-[#F6FEFA] focus:outline-none focus:ring-2 focus:ring-[#6EE7B7]"
            style={{ background: P.bg, border: `1px solid ${P.border}` }}
          >
            <div className="flex items-center justify-between gap-3 mb-2">
              <div className="flex items-center gap-3 min-w-0">
                <BookOpen size={15} style={{ color: course.color }} />
                <div className="min-w-0">
                  <p className="text-xs font-semibold truncate" style={{ color: P.text }}>
                    {course.title}
                  </p>
                  <p className="text-[10px]" style={{ color: P.textMuted }}>
                    {course.category} - {course.duration}
                  </p>
                </div>
              </div>
              <p className="text-xs font-bold" style={{ color: course.color }}>
                {course.progress}%
              </p>
            </div>
            <PBar value={course.progress} color={course.color} height={5} />
          </button>
        ))}
        {!courses.length && (
          <p className="text-xs text-center py-5" style={{ color: P.textMuted }}>
            No courses in this state.
          </p>
        )}
      </div>
    </section>
  );
}

function QuizAttemptsTable() {
  return (
    <section className="bg-white rounded-xl border p-5" style={{ borderColor: P.border }}>
      <p className="text-sm font-semibold mb-4" style={{ color: P.text }}>
        Quiz Attempts
      </p>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: `1px solid ${P.border}` }}>
              {["Quiz", "Course", "Score", "Attempt", "Status"].map((header) => (
                <th
                  key={header}
                  className="text-left py-2 text-[11px] font-semibold uppercase"
                  style={{ color: P.textMuted }}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {quizAttemptHistory.map(({ quiz, course, score, attempt, pass, date }) => (
              <tr key={`${quiz}-${date}`} style={{ borderBottom: `1px solid ${P.border}50` }}>
                <td className="py-2.5 pr-4">
                  <p className="text-xs font-semibold" style={{ color: P.text }}>
                    {quiz}
                  </p>
                  <p className="text-[10px]" style={{ color: P.textMuted }}>
                    {date}
                  </p>
                </td>
                <td className="py-2.5 pr-4">
                  <p className="text-xs" style={{ color: P.textMid }}>
                    {course}
                  </p>
                </td>
                <td className="py-2.5 pr-4">
                  <p className="text-xs font-bold" style={{ color: pass ? "#5A7A2A" : "#C0392B" }}>
                    {score}%
                  </p>
                </td>
                <td className="py-2.5 pr-4">
                  <p className="text-xs" style={{ color: P.textMuted }}>
                    #{attempt}
                  </p>
                </td>
                <td className="py-2.5">
                  <Chip label={pass ? "Pass" : "Fail"} variant={pass ? "green" : "red"} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
