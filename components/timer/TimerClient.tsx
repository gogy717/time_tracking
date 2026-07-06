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
  const isSyncing = status === "syncing";
  const activeDomain = active?.domain ?? domains.find((d) => d.id === selectedId) ?? null;
  const glowColor = activeDomain?.color ?? "#548373";
  const isRunning = !!active;

  return (
    <div
      style={{
        background: "#fffdf8",
        border: `1px solid ${isRunning ? `${glowColor}45` : "rgba(110,92,70,0.12)"}`,
        borderRadius: "22px",
        padding: "3rem 2rem",
        textAlign: "center",
        boxShadow: isRunning
          ? `0 18px 50px rgba(115,94,64,0.10), 0 0 0 6px ${glowColor}10`
          : "0 18px 50px rgba(115,94,64,0.10)",
        transition: "all 0.4s",
        position: "relative",
      }}
    >
      <div
        style={{
          fontSize: "4.5rem",
          fontFamily: "var(--font-geist-mono, monospace)",
          fontWeight: 700,
          letterSpacing: 0,
          color: glowColor,
          marginBottom: "2rem",
          lineHeight: 1,
          transition: "all 0.4s",
        }}
      >
        {formatTimer(elapsed)}
      </div>

      {isRunning ? (
        <div>
          <div style={{ marginBottom:"1.5rem",fontSize:"0.86rem",letterSpacing: 0,color:"#8f806f" }}>
            <span style={{ color:glowColor }}>● </span>
            正在记录：
            <strong style={{ color:glowColor }}>{activeDomain?.name}</strong>
          </div>
          <button
            onClick={stopTimer}
            disabled={isBusy}
            style={{
              padding:"0.75rem 2.5rem",
              background:"#fff1ef",
              border:"1px solid rgba(201,95,87,0.28)",
              borderRadius:"999px",
              color:"#c95f57",
              fontSize:"0.875rem",
              fontWeight:600,
              letterSpacing: 0,
              cursor: isBusy ? "not-allowed" : "pointer",
              opacity: isBusy ? 0.5 : 1,
              boxShadow:"0 8px 18px rgba(201,95,87,0.10)",
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
            disabled={isBusy || isSyncing}
            style={{
              width:"100%",
              padding:"0.7rem 0.875rem",
              background:"#fffaf1",
              border:"1px solid rgba(110,92,70,0.18)",
              borderRadius:"14px",
              color:"#2f2a24",
              fontSize:"0.875rem",
              cursor: (isBusy || isSyncing) ? "wait" : "pointer",
              appearance:"none",
              backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%237a6c5d' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
              backgroundRepeat:"no-repeat",
              backgroundPosition:"right 0.75rem center",
            }}
          >
            {domains.length === 0 ? (
              <option value="" disabled>{isSyncing ? "同步中..." : "先创建一个领域"}</option>
            ) : (
              domains.map(d => <option key={d.id} value={d.id}>{d.name}</option>)
            )}
          </select>
          <button
            onClick={startTimer}
            disabled={isBusy || isSyncing || !selectedId}
            style={{
              padding:"0.75rem 2rem",
              background:"#548373",
              border:"1px solid #548373",
              borderRadius:"999px",
              color:"#fffdf8",
              fontSize:"0.875rem",
              fontWeight:600,
              letterSpacing: 0,
              cursor: (isBusy || isSyncing || !selectedId) ? "not-allowed" : "pointer",
              opacity: (isBusy || isSyncing || !selectedId) ? 0.4 : 1,
              boxShadow:"0 10px 20px rgba(84,131,115,0.22)",
              transition:"all 0.2s",
            }}
          >
            {status === "syncing" ? "同步中..." : status === "starting" ? "启动中..." : "开始"}
          </button>
        </div>
      )}

      {status === "syncing" && (
        <p style={{ fontSize: "0.7rem", color: "#8f806f", marginTop: "0.75rem" }}>
          正在同步统计...
        </p>
      )}
      {error && (
        <p style={{ fontSize: "0.75rem", color: "#c95f57", marginTop: "1rem" }}>{error}</p>
      )}
    </div>
  );
}
