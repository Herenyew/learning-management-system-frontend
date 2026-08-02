import React, { useState } from "react";
import { Award, Download, Eye, Share2 } from "lucide-react";
import { P } from "../../constants/theme.constants";
export function CertificatesScreen() {
  const [preview, setPreview] = useState<string | null>(null);
  const certs = [
    {
      id: "c1",
      course: "Cybersecurity Fundamentals & Compliance",
      date: "Jan 12, 2025",
      credId: "CER-2025-001-AM",
      score: 94,
      color: "#C0392B",
      hours: "4h",
    },
    {
      id: "c2",
      course: "Data-Driven Leadership",
      date: "Dec 5, 2024",
      credId: "CER-2024-089-AM",
      score: 88,
      color: P.darkOlive,
      hours: "6h",
    },
    {
      id: "c3",
      course: "Effective Communication in Remote Teams",
      date: "Nov 18, 2024",
      credId: "CER-2024-072-AM",
      score: 91,
      color: P.olive,
      hours: "4h",
    },
  ];

  return (
    <div className="p-6 space-y-6 max-w-[1200px]">
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-xl font-bold mb-1"
            style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", color: P.text }}
          >
            My Certificates
          </h1>
          <p className="text-sm" style={{ color: P.textMuted }}>
            {certs.length} certificates earned
          </p>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg text-sm"
          style={{ border: `1px solid ${P.border}`, color: P.textMid }}
          data-prototype-action="true"
        >
          <Download size={15} /> Export All
        </button>
      </div>

      {preview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{ background: "rgba(46,58,21,0.85)" }}
          onClick={() => setPreview(null)}
        >
          <div
            className="bg-white rounded-2xl overflow-hidden shadow-2xl max-w-2xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="p-12 text-white text-center relative"
              style={{ background: `linear-gradient(135deg, ${P.darkOlive}, ${P.olive})` }}
            >
              <div
                className="absolute inset-0 opacity-5"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(45deg, white 0, white 1px, transparent 0, transparent 50%)",
                  backgroundSize: "12px 12px",
                }}
              />
              <div className="relative">
                <p
                  className="text-xs font-semibold tracking-widest uppercase mb-2"
                  style={{ color: "rgba(231,238,220,0.65)" }}
                >
                  ADIU COMMUNICATION SERVICE PLC · LEARNOST PLATFORM
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
                <h3 className="text-xl font-bold mb-6">
                  {certs.find((c) => c.id === preview)?.course}
                </h3>
                <div className="flex justify-center gap-8 text-sm mb-4">
                  {[
                    ["Score", `${certs.find((c) => c.id === preview)?.score}%`],
                    ["Duration", certs.find((c) => c.id === preview)?.hours || ""],
                    ["Issued", certs.find((c) => c.id === preview)?.date.split(",")[0] || ""],
                  ].map(([l, v]) => (
                    <div key={l}>
                      <p className="font-bold">{v}</p>
                      <p className="text-xs" style={{ color: "rgba(231,238,220,0.55)" }}>
                        {l}
                      </p>
                    </div>
                  ))}
                </div>
                <div
                  className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold"
                  style={{ background: P.gold, color: P.text }}
                >
                  Verified Certificate
                </div>
              </div>
            </div>
            <div className="p-4 flex gap-2 justify-end" style={{ background: P.bg }}>
              <button
                className="px-4 py-2 rounded-lg text-sm flex items-center gap-1.5"
                style={{ border: `1px solid ${P.border}`, color: P.textMid }}
                data-prototype-action="true"
              >
                <Share2 size={14} /> LinkedIn
              </button>
              <button
                className="px-4 py-2 text-white rounded-lg text-sm font-semibold flex items-center gap-1.5"
                style={{ background: P.olive }}
                data-prototype-action="true"
              >
                <Download size={14} /> Download PDF
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {certs.map((cert, i) => (
          <div
            key={cert.id}
            className="group bg-white rounded-2xl border overflow-hidden fade-in-up"
            style={{
              borderColor: P.border,
              transition: "transform 200ms cubic-bezier(0.34,1.56,0.64,1), box-shadow 200ms ease",
              animationDelay: `${i * 80}ms`,
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLDivElement).style.transform = "translateY(-6px) scale(1.02)";
              (e.currentTarget as HTMLDivElement).style.boxShadow =
                "0 12px 32px rgba(4,120,87,0.16)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLDivElement).style.transform = "";
              (e.currentTarget as HTMLDivElement).style.boxShadow = "";
            }}
          >
            <div
              className="p-6 text-white text-center relative overflow-hidden"
              style={{ background: `linear-gradient(135deg, ${cert.color}, ${cert.color}cc)` }}
            >
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(45deg,white 0,white 1px,transparent 0,transparent 50%)",
                  backgroundSize: "8px 8px",
                }}
              />
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3 transition-transform duration-300 group-hover:scale-110"
                style={{ background: "rgba(255,255,255,0.2)" }}
              >
                <Award size={28} className="text-white" />
              </div>
              <p className="text-xs mb-0.5" style={{ color: "rgba(255,255,255,0.7)" }}>
                Certificate of Completion
              </p>
              <p className="text-sm font-bold leading-tight">{cert.course}</p>
              {/* Hover-reveal quick info */}
              <div
                className="mt-3 pt-3 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-2 group-hover:translate-y-0"
                style={{ borderTop: "1px solid rgba(255,255,255,0.2)" }}
              >
                <div
                  className="flex items-center justify-center gap-3 text-[10px]"
                  style={{ color: "rgba(255,255,255,0.85)" }}
                >
                  <span>📅 Issued {cert.date.split(",")[0]}</span>
                  <span>·</span>
                  <span style={{ color: "rgba(255,255,255,0.6)" }}>No expiry</span>
                </div>
              </div>
            </div>
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-3 gap-2 text-center">
                {[
                  [`${cert.score}%`, "Score"],
                  [cert.hours, "Duration"],
                  [cert.date.split(",")[0], "Issued"],
                ].map(([v, l]) => (
                  <div key={l}>
                    <p className="text-sm font-bold" style={{ color: P.text }}>
                      {v}
                    </p>
                    <p className="text-[10px]" style={{ color: P.textMuted }}>
                      {l}
                    </p>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-center font-mono" style={{ color: P.textMuted }}>
                {cert.credId}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPreview(cert.id)}
                  className="flex-1 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1"
                  style={{
                    border: `1px solid ${P.border}`,
                    color: P.textMid,
                    transition: "background 150ms ease, border-color 150ms ease",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = P.lightSage;
                    (e.currentTarget as HTMLButtonElement).style.borderColor = P.sage;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = "";
                    (e.currentTarget as HTMLButtonElement).style.borderColor = P.border;
                  }}
                >
                  <Eye size={12} /> Preview
                </button>
                <button
                  className="flex-1 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1"
                  style={{
                    border: `1px solid ${P.border}`,
                    color: P.textMid,
                    transition: "background 150ms ease",
                  }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLButtonElement).style.background = P.lightSage)
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLButtonElement).style.background = "")
                  }
                  data-prototype-action="true"
                >
                  <Share2 size={12} /> Share
                </button>
                <button
                  className="flex-1 py-2 text-white rounded-lg text-xs font-medium flex items-center justify-center gap-1"
                  style={{
                    background: P.olive,
                    transition: "transform 150ms ease, box-shadow 150ms ease",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.04)";
                    (e.currentTarget as HTMLButtonElement).style.boxShadow =
                      "0 4px 12px rgba(4,120,87,0.4)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.transform = "";
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = "";
                  }}
                  data-prototype-action="true"
                >
                  <Download size={12} /> PDF
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── 8. PROFILE ───────────────────────────────────────────────
