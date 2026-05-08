import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import Sidebar from "@/components/layout/Sidebar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const domains = await db.domain.findMany({
    where: { userId: session.user.id!, isArchived: false },
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, color: true },
  });

  return (
    <div style={{ display: "flex", height: "100vh", background: "#07070e" }}>
      <Sidebar user={session.user} domains={domains} />
      <main style={{ flex: 1, overflowY: "auto", padding: "2rem 2.5rem" }}>
        {children}
      </main>
    </div>
  );
}
