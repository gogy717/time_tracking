"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { formatTimer } from "@/lib/utils";

type Domain = { id: string; name: string; color: string };
type ActiveSession = { id: string; startTime: Date; domain: Domain } | null;

export default function TimerClient({
  domains,
  activeSession,
}: {
  domains: Domain[];
  activeSession: ActiveSession;
}) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState(domains[0]?.id ?? "");
  const [sessionId, setSessionId] = useState(activeSession?.id ?? null);
  const [startTime, setStartTime] = useState<Date | null>(
    activeSession ? new Date(activeSession.startTime) : null
  );
  const [elapsed, setElapsed] = useState(0);
  const [loading, setLoading] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (startTime) {
      intervalRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTime.getTime()) / 1000));
      }, 1000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [startTime]);

  useEffect(() => {
    if (!sessionId) return;
    const handler = () => navigator.sendBeacon("/api/timer/stop", JSON.stringify({ sessionId }));
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [sessionId]);

  async function handleStart() {
    setLoading(true);
    const res = await fetch("/api/timer/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ domainId: selectedId }),
    });
    const data = await res.json();
    if (res.ok) {
      setSessionId(data.sessionId);
      setStartTime(new Date(data.startTime));
    } else {
      alert(data.error);
    }
    setLoading(false);
  }

  async function handleStop() {
    setLoading(true);
    await fetch("/api/timer/stop", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    });
    setSessionId(null);
    setStartTime(null);
    setElapsed(0);
    if (intervalRef.current) clearInterval(intervalRef.current);
    setLoading(false);
    router.refresh();
  }

  const isRunning = !!sessionId;
  const activeDomain = isRunning
    ? (activeSession?.domain ?? domains.find((d) => d.id === selectedId))
    : null;
  const glowColor = isRunning && activeDomain ? activeDomain.color : "#00e5ff";

  return (
    <div
      style={{
        background: "#0c0c1e",
        border: `1px solid ${isRunning ? `${glowColor}40` : "rgba(255,255,255,0.05)"}`,
        borderRadius: "2px",
        padding: "3rem 2rem",
        textAlign: "center",
        boxShadow: isRunning
          ? `0 0 40px ${glowColor}15, 0 0 80px rgba(0,0,0,0.6)`
          : "0 0 40px rgba(0,0,0,0.6)",
        transition: "all 0.4s",
        position: "relative",
      }}
    >
      {/* Corner decorations */}
      <span style={{ position:"absolute",top:-1,left:-1,width:14,height:14,borderTop:`2px solid ${glowColor}`,borderLeft:`2px solid ${glowColor}`,transition:"border-color 0.4s" }} />
      <span style={{ position:"absolute",bottom:-1,right:-1,width:14,height:14,borderBottom:`2px solid ${glowColor}`,borderRight:`2px solid ${glowColor}`,transition:"border-color 0.4s" }} />

      {/* Timer display */}
      <div
        style={{
          fontSize: "4.5rem",
          fontFamily: "var(--font-geist-mono, monospace)",
          fontWeight: 700,
          letterSpacing: "0.05em",
          color: glowColor,
          textShadow: `0 0 20px ${glowColor}80, 0 0 40px ${glowColor}40`,
          marginBottom: "2rem",
          lineHeight: 1,
          transition: "all 0.4s",
        }}
      >
        {formatTimer(elapsed)}
      </div>

      {isRunning ? (
        <div>
          <div style={{ marginBottom:"1.5rem",fontSize:"0.8rem",letterSpacing:"0.1em",color:"rgba(74,85,128,0.8)" }}>
            <span style={{ color:"rgba(0,229,255,0.4)" }}>◉ </span>
            正在记录：
            <strong style={{ color:glowColor,textShadow:`0 0 8px ${glowColor}60` }}>{activeDomain?.name}</strong>
          </div>
          <button
            onClick={handleStop}
            disabled={loading}
            style={{
              padding:"0.75rem 2.5rem",
              background:"rgba(255,23,68,0.1)",
              border:"1px solid rgba(255,23,68,0.4)",
              borderRadius:"2px",
              color:"#ff1744",
              fontSize:"0.875rem",
              fontWeight:600,
              letterSpacing:"0.15em",
              textTransform:"uppercase",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.5 : 1,
              textShadow:"0 0 8px rgba(255,23,68,0.5)",
              boxShadow:"0 0 15px rgba(255,23,68,0.1)",
              transition:"all 0.2s",
            }}
          >
            停止
          </button>
        </div>
      ) : (
        <div style={{ display:"flex",flexDirection:"column",gap:"0.75rem",maxWidth:"20rem",margin:"0 auto" }}>
          <select
            value={selectedId}
            onChange={e => setSelectedId(e.target.value)}
            style={{
              width:"100%",
              padding:"0.7rem 0.875rem",
              background:"rgba(255,255,255,0.03)",
              border:"1px solid rgba(255,255,255,0.08)",
              borderRadius:"2px",
              color:"#dde4ff",
              fontSize:"0.875rem",
              cursor:"pointer",
              appearance:"none",
              backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%234a5580' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
              backgroundRepeat:"no-repeat",
              backgroundPosition:"right 0.75rem center",
            }}
          >
            {domains.length === 0 ? (
              <option disabled>先创建一个领域</option>
            ) : (
              domains.map(d => <option key={d.id} value={d.id}>{d.name}</option>)
            )}
          </select>
          <button
            onClick={handleStart}
            disabled={loading || !selectedId}
            style={{
              padding:"0.75rem 2rem",
              background:"rgba(0,229,255,0.1)",
              border:"1px solid rgba(0,229,255,0.4)",
              borderRadius:"2px",
              color:"#00e5ff",
              fontSize:"0.875rem",
              fontWeight:600,
              letterSpacing:"0.15em",
              textTransform:"uppercase",
              cursor: (loading || !selectedId) ? "not-allowed" : "pointer",
              opacity: (loading || !selectedId) ? 0.4 : 1,
              textShadow:"0 0 8px rgba(0,229,255,0.5)",
              boxShadow:"0 0 15px rgba(0,229,255,0.08)",
              transition:"all 0.2s",
            }}
          >
            开始
          </button>
        </div>
      )}
    </div>
  );
}
