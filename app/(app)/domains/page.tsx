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
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">我的领域</h1>
      <DomainsClient domains={domains} />
    </div>
  );
}
