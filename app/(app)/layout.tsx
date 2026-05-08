import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div style={{ display:"flex",height:"100vh",background:"#07070e" }}>
      <Sidebar user={session.user} />
      <main style={{ flex:1,overflowY:"auto",padding:"2rem 2.5rem" }}>
        {children}
      </main>
    </div>
  );
}
