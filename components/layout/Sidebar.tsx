"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import SidebarTimer from "./SidebarTimer";

const NAV_ITEMS = [
  { href: "/dashboard", label: "仪表盘", icon: "◈" },
  { href: "/domains", label: "我的领域", icon: "⬡" },
  { href: "/settings", label: "设置", icon: "◧" },
];

type User = { name?: string | null; email?: string | null; image?: string | null };

export default function Sidebar({ user }: { user: User }) {
  const pathname = usePathname();
  const router = useRouter();
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  useEffect(() => {
    setPendingHref(null);
    for (const item of NAV_ITEMS) router.prefetch(item.href);
    router.prefetch("/timer");
  }, [pathname, router]);

  function warmRoute(href: string) {
    router.prefetch(href);
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
        {NAV_ITEMS.map(({ href, label, icon }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          const pending = pendingHref === href;
          return (
            <Link
              key={href}
              href={href}
              onMouseEnter={() => warmRoute(href)}
              onFocus={() => warmRoute(href)}
              onTouchStart={() => warmRoute(href)}
              onClick={() => {
                if (!active) setPendingHref(href);
                warmRoute(href);
              }}
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
                textDecoration: "none",
                transition: "all 0.15s",
              }}
            >
              <span style={{ fontFamily: "monospace", fontSize: "1rem", opacity: active ? 1 : 0.72 }}>{icon}</span>
              {label}
              {pending && <span style={{ marginLeft: "auto", width: 6, height: 6, borderRadius: "50%", background: "#e9a94f" }} />}
            </Link>
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
