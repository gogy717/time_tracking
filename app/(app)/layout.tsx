import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import { TimerProvider } from "@/components/timer/TimerProvider";
import { WorkspaceProvider } from "@/components/workspace/WorkspaceProvider";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <TimerProvider>
      <WorkspaceProvider>
        <div style={{ display: "flex", height: "100vh", background: "linear-gradient(135deg,#fbf6ec 0%,#fffaf1 48%,#eef7f1 100%)" }}>
          <Sidebar user={session.user} />
          <main style={{ flex: 1, overflowY: "auto", padding: "2rem 2.5rem" }}>
            {children}
          </main>
        </div>
      </WorkspaceProvider>
    </TimerProvider>
  );
}
