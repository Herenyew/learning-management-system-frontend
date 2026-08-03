import { Bookmark, BookOpen, CheckCircle, Clock, Globe, Star, Zap } from "lucide-react";
import {
  COURSE_CONTACT,
  COURSE_SUMMARIES,
  COURSE_XP,
} from "../../constants/courseMetadata.constants";
import { P } from "../../constants/theme.constants";
import type { Course } from "../../models/app.model";
import { Av, Chip, PBar } from "../common";

export function CourseCard({
  course,
  onClick,
  showContact,
}: {
  course: Course;
  onClick: () => void;
  showContact?: boolean;
}) {
  const summary = COURSE_SUMMARIES[course.id] ?? "";
  const xp = COURSE_XP[course.id] ?? 400;
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl border overflow-hidden cursor-pointer group"
      style={{
        borderColor: P.border,
        transition: "transform 200ms cubic-bezier(0.34,1.56,0.64,1), box-shadow 200ms ease",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(-5px) scale(1.02)";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 10px 28px rgba(4,120,87,0.15)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = "";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "";
      }}
    >
      {/* Thumbnail */}
      <div className="h-44 relative overflow-hidden">
        {course.thumbnail ? (
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div
            className="w-full h-full"
            style={{ background: `linear-gradient(135deg, ${course.color}22, ${course.color}44)` }}
          />
        )}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.55) 100%)`,
          }}
        />
        <div className="absolute top-2.5 right-2.5 flex gap-1.5">
          {course.mandatory && <Chip label="Mandatory" variant="red" />}
          {course.recommended && <Chip label="AI Pick" variant="gold" />}
          {course.providerStatus && (
            <Chip
              label={course.providerStatus}
              variant={course.providerStatus === "Integrated" ? "green" : "gold"}
            />
          )}
        </div>
        <div className="absolute top-2.5 left-2.5">
          <Chip
            label={course.level}
            variant={
              course.level === "Advanced"
                ? "red"
                : course.level === "Intermediate"
                  ? "gold"
                  : "olive"
            }
          />
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <p className="text-[10px] font-medium mb-0.5 text-white/70">{course.category}</p>
          <h3 className="text-sm font-semibold leading-tight line-clamp-2 text-white">
            {course.title}
          </h3>
        </div>
        {/* Quick-action overlay — appears on hover */}
        <div
          className="quick-actions absolute inset-0 flex items-center justify-center gap-2"
          style={{ background: "rgba(0,0,0,0.36)" }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClick}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
            style={{
              background: "rgba(255,255,255,0.2)",
              border: "1px solid rgba(255,255,255,0.4)",
              backdropFilter: "blur(4px)",
              transition: "transform 150ms ease, background 150ms ease",
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.transform = "scale(1.06)")
            }
            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.transform = "")}
          >
            Preview
          </button>
          {course.progress < 100 && (
            <button
              onClick={onClick}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
              style={{
                background: P.olive,
                transition: "transform 150ms ease, box-shadow 150ms ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.06)";
                (e.currentTarget as HTMLButtonElement).style.boxShadow =
                  "0 4px 12px rgba(4,120,87,0.5)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform = "";
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "";
              }}
            >
              {course.isEnrolled ? (course.progress > 0 ? "Resume" : "Start") : "Enroll"}
            </button>
          )}
          <button
            className="p-1.5 rounded-lg text-white"
            style={{
              background: "rgba(255,255,255,0.2)",
              border: "1px solid rgba(255,255,255,0.4)",
              backdropFilter: "blur(4px)",
              transition: "transform 150ms ease",
            }}
            title="Add to Wishlist"
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.transform = "scale(1.1)")
            }
            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.transform = "")}
            data-prototype-action="true"
          >
            <Bookmark size={13} />
          </button>
        </div>
      </div>
      <div className="p-5">
        <p className="text-[11px] leading-relaxed mb-3 line-clamp-1" style={{ color: P.textMuted }}>
          {summary}
        </p>
        {course.provider && (
          <div
            className="mb-2.5 flex items-center justify-between gap-2 rounded-lg px-2.5 py-2"
            style={{ background: P.bg, border: `1px solid ${P.border}` }}
          >
            <span
              className="flex min-w-0 items-center gap-1.5 text-[10px] font-semibold"
              style={{ color: P.textMid }}
            >
              <Globe size={10} style={{ color: course.color }} />
              <span className="truncate">{course.provider}</span>
            </span>
            <span className="text-[10px] font-medium truncate" style={{ color: P.textMuted }}>
              {course.providerCredential}
            </span>
          </div>
        )}
        <div className="flex items-center gap-2 mb-2">
          <Av initials={course.instructorAvatar} size={20} color={course.color} />
          <span className="text-[11px] truncate" style={{ color: P.textMuted }}>
            {course.instructor}
          </span>
          <div className="ml-auto flex items-center gap-0.5">
            <Star size={10} className="text-amber-500 fill-amber-500" />
            <span className="text-[11px] font-medium" style={{ color: P.text }}>
              {course.rating}
            </span>
          </div>
        </div>
        <div
          className="flex items-center gap-2.5 text-[10px] mb-2.5"
          style={{ color: P.textMuted }}
        >
          <span className="flex items-center gap-1">
            <Clock size={10} />
            {course.duration}
          </span>
          <span className="flex items-center gap-1">
            <BookOpen size={10} />
            {course.lessons}L
          </span>
          <span className="flex items-center gap-1">
            <Zap size={10} />
            <span style={{ color: P.gold }}>{xp} XP</span>
          </span>
        </div>
        {showContact && (
          <p className="text-[10px] mb-2" style={{ color: P.textMuted }}>
            📧 {COURSE_CONTACT[course.id]}
          </p>
        )}
        {course.isEnrolled && course.progress > 0 && course.progress < 100 && (
          <div>
            <div className="flex justify-between text-[10px] mb-1" style={{ color: P.textMuted }}>
              <span>Progress</span>
              <span className="font-semibold" style={{ color: course.color }}>
                {course.progress}%
              </span>
            </div>
            <PBar value={course.progress} color={course.color} height={4} />
          </div>
        )}
        {course.progress === 0 && (
          <button
            onClick={onClick}
            className="w-full text-xs font-medium text-center py-1.5 rounded-lg"
            style={{
              color: P.olive,
              background: P.lightSage,
              transition: "background 150ms ease, transform 150ms ease",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = P.sage + "40";
              (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.02)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = P.lightSage;
              (e.currentTarget as HTMLButtonElement).style.transform = "";
            }}
          >
            {course.isEnrolled ? "Start Course →" : "Enroll Now →"}
          </button>
        )}
        {course.progress === 100 && (
          <div
            className="flex items-center gap-1.5 text-xs font-medium"
            style={{ color: "#5A7A2A" }}
          >
            <CheckCircle size={13} /> Completed
          </div>
        )}
      </div>
    </div>
  );
}
