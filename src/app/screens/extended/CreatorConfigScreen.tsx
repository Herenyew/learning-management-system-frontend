import { useState } from "react";
import {
  Award,
  Badge,
  ChevronLeft,
  Eye,
  FileText,
  Globe,
  HelpCircle,
  P,
  Settings,
  Shield,
  Upload,
  UserCheck,
  Users,
  Zap,
} from "./extended.shared";
import type { CreatorConfigContext } from "./CreatorConfig.types";
import { CreatorConfigCourseInfoTab } from "./CreatorConfigCourseInfoTab";
import { CreatorConfigAttendeesTab } from "./CreatorConfigAttendeesTab";
import { CreatorConfigContentTab } from "./CreatorConfigContentTab";
import { CreatorConfigMetadataTab } from "./CreatorConfigMetadataTab";
import { CreatorConfigCertificationTab } from "./CreatorConfigCertificationTab";
import { CreatorConfigVisibilityTab } from "./CreatorConfigVisibilityTab";
import { CreatorConfigEnrollmentTab } from "./CreatorConfigEnrollmentTab";
import { CreatorConfigXpTab } from "./CreatorConfigXpTab";
import { CreatorConfigQuizBuilderTab } from "./CreatorConfigQuizBuilderTab";
import { CreatorConfigPublishingTab } from "./CreatorConfigPublishingTab";
import { CreatorConfigModerationTab } from "./CreatorConfigModerationTab";

export function CreatorConfigScreen({ navigate }: { navigate: (s: string) => void }) {
  const [configTab, setConfigTab] = useState("course-info");
  const [pubStatus, setPubStatus] = useState("Draft");
  const [visibility, setVisibility] = useState("Everyone");
  const [enrollment, setEnrollment] = useState("Open");

  const configTabs = [
    { id: "course-info", label: "Course Info", icon: FileText },
    { id: "attendees", label: "Attendees", icon: Users },
    { id: "content", label: "Content Sources", icon: Upload },
    { id: "metadata", label: "Content Metadata", icon: Settings },
    { id: "certification", label: "Certification", icon: Award },
    { id: "visibility", label: "Visibility", icon: Eye },
    { id: "enrollment", label: "Enrollment", icon: UserCheck },
    { id: "xp-config", label: "XP Config", icon: Zap },
    { id: "quiz-builder", label: "Quiz Builder", icon: HelpCircle },
    { id: "publishing", label: "Publishing", icon: Globe },
    { id: "moderation", label: "Moderation", icon: Shield },
  ];

  const creatorConfigContext: CreatorConfigContext = {
    configTab,
    enrollment,
    pubStatus,
    setEnrollment,
    setPubStatus,
    setVisibility,
    visibility,
  };

  return (
    <div className="flex h-full overflow-hidden" style={{ background: P.bg }}>
      {/* Config nav */}
      <div
        className="w-[220px] flex-shrink-0 bg-white flex flex-col"
        style={{ borderRight: `1px solid ${P.border}` }}
      >
        <div className="p-4" style={{ borderBottom: `1px solid ${P.border}` }}>
          <button
            onClick={() => navigate("creator")}
            className="flex items-center gap-1.5 text-xs mb-2"
            style={{ color: P.textMuted }}
          >
            <ChevronLeft size={13} /> Back to Studio
          </button>
          <p className="text-xs font-bold" style={{ color: P.text }}>
            Course Configuration
          </p>
          <p className="text-[10px] mt-0.5" style={{ color: P.textMuted }}>
            AI & ML for Business Leaders
          </p>
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          {configTabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setConfigTab(id)}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-colors"
              style={
                configTab === id
                  ? {
                      background: P.lightSage,
                      color: P.olive,
                      borderLeft: `2px solid ${P.olive}`,
                      paddingLeft: 10,
                    }
                  : { color: P.textMuted }
              }
            >
              <Icon size={14} className="flex-shrink-0" />
              <span className="text-[12px] font-medium">{label}</span>
            </button>
          ))}
        </div>
        <div className="p-3" style={{ borderTop: `1px solid ${P.border}` }}>
          <div className="flex items-center justify-between text-[10px] mb-2">
            <span style={{ color: P.textMuted }}>Status</span>
            <Badge
              label={pubStatus}
              variant={
                pubStatus === "Published"
                  ? "green"
                  : pubStatus === "Approved"
                    ? "sage"
                    : pubStatus === "In Review"
                      ? "gold"
                      : "neutral"
              }
            />
          </div>
          <button
            className="w-full py-2 rounded-lg text-xs font-semibold text-white"
            style={{ background: P.olive }}
            data-prototype-action="true"
          >
            Save Changes
          </button>
        </div>
      </div>

      {/* Config content */}
      <div className="flex-1 overflow-y-auto p-6">
        <CreatorConfigCourseInfoTab ctx={creatorConfigContext} />
        <CreatorConfigAttendeesTab ctx={creatorConfigContext} />
        <CreatorConfigContentTab ctx={creatorConfigContext} />
        <CreatorConfigMetadataTab ctx={creatorConfigContext} />
        <CreatorConfigCertificationTab ctx={creatorConfigContext} />
        <CreatorConfigVisibilityTab ctx={creatorConfigContext} />
        <CreatorConfigEnrollmentTab ctx={creatorConfigContext} />
        <CreatorConfigXpTab ctx={creatorConfigContext} />
        <CreatorConfigQuizBuilderTab ctx={creatorConfigContext} />
        <CreatorConfigPublishingTab ctx={creatorConfigContext} />
        <CreatorConfigModerationTab ctx={creatorConfigContext} />
      </div>
    </div>
  );
}
