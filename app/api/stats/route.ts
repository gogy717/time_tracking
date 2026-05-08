import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { getStartOfWeek, predictMilestone, calcWeeklyGoal } from "@/lib/utils";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;
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

  const thisWeekTotalMinutes = weekAggregate._sum.durationMinutes ?? 0;
  const fourWeeksAgo = new Date(Date.now() - 28 * 24 * 60 * 60 * 1000);

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
      targetHours: domain.targetHours,
      totalMinutes,
      thisWeekMinutes,
    };
  });

  const totalAllTimeMinutes = domainStats.reduce((s, d) => s + d.totalMinutes, 0);
  const recentAllMinutes = domains
    .flatMap(d => d.timeSessions)
    .filter(s => s.startTime >= fourWeeksAgo)
    .reduce((s, ts) => s + (ts.durationMinutes ?? 0), 0);
  const globalWeeklyAvg = recentAllMinutes / 4;
  const weeklyGoalHours = calcWeeklyGoal(totalAllTimeMinutes, user?.goalTargetDate ?? null, user?.weeklyGoalHours ?? 10);
  const weeklyGoalProgress = Math.min((thisWeekTotalMinutes / (weeklyGoalHours * 60)) * 100, 100);
  const predicted10000 = predictMilestone(totalAllTimeMinutes, 10000, globalWeeklyAvg);

  return NextResponse.json({
    domains: domainStats,
    weeklyGoalHours,
    thisWeekTotalMinutes,
    weeklyGoalProgress,
    globalWeeklyAvg,
    predicted10000,
    targetDate: user?.goalTargetDate ?? null,
    totalAllTimeMinutes,
  });
}
