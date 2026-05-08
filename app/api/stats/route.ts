import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { getStartOfWeek } from "@/lib/utils";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;
  const startOfWeek = getStartOfWeek();

  const [user, domains, weekAggregate] = await Promise.all([
    db.user.findUnique({ where: { id: userId }, select: { weeklyGoalHours: true } }),
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

  const weeklyGoalHours = user?.weeklyGoalHours ?? 10;
  const thisWeekTotalMinutes = weekAggregate._sum.durationMinutes ?? 0;

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
      totalHours: totalMinutes / 60,
      progressTo3000h: Math.min((totalMinutes / (3000 * 60)) * 100, 100),
      progressTo7000h: Math.min((totalMinutes / (7000 * 60)) * 100, 100),
      thisWeekMinutes,
    };
  });

  return NextResponse.json({
    domains: domainStats,
    weeklyGoalHours,
    thisWeekTotalMinutes,
    weeklyGoalProgress: Math.min((thisWeekTotalMinutes / (weeklyGoalHours * 60)) * 100, 100),
  });
}
