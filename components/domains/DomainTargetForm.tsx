"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { calcWeeklyGoal } from "@/lib/utils";
import { invalidateDomainDetail } from "./domain-detail-cache";

export default function DomainTargetForm({
  domainId,
  targetHours,
  targetDate,
  weeklyGoal,
  totalMinutes,
}: {
  domainId: string;
  targetHours: number;
  targetDate: Date | null;
  weeklyGoal: number;
  totalMinutes: number;
}) {
  const router = useRouter();
  const safeTargetHours = typeof targetHours === "number" && targetHours > 0 ? targetHours : 10000;
  const [editing, setEditing] = useState(!targetDate);
  const [date, setDate] = useState(targetDate ? new Date(targetDate).toISOString().split("T")[0] : "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [isRefreshing, startRefresh] = useTransition();

  const calculated = date ? calcWeeklyGoal(totalMinutes, new Date(date), 10, safeTargetHours) : null;
  const displayWeekly = calculated ?? weeklyGoal;

  async function handleSave() {
    if (!date) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/domains/${domainId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetDate: date }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "保存失败，请重试");
        return;
      }
      invalidateDomainDetail(domainId);
      setSaved(true);
      setEditing(false);
      setTimeout(() => setSaved(false), 2000);
      startRefresh(() => router.refresh());
    } catch {
      setError("网络错误，请重试");
    } finally {
      setSaving(false);
    }
  }

  const tLabel = safeTargetHours >= 1000 ? `${safeTargetHours / 1000}k` : safeTargetHours;

  const currentDateDisplay = date
    ? new Date(date).toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric" })
    : null;

  return (
    <div style={{
      background: "#fffdf8",
      border: "1px solid rgba(110,92,70,0.12)",
      borderRadius: "18px",
      padding: "1.25rem",
      marginBottom: "1rem",
      boxShadow: "0 14px 35px rgba(115,94,64,0.08)",
    }}>
      <p style={{ fontSize: "0.72rem", color: "#8f806f", letterSpacing: 0, marginBottom: "1rem" }}>
        目标设置
      </p>

      {/* Target hours + weekly goal */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1rem" }}>
        <div>
          <p style={{ fontSize: "0.68rem", color: "#8f806f", letterSpacing: 0, marginBottom: "0.375rem" }}>目标小时</p>
          <p style={{ fontSize: "1.1rem", fontWeight: 800, fontFamily: "monospace", color: "#2f2a24" }}>
            {tLabel}h
          </p>
        </div>
        <div>
          <p style={{ fontSize: "0.68rem", color: "#8f806f", letterSpacing: 0, marginBottom: "0.375rem" }}>每周需要</p>
          <p style={{ fontSize: "1.1rem", fontWeight: 800, fontFamily: "monospace", color: "#2f6f61" }}>
            {displayWeekly}h
          </p>
        </div>
      </div>

      {/* Deadline section */}
      <div>
        <p style={{ fontSize: "0.68rem", color: "#8f806f", letterSpacing: 0, marginBottom: "0.5rem" }}>
          截止日期
        </p>

        {/* Show current date + change button when not editing */}
        {!editing && currentDateDisplay && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.6rem 0.75rem", background: "#fffaf1", border: "1px solid rgba(110,92,70,0.12)", borderRadius: "14px" }}>
            <span style={{ fontSize: "0.875rem", color: saved ? "#4f8f65" : "#2f2a24" }}>
              {saved ? "● 已保存  " : ""}{currentDateDisplay}
            </span>
            <button
              onClick={() => { setEditing(true); setSaved(false); }}
              style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.75rem", color: "#2f6f61", letterSpacing: 0, padding: "0 0.25rem" }}
            >
              修改
            </button>
          </div>
        )}

        {/* Edit input */}
        {editing && (
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "flex-end" }}>
            <input
              type="date"
              value={date}
              onChange={e => { setDate(e.target.value); setError(""); }}
              style={{
                flex: 1,
                padding: "0.6rem 0.75rem",
                background: "#fffaf1",
                border: "1px solid rgba(110,92,70,0.18)",
                borderRadius: "12px",
                color: "#2f2a24",
                fontSize: "0.875rem",
                colorScheme: "light",
                transition: "border-color 0.2s",
              }}
              onFocus={e => (e.target.style.borderColor = "rgba(84,131,115,0.5)")}
              onBlur={e => (e.target.style.borderColor = "rgba(110,92,70,0.18)")}
            />
            {currentDateDisplay && (
              <button
                onClick={() => { setEditing(false); setDate(targetDate ? new Date(targetDate).toISOString().split("T")[0] : ""); }}
                style={{ padding: "0.6rem 0.75rem", background: "#fffaf1", border: "1px solid rgba(110,92,70,0.16)", borderRadius: "999px", color: "#7a6c5d", fontSize: "0.8rem", cursor: "pointer", whiteSpace: "nowrap" }}
              >
                取消
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={saving || !date}
              style={{
                padding: "0.6rem 1rem",
                background: "#548373",
                border: "1px solid #548373",
                borderRadius: "999px",
                color: "#fffdf8",
                fontSize: "0.8rem",
                fontWeight: 600,
                letterSpacing: 0,
                cursor: (saving || !date) ? "not-allowed" : "pointer",
                opacity: (saving || !date) ? 0.5 : 1,
                whiteSpace: "nowrap",
              }}
            >
              {saving ? "保存中..." : "保存"}
            </button>
          </div>
        )}
        {error && <p style={{ fontSize: "0.75rem", color: "#c95f57", marginTop: "0.5rem" }}>{error}</p>}
        {isRefreshing && <p style={{ fontSize: "0.7rem", color: "#8f806f", marginTop: "0.5rem" }}>正在同步...</p>}
      </div>
    </div>
  );
}
