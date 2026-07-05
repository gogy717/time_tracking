import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import DomainDetailInteractive from "@/components/domains/DomainDetailInteractive";

type Props = { params: Promise<{ id: string }> };

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

  const fourWeeksAgo = new Date(Date.now() - 28 * 24 * 60 * 60 * 1000);
  const recentMinutes = domain.timeSessions
    .filter(s => s.startTime >= fourWeeksAgo)
    .reduce((sum, s) => sum + (s.durationMinutes ?? 0), 0);
  const weeklyAvgMinutes = recentMinutes / 4;

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

      <DomainDetailInteractive
        domainId={domain.id}
        domainColor={domain.color}
        targetHours={domain.targetHours}
        targetDate={domain.targetDate}
        initialTotalMinutes={totalMinutes}
        weeklyAvgMinutes={weeklyAvgMinutes}
        initialSessions={recentSessions}
      />
    </div>
  );
}
