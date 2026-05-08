"use client";

import useSWR from "swr";
import ProgressCard from "@/components/dashboard/ProgressCard";
import WeeklyGoalCard from "@/components/dashboard/WeeklyGoalCard";

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function DashboardPage() {
  const { data } = useSWR("/api/stats", fetcher, { refreshInterval: 30000 });

  return (
    <div style={{ maxWidth: "56rem", margin: "0 auto" }}>
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
          <span style={{ color: "rgba(0,229,255,0.5)", fontFamily: "monospace" }}>◈</span>
          <h1 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#dde4ff", letterSpacing: "0.12em", textTransform: "uppercase" }}>
            仪表盘
          </h1>
        </div>
        <div style={{ height: 1, background: "linear-gradient(90deg,rgba(0,229,255,0.35),transparent 60%)" }} />
      </div>

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
              <p style={{ color: "rgba(74,85,128,0.7)", fontSize: "0.875rem", letterSpacing: "0.05em" }}>
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
