import React, { useState } from "react";
import { Award, Link, Plus, Settings, Upload } from "lucide-react";
import { Chip, PageHeader, StatCard } from "../../components/common";
import { P } from "../../constants/theme.constants";
const CERT_PROVIDERS = [
  {
    id: "cp1",
    name: "Amazon Web Services",
    short: "AWS",
    logo: "☁️",
    certs: ["Cloud Practitioner", "Solutions Architect", "DevOps Engineer"],
    category: "Cloud",
    status: "Integrated",
    learners: 48,
  },
  {
    id: "cp2",
    name: "Google Cloud",
    short: "GCP",
    logo: "🔵",
    certs: ["Cloud Digital Leader", "Professional Data Engineer", "Professional ML Engineer"],
    category: "Cloud",
    status: "Integrated",
    learners: 31,
  },
  {
    id: "cp3",
    name: "Project Management Institute",
    short: "PMI",
    logo: "📋",
    certs: ["PMP", "CAPM", "PMI-ACP"],
    category: "Management",
    status: "Manual",
    learners: 18,
  },
  {
    id: "cp4",
    name: "CompTIA",
    short: "CompTIA",
    logo: "🔒",
    certs: ["Security+", "Network+", "CySA+"],
    category: "Security",
    status: "Integrated",
    learners: 62,
  },
  {
    id: "cp5",
    name: "Salesforce",
    short: "SFDC",
    logo: "☁️",
    certs: ["Administrator", "Platform Developer", "Sales Cloud Consultant"],
    category: "CRM",
    status: "Manual",
    learners: 12,
  },
  {
    id: "cp6",
    name: "Microsoft",
    short: "MSFT",
    logo: "🪟",
    certs: ["Azure Fundamentals", "Azure Administrator", "Power BI Data Analyst"],
    category: "Cloud",
    status: "Integrated",
    learners: 74,
  },
];

export function CertProvidersScreen({ navigate }: { navigate: (s: string) => void }) {
  const [category, setCategory] = useState("All");
  const categories = ["All", "Cloud", "Security", "Management", "CRM"];
  const filtered = CERT_PROVIDERS.filter((p) => category === "All" || p.category === category);

  return (
    <div className="p-6 space-y-5 max-w-[1200px]">
      <PageHeader
        title="External Certification Providers"
        sub="Directory of supported external certification bodies and integration status"
        actions={
          <button
            className="flex items-center gap-1.5 px-3 py-2 text-white rounded-lg text-sm font-semibold"
            style={{ background: P.olive }}
            data-prototype-action="true"
          >
            <Plus size={14} /> Add Provider
          </button>
        }
      />

      <div className="grid grid-cols-3 gap-4">
        <StatCard
          label="Integrated Providers"
          value="4"
          sub="Auto-sync enabled"
          icon={Link}
          color={P.olive}
          bg={P.lightSage}
        />
        <StatCard
          label="Manual Providers"
          value="2"
          sub="Manual upload"
          icon={Upload}
          color={P.gold}
          bg={P.goldLight}
        />
        <StatCard
          label="Tracked Certs"
          value="245"
          sub="Across all providers"
          icon={Award}
          color="#5A7A2A"
          bg="#D8EDCC"
        />
      </div>

      <div className="flex gap-2">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium"
            style={
              category === c
                ? { background: P.olive, color: "white" }
                : { background: "white", border: `1px solid ${P.border}`, color: P.textMid }
            }
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((provider) => (
          <div
            key={provider.id}
            className="bg-white rounded-xl border p-5 hover:shadow-md transition-all"
            style={{ borderColor: P.border }}
          >
            <div className="flex items-start gap-3 mb-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                style={{ background: P.lightSage }}
              >
                {provider.logo}
              </div>
              <div>
                <p className="text-sm font-bold" style={{ color: P.text }}>
                  {provider.name}
                </p>
                <div className="flex items-center gap-1.5 mt-1">
                  <Chip label={provider.category} variant="sage" />
                  <Chip
                    label={provider.status}
                    variant={provider.status === "Integrated" ? "green" : "gold"}
                  />
                </div>
              </div>
            </div>
            <div className="mb-3">
              <p className="text-[10px] font-semibold mb-1.5" style={{ color: P.textMuted }}>
                CERTIFICATIONS OFFERED
              </p>
              <div className="flex flex-wrap gap-1">
                {provider.certs.map((c) => (
                  <span
                    key={c}
                    className="text-[10px] px-2 py-0.5 rounded-full"
                    style={{ background: P.lightSage, color: P.darkOlive }}
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
            <div
              className="flex items-center justify-between pt-3"
              style={{ borderTop: `1px solid ${P.border}` }}
            >
              <p className="text-xs" style={{ color: P.textMuted }}>
                <span className="font-semibold" style={{ color: P.text }}>
                  {provider.learners}
                </span>{" "}
                active learners
              </p>
              <div className="flex gap-1.5">
                {provider.status === "Integrated" ? (
                  <button
                    className="text-[11px] font-medium"
                    style={{ color: "#5A7A2A" }}
                    data-prototype-action="true"
                  >
                    ✓ Connected
                  </button>
                ) : (
                  <button
                    className="px-2.5 py-1 rounded-lg text-[11px] font-semibold"
                    style={{ background: P.lightSage, color: P.olive }}
                    data-prototype-action="true"
                  >
                    Connect
                  </button>
                )}
                <button
                  className="p-1.5 rounded-lg"
                  style={{ border: `1px solid ${P.border}` }}
                  data-prototype-action="true"
                >
                  <Settings size={12} style={{ color: P.textMuted }} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
