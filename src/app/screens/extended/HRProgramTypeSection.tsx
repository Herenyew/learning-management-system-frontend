import React from "react";
import { Archive, Edit, P, Plus, PROGRAM_TYPE_DEFAULTS, RefreshCw } from "./extended.shared";
import type { HRProgramCreateTabContext } from "./HRProgramCreateTab";

export function HRProgramTypeSection({ ctx }: { ctx: HRProgramCreateTabContext }) {
  const {
    activeProgTypes,
    applyProgramTypeDefaults,
    createProgramType,
    editIdx,
    editingList,
    editVal,
    newItem,
    programType,
    progTypes,
    renameProgramType,
    restoreProgramType,
    retireProgramType,
    selectedProgramTypeRecord,
    setEditingList,
    setEditIdx,
    setEditVal,
    setNewItem,
  } = ctx;

  return (
    <>
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold" style={{ color: P.textMid }}>
            Program Type <span className="text-red-500">*</span>
          </p>
          <button
            onClick={() => setEditingList(editingList === "types" ? null : "types")}
            className="text-[10px] font-semibold flex items-center gap-0.5"
            style={{ color: editingList === "types" ? "#C0392B" : P.olive }}
          >
            {editingList === "types" ? "✕ Done" : "⚙ Manage"}
          </button>
        </div>

        {editingList !== "types" ? (
          <div className="grid grid-cols-1 gap-1.5">
            {activeProgTypes.map((t) => {
              const defaults = PROGRAM_TYPE_DEFAULTS[t.name];
              return (
                <label
                  key={t.id}
                  className="flex items-start gap-2.5 p-2.5 rounded-lg cursor-pointer border"
                  style={{
                    borderColor: programType === t.name ? P.olive : P.border,
                    background: programType === t.name ? P.paleGreen : "white",
                  }}
                >
                  <input
                    type="radio"
                    name="progType"
                    checked={programType === t.name}
                    onChange={() => applyProgramTypeDefaults(t.name)}
                    style={{ accentColor: P.olive, marginTop: 2 }}
                  />
                  <span className="min-w-0">
                    <span className="block text-xs font-medium" style={{ color: P.textMid }}>
                      {t.name}
                    </span>
                    {defaults && (
                      <span className="block text-[10px] mt-0.5" style={{ color: P.textMuted }}>
                        {defaults.duration}
                      </span>
                    )}
                  </span>
                </label>
              );
            })}
            {selectedProgramTypeRecord?.status === "retired" && (
              <p className="text-[10px]" style={{ color: P.textMuted }}>
                This type is retired and kept only for historical programs. Choose an active type
                for new program creation.
              </p>
            )}
          </div>
        ) : (
          <div className="rounded-xl border overflow-hidden" style={{ borderColor: P.border }}>
            <div
              className="px-3 py-2 text-[10px]"
              style={{ background: P.paleGreen, color: P.textMuted }}
            >
              Retired types stay attached to historical programs but are hidden from new program
              creation.
            </div>
            {progTypes.map((t, i) => (
              <div
                key={t.id}
                className="flex items-center gap-2 px-3 py-2"
                style={{ borderBottom: `1px solid ${P.border}50`, background: "white" }}
              >
                {editIdx === i ? (
                  <>
                    <input
                      value={editVal}
                      onChange={(e) => setEditVal(e.target.value)}
                      className="flex-1 px-2 py-1 text-xs rounded bg-white focus:outline-none"
                      style={{ border: `1px solid ${P.olive}`, color: P.text }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          renameProgramType(i, editVal);
                        }
                      }}
                      autoFocus
                    />
                    <button
                      onClick={() => renameProgramType(i, editVal)}
                      className="text-[10px] font-semibold px-2 py-1 rounded text-white"
                      style={{ background: P.olive }}
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditIdx(null)}
                      className="text-[10px]"
                      style={{ color: P.textMuted }}
                    >
                      ✕
                    </button>
                  </>
                ) : (
                  <>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-medium truncate" style={{ color: P.textMid }}>
                          {t.name}
                        </span>
                        <span
                          className="px-1.5 py-0.5 rounded-full text-[9px] font-bold"
                          style={{
                            background: t.status === "active" ? P.paleGreen : P.goldLight,
                            color: t.status === "active" ? P.olive : "#8A6A1A",
                          }}
                        >
                          {t.status === "active" ? "Active" : "Retired"}
                        </span>
                      </div>
                      {t.status === "retired" && (
                        <p className="text-[10px] mt-0.5" style={{ color: P.textMuted }}>
                          Retired {t.retiredAt ?? "recently"} · historical programs retained
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        setEditIdx(i);
                        setEditVal(t.name);
                      }}
                      className="p-1 rounded hover:bg-[#ECFDF5] transition-colors"
                      title="Rename"
                      style={{ color: P.olive }}
                    >
                      <Edit size={11} />
                    </button>
                    {t.status === "active" ? (
                      <button
                        onClick={() => retireProgramType(t.id)}
                        className="p-1 rounded hover:bg-[#FFF7E5] transition-colors"
                        title="Retire"
                        style={{ color: "#A66A00" }}
                      >
                        <Archive size={11} />
                      </button>
                    ) : (
                      <button
                        onClick={() => restoreProgramType(t.id)}
                        className="p-1 rounded hover:bg-[#ECFDF5] transition-colors"
                        title="Restore"
                        style={{ color: P.olive }}
                      >
                        <RefreshCw size={11} />
                      </button>
                    )}
                  </>
                )}
              </div>
            ))}
            <div className="flex gap-1.5 p-2" style={{ background: P.bg }}>
              <input
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                placeholder="Add type…"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newItem.trim()) {
                    createProgramType(newItem);
                  }
                }}
                className="flex-1 px-2 py-1.5 text-xs rounded-lg bg-white focus:outline-none"
                style={{ border: `1px solid ${P.border}`, color: P.text }}
              />
              <button
                onClick={() => {
                  if (newItem.trim()) {
                    createProgramType(newItem);
                  }
                }}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg text-white"
                style={{ background: P.olive }}
              >
                <Plus size={11} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Right column fields ── */}
    </>
  );
}
