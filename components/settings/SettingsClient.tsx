"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { calcWeeklyGoal } from "@/lib/utils";

type User = {
  email: string | null;
  name: string | null;
  weeklyGoalHours: number;
  goalTargetDate?: Date | null;
};

export default function SettingsClient({
  user,
  onSaved,
}: {
  user: User;
  onSaved?: () => void;
}) {
  const [targetDate, setTargetDate] = useState(
    user.goalTargetDate ? new Date(user.goalTargetDate).toISOString().split("T")[0] : ""
  );
  const [saving, setSaving] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
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
      window.dispatchEvent(new CustomEvent("settings:changed"));
      onSaved?.();
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setError("网络错误，请重试");
    } finally {
      setSaving(false);
    }
  }

  const sectionStyle = {
    background: "#fffdf8",
    border: "1px solid rgba(110,92,70,0.12)",
    borderRadius: "18px",
    padding: "1.5rem",
    position: "relative" as const,
    boxShadow: "0 14px 35px rgba(115,94,64,0.08)",
  };

  const labelStyle = {
    fontSize: "0.65rem" as const,
    color: "#8f806f",
    letterSpacing: 0,
    marginBottom: "0.375rem",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {/* Account info */}
      <div style={sectionStyle}>
        <h2 style={{ fontSize: "0.9rem", fontWeight: 700, color: "#2f2a24", letterSpacing: 0, marginBottom: "1.25rem" }}>
          账号信息
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
          <div>
            <p style={labelStyle}>邮箱</p>
            <p style={{ fontSize: "0.9rem", color: "#2f2a24", letterSpacing: 0 }}>{user.email}</p>
          </div>
          {user.name && (
            <div>
              <p style={labelStyle}>名称</p>
              <p style={{ fontSize: "0.9rem", color: "#2f2a24" }}>{user.name}</p>
            </div>
          )}
        </div>
      </div>

      {/* 10000h target */}
      <div style={sectionStyle}>
        <h2 style={{ fontSize: "0.9rem", fontWeight: 700, color: "#2f2a24", letterSpacing: 0, marginBottom: "0.375rem" }}>
          万小时计划
        </h2>
        <p style={{ fontSize: "0.8rem", color: "#8f806f", marginBottom: "1.25rem", letterSpacing: 0 }}>
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
        </div>

        {calculatedGoal !== null && (
          <div style={{ marginBottom: "1rem", padding: "0.75rem 1rem", background: "#e6f1ea", border: "1px solid rgba(84,131,115,0.18)", borderRadius: "14px" }}>
            <p style={{ fontSize: "0.68rem", color: "#6f7d70", letterSpacing: 0, marginBottom: "0.25rem" }}>
              每周需要
            </p>
            <p style={{ fontSize: "1.5rem", fontWeight: 800, fontFamily: "var(--font-geist-mono, monospace)", color: "#2f6f61" }}>
              {calculatedGoal} <span style={{ fontSize: "0.875rem", fontWeight: 400, color: "#7a6c5d" }}>小时 / 周</span>
            </p>
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            padding: "0.6rem 1.5rem",
            background: saved ? "#e8f4e8" : "#548373",
            border: `1px solid ${saved ? "rgba(79,143,101,0.28)" : "#548373"}`,
            borderRadius: "999px",
            color: saved ? "#4f8f65" : "#fffdf8",
            fontSize: "0.8rem",
            fontWeight: 600,
            letterSpacing: 0,
            cursor: saving ? "not-allowed" : "pointer",
            opacity: saving ? 0.5 : 1,
            boxShadow: saved ? "none" : "0 8px 18px rgba(84,131,115,0.22)",
            transition: "all 0.3s",
          }}
        >
          {saved ? "◉ 已保存" : saving ? "保存中..." : "保存"}
        </button>
        {error && <p style={{ fontSize: "0.75rem", color: "#c95f57", marginTop: "0.75rem" }}>{error}</p>}
      </div>

      {/* Sign out */}
      <div style={sectionStyle}>
        <h2 style={{ fontSize: "0.9rem", fontWeight: 700, color: "#2f2a24", letterSpacing: 0, marginBottom: "1.25rem" }}>
          账号操作
        </h2>
        <button
          onClick={() => {
            setSigningOut(true);
            signOut({ callbackUrl: "/login" }).catch(() => setSigningOut(false));
          }}
          disabled={signingOut}
          style={{
            padding: "0.6rem 1.5rem",
            background: "#fff1ef",
            border: "1px solid rgba(201,95,87,0.24)",
            borderRadius: "999px",
            color: "#c95f57",
            fontSize: "0.8rem",
            fontWeight: 600,
            letterSpacing: 0,
            cursor: signingOut ? "wait" : "pointer",
            opacity: signingOut ? 0.55 : 1,
            transition: "all 0.2s",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.color = "#99433d";
            (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(201,95,87,0.4)";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.color = "#c95f57";
            (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(201,95,87,0.24)";
          }}
        >
          {signingOut ? "退出中..." : "退出登录"}
        </button>
      </div>
    </div>
  );
}
