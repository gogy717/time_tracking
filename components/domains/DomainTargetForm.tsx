"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { calcWeeklyGoal } from "@/lib/utils";

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

  const calculated = date ? calcWeeklyGoal(totalMinutes, new Date(date), 10, safeTargetHours) : null;
  const displayWeekly = calculated ?? weeklyGoal;

  async function handleSave() {
    setSaving(true);
    await fetch(`/api/domains/${domainId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetDate: date || null }),
    });
    setSaving(false);
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 2000);
    router.refresh();
  }

  const tLabel = safeTargetHours >= 1000 ? `${safeTargetHours / 1000}k` : safeTargetHours;

  const currentDateDisplay = targetDate
    ? new Date(targetDate).toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric" })
    : null;

  return (
    <div style={{
      background: "#0c0c1e",
      border: "1px solid rgba(255,255,255,0.05)",
      borderRadius: "2px",
      padding: "1.25rem",
      marginBottom: "1rem",
    }}>
      <p style={{ fontSize: "0.6rem", color: "rgba(74,85,128,0.6)", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "1rem" }}>
        目标设置
      </p>

      {/* Target hours + weekly goal */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1rem" }}>
        <div>
          <p style={{ fontSize: "0.65rem", color: "rgba(74,85,128,0.6)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.375rem" }}>目标小时</p>
          <p style={{ fontSize: "1.1rem", fontWeight: 700, fontFamily: "monospace", color: "#dde4ff" }}>
            {tLabel}h
          </p>
        </div>
        <div>
          <p style={{ fontSize: "0.65rem", color: "rgba(74,85,128,0.6)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.375rem" }}>每周需要</p>
          <p style={{ fontSize: "1.1rem", fontWeight: 700, fontFamily: "monospace", color: "#00e5ff", textShadow: "0 0 8px rgba(0,229,255,0.4)" }}>
            {displayWeekly}h
          </p>
        </div>
      </div>

      {/* Deadline section */}
      <div>
        <p style={{ fontSize: "0.65rem", color: "rgba(74,85,128,0.6)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.5rem" }}>
          截止日期
        </p>

        {/* Show current date + change button when not editing */}
        {!editing && currentDateDisplay && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.6rem 0.75rem", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "2px" }}>
            <span style={{ fontSize: "0.875rem", color: saved ? "#69ff47" : "#dde4ff" }}>
              {saved ? "◉ 已保存  " : ""}{currentDateDisplay}
            </span>
            <button
              onClick={() => { setEditing(true); setSaved(false); }}
              style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.75rem", color: "rgba(0,229,255,0.6)", letterSpacing: "0.06em", padding: "0 0.25rem" }}
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
              onChange={e => setDate(e.target.value)}
              style={{
                flex: 1,
                padding: "0.6rem 0.75rem",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "2px",
                color: "#dde4ff",
                fontSize: "0.875rem",
                colorScheme: "dark",
                transition: "border-color 0.2s",
              }}
              onFocus={e => (e.target.style.borderColor = "rgba(0,229,255,0.4)")}
              onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
            />
            {currentDateDisplay && (
              <button
                onClick={() => { setEditing(false); setDate(targetDate ? new Date(targetDate).toISOString().split("T")[0] : ""); }}
                style={{ padding: "0.6rem 0.75rem", background: "transparent", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "2px", color: "rgba(74,85,128,0.7)", fontSize: "0.8rem", cursor: "pointer", whiteSpace: "nowrap" }}
              >
                取消
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={saving || !date}
              style={{
                padding: "0.6rem 1rem",
                background: "rgba(0,229,255,0.1)",
                border: "1px solid rgba(0,229,255,0.35)",
                borderRadius: "2px",
                color: "#00e5ff",
                fontSize: "0.8rem",
                fontWeight: 600,
                letterSpacing: "0.08em",
                cursor: (saving || !date) ? "not-allowed" : "pointer",
                opacity: (saving || !date) ? 0.5 : 1,
                whiteSpace: "nowrap",
              }}
            >
              {saving ? "保存中..." : "保存"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
