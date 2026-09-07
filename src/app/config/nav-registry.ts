import type React from "react";
import {
  Award,
  BarChart2,
  BookOpen,
  Calendar,
  HelpCircle,
  LayoutDashboard,
  Layers,
  Settings,
  Target,
  Trophy,
  User,
  Video,
  Wand2,
} from "lucide-react";
import type { NavGroup } from "../constants/navigation.constants";
import type { Screen } from "../models/app.model";

export type NavItem = {
  key: string;
  label: string;
  screen: Screen;
  permission: string;
  group?: string;
  icon?: React.ElementType;
};

/**
 * Single source of truth for all navigation items.
 * Each item declares the permission required to see it.
 * The sidebar filters this list based on the user's current permissions.
 *
 * Permission codes align with the backend LmsPermission catalog.
 */
export const NAV_REGISTRY: NavItem[] = [
  // ─── Dashboard ─────────────────────────────────────────────
  {
    key: "dashboard",
    label: "Dashboard",
    screen: "dashboard",
    permission: "course.read",
    group: "main",
    icon: LayoutDashboard,
  },

  // ─── Learning ──────────────────────────────────────────────
  {
    key: "catalog",
    label: "Course Catalog",
    screen: "catalog",
    permission: "course.read",
    group: "learning",
    icon: BookOpen,
  },
  {
    key: "programs",
    label: "Learning Programs",
    screen: "programs",
    permission: "program.read",
    group: "learning",
    icon: Layers,
  },
  {
    key: "certificates",
    label: "My Certificates",
    screen: "certificates",
    permission: "certificate.read",
    group: "learning",
    icon: Award,
  },
  {
    key: "calendar",
    label: "Training Calendar",
    screen: "calendar",
    permission: "course.read",
    group: "learning",
    icon: Calendar,
  },
  {
    key: "leaderboard",
    label: "Leaderboard",
    screen: "leaderboard",
    permission: "xp_rule.read",
    group: "learning",
    icon: Trophy,
  },

  // ─── Creator ───────────────────────────────────────────────
  {
    key: "my-courses-builder",
    label: "My Courses",
    screen: "my-courses-builder",
    permission: "course.create",
    group: "creator",
    icon: BookOpen,
  },
  {
    key: "question-bank",
    label: "Question Bank",
    screen: "question-bank",
    permission: "question_type.read",
    group: "creator",
    icon: HelpCircle,
  },
  {
    key: "live-sessions",
    label: "Live Sessions",
    screen: "live-sessions",
    permission: "course.read",
    group: "creator",
    icon: Video,
  },

  // ─── Manager ───────────────────────────────────────────────
  {
    key: "manager",
    label: "Team Dashboard",
    screen: "manager",
    permission: "analytics.view",
    group: "manager",
    icon: LayoutDashboard,
  },
  {
    key: "effectiveness",
    label: "Team Effectiveness",
    screen: "effectiveness",
    permission: "training_effectiveness.read",
    group: "manager",
    icon: BarChart2,
  },
  {
    key: "tna-form",
    label: "Submit TNA Request",
    screen: "tna-form",
    permission: "tna.submit",
    group: "manager",
    icon: Target,
  },

  // ─── HR / Admin ────────────────────────────────────────────
  {
    key: "hr-dashboard",
    label: "HR Dashboard",
    screen: "hr-dashboard",
    permission: "course.read",
    group: "hr",
    icon: LayoutDashboard,
  },
  {
    key: "program-dashboard",
    label: "Program Overview",
    screen: "program-dashboard",
    permission: "program.read",
    group: "hr",
    icon: Layers,
  },
  {
    key: "hr-programs",
    label: "Program Management",
    screen: "hr-programs",
    permission: "program.read",
    group: "hr",
    icon: Layers,
  },
  {
    key: "hr-publishing",
    label: "Publishing Requests",
    screen: "hr-publishing",
    permission: "course.publish",
    group: "hr",
    icon: Wand2,
  },
  {
    key: "assignments",
    label: "Assignments",
    screen: "assignments",
    permission: "program.read",
    group: "hr",
    icon: Layers,
  },
  {
    key: "tna-agg",
    label: "TNA Dashboard",
    screen: "tna-agg",
    permission: "tna.read",
    group: "hr",
    icon: Target,
  },
  {
    key: "certification-mgmt",
    label: "Certificate Management",
    screen: "certification-mgmt",
    permission: "certificate_template.read",
    group: "hr",
    icon: Award,
  },
  {
    key: "moderation-center",
    label: "Content Moderation",
    screen: "moderation-center",
    permission: "course.moderate",
    group: "hr",
    icon: Settings,
  },
  {
    key: "hr-leaderboard-mgmt",
    label: "Leaderboard Management",
    screen: "hr-leaderboard-mgmt",
    permission: "xp_rule.read",
    group: "hr",
    icon: Trophy,
  },
  {
    key: "scorm",
    label: "SCORM / xAPI",
    screen: "scorm",
    permission: "content_type.read",
    group: "hr",
    icon: Settings,
  },

  // ─── Configuration Center ──────────────────────────────────
  {
    key: "config-center",
    label: "Configuration Center",
    screen: "config-center",
    permission: "access_control.manage",
    group: "configuration",
    icon: Settings,
  },

  // ─── Analytics ─────────────────────────────────────────────
  {
    key: "analytics-center",
    label: "Analytics Center",
    screen: "analytics-center",
    permission: "analytics.view",
    group: "analytics",
    icon: BarChart2,
  },
  {
    key: "analytics",
    label: "Analytics",
    screen: "analytics",
    permission: "analytics.view",
    group: "analytics",
    icon: BarChart2,
  },

  // ─── TNA ──────────────────────────────────────────────────
  {
    key: "tna",
    label: "Training Needs",
    screen: "tna",
    permission: "tna.submit",
    group: "tna",
    icon: Target,
  },
];

/**
 * Filter nav items by current user permissions.
 * Used by Sidebar to render only what the user can access.
 */
export function getVisibleNavItems(can: (permission: string) => boolean): NavItem[] {
  return NAV_REGISTRY.filter((item) => can(item.permission));
}

/**
 * Get the first nav item the user has permission to access.
 * Used as fallback landing page for unknown/custom roles.
 */
export function getFirstPermittedNavItem(
  can: (permission: string) => boolean,
): NavItem | undefined {
  return NAV_REGISTRY.find((item) => can(item.permission));
}

/**
 * Map of screen ID → required permission code.
 * Built once from NAV_REGISTRY for O(1) lookups.
 */
const SCREEN_PERMISSION_MAP: Record<string, string> = NAV_REGISTRY.reduce(
  (acc, item) => {
    acc[item.screen] = item.permission;
    return acc;
  },
  {} as Record<string, string>,
);

/**
 * Get the permission required to access a given screen.
 * Returns undefined if the screen is not in the registry.
 */
export function getPermissionForScreen(screen: string): string | undefined {
  return SCREEN_PERMISSION_MAP[screen];
}

/**
 * Build NavGroup[] from filtered registry items.
 * Used by Sidebar to render grouped navigation for roles with many items.
 *
 * Groups items by their `group` field and produces NavGroup objects
 * compatible with the existing GroupedSidebarNav component.
 */
export function buildNavGroups(items: NavItem[]): NavGroup[] {
  const groupMap = new Map<string, NavItem[]>();

  for (const item of items) {
    const groupName = item.group ?? "Other";
    if (!groupMap.has(groupName)) {
      groupMap.set(groupName, []);
    }
    groupMap.get(groupName)!.push(item);
  }

  const groupLabels: Record<string, string> = {
    main: "Main",
    learning: "Learning",
    creator: "Course Creator",
    manager: "Team Management",
    hr: "HR & Administration",
    configuration: "Configuration Center",
    analytics: "Analytics & Reporting",
    tna: "TNA & Workforce Planning",
  };

  const groupIcons: Record<string, React.ElementType> = {
    main: LayoutDashboard,
    learning: BookOpen,
    creator: BookOpen,
    manager: LayoutDashboard,
    hr: Settings,
    configuration: Settings,
    analytics: BarChart2,
    tna: Target,
  };

  const groups: NavGroup[] = [];
  for (const [groupName, groupItems] of groupMap) {
    groups.push({
      label: groupLabels[groupName] ?? groupName,
      icon: groupIcons[groupName] ?? groupItems[0]?.icon ?? LayoutDashboard,
      target: groupItems[0]?.screen,
      items: groupItems.map((item) => ({
        id: item.screen,
        label: item.label,
        icon: item.icon ?? LayoutDashboard,
      })),
    });
  }

  return groups;
}
