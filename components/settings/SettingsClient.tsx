"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { calcWeeklyGoal } from "@/lib/utils";

type User = {
  email: string | null;
  name: string | null;
  weeklyGoalHours: number;
  goalTargetDate?: Date | null;
};

export default function SettingsClient({ user }: { user: User }) {
  const router = useRouter();
  const [targetDate, setTargetDate] = useState(
    user.goalTargetDate ? new Date(user.goalTargetDate).toISOString().split("T")[0] : ""
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const calculatedGoal = targetDate
    ? calcWeeklyGoal(0, new Date(targetDate), user.weeklyGoalHours)
    : null;

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goalTargetDate: targetDate || null }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "保存失败，请重试");
        return;
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      router.refresh();
    } catch {
      setError("网络错误，请重试");
    } finally {
      setSaving(false);
    }
  }

  const sectionStyle = {
    background: "#0c0c1e",
    border: "1px solid rgba(255,255,255,0.05)",
    borderRadius: "2px",
    padding: "1.5rem",
    position: "relative" as const,
  };

  const labelStyle = {
    fontSize: "0.65rem" as const,
    color: "rgba(74,85,128,0.7)",
    letterSpacing: "0.2em",
    textTransform: "uppercase" as const,
    marginBottom: "0.375rem",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {/* Account info */}
      <div style={sectionStyle}>
        <span style={{ position: "absolute", top: -1, left: -1, width: 12, height: 12, borderTop: "2px solid rgba(0,229,255,0.4)", borderLeft: "2px solid rgba(0,229,255,0.4)" }} />
        <h2 style={{ fontSize: "0.75rem", fontWeight: 600, color: "#dde4ff", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "1.25rem" }}>
          账号信息
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
          <div>
            <p style={labelStyle}>邮箱</p>
            <p style={{ fontSize: "0.875rem", color: "#dde4ff", letterSpacing: "0.02em" }}>{user.email}</p>
          </div>
          {user.name && (
            <div>
              <p style={labelStyle}>名称</p>
              <p style={{ fontSize: "0.875rem", color: "#dde4ff" }}>{user.name}</p>
            </div>
          )}
        </div>
      </div>

      {/* 10000h target */}
      <div style={sectionStyle}>
        <h2 style={{ fontSize: "0.75rem", fontWeight: 600, color: "#dde4ff", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "0.375rem" }}>
          万小时计划
        </h2>
        <p style={{ fontSize: "0.75rem", color: "rgba(74,85,128,0.6)", marginBottom: "1.25rem", letterSpacing: "0.02em" }}>
          设置目标完成 10,000 小时的日期，每周目标将自动计算
        </p>

        <div style={{ marginBottom: "1rem" }}>
          <p style={labelStyle}>目标完成日期</p>
          <input
            type="date"
            value={targetDate}
            onChange={e => { setTargetDate(e.target.value); setError(""); setSaved(false); }}
            style={{
              padding: "0.6rem 0.875rem",
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

        {calculatedGoal !== null && (
          <div style={{ marginBottom: "1rem", padding: "0.75rem 1rem", background: "rgba(0,229,255,0.04)", border: "1px solid rgba(0,229,255,0.12)", borderRadius: "2px" }}>
            <p style={{ fontSize: "0.65rem", color: "rgba(74,85,128,0.7)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "0.25rem" }}>
              每周需要
            </p>
            <p style={{ fontSize: "1.5rem", fontWeight: 700, fontFamily: "var(--font-geist-mono, monospace)", color: "#00e5ff", textShadow: "0 0 10px rgba(0,229,255,0.5)" }}>
              {calculatedGoal} <span style={{ fontSize: "0.875rem", fontWeight: 400, color: "rgba(74,85,128,0.8)" }}>小时 / 周</span>
            </p>
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            padding: "0.6rem 1.5rem",
            background: saved ? "rgba(105,255,71,0.1)" : "rgba(0,229,255,0.1)",
            border: `1px solid ${saved ? "rgba(105,255,71,0.4)" : "rgba(0,229,255,0.35)"}`,
            borderRadius: "2px",
            color: saved ? "#69ff47" : "#00e5ff",
            fontSize: "0.8rem",
            fontWeight: 600,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            cursor: saving ? "not-allowed" : "pointer",
            opacity: saving ? 0.5 : 1,
            textShadow: saved ? "0 0 8px rgba(105,255,71,0.5)" : "0 0 8px rgba(0,229,255,0.4)",
            transition: "all 0.3s",
          }}
        >
          {saved ? "◉ 已保存" : saving ? "保存中..." : "保存"}
        </button>
        {error && <p style={{ fontSize: "0.75rem", color: "#ff1744", marginTop: "0.75rem" }}>{error}</p>}
      </div>

      {/* Sign out */}
      <div style={sectionStyle}>
        <h2 style={{ fontSize: "0.75rem", fontWeight: 600, color: "#dde4ff", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "1.25rem" }}>
          账号操作
        </h2>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          style={{
            padding: "0.6rem 1.5rem",
            background: "rgba(255,23,68,0.05)",
            border: "1px solid rgba(255,23,68,0.25)",
            borderRadius: "2px",
            color: "rgba(255,23,68,0.7)",
            fontSize: "0.8rem",
            fontWeight: 600,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.color = "#ff1744";
            (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,23,68,0.5)";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,23,68,0.7)";
            (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,23,68,0.25)";
          }}
        >
          退出登录
        </button>
      </div>
    </div>
  );
}
