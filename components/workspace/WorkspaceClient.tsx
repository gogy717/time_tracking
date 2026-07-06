"use client";

import { useEffect } from "react";
import useSWR from "swr";
import ProgressCard from "@/components/dashboard/ProgressCard";
import WeeklyGoalCard from "@/components/dashboard/WeeklyGoalCard";
import DomainsClient from "@/components/domains/DomainsClient";
import SettingsClient from "@/components/settings/SettingsClient";
import { useWorkspace } from "./WorkspaceProvider";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? "Request failed");
  return data;
};

export default function WorkspaceClient() {
  const { view } = useWorkspace();

  return (
    <>
      <div style={{ display: view === "dashboard" ? "block" : "none" }}>
        <DashboardView active={view === "dashboard"} />
      </div>
      <div style={{ display: view === "domains" ? "block" : "none" }}>
        <DomainsView active={view === "domains"} />
      </div>
      <div style={{ display: view === "settings" ? "block" : "none" }}>
        <SettingsView active={view === "settings"} />
      </div>
    </>
  );
}

function DashboardView({ active }: { active: boolean }) {
  const { data, isLoading, mutate } = useSWR(active ? "/api/stats" : null, fetcher, {
    refreshInterval: active ? 30000 : 0,
    revalidateOnFocus: false,
  });

  useEffect(() => {
    const handler = () => mutate();
    window.addEventListener("timer:changed", handler);
    window.addEventListener("domains:changed", handler);
    window.addEventListener("settings:changed", handler);
    return () => {
      window.removeEventListener("timer:changed", handler);
      window.removeEventListener("domains:changed", handler);
      window.removeEventListener("settings:changed", handler);
    };
  }, [mutate]);

  return (
    <div style={{ maxWidth: "56rem", margin: "0 auto" }}>
      <PageHeader icon="◈" title="仪表盘" />

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

function DomainsView({ active }: { active: boolean }) {
  const { data, isLoading, mutate } = useSWR(active ? "/api/domains" : null, fetcher, {
    revalidateOnFocus: false,
  });

  return (
    <div style={{ maxWidth: "38rem", margin: "0 auto" }}>
      <PageHeader icon="⬡" title="我的领域" />
      {isLoading && <DomainsSkeleton />}
      {data && <DomainsClient domains={data} onChanged={() => void mutate()} />}
    </div>
  );
}

function SettingsView({ active }: { active: boolean }) {
  const { data, isLoading, mutate } = useSWR(active ? "/api/user" : null, fetcher, {
    revalidateOnFocus: false,
  });

  return (
    <div style={{ maxWidth: "32rem", margin: "0 auto" }}>
      <PageHeader icon="◧" title="设置" />
      {isLoading && <SettingsSkeleton />}
      {data && <SettingsClient user={data} onSaved={() => void mutate()} />}
    </div>
  );
}

function PageHeader({ icon, title }: { icon: string; title: string }) {
  return (
    <div style={{ marginBottom: "2rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
        <span style={{ color: "#548373", fontFamily: "monospace" }}>{icon}</span>
        <h1 style={{ fontSize: "1.35rem", fontWeight: 800, color: "#2f2a24", letterSpacing: 0 }}>
          {title}
        </h1>
      </div>
      <div style={{ height: 1, background: "linear-gradient(90deg,rgba(84,131,115,0.28),transparent 70%)" }} />
    </div>
  );
}

function DomainsSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <div style={{ height: 46, background: "#fffdf8", border: "1px dashed rgba(84,131,115,0.26)", borderRadius: 16 }} />
      {[1, 2, 3].map(i => (
        <div key={i} style={{ height: 72, background: "#fffdf8", border: "1px solid rgba(110,92,70,0.12)", borderLeft: "4px solid rgba(84,131,115,0.18)", borderRadius: 18 }} />
      ))}
    </div>
  );
}

function SettingsSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {[0, 1, 2].map(item => (
        <div key={item} style={{ background: "#fffdf8", border: "1px solid rgba(110,92,70,0.12)", borderRadius: 18, padding: "1.5rem", boxShadow: "0 14px 35px rgba(115,94,64,0.08)" }}>
          <div style={{ height: 14, width: 96, background: "rgba(84,131,115,0.12)", borderRadius: 999, marginBottom: "1.2rem" }} />
          <div style={{ height: 16, width: "72%", background: "rgba(110,92,70,0.09)", borderRadius: 999, marginBottom: "0.65rem" }} />
          <div style={{ height: 16, width: "48%", background: "rgba(110,92,70,0.07)", borderRadius: 999 }} />
        </div>
      ))}
    </div>
  );
}
