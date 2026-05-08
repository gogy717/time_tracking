"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "仪表盘", icon: "📊" },
  { href: "/timer", label: "计时器", icon: "⏱️" },
  { href: "/domains", label: "我的领域", icon: "🗂️" },
  { href: "/settings", label: "设置", icon: "⚙️" },
];

type User = { name?: string | null; email?: string | null; image?: string | null };

export default function Sidebar({ user }: { user: User }) {
  const pathname = usePathname();

  return (
    <aside className="w-56 bg-white border-r flex flex-col">
      <div className="px-4 py-6">
        <h2 className="text-lg font-bold text-indigo-600">专注追踪</h2>
      </div>

      <nav className="flex-1 px-2 space-y-1">
        {NAV_ITEMS.map(({ href, label, icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              pathname.startsWith(href)
                ? "bg-indigo-50 text-indigo-700"
                : "text-gray-600 hover:bg-gray-50"
            )}
          >
            <span>{icon}</span>
            {label}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t">
        <p className="text-xs text-gray-500 truncate">{user.email}</p>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="mt-2 text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          退出登录
        </button>
      </div>
    </aside>
  );
}
