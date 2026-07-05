import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import Sidebar from "@/components/layout/Sidebar";
import { TimerProvider } from "@/components/timer/TimerProvider";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userId = session.user.id!;
  const [domains, activeSession] = await Promise.all([
    db.domain.findMany({
      where: { userId, isArchived: false },
      orderBy: { createdAt: "asc" },
      select: { id: true, name: true, color: true },
    }),
    db.timeSession.findFirst({
      where: { userId, endTime: null },
      select: {
        id: true,
        startTime: true,
        domain: { select: { id: true, name: true, color: true } },
      },
    }),
  ]);

  return (
    <TimerProvider
      domains={domains}
      initialActive={activeSession ? {
        id: activeSession.id,
        startTime: activeSession.startTime.toISOString(),
        domain: activeSession.domain,
      } : null}
    >
      <div style={{ display: "flex", height: "100vh", background: "linear-gradient(135deg,#fbf6ec 0%,#fffaf1 48%,#eef7f1 100%)" }}>
        <Sidebar user={session.user} />
        <main style={{ flex: 1, overflowY: "auto", padding: "2rem 2.5rem" }}>
          {children}
        </main>
      </div>
    </TimerProvider>
  );
}
