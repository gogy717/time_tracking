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
    <div style={{ maxWidth: "38rem", margin: "0 auto" }}>
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
          <span style={{ color: "#548373", fontFamily: "monospace" }}>⬡</span>
          <h1 style={{ fontSize: "1.35rem", fontWeight: 800, color: "#2f2a24", letterSpacing: 0 }}>
            我的领域
          </h1>
        </div>
        <div style={{ height: 1, background: "linear-gradient(90deg,rgba(84,131,115,0.28),transparent 70%)" }} />
      </div>
      <DomainsClient domains={domains} />
    </div>
  );
}
