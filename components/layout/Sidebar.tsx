"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import SidebarTimer from "./SidebarTimer";
import { useWorkspace, type WorkspaceView } from "@/components/workspace/WorkspaceProvider";

const NAV_ITEMS = [
  { view: "dashboard", label: "仪表盘", icon: "◈" },
  { view: "domains", label: "我的领域", icon: "⬡" },
  { view: "settings", label: "设置", icon: "◧" },
] satisfies { view: WorkspaceView; label: string; icon: string }[];

type User = { name?: string | null; email?: string | null; image?: string | null };

export default function Sidebar({ user }: { user: User }) {
  const pathname = usePathname();
  const router = useRouter();
  const { view, setView } = useWorkspace();
  const [pendingHref, setPendingHref] = useState<WorkspaceView | null>(null);

  useEffect(() => {
    setPendingHref(null);
    if (shouldSkipWarmup()) return;

    const handle = window.setTimeout(() => {
      router.prefetch("/dashboard");
    }, 700);

    return () => window.clearTimeout(handle);
  }, [pathname, router]);

  function switchView(nextView: WorkspaceView) {
    setView(nextView);
    if (pathname !== "/dashboard") {
      setPendingHref(nextView);
      router.push("/dashboard");
    }
  }

  return (
    <aside
      style={{
        width: "14rem",
        background: "rgba(255,253,248,0.86)",
        borderRight: "1px solid rgba(110,92,70,0.12)",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        boxShadow: "8px 0 30px rgba(115,94,64,0.06)",
        backdropFilter: "blur(14px)",
      }}
    >
      {/* Logo */}
      <div style={{ padding: "1.5rem 1.25rem 1rem" }}>
        <div style={{ fontSize: "0.68rem", letterSpacing: 0, color: "#a29382", textTransform: "uppercase", marginBottom: "0.4rem" }}>
          Focus Studio
        </div>
        <h2 style={{ fontSize: "1.18rem", fontWeight: 800, color: "#2f2a24", letterSpacing: 0 }}>
          专注追踪
        </h2>
      </div>

      <div style={{ height: 1, background: "linear-gradient(90deg,rgba(84,131,115,0.28),transparent)", margin: "0 1.25rem 0.5rem" }} />

      {/* Nav */}
      <nav style={{ flex: 1, padding: "0.5rem 0.75rem", display: "flex", flexDirection: "column", gap: "0.125rem" }}>
        {NAV_ITEMS.map(({ view: itemView, label, icon }) => {
          const active = pathname === "/dashboard" ? view === itemView : pathMatchesView(pathname, itemView);
          const pending = pendingHref === itemView;
          return (
            <button
              key={itemView}
              type="button"
              onMouseEnter={() => router.prefetch("/dashboard")}
              onFocus={() => router.prefetch("/dashboard")}
              onTouchStart={() => router.prefetch("/dashboard")}
              onClick={() => switchView(itemView)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.625rem",
                padding: "0.66rem 0.78rem",
                borderRadius: "14px",
                fontSize: "0.875rem",
                fontWeight: active ? 600 : 400,
                color: active ? "#2f6f61" : "#7a6c5d",
                background: active ? "#e6f1ea" : pending ? "rgba(233,169,79,0.13)" : "transparent",
                border: `1px solid ${active ? "rgba(84,131,115,0.18)" : "transparent"}`,
                letterSpacing: 0,
                textAlign: "left",
                transition: "all 0.15s",
                cursor: "pointer",
              }}
            >
              <span style={{ fontFamily: "monospace", fontSize: "1rem", opacity: active ? 1 : 0.72 }}>{icon}</span>
              {label}
              {pending && <span style={{ marginLeft: "auto", width: 6, height: 6, borderRadius: "50%", background: "#e9a94f" }} />}
            </button>
          );
        })}
      </nav>

      {/* Mini timer */}
      <SidebarTimer />

      {/* Footer */}
      <div style={{ padding: "0.75rem 1.25rem", borderTop: "1px solid rgba(110,92,70,0.10)", marginTop: "0.5rem" }}>
        <p style={{ fontSize: "0.72rem", color: "#8f806f", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: "0.4rem" }}>
          {user.email}
        </p>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          style={{ fontSize: "0.72rem", color: "#c95f57", background: "none", border: "none", cursor: "pointer", letterSpacing: 0, padding: 0, transition: "color 0.2s" }}
          onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.color = "#99433d")}
          onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.color = "#c95f57")}
        >
          退出登录
        </button>
      </div>
    </aside>
  );
}

function pathMatchesView(pathname: string, view: WorkspaceView) {
  if (view === "dashboard") return pathname === "/dashboard";
  if (view === "domains") return pathname.startsWith("/domains");
  if (view === "settings") return pathname.startsWith("/settings");
  return false;
}

function shouldSkipWarmup() {
  const connection = (navigator as Navigator & {
    connection?: { saveData?: boolean; effectiveType?: string };
  }).connection;

  return !!connection?.saveData || connection?.effectiveType === "slow-2g" || connection?.effectiveType === "2g";
}
