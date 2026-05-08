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
    <div style={{ maxWidth:"32rem",margin:"0 auto" }}>
      <div style={{ marginBottom:"2rem" }}>
        <div style={{ display:"flex",alignItems:"center",gap:"0.5rem",marginBottom:"0.5rem" }}>
          <span style={{ color:"rgba(0,229,255,0.5)",fontFamily:"monospace" }}>◉</span>
          <h1 style={{ fontSize:"1.25rem",fontWeight:700,color:"#dde4ff",letterSpacing:"0.12em",textTransform:"uppercase" }}>
            计时器
          </h1>
        </div>
        <div style={{ height:1,background:"linear-gradient(90deg,rgba(0,229,255,0.35),transparent 60%)" }} />
      </div>
      <TimerClient domains={domains} activeSession={activeSession} />
    </div>
  );
}
