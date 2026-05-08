import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { formatDuration, predictMilestone, calcWeeklyGoal } from "@/lib/utils";
import { pick3Milestones, LADDER } from "@/lib/milestones";
import AddHistoryForm from "@/components/domains/AddHistoryForm";
import DomainTargetForm from "@/components/domains/DomainTargetForm";
import SessionList from "@/components/domains/SessionList";

type Props = { params: Promise<{ id: string }> };

function fmtDate(date: Date | null): string {
  if (!date) return "数据不足";
  return date.toLocaleDateString("zh-CN", { year: "numeric", month: "long" });
}

export default async function DomainDetailPage({ params }: Props) {
  const session = await auth();
  const userId = session!.user!.id!;
  const { id } = await params;

  const domain = await db.domain.findFirst({
    where: { id, userId },
    include: {
      timeSessions: {
        where: { endTime: { not: null } },
        orderBy: { startTime: "desc" },
        take: 200,
      },
    },
  });

  if (!domain) notFound();

  const totalMinutes = domain.timeSessions.reduce((sum, s) => sum + (s.durationMinutes ?? 0), 0);
  const totalHours = totalMinutes / 60;

  const fourWeeksAgo = new Date(Date.now() - 28 * 24 * 60 * 60 * 1000);
  const recentMinutes = domain.timeSessions
    .filter(s => s.startTime >= fourWeeksAgo)
    .reduce((sum, s) => sum + (s.durationMinutes ?? 0), 0);
  const weeklyAvgMinutes = recentMinutes / 4;

  const { completed, key: keyMilestones } = pick3Milestones(totalHours, domain.targetHours);

  const weeklyGoal = calcWeeklyGoal(totalMinutes, domain.targetDate, 10);

  const recentSessions = domain.timeSessions.slice(0, 50);

  return (
    <div style={{ maxWidth: "38rem", margin: "0 auto" }}>
      {/* Back nav */}
      <Link href="/domains" style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", fontSize: "0.75rem", color: "rgba(74,85,128,0.6)", textDecoration: "none", marginBottom: "1.25rem", letterSpacing: "0.05em", transition: "color 0.15s" }}>
        ← 我的领域
      </Link>

      {/* Header */}
      <div style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: domain.color, boxShadow: `0 0 8px ${domain.color}`, flexShrink: 0 }} />
          <h1 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#dde4ff", letterSpacing: "0.1em", textTransform: "uppercase", flex: 1 }}>
            {domain.name}
          </h1>
          {domain.icon && <span style={{ fontSize: "1.25rem" }}>{domain.icon}</span>}
        </div>
        <div style={{ height: 1, background: `linear-gradient(90deg,${domain.color}60,transparent 60%)` }} />
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1rem" }}>
        <div style={{ background: "#0c0c1e", border: "1px solid rgba(255,255,255,0.05)", borderTop: `2px solid ${domain.color}`, borderRadius: "2px", padding: "1rem", boxShadow: `0 -2px 10px ${domain.color}15` }}>
          <p style={{ fontSize: "0.6rem", color: "rgba(74,85,128,0.6)", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "0.375rem" }}>累计时间</p>
          <p style={{ fontSize: "1.75rem", fontWeight: 700, fontFamily: "var(--font-geist-mono,monospace)", color: domain.color, textShadow: `0 0 12px ${domain.color}50`, lineHeight: 1 }}>
            {formatDuration(totalMinutes)}
          </p>
        </div>
        <div style={{ background: "#0c0c1e", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "2px", padding: "1rem" }}>
          <p style={{ fontSize: "0.6rem", color: "rgba(74,85,128,0.6)", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "0.375rem" }}>近4周均速</p>
          <p style={{ fontSize: "1.75rem", fontWeight: 700, fontFamily: "var(--font-geist-mono,monospace)", color: "#dde4ff", lineHeight: 1 }}>
            {weeklyAvgMinutes > 0 ? `${(weeklyAvgMinutes / 60).toFixed(1)}` : "—"}
          </p>
          {weeklyAvgMinutes > 0 && <p style={{ fontSize: "0.7rem", color: "rgba(74,85,128,0.5)" }}>h / 周</p>}
        </div>
      </div>

      {/* Milestones */}
      <div style={{ background: "#0c0c1e", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "2px", padding: "1.25rem", marginBottom: "1rem" }}>
        <p style={{ fontSize: "0.6rem", color: "rgba(74,85,128,0.6)", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "0.875rem" }}>
          里程碑进度
        </p>

        {/* Completed chips */}
        {completed.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem", marginBottom: "1rem" }}>
            {completed.map(m => (
              <span key={m.hours} style={{
                padding: "0.2rem 0.5rem",
                background: "rgba(105,255,71,0.06)",
                border: "1px solid rgba(105,255,71,0.2)",
                borderRadius: "2px",
                fontSize: "0.65rem",
                color: "#69ff47",
                letterSpacing: "0.04em",
              }}>
                ✓ {m.hours >= 1000 ? `${m.hours / 1000}k` : m.hours}h {m.label}
              </span>
            ))}
          </div>
        )}

        {/* 3 key milestone cards */}
        {keyMilestones.length === 0 ? (
          <p style={{ fontSize: "0.8rem", color: "#69ff47", textShadow: "0 0 8px rgba(105,255,71,0.4)" }}>
            ◉ 已达成目标 {domain.targetHours >= 1000 ? `${domain.targetHours / 1000}k` : domain.targetHours}h！
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
            {keyMilestones.map((m, i) => {
              const progress = Math.min(100, (totalHours / m.hours) * 100);
              const predicted = predictMilestone(totalMinutes, m.hours, weeklyAvgMinutes);
              const isTarget = m.hours === domain.targetHours;
              const accentColor = isTarget ? domain.color : "rgba(0,229,255,0.8)";
              return (
                <div key={m.hours} style={{
                  background: isTarget ? `rgba(${hexToRgb(domain.color)},0.04)` : "rgba(255,255,255,0.02)",
                  border: `1px solid ${isTarget ? `${domain.color}30` : "rgba(255,255,255,0.06)"}`,
                  borderRadius: "2px",
                  padding: "0.875rem 1rem",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                    <div>
                      <span style={{ fontSize: "0.75rem", fontWeight: 600, color: accentColor, textShadow: `0 0 6px ${accentColor}60` }}>
                        {m.hours >= 1000 ? `${m.hours / 1000}k` : m.hours}h
                      </span>
                      <span style={{ marginLeft: "0.5rem", fontSize: "0.75rem", color: "#dde4ff" }}>{m.label}</span>
                      {isTarget && <span style={{ marginLeft: "0.375rem", fontSize: "0.6rem", color: accentColor, opacity: 0.7 }}>目标</span>}
                      <p style={{ fontSize: "0.65rem", color: "rgba(74,85,128,0.5)", marginTop: "0.1rem" }}>{m.desc}</p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span style={{ fontSize: "0.75rem", fontWeight: 700, fontFamily: "monospace", color: accentColor }}>
                        {progress.toFixed(1)}%
                      </span>
                      {predicted && (
                        <p style={{ fontSize: "0.65rem", color: "rgba(74,85,128,0.5)", marginTop: "0.1rem" }}>≈ {fmtDate(predicted)}</p>
                      )}
                    </div>
                  </div>
                  <div style={{ height: "2px", background: "rgba(255,255,255,0.05)", borderRadius: "1px", overflow: "hidden" }}>
                    <div style={{ width: `${progress}%`, height: "100%", background: accentColor, boxShadow: `0 0 6px ${accentColor}`, transition: "width 0.6s ease" }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Target settings for this domain */}
      <DomainTargetForm
        domainId={domain.id}
        targetHours={domain.targetHours}
        targetDate={domain.targetDate}
        weeklyGoal={weeklyGoal}
        totalMinutes={totalMinutes}
      />

      {/* Add history */}
      <div style={{ marginBottom: "1rem" }}>
        <AddHistoryForm domainId={domain.id} />
      </div>

      {/* Session list */}
      <div>
        <p style={{ fontSize: "0.6rem", color: "rgba(74,85,128,0.6)", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "0.75rem" }}>
          历史记录
        </p>
        <SessionList sessions={recentSessions} />
      </div>
    </div>
  );
}

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}
