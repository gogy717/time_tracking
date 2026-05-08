"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

type User = { email: string | null; name: string | null; weeklyGoalHours: number };

export default function SettingsClient({ user }: { user: User }) {
  const router = useRouter();
  const [goal, setGoal] = useState(user.weeklyGoalHours);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    await fetch("/api/user", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ weeklyGoalHours: goal }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">账号信息</h2>
        <div>
          <p className="text-xs text-gray-500">邮箱</p>
          <p className="text-sm text-gray-900">{user.email}</p>
        </div>
        {user.name && (
          <div>
            <p className="text-xs text-gray-500">名称</p>
            <p className="text-sm text-gray-900">{user.name}</p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">每周目标</h2>
        <div className="flex items-center gap-3">
          <input
            type="number"
            min={1}
            max={168}
            value={goal}
            onChange={(e) => setGoal(Number(e.target.value))}
            className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <span className="text-sm text-gray-500">小时 / 周</span>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {saved ? "已保存 ✓" : saving ? "保存中..." : "保存"}
        </button>
      </div>

      <div className="bg-white rounded-xl border p-6">
        <h2 className="font-semibold text-gray-900 mb-4">账号操作</h2>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="px-4 py-2 border border-red-300 text-red-600 text-sm rounded-lg hover:bg-red-50 transition-colors"
        >
          退出登录
        </button>
      </div>
    </div>
  );
}
