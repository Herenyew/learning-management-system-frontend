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
          label="Require manager approval for self-enrollment"
          desc="Self-enrollment triggers a manager approval request before access is granted"
        />
        <CfgField label="Self-enrollment approval timeout (days)" value="5" type="number" />
        <CfgField label="Unenroll lock window (days before deadline)" value="3" type="number" />
      </CfgSection>

      {/* Invitation Enrollment */}
      <CfgSection title="Invitation Enrollment">
        <CfgField
          label="Who can send enrollment invitations"
          options={["HR Admin only", "HR + Managers", "HR + Managers + Creators", "Any admin role"]}
        />
        <CfgField label="Invitation expiry (days)" value="14" type="number" />
      </CfgSection>

      {/* Paid Enrollment */}
      <CfgSection title="Paid Enrollment">
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
      </CfgSection>

      {/* Capacity Limits */}
      <CfgSection title="Capacity Limits">
        <CfgField label="Default course capacity (learners)" value="200" type="number" />
        <CfgField label="Default program capacity (learners)" value="500" type="number" />
      </CfgSection>

      {/* Waitlists */}
      <CfgSection title="Waitlists">
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
        <CfgField label="Auto-enroll response window (hours)" value="48" type="number" />
      </CfgSection>

      <SaveBar />
    </div>
  );
}
