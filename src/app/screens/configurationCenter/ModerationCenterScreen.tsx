// Extensions3.tsx — Configuration Center, Analytics Center, Course Builder,
// Certification Management, Gamification, Two-Level Moderation
// Olive / Sage / Gold enterprise design language

import React, { useEffect, useState } from "react";
import {
  ContentWorkflowModal,
  DEFAULT_QUESTION_TYPE_CONFIG,
  describeAttemptScoringPolicy,
  loadAttemptScoringPolicy,
  saveAttemptScoringPolicy,
  type AttemptScoringMode,
  type AttemptScoringPolicy,
  type ContentAttachment,
  type ContentType,
  type QuestionTypeConfig,
  SavedContentItem,
  QuizOnlyModal,
  QuizRow,
  QuizPreviewModal,
} from "../../Extensions6";
import {
  EnrollmentRulesCrud,
  ReportsCrud,
  WidgetsCrud,
  WorkflowsCrud,
  XPRulesCrud,
} from "../../Extensions5";
import {
  BookOpen,
  Award,
  BarChart2,
  Target,
  CheckCircle,
  AlertCircle,
  Plus,
  Download,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
  MessageSquare,
  Star,
  Play,
  Video,
  FileText,
  HelpCircle,
  Globe,
  Search,
  Sparkles,
  TrendingUp,
  TrendingDown,
  X,
  Copy,
  Archive,
  Send,
  Link,
  UserCheck,
  Layers,
  Shield,
  Eye,
  Settings,
  Zap,
  Lock,
  Users,
  Clock,
  Filter,
  MoreHorizontal,
  Flag,
  Upload,
  User,
  LayoutDashboard,
  Activity,
  Cpu,
  Music,
  RefreshCw,
  GitBranch,
  Tag,
  ChevronDown,
  ChevronUp,
  ToggleLeft,
  Trophy,
  Medal,
  Check,
  Wand2,
  PlusCircle,
  FileCheck,
  Bookmark,
  AlertTriangle,
  Image as ImageIcon,
  MousePointer2,
  Move,
  Palette,
  Square,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from "lucide-react";
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
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  AICard,
  ANALYTICS_TREND,
  Av,
  CERT_TEMPLATES,
  CERT_TEMPLATE_STORAGE_KEY,
  CONTENT_TYPES,
  CONTENT_TYPE_ICONS,
  COURSES_MINI,
  COURSE_COMMENTS,
  COURSE_TEMPLATE_STORAGE_KEY,
  CREATOR_CERTIFICATE_TEMPLATES,
  CertificateTemplateReviewModal,
  CertificationTemplate,
  CfgField,
  CfgSection,
  CfgToggle,
  Chip,
  CourseContentTypeConfig,
  CourseCreationTemplate,
  CourseDraftDetails,
  CourseMini,
  CourseTemplateChapter,
  CourseTemplateContentItem,
  CreatorCertificateTemplate,
  DEFAULT_CONFIG_PROGRAM_TEMPLATES,
  DEFAULT_CONTENT_TYPE_CONFIG,
  DEFAULT_COURSE_CREATION_TEMPLATES,
  EMPLOYEES,
  EXTERNAL_PROVIDERS,
  LearningProgramTemplate,
  LearningProgramTemplateDraft,
  MODERATION_ITEMS,
  ModerationItem,
  P,
  PBar,
  PROGRAM_TEMPLATE_CONFIG_STORAGE_KEY,
  PageHeader,
  PreCourseAssessmentPolicy,
  SaveBar,
  SavedCreatorCourse,
  VERSIONS,
  contentSourceLabelFor,
  createBlankCourseTemplate,
  createCourseContentItemFromSaved,
  createCourseDraftFromTemplate,
  createCustomCourseDraft,
  createExistingCourseDraft,
  createProgramTemplateDraft,
  createSavedCreatorCourseDraft,
  getContentItemAttachments,
  loadConfigProgramTemplates,
  loadCourseCreationTemplates,
  normalizeConfigProgramTemplate,
  parseCourseTemplateChapters,
  saveConfigProgramTemplates,
  saveCourseCreationTemplates,
  serializeCourseTemplateChapters,
  splitTemplateLines,
} from "./configuration.shared";

export function ModerationCenterScreen({ navigate }: { navigate: (s: string) => void }) {
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [moderationTab, setModerationTab] = useState<
    "all" | "comments" | "reviews" | "ratings" | "reported"
  >("all");
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<ModerationItem[]>(MODERATION_ITEMS);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");
  const [editRating, setEditRating] = useState(0);

  const course = selectedCourse ? COURSES_MINI.find((c) => c.id === selectedCourse) : null;
  const selectedCourseItems = course ? items.filter((item) => item.course === course.title) : [];
  const selectedCourseRatings = selectedCourseItems.filter((item) => item.rating);
  const baseStats = selectedCourse
    ? COURSE_COMMENTS[selectedCourse as keyof typeof COURSE_COMMENTS]
    : null;
  const stats = course
    ? {
        comments: selectedCourseItems.filter((item) => item.type === "comment").length,
        reviews: selectedCourseItems.filter((item) => item.type === "review").length,
        avgRating: selectedCourseRatings.length
          ? Number(
              (
                selectedCourseRatings.reduce((sum, item) => sum + (item.rating ?? 0), 0) /
                selectedCourseRatings.length
              ).toFixed(1),
            )
          : 0,
        flagged: selectedCourseItems.filter((item) => item.reported).length,
        hidden: selectedCourseItems.filter((item) => item.hidden).length,
        deleted: baseStats?.deleted ?? 0,
      }
    : null;

  const filtered = selectedCourseItems.filter((item) => {
    if (
      search &&
      !item.content.toLowerCase().includes(search.toLowerCase()) &&
      !item.author.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    if (moderationTab === "comments") return item.type === "comment";
    if (moderationTab === "reviews") return item.type === "review";
    if (moderationTab === "ratings") return item.type === "rating";
    if (moderationTab === "reported") return item.reported;
    return true;
  });

  const beginEditingItem = (item: ModerationItem) => {
    setEditingItemId(item.id);
    setEditDraft(item.content);
    setEditRating(item.rating ?? 0);
  };

  const cancelEditingItem = () => {
    setEditingItemId(null);
    setEditDraft("");
    setEditRating(0);
  };

  const saveEditingItem = (item: ModerationItem) => {
    setItems((currentItems) =>
      currentItems.map((currentItem) =>
        currentItem.id === item.id
          ? {
              ...currentItem,
              content: editDraft.trim() || currentItem.content,
              rating:
                currentItem.type === "review" || currentItem.type === "rating"
                  ? Math.max(1, Math.min(5, editRating || currentItem.rating || 1))
                  : currentItem.rating,
              edited: true,
            }
          : currentItem,
      ),
    );
    cancelEditingItem();
  };

  if (course && stats) {
    return (
      <div className="p-6 space-y-5 max-w-[1100px]">
        <button
          onClick={() => setSelectedCourse(null)}
          className="flex items-center gap-1.5 text-sm"
          style={{ color: P.textMuted }}
        >
          <ChevronLeft size={16} /> Content Moderation
        </button>
        <div className="flex items-start gap-4">
          <div className="w-20 h-12 rounded-lg overflow-hidden flex-shrink-0">
            <img src={course.thumb} alt="" className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="text-base font-bold" style={{ color: P.text }}>
              {course.title}
            </h1>
            <div className="flex items-center gap-4 mt-1">
              <span className="text-xs" style={{ color: P.textMuted }}>
                💬 {stats.comments} comments
              </span>
              <span className="text-xs" style={{ color: P.textMuted }}>
                ⭐ {stats.reviews} reviews
              </span>
              {stats.avgRating > 0 && (
                <span className="text-xs" style={{ color: P.textMuted }}>
                  Avg: {stats.avgRating}★
                </span>
              )}
              {stats.flagged > 0 && (
                <span className="text-xs font-semibold" style={{ color: "#C0392B" }}>
                  ⚠ {stats.flagged} flagged
                </span>
              )}
              {stats.hidden > 0 && (
                <span className="text-xs" style={{ color: P.gold }}>
                  👁 {stats.hidden} hidden
                </span>
              )}
              {stats.deleted > 0 && (
                <span className="text-xs" style={{ color: P.textMuted }}>
                  🗑 {stats.deleted} deleted
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Search + tabs */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search
              size={13}
              className="absolute left-2.5 top-1/2 -translate-y-1/2"
              style={{ color: P.sage }}
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search comments, authors…"
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg focus:outline-none bg-white"
              style={{ border: `1px solid ${P.border}`, color: P.text }}
            />
          </div>
        </div>
        <div className="flex gap-0" style={{ borderBottom: `1px solid ${P.border}` }}>
          {(["all", "comments", "reviews", "ratings", "reported"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setModerationTab(t)}
              className="px-4 py-2.5 text-xs font-semibold capitalize"
              style={
                moderationTab === t
                  ? { color: P.olive, borderBottom: `2px solid ${P.olive}` }
                  : { color: P.textMuted }
              }
            >
              {t}
              {t === "reported" && stats.flagged > 0 ? ` (${stats.flagged})` : ""}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          {filtered.length === 0 && (
            <p className="text-sm text-center py-8" style={{ color: P.textMuted }}>
              No items match the current filter.
            </p>
          )}
          {filtered.map((item) => {
            const isEditing = editingItemId === item.id;

            return (
              <div
                key={item.id}
                className="bg-white rounded-xl border p-4"
                style={{
                  borderColor: item.reported ? "#FECACA" : item.hidden ? P.goldMid : P.border,
                  opacity: item.hidden ? 0.6 : 1,
                }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-white"
                    style={{ background: P.sage }}
                  >
                    {item.author[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-xs font-semibold" style={{ color: P.text }}>
                        {item.author}
                      </p>
                      <Chip
                        label={item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                        variant="neutral"
                      />
                      {item.reported && <Chip label="⚠ Reported" variant="red" />}
                      {item.hidden && <Chip label="Hidden" variant="gold" />}
                      {item.edited && <Chip label="Edited by HR" variant="green" />}
                      {item.rating && (
                        <div className="flex items-center gap-0.5">
                          {Array(item.rating)
                            .fill(0)
                            .map((_, i) => (
                              <Star key={i} size={10} className="text-amber-400 fill-amber-400" />
                            ))}
                        </div>
                      )}
                      <span
                        className="ml-auto text-[10px] font-mono"
                        style={{ color: P.textMuted }}
                      >
                        {item.date}
                      </span>
                    </div>
                    {isEditing ? (
                      <div className="space-y-2">
                        <textarea
                          value={editDraft}
                          onChange={(e) => setEditDraft(e.target.value)}
                          className="w-full min-h-[88px] px-3 py-2 text-xs rounded-lg bg-white focus:outline-none"
                          style={{ border: `1px solid ${P.border}`, color: P.text }}
                        />
                        {(item.type === "review" || item.type === "rating") && (
                          <div className="flex items-center gap-2">
                            <span
                              className="text-[11px] font-semibold"
                              style={{ color: P.textMid }}
                            >
                              Rating
                            </span>
                            {[1, 2, 3, 4, 5].map((rating) => (
                              <button
                                key={rating}
                                onClick={() => setEditRating(rating)}
                                className="w-7 h-7 rounded-lg flex items-center justify-center"
                                style={{
                                  background: editRating >= rating ? P.goldLight : P.bg,
                                  border: `1px solid ${editRating >= rating ? P.gold : P.border}`,
                                }}
                              >
                                <Star
                                  size={13}
                                  className={
                                    editRating >= rating
                                      ? "text-amber-500 fill-amber-500"
                                      : "text-slate-300"
                                  }
                                />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs leading-relaxed" style={{ color: P.textMid }}>
                        {item.content}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1.5 flex-shrink-0">
                    {isEditing ? (
                      <>
                        <button
                          onClick={() => saveEditingItem(item)}
                          className="px-2.5 py-1.5 rounded-lg text-[11px] font-medium"
                          style={{ background: P.olive, color: "white" }}
                        >
                          Save
                        </button>
                        <button
                          onClick={cancelEditingItem}
                          className="px-2.5 py-1.5 rounded-lg text-[11px] font-medium"
                          style={{ border: `1px solid ${P.border}`, color: P.textMid }}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => beginEditingItem(item)}
                        className="px-2.5 py-1.5 rounded-lg text-[11px] font-medium"
                        style={{ background: P.lightSage, color: P.olive }}
                      >
                        Edit
                      </button>
                    )}
                    {item.reported ? (
                      <button
                        onClick={() =>
                          setItems((p) =>
                            p.map((x) => (x.id === item.id ? { ...x, reported: false } : x)),
                          )
                        }
                        className="px-2.5 py-1.5 rounded-lg text-[11px] font-medium"
                        style={{ background: P.paleGreen, color: P.textMid }}
                      >
                        Clear Flag
                      </button>
                    ) : (
                      <button
                        onClick={() =>
                          setItems((p) =>
                            p.map((x) => (x.id === item.id ? { ...x, reported: true } : x)),
                          )
                        }
                        className="px-2.5 py-1.5 rounded-lg text-[11px] font-medium"
                        style={{ border: `1px solid ${P.border}`, color: P.textMuted }}
                      >
                        Flag
                      </button>
                    )}
                    {!item.hidden && (
                      <button
                        onClick={() =>
                          setItems((p) =>
                            p.map((x) => (x.id === item.id ? { ...x, hidden: true } : x)),
                          )
                        }
                        className="px-2.5 py-1.5 rounded-lg text-[11px] font-medium"
                        style={{ background: P.goldLight, color: "#8A6A1A" }}
                      >
                        Hide
                      </button>
                    )}
                    {item.hidden && (
                      <button
                        onClick={() =>
                          setItems((p) =>
                            p.map((x) => (x.id === item.id ? { ...x, hidden: false } : x)),
                          )
                        }
                        className="px-2.5 py-1.5 rounded-lg text-[11px] font-medium"
                        style={{ background: "#D8EDCC", color: "#3A6420" }}
                      >
                        Restore
                      </button>
                    )}
                    <button
                      onClick={() => setItems((p) => p.filter((x) => x.id !== item.id))}
                      className="px-2.5 py-1.5 rounded-lg text-[11px] font-medium"
                      style={{ background: "#FEF2F2", color: "#C0392B" }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Level 1: Course list
  return (
    <div className="p-6 space-y-5 max-w-[1100px]">
      <PageHeader
        title="Content Moderation"
        sub="Select a course to review and moderate its comments, reviews, and ratings"
      />
      <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: P.border }}>
        <div className="px-5 py-3.5" style={{ borderBottom: `1px solid ${P.border}` }}>
          <p className="text-sm font-semibold" style={{ color: P.text }}>
            All Courses
          </p>
        </div>
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: `1px solid ${P.border}50` }}>
              {[
                "Course",
                "Comments",
                "Reviews",
                "Avg Rating",
                "Flagged",
                "Hidden",
                "Deleted",
                "Action",
              ].map((h) => (
                <th
                  key={h}
                  className="text-left px-4 py-2.5 text-[11px] font-semibold uppercase"
                  style={{ color: P.textMuted }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {COURSES_MINI.filter((c) => COURSE_COMMENTS[c.id as keyof typeof COURSE_COMMENTS]).map(
              (c) => {
                const s = COURSE_COMMENTS[c.id as keyof typeof COURSE_COMMENTS];
                return (
                  <tr
                    key={c.id}
                    onClick={() => setSelectedCourse(c.id)}
                    className="hover:bg-[#F6FEFA] transition-colors cursor-pointer"
                    style={{ borderBottom: `1px solid ${P.border}50` }}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-12 h-7 rounded overflow-hidden flex-shrink-0">
                          <img src={c.thumb} alt="" className="w-full h-full object-cover" />
                        </div>
                        <p className="text-xs font-semibold line-clamp-1" style={{ color: P.text }}>
                          {c.title}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs" style={{ color: P.textMid }}>
                        {s.comments}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs" style={{ color: P.textMid }}>
                        {s.reviews}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      {s.avgRating > 0 ? (
                        <div className="flex items-center gap-1">
                          <Star size={11} className="text-amber-500 fill-amber-500" />
                          <p className="text-xs">{s.avgRating}</p>
                        </div>
                      ) : (
                        <p className="text-xs" style={{ color: P.textMuted }}>
                          —
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {s.flagged > 0 ? (
                        <span className="text-xs font-semibold" style={{ color: "#C0392B" }}>
                          ⚠ {s.flagged}
                        </span>
                      ) : (
                        <span className="text-xs" style={{ color: P.textMuted }}>
                          0
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs" style={{ color: P.textMuted }}>
                        {s.hidden}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs" style={{ color: P.textMuted }}>
                        {s.deleted}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          setSelectedCourse(c.id);
                        }}
                        className="px-3 py-1.5 rounded-lg text-[11px] font-semibold"
                        style={{ background: P.lightSage, color: P.olive }}
                      >
                        Review →
                      </button>
                    </td>
                  </tr>
                );
              },
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 4. UNIFIED COURSE BUILDER
// ─────────────────────────────────────────────────────────────
