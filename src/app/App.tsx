import React, { useState, useRef, useEffect } from "react";
import { P } from "./constants/theme.constants";
import { COLOR_PRESETS, INIT_CATEGORIES, INIT_LEVELS } from "./constants/catalogConfig.constants";
import { COURSE_CONTACT, COURSE_XP } from "./constants/courseMetadata.constants";
import {
  ADMIN_NAV_GROUPS,
  HR_NAV_GROUPS,
  ROLE_NAV,
  type NavGroup,
  type NavItemDef,
} from "./constants/navigation.constants";
import { AICard, Av, Chip, PBar, StatCard } from "./components/common";
import { CourseCard } from "./components/course";
import { Sidebar, TopBar } from "./components/layout";
import { LoginScreen } from "./pages/Auth";
import {
  CatalogScreen,
  CertificatesScreen,
  CourseAssessmentModal,
  CourseDetailScreen,
  DashboardScreen,
  LeaderboardScreen,
  PlayerScreen,
  ProfileScreen,
  ProgramsScreen,
  QuizScreen,
} from "./pages/Learner";
import { HRDashboardScreen } from "./pages/HR";
import { AnalyticsScreen } from "./pages/Analytics";
import { CreatorScreen } from "./pages/Creator";
import { CatalogConfigScreen } from "./pages/CatalogConfiguration";
import { NotificationsScreen } from "./pages/Notifications";
import { TNAScreen } from "./pages/TNA";
import {
  COMPLETION_TREND,
  COURSES,
  DEPT_DATA,
  LEADERBOARD_DATA,
  MONTHLY_LINE,
  NOTIFICATIONS,
  PIE_DATA,
  PROGRAMS,
  QUIZ_QUESTIONS,
  SKILL_RADAR,
} from "./constants/mockData";
import type {
  Course,
  LeaderboardConfig,
  LeaderboardMetric,
  NavigateFn,
  ProgramLbCriteria,
  Role,
  Screen,
} from "./models/app.model";
import type { CatItem, LevelItem } from "./models/catalog.model";
import {
  calculateQuizXpAward,
  loadXpGamificationConfig,
  recordQuizXpAward,
  type QuizXpAwardResult,
} from "./services/quizXp.service";
import { toCatalogCourse, upsertCreatorSavedCourse } from "./services/creatorCourses.service";
import { useBackendHealth, useCreatorSavedCourses } from "../store";
import { formatVideoDuration, parseVideoDuration } from "../utils/videoDuration";
import {
  LayoutDashboard,
  BookOpen,
  Award,
  Users,
  BarChart2,
  Bell,
  Settings,
  Search,
  Plus,
  Download,
  Share2,
  Play,
  Pause,
  CheckCircle,
  Clock,
  Star,
  Flame,
  Zap,
  Target,
  FileText,
  User,
  LogOut,
  TrendingUp,
  TrendingDown,
  Sparkles,
  MessageSquare,
  Bot,
  Trophy,
  Medal,
  Send,
  Calendar,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Filter,
  Eye,
  Edit,
  GraduationCap,
  Video,
  HelpCircle,
  Activity,
  MoreHorizontal,
  Globe,
  Wand2,
  Lock,
  ChevronLeft,
  Brain,
  ThumbsUp,
  X,
  ChevronRight,
  Layers,
  Shield,
  Cpu,
  Upload,
  UserCheck,
  Lightbulb,
  Building,
  Bookmark,
  RefreshCw,
  ListChecks,
  Briefcase,
  Map,
  BarChart,
  PieChart,
} from "lucide-react";
import {
  TNAFormScreen,
  TNAAggregationScreen,
  HRProgramsScreen,
  HRLeaderboardMgmtScreen,
  HRPublishingScreen,
  ManagerDashboardScreen,
  SCORMScreen,
  CreatorConfigScreen,
} from "./Extensions";
import {
  CalendarScreen,
  EffectivenessScreen,
  LiveSessionsScreen,
  QuestionBankScreen,
  ProgramDashboardScreen,
  AssignmentsScreen,
  SurveysScreen,
  CertProvidersScreen,
} from "./Extensions2";
import {
  ConfigCenterScreen,
  AnalyticsCenterScreen,
  ModerationCenterScreen,
  MyCoursesDashboardScreen,
  CertificationMgmtScreen,
  GamificationScreen,
  DEFAULT_CONTENT_TYPE_CONFIG,
  type CourseContentTypeConfig,
  type SavedCreatorCourse,
} from "./Extensions3";
import { ProgramTypesCrud } from "./Extensions5";
import { DEFAULT_QUESTION_TYPE_CONFIG, type QuestionTypeConfig } from "./Extensions6";
import {
  AreaChart,
  Area,
  BarChart as ReBarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PieChart as RePieChart,
  Pie,
  Cell,
} from "recharts";

// ─── 5. PLAYER ────────────────────────────────────────────────

export default function App() {
  const backendHealth = useBackendHealth();
  const [screen, setScreen] = useState<Screen>("login");
  const [role, setRole] = useState<Role>("learner");
  const [accountSettingsOpen, setAccountSettingsOpen] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState("1");
  const [catalogSearch, setCatalogSearch] = useState("");
  const [actionToast, setActionToast] = useState<{ id: number; message: string } | null>(null);
  const actionToastTimer = useRef<number | null>(null);
  const [lbConfig, setLbConfig] = useState<LeaderboardConfig>({
    xp: true,
    completion: true,
    performance: true,
    primary: "xp",
  });
  const [programLbConfig, setProgramLbConfig] = useState<Record<string, ProgramLbCriteria>>({
    "ADIU Onboarding Program": { xp: true, completion: true, performance: false, primary: "xp" },
    "Future Leaders Initiative": {
      xp: true,
      completion: false,
      performance: true,
      primary: "performance",
    },
    "2025 Regulatory Compliance Pack": {
      xp: false,
      completion: true,
      performance: true,
      primary: "completion",
    },
    "Engineering Excellence Track": {
      xp: true,
      completion: false,
      performance: true,
      primary: "xp",
    },
    "Graduate Talent Program": {
      xp: true,
      completion: true,
      performance: false,
      primary: "completion",
    },
  });
  const [globalCats, setGlobalCats] = useState<CatItem[]>(INIT_CATEGORIES);
  const [globalLevels, setGlobalLevels] = useState<LevelItem[]>(INIT_LEVELS);
  const [contentTypeConfig, setContentTypeConfig] = useState<CourseContentTypeConfig[]>(
    DEFAULT_CONTENT_TYPE_CONFIG,
  );
  const [questionTypeConfig, setQuestionTypeConfig] = useState<QuestionTypeConfig[]>(
    DEFAULT_QUESTION_TYPE_CONFIG,
  );
  const creatorSavedCourses = useCreatorSavedCourses();
  const creatorCatalogCourses = creatorSavedCourses.map(toCatalogCourse);
  const catalogCourses = [...creatorCatalogCourses, ...COURSES];
  const saveCreatorCourseToCatalog = (savedCourse: SavedCreatorCourse) => {
    upsertCreatorSavedCourse(savedCourse);
  };
  const navigate: NavigateFn = (s, courseId) => {
    setAccountSettingsOpen(false);
    if (s === "course-detail" && courseId) setSelectedCourseId(courseId);
    setScreen(s as Screen);
  };

  const roleLabels: Record<Role, string> = {
    admin: "Admin",
    creator: "Course Creator",
    hr: "HR Admin",
    learner: "Learner",
    manager: "Manager",
  };

  const handleLogout = () => {
    setAccountSettingsOpen(false);
    setCatalogSearch("");
    setSelectedCourseId("1");
    setRole("learner");
    setScreen("login");
    setActionToast({ id: Date.now(), message: "Logged out. Please sign in again." });
    if (actionToastTimer.current) window.clearTimeout(actionToastTimer.current);
    actionToastTimer.current = window.setTimeout(() => setActionToast(null), 2400);
  };

  useEffect(() => {
    const getButtonLabel = (button: HTMLButtonElement) =>
      (
        button.dataset.actionLabel ||
        button.getAttribute("title") ||
        button.getAttribute("aria-label") ||
        button.innerText ||
        "Action"
      )
        .replace(/\s+/g, " ")
        .trim();

    const getActionMessage = (label: string) => {
      const action = label || "Action";
      const lower = action.toLowerCase();

      if (/(save|apply|submit|publish)/.test(lower)) return `${action} completed.`;
      if (/(export|download|report|generate)/.test(lower)) return `${action} prepared.`;
      if (/(filter|search)/.test(lower)) return `${action} applied.`;
      if (/(add|new|create)/.test(lower)) return `${action} opened.`;
      if (/(edit|manage|configure)/.test(lower)) return `${action} mode opened.`;
      if (/(view|open|preview|review)/.test(lower)) return `${action} opened.`;
      if (/(duplicate|clone|copy)/.test(lower)) return `${action} created.`;
      if (/(share)/.test(lower)) return `${action} link copied.`;
      if (/(enroll|join|waitlist)/.test(lower)) return `${action} updated.`;
      if (/(approve|reject|hide|archive|restore|delete|remove|discard)/.test(lower)) {
        return `${action} action applied.`;
      }
      if (/(complete|mark)/.test(lower)) return `${action} updated.`;

      return `${action} action completed.`;
    };

    const handleButtonPress = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null;
      const button = target?.closest("button") as HTMLButtonElement | null;

      if (!button || button.disabled || button.getAttribute("aria-disabled") === "true") return;

      const rect = button.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      button.classList.add("ripple-container");

      const ripple = document.createElement("span");
      const size = Math.max(rect.width, rect.height);
      ripple.className = "ripple";
      ripple.style.width = `${size}px`;
      ripple.style.height = `${size}px`;
      ripple.style.left = `${event.clientX - rect.left - size / 2}px`;
      ripple.style.top = `${event.clientY - rect.top - size / 2}px`;

      button.appendChild(ripple);
      window.setTimeout(() => ripple.remove(), 520);
    };

    const handlePrototypeAction = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const button = target?.closest(
        'button[data-prototype-action="true"]',
      ) as HTMLButtonElement | null;

      if (!button || button.disabled || button.getAttribute("aria-disabled") === "true") return;

      event.preventDefault();
      const label = getButtonLabel(button);
      const message = getActionMessage(label);
      setActionToast({ id: Date.now(), message });

      if (actionToastTimer.current) window.clearTimeout(actionToastTimer.current);
      actionToastTimer.current = window.setTimeout(() => setActionToast(null), 2400);
    };

    document.addEventListener("pointerdown", handleButtonPress);
    document.addEventListener("click", handlePrototypeAction);

    return () => {
      document.removeEventListener("pointerdown", handleButtonPress);
      document.removeEventListener("click", handlePrototypeAction);
      if (actionToastTimer.current) window.clearTimeout(actionToastTimer.current);
    };
  }, []);

  const actionToastNode = actionToast && (
    <div
      key={actionToast.id}
      className="fixed right-4 top-4 z-[9999] flex max-w-[320px] items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold shadow-xl fade-in-up"
      style={{
        background: "white",
        border: `1px solid ${P.border}`,
        color: P.text,
        boxShadow: "0 18px 44px rgba(46, 58, 21, 0.18)",
      }}
    >
      <CheckCircle size={16} style={{ color: P.olive }} />
      <span>{actionToast.message}</span>
    </div>
  );

  const accountSettingsNode = screen !== "login" && accountSettingsOpen && (
    <div
      className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/35 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="account-settings-title"
      onClick={() => setAccountSettingsOpen(false)}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl"
        style={{
          border: `1px solid ${P.border}`,
          boxShadow: "0 24px 70px rgba(4, 120, 87, 0.2)",
        }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <Av initials="AM" size={44} color={P.olive} />
            <div>
              <p
                id="account-settings-title"
                className="text-lg font-bold"
                style={{ color: P.text }}
              >
                Account settings
              </p>
              <p className="text-sm" style={{ color: P.textMuted }}>
                Alex Mercer - {roleLabels[role]}
              </p>
            </div>
          </div>
          <button
            type="button"
            className="rounded-full p-2 transition hover:bg-slate-100"
            onClick={() => setAccountSettingsOpen(false)}
            aria-label="Close account settings"
          >
            <X size={18} style={{ color: P.textMuted }} />
          </button>
        </div>

        <div
          className="mt-5 rounded-xl p-4 text-sm"
          style={{ background: P.bg, color: P.textMuted }}
        >
          Log out to return to the sign-in page without refreshing the prototype.
        </div>

        <button
          type="button"
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0"
          style={{ background: P.olive }}
          onClick={handleLogout}
        >
          <LogOut size={17} />
          Log out
        </button>
      </div>
    </div>
  );

  if (screen === "login") {
    return (
      <div style={{ fontFamily: "'Inter',sans-serif" }}>
        <LoginScreen
          onLogin={(r) => {
            setRole(r);
            navigate(
              r === "learner"
                ? "dashboard"
                : r === "creator"
                  ? "my-courses-builder"
                  : r === "manager"
                    ? "manager"
                    : "hr-dashboard",
            );
          }}
        />
        {actionToastNode}
      </div>
    );
  }

  const isFullBleed =
    screen === "player" ||
    screen === "quiz" ||
    screen === "creator-config" ||
    screen === "config-center";
  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ fontFamily: "'Inter',sans-serif", background: P.bg }}
    >
      <Sidebar
        screen={screen}
        navigate={navigate}
        role={role}
        onOpenSettings={() => setAccountSettingsOpen(true)}
      />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {!isFullBleed && (
          <TopBar
            navigate={navigate}
            role={role}
            backendStatus={backendHealth.status}
            searchQuery={catalogSearch}
            setSearchQuery={setCatalogSearch}
            onOpenSettings={() => setAccountSettingsOpen(true)}
            onLogout={handleLogout}
          />
        )}
        <main
          className={`flex-1 overflow-y-auto ${isFullBleed ? "flex flex-col" : ""}`}
          style={{ minHeight: 0 }}
        >
          {screen === "dashboard" && <DashboardScreen navigate={navigate} />}
          {screen === "catalog" && (
            <CatalogScreen
              navigate={navigate}
              globalCats={globalCats}
              globalLevels={globalLevels}
              courses={catalogCourses}
              searchQuery={catalogSearch}
              setSearchQuery={setCatalogSearch}
            />
          )}
          {screen === "course-detail" && (
            <CourseDetailScreen
              navigate={navigate}
              selectedCourseId={selectedCourseId}
              courses={catalogCourses}
            />
          )}
          {screen === "player" && <PlayerScreen navigate={navigate} />}
          {screen === "quiz" && <QuizScreen navigate={navigate} />}
          {screen === "certificates" && <CertificatesScreen />}
          {screen === "profile" && <ProfileScreen navigate={navigate} />}
          {screen === "leaderboard" && (
            <LeaderboardScreen lbConfig={lbConfig} programLbConfig={programLbConfig} />
          )}
          {screen === "programs" && <ProgramsScreen navigate={navigate} />}
          {screen === "hr-dashboard" && <HRDashboardScreen navigate={navigate} />}
          {screen === "tna" && <TNAScreen navigate={navigate} />}
          {screen === "analytics" && <AnalyticsScreen />}
          {screen === "notifications" && <NotificationsScreen />}
          {/* Extended modules */}
          {screen === "tna-form" && <TNAFormScreen navigate={navigate} />}
          {screen === "tna-agg" && <TNAAggregationScreen navigate={navigate} />}
          {screen === "hr-programs" && <HRProgramsScreen navigate={navigate} />}
          {screen === "hr-leaderboard-mgmt" && (
            <HRLeaderboardMgmtScreen
              navigate={navigate}
              lbConfig={lbConfig}
              setLbConfig={setLbConfig}
              programLbConfig={programLbConfig}
              setProgramLbConfig={setProgramLbConfig}
            />
          )}
          {screen === "hr-publishing" && <HRPublishingScreen navigate={navigate} />}
          {screen === "manager" && <ManagerDashboardScreen navigate={navigate} />}
          {screen === "scorm" && <SCORMScreen navigate={navigate} />}
          {screen === "creator-config" && <CreatorConfigScreen navigate={navigate} />}
          {/* Extensions2 screens */}
          {screen === "calendar" && <CalendarScreen navigate={navigate} />}
          {screen === "effectiveness" && <EffectivenessScreen navigate={navigate} />}
          {screen === "live-sessions" && <LiveSessionsScreen navigate={navigate} />}
          {screen === "question-bank" && (
            <QuestionBankScreen navigate={navigate} questionTypes={questionTypeConfig} />
          )}
          {screen === "program-dashboard" && <ProgramDashboardScreen navigate={navigate} />}
          {screen === "assignments" && <AssignmentsScreen navigate={navigate} />}
          {screen === "surveys" && <SurveysScreen navigate={navigate} />}
          {screen === "cert-providers" && <CertProvidersScreen navigate={navigate} />}
          {/* Extensions3 — new IA screens */}
          {screen === "config-center" && (
            <ConfigCenterScreen
              navigate={navigate}
              contentTypes={contentTypeConfig}
              setContentTypes={setContentTypeConfig}
              questionTypes={questionTypeConfig}
              setQuestionTypes={setQuestionTypeConfig}
              governanceSections={{
                certificateManagement: <CertificationMgmtScreen navigate={navigate} />,
                catalogConfiguration: (
                  <CatalogConfigScreen
                    cats={globalCats}
                    setCats={setGlobalCats}
                    levels={globalLevels}
                    setLevels={setGlobalLevels}
                  />
                ),
              }}
            />
          )}
          {screen === "catalog-config" && (
            <CatalogConfigScreen
              cats={globalCats}
              setCats={setGlobalCats}
              levels={globalLevels}
              setLevels={setGlobalLevels}
            />
          )}
          {screen === "analytics-center" && (
            <AnalyticsCenterScreen navigate={navigate} role={role} />
          )}
          {(screen === "moderation-center" || screen === "hr-moderation") && (
            <ModerationCenterScreen navigate={navigate} />
          )}
          {(screen === "my-courses-builder" || screen === "creator") && (
            <MyCoursesDashboardScreen
              navigate={navigate}
              contentTypes={contentTypeConfig}
              questionTypes={questionTypeConfig}
              onSaveCourse={saveCreatorCourseToCatalog}
              savedCourses={creatorSavedCourses}
              courseCategories={globalCats}
              courseLevels={globalLevels}
            />
          )}
          {(screen === "certification-mgmt" || screen === "cert-admin") && (
            <CertificationMgmtScreen navigate={navigate} />
          )}
          {(screen === "gamification" || screen === "hr-xp") && (
            <GamificationScreen navigate={navigate} />
          )}
        </main>
      </div>
      {accountSettingsNode}
      {actionToastNode}
    </div>
  );
}
