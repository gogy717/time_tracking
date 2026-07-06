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
type StartResult = { id: string; domain: TimerDomain } | null;

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
const ACTIVE_TIMER_STORAGE_KEY = "time-tracking:active-timer";

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
  const startRequestRef = useRef<Promise<StartResult> | null>(null);

  useEffect(() => {
    busyRef.current = busy;
  }, [busy]);

  const applyBootstrap = useCallback((payload: TimerBootstrap) => {
    setDomains(payload.domains);
    if (busyRef.current === "idle" && !isLocalSession(activeRef.current)) {
      setActive(payload.activeSession);
    }
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
    const stored = readStoredActive();
    if (stored) {
      activeRef.current = stored;
      setActive(stored);
    }
  }, []);

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
    writeStoredActive(active);
  }, [active]);

  useEffect(() => {
    if (!active) return;
    const tick = window.setInterval(() => setElapsed(secondsSince(activeRef.current?.startTime)), 1000);
    return () => window.clearInterval(tick);
  }, [active]);

  const syncAfterMutation = useCallback(() => {
    window.dispatchEvent(new CustomEvent("timer:changed"));
  }, []);

  const startTimer = useCallback(async () => {
    if (busy !== "idle" || active || !selectedId) return;
    const domain = domains.find((d) => d.id === selectedId);
    if (!domain) return;

    const localSession: TimerSession = {
      id: `__local__:${Date.now()}`,
      startTime: new Date().toISOString(),
      domain,
    };

    setError("");
    activeRef.current = localSession;
    setActive(localSession);

    const startRequest = (async (): Promise<StartResult> => {
      const res = await fetch("/api/timer/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domainId: selectedId, startTime: localSession.startTime }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (data.session?.domain) {
          mergeDomain(setDomains, data.session.domain);
          setActive(data.session);
        } else if (activeRef.current?.id === localSession.id) {
          setActive(null);
        }
        setError(data.error ?? "启动失败，请重试");
        return null;
      }

      const serverSession = data.session ?? {
        id: data.sessionId,
        startTime: data.startTime,
        domain,
      };
      const nextSession = {
        id: serverSession.id,
        startTime: localSession.startTime,
        domain: serverSession.domain ?? domain,
      };
      if (activeRef.current?.id === localSession.id) setActive(nextSession);
      if (nextSession.domain) mergeDomain(setDomains, nextSession.domain);
      syncAfterMutation();
      return { id: nextSession.id, domain: nextSession.domain };
    })().catch(() => {
      setError("服务器暂时没确认，但本地计时仍在继续，停止时会再次同步");
      return null;
    });

    startRequestRef.current = startRequest;
    void startRequest.finally(() => {
      if (startRequestRef.current === startRequest) startRequestRef.current = null;
    });
  }, [active, busy, domains, selectedId, syncAfterMutation]);

  const stopTimer = useCallback(async () => {
    const current = activeRef.current;
    if (busy !== "idle" || !current) return;

    setBusy("stopping");
    setError("");
    activeRef.current = null;
    setActive(null);
    setElapsed(0);

    try {
      const endTime = new Date().toISOString();
      const startResult = isLocalSession(current) && startRequestRef.current
        ? await startRequestRef.current
        : null;
      const sessionId = isLocalSession(current) ? startResult?.id : current.id;
      const res = await fetch("/api/timer/stop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          domainId: current.domain.id,
          startTime: current.startTime,
          endTime,
        }),
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

function isLocalSession(session: TimerSession) {
  return !!session?.id.startsWith("__local__:");
}

function readStoredActive(): TimerSession {
  try {
    const raw = window.localStorage.getItem(ACTIVE_TIMER_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as TimerSession;
    if (!parsed?.id || !parsed.startTime || !parsed.domain?.id) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeStoredActive(session: TimerSession) {
  try {
    if (session) window.localStorage.setItem(ACTIVE_TIMER_STORAGE_KEY, JSON.stringify(session));
    else window.localStorage.removeItem(ACTIVE_TIMER_STORAGE_KEY);
  } catch {
    // Ignore storage failures; the visible timer remains in memory.
  }
}

function mergeDomain(
  setDomains: Dispatch<SetStateAction<TimerDomain[]>>,
  domain: TimerDomain
) {
  setDomains(prev => prev.some(existing => existing.id === domain.id) ? prev : [...prev, domain]);
}
