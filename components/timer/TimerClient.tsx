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

  // stop timer on tab close
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

  return (
    <div className="bg-white rounded-2xl border p-8 text-center space-y-8">
      <div
        className="text-6xl font-mono font-bold tabular-nums"
        style={{ color: isRunning && activeDomain ? activeDomain.color : "#111827" }}
      >
        {formatTimer(elapsed)}
      </div>

      {isRunning ? (
        <div>
          <p className="text-sm text-gray-500 mb-6">
            正在记录：<strong>{activeDomain?.name}</strong>
          </p>
          <button
            onClick={handleStop}
            disabled={loading}
            className="px-8 py-3 bg-red-500 text-white font-medium rounded-xl hover:bg-red-600 disabled:opacity-50 transition-colors"
          >
            停止
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {domains.length === 0 ? (
              <option disabled>先创建一个领域</option>
            ) : (
              domains.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))
            )}
          </select>
          <button
            onClick={handleStart}
            disabled={loading || !selectedId}
            className="w-full px-8 py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            开始
          </button>
        </div>
      )}
    </div>
  );
}
