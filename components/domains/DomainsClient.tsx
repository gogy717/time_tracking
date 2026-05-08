"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LADDER } from "@/lib/milestones";

type Domain = {
  id: string;
  name: string;
  color: string;
  icon?: string | null;
  isArchived: boolean;
  targetHours: number;
  _count: { timeSessions: number };
};

const COLORS = ["#00e5ff", "#e040fb", "#f59e0b", "#69ff47", "#448aff", "#ff6d00", "#ff1744"];
const TARGET_OPTIONS = LADDER.map(m => ({ hours: m.hours, label: m.label }));

export default function DomainsClient({ domains }: { domains: Domain[] }) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [color, setColor] = useState(COLORS[0]);
  const [icon, setIcon] = useState("");
  const [targetHours, setTargetHours] = useState(10000);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/domains", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, color, icon: icon || undefined, targetHours }),
    });
    if (res.ok) {
      setShowForm(false);
      setName("");
      setIcon("");
      setTargetHours(10000);
      router.refresh();
    } else {
      const data = await res.json();
      alert(data.error);
    }
    setLoading(false);
  }

  async function handleDelete(id: string, domainName: string) {
    if (!confirm(`确定删除「${domainName}」吗？此操作不可撤销，所有记录将一并删除。`)) return;
    setDeleting(id);
    const res = await fetch(`/api/domains/${id}`, { method: "DELETE" });
    if (res.ok) {
      router.refresh();
    }
    setDeleting(null);
  }

  const active = domains.filter(d => !d.isArchived);

  const inputStyle = {
    width: "100%",
    padding: "0.65rem 0.875rem",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "2px",
    color: "#dde4ff",
    fontSize: "0.875rem",
    transition: "border-color 0.2s",
  } as const;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <button
        onClick={() => setShowForm(!showForm)}
        style={{
          width: "100%", padding: "0.75rem",
          background: "transparent",
          border: `1px dashed ${showForm ? "rgba(0,229,255,0.4)" : "rgba(255,255,255,0.1)"}`,
          borderRadius: "2px",
          color: showForm ? "#00e5ff" : "rgba(74,85,128,0.7)",
          fontSize: "0.875rem", letterSpacing: "0.08em", cursor: "pointer",
          textShadow: showForm ? "0 0 8px rgba(0,229,255,0.4)" : "none",
          transition: "all 0.2s",
        }}
      >
        + 创建新领域
      </button>

      {showForm && (
        <form
          onSubmit={handleCreate}
          style={{
            background: "#0c0c1e", border: "1px solid rgba(0,229,255,0.15)",
            borderRadius: "2px", padding: "1.25rem",
            display: "flex", flexDirection: "column", gap: "1rem", position: "relative",
          }}
        >
          <span style={{ position: "absolute", top: -1, left: -1, width: 12, height: 12, borderTop: "2px solid #00e5ff", borderLeft: "2px solid #00e5ff" }} />
          <span style={{ position: "absolute", bottom: -1, right: -1, width: 12, height: 12, borderBottom: "2px solid #00e5ff", borderRight: "2px solid #00e5ff" }} />

          <input placeholder="领域名称（如：钢琴、编程）" value={name} onChange={e => setName(e.target.value)} required style={inputStyle}
            onFocus={e => (e.target.style.borderColor = "rgba(0,229,255,0.4)")}
            onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.08)")} />

          <input placeholder="图标 emoji（可选，如：🎹）" value={icon} onChange={e => setIcon(e.target.value)} style={inputStyle}
            onFocus={e => (e.target.style.borderColor = "rgba(0,229,255,0.4)")}
            onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.08)")} />

          <div>
            <p style={{ fontSize: "0.65rem", color: "rgba(74,85,128,0.7)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "0.5rem" }}>颜色</p>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              {COLORS.map(c => (
                <button key={c} type="button" onClick={() => setColor(c)} style={{
                  width: 24, height: 24, borderRadius: "50%", background: c, padding: 0, cursor: "pointer",
                  border: color === c ? `2px solid ${c}` : "2px solid transparent",
                  outline: color === c ? `2px solid ${c}40` : "none", outlineOffset: 2,
                  boxShadow: color === c ? `0 0 8px ${c}` : "none", transition: "all 0.15s",
                }} />
              ))}
            </div>
          </div>

          <div>
            <p style={{ fontSize: "0.65rem", color: "rgba(74,85,128,0.7)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "0.5rem" }}>目标</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem" }}>
              {TARGET_OPTIONS.map(opt => (
                <button key={opt.hours} type="button" onClick={() => setTargetHours(opt.hours)} style={{
                  padding: "0.3rem 0.625rem", borderRadius: "2px", fontSize: "0.75rem", cursor: "pointer", transition: "all 0.15s",
                  background: targetHours === opt.hours ? "rgba(0,229,255,0.15)" : "rgba(255,255,255,0.03)",
                  border: `1px solid ${targetHours === opt.hours ? "rgba(0,229,255,0.5)" : "rgba(255,255,255,0.08)"}`,
                  color: targetHours === opt.hours ? "#00e5ff" : "rgba(74,85,128,0.8)",
                  textShadow: targetHours === opt.hours ? "0 0 6px rgba(0,229,255,0.4)" : "none",
                }}>
                  {opt.hours >= 1000 ? `${opt.hours / 1000}k` : opt.hours}h
                  <span style={{ marginLeft: "0.25rem", fontSize: "0.65rem", opacity: 0.7 }}>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button type="button" onClick={() => setShowForm(false)}
              style={{ flex: 1, padding: "0.6rem", background: "transparent", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "2px", color: "rgba(74,85,128,0.8)", fontSize: "0.875rem", cursor: "pointer" }}>
              取消
            </button>
            <button type="submit" disabled={loading} style={{
              flex: 1, padding: "0.6rem", background: "rgba(0,229,255,0.1)", border: "1px solid rgba(0,229,255,0.35)",
              borderRadius: "2px", color: "#00e5ff", fontSize: "0.875rem", fontWeight: 600, letterSpacing: "0.08em",
              cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.5 : 1, textShadow: "0 0 6px rgba(0,229,255,0.4)",
            }}>
              {loading ? "创建中..." : "创建"}
            </button>
          </div>
        </form>
      )}

      {active.map(domain => {
        const t = domain.targetHours;
        const tLabel = t >= 1000 ? `${t / 1000}k` : t;
        return (
          <div key={domain.id} style={{ position: "relative" }}>
            <Link href={`/domains/${domain.id}`} style={{ textDecoration: "none", display: "block" }}>
              <div
                style={{
                  display: "flex", alignItems: "center", gap: "0.75rem",
                  background: "#0c0c1e", border: "1px solid rgba(255,255,255,0.05)",
                  borderLeft: `3px solid ${domain.color}`, borderRadius: "2px",
                  padding: "1rem 3rem 1rem 1.25rem",
                  cursor: "pointer", transition: "all 0.2s",
                  boxShadow: `-2px 0 10px ${domain.color}15`,
                  opacity: deleting === domain.id ? 0.4 : 1,
                }}
                onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = "#10102a"}
                onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = "#0c0c1e"}
              >
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: domain.color, boxShadow: `0 0 6px ${domain.color}`, flexShrink: 0 }} />
                <span style={{ fontWeight: 500, color: "#dde4ff", flex: 1, fontSize: "0.95rem" }}>{domain.name}</span>
                {domain.icon && <span>{domain.icon}</span>}
                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: "0.7rem", color: "rgba(74,85,128,0.5)" }}>目标 {tLabel}h</span>
                  <br />
                  <span style={{ fontSize: "0.65rem", color: "rgba(74,85,128,0.4)" }}>{domain._count.timeSessions} 次</span>
                </div>
              </div>
            </Link>
            <button
              onClick={() => handleDelete(domain.id, domain.name)}
              disabled={deleting === domain.id}
              title="删除领域"
              style={{
                position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)",
                background: "none", border: "none", cursor: deleting === domain.id ? "not-allowed" : "pointer",
                color: "rgba(255,23,68,0.3)", fontSize: "0.8rem", padding: "0.25rem 0.375rem",
                borderRadius: "2px", transition: "color 0.15s", lineHeight: 1,
              }}
              onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,23,68,0.8)")}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,23,68,0.3)")}
            >
              ✕
            </button>
          </div>
        );
      })}

      {active.length === 0 && !showForm && (
        <p style={{ textAlign: "center", fontSize: "0.875rem", color: "rgba(74,85,128,0.5)", padding: "3rem 0", letterSpacing: "0.05em" }}>
          还没有领域，点击上方按钮创建一个吧
        </p>
      )}
    </div>
  );
}
