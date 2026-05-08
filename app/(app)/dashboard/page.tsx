import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getStartOfWeek } from "@/lib/utils";
import ProgressCard from "@/components/dashboard/ProgressCard";
import WeeklyGoalCard from "@/components/dashboard/WeeklyGoalCard";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user!.id!;
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
  const weeklyGoalProgress = Math.min((thisWeekTotalMinutes / (weeklyGoalHours * 60)) * 100, 100);

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

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">仪表盘</h1>

      <WeeklyGoalCard
        thisWeekMinutes={thisWeekTotalMinutes}
        goalHours={weeklyGoalHours}
        progress={weeklyGoalProgress}
      />

      {domainStats.length === 0 ? (
        <p className="text-gray-500 text-sm">还没有领域，去「我的领域」创建一个吧。</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {domainStats.map((domain) => (
            <ProgressCard key={domain.id} domain={domain} />
          ))}
        </div>
      )}
    </div>
  );
}
