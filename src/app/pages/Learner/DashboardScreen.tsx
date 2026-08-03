import {
  AlertCircle,
  Award,
  Bell,
  BookOpen,
  Calendar,
  CheckCircle,
  Clock,
  Flame,
  Play,
  Sparkles,
  User,
} from "lucide-react";
import { CourseCard } from "../../components/course";
import { COURSES } from "../../constants/mockData";
import { P } from "../../constants/theme.constants";
import type { NavigateFn } from "../../models/app.model";
import { AICard, Av, Chip, PBar, StatCard } from "../../components/common";

// ─── 2. DASHBOARD ─────────────────────────────────────────────

export function DashboardScreen({ navigate }: { navigate: NavigateFn }) {
  const inProgress = COURSES.filter((c) => c.progress > 0 && c.progress < 100);
  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      <div
        className="rounded-2xl p-6 text-white relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${P.darkOlive}, ${P.olive})` }}
      >
        <div
          className="absolute inset-0 opacity-8"
          style={{
            backgroundImage: `radial-gradient(circle at 85% 30%, ${P.gold}60, transparent 60%)`,
          }}
        />
        <div className="relative flex items-start justify-between">
          <div>
            <p className="text-sm font-medium mb-1" style={{ color: "rgba(231,238,220,0.8)" }}>
              Good morning ☀️
            </p>
            <h1
              className="text-2xl font-bold mb-2"
              style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}
            >
              Welcome back, Alex!
            </h1>
            <p className="text-sm max-w-lg" style={{ color: "rgba(231,238,220,0.85)" }}>
              You have <strong className="text-white">2 courses</strong> in progress and{" "}
              <strong className="text-white">1 deadline</strong> this week.
            </p>
            <div className="flex items-center gap-3 mt-4">
              <button
                onClick={() => navigate("catalog")}
                className="px-4 py-2 rounded-lg text-sm font-semibold"
                style={{ background: "white", color: P.darkOlive }}
              >
                Continue Learning
              </button>
              <button
                onClick={() => navigate("profile")}
                className="px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-1.5"
                style={{ background: "rgba(255,255,255,0.15)", color: "white" }}
              >
                <User size={14} /> My Profile
              </button>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-5 flex-shrink-0">
            {[
              ["11,250", "Total XP"],
              ["#4", "Company Rank"],
              ["🔥 14", "Day Streak"],
            ].map(([v, l]) => (
              <div key={l} className="text-center">
                <p
                  className="text-3xl font-bold"
                  style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}
                >
                  {v}
                </p>
                <p className="text-xs" style={{ color: "rgba(231,238,220,0.7)" }}>
                  {l}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Courses Completed"
          value="21"
          sub="+3 this month"
          icon={CheckCircle}
          color="#5A7A2A"
          bg="#D8EDCC"
          trend="up"
        />
        <StatCard
          label="Learning Hours"
          value="147h"
          sub="+12h this week"
          icon={Clock}
          color={P.olive}
          bg={P.lightSage}
          trend="up"
        />
        <StatCard
          label="Active Streak"
          value="14 days"
          sub="Personal best!"
          icon={Flame}
          color={P.gold}
          bg={P.goldLight}
          trend="up"
        />
        <StatCard
          label="Badges Earned"
          value="9"
          sub="2 this month"
          icon={Award}
          color="#8A6A1A"
          bg={P.goldMid}
          trend="up"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="space-y-4">
          <div className="bg-white rounded-xl border p-4" style={{ borderColor: P.border }}>
            <p
              className="text-xs font-semibold mb-3 flex items-center gap-1.5"
              style={{ color: P.text }}
            >
              <Bell size={13} style={{ color: P.olive }} /> Portal Announcements
            </p>
            <div className="space-y-2.5">
              {[
                {
                  title: "New certification path published",
                  meta: "Cybersecurity renewal track is now open",
                  tag: "Certification",
                  color: P.olive,
                },
                {
                  title: "Leadership cohort closes Friday",
                  meta: "15 seats left for Future Leaders Initiative",
                  tag: "Program",
                  color: P.gold,
                },
                {
                  title: "Compliance update required",
                  meta: "Data Security 2025 must be completed this month",
                  tag: "Mandatory",
                  color: "#C0392B",
                },
              ].map(({ title, meta, tag, color }) => (
                <div
                  key={title}
                  className="p-3 rounded-lg"
                  style={{ background: `${color}10`, border: `1px solid ${color}25` }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold leading-tight" style={{ color: P.text }}>
                        {title}
                      </p>
                      <p className="text-[10px] mt-1" style={{ color: P.textMuted }}>
                        {meta}
                      </p>
                    </div>
                    <span
                      className="text-[9px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                      style={{ background: "white", color }}
                    >
                      {tag}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <AICard title="Best Learners">
            <p className="text-xs font-semibold mb-0.5" style={{ color: P.text }}>
              Top performers configured by HR
            </p>
            <p className="text-xs mb-2" style={{ color: P.textMuted }}>
              Based on XP points, completion, and performance settings.
            </p>
            <div className="space-y-1.5 mb-3">
              {[
                { rank: 1, name: "Mei Lin", score: "3,210 XP", av: "ML" },
                { rank: 2, name: "Thomas Gruber", score: "2,940 XP", av: "TG" },
                { rank: 3, name: "Alex Mercer", score: "2,780 XP", av: "AM" },
              ].map((learner) => (
                <div key={learner.name} className="flex items-center gap-2">
                  <span className="w-5 text-[10px] font-bold" style={{ color: P.olive }}>
                    #{learner.rank}
                  </span>
                  <Av
                    initials={learner.av}
                    size={24}
                    color={learner.rank === 1 ? P.olive : P.sage}
                  />
                  <span className="text-xs font-semibold flex-1 truncate" style={{ color: P.text }}>
                    {learner.name}
                  </span>
                  <span className="text-[11px] font-bold" style={{ color: P.olive }}>
                    {learner.score}
                  </span>
                </div>
              ))}
            </div>
            <button
              onClick={() => navigate("leaderboard")}
              className="w-full text-xs font-semibold py-1.5 text-white rounded-lg"
              style={{ background: P.gold }}
            >
              Open Leaderboard
            </button>
          </AICard>
          <div className="bg-white rounded-xl border p-4" style={{ borderColor: P.border }}>
            <p
              className="text-xs font-semibold mb-3 flex items-center gap-1.5"
              style={{ color: P.text }}
            >
              <Calendar size={13} style={{ color: P.sage }} /> Upcoming Deadlines
            </p>
            <div className="space-y-2.5">
              {[
                { title: "Cybersecurity Compliance", due: "Due in 3 days", urgent: true },
                { title: "ESG & Sustainability", due: "Due in 30 days", urgent: false },
              ].map(({ title, due, urgent }) => (
                <div
                  key={title}
                  className="flex items-center gap-2 p-2.5 rounded-lg"
                  style={{
                    background: urgent ? "#FEF2F2" : P.bg,
                    border: `1px solid ${urgent ? "#FECACA" : P.border}`,
                  }}
                >
                  <AlertCircle size={13} style={{ color: urgent ? "#C0392B" : P.sage }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate" style={{ color: P.text }}>
                      {title}
                    </p>
                    <p
                      className="text-[10px] font-medium"
                      style={{ color: urgent ? "#C0392B" : P.textMuted }}
                    >
                      {due}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold" style={{ color: P.text }}>
              Continue Learning
            </h2>
            <button
              onClick={() => navigate("catalog")}
              className="text-xs font-medium"
              style={{ color: P.olive }}
            >
              View all →
            </button>
          </div>
          <div className="space-y-3">
            {inProgress.map((course) => (
              <div
                key={course.id}
                onClick={() => navigate("player")}
                className="bg-white rounded-xl border p-4 hover:shadow-md transition-all cursor-pointer flex items-center gap-4"
                style={{ borderColor: P.border }}
              >
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${course.color}14` }}
                >
                  <BookOpen size={22} style={{ color: course.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p
                      className="text-sm font-semibold leading-tight line-clamp-1"
                      style={{ color: P.text }}
                    >
                      {course.title}
                    </p>
                    <Chip
                      label={course.level}
                      variant={course.level === "Advanced" ? "red" : "sage"}
                    />
                  </div>
                  <p className="text-xs mb-2" style={{ color: P.textMuted }}>
                    {course.instructor} · {course.duration}
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <PBar value={course.progress} color={course.color} height={5} />
                    </div>
                    <span className="text-[11px] font-semibold" style={{ color: course.color }}>
                      {course.progress}%
                    </span>
                  </div>
                </div>
                <button
                  className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: course.color }}
                  data-prototype-action="true"
                >
                  <Play size={14} className="text-white fill-white ml-0.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl border p-4" style={{ borderColor: P.border }}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold" style={{ color: P.text }}>
                Recent Achievements
              </p>
              <button
                onClick={() => navigate("profile")}
                className="text-xs font-medium"
                style={{ color: P.olive }}
              >
                View all
              </button>
            </div>
            <div className="flex items-center gap-3 overflow-x-auto pb-1">
              {[
                ["🌿", "Course Completer", P.olive],
                ["🔥", "14-Day Streak", P.gold],
                ["🧠", "Knowledge Seeker", P.darkOlive],
                ["🌟", "Top 5 Learner", "#8A6A1A"],
                ["⚡", "Speed Learner", "#5A7A2A"],
              ].map(([emoji, label, color]) => (
                <div key={label} className="flex flex-col items-center gap-1 flex-shrink-0">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-xl"
                    style={{ background: `${color}12`, border: `1px solid ${color}22` }}
                  >
                    {emoji}
                  </div>
                  <p
                    className="text-[9px] text-center w-12 leading-tight"
                    style={{ color: P.textMuted }}
                  >
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold flex items-center gap-2" style={{ color: P.text }}>
            <Sparkles size={14} style={{ color: P.gold }} /> AI Recommended for You
          </h2>
          <button
            onClick={() => navigate("catalog")}
            className="text-xs font-medium"
            style={{ color: P.olive }}
          >
            Browse catalog →
          </button>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {COURSES.filter((c) => c.recommended && !c.isEnrolled)
            .slice(0, 4)
            .map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onClick={() => navigate("course-detail", course.id)}
              />
            ))}
        </div>
      </div>
    </div>
  );
}
