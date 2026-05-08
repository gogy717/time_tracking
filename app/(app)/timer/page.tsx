import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import TimerClient from "@/components/timer/TimerClient";

export default async function TimerPage() {
  const session = await auth();
  const userId = session!.user!.id!;

  const [domains, activeSession] = await Promise.all([
    db.domain.findMany({ where: { userId, isArchived: false }, orderBy: { createdAt: "asc" } }),
    db.timeSession.findFirst({
      where: { userId, endTime: null },
      include: { domain: true },
    }),
  ]);

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">计时器</h1>
      <TimerClient domains={domains} activeSession={activeSession} />
    </div>
  );
}
