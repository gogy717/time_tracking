"use client";

import { RadialBarChart, RadialBar, ResponsiveContainer } from "recharts";
import { formatDuration } from "@/lib/utils";

export default function WeeklyGoalCard({
  thisWeekMinutes,
  goalHours,
  progress,
  targetDate,
  totalMinutes,
}: {
  thisWeekMinutes: number;
  goalHours: number;
  progress: number;
  targetDate?: Date | null;
  totalMinutes?: number;
}) {
  const data = [{ value: Math.min(progress, 100), fill: "#00e5ff" }];
  const remainingHours = Math.max(0, 10000 - (totalMinutes ?? 0) / 60);
  const remainingWeeks = targetDate
    ? Math.max(0, (new Date(targetDate).getTime() - Date.now()) / (7 * 24 * 60 * 60 * 1000))
    : null;

  return (
    <div
      style={{
        background: "#0c0c1e",
        border: "1px solid rgba(0,229,255,0.15)",
        borderRadius: "2px",
        padding: "1.5rem",
        display: "flex",
        alignItems: "center",
        gap: "2rem",
        boxShadow: "0 0 40px rgba(0,0,0,0.5), 0 0 20px rgba(0,229,255,0.04)",
        position: "relative",
      }}
    >
      <span style={{ position: "absolute", top: -1, left: -1, width: 14, height: 14, borderTop: "2px solid #00e5ff", borderLeft: "2px solid #00e5ff" }} />
      <span style={{ position: "absolute", bottom: -1, right: -1, width: 14, height: 14, borderBottom: "2px solid #00e5ff", borderRight: "2px solid #00e5ff" }} />

      <div style={{ width: 120, height: 120, flexShrink: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart innerRadius="60%" outerRadius="90%" data={data} startAngle={90} endAngle={-270}>
            <RadialBar dataKey="value" background={{ fill: "rgba(255,255,255,0.04)" }} cornerRadius={4} />
          </RadialBarChart>
        </ResponsiveContainer>
      </div>

      <div style={{ flex: 1 }}>
        <div style={{ fontSize: "0.65rem", letterSpacing: "0.25em", color: "rgba(74,85,128,0.7)", textTransform: "uppercase", marginBottom: "0.5rem" }}>
          本周目标
        </div>
        <p
          style={{
            fontSize: "3rem",
            fontWeight: 800,
            fontFamily: "var(--font-geist-mono, monospace)",
            color: "#00e5ff",
            textShadow: "0 0 15px rgba(0,229,255,0.6), 0 0 30px rgba(0,229,255,0.3)",
            lineHeight: 1,
            marginBottom: "0.375rem",
          }}
        >
          {progress.toFixed(0)}%
        </p>
        <p style={{ fontSize: "0.875rem", color: "rgba(74,85,128,0.9)", marginBottom: "0.5rem" }}>
          {formatDuration(thisWeekMinutes)}{" "}
          <span style={{ color: "rgba(74,85,128,0.5)" }}>/ {goalHours}h</span>
        </p>

        {targetDate && remainingWeeks !== null && (
          <div style={{ fontSize: "0.7rem", color: "rgba(74,85,128,0.55)", letterSpacing: "0.04em", lineHeight: 1.8 }}>
            <span style={{ color: "rgba(0,229,255,0.4)" }}>◉ </span>
            目标 {new Date(targetDate).toLocaleDateString("zh-CN", { year: "numeric", month: "short", day: "numeric" })}
            {"  ·  "}
            剩余 {remainingHours.toFixed(0)}h
            {"  ·  "}
            {remainingWeeks.toFixed(0)} 周
          </div>
        )}
      </div>
    </div>
  );
}
