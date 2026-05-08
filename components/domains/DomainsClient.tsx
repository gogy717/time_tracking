"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Domain = {
  id: string;
  name: string;
  color: string;
  icon?: string | null;
  isArchived: boolean;
  _count: { timeSessions: number };
};

const COLORS = ["#6366f1", "#ec4899", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#ef4444"];

export default function DomainsClient({ domains }: { domains: Domain[] }) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [color, setColor] = useState(COLORS[0]);
  const [icon, setIcon] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/domains", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, color, icon: icon || undefined }),
    });
    if (res.ok) {
      setShowForm(false);
      setName("");
      setIcon("");
      router.refresh();
    } else {
      const data = await res.json();
      alert(data.error);
    }
    setLoading(false);
  }

  const active = domains.filter((d) => !d.isArchived);

  return (
    <div className="space-y-4">
      <button
        onClick={() => setShowForm(!showForm)}
        className="w-full px-4 py-2.5 border-2 border-dashed border-gray-300 rounded-xl text-sm text-gray-500 hover:border-indigo-400 hover:text-indigo-600 transition-colors"
      >
        + 创建新领域
      </button>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-xl border p-5 space-y-4">
          <input
            placeholder="领域名称（如：钢琴、编程）"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            placeholder="图标 emoji（可选，如：🎹）"
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <div className="flex gap-2">
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className="w-7 h-7 rounded-full transition-transform hover:scale-110"
                style={{ backgroundColor: c, outline: color === c ? `2px solid ${c}` : "none", outlineOffset: 2 }}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              创建
            </button>
          </div>
        </form>
      )}

      {active.map((domain) => (
        <Link
          key={domain.id}
          href={`/domains/${domain.id}`}
          className="flex items-center gap-3 bg-white rounded-xl border px-5 py-4 hover:shadow-sm transition-shadow"
        >
          <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: domain.color }} />
          <span className="font-medium text-gray-900 flex-1">{domain.name}</span>
          {domain.icon && <span>{domain.icon}</span>}
          <span className="text-xs text-gray-400">{domain._count.timeSessions} 次记录</span>
        </Link>
      ))}

      {active.length === 0 && !showForm && (
        <p className="text-center text-sm text-gray-400 py-8">还没有领域，点击上方按钮创建一个吧</p>
      )}
    </div>
  );
}
