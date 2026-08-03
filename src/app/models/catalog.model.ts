// ─── CATALOG CONFIG ───────────────────────────────────────────

export type CatItem = {
  id: string;
  name: string;
  color: string;
  courseCount: number;
  active: boolean;
};

export type LevelItem = {
  id: string;
  name: string;
  order: number;
  color: string;
  active: boolean;
  xpThreshold: number;
};
