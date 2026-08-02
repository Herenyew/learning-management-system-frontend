import React from "react";
import { EditableSelect, Input, P } from "./extended.shared";
import type { HRProgramCreateTabContext } from "./HRProgramCreateTab";

export function HRProgramTargetingSection({ ctx }: { ctx: HRProgramCreateTabContext }) {
  const {
    addManagedOption,
    duration,
    programOwner,
    programOwnerOptions,
    setDuration,
    setProgramOwner,
    setProgramOwnerOptions,
    setVisibility,
    visibility,
  } = ctx;

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1.5 block text-xs font-semibold" style={{ color: P.textMid }}>
          Duration
        </label>
        <input
          value={duration}
          onChange={(event) => setDuration(event.target.value)}
          placeholder="e.g. 8 weeks"
          className="w-full rounded-lg bg-white px-3 py-2 text-sm focus:outline-none"
          style={{ border: `1px solid ${P.border}`, color: P.text }}
        />
      </div>
      <Input label="Start Date" type="date" required />
      <Input label="End Date" type="date" required />

      <EditableSelect
        label="Program Owner"
        required
        options={programOwnerOptions}
        value={programOwner}
        onChange={setProgramOwner}
        onAdd={(value) => addManagedOption(setProgramOwnerOptions, value)}
      />

      <div>
        <label className="mb-1.5 block text-xs font-semibold" style={{ color: P.textMid }}>
          Visibility <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          {(["Public", "Private"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setVisibility(option)}
              className="rounded-lg px-3 py-2 text-xs font-semibold"
              style={{
                background: visibility === option ? P.lightSage : "white",
                border: `1px solid ${visibility === option ? P.olive : P.border}`,
                color: visibility === option ? P.olive : P.textMid,
              }}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
