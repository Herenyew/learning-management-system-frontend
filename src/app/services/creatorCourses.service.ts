import type { SavedCreatorCourse } from "../screens/configurationCenter/shared";
import { P } from "../constants/theme.constants";
import type { Course, PreCourseAssessmentPolicy } from "../models/app.model";
import { initialsFromName } from "../../utils/name";

export const CREATOR_SAVED_COURSES_STORAGE_KEY = "learnos_creator_saved_courses";
export const CREATOR_SAVED_COURSES_CHANGED_EVENT = "learnos:creator-saved-courses-changed";

export const fallbackCreatorCourseThumbnail =
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=400";

export const isObjectRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

export const normalizeCreatorCourse = (value: unknown): SavedCreatorCourse | null => {
  if (!isObjectRecord(value)) return null;

  const {
    id,
    title,
    description,
    category,
    level,
    duration,
    chapters,
    thumbnail,
    lessons,
    xpValue,
    passThreshold,
    preCourseAssessment,
    placement,
    programId,
    programName,
    sourceType,
    sourceTemplateId,
    sourceTemplateName,
  } = value;

  if (
    typeof id !== "string" ||
    typeof title !== "string" ||
    typeof category !== "string" ||
    typeof level !== "string" ||
    typeof duration !== "string"
  ) {
    return null;
  }

  const safePreCourseAssessment: PreCourseAssessmentPolicy =
    preCourseAssessment === "mandatory" ||
    preCourseAssessment === "optional" ||
    preCourseAssessment === "disabled"
      ? preCourseAssessment
      : "optional";
  const safePlacement = placement === "program" ? "program" : "standalone";

  return {
    id,
    title,
    description: typeof description === "string" ? description : "",
    category,
    level,
    duration,
    chapters: Array.isArray(chapters) ? (chapters as SavedCreatorCourse["chapters"]) : [],
    thumbnail:
      typeof thumbnail === "string" && thumbnail ? thumbnail : fallbackCreatorCourseThumbnail,
    lessons: typeof lessons === "number" ? lessons : 0,
    xpValue: typeof xpValue === "number" ? xpValue : 0,
    passThreshold: typeof passThreshold === "number" ? passThreshold : 80,
    preCourseAssessment: safePreCourseAssessment,
    placement: safePlacement,
    programId:
      safePlacement === "program" && typeof programId === "string"
        ? programId
        : undefined,
    programName:
      safePlacement === "program" && typeof programName === "string"
        ? programName
        : undefined,
    sourceType:
      sourceType === "template" || sourceType === "existing-course" || sourceType === "custom"
        ? sourceType
        : "custom",
    sourceTemplateId: typeof sourceTemplateId === "string" ? sourceTemplateId : undefined,
    sourceTemplateName: typeof sourceTemplateName === "string" ? sourceTemplateName : undefined,
  };
};

let creatorSavedCoursesSnapshot: SavedCreatorCourse[] | null = null;

const readCreatorSavedCoursesFromStorage = (): SavedCreatorCourse[] => {
  if (typeof window === "undefined") return [];

  try {
    const stored = window.localStorage.getItem(CREATOR_SAVED_COURSES_STORAGE_KEY);
    if (!stored) return [];

    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((course) => normalizeCreatorCourse(course))
      .filter((course): course is SavedCreatorCourse => Boolean(course));
  } catch {
    return [];
  }
};

export const loadCreatorSavedCourses = (): SavedCreatorCourse[] => {
  creatorSavedCoursesSnapshot ??= readCreatorSavedCoursesFromStorage();
  return creatorSavedCoursesSnapshot;
};

export const saveCreatorSavedCourses = (courses: SavedCreatorCourse[]) => {
  creatorSavedCoursesSnapshot = courses;
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(CREATOR_SAVED_COURSES_STORAGE_KEY, JSON.stringify(courses));
    window.dispatchEvent(new Event(CREATOR_SAVED_COURSES_CHANGED_EVENT));
  } catch {
    // Storage can fail in private browsing or quota-limited environments.
  }
};

export const subscribeCreatorSavedCourses = (listener: () => void) => {
  if (typeof window === "undefined") return () => undefined;

  const handleChange = () => {
    creatorSavedCoursesSnapshot = readCreatorSavedCoursesFromStorage();
    listener();
  };
  const handleStorage = (event: StorageEvent) => {
    if (event.key === CREATOR_SAVED_COURSES_STORAGE_KEY) handleChange();
  };

  window.addEventListener(CREATOR_SAVED_COURSES_CHANGED_EVENT, handleChange);
  window.addEventListener("storage", handleStorage);

  return () => {
    window.removeEventListener(CREATOR_SAVED_COURSES_CHANGED_EVENT, handleChange);
    window.removeEventListener("storage", handleStorage);
  };
};

export const upsertCreatorSavedCourse = (savedCourse: SavedCreatorCourse) => {
  const nextCourses = [
    savedCourse,
    ...loadCreatorSavedCourses().filter((course) => course.id !== savedCourse.id),
  ];
  saveCreatorSavedCourses(nextCourses);
  return nextCourses;
};

export const deleteCreatorSavedCourse = (courseId: string) => {
  const nextCourses = loadCreatorSavedCourses().filter((course) => course.id !== courseId);
  saveCreatorSavedCourses(nextCourses);
  return nextCourses;
};

export const toCatalogCourse = (savedCourse: SavedCreatorCourse): Course => ({
  id: savedCourse.id,
  title: savedCourse.title,
  category: savedCourse.category,
  level: savedCourse.level,
  duration: savedCourse.duration,
  lessons: savedCourse.lessons,
  rating: 0,
  enrolled: 0,
  progress: 0,
  isEnrolled: false,
  color: P.olive,
  instructor: "Course Creator",
  instructorAvatar: initialsFromName("Course Creator"),
  tags: [
    "Company Course",
    savedCourse.sourceType === "template" ? "Template Copy" : "Custom Course",
  ],
  recommended: false,
  mandatory: false,
  thumbnail: savedCourse.thumbnail,
  preCourseAssessment: savedCourse.preCourseAssessment,
});
