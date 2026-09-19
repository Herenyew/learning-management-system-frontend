import type React from "react";
import {
  Award,
  BarChart2,
  BookOpen,
  Calendar,
  Cpu,
  Eye,
  FileCheck,
  FileText,
  HelpCircle,
  LayoutDashboard,
  Layers,
  ListChecks,
  MessageSquare,
  Settings,
  Target,
  TrendingUp,
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
  /**
   * The primary permission code checked against the user's permission set.
   * A nav item is visible when the user has ALL of: `permission` + every
   * entry in `extraPermissions` (if provided).
   */
  permission: string;
  /**
   * Optional extra permission codes that must ALSO be present for the item
   * to appear. Use this to restrict HR/admin-group items from showing up
   * for roles that happen to share a basic permission (e.g. `course.read`).
   *
   * Design rule:
   *  - Items in the "learning" group: no extra permissions needed.
   *  - Items in the "creator" group:  no extra permissions needed.
   *  - Items in the "manager" group:  no extra permissions needed.
   *  - Items in the "hr" group:       require `tna.view_all` OR a more
   *    specific permission so they are hidden from plain learners / creators.
   *  - Items in the "configuration" group: already require access_control.manage.
   */
  extraPermissions?: string[];
  group?: string;
  icon?: React.ElementType;
};

/**
 * Single source of truth for all navigation items.
 * Each item declares the permission(s) required to see it.
 * The sidebar filters this list based on the user's current permissions.
 *
 * Permission codes align with the backend LmsPermission catalog.
 */
export const NAV_REGISTRY: NavItem[] = [
  // ─── Dashboard (everyone with course access) ─────────────────
  {
    key: "dashboard",
    label: "Dashboard",
    screen: "dashboard",
    permission: "course.read",
    group: "main",
    icon: LayoutDashboard,
  },

  // ─── Learning (everyone) ──────────────────────────────────────
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
    permission: "certificate.view",
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
    permission: "xp_rule.view",
    group: "learning",
    icon: Trophy,
  },

  // ─── Course Creator ───────────────────────────────────────────
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
    permission: "question_type.view",
    // Restrict to users who can actually create/edit courses, not plain learners.
    extraPermissions: ["course.create"],
    group: "creator",
    icon: HelpCircle,
  },
  {
    key: "live-sessions",
    label: "Live Sessions",
    screen: "live-sessions",
    permission: "course.read",
    // Only show to users who also create courses (instructors / creators).
    extraPermissions: ["course.create"],
    group: "creator",
    icon: Video,
  },

  // ─── Manager ──────────────────────────────────────────────────
  {
    key: "manager",
    label: "Team Dashboard",
    screen: "manager",
    permission: "analytics.view",
    // Restrict to workforce managers: analytics alone is not enough.
    extraPermissions: ["tna.view_all"],
    group: "manager",
    icon: LayoutDashboard,
  },
  {
    key: "effectiveness",
    label: "Team Effectiveness",
    screen: "effectiveness",
    permission: "analytics.view",
    extraPermissions: ["tna.view_all"],
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

  // ─── HR / Admin (require tna.view_all as the minimum "is management" signal) ──
  {
    key: "hr-dashboard",
    label: "HR Dashboard",
    screen: "hr-dashboard",
    permission: "course.read",
    extraPermissions: ["tna.view_all"],
    group: "hr",
    icon: LayoutDashboard,
  },

  // ─── HR grouped: Learning Programs ────────────────────────────
  {
    key: "program-dashboard",
    label: "Program Overview",
    screen: "program-dashboard",
    permission: "program.read",
    extraPermissions: ["tna.view_all"],
    group: "hr",
    icon: LayoutDashboard,
  },
  {
    key: "hr-programs",
    label: "Program Management",
    screen: "hr-programs",
    permission: "program.read",
    extraPermissions: ["tna.view_all"],
    group: "hr",
    icon: Layers,
  },
  {
    key: "hr-publishing",
    label: "Publishing Requests",
    screen: "hr-publishing",
    permission: "approval_workflow.manage",
    group: "hr",
    icon: FileCheck,
  },
  {
    key: "assignments",
    label: "Assignments",
    screen: "assignments",
    permission: "course.read",
    extraPermissions: ["tna.view_all"],
    group: "hr",
    icon: ListChecks,
  },
  {
    key: "surveys",
    label: "Surveys & Feedback",
    screen: "surveys",
    permission: "survey_template.view",
    extraPermissions: ["tna.view_all"],
    group: "hr",
    icon: MessageSquare,
  },

  // ─── HR grouped: TNA & Workforce Planning ──────────────────────
  {
    key: "tna-agg",
    label: "TNA Dashboard",
    screen: "tna-agg",
    permission: "tna.view_all",
    group: "hr",
    icon: Target,
  },

  // ─── HR grouped: Certificate Management ───────────────────────
  {
    key: "certification-mgmt",
    label: "Certificate Management",
    screen: "certification-mgmt",
    permission: "certificate.issue",
    group: "hr",
    icon: Award,
  },

  // ─── HR grouped: Content Moderation ───────────────────────────
  {
    key: "moderation-center",
    label: "Content Moderation",
    screen: "moderation-center",
    permission: "moderation.manage",
    group: "hr",
    icon: Eye,
  },

  // ─── HR grouped: Leaderboard Management ───────────────────────
  {
    key: "hr-leaderboard-mgmt",
    label: "Leaderboard Management",
    screen: "hr-leaderboard-mgmt",
    permission: "gamification_config.manage",
    group: "hr",
    icon: Trophy,
  },

  // ─── HR grouped: Analytics & Reporting ────────────────────────
  {
    key: "analytics-center",
    label: "Analytics Center",
    screen: "analytics-center",
    permission: "analytics.view",
    extraPermissions: ["tna.view_all"],
    group: "hr",
    icon: BarChart2,
  },
  {
    key: "scorm",
    label: "SCORM / xAPI",
    screen: "scorm",
    permission: "content_type.view",
    extraPermissions: ["tna.view_all"],
    group: "hr",
    icon: Cpu,
  },

  // ─── Configuration Center ──────────────────────────────────────
  {
    key: "config-center",
    label: "Configuration Center",
    screen: "config-center",
    permission: "access_control.manage",
    group: "configuration",
    icon: Settings,
  },
];

/**
 * Filter nav items by current user permissions.
 * Used by Sidebar to render only what the user can access.
 *
 * An item is visible when:
 *   can(item.permission) === true
 *   AND can(...item.extraPermissions) === true  (if extraPermissions is set)
 */
/**
 * Returns true when the user passes every permission required for the item.
 * Checks the primary `permission` first, then every entry in `extraPermissions`.
 */
function hasAllPermissions(can: (permission: string) => boolean, item: NavItem): boolean {
  if (!can(item.permission)) return false;
  if (item.extraPermissions) {
    return item.extraPermissions.every((p) => can(p));
  }
  return true;
}

export function getVisibleNavItems(can: (permission: string) => boolean): NavItem[] {
  return NAV_REGISTRY.filter((item) => hasAllPermissions(can, item));
}

/**
 * Get the first nav item the user has permission to access.
 * Used as fallback landing page for unknown/custom roles.
 */
export function getFirstPermittedNavItem(
  can: (permission: string) => boolean,
): NavItem | undefined {
  return NAV_REGISTRY.find((item) => hasAllPermissions(can, item));
}

/**
 * Map of screen ID → required permission code.
 * Built once from NAV_REGISTRY for O(1) lookups.
 * Note: does not encode extraPermissions — use getVisibleNavItems for full filtering.
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
