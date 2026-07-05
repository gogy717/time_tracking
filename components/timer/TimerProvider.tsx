"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";

export type TimerDomain = { id: string; name: string; color: string };
export type TimerSession = { id: string; startTime: string; domain: TimerDomain } | null;

type TimerContextValue = {
  domains: TimerDomain[];
  selectedId: string;
  setSelectedId: (id: string) => void;
  active: TimerSession;
  elapsed: number;
  status: "idle" | "starting" | "stopping" | "syncing";
  error: string;
  startTimer: () => Promise<void>;
  stopTimer: () => Promise<void>;
};

const TimerContext = createContext<TimerContextValue | null>(null);

export function TimerProvider({
  domains,
  initialActive,
  children,
}: {
  domains: TimerDomain[];
  initialActive: TimerSession;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState(domains[0]?.id ?? "");
  const [active, setActive] = useState<TimerSession>(initialActive);
  const [elapsed, setElapsed] = useState(() => secondsSince(initialActive?.startTime));
  const [busy, setBusy] = useState<"idle" | "starting" | "stopping">("idle");
  const [error, setError] = useState("");
  const [isRefreshing, startRefresh] = useTransition();
  const activeRef = useRef<TimerSession>(initialActive);
  const serverActiveKeyRef = useRef(sessionKey(initialActive));

  useEffect(() => {
    const nextKey = sessionKey(initialActive);
    if (nextKey === serverActiveKeyRef.current) return;
    if (busy !== "idle") return;
    serverActiveKeyRef.current = nextKey;
    setActive(initialActive);
  }, [busy, initialActive]);

  useEffect(() => {
    const hasSelected = selectedId && domains.some((domain) => domain.id === selectedId);
    if (hasSelected) return;
    setSelectedId(active?.domain.id ?? domains[0]?.id ?? "");
  }, [active, domains, selectedId]);

  useEffect(() => {
    activeRef.current = active;
    setElapsed(secondsSince(active?.startTime));
    if (active?.domain?.id) setSelectedId(active.domain.id);
  }, [active]);

  useEffect(() => {
    if (!active) return;
    const tick = window.setInterval(() => setElapsed(secondsSince(activeRef.current?.startTime)), 1000);
    return () => window.clearInterval(tick);
  }, [active]);

  useEffect(() => {
    if (!active) return;
    const handler = () => {
      const id = activeRef.current?.id;
      if (id) navigator.sendBeacon("/api/timer/stop", JSON.stringify({ sessionId: id }));
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [active]);

  const syncAfterMutation = useCallback(() => {
    window.dispatchEvent(new CustomEvent("timer:changed"));
    startRefresh(() => router.refresh());
  }, [router]);

  const startTimer = useCallback(async () => {
    if (busy !== "idle" || active || !selectedId) return;
    const domain = domains.find((d) => d.id === selectedId);
    if (!domain) return;

    const optimistic: TimerSession = {
      id: "__optimistic__",
      startTime: new Date().toISOString(),
      domain,
    };

    setBusy("starting");
    setError("");
    setActive(optimistic);

    try {
      const res = await fetch("/api/timer/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domainId: selectedId }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setActive(data.session ?? null);
        setError(data.error ?? "启动失败，请重试");
        return;
      }

      setActive(data.session ?? {
        id: data.sessionId,
        startTime: data.startTime,
        domain,
      });
      syncAfterMutation();
    } catch {
      setActive(null);
      setError("网络错误，请重试");
    } finally {
      setBusy("idle");
    }
  }, [active, busy, domains, selectedId, syncAfterMutation]);

  const stopTimer = useCallback(async () => {
    const current = activeRef.current;
    if (busy !== "idle" || !current || current.id === "__optimistic__") return;

    setBusy("stopping");
    setError("");
    setActive(null);
    setElapsed(0);

    try {
      const res = await fetch("/api/timer/stop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: current.id }),
      });
      if (!res.ok) throw new Error("stop failed");
      syncAfterMutation();
    } catch {
      setActive(current);
      setError("停止失败，计时仍在继续");
    } finally {
      setBusy("idle");
    }
  }, [busy, syncAfterMutation]);

  const value = useMemo<TimerContextValue>(() => ({
    domains,
    selectedId,
    setSelectedId,
    active,
    elapsed,
    status: busy !== "idle" ? busy : isRefreshing ? "syncing" : "idle",
    error,
    startTimer,
    stopTimer,
  }), [active, busy, domains, elapsed, error, isRefreshing, selectedId, startTimer, stopTimer]);

  return <TimerContext.Provider value={value}>{children}</TimerContext.Provider>;
}

export function useTimer() {
  const value = useContext(TimerContext);
  if (!value) throw new Error("useTimer must be used within TimerProvider");
  return value;
}

function secondsSince(value?: string) {
  if (!value) return 0;
  return Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 1000));
}

function sessionKey(session: TimerSession) {
  return session ? `${session.id}:${session.startTime}` : "none";
}
