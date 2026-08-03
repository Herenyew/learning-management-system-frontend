export type RootState = Record<string, unknown>;

export const createInitialStoreState = (): RootState => ({});

export { useBackendHealth } from "./backendHealth.store";
export { useCreatorSavedCourses } from "./creatorCourses.store";
