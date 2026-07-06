"use client";

import {
  createContext,
  type Dispatch,
  type SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

export type TimerDomain = { id: string; name: string; color: string };
export type TimerSession = { id: string; startTime: string; domain: TimerDomain } | null;
type TimerBootstrap = { domains: TimerDomain[]; activeSession: TimerSession };

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
  children,
}: {
  children: React.ReactNode;
}) {
  const [domains, setDomains] = useState<TimerDomain[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [active, setActive] = useState<TimerSession>(null);
  const [elapsed, setElapsed] = useState(0);
  const [busy, setBusy] = useState<"idle" | "starting" | "stopping">("idle");
  const [syncing, setSyncing] = useState(true);
  const [error, setError] = useState("");
  const activeRef = useRef<TimerSession>(null);
  const busyRef = useRef(busy);

  useEffect(() => {
    busyRef.current = busy;
  }, [busy]);

  const applyBootstrap = useCallback((payload: TimerBootstrap) => {
    setDomains(payload.domains);
    if (busyRef.current === "idle") setActive(payload.activeSession);
    setSelectedId(current => {
      if (payload.activeSession?.domain.id) return payload.activeSession.domain.id;
      if (current && payload.domains.some(domain => domain.id === current)) return current;
      return payload.domains[0]?.id ?? "";
    });
  }, []);

  const loadBootstrap = useCallback(async () => {
    setSyncing(true);
    try {
      const res = await fetch("/api/timer/bootstrap", { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "bootstrap failed");
      applyBootstrap({
        domains: Array.isArray(data.domains) ? data.domains : [],
        activeSession: data.activeSession ?? null,
      });
      setError("");
    } catch {
      setError("同步计时数据失败，请刷新重试");
    } finally {
      setSyncing(false);
    }
  }, [applyBootstrap]);

  useEffect(() => {
    void loadBootstrap();
  }, [loadBootstrap]);

  useEffect(() => {
    const handler = () => void loadBootstrap();
    window.addEventListener("domains:changed", handler);
    return () => window.removeEventListener("domains:changed", handler);
  }, [loadBootstrap]);

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
  }, []);

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
        if (data.session?.domain) mergeDomain(setDomains, data.session.domain);
        setError(data.error ?? "启动失败，请重试");
        return;
      }

      const nextSession = data.session ?? {
        id: data.sessionId,
        startTime: data.startTime,
        domain,
      };
      setActive(nextSession);
      if (nextSession?.domain) mergeDomain(setDomains, nextSession.domain);
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
    status: busy !== "idle" ? busy : syncing ? "syncing" : "idle",
    error,
    startTimer,
    stopTimer,
  }), [active, busy, domains, elapsed, error, selectedId, startTimer, stopTimer, syncing]);

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

function mergeDomain(
  setDomains: Dispatch<SetStateAction<TimerDomain[]>>,
  domain: TimerDomain
) {
  setDomains(prev => prev.some(existing => existing.id === domain.id) ? prev : [...prev, domain]);
}
