import React, { useEffect, useRef, useState } from "react";
import {
  Award,
  BookOpen,
  Bot,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  HelpCircle,
  MessageSquare,
  Pause,
  Play,
  Send,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { PBar } from "../../components/common";
import { P } from "../../constants/theme.constants";
import type { NavigateFn } from "../../models/app.model";
import type { EnrollmentProgressDetail } from "../../models/enrollment.model";
import { learnerEnrollmentApi } from "../../API/learnerEnrollment.api";
import { formatVideoDuration, parseVideoDuration } from "../../../utils/videoDuration";
export function PlayerScreen({
  navigate,
  enrollmentId,
  onProgressChanged,
}: {
  navigate: NavigateFn;
  enrollmentId: number | null;
  onProgressChanged: () => Promise<void>;
}) {
  const [tab, setTab] = useState<"chapters" | "notes" | "resources">("chapters");
  const [showAI, setShowAI] = useState(true);
  const [aiMsg, setAiMsg] = useState("");

  const [detail, setDetail] = useState<EnrollmentProgressDetail | null>(null);
  const [runtimeError, setRuntimeError] = useState<string | null>(null);
  const [activeContentId, setActiveContentId] = useState<number | null>(null);
  const sessionIdRef = useRef<number | null>(null);
  const [aiHistory, setAiHistory] = useState([
    {
      role: "ai",
      text: "Hi Alex! I'm your AI Learning Assistant. I can explain concepts, quiz you on what you've learned, or suggest related resources.",
    },
  ]);
  const runtimeContents =
    detail?.courseVersion.chapters.flatMap((chapter) =>
      chapter.contents.map((content) => ({ ...content, chapterTitle: chapter.title })),
    ) ?? [];
  const lessonProgress = detail?.progress?.lessonProgress ?? [];
  const resolvedActiveId =
    activeContentId ??
    runtimeContents.find(
      (content) =>
        lessonProgress.find((progress) => progress.contentId === content.id)?.status !==
        "COMPLETED",
    )?.id ??
    runtimeContents[0]?.id ??
    null;
  const chapters = runtimeContents.map((content, index) => {
    const progress = lessonProgress.find((item) => item.contentId === content.id);
    const durationSeconds = Math.max(60, (content.estimatedDurationMinutes ?? 1) * 60);
    return {
      id: content.id,
      title: `${index + 1}. ${content.title}`,
      duration: formatVideoDuration(durationSeconds),
      done: progress?.status === "COMPLETED",
      active: content.id === resolvedActiveId,
      progress,
      chapterTitle: content.chapterTitle,
    };
  });
  const activeChapter = chapters.find((chapter) => chapter.active) ??
    chapters[0] ?? {
      id: 0,
      title: "No published content",
      duration: "00:00",
      done: false,
      active: true,
      progress: undefined,
      chapterTitle: "Course",
    };
  const videoDurationSeconds = parseVideoDuration(activeChapter.duration);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [currentVideoSeconds, setCurrentVideoSeconds] = useState(0);
  const courseTitle = detail?.courseVersion.course.title ?? "Course";
  const courseProgress = Number(detail?.progress?.overallProgress ?? 0);
  const certificateReady = Boolean(detail?.completion);
  const videoProgress =
    videoDurationSeconds > 0
      ? Math.min((currentVideoSeconds / videoDurationSeconds) * 100, 100)
      : 0;
  const videoTimeLabel = `${formatVideoDuration(currentVideoSeconds)} / ${formatVideoDuration(
    videoDurationSeconds,
  )}`;
  const refreshDetail = async (signal?: AbortSignal) => {
    if (!enrollmentId) return;
    try {
      const next = await learnerEnrollmentApi.getProgress(enrollmentId, signal);
      setDetail(next);
      setRuntimeError(null);
    } catch (error) {
      if (!signal?.aborted) {
        setRuntimeError(error instanceof Error ? error.message : "Unable to load this enrollment.");
      }
    }
  };
  const saveProgress = async (status: "IN_PROGRESS" | "COMPLETED") => {
    if (!enrollmentId || !activeChapter.id) return;
    const watchPercentage =
      videoDurationSeconds === 0
        ? 0
        : Math.min(100, (currentVideoSeconds / videoDurationSeconds) * 100);
    await learnerEnrollmentApi.updateContentProgress(enrollmentId, activeChapter.id, {
      status,
      watchPercentage,
      lastPositionSeconds: currentVideoSeconds,
      timeSpentMinutes: Math.ceil(currentVideoSeconds / 60),
    });
    await refreshDetail();
    await onProgressChanged();
  };
  const toggleVideoPlayback = () => {
    if (isVideoPlaying) void saveProgress("IN_PROGRESS");
    setCurrentVideoSeconds((current) => (current >= videoDurationSeconds ? 0 : current));
    setIsVideoPlaying((playing) => !playing);
  };

  useEffect(() => {
    const controller = new AbortController();
    void refreshDetail(controller.signal);
    return () => controller.abort();
  }, [enrollmentId]);

  useEffect(() => {
    if (!enrollmentId) return;
    let disposed = false;
    const pending = learnerEnrollmentApi
      .startSession(enrollmentId, "web")
      .then((session) => {
        if (disposed) return learnerEnrollmentApi.endSession(session.id);
        sessionIdRef.current = session.id;
      })
      .catch((error) => {
        if (!disposed) {
          setRuntimeError(
            error instanceof Error ? error.message : "Unable to start learning session.",
          );
        }
      });
    return () => {
      disposed = true;
      const sessionId = sessionIdRef.current;
      sessionIdRef.current = null;
      if (sessionId) void learnerEnrollmentApi.endSession(sessionId);
      else void pending.catch(() => undefined);
    };
  }, [enrollmentId]);

  useEffect(() => {
    setCurrentVideoSeconds(activeChapter.progress?.lastPositionSeconds ?? 0);
    setIsVideoPlaying(false);
  }, [activeChapter.id]);

  useEffect(() => {
    if (!isVideoPlaying) return;

    const timer = window.setInterval(() => {
      setCurrentVideoSeconds((current) => Math.min(current + 1, videoDurationSeconds));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [isVideoPlaying, videoDurationSeconds]);

  useEffect(() => {
    if (videoDurationSeconds > 0 && currentVideoSeconds >= videoDurationSeconds) {
      setIsVideoPlaying(false);
      void saveProgress("COMPLETED").catch((error) => {
        setRuntimeError(error instanceof Error ? error.message : "Unable to save completion.");
      });
    }
  }, [currentVideoSeconds, videoDurationSeconds]);

  const sendAI = () => {
    if (!aiMsg.trim()) return;
    const msg = aiMsg;
    setAiMsg("");
    setAiHistory((p) => [
      ...p,
      { role: "user", text: msg },
      {
        role: "ai",
        text: "Great question! In this context, ML refers to algorithms that learn patterns from data without being explicitly programmed. The key distinction is that ML models improve with more data — making data strategy a core competitive advantage.",
      },
    ]);
  };

  return (
    <div
      className="flex h-full overflow-hidden gap-4 p-4"
      style={{ background: P.bg, minHeight: 0, boxSizing: "border-box" }}
    >
      {runtimeError && (
        <div className="fixed right-5 top-20 z-50 rounded-lg bg-red-50 px-4 py-2 text-xs text-red-700 shadow">
          {runtimeError}
        </div>
      )}

      <div
        className="w-[280px] flex-shrink-0 flex flex-col rounded-2xl border shadow-sm overflow-hidden"
        style={{ background: P.card, borderColor: P.border }}
      >
        <div className="p-4" style={{ borderBottom: `1px solid ${P.border}` }}>
          <button
            onClick={() =>
              navigate("course-detail", String(detail?.courseVersion.course.id ?? "1"))
            }
            className="flex items-center gap-1.5 text-xs mb-3"
            style={{ color: P.olive }}
          >
            <ChevronLeft size={14} /> Back to course
          </button>
          <p className="text-xs font-semibold" style={{ color: P.text }}>
            {courseTitle}
          </p>
          <p className="text-[10px] mt-0.5" style={{ color: P.textMuted }}>
            Dr. Sarah Chen · Module 1
          </p>
          <div className="mt-2">
            <PBar value={courseProgress} color={P.olive} height={3} />
          </div>
          <p className="text-[10px] mt-1" style={{ color: P.textMuted }}>
            {courseProgress}% complete
          </p>
        </div>
        <div className="flex" style={{ borderBottom: `1px solid ${P.border}` }}>
          {(["chapters", "notes", "resources"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="flex-1 py-2 text-[10px] font-semibold capitalize"
              style={
                tab === t
                  ? { color: P.olive, borderBottom: `2px solid ${P.olive}` }
                  : { color: P.textMuted }
              }
            >
              {t}
            </button>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto">
          {tab === "chapters" &&
            chapters.map((ch) => (
              <div
                key={ch.id}
                onClick={() => setActiveContentId(ch.id)}
                className="flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors"
                style={ch.active ? { background: P.lightSage } : {}}
                onMouseEnter={(e) => {
                  if (!ch.active) (e.currentTarget as HTMLDivElement).style.background = P.bg;
                }}
                onMouseLeave={(e) => {
                  if (!ch.active)
                    (e.currentTarget as HTMLDivElement).style.background = "transparent";
                }}
              >
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{
                    background: ch.done ? "#5A7A2A" : ch.active ? P.olive : P.lightSage,
                  }}
                >
                  {ch.done ? (
                    <CheckCircle size={11} className="text-white" />
                  ) : (
                    <Play
                      size={9}
                      className={ch.active ? "fill-white" : ""}
                      style={{ color: ch.active ? "white" : P.olive }}
                    />
                  )}
                </div>
                <div>
                  <p
                    className="text-xs leading-tight"
                    style={{
                      color: ch.active ? P.text : ch.done ? P.textMuted : P.textMid,
                      fontWeight: ch.active ? 600 : 400,
                      textDecoration: ch.done ? "line-through" : "none",
                    }}
                  >
                    {ch.title}
                  </p>
                  <p className="text-[10px] mt-0.5 font-mono" style={{ color: P.textMuted }}>
                    {ch.duration}
                  </p>
                </div>
              </div>
            ))}
          {tab === "notes" && (
            <div className="p-3">
              <textarea
                placeholder="Take notes…"
                className="w-full h-48 rounded-lg p-2.5 text-xs resize-none focus:outline-none"
                style={{
                  background: P.card,
                  border: `1px solid ${P.border}`,
                  color: P.text,
                }}
              />
              <button
                className="mt-2 w-full py-1.5 text-white text-xs rounded-lg"
                style={{ background: P.olive }}
                data-prototype-action="true"
              >
                Save Note
              </button>
            </div>
          )}
          {tab === "resources" && (
            <div className="p-3 space-y-1.5">
              {/* Videos */}
              <p
                className="text-[9px] font-bold uppercase tracking-widest px-1 pt-1 pb-0.5"
                style={{ color: P.textMuted }}
              >
                Video Resources
              </p>
              {[
                {
                  title: "Business Applications Overview",
                  duration: "24:15",
                  views: "12.4K views",
                  thumb: P.olive,
                },
                {
                  title: "AI Strategy in Practice",
                  duration: "18:33",
                  views: "8.7K views",
                  thumb: P.darkOlive,
                },
                {
                  title: "Case Study: Fortune 500 AI",
                  duration: "31:02",
                  views: "5.2K views",
                  thumb: "#4A7A5A",
                },
              ].map((v) => (
                <button
                  key={v.title}
                  className="w-full flex items-start gap-2.5 p-2 rounded-lg text-left transition-colors"
                  style={{ background: "transparent" }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLButtonElement).style.background = P.bg)
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLButtonElement).style.background = "transparent")
                  }
                  data-prototype-action="true"
                >
                  {/* Thumbnail */}
                  <div
                    className="w-[88px] h-[52px] rounded-md flex items-center justify-center flex-shrink-0 relative overflow-hidden"
                    style={{ background: `${v.thumb}66` }}
                  >
                    <div className="w-6 h-6 rounded-full bg-black/30 flex items-center justify-center">
                      <Play size={10} className="text-white fill-white ml-0.5" />
                    </div>
                    {/* Duration — bottom-right exactly like YouTube */}
                    <span
                      className="absolute bottom-1 right-1 text-[9px] font-bold text-white px-1 py-px rounded-sm"
                      style={{ background: "rgba(0,0,0,0.75)", letterSpacing: "0.02em" }}
                    >
                      {v.duration}
                    </span>
                  </div>
                  {/* Title + meta */}
                  <div className="flex-1 min-w-0 pt-0.5">
                    <p
                      className="text-[11px] font-semibold leading-snug line-clamp-2 mb-1"
                      style={{ color: P.text }}
                    >
                      {v.title}
                    </p>
                    {/* YouTube-style: views · duration on one line, muted */}
                    <p className="text-[9px]" style={{ color: P.textMuted }}>
                      {v.views} · {v.duration}
                    </p>
                  </div>
                </button>
              ))}

              {/* Documents */}
              <p
                className="text-[9px] font-bold uppercase tracking-widest px-1 pt-3 pb-0.5"
                style={{ color: P.textMuted }}
              >
                Documents
              </p>
              {[
                { title: "Course Slides (PDF)", pages: 42, readers: "3.1K", icon: "slides" },
                { title: "AI Strategy Template", pages: 18, readers: "1.8K", icon: "template" },
                { title: "Further Reading", pages: 64, readers: "920", icon: "reading" },
                { title: "Community Forum", pages: null, readers: "2.4K", icon: "forum" },
              ].map((d) => (
                <button
                  key={d.title}
                  className="w-full flex items-center gap-2.5 p-2.5 rounded-lg text-left transition-colors"
                  style={{ background: P.bg }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLButtonElement).style.background = P.paleGreen)
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLButtonElement).style.background = P.bg)
                  }
                  data-prototype-action="true"
                >
                  {/* Icon */}
                  <div
                    className="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0"
                    style={{
                      background: P.lightSage,
                      border: `1px solid ${P.border}`,
                    }}
                  >
                    {d.icon === "forum" ? (
                      <MessageSquare size={13} style={{ color: P.olive }} />
                    ) : (
                      <FileText size={13} style={{ color: P.olive }} />
                    )}
                  </div>
                  {/* Meta */}
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-[11px] font-medium leading-tight truncate"
                      style={{ color: P.text }}
                    >
                      {d.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {d.pages && (
                        <>
                          <span
                            className="flex items-center gap-1 text-[9px] font-mono"
                            style={{ color: P.textMuted }}
                          >
                            <BookOpen size={9} /> {d.pages} pages
                          </span>
                          <span className="text-[9px]" style={{ color: P.border }}>
                            ·
                          </span>
                        </>
                      )}
                      <span
                        className="flex items-center gap-1 text-[9px] font-mono"
                        style={{ color: P.textMuted }}
                      >
                        <Users size={9} /> {d.readers} readers
                      </span>
                    </div>
                  </div>
                  <Download size={11} className="flex-shrink-0" style={{ color: P.textMuted }} />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0 gap-4" style={{ background: P.bg }}>
        <div
          className="flex-1 rounded-2xl border shadow-sm bg-black flex items-center justify-center relative group overflow-hidden"
          style={{ borderColor: P.border }}
        >
          <div
            className="absolute inset-0"
            style={{ background: `linear-gradient(135deg, ${P.deepOlive}40, rgba(0,0,0,0.6))` }}
          />
          <div className="relative text-center">
            <button
              onClick={toggleVideoPlayback}
              className="w-20 h-20 rounded-full bg-white/20 backdrop-blur flex items-center justify-center mb-4 mx-auto cursor-pointer hover:bg-white/30 transition-colors"
              aria-label={isVideoPlaying ? "Pause video" : "Play video"}
            >
              {isVideoPlaying ? (
                <Pause size={32} className="text-white fill-white" />
              ) : (
                <Play size={32} className="text-white fill-white ml-1" />
              )}
            </button>
            <p
              className="text-white font-semibold text-lg mb-1"
              style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}
            >
              Business Applications Overview
            </p>
            <p className="text-sm" style={{ color: P.sage }}>
              Chapter 3
            </p>
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="h-1 rounded-full mb-2" style={{ background: "rgba(255,255,255,0.15)" }}>
              <div
                className="h-full rounded-full relative"
                style={{ width: `${videoProgress}%`, background: P.olive }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="text-white/80 hover:text-white" data-prototype-action="true">
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={toggleVideoPlayback}
                className="w-8 h-8 bg-white rounded-full flex items-center justify-center"
                aria-label={isVideoPlaying ? "Pause video" : "Play video"}
              >
                {isVideoPlaying ? (
                  <Pause size={14} className="fill-slate-800 text-slate-800" />
                ) : (
                  <Play size={14} className="fill-slate-800 text-slate-800 ml-0.5" />
                )}
              </button>
              <span className="min-w-[92px] text-[11px] font-medium tabular-nums text-white/85">
                {videoTimeLabel}
              </span>
              <button className="text-white/80 hover:text-white" data-prototype-action="true">
                <ChevronRight size={18} />
              </button>
              <div className="ml-auto">
                <MessageSquare
                  size={16}
                  onClick={() => setShowAI(!showAI)}
                  className="text-white/60 cursor-pointer hover:text-white"
                />
              </div>
            </div>
          </div>
        </div>
        <div
          className="px-5 py-4 rounded-2xl border shadow-sm flex items-center gap-4 flex-shrink-0"
          style={{ background: P.card, borderColor: P.border }}
        >
          <div className="flex-1">
            <p className="text-xs font-semibold" style={{ color: P.text }}>
              Business Applications Overview
            </p>
            <p className="text-[10px]" style={{ color: P.textMid }}>
              {activeChapter.chapterTitle} · {courseTitle}
            </p>
            <p className="text-[9px] mt-0.5" style={{ color: P.textMuted }}>
              12.4K views · 24:15
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("quiz")}
              className="px-3 py-1.5 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5"
              style={{ background: P.olive }}
            >
              <HelpCircle size={12} /> Take Quiz
            </button>
            <button
              onClick={() => {
                if (certificateReady) navigate("certificates");
                else navigate("quiz");
              }}
              className="px-3 py-1.5 text-xs rounded-lg flex items-center gap-1.5"
              style={{
                background: certificateReady ? P.olive : P.lightSage,
                color: certificateReady ? "white" : P.darkOlive,
              }}
            >
              {certificateReady ? <Award size={12} /> : <CheckCircle size={12} />}
              {certificateReady ? "View Certificate" : "Complete Requirements"}
            </button>
          </div>
        </div>
      </div>

      {showAI && (
        <div
          className="w-[300px] flex-shrink-0 flex flex-col rounded-2xl border shadow-sm overflow-hidden"
          style={{ background: P.card, borderColor: P.border }}
        >
          <div
            className="p-4 flex items-center justify-between"
            style={{ borderBottom: `1px solid ${P.border}` }}
          >
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-lg flex items-center justify-center"
                style={{ background: P.gold }}
              >
                <Sparkles size={12} className="text-white" />
              </div>
              <p className="text-xs font-semibold" style={{ color: P.text }}>
                AI Learning Assistant
              </p>
            </div>
            <button onClick={() => setShowAI(false)} style={{ color: P.textMuted }}>
              <X size={14} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {aiHistory.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
              >
                {msg.role === "ai" && (
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: P.gold }}
                  >
                    <Bot size={12} className="text-white" />
                  </div>
                )}
                <div
                  className="max-w-[210px] px-3 py-2 rounded-xl text-xs leading-relaxed"
                  style={
                    msg.role === "ai"
                      ? {
                          background: P.lightSage,
                          color: P.text,
                          borderRadius: "12px 12px 12px 4px",
                        }
                      : { background: P.olive, color: "white", borderRadius: "12px 12px 4px 12px" }
                  }
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>
          <div className="p-3" style={{ borderTop: `1px solid ${P.border}` }}>
            <div className="flex flex-wrap gap-1 mb-2">
              {["Explain this", "Quiz me", "Summarize"].map((s) => (
                <button
                  key={s}
                  onClick={() => setAiMsg(s)}
                  className="text-[10px] px-2 py-1 rounded-md"
                  style={{ background: P.lightSage, color: P.darkOlive }}
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={aiMsg}
                onChange={(e) => setAiMsg(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendAI()}
                placeholder="Ask anything…"
                className="flex-1 px-3 py-2 rounded-lg text-xs focus:outline-none"
                style={{
                  background: P.card,
                  border: `1px solid ${P.border}`,
                  color: P.text,
                }}
              />
              <button
                onClick={sendAI}
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: P.gold }}
              >
                <Send size={13} className="text-white" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── 6. QUIZ ──────────────────────────────────────────────────
