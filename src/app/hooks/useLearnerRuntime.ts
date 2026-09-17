import { useCallback, useEffect, useState } from "react";
import { learnerEnrollmentApi } from "../API/learnerEnrollment.api";
import type {
  LearnerCatalogVersion,
  LearnerCourseEnrollment,
  LearnerProgramEnrollment,
} from "../models/enrollment.model";

export function useLearnerRuntime(enabled: boolean) {
  const [catalog, setCatalog] = useState<LearnerCatalogVersion[]>([]);
  const [courses, setCourses] = useState<LearnerCourseEnrollment[]>([]);
  const [programs, setPrograms] = useState<LearnerProgramEnrollment[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async (signal?: AbortSignal) => {
    if (!enabled) return;
    setLoading(true);
    setError(null);
    try {
      const [nextCatalog, nextCourses, nextPrograms] = await Promise.all([
        learnerEnrollmentApi.listCatalog(signal),
        learnerEnrollmentApi.listMine(signal),
        learnerEnrollmentApi.listMyPrograms(signal),
      ]);
      setCatalog(nextCatalog);
      setCourses(nextCourses);
      setPrograms(nextPrograms);
    } catch (requestError) {
      if (signal?.aborted) return;
      setError(requestError instanceof Error ? requestError.message : "Unable to load learning progress.");
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    const controller = new AbortController();
    void refresh(controller.signal);
    return () => controller.abort();
  }, [refresh]);

  const enrollCourse = useCallback(async (courseVersionId: number) => {
    const enrollment = await learnerEnrollmentApi.enrollCourse(courseVersionId);
    await refresh();
    return enrollment;
  }, [refresh]);

  return { catalog, courses, programs, loading, error, refresh, enrollCourse };
}
