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
  const [date, setDate] = useState(targetDate ? new Date(targetDate).toISOString().split("T")[0] : "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const calculated = date ? calcWeeklyGoal(totalMinutes, new Date(date), 10) : null;

  async function handleSave() {
    setSaving(true);
    await fetch(`/api/domains/${domainId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetDate: date || null }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    router.refresh();
  }

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

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "0.875rem" }}>
        <div>
          <p style={{ fontSize: "0.65rem", color: "rgba(74,85,128,0.6)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.375rem" }}>目标小时</p>
          <p style={{ fontSize: "1.1rem", fontWeight: 700, fontFamily: "monospace", color: "#dde4ff" }}>
            {targetHours >= 1000 ? `${targetHours / 1000}k` : targetHours}h
          </p>
        </div>
        <div>
          <p style={{ fontSize: "0.65rem", color: "rgba(74,85,128,0.6)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.375rem" }}>每周需要</p>
          <p style={{ fontSize: "1.1rem", fontWeight: 700, fontFamily: "monospace", color: "#00e5ff", textShadow: "0 0 8px rgba(0,229,255,0.4)" }}>
            {calculated ?? weeklyGoal}h
          </p>
        </div>
      </div>

      <div style={{ display: "flex", gap: "0.5rem", alignItems: "flex-end" }}>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: "0.65rem", color: "rgba(74,85,128,0.6)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.375rem" }}>
            截止日期
          </p>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            style={{
              width: "100%",
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
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            padding: "0.6rem 1rem",
            background: saved ? "rgba(105,255,71,0.1)" : "rgba(0,229,255,0.1)",
            border: `1px solid ${saved ? "rgba(105,255,71,0.4)" : "rgba(0,229,255,0.35)"}`,
            borderRadius: "2px",
            color: saved ? "#69ff47" : "#00e5ff",
            fontSize: "0.8rem",
            fontWeight: 600,
            letterSpacing: "0.08em",
            cursor: saving ? "not-allowed" : "pointer",
            opacity: saving ? 0.5 : 1,
            whiteSpace: "nowrap",
            transition: "all 0.3s",
          }}
        >
          {saved ? "◉ 已保存" : "保存"}
        </button>
      </div>
    </div>
  );
}
