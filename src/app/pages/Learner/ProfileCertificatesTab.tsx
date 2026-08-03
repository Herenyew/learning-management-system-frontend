import React, { useRef, useState } from "react";
import { Award, Download, Eye, FileText, Globe, Share2, Upload, X } from "lucide-react";
import { Av, Chip } from "../../components/common";
import { P } from "../../constants/theme.constants";
import { PROFILE_CERTS } from "./profile.data";

type CredentialSource = "device" | "gdrive";

export function ProfileCertificatesTab() {
  const [certPreview, setCertPreview] = useState<string | null>(null);
  const [credentialUploadOpen, setCredentialUploadOpen] = useState(false);
  const [credentialSource, setCredentialSource] = useState<CredentialSource>("device");
  const [credentialFileName, setCredentialFileName] = useState("");
  const [credentialDriveUrl, setCredentialDriveUrl] = useState("");
  const [credentialProvider, setCredentialProvider] = useState("Cisco Networking Academy");
  const [credentialName, setCredentialName] = useState("CCNA Essentials");
  const [credentialUploadNotice, setCredentialUploadNotice] = useState("");
  const [externalCredential, setExternalCredential] = useState({
    provider: "Cisco Networking Academy",
    credential: "CCNA Essentials",
    expiry: "Renews in 82 days",
    syncStatus: "API verified",
    source: "Device upload",
  });
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const activeCertificates = PROFILE_CERTS.filter((cert) => !cert.expired);
  const canSave =
    credentialProvider.trim() &&
    credentialName.trim() &&
    (credentialSource === "device" ? credentialFileName : credentialDriveUrl.trim());

  const closeUpload = () => {
    setCredentialUploadOpen(false);
    setCredentialSource("device");
    setCredentialFileName("");
    setCredentialDriveUrl("");
  };

  const saveUpload = () => {
    if (!canSave) return;
    const sourceLabel =
      credentialSource === "device" ? `Device upload: ${credentialFileName}` : "Google Drive";
    setExternalCredential({
      provider: credentialProvider.trim(),
      credential: credentialName.trim(),
      expiry: "Pending parser review",
      syncStatus: credentialSource === "gdrive" ? "Drive link saved" : "File uploaded",
      source: sourceLabel,
    });
    setCredentialUploadNotice(`${credentialName.trim()} saved from ${sourceLabel}.`);
    closeUpload();
  };

  const previewCertificate = PROFILE_CERTS.find((cert) => cert.id === certPreview);

  return (
    <div className="space-y-5">
      {previewCertificate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{ background: "rgba(46,58,21,0.85)" }}
          onClick={() => setCertPreview(null)}
        >
          <div
            className="bg-white rounded-2xl overflow-hidden shadow-2xl max-w-2xl w-full"
            onClick={(event) => event.stopPropagation()}
          >
            <div
              className="p-12 text-white text-center relative"
              style={{ background: `linear-gradient(135deg, ${P.darkOlive}, ${P.olive})` }}
            >
              <button
                onClick={() => setCertPreview(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: "rgba(255,255,255,0.15)" }}
                type="button"
              >
                <X size={14} className="text-white" />
              </button>
              <p
                className="text-xs font-semibold tracking-widest uppercase mb-2"
                style={{ color: "rgba(231,238,220,0.65)" }}
              >
                ADIU Communication Service PLC - LearnOS Platform
              </p>
              <p className="text-sm mb-1" style={{ color: "rgba(231,238,220,0.8)" }}>
                This is to certify that
              </p>
              <h2
                className="text-3xl font-bold mb-1"
                style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}
              >
                Alex Mercer
              </h2>
              <p className="mb-3" style={{ color: "rgba(231,238,220,0.8)" }}>
                has successfully completed
              </p>
              <h3 className="text-xl font-bold mb-6">{previewCertificate.course}</h3>
              <div className="flex justify-center gap-8 text-sm mb-4">
                {[
                  ["Score", `${previewCertificate.score}%`],
                  ["Duration", previewCertificate.hours],
                  ["Issued", previewCertificate.issued.split(",")[0]],
                ].map(([label, value]) => (
                  <div key={label}>
                    <p className="font-bold">{value}</p>
                    <p className="text-xs" style={{ color: "rgba(231,238,220,0.55)" }}>
                      {label}
                    </p>
                  </div>
                ))}
              </div>
              <p className="text-[10px] font-mono mt-3" style={{ color: "rgba(231,238,220,0.55)" }}>
                {previewCertificate.credId}
              </p>
            </div>
            <div className="p-4 flex gap-2 justify-end" style={{ background: P.bg }}>
              <button
                className="px-4 py-2 rounded-lg text-sm flex items-center gap-1.5"
                style={{ border: `1px solid ${P.border}`, color: P.textMid }}
                type="button"
              >
                <Share2 size={14} /> LinkedIn
              </button>
              <button
                className="px-4 py-2 text-white rounded-lg text-sm font-semibold flex items-center gap-1.5"
                style={{ background: P.olive }}
                type="button"
              >
                <Download size={14} /> Download PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {credentialUploadOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(46,58,21,0.68)", backdropFilter: "blur(4px)" }}
          onClick={closeUpload}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-white border shadow-2xl overflow-hidden"
            style={{ borderColor: P.border }}
            onClick={(event) => event.stopPropagation()}
          >
            <div
              className="flex items-start justify-between gap-4 p-5"
              style={{ borderBottom: `1px solid ${P.border}` }}
            >
              <div>
                <p className="text-base font-bold" style={{ color: P.text }}>
                  Upload External Certificate
                </p>
                <p className="text-xs mt-1" style={{ color: P.textMuted }}>
                  Choose a local certificate file or paste a Google Drive share link.
                </p>
              </div>
              <button
                onClick={closeUpload}
                className="p-1.5 rounded-lg hover:bg-[#F6FEFA]"
                type="button"
              >
                <X size={16} style={{ color: P.textMuted }} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    ["device", "Device Upload", Upload],
                    ["gdrive", "Google Drive", Globe],
                  ] as [CredentialSource, string, React.ElementType][]
                ).map(([source, label, Icon]) => (
                  <button
                    key={source}
                    type="button"
                    onClick={() => setCredentialSource(source)}
                    className="rounded-xl border p-3 text-left"
                    style={{
                      borderColor: credentialSource === source ? P.olive : P.border,
                      background: credentialSource === source ? P.lightSage : P.bg,
                      color: credentialSource === source ? P.olive : P.textMid,
                    }}
                  >
                    <Icon size={16} />
                    <span className="mt-2 block text-xs font-semibold">{label}</span>
                  </button>
                ))}
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <ProfileTextField
                  label="Provider"
                  value={credentialProvider}
                  onChange={setCredentialProvider}
                />
                <ProfileTextField
                  label="Credential"
                  value={credentialName}
                  onChange={setCredentialName}
                />
              </div>

              {credentialSource === "device" ? (
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={(event) => setCredentialFileName(event.target.files?.[0]?.name ?? "")}
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full rounded-xl border border-dashed px-4 py-5 text-sm font-semibold"
                    style={{ borderColor: P.border, color: P.olive, background: P.bg }}
                    type="button"
                  >
                    {credentialFileName || "Choose certificate file"}
                  </button>
                </div>
              ) : (
                <ProfileTextField
                  label="Google Drive URL"
                  value={credentialDriveUrl}
                  onChange={setCredentialDriveUrl}
                />
              )}
            </div>

            <div
              className="p-4 flex gap-2 justify-end"
              style={{ borderTop: `1px solid ${P.border}` }}
            >
              <button
                onClick={closeUpload}
                className="px-4 py-2 rounded-lg text-sm font-semibold"
                style={{ border: `1px solid ${P.border}`, color: P.textMid }}
                type="button"
              >
                Cancel
              </button>
              <button
                onClick={saveUpload}
                disabled={!canSave}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-50"
                style={{ background: P.olive }}
                type="button"
              >
                Save Certificate
              </button>
            </div>
          </div>
        </div>
      )}

      <section className="bg-white rounded-xl border p-5" style={{ borderColor: P.border }}>
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between mb-4">
          <div>
            <p className="text-sm font-semibold flex items-center gap-2" style={{ color: P.text }}>
              <Upload size={16} style={{ color: P.olive }} /> External Credential Intake
            </p>
            <p className="text-xs mt-1" style={{ color: P.textMuted }}>
              Upload external certificates so the LMS can parse issuer, issue date, expiry, and
              renewal status.
            </p>
          </div>
          <button
            onClick={() => setCredentialUploadOpen(true)}
            className="px-4 py-2 text-white rounded-lg text-sm font-semibold flex items-center gap-1.5"
            style={{ background: P.olive }}
            type="button"
          >
            <Upload size={14} /> Upload Certificate
          </button>
        </div>
        {credentialUploadNotice && (
          <p
            className="mb-3 rounded-lg px-3 py-2 text-xs font-semibold"
            style={{ background: P.lightSage, color: P.darkOlive }}
          >
            {credentialUploadNotice}
          </p>
        )}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            ["Provider", externalCredential.provider, Globe],
            ["Parsed Credential", externalCredential.credential, Award],
            ["Expiry", externalCredential.expiry, FileText],
            ["Sync Status", externalCredential.syncStatus, Eye],
          ].map(([label, value, Icon]) => (
            <div
              key={label as string}
              className="rounded-xl border p-3"
              style={{ borderColor: P.border, background: P.bg }}
            >
              <p
                className="text-[10px] font-semibold uppercase flex items-center gap-1"
                style={{ color: P.textMuted }}
              >
                <Icon size={11} /> {label as string}
              </p>
              <p className="text-xs font-semibold mt-1" style={{ color: P.text }}>
                {value as string}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <p className="text-sm font-semibold mb-3" style={{ color: P.text }}>
          Active Certificates ({activeCertificates.length})
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          {PROFILE_CERTS.map((cert) => (
            <div
              key={cert.id}
              className="bg-white rounded-xl border overflow-hidden"
              style={{ borderColor: P.border }}
            >
              <div
                className="p-8 text-white text-center"
                style={{ background: `linear-gradient(135deg, ${cert.color}, ${cert.color}cc)` }}
              >
                <Award size={32} className="mx-auto mb-4 opacity-80" />
                <p className="text-xs opacity-75">Certificate of Completion</p>
                <p className="text-sm font-bold mt-1">{cert.course}</p>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-3 gap-3 text-center mb-4">
                  {[
                    [`${cert.score}%`, "Score"],
                    [cert.hours, "Duration"],
                    [cert.issued.split(",")[0], "Issued"],
                  ].map(([value, label]) => (
                    <div key={label}>
                      <p className="text-sm font-bold" style={{ color: P.text }}>
                        {value}
                      </p>
                      <p className="text-[10px]" style={{ color: P.textMuted }}>
                        {label}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <Av initials="AM" size={28} color={cert.color} />
                    <p className="text-[10px] font-mono truncate" style={{ color: P.textMuted }}>
                      {cert.credId}
                    </p>
                  </div>
                  <button
                    onClick={() => setCertPreview(cert.id)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                    style={{ background: P.lightSage, color: P.olive }}
                    type="button"
                  >
                    Preview
                  </button>
                </div>
                <div className="mt-3">
                  <Chip
                    label={cert.expired ? "Expired" : "Active"}
                    variant={cert.expired ? "neutral" : "green"}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function ProfileTextField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold mb-1.5" style={{ color: P.textMid }}>
        {label}
      </span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full px-3 py-2 text-sm rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#6EE7B7]"
        style={{ border: `1px solid ${P.border}`, color: P.text }}
      />
    </label>
  );
}
