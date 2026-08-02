import type React from "react";
import {
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
  Users,
  Video,
  Wand2,
} from "lucide-react";
import type { Role, Screen } from "../models/app.model";

// ─── Sidebar ──────────────────────────────────────────────────

const NAV_LEARNER = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "catalog", label: "Course Catalog", icon: BookOpen },
  { id: "programs", label: "Learning Programs", icon: Layers },
  { id: "calendar", label: "Training Calendar", icon: Calendar },
  { id: "leaderboard", label: "Leaderboard", icon: Trophy },
  { id: "profile", label: "My Profile", icon: User },
];

// Flat fallback nav (used for ROLE_NAV map only)
const NAV_HR = [
  { id: "hr-dashboard", label: "HR Dashboard", icon: LayoutDashboard },
  { id: "config-center", label: "Configuration", icon: Settings },
  { id: "analytics-center", label: "Analytics", icon: BarChart2 },
];

export const NAV_MANAGER = [
  { id: "manager", label: "Team Dashboard", icon: Users },
  { id: "effectiveness", label: "Team Effectiveness", icon: TrendingUp },
  { id: "tna-form", label: "Submit TNA Request", icon: Target },
  { id: "calendar", label: "Team Calendar", icon: Calendar },
  { id: "analytics-center", label: "Team Reports", icon: BarChart2 },
];

export const NAV_CREATOR = [
  { id: "my-courses-builder", label: "My Courses", icon: BookOpen },
  { id: "question-bank", label: "Question Bank", icon: HelpCircle },
  { id: "live-sessions", label: "Live Sessions", icon: Video },
  { id: "analytics-center", label: "Course Analytics", icon: BarChart2 },
];

export const NAV_ADMIN = [
  { id: "hr-dashboard", label: "Admin Overview", icon: LayoutDashboard },
  { id: "analytics-center", label: "Analytics Center", icon: BarChart2 },
  { id: "config-center", label: "Configuration Center", icon: Settings },
  { id: "my-courses-builder", label: "Course Builder", icon: Wand2 },
  { id: "catalog", label: "Course Catalog", icon: BookOpen },
];

// Grouped collapsible nav for HR/Admin roles
export type NavItemDef = { id: string; label: string; icon: React.ElementType };

export type NavGroup = {
  label: string;
  items: NavItemDef[];
  standalone?: boolean;
  target?: Screen;
  icon?: React.ElementType;
};

export const HR_NAV_GROUPS: NavGroup[] = [
  {
    label: "Learning Programs",
    target: "program-dashboard",
    icon: Layers,
    items: [
      { id: "program-dashboard", label: "Program Overview", icon: LayoutDashboard },
      { id: "hr-programs", label: "Program Management", icon: Layers },
      { id: "hr-publishing", label: "Publishing Requests", icon: FileCheck },
      { id: "assignments", label: "Assignments", icon: ListChecks },
      { id: "live-sessions", label: "Live Sessions", icon: Video },
      { id: "surveys", label: "Surveys & Feedback", icon: MessageSquare },
    ],
  },
  {
    label: "TNA & Workforce Planning",
    target: "tna-agg",
    icon: Target,
    items: [
      { id: "tna-agg", label: "TNA Dashboard", icon: Target },
      { id: "tna-form", label: "TNA Requests", icon: FileText },
      { id: "effectiveness", label: "Effectiveness Analysis", icon: TrendingUp },
    ],
  },
  {
    label: "Configuration Center",
    standalone: true,
    items: [{ id: "config-center", label: "Configuration Center", icon: Settings }],
  },
  {
    label: "Content Moderation",
    standalone: true,
    items: [{ id: "moderation-center", label: "Content Moderation", icon: Eye }],
  },
  {
    label: "Leaderboard Management",
    standalone: true,
    items: [{ id: "hr-leaderboard-mgmt", label: "Leaderboard Management", icon: Trophy }],
  },
  {
    label: "Analytics & Reporting",
    target: "analytics-center",
    icon: BarChart2,
    items: [
      { id: "analytics-center", label: "Analytics Center", icon: BarChart2 },
      { id: "question-bank", label: "Question Bank", icon: HelpCircle },
      { id: "scorm", label: "SCORM / xAPI", icon: Cpu },
    ],
  },
];

export const ADMIN_NAV_GROUPS: NavGroup[] = [
  {
    label: "Overview",
    target: "hr-dashboard",
    icon: LayoutDashboard,
    items: [{ id: "hr-dashboard", label: "Admin Overview", icon: LayoutDashboard }],
  },
  ...HR_NAV_GROUPS,
  {
    label: "Course Management",
    target: "my-courses-builder",
    icon: Wand2,
    items: [
      { id: "my-courses-builder", label: "Course Builder", icon: Wand2 },
      { id: "catalog", label: "Course Catalog", icon: BookOpen },
    ],
  },
];

export const ROLE_NAV: Record<Role, typeof NAV_LEARNER> = {
  learner: NAV_LEARNER as typeof NAV_LEARNER,
  hr: NAV_HR as typeof NAV_LEARNER,
  manager: NAV_MANAGER as typeof NAV_LEARNER,
  creator: NAV_CREATOR as typeof NAV_LEARNER,
  admin: NAV_ADMIN as typeof NAV_LEARNER,
};
