import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { formatDuration } from "@/lib/utils";

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
        take: 50,
      },
    },
  });

  if (!domain) notFound();

  const totalMinutes = domain.timeSessions.reduce((sum, s) => sum + (s.durationMinutes ?? 0), 0);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: domain.color }} />
        <h1 className="text-2xl font-bold text-gray-900">{domain.name}</h1>
      </div>

      <div className="bg-white rounded-xl border p-6">
        <p className="text-sm text-gray-500">累计时间</p>
        <p className="text-3xl font-bold text-gray-900 mt-1">{formatDuration(totalMinutes)}</p>
        <p className="text-sm text-gray-400 mt-1">
          距 3000 小时：{((totalMinutes / (3000 * 60)) * 100).toFixed(2)}%
        </p>
      </div>

      <div className="space-y-2">
        <h2 className="text-sm font-medium text-gray-500">历史记录</h2>
        {domain.timeSessions.length === 0 ? (
          <p className="text-sm text-gray-400">暂无记录</p>
        ) : (
          domain.timeSessions.map((s) => (
            <div key={s.id} className="bg-white rounded-lg border px-4 py-3 flex justify-between text-sm">
              <span className="text-gray-600">
                {new Date(s.startTime).toLocaleDateString("zh-CN", { month: "short", day: "numeric" })}
              </span>
              <span className="font-medium text-gray-900">{formatDuration(s.durationMinutes ?? 0)}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
