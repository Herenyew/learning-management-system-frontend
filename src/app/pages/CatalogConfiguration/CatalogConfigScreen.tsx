import React, { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  BookOpen,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Edit,
  Layers,
  Plus,
  RefreshCw,
  X,
  Zap,
} from "lucide-react";
import { COLOR_PRESETS } from "../../constants/catalogConfig.constants";
import { P } from "../../constants/theme.constants";
import type { CatItem, LevelItem } from "../../models/catalog.model";
import { ProgramTypesCrud } from "../../Extensions5";
function CatRow({
  cat,
  isNew,
  onSave,
  onDelete,
  onToggle,
}: {
  cat: CatItem;
  isNew?: boolean;
  onSave: (id: string, name: string, color: string) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(cat.name);
  const [color, setColor] = useState(cat.color);
  const [delConfirm, setDelConfirm] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync when cat prop changes (e.g. after external save)
  useEffect(() => {
    if (!editing) {
      setName(cat.name);
      setColor(cat.color);
    }
  }, [cat.name, cat.color, editing]);
  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const handleSave = () => {
    if (!name.trim()) return;
    onSave(cat.id, name.trim(), color);
    setEditing(false);
  };

  const handleCancel = () => {
    setName(cat.name);
    setColor(cat.color);
    setEditing(false);
  };

  if (editing) {
    return (
      <div
        className="px-5 py-4 transition-colors"
        style={{ background: `${P.lightSage}60`, borderLeft: `3px solid ${P.olive}` }}
      >
        <div className="flex flex-wrap items-center gap-3">
          <input
            ref={inputRef}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave();
              if (e.key === "Escape") handleCancel();
            }}
            className="flex-1 min-w-[160px] px-3 py-2 text-sm rounded-lg focus:outline-none focus:ring-2"
            style={{ border: `1px solid ${P.border}`, background: "white", color: P.text }}
          />
          <div className="flex gap-1.5 flex-wrap">
            {COLOR_PRESETS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className="w-6 h-6 rounded-full flex-shrink-0 transition-transform"
                style={{
                  background: c,
                  transform: color === c ? "scale(1.25)" : "scale(1)",
                  boxShadow: color === c ? `0 0 0 2px white, 0 0 0 4px ${c}` : "none",
                }}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="px-3 py-1.5 text-white text-xs font-semibold rounded-lg flex items-center gap-1"
              style={{ background: P.olive }}
            >
              <CheckCircle size={12} /> Save
            </button>
            <button
              onClick={handleCancel}
              className="px-3 py-1.5 text-xs rounded-lg"
              style={{ border: `1px solid ${P.border}`, color: P.textMid }}
            >
              Cancel
            </button>
          </div>
        </div>
        <p className="text-[10px] mt-2" style={{ color: P.textMuted }}>
          Press Enter to save · Esc to cancel
        </p>
      </div>
    );
  }

  return (
    <div
      className={`px-5 py-3.5 flex items-center gap-4 group transition-all duration-200 ${isNew ? "animate-[fadeInDown_0.3s_ease]" : ""}`}
      style={{ opacity: cat.active ? 1 : 0.45, background: "transparent" }}
      onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.background = P.bg)}
      onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.background = "transparent")}
    >
      {/* Color dot */}
      <div
        className="w-3 h-3 rounded-full flex-shrink-0 transition-transform group-hover:scale-125"
        style={{ background: cat.color }}
      />
      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold" style={{ color: P.text }}>
          {cat.name}
        </p>
        <p className="text-[10px]" style={{ color: P.textMuted }}>
          {cat.courseCount} course{cat.courseCount !== 1 ? "s" : ""} ·{" "}
          {cat.active ? "Visible in filter" : "Hidden from filter"}
        </p>
      </div>
      {/* Actions — visible on hover */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
        <button
          onClick={() => onToggle(cat.id)}
          className="px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors"
          style={{
            border: `1px solid ${P.border}`,
            color: cat.active ? P.textMuted : P.olive,
            background: "transparent",
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.background = P.lightSage)
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.background = "transparent")
          }
        >
          {cat.active ? "Hide" : "Show"}
        </button>
        <button
          onClick={() => setEditing(true)}
          className="p-1.5 rounded-lg transition-colors"
          title="Edit"
          style={{ color: P.olive }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.background = P.lightSage)
          }
          onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "")}
        >
          <Edit size={14} />
        </button>
        {delConfirm ? (
          <div className="flex items-center gap-1.5 pl-1">
            <span className="text-[11px] font-medium" style={{ color: "#C0392B" }}>
              Delete?
            </span>
            <button
              onClick={() => onDelete(cat.id)}
              className="px-2 py-1 rounded text-[11px] font-semibold text-white"
              style={{ background: "#C0392B" }}
            >
              Yes
            </button>
            <button
              onClick={() => setDelConfirm(false)}
              className="px-2 py-1 rounded text-[11px]"
              style={{ border: `1px solid ${P.border}`, color: P.textMid }}
            >
              No
            </button>
          </div>
        ) : (
          <button
            onClick={() => setDelConfirm(true)}
            className="p-1.5 rounded-lg transition-colors"
            title="Delete"
            style={{ color: "#C0392B" }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.background = "#FEF2F2")
            }
            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "")}
          >
            <X size={14} />
          </button>
        )}
      </div>
      {/* Preview chip */}
      <span
        className="text-[11px] font-medium px-2.5 py-0.5 rounded-full border flex-shrink-0 transition-all"
        style={{ background: `${cat.color}14`, color: cat.color, borderColor: `${cat.color}30` }}
      >
        {cat.name}
      </span>
    </div>
  );
}

// ── Inline-edit row for a single level ─────────────────────────
function LevelRow({
  lv,
  isNew,
  isFirst,
  isLast,
  onSave,
  onDelete,
  onToggle,
  onMoveUp,
  onMoveDown,
}: {
  lv: LevelItem;
  isNew?: boolean;
  isFirst: boolean;
  isLast: boolean;
  onSave: (id: string, name: string, color: string, xp: number) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(lv.name);
  const [color, setColor] = useState(lv.color);
  const [xp, setXp] = useState(String(lv.xpThreshold));
  const [xpErr, setXpErr] = useState(false);
  const [delConfirm, setDelConfirm] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!editing) {
      setName(lv.name);
      setColor(lv.color);
      setXp(String(lv.xpThreshold));
    }
  }, [lv, editing]);
  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const handleSave = () => {
    if (!name.trim()) return;
    const xpNum = parseInt(xp, 10);
    if (isNaN(xpNum) || xpNum < 0) {
      setXpErr(true);
      return;
    }
    onSave(lv.id, name.trim(), color, xpNum);
    setEditing(false);
    setXpErr(false);
  };

  const handleCancel = () => {
    setName(lv.name);
    setColor(lv.color);
    setXp(String(lv.xpThreshold));
    setEditing(false);
    setXpErr(false);
  };

  if (editing) {
    return (
      <div
        className="px-5 py-4 transition-colors"
        style={{ background: `${P.lightSage}60`, borderLeft: `3px solid ${P.olive}` }}
      >
        <div className="flex flex-wrap items-start gap-3">
          <div className="flex-1 min-w-[140px]">
            <label
              className="block text-[10px] font-semibold uppercase tracking-wide mb-1"
              style={{ color: P.textMuted }}
            >
              Level Name
            </label>
            <input
              ref={inputRef}
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave();
                if (e.key === "Escape") handleCancel();
              }}
              className="w-full px-3 py-2 text-sm rounded-lg focus:outline-none focus:ring-2"
              style={{ border: `1px solid ${P.border}`, background: "white", color: P.text }}
            />
          </div>
          <div className="min-w-[110px]">
            <label
              className="block text-[10px] font-semibold uppercase tracking-wide mb-1"
              style={{ color: P.textMuted }}
            >
              Min XP
            </label>
            <input
              value={xp}
              onChange={(e) => {
                setXp(e.target.value);
                setXpErr(false);
              }}
              type="number"
              min="0"
              placeholder="0"
              className="w-full px-3 py-2 text-sm rounded-lg focus:outline-none focus:ring-2"
              style={{
                border: `1px solid ${xpErr ? "#C0392B" : P.border}`,
                background: "white",
                color: P.text,
              }}
            />
            {xpErr && (
              <p className="text-[10px] mt-0.5" style={{ color: "#C0392B" }}>
                Must be ≥ 0
              </p>
            )}
          </div>
          <div>
            <label
              className="block text-[10px] font-semibold uppercase tracking-wide mb-1"
              style={{ color: P.textMuted }}
            >
              Color
            </label>
            <div className="flex gap-1.5 flex-wrap">
              {COLOR_PRESETS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className="w-6 h-6 rounded-full flex-shrink-0 transition-transform"
                  style={{
                    background: c,
                    transform: color === c ? "scale(1.25)" : "scale(1)",
                    boxShadow: color === c ? `0 0 0 2px white, 0 0 0 4px ${c}` : "none",
                  }}
                />
              ))}
            </div>
          </div>
          <div className="flex items-end gap-2 pb-0.5">
            <button
              onClick={handleSave}
              className="px-3 py-2 text-white text-xs font-semibold rounded-lg flex items-center gap-1"
              style={{ background: P.olive }}
            >
              <CheckCircle size={12} /> Save
            </button>
            <button
              onClick={handleCancel}
              className="px-3 py-2 text-xs rounded-lg"
              style={{ border: `1px solid ${P.border}`, color: P.textMid }}
            >
              Cancel
            </button>
          </div>
        </div>
        <p className="text-[10px] mt-2" style={{ color: P.textMuted }}>
          Press Enter to save · Esc to cancel
        </p>
      </div>
    );
  }

  return (
    <div
      className={`px-5 py-3.5 flex items-center gap-3 group transition-all duration-200 ${isNew ? "animate-[fadeInDown_0.3s_ease]" : ""}`}
      style={{ opacity: lv.active ? 1 : 0.45, background: "transparent" }}
      onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.background = P.bg)}
      onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.background = "transparent")}
    >
      {/* Reorder arrows */}
      <div className="flex flex-col gap-0.5 flex-shrink-0">
        <button
          onClick={() => onMoveUp(lv.id)}
          disabled={isFirst}
          className="p-0.5 rounded disabled:opacity-20 transition-colors"
          style={{ color: P.textMuted }}
          onMouseEnter={(e) => {
            if (!isFirst) (e.currentTarget as HTMLButtonElement).style.color = P.olive;
          }}
          onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = P.textMuted)}
        >
          <ChevronUp size={13} />
        </button>
        <button
          onClick={() => onMoveDown(lv.id)}
          disabled={isLast}
          className="p-0.5 rounded disabled:opacity-20 transition-colors"
          style={{ color: P.textMuted }}
          onMouseEnter={(e) => {
            if (!isLast) (e.currentTarget as HTMLButtonElement).style.color = P.olive;
          }}
          onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = P.textMuted)}
        >
          <ChevronDown size={13} />
        </button>
      </div>
      {/* Order badge */}
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0"
        style={{ background: lv.color }}
      >
        {lv.order}
      </div>
      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold" style={{ color: P.text }}>
          {lv.name}
        </p>
        <p className="text-[10px]" style={{ color: P.textMuted }}>
          Order #{lv.order} · Min XP: {lv.xpThreshold.toLocaleString()} ·{" "}
          {lv.active ? "Visible" : "Hidden"}
        </p>
      </div>
      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
        <button
          onClick={() => onToggle(lv.id)}
          className="px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors"
          style={{ border: `1px solid ${P.border}`, color: lv.active ? P.textMuted : P.olive }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.background = P.lightSage)
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.background = "transparent")
          }
        >
          {lv.active ? "Hide" : "Show"}
        </button>
        <button
          onClick={() => setEditing(true)}
          className="p-1.5 rounded-lg transition-colors"
          title="Edit"
          style={{ color: P.olive }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.background = P.lightSage)
          }
          onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "")}
        >
          <Edit size={14} />
        </button>
        {delConfirm ? (
          <div className="flex items-center gap-1.5 pl-1">
            <span className="text-[11px] font-medium" style={{ color: "#C0392B" }}>
              Delete?
            </span>
            <button
              onClick={() => onDelete(lv.id)}
              className="px-2 py-1 rounded text-[11px] font-semibold text-white"
              style={{ background: "#C0392B" }}
            >
              Yes
            </button>
            <button
              onClick={() => setDelConfirm(false)}
              className="px-2 py-1 rounded text-[11px]"
              style={{ border: `1px solid ${P.border}`, color: P.textMid }}
            >
              No
            </button>
          </div>
        ) : (
          <button
            onClick={() => setDelConfirm(true)}
            className="p-1.5 rounded-lg transition-colors"
            title="Delete"
            style={{ color: "#C0392B" }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.background = "#FEF2F2")
            }
            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "")}
          >
            <X size={14} />
          </button>
        )}
      </div>
      {/* Preview chip */}
      <span
        className="text-[11px] font-medium px-2.5 py-0.5 rounded-full border flex-shrink-0"
        style={{ background: `${lv.color}14`, color: lv.color, borderColor: `${lv.color}30` }}
      >
        {lv.name}
      </span>
    </div>
  );
}

export function CatalogConfigScreen({
  cats,
  setCats,
  levels,
  setLevels,
}: {
  cats: CatItem[];
  setCats: React.Dispatch<React.SetStateAction<CatItem[]>>;
  levels: LevelItem[];
  setLevels: React.Dispatch<React.SetStateAction<LevelItem[]>>;
}) {
  const [tab, setTab] = useState<"categories" | "levels" | "programTypes">("categories");

  // ── Category form ──
  const [catName, setCatName] = useState("");
  const [catColor, setCatColor] = useState(P.olive);
  const [catAdding, setCatAdding] = useState(false);
  const [catNameErr, setCatNameErr] = useState("");
  const [newCatId, setNewCatId] = useState<string | null>(null);
  const [catSuccess, setCatSuccess] = useState(false);
  const catInputRef = useRef<HTMLInputElement>(null);

  // ── Level form ──
  const [lvName, setLvName] = useState("");
  const [lvColor, setLvColor] = useState(P.gold);
  const [lvXp, setLvXp] = useState("0");
  const [lvAdding, setLvAdding] = useState(false);
  const [lvNameErr, setLvNameErr] = useState("");
  const [lvXpErr, setLvXpErr] = useState("");
  const [newLvId, setNewLvId] = useState<string | null>(null);
  const [lvSuccess, setLvSuccess] = useState(false);
  const lvInputRef = useRef<HTMLInputElement>(null);

  // ── Category handlers ──
  const addCat = () => {
    if (!catName.trim()) {
      setCatNameErr("Category name is required.");
      catInputRef.current?.focus();
      const el = catInputRef.current;
      if (el) {
        el.classList.remove("input-shake");
        void el.offsetWidth;
        el.classList.add("input-shake");
      }
      return;
    }
    if (cats.some((c) => c.name.toLowerCase() === catName.trim().toLowerCase())) {
      setCatNameErr("A category with this name already exists.");
      catInputRef.current?.focus();
      return;
    }
    setCatNameErr("");
    setCatAdding(true);
    setTimeout(() => {
      const id = `cat${Date.now()}`;
      setCats((p) => [
        ...p,
        { id, name: catName.trim(), color: catColor, courseCount: 0, active: true },
      ]);
      setNewCatId(id);
      setCatName("");
      setCatColor(P.olive);
      setCatAdding(false);
      setCatSuccess(true);
      catInputRef.current?.focus();
      setTimeout(() => {
        setNewCatId(null);
        setCatSuccess(false);
      }, 2500);
    }, 350);
  };

  const saveCat = (id: string, name: string, color: string) => {
    setCats((p) => p.map((c) => (c.id === id ? { ...c, name, color } : c)));
  };

  const deleteCat = (id: string) => {
    setCats((p) => p.filter((c) => c.id !== id));
  };

  const toggleCat = (id: string) => {
    setCats((p) => p.map((c) => (c.id === id ? { ...c, active: !c.active } : c)));
  };

  // ── Level handlers ──
  const addLevel = () => {
    let hasErr = false;
    if (!lvName.trim()) {
      setLvNameErr("Level name is required.");
      lvInputRef.current?.focus();
      const el = lvInputRef.current;
      if (el) {
        el.classList.remove("input-shake");
        void el.offsetWidth;
        el.classList.add("input-shake");
      }
      hasErr = true;
    } else if (levels.some((l) => l.name.toLowerCase() === lvName.trim().toLowerCase())) {
      setLvNameErr("A level with this name already exists.");
      lvInputRef.current?.focus();
      hasErr = true;
    } else {
      setLvNameErr("");
    }
    const xpNum = parseInt(lvXp, 10);
    if (isNaN(xpNum) || xpNum < 0) {
      setLvXpErr("Must be a number ≥ 0.");
      hasErr = true;
    } else {
      setLvXpErr("");
    }
    if (hasErr) return;

    setLvAdding(true);
    setTimeout(() => {
      const id = `lv${Date.now()}`;
      const maxOrder = Math.max(0, ...levels.map((l) => l.order));
      setLevels((p) => [
        ...p,
        {
          id,
          name: lvName.trim(),
          color: lvColor,
          order: maxOrder + 1,
          active: true,
          xpThreshold: xpNum,
        },
      ]);
      setNewLvId(id);
      setLvName("");
      setLvColor(P.gold);
      setLvXp("0");
      setLvAdding(false);
      setLvSuccess(true);
      lvInputRef.current?.focus();
      setTimeout(() => {
        setNewLvId(null);
        setLvSuccess(false);
      }, 2500);
    }, 350);
  };

  const saveLevel = (id: string, name: string, color: string, xp: number) => {
    setLevels((p) => p.map((l) => (l.id === id ? { ...l, name, color, xpThreshold: xp } : l)));
  };

  const deleteLevel = (id: string) => {
    setLevels((p) => {
      const removed = p.find((l) => l.id === id);
      const rest = p.filter((l) => l.id !== id);
      if (!removed) return p;
      return rest.map((l) => (l.order > removed.order ? { ...l, order: l.order - 1 } : l));
    });
  };

  const toggleLevel = (id: string) => {
    setLevels((p) => p.map((l) => (l.id === id ? { ...l, active: !l.active } : l)));
  };

  const moveLevel = (id: string, dir: -1 | 1) => {
    setLevels((p) => {
      const sorted = [...p].sort((a, b) => a.order - b.order);
      const idx = sorted.findIndex((l) => l.id === id);
      const swapIdx = idx + dir;
      if (swapIdx < 0 || swapIdx >= sorted.length) return p;
      const [a, b] = [sorted[idx].order, sorted[swapIdx].order];
      return p.map((l) =>
        l.id === id ? { ...l, order: b } : l.id === sorted[swapIdx].id ? { ...l, order: a } : l,
      );
    });
  };

  const sortedLevels = [...levels].sort((a, b) => a.order - b.order);
  const activeCats = cats.filter((c) => c.active).length;
  const hiddenCats = cats.filter((c) => !c.active).length;
  const activeLevels = levels.filter((l) => l.active).length;

  return (
    <div className="p-6 space-y-6 max-w-[1200px]">
      {/* Header */}
      <div>
        <h1
          className="text-xl font-bold mb-1"
          style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", color: P.text }}
        >
          Catalog Configuration
        </h1>
        <p className="text-sm" style={{ color: P.textMuted }}>
          Manage categories, learning levels, and program types shown across the catalog
        </p>
      </div>

      {/* Tabs */}
      <div
        className="flex flex-wrap gap-1 p-1 rounded-xl w-fit"
        style={{ background: P.lightSage }}
      >
        {(["categories", "levels", "programTypes"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="px-5 py-2 rounded-lg text-sm font-semibold transition-all"
            style={
              tab === t
                ? { background: "white", color: P.text, boxShadow: "0 1px 4px rgba(0,0,0,0.10)" }
                : { color: P.textMuted }
            }
          >
            {t === "categories"
              ? `Categories (${cats.length})`
              : t === "levels"
                ? `Learning Levels (${levels.length})`
                : "Program Types"}
          </button>
        ))}
      </div>

      {/* ══ CATEGORIES ══ */}
      {tab === "programTypes" && <ProgramTypesCrud />}

      {tab === "categories" && (
        <div className="space-y-4">
          {/* Add form */}
          <div
            className="bg-white rounded-2xl border p-5 space-y-4"
            style={{ borderColor: P.border }}
          >
            <p className="text-sm font-semibold flex items-center gap-2" style={{ color: P.text }}>
              <Plus size={14} style={{ color: P.olive }} /> Add New Category
            </p>
            <div className="flex flex-wrap items-end gap-3">
              <div className="flex-1 min-w-[180px]">
                <label className="block text-xs font-medium mb-1.5" style={{ color: P.textMid }}>
                  Category Name <span style={{ color: "#C0392B" }}>*</span>
                </label>
                <input
                  ref={catInputRef}
                  value={catName}
                  onChange={(e) => {
                    setCatName(e.target.value);
                    setCatNameErr("");
                  }}
                  onKeyDown={(e) => e.key === "Enter" && addCat()}
                  placeholder="e.g. Product Management"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl focus:outline-none focus:ring-2 bg-white"
                  style={{
                    border: `1px solid ${catNameErr ? "#C0392B" : P.border}`,
                    color: P.text,
                  }}
                />
                {catNameErr && (
                  <p
                    className="text-[11px] mt-1 flex items-center gap-1"
                    style={{ color: "#C0392B" }}
                  >
                    <AlertCircle size={10} /> {catNameErr}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: P.textMid }}>
                  Color
                </label>
                <div className="flex gap-1.5 flex-wrap">
                  {COLOR_PRESETS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setCatColor(c)}
                      className="w-7 h-7 rounded-full transition-all"
                      style={{
                        background: c,
                        transform: catColor === c ? "scale(1.2)" : "scale(1)",
                        boxShadow: catColor === c ? `0 0 0 2px white, 0 0 0 4px ${c}` : "none",
                      }}
                    />
                  ))}
                </div>
              </div>
              <button
                onClick={addCat}
                disabled={catAdding}
                className="px-5 py-2.5 text-white text-sm font-semibold rounded-xl flex items-center gap-2 flex-shrink-0 transition-all"
                style={{
                  background: catAdding ? P.sage : P.olive,
                  opacity: catAdding ? 0.8 : 1,
                  transform: catAdding ? "scale(0.97)" : "scale(1)",
                }}
              >
                {catAdding ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" /> Adding…
                  </>
                ) : (
                  <>
                    <Plus size={14} /> Add Category
                  </>
                )}
              </button>
            </div>
            {/* Preview of color + name */}
            {catName.trim() && (
              <div className="flex items-center gap-2 pt-1">
                <span className="text-[10px] font-medium" style={{ color: P.textMuted }}>
                  Preview:
                </span>
                <span
                  className="text-[11px] font-medium px-2.5 py-0.5 rounded-full border"
                  style={{
                    background: `${catColor}14`,
                    color: catColor,
                    borderColor: `${catColor}30`,
                  }}
                >
                  {catName.trim()}
                </span>
              </div>
            )}
          </div>

          {/* Success toast */}
          {catSuccess && (
            <div
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium animate-[fadeInDown_0.3s_ease]"
              style={{ background: "#ECFDF5", border: "1px solid #A7F3D0", color: "#065F46" }}
            >
              <CheckCircle size={15} /> Category added successfully!
            </div>
          )}

          {/* List */}
          <div
            className="bg-white rounded-2xl border overflow-hidden"
            style={{ borderColor: P.border }}
          >
            <div
              className="px-5 py-3 flex items-center justify-between"
              style={{ borderBottom: `1px solid ${P.border}`, background: P.bg }}
            >
              <p
                className="text-xs font-semibold uppercase tracking-widest"
                style={{ color: P.textMuted }}
              >
                All Categories
              </p>
              <div className="flex items-center gap-3">
                {activeCats > 0 && (
                  <span
                    className="text-xs font-medium px-2 py-0.5 rounded-full"
                    style={{ background: `${P.olive}18`, color: P.olive }}
                  >
                    {activeCats} active
                  </span>
                )}
                {hiddenCats > 0 && (
                  <span
                    className="text-xs font-medium px-2 py-0.5 rounded-full"
                    style={{
                      background: P.bg,
                      color: P.textMuted,
                      border: `1px solid ${P.border}`,
                    }}
                  >
                    {hiddenCats} hidden
                  </span>
                )}
              </div>
            </div>
            <div className="divide-y" style={{ borderColor: P.border }}>
              {cats.length === 0 ? (
                <div className="py-16 text-center">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
                    style={{ background: P.lightSage }}
                  >
                    <BookOpen size={24} style={{ color: P.sage }} />
                  </div>
                  <p className="text-sm font-semibold mb-1" style={{ color: P.text }}>
                    No categories yet
                  </p>
                  <p className="text-xs" style={{ color: P.textMuted }}>
                    Add your first category using the form above.
                  </p>
                </div>
              ) : (
                cats.map((cat) => (
                  <CatRow
                    key={cat.id}
                    cat={cat}
                    isNew={cat.id === newCatId}
                    onSave={saveCat}
                    onDelete={deleteCat}
                    onToggle={toggleCat}
                  />
                ))
              )}
            </div>
          </div>

          {/* Hint */}
          <p className="text-[11px] flex items-center gap-1.5" style={{ color: P.textMuted }}>
            <AlertCircle size={11} /> Hover over any row to reveal Edit, Hide/Show, and Delete
            actions.
          </p>
        </div>
      )}

      {/* ══ LEVELS ══ */}
      {tab === "levels" && (
        <div className="space-y-4">
          {/* Add form */}
          <div
            className="bg-white rounded-2xl border p-5 space-y-4"
            style={{ borderColor: P.border }}
          >
            <p className="text-sm font-semibold flex items-center gap-2" style={{ color: P.text }}>
              <Plus size={14} style={{ color: P.olive }} /> Add New Level
            </p>
            <div className="flex flex-wrap items-end gap-3">
              <div className="flex-1 min-w-[150px]">
                <label className="block text-xs font-medium mb-1.5" style={{ color: P.textMid }}>
                  Level Name <span style={{ color: "#C0392B" }}>*</span>
                </label>
                <input
                  ref={lvInputRef}
                  value={lvName}
                  onChange={(e) => {
                    setLvName(e.target.value);
                    setLvNameErr("");
                  }}
                  onKeyDown={(e) => e.key === "Enter" && addLevel()}
                  placeholder="e.g. Expert"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl focus:outline-none focus:ring-2 bg-white"
                  style={{ border: `1px solid ${lvNameErr ? "#C0392B" : P.border}`, color: P.text }}
                />
                {lvNameErr && (
                  <p
                    className="text-[11px] mt-1 flex items-center gap-1"
                    style={{ color: "#C0392B" }}
                  >
                    <AlertCircle size={10} /> {lvNameErr}
                  </p>
                )}
              </div>
              <div className="min-w-[110px]">
                <label className="block text-xs font-medium mb-1.5" style={{ color: P.textMid }}>
                  Min XP Threshold
                </label>
                <input
                  value={lvXp}
                  onChange={(e) => {
                    setLvXp(e.target.value);
                    setLvXpErr("");
                  }}
                  type="number"
                  min="0"
                  placeholder="0"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl focus:outline-none focus:ring-2 bg-white"
                  style={{ border: `1px solid ${lvXpErr ? "#C0392B" : P.border}`, color: P.text }}
                />
                {lvXpErr && (
                  <p
                    className="text-[11px] mt-1 flex items-center gap-1"
                    style={{ color: "#C0392B" }}
                  >
                    <AlertCircle size={10} /> {lvXpErr}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: P.textMid }}>
                  Badge Color
                </label>
                <div className="flex gap-1.5 flex-wrap">
                  {COLOR_PRESETS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setLvColor(c)}
                      className="w-7 h-7 rounded-full transition-all"
                      style={{
                        background: c,
                        transform: lvColor === c ? "scale(1.2)" : "scale(1)",
                        boxShadow: lvColor === c ? `0 0 0 2px white, 0 0 0 4px ${c}` : "none",
                      }}
                    />
                  ))}
                </div>
              </div>
              <button
                onClick={addLevel}
                disabled={lvAdding}
                className="px-5 py-2.5 text-white text-sm font-semibold rounded-xl flex items-center gap-2 flex-shrink-0 transition-all"
                style={{
                  background: lvAdding ? P.sage : P.olive,
                  opacity: lvAdding ? 0.8 : 1,
                  transform: lvAdding ? "scale(0.97)" : "scale(1)",
                }}
              >
                {lvAdding ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" /> Adding…
                  </>
                ) : (
                  <>
                    <Plus size={14} /> Add Level
                  </>
                )}
              </button>
            </div>
            {/* Preview */}
            {lvName.trim() && (
              <div className="flex items-center gap-2 pt-1">
                <span className="text-[10px] font-medium" style={{ color: P.textMuted }}>
                  Preview:
                </span>
                <span
                  className="text-[11px] font-medium px-2.5 py-0.5 rounded-full border"
                  style={{
                    background: `${lvColor}14`,
                    color: lvColor,
                    borderColor: `${lvColor}30`,
                  }}
                >
                  {lvName.trim()}
                </span>
                {lvXp && !isNaN(parseInt(lvXp)) && (
                  <span className="text-[10px]" style={{ color: P.textMuted }}>
                    · unlocked at {parseInt(lvXp).toLocaleString()} XP
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Success toast */}
          {lvSuccess && (
            <div
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium animate-[fadeInDown_0.3s_ease]"
              style={{ background: "#ECFDF5", border: "1px solid #A7F3D0", color: "#065F46" }}
            >
              <CheckCircle size={15} /> Level added successfully!
            </div>
          )}

          {/* List */}
          <div
            className="bg-white rounded-2xl border overflow-hidden"
            style={{ borderColor: P.border }}
          >
            <div
              className="px-5 py-3 flex items-center justify-between"
              style={{ borderBottom: `1px solid ${P.border}`, background: P.bg }}
            >
              <p
                className="text-xs font-semibold uppercase tracking-widest"
                style={{ color: P.textMuted }}
              >
                All Levels — use arrows to reorder
              </p>
              <span
                className="text-xs font-medium px-2 py-0.5 rounded-full"
                style={{ background: `${P.olive}18`, color: P.olive }}
              >
                {activeLevels} active
              </span>
            </div>
            <div className="divide-y" style={{ borderColor: P.border }}>
              {levels.length === 0 ? (
                <div className="py-16 text-center">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
                    style={{ background: P.lightSage }}
                  >
                    <Layers size={24} style={{ color: P.sage }} />
                  </div>
                  <p className="text-sm font-semibold mb-1" style={{ color: P.text }}>
                    No levels yet
                  </p>
                  <p className="text-xs" style={{ color: P.textMuted }}>
                    Add your first level using the form above.
                  </p>
                </div>
              ) : (
                sortedLevels.map((lv) => (
                  <LevelRow
                    key={lv.id}
                    lv={lv}
                    isNew={lv.id === newLvId}
                    isFirst={lv.order === sortedLevels[0].order}
                    isLast={lv.order === sortedLevels[sortedLevels.length - 1].order}
                    onSave={saveLevel}
                    onDelete={deleteLevel}
                    onToggle={toggleLevel}
                    onMoveUp={(id) => moveLevel(id, -1)}
                    onMoveDown={(id) => moveLevel(id, 1)}
                  />
                ))
              )}
            </div>
          </div>

          {/* XP legend */}
          {levels.length > 0 && (
            <div
              className="rounded-xl p-4"
              style={{ background: P.goldLight, border: `1px solid ${P.gold}40` }}
            >
              <p
                className="text-xs font-semibold mb-2 flex items-center gap-1.5"
                style={{ color: "#8A6A1A" }}
              >
                <Zap size={12} /> XP Level Ladder
              </p>
              <div className="flex flex-wrap gap-2">
                {sortedLevels
                  .filter((l) => l.active)
                  .map((lv, i, arr) => (
                    <div key={lv.id} className="flex items-center gap-1.5 text-[11px]">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: lv.color }} />
                      <span style={{ color: "#7A5A10" }}>
                        <strong>{lv.name}</strong> ≥ {lv.xpThreshold.toLocaleString()} XP
                        {i < arr.length - 1 && <span style={{ color: "#C8A85D" }}> → </span>}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          <p className="text-[11px] flex items-center gap-1.5" style={{ color: P.textMuted }}>
            <AlertCircle size={11} /> Hover over any row to reveal Edit, Hide/Show, and Delete
            actions.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────
