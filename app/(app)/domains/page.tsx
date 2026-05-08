import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import DomainsClient from "@/components/domains/DomainsClient";

export default async function DomainsPage() {
  const session = await auth();
  const userId = session!.user!.id!;

  const domains = await db.domain.findMany({
    where: { userId },
    include: {
      _count: { select: { timeSessions: { where: { endTime: { not: null } } } } },
    },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div style={{ maxWidth:"36rem",margin:"0 auto" }}>
      <div style={{ marginBottom:"2rem" }}>
        <div style={{ display:"flex",alignItems:"center",gap:"0.5rem",marginBottom:"0.5rem" }}>
          <span style={{ color:"rgba(0,229,255,0.5)",fontFamily:"monospace" }}>⬡</span>
          <h1 style={{ fontSize:"1.25rem",fontWeight:700,color:"#dde4ff",letterSpacing:"0.12em",textTransform:"uppercase" }}>
            我的领域
          </h1>
        </div>
        <div style={{ height:1,background:"linear-gradient(90deg,rgba(0,229,255,0.35),transparent 60%)" }} />
      </div>
      <DomainsClient domains={domains} />
    </div>
  );
}
