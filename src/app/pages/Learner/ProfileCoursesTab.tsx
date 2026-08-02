import React from "react";
import { BookOpen, CheckCircle } from "lucide-react";
import { PBar } from "../../components/common";
import { COURSE_XP } from "../../constants/courseMetadata.constants";
import { COURSES } from "../../constants/mockData";
import { P } from "../../constants/theme.constants";
import type { NavigateFn } from "../../models/app.model";

export function ProfileCoursesTab({ navigate }: { navigate: NavigateFn }) {
  return (
    <div className="space-y-5">
      {[
        {
          label: "In Progress",
          courses: COURSES.filter((c) => c.progress > 0 && c.progress < 100),
          color: P.olive,
          note: "Resume where you left off",
        },
        {
          label: "Enrolled - Not Started",
          courses: COURSES.filter((c) => c.isEnrolled && c.progress === 0),
          color: P.gold,
          note: "Awaiting your first session",
        },
        {
          label: "Assigned by Manager",
          courses: COURSES.filter((c) => c.mandatory),
          color: "#C0392B",
          note: "Mandatory - complete by deadline",
        },
        {
          label: "Completed",
          courses: COURSES.filter((c) => c.progress === 100),
          color: "#5A7A2A",
          note: "Well done! Certificates earned",
        },
      ].map(({ label, courses, color, note }) => (
        <div
          key={label}
          className="bg-white rounded-xl border p-5"
          style={{ borderColor: P.border }}
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-semibold" style={{ color: P.text }}>
                {label}
              </p>
              <p className="text-[11px]" style={{ color: P.textMuted }}>
                {courses.length} course{courses.length !== 1 ? "s" : ""} - {note}
              </p>
            </div>
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold text-white"
              style={{ background: color }}
            >
              {courses.length}
            </div>
          </div>
          {courses.length > 0 ? (
            <div className="space-y-2">
              {courses.map((c) => (
                <button
                  type="button"
                  key={c.id}
                  onClick={() => navigate("course-detail", c.id)}
                  aria-label={`Open details for ${c.title}`}
                  className="w-full text-left flex items-center gap-3 p-3 rounded-lg hover:bg-[#F6FEFA] transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#6EE7B7]"
                  style={{ background: P.bg }}
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: `${c.color}18` }}
                  >
                    <BookOpen size={16} style={{ color: c.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate" style={{ color: P.text }}>
                      {c.title}
                    </p>
                    <p className="text-[10px]" style={{ color: P.textMuted }}>
                      {c.instructor} - {c.duration}
                    </p>
                    {c.progress > 0 && <PBar value={c.progress} color={c.color} height={3} />}
                  </div>
                  <div className="text-right flex-shrink-0">
                    {c.progress > 0 && c.progress < 100 && (
                      <p className="text-xs font-semibold" style={{ color: c.color }}>
                        {c.progress}%
                      </p>
                    )}
                    {c.progress === 100 && <CheckCircle size={16} style={{ color: "#5A7A2A" }} />}
                    {c.progress === 0 && (
                      <p className="text-xs font-medium" style={{ color: P.olive }}>
                        Start {">"}
                      </p>
                    )}
                    <p className="text-[10px]" style={{ color: P.textMuted }}>
                      {COURSE_XP[c.id]} XP
                    </p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-xs text-center py-4" style={{ color: P.textMuted }}>
              No courses in this category yet
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
