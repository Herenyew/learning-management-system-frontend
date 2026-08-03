import { useSyncExternalStore } from "react";
import {
  loadCreatorSavedCourses,
  subscribeCreatorSavedCourses,
} from "../app/services/creatorCourses.service";

export const useCreatorSavedCourses = () =>
  useSyncExternalStore(subscribeCreatorSavedCourses, loadCreatorSavedCourses, () => []);
