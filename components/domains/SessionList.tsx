"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatDuration } from "@/lib/utils";

type Session = {
  id: string;
  startTime: Date;
  durationMinutes: number | null;
  note: string | null;
};

export default function SessionList({ sessions }: { sessions: Session[] }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState<string | null>(null);
  const [items, setItems] = useState(sessions);

  async function handleDelete(id: string) {
    setDeleting(id);
    const res = await fetch(`/api/sessions/${id}`, { method: "DELETE" });
    if (res.ok) {
      setItems(prev => prev.filter(s => s.id !== id));
      router.refresh();
    }
    setDeleting(null);
  }

  if (items.length === 0) {
    return <p style={{ fontSize: "0.875rem", color: "rgba(74,85,128,0.4)" }}>暂无记录</p>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
      {items.map(s => (
        <div
          key={s.id}
          style={{
            background: "#0c0c1e",
            border: "1px solid rgba(255,255,255,0.04)",
            borderRadius: "2px",
            padding: "0.55rem 0.875rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flex: 1, minWidth: 0 }}>
            <span style={{ fontSize: "0.75rem", color: "rgba(74,85,128,0.7)", flexShrink: 0 }}>
              {new Date(s.startTime).toLocaleDateString("zh-CN", { month: "short", day: "numeric" })}
            </span>
            {s.note === "手动添加" && <span style={{ fontSize: "0.6rem", color: "rgba(224,64,251,0.4)" }}>手动</span>}
            {s.note && s.note !== "手动添加" && (
              <span style={{ fontSize: "0.65rem", color: "rgba(74,85,128,0.4)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {s.note}
              </span>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexShrink: 0 }}>
            <span style={{ fontSize: "0.875rem", fontWeight: 600, fontFamily: "var(--font-geist-mono,monospace)", color: "#dde4ff" }}>
              {formatDuration(s.durationMinutes ?? 0)}
            </span>
            <button
              onClick={() => handleDelete(s.id)}
              disabled={deleting === s.id}
              title="删除"
              style={{
                background: "none",
                border: "none",
                cursor: deleting === s.id ? "not-allowed" : "pointer",
                color: "rgba(255,23,68,0.3)",
                fontSize: "0.75rem",
                padding: "0.15rem 0.3rem",
                borderRadius: "2px",
                transition: "color 0.15s",
                opacity: deleting === s.id ? 0.4 : 1,
                lineHeight: 1,
              }}
              onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,23,68,0.8)")}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,23,68,0.3)")}
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
