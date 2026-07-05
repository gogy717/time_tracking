"use client";

import { formatTimer } from "@/lib/utils";
import { useTimer } from "@/components/timer/TimerProvider";

export default function TimerClient() {
  const {
    domains,
    selectedId,
    setSelectedId,
    active,
    elapsed,
    status,
    error,
    startTimer,
    stopTimer,
  } = useTimer();

  const isBusy = status === "starting" || status === "stopping";
  const activeDomain = active?.domain ?? domains.find((d) => d.id === selectedId) ?? null;
  const glowColor = activeDomain?.color ?? "#00e5ff";
  const isRunning = !!active;

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
      <span style={{ position:"absolute",top:-1,left:-1,width:14,height:14,borderTop:`2px solid ${glowColor}`,borderLeft:`2px solid ${glowColor}`,transition:"border-color 0.4s" }} />
      <span style={{ position:"absolute",bottom:-1,right:-1,width:14,height:14,borderBottom:`2px solid ${glowColor}`,borderRight:`2px solid ${glowColor}`,transition:"border-color 0.4s" }} />

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
            onClick={stopTimer}
            disabled={isBusy || active.id === "__optimistic__"}
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
              cursor: isBusy ? "not-allowed" : "pointer",
              opacity: isBusy ? 0.5 : 1,
              textShadow:"0 0 8px rgba(255,23,68,0.5)",
              boxShadow:"0 0 15px rgba(255,23,68,0.1)",
              transition:"all 0.2s",
            }}
          >
            {status === "stopping" ? "停止中..." : "停止"}
          </button>
        </div>
      ) : (
        <div style={{ display:"flex",flexDirection:"column",gap:"0.75rem",maxWidth:"20rem",margin:"0 auto" }}>
          <select
            value={selectedId}
            onChange={e => setSelectedId(e.target.value)}
            disabled={isBusy}
            style={{
              width:"100%",
              padding:"0.7rem 0.875rem",
              background:"rgba(255,255,255,0.03)",
              border:"1px solid rgba(255,255,255,0.08)",
              borderRadius:"2px",
              color:"#dde4ff",
              fontSize:"0.875rem",
              cursor: isBusy ? "wait" : "pointer",
              appearance:"none",
              backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%234a5580' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
              backgroundRepeat:"no-repeat",
              backgroundPosition:"right 0.75rem center",
            }}
          >
            {domains.length === 0 ? (
              <option value="" disabled>先创建一个领域</option>
            ) : (
              domains.map(d => <option key={d.id} value={d.id}>{d.name}</option>)
            )}
          </select>
          <button
            onClick={startTimer}
            disabled={isBusy || !selectedId}
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
              cursor: (isBusy || !selectedId) ? "not-allowed" : "pointer",
              opacity: (isBusy || !selectedId) ? 0.4 : 1,
              textShadow:"0 0 8px rgba(0,229,255,0.5)",
              boxShadow:"0 0 15px rgba(0,229,255,0.08)",
              transition:"all 0.2s",
            }}
          >
            {status === "starting" ? "启动中..." : "开始"}
          </button>
        </div>
      )}

      {status === "syncing" && (
        <p style={{ fontSize: "0.7rem", color: "rgba(74,85,128,0.7)", marginTop: "0.75rem" }}>
          正在同步统计...
        </p>
      )}
      {error && (
        <p style={{ fontSize: "0.75rem", color: "#ff1744", marginTop: "1rem" }}>{error}</p>
      )}
    </div>
  );
}
