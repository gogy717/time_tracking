"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import SidebarTimer from "./SidebarTimer";

const NAV_ITEMS = [
  { href: "/dashboard", label: "仪表盘", icon: "◈" },
  { href: "/domains", label: "我的领域", icon: "⬡" },
  { href: "/settings", label: "设置", icon: "◧" },
];

type User = { name?: string | null; email?: string | null; image?: string | null };
type Domain = { id: string; name: string; color: string };

export default function Sidebar({ user, domains }: { user: User; domains: Domain[] }) {
  const pathname = usePathname();

  return (
    <aside
      style={{
        width: "14rem",
        background: "#07070e",
        borderRight: "1px solid rgba(0,229,255,0.12)",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <div style={{ padding: "1.5rem 1.25rem 1rem" }}>
        <div style={{ fontSize: "0.6rem", letterSpacing: "0.4em", color: "rgba(0,229,255,0.35)", textTransform: "uppercase", marginBottom: "0.4rem" }}>
          SYSTEM v1.0
        </div>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#00e5ff", textShadow: "0 0 12px rgba(0,229,255,0.7), 0 0 25px rgba(0,229,255,0.3)", letterSpacing: "0.08em" }}>
          专注追踪
        </h2>
      </div>

      <div style={{ height: 1, background: "linear-gradient(90deg,rgba(0,229,255,0.3),transparent)", margin: "0 1.25rem 0.5rem" }} />

      {/* Nav */}
      <nav style={{ flex: 1, padding: "0.5rem 0.75rem", display: "flex", flexDirection: "column", gap: "0.125rem" }}>
        {NAV_ITEMS.map(({ href, label, icon }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.625rem",
                padding: "0.6rem 0.75rem",
                borderRadius: "2px",
                fontSize: "0.875rem",
                fontWeight: active ? 600 : 400,
                color: active ? "#00e5ff" : "rgba(180,190,220,0.45)",
                background: active ? "rgba(0,229,255,0.06)" : "transparent",
                borderLeft: active ? "2px solid #00e5ff" : "2px solid transparent",
                textShadow: active ? "0 0 8px rgba(0,229,255,0.5)" : "none",
                letterSpacing: "0.04em",
                textDecoration: "none",
                transition: "all 0.15s",
              }}
            >
              <span style={{ fontFamily: "monospace", fontSize: "1rem", opacity: active ? 1 : 0.6 }}>{icon}</span>
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Mini timer */}
      <SidebarTimer domains={domains} />

      {/* Footer */}
      <div style={{ padding: "0.75rem 1.25rem", borderTop: "1px solid rgba(0,229,255,0.08)", marginTop: "0.5rem" }}>
        <p style={{ fontSize: "0.7rem", color: "rgba(74,85,128,0.7)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: "0.4rem" }}>
          {user.email}
        </p>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          style={{ fontSize: "0.7rem", color: "rgba(255,23,68,0.5)", background: "none", border: "none", cursor: "pointer", letterSpacing: "0.08em", textTransform: "uppercase", padding: 0, transition: "color 0.2s" }}
          onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.color = "rgba(255,23,68,0.9)")}
          onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.color = "rgba(255,23,68,0.5)")}
        >
          退出登录
        </button>
      </div>
    </aside>
  );
}
