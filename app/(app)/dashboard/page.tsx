import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getStartOfWeek, calcWeeklyGoal, predictMilestone } from "@/lib/utils";
import ProgressCard from "@/components/dashboard/ProgressCard";
import WeeklyGoalCard from "@/components/dashboard/WeeklyGoalCard";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user!.id!;
  const startOfWeek = getStartOfWeek();

  const [user, domains, weekAggregate] = await Promise.all([
    db.user.findUnique({ where: { id: userId }, select: { weeklyGoalHours: true, goalTargetDate: true } }),
    db.domain.findMany({
      where: { userId, isArchived: false },
      include: {
        timeSessions: {
          where: { endTime: { not: null } },
          select: { durationMinutes: true, startTime: true },
        },
      },
    }),
    db.timeSession.aggregate({
      where: { userId, startTime: { gte: startOfWeek }, endTime: { not: null } },
      _sum: { durationMinutes: true },
    }),
  ]);

  const domainStats = domains.map((domain) => {
    const totalMinutes = domain.timeSessions.reduce((sum, s) => sum + (s.durationMinutes ?? 0), 0);
    const thisWeekMinutes = domain.timeSessions
      .filter((s) => s.startTime >= startOfWeek)
      .reduce((sum, s) => sum + (s.durationMinutes ?? 0), 0);
    return {
      id: domain.id,
      name: domain.name,
      color: domain.color,
      icon: domain.icon,
      totalMinutes,
      thisWeekMinutes,
      progressTo3000h: Math.min((totalMinutes / (3000 * 60)) * 100, 100),
      progressTo7000h: Math.min((totalMinutes / (7000 * 60)) * 100, 100),
    };
  });

  const totalAllTimeMinutes = domainStats.reduce((sum, d) => sum + d.totalMinutes, 0);
  const thisWeekTotalMinutes = weekAggregate._sum.durationMinutes ?? 0;
  const weeklyGoalHours = calcWeeklyGoal(
    totalAllTimeMinutes,
    user?.goalTargetDate ?? null,
    user?.weeklyGoalHours ?? 10
  );
  const weeklyGoalProgress = Math.min((thisWeekTotalMinutes / (weeklyGoalHours * 60)) * 100, 100);

  const fourWeeksAgo = new Date(Date.now() - 28 * 24 * 60 * 60 * 1000);
  const recentAllMinutes = domains
    .flatMap(d => d.timeSessions)
    .filter(s => s.startTime >= fourWeeksAgo)
    .reduce((sum, s) => sum + (s.durationMinutes ?? 0), 0);
  const globalWeeklyAvg = recentAllMinutes / 4;
  const predicted10000 = predictMilestone(totalAllTimeMinutes, 10000, globalWeeklyAvg);

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

      <WeeklyGoalCard
        thisWeekMinutes={thisWeekTotalMinutes}
        goalHours={weeklyGoalHours}
        progress={weeklyGoalProgress}
        targetDate={user?.goalTargetDate ?? null}
        totalMinutes={totalAllTimeMinutes}
        predicted10000={predicted10000}
        weeklyAvgMinutes={globalWeeklyAvg}
      />

      <div style={{ marginTop: "1.5rem" }}>
        {domainStats.length === 0 ? (
          <p style={{ color: "rgba(74,85,128,0.7)", fontSize: "0.875rem", letterSpacing: "0.05em" }}>
            还没有领域，去「我的领域」创建一个吧。
          </p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: "1rem" }}>
            {domainStats.map((domain) => (
              <ProgressCard key={domain.id} domain={domain} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
