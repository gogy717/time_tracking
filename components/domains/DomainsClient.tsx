"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LADDER } from "@/lib/milestones";
import { prefetchDomainDetail } from "./domain-detail-cache";

type Domain = {
  id: string;
  name: string;
  color: string;
  icon?: string | null;
  isArchived: boolean;
  targetHours: number;
  _count: { timeSessions: number };
};

const COLORS = ["#548373", "#d97670", "#e9a94f", "#6d8fbf", "#9a7bb8", "#4f8f65", "#c95f57"];
const TARGET_OPTIONS = LADDER.map(m => ({ hours: m.hours, label: m.label }));

export default function DomainsClient({ domains }: { domains: Domain[] }) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [color, setColor] = useState(COLORS[0]);
  const [icon, setIcon] = useState("");
  const [targetHours, setTargetHours] = useState(10000);
  const [loading, setLoading] = useState(false);
  const [createError, setCreateError] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [optimisticDomains, setOptimisticDomains] = useState<Domain[]>([]);
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());
  const [isRefreshing, startRefresh] = useTransition();

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setCreateError("请输入领域名称");
      return;
    }
    setLoading(true);
    setCreateError("");
    setDeleteError("");
    const tempId = `opt-${Date.now()}`;
    const saved = { name: trimmedName, color, icon, targetHours };
    setOptimisticDomains(prev => [...prev, { id: tempId, name: saved.name, color, icon: icon || null, isArchived: false, targetHours, _count: { timeSessions: 0 } }]);
    setShowForm(false);
    setName(""); setIcon(""); setTargetHours(10000);
    try {
      const res = await fetch("/api/domains", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: saved.name, color: saved.color, icon: saved.icon || undefined, targetHours: saved.targetHours }),
      });
      if (res.ok) {
        const created = await res.json();
        setOptimisticDomains(prev => prev.map(d => d.id === tempId ? { ...created, _count: { timeSessions: 0 } } : d));
        startRefresh(() => router.refresh());
      } else {
        setOptimisticDomains(prev => prev.filter(d => d.id !== tempId));
        setShowForm(true);
        setName(saved.name); setColor(saved.color); setIcon(saved.icon); setTargetHours(saved.targetHours);
        const data = await res.json().catch(() => ({ error: "请求失败" }));
        setCreateError(data.error ?? "创建失败");
      }
    } catch {
      setOptimisticDomains(prev => prev.filter(d => d.id !== tempId));
      setShowForm(true);
      setName(saved.name); setColor(saved.color); setIcon(saved.icon); setTargetHours(saved.targetHours);
      setCreateError("网络错误，请重试");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string, domainName: string) {
    if (id.startsWith("opt-")) return;
    if (!confirm(`确定删除「${domainName}」吗？此操作不可撤销，所有记录将一并删除。`)) return;
    setDeleting(id);
    setDeleteError("");
    setDeletedIds(prev => new Set([...prev, id]));
    try {
      const res = await fetch(`/api/domains/${id}`, { method: "DELETE" });
      if (res.ok) {
        startRefresh(() => router.refresh());
      } else {
        setDeletedIds(prev => { const next = new Set(prev); next.delete(id); return next; });
        const data = await res.json().catch(() => ({}));
        setDeleteError(data.error ?? "删除失败，请重试");
      }
    } catch {
      setDeletedIds(prev => { const next = new Set(prev); next.delete(id); return next; });
      setDeleteError("网络错误，请重试");
    } finally {
      setDeleting(null);
    }
  }

  const displayed = useMemo(() => [
    ...domains.filter(d => !d.isArchived && !deletedIds.has(d.id)),
    ...optimisticDomains.filter(d => !deletedIds.has(d.id) && !domains.some(existing => existing.id === d.id)),
  ], [deletedIds, domains, optimisticDomains]);
  const preloadIds = displayed.filter(d => !d.id.startsWith("opt-")).map(d => d.id).join("|");

  function warmDomain(id: string) {
    if (id.startsWith("opt-")) return;
    router.prefetch(`/domains/${id}`);
    void prefetchDomainDetail(id).catch(() => {});
  }

  useEffect(() => {
    const ids = preloadIds ? preloadIds.split("|") : [];
    if (ids.length === 0) return;

    for (const id of ids) {
      router.prefetch(`/domains/${id}`);
      void prefetchDomainDetail(id).catch(() => {});
    }
  }, [preloadIds, router]);

  const inputStyle = {
    width: "100%",
    padding: "0.65rem 0.875rem",
    background: "#fffaf1",
    border: "1px solid rgba(110,92,70,0.18)",
    borderRadius: "12px",
    color: "#2f2a24",
    fontSize: "0.875rem",
    transition: "border-color 0.2s",
  } as const;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <button
        onClick={() => setShowForm(!showForm)}
        style={{
          width: "100%", padding: "0.75rem",
          background: showForm ? "#e6f1ea" : "#fffdf8",
          border: `1px dashed ${showForm ? "rgba(84,131,115,0.45)" : "rgba(110,92,70,0.18)"}`,
          borderRadius: "16px",
          color: showForm ? "#2f6f61" : "#7a6c5d",
          fontSize: "0.875rem", letterSpacing: 0, cursor: "pointer",
          boxShadow: showForm ? "0 8px 20px rgba(84,131,115,0.10)" : "0 8px 24px rgba(115,94,64,0.05)",
          transition: "all 0.2s",
        }}
      >
        + 创建新领域
      </button>

      {showForm && (
        <form
          onSubmit={handleCreate}
          style={{
            background: "#fffdf8", border: "1px solid rgba(84,131,115,0.20)",
            borderRadius: "18px", padding: "1.25rem",
            display: "flex", flexDirection: "column", gap: "1rem", position: "relative",
            boxShadow: "0 16px 35px rgba(115,94,64,0.08)",
          }}
        >
          <input placeholder="领域名称（如：钢琴、编程）" value={name} onChange={e => setName(e.target.value)} required style={inputStyle}
            onFocus={e => (e.target.style.borderColor = "rgba(84,131,115,0.5)")}
            onBlur={e => (e.target.style.borderColor = "rgba(110,92,70,0.18)")} />

          <input placeholder="图标 emoji（可选，如：🎹）" value={icon} onChange={e => setIcon(e.target.value)} style={inputStyle}
            onFocus={e => (e.target.style.borderColor = "rgba(84,131,115,0.5)")}
            onBlur={e => (e.target.style.borderColor = "rgba(110,92,70,0.18)")} />

          <div>
            <p style={{ fontSize: "0.68rem", color: "#8f806f", letterSpacing: 0, marginBottom: "0.5rem" }}>颜色</p>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              {COLORS.map(c => (
                <button key={c} type="button" onClick={() => setColor(c)} style={{
                  width: 24, height: 24, borderRadius: "50%", background: c, padding: 0, cursor: "pointer",
                  border: color === c ? `2px solid ${c}` : "2px solid rgba(110,92,70,0.12)",
                  outline: color === c ? `2px solid ${c}40` : "none", outlineOffset: 2,
                  boxShadow: color === c ? `0 0 8px ${c}` : "none", transition: "all 0.15s",
                }} />
              ))}
            </div>
          </div>

          <div>
            <p style={{ fontSize: "0.68rem", color: "#8f806f", letterSpacing: 0, marginBottom: "0.5rem" }}>目标</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem" }}>
              {TARGET_OPTIONS.map(opt => (
                <button key={opt.hours} type="button" onClick={() => setTargetHours(opt.hours)} style={{
                  padding: "0.34rem 0.7rem", borderRadius: "999px", fontSize: "0.75rem", cursor: "pointer", transition: "all 0.15s",
                  background: targetHours === opt.hours ? "#e6f1ea" : "#fffaf1",
                  border: `1px solid ${targetHours === opt.hours ? "rgba(84,131,115,0.42)" : "rgba(110,92,70,0.12)"}`,
                  color: targetHours === opt.hours ? "#2f6f61" : "#7a6c5d",
                }}>
                  {opt.hours >= 1000 ? `${opt.hours / 1000}k` : opt.hours}h
                  <span style={{ marginLeft: "0.25rem", fontSize: "0.65rem", opacity: 0.7 }}>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {createError && (
            <p style={{ fontSize: "0.75rem", color: "#c95f57", marginTop: "-0.25rem" }}>{createError}</p>
          )}

          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button type="button" onClick={() => { setShowForm(false); setCreateError(""); }}
              style={{ flex: 1, padding: "0.6rem", background: "#fffaf1", border: "1px solid rgba(110,92,70,0.16)", borderRadius: "999px", color: "#7a6c5d", fontSize: "0.875rem", cursor: "pointer" }}>
              取消
            </button>
            <button type="submit" disabled={loading || !name.trim()} style={{
              flex: 1, padding: "0.6rem", background: "#548373", border: "1px solid #548373",
              borderRadius: "999px", color: "#fffdf8", fontSize: "0.875rem", fontWeight: 700, letterSpacing: 0,
              cursor: (loading || !name.trim()) ? "not-allowed" : "pointer", opacity: (loading || !name.trim()) ? 0.55 : 1, boxShadow: "0 8px 18px rgba(84,131,115,0.22)",
            }}>
              {loading ? "创建中..." : "创建"}
            </button>
          </div>
        </form>
      )}

      {displayed.map(domain => {
        const t = domain.targetHours;
        const tLabel = t >= 1000 ? `${t / 1000}k` : t;
        const isPending = domain.id.startsWith("opt-");
        return (
          <div key={domain.id} style={{ position: "relative" }}>
            <Link
              href={`/domains/${domain.id}`}
              onMouseEnter={() => warmDomain(domain.id)}
              onFocus={() => warmDomain(domain.id)}
              onTouchStart={() => warmDomain(domain.id)}
              onClick={e => {
                if (isPending) {
                  e.preventDefault();
                  return;
                }
                warmDomain(domain.id);
              }}
              style={{ textDecoration: "none", display: "block" }}
            >
              <div
                style={{
                  display: "flex", alignItems: "center", gap: "0.75rem",
                  background: "#fffdf8", border: "1px solid rgba(110,92,70,0.12)",
                  borderLeft: `4px solid ${domain.color}`, borderRadius: "18px",
                  padding: "1rem 3rem 1rem 1.25rem",
                  cursor: isPending ? "progress" : "pointer", transition: "all 0.2s",
                  boxShadow: `0 14px 34px rgba(115,94,64,0.08), -2px 0 10px ${domain.color}18`,
                  opacity: deleting === domain.id || isPending ? 0.55 : 1,
                }}
                onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = "#fff8e8"}
                onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = "#fffdf8"}
              >
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: domain.color, boxShadow: `0 0 6px ${domain.color}`, flexShrink: 0 }} />
                <span style={{ fontWeight: 700, color: "#2f2a24", flex: 1, fontSize: "0.95rem" }}>{domain.name}</span>
                {domain.icon && <span>{domain.icon}</span>}
                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: "0.7rem", color: "#8f806f" }}>目标 {tLabel}h</span>
                  <br />
                  <span style={{ fontSize: "0.65rem", color: "#a29382" }}>{isPending ? "同步中" : `${domain._count.timeSessions} 次`}</span>
                </div>
              </div>
            </Link>
            <button
              onClick={() => handleDelete(domain.id, domain.name)}
              disabled={deleting === domain.id || isPending}
              title="删除领域"
              style={{
                position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)",
                background: "none", border: "none", cursor: (deleting === domain.id || isPending) ? "not-allowed" : "pointer",
                color: "rgba(201,95,87,0.42)", fontSize: "0.8rem", padding: "0.25rem 0.375rem",
                borderRadius: "10px", transition: "color 0.15s", lineHeight: 1,
              }}
              onMouseEnter={e => (e.currentTarget.style.color = "#c95f57")}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(201,95,87,0.42)")}
            >
              ✕
            </button>
          </div>
        );
      })}

      {deleteError && (
        <p style={{ fontSize: "0.75rem", color: "#c95f57", textAlign: "center" }}>{deleteError}</p>
      )}
      {isRefreshing && (
        <p style={{ fontSize: "0.7rem", color: "#8f806f", textAlign: "center" }}>
          正在同步...
        </p>
      )}

      {displayed.length === 0 && !showForm && (
        <p style={{ textAlign: "center", fontSize: "0.875rem", color: "#8f806f", padding: "3rem 0", letterSpacing: 0 }}>
          还没有领域，点击上方按钮创建一个吧
        </p>
      )}
    </div>
  );
}
