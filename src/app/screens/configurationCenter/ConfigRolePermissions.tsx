import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Check,
  LoaderCircle,
  RefreshCw,
  Save,
  Search,
  ShieldCheck,
  Users,
} from "lucide-react";

import { accessControlApi } from "../../API/accessControl.api";
import { P } from "../../constants/theme.constants";
import type {
  AccessControlMatrix,
  AccessControlPermission,
  AccessControlRole,
} from "../../models/accessControl.model";

const MODULE_LABELS: Record<string, string> = {
  access_control: "Roles & Access Control",
  system: "System Configuration",
  course: "Courses & Catalog",
  audience: "Audience Management",
  assessment: "Assessments",
  program: "Programs",
  tna: "Training Needs Analysis",
  certificate: "Certificates",
  notification: "Notifications",
  template: "Templates",
  enrollment: "Enrollment",
  workflow: "Approval Workflows",
  gamification: "Gamification",
  analytics: "Analytics & Reporting",
  moderation: "Content Moderation",
};

const moduleLabel = (module: string) =>
  MODULE_LABELS[module] ??
  module
    .split(/[_-]/)
    .map((part) => `${part.slice(0, 1).toUpperCase()}${part.slice(1)}`)
    .join(" ");

const sortedPermissions = (permissions: AccessControlPermission[]) =>
  [...permissions].sort(
    (left, right) =>
      moduleLabel(left.module).localeCompare(moduleLabel(right.module)) ||
      left.code.localeCompare(right.code),
  );

export function ConfigRolePermissions() {
  const [matrix, setMatrix] = useState<AccessControlMatrix | null>(null);
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [currentRoleId, setCurrentRoleId] = useState<number | null>(null);
  const [draft, setDraft] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const selectedRole = matrix?.roles.find((role) => role.id === selectedRoleId) ?? null;
  const original = useMemo(() => new Set(selectedRole?.permissionCodes ?? []), [selectedRole]);
  const dirty =
    draft.size !== original.size || [...draft].some((permission) => !original.has(permission));

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [nextMatrix, me] = await Promise.all([accessControlApi.list(), accessControlApi.me()]);
      setMatrix(nextMatrix);
      setCurrentRoleId(me.appRoleId);
      const nextRoleId =
        nextMatrix.roles.find((role) => role.id === selectedRoleId)?.id ??
        nextMatrix.roles.find((role) => role.isActive)?.id ??
        nextMatrix.roles[0]?.id ??
        null;
      setSelectedRoleId(nextRoleId);
      const nextRole = nextMatrix.roles.find((role) => role.id === nextRoleId);
      setDraft(new Set(nextRole?.permissionCodes ?? []));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to load role permissions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectRole = (role: AccessControlRole) => {
    if (dirty && !window.confirm("Discard unsaved permission changes?")) return;
    setSelectedRoleId(role.id);
    setDraft(new Set(role.permissionCodes));
    setNotice("");
    setError("");
  };

  const filteredPermissions = useMemo(() => {
    const query = search.trim().toLowerCase();
    return sortedPermissions(matrix?.permissions ?? []).filter(
      (permission) =>
        !query ||
        permission.code.toLowerCase().includes(query) ||
        permission.description?.toLowerCase().includes(query) ||
        moduleLabel(permission.module).toLowerCase().includes(query),
    );
  }, [matrix?.permissions, search]);

  const groupedPermissions = useMemo(() => {
    const groups = new Map<string, AccessControlPermission[]>();
    for (const permission of filteredPermissions) {
      groups.set(permission.module, [...(groups.get(permission.module) ?? []), permission]);
    }
    return [...groups.entries()];
  }, [filteredPermissions]);

  const togglePermission = (code: string) => {
    if (selectedRoleId === currentRoleId && code === "access_control.manage" && draft.has(code)) {
      setError("You cannot remove access-control management from your own role.");
      return;
    }
    setError("");
    setNotice("");
    setDraft((current) => {
      const next = new Set(current);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  };

  const setModule = (permissions: AccessControlPermission[], enabled: boolean) => {
    setDraft((current) => {
      const next = new Set(current);
      for (const permission of permissions) {
        if (
          !enabled &&
          selectedRoleId === currentRoleId &&
          permission.code === "access_control.manage"
        ) {
          continue;
        }
        if (enabled) next.add(permission.code);
        else next.delete(permission.code);
      }
      return next;
    });
  };

  const save = async () => {
    if (!selectedRole || !selectedRole.isActive) return;
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const nextMatrix = await accessControlApi.updateRolePermissions(
        selectedRole.id,
        [...draft].sort(),
      );
      setMatrix(nextMatrix);
      const updated = nextMatrix.roles.find((role) => role.id === selectedRole.id);
      setDraft(new Set(updated?.permissionCodes ?? []));
      setNotice(
        `Permissions saved for ${selectedRole.name}. ${selectedRole.employeeCount} employee${selectedRole.employeeCount === 1 ? "" : "s"} inherit this policy.`,
      );
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to save role permissions.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div
        className="flex items-center justify-center gap-2 py-16 text-sm"
        style={{ color: P.textMuted }}
      >
        <LoaderCircle size={17} className="animate-spin" /> Loading EMS roles and LMS permissions…
      </div>
    );
  }

  if (!matrix || (error && matrix === null)) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
        <div className="flex items-center gap-2 font-semibold">
          <AlertCircle size={17} /> Unable to load role permissions
        </div>
        <p className="mt-2">{error}</p>
        <button type="button" onClick={() => void load()} className="mt-4 font-semibold underline">
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border bg-white p-5" style={{ borderColor: P.border }}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck size={20} style={{ color: P.olive }} />
              <h2 className="text-base font-bold" style={{ color: P.text }}>
                EMS Role Permissions
              </h2>
            </div>
            <p className="mt-1 max-w-3xl text-xs leading-5" style={{ color: P.textMuted }}>
              EMS controls which role each employee has. Configure what that role can do in LearnOS;
              every active employee assigned to the role inherits the same permissions
              automatically.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void load()}
            className="flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold"
            style={{ borderColor: P.border, color: P.textMid }}
          >
            <RefreshCw size={13} /> Refresh roles
          </button>
        </div>
      </div>

      {(error || notice) && (
        <div
          className={`rounded-xl border p-3 text-sm ${error ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-800"}`}
        >
          {error || notice}
        </div>
      )}

      <div className="grid min-h-[560px] gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="rounded-2xl border bg-white p-3" style={{ borderColor: P.border }}>
          <p
            className="px-2 pb-2 text-[10px] font-bold uppercase tracking-wider"
            style={{ color: P.textMuted }}
          >
            EMS roles
          </p>
          <div className="space-y-2">
            {matrix.roles.map((role) => {
              const selected = role.id === selectedRoleId;
              return (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => selectRole(role)}
                  className="w-full rounded-xl border p-3 text-left transition"
                  style={{
                    borderColor: selected ? P.olive : P.border,
                    background: selected ? P.lightSage : "white",
                    opacity: role.isActive ? 1 : 0.55,
                  }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold" style={{ color: P.text }}>
                      {role.name}
                    </span>
                    {selected && <Check size={14} style={{ color: P.olive }} />}
                  </div>
                  <div
                    className="mt-1 flex items-center gap-1 text-[10px]"
                    style={{ color: P.textMuted }}
                  >
                    <Users size={11} /> {role.employeeCount} employees ·{" "}
                    {role.permissionCodes.length} permissions
                  </div>
                  {!role.isActive && (
                    <p className="mt-1 text-[10px] text-red-600">Inactive in EMS</p>
                  )}
                </button>
              );
            })}
          </div>
        </aside>

        <section className="rounded-2xl border bg-white p-5" style={{ borderColor: P.border }}>
          <div
            className="flex flex-wrap items-center justify-between gap-3 border-b pb-4"
            style={{ borderColor: P.border }}
          >
            <div>
              <h3 className="text-base font-bold" style={{ color: P.text }}>
                {selectedRole?.name ?? "Select a role"}
              </h3>
              <p className="text-xs" style={{ color: P.textMuted }}>
                {selectedRole?.employeeCount ?? 0} employees will receive the saved permissions.
              </p>
            </div>
            <div className="relative min-w-[260px]">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: P.textMuted }}
              />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search permissions…"
                className="w-full rounded-lg border py-2 pl-9 pr-3 text-xs outline-none"
                style={{ borderColor: P.border, color: P.text }}
              />
            </div>
          </div>

          <div className="mt-4 max-h-[620px] space-y-4 overflow-y-auto pr-1">
            {groupedPermissions.map(([module, permissions]) => {
              const allEnabled = permissions.every((permission) => draft.has(permission.code));
              return (
                <div key={module} className="rounded-xl border" style={{ borderColor: P.border }}>
                  <div
                    className="flex items-center justify-between gap-3 border-b px-4 py-3"
                    style={{ borderColor: P.border, background: P.bg }}
                  >
                    <div>
                      <p className="text-xs font-bold" style={{ color: P.text }}>
                        {moduleLabel(module)}
                      </p>
                      <p className="text-[10px]" style={{ color: P.textMuted }}>
                        {permissions.filter((permission) => draft.has(permission.code)).length}/
                        {permissions.length} enabled
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setModule(permissions, !allEnabled)}
                      className="text-[11px] font-semibold"
                      style={{ color: P.olive }}
                    >
                      {allEnabled ? "Clear module" : "Enable module"}
                    </button>
                  </div>
                  <div className="divide-y" style={{ borderColor: P.border }}>
                    {permissions.map((permission) => {
                      const checked = draft.has(permission.code);
                      const protectedOwnPermission =
                        selectedRoleId === currentRoleId &&
                        permission.code === "access_control.manage";
                      return (
                        <label
                          key={permission.code}
                          className="flex cursor-pointer items-start gap-3 px-4 py-3"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            disabled={!selectedRole?.isActive || protectedOwnPermission}
                            onChange={() => togglePermission(permission.code)}
                            className="mt-0.5 h-4 w-4 accent-emerald-700"
                          />
                          <span className="min-w-0">
                            <span className="block text-xs font-semibold" style={{ color: P.text }}>
                              {permission.code}
                            </span>
                            <span
                              className="mt-0.5 block text-[11px] leading-4"
                              style={{ color: P.textMuted }}
                            >
                              {permission.description ?? "No description provided."}
                              {protectedOwnPermission
                                ? " This grant is protected to prevent lockout."
                                : ""}
                            </span>
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <div
            className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t pt-4"
            style={{ borderColor: P.border }}
          >
            <p className="text-xs" style={{ color: dirty ? P.gold : P.textMuted }}>
              {dirty ? "Unsaved permission changes" : "Role permissions are up to date"}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setDraft(new Set(selectedRole?.permissionCodes ?? []))}
                disabled={!dirty || saving}
                className="rounded-lg border px-4 py-2 text-xs font-semibold disabled:opacity-50"
                style={{ borderColor: P.border, color: P.textMid }}
              >
                Discard
              </button>
              <button
                type="button"
                onClick={() => void save()}
                disabled={!dirty || saving || !selectedRole?.isActive}
                className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
                style={{ background: P.olive }}
              >
                {saving ? <LoaderCircle size={13} className="animate-spin" /> : <Save size={13} />}
                Save role permissions
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
