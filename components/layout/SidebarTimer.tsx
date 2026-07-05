"use client";

import { formatTimer } from "@/lib/utils";
import { useTimer } from "@/components/timer/TimerProvider";

export default function SidebarTimer() {
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
  const glowColor = active ? active.domain.color : "#00e5ff";

  return (
    <div style={{ padding: "0.75rem 0.75rem 0", borderTop: "1px solid rgba(0,229,255,0.08)" }}>
      {!active && (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <select
            value={selectedId}
            onChange={e => setSelectedId(e.target.value)}
            disabled={isBusy}
            style={{
              width: "100%",
              padding: "0.4rem 0.5rem",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: "2px",
              color: "rgba(180,190,220,0.7)",
              fontSize: "0.75rem",
              appearance: "none",
              cursor: isBusy ? "wait" : "pointer",
            }}
          >
            {domains.length === 0
              ? <option value="" disabled>先创建领域</option>
              : domains.map(d => <option key={d.id} value={d.id}>{d.name}</option>)
            }
          </select>
          <button
            onClick={startTimer}
            disabled={isBusy || !selectedId || domains.length === 0}
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
              cursor: (isBusy || !selectedId) ? "not-allowed" : "pointer",
              opacity: (isBusy || !selectedId) ? 0.45 : 1,
              textShadow: "0 0 6px rgba(0,229,255,0.4)",
            }}
          >
            {status === "starting" ? "启动中..." : "▶ 开始计时"}
          </button>
        </div>
      )}

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
            onClick={stopTimer}
            disabled={isBusy || active.id === "__optimistic__"}
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
              cursor: isBusy ? "not-allowed" : "pointer",
              opacity: isBusy ? 0.5 : 1,
            }}
          >
            {status === "stopping" ? "停止中..." : "■ 停止"}
          </button>
        </div>
      )}

      {status === "syncing" && (
        <p style={{ marginTop: "0.5rem", fontSize: "0.68rem", color: "rgba(74,85,128,0.65)", lineHeight: 1.4 }}>
          正在同步...
        </p>
      )}
      {error && (
        <p style={{ marginTop: "0.5rem", fontSize: "0.68rem", color: "#ff1744", lineHeight: 1.4 }}>
          {error}
        </p>
      )}
    </div>
  );
}
