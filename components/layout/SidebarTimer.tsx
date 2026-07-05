"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { formatTimer } from "@/lib/utils";

type Domain = { id: string; name: string; color: string };
type ActiveSession = { id: string; startTime: string; domain: Domain } | null;

export default function SidebarTimer({ domains }: { domains: Domain[] }) {
  const router = useRouter();
  const [active, setActive] = useState<ActiveSession>(null);
  const [elapsed, setElapsed] = useState(0);
  const [selectedId, setSelectedId] = useState(domains[0]?.id ?? "");
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState("");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const confirmedIdRef = useRef<string | null>(null);

  // Fetch active session on mount
  useEffect(() => {
    fetch("/api/timer/active")
      .then(r => r.json())
      .then(({ session }) => {
        if (session) {
          confirmedIdRef.current = session.id;
          setActive(session);
          setElapsed(Math.floor((Date.now() - new Date(session.startTime).getTime()) / 1000));
          setExpanded(true);
        }
      })
      .catch(() => setError("计时状态同步失败"));
  }, []);

  // Interval
  useEffect(() => {
    if (!active) { setElapsed(0); return; }
    intervalRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - new Date(active.startTime).getTime()) / 1000));
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [active]);

  // sendBeacon on unload
  useEffect(() => {
    if (!active) return;
    const handler = () => {
      const id = confirmedIdRef.current;
      if (id) navigator.sendBeacon("/api/timer/stop", JSON.stringify({ sessionId: id }));
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [active]);

  async function handleStart() {
    if (!selectedId) return;
    const domain = domains.find(d => d.id === selectedId)!;
    setLoading(true);
    setError("");
    setActive({ id: "__opt__", startTime: new Date().toISOString(), domain });
    setExpanded(true);
    try {
      const res = await fetch("/api/timer/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domainId: selectedId }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        confirmedIdRef.current = data.sessionId;
        setActive({ id: data.sessionId, startTime: data.startTime, domain });
      } else {
        confirmedIdRef.current = null;
        setActive(null);
        setExpanded(false);
        setError(data.error ?? "启动失败");
      }
    } catch {
      confirmedIdRef.current = null;
      setActive(null);
      setExpanded(false);
      setError("网络错误，请重试");
    } finally {
      setLoading(false);
    }
  }

  async function handleStop() {
    if (!active) return;
    const id = confirmedIdRef.current ?? active.id;
    if (!id || id === "__opt__") return;
    const previousActive = active;
    confirmedIdRef.current = null;
    setLoading(true);
    setError("");
    if (intervalRef.current) clearInterval(intervalRef.current);
    setActive(null);
    setElapsed(0);
    setExpanded(false);
    try {
      const res = await fetch("/api/timer/stop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: id }),
      });
      if (!res.ok) throw new Error("stop failed");
      router.refresh();
    } catch {
      confirmedIdRef.current = id;
      setActive(previousActive);
      setExpanded(true);
      setError("停止失败，计时仍在继续");
    } finally {
      setLoading(false);
    }
  }

  const glowColor = active ? active.domain.color : "#00e5ff";

  return (
    <div style={{ padding: "0.75rem 0.75rem 0", borderTop: "1px solid rgba(0,229,255,0.08)" }}>
      {/* Collapsed: just a button row */}
      {!expanded && !active && (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <select
            value={selectedId}
            onChange={e => setSelectedId(e.target.value)}
            style={{
              width: "100%",
              padding: "0.4rem 0.5rem",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: "2px",
              color: "rgba(180,190,220,0.7)",
              fontSize: "0.75rem",
              appearance: "none",
              cursor: "pointer",
            }}
          >
            {domains.length === 0
              ? <option value="" disabled>先创建领域</option>
              : domains.map(d => <option key={d.id} value={d.id}>{d.name}</option>)
            }
          </select>
          <button
            onClick={handleStart}
            disabled={loading || !selectedId || domains.length === 0}
            style={{
              width: "100%",
              padding: "0.45rem",
              background: "rgba(0,229,255,0.08)",
              border: "1px solid rgba(0,229,255,0.25)",
              borderRadius: "2px",
              color: "#00e5ff",
              fontSize: "0.75rem",
              fontWeight: 600,
              letterSpacing: "0.1em",
              cursor: (loading || !selectedId) ? "not-allowed" : "pointer",
              opacity: (loading || !selectedId) ? 0.4 : 1,
              textShadow: "0 0 6px rgba(0,229,255,0.4)",
            }}
          >
            ▶ 开始计时
          </button>
        </div>
      )}

      {/* Running state */}
      {active && (
        <div>
          <div style={{ marginBottom: "0.375rem" }}>
            <div style={{ fontSize: "0.6rem", color: "rgba(74,85,128,0.6)", letterSpacing: "0.1em", marginBottom: "0.2rem" }}>
              <span style={{ color: glowColor, marginRight: "0.25rem" }}>●</span>
              {active.domain.name}
            </div>
            <div style={{
              fontSize: "1.4rem",
              fontFamily: "var(--font-geist-mono, monospace)",
              fontWeight: 700,
              color: glowColor,
              textShadow: `0 0 10px ${glowColor}80`,
              letterSpacing: "0.05em",
              lineHeight: 1,
            }}>
              {formatTimer(elapsed)}
            </div>
          </div>
          <button
            onClick={handleStop}
            disabled={loading}
            style={{
              width: "100%",
              padding: "0.4rem",
              background: "rgba(255,23,68,0.08)",
              border: "1px solid rgba(255,23,68,0.3)",
              borderRadius: "2px",
              color: "#ff1744",
              fontSize: "0.75rem",
              fontWeight: 600,
              letterSpacing: "0.08em",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.5 : 1,
            }}
          >
            ■ 停止
          </button>
        </div>
      )}
      {error && (
        <p style={{ marginTop: "0.5rem", fontSize: "0.68rem", color: "#ff1744", lineHeight: 1.4 }}>
          {error}
        </p>
      )}
    </div>
  );
}
