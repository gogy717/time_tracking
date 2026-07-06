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
  const isSyncing = status === "syncing";
  const glowColor = active ? active.domain.color : "#548373";

  return (
    <div style={{ padding: "0.75rem", borderTop: "1px solid rgba(110,92,70,0.10)" }}>
      {!active && (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <select
            value={selectedId}
            onChange={e => setSelectedId(e.target.value)}
            disabled={isBusy || isSyncing}
            style={{
              width: "100%",
              padding: "0.4rem 0.5rem",
              background: "#fffaf1",
              border: "1px solid rgba(110,92,70,0.16)",
              borderRadius: "12px",
              color: "#7a6c5d",
              fontSize: "0.75rem",
              appearance: "none",
              cursor: (isBusy || isSyncing) ? "wait" : "pointer",
            }}
          >
            {domains.length === 0
              ? <option value="" disabled>{isSyncing ? "同步中..." : "先创建领域"}</option>
              : domains.map(d => <option key={d.id} value={d.id}>{d.name}</option>)
            }
          </select>
          <button
            onClick={startTimer}
            disabled={isBusy || isSyncing || !selectedId || domains.length === 0}
            style={{
              width: "100%",
              padding: "0.45rem",
              background: "#548373",
              border: "1px solid #548373",
              borderRadius: "12px",
              color: "#fffdf8",
              fontSize: "0.75rem",
              fontWeight: 600,
              letterSpacing: 0,
              cursor: (isBusy || isSyncing || !selectedId) ? "not-allowed" : "pointer",
              opacity: (isBusy || isSyncing || !selectedId) ? 0.45 : 1,
              boxShadow: "0 8px 18px rgba(84,131,115,0.18)",
            }}
          >
            {status === "syncing" ? "同步中..." : status === "starting" ? "启动中..." : "▶ 开始计时"}
          </button>
        </div>
      )}

      {active && (
        <div>
          <div style={{ marginBottom: "0.375rem" }}>
            <div style={{ fontSize: "0.68rem", color: "#8f806f", letterSpacing: 0, marginBottom: "0.2rem" }}>
              <span style={{ color: glowColor, marginRight: "0.25rem" }}>●</span>
              {active.domain.name}
            </div>
            <div style={{
              fontSize: "1.4rem",
              fontFamily: "var(--font-geist-mono, monospace)",
              fontWeight: 700,
              color: glowColor,
              letterSpacing: 0,
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
              background: "#fff1ef",
              border: "1px solid rgba(201,95,87,0.25)",
              borderRadius: "12px",
              color: "#c95f57",
              fontSize: "0.75rem",
              fontWeight: 600,
              letterSpacing: 0,
              cursor: isBusy ? "not-allowed" : "pointer",
              opacity: isBusy ? 0.5 : 1,
            }}
          >
            {status === "stopping" ? "停止中..." : "■ 停止"}
          </button>
        </div>
      )}

      {status === "syncing" && (
        <p style={{ marginTop: "0.5rem", fontSize: "0.68rem", color: "#8f806f", lineHeight: 1.4 }}>
          正在同步...
        </p>
      )}
      {error && (
        <p style={{ marginTop: "0.5rem", fontSize: "0.68rem", color: "#c95f57", lineHeight: 1.4 }}>
          {error}
        </p>
      )}
    </div>
  );
}
