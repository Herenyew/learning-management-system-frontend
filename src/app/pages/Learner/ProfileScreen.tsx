import React, { useState } from "react";
import type { NavigateFn } from "../../models/app.model";
import { ProfileCertificatesTab } from "./ProfileCertificatesTab";
import { ProfileCoursesTab } from "./ProfileCoursesTab";
import { ProfileHeaderCard, type ProfileTab } from "./ProfileHeaderCard";
import { ProfileHistoryTab } from "./ProfileHistoryTab";
import { ProfileOverviewTab } from "./ProfileOverviewTab";
import { ProfileProgressReportTab } from "./ProfileProgressReportTab";
import { ProfileSkillsTab } from "./ProfileSkillsTab";

export function ProfileScreen({ navigate }: { navigate: NavigateFn }) {
  const [tab, setTab] = useState<ProfileTab>("overview");

  return (
    <main className="p-6 space-y-5 max-w-[1200px]">
      <ProfileHeaderCard activeTab={tab} onTabChange={setTab} />
      {tab === "overview" && <ProfileOverviewTab navigate={navigate} />}
      {tab === "skills" && <ProfileSkillsTab />}
      {tab === "courses" && <ProfileCoursesTab navigate={navigate} />}
      {tab === "certificates" && <ProfileCertificatesTab />}
      {tab === "report" && <ProfileProgressReportTab navigate={navigate} />}
      {tab === "history" && <ProfileHistoryTab />}
    </main>
  );
}
