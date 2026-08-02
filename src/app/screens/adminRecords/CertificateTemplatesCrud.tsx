import React, { useMemo, useState } from "react";
import {
  AlertCircle,
  Archive,
  Award,
  BarChart2,
  BookOpen,
  Calendar,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  Confirm,
  Copy,
  CrudModal,
  CrudShell,
  Download,
  Edit,
  Eye,
  Field,
  FileText,
  Filter,
  GitBranch,
  HelpCircle,
  Inp,
  Layers,
  LayoutDashboard,
  MessageSquare,
  MoreHorizontal,
  P,
  Plus,
  RefreshCw,
  SaveBtn,
  Search,
  Sel,
  Shield,
  StatusBadge,
  Target,
  Textarea,
  Trash2,
  TrendingUp,
  UserCheck,
  Users,
  X,
  Zap,
} from "./adminRecords.shared";
import type { CrudColumn, CrudRow } from "./adminRecords.shared";

type CertificateTemplateRow = CrudRow & {
  layout: string;
  signers: string;
  seal: string;
  defaultFor: string;
};

const CERT_TEMPLATE_INIT: CertificateTemplateRow[] = [
  {
    id: "cert1",
    name: "Standard Completion Certificate",
    layout: "Landscape",
    signers: "Instructor, HR Director",
    seal: "Included",
    defaultFor: "General courses",
    status: "Active",
  },
  {
    id: "cert2",
    name: "Executive Leadership Credential",
    layout: "Landscape",
    signers: "CEO, CHRO",
    seal: "Included",
    defaultFor: "Leadership programs",
    status: "Active",
  },
  {
    id: "cert3",
    name: "Compliance Attestation Certificate",
    layout: "Portrait",
    signers: "Compliance Officer, HR Director",
    seal: "Included",
    defaultFor: "Compliance courses",
    status: "Active",
  },
  {
    id: "cert4",
    name: "Minimal Achievement Certificate",
    layout: "Landscape",
    signers: "Instructor",
    seal: "Not included",
    defaultFor: "Microlearning",
    status: "Archived",
  },
];

export function CertificateTemplatesCrud() {
  const [rows, setRows] = useState<CertificateTemplateRow[]>(CERT_TEMPLATE_INIT);
  return (
    <CrudShell<CertificateTemplateRow>
      title="Certificate Templates"
      sub="Reusable certificate designs with signers, seals, and default usage"
      icon={Award}
      columns={[
        {
          key: "name",
          label: "Template Name",
          sortable: true,
          render: (r) => (
            <p className="text-xs font-semibold" style={{ color: P.text }}>
              {r.name}
            </p>
          ),
        },
        { key: "layout", label: "Layout" },
        { key: "signers", label: "Signers" },
        { key: "seal", label: "Seal" },
        { key: "defaultFor", label: "Default For" },
        {
          key: "status",
          label: "Status",
          sortable: true,
          render: (r) => <StatusBadge status={r.status} />,
        },
      ]}
      rows={rows}
      onRows={setRows}
      filterOptions={{ label: "Status", values: ["Active", "Draft", "Archived"] }}
      createLabel="New Template"
      duplicateLabel="Clone"
      actions={[
        { label: "Preview", icon: Eye, onClick: (r) => alert(`Preview opened for: ${r.name}`) },
      ]}
      cloneRow={(r) => ({
        ...r,
        id: `cert${Date.now()}`,
        name: `${r.name} (Copy)`,
        status: "Draft",
      })}
      renderForm={(row, onSave, onClose) => {
        const [form, setForm] = useState<CertificateTemplateRow>(
          row ?? {
            id: `cert${Date.now()}`,
            name: "",
            layout: "Landscape",
            signers: "Instructor, HR Director",
            seal: "Included",
            defaultFor: "General courses",
            status: "Draft",
          },
        );
        return (
          <CrudModal
            title={row ? "Edit Certificate Template" : "New Certificate Template"}
            onClose={onClose}
          >
            <div className="space-y-4">
              <Field label="Template Name" required>
                <Inp value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Layout">
                  <Sel
                    value={form.layout}
                    onChange={(v) => setForm({ ...form, layout: v })}
                    options={["Landscape", "Portrait"]}
                  />
                </Field>
                <Field label="Seal">
                  <Sel
                    value={form.seal}
                    onChange={(v) => setForm({ ...form, seal: v })}
                    options={["Included", "Not included"]}
                  />
                </Field>
                <Field label="Signers">
                  <Inp value={form.signers} onChange={(v) => setForm({ ...form, signers: v })} />
                </Field>
                <Field label="Default For">
                  <Inp
                    value={form.defaultFor}
                    onChange={(v) => setForm({ ...form, defaultFor: v })}
                  />
                </Field>
                <Field label="Status">
                  <Sel
                    value={form.status}
                    onChange={(v) => setForm({ ...form, status: v })}
                    options={["Active", "Draft", "Archived"]}
                  />
                </Field>
              </div>
              <SaveBtn onSave={() => onSave(form)} onClose={onClose} />
            </div>
          </CrudModal>
        );
      }}
    />
  );
}
