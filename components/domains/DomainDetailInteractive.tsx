"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { formatDuration, predictMilestone, calcWeeklyGoal } from "@/lib/utils";
import { pick3Milestones } from "@/lib/milestones";
import DomainTargetForm from "./DomainTargetForm";
import { invalidateDomainDetail } from "./domain-detail-cache";

type Session = {
  id: string;
  startTime: Date | string;
  durationMinutes: number | null;
  note: string | null;
};

type Props = {
  domainId: string;
  domainColor: string;
  targetHours: number;
  targetDate: Date | null;
  initialTotalMinutes: number;
  weeklyAvgMinutes: number;
  initialSessions: Session[];
};

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}

function fmtDate(date: Date | null) {
  if (!date) return "数据不足";
  return new Date(date).toLocaleDateString("zh-CN", { year: "numeric", month: "long" });
}

const cardStyle = {
  background: "#fffdf8",
  border: "1px solid rgba(110,92,70,0.12)",
  borderRadius: "18px",
  boxShadow: "0 14px 35px rgba(115,94,64,0.08)",
} as const;

export default function DomainDetailInteractive({
  domainId, domainColor, targetHours, targetDate,
  initialTotalMinutes, weeklyAvgMinutes, initialSessions,
}: Props) {
  const router = useRouter();
  const [totalMinutes, setTotalMinutes] = useState(initialTotalMinutes);
  const [sessions, setSessions] = useState<Session[]>(initialSessions);
  const [isRefreshing, startRefresh] = useTransition();

  // Derived state — recomputed instantly on every change
  const totalHours = totalMinutes / 60;
  const { completed, key: keyMilestones } = pick3Milestones(totalHours, targetHours);
  const weeklyGoal = calcWeeklyGoal(totalMinutes, targetDate, 10, targetHours);

  // ── AddHistory: optimistic add ──────────────────────────────────────────
  const [addOpen, setAddOpen] = useState(false);
  const [addHours, setAddHours] = useState("");
  const [addDate, setAddDate] = useState(new Date().toISOString().split("T")[0]);
  const [addNote, setAddNote] = useState("");
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState("");

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const h = parseFloat(addHours);
    if (!Number.isFinite(h) || h <= 0 || h > 10000) { setAddError("请输入有效小时数"); return; }
    const saved = { hours: addHours, date: addDate, note: addNote };
    setAddLoading(true);
    setAddError("");

    const minutes = h * 60;
    const fakeId = `opt-${Date.now()}`;
    const fakeSession: Session = {
      id: fakeId,
      startTime: new Date(addDate),
      durationMinutes: minutes,
      note: addNote || "手动添加",
    };

    // Optimistic update — instant
    setTotalMinutes(prev => prev + minutes);
    setSessions(prev => [fakeSession, ...prev].slice(0, 50));
    setAddOpen(false);
    setAddHours("");
    setAddNote("");

    try {
      const res = await fetch("/api/sessions/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domainId, hours: h, date: addDate, note: addNote }),
      });
      if (!res.ok) {
        // Rollback
        setTotalMinutes(prev => Math.max(0, prev - minutes));
        setSessions(prev => prev.filter(s => s.id !== fakeId));
        const data = await res.json().catch(() => ({}));
        setAddError(data.error ?? "添加失败");
        setAddHours(saved.hours);
        setAddDate(saved.date);
        setAddNote(saved.note);
        setAddOpen(true);
      } else {
        // Replace fake session with real one from server
        const real = await res.json();
        setSessions(prev => prev.map(s => s.id === fakeId ? real : s));
        invalidateDomainDetail(domainId);
        startRefresh(() => router.refresh());
      }
    } catch {
      setTotalMinutes(prev => Math.max(0, prev - minutes));
      setSessions(prev => prev.filter(s => s.id !== fakeId));
      setAddError("网络错误，请重试");
      setAddHours(saved.hours);
      setAddDate(saved.date);
      setAddNote(saved.note);
      setAddOpen(true);
    } finally {
      setAddLoading(false);
    }
  }

  // ── SessionList: optimistic delete ─────────────────────────────────────
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState("");

  async function handleDelete(id: string) {
    const target = sessions.find(s => s.id === id);
    if (!target) return;
    const minutes = target.durationMinutes ?? 0;
    setDeleteError("");

    // Optimistic update — instant
    setTotalMinutes(prev => Math.max(0, prev - minutes));
    setSessions(prev => prev.filter(s => s.id !== id));
    setDeleting(id);

    try {
      const res = await fetch(`/api/sessions/${id}`, { method: "DELETE" });
      if (!res.ok) {
        // Rollback
        setTotalMinutes(prev => prev + minutes);
        setSessions(prev => [target, ...prev].sort(
          (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
        ).slice(0, 50));
        const data = await res.json().catch(() => ({}));
        setDeleteError(data.error ?? "删除失败，请重试");
      } else {
        invalidateDomainDetail(domainId);
        startRefresh(() => router.refresh());
      }
    } catch {
      setTotalMinutes(prev => prev + minutes);
      setSessions(prev => [target, ...prev].sort(
        (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
      ).slice(0, 50));
      setDeleteError("网络错误，请重试");
    } finally {
      setDeleting(null);
    }
  }

  const inputStyle = {
    padding: "0.6rem 0.875rem",
    background: "#fffaf1",
    border: "1px solid rgba(110,92,70,0.18)",
    borderRadius: "12px",
    color: "#2f2a24",
    fontSize: "0.875rem",
    width: "100%",
    transition: "border-color 0.2s",
  } as const;

  return (
    <>
      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1rem" }}>
        <div style={{ ...cardStyle, borderTop: `4px solid ${domainColor}`, padding: "1rem" }}>
          <p style={{ fontSize: "0.68rem", color: "#8f806f", letterSpacing: 0, marginBottom: "0.375rem" }}>累计时间</p>
          <p style={{ fontSize: "1.75rem", fontWeight: 800, fontFamily: "var(--font-geist-mono,monospace)", color: domainColor, lineHeight: 1 }}>
            {formatDuration(totalMinutes)}
          </p>
        </div>
        <div style={{ ...cardStyle, padding: "1rem" }}>
          <p style={{ fontSize: "0.68rem", color: "#8f806f", letterSpacing: 0, marginBottom: "0.375rem" }}>近4周均速</p>
          <p style={{ fontSize: "1.75rem", fontWeight: 800, fontFamily: "var(--font-geist-mono,monospace)", color: "#2f2a24", lineHeight: 1 }}>
            {weeklyAvgMinutes > 0 ? `${(weeklyAvgMinutes / 60).toFixed(1)}` : "—"}
          </p>
          {weeklyAvgMinutes > 0 && <p style={{ fontSize: "0.7rem", color: "#8f806f" }}>h / 周</p>}
        </div>
      </div>

      {/* Milestones */}
      <div style={{ ...cardStyle, padding: "1.25rem", marginBottom: "1rem" }}>
        <p style={{ fontSize: "0.72rem", color: "#8f806f", letterSpacing: 0, marginBottom: "0.875rem" }}>里程碑进度</p>

        {completed.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem", marginBottom: "1rem" }}>
            {completed.map(m => (
              <span key={m.hours} style={{ padding: "0.22rem 0.56rem", background: "#e8f4e8", border: "1px solid rgba(79,143,101,0.22)", borderRadius: "999px", fontSize: "0.65rem", color: "#4f8f65", letterSpacing: 0 }}>
                ✓ {m.hours >= 1000 ? `${m.hours / 1000}k` : (m.hours ?? "?")}h {m.label}
              </span>
            ))}
          </div>
        )}

        {keyMilestones.length === 0 ? (
          <p style={{ fontSize: "0.82rem", color: "#4f8f65" }}>
            ● 已达成目标 {targetHours >= 1000 ? `${targetHours / 1000}k` : targetHours}h！
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
            {keyMilestones.map(m => {
              const progress = Math.min(100, (totalHours / m.hours) * 100);
              const predicted = predictMilestone(totalMinutes, m.hours, weeklyAvgMinutes);
              const isTarget = m.hours === targetHours;
              const accent = isTarget ? domainColor : "#548373";
              return (
                <div key={m.hours} style={{ background: isTarget ? `rgba(${hexToRgb(domainColor)},0.08)` : "#fffaf1", border: `1px solid ${isTarget ? `${domainColor}33` : "rgba(110,92,70,0.12)"}`, borderRadius: "16px", padding: "0.875rem 1rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                    <div>
                      <span style={{ fontSize: "0.75rem", fontWeight: 700, color: accent }}>
                        {m.hours >= 1000 ? `${m.hours / 1000}k` : m.hours}h
                      </span>
                      <span style={{ marginLeft: "0.5rem", fontSize: "0.75rem", color: "#2f2a24" }}>{m.label}</span>
                      {isTarget && <span style={{ marginLeft: "0.375rem", fontSize: "0.6rem", color: accent, opacity: 0.7 }}>目标</span>}
                      <p style={{ fontSize: "0.65rem", color: "#8f806f", marginTop: "0.1rem" }}>{m.desc}</p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span style={{ fontSize: "0.75rem", fontWeight: 700, fontFamily: "monospace", color: accent }}>{progress.toFixed(1)}%</span>
                      {predicted && <p style={{ fontSize: "0.65rem", color: "#8f806f", marginTop: "0.1rem" }}>≈ {fmtDate(predicted)}</p>}
                    </div>
                  </div>
                  <div style={{ height: "6px", background: "rgba(110,92,70,0.10)", borderRadius: "999px", overflow: "hidden" }}>
                    <div style={{ width: `${progress}%`, height: "100%", background: accent, transition: "width 0.4s ease" }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Target settings */}
      <DomainTargetForm
        domainId={domainId}
        targetHours={targetHours}
        targetDate={targetDate}
        weeklyGoal={weeklyGoal}
        totalMinutes={totalMinutes}
      />

      {/* Add history */}
      <div style={{ marginBottom: "1rem" }}>
        <button
          onClick={() => { setAddOpen(!addOpen); setAddError(""); }}
          style={{ padding: "0.56rem 1rem", background: addOpen ? "#f5edf8" : "#fffdf8", border: `1px dashed ${addOpen ? "rgba(154,123,184,0.42)" : "rgba(110,92,70,0.18)"}`, borderRadius: "999px", color: addOpen ? "#7c5b99" : "#7a6c5d", fontSize: "0.82rem", letterSpacing: 0, cursor: "pointer", transition: "all 0.2s" }}>
          + 添加历史时间
        </button>

        {addOpen && (
          <form onSubmit={handleAdd} style={{ ...cardStyle, marginTop: "0.75rem", padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.75rem", position: "relative" }}>
            <div>
              <p style={{ fontSize: "0.68rem", color: "#8f806f", letterSpacing: 0, marginBottom: "0.375rem" }}>小时数</p>
              <input type="number" step="0.5" min="0.5" placeholder="例如：150" value={addHours} onChange={e => setAddHours(e.target.value)} required style={inputStyle}
                onFocus={e => (e.target.style.borderColor = "rgba(154,123,184,0.48)")}
                onBlur={e => (e.target.style.borderColor = "rgba(110,92,70,0.18)")} />
            </div>
            <div>
              <p style={{ fontSize: "0.68rem", color: "#8f806f", letterSpacing: 0, marginBottom: "0.375rem" }}>日期</p>
              <input type="date" value={addDate} onChange={e => setAddDate(e.target.value)} style={{ ...inputStyle, colorScheme: "light" }}
                max={new Date().toISOString().split("T")[0]}
                onFocus={e => (e.target.style.borderColor = "rgba(154,123,184,0.48)")}
                onBlur={e => (e.target.style.borderColor = "rgba(110,92,70,0.18)")} />
            </div>
            <div>
              <p style={{ fontSize: "0.68rem", color: "#8f806f", letterSpacing: 0, marginBottom: "0.375rem" }}>备注（可选）</p>
              <input type="text" placeholder="例如：入门阶段积累" value={addNote} onChange={e => setAddNote(e.target.value)} style={inputStyle}
                onFocus={e => (e.target.style.borderColor = "rgba(154,123,184,0.48)")}
                onBlur={e => (e.target.style.borderColor = "rgba(110,92,70,0.18)")} />
            </div>
            {addError && <p style={{ fontSize: "0.75rem", color: "#c95f57" }}>{addError}</p>}
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button type="button" onClick={() => setAddOpen(false)} style={{ flex: 1, padding: "0.6rem", background: "#fffaf1", border: "1px solid rgba(110,92,70,0.16)", borderRadius: "999px", color: "#7a6c5d", fontSize: "0.875rem", cursor: "pointer" }}>取消</button>
              <button type="submit" disabled={addLoading} style={{ flex: 1, padding: "0.6rem", background: "#9a7bb8", border: "1px solid #9a7bb8", borderRadius: "999px", color: "#fffdf8", fontSize: "0.875rem", fontWeight: 700, letterSpacing: 0, cursor: addLoading ? "not-allowed" : "pointer", opacity: addLoading ? 0.5 : 1, boxShadow: "0 8px 18px rgba(154,123,184,0.20)" }}>
                {addLoading ? "添加中..." : "确认添加"}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Session list */}
      <div>
        <p style={{ fontSize: "0.72rem", color: "#8f806f", letterSpacing: 0, marginBottom: "0.75rem" }}>历史记录</p>
        {sessions.length === 0 ? (
          <p style={{ fontSize: "0.875rem", color: "#a29382" }}>暂无记录</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
            {sessions.map(s => (
              <div key={s.id} style={{ background: "#fffdf8", border: "1px solid rgba(110,92,70,0.10)", borderRadius: "14px", padding: "0.6rem 0.875rem", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.5rem", opacity: deleting === s.id ? 0.4 : 1, transition: "opacity 0.15s" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flex: 1, minWidth: 0 }}>
                  <span style={{ fontSize: "0.75rem", color: "#8f806f", flexShrink: 0 }}>
                    {new Date(s.startTime).toLocaleDateString("zh-CN", { month: "short", day: "numeric" })}
                  </span>
                  {s.note === "手动添加" && <span style={{ fontSize: "0.6rem", color: "#9a7bb8" }}>手动</span>}
                  {s.note && s.note !== "手动添加" && <span style={{ fontSize: "0.65rem", color: "#a29382", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.note}</span>}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexShrink: 0 }}>
                  <span style={{ fontSize: "0.875rem", fontWeight: 700, fontFamily: "var(--font-geist-mono,monospace)", color: "#2f2a24" }}>
                    {formatDuration(s.durationMinutes ?? 0)}
                  </span>
                  <button onClick={() => handleDelete(s.id)} disabled={deleting === s.id} title="删除"
                    style={{ background: "none", border: "none", cursor: deleting === s.id ? "not-allowed" : "pointer", color: "rgba(201,95,87,0.45)", fontSize: "0.75rem", padding: "0.15rem 0.3rem", borderRadius: "8px", transition: "color 0.15s", lineHeight: 1 }}
                    onMouseEnter={e => (e.currentTarget.style.color = "#c95f57")}
                    onMouseLeave={e => (e.currentTarget.style.color = "rgba(201,95,87,0.45)")}>
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        {deleteError && <p style={{ fontSize: "0.75rem", color: "#c95f57", marginTop: "0.5rem" }}>{deleteError}</p>}
        {isRefreshing && <p style={{ fontSize: "0.7rem", color: "#8f806f", marginTop: "0.5rem" }}>正在同步...</p>}
      </div>
    </>
  );
}
