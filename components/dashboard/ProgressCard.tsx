"use client";

import Link from "next/link";
import { formatDuration } from "@/lib/utils";
import { LADDER } from "@/lib/milestones";
import DomainProgressBar from "./DomainProgressBar";

type Domain = {
  id: string;
  name: string;
  color: string;
  icon?: string | null;
  targetHours: number;
  totalMinutes: number;
  thisWeekMinutes: number;
};

function pick2Milestones(currentHours: number, targetHours: number): { hours: number; label: string }[] {
  const safeTarget = (typeof targetHours === "number" && targetHours > 0) ? targetHours : 10000;
  const rungs = LADDER.filter(m => m.hours <= safeTarget);
  const lastRung = rungs[rungs.length - 1];
  const targetEntry = lastRung?.hours === safeTarget
    ? lastRung
    : { hours: safeTarget, label: "目标", desc: "" };
  const all = lastRung?.hours === safeTarget ? rungs : [...rungs, targetEntry];
  if (all.length === 0) return [{ hours: safeTarget, label: "目标" }];

  const upcoming = all.filter(m => m.hours > currentHours);
  if (upcoming.length === 0) return [all[all.length - 1]];
  if (upcoming.length === 1) return [upcoming[0]];
  return [upcoming[0], upcoming[upcoming.length - 1]];
}

export default function ProgressCard({ domain }: { domain: Domain }) {
  const currentHours = domain.totalMinutes / 60;
  const milestones = pick2Milestones(currentHours, domain.targetHours);

  return (
    <Link href={`/domains/${domain.id}`} style={{ textDecoration: "none" }}>
      <div
        style={{
          background: "#fffdf8",
          border: "1px solid rgba(110,92,70,0.12)",
          borderTop: `4px solid ${domain.color}`,
          borderRadius: "18px",
          padding: "1.25rem",
          boxShadow: `0 14px 35px rgba(115,94,64,0.08), 0 -2px 12px ${domain.color}14`,
          cursor: "pointer",
          transition: "transform 0.2s, box-shadow 0.2s",
          position: "relative",
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
          (e.currentTarget as HTMLDivElement).style.boxShadow = `0 18px 42px rgba(115,94,64,0.13), 0 -2px 18px ${domain.color}24`;
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
          (e.currentTarget as HTMLDivElement).style.boxShadow = `0 14px 35px rgba(115,94,64,0.08), 0 -2px 12px ${domain.color}14`;
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: domain.color, boxShadow: `0 0 8px ${domain.color}`, flexShrink: 0 }} />
          <h3 style={{ fontWeight: 700, color: "#2f2a24", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: "0.95rem" }}>
            {domain.name}
          </h3>
          {domain.icon && <span style={{ fontSize: "1rem" }}>{domain.icon}</span>}
        </div>

        <p style={{ fontSize: "1.75rem", fontWeight: 800, fontFamily: "var(--font-geist-mono, monospace)", letterSpacing: 0, color: "#2f2a24", marginBottom: "1.25rem" }}>
          {formatDuration(domain.totalMinutes)}
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
          {milestones.map(m => {
            const progress = Math.min((currentHours / m.hours) * 100, 100);
            const label = `${m.label} ${m.hours >= 1000 ? `${m.hours / 1000}k` : m.hours}h`;
            return (
              <DomainProgressBar
                key={m.hours}
                label={label}
                progress={progress}
                color={domain.color}
                current={currentHours}
                target={m.hours}
              />
            );
          })}
        </div>

        {domain.thisWeekMinutes > 0 && (
          <p style={{ marginTop: "0.875rem", fontSize: "0.68rem", color: "#8f806f", letterSpacing: 0 }}>
            本周 +{formatDuration(domain.thisWeekMinutes)}
          </p>
        )}
      </div>
    </Link>
  );
}
