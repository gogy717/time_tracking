"use client";

import dynamic from "next/dynamic";
import { formatDuration } from "@/lib/utils";

const WeeklyGoalChart = dynamic(() => import("./WeeklyGoalChart"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        width: "100%",
        height: "100%",
        borderRadius: "50%",
        background: "conic-gradient(#548373 0deg, rgba(110,92,70,0.10) 0deg)",
      }}
    />
  ),
});

export default function WeeklyGoalCard({
  thisWeekMinutes,
  goalHours,
  progress,
  targetDate,
  totalMinutes,
  predicted10000,
  weeklyAvgMinutes,
}: {
  thisWeekMinutes: number;
  goalHours: number;
  progress: number;
  targetDate?: Date | null;
  totalMinutes?: number;
  predicted10000?: Date | null;
  weeklyAvgMinutes?: number;
}) {
  const remainingHours = Math.max(0, 10000 - (totalMinutes ?? 0) / 60);
  const remainingWeeks = targetDate
    ? Math.max(0, (new Date(targetDate).getTime() - Date.now()) / (7 * 24 * 60 * 60 * 1000))
    : null;

  return (
    <div
      style={{
        background: "#fffdf8",
        border: "1px solid rgba(110,92,70,0.12)",
        borderRadius: "22px",
        padding: "1.5rem",
        display: "flex",
        alignItems: "center",
        gap: "2rem",
        boxShadow: "0 18px 45px rgba(115,94,64,0.09)",
        position: "relative",
      }}
    >
      <div style={{ width: 120, height: 120, flexShrink: 0 }}>
        <WeeklyGoalChart progress={progress} />
      </div>

      <div style={{ flex: 1 }}>
        <div style={{ fontSize: "0.72rem", letterSpacing: 0, color: "#8f806f", marginBottom: "0.5rem" }}>
          本周目标
        </div>
        <p style={{
          fontSize: "3rem", fontWeight: 800,
          fontFamily: "var(--font-geist-mono, monospace)",
          color: "#2f6f61",
          lineHeight: 1, marginBottom: "0.375rem",
        }}>
          {progress.toFixed(0)}%
        </p>
        <p style={{ fontSize: "0.875rem", color: "#7a6c5d", marginBottom: "0.625rem" }}>
          {formatDuration(thisWeekMinutes)}{" "}
          <span style={{ color: "#a29382" }}>/ {goalHours}h</span>
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
          {targetDate && remainingWeeks !== null && (
            <div style={{ fontSize: "0.72rem", color: "#8f806f", letterSpacing: 0 }}>
              <span style={{ color: "#548373" }}>● </span>
              目标 {new Date(targetDate).toLocaleDateString("zh-CN", { year: "numeric", month: "short", day: "numeric" })}
              {"  ·  "}剩余 {remainingHours.toFixed(0)}h{"  ·  "}{remainingWeeks.toFixed(0)} 周
            </div>
          )}
          {weeklyAvgMinutes !== undefined && weeklyAvgMinutes > 0 && (
            <div style={{ fontSize: "0.72rem", color: "#8f806f", letterSpacing: 0 }}>
              <span style={{ color: "#548373" }}>◈ </span>
              近4周均速 {(weeklyAvgMinutes / 60).toFixed(1)}h/周
              {predicted10000 && (
                <>
                  {"  ·  "}预计 10000h：
                  <span style={{ color: "#2f6f61" }}>
                    {new Date(predicted10000).toLocaleDateString("zh-CN", { year: "numeric", month: "long" })}
                  </span>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
