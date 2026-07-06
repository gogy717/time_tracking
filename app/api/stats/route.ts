import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { getStartOfWeek, predictMilestone, calcWeeklyGoal } from "@/lib/utils";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;
  const startOfWeek = getStartOfWeek();
  const fourWeeksAgo = new Date(Date.now() - 28 * 24 * 60 * 60 * 1000);

  const [user, domains, totalByDomain, weekByDomain, recentAggregate] = await Promise.all([
    db.user.findUnique({ where: { id: userId }, select: { weeklyGoalHours: true, goalTargetDate: true } }),
    db.domain.findMany({
      where: { userId, isArchived: false },
      select: { id: true, name: true, color: true, icon: true, targetHours: true },
    }),
    db.timeSession.groupBy({
      by: ["domainId"],
      where: { userId, endTime: { not: null } },
      _sum: { durationMinutes: true },
    }),
    db.timeSession.groupBy({
      by: ["domainId"],
      where: { userId, startTime: { gte: startOfWeek }, endTime: { not: null } },
      _sum: { durationMinutes: true },
    }),
    db.timeSession.aggregate({
      where: { userId, startTime: { gte: fourWeeksAgo }, endTime: { not: null } },
      _sum: { durationMinutes: true },
    }),
  ]);

  const totalMap = new Map(totalByDomain.map(row => [row.domainId, row._sum.durationMinutes ?? 0]));
  const weekMap = new Map(weekByDomain.map(row => [row.domainId, row._sum.durationMinutes ?? 0]));

  const domainStats = domains.map((domain) => {
    return {
      id: domain.id,
      name: domain.name,
      color: domain.color,
      icon: domain.icon,
      targetHours: domain.targetHours,
      totalMinutes: totalMap.get(domain.id) ?? 0,
      thisWeekMinutes: weekMap.get(domain.id) ?? 0,
    };
  });

  const totalAllTimeMinutes = domainStats.reduce((s, d) => s + d.totalMinutes, 0);
  const thisWeekTotalMinutes = domainStats.reduce((s, d) => s + d.thisWeekMinutes, 0);
  const recentAllMinutes = recentAggregate._sum.durationMinutes ?? 0;
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
