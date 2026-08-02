export type LeaderboardMetric = "xp" | "completion" | "performance";

export type LeaderboardConfig = {
  xp: boolean;
  completion: boolean;
  performance: boolean;
  primary: LeaderboardMetric;
};

export type ProgramLbCriteria = {
  xp: boolean;
  completion: boolean;
  performance: boolean;
  primary: LeaderboardMetric;
};

export const HR_PROGRAMS = [
  "ADIU Onboarding Program",
  "Future Leaders Initiative",
  "2025 Regulatory Compliance Pack",
  "Engineering Excellence Track",
  "Graduate Talent Program",
];

export const METRIC_DEFS: {
  key: LeaderboardMetric;
  label: string;
  desc: string;
  icon: string;
}[] = [
  { key: "xp", label: "XP Points", desc: "Total experience points earned", icon: "⚡" },
  {
    key: "completion",
    label: "Completion Rate",
    desc: "% of program courses completed",
    icon: "✅",
  },
  { key: "performance", label: "Quiz Score", desc: "Average assessment score", icon: "🎯" },
];

export const PREVIEW_DATA: Record<
  LeaderboardMetric,
  { rank: number; name: string; dept: string; value: string; av: string }[]
> = {
  xp: [
    { rank: 1, name: "Aisha Rahman", dept: "Engineering", value: "14,820 XP", av: "AR" },
    { rank: 2, name: "Carlos Mendez", dept: "Product", value: "13,640 XP", av: "CM" },
    { rank: 3, name: "Yuki Tanaka", dept: "Design", value: "12,910 XP", av: "YT" },
  ],
  completion: [
    { rank: 1, name: "Thomas Gruber", dept: "Legal", value: "95%", av: "TG" },
    { rank: 2, name: "Ben Ostrowski", dept: "HR", value: "92%", av: "BO" },
    { rank: 3, name: "Fatima Al-Hassan", dept: "Finance", value: "88%", av: "FA" },
  ],
  performance: [
    { rank: 1, name: "Mei Lin", dept: "Operations", value: "94%", av: "ML" },
    { rank: 2, name: "Priya Nair", dept: "Marketing", value: "91%", av: "PN" },
    { rank: 3, name: "Luca Ferrari", dept: "Sales", value: "87%", av: "LF" },
  ],
};

export type HRLeaderboardEntry = {
  name: string;
  dept: string;
  xp: number;
  completion: number;
  performance: number;
  courses: number;
  badges: number;
  avatar: string;
  trend: "up" | "down" | "same";
};

export const HR_LEADERBOARD_DATA: Record<string, HRLeaderboardEntry[]> = {
  "ADIU Onboarding Program": [
    {
      name: "Mei Lin",
      dept: "Operations",
      xp: 3210,
      completion: 98,
      performance: 95,
      courses: 6,
      badges: 5,
      avatar: "ML",
      trend: "up",
    },
    {
      name: "Thomas Gruber",
      dept: "Legal",
      xp: 2940,
      completion: 95,
      performance: 91,
      courses: 6,
      badges: 4,
      avatar: "TG",
      trend: "up",
    },
    {
      name: "Alex Mercer",
      dept: "Engineering",
      xp: 2780,
      completion: 88,
      performance: 87,
      courses: 5,
      badges: 4,
      avatar: "AM",
      trend: "up",
    },
    {
      name: "Priya Nair",
      dept: "Marketing",
      xp: 2510,
      completion: 82,
      performance: 83,
      courses: 5,
      badges: 3,
      avatar: "PN",
      trend: "same",
    },
    {
      name: "Luca Ferrari",
      dept: "Sales",
      xp: 2310,
      completion: 74,
      performance: 79,
      courses: 4,
      badges: 3,
      avatar: "LF",
      trend: "down",
    },
  ],
  "Future Leaders Initiative": [
    {
      name: "Aisha Rahman",
      dept: "Engineering",
      xp: 4820,
      completion: 92,
      performance: 89,
      courses: 8,
      badges: 5,
      avatar: "AR",
      trend: "up",
    },
    {
      name: "Carlos Mendez",
      dept: "Product",
      xp: 4640,
      completion: 88,
      performance: 94,
      courses: 8,
      badges: 4,
      avatar: "CM",
      trend: "up",
    },
    {
      name: "Alex Mercer",
      dept: "Engineering",
      xp: 4250,
      completion: 84,
      performance: 86,
      courses: 7,
      badges: 4,
      avatar: "AM",
      trend: "up",
    },
    {
      name: "Yuki Tanaka",
      dept: "Design",
      xp: 3910,
      completion: 79,
      performance: 82,
      courses: 6,
      badges: 3,
      avatar: "YT",
      trend: "same",
    },
    {
      name: "Fatima Al-Hassan",
      dept: "Finance",
      xp: 3800,
      completion: 76,
      performance: 78,
      courses: 6,
      badges: 3,
      avatar: "FA",
      trend: "down",
    },
  ],
  "2025 Regulatory Compliance Pack": [
    {
      name: "Ben Ostrowski",
      dept: "HR",
      xp: 1940,
      completion: 100,
      performance: 90,
      courses: 5,
      badges: 4,
      avatar: "BO",
      trend: "up",
    },
    {
      name: "Fatima Al-Hassan",
      dept: "Finance",
      xp: 1810,
      completion: 96,
      performance: 86,
      courses: 5,
      badges: 3,
      avatar: "FA",
      trend: "up",
    },
    {
      name: "Thomas Gruber",
      dept: "Legal",
      xp: 1760,
      completion: 92,
      performance: 84,
      courses: 4,
      badges: 3,
      avatar: "TG",
      trend: "same",
    },
    {
      name: "Alex Mercer",
      dept: "Engineering",
      xp: 1540,
      completion: 81,
      performance: 80,
      courses: 4,
      badges: 2,
      avatar: "AM",
      trend: "up",
    },
    {
      name: "Luca Ferrari",
      dept: "Sales",
      xp: 1390,
      completion: 68,
      performance: 76,
      courses: 3,
      badges: 2,
      avatar: "LF",
      trend: "down",
    },
  ],
  "Engineering Excellence Track": [
    {
      name: "Yuki Tanaka",
      dept: "Design",
      xp: 5820,
      completion: 94,
      performance: 96,
      courses: 9,
      badges: 7,
      avatar: "YT",
      trend: "up",
    },
    {
      name: "Alex Mercer",
      dept: "Engineering",
      xp: 5640,
      completion: 91,
      performance: 93,
      courses: 9,
      badges: 6,
      avatar: "AM",
      trend: "up",
    },
    {
      name: "Carlos Mendez",
      dept: "Product",
      xp: 5010,
      completion: 87,
      performance: 88,
      courses: 8,
      badges: 5,
      avatar: "CM",
      trend: "same",
    },
    {
      name: "Priya Nair",
      dept: "Marketing",
      xp: 4310,
      completion: 80,
      performance: 84,
      courses: 7,
      badges: 4,
      avatar: "PN",
      trend: "up",
    },
    {
      name: "Mei Lin",
      dept: "Operations",
      xp: 3890,
      completion: 72,
      performance: 81,
      courses: 6,
      badges: 4,
      avatar: "ML",
      trend: "down",
    },
  ],
  "Graduate Talent Program": [
    {
      name: "Fatima Al-Hassan",
      dept: "Finance",
      xp: 3920,
      completion: 97,
      performance: 89,
      courses: 12,
      badges: 6,
      avatar: "FA",
      trend: "up",
    },
    {
      name: "Ben Ostrowski",
      dept: "HR",
      xp: 3740,
      completion: 93,
      performance: 86,
      courses: 11,
      badges: 5,
      avatar: "BO",
      trend: "up",
    },
    {
      name: "Luca Ferrari",
      dept: "Sales",
      xp: 3310,
      completion: 85,
      performance: 82,
      courses: 10,
      badges: 4,
      avatar: "LF",
      trend: "same",
    },
    {
      name: "Alex Mercer",
      dept: "Engineering",
      xp: 2980,
      completion: 78,
      performance: 80,
      courses: 9,
      badges: 4,
      avatar: "AM",
      trend: "up",
    },
    {
      name: "Thomas Gruber",
      dept: "Legal",
      xp: 2760,
      completion: 70,
      performance: 77,
      courses: 8,
      badges: 3,
      avatar: "TG",
      trend: "down",
    },
  ],
};

export const HR_METRIC_HEADERS: Record<LeaderboardMetric, string[]> = {
  xp: ["Rank", "Learner", "Department", "XP Earned", "Courses", "Badges"],
  completion: ["Rank", "Learner", "Department", "Completion %", "Courses", "On-Time"],
  performance: ["Rank", "Learner", "Department", "Avg. Score", "Courses", "Progress"],
};

export function getMetricScore(entry: HRLeaderboardEntry, metric: LeaderboardMetric) {
  if (metric === "xp") return entry.xp;
  if (metric === "completion") return entry.completion;
  return entry.performance;
}

export function formatMetricScore(entry: HRLeaderboardEntry, metric: LeaderboardMetric) {
  const value = getMetricScore(entry, metric);
  return metric === "xp" ? `${value.toLocaleString()} XP` : `${value}%`;
}

export function getMetricExtra(entry: HRLeaderboardEntry, metric: LeaderboardMetric) {
  if (metric === "xp") return String(entry.badges);
  if (metric === "completion") return entry.completion >= 90 ? "On time" : "At risk";
  return `${Math.max(42, entry.performance - 8)}%`;
}
