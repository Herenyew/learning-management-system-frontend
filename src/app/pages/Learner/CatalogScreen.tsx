import { useState } from "react";
import { BookOpen, Filter, Globe, ListChecks, Search, Sparkles, Star } from "lucide-react";
import { Chip, PBar } from "../../components/common";
import { CourseCard } from "../../components/course";
import { P } from "../../constants/theme.constants";
import type { CatItem, LevelItem } from "../../models/catalog.model";
import type { Course, NavigateFn } from "../../models/app.model";

// ─── 3. CATALOG ───────────────────────────────────────────────

export function CatalogScreen({
  navigate,
  globalCats,
  globalLevels,
  courses,
  searchQuery,
  setSearchQuery,
}: {
  navigate: NavigateFn;
  globalCats: CatItem[];
  globalLevels: LevelItem[];
  courses: Course[];
  searchQuery: string;
  setSearchQuery: (value: string) => void;
}) {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [category, setCategory] = useState("All");
  const [level, setLevel] = useState("All");
  const [provider, setProvider] = useState("All");
  const cats = ["All", ...globalCats.filter((c) => c.active).map((c) => c.name)];
  const levels = [
    "All",
    ...[...globalLevels]
      .filter((l) => l.active)
      .sort((a, b) => a.order - b.order)
      .map((l) => l.name),
  ];
  const providerOptions = [
    "All",
    ...Array.from(
      new Set(courses.filter((course) => course.provider).map((course) => course.provider!)),
    ),
  ];
  const externalCourseCount = courses.filter((course) => course.provider).length;
  const normalizedSearch = searchQuery.trim().toLowerCase();
  const matchesSearch = (course: Course) => {
    if (!normalizedSearch) return true;

    return [
      course.title,
      course.category,
      course.level,
      course.duration,
      course.instructor,
      course.provider,
      course.providerShort,
      course.providerCredential,
      course.providerStatus,
      ...course.tags,
    ]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(normalizedSearch));
  };
  const filtered = courses.filter(
    (c) =>
      matchesSearch(c) &&
      (category === "All" || c.category === category) &&
      (level === "All" || c.level === level) &&
      (provider === "All" || c.provider === provider),
  );

  return (
    <div className="p-6 space-y-5 max-w-[1400px]">
      <div>
        <h1
          className="text-xl font-bold mb-1"
          style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", color: P.text }}
        >
          Course Catalog
        </h1>
        <p className="text-sm" style={{ color: P.textMuted }}>
          {courses.length} courses · {externalCourseCount} external provider tracks · AI-curated for
          your role
        </p>
      </div>

      {normalizedSearch && (
        <div
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3"
          style={{ borderColor: P.border, background: P.paleGreen }}
        >
          <p className="text-sm" style={{ color: P.textMid }}>
            Searching for <span className="font-semibold">"{searchQuery.trim()}"</span>
          </p>
          <button
            onClick={() => setSearchQuery("")}
            className="rounded-lg px-3 py-1.5 text-xs font-semibold"
            style={{ border: `1px solid ${P.border}`, background: "white", color: P.textMid }}
          >
            Clear Search
          </button>
        </div>
      )}

      <div
        className="rounded-xl p-4"
        style={{
          background: `linear-gradient(135deg, ${P.lightSage}, ${P.paleGreen})`,
          border: `1px solid ${P.sage}50`,
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: P.gold }}
          >
            <Sparkles size={14} className="text-white" />
          </div>
          <input
            type="text"
            placeholder="Ask AI: 'Find courses on leadership for a senior engineer moving into management…'"
            className="flex-1 bg-transparent text-sm focus:outline-none"
            style={{ color: P.text }}
          />
          <button
            className="px-4 py-1.5 text-white text-xs font-semibold rounded-lg"
            style={{ background: P.gold }}
            data-prototype-action="true"
          >
            Search with AI
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-1.5">
          {cats.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
              style={
                category === c
                  ? { background: P.olive, color: "white" }
                  : { background: "white", border: `1px solid ${P.border}`, color: P.textMid }
              }
            >
              {c}
            </button>
          ))}
        </div>
        <div className="w-px h-5" style={{ background: P.border }} />
        <div className="flex gap-1.5">
          {levels.map((l) => (
            <button
              key={l}
              onClick={() => setLevel(l)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
              style={
                level === l
                  ? { background: P.text, color: "white" }
                  : { background: "white", border: `1px solid ${P.border}`, color: P.textMid }
              }
            >
              {l}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg"
            style={{ background: "white", border: `1px solid ${P.border}`, color: P.textMid }}
            data-prototype-action="true"
          >
            <Filter size={12} /> Filter
          </button>
          <div
            className="flex rounded-lg overflow-hidden"
            style={{ border: `1px solid ${P.border}` }}
          >
            <button
              onClick={() => setView("grid")}
              className="p-2"
              style={{ background: view === "grid" ? P.lightSage : "white" }}
            >
              <BookOpen size={14} style={{ color: P.textMid }} />
            </button>
            <button
              onClick={() => setView("list")}
              className="p-2"
              style={{ background: view === "list" ? P.lightSage : "white" }}
            >
              <ListChecks size={14} style={{ color: P.textMid }} />
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-white px-4 py-3" style={{ borderColor: P.border }}>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 mr-1">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: P.lightSage }}
            >
              <Globe size={13} style={{ color: P.olive }} />
            </div>
            <div>
              <p className="text-xs font-semibold" style={{ color: P.text }}>
                External Providers
              </p>
              <p className="text-[10px]" style={{ color: P.textMuted }}>
                Certification tracks synced from HR provider setup
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {providerOptions.map((option) => {
              const count =
                option === "All"
                  ? externalCourseCount
                  : courses.filter((course) => course.provider === option).length;
              return (
                <button
                  key={option}
                  onClick={() => setProvider(option)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                  style={
                    provider === option
                      ? { background: P.olive, color: "white" }
                      : { background: P.bg, border: `1px solid ${P.border}`, color: P.textMid }
                  }
                >
                  {option === "All" ? "All Providers" : option}
                  <span
                    className="ml-1 text-[10px]"
                    style={{ color: provider === option ? "rgba(255,255,255,0.75)" : P.textMuted }}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div
          className="rounded-2xl border bg-white px-6 py-12 text-center"
          style={{ borderColor: P.border }}
        >
          <div
            className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl"
            style={{ background: P.lightSage }}
          >
            <Search size={20} style={{ color: P.olive }} />
          </div>
          <p className="text-base font-bold" style={{ color: P.text }}>
            No courses found
          </p>
          <p className="mx-auto mt-1 max-w-md text-sm" style={{ color: P.textMuted }}>
            Try a different keyword, category, level, or external provider filter.
          </p>
          <button
            onClick={() => setSearchQuery("")}
            className="mt-4 rounded-lg px-4 py-2 text-sm font-semibold"
            style={{ background: P.olive, color: "white" }}
          >
            Clear Search
          </button>
        </div>
      ) : view === "grid" ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((c) => (
            <CourseCard
              key={c.id}
              course={c}
              onClick={() => navigate("course-detail", c.id)}
              showContact
            />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((course) => (
            <div
              key={course.id}
              onClick={() => navigate("course-detail", course.id)}
              className="bg-white rounded-xl border p-4 hover:shadow-sm cursor-pointer flex items-center gap-4"
              style={{ borderColor: P.border }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${course.color}14` }}
              >
                <BookOpen size={20} style={{ color: course.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-sm font-semibold truncate" style={{ color: P.text }}>
                    {course.title}
                  </p>
                  {course.mandatory && <Chip label="Mandatory" variant="red" />}
                  {course.recommended && <Chip label="AI Pick" variant="gold" />}
                  {course.provider && (
                    <Chip label={course.providerShort ?? course.provider} variant="sage" />
                  )}
                  {course.providerStatus && (
                    <Chip
                      label={course.providerStatus}
                      variant={course.providerStatus === "Integrated" ? "green" : "gold"}
                    />
                  )}
                </div>
                <p className="text-xs" style={{ color: P.textMuted }}>
                  {course.instructor} · {course.category} · {course.level}
                  {course.providerCredential ? ` · ${course.providerCredential}` : ""}
                </p>
              </div>
              <div className="hidden sm:flex items-center gap-5 flex-shrink-0">
                <div className="text-center">
                  <p className="text-xs font-semibold" style={{ color: P.text }}>
                    {course.duration}
                  </p>
                  <p className="text-[10px]" style={{ color: P.textMuted }}>
                    Duration
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Star size={11} className="text-amber-500 fill-amber-500" />
                  <p className="text-xs font-semibold" style={{ color: P.text }}>
                    {course.rating}
                  </p>
                </div>
                {course.progress > 0 && (
                  <div className="w-24">
                    <PBar value={course.progress} color={course.color} height={4} />
                  </div>
                )}
              </div>
              <button
                className="px-3 py-1.5 text-white text-xs font-medium rounded-lg flex-shrink-0"
                style={{ background: P.olive }}
                data-prototype-action="true"
              >
                {course.isEnrolled ? (course.progress > 0 ? "Resume" : "Start") : "Enroll"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
