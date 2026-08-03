import type { CatItem, LevelItem } from "../models/catalog.model";
import { P } from "./theme.constants";

export const INIT_CATEGORIES: CatItem[] = [
  { id: "cat1", name: "Technology", color: P.olive, courseCount: 2, active: true },
  { id: "cat2", name: "Leadership", color: P.darkOlive, courseCount: 3, active: true },
  { id: "cat3", name: "Compliance", color: "#C0392B", courseCount: 2, active: true },
  { id: "cat4", name: "Soft Skills", color: P.sage, courseCount: 1, active: true },
  { id: "cat5", name: "Finance", color: P.gold, courseCount: 1, active: true },
  { id: "cat6", name: "Design", color: "#8B6914", courseCount: 1, active: true },
  { id: "cat7", name: "Management", color: "#4A7A5A", courseCount: 1, active: true },
];

export const INIT_LEVELS: LevelItem[] = [
  { id: "lv1", name: "Beginner", order: 1, color: "#5A7A2A", active: true, xpThreshold: 0 },
  { id: "lv2", name: "Intermediate", order: 2, color: P.gold, active: true, xpThreshold: 2000 },
  { id: "lv3", name: "Advanced", order: 3, color: "#C0392B", active: true, xpThreshold: 5000 },
];

export const COLOR_PRESETS = [
  P.olive,
  P.darkOlive,
  "#C0392B",
  P.sage,
  P.gold,
  "#8B6914",
  "#4A7A5A",
  "#5A7A2A",
  "#2563EB",
  "#7C3AED",
];
