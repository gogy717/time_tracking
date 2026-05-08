import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar user={session.user} />
      <main className="flex-1 overflow-auto p-8">{children}</main>
    </div>
  );
}
