import { P } from "./theme";
import {
  Activity,
  Cpu,
  FileCheck,
  FileText,
  HelpCircle,
  Link,
  MessageSquare,
  Music,
  Users,
  Video,
} from "lucide-react";

export type CertificationTemplate = {
  id: string;
  name: string;
  signers: string[];
  hasStamp: boolean;
  active: number;
  archived: number;
  color: string;
  designMode?: "Preset" | "Scratch";
  borderLabel?: string;
};

export const CERT_TEMPLATES: CertificationTemplate[] = [
  {
    id: "ct1",
    name: "Standard Completion Certificate",
    signers: ["Dr. Sarah Chen", "L&D Director"],
    hasStamp: true,
    active: 31,
    archived: 54,
    color: P.olive,
  },
  {
    id: "ct2",
    name: "Executive Leadership Credential",
    signers: ["CEO", "CHRO"],
    hasStamp: true,
    active: 3,
    archived: 5,
    color: P.gold,
  },
  {
    id: "ct3",
    name: "Compliance Attestation",
    signers: ["Chief Compliance Officer"],
    hasStamp: true,
    active: 14,
    archived: 28,
    color: "#C0392B",
  },
];

export type CreatorCertificateTemplate = {
  id: string;
  name: string;
  shortName: string;
  signers: string[];
  accent: string;
  layout: string;
  purpose: string;
  sealLabel: string;
  criteria: string[];
};

export const CREATOR_CERTIFICATE_TEMPLATES: CreatorCertificateTemplate[] = [
  {
    id: "standard",
    name: "Standard Completion Certificate",
    shortName: "Standard Completion",
    signers: ["Dr. Sarah Chen (Instructor)", "Alex HR Director"],
    accent: P.olive,
    layout: "Landscape completion layout",
    purpose: "General course completion certificate for standard learning paths.",
    sealLabel: "Official LMS stamp",
    criteria: ["Course completed", "Minimum score reached", "Issued automatically"],
  },
  {
    id: "leadership",
    name: "Executive Leadership Credential",
    shortName: "Leadership Credential",
    signers: ["CEO", "CHRO"],
    accent: P.gold,
    layout: "Executive landscape layout",
    purpose: "Formal credential for leadership and manager development programs.",
    sealLabel: "Executive approval seal",
    criteria: ["Course completed", "Leadership assessment passed", "Executive sign-off"],
  },
  {
    id: "compliance",
    name: "Compliance Attestation Certificate",
    shortName: "Compliance Attestation",
    signers: ["Compliance Officer", "HR Director"],
    accent: "#C0392B",
    layout: "Audit-ready attestation layout",
    purpose: "Regulatory and policy attestation certificate with compliance signers.",
    sealLabel: "Compliance seal",
    criteria: ["Mandatory content completed", "Assessment passed", "Audit record stored"],
  },
];

export const CERT_TEMPLATE_STORAGE_KEY = "learnos_certificate_templates";

export const EXTERNAL_PROVIDERS = [
  {
    name: "Amazon Web Services",
    short: "AWS",
    logo: "☁️",
    certs: ["Cloud Practitioner", "Solutions Architect"],
    status: "Integrated",
    learners: 48,
  },
  {
    name: "Google Cloud",
    short: "GCP",
    logo: "🔵",
    certs: ["Cloud Digital Leader", "Data Engineer"],
    status: "Integrated",
    learners: 31,
  },
  {
    name: "PMI",
    short: "PMI",
    logo: "📋",
    certs: ["PMP", "CAPM", "PMI-ACP"],
    status: "Manual",
    learners: 18,
  },
  {
    name: "CompTIA",
    short: "CompTIA",
    logo: "🔒",
    certs: ["Security+", "Network+"],
    status: "Integrated",
    learners: 62,
  },
  {
    name: "Microsoft",
    short: "MSFT",
    logo: "🪟",
    certs: ["Azure Fundamentals", "Power BI"],
    status: "Integrated",
    learners: 74,
  },
];

export const VERSIONS = [
  {
    version: "v2.1",
    status: "Published",
    date: "Jan 15, 2025",
    current: true,
    notes: "Added Module 4 — Ethics & Responsible AI",
  },
  {
    version: "v2.0",
    status: "Published",
    date: "Dec 10, 2024",
    current: false,
    notes: "Redesigned Module 2 with new case studies",
  },
  {
    version: "v1.5",
    status: "Archived",
    date: "Oct 5, 2024",
    current: false,
    notes: "Minor quiz corrections",
  },
  {
    version: "v1.0",
    status: "Original",
    date: "Jul 20, 2024",
    current: false,
    notes: "Initial release",
  },
];

export const CONTENT_TYPES = [
  { icon: Video, label: "Video", color: P.olive },
  { icon: FileText, label: "Document", color: P.darkOlive },
  { icon: HelpCircle, label: "Quiz", color: P.gold },
  { icon: Cpu, label: "SCORM / xAPI", color: P.textMid },
  { icon: Music, label: "Audio", color: "#8B6914" },
  { icon: Activity, label: "Interactive Video", color: "#4A7A5A" },
  { icon: FileCheck, label: "Assignment", color: "#C0392B" },
  { icon: MessageSquare, label: "Survey", color: "#5A7A2A" },
  { icon: Users, label: "Live Session", color: P.sage },
  { icon: Link, label: "External Link", color: "#1D4ED8" },
];

export const ANALYTICS_TREND = [
  { month: "Sep", completions: 342, enrollments: 580 },
  { month: "Oct", completions: 410, enrollments: 640 },
  { month: "Nov", completions: 520, enrollments: 780 },
  { month: "Dec", completions: 610, enrollments: 890 },
  { month: "Jan", completions: 680, enrollments: 950 },
];

// ─── Shared micro-components ──────────────────────────────────
