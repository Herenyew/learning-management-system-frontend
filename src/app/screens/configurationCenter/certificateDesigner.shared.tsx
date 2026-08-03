import React from "react";
import {
  BookOpen,
  Clock,
  Image as ImageIcon,
  Shield,
  Square,
  Type,
  User,
  UserCheck,
} from "lucide-react";
import { P } from "./configuration.shared";

export type CertificateDesignMode = "preset" | "scratch";
export type CertificateCanvasOrientation = "landscape" | "portrait";
export type CertificateBackgroundType = "solid" | "gradient" | "image" | "template";
export type CertificatePresetStyle =
  | "classic"
  | "executive"
  | "compliance"
  | "blueRibbon"
  | "navyWave"
  | "geometric"
  | "goldSeal"
  | "minimalFrame";
export type CertificateBorderStyle =
  | "none"
  | "single"
  | "double"
  | "dashed"
  | "dotted"
  | "corner"
  | "inset"
  | "banded";
export type CertificateElementType =
  | "logo"
  | "title"
  | "learner"
  | "course"
  | "date"
  | "signers"
  | "stamp"
  | "qr";
export type CertificateTextAlign = "left" | "center" | "right";

export type CertificateElement = {
  id: string;
  type: CertificateElementType;
  label: string;
  value: string;
  x: number;
  y: number;
  w: number;
  h: number;
  fontSize: number;
  color: string;
  align: CertificateTextAlign;
  visible: boolean;
  locked?: boolean;
};

export type CertificateDesignPreset = {
  id: string;
  name: string;
  desc: string;
  category: "Completion" | "Appreciation" | "Participation" | "Compliance" | "Corporate";
  accent: string;
  secondary: string;
  bg: string;
  border: string;
  style: CertificatePresetStyle;
};

export const CERT_DYNAMIC_FIELDS = [
  "{learnerName}",
  "{courseName}",
  "{completionDate}",
  "{certificateId}",
  "{expiryDate}",
  "{primarySigner}",
  "{secondarySigner}",
];

export const CERT_DESIGN_BLOCK_LIBRARY = [
  { type: "logo", label: "Logo", icon: ImageIcon },
  { type: "title", label: "Title", icon: Type },
  { type: "learner", label: "Learner name", icon: User },
  { type: "course", label: "Course", icon: BookOpen },
  { type: "date", label: "Date and ID", icon: Clock },
  { type: "signers", label: "Signers", icon: UserCheck },
  { type: "stamp", label: "Stamp", icon: Shield },
  { type: "qr", label: "QR", icon: Square },
] as { type: CertificateElementType; label: string; icon: React.ElementType }[];

export const CERTIFICATE_DESIGN_PRESETS: CertificateDesignPreset[] = [
  {
    id: "blue-ribbon",
    name: "Blue Elegant Completion",
    desc: "Formal blue linework with diagonal ribbon accents",
    category: "Completion",
    accent: "#1769A6",
    secondary: "#20205F",
    bg: "#FFFFFF",
    border: "#1769A6",
    style: "blueRibbon",
  },
  {
    id: "navy-gold-wave",
    name: "Gold & Navy Appreciation",
    desc: "Modern navy waves, gold medal, and polished whitespace",
    category: "Appreciation",
    accent: "#0C2D57",
    secondary: "#D4A62A",
    bg: "#FDFDFB",
    border: "#0C2D57",
    style: "navyWave",
  },
  {
    id: "geometric-participation",
    name: "Geometric Participation",
    desc: "Bold side pattern for participation and event awards",
    category: "Participation",
    accent: "#D96559",
    secondary: "#A87478",
    bg: "#FFF3DF",
    border: "#E3C98C",
    style: "geometric",
  },
  {
    id: "gold-seal",
    name: "Formal Gold Seal",
    desc: "Ornate gold border for executive and board-level awards",
    category: "Appreciation",
    accent: "#B88926",
    secondary: "#1E3151",
    bg: "#FFFDF7",
    border: "#D9B968",
    style: "goldSeal",
  },
  {
    id: "minimal-frame",
    name: "Corporate Minimal Frame",
    desc: "Quiet professional frame for internal certifications",
    category: "Corporate",
    accent: P.olive,
    secondary: P.sage,
    bg: "#FBFCF7",
    border: P.border,
    style: "minimalFrame",
  },
  {
    id: "classic",
    name: "Classic Completion",
    desc: "Formal bordered certificate for standard course completion",
    category: "Completion",
    accent: P.olive,
    secondary: P.gold,
    bg: "#FBFCF7",
    border: P.border,
    style: "classic",
  },
  {
    id: "executive",
    name: "Executive Credential",
    desc: "Premium leadership layout with gold emphasis",
    category: "Corporate",
    accent: P.gold,
    secondary: P.olive,
    bg: "#FFFDF6",
    border: P.goldMid,
    style: "executive",
  },
  {
    id: "compliance",
    name: "Compliance Attestation",
    desc: "Audit-ready certificate for mandatory training",
    category: "Compliance",
    accent: "#C0392B",
    secondary: "#7A1F14",
    bg: "#FFF8F6",
    border: "#F2C0B7",
    style: "compliance",
  },
];

export const CERT_BORDER_OPTIONS = [
  {
    id: "double",
    label: "Double line",
    desc: "Formal classic frame",
    line: "double",
  },
  {
    id: "single",
    label: "Single line",
    desc: "Clean minimal frame",
    line: "solid",
  },
  {
    id: "dashed",
    label: "Dashed",
    desc: "Modern approval style",
    line: "dashed",
  },
  {
    id: "dotted",
    label: "Dotted",
    desc: "Light decorative edge",
    line: "dotted",
  },
  {
    id: "corner",
    label: "Corner frame",
    desc: "Open edges with accents",
    line: "solid",
  },
  {
    id: "inset",
    label: "Inset frame",
    desc: "Outer and inner lines",
    line: "solid",
  },
  {
    id: "banded",
    label: "Top/bottom bands",
    desc: "Ceremonial bands",
    line: "solid",
  },
  {
    id: "none",
    label: "No border",
    desc: "Background-led design",
    line: "none",
  },
] as {
  id: CertificateBorderStyle;
  label: string;
  desc: string;
  line: "solid" | "double" | "dashed" | "dotted" | "none";
}[];

export const DEFAULT_CERTIFICATE_ELEMENTS: CertificateElement[] = [
  {
    id: "logo",
    type: "logo",
    label: "Organization Logo",
    value: "ADIU",
    x: 7,
    y: 8,
    w: 15,
    h: 8,
    fontSize: 12,
    color: P.olive,
    align: "left",
    visible: true,
    locked: true,
  },
  {
    id: "title",
    type: "title",
    label: "Certificate Title",
    value: "Certificate of Achievement",
    x: 20,
    y: 14,
    w: 60,
    h: 9,
    fontSize: 26,
    color: P.deepOlive,
    align: "center",
    visible: true,
  },
  {
    id: "learner",
    type: "learner",
    label: "Learner Name",
    value: "{learnerName}",
    x: 18,
    y: 36,
    w: 64,
    h: 12,
    fontSize: 34,
    color: P.deepOlive,
    align: "center",
    visible: true,
    locked: true,
  },
  {
    id: "course",
    type: "course",
    label: "Course Name",
    value: "{courseName}",
    x: 22,
    y: 51,
    w: 56,
    h: 8,
    fontSize: 18,
    color: P.olive,
    align: "center",
    visible: true,
  },
  {
    id: "date",
    type: "date",
    label: "Date and Certificate ID",
    value: "Issued {completionDate} | ID {certificateId}",
    x: 26,
    y: 63,
    w: 48,
    h: 6,
    fontSize: 10,
    color: P.textMuted,
    align: "center",
    visible: true,
  },
  {
    id: "signers",
    type: "signers",
    label: "Backend Signers",
    value: "{primarySigner} and {secondarySigner}",
    x: 14,
    y: 76,
    w: 72,
    h: 16,
    fontSize: 12,
    color: P.text,
    align: "center",
    visible: true,
    locked: true,
  },
  {
    id: "stamp",
    type: "stamp",
    label: "Official Stamp",
    value: "Official seal",
    x: 76,
    y: 61,
    w: 12,
    h: 15,
    fontSize: 9,
    color: P.olive,
    align: "center",
    visible: true,
  },
  {
    id: "qr",
    type: "qr",
    label: "Verification QR",
    value: "Verify",
    x: 8,
    y: 78,
    w: 9,
    h: 12,
    fontSize: 8,
    color: P.textMuted,
    align: "center",
    visible: true,
  },
];
