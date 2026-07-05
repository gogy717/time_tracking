"use client";

import { useEffect } from "react";
import useSWR from "swr";
import ProgressCard from "@/components/dashboard/ProgressCard";
import WeeklyGoalCard from "@/components/dashboard/WeeklyGoalCard";

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function DashboardPage() {
  const { data, isLoading, mutate } = useSWR("/api/stats", fetcher, { refreshInterval: 30000 });

  useEffect(() => {
    const handler = () => mutate();
    window.addEventListener("timer:changed", handler);
    return () => window.removeEventListener("timer:changed", handler);
  }, [mutate]);

  return (
    <div style={{ maxWidth: "56rem", margin: "0 auto" }}>
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
          <span style={{ color: "#548373", fontFamily: "monospace" }}>◈</span>
          <h1 style={{ fontSize: "1.35rem", fontWeight: 800, color: "#2f2a24", letterSpacing: 0 }}>
            仪表盘
          </h1>
        </div>
        <div style={{ height: 1, background: "linear-gradient(90deg,rgba(84,131,115,0.28),transparent 70%)" }} />
      </div>

      {isLoading && (
        <div style={{ display: "grid", gap: "1rem" }}>
          <div style={{ height: 172, background: "#fffdf8", border: "1px solid rgba(110,92,70,0.12)", borderRadius: 18 }} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: "1rem" }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{ height: 190, background: "#fffdf8", border: "1px solid rgba(110,92,70,0.12)", borderRadius: 18 }} />
            ))}
          </div>
        </div>
      )}

      {data && (
        <>
          <WeeklyGoalCard
            thisWeekMinutes={data.thisWeekTotalMinutes}
            goalHours={data.weeklyGoalHours}
            progress={data.weeklyGoalProgress}
            targetDate={data.targetDate ? new Date(data.targetDate) : null}
            totalMinutes={data.totalAllTimeMinutes}
            predicted10000={data.predicted10000 ? new Date(data.predicted10000) : null}
            weeklyAvgMinutes={data.globalWeeklyAvg}
          />

          <div style={{ marginTop: "1.5rem" }}>
            {data.domains.length === 0 ? (
              <p style={{ color: "#8f806f", fontSize: "0.875rem", letterSpacing: 0 }}>
                还没有领域，去「我的领域」创建一个吧。
              </p>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: "1rem" }}>
                {data.domains.map((domain: {
                  id: string; name: string; color: string; icon?: string | null;
                  targetHours: number; totalMinutes: number; thisWeekMinutes: number;
                }) => (
                  <ProgressCard key={domain.id} domain={domain} />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
