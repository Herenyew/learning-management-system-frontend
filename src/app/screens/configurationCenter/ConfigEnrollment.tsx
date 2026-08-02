// Extensions3.tsx — Configuration Center, Analytics Center, Course Builder,
// Certification Management, Gamification, Two-Level Moderation
// Olive / Sage / Gold enterprise design language

import React from "react";
import { CfgField, CfgSection, CfgToggle, SaveBar } from "./configuration.shared";

export function ConfigEnrollment() {
  return (
    <div className="space-y-5">
      {/* Open Enrollment */}
      <CfgSection title="Open Enrollment">
        <CfgToggle
          label="Allow open / self-enrollment"
          desc="Learners can browse the catalog and enroll themselves in any non-restricted course"
          defaultOn
        />
        <CfgToggle
          label="Require manager approval for self-enrollment"
          desc="Self-enrollment triggers a manager approval request before access is granted"
        />
        <CfgField label="Self-enrollment approval timeout (days)" value="5" type="number" />
        <CfgToggle
          label="Show enrollment count to learners"
          desc="Course cards display how many people are enrolled"
          defaultOn
        />
        <CfgToggle
          label="Allow learners to unenroll themselves"
          desc="Learners can drop a course before completing it"
          defaultOn
        />
        <CfgField label="Unenroll lock window (days before deadline)" value="3" type="number" />
      </CfgSection>

      {/* Invitation Enrollment */}
      <CfgSection title="Invitation Enrollment">
        <CfgToggle
          label="Enable invitation-only courses"
          desc="Some courses require an HR or manager invitation to enroll"
          defaultOn
        />
        <CfgField
          label="Who can send enrollment invitations"
          options={["HR Admin only", "HR + Managers", "HR + Managers + Creators", "Any admin role"]}
        />
        <CfgToggle
          label="Allow learner to decline an invitation"
          desc="Learners can reject invitations with a reason"
          defaultOn
        />
        <CfgToggle label="Notify HR when invitation is declined" defaultOn />
        <CfgField label="Invitation expiry (days)" value="14" type="number" />
        <CfgToggle
          label="Auto-enroll if invitation not actioned within expiry"
          desc="Learner is automatically enrolled when invitation expires"
        />
      </CfgSection>

      {/* Paid Enrollment */}
      <CfgSection title="Paid Enrollment">
        <CfgToggle
          label="Enable paid course enrollment"
          desc="Allow courses to have a learner-facing price"
        />
        <CfgField
          label="Default payment method"
          options={[
            "Cost center allocation",
            "Direct card payment",
            "Manager approval + cost center",
            "Invoice",
          ]}
        />
        <CfgField label="Maximum individual course price (USD)" value="500" type="number" />
        <CfgToggle
          label="Require finance approval for paid enrollments above threshold"
          defaultOn
        />
        <CfgField label="Finance approval threshold (USD)" value="200" type="number" />
        <CfgToggle label="Issue refund on unenrollment before start date" defaultOn />
        <CfgToggle label="Show pricing to learners in catalog" defaultOn />
      </CfgSection>

      {/* Capacity Limits */}
      <CfgSection title="Capacity Limits">
        <CfgToggle label="Enable per-course capacity limits" defaultOn />
        <CfgField label="Default course capacity (learners)" value="200" type="number" />
        <CfgField label="Default program capacity (learners)" value="500" type="number" />
        <CfgToggle
          label="Allow course owners to override capacity"
          desc="Individual course creators can set their own capacity limit"
          defaultOn
        />
        <CfgToggle label="Alert HR when a course reaches 80% capacity" defaultOn />
        <CfgToggle
          label="Notify learners when spots open up"
          desc="Waitlisted learners are notified when a seat becomes available"
          defaultOn
        />
      </CfgSection>

      {/* Waitlists */}
      <CfgSection title="Waitlists">
        <CfgToggle
          label="Enable course waitlisting"
          desc="When a course is full, learners are queued and notified when a spot opens"
          defaultOn
        />
        <CfgField label="Maximum waitlist size" value="50" type="number" />
        <CfgField
          label="Waitlist priority"
          options={[
            "First come, first served",
            "Manager-prioritised",
            "Seniority-based",
            "Custom rule",
          ]}
        />
        <CfgToggle label="Notify learner of their position in the waitlist" defaultOn />
        <CfgToggle
          label="Auto-enroll from waitlist when a spot opens"
          desc="Next learner on the waitlist is automatically enrolled"
          defaultOn
        />
        <CfgField label="Auto-enroll response window (hours)" value="48" type="number" />
        <CfgToggle
          label="Allow manager to jump queue for direct reports"
          desc="Managers can escalate a direct report's waitlist position"
        />
      </CfgSection>

      <SaveBar />
    </div>
  );
}
