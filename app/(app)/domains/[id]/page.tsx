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
    <div style={{ maxWidth:"36rem",margin:"0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom:"2rem" }}>
        <div style={{ display:"flex",alignItems:"center",gap:"0.75rem",marginBottom:"0.5rem" }}>
          <div style={{ width:10,height:10,borderRadius:"50%",background:domain.color,boxShadow:`0 0 8px ${domain.color}`,flexShrink:0 }} />
          <h1 style={{ fontSize:"1.25rem",fontWeight:700,color:"#dde4ff",letterSpacing:"0.1em",textTransform:"uppercase" }}>
            {domain.name}
          </h1>
        </div>
        <div style={{ height:1,background:`linear-gradient(90deg,${domain.color}60,transparent 60%)` }} />
      </div>

      {/* Stats card */}
      <div
        style={{
          background:"#0c0c1e",
          border:`1px solid rgba(255,255,255,0.05)`,
          borderTop:`2px solid ${domain.color}`,
          borderRadius:"2px",
          padding:"1.5rem",
          marginBottom:"1.5rem",
          boxShadow:`0 -2px 15px ${domain.color}20`,
          position:"relative",
        }}
      >
        <p style={{ fontSize:"0.65rem",color:"rgba(74,85,128,0.7)",letterSpacing:"0.2em",textTransform:"uppercase",marginBottom:"0.5rem" }}>
          累计时间
        </p>
        <p style={{ fontSize:"2.5rem",fontWeight:700,fontFamily:"var(--font-geist-mono,monospace)",color:domain.color,textShadow:`0 0 15px ${domain.color}60`,lineHeight:1,marginBottom:"0.75rem" }}>
          {formatDuration(totalMinutes)}
        </p>
        <p style={{ fontSize:"0.75rem",color:"rgba(74,85,128,0.6)",letterSpacing:"0.05em" }}>
          距 3000 小时：
          <span style={{ color:domain.color }}>{((totalMinutes / (3000 * 60)) * 100).toFixed(2)}%</span>
        </p>
      </div>

      {/* Sessions */}
      <div>
        <p style={{ fontSize:"0.65rem",color:"rgba(74,85,128,0.6)",letterSpacing:"0.2em",textTransform:"uppercase",marginBottom:"0.75rem" }}>
          历史记录
        </p>
        {domain.timeSessions.length === 0 ? (
          <p style={{ fontSize:"0.875rem",color:"rgba(74,85,128,0.4)",letterSpacing:"0.05em" }}>暂无记录</p>
        ) : (
          <div style={{ display:"flex",flexDirection:"column",gap:"0.375rem" }}>
            {domain.timeSessions.map(s => (
              <div
                key={s.id}
                style={{
                  background:"#0c0c1e",
                  border:"1px solid rgba(255,255,255,0.04)",
                  borderRadius:"2px",
                  padding:"0.625rem 1rem",
                  display:"flex",
                  justifyContent:"space-between",
                  alignItems:"center",
                }}
              >
                <span style={{ fontSize:"0.8rem",color:"rgba(74,85,128,0.8)",letterSpacing:"0.05em" }}>
                  {new Date(s.startTime).toLocaleDateString("zh-CN", { month:"short",day:"numeric" })}
                </span>
                <span style={{ fontSize:"0.875rem",fontWeight:600,fontFamily:"var(--font-geist-mono,monospace)",color:"#dde4ff" }}>
                  {formatDuration(s.durationMinutes ?? 0)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
