import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Check,
  CheckCircle,
  Crown,
  ExternalLink,
  FileKey,
  Layers,
  Link2,
  LoaderCircle,
  Plus,
  RefreshCw,
  RotateCcw,
  Save,
  Search,
  Shield,
  ShieldCheck,
  Trash2,
  UserCog,
  UserPlus,
  Users,
} from "lucide-react";

import { accessControlApi } from "../../API/accessControl.api";
import { P } from "../../constants/theme.constants";
import type {
  AccessControlMatrix,
  AccessControlPermission,
  AccessControlRole,
  EmsMapping,
  PermissionGroup,
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

const SYSTEM_ROLE_NAMES = new Set(["Learner", "Manager", "HR User", "Admin", "CEO", "Finance"]);

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

type TabId = "roles" | "groups" | "ems" | "users";

const ROLE_ICONS: Record<string, React.ElementType> = {
  Learner: Users,
  Manager: UserCog,
  "Course Creator": FileKey,
  Instructor: Users,
  "HR User": ShieldCheck,
  Admin: Crown,
  CEO: Crown,
  Finance: Shield,
  "External Instructor": ExternalLink,
};

function roleIcon(roleName: string, fallback: React.ElementType): React.ElementType {
  return ROLE_ICONS[roleName] ?? fallback;
}

export function ConfigRolePermissions() {
  const [tab, setTab] = useState<TabId>("roles");
  const [matrix, setMatrix] = useState<AccessControlMatrix | null>(null);
  const [currentRoleId, setCurrentRoleId] = useState<number | null>(null);
  const [drafts, setDrafts] = useState<Record<number, Set<string>>>({});
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "disabled">("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  // Permission Groups
  const [groups, setGroups] = useState<PermissionGroup[]>([]);
  const [groupsLoading, setGroupsLoading] = useState(false);
  const [groupForm, setGroupForm] = useState({ name: "", description: "", module: "course" });

  // EMS Mappings
  const [emsMappings, setEmsMappings] = useState<EmsMapping[]>([]);
  const [emsLoading, setEmsLoading] = useState(false);
  const [emsForm, setEmsForm] = useState({
    emsRoleName: "",
    appRoleId: 0,
    autoAssign: true,
    priority: 0,
  });
  const [emsSyncResult, setEmsSyncResult] = useState<{
    processed: number;
    assigned: number;
    skipped: number;
  } | null>(null);

  const roleDraft = (role: AccessControlRole): Set<string> =>
    drafts[role.id] ?? new Set(role.permissionCodes);

  const isRoleDirty = (role: AccessControlRole) => {
    const current = roleDraft(role);
    return (
      current.size !== role.permissionCodes.length ||
      [...current].some((code) => !role.permissionCodes.includes(code))
    );
  };

  const anyDirty = useMemo(
    () => (matrix?.roles ?? []).some((role) => isRoleDirty(role)),
    [matrix, drafts],
  );

  const loadMatrix = async () => {
    setLoading(true);
    setError("");
    try {
      const [nextMatrix, me] = await Promise.all([accessControlApi.list(), accessControlApi.me()]);
      setMatrix(nextMatrix);
      setCurrentRoleId(me.appRoleId);
      const nextDrafts: Record<number, Set<string>> = {};
      for (const role of nextMatrix.roles) nextDrafts[role.id] = new Set(role.permissionCodes);
      setDrafts(nextDrafts);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to load role permissions.");
    } finally {
      setLoading(false);
    }
  };

  const loadGroups = async () => {
    setGroupsLoading(true);
    setError("");
    try {
      setGroups(await accessControlApi.listPermissionGroups());
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to load permission groups.");
    } finally {
      setGroupsLoading(false);
    }
  };

  const loadEms = async () => {
    setEmsLoading(true);
    setError("");
    try {
      setEmsMappings(await accessControlApi.listEmsMappings());
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to load EMS mappings.");
    } finally {
      setEmsLoading(false);
    }
  };

  useEffect(() => {
    void loadMatrix();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (tab === "groups") void loadGroups();
    if (tab === "ems") void loadEms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const moduleGroups = useMemo(() => {
    const groups = new Map<string, AccessControlPermission[]>();
    for (const p of sortedPermissions(matrix?.permissions ?? []))
      groups.set(p.module, [...(groups.get(p.module) ?? []), p]);
    return [...groups.entries()];
  }, [matrix?.permissions]);

  const visibleRoles = useMemo(() => {
    const query = search.trim().toLowerCase();
    return (matrix?.roles ?? []).filter((role) => {
      const statusOk =
        statusFilter === "all" ||
        (statusFilter === "active" && role.isActive) ||
        (statusFilter === "disabled" && !role.isActive);
      if (!statusOk) return false;
      if (!query) return true;
      return (
        role.name.toLowerCase().includes(query) ||
        role.description?.toLowerCase().includes(query) ||
        role.permissionCodes.some((code) => code.toLowerCase().includes(query))
      );
    });
  }, [matrix?.roles, search, statusFilter]);

  const setRoleDraft = (roleId: number, next: Set<string>) =>
    setDrafts((cur) => ({ ...cur, [roleId]: next }));

  const toggleModuleForRole = (
    role: AccessControlRole,
    perms: AccessControlPermission[],
    grant: boolean,
  ) => {
    if (
      !grant &&
      role.id === currentRoleId &&
      perms.some((p) => p.code === "access_control.manage")
    ) {
      setError("You cannot remove access-control management from your own role.");
      return;
    }
    setError("");
    setNotice("");
    const next = new Set(roleDraft(role));
    if (grant) perms.forEach((p) => next.add(p.code));
    else perms.forEach((p) => next.delete(p.code));
    setRoleDraft(role.id, next);
  };

  const saveRole = async (role: AccessControlRole) => {
    setSaving(true);
    setError("");
    setNotice("");
    try {
      await accessControlApi.replaceRolePermissions(role.id, [...roleDraft(role)].sort());
      await loadMatrix();
      setNotice(`Permissions for ${role.name} saved successfully.`);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to save role permissions.");
    } finally {
      setSaving(false);
    }
  };

  const discardRole = (role: AccessControlRole) =>
    setRoleDraft(role.id, new Set(role.permissionCodes));

  const saveAll = async () => {
    if (!matrix) return;
    const dirtyRoles = matrix.roles.filter(isRoleDirty);
    if (dirtyRoles.length === 0) return;
    if (!window.confirm(`Save permission changes for ${dirtyRoles.length} role(s)?`)) return;
    setSaving(true);
    setError("");
    setNotice("");
    try {
      for (const role of dirtyRoles) {
        await accessControlApi.replaceRolePermissions(role.id, [...roleDraft(role)].sort());
      }
      await loadMatrix();
      setNotice("Role permissions saved successfully.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to save role permissions.");
      await loadMatrix();
    } finally {
      setSaving(false);
    }
  };

  const createGroup = async () => {
    setError("");
    setNotice("");
    try {
      await accessControlApi.createPermissionGroup({
        name: groupForm.name,
        description: groupForm.description || undefined,
        module: groupForm.module,
      });
      await loadGroups();
      setGroupForm({ name: "", description: "", module: "course" });
      setNotice("Permission group created.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to create group.");
    }
  };

  const deleteGroup = async (id: number) => {
    if (!window.confirm("Delete this permission group? Permissions will be unlinked.")) return;
    try {
      await accessControlApi.deletePermissionGroup(id);
      await loadGroups();
      setNotice("Permission group deleted.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to delete group.");
    }
  };

  const createEmsMapping = async () => {
    setError("");
    setNotice("");
    try {
      await accessControlApi.createEmsMapping(emsForm);
      await loadEms();
      setEmsForm({ emsRoleName: "", appRoleId: 0, autoAssign: true, priority: 0 });
      setNotice("EMS mapping created.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to create mapping.");
    }
  };

  const deleteEmsMapping = async (id: number) => {
    if (!window.confirm("Delete this EMS mapping?")) return;
    try {
      await accessControlApi.deleteEmsMapping(id);
      await loadEms();
      setNotice("EMS mapping deleted.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to delete mapping.");
    }
  };

  const toggleEmsMapping = async (mapping: EmsMapping) => {
    try {
      await accessControlApi.updateEmsMapping(mapping.id, { isActive: !mapping.isActive });
      await loadEms();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to update mapping.");
    }
  };

  const runSync = async () => {
    setEmsSyncResult(null);
    setError("");
    setNotice("");
    try {
      const result = await accessControlApi.syncFromEms([]);
      setEmsSyncResult(result);
      setNotice(
        "EMS sync complete: " + result.assigned + " assigned, " + result.skipped + " skipped.",
      );
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to sync.");
    }
  };

  const TABS: Array<{ id: TabId; label: string; icon: React.ElementType }> = [
    { id: "roles", label: "Roles & Permissions", icon: ShieldCheck },
    { id: "groups", label: "Permission Groups", icon: Layers },
    { id: "ems", label: "EMS Mappings", icon: Link2 },
    { id: "users", label: "User Roles", icon: UserPlus },
  ];

  return (
    <div className="space-y-4">
      <div
        className="rounded-2xl border bg-white p-5"
        style={{ borderColor: P.border, boxShadow: `0 14px 34px ${P.borderMid}33` }}
      >
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span
              className="flex h-11 w-11 items-center justify-center rounded-xl"
              style={{ background: P.lightSage }}
            >
              <ShieldCheck size={22} style={{ color: P.olive }} />
            </span>
            <div>
              <h2 className="text-lg font-bold leading-tight" style={{ color: P.text }}>
                Roles &amp; Access Control
              </h2>
              <p className="flex items-center gap-1.5 text-xs" style={{ color: P.textMuted }}>
                Configure LMS permissions assigned to EMS roles
                <CheckCircle size={12} style={{ color: "#16A34A" }} />
                <span style={{ color: P.textMid }}>
                  {matrix?.roles.length ?? 0} roles · {matrix?.permissions.length ?? 0} permissions
                </span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (tab === "roles") void loadMatrix();
                if (tab === "groups") void loadGroups();
                if (tab === "ems") void loadEms();
              }}
              className="flex items-center gap-1.5 rounded-lg border px-4 py-2 text-xs font-semibold transition hover:opacity-85"
              style={{ borderColor: P.border, color: P.textMid }}
            >
              <RefreshCw size={13} /> Refresh
            </button>
            <button
              type="button"
              onClick={() => void saveAll()}
              disabled={!anyDirty || saving}
              className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold text-white transition disabled:opacity-50"
              style={{ background: P.olive }}
            >
              {saving ? <LoaderCircle size={13} className="animate-spin" /> : <Save size={13} />}
              Save changes
            </button>
          </div>
        </div>

        {/* Tab bar */}
        <div
          className="mt-4 flex flex-wrap gap-1 rounded-xl p-1"
          style={{ background: P.paleGreen, border: `1px solid ${P.border}` }}
        >
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setError("");
                  setNotice("");
                  setTab(t.id);
                }}
                className="flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition"
                style={{
                  background: active ? "white" : "transparent",
                  color: active ? P.olive : P.textMuted,
                  boxShadow: active ? `inset 0 0 0 1px ${P.sage}` : "none",
                }}
              >
                <Icon size={14} />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Search + status filter */}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <div className="relative min-w-[260px] flex-1">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: P.textMuted }}
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search roles, permissions, groups, mappings..."
              className="w-full rounded-lg border bg-white py-2.5 pl-9 pr-3 text-xs outline-none focus:ring-2"
              style={{
                borderColor: P.border,
                color: P.text,
                ["--tw-ring-color" as any]: P.olive,
              }}
            />
          </div>
          <div
            className="flex items-center gap-1 rounded-lg p-1"
            style={{ background: P.paleGreen, border: `1px solid ${P.border}` }}
          >
            {(
              [
                { id: "all", label: "All" },
                { id: "active", label: "Active" },
                { id: "disabled", label: "Disabled" },
              ] as const
            ).map((opt) => {
              const active = statusFilter === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setStatusFilter(opt.id)}
                  className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[11px] font-semibold transition"
                  style={{
                    background: active ? "white" : "transparent",
                    color: active ? P.olive : P.textMuted,
                    boxShadow: active ? `inset 0 0 0 1px ${P.sage}` : "none",
                  }}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {(error || notice) && (
          <div
            className="flex items-center gap-2 rounded-xl border px-4 py-3 text-sm"
            role="alert"
            style={
              error
                ? { borderColor: "#FECACA", background: "#FEF2F2", color: "#B91C1C" }
                : { borderColor: P.sage, background: P.lightSage, color: P.darkOlive }
            }
          >
            {error ? <AlertCircle size={15} /> : <CheckCircle size={15} />}
            {error || notice}
          </div>
        )}

        {/* ─── ROLES TAB ─────────────────────────────────────────────────── */}
        {tab === "roles" && (
          <>
            {loading ? (
              <div className="flex h-96 items-center justify-center">
                <LoaderCircle size={24} className="animate-spin" style={{ color: P.olive }} />
              </div>
            ) : visibleRoles.length === 0 ? (
              <div
                className="flex h-64 flex-col items-center justify-center gap-2 text-sm"
                style={{ color: P.textMuted }}
              >
                <Shield size={28} />
                No roles match the current search or filter.
              </div>
            ) : (
              <div
                className="mt-4 overflow-x-auto rounded-xl border"
                style={{ borderColor: P.border }}
              >
                <table className="w-full min-w-[980px] border-collapse text-left">
                  <thead>
                    <tr style={{ background: P.paleGreen }}>
                      <th
                        className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider"
                        style={{ color: P.textMid }}
                      >
                        Role
                      </th>
                      {moduleGroups.map(([module, perms]) => (
                        <th
                          key={module}
                          className="px-3 py-3 text-center text-[10px] font-bold uppercase tracking-wider"
                          style={{ color: P.textMid }}
                          title={perms.map((p) => p.code).join("\n")}
                        >
                          {moduleLabel(module)}
                        </th>
                      ))}
                      <th
                        className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider"
                        style={{ color: P.textMid }}
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleRoles.map((role) => {
                      const Icon = roleIcon(role.name, Users);
                      const current = roleDraft(role);
                      const roleDirty = isRoleDirty(role);
                      return (
                        <tr
                          key={role.id}
                          className="border-t transition hover:bg-black/[0.015]"
                          style={{ borderColor: P.border }}
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <span
                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                                style={{ background: P.lightSage }}
                              >
                                <Icon size={16} style={{ color: P.olive }} />
                              </span>
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="text-sm font-bold" style={{ color: P.text }}>
                                    {role.name}
                                  </span>
                                  {role.description && (
                                    <span className="text-[11px]" style={{ color: P.textMuted }}>
                                      {role.description}
                                    </span>
                                  )}
                                  <span
                                    className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                                    style={{ background: P.paleGreen, color: P.olive }}
                                  >
                                    {role.employeeCount} users
                                  </span>
                                  {!role.isActive && (
                                    <span
                                      className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                                      style={{ background: "#E5E7EB", color: P.textMuted }}
                                    >
                                      Inactive
                                    </span>
                                  )}
                                </div>
                                <p className="mt-0.5 text-[10px]" style={{ color: P.textMuted }}>
                                  {current.size} of {matrix?.permissions.length ?? 0} permissions
                                </p>
                              </div>
                            </div>
                          </td>
                          {moduleGroups.map(([module, perms]) => {
                            const all = perms.every((p) => current.has(p.code));
                            const some = !all && perms.some((p) => current.has(p.code));
                            return (
                              <td key={module} className="px-3 py-3 text-center">
                                <input
                                  type="checkbox"
                                  checked={all}
                                  ref={(el) => {
                                    if (el) el.indeterminate = some;
                                  }}
                                  disabled={!role.isActive || saving}
                                  onChange={() => toggleModuleForRole(role, perms, !all)}
                                  className="h-[18px] w-[18px] cursor-pointer"
                                  style={{ accentColor: P.olive }}
                                />
                              </td>
                            );
                          })}
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-1.5">
                              {roleDirty ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => void saveRole(role)}
                                    disabled={saving}
                                    title="Save role permissions"
                                    className="rounded-lg p-2 transition hover:opacity-80 disabled:opacity-50"
                                    style={{ background: P.paleGreen, color: P.olive }}
                                  >
                                    <Check size={15} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => discardRole(role)}
                                    disabled={saving}
                                    title="Discard changes"
                                    className="rounded-lg border p-2 transition hover:opacity-80 disabled:opacity-50"
                                    style={{ borderColor: P.border, color: P.textMid }}
                                  >
                                    <RotateCcw size={15} />
                                  </button>
                                </>
                              ) : (
                                <span
                                  className="rounded-lg p-2 text-[11px]"
                                  style={{ color: P.textMuted }}
                                  title="No pending changes"
                                >
                                  —
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Legend + count footer */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <div
                className="flex flex-wrap items-center gap-4 text-[11px]"
                style={{ color: P.textMuted }}
              >
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-sm" style={{ background: P.olive }} />
                  Checked = access granted
                </span>
                <span className="flex items-center gap-1.5">
                  <span
                    className="h-2.5 w-2.5 rounded-sm border"
                    style={{ borderColor: P.border, background: "white" }}
                  />
                  Unchecked = access denied
                </span>
                <span>Click a checkbox to grant or revoke the whole module for that role</span>
              </div>
              <p className="flex items-center gap-1.5 text-[11px]" style={{ color: P.textMuted }}>
                Showing {visibleRoles.length} of {matrix?.roles.length ?? 0} roles
              </p>
            </div>
          </>
        )}
        {/* ─── GROUPS TAB ─────────────────────────────────────────────────── */}
        {tab === "groups" && (
          <div className="grid gap-5 lg:grid-cols-[320px_minmax(0,1fr)]">
            <aside className="rounded-2xl border bg-white p-4" style={{ borderColor: P.border }}>
              <p
                className="pb-3 text-[10px] font-bold uppercase tracking-wider"
                style={{ color: P.textMuted }}
              >
                Create group
              </p>
              <div className="space-y-3">
                <div>
                  <label
                    className="mb-1 block text-[10px] font-semibold uppercase"
                    style={{ color: P.textMuted }}
                  >
                    Name *
                  </label>
                  <input
                    value={groupForm.name}
                    onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })}
                    placeholder="e.g. Course Management"
                    className="w-full rounded-lg border px-3 py-2 text-xs outline-none focus:ring-2"
                    style={{ borderColor: P.border, color: P.text }}
                  />
                </div>
                <div>
                  <label
                    className="mb-1 block text-[10px] font-semibold uppercase"
                    style={{ color: P.textMuted }}
                  >
                    Description
                  </label>
                  <textarea
                    value={groupForm.description}
                    onChange={(e) => setGroupForm({ ...groupForm, description: e.target.value })}
                    placeholder="What does this group cover?"
                    rows={3}
                    className="w-full rounded-lg border px-3 py-2 text-xs outline-none focus:ring-2"
                    style={{ borderColor: P.border, color: P.text }}
                  />
                </div>
                <div>
                  <label
                    className="mb-1 block text-[10px] font-semibold uppercase"
                    style={{ color: P.textMuted }}
                  >
                    Module
                  </label>
                  <select
                    value={groupForm.module}
                    onChange={(e) => setGroupForm({ ...groupForm, module: e.target.value })}
                    className="w-full rounded-lg border px-3 py-2 text-xs outline-none focus:ring-2"
                    style={{ borderColor: P.border, color: P.text }}
                  >
                    {Object.entries(MODULE_LABELS).map(([id, label]) => (
                      <option key={id} value={id}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  onClick={() => void createGroup()}
                  disabled={!groupForm.name.trim()}
                  className="flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold text-white disabled:opacity-50"
                  style={{ background: P.olive }}
                >
                  <Plus size={14} /> Create group
                </button>
              </div>
            </aside>

            <section className="rounded-2xl border bg-white p-4" style={{ borderColor: P.border }}>
              <div
                className="flex items-center justify-between border-b pb-3"
                style={{ borderColor: P.border }}
              >
                <div>
                  <h3 className="text-sm font-bold" style={{ color: P.text }}>
                    Permission Groups
                  </h3>
                  <p className="text-xs" style={{ color: P.textMuted }}>
                    Organize permissions into named groups for the UI
                  </p>
                </div>
                {groupsLoading && (
                  <LoaderCircle size={16} className="animate-spin" style={{ color: P.olive }} />
                )}
              </div>
              <div className="mt-3 space-y-2">
                {groups.length === 0 && !groupsLoading ? (
                  <div
                    className="flex flex-col items-center justify-center rounded-xl border py-10 text-center"
                    style={{ borderColor: P.border }}
                  >
                    <span
                      className="flex h-11 w-11 items-center justify-center rounded-xl"
                      style={{ background: P.lightSage }}
                    >
                      <Layers size={20} style={{ color: P.olive }} />
                    </span>
                    <p className="mt-2 text-sm font-semibold" style={{ color: P.text }}>
                      No permission groups yet
                    </p>
                    <p className="text-xs" style={{ color: P.textMuted }}>
                      Create a group to organize permissions for the UI.
                    </p>
                  </div>
                ) : (
                  groups.map((g) => (
                    <div
                      key={g.id}
                      className="flex items-center justify-between rounded-xl border px-4 py-3 transition hover:shadow-sm"
                      style={{ borderColor: P.border }}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className="flex h-10 w-10 items-center justify-center rounded-lg"
                          style={{ background: P.lightSage }}
                        >
                          <Layers size={16} style={{ color: P.olive }} />
                        </span>
                        <div>
                          <p className="text-sm font-semibold" style={{ color: P.text }}>
                            {g.name}
                          </p>
                          <p className="text-[11px]" style={{ color: P.textMuted }}>
                            {moduleLabel(g.module)} · {g._count?.permissions ?? 0} permissions
                            {g.description ? ` · ${g.description}` : ""}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => void deleteGroup(g.id)}
                        className="rounded-lg p-2 text-red-500 transition hover:bg-red-50"
                        title="Delete group"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        )}

        {/* ─── EMS TAB ────────────────────────────────────────────────────── */}
        {tab === "ems" && (
          <div className="grid gap-5 lg:grid-cols-[320px_minmax(0,1fr)]">
            <aside className="rounded-2xl border bg-white p-4" style={{ borderColor: P.border }}>
              <p
                className="pb-3 text-[10px] font-bold uppercase tracking-wider"
                style={{ color: P.textMuted }}
              >
                New EMS mapping
              </p>
              <div className="space-y-3">
                <div>
                  <label
                    className="mb-1 block text-[10px] font-semibold uppercase"
                    style={{ color: P.textMuted }}
                  >
                    EMS role name *
                  </label>
                  <input
                    value={emsForm.emsRoleName}
                    onChange={(e) => setEmsForm({ ...emsForm, emsRoleName: e.target.value })}
                    placeholder="e.g. department_head"
                    className="w-full rounded-lg border px-3 py-2 text-xs outline-none focus:ring-2"
                    style={{ borderColor: P.border, color: P.text }}
                  />
                </div>
                <div>
                  <label
                    className="mb-1 block text-[10px] font-semibold uppercase"
                    style={{ color: P.textMuted }}
                  >
                    Map to LMS role *
                  </label>
                  <select
                    value={emsForm.appRoleId}
                    onChange={(e) => setEmsForm({ ...emsForm, appRoleId: Number(e.target.value) })}
                    className="w-full rounded-lg border px-3 py-2 text-xs outline-none focus:ring-2"
                    style={{ borderColor: P.border, color: P.text }}
                  >
                    <option value={0}>Select a role…</option>
                    {(matrix?.roles ?? [])
                      .filter((r) => r.isActive)
                      .map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name}
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label
                    className="mb-1 block text-[10px] font-semibold uppercase"
                    style={{ color: P.textMuted }}
                  >
                    Priority
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={emsForm.priority}
                    onChange={(e) => setEmsForm({ ...emsForm, priority: Number(e.target.value) })}
                    className="w-full rounded-lg border px-3 py-2 text-xs outline-none focus:ring-2"
                    style={{ borderColor: P.border, color: P.text }}
                  />
                </div>
                <label
                  className="flex cursor-pointer items-center gap-2 text-xs"
                  style={{ color: P.textMuted }}
                >
                  <input
                    type="checkbox"
                    checked={emsForm.autoAssign}
                    onChange={(e) => setEmsForm({ ...emsForm, autoAssign: e.target.checked })}
                    className="h-4 w-4"
                    style={{ accentColor: P.olive }}
                  />
                  Auto-assign on EMS sync
                </label>
                <button
                  type="button"
                  onClick={() => void createEmsMapping()}
                  disabled={!emsForm.emsRoleName.trim() || !emsForm.appRoleId}
                  className="flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold text-white disabled:opacity-50"
                  style={{ background: P.olive }}
                >
                  <Plus size={14} /> Create mapping
                </button>

                <div className="border-t pt-3" style={{ borderColor: P.border }}>
                  <button
                    type="button"
                    onClick={() => void runSync()}
                    className="flex w-full items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-xs font-bold"
                    style={{ borderColor: P.border, color: P.textMid }}
                  >
                    <RefreshCw size={14} /> Trigger EMS sync
                  </button>
                  {emsSyncResult && (
                    <p className="mt-2 text-[11px]" style={{ color: P.textMuted }}>
                      Processed {emsSyncResult.processed} · assigned {emsSyncResult.assigned} ·
                      skipped {emsSyncResult.skipped}
                    </p>
                  )}
                </div>
              </div>
            </aside>

            <section className="rounded-2xl border bg-white p-4" style={{ borderColor: P.border }}>
              <div
                className="flex items-center justify-between border-b pb-3"
                style={{ borderColor: P.border }}
              >
                <div>
                  <h3 className="text-sm font-bold" style={{ color: P.text }}>
                    EMS Role Mappings
                  </h3>
                  <p className="text-xs" style={{ color: P.textMuted }}>
                    Connected EMS roles → LMS roles
                  </p>
                </div>
                {emsLoading && (
                  <LoaderCircle size={16} className="animate-spin" style={{ color: P.olive }} />
                )}
              </div>
              <div className="mt-3 space-y-2">
                {emsMappings.length === 0 && !emsLoading ? (
                  <div
                    className="flex flex-col items-center justify-center rounded-xl border py-10 text-center"
                    style={{ borderColor: P.border }}
                  >
                    <span
                      className="flex h-11 w-11 items-center justify-center rounded-xl"
                      style={{ background: P.lightSage }}
                    >
                      <Link2 size={20} style={{ color: P.olive }} />
                    </span>
                    <p className="mt-2 text-sm font-semibold" style={{ color: P.text }}>
                      No EMS mappings yet
                    </p>
                    <p className="text-xs" style={{ color: P.textMuted }}>
                      Map an EMS role to an LMS role to auto-assign on sync.
                    </p>
                  </div>
                ) : (
                  emsMappings.map((m) => (
                    <div
                      key={m.id}
                      className="flex items-center justify-between rounded-xl border px-4 py-3"
                      style={{ borderColor: P.border }}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className="flex h-9 w-9 items-center justify-center rounded-lg"
                          style={{ background: P.lightSage }}
                        >
                          <Link2 size={15} style={{ color: P.olive }} />
                        </span>
                        <div>
                          <p className="text-sm font-semibold" style={{ color: P.text }}>
                            {m.emsRoleName}
                          </p>
                          <p className="text-[11px]" style={{ color: P.textMuted }}>
                            → {m.appRole.name} · priority {m.priority}
                            {m.autoAssign ? " · auto-assign" : " · manual"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => void toggleEmsMapping(m)}
                          className="rounded-full px-3 py-1 text-[10px] font-bold transition hover:opacity-85"
                          style={
                            m.isActive
                              ? { background: P.lightSage, color: P.olive }
                              : { background: "#E5E7EB", color: P.textMuted }
                          }
                        >
                          {m.isActive ? "Active" : "Inactive"}
                        </button>
                        <button
                          type="button"
                          onClick={() => void deleteEmsMapping(m.id)}
                          className="rounded-lg p-2 text-red-500 transition hover:bg-red-50"
                          title="Delete mapping"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        )}

        {/* ─── USERS TAB ──────────────────────────────────────────────────── */}
        {tab === "users" && (
          <div className="rounded-2xl border bg-white p-5" style={{ borderColor: P.border }}>
            <div
              className="flex items-center justify-between border-b pb-4"
              style={{ borderColor: P.border }}
            >
              <div>
                <h3 className="text-sm font-bold" style={{ color: P.text }}>
                  User Role Assignments
                </h3>
                <p className="text-xs" style={{ color: P.textMuted }}>
                  Assign or revoke roles for individual users (manual assignments only)
                </p>
              </div>
              <div className="flex items-center gap-2 text-[11px]" style={{ color: P.textMuted }}>
                <ShieldCheck size={14} style={{ color: P.olive }} />
                Permissions are the union of all active roles
              </div>
            </div>

            <div
              className="my-4 rounded-xl border px-4 py-3 text-xs flex items-center gap-2"
              style={{ background: P.paleGreen, borderColor: P.sage, color: P.darkOlive }}
            >
              <ShieldCheck size={14} />
              Use the <strong>/api/users/:userId/roles</strong> API endpoints to manage individual
              assignments. Bulk assignment is available via <strong>/api/users/bulk-assign</strong>.
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <div
                className="rounded-xl border p-4"
                style={{ borderColor: P.border, background: "white" }}
              >
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-lg"
                  style={{ background: P.lightSage }}
                >
                  <Users size={16} style={{ color: P.olive }} />
                </span>
                <p
                  className="mt-2 text-[10px] font-bold uppercase tracking-wider"
                  style={{ color: P.textMuted }}
                >
                  Effective permissions
                </p>
                <p className="mt-1 text-xs font-semibold" style={{ color: P.text }}>
                  GET /users/:userId/permissions
                </p>
              </div>
              <div
                className="rounded-xl border p-4"
                style={{ borderColor: P.border, background: "white" }}
              >
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-lg"
                  style={{ background: P.lightSage }}
                >
                  <UserPlus size={16} style={{ color: P.olive }} />
                </span>
                <p
                  className="mt-2 text-[10px] font-bold uppercase tracking-wider"
                  style={{ color: P.textMuted }}
                >
                  All roles
                </p>
                <p className="mt-1 text-xs font-semibold" style={{ color: P.text }}>
                  GET /users/:userId/roles/all — primary + assigned
                </p>
              </div>
              <div
                className="rounded-xl border p-4"
                style={{ borderColor: P.border, background: "white" }}
              >
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-lg"
                  style={{ background: P.lightSage }}
                >
                  <Layers size={16} style={{ color: P.olive }} />
                </span>
                <p
                  className="mt-2 text-[10px] font-bold uppercase tracking-wider"
                  style={{ color: P.textMuted }}
                >
                  Accessible menu
                </p>
                <p className="mt-1 text-xs font-semibold" style={{ color: P.text }}>
                  GET /users/:userId/menu — built from permissions
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
